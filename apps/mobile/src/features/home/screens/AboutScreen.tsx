import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Platform,
  Image,
  Linking,
  BackHandler,
  ActivityIndicator,
  Dimensions,
  Modal,
} from 'react-native';
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
import Constants from 'expo-constants';
import { ApiService } from '../../../services/api';
import { SupportedLanguage } from '../../../types';
import { useBranding } from '../../../services/brandingService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  currentLanguage: SupportedLanguage;
  onBack: () => void;
  onNavigate?: (screen: string, detail?: any) => void;
}

const AYYAPPA_EMBLEM = require('../../../assets/images/ayyappa_emblem_approved.png');
const TEMPLE_FOOTER_IMAGE = require('../../../../assets/welcome_devotee_temple.jpg');

// --- PURE SVG DEVOTIONAL ORNAMENTS & ICONS ---

// 1. Header Back Arrow in Gold-bordered Box
const HeaderBackIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M12 19l-7-7 7-7"
      stroke="#FFF8EB"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 2. Brass Hanging Lamps for Header
const HangingBrassDeepam = () => (
  <Svg width={24} height={42} viewBox="0 0 24 42" fill="none">
    {/* Hanging chain */}
    <Path d="M12 0 V18" stroke="#DFA62E" strokeWidth="1.2" strokeDasharray="2,2" />
    <Circle cx="12" cy="18" r="1.5" fill="#DFA62E" />
    {/* Lamp bowl */}
    <Path d="M6 23 H18 C18 23 17 28 12 28 C7 28 6 23 6 23 Z" fill="#DFA62E" stroke="#B8860B" strokeWidth="1" />
    {/* Sacred Flame */}
    <Path
      d="M12 10 C12 10 14 14 14 16.5 C14 18 13 19 12 19 C11 19 10 18 10 16.5 C10 14 12 10 12 10 Z"
      fill="#FF9800"
    />
    <Path
      d="M12 12 C12 12 13.2 14.5 13.2 16 C13.2 17 12.6 17.5 12 17.5 C11.4 17.5 10.8 17 10.8 16 C10.8 14.5 12 12 12 12 Z"
      fill="#FFD54F"
    />
    {/* Base tassel */}
    <Path d="M10 28 H14 L12 33 Z" fill="#DFA62E" />
    <Circle cx="12" cy="35" r="1.5" fill="#B8860B" />
  </Svg>
);

// 3. Header Corner Filigree
const HeaderCornerOrnament = ({ flipped = false }: { flipped?: boolean }) => (
  <Svg
    width={48}
    height={48}
    viewBox="0 0 48 48"
    fill="none"
    style={{ transform: [{ scaleX: flipped ? -1 : 1 }] }}
  >
    <Path
      d="M0 0 C24 0 44 20 44 44 V48 H48 V0 H0 Z"
      fill="rgba(223, 166, 46, 0.16)"
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

// 4. Golden Lotus Divider (— 🪷 —)
const GoldenLotusDivider = () => (
  <Svg width={120} height={16} viewBox="0 0 120 16" fill="none">
    <Path d="M4 8 H46 M74 8 H116" stroke="#DFA62E" strokeWidth="1" strokeLinecap="round" />
    {/* Center Lotus */}
    <Path
      d="M60 2 C60 2 56 6 56 9 C56 12 60 14 60 14 C60 14 64 12 64 9 C64 6 60 2 60 2 Z"
      fill="#DFA62E"
    />
    <Path
      d="M54 7 C54 7 50 10 52 13 C54 15 57 14 57 14 C57 14 55 11 55 9 C55 8 54 7 54 7 Z"
      fill="#F4C95D"
    />
    <Path
      d="M66 7 C66 7 70 10 68 13 C66 15 63 14 63 14 C63 14 65 11 65 9 C65 8 66 7 66 7 Z"
      fill="#F4C95D"
    />
    <Circle cx="50" cy="8" r="1.5" fill="#DFA62E" />
    <Circle cx="70" cy="8" r="1.5" fill="#DFA62E" />
  </Svg>
);

// 5. Card Title Icons (Inside maroon rounded squares)
const PranamIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    {/* Anjali Mudra / Praying Hands */}
    <Path
      d="M12 3 C12 3 10 7 10 11 L10 19 C10 20 11 21 12 21 C13 21 14 20 14 19 L14 11 C14 7 12 3 12 3 Z"
      fill="#DFA62E"
    />
    <Path
      d="M9 7 C9 7 7 10 7 13 L7 18 C7 19.5 8 20 9 20"
      stroke="#F4C95D"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Path
      d="M15 7 C15 7 17 10 17 13 L17 18 C17 19.5 16 20 15 20"
      stroke="#F4C95D"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

const LotusCardIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3 C12 3 8 8 8 12 C8 16 12 18 12 18 C12 18 16 16 16 12 C16 8 12 3 12 3 Z"
      fill="#DFA62E"
    />
    <Path
      d="M5 10 C5 10 3 13 4 16 C5 19 8 18 8 18 C8 18 6 15 6 12 C6 11 5 10 5 10 Z"
      fill="#F4C95D"
    />
    <Path
      d="M19 10 C19 10 21 13 20 16 C19 19 16 18 16 18 C16 18 18 15 18 12 C18 11 19 10 19 10 Z"
      fill="#F4C95D"
    />
    <Path d="M3 19 C7 21 17 21 21 19" stroke="#DFA62E" strokeWidth={1.5} strokeLinecap="round" />
  </Svg>
);

const HeadsetIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 12 C4 7.6 7.6 4 12 4 C16.4 4 20 7.6 20 12 V18 C20 19.1 19.1 20 18 20 H17 V14 H20"
      stroke="#DFA62E"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M4 14 H7 V20 H6 C4.9 20 4 19.1 4 18 V14 Z"
      fill="#DFA62E"
    />
    <Path
      d="M20 14 H17 V20 H18 C19.1 20 20 19.1 20 18 V14 Z"
      fill="#DFA62E"
    />
    <Path d="M7 20 C7 20 8 22 12 22 H14" stroke="#DFA62E" strokeWidth={1.8} strokeLinecap="round" />
    <Circle cx="14" cy="22" r="1.5" fill="#F4C95D" />
  </Svg>
);

const TempleCardIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    {/* Gopuram spire */}
    <Polygon points="12,2 15,6 9,6" fill="#F4C95D" />
    <Path d="M7 6 H17 L18 10 H6 Z" fill="#DFA62E" />
    <Path d="M5 10 H19 L20 14 H4 Z" fill="#DFA62E" />
    <Rect x="5" y="14" width="14" height="7" stroke="#DFA62E" strokeWidth={1.5} />
    <Path d="M10 21 V16 Q12 14.5 14 16 V21 Z" fill="#F4C95D" />
  </Svg>
);

// 6. Right Chevron Arrow (>)
const ChevronRightIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18l6-6-6-6"
      stroke="#DFA62E"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 7. Key Features Mini Icons
const FeatureDiyaIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M5 14 C5 14 6 18 12 18 C18 18 19 14 19 14 H5 Z" fill="#DFA62E" stroke="#B8860B" strokeWidth={1} />
    <Path d="M12 4 C12 4 14 8 14 10 C14 11.5 13 12.5 12 12.5 C11 12.5 10 11.5 10 10 C10 8 12 4 12 4 Z" fill="#E65100" />
    <Path d="M12 7 C12 7 13 9 13 10 C13 10.8 12.5 11.2 12 11.2 C11.5 11.2 11 10.8 11 10 C11 9 12 7 12 7 Z" fill="#FFD54F" />
  </Svg>
);

const FeatureCalendarIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="18" rx="3" stroke="#DFA62E" strokeWidth={2} />
    <Path d="M16 2v4M8 2v4M3 10h18" stroke="#DFA62E" strokeWidth={1.8} />
    <Circle cx="8" cy="14" r="1.2" fill="#DFA62E" />
    <Circle cx="12" cy="14" r="1.2" fill="#DFA62E" />
    <Circle cx="16" cy="14" r="1.2" fill="#DFA62E" />
    <Circle cx="8" cy="18" r="1.2" fill="#DFA62E" />
    <Circle cx="12" cy="18" r="1.2" fill="#DFA62E" />
    <Circle cx="16" cy="18" r="1.2" fill="#DFA62E" />
  </Svg>
);

const FeatureTempleIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2l7 5v2H5V7l7-5z" fill="#DFA62E" />
    <Path d="M4 11h16v2H4v-2z" fill="#DFA62E" />
    <Path d="M6 13v6M10 13v6M14 13v6M18 13v6M3 19h18v3H3v-3z" stroke="#DFA62E" strokeWidth={1.6} />
  </Svg>
);

const FeatureLiveIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" fill="#D84315" />
    <Path d="M8 8 A5.6 5.6 0 0 0 8 16" stroke="#D84315" strokeWidth={1.8} strokeLinecap="round" />
    <Path d="M16 8 A5.6 5.6 0 0 1 16 16" stroke="#D84315" strokeWidth={1.8} strokeLinecap="round" />
    <Path d="M5 5 A10 10 0 0 0 5 19" stroke="#DFA62E" strokeWidth={1.8} strokeLinecap="round" />
    <Path d="M19 5 A10 10 0 0 1 19 19" stroke="#DFA62E" strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

// 8. Contact Icons
const ContactMailIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="4" width="20" height="16" rx="2" stroke="#173D32" strokeWidth={2} />
    <Path d="M22 6l-10 7L2 6" stroke="#173D32" strokeWidth={2} />
  </Svg>
);

const ContactGlobeIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke="#173D32" strokeWidth={2} />
    <Path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="#173D32" strokeWidth={2} />
  </Svg>
);

// 9. Standing Brass Lamp for Footer
const StandingLamp = () => (
  <Svg width={36} height={70} viewBox="0 0 36 70" fill="none">
    <Path
      d="M18 2 C18 2 21 7 21 9.5 C21 11.5 19.5 13 18 13 C16.5 13 15 11.5 15 9.5 C15 7 18 2 18 2 Z"
      fill="#FF9800"
    />
    <Path
      d="M18 5 C18 5 19.5 7.5 19.5 9 C19.5 10.2 18.8 11 18 11 C17.2 11 16.5 10.2 16.5 9 C16.5 7.5 18 5 18 5 Z"
      fill="#FFD54F"
    />
    <Path d="M11 13 H25 C25 13 23 17 18 17 C13 17 11 13 11 13 Z" fill="#DFA62E" stroke="#B8860B" strokeWidth="1" />
    <Circle cx="18" cy="18" r="1.5" fill="#DFA62E" />
    <Path d="M17 19 H19 V48 H17 Z" fill="#DFA62E" />
    <Circle cx="18" cy="30" r="3" fill="#DFA62E" stroke="#B8860B" strokeWidth="0.8" />
    <Circle cx="18" cy="40" r="2.5" fill="#DFA62E" stroke="#B8860B" strokeWidth="0.8" />
    <Path d="M12 48 H24 L22 52 H14 Z" fill="#DFA62E" stroke="#B8860B" strokeWidth="0.8" />
    <Path d="M8 52 H28 L27 58 H9 Z" fill="#DFA62E" stroke="#B8860B" strokeWidth="0.8" />
    <Path d="M5 58 H31 V63 H5 Z" fill="#B8860B" />
  </Svg>
);

// --- MULTILINGUAL STRINGS (6 LANGUAGES) ---
const I18N_ABOUT: Record<
  string,
  {
    headerTitle: string;
    appName: string;
    appTagline: string;
    introDescription: string;
    ourMissionTitle: string;
    ourMissionText: string;
    keyFeaturesTitle: string;
    poojaVidhanamLabel: string;
    dailyPanchangamLabel: string;
    templesInIndiaLabel: string;
    liveStreamsDonationsLabel: string;
    supportContactTitle: string;
    madeForDevoteesTitle: string;
    madeForDevoteesText: string;
    backToProfileBtn: string;
  }
> = {
  te: {
    headerTitle: 'About App',
    appName: 'Saranam Ayyappa',
    appTagline: '|| Swamiye Saranam Ayyappa ||',
    introDescription:
      'Your complete devotional companion for poojas, stotras, slokas, bhajans, temple discovery, live darshan, panchangam, and annadanam updates.',
    ourMissionTitle: 'Our Mission',
    ourMissionText:
      'To help devotees stay spiritually connected with Lord Ayyappa through authentic, accessible, and comprehensive devotional services.',
    keyFeaturesTitle: 'Key Features',
    poojaVidhanamLabel: 'Pooja Vidhanam',
    dailyPanchangamLabel: 'Daily Panchangam',
    templesInIndiaLabel: 'Temples in India',
    liveStreamsDonationsLabel: 'Live Streams & Donations',
    supportContactTitle: 'Support & Contact',
    madeForDevoteesTitle: 'Made for Devotees',
    madeForDevoteesText:
      'A heartfelt initiative to preserve devotion, culture, and the sacred temple traditions of Lord Ayyappa for devotees across the world.',
    backToProfileBtn: 'Back to Profile',
  },
  en: {
    headerTitle: 'About App',
    appName: 'Saranam Ayyappa',
    appTagline: '|| Swamiye Saranam Ayyappa ||',
    introDescription:
      'Your complete devotional companion for poojas, stotras, slokas, bhajans, temple discovery, live darshan, panchangam, and annadanam updates.',
    ourMissionTitle: 'Our Mission',
    ourMissionText:
      'To help devotees stay spiritually connected with Lord Ayyappa through authentic, accessible, and comprehensive devotional services.',
    keyFeaturesTitle: 'Key Features',
    poojaVidhanamLabel: 'Pooja Vidhanam',
    dailyPanchangamLabel: 'Daily Panchangam',
    templesInIndiaLabel: 'Temples in India',
    liveStreamsDonationsLabel: 'Live Streams & Donations',
    supportContactTitle: 'Support & Contact',
    madeForDevoteesTitle: 'Made for Devotees',
    madeForDevoteesText:
      'A heartfelt initiative to preserve devotion, culture, and the sacred temple traditions of Lord Ayyappa for devotees across the world.',
    backToProfileBtn: 'Back to Profile',
  },
  ta: {
    headerTitle: 'About App',
    appName: 'Saranam Ayyappa',
    appTagline: '|| Swamiye Saranam Ayyappa ||',
    introDescription:
      'Your complete devotional companion for poojas, stotras, slokas, bhajans, temple discovery, live darshan, panchangam, and annadanam updates.',
    ourMissionTitle: 'Our Mission',
    ourMissionText:
      'To help devotees stay spiritually connected with Lord Ayyappa through authentic, accessible, and comprehensive devotional services.',
    keyFeaturesTitle: 'Key Features',
    poojaVidhanamLabel: 'Pooja Vidhanam',
    dailyPanchangamLabel: 'Daily Panchangam',
    templesInIndiaLabel: 'Temples in India',
    liveStreamsDonationsLabel: 'Live Streams & Donations',
    supportContactTitle: 'Support & Contact',
    madeForDevoteesTitle: 'Made for Devotees',
    madeForDevoteesText:
      'A heartfelt initiative to preserve devotion, culture, and the sacred temple traditions of Lord Ayyappa for devotees across the world.',
    backToProfileBtn: 'Back to Profile',
  },
  kn: {
    headerTitle: 'About App',
    appName: 'Saranam Ayyappa',
    appTagline: '|| Swamiye Saranam Ayyappa ||',
    introDescription:
      'Your complete devotional companion for poojas, stotras, slokas, bhajans, temple discovery, live darshan, panchangam, and annadanam updates.',
    ourMissionTitle: 'Our Mission',
    ourMissionText:
      'To help devotees stay spiritually connected with Lord Ayyappa through authentic, accessible, and comprehensive devotional services.',
    keyFeaturesTitle: 'Key Features',
    poojaVidhanamLabel: 'Pooja Vidhanam',
    dailyPanchangamLabel: 'Daily Panchangam',
    templesInIndiaLabel: 'Temples in India',
    liveStreamsDonationsLabel: 'Live Streams & Donations',
    supportContactTitle: 'Support & Contact',
    madeForDevoteesTitle: 'Made for Devotees',
    madeForDevoteesText:
      'A heartfelt initiative to preserve devotion, culture, and the sacred temple traditions of Lord Ayyappa for devotees across the world.',
    backToProfileBtn: 'Back to Profile',
  },
  hi: {
    headerTitle: 'About App',
    appName: 'Saranam Ayyappa',
    appTagline: '|| Swamiye Saranam Ayyappa ||',
    introDescription:
      'Your complete devotional companion for poojas, stotras, slokas, bhajans, temple discovery, live darshan, panchangam, and annadanam updates.',
    ourMissionTitle: 'Our Mission',
    ourMissionText:
      'To help devotees stay spiritually connected with Lord Ayyappa through authentic, accessible, and comprehensive devotional services.',
    keyFeaturesTitle: 'Key Features',
    poojaVidhanamLabel: 'Pooja Vidhanam',
    dailyPanchangamLabel: 'Daily Panchangam',
    templesInIndiaLabel: 'Temples in India',
    liveStreamsDonationsLabel: 'Live Streams & Donations',
    supportContactTitle: 'Support & Contact',
    madeForDevoteesTitle: 'Made for Devotees',
    madeForDevoteesText:
      'A heartfelt initiative to preserve devotion, culture, and the sacred temple traditions of Lord Ayyappa for devotees across the world.',
    backToProfileBtn: 'Back to Profile',
  },
  ml: {
    headerTitle: 'About App',
    appName: 'Saranam Ayyappa',
    appTagline: '|| Swamiye Saranam Ayyappa ||',
    introDescription:
      'Your complete devotional companion for poojas, stotras, slokas, bhajans, temple discovery, live darshan, panchangam, and annadanam updates.',
    ourMissionTitle: 'Our Mission',
    ourMissionText:
      'To help devotees stay spiritually connected with Lord Ayyappa through authentic, accessible, and comprehensive devotional services.',
    keyFeaturesTitle: 'Key Features',
    poojaVidhanamLabel: 'Pooja Vidhanam',
    dailyPanchangamLabel: 'Daily Panchangam',
    templesInIndiaLabel: 'Temples in India',
    liveStreamsDonationsLabel: 'Live Streams & Donations',
    supportContactTitle: 'Support & Contact',
    madeForDevoteesTitle: 'Made for Devotees',
    madeForDevoteesText:
      'A heartfelt initiative to preserve devotion, culture, and the sacred temple traditions of Lord Ayyappa for devotees across the world.',
    backToProfileBtn: 'Back to Profile',
  },
};

export const AboutScreen: React.FC<Props> = ({
  currentLanguage = 'te',
  onBack,
  onNavigate,
}) => {
  const { branding, getLogoSource, onLogoError, openSocial } = useBranding();
  const activeLang = currentLanguage || 'te';
  const strings = I18N_ABOUT[activeLang] || I18N_ABOUT.te;

  // Runtime Installed Version from Expo Configuration
  const appVersion =
    Constants.expoConfig?.version ||
    (Constants.manifest as any)?.version ||
    '1.0.0';

  // Dynamic CMS / DB content state (STRICTLY DYNAMIC - ZERO STATIC FALLBACKS)
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [introText, setIntroText] = useState<string>('');
  const [introTitle, setIntroTitle] = useState<string>('');
  const [guidelinesText, setGuidelinesText] = useState<string>('');
  const [guidelinesTitle, setGuidelinesTitle] = useState<string>('');
  const [supportEmail, setSupportEmail] = useState<string>('');
  const [officialHelpline, setOfficialHelpline] = useState<string>('');
  const [officialWebsite, setOfficialWebsite] = useState<string>('saranamayyappa.in');
  const [templeTimings, setTempleTimings] = useState<string>('');
  const [templeAddress, setTempleAddress] = useState<string>('');
  const [missionExpanded, setMissionExpanded] = useState<boolean>(false);
  const [liveStreamModalOpen, setLiveStreamModalOpen] = useState<boolean>(false);

  // Hardware Back Handler
  useEffect(() => {
    if (!onBack) return;
    const backSub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (liveStreamModalOpen) {
        setLiveStreamModalOpen(false);
        return true;
      }
      onBack();
      return true;
    });
    return () => backSub.remove();
  }, [onBack, liveStreamModalOpen]);

  // Fetch published CMS & Contact Info dynamically from DB via API response
  const loadCmsAndContactData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [aboutCms, guidelinesCms, contactRes] = await Promise.all([
        ApiService.getCmsDocument('about_us', activeLang),
        ApiService.getCmsDocument('sabarimala_guidelines', activeLang),
        ApiService.getContactInfo(activeLang),
      ]);

      if (aboutCms && aboutCms.content) {
        setIntroText(aboutCms.content);
        setIntroTitle(aboutCms.title || 'About Saranam Ayyappa');
      } else {
        setIntroText('');
      }

      if (guidelinesCms && guidelinesCms.content) {
        setGuidelinesText(guidelinesCms.content);
        setGuidelinesTitle(guidelinesCms.title || 'Sabarimala Pilgrimage Guidelines');
      }

      if (contactRes) {
        if (contactRes.email) setSupportEmail(contactRes.email);
        if (contactRes.helpline) setOfficialHelpline(contactRes.helpline);
        if (contactRes.templeTimings) setTempleTimings(contactRes.templeTimings);
        if (contactRes.address) setTempleAddress(contactRes.address);
      }
    } catch (err: any) {
      console.warn('About Screen: CMS API fetch error:', err?.message);
      setFetchError('Failed to load information from database.');
    } finally {
      setLoading(false);
    }
  }, [activeLang]);

  useEffect(() => {
    loadCmsAndContactData();
  }, [loadCmsAndContactData]);

  // Email Action Handler
  const handleEmailPress = async () => {
    const mailUrl = `mailto:${supportEmail}?subject=Saranam%20Ayyappa%20App%20Support`;
    try {
      const supported = await Linking.canOpenURL(mailUrl);
      if (supported) {
        await Linking.openURL(mailUrl);
      } else {
        await Linking.openURL(`mailto:${supportEmail}`);
      }
    } catch (e) {
      console.warn('Cannot open email app:', e);
    }
  };

  // Website Action Handler
  const handleWebsitePress = async () => {
    const url = officialWebsite.startsWith('http')
      ? officialWebsite
      : `https://${officialWebsite}`;
    try {
      await Linking.openURL(url);
    } catch (e) {
      console.warn('Cannot open website URL:', e);
    }
  };

  // Safe Navigation Handler for Features
  const handleFeatureNavigate = (target: string) => {
    if (!onNavigate) {
      if (onBack) onBack();
      return;
    }
    if (target === 'pooja') {
      onNavigate('categories');
    } else if (target === 'panchangam') {
      onNavigate('panchangam');
    } else if (target === 'temples') {
      onNavigate('temples');
    } else if (target === 'live_choice') {
      setLiveStreamModalOpen(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0C251E" />

      {/* =========================================================================
          DEVOTIONAL HEADER
         ========================================================================= */}
      <LinearGradient
        colors={['#0C251E', '#173D32', '#173D32', '#A22833', '#173D32']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerContainer}
      >
        {/* Corner Ornaments */}
        <View style={styles.cornerLeft}>
          <HeaderCornerOrnament />
        </View>
        <View style={styles.cornerRight}>
          <HeaderCornerOrnament flipped />
        </View>

        {/* Brass Hanging Deepams */}
        <View style={styles.hangingLampLeft}>
          <HangingBrassDeepam />
        </View>
        <View style={styles.hangingLampRight}>
          <HangingBrassDeepam />
        </View>

        {/* Header Back Button */}
        <TouchableOpacity
          style={styles.backButtonFrame}
          onPress={onBack}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Back to Profile"
        >
          <HeaderBackIcon />
        </TouchableOpacity>

        {/* Header Title & Lotus Divider */}
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitleText}>About App</Text>
          <View style={styles.headerLotusDivider}>
            <GoldenLotusDivider />
          </View>
        </View>
      </LinearGradient>

      {/* =========================================================================
          MAIN SCROLLABLE CONTENT
         ========================================================================= */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* =========================================================================
            CARD 1: APPLICATION IDENTITY & INTRO
           ========================================================================= */}
        <View style={styles.card}>
          <View style={styles.identityTopRow}>
            {/* Lord Ayyappa Emblem */}
            <View style={styles.emblemOuterRing}>
              <Image
                source={getLogoSource(AYYAPPA_EMBLEM)}
                onError={onLogoError}
                style={styles.emblemImage}
                resizeMode="cover"
              />
            </View>

            {/* Application Name & Tagline */}
            <View style={styles.identityTextCol}>
              <Text style={styles.appNameText}>{branding.title}</Text>
              <Text style={styles.appTaglineText}>
                {branding.tagline ? `|| ${branding.tagline} ||` : '|| Swamiye Saranam Ayyappa ||'}
              </Text>
              <View style={styles.versionBadge}>
                <Text style={styles.versionBadgeText}>Version {appVersion}</Text>
              </View>
            </View>
          </View>

          {/* Dynamic DB Content / Loading / Error (ZERO STATIC FALLBACKS) */}
          {loading ? (
            <View style={{ paddingVertical: 18, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#DFA62E" />
              <Text style={{ marginTop: 8, fontSize: 13, color: '#888' }}>Loading from database...</Text>
            </View>
          ) : fetchError ? (
            <View style={{ paddingVertical: 14, alignItems: 'center' }}>
              <Text style={{ color: '#D32F2F', fontSize: 13, textAlign: 'center', marginBottom: 8 }}>{fetchError}</Text>
              <TouchableOpacity
                onPress={loadCmsAndContactData}
                style={{ backgroundColor: '#173D32', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 6 }}
              >
                <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '600' }}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : introText ? (
            <Text style={styles.introDescriptionText}>{introText}</Text>
          ) : (
            <Text style={[styles.introDescriptionText, { fontStyle: 'italic', color: '#999' }]}>No description records found in database.</Text>
          )}

          {/* Golden Lotus Divider */}
          <View style={styles.introLotusDivider}>
            <GoldenLotusDivider />
          </View>
        </View>

        {/* =========================================================================
            CARD 2: SACRED PILGRIMAGE GUIDELINES (DYNAMIC FROM DB CMS)
           ========================================================================= */}
        {guidelinesText ? (
          <TouchableOpacity
            style={styles.card}
            onPress={() => setMissionExpanded((prev) => !prev)}
            activeOpacity={0.88}
          >
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardIconBox}>
                <PranamIcon />
              </View>
              <View style={styles.cardContentCol}>
                <Text style={styles.cardHeadingText}>{guidelinesTitle || 'Sabarimala Pilgrimage Guidelines'}</Text>
                <Text
                  style={styles.cardBodyText}
                  numberOfLines={missionExpanded ? undefined : 3}
                >
                  {guidelinesText}
                </Text>
              </View>
              <View style={styles.chevronBox}>
                <ChevronRightIcon />
              </View>
            </View>
          </TouchableOpacity>
        ) : null}

        {/* =========================================================================
            CARD 3: KEY FEATURES
           ========================================================================= */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardIconBox}>
              <LotusCardIcon />
            </View>
            <View style={styles.cardContentCol}>
              <Text style={styles.cardHeadingText}>Key Features</Text>

              {/* Feature Row 1: Pooja Vidhanam */}
              <TouchableOpacity
                style={styles.featureItemRow}
                onPress={() => handleFeatureNavigate('pooja')}
                activeOpacity={0.8}
              >
                <View style={styles.featureIconContainer}>
                  <FeatureDiyaIcon />
                </View>
                <Text style={styles.featureItemTitle}>Pooja Vidhanam</Text>
                <ChevronRightIcon />
              </TouchableOpacity>

              {/* Feature Row 2: Daily Panchangam */}
              <TouchableOpacity
                style={styles.featureItemRow}
                onPress={() => handleFeatureNavigate('panchangam')}
                activeOpacity={0.8}
              >
                <View style={styles.featureIconContainer}>
                  <FeatureCalendarIcon />
                </View>
                <Text style={styles.featureItemTitle}>Daily Panchangam</Text>
                <ChevronRightIcon />
              </TouchableOpacity>

              {/* Feature Row 3: Temples in India */}
              <TouchableOpacity
                style={styles.featureItemRow}
                onPress={() => handleFeatureNavigate('temples')}
                activeOpacity={0.8}
              >
                <View style={styles.featureIconContainer}>
                  <FeatureTempleIcon />
                </View>
                <Text style={styles.featureItemTitle}>Temples in India</Text>
                <ChevronRightIcon />
              </TouchableOpacity>

              {/* Feature Row 4: Live Streams & Donations */}
              <TouchableOpacity
                style={styles.featureItemRow}
                onPress={() => handleFeatureNavigate('live_choice')}
                activeOpacity={0.8}
              >
                <View style={styles.featureIconContainer}>
                  <FeatureLiveIcon />
                </View>
                <Text style={styles.featureItemTitle}>
                  Live Streams & Donations
                </Text>
                <ChevronRightIcon />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* =========================================================================
            CARD 4: SUPPORT & CONTACT
           ========================================================================= */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardIconBox}>
              <HeadsetIcon />
            </View>
            <View style={styles.cardContentCol}>
              <Text style={styles.cardHeadingText}>Support & Contact</Text>

              {/* Email Link */}
              <TouchableOpacity
                style={styles.contactRow}
                onPress={handleEmailPress}
                activeOpacity={0.8}
              >
                <View style={styles.contactIconCircle}>
                  <ContactMailIcon />
                </View>
                <Text style={styles.contactLinkText}>{supportEmail}</Text>
              </TouchableOpacity>

              {/* Website Link */}
              <TouchableOpacity
                style={styles.contactRow}
                onPress={handleWebsitePress}
                activeOpacity={0.8}
              >
                <View style={styles.contactIconCircle}>
                  <ContactGlobeIcon />
                </View>
                <Text style={styles.contactLinkText}>{officialWebsite}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleEmailPress} style={styles.chevronBox}>
              <ChevronRightIcon />
            </TouchableOpacity>
          </View>
        </View>

        {/* =========================================================================
            CARD 5: SACRED TEMPLE TIMINGS & INFORMATION (DYNAMIC FROM DB API)
           ========================================================================= */}
        {templeTimings || templeAddress ? (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardIconBox}>
                <TempleCardIcon />
              </View>
              <View style={styles.cardContentCol}>
                <Text style={styles.cardHeadingText}>Sacred Temple Timings</Text>
                {templeTimings ? (
                  <Text style={[styles.cardBodyText, { marginBottom: templeAddress ? 6 : 0 }]}>
                    {templeTimings}
                  </Text>
                ) : null}
                {templeAddress ? (
                  <Text style={[styles.cardBodyText, { color: '#666', fontSize: 12 }]}>
                    {templeAddress}
                  </Text>
                ) : null}
              </View>
              <View style={styles.chevronBox}>
                <ChevronRightIcon />
              </View>
            </View>
          </View>
        ) : null}

        {/* =========================================================================
            TEMPLE FOOTER ARTWORK & STANDING LAMPS
           ========================================================================= */}
        <View style={styles.footerArtworkWrapper}>
          {/* Background Temple Image */}
          <Image
            source={TEMPLE_FOOTER_IMAGE}
            style={styles.footerTempleImage}
            resizeMode="cover"
          />
          {/* Subtle Soft Gradient Overlay */}
          <LinearGradient
            colors={['rgba(255, 248, 235, 0.4)', 'rgba(255, 248, 235, 0.05)', 'rgba(84, 14, 22, 0.4)']}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Standing Brass Lamps */}
          <View style={styles.footerLampLeft}>
            <StandingLamp />
          </View>
          <View style={styles.footerLampRight}>
            <StandingLamp />
          </View>
        </View>

        {/* =========================================================================
            PRIMARY ACTION: BACK TO PROFILE BUTTON
           ========================================================================= */}
        <TouchableOpacity
          style={styles.backToProfileBtnWrapper}
          onPress={onBack}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel="Back to Profile"
        >
          <LinearGradient
            colors={['#173D32', '#0C251E', '#0C251E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.backToProfileGradient}
          >
            {/* White Profile Silhouette Icon */}
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={styles.profileBtnIcon}>
              <Circle cx="12" cy="7" r="4" stroke="#FFF8EB" strokeWidth={2} />
              <Path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" stroke="#FFF8EB" strokeWidth={2} />
            </Svg>
            <Text style={styles.backToProfileBtnText}>Back to Profile</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Subtle Bottom Spacer */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* =========================================================================
          LIVE STREAMS & DONATIONS CHOICE MODAL
         ========================================================================= */}
      <Modal
        visible={liveStreamModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLiveStreamModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Live Streams & Sevas</Text>
            <Text style={styles.modalSubtitle}>Select an authentic devotional service</Text>

            <TouchableOpacity
              style={styles.modalOptionBtn}
              onPress={() => {
                setLiveStreamModalOpen(false);
                if (onNavigate) onNavigate('live_streams');
              }}
            >
              <Text style={styles.modalOptionIcon}>📡</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalOptionTitle}>Watch Live Temple Darshan</Text>
                <Text style={styles.modalOptionDesc}>Sabarimala & sacred temple broadcasts</Text>
              </View>
              <ChevronRightIcon />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOptionBtn}
              onPress={() => {
                setLiveStreamModalOpen(false);
                if (onNavigate) onNavigate('donations');
              }}
            >
              <Text style={styles.modalOptionIcon}>🪷</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalOptionTitle}>Temple Sevas & Annadanam</Text>
                <Text style={styles.modalOptionDesc}>Contribute securely to verified sevas</Text>
              </View>
              <ChevronRightIcon />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setLiveStreamModalOpen(false)}
            >
              <Text style={styles.modalCancelText}>Close</Text>
            </TouchableOpacity>
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
  scrollView: {
    flex: 1,
    backgroundColor: '#FFF8EB',
  },
  scrollContent: {
    paddingBottom: 24,
  },

  // --- DEVOTIONAL HEADER ---
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 20 : 28,
    paddingBottom: 22,
    paddingHorizontal: 16,
    position: 'relative',
    borderBottomWidth: 1.5,
    borderBottomColor: '#DFA62E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  cornerRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
  },
  hangingLampLeft: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 18 : 24,
    left: 64,
    zIndex: 3,
  },
  hangingLampRight: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 18 : 24,
    right: 64,
    zIndex: 3,
  },
  backButtonFrame: {
    position: 'absolute',
    left: 16,
    top: Platform.OS === 'ios' ? 24 : 32,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: '#DFA62E',
    backgroundColor: 'rgba(84, 14, 22, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  headerTitleText: {
    color: '#FFF8EB',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
  },
  headerLotusDivider: {
    marginTop: 4,
  },

  // --- CARDS SHARED STYLING ---
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#FFF9F0',
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: '#E8CD9C',
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
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#173D32',
    borderWidth: 1,
    borderColor: '#DFA62E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#173D32',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardContentCol: {
    flex: 1,
  },
  cardHeadingText: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#0C251E',
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    marginBottom: 4,
  },
  cardBodyText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#112620',
  },
  chevronBox: {
    paddingLeft: 6,
    paddingTop: 4,
  },

  // --- CARD 1: IDENTITY & INTRO ---
  identityTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  emblemOuterRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: '#DFA62E',
    backgroundColor: '#0C251E',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#DFA62E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
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
  identityTextCol: {
    flex: 1,
  },
  appNameText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#173D32',
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    marginBottom: 2,
  },
  appTaglineText: {
    fontSize: 12.5,
    fontStyle: 'italic',
    color: '#173D32',
    fontWeight: '700',
    marginBottom: 6,
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
  },
  versionBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DFA62E',
    backgroundColor: '#FFF8EB',
  },
  versionBadgeText: {
    fontSize: 11,
    color: '#0C251E',
    fontWeight: '700',
  },
  introDescriptionText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#112620',
    textAlign: 'center',
    paddingHorizontal: 8,
    marginTop: 4,
    marginBottom: 10,
  },
  introLotusDivider: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },

  // --- KEY FEATURES ROWS ---
  featureItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8CD9C',
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 6,
  },
  featureIconContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  featureItemTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#0C251E',
  },

  // --- CONTACT ROWS ---
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    marginTop: 2,
  },
  contactIconCircle: {
    width: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  contactLinkText: {
    fontSize: 13,
    color: '#0C251E',
    fontWeight: '600',
  },

  // --- FOOTER ARTWORK & LAMPS ---
  footerArtworkWrapper: {
    height: 140,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.2,
    borderColor: '#E8CD9C',
  },
  footerTempleImage: {
    width: '100%',
    height: '100%',
  },
  footerLampLeft: {
    position: 'absolute',
    left: 12,
    bottom: 8,
    zIndex: 2,
  },
  footerLampRight: {
    position: 'absolute',
    right: 12,
    bottom: 8,
    zIndex: 2,
  },

  // --- BACK TO PROFILE BUTTON ---
  backToProfileBtnWrapper: {
    marginHorizontal: 40,
    marginTop: 8,
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#DFA62E',
    ...Platform.select({
      ios: {
        shadowColor: '#0C251E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backToProfileGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  profileBtnIcon: {
    marginRight: 8,
  },
  backToProfileBtnText: {
    color: '#FFF8EB',
    fontSize: 15.5,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
  },

  // --- MODAL STYLING ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFF9F0',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E8CD9C',
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
    color: '#0C251E',
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
    backgroundColor: '#FFFDF9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8CD9C',
    marginBottom: 10,
  },
  modalOptionIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  modalOptionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0C251E',
  },
  modalOptionDesc: {
    fontSize: 11,
    color: '#2E7561',
    marginTop: 2,
  },
  modalCancelBtn: {
    alignSelf: 'center',
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  modalCancelText: {
    fontSize: 13,
    color: '#173D32',
    fontWeight: '700',
  },
});
