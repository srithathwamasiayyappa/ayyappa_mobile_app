/**
 * High-Accuracy Unicode Indian Script Transliteration Engine
 * Converts between Telugu (0x0C00-0x0C7F), Devanagari (0x0900-0x097F), and Tamil (0x0B80-0x0BFF)
 */

const TELUGU_TO_DEVANAGARI_MAP = {
  // Vowels
  '\u0C05': '\u0905', // అ -> अ
  '\u0C06': '\u0906', // ఆ -> आ
  '\u0C07': '\u0907', // ఇ -> इ
  '\u0C08': '\u0908', // ఈ -> ई
  '\u0C09': '\u0909', // ఉ -> उ
  '\u0C0A': '\u090A', // ఊ -> ऊ
  '\u0C0B': '\u090B', // ఋ -> ऋ
  '\u0C0C': '\u090C', // ఌ -> ऌ
  '\u0C0E': '\u090F', // ఎ -> ए
  '\u0C0F': '\u090F', // ఏ -> ए
  '\u0C10': '\u0910', // ఐ -> ऐ
  '\u0C12': '\u0913', // ఒ -> ओ
  '\u0C13': '\u0913', // ఓ -> ओ
  '\u0C14': '\u0914', // ఔ -> औ

  // Consonants
  '\u0C15': '\u0915', // క -> क
  '\u0C16': '\u0916', // ఖ -> ख
  '\u0C17': '\u0917', // గ -> ग
  '\u0C18': '\u0918', // ఘ -> घ
  '\u0C19': '\u0919', // ఙ -> ङ
  '\u0C1A': '\u091A', // చ -> च
  '\u0C1B': '\u091B', // ఛ -> छ
  '\u0C1C': '\u091C', // జ -> ज
  '\u0C1D': '\u091D', // ఝ -> झ
  '\u0C1E': '\u091E', // ఞ -> ञ
  '\u0C1F': '\u091F', // ట -> ट
  '\u0C20': '\u0920', // ఠ -> ठ
  '\u0C21': '\u0921', // డ -> ड
  '\u0C22': '\u0922', // ఢ -> ढ
  '\u0C23': '\u0923', // ణ -> ण
  '\u0C24': '\u0924', // త -> त
  '\u0C25': '\u0925', // థ -> थ
  '\u0C26': '\u0926', // ద -> द
  '\u0C27': '\u0927', // ధ -> ध
  '\u0C28': '\u0928', // న -> न
  '\u0C2A': '\u092A', // ప -> प
  '\u0C2B': '\u092B', // ఫ -> फ
  '\u0C2C': '\u092C', // బ -> ब
  '\u0C2D': '\u092D', // భ -> भ
  '\u0C2E': '\u092E', // మ -> म
  '\u0C2F': '\u092F', // య -> य
  '\u0C30': '\u0930', // ర -> र
  '\u0C31': '\u0931', // ఱ -> ऱ
  '\u0C32': '\u0932', // ల -> ल
  '\u0C33': '\u0933', // ళ -> ळ
  '\u0C34': '\u0934', // ఴ -> ऴ
  '\u0C35': '\u0935', // వ -> व
  '\u0C36': '\u0936', // శ -> श
  '\u0C37': '\u0937', // ష -> ष
  '\u0C38': '\u0938', // స -> स
  '\u0C39': '\u0939', // హ -> ह

  // Matras / Vowel signs
  '\u0C3E': '\u093E', // ా -> ा
  '\u0C3F': '\u093F', // ి -> ि
  '\u0C40': '\u0940', // ీ -> ी
  '\u0C41': '\u0941', // ు -> ु
  '\u0C42': '\u0942', // ూ -> ू
  '\u0C43': '\u0943', // ృ -> ृ
  '\u0C44': '\u0944', // ౄ -> ॄ
  '\u0C46': '\u0947', // ె -> े
  '\u0C47': '\u0947', // ే -> े
  '\u0C48': '\u0948', // ై -> ै
  '\u0C4A': '\u094B', // ొ -> ो
  '\u0C4B': '\u094B', // ో -> ो
  '\u0C4C': '\u094C', // ౌ -> ौ
  '\u0C4D': '\u094D', // ్ -> ् (Virama)

  // Modifiers
  '\u0C01': '\u0901', // ఁ -> ँ (Candrabindu)
  '\u0C02': '\u0902', // ం -> ं (Anusvara)
  '\u0C03': '\u0903', // ః -> ः (Visarga)
  '\u0C55': '\u0951', // ౕ
  '\u0C56': '\u0952', // ౖ

  // Digits
  '\u0C66': '\u0966', // ౦ -> ०
  '\u0C67': '\u0967', // ౧ -> १
  '\u0C68': '\u0968', // ౨ -> २
  '\u0C69': '\u0969', // ౩ -> ३
  '\u0C6A': '\u096A', // ౪ -> ४
  '\u0C6B': '\u096B', // ౫ -> ५
  '\u0C6C': '\u096C', // ౬ -> ६
  '\u0C6D': '\u096D', // ౭ -> ७
  '\u0C6E': '\u096E', // ౮ -> ८
  '\u0C6F': '\u096F', // ౯ -> ९
};

const TELUGU_TO_TAMIL_MAP = {
  '\u0C05': '\u0B85', '\u0C06': '\u0B86', '\u0C07': '\u0B87', '\u0C08': '\u0B88',
  '\u0C09': '\u0B89', '\u0C0A': '\u0B8A', '\u0C0E': '\u0B8E', '\u0C0F': '\u0B8F',
  '\u0C10': '\u0B90', '\u0C12': '\u0B92', '\u0C13': '\u0B93', '\u0C14': '\u0B94',
  '\u0C15': '\u0B95', '\u0C16': '\u0B95', '\u0C17': '\u0B95', '\u0C18': '\u0B95', '\u0C19': '\u0B99',
  '\u0C1A': '\u0B9A', '\u0C1B': '\u0B9A', '\u0C1C': '\u0B9C', '\u0C1D': '\u0B9A', '\u0C1E': '\u0B9E',
  '\u0C1F': '\u0B9F', '\u0C20': '\u0B9F', '\u0C21': '\u0B9F', '\u0C22': '\u0B9F', '\u0C23': '\u0BA3',
  '\u0C24': '\u0BA4', '\u0C25': '\u0BA4', '\u0C26': '\u0BA4', '\u0C27': '\u0BA4', '\u0C28': '\u0BA8',
  '\u0C2A': '\u0BAA', '\u0C2B': '\u0BAA', '\u0C2C': '\u0BAA', '\u0C2D': '\u0BAA', '\u0C2E': '\u0BAE',
  '\u0C2F': '\u0BAF', '\u0C30': '\u0BB0', '\u0C31': '\u0BB1', '\u0C32': '\u0BB2', '\u0C33': '\u0BB3',
  '\u0C34': '\u0BB4', '\u0C35': '\u0BB5', '\u0C36': '\u0BB6', '\u0C37': '\u0BB7', '\u0C38': '\u0BB8',
  '\u0C39': '\u0BB9',
  '\u0C3E': '\u0BBE', '\u0C3F': '\u0BBF', '\u0C40': '\u0BC0', '\u0C41': '\u0BC1', '\u0C42': '\u0BC2',
  '\u0C46': '\u0BC6', '\u0C47': '\u0BC7', '\u0C48': '\u0BC8', '\u0C4A': '\u0BCA', '\u0C4B': '\u0BCB',
  '\u0C4C': '\u0BCC', '\u0C4D': '\u0BCD', '\u0C02': '\u0B82', '\u0C03': '\u0B83',
};

function teluguToDevanagari(text) {
  if (!text) return '';
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    out += TELUGU_TO_DEVANAGARI_MAP[ch] || ch;
  }
  return out;
}

function teluguToTamil(text) {
  if (!text) return '';
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    out += TELUGU_TO_TAMIL_MAP[ch] || ch;
  }
  return out;
}

module.exports = {
  teluguToDevanagari,
  teluguToTamil
};

