require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const RASHIS = [
  { code: 'MESHA', sortOrder: 1, te: 'మేషం (Mesha)', kn: 'ಮೇಷ (Mesha)', en: 'Mesha (Aries)', ta: 'மேஷம் (Mesha)', hi: 'मेष (Aries)' },
  { code: 'VRISHABHA', sortOrder: 2, te: 'వృషభం (Vrishabha)', kn: 'ವೃಷಭ (Vrishabha)', en: 'Vrishabha (Taurus)', ta: 'ரிஷபம் (Rishabha)', hi: 'वृषभ (Taurus)' },
  { code: 'MITHUNA', sortOrder: 3, te: 'మిథునం (Mithuna)', kn: 'ಮಿಥುನ (Mithuna)', en: 'Mithuna (Gemini)', ta: 'மிதுனம் (Mithunam)', hi: 'मिथुन (Gemini)' },
  { code: 'KARKATAKA', sortOrder: 4, te: 'కర్కాటకం (Karkataka)', kn: 'ಕರ್ಕಾಟಕ (Karkataka)', en: 'Karkataka (Cancer)', ta: 'கடகம் (Kadagam)', hi: 'कर्क (Cancer)' },
  { code: 'SIMHA', sortOrder: 5, te: 'సింహం (Simha)', kn: 'ಸಿಂಹ (Simha)', en: 'Simha (Leo)', ta: 'சிம்மம் (Simmam)', hi: 'सिंह (Leo)' },
  { code: 'KANYA', sortOrder: 6, te: 'కన్య (Kanya)', kn: 'ಕನ್ಯಾ (Kanya)', en: 'Kanya (Virgo)', ta: 'கன்னி (Kanni)', hi: 'कन्या (Virgo)' },
  { code: 'TULA', sortOrder: 7, te: 'తుల (Tula)', kn: 'ತುಲಾ (Tula)', en: 'Tula (Libra)', ta: 'துலாம் (Thulam)', hi: 'तुला (Libra)' },
  { code: 'VRISCHIKA', sortOrder: 8, te: 'వృశ్చికం (Vrischika)', kn: 'ವೃಶ್ಚಿಕ (Vrischika)', en: 'Vrischika (Scorpio)', ta: 'விருச்சிகம் (Viruchigam)', hi: 'वृश्चिक (Scorpio)' },
  { code: 'DHANUS', sortOrder: 9, te: 'ధనుస్సు (Dhanus)', kn: 'ಧನುಸ್ಸು (Dhanus)', en: 'Dhanus (Sagittarius)', ta: 'தனுசு (Thanusu)', hi: 'धनु (Sagittarius)' },
  { code: 'MAKARA', sortOrder: 10, te: 'మకరం (Makara)', kn: 'ಮಕರ (Makara)', en: 'Makara (Capricorn)', ta: 'மகரம் (Magaram)', hi: 'मकर (Capricorn)' },
  { code: 'KUMBHA', sortOrder: 11, te: 'కుంభం (Kumbha)', kn: 'ಕುಂಭ (Kumbha)', en: 'Kumbha (Aquarius)', ta: 'கும்பம் (Kumbam)', hi: 'कुंभ (Aquarius)' },
  { code: 'MEENA', sortOrder: 12, te: 'మీనం (Meena)', kn: 'ಮೀನ (Meena)', en: 'Meena (Pisces)', ta: 'மீனம் (Meenam)', hi: 'मीन (Pisces)' },
];

const NAKSHATRAS = [
  { code: 'ASHWINI', sortOrder: 1, te: 'అశ్విని (Ashwini)', kn: 'ಅಶ್ವಿನಿ (Ashwini)', en: 'Ashwini', ta: 'அஸ்வினி (Aswini)', hi: 'अश्विनी (Ashwini)' },
  { code: 'BHARANI', sortOrder: 2, te: 'భరణి (Bharani)', kn: 'ಭರಣಿ (Bharani)', en: 'Bharani', ta: 'பரணி (Bharani)', hi: 'भरणी (Bharani)' },
  { code: 'KRITTIKA', sortOrder: 3, te: 'కృత్తిక (Krittika)', kn: 'ಕೃತ್ತಿಕಾ (Krittika)', en: 'Krittika', ta: 'கார்த்திகை (Karthigai)', hi: 'कृत्तिका (Krittika)' },
  { code: 'ROHINI', sortOrder: 4, te: 'రోహిణి (Rohini)', kn: 'ರೋಹಿಣಿ (Rohini)', en: 'Rohini', ta: 'ரோகிணி (Rohini)', hi: 'रोहिणी (Rohini)' },
  { code: 'MRIGASHIRA', sortOrder: 5, te: 'మృగశిర (Mrigashira)', kn: 'ಮೃಗಶಿರ (Mrigashira)', en: 'Mrigashira', ta: 'மிருகசீரிடம் (Mrigaseerisham)', hi: 'मृगशिरा (Mrigashira)' },
  { code: 'ARDRA', sortOrder: 6, te: 'ఆర్ద్ర (Ardra)', kn: 'ಆರ್ದ್ರಾ (Ardra)', en: 'Ardra', ta: 'திருவாதிரை (Thiruvathirai)', hi: 'आर्द्रा (Ardra)' },
  { code: 'PUNARVASU', sortOrder: 7, te: 'పునర్వసు (Punarvasu)', kn: 'ಪುನರ್ವಸು (Punarvasu)', en: 'Punarvasu', ta: 'புனர்பூசம் (Punarpoosam)', hi: 'पुनर्वसु (Punarvasu)' },
  { code: 'PUSHYA', sortOrder: 8, te: 'పుష్యమి (Pushya)', kn: 'ಪುಷ್ಯ (Pushya)', en: 'Pushya', ta: 'பூசம் (Poosam)', hi: 'पुष्य (Pushya)' },
  { code: 'ASHLESHA', sortOrder: 9, te: 'ఆశ్లేష (Ashlesha)', kn: 'ಆಶ್ಲೇಷ (Ashlesha)', en: 'Ashlesha', ta: 'ஆயில்யம் (Ayilyam)', hi: 'अश्लेषा (Ashlesha)' },
  { code: 'MAGHA', sortOrder: 10, te: 'మఖ (Magha)', kn: 'ಮಘಾ (Magha)', en: 'Magha', ta: 'மகம் (Magam)', hi: 'मघा (Magha)' },
  { code: 'PURVA_PHALGUNI', sortOrder: 11, te: 'పూర్వఫల్గుణి / పుబ్బ (Purva Phalguni)', kn: 'ಪೂರ್ವ ಫಲ್ಗುಣಿ (Purva Phalguni)', en: 'Purva Phalguni', ta: 'பூரம் (Pooram)', hi: 'पूर्वाफाल्गुनी (Purva Phalguni)' },
  { code: 'UTTARA_PHALGUNI', sortOrder: 12, te: 'ఉత్తరఫల్గుణి / ఉత్తర (Uttara Phalguni)', kn: 'ಉತ್ತರ ಫಲ್ಗುಣಿ (Uttara Phalguni)', en: 'Uttara Phalguni', ta: 'உத்திரம் (Uthiram)', hi: 'उत्तराफाल्गुनी (Uttara Phalguni)' },
  { code: 'HASTA', sortOrder: 13, te: 'హస్త (Hasta)', kn: 'ಹಸ್ತಾ (Hasta)', en: 'Hasta', ta: 'அஸ்தம் (Astham)', hi: 'हस्त (Hasta)' },
  { code: 'CHITRA', sortOrder: 14, te: 'చిత్త (Chitra)', kn: 'ಚಿತ್ತಾ (Chitra)', en: 'Chitra', ta: 'சித்திரை (Chithirai)', hi: 'चित्रा (Chitra)' },
  { code: 'SWATI', sortOrder: 15, te: 'స్వాతి (Swati)', kn: 'ಸ್ವಾತಿ (Swati)', en: 'Swati', ta: 'சுவாதி (Swathi)', hi: 'स्वाति (Swati)' },
  { code: 'VISHAKHA', sortOrder: 16, te: 'విశాఖ (Vishakha)', kn: 'ವಿಶಾಖಾ (Vishakha)', en: 'Vishakha', ta: 'விசாகம் (Visakam)', hi: 'विशाखा (Vishakha)' },
  { code: 'ANURADHA', sortOrder: 17, te: 'అనూరాధ (Anuradha)', kn: 'ಅನುರಾಧಾ (Anuradha)', en: 'Anuradha', ta: 'அனுஷம் (Anusham)', hi: 'अनुराधा (Anuradha)' },
  { code: 'JYESHTHA', sortOrder: 18, te: 'జ్యేష్ఠ (Jyeshtha)', kn: 'ಜ್ಯೇಷ್ಠ (Jyeshtha)', en: 'Jyeshtha', ta: 'கேட்டை (Kettai)', hi: 'ज्येष्ठा (Jyeshtha)' },
  { code: 'MULA', sortOrder: 19, te: 'మూల (Mula)', kn: 'ಮೂಲಾ (Mula)', en: 'Mula', ta: 'மூலம் (Moolam)', hi: 'मूल (Mula)' },
  { code: 'PURVA_ASHADHA', sortOrder: 20, te: 'పూర్వాషాఢ (Purva Ashadha)', kn: 'ಪೂರ್ವಾಷಾಢ (Purva Ashadha)', en: 'Purva Ashadha', ta: 'பூராடம் (Pooradam)', hi: 'पूर्वाषाढ़ा (Purva Ashadha)' },
  { code: 'UTTARA_ASHADHA', sortOrder: 21, te: 'ఉత్తరాషాఢ (Uttara Ashadha)', kn: 'ಉತ್ತರಾಷಾಢ (Uttara Ashadha)', en: 'Uttara Ashadha', ta: 'உத்திராடம் (Uthiradam)', hi: 'उत्तराषाढ़ा (Uttara Ashadha)' },
  { code: 'SHRAVANA', sortOrder: 22, te: 'శ్రవణం (Shravana)', kn: 'ಶ್ರವಣ (Shravana)', en: 'Shravana', ta: 'திருவோணம் (Thiruvonam)', hi: 'श्रवण (Shravana)' },
  { code: 'DHANISHTHA', sortOrder: 23, te: 'ధనిష్ఠ (Dhanishtha)', kn: 'ಧನಿಷ್ಠಾ (Dhanishtha)', en: 'Dhanishtha', ta: 'அவிட்டம் (Avittam)', hi: 'धनिष्ठा (Dhanishtha)' },
  { code: 'SHATABHISHA', sortOrder: 24, te: 'శతభిషం (Shatabhisha)', kn: 'ಶತಭಿಷಾ (Shatabhisha)', en: 'Shatabhisha', ta: 'சதயம் (Sathayam)', hi: 'शतभिषा (Shatabhisha)' },
  { code: 'PURVA_BHADRAPADA', sortOrder: 25, te: 'పూర్వాభాద్ర (Purva Bhadrapada)', kn: 'ಪೂರ್ವಾಭಾದ್ರ (Purva Bhadrapada)', en: 'Purva Bhadrapada', ta: 'பூரட்டாதி (Poorattathi)', hi: 'पूर्वाभाद्रपद (Purva Bhadrapada)' },
  { code: 'UTTARA_BHADRAPADA', sortOrder: 26, te: 'ఉత్తరాభాద్ర (Uttara Bhadrapada)', kn: 'ಉತ್ತರಾಭಾದ್ರ (Uttara Bhadrapada)', en: 'Uttara Bhadrapada', ta: 'உத்திரட்டாதி (Uthirattathi)', hi: 'उत्तराभाद्रपद (Uttara Bhadrapada)' },
  { code: 'REVATI', sortOrder: 27, te: 'రేవతి (Revati)', kn: 'ರೇವತಿ (Revati)', en: 'Revati', ta: 'ரேவதி (Revathi)', hi: 'रेवती (Revati)' },
];

async function seed() {
  console.log('Seeding Rashis and Nakshatras...');
  
  // 1. Fetch available languages
  const languages = await prisma.language.findMany();
  const langMap = {};
  languages.forEach((l) => {
    langMap[l.code] = l.id;
  });
  console.log('Loaded languages:', Object.keys(langMap));

  // 2. Seed 12 Rashis
  for (const r of RASHIS) {
    const rashi = await prisma.rashi.upsert({
      where: { code: r.code },
      update: { sortOrder: r.sortOrder, isActive: true },
      create: { code: r.code, sortOrder: r.sortOrder, isActive: true },
    });

    for (const langCode of ['te', 'kn', 'en', 'ta', 'hi']) {
      const langId = langMap[langCode];
      if (langId && r[langCode]) {
        await prisma.rashiTranslation.upsert({
          where: {
            rashiId_languageId: {
              rashiId: rashi.id,
              languageId: langId,
            },
          },
          update: { name: r[langCode] },
          create: {
            rashiId: rashi.id,
            languageId: langId,
            name: r[langCode],
          },
        });
      }
    }
  }
  console.log('Seeded 12 Rashis with 5-language translations.');

  // 3. Seed 27 Nakshatras
  for (const n of NAKSHATRAS) {
    const nakshatra = await prisma.nakshatra.upsert({
      where: { code: n.code },
      update: { sortOrder: n.sortOrder, isActive: true },
      create: { code: n.code, sortOrder: n.sortOrder, isActive: true },
    });

    for (const langCode of ['te', 'kn', 'en', 'ta', 'hi']) {
      const langId = langMap[langCode];
      if (langId && n[langCode]) {
        await prisma.nakshatraTranslation.upsert({
          where: {
            nakshatraId_languageId: {
              nakshatraId: nakshatra.id,
              languageId: langId,
            },
          },
          update: { name: n[langCode] },
          create: {
            nakshatraId: nakshatra.id,
            languageId: langId,
            name: n[langCode],
          },
        });
      }
    }
  }
  console.log('Seeded 27 Nakshatras with 5-language translations.');
}

seed()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
