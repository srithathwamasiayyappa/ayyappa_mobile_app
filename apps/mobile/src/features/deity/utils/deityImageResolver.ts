import { DeityItem } from '../../../types';

// Map of local high-resolution bundled deity images for crisp display
const LOCAL_DEITY_ASSETS: Record<string, any> = {
  'lord_ayyappa.png': require('../../../../assets/deities/lord_ayyappa.png'),
  'lord_ganesha.png': require('../../../../assets/deities/lord_ganesha.png'),
  'lord_murugan.png': require('../../../../assets/deities/lord_murugan.png'),
  'lord_shiva.png': require('../../../../assets/deities/lord_shiva.png'),
  'lord_vishnu.png': require('../../../../assets/deities/lord_vishnu.png'),
  'goddess_devi.png': require('../../../../assets/deities/goddess_devi.png'),
  'venkateswara.jpg': require('../../../../assets/deities/venkateswara.jpg'),
  'krishna.jpg': require('../../../../assets/deities/krishna.jpg'),
  'rama.jpg': require('../../../../assets/deities/rama.jpg'),
  'hanuman.jpg': require('../../../../assets/deities/hanuman.jpg'),
  'durga.jpg': require('../../../../assets/deities/durga.jpg'),
  'ayyappa.jpg': require('../../../../assets/deities/ayyappa.jpg'),
  'ganesha.jpg': require('../../../../assets/deities/ganesha.jpg'),
  'shiva.jpg': require('../../../../assets/deities/shiva.jpg'),
};

/**
 * Resolves a DeityItem to either a local require() image or remote network URI.
 * Guarantees crisp pixel-accurate devotional rendering.
 */
export const resolveDeityImage = (item: DeityItem | null | undefined): any => {
  if (!item) {
    return LOCAL_DEITY_ASSETS['lord_ayyappa.png'];
  }

  // 1. Check exact imageName match from DB
  if (item.imageName && LOCAL_DEITY_ASSETS[item.imageName]) {
    return LOCAL_DEITY_ASSETS[item.imageName];
  }

  // 2. Extract filename from DB URL/path (e.g. "venkateswara.jpg", "krishna.jpg", "rama.jpg", "hanuman.jpg")
  const urlCandidate = item.imageUrl || (item as any).image || '';
  if (urlCandidate) {
    const rawFilename = urlCandidate.split('?')[0].split('/').pop();
    if (rawFilename && LOCAL_DEITY_ASSETS[rawFilename]) {
      return LOCAL_DEITY_ASSETS[rawFilename];
    }
  }

  // 3. Match by deity ID / slug in local assets
  const id = item.id || (item as any).slug || '';
  if (id) {
    const pngKey = `lord_${id}.png`;
    if (LOCAL_DEITY_ASSETS[pngKey]) return LOCAL_DEITY_ASSETS[pngKey];

    const jpgKey = `${id}.jpg`;
    if (LOCAL_DEITY_ASSETS[jpgKey]) return LOCAL_DEITY_ASSETS[jpgKey];
  }

  // 4. Remote uploaded custom URL if valid
  if (item.imageUrl && (item.imageUrl.startsWith('http://') || item.imageUrl.startsWith('https://'))) {
    return { uri: item.imageUrl };
  }

  // 5. Category-based fallback
  if (item.category === 'shiva') return LOCAL_DEITY_ASSETS['lord_shiva.png'];
  if (item.category === 'vishnu') return LOCAL_DEITY_ASSETS['lord_vishnu.png'];
  if (item.category === 'devi') return LOCAL_DEITY_ASSETS['goddess_devi.png'];

  return LOCAL_DEITY_ASSETS['lord_ayyappa.png'];
};
