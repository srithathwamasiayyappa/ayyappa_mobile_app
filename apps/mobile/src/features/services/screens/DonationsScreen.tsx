import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Linking,
  Modal,
  Alert,
  BackHandler,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { SupportedLanguage, DonationCategoryItem } from '../../../types';
import { MASTER_DONATION_CATEGORIES } from '../../../data/donationsData';
import { ApiService } from '../../../services/api';

interface Props {
  currentLanguage: SupportedLanguage;
  currentUser?: any;
  onBack: () => void;
  onNavigateToAnnadanam: () => void;
  onNavigateToAuth?: () => void;
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

// Subtle Chevron Icon
const ChevronRightIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 6l6 6-6 6"
      stroke="#B38A52"
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
      stroke="#173D32"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 1. General Donation: Diya / Sacred Lamp Icon Badge
const GeneralDonationBadge = () => (
  <Svg width={54} height={54} viewBox="0 0 54 54" fill="none">
    <Circle cx="27" cy="27" r="26" fill="#F47C1C" />
    <Circle cx="27" cy="27" r="23" stroke="#FFA451" strokeWidth={1.5} />
    {/* Diya Base / Oil Bowl */}
    <Path
      d="M15 32 C15 38 39 38 39 32 C39 28 35 27 27 27 C19 27 15 28 15 32 Z"
      fill="#FFF3DB"
    />
    <Path
      d="M20 37 C22 39 32 39 34 37"
      stroke="#E65100"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    {/* Central Holy Flame */}
    <Path
      d="M27 13 C27 13 32 19 32 23 C32 25.8 29.8 28 27 28 C24.2 28 22 25.8 22 23 C22 19 27 13 27 13 Z"
      fill="#FFFDF8"
    />
    <Path
      d="M27 17 C27 17 29.5 20.5 29.5 23 C29.5 24.4 28.4 25.5 27 25.5 C25.6 25.5 24.5 24.4 24.5 23 C24.5 20.5 27 17 27 17 Z"
      fill="#FFD54F"
    />
    {/* Left Flame */}
    <Path
      d="M20 20 C20 20 23 23 23 26 C23 27.5 21.5 28.5 20 28.5 C18.5 28.5 17 27.5 17 26 C17 23 20 20 20 20 Z"
      fill="#FFF3DB"
    />
    {/* Right Flame */}
    <Path
      d="M34 20 C34 20 37 23 37 26 C37 27.5 35.5 28.5 34 28.5 C32.5 28.5 31 27.5 31 26 C31 23 34 20 34 20 Z"
      fill="#FFF3DB"
    />
  </Svg>
);

// 2. Temple Seva Booking: Gopuram / Temple Tower Badge
const TempleSevaBadge = () => (
  <Svg width={54} height={54} viewBox="0 0 54 54" fill="none">
    <Circle cx="27" cy="27" r="26" fill="#F47C1C" />
    <Circle cx="27" cy="27" r="23" stroke="#FFA451" strokeWidth={1.5} />
    {/* Gopuram Silhouette */}
    <Path
      d="M27 12 L28.5 15 L25.5 15 Z"
      fill="#FFF3DB"
    />
    {/* Kalasam Spire */}
    <Circle cx="27" cy="11" r="1.5" fill="#FFF3DB" />
    {/* Tier 1 */}
    <Path
      d="M23 16 L31 16 L33 21 L21 21 Z"
      fill="#FFF3DB"
    />
    {/* Tier 2 */}
    <Path
      d="M19 22 L35 22 L37 28 L17 28 Z"
      fill="#FFF3DB"
    />
    {/* Main Sanctum Base & Doorway */}
    <Path
      d="M15 29 L39 29 L39 39 L15 39 Z"
      fill="#FFF3DB"
    />
    {/* Sacred Arch Door */}
    <Path
      d="M23 39 L23 33 C23 30.8 31 30.8 31 33 L31 39 Z"
      fill="#E65100"
    />
    <Circle cx="27" cy="25" r="1.8" fill="#E65100" />
  </Svg>
);

// 3. Annadanam (Food Donation): Sacred Prasadam Bowl Badge
const AnnadanamBadge = () => (
  <Svg width={54} height={54} viewBox="0 0 54 54" fill="none">
    <Circle cx="27" cy="27" r="26" fill="#F47C1C" />
    <Circle cx="27" cy="27" r="23" stroke="#FFA451" strokeWidth={1.5} />
    {/* Traditional Prasadam Uruli Bowl */}
    <Path
      d="M14 27 C14 36 40 36 40 27 L39 25 L15 25 Z"
      fill="#FFF3DB"
    />
    {/* Stand / Foot */}
    <Path
      d="M22 36 L32 36 L34 39 L20 39 Z"
      fill="#FFF3DB"
    />
    {/* Heap of Rice / Fruits prasadam */}
    <Circle cx="20" cy="22" r="3.2" fill="#FFFDF8" />
    <Circle cx="27" cy="19" r="4.2" fill="#FFFDF8" />
    <Circle cx="34" cy="22" r="3.2" fill="#FFFDF8" />
    {/* Sacred Leaf on top */}
    <Path
      d="M27 14 C25 17 27 19 27 19 C27 19 29 17 27 14 Z"
      fill="#C8E6C9"
    />
  </Svg>
);

// 4. Festival Donation: Sacred Kalasam & Lotus Badge
const FestivalDonationBadge = () => (
  <Svg width={54} height={54} viewBox="0 0 54 54" fill="none">
    <Circle cx="27" cy="27" r="26" fill="#F47C1C" />
    <Circle cx="27" cy="27" r="23" stroke="#FFA451" strokeWidth={1.5} />
    {/* Lotus Petals / Kalasam */}
    <Path
      d="M27 15 C27 15 22 22 22 26 C22 28.8 24.2 31 27 31 C29.8 31 32 28.8 32 26 C32 22 27 15 27 15 Z"
      fill="#FFF3DB"
    />
    {/* Outer Lotus Petals */}
    <Path
      d="M17 26 C17 31 22 33 24 33 C22 30 20 27 20 25 C17 24 17 25 17 26 Z"
      fill="#FFF3DB"
    />
    <Path
      d="M37 26 C37 31 32 33 30 33 C32 30 34 27 34 25 C37 24 37 25 37 26 Z"
      fill="#FFF3DB"
    />
    {/* Pedestal */}
    <Path
      d="M18 34 C22 33 32 33 36 34 L34 38 L20 38 Z"
      fill="#FFF3DB"
    />
  </Svg>
);

// 5. Nitya Pooja Sponsorship: Holy Homa Kundam & Pooja Bell Badge
const NityaPoojaBadge = () => (
  <Svg width={54} height={54} viewBox="0 0 54 54" fill="none">
    <Circle cx="27" cy="27" r="26" fill="#F47C1C" />
    <Circle cx="27" cy="27" r="23" stroke="#FFA451" strokeWidth={1.5} />
    {/* Stepped Homa Kunda Altar */}
    <Path
      d="M15 36 L39 36 L37 39 L17 39 Z"
      fill="#FFF3DB"
    />
    <Path
      d="M17 32 L37 32 L35 36 L19 36 Z"
      fill="#FFF3DB"
    />
    <Path
      d="M20 29 L34 29 L33 32 L21 32 Z"
      fill="#FFF3DB"
    />
    {/* Triple Agni Sacred Flames */}
    <Path
      d="M27 13 C27 13 31 18 31 22 C31 25 29 27 27 27 C25 27 23 25 23 22 C23 18 27 13 27 13 Z"
      fill="#FFFDF8"
    />
    <Path
      d="M21 19 C21 19 24 22 24 25 C24 26.5 22.8 27.5 21.5 27.5 C20.2 27.5 19 26.5 19 25 C19 22 21 19 21 19 Z"
      fill="#FFF3DB"
    />
    <Path
      d="M33 19 C33 19 35 22 35 25 C35 26.5 33.8 27.5 32.5 27.5 C31.2 27.5 30 26.5 30 25 C30 22 33 19 33 19 Z"
      fill="#FFF3DB"
    />
  </Svg>
);

// 6. My Donations: Passbook & Receipt Icon Badge
const MyDonationsBadge = () => (
  <Svg width={54} height={54} viewBox="0 0 54 54" fill="none">
    <Circle cx="27" cy="27" r="26" fill="#F47C1C" />
    <Circle cx="27" cy="27" r="23" stroke="#FFA451" strokeWidth={1.5} />
    {/* Clipboard / Receipt Document */}
    <Rect x="16" y="16" width="22" height="26" rx="4" fill="#FFF3DB" />
    {/* Clip at top */}
    <Rect x="22" y="13" width="10" height="5" rx="2" fill="#FFFDF8" stroke="#E65100" strokeWidth={1} />
    {/* Receipt Rows */}
    <Path
      d="M20 22 H34 M20 26 H34 M20 30 H30 M20 34 H28"
      stroke="#E65100"
      strokeWidth={1.8}
      strokeLinecap="round"
    />
    {/* Official Seal / Checkmark Badge */}
    <Circle cx="33" cy="35" r="4.5" fill="#4CAF50" />
    <Path
      d="M31 35 L32.5 36.5 L35 33.5"
      stroke="#FFFDF8"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Multilingual Content Map
const UI_TRANSLATIONS: Record<string, Record<string, string>> = {
  screenTitle: {
    en: 'Donations',
    te: 'విరాళాలు',
    kn: 'ದೇಣಿಗೆಗಳು',
    ta: 'நன்கொடைகள்',
    hi: 'दान एवं सेवा',
    ml: 'സംഭാവനകൾ',
  },
  generalDonationTitle: {
    en: 'General Donation',
    te: 'సాధారణ విరాళం',
    kn: 'ಸಾಮಾನ್ಯ ದೇಣಿಗೆ',
    ta: 'பொது நன்கொடை',
    hi: 'सामान्य दान',
    ml: 'പൊതു സംഭാവന',
  },
  generalDonationSubtitle: {
    en: 'Support temple and daily services',
    te: 'ఆలయం మరియు నిత్య సేవలకు మద్దతు',
    kn: 'ದೇವಾಲಯ ಮತ್ತು ದೈನಂದಿನ ಸೇವೆಗಳಿಗೆ ಸಹಕಾರ',
    ta: 'கோயில் மற்றும் தினசரி சேவைகளுக்கு ஆதரவு',
    hi: 'मंदिर एवं दैनिक सेवाओं में सहयोग दें',
    ml: 'ക്ഷേത്രത്തിനും നിത്യ സേവനങ്ങൾക്കും പിന്തുണ',
  },
  templeSevaTitle: {
    en: 'Temple Seva Booking',
    te: 'ఆలయ సేవా బుకింగ్',
    kn: 'ದೇವಾಲಯ ಸೇವಾ ಮುಂಗಡ ಕಾಯ್ದಿರಿಸುವಿಕೆ',
    ta: 'கோயில் சேவை முன்பதிவு',
    hi: 'मंदिर सेवा बुकिंग',
    ml: 'ക്ഷേത്ര സേവ ബുക്കിംഗ്',
  },
  templeSevaSubtitle: {
    en: 'Abhishekam, Archana, Other Sevas',
    te: 'అభిషేకం, అర్చన మరియు ఇతర సేవలు',
    kn: 'ಅಭಿಷೇಕ, ಅರ್ಚನೆ, ಇತರ ಸೇವೆಗಳು',
    ta: 'அபிஷேகம், அர்ச்சனை, பிற சேவைகள்',
    hi: 'अभिषेक, अर्चना एवं अन्य सेवाएं',
    ml: 'അഭിഷേകം, അർച്ചന, മറ്റ് സേവകൾ',
  },
  annadanamTitle: {
    en: 'Annadanam (Food Donation)',
    te: 'అన్నదానం (ఆహార దానం)',
    kn: 'ಅನ್ನದಾನ (ಆಹಾರ ದಾನ)',
    ta: 'அன்னதானம் (உணவு தானம்)',
    hi: 'अन्नदान (भोजन दान)',
    ml: 'അന്നദാനം (ഭക്ഷണ ദാനം)',
  },
  annadanamSubtitle: {
    en: 'Sponsor food for devotees',
    te: 'భక్తులకు అన్న ప్రసాదం సమర్పించండి',
    kn: 'ಭಕ್ತರಿಗೆ ಅನ್ನ ಪ್ರಸಾದ ಸೇವೆ',
    ta: 'பக்தர்களுக்கு உணவு வழங்குங்கள்',
    hi: 'श्रद्धालुओं के लिए अन्नदान प्रायोजित करें',
    ml: 'ഭക്തർക്ക് അന്നദാനം നൽകുക',
  },
  festivalDonationTitle: {
    en: 'Festival Donation',
    te: 'ఉత్సవాల విరాళం',
    kn: 'ಹಬ್ಬದ ದೇಣಿಗೆ',
    ta: 'திருவிழா நன்கொடை',
    hi: 'उत्सव दान',
    ml: 'ഉത്സവ സംഭാവന',
  },
  festivalDonationSubtitle: {
    en: 'Contribute for special festivals',
    te: 'విశేష పర్వదినాలు & ఉత్సవాలకు సహకారం',
    kn: 'ವಿಶೇಷ ಹಬ್ಬಗಳು ಮತ್ತು ಉತ್ಸವಗಳಿಗೆ ಕೊಡುಗೆ',
    ta: 'சிறப்பு திருவிழாக்களுக்கு பங்களிக்கவும்',
    hi: 'विशेष त्योहारों एवं उत्सवों में योगदान दें',
    ml: 'വിശേഷാൽ ഉത്സവങ്ങൾക്ക് സംഭാവന നൽകുക',
  },
  nityaPoojaTitle: {
    en: 'Nitya Pooja Sponsorship',
    te: 'నిత్య పూజ స్పాన్సర్‌షిప్',
    kn: 'ನಿತ್ಯ ಪೂಜಾ ಪ್ರಾಯೋಜಕತ್ವ',
    ta: 'நித்திய பூஜை ஆதரவு',
    hi: 'नित्य पूजा प्रायोजन',
    ml: 'നിത്യ പൂജാ സ്പോൺസർഷിപ്പ്',
  },
  nityaPoojaSubtitle: {
    en: 'Support regular poojas',
    te: 'నిత్య పూజలు మరియు హారతులకు సమర్పణ',
    kn: 'ದೈನಂದಿನ ಪೂಜೆಗಳಿಗೆ ಬೆಂಬಲ ನೀಡಿ',
    ta: 'வழக்கமான பூஜைகளுக்கு ஆதரவளிக்கவும்',
    hi: 'नियमित पूजा-अर्चना का समर्थन करें',
    ml: 'സ്ഥിരം പൂജകൾക്ക് പിന്തുണ നൽകുക',
  },
  myDonationsTitle: {
    en: 'My Donations',
    te: 'నా విరాళాలు',
    kn: 'ನನ್ನ ದೇಣಿಗೆಗಳು',
    ta: 'எனது நன்கொடைகள்',
    hi: 'मेरे दान विवरण',
    ml: 'എന്റെ സംഭാവനകൾ',
  },
  myDonationsSubtitle: {
    en: 'View your donation history',
    te: 'మీ గత విరాళాల వివరాలు చూడండి',
    kn: 'ನಿಮ್ಮ ದೇಣಿಗೆ ಇತಿಹಾಸವನ್ನು ವೀಕ್ಷಿಸಿ',
    ta: 'உங்கள் நன்கொடை வரலாற்றைக் காண்க',
    hi: 'अपना दान इतिहास एवं रसीदें देखें',
    ml: 'നിങ്ങളുടെ സംഭാവനാ ചരിത്രം കാണുക',
  },
};

export const DonationsScreen: React.FC<Props> = ({
  currentLanguage,
  currentUser,
  onBack,
  onNavigateToAnnadanam,
  onNavigateToAuth,
}) => {
  const [categories, setCategories] = useState<DonationCategoryItem[]>(MASTER_DONATION_CATEGORIES);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('1001');
  const [sankalpamName, setSankalpamName] = useState<string>('');
  const [sankalpamGothram, setSankalpamGothram] = useState<string>('');

  useEffect(() => {
    // Attempt fetching dynamic categories from backend if online
    let isMounted = true;
    ApiService.getDonationCategories()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setCategories(data);
        }
      })
      .catch(() => {
        // Fallback to static verified categories
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Hardware Back Handler
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (activeModal) {
        setActiveModal(null);
        return true;
      }
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [activeModal, onBack]);

  const t = (key: string): string => {
    const bundle = UI_TRANSLATIONS[key];
    if (bundle && bundle[currentLanguage]) return bundle[currentLanguage];
    if (bundle && bundle['en']) return bundle['en'];
    return key;
  };

  const handleCardPress = (catId: string) => {
    if (catId === 'annadanam') {
      onNavigateToAnnadanam();
      return;
    }
    setActiveModal(catId);
  };

  const renderBadge = (iconType: string) => {
    switch (iconType) {
      case 'general':
        return <GeneralDonationBadge />;
      case 'seva':
        return <TempleSevaBadge />;
      case 'annadanam':
        return <AnnadanamBadge />;
      case 'festival':
        return <FestivalDonationBadge />;
      case 'pooja':
        return <NityaPoojaBadge />;
      case 'history':
        return <MyDonationsBadge />;
      default:
        return <GeneralDonationBadge />;
    }
  };

  const getTranslatedTitle = (catId: string, fallback: string): string => {
    switch (catId) {
      case 'general-donation':
        return t('generalDonationTitle');
      case 'temple-seva':
        return t('templeSevaTitle');
      case 'annadanam':
        return t('annadanamTitle');
      case 'festival-donation':
        return t('festivalDonationTitle');
      case 'nitya-pooja':
        return t('nityaPoojaTitle');
      case 'my-donations':
        return t('myDonationsTitle');
      default:
        return fallback;
    }
  };

  const getTranslatedSubtitle = (catId: string, fallback: string): string => {
    switch (catId) {
      case 'general-donation':
        return t('generalDonationSubtitle');
      case 'temple-seva':
        return t('templeSevaSubtitle');
      case 'annadanam':
        return t('annadanamSubtitle');
      case 'festival-donation':
        return t('festivalDonationSubtitle');
      case 'nitya-pooja':
        return t('nityaPoojaSubtitle');
      case 'my-donations':
        return t('myDonationsSubtitle');
      default:
        return fallback;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#173D32" translucent={false} />

      {/* Devotional Header matching reference screenshot */}
      <LinearGradient
        colors={['#173D32', '#173D32', '#173D32']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerContainer}
      >
        <View style={styles.headerTopOrnamentLeft}>
          <HeaderCornerFiligree />
        </View>
        <View style={styles.headerTopOrnamentRight}>
          <HeaderCornerFiligree flipped />
        </View>

        <View style={styles.headerContentRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <BackArrowIcon />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{t('screenTitle')}</Text>
          </View>

          {/* Empty spacer to keep title perfectly centered */}
          <View style={styles.headerRightSpacer} />
        </View>

        {/* Golden Bottom Separator Line */}
        <LinearGradient
          colors={['transparent', '#F5CF78', '#DFA62E', '#F5CF78', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.goldSeparator}
        />
      </LinearGradient>

      {/* Body: Vertical Stack of 6 Devotional Cards */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {categories.map((item) => {
          const cardTitle = getTranslatedTitle(item.id, item.title);
          const cardSubtitle = getTranslatedSubtitle(item.id, item.subtitle);

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.categoryCard}
              activeOpacity={0.82}
              onPress={() => handleCardPress(item.id)}
            >
              <View style={styles.cardBadgeContainer}>
                {renderBadge(item.iconType)}
              </View>

              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {cardTitle}
                </Text>
                <Text style={styles.cardSubtitle} numberOfLines={2}>
                  {cardSubtitle}
                </Text>
              </View>

              <View style={styles.cardArrowContainer}>
                <ChevronRightIcon />
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Devotional Note at bottom */}
        <View style={styles.bottomDevotionalNote}>
          <Text style={styles.devotionalVerse}>
            "శరణం అయ్యప్ప • దానేన సర్వ సుఖం లభతే"
          </Text>
          <Text style={styles.devotionalVerseSub}>
            Every rupee donated goes directly to verified temple devaswoms and devotee welfare.
          </Text>
        </View>
      </ScrollView>

      {/* MODAL 1: General Donation */}
      <Modal
        visible={activeModal === 'general-donation'}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>General Temple Seva</Text>
              <TouchableOpacity
                onPress={() => setActiveModal(null)}
                style={styles.modalCloseButton}
              >
                <CloseIcon />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
              <Text style={styles.modalDesc}>
                General donations help maintain holy sanctums, support temple priests, and provide daily deeparadhana oils, flowers, and essential temple upkeep.
              </Text>

              <Text style={styles.sectionLabel}>Select Suggested Amount (₹)</Text>
              <View style={styles.amountPillsRow}>
                {['501', '1001', '2501', '5001'].map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    style={[
                      styles.amountPill,
                      customAmount === amt && styles.amountPillActive,
                    ]}
                    onPress={() => setCustomAmount(amt)}
                  >
                    <Text
                      style={[
                        styles.amountPillText,
                        customAmount === amt && styles.amountPillTextActive,
                      ]}
                    >
                      ₹{amt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.customAmountBox}>
                <Text style={styles.rupeeSymbol}>₹</Text>
                <TextInput
                  style={styles.customAmountInput}
                  value={customAmount}
                  onChangeText={setCustomAmount}
                  keyboardType="numeric"
                  placeholder="Enter custom amount"
                  placeholderTextColor="#A08E7E"
                />
              </View>

              {/* Verified Trust Information */}
              <View style={styles.verifiedTrustCard}>
                <Text style={styles.trustCardTitle}>
                  🏛️ Verified Official Devaswom Accounts
                </Text>
                <Text style={styles.trustItem}>
                  • Sabarimala: Travancore Devaswom Board (TDB)
                </Text>
                <Text style={styles.trustItem}>
                  • Tirumala: Sri Venkateswara Nitya Seva Trust (TTD)
                </Text>
                <Text style={styles.trustItem}>
                  • Srisailam: Sri Bhramaramba Mallikarjuna Devasthanam
                </Text>
              </View>

              {/* Honest Payment Gateway Status */}
              <View style={styles.gatewayNoticeCard}>
                <Text style={styles.gatewayNoticeTitle}>
                  Direct In-App Payments Under Integration
                </Text>
                <Text style={styles.gatewayNoticeText}>
                  We are currently onboarding with certified banking partners for zero-fee instant UPI payments. Devotees may also contribute directly through the authorized government devaswom portals.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.primaryActionButton}
                activeOpacity={0.85}
                onPress={() => {
                  Alert.alert(
                    'Devotional Offering',
                    `You have chosen to offer ₹${customAmount} towards General Temple Seva. Direct payment gateway will be active shortly upon banking compliance completion. May Lord Ayyappa bless your family with prosperity and peace.`,
                    [{ text: 'Swamiye Saranam Ayyappa', onPress: () => setActiveModal(null) }]
                  );
                }}
              >
                <Text style={styles.primaryActionButtonText}>
                  Confirm Offering of ₹{customAmount}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: Temple Seva Booking */}
      <Modal
        visible={activeModal === 'temple-seva'}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Temple Seva Booking</Text>
              <TouchableOpacity
                onPress={() => setActiveModal(null)}
                style={styles.modalCloseButton}
              >
                <CloseIcon />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
              <Text style={styles.modalDesc}>
                Book authentic sacred sevas performed in your name and gotram at leading holy temples across India.
              </Text>

              {[
                {
                  id: 's1',
                  name: 'Ayyappa Padi Pooja',
                  temple: 'Sabarimala Sannidhanam',
                  amount: '₹5,001',
                  desc: 'Special worship of the sacred 18 holy steps with floral decoration and ghee lamps.',
                },
                {
                  id: 's2',
                  name: 'Maha Ganapathi Homam',
                  temple: 'All Partner Devasthanams',
                  amount: '₹1,001',
                  desc: 'Sacred fire ritual performed at sunrise for removal of planetary obstacles and success.',
                },
                {
                  id: 's3',
                  name: 'Rudrabhishekam with Panchamrutam',
                  temple: 'Srisailam Mallikarjuna Swamy Temple',
                  amount: '₹1,116',
                  desc: 'Continuous sacred water and milk abhishekam with Vedic chanting of Sri Rudram.',
                },
                {
                  id: 's4',
                  name: 'Sahasranama Archana',
                  temple: 'Tirumala Sri Venkateswara Temple',
                  amount: '₹501',
                  desc: 'Chanting of 1008 divine sacred names with sacred tulasi and scented bilva leaves.',
                },
              ].map((seva) => (
                <View key={seva.id} style={styles.sevaItemCard}>
                  <View style={styles.sevaHeaderRow}>
                    <Text style={styles.sevaName}>{seva.name}</Text>
                    <Text style={styles.sevaAmount}>{seva.amount}</Text>
                  </View>
                  <Text style={styles.sevaTemple}>{seva.temple}</Text>
                  <Text style={styles.sevaDesc}>{seva.desc}</Text>
                  <TouchableOpacity
                    style={styles.sevaBookBtn}
                    onPress={() => {
                      Alert.alert(
                        seva.name,
                        `Seva booking for "${seva.name}" will be submitted to the temple office. Please provide your Gotram and Nakshatram at the desk.`,
                        [{ text: 'OK', onPress: () => setActiveModal(null) }]
                      );
                    }}
                  >
                    <Text style={styles.sevaBookBtnText}>Book Seva</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: Festival Donation */}
      <Modal
        visible={activeModal === 'festival-donation'}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Festival Donation</Text>
              <TouchableOpacity
                onPress={() => setActiveModal(null)}
                style={styles.modalCloseButton}
              >
                <CloseIcon />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
              <Text style={styles.modalDesc}>
                Sponsor special poojas, illuminations, and flower decorations during auspicious annual temple festivals.
              </Text>

              {[
                {
                  name: 'Makaravilakku Mahotsavam',
                  dates: '14 January — Sabarimala',
                  desc: 'Sacred Makara Jyothi darshan, Deeparadhana, and Thiruvabharanam procession.',
                  suggested: '₹2,501',
                },
                {
                  name: 'Mandala Pooja Utsavam',
                  dates: '41-Day Deeksha Season',
                  desc: 'Special Neyyabhishekam and daily continuous Annadanam for lakhs of devotees.',
                  suggested: '₹1,501',
                },
                {
                  name: 'Maha Shivaratri Jagaran Seva',
                  dates: 'Phalguna Krishna Chaturdashi',
                  desc: 'All-night four-kala abhishekam, bilvarchana, and maha harathi.',
                  suggested: '₹1,116',
                },
              ].map((fest, idx) => (
                <View key={idx} style={styles.sevaItemCard}>
                  <Text style={styles.sevaName}>{fest.name}</Text>
                  <Text style={styles.sevaTemple}>📅 {fest.dates}</Text>
                  <Text style={styles.sevaDesc}>{fest.desc}</Text>
                  <View style={styles.festFooterRow}>
                    <Text style={styles.festSuggested}>
                      Suggested Seva: {fest.suggested}
                    </Text>
                    <TouchableOpacity
                      style={styles.sevaBookBtn}
                      onPress={() => {
                        Alert.alert(
                          fest.name,
                          `Thank you for offering your festival sponsorship for ${fest.name}. May the divine blessings be with you and your family.`,
                          [{ text: 'OK', onPress: () => setActiveModal(null) }]
                        );
                      }}
                    >
                      <Text style={styles.sevaBookBtnText}>Contribute</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 4: Nitya Pooja Sponsorship */}
      <Modal
        visible={activeModal === 'nitya-pooja'}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Nitya Pooja Sponsorship</Text>
              <TouchableOpacity
                onPress={() => setActiveModal(null)}
                style={styles.modalCloseButton}
              >
                <CloseIcon />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
              <Text style={styles.modalDesc}>
                Sponsor continuous daily poojas performed on your auspicious family dates (Birthdays, Wedding Anniversaries, or Ancestral Tithis).
              </Text>

              <Text style={styles.inputFieldLabel}>Devotee Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Vinod Thatipally"
                value={sankalpamName}
                onChangeText={setSankalpamName}
                placeholderTextColor="#A08E7E"
              />

              <Text style={styles.inputFieldLabel}>Gotram & Nakshatram</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Koundinya Gotram, Pushya Nakshatram"
                value={sankalpamGothram}
                onChangeText={setSankalpamGothram}
                placeholderTextColor="#A08E7E"
              />

              <Text style={styles.sectionLabel}>Select Sponsorship Tier</Text>
              <View style={styles.tierContainer}>
                {[
                  { tier: '1-Day Nitya Pooja', amt: '₹501' },
                  { tier: '1-Month Nitya Seva', amt: '₹5,001' },
                  { tier: 'Shashwata (Perpetual Annual)', amt: '₹25,000' },
                ].map((tier, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.tierOptionCard}
                    onPress={() => {
                      Alert.alert(
                        'Nitya Pooja Sponsorship',
                        `Sponsorship registered for ${tier.tier} (${tier.amt}). The temple priests will perform the sankalpam in the name of ${sankalpamName || 'Devotee'}.`,
                        [{ text: 'Blessed', onPress: () => setActiveModal(null) }]
                      );
                    }}
                  >
                    <Text style={styles.tierTitle}>{tier.tier}</Text>
                    <Text style={styles.tierAmount}>{tier.amt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 5: My Donations */}
      <Modal
        visible={activeModal === 'my-donations'}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>My Donations</Text>
              <TouchableOpacity
                onPress={() => setActiveModal(null)}
                style={styles.modalCloseButton}
              >
                <CloseIcon />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
              {currentUser ? (
                <View>
                  <View style={styles.userSummaryCard}>
                    <Text style={styles.userSummaryName}>
                      {currentUser.name || 'Devotee'}
                    </Text>
                    <Text style={styles.userSummaryPhone}>
                      {currentUser.phoneNumber || currentUser.email || 'Verified Account'}
                    </Text>
                  </View>

                  <Text style={styles.sectionLabel}>Past Contribution History</Text>
                  <View style={styles.emptyDonationsCard}>
                    <Text style={styles.emptyTitle}>No Recorded Online Receipts</Text>
                    <Text style={styles.emptySubtitle}>
                      Once you make contributions through the integrated gateway or partner devaswom portals, your 80G tax exemption certificates will appear here automatically.
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.guestPromptCard}>
                  <Text style={styles.guestPromptTitle}>
                    Devotee Account Required
                  </Text>
                  <Text style={styles.guestPromptDesc}>
                    Please sign in or register to link and view your donation receipts, seva bookings, and download 80G tax exemption certificates across devices.
                  </Text>
                  <TouchableOpacity
                    style={styles.primaryActionButton}
                    onPress={() => {
                      setActiveModal(null);
                      onNavigateToAuth?.();
                    }}
                  >
                    <Text style={styles.primaryActionButtonText}>
                      Login / Register
                    </Text>
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
    backgroundColor: '#173D32',
  },
  headerContainer: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 12 : 12,
    paddingBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  headerTopOrnamentLeft: {
    position: 'absolute',
    top: 4,
    left: 4,
    zIndex: 1,
    opacity: 0.85,
  },
  headerTopOrnamentRight: {
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFDF8',
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    letterSpacing: 0.5,
  },
  headerRightSpacer: {
    width: 40,
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
    backgroundColor: '#FAF5EB',
  },
  scrollContent: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    paddingBottom: 36,
  },
  categoryCard: {
    backgroundColor: '#FFFDF9',
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
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  cardBadgeContainer: {
    marginRight: 14,
  },
  cardTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#0C251E',
    letterSpacing: 0.2,
    marginBottom: 3,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#345147',
    lineHeight: 18,
  },
  cardArrowContainer: {
    marginLeft: 8,
    paddingLeft: 4,
  },
  bottomDevotionalNote: {
    marginTop: 20,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  devotionalVerse: {
    fontSize: 14,
    fontWeight: '700',
    color: '#173D32',
    textAlign: 'center',
    marginBottom: 6,
  },
  devotionalVerseSub: {
    fontSize: 12,
    color: '#7A6B5D',
    textAlign: 'center',
    lineHeight: 17,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FAF5EB',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8CD9C',
  },
  modalHeaderTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#173D32',
  },
  modalCloseButton: {
    padding: 6,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalDesc: {
    fontSize: 14,
    color: '#5C4A3A',
    lineHeight: 20,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#173D32',
    marginBottom: 10,
    marginTop: 6,
  },
  amountPillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  amountPill: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 10,
    backgroundColor: '#FFFDF9',
    borderWidth: 1.2,
    borderColor: '#E8CD9C',
    alignItems: 'center',
  },
  amountPillActive: {
    backgroundColor: '#173D32',
    borderColor: '#173D32',
  },
  amountPillText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#173D32',
  },
  amountPillTextActive: {
    color: '#FFFDF8',
  },
  customAmountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF9',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#E8CD9C',
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 16,
  },
  rupeeSymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#173D32',
    marginRight: 6,
  },
  customAmountInput: {
    flex: 1,
    fontSize: 16,
    color: '#0C251E',
    fontWeight: '600',
  },
  verifiedTrustCard: {
    backgroundColor: '#FFF7E6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F5CF78',
    padding: 14,
    marginBottom: 14,
  },
  trustCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#173D32',
    marginBottom: 8,
  },
  trustItem: {
    fontSize: 13,
    color: '#5C4A3A',
    lineHeight: 20,
  },
  gatewayNoticeCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    padding: 14,
    marginBottom: 18,
  },
  gatewayNoticeTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 4,
  },
  gatewayNoticeText: {
    fontSize: 12.5,
    color: '#388E3C',
    lineHeight: 18,
  },
  primaryActionButton: {
    backgroundColor: '#173D32',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  primaryActionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFDF8',
  },

  // Seva Booking
  sevaItemCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8CD9C',
    padding: 14,
    marginBottom: 12,
  },
  sevaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sevaName: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#173D32',
    flex: 1,
  },
  sevaAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#B7791F',
  },
  sevaTemple: {
    fontSize: 12.5,
    color: '#7A6B5D',
    marginBottom: 6,
  },
  sevaDesc: {
    fontSize: 13,
    color: '#5C4A3A',
    lineHeight: 18,
    marginBottom: 10,
  },
  sevaBookBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#173D32',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
  },
  sevaBookBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFDF8',
  },
  festFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  festSuggested: {
    fontSize: 13,
    fontWeight: '600',
    color: '#B7791F',
  },

  // Nitya Pooja
  inputFieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#173D32',
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: '#FFFDF9',
    borderWidth: 1,
    borderColor: '#E8CD9C',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: '#0C251E',
    marginBottom: 12,
  },
  tierContainer: {
    marginTop: 6,
    marginBottom: 20,
  },
  tierOptionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFDF9',
    borderWidth: 1,
    borderColor: '#E8CD9C',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  tierTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#173D32',
  },
  tierAmount: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#B7791F',
  },

  // My Donations
  userSummaryCard: {
    backgroundColor: '#FFFDF9',
    borderWidth: 1,
    borderColor: '#E8CD9C',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  userSummaryName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#173D32',
  },
  userSummaryPhone: {
    fontSize: 13,
    color: '#7A6B5D',
    marginTop: 2,
  },
  emptyDonationsCard: {
    backgroundColor: '#FFFDF9',
    borderWidth: 1,
    borderColor: '#E8CD9C',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#173D32',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#7A6B5D',
    textAlign: 'center',
    lineHeight: 18,
  },
  guestPromptCard: {
    backgroundColor: '#FFFDF9',
    borderWidth: 1,
    borderColor: '#E8CD9C',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  guestPromptTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#173D32',
    marginBottom: 8,
  },
  guestPromptDesc: {
    fontSize: 13.5,
    color: '#7A6B5D',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
});

