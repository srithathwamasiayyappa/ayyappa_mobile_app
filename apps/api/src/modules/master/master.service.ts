import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

const ALL_INDIAN_STATES = [
  'Andhra Pradesh', 'Telangana', 'Kerala', 'Tamil Nadu', 'Karnataka',
  'Maharashtra', 'Odisha', 'Gujarat', 'Rajasthan', 'Uttar Pradesh',
  'Madhya Pradesh', 'Delhi', 'West Bengal', 'Punjab', 'Haryana',
  'Bihar', 'Assam', 'Goa', 'Jharkhand', 'Chhattisgarh',
  'Uttarakhand', 'Himachal Pradesh', 'Jammu & Kashmir', 'Puducherry'
];

const STATE_DISTRICTS: Record<string, string[]> = {
  'Andhra Pradesh': [
    'Alluri Sitharama Raju', 'Anakapalli', 'Ananthapuramu', 'Annamayya', 'Bapatla',
    'Chittoor', 'Dr. B.R. Ambedkar Konaseema', 'East Godavari (Rajahmundry)', 'Eluru',
    'Guntur', 'Kakinada', 'Krishna (Machilipatnam)', 'Kurnool', 'Nandyal',
    'NTR (Vijayawada)', 'Palnadu (Narasaraopet)', 'Parvathipuram Manyam', 'Prakasam (Ongole)',
    'Sri Potti Sriramulu Nellore', 'Sri Sathya Sai (Puttaparthi)', 'Srikakulam',
    'Tirupati', 'Visakhapatnam', 'Vizianagaram', 'West Godavari (Bhimavaram)', 'YSR Kadapa'
  ],
  'Telangana': [
    'Adilabad', 'Bhadradri Kothagudem', 'Hyderabad', 'Jagtial', 'Jangaon',
    'Jayashankar Bhupalpally', 'Jogulamba Gadwal', 'Kamareddy', 'Karimnagar', 'Khammam',
    'Komaram Bheem Asifabad', 'Mahabubabad', 'Mahabubnagar', 'Mancherial', 'Medak',
    'Medchal-Malkajgiri', 'Mulugu', 'Nagarkurnool', 'Nalgonda', 'Narayanpet',
    'Nirmal', 'Nizamabad', 'Peddapalli', 'Rajanna Sircilla', 'Rangareddy',
    'Sangareddy', 'Siddipet', 'Suryapet', 'Vikarabad', 'Wanaparthy', 'Warangal', 'Hanamkonda', 'Yadadri Bhuvanagiri'
  ],
  'Kerala': [
    'Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod',
    'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad',
    'Pathanamthitta (Sabarimala)', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'
  ],
  'Tamil Nadu': [
    'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri',
    'Dindigul', 'Erode', 'Kallakurichi', 'Kancheepuram', 'Karur', 'Krishnagiri',
    'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur',
    'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi',
    'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tirupathur',
    'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar'
  ],
  'Karnataka': [
    'Bagalkote', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban',
    'Bidar', 'Chamarajanagara', 'Chikkaballapura', 'Chikkamagaluru', 'Chitradurga',
    'Dakshina Kannada (Mangaluru)', 'Davanagere', 'Dharwad', 'Gadag', 'Hassan',
    'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal', 'Mandya',
    'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga', 'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayapura', 'Yadgir'
  ],
  'Maharashtra': [
    'Ahmednagar', 'Akola', 'Amravati', 'Aurangabad (Chhatrapati Sambhajinagar)', 'Beed', 'Bhandara',
    'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon', 'Jalna',
    'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded', 'Nandurbar',
    'Nashik', 'Osmanabad (Dharashiv)', 'Palghar', 'Parbhani', 'Pune', 'Raigad', 'Ratnagiri',
    'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal'
  ],
  'Odisha': [
    'Angul', 'Balangir', 'Balasore', 'Bargarh', 'Bhadrak', 'Boudh', 'Cuttack', 'Deogarh',
    'Dhenkanal', 'Gajapati', 'Ganjam', 'Jagatsinghpur', 'Jajpur', 'Jharsuguda', 'Kalahandi',
    'Kandhamal', 'Kendrapara', 'Kendujhar', 'Khordha (Bhubaneswar)', 'Koraput', 'Malkangiri',
    'Mayurbhanj', 'Nabarangpur', 'Nayagarh', 'Nuapada', 'Puri', 'Rayagada', 'Sambalpur', 'Subarnapur', 'Sundargarh'
  ],
  'Delhi': [
    'Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'North East Delhi',
    'North West Delhi', 'Shahdara', 'South Delhi', 'South East Delhi', 'South West Delhi', 'West Delhi'
  ],
  'Uttar Pradesh': [
    'Agra', 'Aligarh', 'Ayodhya', 'Bareilly', 'Ghaziabad', 'Gorakhpur', 'Kanpur Nagar', 'Lucknow', 'Mathura', 'Meerut', 'Prayagraj', 'Varanasi'
  ],
  'Gujarat': [
    'Ahmedabad', 'Amreli', 'Anand', 'Bharuch', 'Bhavnagar', 'Gandhinagar', 'Jamnagar', 'Junagadh', 'Kutch', 'Rajkot', 'Surat', 'Vadodara'
  ]
};

const DEFAULT_DEITIES = [
  { id: 'ayyappa', name: 'Lord Ayyappa (అయ్యప్ప స్వామి)', code: 'AYYAPPA', image: '/images/ayyappa-icon.jpg' },
  { id: 'shiva', name: 'Lord Shiva (శివుడు)', code: 'SHIVA', image: '/images/god-shiva.jpg' },
  { id: 'durga', name: 'Goddess Durga / Devi (దుర్గా దేవి)', code: 'DURGA', image: '/images/god-durga.jpg' },
  { id: 'ganesha', name: 'Lord Ganesha (వినాయకుడు)', code: 'GANESHA', image: '/images/god-ganesha.jpg' },
  { id: 'venkateswara', name: 'Lord Venkateswara (శ్రీ వెంకటేశ్వర స్వామి)', code: 'VENKATESWARA', image: '/images/god-venkateswara.jpg' },
  { id: 'subrahmanya', name: 'Lord Murugan / Subrahmanya (సుబ్రహ్మణ్య స్వామి)', code: 'SUBRAHMANYA', image: '/images/ayyappa-icon.jpg' },
  { id: 'rama', name: 'Lord Rama (శ్రీ రాముడు)', code: 'RAMA', image: '/images/hero-deity.jpg' },
  { id: 'hanuman', name: 'Lord Hanuman (శ్రీ ఆంజనేయ స్వామి)', code: 'HANUMAN', image: '/images/deity.jpg' },
  { id: 'krishna', name: 'Lord Krishna (శ్రీ కృష్ణుడు)', code: 'KRISHNA', image: '/images/god-krishna.jpg' },
  { id: 'lakshmi', name: 'Goddess Lakshmi (లక్ష్మీ దేవి)', code: 'LAKSHMI', image: '/images/lakshmi.jpg' },
];

const PRESET_LOGOS = [
  { id: 'ayyappa-icon', name: 'Lord Ayyappa Classic', url: '/images/ayyappa-icon.jpg' },
  { id: 'ayyappa-tiger', name: 'Ayyappa Swamy on Tiger', url: '/images/ayyappa-tiger-gold-bg.png' },
  { id: 'ayyappa-gold', name: 'Lord Ayyappa Golden', url: '/images/god-ayyappa.jpg' },
  { id: 'shiva', name: 'Lord Shiva Mahadeva', url: '/images/god-shiva.jpg' },
  { id: 'durga', name: 'Goddess Durga Bhavani', url: '/images/god-durga.jpg' },
  { id: 'ganesha', name: 'Lord Ganesha Vignaharta', url: '/images/god-ganesha.jpg' },
  { id: 'venkateswara', name: 'Lord Balaji Venkateswara', url: '/images/god-venkateswara.jpg' },
  { id: 'krishna', name: 'Lord Sri Krishna', url: '/images/god-krishna.jpg' },
  { id: 'lakshmi', name: 'Goddess Sri Mahalakshmi', url: '/images/lakshmi.jpg' },
  { id: 'emblem', name: 'Saranam Ayyappa Official Emblem', url: '/images/saranam-ayyappa-official-emblem.jpg' },
];

const LANGUAGE_LABELS: Record<string, { label: string; native: string }> = {
  te: { label: 'Telugu (తెలుగు)', native: 'తెలుగు' },
  kn: { label: 'Kannada (ಕನ್ನಡ)', native: 'ಕನ್ನಡ' },
  en: { label: 'English', native: 'English' },
  ta: { label: 'Tamil (தமிழ்)', native: 'தமிழ்' },
  hi: { label: 'Hindi (हिन्दी)', native: 'हिन्दी' },
  ml: { label: 'Malayalam (മലയാളം)', native: 'മലയാളം' },
};

@Injectable()
export class MasterService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fetch 12 Rashis with localized names directly from database
   */
  async getRashis(lang = 'te') {
    let langId = 1;
    try {
      const language = await this.prisma.language.findUnique({
        where: { code: lang },
      });
      if (language) langId = language.id;
    } catch {}

    const rashis = await this.prisma.rashi.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        translations: {
          where: { languageId: langId },
        },
      },
    });

    if (rashis.length > 0) {
      return rashis.map((r) => ({
        id: r.id,
        code: r.code,
        name: r.translations[0]?.name || r.code,
        sortOrder: r.sortOrder,
      }));
    }

    // Vedic Rashis fallback
    const RASHI_NAMES: Record<string, string[]> = {
      te: ['మేషం (Mesha)', 'వృషభం (Vrishabha)', 'మిథునం (Mithuna)', 'కర్కాటకం (Karkataka)', 'సింహం (Simha)', 'కన్య (Kanya)', 'తుల (Tula)', 'వృశ్చికం (Vrischika)', 'ధనుస్సు (Dhanus)', 'మకరం (Makara)', 'కుంభం (Kumbha)', 'మీనం (Meena)'],
      kn: ['ಮೇಷ (Mesha)', 'ವೃಷಭ (Vrishabha)', 'ಮಿಥುನ (Mithuna)', 'ಕರ್ಕಾಟಕ (Karkataka)', 'ಸಿಂಹ (Simha)', 'ಕನ್ಯಾ (Kanya)', 'ತುಲಾ (Tula)', 'ವೃಶ್ಚಿಕ (Vrischika)', 'ಧನುಸ್ಸು (Dhanus)', 'ಮಕರ (Makara)', 'ಕುಂಭ (Kumbha)', 'ಮೀನ (Meena)'],
      en: ['Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)', 'Karkataka (Cancer)', 'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrischika (Scorpio)', 'Dhanus (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)'],
      ta: ['மேஷம் (Mesha)', 'ரிஷபம் (Rishabha)', 'மிதுனம் (Mithunam)', 'கடகம் (Kadagam)', 'சிம்மம் (Simmam)', 'கன்னி (Kanni)', 'துலாம் (Thulam)', 'விருச்சிகம் (Viruchigam)', 'தனுசு (Thanusu)', 'மகரம் (Magaram)', 'கும்பம் (Kumbam)', 'மீனம் (Meenam)'],
      hi: ['मेष (Aries)', 'वृषभ (Taurus)', 'मिथुन (Gemini)', 'कर्क (Cancer)', 'सिंह (Leo)', 'कन्या (Virgo)', 'तुला (Libra)', 'वृश्चिक (Scorpio)', 'धनु (Sagittarius)', 'मकर (Capricorn)', 'कुंभ (Aquarius)', 'मीन (Pisces)'],
    };
    const list = RASHI_NAMES[lang] || RASHI_NAMES.en;
    return list.map((name, idx) => ({
      id: idx + 1,
      code: `RASHI_${idx + 1}`,
      name,
      sortOrder: idx + 1,
    }));
  }

  /**
   * Fetch 27 Nakshatras with localized names directly from database
   */
  async getNakshatras(lang = 'te') {
    let langId = 1;
    try {
      const language = await this.prisma.language.findUnique({
        where: { code: lang },
      });
      if (language) langId = language.id;
    } catch {}

    const nakshatras = await this.prisma.nakshatra.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        translations: {
          where: { languageId: langId },
        },
      },
    });

    if (nakshatras.length > 0) {
      return nakshatras.map((n) => ({
        id: n.id,
        code: n.code,
        name: n.translations[0]?.name || n.code,
        sortOrder: n.sortOrder,
      }));
    }

    const NAKSHATRA_NAMES = [
      'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
      'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
      'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
      'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
      'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
    ];
    return NAKSHATRA_NAMES.map((name, idx) => ({
      id: idx + 1,
      code: `NAKSHATRA_${idx + 1}`,
      name,
      sortOrder: idx + 1,
    }));
  }

  /**
   * Fetch supported languages directly from DB
   */
  async getLanguages() {
    try {
      const dbLangs = await this.prisma.language.findMany({
        orderBy: { id: 'asc' },
      });

      if (dbLangs.length > 0) {
        return dbLangs.map((l) => ({
          id: l.id,
          code: l.code,
          name: l.name,
          label: LANGUAGE_LABELS[l.code]?.label || `${l.name} (${l.code})`,
          nativeName: LANGUAGE_LABELS[l.code]?.native || l.name,
        }));
      }
    } catch {}

    return Object.entries(LANGUAGE_LABELS).map(([code, meta], idx) => ({
      id: idx + 1,
      code,
      name: meta.native,
      label: meta.label,
      nativeName: meta.native,
    }));
  }

  /**
   * Fetch distinct states from DB Temples and comprehensive Indian States
   */
  async getStates() {
    try {
      const dbStates = await this.prisma.temple.findMany({
        select: { state: true },
        distinct: ['state'],
        where: { state: { not: '' } },
      });
      const activeDbStateNames = dbStates.map((s) => s.state).filter(Boolean);
      // Merge with master list preserving priority of DB states
      const merged = Array.from(new Set([...activeDbStateNames, ...ALL_INDIAN_STATES]));
      return merged.map((state, idx) => ({
        id: idx + 1,
        name: state,
        code: state.toUpperCase().replace(/[^A-Z]/g, '_'),
      }));
    } catch {
      return ALL_INDIAN_STATES.map((state, idx) => ({
        id: idx + 1,
        name: state,
        code: state.toUpperCase().replace(/[^A-Z]/g, '_'),
      }));
    }
  }

  /**
   * Fetch districts for a specific state or all districts from DB
   */
  async getDistricts(state?: string) {
    if (state && STATE_DISTRICTS[state]) {
      return STATE_DISTRICTS[state].map((district, idx) => ({
        id: idx + 1,
        name: district,
        state,
      }));
    }

    try {
      const dbDistricts = await this.prisma.temple.findMany({
        where: state ? { state } : undefined,
        select: { district: true, state: true },
        distinct: ['district'],
      });
      const fromDb = dbDistricts
        .map((d) => d.district)
        .filter((d): d is string => Boolean(d && d.trim()));

      if (fromDb.length > 0) {
        const fallback = state && STATE_DISTRICTS[state] ? STATE_DISTRICTS[state] : [];
        const merged = Array.from(new Set([...fromDb, ...fallback]));
        return merged.map((name, idx) => ({
          id: idx + 1,
          name,
          state: state || 'India',
        }));
      }
    } catch {}

    const list = state && STATE_DISTRICTS[state] ? STATE_DISTRICTS[state] : STATE_DISTRICTS['Andhra Pradesh'];
    return list.map((name, idx) => ({
      id: idx + 1,
      name,
      state: state || 'Andhra Pradesh',
    }));
  }

  /**
   * Fetch deities from DB Temples and Hindu Devotional Pantheon
   */
  async getDeities(lang = 'te') {
    try {
      const setting = await this.prisma.appSetting.findUnique({
        where: { key: 'deities' }
      });
      let deities: any[] = [];
      if (setting && setting.value) {
        try { deities = JSON.parse(setting.value); } catch {}
      }
      if (!deities || deities.length === 0) {
        try {
          deities = require('../admin/deities-five-languages.json');
        } catch {}
      }
      if (Array.isArray(deities) && deities.length > 0) {
        const targetLang = (lang || 'te').toLowerCase().trim();
        return deities.map((d: any) => {
          const trans = d.translations || {};
          const loc = trans[targetLang] || trans['te'] || trans['en'] || {};
          return {
            id: d.id,
            name: loc.name || d.name,
            alternateName: loc.alternateName !== undefined ? loc.alternateName : d.alternateName,
            category: d.category,
            image: d.imageUrl,
            imageUrl: d.imageUrl,
            vahana: loc.vahana !== undefined ? loc.vahana : d.vahana,
            moolaMantra: loc.moolaMantra !== undefined ? loc.moolaMantra : d.moolaMantra,
            primaryTemple: loc.primaryTemple !== undefined ? loc.primaryTemple : d.primaryTemple,
            description: loc.description !== undefined ? loc.description : d.description,
            displayOrder: d.displayOrder,
            isActive: d.isActive !== false,
            translations: trans
          };
        });
      }
    } catch {}

    try {
      const dbDeities = await this.prisma.temple.findMany({
        select: { primaryDeity: true },
        distinct: ['primaryDeity'],
        where: { primaryDeity: { not: '' } },
      });
      const fromDb = dbDeities.map((d) => d.primaryDeity).filter(Boolean);
      const dbMapped = fromDb.map((deity, idx) => ({
        id: `db_${idx + 1}`,
        name: deity,
        code: deity.toUpperCase().replace(/[^A-Z]/g, '_'),
        image: '/images/ayyappa-icon.jpg',
      }));

      // Combine with default deities
      const existingNames = new Set(DEFAULT_DEITIES.map((d) => d.name.toLowerCase()));
      const filteredDb = dbMapped.filter((d) => !existingNames.has(d.name.toLowerCase()));
      return [...DEFAULT_DEITIES, ...filteredDb];
    } catch {
      return DEFAULT_DEITIES;
    }
  }

  /**
   * Get preset profile logos / avatars
   */
  getPresetLogos() {
    return PRESET_LOGOS;
  }

  /**
   * Unified Master Profile Options endpoint for web and mobile
   */
  async getProfileOptions(lang = 'te', state?: string) {
    const [rashis, nakshatras, languages, states, districts, deities] = await Promise.all([
      this.getRashis(lang),
      this.getNakshatras(lang),
      this.getLanguages(),
      this.getStates(),
      this.getDistricts(state),
      this.getDeities(),
    ]);

    return {
      rashis,
      nakshatras,
      languages,
      states,
      districts,
      stateDistrictsMap: STATE_DISTRICTS,
      deities,
      presetLogos: PRESET_LOGOS,
    };
  }
}
