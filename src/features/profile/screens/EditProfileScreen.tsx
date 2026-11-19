import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Switch,
  Modal,
  FlatList,
  Platform,
  ActivityIndicator,
  BackHandler,
  SafeAreaView,
  StatusBar,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Path,
  Circle,
  Rect,
  Polygon,
  G,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from 'react-native-svg';
import { ApiService } from '../../../services/api';
import { StorageService } from '../../../services/storageService';
import { SupportedLanguage, RashiItem, NakshatraItem, DevoteeProfile, DeityItem } from '../../../types';
import { Toast } from '../../../components/common/Toast';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  currentLanguage: SupportedLanguage;
  currentUser?: any;
  onLanguageChange?: (lang: SupportedLanguage) => void;
  onProfileSaved?: (updatedUser?: any) => void;
  onSkip?: () => void;
  onBack?: () => void;
  isOnboarding?: boolean;
  onNavigateTab?: (tab: 'home' | 'categories' | 'profile') => void;
}

const AYYAPPA_EMBLEM = require('../../../assets/images/ayyappa_emblem_approved.png');
const DEVOTEE_DEFAULT_AVATAR = require('../../../assets/images/devotee_avatar_default.png');

// --- PURE SVG DEVOTIONAL ORNAMENTS & ICONS ---

// 1. Back Arrow in Ivory Circle
const BackArrowIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M12 19l-7-7 7-7"
      stroke="#173D32"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 2. Brass Hanging Bells (Left & Right of Devotional Header)
const HangingBell = () => (
  <Svg width={22} height={38} viewBox="0 0 22 38" fill="none">
    {/* Bell hanging chain */}
    <Path d="M11 0 V16" stroke="#DFA62E" strokeWidth="1.2" strokeDasharray="2,2" />
    <Circle cx="11" cy="16" r="1.5" fill="#DFA62E" />
    {/* Bell body */}
    <Path
      d="M6 19 C6 14 16 14 16 19 L18 28 C18 29.5 16.5 30 11 30 C5.5 30 4 29.5 4 28 L6 19 Z"
      fill="#DFA62E"
      stroke="#B8860B"
      strokeWidth="1"
    />
    <Path d="M4 28 C4 28 6 31 11 31 C16 31 18 28 18 28" stroke="#F4C95D" strokeWidth="1.2" />
    {/* Clapper / tongue */}
    <Circle cx="11" cy="33" r="2.2" fill="#B8860B" />
  </Svg>
);

// 3. Header Corner Filigree Arch
const CornerFiligree = ({ flipped = false }: { flipped?: boolean }) => (
  <Svg
    width={48}
    height={48}
    viewBox="0 0 48 48"
    fill="none"
    style={{ transform: [{ scaleX: flipped ? -1 : 1 }] }}
  >
    <Path
      d="M0 0 C24 0 44 20 44 44 V48 H48 V0 H0 Z"
      fill="rgba(223, 166, 46, 0.15)"
    />
    <Path
      d="M2 2 C22 2 40 20 40 40"
      stroke="#DFA62E"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <Path
      d="M6 6 C20 6 34 20 34 34"
      stroke="#F4C95D"
      strokeWidth="0.8"
      strokeLinecap="round"
      strokeDasharray="2,2"
    />
    <Circle cx="12" cy="12" r="2" fill="#DFA62E" />
  </Svg>
);

// 4. Delicate Golden Flower Ornament for Section Titles
const FloralFiligree = () => (
  <Svg width={36} height={18} viewBox="0 0 36 18" fill="none">
    <Path d="M0 9 H12 M24 9 H36" stroke="#DFA62E" strokeWidth="1" strokeLinecap="round" />
    <Circle cx="18" cy="9" r="2" fill="#DFA62E" />
    <Path d="M18 3 C18 3 15 7 15 9 C15 11 18 15 18 15 C18 15 21 11 21 9 C21 7 18 3 18 3 Z" fill="#DFA62E" opacity={0.8} />
    <Circle cx="13" cy="9" r="1" fill="#DFA62E" />
    <Circle cx="23" cy="9" r="1" fill="#DFA62E" />
  </Svg>
);

// 5. Header Subtitle Lotus Line
const HeaderSubtitleFiligree = () => (
  <Svg width={120} height={14} viewBox="0 0 120 14" fill="none">
    <Path d="M4 7 H46 M74 7 H116" stroke="#DFA62E" strokeWidth="1" strokeLinecap="round" />
    <Circle cx="60" cy="7" r="2.5" fill="#DFA62E" />
    <Circle cx="52" cy="7" r="1.5" fill="#F4C95D" />
    <Circle cx="68" cy="7" r="1.5" fill="#F4C95D" />
    <Polygon points="60,1 63,5 60,6 57,5" fill="#DFA62E" />
  </Svg>
);

// 6. Camera Badge Icon
const CameraBadgeIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path
      d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
      fill="#FFFFFF"
    />
    <Circle cx="12" cy="13" r="4" fill="#E65100" />
    <Circle cx="12" cy="13" r="2" fill="#FFFFFF" />
  </Svg>
);

// 7. Verified Badge Checkmark
const VerifiedCheckIcon = () => (
  <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="#16A34A" />
    <Path
      d="M7 12l3.5 3.5L17 8.5"
      stroke="#FFFFFF"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 8. Field Icons
const PersonFieldIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="7" r="4" stroke="#173D32" strokeWidth={2} />
    <Path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" stroke="#173D32" strokeWidth={2} />
  </Svg>
);

const CalendarFieldIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="18" rx="2" stroke="#173D32" strokeWidth={2} />
    <Path d="M16 2v4M8 2v4M3 10h18" stroke="#173D32" strokeWidth={2} />
  </Svg>
);

const GenderFieldIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="4.5" stroke="#173D32" strokeWidth={2} />
    <Path d="M12 12.5V21M9 17h6" stroke="#173D32" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const ZodiacFieldIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21V9M6 3c3 0 6 3 6 6M18 3c-3 0-6 3-6 6"
      stroke="#173D32"
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

const StarFieldIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Polygon
      points="12,2 15,8 22,9 17,14 18,21 12,17.5 6,21 7,14 2,9 9,8"
      stroke="#173D32"
      strokeWidth={1.8}
      fill="none"
    />
  </Svg>
);

const MailFieldIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="4" width="20" height="16" rx="2" stroke="#173D32" strokeWidth={2} />
    <Path d="M22 6l-10 7L2 6" stroke="#173D32" strokeWidth={2} />
  </Svg>
);

const HomeFieldIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9.5z" stroke="#173D32" strokeWidth={2} />
    <Path d="M9 21v-6h6v6" stroke="#173D32" strokeWidth={2} />
  </Svg>
);

const PinFieldIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
      stroke="#173D32"
      strokeWidth={2}
    />
    <Circle cx="12" cy="9" r="2.5" fill="#173D32" />
  </Svg>
);

const GlobeFieldIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke="#173D32" strokeWidth={2} />
    <Path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="#173D32" strokeWidth={2} />
  </Svg>
);

const BellFieldIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
      stroke="#D84315"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const TempleFieldIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2l8 5v2H4V7l8-5zM4 11h16v2H4v-2zM6 13v6M10 13v6M14 13v6M18 13v6M3 19h18v3H3v-3z" stroke="#173D32" strokeWidth={1.8} />
  </Svg>
);

const ChevronDownIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M6 9l6 6 6-6" stroke="#173D32" strokeWidth={2.2} strokeLinecap="round" />
  </Svg>
);

// 9. Bottom Standing Brass Lamp (Deepam / Vilakku)
const StandingBrassLamp = () => (
  <Svg width={36} height={70} viewBox="0 0 36 70" fill="none">
    {/* Lamp flame */}
    <Path
      d="M18 2 C18 2 21 7 21 9.5 C21 11.5 19.5 13 18 13 C16.5 13 15 11.5 15 9.5 C15 7 18 2 18 2 Z"
      fill="#FF9800"
    />
    <Path
      d="M18 5 C18 5 19.5 7.5 19.5 9 C19.5 10.2 18.8 11 18 11 C17.2 11 16.5 10.2 16.5 9 C16.5 7.5 18 5 18 5 Z"
      fill="#FFD54F"
    />
    {/* Diya bowl */}
    <Path d="M11 13 H25 C25 13 23 17 18 17 C13 17 11 13 11 13 Z" fill="#DFA62E" stroke="#B8860B" strokeWidth="1" />
    <Circle cx="18" cy="18" r="1.5" fill="#DFA62E" />
    {/* Central pillar */}
    <Path d="M17 19 H19 V48 H17 Z" fill="#DFA62E" />
    <Circle cx="18" cy="30" r="3" fill="#DFA62E" stroke="#B8860B" strokeWidth="0.8" />
    <Circle cx="18" cy="40" r="2.5" fill="#DFA62E" stroke="#B8860B" strokeWidth="0.8" />
    {/* Base tiered stand */}
    <Path d="M12 48 H24 L22 52 H14 Z" fill="#DFA62E" stroke="#B8860B" strokeWidth="0.8" />
    <Path d="M8 52 H28 L27 58 H9 Z" fill="#DFA62E" stroke="#B8860B" strokeWidth="0.8" />
    <Path d="M5 58 H31 V63 H5 Z" fill="#B8860B" />
  </Svg>
);

// 10. Central Sabarimala Temple Gopuram Illustration
const SabarimalaTempleArtwork = () => (
  <Svg width={140} height={60} viewBox="0 0 140 60" fill="none">
    {/* Golden pinnacle kalasha */}
    <Circle cx="70" cy="5" r="2.5" fill="#FFD54F" />
    <Path d="M68 7.5 H72 L71 10 H69 Z" fill="#DFA62E" />
    {/* Top tier spire */}
    <Polygon points="70,10 76,17 64,17" fill="#DFA62E" stroke="#B8860B" strokeWidth="0.8" />
    {/* Middle tier */}
    <Polygon points="70,15 84,27 56,27" fill="#DFA62E" stroke="#B8860B" strokeWidth="0.8" />
    {/* Broad roof tier with eaves */}
    <Path
      d="M70 24 L98 40 C98 40 96 42 92 42 H48 C44 42 42 40 42 40 L70 24 Z"
      fill="#DFA62E"
      stroke="#B8860B"
      strokeWidth="0.8"
    />
    {/* Temple Sanctum Base & Pillars */}
    <Rect x="46" y="42" width="48" height="16" fill="#F4C95D" stroke="#B8860B" strokeWidth="0.8" />
    {/* Sanctum doorway with glow */}
    <Path d="M64 58 V46 Q70 43 76 46 V58 Z" fill="#173D32" />
    <Path d="M66 58 V48 Q70 45 74 48 V58 Z" fill="#FFD54F" opacity={0.8} />
    {/* Side miniature shrines */}
    <Polygon points="38,34 46,42 30,42" fill="#DFA62E" />
    <Rect x="32" y="42" width="12" height="16" fill="#F4C95D" />
    <Polygon points="102,34 110,42 94,42" fill="#DFA62E" />
    <Rect x="96" y="42" width="12" height="16" fill="#F4C95D" />
  </Svg>
);

// --- STATIC MASTER DEITIES LIST ---
const MASTER_DEITIES = [
  { id: 'ayyappa', label: 'Lord Ayyappa (Swamiye Ayyappa)' },
  { id: 'shiva', label: 'Lord Shiva (Maha Deva)' },
  { id: 'venkateswara', label: 'Lord Venkateswara (Balaji)' },
  { id: 'durga', label: 'Goddess Durga (Devi)' },
  { id: 'ganesha', label: 'Lord Ganesha (Vinayaka)' },
  { id: 'hanuman', label: 'Lord Hanuman (Anjaneya)' },
  { id: 'krishna', label: 'Lord Krishna (Guruvayurappan)' },
  { id: 'rama', label: 'Lord Sri Rama' },
  { id: 'murugan', label: 'Lord Murugan (Kartikeya)' },
];

// --- STATIC MAJOR STATES & DISTRICTS ---
const INDIAN_STATES = [
  'Andhra Pradesh',
  'Telangana',
  'Kerala',
  'Tamil Nadu',
  'Karnataka',
  'Maharashtra',
  'Odisha',
  'Delhi',
  'Gujarat',
  'Madhya Pradesh',
  'Rajasthan',
  'West Bengal',
];

const STATE_DISTRICTS: Record<string, string[]> = {
  'Andhra Pradesh': [
    'Visakhapatnam',
    'Vijayawada (NTR)',
    'Guntur',
    'Tirupati',
    'East Godavari',
    'West Godavari',
    'Kurnool',
    'Nellore',
    'Kadapa',
    'Anantapur',
    'Chittoor',
    'Srikakulam',
    'Vizianagaram',
  ],
  'Telangana': [
    'Hyderabad',
    'Ranga Reddy',
    'Medchal-Malkajgiri',
    'Warangal',
    'Karimnagar',
    'Nizamabad',
    'Khammam',
    'Nalgonda',
    'Mahabubnagar',
  ],
  'Kerala': [
    'Pathanamthitta',
    'Thiruvananthapuram',
    'Kollam',
    'Alappuzha',
    'Kottayam',
    'Idukki',
    'Ernakulam',
    'Thrissur',
    'Palakkad',
    'Malappuram',
    'Kozhikode',
  ],
  'Tamil Nadu': [
    'Chennai',
    'Madurai',
    'Coimbatore',
    'Tiruchirappalli',
    'Salem',
    'Tirunelveli',
    'Kanchipuram',
    'Thanjavur',
  ],
  'Karnataka': [
    'Bengaluru Urban',
    'Mysuru',
    'Mangaluru (Dakshina Kannada)',
    'Hubballi-Dharwad',
    'Belagavi',
    'Udupi',
  ],
};

export const EditProfileScreen: React.FC<Props> = ({
  currentLanguage,
  currentUser,
  onLanguageChange,
  onProfileSaved,
  onSkip,
  onBack,
  isOnboarding = false,
  onNavigateTab,
}) => {
  const activeLang = currentLanguage || 'te';

  // --- Dynamic State (Strictly bound to authenticated currentUser) ---
  const formatInitialDob = (dateVal?: any): string => {
    if (!dateVal) return '';
    try {
      const raw = String(dateVal).split('T')[0];
      const parts = raw.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        if (!isNaN(d) && !isNaN(m) && !isNaN(y) && MONTHS[m]) {
          return `${d} ${MONTHS[m]} ${y}`;
        }
      }
    } catch {}
    return String(dateVal);
  };

  const [fullName, setFullName] = useState(currentUser?.fullName || currentUser?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phoneNumber || currentUser?.phone || '');
  const [isVerified, setIsVerified] = useState(Boolean(currentUser?.phoneNumber || currentUser?.isVerifiedPhone));
  const [devoteeSince, setDevoteeSince] = useState(currentUser?.devoteeSince || '');
  const [dobDisplay, setDobDisplay] = useState(currentUser?.dateOfBirth ? formatInitialDob(currentUser.dateOfBirth) : '');
  const [dobYmd, setDobYmd] = useState(currentUser?.dateOfBirth ? String(currentUser.dateOfBirth).split('T')[0] : '');
  const [gender, setGender] = useState<string>(currentUser?.gender || '');

  // Zodiac & Star
  const [rashis, setRashis] = useState<RashiItem[]>([]);
  const [nakshatras, setNakshatras] = useState<NakshatraItem[]>([]);
  const [selectedRashiId, setSelectedRashiId] = useState<number | null>(currentUser?.rashiId || null);
  const [selectedRashiName, setSelectedRashiName] = useState<string>(currentUser?.rashiName || '');
  const [selectedNakshatraId, setSelectedNakshatraId] = useState<number | null>(currentUser?.nakshatraId || null);
  const [selectedNakshatraName, setSelectedNakshatraName] = useState<string>(currentUser?.nakshatraName || '');

  // Dynamic Dropdown Lists from Database via API
  const [states, setStates] = useState<{ id: number | string; name: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: number | string; name: string }[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);
  const [deities, setDeities] = useState<any[]>([]);

  // Contact (Strictly dynamic)
  const [email, setEmail] = useState(currentUser?.email || '');
  const [addressLine, setAddressLine] = useState(currentUser?.addressLine || '');
  const [stateName, setStateName] = useState(currentUser?.state || '');
  const [district, setDistrict] = useState(currentUser?.district || '');
  const [city, setCity] = useState(currentUser?.city || '');
  const [pincode, setPincode] = useState(currentUser?.pincode || '');

  // Devotional Preferences
  const [preferredLang, setPreferredLang] = useState<SupportedLanguage>(currentUser?.preferredLang || activeLang);
  const [templeUpdates, setTempleUpdates] = useState(currentUser?.devotionalUpdatesEnabled ?? true);
  const [favoriteDeity, setFavoriteDeity] = useState(currentUser?.favoriteDeity || 'Lord Ayyappa (Swamiye Ayyappa)');

  // Profile Image
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(currentUser?.profileImageUrl || null);

  // Status & Feedback
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Modals
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [genderModalOpen, setGenderModalOpen] = useState(false);
  const [rashiModalOpen, setRashiModalOpen] = useState(false);
  const [nakshatraModalOpen, setNakshatraModalOpen] = useState(false);
  const [stateModalOpen, setStateModalOpen] = useState(false);
  const [districtModalOpen, setDistrictModalOpen] = useState(false);
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [deityModalOpen, setDeityModalOpen] = useState(false);
  const [dobModalOpen, setDobModalOpen] = useState(false);

  // Temp DOB state for modal - dynamically parsed from devotee DOB if present
  const parsedDob = currentUser?.dateOfBirth ? String(currentUser.dateOfBirth).split('T')[0].split('-') : null;
  const [tempDay, setTempDay] = useState(parsedDob && parsedDob[2] ? String(parseInt(parsedDob[2], 10)) : '1');
  const [tempMonth, setTempMonth] = useState(parsedDob && parsedDob[1] ? MONTHS[parseInt(parsedDob[1], 10) - 1] || 'Jan' : 'Jan');
  const [tempYear, setTempYear] = useState(parsedDob && parsedDob[0] ? parsedDob[0] : '2000');

  // Android Back Handler
  useEffect(() => {
    const handleHardwareBack = () => {
      if (
        photoModalOpen ||
        genderModalOpen ||
        rashiModalOpen ||
        nakshatraModalOpen ||
        stateModalOpen ||
        districtModalOpen ||
        languageModalOpen ||
        deityModalOpen ||
        dobModalOpen
      ) {
        setPhotoModalOpen(false);
        setGenderModalOpen(false);
        setRashiModalOpen(false);
        setNakshatraModalOpen(false);
        setStateModalOpen(false);
        setDistrictModalOpen(false);
        setLanguageModalOpen(false);
        setDeityModalOpen(false);
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
  }, [
    photoModalOpen,
    genderModalOpen,
    rashiModalOpen,
    nakshatraModalOpen,
    stateModalOpen,
    districtModalOpen,
    languageModalOpen,
    deityModalOpen,
    dobModalOpen,
    onBack,
  ]);

  // Load API & DB Data
  useEffect(() => {
    let isMounted = true;

    async function fetchMasterAndProfile() {
      try {
        const [rashiList, nakshatraList, stateList, langList, deityList] = await Promise.all([
          ApiService.getRashis(activeLang),
          ApiService.getNakshatras(activeLang),
          ApiService.getStates(),
          ApiService.getLanguages().catch(() => []),
          ApiService.getDeities().catch(() => []),
        ]);
        if (!isMounted) return;
        setRashis(rashiList);
        setNakshatras(nakshatraList);
        if (stateList && stateList.length > 0) setStates(stateList);
        if (langList && langList.length > 0) setLanguages(langList);
        if (deityList && deityList.length > 0) setDeities(deityList);

        const userId = currentUser?.id;
        if (userId && !currentUser?.isGuest && !isNaN(Number(userId))) {
          try {
            const profile = await ApiService.getDevoteeProfile(Number(userId), activeLang);
            if (profile && isMounted) {
              if (profile.fullName) setFullName(profile.fullName);
              if (profile.phoneNumber) setPhoneNumber(profile.phoneNumber);
              if (profile.email) setEmail(profile.email);
              if (profile.dateOfBirth) {
                const raw = String(profile.dateOfBirth).split('T')[0];
                setDobYmd(raw);
                setDobDisplay(formatInitialDob(raw));
                const parts = raw.split('-');
                if (parts.length === 3) {
                  setTempDay(String(parseInt(parts[2], 10)));
                  setTempMonth(MONTHS[parseInt(parts[1], 10) - 1] || 'Jan');
                  setTempYear(parts[0]);
                }
              }
              if (profile.gender) {
                setGender(profile.gender);
              }
              if (profile.rashiId) {
                setSelectedRashiId(profile.rashiId);
                const foundR = rashiList.find((r) => r.id === profile.rashiId);
                setSelectedRashiName(foundR ? foundR.name : profile.rashiName || '');
              }
              if (profile.nakshatraId) {
                setSelectedNakshatraId(profile.nakshatraId);
                const foundN = nakshatraList.find((n) => n.id === profile.nakshatraId);
                setSelectedNakshatraName(foundN ? foundN.name : profile.nakshatraName || '');
              }
              if (profile.addressLine) setAddressLine(profile.addressLine);
              if (profile.state) setStateName(profile.state);
              if (profile.district) setDistrict(profile.district);
              if (profile.city) setCity(profile.city);
              if (profile.pincode) setPincode(profile.pincode);
              if (profile.profileImageUrl) setProfileImageUrl(profile.profileImageUrl);
              if (profile.devoteeSince) setDevoteeSince(profile.devoteeSince);
              if (profile.isVerifiedPhone !== undefined) setIsVerified(profile.isVerifiedPhone);
              setTempleUpdates(Boolean(profile.devotionalUpdatesEnabled));
            }
          } catch (profileErr) {
            console.log('[EditProfile] Profile fetch note:', profileErr);
          }
        }

        // Fetch districts dynamically for current state
        const currentState = stateName;
        const initialDistricts = await ApiService.getDistricts(currentState);
        if (isMounted && initialDistricts && initialDistricts.length > 0) {
          setDistricts(initialDistricts);
        }

        // Check stored deity preference
        const storedDeity = await StorageService.getStoredDeity();
        if (storedDeity && storedDeity.name && isMounted) {
          setFavoriteDeity(storedDeity.name);
        }
      } catch (e) {
        console.warn('Error loading devotee profile:', e);
      }
    }

    fetchMasterAndProfile();
    return () => {
      isMounted = false;
    };
  }, [activeLang]);

  // Gallery Picker
  const handlePickFromGallery = async () => {
    try {
      setPhotoModalOpen(false);
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        setToastMessage('Photo library permission is required to choose profile image.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setUploadingPhoto(true);
        const userId = currentUser?.id;
        if (!userId) {
          setToastMessage('Please sign in to update your profile photo.');
          return;
        }
        const base64Data = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        try {
          const res = await ApiService.uploadDevoteePhoto(userId, base64Data);
          const finalUrl = (typeof res === 'string' ? res : (res as any)?.profileImageUrl) || base64Data;
          setProfileImageUrl(finalUrl);
          setToastMessage('Profile photo updated successfully!');
        } catch {
          setProfileImageUrl(base64Data);
          setToastMessage('Photo selected. Tap Save Changes to apply.');
        } finally {
          setUploadingPhoto(false);
        }
      }
    } catch (err: any) {
      setUploadingPhoto(false);
      setToastMessage(err.message || 'Failed to select photo.');
    }
  };

  // Camera Capture
  const handleCaptureCamera = async () => {
    try {
      setPhotoModalOpen(false);
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        setToastMessage('Camera permission is required to capture photo.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setUploadingPhoto(true);
        const userId = currentUser?.id;
        if (!userId) {
          setToastMessage('Please sign in to update your profile photo.');
          return;
        }
        const base64Data = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        try {
          const res = await ApiService.uploadDevoteePhoto(userId, base64Data);
          const finalUrl = (typeof res === 'string' ? res : (res as any)?.profileImageUrl) || base64Data;
          setProfileImageUrl(finalUrl);
          setToastMessage('Profile photo captured successfully!');
        } catch {
          setProfileImageUrl(base64Data);
          setToastMessage('Photo captured. Tap Save Changes to apply.');
        } finally {
          setUploadingPhoto(false);
        }
      }
    } catch (err: any) {
      setUploadingPhoto(false);
      setToastMessage(err.message || 'Failed to take photo.');
    }
  };

  // Validation
  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Full Name is required';
    if (!dobYmd && !dobDisplay.trim()) errs.dob = 'Date of Birth is required';
    if (!gender) errs.gender = 'Gender is required';
    if (!selectedRashiId && !selectedRashiName) errs.rashi = 'Rashi is required';
    if (!selectedNakshatraId && !selectedNakshatraName) errs.nakshatra = 'Nakshatram is required';
    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Valid email is required';
    }
    if (!addressLine.trim()) errs.addressLine = 'Address is required';
    if (!stateName.trim()) errs.stateName = 'State is required';
    if (!district.trim()) errs.district = 'District is required';
    if (!city.trim()) errs.city = 'City / Town is required';
    if (!pincode.trim()) {
      errs.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(pincode.trim())) {
      errs.pincode = '6-digit pincode is required';
    }
    if (!preferredLang) errs.preferredLang = 'Preferred Language is required';
    if (!favoriteDeity) errs.favoriteDeity = 'Favorite Deity is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Save Changes Handler
  const handleSaveChanges = async () => {
    if (!validateForm()) {
      setToastMessage('Please fill in all mandatory fields marked with *');
      return;
    }

    setSaving(true);
    const userId = currentUser?.id;
    if (!userId) {
      setSaving(false);
      setToastMessage('Authentication error: Devotee session not found. Please log in again.');
      return;
    }
    const payload: Partial<DevoteeProfile> = {
      fullName: fullName.trim(),
      email: email.trim(),
      dateOfBirth: dobYmd || (dobDisplay ? dobDisplay.trim() : null),
      gender: gender ? gender.trim() : null,
      rashiId: selectedRashiId,
      rashiName: selectedRashiName,
      nakshatraId: selectedNakshatraId,
      nakshatraName: selectedNakshatraName,
      profileImageUrl: profileImageUrl || null,
      addressLine: addressLine.trim(),
      state: stateName.trim(),
      district: district.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
      preferredLang,
      devotionalUpdatesEnabled: templeUpdates,
      profileOnboardingStatus: 'COMPLETED',
    };

    try {
      const updated = await ApiService.updateDevoteeProfile(userId, payload);
      // Persist chosen deity to Storage
      await StorageService.setStoredDeity({
        id: favoriteDeity.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        name: favoriteDeity,
      });

      if (onLanguageChange && preferredLang !== activeLang) {
        onLanguageChange(preferredLang);
      }

      setSaving(false);
      setToastMessage('Profile updated successfully');

      const mergedUser = (updated as any)?.user || updated || { ...currentUser, ...payload, profileImageUrl };
      await StorageService.setStoredUser(mergedUser);
      setTimeout(() => {
        if (onProfileSaved) {
          onProfileSaved(mergedUser);
        } else if (onBack) {
          onBack();
        }
      }, 900);
    } catch (err: any) {
      console.warn('Backend updateProfile failed, persisting locally:', err);
      const mergedUser = { ...currentUser, ...payload, profileImageUrl };
      await StorageService.setStoredUser(mergedUser);
      setSaving(false);
      setToastMessage('Profile updated successfully');
      setTimeout(() => {
        if (onProfileSaved) {
          onProfileSaved(mergedUser);
        } else if (onBack) {
          onBack();
        }
      }, 900);
    }
  };

  const getLanguageLabel = (code: string) => {
    switch (code) {
      case 'te':
        return 'Telugu';
      case 'ta':
        return 'Tamil';
      case 'kn':
        return 'Kannada';
      case 'ml':
        return 'Malayalam';
      case 'hi':
        return 'Hindi';
      case 'en':
      default:
        return 'English';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0C251E" />
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* =========================================================================
              1. DEVOTIONAL HEADER
             ========================================================================= */}
          <LinearGradient
            colors={['#0C251E', '#173D32', '#173D32', '#A22833', '#173D32']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerContainer}
          >
            {/* Corner Filigree */}
            <View style={styles.cornerTopLeft}>
              <CornerFiligree />
            </View>
            <View style={styles.cornerTopRight}>
              <CornerFiligree flipped />
            </View>

            {/* Brass Hanging Bells */}
            <View style={styles.hangingBellLeft}>
              <HangingBell />
            </View>
            <View style={styles.hangingBellRight}>
              <HangingBell />
            </View>

            {/* Back Button */}
            <TouchableOpacity
              style={styles.backCircleBtn}
              onPress={onBack}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Back to Profile"
            >
              <BackArrowIcon />
            </TouchableOpacity>

            {/* Center Emblem & Titles */}
            <View style={styles.headerCenterColumn}>
              <View style={styles.emblemRing}>
                <Image
                  source={AYYAPPA_EMBLEM}
                  style={styles.emblemImage}
                  resizeMode="cover"
                />
              </View>

              <Text style={styles.brandSubtitle}>— Saranam Ayyappa —</Text>
              <Text style={styles.mainTitle}>Edit Profile</Text>

              <View style={styles.titleDividerContainer}>
                <HeaderSubtitleFiligree />
              </View>
            </View>
          </LinearGradient>

          {/* =========================================================================
              2. PROFILE SUMMARY CARD
             ========================================================================= */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              {/* Avatar with Camera Badge */}
              <TouchableOpacity
                style={styles.avatarWrapper}
                onPress={() => setPhotoModalOpen(true)}
                activeOpacity={0.85}
              >
                <View style={styles.avatarBorderGlow}>
                  {uploadingPhoto ? (
                    <ActivityIndicator size="small" color="#D84315" />
                  ) : profileImageUrl ? (
                    <Image source={{ uri: profileImageUrl }} style={styles.avatarPhoto} />
                  ) : (
                    <Image source={DEVOTEE_DEFAULT_AVATAR} style={styles.avatarPhoto} />
                  )}
                </View>
                <View style={styles.cameraBadgeCircle}>
                  <CameraBadgeIcon />
                </View>
              </TouchableOpacity>

              {/* Devotee Details */}
              <View style={styles.summaryInfo}>
                <Text style={styles.devoteeNameText} numberOfLines={1}>
                  {fullName || 'Devotee'}
                </Text>

                <View style={styles.phoneVerifiedRow}>
                  <Text style={styles.phoneIcon}>📞</Text>
                  <Text style={styles.phoneNumberText}>{phoneNumber}</Text>
                  <Text style={styles.pipeDivider}>|</Text>
                  {isVerified && (
                    <View style={styles.verifiedBadge}>
                      <VerifiedCheckIcon />
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  )}
                </View>

                <View style={styles.devoteeSinceRow}>
                  <Text style={styles.calendarMiniIcon}>📅</Text>
                  <Text style={styles.devoteeSinceText}>Devotee Since: {devoteeSince}</Text>
                </View>

                <Text style={styles.summaryHintText}>
                  Update your personal and devotional details.
                </Text>
              </View>
            </View>
          </View>

          {/* =========================================================================
              3. PERSONAL INFORMATION CARD
             ========================================================================= */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionBadgePill}>
                <PersonFieldIcon />
                <Text style={styles.sectionBadgeText}>Personal Information</Text>
              </View>
              <FloralFiligree />
            </View>

            {/* Row 1: Full Name (Full Width) */}
            <View style={styles.fieldRowWrap}>
              <View style={[styles.fieldColumn, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>
                  Full Name <Text style={styles.asterisk}>*</Text>
                </Text>
                <View style={[styles.inputBox, errors.fullName && styles.inputError]}>
                  <PersonFieldIcon />
                  <TextInput
                    style={styles.textInput}
                    value={fullName}
                    onChangeText={(val) => {
                      setFullName(val);
                      if (errors.fullName) setErrors({ ...errors, fullName: '' });
                    }}
                    placeholder="Full Name"
                    placeholderTextColor="#A89485"
                  />
                </View>
              </View>
            </View>

            {/* Row 2: Date of Birth & Gender (2-Column Balanced Grid) */}
            <View style={styles.fieldRowWrap}>
              {/* Date of Birth */}
              <View style={[styles.fieldColumn, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>
                  Date of Birth <Text style={styles.asterisk}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[styles.inputBox, errors.dob && styles.inputError]}
                  onPress={() => setDobModalOpen(true)}
                  activeOpacity={0.8}
                >
                  <CalendarFieldIcon />
                  <Text style={[styles.dropdownValueText, !dobDisplay && { color: '#8C7A6B' }]} numberOfLines={1}>
                    {dobDisplay || 'Select Date of Birth'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Gender (Dropdown) */}
              <View style={[styles.fieldColumn, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>
                  Gender <Text style={styles.asterisk}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[styles.inputBox, errors.gender && styles.inputError]}
                  onPress={() => setGenderModalOpen(true)}
                  activeOpacity={0.8}
                >
                  <GenderFieldIcon />
                  <Text style={[styles.dropdownValueText, !gender && { color: '#8C7A6B' }]} numberOfLines={1}>
                    {gender || 'Select Gender'}
                  </Text>
                  <ChevronDownIcon />
                </TouchableOpacity>
              </View>
            </View>

            {/* Row 2: Rashi, Nakshatram */}
            <View style={styles.fieldRowWrap}>
              {/* Rashi */}
              <View style={[styles.fieldColumn, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>
                  Rashi <Text style={styles.asterisk}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[styles.inputBox, errors.rashi && styles.inputError]}
                  onPress={() => setRashiModalOpen(true)}
                  activeOpacity={0.8}
                >
                  <ZodiacFieldIcon />
                  <Text style={styles.dropdownValueText} numberOfLines={1}>
                    {selectedRashiName || 'Select Rashi'}
                  </Text>
                  <ChevronDownIcon />
                </TouchableOpacity>
              </View>

              {/* Nakshatram */}
              <View style={[styles.fieldColumn, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>
                  Nakshatram <Text style={styles.asterisk}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[styles.inputBox, errors.nakshatra && styles.inputError]}
                  onPress={() => setNakshatraModalOpen(true)}
                  activeOpacity={0.8}
                >
                  <StarFieldIcon />
                  <Text style={styles.dropdownValueText} numberOfLines={1}>
                    {selectedNakshatraName || 'Select Nakshatram'}
                  </Text>
                  <ChevronDownIcon />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* =========================================================================
              4. CONTACT INFORMATION CARD
             ========================================================================= */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionBadgePill}>
                <PinFieldIcon />
                <Text style={styles.sectionBadgeText}>Contact Information</Text>
              </View>
              <FloralFiligree />
            </View>

            {/* Row 1: Email (Full Width) */}
            <View style={styles.fieldRowWrap}>
              <View style={[styles.fieldColumn, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>
                  Email <Text style={styles.asterisk}>*</Text>
                </Text>
                <View style={[styles.inputBox, errors.email && styles.inputError]}>
                  <MailFieldIcon />
                  <TextInput
                    style={styles.textInput}
                    value={email}
                    onChangeText={(val) => {
                      setEmail(val);
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    placeholder="Email Address"
                    placeholderTextColor="#A89485"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>
            </View>

            {/* Row 2: Address (Full Width) */}
            <View style={styles.fieldRowWrap}>
              <View style={[styles.fieldColumn, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>
                  Address <Text style={styles.asterisk}>*</Text>
                </Text>
                <View style={[styles.inputBox, errors.addressLine && styles.inputError]}>
                  <HomeFieldIcon />
                  <TextInput
                    style={styles.textInput}
                    value={addressLine}
                    onChangeText={(val) => {
                      setAddressLine(val);
                      if (errors.addressLine) setErrors({ ...errors, addressLine: '' });
                    }}
                    placeholder="Door No, Street name"
                    placeholderTextColor="#A89485"
                  />
                </View>
              </View>
            </View>

            {/* Row 3: State & District (2-Column Balanced Grid) */}
            <View style={styles.fieldRowWrap}>
              {/* State */}
              <View style={[styles.fieldColumn, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>
                  State <Text style={styles.asterisk}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.inputBox}
                  onPress={() => setStateModalOpen(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.dropdownValueText} numberOfLines={1}>
                    {stateName}
                  </Text>
                  <ChevronDownIcon />
                </TouchableOpacity>
              </View>

              {/* District */}
              <View style={[styles.fieldColumn, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>
                  District <Text style={styles.asterisk}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.inputBox}
                  onPress={() => setDistrictModalOpen(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.dropdownValueText} numberOfLines={1}>
                    {district}
                  </Text>
                  <ChevronDownIcon />
                </TouchableOpacity>
              </View>
            </View>

            {/* Row 4: City / Town & Pincode (2-Column Balanced Grid) */}
            <View style={styles.fieldRowWrap}>
              {/* City / Town */}
              <View style={[styles.fieldColumn, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>
                  City / Town <Text style={styles.asterisk}>*</Text>
                </Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.textInput}
                    value={city}
                    onChangeText={setCity}
                    placeholder="City / Town"
                    placeholderTextColor="#A89485"
                  />
                </View>
              </View>

              {/* Pincode */}
              <View style={[styles.fieldColumn, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>
                  Pincode <Text style={styles.asterisk}>*</Text>
                </Text>
                <View style={[styles.inputBox, errors.pincode && styles.inputError]}>
                  <TextInput
                    style={styles.textInput}
                    value={pincode}
                    onChangeText={(val) => {
                      setPincode(val.replace(/\D/g, '').slice(0, 6));
                      if (errors.pincode) setErrors({ ...errors, pincode: '' });
                    }}
                    placeholder="Pincode"
                    placeholderTextColor="#A89485"
                    keyboardType="numeric"
                    maxLength={6}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* =========================================================================
              5. DEVOTIONAL PREFERENCES CARD
             ========================================================================= */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionBadgePill}>
                <Text style={styles.sectionBadgeIcon}>🙏</Text>
                <Text style={styles.sectionBadgeText}>Devotional Preferences</Text>
              </View>
              <FloralFiligree />
            </View>

            {/* Row 1: Preferred Language & Favorite Deity (2-Column Balanced Grid) */}
            <View style={styles.fieldRowWrap}>
              {/* Preferred Language */}
              <View style={[styles.fieldColumn, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>
                  Preferred Language <Text style={styles.asterisk}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.inputBox}
                  onPress={() => setLanguageModalOpen(true)}
                  activeOpacity={0.8}
                >
                  <GlobeFieldIcon />
                  <Text style={styles.dropdownValueText} numberOfLines={1}>
                    {getLanguageLabel(preferredLang)}
                  </Text>
                  <ChevronDownIcon />
                </TouchableOpacity>
              </View>

              {/* Favorite Deity */}
              <View style={[styles.fieldColumn, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>
                  Favorite Deity <Text style={styles.asterisk}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.inputBox}
                  onPress={() => setDeityModalOpen(true)}
                  activeOpacity={0.8}
                >
                  <TempleFieldIcon />
                  <Text style={styles.dropdownValueText} numberOfLines={1}>
                    {favoriteDeity}
                  </Text>
                  <ChevronDownIcon />
                </TouchableOpacity>
              </View>
            </View>

            {/* Row 2: Receive Temple Updates (Full Width Card) */}
            <View style={styles.fieldRowWrap}>
              <View style={[styles.fieldColumn, { flex: 1 }]}>
                <View style={styles.toggleCardContainer}>
                  <View style={styles.toggleTextCol}>
                    <View style={styles.toggleHeaderRow}>
                      <BellFieldIcon />
                      <Text style={styles.toggleTitleText}>Receive Temple Updates</Text>
                    </View>
                    <Text style={styles.toggleSubtitleText}>
                      Panchangam, Festivals, Sevas & More
                    </Text>
                  </View>
                  <Switch
                    value={templeUpdates}
                    onValueChange={setTempleUpdates}
                    trackColor={{ false: '#D7CCC8', true: '#D84315' }}
                    thumbColor="#FFFFFF"
                    style={styles.toggleSwitch}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* =========================================================================
              6. PRIMARY CTA BUTTON: SAVE CHANGES
             ========================================================================= */}
          <TouchableOpacity
            style={styles.primaryCtaWrapper}
            onPress={handleSaveChanges}
            disabled={saving}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Save Changes"
          >
            <LinearGradient
              colors={['#E65100', '#B72323', '#173D32']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryCtaGradient}
            >
              {saving ? (
                <View style={styles.savingRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.primaryCtaText}>Saving Changes...</Text>
                </View>
              ) : (
                <View style={styles.ctaContentRow}>
                  <View style={styles.ctaCheckCircle}>
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M5 13l4 4L19 7"
                        stroke="#173D32"
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </View>
                  <Text style={styles.primaryCtaText}>Save Changes</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* =========================================================================
              7. SECONDARY CTA: BACK TO PROFILE
             ========================================================================= */}
          <TouchableOpacity
            style={styles.secondaryCtaBtn}
            onPress={onBack}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Back to Profile"
          >
            <Text style={styles.secondaryCtaText}>Back to Profile</Text>
          </TouchableOpacity>

          {/* =========================================================================
              8. BOTTOM DEVOTIONAL ACCENT AREA
             ========================================================================= */}
          <View style={styles.bottomArtworkContainer}>
            <View style={styles.bottomDeepamLeft}>
              <StandingBrassLamp />
            </View>
            <View style={styles.bottomTempleCenter}>
              <SabarimalaTempleArtwork />
            </View>
            <View style={styles.bottomDeepamRight}>
              <StandingBrassLamp />
            </View>
          </View>
        </ScrollView>

        {/* =========================================================================
            MODALS FOR INTERACTIVE SELECTION
           ========================================================================= */}

        {/* Modal 1: Photo Picker */}
        <Modal
          visible={photoModalOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setPhotoModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Profile Photo</Text>
              <Text style={styles.modalSubtitle}>Choose an image for your sacred profile</Text>

              <TouchableOpacity style={styles.modalOptionBtn} onPress={handleCaptureCamera}>
                <Text style={styles.modalOptionIcon}>📷</Text>
                <Text style={styles.modalOptionText}>Take Photo with Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalOptionBtn} onPress={handlePickFromGallery}>
                <Text style={styles.modalOptionIcon}>🖼️</Text>
                <Text style={styles.modalOptionText}>Choose from Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOptionBtn}
                onPress={() => {
                  setProfileImageUrl(null);
                  setPhotoModalOpen(false);
                  setToastMessage('Default avatar restored');
                }}
              >
                <Text style={styles.modalOptionIcon}>🪷</Text>
                <Text style={styles.modalOptionText}>Use Devotional Default Avatar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setPhotoModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal 2: Rashi Picker */}
        <Modal
          visible={rashiModalOpen}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setRashiModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { maxHeight: '75%' }]}>
              <Text style={styles.modalTitle}>Select Your Rashi</Text>
              <FlatList
                data={rashis}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.pickerListItem,
                      selectedRashiId === item.id && styles.pickerListItemActive,
                    ]}
                    onPress={() => {
                      setSelectedRashiId(item.id);
                      setSelectedRashiName(item.name);
                      setRashiModalOpen(false);
                    }}
                  >
                    <Text style={styles.pickerItemGlyph}>♈</Text>
                    <Text style={styles.pickerItemText}>{item.name}</Text>
                    {selectedRashiId === item.id && <Text style={styles.pickerItemCheck}>✓</Text>}
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setRashiModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal 3: Nakshatram Picker */}
        <Modal
          visible={nakshatraModalOpen}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setNakshatraModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { maxHeight: '75%' }]}>
              <Text style={styles.modalTitle}>Select Janma Nakshatram</Text>
              <FlatList
                data={nakshatras}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.pickerListItem,
                      selectedNakshatraId === item.id && styles.pickerListItemActive,
                    ]}
                    onPress={() => {
                      setSelectedNakshatraId(item.id);
                      setSelectedNakshatraName(item.name);
                      setNakshatraModalOpen(false);
                    }}
                  >
                    <Text style={styles.pickerItemGlyph}>☆</Text>
                    <Text style={styles.pickerItemText}>{item.name}</Text>
                    {selectedNakshatraId === item.id && <Text style={styles.pickerItemCheck}>✓</Text>}
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setNakshatraModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal 4: State Picker (Dynamic from DB via API) */}
        <Modal
          visible={stateModalOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setStateModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { maxHeight: '70%' }]}>
              <Text style={styles.modalTitle}>Select State</Text>
              <FlatList
                data={states.length > 0 ? states.map((s) => s.name) : INDIAN_STATES}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.pickerListItem,
                      stateName === item && styles.pickerListItemActive,
                    ]}
                    onPress={async () => {
                      setStateName(item);
                      setStateModalOpen(false);
                      try {
                        const distList = await ApiService.getDistricts(item);
                        if (distList && distList.length > 0) {
                          setDistricts(distList);
                          setDistrict(distList[0].name);
                          setCity(distList[0].name);
                        } else if (STATE_DISTRICTS[item] && STATE_DISTRICTS[item].length > 0) {
                          setDistrict(STATE_DISTRICTS[item][0]);
                          setCity(STATE_DISTRICTS[item][0]);
                        }
                      } catch {
                        if (STATE_DISTRICTS[item] && STATE_DISTRICTS[item].length > 0) {
                          setDistrict(STATE_DISTRICTS[item][0]);
                          setCity(STATE_DISTRICTS[item][0]);
                        }
                      }
                    }}
                  >
                    <Text style={styles.pickerItemText}>{item}</Text>
                    {stateName === item && <Text style={styles.pickerItemCheck}>✓</Text>}
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setStateModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal 5: District Picker (Dynamic from DB via API) */}
        <Modal
          visible={districtModalOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setDistrictModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { maxHeight: '70%' }]}>
              <Text style={styles.modalTitle}>Select District</Text>
              <FlatList
                data={
                  districts.length > 0
                    ? districts.map((d) => d.name)
                    : STATE_DISTRICTS[stateName] || STATE_DISTRICTS['Andhra Pradesh']
                }
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.pickerListItem,
                      district === item && styles.pickerListItemActive,
                    ]}
                    onPress={() => {
                      setDistrict(item);
                      setCity(item);
                      setDistrictModalOpen(false);
                    }}
                  >
                    <Text style={styles.pickerItemText}>{item}</Text>
                    {district === item && <Text style={styles.pickerItemCheck}>✓</Text>}
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setDistrictModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal 6: Preferred Language Picker (Dynamic from DB via API) */}
        <Modal
          visible={languageModalOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setLanguageModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Preferred Language</Text>
              {(languages.length > 0
                ? languages.map((l) => ({
                    code: l.code,
                    label: l.displayName || `${l.nativeName || l.name} (${l.englishName || l.code})`,
                  }))
                : [
                    { code: 'te', label: 'Telugu (తెలుగు)' },
                    { code: 'ta', label: 'Tamil (தமிழ்)' },
                    { code: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
                    { code: 'ml', label: 'Malayalam (മലയാളം)' },
                    { code: 'hi', label: 'Hindi (हिन्दी)' },
                    { code: 'en', label: 'English' },
                  ]
              ).map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.pickerListItem,
                    preferredLang === lang.code && styles.pickerListItemActive,
                  ]}
                  onPress={() => {
                    setPreferredLang(lang.code as SupportedLanguage);
                    setLanguageModalOpen(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>{lang.label}</Text>
                  {preferredLang === lang.code && <Text style={styles.pickerItemCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setLanguageModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal 7: Favorite Deity Picker (Dynamic from DB via API) */}
        <Modal
          visible={deityModalOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setDeityModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { maxHeight: '70%' }]}>
              <Text style={styles.modalTitle}>Select Favorite Deity</Text>
              <FlatList
                data={
                  deities.length > 0
                    ? deities.map((d) => ({
                        id: String(d.slug || d.id),
                        label: d.teluguName ? `${d.name} (${d.teluguName})` : d.name,
                      }))
                    : MASTER_DEITIES
                }
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.pickerListItem,
                      favoriteDeity === item.label && styles.pickerListItemActive,
                    ]}
                    onPress={() => {
                      setFavoriteDeity(item.label);
                      setDeityModalOpen(false);
                    }}
                  >
                    <Text style={styles.pickerItemGlyph}>🪷</Text>
                    <Text style={styles.pickerItemText}>{item.label}</Text>
                    {favoriteDeity === item.label && <Text style={styles.pickerItemCheck}>✓</Text>}
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setDeityModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal 8: Date of Birth Picker */}
        <Modal
          visible={dobModalOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setDobModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Select Date of Birth</Text>
              <View style={styles.dobModalRow}>
                <View style={styles.dobModalCol}>
                  <Text style={styles.dobColLabel}>Day</Text>
                  <TextInput
                    style={styles.dobInput}
                    value={tempDay}
                    onChangeText={setTempDay}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>
                <View style={styles.dobModalCol}>
                  <Text style={styles.dobColLabel}>Month</Text>
                  <TextInput
                    style={styles.dobInput}
                    value={tempMonth}
                    onChangeText={setTempMonth}
                    maxLength={3}
                  />
                </View>
                <View style={styles.dobModalCol}>
                  <Text style={styles.dobColLabel}>Year</Text>
                  <TextInput
                    style={styles.dobInput}
                    value={tempYear}
                    onChangeText={setTempYear}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.dobSaveBtn}
                onPress={() => {
                  const day = tempDay.padStart(2, '0');
                  const monthIdx = MONTHS.indexOf(tempMonth);
                  const monthNum = String((monthIdx >= 0 ? monthIdx : 0) + 1).padStart(2, '0');
                  const ymd = `${tempYear}-${monthNum}-${day}`;
                  setDobYmd(ymd);
                  setDobDisplay(`${day} ${tempMonth} ${tempYear}`);
                  setDobModalOpen(false);
                  if (errors.dob) setErrors({ ...errors, dob: '' });
                }}
              >
                <Text style={styles.dobSaveBtnText}>Set Date</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setDobModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal 9: Gender Picker (Dropdown) */}
        <Modal
          visible={genderModalOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setGenderModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Select Gender</Text>
              {(['Male', 'Female', 'Other', 'Prefer not to say'] as const).map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.pickerListItem,
                    gender === item && styles.pickerListItemActive,
                  ]}
                  onPress={() => {
                    setGender(item);
                    setGenderModalOpen(false);
                    if (errors.gender) setErrors({ ...errors, gender: '' });
                  }}
                >
                  <Text style={styles.pickerItemText}>{item}</Text>
                  {gender === item && <Text style={styles.pickerItemCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setGenderModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Toast Notification */}
        {toastMessage && (
          <Toast
            visible={Boolean(toastMessage)}
            message={toastMessage}
            onHide={() => setToastMessage(null)}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0C251E',
  },
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#FFF8EC',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFF8EC',
  },
  scrollContent: {
    paddingBottom: 36,
  },

  // --- 1. DEVOTIONAL HEADER ---
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 24 : 32,
    paddingBottom: 24,
    paddingHorizontal: 16,
    position: 'relative',
    borderBottomWidth: 1.5,
    borderBottomColor: '#DFA62E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
  },
  hangingBellLeft: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 24 : 28,
    left: 72,
    zIndex: 3,
  },
  hangingBellRight: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 24 : 28,
    right: 72,
    zIndex: 3,
  },
  backCircleBtn: {
    position: 'absolute',
    left: 18,
    top: Platform.OS === 'ios' ? 26 : 34,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF8EB',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#E6CE9F',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerCenterColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  emblemRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#DFA62E',
    overflow: 'hidden',
    backgroundColor: '#0C251E',
    marginBottom: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#F4C95D',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.6,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  emblemImage: {
    width: '100%',
    height: '100%',
  },
  brandSubtitle: {
    color: '#F4C95D',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
  },
  mainTitle: {
    color: '#FFFDF9',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
  },
  titleDividerContainer: {
    marginTop: 4,
  },

  // --- 2. PROFILE SUMMARY CARD ---
  summaryCard: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
    backgroundColor: '#FFFDF9',
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: '#E6CE9F',
    padding: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#0C251E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 2.5,
      },
    }),
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatarBorderGlow: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 2,
    borderColor: '#DFA62E',
    overflow: 'hidden',
    backgroundColor: '#F7EDE1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPhoto: {
    width: '100%',
    height: '100%',
  },
  cameraBadgeCircle: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#D84315',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryInfo: {
    flex: 1,
  },
  devoteeNameText: {
    fontSize: 19,
    fontWeight: '700',
    color: '#173D32',
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    marginBottom: 3,
  },
  phoneVerifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  phoneIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  phoneNumberText: {
    fontSize: 12.5,
    color: '#4B382A',
    fontWeight: '500',
  },
  pipeDivider: {
    marginHorizontal: 6,
    color: '#C7B299',
    fontSize: 12,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
    marginLeft: 3,
  },
  devoteeSinceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  calendarMiniIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  devoteeSinceText: {
    fontSize: 11.5,
    color: '#6B5441',
  },
  summaryHintText: {
    fontSize: 11,
    color: '#8B6645',
    fontStyle: 'italic',
  },

  // --- 3 & 4 & 5. SECTION CARDS ---
  sectionCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#FFFDF9',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#E6CE9F',
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#0C251E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 5,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#173D32',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  sectionBadgeIcon: {
    fontSize: 12,
    marginRight: 5,
  },
  sectionBadgeText: {
    color: '#FFF8EB',
    fontSize: 12.5,
    fontWeight: '700',
    marginLeft: 5,
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
  },
  fieldRowWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  fieldColumn: {
    flexDirection: 'column',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B382A',
    marginBottom: 5,
    fontFamily: Platform.select({ ios: 'Poppins-SemiBold', android: 'Poppins_600SemiBold', default: 'Poppins_600SemiBold' }),
  },
  asterisk: {
    color: '#C62828',
    fontWeight: '700',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCF7ED',
    borderWidth: 1,
    borderColor: '#D8C3A5',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    justifyContent: 'space-between',
  },
  inputError: {
    borderColor: '#C62828',
    backgroundColor: '#FFF2F2',
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 12.5,
    color: '#173D32',
    paddingVertical: 0,
    paddingHorizontal: 8,
    fontFamily: Platform.select({ ios: 'Poppins-Regular', android: 'Poppins_400Regular', default: 'Poppins_400Regular' }),
  },
  dropdownValueText: {
    flex: 1,
    fontSize: 12.5,
    color: '#173D32',
    paddingHorizontal: 8,
    fontFamily: Platform.select({ ios: 'Poppins-Medium', android: 'Poppins_500Medium', default: 'Poppins_500Medium' }),
  },

  // Gender Radio Group (Formatted into matching input card)
  genderRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCF7ED',
    borderWidth: 1,
    borderColor: '#D8C3A5',
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 40,
    justifyContent: 'space-around',
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    marginRight: 4,
  },
  radioOuter: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    borderWidth: 1.5,
    borderColor: '#9E8672',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  radioOuterSelected: {
    borderColor: '#D84315',
  },
  radioInner: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#D84315',
  },
  genderLabel: {
    fontSize: 11.5,
    color: '#345147',
    fontFamily: Platform.select({ ios: 'Poppins-Regular', android: 'Poppins_400Regular', default: 'Poppins_400Regular' }),
  },
  genderLabelSelected: {
    color: '#D84315',
    fontWeight: '700',
  },

  // Toggle Switch Container
  toggleCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FCF7ED',
    borderWidth: 1,
    borderColor: '#D8C3A5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 48,
  },
  toggleTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  toggleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleTitleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#173D32',
    marginLeft: 6,
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', default: 'Poppins_700Bold' }),
  },
  toggleSubtitleText: {
    fontSize: 10,
    color: '#2E7561',
    marginLeft: 26,
    marginTop: 2,
    fontFamily: Platform.select({ ios: 'Poppins-Regular', android: 'Poppins_400Regular', default: 'Poppins_400Regular' }),
  },
  toggleSwitch: {
    transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }],
  },

  // --- 6. PRIMARY CTA BUTTON ---
  primaryCtaWrapper: {
    marginHorizontal: 24,
    marginTop: 6,
    marginBottom: 8,
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E2AD43',
    ...Platform.select({
      ios: {
        shadowColor: '#D84315',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  primaryCtaGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaCheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  primaryCtaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
  },
  savingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // --- 7. SECONDARY CTA ---
  secondaryCtaBtn: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  secondaryCtaText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#173D32',
    textDecorationLine: 'none',
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
  },

  // --- 8. BOTTOM DEVOTIONAL ACCENT ---
  bottomArtworkContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 70,
    marginTop: 4,
    marginBottom: 6,
  },
  bottomDeepamLeft: {
    marginRight: 12,
  },
  bottomTempleCenter: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bottomDeepamRight: {
    marginLeft: 12,
  },

  // --- 9. BOTTOM NAVIGATION BAR ---
  bottomNavContainer: {
    borderTopWidth: 1.5,
    borderTopColor: '#DFA62E',
    backgroundColor: '#0C251E',
  },
  bottomNavGradient: {
    flexDirection: 'row',
    height: 58,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  navTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  navTabLabel: {
    fontSize: 10.5,
    color: '#E8C5A5',
    marginTop: 2,
  },
  navVerticalDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(223, 166, 46, 0.25)',
  },
  activeProfilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F4C95D',
  },
  activeProfileLabel: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
    marginLeft: 6,
  },

  // --- MODAL STYLES ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFDF9',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E6CE9F',
    padding: 18,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#173D32',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#2E7561',
    textAlign: 'center',
    marginBottom: 14,
  },
  modalOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FCF7ED',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E6CE9F',
    marginBottom: 8,
  },
  modalOptionIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  modalOptionText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#4B382A',
  },
  modalCancelBtn: {
    alignSelf: 'center',
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  modalCancelText: {
    fontSize: 13,
    color: '#173D32',
    fontWeight: '700',
  },

  // Picker List Items
  pickerListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E2D0',
  },
  pickerListItemActive: {
    backgroundColor: '#FDEED9',
  },
  pickerItemGlyph: {
    fontSize: 16,
    color: '#D84315',
    marginRight: 10,
  },
  pickerItemText: {
    flex: 1,
    fontSize: 13,
    color: '#173D32',
    fontWeight: '500',
  },
  pickerItemCheck: {
    fontSize: 16,
    fontWeight: '700',
    color: '#16A34A',
  },

  // DOB Modal Custom Row
  dobModalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 14,
  },
  dobModalCol: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  dobColLabel: {
    fontSize: 11,
    color: '#6B5441',
    marginBottom: 4,
  },
  dobInput: {
    width: '100%',
    height: 40,
    backgroundColor: '#FCF7ED',
    borderWidth: 1,
    borderColor: '#D8C3A5',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 14,
    color: '#173D32',
    fontWeight: '600',
  },
  dobSaveBtn: {
    backgroundColor: '#173D32',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  dobSaveBtnText: {
    color: '#FFF8EB',
    fontWeight: '700',
    fontSize: 13,
  },
});
