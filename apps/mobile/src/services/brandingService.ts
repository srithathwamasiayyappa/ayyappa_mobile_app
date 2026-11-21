import { useState, useEffect } from 'react';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService, HomeLogoData, DEFAULT_HOME_LOGO, API_BASE_URL } from './api';

const CACHE_KEY = '@ayyappa_cached_home_logo';

let inMemoryBranding: HomeLogoData = DEFAULT_HOME_LOGO;
const listeners = new Set<(branding: HomeLogoData) => void>();

function sanitizeLogoUrl(url?: string): string {
  if (!url) return '';
  const activeHost = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
  if (url.startsWith('/')) {
    return `${activeHost}${url}`;
  }
  if (url.includes('/images/')) {
    const imgPath = url.substring(url.indexOf('/images/'));
    return `${activeHost}${imgPath}`;
  }
  return url;
}

export const BrandingService = {
  // Synchronous read of current in-memory branding
  getCurrentBranding(): HomeLogoData {
    return inMemoryBranding;
  },

  // Load cached branding from AsyncStorage immediately on app startup
  async loadCachedBranding(): Promise<HomeLogoData> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.logoUrl) {
          parsed.logoUrl = sanitizeLogoUrl(parsed.logoUrl);
          inMemoryBranding = parsed;
          listeners.forEach((listener) => listener(inMemoryBranding));
        }
      }
    } catch (e) {
      // Ignore cache read errors
    }
    return inMemoryBranding;
  },

  // Fetch latest branding from production/API and update in-memory + AsyncStorage cache
  async fetchLatestBranding(): Promise<HomeLogoData> {
    try {
      const latest = await ApiService.getHomeLogo();
      if (latest && latest.logoUrl) {
        latest.logoUrl = sanitizeLogoUrl(latest.logoUrl);
        inMemoryBranding = latest;
        listeners.forEach((listener) => listener(inMemoryBranding));
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(latest));
      }
    } catch (e) {
      // Keep existing cache on failure
    }
    return inMemoryBranding;
  },

  // Subscribe to branding changes
  subscribe(listener: (branding: HomeLogoData) => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  // Helper to open social platform links
  async openSocial(platform: 'youtube' | 'telegram' | 'instagram' | 'facebook' | 'whatsapp') {
    const url = inMemoryBranding.socialLinks?.[platform];
    if (url) {
      try {
        await Linking.openURL(url);
      } catch (err) {
        console.warn(`Cannot open ${platform} link:`, err);
      }
    }
  },

  // Helper to open Play Store / App Store
  async openStore(platform: 'android' | 'ios' = 'android') {
    const url = platform === 'ios' ? inMemoryBranding.appStoreUrl : inMemoryBranding.playStoreUrl;
    if (url) {
      try {
        await Linking.openURL(url);
      } catch (err) {
        console.warn(`Cannot open store link:`, err);
      }
    }
  },
};

// Initial background load
BrandingService.loadCachedBranding().then(() => {
  BrandingService.fetchLatestBranding();
});

// React Hook to consume dynamic branding with zero style impact
export function useBranding() {
  const [branding, setBranding] = useState<HomeLogoData>(BrandingService.getCurrentBranding());
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    // Sync current
    setBranding(BrandingService.getCurrentBranding());
    const unsubscribe = BrandingService.subscribe((updated) => {
      setBranding(updated);
      setLogoFailed(false);
    });
    // Trigger fresh fetch
    BrandingService.fetchLatestBranding();
    return unsubscribe;
  }, []);

  const getLogoSource = (fallbackAsset: any) => {
    const rawUrl = sanitizeLogoUrl(branding?.logoUrl);
    if (logoFailed || !rawUrl) {
      return fallbackAsset;
    }
    return { uri: rawUrl };
  };

  return {
    branding,
    getLogoSource,
    onLogoError: () => setLogoFailed(true),
    openSocial: BrandingService.openSocial,
    openStore: BrandingService.openStore,
  };
}
