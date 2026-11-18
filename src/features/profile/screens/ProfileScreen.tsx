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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { ApiService } from '../../../services/api';
import { StorageService } from '../../../services/storageService';
import { SupportedLanguage, DevoteeProfile, BookmarkItem, DeityItem } from '../../../types';
import { DharmaKarthaDashboardScreen } from '../../dharma-kartha/screens/DharmaKarthaDashboardScreen';

interface Props {
  currentLanguage: SupportedLanguage;
  currentUser?: any;
  currentDeity?: DeityItem | null;
  userRole?: 'DEVOTEE' | 'DHARMA_KARTHA' | 'CUSTOMER';
  onOpenEditProfile: () => void;
  onOpenNotifications: () => void;
  onOpenTerms: () => void;
  onOpenPrivacyPolicy: () => void;
  onOpenAbout: () => void;
  onOpenAuth?: () => void;
  onLanguageChange?: (lang: SupportedLanguage) => void;
  onDeityChange?: (deity: DeityItem) => void;
  onLogout: () => void;
  onBack?: () => void;
  onNavigateDestination?: (screen: string, detail?: { id: string; title: string }) => void;
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

// Multilingual Dictionary
const PROFILE_I18N: Record<string, Record<string, string>> = {
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
  appPreferences: {
    en: 'App Preferences',
    te: 'యాప్ ప్రాధాన్యతలు',
    kn: 'ಅಪ್ಲಿಕೇಶನ್ ಆದ್ಯತೆಗಳು',
    ta: 'செயலி விருப்பங்கள்',
    hi: 'ऐप प्राथमिकताएं',
    ml: 'ആപ്പ് മുൻഗണനകൾ',
  },
  appPreferencesSubtitle: {
    en: 'Language, Deity & Theme',
    te: 'భాష, ఇష్ట దైవం & థీమ్',
    kn: 'ಭಾಷೆ, ಇಷ್ಟ ದೇವರು & ಥೀಮ್',
    ta: 'மொழி, விருப்ப தெய்வம் & தீம்',
    hi: 'भाषा, इष्ट देव एवं थीम',
    ml: 'ഭാഷ, ഇഷ്ട ദൈവം & തീം',
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
    en: 'About App',
    te: 'యాప్ గురించి',
    kn: 'ಅಪ್ಲಿಕೇಶನ್ ಬಗ್ಗೆ',
    ta: 'செயலி பற்றி',
    hi: 'ऐप के बारे में',
    ml: 'ആപ്പിനെക്കുറിച്ച്',
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
  userRole,
  onOpenEditProfile,
  onOpenNotifications,
  onOpenTerms,
  onOpenPrivacyPolicy,
  onOpenAbout,
  onOpenAuth,
  onLanguageChange,
  onDeityChange,
  onLogout,
  onBack,
  onNavigateDestination,
}) => {
  const [activeRole, setActiveRole] = useState<'DEVOTEE' | 'DHARMA_KARTHA'>(
    userRole === 'DHARMA_KARTHA' || currentUser?.role === 'DHARMA_KARTHA' ? 'DHARMA_KARTHA' : 'DEVOTEE'
  );

  useEffect(() => {
    if (userRole === 'DHARMA_KARTHA' || currentUser?.role === 'DHARMA_KARTHA') {
      setActiveRole('DHARMA_KARTHA');
    }
  }, [userRole, currentUser?.role]);

  const [profile, setProfile] = useState<DevoteeProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [bookmarksModalVisible, setBookmarksModalVisible] = useState(false);
  const [preferencesModalVisible, setPreferencesModalVisible] = useState(false);
  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [bookmarksLoading, setBookmarksLoading] = useState<boolean>(false);
  const [availableLanguages, setAvailableLanguages] = useState<any[]>([]);
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
      Alert.alert('Verification Error', 'Registered phone number not found. Please log in again.');
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
  useEffect(() => {
    ApiService.getLanguages().then((langs) => {
      if (Array.isArray(langs) && langs.length > 0) {
        setAvailableLanguages(langs);
      }
    }).catch(() => {});
  }, []);

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
  const displayName = isGuest
    ? t('guestDevotee')
    : profile?.fullName || currentUser?.fullName || currentUser?.name || currentUser?.email?.split('@')[0] || 'Ayyappa Devotee';
  const displayPhone = isGuest
    ? t('guestModeSubtitle')
    : (profile?.phoneNumber || currentUser?.phoneNumber || currentUser?.phone)
      ? getMaskedPhone(profile?.phoneNumber || currentUser?.phoneNumber || currentUser?.phone)
      : currentUser?.email || '';

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
        onOpenAbout={onOpenAbout}
        onLogout={onLogout}
        onSwitchToDevotee={() => setActiveRole('DEVOTEE')}
        onSelectTempleDetail={(temple) => {
          onNavigateDestination?.('temple_detail', { id: temple.slug || String(temple.id), title: temple.name });
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
      >
        {/* Top Profile Summary Card */}
        <View style={styles.profileSummaryCard}>
          {/* Circular Avatar with Gold Ornamental Border */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarBorder}>
              <Image source={avatarSource} style={styles.avatarImage} resizeMode="cover" />
            </View>
          </View>

          {/* User Information */}
          <View style={styles.profileInfoContainer}>
            <Text style={styles.devoteeName} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.devoteePhone}>{displayPhone}</Text>

            {/* Golden Rounded Edit Profile / Login Button */}
            {isGuest ? (
              <TouchableOpacity
                style={styles.editProfileBtn}
                activeOpacity={0.8}
                onPress={onOpenAuth || onOpenEditProfile}
              >
                <PencilIcon />
                <Text style={styles.editProfileBtnText}>{t('loginRegister')}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.editProfileBtn}
                activeOpacity={0.8}
                onPress={onOpenEditProfile}
              >
                <PencilIcon />
                <Text style={styles.editProfileBtnText}>{t('editProfile')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Dharma Kartha Dashboard Entry Card */}
        <TouchableOpacity
          style={styles.dharmaPortalCard}
          activeOpacity={0.88}
          onPress={() => setActiveRole('DHARMA_KARTHA')}
        >
          <LinearGradient
            colors={['#FFFBF0', '#FFF5DE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.dharmaPortalGradient}
          >
            <View style={styles.dharmaPortalIconBox}>
              <Text style={{ fontSize: 22 }}>🛕</Text>
            </View>
            <View style={{ flex: 1, marginRight: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.dharmaPortalTitle}>Dharma Kartha Dashboard</Text>
                <View style={styles.dharmaPortalBadge}>
                  <Text style={styles.dharmaPortalBadgeText}>MANDIR ADMIN</Text>
                </View>
              </View>
              <Text style={styles.dharmaPortalSubtitle}>
                Manage your temples, timings, aarti & sacred festivals
              </Text>
            </View>
            <Text style={styles.dharmaPortalChevron}>›</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* 6 PROFILE MENU CARDS (Exact match with reference image) */}
        <View style={styles.menuListContainer}>
          {/* Row 1: My Bookmarks */}
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

          {/* Row 2: Notifications */}
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

          {/* Row 3: App Preferences */}
          <TouchableOpacity
            style={styles.menuCard}
            activeOpacity={0.8}
            onPress={() => setPreferencesModalVisible(true)}
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

          {/* Row 4: Legal & Policies */}
          <TouchableOpacity
            style={styles.menuCard}
            activeOpacity={0.8}
            onPress={onOpenTerms}
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

          {/* Row 5: About App */}
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
              <Text style={styles.menuSubtitle}>Version {APP_VERSION}</Text>
            </View>
            <View style={styles.chevronContainer}>
              <ChevronRightIcon />
            </View>
          </TouchableOpacity>

          {/* Row 6: Delete Account (Directly Below About App) */}
          {!isGuest && (
            <TouchableOpacity
              style={styles.menuCard}
              activeOpacity={0.8}
              onPress={() => {
                setDeleteStep('REASON');
                setDeleteOtp('');
                setDeleteReason('');
                setDeleteError(null);
                setDeleteSuccess(null);
                setDeleteModalVisible(true);
              }}
            >
              <View style={styles.menuIconContainer}>
                <MenuDeleteAccountIcon />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitleDelete}>{t('deleteAccount')}</Text>
                <Text style={styles.menuSubtitle}>{t('deleteAccountSubtitle')}</Text>
              </View>
              <View style={styles.chevronContainer}>
                <ChevronRightIcon />
              </View>
            </TouchableOpacity>
          )}

          {/* Row 7: Logout */}
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
                <Text style={styles.menuTitleLogout}>{t('logout')}</Text>
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

      {/* MODAL C: APP PREFERENCES */}
      <Modal
        visible={preferencesModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPreferencesModalVisible(false)}
      >
        <View style={styles.modalOverlayBottom}>
          <View style={styles.bottomSheetCard}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetHeaderTitle}>{t('appPreferences')}</Text>
              <TouchableOpacity
                onPress={() => setPreferencesModalVisible(false)}
                style={styles.closeBtn}
              >
                <CloseIcon />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.sheetBody}>
              {/* Language Selection */}
              <Text style={styles.preferenceSectionHeading}>App Language</Text>
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
                    onPress={async () => {
                      await StorageService.setStoredLanguage(l.code as SupportedLanguage);
                      if (currentUser?.id) {
                        ApiService.updateUserPreferences(Number(currentUser.id), { preferredLang: l.code });
                      }
                      onLanguageChange?.(l.code as SupportedLanguage);
                      setPreferencesModalVisible(false);
                    }}
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

              {/* Devotional Theme Indicator */}
              <Text style={styles.preferenceSectionHeading}>Devotional Appearance</Text>
              <View style={styles.themeDisplayBox}>
                <Text style={styles.themeDisplayText}>🕉️ Traditional Sacred Maroon & Gold Theme</Text>
              </View>
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
                  <TextInput
                    style={styles.deleteReasonInput}
                    placeholder="Enter reason for account deletion..."
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
