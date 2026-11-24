import AsyncStorage from '@react-native-async-storage/async-storage';

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
const STORAGE_CLEAN_KEY = '@ayyappa_user_location_clean';

export const KNOWN_CITIES: Record<string, { name: string; state: string; lat: number; lng: number }> = {
  bengaluru: { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  bangalore: { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  hyderabad: { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
  secunderabad: { name: 'Hyderabad', state: 'Telangana', lat: 17.4399, lng: 78.4983 },
  chennai: { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  madras: { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  sabarimala: { name: 'Sabarimala', state: 'Kerala', lat: 9.4402, lng: 77.0819 },
  pathanamthitta: { name: 'Sabarimala', state: 'Kerala', lat: 9.2648, lng: 76.7870 },
  kochi: { name: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673 },
  cochin: { name: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673 },
  vijayawada: { name: 'Vijayawada', state: 'Andhra Pradesh', lat: 16.5062, lng: 80.6480 },
  visakhapatnam: { name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185 },
  vizag: { name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185 },
  tirupati: { name: 'Tirupati', state: 'Andhra Pradesh', lat: 13.6288, lng: 79.4192 },
  thiruvananthapuram: { name: 'Thiruvananthapuram', state: 'Kerala', lat: 8.5241, lng: 76.9366 },
  mumbai: { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
  bombay: { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
  delhi: { name: 'Delhi', state: 'Delhi NCR', lat: 28.6139, lng: 77.2090 },
  'new delhi': { name: 'New Delhi', state: 'Delhi NCR', lat: 28.6139, lng: 77.2090 },
  warangal: { name: 'Warangal', state: 'Telangana', lat: 17.9689, lng: 79.5941 },
  guntur: { name: 'Guntur', state: 'Andhra Pradesh', lat: 16.3067, lng: 80.4365 },
  rajahmundry: { name: 'Rajahmundry', state: 'Andhra Pradesh', lat: 17.0005, lng: 81.8040 },
  nellore: { name: 'Nellore', state: 'Andhra Pradesh', lat: 14.4426, lng: 79.9865 },
  kurnool: { name: 'Kurnool', state: 'Andhra Pradesh', lat: 15.8281, lng: 78.0373 },
  nizamabad: { name: 'Nizamabad', state: 'Telangana', lat: 18.6725, lng: 78.0941 },
  karimnagar: { name: 'Karimnagar', state: 'Telangana', lat: 18.4386, lng: 79.1288 },
  mysore: { name: 'Mysore', state: 'Karnataka', lat: 12.2958, lng: 76.6394 },
  mysuru: { name: 'Mysore', state: 'Karnataka', lat: 12.2958, lng: 76.6394 },
  mangalore: { name: 'Mangalore', state: 'Karnataka', lat: 12.9141, lng: 74.8560 },
  madurai: { name: 'Madurai', state: 'Tamil Nadu', lat: 9.9252, lng: 78.1198 },
  coimbatore: { name: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lng: 76.9558 },
  varanasi: { name: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lng: 82.9739 },
  kolkata: { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
};

export function standardizeCityName(raw: string | null | undefined): string {
  if (!raw) return 'Bengaluru';
  let clean = String(raw).trim();
  // Strip json object wrapping e.g. {"cityName":"..."}
  if (clean.startsWith('{') && clean.endsWith('}')) {
    try {
      const obj = JSON.parse(clean);
      clean = obj.cityName || obj.displayName || obj.name || 'Bengaluru';
    } catch {}
  }
  // Strip any parenthetical notes e.g. (Live GPS)
  clean = clean.replace(/\s*\([^)]*\)/g, '').trim();
  // Strip after comma if "Bengaluru, Karnataka"
  if (clean.includes(',')) {
    clean = clean.split(',')[0].trim();
  }
  const key = clean.toLowerCase();
  if (KNOWN_CITIES[key]) {
    return KNOWN_CITIES[key].name;
  }
  return clean || 'Bengaluru';
}

export function createLocationObject(cityName: string, isLive: boolean = false): UserLiveLocation {
  const std = standardizeCityName(cityName);
  const key = std.toLowerCase();
  const known = KNOWN_CITIES[key];
  if (known) {
    return {
      cityName: known.name,
      displayName: known.name,
      state: known.state,
      lat: known.lat,
      lng: known.lng,
      isLive,
      updatedAt: Date.now(),
    };
  }
  return {
    cityName: std,
    displayName: std,
    lat: 12.9716,
    lng: 77.5946,
    isLive,
    updatedAt: Date.now(),
  };
}

export const LocationService = {
  // Get saved location from storage (resilient to JSON or plain string)
  async getSavedLocation(): Promise<UserLiveLocation> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object' && parsed.cityName) {
            const std = standardizeCityName(parsed.cityName);
            return {
              ...parsed,
              cityName: std,
              displayName: std,
            };
          }
        } catch {}
        return createLocationObject(raw);
      }
      const cleanRaw = await AsyncStorage.getItem(STORAGE_CLEAN_KEY);
      if (cleanRaw) {
        return createLocationObject(cleanRaw);
      }
    } catch (e) {
      console.warn('[LocationService] Failed to read saved location:', e);
    }
    return createLocationObject('Bengaluru');
  },

  // Save selected or detected location
  async saveLocation(loc: UserLiveLocation | string): Promise<UserLiveLocation> {
    const locObj = typeof loc === 'string' ? createLocationObject(loc) : loc;
    const std = standardizeCityName(locObj.cityName);
    const normalized: UserLiveLocation = {
      ...locObj,
      cityName: std,
      displayName: std,
      updatedAt: Date.now(),
    };
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      await AsyncStorage.setItem(STORAGE_CLEAN_KEY, std);
    } catch (e) {
      console.warn('[LocationService] Failed to save location:', e);
    }
    return normalized;
  },

  // Fetch device live location using multi-source IP Geolocation
  async detectLiveLocation(): Promise<UserLiveLocation> {
    // 1. Try ipwho.is (fast, highly accurate in India, no rate limits)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch('https://ipwho.is/', { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.city) {
          const std = standardizeCityName(data.city);
          const loc = createLocationObject(std, true);
          if (typeof data.latitude === 'number') loc.lat = data.latitude;
          if (typeof data.longitude === 'number') loc.lng = data.longitude;
          if (data.region) loc.state = data.region;
          await this.saveLocation(loc);
          return loc;
        }
      }
    } catch {}

    // 2. Try ipapi.co fallback
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const ipData = await res.json();
        if (ipData && ipData.city) {
          const std = standardizeCityName(ipData.city);
          const loc = createLocationObject(std, true);
          if (typeof ipData.latitude === 'number') loc.lat = ipData.latitude;
          if (typeof ipData.longitude === 'number') loc.lng = ipData.longitude;
          if (ipData.region) loc.state = ipData.region;
          await this.saveLocation(loc);
          return loc;
        }
      }
    } catch {}

    // Return previously saved location or Bengaluru default
    return await this.getSavedLocation();
  },
};
