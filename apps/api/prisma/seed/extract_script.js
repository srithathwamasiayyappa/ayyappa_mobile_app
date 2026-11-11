const fs = require('fs');
const content = fs.readFileSync('./apps/api/prisma/seed/index.ts', 'utf8');
const lines = content.split('\n');
const items = [];
let currentSlug = null;
let currentTe = null;
let currentKn = null;
let currentEn = null;
let currentIsAudio = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('for (const item of categoriesData)')) break;
  if (line.includes('slug:')) {
    const parts = line.split("'");
    if (parts.length >= 2) {
      if (currentSlug) {
        items.push({ slug: currentSlug, te: currentTe, kn: currentKn, en: currentEn, isAudio: currentIsAudio });
        currentTe = null; currentKn = null; currentEn = null; currentIsAudio = false;
      }
      currentSlug = parts[1];
    }
  }
  if (line.includes('isAudio:')) {
    currentIsAudio = line.includes('true');
  }
  if (line.includes('te:') && lines[i+1] && lines[i+1].includes('title:')) {
    const tp = lines[i+1].split("'");
    if (tp.length >= 2) currentTe = tp[1];
  }
  if (line.includes('kn:') && lines[i+1] && lines[i+1].includes('title:')) {
    const kp = lines[i+1].split("'");
    if (kp.length >= 2) currentKn = kp[1];
  }
  if (line.includes('en:') && lines[i+1] && lines[i+1].includes('title:')) {
    const ep = lines[i+1].split("'");
    if (ep.length >= 2) currentEn = ep[1];
  }
}
if (currentSlug) {
  items.push({ slug: currentSlug, te: currentTe, kn: currentKn, en: currentEn, isAudio: currentIsAudio });
}
console.log('Total categories:', items.length);
fs.writeFileSync('./apps/api/prisma/seed/categories_summary.json', JSON.stringify(items, null, 2));
items.forEach((it, idx) => console.log((idx+1) + '. ' + it.slug + ' | ' + it.te + ' | ' + it.isAudio));

