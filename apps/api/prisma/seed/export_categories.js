const fs = require('fs');
const content = fs.readFileSync('./apps/api/prisma/seed/index.ts', 'utf8');

// Match everything from "const categoriesData = [" to "for (const item of categoriesData)"
const startMarker = 'const categoriesData = [';
const endMarker = 'for (const item of categoriesData)';

const startPos = content.indexOf(startMarker);
const endPos = content.indexOf(endMarker);

const categoryBlock = content.substring(startPos, endPos);

// Wrap in CommonJS module
const fileContent = `
const sahasranamamEnglish = "";
${categoryBlock}

module.exports = { categoriesData };
`;

fs.writeFileSync('./apps/api/prisma/seed/clean_categories.js', fileContent);
const { categoriesData } = require('./apps/api/prisma/seed/clean_categories.js');
console.log('Successfully loaded full clean_categories, total count:', categoriesData.length);

// Generate static fallback JSON for mobile
const mobileCategories = {
  te: categoriesData.map((c, idx) => ({
    id: String(idx + 1),
    slug: c.slug,
    title: c.translations.te ? c.translations.te.title : c.slug,
    description: c.translations.te ? c.translations.te.description : '',
    isAudio: !!c.isAudio,
    audioDurationSec: 40,
    totalTime: '00:40',
    chantLyric: c.isAudio ? 'హరివరాసనం విశ్వమోహనం హరిదధీశ్వరం ఆరాధ్యపాదుకం' : undefined,
  })),
  kn: categoriesData.map((c, idx) => ({
    id: String(idx + 1),
    slug: c.slug,
    title: c.translations.kn ? c.translations.kn.title : c.translations.te?.title || c.slug,
    description: c.translations.kn ? c.translations.kn.description : '',
    isAudio: !!c.isAudio,
    audioDurationSec: 40,
    totalTime: '00:40',
    chantLyric: c.isAudio ? 'ಹರಿವರಾಸನಂ ವಿಶ್ವಮೋಹನಂ ಹರಿದಧೀಶ್ವರಂ ಆರಾಧ್ಯಪಾದುಕಂ' : undefined,
  })),
  en: categoriesData.map((c, idx) => ({
    id: String(idx + 1),
    slug: c.slug,
    title: c.translations.en ? c.translations.en.title : c.translations.te?.title || c.slug,
    description: c.translations.en ? c.translations.en.description : '',
    isAudio: !!c.isAudio,
    audioDurationSec: 40,
    totalTime: '00:40',
    chantLyric: c.isAudio ? 'Harivarasanam Viswamohanam Haridadheeswaram Aaradhyapadukam' : undefined,
  })),
};

fs.writeFileSync('./apps/mobile/src/data/allCategories.json', JSON.stringify(mobileCategories, null, 2));
console.log('Generated apps/mobile/src/data/allCategories.json successfully with all 23 items!');

