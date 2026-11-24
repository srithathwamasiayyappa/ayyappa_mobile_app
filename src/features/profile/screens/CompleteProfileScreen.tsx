import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  FlatList,
  Platform,
  ActivityIndicator,
  BackHandler,
  Dimensions,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { ApiService } from '../../../services/api';
import { StorageService } from '../../../services/storageService';
import { SupportedLanguage, RashiItem, NakshatraItem, DevoteeProfile } from '../../../types';
import { Toast } from '../../../components/common/Toast';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  currentLanguage?: SupportedLanguage;
  currentUser?: any;
  onProfileSaved: (updatedUser?: any) => void;
  onBack?: () => void;
  onSkip?: () => void;
}

// ==========================================
// SVG ICONS MATCHING APPROVED DESIGN
// ==========================================

const TempleGopuramHeaderMotif = () => (
  <Svg width={40} height={30} viewBox="0 0 40 30" fill="none">
    {/* Kalasha top */}
    <Circle cx="20" cy="3" r="1.5" fill="#DFA62E" />
    <Path d="M19 4.5 H21 L20.5 7 H19.5 Z" fill="#173D32" />
    {/* Spire Tier 1 */}
    <Path d="M17 7 H23 L22 11 H18 Z" fill="#173D32" />
    <Path d="M16 11 H24 L25 16 H15 Z" fill="#173D32" />
    {/* Main Gopuram Tower */}
    <Path d="M12 16 H28 L29 22 H11 Z" fill="#173D32" />
    {/* Base Sanctum Arch & Pillars */}
    <Path d="M8 22 H32 V28 H8 Z" fill="#173D32" />
    <Path d="M16 28 V24 Q20 22 24 24 V28 Z" fill="#DFA62E" />
    {/* Side miniature finials */}
    <Path d="M10 20 L11 22 H9 Z M30 20 L31 22 H29 Z" fill="#DFA62E" />
  </Svg>
);

const CornerOrnamentLeft = () => (
  <Svg width={44} height={44} viewBox="0 0 44 44" fill="none">
    <Path
      d="M2 2 C16 2 28 8 36 18 C30 20 22 18 16 24 C10 18 8 10 2 2 Z"
      fill="#DFA62E"
      fillOpacity={0.75}
    />
    <Path
      d="M2 12 C8 16 12 24 14 34 C10 32 6 28 2 24 V12 Z"
      fill="#DFA62E"
      fillOpacity={0.6}
    />
    <Path
      d="M12 2 C16 8 24 12 34 14 C32 10 28 6 24 2 H12 Z"
      fill="#DFA62E"
      fillOpacity={0.6}
    />
    <Circle cx="6" cy="6" r="2" fill="#173D32" />
  </Svg>
);

const CornerOrnamentRight = () => (
  <Svg width={44} height={44} viewBox="0 0 44 44" fill="none">
    <Path
      d="M42 2 C28 2 16 8 8 18 C14 20 22 18 28 24 C34 18 36 10 42 2 Z"
      fill="#DFA62E"
      fillOpacity={0.75}
    />
    <Path
      d="M42 12 C36 16 32 24 30 34 C34 32 38 28 42 24 V12 Z"
      fill="#DFA62E"
      fillOpacity={0.6}
    />
    <Path
      d="M32 2 C28 8 20 12 10 14 C12 10 16 6 20 2 H32 Z"
      fill="#DFA62E"
      fillOpacity={0.6}
    />
    <Circle cx="38" cy="6" r="2" fill="#173D32" />
  </Svg>
);

// Field 1 Icon: User Silhouette
const UserIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="7.5" r="4" stroke="#2E7561" strokeWidth="1.8" />
    <Path
      d="M4.5 20 C4.5 16.2 7.8 14.5 12 14.5 C16.2 14.5 19.5 16.2 19.5 20"
      stroke="#2E7561"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </Svg>
);

// Field 2 Icon: Calendar with Checkmark
const CalendarIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Rect x="3.5" y="4.5" width="17" height="16" rx="3.5" stroke="#2E7561" strokeWidth="1.8" />
    <Path d="M3.5 9.5 H20.5" stroke="#2E7561" strokeWidth="1.5" />
    <Path d="M8 2.5 V5.5 M16 2.5 V5.5" stroke="#2E7561" strokeWidth="1.8" strokeLinecap="round" />
    <Path
      d="M8.5 15 L11 17.5 L15.5 13"
      stroke="#2E7561"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Field 3 Icon: Gender / Person Silhouette
const GenderIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="7.5" r="4" stroke="#2E7561" strokeWidth="1.8" />
    <Path
      d="M5 20 C5 16.2 8.2 14.5 12 14.5 C15.8 14.5 19 16.2 19 20"
      stroke="#2E7561"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </Svg>
);

// Field 4 Icon: Temple / Columned Shrine (Rashi/Zodiac)
const TempleShrineIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M3.5 8.5 L12 2.5 L20.5 8.5 H3.5 Z" stroke="#2E7561" strokeWidth="1.8" strokeLinejoin="round" />
    <Path d="M4 8.5 H20" stroke="#2E7561" strokeWidth="1.5" />
    <Path d="M6.5 10.5 V18 M10 10.5 V18 M14 10.5 V18 M17.5 10.5 V18" stroke="#2E7561" strokeWidth="1.6" strokeLinecap="round" />
    <Path d="M3.5 18.5 H20.5 V21.5 H3.5 V18.5 Z" stroke="#2E7561" strokeWidth="1.8" strokeLinejoin="round" />
  </Svg>
);

// Field 5 Icon: Sacred Star / Sudarshana Chakra (Nakshatram)
const SacredChakraIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="8.5" stroke="#2E7561" strokeWidth="1.6" />
    <Circle cx="12" cy="12" r="3" stroke="#2E7561" strokeWidth="1.4" />
    <Path
      d="M12 2.5 V5.5 M12 18.5 V21.5 M2.5 12 H5.5 M18.5 12 H21.5 M5.3 5.3 L7.5 7.5 M16.5 16.5 L18.7 18.7 M18.7 5.3 L16.5 7.5 M7.5 16.5 L5.3 18.7"
      stroke="#2E7561"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </Svg>
);

// Chevron Down
const ChevronDownIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
    <Path d="M4.5 7 L9 11.5 L13.5 7" stroke="#2E7561" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ==========================================
// MULTILINGUAL TRANSLATIONS (6 LANGUAGES)
// ==========================================

const I18N_COMPLETE_PROFILE: Record<string, {
  title: string;
  subtitle: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  dobLabel: string;
  dobPlaceholder: string;
  genderLabel: string;
  genderPlaceholder: string;
  rashiLabel: string;
  rashiPlaceholder: string;
  nakshatraLabel: string;
  nakshatraPlaceholder: string;
  saveAndContinue: string;
  saving: string;
  searchNakshatraPlaceholder: string;
  confirm: string;
  cancel: string;
  selectRashiTitle: string;
  selectNakshatraTitle: string;
  selectDobTitle: string;
  selectGenderTitle: string;
  nameRequiredError: string;
  saveSuccess: string;
  saveFailed: string;
  optionalBadge: string;
  clearSelection: string;
}> = {
  te: {
    title: 'మీ ప్రొఫైల్‌ను పూర్తి చేయండి',
    subtitle: 'మీ భక్తి అనుభవాన్ని వ్యక్తిగతీకరించడానికి సహాయపడండి',
    fullNameLabel: 'పూర్తి పేరు',
    fullNamePlaceholder: 'రమేష్ కుమార్',
    dobLabel: 'పుట్టిన తేదీ',
    dobPlaceholder: 'పుట్టిన తేదీని ఎంచుకోండి',
    genderLabel: 'లింగము',
    genderPlaceholder: 'లింగాన్ని ఎంచుకోండి',
    rashiLabel: 'రాశి (Zodiac)',
    rashiPlaceholder: 'మీ రాశిని ఎంచుకోండి (ఐచ్ఛికం)',
    nakshatraLabel: 'నక్షత్రం',
    nakshatraPlaceholder: 'మీ నక్షత్రాన్ని ఎంచుకోండి (ఐచ్ఛికం)',
    saveAndContinue: 'సేవ్ చేసి కొనసాగించండి',
    saving: 'భద్రపరుస్తున్నాము...',
    searchNakshatraPlaceholder: 'నక్షత్రాన్ని వెతకండి...',
    confirm: 'నిర్ధారించండి',
    cancel: 'రద్దు చేయండి',
    selectRashiTitle: 'మీ రాశిని ఎంచుకోండి',
    selectNakshatraTitle: 'మీ నక్షత్రాన్ని ఎంచుకోండి',
    selectDobTitle: 'పుట్టిన తేదీని ఎంచుకోండి',
    selectGenderTitle: 'లింగాన్ని ఎంచుకోండి',
    nameRequiredError: 'దయచేసి మీ పూర్తి పేరు నమోదు చేయండి',
    saveSuccess: 'స్వామియే శరణం అయ్యప్ప! ప్రొఫైల్ విజయవంతంగా సేవ్ చేయబడింది.',
    saveFailed: 'ప్రొఫైల్ సేవ్ చేయడం విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.',
    optionalBadge: 'ఐచ్ఛికం',
    clearSelection: 'ఎంపికను తొలగించు (ఐచ్ఛికం)',
  },
  en: {
    title: 'Complete Your Profile',
    subtitle: 'Help us personalize your devotional experience',
    fullNameLabel: 'Full Name',
    fullNamePlaceholder: 'Enter your name',
    dobLabel: 'Date of Birth',
    dobPlaceholder: 'Select Date of Birth',
    genderLabel: 'Gender',
    genderPlaceholder: 'Select Gender',
    rashiLabel: 'Rashi (Zodiac)',
    rashiPlaceholder: 'Select Rashi (Optional)',
    nakshatraLabel: 'Nakshatram',
    nakshatraPlaceholder: 'Select Nakshatram (Optional)',
    saveAndContinue: 'Save & Continue',
    saving: 'Saving...',
    searchNakshatraPlaceholder: 'Search Nakshatra...',
    confirm: 'Confirm',
    cancel: 'Cancel',
    selectRashiTitle: 'Select Your Rashi',
    selectNakshatraTitle: 'Select Your Nakshatram',
    selectDobTitle: 'Select Date of Birth',
    selectGenderTitle: 'Select Gender',
    nameRequiredError: 'Please enter your full name',
    saveSuccess: 'Swamiye Saranam Ayyappa! Profile saved successfully.',
    saveFailed: 'Failed to save profile. Please try again.',
    optionalBadge: 'Optional',
    clearSelection: 'Clear Selection (Optional)',
  },
  ta: {
    title: 'உங்கள் சுயவிவரத்தை முடிக்கவும்',
    subtitle: 'உங்கள் பக்தி அனுபவத்தைத் தனிப்பயனாக்க எங்களுக்கு உதவுங்கள்',
    fullNameLabel: 'முழுப் பெயர்',
    fullNamePlaceholder: 'ரமேஷ் குமார்',
    dobLabel: 'பிறந்த தேதி',
    dobPlaceholder: 'பிறந்த தேதியைத் தேர்ந்தெடுக்கவும்',
    genderLabel: 'பாலினம்',
    genderPlaceholder: 'பாலினத்தைத் தேர்ந்தெடுக்கவும்',
    rashiLabel: 'ராசி (Zodiac)',
    rashiPlaceholder: 'உங்கள் ராசியைத் தேர்ந்தெடுக்கவும் (விருப்பமானது)',
    nakshatraLabel: 'நட்சத்திரம்',
    nakshatraPlaceholder: 'உங்கள் நட்சத்திரத்தைத் தேர்ந்தெடுக்கவும் (விருப்பமானது)',
    saveAndContinue: 'சேமித்து தொடரவும்',
    saving: 'சேமிக்கிறது...',
    searchNakshatraPlaceholder: 'நட்சத்திரத்தைத் தேடவும்...',
    confirm: 'உறுதி செய்',
    cancel: 'ரத்து செய்',
    selectRashiTitle: 'உங்கள் ராசியைத் தேர்ந்தெடுக்கவும்',
    selectNakshatraTitle: 'உங்கள் நட்சத்திரத்தைத் தேர்ந்தெடுக்கவும்',
    selectDobTitle: 'பிறந்த தேதியைத் தேர்ந்தெடுக்கவும்',
    selectGenderTitle: 'பாலினத்தைத் தேர்ந்தெடுக்கவும்',
    nameRequiredError: 'தயவுசெய்து உங்கள் முழுப் பெயரை உள்ளிடவும்',
    saveSuccess: 'சுவாமியே சரணம் ஐயப்பா! சுயவிவரம் வெற்றிகரமாகச் சேமிக்கப்பட்டது.',
    saveFailed: 'சுயவிவரத்தைச் சேமிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
    optionalBadge: 'விருப்பமானது',
    clearSelection: 'தெரிவை அகற்று (விருப்பமானது)',
  },
  kn: {
    title: 'ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಪೂರ್ಣಗೊಳಿಸಿ',
    subtitle: 'ನಿಮ್ಮ ಭಕ್ತಿ ಅನುಭವವನ್ನು ವೈಯಕ್ತೀಕರಿಸಲು ನಮಗೆ ಸಹಾಯ ಮಾಡಿ',
    fullNameLabel: 'ಪೂರ್ಣ ಹೆಸರು',
    fullNamePlaceholder: 'ರಮೇಶ್ ಕುಮಾರ್',
    dobLabel: 'ಜನ್ಮ ದಿನಾಂಕ',
    dobPlaceholder: 'ಜನ್ಮ ದಿನಾಂಕವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    genderLabel: 'ಲಿಂಗ',
    genderPlaceholder: 'ಲಿಂಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    rashiLabel: 'ರಾಶಿ (Zodiac)',
    rashiPlaceholder: 'ನಿಮ್ಮ ರಾಶಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ (ಐಚ್ಛಿಕ)',
    nakshatraLabel: 'ನಕ್ಷತ್ರ',
    nakshatraPlaceholder: 'ನಿಮ್ಮ ನಕ್ಷತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ (ಐಚ್ಛಿಕ)',
    saveAndContinue: 'ಉಳಿಸಿ ಮತ್ತು ಮುಂದುವರಿಯಿರಿ',
    saving: 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...',
    searchNakshatraPlaceholder: 'ನಕ್ಷತ್ರ ಹುಡುಕಿ...',
    confirm: 'ದೃಢೀಕರಿಸಿ',
    cancel: 'ರದ್ದುಮಾಡಿ',
    selectRashiTitle: 'ನಿಮ್ಮ ರಾಶಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    selectNakshatraTitle: 'ನಿಮ್ಮ ನಕ್ಷತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    selectDobTitle: 'ಜನ್ಮ ದಿನಾಂಕವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    selectGenderTitle: 'ಲಿಂಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    nameRequiredError: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
    saveSuccess: 'ಸ್ವಾಮಿಯೇ ಶರಣಂ ಅಯ್ಯಪ್ಪ! ಪ್ರೊಫೈಲ್ ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ.',
    saveFailed: 'ಪ್ರೊಫೈಲ್ ಉಳಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    optionalBadge: 'ಐಚ್ಛಿಕ',
    clearSelection: 'ಆಯ್ಕೆಯನ್ನು ತೆರವುಗೊಳಿಸಿ (ಐಚ್ಛಿಕ)',
  },
  hi: {
    title: 'अपनी प्रोफ़ाइल पूरी करें',
    subtitle: 'अपने भक्ति अनुभव को वैयक्तिकृत करने में हमारी सहायता करें',
    fullNameLabel: 'पूरा नाम',
    fullNamePlaceholder: 'रमेश कुमार',
    dobLabel: 'जन्म तिथि',
    dobPlaceholder: 'जन्म तिथि चुनें',
    genderLabel: 'लिंग',
    genderPlaceholder: 'लिंग चुनें',
    rashiLabel: 'राशि (Zodiac)',
    rashiPlaceholder: 'अपनी राशि चुनें (वैकल्पिक)',
    nakshatraLabel: 'नक्षत्र',
    nakshatraPlaceholder: 'अपना नक्षत्र चुनें (वैकल्पिक)',
    saveAndContinue: 'सहेजें और आगे बढ़ें',
    saving: 'सहेजा जा रहा है...',
    searchNakshatraPlaceholder: 'नक्षत्र खोजें...',
    confirm: 'पुष्टि करें',
    cancel: 'रद्द करें',
    selectRashiTitle: 'अपनी राशि चुनें',
    selectNakshatraTitle: 'अपना नक्षत्र चुनें',
    selectDobTitle: 'जन्म तिथि चुनें',
    selectGenderTitle: 'लिंग चुनें',
    nameRequiredError: 'कृपया अपना पूरा नाम दर्ज करें',
    saveSuccess: 'स्वामीये शरणम् अय्यप्पा! प्रोफ़ाइल सफलतापूर्वक सहेजी गई।',
    saveFailed: 'प्रोफ़ाइल सहेजने में विफल। कृपया पुन: प्रयास करें।',
    optionalBadge: 'वैकल्पिक',
    clearSelection: 'चयन साफ़ करें (वैकल्पिक)',
  },
  ml: {
    title: 'നിങ്ങളുടെ പ്രൊഫൈൽ പൂർത്തിയാക്കുക',
    subtitle: 'നിങ്ങളുടെ ഭക്തിസാന്ദ്രമായ അനുഭവം വ്യക്തിഗതമാക്കാൻ സഹായിക്കുക',
    fullNameLabel: 'മുഴുവൻ പേര്',
    fullNamePlaceholder: 'രമേഷ് കുമാർ',
    dobLabel: 'ജനന തീയതി',
    dobPlaceholder: 'ജനന തീയതി തിരഞ്ഞെടുക്കുക',
    genderLabel: 'ലിംഗം',
    genderPlaceholder: 'ലിംഗം തിരഞ്ഞെടുക്കുക',
    rashiLabel: 'രാശി (Zodiac)',
    rashiPlaceholder: 'നിങ്ങളുടെ രാശി തിരഞ്ഞെടുക്കുക (ഐച്ഛികം)',
    nakshatraLabel: 'നക്ഷത്രം',
    nakshatraPlaceholder: 'നിങ്ങളുടെ നക്ഷത്രം തിരഞ്ഞെടുക്കുക (ഐച്ഛികം)',
    saveAndContinue: 'സേവ് ചെയ്തു തുടരുക',
    saving: 'സേവ് ചെയ്യുന്നു...',
    searchNakshatraPlaceholder: 'നക്ഷത്രം തിരയുക...',
    confirm: 'സ്ഥിരീകരിക്കുക',
    cancel: 'റദ്ദാക്കുക',
    selectRashiTitle: 'നിങ്ങളുടെ രാശി തിരഞ്ഞെടുക്കുക',
    selectNakshatraTitle: 'നിങ്ങളുടെ നക്ഷത്രം തിരഞ്ഞെടുക്കുക',
    selectDobTitle: 'ജനന തീയതി തിരഞ്ഞെടുക്കുക',
    selectGenderTitle: 'ലിംഗം തിരഞ്ഞെടുക്കുക',
    nameRequiredError: 'ദയവായി നിങ്ങളുടെ മുഴുവൻ പേര് നൽകുക',
    saveSuccess: 'സ്വാമിയേ ശരണം അയ്യപ്പാ! പ്രൊഫൈൽ വിജയകരമായി സേവ് ചെയ്തു.',
    saveFailed: 'പ്രൊഫൈൽ സേവ് ചെയ്യാൻ കഴിഞ്ഞില്ല. വീണ്ടും ശ്രമിക്കുക.',
    optionalBadge: 'ഐച്ഛികം',
    clearSelection: 'തിരഞ്ഞെടുക്കൽ മാറ്റുക (ഐച്ഛികം)',
  },
};

// ==========================================
// 12 VEDIC RASHIS WITH LOCALIZED TITLES
// ==========================================
const MASTER_RASHIS = [
  { id: 1, name: 'Mesha (Aries)', te: 'మేషం (Mesha)', ta: 'மேஷம் (Aries)', kn: 'ಮೇಷ (Aries)', hi: 'मेष (Aries)', ml: 'മേടം (Aries)' },
  { id: 2, name: 'Vrishabha (Taurus)', te: 'వృషభం (Vrishabha)', ta: 'ரிஷபம் (Taurus)', kn: 'ವೃಷಭ (Taurus)', hi: 'वृषभ (Taurus)', ml: 'ഇടവം (Taurus)' },
  { id: 3, name: 'Mithuna (Gemini)', te: 'మిథునం (Mithuna)', ta: 'மிதுனம் (Gemini)', kn: 'ಮಿಥುನ (Gemini)', hi: 'मिथुन (Gemini)', ml: 'മിഥുനം (Gemini)' },
  { id: 4, name: 'Karkataka (Cancer)', te: 'కర్కాటకం (Karkataka)', ta: 'கடகம் (Cancer)', kn: 'ಕರ್ಕಾಟಕ (Cancer)', hi: 'कर्क (Cancer)', ml: 'കർക്കിടകം (Cancer)' },
  { id: 5, name: 'Simha (Leo)', te: 'సింహం (Simha)', ta: 'சிம்மம் (Leo)', kn: 'ಸಿಂಹ (Leo)', hi: 'सिंह (Leo)', ml: 'ചിങ്ങം (Leo)' },
  { id: 6, name: 'Kanya (Virgo)', te: 'కన్య (Kanya)', ta: 'கன்னி (Virgo)', kn: 'ಕನ್ಯಾ (Virgo)', hi: 'कन्या (Virgo)', ml: 'കന്നി (Virgo)' },
  { id: 7, name: 'Tula (Libra)', te: 'తుల (Tula)', ta: 'துலாம் (Libra)', kn: 'ತುಲಾ (Libra)', hi: 'तुला (Libra)', ml: 'തുലാം (Libra)' },
  { id: 8, name: 'Vrischika (Scorpio)', te: 'వృశ్చికం (Vrischika)', ta: 'விருச்சிகம் (Scorpio)', kn: 'ವೃಶ್ಚಿಕ (Scorpio)', hi: 'वृश्चिक (Scorpio)', ml: 'വൃശ്ചികം (Scorpio)' },
  { id: 9, name: 'Dhanus (Sagittarius)', te: 'ధనుస్సు (Dhanus)', ta: 'தனுசு (Sagittarius)', kn: 'ಧನುಸ್ಸು (Sagittarius)', hi: 'धनु (Sagittarius)', ml: 'ധനു (Sagittarius)' },
  { id: 10, name: 'Makara (Capricorn)', te: 'మకరం (Makara)', ta: 'மகரம் (Capricorn)', kn: 'ಮಕರ (Capricorn)', hi: 'मकर (Capricorn)', ml: 'മകരം (Capricorn)' },
  { id: 11, name: 'Kumbha (Aquarius)', te: 'కుంభం (Kumbha)', ta: 'கும்பம் (Aquarius)', kn: 'ಕುಂಭ (Aquarius)', hi: 'कुंभ (Aquarius)', ml: 'കുംഭം (Aquarius)' },
  { id: 12, name: 'Meena (Pisces)', te: 'మీనం (Meena)', ta: 'மீனம் (Pisces)', kn: 'ಮೀನ (Pisces)', hi: 'मीन (Pisces)', ml: 'മീനം (Pisces)' },
];

// ==========================================
// 27 VEDIC NAKSHATRAS
// ==========================================
const MASTER_NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttareashada', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];

// Date formatting helpers
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const CompleteProfileScreen: React.FC<Props> = ({
  currentLanguage = 'en',
  currentUser,
  onProfileSaved,
  onBack,
  onSkip,
}) => {
  const activeLang = currentLanguage in I18N_COMPLETE_PROFILE ? currentLanguage : 'en';
  const t = I18N_COMPLETE_PROFILE[activeLang] || I18N_COMPLETE_PROFILE.en;

  // Helper to format DOB string (e.g. "2000-07-16" -> "16 Jul 2000")
  const formatInitialDob = (dateVal?: any): string => {
    if (!dateVal) return '';
    try {
      const raw = String(dateVal).split('T')[0];
      const parts = raw.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        if (!isNaN(d) && !isNaN(m) && !isNaN(y) && MONTHS_SHORT[m]) {
          return `${d} ${MONTHS_SHORT[m]} ${y}`;
        }
      }
    } catch {}
    return '';
  };

  // Form State - strictly dynamic, initialized from currentUser, never static dummy person
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [dobDisplay, setDobDisplay] = useState(currentUser?.dateOfBirth ? formatInitialDob(currentUser.dateOfBirth) : '');
  const [dobYmd, setDobYmd] = useState(currentUser?.dateOfBirth ? String(currentUser.dateOfBirth).split('T')[0] : '');
  const [gender, setGender] = useState(currentUser?.gender || '');
  const [selectedRashiId, setSelectedRashiId] = useState<number | null>(currentUser?.rashiId || null);
  const [selectedRashiName, setSelectedRashiName] = useState<string>(currentUser?.rashiName || '');
  const [selectedNakshatraId, setSelectedNakshatraId] = useState<number | null>(currentUser?.nakshatraId || null);
  const [selectedNakshatraName, setSelectedNakshatraName] = useState<string>(currentUser?.nakshatraName || '');

  // Modals
  const [rashiModalOpen, setRashiModalOpen] = useState(false);
  const [nakshatraModalOpen, setNakshatraModalOpen] = useState(false);
  const [genderModalOpen, setGenderModalOpen] = useState(false);
  const [dobModalOpen, setDobModalOpen] = useState(false);

  // DOB Picker temporary state - default wheel to 1 Jan 2000 for convenience when opening picker
  const [tempDay, setTempDay] = useState(1);
  const [tempMonth, setTempMonth] = useState(0); // Jan (0-indexed)
  const [tempYear, setTempYear] = useState(2000);

  // Search filter for Nakshatras
  const [nakshatraSearch, setNakshatraSearch] = useState('');

  // Status & Feedback
  const [saving, setSaving] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [nameError, setNameError] = useState<string | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);
  };

  // Back handling
  useEffect(() => {
    const handleHardwareBack = () => {
      if (rashiModalOpen) {
        setRashiModalOpen(false);
        return true;
      }
      if (nakshatraModalOpen) {
        setNakshatraModalOpen(false);
        return true;
      }
      if (genderModalOpen) {
        setGenderModalOpen(false);
        return true;
      }
      if (dobModalOpen) {
        setDobModalOpen(false);
        return true;
      }
      if (onBack) {
        onBack();
        return true;
      }
      return false;
    };

    const backSub = BackHandler.addEventListener('hardwareBackPress', handleHardwareBack);
    return () => backSub.remove();
  }, [rashiModalOpen, nakshatraModalOpen, genderModalOpen, dobModalOpen, onBack]);

  // Load existing profile from backend on mount (strictly for authenticated devotee)
  useEffect(() => {
    let isMounted = true;
    async function fetchExistingProfile() {
      const userId = currentUser?.id;
      if (!userId || currentUser?.isGuest || isNaN(Number(userId))) return;

      try {
        const profile = await ApiService.getDevoteeProfile(Number(userId), activeLang as SupportedLanguage);
        if (profile && isMounted) {
          if (profile.fullName) setFullName(profile.fullName);
          if (profile.gender) setGender(profile.gender);
          if (profile.dateOfBirth) {
            const raw = String(profile.dateOfBirth).split('T')[0];
            setDobYmd(raw);
            const parts = raw.split('-');
            if (parts.length === 3) {
              const y = parseInt(parts[0], 10);
              const m = parseInt(parts[1], 10) - 1;
              const d = parseInt(parts[2], 10);
              if (!isNaN(d) && !isNaN(m) && !isNaN(y) && MONTHS_SHORT[m]) {
                setDobDisplay(`${d} ${MONTHS_SHORT[m]} ${y}`);
                setTempDay(d);
                setTempMonth(m);
                setTempYear(y);
              }
            }
          }
          if (profile.rashiId) {
            setSelectedRashiId(profile.rashiId);
            const found = MASTER_RASHIS.find((r) => r.id === profile.rashiId);
            if (found) setSelectedRashiName(found.name);
          }
          if (profile.nakshatraId) {
            setSelectedNakshatraId(profile.nakshatraId);
            const foundName = MASTER_NAKSHATRAS[profile.nakshatraId - 1];
            if (foundName) setSelectedNakshatraName(foundName);
          }
        }
      } catch (e) {
        // Backend offline / network error; retain user state
      }
    }

    fetchExistingProfile();
    return () => {
      isMounted = false;
    };
  }, [currentUser, activeLang]);

  // Handle Date Confirm
  const handleConfirmDob = () => {
    const formattedYmd = `${tempYear}-${String(tempMonth + 1).padStart(2, '0')}-${String(tempDay).padStart(2, '0')}`;
    const formattedDisplay = `${tempDay} ${MONTHS_SHORT[tempMonth]} ${tempYear}`;
    setDobYmd(formattedYmd);
    setDobDisplay(formattedDisplay);
    setDobModalOpen(false);
  };

  // Handle Save & Continue
  const handleSaveProfile = async () => {
    setNameError(null);
    const trimmedName = fullName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setNameError(t.nameRequiredError);
      showToast(t.nameRequiredError, 'error');
      return;
    }

    setSaving(true);
    const userId = currentUser?.id;
    if (!userId) {
      setSaving(false);
      showToast('Devotee session not found. Please log in first.', 'error');
      return;
    }

    const payload: Partial<DevoteeProfile> = {
      fullName: trimmedName,
      dateOfBirth: dobYmd || null,
      gender: gender ? gender.trim() : null,
      rashiId: selectedRashiId || null,
      nakshatraId: selectedNakshatraId || null,
      profileOnboardingStatus: 'COMPLETED',
    };

    try {
      const updated = await ApiService.updateDevoteeProfile(userId, payload);
      setSaving(false);
      showToast(t.saveSuccess, 'success');

      const mergedUser = (updated as any)?.user || updated || {
        ...currentUser,
        ...payload,
        profileOnboardingStatus: 'COMPLETED',
      };

      // Persist in local storage
      await StorageService.setStoredUser(mergedUser);

      setTimeout(() => {
        onProfileSaved(mergedUser);
      }, 700);
    } catch (err: any) {
      console.warn('Backend updateDevoteeProfile failed, persisting locally:', err);
      // Persist locally so devotee is never blocked from proceeding
      const fallbackUser = {
        ...currentUser,
        ...payload,
        profileOnboardingStatus: 'COMPLETED',
      };
      await StorageService.setStoredUser(fallbackUser);
      setSaving(false);
      showToast(t.saveSuccess, 'success');
      setTimeout(() => {
        onProfileSaved(fallbackUser);
      }, 700);
    }
  };

  // Filtered Nakshatras list
  const filteredNakshatras = MASTER_NAKSHATRAS.map((name, index) => ({
    id: index + 1,
    name,
  })).filter((item) =>
    item.name.toLowerCase().includes(nakshatraSearch.trim().toLowerCase())
  );

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8EB" translucent={false} />

      {/* Floating Toast Notification */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ====================================================
              1. DEVOTIONAL HEADER WITH CORNER ORNAMENTS & TEMPLE
             ==================================================== */}
          <View style={styles.headerContainer}>
            {/* Top subtle golden glow */}
            <LinearGradient
              colors={['rgba(233, 183, 104, 0.45)', 'rgba(255, 248, 235, 0.1)', 'transparent']}
              style={styles.headerTopGlow}
            />

            {/* Corner Ornaments */}
            <View style={styles.cornerLeftWrapper}>
              <CornerOrnamentLeft />
            </View>
            <View style={styles.cornerRightWrapper}>
              <CornerOrnamentRight />
            </View>

            {/* Central Temple Gopuram Motif */}
            <View style={styles.templeMotifWrapper}>
              <TempleGopuramHeaderMotif />
            </View>

            {/* Title & Subtitle */}
            <Text style={styles.headerTitle}>{t.title}</Text>
            <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
          </View>

          {/* ====================================================
              2. FIVE VERTICALLY STACKED PROFILE FIELDS
             ==================================================== */}
          <View style={styles.formContainer}>
            {/* Field 1: Full Name */}
            <View style={[styles.fieldCard, nameError ? styles.fieldCardError : null]}>
              <View style={styles.fieldIconWrapper}>
                <UserIcon />
              </View>
              <View style={styles.fieldContentWrapper}>
                <Text style={styles.fieldTopLabel}>{t.fullNameLabel}</Text>
                <TextInput
                  style={styles.fieldTextInput}
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    if (nameError) setNameError(null);
                  }}
                  placeholder={t.fullNamePlaceholder}
                  placeholderTextColor="#927A69"
                  autoCapitalize="words"
                  accessibilityLabel={t.fullNameLabel}
                />
              </View>
            </View>
            {nameError && <Text style={styles.fieldErrorText}>{nameError}</Text>}

            {/* Field 2: Date of Birth */}
            <TouchableOpacity
              style={styles.fieldCard}
              activeOpacity={0.82}
              onPress={() => setDobModalOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={t.dobLabel}
            >
              <View style={styles.fieldIconWrapper}>
                <CalendarIcon />
              </View>
              <View style={styles.fieldContentWrapper}>
                <Text style={styles.fieldTopLabel}>{t.dobLabel}</Text>
                <Text style={[styles.fieldValueText, !dobDisplay && styles.fieldPlaceholderText]}>
                  {dobDisplay || t.dobPlaceholder}
                </Text>
              </View>
              <View style={styles.fieldChevronWrapper}>
                <ChevronDownIcon />
              </View>
            </TouchableOpacity>

            {/* Field 3: Gender */}
            <TouchableOpacity
              style={styles.fieldCard}
              activeOpacity={0.82}
              onPress={() => setGenderModalOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={t.genderLabel}
            >
              <View style={styles.fieldIconWrapper}>
                <GenderIcon />
              </View>
              <View style={styles.fieldContentWrapper}>
                <Text style={styles.fieldTopLabel}>{t.genderLabel}</Text>
                <Text style={[styles.fieldValueText, !gender && styles.fieldPlaceholderText]}>
                  {gender || t.genderPlaceholder}
                </Text>
              </View>
              <View style={styles.fieldChevronWrapper}>
                <ChevronDownIcon />
              </View>
            </TouchableOpacity>

            {/* Field 4: Rashi (Zodiac) */}
            <TouchableOpacity
              style={styles.fieldCard}
              activeOpacity={0.82}
              onPress={() => setRashiModalOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={t.rashiLabel}
            >
              <View style={styles.fieldIconWrapper}>
                <TempleShrineIcon />
              </View>
              <View style={styles.fieldContentWrapper}>
                <View style={styles.labelWithBadgeRow}>
                  <Text style={styles.fieldTopLabel}>{t.rashiLabel}</Text>
                  <View style={styles.optionalBadge}>
                    <Text style={styles.optionalBadgeText}>{t.optionalBadge || 'Optional'}</Text>
                  </View>
                </View>
                <Text style={[styles.fieldValueText, !selectedRashiName && styles.fieldPlaceholderText]} numberOfLines={1}>
                  {selectedRashiName || t.rashiPlaceholder}
                </Text>
              </View>
              <View style={styles.fieldChevronWrapper}>
                <ChevronDownIcon />
              </View>
            </TouchableOpacity>

            {/* Field 5: Nakshatram */}
            <TouchableOpacity
              style={styles.fieldCard}
              activeOpacity={0.82}
              onPress={() => {
                setNakshatraSearch('');
                setNakshatraModalOpen(true);
              }}
              accessibilityRole="button"
              accessibilityLabel={t.nakshatraLabel}
            >
              <View style={styles.fieldIconWrapper}>
                <SacredChakraIcon />
              </View>
              <View style={styles.fieldContentWrapper}>
                <View style={styles.labelWithBadgeRow}>
                  <Text style={styles.fieldTopLabel}>{t.nakshatraLabel}</Text>
                  <View style={styles.optionalBadge}>
                    <Text style={styles.optionalBadgeText}>{t.optionalBadge || 'Optional'}</Text>
                  </View>
                </View>
                <Text style={[styles.fieldValueText, !selectedNakshatraName && styles.fieldPlaceholderText]} numberOfLines={1}>
                  {selectedNakshatraName || t.nakshatraPlaceholder}
                </Text>
              </View>
              <View style={styles.fieldChevronWrapper}>
                <ChevronDownIcon />
              </View>
            </TouchableOpacity>
          </View>

          {/* ====================================================
              3. ACTION CTA: SAVE & CONTINUE BUTTON
             ==================================================== */}
          <View style={styles.ctaContainer}>
            <TouchableOpacity
              style={styles.saveCtaWrapper}
              activeOpacity={0.88}
              disabled={saving}
              onPress={handleSaveProfile}
              accessibilityRole="button"
              accessibilityLabel={t.saveAndContinue}
            >
              <LinearGradient
                colors={['#173D32', '#173D32', '#0C251E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.saveCtaButton}
              >
                {saving ? (
                  <View style={styles.ctaRow}>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                    <Text style={[styles.saveCtaText, { marginLeft: 10 }]}>{t.saving}</Text>
                  </View>
                ) : (
                  <Text style={styles.saveCtaText}>{t.saveAndContinue}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ====================================================
          MODAL 1: GENDER SELECTION
         ==================================================== */}
      <Modal visible={genderModalOpen} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setGenderModalOpen(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t.selectGenderTitle}</Text>
            {GENDER_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.modalOptionRow, gender === opt && styles.modalOptionSelected]}
                onPress={() => {
                  setGender(opt);
                  setGenderModalOpen(false);
                }}
              >
                <Text style={[styles.modalOptionText, gender === opt && styles.modalOptionTextSelected]}>
                  {opt}
                </Text>
                {gender === opt && <Text style={styles.modalCheckmark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ====================================================
          MODAL 2: RASHI (ZODIAC) SELECTION (12 RASHIS)
         ==================================================== */}
      <Modal visible={rashiModalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalSheetHeader}>
              <Text style={styles.modalTitle}>{t.selectRashiTitle}</Text>
              <TouchableOpacity onPress={() => setRashiModalOpen(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Clear / None Option (Optional) */}
            <TouchableOpacity
              style={[styles.modalOptionRow, !selectedRashiId && styles.modalOptionSelected, { backgroundColor: '#F9F5EC' }]}
              onPress={() => {
                setSelectedRashiId(null);
                setSelectedRashiName('');
                setRashiModalOpen(false);
              }}
            >
              <Text style={[styles.modalOptionText, !selectedRashiId && styles.modalOptionTextSelected, { fontStyle: 'italic', color: '#7D6A58' }]}>
                — {t.clearSelection} —
              </Text>
              {!selectedRashiId && <Text style={styles.modalCheckmark}>✓</Text>}
            </TouchableOpacity>

            <FlatList
              data={MASTER_RASHIS}
              keyExtractor={(item) => String(item.id)}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = selectedRashiId === item.id;
                const localized = (item as any)[activeLang] || item.name;
                return (
                  <TouchableOpacity
                    style={[styles.modalOptionRow, isSelected && styles.modalOptionSelected]}
                    onPress={() => {
                      setSelectedRashiId(item.id);
                      setSelectedRashiName(item.name);
                      setRashiModalOpen(false);
                    }}
                  >
                    <Text style={[styles.modalOptionText, isSelected && styles.modalOptionTextSelected]}>
                      {localized}
                    </Text>
                    {isSelected && <Text style={styles.modalCheckmark}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      {/* ====================================================
          MODAL 3: NAKSHATRAM SELECTION (27 NAKSHATRAS)
         ==================================================== */}
      <Modal visible={nakshatraModalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalSheetHeader}>
              <Text style={styles.modalTitle}>{t.selectNakshatraTitle}</Text>
              <TouchableOpacity onPress={() => setNakshatraModalOpen(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Clear / None Option (Optional) */}
            <TouchableOpacity
              style={[styles.modalOptionRow, !selectedNakshatraId && styles.modalOptionSelected, { backgroundColor: '#F9F5EC' }]}
              onPress={() => {
                setSelectedNakshatraId(null);
                setSelectedNakshatraName('');
                setNakshatraModalOpen(false);
              }}
            >
              <Text style={[styles.modalOptionText, !selectedNakshatraId && styles.modalOptionTextSelected, { fontStyle: 'italic', color: '#7D6A58' }]}>
                — {t.clearSelection} —
              </Text>
              {!selectedNakshatraId && <Text style={styles.modalCheckmark}>✓</Text>}
            </TouchableOpacity>

            {/* Search Input */}
            <View style={styles.modalSearchBox}>
              <TextInput
                style={styles.modalSearchInput}
                placeholder={t.searchNakshatraPlaceholder}
                placeholderTextColor="#927A69"
                value={nakshatraSearch}
                onChangeText={setNakshatraSearch}
              />
            </View>

            <FlatList
              data={filteredNakshatras}
              keyExtractor={(item) => String(item.id)}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = selectedNakshatraId === item.id;
                return (
                  <TouchableOpacity
                    style={[styles.modalOptionRow, isSelected && styles.modalOptionSelected]}
                    onPress={() => {
                      setSelectedNakshatraId(item.id);
                      setSelectedNakshatraName(item.name);
                      setNakshatraModalOpen(false);
                    }}
                  >
                    <Text style={[styles.modalOptionText, isSelected && styles.modalOptionTextSelected]}>
                      {item.id}. {item.name}
                    </Text>
                    {isSelected && <Text style={styles.modalCheckmark}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      {/* ====================================================
          MODAL 4: DATE OF BIRTH PICKER
         ==================================================== */}
      <Modal visible={dobModalOpen} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t.selectDobTitle}</Text>

            {/* Columns: Day | Month | Year */}
            <View style={styles.dobPickersRow}>
              {/* Day Column */}
              <View style={styles.dobColumn}>
                <Text style={styles.dobColumnHeader}>Day</Text>
                <ScrollView style={styles.dobScrollList} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <TouchableOpacity
                      key={d}
                      style={[styles.dobItem, tempDay === d && styles.dobItemSelected]}
                      onPress={() => setTempDay(d)}
                    >
                      <Text style={[styles.dobItemText, tempDay === d && styles.dobItemTextSelected]}>
                        {d}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Month Column */}
              <View style={styles.dobColumn}>
                <Text style={styles.dobColumnHeader}>Month</Text>
                <ScrollView style={styles.dobScrollList} showsVerticalScrollIndicator={false}>
                  {MONTHS_SHORT.map((m, idx) => (
                    <TouchableOpacity
                      key={m}
                      style={[styles.dobItem, tempMonth === idx && styles.dobItemSelected]}
                      onPress={() => setTempMonth(idx)}
                    >
                      <Text style={[styles.dobItemText, tempMonth === idx && styles.dobItemTextSelected]}>
                        {m}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Year Column */}
              <View style={styles.dobColumn}>
                <Text style={styles.dobColumnHeader}>Year</Text>
                <ScrollView style={styles.dobScrollList} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 85 }, (_, i) => 2026 - i).map((y) => (
                    <TouchableOpacity
                      key={y}
                      style={[styles.dobItem, tempYear === y && styles.dobItemSelected]}
                      onPress={() => setTempYear(y)}
                    >
                      <Text style={[styles.dobItemText, tempYear === y && styles.dobItemTextSelected]}>
                        {y}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Buttons Row */}
            <View style={styles.dobActionsRow}>
              <TouchableOpacity
                style={styles.dobCancelBtn}
                onPress={() => setDobModalOpen(false)}
              >
                <Text style={styles.dobCancelText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dobConfirmBtn}
                onPress={handleConfirmDob}
              >
                <Text style={styles.dobConfirmText}>{t.confirm}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFF8EB',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: Math.max(34, SCREEN_HEIGHT * 0.05),
    alignItems: 'center',
  },

  // 1. Header Styles
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    position: 'relative',
    paddingTop: 12,
    paddingBottom: 18,
  },
  headerTopGlow: {
    position: 'absolute',
    top: 0,
    left: -20,
    right: -20,
    height: 70,
  },
  cornerLeftWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cornerRightWrapper: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  templeMotifWrapper: {
    marginTop: 6,
    marginBottom: 6,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: SCREEN_HEIGHT < 700 ? 22 : 25,
    fontWeight: '700',
    color: '#173D32',
    textAlign: 'center',
    letterSpacing: 0.3,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 13.5,
    color: '#345147',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },

  // 2. Form Styles
  formContainer: {
    width: '100%',
    gap: 12,
    marginTop: 6,
  },
  fieldCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF8',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#E6C898',
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#071914',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  fieldCardError: {
    borderColor: '#D32F2F',
  },
  fieldErrorText: {
    color: '#D32F2F',
    fontSize: 12,
    marginLeft: 6,
    marginTop: -4,
  },
  fieldIconWrapper: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  fieldContentWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  labelWithBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },
  optionalBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    backgroundColor: '#F3EADB',
    borderWidth: 0.6,
    borderColor: '#DFB460',
  },
  optionalBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#8A5D18',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  fieldTopLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7D6A58',
    marginBottom: 1,
    letterSpacing: 0.2,
  },
  fieldTextInput: {
    fontSize: 16,
    fontWeight: '700',
    color: '#173D32',
    paddingVertical: 0,
    paddingHorizontal: 0,
    height: 24,
  },
  fieldValueText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#173D32',
    letterSpacing: 0.2,
  },
  fieldPlaceholderText: {
    color: '#927A69',
    fontWeight: '400',
  },
  fieldChevronWrapper: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 3. CTA Styles
  ctaContainer: {
    width: '100%',
    marginTop: 24,
    alignItems: 'center',
  },
  saveCtaWrapper: {
    width: '100%',
    borderRadius: 26,
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.32,
    shadowRadius: 6,
    elevation: 4,
  },
  saveCtaButton: {
    borderRadius: 26,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(235, 196, 118, 0.65)',
  },
  saveCtaText: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Modals Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(25, 12, 10, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.75,
    backgroundColor: '#FFFDF8',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E6C898',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  modalSheet: {
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.78,
    backgroundColor: '#FFFDF8',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E6C898',
  },
  modalSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 18,
    fontWeight: '700',
    color: '#173D32',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalCloseText: {
    fontSize: 20,
    color: '#2E7561',
    fontWeight: '700',
    paddingHorizontal: 8,
  },
  modalSearchBox: {
    backgroundColor: '#FFF8EB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6C898',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  modalSearchInput: {
    fontSize: 14,
    color: '#173D32',
    padding: 0,
  },
  modalOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginVertical: 2,
  },
  modalOptionSelected: {
    backgroundColor: 'rgba(134, 27, 37, 0.08)',
  },
  modalOptionText: {
    fontSize: 15,
    color: '#173D32',
    fontWeight: '500',
  },
  modalOptionTextSelected: {
    color: '#173D32',
    fontWeight: '700',
  },
  modalCheckmark: {
    fontSize: 16,
    color: '#173D32',
    fontWeight: '700',
  },

  // DOB Picker modal styles
  dobPickersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 180,
    marginVertical: 10,
  },
  dobColumn: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#FFF8EB',
    borderRadius: 12,
    paddingVertical: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6C898',
  },
  dobColumnHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7D6A58',
    marginBottom: 4,
  },
  dobScrollList: {
    width: '100%',
  },
  dobItem: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  dobItemSelected: {
    backgroundColor: '#173D32',
    borderRadius: 6,
    marginHorizontal: 4,
  },
  dobItemText: {
    fontSize: 14,
    color: '#173D32',
    fontWeight: '600',
  },
  dobItemTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dobActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 14,
  },
  dobCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  dobCancelText: {
    fontSize: 14,
    color: '#7D6A58',
    fontWeight: '600',
  },
  dobConfirmBtn: {
    backgroundColor: '#173D32',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  dobConfirmText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

