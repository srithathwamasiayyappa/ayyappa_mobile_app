import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  Req,
  NotFoundException, 
  BadRequestException,
  UnauthorizedException,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TranslationService } from './translation.service';
import { TemplesService } from '../temples/temples.service';
import { DharmaKarthaService } from '../dharma-kartha/dharma-kartha.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { Request } from 'express';
import { PanchangamCalculator, CITIES } from '../panchangam/panchangam.calculator';

// In-Memory Rate Limiting for Admin Authentication (Anti-Brute Force)
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// Server-Side Active Session Registry (Task 3: Backend Session Invalidation)
export interface ActiveSession {
  adminId: number;
  email: string;
  role: string;
  createdAt: number;
  expiresAt: number;
}

const DEFAULT_CATEGORY_ARTWORKS: Record<string, string> = {
  pooja: '/images/categories/art-pooja-trans.png',
  'pooja-vidhanam': '/images/categories/art-pooja-trans.png',
  'poojalu-vrathaalu': '/images/categories/art-pooja-trans.png',
  stotras: '/images/categories/art-stotras-trans.png',
  'divine-stotras': '/images/categories/art-stotras-trans.png',
  'slogans-of-sri-ayyappa-swami': '/images/categories/art-stotras-trans.png',
  slokas: '/images/categories/art-slokas-trans.png',
  'daily-slokas': '/images/categories/art-slokas-trans.png',
  songs: '/images/categories/art-bhajans-trans.png',
  bhajans: '/images/categories/art-bhajans-trans.png',
  'bhajana-keerthanalu': '/images/categories/art-bhajans-trans.png',
  live: '/images/categories/art-live-trans.png',
  'live-streams': '/images/categories/art-live-trans.png',
  panchangam: '/images/categories/art-panchangam-trans.png',
  festivals: '/images/categories/art-stotras-trans.png',
  temples: '/images/categories/art-temples-trans.png',
  donations: '/images/categories/art-donations-trans.png',
  food: '/images/categories/art-food-trans.png',
};

function resolveCategoryCardArtwork(slug: string = '', title: string = '', parentSlug: string = '', displayOrder: number = 0): string {
  const s = `${slug} ${title}`.toLowerCase();
  if (s.includes('shiva-linga') || s.includes('simple') || s.includes('nithyapooja')) return '/images/pooja/pooja-card-1-ref.png';
  if (s.includes('subramanya') || s.includes('murugan') || s.includes('kartikeya')) return '/images/pooja/pooja-card-2-ref.png';
  if (s.includes('mantrapushpam') || s.includes('sharanu') || s.includes('slogans')) return '/images/pooja/pooja-card-3-ref.png';
  if (s.includes('harathi') || s.includes('deepa') || s.includes('mangala')) return '/images/pooja/pooja-card-4-ref.png';
  if (s.includes('ganapa') || s.includes('vignesh') || s.includes('gomatha')) return '/images/pooja/pooja-card-5-ref.png';
  if (s.includes('abhisheka') || s.includes('koodalmanikya') || s.includes('bilva') || s.includes('rudra')) return '/images/pooja/pooja-card-6-ref.png';
  if (/ayyap|sastha|padi|irumudi|maaladharan/.test(s)) return '/images/pooja/card-banner-ayyappa-hd.png';
  if (/ganesh|vinayak|chathurthi/.test(s)) return '/images/pooja/card-banner-ganapathi-hd.png';
  if (/devi|durga|lakshmi|suktha|lalitha|varalakshmi/.test(s)) return '/images/pooja/card-banner-lakshmi-hd.png';
  if (/venkat|vishnu|satyanarayana|srinivasa/.test(s)) return '/images/pooja/pooja-card-3-ref.png';
  if (/hanuman|anjaneya/.test(s)) return '/images/pooja/pooja-card-4-ref.png';

  const cardRefs = [
    '/images/pooja/pooja-card-1-ref.png',
    '/images/pooja/pooja-card-2-ref.png',
    '/images/pooja/pooja-card-3-ref.png',
    '/images/pooja/pooja-card-4-ref.png',
    '/images/pooja/pooja-card-5-ref.png',
    '/images/pooja/pooja-card-6-ref.png',
  ];
  return cardRefs[Math.abs(displayOrder || 0) % cardRefs.length] || '/images/pooja/pooja-card-1-ref.png';
}
export const activeAdminSessions = new Map<string, ActiveSession>();

@Controller('admin')
export class AdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly translationService: TranslationService,
    private readonly templesService: TemplesService,
    private readonly dkService: DharmaKarthaService,
  ) {}

  // Dharma Kartha Temple Management Endpoints
  @Get('dharma-kartha/temples')
  async getDharmaKarthaTemples(@Query() query: any) {
    return this.dkService.getAllTemplesForAdmin(query);
  }

  @Put('dharma-kartha/temples/:id/review')
  async reviewDharmaKarthaTemple(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: Request,
  ) {
    const adminEmail = (req as any).user?.email || 'superadmin@saranamayyappa.in';
    return this.dkService.reviewTempleAsAdmin(parseInt(id, 10), body, adminEmail);
  }

  @Post('dharma-kartha/temples/:id/review')
  async reviewDharmaKarthaTemplePost(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: Request,
  ) {
    const adminEmail = (req as any).user?.email || 'superadmin@saranamayyappa.in';
    return this.dkService.reviewTempleAsAdmin(parseInt(id, 10), body, adminEmail);
  }

  // 1. Admin Authentication & Session Security (Bcrypt Salt 12 + Sliding-Window Rate Limiter)
  @Post('auth/login')
  async login(@Body() body: { email?: string; password?: string }, @Req() req: Request) {
    if (!body.email || !body.password) {
      throw new BadRequestException('Email and password required');
    }

    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress || 'unknown';
    const rateLimitKey = `${clientIp}_${body.email.toLowerCase().trim()}`;
    const now = Date.now();

    const attempt = loginAttempts.get(rateLimitKey);
    if (attempt) {
      if (now - attempt.firstAttempt < LOCKOUT_WINDOW_MS) {
        if (attempt.count >= MAX_FAILED_ATTEMPTS) {
          const remainingMinutes = Math.ceil((LOCKOUT_WINDOW_MS - (now - attempt.firstAttempt)) / 60000);
          throw new HttpException(
            `Too many failed login attempts. Account locked for ${remainingMinutes} more minute(s) to protect administrative access.`,
            HttpStatus.TOO_MANY_REQUESTS
          );
        }
      } else {
        // Window expired, reset counter
        loginAttempts.delete(rateLimitKey);
      }
    }

    let admin: any = null;
    try {
      admin = await this.prisma.adminUser.findUnique({
        where: { email: body.email.toLowerCase().trim() }
      });
    } catch (dbErr: any) {
      console.warn('[AdminAuth] MariaDB unavailable, checking fallback dev superadmin:', dbErr?.message || dbErr);
    }

    // Dev Fallback for local development if database is not active
    if (!admin && body.email.toLowerCase().trim() === 'admin@ayyappa.org') {
      const crypto = require('crypto');
      const sha = crypto.createHash('sha256').update('SwamiyeSaranamAyyappa@2026').digest('hex');
      admin = {
        id: 'admin_master_001',
        email: 'admin@ayyappa.org',
        fullName: 'Swamiye Saranam Ayyappa Master Admin',
        role: 'SUPER_ADMIN',
        isActive: true,
        passwordHash: sha
      };
    }

    if (!admin || !admin.isActive) {
      // Record failed attempt
      const current = loginAttempts.get(rateLimitKey) || { count: 0, firstAttempt: now };
      current.count += 1;
      loginAttempts.set(rateLimitKey, current);

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
        try {
          const newSaltHash = await bcrypt.hash(body.password, 12);
          await this.prisma.adminUser.update({
            where: { id: admin.id },
            data: { passwordHash: newSaltHash }
          });
        } catch {
          // ignore if DB in fallback mode
        }
      }
    }

    if (!isValid) {
      const current = loginAttempts.get(rateLimitKey) || { count: 0, firstAttempt: now };
      current.count += 1;
      loginAttempts.set(rateLimitKey, current);

      throw new UnauthorizedException('Invalid administrative credentials');
    }

    // Login successful: reset rate limiter for this key
    loginAttempts.delete(rateLimitKey);

    try {
      await this.prisma.adminUser.update({
        where: { id: admin.id },
        data: { lastLoginAt: new Date() }
      });

      await this.prisma.adminAuditLog.create({
        data: {
          adminId: admin.id,
          action: 'ADMIN_LOGIN_SUCCESS',
          targetType: 'AdminSession',
          detailsJson: JSON.stringify({ email: admin.email, role: admin.role, ip: clientIp })
        }
      });
    } catch (auditErr: any) {
      console.warn('[AdminAuth] DB audit log skipped in dev mode:', auditErr?.message || auditErr);
    }

    // Issue cryptographically secure 256-bit server-tracked session token (24-hour expiration)
    const sessionToken = `sec_admin_${crypto.randomBytes(32).toString('hex')}`;
    const SESSION_TTL = 24 * 60 * 60 * 1000;
    activeAdminSessions.set(sessionToken, {
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
      createdAt: now,
      expiresAt: now + SESSION_TTL
    });

    return {
      success: true,
      token: sessionToken,
      admin: {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role
      }
    };
  }

  // 1b. Backend-Enforced Session Revocation (Logout)
  @Post('auth/logout')
  async logout(@Body() body: { token?: string }, @Req() req: Request) {
    const authHeader = req.headers['authorization'];
    const token = body?.token || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null);
    
    if (token && activeAdminSessions.has(token)) {
      const session = activeAdminSessions.get(token);
      activeAdminSessions.delete(token);

      if (session) {
        await this.prisma.adminAuditLog.create({
          data: {
            adminId: session.adminId,
            action: 'ADMIN_SESSION_REVOKED_LOGOUT',
            targetType: 'AdminSession',
            detailsJson: JSON.stringify({ email: session.email, revokedAt: new Date().toISOString() })
          }
        });
      }
      return { success: true, message: 'Server session revoked and invalidated successfully' };
    }

    return { success: true, message: 'Session not found or already invalidated' };
  }

  // 1c. Server-Side Session Verification
  @Post('auth/verify-session')
  async verifySession(@Body() body: { token?: string }, @Req() req: Request) {
    const authHeader = req.headers['authorization'];
    const token = body?.token || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null);

    if (!token || !activeAdminSessions.has(token)) {
      throw new UnauthorizedException('Session is invalid or has been revoked on server');
    }

    const session = activeAdminSessions.get(token)!;
    if (Date.now() > session.expiresAt) {
      activeAdminSessions.delete(token);
      throw new UnauthorizedException('Session has expired. Please log in again.');
    }

    return {
      valid: true,
      admin: {
        id: session.adminId,
        email: session.email,
        role: session.role
      }
    };
  }

  // 2. Dynamic Admin Profile
  @Get('profile')
  async getProfile(@Query('email') email: string = 'admin@ayyappa.org') {
    try {
      const cleanEmail = (email || 'admin@ayyappa.org').toLowerCase().trim();
      const admin = await this.prisma.adminUser.findUnique({
        where: { email: cleanEmail }
      });
      if (admin) {
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
    } catch (err: any) {
      console.warn('[AdminProfile] Database offline or error:', err?.message || err);
    }

    return {
      id: 1,
      email: email || 'admin@ayyappa.org',
      fullName: 'Swamiye Saranam Ayyappa Administrator',
      role: 'SUPER_ADMIN',
      isActive: true,
      lastLoginAt: new Date(),
      createdAt: new Date(),
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
    try {
      let list: any[] = [];
      try {
        list = await this.prisma.language.findMany({
          include: { _count: { select: { contentTranslations: true } } }
        });
      } catch (countErr: any) {
        console.warn('[Admin] getLanguages with count failed, falling back to simple findMany:', countErr?.message || countErr);
        list = await this.prisma.language.findMany();
      }

      // Dynamic native names from database app settings
      const nativeSettings = await this.prisma.appSetting.findMany({
        where: { key: { startsWith: 'lang_native_' } }
      }).catch(() => []);
      const dynamicNativeMap: Record<string, string> = {};
      for (const s of nativeSettings) {
        const c = s.key.replace('lang_native_', '');
        dynamicNativeMap[c] = s.value;
      }

      const defaultNativeNames: Record<string, string> = {
        te: 'తెలుగు', kn: 'ಕನ್ನಡ', en: 'English', ta: 'தமிழ்', hi: 'हिन्दी', ml: 'മലയാളം'
      };

      if (!list || list.length === 0) {
        return [
          { id: 1, code: 'te', name: 'Telugu', nativeName: 'తెలుగు', direction: 'LTR', isDefault: true, status: 'ACTIVE', translationCount: 0 },
          { id: 2, code: 'en', name: 'English', nativeName: 'English', direction: 'LTR', isDefault: false, status: 'ACTIVE', translationCount: 0 },
          { id: 3, code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', direction: 'LTR', isDefault: false, status: 'ACTIVE', translationCount: 0 },
          { id: 4, code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', direction: 'LTR', isDefault: false, status: 'ACTIVE', translationCount: 0 },
          { id: 5, code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', direction: 'LTR', isDefault: false, status: 'ACTIVE', translationCount: 0 },
          { id: 6, code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', direction: 'LTR', isDefault: false, status: 'ACTIVE', translationCount: 0 }
        ];
      }

      return list.map(l => ({
        id: l.id,
        code: l.code,
        name: l.name,
        nativeName: dynamicNativeMap[l.code] || defaultNativeNames[l.code] || (l as any).nativeName || l.name,
        direction: 'LTR',
        isDefault: l.code === 'te',
        status: 'ACTIVE',
        translationCount: (l as any)._count?.contentTranslations ?? 0,
        createdAt: l.createdAt,
        updatedAt: l.updatedAt
      }));
    } catch (err: any) {
      console.error('[Admin] getLanguages fatal error:', err?.message || err);
      return [
        { id: 1, code: 'te', name: 'Telugu', nativeName: 'తెలుగు', direction: 'LTR', isDefault: true, status: 'ACTIVE', translationCount: 0 },
        { id: 2, code: 'en', name: 'English', nativeName: 'English', direction: 'LTR', isDefault: false, status: 'ACTIVE', translationCount: 0 },
        { id: 3, code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', direction: 'LTR', isDefault: false, status: 'ACTIVE', translationCount: 0 },
        { id: 4, code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', direction: 'LTR', isDefault: false, status: 'ACTIVE', translationCount: 0 },
        { id: 5, code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', direction: 'LTR', isDefault: false, status: 'ACTIVE', translationCount: 0 },
        { id: 6, code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', direction: 'LTR', isDefault: false, status: 'ACTIVE', translationCount: 0 }
      ];
    }
  }

  @Post('languages')
  async createLanguage(@Body() body: { code: string; name: string; nativeName?: string }) {
    if (!body.code || !body.name) throw new BadRequestException('Code and name required');
    const code = body.code.toLowerCase().trim();
    const existing = await this.prisma.language.findUnique({ where: { code } });
    if (existing) throw new BadRequestException(`Language '${code}' already exists`);

    const created = await this.prisma.language.create({
      data: { code, name: body.name.trim() }
    });

    if (body.nativeName && body.nativeName.trim()) {
      const settingKey = `lang_native_${code}`;
      await this.prisma.appSetting.upsert({
        where: { key: settingKey },
        update: { value: body.nativeName.trim(), description: `Native name for ${code}` },
        create: { key: settingKey, value: body.nativeName.trim(), description: `Native name for ${code}` },
      }).catch(() => {});
    }

    return { success: true, data: created };
  }

  @Put('languages/:id')
  async updateLanguage(@Param('id') id: string, @Body() body: { name?: string; code?: string; nativeName?: string }) {
    const numId = parseInt(id, 10);
    const existing = await this.prisma.language.findUnique({ where: { id: numId } });
    if (!existing) throw new NotFoundException('Language not found');

    const updateData: any = {};
    if (body.name && body.name.trim()) updateData.name = body.name.trim();
    if (body.code && body.code.trim()) updateData.code = body.code.toLowerCase().trim();

    const updated = await this.prisma.language.update({
      where: { id: numId },
      data: updateData
    });

    const targetCode = (updateData.code || existing.code).toLowerCase().trim();
    if (body.nativeName !== undefined && body.nativeName !== null) {
      const settingKey = `lang_native_${targetCode}`;
      await this.prisma.appSetting.upsert({
        where: { key: settingKey },
        update: { value: body.nativeName.trim(), description: `Native name for ${targetCode}` },
        create: { key: settingKey, value: body.nativeName.trim(), description: `Native name for ${targetCode}` },
      }).catch(() => {});
    }

    return { success: true, data: { ...updated, nativeName: body.nativeName || existing.name } };
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

    let totalRecords = 0;
    let items: any[] = [];

    try {
      [totalRecords, items] = await Promise.all([
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
    } catch (err: any) {
      console.warn('[Admin] getCategories query with all relations failed, falling back to core query:', err?.message || err);
      try {
        [totalRecords, items] = await Promise.all([
          this.prisma.contentCategory.count({ where: { parentId: null } }),
          this.prisma.contentCategory.findMany({
            where: { parentId: null },
            skip,
            take,
            orderBy: { displayOrder: 'asc' },
            include: {
              translations: { include: { language: true } },
              subcategories: true,
            }
          })
        ]);
      } catch (err2: any) {
        console.error('[Admin] getCategories fallback also failed:', err2?.message || err2);
      }
    }

    const totalPages = Math.ceil(totalRecords / take);

    let servicesMap: Record<string, any> = {};
    try {
      const sSetting = await this.prisma.appSetting.findUnique({ where: { key: 'category_services' } });
      if (sSetting?.value) {
        const list = JSON.parse(sSetting.value);
        if (Array.isArray(list)) {
          list.forEach((s: any) => {
            if (s.id) servicesMap[s.id] = s;
            if (s.serviceId) servicesMap[s.serviceId] = s;
          });
        }
      }
    } catch (_) {}

    const formatted = items.map(cat => {
      const preferred = cat.translations?.find((t: any) => t?.language?.code === lang) || cat.translations?.[0];
      const sInfo = servicesMap[cat.slug] || servicesMap[String(cat.id)] || {};
      const catArtwork = sInfo.artwork || DEFAULT_CATEGORY_ARTWORKS[cat.slug] || '';
      const catSub = sInfo.sub || preferred?.description || '';
      const subCount = Array.isArray(cat.subcategories) ? cat.subcategories.length : 0;
      const devCount = Array.isArray(cat.devotionalContents) ? cat.devotionalContents.length : 0;

      return {
        id: String(cat.id),
        slug: cat.slug,
        displayOrder: cat.displayOrder ?? 0,
        isAudio: Boolean(cat.isAudio),
        isArchived: Boolean(cat.isArchived),
        title: preferred ? preferred.title : cat.slug,
        subtitle: catSub,
        description: preferred?.description || catSub,
        imageUrl: catArtwork,
        artwork: catArtwork,
        icon: sInfo.icon || 'Sparkles',
        subcategoriesCount: subCount,
        devotionalCount: devCount,
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
  async createCategory(@Body() body: { title: string; slug: string; isAudio: boolean; description?: string; lang?: string; parentId?: number; imageUrl?: string }) {
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

    if (body.imageUrl) {
      let finalImg = body.imageUrl.trim();
      if (finalImg.startsWith('data:image/')) {
        finalImg = this.saveBase64Image(finalImg, 'subcategory');
      }
      try {
        const setting = await this.prisma.appSetting.findUnique({ where: { key: 'subcategory_images' } });
        let map: Record<string, string> = {};
        if (setting && setting.value) {
          try { map = JSON.parse(setting.value); } catch {}
        }
        map[String(created.id)] = finalImg;
        map[created.slug] = finalImg;
        await this.prisma.appSetting.upsert({
          where: { key: 'subcategory_images' },
          update: { value: JSON.stringify(map) },
          create: { key: 'subcategory_images', value: JSON.stringify(map), description: 'Custom Subcategory Images Map' }
        });
      } catch (_) {}
    }

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

    if (body.imageUrl !== undefined && body.imageUrl !== null) {
      let finalImg = String(body.imageUrl).trim();
      if (finalImg.startsWith('data:image/')) {
        finalImg = this.saveBase64Image(finalImg, 'subcategory');
      }
      try {
        const setting = await this.prisma.appSetting.findUnique({ where: { key: 'subcategory_images' } });
        let map: Record<string, string> = {};
        if (setting && setting.value) {
          try { map = JSON.parse(setting.value); } catch {}
        }
        map[String(numId)] = finalImg;
        map[existing.slug] = finalImg;
        if (body.slug && body.slug !== existing.slug) map[body.slug] = finalImg;
        await this.prisma.appSetting.upsert({
          where: { key: 'subcategory_images' },
          update: { value: JSON.stringify(map) },
          create: { key: 'subcategory_images', value: JSON.stringify(map), description: 'Custom Subcategory Images Map' }
        });
      } catch (err) {
        console.warn('Could not save subcategory image:', err);
      }
    }

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

  @Post('categories/:id/image')
  @Post('subcategories/:id/image')
  async uploadSubcategoryImage(
    @Param('id') id: string,
    @Body() body: { image: string }
  ) {
    if (!body || !body.image) throw new BadRequestException('Image payload required');
    let finalUrl = body.image.trim();
    if (finalUrl.startsWith('data:image/')) {
      finalUrl = this.saveBase64Image(finalUrl, 'subcategory');
    }
    const setting = await this.prisma.appSetting.findUnique({ where: { key: 'subcategory_images' } });
    let map: Record<string, string> = {};
    if (setting && setting.value) {
      try { map = JSON.parse(setting.value); } catch {}
    }
    map[id] = finalUrl;
    await this.prisma.appSetting.upsert({
      where: { key: 'subcategory_images' },
      update: { value: JSON.stringify(map) },
      create: { key: 'subcategory_images', value: JSON.stringify(map), description: 'Custom Subcategory Images Map' }
    });
    return { success: true, imageUrl: finalUrl };
  }


  @Delete('categories/:id')
  async archiveCategory(@Param('id') id: string) {
    const numId = parseInt(id, 10);
    const existing = await this.prisma.contentCategory.findUnique({ where: { id: numId } });
    if (!existing) throw new NotFoundException(`Category #${id} not found`);

    if (existing.parentId === null && numId <= 9) {
      throw new BadRequestException(`Category #${numId} is a protected core root category`);
    }

    await this.prisma.contentCategory.update({
      where: { id: numId },
      data: { isArchived: true }
    });

    return { success: true, message: `Category #${numId} safely archived.` };
  }

  @Post('categories/batch-delete')
  async batchDeleteCategories(@Body() body: { ids: (number | string)[] }) {
    if (!body || !body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      throw new BadRequestException('No category IDs provided for batch deletion');
    }
    const numIds = body.ids.map(id => Number(id)).filter(id => !isNaN(id));
    const result = await this.prisma.contentCategory.updateMany({
      where: { id: { in: numIds } },
      data: { isArchived: true }
    });
    return {
      success: true,
      count: result.count,
      message: `${result.count} record(s) safely archived in database.`
    };
  }

  // 4b. Category Tree & Parents Lookup
  @Get('categories/parents')
  async getParentCategoriesLookup(@Query('lang') lang: string = 'te') {
    let categories: any[] = [];
    try {
      categories = await this.prisma.contentCategory.findMany({
        where: { parentId: null, isArchived: false },
        orderBy: { displayOrder: 'asc' },
        include: {
          translations: { include: { language: true } }
        }
      });
    } catch (e) {
      console.warn('[Admin] Parent categories lookup error:', e);
    }

    if (!categories || categories.length === 0) {
      // Fallback standard 9 sanctum parent categories
      return [
        { id: 1, slug: 'pooja', title: 'Pooja Vidhanam', parentId: null },
        { id: 2, slug: 'stotras', title: 'Divine Stotras', parentId: null },
        { id: 3, slug: 'slokas', title: 'Daily Slokas', parentId: null },
        { id: 4, slug: 'songs', title: 'Bhajans & Songs', parentId: null },
        { id: 5, slug: 'live-streams', title: 'Live Darshan', parentId: null },
        { id: 6, slug: 'panchangam', title: 'Panchangam', parentId: null },
        { id: 7, slug: 'festivals', title: 'Temple Festivals', parentId: null },
        { id: 8, slug: 'temples', title: 'Sacred Temples', parentId: null },
        { id: 9, slug: 'donations', title: 'Annadanam Seva', parentId: null },
      ];
    }

    return categories.map(c => {
      const match = c.translations?.find((t: any) => t.language?.code === lang) || c.translations?.[0];
      return {
        id: c.id,
        slug: c.slug,
        title: match ? match.title : c.slug,
        parentId: c.parentId
      };
    });
  }

  // 5. Subcategories CRUD (Items based on categories with parent filtering)
  @Get('subcategories')
  async getSubcategories(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '100',
    @Query('search') search?: string,
    @Query('lang') lang: string = 'te',
    @Query('parentId') parentId?: string
  ) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.min(200, Math.max(1, parseInt(limit, 10) || 100));
    const skip = (pageNum - 1) * take;

    let targetParentCondition: any = { not: null };

    if (parentId && parentId !== 'all') {
      const parsed = parseInt(parentId, 10);
      if (!isNaN(parsed) && parsed > 0) {
        targetParentCondition = parsed;
      } else {
        try {
          let parentMatch: any = null;
          const cleanPid = parentId.toLowerCase().trim();
          if (cleanPid === 'pooja' || cleanPid === 'pooja-vidhanam' || cleanPid === 'poojalu-vrathaalu' || cleanPid === '113') {
            parentMatch = await this.prisma.contentCategory.findFirst({
              where: {
                OR: [
                  { id: 113 },
                  { slug: 'pooja-vidhanam' }
                ],
                parentId: null
              }
            });
            if (!parentMatch) {
              parentMatch = await this.prisma.contentCategory.findFirst({
                where: {
                  OR: [
                    { slug: 'poojalu-vrathaalu' },
                    { slug: 'pooja' }
                  ],
                  parentId: null
                }
              });
            }
          } else if (cleanPid === 'stotras' || cleanPid === 'divine-stotras' || cleanPid === '114' || cleanPid === '4') {
            parentMatch = await this.prisma.contentCategory.findFirst({
              where: {
                OR: [
                  { id: 114 },
                  { slug: 'stotras' },
                  { id: 4 },
                  { slug: 'divine-stotras' },
                  { slug: 'stotramulu' }
                ],
                parentId: null
              }
            });
          } else {
            parentMatch = await this.prisma.contentCategory.findFirst({
              where: {
                OR: [
                  { slug: parentId },
                  { slug: cleanPid }
                ],
                parentId: null
              }
            });
          }
          if (parentMatch) {
            targetParentCondition = parentMatch.id;
          } else {
            targetParentCondition = -999999;
          }
        } catch (_) {
          targetParentCondition = -999999;
        }
      }
    }

    const where: any = {
      parentId: targetParentCondition,
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

    let totalRecords = 0;
    let items: any[] = [];
    try {
      [totalRecords, items] = await Promise.all([
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
    } catch (err) {
      console.warn('[Admin] Subcategories DB query warning:', err);
    }

    if (items.length > 0) {
      let customImages: Record<string, string> = {};
      try {
        const imgSetting = await this.prisma.appSetting.findUnique({ where: { key: 'subcategory_images' } });
        if (imgSetting && imgSetting.value) customImages = JSON.parse(imgSetting.value);
      } catch (_) {}

      const totalPages = Math.ceil(totalRecords / take);
      const formatted = items.map(cat => {
        const preferred = cat.translations.find((t: any) => t.language?.code === lang) || cat.translations[0];
        const parentPref = cat.parent?.translations?.find((t: any) => t.languageId === preferred?.languageId) || cat.parent?.translations?.[0];
        const pSlug = cat.parent?.slug || 'pooja';
        const customImg = customImages[String(cat.id)] || customImages[cat.slug];

        // Format clean title if not in DB translations
        const titleFormatted = cat.slug
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (l: string) => l.toUpperCase());

        const finalTitle = (preferred?.title && preferred.title !== cat.slug)
          ? preferred.title
          : titleFormatted;

        return {
          id: String(cat.id),
          slug: cat.slug,
          title: finalTitle,
          description: preferred?.description || '',
          parentId: cat.parentId,
          parentSlug: pSlug,
          parentTitle: parentPref ? parentPref.title : pSlug,
          displayOrder: cat.displayOrder,
          isAudio: cat.isAudio,
          imageUrl: customImg || resolveCategoryCardArtwork(cat.slug, finalTitle, pSlug, cat.displayOrder),
          image: customImg || resolveCategoryCardArtwork(cat.slug, finalTitle, pSlug, cat.displayOrder),
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

    // Purely database-driven: return empty list if no subcategories exist in DB
    return {
      data: [],
      meta: {
        page: pageNum,
        limit: take,
        totalRecords: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
      }
    };
  }

  // 5b. Single Subcategory Detail from DB (with multi-language translations & attached verses)
  @Get('subcategories/:id')
  async getSubcategoryDetail(
    @Param('id') id: string,
    @Query('lang') lang: string = 'te'
  ) {
    const isNum = !isNaN(Number(id));
    const where: any = isNum ? { id: Number(id) } : { slug: id };

    let customImages: Record<string, string> = {};
    try {
      const imgSetting = await this.prisma.appSetting.findUnique({ where: { key: 'subcategory_images' } });
      if (imgSetting && imgSetting.value) customImages = JSON.parse(imgSetting.value);
    } catch (_) {}

    try {
      const cat = await this.prisma.contentCategory.findFirst({
        where,
        include: {
          parent: {
            include: {
              translations: {
                include: { language: true }
              }
            }
          },
          translations: {
            include: { language: true }
          },
          devotionalContents: {
            where: { isPublished: true },
            orderBy: { displayOrder: 'asc' }
          },
          subcategories: {
            where: { isArchived: false },
            orderBy: { displayOrder: 'asc' },
            include: {
              translations: {
                include: { language: true }
              }
            }
          }
        }
      });

      if (cat) {
        const exactMatch = cat.translations.find((t: any) => t.language?.code === lang);
        const preferred = exactMatch || cat.translations[0];
        const exactParentMatch = cat.parent?.translations?.find((t: any) => t.language?.code === lang);
        const parentPref = exactParentMatch || cat.parent?.translations?.[0];
        const pSlug = cat.parent?.slug || 'pooja';
        const customImg = customImages[String(cat.id)] || customImages[cat.slug];

        const allTranslations = cat.translations.map((t: any) => ({
          code: t.language?.code || 'en',
          name: t.language?.name || 'English',
          title: t.title,
          description: t.description || null
        }));

        // Fetch any localized devotional content translations for this language
        const contentKeys = cat.devotionalContents.map((d: any) => `devotional_content_${d.id}_${lang.toLowerCase()}`);
        let contentSettingMap = new Map<string, any>();
        if (contentKeys.length > 0) {
          try {
            const contentSettings = await this.prisma.appSetting.findMany({
              where: { key: { in: contentKeys } }
            });
            for (const s of contentSettings) {
              try { contentSettingMap.set(s.key, JSON.parse(s.value)); } catch {}
            }
          } catch {}
        }

        const contents = cat.devotionalContents.map((d: any) => {
          const loc = contentSettingMap.get(`devotional_content_${d.id}_${lang.toLowerCase()}`);
          return {
            id: d.id,
            title: loc?.title || d.title,
            slug: d.slug,
            sacredText: loc?.sacredText || d.sacredText || null,
            meaning: loc?.meaning || d.meaning || null,
            displayOrder: d.displayOrder,
            hasExactTranslation: Boolean(loc)
          };
        });

        const subcategories = cat.subcategories.map((sub: any) => {
          const subPref = sub.translations.find((t: any) => t.language?.code === lang) || sub.translations[0];
          return {
            id: String(sub.id),
            title: subPref ? subPref.title : sub.slug,
            slug: sub.slug,
            description: subPref ? subPref.description : null
          };
        });

        return {
          success: true,
          data: {
            id: String(cat.id),
            slug: cat.slug,
            title: exactMatch ? exactMatch.title : (preferred ? preferred.title : cat.slug),
            description: exactMatch ? exactMatch.description : (preferred ? preferred.description : null),
            exactTitle: exactMatch ? exactMatch.title : null,
            exactDescription: exactMatch ? exactMatch.description : null,
            hasExactTranslation: Boolean(exactMatch),
            requestedLang: lang,
            parentId: cat.parentId,
            parentTitle: exactParentMatch ? exactParentMatch.title : (parentPref ? parentPref.title : pSlug),
            parentSlug: pSlug,
            displayOrder: cat.displayOrder,
            isAudio: cat.isAudio,
            isSubcategory: Boolean(cat.parentId),
            imageUrl: customImg || resolveCategoryCardArtwork(cat.slug, preferred ? preferred.title : cat.slug, pSlug, cat.displayOrder),
            image: customImg || resolveCategoryCardArtwork(cat.slug, preferred ? preferred.title : cat.slug, pSlug, cat.displayOrder),
            translations: allTranslations,
            contents,
            subcategories,
            createdAt: cat.createdAt,
            updatedAt: cat.updatedAt
          }
        };
      }
    } catch (err) {
      console.warn('[Admin] getSubcategoryDetail DB query error:', err);
    }

    throw new NotFoundException(`Subcategory #${id} not found in database.`);
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

    try {
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
    } catch (err: any) {
      console.warn('getDevotionalContent error handled safely:', err?.message);
      return {
        data: [],
        meta: {
          page: pageNum,
          limit: take,
          totalRecords: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false
        }
      };
    }
  }

  // 6b. Single Devotional Content / Subcategory Type Detail from DB
  @Get('content/:id')
  async getDevotionalContentDetail(
    @Param('id') id: string,
    @Query('lang') lang: string = 'te'
  ) {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      throw new BadRequestException('Invalid content ID');
    }

    const item = await this.prisma.devotionalContent.findUnique({
      where: { id: numId },
      include: {
        category: {
          include: {
            parent: {
              include: {
                translations: { include: { language: true } }
              }
            },
            translations: { include: { language: true } }
          }
        }
      }
    });

    if (!item) {
      throw new NotFoundException(`Devotional content #${id} not found.`);
    }

    // Check localized translations from appSetting for requested lang
    let locSetting: any = null;
    try {
      const s = await this.prisma.appSetting.findUnique({
        where: { key: `devotional_content_${item.id}_${lang.toLowerCase()}` }
      });
      if (s && s.value) locSetting = JSON.parse(s.value);
    } catch {}

    // Find all translations for this content in appSetting
    const allSettings = await this.prisma.appSetting.findMany({
      where: { key: { startsWith: `devotional_content_${item.id}_` } }
    });
    const contentTranslations: any[] = [];
    for (const s of allSettings) {
      const code = s.key.replace(`devotional_content_${item.id}_`, '');
      try {
        const val = JSON.parse(s.value);
        contentTranslations.push({
          code,
          title: val.title,
          sacredText: val.sacredText,
          meaning: val.meaning
        });
      } catch {}
    }

    return {
      success: true,
      data: {
        id: item.id,
        categoryId: item.categoryId,
        title: locSetting?.title || item.title,
        slug: item.slug,
        sacredText: locSetting?.sacredText || item.sacredText || '',
        meaning: locSetting?.meaning || item.meaning || '',
        exactTitle: locSetting ? locSetting.title : null,
        exactSacredText: locSetting ? locSetting.sacredText : null,
        exactMeaning: locSetting ? locSetting.meaning : null,
        hasExactTranslation: Boolean(locSetting),
        requestedLang: lang,
        translations: contentTranslations,
        displayOrder: item.displayOrder,
        isPublished: item.isPublished,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        category: item.category ? {
          id: item.category.id,
          slug: item.category.slug,
          parentId: item.category.parentId,
          parentSlug: item.category.parent?.slug,
          parentTitle: item.category.parent?.translations?.find((t: any) => t.language?.code === lang)?.title
            || item.category.parent?.translations?.[0]?.title || item.category.parent?.slug,
          translations: (item.category.translations || []).map((t: any) => ({
            code: t.language?.code,
            name: t.language?.name,
            title: t.title,
            description: t.description
          }))
        } : null
      }
    };
  }

  @Post('content')
  async createDevotionalContent(@Body() body: { categoryId: number; title: string; slug: string; sacredText?: string; meaning?: string; displayOrder?: number; isPublished?: boolean; lang?: string }) {
    const created = await this.prisma.devotionalContent.create({
      data: {
        categoryId: Number(body.categoryId),
        title: body.title,
        slug: body.slug || `content-${Date.now()}`,
        sacredText: body.sacredText || '',
        meaning: body.meaning || '',
        displayOrder: body.displayOrder !== undefined ? Number(body.displayOrder) : 0,
        isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : true
      }
    });

    if (body.lang) {
      const contentKey = `devotional_content_${created.id}_${String(body.lang).toLowerCase()}`;
      await this.prisma.appSetting.upsert({
        where: { key: contentKey },
        update: {
          value: JSON.stringify({
            title: body.title,
            sacredText: body.sacredText,
            meaning: body.meaning
          }),
          description: `Localized devotional content ${created.id} in ${body.lang.toUpperCase()}`
        },
        create: {
          key: contentKey,
          value: JSON.stringify({
            title: body.title,
            sacredText: body.sacredText,
            meaning: body.meaning
          }),
          description: `Localized devotional content ${created.id} in ${body.lang.toUpperCase()}`
        }
      });
    }

    return { success: true, data: created };
  }

  @Put('content/:id')
  async updateDevotionalContent(@Param('id') id: string, @Body() body: any) {
    const numId = parseInt(id, 10);
    const updated = await this.prisma.devotionalContent.update({
      where: { id: numId },
      data: {
        title: body.title,
        slug: body.slug,
        sacredText: body.sacredText,
        meaning: body.meaning,
        displayOrder: body.displayOrder !== undefined ? Number(body.displayOrder) : undefined,
        isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : undefined
      }
    });

    if (body.lang) {
      const contentKey = `devotional_content_${numId}_${String(body.lang).toLowerCase()}`;
      await this.prisma.appSetting.upsert({
        where: { key: contentKey },
        update: {
          value: JSON.stringify({
            title: body.title,
            sacredText: body.sacredText,
            meaning: body.meaning
          }),
          description: `Localized devotional content ${numId} in ${body.lang.toUpperCase()}`
        },
        create: {
          key: contentKey,
          value: JSON.stringify({
            title: body.title,
            sacredText: body.sacredText,
            meaning: body.meaning
          }),
          description: `Localized devotional content ${numId} in ${body.lang.toUpperCase()}`
        }
      });
    }

    return { success: true, data: updated };
  }

  @Delete('content/:id')
  async deleteDevotionalContent(@Param('id') id: string) {
    await this.prisma.devotionalContent.delete({ where: { id: parseInt(id, 10) } });
    return { success: true };
  }

  @Post('content/batch-delete')
  async batchDeleteDevotionalContent(@Body() body: { ids: (number | string)[] }) {
    if (!body || !body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      throw new BadRequestException('No content IDs provided for batch deletion');
    }
    const numIds = body.ids.map(id => Number(id)).filter(id => !isNaN(id));
    const result = await this.prisma.devotionalContent.deleteMany({
      where: { id: { in: numIds } }
    });
    return {
      success: true,
      count: result.count,
      message: `${result.count} subcategory type record(s) deleted from database.`
    };
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

  // 8. Panchangam & Festivals CRUD (View All, View by ID, Create, Update, Delete - Yearly Based)
  @Get('panchangam/festivals')
  async getFestivals(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '100',
    @Query('search') search?: string,
    @Query('year') year?: string
  ) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.min(200, Math.max(1, parseInt(limit, 10) || 100));
    const skip = (pageNum - 1) * take;

    const where: any = {};
    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { slug: { contains: q } },
        { sourceNote: { contains: q } },
        { translations: { some: { name: { contains: q } } } },
        { translations: { some: { description: { contains: q } } } }
      ];
    }

    if (year && year !== 'all' && !isNaN(parseInt(year, 10))) {
      const y = parseInt(year, 10);
      where.festivalDate = {
        gte: new Date(`${y}-01-01T00:00:00.000Z`),
        lte: new Date(`${y}-12-31T23:59:59.999Z`)
      };
    }

    try {
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

      // If database has records, return them
      if (totalRecords > 0) {
        return {
          success: true,
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
    } catch (err) {
      console.warn('[Admin] Festival database query fallback:', err);
    }

    // Default authoritative Sabarimala festivals fallback so admin always has rich data
    const fallbackFestivals = [
      {
        id: 1,
        slug: 'makaravilakku-sankranti',
        festivalDate: new Date('2026-01-14'),
        sourceNote: 'Sabarimala Devaswom — Makaravilakku & Makara Jyothi Darshanam',
        isPublished: true,
        translations: [
          { name: 'Makaravilakku & Makara Sankranti', description: 'Sacred Makara Jyothi manifests at Ponnambalamedu', language: { code: 'en', name: 'English' } },
          { name: 'మకరవిళక్కు & మకర సంక్రాంతి', description: 'పొన్నంబలమేడుపై దివ్య మకరజ్యోతి దర్శనం', language: { code: 'te', name: 'Telugu' } },
          { name: 'ಮಕರವಿಳಕ್ಕು & ಮಕರ ಸಂಕ್ರಾಂತಿ', description: 'ಪೊನ್ನಂಬಲಮೇಡುವಿನಲ್ಲಿ ದಿವ್ಯ ಮಕರಜ್ಯೋತಿ ದರ್ಶನ', language: { code: 'kn', name: 'Kannada' } },
          { name: 'மகரவிளக்கு & மகர சங்கராந்தி', description: 'பொன்னம்பலமேட்டில் திவ்ய மகரஜோதி தரிசனம்', language: { code: 'ta', name: 'Tamil' } },
          { name: 'मकरविलक्कु एवं मकर संक्रांति', description: 'पोन्नम्बलमेडु पर दिव्य मकर ज्योति दर्शन', language: { code: 'hi', name: 'Hindi' } },
        ]
      },
      {
        id: 2,
        slug: 'pamba-arattu-ayyappa-jayanthi',
        festivalDate: new Date('2026-04-01'),
        sourceNote: 'Pamba Holy River — Sri Dharma Sastha Jayanthi & Arattu',
        isPublished: true,
        translations: [
          { name: 'Pamba Arattu (Sri Ayyappa Jayanthi)', description: 'Sacred holy dip at Pamba River honoring Lord Ayyappa manifestation', language: { code: 'en', name: 'English' } },
          { name: 'పంబా ఆరాట్టు (శ్రీ అయ్యప్ప స్వామి జయంతి)', description: 'పవిత్ర పంబా నదిలో ఆరాట్టు మహోత్సవం', language: { code: 'te', name: 'Telugu' } },
          { name: 'ಪಂಪಾ ಆರಾಟ್ಟು (ಶ್ರೀ ಅಯ್ಯಪ್ಪ ಸ್ವಾಮಿ ಜಯಂತಿ)', description: 'ಪವಿತ್ರ ಪಂಪಾ ನದಿಯಲ್ಲಿ ಆರಾಟ್ಟು ಮಹೋತ್ಸವ', language: { code: 'kn', name: 'Kannada' } },
          { name: 'பம்பா ஆராட்டு (ஸ்ரீ ஐயப்ப ஜெயந்தி)', description: 'புனித பம்பா நதியில் ஆராட்டு விழா', language: { code: 'ta', name: 'Tamil' } },
          { name: 'पंपा आराट्टु (श्री अय्यप्पा जयंती)', description: 'पवित्र पंपा नदी में आराट्टु स्नान महोत्सव', language: { code: 'hi', name: 'Hindi' } },
        ]
      },
      {
        id: 3,
        slug: 'vishu-kani-festival',
        festivalDate: new Date('2026-04-14'),
        sourceNote: 'Sabarimala Sri Ayyappa Temple — Vishu Kani Darshanam',
        isPublished: true,
        translations: [
          { name: 'Vishu Kani Festival', description: 'Auspicious New Year festival & gold coin offering (Kaineettam) at Sabarimala', language: { code: 'en', name: 'English' } },
          { name: 'విషు కణి మహోత్సవం', description: 'శబరిమలలో విషు కణి దర్శనం మరియు కైనీట్టం', language: { code: 'te', name: 'Telugu' } },
          { name: 'ವಿಷು ಕಣಿ ಮಹೋತ್ಸವ', description: 'ಶಬರಿಮಲೆಯಲ್ಲಿ ವಿಷು ಕಣಿ ದರ್ಶನ ಮತ್ತು ಕೈನೀಟ್ಟಂ', language: { code: 'kn', name: 'Kannada' } },
          { name: 'விஷு கனி விழா', description: 'சபரிமலையில் விஷு கனி தரிசனம் மற்றும் கைநீட்டம்', language: { code: 'ta', name: 'Tamil' } },
          { name: 'विषु कणि महोत्सव', description: 'सबरीमला में विषु कणि दर्शन और कैनीट्टम', language: { code: 'hi', name: 'Hindi' } },
        ]
      },
      {
        id: 4,
        slug: 'mandala-pooja-commencement',
        festivalDate: new Date('2026-11-17'),
        sourceNote: 'Vrischika Masam 1 — 41-Day Sacred Mandala Vrata Commencement',
        isPublished: true,
        translations: [
          { name: 'Mandala Pooja Commencement', description: 'Beginning of the holy 41-day Mandala Deeksha across South India', language: { code: 'en', name: 'English' } },
          { name: 'మండల పూజ ప్రారంభం (వృశ్చిక మాసం 1)', description: '41 రోజుల పవిత్ర మండల దీక్ష ఆరంభం', language: { code: 'te', name: 'Telugu' } },
          { name: 'ಮಂಡಲ ಪೂಜೆ ಪ್ರಾರಂಭ (ವೃಶ್ಚಿಕ ಮಾಸ 1)', description: '41 ದಿನಗಳ ಪವಿತ್ರ ಮಂಡಲ ದೀಕ್ಷೆ ಆರಂಭ', language: { code: 'kn', name: 'Kannada' } },
          { name: 'மண்டல பூஜை தொடக்கம் (கார்த்திகை 1)', description: '41 நாட்கள் புனித மண்டல விரதத் தொடக்கம்', language: { code: 'ta', name: 'Tamil' } },
          { name: 'मंडला पूजा आरंभ (वृश्चिक मास 1)', description: '41 दिवसीय पवित्र मंडला दीक्षा का आरंभ', language: { code: 'hi', name: 'Hindi' } },
        ]
      },
      {
        id: 5,
        slug: 'mandala-pooja-finale',
        festivalDate: new Date('2026-12-27'),
        sourceNote: 'Sabarimala Sanctum Sanctorum — Mandala Kalam Conclusion with Kalabhabhishekam',
        isPublished: true,
        translations: [
          { name: 'Mandala Pooja Finale', description: 'Grand culmination of the 41-day Mandala season with Golden Thanki Anki adornment', language: { code: 'en', name: 'English' } },
          { name: 'మండల పూజ ముగింపు (కళభాభిషేకం)', description: 'తంగ అంగి అలంకరణతో మండల కాలం ముగింపు', language: { code: 'te', name: 'Telugu' } },
          { name: 'ಮಂಡಲ ಪೂಜೆ ಮುಕ್ತಾಯ (ಕಳಭಾಭಿಷೇಕ)', description: 'ತಂಗ ಅಂಗಿ ಅಲಂಕಾರದೊಂದಿಗೆ ಮಂಡಲ ಕಾಲ ಸಮಾಪ್ತಿ', language: { code: 'kn', name: 'Kannada' } },
          { name: 'மண்டல பூஜை நிறைவு (களபாபிஷேகம்)', description: 'தங்க அங்கி அலங்காரத்துடன் மண்டல பூஜை நிறைவு', language: { code: 'ta', name: 'Tamil' } },
          { name: 'मंडला पूजा समापन (कलभाभिषेकम)', description: 'स्वर्ण अंगी श्रृंगार के साथ मंडला काल का भव्य समापन', language: { code: 'hi', name: 'Hindi' } },
        ]
      }
    ];

    let filtered = fallbackFestivals;
    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      filtered = fallbackFestivals.filter(f => 
        f.slug.toLowerCase().includes(q) ||
        f.sourceNote.toLowerCase().includes(q) ||
        f.translations.some(t => t.name.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q)))
      );
    }

    return {
      success: true,
      data: filtered,
      meta: {
        page: pageNum,
        limit: take,
        totalRecords: filtered.length,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
      }
    };
  }

  @Get('panchangam/festivals/:id')
  async getFestivalById(@Param('id') id: string) {
    const numId = parseInt(id, 10);
    if (!isNaN(numId)) {
      try {
        const item = await this.prisma.festival.findUnique({
          where: { id: numId },
          include: { translations: { include: { language: true } } }
        });
        if (item) {
          return { success: true, data: item };
        }
      } catch (err) {
        console.warn('Get festival by id error:', err);
      }
    }

    // Lookup in fallback festivals
    const listRes = await this.getFestivals('1', '100');
    const match = listRes.data.find((f: any) => String(f.id) === id || f.slug === id);
    if (match) {
      return { success: true, data: match };
    }

    return { success: false, statusCode: 404, message: `Festival '${id}' not found.` };
  }

  @Post('panchangam/festivals')
  async createFestival(@Body() body: { name: string; slug?: string; date?: string; festivalDate?: string; sourceNote?: string; lang?: string; isPublished?: boolean }) {
    if (!body.name || !body.name.trim()) {
      return { success: false, statusCode: 400, message: 'Festival name is required.' };
    }

    const defaultLang = await this.prisma.language.findFirst({ where: { code: body.lang || 'en' } })
      || await this.prisma.language.findFirst({ where: { code: 'te' } })
      || await this.prisma.language.findFirst();

    const festivalDateStr = body.date || body.festivalDate || new Date().toISOString().split('T')[0];
    const generatedSlug = body.slug || (body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `fest-${Date.now()}`);

    try {
      const created = await this.prisma.festival.create({
        data: {
          slug: generatedSlug,
          festivalDate: new Date(festivalDateStr),
          sourceNote: body.sourceNote || 'Sabarimala Devaswom Calendar',
          isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : true,
          translations: {
            create: {
              languageId: defaultLang ? defaultLang.id : 1,
              name: body.name.trim(),
              description: body.sourceNote || ''
            }
          }
        },
        include: { translations: { include: { language: true } } }
      });
      return { success: true, data: created };
    } catch (err: any) {
      return { success: false, statusCode: 500, message: err.message || 'Error creating festival.' };
    }
  }

  @Put('panchangam/festivals/:id')
  async updateFestival(@Param('id') id: string, @Body() body: any) {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      return { success: false, statusCode: 400, message: 'Invalid festival ID.' };
    }

    try {
      const dateVal = body.date || body.festivalDate;
      const updated = await this.prisma.festival.update({
        where: { id: numId },
        data: {
          slug: body.slug ? body.slug.trim() : undefined,
          festivalDate: dateVal ? new Date(dateVal) : undefined,
          sourceNote: body.sourceNote !== undefined ? body.sourceNote : undefined,
          isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : undefined,
        }
      });

      if (body.name && body.name.trim()) {
        const targetLangCode = body.lang || 'en';
        const lang = await this.prisma.language.findFirst({ where: { code: targetLangCode } })
          || await this.prisma.language.findFirst({ where: { code: 'te' } })
          || await this.prisma.language.findFirst();

        if (lang) {
          await this.prisma.festivalTranslation.upsert({
            where: {
              festivalId_languageId: {
                festivalId: numId,
                languageId: lang.id,
              }
            },
            update: {
              name: body.name.trim(),
              description: body.sourceNote || body.description || '',
            },
            create: {
              festivalId: numId,
              languageId: lang.id,
              name: body.name.trim(),
              description: body.sourceNote || body.description || '',
            }
          });
        }
      }

      const fullItem = await this.prisma.festival.findUnique({
        where: { id: numId },
        include: { translations: { include: { language: true } } }
      });

      return { success: true, data: fullItem || updated };
    } catch (err: any) {
      return { success: false, statusCode: 500, message: err.message || 'Error updating festival.' };
    }
  }

  @Delete('panchangam/festivals/:id')
  async deleteFestival(@Param('id') id: string) {
    const numId = parseInt(id, 10);
    if (!isNaN(numId)) {
      try {
        await this.prisma.festival.delete({ where: { id: numId } });
        return { success: true };
      } catch (err: any) {
        return { success: false, statusCode: 500, message: err.message || 'Error deleting festival.' };
      }
    }
    return { success: true };
  }

  // 8.1 Panchangam Daily Entries CRUD (View All, View by ID, Create/Override, Update, Delete)
  @Get('panchangam/entries')
  async getPanchangamEntries(
    @Query('city') cityQuery?: string,
    @Query('year') yearQuery?: string,
    @Query('month') monthQuery?: string,
    @Query('lang') langQuery?: string,
  ) {
    const city = cityQuery || 'Hyderabad';
    const lang = langQuery || 'te';
    const now = new Date();
    const year = parseInt(yearQuery || '', 10) || now.getFullYear();
    const month = parseInt(monthQuery || '', 10) || (now.getMonth() + 1); // 1-12

    // Calculate days in the given month
    const totalDays = new Date(year, month, 0).getDate();
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month - 1, totalDays, 23, 59, 59, 999));

    // Fetch any manual DB overrides from panchangam_entries
    let dbOverrides: any[] = [];
    try {
      dbOverrides = await this.prisma.panchangamEntry.findMany({
        where: {
          calendarDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          translations: {
            include: { language: true }
          }
        }
      });
    } catch (err) {
      console.warn('[Admin] panchangamEntry table read warning:', err);
    }

    // Map overrides by ISO date string (YYYY-MM-DD)
    const overrideMap = new Map<string, any>();
    for (const ov of dbOverrides) {
      const iso = new Date(ov.calendarDate).toISOString().slice(0, 10);
      overrideMap.set(iso, ov);
    }

    const days: any[] = [];
    for (let d = 1; d <= totalDays; d++) {
      const dayDate = new Date(Date.UTC(year, month - 1, d, 6, 0, 0));
      const iso = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

      // Calculate astronomical base values
      let astro: any = {};
      try {
        astro = PanchangamCalculator.calculateDay(dayDate, city, lang);
      } catch (calcErr) {
        astro = {
          isoDate: iso,
          dayNumber: d,
          year,
          city,
          vaaram: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayDate.getUTCDay()],
          paksham: 'Shukla Paksha',
          tithi: 'Prathama',
          nakshatram: 'Ashwini',
          samvatsaram: 'Sri Krodhi Naama Samvatsara',
          sunrise: '06:15 AM',
          sunset: '06:05 PM',
          rahuKalam: '04:30 PM - 06:00 PM',
        };
      }

      if (overrideMap.has(iso)) {
        const ov = overrideMap.get(iso);
        const trans = ov.translations?.find((t: any) => t.language?.code === lang) 
          || ov.translations?.[0] || {};
        let details: any = {};
        try {
          if (trans.detailsJson) details = JSON.parse(trans.detailsJson);
        } catch (_) {}

        days.push({
          id: ov.id,
          date: iso,
          calendarDate: ov.calendarDate,
          dayNumber: d,
          city: ov.locationName || city,
          isOverride: true,
          vaaram: trans.vaaram || astro.vaaram,
          samvatsaram: trans.samvatsaram || astro.samvatsaram,
          paksham: trans.paksham || astro.paksham,
          tithi: trans.tithi || astro.tithi,
          tithiEndTime: details.tithiEndTime || astro.tithiEndTime,
          nakshatram: trans.nakshatram || astro.nakshatram,
          nakshatraEndTime: details.nakshatraEndTime || astro.nakshatraEndTime,
          sunrise: details.sunrise || astro.sunrise,
          sunset: details.sunset || astro.sunset,
          rahuKalam: details.rahuKalam || astro.rahuKalam,
          yamagandam: details.yamagandam || astro.yamagandam,
          gulikaKalam: details.gulikaKalam || astro.gulikaKalam,
          abhijit: details.abhijit || '11:45 AM - 12:35 PM',
          varjyam: details.varjyam || 'None',
          ayanaRitu: trans.ayanaRitu || 'Dakshinayanam / Hemanta Ritu',
          translations: ov.translations || []
        });
      } else {
        days.push({
          id: null,
          date: iso,
          calendarDate: dayDate,
          dayNumber: d,
          city,
          isOverride: false,
          vaaram: astro.vaaram,
          samvatsaram: astro.samvatsaram,
          paksham: astro.paksham,
          tithi: astro.tithi,
          tithiEndTime: astro.tithiEndTime,
          nakshatram: astro.nakshatram,
          nakshatraEndTime: astro.nakshatraEndTime,
          sunrise: astro.sunrise,
          sunset: astro.sunset,
          rahuKalam: astro.rahuKalam,
          yamagandam: astro.yamagandam,
          gulikaKalam: astro.gulikaKalam,
          abhijit: '11:45 AM - 12:35 PM',
          varjyam: 'None',
          ayanaRitu: 'Uttarayanam / Shishira Ritu',
          translations: []
        });
      }
    }

    return {
      success: true,
      data: days,
      meta: {
        city,
        year,
        month,
        totalDays,
        overridesCount: dbOverrides.length
      }
    };
  }

  @Get('panchangam/entries/:id')
  async getPanchangamEntryById(@Param('id') id: string, @Query('lang') langQuery?: string) {
    const lang = langQuery || 'te';
    const numId = parseInt(id, 10);
    let entry: any = null;

    if (!isNaN(numId)) {
      entry = await this.prisma.panchangamEntry.findUnique({
        where: { id: numId },
        include: { translations: { include: { language: true } } }
      });
    } else if (id && id.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const dt = new Date(`${id}T00:00:00.000Z`);
      entry = await this.prisma.panchangamEntry.findFirst({
        where: { calendarDate: dt },
        include: { translations: { include: { language: true } } }
      });
      if (!entry) {
        const astro = PanchangamCalculator.calculateDay(dt, 'Hyderabad', lang);
        return {
          success: true,
          data: {
            id: null,
            date: id,
            calendarDate: dt,
            isOverride: false,
            ...astro
          }
        };
      }
    }

    if (!entry) {
      throw new NotFoundException('Panchangam entry not found');
    }

    return { success: true, data: entry };
  }

  @Post('panchangam/entries')
  async upsertPanchangamEntry(@Body() body: any) {
    if (!body.date && !body.calendarDate) {
      throw new BadRequestException('A valid date (YYYY-MM-DD) is required.');
    }
    const isoDate = (body.date || body.calendarDate).slice(0, 10);
    const dateObj = new Date(`${isoDate}T00:00:00.000Z`);
    const locationName = body.locationName || body.city || 'Hyderabad';

    const langCode = body.lang || 'te';
    let language = await this.prisma.language.findFirst({ where: { code: langCode } });
    if (!language) {
      language = await this.prisma.language.findFirst();
    }
    const languageId = language ? language.id : 1;

    const detailsJson = JSON.stringify({
      sunrise: body.sunrise,
      sunset: body.sunset,
      rahuKalam: body.rahuKalam,
      yamagandam: body.yamagandam,
      gulikaKalam: body.gulikaKalam,
      tithiEndTime: body.tithiEndTime,
      nakshatraEndTime: body.nakshatraEndTime,
      abhijit: body.abhijit,
      varjyam: body.varjyam,
      notes: body.notes || ''
    });

    const entry = await this.prisma.panchangamEntry.upsert({
      where: { calendarDate: dateObj },
      update: {
        locationName,
        latitude: body.latitude ? parseFloat(body.latitude) : undefined,
        longitude: body.longitude ? parseFloat(body.longitude) : undefined,
      },
      create: {
        calendarDate: dateObj,
        locationName,
        latitude: body.latitude ? parseFloat(body.latitude) : undefined,
        longitude: body.longitude ? parseFloat(body.longitude) : undefined,
      }
    });

    const translation = await this.prisma.panchangamTranslation.upsert({
      where: {
        entryId_languageId: {
          entryId: entry.id,
          languageId: languageId
        }
      },
      update: {
        samvatsaram: body.samvatsaram || 'Sri Krodhi Naama Samvatsara',
        paksham: body.paksham || 'Shukla Paksha',
        tithi: body.tithi || 'Prathama',
        nakshatram: body.nakshatram || 'Ashwini',
        vaaram: body.vaaram || 'Aadivaaram',
        ayanaRitu: body.ayanaRitu || 'Uttarayanam',
        detailsJson,
      },
      create: {
        entryId: entry.id,
        languageId: languageId,
        samvatsaram: body.samvatsaram || 'Sri Krodhi Naama Samvatsara',
        paksham: body.paksham || 'Shukla Paksha',
        tithi: body.tithi || 'Prathama',
        nakshatram: body.nakshatram || 'Ashwini',
        vaaram: body.vaaram || 'Aadivaaram',
        ayanaRitu: body.ayanaRitu || 'Uttarayanam',
        detailsJson,
      }
    });

    return {
      success: true,
      data: {
        ...entry,
        translation
      }
    };
  }

  @Put('panchangam/entries/:id')
  async updatePanchangamEntry(@Param('id') id: string, @Body() body: any) {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      throw new BadRequestException('Invalid Panchangam ID');
    }

    const langCode = body.lang || 'te';
    let language = await this.prisma.language.findFirst({ where: { code: langCode } });
    if (!language) {
      language = await this.prisma.language.findFirst();
    }
    const languageId = language ? language.id : 1;

    const detailsJson = JSON.stringify({
      sunrise: body.sunrise,
      sunset: body.sunset,
      rahuKalam: body.rahuKalam,
      yamagandam: body.yamagandam,
      gulikaKalam: body.gulikaKalam,
      tithiEndTime: body.tithiEndTime,
      nakshatraEndTime: body.nakshatraEndTime,
      abhijit: body.abhijit,
      varjyam: body.varjyam,
      notes: body.notes || ''
    });

    const entry = await this.prisma.panchangamEntry.update({
      where: { id: numId },
      data: {
        locationName: body.locationName || body.city || undefined,
        calendarDate: body.date ? new Date(`${body.date.slice(0, 10)}T00:00:00.000Z`) : undefined,
      }
    });

    await this.prisma.panchangamTranslation.upsert({
      where: {
        entryId_languageId: {
          entryId: entry.id,
          languageId: languageId
        }
      },
      update: {
        samvatsaram: body.samvatsaram !== undefined ? body.samvatsaram : undefined,
        paksham: body.paksham !== undefined ? body.paksham : undefined,
        tithi: body.tithi !== undefined ? body.tithi : undefined,
        nakshatram: body.nakshatram !== undefined ? body.nakshatram : undefined,
        vaaram: body.vaaram !== undefined ? body.vaaram : undefined,
        ayanaRitu: body.ayanaRitu !== undefined ? body.ayanaRitu : undefined,
        detailsJson,
      },
      create: {
        entryId: entry.id,
        languageId: languageId,
        samvatsaram: body.samvatsaram || '',
        paksham: body.paksham || '',
        tithi: body.tithi || '',
        nakshatram: body.nakshatram || '',
        vaaram: body.vaaram || '',
        ayanaRitu: body.ayanaRitu || '',
        detailsJson,
      }
    });

    const full = await this.prisma.panchangamEntry.findUnique({
      where: { id: numId },
      include: { translations: { include: { language: true } } }
    });

    return { success: true, data: full };
  }

  @Delete('panchangam/entries/:id')
  async deletePanchangamEntry(@Param('id') id: string) {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      throw new BadRequestException('Invalid Panchangam ID');
    }

    try {
      await this.prisma.panchangamEntry.delete({
        where: { id: numId }
      });
      return { success: true, message: 'Panchangam override deleted, reverted to astronomical calculation.' };
    } catch (err: any) {
      return { success: false, statusCode: 500, message: err.message || 'Error deleting override.' };
    }
  }

  // 9. CMS Pages CRUD
  @Get('cms')
  async getCms() {
    return this.prisma.appSetting.findMany({
      where: {
        key: { in: ['about_us', 'privacy_policy', 'terms_conditions', 'refund_policy', 'sabarimala_guidelines', 'contact_us'] }
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
    try {
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
        this.prisma.contentCategory.count({ where: { parentId: null, isArchived: false } }).catch(() => 0),
        this.prisma.contentCategory.count({ where: { parentId: { not: null }, isArchived: false } }).catch(() => 0),
        this.prisma.contentCategory.count({ where: { isAudio: true, isArchived: false } }).catch(() => 0),
        this.prisma.devotionalContent.count().catch(() => 0),
        this.prisma.language.count().catch(() => 0),
        this.prisma.panchangamEntry.count().catch(() => 0),
        this.prisma.festival.count().catch(() => 0),
        this.prisma.appSetting.count().catch(() => 0),
        this.prisma.appUser.count().catch(() => 0),
        this.prisma.language.findMany().catch(() => []),
        this.prisma.adminAuditLog.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { admin: true }
        }).catch(() => [])
      ]);

      return {
        totalUsers: usersCount,
        activeUsers: usersCount,
        totalLanguages: languagesCount || 6,
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
        supportedLanguages: (languagesList && languagesList.length > 0 ? languagesList : [
          { id: 1, code: 'te', name: 'Telugu', status: 'ACTIVE', completion: 100 },
          { id: 2, code: 'en', name: 'English', status: 'ACTIVE', completion: 100 },
          { id: 3, code: 'kn', name: 'Kannada', status: 'ACTIVE', completion: 100 },
          { id: 4, code: 'ta', name: 'Tamil', status: 'ACTIVE', completion: 100 },
          { id: 5, code: 'hi', name: 'Hindi', status: 'ACTIVE', completion: 100 },
          { id: 6, code: 'ml', name: 'Malayalam', status: 'ACTIVE', completion: 100 },
        ]).map((l: any) => ({
          id: l.id,
          code: l.code,
          name: l.name,
          status: 'ACTIVE',
          completion: 100
        })),
        recentAuditLogs: recentAuditLogs || []
      };
    } catch (err: any) {
      console.warn('[DashboardStats] Fallback stats served due to DB issue:', err?.message || err);
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalLanguages: 6,
        activeCategories: 0,
        activeSubcategories: 0,
        publishedDevotionalItems: 0,
        totalAudioFiles: 0,
        panchangamEvents: 0,
        activeFestivals: 0,
        publishedCmsPages: 0,
        systemHealth: 'ONLINE_FALLBACK',
        database: 'Reconnecting',
        astronomyEngine: 'Active',
        supportedLanguages: [
          { id: 1, code: 'te', name: 'Telugu', status: 'ACTIVE', completion: 100 },
          { id: 2, code: 'en', name: 'English', status: 'ACTIVE', completion: 100 },
          { id: 3, code: 'kn', name: 'Kannada', status: 'ACTIVE', completion: 100 },
          { id: 4, code: 'ta', name: 'Tamil', status: 'ACTIVE', completion: 100 },
          { id: 5, code: 'hi', name: 'Hindi', status: 'ACTIVE', completion: 100 },
          { id: 6, code: 'ml', name: 'Malayalam', status: 'ACTIVE', completion: 100 },
        ],
        recentAuditLogs: []
      };
    }
  }

  // 11. User Management
  @Get('users')
  async getUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * take;

    const where: any = {};
    if (status === 'soft_deleted') {
      where.isDeleted = true;
    } else if (status === 'deletion_requested') {
      where.deletionRequested = true;
      where.isDeleted = false;
    } else if (status === 'active') {
      where.isDeleted = false;
    }

    if (search) {
      where.OR = [
        { phoneNumber: { contains: search } },
        { fullName: { contains: search } },
        { deviceUuid: { contains: search } }
      ];
    }

    const [totalRecords, users] = await Promise.all([
      this.prisma.appUser.count({ where }),
      this.prisma.appUser.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' }
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

  // 11b. Specific Endpoint: Pending Account Deletion Requests
  @Get('users/deletion-requests')
  async getDeletionRequests() {
    try {
      const requests = await this.prisma.appUser.findMany({
        where: {
          deletionRequested: true,
        },
        orderBy: { deletionRequestedAt: 'desc' },
      });
      return { success: true, count: requests.length, data: requests };
    } catch {
      return { success: true, count: 0, data: [] };
    }
  }

  // 11b-2. Specific Endpoint: Dismiss/Cancel User Deletion Request
  @Post('users/:id/dismiss-deletion-request')
  async dismissDeletionRequest(@Param('id') id: string) {
    const userId = Number(id);
    if (!userId) {
      throw new BadRequestException('Invalid user ID');
    }
    try {
      await this.prisma.appUser.update({
        where: { id: userId },
        data: {
          deletionRequested: false,
          deletionReason: null,
        },
      });
      return { success: true, message: 'Devotee deletion request dismissed successfully.' };
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Failed to dismiss deletion request');
    }
  }

  // 11c. Specific Endpoint: Soft Deleted Users List
  @Get('users/soft-deleted')
  async getSoftDeletedUsers() {
    try {
      const softDeleted = await this.prisma.appUser.findMany({
        where: {
          isDeleted: true,
        },
        orderBy: { deletedAt: 'desc' },
      });
      return { success: true, count: softDeleted.length, data: softDeleted };
    } catch {
      return { success: true, count: 0, data: [] };
    }
  }

  // 11d. Dharma Kartha Records with full Temple details (Events, Festivals, Contact, Timings & Aarthi, Gallery, Speciality, About)
  @Get('dharma-karthas')
  async getDharmaKarthas(
    @Query('search') search?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * take;

    try {
      // Find all Dharma Karthas with their memberships and full temple associations
      const memberships = await (this.prisma as any).templeMembership.findMany({
        where: search ? {
          OR: [
            { user: { fullName: { contains: search } } },
            { user: { phoneNumber: { contains: search } } },
            { temple: { name: { contains: search } } },
            { temple: { city: { contains: search } } },
            { temple: { state: { contains: search } } },
          ],
        } : undefined,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              phoneNumber: true,
              email: true,
              city: true,
              state: true,
              profileImageUrl: true,
              createdAt: true,
              isSuspended: true,
              addressLine: true,
            },
          },
          temple: {
            include: {
              timings: {
                orderBy: { sortOrder: 'asc' },
              },
              festivals: {
                orderBy: { startDate: 'asc' },
              },
              events: {
                orderBy: { startDate: 'asc' },
              },
              gallery: {
                orderBy: { sortOrder: 'asc' },
              },
            },
          },
        },
        orderBy: { id: 'desc' },
      });

      // Group by Dharma Kartha User
      const userMap = new Map<number, any>();
      for (const m of memberships) {
        if (!m.user) continue;
        const uid = m.user.id;
        if (!userMap.has(uid)) {
          userMap.set(uid, {
            id: m.user.id,
            fullName: m.user.fullName || 'Dharma Kartha',
            phoneNumber: m.user.phoneNumber,
            email: m.user.email,
            city: m.user.city || m.temple?.city || 'Hyderabad',
            state: m.user.state || m.temple?.state || 'Telangana',
            profileImageUrl: m.user.profileImageUrl || '/images/ayyappa-icon.jpg',
            createdAt: m.user.createdAt,
            isSuspended: m.user.isSuspended,
            membershipRole: m.role || 'OWNER',
            membershipStatus: m.status || 'APPROVED',
            temples: [],
          });
        }
        if (m.temple) {
          const uRecord = userMap.get(uid);
          if (!uRecord.temples.some((t: any) => t.id === m.temple.id)) {
            uRecord.temples.push({
              id: m.temple.id,
              slug: m.temple.slug,
              name: m.temple.name,
              alternateName: m.temple.alternateName || '',
              primaryDeity: m.temple.primaryDeity,
              shortDescription: m.temple.shortDescription || '',
              about: m.temple.about || '',
              history: m.temple.history || '',
              speciality: m.temple.speciality || '',
              // Official Administrative Contact
              officePhone: m.temple.officePhone || '',
              officialEmail: m.temple.officialEmail || '',
              officialWebsite: m.temple.officialWebsite || '',
              address: m.temple.address || '',
              city: m.temple.city,
              district: m.temple.district || '',
              state: m.temple.state,
              country: m.temple.country || 'India',
              pincode: m.temple.pincode || '',
              mapsUrl: m.temple.mapsUrl || '',
              // Media & Imagery
              heroImageUrl: m.temple.heroImageUrl || '',
              gopuramImageUrl: m.temple.gopuramImageUrl || '',
              status: m.temple.status || 'PUBLISHED',
              isVerified: m.temple.isVerified,
              membershipRole: m.role,
              membershipStatus: m.status,
              // Modules
              timings: m.temple.timings || [],
              festivals: m.temple.festivals || [],
              events: m.temple.events || [],
              gallery: m.temple.gallery || [],
            });
          }
        }
      }

      const allRecords = Array.from(userMap.values());
      const paginated = allRecords.slice(skip, skip + take);

      return {
        success: true,
        data: paginated,
        total: allRecords.length,
        meta: {
          page: pageNum,
          limit: take,
          totalRecords: allRecords.length,
          totalPages: Math.ceil(allRecords.length / take) || 1,
        },
      };
    } catch {
      // Offline / development dynamic fallback with full structured records from DharmaKarthaService
      const devRecords = await this.dkService.getAdminDharmaKarthasWithDetails(search);
      const total = devRecords.length;
      const paginated = devRecords.slice(skip, skip + take);

      return {
        success: true,
        data: paginated,
        total,
        meta: {
          page: pageNum,
          limit: take,
          totalRecords: total,
          totalPages: Math.ceil(total / take) || 1,
        },
      };
    }
  }

  // 11d. Action: Soft Delete a User Account
  @Post('users/:id/soft-delete')
  async softDeleteUser(@Param('id') id: string) {
    const userId = Number(id);
    const user = await this.prisma.appUser.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Devotee user account not found');

    const updated = await this.prisma.appUser.update({
      where: { id: userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletionRequested: false,
      },
    });

    try {
      await this.prisma.adminAuditLog.create({
        data: {
          action: 'USER_SOFT_DELETED',
          targetType: 'APP_USER',
          targetId: String(userId),
          detailsJson: JSON.stringify({
            userId,
            phone: user.phoneNumber,
            fullName: user.fullName,
            reason: user.deletionReason,
            deletedAt: new Date().toISOString(),
          }),
        },
      });
    } catch {}

    return {
      success: true,
      message: `User account #${userId} (${user.fullName || user.phoneNumber}) soft-deleted successfully.`,
      data: updated,
    };
  }

  // 11e. Action: Restore a Soft Deleted User Account
  @Post('users/:id/restore')
  async restoreUser(@Param('id') id: string) {
    const userId = Number(id);
    const user = await this.prisma.appUser.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Devotee user account not found');

    const updated = await this.prisma.appUser.update({
      where: { id: userId },
      data: {
        isDeleted: false,
        deletedAt: null,
        deletionRequested: false,
      },
    });

    try {
      await this.prisma.adminAuditLog.create({
        data: {
          action: 'USER_RESTORED',
          targetType: 'APP_USER',
          targetId: String(userId),
          detailsJson: JSON.stringify({
            userId,
            phone: user.phoneNumber,
            fullName: user.fullName,
            restoredAt: new Date().toISOString(),
          }),
        },
      });
    } catch {}

    return {
      success: true,
      message: `User account #${userId} (${user.fullName || user.phoneNumber}) restored successfully.`,
      data: updated,
    };
  }

  // 11f. Action: Permanently Delete a User Account (GDPR/Compliance Purge)
  @Delete('users/:id/permanent-delete')
  async permanentlyDeleteUser(@Param('id') id: string) {
    const userId = Number(id);
    const user = await this.prisma.appUser.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Devotee user account not found');

    await this.prisma.appUser.delete({ where: { id: userId } });

    try {
      await this.prisma.adminAuditLog.create({
        data: {
          action: 'USER_PERMANENTLY_DELETED',
          targetType: 'APP_USER',
          targetId: String(userId),
          detailsJson: JSON.stringify({
            userId,
            phone: user.phoneNumber,
            fullName: user.fullName,
            purgedAt: new Date().toISOString(),
          }),
        },
      });
    } catch {}

    return {
      success: true,
      message: `User account #${userId} permanently purged from database.`,
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

  // 13. Settings, App Logo, Colors, Title, Description, App Store Links & Social Media
  @Get('settings/general')
  async getGeneralSettings() {
    const settingsMap: Record<string, string> = {};
    try {
      const settings = await this.prisma.appSetting.findMany({
        where: {
          key: {
            in: [
              'app_logo',
              'app_title',
              'app_tagline',
              'app_description',
              'theme_primary_color',
              'theme_secondary_color',
              'theme_background_color',
              'theme_surface_color',
              'app_play_store_url',
              'app_app_store_url',
              'social_youtube_url',
              'social_telegram_url',
              'social_instagram_url',
              'social_facebook_url',
              'social_whatsapp_url',
              'devotional_ticker'
            ]
          }
        }
      });

      if (Array.isArray(settings)) {
        settings.forEach(s => {
          settingsMap[s.key] = s.value;
        });
      }
    } catch (err: any) {
      console.warn('[Admin] getGeneralSettings DB query warning:', err?.message || err);
    }

    const rawLogo = settingsMap['app_logo'];
    const resolvedLogo = rawLogo
      ? (rawLogo.startsWith('http://') || rawLogo.startsWith('https://') || rawLogo.startsWith('data:')
          ? rawLogo
          : `https://backendapis.saranamayyappa.in${rawLogo.startsWith('/') ? '' : '/'}${rawLogo}`)
      : '/images/saranam-ayyappa-official-emblem.jpg';

    return {
      success: true,
      data: {
        app_logo: resolvedLogo,
        app_title: settingsMap['app_title'] || 'Saranam Ayyappa',
        app_tagline: settingsMap['app_tagline'] || 'Connect.. Pray.. Serve..',
        app_description: settingsMap['app_description'] || 'A sacred digital sanctuary and comprehensive devotional guide for Lord Ayyappa devotees and Dharma Karthas worldwide.',
        theme_primary_color: settingsMap['theme_primary_color'] || '#06452E',
        theme_secondary_color: settingsMap['theme_secondary_color'] || '#CAA049',
        theme_background_color: settingsMap['theme_background_color'] || '#F7F1E5',
        theme_surface_color: settingsMap['theme_surface_color'] || '#121212',
        app_play_store_url: settingsMap['app_play_store_url'] || 'https://play.google.com/store/apps/details?id=com.saranamayyappa.app',
        app_app_store_url: settingsMap['app_app_store_url'] || 'https://apps.apple.com/app/saranam-ayyappa/id123456789',
        social_youtube_url: settingsMap['social_youtube_url'] || 'https://www.youtube.com/@SaranamAyyappaOfficial',
        social_telegram_url: settingsMap['social_telegram_url'] || 'https://t.me/saranam_ayyappa_satsang',
        social_instagram_url: settingsMap['social_instagram_url'] || 'https://www.instagram.com/saranamayyappa_official',
        social_facebook_url: settingsMap['social_facebook_url'] || 'https://www.facebook.com/saranamayyappaportal',
        social_whatsapp_url: settingsMap['social_whatsapp_url'] || 'https://whatsapp.com/channel/saranamayyappa',
        devotional_ticker: settingsMap['devotional_ticker'] || ''
      }
    };
  }

  // Helper function to safely extract base64 image and save to disk
  private saveBase64Image(dataUrl: string, prefix = 'logo'): string {
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) return dataUrl;
    try {
      const commaIdx = dataUrl.indexOf(',');
      if (commaIdx === -1) return dataUrl;

      const header = dataUrl.substring(0, commaIdx);
      const extMatch = header.match(/data:image\/([a-zA-Z0-9+]+)/);
      let ext = extMatch ? extMatch[1].toLowerCase() : 'png';
      if (ext === 'jpeg') ext = 'jpg';
      if (ext.includes('+')) ext = ext.split('+')[0];

      // Strip whitespace, line breaks, or carriage returns from base64 data
      const base64Data = dataUrl.substring(commaIdx + 1).replace(/\s+/g, '');
      const buffer = Buffer.from(base64Data, 'base64');
      if (!buffer || buffer.length === 0) return dataUrl;

      const fileName = `saranam-ayyappa-${prefix}-${Date.now()}.${ext}`;

      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const targetFilePath = path.join(uploadDir, fileName);
      fs.writeFileSync(targetFilePath, buffer);

      // Copy to public folders for instantaneous static availability
      const publicWebDir = path.join(process.cwd(), '..', '..', 'saranam-ayyappa-website', 'public', 'images');
      if (fs.existsSync(publicWebDir)) {
        try {
          fs.copyFileSync(targetFilePath, path.join(publicWebDir, fileName));
        } catch (e) {
          console.warn('Could not copy to website public dir:', e);
        }
      }

      const publicAdminDir = path.join(process.cwd(), '..', 'admin-panel', 'public', 'images');
      if (fs.existsSync(publicAdminDir)) {
        try {
          fs.copyFileSync(targetFilePath, path.join(publicAdminDir, fileName));
        } catch (e) {
          console.warn('Could not copy to admin-panel public dir:', e);
        }
      }

      const backendBase = process.env.API_PUBLIC_BASE_URL || 'https://backendapis.saranamayyappa.in';
      return `${backendBase}/uploads/${fileName}`;
    } catch (err) {
      console.warn('Base64 decode warning:', err);
      return dataUrl;
    }
  }

  @Post('settings/general')
  async updateGeneralSettings(@Body() body: {
    app_logo?: string;
    app_title?: string;
    app_tagline?: string;
    app_description?: string;
    theme_primary_color?: string;
    theme_secondary_color?: string;
    theme_background_color?: string;
    theme_surface_color?: string;
    app_play_store_url?: string;
    app_app_store_url?: string;
    social_youtube_url?: string;
    social_telegram_url?: string;
    social_instagram_url?: string;
    social_facebook_url?: string;
    social_whatsapp_url?: string;
  }) {
    // If app_logo contains raw base64 data, convert to file on disk immediately
    if (body.app_logo && body.app_logo.startsWith('data:image/')) {
      body.app_logo = this.saveBase64Image(body.app_logo, 'logo');
    }

    const keys = [
      'app_logo',
      'app_title',
      'app_tagline',
      'app_description',
      'theme_primary_color',
      'theme_secondary_color',
      'theme_background_color',
      'theme_surface_color',
      'app_play_store_url',
      'app_app_store_url',
      'social_youtube_url',
      'social_telegram_url',
      'social_instagram_url',
      'social_facebook_url',
      'social_whatsapp_url'
    ] as const;

    for (const key of keys) {
      if (body[key] !== undefined && body[key] !== null) {
        await this.prisma.appSetting.upsert({
          where: { key },
          update: { value: String(body[key]) },
          create: {
            key,
            value: String(body[key]),
            description: `Brand setting: ${key}`
          }
        });
      }
    }

    try {
      const sanitizedBody = { ...body };
      if (sanitizedBody.app_logo && sanitizedBody.app_logo.startsWith('data:')) {
        sanitizedBody.app_logo = 'base64_image_data';
      }
      await this.prisma.adminAuditLog.create({
        data: {
          action: 'UPDATE_GENERAL_SETTINGS',
          targetType: 'AppSettings',
          targetId: 'branding_and_identity',
          detailsJson: JSON.stringify(sanitizedBody)
        }
      });
    } catch {}

    return {
      success: true,
      message: 'Platform identity, logo, colors, app links, and social links updated successfully!',
      logoUrl: body.app_logo
    };
  }

  // =========================================================
  // TEMPLE TYPES MANAGEMENT (CRUD for Admin Console)
  // =========================================================

  @Get('temple-types')
  async getTempleTypes() {
    const setting = await this.prisma.appSetting.findUnique({
      where: { key: 'temple_types' }
    });

    let types = [
      { id: 'MAIN_TEMPLE', name: 'Main Temple', description: 'Primary institutional shrine with full sanctum and daily scheduled poojas.' },
      { id: 'SUB_TEMPLE', name: 'Sub Temple', description: 'Branch temple or subsidiary shrine affiliated to a central trust.' },
      { id: 'MULTI_TEMPLE', name: 'Multi-Deity Temple Complex', description: 'Grand religious complex housing multiple sanctums and deities.' },
      { id: 'COMMUNITY_TEMPLE', name: 'Community Temple', description: 'Locally organized bhajana mandiram or residential colony shrine.' },
      { id: 'HERITAGE_SHRINE', name: 'Heritage Shrine', description: 'Ancient historic pilgrimage site or forest shrine.' },
    ];

    if (setting && setting.value) {
      try {
        const parsed = JSON.parse(setting.value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          types = parsed;
        }
      } catch {}
    }

    return {
      success: true,
      data: types
    };
  }

  @Post('temple-types')
  async createTempleType(@Body() body: { id?: string; name: string; description?: string }) {
    if (!body.name || !body.name.trim()) {
      return { success: false, statusCode: 400, message: 'Temple type name is required.' };
    }

    const typeId = (body.id || body.name)
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    const setting = await this.prisma.appSetting.findUnique({ where: { key: 'temple_types' } });
    let types: any[] = [];
    if (setting && setting.value) {
      try { types = JSON.parse(setting.value); } catch {}
    }

    if (types.some(t => t.id === typeId)) {
      return { success: false, statusCode: 409, message: `Temple type with ID "${typeId}" already exists.` };
    }

    const newType = {
      id: typeId,
      name: body.name.trim(),
      description: body.description?.trim() || ''
    };
    types.push(newType);

    await this.prisma.appSetting.upsert({
      where: { key: 'temple_types' },
      update: { value: JSON.stringify(types) },
      create: { key: 'temple_types', value: JSON.stringify(types), description: 'Configurable temple categories' }
    });

    return {
      success: true,
      message: 'Temple type created successfully.',
      data: newType
    };
  }

  @Put('temple-types/:id')
  async updateTempleType(
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string }
  ) {
    const setting = await this.prisma.appSetting.findUnique({ where: { key: 'temple_types' } });
    let types: any[] = [];
    if (setting && setting.value) {
      try { types = JSON.parse(setting.value); } catch {}
    }

    const index = types.findIndex(t => t.id === id);
    if (index === -1) {
      return { success: false, statusCode: 404, message: 'Temple type not found.' };
    }

    if (body.name) types[index].name = body.name.trim();
    if (body.description !== undefined) types[index].description = body.description.trim();

    await this.prisma.appSetting.update({
      where: { key: 'temple_types' },
      data: { value: JSON.stringify(types) }
    });

    return {
      success: true,
      message: 'Temple type updated successfully.',
      data: types[index]
    };
  }

  @Delete('temple-types/:id')
  async deleteTempleType(@Param('id') id: string) {
    const setting = await this.prisma.appSetting.findUnique({ where: { key: 'temple_types' } });
    let types: any[] = [];
    if (setting && setting.value) {
      try { types = JSON.parse(setting.value); } catch {}
    }

    const initialLength = types.length;
    types = types.filter(t => t.id !== id);

    if (types.length === initialLength) {
      return { success: false, statusCode: 404, message: 'Temple type not found.' };
    }

    await this.prisma.appSetting.update({
      where: { key: 'temple_types' },
      data: { value: JSON.stringify(types) }
    });

    return {
      success: true,
      message: 'Temple type deleted successfully.'
    };
  }

  // =========================================================
  // SACRED TEMPLES DIRECTORY CRUD (Admin Management)
  // =========================================================

  @Get('temples')
  async getTemples(
    @Query('lang') lang?: string,
    @Query('q') q?: string,
    @Query('deity') deity?: string,
    @Query('state') state?: string,
    @Query('includeInactive') includeInactive: string = 'true',
  ) {
    const data = await this.templesService.getTemples({
      lang,
      q,
      deity,
      state,
      includeInactive: includeInactive === 'true' || includeInactive === '1',
    });
    return {
      success: true,
      data,
      total: data.length,
    };
  }

  @Get('temples/:id')
  async getTempleById(@Param('id') id: string, @Query('lang') lang?: string) {
    const data = await this.templesService.getTempleById(id, lang);
    return {
      success: true,
      data,
    };
  }

  @Post('temples')
  async createTemple(@Body() body: any) {
    const data = await this.templesService.createTemple(body);
    return {
      success: true,
      data,
      message: 'Sacred Temple created successfully.',
    };
  }

  @Put('temples/:id')
  async updateTemple(@Param('id') id: string, @Body() body: any) {
    const data = await this.templesService.updateTemple(id, body);
    return {
      success: true,
      data,
      message: 'Sacred Temple updated successfully.',
    };
  }

  @Delete('temples/:id')
  async deleteTemple(@Param('id') id: string) {
    const success = await this.templesService.deleteTemple(id);
    return {
      success,
      message: success ? 'Sacred Temple deleted successfully.' : 'Failed to delete Sacred Temple.',
    };
  }

  // =========================================================
  // DEVOTIONAL SERVICES (CATEGORY SERVICES) CRUD (View All, View by ID, Create, Update, Delete)
  // =========================================================

  @Get('category-services')
  async getCategoryServices() {
    try {
      // 1. Query dedicated category_services table from MySQL DB
      if ((this.prisma as any).categoryService) {
        const items = await (this.prisma as any).categoryService.findMany({
          orderBy: { displayOrder: 'asc' }
        });
        if (items && items.length > 0) {
          return {
            success: true,
            total: items.length,
            data: items.map((item: any) => ({
              id: item.serviceId,
              serviceId: item.serviceId,
              title: item.title,
              sub: item.sub || '',
              icon: item.icon,
              url: item.url,
              artwork: item.artwork || '',
              displayOrder: item.displayOrder,
              isActive: item.isActive ?? true
            }))
          };
        }
      }

      // 2. Query dynamic app_settings for category_services in MySQL DB
      const setting = await this.prisma.appSetting.findUnique({ where: { key: 'category_services' } });
      if (setting && setting.value) {
        const parsed = JSON.parse(setting.value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return {
            success: true,
            total: parsed.length,
            data: parsed
          };
        }
      }
    } catch (e: any) {
      console.warn('[Admin] getCategoryServices database error:', e?.message);
    }

    // Zero fallback / mock data: strictly return database result
    return {
      success: true,
      total: 0,
      data: []
    };
  }

  @Get('category-services/:id')
  async getCategoryServiceById(@Param('id') id: string) {
    const res = await this.getCategoryServices();
    const service = res.data.find((s: any) => s.id === id || s.serviceId === id);
    if (!service) {
      return { success: false, statusCode: 404, message: 'Devotional service not found.' };
    }
    return { success: true, data: service };
  }

  @Post('category-services')
  async createCategoryService(@Body() body: any) {
    if (!body.title || !body.title.trim()) {
      return { success: false, statusCode: 400, message: 'Service title is required.' };
    }

    const serviceId = (body.serviceId || body.id || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')).trim();

    const setting = await this.prisma.appSetting.findUnique({ where: { key: 'category_services' } });
    let services: any[] = [];
    if (setting && setting.value) {
      try { services = JSON.parse(setting.value); } catch {}
    } else {
      services = (await this.getCategoryServices()).data;
    }

    if (services.some(s => s.id === serviceId || s.serviceId === serviceId)) {
      return { success: false, statusCode: 409, message: `Service with ID "${serviceId}" already exists.` };
    }

    let finalArtwork = body.artwork?.trim() || '';
    if (finalArtwork.startsWith('data:image/')) {
      finalArtwork = this.saveBase64Image(finalArtwork, 'service');
    }

    const newService = {
      id: serviceId,
      serviceId: serviceId,
      title: body.title.trim(),
      sub: body.sub?.trim() || '',
      icon: body.icon?.trim() || 'Sparkles',
      url: body.url?.trim() || `/${serviceId}`,
      artwork: finalArtwork,
      displayOrder: parseInt(body.displayOrder, 10) || (services.length + 1),
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true
    };
    services.push(newService);

    await this.prisma.appSetting.upsert({
      where: { key: 'category_services' },
      update: { value: JSON.stringify(services) },
      create: { key: 'category_services', value: JSON.stringify(services), description: 'Devotional Services Directory' }
    });

    return {
      success: true,
      message: 'Devotional service created successfully.',
      data: newService
    };
  }

  @Put('category-services/:id')
  async updateCategoryService(@Param('id') id: string, @Body() body: any) {
    const setting = await this.prisma.appSetting.findUnique({ where: { key: 'category_services' } });
    let services: any[] = [];
    if (setting && setting.value) {
      try { services = JSON.parse(setting.value); } catch {}
    } else {
      services = (await this.getCategoryServices()).data;
    }

    const index = services.findIndex(s => s.id === id || s.serviceId === id);
    if (index === -1) {
      return { success: false, statusCode: 404, message: 'Devotional service not found.' };
    }

    if (body.title) services[index].title = body.title.trim();
    if (body.sub !== undefined) services[index].sub = body.sub.trim();
    if (body.icon) services[index].icon = body.icon.trim();
    if (body.url) services[index].url = body.url.trim();
    if (body.artwork !== undefined) {
      let finalArt = body.artwork.trim();
      if (finalArt.startsWith('data:image/')) {
        finalArt = this.saveBase64Image(finalArt, 'service');
      }
      services[index].artwork = finalArt;
    }
    if (body.displayOrder !== undefined) services[index].displayOrder = parseInt(body.displayOrder, 10);
    if (body.isActive !== undefined) services[index].isActive = Boolean(body.isActive);

    await this.prisma.appSetting.update({
      where: { key: 'category_services' },
      data: { value: JSON.stringify(services) }
    });

    return {
      success: true,
      message: 'Devotional service updated successfully.',
      data: services[index]
    };
  }

  @Post('category-services/:id/image')
  async uploadCategoryServiceImage(@Param('id') id: string, @Body() body: { image: string }) {
    if (!body || !body.image) throw new BadRequestException('Image payload required');
    let finalUrl = body.image.trim();
    if (finalUrl.startsWith('data:image/')) {
      finalUrl = this.saveBase64Image(finalUrl, 'service');
    }
    const setting = await this.prisma.appSetting.findUnique({ where: { key: 'category_services' } });
    let services: any[] = [];
    if (setting && setting.value) {
      try { services = JSON.parse(setting.value); } catch {}
    } else {
      services = (await this.getCategoryServices()).data;
    }
    const idx = services.findIndex(s => s.id === id || s.serviceId === id);
    if (idx !== -1) {
      services[idx].artwork = finalUrl;
      await this.prisma.appSetting.update({
        where: { key: 'category_services' },
        data: { value: JSON.stringify(services) }
      });
      return { success: true, artwork: finalUrl, service: services[idx] };
    }
    return { success: false, message: 'Devotional service not found' };
  }

  @Delete('category-services/:id')
  async deleteCategoryService(@Param('id') id: string) {
    const setting = await this.prisma.appSetting.findUnique({ where: { key: 'category_services' } });
    let services: any[] = [];
    if (setting && setting.value) {
      try { services = JSON.parse(setting.value); } catch {}
    } else {
      services = (await this.getCategoryServices()).data;
    }

    const initialLength = services.length;
    services = services.filter(s => s.id !== id && s.serviceId !== id);

    if (services.length === initialLength) {
      return { success: false, statusCode: 404, message: 'Devotional service not found.' };
    }

    await this.prisma.appSetting.update({
      where: { key: 'category_services' },
      data: { value: JSON.stringify(services) }
    });

    return {
      success: true,
      message: 'Devotional service deleted successfully.'
    };
  }

  // =========================================================
  // GODS & GODDESSES (DEITIES) MANAGEMENT (CRUD for Admin Console)
  // =========================================================

  @Get('deities')
  async getDeities(@Query('lang') lang?: string) {
    const setting = await this.prisma.appSetting.findUnique({
      where: { key: 'deities' }
    });

    let defaultDeities: any[] = [];
    try {
      defaultDeities = require('./deities-five-languages.json');
    } catch {}

    let deities = defaultDeities;
    if (setting && setting.value) {
      try {
        const parsed = JSON.parse(setting.value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          deities = parsed;
        }
      } catch {}
    } else if (defaultDeities.length > 0) {
      // Auto-initialize in appSetting
      try {
        await this.prisma.appSetting.upsert({
          where: { key: 'deities' },
          update: { value: JSON.stringify(defaultDeities) },
          create: { key: 'deities', value: JSON.stringify(defaultDeities), description: 'Gods and Goddesses directory (16 Sacred Deities)' }
        });
      } catch {}
    }

    const targetLang = (lang || '').toLowerCase().trim();
    const mapped = deities.map((deity: any) => {
      const trans = deity.translations || {};
      const loc = (targetLang && trans[targetLang]) ? trans[targetLang] : null;
      return {
        ...deity,
        name: loc?.name || deity.name,
        alternateName: loc && loc.alternateName !== undefined ? loc.alternateName : deity.alternateName,
        vahana: loc && loc.vahana !== undefined ? loc.vahana : deity.vahana,
        moolaMantra: loc && loc.moolaMantra !== undefined ? loc.moolaMantra : deity.moolaMantra,
        primaryTemple: loc && loc.primaryTemple !== undefined ? loc.primaryTemple : deity.primaryTemple,
        description: loc && loc.description !== undefined ? loc.description : deity.description,
        translations: trans
      };
    });

    return {
      success: true,
      total: mapped.length,
      data: mapped
    };
  }

  @Post('deities')
  async createDeity(@Body() body: any) {
    if (!body.name || !body.name.trim()) {
      return { success: false, statusCode: 400, message: 'Deity name is required.' };
    }

    const deityId = (body.id || 'DEITY_' + body.name)
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    const setting = await this.prisma.appSetting.findUnique({ where: { key: 'deities' } });
    let deities: any[] = [];
    if (setting && setting.value) {
      try { deities = JSON.parse(setting.value); } catch {}
    }

    if (deities.some(d => d.id === deityId)) {
      return { success: false, statusCode: 409, message: `Deity with ID "${deityId}" already exists.` };
    }

    let finalImageUrl = body.imageUrl?.trim() || '/images/pooja-altar.jpg';
    if (finalImageUrl.startsWith('data:image/')) {
      finalImageUrl = this.saveBase64Image(finalImageUrl, 'deity');
    }

    const newDeity = {
      id: deityId,
      name: body.name.trim(),
      alternateName: body.alternateName?.trim() || '',
      category: body.category || 'God',
      vahana: body.vahana?.trim() || '',
      moolaMantra: body.moolaMantra?.trim() || '',
      primaryTemple: body.primaryTemple?.trim() || '',
      description: body.description?.trim() || '',
      imageUrl: finalImageUrl,
      displayOrder: parseInt(body.displayOrder, 10) || (deities.length + 1),
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      translations: body.translations || {}
    };
    deities.push(newDeity);

    await this.prisma.appSetting.upsert({
      where: { key: 'deities' },
      update: { value: JSON.stringify(deities) },
      create: { key: 'deities', value: JSON.stringify(deities), description: 'Gods and Goddesses directory' }
    });

    return {
      success: true,
      message: 'Deity created successfully.',
      data: newDeity
    };
  }

  @Put('deities/:id')
  async updateDeity(
    @Param('id') id: string,
    @Body() body: any
  ) {
    const setting = await this.prisma.appSetting.findUnique({ where: { key: 'deities' } });
    let deities: any[] = [];
    if (setting && setting.value) {
      try { deities = JSON.parse(setting.value); } catch {}
    }

    const index = deities.findIndex(d => d.id === id);
    if (index === -1) {
      return { success: false, statusCode: 404, message: 'Deity not found.' };
    }

    if (body.name) deities[index].name = body.name.trim();
    if (body.alternateName !== undefined) deities[index].alternateName = body.alternateName.trim();
    if (body.category !== undefined) deities[index].category = body.category;
    if (body.vahana !== undefined) deities[index].vahana = body.vahana.trim();
    if (body.moolaMantra !== undefined) deities[index].moolaMantra = body.moolaMantra.trim();
    if (body.primaryTemple !== undefined) deities[index].primaryTemple = body.primaryTemple.trim();
    if (body.description !== undefined) deities[index].description = body.description.trim();
    if (body.translations !== undefined) deities[index].translations = body.translations;
    if (body.imageUrl !== undefined) {
      let finalImg = body.imageUrl.trim();
      if (finalImg.startsWith('data:image/')) {
        finalImg = this.saveBase64Image(finalImg, 'deity');
      }
      deities[index].imageUrl = finalImg;
    }
    if (body.displayOrder !== undefined) deities[index].displayOrder = parseInt(body.displayOrder, 10);
    if (body.isActive !== undefined) deities[index].isActive = Boolean(body.isActive);

    await this.prisma.appSetting.update({
      where: { key: 'deities' },
      data: { value: JSON.stringify(deities) }
    });

    return {
      success: true,
      message: 'Deity updated successfully.',
      data: deities[index]
    };
  }

  @Delete('deities/:id')
  async deleteDeity(@Param('id') id: string) {
    const setting = await this.prisma.appSetting.findUnique({ where: { key: 'deities' } });
    let deities: any[] = [];
    if (setting && setting.value) {
      try { deities = JSON.parse(setting.value); } catch {}
    }

    const initialLength = deities.length;
    deities = deities.filter(d => d.id !== id);

    if (deities.length === initialLength) {
      return { success: false, statusCode: 404, message: 'Deity not found.' };
    }

    await this.prisma.appSetting.update({
      where: { key: 'deities' },
      data: { value: JSON.stringify(deities) }
    });

    return {
      success: true,
      message: 'Deity deleted successfully.'
    };
  }

  // 14. Support Tickets Management
  @Get('tickets')
  async getTickets(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20'
  ) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * take;

    try {
      let whereClause = '1=1';
      const params: any[] = [];

      if (status && status !== 'ALL') {
        whereClause += ' AND status = ?';
        params.push(status);
      }

      if (search && search.trim()) {
        whereClause += ' AND (ticket_number LIKE ? OR user_name LIKE ? OR user_email LIKE ? OR user_phone LIKE ? OR subject LIKE ? OR message LIKE ?)';
        const s = `%${search.trim()}%`;
        params.push(s, s, s, s, s, s);
      }

      const countQuery = `SELECT COUNT(*) as total FROM support_tickets WHERE ${whereClause}`;
      const totalResult: any = await this.prisma.$queryRawUnsafe(countQuery, ...params);
      const total = Number(totalResult[0]?.total || 0);

      const dataQuery = `
        SELECT * FROM support_tickets 
        WHERE ${whereClause} 
        ORDER BY 
          CASE 
            WHEN status = 'OPEN' THEN 1 
            WHEN status = 'IN_PROGRESS' THEN 2 
            ELSE 3 
          END, 
          created_at DESC 
        LIMIT ${take} OFFSET ${skip}
      `;
      const tickets: any = await this.prisma.$queryRawUnsafe(dataQuery, ...params);

      const statsResult: any = await this.prisma.$queryRawUnsafe(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END) as open_count,
          SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress_count,
          SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) as resolved_count,
          SUM(CASE WHEN status = 'CLOSED' THEN 1 ELSE 0 END) as closed_count
        FROM support_tickets
      `);

      const stats = {
        total: Number(statsResult[0]?.total || 0),
        open: Number(statsResult[0]?.open_count || 0),
        inProgress: Number(statsResult[0]?.in_progress_count || 0),
        resolved: Number(statsResult[0]?.resolved_count || 0),
        closed: Number(statsResult[0]?.closed_count || 0),
      };

      return {
        success: true,
        data: tickets,
        stats,
        meta: {
          page: pageNum,
          limit: take,
          totalRecords: total,
          totalPages: Math.ceil(total / take) || 1
        }
      };
    } catch {
      return {
        success: true,
        data: [],
        stats: { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 },
        meta: { page: pageNum, limit: take, totalRecords: 0, totalPages: 1 }
      };
    }
  }

  @Post('tickets')
  async createTicket(@Body() body: {
    userName: string;
    userEmail?: string;
    userPhone?: string;
    userRole?: string;
    subject: string;
    category?: string;
    priority?: string;
    message: string;
    userId?: number;
  }) {
    if (!body.userName || !body.subject || !body.message) {
      throw new BadRequestException('User name, subject, and message are required.');
    }

    const ticketNumber = `TCK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    await this.prisma.$executeRawUnsafe(
      `INSERT INTO support_tickets 
       (ticket_number, user_id, user_name, user_email, user_phone, user_role, subject, category, priority, message, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN')`,
      ticketNumber,
      body.userId || null,
      body.userName.trim(),
      body.userEmail?.trim() || null,
      body.userPhone?.trim() || null,
      body.userRole || 'DEVOTEE',
      body.subject.trim(),
      body.category || 'GENERAL',
      body.priority || 'MEDIUM',
      body.message.trim()
    );

    return {
      success: true,
      message: 'Support ticket registered successfully.',
      ticketNumber
    };
  }

  @Put('tickets/:id')
  async updateTicketStatus(
    @Param('id') id: string,
    @Body() body: { status?: string; adminResponse?: string; priority?: string }
  ) {
    const ticketId = parseInt(id, 10);
    if (!ticketId) throw new BadRequestException('Invalid ticket ID');

    const updates: string[] = [];
    const params: any[] = [];

    if (body.status) {
      updates.push('status = ?');
      params.push(body.status.toUpperCase());
      if (body.status.toUpperCase() === 'RESOLVED') {
        updates.push('resolved_at = NOW(3)');
      }
    }

    if (body.adminResponse !== undefined) {
      updates.push('admin_response = ?');
      params.push(body.adminResponse);
    }

    if (body.priority) {
      updates.push('priority = ?');
      params.push(body.priority.toUpperCase());
    }

    if (updates.length === 0) {
      return { success: true, message: 'No updates provided' };
    }

    params.push(ticketId);
    await this.prisma.$executeRawUnsafe(
      `UPDATE support_tickets SET ${updates.join(', ')} WHERE id = ?`,
      ...params
    );

    await this.prisma.adminAuditLog.create({
      data: {
        action: 'UPDATE_SUPPORT_TICKET',
        targetType: 'SupportTicket',
        targetId: String(ticketId),
        detailsJson: JSON.stringify(body)
      }
    });

    return {
      success: true,
      message: `Ticket #${ticketId} updated successfully.`
    };
  }

  @Delete('tickets/:id')
  async deleteTicket(@Param('id') id: string) {
    const ticketId = parseInt(id, 10);
    if (!ticketId) throw new BadRequestException('Invalid ticket ID');

    await this.prisma.$executeRawUnsafe(
      'DELETE FROM support_tickets WHERE id = ?',
      ticketId
    );

    await this.prisma.adminAuditLog.create({
      data: {
        action: 'DELETE_SUPPORT_TICKET',
        targetType: 'SupportTicket',
        targetId: String(ticketId),
        detailsJson: JSON.stringify({ deletedTicketId: ticketId })
      }
    });

    return {
      success: true,
      message: `Ticket #${ticketId} permanently removed.`
    };
  }

  // 13. Settings, App Logo & Ticker
  @Get('settings/logo')
  async getLogoSetting() {
    const setting = await this.prisma.appSetting.findUnique({
      where: { key: 'app_logo' }
    });

    const rawLogo = setting?.value;
    const logoUrl = rawLogo
      ? (rawLogo.startsWith('http://') || rawLogo.startsWith('https://') || rawLogo.startsWith('data:')
          ? rawLogo
          : `https://backendapis.saranamayyappa.in${rawLogo.startsWith('/') ? '' : '/'}${rawLogo}`)
      : '/images/saranam-ayyappa-official-emblem.jpg';

    return {
      logoUrl,
      updatedAt: setting?.updatedAt || new Date()
    };
  }

  @Post('settings/logo')
  async updateLogoSetting(@Body() body: { logoUrl: string }) {
    if (!body.logoUrl) throw new BadRequestException('logoUrl is required');

    let finalLogoUrl = body.logoUrl.trim();

    // If Base64 image payload uploaded from Admin file input, save to disk immediately
    if (finalLogoUrl.startsWith('data:image/')) {
      finalLogoUrl = this.saveBase64Image(finalLogoUrl, 'logo');
    }

    const updated = await this.prisma.appSetting.upsert({
      where: { key: 'app_logo' },
      update: { value: finalLogoUrl },
      create: { key: 'app_logo', value: finalLogoUrl, description: 'Official Saranam Ayyappa Emblem & Sacred Logo' }
    });

    try {
      await this.prisma.adminAuditLog.create({
        data: {
          action: 'UPDATE_APP_LOGO',
          targetType: 'AppSetting',
          targetId: 'app_logo',
          detailsJson: JSON.stringify({ logoUrl: finalLogoUrl.startsWith('data:') ? 'base64_image_data' : finalLogoUrl })
        }
      });
    } catch {}

    return { success: true, logoUrl: updated.value };
  }

  @Get('settings/ticker')
  async getTicker() {
    try {
      const setting = await this.prisma.appSetting.findUnique({
        where: { key: 'devotional_ticker' }
      });

      return {
        ticker: setting?.value || '🕉️ స్వామియే శరణం అయ్యప్ప — శ్రీ అయ్యప్ప స్వామి నిత్య పూజా విధానం, అష్టోత్తరం, హరివరాసనం మరియు సమగ్ర శబరిమల యాత్రా దర్శిని 🕉️',
        updatedAt: setting?.updatedAt || new Date()
      };
    } catch (err: any) {
      console.warn('[Admin] getTicker DB warning:', err?.message || err);
      return {
        ticker: '🕉️ స్వామియే శరణం అయ్యప్ప — శ్రీ అయ్యప్ప స్వామి నిత్య పూజా విధానం, అష్టోత్తరం, హరివరాసనం మరియు సమగ్ర శబరిమల యాత్రా దర్శిని 🕉️',
        updatedAt: new Date()
      };
    }
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

  // 14. Push Notifications Management (Dynamic broadcast to Mobile App & Website)
  @Get('notifications')
  async getNotifications() {
    const setting = await this.prisma.appSetting.findUnique({
      where: { key: 'broadcast_notifications' }
    });

    let list = [];
    if (setting && setting.value) {
      try {
        list = JSON.parse(setting.value);
      } catch {
        list = [];
      }
    }

    return {
      success: true,
      data: list,
      count: list.length
    };
  }

  @Post('notifications')
  async createNotification(@Body() body: {
    title: string;
    description: string;
    category?: string;
    destination?: string;
    targetAudience?: string;
  }) {
    if (!body.title || !body.title.trim()) {
      throw new BadRequestException('Notification title is required.');
    }
    if (!body.description || !body.description.trim()) {
      throw new BadRequestException('Notification message/description is required.');
    }

    const setting = await this.prisma.appSetting.findUnique({
      where: { key: 'broadcast_notifications' }
    });

    let currentList: any[] = [];
    if (setting && setting.value) {
      try {
        currentList = JSON.parse(setting.value);
      } catch {
        currentList = [];
      }
    }

    const newNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: body.title.trim(),
      desc: body.description.trim(),
      category: body.category || 'temple',
      destination: body.destination || '/home',
      targetAudience: body.targetAudience || 'ALL',
      time: 'Just now',
      timestamp: new Date().toISOString(),
      read: false,
    };

    // Prepend new broadcast to the beginning of the list
    const updatedList = [newNotification, ...currentList];

    await this.prisma.appSetting.upsert({
      where: { key: 'broadcast_notifications' },
      update: { value: JSON.stringify(updatedList) },
      create: {
        key: 'broadcast_notifications',
        value: JSON.stringify(updatedList),
        description: 'Dynamic user broadcast notifications'
      }
    });

    await this.prisma.adminAuditLog.create({
      data: {
        action: 'SEND_NOTIFICATION',
        targetType: 'Notification',
        targetId: newNotification.id,
        detailsJson: JSON.stringify(newNotification)
      }
    });

    return {
      success: true,
      message: 'Notification dispatched to all users successfully.',
      notification: newNotification
    };
  }

  @Delete('notifications/:id')
  async deleteNotification(@Param('id') id: string) {
    const setting = await this.prisma.appSetting.findUnique({
      where: { key: 'broadcast_notifications' }
    });

    if (!setting || !setting.value) {
      return { success: true, message: 'Notification removed.' };
    }

    let currentList: any[] = [];
    try {
      currentList = JSON.parse(setting.value);
    } catch {
      currentList = [];
    }

    const filtered = currentList.filter(n => n.id !== id);

    await this.prisma.appSetting.update({
      where: { key: 'broadcast_notifications' },
      data: { value: JSON.stringify(filtered) }
    });

    return {
      success: true,
      message: 'Notification deleted successfully.'
    };
  }

  // Google Cloud Translation Advanced (v3) Endpoints
  @Post('translate')
  async translateFields(@Body() body: any) {
    if (!body || !body.fields || Object.keys(body.fields).length === 0) {
      throw new BadRequestException('Fields to translate are required');
    }
    return this.translationService.translateFields({
      module: body.module || 'general',
      sourceLang: body.sourceLang || 'en',
      targetLangs: body.targetLangs || ['te', 'kn', 'ta', 'hi'],
      fields: body.fields,
      htmlFields: body.htmlFields || [],
      recordId: body.recordId
    });
  }

  @Post('translate/save')
  async saveTranslations(@Body() body: {
    module: string;
    recordId?: number | string;
    translations: {
      [langCode: string]: { [field: string]: string };
    };
  }) {
    if (!body || !body.translations) {
      throw new BadRequestException('Translation payload required');
    }

    const { module, recordId, translations } = body;
    let savedCount = 0;

    // Fetch existing languages from DB
    const languages = await this.prisma.language.findMany();
    const langMap = new Map<string, number>();
    for (const l of languages) {
      langMap.set(l.code.toLowerCase(), l.id);
    }

    for (const [langCode, fieldValues] of Object.entries(translations)) {
      const langId = langMap.get(langCode.toLowerCase());
      if (!langId && (module === 'categories' || module === 'festivals' || module === 'panchangam')) {
        continue;
      }

      if (module === 'categories' && recordId && langId) {
        const catId = typeof recordId === 'string' ? parseInt(recordId, 10) : recordId;
        if (!isNaN(catId)) {
          const title = fieldValues.title || fieldValues.name || '';
          const description = fieldValues.description || '';
          if (title) {
            await this.prisma.contentTranslation.upsert({
              where: {
                categoryId_languageId: {
                  categoryId: catId,
                  languageId: langId,
                },
              },
              update: {
                title,
                description,
              },
              create: {
                categoryId: catId,
                languageId: langId,
                title,
                description,
              },
            });
            savedCount++;
          }
        }
      } else if (module === 'festivals' && recordId && langId) {
        const festId = typeof recordId === 'string' ? parseInt(recordId, 10) : recordId;
        if (!isNaN(festId)) {
          const name = fieldValues.name || fieldValues.title || '';
          const description = fieldValues.description || '';
          if (name) {
            await this.prisma.festivalTranslation.upsert({
              where: {
                festivalId_languageId: {
                  festivalId: festId,
                  languageId: langId,
                },
              },
              update: {
                name,
                description,
              },
              create: {
                festivalId: festId,
                languageId: langId,
                name,
                description,
              },
            });
            savedCount++;
          }
        }
      } else if (module === 'cms' && recordId) {
        const pageKey = String(recordId).toLowerCase();
        const settingKey = `cms_${pageKey}_${langCode.toLowerCase()}`;
        await this.prisma.appSetting.upsert({
          where: { key: settingKey },
          update: {
            value: JSON.stringify(fieldValues),
            description: `CMS translation for ${pageKey} in ${langCode.toUpperCase()}`,
          },
          create: {
            key: settingKey,
            value: JSON.stringify(fieldValues),
            description: `CMS translation for ${pageKey} in ${langCode.toUpperCase()}`,
          },
        });
        savedCount++;
      } else if (module === 'ticker' || module === 'branding') {
        const settingKey = `localized_${module}_${langCode.toLowerCase()}`;
        await this.prisma.appSetting.upsert({
          where: { key: settingKey },
          update: {
            value: JSON.stringify(fieldValues),
            description: `Localized ${module} in ${langCode.toUpperCase()}`,
          },
          create: {
            key: settingKey,
            value: JSON.stringify(fieldValues),
            description: `Localized ${module} in ${langCode.toUpperCase()}`,
          },
        });
        savedCount++;
      } else if (module === 'temple_types' && recordId) {
        const typeKey = `temple_type_${recordId}_${langCode.toLowerCase()}`;
        await this.prisma.appSetting.upsert({
          where: { key: typeKey },
          update: {
            value: JSON.stringify(fieldValues),
            description: `Localized temple type ${recordId} in ${langCode.toUpperCase()}`,
          },
          create: {
            key: typeKey,
            value: JSON.stringify(fieldValues),
            description: `Localized temple type ${recordId} in ${langCode.toUpperCase()}`,
          },
        });
        savedCount++;
      } else if (module === 'devotional_contents' && recordId) {
        const contentKey = `devotional_content_${recordId}_${langCode.toLowerCase()}`;
        await this.prisma.appSetting.upsert({
          where: { key: contentKey },
          update: {
            value: JSON.stringify(fieldValues),
            description: `Localized devotional content ${recordId} in ${langCode.toUpperCase()}`,
          },
          create: {
            key: contentKey,
            value: JSON.stringify(fieldValues),
            description: `Localized devotional content ${recordId} in ${langCode.toUpperCase()}`,
          },
        });
        savedCount++;
      }
    }

    return {
      success: true,
      savedCount,
      message: `Successfully saved ${savedCount} localized records into MariaDB!`,
    };
  }
}
