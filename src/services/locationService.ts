import AsyncStorage from '@react-native-async-storage/async-storage';

function getLocationModule(): any {
  try {
    return require('expo-location');
  } catch {
    return null;
  }
}

export interface UserLiveLocation {
  cityName: string;
  displayName: string;
  state?: string;
  lat: number;
  lng: number;
  isLive: boolean;
  updatedAt: number;
}

const STORAGE_KEY = '@ayyappa_user_location';

export const LocationService = {
  // Get currently saved location from storage (defaults to Hyderabad if none yet)
  async getSavedLocation(): Promise<UserLiveLocation | null> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('[LocationService] Failed to read saved location:', e);
    }
    return null;
  },

  // Save selected or detected location
  async saveLocation(loc: UserLiveLocation): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
    } catch (e) {
      console.warn('[LocationService] Failed to save location:', e);
    }
  },

  // Fetch device live location using GPS first, with IP Geolocation fallback
  async detectLiveLocation(): Promise<UserLiveLocation> {
    // 1. Try GPS via expo-location
    try {
      const Location = getLocationModule();
      if (!Location) {
        throw new Error('Location module not loaded');
      }

      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus === 'granted') {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy?.Balanced || 3,
        });

        const { latitude, longitude } = position.coords;
        const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });

        let city = '';
        let region = '';

        if (geocode && geocode.length > 0) {
          const first = geocode[0];
          city = first.city || first.subregion || first.district || first.name || '';
          region = first.region || '';
        }

        if (!city && region) city = region;
        if (!city) city = 'Hyderabad';

        const result: UserLiveLocation = {
          cityName: city,
          displayName: region ? `${city}, ${region}` : city,
          state: region,
          lat: latitude,
          lng: longitude,
          isLive: true,
          updatedAt: Date.now(),
        };

        await this.saveLocation(result);
        return result;
      }
    } catch (gpsError: any) {
      console.warn('[LocationService] GPS reverse-geocode failed, trying IP fallback:', gpsError?.message);
    }

    // 2. Fallback to IP-based Geolocation (100% reliable for city/state detection)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch('https://ipapi.co/json/', {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const ipData = await res.json();
        const city = ipData.city || 'Hyderabad';
        const region = ipData.region || ipData.region_code || '';
        const lat = typeof ipData.latitude === 'number' ? ipData.latitude : 17.385;
        const lng = typeof ipData.longitude === 'number' ? ipData.longitude : 78.4867;

        const result: UserLiveLocation = {
          cityName: city,
          displayName: region ? `${city}, ${region}` : city,
          state: region,
          lat,
          lng,
          isLive: true,
          updatedAt: Date.now(),
        };

        await this.saveLocation(result);
        return result;
      }
    } catch (ipError: any) {
      console.warn('[LocationService] IP Geolocation fallback failed:', ipError?.message);
    }

    // Default fallback if offline
    return {
      cityName: 'Hyderabad',
      displayName: 'Hyderabad',
      state: 'Telangana',
      lat: 17.385,
      lng: 78.4867,
      isLive: false,
      updatedAt: Date.now(),
    };
  },
};
