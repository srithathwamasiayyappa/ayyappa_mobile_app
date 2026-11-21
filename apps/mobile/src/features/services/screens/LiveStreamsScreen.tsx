import React, { useState, useEffect } from 'react';
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
  Share,
  Alert,
  BackHandler,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect, Polygon, Line } from 'react-native-svg';
import { SupportedLanguage } from '../../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  currentLanguage: SupportedLanguage;
  currentDeity?: any;
  onBack: () => void;
  onOpenTempleDetail?: (templeId: string, templeName: string) => void;
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

// Red Broadcast Antenna Icon: ((•))
const BroadcastAntennaIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" fill="#C62828" />
    <Path
      d="M8.5 8.5 A5 5 0 0 0 8.5 15.5"
      stroke="#C62828"
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Path
      d="M15.5 8.5 A5 5 0 0 1 15.5 15.5"
      stroke="#C62828"
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Path
      d="M5.5 5.5 A9 9 0 0 0 5.5 18.5"
      stroke="#C62828"
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Path
      d="M18.5 5.5 A9 9 0 0 1 18.5 18.5"
      stroke="#C62828"
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

// Mute / Unmute Volume Icon
const VolumeIcon = ({ isMuted }: { isMuted: boolean }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="#FFFDF8" />
    {isMuted ? (
      <>
        <Line x1="23" y1="9" x2="17" y2="15" stroke="#FF5252" strokeWidth={2} strokeLinecap="round" />
        <Line x1="17" y1="9" x2="23" y2="15" stroke="#FF5252" strokeWidth={2} strokeLinecap="round" />
      </>
    ) : (
      <>
        <Path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="#FFFDF8" strokeWidth={2} strokeLinecap="round" />
        <Path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="#FFFDF8" strokeWidth={2} strokeLinecap="round" />
      </>
    )}
  </Svg>
);

// Fullscreen Icon
const FullscreenIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" stroke="#FFFDF8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export type StreamStatus = 'live' | 'scheduled' | 'offline';

export interface TempleStreamItem {
  id: string;
  templeId: string;
  title: string;
  subtitle: string;
  status: StreamStatus;
  statusLabel: string;
  is24x7: boolean;
  deityId: string;
  location: string;
  timings: string;
  upcomingPoojas: string;
  description: string;
  imageOffsetTop: number;
}

// Master Temple Streams Catalog
const MASTER_STREAMS: TempleStreamItem[] = [
  {
    id: 'sabarimala-live',
    templeId: 'sabarimala',
    title: 'Sabarimala Temple',
    subtitle: 'Live Darshan',
    status: 'live',
    statusLabel: 'LIVE',
    is24x7: false,
    deityId: 'ayyappa',
    location: 'Periyar Tiger Reserve, Pathanamthitta, Kerala',
    timings: 'Morning: 3:00 AM - 1:00 PM | Evening: 3:00 PM - 11:00 PM',
    upcomingPoojas: 'Evening Deeparadhana at 6:30 PM • Harivarasanam at 10:50 PM',
    description:
      'Direct live darshan from the sacred Sannidhanam of Lord Ayyappa, the golden sanctum sanctorum, and the Holy 18 Steps (Pathinettam Padi). Broadcast courtesy of Travancore Devaswom Board.',
    imageOffsetTop: -40,
  },
  {
    id: 'tirumala-live',
    templeId: 'tirumala',
    title: 'Tirumala Sri Venkateswara',
    subtitle: 'Live • 24/7',
    status: 'live',
    statusLabel: 'Live • 24/7',
    is24x7: true,
    deityId: 'venkateswara',
    location: 'Tirumala Hills, Tirupati, Andhra Pradesh',
    timings: '24 Hours Continuous Live Darshan & Daily Sevas',
    upcomingPoojas: 'Sahasra Deepalankarana Seva at 5:30 PM • Srivari Kalyanotsavam',
    description:
      'Official SVBC 24/7 continuous broadcast of Lord Venkateswara at Ananda Nilayam, golden gopuram, and morning Suprabhata Seva from the Seven Hills.',
    imageOffsetTop: -140,
  },
  {
    id: 'srisailam-live',
    templeId: 'srisailam',
    title: 'Srisailam Mallikarjuna',
    subtitle: 'Live • 24/7',
    status: 'live',
    statusLabel: 'Live • 24/7',
    is24x7: true,
    deityId: 'shiva',
    location: 'Nallamala Hills, Andhra Pradesh',
    timings: 'Sarva Darshanam: 6:00 AM - 10:00 PM',
    upcomingPoojas: 'Maha Mangala Harathi at 5:30 PM • Ekantha Seva at 9:30 PM',
    description:
      'Sacred live streaming from the 2nd Jyotirlinga and Ashtadasa Shakti Peetham of Lord Mallikarjuna Swamy and Goddess Bhramaramba Devi.',
    imageOffsetTop: -175,
  },
  {
    id: 'kashi-live',
    templeId: 'kashi-vishwanath',
    title: 'Kashi Vishwanath',
    subtitle: 'Live • 24/7',
    status: 'live',
    statusLabel: 'Live • 24/7',
    is24x7: true,
    deityId: 'shiva',
    location: 'Varanasi, Uttar Pradesh',
    timings: 'Temple open 3:00 AM - 11:00 PM',
    upcomingPoojas: 'Dashashwamedh Ghat Maha Ganga Harathi at 6:45 PM',
    description:
      'Holy live broadcast from the sanctum sanctorum of the Kashi Vishwanath Jyotirlinga and the divine evening Ganga Harathi.',
    imageOffsetTop: -212,
  },
  {
    id: 'meenakshi-live',
    templeId: 'meenakshi-amman',
    title: 'Madurai Meenakshi Amman',
    subtitle: 'Scheduled: 06:00 PM',
    status: 'scheduled',
    statusLabel: 'Scheduled: 06:00 PM Harathi',
    is24x7: false,
    deityId: 'devi',
    location: 'Madurai, Tamil Nadu',
    timings: 'Morning: 5:00 AM - 12:30 PM | Evening: 4:00 PM - 10:00 PM',
    upcomingPoojas: 'Sayaratchai Pooja at 6:00 PM • Palliyarai Pooja at 9:30 PM',
    description:
      'Live broadcast of Goddess Meenakshi and Lord Sundareswarar evening golden palanquin procession and special archana.',
    imageOffsetTop: -140,
  },
  {
    id: 'guruvayur-live',
    templeId: 'guruvayur',
    title: 'Guruvayur Sri Krishna',
    subtitle: 'Scheduled: 05:30 PM',
    status: 'scheduled',
    statusLabel: 'Scheduled: 05:30 PM Deeparadhana',
    is24x7: false,
    deityId: 'krishna',
    location: 'Guruvayur, Thrissur, Kerala',
    timings: '3:00 AM - 1:30 PM | 4:30 PM - 9:15 PM',
    upcomingPoojas: 'Deeparadhana at 6:00 PM • Athazha Pooja at 8:00 PM',
    description:
      'Divine darshan of Lord Guruvayurappan adorned with sacred sandalwood paste and golden jewelry.',
    imageOffsetTop: -175,
  },
];

const UI_TRANSLATIONS: Record<string, {
  headerTitle: string;
  liveNow: string;
  moreLiveStreams: string;
  liveDarshan: string;
  watchLive: string;
  offlineMsg: string;
  viewTemple: string;
  shareMessage: string;
}> = {
  en: {
    headerTitle: 'Live Streams',
    liveNow: 'Live Now',
    moreLiveStreams: 'More Live Streams',
    liveDarshan: 'Live Darshan',
    watchLive: 'Watch Live',
    offlineMsg: 'Live darshan is currently offline for this temple. Next broadcast scheduled soon.',
    viewTemple: 'View Temple Details & History',
    shareMessage: 'Watch sacred live temple darshan on Saranam Ayyappa App! Swamiye Saranam Ayyappa.',
  },
  te: {
    headerTitle: 'లైవ్ స్ట్రీమ్స్',
    liveNow: 'ఇప్పుడు లైవ్',
    moreLiveStreams: 'మరిన్ని లైవ్ స్ట్రీమ్స్',
    liveDarshan: 'లైవ్ దర్శనం',
    watchLive: 'లైవ్ చూడండి',
    offlineMsg: 'ప్రస్తుతం ఈ ఆలయం లైవ్ దర్శనం అందుబాటులో లేదు. తదుపరి పూజా ప్రసారం త్వరలో.',
    viewTemple: 'ఆలయ వివరాలు & చరిత్ర చూడండి',
    shareMessage: 'శరణం అయ్యప్ప యాప్‌లో ప్రత్యక్ష ఆలయ దర్శనం చూడండి! స్వామియే శరణం అయ్యప్ప.',
  },
  ta: {
    headerTitle: 'நேரலை தரிசனம்',
    liveNow: 'இப்போது நேரலை',
    moreLiveStreams: 'மேலும் நேரலைகள்',
    liveDarshan: 'நேரலை தரிசனம்',
    watchLive: 'நேரலை பார்க்க',
    offlineMsg: 'தற்போது நேரலை தரிசனம் இல்லை. அடுத்த பூஜை ஒளிபரப்பு விரைவில்.',
    viewTemple: 'கோவில் தகவல்கள் & வரலாறு',
    shareMessage: 'சரணம் ஐயப்பா செயலியில் நேரலை கோவில் தரிசனம் பாருங்கள்! சுவாமியே சரணம் ஐயப்பா.',
  },
  kn: {
    headerTitle: 'ನೇರ ಪ್ರಸಾರ',
    liveNow: 'ಈಗ ನೇರ ಪ್ರಸಾರ',
    moreLiveStreams: 'ಇನ್ನಷ್ಟು ನೇರ ಪ್ರಸಾರಗಳು',
    liveDarshan: 'ನೇರ ದರ್ಶನ',
    watchLive: 'ನೇರ ವೀಕ್ಷಿಸಿ',
    offlineMsg: 'ಪ್ರಸ್ತುತ ಈ ದೇವಾಲಯದ ನೇರ ದರ್ಶನ ಲಭ್ಯವಿಲ್ಲ. ಮುಂದಿನ ಪೂಜೆ ಶೀಘ್ರದಲ್ಲೇ.',
    viewTemple: 'ದೇವಾಲಯದ ವಿವರಗಳು ಮತ್ತು ಇತಿಹಾಸ',
    shareMessage: 'ಶರಣಂ ಅಯ್ಯಪ್ಪ ಆಪ್‌ನಲ್ಲಿ ನೇರ ದೇವಾಲಯ ದರ್ಶನ ವೀಕ್ಷಿಸಿ! ಸ್ವಾಮಿಯೇ ಶರಣಂ ಅಯ್ಯಪ್ಪ.',
  },
  hi: {
    headerTitle: 'लाइव दर्शन',
    liveNow: 'अभी लाइव',
    moreLiveStreams: 'अन्य लाइव दर्शन',
    liveDarshan: 'लाइव दर्शन',
    watchLive: 'लाइव देखें',
    offlineMsg: 'वर्तमान में इस मंदिर का लाइव दर्शन उपलब्ध नहीं है। अगली आरती जल्द ही।',
    viewTemple: 'मंदिर विवरण एवं इतिहास देखें',
    shareMessage: 'शरणम अय्यप्पा ऐप पर पवित्र मंदिर का सीधा प्रसारण देखें! स्वामीये शरणम् अय्यप्पा.',
  },
  ml: {
    headerTitle: 'തത്സമയ ദർശനം',
    liveNow: 'ഇപ്പോൾ ലൈവ്',
    moreLiveStreams: 'കൂടുതൽ തത്സമയങ്ങൾ',
    liveDarshan: 'തത്സമയ ദർശനം',
    watchLive: 'തത്സമയം കാണുക',
    offlineMsg: 'തത്സമയ ദർശനം ഇപ്പോൾ ലഭ്യമല്ല. അടുത്ത പൂജാ സംപ്രേഷണം ഉടൻ.',
    viewTemple: 'ക്ഷേത്ര വിവരങ്ങളും ചരിത്രവും',
    shareMessage: 'ശരണം അയ്യപ്പ ആപ്പിൽ തത്സമയ ക്ഷേത്ര ദർശനം കാണുക! സ്വാമിയേ ശരണം അയ്യപ്പ.',
  },
};

export const LiveStreamsScreen: React.FC<Props> = ({
  currentLanguage,
  currentDeity,
  onBack,
  onOpenTempleDetail,
}) => {
  const [selectedStream, setSelectedStream] = useState<TempleStreamItem | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const ui = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS.en;

  // Android Back Button handler
  useEffect(() => {
    const onHardwareBack = () => {
      if (isPlayerOpen) {
        setIsPlayerOpen(false);
        return true;
      }
      onBack();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
    return () => sub.remove();
  }, [isPlayerOpen, onBack]);

  // Featured stream is Sabarimala Temple by default, or prioritized by active deity
  const featuredStream = MASTER_STREAMS[0]; // Sabarimala Temple
  const moreStreams = MASTER_STREAMS.slice(1);

  const handleOpenPlayer = (stream: TempleStreamItem) => {
    setSelectedStream(stream);
    setIsPlayerOpen(true);
    setIsPlaying(true);
  };

  const handleShareStream = async (stream: TempleStreamItem) => {
    try {
      await Share.share({
        title: `${stream.title} Live Darshan`,
        message: `${stream.title} — ${stream.subtitle}\n${stream.location}\n\n${ui.shareMessage}`,
      });
    } catch {}
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#173D32" />

      {/* =========================================================================
          HEADER: Deep Maroon Gradient + Corner Ornaments + Back Arrow
         ========================================================================= */}
      <LinearGradient
        colors={['#0C251E', '#173D32', '#173D32']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={onBack}
          activeOpacity={0.8}
          accessibilityLabel="Back"
        >
          <BackArrowIcon />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{ui.headerTitle}</Text>

        <View style={styles.headerRightOrnament}>
          <HeaderCornerFiligree flipped />
        </View>
        <View style={styles.filigreeTopLeft}>
          <HeaderCornerFiligree />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* =========================================================================
            SECTION 1: "Live Now" with Red Antenna Broadcast Icon
           ========================================================================= */}
        <View style={styles.sectionHeaderRow}>
          <BroadcastAntennaIcon />
          <Text style={styles.sectionHeadingLiveNow}>{ui.liveNow}</Text>
        </View>

        {/* =========================================================================
            FEATURED STREAM BANNER: Sabarimala Temple + Golden Roof + LIVE Badge
           ========================================================================= */}
        <TouchableOpacity
          style={styles.featuredBannerContainer}
          activeOpacity={0.92}
          onPress={() => handleOpenPlayer(featuredStream)}
        >
          {/* Background Sabarimala Temple Image */}
          <View style={styles.featuredImageWrapper}>
            <Image
              source={require('../../../../assets/live_streams_ref.png')}
              style={styles.featuredImageCrop}
              resizeMode="cover"
            />
            {/* Dark Gradient Overlay for readable text */}
            <LinearGradient
              colors={['transparent', 'rgba(15, 3, 5, 0.45)', 'rgba(10, 2, 4, 0.92)']}
              style={styles.featuredGradientOverlay}
            />
          </View>

          {/* Overlays */}
          <View style={styles.featuredTextOverlay}>
            <View style={styles.featuredTitleContainer}>
              <Text style={styles.featuredTempleName}>{featuredStream.title}</Text>
              <Text style={styles.featuredSubtitle}>{featuredStream.subtitle}</Text>
            </View>

            {/* Red LIVE Badge */}
            <View style={styles.liveBadgeRed}>
              <Text style={styles.liveBadgeText}>LIVE</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* =========================================================================
            SECTION 2: "More Live Streams"
           ========================================================================= */}
        <View style={styles.moreSectionHeaderRow}>
          <Text style={styles.sectionHeadingMore}>{ui.moreLiveStreams}</Text>
        </View>

        {/* =========================================================================
            TEMPLE BROADCAST CARDS LIST: Tirumala, Srisailam, Kashi Vishwanath...
           ========================================================================= */}
        <View style={styles.templeCardsList}>
          {moreStreams.map((stream) => {
            const isLive = stream.status === 'live';

            return (
              <TouchableOpacity
                key={stream.id}
                style={styles.templeCard}
                activeOpacity={0.88}
                onPress={() => handleOpenPlayer(stream)}
              >
                {/* Left: Temple Thumbnail */}
                <View style={styles.templeThumbnailContainer}>
                  <Image
                    source={require('../../../../assets/live_streams_ref.png')}
                    style={[
                      styles.templeThumbnailImage,
                      { top: stream.imageOffsetTop },
                    ]}
                    resizeMode="cover"
                  />
                  <View style={styles.thumbnailBorder} />
                </View>

                {/* Center: Temple Name & Status */}
                <View style={styles.templeInfoContainer}>
                  <Text style={styles.templeCardTitle} numberOfLines={1}>
                    {stream.title}
                  </Text>
                  <View style={styles.statusRow}>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: isLive ? '#C62828' : '#DFA62E' },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        { color: isLive ? '#C62828' : '#2E7561' },
                      ]}
                    >
                      {stream.statusLabel}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* =========================================================================
          LIVE STREAM VIDEO PLAYER MODAL
         ========================================================================= */}
      <Modal
        visible={isPlayerOpen}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsPlayerOpen(false)}
      >
        <SafeAreaView style={styles.playerSafeArea}>
          <StatusBar barStyle="light-content" backgroundColor="#0B0204" />

          {/* Player Header Bar */}
          <View style={styles.playerHeader}>
            <TouchableOpacity
              style={styles.playerBackBtn}
              onPress={() => setIsPlayerOpen(false)}
              activeOpacity={0.8}
            >
              <BackArrowIcon />
            </TouchableOpacity>

            <Text style={styles.playerHeaderTitle} numberOfLines={1}>
              {selectedStream?.title}
            </Text>

            <TouchableOpacity
              style={styles.playerShareBtn}
              onPress={() => selectedStream && handleShareStream(selectedStream)}
              activeOpacity={0.8}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Circle cx="18" cy="5" r="3" stroke="#FFFDF8" strokeWidth={2} />
                <Circle cx="6" cy="12" r="3" stroke="#FFFDF8" strokeWidth={2} />
                <Circle cx="18" cy="19" r="3" stroke="#FFFDF8" strokeWidth={2} />
                <Line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="#FFFDF8" strokeWidth={2} />
                <Line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="#FFFDF8" strokeWidth={2} />
              </Svg>
            </TouchableOpacity>
          </View>

          {/* Video Stream Stage (16:9 Aspect Ratio) */}
          <View style={styles.videoStage}>
            <Image
              source={require('../../../../assets/live_streams_ref.png')}
              style={[
                styles.playerVideoImage,
                { top: selectedStream ? selectedStream.imageOffsetTop * 1.5 : -50 },
              ]}
              resizeMode="cover"
            />
            <View style={styles.videoStageOverlay} />

            {/* LIVE Badge */}
            {selectedStream?.status === 'live' ? (
              <View style={styles.playerLiveBadge}>
                <View style={styles.pulsingRedDot} />
                <Text style={styles.playerLiveText}>LIVE HD</Text>
              </View>
            ) : (
              <View style={styles.playerOfflineBadge}>
                <Text style={styles.playerOfflineText}>SCHEDULED</Text>
              </View>
            )}

            {/* Center Play/Pause button */}
            <TouchableOpacity
              style={styles.playerCenterPlayButton}
              onPress={() => setIsPlaying((prev) => !prev)}
              activeOpacity={0.85}
            >
              {isPlaying ? (
                <Svg width={20} height={22} viewBox="0 0 16 18" fill="none">
                  <Rect x="2" y="1" width="4" height="16" rx="1" fill="#FFFFFF" />
                  <Rect x="10" y="1" width="4" height="16" rx="1" fill="#FFFFFF" />
                </Svg>
              ) : (
                <Svg width={22} height={24} viewBox="0 0 18 20" fill="none">
                  <Polygon points="3,1 17,10 3,19" fill="#FFFFFF" />
                </Svg>
              )}
            </TouchableOpacity>

            {/* Bottom Stream Controls Bar */}
            <View style={styles.videoControlsRow}>
              {/* Audio Mute/Unmute */}
              <TouchableOpacity
                style={styles.controlIconBtn}
                onPress={() => setIsMuted((prev) => !prev)}
              >
                <VolumeIcon isMuted={isMuted} />
              </TouchableOpacity>

              <Text style={styles.liveFeedNote}>Official Temple Broadcast</Text>

              {/* Fullscreen */}
              <TouchableOpacity
                style={styles.controlIconBtn}
                onPress={() =>
                  Alert.alert(
                    'Full Screen',
                    'Rotate your device to landscape for full screen live darshan.',
                    [{ text: 'OK' }]
                  )
                }
              >
                <FullscreenIcon />
              </TouchableOpacity>
            </View>
          </View>

          {/* Stream Information Card & Poojas */}
          <ScrollView style={styles.playerDetailsScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.playerInfoCard}>
              <Text style={styles.playerTempleTitle}>{selectedStream?.title}</Text>
              <Text style={styles.playerSubtitle}>{selectedStream?.subtitle}</Text>

              <View style={styles.detailsDivider} />

              {/* Timings */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>⏰ Darshan Hours:</Text>
                <Text style={styles.detailValue}>{selectedStream?.timings}</Text>
              </View>

              {/* Upcoming Poojas */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>🪔 Today's Poojas & Sevas:</Text>
                <Text style={styles.detailValue}>{selectedStream?.upcomingPoojas}</Text>
              </View>

              {/* Location */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>📍 Location:</Text>
                <Text style={styles.detailValue}>{selectedStream?.location}</Text>
              </View>

              <View style={styles.detailsDivider} />

              {/* Description */}
              <Text style={styles.templeDescText}>{selectedStream?.description}</Text>

              {/* Quick Action: View Temple Profile */}
              <TouchableOpacity
                style={styles.viewTempleProfileBtn}
                onPress={() => {
                  if (selectedStream && onOpenTempleDetail) {
                    setIsPlayerOpen(false);
                    onOpenTempleDetail(selectedStream.templeId, selectedStream.title);
                  } else {
                    Alert.alert(selectedStream?.title || 'Temple', selectedStream?.description);
                  }
                }}
                activeOpacity={0.88}
              >
                <LinearGradient
                  colors={['#173D32', '#173D32']}
                  style={styles.viewTempleGradient}
                >
                  <Text style={styles.viewTempleBtnText}>{ui.viewTemple}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Quick Switch to other Temple Streams */}
            <View style={styles.otherStreamsContainer}>
              <Text style={styles.otherStreamsHeading}>Switch Temple Darshan:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalOtherScroll}>
                {MASTER_STREAMS.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.otherPillItem,
                      item.id === selectedStream?.id && styles.otherPillItemActive,
                    ]}
                    onPress={() => setSelectedStream(item)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.otherPillText,
                        item.id === selectedStream?.id && styles.otherPillTextActive,
                      ]}
                    >
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </ScrollView>
        </SafeAreaView>
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
    backgroundColor: '#FFF8EB',
  },
  scrollContent: {
    paddingBottom: 24,
  },

  // Header styles
  header: {
    height: Platform.OS === 'ios' ? 96 : (StatusBar.currentHeight || 20) + 54,
    paddingTop: Platform.OS === 'ios' ? 38 : StatusBar.currentHeight || 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    position: 'relative',
    zIndex: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: '#DFA62E',
  },
  headerBackButton: {
    position: 'absolute',
    left: 14,
    top: Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight || 18) + 12,
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 12,
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

  // "Live Now" Section Header
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  sectionHeadingLiveNow: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 18,
    fontWeight: '700',
    color: '#345147',
    marginLeft: 8,
  },

  // Featured Sabarimala Banner
  featuredBannerContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#DFA62E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    backgroundColor: '#0C251E',
  },
  featuredImageWrapper: {
    height: 190,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  featuredImageCrop: {
    width: '100%',
    height: 380,
    position: 'absolute',
    top: -55,
  },
  featuredGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  featuredTextOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  featuredTitleContainer: {
    flex: 1,
    paddingRight: 10,
  },
  featuredTempleName: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  featuredSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E8D5B5',
  },
  liveBadgeRed: {
    backgroundColor: '#C62828',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // "More Live Streams" Section Header
  moreSectionHeaderRow: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  sectionHeadingMore: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 17.5,
    fontWeight: '700',
    color: '#345147',
  },

  // Temple Cards List
  templeCardsList: {
    paddingHorizontal: 16,
  },
  templeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9F0',
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
  templeThumbnailContainer: {
    width: 86,
    height: 58,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 14,
    backgroundColor: '#0C251E',
  },
  templeThumbnailImage: {
    width: '100%',
    height: 320,
    position: 'absolute',
  },
  thumbnailBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DFA62E',
  },
  templeInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  templeCardTitle: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0C251E',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // =========================================================================
  // Video Player Modal Styles
  // =========================================================================
  playerSafeArea: {
    flex: 1,
    backgroundColor: '#0B0204',
  },
  playerHeader: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    backgroundColor: '#1E0509',
    borderBottomWidth: 1,
    borderBottomColor: '#DFA62E',
  },
  playerBackBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerHeaderTitle: {
    flex: 1,
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFDF8',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  playerShareBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Video Stage (16:9)
  videoStage: {
    width: '100%',
    height: 220,
    position: 'relative',
    backgroundColor: '#000000',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerVideoImage: {
    width: '100%',
    height: 400,
    position: 'absolute',
  },
  videoStageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
  },
  playerLiveBadge: {
    position: 'absolute',
    top: 12,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(198, 40, 40, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pulsingRedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 5,
  },
  playerLiveText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  playerOfflineBadge: {
    position: 'absolute',
    top: 12,
    left: 14,
    backgroundColor: 'rgba(180, 140, 50, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  playerOfflineText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  playerCenterPlayButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(138, 24, 37, 0.88)',
    borderWidth: 2,
    borderColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 2,
  },
  videoControlsRow: {
    position: 'absolute',
    bottom: 8,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveFeedNote: {
    color: '#E8D5B5',
    fontSize: 11,
    fontWeight: '600',
  },

  // Details Scroll inside modal
  playerDetailsScroll: {
    flex: 1,
    backgroundColor: '#FFF8EB',
  },
  playerInfoCard: {
    backgroundColor: '#FFFDF8',
    margin: 16,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#E6C687',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  playerTempleTitle: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 20,
    fontWeight: '700',
    color: '#345147',
    marginBottom: 2,
  },
  playerSubtitle: {
    fontSize: 14,
    color: '#173D32',
    fontWeight: '600',
    marginBottom: 8,
  },
  detailsDivider: {
    height: 1,
    backgroundColor: '#EAD4B0',
    marginVertical: 10,
  },
  detailRow: {
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#173D32',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    color: '#345147',
    lineHeight: 18,
  },
  templeDescText: {
    fontSize: 13.5,
    lineHeight: 20,
    color: '#345147',
    marginBottom: 14,
  },
  viewTempleProfileBtn: {
    borderRadius: 22,
    overflow: 'hidden',
    marginTop: 4,
  },
  viewTempleGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewTempleBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },

  // Quick Switch row
  otherStreamsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  otherStreamsHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#173D32',
    marginBottom: 8,
  },
  horizontalOtherScroll: {
    flexDirection: 'row',
  },
  otherPillItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#FFF0D4',
    borderWidth: 1,
    borderColor: '#DFA62E',
    marginRight: 8,
  },
  otherPillItemActive: {
    backgroundColor: '#173D32',
    borderColor: '#173D32',
  },
  otherPillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#345147',
  },
  otherPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
