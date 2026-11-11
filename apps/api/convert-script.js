const { PrismaClient } = require('./node_modules/@prisma/client');
const { teluguToDevanagari, teluguToTamil } = require('./src/utils/transliterate');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient({
  datasources: { db: { url: 'mysql://root:@127.0.0.1:3306/ayyappa_aradhana' } },
});

async function main() {
  console.log('--- Starting Multilingual DB & Local Cache Content Conversion ---');

  // 1. Fetch all Telugu and English content translations from DB
  const teluguTranslations = await prisma.contentTranslation.findMany({
    where: { language: { code: 'te' } },
    include: { language: true },
  });

  const teMap = new Map();
  teluguTranslations.forEach((t) => teMap.set(t.categoryId, t));

  console.log(`Found ${teluguTranslations.length} base Telugu records in DB.`);

  // 2. Fetch all Hindi and Tamil translations to convert
  const hindiTranslations = await prisma.contentTranslation.findMany({
    where: { language: { code: 'hi' } },
  });

  const tamilTranslations = await prisma.contentTranslation.findMany({
    where: { language: { code: 'ta' } },
  });

  let hiUpdated = 0;
  for (const h of hindiTranslations) {
    const teBase = teMap.get(h.categoryId);
    if (teBase && teBase.description) {
      const devanagariDesc = teluguToDevanagari(teBase.description);
      const devanagariTitle = teluguToDevanagari(h.title || teBase.title);
      await prisma.contentTranslation.update({
        where: { id: h.id },
        data: {
          description: devanagariDesc,
          title: devanagariTitle,
        },
      });
      hiUpdated++;
    }
  }
  console.log(`Successfully converted & updated ${hiUpdated} Hindi records in MySQL!`);

  let taUpdated = 0;
  for (const t of tamilTranslations) {
    const teBase = teMap.get(t.categoryId);
    if (teBase && teBase.description) {
      const tamilDesc = teluguToTamil(teBase.description);
      await prisma.contentTranslation.update({
        where: { id: t.id },
        data: {
          description: tamilDesc,
        },
      });
      taUpdated++;
    }
  }
  console.log(`Successfully converted & updated ${taUpdated} Tamil records in MySQL!`);

  // 3. Also update apps/mobile/src/data/allCategories.json so local offline cache is 100% pure Hindi & Tamil
  const jsonPath = path.resolve(__dirname, '../mobile/src/data/allCategories.json');
  if (fs.existsSync(jsonPath)) {
    const allCat = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    if (allCat.hi && Array.isArray(allCat.hi)) {
      allCat.hi.forEach((item, idx) => {
        const teItem = allCat.te[idx];
        if (teItem && teItem.description) {
          item.description = teluguToDevanagari(teItem.description);
        }
      });
    }
    if (allCat.ta && Array.isArray(allCat.ta)) {
      allCat.ta.forEach((item, idx) => {
        const teItem = allCat.te[idx];
        if (teItem && teItem.description) {
          item.description = teluguToTamil(teItem.description);
        }
      });
    }
    fs.writeFileSync(jsonPath, JSON.stringify(allCat, null, 2), 'utf8');
    console.log('Successfully updated apps/mobile/src/data/allCategories.json for offline cache!');
  }

  console.log('--- Conversion Complete! ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

