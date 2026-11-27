import { Controller, Get, Param, Query } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Controller('home')
export class HomeController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('ticker')
  async getTicker(@Query('lang') lang = 'te') {
    // 1. Try unified devotional_ticker from Admin Console
    const mainTicker = await this.prisma.appSetting.findUnique({
      where: { key: 'devotional_ticker' },
    });

    if (mainTicker && mainTicker.value) {
      return { text: mainTicker.value };
    }

    // 2. Try language-specific setting
    const langTicker = await this.prisma.appSetting.findUnique({
      where: { key: `ticker_mantra_${lang}` },
    });

    if (langTicker && langTicker.value) {
      return { text: langTicker.value };
    }

    return { text: '🕉️ స్వామియే శరణం అయ్యప్ప — శ్రీ అయ్యప్ప స్వామి నిత్య పూజా విధానం, అష్టోత్తరం, హరివరాసనం మరియు సమగ్ర శబరిమల యాత్రా దర్శిని 🕉️' };
  }

  // Public App Logo & Brand Identity Endpoint for Website, Admin, and Mobile Apps
  @Get('logo')
  async getAppLogo() {
    const defaultSettings: Record<string, string> = {
      app_logo: '/images/saranam-ayyappa-official-emblem.jpg',
      app_title: 'Saranam Ayyappa',
      app_tagline: 'Connect.. Pray.. Serve..',
      app_description: 'A sacred digital sanctuary and comprehensive devotional guide for Lord Ayyappa devotees and Dharma Karthas worldwide.',
      theme_primary_color: '#06452E',
      theme_secondary_color: '#CAA049',
      app_play_store_url: 'https://play.google.com/store/apps/details?id=com.saranamayyappa.app',
      app_app_store_url: 'https://apps.apple.com/app/saranam-ayyappa/id123456789',
      app_store_subtext: 'Available on iOS & Android',
      app_footer_desc: 'Experience daily darshan, audio bhajans, Panchangam alerts & sacred pooja vidhanam on your mobile.',
      social_youtube_url: 'https://www.youtube.com/@SaranamAyyappaOfficial',
      social_telegram_url: 'https://t.me/saranam_ayyappa_satsang',
      social_instagram_url: 'https://www.instagram.com/saranamayyappa_official',
      social_facebook_url: 'https://www.facebook.com/saranamayyappaportal',
      social_whatsapp_url: 'https://whatsapp.com/channel/saranamayyappa',
    };

    let settingsMap: Record<string, string> = { ...defaultSettings };

    try {
      const settings = await this.prisma.appSetting.findMany({
        where: {
          key: {
            in: Object.keys(defaultSettings)
          }
        }
      });

      settings.forEach(s => {
        if (s.value) settingsMap[s.key] = s.value;
      });
    } catch (dbErr) {
      // Fallback cleanly to defaultSettings if database is reconnecting
    }

    const rawLogo = settingsMap['app_logo'];
    let logoUrl = '/images/saranam-ayyappa-official-emblem.jpg';

    if (rawLogo) {
      if (rawLogo.startsWith('http://') || rawLogo.startsWith('https://') || rawLogo.startsWith('data:')) {
        logoUrl = rawLogo;
      } else if (rawLogo.startsWith('/images/')) {
        logoUrl = rawLogo;
      } else if (rawLogo.startsWith('/uploads/') || rawLogo.startsWith('uploads/')) {
        const cleanUpload = rawLogo.startsWith('/') ? rawLogo : `/${rawLogo}`;
        logoUrl = `https://backendapis.saranamayyappa.in${cleanUpload}`;
      } else {
        logoUrl = rawLogo.startsWith('/') ? rawLogo : `/${rawLogo}`;
      }
    }
    return {
      success: true,
      logoUrl,
      title: settingsMap['app_title'] || 'Saranam Ayyappa',
      appName: `${settingsMap['app_title'] || 'Saranam Ayyappa'} App`,
      tagline: settingsMap['app_tagline'] || 'Connect.. Pray.. Serve..',
      description: settingsMap['app_description'] || defaultSettings.app_description,
      primaryColor: settingsMap['theme_primary_color'] || '#06452E',
      secondaryColor: settingsMap['theme_secondary_color'] || '#CAA049',
      playStoreUrl: settingsMap['app_play_store_url'] || defaultSettings.app_play_store_url,
      appStoreUrl: settingsMap['app_app_store_url'] || defaultSettings.app_app_store_url,
      storeSubtext: settingsMap['app_store_subtext'] || defaultSettings.app_store_subtext,
      footerAppDesc: settingsMap['app_footer_desc'] || defaultSettings.footerAppDesc,
      socialLinks: {
        youtube: settingsMap['social_youtube_url'] || defaultSettings.social_youtube_url,
        telegram: settingsMap['social_telegram_url'] || defaultSettings.social_telegram_url,
        instagram: settingsMap['social_instagram_url'] || defaultSettings.social_instagram_url,
        facebook: settingsMap['social_facebook_url'] || defaultSettings.social_facebook_url,
        whatsapp: settingsMap['social_whatsapp_url'] || defaultSettings.social_whatsapp_url,
      },
      updatedAt: new Date()
    };
  }

  // Dedicated App Download & Store Links Endpoint
  @Get('app-links')
  async getAppLinks() {
    return this.getAppLogo();
  }

  // Public Devotional Social Media & Community Handles from DB
  @Get('social-links')
  async getSocialLinks() {
    const map: Record<string, string> = {
      social_youtube_url: 'https://www.youtube.com/@SaranamAyyappaOfficial',
      social_telegram_url: 'https://t.me/saranam_ayyappa_satsang',
      social_whatsapp_url: 'https://whatsapp.com/channel/saranamayyappa',
      social_instagram_url: 'https://www.instagram.com/saranamayyappa_official',
      social_facebook_url: 'https://www.facebook.com/saranamayyappaportal',
      app_title: 'Saranam Ayyappa',
      app_tagline: 'Connect.. Pray.. Serve..',
    };

    try {
      const settings = await this.prisma.appSetting.findMany({
        where: {
          key: {
            in: [
              'social_youtube_url',
              'social_telegram_url',
              'social_whatsapp_url',
              'social_instagram_url',
              'social_facebook_url',
              'app_title',
              'app_tagline'
            ]
          }
        }
      });

      settings.forEach(s => {
        if (s.value) map[s.key] = s.value;
      });
    } catch (dbErr) {
      // Fallback cleanly
    }

    const list: Array<{ id: string; name: string; title: string; url: string; icon: string; isShare?: boolean }> = [];

    // 1. YouTube Channel
    if (map['social_youtube_url']) {
      list.push({
        id: 'youtube',
        name: 'YouTube',
        title: 'YouTube Devotional Channel',
        url: map['social_youtube_url'],
        icon: 'Youtube'
      });
    }

    // 2. Telegram Devotee Satsang
    if (map['social_telegram_url']) {
      list.push({
        id: 'telegram',
        name: 'Telegram',
        title: 'Telegram Devotee Satsang',
        url: map['social_telegram_url'],
        icon: 'Send'
      });
    }

    // 3. WhatsApp Channel
    if (map['social_whatsapp_url']) {
      list.push({
        id: 'whatsapp',
        name: 'WhatsApp',
        title: 'WhatsApp Channel',
        url: map['social_whatsapp_url'],
        icon: 'MessageSquare'
      });
    }

    // 4. Devotee Native Sharing Option
    list.push({
      id: 'share',
      name: 'Share',
      title: 'Share with Devotees',
      url: '',
      icon: 'Share2',
      isShare: true
    });

    return {
      success: true,
      data: list,
      links: {
        youtube: map['social_youtube_url'] || '',
        telegram: map['social_telegram_url'] || '',
        whatsapp: map['social_whatsapp_url'] || '',
        instagram: map['social_instagram_url'] || '',
        facebook: map['social_facebook_url'] || ''
      }
    };
  }

  // Public Temple Types Endpoint for Website & Dharma Kartha Portals
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

  // Public Categories & Devotional Services Endpoint from DB
  @Get('services')
  async getDevotionalServices(@Query('search') search?: string) {
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
              image: item.image || '',
              artwork: item.artwork || '',
              displayOrder: item.displayOrder,
            })),
            count: items.length,
          };
        }
      }
    } catch (e) {
      console.warn('[Home] getDevotionalServices database error:', e);
    }

    // Check dynamic app_settings for category_services in database
    try {
      const setting = await this.prisma.appSetting.findUnique({
        where: { key: 'category_services' }
      });
      if (setting && setting.value) {
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
      }
    } catch {}

    // Strictly fetched from DB: return empty array if no data exists in database
    return {
      success: true,
      data: [],
      count: 0,
    };
  }

  // Public Notification endpoints for website and mobile app
  @Get('notifications')
  async getPublicNotifications(@Query('audience') audience = 'ALL') {
    const setting = await this.prisma.appSetting.findUnique({
      where: { key: 'broadcast_notifications' }
    });

    let list: any[] = [];
    if (setting && setting.value) {
      try {
        list = JSON.parse(setting.value);
      } catch {
        list = [];
      }
    }

    if (audience !== 'ALL') {
      list = list.filter(n => n.targetAudience === 'ALL' || n.targetAudience === audience);
    }

    return {
      success: true,
      data: list,
      count: list.length
    };
  }

  // Public CMS endpoints for website and mobile app
  @Get('cms')
  async getAllCms(@Query('lang') lang = 'te') {
    return this.prisma.appSetting.findMany({
      where: {
        key: { in: ['about_us', 'terms_conditions', 'privacy_policy', 'refund_policy', 'sabarimala_guidelines', 'contact_us'] }
      }
    });
  }

  @Get('cms/:key')
  async getCmsByKey(@Param('key') key: string, @Query('lang') lang = 'te') {
    // 1. Check for language-specific key first in DB (e.g. terms_conditions_te)
    const localizedSetting = await this.prisma.appSetting.findUnique({
      where: { key: `${key}_${lang}` }
    });
    if (localizedSetting) {
      return localizedSetting;
    }

    // 2. Check general key in DB
    const generalSetting = await this.prisma.appSetting.findUnique({
      where: { key }
    });
    if (generalSetting) {
      return generalSetting;
    }

    // 3. Fallback to multilingual default CMS dictionary
    const defaults = CMS_DEFAULTS[key]?.[lang] || CMS_DEFAULTS[key]?.['en'];
    if (defaults) {
      return {
        key: `${key}_${lang}`,
        value: defaults.content,
        description: defaults.title,
        updatedAt: new Date(),
      };
    }

    return null;
  }
}

const CMS_DEFAULTS: Record<string, Record<string, { title: string; content: string }>> = {
  terms_conditions: {
    te: {
      title: 'నిబంధనలు & షరతులు',
      content: 'శరణం అయ్యప్ప భక్తి పోర్టల్‌కు స్వాగతం. ఈ అప్లికేషన్‌ను ఉపయోగించడం ద్వారా, మీరు ఆలయ నిబంధనలు మరియు ఆధ్యాత్మిక ప్రవర్తనా నియమావళికి కట్టుబడి ఉండటానికి అంగీకరిస్తున్నారు. నిత్య పూజా విధానాలు, పంచాంగం, మరియు స్తోత్రాలు భక్తుల ఆధ్యాత్మిక జ్ఞానోదయం కోసం అందించబడ్డాయి. భక్తులు ఈ సేవలను పవిత్రంగా, భక్తిశ్రద్ధలతో వినియోగించాలి.',
    },
    kn: {
      title: 'ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳು',
      content: 'ಶರಣಂ ಅಯ್ಯಪ್ಪ ಭಕ್ತಿ ಪೋರ್ಟಲ್‌ಗೆ ಸುಸ್ವಾಗತ. ಈ ಅಪ್ಲಿಕೇಶನ್ ಬಳಸುವ ಮೂಲಕ, ನೀವು ದೇವಾಲಯದ ನಿಯಮಗಳು ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ನಡತೆಯ ಸಂಹಿತೆಗೆ ಬದ್ಧರಾಗಿರಲು ಒಪ್ಪುತ್ತೀರಿ. ನಿತ್ಯ ಪೂಜೆ ವಿಧಾನಗಳು, ಪಂಚಾಂಗ ಮತ್ತು ಸ್ತೋತ್ರಗಳನ್ನು ಭಕ್ತರ ಆಧ್ಯಾತ್ಮಿಕ ಜ್ಞಾನೋದಯಕ್ಕಾಗಿ ಒದಗಿಸಲಾಗಿದೆ.',
    },
    en: {
      title: 'Terms & Conditions',
      content: 'Welcome to Saranam Ayyappa Devotional Portal. By using this application, you agree to comply with and be bound by all temple terms and spiritual code of conduct. All devotional hymns, Panchangam calculations, and pooja procedures are provided for spiritual enlightenment. Devotees must use the portal respectfully.',
    },
    ta: {
      title: 'விதிமுறைகள் மற்றும் நிபந்தனைகள்',
      content: 'சரணம் ஐயப்பா பக்தி போர்ட்டலுக்கு நல்வரவு. இந்த செயலியைப் பயன்படுத்துவதன் மூலம், ஆலய விதிமுறைகள் மற்றும் ஆன்மீக நடத்தை விதிகளைப் பின்பற்ற ஒப்புக்கொள்கிறீர்கள். தினசரி பூஜை முறைகள், பஞ்சாங்கம் மற்றும் துதிகள் பக்தர்களின் ஆன்மீக மேம்பாட்டிற்காக வழங்கப்படுகின்றன.',
    },
    hi: {
      title: 'नियम एवं शर्तें',
      content: 'शरणम् अय्यप्पा भक्ति पोर्टल में आपका स्वागत है। इस एप्लिकेशन का उपयोग करके, आप मंदिर के नियमों और आध्यात्मिक आचार संहिता का पालन करने के लिए सहमत होते हैं। दैनिक पूजा विधान, पंचांग और स्तोत्र भक्तों के आध्यात्मिक लाभ के लिए प्रदान किए गए हैं।',
    },
  },
  privacy_policy: {
    te: {
      title: 'గోప్యతా విధానం',
      content: 'మీ భక్తి గోప్యత మాకు అత్యంత పవిత్రమైనది. శరణం అయ్యప్ప యాప్ భక్తుల ప్రాథమిక వివరాలు (పేరు, మొబైల్ నంబర్ మరియు జన్మ నక్షత్రం) మాత్రమే నిత్య ఆధ్యాత్మిక రిమైండర్‌లు మరియు పూజా వివరాలను అందించడానికి సేకరిస్తుంది. మేము మీ భక్తి సమాచారాన్ని ఎటువంటి మూడవ పక్షాలకూ విక్రయించము లేదా పంచుకోము.',
    },
    kn: {
      title: 'ಗೌಪ್ಯತಾ ನೀತಿ',
      content: 'ನಿಮ್ಮ ಆಧ್ಯಾತ್ಮಿಕ ಗೌಪ್ಯತೆಯು ನಮಗೆ ಅತ್ಯಂತ ಪವಿತ್ರವಾಗಿದೆ. ಶರಣಂ ಅಯ್ಯಪ್ಪ ಕೇವಲ ಮೂಲ ಭಕ್ತರ ನೋಂದಣಿ ವಿವರಗಳನ್ನು (ಹೆಸರು, ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಮತ್ತು ಐಚ್ಛಿಕ ಜನ್ಮ ನಕ್ಷತ್ರ) ದೈನಂದಿನ ಆಧ್ಯಾತ್ಮಿಕ ಜ್ಞಾಪನೆಗಳಿಗಾಗಿ ಮಾತ್ರ ಸಂಗ್ರಹಿಸುತ್ತದೆ. ನಿಮ್ಮ ಭಕ್ತಿ ಡೇಟಾವನ್ನು ನಾವು ಯಾವುದೇ ಮೂರನೇ ವ್ಯಕ್ತಿಗಳೊಂದಿಗೆ ಹಂಚಿಕೊಳ್ಳುವುದಿಲ್ಲ.',
    },
    en: {
      title: 'Privacy Policy',
      content: 'Your spiritual privacy is sacred to us. Saranam Ayyappa only collects basic devotee registration details (name, phone number, and optional devotional birth star) to personalize daily spiritual reminders. We never sell, lease, or monetize your devotional data with third parties.',
    },
    ta: {
      title: 'தனியுரிமைக் கொள்கை',
      content: 'உங்கள் ஆன்மீகத் தனியுரிமை எங்களுக்கு மிகவும் புனிதமானது. சரணம் ஐயப்பா செயலி அடிப்படை பக்தர் விவரங்களை (பெயர், கைபேசி எண் மற்றும் விருப்பப்படி ஜென்ம நட்சத்திரம்) மட்டுமே தினசரி ஆன்மீக நினைவூட்டல்களுக்காகச் சேகரிக்கிறது. உங்கள் தகவல்களை எந்த மூன்றாம் தரப்பினருடனும் பகிர்ந்து கொள்ள மாட்டோம்.',
    },
    hi: {
      title: 'गोपनीयता नीति',
      content: 'आपकी आध्यात्मिक गोपनीयता हमारे लिए अत्यंत पवित्र है। शरणम् अय्यप्पा केवल बुनियादी भक्त पंजीकरण विवरण (नाम, मोबाइल नंबर और वैकल्पिक जन्म नक्षत्र) दैनिक आध्यात्मिक अनुस्मारक के लिए एकत्र करता है। हम आपका डेटा कभी किसी तीसरे पक्ष के साथ साझा नहीं करते हैं।',
    },
  },
  about_us: {
    te: {
      title: 'శరణం అయ్యప్ప గురించి',
      content: 'శరణం అయ్యప్ప ప్రపంచవ్యాప్తంగా ఉన్న శ్రీ అయ్యప్ప స్వామి భక్తుల కోసం ప్రత్యేకంగా రూపొందించబడిన దివ్య ఆధ్యాత్మిక వేదిక. నిత్య పంచాంగం, హరివరాసనం ఆడియో, 18 పవిత్ర మెట్ల మార్గదర్శకం మరియు 5 భాషలలో సంపూర్ణ పూజా విధానాలను భక్తితో అందిస్తోంది.',
    },
    kn: {
      title: 'ಶರಣಂ ಅಯ್ಯಪ್ಪ ಬಗ್ಗೆ',
      content: 'ಶರಣಂ ಅಯ್ಯಪ್ಪ ಪ್ರಪಂಚದಾದ್ಯಂತವಿರುವ ಶ್ರೀ ಅಯ್ಯಪ್ಪ ಸ್ವಾಮಿ ಭಕ್ತರಿಗಾಗಿ ರಚಿಸಲಾದ ದಿವ್ಯ ಆಧ್ಯಾತ್ಮಿಕ ವೇದಿಕೆ. ನಿತ್ಯ ಪಂಚಾಂಗ, ಹರಿವರಾಸನಂ ಆಡಿಯೋ, 18 ಪವಿತ್ರ ಮೆಟ್ಟಿಲುಗಳ ಮಾರ್ಗದರ್ಶನ ಮತ್ತು 5 ಭಾಷೆಗಳಲ್ಲಿ ಪೂಜಾ ವಿಧಾನಗಳನ್ನು ಒದಗಿಸುತ್ತದೆ.',
    },
    en: {
      title: 'About Saranam Ayyappa',
      content: 'Saranam Ayyappa is a dedicated spiritual companion for Lord Ayyappa Swami devotees worldwide. Providing daily authentic Panchangam, Harivarasanam audio, 18 Holy Steps guidance, and sacred pooja procedures across 5 languages.',
    },
    ta: {
      title: 'சரணம் ஐயப்பா பற்றி',
      content: 'சரணம் ஐயப்பா என்பது உலகெங்கிலும் உள்ள ஐயப்ப பக்தர்களுக்கான பிரத்யேக ஆன்மீகத் தளம். தினசரி பஞ்சாங்கம், ஹரிவராசனம் ஆடியோ, 18 புனிதப் படிகள் வழிகாட்டுதல் மற்றும் 5 மொழிகளில் பூஜை முறைகளை வழங்குகிறது.',
    },
    hi: {
      title: 'शरणम् अय्यप्पा के बारे में',
      content: 'शरणम् अय्यप्पा दुनिया भर के भगवान अय्यप्पा स्वामी भक्तों के लिए समर्पित एक पावन आध्यात्मिक मंच है। दैनिक प्रामाणिक पंचांग, हरिवरासनम् ऑडियो, 18 पवित्र सीढ़ियों का मार्गदर्शन और 5 भाषाओं में संपूर्ण पूजा विधान उपलब्ध कराता है।',
    },
  },
  contact_us: {
    te: {
      title: 'మమ్మల్ని సంప్రదించండి & సహాయ కేంద్రం',
      content: 'శరణం అయ్యప్ప భక్త సహాయ కేంద్రం. ఆలయ సమాచారం, నిత్య పూజలు లేదా ఏదైనా సూచనల కోసం మాకు ఈమెయిల్ చేయండి: support@saranamayyappa.org. ఆలయ ట్రస్ట్‌లు తమ ఆలయాన్ని ఉచితంగా నమోదు చేసుకోవచ్చు.',
    },
    kn: {
      title: 'ಸಂಪರ್ಕಿಸಿ ಮತ್ತು ಸಹಾಯ ಕೇಂದ್ರ',
      content: 'ಶರಣಂ ಅಯ್ಯಪ್ಪ ಭಕ್ತ ಸಹಾಯ ಕೇಂದ್ರ. ದೇವಾಲಯದ ಮಾಹಿತಿ ಅಥವಾ ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳಿಗೆ ನಮಗೆ ಇಮೇಲ್ ಮಾಡಿ: support@saranamayyappa.org.',
    },
    en: {
      title: 'Contact Us & Help Center',
      content: 'Questions, corrections to a temple listing, or partnership enquiries — we\'d love to hear from you. Email: support@saranamayyappa.org for general queries and listing corrections.',
    },
    ta: {
      title: 'எங்களைத் தொடர்பு கொள்ளவும் & உதவி மையம்',
      content: 'சரணம் ஐயப்பா பக்தர் உதவி மையம். சந்தேகங்கள் மற்றும் தகவல்களுக்கு எங்களை தொடர்பு கொள்ளவும்: support@saranamayyappa.org.',
    },
    hi: {
      title: 'संपर्क करें और सहायता केंद्र',
      content: 'शरणम् अय्यप्पा भक्त सहायता केंद्र। मंदिर संबंधी प्रश्नों और सहायता के लिए हमें ईमेल करें: support@saranamayyappa.org.',
    },
  },
  refund_policy: {
    en: {
      title: 'Refund & Cancellation Policy',
      content: `<h2>1. VOLUNTARY DEVOTIONAL OFFERINGS AND E-HUNDI CONTRIBUTIONS</h2>
<p>All voluntary offerings, e-hundi kanikkai, and donations made towards Lord Ayyappa temples, sanctum maintenance, and nitya poojas are treated as irrevocable sacred contributions. Once successfully remitted, voluntary donations cannot be refunded or transferred under standard circumstances, as funds are allocated directly to temple trusts and religious observances.</p>

<h2>2. TEMPLE SEVA & SPECIAL POOJA BOOKINGS</h2>
<p>Seva bookings, special archana tokens, and abhishekam registrations are scheduled in accordance with sanctum timings and priests' availability. If an e-seva cannot be performed due to sanctum closures, official temple restrictions, or force majeure events, the temple administration will reschedule the seva to an alternate auspicious date or perform the sankalpam in absentia with sacred prasad dispatched where applicable.</p>

<h2>3. DUPLICATE TRANSACTIONS & PAYMENT FAILURES</h2>
<p>In the event of technical network disruptions, server timeouts, or banking gateway drops where a devotee account is debited multiple times for a single seva booking, the excess duplicate amount will be verified and refunded back to the original payment source within 5 to 7 working banking days.</p>

<h2>4. ANNADANAM & CHARITABLE INITIATIVES</h2>
<p>Contributions made specifically for free devotee feeding (Annadanam), pilgrim water distribution, and medical seva are dispatched in real time to feed pilgrims. Hence, Annadanam contributions cannot be cancelled once processed.</p>

<h2>5. GRIEVANCE & SUPPORT CONTACT</h2>
<p>For any billing queries, duplicate transaction reconciliations, or seva scheduling assistance, devotees may contact our dedicated finance and seva desk at support@saranamayyappa.in or support@saranamayyappa.org with the Transaction ID and Devotee Mobile Number.</p>`,
    },
    te: {
      title: 'రీఫండ్ మరియు రద్దు విధానం',
      content: `<h2>1. స్వచ్ఛంద ఆలయ కానుకలు మరియు ఈ-హుండీ సమర్పణలు</h2>
<p>శ్రీ అయ్యప్ప స్వామి దేవాలయాల నిర్వహణ, నిత్య ధూపదీప నైవేద్యాలు మరియు పవిత్ర సేవల కోసం భక్తులు భక్తిశ్రద్ధలతో సమర్పించే స్వచ్ఛంద కానుకలు మరియు ఈ-హుండీ సమర్పణలు రద్దు లేదా రీఫండ్‌కు అర్హత కలిగి ఉండవు.</p>

<h2>2. ఆలయ విశేష పూజలు మరియు సేవా బుకింగ్‌లు</h2>
<p>ప్రత్యేక పూజలు, అభిషేకాలు మరియు అర్చనలు ఆలయ సంప్రదాయాల ప్రకారం నిర్వహించబడతాయి. ఆలయ నియమాలు లేదా అనుకోని కారణాల వల్ల సేవ జరగకపోతే, పూజను మరొక పవిత్ర దినమునకు మార్చబడును లేదా పరోక్ష సంకల్పం చేయబడును.</p>

<h2>3. సాంకేతిక లోపాలు & రెట్టింపు చెల్లింపులు</h2>
<p>బ్యాంకింగ్ సర్వర్ లేదా నెట్‌వర్క్ సమస్యల కారణంగా ఒకే సేవకు ఒకటికి మించి ఎక్కువసార్లు డబ్బులు డెబిట్ అయినట్లయితే, అదనపు మొత్తం 5-7 పనిదినములలో మీ మూల బ్యాంకు ఖాతాకు రీఫండ్ చేయబడును.</p>

<h2>4. అన్నదాన కానుకలు</h2>
<p>స్వామివారి భక్తులకు నిత్యాన్నదానం కోసం సమర్పించే విరాళాలు వెంటనే వినియోగించబడుతాయి కావున అన్నదాన సమర్పణలకు రద్దు వర్తించదు.</p>

<h2>5. భక్త సహాయ కేంద్రం</h2>
<p>చెల్లింపు సమస్యలు లేదా విచారణల కొరకు ట్రాన్సాక్షన్ ఐడీతో support@saranamayyappa.in లేదా support@saranamayyappa.org లో సంప్రదించండి.</p>`,
    },
    kn: {
      title: 'ಮರುಪಾವತಿ ಮತ್ತು ರದ್ದತಿ ನೀತಿ',
      content: `<h2>1. ಸ್ವಯಂಪ್ರೇರಿತ ಕಾಣಿಕೆಗಳು ಮತ್ತು ದೇಣಿಗೆಗಳು</h2>
<p>ಶ್ರೀ ಅಯ್ಯಪ್ಪ ಸ್ವಾಮಿ ದೇವಾಲಯದ ಪೂಜೆಗಳು ಮತ್ತು ಈ-ಹುಂಡಿ ಕಾಣಿಕೆಗಳು ರದ್ದು ಅಥವಾ ಮರುಪಾವತಿಗೆ ಒಳಪಡುವುದಿಲ್ಲ.</p>

<h2>2. ತಾಂತ್ರಿಕ ಸಮಸ್ಯೆಗಳು ಮತ್ತು ಮರುಪಾವತಿ</h2>
<p>ಸರ್ವರ್ ದೋಷದಿಂದ ಒಂದಕ್ಕಿಂತ ಹೆಚ್ಚು ಬಾರಿ ಹಣ ಕಡಿತಗೊಂಡರೆ, ಪರಿಶೀಲನೆಯ ನಂತರ 5-7 ದಿನಗಳಲ್ಲಿ ಮರುಪಾವತಿ ಮಾಡಲಾಗುವುದು.</p>`,
    },
    ta: {
      title: 'ரீஃபண்ட் மற்றும் ரத்து கொள்கை',
      content: `<h2>1. ஆன்மீகக் காணிக்கைகள் மற்றும் நன்கொடைகள்</h2>
<p>ஸ்ரீ ஐயப்பன் கோவில் வழிபாட்டிற்காக பக்தர்கள் செலுத்தும் காணிக்கைகள் மற்றும் உண்டியல் நன்கொடைகள் திரும்பப் பெறப்பட மாட்டாது.</p>

<h2>2. இரட்டிப்புக் கழித்தல்கள் மற்றும் தீர்வு</h2>
<p>தொழில்நுட்பக் கோளாறுகளால் ஒன்றுக்கு மேற்பட்ட முறை பணம் பிடிக்கப்பட்டால், 5-7 வேலை நாட்களில் அத்தொகை திருப்பிச் செலுத்தப்படும்.</p>`,
    },
    hi: {
      title: 'वापसी एवं रद्दीकरण नीति',
      content: `<h2>1. स्वैच्छिक दान एवं ई-हुंडी अर्पण</h2>
<p>भगवान अय्यप्पा स्वामी मंदिरों के लिए दिए गए सभी स्वैच्छिक दान और ई-हुंडी अर्पण अहस्तांतरणीय और अप्रतिदेय हैं।</p>

<h2>2. तकनीकी विफलता एवं दोहरे भुगतान</h2>
<p>यदि तकनीकी त्रुटि के कारण एक ही सेवा के लिए दो बार राशि कट जाती है, तो अतिरिक्त राशि 5 से 7 कार्य दिवसों में वापस कर दी जाएगी।</p>`,
    },
  },
};
