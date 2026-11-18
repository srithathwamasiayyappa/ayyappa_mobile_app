import { Platform } from 'react-native';
import {
  LanguageItem,
  DeityItem,
  PanchangamData,
  DevotionalCategoryItem,
  SupportedLanguage,
  RashiItem,
  NakshatraItem,
  DevoteeProfile,
  TempleItem,
  AnnadanamLocation,
  AnnadanamCampaign,
  DonationCategoryItem,
  MainTab,
  DevotionalNotification,
  BookmarkItem,
  DharmaKarthaDashboardStats,
  DharmaKarthaProfile,
  DharmaKarthaTemple,
  RegisterMandirPayload,
} from '../types';
import { PanchangamLocalEngine } from '../utils/panchangam';
import {
  MASTER_ANNADANAM_LOCATIONS,
  MASTER_ANNADANAM_CAMPAIGNS,
  MASTER_DONATION_CATEGORIES,
} from '../data/donationsData';
import allCategoriesData from '../data/allCategories.json';

// All 23 full devotional categories across 5 languages (te, kn, en, ta, hi)
export const FALLBACK_CATEGORIES: Record<SupportedLanguage, DevotionalCategoryItem[]> = {
  te: allCategoriesData.te as DevotionalCategoryItem[],
  kn: allCategoriesData.kn as DevotionalCategoryItem[],
  en: allCategoriesData.en as DevotionalCategoryItem[],
  ta: allCategoriesData.ta as DevotionalCategoryItem[],
  hi: allCategoriesData.hi as DevotionalCategoryItem[],
};

const DEFAULT_TICKERS: Record<SupportedLanguage, string> = {
  te: 'స్వామియే శరణం అయ్యప్ప || స్వామియే శరణం అయ్యప్ప || స్వామియే శరణం అయ్యప్ప',
  kn: 'ಸ್ವಾಮಿಯೇ ಶರಣಂ ಅಯ್ಯಪ್ಪ || ಸ್ವಾಮಿಯೇ ಶರಣಂ ಅಯ್ಯಪ್ಪ || ಸ್ವಾಮಿಯೇ ಶರಣಂ ಅಯ್ಯಪ್ಪ',
  en: 'Swamiye Saranam Ayyappa || Swamiye Saranam Ayyappa || Swamiye Saranam Ayyappa',
  ta: 'சுவாமியே சரணம் ஐயப்பா || சுவாமியே சரணம் ஐயப்பா || சுவாமியே சரணம் ஐயப்பா',
  hi: 'स्वामीये शरणम अय्यप्पा || स्वामीये शरणम अय्यप्पा || स्वामीये शरणम अय्यप्पा',
};

// Production Base URL for Saranam Ayyappa on cPanel (Default Active)
export const PRODUCTION_HOST = 'https://backendapis.saranamayyappa.in';
export const PRODUCTION_BASE_URL = `${PRODUCTION_HOST}/api/v1`;

// Local Host and Base URL for local development (fallback option)
export const LOCAL_HOST = Platform.select({
  web: 'http://localhost:4000',
  android: 'http://192.168.1.8:4000',
  ios: 'http://192.168.1.8:4000',
  default: 'http://192.168.1.8:4000',
});

export const LOCAL_BASE_URL = `${LOCAL_HOST}/api/v1`;

// Dynamic Host & API Base URL resolution:
// Checks process.env.EXPO_PUBLIC_API_URL first; defaults to PRODUCTION_BASE_URL
export const getApiBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return PRODUCTION_BASE_URL;
};

export const API_BASE_URL = getApiBaseUrl();

// Dynamic root host without /api/v1 for media, images, and static assets
export const getActiveHost = (): string => {
  return API_BASE_URL.replace(/\/api\/v1\/?$/, '');
};
export const ACTIVE_HOST = getActiveHost();

export interface HomeLogoData {
  success: boolean;
  logoUrl: string;
  title: string;
  heroGreetingTop?: string;
  heroGreetingMid?: string;
  heroGreetingBot?: string;
  tagline: string;
  description: string;
  primaryColor?: string;
  secondaryColor?: string;
  playStoreUrl?: string;
  appStoreUrl?: string;
  socialLinks?: {
    youtube?: string;
    telegram?: string;
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
  };
  updatedAt?: string;
}

export const DEFAULT_HOME_LOGO: HomeLogoData = {
  success: true,
  logoUrl: `${ACTIVE_HOST}/images/saranam-ayyappa-logo-1794898267923.png`,
  title: 'Thathwamasi Ayyappa',
  heroGreetingTop: 'Thathwamasi',
  heroGreetingMid: 'Ayyappa',
  heroGreetingBot: 'Swamy!',
  tagline: 'Connect.. Pray.. Serve..',
  description: 'A sacred digital sanctuary and comprehensive devotional guide for Lord Ayyappa devotees and Dharma Karthas worldwide.',
  primaryColor: '#06452E',
  secondaryColor: '#CAA049',
  playStoreUrl: 'https://play.google.com/store/apps/details?id=com.saranamayyappa.app',
  appStoreUrl: 'https://apps.apple.com/app/saranam-ayyappa/id123456789',
  socialLinks: {
    youtube: 'https://www.youtube.com/@SaranamAyyappaOfficial',
    telegram: 'https://t.me/saranam_ayyappa_satsang',
    instagram: 'https://www.instagram.com/saranamayyappa_official',
    facebook: 'https://www.facebook.com/saranamayyappaportal',
    whatsapp: 'https://whatsapp.com/channel/saranamayyappa',
  },
  updatedAt: '2026-11-17T08:27:04.936Z',
};

// Safe JSON parser to eliminate raw 'JSON Parse error: Unexpected character: <' when server returns HTML (e.g. 404 or 502)
async function safeFetchJson(url: string, options?: RequestInit, defaultErrMsg = 'Request failed'): Promise<any> {
  const res = await fetch(url, options);
  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    if (res.status === 404) {
      throw new Error('API server endpoint not found on live domain (HTTP 404). Please ensure Node.js is running in cPanel.');
    }
    if (res.status >= 500) {
      throw new Error(`Server error on live domain (HTTP ${res.status}). Please check cPanel logs.`);
    }
    throw new Error(defaultErrMsg || `Server returned invalid response (HTTP ${res.status})`);
  }
  if (!res.ok) {
    throw new Error(json?.message || defaultErrMsg);
  }
  return json;
}

export const ApiService = {
  // 0. Check API Health (Status, Database Connectivity, Timestamp)
  async checkHealth(): Promise<{ status: string; service?: string; database?: string; timestamp?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        return { status: 'error', database: `HTML response (${res.status}). Server not routed.` };
      }
    } catch (e: any) {
      return { status: 'offline', database: e?.message || 'Network unreachable' };
    }
  },

  // 1. Fetch Languages directly from DB via API (Strictly no fallback, static, or fake data)
  async getLanguages(): Promise<LanguageItem[]> {
    const data = await safeFetchJson(
      `${API_BASE_URL}/languages`,
      undefined,
      'Failed to fetch languages from database'
    );
    if (!Array.isArray(data)) {
      throw new Error('Invalid languages response received from server');
    }
    return data;
  },

  // 1.1 Fetch Deities directly from DB via API with server-side search and category filtering
  // (Strictly no fallback, static, or fake data)
  async getDeities(params?: {
    search?: string;
    category?: string;
    featured?: boolean;
  }): Promise<DeityItem[]> {
    const queryParts: string[] = [];
    if (params?.search && params.search.trim()) {
      queryParts.push(`search=${encodeURIComponent(params.search.trim())}`);
    }
    if (params?.category && params.category !== 'all') {
      queryParts.push(`category=${encodeURIComponent(params.category)}`);
    }
    if (params?.featured !== undefined) {
      queryParts.push(`featured=${params.featured ? 'true' : 'false'}`);
    }

    const qs = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    const res = await safeFetchJson(
      `${API_BASE_URL}/master/deities${qs}`,
      undefined,
      'Failed to fetch deities from database'
    );

    const items = res?.data || res;
    if (!Array.isArray(items)) {
      throw new Error('Invalid deities response received from server');
    }
    return items;
  },

  // 2. Fetch Panchangam with Instant High-Precision Astronomical Fallback & Live Coordinates
  async getPanchangam(
    lang: SupportedLanguage,
    dateIso?: string,
    city = 'Hyderabad',
    customCoords?: { lat: number; lng: number }
  ): Promise<PanchangamData> {
    try {
      const coordParams = customCoords ? `&lat=${customCoords.lat}&lng=${customCoords.lng}` : '';
      const url = dateIso
        ? `${API_BASE_URL}/panchangam?lang=${lang}&date=${dateIso}&city=${encodeURIComponent(city)}${coordParams}`
        : `${API_BASE_URL}/panchangam?lang=${lang}&city=${encodeURIComponent(city)}${coordParams}`;
      const res = await fetch(url);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Fallback
    }
    const targetDate = dateIso ? new Date(dateIso) : new Date();
    return PanchangamLocalEngine.calculate(targetDate, city, lang, customCoords);
  },

  // 3. Fetch Devotional Categories dynamically from DB via API (Strictly NO fallback, static, or fake data)
  async getCategories(
    lang: SupportedLanguage = 'en',
    search?: string,
  ): Promise<DevotionalCategoryItem[]> {
    const query = search?.trim() ? `&search=${encodeURIComponent(search.trim())}` : '';

    const fetchFromEndpoint = async (baseUrl: string) => {
      const res = await fetch(`${baseUrl}/categories?lang=${lang}${query}`);
      if (!res.ok) {
        throw new Error(`Failed to load categories (Status: ${res.status})`);
      }
      const data = await res.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid categories response received from server');
      }
      return data.map((item: any) => ({
        id: String(item.id),
        slug: item.slug,
        title: item.title,
        description: item.description || '',
        isAudio: Boolean(item.isAudio),
        audioDurationSec: 40,
        totalTime: '00:40',
        chantLyric: item.description,
      }));
    };

    // 1. Try local/configured API_BASE_URL
    try {
      return await fetchFromEndpoint(API_BASE_URL);
    } catch (localErr) {
      // 2. Try PRODUCTION_BASE_URL
      try {
        return await fetchFromEndpoint(PRODUCTION_BASE_URL);
      } catch (prodErr) {
        console.warn('Categories DB fetch error (Strictly no fake fallback):', localErr);
        throw localErr;
      }
    }
  },

  // 3b. Fetch Home Page 10 Devotional Services dynamically from DB via API
  async getHomeServices(
    lang: SupportedLanguage = 'en'
  ): Promise<Array<{ id: string; key: string; title: string; icon?: string; displayOrder: number }>> {
    const fetchServices = async (baseUrl: string) => {
      const res = await fetch(`${baseUrl}/home/categories?lang=${lang}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
      if (Array.isArray(json) && json.length > 0) {
        return json;
      }
      throw new Error('Invalid home services data');
    };

    try {
      return await fetchServices(API_BASE_URL);
    } catch {
      try {
        return await fetchServices(PRODUCTION_BASE_URL);
      } catch (e) {
        console.warn('Home services DB fetch error:', e);
        return [];
      }
    }
  },

  // 4. Fetch Specific Record / Subpage Detail from DB via API (Strictly NO fake or fallback data)
  async getCategoryDetail(id: string, lang: SupportedLanguage = 'en'): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/categories/${id}?lang=${lang}`);
      if (res.ok) return await res.json();
    } catch {}

    try {
      const res = await fetch(`${PRODUCTION_BASE_URL}/categories/${id}?lang=${lang}`);
      if (res.ok) return await res.json();
    } catch {}

    return null;
  },

  // 4b. Fetch Temples in India strictly from DB via API (No static / fallback / fake data)
  async getTemples(
    lang: SupportedLanguage,
    query?: string,
    deityId?: string
  ): Promise<TempleItem[]> {
    const q = query ? encodeURIComponent(query.trim()) : '';
    const d = deityId && deityId !== 'all' ? encodeURIComponent(deityId.trim()) : '';
    const url = `${API_BASE_URL}/temples?lang=${lang}${q ? `&q=${q}` : ''}${d ? `&deity=${d}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch temples from server (HTTP ${res.status})`);
    }
    const json = await res.json();
    const list = Array.isArray(json) ? json : json.data;
    if (Array.isArray(list)) {
      return list;
    }
    return [];
  },

  // 4c. Fetch Temple Profile Detail strictly from DB via API (No static / fallback / fake data)
  async getTempleDetail(templeId: string, lang: SupportedLanguage): Promise<TempleItem | null> {
    const res = await fetch(`${API_BASE_URL}/temples/${encodeURIComponent(templeId)}?lang=${lang}`);
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch temple details from server (HTTP ${res.status})`);
    }
    const json = await res.json();
    return json?.data || json || null;
  },

  // 4d. Fetch Today's Annadanam Locations
  async getAnnadanamLocations(lang: SupportedLanguage = 'en'): Promise<AnnadanamLocation[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/annadanam/locations?lang=${lang}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (e) {
      // Fallback
    }
    return MASTER_ANNADANAM_LOCATIONS;
  },

  // 4e. Fetch Annadanam Contribution Campaigns
  async getAnnadanamCampaigns(lang: SupportedLanguage = 'en'): Promise<AnnadanamCampaign[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/annadanam/campaigns?lang=${lang}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (e) {
      // Fallback
    }
    return MASTER_ANNADANAM_CAMPAIGNS;
  },

  // 4f. Fetch Donation Categories
  async getDonationCategories(lang: SupportedLanguage = 'en'): Promise<DonationCategoryItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/donations/categories?lang=${lang}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (e) {
      // Fallback
    }
    return MASTER_DONATION_CATEGORIES;
  },

  // 5. Fetch Scrolling Ticker Mantra with Fallback
  async getTickerMantra(lang: SupportedLanguage): Promise<{ text: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/home/ticker?lang=${lang}`);
      if (res.ok) return res.json();
    } catch (e) {
      // Fallback
    }
    return { text: DEFAULT_TICKERS[lang] || DEFAULT_TICKERS.te };
  },

  // 6. Dynamic App Title based on selected language
  getAppTitle(lang: string): string {
    switch (lang) {
      case 'kn':
        return 'ಶರಣಂ ಅಯ್ಯಪ್ಪ';
      case 'en':
        return 'Saranam Ayyappa';
      case 'ta':
        return 'சரணம் ஐயப்பா';
      case 'hi':
        return 'शरणम् अय्यप्पा';
      case 'te':
      default:
        return 'శరణం అయ్యప్ప';
    }
  },

  // 7. Auth: Send OTP
  async sendOtp(phoneNumber: string, type: 'login' | 'register' | 'delete_account' = 'login') {
    return safeFetchJson(
      `${API_BASE_URL}/auth/send-otp`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, type }),
      },
      'Failed to send OTP'
    );
  },

  // 8. Auth: Register with Full Name + Mobile + OTP
  async registerWithOtp(data: {
    fullName: string;
    phoneNumber: string;
    otp: string;
    email?: string;
    preferredLang?: string;
  }) {
    return safeFetchJson(
      `${API_BASE_URL}/auth/register-otp`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      'Registration failed'
    );
  },

  // 9. Auth: Login with Mobile + OTP
  async loginWithOtp(phoneNumber: string, otp: string) {
    return safeFetchJson(
      `${API_BASE_URL}/auth/login-otp`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp }),
      },
      'Login failed'
    );
  },

  // 10. Auth: Devotee Registration (Password fallback)
  async registerDevotee(data: {
    phoneNumber: string;
    password?: string;
    fullName?: string;
    email?: string;
    preferredLang?: string;
  }) {
    return safeFetchJson(
      `${API_BASE_URL}/auth/register`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      'Registration failed'
    );
  },

  // 11. Auth: Devotee Login (Mobile number or Email + Password)
  async loginDevotee(identifier: string, password?: string) {
    return safeFetchJson(
      `${API_BASE_URL}/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      },
      'Login failed'
    );
  },

  // 12. Auth: Google Login with Cryptographically Verified idToken
  async loginWithGoogle(data: { idToken: string; email?: string; fullName?: string; googleId?: string; photoUrl?: string }) {
    return safeFetchJson(
      `${API_BASE_URL}/auth/google`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken: data.idToken,
          email: data.email,
          fullName: data.fullName,
          googleId: data.googleId,
        }),
      },
      'Google sign-in failed'
    );
  },

  // 12a. Auth: Apple Sign-In & Registration with Cryptographically Verified identityToken
  async loginWithApple(data: {
    identityToken: string;
    authorizationCode?: string;
    fullName?: string;
    email?: string;
    user?: any;
  }) {
    return safeFetchJson(
      `${API_BASE_URL}/auth/apple`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      'Apple sign-in failed'
    );
  },

  // 12b. Auth: Firebase Phone OTP Token Verification
  async verifyFirebasePhoneToken(data: {
    idToken: string;
    intent: 'LOGIN' | 'REGISTER';
    fullName?: string;
    preferredLang?: string;
  }) {
    return safeFetchJson(
      `${API_BASE_URL}/auth/firebase-phone`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      'Firebase phone verification failed'
    );
  },

  // 12c. Auth: Check if mobile number is already registered in MariaDB
  async checkPhone(phoneNumber: string): Promise<{ isRegistered: boolean; isSuspended?: boolean; phoneNumber: string }> {
    return safeFetchJson(
      `${API_BASE_URL}/auth/check-phone`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      },
      'Failed to check mobile registration status'
    );
  },

  // 10. Contact: Submit Devotee Inquiry / Feedback
  async submitContactInquiry(data: { name: string; phone: string; email?: string; message: string }) {
    return safeFetchJson(
      `${API_BASE_URL}/contact/inquiry`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      'Failed to submit inquiry'
    );
  },

  // 11. Contact: Get Official Contact Information
  async getContactInfo(lang: SupportedLanguage = 'te') {
    try {
      const res = await fetch(`${API_BASE_URL}/contact?lang=${lang}`);
      if (res.ok) return await res.json();
    } catch {}

    const APP_NAMES: Record<string, string> = {
      te: 'శరణం అయ్యప్ప భక్త సహాయ కేంద్రం',
      kn: 'ಶರಣಂ ಅಯ್ಯಪ್ಪ ಭಕ್ತ ಸಹಾಯ ಕೇಂದ್ರ',
      en: 'Saranam Ayyappa Devotional Portal',
      ta: 'சரணம் ஐயப்பா பக்தர் உதவி மையம்',
      hi: 'शरणम् अय्यप्पा भक्त सहायता केंद्र',
    };

    const TIMINGS: Record<string, string> = {
      te: 'ఉదయం: 3:00 AM – 1:00 PM | సాయంత్రం: 3:00 PM – 11:00 PM (హరివరాసనం)',
      kn: 'ಬೆಳಗ್ಗೆ: 3:00 AM – 1:00 PM | ಸಂಜೆ: 3:00 PM – 11:00 PM (ಹರಿವರಾಸನಂ)',
      en: 'Morning: 3:00 AM – 1:00 PM | Evening: 3:00 PM – 11:00 PM (Harivarasanam)',
      ta: 'காலை: 3:00 AM – 1:00 PM | மாலை: 3:00 PM – 11:00 PM (ஹரிவராசனம்)',
      hi: 'प्रातः: 3:00 AM – 1:00 PM | सायं: 3:00 PM – 11:00 PM (हरिवरासनम्)',
    };

    const ADDRESSES: Record<string, string> = {
      te: 'ట్రావెన్‌కోర్ దేవస్వొం బోర్డు, శబరిమల సన్నిధానం, పతనంతిట్ట, కేరళ - 689662',
      kn: 'ಟ್ರಾವಂಕೋರ್ ದೇವಸ್ವಂ ಮಂಡಳಿ, ಶಬರಿಮಲೆ ಸನ್ನಿಧಾನಂ, ಪತ್ತನಂತಿಟ್ಟ, ಕೇರಳ - 689662',
      en: 'Travancore Devaswom Board, Sabarimala Sannidhanam, Pathanamthitta, Kerala - 689662',
      ta: 'திருவிதாங்கூர் தேவஸ்வம் போர்டு, சபரிமலை சன்னிதானம், பத்தனம்திட்டா, கேரளா - 689662',
      hi: 'त्रावणकोर देवस्वोम बोर्ड, सबरीमाला सन्निधानम्, पथानामथिट्टा, केरल - 689662',
    };

    return {
      appName: APP_NAMES[lang] || APP_NAMES.en,
      email: 'support@ayyappa.org',
      helpline: '+91 4735 202028',
      whatsapp: '+91 94477 95577',
      address: ADDRESSES[lang] || ADDRESSES.en,
      templeTimings: TIMINGS[lang] || TIMINGS.en,
    };
  },

  // 12. Dynamic Splash: Get currently published active splash asset from MariaDB
  async getActiveSplash(platform: string = Platform.OS) {
    try {
      const res = await fetch(`${API_BASE_URL}/mobile/splash/active?platform=${platform}`);
      if (res.ok) {
        const json = await res.json();
        return json.data || null;
      }
    } catch (e) {
      // Offline / Network fail - caller falls back to cached/bundled asset
    }
    return null;
  },

  // 13. Master Data: Get 12 Vedic Rashis
  async getRashis(lang: SupportedLanguage = 'te'): Promise<RashiItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/master/rashis?lang=${lang}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) return json.data;
      }
    } catch {}
    // Offline Vedic Fallback
    const RASHI_FALLBACKS: Record<SupportedLanguage, string[]> = {
      te: ['మేషం (Mesha)', 'వృషభం (Vrishabha)', 'మిథునం (Mithuna)', 'కర్కాటకం (Karkataka)', 'సింహం (Simha)', 'కన్య (Kanya)', 'తుల (Tula)', 'వృశ్చికం (Vrischika)', 'ధనుస్సు (Dhanus)', 'మకరం (Makara)', 'కుంభం (Kumbha)', 'మీనం (Meena)'],
      kn: ['ಮೇಷ (Mesha)', 'ವೃಷಭ (Vrishabha)', 'ಮಿಥುನ (Mithuna)', 'ಕರ್ಕಾಟಕ (Karkataka)', 'ಸಿಂಹ (Simha)', 'ಕನ್ಯಾ (Kanya)', 'ತುಲಾ (Tula)', 'ವೃಶ್ಚಿಕ (Vrischika)', 'ಧನುಸ್ಸು (Dhanus)', 'ಮಕರ (Makara)', 'ಕುಂಭ (Kumbha)', 'ಮೀನ (Meena)'],
      en: ['Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)', 'Karkataka (Cancer)', 'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrischika (Scorpio)', 'Dhanus (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)'],
      ta: ['மேஷம் (Mesha)', 'ரிஷபம் (Rishabha)', 'மிதுனம் (Mithunam)', 'கடகம் (Kadagam)', 'சிம்மம் (Simmam)', 'கன்னி (Kanni)', 'துலாம் (Thulam)', 'விருச்சிகம் (Viruchigam)', 'தனுசு (Thanusu)', 'மகரம் (Magaram)', 'கும்பம் (Kumbam)', 'மீனம் (Meenam)'],
      hi: ['मेष (Aries)', 'वृषभ (Taurus)', 'मिथुन (Gemini)', 'कर्क (Cancer)', 'सिंह (Leo)', 'कन्या (Virgo)', 'तुला (Libra)', 'वृश्चिक (Scorpio)', 'धनु (Sagittarius)', 'मकर (Capricorn)', 'कुंभ (Aquarius)', 'मीन (Pisces)'],
    };
    return (RASHI_FALLBACKS[lang] || RASHI_FALLBACKS.en).map((name, idx) => ({
      id: idx + 1,
      code: `RASHI_${idx + 1}`,
      name,
      sortOrder: idx + 1,
    }));
  },

  // 14. Master Data: Get 27 Vedic Nakshatras
  async getNakshatras(lang: SupportedLanguage = 'te'): Promise<NakshatraItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/master/nakshatras?lang=${lang}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) return json.data;
      }
    } catch {}
    // Offline Vedic Fallback
    const NAKSHATRA_NAMES = [
      'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
      'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
      'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
      'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha',
      'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
    ];
    return NAKSHATRA_NAMES.map((name, idx) => ({
      id: idx + 1,
      code: `NAKSHATRA_${idx + 1}`,
      name,
      sortOrder: idx + 1,
    }));
  },

  // 14.1 Master Data: Get States dynamically from DB via API
  async getStates(): Promise<{ id: number | string; name: string }[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/master/states`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) return json.data;
      }
    } catch {}
    const defaultStates = [
      'Andhra Pradesh', 'Telangana', 'Kerala', 'Tamil Nadu', 'Karnataka',
      'Maharashtra', 'Gujarat', 'Odisha', 'Delhi', 'Uttar Pradesh'
    ];
    return defaultStates.map((name, idx) => ({ id: idx + 1, name }));
  },

  // 14.2 Master Data: Get Districts for a State dynamically from DB via API
  async getDistricts(stateName?: string): Promise<{ id: number | string; name: string }[]> {
    try {
      const url = stateName
        ? `${API_BASE_URL}/master/districts?state=${encodeURIComponent(stateName)}`
        : `${API_BASE_URL}/master/districts`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) return json.data;
      }
    } catch {}
    const defaultDistricts: Record<string, string[]> = {
      'Andhra Pradesh': [
        'Visakhapatnam', 'Vijayawada (NTR)', 'Guntur', 'Tirupati', 'Kurnool',
        'Nellore', 'Kakinada', 'Rajahmundry', 'Anantapur', 'Kadapa', 'Eluru', 'Ongole', 'Srikakulam', 'Vizianagaram'
      ],
      'Telangana': [
        'Hyderabad', 'Warangal', 'Karimnagar', 'Nizamabad', 'Khammam',
        'Nalgonda', 'Mahabubnagar', 'Rangareddy', 'Medak', 'Adilabad', 'Siddipet', 'Suryapet'
      ],
      'Kerala': [
        'Pathanamthitta', 'Thiruvananthapuram', 'Kollam', 'Alappuzha', 'Kottayam',
        'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode'
      ],
      'Tamil Nadu': [
        'Chennai', 'Madurai', 'Coimbatore', 'Tiruchirappalli', 'Salem',
        'Tirunelveli', 'Kanchipuram', 'Thanjavur', 'Vellore'
      ],
      'Karnataka': [
        'Bengaluru Urban', 'Mysuru', 'Mangaluru (Dakshina Kannada)', 'Hubballi-Dharwad', 'Belagavi', 'Udupi'
      ],
    };
    const list = (stateName && defaultDistricts[stateName]) ? defaultDistricts[stateName] : (defaultDistricts['Andhra Pradesh'] || []);
    return list.map((name, idx) => ({ id: idx + 1, name }));
  },

  // 14.3 Notifications: Fetch Notifications dynamically via API (Strictly no fallback or static mock data)
  async getNotifications(params?: {
    role?: 'CUSTOMER' | 'DHARMA_KARTHA';
    userId?: number;
    page?: number;
    limit?: number;
    category?: string;
    unreadOnly?: boolean;
    search?: string;
  }): Promise<{ data: DevotionalNotification[]; total: number; unreadCount?: number }> {
    try {
      const role = params?.role || 'CUSTOMER';
      const queryParts: string[] = [`role=${encodeURIComponent(role)}`];
      if (params?.page) queryParts.push(`page=${params.page}`);
      if (params?.limit) queryParts.push(`limit=${params.limit}`);
      if (params?.category) queryParts.push(`category=${encodeURIComponent(params.category)}`);
      if (params?.unreadOnly) queryParts.push('unreadOnly=true');
      if (params?.search && params.search.trim()) queryParts.push(`search=${encodeURIComponent(params.search.trim())}`);

      const headers: Record<string, string> = {};
      if (params?.userId) headers['x-user-id'] = String(params.userId);

      const url = `${API_BASE_URL}/notifications?${queryParts.join('&')}`;
      const res = await fetch(url, { headers });
      if (res.ok) {
        const json = await res.json();
        return {
          data: Array.isArray(json.data) ? json.data : [],
          total: json.total || (Array.isArray(json.data) ? json.data.length : 0),
        };
      }
    } catch (e) {
      console.warn('[Notifications] API fetch note:', e);
    }
    return { data: [], total: 0 };
  },

  // 14.4 Notifications: Get Unread Count dynamically via API
  async getUnreadNotificationCount(params?: {
    role?: 'CUSTOMER' | 'DHARMA_KARTHA';
    userId?: number;
  }): Promise<number> {
    try {
      const role = params?.role || 'CUSTOMER';
      const headers: Record<string, string> = {};
      if (params?.userId) headers['x-user-id'] = String(params.userId);

      const url = `${API_BASE_URL}/notifications/unread-count?role=${encodeURIComponent(role)}`;
      const res = await fetch(url, { headers });
      if (res.ok) {
        const json = await res.json();
        return json.unreadCount || 0;
      }
    } catch {}
    return 0;
  },

  // 14.5 Notifications: Mark Single Notification as Read dynamically via API
  async markNotificationAsRead(id: string | number, params?: {
    role?: 'CUSTOMER' | 'DHARMA_KARTHA';
    userId?: number;
  }): Promise<boolean> {
    try {
      const role = params?.role || 'CUSTOMER';
      const headers: Record<string, string> = {};
      if (params?.userId) headers['x-user-id'] = String(params.userId);

      const url = `${API_BASE_URL}/notifications/${id}/read?role=${encodeURIComponent(role)}`;
      const res = await fetch(url, { method: 'PATCH', headers });
      return res.ok;
    } catch {
      return false;
    }
  },

  // 14.6 Notifications: Mark All Notifications as Read dynamically via API
  async markAllNotificationsAsRead(params?: {
    role?: 'CUSTOMER' | 'DHARMA_KARTHA';
    userId?: number;
  }): Promise<boolean> {
    try {
      const role = params?.role || 'CUSTOMER';
      const headers: Record<string, string> = {};
      if (params?.userId) headers['x-user-id'] = String(params.userId);

      const url = `${API_BASE_URL}/notifications/mark-all-read?role=${encodeURIComponent(role)}`;
      const res = await fetch(url, { method: 'PATCH', headers });
      return res.ok;
    } catch {
      return false;
    }
  },

  // 15. Devotee Profile: Get Profile
  async getDevoteeProfile(userId: number, lang: SupportedLanguage = 'te'): Promise<DevoteeProfile | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/users/me/profile?userId=${userId}&lang=${lang}`);
      if (res.ok) {
        const json = await res.json();
        return json.data || null;
      }
    } catch {}
    return null;
  },

  // 16. Devotee Profile: Update Profile
  async updateDevoteeProfile(userId: number, data: Partial<DevoteeProfile>): Promise<DevoteeProfile | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/users/me/profile?userId=${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': String(userId),
        },
        body: JSON.stringify({ ...data, userId }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to update profile');
      }
      return json.data || null;
    } catch (err: any) {
      console.warn('updateDevoteeProfile error:', err.message);
      throw err;
    }
  },

  // 17. Devotee Profile: Upload Photo
  async uploadDevoteePhoto(userId: number, imageBase64: string): Promise<string | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/users/me/profile/photo?userId=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': String(userId),
        },
        body: JSON.stringify({ userId, imageBase64 }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to upload photo');
      }
      return json.profileImageUrl || null;
    } catch (err: any) {
      console.warn('uploadDevoteePhoto error:', err.message);
      throw err;
    }
  },

  // 17b. Devotee Profile: Request Account Deletion with Verified OTP
  async requestAccountDeletion(userId: number, otp: string, reason?: string) {
    return safeFetchJson(
      `${API_BASE_URL}/users/me/request-deletion`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': String(userId),
        },
        body: JSON.stringify({ userId, otp, reason }),
      },
      'Failed to request account deletion'
    );
  },

  // 17c. Devotee Bookmarks: Dynamic Fetch from DB via API response
  async getUserBookmarks(userId: number): Promise<BookmarkItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/users/me/bookmarks?userId=${userId}`, {
        headers: { 'x-user-id': String(userId) },
      });
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (e: any) {
      console.warn('getUserBookmarks error:', e?.message);
    }
    return [];
  },

  // 17d. Devotee Bookmarks: Add Bookmark to DB
  async addUserBookmark(userId: number, bookmark: { itemId: string; itemType: string; title: string; subtitle?: string; thumbnailUrl?: string }) {
    try {
      const res = await fetch(`${API_BASE_URL}/users/me/bookmarks?userId=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': String(userId),
        },
        body: JSON.stringify(bookmark),
      });
      return await res.json();
    } catch (e: any) {
      console.warn('addUserBookmark error:', e?.message);
      return { success: false };
    }
  },

  // 17e. Devotee Bookmarks: Remove Bookmark from DB
  async removeUserBookmark(userId: number, bookmarkId: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/users/me/bookmarks/delete?userId=${userId}&id=${encodeURIComponent(bookmarkId)}`, {
        headers: { 'x-user-id': String(userId) },
      });
      return await res.json();
    } catch (e: any) {
      console.warn('removeUserBookmark error:', e?.message);
      return { success: false };
    }
  },

  // 17f. Devotee Preferences: Get Preferences from DB
  async getUserPreferences(userId: number) {
    try {
      const res = await fetch(`${API_BASE_URL}/users/me/preferences?userId=${userId}`, {
        headers: { 'x-user-id': String(userId) },
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || null;
      }
    } catch (e: any) {
      console.warn('getUserPreferences error:', e?.message);
    }
    return null;
  },

  // 17g. Devotee Preferences: Update Preferences in DB
  async updateUserPreferences(userId: number, prefs: { preferredLang?: string; devotionalUpdatesEnabled?: boolean }) {
    try {
      const res = await fetch(`${API_BASE_URL}/users/me/preferences?userId=${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': String(userId),
        },
        body: JSON.stringify(prefs),
      });
      return await res.json();
    } catch (e: any) {
      console.warn('updateUserPreferences error:', e?.message);
      return { success: false };
    }
  },

  // 18. Dynamic CMS Document: Terms & Conditions, Privacy Policy, Refund Policy, About Us (dynamically fetched from DB via API response)
  async getCmsDocument(
    slug: 'terms_conditions' | 'privacy_policy' | 'about_us' | 'refund_policy' | 'sabarimala_guidelines',
    lang: SupportedLanguage = 'en',
  ) {
    try {
      const res = await fetch(`${API_BASE_URL}/home/cms/${slug}?lang=${lang}`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.value) {
          return {
            title: json.description || slug.replace('_', ' ').toUpperCase(),
            content: json.value,
            updatedAt: json.updatedAt,
          };
        }
      }
    } catch (err: any) {
      console.warn(`Failed to fetch CMS document ${slug} from DB API:`, err?.message);
    }
    return null;
  },

  // 19. Dynamic App Branding
  async getAppBranding() {
    try {
      const res = await fetch(`${API_BASE_URL}/mobile/branding`);
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}
    return {
      appName: 'Saranam Ayyappa',
      tagline: 'Swamiye Saranam Ayyappa',
      subtitle: 'Sacred Devotion Portal',
      version: 1,
    };
  },

  // 20. Official Home Logo & Identity (Uses Active Local or Production Base URL)
  async getHomeLogo(): Promise<HomeLogoData> {
    const normalizeLogo = (data: any, usedBaseUrl: string = API_BASE_URL): HomeLogoData => {
      let rawUrl = data?.logoUrl || '/images/saranam-ayyappa-logo-1794898267923.png';
      if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
        const host = usedBaseUrl.replace(/\/api\/v1\/?$/, '');
        rawUrl = `${host}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
      } else if (rawUrl.includes('backendapis.saranamayyappa.in') && usedBaseUrl.includes('192.168.1.8')) {
        const host = usedBaseUrl.replace(/\/api\/v1\/?$/, '');
        rawUrl = rawUrl.replace('https://backendapis.saranamayyappa.in', host);
      }
      return {
        success: true,
        logoUrl: rawUrl,
        title: data?.title || DEFAULT_HOME_LOGO.title,
        heroGreetingTop: data?.heroGreetingTop || DEFAULT_HOME_LOGO.heroGreetingTop,
        heroGreetingMid: data?.heroGreetingMid || DEFAULT_HOME_LOGO.heroGreetingMid,
        heroGreetingBot: data?.heroGreetingBot || DEFAULT_HOME_LOGO.heroGreetingBot,
        tagline: data?.tagline || DEFAULT_HOME_LOGO.tagline,
        description: data?.description || DEFAULT_HOME_LOGO.description,
        primaryColor: data?.primaryColor || DEFAULT_HOME_LOGO.primaryColor,
        secondaryColor: data?.secondaryColor || DEFAULT_HOME_LOGO.secondaryColor,
        playStoreUrl: data?.playStoreUrl || DEFAULT_HOME_LOGO.playStoreUrl,
        appStoreUrl: data?.appStoreUrl || DEFAULT_HOME_LOGO.appStoreUrl,
        socialLinks: {
          youtube: data?.socialLinks?.youtube || DEFAULT_HOME_LOGO.socialLinks?.youtube,
          telegram: data?.socialLinks?.telegram || DEFAULT_HOME_LOGO.socialLinks?.telegram,
          instagram: data?.socialLinks?.instagram || DEFAULT_HOME_LOGO.socialLinks?.instagram,
          facebook: data?.socialLinks?.facebook || DEFAULT_HOME_LOGO.socialLinks?.facebook,
          whatsapp: data?.socialLinks?.whatsapp || DEFAULT_HOME_LOGO.socialLinks?.whatsapp,
        },
        updatedAt: data?.updatedAt || DEFAULT_HOME_LOGO.updatedAt,
      };
    };

    // 1. Primary: Try active local API_BASE_URL
    try {
      const res = await fetch(`${API_BASE_URL}/home/logo`);
      if (res.ok) {
        const json = await res.json();
        if (json) return normalizeLogo(json, API_BASE_URL);
      }
    } catch {
      // Local endpoint unreachable, try fallback
    }

    // 2. Fallback: Try production base URL
    try {
      const res = await fetch(`${PRODUCTION_BASE_URL}/home/logo`);
      if (res.ok) {
        const json = await res.json();
        if (json) return normalizeLogo(json, PRODUCTION_BASE_URL);
      }
    } catch {}

    return DEFAULT_HOME_LOGO;
  },

  async getBottomTabs(lang: SupportedLanguage = 'en'): Promise<Array<{ key: MainTab; label: string; icon: string; order: number }>> {
    const fallbackTabs: Array<{ key: MainTab; label: string; icon: string; order: number }> = [
      { key: 'home', label: 'Home', icon: 'home', order: 1 },
      { key: 'services', label: 'Services', icon: 'services', order: 2 },
      { key: 'temples', label: 'Temples', icon: 'temples', order: 3 },
      { key: 'panchangam', label: 'Panchangam', icon: 'panchangam', order: 4 },
      { key: 'profile', label: 'Profile', icon: 'profile', order: 5 },
    ];

    // 1. Primary: Try active local API_BASE_URL
    try {
      const res = await fetch(`${API_BASE_URL}/home/tabs?lang=${lang}`);
      if (res.ok) {
        const json = await res.json();
        if (json?.success && Array.isArray(json.tabs) && json.tabs.length > 0) {
          return json.tabs;
        }
      }
    } catch {
      // Local endpoint unreachable, try fallback
    }

    // 2. Fallback: Try production base URL
    try {
      const res = await fetch(`${PRODUCTION_BASE_URL}/home/tabs?lang=${lang}`);
      if (res.ok) {
        const json = await res.json();
        if (json?.success && Array.isArray(json.tabs) && json.tabs.length > 0) {
          return json.tabs;
        }
      }
    } catch {
      // Offline fallback
    }

    return fallbackTabs;
  },

  // =========================================================================
  // 21. DHARMA KARTHA DASHBOARD & TEMPLE MANAGEMENT APIS (DB-BOUND VIA CPANEL)
  // Strictly fetches from MariaDB via backendapis.saranamayyappa.in
  // =========================================================================

  // 21.1 Fetch Dharma Kartha Dashboard Stats (Managed Temples, Pending Updates, Active Festivals)
  async getDharmaKarthaStats(userId: number = 1): Promise<DharmaKarthaDashboardStats> {
    const url = `${API_BASE_URL}/dharma-kartha/dashboard?userId=${userId}`;
    const res = await fetch(url, {
      headers: {
        'x-user-id': String(userId),
        Accept: 'application/json',
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch Dharma Kartha stats (HTTP ${res.status})`);
    }
    const json = await res.json();
    return json?.data || { managedTemples: 0, pendingUpdates: 0, activeFestivals: 0 };
  },

  // 21.2 Fetch Dharma Kartha Profile (Name, City, Role, Designation, Avatar)
  async getDharmaKarthaProfile(userId: number = 1): Promise<DharmaKarthaProfile | null> {
    const url = `${API_BASE_URL}/dharma-kartha/profile?userId=${userId}`;
    const res = await fetch(url, {
      headers: {
        'x-user-id': String(userId),
        Accept: 'application/json',
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch Dharma Kartha profile (HTTP ${res.status})`);
    }
    const json = await res.json();
    return json?.profile || null;
  },

  // 21.3 Fetch Authorized Temples Managed by this Dharma Kartha
  async getDharmaKarthaTemples(userId: number = 1): Promise<DharmaKarthaTemple[]> {
    const url = `${API_BASE_URL}/dharma-kartha/temples?userId=${userId}`;
    const res = await fetch(url, {
      headers: {
        'x-user-id': String(userId),
        Accept: 'application/json',
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch Dharma Kartha temples (HTTP ${res.status})`);
    }
    const json = await res.json();
    return json?.temples || [];
  },

  // 21.4 Register a Holy Mandir for Super Admin Verification
  async registerMandir(payload: RegisterMandirPayload, userId: number = 1): Promise<{ success: boolean; message: string; temple?: any }> {
    const url = `${API_BASE_URL}/dharma-kartha/temples?userId=${userId}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': String(userId),
        Accept: 'application/json',
      },
      body: JSON.stringify({
        name: payload.name.trim(),
        templeType: payload.classification,
        alternateName: payload.alternateName?.trim(),
        primaryDeity: payload.primaryDeity,
        state: payload.state,
        city: payload.city.trim(),
        district: payload.district?.trim(),
        address: payload.address.trim(),
        shortDescription: payload.shortDescription?.trim(),
        about: payload.about?.trim(),
        history: payload.history?.trim(),
        speciality: payload.speciality?.trim(),
        officePhone: payload.officePhone?.trim(),
        officialEmail: payload.officialEmail?.trim(),
        officialWebsite: payload.officialWebsite?.trim(),
      }),
    });
    const json = await res.json();
    if (!res.ok || json.success === false) {
      throw new Error(json?.message || `Failed to submit temple registration (HTTP ${res.status})`);
    }
    return json;
  },

  // 21.5 Update Managed Temple Details (About, Speciality, Contact, etc.)
  async updateTemple(templeId: number, updateData: any, userId: number = 1): Promise<{ success: boolean; message: string; temple?: any }> {
    const url = `${API_BASE_URL}/dharma-kartha/temples/${templeId}?userId=${userId}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': String(userId),
        Accept: 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    const json = await res.json();
    if (!res.ok || json.success === false) {
      throw new Error(json?.message || `Failed to update temple (HTTP ${res.status})`);
    }
    return json;
  },

  // 21.6 Add / Update Temple Darshan & Aarti Timings
  async addTempleTiming(templeId: number, body: any, userId: number = 1): Promise<{ success: boolean; message: string }> {
    const url = `${API_BASE_URL}/dharma-kartha/temples/${templeId}/timings?userId=${userId}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': String(userId),
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok || json.success === false) {
      throw new Error(json?.message || `Failed to add temple timing (HTTP ${res.status})`);
    }
    return json;
  },

  // 21.7 Add / Update Temple Festivals
  async addTempleFestival(templeId: number, body: any, userId: number = 1): Promise<{ success: boolean; message: string }> {
    const url = `${API_BASE_URL}/dharma-kartha/festivals?userId=${userId}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': String(userId),
        Accept: 'application/json',
      },
      body: JSON.stringify({ templeId, ...body }),
    });
    const json = await res.json();
    if (!res.ok || json.success === false) {
      throw new Error(json?.message || `Failed to add temple festival (HTTP ${res.status})`);
    }
    return json;
  },

  // 21.8 Upload Sanctum Media / Gallery Photos
  async uploadTempleMedia(body: any, userId: number = 1): Promise<{ success: boolean; message: string }> {
    const url = `${API_BASE_URL}/dharma-kartha/media?userId=${userId}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': String(userId),
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok || json.success === false) {
      throw new Error(json?.message || `Failed to upload temple media (HTTP ${res.status})`);
    }
    return json;
  },
};

export const apiService = ApiService;
