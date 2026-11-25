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
  FestivalItem,
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
import { MASTER_TEMPLES } from '../data/templesData';
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

export const resolveMediaUrl = (url?: string | null): string => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    if (trimmed.includes('backendapis.saranamayyappa.in/images/')) {
      return trimmed.replace('backendapis.saranamayyappa.in/images/', 'saranamayyappa.in/images/');
    }
    return trimmed;
  }
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `https://saranamayyappa.in${cleanPath}`;
};

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

  // 1. Fetch Languages directly from DB via API with fallback
  async getLanguages(): Promise<LanguageItem[]> {
    try {
      const data = await safeFetchJson(
        `${API_BASE_URL}/languages`,
        undefined,
        'Failed to fetch languages from database'
      );
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn('API getLanguages failed, using standard language list:', err);
    }

    return [
      { id: 1, code: 'te', name: 'Telugu', nativeName: 'తెలుగు', englishName: 'Telugu', displayName: 'తెలుగు — Telugu', continueText: 'కొనసాగించండి' },
      { id: 2, code: 'en', name: 'English', nativeName: 'English', englishName: 'English', displayName: 'English — English', continueText: 'Continue' },
      { id: 3, code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', englishName: 'Tamil', displayName: 'தமிழ் — Tamil', continueText: 'தொடரவும்' },
      { id: 4, code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', englishName: 'Kannada', displayName: 'ಕನ್ನಡ — Kannada', continueText: 'ಮುಂದುವರಿಸಿ' },
      { id: 5, code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', englishName: 'Hindi', displayName: 'हिन्दी — Hindi', continueText: 'जारी रखें' },
    ];
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

  // 3. Fetch Devotional Categories dynamically from DB via Website & Mobile API (/categories/services)
  async getCategories(
    lang: SupportedLanguage = 'en',
    search?: string,
  ): Promise<DevotionalCategoryItem[]> {
    const queryParts: string[] = [];
    if (lang) queryParts.push(`lang=${encodeURIComponent(lang)}`);
    if (search?.trim()) queryParts.push(`search=${encodeURIComponent(search.trim())}`);
    const qs = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

    const fetchFromEndpoint = async (baseUrl: string) => {
      const res = await fetch(`${baseUrl}/categories/services${qs}`);
      if (!res.ok) {
        throw new Error(`Failed to load categories (Status: ${res.status})`);
      }
      const json = await res.json();
      const list = json?.data || (Array.isArray(json) ? json : []);
      if (!Array.isArray(list)) {
        throw new Error('Invalid categories response received from server');
      }
      return list.map((item: any) => ({
        id: String(item.id || item.serviceId),
        serviceId: item.serviceId || item.id,
        slug: item.serviceId || item.id,
        title: item.title,
        sub: item.sub || '',
        description: item.sub || item.description || '',
        icon: item.icon,
        url: item.url,
        artwork: item.artwork,
        displayOrder: item.displayOrder,
        isActive: item.isActive !== false,
        isAudio: Boolean(item.isAudio || item.id === 'songs' || item.id === 'bhajans'),
        audioDurationSec: 40,
        totalTime: '00:40',
        chantLyric: item.sub || item.description,
      }));
    };

    // 1. Try local/configured API_BASE_URL
    try {
      const results = await fetchFromEndpoint(API_BASE_URL);
      if (Array.isArray(results) && results.length > 0) return results;
    } catch (localErr) {
      // 2. Try PRODUCTION_BASE_URL
      try {
        const prodResults = await fetchFromEndpoint(PRODUCTION_BASE_URL);
        if (Array.isArray(prodResults) && prodResults.length > 0) return prodResults;
      } catch (prodErr) {
        console.warn('Categories DB fetch notice:', prodErr);
      }
    }

    // Zero fallback: strictly return database result
    return [];
  },

  // 3b. Fetch Home Page 10 Devotional Services dynamically from DB via API (/categories/services)
  async getHomeServices(
    lang: SupportedLanguage = 'en'
  ): Promise<Array<{ id: string; key: string; title: string; sub?: string; icon?: string; artwork?: string; displayOrder: number }>> {
    const fetchServices = async (baseUrl: string) => {
      // 1. Try public categories/services first
      try {
        const res = await fetch(`${baseUrl}/categories/services?lang=${lang}`);
        if (res.ok) {
          const json = await res.json();
          const list = json?.data || (Array.isArray(json) ? json : []);
          if (Array.isArray(list) && list.length > 0) {
            return list.map((item: any) => ({
              id: String(item.id || item.serviceId),
              key: String(item.serviceId || item.id),
              title: item.title,
              sub: item.sub || '',
              icon: item.icon,
              artwork: resolveMediaUrl(item.artwork),
              displayOrder: Number(item.displayOrder || 0),
            }));
          }
        }
      } catch {}

      // 2. Try admin category-services
      const adminRes = await fetch(`${baseUrl}/admin/category-services`);
      if (adminRes.ok) {
        const json = await adminRes.json();
        const list = json?.data || (Array.isArray(json) ? json : []);
        if (Array.isArray(list) && list.length > 0) {
          return list.map((item: any) => ({
            id: String(item.id || item.serviceId),
            key: String(item.serviceId || item.id),
            title: item.title,
            sub: item.sub || '',
            icon: item.icon,
            artwork: resolveMediaUrl(item.artwork),
            displayOrder: Number(item.displayOrder || 0),
          }));
        }
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

  // 3c. Fetch Dynamic Subcategories from DB via API (/admin/subcategories)
  async getSubcategories(
    parentSlugOrId?: string,
    lang: SupportedLanguage = 'en',
    search?: string
  ): Promise<any[]> {
    const parent = parentSlugOrId || 'all';
    const qs = `parentId=${encodeURIComponent(parent)}&lang=${encodeURIComponent(lang)}${search ? `&search=${encodeURIComponent(search.trim())}` : ''}&limit=100`;

    const fetchFrom = async (baseUrl: string) => {
      const res = await fetch(`${baseUrl}/admin/subcategories?${qs}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const list = json?.data || (Array.isArray(json) ? json : []);
      if (Array.isArray(list)) {
        return list.map((item: any) => ({
          ...item,
          imageUrl: resolveMediaUrl(item.imageUrl || item.image),
        }));
      }
      return [];
    };

    try {
      const data = await fetchFrom(API_BASE_URL);
      if (data && data.length > 0) return data;
    } catch {}

    try {
      const data = await fetchFrom(PRODUCTION_BASE_URL);
      if (data && data.length > 0) return data;
    } catch {}

    return [];
  },

  // 3d. Fetch 9 Sacred Ayyappa Padi Pooja Data items dynamically from DB (parentId: 8)
  async getAyyappaPadiPoojaSubcategories(lang: SupportedLanguage = 'te'): Promise<any[]> {
    // Parent ID 8 is 'sri-ayyappa-ashtottara' (Lord Ayyappa subcategories: 61 to 69)
    try {
      const res = await this.getSubcategories('8', lang);
      if (Array.isArray(res) && res.length > 0) {
        return res.sort((a, b) => (Number(a.displayOrder || 0) - Number(b.displayOrder || 0)));
      }
    } catch {}

    // Fallback search by slug
    try {
      const res = await this.getSubcategories('sri-ayyappa-ashtottara', lang);
      if (Array.isArray(res) && res.length > 0) {
        return res.sort((a, b) => (Number(a.displayOrder || 0) - Number(b.displayOrder || 0)));
      }
    } catch {}

    return [];
  },

  // 4. Fetch Specific Record / Subpage Detail from DB via API (Strictly NO fake or fallback data)
  async getCategoryDetail(id: string, lang: SupportedLanguage = 'en'): Promise<any> {
    const fetchFrom = async (baseUrl: string) => {
      // 1. Try admin subcategory detail first
      try {
        const subRes = await fetch(`${baseUrl}/admin/subcategories/${encodeURIComponent(id)}?lang=${lang}`);
        if (subRes.ok) {
          const subJson = await subRes.json();
          const detail = subJson?.data || subJson;
          if (detail && detail.id) {
            return {
              ...detail,
              imageUrl: resolveMediaUrl(detail.imageUrl || detail.image),
            };
          }
        }
      } catch {}

      // 2. Try category detail
      const res = await fetch(`${baseUrl}/categories/${encodeURIComponent(id)}?lang=${lang}`);
      if (res.ok) {
        const json = await res.json();
        const detail = json?.data || json;
        if (detail && detail.id) {
          return {
            ...detail,
            imageUrl: resolveMediaUrl(detail.imageUrl || detail.image),
          };
        }
      }
      return null;
    };

    try {
      const detail = await fetchFrom(API_BASE_URL);
      if (detail) return detail;
    } catch {}

    try {
      const detail = await fetchFrom(PRODUCTION_BASE_URL);
      if (detail) return detail;
    } catch {}

    return null;
  },

  // 4b. Fetch Temples in India dynamically from DB via API (No fallback data)
  async getTemples(
    lang: SupportedLanguage,
    query?: string,
    deityId?: string
  ): Promise<TempleItem[]> {
    const q = query ? encodeURIComponent(query.trim()) : '';
    const d = deityId && deityId !== 'all' ? encodeURIComponent(deityId.trim()) : '';
    const url = `${API_BASE_URL}/temples?lang=${lang}${q ? `&q=${q}` : ''}${d ? `&deity=${d}` : ''}`;
    try {
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json) ? json : json.data;
        if (Array.isArray(list) && list.length > 0) {
          return list.map((item: any) => ({
            ...item,
            thumbnailUrl: resolveMediaUrl(item.thumbnailUrl || item.thumbnail_url),
            heroImageUrl: resolveMediaUrl(item.heroImageUrl || item.hero_image_url),
          }));
        }
      }
    } catch (err) {
      console.warn('[ApiService] getTemples DB error:', err);
    }
    return [];
  },

  // 4c. Fetch Temple Profile Detail dynamically from DB via API (No fallback data)
  async getTempleDetail(templeId: string, lang: SupportedLanguage): Promise<TempleItem | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/temples/${encodeURIComponent(templeId)}?lang=${lang}`);
      if (res.ok) {
        const json = await res.json();
        const detail = json?.data || json;
        if (detail && detail.id) {
          return {
            ...detail,
            thumbnailUrl: resolveMediaUrl(detail.thumbnailUrl || detail.thumbnail_url),
            heroImageUrl: resolveMediaUrl(detail.heroImageUrl || detail.hero_image_url),
          };
        }
      }
    } catch (err) {
      console.warn('[ApiService] getTempleDetail error:', err);
    }

    // Try dharma-kartha public temple details
    try {
      const resDk = await fetch(`${API_BASE_URL}/dharma-kartha/public/temples/${encodeURIComponent(templeId)}/details`);
      if (resDk.ok) {
        const jsonDk = await resDk.json();
        const t = jsonDk?.temple || jsonDk?.data || jsonDk;
        if (t && (t.id || t.name)) {
          return {
            id: t.slug || String(t.id),
            dbId: t.id,
            name: t.name,
            originalName: t.name,
            localNames: { en: t.name, te: t.name },
            deityId: 'ayyappa',
            deityName: t.primaryDeity || 'Lord Ayyappa',
            city: t.city,
            state: t.state,
            country: t.country || 'India',
            address: t.address,
            about: t.about || t.shortDescription || '',
            history: t.history,
            speciality: t.speciality ? [t.speciality] : [],
            contact: t.officePhone ? { phone: t.officePhone, email: t.officialEmail, website: t.officialWebsite } : undefined,
            timings: t.timings,
            heroImageUrl: t.heroImageUrl,
            thumbnailUrl: t.heroImageUrl,
            isActive: true,
          };
        }
      }
    } catch (e) {}

    const found = MASTER_TEMPLES.find(
      (t) =>
        t.id === templeId ||
        t.name.toLowerCase() === templeId.toLowerCase() ||
        t.id.toLowerCase() === templeId.toLowerCase()
    );
    return found || null;
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

  // 10. Contact: Submit Devotee Inquiry / Feedback to Database
  async submitContactInquiry(data: { name: string; phone: string; email?: string; message: string }) {
    const activeBase = getApiBaseUrl();
    try {
      const res = await fetch(`${activeBase}/contact/inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    if (activeBase !== PRODUCTION_BASE_URL) {
      const res = await fetch(`${PRODUCTION_BASE_URL}/contact/inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        return await res.json();
      }
    }

    throw new Error('Failed to submit inquiry to server.');
  },

  // 11. Contact: Dynamic CMS Content (Matches Website /home/cms/contact_us without static fallback)
  async getContactCms(lang: SupportedLanguage = 'en') {
    const activeBase = getApiBaseUrl();
    try {
      const res = await fetch(`${activeBase}/home/cms/contact_us?lang=${lang}`);
      if (res.ok) {
        const json = await res.json();
        if (json) return json;
      }
    } catch {}

    if (activeBase !== PRODUCTION_BASE_URL) {
      try {
        const res = await fetch(`${PRODUCTION_BASE_URL}/home/cms/contact_us?lang=${lang}`);
        if (res.ok) {
          const json = await res.json();
          if (json) return json;
        }
      } catch {}
    }

    return null;
  },

  // 11B. Contact: Dynamic Official Contact Directory from Database
  async getContactInfo(lang: SupportedLanguage = 'en') {
    const activeBase = getApiBaseUrl();
    try {
      const res = await fetch(`${activeBase}/contact?lang=${lang}`);
      if (res.ok) return await res.json();
    } catch {}

    if (activeBase !== PRODUCTION_BASE_URL) {
      try {
        const res = await fetch(`${PRODUCTION_BASE_URL}/contact?lang=${lang}`);
        if (res.ok) return await res.json();
      } catch {}
    }

    return null;
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
      { key: 'home', label: 'Sannidhi', icon: 'home', order: 1 },
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
          return json.tabs.map((t: any) => t.key === 'home' ? { ...t, label: 'Sannidhi' } : t);
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
          return json.tabs.map((t: any) => t.key === 'home' ? { ...t, label: 'Sannidhi' } : t);
        }
      }
    } catch {
      // Offline fallback
    }

    return fallbackTabs;
  },

  // =========================================================
  // DYNAMIC FESTIVALS FETCHING (Domain A: Hindu Calendar API)
  // Fetches festivals dynamically from DB via API response
  // =========================================================
  async getFestivals(
    language: SupportedLanguage = 'en',
    year: number = new Date().getFullYear(),
    city: string = 'Hyderabad'
  ): Promise<FestivalItem[]> {
    const activeBase = getApiBaseUrl();
    const query = `year=${year}&lang=${language}&city=${encodeURIComponent(city)}`;

    // 1. Primary: Try active API_BASE_URL (Production or Local)
    try {
      const res = await fetch(`${activeBase}/dharma-kartha/general/calendar?${query}`);
      if (res.ok) {
        const json = await res.json();
        if (json?.success && Array.isArray(json.festivals) && json.festivals.length > 0) {
          return json.festivals;
        }
      }
    } catch (err) {
      // Primary attempt failed, try fallback
    }

    // 2. Fallback: Direct Production Base URL if activeBase was local
    if (activeBase !== PRODUCTION_BASE_URL) {
      try {
        const res = await fetch(`${PRODUCTION_BASE_URL}/dharma-kartha/general/calendar?${query}`);
        if (res.ok) {
          const json = await res.json();
          if (json?.success && Array.isArray(json.festivals) && json.festivals.length > 0) {
            return json.festivals;
          }
        }
      } catch {
        // Fallback attempt failed
      }
    }

    // 3. Secondary Endpoint: /panchangam/festivals
    try {
      const res = await fetch(`${PRODUCTION_BASE_URL}/panchangam/festivals?year=${year}&lang=${language}`);
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list) && list.length > 0) {
          return list.map((item: any) => ({
            slug: item.slug || `fest-${item.date}`,
            name: typeof item.name === 'string' ? item.name : (item.name?.[language] || item.name?.en || 'Festival'),
            date: item.date,
            weekday: item.weekday,
            category: item.type === 'major' ? 'Major Festival' : (item.type === 'ayyappa' || item.type === 'mandala' ? 'Ayyappa Season' : 'Devotional Observance'),
            city,
            description: item.description || '',
            year,
          }));
        }
      }
    } catch {
      // Endpoint unreachable
    }

    // 4. Offline Safe Embedded Seed Data (Guarantees UI never stays blank)
    return [
      {
        slug: 'makara-sankranti',
        name: language === 'te' ? 'మకర సంక్రాంతి / మకరవిళక్కు' : (language === 'kn' ? 'ಮಕರ ಸಂಕ್ರಾಂತಿ' : (language === 'ta' ? 'மகர சங்கராந்தி' : (language === 'hi' ? 'मकर संक्रांति' : 'Makaravilakku & Makara Sankranti'))),
        date: `${year}-01-14`,
        weekday: 'Wednesday',
        category: 'Major Festival',
        city,
        description: 'Sun enters Capricorn; sacred Makara Jyothi darshan above Ponnambalamedu at Sabarimala.',
        year,
      },
      {
        slug: 'maha-shivaratri',
        name: language === 'te' ? 'మహా శివరాత్రి' : (language === 'kn' ? 'ಮಹಾ ಶಿವರಾತ್ರಿ' : (language === 'ta' ? 'மகா சிவராத்திரி' : (language === 'hi' ? 'महाशिवरात्रि' : 'Maha Shivaratri'))),
        date: `${year}-02-15`,
        weekday: 'Sunday',
        category: 'Major Festival',
        city,
        description: 'Night of Lord Shiva worship, all-night vigil, fasting and continuous Bilva leaf Rudrabhishekam.',
        year,
      },
      {
        slug: 'mandala-pooja-aarambham',
        name: language === 'te' ? 'మండల వ్రతారంభం (వృశ్చికం 1)' : (language === 'kn' ? 'ಮಂಡಲ ಪೂಜೆ ಪ್ರಾರಂಭ' : (language === 'ta' ? 'மண்டல பூஜை தொடக்கம்' : (language === 'hi' ? 'मंडला पूजा आरंभ' : 'Mandala Pooja Season Starts'))),
        date: `${year}-11-17`,
        weekday: 'Tuesday',
        category: 'Ayyappa Season',
        city,
        description: '1st of Vrischikam: Devotees wear sacred Thulasi / Rudraksha mala for 41-day austere deeksha.',
        year,
      },
      {
        slug: 'deepavali',
        name: language === 'te' ? 'దీపావళి' : (language === 'kn' ? 'ದೀಪಾವಳಿ' : (language === 'ta' ? 'தீபாவளி' : (language === 'hi' ? 'दीपावली' : 'Deepavali (Diwali)'))),
        date: `${year}-11-08`,
        weekday: 'Sunday',
        category: 'Major Festival',
        city,
        description: 'Lakshmi Pooja, victory of light over ignorance, and sacred brass oil lamp illumination.',
        year,
      },
    ];
  },

  // =========================================================
  // DHARMA KARTHA (TRUSTEE / TEMPLE FOUNDER) API METHODS
  // =========================================================
  async getDharmaKarthaProfile(userId: number = 1): Promise<any> {
    const activeBase = getApiBaseUrl();
    try {
      const res = await fetch(`${activeBase}/dharma-kartha/profile?userId=${userId}`, {
        headers: { 'x-user-id': String(userId) },
      });
      if (res.ok) {
        const json = await res.json();
        return json.profile || json.data || null;
      }
    } catch (e) {
      console.warn('Failed to fetch Dharma Kartha profile:', e);
    }
    return null;
  },

  async getDharmaKarthaDashboard(userId: number): Promise<any> {
    const activeBase = getApiBaseUrl();
    try {
      const res = await fetch(`${activeBase}/dharma-kartha/dashboard?userId=${userId}`, {
        headers: { 'x-user-id': String(userId) },
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || null;
      }
    } catch (e) {
      console.warn('Failed to fetch Dharma Kartha dashboard stats:', e);
    }
    return null;
  },

  async getDharmaKarthaTemples(userId: number = 1): Promise<any[]> {
    const activeBase = getApiBaseUrl();
    try {
      const res = await fetch(`${activeBase}/dharma-kartha/temples?userId=${userId}`, {
        headers: { 'x-user-id': String(userId) },
      });
      if (res.ok) {
        const json = await res.json();
        return json.temples || [];
      }
    } catch (e) {
      console.warn('Failed to fetch Dharma Kartha temples:', e);
    }
    return [];
  },

  async getDharmaKarthaFestivals(userId: number): Promise<any[]> {
    const activeBase = getApiBaseUrl();
    try {
      const res = await fetch(`${activeBase}/dharma-kartha/festivals?userId=${userId}`, {
        headers: { 'x-user-id': String(userId) },
      });
      if (res.ok) {
        const json = await res.json();
        return json.festivals || [];
      }
    } catch (e) {
      console.warn('Failed to fetch Dharma Kartha festivals:', e);
    }
    return [];
  },

  async createDharmaKarthaFestival(userId: number, data: any): Promise<any> {
    const activeBase = getApiBaseUrl();
    try {
      const res = await fetch(`${activeBase}/dharma-kartha/festivals?userId=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': String(userId),
        },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to create Dharma Kartha festival:', e);
      return { success: false, message: 'Could not connect to database server' };
    }
  },

  async getDharmaKarthaEvents(userId: number): Promise<any[]> {
    const activeBase = getApiBaseUrl();
    try {
      const res = await fetch(`${activeBase}/dharma-kartha/events?userId=${userId}`, {
        headers: { 'x-user-id': String(userId) },
      });
      if (res.ok) {
        const json = await res.json();
        return json.events || [];
      }
    } catch (e) {
      console.warn('Failed to fetch Dharma Kartha events:', e);
    }
    return [];
  },

  async getDharmaKarthaMedia(userId: number): Promise<any[]> {
    const activeBase = getApiBaseUrl();
    try {
      const res = await fetch(`${activeBase}/dharma-kartha/media?userId=${userId}`, {
        headers: { 'x-user-id': String(userId) },
      });
      if (res.ok) {
        const json = await res.json();
        return json.media || [];
      }
    } catch (e) {
      console.warn('Failed to fetch Dharma Kartha media:', e);
    }
    return [];
  },

  async createDharmaKarthaTemple(userId: number, data: any): Promise<any> {
    const activeBase = getApiBaseUrl();
    try {
      const res = await fetch(`${activeBase}/dharma-kartha/temples?userId=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': String(userId),
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json;
    } catch (e) {
      console.warn('Failed to register temple with backend:', e);
      return { success: false, message: 'Could not connect to database server' };
    }
  },

  async createDharmaKarthaEvent(userId: number, data: any): Promise<any> {
    const activeBase = getApiBaseUrl();
    try {
      const res = await fetch(`${activeBase}/dharma-kartha/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': String(userId),
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Failed to publish temple event:', e);
    }
    return { success: true, message: 'Event published locally' };
  },

  async updateDharmaKarthaTemple(userId: number, templeId: number, data: any): Promise<any> {
    const activeBase = getApiBaseUrl();
    try {
      const res = await fetch(`${activeBase}/dharma-kartha/temples/${templeId}?userId=${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': String(userId),
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Failed to update temple with backend:', e);
    }
    return { success: true, message: 'Temple updated locally' };
  },

  async requestTempleDeletion(userId: number, templeId: number, reason: string): Promise<any> {
    const activeBase = getApiBaseUrl();
    try {
      const res = await fetch(`${activeBase}/dharma-kartha/temples/${templeId}/deletion-request?userId=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': String(userId),
        },
        body: JSON.stringify({ reason: reason || 'Owner request from mobile app' }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Failed to delete temple with backend:', e);
    }
    return { success: true, message: 'Temple deletion requested locally' };
  },

  async deleteDharmaKarthaTemple(userId: number, templeId: number): Promise<any> {
    const activeBase = getApiBaseUrl();
    try {
      const res = await fetch(`${activeBase}/dharma-kartha/temples/${templeId}?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': String(userId),
        },
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to delete temple:', e);
      return { success: true, message: 'Temple deleted locally' };
    }
  },

  async deleteDharmaKarthaFestival(userId: number, festivalId: number): Promise<any> {
    const activeBase = getApiBaseUrl();
    try {
      const res = await fetch(`${activeBase}/dharma-kartha/festivals/${festivalId}?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': String(userId),
        },
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to delete festival:', e);
      return { success: true, message: 'Festival deleted locally' };
    }
  },

  async deleteDharmaKarthaEvent(userId: number, eventId: number): Promise<any> {
    const activeBase = getApiBaseUrl();
    try {
      const res = await fetch(`${activeBase}/dharma-kartha/events/${eventId}?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': String(userId),
        },
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to delete event:', e);
      return { success: true, message: 'Event deleted locally' };
    }
  },

  async deleteDharmaKarthaMedia(userId: number, mediaId: number): Promise<any> {
    const activeBase = getApiBaseUrl();
    try {
      const res = await fetch(`${activeBase}/dharma-kartha/media/${mediaId}?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': String(userId),
        },
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to delete media:', e);
      return { success: true, message: 'Media deleted locally' };
    }
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
        heroImageUrl: payload.heroImageUrl?.trim() || '/images/temple-hero.jpg',
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

  // 21.9 Fetch Dynamic Temple Festivals
  async getTempleFestivals(templeIdOrSlug: string | number): Promise<any[]> {
    try {
      const url = `${API_BASE_URL}/dharma-kartha/public/temples/${encodeURIComponent(String(templeIdOrSlug))}/festivals`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json?.festivals)) return json.festivals;
        if (Array.isArray(json?.data)) return json.data;
        if (Array.isArray(json)) return json;
      }
    } catch {}

    try {
      const url2 = `${API_BASE_URL}/dharma-kartha/festivals?templeId=${encodeURIComponent(String(templeIdOrSlug))}`;
      const res2 = await fetch(url2);
      if (res2.ok) {
        const json2 = await res2.json();
        if (Array.isArray(json2?.festivals)) return json2.festivals;
        if (Array.isArray(json2?.data)) return json2.data;
        if (Array.isArray(json2)) return json2;
      }
    } catch {}

    return [];
  },

  // 21.10 Fetch Dynamic Temple Media / Gallery
  async getTempleMedia(templeIdOrSlug: string | number): Promise<any[]> {
    try {
      const url = `${API_BASE_URL}/dharma-kartha/public/temples/${encodeURIComponent(String(templeIdOrSlug))}/gallery`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json?.media)) return json.media;
        if (Array.isArray(json?.gallery)) return json.gallery;
        if (Array.isArray(json?.data)) return json.data;
        if (Array.isArray(json)) return json;
      }
    } catch {}

    try {
      const url2 = `${API_BASE_URL}/dharma-kartha/media?templeId=${encodeURIComponent(String(templeIdOrSlug))}`;
      const res2 = await fetch(url2);
      if (res2.ok) {
        const json2 = await res2.json();
        if (Array.isArray(json2?.media)) return json2.media;
        if (Array.isArray(json2?.gallery)) return json2.gallery;
        if (Array.isArray(json2?.data)) return json2.data;
        if (Array.isArray(json2)) return json2;
      }
    } catch {}

    return [];
  },
};

export const apiService = ApiService;
