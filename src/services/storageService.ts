// Devotional Storage Service: Handles language selection, navigation state, and dynamic splash caching
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SupportedLanguage, DeityItem, NotificationPreferences, BookmarkItem } from '../types';

const STORAGE_KEYS = {
  LANGUAGE: '@ayyappa_user_language',
  HAS_CHOSEN_LANGUAGE: '@ayyappa_has_chosen_language',
  LAST_SCREEN: '@ayyappa_last_screen',
  LAST_DETAIL: '@ayyappa_last_detail',
  CURRENT_USER: '@ayyappa_current_user',
  DOWNLOADED_AUDIO_PREFIX: '@ayyappa_downloaded_audio_',
  AUDIO_PROGRESS_PREFIX: '@ayyappa_audio_progress_',
  CACHED_SPLASH_META: '@ayyappa_cached_splash_meta',
  HAS_COMPLETED_ONBOARDING: '@ayyappa_has_completed_onboarding',
  CHOSEN_DEITY: '@ayyappa_chosen_deity',
  HAS_CHOSEN_DEITY: '@ayyappa_has_chosen_deity',
  NOTIFICATIONS_READ: '@ayyappa_notifications_read',
  NOTIFICATION_PREFS: '@ayyappa_notification_prefs',
  BOOKMARKS: '@ayyappa_user_bookmarks',
  PENDING_SELECTED_ROLE: '@ayyappa_pending_selected_role',
};

export type MobileScreen = 'splash' | 'welcome' | 'onboarding' | 'role_selection' | 'choose_deity' | 'auth' | 'language' | 'complete_profile' | 'home' | 'categories' | 'services' | 'category_listing' | 'pooja_detail' | 'sloka_detail' | 'bhajans_songs' | 'live_streams' | 'temples' | 'temple_detail' | 'food_donation' | 'donations' | 'notifications' | 'bookmarks' | 'profile' | 'edit_profile' | 'terms' | 'privacy_policy' | 'about' | 'contact' | 'detail' | 'panchangam';

export interface AppPersistentState {
  currentScreen: MobileScreen;
  selectedLanguage: SupportedLanguage;
  activeDetail: { id: string; title: string } | null;
  hasChosenLanguage: boolean;
}

export const StorageService = {
  // Get stored language
  async getStoredLanguage(): Promise<SupportedLanguage | null> {
    try {
      const lang = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
      if (lang === 'te' || lang === 'kn' || lang === 'en' || lang === 'ta' || lang === 'hi' || lang === 'ml') {
        return lang as SupportedLanguage;
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

  // Onboarding completion persistence
  async hasCompletedOnboarding(): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING);
      return val === 'true';
    } catch {
      return false;
    }
  },

  async setOnboardingCompleted(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING, 'true');
    } catch (e) {
      console.warn('Failed to save onboarding completion state', e);
    }
  },

  // Chosen Deity Persistent State
  async getStoredDeity(): Promise<DeityItem | null> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.CHOSEN_DEITY);
      if (val) {
        return JSON.parse(val);
      }
      return null;
    } catch {
      return null;
    }
  },

  async setStoredDeity(deity: DeityItem): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CHOSEN_DEITY, JSON.stringify(deity));
      await AsyncStorage.setItem(STORAGE_KEYS.HAS_CHOSEN_DEITY, 'true');
    } catch (e) {
      console.warn('Failed to save chosen deity to storage', e);
    }
  },

  async hasChosenDeity(): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.HAS_CHOSEN_DEITY);
      return val === 'true';
    } catch {
      return false;
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
    screen: MobileScreen,
    activeDetail: { id: string; title: string } | null
  ): Promise<void> {
    try {
      // Don't persist splash or auth as target screen to restore
      if (screen !== 'splash' && screen !== 'auth') {
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
    initialScreen: 'language' | 'home' | 'categories' | 'profile' | 'about' | 'contact' | 'detail' | 'panchangam';
    activeDetail: { id: string; title: string } | null;
    currentUser?: any;
  }> {
    try {
      const storedLang = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
      const hasChosen = await AsyncStorage.getItem(STORAGE_KEYS.HAS_CHOSEN_LANGUAGE);
      const lastScreen = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SCREEN);
      const lastDetailStr = await AsyncStorage.getItem(STORAGE_KEYS.LAST_DETAIL);
      const userStr = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);

      let storedUser: any = null;
      if (userStr) {
        try {
          storedUser = JSON.parse(userStr);
        } catch { }
      }

      const supported = ['te', 'kn', 'en', 'ta', 'hi', 'ml'];
      const language: SupportedLanguage =
        storedLang && supported.includes(storedLang)
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
          currentUser: storedUser,
        };
      }

      // If user has chosen language previously, restore their last screen or default to 'home'
      let initialScreen: 'language' | 'home' | 'categories' | 'profile' | 'about' | 'contact' | 'detail' | 'panchangam' = 'home';
      if (lastScreen === 'categories' || lastScreen === 'service') {
        initialScreen = 'categories';
      } else if (lastScreen === 'profile') {
        initialScreen = 'profile';
      } else if (lastScreen === 'about') {
        initialScreen = 'about';
      } else if (lastScreen === 'contact') {
        initialScreen = 'contact';
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
        currentUser: storedUser,
      };
    } catch {
      return {
        language: 'te',
        hasChosenLanguage: false,
        initialScreen: 'language',
        activeDetail: null,
        currentUser: null,
      };
    }
  },

  // Role selection persistence ('DEVOTEE' | 'DHARMA_KARTHA')
  async getPendingRole(): Promise<'DEVOTEE' | 'DHARMA_KARTHA'> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_SELECTED_ROLE);
      if (val === 'DHARMA_KARTHA') {
        return 'DHARMA_KARTHA';
      }
      return 'DEVOTEE';
    } catch {
      return 'DEVOTEE';
    }
  },

  async setPendingRole(role: 'DEVOTEE' | 'DHARMA_KARTHA' | 'CUSTOMER'): Promise<void> {
    try {
      const canonicalRole = role === 'CUSTOMER' ? 'DEVOTEE' : role;
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SELECTED_ROLE, canonicalRole);
    } catch (e) {
      console.warn('Failed to save pending role', e);
    }
  },

  // Stored Devotee User persistence
  async getStoredUser(): Promise<any | null> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return val ? JSON.parse(val) : null;
    } catch {
      return null;
    }
  },

  async setStoredUser(user: any | null): Promise<void> {
    try {
      if (user) {
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    } catch (e) {
      console.warn('Failed to save devotee user to storage', e);
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

  // Notification Read Status Persistence
  async getReadNotificationIds(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_READ);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async markNotificationRead(id: string): Promise<void> {
    try {
      const current = await this.getReadNotificationIds();
      if (!current.includes(id)) {
        current.push(id);
        await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_READ, JSON.stringify(current));
      }
    } catch (e) {
      console.warn('Failed to mark notification as read', e);
    }
  },

  // Notification Preferences Persistence
  async getNotificationPreferences(): Promise<NotificationPreferences> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_PREFS);
      if (data) {
        return JSON.parse(data);
      }
    } catch { }
    return {
      liveStreams: true,
      templeFestivals: true,
      annadanam: true,
      panchangam: true,
      sevaReminders: true,
    };
  },

  async saveNotificationPreferences(prefs: NotificationPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_PREFS, JSON.stringify(prefs));
    } catch (e) {
      console.warn('Failed to save notification preferences', e);
    }
  },

  // Bookmarks Persistence
  async getBookmarks(): Promise<BookmarkItem[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async toggleBookmark(item: BookmarkItem): Promise<boolean> {
    try {
      const list = await this.getBookmarks();
      const existsIndex = list.findIndex((b) => b.id === item.id);
      if (existsIndex >= 0) {
        list.splice(existsIndex, 1);
        await AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(list));
        return false; // Removed
      } else {
        list.unshift(item);
        await AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(list));
        return true; // Added
      }
    } catch (e) {
      console.warn('Failed to toggle bookmark', e);
      return false;
    }
  },

  async isBookmarked(id: string): Promise<boolean> {
    try {
      const list = await this.getBookmarks();
      return list.some((b) => b.id === id);
    } catch {
      return false;
    }
  },
};

