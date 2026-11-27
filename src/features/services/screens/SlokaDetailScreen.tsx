import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Alert,
  BackHandler,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Polygon, Line, Rect } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SupportedLanguage } from '../../../types';
import { ApiService, resolveMediaUrl } from '../../../services/api';
import { StorageService } from '../../../services/storageService';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
const { width: SCREEN_WIDTH_FULL, height: SCREEN_HEIGHT_FULL } = Dimensions.get('screen');
const SCREEN_WIDTH = Math.min(WINDOW_WIDTH, SCREEN_WIDTH_FULL);
const SCREEN_HEIGHT = Math.max(WINDOW_HEIGHT, SCREEN_HEIGHT_FULL);
const isLargeOrTallScreen = SCREEN_HEIGHT >= 800 || (SCREEN_HEIGHT / SCREEN_WIDTH) >= 1.95;

// Dynamic status bar height for Android
const ANDROID_STATUS_BAR_HEIGHT = Platform.OS === 'android'
  ? Math.max(StatusBar.currentHeight || 0, isLargeOrTallScreen ? 44 : 36)
  : 0;

interface Props {
  itemId: string;
  rawId?: string;
  title?: string;
  category?: string;
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

// Solid Maroon Play Triangle Icon for cards
const CardPlayTriangleIcon = () => (
  <Svg width={14} height={16} viewBox="0 0 14 16" fill="none">
    <Polygon points="2,1 13,8 2,15" fill="#173D32" />
  </Svg>
);

// Back Arrow
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

// Play / Pause Icons for optional audio bar
const PlayAudioIcon = () => (
  <Svg width={16} height={18} viewBox="0 0 16 18" fill="none">
    <Polygon points="2,1 15,9 2,17" fill="#FFD700" />
  </Svg>
);

const PauseAudioIcon = () => (
  <Svg width={16} height={18} viewBox="0 0 16 18" fill="none">
    <Rect x="2" y="1" width="4" height="16" rx="1" fill="#FFD700" />
    <Rect x="10" y="1" width="4" height="16" rx="1" fill="#FFD700" />
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

// Pre-bundled deity artworks
const DEITY_IMAGES: Record<string, any> = {
  ayyappa: require('../../../../assets/deities/ayyappa.jpg'),
  ganesha: require('../../../../assets/deities/ganesha.jpg'),
  venkateswara: require('../../../../assets/deities/venkateswara.jpg'),
  devi: require('../../../../assets/deities/durga.jpg'),
  durga: require('../../../../assets/deities/durga.jpg'),
  shiva: require('../../../../assets/deities/shiva.jpg'),
  hanuman: require('../../../../assets/deities/hanuman.jpg'),
  krishna: require('../../../../assets/deities/krishna.jpg'),
  rama: require('../../../../assets/deities/rama.jpg'),
  murugan: require('../../../../assets/deities/card_murugan.jpg'),
};

const UI_TEXTS: Record<SupportedLanguage, {
  verses: string;
  meaning: string;
  save: string;
  saved: string;
  downloadPdf: string;
  downloadStarted: string;
  bookmarkAdded: string;
  bookmarkRemoved: string;
  loadingText: string;
  benefits: string;
}> = {
  en: {
    verses: 'Sacred Verses & Mantras',
    meaning: 'Meaning',
    save: 'Save',
    saved: 'Saved',
    downloadPdf: 'Download PDF',
    downloadStarted: 'Sacred Scripture PDF downloaded successfully to device.',
    bookmarkAdded: 'Saved to your devotional favorites.',
    bookmarkRemoved: 'Removed from favorites.',
    loadingText: 'Loading sacred verses & prayers...',
    benefits: 'Divine Blessings & Phalasruti',
  },
  te: {
    verses: 'దివ్య శ్లోకములు & మంత్రములు',
    meaning: 'భావము',
    save: 'సేవ్',
    saved: 'సేవ్ అయింది',
    downloadPdf: 'డౌన్‌లోడ్ PDF',
    downloadStarted: 'భక్తి స్తోత్రము PDF విజయవంతంగా డౌన్‌లోడ్ చేయబడింది.',
    bookmarkAdded: 'మీ భక్తి సేవ్ జాబితాలో చేర్చబడింది.',
    bookmarkRemoved: 'జాబితా నుండి తొలగించబడింది.',
    loadingText: 'భక్తిపూర్వక వివరములు లోడ్ అవుతున్నాయి...',
    benefits: 'పారాయణ ఫలము & దివ్య ఆశీస్సులు',
  },
  ta: {
    verses: 'புனித ஸ்லோகங்கள் & மந்திரங்கள்',
    meaning: 'பொருள்',
    save: 'சேமிக்க',
    saved: 'சேமிக்கப்பட்டது',
    downloadPdf: 'PDF பதிவிறக்கு',
    downloadStarted: 'ஸ்லோகம் PDF வெற்றிகரமாக பதிவிறக்கப்பட்டது.',
    bookmarkAdded: 'உங்கள் விருப்பப்பட்டியலில் சேமிக்கப்பட்டது.',
    bookmarkRemoved: 'பட்டியலிலிருந்து நீக்கப்பட்டது.',
    loadingText: 'விவரங்கள் ஏற்றப்படுகின்றன...',
    benefits: 'புனித பலன்கள்',
  },
  kn: {
    verses: 'ಪವಿತ್ರ ಶ್ಲೋಕಗಳು & ಮಂತ್ರಗಳು',
    meaning: 'ಭಾವಾರ್ಥ',
    save: 'ಉಳಿಸಿ',
    saved: 'ಉಳಿಸಲಾಗಿದೆ',
    downloadPdf: 'PDF ಡೌನ್‌ಲೋಡ್',
    downloadStarted: 'ಶ್ಲೋಕ PDF ಯಶಸ್ವಿಯಾಗಿ ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ.',
    bookmarkAdded: 'ನಿಮ್ಮ ಭಕ್ತಿ ಸಂಗ್ರಹದಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ.',
    bookmarkRemoved: 'ಸಂಗ್ರಹದಿಂದ ತೆಗೆದುಹಾಕಲಾಗಿದೆ.',
    loadingText: 'ವಿವರಗಳು ಲೋಡ್ ಆಗುತ್ತಿವೆ...',
    benefits: 'ಪಾರಾಯಣ ಫಲ',
  },
  hi: {
    verses: 'पवित्र श्लोक एवं मंत्र',
    meaning: 'भावार्थ',
    save: 'सुरक्षित करें',
    saved: 'सुरक्षित',
    downloadPdf: 'डाउनलोड PDF',
    downloadStarted: 'श्लोक PDF सफलतापूर्वक डाउनलोड हो गया।',
    bookmarkAdded: 'आपकी भक्ति सूची में सुरक्षित किया गया।',
    bookmarkRemoved: 'सूची से हटाया गया।',
    loadingText: 'विवरण लोड हो रहा है...',
    benefits: 'पाठ फल एवं आशीर्वाद',
  },
};

// Helper to resolve deity medallion avatar
const getMedallion = (item: any, defaultDeity: string = 'ayyappa') => {
  if (item?.imageUrl || item?.image) {
    const uri = resolveMediaUrl(item.imageUrl || item.image);
    if (uri) return { uri };
  }
  const key = String(item?.deityId || defaultDeity || '').toLowerCase();
  if (DEITY_IMAGES[key]) return DEITY_IMAGES[key];

  const t = String(item?.title || item?.id || '').toLowerCase();
  if (t.includes('ganesha') || t.includes('ganapathi') || t.includes('vinayaka') || t.includes('గణపతి') || t.includes('వినాయక')) return DEITY_IMAGES.ganesha;
  if (t.includes('shiva') || t.includes('rudra') || t.includes('శివ') || t.includes('రుద్ర')) return DEITY_IMAGES.shiva;
  if (t.includes('venkateswara') || t.includes('balaji') || t.includes('శ్రీనివాస') || t.includes('వెంకటేశ్వర')) return DEITY_IMAGES.venkateswara;
  if (t.includes('devi') || t.includes('durga') || t.includes('లక్ష్మి') || t.includes('దుర్గ') || t.includes('అమ్మవారు')) return DEITY_IMAGES.durga;
  if (t.includes('murugan') || t.includes('subramanya') || t.includes('సుబ్రహ్మణ్య')) return DEITY_IMAGES.murugan;
  if (t.includes('hanuman') || t.includes('ఆంజనేయ') || t.includes('హనుమాన్')) return DEITY_IMAGES.hanuman;
  if (t.includes('krishna') || t.includes('కృష్ణ')) return DEITY_IMAGES.krishna;
  if (t.includes('rama') || t.includes('రామ')) return DEITY_IMAGES.rama;

  return DEITY_IMAGES.ayyappa;
};

export const SlokaDetailScreen: React.FC<Props> = ({
  itemId,
  rawId,
  title,
  category,
  currentLanguage,
  onBack,
}) => {
  const [subItems, setSubItems] = useState<any[]>([]);
  const [selectedSubItem, setSelectedSubItem] = useState<any | null>(null);
  const [subItemDetail, setSubItemDetail] = useState<any | null>(null);
  const [loadingSubItems, setLoadingSubItems] = useState<boolean>(true);
  const [refreshingSubList, setRefreshingSubList] = useState<boolean>(false);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  const [liveRecord, setLiveRecord] = useState<any | null>(null);
  const [loadingLiveRecord, setLoadingLiveRecord] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Audio Playback State (for records with audio)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const audioTimerRef = useRef<NodeJS.Timeout | null>(null);

  const ui = UI_TEXTS[currentLanguage] || UI_TEXTS.en;

  // 1. Fetch full record dynamically from database via API
  useEffect(() => {
    let isMounted = true;
    setLoadingLiveRecord(true);
    const idToFetch = rawId || itemId;

    ApiService.getCategoryDetail(String(idToFetch), currentLanguage)
      .then(async (res) => {
        if (!isMounted) return;
        if (res) {
          // If the returned description is short (< 150 chars) and not in Telugu, also fetch Telugu record to retrieve authentic sacred lyrics
          if (currentLanguage !== 'te' && (!res.description || res.description.length < 150) && !res.lyrics) {
            try {
              const teRes = await ApiService.getCategoryDetail(String(idToFetch), 'te');
              if (isMounted && teRes && (teRes.description || teRes.fullScriptureText)) {
                res.lyrics = teRes.fullScriptureText || teRes.description;
                res.descriptionTelugu = teRes.fullScriptureText || teRes.description;
                if (!res.titleTelugu) res.titleTelugu = teRes.title;
              }
            } catch (_) {}
          }
          if (isMounted) setLiveRecord(res);
        }
      })
      .catch((e) => console.warn('Sloka/Stotra detail load notice:', e))
      .finally(() => {
        if (isMounted) setLoadingLiveRecord(false);
      });

    return () => { isMounted = false; };
  }, [itemId, rawId, currentLanguage]);

  // 2. Resolve content dynamically from DB response
  const resolvedContent = React.useMemo(() => {
    const raw = liveRecord || {};
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

    const mantrasList = Array.isArray(raw.mantras) && raw.mantras.length > 0
      ? raw.mantras
      : [];

    const procedureSteps = Array.isArray(raw.procedure) && raw.procedure.length > 0
      ? raw.procedure
      : [];

    const contentsList = Array.isArray(raw.contents) && raw.contents.length > 0
      ? raw.contents
      : (Array.isArray(raw.devotionalContents) ? raw.devotionalContents : []);

    const benefitsList = (Array.isArray(raw.benefits) ? raw.benefits : []).filter((b: any) => {
      const str = String(typeof b === 'string' ? b : (b.title || b.description || '')).toLowerCase();
      return !str.includes('profound peace') && !str.includes('spiritual strength') && !str.includes('planetary doshams') && !str.includes('negative vibrations') && !str.includes('divine protection of the presiding deity');
    });

    // Prefer full lyrics / scripture text from DB
    let fullText = raw.lyrics || raw.descriptionTelugu || raw.fullScriptureText || raw.description || raw.overview || '';
    if ((!fullText || fullText.length < 150) && (raw.lyrics || raw.descriptionTelugu)) {
      fullText = raw.lyrics || raw.descriptionTelugu;
    }

    return {
      id: raw.slug || itemId,
      deityId: dId,
      title: cleanTitle,
      subtitle: raw.subtitle || '',
      description: fullText,
      instructionNote: raw.instructionNote || '',
      mantras: mantrasList,
      procedure: procedureSteps,
      contents: contentsList,
      benefits: benefitsList,
      audioTrack: raw.audioTrack || (raw.isAudio ? { title: cleanTitle, duration: '05:00' } : null),
    };
  }, [liveRecord, itemId, title]);

  const isBhajanOrSong = React.useMemo(() => {
    const cat = String(category || '').toLowerCase();
    const id = String(itemId || '').toLowerCase();
    const pSlug = String(liveRecord?.parentSlug || liveRecord?.category || '').toLowerCase();
    const rId = String(rawId || liveRecord?.parentId || '');
    const t = String(title || resolvedContent.title || '').toLowerCase();

    return (
      cat.includes('bhajan') ||
      cat.includes('song') ||
      cat.includes('harathi') ||
      cat.includes('keerthana') ||
      (category && (category.includes('భజన') || category.includes('పాట') || category.includes('కీర్తన'))) ||
      id.includes('bhajan') ||
      id.includes('song') ||
      id.includes('harathi') ||
      id.includes('keerthana') ||
      id.includes('paata') ||
      pSlug.includes('bhajan') ||
      pSlug.includes('song') ||
      rId === '116' ||
      rId === '11' ||
      rId === '93' ||
      t.includes('భజన') ||
      t.includes('హారతి') ||
      t.includes('కీర్తన') ||
      t.includes('పాట') ||
      t.includes('bhajan') ||
      t.includes('song') ||
      t.includes('harathi')
    );
  }, [category, itemId, rawId, liveRecord, title, resolvedContent.title]);

  // 3. Load subcategories/children dynamically if present
  const loadSubItems = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshingSubList(true);
    else setLoadingSubItems(true);

    try {
      if (liveRecord?.children && Array.isArray(liveRecord.children) && liveRecord.children.length > 0) {
        setSubItems(liveRecord.children);
        return;
      }
      if (liveRecord?.subcategories && Array.isArray(liveRecord.subcategories) && liveRecord.subcategories.length > 0) {
        setSubItems(liveRecord.subcategories);
        return;
      }
      if (liveRecord && Array.isArray(liveRecord.subcategories) && liveRecord.subcategories.length === 0) {
        setSubItems([]);
        return;
      }
      if (liveRecord?.fullScriptureText || (liveRecord?.description && liveRecord.description.length > 60)) {
        setSubItems([]);
        return;
      }

      const targetQueryId = rawId || itemId;
      const liveItems = await ApiService.getSubcategories(String(targetQueryId), currentLanguage);
      if (Array.isArray(liveItems) && liveItems.length > 0) {
        const sorted = [...liveItems].sort(
          (a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0)
        );
        setSubItems(sorted);
      } else {
        setSubItems([]);
      }
    } catch (err) {
      console.warn('Subcategories fetch error in SlokaDetailScreen:', err);
      setSubItems([]);
    } finally {
      setLoadingSubItems(false);
      setRefreshingSubList(false);
    }
  }, [currentLanguage, liveRecord, rawId, itemId]);

  useEffect(() => {
    loadSubItems();
  }, [loadSubItems, liveRecord]);

  // 4. Handle sub-item selection
  const handleSelectSubItem = async (subItem: any) => {
    setSelectedSubItem(subItem);
    setLoadingDetail(true);
    setSubItemDetail(null);
    try {
      const detail = await ApiService.getCategoryDetail(
        String(subItem.id || subItem.slug || subItem.rawId),
        currentLanguage
      );
      if (detail) {
        if (currentLanguage !== 'te' && (!detail.description || detail.description.length < 150) && !detail.lyrics) {
          try {
            const teDetail = await ApiService.getCategoryDetail(
              String(subItem.id || subItem.slug || subItem.rawId),
              'te'
            );
            if (teDetail && (teDetail.description || teDetail.fullScriptureText)) {
              detail.lyrics = teDetail.fullScriptureText || teDetail.description;
              detail.descriptionTelugu = teDetail.fullScriptureText || teDetail.description;
              if (!detail.titleTelugu) detail.titleTelugu = teDetail.title;
            }
          } catch (_) {}
        }
        setSubItemDetail(detail);
      }
    } catch (e) {
      console.warn('Sub-item detail load notice:', e);
    } finally {
      setLoadingDetail(false);
    }
  };

  // 5. Hardware back button handling
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

  // 6. Saved state in AsyncStorage
  useEffect(() => {
    async function checkSaved() {
      try {
        const s = await AsyncStorage.getItem(`@devotional_saved_${resolvedContent.id}`);
        if (s === 'true') setIsSaved(true);
      } catch (_) {}
    }
    checkSaved();
  }, [resolvedContent.id]);

  const handleToggleSave = async () => {
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    try {
      await AsyncStorage.setItem(
        `@devotional_saved_${resolvedContent.id}`,
        nextSaved ? 'true' : 'false'
      );
      Alert.alert(
        nextSaved ? '🙏 Swamiye Saranam Ayyappa' : 'Information',
        nextSaved ? ui.bookmarkAdded : ui.bookmarkRemoved,
        [{ text: 'OK' }]
      );
    } catch (_) {}
  };

  const handleDownloadPdf = () => {
    Alert.alert('📥 Download Sacred Scripture', ui.downloadStarted, [{ text: 'OK' }]);
  };

  // Helper to format scripture text into beautiful cards & paragraphs
  const renderFormattedScripture = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let tableRows: string[][] = [];
    let inTable = false;

    const flushTable = (key: string) => {
      if (tableRows.length === 0) return;
      const headers = tableRows[0];
      const dataRows = tableRows.slice(1);

      elements.push(
        <View key={key} style={styles.tableCardContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator style={styles.tableScroll}>
            <View style={styles.tableCard}>
              <View style={styles.tableHeaderRow}>
                {headers.map((col, colIdx) => (
                  <View key={`th-${colIdx}`} style={[styles.tableCell, styles.tableHeaderCell]}>
                    <Text style={styles.tableHeaderText}>{col}</Text>
                  </View>
                ))}
              </View>
              {dataRows.map((row, rIdx) => (
                <View key={`tr-${rIdx}`} style={[styles.tableDataRow, rIdx % 2 === 1 && styles.tableRowAlt]}>
                  {row.map((val, cIdx) => (
                    <View key={`td-${rIdx}-${cIdx}`} style={styles.tableCell}>
                      <Text style={styles.tableCellText}>{val}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      );
      tableRows = [];
      inTable = false;
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const rawCols = trimmed.slice(1, -1).split('|').map((c) => c.trim());
        const isDelimiter = rawCols.every((c) => /^[-:]+$/.test(c));
        if (!isDelimiter) {
          tableRows.push(rawCols);
          inTable = true;
        }
        return;
      } else if (inTable) {
        flushTable(`table-${idx}`);
      }

      if (!trimmed) {
        elements.push(<View key={`space-${idx}`} style={{ height: 10 }} />);
        return;
      }

      // Section Headers [ Heading ]
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        const headerText = trimmed.slice(1, -1).trim();
        elements.push(
          <View key={`sec-${idx}`} style={styles.sectionHeaderCard}>
            <Text style={styles.sectionHeaderText}>❖ {headerText} ❖</Text>
          </View>
        );
        return;
      }

      // Bullet points
      if (trimmed.startsWith('•') || trimmed.startsWith('*')) {
        elements.push(
          <Text key={`bullet-${idx}`} style={styles.readingBodyText}>
            {trimmed}
          </Text>
        );
        return;
      }

      // Regular lines/paragraphs
      elements.push(
        <Text key={`line-${idx}`} style={styles.readingBodyText}>
          {trimmed}
        </Text>
      );
    });

    if (inTable) {
      flushTable('table-end');
    }

    return elements;
  };

  const deityAvatar = getMedallion(
    selectedSubItem || liveRecord || { title: resolvedContent.title, id: resolvedContent.id },
    resolvedContent.deityId
  );

  // =========================================================================
  // VIEW 2: SACRED READING DETAIL VIEW (When Sub-Item is tapped or single item)
  // =========================================================================
  if (selectedSubItem) {
    const currentTitle = selectedSubItem.title || resolvedContent.title;
    let currentDesc =
      subItemDetail?.lyrics ||
      subItemDetail?.descriptionTelugu ||
      subItemDetail?.fullScriptureText ||
      subItemDetail?.description ||
      subItemDetail?.content ||
      subItemDetail?.overview ||
      selectedSubItem.lyrics ||
      selectedSubItem.descriptionTelugu ||
      selectedSubItem.fullScriptureText ||
      selectedSubItem.description ||
      selectedSubItem.content ||
      '';
    if ((!currentDesc || currentDesc.length < 150) && (subItemDetail?.lyrics || subItemDetail?.descriptionTelugu)) {
      currentDesc = subItemDetail.lyrics || subItemDetail.descriptionTelugu;
    }
    const currentInstruction = subItemDetail?.instructionNote || selectedSubItem?.instructionNote || '';
    const mantrasList = Array.isArray(subItemDetail?.mantras) && subItemDetail.mantras.length > 0
      ? subItemDetail.mantras
      : (Array.isArray(selectedSubItem?.mantras) ? selectedSubItem.mantras : []);
    const procedureList = Array.isArray(subItemDetail?.procedure) && subItemDetail.procedure.length > 0
      ? subItemDetail.procedure
      : (Array.isArray(selectedSubItem?.procedure) ? selectedSubItem.procedure : []);
    const contentsList = Array.isArray(subItemDetail?.contents) && subItemDetail.contents.length > 0
      ? subItemDetail.contents
      : (Array.isArray(subItemDetail?.devotionalContents) ? subItemDetail.devotionalContents : []);
    const benefitsList = (Array.isArray(subItemDetail?.benefits) && subItemDetail.benefits.length > 0
      ? subItemDetail.benefits
      : (Array.isArray(selectedSubItem?.benefits) ? selectedSubItem.benefits : [])).filter((b: any) => {
        const s = String(typeof b === 'string' ? b : (b.title || b.description || '')).toLowerCase();
        return !s.includes('profound peace') && !s.includes('spiritual strength') && !s.includes('planetary doshams') && !s.includes('negative vibrations') && !s.includes('divine protection of the presiding deity');
      });

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
                  source={deityAvatar}
                  style={styles.readingMedallionImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.readingTitleContainer}>
                <Text style={styles.readingTitle}>{currentTitle}</Text>
                <Text style={styles.readingSubtitle}>
                  {resolvedContent.deityId === 'ayyappa'
                    ? 'ఓం స్వామియే శరణమయ్యప్ప 🙏'
                    : '|| శుభం భూయాత్ ||'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.cardHeaderSaveBtn}
                onPress={handleToggleSave}
                activeOpacity={0.7}
              >
                <HeartFavoriteIcon isSaved={isSaved} />
              </TouchableOpacity>
            </View>

            <View style={styles.readingDivider} />

            {loadingDetail ? (
              <View style={styles.readingLoadingBox}>
                <ActivityIndicator size="large" color="#173D32" />
                <Text style={styles.readingLoadingText}>{ui.loadingText}</Text>
              </View>
            ) : (
              <View>
                {/* Instruction note badge */}
                {currentInstruction ? (
                  <View style={styles.instructionBadge}>
                    <Text style={styles.instructionText}>✦ {currentInstruction} ✦</Text>
                  </View>
                ) : null}

                {/* Formatted Scripture Text */}
                {currentDesc ? renderFormattedScripture(currentDesc) : null}

                {/* Mantras List */}
                {mantrasList && mantrasList.length > 0 ? (
                  <View style={{ marginTop: 14 }}>
                    <Text style={[styles.sectionHeaderText, { marginBottom: 10, color: '#173D32' }]}>
                      ❖ {ui.verses}:
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
                              {ui.meaning}:{' '}
                            </Text>
                            {m.meaning}
                          </Text>
                        ) : null}
                      </View>
                    ))}
                  </View>
                ) : null}

                {/* Procedure Steps / Stanzas */}
                {procedureList && procedureList.length > 0 ? (
                  <View style={{ marginTop: 14 }}>
                    {procedureList.map((step: any, sIdx: number) => (
                      <View key={step.id || sIdx} style={styles.stepCardItem}>
                        <View style={styles.stepBadge}>
                          <Text style={styles.stepBadgeText}>{step.step || (sIdx + 1)}</Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <Text style={styles.stepTitle}>{step.title || (`Verse ${sIdx + 1}`)}</Text>
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

                {/* Devotional Contents */}
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
                        <Text style={styles.readingBodyText}>
                          {c.content || c.text || c.meaning || c.description}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                {/* Benefits / Phalasruti */}
                {benefitsList && benefitsList.length > 0 ? (
                  <View style={{ marginTop: 14 }}>
                    <Text style={[styles.sectionHeaderText, { marginBottom: 8, color: '#173D32' }]}>
                      ✨ {ui.benefits}:
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

                {/* Download PDF Action Button (Hidden for Bhajans & Songs) */}
                {!isBhajanOrSong && (
                  <TouchableOpacity
                    style={styles.downloadPdfButton}
                    onPress={handleDownloadPdf}
                    activeOpacity={0.8}
                  >
                    <DownloadTrayIcon />
                    <Text style={styles.downloadPdfText}>{ui.downloadPdf}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // =========================================================================
  // VIEW 1: MASTER LIST VIEW (If Sub-items exist) OR DIRECT READING CARD
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
          {resolvedContent.title}
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
            <Text style={styles.subListLoadingText}>{ui.loadingText}</Text>
          </View>
        ) : subItems.length === 0 ? (
          /* Direct Single Sacred Reading Card when no child subcategories exist */
          <View style={styles.readingCard}>
            <View style={styles.readingCardHeader}>
              <View style={styles.readingMedallionWrapper}>
                <Image
                  source={deityAvatar}
                  style={styles.readingMedallionImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.readingTitleContainer}>
                <Text style={styles.readingTitle}>{resolvedContent.title}</Text>
                <Text style={styles.readingSubtitle}>
                  {resolvedContent.deityId === 'ayyappa'
                    ? 'ఓం స్వామియే శరణమయ్యప్ప 🙏'
                    : '|| శుభం భూయాత్ ||'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.cardHeaderSaveBtn}
                onPress={handleToggleSave}
                activeOpacity={0.7}
              >
                <HeartFavoriteIcon isSaved={isSaved} />
              </TouchableOpacity>
            </View>

            <View style={styles.readingDivider} />

            <View style={{ marginTop: 6 }}>
              {/* Sacred Instruction Note */}
              {resolvedContent.instructionNote ? (
                <View style={styles.instructionBadge}>
                  <Text style={styles.instructionText}>✦ {resolvedContent.instructionNote} ✦</Text>
                </View>
              ) : null}

              {/* Formatted Scripture Text */}
              {resolvedContent.description
                ? renderFormattedScripture(resolvedContent.description)
                : null}

              {/* Mantras from DB */}
              {resolvedContent.mantras && resolvedContent.mantras.length > 0 ? (
                <View style={{ marginTop: 14 }}>
                  <Text style={[styles.sectionHeaderText, { marginBottom: 10, color: '#173D32' }]}>
                    ❖ {ui.verses}:
                  </Text>
                  {resolvedContent.mantras.map((m: any, mIdx: number) => (
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
                            {ui.meaning}:{' '}
                          </Text>
                          {m.meaning}
                        </Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              ) : null}

              {/* Procedure / Stanza Steps from DB */}
              {resolvedContent.procedure && resolvedContent.procedure.length > 0 ? (
                <View style={{ marginTop: 14 }}>
                  {resolvedContent.procedure.map((pr: any, prIdx: number) => (
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
              ) : null}

              {/* Devotional Contents from DB */}
              {resolvedContent.contents && resolvedContent.contents.length > 0 ? (
                <View style={{ marginTop: 14 }}>
                  {resolvedContent.contents.map((c: any, cIdx: number) => (
                    <View key={c.id || cIdx} style={{ marginTop: 8, paddingVertical: 4 }}>
                      {c.title ? <Text style={styles.stepTitle}>✦ {c.title} ✦</Text> : null}
                      {c.sacredText ? (
                        <View style={[styles.mantraBox, { marginVertical: 6 }]}>
                          <Text style={styles.mantraText}>{c.sacredText}</Text>
                        </View>
                      ) : null}
                      <Text style={styles.readingBodyText}>
                        {c.content || c.text || c.meaning || c.description}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {/* Benefits / Phalasruti from DB */}
              {resolvedContent.benefits && resolvedContent.benefits.length > 0 ? (
                <View style={{ marginTop: 14 }}>
                  <Text style={[styles.sectionHeaderText, { marginBottom: 8, color: '#173D32' }]}>
                    ✨ {ui.benefits}:
                  </Text>
                  {resolvedContent.benefits.map((b: any, bIdx: number) => (
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

              {/* Download PDF Button (Hidden for Bhajans & Songs) */}
              {!isBhajanOrSong && (
                <TouchableOpacity
                  style={styles.downloadPdfButton}
                  onPress={handleDownloadPdf}
                  activeOpacity={0.8}
                >
                  <DownloadTrayIcon />
                  <Text style={styles.downloadPdfText}>{ui.downloadPdf}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          /* Sub-items List Cards */
          <View style={styles.subListCardsContainer}>
            {subItems.map((item, index) => {
              const itemTitle = item.title || item.slug || `Item ${index + 1}`;
              const itemSubtitle = item.description || item.subtitle || '';
              const medallion = getMedallion(item, resolvedContent.deityId);

              return (
                <TouchableOpacity
                  key={String(item.id || index)}
                  style={styles.subItemCard}
                  activeOpacity={0.82}
                  onPress={() => handleSelectSubItem(item)}
                  accessibilityRole="button"
                  accessibilityLabel={itemTitle}
                >
                  <View style={styles.subItemMedallionWrapper}>
                    <Image
                      source={medallion}
                      style={styles.subItemMedallionImage}
                      resizeMode="cover"
                    />
                  </View>

                  <View style={styles.subItemContent}>
                    <Text style={styles.subItemCardTitle} numberOfLines={2}>
                      {itemTitle}
                    </Text>
                    {itemSubtitle ? (
                      <Text style={styles.subItemCardSubtitle} numberOfLines={1}>
                        {itemSubtitle.replace(/^\[.*?\]\s*/, '').trim()}
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.subItemPlayIconWrapper}>
                    <CardPlayTriangleIcon />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FAF5EB',
  },
  padiHeaderBar: {
    minHeight: 56 + ANDROID_STATUS_BAR_HEIGHT,
    paddingTop: ANDROID_STATUS_BAR_HEIGHT + 6,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    position: 'relative',
    borderBottomWidth: 1.2,
    borderBottomColor: '#DFA62E',
    shadowColor: '#071914',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  padiBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFDF8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: '#DFA62E',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  padiBackArrowText: {
    color: '#173D32',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
  },
  padiHeaderTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFDF8',
    letterSpacing: 0.3,
  },
  headerFiligreeWrapper: {
    position: 'absolute',
    right: 0,
    top: ANDROID_STATUS_BAR_HEIGHT,
    bottom: 0,
    justifyContent: 'center',
    opacity: 0.85,
  },
  watermarkImage: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 0.9,
    alignSelf: 'center',
    top: '22%',
    opacity: 0.08,
    zIndex: 0,
  },

  // Sub-items List
  subListScrollView: {
    flex: 1,
    zIndex: 1,
  },
  subListScrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
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

  // Reading Detail Card
  detailScrollContent: {
    padding: 14,
    paddingBottom: 40,
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
  cardHeaderSaveBtn: {
    padding: 6,
    marginLeft: 8,
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
  sectionHeaderCard: {
    backgroundColor: '#FFF3E0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#DFA62E',
    marginVertical: 8,
  },
  sectionHeaderText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8B4513',
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
  downloadPdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8EC',
    borderWidth: 1.4,
    borderColor: '#DFA62E',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 20,
    gap: 8,
  },
  downloadPdfText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#173D32',
  },

  // Markdown Table styles
  tableCardContainer: {
    marginVertical: 10,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8D5B5',
  },
  tableScroll: {
    width: '100%',
  },
  tableCard: {
    backgroundColor: '#FFFDF8',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#173D32',
    paddingVertical: 8,
  },
  tableHeaderCell: {
    borderRightColor: 'rgba(255, 255, 255, 0.2)',
  },
  tableHeaderText: {
    color: '#FFD700',
    fontWeight: '700',
    fontSize: 12.5,
  },
  tableDataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6D8',
    paddingVertical: 7,
  },
  tableRowAlt: {
    backgroundColor: '#FAF5EB',
  },
  tableCell: {
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: '#F0E6D8',
    justifyContent: 'center',
  },
  tableCellText: {
    fontSize: 12.5,
    color: '#2C1D11',
  },
});
