import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
  BackHandler,
  Modal,
  TextInput,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { ApiService } from '../../../services/api';
import { SupportedLanguage, PanchangamData } from '../../../types';
import { CITIES_LIST, PanchangamLocalEngine } from '../../../utils/panchangam';
import {
  LocationService,
  UserLiveLocation,
  standardizeCityName,
  createLocationObject,
} from '../../../services/locationService';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
const { width: SCREEN_WIDTH_FULL, height: SCREEN_HEIGHT_FULL } = Dimensions.get('screen');
const SCREEN_WIDTH = Math.min(WINDOW_WIDTH, SCREEN_WIDTH_FULL);
const SCREEN_HEIGHT = Math.max(WINDOW_HEIGHT, SCREEN_HEIGHT_FULL);
const isLargeOrTallScreen = SCREEN_HEIGHT >= 800 || (SCREEN_HEIGHT / SCREEN_WIDTH) >= 1.95;

const ANDROID_STATUS_BAR_HEIGHT = Platform.OS === 'android'
  ? Math.max(StatusBar.currentHeight || 0, isLargeOrTallScreen ? 44 : 36)
  : 0;

const AYYAPPA_WATERMARK = require('../../../../assets/ayyappa_watermark.png');

interface Props {
  currentLanguage: SupportedLanguage;
  currentLocation?: string;
  onLocationChange?: (city: string) => void;
  onBack?: () => void;
}

// Corner Filigree Ornaments for Header
const HeaderCornerFiligree = ({ flipped = false }: { flipped?: boolean }) => (
  <View style={flipped ? { transform: [{ scaleX: -1 }] } : undefined}>
    <Svg width={36} height={36} viewBox="0 0 36 36" fill="none">
      <Path
        d="M2 2 C12 2 22 8 28 16 C24 18 18 16 12 22 C8 16 6 8 2 2 Z"
        fill="#E2AD43"
        fillOpacity={0.8}
      />
      <Circle cx="8" cy="8" r="2" fill="#FFD700" />
      <Circle cx="16" cy="5" r="1.5" fill="#FFD700" />
      <Circle cx="5" cy="16" r="1.5" fill="#FFD700" />
    </Svg>
  </View>
);

// Back Arrow inside Header
const BackArrowIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M12 19l-7-7 7-7"
      stroke="#FFFDF8"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Sunrise Icon: Radiant Rising Sun with Golden Rays
const SunriseIcon = ({ size = 32 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    <Path d="M4 25 H32" stroke="#E67E22" strokeWidth={2.5} strokeLinecap="round" />
    <Path d="M11 25 A7 7 0 0 1 25 25 Z" fill="#F59E0B" stroke="#D97706" strokeWidth={1.2} />
    <Path d="M18 8 V12" stroke="#F59E0B" strokeWidth={2.2} strokeLinecap="round" />
    <Path d="M9 12 L12 15" stroke="#F59E0B" strokeWidth={2.2} strokeLinecap="round" />
    <Path d="M27 12 L24 15" stroke="#F59E0B" strokeWidth={2.2} strokeLinecap="round" />
    <Path d="M5 20 H9" stroke="#F59E0B" strokeWidth={2.2} strokeLinecap="round" />
    <Path d="M27 20 H31" stroke="#F59E0B" strokeWidth={2.2} strokeLinecap="round" />
  </Svg>
);

// Sunset Icon: Radiant Setting Sun on Horizon
const SunsetIcon = ({ size = 32 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    <Path d="M4 25 H32" stroke="#B45309" strokeWidth={2.5} strokeLinecap="round" />
    <Path d="M11 25 A7 7 0 0 1 25 25 Z" fill="#EA580C" stroke="#9A3412" strokeWidth={1.2} />
    <Path d="M18 10 V14" stroke="#EA580C" strokeWidth={2.2} strokeLinecap="round" />
    <Path d="M9 14 L12 17" stroke="#EA580C" strokeWidth={2.2} strokeLinecap="round" />
    <Path d="M27 14 L24 17" stroke="#EA580C" strokeWidth={2.2} strokeLinecap="round" />
    <Path d="M5 20 H9" stroke="#EA580C" strokeWidth={2.2} strokeLinecap="round" />
    <Path d="M27 20 H31" stroke="#EA580C" strokeWidth={2.2} strokeLinecap="round" />
  </Svg>
);

// Chevron Icons
const ChevronLeftIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 19l-7-7 7-7"
      stroke="#7A5210"
      strokeWidth={2.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChevronRightIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 5l7 7-7 7"
      stroke="#7A5210"
      strokeWidth={2.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Tithi: Crescent Moon Icon
const CrescentMoonIcon = ({ size = 20, color = '#D97706' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 13.5C18.8 17.5 14.8 20 10.5 19.5C6.2 19 2.8 15.5 2.5 11.2C2.2 6.9 4.8 3 8.8 1.8C8 3.5 8.2 5.5 9.2 7.2C10.5 9.5 13 10.8 15.8 10.5C17.5 10.3 19.1 9.4 20 8C20.2 9.8 20.2 11.8 20 13.5Z"
      fill={color}
    />
  </Svg>
);

// Nakshatram: Cosmic 8-point Star Icon
const StarConstellationIcon = ({ size = 20, color = '#15803D' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L14.5 8.5L21.5 9.2L16.2 14L17.8 21L12 17.4L6.2 21L7.8 14L2.5 9.2L9.5 8.5L12 2Z"
      fill={color}
    />
  </Svg>
);

// Vaaram: Solar Sun Wheel Icon
const VaaramSunIcon = ({ size = 20, color = '#EA580C' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="5" fill={color} />
    <Path d="M12 2V5M12 19V22M2 12H5M19 12H22M4.9 4.9L7.1 7.1M16.9 16.9L19.1 19.1M4.9 19.1L7.1 16.9M16.9 7.1L19.1 4.9" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
  </Svg>
);

// Yoga: Lotus Flower Icon
const LotusYogaIcon = ({ size = 20, color = '#7E22CE' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 4C12 4 8 9 8 13C8 16 10 18 12 18C14 18 16 16 16 13C16 9 12 4 12 4Z" fill={color} />
    <Path d="M12 18C8 18 4 15 4 12C4 9.5 6 8.5 7 9C7 12 9 15 12 18Z" fill={color} opacity={0.7} />
    <Path d="M12 18C16 18 20 15 20 12C20 9.5 18 8.5 17 9C17 12 15 15 12 18Z" fill={color} opacity={0.7} />
    <Path d="M3 20C7 21 17 21 21 20" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

// Karana: Sacred Conch / Shell Icon
const ConchKaranaIcon = ({ size = 20, color = '#0284C7' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 8C19 4.5 16 2 12.5 2C9 2 6.5 4.5 6.5 8C6.5 11 8.5 13.5 11 15.5L12 22L13.5 20.5L13 16C16.5 15 19 12 19 8Z"
      fill={color}
    />
    <Path d="M11 6C11 4.5 12 3.5 13 4" stroke="#FFF" strokeWidth={1.2} strokeLinecap="round" />
    <Path d="M10 9C10 7.5 11.5 6 13.5 6.5" stroke="#FFF" strokeWidth={1.2} strokeLinecap="round" />
  </Svg>
);

// Abhijit: Auspicious Victory Star Icon
const AbhijitStarIcon = ({ size = 22, color = '#15803D' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill="#DCFCE7" stroke={color} strokeWidth={1.5} />
    <Path
      d="M12 6L13.5 10L17.5 10.5L14.5 13.5L15.5 17.5L12 15.5L8.5 17.5L9.5 13.5L6.5 10.5L10.5 10L12 6Z"
      fill={color}
    />
  </Svg>
);

// Rahu / Warning Icon
const WarningShieldIcon = ({ size = 20, color = '#DC2626' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill="#FEE2E2" stroke={color} strokeWidth={1.5} />
    <Path d="M12 7V13M12 16V17" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
  </Svg>
);

// Diya Lamp Icon
const DiyaLampIcon = ({ size = 24, color = '#D97706' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C12 2 9 6.5 9 8.5C9 10 10.3 11 12 11C13.7 11 15 10 15 8.5C15 6.5 12 2 12 2Z" fill="#F59E0B" />
    <Path d="M12 5C12 5 10.5 7.5 10.5 8.5C10.5 9.3 11.2 9.8 12 9.8C12.8 9.8 13.5 9.3 13.5 8.5C13.5 7.5 12 5 12 5Z" fill="#EA580C" />
    <Path d="M4 14C4 17.5 7.5 19.5 12 19.5C16.5 19.5 20 17.5 20 14C20 12.5 19 12.5 17 13.5C14 14.5 10 14.5 7 13.5C5 12.5 4 12.5 4 14Z" fill={color} />
    <Path d="M7 19.5H17V21.5H7V19.5Z" fill={color} />
  </Svg>
);

const SCREEN_TITLES: Record<SupportedLanguage, string> = {
  en: 'Vedic Panchangam',
  te: 'నేటి పంచాంగం',
  kn: 'ಇಂದಿನ ಪಂಚಾಂಗ',
  ta: 'இன்றைய பஞ்சாங்கம்',
  hi: 'वैदिक पंचांग',
};

const SUN_LABELS: Record<string, Record<SupportedLanguage, string>> = {
  sunrise: {
    en: 'Sunrise',
    te: 'సూర్యోదయం',
    kn: 'ಸೂರ್ಯೋದಯ',
    ta: 'சூரிய உதயம்',
    hi: 'सूर्योदय',
  },
  sunset: {
    en: 'Sunset',
    te: 'సూర్యాస్తమయం',
    kn: 'ಸೂರ್ಯಾಸ್ತಮయ',
    ta: 'சூரிய அஸ்தமனம்',
    hi: 'सूर्यास्त',
  },
};

const SECTION_HEADERS: Record<string, Record<SupportedLanguage, string>> = {
  panchaAngas: {
    en: 'Pancha-Angas (Five Sacred Limbs)',
    te: 'పంచాంగాలు (పంచ అంగాలు)',
    kn: 'ಪಂಚಾಂಗಗಳು (ಐದು ಅಂಗಗಳು)',
    ta: 'பஞ்ச-அங்கங்கள் (ஐந்து அங்கங்கள்)',
    hi: 'पंचांग (पाँच मुख्य अंग)',
  },
  auspicious: {
    en: 'Shubha Kalam (Auspicious)',
    te: 'శుభ సమయాలు (విజయ ముహూర్తం)',
    kn: 'ಶುಭ ಸಮಯಗಳು (ವಿಜಯ ಮುಹೂರ್ತ)',
    ta: 'சுப காலங்கள் (வெற்றி நேரம்)',
    hi: 'शुभ मुहूर्त (विजय काल)',
  },
  inauspicious: {
    en: 'Ashubha Kalam (Inauspicious / Varjyam)',
    te: 'అశుభ కాలాలు (వర్జ్యం & రాహుకాలం)',
    kn: 'ಅಶುಭ ಕಾಲಗಳು (ವರ್ಜ್ಯ & ರಾಹುಕಾಲ)',
    ta: 'அசுப காலங்கள் (ராகு & எமகண்டம்)',
    hi: 'अशुभ काल (राहुकाल व यमगंड)',
  },
  special: {
    en: "Today's Special & Vratham",
    te: 'నేటి విశేషం & వ్రతాలు',
    kn: 'ಇಂದಿನ ವಿಶೇಷ & ವ್ರತಗಳು',
    ta: 'இன்றைய சிறப்பு & விரதங்கள்',
    hi: 'आज का विशेष व व्रत',
  },
};

const ROW_LABELS: Record<string, Record<SupportedLanguage, string>> = {
  tithi: { en: 'Tithi', te: 'తిథి', kn: 'ತಿಥಿ', ta: 'திதி', hi: 'तिथि' },
  nakshatram: { en: 'Nakshatram', te: 'నక్షత్రం', kn: 'ನಕ್ಷತ್ರ', ta: 'நட்சத்திரம்', hi: 'नक्षत्र' },
  vaaram: { en: 'Vaaram (Day)', te: 'వారం', kn: 'ವಾರ', ta: 'வாரம்', hi: 'वार' },
  yoga: { en: 'Yoga', te: 'యోగం', kn: 'ಯೋಗ', ta: 'யோகம்', hi: 'योग' },
  karana: { en: 'Karana', te: 'కరణం', kn: 'ಕರಣ', ta: 'கரணம்', hi: 'करण' },
  rahuKalam: { en: 'Rahu Kalam', te: 'రాహు కాలం', kn: 'ರಾಹು ಕಾಲ', ta: 'ராகு காலம்', hi: 'राहुकाल' },
  yamagandam: { en: 'Yamagandam', te: 'యమగండం', kn: 'ಯಮಗಂಡ', ta: 'எமகண்டம்', hi: 'यमगंड' },
  gulikaKalam: { en: 'Gulika Kalam', te: 'గుళిక కాలం', kn: 'ಗುಳಿಕ ಕಾಲ', ta: 'குளிகை காலம்', hi: 'गुलिक काल' },
  abhijitMuhurtam: { en: 'Abhijit Muhurtam', te: 'అభిజిత్ ముహూర్తం', kn: 'ಅಭಿಜಿತ್ ಮುಹೂರ್ತ', ta: 'அபிஜித் முகூர்த்தம்', hi: 'अभिजित मुहूर्त' },
};

export const PanchangamScreen: React.FC<Props> = ({
  currentLanguage,
  currentLocation,
  onLocationChange,
  onBack,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCity, setSelectedCity] = useState<string>(
    currentLocation ? standardizeCityName(currentLocation) : 'Bengaluru'
  );
  const [liveLocation, setLiveLocation] = useState<UserLiveLocation | null>(null);
  const [detectingLocation, setDetectingLocation] = useState<boolean>(false);
  const [isLiveActive, setIsLiveActive] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCityModal, setShowCityModal] = useState<boolean>(false);
  const [data, setData] = useState<PanchangamData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync with prop when currentLocation changes
  useEffect(() => {
    if (currentLocation) {
      const std = standardizeCityName(currentLocation);
      setSelectedCity(std);
      setLiveLocation(createLocationObject(std));
    }
  }, [currentLocation]);

  // Android Mobile Hardware / Gesture Back Button handling
  useEffect(() => {
    if (!onBack) return;
    const backSub = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => backSub.remove();
  }, [onBack]);

  // Load saved location on startup if not passed via prop
  useEffect(() => {
    let isMounted = true;
    async function initLocation() {
      try {
        if (!currentLocation) {
          const saved = await LocationService.getSavedLocation();
          if (saved && isMounted) {
            setSelectedCity(saved.cityName);
            setLiveLocation(saved);
          }
        }
      } catch (e) {
        console.warn('[Panchangam] Location init note:', e);
      }
    }
    initLocation();
    return () => {
      isMounted = false;
    };
  }, [currentLocation]);

  // Handle user explicitly requesting live location detection
  const handleDetectLiveLocation = useCallback(async () => {
    try {
      setDetectingLocation(true);
      const live = await LocationService.detectLiveLocation();
      if (live) {
        const std = standardizeCityName(live.cityName);
        setSelectedCity(std);
        setLiveLocation(live);
        setIsLiveActive(true);
        setShowCityModal(false);
        if (onLocationChange) onLocationChange(std);
      }
    } catch (e) {
      console.warn('[Panchangam] Live location detection error:', e);
    } finally {
      setDetectingLocation(false);
    }
  }, [onLocationChange]);

  // Handle user selecting a specific city from the catalog
  const handleSelectCity = useCallback(
    async (cityName: string) => {
      const std = standardizeCityName(cityName);
      setSelectedCity(std);
      setIsLiveActive(false);
      setShowCityModal(false);
      const updatedLoc = createLocationObject(std, false);
      setLiveLocation(updatedLoc);
      await LocationService.saveLocation(updatedLoc);
      if (onLocationChange) onLocationChange(std);
    },
    [onLocationChange]
  );

  // Is today's date selected?
  const isToday = useMemo(() => {
    const today = new Date();
    return (
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    );
  }, [selectedDate]);

  // Formatted date string
  const formattedDateString = useMemo(() => {
    const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthsShort = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    const weekday = daysShort[selectedDate.getDay()];
    const dayNum = String(selectedDate.getDate()).padStart(2, '0');
    const month = monthsShort[selectedDate.getMonth()];
    const year = selectedDate.getFullYear();
    return `${weekday}, ${dayNum} ${month} ${year}`;
  }, [selectedDate]);

  // Date Navigation
  const handlePrevDay = useCallback(() => {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() - 1);
      return next;
    });
  }, []);

  const handleNextDay = useCallback(() => {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 1);
      return next;
    });
  }, []);

  const handleResetToToday = useCallback(() => {
    setSelectedDate(new Date());
  }, []);

  // Fetch or calculate Panchangam
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const pad = (n: number) => String(n).padStart(2, '0');
        const dateIso = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`;
        const customCoords =
          isLiveActive && liveLocation ? { lat: liveLocation.lat, lng: liveLocation.lng } : undefined;

        const targetCity = selectedCity || currentLocation || 'Bengaluru';
        const res = await ApiService.getPanchangam(currentLanguage, dateIso, targetCity, customCoords);
        if (isMounted) {
          setData(res);
        }
      } catch (e) {
        console.warn('API error, relying on local calculation engine:', e);
        if (isMounted) {
          const targetCity = selectedCity || currentLocation || 'Bengaluru';
          const customCoords =
            isLiveActive && liveLocation ? { lat: liveLocation.lat, lng: liveLocation.lng } : undefined;
          const fallback = PanchangamLocalEngine.calculate(
            selectedDate,
            targetCity,
            currentLanguage,
            customCoords
          );
          setData(fallback);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [selectedDate, selectedCity, currentLocation, currentLanguage, isLiveActive, liveLocation]);

  // Fallback to local engine immediately if data is null
  const displayData = useMemo(() => {
    const targetCity = selectedCity || currentLocation || 'Bengaluru';
    if (data) return data;
    const customCoords =
      isLiveActive && liveLocation ? { lat: liveLocation.lat, lng: liveLocation.lng } : undefined;
    return PanchangamLocalEngine.calculate(selectedDate, targetCity, currentLanguage, customCoords);
  }, [data, selectedDate, selectedCity, currentLocation, currentLanguage, isLiveActive, liveLocation]);

  // Localized city name
  const localizedCityName = useMemo(() => {
    const city = selectedCity || currentLocation || 'Bengaluru';
    const match = CITIES_LIST.find((c) => c.name.toLowerCase() === city.toLowerCase());
    if (match) {
      if (currentLanguage === 'te') return match.nameTe;
      if (currentLanguage === 'kn') return match.nameKn;
      if (currentLanguage === 'ta') return match.nameTa;
      if (currentLanguage === 'hi') return match.nameHi;
      return match.name;
    }
    return city;
  }, [selectedCity, currentLocation, currentLanguage]);

  // Filter cities for modal
  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) return CITIES_LIST;
    const q = searchQuery.toLowerCase().trim();
    return CITIES_LIST.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.nameTe && c.nameTe.includes(q)) ||
        (c.nameKn && c.nameKn.includes(q)) ||
        (c.nameTa && c.nameTa.includes(q)) ||
        (c.nameHi && c.nameHi.includes(q))
    );
  }, [searchQuery]);

  // Pancha-Anga (5 Core Limbs) list items
  const panchaAngaList = useMemo(() => {
    const l = currentLanguage;
    return [
      {
        key: 'tithi',
        label: ROW_LABELS.tithi[l] || 'Tithi',
        value: displayData.tithi || 'Shukla Navami',
        subValue: displayData.tithiEndTime ? `వరకు ${displayData.tithiEndTime}` : undefined,
        icon: <CrescentMoonIcon size={20} color="#D97706" />,
        medallionBg: '#FFF3DC',
        medallionBorder: '#F5C249',
      },
      {
        key: 'nakshatram',
        label: ROW_LABELS.nakshatram[l] || 'Nakshatram',
        value: displayData.nakshatram || 'Pushya',
        subValue: displayData.nakshatraEndTime ? `వరకు ${displayData.nakshatraEndTime}` : undefined,
        icon: <StarConstellationIcon size={20} color="#15803D" />,
        medallionBg: '#EAF7EE',
        medallionBorder: '#81C784',
      },
      {
        key: 'vaaram',
        label: ROW_LABELS.vaaram[l] || 'Vaaram',
        value: displayData.vaaram || 'Mangalavaram',
        icon: <VaaramSunIcon size={20} color="#EA580C" />,
        medallionBg: '#FFF3E0',
        medallionBorder: '#FFB74D',
      },
      {
        key: 'yoga',
        label: ROW_LABELS.yoga[l] || 'Yoga',
        value: displayData.yoga || 'Siddha',
        icon: <LotusYogaIcon size={20} color="#7E22CE" />,
        medallionBg: '#F8EEFC',
        medallionBorder: '#CE93D8',
      },
      {
        key: 'karana',
        label: ROW_LABELS.karana[l] || 'Karana',
        value: displayData.karana || 'Taitila',
        icon: <ConchKaranaIcon size={20} color="#0284C7" />,
        medallionBg: '#E0F7FA',
        medallionBorder: '#80DEEA',
      },
    ];
  }, [displayData, currentLanguage]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#071A14" translucent />

      {/* Sacred Deity Background Watermark */}
      <View style={styles.watermarkContainer} pointerEvents="none">
        <Image source={AYYAPPA_WATERMARK} style={styles.watermarkImage} resizeMode="contain" />
      </View>

      {/* =========================================================================
          SACRED HEADER: Deep Forest Gradient + Gold Ornaments + Safe Area Padding
         ========================================================================= */}
      <LinearGradient
        colors={['#071A14', '#0C2A20', '#0F382C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <SafeAreaView style={styles.headerSafeArea}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={onBack}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <BackArrowIcon />
          </TouchableOpacity>

          {/* Centered Title */}
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              {SCREEN_TITLES[currentLanguage] || 'Vedic Panchangam'}
            </Text>
          </View>

          {/* Corner Filigrees */}
          <View style={styles.headerRightOrnament}>
            <HeaderCornerFiligree flipped />
          </View>
          <View style={styles.filigreeTopLeft}>
            <HeaderCornerFiligree />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Location Bar with Live Coordinates indicator */}
      <View style={styles.locationBar}>
        <TouchableOpacity
          style={[styles.locationPill, isLiveActive && styles.locationPillLive]}
          activeOpacity={0.8}
          onPress={() => setShowCityModal(true)}
          accessibilityRole="button"
          accessibilityLabel="Change city location"
        >
          <Text style={styles.locationPin}>📍</Text>
          <Text style={styles.locationText}>{localizedCityName}</Text>
          {detectingLocation ? (
            <ActivityIndicator size="small" color="#0D382B" style={{ marginLeft: 6 }} />
          ) : (
            <Text style={styles.locationChevron}>▾</Text>
          )}
        </TouchableOpacity>

        {!isToday && (
          <TouchableOpacity
            style={styles.todayPill}
            activeOpacity={0.8}
            onPress={handleResetToToday}
            accessibilityRole="button"
            accessibilityLabel="Reset to today"
          >
            <Text style={styles.todayPillText}>
              {currentLanguage === 'te'
                ? 'నేడు'
                : currentLanguage === 'kn'
                ? 'ಇಂದು'
                : currentLanguage === 'ta'
                ? 'இன்று'
                : currentLanguage === 'hi'
                ? 'आज'
                : 'Today'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main Scroll Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* =========================================================================
            SECTION 1: CELESTIAL DATE CAPSULE & VEDIC ERA RIBBON
           ========================================================================= */}
        <View style={styles.dateSelectorCard}>
          <TouchableOpacity
            style={styles.dateChevronButton}
            onPress={handlePrevDay}
            activeOpacity={0.65}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Previous Day"
          >
            <ChevronLeftIcon />
          </TouchableOpacity>

          <View style={styles.dateCenterBlock}>
            <Text style={styles.dateSelectorText}>{formattedDateString}</Text>
          </View>

          <TouchableOpacity
            style={styles.dateChevronButton}
            onPress={handleNextDay}
            activeOpacity={0.65}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Next Day"
          >
            <ChevronRightIcon />
          </TouchableOpacity>
        </View>

        {/* Vedic Era Ribbon (Samvatsaram • Maasam • Paksham) */}
        {(displayData.samvatsaram || displayData.maasa || displayData.paksham) && (
          <View style={styles.vedicRibbonCard}>
            <Text style={styles.vedicRibbonText} numberOfLines={1}>
              {[
                displayData.samvatsaram,
                displayData.maasa,
                displayData.paksham,
              ]
                .filter(Boolean)
                .join(' • ')}
            </Text>
          </View>
        )}

        {/* =========================================================================
            SECTION 2: SURYA-CHANDRA MANDALAM (SUNRISE & SUNSET DUAL CARDS)
           ========================================================================= */}
        <View style={styles.sunDualRow}>
          {/* Sunrise Card */}
          <LinearGradient
            colors={['#FFFFFF', '#FFFDF9', '#FFF7EA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sunBox}
          >
            <View style={styles.sunIconDisc}>
              <SunriseIcon size={30} />
            </View>
            <View style={styles.sunDataGroup}>
              <Text style={styles.sunLabelText}>
                {SUN_LABELS.sunrise[currentLanguage] || 'Sunrise'}
              </Text>
              <Text style={styles.sunTimeText}>{displayData.sunrise || '06:43 AM'}</Text>
            </View>
          </LinearGradient>

          {/* Sunset Card */}
          <LinearGradient
            colors={['#FFFFFF', '#FFFDF9', '#FFF3ED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.sunBox, { borderColor: '#FCA5A5' }]}
          >
            <View style={[styles.sunIconDisc, { backgroundColor: '#FFEDD5', borderColor: '#FB923C' }]}>
              <SunsetIcon size={30} />
            </View>
            <View style={styles.sunDataGroup}>
              <Text style={[styles.sunLabelText, { color: '#9A3412' }]}>
                {SUN_LABELS.sunset[currentLanguage] || 'Sunset'}
              </Text>
              <Text style={[styles.sunTimeText, { color: '#9A3412' }]}>{displayData.sunset || '05:58 PM'}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* =========================================================================
            SECTION 3: PANCHA-ANGAS (THE 5 SACRED LIMBS OF TIME)
           ========================================================================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>
            {SECTION_HEADERS.panchaAngas[currentLanguage] || 'Pancha-Angas (Five Sacred Limbs)'}
          </Text>
        </View>

        <View style={styles.panchaAngaContainer}>
          <LinearGradient
            colors={['#FFFFFF', '#FFFDF9', '#FFFBF2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.panchaAngaCard}
          >
            {panchaAngaList.map((item, idx) => {
              const isLast = idx === panchaAngaList.length - 1;
              return (
                <View
                  key={item.key}
                  style={[styles.panchaAngaRow, isLast && styles.panchaAngaRowLast]}
                >
                  <View
                    style={[
                      styles.angaMedallion,
                      { backgroundColor: item.medallionBg, borderColor: item.medallionBorder },
                    ]}
                  >
                    {item.icon}
                  </View>
                  <View style={styles.angaLabelBlock}>
                    <Text style={styles.angaLabel}>{item.label}</Text>
                  </View>
                  <View style={styles.angaValueBlock}>
                    <Text style={styles.angaValue} numberOfLines={2}>
                      {item.value}
                    </Text>
                    {item.subValue && (
                      <Text style={styles.angaSubValue} numberOfLines={1}>
                        {item.subValue}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </LinearGradient>
        </View>

        {/* =========================================================================
            SECTION 4: SHUBHA MUHURTAM (AUSPICIOUS TIMINGS)
           ========================================================================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>
            {SECTION_HEADERS.auspicious[currentLanguage] || 'Shubha Kalam (Auspicious)'}
          </Text>
        </View>

        <LinearGradient
          colors={['#F0FDF4', '#DCFCE7', '#F0FDF4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.shubhaCard}
        >
          <View style={styles.shubhaIconWrap}>
            <AbhijitStarIcon size={26} color="#15803D" />
          </View>
          <View style={styles.shubhaContentBlock}>
            <View style={styles.shubhaTopRow}>
              <Text style={styles.shubhaTitle}>
                {ROW_LABELS.abhijitMuhurtam[currentLanguage] || 'Abhijit Muhurtam'}
              </Text>
              <View style={styles.vijayaBadge}>
                <Text style={styles.vijayaBadgeText}>SHUBHAM</Text>
              </View>
            </View>
            <Text style={styles.shubhaTimeText}>
              {displayData.abhijitMuhurtam || '11:59 AM – 12:45 PM'}
            </Text>
            <Text style={styles.shubhaSubText}>
              {currentLanguage === 'te'
                ? 'సర్వ కార్యాలకు, పూజలకు అత్యంత శ్రేష్టమైన సమయం'
                : 'Highly auspicious for all beginnings, prayers & rituals'}
            </Text>
          </View>
        </LinearGradient>

        {/* =========================================================================
            SECTION 5: ASHUBHA KALAM (INAUSPICIOUS / VARJYAM)
           ========================================================================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionHeaderTitle, { color: '#991B1B' }]}>
            {SECTION_HEADERS.inauspicious[currentLanguage] || 'Ashubha Kalam (Inauspicious / Varjyam)'}
          </Text>
        </View>

        <LinearGradient
          colors={['#FFFFFF', '#FFF8F6', '#FEF2F2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ashubhaCard}
        >
          {/* Rahu Kalam */}
          <View style={styles.ashubhaRow}>
            <View style={styles.ashubhaTagRow}>
              <View style={[styles.ashubhaDot, { backgroundColor: '#DC2626' }]} />
              <Text style={styles.ashubhaLabel}>
                {ROW_LABELS.rahuKalam[currentLanguage] || 'Rahu Kalam'}
              </Text>
            </View>
            <Text style={[styles.ashubhaTime, { color: '#DC2626' }]}>
              {displayData.rahuKalam || '03:04 PM – 04:27 PM'}
            </Text>
          </View>

          {/* Yamagandam */}
          <View style={styles.ashubhaRow}>
            <View style={styles.ashubhaTagRow}>
              <View style={[styles.ashubhaDot, { backgroundColor: '#D97706' }]} />
              <Text style={styles.ashubhaLabel}>
                {ROW_LABELS.yamagandam[currentLanguage] || 'Yamagandam'}
              </Text>
            </View>
            <Text style={[styles.ashubhaTime, { color: '#B45309' }]}>
              {displayData.yamagandam || '09:12 AM – 10:35 AM'}
            </Text>
          </View>

          {/* Gulika Kalam */}
          <View style={[styles.ashubhaRow, { borderBottomWidth: 0 }]}>
            <View style={styles.ashubhaTagRow}>
              <View style={[styles.ashubhaDot, { backgroundColor: '#7C3AED' }]} />
              <Text style={styles.ashubhaLabel}>
                {ROW_LABELS.gulikaKalam[currentLanguage] || 'Gulika Kalam'}
              </Text>
            </View>
            <Text style={[styles.ashubhaTime, { color: '#6D28D9' }]}>
              {displayData.gulikaKalam || '12:00 PM – 01:23 PM'}
            </Text>
          </View>
        </LinearGradient>

        {/* =========================================================================
            SECTION 6: TODAY'S SPECIAL & VRATHAM CARD (DINA VISESHAM)
           ========================================================================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>
            {SECTION_HEADERS.special[currentLanguage] || "Today's Special & Vratham"}
          </Text>
        </View>

        <LinearGradient
          colors={['#FFFFFF', '#FFFDF9', '#FFF7EA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.specialCard}
        >
          <View style={styles.specialTopRow}>
            <View style={styles.specialIconCircle}>
              <DiyaLampIcon size={24} color="#D97706" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.specialHeading}>
                {isToday
                  ? currentLanguage === 'te'
                    ? 'నేటి శుభ విశేషం'
                    : "Today's Sacred Guidance"
                  : currentLanguage === 'te'
                  ? 'ఈ దిన విశేషం'
                  : 'Sacred Day Guidance'}
              </Text>
              <Text style={styles.specialBody}>
                {displayData.special || 'Auspicious for Deeparadhana, Temple Seva & Chanting'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Loading Indicator for date changes */}
        {loading && (
          <View style={styles.recalcLoader}>
            <ActivityIndicator size="small" color="#0D382B" />
          </View>
        )}
      </ScrollView>

      {/* =========================================================================
          CITY PICKER MODAL (LIVE GPS + SEARCHABLE CATALOG)
         ========================================================================= */}
      <Modal
        visible={showCityModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCityModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCityModal(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {currentLanguage === 'te'
                    ? 'పంచాంగ స్థలాన్ని ఎంచుకోండి'
                    : currentLanguage === 'kn'
                    ? 'ಪಂಚಾಂಗ ಸ್ಥಳವನ್ನು ಆಯ್ಕೆಮಾಡಿ'
                    : currentLanguage === 'ta'
                    ? 'பஞ்சாங்க இடத்தை தேர்ந்தெடுக்கவும்'
                    : currentLanguage === 'hi'
                    ? 'पंचांग स्थान चुनें'
                    : 'Select Location'}
                </Text>
                <Text style={styles.modalSubTitle}>
                  {currentLanguage === 'te'
                    ? 'ఖచ్చితమైన సూర్యోదయ, సూర్యాస్తమయ గణనలు'
                    : 'Accurate local sunrise, sunset & muhurtham'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowCityModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.modalCloseBtn}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* LIVE GPS DETECTION BUTTON */}
            <TouchableOpacity
              style={[styles.liveGpsCard, isLiveActive && styles.liveGpsCardActive]}
              activeOpacity={0.85}
              onPress={handleDetectLiveLocation}
              disabled={detectingLocation}
            >
              <View style={styles.liveGpsIconWrap}>
                {detectingLocation ? (
                  <ActivityIndicator size="small" color="#0D382B" />
                ) : (
                  <Text style={styles.liveGpsEmoji}>🎯</Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.liveGpsTitle}>
                    {currentLanguage === 'te'
                      ? 'నా లైవ్ లొకేషన్ ఉపయోగించండి'
                      : currentLanguage === 'kn'
                      ? 'ನನ್ನ ಲೈವ್ ಸ್ಥಳವನ್ನು ಬಳಸಿ'
                      : currentLanguage === 'ta'
                      ? 'எனது நேரடி இருப்பிடத்தைப் பயன்படுத்து'
                      : currentLanguage === 'hi'
                      ? 'मेरा लाइव स्थान उपयोग करें'
                      : 'Use Current Location'}
                  </Text>
                  {isLiveActive && (
                    <View style={styles.activeLiveBadge}>
                      <Text style={styles.activeLiveBadgeText}>CURRENT</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.liveGpsSubtitle} numberOfLines={1}>
                  {detectingLocation
                    ? 'Detecting current coordinates...'
                    : isLiveActive && liveLocation
                    ? `Active: ${liveLocation.displayName || liveLocation.cityName}`
                    : 'Auto-detect exact coordinates for local timings'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Search Input Bar */}
            <View style={styles.searchBarContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder={
                  currentLanguage === 'te'
                    ? 'నగరం పేరు వెతకండి...'
                    : 'Search city or sacred kshetram...'
                }
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Text style={{ color: '#888', paddingHorizontal: 6, fontWeight: '700' }}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* City List */}
            <ScrollView style={styles.cityList} keyboardShouldPersistTaps="handled">
              {filteredCities.map((city) => {
                const isSelected =
                  !isLiveActive && city.name.toLowerCase() === selectedCity.toLowerCase();
                let cName = city.name;
                if (currentLanguage === 'te') cName = city.nameTe;
                else if (currentLanguage === 'kn') cName = city.nameKn;
                else if (currentLanguage === 'ta') cName = city.nameTa;
                else if (currentLanguage === 'hi') cName = city.nameHi;

                return (
                  <TouchableOpacity
                    key={city.name}
                    style={[styles.cityItem, isSelected && styles.cityItemSelected]}
                    activeOpacity={0.7}
                    onPress={() => handleSelectCity(city.name)}
                  >
                    <Text
                      style={[styles.cityNameText, isSelected && styles.cityNameTextSelected]}
                    >
                      {cName}
                    </Text>
                    {isSelected && <Text style={styles.checkIcon}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5EB',
    position: 'relative',
  },
  watermarkContainer: {
    position: 'absolute',
    top: '25%',
    alignSelf: 'center',
    opacity: 0.07,
    zIndex: 0,
  },
  watermarkImage: {
    width: Math.min(SCREEN_WIDTH * 0.88, 380),
    height: Math.min(SCREEN_WIDTH * 0.88, 380),
  },

  // Header styles with safe area support
  header: {
    paddingTop: Platform.OS === 'ios' ? 44 : ANDROID_STATUS_BAR_HEIGHT + 8,
    paddingBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: '#DFA62E',
    elevation: 6,
    shadowColor: '#071A14',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    zIndex: 10,
  },
  headerSafeArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 44,
  },
  headerBackButton: {
    position: 'absolute',
    left: 14,
    zIndex: 20,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 54,
  },
  headerTitle: {
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
    fontSize: 21,
    fontWeight: '800',
    color: '#FFF8E7',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  headerRightOrnament: {
    position: 'absolute',
    right: 4,
    top: 2,
    zIndex: 5,
  },
  filigreeTopLeft: {
    position: 'absolute',
    left: 4,
    top: 2,
    zIndex: 5,
  },

  // Location Selector Bar
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
    zIndex: 5,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3DC',
    borderWidth: 1.2,
    borderColor: '#E8CD9C',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 5,
    elevation: 1,
  },
  locationPillLive: {
    backgroundColor: '#EAF7EE',
    borderColor: '#81C784',
  },
  locationPin: {
    fontSize: 13,
    marginRight: 4,
  },
  locationText: {
    fontFamily: Platform.select({
      ios: 'Poppins-Bold',
      android: 'Poppins_700Bold',
      default: 'Poppins_700Bold',
    }),
    fontSize: 13,
    fontWeight: '700',
    color: '#0D382B',
    marginRight: 4,
  },
  locationChevron: {
    fontSize: 12,
    color: '#0D382B',
    fontWeight: '700',
  },
  todayPill: {
    backgroundColor: '#0D382B',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 5,
    elevation: 2,
  },
  todayPillText: {
    color: '#FFF8E7',
    fontSize: 12,
    fontWeight: '700',
  },

  // Scroll
  scroll: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Section 1: Date Selector & Vedic Ribbon
  dateSelectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFDF9',
    borderWidth: 1.4,
    borderColor: '#DFB460',
    borderRadius: 24,
    marginHorizontal: 14,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    elevation: 2.5,
    shadowColor: '#B68B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  dateChevronButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF5E0',
    borderWidth: 1,
    borderColor: '#E8CD9C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCenterBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateSelectorText: {
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
    fontSize: 17,
    fontWeight: '800',
    color: '#0A271E',
    letterSpacing: 0.2,
  },

  // Vedic Era Ribbon
  vedicRibbonCard: {
    backgroundColor: '#FFF2DB',
    borderWidth: 1,
    borderColor: '#E8CD9C',
    borderRadius: 14,
    marginHorizontal: 14,
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vedicRibbonText: {
    fontFamily: Platform.select({
      ios: 'Poppins-Bold',
      android: 'Poppins_700Bold',
      default: 'Poppins_700Bold',
    }),
    fontSize: 12,
    fontWeight: '700',
    color: '#7A4D00',
    letterSpacing: 0.2,
  },

  // Section 2: Surya-Chandra Mandalam (Sunrise & Sunset Dual Cards)
  sunDualRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 14,
    marginTop: 10,
  },
  sunBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1.4,
    borderColor: '#F5C249',
    paddingVertical: 12,
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: '#B68B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  sunIconDisc: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF3DC',
    borderWidth: 1.2,
    borderColor: '#F5C249',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sunDataGroup: {
    flex: 1,
    justifyContent: 'center',
  },
  sunLabelText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#854D0E',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  sunTimeText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0A271E',
  },

  // Section Header Titles
  sectionHeaderRow: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionHeaderTitle: {
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
    fontSize: 15,
    fontWeight: '800',
    color: '#0D382B',
    letterSpacing: 0.2,
  },

  // Section 3: Pancha-Anga Card
  panchaAngaContainer: {
    marginHorizontal: 14,
    borderRadius: 18,
    elevation: 2.5,
    shadowColor: '#B68B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  panchaAngaCard: {
    borderRadius: 18,
    borderWidth: 1.4,
    borderColor: '#DFB460',
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  panchaAngaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F2E2C8',
  },
  panchaAngaRowLast: {
    borderBottomWidth: 0,
  },
  angaMedallion: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  angaLabelBlock: {
    width: 95,
    justifyContent: 'center',
  },
  angaLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0D382B',
  },
  angaValueBlock: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  angaValue: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0A271E',
    textAlign: 'right',
  },
  angaSubValue: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#854D0E',
    textAlign: 'right',
    marginTop: 2,
  },

  // Section 4: Shubha Muhurtam (Abhijit)
  shubhaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1.4,
    borderColor: '#86EFAC',
    padding: 14,
    elevation: 2,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  shubhaIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#86EFAC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  shubhaContentBlock: {
    flex: 1,
  },
  shubhaTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  shubhaTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#15803D',
  },
  vijayaBadge: {
    backgroundColor: '#15803D',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
  },
  vijayaBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  shubhaTimeText: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F5132',
    marginBottom: 2,
  },
  shubhaSubText: {
    fontSize: 11.5,
    color: '#166534',
    fontStyle: 'italic',
  },

  // Section 5: Ashubha Kalam
  ashubhaCard: {
    marginHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1.4,
    borderColor: '#FECACA',
    paddingHorizontal: 14,
    paddingVertical: 6,
    elevation: 2,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ashubhaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FEE2E2',
  },
  ashubhaTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ashubhaDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  ashubhaLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#4B5563',
  },
  ashubhaTime: {
    fontSize: 14,
    fontWeight: '800',
  },

  // Section 6: Today's Special Card
  specialCard: {
    marginHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1.4,
    borderColor: '#DFB460',
    padding: 14,
    elevation: 2.5,
    shadowColor: '#B68B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  specialTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specialIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF3DC',
    borderWidth: 1.2,
    borderColor: '#F5C249',
    alignItems: 'center',
    justifyContent: 'center',
  },
  specialHeading: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0D382B',
    marginBottom: 3,
  },
  specialBody: {
    fontSize: 13,
    color: '#345147',
    lineHeight: 18,
    fontWeight: '600',
  },

  recalcLoader: {
    alignItems: 'center',
    marginVertical: 8,
  },

  // City Picker Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '82%',
    backgroundColor: '#FFFDF9',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E8CD9C',
    padding: 18,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E0CB',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0A271E',
  },
  modalSubTitle: {
    fontSize: 11.5,
    color: '#666',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5ECE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 15,
    color: '#0D382B',
    fontWeight: '700',
  },
  liveGpsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F9F5',
    borderWidth: 1.5,
    borderColor: '#A5D6A7',
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    marginBottom: 8,
  },
  liveGpsCardActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2E7D32',
  },
  liveGpsIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  liveGpsEmoji: {
    fontSize: 18,
  },
  liveGpsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0D382B',
    marginRight: 6,
  },
  liveGpsSubtitle: {
    fontSize: 11,
    color: '#555',
    marginTop: 2,
  },
  activeLiveBadge: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  activeLiveBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7EFE3',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2D1BA',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    marginVertical: 6,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0A271E',
    paddingVertical: 2,
  },
  cityList: {
    marginTop: 6,
  },
  cityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginVertical: 2,
  },
  cityItemSelected: {
    backgroundColor: '#FFF2DB',
  },
  cityNameText: {
    fontSize: 15,
    color: '#0A271E',
    fontWeight: '700',
  },
  cityNameTextSelected: {
    fontWeight: '800',
    color: '#0D382B',
  },
  checkIcon: {
    fontSize: 16,
    color: '#0D382B',
    fontWeight: '800',
  },
});
