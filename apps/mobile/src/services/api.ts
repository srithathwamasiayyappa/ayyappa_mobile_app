import { Platform } from 'react-native';
import { LanguageItem, PanchangamData, DevotionalCategoryItem, SupportedLanguage } from '../types';
import { PanchangamLocalEngine } from '../utils/panchangam';
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

// Environment-configurable host resolution (Web, Android, iOS, Physical Devices, Production HTTPS)
const getApiBaseUrl = (): string => {
  // 1. Allow explicit custom environment override (e.g. EXPO_PUBLIC_API_URL)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Production HTTPS fallback
  if (process.env.NODE_ENV === 'production') {
    return 'https://api.ayyappa.org/api/v1';
  }

  // 3. Web Development Localhost
  if (Platform.OS === 'web') {
    return 'http://localhost:4000/api/v1';
  }

  // 4. Physical Android / iOS devices on local Wi-Fi LAN
  return 'http://192.168.1.6:4000/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();

export const ApiService = {
  // 1. Fetch Languages
  async getLanguages(): Promise<LanguageItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/languages`);
      if (res.ok) return res.json();
    } catch (e) {
      // Fallback
    }
    return [
      { id: 'te', code: 'te', name: 'తెలుగు (Telugu)' },
      { id: 'kn', code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
      { id: 'en', code: 'en', name: 'English' },
      { id: 'ta', code: 'ta', name: 'தமிழ் (Tamil)' },
      { id: 'hi', code: 'hi', name: 'हिन्दी (Hindi)' },
    ];
  },

  // 2. Fetch Panchangam with Instant High-Precision Astronomical Fallback
  async getPanchangam(lang: SupportedLanguage, dateIso?: string, city = 'Hyderabad'): Promise<PanchangamData> {
    try {
      const url = dateIso
        ? `${API_BASE_URL}/panchangam?lang=${lang}&date=${dateIso}&city=${city}`
        : `${API_BASE_URL}/panchangam?lang=${lang}&city=${city}`;
      const res = await fetch(url);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Fallback
    }
    const targetDate = dateIso ? new Date(dateIso) : new Date();
    return PanchangamLocalEngine.calculate(targetDate, city, lang);
  },

  // 3. Fetch Devotional Categories (All 23 items preserved)
  async getCategories(lang: SupportedLanguage): Promise<DevotionalCategoryItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/categories?lang=${lang}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map((item: any) => ({
            id: String(item.id),
            title: item.title,
            isAudio: item.isAudio,
            audioDurationSec: 40,
            totalTime: '00:40',
            chantLyric: item.description,
          }));
        }
      }
    } catch (e) {
      // Fallback
    }
    return FALLBACK_CATEGORIES[lang] || FALLBACK_CATEGORIES.te;
  },

  // 4. Fetch Specific Record / Subpage Detail
  async getCategoryDetail(id: string, lang: SupportedLanguage): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/categories/${id}?lang=${lang}`);
      if (res.ok) return res.json();
    } catch (e) {
      // Fallback
    }
    const catList = FALLBACK_CATEGORIES[lang] || FALLBACK_CATEGORIES.te;
    const found = catList.find((c) => c.id === id || c.slug === id);
    if (found) {
      return {
        id: found.id,
        slug: found.slug,
        title: found.title,
        description: found.description || '',
      };
    }
    return null;
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
  async sendOtp(phoneNumber: string, type: 'login' | 'register') {
    const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, type }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to send OTP');
    return json;
  },

  // 8. Auth: Register with Full Name + Mobile + OTP
  async registerWithOtp(data: {
    fullName: string;
    phoneNumber: string;
    otp: string;
    email?: string;
    preferredLang?: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/auth/register-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Registration failed');
    return json;
  },

  // 9. Auth: Login with Mobile + OTP
  async loginWithOtp(phoneNumber: string, otp: string) {
    const res = await fetch(`${API_BASE_URL}/auth/login-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, otp }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Login failed');
    return json;
  },

  // 10. Auth: Devotee Registration (Password fallback)
  async registerDevotee(data: {
    phoneNumber: string;
    password?: string;
    fullName?: string;
    email?: string;
    preferredLang?: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Registration failed');
    return json;
  },

  // 11. Auth: Devotee Login (Mobile number or Email + Password)
  async loginDevotee(identifier: string, password?: string) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Login failed');
    return json;
  },

  // 12. Auth: Google Login with Cryptographically Verified idToken
  async loginWithGoogle(data: { idToken: string; email?: string; fullName?: string; googleId?: string; photoUrl?: string }) {
    const res = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: data.idToken }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Google sign-in failed');
    return json;
  },

  // 10. Contact: Submit Devotee Inquiry / Feedback
  async submitContactInquiry(data: { name: string; phone: string; email?: string; message: string }) {
    const res = await fetch(`${API_BASE_URL}/contact/inquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to submit inquiry');
    return json;
  },

  // 11. Contact: Get Official Contact Information
  async getContactInfo() {
    try {
      const res = await fetch(`${API_BASE_URL}/contact`);
      if (res.ok) return await res.json();
    } catch {}
    return {
      appName: 'Saranam Ayyappa Devotional Portal',
      email: 'support@ayyappa.org',
      helpline: '+91 4735 202028',
      whatsapp: '+91 94477 95577',
      address: 'Travancore Devaswom Board, Sabarimala Sannidhanam, Pathanamthitta, Kerala - 689662',
      templeTimings: 'Morning: 3:00 AM – 1:00 PM | Evening: 3:00 PM – 11:00 PM (Harivarasanam)',
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
};
