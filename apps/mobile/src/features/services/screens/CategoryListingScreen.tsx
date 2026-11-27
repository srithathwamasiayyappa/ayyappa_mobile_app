import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Platform,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Polygon } from 'react-native-svg';
import { SupportedLanguage } from '../../../types';
import { CategoryListingSkeleton } from '../../../components/common/CategorySkeleton';
import { ApiService, resolveMediaUrl } from '../../../services/api';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
const { width: SCREEN_WIDTH_FULL, height: SCREEN_HEIGHT_FULL } = Dimensions.get('screen');
const SCREEN_WIDTH = Math.min(WINDOW_WIDTH, SCREEN_WIDTH_FULL);
const SCREEN_HEIGHT = Math.max(WINDOW_HEIGHT, SCREEN_HEIGHT_FULL);
const isLargeOrTallScreen = SCREEN_HEIGHT >= 800 || (SCREEN_HEIGHT / SCREEN_WIDTH) >= 1.95;

// Dynamic status bar / safe area height for Android (with explicit support for 6.7" & 6.8" screens)
const ANDROID_STATUS_BAR_HEIGHT = Platform.OS === 'android'
  ? Math.max(StatusBar.currentHeight || 0, isLargeOrTallScreen ? 44 : 36)
  : 0;

interface Props {
  categoryId: string;
  categoryTitle?: string;
  currentLanguage: SupportedLanguage;
  initialDeity?: string;
  onSelectItem: (id: string, title: string, rawId?: string, isCategoryWithTypes?: boolean) => void;
  onBack: () => void;
}

// Corner Filigree Ornaments for Header
const HeaderCornerFiligree = () => (
  <Svg width={36} height={36} viewBox="0 0 36 36" fill="none">
    <Path d="M2 2 C12 2 22 8 28 16 C24 18 18 16 12 22 C8 16 6 8 2 2 Z" fill="#DFA62E" fillOpacity={0.65} />
  </Svg>
);

// Solid Maroon Play Triangle Icon
const PlayTriangleIcon = () => (
  <Svg width={14} height={16} viewBox="0 0 14 16" fill="none">
    <Polygon points="2,1 13,8 2,15" fill="#173D32" />
  </Svg>
);

// Pre-bundled deity artworks
const DEITY_IMAGES: Record<string, any> = {
  ayyappa: require('../../../../assets/deities/ayyappa.jpg'),
  ganesha: require('../../../../assets/deities/ganesha.jpg'),
  venkateswara: require('../../../../assets/deities/venkateswara.jpg'),
  devi: require('../../../../assets/deities/durga.jpg'),
  shiva: require('../../../../assets/deities/shiva.jpg'),
  hanuman: require('../../../../assets/deities/hanuman.jpg'),
  murugan: require('../../../../assets/deities/card_murugan.jpg'),
};

interface ListingItem {
  id: string;
  rawId?: string;
  title: string;
  desc: string;
  deityId: string;
  image: any;
}

// Filter tabs definition (All | Ayyappa | Shiva | Devi | Ganesha | Venkateswara | Hanuman | Murugan)
const BASE_FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'ayyappa', label: 'Ayyappa' },
  { id: 'shiva', label: 'Shiva' },
  { id: 'devi', label: 'Devi' },
  { id: 'ganesha', label: 'Ganesha' },
  { id: 'venkateswara', label: 'Venkateswara' },
  { id: 'hanuman', label: 'Hanuman' },
  { id: 'murugan', label: 'Murugan' },
];

const DEITY_TAB_LABELS: Record<string, Record<string, string>> = {
  te: {
    all: 'అన్నీ',
    ayyappa: 'అయ్యప్ప',
    shiva: 'శివ',
    devi: 'దేవి',
    ganesha: 'వినాయక',
    venkateswara: 'వెంకటేశ్వర',
    hanuman: 'హనుమాన్',
    murugan: 'సుబ్రహ్మణ్య',
  },
  kn: {
    all: 'ಎಲ್ಲಾ',
    ayyappa: 'ಅಯ್ಯಪ್ಪ',
    shiva: 'ಶಿವ',
    devi: 'ದೇವಿ',
    ganesha: 'ಗಣೇಶ',
    venkateswara: 'ವೆಂಕಟೇಶ್ವರ',
    hanuman: 'ಹನುಮಾನ್',
    murugan: 'ಮುರುಗ',
  },
  ta: {
    all: 'அனைத்தும்',
    ayyappa: 'ஐயப்பன்',
    shiva: 'சிவன்',
    devi: 'தேவி',
    ganesha: 'விநாயகர்',
    venkateswara: 'வெங்கடேஸ்வரா',
    hanuman: 'ஹனுமான்',
    murugan: 'முருகன்',
  },
  hi: {
    all: 'सभी',
    ayyappa: 'अय्यप्पा',
    shiva: 'शिव',
    devi: 'देवी',
    ganesha: 'गणेश',
    venkateswara: 'वेंकटेश्वर',
    hanuman: 'हनुमान',
    murugan: 'मुरुगन',
  },
  ml: {
    all: 'എല്ലാം',
    ayyappa: 'അയ്യപ്പൻ',
    shiva: 'ശിവൻ',
    devi: 'ദേവി',
    ganesha: 'ഗണപതി',
    venkateswara: 'വെങ്കിടേശ്വരൻ',
    hanuman: 'ഹനുമാൻ',
    murugan: 'മുരുകൻ',
  },
  en: {
    all: 'All',
    ayyappa: 'Ayyappa',
    shiva: 'Shiva',
    devi: 'Devi',
    ganesha: 'Ganesha',
    venkateswara: 'Venkateswara',
    hanuman: 'Hanuman',
    murugan: 'Murugan',
  },
};

const CATEGORY_TITLES_BY_LANG: Record<string, Record<string, string>> = {
  te: {
    'pooja-vidhanam': 'పూజా విధానము',
    pooja: 'పూజా విధానము',
    stotras: 'దివ్య స్తోత్రాలు',
    astothrams: 'దివ్య స్తోత్రాలు',
    slokas: 'నిత్య శ్లోకాలు',
    'daily-slokas': 'నిత్య శ్లోకాలు',
    bhajans: 'భజనలు & కీర్తనలు',
    songs: 'భజనలు & కీర్తనలు',
    harathis: 'హారతులు & కీర్తనలు',
  },
  kn: {
    'pooja-vidhanam': 'ಪೂಜಾ ವಿಧಾನ',
    pooja: 'ಪೂಜಾ ವಿಧಾನ',
    stotras: 'ದಿವ್ಯ ಸ್ತೋತ್ರಗಳು',
    astothrams: 'ದಿವ್ಯ ಸ್ತೋತ್ರಗಳು',
    slokas: 'ನಿತ್ಯ ಶ್ಲೋಕಗಳು',
    'daily-slokas': 'ನಿತ್ಯ ಶ್ಲೋಕಗಳು',
    bhajans: 'ಭಜನೆಗಳು & ಕೀರ್ತನೆಗಳು',
    songs: 'ಭಜನೆಗಳು & ಕೀರ್ತನೆಗಳು',
    harathis: 'ಆರತಿಗಳು & ಕೀರ್ತನೆಗಳು',
  },
  ta: {
    'pooja-vidhanam': 'பூஜா விதானம்',
    pooja: 'பூஜா விதானம்',
    stotras: 'திவ்ய ஸ்தோத்திரங்கள்',
    astothrams: 'திவ்ய ஸ்தோத்திரங்கள்',
    slokas: 'நித்ய ஸ்லோகங்கள்',
    'daily-slokas': 'நித்ய ஸ்லோகங்கள்',
    bhajans: 'பஜனைகள் & பாடல்கள்',
    songs: 'பஜனைகள் & பாடல்கள்',
    harathis: 'ஆரத்திகள் & பாடல்கள்',
  },
  hi: {
    'pooja-vidhanam': 'पूजा विधान',
    pooja: 'पूजा विधान',
    stotras: 'दिव्य स्तोत्र',
    astothrams: 'दिव्य स्तोत्र',
    slokas: 'नित्य श्लोक',
    'daily-slokas': 'नित्य श्लोक',
    bhajans: 'भजन एवं कीर्तन',
    songs: 'भजन एवं कीर्तन',
    harathis: 'आरतियां एवं भजन',
  },
  ml: {
    'pooja-vidhanam': 'പൂജാ വിധി',
    pooja: 'പൂജാ വിധി',
    stotras: 'ദിവ്യ സ്തോത്രങ്ങൾ',
    astothrams: 'ദിവ്യ സ്തോത്രങ്ങൾ',
    slokas: 'നിത്യ ശ്ലോകങ്ങൾ',
    'daily-slokas': 'നിത്യ ശ്ലോകങ്ങൾ',
    bhajans: 'ഭജനകളും ഗാനങ്ങളും',
    songs: 'ഭജനകളും ഗാനങ്ങളും',
    harathis: 'ആരതികളും ഗാനങ്ങളും',
  },
  en: {
    'pooja-vidhanam': 'Pooja Vidhanam',
    pooja: 'Pooja Vidhanam',
    stotras: 'Divine Stotras',
    astothrams: 'Divine Stotras',
    slokas: 'Daily Slokas',
    'daily-slokas': 'Daily Slokas',
    bhajans: 'Bhajans & Songs',
    songs: 'Bhajans & Songs',
    harathis: 'Harathis & Songs',
  },
};

// Safe Devotional Artwork Thumbnail with automatic deity fallback on network error
const CardThumbnail: React.FC<{ source: any; deityId: string }> = ({ source, deityId }) => {
  const fallback = DEITY_IMAGES[deityId] || DEITY_IMAGES.ayyappa;
  const [imgSrc, setImgSrc] = useState<any>(source || fallback);

  useEffect(() => {
    setImgSrc(source || fallback);
  }, [source, deityId]);

  return (
    <Image
      source={imgSrc}
      style={styles.imageThumbnail}
      resizeMode="cover"
      onError={() => setImgSrc(fallback)}
    />
  );
};

export const CategoryListingScreen: React.FC<Props> = ({
  categoryId = 'pooja-vidhanam',
  categoryTitle,
  currentLanguage = 'en',
  initialDeity = 'all',
  onSelectItem,
  onBack,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>(initialDeity || 'all');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [dynamicItems, setDynamicItems] = useState<ListingItem[] | null>(null);

  // Dynamic filter tabs including active deity
  const filterTabs = React.useMemo(() => {
    if (!initialDeity || initialDeity === 'all') return BASE_FILTER_TABS;
    const exists = BASE_FILTER_TABS.some((t) => t.id === initialDeity);
    if (!exists) {
      const cleanLabel = initialDeity
        .replace(/^lord-/, '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
      return [...BASE_FILTER_TABS, { id: initialDeity, label: cleanLabel }];
    }
    return BASE_FILTER_TABS;
  }, [initialDeity]);

  // Load subcategories dynamically from DB via API (Instant live sync with Admin Panel)
  const fetchSubcategories = useCallback(async (isRefresh = false, overrideDeity?: string) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    const deityToFetch = overrideDeity !== undefined ? overrideDeity : selectedFilter;

    try {
      const items = await ApiService.getSubcategories(
        categoryId,
        currentLanguage,
        undefined,
        deityToFetch !== 'all' ? deityToFetch : undefined
      );

      if (Array.isArray(items) && items.length > 0) {
        const mapped: ListingItem[] = items.map((item: any) => {
          const txt = ((item.slug || '') + ' ' + (item.title || '')).toLowerCase();
          let detectedDeity = item.deityId ? item.deityId.toLowerCase() : '';

          if (!detectedDeity || detectedDeity === 'all') {
            if (/ganesh|vinayak|vignesh|vighnesh|ganapath|modak|గణపతి|వినాయక|విఘ్నేశ్వర|విఘ్నేశ|గణేశ|మోదక/.test(txt)) detectedDeity = 'ganesha';
            else if (/subrahmanya|subramanya|murugan|kartikeya|saravana|shanmukha|vel|skanda|kanda|sashti|kavasam|pazhani|palani|సుబ్రహ్మణ్య|మురుగన్|కార్తికేయ|షణ్ముఖ|స్కంద|షష్ఠి|కవచం|పళని/.test(txt)) detectedDeity = 'murugan';
            else if (/venkates|vishnu|koodalmanikya|achyuta|govinda|narayana|perumal|satyanarayana|guruvayoor|ramanuja|వేంకట|వెంకట|విష్ణు|సత్యనారాయణ|గోవింద|నారాయణ|శ్రీనివాస|గురువాయూరప్ప|రామానుజ/.test(txt)) detectedDeity = 'venkateswara';
            else if (/devi|durga|lakshmi|lalitha|kanakadhara|mahalakshmi|meenakshi|kamakshi|saraswathi|gomatha|kamadhenu|vasavi|akhiland|kanyaka|varalakshmi|దేవి|లక్ష్మి|దుర్గ|లలిత|సరస్వతి|గోమాత|కామధేను|వరలక్ష్మి|మాళికాపురత్తమ్మ|వాసవి|వాసవీ|అఖిలాండ|కన్యక/.test(txt)) detectedDeity = 'devi';
            else if (/hanuman|anjaneya|maruti|bajrang|sundarakanda|హనుమాన్|ఆంజనేయ|మారుతి|రామదూత/.test(txt)) detectedDeity = 'hanuman';
            else if (/shiva|linga|bilva|rudra|natara|mrityunjaya|kedar|vishwanath|shankara|renuka|someshwara|mallikarjuna|శివ|లింగ|బిల్వ|రుద్ర|మృత్యుంజయ|పరమశివ|కేదార|నటరాజ|విశ్వనాథ|శంకర/.test(txt)) detectedDeity = 'shiva';
            else if (/ayyap|sastha|harivarasanam|shabarimala|uthara|sannidhanam|padi|maaladharan|sharanu|harathi|irumudi|kettu|kattu|poorvaang|poorvang|dharmasastha|dharma sastha|మాలాధారణ|పూర్వాంగ|శబరి|అయ్యప్ప|శాస్తా|శాస్త|శబరిమల|హరివరాసనం|శరణం|హారతి|ఇరుముడి|పడి|మణికంఠ|manikanta/.test(txt)) detectedDeity = 'ayyappa';
            else if (/morning|meal|night|bedtime|ప్రాతః|భోజన|రాత్రి|శయన/.test(txt)) detectedDeity = 'all';
            else detectedDeity = deityToFetch !== 'all' ? deityToFetch : 'ayyappa';
          }
          const itemDeity = detectedDeity.toLowerCase();
          let imageSource = DEITY_IMAGES[itemDeity] || DEITY_IMAGES.ayyappa;
          const rawImg = item.imageUrl || item.image || item.artwork;
          if (rawImg && typeof rawImg === 'string' && rawImg.trim()) {
            imageSource = { uri: resolveMediaUrl(rawImg) };
          }

          return {
            id: item.slug || String(item.id),
            rawId: String(item.id),
            title: item.title,
            desc: item.description || item.desc || '',
            deityId: itemDeity,
            image: imageSource,
          };
        });
        setDynamicItems(mapped);
      } else {
        setDynamicItems([]);
      }
    } catch (e) {
      console.warn('Error fetching dynamic subcategories:', e);
      setDynamicItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [categoryId, currentLanguage, selectedFilter]);

  useEffect(() => {
    const activeD = initialDeity && initialDeity !== 'all' ? initialDeity : 'all';
    setSelectedFilter(activeD);
    fetchSubcategories(false, activeD);
  }, [initialDeity, categoryId]);

  const handleFilterChange = (filterId: string) => {
    setSelectedFilter(filterId);
    fetchSubcategories(false, filterId);
  };

  // Derive title dynamically based on categoryId and user's selected language
  const langKey = (currentLanguage || 'te').toLowerCase();
  const langMap = CATEGORY_TITLES_BY_LANG[langKey] || CATEGORY_TITLES_BY_LANG.en;
  const normCatId = (categoryId || '').toLowerCase();
  const displayTitle =
    langMap[normCatId] ||
    categoryTitle ||
    CATEGORY_TITLES_BY_LANG.en[normCatId] ||
    'Devotional Services';

  // Strictly database-driven via API: zero mock or fallback data
  const allCategoryItems = dynamicItems || [];

  // Items are fetched directly from MySQL DB via server-side deity query
  // Strict Category Isolation: Ensures Pooja Vidhanam, Divine Stotras, Daily Slokas, and Bhajans never mix
  const filteredItems = React.useMemo(() => {
    if (!allCategoryItems || allCategoryItems.length === 0) return [];

    const normCat = (categoryId || '').toLowerCase();

    // Helper: Strict Deity Isolation across all subcategories
    const matchesStrictDeity = (item: ListingItem, filter: string) => {
      if (!filter || filter === 'all') return true;
      const targetD = filter.toLowerCase().replace(/^(lord-|goddess-)/, '');
      const itemD = (item.deityId || '').toLowerCase().replace(/^(lord-|goddess-)/, '');
      const t = `${item.title || ''} ${item.id || ''}`.toLowerCase();

      const isGanesha =
        itemD === 'ganesha' ||
        /ganesh|vinayak|vignesh|vighnesh|ganapath|modak|గణపతి|వినాయక|విఘ్నేశ్వర|విఘ్నేశ|గణేశ|మోదక/.test(t);

      const isMurugan =
        itemD === 'murugan' ||
        /subrahmanya|subramanya|murugan|kartikeya|saravana|shanmukha|vel|skanda|kanda|sashti|kavasam|pazhani|palani|సుబ్రహ్మణ్య|మురుగన్|కార్తికేయ|షణ్ముఖ|స్కంద|షష్ఠి|కవచం|పళని/.test(t);

      const isVenkateswara =
        itemD === 'venkateswara' ||
        /venkates|vishnu|koodalmanikya|achyuta|govinda|narayana|perumal|satyanarayana|guruvayoor|ramanuja|వేంకట|వెంకట|విష్ణు|సత్యనారాయణ|గోవింద|నారాయణ|శ్రీనివాస|గురువాయూరప్ప|రామానుజ/.test(t);

      const isDevi =
        itemD === 'devi' ||
        /devi|durga|lakshmi|lalitha|kanakadhara|mahalakshmi|meenakshi|kamakshi|saraswathi|gomatha|kamadhenu|vasavi|akhiland|kanyaka|varalakshmi|దేవి|లక్ష్మి|దుర్గ|లలిత|సరస్వతి|గోమాత|కామధేను|వరలక్ష్మి|మాళికాపురత్తమ్మ|వాసవి|వాసవీ|అఖిలాండ|కన్యక/.test(t);

      const isHanuman =
        itemD === 'hanuman' ||
        /hanuman|anjaneya|maruti|bajrang|sundarakanda|హనుమాన్|ఆంజనేయ|మారుతి|రామదూత/.test(t);

      const isShiva =
        itemD === 'shiva' ||
        /shiva|linga|bilva|rudra|natara|mrityunjaya|kedar|vishwanath|shankara|renuka|someshwara|mallikarjuna|శివ|లింగ|బిల్వ|రుద్ర|మృత్యుంజయ|పరమశివ|కేదార|నటరాజ|విశ్వనాథ|శంకర/.test(t);

      const isAyyappa =
        itemD === 'ayyappa' ||
        /ayyap|sastha|harivarasanam|shabarimala|uthara|sannidhanam|padi|maaladharan|sharanu|harathi|irumudi|kettu|kattu|poorvaang|poorvang|dharmasastha|dharma sastha|మాలాధారణ|పూర్వాంగ|శబరి|అయ్యప్ప|శాస్తా|శాస్త|శబరిమల|హరివరాసనం|శరణం|హారతి|ఇరుముడి|పడి|మణికంఠ|manikanta/.test(t);

      if (targetD === 'ganesha') {
        return isGanesha;
      }
      if (targetD === 'murugan') {
        return isMurugan;
      }
      if (targetD === 'venkateswara' || targetD === 'vishnu') {
        return isVenkateswara;
      }
      if (targetD === 'devi') {
        return isDevi;
      }
      if (targetD === 'hanuman') {
        return isHanuman;
      }
      if (targetD === 'shiva') {
        return isShiva && !isGanesha && !isMurugan && !isAyyappa;
      }
      if (targetD === 'ayyappa') {
        // Strictly Ayyappa: MUST NOT match Ganesha, Shiva, Devi, Hanuman, or Murugan
        if (isGanesha || isMurugan || isDevi || isHanuman || (isShiva && !/poorvaang|పూర్వాంగ|sastha|శాస్త|ayyap|అయ్యప్ప/.test(t))) {
          return false;
        }
        return isAyyappa;
      }
      return itemD === targetD;
    };

    // 1. POOJA VIDHANAM: Show ONLY Poojas filtered strictly by selected deity
    if (normCat === 'pooja-vidhanam' || normCat === 'pooja' || normCat.includes('pooja') || normCat.includes('vrath')) {
      const poojaOnly = allCategoryItems.filter((item) => {
        const titleLower = (item.title || '').toLowerCase();
        const slugLower = (item.id || '').toLowerCase();
        const text = `${titleLower} ${slugLower}`;

        const isStotra =
          text.includes('stotram') ||
          text.includes('స్తోత్రం') ||
          text.includes('స్తోత్ర') ||
          text.includes('pancharatnam') ||
          text.includes('పంచరత్న') ||
          text.includes('ashtothram') ||
          text.includes('ashtottara') ||
          text.includes('అష్టోత్తర') ||
          text.includes('kavacham') ||
          text.includes('కవచం') ||
          text.includes('sahasranama') ||
          text.includes('సహస్రనామ');

        const isSloka =
          text.includes('sloka') ||
          text.includes('శ్లోక') ||
          text.includes('suprabhatam') ||
          text.includes('సుప్రభాత');

        const isSong =
          text.includes('bhajan') ||
          text.includes('భజన') ||
          text.includes('keerthana') ||
          text.includes('కీర్తన') ||
          text.includes('harathi') ||
          text.includes('హారతి') ||
          text.includes('song');

        if (isStotra || isSloka || isSong) {
          const isExplicitPooja =
            text.includes('pooja') ||
            text.includes('పూజ') ||
            text.includes('vidhanam') ||
            text.includes('విధానం') ||
            text.includes('vratham') ||
            text.includes('వ్రతం') ||
            text.includes('tarpanam') ||
            text.includes('తర్పణ') ||
            text.includes('abhishekam') ||
            text.includes('అభిషేక') ||
            text.includes('katha') ||
            text.includes('కథ');

          return isExplicitPooja && !text.includes('pancharatnam') && !text.includes('stotram') && !text.includes('స్తోత్రం') && !text.includes('స్తోత్ర');
        }

        return true;
      });

      if (selectedFilter && selectedFilter !== 'all') {
        return poojaOnly.filter((item) => matchesStrictDeity(item, selectedFilter));
      }
      return poojaOnly;
    }

    // 2. DIVINE STOTRAS: Show ONLY Stotras filtered strictly by selected deity
    if (normCat === 'stotras' || normCat === 'divine-stotras' || normCat.includes('stotra') || normCat === 'astothrams') {
      const stotrasOnly = allCategoryItems.filter((item) => {
        const titleLower = (item.title || '').toLowerCase();
        const slugLower = (item.id || '').toLowerCase();
        const text = `${titleLower} ${slugLower}`;

        const isPurePooja =
          (text.includes('pooja') || text.includes('పూజ') || text.includes('tarpanam') || text.includes('vratham')) &&
          !text.includes('stotra') &&
          !text.includes('స్తోత్ర') &&
          !text.includes('ashtottara') &&
          !text.includes('అష్టోత్తర') &&
          !text.includes('pancharatnam');

        const isSong = text.includes('bhajan') || text.includes('భజన') || text.includes('harathi') || text.includes('హారతి');

        return !isPurePooja && !isSong;
      });

      if (selectedFilter && selectedFilter !== 'all') {
        return stotrasOnly.filter((item) => matchesStrictDeity(item, selectedFilter));
      }
      return stotrasOnly;
    }

    // 3. DAILY SLOKAS: Show Slokas filtered strictly by selected deity (plus universal morning/meal/night slokas)
    if (normCat === 'slokas' || normCat === 'daily-slokas' || normCat.includes('sloka') || normCat === '115') {
      const slokasOnly = allCategoryItems.filter((item) => {
        const titleLower = (item.title || '').toLowerCase();
        const slugLower = (item.id || '').toLowerCase();
        const text = `${titleLower} ${slugLower}`;
        return !text.includes('pooja') && !text.includes('పూజ') && !text.includes('bhajan') && !text.includes('భజన');
      });

      if (selectedFilter && selectedFilter !== 'all') {
        return slokasOnly.filter((item) => {
          const t = `${item.title || ''} ${item.id || ''}`.toLowerCase();
          const isUniversal =
            t.includes('morning-prayers') ||
            t.includes('meal-prayers') ||
            t.includes('night-prayers') ||
            t.includes('ప్రాతః') ||
            t.includes('భోజన') ||
            t.includes('రాత్రి') ||
            t.includes('శయన');

          return isUniversal || matchesStrictDeity(item, selectedFilter);
        });
      }
      return slokasOnly;
    }

    // 4. BHAJANS & SONGS: Show ALL Songs & Bhajans filtered strictly by selected deity
    if (normCat === 'bhajans' || normCat === 'songs' || normCat === 'harathis' || normCat.includes('bhajan') || normCat.includes('song') || normCat === '116') {
      if (selectedFilter && selectedFilter !== 'all') {
        return allCategoryItems.filter((item) => matchesStrictDeity(item, selectedFilter));
      }
      return allCategoryItems;
    }

    if (selectedFilter && selectedFilter !== 'all') {
      return allCategoryItems.filter((item) => matchesStrictDeity(item, selectedFilter));
    }

    return allCategoryItems;
  }, [allCategoryItems, categoryId, selectedFilter]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#173D32" translucent />

      {/* =========================================================
          1. SACRED MAROON HEADER WITH BACK ARROW & CORNER FILIGREE
         ========================================================= */}
      <SafeAreaView style={styles.safeHeaderArea}>
        <LinearGradient
          colors={['#173D32', '#173D32', '#0C251E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerBar}
        >
          {/* Corner Filigree Ornaments */}
          <View style={styles.cornerTopLeft}>
            <HeaderCornerFiligree />
          </View>
          <View style={styles.cornerTopRight}>
            <HeaderCornerFiligree />
          </View>

          {/* Left: Back Button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBack}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Text style={styles.backArrowText}>←</Text>
          </TouchableOpacity>

          {/* Center Title: Pooja Vidhanam / Dynamic Title */}
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitleText} numberOfLines={1}>
              {displayTitle}
            </Text>
          </View>
        </LinearGradient>
      </SafeAreaView>

      {/* =========================================================
          2. HORIZONTAL DEITY FILTER ROW (All | Ayyappa | Shiva | Devi | Ganesha)
         ========================================================= */}
      <View style={styles.filterBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {filterTabs.map((tab) => {
            const isSelected = selectedFilter === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => handleFilterChange(tab.id)}
                activeOpacity={0.8}
                style={[
                  styles.filterTab,
                  isSelected ? styles.filterTabSelected : styles.filterTabUnselected,
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={tab.label}
              >
                {isSelected ? (
                  <LinearGradient
                    colors={['#173D32', '#173D32', '#0C251E']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.filterTabGradient}
                  >
                    <Text style={styles.filterTextSelected}>
                      {DEITY_TAB_LABELS[currentLanguage]?.[tab.id] || tab.label}
                    </Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.filterTextUnselected}>
                    {DEITY_TAB_LABELS[currentLanguage]?.[tab.id] || tab.label}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* =========================================================
          3. VERTICAL LIST OF POOJA / CATEGORY CARDS
         ========================================================= */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchSubcategories(true)}
            colors={['#173D32', '#DFA62E']}
            tintColor="#173D32"
          />
        }
      >
        {loading && !refreshing ? (
          <CategoryListingSkeleton count={6} />
        ) : filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items available for this deity.</Text>
            <TouchableOpacity
              style={styles.showAllBtn}
              onPress={() => handleFilterChange('all')}
            >
              <Text style={styles.showAllText}>Show All</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cardsContainer}>
            {filteredItems.map((item) => (
              <TouchableOpacity
                key={item.rawId || item.id}
                style={styles.poojaCard}
                activeOpacity={0.82}
                onPress={() => {
                  const isCategoryWithTypes =
                    item.id === 'sri-vigneshwara-ashtottara' ||
                    item.id === 'sri-maha-ganapathi-pooja' ||
                    item.id === 'sri-subramanya-ashtottara' ||
                    item.id === 'sri-subrahmanya' ||
                    item.id === 'sri-subrahmanyeshwara' ||
                    item.id === 'sri-ayyappa-ashtottara' ||
                    item.id === 'sri-dharma-sastha-pooja' ||
                    item.id === 'sri-dharma-sastha' ||
                    item.id === 'sri-ayyappa-sharanu-gosha' ||
                    item.id === 'ayyappa-harathi' ||
                    item.id === 'mangala-harathi' ||
                    item.id === 'ganapathi-bhajanalu' ||
                    item.rawId === '3' ||
                    item.rawId === '11' ||
                    item.rawId === '93' ||
                    item.rawId === '6' ||
                    item.rawId === '7' ||
                    item.rawId === '8' ||
                    item.rawId === '21' ||
                    item.rawId === '25' ||
                    item.rawId === '26' ||
                    item.rawId === '27' ||
                    item.rawId === '28' ||
                    item.rawId === '52' ||
                    item.rawId === '120' ||
                    item.rawId === '130' ||
                    item.rawId === '229' ||
                    item.id === 'ashtottaramulu' ||
                    item.id === 'kedareswara-vratham' ||
                    item.id === 'rudrabhishekam' ||
                    item.id === 'shiva-stotram-sub' ||
                    item.id === 'varalakshmi-vratham' ||
                    item.id === 'varalakshmi-vratha-kalpam' ||
                    item.id === 'sri-satyanarayana-swamy-vratham' ||
                    item.id === 'satyanarayana-vratham' ||
                    item.id === 'vinayaka-vratha-kalpam' ||
                    (item.title && item.title.includes('అష్టోత్తరములు')) ||
                    (item.title && item.title.includes('వరలక్ష్మి')) ||
                    (item.title && item.title.includes('సత్యనారాయణ')) ||
                    (item.title && item.title.includes('వినాయక వ్రత')) ||
                    (item.title && (
                      item.title.includes('మహాగణపతి') ||
                      item.title.toLowerCase().includes('mahaganapathi') ||
                      item.title.includes('సుబ్రహ్మణ్య') ||
                      item.title.toLowerCase().includes('subrahmanya') ||
                      item.title.toLowerCase().includes('subramanya') ||
                      item.title.includes('ధర్మ శాస్త') ||
                      item.title.includes('ధర్మశాస్త') ||
                      item.title.toLowerCase().includes('dharma sastha') ||
                      item.title.toLowerCase().includes('dharmasastha')
                    ));

                  if (isCategoryWithTypes) {
                    onSelectItem(item.id, item.title, item.rawId, true);
                    return;
                  }

                  const isPadiCard =
                    item.id === 'ayyappa-padi-pooja' ||
                    item.rawId === '117' ||
                    item.id === '117' ||
                    (item.id && String(item.id).toLowerCase().includes('padi')) ||
                    (item.title && (
                      item.title.includes('పడి') ||
                      item.title.toLowerCase().includes('padi') ||
                      item.title.includes('అయ్యప్ప పూజ')
                    ));
                  if (isPadiCard) {
                    onSelectItem('ayyappa-padi-pooja', item.title, item.rawId || '117');
                  } else {
                    onSelectItem(item.id, item.title, item.rawId);
                  }
                }}
                accessibilityRole="button"
                accessibilityLabel={item.title}
              >
                {/* Left: Square Devotional Artwork Thumbnail */}
                <View style={styles.imageThumbnailWrapper}>
                  <CardThumbnail
                    source={item.image}
                    deityId={item.deityId}
                  />
                  <View style={styles.imageThumbnailBorder} />
                </View>

                {/* Center: Title & Short Description */}
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.cardDescription} numberOfLines={2}>
                    {item.desc}
                  </Text>
                </View>

                {/* Right: Solid Maroon Play/Forward Triangle Icon */}
                <View style={styles.playIconContainer}>
                  <PlayTriangleIcon />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAF5EB',
  },
  safeHeaderArea: {
    backgroundColor: '#173D32',
    paddingTop: ANDROID_STATUS_BAR_HEIGHT,
  },
  headerBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    position: 'relative',
    borderBottomWidth: 1.2,
    borderBottomColor: '#DFA62E',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    transform: [{ scaleX: -1 }],
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  backArrowText: {
    color: '#FFF8EB',
    fontSize: 24,
    fontWeight: '700',
    marginTop: Platform.OS === 'ios' ? -2 : -4,
  },
  headerTitleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleText: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 21,
    fontWeight: '700',
    color: '#FFF8EB',
    letterSpacing: 0.5,
  },

  // Horizontal Deity Filter Bar
  filterBarContainer: {
    backgroundColor: '#FAF5EB',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(223, 166, 46, 0.25)',
  },
  filterScrollContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  filterTab: {
    borderRadius: 18,
    minHeight: 34,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  filterTabUnselected: {
    backgroundColor: '#FFFDF8',
    borderWidth: 1.2,
    borderColor: '#E6C898',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  filterTabSelected: {
    borderWidth: 1,
    borderColor: '#DFA62E',
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  filterTabGradient: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTextSelected: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  filterTextUnselected: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#173D32',
    letterSpacing: 0.2,
  },

  // Content Cards List
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 24,
  },
  cardsContainer: {
    width: '100%',
    gap: 10,
  },
  poojaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF8',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#E6C898',
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: '#071914',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  imageThumbnailWrapper: {
    width: 62,
    height: 62,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 12,
  },
  imageThumbnail: {
    width: '100%',
    height: '100%',
  },
  imageThumbnailBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(223, 166, 46, 0.45)',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 6,
  },
  cardTitle: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0C251E',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  cardDescription: {
    fontSize: 12,
    color: '#6B4B3D',
    lineHeight: 16,
    fontWeight: '500',
  },
  playIconContainer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },

  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#7D6A58',
    marginBottom: 12,
  },
  showAllBtn: {
    backgroundColor: '#173D32',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  showAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

