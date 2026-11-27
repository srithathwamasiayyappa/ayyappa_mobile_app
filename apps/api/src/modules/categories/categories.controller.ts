import { Controller, Get, Post, Put, Param, Query, Body, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

const SERVICE_LOCALIZATIONS: Record<string, Record<string, { title: string; sub: string }>> = {
  te: {
    pooja: { title: 'పూజా విధానము', sub: 'దశలవారీగా పవిత్ర పూజా విధానాలు' },
    stotras: { title: 'దివ్య స్తోత్రాలు', sub: 'పవిత్ర స్తోత్రాలు & కవచాలు' },
    slokas: { title: 'నిత్య శ్లోకాలు', sub: 'ధ్యానం & ప్రార్థన శ్లోకాలు' },
    bhajans: { title: 'భజనలు & కీర్తనలు', sub: 'భక్తి కీర్తనలు & గీతాలు' },
    darshan: { title: 'ప్రత్యక్ష దర్శనం', sub: 'నిత్య ఆలయ ప్రత్యక్ష ప్రసారాలు' },
    panchangam: { title: 'పంచాంగం', sub: 'శుభ సమయాలు & ముహూర్తాలు' },
    festivals: { title: 'ఆలయ ఉత్సవాలు', sub: 'వార్షిక ఉత్సవాలు & వేడుకలు' },
    temples: { title: 'పుణ్యక్షేత్రాలు', sub: 'ప్రసిద్ధ క్షేత్రాలు & దర్శనీయ స్థలాలు' },
    annadanam: { title: 'అన్నదాన సేవ', sub: 'నిత్యాన్నదానం & సమర్పణ' },
  },
  kn: {
    pooja: { title: 'ಪೂಜಾ ವಿಧಾನ', sub: 'ಹಂತ-ಹಂತದ ಪವಿತ್ರ ವಿಧಿವಿಧಾನಗಳು' },
    stotras: { title: 'ದಿವ್ಯ ಸ್ತೋತ್ರಗಳು', sub: 'ಪವಿತ್ರ ಸ್ತೋತ್ರಗಳು & ಕವಚಗಳು' },
    slokas: { title: 'ನಿತ್ಯ ಶ್ಲೋಕಗಳು', sub: 'ಧ್ಯಾನ & ಪ್ರಾರ್ಥನಾ ಶ್ಲೋಕಗಳು' },
    bhajans: { title: 'ಭಜನೆಗಳು & ಕೀರ್ತನೆಗಳು', sub: 'ಭಕ್ತಿ ಗೀತೆಗಳು & ಸಂಕೀರ್ತನೆ' },
    darshan: { title: 'ಲೈವ್ ದರ್ಶನ', sub: 'ದೈನಂದಿನ ದೇವಾಲಯ ನೇರಪ್ರಸಾರ' },
    panchangam: { title: 'ಪಂಚಾಂಗ', sub: 'ಶುಭ ಮುಹೂರ್ತಗಳು & ತಿಥಿಗಳು' },
    festivals: { title: 'ದೇವಾಲಯ ಉತ್ಸವಗಳು', sub: 'ವಾರ್ಷಿಕ ಹಬ್ಬಗಳು & ಆಚರಣೆಗಳು' },
    temples: { title: 'ಪುಣ್ಯಕ್ಷೇತ್ರಗಳು', sub: 'ಪವಿತ್ರ ದೇವಾಲಯಗಳು & ಯಾತ್ರೆಗಳು' },
    annadanam: { title: 'ಅನ್ನದಾನ ಸೇವೆ', sub: 'ಅನ್ನದಾನ ಅರ್ಪಣೆ & ಸೇವೆ' },
  },
  ta: {
    pooja: { title: 'பூஜா விதானம்', sub: 'படிப்படியான புனித வழிபாட்டு முறைகள்' },
    stotras: { title: 'திவ்ய ஸ்தோத்திரங்கள்', sub: 'புனித துதிகள் & கவசங்கள்' },
    slokas: { title: 'நித்ய ஸ்லோகங்கள்', sub: 'தியானம் & பிரார்த்தனை சுலோகங்கள்' },
    bhajans: { title: 'பஜனைகள் & பாடல்கள்', sub: 'பக்திப் பாடல்கள் & கீர்த்தனைகள்' },
    darshan: { title: 'நேரலை தரிசனம்', sub: 'தினசரி கோயில் நேரலை ஒளிபரப்பு' },
    panchangam: { title: 'பஞ்சாங்கம்', sub: 'சுப நேரங்கள் & திதிகள்' },
    festivals: { title: 'திருவிழாக்கள்', sub: 'ஆண்டு திருவிழாக்கள் & கொண்டாட்டங்கள்' },
    temples: { title: 'புண்ணிய தலங்கள்', sub: 'புனித கோயில்கள் & யாத்திரைகள்' },
    annadanam: { title: 'அன்னதான சேவை', sub: 'அன்னதான அர்ப்பணிப்பு & சேவை' },
  },
  hi: {
    pooja: { title: 'पूजा विधान', sub: 'चरणबद्ध पवित्र अनुष्ठान एवं पूजा' },
    stotras: { title: 'दिव्य स्तोत्र', sub: 'पवित्र स्तोत्र एवं मंत्र' },
    slokas: { title: 'नित्य श्लोक', sub: 'ध्यान एवं प्रार्थना श्लोक' },
    bhajans: { title: 'भजन एवं कीर्तन', sub: 'भक्ति संगीत एवं आरतियां' },
    darshan: { title: 'लाइव दर्शन', sub: 'दैनिक मंदिर लाइव प्रसारण' },
    panchangam: { title: 'पंचांग', sub: 'शुभ मुहूर्त एवं तिथियां' },
    festivals: { title: 'मंदिर उत्सव', sub: 'वार्षिक उत्सव एवं पर्व' },
    temples: { title: 'पुण्य क्षेत्र व मंदिर', sub: 'पवित्र तीर्थ स्थल एवं धाम' },
    annadanam: { title: 'अन्नदान सेवा', sub: 'भोजन सेवा एवं दान' },
  },
  ml: {
    pooja: { title: 'പൂജാ വിധി', sub: 'ഘട്ടം ഘട്ടമായുള്ള വിശുദ്ധ കർമ്മങ്ങൾ' },
    stotras: { title: 'ദിവ്യ സ്തോത്രങ്ങൾ', sub: 'വിശുദ്ധ സ്തോത്രങ്ങൾ & കീർത്തനങ്ങൾ' },
    slokas: { title: 'നിത്യ ശ്ലോകങ്ങൾ', sub: 'പ്രാർത്ഥനാ ശ്ലോകങ്ങൾ' },
    bhajans: { title: 'ഭജനകളും ഗാനങ്ങളും', sub: 'ഭക്തിഗാനങ്ങൾ' },
    darshan: { title: 'തത്സമയ ദർശനം', sub: 'ദിവസേനയുള്ള തത്സമയ സംപ്രേക്ഷണം' },
    panchangam: { title: 'പഞ്ചാംഗം', sub: 'ശുഭ മുഹൂർത്തങ്ങൾ' },
    festivals: { title: 'ക്ഷേത്രോത്സവങ്ങൾ', sub: 'വാർഷിക ആഘോഷങ്ങൾ' },
    temples: { title: 'പുണ്യക്ഷേത്രങ്ങൾ', sub: 'തീർത്ഥാടന കേന്ദ്രങ്ങൾ' },
    annadanam: { title: 'അന്നദാന സേവ', sub: 'അന്നദാന സമർപ്പണം' },
  },
  en: {
    pooja: { title: 'Pooja Vidhanam', sub: 'Step-by-step sacred rituals' },
    stotras: { title: 'Divine Stotras', sub: 'Sacred Hymns & Chants' },
    slokas: { title: 'Daily Slokas', sub: 'Verses for Meditation' },
    bhajans: { title: 'Bhajans & Songs', sub: 'Devotional Melodies' },
    darshan: { title: 'Live Darshan', sub: 'Daily Temple Streams' },
    panchangam: { title: 'Panchangam', sub: 'Auspicious Timings' },
    festivals: { title: 'Temple Festivals', sub: 'Annual Celebrations' },
    temples: { title: 'Sacred Temples', sub: 'Shrines & Pilgrimages' },
    annadanam: { title: 'Annadanam Seva', sub: 'Meal Offering & Seva' },
  },
};

@Controller('categories')
export class CategoriesController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper: Retrieve deities directory from DB (app_settings key 'deities' or deities table)
   * Strictly DB-driven: zero hardcoded data.
   */
  private async getDbDeities(): Promise<any[]> {
    try {
      const setting = await this.prisma.appSetting.findUnique({
        where: { key: 'deities' },
      });
      if (setting && setting.value) {
        const parsed = JSON.parse(setting.value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (_) {}
    return [];
  }

  /**
   * Helper: Retrieve subcategory custom images mapping from DB (app_settings key 'subcategory_images')
   */
  private async getCustomImagesMap(): Promise<Record<string, string>> {
    try {
      const setting = await this.prisma.appSetting.findUnique({
        where: { key: 'subcategory_images' },
      });
      if (setting && setting.value) {
        const parsed = JSON.parse(setting.value);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch (_) {}
    return {};
  }

  /**
   * Helper: Dynamically match category against deities stored in DB
   */
  private resolveDeityFromDb(slug: string = '', title: string = '', dbDeities: any[]) {
    const text = `${slug} ${title}`.toLowerCase();

    // 1. Direct match with DB deities
    for (const deity of dbDeities) {
      if (!deity.id || deity.id === 'all') continue;
      const dId = (deity.id || '').toLowerCase();
      const dSlug = (deity.slug || '').toLowerCase().replace(/^(lord-|goddess-)/, '');
      const dName = (deity.name || '').toLowerCase().replace(/^(lord\s+|goddess\s+)/, '');
      const dNameTe = (deity.nameTe || '').toLowerCase().replace(/^శ్రీ\s+/, '').replace(/\s+స్వామి$/, '');

      if (
        (dId && text.includes(dId)) ||
        (dSlug && text.includes(dSlug)) ||
        (dName && text.includes(dName)) ||
        (dNameTe && text.includes(dNameTe))
      ) {
        return {
          deityId: deity.id,
          deityName: deity.name || deity.id,
          deityTelugu: deity.nameTe || deity.name || deity.id,
        };
      }
    }

    // 2. Standard multi-lingual devotional keywords mapping to DB deity records
    if (/ayyap|sastha|harivarasanam|shabarimala|uthara|sannidhanam|padi|maaladharan|sharanu|harathi|irumudi|kettu|kattu|poorvaang|పూర్వాంగ|మాలాధారణ|అయ్యప్ప|శాస్తా|శాస్త|శబరిమల|మాలాధారణ|హరివరాసనం|శరణం|హారతి|ఇరుముడి|పడి/.test(text)) {
      const ayyappa = dbDeities.find((d) => d.id === 'ayyappa');
      return {
        deityId: 'ayyappa',
        deityName: ayyappa?.name || 'Lord Ayyappa',
        deityTelugu: ayyappa?.nameTe || 'శ్రీ అయ్యప్ప స్వామి',
      };
    }
    if (/shiva|linga|bilva|rudra|natara|mrityunjaya|kedar|vishwanath|shankara|renuka|శివ|లింగ|బిల్వ|రుద్ర|మృత్యుంజయ|ఈశ్వర|కేదారేశ్వర|నటరాజ|విశ్వనాథ|శంకర|శఙ్కర|రేణుక/.test(text)) {
      const shiva = dbDeities.find((d) => d.id === 'shiva');
      return {
        deityId: 'shiva',
        deityName: shiva?.name || 'Lord Shiva',
        deityTelugu: shiva?.nameTe || 'పరమశివుడు',
      };
    }
    if (/ganesh|vignesh|vinayak|ganapath|modak|గణపతి|వినాయక|విఘ్నేశ్వర|గణేశ|గణప|మోదక/.test(text)) {
      const ganesha = dbDeities.find((d) => d.id === 'ganesha');
      return {
        deityId: 'ganesha',
        deityName: ganesha?.name || 'Lord Ganesha',
        deityTelugu: ganesha?.nameTe || 'శ్రీ మహాగణపతి',
      };
    }
    if (/devi|durga|lakshmi|lalitha|kanakadhara|mahalakshmi|meenakshi|kamakshi|saraswathi|gomatha|kamadhenu|vasavi|akhiland|kanyaka|దేవి|లక్ష్మి|దుర్గ|లలిత|సరస్వతి|గోమాత|కామధేను|వరలక్ష్మి|మాళికాపురత్తమ్మ|వాసవి|వాసవీ|అఖిలాండ|కన్యక/.test(text)) {
      const devi = dbDeities.find((d) => d.id === 'devi');
      return {
        deityId: 'devi',
        deityName: devi?.name || 'Goddess Lakshmi / Durga',
        deityTelugu: devi?.nameTe || 'శ్రీ లక్ష్మీ దుర్గా దేవి',
      };
    }
    if (/venkates|vishnu|koodalmanikya|achyuta|govinda|narayana|perumal|satyanarayana|guruvayoor|ramanuja|వేంకట|వెంకట|విష్ణు|సత్యనారాయణ|గోవింద|నారాయణ|శ్రీనివాస|గురువాయూరప్ప|రామానుజ/.test(text)) {
      const venk = dbDeities.find((d) => d.id === 'venkateswara');
      return {
        deityId: 'venkateswara',
        deityName: venk?.name || 'Lord Venkateswara',
        deityTelugu: venk?.nameTe || 'శ్రీ వేంకటేశ్వర స్వామి',
      };
    }
    if (/hanuman|anjaneya|maruti|bajrang|sundarakanda|హనుమాన్|ఆంజనేయ|మారుతి|రామదూత/.test(text)) {
      const hanuman = dbDeities.find((d) => d.id === 'hanuman');
      return {
        deityId: 'hanuman',
        deityName: hanuman?.name || 'Lord Hanuman',
        deityTelugu: hanuman?.nameTe || 'శ్రీ హనుమాన్',
      };
    }
    if (/subrahmanya|murugan|kartikeya|saravana|shanmukha|vel|skanda|kanda|sashti|kavasam|pazhani|సుబ్రహ్మణ్య|మురుగన్|కార్తికేయ|షణ్ముఖ|స్కంద|షష్ఠి|కవచం|పళని/.test(text)) {
      const murugan = dbDeities.find((d) => d.id === 'murugan');
      return {
        deityId: 'murugan',
        deityName: murugan?.name || 'Lord Murugan',
        deityTelugu: murugan?.nameTe || 'శ్రీ సుబ్రహ్మణ్యేశ్వర స్వామి',
      };
    }

    const allDeity = dbDeities.find((d) => d.id === 'all');
    return {
      deityId: 'all',
      deityName: allDeity?.name || 'All Deities',
      deityTelugu: allDeity?.nameTe || 'సర్వ దేవతలు',
    };
  }

  // 1. Devotional Services & Categories Endpoint (Direct from MySQL with server-side search and multi-language support)
  @Get('services')
  async getCategoryServices(@Query('search') search?: string, @Query('lang') lang?: string) {
    const q = search && search.trim() !== '' ? search.trim().toLowerCase() : null;
    const targetLang = (lang || 'en').toLowerCase().trim();

    // Load category translations from content_categories table in DB
    let dbCategoryTranslations: Record<string, { title: string; desc: string }> = {};
    try {
      const rootCats = await this.prisma.contentCategory.findMany({
        where: { parentId: null, isArchived: false },
        include: { translations: { include: { language: true } } },
      });
      if (rootCats && rootCats.length > 0) {
        rootCats.forEach((cat) => {
          const trans = cat.translations.find((t: any) => t.language?.code === targetLang) || cat.translations[0];
          if (trans && trans.title) {
            dbCategoryTranslations[cat.slug] = {
              title: trans.title,
              desc: trans.description || '',
            };
          }
        });
      }
    } catch (_) {}

    // Load custom translations from app_settings if available
    let dbSettingsTranslations: Record<string, { title: string; sub: string }> = {};
    try {
      const sKey = `category_services_${targetLang}`;
      const sSetting = await this.prisma.appSetting.findUnique({ where: { key: sKey } });
      if (sSetting && sSetting.value) {
        const parsed = JSON.parse(sSetting.value);
        if (parsed && typeof parsed === 'object') {
          dbSettingsTranslations = parsed;
        }
      }
    } catch (_) {}

    const resolveItemTitleAndSub = (serviceId: string, origTitle: string, origSub: string) => {
      const sId = (serviceId || '').toLowerCase().trim();
      // 1. DB app_settings custom overrides
      if (dbSettingsTranslations[sId]?.title) {
        return {
          title: dbSettingsTranslations[sId].title,
          sub: dbSettingsTranslations[sId].sub || origSub || '',
        };
      }
      // 2. DB content_categories translations
      const matchedCat = Object.keys(dbCategoryTranslations).find((k) => k === sId || k.startsWith(sId) || sId.startsWith(k));
      if (matchedCat && dbCategoryTranslations[matchedCat]?.title) {
        return {
          title: dbCategoryTranslations[matchedCat].title,
          sub: SERVICE_LOCALIZATIONS[targetLang]?.[sId]?.sub || origSub || '',
        };
      }
      // 3. Multi-language localization dictionary
      if (SERVICE_LOCALIZATIONS[targetLang]?.[sId]) {
        return {
          title: SERVICE_LOCALIZATIONS[targetLang][sId].title,
          sub: SERVICE_LOCALIZATIONS[targetLang][sId].sub,
        };
      }
      return { title: origTitle, sub: origSub || '' };
    };

    // 1. Dedicated category_services table from DB
    try {
      if ((this.prisma as any).categoryService) {
        const items = await (this.prisma as any).categoryService.findMany({
          orderBy: { displayOrder: 'asc' },
        });

        if (items && items.length > 0) {
          let mapped = items
            .filter((item: any) => item.isActive !== false)
            .map((item: any) => {
              const localized = resolveItemTitleAndSub(item.serviceId, item.title, item.sub);
              return {
                id: item.serviceId,
                serviceId: item.serviceId,
                title: localized.title,
                sub: localized.sub,
                icon: item.icon || 'Sparkles',
                url: item.url || '/subcategories',
                artwork: item.artwork || item.image || '',
                displayOrder: item.displayOrder,
                isActive: item.isActive ?? true,
              };
            });

          if (q) {
            mapped = mapped.filter((item: any) =>
              (item.title && item.title.toLowerCase().includes(q)) ||
              (item.sub && item.sub.toLowerCase().includes(q)) ||
              (item.serviceId && item.serviceId.toLowerCase().includes(q))
            );
          }

          if (mapped.length > 0) {
            return {
              success: true,
              data: mapped,
              count: mapped.length,
            };
          }
        }
      }
    } catch (err: any) {
      console.warn('[Categories] getCategoryServices table query notice:', err?.message || err);
    }

    // 2. Dynamic app_settings (key: category_services) in MySQL DB
    try {
      const setting = await this.prisma.appSetting.findUnique({
        where: { key: 'category_services' },
      });
      if (setting && setting.value) {
        const parsed = JSON.parse(setting.value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          let filtered = parsed;
          if (q) {
            filtered = parsed.filter((s: any) =>
              (s.title && s.title.toLowerCase().includes(q)) ||
              (s.sub && s.sub.toLowerCase().includes(q)) ||
              (s.serviceId && s.serviceId.toLowerCase().includes(q))
            );
          }
          return {
            success: true,
            data: filtered,
            count: filtered.length,
          };
        }
      }
    } catch (err: any) {
      console.warn('[Categories] app_settings query notice:', err?.message || err);
    }

    // 3. Root Categories from content_categories table in DB
    try {
      const rootCats = await this.prisma.contentCategory.findMany({
        where: { parentId: null, isArchived: false },
        orderBy: { displayOrder: 'asc' },
        include: { translations: { include: { language: true } } },
      });
      if (rootCats && rootCats.length > 0) {
        const targetLang = (lang || 'en').toLowerCase().trim();
        const mapped = rootCats.map((cat) => {
          const trans = cat.translations.find((t: any) => t.language?.code === targetLang) || cat.translations[0];
          return {
            id: cat.slug,
            serviceId: cat.slug,
            title: trans?.title || cat.slug,
            sub: trans?.description || '',
            icon: 'Sparkles',
            url: '/subcategories',
            artwork: '',
            displayOrder: cat.displayOrder,
            isActive: true,
          };
        });
        return {
          success: true,
          data: mapped,
          count: mapped.length,
        };
      }
    } catch (err: any) {
      console.warn('[Categories] content_categories fallback notice:', err?.message || err);
    }

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
        message: `Devotional service '${id}' not found.`,
      };
    }
    return {
      success: true,
      data: service,
    };
  }

  @Get()
  async getCategories(@Query('lang') lang = 'en', @Query('search') search?: string) {
    const targetLang = (lang || 'en').toLowerCase().trim();

    try {
      const where: any = {
        parentId: null,
        isArchived: false,
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

  // 1b. Stotras Public API List (filtered by parent stotras, strictly from DB)
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
      const candidates = await this.prisma.contentCategory.findMany({
        where: {
          isArchived: false,
          OR: [
            { slug: 'stotras' },
            { slug: 'slogans-of-sri-ayyappa-swami' },
            { id: 114 },
            { id: 4 },
          ],
        },
        select: { id: true },
      });
      const parentIds = candidates.length > 0 ? candidates.map((c) => c.id) : [114, 4];

      const where: any = {
        parentId: { in: parentIds },
        isArchived: false,
      };

      if (search && search.trim() !== '') {
        const q = search.trim();
        where.AND = [
          {
            OR: [
              { slug: { contains: q } },
              { translations: { some: { title: { contains: q } } } },
            ],
          },
        ];
      }

      const [totalRecords, items, customImages, dbDeities] = await Promise.all([
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
              orderBy: { displayOrder: 'asc' },
            },
          },
        }),
        this.getCustomImagesMap(),
        this.getDbDeities(),
      ]);

      const data = items.map((cat) => {
        const preferred =
          cat.translations.find((t: any) => t.language?.code === targetLang) ||
          cat.translations.find((t: any) => t.language?.code === 'te') ||
          cat.translations[0];
        const titleFormatted = cat.slug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
        const devContent = cat.devotionalContents[0];
        const verseCount = devContent && devContent.sacredText ? devContent.sacredText.split(/\n\s*\n/).length : 0;
        const resolvedDeity = this.resolveDeityFromDb(cat.slug, preferred?.title || '', dbDeities);

        return {
          id: String(cat.id),
          slug: cat.slug,
          title: preferred?.title || titleFormatted,
          description: preferred?.description || '',
          deityName: resolvedDeity.deityName,
          deityId: resolvedDeity.deityId,
          verseCount,
          isPublished: devContent ? devContent.isPublished : true,
          displayOrder: cat.displayOrder,
          imageUrl: customImages[String(cat.id)] || customImages[cat.slug] || null,
          badge: 'Stotra',
          updatedAt: cat.updatedAt,
        };
      });

      return {
        success: true,
        data,
        meta: {
          page: pageNum,
          limit: take,
          totalRecords,
          totalPages: Math.ceil(totalRecords / take),
        },
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
      const [category, customImages] = await Promise.all([
        this.prisma.contentCategory.findFirst({
          where: whereClause,
          include: {
            translations: { include: { language: true } },
            devotionalContents: {
              where: { isPublished: true },
              orderBy: { displayOrder: 'asc' },
            },
          },
        }),
        this.getCustomImagesMap(),
      ]);

      if (category) {
        const preferred =
          category.translations.find((t: any) => t.language?.code === targetLang) ||
          category.translations.find((t: any) => t.language?.code === 'te') ||
          category.translations[0];
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
            imageUrl: customImages[String(category.id)] || customImages[category.slug] || null,
          },
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
      let targetParentIds: number[] = [];

      if (parentKey && parentKey !== 'all') {
        const parsed = parseInt(parentKey, 10);
        if (!isNaN(parsed) && parsed > 0) {
          targetParentIds = [parsed];
        } else {
          const lower = parentKey.toLowerCase().trim();
          const cleanKey = lower
            .replace(/^daily-/, '')
            .replace(/-vidhanam$/, '')
            .replace(/-services$/, '')
            .replace(/-songs$/, '');
          try {
            const matches = await this.prisma.contentCategory.findMany({
              where: {
                isArchived: false,
                OR: [
                  { slug: parentKey },
                  { slug: lower },
                  { slug: cleanKey },
                  { slug: { contains: cleanKey } },
                  { translations: { some: { title: { contains: parentKey } } } },
                  { translations: { some: { title: { contains: cleanKey } } } },
                  ...(lower === 'daily-slokas' || lower.includes('sloka') ? [{ slug: 'slokas' }, { id: 115 }] : []),
                  ...(lower === 'songs' || lower === 'bhajans' || lower.includes('bhajan') ? [{ slug: 'harathis' }, { id: 116 }] : []),
                ],
              },
              select: { id: true },
            });
            if (matches.length > 0) {
              targetParentIds = matches.map((m) => m.id);
            }
          } catch (_) {}
        }
      }

      // If a specific parent was requested but not found in DB, return empty list (never leak all subcategories)
      if (parentKey && parentKey !== 'all' && targetParentIds.length === 0) {
        return {
          success: true,
          data: [],
          total: 0,
          count: 0,
          page: 1,
          limit: 100,
        };
      }

      const where: any = {
        isArchived: false,
      };

      if (targetParentIds.length > 0) {
        where.parentId = { in: targetParentIds };
      } else {
        where.parentId = { not: null };
      }

      const [items, customImages, dbDeities] = await Promise.all([
        this.prisma.contentCategory.findMany({
          where,
          orderBy: { displayOrder: 'asc' },
          include: {
            parent: { include: { translations: { include: { language: true } } } },
            translations: { include: { language: true } },
            devotionalContents: { select: { id: true, title: true, isPublished: true } },
            subcategories: { select: { id: true } },
          },
        }),
        this.getCustomImagesMap(),
        this.getDbDeities(),
      ]);

      if (items && items.length > 0) {
        let mappedItems = items.map((cat) => {
          const preferred = cat.translations.find((t: any) => t.language?.code === targetLang) || cat.translations[0];
          const parentPref = cat.parent?.translations?.find((t: any) => t.language?.code === targetLang) || cat.parent?.translations?.[0];
          const pSlug = cat.parent?.slug || 'pooja';
          const resolvedImage = customImages[String(cat.id)] || customImages[cat.slug] || null;

          const titleFormatted = cat.slug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
          const finalTitle = preferred?.title && preferred.title !== cat.slug ? preferred.title : titleFormatted;
          const deityResolved = this.resolveDeityFromDb(cat.slug, finalTitle, dbDeities);

          // Pure database-driven count: actual devotional contents or child subcategories from DB
          const count = cat.devotionalContents?.length || cat.subcategories?.length || 0;
          const stepsCount = count > 0 ? `${count} Steps` : null;

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
            duration: null,
            stepsCount,
            badge: null,
            badgeClass: null,
            filterTag: null,
            deityId: deityResolved.deityId,
            deityName: deityResolved.deityName,
            type: cat.isAudio
              ? 'Audio / Bhajan'
              : pSlug === 'pooja'
              ? 'Pooja'
              : pSlug === 'stotras'
              ? 'Stotra'
              : pSlug === 'slokas'
              ? 'Sloka'
              : 'Song',
          };
        });

        // 1. Server-side Deity Filtering
        if (deity && deity !== 'all') {
          const normDeity = deity.toLowerCase().replace(/^(lord-|goddess-)/, '');
          mappedItems = mappedItems.filter((item) => {
            const itemD = (item.deityId || '').toLowerCase().replace(/^(lord-|goddess-)/, '');
            const itemSlug = (item.slug || '').toLowerCase();
            const itemTitle = (item.title || '').toLowerCase();
            const pSlug = (item.parentSlug || '').toLowerCase();
            const pTitle = (item.parentTitle || '').toLowerCase();

            // Universal all-deity daily slokas (like Morning, Meal, Night Prayers, Nithya Paarayana)
            const isUniversal =
              itemSlug.includes('nithya-paarayana') ||
              itemSlug.includes('morning-prayers') ||
              itemSlug.includes('meal-prayers') ||
              itemSlug.includes('night-prayers') ||
              itemD === 'all' ||
              itemSlug === 'nithya-paarayana-shlokamulu';

            return (
              isUniversal ||
              itemD === normDeity ||
              itemSlug.includes(normDeity) ||
              itemTitle.includes(normDeity) ||
              pSlug.includes(normDeity) ||
              pTitle.includes(normDeity) ||
              (normDeity === 'ayyappa' && (itemSlug.includes('poorvaang') || itemTitle.includes('పూర్వాంగ') || itemSlug.includes('maaladharan') || itemTitle.includes('మాలాధారణ') || itemSlug.includes('ayyap') || itemTitle.includes('అయ్యప్ప') || itemSlug.includes('harivarasanam') || itemTitle.includes('హరివరాసనం') || itemSlug.includes('padi') || itemTitle.includes('పడి') || itemSlug.includes('sastha') || itemTitle.includes('శాస్త') || itemSlug.includes('suprabatham') || itemTitle.includes('సుప్రభాతం') || itemD === 'ayyappa')) ||
              ((normDeity === 'vishnu' || normDeity === 'venkateswara') && (itemD === 'venkateswara' || itemSlug.includes('satyanarayana') || itemTitle.includes('సత్యనారాయణ') || itemSlug.includes('venkat') || itemTitle.includes('వేంకట') || itemSlug.includes('suprabhat') || itemSlug.includes('guruvayoor') || itemTitle.includes('గురువాయూరప్ప') || itemSlug.includes('tulasi') || itemTitle.includes('తులసి'))) ||
              (normDeity === 'ganesha' && (itemD === 'ganesha' || itemSlug.includes('vinayak') || itemTitle.includes('వినాయక') || itemSlug.includes('ganapathi') || itemTitle.includes('గణపతి') || itemSlug.includes('pancharatnam') || itemSlug.includes('vignesh') || itemSlug.includes('vighnesh') || itemTitle.includes('విఘ్నేశ్వర') || itemTitle.includes('మహాగణపతి') || itemSlug.includes('mahaganapathi'))) ||
              (normDeity === 'devi' && (itemD === 'devi' || itemSlug.includes('varalakshmi') || itemTitle.includes('వరలక్ష్మి') || itemSlug.includes('lakshmi') || itemTitle.includes('లక్ష్మి') || itemSlug.includes('devi') || itemTitle.includes('దేవి') || itemSlug.includes('karagre') || itemSlug.includes('dandaal') || itemTitle.includes('దండాల') || itemSlug.includes('akhiland') || itemTitle.includes('అఖిలాండ') || itemSlug.includes('amba') || itemTitle.includes('అంబ'))) ||
              (normDeity === 'shiva' && (itemD === 'shiva' || itemSlug.includes('kedar') || itemTitle.includes('కేదార') || itemSlug.includes('rudra') || itemTitle.includes('రుద్ర') || itemSlug.includes('shiva') || itemTitle.includes('శివ') || itemSlug.includes('linga') || itemSlug.includes('tandava') || itemSlug.includes('umamaheshwara') || itemTitle.includes('ఉమామహేశ్వర'))) ||
              (normDeity === 'hanuman' && (itemD === 'hanuman' || itemSlug.includes('hanuman') || itemTitle.includes('హనుమాన్') || itemSlug.includes('chalisa') || itemSlug.includes('anjaneya') || itemTitle.includes('ఆంజనేయ'))) ||
              (normDeity === 'murugan' && (itemD === 'murugan' || itemSlug.includes('murugan') || itemSlug.includes('subrahmanya') || itemSlug.includes('subramanya') || itemTitle.includes('సుబ్రహ్మణ్య') || itemSlug.includes('kanda') || itemSlug.includes('sashti') || itemTitle.includes('స్కంద') || itemTitle.includes('షష్ఠి') || itemSlug.includes('kartikeya') || itemTitle.includes('కార్తికేయ') || itemSlug.includes('pazhani') || itemSlug.includes('palani') || itemTitle.includes('పళని') || itemSlug.includes('udipi') || itemTitle.includes('ఉడిపి')))
            );
          });
        }

        // 2. Server-side Search Filtering
        if (search && search.trim() !== '') {
          const q = search.trim().toLowerCase();
          mappedItems = mappedItems.filter((item) => {
            return (
              item.title.toLowerCase().includes(q) ||
              item.desc.toLowerCase().includes(q) ||
              item.slug.toLowerCase().includes(q) ||
              item.deityName.toLowerCase().includes(q)
            );
          });
        }

        // 3. Server-side Category / Badge Filter
        if (filter && filter !== 'All') {
          mappedItems = mappedItems.filter((item) => {
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
          limit: limitNum,
        };
      }
    } catch (err) {
      console.warn('[Categories] getSubcategories error:', err);
    }

    return {
      success: true,
      data: [],
      total: 0,
      count: 0,
    };
  }

  // 1c-detail. Devotional Subcategory Detail Endpoint (100% DB-driven)
  @Get('subcategories/:slugOrId')
  async getSubcategoryDetail(
    @Param('slugOrId') slugOrId: string,
    @Query('lang') lang = 'en',
    @Query('god') god?: string
  ) {
    const targetLang = (lang || 'en').toLowerCase().trim();
    const isNum = !isNaN(Number(slugOrId));

    const orWhere: any[] = [];
    if (isNum) orWhere.push({ id: Number(slugOrId) });
    orWhere.push({ slug: slugOrId });

    try {
      const [category, customImages, dbDeities] = await Promise.all([
        this.prisma.contentCategory.findFirst({
          where: { OR: orWhere },
          include: {
            parent: {
              include: {
                translations: { include: { language: true } },
              },
            },
            translations: { include: { language: true } },
            devotionalContents: {
              where: { isPublished: true },
              orderBy: { displayOrder: 'asc' },
            },
            subcategories: {
              where: { isArchived: false },
              orderBy: { displayOrder: 'asc' },
              include: {
                translations: { include: { language: true } },
              },
            },
          },
        }),
        this.getCustomImagesMap(),
        this.getDbDeities(),
      ]);

      if (!category) {
        return {
          success: false,
          message: `Subcategory "${slugOrId}" not found in database.`,
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

      const deityResolved = this.resolveDeityFromDb(rawSlug, finalTitle, dbDeities);
      const resolvedImage = customImages[String(category.id)] || customImages[rawSlug] || null;

      const prefDesc = preferred?.description || '';
      const teDesc = teTranslation?.description || '';
      const enDesc = enTranslation?.description || '';

      // If preferred description is short (< 150 chars) and Telugu has full lyrics/scripture, use the rich Telugu lyrics
      let fullScriptureText = prefDesc;
      if ((!prefDesc || prefDesc.length < 150) && teDesc && teDesc.length >= 150) {
        fullScriptureText = teDesc;
      }

      // Extract instruction note if present in DB text
      let instructionNote = '';
      const checkText = fullScriptureText || teDesc;
      if (checkText.includes('సూచన :') || checkText.includes('సూచన:')) {
        const parts = checkText.split(/\n\s*\n/);
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
                const secTitle = headerMatch ? headerMatch[1].trim() : (dc.title || `Step ${sIdx + 1}`);
                const secBody = sec.replace(/\[\s*[^\]]+\s*\]/, '').trim();
                procedure.push({
                  step: procedure.length + 1,
                  title: secTitle,
                  desc: dc.meaning || '',
                  mantra: secBody,
                });
                mantras.push({
                  title: secTitle,
                  script: secBody,
                  transliteration: '',
                  meaning: dc.meaning || '',
                });
              });
            } else {
              procedure.push({
                step: procedure.length + 1,
                title: dc.title || `Step ${procedure.length + 1}`,
                desc: dc.meaning || '',
                mantra: dc.sacredText,
              });
              mantras.push({
                title: dc.title || `Mantra ${mantras.length + 1}`,
                script: dc.sacredText,
                transliteration: '',
                meaning: dc.meaning || '',
              });
            }
          }
        });
      }

      // Resolve child subcategories strictly from database
      let children: any[] = [];
      if (category.subcategories && category.subcategories.length > 0) {
        children = category.subcategories.map((ch: any) => {
          const chPref = ch.translations?.find((t: any) => t.language?.code === targetLang) || ch.translations?.[0];
          return {
            id: String(ch.id),
            slug: ch.slug,
            title: chPref?.title || ch.slug,
            description: chPref?.description || '',
            imageUrl: customImages[String(ch.id)] || customImages[ch.slug] || resolvedImage,
          };
        });
      }

      // If no child subcategories, use devotionalContents for child types
      if (children.length === 0 && category.devotionalContents && category.devotionalContents.length > 0) {
        children = category.devotionalContents.map((dc: any, idx: number) => ({
          id: String(dc.id),
          slug: dc.slug || String(dc.id),
          title: dc.title || `Item ${idx + 1}`,
          description: dc.meaning || '',
          imageUrl: dc.audioUrl || resolvedImage,
        }));
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
          subtitle: (prefDesc || teDesc)?.split('\n')[0]?.slice(0, 150) || '',
          overview: fullScriptureText,
          description: fullScriptureText,
          fullScriptureText,
          lyrics: teDesc || fullScriptureText,
          descriptionTelugu: teDesc,
          descriptionEnglish: enDesc,
          instructionNote,
          heroImage: resolvedImage,
          badge: '',
          badgeClass: '',
          duration: '',
          difficulty: '',
          bestTime: '',
          deityId: deityResolved.deityId,
          deityName: deityResolved.deityName,
          deityTelugu: deityResolved.deityTelugu,
          children,
          procedure,
          materials: [],
          mantras,
          benefits: [],
          audioTrack: null,
        },
      };
    } catch (err) {
      console.warn('[Categories] getSubcategoryDetail error:', err);
    }

    return {
      success: false,
      message: `Subcategory ${slugOrId} not found`,
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
      update: { value: JSON.stringify(customImages) },
    });

    return {
      success: true,
      message: `Image stored successfully for subcategory ${id}`,
      data: { id, imageUrl: body.imageUrl },
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
      update: { value: JSON.stringify(customImages) },
    });

    return {
      success: true,
      message: 'Subcategory images stored successfully',
      count: Object.keys(customImages).length,
      data: customImages,
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
          devotionalContents: { select: { id: true, slug: true, title: true, isPublished: true } },
        },
      }),
      this.prisma.contentTranslation.count(),
      this.prisma.devotionalContent.count(),
      this.prisma.language.findMany(),
    ]);

    return {
      success: true,
      message: 'Seed data retrieved successfully from DB',
      data: {
        totalSubcategories: subcategories.length,
        translationsCount,
        devotionalContentsCount,
        languages,
        subcategories: subcategories.map((s) => ({
          id: s.id,
          slug: s.slug,
          parentSlug: s.parent?.slug,
          displayOrder: s.displayOrder,
          translations: s.translations.map((t) => ({ lang: t.language.code, title: t.title })),
          devotionalContentsCount: s.devotionalContents?.length || 0,
        })),
      },
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
        where: { key: 'deities' },
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

      const customImages = await this.getCustomImagesMap();
      const customImg = customImages[String(category.id)] || customImages[category.slug] || null;

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
        imageUrl: customImg,
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
