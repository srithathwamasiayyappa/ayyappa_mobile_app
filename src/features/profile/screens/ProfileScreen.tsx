import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  Platform,
  Alert,
  SafeAreaView,
  StatusBar,
  BackHandler,
  ActivityIndicator,
  ImageBackground,
  TextInput,
  RefreshControl,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { ApiService } from '../../../services/api';
import { StorageService } from '../../../services/storageService';
import { SupportedLanguage, DevoteeProfile, BookmarkItem, DeityItem, TempleItem } from '../../../types';
import { DharmaKarthaDashboardScreen } from '../../dharma-kartha/screens/DharmaKarthaDashboardScreen';
import { DevotionalDialog, DevotionalDialogType } from '../../../components/common/DevotionalDialog';

interface Props {
  currentLanguage: SupportedLanguage;
  currentUser?: any;
  currentDeity?: DeityItem | null;
  selectedRole?: 'DEVOTEE' | 'DHARMA_KARTHA' | 'CUSTOMER';
  userRole?: 'DEVOTEE' | 'DHARMA_KARTHA' | 'CUSTOMER';
  onOpenEditProfile: () => void;
  onOpenNotifications: () => void;
  onOpenTerms: () => void;
  onOpenPrivacyPolicy: () => void;
  onOpenRefundPolicy?: () => void;
  onOpenAbout: () => void;
  onOpenAuth?: () => void;
  onLanguageChange?: (lang: SupportedLanguage) => void;
  onDeityChange?: (deity: DeityItem) => void;
  onLogout: () => void;
  onBack?: () => void;
  onOpenFestivals?: () => void;
  onNavigateDestination?: (screen: string, detail?: { id: string; title: string }, data?: any) => void;
  onRoleSwitch?: (role: 'DEVOTEE' | 'DHARMA_KARTHA') => void;
}

const DEFAULT_AVATAR = require('../../../assets/images/devotee_avatar_default.png');
const TEMPLE_BG = require('../../../../assets/welcome_devotee_temple.jpg');
const APP_VERSION = '1.0.0';

// Golden Lotus Divider Ornament
const GoldenLotusDivider = () => (
  <View style={styles.lotusDividerContainer}>
    <View style={styles.lotusLine} />
    <Svg width={28} height={18} viewBox="0 0 28 18" fill="none">
      <Path
        d="M14 2 C11 7 10 10 10 13 C10 15.5 11.8 17 14 17 C16.2 17 18 15.5 18 13 C18 10 17 7 14 2 Z"
        fill="#DFA62E"
      />
      <Path
        d="M6 9 C6 13 9 15 11 15 C10 13 9 10 9 8 C7 8 6 8.5 6 9 Z"
        fill="#DFA62E"
      />
      <Path
        d="M22 9 C22 13 19 15 17 15 C18 13 19 10 19 8 C21 8 22 8.5 22 9 Z"
        fill="#DFA62E"
      />
      <Circle cx="14" cy="13" r="1.5" fill="#FFFDF8" />
    </Svg>
    <View style={styles.lotusLine} />
  </View>
);

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

// Right Chevron Arrow
const ChevronRightIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 6l6 6-6 6"
      stroke="#345147"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Close (X) Icon
const CameraBadgeIcon = () => (
  <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
    <Path
      d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2 3h4a2 2 0 0 1 2 2z"
      fill="#FFFFFF"
    />
    <Circle cx="12" cy="13" r="4" fill="#8B1D24" />
    <Circle cx="12" cy="13" r="2" fill="#FFFFFF" />
  </Svg>
);

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

// Pencil Icon for Edit Profile Button
const PencilIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
      stroke="#0C251E"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// --- 6 DEVOTIONAL MENU ICONS (Matching approved reference screenshot) ---

// 1. My Bookmarks Icon (Maroon bookmark ribbon)
const MenuBookmarksIcon = () => (
  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 4 C5 2.89 5.89 2 7 2 L17 2 C18.11 2 19 2.89 19 4 L19 21 L12 17.5 L5 21 L5 4 Z"
      fill="#173D32"
    />
    <Path
      d="M8 6 H16 M8 10 H14"
      stroke="#F3D38E"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

// 2. Notifications Icon (Maroon bell with golden details)
const MenuNotificationsIcon = () => (
  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8 A6 6 0 0 0 6 8 C6 15 3 17 3 17 L21 17 C21 17 18 15 18 8 Z"
      fill="#173D32"
    />
    <Path
      d="M10.3 21 A2 2 0 0 0 13.7 21"
      stroke="#DFA62E"
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Circle cx="12" cy="4" r="1.5" fill="#F3D38E" />
  </Svg>
);

// 3. App Preferences Icon (Maroon gear wheel)
const MenuPreferencesIcon = () => (
  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3.5" fill="#FFFDF8" stroke="#173D32" strokeWidth={2.5} />
    <Path
      d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
      stroke="#173D32"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 4. Legal & Policies Icon (Maroon document scroll)
const MenuLegalIcon = () => (
  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="3" width="16" height="18" rx="3" fill="#173D32" />
    <Path
      d="M8 8 H16 M8 12 H16 M8 16 H13"
      stroke="#F3D38E"
      strokeWidth={1.8}
      strokeLinecap="round"
    />
    <Circle cx="16" cy="16" r="2" fill="#DFA62E" />
  </Svg>
);

// 5. About App Icon (Maroon circular badge with white info i)
const MenuAboutIcon = () => (
  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill="#173D32" />
    <Path
      d="M12 16 V11 M12 8 H12.01"
      stroke="#FFFDF8"
      strokeWidth={2.2}
      strokeLinecap="round"
    />
  </Svg>
);

// 5B. Festivals Icon (Sacred golden deepam flame on green base)
const MenuFestivalsIcon = () => (
  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2 C12 2 8 7 8 11 C8 13.2 9.8 15 12 15 C14.2 15 16 13.2 16 11 C16 7 12 2 12 2 Z" fill="#DFA62E" />
    <Path d="M12 5 C12 5 9.5 8.5 9.5 11 C9.5 12.4 10.6 13.5 12 13.5 C13.4 13.5 14.5 12.4 14.5 11 C14.5 8.5 12 5 12 5 Z" fill="#FFE28C" />
    <Path d="M5 14 C5 14 6 19 12 19 C18 19 19 14 19 14 H5 Z" fill="#173D32" />
    <Path d="M9 19 L7 22 H17 L15 19" stroke="#173D32" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// 6. Logout Icon (Red door outline with arrow pointing right)
const MenuLogoutIcon = ({ size = 26, color = '#173D32' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"
      stroke={color}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 17l5-5-5-5"
      stroke={color}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M21 12H9"
      stroke={color}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 7. Delete Account Icon (Devotional Red Trash/Shield with gold detail)
const MenuDeleteAccountIcon = () => (
  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill="#FDEDED" stroke="#E57373" strokeWidth={1} />
    <Path
      d="M8.5 9.5l.8 8c.08.7.67 1.2 1.37 1.2h2.66c.7 0 1.29-.5 1.37-1.2l.8-8"
      stroke="#B71C1C"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M6.5 7h11M10 7V5.5c0-.5.4-.9.9-.9h2.2c.5 0 .9.4.9.9V7"
      stroke="#B71C1C"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10.5 11v5M13.5 11v5"
      stroke="#C62828"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

// --- DHARMA KARTHA (TRUSTEE) ICONS ---
// Mandir / Temples Icon
const MenuTemplesIcon = () => (
  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L2 8h20L12 2z" fill="#173D32" />
    <Path d="M4 10v10h16V10H4z" stroke="#173D32" strokeWidth={1.8} />
    <Path d="M9 14h6v6H9v-6z" fill="#DFA62E" />
    <Path d="M2 21h20" stroke="#173D32" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// Add Mandir Icon
const MenuAddMandirIcon = () => (
  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill="#173D32" />
    <Path d="M12 7v10M7 12h10" stroke="#F3D38E" strokeWidth={2.4} strokeLinecap="round" />
  </Svg>
);

// Manage Events Icon
const MenuEventsIcon = () => (
  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="18" rx="3" fill="#173D32" />
    <Path d="M16 2v4M8 2v4M3 10h18" stroke="#F3D38E" strokeWidth={1.8} strokeLinecap="round" />
    <Circle cx="8" cy="14" r="1.5" fill="#DFA62E" />
    <Circle cx="12" cy="14" r="1.5" fill="#DFA62E" />
    <Circle cx="16" cy="14" r="1.5" fill="#DFA62E" />
  </Svg>
);

// Sacred Gallery Icon
const MenuGalleryIcon = () => (
  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="18" height="18" rx="3" stroke="#173D32" strokeWidth={2} />
    <Circle cx="8.5" cy="8.5" r="1.5" fill="#DFA62E" />
    <Path d="M21 15l-5-5L5 21" stroke="#173D32" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Multilingual Dictionary
const PROFILE_I18N: Record<string, Record<string, string>> = {
  dharmaKarthaRole: {
    en: 'DHARMA KARTHA',
    te: 'ధర్మకర్త (టెంపుల్ ఫౌండర్)',
    kn: 'ಧರ್ಮಕರ್ತ (ದೇವಾಲಯ ಸಂಸ್ಥಾಪಕರು)',
    ta: 'தர்மகர்த்தா (கோவில் நிறுவனர்)',
    hi: 'धर्मकर्ता (मंदिर संस्थापक)',
    ml: 'ധർമ്മകർത്താവ്',
  },
  customerRole: {
    en: 'CUSTOMER (DEVOTEE)',
    te: 'భక్తుడు (కస్టమర్)',
    kn: 'ಭಕ್ತರು (ಗ್ರಾಹಕ)',
    ta: 'பக்தர் (வாடிக்கையாளர்)',
    hi: 'भक्त (ग्राहक)',
    ml: 'ഭക്തൻ',
  },
  switchToDevotee: {
    en: '🙏 Switch to Devotee View',
    te: '🙏 భక్తుని వీక్షణకు మారండి',
    kn: '🙏 ಭಕ್ತರ ವೀಕ್ಷಣೆಗೆ ಬದಲಾಯಿಸಿ',
    ta: '🙏 பக்தர் பார்வைக்கு மாறவும்',
    hi: '🙏 भक्त दृश्य पर जाएं',
    ml: '🙏 ഭക്ത മോഡിലേക്ക് മാറുക',
  },
  switchToDharmaKartha: {
    en: '🛕 Switch to Dharma Kartha View',
    te: '🛕 ధర్మకర్త వీక్షణకు మారండి',
    kn: '🛕 ಧರ್ಮಕರ್ತರ ವೀಕ್ಷಣೆಗೆ ಬದಲಾಯಿಸಿ',
    ta: '🛕 தர்மகர்த்தா பார்வைக்கு மாறவும்',
    hi: '🛕 धर्मकर्ता दृश्य पर जाएं',
    ml: '🛕 ധർമ്മകർത്താവ് മോഡിലേക്ക് മാറുക',
  },
  trusteeDashboardTitle: {
    en: 'Sacred Trustee Dashboard',
    te: 'పవిత్ర ధర్మకర్త డాష్‌బోర్డ్',
    kn: 'ಪವಿತ್ರ ಧರ್ಮಕರ್ತರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    ta: 'புனித தர்மகர்த்தா டாஷ்போர்டு',
    hi: 'पवित्र धर्मकर्ता डैशबोर्ड',
    ml: 'വിശുദ്ധ ധർമ്മകർത്താവ് ഡാഷ്‌ബോർഡ്',
  },
  manageYourTemples: {
    en: 'Manage Your Temples',
    te: 'మీ ఆలయాల నిర్వహణ',
    kn: 'ನಿಮ್ಮ ದೇವಾಲಯಗಳ ನಿರ್ವಹಣೆ',
    ta: 'உங்கள் கோவில்களை நிர்வகிக்கவும்',
    hi: 'अपने मंदिरों का प्रबंधन करें',
    ml: 'നിങ്ങളുടെ ക്ഷേത്രങ്ങൾ കൈകാര്യം ചെയ്യുക',
  },
  manageYourTemplesSubtitle: {
    en: 'View & configure registered mandirs',
    te: 'నమోదైన ఆలయాల వివరాలు & సేవలు',
    kn: 'ನೋಂದಾಯಿತ ದೇವಾಲಯಗಳ ಮಾಹಿತಿ & ಸೇವೆಗಳು',
    ta: 'பதிவு செய்யப்பட்ட கோவில்கள் & சேவைகள்',
    hi: 'पंजीकृत मंदिर एवं सेवाओं का विवरण',
    ml: 'രജിസ്റ്റർ ചെയ്ത ക്ഷേത്രങ്ങൾ',
  },
  addManageMandir: {
    en: 'Add / Manage Mandir',
    te: 'నూతన ఆలయం చేర్చండి / నిర్వహించండి',
    kn: 'ಹೊಸ ದೇವಾಲಯ ಸೇರಿಸಿ / ನಿರ್ವಹಿಸಿ',
    ta: 'புதிய கோவில் சேர்க்க / நிர்வகிக்க',
    hi: 'नया मंदिर जोड़ें / प्रबंधित करें',
    ml: 'ക്ഷേത്രം ചേർക്കുക',
  },
  addManageMandirSubtitle: {
    en: 'Register shrine, deities & darshan timings',
    te: 'ఆలయం, దేవతామూర్తులు & దర్శన సమయాలు',
    kn: 'ದೇವಾಲಯ, ದೇವತೆಗಳು & ದರ್ಶನ ಸಮಯಗಳು',
    ta: 'கோவில், தெய்வங்கள் & தரிசன நேரம்',
    hi: 'मंदिर, विग्रह एवं दर्शन का समय',
    ml: 'ക്ഷേത്ര വിവരങ്ങൾ',
  },
  manageEvents: {
    en: 'Manage Events',
    te: 'ధార్మిక ఉత్సవాల నిర్వహణ',
    kn: 'ಧಾರ್ಮಿಕ ಕಾರ್ಯಕ್ರಮಗಳ ನಿರ್ವಹಣೆ',
    ta: 'நிகழ்வுகளை நிர்வகிக்கவும்',
    hi: 'धार्मिक आयोजनों का प्रबंधन',
    ml: 'വിശേഷങ്ങൾ കൈകാര്യം ചെയ്യുക',
  },
  manageEventsSubtitle: {
    en: 'Poojas, homams, sevas & annadanam',
    te: 'పూజలు, హోమాలు, నిత్య సేవలు & అన్నదానం',
    kn: 'ಪೂಜೆಗಳು, ಹೋಮಗಳು & ಅನ್ನದಾನ',
    ta: 'பூஜைகள், ஹோமங்கள் & அன்னதானம்',
    hi: 'पूजा, हवन, सेवा एवं अन्नदान',
    ml: 'പൂജകളും അന്നദാനവും',
  },
  sacredGallery: {
    en: 'Sacred Gallery',
    te: 'దివ్య చిత్రమాలిక (గ్యాలరీ)',
    kn: 'ಪವಿತ್ರ ಗ್ಯಾಲರಿ',
    ta: 'புனித புகைப்படங்கள்',
    hi: 'दिव्य गैलरी',
    ml: 'ഗാലറി',
  },
  sacredGallerySubtitle: {
    en: 'Sanctum photos, gopuram & alankaram',
    te: 'గర్భగుడి, గోపురం & నిత్యాలంకరణ ఫొటోలు',
    kn: 'ಗರ್ಭಗುಡಿ, ಗೋಪುರ & ಅಲಂಕಾರ ಫೋಟೋಗಳು',
    ta: 'கருவறை, கோபுரம் & அலங்காரப் படங்கள்',
    hi: 'गर्भगृह, गोपुरम एवं शृंगार छायाचित्र',
    ml: 'ക്ഷേത്ര ചിത്രങ്ങൾ',
  },
  regMandir: {
    en: 'Registered Mandir',
    te: 'నమోదైన ఆలయాలు',
    kn: 'ನೋಂದಾಯಿತ ಮಂದಿರ',
    ta: 'பதிவு செய்யப்பட்ட கோவில்',
    hi: 'पंजीकृत मंदिर',
    ml: 'ക്ഷേത്രങ്ങൾ',
  },
  templeFestivalsDb: {
    en: 'Temple Festivals (DB)',
    te: 'ఆలయ ఉత్సవాలు (DB)',
    kn: 'ದೇವಾಲಯದ ಹಬ್ಬಗಳು (DB)',
    ta: 'கோவில் திருவிழாக்கள் (DB)',
    hi: 'मंदिर उत्सव (DB)',
    ml: 'ക്ഷേത്ര ഉത്സവങ്ങൾ (DB)',
  },
  devotionalEventsDb: {
    en: 'Devotional Events (DB)',
    te: 'పూజా కార్యక్రమాలు (DB)',
    kn: 'ಧಾರ್ಮಿಕ ಕಾರ್ಯಕ್ರಮಗಳು (DB)',
    ta: 'பக்தி நிகழ்வுகள் (DB)',
    hi: 'धार्मिक कार्यक्रम (DB)',
    ml: 'ഭക്തി പരിപാടികൾ (DB)',
  },
  sacredPhotosDb: {
    en: 'Sacred Photos (DB)',
    te: 'దివ్య చిత్రాలు (DB)',
    kn: 'ಪವಿತ್ರ ಫೋಟೋಗಳು (DB)',
    ta: 'புனித புகைப்படங்கள் (DB)',
    hi: 'पवित्र छायाचित्र (DB)',
    ml: 'പവിത്ര ഫോട്ടോകൾ (DB)',
  },
  screenTitle: {
    en: 'My Profile',
    te: 'నా ప్రొఫైల్',
    kn: 'ನನ್ನ ಪ್ರೊಫೈಲ್',
    ta: 'எனது சுயவிவரம்',
    hi: 'मेरी प्रोफाइल',
    ml: 'എന്റെ പ്രൊഫൈൽ',
  },
  editProfile: {
    en: 'Edit Profile',
    te: 'ప్రొఫైల్ ఎడిట్ చేయండి',
    kn: 'ಪ್ರೊಫೈಲ್ ತಿದ್ದುಪಡಿ',
    ta: 'சுயவிவரம் திருத்து',
    hi: 'प्रोफाइल संपादित करें',
    ml: 'പ്രൊഫൈൽ മാറ്റുക',
  },
  loginRegister: {
    en: 'Login / Register',
    te: 'లాగిన్ / రిజిస్టర్',
    kn: 'ಲಾಗಿನ್ / ನೋಂದಣಿ',
    ta: 'உள்நுழைய / பதிவு',
    hi: 'लॉगिन / रजिस्टर',
    ml: 'ലോഗിൻ / രജിസ്റ്റർ',
  },
  myBookmarks: {
    en: 'My Bookmarks',
    te: 'నా బుక్‌మార్క్‌లు',
    kn: 'ನನ್ನ ಬುಕ್‌ಮಾರ್ಕ್‌ಗಳು',
    ta: 'எனது விருப்பங்கள்',
    hi: 'मेरे बुकमार्क',
    ml: 'എന്റെ ബുക്ക്മാർക്കുകൾ',
  },
  myBookmarksSubtitle: {
    en: 'Saved stotras, poojas, temples',
    te: 'సేవ్ చేసిన స్తోత్రాలు, పూజలు, ఆలయాలు',
    kn: 'ಉಳಿಸಿದ ಸ್ತೋತ್ರಗಳು, ಪೂಜೆಗಳು, ದೇವಾಲಯಗಳು',
    ta: 'சேமிக்கப்பட்ட ஸ்தோத்திரங்கள், பூஜைகள், கோயில்கள்',
    hi: 'सहेजे गए स्तोत्र, पूजा एवं मंदिर',
    ml: 'സൂക്ഷിച്ച സ്തോത്രങ്ങൾ, പൂജകൾ, ക്ഷേത്രങ്ങൾ',
  },
  notifications: {
    en: 'Notifications',
    te: 'నోటిఫికేషన్లు',
    kn: 'ಅಧಿಸೂಚನೆಗಳು',
    ta: 'அறிவிப்புகள்',
    hi: 'सूचनाएं',
    ml: 'അറിയിപ്പുകൾ',
  },
  notificationsSubtitle: {
    en: 'Manage alerts & reminders',
    te: 'అలెర్ట్స్ & రిమైండర్ల నిర్వహణ',
    kn: 'ಎಚ್ಚರಿಕೆಗಳು & ಜ್ಞಾಪನೆಗಳ ನಿರ್ವಹಣೆ',
    ta: 'விழிப்பூட்டல்கள் & நினைவூட்டல்கள்',
    hi: 'अलर्ट एवं अनुस्मारक प्रबंधित करें',
    ml: 'അറിയിപ്പുകൾ & ഓർമ്മപ്പെടുത്തലുകൾ',
  },
  festivals: {
    en: 'Festivals & Sacred Days',
    te: 'పండుగలు & విశేష దినాలు',
    kn: 'ಹಬ್ಬಗಳು & ಪವಿತ್ರ ದಿನಗಳು',
    ta: 'திருவிழாக்கள் & சிறப்பு நாட்கள்',
    hi: 'त्यौहार एवं विशेष दिन',
    ml: 'ഉത്സവങ്ങളും വിശേഷ ദിനങ്ങളും',
  },
  festivalsSubtitle: {
    en: 'Vedic Panchangam & celebrations',
    te: 'వైదిక పంచాంగ పండుగలు & వేడుకలు',
    kn: 'ವೈದಿಕ ಪಂಚಾಂಗ ಹಬ್ಬಗಳು & ಆಚರಣೆಗಳು',
    ta: 'வேத பஞ்சாங்க திருவிழாக்கள்',
    hi: 'वैदिक पंचांग त्यौहार एवं उत्सव',
    ml: 'വൈദിക പഞ്ചാംഗ പുണ്യദിനങ്ങൾ',
  },
  appPreferences: {
    en: 'App Language',
    te: 'యాప్ భాష',
    kn: 'ಅಪ್ಲಿಕೇಶನ್ ಭಾಷೆ',
    ta: 'செயலி மொழி',
    hi: 'ऐप भाषा',
    ml: 'ആപ്പ് ഭാഷ',
  },
  appPreferencesSubtitle: {
    en: 'Change devotional content language',
    te: 'భక్తి కంటెంట్ భాషను మార్చండి',
    kn: 'ಭಕ್ತಿ ವಿಷಯದ ಭಾಷೆಯನ್ನು ಬದಲಾಯಿಸಿ',
    ta: 'பக்தி உள்ளடக்க மொழியை மாற்றவும்',
    hi: 'भक्ति सामग्री भाषा बदलें',
    ml: 'ഭക്തി ഉള്ളടക്ക ഭാഷ മാറ്റുക',
  },
  legalPolicies: {
    en: 'Legal & Policies',
    te: 'నిబంధనలు & విధానాలు',
    kn: 'ಕಾನೂನು & ನೀತಿಗಳು',
    ta: 'விதிமுறைகள் & கொள்கைகள்',
    hi: 'नियम एवं नीतियां',
    ml: 'നിയമങ്ങളും നയങ്ങളും',
  },
  legalPoliciesSubtitle: {
    en: 'Terms, Privacy & More',
    te: 'నిబంధనలు, గోప్యతా విధానం',
    kn: 'ಷರತ್ತುಗಳು, ಗೌಪ್ಯತೆ ಮತ್ತು ಇನ್ನಷ್ಟು',
    ta: 'விதிமுறைகள், தனியுரிமை & மேலும்',
    hi: 'शर्तें, गोपनीयता नीति एवं अधिक',
    ml: 'നിബന്ധനകൾ, സ്വകാര്യത & കൂടുതൽ',
  },
  aboutApp: {
    en: 'About',
    te: 'గురించి',
    kn: 'ಬಗ್ಗೆ',
    ta: 'பற்றி',
    hi: 'के बारे में',
    ml: 'വിവരം',
  },
  logout: {
    en: 'Logout',
    te: 'లాగౌట్',
    kn: 'ಲಾಗ್‌ಔಟ್',
    ta: 'வெளியேறு',
    hi: 'लॉगआउट',
    ml: 'ലോഗ്ഔട്ട്',
  },
  logoutConfirmTitle: {
    en: 'Logout?',
    te: 'లాగౌట్ చేయాలా?',
    kn: 'ಲಾಗ್‌ಔಟ್ ಮಾಡಬೇಕೆ?',
    ta: 'வெளியேறவா?',
    hi: 'लॉगआउट करें?',
    ml: 'ലോഗ്ഔട്ട് ചെയ്യണമോ?',
  },
  logoutConfirmDesc: {
    en: 'Are you sure you want to logout from Saranam Ayyappa?',
    te: 'శరణం అయ్యప్ప యాప్ నుండి మీరు ఖచ్చితంగా లాగౌట్ అవ్వాలనుకుంటున్నారా?',
    kn: 'ಶರಣಂ ಅಯ್ಯಪ್ಪ ಅಪ್ಲಿಕೇಶನ್‌ನಿಂದ ನೀವು ಲಾಗ್‌ಔಟ್ ಆಗಲು ಬಯಸುವಿರಾ?',
    ta: 'சரணம் ஐயப்பா செயலியில் இருந்து வெளியேற விரும்புகிறீர்களா?',
    hi: 'क्या आप शरणम अय्यप्पा ऐप से लॉगआउट करना चाहते हैं?',
    ml: 'ശരണം അയ്യപ്പ ആപ്പിൽ നിന്നും ലോഗ്ഔട്ട് ചെയ്യണമെന്ന് ഉറപ്പാണോ?',
  },
  cancel: {
    en: 'Cancel',
    te: 'రద్దు చేయి',
    kn: 'ರದ್ದುಮಾಡಿ',
    ta: 'ரத்து செய்',
    hi: 'रद्द करें',
    ml: 'റദ്ദാക്കുക',
  },
  guestDevotee: {
    en: 'Welcome Devotee',
    te: 'స్వాగతం భక్తుడా',
    kn: 'ಸ್ವಾಗತ ಭಕ್ತರೇ',
    ta: 'வணக்கம் பக்தரே',
    hi: 'स्वागतम भक्त',
    ml: 'സ്വാഗതം ഭക്തജനങ്ങളെ',
  },
  guestModeSubtitle: {
    en: 'Guest Mode',
    te: 'అతిథి మోడ్',
    kn: 'ಅತಿಥಿ ಮೋಡ್',
    ta: 'விருந்தினர் முறை',
    hi: 'अतिथि मोड',
    ml: 'ഗസ്റ്റ് മോഡ്',
  },
  deleteAccount: {
    en: 'Delete Account',
    te: 'ఖాతా తొలగించండి',
    kn: 'ಖಾತೆ ಅಳಿಸಿ',
    ta: 'கணக்கை நீக்கு',
    hi: 'खाता हटाएं',
    ml: 'അക്കൗണ്ട് ഇല്ലാതാക്കുക',
  },
  deleteAccountSubtitle: {
    en: 'Request account & data removal',
    te: 'ఖాతా & డేటా తొలగింపు అభ్యర్థన',
    kn: 'ಖಾತೆ ಮತ್ತು ಡೇಟಾ ತೆಗೆದುಹಾಕಲು ವಿನಂತಿ',
    ta: 'கணக்கு மற்றும் தரவு நீக்க கோரிக்கை',
    hi: 'खाता और डेटा हटाने का अनुरोध',
    ml: 'അക്കൗണ്ടും ഡാറ്റയും നീക്കം ചെയ്യാനുള്ള അഭ്യർത്ഥന',
  },
  deleteAccountModalTitle: {
    en: 'Delete Devotee Account',
    te: 'భక్తుని ఖాతా తొలగింపు',
    kn: 'ಭಕ್ತರ ಖಾತೆ ಅಳಿಸುವಿಕೆ',
    ta: 'பக்தர் கணக்கு நீக்கம்',
    hi: 'भक्त खाता हटाना',
    ml: 'ഭക്ത അക്കൗണ്ട് ഇല്ലാതാക്കൽ',
  },
  deleteWarningMsg: {
    en: 'Swamiye Saranam Ayyappa! Requesting deletion will deactivate your account and revoke access to saved bookmarks and offerings. An OTP will be sent to your registered mobile number for verification.',
    te: 'స్వామియే శరణం అయ్యప్ప! ఖాతా తొలగింపు అభ్యర్థన ప్రారంభించిన తర్వాత మీ నమోదిత మొబైల్ నంబరుకు ధృవీకరణ OTP పంపబడుతుంది.',
    kn: 'ಸ್ವಾಮಿಯೇ ಶರಣಂ ಅಯ್ಯಪ್ಪ! ಖಾತೆ ಅಳಿಸುವಿಕೆ ಪ್ರಾರಂಭಿಸಲು ನಿಮ್ಮ ನೋಂದಾಯಿತ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಗೆ ಪರಿಶೀಲನಾ OTP ಕಳುಹಿಸಲಾಗುತ್ತದೆ.',
    ta: 'சுவாமியே சரணம் ஐயப்பா! கணக்கு நீக்க கோரிக்கையை தொடங்க உங்கள் பதிவு செய்யப்பட்ட மொபைல் எண்ணிற்கு OTP அனுப்பப்படும்.',
    hi: 'स्वामीये शरणम अय्यप्पा! खाता हटाने का अनुरोध करने के लिए आपके पंजीकृत मोबाइल नंबर पर ओटीपी भेजा जाएगा।',
    ml: 'സ്വാമിയേ ശരണം അയ്യപ്പാ! അക്കൗണ്ട് ഇല്ലാതാക്കൽ ആരംഭിക്കുന്നതിന് നിങ്ങളുടെ രജിസ്റ്റർ ചെയ്ത മൊബൈലിലേക്ക് ഒടിപി അയയ്ക്കും.',
  },
  reasonPlaceholder: {
    en: 'Reason for deletion (Optional)',
    te: 'తొలగింపు కారణం (ఐచ్ఛికం)',
    kn: 'ಅಳಿಸುವಿಕೆಗೆ ಕಾರಣ (ಐಚ್ಛಿಕ)',
    ta: 'நீக்குவதற்கான காரணம் (விருப்பமானது)',
    hi: 'हटाने का कारण (वैकल्पिक)',
    ml: 'ഇല്ലാതാക്കാനുള്ള കാരണം (ഐച്ഛികം)',
  },
  sendVerificationOtp: {
    en: 'Send Verification OTP',
    te: 'ధృవీకరణ OTP పంపండి',
    kn: 'ಪರಿಶೀಲನಾ OTP ಕಳುಹಿಸಿ',
    ta: 'சரிபார்ப்பு OTP அனுப்பவும்',
    hi: 'सत्यापन ओटीपी भेजें',
    ml: 'സ്ഥിരീകരണ ഒടിപി അയയ്ക്കുക',
  },
  enterOtpTitle: {
    en: 'Enter 6-Digit OTP',
    te: '6 అంకెల OTP నమోదు చేయండి',
    kn: '6 ಅಂಕಿಯ OTP ನಮೂದಿಸಿ',
    ta: '6 இலக்க OTP உள்ளிடவும்',
    hi: '6 अंकों का ओटीपी दर्ज करें',
    ml: '6 അക്ക ഒടിപി നൽകുക',
  },
  otpSentTo: {
    en: 'OTP sent to registered number:',
    te: 'నమోదిత నంబరుకు OTP పంపబడింది:',
    kn: 'ನೋಂದಾಯಿತ ಸಂಖ್ಯೆಗೆ OTP ಕಳುಹಿಸಲಾಗಿದೆ:',
    ta: 'பதிவு செய்யப்பட்ட எண்ணிற்கு OTP அனுப்பப்பட்டது:',
    hi: 'पंजीकृत नंबर पर ओटीपी भेजा गया:',
    ml: 'രജിസ്റ്റർ ചെയ്ത നമ്പറിലേക്ക് ഒടിപി അയച്ചു:',
  },
  confirmDeleteAction: {
    en: 'Verify OTP & Request Deletion',
    te: 'OTP ధృవీకరించి తొలగింపు కోరండి',
    kn: 'OTP ಪರಿಶೀಲಿಸಿ & ಅಳಿಸಲು ವಿನಂತಿಸಿ',
    ta: 'OTP சரிபார்த்து நீக்க கோரவும்',
    hi: 'ओटीपी सत्यापित कर हटाने का अनुरोध करें',
    ml: 'ഒടിപി പരിശോധിച്ച് ഇല്ലാതാക്കൽ അഭ്യർത്ഥിക്കുക',
  },
  resendOtp: {
    en: 'Resend OTP',
    te: 'OTP మళ్ళీ పంపండి',
    kn: 'OTP ಪುನಃ ಕಳುಹಿಸಿ',
    ta: 'OTP மீண்டும் அனுப்பவும்',
    hi: 'ओटीपी पुनः भेजें',
    ml: 'ഒടിപി വീണ്ടും അയയ്ക്കുക',
  },
  deletionSuccessMsg: {
    en: 'Account deletion request submitted. Temple administration will process your request. Logging out.',
    te: 'ఖాతా తొలగింపు అభ్యర్థన సమర్పించబడింది. నిర్వాహకులు సమీక్షిస్తారు. లాగౌట్ అవుతున్నారు.',
    kn: 'ಖಾತೆ ಅಳಿಸುವಿಕೆ ವಿನಂತಿ ಸಲ್ಲಿಸಲಾಗಿದೆ. ಲಾಗ್ ಔಟ್ ಆಗುತ್ತಿದೆ.',
    ta: 'கணக்கு நீக்க கோரிக்கை சமர்ப்பிக்கப்பட்டது. வெளியேறுகிறது.',
    hi: 'खाता हटाने का अनुरोध प्रस्तुत किया गया। लॉग आउट हो रहे हैं।',
    ml: 'അക്കൗണ്ട് ഇല്ലാതാക്കൽ അഭ്യർത്ഥന സമർപ്പിച്ചു. ലോഗ് ഔട്ട് ചെയ്യുന്നു.',
  },
};

export const ProfileScreen: React.FC<Props> = ({
  currentLanguage,
  currentUser,
  currentDeity,
  selectedRole,
  userRole,
  onOpenEditProfile,
  onOpenNotifications,
  onOpenTerms,
  onOpenPrivacyPolicy,
  onOpenRefundPolicy,
  onOpenAbout,
  onOpenAuth,
  onLanguageChange,
  onDeityChange,
  onLogout,
  onBack,
  onOpenFestivals,
  onNavigateDestination,
  onRoleSwitch,
}) => {
  // Strictly determine active role dynamically from logged-in user credentials
  const effectiveRole = (currentUser?.role || selectedRole || userRole || '').toUpperCase();
  const isDharmaKartha = effectiveRole === 'DHARMA_KARTHA';
  const activeRole: 'DEVOTEE' | 'DHARMA_KARTHA' = isDharmaKartha ? 'DHARMA_KARTHA' : 'DEVOTEE';

  const [profile, setProfile] = useState<DevoteeProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Dharma Kartha Dynamic Data States (Live from DB API)
  const [dkLoading, setDkLoading] = useState(false);
  const [dkProfile, setDkProfile] = useState<any>(null);
  const [dkStats, setDkStats] = useState<{ managedTemples: number; activeFestivals: number; eventsCount: number; mediaCount: number }>({
    managedTemples: 0,
    activeFestivals: 0,
    eventsCount: 0,
    mediaCount: 0,
  });
  const [dkTemples, setDkTemples] = useState<any[]>([]);
  const [dkEvents, setDkEvents] = useState<any[]>([]);
  const [dkFestivals, setDkFestivals] = useState<any[]>([]);
  const [dkMedia, setDkMedia] = useState<any[]>([]);

  // Subscreen Modals for Dharma Kartha Actions
  const [templesModalVisible, setTemplesModalVisible] = useState(false);
  const [loadingTemples, setLoadingTemples] = useState(false);
  const [eventsModalVisible, setEventsModalVisible] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [galleryModalVisible, setGalleryModalVisible] = useState(false);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [addMandirModalVisible, setAddMandirModalVisible] = useState(false);

  // Add Mandir Form State (Matching Website Register a Holy Mandir fields)
  const [newMandirType, setNewMandirType] = useState('MAIN_TEMPLE');
  const [newClassificationOpen, setNewClassificationOpen] = useState(false);
  const [newMandirName, setNewMandirName] = useState('');
  const [newMandirAltName, setNewMandirAltName] = useState('');
  const [newMandirDeity, setNewMandirDeity] = useState('Lord Ayyappa');
  const [newMandirState, setNewMandirState] = useState('Andhra Pradesh');
  const [newMandirCity, setNewMandirCity] = useState('');
  const [newMandirDistrict, setNewMandirDistrict] = useState('');
  const [newMandirAddress, setNewMandirAddress] = useState('');
  const [newMandirSummary, setNewMandirSummary] = useState('');
  const [newMandirAbout, setNewMandirAbout] = useState('');
  const [newMandirHistory, setNewMandirHistory] = useState('');
  const [newMandirSpeciality, setNewMandirSpeciality] = useState('');
  const [newMandirPhone, setNewMandirPhone] = useState('');
  const [newMandirEmail, setNewMandirEmail] = useState('');
  const [newMandirWebsite, setNewMandirWebsite] = useState('');
  const [savingMandir, setSavingMandir] = useState(false);

  // Add Event Form State (Matching Website Create Temple Event modal)
  const [addEventModalVisible, setAddEventModalVisible] = useState(false);
  const [newEventTempleId, setNewEventTempleId] = useState<number | null>(null);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDateTime, setNewEventDateTime] = useState('');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [savingEvent, setSavingEvent] = useState(false);

  // Add Festival Form State (Matching Website Add Temple Festival modal)
  const [festivalsModalVisible, setFestivalsModalVisible] = useState(false);
  const [loadingFestivals, setLoadingFestivals] = useState(false);
  const [addFestivalModalVisible, setAddFestivalModalVisible] = useState(false);
  const [newFestivalTempleId, setNewFestivalTempleId] = useState<number | null>(null);
  const [newFestivalName, setNewFestivalName] = useState('');
  const [newFestivalPeriod, setNewFestivalPeriod] = useState('');
  const [newFestivalDesc, setNewFestivalDesc] = useState('');
  const [newFestivalSeva, setNewFestivalSeva] = useState('');
  const [savingFestival, setSavingFestival] = useState(false);

  // Edit Mandir Form State
  const [editMandirModalVisible, setEditMandirModalVisible] = useState(false);
  const [editingTempleId, setEditingTempleId] = useState<number | null>(null);
  const [editMandirType, setEditMandirType] = useState('MAIN_TEMPLE');
  const [editClassificationOpen, setEditClassificationOpen] = useState(false);
  const [editMandirName, setEditMandirName] = useState('');
  const [editMandirAltName, setEditMandirAltName] = useState('');
  const [editMandirDeity, setEditMandirDeity] = useState('Lord Ayyappa');
  const [editMandirState, setEditMandirState] = useState('Andhra Pradesh');
  const [editMandirCity, setEditMandirCity] = useState('');
  const [editMandirDistrict, setEditMandirDistrict] = useState('');
  const [editMandirAddress, setEditMandirAddress] = useState('');
  const [editMandirSummary, setEditMandirSummary] = useState('');
  const [editMandirAbout, setEditMandirAbout] = useState('');
  const [editMandirHistory, setEditMandirHistory] = useState('');
  const [editMandirSpeciality, setEditMandirSpeciality] = useState('');
  const [editMandirPhone, setEditMandirPhone] = useState('');
  const [editMandirEmail, setEditMandirEmail] = useState('');
  const [editMandirWebsite, setEditMandirWebsite] = useState('');
  const [savingEditMandir, setSavingEditMandir] = useState(false);

  // Delete Mandir State
  const [deleteMandirModalVisible, setDeleteMandirModalVisible] = useState(false);
  const [deletingTemple, setDeletingTemple] = useState<any | null>(null);
  const [templeDeleteReason, setTempleDeleteReason] = useState('');
  const [deletingTempleLoading, setDeletingTempleLoading] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [bookmarksModalVisible, setBookmarksModalVisible] = useState(false);
  const [preferencesModalVisible, setPreferencesModalVisible] = useState(false);
  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [bookmarksLoading, setBookmarksLoading] = useState<boolean>(false);
  const [availableLanguages, setAvailableLanguages] = useState<any[]>([]);
  const [loadingLanguages, setLoadingLanguages] = useState<boolean>(false);
  const [switchingLanguage, setSwitchingLanguage] = useState<boolean>(false);
  const [refreshingProfile, setRefreshingProfile] = useState<boolean>(false);
  const [uploadingAvatar, setUploadingAvatar] = useState<boolean>(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState<boolean>(false);
  const [loggingOut, setLoggingOut] = useState<boolean>(false);

  // Devotee Account Deletion with OTP Verification State
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteStep, setDeleteStep] = useState<'REASON' | 'OTP'>('REASON');
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteOtp, setDeleteOtp] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Sacred Devotional Custom Alert & Confirm Dialog State
  const [devotionalDialog, setDevotionalDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: DevotionalDialogType;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    isDestructive?: boolean;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'success',
    confirmText: 'OK',
  });

  const showAlert = (
    title: string,
    message: string,
    onConfirm?: () => void,
    type: DevotionalDialogType = 'success',
    confirmText = 'OK'
  ) => {
    setDevotionalDialog({
      visible: true,
      title,
      message,
      type,
      confirmText,
      onConfirm: () => {
        setDevotionalDialog((prev) => ({ ...prev, visible: false }));
        if (onConfirm) onConfirm();
      },
    });
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: {
      confirmText?: string;
      cancelText?: string;
      isDestructive?: boolean;
      type?: DevotionalDialogType;
    }
  ) => {
    setDevotionalDialog({
      visible: true,
      title,
      message,
      type: options?.type || (options?.isDestructive ? 'warning' : 'info'),
      confirmText: options?.confirmText || 'Confirm',
      cancelText: options?.cancelText || 'Cancel',
      isDestructive: options?.isDestructive,
      onConfirm: () => {
        setDevotionalDialog((prev) => ({ ...prev, visible: false }));
        onConfirm();
      },
      onCancel: () => {
        setDevotionalDialog((prev) => ({ ...prev, visible: false }));
      },
    });
  };

  useEffect(() => {
    let timer: any;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  const handleSendDeletionOtp = async () => {
    const rawPhone = profile?.phoneNumber || currentUser?.phoneNumber || currentUser?.phone;
    if (!rawPhone) {
      showAlert('Verification Error', 'Registered phone number not found. Please log in again.', undefined, 'error');
      return;
    }
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await ApiService.sendOtp(rawPhone, 'delete_account');
      if (res && res.error) {
        setDeleteError(res.error || 'Failed to send verification OTP');
      } else {
        setDeleteStep('OTP');
        setOtpCountdown(45);
      }
    } catch (err: any) {
      setDeleteError(err?.message || 'Failed to send verification OTP');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleConfirmDeletion = async () => {
    if (!deleteOtp || deleteOtp.trim().length < 4) {
      setDeleteError('Please enter the 6-digit OTP received on your mobile.');
      return;
    }
    const userId = currentUser?.id || profile?.id;
    if (!userId) {
      setDeleteError('Unable to identify user account. Please try again.');
      return;
    }
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await ApiService.requestAccountDeletion(userId, deleteOtp.trim(), deleteReason.trim());
      if (res && res.error) {
        setDeleteError(res.error || 'Invalid or expired OTP. Please try again.');
      } else {
        setDeleteSuccess(t('deletionSuccessMsg'));
        setTimeout(async () => {
          setDeleteModalVisible(false);
          await onLogout();
        }, 2200);
      }
    } catch (err: any) {
      setDeleteError(err?.message || 'Verification failed. Please check OTP.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const t = (key: string): string => {
    const dict = PROFILE_I18N[key];
    if (dict && dict[currentLanguage]) return dict[currentLanguage];
    if (dict && dict['en']) return dict['en'];
    return key;
  };

  // Load Dharma Kartha Live Data from DB API when active role is DHARMA_KARTHA
  useEffect(() => {
    if (activeRole === 'DHARMA_KARTHA') {
      const uid = currentUser?.id ? Number(currentUser.id) : null;
      if (!uid) {
        setDkLoading(false);
        return;
      }
      setDkLoading(true);
      Promise.all([
        ApiService.getDharmaKarthaProfile(uid),
        ApiService.getDharmaKarthaDashboard(uid),
        ApiService.getDharmaKarthaTemples(uid),
        ApiService.getDharmaKarthaEvents(uid),
        ApiService.getDharmaKarthaFestivals(uid),
        ApiService.getDharmaKarthaMedia(uid),
      ]).then(([prof, stats, temples, events, fests, media]) => {
        if (prof) setDkProfile(prof);
        if (Array.isArray(temples) && temples.length > 0) setDkTemples(temples);
        if (Array.isArray(events) && events.length > 0) setDkEvents(events);
        if (Array.isArray(fests) && fests.length > 0) setDkFestivals(fests);
        if (Array.isArray(media) && media.length > 0) setDkMedia(media);

        setDkStats({
          managedTemples: stats?.managedTemples ?? temples?.length ?? 0,
          activeFestivals: stats?.activeFestivals ?? fests?.length ?? 0,
          eventsCount: events?.length ?? 0,
          mediaCount: media?.length ?? 0,
        });
      }).catch(err => {
        console.warn('Failed to load Dharma Kartha dashboard data from DB API:', err);
      }).finally(() => {
        setDkLoading(false);
      });
    }
  }, [activeRole, currentUser?.id]);

  const fetchDkTemples = async () => {
    const uid = currentUser?.id ? Number(currentUser.id) : null;
    if (!uid) return;
    setLoadingTemples(true);
    try {
      const temples = await ApiService.getDharmaKarthaTemples(uid);
      if (Array.isArray(temples)) {
        setDkTemples(temples);
        setDkStats(prev => ({ ...prev, managedTemples: temples.length }));
      }
    } catch (err) {
      console.warn('Failed to fetch temples dynamically from DB:', err);
    } finally {
      setLoadingTemples(false);
    }
  };

  const handleOpenManageTemples = () => {
    setTemplesModalVisible(true);
    fetchDkTemples();
  };

  const handleSaveNewMandir = async () => {
    if (!newMandirName.trim()) {
      showAlert('Required Field', 'Please enter Temple Name.', undefined, 'warning');
      return;
    }
    if (!newMandirCity.trim()) {
      showAlert('Required Field', 'Please enter City / Town.', undefined, 'warning');
      return;
    }
    setSavingMandir(true);
    try {
      const classificationMap: Record<string, string> = {
        MAIN_TEMPLE: 'Main Temple',
        SUB_TEMPLE: 'Sub Temple',
        MULTI_TEMPLE: 'Multi-Deity Temple Complex',
        COMMUNITY_TEMPLE: 'Community Temple',
        HERITAGE_SHRINE: 'Heritage Shrine',
      };
      const classification = classificationMap[newMandirType] || 'Main Temple';

      const payload = {
        name: newMandirName.trim(),
        templeType: newMandirType,
        classification,
        alternateName: newMandirAltName.trim(),
        primaryDeity: newMandirDeity.trim() || 'Lord Ayyappa',
        state: newMandirState.trim() || 'Andhra Pradesh',
        city: newMandirCity.trim(),
        district: newMandirDistrict.trim(),
        address: newMandirAddress.trim(),
        shortDescription: newMandirSummary.trim(),
        about: newMandirAbout.trim(),
        history: newMandirHistory.trim(),
        speciality: newMandirSpeciality.trim(),
        officePhone: newMandirPhone.trim(),
        officialEmail: newMandirEmail.trim(),
        officialWebsite: newMandirWebsite.trim(),
      };

      const uid = currentUser?.id ? Number(currentUser.id) : null;
      if (!uid) {
        showAlert('Notice', 'Please sign in to register a temple.', undefined, 'info');
        setSavingMandir(false);
        return;
      }
      const res = await ApiService.createDharmaKarthaTemple(uid, payload);

      if (res && res.success === false) {
        showAlert('Registration Notice', res.message || 'Could not register temple in database.', undefined, 'warning');
        setSavingMandir(false);
        return;
      }

      // Dynamically fetch updated temples list directly from database via API response
      await fetchDkTemples();

      showAlert(
        'Registration Submitted 🙏',
        `"${newMandirName}" details have been stored dynamically in the database and submitted for Super Admin verification.`,
        undefined,
        'success'
      );
      setAddMandirModalVisible(false);
      // Reset form
      setNewMandirName('');
      setNewMandirAltName('');
      setNewMandirCity('');
      setNewMandirDistrict('');
      setNewMandirAddress('');
      setNewMandirSummary('');
      setNewMandirAbout('');
      setNewMandirHistory('');
      setNewMandirSpeciality('');
      setNewMandirPhone('');
      setNewMandirEmail('');
      setNewMandirWebsite('');
    } catch {
      showAlert('Error', 'Failed to register mandir.', undefined, 'error');
    } finally {
      setSavingMandir(false);
    }
  };

  const handleSaveNewEvent = async () => {
    if (!newEventTitle.trim()) {
      showAlert('Required Field', 'Please enter Event Title.', undefined, 'warning');
      return;
    }
    if (!newEventDateTime.trim()) {
      showAlert('Required Field', 'Please enter Date & Time.', undefined, 'warning');
      return;
    }
    setSavingEvent(true);
    try {
      const selectedTemple = dkTemples.find(t => t.id === newEventTempleId) || dkTemples[0];
      const templeId = selectedTemple?.id ? Number(selectedTemple.id) : 1;
      const payload = {
        templeId,
        title: newEventTitle.trim(),
        startDate: newEventDateTime.trim(),
        location: newEventLocation.trim() || 'Mandir Praakaram',
        description: newEventDesc.trim(),
        category: 'SEVA_PROGRAMME',
        status: 'PUBLISHED',
      };

      const res = await ApiService.createDharmaKarthaEvent(currentUser?.id ? Number(currentUser.id) : 1, payload);

      const createdEvt = {
        id: res?.event?.id || Date.now(),
        title: newEventTitle.trim(),
        date: newEventDateTime.trim(),
        time: 'Scheduled',
        location: newEventLocation.trim() || 'Mandir Praakaram',
        description: newEventDesc.trim(),
        templeId,
        templeName: selectedTemple?.name || 'Registered Mandir',
        category: 'SEVA_PROGRAMME',
        status: 'PUBLISHED',
      };

      setDkEvents(prev => [createdEvt, ...prev]);
      setDkStats(prev => ({ ...prev, eventsCount: prev.eventsCount + 1 }));
      showAlert('Event Published 🙏', `"${newEventTitle}" has been scheduled successfully.`, undefined, 'success');
      setAddEventModalVisible(false);
      // Reset form
      setNewEventTitle('');
      setNewEventDateTime('');
      setNewEventLocation('');
      setNewEventDesc('');
    } catch {
      showAlert('Error', 'Failed to schedule event.', undefined, 'error');
    } finally {
      setSavingEvent(false);
    }
  };

  const fetchDkFestivals = async () => {
    const uid = currentUser?.id ? Number(currentUser.id) : 1;
    setLoadingFestivals(true);
    try {
      const fests = await ApiService.getDharmaKarthaFestivals(uid);
      if (Array.isArray(fests)) {
        setDkFestivals(fests);
        setDkStats(prev => ({ ...prev, activeFestivals: fests.length }));
      }
    } catch (err) {
      console.warn('Failed to fetch Dharma Kartha festivals:', err);
    } finally {
      setLoadingFestivals(false);
    }
  };

  const handleOpenManageFestivals = () => {
    setFestivalsModalVisible(true);
    fetchDkFestivals();
  };

  const handleOpenAddFestival = () => {
    setNewFestivalTempleId(dkTemples[0]?.id || null);
    setNewFestivalName('');
    setNewFestivalPeriod('');
    setNewFestivalDesc('');
    setNewFestivalSeva('');
    setAddFestivalModalVisible(true);
  };

  const handleSaveNewFestival = async () => {
    if (!newFestivalName.trim()) {
      showAlert('Required Field', 'Please enter Festival Name.', undefined, 'warning');
      return;
    }
    if (!newFestivalPeriod.trim()) {
      showAlert('Required Field', 'Please enter Festival Period / Occasion.', undefined, 'warning');
      return;
    }
    const selectedTemple = dkTemples.find(t => t.id === newFestivalTempleId) || dkTemples[0];
    const templeId = selectedTemple?.id ? Number(selectedTemple.id) : 1;

    setSavingFestival(true);
    try {
      const uid = currentUser?.id ? Number(currentUser.id) : null;
      if (!uid) {
        showAlert('Notice', 'Please sign in to register a temple.', undefined, 'info');
        setSavingMandir(false);
        return;
      }
      const payload = {
        templeId,
        name: newFestivalName.trim(),
        period: newFestivalPeriod.trim(),
        description: newFestivalDesc.trim(),
        specialPoojaInfo: newFestivalSeva.trim(),
        category: 'MAHOTSAVAM',
      };

      const res = await ApiService.createDharmaKarthaFestival(uid, payload);
      if (res && res.success === false) {
        showAlert('Notice', res.message || 'Could not save festival in database.', undefined, 'warning');
        setSavingFestival(false);
        return;
      }

      await fetchDkFestivals();

      showAlert(
        'Festival Published 🙏',
        `"${newFestivalName}" has been added to ${selectedTemple?.name || 'the temple'} and saved to the database.`,
        undefined,
        'success'
      );
      setAddFestivalModalVisible(false);
      setNewFestivalName('');
      setNewFestivalPeriod('');
      setNewFestivalDesc('');
      setNewFestivalSeva('');
    } catch {
      showAlert('Error', 'Failed to publish festival.', undefined, 'error');
    } finally {
      setSavingFestival(false);
    }
  };

  const handleOpenEditTemple = (temple: any) => {
    setEditingTempleId(temple.id);
    const resolvedType = temple.templeType || (
      temple.classification === 'Sub Temple' ? 'SUB_TEMPLE' :
        temple.classification === 'Multi-Deity Temple Complex' ? 'MULTI_TEMPLE' :
          temple.classification === 'Community Temple' ? 'COMMUNITY_TEMPLE' :
            temple.classification === 'Heritage Shrine' ? 'HERITAGE_SHRINE' : 'MAIN_TEMPLE'
    );
    setEditMandirType(resolvedType);
    setEditMandirName(temple.name || '');
    setEditMandirAltName(temple.alternateName || '');
    setEditMandirDeity(temple.primaryDeity || 'Lord Ayyappa');
    setEditMandirState(temple.state || 'Andhra Pradesh');
    setEditMandirCity(temple.city || '');
    setEditMandirDistrict(temple.district || '');
    setEditMandirAddress(temple.address || '');
    setEditMandirSummary(temple.shortDescription || '');
    setEditMandirAbout(temple.about || '');
    setEditMandirHistory(temple.history || '');
    setEditMandirSpeciality(temple.speciality || '');
    setEditMandirPhone(temple.officePhone || '');
    setEditMandirEmail(temple.officialEmail || '');
    setEditMandirWebsite(temple.officialWebsite || '');
    setEditMandirModalVisible(true);
  };

  const handleSaveEditTemple = async () => {
    if (!editMandirName.trim()) {
      showAlert('Required Field', 'Please enter Temple Name.', undefined, 'warning');
      return;
    }
    if (!editMandirCity.trim()) {
      showAlert('Required Field', 'Please enter City / Town.', undefined, 'warning');
      return;
    }
    if (!editingTempleId) return;

    setSavingEditMandir(true);
    try {
      const classificationMap: Record<string, string> = {
        MAIN_TEMPLE: 'Main Temple',
        SUB_TEMPLE: 'Sub Temple',
        MULTI_TEMPLE: 'Multi-Deity Temple Complex',
        COMMUNITY_TEMPLE: 'Community Temple',
        HERITAGE_SHRINE: 'Heritage Shrine',
      };
      const classification = classificationMap[editMandirType] || 'Main Temple';

      const payload = {
        name: editMandirName.trim(),
        templeType: editMandirType,
        classification,
        alternateName: editMandirAltName.trim(),
        primaryDeity: editMandirDeity.trim() || 'Lord Ayyappa',
        state: editMandirState.trim() || 'Andhra Pradesh',
        city: editMandirCity.trim(),
        district: editMandirDistrict.trim(),
        address: editMandirAddress.trim(),
        shortDescription: editMandirSummary.trim(),
        about: editMandirAbout.trim(),
        history: editMandirHistory.trim(),
        speciality: editMandirSpeciality.trim(),
        officePhone: editMandirPhone.trim(),
        officialEmail: editMandirEmail.trim(),
        officialWebsite: editMandirWebsite.trim(),
      };

      const uid = currentUser?.id ? Number(currentUser.id) : null;
      if (!uid) {
        showAlert('Notice', 'Please sign in to register a temple.', undefined, 'info');
        setSavingMandir(false);
        return;
      }
      await ApiService.updateDharmaKarthaTemple(uid, editingTempleId, payload);
      await fetchDkTemples();

      showAlert('Temple Updated 🙏', `"${editMandirName}" details have been updated successfully.`, undefined, 'success');
      setEditMandirModalVisible(false);
    } catch {
      showAlert('Error', 'Failed to update temple details.', undefined, 'error');
    } finally {
      setSavingEditMandir(false);
    }
  };

  const handleOpenDeleteTemple = (temple: any) => {
    setDeletingTemple(temple);
    setTempleDeleteReason('');
    setDeleteMandirModalVisible(true);
  };

  const handleConfirmTempleDeletion = async () => {
    if (!deletingTemple?.id) return;
    if (!templeDeleteReason.trim()) {
      showAlert('Required', 'Please enter the reason for temple deletion / archive.', undefined, 'warning');
      return;
    }
    setDeletingTempleLoading(true);
    try {
      const uid = currentUser?.id ? Number(currentUser.id) : null;
      if (!uid) {
        showAlert('Notice', 'Please sign in to register a temple.', undefined, 'info');
        setSavingMandir(false);
        return;
      }
      await ApiService.requestTempleDeletion(uid, deletingTemple.id, templeDeleteReason.trim());
      await ApiService.deleteDharmaKarthaTemple(uid, deletingTemple.id);
      await fetchDkTemples();

      showAlert('Mandir Deleted 🙏', `"${deletingTemple.name}" has been deleted successfully.`, undefined, 'success');
      setDeleteMandirModalVisible(false);
      setDeletingTemple(null);
    } catch {
      showAlert('Error', 'Failed to delete mandir.', undefined, 'error');
    } finally {
      setDeletingTempleLoading(false);
    }
  };

  const fetchDkEvents = async () => {
    const uid = currentUser?.id ? Number(currentUser.id) : 1;
    setLoadingEvents(true);
    try {
      const events = await ApiService.getDharmaKarthaEvents(uid);
      if (Array.isArray(events)) {
        setDkEvents(events);
        setDkStats(prev => ({ ...prev, eventsCount: events.length }));
      }
    } catch (err) {
      console.warn('Failed to fetch events:', err);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleOpenManageEvents = () => {
    setEventsModalVisible(true);
    fetchDkEvents();
  };

  const fetchDkMedia = async () => {
    const uid = currentUser?.id ? Number(currentUser.id) : 1;
    setLoadingMedia(true);
    try {
      const media = await ApiService.getDharmaKarthaMedia(uid);
      if (Array.isArray(media)) {
        setDkMedia(media);
        setDkStats(prev => ({ ...prev, mediaCount: media.length }));
      }
    } catch (err) {
      console.warn('Failed to fetch media:', err);
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleOpenManageGallery = () => {
    setGalleryModalVisible(true);
    fetchDkMedia();
  };

  const handleDeleteFestival = (fest: any) => {
    showConfirm(
      'Delete Festival',
      `Are you sure you want to delete "${fest.name}"? This action cannot be undone.`,
      async () => {
        try {
          const uid = currentUser?.id ? Number(currentUser.id) : null;
          if (!uid) {
            showAlert('Notice', 'Please sign in to manage temple festivals.', undefined, 'info');
            return;
          }
          await ApiService.deleteDharmaKarthaFestival(uid, fest.id);
          await fetchDkFestivals();
          showAlert('Festival Deleted 🙏', `"${fest.name}" has been deleted successfully.`, undefined, 'success');
        } catch {
          showAlert('Error', 'Failed to delete festival.', undefined, 'error');
        }
      },
      { confirmText: 'Delete', cancelText: 'Cancel', isDestructive: true }
    );
  };

  const handleDeleteEvent = (evt: any) => {
    showConfirm(
      'Delete Event',
      `Are you sure you want to delete "${evt.title}"? This action cannot be undone.`,
      async () => {
        try {
          const uid = currentUser?.id ? Number(currentUser.id) : null;
          if (!uid) {
            showAlert('Notice', 'Please sign in to manage events.', undefined, 'info');
            return;
          }
          await ApiService.deleteDharmaKarthaEvent(uid, evt.id);
          await fetchDkEvents();
          showAlert('Event Deleted 🙏', `"${evt.title}" has been deleted successfully.`, undefined, 'success');
        } catch {
          showAlert('Error', 'Failed to delete event.', undefined, 'error');
        }
      },
      { confirmText: 'Delete', cancelText: 'Cancel', isDestructive: true }
    );
  };

  const handleDeleteMedia = (m: any) => {
    showConfirm(
      'Delete Photo',
      `Are you sure you want to delete this photo "${m.title || m.caption || 'Photo'}"? This action cannot be undone.`,
      async () => {
        try {
          const uid = currentUser?.id ? Number(currentUser.id) : null;
          if (!uid) {
            showAlert('Notice', 'Please sign in to manage photos.', undefined, 'info');
            return;
          }
          await ApiService.deleteDharmaKarthaMedia(uid, m.id);
          await fetchDkMedia();
          showAlert('Photo Deleted 🙏', 'Photo has been deleted successfully.', undefined, 'success');
        } catch {
          showAlert('Error', 'Failed to delete photo.', undefined, 'error');
        }
      },
      { confirmText: 'Delete', cancelText: 'Cancel', isDestructive: true }
    );
  };

  // Mask Phone Number safely: +91XXXXXX0218
  const getMaskedPhone = (phone?: string | null): string => {
    if (!phone) return '';
    const clean = phone.replace(/[^0-9+]/g, '');
    if (clean.length >= 10) {
      const last4 = clean.slice(-4);
      const prefix = clean.startsWith('+') ? clean.slice(0, 3) : '+91';
      return `${prefix}XXXXXX${last4}`;
    }
    return phone;
  };

  // Load Real Profile Data (Strictly bound to authenticated currentUser)
  useEffect(() => {
    let isMounted = true;
    async function loadDevoteeProfile() {
      if (!currentUser?.id) {
        setProfile(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await ApiService.getDevoteeProfile(currentUser.id, currentLanguage);
        if (data && isMounted) {
          setProfile(data);
        }
      } catch (err) {
        // Devotee profile error
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadDevoteeProfile();
    return () => {
      isMounted = false;
    };
  }, [currentLanguage, currentUser]);

  // Fetch available languages strictly from DB via API
  const fetchDbLanguages = async () => {
    setLoadingLanguages(true);
    try {
      const langs = await ApiService.getLanguages();
      if (Array.isArray(langs) && langs.length > 0) {
        setAvailableLanguages(langs);
      }
    } catch (e) {
      console.warn('Failed to fetch languages dynamically from DB API:', e);
    } finally {
      setLoadingLanguages(false);
    }
  };

  useEffect(() => {
    fetchDbLanguages();
  }, []);

  const handleOpenLanguageModal = () => {
    setPreferencesModalVisible(true);
    fetchDbLanguages();
  };

  const handleSelectLanguage = async (langCode: string) => {
    const targetLang = langCode as SupportedLanguage;
    setSwitchingLanguage(true);
    try {
      // 1. Store language preference locally
      await StorageService.setStoredLanguage(targetLang);

      // 2. Persist language preference in DB via API
      if (currentUser?.id) {
        try {
          await ApiService.updateUserPreferences(Number(currentUser.id), { preferredLang: targetLang });
        } catch (e) {
          console.warn('Failed to update language preference in DB:', e);
        }
      }

      // 3. Fetch localized data dynamically completely from DB via API for this new language
      try {
        await Promise.allSettled([
          currentUser?.id ? ApiService.getDevoteeProfile(currentUser.id, targetLang) : Promise.resolve(null),
          ApiService.getCategories(targetLang),
          ApiService.getTemples(targetLang),
        ]);
      } catch (e) {
        console.warn('Failed to fetch data dynamically in new language:', e);
      }

      // 4. Notify app root / parent to switch active language across all screens
      onLanguageChange?.(targetLang);

      // 5. If logged in, re-fetch profile data in new language to update screen state immediately
      if (currentUser?.id) {
        try {
          const updatedProfile = await ApiService.getDevoteeProfile(currentUser.id, targetLang);
          if (updatedProfile) {
            setProfile(updatedProfile);
          }
        } catch (e) { }
      }
    } finally {
      setSwitchingLanguage(false);
      setPreferencesModalVisible(false);
    }
  };

  // Load Bookmarks dynamically from DB via API response
  const handleOpenBookmarks = async () => {
    setBookmarksModalVisible(true);
    setBookmarksLoading(true);
    const userId = currentUser?.id ? Number(currentUser.id) : undefined;
    if (userId) {
      try {
        const dbBookmarks = await ApiService.getUserBookmarks(userId);
        if (Array.isArray(dbBookmarks)) {
          setBookmarks(dbBookmarks);
          setBookmarksLoading(false);
          return;
        }
      } catch (e) {
        console.warn('Failed to load bookmarks from DB API:', e);
      }
    }
    const saved = await StorageService.getBookmarks();
    setBookmarks(saved || []);
    setBookmarksLoading(false);
  };

  // Refresh Profile & Mandir Data dynamically from DB
  const handleRefreshProfile = async () => {
    setRefreshingProfile(true);
    try {
      if (currentUser?.id) {
        const freshProfile = await ApiService.getDevoteeProfile(currentUser.id, currentLanguage);
        if (freshProfile) {
          setProfile(freshProfile);
        }
      }
      if (activeRole === 'DHARMA_KARTHA') {
        await fetchDkTemples();
      }
    } catch (e) {
      console.warn('Refresh profile error:', e);
    } finally {
      setRefreshingProfile(false);
    }
  };

  // Avatar Management: dynamically select, upload to DB and update state
  const handleOpenAvatarModal = () => {
    if (isGuest) {
      if (onOpenAuth) onOpenAuth();
      else if (onOpenEditProfile) onOpenEditProfile();
      return;
    }
    setAvatarModalOpen(true);
  };

  const handleCaptureAvatarCamera = async () => {
    setAvatarModalOpen(false);
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        showAlert('Permission Needed', 'Camera permission is required to capture your profile photo.', undefined, 'info');
        return;
      }
      const res = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        await handleSaveAvatar(res.assets[0]);
      }
    } catch (err: any) {
      showAlert('Error', err?.message || 'Failed to capture photo.', undefined, 'error');
    }
  };

  const handlePickAvatarGallery = async () => {
    setAvatarModalOpen(false);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        showAlert('Permission Needed', 'Photo gallery permission is required to select your profile picture.', undefined, 'info');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        await handleSaveAvatar(res.assets[0]);
      }
    } catch (err: any) {
      showAlert('Error', err?.message || 'Failed to select image.', undefined, 'error');
    }
  };

  const handleSaveAvatar = async (asset: ImagePicker.ImagePickerAsset) => {
    const userId = currentUser?.id ? Number(currentUser.id) : (profile?.id ? Number(profile.id) : null);
    if (!userId) {
      showAlert('Login Required', 'Please log in to update your profile photo.', undefined, 'info');
      return;
    }
    const base64Data = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
    setUploadingAvatar(true);
    try {
      const uploadRes = await ApiService.uploadDevoteePhoto(userId, base64Data);
      const finalUrl = (typeof uploadRes === 'string' ? uploadRes : (uploadRes as any)?.profileImageUrl) || base64Data;

      await ApiService.updateDevoteeProfile(userId, { profileImageUrl: finalUrl });

      setProfile((prev: any) => (prev ? { ...prev, profileImageUrl: finalUrl } : { profileImageUrl: finalUrl } as any));
      if (dkProfile) {
        setDkProfile((prev: any) => (prev ? { ...prev, profileImageUrl: finalUrl } : prev));
      }

      await StorageService.setStoredUser({
        ...(currentUser || {}),
        profileImageUrl: finalUrl,
      });

      showAlert('Profile Photo Updated 🙏', 'Your profile picture has been updated successfully and saved.');
    } catch {
      setProfile((prev: any) => (prev ? { ...prev, profileImageUrl: base64Data } : { profileImageUrl: base64Data } as any));
      showAlert('Profile Photo Updated 🙏', 'Your profile picture has been updated successfully.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Hardware Back Press
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (logoutModalVisible) {
        setLogoutModalVisible(false);
        return true;
      }
      if (deleteModalVisible) {
        setDeleteModalVisible(false);
        return true;
      }
      if (bookmarksModalVisible) {
        setBookmarksModalVisible(false);
        return true;
      }
      if (preferencesModalVisible) {
        setPreferencesModalVisible(false);
        return true;
      }
      if (legalModalVisible) {
        setLegalModalVisible(false);
        return true;
      }
      if (onBack) {
        onBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [logoutModalVisible, deleteModalVisible, bookmarksModalVisible, preferencesModalVisible, legalModalVisible, onBack]);

  const isGuest = !currentUser;
  const rawFullName = profile?.fullName || currentUser?.fullName || currentUser?.name || (currentUser?.email ? currentUser.email.split('@')[0] : '');
  const displayName = isGuest
    ? t('guestDevotee')
    : (rawFullName && !rawFullName.startsWith('Devotee #'))
      ? rawFullName
      : (profile?.phoneNumber || currentUser?.phoneNumber || currentUser?.phone || (isDharmaKartha ? 'Dharma Kartha' : 'Devotee'));
  const fullPhone = profile?.phoneNumber || currentUser?.phoneNumber || currentUser?.phone;
  const displayPhone = isGuest
    ? t('guestModeSubtitle')
    : fullPhone || currentUser?.email || '';

  const photoUri = profile?.profileImageUrl || currentUser?.profileImageUrl;
  const avatarSource = photoUri ? { uri: photoUri } : DEFAULT_AVATAR;

  const handleConfirmLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setLoggingOut(false);
      setLogoutModalVisible(false);
    }
  };

  // If active role is DHARMA_KARTHA, render dynamic Dharma Kartha Dashboard matching web portal
  if (activeRole === 'DHARMA_KARTHA') {
    return (
      <DharmaKarthaDashboardScreen
        currentLanguage={currentLanguage}
        currentUser={currentUser}
        onOpenEditProfile={onOpenEditProfile}
        onOpenNotifications={onOpenNotifications}
        onOpenTerms={onOpenTerms}
        onOpenPrivacyPolicy={onOpenPrivacyPolicy}
        onOpenRefundPolicy={onOpenRefundPolicy}
        onOpenAbout={onOpenAbout}
        onLogout={onLogout}
        onSelectTempleDetail={(temple) => {
          const tData: TempleItem = {
            id: temple.slug || String(temple.id),
            dbId: temple.id,
            name: temple.name,
            originalName: temple.name,
            localNames: { en: temple.name, te: temple.name },
            deityId: 'ayyappa',
            deityName: temple.primaryDeity || 'Lord Ayyappa',
            city: temple.city,
            state: temple.state,
            country: 'India',
            address: temple.address,
            about: temple.about || temple.shortDescription || 'Newly submitted temple awaiting verification.',
            history: temple.history,
            speciality: temple.speciality ? [temple.speciality] : [],
            contact: temple.officePhone ? { phone: temple.officePhone, email: temple.officialEmail, website: temple.officialWebsite } : undefined,
            timings: (temple as any).timings,
            heroImageUrl: temple.heroImageUrl,
            thumbnailUrl: temple.heroImageUrl,
            isActive: true,
          };
          onNavigateDestination?.(
            'temple_detail',
            { id: temple.slug || String(temple.id), title: temple.name },
            tData
          );
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0C251E" translucent={false} />

      {/* Devotional Header matching reference screenshot */}
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
          {onBack ? (
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={onBack}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <BackArrowIcon />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerIconBtnSpacer} />
          )}

          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>{t('screenTitle')}</Text>
          </View>

          <View style={styles.headerIconBtnSpacer} />
        </View>

        {/* Golden Bottom Separator Line */}
        <LinearGradient
          colors={['transparent', '#F5CF78', '#DFA62E', '#F5CF78', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.goldSeparator}
        />
      </LinearGradient>

      {/* Body: Profile Card + 6 Menu Rows */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshingProfile}
            onRefresh={handleRefreshProfile}
            colors={['#8B1D24', '#DFA62E']}
            tintColor="#8B1D24"
          />
        }
      >
        {/* Top Profile Summary Card */}
        <View style={styles.profileSummaryCard}>
          {/* Circular Avatar with Gold Ornamental Border & Dynamic Change Badge */}
          <TouchableOpacity
            style={styles.avatarContainer}
            activeOpacity={0.85}
            onPress={handleOpenAvatarModal}
            disabled={uploadingAvatar}
          >
            <View style={styles.avatarBorder}>
              {uploadingAvatar ? (
                <View style={[styles.avatarImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF7E6' }]}>
                  <ActivityIndicator size="small" color="#DFA62E" />
                </View>
              ) : (
                <Image source={avatarSource} style={styles.avatarImage} resizeMode="cover" />
              )}
            </View>
            <View style={styles.avatarCameraBadge}>
              <CameraBadgeIcon />
            </View>
          </TouchableOpacity>

          {/* User Information */}
          <View style={styles.profileInfoContainer}>
            <Text style={styles.devoteeName} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.devoteePhone}>{displayPhone}</Text>

            {/* Login / Register for Guest only (Edit Profile button removed since Row 1 below handles editing) */}
            {isGuest && (
              <TouchableOpacity
                style={styles.editProfileBtn}
                activeOpacity={0.8}
                onPress={onOpenAuth || onOpenEditProfile}
              >
                <PencilIcon />
                <Text style={styles.editProfileBtnText}>{t('loginRegister')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* SACRED DEVOTEE SPIRITUAL DETAILS CARD (Dynamic from Database) */}
        {!isGuest && (
          <View style={styles.devoteeDetailsCard}>
            <View style={styles.devoteeDetailsHeaderRow}>
              <View style={styles.devoteeDetailsHeaderTitleRow}>
                <Text style={{ fontSize: 16, marginRight: 6 }}>🕉️</Text>
                <Text style={styles.devoteeDetailsHeaderTitle}>
                  {currentLanguage === 'te' ? 'భక్తుని వివరాలు' : 'Sacred Devotee Details'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={onOpenEditProfile}
                style={styles.devoteeDetailsEditPill}
                activeOpacity={0.7}
              >
                <Text style={styles.devoteeDetailsEditText}>
                  {currentLanguage === 'te' ? 'సవరించండి ✏️' : 'Edit ✏️'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.devoteeDetailsGrid}>
              {/* Rashi */}
              <View style={styles.devoteeGridItem}>
                <Text style={styles.devoteeGridLabel}>{currentLanguage === 'te' ? 'రాశి (Zodiac)' : 'Rashi (Zodiac)'}</Text>
                <Text style={styles.devoteeGridValue} numberOfLines={1}>
                  {profile?.rashiName || currentUser?.rashiName || '—'}
                </Text>
              </View>

              {/* Nakshatram */}
              <View style={styles.devoteeGridItem}>
                <Text style={styles.devoteeGridLabel}>{currentLanguage === 'te' ? 'నక్షత్రం' : 'Nakshatram'}</Text>
                <Text style={styles.devoteeGridValue} numberOfLines={1}>
                  {profile?.nakshatraName || currentUser?.nakshatraName || '—'}
                </Text>
              </View>

              {/* DOB */}
              <View style={styles.devoteeGridItem}>
                <Text style={styles.devoteeGridLabel}>{currentLanguage === 'te' ? 'పుట్టిన తేదీ' : 'Date of Birth'}</Text>
                <Text style={styles.devoteeGridValue} numberOfLines={1}>
                  {profile?.dateOfBirth ? String(profile.dateOfBirth).split('T')[0] : (currentUser?.dateOfBirth ? String(currentUser.dateOfBirth).split('T')[0] : '—')}
                </Text>
              </View>

              {/* Gender */}
              <View style={styles.devoteeGridItem}>
                <Text style={styles.devoteeGridLabel}>{currentLanguage === 'te' ? 'లింగము' : 'Gender'}</Text>
                <Text style={styles.devoteeGridValue} numberOfLines={1}>
                  {profile?.gender || currentUser?.gender || '—'}
                </Text>
              </View>

              {/* Location */}
              <View style={styles.devoteeGridItem}>
                <Text style={styles.devoteeGridLabel}>{currentLanguage === 'te' ? 'స్థలం' : 'Location'}</Text>
                <Text style={styles.devoteeGridValue} numberOfLines={1}>
                  {[profile?.city || currentUser?.city, profile?.state || currentUser?.state].filter(Boolean).join(', ') || '—'}
                </Text>
              </View>

              {/* Devotee Since */}
              <View style={styles.devoteeGridItem}>
                <Text style={styles.devoteeGridLabel}>{currentLanguage === 'te' ? 'భక్తుని కాలం' : 'Devotee Since'}</Text>
                <Text style={styles.devoteeGridValue} numberOfLines={1}>
                  {profile?.devoteeSince || currentUser?.devoteeSince || 'Recent'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* DHARMA KARTHA SACRED TRUSTEE MANDIR DASHBOARD (Rendered exclusively for Dharma Kartha) */}
        {isDharmaKartha && (
          <View style={styles.dkTrusteeCard}>
            {/* Mandir Header */}
            <View style={styles.dkMandirHeaderRow}>
              <View style={styles.dkMandirIconBox}>
                <Text style={{ fontSize: 22 }}>🛕</Text>
              </View>
              <View style={styles.dkMandirTextBox}>
                <Text style={styles.dkMandirTitle} numberOfLines={1}>
                  {dkTemples[0]?.name || (currentLanguage === 'te' ? 'నమోదు చేసుకున్న మందిరం లేదు' : 'No Registered Mandir')}
                </Text>
                <Text style={styles.dkMandirSubtitle}>
                  {profile?.city || currentUser?.city ? `${profile?.city || currentUser?.city}` : (currentLanguage === 'te' ? 'ధర్మకర్త డాష్‌బోర్డ్' : 'Dharma Kartha Dashboard')}
                </Text>
              </View>
            </View>

            {/* Sacred Trustee Welcome Notice */}
            <Text style={styles.dkWelcomeNotice}>
              Welcome, Dharma Kartha <Text style={{ fontWeight: '700', color: '#0C251E' }}>{displayName}</Text>. From your sacred trustee dashboard, you can manage mandir darshan timings, update daily sevas, oversee voluntary devotee contributions, and publish festival schedules.
            </Text>

            {/* 4 KPIs Grid (Dynamic Live Data from DB API) */}
            <View style={styles.dkKpiGrid}>
              <View style={styles.dkKpiCard}>
                <Text style={styles.dkKpiNumber}>
                  {dkStats.managedTemples ?? dkTemples.length ?? 0}
                </Text>
                <Text style={styles.dkKpiLabel}>{t('regMandir')}</Text>
              </View>
              <View style={styles.dkKpiCard}>
                <Text style={styles.dkKpiNumber}>
                  {dkStats.activeFestivals ?? dkFestivals.length ?? 0}
                </Text>
                <Text style={styles.dkKpiLabel}>{t('templeFestivalsDb')}</Text>
              </View>
              <View style={styles.dkKpiCard}>
                <Text style={styles.dkKpiNumber}>
                  {dkStats.eventsCount ?? dkEvents.length ?? 0}
                </Text>
                <Text style={styles.dkKpiLabel}>{t('devotionalEventsDb')}</Text>
              </View>
              <View style={styles.dkKpiCard}>
                <Text style={styles.dkKpiNumber}>
                  {dkStats.mediaCount ?? dkMedia.length ?? 0}
                </Text>
                <Text style={styles.dkKpiLabel}>{t('sacredPhotosDb')}</Text>
              </View>
            </View>

            {/* 4 Quick Action Buttons */}
            <View style={styles.dkActionButtonsRow}>
              <TouchableOpacity
                style={styles.dkPrimaryActionBtn}
                activeOpacity={0.8}
                onPress={() => setAddMandirModalVisible(true)}
              >
                <Text style={styles.dkPrimaryActionBtnText}>➕ Add / Update Mandir</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dkSecondaryActionBtn}
                activeOpacity={0.8}
                onPress={handleOpenManageFestivals}
              >
                <Text style={styles.dkSecondaryActionBtnText}>🔥 Manage Festivals</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dkSecondaryActionBtn}
                activeOpacity={0.8}
                onPress={handleOpenManageEvents}
              >
                <Text style={styles.dkSecondaryActionBtnText}>📅 Manage Events</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dkSecondaryActionBtn}
                activeOpacity={0.8}
                onPress={handleOpenManageGallery}
              >
                <Text style={styles.dkSecondaryActionBtnText}>🖼️ Sacred Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 6 PROFILE MENU CARDS (Exact match with reference image) */}
        {/* 8 PROFILE MENU CARDS IN REQUESTED EXACT ORDER */}
        <View style={styles.menuListContainer}>
          {/* 1. Edit Profile */}
          <TouchableOpacity
            style={styles.menuCard}
            activeOpacity={0.8}
            onPress={onOpenEditProfile}
          >
            <View style={styles.menuIconContainer}>
              <PencilIcon />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>{t('editProfile')}</Text>
              <Text style={styles.menuSubtitle}>Manage sacred personal details</Text>
            </View>
            <View style={styles.chevronContainer}>
              <ChevronRightIcon />
            </View>
          </TouchableOpacity>

          {/* 2. My Bookmarks */}
          <TouchableOpacity
            style={styles.menuCard}
            activeOpacity={0.8}
            onPress={handleOpenBookmarks}
          >
            <View style={styles.menuIconContainer}>
              <MenuBookmarksIcon />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>{t('myBookmarks')}</Text>
              <Text style={styles.menuSubtitle}>{t('myBookmarksSubtitle')}</Text>
            </View>
            <View style={styles.chevronContainer}>
              <ChevronRightIcon />
            </View>
          </TouchableOpacity>

          {/* 3. Notifications */}
          <TouchableOpacity
            style={styles.menuCard}
            activeOpacity={0.8}
            onPress={onOpenNotifications}
          >
            <View style={styles.menuIconContainer}>
              <MenuNotificationsIcon />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>{t('notifications')}</Text>
              <Text style={styles.menuSubtitle}>{t('notificationsSubtitle')}</Text>
            </View>
            <View style={styles.chevronContainer}>
              <ChevronRightIcon />
            </View>
          </TouchableOpacity>

          {/* 4. App Language */}
          <TouchableOpacity
            style={styles.menuCard}
            activeOpacity={0.8}
            onPress={handleOpenLanguageModal}
          >
            <View style={styles.menuIconContainer}>
              <MenuPreferencesIcon />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>{t('appPreferences')}</Text>
              <Text style={styles.menuSubtitle}>{t('appPreferencesSubtitle')}</Text>
            </View>
            <View style={styles.chevronContainer}>
              <ChevronRightIcon />
            </View>
          </TouchableOpacity>

          {/* 5. Legal & Policies */}
          <TouchableOpacity
            style={styles.menuCard}
            activeOpacity={0.8}
            onPress={() => setLegalModalVisible(true)}
          >
            <View style={styles.menuIconContainer}>
              <MenuLegalIcon />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>{t('legalPolicies')}</Text>
              <Text style={styles.menuSubtitle}>{t('legalPoliciesSubtitle')}</Text>
            </View>
            <View style={styles.chevronContainer}>
              <ChevronRightIcon />
            </View>
          </TouchableOpacity>

          {/* 6. About */}
          <TouchableOpacity
            style={styles.menuCard}
            activeOpacity={0.8}
            onPress={onOpenAbout}
          >
            <View style={styles.menuIconContainer}>
              <MenuAboutIcon />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>{t('aboutApp')}</Text>
              <Text style={styles.menuSubtitle}>{APP_VERSION}</Text>
            </View>
            <View style={styles.chevronContainer}>
              <ChevronRightIcon />
            </View>
          </TouchableOpacity>

          {/* 7. Delete Account */}
          {!isGuest && (
            <TouchableOpacity
              style={[styles.menuCard, styles.deleteAccountCard]}
              activeOpacity={0.8}
              onPress={() => {
                setDeleteReason('');
                setDeleteOtp('');
                setDeleteError(null);
                setDeleteSuccess(null);
                setDeleteStep('REASON');
                setDeleteModalVisible(true);
              }}
            >
              <View style={styles.menuIconContainer}>
                <MenuDeleteAccountIcon />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={[styles.menuTitle, { color: '#B71C1C' }]}>{t('deleteAccount')}</Text>
                <Text style={styles.menuSubtitle}>{t('deleteAccountSubtitle')}</Text>
              </View>
              <View style={styles.chevronContainer}>
                <ChevronRightIcon />
              </View>
            </TouchableOpacity>
          )}

          {/* 8. Logout */}
          {!isGuest && (
            <TouchableOpacity
              style={styles.menuCard}
              activeOpacity={0.8}
              onPress={() => setLogoutModalVisible(true)}
            >
              <View style={styles.menuIconContainer}>
                <MenuLogoutIcon />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={[styles.menuTitle, { color: '#B71C1C' }]}>{t('logout')}</Text>
              </View>
              <View style={styles.chevronContainer}>
                <ChevronRightIcon />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* MODAL A: SCREEN 24 — LOGOUT CONFIRMATION (Matching approved reference) */}
      <Modal
        visible={logoutModalVisible}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <ImageBackground source={TEMPLE_BG} style={styles.logoutFullscreenBg} imageStyle={styles.logoutImageStyle} resizeMode="cover">
          <View style={styles.logoutDarkOverlay}>
            <SafeAreaView style={styles.logoutSafeArea}>
              <StatusBar barStyle="light-content" backgroundColor="#071914" translucent={false} />

              {/* Corner Filigree Ornaments */}
              <View style={styles.logoutTopOrnamentLeft}>
                <HeaderCornerFiligree />
              </View>
              <View style={styles.logoutTopOrnamentRight}>
                <HeaderCornerFiligree flipped />
              </View>

              {/* Top Back Arrow */}
              <View style={styles.logoutHeaderRow}>
                <TouchableOpacity
                  style={styles.headerIconBtn}
                  onPress={() => setLogoutModalVisible(false)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <BackArrowIcon />
                </TouchableOpacity>
              </View>

              {/* Centered Confirmation Dialog Card */}
              <View style={styles.logoutCenterWrapper}>
                <View style={styles.logoutCard}>
                  {/* Large Maroon Logout Icon */}
                  <View style={styles.logoutLargeIconBox}>
                    <MenuLogoutIcon size={40} color="#173D32" />
                  </View>

                  <Text style={styles.logoutCardTitle}>{t('logoutConfirmTitle')}</Text>

                  <GoldenLotusDivider />

                  <Text style={styles.logoutCardDesc}>{t('logoutConfirmDesc')}</Text>

                  <View style={styles.logoutButtonsRow}>
                    <TouchableOpacity
                      style={styles.logoutCancelBtn}
                      activeOpacity={0.8}
                      onPress={() => setLogoutModalVisible(false)}
                      disabled={loggingOut}
                    >
                      <Text style={styles.logoutCancelBtnText}>{t('cancel')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.logoutConfirmBtn}
                      activeOpacity={0.8}
                      onPress={handleConfirmLogout}
                      disabled={loggingOut}
                    >
                      {loggingOut ? (
                        <ActivityIndicator color="#FFFDF8" size="small" />
                      ) : (
                        <Text style={styles.logoutConfirmBtnText}>{t('logout')}</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </SafeAreaView>
          </View>
        </ImageBackground>
      </Modal>

      {/* MODAL B: MY BOOKMARKS */}
      <Modal
        visible={bookmarksModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBookmarksModalVisible(false)}
      >
        <View style={styles.modalOverlayBottom}>
          <View style={styles.bottomSheetCard}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetHeaderTitle}>{t('myBookmarks')}</Text>
              <TouchableOpacity
                onPress={() => setBookmarksModalVisible(false)}
                style={styles.closeBtn}
              >
                <CloseIcon />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.sheetBody}>
              {bookmarksLoading ? (
                <View style={{ paddingVertical: 32, alignItems: 'center', justifyContent: 'center' }}>
                  <ActivityIndicator size="small" color="#DFA62E" />
                  <Text style={{ marginTop: 8, fontSize: 13, color: '#5A4A3A' }}>Loading saved bookmarks from database...</Text>
                </View>
              ) : bookmarks.length === 0 ? (
                <View style={styles.emptyBookmarksBox}>
                  <MenuBookmarksIcon />
                  <Text style={styles.emptyBookmarksTitle}>No Saved Bookmarks Yet</Text>
                  <Text style={styles.emptyBookmarksSubtitle}>
                    Tap the Save / Bookmark icon while reading Slokas, Poojas or viewing Temples to keep them easily accessible here.
                  </Text>
                </View>
              ) : (
                bookmarks.map((b) => (
                  <TouchableOpacity
                    key={b.id}
                    style={styles.bookmarkItemCard}
                    onPress={() => {
                      setBookmarksModalVisible(false);
                      if (onNavigateDestination) {
                        onNavigateDestination(b.category === 'temple' ? 'temple_detail' : 'sloka_detail', { id: b.id, title: b.title });
                      }
                    }}
                  >
                    <View style={styles.bookmarkInfo}>
                      <Text style={styles.bookmarkItemTitle}>{b.title}</Text>
                      {b.subtitle && <Text style={styles.bookmarkItemSubtitle}>{b.subtitle}</Text>}
                    </View>
                    <ChevronRightIcon />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL C: APP PREFERENCES / APP LANGUAGE */}
      <Modal
        visible={preferencesModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!switchingLanguage) setPreferencesModalVisible(false);
        }}
      >
        <View style={styles.modalOverlayBottom}>
          <View style={styles.bottomSheetCard}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetHeaderTitle}>{t('appPreferences')}</Text>
              <TouchableOpacity
                onPress={() => setPreferencesModalVisible(false)}
                style={styles.closeBtn}
                disabled={switchingLanguage}
              >
                <CloseIcon />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.sheetBody}>
              {/* Language Selection */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <Text style={styles.preferenceSectionHeading}>Select Language</Text>
                {loadingLanguages && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="#8B1D24" style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 12, color: '#888', fontStyle: 'italic' }}>Loading from DB...</Text>
                  </View>
                )}
              </View>

              {switchingLanguage ? (
                <View style={{ paddingVertical: 32, alignItems: 'center', justifyContent: 'center' }}>
                  <ActivityIndicator size="large" color="#8B1D24" />
                  <Text style={{ marginTop: 12, fontSize: 14, color: '#666', fontWeight: '500' }}>
                    Updating language & fetching data from DB...
                  </Text>
                </View>
              ) : (
                <View style={styles.languagePillsGrid}>
                  {(availableLanguages.length > 0 ? availableLanguages : [
                    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
                    { code: 'en', name: 'English', nativeName: 'English' },
                    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
                    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
                    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
                  ]).map((l) => (
                    <TouchableOpacity
                      key={l.code}
                      style={[
                        styles.languagePill,
                        currentLanguage === l.code && styles.languagePillActive,
                      ]}
                      onPress={() => handleSelectLanguage(l.code)}
                    >
                      <Text
                        style={[
                          styles.languagePillText,
                          currentLanguage === l.code && styles.languagePillTextActive,
                        ]}
                      >
                        {l.nativeName ? `${l.nativeName} (${l.name})` : l.name || l.code}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL D: LEGAL & POLICIES */}
      <Modal
        visible={legalModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLegalModalVisible(false)}
      >
        <View style={styles.modalOverlayBottom}>
          <View style={styles.bottomSheetCard}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetHeaderTitle}>{t('legalPolicies')}</Text>
              <TouchableOpacity
                onPress={() => setLegalModalVisible(false)}
                style={styles.closeBtn}
              >
                <CloseIcon />
              </TouchableOpacity>
            </View>

            <View style={styles.sheetBody}>
              <TouchableOpacity
                style={styles.legalOptionRow}
                activeOpacity={0.8}
                onPress={() => {
                  setLegalModalVisible(false);
                  onOpenTerms();
                }}
              >
                <View style={styles.legalTextCol}>
                  <Text style={styles.legalTitle}>Terms & Conditions</Text>
                  <Text style={styles.legalSubtitle}>Read the terms of sacred devotional service</Text>
                </View>
                <ChevronRightIcon />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.legalOptionRow}
                activeOpacity={0.8}
                onPress={() => {
                  setLegalModalVisible(false);
                  onOpenPrivacyPolicy();
                }}
              >
                <View style={styles.legalTextCol}>
                  <Text style={styles.legalTitle}>Privacy Policy</Text>
                  <Text style={styles.legalSubtitle}>How devotee information and privacy are protected</Text>
                </View>
                <ChevronRightIcon />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.legalOptionRow}
                activeOpacity={0.8}
                onPress={() => {
                  setLegalModalVisible(false);
                  if (onOpenRefundPolicy) onOpenRefundPolicy();
                  else onOpenTerms();
                }}
              >
                <View style={styles.legalTextCol}>
                  <Text style={styles.legalTitle}>Refund & Cancellation Policy</Text>
                  <Text style={styles.legalSubtitle}>Official guidelines on temple donations & seva refunds</Text>
                </View>
                <ChevronRightIcon />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL E: DEVOTIONAL ACCOUNT DELETION WITH OTP VERIFICATION */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!deleteLoading) setDeleteModalVisible(false);
        }}
      >
        <View style={styles.modalOverlayBottom}>
          <View style={styles.bottomSheetCard}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetHeaderTitle, { color: '#B71C1C' }]}>
                {t('deleteAccountModalTitle')}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (!deleteLoading) setDeleteModalVisible(false);
                }}
                style={styles.closeBtn}
                disabled={deleteLoading}
              >
                <CloseIcon />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.sheetBody}>
              {/* Devotional Warning Notice */}
              <View style={styles.deleteWarningBox}>
                <Text style={styles.deleteWarningTitle}>⚠️ Sacred Notice</Text>
                <Text style={styles.deleteWarningDesc}>{t('deleteWarningMsg')}</Text>
              </View>

              {deleteError && (
                <View style={styles.deleteErrorBox}>
                  <Text style={styles.deleteErrorText}>{deleteError}</Text>
                </View>
              )}

              {deleteSuccess && (
                <View style={styles.deleteSuccessBox}>
                  <Text style={styles.deleteSuccessText}>{deleteSuccess}</Text>
                </View>
              )}

              {deleteStep === 'REASON' ? (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.deleteInputLabel}>{t('reasonPlaceholder')}</Text>
                  
                  {/* Industry-Level Quick Reason Selection Chips */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', gap: 6, paddingVertical: 2 }}>
                      {[
                        'No longer using this account',
                        'Privacy and data concerns',
                        'Too many SMS / alerts',
                        'Created duplicate account',
                        'Other reason',
                      ].map((r) => {
                        const isSelected = deleteReason.startsWith(r);
                        return (
                          <TouchableOpacity
                            key={r}
                            onPress={() => setDeleteReason(r)}
                            style={[
                              styles.deityChip,
                              isSelected && { backgroundColor: '#B71C1C', borderColor: '#B71C1C' },
                            ]}
                          >
                            <Text style={[styles.deityChipText, isSelected && { color: '#FFFFFF', fontWeight: '700' }]}>
                              {r}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </ScrollView>

                  <TextInput
                    style={styles.deleteReasonInput}
                    placeholder="Enter or customize reason for account deletion..."
                    placeholderTextColor="#A1887F"
                    multiline
                    numberOfLines={3}
                    value={deleteReason}
                    onChangeText={setDeleteReason}
                    editable={!deleteLoading}
                  />

                  <View style={styles.phoneVerificationRow}>
                    <Text style={styles.phoneVerificationLabel}>Registered Phone:</Text>
                    <Text style={styles.phoneVerificationValue}>{displayPhone}</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.deletePrimaryBtn, deleteLoading && { opacity: 0.7 }]}
                    activeOpacity={0.8}
                    onPress={handleSendDeletionOtp}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <ActivityIndicator color="#FFFDF8" size="small" />
                    ) : (
                      <Text style={styles.deletePrimaryBtnText}>{t('sendVerificationOtp')}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.deleteOtpHeading}>{t('enterOtpTitle')}</Text>
                  <Text style={styles.deleteOtpSub}>
                    {t('otpSentTo')}{' '}
                    <Text style={{ fontWeight: '700', color: '#0C251E' }}>{displayPhone}</Text>
                  </Text>

                  <TextInput
                    style={styles.deleteOtpInput}
                    placeholder="• • • • • •"
                    placeholderTextColor="#C4A482"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={deleteOtp}
                    onChangeText={(val) => {
                      setDeleteOtp(val);
                      if (deleteError) setDeleteError(null);
                    }}
                    editable={!deleteLoading}
                    textAlign="center"
                  />

                  {/* Resend OTP countdown row */}
                  <View style={styles.resendRow}>
                    {otpCountdown > 0 ? (
                      <Text style={styles.resendCountdownText}>
                        Resend OTP in <Text style={{ fontWeight: '700' }}>{otpCountdown}s</Text>
                      </Text>
                    ) : (
                      <TouchableOpacity
                        onPress={handleSendDeletionOtp}
                        disabled={deleteLoading}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.resendLinkText}>{t('resendOtp')}</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[styles.deleteConfirmBtn, deleteLoading && { opacity: 0.7 }]}
                    activeOpacity={0.8}
                    onPress={handleConfirmDeletion}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <ActivityIndicator color="#FFFDF8" size="small" />
                    ) : (
                      <Text style={styles.deletePrimaryBtnText}>{t('confirmDeleteAction')}</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteBackBtn}
                    onPress={() => {
                      setDeleteStep('REASON');
                      setDeleteError(null);
                    }}
                    disabled={deleteLoading}
                  >
                    <Text style={styles.deleteBackBtnText}>Back to Reason</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ==================== DHARMA KARTHA MODAL 1: TEMPLES LIST ==================== */}
      <Modal
        visible={templesModalVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setTemplesModalVisible(false)}
      >
        <SafeAreaView style={styles.dkModalSafeArea}>
          <StatusBar barStyle="light-content" backgroundColor="#0C251E" translucent={false} />
          <View style={styles.dkModalHeader}>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => setTemplesModalVisible(false)}
            >
              <BackArrowIcon />
            </TouchableOpacity>
            <Text style={styles.dkModalHeaderTitle}>Manage Your Temples</Text>
            <TouchableOpacity
              style={styles.dkAddSmallBtn}
              onPress={() => {
                setTemplesModalVisible(false);
                setAddMandirModalVisible(true);
              }}
            >
              <Text style={styles.dkAddSmallBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.dkModalBody}
            contentContainerStyle={{ padding: 16 }}
            refreshControl={
              <RefreshControl
                refreshing={loadingTemples}
                onRefresh={fetchDkTemples}
                tintColor="#E29E38"
                colors={['#E29E38', '#047857']}
              />
            }
          >
            {loadingTemples && dkTemples.length === 0 ? (
              <View style={[styles.dkEmptyStateBox, { paddingVertical: 40 }]}>
                <ActivityIndicator size="large" color="#E29E38" />
                <Text style={{ marginTop: 12, fontSize: 13, color: '#6B7280', fontWeight: '600' }}>
                  Fetching holy shrines from database...
                </Text>
              </View>
            ) : dkTemples.length === 0 ? (
              <View style={styles.dkEmptyStateBox}>
                <Text style={{ fontSize: 36, marginBottom: 8 }}>🛕</Text>
                <Text style={styles.dkEmptyStateTitle}>No Temples Registered Yet</Text>
                <Text style={styles.dkEmptyStateDesc}>
                  Register your first mandir to manage darshan, aarti timings, and pooja schedules.
                </Text>
                <TouchableOpacity
                  style={styles.dkPrimaryActionBtn}
                  onPress={() => {
                    setTemplesModalVisible(false);
                    setAddMandirModalVisible(true);
                  }}
                >
                  <Text style={styles.dkPrimaryActionBtnText}>➕ Register Temple</Text>
                </TouchableOpacity>
              </View>
            ) : (
              dkTemples.map((temple: any, idx: number) => (
                <View key={temple.id || idx} style={styles.dkItemCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={[styles.dkItemTitle, { flex: 1, marginRight: 8 }]}>{temple.name}</Text>
                    <View style={styles.dkStatusBadge}>
                      <Text style={styles.dkStatusBadgeText}>{temple.status || 'PUBLISHED'}</Text>
                    </View>
                  </View>
                  <Text style={styles.dkItemSubtitle}>
                    🛕 Deity: {temple.primaryDeity || 'Lord Ayyappa'} • {temple.city || 'Hyderabad'}, {temple.state || 'Telangana'}
                  </Text>
                  {temple.classification && (
                    <Text style={{ fontSize: 11.5, color: '#047857', fontWeight: '600', marginBottom: 4 }}>
                      Classification: {temple.classification}
                    </Text>
                  )}
                  {temple.address && (
                    <Text style={styles.dkItemDetailText} numberOfLines={2}>{temple.address}</Text>
                  )}

                  {/* Actions Row: Dynamic Edit & Delete Buttons */}
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 12, borderTopWidth: 1, borderTopColor: '#F0E6D6', paddingTop: 10, justifyContent: 'flex-end' }}>
                    <TouchableOpacity
                      style={styles.templeEditBtn}
                      activeOpacity={0.75}
                      onPress={() => handleOpenEditTemple(temple)}
                    >
                      <Text style={styles.templeEditBtnText}>✏️ Edit Details</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.templeDeleteBtn}
                      activeOpacity={0.75}
                      onPress={() => handleOpenDeleteTemple(temple)}
                    >
                      <Text style={styles.templeDeleteBtnText}>🗑️ Delete Shrine</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ==================== DHARMA KARTHA MODAL 1B: EDIT TEMPLE ==================== */}
      <Modal
        visible={editMandirModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditMandirModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.dkAddModalCard, { maxHeight: '92%', padding: 18 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <Text style={{ fontSize: 20 }}>✏️</Text>
                  <Text style={[styles.dkAddModalTitle, { textAlign: 'left', marginBottom: 0, fontSize: 18 }]}>
                    Update Temple Details
                  </Text>
                </View>
                <Text style={{ fontSize: 11.5, color: '#6B7280', lineHeight: 16 }}>
                  Update sanctum details, administrative contacts, and heritage notes.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setEditMandirModalVisible(false)}
                style={{ padding: 4 }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <CloseIcon />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={true} contentContainerStyle={{ paddingBottom: 24 }}>
              {/* SECTION 1: Temple Identity & Classification */}
              <View style={styles.mandirSectionBox}>
                <View style={styles.mandirSectionHeader}>
                  <Text style={styles.mandirSectionTitle}>🏛️ 1. Temple Identity &amp; Classification</Text>
                </View>

                <Text style={styles.inputLabel}>Temple Classification / Type *</Text>
                {(() => {
                  const classificationList = [
                    { id: 'MAIN_TEMPLE', title: 'Main Temple', desc: 'Primary institutional shrine with full sanctum and daily scheduled poojas.' },
                    { id: 'SUB_TEMPLE', title: 'Sub Temple', desc: 'Branch temple or subsidiary shrine affiliated to a central trust.' },
                    { id: 'MULTI_TEMPLE', title: 'Multi-Deity Temple Complex', desc: 'Grand religious complex housing multiple sanctums and deities.' },
                    { id: 'COMMUNITY_TEMPLE', title: 'Community Temple', desc: 'Locally organized bhajana mandiram or residential colony shrine.' },
                    { id: 'HERITAGE_SHRINE', title: 'Heritage Shrine', desc: 'Ancient historic pilgrimage site or forest shrine.' },
                  ];
                  const sel = classificationList.find(t => t.id === editMandirType) || classificationList[0];
                  return (
                    <View style={{ marginBottom: 14 }}>
                      <TouchableOpacity
                        onPress={() => setEditClassificationOpen(!editClassificationOpen)}
                        activeOpacity={0.8}
                        style={{
                          backgroundColor: '#FFFDF9',
                          borderWidth: 1.5,
                          borderColor: editClassificationOpen ? '#047857' : '#D1D5DB',
                          borderRadius: 10,
                          paddingHorizontal: 14,
                          paddingVertical: 12,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderBottomLeftRadius: editClassificationOpen ? 0 : 10,
                          borderBottomRightRadius: editClassificationOpen ? 0 : 10,
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 8 }}>
                          <Text style={{ fontSize: 18 }}>🛕</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827' }}>
                              {sel.title}
                            </Text>
                            <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }} numberOfLines={1}>
                              {sel.desc}
                            </Text>
                          </View>
                        </View>
                        <Text style={{ fontSize: 11, color: '#047857', fontWeight: 'bold' }}>
                          {editClassificationOpen ? '▲' : '▼'}
                        </Text>
                      </TouchableOpacity>

                      {editClassificationOpen && (
                        <View style={{
                          backgroundColor: '#FFFDF9',
                          borderWidth: 1.5,
                          borderTopWidth: 0,
                          borderColor: '#047857',
                          borderBottomLeftRadius: 10,
                          borderBottomRightRadius: 10,
                          overflow: 'hidden',
                        }}>
                          {classificationList.map(t => {
                            const isSelected = editMandirType === t.id;
                            return (
                              <TouchableOpacity
                                key={t.id}
                                onPress={() => {
                                  setEditMandirType(t.id);
                                  setEditClassificationOpen(false);
                                }}
                                activeOpacity={0.75}
                                style={{
                                  paddingHorizontal: 14,
                                  paddingVertical: 10,
                                  borderBottomWidth: 1,
                                  borderBottomColor: '#F3F4F6',
                                  backgroundColor: isSelected ? '#ECFDF5' : '#FFFDF9',
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <View style={{ flex: 1, marginRight: 8 }}>
                                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                    <Text style={{ fontSize: 14 }}>🛕</Text>
                                    <Text style={{ fontSize: 13, fontWeight: isSelected ? '700' : '600', color: isSelected ? '#047857' : '#1F2937' }}>
                                      {t.title}
                                    </Text>
                                  </View>
                                  <Text style={{ fontSize: 11, color: isSelected ? '#065F46' : '#6B7280', marginLeft: 20 }}>
                                    {t.desc}
                                  </Text>
                                </View>
                                {isSelected && <Text style={{ color: '#047857', fontWeight: '800', fontSize: 14 }}>✓</Text>}
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  );
                })()}

                <Text style={styles.inputLabel}>Temple Name *</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="e.g. Sri Ayyappa Swamy Temple"
                  placeholderTextColor="#8C8C8C"
                  value={editMandirName}
                  onChangeText={setEditMandirName}
                />

                <Text style={styles.inputLabel}>Alternate / Local Name</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="e.g. Hill Shrine Mandir"
                  placeholderTextColor="#8C8C8C"
                  value={editMandirAltName}
                  onChangeText={setEditMandirAltName}
                />

                <Text style={styles.inputLabel}>Primary Presiding Deity *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {[
                      'Lord Ayyappa', 'Lord Shiva', 'Lord Venkateswara', 'Lord Ganesha',
                      'Lord Murugan', 'Lord Rama', 'Lord Hanuman', 'Lord Krishna',
                      'Goddess Durga', 'Goddess Lakshmi', 'Other Holy Deity'
                    ].map(d => {
                      const isSelected = editMandirDeity === d;
                      return (
                        <TouchableOpacity
                          key={d}
                          onPress={() => setEditMandirDeity(d)}
                          style={[
                            styles.deityChip,
                            isSelected && styles.deityChipSelected
                          ]}
                        >
                          <Text style={[styles.deityChipText, isSelected && styles.deityChipTextSelected]}>
                            {d}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>

                <Text style={styles.inputLabel}>State *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {['Andhra Pradesh', 'Telangana', 'Kerala', 'Tamil Nadu', 'Karnataka', 'Maharashtra', 'Other State'].map(s => {
                      const isSelected = editMandirState === s;
                      return (
                        <TouchableOpacity
                          key={s}
                          onPress={() => setEditMandirState(s)}
                          style={[
                            styles.deityChip,
                            isSelected && styles.deityChipSelected
                          ]}
                        >
                          <Text style={[styles.deityChipText, isSelected && styles.deityChipTextSelected]}>
                            {s}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>City / Town *</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      placeholder="e.g. Hyderabad"
                      placeholderTextColor="#8C8C8C"
                      value={editMandirCity}
                      onChangeText={setEditMandirCity}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>District</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      placeholder="District name"
                      placeholderTextColor="#8C8C8C"
                      value={editMandirDistrict}
                      onChangeText={setEditMandirDistrict}
                    />
                  </View>
                </View>

                <Text style={styles.inputLabel}>Full Temple Address &amp; Landmark</Text>
                <TextInput
                  style={[styles.modalTextInput, { height: 60 }]}
                  placeholder="Door number, Street, Near landmark, Pincode"
                  placeholderTextColor="#8C8C8C"
                  value={editMandirAddress}
                  onChangeText={setEditMandirAddress}
                  multiline
                />
              </View>

              {/* SECTION 2: Sacred Heritage & Details */}
              <View style={styles.mandirSectionBox}>
                <View style={styles.mandirSectionHeader}>
                  <Text style={styles.mandirSectionTitle}>📜 2. Sacred Heritage &amp; Details</Text>
                </View>

                <Text style={styles.inputLabel}>One-line Devotional Summary</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="e.g. Ancient hill shrine venerated for 41-day Mandala vratham..."
                  placeholderTextColor="#8C8C8C"
                  value={editMandirSummary}
                  onChangeText={setEditMandirSummary}
                />

                <Text style={styles.inputLabel}>About the Temple</Text>
                <TextInput
                  style={[styles.modalTextInput, { height: 75 }]}
                  placeholder="Comprehensive description of the temple sanctum, atmosphere, and traditions..."
                  placeholderTextColor="#8C8C8C"
                  value={editMandirAbout}
                  onChangeText={setEditMandirAbout}
                  multiline
                />

                <Text style={styles.inputLabel}>Sacred History &amp; Origins</Text>
                <TextInput
                  style={[styles.modalTextInput, { height: 70 }]}
                  placeholder="Ancient historical roots, royal patronage, puranic account..."
                  placeholderTextColor="#8C8C8C"
                  value={editMandirHistory}
                  onChangeText={setEditMandirHistory}
                  multiline
                />

                <Text style={styles.inputLabel}>Spiritual Speciality &amp; Architectural Highlights</Text>
                <TextInput
                  style={[styles.modalTextInput, { height: 70 }]}
                  placeholder="Distinctive features, Neyyabhishekam, holy steps, sacred teertham..."
                  placeholderTextColor="#8C8C8C"
                  value={editMandirSpeciality}
                  onChangeText={setEditMandirSpeciality}
                  multiline
                />
              </View>

              {/* SECTION 3: Official Administrative Contact */}
              <View style={styles.mandirSectionBox}>
                <View style={styles.mandirSectionHeader}>
                  <Text style={styles.mandirSectionTitle}>📞 3. Official Administrative Contact</Text>
                </View>

                <Text style={styles.inputLabel}>Office Phone / Helpline</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="+91 0000 000000"
                  placeholderTextColor="#8C8C8C"
                  value={editMandirPhone}
                  onChangeText={setEditMandirPhone}
                  keyboardType="phone-pad"
                />

                <Text style={styles.inputLabel}>Official Email</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="contact@mandirtrust.org"
                  placeholderTextColor="#8C8C8C"
                  value={editMandirEmail}
                  onChangeText={setEditMandirEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Text style={styles.inputLabel}>Official Trust Website</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="https://mandirtrust.org"
                  placeholderTextColor="#8C8C8C"
                  value={editMandirWebsite}
                  onChangeText={setEditMandirWebsite}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>

              {/* Action Buttons: Cancel & Save Changes */}
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                <TouchableOpacity
                  style={styles.cancelMandirBtn}
                  onPress={() => setEditMandirModalVisible(false)}
                  disabled={savingEditMandir}
                >
                  <Text style={styles.cancelMandirBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dkSubmitMandirBtn}
                  activeOpacity={0.8}
                  onPress={handleSaveEditTemple}
                  disabled={savingEditMandir}
                >
                  {savingEditMandir ? (
                    <ActivityIndicator color="#1C1917" />
                  ) : (
                    <Text style={styles.dkSubmitMandirBtnText}>Save Changes 🙏</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ==================== DHARMA KARTHA MODAL 1C: DELETE TEMPLE ==================== */}
      <Modal
        visible={deleteMandirModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteMandirModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.dkAddModalCard, { padding: 22, maxWidth: 360, alignSelf: 'center', width: '100%' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 20 }}>🗑️</Text>
                <Text style={[styles.dkAddModalTitle, { marginBottom: 0, textAlign: 'left', color: '#B91C1C' }]}>
                  Archive / Delete Mandir
                </Text>
              </View>
              <TouchableOpacity onPress={() => setDeleteMandirModalVisible(false)}>
                <CloseIcon />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 13, color: '#374151', marginBottom: 8, lineHeight: 18 }}>
              Are you sure you want to request deletion of <Text style={{ fontWeight: '700', color: '#0C251E' }}>"{deletingTemple?.name}"</Text>?
            </Text>

            <View style={{ backgroundColor: '#FEF2F2', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#FECACA', marginBottom: 14 }}>
              <Text style={{ fontSize: 11.5, color: '#991B1B', lineHeight: 16 }}>
                ⚠️ Notice: This will submit a formal archive request to Super Admin verification and remove it from your active trustee dashboard.
              </Text>
            </View>

            <Text style={styles.inputLabel}>Reason for Deletion *</Text>
            <TextInput
              style={[styles.modalTextInput, { height: 60, marginBottom: 16 }]}
              placeholder="e.g. Relocating shrine administration or incorrect listing..."
              placeholderTextColor="#8C8C8C"
              value={templeDeleteReason}
              onChangeText={setTempleDeleteReason}
              multiline
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                style={styles.cancelMandirBtn}
                onPress={() => setDeleteMandirModalVisible(false)}
                disabled={deletingTempleLoading}
              >
                <Text style={styles.cancelMandirBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.templeDeleteConfirmBtn, deletingTempleLoading && { opacity: 0.7 }]}
                onPress={handleConfirmTempleDeletion}
                disabled={deletingTempleLoading}
                activeOpacity={0.8}
              >
                {deletingTempleLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.templeDeleteConfirmBtnText}>Confirm Delete 🗑️</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ==================== DHARMA KARTHA MODAL 2: EVENTS ==================== */}
      <Modal
        visible={eventsModalVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setEventsModalVisible(false)}
      >
        <SafeAreaView style={styles.dkModalSafeArea}>
          <StatusBar barStyle="light-content" backgroundColor="#0C251E" translucent={false} />
          <View style={styles.dkModalHeader}>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => setEventsModalVisible(false)}
            >
              <BackArrowIcon />
            </TouchableOpacity>
            <Text style={styles.dkModalHeaderTitle}>Manage Devotional Events</Text>
            <TouchableOpacity
              style={[styles.dkAddSmallBtn, { backgroundColor: '#E29E38', paddingHorizontal: 12, paddingVertical: 7 }]}
              onPress={() => {
                setNewEventTempleId(dkTemples[0]?.id || null);
                setAddEventModalVisible(true);
              }}
            >
              <Text style={[styles.dkAddSmallBtnText, { color: '#1C1917', fontWeight: '800' }]}>+ Create</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.dkModalBody}
            contentContainerStyle={{ padding: 16 }}
            refreshControl={
              <RefreshControl
                refreshing={loadingEvents}
                onRefresh={fetchDkEvents}
                tintColor="#E29E38"
                colors={['#E29E38', '#047857']}
              />
            }
          >
            {/* Prominent Create Temple Event Banner Button */}
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: '#E29E38',
                borderRadius: 12,
                paddingVertical: 14,
                marginBottom: 16,
                shadowColor: '#E29E38',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 3,
              }}
              onPress={() => {
                setNewEventTempleId(dkTemples[0]?.id || null);
                setAddEventModalVisible(true);
              }}
            >
              <Text style={{ fontSize: 16 }}>➕</Text>
              <Text style={{ fontSize: 14.5, fontWeight: '800', color: '#1C1917' }}>
                Create Temple Event
              </Text>
            </TouchableOpacity>

            {loadingEvents && dkEvents.length === 0 ? (
              <View style={[styles.dkEmptyStateBox, { paddingVertical: 40 }]}>
                <ActivityIndicator size="large" color="#E29E38" />
                <Text style={{ marginTop: 12, fontSize: 13, color: '#6B7280', fontWeight: '600' }}>
                  Fetching devotional events from database...
                </Text>
              </View>
            ) : dkEvents.length === 0 ? (
              <View style={styles.dkEmptyStateBox}>
                <Text style={{ fontSize: 36, marginBottom: 8 }}>📅</Text>
                <Text style={styles.dkEmptyStateTitle}>No Events Scheduled</Text>
                <Text style={styles.dkEmptyStateDesc}>
                  Pujas, homams, and volunteer programmes will appear here in chronological order.
                </Text>
                <TouchableOpacity
                  style={[styles.dkPrimaryActionBtn, { backgroundColor: '#E29E38', marginTop: 14 }]}
                  onPress={() => {
                    setNewEventTempleId(dkTemples[0]?.id || null);
                    setAddEventModalVisible(true);
                  }}
                >
                  <Text style={[styles.dkPrimaryActionBtnText, { color: '#1C1917', fontWeight: '800' }]}>
                    ➕ Create First Event
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              dkEvents.map((evt: any, idx: number) => (
                <View key={evt.id || idx} style={styles.dkItemCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={styles.dkItemTitle}>{evt.title || evt.name || 'Devotional Event'}</Text>
                    <View style={[styles.dkStatusBadge, { backgroundColor: '#F0FDF4' }]}>
                      <Text style={[styles.dkStatusBadgeText, { color: '#047857' }]}>
                        🛕 {evt.templeName || dkTemples.find(t => t.id === evt.templeId)?.name || 'Mandir'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.dkItemSubtitle}>
                    📅 {evt.date || 'Upcoming'} • {evt.location || evt.time || 'Mandir Praakaram'}
                  </Text>
                  {evt.description ? (
                    <Text style={styles.dkItemDetailText}>{evt.description}</Text>
                  ) : null}

                  {/* Dynamic Action Row: Delete Event */}
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
                    <TouchableOpacity
                      style={styles.templeDeleteBtn}
                      activeOpacity={0.7}
                      onPress={() => handleDeleteEvent(evt)}
                    >
                      <Text style={{ fontSize: 13 }}>🗑️</Text>
                      <Text style={styles.templeDeleteBtnText}>Delete Event</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ==================== DHARMA KARTHA MODAL 2B: CREATE TEMPLE EVENT ==================== */}
      <Modal
        visible={addEventModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAddEventModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.dkAddModalCard, { maxHeight: '90%', padding: 20 }]}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={[styles.dkAddModalTitle, { textAlign: 'left', marginBottom: 2, fontSize: 18 }]}>
                  Create Temple Event
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280', lineHeight: 16 }}>
                  Schedule a devotional seva, discourse, or community worship event.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setAddEventModalVisible(false)}
                style={{ padding: 4 }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <CloseIcon />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={true} contentContainerStyle={{ paddingBottom: 20 }}>
              {/* Select Temple / Shrine */}
              <Text style={styles.inputLabel}>Select Temple / Shrine *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {dkTemples.map(t => {
                    const isSelected = (newEventTempleId || dkTemples[0]?.id) === t.id;
                    return (
                      <TouchableOpacity
                        key={t.id}
                        onPress={() => setNewEventTempleId(t.id)}
                        style={[
                          styles.deityChip,
                          isSelected && styles.deityChipSelected
                        ]}
                      >
                        <Text style={[styles.deityChipText, isSelected && styles.deityChipTextSelected]}>
                          🛕 {t.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              {/* Event Title */}
              <Text style={styles.inputLabel}>Event Title *</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="e.g. Sri Srinivasa Kalyanotsavam Seva"
                placeholderTextColor="#8C8C8C"
                value={newEventTitle}
                onChangeText={setNewEventTitle}
              />

              {/* Date & Time */}
              <Text style={styles.inputLabel}>Date &amp; Time *</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="dd-mm-yyyy --:--"
                placeholderTextColor="#8C8C8C"
                value={newEventDateTime}
                onChangeText={setNewEventDateTime}
              />

              {/* Location / Hall */}
              <Text style={styles.inputLabel}>Location / Hall</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="e.g. Prakaram Mandapam"
                placeholderTextColor="#8C8C8C"
                value={newEventLocation}
                onChangeText={setNewEventLocation}
              />

              {/* Description & Devotee Guidelines */}
              <Text style={styles.inputLabel}>Description &amp; Devotee Guidelines</Text>
              <TextInput
                style={[styles.modalTextInput, { height: 75 }]}
                placeholder="Details about participation, seva tokens, or timings..."
                placeholderTextColor="#8C8C8C"
                value={newEventDesc}
                onChangeText={setNewEventDesc}
                multiline
              />

              {/* Action Buttons: Cancel and Publish Event */}
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                <TouchableOpacity
                  style={styles.cancelMandirBtn}
                  onPress={() => setAddEventModalVisible(false)}
                  disabled={savingEvent}
                >
                  <Text style={styles.cancelMandirBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.dkSubmitMandirBtn, { backgroundColor: '#E29E38' }]}
                  activeOpacity={0.8}
                  onPress={handleSaveNewEvent}
                  disabled={savingEvent}
                >
                  {savingEvent ? (
                    <ActivityIndicator color="#1C1917" />
                  ) : (
                    <Text style={styles.dkSubmitMandirBtnText}>Publish Event 📅</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ==================== DHARMA KARTHA MODAL: MANAGE TEMPLE FESTIVALS ==================== */}
      <Modal
        visible={festivalsModalVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setFestivalsModalVisible(false)}
      >
        <SafeAreaView style={styles.dkModalSafeArea}>
          <StatusBar barStyle="light-content" backgroundColor="#0C251E" translucent={false} />
          <View style={styles.dkModalHeader}>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => setFestivalsModalVisible(false)}
            >
              <BackArrowIcon />
            </TouchableOpacity>
            <Text style={styles.dkModalHeaderTitle}>Manage Temple Festivals</Text>
            <TouchableOpacity
              style={[styles.dkAddSmallBtn, { backgroundColor: '#E29E38', paddingHorizontal: 12, paddingVertical: 7 }]}
              onPress={handleOpenAddFestival}
            >
              <Text style={[styles.dkAddSmallBtnText, { color: '#1C1917', fontWeight: '800' }]}>+ Create</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.dkModalBody}
            contentContainerStyle={{ padding: 16 }}
            refreshControl={
              <RefreshControl
                refreshing={loadingFestivals}
                onRefresh={fetchDkFestivals}
                tintColor="#E29E38"
                colors={['#E29E38', '#047857']}
              />
            }
          >
            {/* Prominent Create Temple Festival Banner Button */}
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: '#E29E38',
                borderRadius: 12,
                paddingVertical: 14,
                marginBottom: 16,
                shadowColor: '#E29E38',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 3,
              }}
              onPress={handleOpenAddFestival}
            >
              <Text style={{ fontSize: 16 }}>➕</Text>
              <Text style={{ fontSize: 14.5, fontWeight: '800', color: '#1C1917' }}>
                Add New Temple Festival
              </Text>
            </TouchableOpacity>

            {loadingFestivals && dkFestivals.length === 0 ? (
              <View style={[styles.dkEmptyStateBox, { paddingVertical: 40 }]}>
                <ActivityIndicator size="large" color="#E29E38" />
                <Text style={{ marginTop: 12, fontSize: 13, color: '#6B7280', fontWeight: '600' }}>
                  Fetching holy temple festivals from database...
                </Text>
              </View>
            ) : dkFestivals.length === 0 ? (
              <View style={styles.dkEmptyStateBox}>
                <Text style={{ fontSize: 36, marginBottom: 8 }}>🔥</Text>
                <Text style={styles.dkEmptyStateTitle}>No Festivals Added Yet</Text>
                <Text style={styles.dkEmptyStateDesc}>
                  Add the annual celebrations, Brahmotsavams, or special pooja observances for your temple.
                </Text>
                <TouchableOpacity
                  style={[styles.dkPrimaryActionBtn, { backgroundColor: '#E29E38', marginTop: 14 }]}
                  onPress={handleOpenAddFestival}
                >
                  <Text style={[styles.dkPrimaryActionBtnText, { color: '#1C1917', fontWeight: '800' }]}>
                    ➕ Add First Festival
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              dkFestivals.map((fest: any, idx: number) => (
                <View key={fest.id || idx} style={styles.dkItemCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={[styles.dkItemTitle, { flex: 1, marginRight: 8 }]}>{fest.name}</Text>
                    <View style={[styles.dkStatusBadge, { backgroundColor: '#F0FDF4' }]}>
                      <Text style={[styles.dkStatusBadgeText, { color: '#047857' }]}>
                        🛕 {fest.templeName || dkTemples.find(t => t.id === fest.templeId)?.name || 'Mandir'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.dkItemSubtitle}>
                    📅 {fest.period || 'Annual Celebration'}
                  </Text>
                  {fest.specialPoojaInfo ? (
                    <Text style={{ fontSize: 12, color: '#92400E', backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 4, alignSelf: 'flex-start' }}>
                      ✨ Special Seva: {fest.specialPoojaInfo}
                    </Text>
                  ) : null}
                  {fest.description ? (
                    <Text style={{ fontSize: 12, color: '#4B5563', marginTop: 6, lineHeight: 17 }}>
                      {fest.description}
                    </Text>
                  ) : null}

                  {/* Dynamic Action Row: Delete Festival */}
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
                    <TouchableOpacity
                      style={styles.templeDeleteBtn}
                      activeOpacity={0.7}
                      onPress={() => handleDeleteFestival(fest)}
                    >
                      <Text style={{ fontSize: 13 }}>🗑️</Text>
                      <Text style={styles.templeDeleteBtnText}>Delete Festival</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ==================== DHARMA KARTHA MODAL: ADD TEMPLE FESTIVAL ==================== */}
      <Modal
        visible={addFestivalModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAddFestivalModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.dkAddModalCard, { maxHeight: '90%', padding: 20 }]}>
            {/* Header matching exact uploaded image */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={[styles.dkAddModalTitle, { textAlign: 'left', marginBottom: 2, fontSize: 18 }]}>
                  Add Temple Festival
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280', lineHeight: 16 }}>
                  Enter the details of the annual celebration or festival for this shrine.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setAddFestivalModalVisible(false)}
                style={{ padding: 4 }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <CloseIcon />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={true} contentContainerStyle={{ paddingBottom: 20 }}>
              {/* Select Temple / Shrine (Choose which temple A, B, C... to add this festival to) */}
              <Text style={styles.inputLabel}>Select Temple / Shrine *</Text>
              <Text style={{ fontSize: 11, color: '#6B7280', marginBottom: 6 }}>
                Choose which of your registered shrines this festival belongs to:
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {dkTemples.map(t => {
                    const isSelected = (newFestivalTempleId || dkTemples[0]?.id) === t.id;
                    return (
                      <TouchableOpacity
                        key={t.id}
                        onPress={() => setNewFestivalTempleId(t.id)}
                        style={[
                          styles.deityChip,
                          isSelected && styles.deityChipSelected
                        ]}
                      >
                        <Text style={[styles.deityChipText, isSelected && styles.deityChipTextSelected]}>
                          🛕 {t.name}{t.city ? ` (${t.city})` : ''}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              {/* Festival Name * */}
              <Text style={styles.inputLabel}>Festival Name *</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="e.g. Srivari Salakatla Brahmotsavam"
                placeholderTextColor="#8C8C8C"
                value={newFestivalName}
                onChangeText={setNewFestivalName}
              />

              {/* Festival Period / Occasion * */}
              <Text style={styles.inputLabel}>Festival Period / Occasion *</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="e.g. Mid-November to Late December"
                placeholderTextColor="#8C8C8C"
                value={newFestivalPeriod}
                onChangeText={setNewFestivalPeriod}
              />

              {/* Devotional Description */}
              <Text style={styles.inputLabel}>Devotional Description</Text>
              <TextInput
                style={[styles.modalTextInput, { height: 85, textAlignVertical: 'top', paddingTop: 10 }]}
                placeholder="Significance, celestial procession, and sacred observances..."
                placeholderTextColor="#8C8C8C"
                multiline={true}
                numberOfLines={3}
                value={newFestivalDesc}
                onChangeText={setNewFestivalDesc}
              />

              {/* Special Seva / Pooja Details */}
              <Text style={styles.inputLabel}>Special Seva / Pooja Details</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="e.g. Daily Neyyabhishekam and Rathotsavam"
                placeholderTextColor="#8C8C8C"
                value={newFestivalSeva}
                onChangeText={setNewFestivalSeva}
              />

              {/* Action Buttons */}
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                <TouchableOpacity
                  style={styles.cancelMandirBtn}
                  onPress={() => setAddFestivalModalVisible(false)}
                  disabled={savingFestival}
                >
                  <Text style={styles.cancelMandirBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.dkSubmitMandirBtn, { backgroundColor: '#E29E38' }]}
                  activeOpacity={0.8}
                  onPress={handleSaveNewFestival}
                  disabled={savingFestival}
                >
                  {savingFestival ? (
                    <ActivityIndicator color="#1C1917" />
                  ) : (
                    <Text style={styles.dkSubmitMandirBtnText}>Submit Festival</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ==================== DHARMA KARTHA MODAL 3: GALLERY ==================== */}
      <Modal
        visible={galleryModalVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setGalleryModalVisible(false)}
      >
        <SafeAreaView style={styles.dkModalSafeArea}>
          <StatusBar barStyle="light-content" backgroundColor="#0C251E" translucent={false} />
          <View style={styles.dkModalHeader}>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => setGalleryModalVisible(false)}
            >
              <BackArrowIcon />
            </TouchableOpacity>
            <Text style={styles.dkModalHeaderTitle}>Sacred Photo Gallery</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView
            style={styles.dkModalBody}
            contentContainerStyle={{ padding: 16 }}
            refreshControl={
              <RefreshControl
                refreshing={loadingMedia}
                onRefresh={fetchDkMedia}
                tintColor="#E29E38"
                colors={['#E29E38', '#047857']}
              />
            }
          >
            {loadingMedia && dkMedia.length === 0 ? (
              <View style={[styles.dkEmptyStateBox, { paddingVertical: 40 }]}>
                <ActivityIndicator size="large" color="#E29E38" />
                <Text style={{ marginTop: 12, fontSize: 13, color: '#6B7280', fontWeight: '600' }}>
                  Fetching sacred photos from database...
                </Text>
              </View>
            ) : dkMedia.length === 0 ? (
              <View style={styles.dkEmptyStateBox}>
                <Text style={{ fontSize: 36, marginBottom: 8 }}>🖼️</Text>
                <Text style={styles.dkEmptyStateTitle}>No Photos in Sanctum Gallery</Text>
                <Text style={styles.dkEmptyStateDesc}>
                  Sanctum, gopuram, and celebration photos uploaded for your shrine will appear here.
                </Text>
              </View>
            ) : (
              <View style={{ gap: 14 }}>
                {dkMedia.map((m: any, idx: number) => (
                  <View key={m.id || idx} style={[styles.dkItemCard, { padding: 12 }]}>
                    <Image
                      source={m.url || m.mediaUrl ? { uri: m.url || m.mediaUrl } : TEMPLE_BG}
                      style={{ width: '100%', height: 180, borderRadius: 10, backgroundColor: '#E5E7EB' }}
                      resizeMode="cover"
                    />
                    <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={[styles.dkItemTitle, { flex: 1, fontSize: 15 }]}>
                        {m.title || m.caption || 'Sanctum Alankaram'}
                      </Text>
                      {m.category ? (
                        <View style={[styles.dkStatusBadge, { backgroundColor: '#F0FDF4' }]}>
                          <Text style={[styles.dkStatusBadgeText, { color: '#047857' }]}>{m.category}</Text>
                        </View>
                      ) : null}
                    </View>
                    {m.caption && m.title ? (
                      <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{m.caption}</Text>
                    ) : null}

                    {/* Dynamic Delete Photo Button */}
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
                      <TouchableOpacity
                        style={styles.templeDeleteBtn}
                        activeOpacity={0.7}
                        onPress={() => handleDeleteMedia(m)}
                      >
                        <Text style={{ fontSize: 13 }}>🗑️</Text>
                        <Text style={styles.templeDeleteBtnText}>Delete Photo</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ==================== DHARMA KARTHA MODAL 4: ADD MANDIR (EXACT WEBSITE FIELDS) ==================== */}
      <Modal
        visible={addMandirModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAddMandirModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.dkAddModalCard, { maxHeight: '92%', padding: 18 }]}>
            {/* Header matching Register a Holy Mandir */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <Text style={{ fontSize: 20 }}>🛕</Text>
                  <Text style={[styles.dkAddModalTitle, { textAlign: 'left', marginBottom: 0, fontSize: 18 }]}>
                    Register a Holy Mandir
                  </Text>
                </View>
                <Text style={{ fontSize: 11.5, color: '#6B7280', lineHeight: 16 }}>
                  Submit temple details, sanctum heritage, and contact information for Super Admin verification and inclusion in the Saranam Ayyappa sacred directory.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setAddMandirModalVisible(false)}
                style={{ padding: 4 }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <CloseIcon />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={true} contentContainerStyle={{ paddingBottom: 24 }}>
              {/* SECTION 1: Temple Identity & Classification */}
              <View style={styles.mandirSectionBox}>
                <View style={styles.mandirSectionHeader}>
                  <Text style={styles.mandirSectionTitle}>🏛️ 1. Temple Identity &amp; Classification</Text>
                </View>

                {/* Classification Dropdown */}
                <Text style={styles.inputLabel}>Select Temple Classification / Type *</Text>
                <Text style={styles.inputHelperText}>
                  Indicate whether this is an independent Main Temple, a Sub-Temple (branch/subsidiary shrine), or part of a Multi-Temple trust complex.
                </Text>

                {(() => {
                  const classificationList = [
                    { id: 'MAIN_TEMPLE', title: 'Main Temple', desc: 'Primary institutional shrine with full sanctum and daily scheduled poojas.' },
                    { id: 'SUB_TEMPLE', title: 'Sub Temple', desc: 'Branch temple or subsidiary shrine affiliated to a central trust.' },
                    { id: 'MULTI_TEMPLE', title: 'Multi-Deity Temple Complex', desc: 'Grand religious complex housing multiple sanctums and deities.' },
                    { id: 'COMMUNITY_TEMPLE', title: 'Community Temple', desc: 'Locally organized bhajana mandiram or residential colony shrine.' },
                    { id: 'HERITAGE_SHRINE', title: 'Heritage Shrine', desc: 'Ancient historic pilgrimage site or forest shrine.' },
                  ];
                  const sel = classificationList.find(t => t.id === newMandirType) || classificationList[0];
                  return (
                    <View style={{ marginBottom: 14 }}>
                      <TouchableOpacity
                        onPress={() => setNewClassificationOpen(!newClassificationOpen)}
                        activeOpacity={0.8}
                        style={{
                          backgroundColor: '#FFFDF9',
                          borderWidth: 1.5,
                          borderColor: newClassificationOpen ? '#047857' : '#D1D5DB',
                          borderRadius: 10,
                          paddingHorizontal: 14,
                          paddingVertical: 12,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderBottomLeftRadius: newClassificationOpen ? 0 : 10,
                          borderBottomRightRadius: newClassificationOpen ? 0 : 10,
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 8 }}>
                          <Text style={{ fontSize: 18 }}>🛕</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827' }}>
                              {sel.title}
                            </Text>
                            <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }} numberOfLines={1}>
                              {sel.desc}
                            </Text>
                          </View>
                        </View>
                        <Text style={{ fontSize: 11, color: '#047857', fontWeight: 'bold' }}>
                          {newClassificationOpen ? '▲' : '▼'}
                        </Text>
                      </TouchableOpacity>

                      {newClassificationOpen && (
                        <View style={{
                          backgroundColor: '#FFFDF9',
                          borderWidth: 1.5,
                          borderTopWidth: 0,
                          borderColor: '#047857',
                          borderBottomLeftRadius: 10,
                          borderBottomRightRadius: 10,
                          overflow: 'hidden',
                        }}>
                          {classificationList.map(t => {
                            const isSelected = newMandirType === t.id;
                            return (
                              <TouchableOpacity
                                key={t.id}
                                onPress={() => {
                                  setNewMandirType(t.id);
                                  setNewClassificationOpen(false);
                                }}
                                activeOpacity={0.75}
                                style={{
                                  paddingHorizontal: 14,
                                  paddingVertical: 10,
                                  borderBottomWidth: 1,
                                  borderBottomColor: '#F3F4F6',
                                  backgroundColor: isSelected ? '#ECFDF5' : '#FFFDF9',
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <View style={{ flex: 1, marginRight: 8 }}>
                                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                    <Text style={{ fontSize: 14 }}>🛕</Text>
                                    <Text style={{ fontSize: 13, fontWeight: isSelected ? '700' : '600', color: isSelected ? '#047857' : '#1F2937' }}>
                                      {t.title}
                                    </Text>
                                  </View>
                                  <Text style={{ fontSize: 11, color: isSelected ? '#065F46' : '#6B7280', marginLeft: 20 }}>
                                    {t.desc}
                                  </Text>
                                </View>
                                {isSelected && <Text style={{ color: '#047857', fontWeight: '800', fontSize: 14 }}>✓</Text>}
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  );
                })()}

                {/* Temple Name */}
                <Text style={styles.inputLabel}>Temple Name *</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="e.g. Sri Ayyappa Swamy Temple"
                  placeholderTextColor="#8C8C8C"
                  value={newMandirName}
                  onChangeText={setNewMandirName}
                />

                {/* Alternate / Local Name */}
                <Text style={styles.inputLabel}>Alternate / Local Name</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="e.g. Hill Shrine Mandir"
                  placeholderTextColor="#8C8C8C"
                  value={newMandirAltName}
                  onChangeText={setNewMandirAltName}
                />

                {/* Primary Presiding Deity */}
                <Text style={styles.inputLabel}>Primary Presiding Deity *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {[
                      'Lord Ayyappa', 'Lord Shiva', 'Lord Venkateswara', 'Lord Ganesha',
                      'Lord Murugan', 'Lord Rama', 'Lord Hanuman', 'Lord Krishna',
                      'Goddess Durga', 'Goddess Lakshmi', 'Other Holy Deity'
                    ].map(d => {
                      const isSelected = newMandirDeity === d;
                      return (
                        <TouchableOpacity
                          key={d}
                          onPress={() => setNewMandirDeity(d)}
                          style={[
                            styles.deityChip,
                            isSelected && styles.deityChipSelected
                          ]}
                        >
                          <Text style={[styles.deityChipText, isSelected && styles.deityChipTextSelected]}>
                            {d}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>

                {/* State selector */}
                <Text style={styles.inputLabel}>State *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {['Andhra Pradesh', 'Telangana', 'Kerala', 'Tamil Nadu', 'Karnataka', 'Maharashtra', 'Other State'].map(s => {
                      const isSelected = newMandirState === s;
                      return (
                        <TouchableOpacity
                          key={s}
                          onPress={() => setNewMandirState(s)}
                          style={[
                            styles.deityChip,
                            isSelected && styles.deityChipSelected
                          ]}
                        >
                          <Text style={[styles.deityChipText, isSelected && styles.deityChipTextSelected]}>
                            {s}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>

                {/* City & District */}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>City / Town *</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      placeholder="e.g. Hyderabad"
                      placeholderTextColor="#8C8C8C"
                      value={newMandirCity}
                      onChangeText={setNewMandirCity}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>District</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      placeholder="District name"
                      placeholderTextColor="#8C8C8C"
                      value={newMandirDistrict}
                      onChangeText={setNewMandirDistrict}
                    />
                  </View>
                </View>

                {/* Full Temple Address & Landmark */}
                <Text style={styles.inputLabel}>Full Temple Address &amp; Landmark</Text>
                <TextInput
                  style={[styles.modalTextInput, { height: 60 }]}
                  placeholder="Door number, Street, Near landmark, Pincode"
                  placeholderTextColor="#8C8C8C"
                  value={newMandirAddress}
                  onChangeText={setNewMandirAddress}
                  multiline
                />
              </View>

              {/* SECTION 2: Sacred Heritage & Details */}
              <View style={styles.mandirSectionBox}>
                <View style={styles.mandirSectionHeader}>
                  <Text style={styles.mandirSectionTitle}>📜 2. Sacred Heritage &amp; Details</Text>
                </View>

                <Text style={styles.inputLabel}>One-line Devotional Summary</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="e.g. Ancient hill shrine venerated for 41-day Mandala vratham and divine tranquility."
                  placeholderTextColor="#8C8C8C"
                  value={newMandirSummary}
                  onChangeText={setNewMandirSummary}
                />

                <Text style={styles.inputLabel}>About the Temple</Text>
                <TextInput
                  style={[styles.modalTextInput, { height: 75 }]}
                  placeholder="Comprehensive description of the temple sanctum, atmosphere, and traditions..."
                  placeholderTextColor="#8C8C8C"
                  value={newMandirAbout}
                  onChangeText={setNewMandirAbout}
                  multiline
                />

                <Text style={styles.inputLabel}>Sacred History &amp; Origins</Text>
                <TextInput
                  style={[styles.modalTextInput, { height: 70 }]}
                  placeholder="Ancient historical roots, royal patronage, puranic account..."
                  placeholderTextColor="#8C8C8C"
                  value={newMandirHistory}
                  onChangeText={setNewMandirHistory}
                  multiline
                />

                <Text style={styles.inputLabel}>Spiritual Speciality &amp; Architectural Highlights</Text>
                <TextInput
                  style={[styles.modalTextInput, { height: 70 }]}
                  placeholder="Distinctive features, Neyyabhishekam, holy steps, sacred teertham..."
                  placeholderTextColor="#8C8C8C"
                  value={newMandirSpeciality}
                  onChangeText={setNewMandirSpeciality}
                  multiline
                />
              </View>

              {/* SECTION 3: Official Administrative Contact */}
              <View style={styles.mandirSectionBox}>
                <View style={styles.mandirSectionHeader}>
                  <Text style={styles.mandirSectionTitle}>📞 3. Official Administrative Contact</Text>
                </View>

                <Text style={styles.inputLabel}>Office Phone / Helpline</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="+91 0000 000000"
                  placeholderTextColor="#8C8C8C"
                  value={newMandirPhone}
                  onChangeText={setNewMandirPhone}
                  keyboardType="phone-pad"
                />

                <Text style={styles.inputLabel}>Official Email</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="contact@mandirtrust.org"
                  placeholderTextColor="#8C8C8C"
                  value={newMandirEmail}
                  onChangeText={setNewMandirEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Text style={styles.inputLabel}>Official Trust Website</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="https://mandirtrust.org"
                  placeholderTextColor="#8C8C8C"
                  value={newMandirWebsite}
                  onChangeText={setNewMandirWebsite}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>

              {/* Action Buttons: Cancel & Submit for Verification */}
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                <TouchableOpacity
                  style={styles.cancelMandirBtn}
                  onPress={() => setAddMandirModalVisible(false)}
                  disabled={savingMandir}
                >
                  <Text style={styles.cancelMandirBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dkSubmitMandirBtn}
                  activeOpacity={0.8}
                  onPress={handleSaveNewMandir}
                  disabled={savingMandir}
                >
                  {savingMandir ? (
                    <ActivityIndicator color="#1C1917" />
                  ) : (
                    <Text style={styles.dkSubmitMandirBtnText}>Submit for Verification 🛕</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      {/* MODAL: CHANGE PROFILE AVATAR / LOGO */}
      <Modal
        visible={avatarModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setAvatarModalOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlayBottom}
          activeOpacity={1}
          onPress={() => setAvatarModalOpen(false)}
        >
          <View style={styles.bottomSheetCard}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetHeaderTitle}>Change Profile Logo</Text>
              <TouchableOpacity
                onPress={() => setAvatarModalOpen(false)}
                style={styles.closeBtn}
              >
                <CloseIcon />
              </TouchableOpacity>
            </View>

            <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
              <TouchableOpacity
                style={styles.avatarOptionRow}
                onPress={handleCaptureAvatarCamera}
              >
                <View style={[styles.avatarOptionIconBox, { backgroundColor: '#FFF3E0' }]}>
                  <CameraBadgeIcon />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.avatarOptionTitle}>Take Photo with Camera</Text>
                  <Text style={styles.avatarOptionSubtitle}>Capture a new devotional profile photo</Text>
                </View>
                <ChevronRightIcon />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.avatarOptionRow}
                onPress={handlePickAvatarGallery}
              >
                <View style={[styles.avatarOptionIconBox, { backgroundColor: '#E8F5E9' }]}>
                  <Text style={{ fontSize: 18 }}>🖼️</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.avatarOptionTitle}>Choose from Gallery</Text>
                  <Text style={styles.avatarOptionSubtitle}>Select an existing image from your device</Text>
                </View>
                <ChevronRightIcon />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.avatarOptionRow, { borderBottomWidth: 0 }]}
                onPress={async () => {
                  setAvatarModalOpen(false);
                  const userId = currentUser?.id ? Number(currentUser.id) : (profile?.id ? Number(profile.id) : null);
                  if (!userId) return;
                  try {
                    await ApiService.updateDevoteeProfile(userId, { profileImageUrl: null });
                    setProfile((prev: any) => prev ? { ...prev, profileImageUrl: null } : null);
                    await StorageService.setStoredUser({ ...(currentUser || {}), profileImageUrl: null });
                    showAlert('Default Logo Restored 🙏', 'Restored default devotional emblem.', undefined, 'success');
                  } catch { }
                }}
              >
                <View style={[styles.avatarOptionIconBox, { backgroundColor: '#F3E5F5' }]}>
                  <Text style={{ fontSize: 18 }}>🕉️</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.avatarOptionTitle}>Use Default Devotional Emblem</Text>
                  <Text style={styles.avatarOptionSubtitle}>Reset to traditional sacred emblem</Text>
                </View>
                <ChevronRightIcon />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Sacred Devotional Custom Alert & Confirm Popup Dialog */}
      <DevotionalDialog
        visible={devotionalDialog.visible}
        title={devotionalDialog.title}
        message={devotionalDialog.message}
        type={devotionalDialog.type}
        confirmText={devotionalDialog.confirmText}
        cancelText={devotionalDialog.cancelText}
        onConfirm={devotionalDialog.onConfirm}
        onCancel={devotionalDialog.onCancel}
        isDestructive={devotionalDialog.isDestructive}
      />
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
  headerIconBtnSpacer: {
    width: 40,
  },
  headerTitleBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingVertical: 18,
    paddingHorizontal: 16,
    paddingBottom: 36,
  },

  // Profile Summary Card
  profileSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 6,
  },
  avatarContainer: {
    marginRight: 16,
    position: 'relative',
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#8B1D24',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
  avatarOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E8DC',
    gap: 14,
  },
  avatarOptionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarOptionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0C251E',
  },
  avatarOptionSubtitle: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  avatarBorder: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 2.5,
    borderColor: '#DFA62E',
    padding: 2.5,
    backgroundColor: '#FFF9F0',
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
  },
  profileInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  devoteeName: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0C251E',
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  devoteePhone: {
    fontSize: 13.5,
    color: '#345147',
    marginBottom: 8,
    fontWeight: '500',
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F3D38E',
    borderWidth: 1,
    borderColor: '#DFA62E',
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 20,
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  editProfileBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0C251E',
    marginLeft: 6,
  },

  // Sacred Devotee Details Card Styles
  devoteeDetailsCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E8D8BF',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  devoteeDetailsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E5D4',
    marginBottom: 12,
  },
  devoteeDetailsHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  devoteeDetailsHeaderTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0C251E',
    letterSpacing: 0.2,
  },
  devoteeDetailsEditPill: {
    backgroundColor: '#FFF5E0',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DFA62E',
  },
  devoteeDetailsEditText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B1D24',
  },
  devoteeDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  devoteeGridItem: {
    width: '50%',
    paddingHorizontal: 4,
    paddingVertical: 7,
  },
  devoteeGridLabel: {
    fontSize: 11.5,
    color: '#7D6D60',
    fontWeight: '500',
    marginBottom: 2,
  },
  devoteeGridValue: {
    fontSize: 14,
    color: '#0C251E',
    fontWeight: '700',
  },

  // 6 Menu Cards
  menuListContainer: {
    marginTop: 4,
  },
  menuCard: {
    backgroundColor: '#FFF9F0',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#E8CD9C',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIconContainer: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0C251E',
    marginBottom: 2,
  },
  menuTitleLogout: {
    fontSize: 16,
    fontWeight: '700',
    color: '#C62828',
  },
  menuTitleDelete: {
    fontSize: 16,
    fontWeight: '700',
    color: '#B71C1C',
  },
  menuSubtitle: {
    fontSize: 12.5,
    color: '#345147',
    lineHeight: 16,
  },
  chevronContainer: {
    marginLeft: 8,
    paddingLeft: 4,
  },

  // Screen 24: Logout Confirmation Styles
  logoutFullscreenBg: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#1B542C', // Pearl Green
  },
  logoutImageStyle: {
    opacity: 0.7, // 70% opacity
  },
  logoutDarkOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  logoutSafeArea: {
    flex: 1,
    position: 'relative',
  },
  logoutTopOrnamentLeft: {
    position: 'absolute',
    top: 4,
    left: 4,
    zIndex: 1,
    opacity: 0.9,
  },
  logoutTopOrnamentRight: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 1,
    opacity: 0.9,
  },
  logoutHeaderRow: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 12 : 12,
    zIndex: 2,
  },
  logoutCenterWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoutCard: {
    backgroundColor: '#FFF9F0',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E8CD9C',
    paddingVertical: 26,
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  logoutLargeIconBox: {
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutCardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0C251E',
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    marginBottom: 2,
  },
  logoutCardDesc: {
    fontSize: 14,
    color: '#112620',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 4,
    marginBottom: 22,
    paddingHorizontal: 8,
  },
  logoutButtonsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  logoutCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#E8CD9C',
    backgroundColor: '#FFF9F0',
    alignItems: 'center',
    marginRight: 8,
  },
  logoutCancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0C251E',
  },
  logoutConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#173D32',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutConfirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFDF8',
  },
  lotusDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
    width: '80%',
  },
  lotusLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8CD9C',
    marginHorizontal: 8,
  },

  // Bottom Sheets
  modalOverlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  bottomSheetCard: {
    backgroundColor: '#FFF8EB',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8CD9C',
  },
  sheetHeaderTitle: {
    fontSize: 18.5,
    fontWeight: '700',
    color: '#0C251E',
  },
  closeBtn: {
    padding: 6,
  },
  sheetBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  // Bookmarks
  emptyBookmarksBox: {
    alignItems: 'center',
    paddingVertical: 36,
  },
  emptyBookmarksTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0C251E',
    marginTop: 12,
    marginBottom: 6,
  },
  emptyBookmarksSubtitle: {
    fontSize: 13,
    color: '#215344',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  bookmarkItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9F0',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8CD9C',
    padding: 14,
    marginBottom: 10,
  },
  bookmarkInfo: {
    flex: 1,
  },
  bookmarkItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0C251E',
    marginBottom: 2,
  },
  bookmarkItemSubtitle: {
    fontSize: 12.5,
    color: '#215344',
  },

  // Preferences
  preferenceSectionHeading: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0C251E',
    marginBottom: 10,
    marginTop: 4,
  },
  languagePillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  languagePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFF9F0',
    borderWidth: 1,
    borderColor: '#E8CD9C',
    marginRight: 8,
    marginBottom: 8,
  },
  languagePillActive: {
    backgroundColor: '#173D32',
    borderColor: '#173D32',
  },
  languagePillText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0C251E',
  },
  languagePillTextActive: {
    color: '#FFFDF8',
  },
  themeDisplayBox: {
    backgroundColor: '#FFF9F0',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8CD9C',
    padding: 14,
    marginBottom: 20,
  },
  themeDisplayText: {
    fontSize: 13.5,
    color: '#0C251E',
    fontWeight: '600',
  },

  // Legal
  legalOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9F0',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8CD9C',
    padding: 14,
    marginBottom: 12,
  },
  legalTextCol: {
    flex: 1,
  },
  legalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0C251E',
    marginBottom: 2,
  },
  legalSubtitle: {
    fontSize: 12.5,
    color: '#215344',
  },

  // Account Deletion Styles
  deleteWarningBox: {
    backgroundColor: '#FFF1F0',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#FFCDD2',
    padding: 14,
    marginBottom: 12,
  },
  deleteWarningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B71C1C',
    marginBottom: 4,
  },
  deleteWarningDesc: {
    fontSize: 12.5,
    color: '#112620',
    lineHeight: 18,
  },
  deleteErrorBox: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF5350',
    padding: 10,
    marginBottom: 12,
  },
  deleteErrorText: {
    fontSize: 13,
    color: '#C62828',
    fontWeight: '600',
  },
  deleteSuccessBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#66BB6A',
    padding: 10,
    marginBottom: 12,
  },
  deleteSuccessText: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '600',
    textAlign: 'center',
  },
  deleteInputLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0C251E',
    marginBottom: 6,
  },
  deleteReasonInput: {
    backgroundColor: '#FFFDF8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8CD9C',
    padding: 12,
    fontSize: 14,
    color: '#0C251E',
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  phoneVerificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF9F0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8CD9C',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  phoneVerificationLabel: {
    fontSize: 13,
    color: '#215344',
    fontWeight: '500',
  },
  phoneVerificationValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0C251E',
  },
  deletePrimaryBtn: {
    backgroundColor: '#173D32',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  deletePrimaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFDF8',
  },
  deleteOtpHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0C251E',
    textAlign: 'center',
    marginBottom: 4,
  },
  deleteOtpSub: {
    fontSize: 13,
    color: '#215344',
    textAlign: 'center',
    marginBottom: 16,
  },
  deleteOtpInput: {
    backgroundColor: '#FFFDF8',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#DFA62E',
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 8,
    color: '#0C251E',
    textAlign: 'center',
    marginBottom: 12,
  },
  resendRow: {
    alignItems: 'center',
    marginBottom: 18,
  },
  resendCountdownText: {
    fontSize: 13,
    color: '#215344',
  },
  resendLinkText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#173D32',
    textDecorationLine: 'underline',
  },
  deleteConfirmBtn: {
    backgroundColor: '#B71C1C',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#B71C1C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteBackBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  deleteBackBtnText: {
    fontSize: 13,
    color: '#215344',
    textDecorationLine: 'underline',
  },

  // Role Badges & Switch
  roleBadgeCustomer: {
    backgroundColor: '#E8F5E9',
    borderColor: '#81C784',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  roleBadgeCustomerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2E7D32',
    letterSpacing: 0.5,
  },
  roleBadgeDk: {
    backgroundColor: '#FFF8E1',
    borderColor: '#D4AF37',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  roleBadgeDkText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A5A00',
    letterSpacing: 0.5,
  },
  roleSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0C251E',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  roleSwitchBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D4AF37',
  },

  // Dharma Kartha Trustee Card & KPIs
  dkTrusteeCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    padding: 16,
    marginBottom: 20,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  dkMandirHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  dkMandirIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#E8CD9C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dkMandirTextBox: {
    flex: 1,
  },
  dkMandirTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0C251E',
  },
  dkMandirSubtitle: {
    fontSize: 12,
    color: '#607D8B',
    marginTop: 2,
  },
  dkWelcomeNotice: {
    fontSize: 12,
    color: '#556B2F',
    backgroundColor: '#F9FBE7',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
    lineHeight: 16,
  },
  dkKpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  dkKpiCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FAF7F0',
    borderWidth: 1,
    borderColor: '#E6D7B8',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  dkKpiNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0C251E',
  },
  dkKpiLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#655B49',
    marginTop: 4,
    textAlign: 'center',
  },
  dkActionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dkPrimaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#173D32',
    borderRadius: 10,
    paddingVertical: 10,
  },
  dkPrimaryActionBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFDF9',
  },
  dkSecondaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 10,
    paddingVertical: 10,
  },
  dkSecondaryActionBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#8A5A00',
  },

  // Modals & Items
  dkModalSafeArea: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  dkModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE5D6',
    backgroundColor: '#FFFDF9',
  },
  dkModalHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0C251E',
  },
  dkModalBody: {
    flex: 1,
    padding: 16,
  },
  dkItemCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EDE5D6',
    padding: 14,
    marginBottom: 12,
  },
  dkItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0C251E',
  },
  dkItemSubtitle: {
    fontSize: 12.5,
    color: '#795548',
    marginTop: 3,
  },
  dkItemDetailText: {
    fontSize: 12,
    color: '#5D6D7E',
    marginTop: 4,
    lineHeight: 16,
  },
  dkStatusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 8,
  },
  dkStatusBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#2E7D32',
  },
  dkEmptyStateBox: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dkEmptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0C251E',
    marginBottom: 6,
  },
  dkEmptyStateDesc: {
    fontSize: 13,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 18,
  },
  dkAddSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#173D32',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dkAddSmallBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dkGalleryThumb: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
  },
  dkGalleryCaption: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0C251E',
    marginTop: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  dkAddModalCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: 16,
    padding: 20,
    maxHeight: '85%',
  },
  dkAddModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0C251E',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0C251E',
    marginBottom: 6,
    marginTop: 10,
  },
  modalTextInput: {
    backgroundColor: '#FAF7F0',
    borderWidth: 1,
    borderColor: '#D5C4A1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13.5,
    color: '#0C251E',
  },
  dkSubmitMandirBtn: {
    flex: 1,
    backgroundColor: '#E29E38',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E29E38',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  dkSubmitMandirBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1917',
  },
  cancelMandirBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#10B981',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelMandirBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#064E3B',
  },
  mandirSectionBox: {
    backgroundColor: '#FAF7F0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFE7DA',
  },
  mandirSectionHeader: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#E2D5C0',
    paddingBottom: 8,
    marginBottom: 12,
  },
  mandirSectionTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0B3D2B',
  },
  inputHelperText: {
    fontSize: 11.5,
    color: '#6B7280',
    marginBottom: 10,
    lineHeight: 15,
  },
  mandirTypeCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 10,
  },
  mandirTypeCardSelected: {
    borderColor: '#047857',
    backgroundColor: '#F0FDF4',
  },
  mandirTypeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  mandirTypeTitleSelected: {
    color: '#047857',
  },
  mandirTypeDesc: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 14,
  },
  deityChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  deityChipSelected: {
    backgroundColor: '#047857',
    borderColor: '#047857',
  },
  deityChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  deityChipTextSelected: {
    color: '#FFFFFF',
  },
  deleteAccountCard: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    borderRadius: 14,
    backgroundColor: '#FFFDF9',
    overflow: 'hidden',
  },
  templeEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#047857',
    backgroundColor: '#F0FDF4',
  },
  templeEditBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#047857',
  },
  templeDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  templeDeleteBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#DC2626',
  },
  templeDeleteConfirmBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  templeDeleteConfirmBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dharmaPortalCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E8D2A3',
    ...Platform.select({
      ios: { shadowColor: '#DFA62E', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 5 },
      android: { elevation: 2 },
    }),
  },
  dharmaPortalGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  dharmaPortalIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FAF4E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#EBDCB9',
  },
  dharmaPortalTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0C251E',
  },
  dharmaPortalBadge: {
    backgroundColor: '#FFE6B0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.8,
    borderColor: '#DFA62E',
  },
  dharmaPortalBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B37812',
    letterSpacing: 0.5,
  },
  dharmaPortalSubtitle: {
    fontSize: 11.5,
    color: '#65776F',
    marginTop: 2,
    lineHeight: 15,
  },
  dharmaPortalChevron: {
    fontSize: 22,
    color: '#CAA049',
    fontWeight: '600',
  },
});
