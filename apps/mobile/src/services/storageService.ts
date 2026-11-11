import AsyncStorage from '@react-native-async-storage/async-storage';
import { SupportedLanguage } from '../types';

const STORAGE_KEYS = {
  LANGUAGE: '@ayyappa_user_language',
  HAS_CHOSEN_LANGUAGE: '@ayyappa_has_chosen_language',
  LAST_SCREEN: '@ayyappa_last_screen',
  LAST_DETAIL: '@ayyappa_last_detail',
  DOWNLOADED_AUDIO_PREFIX: '@ayyappa_downloaded_audio_',
  AUDIO_PROGRESS_PREFIX: '@ayyappa_audio_progress_',
  CACHED_SPLASH_META: '@ayyappa_cached_splash_meta',
};

export interface PersistedNavigationState {
  currentScreen: 'splash' | 'language' | 'home' | 'about' | 'detail' | 'panchangam';
  selectedLanguage: SupportedLanguage;
  activeDetail: { id: string; title: string } | null;
  hasChosenLanguage: boolean;
}

export const StorageService = {
  // Get stored language
  async getStoredLanguage(): Promise<SupportedLanguage | null> {
    try {
      const lang = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
      if (lang === 'te' || lang === 'kn' || lang === 'en') {
        return lang;
      }
      return null;
    } catch {
      return null;
    }
  },

  // Set user language
  async setStoredLanguage(lang: SupportedLanguage): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
      await AsyncStorage.setItem(STORAGE_KEYS.HAS_CHOSEN_LANGUAGE, 'true');
    } catch (e) {
      console.warn('Failed to save language to storage', e);
    }
  },

  // Downloaded Audio Persistent State
  async isAudioDownloaded(trackId: string): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(`${STORAGE_KEYS.DOWNLOADED_AUDIO_PREFIX}${trackId}`);
      return val === 'true';
    } catch {
      return false;
    }
  },

  async markAudioDownloaded(trackId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(`${STORAGE_KEYS.DOWNLOADED_AUDIO_PREFIX}${trackId}`, 'true');
    } catch (e) {
      console.warn('Failed to save audio download status', e);
    }
  },

  async removeAudioDownloaded(trackId: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${STORAGE_KEYS.DOWNLOADED_AUDIO_PREFIX}${trackId}`);
    } catch (e) {
      console.warn('Failed to remove audio download status', e);
    }
  },

  // Audio Playback Position Persistence
  async getAudioProgress(trackId: string): Promise<{ elapsed: number; ratio: number } | null> {
    try {
      const val = await AsyncStorage.getItem(`${STORAGE_KEYS.AUDIO_PROGRESS_PREFIX}${trackId}`);
      if (val) {
        return JSON.parse(val);
      }
      return null;
    } catch {
      return null;
    }
  },

  async saveAudioProgress(trackId: string, elapsed: number, ratio: number): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `${STORAGE_KEYS.AUDIO_PROGRESS_PREFIX}${trackId}`,
        JSON.stringify({ elapsed, ratio })
      );
    } catch (e) {
      console.warn('Failed to save audio progress', e);
    }
  },

  async clearAudioProgress(trackId: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${STORAGE_KEYS.AUDIO_PROGRESS_PREFIX}${trackId}`);
    } catch (e) {
      console.warn('Failed to clear audio progress', e);
    }
  },

  // Save current navigation state (industry standard app state restoration)
  async saveNavigationState(
    screen: 'splash' | 'language' | 'home' | 'about' | 'detail' | 'panchangam',
    activeDetail: { id: string; title: string } | null
  ): Promise<void> {
    try {
      // Don't persist splash as target screen to restore
      if (screen !== 'splash') {
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_SCREEN, screen);
      }
      if (activeDetail) {
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_DETAIL, JSON.stringify(activeDetail));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.LAST_DETAIL);
      }
    } catch (e) {
      console.warn('Failed to save navigation state', e);
    }
  },

  // Restore state on app launch/refresh
  async restoreState(): Promise<{
    language: SupportedLanguage;
    hasChosenLanguage: boolean;
    initialScreen: 'language' | 'home' | 'about' | 'detail' | 'panchangam';
    activeDetail: { id: string; title: string } | null;
  }> {
    try {
      const storedLang = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
      const hasChosen = await AsyncStorage.getItem(STORAGE_KEYS.HAS_CHOSEN_LANGUAGE);
      const lastScreen = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SCREEN);
      const lastDetailStr = await AsyncStorage.getItem(STORAGE_KEYS.LAST_DETAIL);

      const language: SupportedLanguage =
        storedLang === 'kn' || storedLang === 'en' || storedLang === 'te'
          ? (storedLang as SupportedLanguage)
          : 'te';

      const hasChosenLanguage = hasChosen === 'true';

      let activeDetail: { id: string; title: string } | null = null;
      if (lastDetailStr) {
        try {
          activeDetail = JSON.parse(lastDetailStr);
        } catch {
          activeDetail = null;
        }
      }

      // If user hasn't chosen a language yet, first time goes to language screen
      if (!hasChosenLanguage) {
        return {
          language,
          hasChosenLanguage: false,
          initialScreen: 'language',
          activeDetail: null,
        };
      }

      // If user has chosen language previously, restore their last screen or default to 'home'
      let initialScreen: 'language' | 'home' | 'about' | 'detail' | 'panchangam' = 'home';
      if (lastScreen === 'about') {
        initialScreen = 'about';
      } else if (lastScreen === 'panchangam') {
        initialScreen = 'panchangam';
      } else if (lastScreen === 'detail' && activeDetail) {
        initialScreen = 'detail';
      } else if (lastScreen === 'language') {
        initialScreen = 'language';
      } else {
        initialScreen = 'home';
      }

      return {
        language,
        hasChosenLanguage: true,
        initialScreen,
        activeDetail,
      };
    } catch {
      return {
        language: 'te',
        hasChosenLanguage: false,
        initialScreen: 'language',
        activeDetail: null,
      };
    }
  },

  // Dynamic Splash Screen Offline Caching
  async getCachedSplash(): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_SPLASH_META);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async saveCachedSplash(meta: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CACHED_SPLASH_META, JSON.stringify(meta));
    } catch (e) {
      console.warn('Failed to cache splash metadata', e);
    }
  },
};

