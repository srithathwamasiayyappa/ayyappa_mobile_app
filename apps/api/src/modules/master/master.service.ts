import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UI_TRANSLATIONS } from './ui-translations.data';

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

// Deities are fetched strictly from MySQL database (deities table / app_settings key deities)
// Strictly ZERO hardcoded / mock / fallback deities.

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
   * Fetch deities strictly from DB (deities table or app_settings)
   * Strictly NO mock, fake, or fallback data.
   */
  async getDeities(lang = 'en') {
    const targetLang = (lang || 'en').toLowerCase().trim();

    // 1. Direct query from dedicated MySQL `deities` table
    try {
      const dbRows: any[] = await this.prisma.$queryRawUnsafe(
        'SELECT * FROM `deities` WHERE `is_active` = 1 ORDER BY `order_index` ASC, `id` ASC'
      );
      if (Array.isArray(dbRows) && dbRows.length > 0) {
        return dbRows.map((d: any) => {
          let localizedName = d.name; // English by default
          if (targetLang === 'te' && d.telugu_name) localizedName = d.telugu_name;
          else if (targetLang === 'ta' && d.tamil_name) localizedName = d.tamil_name;
          else if (targetLang === 'kn' && d.kannada_name) localizedName = d.kannada_name;
          else if (targetLang === 'hi' && d.hindi_name) localizedName = d.hindi_name;
          else if (targetLang === 'ml' && d.malayalam_name) localizedName = d.malayalam_name;
          else if (targetLang === 'en' && d.name) localizedName = d.name;

          return {
            id: d.slug || String(d.id),
            slug: d.slug || String(d.id),
            name: localizedName,
            englishName: d.name,
            teluguName: d.telugu_name || '',
            tamilName: d.tamil_name || '',
            kannadaName: d.kannada_name || '',
            hindiName: d.hindi_name || '',
            description: d.description || '',
            category: d.category || 'popular',
            image: d.image_url || '',
            imageUrl: d.image_url || '',
            isFeatured: Boolean(d.is_featured),
            orderIndex: d.order_index ?? 0,
            isActive: Boolean(d.is_active),
          };
        });
      }
    } catch (err) {
      console.warn('[MasterService] Direct deities table query notice:', err);
    }

    // 2. Query MySQL app_settings table (key: 'deities')
    try {
      const setting = await this.prisma.appSetting.findUnique({
        where: { key: 'deities' }
      });
      if (setting && setting.value) {
        const parsed = JSON.parse(setting.value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((d: any) => {
            const trans = d.translations || {};
            const loc = trans[targetLang] || trans['te'] || trans['en'] || {};
            return {
              id: d.id,
              slug: d.id,
              name: loc.name || d.name,
              englishName: d.name,
              description: loc.description || d.description || '',
              category: d.category || 'popular',
              image: d.imageUrl || d.image || '',
              imageUrl: d.imageUrl || d.image || '',
              isFeatured: Boolean(d.isFeatured || d.is_featured),
              orderIndex: d.displayOrder || d.orderIndex || 0,
              isActive: d.isActive !== false,
            };
          });
        }
      }
    } catch (settingErr) {
      console.warn('[MasterService] app_settings deities query notice:', settingErr);
    }

    // 3. Query distinct primaryDeity from Temples in DB if any
    try {
      const dbDeities = await this.prisma.temple.findMany({
        select: { primaryDeity: true },
        distinct: ['primaryDeity'],
        where: { primaryDeity: { not: '' } },
      });
      const fromDb = dbDeities.map((d) => d.primaryDeity).filter(Boolean);
      if (fromDb.length > 0) {
        return fromDb.map((deity, idx) => ({
          id: `db_${idx + 1}`,
          slug: `db_${idx + 1}`,
          name: deity,
          englishName: deity,
          description: '',
          category: 'popular',
          image: '',
          imageUrl: '',
          isFeatured: true,
          orderIndex: idx + 1,
          isActive: true,
        }));
      }
    } catch {}

    // Strictly return empty list if not in DB - ZERO fake or mock fallback data
    return [];
  }

  /**
   * Fetch complete UI translations dictionary directly from database / setting or fallback to master bundle
   */
  async getUiTranslations(lang = 'en') {
    const targetLang = (lang || 'en').toLowerCase().trim();
    try {
      const setting = await this.prisma.appSetting.findUnique({
        where: { key: `ui_translations_${targetLang}` },
      });
      if (setting && setting.value) {
        const parsed = JSON.parse(setting.value);
        if (parsed && typeof parsed === 'object') {
          return {
            ...(UI_TRANSLATIONS[targetLang] || UI_TRANSLATIONS.en || {}),
            ...parsed,
          };
        }
      }
    } catch {}

    return UI_TRANSLATIONS[targetLang] || UI_TRANSLATIONS.en || {};
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
