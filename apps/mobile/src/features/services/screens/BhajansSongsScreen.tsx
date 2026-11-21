import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect, Polygon, Line, Ellipse } from 'react-native-svg';
import { SupportedLanguage } from '../../../types';
import { StorageService } from '../../../services/storageService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type AudioCategory = 'bhajans' | 'harathis' | 'songs';

interface Props {
  initialCategory?: AudioCategory | string;
  currentLanguage: SupportedLanguage;
  currentDeity?: any;
  onBack: () => void;
  onOpenTrackDetail?: (trackId: string, trackTitle: string) => void;
}

// Corner Filigree Ornaments for Header
const HeaderCornerFiligree = ({ flipped = false }: { flipped?: boolean }) => (
  <View style={flipped ? { transform: [{ scaleX: -1 }] } : undefined}>
    <Svg width={36} height={36} viewBox="0 0 36 36" fill="none">
      <Path
        d="M2 2 C12 2 22 8 28 16 C24 18 18 16 12 22 C8 16 6 8 2 2 Z"
        fill="#E2AD43"
        fillOpacity={0.8}
      />
      <Circle cx="8" cy="8" r="2" fill="#FFD700" />
      <Circle cx="16" cy="5" r="1.5" fill="#FFD700" />
      <Circle cx="5" cy="16" r="1.5" fill="#FFD700" />
    </Svg>
  </View>
);

// Back Arrow inside Header
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

// Golden Lotus Ornament under header title: ─── 🪷 ───
const GoldenLotusOrnament = () => (
  <View style={styles.lotusContainer}>
    <View style={styles.lotusLine} />
    <Svg width={30} height={18} viewBox="0 0 30 18" fill="none">
      {/* Center Petal */}
      <Path d="M15 2 C14 7 14 13 15 16 C16 13 16 7 15 2 Z" fill="#E2AD43" />
      {/* Left Petals */}
      <Path d="M15 16 C11 13 9 8 11 4 C12 9 13 14 15 16 Z" fill="#E2AD43" />
      <Path d="M15 16 C7 14 5 10 7 7 C9 11 12 15 15 16 Z" fill="#D39628" />
      {/* Right Petals */}
      <Path d="M15 16 C19 13 21 8 19 4 C18 9 17 14 15 16 Z" fill="#E2AD43" />
      <Path d="M15 16 C23 14 25 10 23 7 C21 11 18 15 15 16 Z" fill="#D39628" />
      {/* Base Lotus Leaf */}
      <Ellipse cx="15" cy="16.5" rx="6" ry="1.5" fill="#E2AD43" />
    </Svg>
    <View style={styles.lotusLine} />
  </View>
);

// Play Triangle Icon inside circular maroon button
const PlayTriangleIcon = () => (
  <Svg width={18} height={20} viewBox="0 0 18 20" fill="none">
    <Polygon points="3,1 17,10 3,19" fill="#FFFFFF" />
  </Svg>
);

// Pause Icon inside circular maroon button
const PauseIcon = () => (
  <Svg width={16} height={18} viewBox="0 0 16 18" fill="none">
    <Rect x="2" y="1" width="4" height="16" rx="1" fill="#FFFFFF" />
    <Rect x="10" y="1" width="4" height="16" rx="1" fill="#FFFFFF" />
  </Svg>
);

// Hanging Golden Bell
const HangingBell = ({ style }: { style?: any }) => (
  <View style={[{ alignItems: 'center' }, style]}>
    <Svg width={24} height={70} viewBox="0 0 24 70" fill="none">
      {/* Golden chain */}
      <Line x1="12" y1="0" x2="12" y2="40" stroke="#E2AD43" strokeWidth="1.5" strokeDasharray="3 2" />
      {/* Ring */}
      <Circle cx="12" cy="42" r="2.5" stroke="#E2AD43" strokeWidth="1.2" fill="none" />
      {/* Bell Body */}
      <Path d="M6 58 C6 48 18 48 18 58 L20 62 L4 62 Z" fill="#E2AD43" />
      <Path d="M4 62 Q12 65 20 62 L20 64 Q12 67 4 64 Z" fill="#C8942D" />
      {/* Clapper */}
      <Circle cx="12" cy="67" r="2.2" fill="#D39628" />
    </Svg>
  </View>
);

// Bottom Temple Illustration
const TempleBottomIllustration = () => (
  <View style={styles.templeIllustrationContainer} pointerEvents="none">
    <HangingBell style={styles.hangingBellLeft} />
    <Svg
      width={SCREEN_WIDTH}
      height={110}
      viewBox="0 0 360 110"
      fill="none"
      preserveAspectRatio="xMidYMax meet"
    >
      {/* Background Mountain Fog */}
      <Path d="M0 70 Q90 50 180 65 Q270 45 360 68 L360 110 L0 110 Z" fill="#F4E6D0" fillOpacity={0.6} />
      {/* Multi-tiered Temple Roof & Spires */}
      <Path d="M180 8 L182 18 L178 18 Z" fill="#E2AD43" />
      <Circle cx="180" cy="7" r="1.5" fill="#FFD700" />
      {/* Tier 1 Small Roof */}
      <Path d="M168 28 L180 18 L192 28 Z" fill="#D89A32" />
      {/* Tier 2 Middle Roof */}
      <Path d="M152 44 L180 28 L208 44 Z" fill="#C88B27" />
      {/* Tier 3 Main Broad Roof */}
      <Path d="M100 70 L180 44 L260 70 L256 74 L180 50 L104 74 Z" fill="#B77B1E" />
      {/* Flanking Side Spires */}
      <Path d="M125 58 L126 64 L124 64 Z" fill="#E2AD43" />
      <Path d="M235 58 L236 64 L234 64 Z" fill="#E2AD43" />
      {/* Wooden Sanctuary Base */}
      <Rect x="120" y="74" width="120" height="26" fill="#E6CEAB" />
      <Rect x="140" y="78" width="80" height="22" fill="#DDBB8E" />
      <Rect x="170" y="82" width="20" height="18" fill="#173D32" fillOpacity={0.7} />
      {/* Golden Lamps */}
      <Circle cx="180" cy="90" r="2" fill="#FFD700" />
    </Svg>
    <HangingBell style={styles.hangingBellRight} />
  </View>
);

// Pre-bundled deity artworks
const DEITY_IMAGES: Record<string, any> = {
  ayyappa: require('../../../../assets/deities/ayyappa.jpg'),
  ganesha: require('../../../../assets/deities/ganesha.jpg'),
  venkateswara: require('../../../../assets/deities/venkateswara.jpg'),
  devi: require('../../../../assets/deities/durga.jpg'),
  shiva: require('../../../../assets/deities/shiva.jpg'),
  hanuman: require('../../../../assets/deities/hanuman.jpg'),
  krishna: require('../../../../assets/deities/krishna.jpg'),
  rama: require('../../../../assets/deities/rama.jpg'),
};

export interface AudioTrack {
  id: string;
  title: string;
  subtitle: string;
  category: AudioCategory;
  durationSeconds: number;
  durationFormatted: string;
  deityId: string;
  image: any;
  lyricsSnippet?: string;
}

// Master Audio Catalog matching the approved design
const MASTER_TRACKS: AudioTrack[] = [
  // --- BHAJANS ---
  {
    id: 'harivarasanam',
    title: 'Harivarasanam',
    subtitle: 'Ayyappa Bhajan • 05:48',
    category: 'bhajans',
    durationSeconds: 348,
    durationFormatted: '05:48',
    deityId: 'ayyappa',
    image: DEITY_IMAGES.ayyappa,
    lyricsSnippet:
      'హరివరాసనం విశ్వమోహనం హరిదధీశ్వరం ఆరాధ్యపాదుకమ్ | అరివిమర్దనం నిత్యనర్తనం హరిహరాత్మజం దేవమాశ్రయే || శరణం అయ్యప్ప స్వామి శరణం అయ్యప్ప...',
  },
  {
    id: 'swamiye-saranam-ayyappa',
    title: 'Swamiye Saranam Ayyappa',
    subtitle: 'Bhajan • 04:36',
    category: 'bhajans',
    durationSeconds: 276,
    durationFormatted: '04:36',
    deityId: 'ayyappa',
    image: DEITY_IMAGES.ayyappa,
    lyricsSnippet:
      'స్వామియే శరణం అయ్యప్ప | స్వామి పొన్నయ్యప్ప | శబరిగిరీశా శరణం అయ్యప్ప | మండల పూజకు మాల ధరించి శరణు ఘోషతో నీ దరి చేరితిమి...',
  },
  {
    id: 'saranam-saranam',
    title: 'Saranam Saranam',
    subtitle: 'Bhajan • 05:20',
    category: 'bhajans',
    durationSeconds: 320,
    durationFormatted: '05:20',
    deityId: 'ayyappa',
    image: DEITY_IMAGES.ayyappa,
    lyricsSnippet:
      'శరణం శరణం పొన్నయ్యప్పా | కరుణాసాగర కాంతమలయ్యప్పా | పద్దెనిమిది మెట్లు ఎక్కి నీ దర్శనం చేయ శబరిమలైకి వచ్చితిమయ్యా...',
  },
  {
    id: 'pallikattu-sabarimalaikku',
    title: 'Pallikattu Sabarimalaikku',
    subtitle: 'Ayyappa Bhajan • 06:45',
    category: 'bhajans',
    durationSeconds: 405,
    durationFormatted: '06:45',
    deityId: 'ayyappa',
    image: DEITY_IMAGES.ayyappa,
    lyricsSnippet:
      'పల్లికట్టు శబరిమలైకి కల్లుం ముల్లుం కాలికి మెత్తై | స్వామియే అయ్యప్పో అయ్యప్పో స్వామియే | నేతి నెయ్యితో దీపం వెలిగించి...',
  },
  {
    id: 'shiva-shambho',
    title: 'Shiva Shambho Mahadeva',
    subtitle: 'Shiva Bhajan • 05:15',
    category: 'bhajans',
    durationSeconds: 315,
    durationFormatted: '05:15',
    deityId: 'shiva',
    image: DEITY_IMAGES.shiva,
    lyricsSnippet:
      'శివ శంభో శంభో మహాదేవా | గంగాధర హర శంభో మహాదేవా | పార్వతీ నాయక పరమేశ్వరా | శరణం శరణం హర శంభో మహాదేవా...',
  },
  {
    id: 'ganesha-sharanam-bhajan',
    title: 'Ganesha Sharanam',
    subtitle: 'Ganesha Bhajan • 04:50',
    category: 'bhajans',
    durationSeconds: 290,
    durationFormatted: '04:50',
    deityId: 'ganesha',
    image: DEITY_IMAGES.ganesha,
    lyricsSnippet:
      'గణేశ శరణం శరణం గణేశా | విఘ్నవినాశక శరణం గణేశా | మోదకప్రియా గౌరీనందనా | శరణం శరణం శరణం గణేశా...',
  },

  // --- HARATHIS ---
  {
    id: 'ayyappa-mangala-harathi',
    title: 'Ayyappa Mangala Harathi',
    subtitle: 'Harathi • 03:58',
    category: 'harathis',
    durationSeconds: 238,
    durationFormatted: '03:58',
    deityId: 'ayyappa',
    image: DEITY_IMAGES.ayyappa,
    lyricsSnippet:
      'శ్రీ ధర్మశాస్తాకు మంగళము | హరిహర పుత్రునకు శుభ మంగళము | శబరి గిరివాసునకు కర్పూర హారతి | స్వామియే శరణం అయ్యప్ప...',
  },
  {
    id: 'karpura-deeparadhana',
    title: 'Karpura Deeparadhana',
    subtitle: 'Ayyappa Harathi • 03:15',
    category: 'harathis',
    durationSeconds: 195,
    durationFormatted: '03:15',
    deityId: 'ayyappa',
    image: DEITY_IMAGES.ayyappa,
    lyricsSnippet:
      'కర్పూర గౌరం కరుణావతారం | సంసార సారం భుజగేంద్ర హారమ్ | సదా వసంతం హృదయారవిందే భవం భవానీ సహితం నమామి...',
  },
  {
    id: 'shiva-mangala-harathi',
    title: 'Shiva Mangala Harathi',
    subtitle: 'Harathi • 04:10',
    category: 'harathis',
    durationSeconds: 250,
    durationFormatted: '04:10',
    deityId: 'shiva',
    image: DEITY_IMAGES.shiva,
    lyricsSnippet:
      'జయ జయ మహాదేవ శంభో | చంద్రశేఖర త్రినేత్రధారి | కర్పూర హారతి స్వీకరించు త్రిపురాంతకా...',
  },
  {
    id: 'sri-lakshmi-harathi',
    title: 'Sri Lakshmi Harathi',
    subtitle: 'Devi Harathi • 03:45',
    category: 'harathis',
    durationSeconds: 225,
    durationFormatted: '03:45',
    deityId: 'devi',
    image: DEITY_IMAGES.devi,
    lyricsSnippet:
      'జయ జయ లక్ష్మీ జననీ జగదాంబికే | భాగ్యదాయిని అష్టైశ్వర్య ప్రదాయిని | భక్తితో సమర్పింతుము కర్పూర హారతి...',
  },
  {
    id: 'venkateswara-mangalasasanam',
    title: 'Venkateswara Mangalasasanam',
    subtitle: 'Balaji Harathi • 04:30',
    category: 'harathis',
    durationSeconds: 270,
    durationFormatted: '04:30',
    deityId: 'venkateswara',
    image: DEITY_IMAGES.venkateswara,
    lyricsSnippet:
      'శ్రియః కాంతాయ కళ్యాణనిధయే నిధయేऽర్థినామ్ | శ్రీవేంకటనివాసాయ శ్రీనివాసాయ మంగళమ్ ||',
  },

  // --- SONGS ---
  {
    id: 'ayyappa-suprabhatham',
    title: 'Ayyappa Suprabhatham',
    subtitle: 'Suprabhatham • 06:12',
    category: 'songs',
    durationSeconds: 372,
    durationFormatted: '06:12',
    deityId: 'ayyappa',
    image: DEITY_IMAGES.ayyappa,
    lyricsSnippet:
      'ఉత్తిష్ఠోత్తిష్ఠ భూతేశ ఉత్తిష్ఠ శబరీగిరీశ | ప్రాచీ దిశం సమాలోక్య దివ్యం తే మంగళం కదా...',
  },
  {
    id: 'bhagavan-saranam',
    title: 'Bhagavan Saranam Bhagavathi Saranam',
    subtitle: 'Devotional Song • 05:35',
    category: 'songs',
    durationSeconds: 335,
    durationFormatted: '05:35',
    deityId: 'ayyappa',
    image: DEITY_IMAGES.ayyappa,
    lyricsSnippet:
      'భగవాన్ శరణం భగవతి శరణం శరణం శరణం అయ్యప్పా | భగవతి శరణం భగవాన్ శరణం శరణం శరణం అయ్యప్పా...',
  },
  {
    id: 'enge-manakkuthu',
    title: 'Enge Manakkuthu',
    subtitle: 'Sabarimala Classic • 04:55',
    category: 'songs',
    durationSeconds: 295,
    durationFormatted: '04:55',
    deityId: 'ayyappa',
    image: DEITY_IMAGES.ayyappa,
    lyricsSnippet:
      'ఎంగే మణక్కుదు సంతనం ఎంగే మణక్కుదు | అయ్యప్పన్ సన్నిధానత్తిల్ సంతనం మణక్కుదు...',
  },
  {
    id: 'om-namah-shivaya-song',
    title: 'Om Namah Shivaya Kirtana',
    subtitle: 'Devotional Song • 05:40',
    category: 'songs',
    durationSeconds: 340,
    durationFormatted: '05:40',
    deityId: 'shiva',
    image: DEITY_IMAGES.shiva,
    lyricsSnippet:
      'ఓం నమః శివాయ ఓం నమః శివాయ | హర హర హర హర భోలే నాథా | జటాధరా శంభో మహాదేవా...',
  },
  {
    id: 'govinda-hari-govinda',
    title: 'Govinda Hari Govinda',
    subtitle: 'Keerthana • 06:05',
    category: 'songs',
    durationSeconds: 365,
    durationFormatted: '06:05',
    deityId: 'venkateswara',
    image: DEITY_IMAGES.venkateswara,
    lyricsSnippet:
      'గోవిందా హరి గోవిందా వేంకటరమణా గోవిందా | శంఖ చక్రధర గోవిందా శ్రీనివాసా గోవిందా...',
  },
];

export const BhajansSongsScreen: React.FC<Props> = ({
  initialCategory = 'bhajans',
  currentLanguage,
  currentDeity,
  onBack,
  onOpenTrackDetail,
}) => {
  // Determine normalized active category tab
  const getInitialTab = (): AudioCategory => {
    if (initialCategory === 'harathis') return 'harathis';
    if (initialCategory === 'songs') return 'songs';
    return 'bhajans';
  };

  const [activeTab, setActiveTab] = useState<AudioCategory>(getInitialTab());
  const [activeTrack, setActiveTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentProgressSeconds, setCurrentProgressSeconds] = useState<number>(0);
  const [lyricsModalVisible, setLyricsModalVisible] = useState<boolean>(false);

  // Playback timer ref
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Hardware Back Press
  useEffect(() => {
    const onHardwareBack = () => {
      onBack();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
    return () => sub.remove();
  }, [onBack]);

  // Audio Playback Timer
  useEffect(() => {
    if (isPlaying && activeTrack) {
      playbackTimerRef.current = setInterval(() => {
        setCurrentProgressSeconds((prev) => {
          if (prev >= activeTrack.durationSeconds) {
            setIsPlaying(false);
            StorageService.clearAudioProgress(activeTrack.id);
            return 0;
          }
          const next = prev + 1;
          StorageService.saveAudioProgress(
            activeTrack.id,
            next,
            next / activeTrack.durationSeconds
          );
          return next;
        });
      }, 1000);
    } else {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
    }

    return () => {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
    };
  }, [isPlaying, activeTrack]);

  // Restore saved audio position when switching or playing track
  const handlePlayTrack = async (track: AudioTrack) => {
    if (activeTrack?.id === track.id) {
      // Toggle play/pause on same track
      setIsPlaying((prev) => !prev);
    } else {
      // Switch track
      setActiveTrack(track);
      setIsPlaying(true);
      const savedProg = await StorageService.getAudioProgress(track.id);
      if (savedProg && savedProg.elapsed) {
        setCurrentProgressSeconds(Math.min(savedProg.elapsed, track.durationSeconds));
      } else {
        setCurrentProgressSeconds(0);
      }
    }
  };

  const handleNextTrack = () => {
    const currentList = getFilteredTracks();
    if (currentList.length === 0) return;
    const currentIndex = currentList.findIndex((t) => t.id === activeTrack?.id);
    const nextIndex = (currentIndex + 1) % currentList.length;
    handlePlayTrack(currentList[nextIndex]);
  };

  // Format MM:SS
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(mins)}:${pad(secs)}`;
  };

  // Filter and sort by deity preference
  const getFilteredTracks = (): AudioTrack[] => {
    const tabTracks = MASTER_TRACKS.filter((t) => t.category === activeTab);
    const activeDeityCode = (currentDeity?.id || currentDeity?.name || 'ayyappa').toLowerCase();

    // Prioritize active deity
    return [...tabTracks].sort((a, b) => {
      const aMatches = a.deityId.toLowerCase() === activeDeityCode ? -1 : 1;
      const bMatches = b.deityId.toLowerCase() === activeDeityCode ? -1 : 1;
      return aMatches - bMatches;
    });
  };

  const currentTrackList = getFilteredTracks();

  const miniProgressRatio =
    activeTrack && activeTrack.durationSeconds > 0
      ? currentProgressSeconds / activeTrack.durationSeconds
      : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#173D32" />

      {/* =========================================================================
          HEADER: Deep Maroon Gradient + Corner Ornaments + Lotus Motif
         ========================================================================= */}
      <LinearGradient
        colors={['#0C251E', '#173D32', '#173D32']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={onBack}
          activeOpacity={0.8}
          accessibilityLabel="Back to Categories"
        >
          <BackArrowIcon />
        </TouchableOpacity>

        {/* Center Title & Lotus Motif */}
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Bhajans & Songs</Text>
          <GoldenLotusOrnament />
        </View>

        {/* Top-Right Filigree */}
        <View style={styles.headerRightOrnament}>
          <HeaderCornerFiligree flipped />
        </View>

        {/* Top-Left Filigree */}
        <View style={styles.filigreeTopLeft}>
          <HeaderCornerFiligree />
        </View>
      </LinearGradient>

      {/* =========================================================================
          CATEGORY TABS: Bhajans | Harathis | Songs
         ========================================================================= */}
      <View style={styles.tabBarWrapper}>
        <View style={styles.tabBarContainer}>
          {/* Tab 1: Bhajans */}
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'bhajans' && styles.tabButtonActive]}
            onPress={() => setActiveTab('bhajans')}
            activeOpacity={0.85}
          >
            {activeTab === 'bhajans' ? (
              <LinearGradient
                colors={['#173D32', '#173D32']}
                style={styles.tabGradientActive}
              >
                <Text style={styles.tabTextActive}>Bhajans</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.tabTextInactive}>Bhajans</Text>
            )}
          </TouchableOpacity>

          <View style={styles.tabDivider} />

          {/* Tab 2: Harathis */}
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'harathis' && styles.tabButtonActive]}
            onPress={() => setActiveTab('harathis')}
            activeOpacity={0.85}
          >
            {activeTab === 'harathis' ? (
              <LinearGradient
                colors={['#173D32', '#173D32']}
                style={styles.tabGradientActive}
              >
                <Text style={styles.tabTextActive}>Harathis</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.tabTextInactive}>Harathis</Text>
            )}
          </TouchableOpacity>

          <View style={styles.tabDivider} />

          {/* Tab 3: Songs */}
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'songs' && styles.tabButtonActive]}
            onPress={() => setActiveTab('songs')}
            activeOpacity={0.85}
          >
            {activeTab === 'songs' ? (
              <LinearGradient
                colors={['#173D32', '#173D32']}
                style={styles.tabGradientActive}
              >
                <Text style={styles.tabTextActive}>Songs</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.tabTextInactive}>Songs</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* =========================================================================
          DEVOTIONAL MUSIC CARDS LIST + TEMPLE BOTTOM ARTWORK
         ========================================================================= */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          activeTrack && { paddingBottom: 130 }, // Space for Mini-Player
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardsContainer}>
          {currentTrackList.map((track) => {
            const isThisPlaying = activeTrack?.id === track.id && isPlaying;
            const isThisSelected = activeTrack?.id === track.id;

            return (
              <TouchableOpacity
                key={track.id}
                style={[
                  styles.musicCard,
                  isThisSelected && styles.musicCardSelected,
                ]}
                activeOpacity={0.88}
                onPress={() => handlePlayTrack(track)}
              >
                {/* Left: Deity Artwork */}
                <View style={styles.cardImageContainer}>
                  <Image source={track.image} style={styles.cardImage} resizeMode="cover" />
                  <View style={styles.cardImageBorder} />
                </View>

                {/* Center: Track Details */}
                <View style={styles.cardDetails}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {track.title}
                  </Text>
                  <Text style={styles.cardSubtitle} numberOfLines={1}>
                    {track.subtitle}
                  </Text>
                </View>

                {/* Right: Circular Maroon Play / Pause Button */}
                <TouchableOpacity
                  style={[styles.playButton, isThisPlaying && styles.playButtonPlaying]}
                  activeOpacity={0.85}
                  onPress={() => handlePlayTrack(track)}
                  accessibilityLabel={isThisPlaying ? 'Pause' : 'Play'}
                >
                  {isThisPlaying ? <PauseIcon /> : <PlayTriangleIcon />}
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Temple Illustration & Hanging Bells at Bottom */}
        <TempleBottomIllustration />
      </ScrollView>

      {/* =========================================================================
          MINI PLAYER: Floating docked bar above bottom navigation bar
         ========================================================================= */}
      {activeTrack && (
        <View style={styles.miniPlayerContainer}>
          {/* Progress Line on top of mini player */}
          <View style={styles.miniProgressRail}>
            <View
              style={[
                styles.miniProgressFill,
                { width: `${Math.min(100, miniProgressRatio * 100)}%` },
              ]}
            />
          </View>

          <LinearGradient
            colors={['#0C251E', '#173D32', '#173D32']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.miniPlayerBody}
          >
            {/* Thumbnail */}
            <Image source={activeTrack.image} style={styles.miniThumbnail} resizeMode="cover" />

            {/* Title & Duration */}
            <TouchableOpacity
              style={styles.miniDetails}
              onPress={() => {
                if (activeTrack.lyricsSnippet) {
                  setLyricsModalVisible(true);
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.miniTitle} numberOfLines={1}>
                {activeTrack.title}
              </Text>
              <Text style={styles.miniDuration}>
                {formatTime(currentProgressSeconds)} / {activeTrack.durationFormatted}
                {activeTrack.lyricsSnippet ? ' • Tap for lyrics' : ''}
              </Text>
            </TouchableOpacity>

            {/* Play/Pause Button */}
            <TouchableOpacity
              style={styles.miniPlayButton}
              onPress={() => setIsPlaying((prev) => !prev)}
              activeOpacity={0.8}
            >
              {isPlaying ? <PauseIcon /> : <PlayTriangleIcon />}
            </TouchableOpacity>

            {/* Next Track Button */}
            <TouchableOpacity
              style={styles.miniNextButton}
              onPress={handleNextTrack}
              activeOpacity={0.8}
              accessibilityLabel="Next Track"
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Polygon points="5,4 15,12 5,20" fill="#FFD700" />
                <Rect x="17" y="4" width="3" height="16" rx="1" fill="#FFD700" />
              </Svg>
            </TouchableOpacity>

            {/* Close / Dismiss Button */}
            <TouchableOpacity
              style={styles.miniCloseButton}
              onPress={() => {
                setIsPlaying(false);
                setActiveTrack(null);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.miniCloseText}>✕</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}

      {/* =========================================================================
          LYRICS PREVIEW MODAL
         ========================================================================= */}
      <Modal
        visible={lyricsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setLyricsModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{activeTrack?.title} — Lyrics</Text>
              <TouchableOpacity
                onPress={() => setLyricsModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.lyricsScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.lyricsBodyText}>{activeTrack?.lyricsSnippet}</Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.modalDismissButton}
              onPress={() => setLyricsModalVisible(false)}
            >
              <Text style={styles.modalDismissText}>Close</Text>
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
    backgroundColor: '#173D32',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFF6E6',
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // Header styles
  header: {
    height: Platform.OS === 'ios' ? 96 : (StatusBar.currentHeight || 20) + 64,
    paddingTop: Platform.OS === 'ios' ? 38 : StatusBar.currentHeight || 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    position: 'relative',
    zIndex: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: '#E2AD43',
  },
  headerBackButton: {
    position: 'absolute',
    left: 14,
    top: Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight || 18) + 16,
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 12,
  },
  headerTitleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFDF8',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  headerRightOrnament: {
    position: 'absolute',
    right: 4,
    top: 2,
  },
  filigreeTopLeft: {
    position: 'absolute',
    left: 4,
    top: 2,
  },

  // Lotus Ornament
  lotusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },
  lotusLine: {
    width: 36,
    height: 1,
    backgroundColor: '#E2AD43',
    marginHorizontal: 8,
    opacity: 0.8,
  },

  // Category Tabs Wrapper
  tabBarWrapper: {
    backgroundColor: '#FFF6E6',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF0D4',
    borderRadius: 25,
    padding: 3,
    borderWidth: 1,
    borderColor: '#E8CA94',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
  },
  tabButtonActive: {
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  tabGradientActive: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  tabTextInactive: {
    color: '#0C251E',
    fontSize: 14,
    fontWeight: '600',
  },
  tabDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#E4BD70',
    opacity: 0.6,
  },

  // Cards List
  cardsContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  musicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9EF',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#E7C992',
    padding: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  musicCardSelected: {
    borderColor: '#173D32',
    backgroundColor: '#FFF5E4',
  },
  cardImageContainer: {
    width: 66,
    height: 66,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 14,
    backgroundColor: '#0C251E',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImageBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#DFA62E',
  },
  cardDetails: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 8,
  },
  cardTitle: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 16,
    fontWeight: '700',
    color: '#0C251E',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6A4E46',
    fontWeight: '500',
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#173D32',
    borderWidth: 1.8,
    borderColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  playButtonPlaying: {
    paddingLeft: 0,
    backgroundColor: '#173D32',
  },

  // Temple Bottom Illustration
  templeIllustrationContainer: {
    marginTop: 10,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    minHeight: 110,
  },
  hangingBellLeft: {
    position: 'absolute',
    left: 20,
    top: 0,
    zIndex: 2,
  },
  hangingBellRight: {
    position: 'absolute',
    right: 20,
    top: 0,
    zIndex: 2,
  },

  // Mini Player
  miniPlayerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10,
  },
  miniProgressRail: {
    height: 3,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
  },
  miniPlayerBody: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2AD43',
  },
  miniThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
    marginRight: 10,
  },
  miniDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  miniTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFDF8',
  },
  miniDuration: {
    fontSize: 11.5,
    color: '#FFD700',
    marginTop: 2,
  },
  miniPlayButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#173D32',
    borderWidth: 1.5,
    borderColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    paddingLeft: 2,
  },
  miniNextButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  miniCloseButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniCloseText: {
    color: '#FFFDF8',
    fontSize: 12,
    fontWeight: '700',
  },

  // Lyrics Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFDF8',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 18,
    paddingBottom: 32,
    paddingHorizontal: 20,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#173D32',
    flex: 1,
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0E6D2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#173D32',
  },
  lyricsScroll: {
    maxHeight: 280,
    marginBottom: 16,
  },
  lyricsBodyText: {
    fontSize: 15,
    lineHeight: 26,
    color: '#0C251E',
    fontWeight: '500',
    textAlign: 'center',
  },
  modalDismissButton: {
    backgroundColor: '#173D32',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalDismissText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
});

