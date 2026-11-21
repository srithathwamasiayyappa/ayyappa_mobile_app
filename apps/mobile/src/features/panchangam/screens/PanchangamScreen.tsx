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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { ApiService } from '../../../services/api';
import { SupportedLanguage, PanchangamData } from '../../../types';
import { CITIES_LIST, PanchangamLocalEngine } from '../../../utils/panchangam';
import { LocationService, UserLiveLocation, standardizeCityName, createLocationObject } from '../../../services/locationService';

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

// Sunrise Icon: Rising Half Sun with Horizon Bar & Rays
const SunriseIcon = () => (
  <Svg width={34} height={34} viewBox="0 0 36 36" fill="none">
    <Path d="M4 25 H32" stroke="#E67E22" strokeWidth={2.5} strokeLinecap="round" />
    <Path d="M11 25 A7 7 0 0 1 25 25 Z" fill="#F39C12" stroke="#2E7561" strokeWidth={1} />
    <Path d="M18 9 V13" stroke="#F39C12" strokeWidth={2} strokeLinecap="round" />
    <Path d="M9 13 L12 16" stroke="#F39C12" strokeWidth={2} strokeLinecap="round" />
    <Path d="M27 13 L24 16" stroke="#F39C12" strokeWidth={2} strokeLinecap="round" />
    <Path d="M5 20 H9" stroke="#F39C12" strokeWidth={2} strokeLinecap="round" />
    <Path d="M27 20 H31" stroke="#F39C12" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// Sunset Icon: Setting Half Sun with Horizon Bar & Subtle Rays
const SunsetIcon = () => (
  <Svg width={34} height={34} viewBox="0 0 36 36" fill="none">
    <Path d="M4 25 H32" stroke="#2E7561" strokeWidth={2.5} strokeLinecap="round" />
    <Path d="M11 25 A7 7 0 0 1 25 25 Z" fill="#E67E22" stroke="#2E7561" strokeWidth={1} />
    <Path d="M18 10 V14" stroke="#E67E22" strokeWidth={2} strokeLinecap="round" />
    <Path d="M9 14 L12 17" stroke="#E67E22" strokeWidth={2} strokeLinecap="round" />
    <Path d="M27 14 L24 17" stroke="#E67E22" strokeWidth={2} strokeLinecap="round" />
    <Path d="M5 20 H9" stroke="#E67E22" strokeWidth={2} strokeLinecap="round" />
    <Path d="M27 20 H31" stroke="#E67E22" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// Chevron Left
const ChevronLeftIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 19l-7-7 7-7"
      stroke="#345147"
      strokeWidth={2.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Chevron Right
const ChevronRightIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 5l7 7-7 7"
      stroke="#345147"
      strokeWidth={2.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SCREEN_TITLES: Record<SupportedLanguage, string> = {
  en: 'Today Panchangam',
  te: 'నేటి పంచాంగం',
  kn: 'ಇಂದಿನ ಪಂಚಾಂಗ',
  ta: 'இன்றைய பஞ்சாங்கம்',
  hi: 'आज का पंचांग',
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
    kn: 'ಸೂರ್ಯಾಸ್ತಮಯ',
    ta: 'சூரிய அஸ்தமனம்',
    hi: 'सूर्यास्त',
  },
};

const ROW_LABELS: Record<string, Record<SupportedLanguage, string>> = {
  tithi: {
    en: 'Tithi',
    te: 'తిథి',
    kn: 'ತಿಥಿ',
    ta: 'திதி',
    hi: 'तिथि',
  },
  nakshatram: {
    en: 'Nakshatram',
    te: 'నక్షత్రం',
    kn: 'ನಕ್ಷತ್ರ',
    ta: 'நட்சத்திரம்',
    hi: 'नक्षत्र',
  },
  yoga: {
    en: 'Yoga',
    te: 'యోగం',
    kn: 'ಯೋಗ',
    ta: 'யோகம்',
    hi: 'योग',
  },
  karana: {
    en: 'Karana',
    te: 'కరణం',
    kn: 'ಕರಣ',
    ta: 'கரணம்',
    hi: 'करण',
  },
  rahuKalam: {
    en: 'Rahu Kalam',
    te: 'రాహు కాలం',
    kn: 'ರಾಹು ಕಾಲ',
    ta: 'ராகு காலம்',
    hi: 'राहुकाल',
  },
  yamagandam: {
    en: 'Yamagandam',
    te: 'యమగండం',
    kn: 'ಯಮಗಂಡ',
    ta: 'எமகண்டம்',
    hi: 'यमगंड',
  },
  gulikaKalam: {
    en: 'Gulika Kalam',
    te: 'గుళిక కాలం',
    kn: 'ಗುಳಿಕ ಕಾಲ',
    ta: 'குளிகை காலம்',
    hi: 'गुलिक काल',
  },
  abhijitMuhurtam: {
    en: 'Abhijit Muhurtam',
    te: 'అభిజిత్ ముహూర్తం',
    kn: 'ಅಭಿಜಿತ್ ಮುಹೂರ್ತ',
    ta: 'அபிஜித் முகூர்த்தம்',
    hi: 'अभिजित मुहूर्त',
  },
};

const SPECIAL_LABELS: Record<string, Record<SupportedLanguage, string>> = {
  today: {
    en: "Today's Special",
    te: 'నేటి విశేషం',
    kn: 'ಇಂದಿನ ವಿಶೇಷ',
    ta: 'இன்றைய சிறப்பு',
    hi: 'आज का विशेष',
  },
  date: {
    en: 'Special for This Date',
    te: 'ఈ దిన విశేషం',
    kn: 'ಈ ದಿನದ ವಿಶೇಷ',
    ta: 'இந்த நாளின் சிறப்பு',
    hi: 'इस तिथि का विशेष',
  },
};

export const PanchangamScreen: React.FC<Props> = ({
  currentLanguage,
  currentLocation,
  onLocationChange,
  onBack,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCity, setSelectedCity] = useState<string>(currentLocation ? standardizeCityName(currentLocation) : 'Bengaluru');
  const [liveLocation, setLiveLocation] = useState<UserLiveLocation | null>(null);
  const [detectingLocation, setDetectingLocation] = useState<boolean>(false);
  const [isLiveActive, setIsLiveActive] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCityModal, setShowCityModal] = useState<boolean>(false);
  const [data, setData] = useState<PanchangamData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync with prop when currentLocation changes from Home Screen
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
  const handleSelectCity = useCallback(async (cityName: string) => {
    const std = standardizeCityName(cityName);
    setSelectedCity(std);
    setIsLiveActive(false);
    setShowCityModal(false);
    const updatedLoc = createLocationObject(std, false);
    setLiveLocation(updatedLoc);
    await LocationService.saveLocation(updatedLoc);
    if (onLocationChange) onLocationChange(std);
  }, [onLocationChange]);

  // Is today's date selected?
  const isToday = useMemo(() => {
    const today = new Date();
    return (
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    );
  }, [selectedDate]);

  // Format date string as: "Tue, 14 Jan 2025" matching approved screenshot
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

  // Fetch or calculate Panchangam for the selected date & city with live coordinates
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const pad = (n: number) => String(n).padStart(2, '0');
        const dateIso = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`;
        const customCoords = isLiveActive && liveLocation ? { lat: liveLocation.lat, lng: liveLocation.lng } : undefined;

        const targetCity = selectedCity || currentLocation || 'Bengaluru';
        // Attempt server API first; fallback is automatic in ApiService
        const res = await ApiService.getPanchangam(currentLanguage, dateIso, targetCity, customCoords);
        if (isMounted) {
          setData(res);
        }
      } catch (e) {
        console.warn('API error, relying on local calculation engine:', e);
        if (isMounted) {
          const targetCity = selectedCity || currentLocation || 'Bengaluru';
          const customCoords = isLiveActive && liveLocation ? { lat: liveLocation.lat, lng: liveLocation.lng } : undefined;
          const fallback = PanchangamLocalEngine.calculate(selectedDate, targetCity, currentLanguage, customCoords);
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
    const customCoords = isLiveActive && liveLocation ? { lat: liveLocation.lat, lng: liveLocation.lng } : undefined;
    return PanchangamLocalEngine.calculate(selectedDate, targetCity, currentLanguage, customCoords);
  }, [data, selectedDate, selectedCity, currentLocation, currentLanguage, isLiveActive, liveLocation]);

  // Row items matching the approved reference layout in exact order:
  // 1. Tithi
  // 2. Nakshatram
  // 3. Yoga
  // 4. Karana
  // 5. Rahu Kalam
  // 6. Yamagandam
  // 7. Gulika Kalam
  // 8. Abhijit Muhurtam
  const panchangamRows = useMemo(() => {
    const l = currentLanguage;
    return [
      {
        key: 'tithi',
        label: ROW_LABELS.tithi[l] || 'Tithi',
        value: displayData.tithi || 'Shukla Navami',
      },
      {
        key: 'nakshatram',
        label: ROW_LABELS.nakshatram[l] || 'Nakshatram',
        value: displayData.nakshatram || 'Pushya',
      },
      {
        key: 'yoga',
        label: ROW_LABELS.yoga[l] || 'Yoga',
        value: displayData.yoga || 'Siddha',
      },
      {
        key: 'karana',
        label: ROW_LABELS.karana[l] || 'Karana',
        value: displayData.karana || 'Taitila',
      },
      {
        key: 'rahuKalam',
        label: ROW_LABELS.rahuKalam[l] || 'Rahu Kalam',
        value: displayData.rahuKalam || '03:04 PM – 04:27 PM',
      },
      {
        key: 'yamagandam',
        label: ROW_LABELS.yamagandam[l] || 'Yamagandam',
        value: displayData.yamagandam || '09:12 AM – 10:35 AM',
      },
      {
        key: 'gulikaKalam',
        label: ROW_LABELS.gulikaKalam[l] || 'Gulika Kalam',
        value: displayData.gulikaKalam || '12:00 PM – 01:23 PM',
      },
      {
        key: 'abhijitMuhurtam',
        label: ROW_LABELS.abhijitMuhurtam[l] || 'Abhijit Muhurtam',
        value: displayData.abhijitMuhurtam || '11:59 AM – 12:45 PM',
      },
    ];
  }, [displayData, currentLanguage]);

  // Localized city name strictly synchronized with active city
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

  // Filter cities for selection modal
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0C251E" />

      {/* =========================================================================
          HEADER: Deep Maroon Gradient + Corner Filigree + Back Chevron + Title
         ========================================================================= */}
      <LinearGradient
        colors={['#0C251E', '#173D32', '#173D32']}
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
          >
            <BackArrowIcon />
          </TouchableOpacity>

          {/* Centered Title */}
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              {SCREEN_TITLES[currentLanguage] || 'Today Panchangam'}
            </Text>
          </View>

          {/* Top-Right Filigree Ornament */}
          <View style={styles.headerRightOrnament}>
            <HeaderCornerFiligree flipped />
          </View>

          {/* Top-Left Filigree Ornament */}
          <View style={styles.filigreeTopLeft}>
            <HeaderCornerFiligree />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Location / City Selector Bar */}
      <View style={styles.locationBar}>
        <TouchableOpacity
          style={styles.locationPill}
          activeOpacity={0.75}
          onPress={() => setShowCityModal(true)}
        >
          <Text style={styles.locationPin}>📍</Text>
          <Text style={styles.locationText}>
            {localizedCityName}
          </Text>
          {detectingLocation ? (
            <ActivityIndicator size="small" color="#173D32" style={{ marginLeft: 6 }} />
          ) : (
            <Text style={styles.locationChevron}>▾</Text>
          )}
        </TouchableOpacity>

        {!isToday && (
          <TouchableOpacity
            style={styles.todayPill}
            activeOpacity={0.75}
            onPress={handleResetToToday}
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
            DATE SELECTOR: ‹  Tue, 14 Jan 2025  ›
           ========================================================================= */}
        <View style={styles.dateSelectorCard}>
          <TouchableOpacity
            style={styles.dateChevronButton}
            onPress={handlePrevDay}
            activeOpacity={0.65}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ChevronLeftIcon />
          </TouchableOpacity>

          <Text style={styles.dateSelectorText}>{formattedDateString}</Text>

          <TouchableOpacity
            style={styles.dateChevronButton}
            onPress={handleNextDay}
            activeOpacity={0.65}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ChevronRightIcon />
          </TouchableOpacity>
        </View>

        {/* =========================================================================
            SUNRISE / SUNSET CARD
           ========================================================================= */}
        <View style={styles.sunTimesCard}>
          {/* Left Column: Sunrise */}
          <View style={styles.sunColLeft}>
            <SunriseIcon />
            <View style={styles.sunTextGroupLeft}>
              <Text style={styles.sunLabel}>
                {SUN_LABELS.sunrise[currentLanguage] || 'Sunrise'}
              </Text>
              <Text style={styles.sunTime}>
                {displayData.sunrise || '06:43 AM'}
              </Text>
            </View>
          </View>

          {/* Vertical Divider */}
          <View style={styles.sunVerticalDivider} />

          {/* Right Column: Sunset */}
          <View style={styles.sunColRight}>
            <View style={styles.sunTextGroupRight}>
              <Text style={styles.sunLabel}>
                {SUN_LABELS.sunset[currentLanguage] || 'Sunset'}
              </Text>
              <Text style={styles.sunTime}>
                {displayData.sunset || '05:58 PM'}
              </Text>
            </View>
            <SunsetIcon />
          </View>
        </View>

        {/* =========================================================================
            PANCHANGAM DETAILS TABLE (8 Ordered Rows)
           ========================================================================= */}
        <View style={styles.tableCard}>
          {panchangamRows.map((row, index) => {
            const isLast = index === panchangamRows.length - 1;
            return (
              <View
                key={row.key}
                style={[styles.tableRow, isLast && styles.tableRowLast]}
              >
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={styles.rowValue} numberOfLines={2}>
                  {row.value}
                </Text>
              </View>
            );
          })}
        </View>

        {/* =========================================================================
            TODAY'S SPECIAL CARD
           ========================================================================= */}
        <View style={styles.specialCard}>
          <Text style={styles.specialHeading}>
            {isToday
              ? SPECIAL_LABELS.today[currentLanguage] || "Today's Special"
              : SPECIAL_LABELS.date[currentLanguage] || 'Special for This Date'}
          </Text>
          <Text style={styles.specialBody}>
            {displayData.special || 'Auspicious for Pooja, Donations & New Beginnings'}
          </Text>
        </View>

        {/* Subtle Loading Indicator if background recalculation in progress */}
        {loading && (
          <View style={styles.recalcLoader}>
            <ActivityIndicator size="small" color="#173D32" />
          </View>
        )}
      </ScrollView>

      {/* =========================================================================
          LIVE GPS & CITY SELECTION MODAL
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
                    : 'Accurate sunrise & sunset timings for your spot'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowCityModal(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.modalCloseBtn}
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
                  <ActivityIndicator size="small" color="#173D32" />
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
                    ? `Current: ${liveLocation.displayName || liveLocation.cityName}`
                    : 'Auto-detect coordinates for exact local timings'}
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
                    : 'Search city or town...'
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
                const isSelected = !isLiveActive && city.name.toLowerCase() === selectedCity.toLowerCase();
                let cName = city.name;
                if (currentLanguage === 'te') cName = city.nameTe;
                else if (currentLanguage === 'kn') cName = city.nameKn;
                else if (currentLanguage === 'ta') cName = city.nameTa;
                else if (currentLanguage === 'hi') cName = city.nameHi;

                return (
                  <TouchableOpacity
                    key={city.name}
                    style={[
                      styles.cityItem,
                      isSelected && styles.cityItemSelected,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => handleSelectCity(city.name)}
                  >
                    <Text
                      style={[
                        styles.cityNameText,
                        isSelected && styles.cityNameTextSelected,
                      ]}
                    >
                      {cName}
                    </Text>
                    {isSelected && (
                      <Text style={styles.checkIcon}>✓</Text>
                    )}
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
  },

  // Header styles matching Bhajans & approved screens
  header: {
    height: Platform.OS === 'ios' ? 96 : (StatusBar.currentHeight || 20) + 64,
    paddingTop: Platform.OS === 'ios' ? 38 : StatusBar.currentHeight || 18,
    borderBottomWidth: 1.5,
    borderBottomColor: '#D4AF37',
    elevation: 6,
    shadowColor: '#0C251E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
  },
  headerSafeArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerBackButton: {
    position: 'absolute',
    left: 14,
    zIndex: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 54,
  },
  headerTitle: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 21,
    fontWeight: '700',
    color: '#FFF8E7',
    textAlign: 'center',
    letterSpacing: 0.5,
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
    paddingBottom: 2,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF2DB',
    borderWidth: 1,
    borderColor: '#E8CD9C',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4.5,
  },
  locationPillLive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#81C784',
  },
  locationPin: {
    fontSize: 12,
    marginRight: 4,
  },
  locationText: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 13,
    fontWeight: '700',
    color: '#345147',
    marginRight: 4,
  },
  locationChevron: {
    fontSize: 12,
    color: '#173D32',
    fontWeight: '700',
  },
  todayPill: {
    backgroundColor: '#173D32',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  todayPillText: {
    color: '#FFF9EF',
    fontSize: 12,
    fontWeight: '700',
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // Date Selector Capsule: ‹ Tue, 14 Jan 2025 ›
  dateSelectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF8ED',
    borderWidth: 1.2,
    borderColor: '#E8CD9C',
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    paddingVertical: 7,
    paddingHorizontal: 8,
    elevation: 1.5,
    shadowColor: '#345147',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  dateChevronButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateSelectorText: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 16.5,
    fontWeight: '700',
    color: '#0C251E',
    letterSpacing: 0.3,
  },

  // Sunrise / Sunset Card
  sunTimesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF9F0',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#E8CD9C',
    marginHorizontal: 16,
    marginVertical: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 1.5,
    shadowColor: '#345147',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  sunColLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  sunTextGroupLeft: {
    marginLeft: 10,
  },
  sunColRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  sunTextGroupRight: {
    marginRight: 10,
    alignItems: 'flex-end',
  },
  sunLabel: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 12.5,
    fontWeight: '700',
    color: '#345147',
    marginBottom: 2,
  },
  sunTime: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0C251E',
  },
  sunVerticalDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E8CD9C',
    marginHorizontal: 8,
  },

  // Panchangam Details Table (8 Ordered Rows)
  tableCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#E8CD9C',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 18,
    paddingVertical: 4,
    elevation: 2,
    shadowColor: '#345147',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11.5,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E0CB',
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0C251E',
    flex: 1,
  },
  rowValue: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0C251E',
    textAlign: 'right',
    flex: 1.3,
  },

  // Today's Special Card
  specialCard: {
    backgroundColor: '#FFF8ED',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#E8CD9C',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    padding: 16,
    elevation: 1.5,
    shadowColor: '#345147',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  specialHeading: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 16,
    fontWeight: '700',
    color: '#173D32',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  specialBody: {
    fontFamily: Platform.select({ ios: 'Poppins-Regular', android: 'Poppins_400Regular', web: 'Poppins, sans-serif', default: 'Poppins_400Regular' }),
    fontSize: 13.5,
    fontStyle: 'italic',
    color: '#345147',
    lineHeight: 20,
  },

  recalcLoader: {
    alignItems: 'center',
    marginVertical: 4,
  },

  // City Picker Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    width: '100%',
    maxHeight: '82%',
    backgroundColor: '#FFFDF9',
    borderRadius: 20,
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
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 16.5,
    fontWeight: '700',
    color: '#0C251E',
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
    color: '#173D32',
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
    color: '#173D32',
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2D1BA',
    paddingHorizontal: 10,
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
    color: '#0C251E',
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
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 15,
    color: '#0C251E',
    fontWeight: '700',
  },
  cityNameTextSelected: {
    fontWeight: '700',
    color: '#173D32',
  },
  checkIcon: {
    fontSize: 16,
    color: '#173D32',
    fontWeight: '800',
  },
});
