import { Controller, Get, Post, Put, Param, Query, Body, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

function resolveCategoryDeity(slug: string = '', title: string = '') {
  const s = `${slug} ${title}`.toLowerCase();
  if (/ganesh|vignesh|vinayak|ganapath|modak|బొమ్మ|గణపతి|వినాయక|విఘ్నేశ్వర|గణేశ|గణప|మోదక/.test(s)) {
    return { deityId: 'ganesha', deityName: 'Lord Ganesha' };
  }
  if (/devi|durga|lakshmi|lalitha|kanakadhara|mahalakshmi|meenakshi|kamakshi|saraswathi|gomatha|kamadhenu|parameshwari|akhilandeshwari|దండాల|అంబ|దేవి|లక్ష్మి|దుర్గ|లలిత|సరస్వతి|గోమాత|కామధేను|వరలక్ష్మి|మాళికాపురత్తమ్మ/.test(s)) {
    return { deityId: 'devi', deityName: 'Goddess Lakshmi / Durga' };
  }
  if (/ayyap|sastha|harivarasanam|shabarimala|uthara|sannidhanam|padi|maaladharan|sharanu|harathi|గురు నాథ|గురునాథ|సాయంకాల|అయ్యప్ప|శాస్తా|శాస్త|శబరిమల|మాలాధారణ|హరివరాసనం|శరణం|హారతి|ఇరుముడి|పడి/.test(s)) {
    return { deityId: 'ayyappa', deityName: 'Lord Ayyappa' };
  }
  if (/shiva|linga|bilva|rudra|natara|mrityunjaya|kedar|శివ|లింగ|బిల్వ|రుద్ర|మృత్యుంజయ|ఈశ్వర|కేదారేశ్వర|నటరాజ/.test(s)) {
    return { deityId: 'shiva', deityName: 'Lord Shiva' };
  }
  if (/venkates|vishnu|koodalmanikya|achyuta|govinda|narayana|perumal|satyanarayana|guruvayoor|వేంకట|వెంకట|విష్ణు|సత్యనారాయణ|గోవింద|నారాయణ|శ్రీనివాస|గురువాయూరప్ప/.test(s)) {
    return { deityId: 'venkateswara', deityName: 'Lord Venkateswara' };
  }
  if (/hanuman|anjaneya|maruti|bajrang|sundarakanda|హనుమాన్|ఆంజనేయ|మారుతి|రామదూత/.test(s)) {
    return { deityId: 'hanuman', deityName: 'Lord Hanuman' };
  }
  if (/subrahmanya|murugan|kartikeya|saravana|shanmukha|vel|skanda|pazhani|సుబ్రహ్మణ్య|మురుగన్|కార్తికేయ|షణ్ముఖ|స్కంద|పళని/.test(s)) {
    return { deityId: 'murugan', deityName: 'Lord Murugan' };
  }
  return { deityId: 'all', deityName: 'All Deities' };
}

@Controller('categories')
export class CategoriesController {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Devotional Services & Categories Endpoint (Direct from MySQL with server-side search and multi-language support)
  @Get('services')
  async getCategoryServices(@Query('search') search?: string, @Query('lang') lang?: string) {
    try {
      const where: any = { isActive: true };

      if (search && search.trim() !== '') {
        const q = search.trim();
        where.OR = [
          { title: { contains: q } },
          { sub: { contains: q } },
          { serviceId: { contains: q } },
        ];
      }

      if ((this.prisma as any).categoryService) {
        const items = await (this.prisma as any).categoryService.findMany({
          where,
          orderBy: { displayOrder: 'asc' },
        });

        if (items && items.length > 0) {
          return {
            success: true,
            data: items.map((item: any) => ({
              id: item.serviceId,
              serviceId: item.serviceId,
              title: item.title,
              sub: item.sub || '',
              icon: item.icon,
              url: item.url,
              artwork: item.artwork || '',
              displayOrder: item.displayOrder,
              isActive: item.isActive ?? true,
            })),
            count: items.length,
          };
        }
      }

      // Check dynamic app_settings for category_services
      const setting = await this.prisma.appSetting.findUnique({
        where: { key: 'category_services' }
      });
      if (setting && setting.value) {
        try {
          const parsed = JSON.parse(setting.value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            let filtered = parsed;
            if (search && search.trim() !== '') {
              const q = search.trim().toLowerCase();
              filtered = parsed.filter((s: any) => s.title?.toLowerCase().includes(q) || s.sub?.toLowerCase().includes(q) || s.serviceId?.toLowerCase().includes(q));
            }
            return {
              success: true,
              data: filtered,
              count: filtered.length
            };
          }
        } catch {}
      }
    } catch (dbErr) {
      console.warn('[Categories] getCategoryServices database error:', dbErr);
    }

    // Strictly fetched from DB: return empty array if no data exists in database
    return {
      success: true,
      data: [],
      count: 0,
    };
  }

  // 1b. Devotional Service By ID Endpoint
  @Get('services/:id')
  async getCategoryServiceById(@Param('id') id: string) {
    const list = await this.getCategoryServices();
    const service = list.data.find((s: any) => s.id === id || s.serviceId === id);
    if (!service) {
      return {
        success: false,
        statusCode: 404,
        message: `Devotional service '${id}' not found.`
      };
    }
    return {
      success: true,
      data: service
    };
  }

  @Get()
  async getCategories(@Query('lang') lang = 'en', @Query('search') search?: string) {
    const targetLang = (lang || 'en').toLowerCase().trim();

    try {
      const where: any = { 
        parentId: null,
        isArchived: false
      };

      if (search && search.trim() !== '') {
        const q = search.trim();
        where.OR = [
          { slug: { contains: q } },
          { translations: { some: { title: { contains: q } } } },
          { translations: { some: { description: { contains: q } } } },
        ];
      }

      const categories = await this.prisma.contentCategory.findMany({
        where,
        orderBy: { displayOrder: 'asc' },
        include: {
          translations: {
            include: { language: true },
          },
        },
      });

      if (categories && categories.length > 0) {
        return categories.map((cat) => {
          // Find matching user-selected language first, otherwise fall back to English reference
          const selectedMatch = cat.translations.find((t) => t.language.code === targetLang);
          const enMatch = cat.translations.find((t) => t.language.code === 'en');
          const fallbackMatch = selectedMatch || enMatch || cat.translations[0];

          return {
            id: String(cat.id),
            slug: cat.slug,
            title: fallbackMatch ? fallbackMatch.title : cat.slug,
            description: fallbackMatch ? fallbackMatch.description : null,
            isAudio: cat.isAudio,
            displayOrder: cat.displayOrder,
          };
        });
      }
    } catch (dbErr) {
      console.warn('[Categories] Database connection unavailable:', dbErr);
    }

    return [];
  }

  // 1b. Stotras Public API List (filtered by published, parent stotras/slogans, Telugu first)
  @Get('stotras')
  async getStotras(
    @Query('lang') lang = 'te',
    @Query('search') search?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @Query('deity') deity?: string
  ) {
    const targetLang = (lang || 'te').toLowerCase().trim();
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * take;

    try {
      // Find parent category for stotras (id 4 or slug slogans-of-sri-ayyappa-swami / stotras)
      const parentCat = await this.prisma.contentCategory.findFirst({
        where: {
          OR: [
            { id: 4 },
            { slug: 'slogans-of-sri-ayyappa-swami' },
            { slug: 'stotras' }
          ]
        }
      });

      const parentId = parentCat ? parentCat.id : 4;

      const where: any = {
        parentId: parentId,
        isArchived: false,
      };

      if (search && search.trim() !== '') {
        const q = search.trim();
        where.AND = [
          {
            OR: [
              { slug: { contains: q } },
              { translations: { some: { title: { contains: q } } } }
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
            translations: { include: { language: true } },
            devotionalContents: {
              where: { isPublished: true },
              orderBy: { displayOrder: 'asc' }
            }
          }
        })
      ]);

      const data = items.map((cat, idx) => {
        const preferred = cat.translations.find((t: any) => t.language?.code === targetLang) || cat.translations.find((t: any) => t.language?.code === 'te') || cat.translations[0];
        const titleFormatted = cat.slug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
        const devContent = cat.devotionalContents[0];
        const verseCount = devContent && devContent.sacredText ? devContent.sacredText.split(/\n\s*\n/).length : 0;

        return {
          id: String(cat.id),
          slug: cat.slug,
          title: preferred?.title || titleFormatted,
          description: preferred?.description || '',
          deityName: preferred?.title?.includes('శివ') ? 'శివుడు' : preferred?.title?.includes('వేంకటేశ') ? 'శ్రీ వేంకటేశ్వర స్వామి' : preferred?.title?.includes('వాసవీ') ? 'వాసవీ కన్యకా పరమేశ్వరి' : 'సర్వ దేవతలు',
          verseCount: verseCount || (devContent ? 5 : 0),
          isPublished: devContent ? devContent.isPublished : true,
          displayOrder: cat.displayOrder,
          imageUrl: `/images/subcategories/stotras/${cat.slug}.webp`,
          badge: 'Stotra',
          updatedAt: cat.updatedAt
        };
      });

      return {
        success: true,
        data,
        meta: {
          page: pageNum,
          limit: take,
          totalRecords,
          totalPages: Math.ceil(totalRecords / take)
        }
      };
    } catch (err) {
      console.warn('[Categories] getStotras error:', err);
      return { success: false, data: [], meta: { page: 1, limit: take, totalRecords: 0, totalPages: 0 } };
    }
  }

  // 1b-detail. Stotra Detail API by slug or ID
  @Get('stotras/:slugOrId')
  async getStotraDetail(
    @Param('slugOrId') slugOrId: string,
    @Query('lang') lang = 'te'
  ) {
    const targetLang = (lang || 'te').toLowerCase().trim();
    const isNum = !isNaN(Number(slugOrId));
    const whereClause: any = isNum ? { id: Number(slugOrId) } : { slug: slugOrId };

    try {
      const category = await this.prisma.contentCategory.findFirst({
        where: whereClause,
        include: {
          translations: { include: { language: true } },
          devotionalContents: {
            where: { isPublished: true },
            orderBy: { displayOrder: 'asc' }
          }
        }
      });

      if (category) {
        const preferred = category.translations.find((t: any) => t.language?.code === targetLang) || category.translations.find((t: any) => t.language?.code === 'te') || category.translations[0];
        const devContent = category.devotionalContents[0];

        return {
          success: true,
          data: {
            id: String(category.id),
            slug: category.slug,
            title: preferred?.title || category.slug,
            introduction: preferred?.description || '',
            description: preferred?.description || '',
            sacredText: devContent?.sacredText || '',
            meaning: devContent?.meaning || '',
            displayOrder: category.displayOrder,
            isPublished: devContent?.isPublished ?? true,
            imageUrl: `/images/subcategories/stotras/${category.slug}.webp`
          }
        };
      }
    } catch (err) {
      console.warn('[Categories] getStotraDetail error:', err);
    }

    return { success: false, message: 'Stotra not found' };
  }

  // 1c. Devotional Subcategories Endpoint (Direct from MySQL with parent, deity, search & server-side filter)
  @Get('subcategories')
  async getSubcategories(
    @Query('parent') parent?: string,
    @Query('parentId') parentId?: string,
    @Query('lang') lang = 'en',
    @Query('search') search?: string,
    @Query('deity') deity?: string,
    @Query('filter') filter?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '100'
  ) {
    const parentKey = parent || parentId;
    const targetLang = (lang || 'en').toLowerCase().trim();

    try {
      let targetParentCondition: any = { not: null };

      if (parentKey && parentKey !== 'all') {
        const parsed = parseInt(parentKey, 10);
        if (!isNaN(parsed) && parsed > 0) {
          targetParentCondition = parsed;
        } else {
          const orClauses: any[] = [
            { slug: parentKey },
            { slug: parentKey.toLowerCase() },
            { translations: { some: { title: { contains: parentKey } } } }
          ];
          const lower = parentKey.toLowerCase();
          if (lower === 'stotras' || lower === 'stotra' || lower === 'stotramulu') {
            orClauses.push({ id: 4 });
            orClauses.push({ slug: 'slogans-of-sri-ayyappa-swami' });
          }
          if (lower === 'slokas' || lower === 'sloka') {
            orClauses.push({ id: 115 });
            orClauses.push({ slug: 'slokas' });
          }
          if (lower === 'pooja' || lower === 'poojas') {
            orClauses.push({ id: 17 });
            orClauses.push({ slug: 'poojalu-vrathaalu' });
          }

          const parentMatch = await this.prisma.contentCategory.findFirst({
            where: { OR: orClauses }
          });
          if (parentMatch) {
            targetParentCondition = parentMatch.id;
          }
        }
      }

      const where: any = {
        parentId: targetParentCondition,
        isArchived: false,
      };

      const items = await this.prisma.contentCategory.findMany({
        where,
        orderBy: { displayOrder: 'asc' },
        include: {
          parent: { include: { translations: { include: { language: true } } } },
          translations: { include: { language: true } },
          devotionalContents: { select: { id: true, title: true, isPublished: true } }
        }
      });

      if (items && items.length > 0) {
        let customImages: Record<string, string> = {};
        try {
          const imgSetting = await this.prisma.appSetting.findUnique({ where: { key: 'subcategory_images' } });
          if (imgSetting && imgSetting.value) customImages = JSON.parse(imgSetting.value);
        } catch (_) {}

        let mappedItems = items.map(cat => {
          const preferred = cat.translations.find((t: any) => t.language?.code === targetLang) || cat.translations[0];
          const parentPref = cat.parent?.translations?.find((t: any) => t.language?.code === targetLang) || cat.parent?.translations?.[0];
          const pSlug = cat.parent?.slug || 'slokas';
          const customImg = customImages[String(cat.id)] || customImages[cat.slug];

          const titleFormatted = cat.slug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
          const finalTitle = (preferred?.title && preferred.title !== cat.slug) ? preferred.title : titleFormatted;
          const deityResolved = resolveCategoryDeity(cat.slug, finalTitle);

          // Dedicated high-resolution card artwork resolution
          let resolvedImage = customImg;
          if (!resolvedImage) {
            const s = cat.slug.toLowerCase();
            if (s.includes('shiva-linga') || s.includes('simple') || s.includes('nithyapooja')) resolvedImage = '/images/pooja/pooja-card-1-ref.png';
            else if (s.includes('subramanya') || s.includes('murugan')) resolvedImage = '/images/pooja/pooja-card-2-ref.png';
            else if (s.includes('mantrapushpam') || s.includes('sharanu') || s.includes('slogans')) resolvedImage = '/images/pooja/pooja-card-3-ref.png';
            else if (s.includes('harathi') || s.includes('deepa')) resolvedImage = '/images/pooja/pooja-card-4-ref.png';
            else if (s.includes('ganapa') || s.includes('vignesh') || s.includes('gomatha')) resolvedImage = '/images/pooja/pooja-card-5-ref.png';
            else if (s.includes('abhisheka') || s.includes('koodalmanikya') || s.includes('bilva')) resolvedImage = '/images/pooja/pooja-card-6-ref.png';
            else if (deityResolved.deityId === 'ayyappa') resolvedImage = '/images/pooja/card-banner-ayyappa-hd.png';
            else if (deityResolved.deityId === 'ganesha') resolvedImage = '/images/pooja/card-banner-ganapathi-hd.png';
            else if (deityResolved.deityId === 'devi') resolvedImage = '/images/pooja/card-banner-lakshmi-hd.png';
            else if (deityResolved.deityId === 'venkateswara') resolvedImage = '/images/pooja/pooja-card-3-ref.png';
            else if (deityResolved.deityId === 'hanuman') resolvedImage = '/images/pooja/pooja-card-4-ref.png';
            else {
              const cardRefs = [
                '/images/pooja/pooja-card-1-ref.png',
                '/images/pooja/pooja-card-2-ref.png',
                '/images/pooja/pooja-card-3-ref.png',
                '/images/pooja/pooja-card-4-ref.png',
                '/images/pooja/pooja-card-5-ref.png',
                '/images/pooja/pooja-card-6-ref.png'
              ];
              resolvedImage = cardRefs[cat.displayOrder % cardRefs.length] || '/images/pooja/pooja-card-1-ref.png';
            }
          }

          // Step count / verse count resolution based on ritual complexity
          let stepsCount = '12 Steps';
          const s = cat.slug.toLowerCase();
          if (s.includes('simple') || s.includes('nithya')) stepsCount = '16 Steps';
          else if (s.includes('subramanya')) stepsCount = '18 Steps';
          else if (s.includes('mantra')) stepsCount = '8 Steps';
          else if (s.includes('harathi')) stepsCount = '5 Steps';
          else if (s.includes('ganapa')) stepsCount = '12 Steps';
          else if (s.includes('abhisheka')) stepsCount = '21 Steps';
          else if (s.includes('ashtottara')) stepsCount = '108 Names';
          else if (s.includes('sahasranama')) stepsCount = '1000 Names';
          else if (s.includes('dasakam')) stepsCount = '10 Stanzas';
          else if (s.includes('stotra') || s.includes('sloka')) stepsCount = '8 Verses';
          else if (pSlug === 'songs') stepsCount = 'Song & Lyrics';

          // Badge tag resolution (Daily / Beginner / Festival / Popular)
          let badgeTag = 'Daily';
          let badgeClass = 'badge-daily';
          if (s.includes('mandala') || s.includes('makara') || s.includes('vratham')) {
            badgeTag = 'Festival';
            badgeClass = 'badge-festival';
          } else if (s.includes('simple') || s.includes('pratha') || s.includes('bhojana') || s.includes('poorvaangamu')) {
            badgeTag = 'Beginner';
            badgeClass = 'badge-beginner';
          } else if (s.includes('harivarasanam') || s.includes('lingashtakam') || s.includes('vishnu-sahasra') || s.includes('kanakadhara')) {
            badgeTag = 'Popular';
            badgeClass = 'badge-popular';
          }

          return {
            id: String(cat.id),
            slug: cat.slug,
            title: finalTitle,
            desc: preferred?.description || '',
            description: preferred?.description || '',
            parentId: cat.parentId,
            parentSlug: pSlug,
            parentTitle: parentPref ? parentPref.title : pSlug,
            displayOrder: cat.displayOrder,
            isAudio: cat.isAudio,
            imageUrl: resolvedImage,
            image: resolvedImage,
            duration: '10 minutes',
            stepsCount,
            badge: badgeTag,
            badgeClass,
            filterTag: badgeTag,
            deityId: deityResolved.deityId,
            deityName: deityResolved.deityName,
            type: cat.isAudio ? 'Audio / Bhajan' : (pSlug === 'pooja' ? 'Pooja' : pSlug === 'stotras' ? 'Stotra' : pSlug === 'slokas' ? 'Sloka' : 'Song')
          };
        });

        // 1. Server-side Deity Filtering
        if (deity && deity !== 'all') {
          const normDeity = deity.toLowerCase().replace(/^(lord-|goddess-)/, '');
          mappedItems = mappedItems.filter(item => {
            const itemD = (item.deityId || '').toLowerCase().replace(/^(lord-|goddess-)/, '');
            return itemD === normDeity;
          });
        }

        // 2. Server-side Search Filtering
        if (search && search.trim() !== '') {
          const q = search.trim().toLowerCase();
          mappedItems = mappedItems.filter(item => {
            return (
              item.title.toLowerCase().includes(q) ||
              item.desc.toLowerCase().includes(q) ||
              item.slug.toLowerCase().includes(q) ||
              item.deityName.toLowerCase().includes(q)
            );
          });
        }

        // 3. Server-side Category / Badge Filter (All, Beginner, Festival, Daily, Popular)
        if (filter && filter !== 'All') {
          mappedItems = mappedItems.filter(item => {
            if (filter === 'Popular') {
              return item.badge === 'Popular' || item.filterTag === 'Popular';
            }
            return item.badge === filter || item.filterTag === filter;
          });
        }

        // 4. Server-side Pagination
        const total = mappedItems.length;
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, parseInt(limit, 10) || 100);
        const paginatedItems = mappedItems.slice((pageNum - 1) * limitNum, pageNum * limitNum);

        return {
          success: true,
          data: paginatedItems,
          total,
          count: paginatedItems.length,
          page: pageNum,
          limit: limitNum
        };
      }
    } catch (err) {
      console.warn('[Categories] getSubcategories error:', err);
    }

    return {
      success: true,
      data: [],
      total: 0,
      count: 0
    };
  }

  // 1c-detail. Devotional Subcategory Detail Endpoint
  @Get('subcategories/:slugOrId')
  async getSubcategoryDetail(
    @Param('slugOrId') slugOrId: string,
    @Query('lang') lang = 'en',
    @Query('god') god?: string
  ) {
    const targetLang = (lang || 'en').toLowerCase().trim();
    const isNum = !isNaN(Number(slugOrId));

    // Resolve aliases (nithyapooja <-> nithya-pooja-laghu-vidhanam <-> daily-pooja)
    let lookupSlug = slugOrId;
    if (slugOrId === 'nithya-pooja-laghu-vidhanam' || slugOrId === 'daily-pooja' || slugOrId === 'nitya-pooja') {
      lookupSlug = 'nithyapooja';
    }

    const orWhere: any[] = [];
    if (isNum) orWhere.push({ id: Number(slugOrId) });
    orWhere.push({ slug: slugOrId });
    if (lookupSlug !== slugOrId) orWhere.push({ slug: lookupSlug });
    if (slugOrId.includes('nithya')) {
      orWhere.push({ slug: 'nithyapooja' });
      orWhere.push({ slug: 'nithya-pooja-laghu-vidhanam' });
    }

    try {
      let category = await this.prisma.contentCategory.findFirst({
        where: { OR: orWhere },
        include: {
          parent: {
            include: {
              translations: { include: { language: true } }
            }
          },
          translations: { include: { language: true } },
          devotionalContents: {
            where: { isPublished: true },
            orderBy: { displayOrder: 'asc' }
          }
        }
      });

      if (!category) {
        return {
          success: false,
          message: `Subcategory "${slugOrId}" not found in database.`
        };
      }

      const preferred = category.translations?.find((t: any) => t.language?.code === targetLang) || category.translations?.[0];
      const teTranslation = category.translations?.find((t: any) => t.language?.code === 'te');
      const enTranslation = category.translations?.find((t: any) => t.language?.code === 'en');
      const parentPref = category.parent?.translations?.find((t: any) => t.language?.code === targetLang) || category.parent?.translations?.[0];
      const pSlug = category.parent?.slug || 'pooja';

      const rawSlug = category.slug;
      const titleFormatted = rawSlug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());

      const finalTitle = preferred?.title || titleFormatted;
      const finalTeTitle = teTranslation?.title || finalTitle;
      const finalEnTitle = enTranslation?.title || titleFormatted;

      const deityResolved = resolveCategoryDeity(rawSlug, finalTitle);

      // Fetch custom image or assign dedicated artwork from DB app_settings
      let customImages: Record<string, string> = {};
      try {
        const imgSetting = await this.prisma.appSetting.findUnique({ where: { key: 'subcategory_images' } });
        if (imgSetting && imgSetting.value) customImages = JSON.parse(imgSetting.value);
      } catch (_) {}

      let resolvedImage = customImages[String(category.id)] || customImages[rawSlug];
      if (!resolvedImage) {
        const s = rawSlug.toLowerCase();
        if (s.includes('shiva-linga') || s.includes('simple') || s.includes('nithya')) resolvedImage = '/images/pooja/pooja-card-1-ref.png';
        else if (s.includes('subramanya') || s.includes('murugan')) resolvedImage = '/images/pooja/pooja-card-2-ref.png';
        else if (s.includes('mantrapushpam') || s.includes('sharanu') || s.includes('slogans')) resolvedImage = '/images/pooja/pooja-card-3-ref.png';
        else if (s.includes('harathi') || s.includes('deepa')) resolvedImage = '/images/pooja/pooja-card-4-ref.png';
        else if (s.includes('ganapa') || s.includes('vignesh') || s.includes('gomatha')) resolvedImage = '/images/pooja/pooja-card-5-ref.png';
        else if (s.includes('abhisheka') || s.includes('koodalmanikya') || s.includes('bilva')) resolvedImage = '/images/pooja/pooja-card-6-ref.png';
        else if (deityResolved.deityId === 'ayyappa') resolvedImage = '/images/pooja/card-banner-ayyappa-hd.png';
        else if (deityResolved.deityId === 'ganesha') resolvedImage = '/images/pooja/card-banner-ganapathi-hd.png';
        else if (deityResolved.deityId === 'devi') resolvedImage = '/images/pooja/card-banner-lakshmi-hd.png';
        else resolvedImage = '/images/pooja/pooja-card-1-ref.png';
      }

      // Full scripture text (contains authentic slokas & mantras from DB)
      let fullScriptureText = preferred?.description || '';

      // Extract instruction note if present
      let instructionNote = '';
      if (fullScriptureText.includes('సూచన :') || fullScriptureText.includes('సూచన:')) {
        const parts = fullScriptureText.split(/\n\s*\n/);
        instructionNote = parts[0].replace(/^సూచన\s*:\s*/, '').trim();
      }

      // Process procedure steps and mantras strictly from DB devotionalContents
      const procedure: Array<{ step: number; title: string; desc: string; mantra?: string }> = [];
      const mantras: Array<{ title: string; script: string; transliteration: string; meaning: string }> = [];

      if (category.devotionalContents && category.devotionalContents.length > 0) {
        category.devotionalContents.forEach((dc: any) => {
          if (dc.sacredText) {
            const sections = dc.sacredText.split(/(?=\[\s*[^\]]+\s*\])/g).filter(Boolean);
            if (sections.length > 1) {
              sections.forEach((sec: string, sIdx: number) => {
                const headerMatch = sec.match(/\[\s*([^\]]+)\s*\]/);
                const secTitle = headerMatch ? headerMatch[1].trim() : `Step ${sIdx + 1}`;
                const secBody = sec.replace(/\[\s*[^\]]+\s*\]/, '').trim();
                procedure.push({
                  step: procedure.length + 1,
                  title: secTitle,
                  desc: `Recite and perform with devotion:`,
                  mantra: secBody
                });
                mantras.push({
                  title: secTitle,
                  script: secBody,
                  transliteration: '',
                  meaning: dc.meaning || 'Sacred verse with divine blessing.'
                });
              });
            } else {
              procedure.push({
                step: procedure.length + 1,
                title: dc.title || `Sacred Chanting Step`,
                desc: dc.meaning || `Chant the divine mantras with pure heart.`,
                mantra: dc.sacredText
              });
              mantras.push({
                title: dc.title || `Maha Mantra`,
                script: dc.sacredText,
                transliteration: '',
                meaning: dc.meaning || 'Sacred verse.'
              });
            }
          }
        });
      }

      // Resolve child subcategories strictly from database
      let children: any[] = [];
      try {
        const dbChildren = await this.prisma.contentCategory.findMany({
          where: { parentId: category.id, isArchived: false },
          include: { translations: { include: { language: true } } },
          orderBy: { displayOrder: 'asc' }
        });
        if (dbChildren && dbChildren.length > 0) {
          children = dbChildren.map((ch: any) => {
            const chPref = ch.translations?.find((t: any) => t.language?.code === targetLang) || ch.translations?.[0];
            return {
              id: String(ch.id),
              slug: ch.slug,
              title: chPref?.title || ch.slug,
              description: chPref?.description || '',
              imageUrl: customImages[String(ch.id)] || customImages[ch.slug] || resolvedImage
            };
          });
        }
      } catch (_) {}

      // If no child categories, check devotionalContents for types
      if (children.length === 0 && category.devotionalContents && category.devotionalContents.length > 0) {
        children = category.devotionalContents.map((dc: any, idx: number) => ({
          id: String(dc.id),
          slug: dc.slug || String(dc.id),
          title: dc.title || `Type ${idx + 1}`,
          description: dc.meaning || '',
          imageUrl: dc.audioUrl || resolvedImage
        }));
      }

      // If category is Sri Maha Ganapathi Pooja and children still empty, look up standard 4 types from DB
      if (children.length === 0 && (rawSlug === 'sri-maha-ganapathi-pooja' || rawSlug === 'ganapathi-pooja' || category.id === 229)) {
        try {
          const ganeshaTypes = await this.prisma.devotionalContent.findMany({
            where: {
              OR: [
                { categoryId: category.id },
                { slug: { in: ['sri-vighneshwara-pooja', 'sri-ganesha-pancharatnam', 'sri-ekadanta-stotram', 'sri-sankashtanashana-ganesha-stotram'] } }
              ]
            },
            orderBy: { displayOrder: 'asc' }
          });
          if (ganeshaTypes && ganeshaTypes.length > 0) {
            children = ganeshaTypes.map((gt: any) => ({
              id: String(gt.id),
              slug: gt.slug,
              title: gt.title,
              description: gt.meaning || '',
              imageUrl: resolvedImage
            }));
          }
        } catch (_) {}
      }

      return {
        success: true,
        data: {
          id: rawSlug,
          rawId: category.id,
          slug: rawSlug,
          category: pSlug,
          parentSlug: pSlug,
          parentTitle: parentPref?.title || pSlug,
          title: finalTitle,
          titleTelugu: finalTeTitle,
          titleEnglish: finalEnTitle,
          subtitle: preferred?.description?.slice(0, 150) || `Complete sacred vidhanam, procedure and verses for ${finalTitle}.`,
          overview: preferred?.description?.slice(0, 300) || `Sacred worship procedure and divine blessings for ${finalTitle}.`,
          fullScriptureText,
          instructionNote,
          heroImage: resolvedImage,
          badge: 'Daily Devotion',
          badgeClass: 'badge-daily',
          duration: '15 mins',
          difficulty: 'All Devotees',
          bestTime: 'Morning (Pratah Kalam) or Evening (Sandhya)',
          deityId: deityResolved.deityId,
          deityName: deityResolved.deityName,
          deityTelugu: deityResolved.deityId === 'ayyappa' ? 'శ్రీ అయ్యప్ప స్వామి' : deityResolved.deityId === 'shiva' ? 'పరమశివుడు' : deityResolved.deityId === 'ganesha' ? 'శ్రీ మహాగణపతి' : deityResolved.deityId === 'devi' ? 'శ్రీ దేవి అమ్మవారు' : deityResolved.deityId === 'murugan' ? 'శ్రీ సుబ్రహ్మణ్యేశ్వర స్వామి' : deityResolved.deityId === 'venkateswara' ? 'శ్రీ వేంకటేశ్వర స్వామి' : 'సర్వ దేవతలు',
          children,
          procedure,
          materials: [
            { name: 'Pure Cow Ghee / Sesame Oil for Deepam', qty: '100 ml', icon: 'Flame' },
            { name: 'Fresh Cotton Wicks (Vattulu)', qty: '1 Packet', icon: 'Sparkles' },
            { name: 'Pure Vibhuti, Kumkum & Sandalwood (Gandham)', qty: '50g each', icon: 'Flower2' },
            { name: 'Fresh Fragrant Flowers & Thulasi / Bilva Leaves', qty: '1 Basket', icon: 'Flower2' },
            { name: 'Raw Coconuts & Betel Leaves with Supari', qty: '2 Coconuts, 5 Betel Leaves', icon: 'Layers' },
            { name: 'Raw Rice with Turmeric (Akshintalu)', qty: '1 Bowl', icon: 'Sparkles' },
            { name: 'Fresh Fruits or Naivedyam Prasad', qty: '1 Bowl', icon: 'Soup' },
            { name: 'Pure Camphor (Karpooram) & Dhoop Sticks', qty: '1 Box', icon: 'Flame' }
          ],
          mantras,
          benefits: [
            'Brings profound peace of mind and destroys negative vibrations.',
            'Instills spiritual strength, health, discipline and family harmony.',
            'Neutralizes planetary doshams and brings auspicious beginnings.',
            'Bestows benevolent divine protection of the presiding deity.'
          ],
          audioTrack: {
            title: `${finalTitle} Devotional Audio`,
            duration: '05:30',
            ragam: 'Madhyamavathi'
          }
        }
      };
    } catch (err) {
      console.warn('[Categories] getSubcategoryDetail error:', err);
    }

    return {
      success: false,
      message: `Subcategory ${slugOrId} not found`
    };
  }

  // 1d. Store Subcategory Image Endpoint
  @Post('subcategories/:id/image')
  async storeSubcategoryImage(
    @Param('id') id: string,
    @Body() body: { imageUrl: string }
  ) {
    if (!body?.imageUrl) {
      throw new BadRequestException('imageUrl is required');
    }

    let customImages: Record<string, string> = {};
    const setting = await this.prisma.appSetting.findUnique({ where: { key: 'subcategory_images' } });
    if (setting && setting.value) {
      try {
        customImages = JSON.parse(setting.value);
      } catch (_) {}
    }

    customImages[id] = body.imageUrl;

    await this.prisma.appSetting.upsert({
      where: { key: 'subcategory_images' },
      create: { key: 'subcategory_images', value: JSON.stringify(customImages) },
      update: { value: JSON.stringify(customImages) }
    });

    return {
      success: true,
      message: `Image stored successfully for subcategory ${id}`,
      data: { id, imageUrl: body.imageUrl }
    };
  }

  // 1e. Batch Store Images Endpoint
  @Put('subcategories/images')
  async storeBatchImages(@Body() body: { images: Record<string, string> }) {
    if (!body?.images || typeof body.images !== 'object') {
      throw new BadRequestException('images object mapping is required');
    }

    let customImages: Record<string, string> = {};
    const setting = await this.prisma.appSetting.findUnique({ where: { key: 'subcategory_images' } });
    if (setting && setting.value) {
      try {
        customImages = JSON.parse(setting.value);
      } catch (_) {}
    }

    Object.assign(customImages, body.images);

    await this.prisma.appSetting.upsert({
      where: { key: 'subcategory_images' },
      create: { key: 'subcategory_images', value: JSON.stringify(customImages) },
      update: { value: JSON.stringify(customImages) }
    });

    return {
      success: true,
      message: 'Subcategory images stored successfully',
      count: Object.keys(customImages).length,
      data: customImages
    };
  }

  // 1f. View Seed Data Endpoint
  @Get('seed-data')
  async getSeedData(@Query('parent') parent?: string) {
    const where: any = { parentId: { not: null } };
    if (parent) {
      where.parent = { slug: parent };
    }

    const [subcategories, translationsCount, devotionalContentsCount, languages] = await Promise.all([
      this.prisma.contentCategory.findMany({
        where,
        orderBy: { displayOrder: 'asc' },
        include: {
          parent: { select: { id: true, slug: true } },
          translations: { select: { id: true, title: true, description: true, language: { select: { code: true, name: true } } } },
          devotionalContents: { select: { id: true, slug: true, title: true, isPublished: true } }
        }
      }),
      this.prisma.contentTranslation.count(),
      this.prisma.devotionalContent.count(),
      this.prisma.language.findMany()
    ]);

    return {
      success: true,
      message: 'Seed data retrieved successfully from DB',
      data: {
        totalSubcategories: subcategories.length,
        translationsCount,
        devotionalContentsCount,
        languages,
        subcategories: subcategories.map(s => ({
          id: s.id,
          slug: s.slug,
          parentSlug: s.parent?.slug,
          displayOrder: s.displayOrder,
          translations: s.translations.map(t => ({ lang: t.language.code, title: t.title })),
          devotionalContentsCount: s.devotionalContents?.length || 0
        }))
      }
    };
  }

  // Direct convenience endpoints for target pages:
  @Get('pooja-vidhanam')
  async getPoojaVidhanam(
    @Query('lang') lang = 'en',
    @Query('search') search?: string,
    @Query('deity') deity?: string
  ) {
    return this.getSubcategories('pooja', undefined, lang, search, deity);
  }

  @Get('slokas')
  async getSlokas(
    @Query('lang') lang = 'en',
    @Query('search') search?: string,
    @Query('deity') deity?: string
  ) {
    return this.getSubcategories('slokas', undefined, lang, search, deity);
  }

  @Get('bhajans')
  async getBhajans(
    @Query('lang') lang = 'en',
    @Query('search') search?: string,
    @Query('deity') deity?: string
  ) {
    return this.getSubcategories('songs', undefined, lang, search, deity);
  }

  @Get('deities')
  async getDeitiesList(@Query('lang') lang = 'en') {
    try {
      const setting = await this.prisma.appSetting.findUnique({
        where: { key: 'deities' }
      });
      if (setting && setting.value) {
        const parsed = JSON.parse(setting.value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return { success: true, data: parsed };
        }
      }
    } catch (err) {
      console.warn('[Categories] getDeitiesList DB error:', err);
    }
    return { success: true, data: [] };
  }

  @Get(':id')
  async getCategoryDetail(@Param('id') id: string, @Query('lang') lang = 'en') {
    const targetLang = (lang || 'en').toLowerCase().trim();
    const isNum = !isNaN(Number(id));
    const whereClause: any = isNum ? { id: Number(id) } : { slug: id };

    let category: any = null;
    try {
      category = await this.prisma.contentCategory.findFirst({
        where: whereClause,
        include: {
          parent: {
            include: {
              translations: {
                include: { language: true },
              },
            },
          },
          translations: {
            include: { language: true },
          },
          devotionalContents: {
            where: { isPublished: true },
            orderBy: { displayOrder: 'asc' },
          },
          subcategories: {
            where: { isArchived: false },
            orderBy: { displayOrder: 'asc' },
            include: {
              translations: {
                include: { language: true },
              },
            },
          },
        },
      });
    } catch (err) {
      console.warn('[Categories] getCategoryDetail DB query error:', err);
    }

    if (category) {
      const selectedMatch = category.translations.find((t: any) => t.language?.code === targetLang);
      const enMatch = category.translations.find((t: any) => t.language?.code === 'en');
      const match = selectedMatch || enMatch || category.translations[0];

      const parentMatch = category.parent?.translations?.find((t: any) => t.language?.code === targetLang) || category.parent?.translations?.[0];
      const pSlug = category.parent?.slug;

      let customImg = '';
      try {
        const imgSetting = await this.prisma.appSetting.findUnique({ where: { key: 'subcategory_images' } });
        if (imgSetting && imgSetting.value) {
          const map = JSON.parse(imgSetting.value);
          customImg = map[String(category.id)] || map[category.slug] || '';
        }
      } catch (_) {}

      return {
        id: String(category.id),
        slug: category.slug,
        title: match ? match.title : category.slug,
        description: match ? match.description : null,
        isAudio: category.isAudio,
        displayOrder: category.displayOrder,
        parentId: category.parentId,
        parentSlug: pSlug || null,
        parentTitle: parentMatch ? parentMatch.title : pSlug || null,
        isSubcategory: Boolean(category.parentId),
        imageUrl: customImg || (pSlug ? `/images/subcategories/${pSlug}/${category.slug}.webp` : null),
        translations: category.translations.map((t: any) => ({
          code: t.language?.code || 'en',
          name: t.language?.name || 'English',
          title: t.title,
          description: t.description || null,
        })),
        contents: category.devotionalContents.map((d: any) => ({
          id: d.id,
          title: d.title,
          slug: d.slug,
          sacredText: d.sacredText || null,
          meaning: d.meaning || null,
          displayOrder: d.displayOrder,
        })),
        subcategories: category.subcategories.map((sub: any) => {
          const subSelectedMatch = sub.translations.find((t: any) => t.language?.code === targetLang);
          const subEnMatch = sub.translations.find((t: any) => t.language?.code === 'en');
          const subMatch = subSelectedMatch || subEnMatch || sub.translations[0];

          return {
            id: String(sub.id),
            slug: sub.slug,
            title: subMatch ? subMatch.title : sub.slug,
            description: subMatch ? subMatch.description : null,
          };
        }),
      };
    }

    throw new NotFoundException(`Category with ID or slug "${id}" not found in database.`);
  }
}
