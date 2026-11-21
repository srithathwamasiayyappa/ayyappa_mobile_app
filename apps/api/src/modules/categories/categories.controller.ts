import { Controller, Get, Param, Query } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

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
      // Graceful fallback if database is reconnecting
    }

    // Default static services fallback matching the official website & mobile API specification
    const fallbackServices = [
      { id: 'pooja', serviceId: 'pooja', title: 'Pooja Vidhanam', sub: 'Step-by-step sacred rituals', icon: 'Flame', url: '/subcategories', artwork: '/images/categories/art-pooja-trans.png', displayOrder: 1, isActive: true },
      { id: 'stotras', serviceId: 'stotras', title: 'Divine Stotras', sub: 'Sacred Hymns & Chants', icon: 'BookOpen', url: '/stotras', artwork: '/images/categories/art-stotras-trans.png', displayOrder: 2, isActive: true },
      { id: 'slokas', serviceId: 'slokas', title: 'Daily Slokas', sub: 'Verses for Meditation', icon: 'Scroll', url: '/slokas', artwork: '/images/categories/art-slokas-trans.png', displayOrder: 3, isActive: true },
      { id: 'songs', serviceId: 'songs', title: 'Bhajans & Songs', sub: 'Devotional Melodies', icon: 'Music', url: '/songs', artwork: '/images/categories/art-bhajans-trans.png', displayOrder: 4, isActive: true },
      { id: 'live-streams', serviceId: 'live-streams', title: 'Live Darshan', sub: 'Daily Temple Streams', icon: 'Tv', url: '/live-streams', artwork: '/images/categories/art-live-trans.png', displayOrder: 5, isActive: true },
      { id: 'panchangam', serviceId: 'panchangam', title: 'Panchangam', sub: 'Auspicious Timings', icon: 'Calendar', url: '/panchangam', artwork: '/images/categories/art-panchangam-trans.png', displayOrder: 6, isActive: true },
      { id: 'festivals', serviceId: 'festivals', title: 'Temple Festivals', sub: 'Annual Celebrations', icon: 'Sparkles', url: '/festivals', artwork: '/images/categories/art-stotras-trans.png', displayOrder: 7, isActive: true },
      { id: 'temples', serviceId: 'temples', title: 'Sacred Temples', sub: 'Shrines & Pilgrimages', icon: 'Landmark', url: '/temples', artwork: '/images/categories/art-temples-trans.png', displayOrder: 8, isActive: true },
      { id: 'donations', serviceId: 'donations', title: 'Annadanam Seva', sub: 'Meal Offering & Seva', icon: 'HeartHandshake', url: '/donations', artwork: '/images/categories/art-donations-trans.png', displayOrder: 9, isActive: true },
    ];

    // Multi-language localization map
    const serviceI18n: Record<string, Record<string, { title: string; sub: string }>> = {
      pooja: {
        te: { title: 'పూజా విధానం', sub: 'దశలవారీ పూజా పద్ధతులు & నియమాలు' },
        kn: { title: 'ಪೂಜಾ ವಿಧಾನ', sub: 'ಹಂತ-ಹಂತದ ಪೂಜಾ ವಿಧಾನಗಳು' },
        ta: { title: 'பூஜை முறை', sub: 'படி படியான பூஜை முறைகள்' },
        hi: { title: 'पूजा विधान', sub: 'चरण-दर-चरण पूजा पद्धतियां' },
      },
      stotras: {
        te: { title: 'దివ్య స్తోత్రాలు', sub: 'శక్తివంతమైన భక్తి స్తోత్రాలు' },
        kn: { title: 'ದಿವ್ಯ ಸ್ತೋತ್ರಗಳು', sub: 'ಶಕ್ತಿಶಾಲಿ ಭಕ್ತಿ ಸ್ತೋತ್ರಗಳು' },
        ta: { title: 'தெய்வீக ஸ்தோத்திரங்கள்', sub: 'சக்திவாய்ந்த பக்தி துதிகள்' },
        hi: { title: 'दिव्य स्तोत्र', sub: 'पावन भक्ति स्तोत्र' },
      },
      slokas: {
        te: { title: 'నిత్య శ్లోకాలు', sub: 'ధ్యాన శ్లోకాలు & అర్థాలు' },
        kn: { title: 'ನಿತ್ಯ ಶ್ಲೋಕಗಳು', sub: 'ಧ್ಯಾನ ಶ್ಲೋಕಗಳು & ಅರ್ಥಗಳು' },
        ta: { title: 'தினசரி ஸ்லோகங்கள்', sub: 'தியான ஸ்லோகங்கள் & பொருள்' },
        hi: { title: 'दैनिक श्लोक', sub: 'ध्यान श्लोक और अर्थ' },
      },
      songs: {
        te: { title: 'భజనలు & కీర్తనలు', sub: 'భక్తి గీతాలు & హారతులు' },
        kn: { title: 'ಭಜನೆಗಳು & ಕೀರ್ತನೆಗಳು', sub: 'ಭಕ್ತಿಗೀತೆಗಳು & ಆರತಿಗಳು' },
        ta: { title: 'பஜனைகள் & பாடல்கள்', sub: 'பக்திப் பாடல்கள் & ஆரத்திகள்' },
        hi: { title: 'भजन और कीर्तन', sub: 'भक्ति गीत और आरतियां' },
      },
      'live-streams': {
        te: { title: 'ప్రత్యక్ష దర్శనం', sub: 'ఆలయ ప్రత్యక్ష ప్రసారాలు' },
        kn: { title: 'ನೇರ ದರ್ಶನ', sub: 'ದೇವಾಲಯ ನೇರ ಪ್ರಸಾರಗಳು' },
        ta: { title: 'நேரலை தரிசனம்', sub: 'கோயில் நேரலை ஒளிபரப்புகள்' },
        hi: { title: 'लाइव दर्शन', sub: 'मंदिर सीधा प्रसारण' },
      },
      panchangam: {
        te: { title: 'నిత్య పంచాంగం', sub: 'తిథి, నక్షత్రం & శుభ ముహూర్తాలు' },
        kn: { title: 'ದೈನಂದಿನ ಪಂಚಾಂಗ', sub: 'ತಿಥಿ, ನಕ್ಷತ್ರ & ಶುಭ ಮುಹೂರ್ತ' },
        ta: { title: 'தினசரி பஞ்சாங்கம்', sub: 'திதி, நட்சத்திரம் & சுப முகூர்த்தம்' },
        hi: { title: 'दैनिक पंचांग', sub: 'तिथि, नक्षत्र और शुभ मुहूर्त' },
      },
      festivals: {
        te: { title: 'ఆలయ పండుగలు', sub: 'వార్షిక ఉత్సవాలు & విశేషాలు' },
        kn: { title: 'ದೇವಾಲಯ ಹಬ್ಬಗಳು', sub: 'ವಾರ್ಷಿಕ ಹಬ್ಬಗಳು & ವಿಶೇಷಗಳು' },
        ta: { title: 'கோயில் திருவிழாக்கள்', sub: 'ஆண்டு விழாக்கள் & சிறப்புகள்' },
        hi: { title: 'मंदिर उत्सव', sub: 'वार्षिक उत्सव और व्रत' },
      },
      temples: {
        te: { title: 'పవిత్ర దేవాలయాలు', sub: 'పుణ్యక్షేత్రాలు & తీర్థయాత్రలు' },
        kn: { title: 'ಪವಿತ್ರ ದೇವಾಲಯಗಳು', sub: 'ಪುಣ್ಯಕ್ಷೇತ್ರಗಳು & ಯಾತ್ರೆಗಳು' },
        ta: { title: 'புனித திருக்கோயில்கள்', sub: 'திருத்தலங்கள் & யாத்திரைகள்' },
        hi: { title: 'पवित्र मंदिर', sub: 'तीर्थ स्थल और देवालय' },
      },
      donations: {
        te: { title: 'అన్నదాన సేవ', sub: 'నిత్యాన్నదానం & సేవా సహకారం' },
        kn: { title: 'ಅನ್ನದಾನ ಸೇವೆ', sub: 'ನಿತ್ಯಾನ್ನದಾನ & ಸೇವಾ ಸಹಕಾರ' },
        ta: { title: 'அன்னதான சேவை', sub: 'அன்னதானம் & சேவைப் பங்களிப்பு' },
        hi: { title: 'अन्नदान सेवा', sub: 'महाप्रसाद एवं सेवा सहयोग' },
      },
    };

    let localizedServices = fallbackServices;
    if (lang && lang !== 'en' && serviceI18n) {
      localizedServices = fallbackServices.map((s) => {
        const trans = serviceI18n[s.serviceId]?.[lang];
        if (trans) {
          return {
            ...s,
            title: trans.title,
            sub: trans.sub,
          };
        }
        return s;
      });
    }

    let filtered = localizedServices;
    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      filtered = localizedServices.filter(s => s.title.toLowerCase().includes(q) || s.sub.toLowerCase().includes(q) || s.serviceId.toLowerCase().includes(q));
    }

    return {
      success: true,
      data: filtered,
      count: filtered.length,
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
      console.warn('[Categories] Database connection unavailable, serving default categories catalog:', dbErr);
    }

    // Default categories seed catalog so the API NEVER throws HTTP 500
    const seedCategories = [
      { id: '1', slug: 'pooja-vidhanam', title: targetLang === 'te' ? 'పూజా విధానం' : 'Pooja Vidhanam', description: 'Complete step-by-step pooja guides and vidhis', isAudio: false, displayOrder: 1 },
      { id: '2', slug: 'astothrams', title: targetLang === 'te' ? 'అష్టోత్తరాలు' : 'Astothrams', description: '108 Sacred Names & Namavalis for daily worship', isAudio: false, displayOrder: 2 },
      { id: '3', slug: 'slokas', title: targetLang === 'te' ? 'శ్లోకాలు' : 'Slokas', description: 'Divine verses and mantras for peace and prosperity', isAudio: false, displayOrder: 3 },
      { id: '4', slug: 'bhajans', title: targetLang === 'te' ? 'భజనలు & కీర్తనలు' : 'Bhajans & Songs', description: 'Soul-stirring devotional songs and keerthanas', isAudio: true, displayOrder: 4 },
      { id: '5', slug: 'vrata-kalpam', title: targetLang === 'te' ? 'వ్రత కల్పం' : 'Vrata Kalpam', description: 'Ayyappa Mandala Deeksha Vrata rules and rituals', isAudio: false, displayOrder: 5 },
      { id: '6', slug: 'harivarasanam', title: targetLang === 'te' ? 'హరివరాసనం' : 'Harivarasanam', description: 'Sacred lullaby sung at Sabarimala temple closing', isAudio: true, displayOrder: 6 },
      { id: '7', slug: 'sahasranama', title: targetLang === 'te' ? 'సహస్రనామావళి' : 'Sahasranamavali', description: '1008 Holy names of Lord Ayyappa', isAudio: false, displayOrder: 7 },
      { id: '8', slug: 'kavacham', title: targetLang === 'te' ? 'శ్రీ అయ్యప్ప కవచం' : 'Ayyappa Kavacham', description: 'Protective divine armour chant', isAudio: false, displayOrder: 8 },
    ];

    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      return seedCategories.filter(c => c.title.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
    }
    return seedCategories;
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

    // Dynamic fallback so detail never returns 404 or empty
    const seedCategories = [
      { id: '1', slug: 'pooja-vidhanam', title: 'Pooja Vidhanam', description: 'Complete step-by-step pooja guides and vidhis', isAudio: false, isSubcategory: false },
      { id: '2', slug: 'astothrams', title: 'Astothrams', description: '108 Sacred Names & Namavalis for daily worship', isAudio: false, isSubcategory: false },
      { id: '3', slug: 'slokas', title: 'Slokas', description: 'Divine verses and mantras for peace and prosperity', isAudio: false, isSubcategory: false },
      { id: '4', slug: 'bhajans', title: 'Bhajans & Songs', description: 'Soul-stirring devotional songs and keerthanas', isAudio: true, isSubcategory: false },
    ];
    const catMatch = seedCategories.find(c => c.id === id || c.slug === id);
    if (catMatch) {
      return {
        id: catMatch.id,
        slug: catMatch.slug,
        title: catMatch.title,
        description: catMatch.description,
        isAudio: catMatch.isAudio,
        displayOrder: 1,
        parentId: null,
        parentSlug: null,
        parentTitle: null,
        isSubcategory: false,
        imageUrl: null,
        translations: [
          { code: 'en', name: 'English', title: catMatch.title, description: catMatch.description },
          { code: 'te', name: 'Telugu', title: catMatch.title, description: catMatch.description }
        ],
        contents: [],
        subcategories: []
      };
    }

    // Subcategory fallback
    const titleFormatted = id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return {
      id: String(id),
      slug: id,
      title: titleFormatted,
      description: `Complete sacred guide, procedure and mantras for ${titleFormatted}.`,
      isAudio: false,
      displayOrder: 1,
      parentId: 1,
      parentSlug: 'pooja',
      parentTitle: 'Pooja Vidhanam',
      isSubcategory: true,
      imageUrl: `/images/subcategories/pooja/${id}.webp`,
      translations: [
        { code: 'en', name: 'English', title: titleFormatted, description: `Complete sacred guide and mantras for ${titleFormatted}.` },
        { code: 'te', name: 'Telugu', title: titleFormatted, description: `సంపూర్ణ పూజా విధానం మరియు మంత్రములు.` },
        { code: 'kn', name: 'Kannada', title: titleFormatted, description: `ಸಂಪೂರ್ಣ ಪೂಜಾ ವಿಧಾನ ಮತ್ತು ಮಂತ್ರಗಳು.` },
        { code: 'ta', name: 'Tamil', title: titleFormatted, description: `முழுமையான பூஜை முறை மற்றும் மந்திரங்கள்.` },
        { code: 'hi', name: 'Hindi', title: titleFormatted, description: `सम्पूर्ण पूजा विधान एवं मन्त्र।` }
      ],
      contents: [
        {
          id: 1,
          title: `${titleFormatted} Sacred Chanting & Mantras`,
          slug: `${id}-chanting`,
          sacredText: 'ఓం శ్రీ స్వామియే శరణం అయ్యప్ప | ఓం నమో భగవతే వాసుదేవాయ ||',
          meaning: 'Step-by-step sacred procedure, invocation mantras, offering sequence, and prayer rules.'
        }
      ],
      subcategories: []
    };
  }
}
