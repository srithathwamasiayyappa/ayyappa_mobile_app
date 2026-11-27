import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  RefreshControl,
  Modal,
  Switch,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { SupportedLanguage, DevotionalNotification, NotificationPreferences } from '../../../types';
import { DEFAULT_NOTIFICATION_PREFERENCES } from '../../../data/notificationsData';
import { StorageService } from '../../../services/storageService';
import { ApiService } from '../../../services/api';

interface Props {
  currentLanguage: SupportedLanguage;
  currentUser?: any;
  userRole?: 'CUSTOMER' | 'DHARMA_KARTHA';
  onBack: () => void;
  onNavigateDestination?: (screen: string, detail?: { id: string; title: string }) => void;
}

// Corner Filigree Ornaments for Header
const HeaderCornerFiligree = ({ flipped = false }: { flipped?: boolean }) => (
  <View style={flipped ? { transform: [{ scaleX: -1 }] } : undefined}>
    <Svg width={36} height={36} viewBox="0 0 36 36" fill="none">
      <Path
        d="M2 2 C12 2 22 8 28 16 C24 18 18 16 12 22 C8 16 6 8 2 2 Z"
        fill="#DFA62E"
        fillOpacity={0.8}
      />
      <Circle cx="8" cy="8" r="2" fill="#FFD700" />
      <Circle cx="16" cy="5" r="1.5" fill="#FFD700" />
      <Circle cx="5" cy="16" r="1.5" fill="#FFD700" />
    </Svg>
  </View>
);

// Back Arrow Icon
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

// Gear Settings Icon in Top Right of Header
const GearSettingsIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3.2" stroke="#FFFDF8" strokeWidth={2} />
    <Path
      d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
      stroke="#FFFDF8"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Close (X) Icon
const CloseIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6l12 12"
      stroke="#0C251E"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 1. Live Pooja / Temple Icon Badge
const LivePoojaBadge = () => (
  <Svg width={48} height={48} viewBox="0 0 48 48" fill="none">
    <Circle cx="24" cy="24" r="23" fill="#FCE8B2" />
    <Circle cx="24" cy="24" r="20" stroke="#F3D38E" strokeWidth={1.5} />
    {/* Temple Gopuram Silhouette */}
    <Path d="M24 10 L25.5 13 L22.5 13 Z" fill="#D96B1E" />
    <Circle cx="24" cy="9.5" r="1.2" fill="#D96B1E" />
    <Path d="M20 14 L28 14 L29.5 18 L18.5 18 Z" fill="#D96B1E" />
    <Path d="M17 19 L31 19 L33 24 L15 24 Z" fill="#D96B1E" />
    <Path d="M13 25 L35 25 L35 34 L13 34 Z" fill="#D96B1E" />
    <Path d="M20 34 L20 28 C20 26.5 28 26.5 28 28 L28 34 Z" fill="#FFF3DB" />
    <Circle cx="24" cy="22" r="1.5" fill="#FFF3DB" />
  </Svg>
);

// 2. Festival Update: Temple Kalasam Badge
const FestivalUpdateBadge = () => (
  <Svg width={48} height={48} viewBox="0 0 48 48" fill="none">
    <Circle cx="24" cy="24" r="23" fill="#FCE8B2" />
    <Circle cx="24" cy="24" r="20" stroke="#F3D38E" strokeWidth={1.5} />
    {/* Temple with Festive Arch */}
    <Path d="M24 10 L25.5 13 L22.5 13 Z" fill="#D96B1E" />
    <Circle cx="24" cy="9.5" r="1.2" fill="#D96B1E" />
    <Path d="M19 14 L29 14 L30.5 18 L17.5 18 Z" fill="#D96B1E" />
    <Path d="M16 19 L32 19 L34 24 L14 24 Z" fill="#D96B1E" />
    <Path d="M12 25 L36 25 L36 34 L12 34 Z" fill="#D96B1E" />
    <Path d="M19 34 L19 28 C19 26 29 26 29 28 L29 34 Z" fill="#FFF3DB" />
  </Svg>
);

// 3. Annadanam Today: Prasadam Food Bowl Badge
const AnnadanamTodayBadge = () => (
  <Svg width={48} height={48} viewBox="0 0 48 48" fill="none">
    <Circle cx="24" cy="24" r="23" fill="#FCE8B2" />
    <Circle cx="24" cy="24" r="20" stroke="#F3D38E" strokeWidth={1.5} />
    {/* Uruli / Prasadam Bowl */}
    <Path d="M13 24 C13 32 35 32 35 24 L34 22 L14 22 Z" fill="#D96B1E" />
    <Path d="M19 32 L29 32 L31 35 L17 35 Z" fill="#D96B1E" />
    <Circle cx="19" cy="19" r="2.8" fill="#FFFDF8" />
    <Circle cx="24" cy="16.5" r="3.6" fill="#FFFDF8" />
    <Circle cx="29" cy="19" r="2.8" fill="#FFFDF8" />
    <Path d="M24 12 C22 15 24 16.5 24 16.5 C24 16.5 26 15 24 12 Z" fill="#2E7D32" />
  </Svg>
);

// 4. Temple Seva Reminder: Calendar with Bell Badge
const TempleSevaReminderBadge = () => (
  <Svg width={48} height={48} viewBox="0 0 48 48" fill="none">
    <Circle cx="24" cy="24" r="23" fill="#FCE8B2" />
    <Circle cx="24" cy="24" r="20" stroke="#F3D38E" strokeWidth={1.5} />
    {/* Calendar Sheet */}
    <Rect x="14" y="16" width="20" height="20" rx="3.5" fill="#FFF3DB" stroke="#D96B1E" strokeWidth={1.5} />
    {/* Calendar Ring Bars */}
    <Rect x="18" y="13" width="2.5" height="5" rx="1" fill="#D96B1E" />
    <Rect x="27.5" y="13" width="2.5" height="5" rx="1" fill="#D96B1E" />
    {/* Pooja Bell inside Calendar */}
    <Path d="M24 20 C21.5 20 20.5 23 20 26 L28 26 C27.5 23 26.5 20 24 20 Z" fill="#D96B1E" />
    <Path d="M19 26 L29 26 L29 28 L19 28 Z" fill="#D96B1E" />
    <Circle cx="24" cy="29.5" r="1.3" fill="#D96B1E" />
  </Svg>
);

// 5. Panchangam Alert: Diya / Sacred Homa Flame Badge
const PanchangamAlertBadge = () => (
  <Svg width={48} height={48} viewBox="0 0 48 48" fill="none">
    <Circle cx="24" cy="24" r="23" fill="#FCE8B2" />
    <Circle cx="24" cy="24" r="20" stroke="#F3D38E" strokeWidth={1.5} />
    {/* Diya Base */}
    <Path d="M14 28 C14 34 34 34 34 28 C34 25 31 24 24 24 C17 24 14 25 14 28 Z" fill="#D96B1E" />
    {/* Triple Agni Sacred Flame */}
    <Path d="M24 12 C24 12 28 17 28 21 C28 23.5 26.2 25.5 24 25.5 C21.8 25.5 20 23.5 20 21 C20 17 24 12 24 12 Z" fill="#FFFDF8" />
    <Path d="M24 16 C24 16 26 19 26 21 C26 22 25 23 24 23 C23 23 22 22 22 21 C22 19 24 16 24 16 Z" fill="#FFA000" />
    <Path d="M19 18 C19 18 21 21 21 23 C21 24.2 20 25 19 25 C18 25 17 24.2 17 23 C17 21 19 18 19 18 Z" fill="#FFFDF8" />
    <Path d="M29 18 C29 18 31 21 31 23 C31 24.2 30 25 29 25 C28 25 27 24.2 27 23 C27 21 29 18 29 18 Z" fill="#FFFDF8" />
  </Svg>
);

// Multilingual Dictionary
const NOTIF_I18N: Record<string, Record<string, string>> = {
  screenTitle: {
    en: 'Notifications',
    te: 'నోటిఫికేషన్లు',
    kn: 'ಅಧಿಸೂಚನೆಗಳು',
    ta: 'அறிவிப்புகள்',
    hi: 'सूचनाएं',
    ml: 'അറിയിപ്പുകൾ',
  },
  settingsTitle: {
    en: 'Notification Preferences',
    te: 'నోటిఫికేషన్ ప్రాధాన్యతలు',
    kn: 'ಅಧಿಸೂಚನೆ ಆದ್ಯತೆಗಳು',
    ta: 'அறிவிப்பு விருப்பங்கள்',
    hi: 'सूचना प्राथमिकताएं',
    ml: 'അറിയിപ്പ് മുൻഗണനകൾ',
  },
  settingsDesc: {
    en: 'Customize devotional alerts and spiritual reminders for your practice.',
    te: 'మీ పూజా నియమాల కోసం దైవిక సమాచారాలు మరియు రిమైండర్లను సెట్ చేసుకోండి.',
    kn: 'ನಿಮ್ಮ ಪೂಜಾ ಆಚರಣೆಗೆ ಆಧ್ಯಾತ್ಮಿಕ ಎಚ್ಚರಿಕೆಗಳನ್ನು ಸರಿಹೊಂದಿಸಿ.',
    ta: 'ஆன்மீக விழிப்பூட்டல்களையும் நினைவூட்டல்களையும் தேர்வு செய்யவும்.',
    hi: 'अपनी आध्यात्मिक साधना के लिए पूजा एवं सेवा अनुस्मारक निर्धारित करें।',
    ml: 'ആത്മീയ വിവരങ്ങളും പൂജാ ഓർമ്മപ്പെടുത്തലുകളും ക്രമീകരിക്കുക.',
  },
  liveStreamAlerts: {
    en: 'Live Darshan & Pooja Alerts',
    te: 'ప్రత్యక్ష దర్శనం & పూజా అలెర్ట్స్',
    kn: 'ನೇರ ದರ್ಶನ ಮತ್ತು ಪೂಜಾ ಎಚ್ಚರಿಕೆಗಳು',
    ta: 'நேரலை தரிசனம் & பூஜை எச்சரிக்கைகள்',
    hi: 'लाइव दर्शन एवं पूजा सूचनाएं',
    ml: 'തത്സമയ ദർശന അറിയിപ്പുകൾ',
  },
  festivalAlerts: {
    en: 'Temple Festival Updates',
    te: 'ఆలయ ఉత్సవాలు & పర్వదినాలు',
    kn: 'ದೇವಾಲಯದ ಉತ್ಸವಗಳು ಮತ್ತು ಹಬ್ಬಗಳು',
    ta: 'கோயில் திருவிழா புதுப்பிப்புகள்',
    hi: 'मंदिर उत्सव एवं पर्व सूचनाएं',
    ml: 'ക്ഷേത്ര ഉത്സവ വിശേഷങ്ങൾ',
  },
  annadanamAlerts: {
    en: 'Annadanam (Food Donation) Alerts',
    te: 'నేటి అన్నదాన కేంద్రాల వివరాలు',
    kn: 'ಅನ್ನದಾನ ಕೇಂದ್ರದ ಎಚ್ಚರಿಕೆಗಳು',
    ta: 'அன்னதான அறிவிப்புகள்',
    hi: 'अन्नदान केंद्र सूचनाएं',
    ml: 'അന്നദാന അറിയിപ്പുകൾ',
  },
  panchangamAlerts: {
    en: 'Daily Panchangam & Muhurtams',
    te: 'నిత్య పంచాంగం & శుభ ముహూర్తాలు',
    kn: 'ದೈನಂದಿನ ಪಂಚಾಂಗ ಮತ್ತು ಮುಹೂರ್ತಗಳು',
    ta: 'தினசரி பஞ்சாங்கம் & சுப முகூர்த்தம்',
    hi: 'दैनिक पंचांग एवं शुभ मुहूर्त',
    ml: 'നിത്യ പഞ്ചാംഗവും ശുഭമുഹൂർത്തങ്ങളും',
  },
  sevaAlerts: {
    en: 'Seva & Archana Reminders',
    te: 'సేవా & అర్చన రిమైండర్లు',
    kn: 'ಸೇವಾ ಮತ್ತು ಅರ್ಚನೆ ಜ್ಞಾಪನೆಗಳು',
    ta: 'சேவை & அர்ச்சனை நினைவூட்டல்கள்',
    hi: 'सेवा एवं अर्चना अनुस्मारक',
    ml: 'സേവാ ഓർമ്മപ്പെടുത്തലുകൾ',
  },
  noNotifications: {
    en: 'No notifications at this moment.',
    te: 'ప్రస్తుతం ఎలాంటి నోటిఫికేషన్లు లేవు.',
    kn: 'ಸದ್ಯಕ್ಕೆ ಯಾವುದೇ ಅಧಿಸೂಚನೆಗಳಿಲ್ಲ.',
    ta: 'தற்போது புதிய அறிவிப்புகள் இல்லை.',
    hi: 'इस समय कोई सूचना नहीं है।',
    ml: 'ഇപ്പോൾ പുതിയ അറിയിപ്പുകൾ ഒന്നുമില്ല.',
  },
  blessingSub: {
    en: 'May Lord Ayyappa bless you with auspicious peace and joy.',
    te: 'శ్రీ అయ్యప్ప స్వామి వారి కటాక్షం మీపై ఉండుగాక.',
    kn: 'ಶ್ರೀ ಅಯ್ಯಪ್ಪ ಸ್ವಾಮಿ ನಿಮ್ಮನ್ನು ಹರಸಲಿ.',
    ta: 'ஸ்ரீ ஐயப்ப சுவாமியின் அருள் உங்களுக்கு உண்டாகட்டும்.',
    hi: 'भगवान अय्यप्पा की कृपा आप पर सदैव बनी रहे।',
    ml: 'സ്വാമി അയ്യപ്പന്റെ അനുഗ്രഹം എന്നും ഉണ്ടാകട്ടെ.',
  },
  markAllRead: {
    en: 'Mark all read',
    te: 'అన్నీ చదివినట్లుగా మార్చు',
    kn: 'ಎಲ್ಲವನ್ನೂ ಓದಿದಂತೆ ಗುರುತಿಸಿ',
    ta: 'அனைத்தும் படித்ததாகக் குறி',
    hi: 'सभी पढ़ा हुआ चिह्नित करें',
    ml: 'എല്ലാം വായിച്ചതായി അടയാളപ്പെടുത്തുക',
  },
  loading: {
    en: 'Loading notifications...',
    te: 'నోటిఫికేషన్లు లోడ్ అవుతున్నాయి...',
    kn: 'ಅಧಿಸೂಚನೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...',
    ta: 'அறிவிப்புகள் ஏற்றப்படுகின்றன...',
    hi: 'सूचनाएं लोड हो रही हैं...',
    ml: 'അറിയിപ്പുകൾ ലോഡ് ചെയ്യുന്നു...',
  },
};

// Map backend API notification object to frontend DevotionalNotification model
const mapApiNotification = (item: any): DevotionalNotification => {
  const typeMap: Record<string, any> = {
    panchangam: 'panchangam',
    live: 'live',
    festival: 'festival',
    annadanam: 'annadanam',
    seva: 'seva',
    general: 'general',
  };
  const notifType = typeMap[item.category || item.type] || 'general';

  let relativeTime = item.relativeTime;
  if (!relativeTime && item.createdAt) {
    try {
      const diffMs = Math.max(0, Date.now() - new Date(item.createdAt).getTime());
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 60) {
        relativeTime = `${diffMins <= 1 ? 1 : diffMins}m ago`;
      } else {
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) {
          relativeTime = `${diffHours}h ago`;
        } else {
          const diffDays = Math.floor(diffHours / 24);
          relativeTime = `${diffDays}d ago`;
        }
      }
    } catch {
      relativeTime = 'Just now';
    }
  }

  return {
    id: String(item.id),
    type: notifType,
    title: item.title || '',
    message: item.message || item.body || item.content || '',
    createdAt: item.createdAt || new Date().toISOString(),
    relativeTime: relativeTime || 'Just now',
    isRead: Boolean(item.isRead),
    destinationType: item.destinationType || 'panchangam',
    destinationId: item.destinationId ? String(item.destinationId) : undefined,
    destinationTitle: item.destinationTitle,
  };
};

export const NotificationsScreen: React.FC<Props> = ({
  currentLanguage,
  currentUser,
  userRole = 'CUSTOMER',
  onBack,
  onNavigateDestination,
}) => {
  // STRICTLY DYNAMIC STATE - ZERO STATIC / FALLBACK MOCK DATA
  const [notifications, setNotifications] = useState<DevotionalNotification[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [markingAllRead, setMarkingAllRead] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);

  const t = (key: string): string => {
    const dict = NOTIF_I18N[key];
    if (dict && dict[currentLanguage]) return dict[currentLanguage];
    if (dict && dict['en']) return dict['en'];
    return key;
  };

  // Load read status and preferences from local storage
  const loadStoredData = useCallback(async () => {
    const storedRead = await StorageService.getReadNotificationIds();
    setReadIds(storedRead);
    const storedPrefs = await StorageService.getNotificationPreferences();
    setPreferences(storedPrefs);
  }, []);

  // Fetch dynamic notifications strictly from DB via API (Devotee or Dharma Kartha)
  const fetchNotifications = useCallback(async () => {
    try {
      const activeUserId = currentUser?.id ? Number(currentUser.id) : undefined;
      const res = await ApiService.getNotifications({
        role: userRole,
        userId: activeUserId,
        limit: 50,
      });

      if (res && Array.isArray(res.data)) {
        setNotifications(res.data.map(mapApiNotification));
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.warn('[Notifications] Error fetching notifications from API:', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, userRole]);

  useEffect(() => {
    loadStoredData();
    fetchNotifications();
  }, [loadStoredData, fetchNotifications]);

  // Hardware back press handler
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (settingsOpen) {
        setSettingsOpen(false);
        return true;
      }
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [settingsOpen, onBack]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadStoredData(), fetchNotifications()]);
    setRefreshing(false);
  };

  const handleNotificationPress = async (item: DevotionalNotification) => {
    const activeUserId = currentUser?.id ? Number(currentUser.id) : undefined;

    // 1. Mark as read on backend via API
    try {
      await ApiService.markNotificationAsRead(item.id, {
        role: userRole,
        userId: activeUserId,
      });
    } catch (e) {
      console.warn('[Notifications] Mark as read error:', e);
    }

    // 2. Mark as read in local storage & UI state
    if (!readIds.includes(item.id)) {
      await StorageService.markNotificationRead(item.id);
      setReadIds((prev) => [...prev, item.id]);
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );

    // 3. Navigate to destination
    if (onNavigateDestination) {
      if (item.destinationType === 'live_streams') {
        onNavigateDestination('live_streams', { id: item.destinationId || 'sabarimala', title: 'Live Streams' });
      } else if (item.destinationType === 'temple_detail') {
        onNavigateDestination('temple_detail', { id: item.destinationId || 'srisailam-temple', title: item.destinationTitle || 'Temple' });
      } else if (item.destinationType === 'food_donation') {
        onNavigateDestination('food_donation', { id: item.destinationId || 'annadanam', title: 'Food Donation (Annadanam)' });
      } else if (item.destinationType === 'donations') {
        onNavigateDestination('donations', { id: item.destinationId || 'seva', title: 'Donations' });
      } else if (item.destinationType === 'panchangam') {
        onNavigateDestination('panchangam', { id: 'today', title: 'Daily Panchangam' });
      }
    }
  };

  const handleMarkAllRead = async () => {
    const activeUserId = currentUser?.id ? Number(currentUser.id) : undefined;
    try {
      setMarkingAllRead(true);
      await ApiService.markAllNotificationsAsRead({
        role: userRole,
        userId: activeUserId,
      });

      const allIds = notifications.map((n) => n.id);
      for (const id of allIds) {
        await StorageService.markNotificationRead(id);
      }
      setReadIds((prev) => Array.from(new Set([...prev, ...allIds])));
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.warn('[Notifications] Mark all read error:', e);
    } finally {
      setMarkingAllRead(false);
    }
  };

  const togglePreference = async (key: keyof NotificationPreferences) => {
    const updated = {
      ...preferences,
      [key]: !preferences[key],
    };
    setPreferences(updated);
    await StorageService.saveNotificationPreferences(updated);
  };

  const renderBadge = (type: string) => {
    switch (type) {
      case 'live':
        return <LivePoojaBadge />;
      case 'festival':
        return <FestivalUpdateBadge />;
      case 'annadanam':
        return <AnnadanamTodayBadge />;
      case 'seva':
        return <TempleSevaReminderBadge />;
      case 'panchangam':
        return <PanchangamAlertBadge />;
      default:
        return <LivePoojaBadge />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0C251E" translucent={false} />

      {/* Devotional Header */}
      <LinearGradient
        colors={['#0C251E', '#173D32', '#215344']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerContainer}
      >
        <View style={styles.headerOrnamentLeft}>
          <HeaderCornerFiligree />
        </View>
        <View style={styles.headerOrnamentRight}>
          <HeaderCornerFiligree flipped />
        </View>

        <View style={styles.headerContentRow}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={onBack}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <BackArrowIcon />
          </TouchableOpacity>

          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>{t('screenTitle')}</Text>
          </View>

          {/* Right Header Actions: Mark All Read & Settings */}
          <View style={styles.headerRightBox}>
            {notifications.length > 0 && notifications.some((n) => !n.isRead && !readIds.includes(n.id)) && (
              <TouchableOpacity
                style={styles.markAllHeaderBtn}
                onPress={handleMarkAllRead}
                disabled={markingAllRead}
                activeOpacity={0.75}
              >
                <Text style={styles.markAllHeaderText}>
                  {markingAllRead ? '...' : t('markAllRead')}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => setSettingsOpen(true)}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <GearSettingsIcon />
            </TouchableOpacity>
          </View>
        </View>

        {/* Golden Bottom Separator Line */}
        <LinearGradient
          colors={['transparent', '#F5CF78', '#DFA62E', '#F5CF78', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.goldSeparator}
        />
      </LinearGradient>

      {/* Notification Cards List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#173D32']}
            tintColor="#173D32"
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#DFA62E" />
            <Text style={styles.loadingText}>{t('loading')}</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <PanchangamAlertBadge />
            <Text style={styles.emptyTitle}>{t('noNotifications')}</Text>
            <Text style={styles.emptyDesc}>{t('blessingSub')}</Text>
          </View>
        ) : (
          notifications.map((item) => {
            const isRead = readIds.includes(item.id) || item.isRead;

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.notificationCard,
                  !isRead && styles.notificationCardUnread,
                ]}
                activeOpacity={0.82}
                onPress={() => handleNotificationPress(item)}
              >
                {/* Left: Devotional Icon Badge */}
                <View style={styles.badgeContainer}>
                  {renderBadge(item.type)}
                </View>

                {/* Center: Title & Description */}
                <View style={styles.textContainer}>
                  <View style={styles.titleRow}>
                    <Text
                      style={[
                        styles.itemTitle,
                        !isRead && styles.itemTitleUnread,
                      ]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>

                    {/* Small Unread Dot Indicator */}
                    {!isRead && <View style={styles.unreadDot} />}
                  </View>

                  <Text style={styles.itemMessage} numberOfLines={2}>
                    {item.message}
                  </Text>
                </View>

                {/* Right: Relative Timestamp */}
                <View style={styles.timeContainer}>
                  <Text style={styles.timeText}>{item.relativeTime}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* NOTIFICATION PREFERENCES MODAL */}
      <Modal
        visible={settingsOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setSettingsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeaderTitle}>{t('settingsTitle')}</Text>
              <TouchableOpacity
                onPress={() => setSettingsOpen(false)}
                style={styles.modalCloseBtn}
              >
                <CloseIcon />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
              <Text style={styles.modalDescription}>{t('settingsDesc')}</Text>

              {/* Toggle 1: Live Darshan */}
              <View style={styles.preferenceRow}>
                <View style={styles.preferenceTextCol}>
                  <Text style={styles.preferenceTitle}>{t('liveStreamAlerts')}</Text>
                  <Text style={styles.preferenceSubtitle}>
                    Daily Sabarimala & partner shrine streams
                  </Text>
                </View>
                <Switch
                  value={preferences.liveStreams}
                  onValueChange={() => togglePreference('liveStreams')}
                  trackColor={{ false: '#D9C8B4', true: '#173D32' }}
                  thumbColor={preferences.liveStreams ? '#DFA62E' : '#FAF5EB'}
                />
              </View>

              {/* Toggle 2: Festivals */}
              <View style={styles.preferenceRow}>
                <View style={styles.preferenceTextCol}>
                  <Text style={styles.preferenceTitle}>{t('festivalAlerts')}</Text>
                  <Text style={styles.preferenceSubtitle}>
                    Makaravilakku, Mandala Pooja & Sivaratri
                  </Text>
                </View>
                <Switch
                  value={preferences.templeFestivals}
                  onValueChange={() => togglePreference('templeFestivals')}
                  trackColor={{ false: '#D9C8B4', true: '#173D32' }}
                  thumbColor={preferences.templeFestivals ? '#DFA62E' : '#FAF5EB'}
                />
              </View>

              {/* Toggle 3: Annadanam */}
              <View style={styles.preferenceRow}>
                <View style={styles.preferenceTextCol}>
                  <Text style={styles.preferenceTitle}>{t('annadanamAlerts')}</Text>
                  <Text style={styles.preferenceSubtitle}>
                    Daily timings & serving mandapam locations
                  </Text>
                </View>
                <Switch
                  value={preferences.annadanam}
                  onValueChange={() => togglePreference('annadanam')}
                  trackColor={{ false: '#D9C8B4', true: '#173D32' }}
                  thumbColor={preferences.annadanam ? '#DFA62E' : '#FAF5EB'}
                />
              </View>

              {/* Toggle 4: Panchangam */}
              <View style={styles.preferenceRow}>
                <View style={styles.preferenceTextCol}>
                  <Text style={styles.preferenceTitle}>{t('panchangamAlerts')}</Text>
                  <Text style={styles.preferenceSubtitle}>
                    Daily Rahu Kalam & Abhijit Muhurtam
                  </Text>
                </View>
                <Switch
                  value={preferences.panchangam}
                  onValueChange={() => togglePreference('panchangam')}
                  trackColor={{ false: '#D9C8B4', true: '#173D32' }}
                  thumbColor={preferences.panchangam ? '#DFA62E' : '#FAF5EB'}
                />
              </View>

              {/* Toggle 5: Seva Reminders */}
              <View style={styles.preferenceRow}>
                <View style={styles.preferenceTextCol}>
                  <Text style={styles.preferenceTitle}>{t('sevaAlerts')}</Text>
                  <Text style={styles.preferenceSubtitle}>
                    Booked archana and sacred sankalpam dates
                  </Text>
                </View>
                <Switch
                  value={preferences.sevaReminders}
                  onValueChange={() => togglePreference('sevaReminders')}
                  trackColor={{ false: '#D9C8B4', true: '#173D32' }}
                  thumbColor={preferences.sevaReminders ? '#DFA62E' : '#FAF5EB'}
                />
              </View>

              <TouchableOpacity
                style={styles.doneButton}
                activeOpacity={0.85}
                onPress={() => setSettingsOpen(false)}
              >
                <Text style={styles.doneButtonText}>Save Preferences</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0C251E',
  },
  headerContainer: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 12 : 12,
    paddingBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  headerOrnamentLeft: {
    position: 'absolute',
    top: 4,
    left: 4,
    zIndex: 1,
    opacity: 0.85,
  },
  headerOrnamentRight: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 1,
    opacity: 0.85,
  },
  headerContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    zIndex: 2,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  markAllHeaderBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(223, 166, 46, 0.22)',
    borderWidth: 1,
    borderColor: '#DFA62E',
  },
  markAllHeaderText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFD700',
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#FFFDF8',
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    letterSpacing: 0.5,
  },
  goldSeparator: {
    height: 2.5,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFF8EB',
  },
  scrollContent: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    paddingBottom: 32,
  },
  notificationCard: {
    backgroundColor: '#FFF9F0',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#E8CD9C',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationCardUnread: {
    backgroundColor: '#FFFDF5',
    borderColor: '#DFA62E',
    borderWidth: 1.4,
    shadowOpacity: 0.12,
    elevation: 3,
  },
  badgeContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    paddingRight: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  itemTitle: {
    fontSize: 15.5,
    fontWeight: '600',
    color: '#0C251E',
    flex: 1,
  },
  itemTitleUnread: {
    fontWeight: '800',
    color: '#0C251E',
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#C62828',
    marginLeft: 6,
  },
  itemMessage: {
    fontSize: 12.8,
    color: '#112620',
    lineHeight: 18,
  },
  timeContainer: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
    marginTop: 2,
    minWidth: 55,
  },
  timeText: {
    fontSize: 11.5,
    color: '#8C6D58',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#215344',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0C251E',
    marginTop: 16,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 13,
    color: '#215344',
    textAlign: 'center',
    lineHeight: 18,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFF8EB',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8CD9C',
  },
  modalHeaderTitle: {
    fontSize: 18.5,
    fontWeight: '700',
    color: '#0C251E',
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  modalDescription: {
    fontSize: 13.5,
    color: '#0C251E',
    lineHeight: 19,
    marginBottom: 16,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF9F0',
    borderWidth: 1,
    borderColor: '#E8CD9C',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  preferenceTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  preferenceTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0C251E',
    marginBottom: 2,
  },
  preferenceSubtitle: {
    fontSize: 12,
    color: '#215344',
    lineHeight: 16,
  },
  doneButton: {
    backgroundColor: '#173D32',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    marginBottom: 24,
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  doneButtonText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#FFFDF8',
  },
});

