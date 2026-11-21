import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=====================================================');
  console.log('🕉️  SARANAM AYYAPPA: SEEDING SETTINGS & FESTIVALS  🕉️');
  console.log('=====================================================\n');

  // =========================================================================
  // 1. SEED APP SETTINGS (Admin Panel Settings, Logo, Colors, Socials, Ticker)
  // =========================================================================
  console.log('⚙️  [1/3] Seeding Admin Panel Settings (app_settings)...');

  const defaultTempleTypes = [
    {
      id: 'MAIN_TEMPLE',
      name: 'Main Temple',
      description: 'Primary Maha Kshetram with full sanctum, dwajasthambham, and daily scheduled poojas.',
    },
    {
      id: 'SUB_TEMPLE',
      name: 'Sub Temple',
      description: 'Branch temple or subsidiary shrine affiliated to a central managing devaswom or trust.',
    },
    {
      id: 'MULTI_TEMPLE',
      name: 'Multi-Deity Temple Complex',
      description: 'Grand religious complex featuring multiple sanctums and consecrated deities.',
    },
    {
      id: 'COMMUNITY_TEMPLE',
      name: 'Community Temple',
      description: 'Locally organized bhajana mandiram, residential colony shrine, or satsang hall.',
    },
    {
      id: 'HERITAGE_SHRINE',
      name: 'Heritage Shrine',
      description: 'Ancient historic pilgrimage site, forest shrine, or sacred spiritual heritage landmark.',
    },
  ];

  const defaultSettings: Array<{ key: string; value: string; description: string }> = [
    {
      key: 'app_logo',
      value: '/images/saranam-ayyappa-official-emblem.jpg',
      description: 'Official Sacred Emblem & Logo used across website header, footer, app, and admin portal.',
    },
    {
      key: 'app_title',
      value: 'Saranam Ayyappa',
      description: 'Official title of the platform and digital sanctum.',
    },
    {
      key: 'app_tagline',
      value: 'Connect.. Pray.. Serve..',
      description: 'Devotional motto and spiritual tagline.',
    },
    {
      key: 'app_description',
      value:
        'A sacred digital sanctuary and comprehensive devotional guide for Lord Ayyappa devotees and Dharma Karthas worldwide.',
      description: 'Meta description and platform overview.',
    },
    {
      key: 'theme_primary_color',
      value: '#06452E',
      description: 'Primary sacred forest green color.',
    },
    {
      key: 'theme_secondary_color',
      value: '#CAA049',
      description: 'Secondary devotional accent gold color.',
    },
    {
      key: 'theme_background_color',
      value: '#F7F1E5',
      description: 'Platform background ivory cream tone.',
    },
    {
      key: 'theme_surface_color',
      value: '#121212',
      description: 'Dark surface and console base color.',
    },
    {
      key: 'app_play_store_url',
      value: 'https://play.google.com/store/apps/details?id=com.saranamayyappa.app',
      description: 'Google Play Store download URL for Android devotees.',
    },
    {
      key: 'app_app_store_url',
      value: 'https://apps.apple.com/app/saranam-ayyappa/id123456789',
      description: 'Apple App Store download URL for iOS devotees.',
    },
    {
      key: 'social_youtube_url',
      value: 'https://www.youtube.com/@SaranamAyyappaOfficial',
      description: 'Official YouTube devotional satsang and bhajan channel.',
    },
    {
      key: 'social_telegram_url',
      value: 'https://t.me/saranam_ayyappa_satsang',
      description: 'Official Telegram devotee community and updates group.',
    },
    {
      key: 'social_whatsapp_url',
      value: 'https://whatsapp.com/channel/saranamayyappa',
      description: 'Official WhatsApp broadcast channel.',
    },
    {
      key: 'social_instagram_url',
      value: 'https://www.instagram.com/saranamayyappa_official',
      description: 'Official Instagram devotional visual updates profile.',
    },
    {
      key: 'social_facebook_url',
      value: 'https://www.facebook.com/saranamayyappaportal',
      description: 'Official Facebook community page.',
    },
    {
      key: 'devotional_ticker',
      value:
        '🕉️ స్వామియే శరణం అయ్యప్ప — శ్రీ అయ్యప్ప స్వామి నిత్య పూజా విధానం, అష్టోత్తరం, హరివరాసనం మరియు సమగ్ర శబరిమల యాత్రా దర్శిని 🕉️',
      description: 'Devotional marquee ticker text rendered on homepage and header.',
    },
    {
      key: 'ticker',
      value:
        '🕉️ స్వామియే శరణం అయ్యప్ప — శ్రీ అయ్యప్ప స్వామి నిత్య పూజా విధానం, అష్టోత్తరం, హరివరాసనం మరియు సమగ్ర శబరిమల యాత్రా దర్శిని 🕉️',
      description: 'Ticker alias key for backward compatibility.',
    },
    {
      key: 'temple_types',
      value: JSON.stringify(defaultTempleTypes),
      description: 'JSON list of registered temple classifications configured by admin.',
    },
  ];

  for (const s of defaultSettings) {
    await prisma.appSetting.upsert({
      where: { key: s.key },
      update: {
        value: s.value,
        description: s.description,
      },
      create: {
        key: s.key,
        value: s.value,
        description: s.description,
      },
    });
    console.log(`   ✓ Setting: ${s.key}`);
  }
  console.log(`   👉 Total ${defaultSettings.length} settings successfully verified/seeded.\n`);

  // =========================================================================
  // 1B. SEED DEVOTIONAL CATEGORIES & SERVICES (category_services table)
  // =========================================================================
  console.log('🪷  [1B/3] Seeding Categories & Devotional Services (category_services)...');

  const defaultCategoryServices = [
    {
      serviceId: 'pooja',
      title: 'Pooja Vidhanam',
      sub: 'Step-by-step sacred rituals',
      icon: 'Flame',
      url: '/subcategories',
      image: 'pooja-padi',
      artwork: '/images/categories/art-pooja-trans.png',
      displayOrder: 1,
    },
    {
      serviceId: 'ashtothram',
      title: 'Astothrams',
      sub: '108 divine names',
      icon: 'Flower2',
      url: '/stotras',
      image: 'deity',
      artwork: '/images/categories/art-ashtothram-trans.png',
      displayOrder: 2,
    },
    {
      serviceId: 'stotras',
      title: 'Stotras',
      sub: 'Powerful devotional hymns',
      icon: 'BookOpenText',
      url: '/stotras',
      image: 'deity',
      artwork: '/images/categories/art-stotras-trans.png',
      displayOrder: 3,
    },
    {
      serviceId: 'slokas',
      title: 'Slokas',
      sub: 'Sacred verses & meanings',
      icon: 'ScrollText',
      url: '/slokas',
      image: 'pooja-altar',
      artwork: '/images/categories/art-slokas-trans.png',
      displayOrder: 4,
    },
    {
      serviceId: 'bhajans',
      title: 'Bhajans',
      sub: 'Devotional songs',
      icon: 'Music',
      url: '/songs',
      image: 'music-art',
      artwork: '/images/categories/art-bhajans-trans.png',
      displayOrder: 5,
    },
    {
      serviceId: 'harathis',
      title: 'Harathis & Songs',
      sub: 'Mangala harathi & kirtans',
      icon: 'Lamp',
      url: '/songs',
      image: 'music-art',
      artwork: '/images/categories/art-harathis-trans.png',
      displayOrder: 6,
    },
    {
      serviceId: 'live',
      title: 'Live Streams',
      sub: 'Temple darshan & events',
      icon: 'Radio',
      url: '/live-streams',
      image: 'live-temple',
      artwork: '/images/categories/art-live-trans.png',
      displayOrder: 7,
    },
    {
      serviceId: 'panchangam',
      title: 'Panchangam',
      sub: 'Tithi, muhurtham & festivals',
      icon: 'CalendarDays',
      url: '/panchangam',
      image: 'temple-steps',
      artwork: '/images/categories/art-panchangam-trans.png',
      displayOrder: 8,
    },
    {
      serviceId: 'temples',
      title: 'Temples in India',
      sub: 'Explore sacred places',
      icon: 'Landmark',
      url: '/temples',
      image: 'temple-hero',
      artwork: '/images/categories/art-temples-trans.png',
      displayOrder: 9,
    },
    {
      serviceId: 'donations',
      title: 'Donations',
      sub: 'Support temple seva',
      icon: 'HandHeart',
      url: '/donations',
      image: 'donation-art',
      artwork: '/images/categories/art-donations-trans.png',
      displayOrder: 10,
    },
    {
      serviceId: 'food',
      title: 'Food Donation Today',
      sub: 'Today’s annadanam locations',
      icon: 'Soup',
      url: '/food-donations',
      image: 'annadanam-meal',
      artwork: '/images/categories/art-food-trans.png',
      displayOrder: 11,
    },
  ];

  for (const cs of defaultCategoryServices) {
    await prisma.categoryService.upsert({
      where: { serviceId: cs.serviceId },
      update: {
        title: cs.title,
        sub: cs.sub,
        icon: cs.icon,
        url: cs.url,
        image: cs.image,
        artwork: cs.artwork,
        displayOrder: cs.displayOrder,
        isActive: true,
      },
      create: {
        serviceId: cs.serviceId,
        title: cs.title,
        sub: cs.sub,
        icon: cs.icon,
        url: cs.url,
        image: cs.image,
        artwork: cs.artwork,
        displayOrder: cs.displayOrder,
        isActive: true,
      },
    });
    console.log(`   ✓ Category Service: ${cs.serviceId} (${cs.title})`);
  }
  console.log(`   👉 Total ${defaultCategoryServices.length} categories services seeded in database.\n`);

  // =========================================================================
  // 2. SEED CALENDAR & PANCHANGAM FESTIVALS (festivals & festival_translations)
  // =========================================================================
  console.log('📅  [2/3] Seeding Panchangam & Devotional Calendar Festivals...');

  const languages = await prisma.language.findMany();
  const langMap: Record<string, number> = {};
  for (const l of languages) {
    langMap[l.code] = l.id;
  }

  // Fallback if some languages don't exist yet
  const defaultLangId = langMap['te'] || langMap['en'] || (languages[0] ? languages[0].id : 1);

  const festivalsData: Array<{
    slug: string;
    date: string;
    sourceNote: string;
    translations: Array<{ langCode: string; name: string; description: string }>;
  }> = [
    {
      slug: 'mandala-kalam-commencement-2026',
      date: '2026-11-17',
      sourceNote: 'Sabarimala Devaswom Calendar (Vrischika Masam 1st)',
      translations: [
        {
          langCode: 'en',
          name: 'Mandala Kalam Commencement',
          description: 'Beginning of the auspicious 41-day sacred Mandala Deeksha Vratam for Lord Ayyappa.',
        },
        {
          langCode: 'te',
          name: 'మండల కాలం ప్రారంభం (వృశ్చిక మాస ఆరంభం)',
          description: 'శ్రీ అయ్యప్ప స్వామి 41 రోజుల మండల దీక్షా వ్రత ఆరంభం మరియు మాలధారణ.',
        },
        {
          langCode: 'ta',
          name: 'மண்டல காலம் ஆரம்பம்',
          description: 'ஸ்ரீ ஐயப்ப சுவாமியின் 41 நாள் மண்டல விரத தொடக்கம் மற்றும் மாலை அணிதல்.',
        },
        {
          langCode: 'kn',
          name: 'ಮಂಡಲ ಕಾಲ ಆರಂಭ',
          description: 'ಶ್ರೀ ಅಯ್ಯಪ್ಪ ಸ್ವಾಮಿಯ 41 ದಿನಗಳ ಪವಿತ್ರ ಮಂಡಲ ವ್ರತಾರಂಭ.',
        },
        {
          langCode: 'hi',
          name: 'मंडला काल प्रारंभ',
          description: 'भगवान अय्यप्पा की 41 दिवसीय पावन मंडला दीक्षा व्रत का शुभारंभ।',
        },
      ],
    },
    {
      slug: 'karthika-deepotsavam-2026',
      date: '2026-11-24',
      sourceNote: 'Karthika Pournami Deepotsavam',
      translations: [
        {
          langCode: 'en',
          name: 'Karthika Deepotsavam & Ayyappa Deepa Pooja',
          description: 'Grand festival of holy oil lamps, temple illumination, and collective Ayyappa deepa pooja.',
        },
        {
          langCode: 'te',
          name: 'కార్తీక దీపోత్సవం & అయ్యప్ప దీప పూజ',
          description: 'మహా కార్తీక పౌర్ణమి దీపోత్సవం మరియు భక్త బృంద అయ్యప్ప సామూహిక దీపారాధన.',
        },
        {
          langCode: 'ta',
          name: 'கார்த்திகை தீபம் மற்றும் தீப பூஜை',
          description: 'கார்த்திகை தீப உற்சவம் மற்றும் ஐயப்ப பக்தர்கள் கூட்டு தீப ஆராதனை.',
        },
        {
          langCode: 'kn',
          name: 'ಕಾರ್ತಿಕ ದೀಪೋತ್ಸವ ಮತ್ತು ದೀಪ ಪೂಜೆ',
          description: 'ಕಾರ್ತಿಕ ಹುಣ್ಣಿಮೆ ದೀಪೋತ್ಸವ ಮತ್ತು ಅಯ್ಯಪ್ಪ ದೀಪ ಪೂಜೆ.',
        },
        {
          langCode: 'hi',
          name: 'कार्तिक दीपोत्सव एवं दीप पूजा',
          description: 'पवित्र कार्तिक पूर्णिमा दीप महोत्सव एवं अय्यप्पा दीप पूजा।',
        },
      ],
    },
    {
      slug: 'mandala-pooja-mahotsavam-2026',
      date: '2026-12-27',
      sourceNote: 'Sabarimala Sannidhanam (Thanka Anki Darshanam)',
      translations: [
        {
          langCode: 'en',
          name: 'Mandala Pooja Mahotsavam',
          description:
            'Auspicious culmination of the 41-day Mandala Vratam at Sabarimala with Golden Armor (Thanka Anki) darshanam.',
        },
        {
          langCode: 'te',
          name: 'మండల పూజా మహోత్సవం (తంగ అంగి దర్శనం)',
          description:
            '41 రోజుల మండల దీక్ష పూర్ణాహుతి - శబరిమలలో తంగ అంగి (సువర్ణ కవచ) విభూషిత అయ్యప్ప స్వామి దివ్య దర్శనం.',
        },
        {
          langCode: 'ta',
          name: 'மண்டல பூஜா மஹோத்ஸவம்',
          description: '41 நாள் மண்டல விரத நிறைவு - தங்க அங்கி தரிசனம் மற்றும் விசேஷ தீபாராதனை.',
        },
        {
          langCode: 'kn',
          name: 'ಮಂಡಲ ಪೂಜಾ ಮಹೋತ್ಸವ',
          description: '41 ದಿನಗಳ ಮಂಡಲ ವ್ರತ ಸಮಾರೋಪ - ತಂಗ ಅಂಗಿ ವಿಶೇಷ ಮಹಾ ಮಂಗಳಾರತಿ ದರ್ಶನ.',
        },
        {
          langCode: 'hi',
          name: 'मंडला पूजा महोत्सव',
          description: '41 दिवसीय मंडला व्रत का पूर्णाहुति पर्व - थंगा अंगी सुवर्ण दर्शन।',
        },
      ],
    },
    {
      slug: 'makaravilakku-makara-jyothi-2027',
      date: '2027-01-14',
      sourceNote: 'Makara Sankranti / Sabarimala Ponnambalamedu',
      translations: [
        {
          langCode: 'en',
          name: 'Makaravilakku & Makara Jyothi Darshanam',
          description:
            'Auspicious Makara Sankranti festival, Thiruvabharanam procession, and divine Makara Jyothi at Ponnambalamedu.',
        },
        {
          langCode: 'te',
          name: 'మకరవిళక్కు & మకర జ్యోతి దర్శనం',
          description:
            'మకర సంక్రాంతి పుణ్యదినం, పందళ రాజవంశ తిరువాభరణ దర్శనం మరియు పొన్నంబలమేడుపై దివ్య మకర జ్యోతి ప్రకాశం.',
        },
        {
          langCode: 'ta',
          name: 'மகரவிளக்கு & மகர ஜோதி தரிசனம்',
          description: 'பொன்னம்பலமேட்டில் திருவாபரண தரிசனம் மற்றும் தெய்வீக மகர ஜோதி தரிசனம்.',
        },
        {
          langCode: 'kn',
          name: 'ಮಕರವಿಳಕ್ಕು ಮತ್ತು ಮಕರ ಜ್ಯೋತಿ ದರ್ಶನ',
          description: 'ತಿರುವಾಭರಣ ಮೆರವಣಿಗೆ ಮತ್ತು ಪೊನ್ನಂಬಲಮೇಡಿನಲ್ಲಿ ದಿವ್ಯ ಮಕರ ಜ್ಯೋತಿ ದರ್ಶನ.',
        },
        {
          langCode: 'hi',
          name: 'मकरविलक्कु एवं मकर ज्योति दर्शन',
          description: 'पवित्र मकर संक्रांति, तिरुवाभरणम् दर्शन एवं पोन्नम्बलमेडु पर दिव्य मकर ज्योति।',
        },
      ],
    },
    {
      slug: 'maha-shivaratri-2027',
      date: '2027-02-06',
      sourceNote: 'Magha Krishna Chaturdashi',
      translations: [
        {
          langCode: 'en',
          name: 'Maha Shivaratri',
          description:
            'Sacred night dedicated to Lord Shiva, father of Lord Hariharaputra Ayyappa. Night-long vigil and Bilva abhishekams.',
        },
        {
          langCode: 'te',
          name: 'మహా శివరాత్రి',
          description: 'హరిహరపుత్రుడైన అయ్యప్ప స్వామి జనకుడైన పరమశివునికి విశేష బిల్వార్చన, రుద్రాభిషేకం మరియు జాగరణ.',
        },
        {
          langCode: 'ta',
          name: 'மகா சிவராத்திரி',
          description: 'பரமசிவனுக்குரிய மகா சிவராத்திரி விரதம் மற்றும் சிறப்பு அபிஷேகங்கள்.',
        },
        {
          langCode: 'kn',
          name: 'ಮಹಾ ಶಿವರಾತ್ರಿ',
          description: 'ಪರಮಶಿವನ ಆರಾಧನೆ, ರುದ್ರಾಭಿಷೇಕ ಮತ್ತು ಜಾಗರಣ ಪರ್ವ.',
        },
        {
          langCode: 'hi',
          name: 'महा शिवरात्रि',
          description: 'भगवान शिव की उपासना, महा रुद्राभिषेक एवं पावन रात्रि जागरण।',
        },
      ],
    },
    {
      slug: 'panguni-uthram-ayyappa-jayanthi-2027',
      date: '2027-03-22',
      sourceNote: 'Uttara Phalguni Nakshatram / Pandalam Palace Tradition',
      translations: [
        {
          langCode: 'en',
          name: 'Panguni Uthram (Lord Ayyappa Jayanthi)',
          description:
            'The divine incarnation day of Lord Manikanta Ayyappa in Pandalam under the star Uttara Phalguni.',
        },
        {
          langCode: 'te',
          name: 'శ్రీ అయ్యప్ప స్వామి జయంతి (పంగుని ఉత్తిరం)',
          description:
            'ఉత్తర ఫల్గుణి నక్షత్రంలో పందళ రాజకుమారుడిగా శ్రీ మణికంఠ అయ్యప్ప స్వామి దివ్య అవతార దినోత్సవం.',
        },
        {
          langCode: 'ta',
          name: 'பங்குனி உத்திரம் (ஸ்ரீ ஐயப்ப ஜெயந்தி)',
          description: 'ஸ்ரீ மணிகண்ட சுவாமியின் திவ்ய அவதார திருநாள் மற்றும் சிறப்பு திருக்கல்யாண உற்சவம்.',
        },
        {
          langCode: 'kn',
          name: 'ಶ್ರೀ ಅಯ್ಯಪ್ಪ ಸ್ವಾಮಿ ಜಯಂತಿ (ಪಂಗುನಿ ಉತ್ತಿರಂ)',
          description: 'ಶ್ರೀ ಮಣಿಕಂಠ ಸ್ವಾಮಿಯ ದಿವ್ಯ ಅವತಾರ ದಿನೋತ್ಸವ ಮತ್ತು ವಿಶೇಷ ಪೂಜೆ.',
        },
        {
          langCode: 'hi',
          name: 'भगवान अय्यप्पा जयंती (पंगुनी उथिरम)',
          description: 'भगवान मणिकंठ अय्यप्पा का पावन अवतरण दिवस।',
        },
      ],
    },
    {
      slug: 'meda-vishu-darshanam-2027',
      date: '2027-04-14',
      sourceNote: 'Solar New Year / Vishu Kani',
      translations: [
        {
          langCode: 'en',
          name: 'Meda Vishu & Vishu Kani Darshanam',
          description:
            'Auspicious solar new year festival with golden Vishu Kani darshanam and special kaineettam coin blessings.',
        },
        {
          langCode: 'te',
          name: 'మేడ విషు & విషుక్కణి దర్శనం',
          description:
            'సౌర నూతన సంవత్సరం ఆరంభం - శబరిమలలో పవిత్ర విషుక్కణి దర్శనం మరియు అయ్యప్ప స్వామి కైనీట్టం ఆశీస్సులు.',
        },
        {
          langCode: 'ta',
          name: 'மேஷ விஷு & விஷுகனி தரிசனம்',
          description: 'சித்திரை முதல் நாள் விஷுகனி தரிசனம் மற்றும் சிறப்பு வழிபாடு.',
        },
        {
          langCode: 'kn',
          name: 'ಮೇಡ ವಿಷು & ವಿಷುಕಣಿ ದರ್ಶನ',
          description: 'ಸೌರ ಯುಗಾದಿ ಮತ್ತು ವಿಷುಕಣಿ ವಿಶೇಷ ಮಂಗಳ ದರ್ಶನ.',
        },
        {
          langCode: 'hi',
          name: 'मेष विषु दर्शन',
          description: 'सौर नववर्ष विषुकणी दर्शन एवं विशेष पूजा।',
        },
      ],
    },
    {
      slug: 'niraputhari-harvest-festival-2027',
      date: '2027-08-15',
      sourceNote: 'Sabarimala Annual Harvest Ritual',
      translations: [
        {
          langCode: 'en',
          name: 'Niraputhari Harvest Mahotsavam',
          description: 'Sacred harvest festival where newly reaped golden paddy sheaves are offered to Lord Ayyappa.',
        },
        {
          langCode: 'te',
          name: 'నిరపుత్తరి మహోత్సవం (నూతన ధాన్యార్పణ)',
          description: 'శబరిమలలో పవిత్ర నూతన ధాన్య కంకుల పూజ, స్వామికి నైవేద్యం మరియు భక్తులకు ప్రసాద వితరణ.',
        },
        {
          langCode: 'ta',
          name: 'நிறபுத்தரி மகோத்ஸவம்',
          description: 'புது நெற்கதிர் சமர்ப்பிக்கும் அறுவடை திருநாள் மற்றும் அப்பம் நைவேத்யம்.',
        },
        {
          langCode: 'kn',
          name: 'ನಿರಪುತ್ತರಿ ಮಹೋತ್ಸವ',
          description: 'ಹೊಸ ಭತ್ತದ ತೆನೆಗಳ ಸಮರ್ಪಣೆ ಮತ್ತು ವಿಶೇಷ ಸಮೃದ್ಧಿ ಪೂಜೆ.',
        },
        {
          langCode: 'hi',
          name: 'निरपुथरी महोत्सव',
          description: 'धान्य समर्पण का पावन कृषि समृद्धि महोत्सव।',
        },
      ],
    },
    {
      slug: 'vinayaka-chaturthi-2027',
      date: '2027-09-04',
      sourceNote: 'Bhadrapada Shukla Chaturthi',
      translations: [
        {
          langCode: 'en',
          name: 'Vinayaka Chaturthi',
          description: 'Festival of Lord Ganesha / Kanni Moola Ganapathi. Auspicious Maha Ganapathi Homam for obstacle removal.',
        },
        {
          langCode: 'te',
          name: 'వినాయక చతుర్థి (కన్నిమూల గణపతి పూజ)',
          description: 'సర్వ విఘ్న నివారణార్థం కన్నిమూల మహాగణపతి హోమం మరియు విశేష మోదక నివేదన.',
        },
        {
          langCode: 'ta',
          name: 'விநாயகர் சதுர்த்தி',
          description: 'கன்னிமூல கணபதி ஹோமம் மற்றும் விநாயகா் சதுர்த்தி பெருவிழா.',
        },
        {
          langCode: 'kn',
          name: 'ವಿನಾಯಕ ಚತುರ್ಥಿ',
          description: 'ಕನ್ನಿಮೂಲ ಗಣಪತಿ ಹೋಮ ಮತ್ತು ವಿನಾಯಕ ಪೂಜೆ.',
        },
        {
          langCode: 'hi',
          name: 'विनायक चतुर्थी',
          description: 'महागणपति पूजा एवं विघ्नहर्ता गणेश उत्सव।',
        },
      ],
    },
    {
      slug: 'vijayadashami-vidyarambham-2027',
      date: '2027-10-10',
      sourceNote: 'Ashwin Shukla Dashami',
      translations: [
        {
          langCode: 'en',
          name: 'Vijayadashami & Vidyarambham',
          description: 'Celebration of victory of Dharma over evil. Sacred initiation of children into knowledge and letters (Aksharabhyasam).',
        },
        {
          langCode: 'te',
          name: 'విజయదశమి & విద్యారంభం (అక్షరాభ్యాసం)',
          description: 'చెడుపై ధర్మ విజయ పర్వదినం మరియు శబరిమల సన్నిధానంలో చిన్నారులకు పవిత్ర అక్షరాభ్యాసం.',
        },
        {
          langCode: 'ta',
          name: 'விஜயதசமி & வித்யாரம்பம்',
          description: 'தர்மத்தின் வெற்றி நாள் மற்றும் வித்யாரம்ப அக்ஷராப்யாசம்.',
        },
        {
          langCode: 'kn',
          name: 'ವಿಜಯದಶಮಿ ಮತ್ತು ವಿದ್ಯಾರಂಭ',
          description: 'ಧರ್ಮದ ವಿಜಯೋತ್ಸವ ಮತ್ತು ಅಕ್ಷರಾಭ್ಯಾಸ.',
        },
        {
          langCode: 'hi',
          name: 'विजयादशमी एवं विद्यारंभ',
          description: 'अधर्म पर धर्म की विजय का महापर्व एवं विद्यारंभ संस्कार।',
        },
      ],
    },
    {
      slug: 'deepavali-lakshmi-pooja-2027',
      date: '2027-10-29',
      sourceNote: 'Kartika Amavasya',
      translations: [
        {
          langCode: 'en',
          name: 'Deepavali & Lakshmi Pooja',
          description: 'Festival of lights, inner spiritual awakening, and Maha Lakshmi pooja.',
        },
        {
          langCode: 'te',
          name: 'దీపావళి & లక్ష్మీ పూజ',
          description: 'దివ్య దీప కాంతుల పండుగ మరియు ధనలక్ష్మీ పూజా విధానం.',
        },
        {
          langCode: 'ta',
          name: 'தீபாவளி பண்டிகை',
          description: 'தீபங்களின் திருநாள் மற்றும் லக்ஷ்மி பூஜை.',
        },
        {
          langCode: 'kn',
          name: 'ದೀಪಾವಳಿ ಹಬ್ಬ',
          description: 'ದೀಪಗಳ ಮಹೋತ್ಸವ ಮತ್ತು ಲಕ್ಷ್ಮೀ ಪೂಜೆ.',
        },
        {
          langCode: 'hi',
          name: 'दीपावली एवं महालक्ष्मी पूजन',
          description: 'प्रकाश पर्व दीपावली एवं महालक्ष्मी पूजन।',
        },
      ],
    },
    {
      slug: 'chithira-attavishesham-2027',
      date: '2027-11-04',
      sourceNote: 'Travancore Royal Birthday Special Opening',
      translations: [
        {
          langCode: 'en',
          name: 'Chithira Attavishesham',
          description: 'Annual special sanctum opening at Sabarimala with Sahasrakalasam and sacred Pushpabhishekam.',
        },
        {
          langCode: 'te',
          name: 'చిత్తిర అట్టవిశేషం',
          description: 'శబరిమల ఆలయం ప్రత్యేకంగా తెరవబడి సహస్రకలశాభిషేకం మరియు పుష్పాభిషేకం నిర్వహించే పుణ్యదినం.',
        },
        {
          langCode: 'ta',
          name: 'சித்திரை ஆட்டவிசேஷம்',
          description: 'சபரிமலையில் நடைபெறும் சிறப்பு சகஸ்ரகலசாபிஷேகம் மற்றும் புஷ்பாபிஷேகம்.',
        },
        {
          langCode: 'kn',
          name: 'ಚಿತ್ತಿರ ಅಟ್ಟವಿಶೇಷ',
          description: 'ಶಬರಿಮಲೆಯಲ್ಲಿ ವಿಶೇಷ ಸಹಸ್ರಕಲಶಾಭಿಷೇಕ ಮತ್ತು ಪುಷ್ಪಾಭಿಷೇಕ ಪರ್ವ.',
        },
        {
          langCode: 'hi',
          name: 'चित्तिरा अट्टविशेषम्',
          description: 'शबरीमला में आयोजित होने वाला सहस्रकलशाभिषेक एवं पुष्पाभिषेक।',
        },
      ],
    },
  ];

  let seededFestivalsCount = 0;
  for (const f of festivalsData) {
    const existing = await prisma.festival.findFirst({
      where: { slug: f.slug },
    });

    let festivalId: number;
    if (existing) {
      const updated = await prisma.festival.update({
        where: { id: existing.id },
        data: {
          festivalDate: new Date(f.date),
          sourceNote: f.sourceNote,
          isPublished: true,
        },
      });
      festivalId = updated.id;
    } else {
      const created = await prisma.festival.create({
        data: {
          slug: f.slug,
          festivalDate: new Date(f.date),
          sourceNote: f.sourceNote,
          isPublished: true,
        },
      });
      festivalId = created.id;
    }

    // Upsert translations
    for (const t of f.translations) {
      const targetLangId = langMap[t.langCode] || defaultLangId;
      await prisma.festivalTranslation.upsert({
        where: {
          festivalId_languageId: {
            festivalId,
            languageId: targetLangId,
          },
        },
        update: {
          name: t.name,
          description: t.description,
        },
        create: {
          festivalId,
          languageId: targetLangId,
          name: t.name,
          description: t.description,
        },
      });
    }

    seededFestivalsCount++;
    console.log(`   ✓ Festival [${f.date}]: ${f.slug}`);
  }
  console.log(`   👉 Total ${seededFestivalsCount} calendar festivals successfully verified/seeded with multilingual translations.\n`);

  // =========================================================================
  // 3. SEED DEFAULT TEMPLE & TEMPLE FESTIVALS / EVENTS (If empty)
  // =========================================================================
  console.log('🛕  [3/3] Checking & Seeding Sample Temple, Timings, Festivals & Events...');

  let sampleTemple = await prisma.temple.findFirst({
    where: { slug: 'sri-dharma-sastha-ayyappa-swamy-temple' },
  });

  if (!sampleTemple) {
    sampleTemple = await prisma.temple.create({
      data: {
        slug: 'sri-dharma-sastha-ayyappa-swamy-temple',
        name: 'Sri Dharma Sastha Ayyappa Swamy Temple',
        alternateName: 'శ్రీ ధర్మశాస్త అయ్యప్ప స్వామి దేవస్థానం',
        primaryDeity: 'Lord Ayyappa (Dharma Sastha)',
        shortDescription:
          'A sacred sanctum for Lord Ayyappa devotees featuring daily poojas, 18 holy steps (Padi), and vibrant annual Mandala-Makaravilakku celebrations.',
        about:
          'Established with the divine grace of Sabarimala Sannidhanam, this Maha Kshetram serves as a beacon of spirituality, discipline, and universal brotherhood (Thathwamasi) for all Swami devotees.',
        history:
          'Consecrated with Prana Pratishtha rituals by revered Thanthris, the temple has nurtured thousands of devotees taking the sacred 41-day Mandala Vratam with Irumudi Kattu every pilgrimage season.',
        speciality:
          'Features consecrated 18 Holy Steps (Padinettampadi) opened during auspicious festival occasions, a dedicated Kanni Moola Ganapathi sanctum, Malikappuram Devi shrine, and Nagaraja sannidhi.',
        country: 'India',
        state: 'Telangana',
        district: 'Hyderabad',
        city: 'Hyderabad',
        address: 'Temple Road, Devotee Enclave, Hyderabad',
        pincode: '500034',
        officePhone: '+91 98490 12345',
        officialEmail: 'contact@saranamayyappa.org',
        officialWebsite: 'https://saranamayyappa.org',
        status: 'PUBLISHED',
      },
    });
    console.log(`   ✓ Created sample temple: ${sampleTemple.name} (ID: ${sampleTemple.id})`);
  } else {
    console.log(`   ✓ Sample temple exists: ${sampleTemple.name} (ID: ${sampleTemple.id})`);
  }

  // Seed Temple Timings if none exist
  const existingTimings = await prisma.templeTiming.count({ where: { templeId: sampleTemple.id } });
  if (existingTimings === 0) {
    const timings = [
      { title: 'Nirmalya Darshanam & Suprabhatam', timeWindow: '05:00 AM – 05:30 AM', sortOrder: 1 },
      { title: 'Usha Pooja & Ganapathi Homam', timeWindow: '06:00 AM – 07:00 AM', sortOrder: 2 },
      { title: 'Uchcha Pooja (Midday Pooja)', timeWindow: '11:30 AM – 12:00 PM', sortOrder: 3 },
      { title: 'Temple Reopening & Deeparadhana', timeWindow: '05:00 PM – 06:30 PM', sortOrder: 4 },
      { title: 'Athazha Pooja (Night Pooja)', timeWindow: '08:30 PM – 09:00 PM', sortOrder: 5 },
      { title: 'Harivarasanam & Temple Closure', timeWindow: '09:00 PM – 09:15 PM', sortOrder: 6 },
    ];
    for (const t of timings) {
      await prisma.templeTiming.create({
        data: {
          templeId: sampleTemple.id,
          title: t.title,
          timeWindow: t.timeWindow,
          sortOrder: t.sortOrder,
          isActive: true,
        },
      });
    }
    console.log(`   ✓ Created 6 daily temple timings & aartis.`);
  }

  // Seed Temple Festivals if none exist
  const existingTempleFestivals = await prisma.templeFestival.count({ where: { templeId: sampleTemple.id } });
  if (existingTempleFestivals === 0) {
    const templeFestivals = [
      {
        name: 'Mandala Pooja Mahotsavam',
        period: 'November 17 to December 27',
        description: '41-day grand festival with daily bhajans, padipooja, pushpabhishekam, and annadhanam.',
        sortOrder: 1,
      },
      {
        name: 'Makaravilakku Brahmotsavam',
        period: 'January 1 to January 15',
        description: 'Makara Jyothi deepotsavam, procession with divine vadhyam, and laksha deepa aradhana.',
        sortOrder: 2,
      },
      {
        name: 'Panguni Uthram (Ayyappa Avatara Dinam)',
        period: 'March - April',
        description: 'Celebration of Lord Manikanta divine birth with special kalashabhishekam.',
        sortOrder: 3,
      },
      {
        name: 'Karthika Deepotsavam & Padi Pooja',
        period: 'Mid-November',
        description: 'Illumination of eighteen sacred steps with ghee lamps and flower garlands.',
        sortOrder: 4,
      },
    ];
    for (const tf of templeFestivals) {
      await prisma.templeFestival.create({
        data: {
          templeId: sampleTemple.id,
          name: tf.name,
          period: tf.period,
          description: tf.description,
          sortOrder: tf.sortOrder,
          isAnnual: true,
          status: 'PUBLISHED',
        },
      });
    }
    console.log(`   ✓ Created 4 major annual temple festivals.`);
  }

  // Seed Temple Events if none exist
  const existingTempleEvents = await prisma.templeEvent.count({ where: { templeId: sampleTemple.id } });
  if (existingTempleEvents === 0) {
    const templeEvents = [
      {
        title: 'Maha Pushpabhishekam & Sahasrakalasa Pooja',
        description:
          'Sacred floral offering with 18 varieties of fragrant flowers followed by 1008 Kalasha Abhishekam.',
        startDate: new Date('2026-12-15T09:00:00.000Z'),
        endDate: new Date('2026-12-15T13:00:00.000Z'),
        timeInfo: '09:00 AM – 01:00 PM',
        location: 'Main Temple Sanctum Hall',
        status: 'PUBLISHED',
      },
      {
        title: 'Maha Annadhanam & Sastha Preethi Mahotsavam',
        description:
          'Grand mass feeding for thousands of visiting Ayyappa Swamy devotees and pilgrims with traditional prasadams.',
        startDate: new Date('2026-12-25T11:30:00.000Z'),
        endDate: new Date('2026-12-25T16:00:00.000Z'),
        timeInfo: '11:30 AM – 04:00 PM',
        location: 'Annadhanam Mandapam',
        status: 'PUBLISHED',
      },
      {
        title: 'Laksha Deepotsavam & 18 Holy Steps Special Deeparadhana',
        description: 'Divine lighting of 100,000 sacred oil lamps across temple praakaram and the 18 Holy Steps.',
        startDate: new Date('2027-01-14T17:30:00.000Z'),
        endDate: new Date('2027-01-14T21:30:00.000Z'),
        timeInfo: '05:30 PM – 09:30 PM',
        location: 'Temple Courtyard & Padinettampadi',
        status: 'PUBLISHED',
      },
    ];
    for (const te of templeEvents) {
      await prisma.templeEvent.create({
        data: {
          templeId: sampleTemple.id,
          title: te.title,
          description: te.description,
          startDate: te.startDate,
          endDate: te.endDate,
          timeInfo: te.timeInfo,
          location: te.location,
          status: te.status,
        },
      });
    }
    console.log(`   ✓ Created 3 upcoming temple events & grand poojas.`);
  }

  console.log('\n=====================================================');
  console.log('✅  ALL SEEDING COMPLETED SUCCESSFULLY!');
  console.log('=====================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
