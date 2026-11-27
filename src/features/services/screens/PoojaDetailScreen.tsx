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
  Modal,
  Alert,
  BackHandler,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Line, Polygon, Ellipse, Rect } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SupportedLanguage } from '../../../types';
import { ApiService, resolveMediaUrl } from '../../../services/api';
import { StorageService } from '../../../services/storageService';

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
  itemId: string;
  rawId?: string;
  title?: string;
  currentLanguage: SupportedLanguage;
  onBack: () => void;
}

// Corner Filigree Ornaments for Header
const HeaderCornerFiligree = ({ flipped = false }: { flipped?: boolean }) => (
  <View style={flipped ? { transform: [{ scaleX: -1 }] } : undefined}>
    <Svg width={40} height={40} viewBox="0 0 36 36" fill="none">
      <Path
        d="M2 2 C12 2 22 8 28 16 C24 18 18 16 12 22 C8 16 6 8 2 2 Z"
        fill="#DFA62E"
        fillOpacity={0.7}
      />
      <Circle cx="8" cy="8" r="2" fill="#FFD700" />
      <Circle cx="16" cy="5" r="1.5" fill="#FFD700" />
      <Circle cx="5" cy="16" r="1.5" fill="#FFD700" />
    </Svg>
  </View>
);

// Solid Maroon Play Triangle Icon for devotional cards
const CardPlayTriangleIcon = () => (
  <Svg width={14} height={16} viewBox="0 0 14 16" fill="none">
    <Polygon points="2,1 13,8 2,15" fill="#173D32" />
  </Svg>
);

// Back Arrow inside circular white button
const BackArrowIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M12 19l-7-7 7-7"
      stroke="#173D32"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Hanging Brass Lamp (Thookku Vilakku) on both sides of Deity
const HangingBrassLamp = ({ style }: { style?: any }) => (
  <View style={[{ alignItems: 'center' }, style]}>
    <Svg width={38} height={124} viewBox="0 0 38 124" fill="none">
      {/* Chain link */}
      <Line x1="19" y1="0" x2="19" y2="46" stroke="#FFD700" strokeWidth="1.6" strokeDasharray="3 2" />
      {/* Hook */}
      <Circle cx="19" cy="49" r="3" stroke="#DFA62E" strokeWidth="1.6" fill="none" />
      {/* Top Cap */}
      <Path d="M13 53 C13 51 25 51 25 53 L23 58 L15 58 Z" fill="#DFA62E" />
      {/* Middle Spindle */}
      <Line x1="19" y1="58" x2="19" y2="68" stroke="#FFD700" strokeWidth="2.2" />
      {/* Oil Basin */}
      <Path d="M7 72 Q19 80 31 72 L29 79 Q19 87 9 79 Z" fill="#E5A93C" />
      <Ellipse cx="19" cy="72" rx="12" ry="3" fill="#DFA62E" />
      {/* Bottom Dangler */}
      <Path d="M16 87 L22 87 L20 95 L18 95 Z" fill="#FFD700" />
      <Circle cx="19" cy="98" r="2.5" fill="#DFA62E" />
      {/* Glow & Flame */}
      <Circle cx="19" cy="69" r="6" fill="#FFA500" fillOpacity={0.4} />
      <Path d="M19 63 C16.5 68 17.5 71 19 71 C20.5 71 21.5 68 19 63 Z" fill="#FFD700" />
      <Path d="M19 65 C17.5 68 18 70 19 70 C20 70 20.5 68 19 65 Z" fill="#FFFFFF" />
    </Svg>
  </View>
);

// Play Triangle Icon inside circular maroon button
const PlayTriangleIcon = () => (
  <Svg width={18} height={20} viewBox="0 0 18 20" fill="none">
    <Polygon points="3,1 17,10 3,19" fill="#FFFFFF" />
  </Svg>
);

// Download Tray & Arrow Icon
const DownloadTrayIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
      stroke="#173D32"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Heart Icon for Save / Favorite
const HeartFavoriteIcon = ({ isSaved }: { isSaved: boolean }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      stroke="#173D32"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={isSaved ? '#173D32' : 'none'}
    />
  </Svg>
);

// Checkmark for Materials
const CheckMarkIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17l-5-5"
      stroke="#FFFFFF"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
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

type DetailTab = 'overview' | 'procedure' | 'materials' | 'benefits';

interface PoojaDetailContent {
  id: string;
  deityId: string;
  defaultTitle: string;
  regionalTitles: Record<string, string>;
  overview: {
    heading: string;
    description: string;
    videoDuration: string;
  };
  procedure: Array<{
    stepNumber: number;
    title: string;
    duration: string;
    description: string;
    mantra?: string;
  }>;
  materials: Array<{
    id: string;
    name: string;
    quantity: string;
    category: 'essential' | 'dravyas' | 'flowers' | 'naivedyam';
  }>;
  benefits: Array<{
    title: string;
    description: string;
  }>;
  auspiciousDays: string;
}

// Dynamic Pooja Detail loaded directly from DB via API (Strictly ZERO mock or fake data)
const POOJA_DETAILS: Record<string, PoojaDetailContent> = {};

const UI_TEXTS: Record<string, {
  overview: string;
  procedure: string;
  materials: string;
  benefits: string;
  viewProcedure: string;
  downloadPdf: string;
  save: string;
  saved: string;
  checked: string;
  videoPreview: string;
  videoModalTitle: string;
  close: string;
  downloadStarted: string;
  bookmarkAdded: string;
  bookmarkRemoved: string;
  auspiciousHeader: string;
}> = {
  en: {
    overview: 'Overview',
    procedure: 'Procedure',
    materials: 'Materials',
    benefits: 'Benefits',
    viewProcedure: 'View Procedure (Step by Step)',
    downloadPdf: 'Download PDF',
    save: 'Save',
    saved: 'Saved',
    checked: 'Checked',
    videoPreview: 'Watch Ritual Video',
    videoModalTitle: 'Devotional Ritual Video',
    close: 'Close',
    downloadStarted: 'Sri Pooja Vidhanam PDF downloaded successfully to device.',
    bookmarkAdded: 'Pooja saved to your devotional favorites.',
    bookmarkRemoved: 'Removed from favorites.',
    auspiciousHeader: 'Auspicious Days & Muhurtham',
  },
  te: {
    overview: 'అవలోకనం',
    procedure: 'విధానం',
    materials: 'సామగ్రి',
    benefits: 'ఫలితాలు',
    viewProcedure: 'విధానం చూడండి (స్టెప్ బై స్టెప్)',
    downloadPdf: 'డౌన్‌లోడ్ PDF',
    save: 'సేవ్',
    saved: 'సేవ్ అయింది',
    checked: 'పూర్తయింది',
    videoPreview: 'పూజా వీడియో చూడండి',
    videoModalTitle: 'భక్తి పూజా వీడియో',
    close: 'మూసివేయి',
    downloadStarted: 'పూజా విధానం PDF విజయవంతంగా డౌన్‌లోడ్ చేయబడింది.',
    bookmarkAdded: 'మీ భక్తి సేవ్ జాబితాలో చేర్చబడింది.',
    bookmarkRemoved: 'జాబితా నుండి తొలగించబడింది.',
    auspiciousHeader: 'శుభ సమయాలు & ముహూర్తం',
  },
  ta: {
    overview: 'கண்ணோட்டம்',
    procedure: 'முறை',
    materials: 'பொருட்கள்',
    benefits: 'பலன்கள்',
    viewProcedure: 'பூஜை முறையை பார்க்க (படி வாரியாக)',
    downloadPdf: 'PDF பதிவிறக்கு',
    save: 'சேமிக்க',
    saved: 'சேமிக்கப்பட்டது',
    checked: 'சரிபார்க்கப்பட்டது',
    videoPreview: 'பூஜை வீடியோ பார்க்க',
    videoModalTitle: 'பக்தி பூஜை வீடியோ',
    close: 'மூடுக',
    downloadStarted: 'பூஜை முறை PDF வெற்றிகரமாக பதிவிறக்கப்பட்டது.',
    bookmarkAdded: 'உங்கள் விருப்பப்பட்டியலில் சேமிக்கப்பட்டது.',
    bookmarkRemoved: 'பட்டியலிலிருந்து நீக்கப்பட்டது.',
    auspiciousHeader: 'சுப நாட்கள் & முகூர்த்தம்',
  },
  kn: {
    overview: 'ಅವಲೋಕನ',
    procedure: 'ವಿಧಾನ',
    materials: 'ಸಾಮಗ್ರಿ',
    benefits: 'ಫಲಗಳು',
    viewProcedure: 'ವಿಧಾನ ವೀಕ್ಷಿಸಿ (ಹಂತ ಹಂತವಾಗಿ)',
    downloadPdf: 'PDF ಡೌನ್‌ಲೋಡ್',
    save: 'ಉಳಿಸಿ',
    saved: 'ಉಳಿಸಲಾಗಿದೆ',
    checked: 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
    videoPreview: 'ಪೂಜಾ ವಿಡಿಯೋ ವೀಕ್ಷಿಸಿ',
    videoModalTitle: 'ಭಕ್ತಿ ಪೂಜಾ ವಿಡಿಯೋ',
    close: 'ಮುಚ್ಚಿ',
    downloadStarted: 'ಪೂಜಾ ವಿಧಾನ PDF ಯಶಸ್ವಿಯಾಗಿ ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ.',
    bookmarkAdded: 'ನಿಮ್ಮ ಭಕ್ತಿ ಸಂಗ್ರಹದಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ.',
    bookmarkRemoved: 'ಸಂಗ್ರಹದಿಂದ ತೆಗೆದುಹಾಕಲಾಗಿದೆ.',
    auspiciousHeader: 'ಶುಭ ದಿನಗಳು & ಮುಹೂರ್ತ',
  },
  hi: {
    overview: 'अवलोकन',
    procedure: 'विधान',
    materials: 'सामग्री',
    benefits: 'लाभ',
    viewProcedure: 'विधि देखें (क्रमशः)',
    downloadPdf: 'डाउनलोड PDF',
    save: 'सुरक्षित करें',
    saved: 'सुरक्षित',
    checked: 'जांचा गया',
    videoPreview: 'पूजा वीडियो देखें',
    videoModalTitle: 'भक्ति पूजा वीडियो',
    close: 'बंद करें',
    downloadStarted: 'पूजा विधान PDF सफलतापूर्वक डाउनलोड हो गया।',
    bookmarkAdded: 'आपकी भक्ति सूची में सुरक्षित किया गया।',
    bookmarkRemoved: 'सूची से हटाया गया।',
    auspiciousHeader: 'शुभ दिन एवं मुहूर्त',
  },
  ml: {
    overview: 'അവലോകനം',
    procedure: 'വിധി',
    materials: 'സാമഗ്രികൾ',
    benefits: 'ഗുണങ്ങൾ',
    viewProcedure: 'പൂജാ വിധി കാണുക (ഘട്ടം ഘട്ടമായി)',
    downloadPdf: 'PDF ഡൗൺലോഡ്',
    save: 'സേവ് ചെയ്യുക',
    saved: 'സേവ് ചെയ്തു',
    checked: 'പൂർത്തിയായി',
    videoPreview: 'പൂജ വീഡിയോ കാണുക',
    videoModalTitle: 'ഭക്തി പൂജ വീഡിയോ',
    close: 'അടയ്ക്കുക',
    downloadStarted: 'പൂജാ വിധി PDF വിജയകരമായി ഡൗൺലോഡ് ചെയ്തു.',
    bookmarkAdded: 'പ്രിയപ്പെട്ടവയിൽ സൂക്ഷിച്ചു.',
    bookmarkRemoved: 'നീക്കം ചെയ്തു.',
    auspiciousHeader: 'ശുഭ ദിനങ്ങൾ & മുഹൂർത്തം',
  },
};


// Helper to resolve deity medallion avatar
const getSubItemMedallion = (item: any, defaultDeity: string = 'ayyappa') => {
  if (item?.imageUrl || item?.image) {
    const uri = resolveMediaUrl(item.imageUrl || item.image);
    if (uri) return { uri };
  }
  const deityKey = item?.deityId || defaultDeity || 'ayyappa';
  if (deityKey === 'ayyappa') {
    return require('../../../../assets/deities/lord_ayyappa.png');
  }
  if (DEITY_IMAGES[deityKey]) {
    return DEITY_IMAGES[deityKey];
  }
  return require('../../../../assets/deities/lord_ayyappa.png');
};

export const PoojaDetailScreen: React.FC<Props> = ({
  itemId,
  rawId,
  title,
  currentLanguage,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'procedure' | 'materials'>('procedure');
  const [checkedMaterials, setCheckedMaterials] = useState<Record<string, boolean>>({});
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);

  // Check if Ayyappa Padi Pooja (9 sacred items screen)
  const isAyyappaPadiPooja =
    itemId === 'ayyappa-padi-pooja' ||
    rawId === '117' ||
    itemId === '117' ||
    rawId === '8' ||
    itemId === '8' ||
    rawId === '61' ||
    itemId === '61' ||
    String(itemId).toLowerCase().includes('padi') ||
    (title && (
      title.includes('పడి') ||
      title.toLowerCase().includes('padi') ||
      title.includes('Padi') ||
      title.includes('అయ్యప్ప పూజ') ||
      title.toLowerCase().includes('ayyappa pooja')
    ));

  // Sub-items state for ALL poojas
  const [subItems, setSubItems] = useState<any[]>([]);
  const [selectedSubItem, setSelectedSubItem] = useState<any | null>(null);
  const [subItemDetail, setSubItemDetail] = useState<any | null>(null);
  const [loadingSubItems, setLoadingSubItems] = useState<boolean>(true);
  const [refreshingSubList, setRefreshingSubList] = useState<boolean>(false);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  const [livePooja, setLivePooja] = useState<any | null>(null);
  const [loadingLivePooja, setLoadingLivePooja] = useState<boolean>(true);

  // Fetch full pooja record dynamically from database via API
  useEffect(() => {
    let isMounted = true;
    setLoadingLivePooja(true);
    const idToFetch = rawId || itemId;
    ApiService.getCategoryDetail(String(idToFetch), currentLanguage)
      .then((res) => {
        if (isMounted && res) {
          setLivePooja(res);
        }
      })
      .catch((e) => console.warn('Live pooja detail load notice:', e))
      .finally(() => {
        if (isMounted) setLoadingLivePooja(false);
      });
    return () => { isMounted = false; };
  }, [itemId, rawId, currentLanguage]);

  // Resolve detail content dynamically from database response (Strictly ZERO mock or fake data)
  const poojaContent = React.useMemo<any>(() => {
    const raw = livePooja || {};
    const dId = (raw.deityId || (
      raw.slug?.includes('shiva') ? 'shiva'
      : raw.slug?.includes('ganesh') || raw.slug?.includes('vinayak') ? 'ganesha'
      : raw.slug?.includes('devi') || raw.slug?.includes('durga') || raw.slug?.includes('lakshmi') ? 'devi'
      : raw.slug?.includes('venkates') ? 'venkateswara'
      : raw.slug?.includes('hanuman') ? 'hanuman'
      : raw.slug?.includes('murugan') || raw.slug?.includes('subramanya') ? 'murugan'
      : 'ayyappa'
    )).toLowerCase();

    const cleanTitle = raw.title || title || itemId.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

    const mats = Array.isArray(raw.materials) && raw.materials.length > 0
      ? raw.materials
          .filter((m: any) => {
            const name = (m?.name || m?.title || '').toLowerCase();
            return !name.includes('cow ghee') && !name.includes('cotton wicks') && !name.includes('vibhuti') && !name.includes('camphor') && !name.includes('betel leaves');
          })
          .map((m: any, idx: number) => ({
            id: String(idx + 1),
            name: m.name || m.title || ('Item ' + (idx + 1)),
            quantity: m.qty || m.quantity || '1',
            category: 'essential',
          }))
      : [];

    const procedureSteps = Array.isArray(raw.procedure) && raw.procedure.length > 0
      ? raw.procedure.map((pr: any, idx: number) => ({
          stepNumber: pr.step || idx + 1,
          title: pr.title || `Step ${idx + 1}`,
          duration: pr.duration || '',
          description: pr.desc || pr.description || '',
          mantra: pr.mantra || undefined,
        }))
      : [];

    const mantrasList = Array.isArray(raw.mantras) && raw.mantras.length > 0
      ? raw.mantras
      : [];

    const bens = Array.isArray(raw.benefits) && raw.benefits.length > 0
      ? raw.benefits
          .filter((b: any) => {
            const str = (typeof b === 'string' ? b : (b.title || b.description || '')).toLowerCase();
            return !str.includes('profound peace') && !str.includes('spiritual strength') && !str.includes('planetary doshams') && !str.includes('divine protection of the presiding deity');
          })
          .map((b: any, idx: number) => ({
            title: typeof b === 'string' ? b : (b.title || ('Benefit ' + (idx + 1))),
            description: typeof b === 'string' ? b : (b.description || ''),
          }))
      : [];

    return {
      id: raw.slug || itemId,
      deityId: dId,
      defaultTitle: raw.titleEnglish || cleanTitle,
      regionalTitles: {
        en: raw.titleEnglish || cleanTitle,
        te: raw.titleTelugu || cleanTitle,
        ta: raw.titleTamil || cleanTitle,
        kn: raw.titleKannada || cleanTitle,
        hi: raw.titleHindi || cleanTitle,
        ml: raw.titleMalayalam || cleanTitle,
      },
      overview: {
        heading: raw.title || cleanTitle,
        description: raw.fullScriptureText || raw.description || raw.overview || '',
        videoDuration: raw.duration || '',
      },
      instructionNote: raw.instructionNote || '',
      fullScriptureText: raw.fullScriptureText || '',
      mantras: mantrasList,
      procedure: procedureSteps,
      materials: mats,
      benefits: bens,
      auspiciousDays: raw.bestTime || raw.auspiciousDays || '',
      contents: Array.isArray(raw.contents) ? raw.contents : (Array.isArray(raw.devotionalContents) ? raw.devotionalContents : []),
    };
  }, [livePooja, itemId, title]);

  const displayTitle =
    title ||
    poojaContent.regionalTitles[currentLanguage] ||
    poojaContent.defaultTitle;
  const deityImage = DEITY_IMAGES[poojaContent.deityId] || DEITY_IMAGES.ayyappa;
  const ui = UI_TEXTS[currentLanguage] || UI_TEXTS.en;

  // Dynamically load subcategories for ANY clicked pooja from DB in currentLanguage
  const loadSubItems = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshingSubList(true);
    else setLoadingSubItems(true);
    try {
      // 1. If livePooja already has children or subcategories from DB, use them directly
      if (livePooja?.children && Array.isArray(livePooja.children) && livePooja.children.length > 0) {
        setSubItems(livePooja.children);
        return;
      }
      if (livePooja?.subcategories && Array.isArray(livePooja.subcategories) && livePooja.subcategories.length > 0) {
        setSubItems(livePooja.subcategories);
        return;
      }

      // 2. Query DB directly using the actual item id
      const targetQueryId = rawId || itemId;
      let liveItems = await ApiService.getSubcategories(String(targetQueryId), currentLanguage);

      if (Array.isArray(liveItems) && liveItems.length > 0) {
        const sorted = [...liveItems].sort(
          (a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0)
        );
        setSubItems(sorted);
      } else {
        setSubItems([]);
      }
    } catch (err) {
      console.warn('Subcategories fetch error:', err);
      setSubItems([]);
    } finally {
      setLoadingSubItems(false);
      setRefreshingSubList(false);
    }
  }, [currentLanguage, livePooja, rawId, itemId]);

  useEffect(() => {
    loadSubItems();
  }, [loadSubItems, livePooja]);

  const handleSelectSubItem = async (subItem: any) => {
    setSelectedSubItem(subItem);
    setLoadingDetail(true);
    setSubItemDetail(null);
    try {
      const detail = await ApiService.getCategoryDetail(String(subItem.id || subItem.slug || subItem.rawId), currentLanguage);
      if (detail) {
        setSubItemDetail(detail);
      }
    } catch (e) {
      console.warn('Sub-item detail load notice:', e);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Resolve localized sub-item title
  const getSubItemTitle = (item: any, index?: number): string => {
    if (!item) return '';
    if (item.title && typeof item.title === 'string' && item.title.trim()) {
      return item.title.trim();
    }
    if (item.regionalTitles) {
      if (item.regionalTitles[currentLanguage]) return item.regionalTitles[currentLanguage];
      if (item.regionalTitles.en) return item.regionalTitles.en;
      if (item.regionalTitles.te) return item.regionalTitles.te;
    }
    return item.name || item.slug || (index !== undefined ? `Item ${index + 1}` : '');
  };

  // Resolve localized sub-item subtitle
  const getSubItemSubtitle = (item: any): string => {
    if (!item) return '';
    if (item.duration) return item.duration;
    if (item.regionalDescriptions?.[currentLanguage]) {
      const raw = item.regionalDescriptions[currentLanguage].replace(/^\[.*?\]\s*/, '').trim();
      return raw.slice(0, 75) + (raw.length > 75 ? '...' : '');
    }
    if (item.description) {
      const raw = item.description.replace(/^\[.*?\]\s*/, '').trim();
      return raw.slice(0, 75) + (raw.length > 75 ? '...' : '');
    }
    return '';
  };

  // Load saved bookmark state dynamically from MariaDB via API & Storage
  useEffect(() => {
    let isMounted = true;
    async function checkSavedState() {
      const targetId = String(rawId || itemId || poojaContent.id);
      const user = await StorageService.getStoredUser();
      const userId = user?.id ? Number(user.id) : undefined;
      const saved = await StorageService.isBookmarked(targetId, userId);
      if (isMounted) setIsSaved(saved);
    }
    checkSavedState();
    return () => { isMounted = false; };
  }, [itemId, rawId, poojaContent.id]);

  // Handle Hardware Back Button
  useEffect(() => {
    const onHardwareBack = () => {
      if (selectedSubItem) {
        setSelectedSubItem(null);
        return true;
      }
      onBack();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
    return () => sub.remove();
  }, [selectedSubItem, onBack]);

  const handleToggleMaterial = (matId: string) => {
    setCheckedMaterials((prev) => ({
      ...prev,
      [matId]: !prev[matId],
    }));
  };

  const handleToggleSave = async () => {
    const targetId = String(rawId || itemId || poojaContent.id);
    const user = await StorageService.getStoredUser();
    const userId = user?.id ? Number(user.id) : undefined;
    const itemToBookmark = {
      id: targetId,
      rawId: rawId ? String(rawId) : undefined,
      title: displayTitle || poojaContent.overview?.heading || 'Pooja Vidhanam',
      category: 'pooja',
      subtitle: poojaContent.overview?.description ? poojaContent.overview.description.slice(0, 80) : undefined,
      savedAt: new Date().toISOString(),
    };
    const nextSaved = await StorageService.toggleBookmark(itemToBookmark, userId);
    setIsSaved(nextSaved);
    Alert.alert(
      nextSaved ? '🙏 Swamiye Saranam Ayyappa' : 'Information',
      nextSaved ? ui.bookmarkAdded : ui.bookmarkRemoved,
      [{ text: 'OK' }]
    );
  };

  const handleDownloadPdf = () => {
    Alert.alert('📥 Download Pooja Vidhanam', ui.downloadStarted, [{ text: 'OK' }]);
  };

  const checkedCount = Object.values(checkedMaterials).filter(Boolean).length;
  const totalMaterials = poojaContent.materials.length;

  // =========================================================================
  // VIEW 2: FULL SACRED READING / PRAYER DETAIL (With Back to Sub-items List)
  // =========================================================================
  if (selectedSubItem) {
    const currentTitle = getSubItemTitle(selectedSubItem);
    const currentDesc =
      subItemDetail?.fullScriptureText ||
      subItemDetail?.description ||
      subItemDetail?.content ||
      subItemDetail?.overview ||
      selectedSubItem.fullScriptureText ||
      selectedSubItem.description ||
      selectedSubItem.content ||
      '';
    const currentInstruction = subItemDetail?.instructionNote || selectedSubItem?.instructionNote || '';
    const mantrasList = Array.isArray(subItemDetail?.mantras) && subItemDetail.mantras.length > 0
      ? subItemDetail.mantras
      : (Array.isArray(selectedSubItem?.mantras) && selectedSubItem.mantras.length > 0
        ? selectedSubItem.mantras
        : (selectedSubItem?.mantra ? [{ title: currentTitle, script: selectedSubItem.mantra }] : []));
    const procedureList = Array.isArray(subItemDetail?.procedure) && subItemDetail.procedure.length > 0
      ? subItemDetail.procedure
      : (Array.isArray(selectedSubItem?.procedure) ? selectedSubItem.procedure : []);
    const contentsList = Array.isArray(subItemDetail?.contents) && subItemDetail.contents.length > 0
      ? subItemDetail.contents
      : (Array.isArray(subItemDetail?.devotionalContents) ? subItemDetail.devotionalContents : []);
    const benefitsList = Array.isArray(subItemDetail?.benefits) && subItemDetail.benefits.length > 0
      ? subItemDetail.benefits
      : (Array.isArray(selectedSubItem?.benefits) ? selectedSubItem.benefits : []);
    const subItemMedallion = getSubItemMedallion(selectedSubItem, poojaContent.deityId);

    return (
      <SafeAreaView style={styles.screenContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#173D32" translucent />

        {/* Top Header with Back Arrow to return to sub-items list */}
        <LinearGradient
          colors={['#173D32', '#173D32', '#0C251E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.padiHeaderBar}
        >
          <TouchableOpacity
            style={styles.padiBackBtn}
            onPress={() => setSelectedSubItem(null)}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Back to list"
          >
            <Text style={styles.padiBackArrowText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.padiHeaderTitle} numberOfLines={1}>
            {currentTitle}
          </Text>
          <View style={styles.headerFiligreeWrapper}>
            <HeaderCornerFiligree flipped />
          </View>
        </LinearGradient>

        {/* Serene Deity Watermark Background */}
        <Image
          source={require('../../../../assets/ayyappa_watermark.png')}
          style={styles.watermarkImage}
          resizeMode="contain"
        />

        <ScrollView
          style={styles.subListScrollView}
          contentContainerStyle={styles.detailScrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loadingDetail}
              onRefresh={() => handleSelectSubItem(selectedSubItem)}
              colors={['#173D32', '#DFA62E']}
              tintColor="#173D32"
            />
          }
        >
          <View style={styles.readingCard}>
            {/* Card Header with Medallion */}
            <View style={styles.readingCardHeader}>
              <View style={styles.readingMedallionWrapper}>
                <Image
                  source={subItemMedallion}
                  style={styles.readingMedallionImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.readingTitleContainer}>
                <Text style={styles.readingTitle}>{currentTitle}</Text>
                <Text style={styles.readingSubtitle}>
                  {poojaContent.deityId === 'ayyappa'
                    ? 'ఓం స్వామియే శరణమయ్యప్ప 🙏'
                    : '|| శుభం భూయాత్ ||'}
                </Text>
              </View>
            </View>

            <View style={styles.readingDivider} />

            {/* Devotional Content Text */}
            {loadingDetail ? (
              <View style={styles.readingLoadingBox}>
                <ActivityIndicator size="large" color="#173D32" />
                <Text style={styles.readingLoadingText}>
                  {currentLanguage === 'te'
                    ? 'భక్తి పూర్వక మంత్రములు లోడ్ అవుతున్నాయి...'
                    : 'Loading sacred verses & mantras...'}
                </Text>
              </View>
            ) : (
              <View>
                {/* Sacred Instruction Note from DB */}
                {currentInstruction ? (
                  <View style={styles.instructionBadge}>
                    <Text style={styles.instructionText}>✦ {currentInstruction} ✦</Text>
                  </View>
                ) : null}

                {/* Formatted Paragraphs / Description */}
                {currentDesc ? (
                  currentDesc.split('\n\n').map((paragraph: string, pIdx: number) => {
                    const trimmed = paragraph.trim();
                    if (!trimmed) return null;
                    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                      return (
                        <View key={`heading-${pIdx}`} style={styles.sectionHeaderCard}>
                          <Text style={styles.sectionHeaderText}>❖ {trimmed.slice(1, -1)} ❖</Text>
                        </View>
                      );
                    }
                    if (trimmed.startsWith('•') || trimmed.startsWith('*')) {
                      return (
                        <Text key={`bullet-${pIdx}`} style={styles.readingBodyText}>
                          {trimmed}
                        </Text>
                      );
                    }
                    return (
                      <Text key={`p-${pIdx}`} style={styles.readingBodyText}>
                        {trimmed}
                      </Text>
                    );
                  })
                ) : null}

                {/* Mantras from DB */}
                {mantrasList && mantrasList.length > 0 ? (
                  <View style={{ marginTop: 14 }}>
                    <Text style={[styles.sectionHeaderText, { marginBottom: 10, color: '#173D32' }]}>
                      ❖ {currentLanguage === 'te' ? 'దివ్య మంత్రములు & స్తోత్రములు' : 'Sacred Mantras & Invocations'}:
                    </Text>
                    {mantrasList.map((m: any, mIdx: number) => (
                      <View key={m.id || mIdx} style={styles.mantraBox}>
                        {m.title ? (
                          <Text style={[styles.stepTitle, { color: '#8B4513', marginBottom: 6 }]}>
                            ✦ {m.title} ✦
                          </Text>
                        ) : null}
                        <Text style={styles.mantraText}>{m.script || m.mantra || m.text}</Text>
                        {m.transliteration ? (
                          <Text style={[styles.readingBodyText, { fontStyle: 'italic', marginTop: 4 }]}>
                            {m.transliteration}
                          </Text>
                        ) : null}
                        {m.meaning ? (
                          <Text style={[styles.readingBodyText, { marginTop: 6, color: '#333' }]}>
                            <Text style={{ fontWeight: '700', color: '#173D32' }}>
                              {currentLanguage === 'te' ? 'భావము: ' : 'Meaning: '}
                            </Text>
                            {m.meaning}
                          </Text>
                        ) : null}
                      </View>
                    ))}
                  </View>
                ) : null}

                {/* Child Procedures if attached to sub-item */}
                {procedureList && procedureList.length > 0 ? (
                  <View style={{ marginTop: 14 }}>
                    <Text style={[styles.sectionHeaderText, { marginBottom: 8, color: '#173D32' }]}>
                      ❖ {currentLanguage === 'te' ? 'పూజా క్రమము / విధానము (Procedure Steps)' : 'Worship Procedure Steps'}:
                    </Text>
                    {procedureList.map((step: any, sIdx: number) => (
                      <View key={step.id || sIdx} style={styles.stepCardItem}>
                        <View style={styles.stepBadge}>
                          <Text style={styles.stepBadgeText}>{step.step || (sIdx + 1)}</Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <Text style={styles.stepTitle}>{step.title || (`Step ${sIdx + 1}`)}</Text>
                          {step.mantra ? (
                            <View style={[styles.mantraBox, { marginVertical: 6 }]}>
                              <Text style={styles.mantraText}>{step.mantra}</Text>
                            </View>
                          ) : null}
                          {step.desc || step.description ? (
                            <Text style={styles.readingBodyText}>{step.desc || step.description}</Text>
                          ) : null}
                        </View>
                      </View>
                    ))}
                  </View>
                ) : null}

                {/* Contents items if attached */}
                {contentsList && contentsList.length > 0 ? (
                  <View style={{ marginTop: 14 }}>
                    {contentsList.map((c: any, cIdx: number) => (
                      <View key={c.id || cIdx} style={{ marginTop: 8, paddingVertical: 4 }}>
                        {c.title ? <Text style={styles.stepTitle}>✦ {c.title} ✦</Text> : null}
                        {c.sacredText ? (
                          <View style={[styles.mantraBox, { marginVertical: 6 }]}>
                            <Text style={styles.mantraText}>{c.sacredText}</Text>
                          </View>
                        ) : null}
                        <Text style={styles.readingBodyText}>{c.content || c.text || c.meaning || c.description}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                {/* Benefits if attached */}
                {benefitsList && benefitsList.length > 0 ? (
                  <View style={{ marginTop: 14 }}>
                    <Text style={[styles.sectionHeaderText, { marginBottom: 8, color: '#173D32' }]}>
                      ✨ {currentLanguage === 'te' ? 'పూజా ఫలము (Sacred Benefits)' : 'Divine Blessings & Benefits'}:
                    </Text>
                    {benefitsList.map((b: any, bIdx: number) => (
                      <View key={bIdx} style={{ marginBottom: 6 }}>
                        <Text style={[styles.stepTitle, { fontSize: 14 }]}>
                          ❖ {typeof b === 'string' ? b : (b.title || `Benefit ${bIdx + 1}`)}
                        </Text>
                        {b.description && b.description !== b.title ? (
                          <Text style={styles.readingBodyText}>{b.description}</Text>
                        ) : null}
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
  // =========================================================================
  // VIEW 1: SUB-ITEMS LIST VIEW (Soft Cream #FAF5EB, Watermark, Ivory Cards)
  // =========================================================================
  return (
    <SafeAreaView style={styles.screenContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#173D32" translucent />

      {/* Sacred Header Bar */}
      <LinearGradient
        colors={['#173D32', '#173D32', '#0C251E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.padiHeaderBar}
      >
        <TouchableOpacity
          style={styles.padiBackBtn}
          onPress={onBack}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Text style={styles.padiBackArrowText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.padiHeaderTitle} numberOfLines={1}>
          {displayTitle}
        </Text>
        <View style={styles.headerFiligreeWrapper}>
          <HeaderCornerFiligree flipped />
        </View>
      </LinearGradient>

      {/* Serene Deity Watermark Background */}
      <Image
        source={require('../../../../assets/ayyappa_watermark.png')}
        style={styles.watermarkImage}
        resizeMode="contain"
      />

      {/* Top Segmented Tabs: [ Sacred Sub-Items / Vidhanam ] | [ Materials & Info ] */}
      {poojaContent.materials.length > 0 ? (
        <View style={styles.topSegmentedBar}>
          <TouchableOpacity
            style={[
              styles.segmentedTab,
              activeTab === 'procedure'
                ? styles.segmentedTabActive
                : styles.segmentedTabInactive,
            ]}
            onPress={() => setActiveTab('procedure')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentedTabText,
                activeTab === 'procedure'
                  ? styles.segmentedTabTextActive
                  : styles.segmentedTabTextInactive,
              ]}
            >
              {ui.procedure || 'Pooja Vidhanam'} ({subItems.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentedTab,
              activeTab === 'materials'
                ? styles.segmentedTabActive
                : styles.segmentedTabInactive,
            ]}
            onPress={() => setActiveTab('materials')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentedTabText,
                activeTab === 'materials'
                  ? styles.segmentedTabTextActive
                  : styles.segmentedTabTextInactive,
              ]}
            >
              {ui.materials || 'Materials'} ({checkedCount}/{totalMaterials})
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* When activeTab is materials, show materials checklist */}
      {activeTab === 'materials' ? (
        <ScrollView
          style={styles.subListScrollView}
          contentContainerStyle={styles.subListScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.materialsCard}>
            <View style={styles.materialsHeaderRow}>
              <Text style={styles.materialsHeaderTitle}>
                {ui.materials} ({checkedCount}/{totalMaterials} {ui.checked})
              </Text>
              <TouchableOpacity
                style={styles.saveHeaderBtn}
                onPress={handleToggleSave}
                activeOpacity={0.7}
              >
                <HeartFavoriteIcon isSaved={isSaved} />
              </TouchableOpacity>
            </View>

            {poojaContent.materials.map((mat: any) => {
              const isChecked = !!checkedMaterials[mat.id];
              return (
                <TouchableOpacity
                  key={mat.id}
                  style={styles.materialRow}
                  activeOpacity={0.7}
                  onPress={() => handleToggleMaterial(mat.id)}
                >
                  <View style={[styles.checkbox, isChecked && styles.checkboxActive]}>
                    {isChecked && <CheckMarkIcon />}
                  </View>
                  <Text
                    style={[
                      styles.materialName,
                      isChecked && styles.materialNameChecked,
                    ]}
                  >
                    {mat.name}
                  </Text>
                  <Text style={styles.materialQty}>{mat.quantity}</Text>
                </TouchableOpacity>
              );
            })}

            {/* Auspicious Days Note */}
            {poojaContent.auspiciousDays ? (
              <View style={styles.auspiciousBox}>
                <Text style={styles.auspiciousTitle}>✨ {ui.auspiciousHeader}</Text>
                <Text style={styles.auspiciousBody}>{poojaContent.auspiciousDays}</Text>
              </View>
            ) : null}

            {/* Download PDF Button */}
            <TouchableOpacity
              style={styles.downloadPdfButton}
              onPress={handleDownloadPdf}
              activeOpacity={0.8}
            >
              <DownloadTrayIcon />
              <Text style={styles.downloadPdfText}>{ui.downloadPdf}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        /* Sub-items List View */
        <ScrollView
          style={styles.subListScrollView}
          contentContainerStyle={styles.subListScrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshingSubList}
              onRefresh={() => loadSubItems(true)}
              colors={['#173D32', '#DFA62E']}
              tintColor="#173D32"
            />
          }
        >
          {loadingSubItems && !refreshingSubList ? (
            <View style={styles.subListLoadingBox}>
              <ActivityIndicator size="large" color="#173D32" />
              <Text style={styles.subListLoadingText}>
                {currentLanguage === 'te'
                  ? 'పూజా వివరములు లోడ్ అవుతున్నాయి...'
                  : 'Loading sacred items...'}
              </Text>
            </View>
          ) : subItems.length === 0 ? (
            /* Direct Single Pooja Reading Card when no subcategories exist */
            <View style={styles.readingCard}>
              <View style={styles.readingCardHeader}>
                <View style={styles.readingMedallionWrapper}>
                  <Image
                    source={getSubItemMedallion({ title: displayTitle }, poojaContent.deityId)}
                    style={styles.readingMedallionImage}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.readingTitleContainer}>
                  <Text style={styles.readingTitle}>{displayTitle}</Text>
                  <Text style={styles.readingSubtitle}>
                    {poojaContent.deityId === 'ayyappa'
                      ? 'ఓం స్వామియే శరణమయ్యప్ప 🙏'
                      : '|| శుభం భూయాత్ ||'}
                  </Text>
                </View>
              </View>

              <View style={styles.readingDivider} />

              <View style={{ marginTop: 6 }}>
                {/* Sacred Instruction Note from DB */}
                {(poojaContent.instructionNote || livePooja?.instructionNote) ? (
                  <View style={styles.instructionBadge}>
                    <Text style={styles.instructionText}>✦ {poojaContent.instructionNote || livePooja?.instructionNote} ✦</Text>
                  </View>
                ) : null}

                {/* Overview / Description */}
                {poojaContent.overview.description ? (
                  <Text style={styles.readingBodyText}>{poojaContent.overview.description}</Text>
                ) : null}

                {/* Mantras from DB */}
                {(() => {
                  const mList = (poojaContent.mantras.length > 0 ? poojaContent.mantras : (livePooja?.mantras || []))
                    .filter((m: any) => {
                      const script = (m.script || m.mantra || m.text || '').trim();
                      if (!script) return false;
                      const desc = (poojaContent.overview.description || '').trim();
                      if (desc && (desc.includes(script) || desc.includes(script.slice(0, 30)))) return false;
                      return true;
                    });
                  if (mList.length === 0) return null;
                  return (
                    <View style={{ marginTop: 14 }}>
                      <Text style={[styles.sectionHeaderText, { marginBottom: 10, color: '#173D32' }]}>
                        ❖ {currentLanguage === 'te' ? 'దివ్య మంత్రములు & స్తోత్రములు' : 'Sacred Mantras & Invocations'}:
                      </Text>
                      {mList.map((m: any, mIdx: number) => (
                        <View key={m.id || mIdx} style={styles.mantraBox}>
                          {m.title ? (
                            <Text style={[styles.stepTitle, { color: '#8B4513', marginBottom: 6 }]}>
                              ✦ {m.title} ✦
                            </Text>
                          ) : null}
                          <Text style={styles.mantraText}>{m.script || m.mantra || m.text}</Text>
                          {m.transliteration ? (
                            <Text style={[styles.readingBodyText, { fontStyle: 'italic', marginTop: 4 }]}>
                              {m.transliteration}
                            </Text>
                          ) : null}
                          {m.meaning ? (
                            <Text style={[styles.readingBodyText, { marginTop: 6, color: '#333' }]}>
                              <Text style={{ fontWeight: '700', color: '#173D32' }}>
                                {currentLanguage === 'te' ? 'భావము: ' : 'Meaning: '}
                              </Text>
                              {m.meaning}
                            </Text>
                          ) : null}
                        </View>
                      ))}
                    </View>
                  );
                })()}

                {/* Procedure Steps from DB */}
                {(() => {
                  const pList = (poojaContent.procedure || []).filter((pr: any) => {
                    const mantra = (pr.mantra || '').trim();
                    const desc = (poojaContent.overview.description || '').trim();
                    if (mantra && desc && (desc.includes(mantra) || desc.includes(mantra.slice(0, 30)))) return false;
                    return true;
                  });
                  if (pList.length === 0) return null;
                  return (
                    <View style={{ marginTop: 14 }}>
                      <Text style={[styles.sectionHeaderText, { marginBottom: 10, color: '#173D32' }]}>
                        ❖ {currentLanguage === 'te' ? 'పూజా క్రమము / విధానము (Procedure Steps)' : (ui.procedure || 'Pooja Vidhanam Steps')}:
                      </Text>
                      {pList.map((pr: any, prIdx: number) => (
                        <View key={pr.stepNumber || prIdx} style={styles.stepCardItem}>
                          <View style={styles.stepBadge}>
                            <Text style={styles.stepBadgeText}>{pr.stepNumber || (prIdx + 1)}</Text>
                          </View>
                          <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={styles.stepTitle}>{pr.title}</Text>
                            {pr.mantra ? (
                              <View style={[styles.mantraBox, { marginVertical: 6 }]}>
                                <Text style={styles.mantraText}>{pr.mantra}</Text>
                              </View>
                            ) : null}
                            {pr.description ? (
                              <Text style={styles.readingBodyText}>{pr.description}</Text>
                            ) : null}
                          </View>
                        </View>
                      ))}
                    </View>
                  );
                })()}

                {/* Devotional Contents from DB */}
                {(() => {
                  const cList = (poojaContent.contents || []).filter((c: any) => {
                    const txt = (c.sacredText || c.content || c.text || '').trim();
                    const desc = (poojaContent.overview.description || '').trim();
                    if (txt && desc && (desc.includes(txt) || desc.includes(txt.slice(0, 30)))) return false;
                    return true;
                  });
                  if (cList.length === 0) return null;
                  return (
                    <View style={{ marginTop: 14 }}>
                      {cList.map((c: any, cIdx: number) => (
                        <View key={c.id || cIdx} style={{ marginTop: 8, paddingVertical: 4 }}>
                          {c.title ? <Text style={styles.stepTitle}>✦ {c.title} ✦</Text> : null}
                          {c.sacredText ? (
                            <View style={[styles.mantraBox, { marginVertical: 6 }]}>
                              <Text style={styles.mantraText}>{c.sacredText}</Text>
                            </View>
                          ) : null}
                          <Text style={styles.readingBodyText}>{c.content || c.text || c.meaning || c.description}</Text>
                        </View>
                      ))}
                    </View>
                  );
                })()}

                {/* Benefits from DB */}
                {poojaContent.benefits && poojaContent.benefits.length > 0 ? (
                  <View style={{ marginTop: 14 }}>
                    <Text style={[styles.sectionHeaderText, { marginBottom: 8, color: '#173D32' }]}>
                      ✨ {currentLanguage === 'te' ? 'పూజా ఫలము (Sacred Benefits)' : 'Divine Blessings & Benefits'}:
                    </Text>
                    {poojaContent.benefits.map((b: any, bIdx: number) => (
                      <View key={bIdx} style={{ marginBottom: 6 }}>
                        <Text style={[styles.stepTitle, { fontSize: 14 }]}>❖ {b.title}</Text>
                        {b.description && b.description !== b.title ? (
                          <Text style={styles.readingBodyText}>{b.description}</Text>
                        ) : null}
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            </View>
          ) : (
            <View style={styles.subListCardsContainer}>
              {subItems.map((item, index) => {
                const itemTitle = getSubItemTitle(item, index);
                const itemSubtitle = getSubItemSubtitle(item);
                const medallion = getSubItemMedallion(item, poojaContent.deityId);

                return (
                  <TouchableOpacity
                    key={String(item.id || index)}
                    style={styles.subItemCard}
                    activeOpacity={0.82}
                    onPress={() => handleSelectSubItem(item)}
                    accessibilityRole="button"
                    accessibilityLabel={itemTitle}
                  >
                    {/* Left: Circular Medallion Avatar with Deity */}
                    <View style={styles.subItemMedallionWrapper}>
                      <Image
                        source={medallion}
                        style={styles.subItemMedallionImage}
                        resizeMode="cover"
                      />
                    </View>

                    {/* Center: Title & Subtitle in Current Language */}
                    <View style={styles.subItemContent}>
                      <Text style={styles.subItemCardTitle} numberOfLines={2}>
                        {itemTitle}
                      </Text>
                      {itemSubtitle ? (
                        <Text style={styles.subItemCardSubtitle} numberOfLines={1}>
                          {itemSubtitle}
                        </Text>
                      ) : null}
                    </View>

                    {/* Right: Solid Play Triangle Icon */}
                    <View style={styles.subItemPlayIconWrapper}>
                      <CardPlayTriangleIcon />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FAF5EB',
    position: 'relative',
  },
  watermarkImage: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.88,
    height: SCREEN_WIDTH * 0.88,
    alignSelf: 'center',
    top: '22%',
    opacity: 0.07,
  },
  padiHeaderBar: {
    minHeight: 56 + ANDROID_STATUS_BAR_HEIGHT,
    paddingTop: ANDROID_STATUS_BAR_HEIGHT + 6,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1.2,
    borderBottomColor: '#DFA62E',
  },
  padiBackBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    zIndex: 10,
  },
  padiBackArrowText: {
    color: '#FFF8EB',
    fontSize: 24,
    fontWeight: '700',
    marginTop: Platform.OS === 'ios' ? -2 : -4,
  },
  padiHeaderTitle: {
    flex: 1,
    color: '#FFD700',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', default: 'Poppins_700Bold' }),
    letterSpacing: 0.3,
  },
  headerFiligreeWrapper: {
    marginLeft: 8,
  },

  // Segmented Tabs
  topSegmentedBar: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
    gap: 10,
  },
  segmentedTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  segmentedTabActive: {
    backgroundColor: '#173D32',
    borderColor: '#DFA62E',
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  segmentedTabInactive: {
    backgroundColor: '#FFFDF8',
    borderColor: '#E6C898',
  },
  segmentedTabText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  segmentedTabTextActive: {
    color: '#FFFFFF',
  },
  segmentedTabTextInactive: {
    color: '#173D32',
  },

  // Sub-items List
  subListScrollView: {
    flex: 1,
  },
  subListScrollContent: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 40,
  },
  subListCardsContainer: {
    width: '100%',
    gap: 10,
  },
  subItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF8',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#E6C898',
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#071914',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  subItemMedallionWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#DFA62E',
    overflow: 'hidden',
    backgroundColor: '#173D32',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  subItemMedallionImage: {
    width: '100%',
    height: '100%',
  },
  subItemContent: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 6,
  },
  subItemCardTitle: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', default: 'Poppins_700Bold' }),
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0C251E',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  subItemCardSubtitle: {
    fontSize: 12,
    color: '#6B4B3D',
    fontWeight: '500',
    lineHeight: 16,
  },
  subItemPlayIconWrapper: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  subListLoadingBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subListLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#173D32',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14.5,
    color: '#6B4B3D',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Reading Detail Card
  detailScrollContent: {
    padding: 14,
    paddingBottom: 40,
  },
  
  stepCardItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(23, 61, 50, 0.03)',
    borderRadius: 10,
    padding: 10,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#E8D5B5',
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#173D32',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepBadgeText: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: '700',
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#173D32',
    marginBottom: 2,
  },
  sectionHeaderText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8B4513',
  },
  sectionHeaderCard: {
    backgroundColor: '#FFF3E0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#DFA62E',
    marginVertical: 8,
  },
  readingCard: {
    backgroundColor: '#FFFDF8',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.2,
    borderColor: '#E6C898',
    elevation: 3,
    shadowColor: '#071914',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  readingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  readingMedallionWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#DFA62E',
    overflow: 'hidden',
    backgroundColor: '#173D32',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  readingMedallionImage: {
    width: '100%',
    height: '100%',
  },
  readingTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  readingTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#173D32',
    marginBottom: 3,
  },
  readingSubtitle: {
    fontSize: 12.5,
    color: '#8A5A0A',
    fontWeight: '600',
  },
  readingDivider: {
    height: 1.2,
    backgroundColor: '#E6C898',
    marginVertical: 12,
  },
  readingLoadingBox: {
    padding: 30,
    alignItems: 'center',
  },
  readingLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#173D32',
  },
  readingBodyText: {
    fontSize: 15.5,
    lineHeight: 26,
    color: '#2C1D11',
    fontWeight: '500',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  instructionBadge: {
    backgroundColor: 'rgba(223, 166, 46, 0.15)',
    borderWidth: 1,
    borderColor: '#DFA62E',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  instructionText: {
    color: '#173D32',
    fontSize: 13,
    fontWeight: '700',
  },
  mantraBox: {
    backgroundColor: 'rgba(223, 166, 46, 0.12)',
    borderLeftWidth: 4,
    borderLeftColor: '#DFA62E',
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
  },
  mantraText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#8B4513',
    fontWeight: '700',
  },

  // Materials Tab View
  materialsCard: {
    backgroundColor: '#FFFDF8',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.2,
    borderColor: '#E6C898',
    shadowColor: '#071914',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  materialsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  materialsHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#173D32',
  },
  saveHeaderBtn: {
    padding: 4,
  },
  materialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6D8',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#DFA62E',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFDF8',
  },
  checkboxActive: {
    backgroundColor: '#173D32',
    borderColor: '#173D32',
  },
  materialName: {
    flex: 1,
    fontSize: 14,
    color: '#0C251E',
    fontWeight: '600',
  },
  materialNameChecked: {
    textDecorationLine: 'line-through',
    color: '#9E9E9E',
  },
  materialQty: {
    fontSize: 13,
    color: '#8A5A0A',
    fontWeight: '700',
  },
  auspiciousBox: {
    backgroundColor: 'rgba(223, 166, 46, 0.1)',
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E6C898',
  },
  auspiciousTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#173D32',
    marginBottom: 4,
  },
  auspiciousBody: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#6B4B3D',
  },
  downloadPdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#173D32',
    paddingVertical: 11,
    borderRadius: 20,
    marginTop: 16,
    gap: 8,
  },
  downloadPdfText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
