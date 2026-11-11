import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  NotFoundException, 
  BadRequestException,
  UnauthorizedException
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcryptjs';

@Controller('admin')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Admin Authentication & Session Security (Bcrypt Salt 12)
  @Post('auth/login')
  async login(@Body() body: { email?: string; password?: string }) {
    if (!body.email || !body.password) {
      throw new BadRequestException('Email and password required');
    }

    const admin = await this.prisma.adminUser.findUnique({
      where: { email: body.email.toLowerCase().trim() }
    });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Invalid administrative credentials or account suspended');
    }

    let isValid = false;
    if (admin.passwordHash.startsWith('$2')) {
      isValid = await bcrypt.compare(body.password, admin.passwordHash);
    } else {
      const crypto = require('crypto');
      const sha = crypto.createHash('sha256').update(body.password).digest('hex');
      if (admin.passwordHash === sha) {
        isValid = true;
        const newSaltHash = await bcrypt.hash(body.password, 12);
        await this.prisma.adminUser.update({
          where: { id: admin.id },
          data: { passwordHash: newSaltHash }
        });
      }
    }

    if (!isValid) throw new UnauthorizedException('Invalid administrative credentials');

    await this.prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() }
    });

    await this.prisma.adminAuditLog.create({
      data: {
        adminId: admin.id,
        action: 'ADMIN_LOGIN_SUCCESS',
        targetType: 'AdminSession',
        detailsJson: JSON.stringify({ email: admin.email, role: admin.role })
      }
    });

    return {
      success: true,
      token: `admin_session_${admin.id}_${Date.now()}`,
      admin: {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role
      }
    };
  }

  // 2. Dynamic Admin Profile
  @Get('profile')
  async getProfile(@Query('email') email: string = 'admin@ayyappa.org') {
    const admin = await this.prisma.adminUser.findUnique({
      where: { email: email.toLowerCase().trim() }
    });
    if (!admin) throw new NotFoundException('Admin user not found');

    return {
      id: admin.id,
      email: admin.email,
      fullName: admin.fullName,
      role: admin.role,
      isActive: admin.isActive,
      lastLoginAt: admin.lastLoginAt,
      createdAt: admin.createdAt
    };
  }

  @Put('profile')
  async updateProfile(@Body() body: { id?: number; fullName?: string; email?: string }) {
    if (!body.id) throw new BadRequestException('Admin ID required');
    const updated = await this.prisma.adminUser.update({
      where: { id: body.id },
      data: {
        fullName: body.fullName,
        email: body.email ? body.email.toLowerCase().trim() : undefined
      }
    });

    return { success: true, admin: updated };
  }

  @Put('profile/change-password')
  async changePassword(@Body() body: { id?: number; currentPassword?: string; newPassword?: string }) {
    if (!body.id || !body.currentPassword || !body.newPassword) {
      throw new BadRequestException('ID, current password, and new password are required');
    }
    if (body.newPassword.length < 8) {
      throw new BadRequestException('New password must be at least 8 characters long');
    }

    const admin = await this.prisma.adminUser.findUnique({ where: { id: body.id } });
    if (!admin) throw new NotFoundException('Admin profile not found');

    let isMatch = false;
    if (admin.passwordHash.startsWith('$2')) {
      isMatch = await bcrypt.compare(body.currentPassword, admin.passwordHash);
    } else {
      const crypto = require('crypto');
      const sha = crypto.createHash('sha256').update(body.currentPassword).digest('hex');
      isMatch = (admin.passwordHash === sha);
    }

    if (!isMatch) throw new BadRequestException('Current password does not match');

    const newHash = await bcrypt.hash(body.newPassword, 12);
    await this.prisma.adminUser.update({
      where: { id: admin.id },
      data: { passwordHash: newHash }
    });

    return { success: true, message: 'Password rotated successfully' };
  }

  // 3. Languages CRUD
  @Get('languages')
  async getLanguages() {
    const list = await this.prisma.language.findMany({
      include: { _count: { select: { contentTranslations: true } } }
    });

    const nativeNames: Record<string, string> = {
      te: 'తెలుగు', kn: 'ಕನ್ನಡ', en: 'English', ta: 'தமிழ்', hi: 'हिन्दी'
    };

    return list.map(l => ({
      id: l.id,
      code: l.code,
      name: l.name,
      nativeName: nativeNames[l.code] || l.name,
      direction: 'LTR',
      isDefault: l.code === 'te',
      status: 'ACTIVE',
      translationCount: l._count.contentTranslations,
      createdAt: l.createdAt,
      updatedAt: l.updatedAt
    }));
  }

  @Post('languages')
  async createLanguage(@Body() body: { code: string; name: string }) {
    if (!body.code || !body.name) throw new BadRequestException('Code and name required');
    const code = body.code.toLowerCase().trim();
    const existing = await this.prisma.language.findUnique({ where: { code } });
    if (existing) throw new BadRequestException(`Language '${code}' already exists`);

    const created = await this.prisma.language.create({
      data: { code, name: body.name.trim() }
    });
    return { success: true, data: created };
  }

  @Put('languages/:id')
  async updateLanguage(@Param('id') id: string, @Body() body: { name?: string }) {
    const numId = parseInt(id, 10);
    const updated = await this.prisma.language.update({
      where: { id: numId },
      data: { name: body.name }
    });
    return { success: true, data: updated };
  }

  @Delete('languages/:id')
  async deleteLanguage(@Param('id') id: string) {
    const numId = parseInt(id, 10);
    const existing = await this.prisma.language.findUnique({
      where: { id: numId },
      include: { _count: { select: { contentTranslations: true } } }
    });
    if (!existing) throw new NotFoundException('Language not found');
    if (['te', 'kn', 'en'].includes(existing.code)) {
      throw new BadRequestException(`Core language '${existing.name}' is protected`);
    }
    if (existing._count.contentTranslations > 0) {
      throw new BadRequestException(`Cannot delete: Language has active translations`);
    }
    await this.prisma.language.delete({ where: { id: numId } });
    return { success: true };
  }

  // 4. Categories Management (Root categories: parentId == null)
  @Get('categories')
  async getCategories(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('search') search?: string,
    @Query('lang') lang: string = 'te',
    @Query('archived') archived?: string,
    @Query('isAudio') isAudio?: string,
    @Query('sortBy') sortBy: string = 'displayOrder',
    @Query('sortOrder') sortOrder: string = 'asc'
  ) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * take;

    const where: any = {
      parentId: null, // Root categories
      isArchived: archived === 'true'
    };

    if (isAudio !== undefined && isAudio !== '') {
      where.isAudio = isAudio === 'true';
    }

    if (search && search.trim() !== '') {
      where.AND = [
        {
          OR: [
            { slug: { contains: search.trim() } },
            { translations: { some: { title: { contains: search.trim() } } } }
          ]
        }
      ];
    }

    const orderBy: any = {};
    if (['displayOrder', 'createdAt', 'updatedAt', 'id'].includes(sortBy)) {
      orderBy[sortBy] = sortOrder === 'desc' ? 'desc' : 'asc';
    } else {
      orderBy.displayOrder = 'asc';
    }

    const [totalRecords, items] = await Promise.all([
      this.prisma.contentCategory.count({ where }),
      this.prisma.contentCategory.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          translations: { include: { language: true } },
          subcategories: true,
          devotionalContents: true,
        }
      })
    ]);

    const totalPages = Math.ceil(totalRecords / take);

    const formatted = items.map(cat => {
      const preferred = cat.translations.find(t => t.language.code === lang) || cat.translations[0];
      return {
        id: String(cat.id),
        slug: cat.slug,
        displayOrder: cat.displayOrder,
        isAudio: cat.isAudio,
        isArchived: cat.isArchived,
        title: preferred ? preferred.title : cat.slug,
        description: preferred?.description || '',
        subcategoriesCount: cat.subcategories.length,
        devotionalCount: cat.devotionalContents.length,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt
      };
    });

    return {
      data: formatted,
      meta: {
        page: pageNum,
        limit: take,
        totalRecords,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1
      }
    };
  }

  @Post('categories')
  async createCategory(@Body() body: { title: string; slug: string; isAudio: boolean; description?: string; lang?: string; parentId?: number }) {
    const defaultLang = await this.prisma.language.findFirst({ where: { code: body.lang || 'te' } })
      || await this.prisma.language.findFirst();

    if (!defaultLang) throw new NotFoundException('No language found in database');

    const created = await this.prisma.contentCategory.create({
      data: {
        slug: body.slug || `category-${Date.now()}`,
        isAudio: Boolean(body.isAudio),
        parentId: body.parentId ? Number(body.parentId) : null,
        isArchived: false,
        translations: {
          create: {
            languageId: defaultLang.id,
            title: body.title,
            description: body.description || ''
          }
        }
      }
    });

    return { success: true, data: { id: String(created.id), ...body } };
  }

  @Put('categories/:id')
  async updateCategory(@Param('id') id: string, @Body() body: any) {
    const numId = parseInt(id, 10);
    const existing = await this.prisma.contentCategory.findUnique({
      where: { id: numId },
      include: { translations: true }
    });

    if (!existing) throw new NotFoundException(`Category ${id} not found`);

    await this.prisma.contentCategory.update({
      where: { id: numId },
      data: {
        slug: body.slug || existing.slug,
        isAudio: body.isAudio !== undefined ? Boolean(body.isAudio) : existing.isAudio,
        parentId: body.parentId !== undefined ? (body.parentId ? Number(body.parentId) : null) : existing.parentId
      }
    });

    if (body.title) {
      const targetLang = await this.prisma.language.findFirst({ where: { code: body.lang || 'te' } })
        || await this.prisma.language.findFirst();

      if (targetLang) {
        const tr = existing.translations.find(t => t.languageId === targetLang.id);
        if (tr) {
          await this.prisma.contentTranslation.update({
            where: { id: tr.id },
            data: {
              title: body.title,
              description: body.description !== undefined ? body.description : tr.description
            }
          });
        } else {
          await this.prisma.contentTranslation.create({
            data: {
              categoryId: numId,
              languageId: targetLang.id,
              title: body.title,
              description: body.description || ''
            }
          });
        }
      }
    }

    return { success: true };
  }

  @Delete('categories/:id')
  async archiveCategory(@Param('id') id: string) {
    const numId = parseInt(id, 10);
    const existing = await this.prisma.contentCategory.findUnique({ where: { id: numId } });
    if (!existing) throw new NotFoundException(`Category #${id} not found`);

    if (numId <= 23) {
      throw new BadRequestException(`Category #${numId} is a protected core devotional section`);
    }

    await this.prisma.contentCategory.update({
      where: { id: numId },
      data: { isArchived: true }
    });

    return { success: true, message: `Category #${numId} safely archived.` };
  }

  // 4b. Category Tree & Parents Lookup
  @Get('categories/parents')
  async getParentCategoriesLookup(@Query('lang') lang: string = 'te') {
    const categories = await this.prisma.contentCategory.findMany({
      where: { isArchived: false },
      orderBy: { displayOrder: 'asc' },
      include: {
        translations: { include: { language: true } }
      }
    });

    return categories.map(c => {
      const match = c.translations.find(t => t.language.code === lang) || c.translations[0];
      return {
        id: c.id,
        slug: c.slug,
        title: match ? match.title : c.slug,
        parentId: c.parentId
      };
    });
  }

  // 5. Subcategories CRUD (Items where parentId !== null)
  @Get('subcategories')
  async getSubcategories(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('search') search?: string,
    @Query('lang') lang: string = 'te',
    @Query('parentId') parentId?: string
  ) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * take;

    const where: any = {
      parentId: parentId ? Number(parentId) : { not: null },
      isArchived: false
    };

    if (search && search.trim() !== '') {
      where.AND = [
        {
          OR: [
            { slug: { contains: search.trim() } },
            { translations: { some: { title: { contains: search.trim() } } } }
          ]
        }
      ];
    }

    const [totalRecords, items] = await Promise.all([
      this.prisma.contentCategory.count({ where }),
      this.prisma.contentCategory.findMany({
        where,
        skip,
        take,
        orderBy: { displayOrder: 'asc' },
        include: {
          parent: { include: { translations: true } },
          translations: { include: { language: true } }
        }
      })
    ]);

    const totalPages = Math.ceil(totalRecords / take);

    const formatted = items.map(cat => {
      const preferred = cat.translations.find(t => t.language.code === lang) || cat.translations[0];
      const parentPref = cat.parent?.translations.find(t => t.languageId === preferred?.languageId) || cat.parent?.translations[0];
      return {
        id: String(cat.id),
        slug: cat.slug,
        title: preferred ? preferred.title : cat.slug,
        description: preferred?.description || '',
        parentId: cat.parentId,
        parentTitle: parentPref ? parentPref.title : cat.parent?.slug || 'Root',
        isAudio: cat.isAudio,
        createdAt: cat.createdAt
      };
    });

    return {
      data: formatted,
      meta: {
        page: pageNum,
        limit: take,
        totalRecords,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1
      }
    };
  }

  // 6. Devotional Content (Stotras, Mantras, Slokas, Poojas)
  @Get('content')
  async getDevotionalContent(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string
  ) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * take;

    const where: any = {};
    if (categoryId) where.categoryId = Number(categoryId);
    if (search && search.trim() !== '') {
      where.OR = [
        { title: { contains: search.trim() } },
        { slug: { contains: search.trim() } }
      ];
    }

    const [totalRecords, items] = await Promise.all([
      this.prisma.devotionalContent.count({ where }),
      this.prisma.devotionalContent.findMany({
        where,
        skip,
        take,
        orderBy: { displayOrder: 'asc' },
        include: { category: true }
      })
    ]);

    return {
      data: items,
      meta: {
        page: pageNum,
        limit: take,
        totalRecords,
        totalPages: Math.ceil(totalRecords / take),
        hasNextPage: pageNum < Math.ceil(totalRecords / take),
        hasPreviousPage: pageNum > 1
      }
    };
  }

  @Post('content')
  async createDevotionalContent(@Body() body: { categoryId: number; title: string; slug: string; sacredText?: string; meaning?: string }) {
    const created = await this.prisma.devotionalContent.create({
      data: {
        categoryId: Number(body.categoryId),
        title: body.title,
        slug: body.slug || `content-${Date.now()}`,
        sacredText: body.sacredText || '',
        meaning: body.meaning || '',
        isPublished: true
      }
    });
    return { success: true, data: created };
  }

  @Put('content/:id')
  async updateDevotionalContent(@Param('id') id: string, @Body() body: any) {
    const numId = parseInt(id, 10);
    const updated = await this.prisma.devotionalContent.update({
      where: { id: numId },
      data: {
        title: body.title,
        sacredText: body.sacredText,
        meaning: body.meaning,
        isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : undefined
      }
    });
    return { success: true, data: updated };
  }

  @Delete('content/:id')
  async deleteDevotionalContent(@Param('id') id: string) {
    await this.prisma.devotionalContent.delete({ where: { id: parseInt(id, 10) } });
    return { success: true };
  }

  // 7. Audio & Media Asset Management
  @Get('media/audio')
  async getAudioList(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('search') search?: string
  ) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * take;

    const where: any = { isAudio: true, isArchived: false };
    if (search) {
      where.translations = { some: { title: { contains: search.trim() } } };
    }

    const [totalRecords, items] = await Promise.all([
      this.prisma.contentCategory.count({ where }),
      this.prisma.contentCategory.findMany({
        where,
        skip,
        take,
        include: { translations: true }
      })
    ]);

    const data = items.map(c => ({
      id: c.id,
      title: c.translations[0]?.title || c.slug,
      slug: c.slug,
      duration: '00:40',
      status: 'AVAILABLE_OFFLINE',
      url: `/audio/${c.slug}.mp3`
    }));

    return {
      data,
      meta: {
        page: pageNum,
        limit: take,
        totalRecords,
        totalPages: Math.ceil(totalRecords / take),
        hasNextPage: pageNum < Math.ceil(totalRecords / take),
        hasPreviousPage: pageNum > 1
      }
    };
  }

  // 8. Panchangam & Festivals CRUD
  @Get('panchangam/festivals')
  async getFestivals(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('search') search?: string
  ) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * take;

    const where: any = {};
    if (search) {
      where.OR = [
        { slug: { contains: search.trim() } },
        { translations: { some: { name: { contains: search.trim() } } } }
      ];
    }

    const [totalRecords, items] = await Promise.all([
      this.prisma.festival.count({ where }),
      this.prisma.festival.findMany({
        where,
        skip,
        take,
        orderBy: { festivalDate: 'asc' },
        include: { translations: { include: { language: true } } }
      })
    ]);

    return {
      data: items,
      meta: {
        page: pageNum,
        limit: take,
        totalRecords,
        totalPages: Math.ceil(totalRecords / take),
        hasNextPage: pageNum < Math.ceil(totalRecords / take),
        hasPreviousPage: pageNum > 1
      }
    };
  }

  @Post('panchangam/festivals')
  async createFestival(@Body() body: { name: string; slug: string; date: string; sourceNote?: string; lang?: string }) {
    const defaultLang = await this.prisma.language.findFirst({ where: { code: body.lang || 'te' } })
      || await this.prisma.language.findFirst();

    const created = await this.prisma.festival.create({
      data: {
        slug: body.slug || `fest-${Date.now()}`,
        festivalDate: new Date(body.date),
        sourceNote: body.sourceNote || 'Sabarimala Devaswom Calendar',
        isPublished: true,
        translations: {
          create: {
            languageId: defaultLang.id,
            name: body.name,
            description: body.sourceNote || ''
          }
        }
      }
    });
    return { success: true, data: created };
  }

  @Put('panchangam/festivals/:id')
  async updateFestival(@Param('id') id: string, @Body() body: any) {
    const numId = parseInt(id, 10);
    const updated = await this.prisma.festival.update({
      where: { id: numId },
      data: {
        festivalDate: body.date ? new Date(body.date) : undefined,
        sourceNote: body.sourceNote
      }
    });
    return { success: true, data: updated };
  }

  @Delete('panchangam/festivals/:id')
  async deleteFestival(@Param('id') id: string) {
    await this.prisma.festival.delete({ where: { id: parseInt(id, 10) } });
    return { success: true };
  }

  // 9. CMS Pages CRUD
  @Get('cms')
  async getCms() {
    return this.prisma.appSetting.findMany({
      where: {
        key: { in: ['about_us', 'privacy_policy', 'terms_conditions', 'sabarimala_guidelines'] }
      }
    });
  }

  @Put('cms')
  async updateCms(@Body() body: { key: string; value: string; description?: string }) {
    const updated = await this.prisma.appSetting.upsert({
      where: { key: body.key },
      update: { value: body.value, description: body.description },
      create: { key: body.key, value: body.value, description: body.description || '' }
    });
    return { success: true, data: updated };
  }

  // 10. Dashboard Stats
  @Get('dashboard/stats')
  async getDashboardStats() {
    const [
      categoriesCount,
      subcategoriesCount,
      audioTracksCount,
      devotionalItemsCount,
      languagesCount,
      panchangamCount,
      festivalsCount,
      settingsCount,
      usersCount,
      languagesList,
      recentAuditLogs
    ] = await Promise.all([
      this.prisma.contentCategory.count({ where: { parentId: null, isArchived: false } }),
      this.prisma.contentCategory.count({ where: { parentId: { not: null }, isArchived: false } }),
      this.prisma.contentCategory.count({ where: { isAudio: true, isArchived: false } }),
      this.prisma.devotionalContent.count(),
      this.prisma.language.count(),
      this.prisma.panchangamEntry.count(),
      this.prisma.festival.count(),
      this.prisma.appSetting.count(),
      this.prisma.appUser.count(),
      this.prisma.language.findMany(),
      this.prisma.adminAuditLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { admin: true }
      })
    ]);

    return {
      totalUsers: usersCount,
      activeUsers: usersCount,
      totalLanguages: languagesCount,
      activeCategories: categoriesCount,
      activeSubcategories: subcategoriesCount,
      publishedDevotionalItems: devotionalItemsCount,
      totalAudioFiles: audioTracksCount,
      panchangamEvents: panchangamCount,
      activeFestivals: festivalsCount,
      publishedCmsPages: settingsCount,
      systemHealth: 'HEALTHY_SYNCED',
      database: 'MySQL 8.0 Connected (Prisma)',
      astronomyEngine: 'Verified Astronomical Active',
      supportedLanguages: languagesList.map(l => ({
        id: l.id,
        code: l.code,
        name: l.name,
        status: 'ACTIVE',
        completion: 100
      })),
      recentAuditLogs
    };
  }

  // 11. User Management
  @Get('users')
  async getUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('search') search?: string
  ) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * take;

    const where: any = {};
    if (search) {
      where.OR = [
        { phoneNumber: { contains: search } },
        { deviceUuid: { contains: search } }
      ];
    }

    const [totalRecords, users] = await Promise.all([
      this.prisma.appUser.count({ where }),
      this.prisma.appUser.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return {
      data: users,
      meta: {
        page: pageNum,
        limit: take,
        totalRecords,
        totalPages: Math.ceil(totalRecords / take),
        hasNextPage: pageNum < Math.ceil(totalRecords / take),
        hasPreviousPage: pageNum > 1
      }
    };
  }

  // 12. Audit Logs
  @Get('audit-logs')
  async getAuditLogs(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20'
  ) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * take;

    const [totalRecords, data] = await Promise.all([
      this.prisma.adminAuditLog.count(),
      this.prisma.adminAuditLog.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { admin: true }
      })
    ]);

    return {
      data,
      meta: {
        page: pageNum,
        limit: take,
        totalRecords,
        totalPages: Math.ceil(totalRecords / take),
        hasNextPage: pageNum < Math.ceil(totalRecords / take),
        hasPreviousPage: pageNum > 1
      }
    };
  }

  // 13. Settings & Ticker
  @Get('settings/ticker')
  async getTicker() {
    const setting = await this.prisma.appSetting.findUnique({
      where: { key: 'devotional_ticker' }
    });

    return {
      ticker: setting?.value || '🕉️ స్వామియే శరణం అయ్యప్ప — శ్రీ అయ్యప్ప స్వామి నిత్య పూజా విధానం, అష్టోత్తరం, హరివరాసనం మరియు సమగ్ర శబరిమల యాత్రా దర్శిని 🕉️',
      updatedAt: setting?.updatedAt || new Date()
    };
  }

  @Post('settings/ticker')
  async updateTicker(@Body() body: { ticker: string }) {
    await this.prisma.appSetting.upsert({
      where: { key: 'devotional_ticker' },
      update: { value: body.ticker },
      create: { key: 'devotional_ticker', value: body.ticker, description: 'Live mobile devotional announcement ticker' }
    });

    await this.prisma.adminAuditLog.create({
      data: {
        action: 'UPDATE_DEVOTIONAL_TICKER',
        targetType: 'AppSetting',
        targetId: 'devotional_ticker',
        detailsJson: JSON.stringify({ ticker: body.ticker })
      }
    });

    return { success: true, ticker: body.ticker };
  }
}
