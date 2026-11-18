import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  SafeAreaView,
  Platform,
  Share,
  Dimensions,
  Animated,
  Modal,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { ApiService } from '../../../services/api';
import { StorageService } from '../../../services/storageService';
import { useBranding } from '../../../services/brandingService';
import { SupportedLanguage, PanchangamData, DeityItem } from '../../../types';
import {
  PoojaVidhanamIcon,
  AstothramsIcon,
  SlokasIcon,
  BhajansIcon,
  HarathisIcon,
  LiveStreamsIcon,
  PanchangamIcon,
  TemplesIcon,
  DonationsIcon,
  FoodDonationIcon,
  KuthuVilakkuIcon,
  HamburgerIcon,
  NotificationBellIcon,
} from '../../../components/common/DevotionalIcons';
import { DevotionalShortcuts } from '../components/DevotionalShortcuts';
import { TodaysPanchangamCard } from '../components/TodaysPanchangamCard';
import { FeaturedTemplesSection } from '../components/FeaturedTemplesSection';
import { DailyInspirationSection } from '../components/DailyInspirationSection';
import { AnnadanamSupportSection } from '../components/AnnadanamSupportSection';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_MARGIN = 12;
const BANNER_WIDTH = SCREEN_WIDTH - BANNER_MARGIN * 2;
const BANNER_HEIGHT = SCREEN_WIDTH < 380 ? 240 : 252;

// 1. Approved Golden Hanging Deepam Brand Icon (Traditional Temple Hanging Lamp)
const HeaderHangingDeepamIcon = ({ width = 26, height = 34 }: { width?: number; height?: number }) => (
  <Svg width={width} height={height} viewBox="0 0 28 38" fill="none">
    {/* Hanging Ring & Chain */}
    <Circle cx="14" cy="3" r="2" stroke="#E7B844" strokeWidth="1.5" />
    <Path d="M14 5V11" stroke="#E7B844" strokeWidth="1.6" strokeLinecap="round" />

    {/* Upper Decorative Canopy */}
    <Path
      d="M7 14C7 11.5 10 10.5 14 10.5C18 10.5 21 11.5 21 14C21 15 19 16 14 16C9 16 7 15 7 14Z"
      fill="#F4C75F"
    />
    <Path d="M11 11H17" stroke="#FFE9A0" strokeWidth="1" strokeLinecap="round" />

    {/* Central Bell Body */}
    <Path
      d="M11 16C10 19 8.5 21 7 23C10 24 18 24 21 23C19.5 21 18 19 17 16H11Z"
      fill="#E7B844"
    />
    <Rect x="8" y="22.5" width="12" height="2" rx="1" fill="#C5932B" />

    {/* Diya Bowl (Oil Basin) */}
    <Path
      d="M4 25.5C4 29 8 32 14 32C20 32 24 29 24 25.5H4Z"
      fill="#E7B844"
    />
    <Path
      d="M6 25.5C8 28 11 29.5 14 29.5C17 29.5 20 28 22 25.5"
      stroke="#FFE599"
      strokeWidth="1.2"
      strokeLinecap="round"
    />

    {/* Lower Droplet Finial */}
    <Path d="M14 32V35.5" stroke="#E7B844" strokeWidth="1.5" strokeLinecap="round" />
    <Circle cx="14" cy="36" r="1.3" fill="#F4C75F" />

    {/* Sacred Glowing Flame */}
    <Path
      d="M14 17C14 17 11.5 21 11.5 23C11.5 24.4 12.6 25.5 14 25.5C15.4 25.5 16.5 24.4 16.5 23C16.5 21 14 17 14 17Z"
      fill="#FFF0A0"
    />
    <Path
      d="M14 19.5C14 19.5 12.8 21.8 12.8 23C12.8 23.8 13.3 24.5 14 24.5C14.7 24.5 15.2 23.8 15.2 23C15.2 21.8 14 19.5 14 19.5Z"
      fill="#FF7700"
    />
  </Svg>
);

// Header Decorative Corner Flourishes
const HeaderCornerFlourishLeft = () => (
  <Svg width={28} height={24} viewBox="0 0 28 24" fill="none" style={styles.headerFlourishLeft}>
    <Path d="M0 0C8 1 15 5 19 13C21 17 23 21 27 23" stroke="#E7B844" strokeWidth="1.2" strokeLinecap="round" opacity={0.35} />
    <Circle cx="4" cy="4" r="1.4" fill="#E7B844" opacity={0.4} />
    <Circle cx="10" cy="8" r="1.2" fill="#E7B844" opacity={0.35} />
  </Svg>
);

const HeaderCornerFlourishRight = () => (
  <Svg width={28} height={24} viewBox="0 0 28 24" fill="none" style={styles.headerFlourishRight}>
    <Path d="M28 0C20 1 13 5 9 13C7 17 5 21 1 23" stroke="#E7B844" strokeWidth="1.2" strokeLinecap="round" opacity={0.35} />
    <Circle cx="24" cy="4" r="1.4" fill="#E7B844" opacity={0.4} />
    <Circle cx="18" cy="8" r="1.2" fill="#E7B844" opacity={0.35} />
  </Svg>
);

// 2. Approved Header Search Icon
const HeaderSearchIcon = ({ size = 20, color = '#FFF9ED' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16.5 16.5L21.5 21.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// 3. Approved Header Notification Bell Icon
const HeaderBellIcon = ({ size = 21, color = '#FFF9ED' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21S18 15 18 8"
      stroke={color}
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M13.73 21A2 2 0 0 1 10.27 21"
      stroke={color}
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 4. Approved Header Profile User Icon
const HeaderProfileIcon = ({ size = 22, color = '#FFF9ED' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="4.2" stroke={color} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    <Path
      d="M4.5 20.5C4.5 16.5 8 15.5 12 15.5C16 15.5 19.5 16.5 19.5 20.5"
      stroke={color}
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 5. Approved Hero Gold Divider Ornament
const HeroGoldDivider = () => (
  <View style={styles.heroDividerContainer}>
    <View style={styles.heroDividerLine} />
    <Svg width={20} height={12} viewBox="0 0 20 12" fill="none">
      <Path d="M10 1C11.2 3.5 13.5 4.5 16 5C14.2 5.5 12.5 5.5 10 5C7.5 5.5 5.8 5.5 4 5C6.5 4.5 8.8 3.5 10 1Z" fill="#E7B844" />
      <Circle cx="10" cy="6" r="1.6" fill="#F4C75F" />
      <Path d="M10 11C11.2 8.5 13.5 7.5 16 7C14.2 6.5 12.5 6.5 10 7C7.5 6.5 5.8 6.5 4 7C6.5 7.5 8.8 8.5 10 11Z" fill="#E7B844" />
    </Svg>
    <View style={styles.heroDividerLine} />
  </View>
);

interface Props {
  currentLanguage: SupportedLanguage;
  currentDeity?: DeityItem | null;
  onOpenLanguageScreen: () => void;
  onOpenAboutScreen: () => void;
  onOpenContactScreen?: () => void;
  onOpenDetail?: (id: string, title: string) => void;
  onOpenPanchangam?: () => void;
  onOpenFestivals?: () => void;
  onNavigateToCategories?: () => void;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
  onOpenSearch?: () => void;
}

const HOME_HERO_SCENIC_BG = require('../../../../assets/home_hero_scenic_bg.jpg');
const AYYAPPA_HERO_FOREGROUND = require('../../../../assets/ayyappa_hero_foreground.png');
const AYYAPPA_HERO_IMAGE = require('../../../../assets/deities/ayyappa.jpg');
const AYYAPPA_EMBLEM = require('../../../assets/images/ayyappa_emblem_approved.png');

// Devotional greetings mapping based on selected deity
const DEITY_GREETINGS: Record<string, string> = {
  ayyappa: 'Om Swamiye Saranam Ayyappa 🙏',
  shiva: 'Om Namah Shivaya 🙏',
  ganesha: 'Om Gam Ganapataye Namaha 🙏',
  venkateswara: 'Govinda Govinda • Om Namo Venkatesaya 🙏',
  krishna: 'Hare Krishna Hare Rama 🙏',
  rama: 'Jai Sri Ram • Sita Rama Chandra Murthi 🙏',
  durga: 'Om Sri Durgayei Namaha 🙏',
  hanuman: 'Jai Bajrang Bali • Jai Sri Ram 🙏',
};

// Devotional 10 Services Configuration (Matching approved order)
const HOME_SERVICES = [
  { id: 'pooja-vidhanam', key: 'poojaVidhanam', title: 'Pooja\nVidhanam', icon: 'pooja-vidhanam', displayOrder: 1 },
  { id: 'astothrams', key: 'astothrams', title: 'Astothrams', icon: 'astothrams', displayOrder: 2 },
  { id: 'slokas', key: 'slokas', title: 'Slokas', icon: 'slokas', displayOrder: 3 },
  { id: 'bhajans', key: 'bhajans', title: 'Bhajans', icon: 'bhajans', displayOrder: 4 },
  { id: 'harathis', key: 'harathis', title: 'Harathis\n& Songs', icon: 'harathis', displayOrder: 5 },
  { id: 'live-streams', key: 'liveStreams', title: 'Live\nStreams', icon: 'live-streams', displayOrder: 6 },
  { id: 'panchangam', key: 'panchangam', title: 'Panchangam', icon: 'panchangam', displayOrder: 7 },
  { id: 'temples', key: 'temples', title: 'Temples\nin India', icon: 'temples', displayOrder: 8 },
  { id: 'donations', key: 'donations', title: 'Donations', icon: 'donations', displayOrder: 9 },
  { id: 'food-donation', key: 'foodDonation', title: 'Food\nDonation', icon: 'food-donation', displayOrder: 10 },
];

const SERVICE_ICON_MAP: Record<string, React.FC<any>> = {
  'pooja-vidhanam': PoojaVidhanamIcon,
  'astothrams': AstothramsIcon,
  'slokas': SlokasIcon,
  'bhajans': BhajansIcon,
  'harathis': HarathisIcon,
  'live-streams': LiveStreamsIcon,
  'panchangam': PanchangamIcon,
  'temples': TemplesIcon,
  'donations': DonationsIcon,
  'food-donation': FoodDonationIcon,
};

const getServiceIcon = (id: string, iconKey?: string) => {
  return SERVICE_ICON_MAP[iconKey || id] || SERVICE_ICON_MAP[id] || PoojaVidhanamIcon;
};

export const HomeScreen: React.FC<Props> = ({
  currentLanguage = 'en',
  currentDeity,
  onOpenLanguageScreen,
  onOpenAboutScreen,
  onOpenContactScreen,
  onOpenDetail,
  onOpenPanchangam,
  onOpenFestivals,
  onNavigateToCategories,
  onOpenNotifications,
  onOpenProfile,
  onOpenSearch,
}) => {
  const { branding, getLogoSource, onLogoError } = useBranding();
  const [activeDeity, setActiveDeity] = useState<DeityItem | null>(currentDeity || null);
  const [panchangam, setPanchangam] = useState<PanchangamData | null>(null);
  const [tickerText, setTickerText] = useState<string>('Today: Ayyappa Abhishekam Live at Sabarimala - 6:00 PM');
  const [appTitle, setAppTitle] = useState<string>(branding.title || 'Thathwamasi Ayyappa');
  const [activeBannerIndex, setActiveBannerIndex] = useState<number>(0);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [services, setServices] = useState<Array<{ id: string; key: string; title: string; icon?: string; displayOrder: number }>>(HOME_SERVICES);

  // Modals for Drawer Menu & Notifications
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);

  // Load Data
  const loadDashboardData = async () => {
    try {
      setAppTitle(ApiService.getAppTitle(currentLanguage));

      // 1. Load Panchangam (Dynamic)
      const pData = await ApiService.getPanchangam(currentLanguage);
      setPanchangam(pData);

      // 2. Load Ticker Mantra
      const tickerRes = await ApiService.getTickerMantra(currentLanguage);
      if (tickerRes?.text) {
        setTickerText(tickerRes.text);
      }

      // 3. Load Stored Deity if not passed via props
      if (!currentDeity) {
        const storedDeity = await StorageService.getStoredDeity();
        if (storedDeity) {
          setActiveDeity(storedDeity);
        }
      }

      // 4. Load 10 Devotional Services dynamically from DB via API response
      try {
        const dbServices = await ApiService.getHomeServices(currentLanguage);
        if (Array.isArray(dbServices) && dbServices.length > 0) {
          setServices(dbServices);
        }
      } catch (err) {
        console.warn('Home services DB fetch notice:', err);
      }
    } catch {
      // Offline fallback already embedded in services
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [currentLanguage]);

  useEffect(() => {
    if (currentDeity) {
      setActiveDeity(currentDeity);
    }
  }, [currentDeity]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  // Determine Greeting based on active deity
  const deityKey = (activeDeity?.id || activeDeity?.name || 'ayyappa').toString().toLowerCase();
  const greetingText = DEITY_GREETINGS[deityKey] || 'Om Swamiye Saranam Ayyappa 🙏';

  // Share handler
  const handleShareApp = async () => {
    try {
      await Share.share({
        title: 'Saranam Ayyappa',
        message: 'Swamiye Saranam Ayyappa! Download Saranam Ayyappa app for daily Panchangam, Pooja Vidhanam, Astothrams, and live temple darshan.',
      });
    } catch {}
  };

  // Service item tap handler
  const handleServicePress = (service: { id: string; title: string }) => {
    if (service.id === 'panchangam') {
      onOpenPanchangam?.();
    } else {
      onOpenDetail?.(service.id, service.title.replace('\n', ' '));
    }
  };

  // Dynamic Date string formatting
  const todayDateStr = panchangam
    ? `${panchangam.vaaram ? panchangam.vaaram.slice(0, 3) + ', ' : ''}${panchangam.dayNumber || ''} ${panchangam.monthText || ''} ${panchangam.year || new Date().getFullYear()}`
    : new Date().toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

  // Calculate responsive 5-column card dimensions
  const cardWidth = Math.floor((SCREEN_WIDTH - 24 - 24) / 5);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#003D2E" translucent={false} />

      {/* =========================================================
          1. APPROVED DEVOTIONAL APP HEADER (IMAGE 1 SPECIFICATION)
         ========================================================= */}
      <SafeAreaView style={styles.safeHeaderArea}>
        <LinearGradient
          colors={['#003D2E', '#002F25']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerBarGradient}
        >
          <HeaderCornerFlourishLeft />
          <HeaderCornerFlourishRight />

          {/* Left: Dynamic Brand Logo from API + Brand Column */}
          <TouchableOpacity
            style={styles.headerBrandWrapper}
            activeOpacity={0.8}
            onPress={() => setDrawerOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Open Menu"
          >
            <View style={styles.headerDeepamIconWrapper}>
              {branding?.logoUrl ? (
                <Image
                  source={getLogoSource(AYYAPPA_EMBLEM)}
                  defaultSource={AYYAPPA_EMBLEM}
                  style={styles.headerLogoImage}
                  onError={onLogoError}
                  resizeMode="contain"
                />
              ) : (
                <HeaderHangingDeepamIcon width={26} height={34} />
              )}
            </View>
            <View style={styles.headerBrandTextCol}>
              <Text style={styles.headerAppTitle}>{branding.title}</Text>
              <View style={styles.headerSubtitleRow}>
                <View style={styles.headerSubLine} />
                <Text style={styles.headerAppSubtitle}>
                  {branding.tagline ? branding.tagline.toUpperCase() : 'DEVOTIONAL APP'}
                </Text>
                <View style={styles.headerSubLine} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Right: Search, Notification Bell, Devotee Profile Action Icons */}
          <View style={styles.headerActionsWrapper}>
            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={() => (onOpenSearch ? onOpenSearch() : onNavigateToCategories?.())}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Search devotional services"
            >
              <HeaderSearchIcon size={21} color="#FFF9ED" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={() => (onOpenNotifications ? onOpenNotifications() : setNotificationsOpen(true))}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Open Notifications"
            >
              <View>
                <HeaderBellIcon size={21} color="#FFF9ED" />
                <View style={styles.notificationDot} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={() => (onOpenProfile ? onOpenProfile() : setDrawerOpen(true))}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Open Devotee Profile"
            >
              <HeaderProfileIcon size={22} color="#FFF9ED" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Fine Gold Divider along the bottom edge of Header */}
        <View style={styles.headerGoldBottomBorder} />
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#003D2E', '#E7B844']}
            tintColor="#003D2E"
          />
        }
      >
        {/* =========================================================
            2. ROUNDED DEVOTIONAL HERO BANNER (APPROVED REFERENCE)
           ========================================================= */}
        <View style={styles.panoramicHeroContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            decelerationRate="fast"
            snapToInterval={BANNER_WIDTH}
            snapToAlignment="center"
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const offset = e.nativeEvent.contentOffset.x;
              const index = Math.round(offset / BANNER_WIDTH);
              setActiveBannerIndex(index);
            }}
          >
            {/* Slide 1: Master Approved Hero (Swamiye Saranam Ayyappa!) */}
            <View style={[styles.heroSlideWrapper, { width: BANNER_WIDTH }]}>
              {/* Layer 1: Scenic Sunrise, Misty Mountains & Temple Background */}
              <Image
                source={HOME_HERO_SCENIC_BG}
                style={styles.heroScenicBgImage}
                resizeMode="cover"
              />

              {/* Layer 2: Deep Emerald Readability Vignette Gradient */}
              <LinearGradient
                colors={['rgba(0, 47, 37, 0.96)', 'rgba(0, 47, 37, 0.85)', 'rgba(0, 47, 37, 0.42)', 'rgba(0, 47, 37, 0.0)']}
                locations={[0, 0.46, 0.72, 1.0]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.heroGradientOverlay}
              />

              {/* Layer 3: Foreground Lord Ayyappa Deity Artwork */}
              <View style={styles.heroDeityForegroundWrapper} pointerEvents="none">
                <Image
                  source={AYYAPPA_HERO_FOREGROUND}
                  style={styles.heroDeityForegroundImage}
                  resizeMode="contain"
                />
              </View>

              {/* Layer 4: Devotional Left-Aligned Typography & Gold CTA Button */}
              <View style={styles.heroContentLeft}>
                <Text style={styles.heroGreetingTop}>{branding.heroGreetingTop || 'Thathwamasi'}</Text>
                <Text style={styles.heroGreetingMid}>{branding.heroGreetingMid || 'Ayyappa'}</Text>
                {branding.heroGreetingBot ? (
                  <Text style={styles.heroGreetingBot}>{branding.heroGreetingBot}</Text>
                ) : null}

                <HeroGoldDivider />

                <Text style={styles.heroDevotionalDesc} numberOfLines={3}>
                  Your daily poojas, panchangam, temples, and spiritual guidance for a deeper connection with Lord Ayyappa.
                </Text>

                <TouchableOpacity
                  style={styles.heroExploreBtn}
                  activeOpacity={0.85}
                  onPress={() => (onNavigateToCategories ? onNavigateToCategories() : onOpenDetail?.('pooja-vidhanam', 'Mandala Pooja Special'))}
                  accessibilityRole="button"
                  accessibilityLabel="Explore devotional services"
                >
                  <LinearGradient
                    colors={['#FFE28C', '#F4C451', '#D69826']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.heroExploreGradient}
                  >
                    <Text style={styles.heroExploreText}>Explore Now  →</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {/* Slide 2: Mandala Pooja Season Special */}
            <View style={[styles.heroSlideWrapper, { width: BANNER_WIDTH }]}>
              <Image source={HOME_HERO_SCENIC_BG} style={styles.heroScenicBgImage} resizeMode="cover" />
              <LinearGradient
                colors={['rgba(0, 47, 37, 0.96)', 'rgba(0, 47, 37, 0.85)', 'rgba(0, 47, 37, 0.42)', 'rgba(0, 47, 37, 0.0)']}
                locations={[0, 0.46, 0.72, 1.0]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.heroGradientOverlay}
              />
              <View style={styles.heroDeityForegroundWrapper} pointerEvents="none">
                <Image source={AYYAPPA_HERO_FOREGROUND} style={styles.heroDeityForegroundImage} resizeMode="contain" />
              </View>
              <View style={styles.heroContentLeft}>
                <Text style={styles.heroGreetingTop}>Mandala</Text>
                <Text style={styles.heroGreetingMid}>Pooja</Text>
                <Text style={styles.heroGreetingBot}>Special!</Text>
                <HeroGoldDivider />
                <Text style={styles.heroDevotionalDesc} numberOfLines={3}>
                  41-day sacred Mandala Deeksha, Vratham guidelines, Irumudi Kattu vidhanam & daily live prayers.
                </Text>
                <TouchableOpacity
                  style={styles.heroExploreBtn}
                  activeOpacity={0.85}
                  onPress={() => onOpenDetail?.('pooja-vidhanam', 'Mandala Pooja Special')}
                >
                  <LinearGradient
                    colors={['#FFE28C', '#F4C451', '#D69826']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.heroExploreGradient}
                  >
                    <Text style={styles.heroExploreText}>View Pooja  →</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {/* Slide 3: Sabarimala Daily Live Darshan */}
            <View style={[styles.heroSlideWrapper, { width: BANNER_WIDTH }]}>
              <Image source={HOME_HERO_SCENIC_BG} style={styles.heroScenicBgImage} resizeMode="cover" />
              <LinearGradient
                colors={['rgba(0, 47, 37, 0.96)', 'rgba(0, 47, 37, 0.85)', 'rgba(0, 47, 37, 0.42)', 'rgba(0, 47, 37, 0.0)']}
                locations={[0, 0.46, 0.72, 1.0]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.heroGradientOverlay}
              />
              <View style={styles.heroDeityForegroundWrapper} pointerEvents="none">
                <Image source={AYYAPPA_HERO_FOREGROUND} style={styles.heroDeityForegroundImage} resizeMode="contain" />
              </View>
              <View style={styles.heroContentLeft}>
                <Text style={styles.heroGreetingTop}>Sabarimala</Text>
                <Text style={styles.heroGreetingMid}>Live</Text>
                <Text style={styles.heroGreetingBot}>Darshan</Text>
                <HeroGoldDivider />
                <Text style={styles.heroDevotionalDesc} numberOfLines={3}>
                  Watch live daily Abhishekam, Deeparadhana, and Harivarasanam directly from Sannidhanam.
                </Text>
                <TouchableOpacity
                  style={styles.heroExploreBtn}
                  activeOpacity={0.85}
                  onPress={() => onOpenDetail?.('live-streams', 'Live Darshan')}
                >
                  <LinearGradient
                    colors={['#FFE28C', '#F4C451', '#D69826']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.heroExploreGradient}
                  >
                    <Text style={styles.heroExploreText}>Watch Live  →</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* 3 Pagination Indicators */}
          <View style={styles.heroPaginationRow}>
            <View style={[styles.heroDot, activeBannerIndex === 0 && styles.heroDotActive]} />
            <View style={[styles.heroDot, activeBannerIndex === 1 && styles.heroDotActive]} />
            <View style={[styles.heroDot, activeBannerIndex === 2 && styles.heroDotActive]} />
          </View>
        </View>

        {/* =========================================================
            3. CURVED IVORY CONTAINER (SEAMLESS DEVOTIONAL TRANSITION)
           ========================================================= */}
        <View style={styles.curvedTransitionContainer}>
          {/* SECTION 1: SIX DEVOTIONAL SHORTCUTS (3x2 GRID) */}
          <DevotionalShortcuts
            language={currentLanguage}
            onOpenDetail={onOpenDetail}
            onOpenPanchangam={onOpenPanchangam}
            onNavigateToCategories={onNavigateToCategories}
          />

          {/* SECTION 2: TODAY'S PANCHANGAM CARD (DYNAMIC DATE, TITHI, NAKSHATRAM, AUSPICIOUS TIME) */}
          <TodaysPanchangamCard
            language={currentLanguage}
            panchangam={panchangam}
            onOpenPanchangam={onOpenPanchangam}
          />

          {/* SECTION 3: FEATURED TEMPLES CAROUSEL */}
          <FeaturedTemplesSection
            language={currentLanguage}
            onOpenDetail={onOpenDetail}
          />

          {/* SECTION 4: DAILY SPIRITUAL INSPIRATION */}
          <DailyInspirationSection
            language={currentLanguage}
            onOpenDetail={onOpenDetail}
          />

          {/* SECTION 5: ANNADANAM & TEMPLE SUPPORT */}
          <AnnadanamSupportSection
            language={currentLanguage}
            onOpenDetail={onOpenDetail}
          />
        </View>
      </ScrollView>

      {/* =========================================================
          MODAL A: HAMBURGER SIDE DRAWER MENU
         ========================================================= */}
      <Modal visible={drawerOpen} transparent animationType="fade">
        <TouchableOpacity
          style={styles.drawerBackdrop}
          activeOpacity={1}
          onPress={() => setDrawerOpen(false)}
        >
          <View style={styles.drawerPanel}>
            {/* Drawer Header */}
            <LinearGradient
              colors={['#173D32', '#0C251E']}
              style={styles.drawerHeader}
            >
              <Text style={styles.drawerHeaderTitle}>{branding.title}</Text>
              <Text style={styles.drawerHeaderSubtitle}>
                — 🪷 {greetingText} —
              </Text>
            </LinearGradient>

            {/* Drawer Menu Items */}
            <View style={styles.drawerMenuContent}>
              <TouchableOpacity
                style={styles.drawerMenuItem}
                onPress={() => {
                  setDrawerOpen(false);
                  onOpenLanguageScreen();
                }}
              >
                <Text style={styles.drawerMenuIcon}>🌐</Text>
                <Text style={styles.drawerMenuText}>Choose Language</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerMenuItem}
                onPress={() => {
                  setDrawerOpen(false);
                  onOpenPanchangam?.();
                }}
              >
                <Text style={styles.drawerMenuIcon}>📅</Text>
                <Text style={styles.drawerMenuText}>Today's Panchangam</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerMenuItem}
                onPress={() => {
                  setDrawerOpen(false);
                  onOpenFestivals?.();
                }}
              >
                <Text style={styles.drawerMenuIcon}>🪔</Text>
                <Text style={styles.drawerMenuText}>
                  {currentLanguage === 'te'
                    ? 'పండుగలు & విశేష దినాలు'
                    : currentLanguage === 'kn'
                    ? 'ಹಬ್ಬಗಳು & ವಿಶೇಷ ದಿನಗಳು'
                    : currentLanguage === 'ta'
                    ? 'திருவிழாக்கள் & சிறப்பு நாட்கள்'
                    : currentLanguage === 'hi'
                    ? 'त्यौहार एवं विशेष दिन'
                    : 'Festivals & Sacred Days'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerMenuItem}
                onPress={() => {
                  setDrawerOpen(false);
                  onNavigateToCategories?.();
                }}
              >
                <Text style={styles.drawerMenuIcon}>📑</Text>
                <Text style={styles.drawerMenuText}>All Categories</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerMenuItem}
                onPress={() => {
                  setDrawerOpen(false);
                  onOpenAboutScreen();
                }}
              >
                <Text style={styles.drawerMenuIcon}>ℹ️</Text>
                <Text style={styles.drawerMenuText}>About Saranam Ayyappa</Text>
              </TouchableOpacity>

              {onOpenContactScreen && (
                <TouchableOpacity
                  style={styles.drawerMenuItem}
                  onPress={() => {
                    setDrawerOpen(false);
                    onOpenContactScreen();
                  }}
                >
                  <Text style={styles.drawerMenuIcon}>📞</Text>
                  <Text style={styles.drawerMenuText}>Contact & Support</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.drawerMenuItem}
                onPress={() => {
                  setDrawerOpen(false);
                  handleShareApp();
                }}
              >
                <Text style={styles.drawerMenuIcon}>📤</Text>
                <Text style={styles.drawerMenuText}>Share Application</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.drawerCloseBtn}
              onPress={() => setDrawerOpen(false)}
            >
              <Text style={styles.drawerCloseText}>✕ Close Menu</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* =========================================================
          MODAL B: NOTIFICATIONS POPUP
         ========================================================= */}
      <Modal visible={notificationsOpen} transparent animationType="slide">
        <View style={styles.drawerBackdrop}>
          <View style={styles.notificationsCard}>
            <View style={styles.notificationsHeader}>
              <Text style={styles.notificationsTitle}>🔔 Spiritual Announcements</Text>
              <TouchableOpacity onPress={() => setNotificationsOpen(false)}>
                <Text style={styles.drawerCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.notificationItem}>
                <Text style={styles.notificationItemTitle}>Mandala Kalam Special Pooja</Text>
                <Text style={styles.notificationItemDesc}>
                  Daily evening Deeparadhana and Harivarasanam stream live from 6:30 PM.
                </Text>
                <Text style={styles.notificationItemTime}>Today • 6:30 PM</Text>
              </View>

              <View style={styles.notificationItem}>
                <Text style={styles.notificationItemTitle}>Auspicious Timings for Devotees</Text>
                <Text style={styles.notificationItemDesc}>
                  Abhijit Muhurtham from 11:45 AM to 12:35 PM. Ideal for Stotra recitations.
                </Text>
                <Text style={styles.notificationItemTime}>Today</Text>
              </View>

              <View style={styles.notificationItem}>
                <Text style={styles.notificationItemTitle}>Daily Annadanam Location</Text>
                <Text style={styles.notificationItemDesc}>
                  Free holy meals being served for Ayyappa devotees near Pampa & Sannidhanam.
                </Text>
                <Text style={styles.notificationItemTime}>All Day</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAF5EB',
  },
  safeHeaderArea: {
    backgroundColor: '#003D2E',
  },
  headerBarGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  headerFlourishLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  headerFlourishRight: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  headerBrandWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerDeepamIconWrapper: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogoImage: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  headerBrandTextCol: {
    justifyContent: 'center',
  },
  headerAppTitle: {
    fontFamily: Platform.select({
      ios: 'Poppins-Bold',
      android: 'Poppins_700Bold',
      web: 'Poppins, sans-serif',
      default: 'Poppins_700Bold',
    }),
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF9ED',
    letterSpacing: 0.3,
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 1,
  },
  headerSubLine: {
    width: 12,
    height: 1,
    backgroundColor: '#E7B844',
  },
  headerAppSubtitle: {
    fontFamily: Platform.select({
      ios: 'Poppins-SemiBold',
      android: 'Poppins_600SemiBold',
      web: 'Poppins, sans-serif',
      default: 'Poppins_600SemiBold',
    }),
    fontSize: 8.5,
    fontWeight: '700',
    color: '#E7B844',
    letterSpacing: 1.6,
  },
  headerActionsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerGoldBottomBorder: {
    height: 1.5,
    backgroundColor: '#E7B844',
  },
  notificationDot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D92E32',
    borderWidth: 1.2,
    borderColor: '#003D2E',
  },

  scrollContent: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 24,
  },

  // Rounded Devotional Hero Banner (Approved Reference)
  panoramicHeroContainer: {
    marginHorizontal: BANNER_MARGIN,
    marginTop: 10,
    marginBottom: 6,
    height: BANNER_HEIGHT,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E7B844',
    overflow: 'hidden',
    backgroundColor: '#1B542C', // Pearl Green
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  heroSlideWrapper: {
    position: 'relative',
    overflow: 'hidden',
  },
  heroScenicBgImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0.7, // 70% opacity
  },
  heroGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroDeityForegroundWrapper: {
    position: 'absolute',
    right: -4,
    bottom: 0,
    width: BANNER_WIDTH * 0.52,
    height: '98%',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  heroDeityForegroundImage: {
    width: '100%',
    height: '100%',
  },
  heroContentLeft: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: BANNER_WIDTH * 0.52,
    justifyContent: 'flex-start',
    zIndex: 10,
  },
  heroGreetingTop: {
    fontFamily: Platform.select({
      ios: 'Poppins-Bold',
      android: 'Poppins_700Bold',
      web: 'Poppins, sans-serif',
      default: 'Poppins_700Bold',
    }),
    fontSize: 21,
    fontWeight: '800',
    color: '#FFF8E8',
    letterSpacing: 0.2,
    lineHeight: 25,
  },
  heroGreetingMid: {
    fontFamily: Platform.select({
      ios: 'Poppins-Bold',
      android: 'Poppins_700Bold',
      web: 'Poppins, sans-serif',
      default: 'Poppins_700Bold',
    }),
    fontSize: 21,
    fontWeight: '800',
    color: '#FFF8E8',
    letterSpacing: 0.2,
    lineHeight: 25,
  },
  heroGreetingBot: {
    fontFamily: Platform.select({
      ios: 'Poppins-Bold',
      android: 'Poppins_800ExtraBold',
      web: 'Poppins, sans-serif',
      default: 'Poppins_800ExtraBold',
    }),
    fontSize: 23,
    fontWeight: '900',
    color: '#F4C451',
    letterSpacing: 0.3,
    lineHeight: 28,
  },
  heroDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 4,
    width: 140,
  },
  heroDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E7B844',
    opacity: 0.75,
  },
  heroDevotionalDesc: {
    fontFamily: Platform.select({
      ios: 'Poppins-Regular',
      android: 'Poppins_400Regular',
      web: 'Poppins, sans-serif',
      default: 'Poppins_400Regular',
    }),
    fontSize: 10,
    color: '#EDE8DE',
    lineHeight: 14,
    marginBottom: 8,
  },
  heroExploreBtn: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  heroExploreGradient: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroExploreText: {
    fontFamily: Platform.select({
      ios: 'Poppins-Bold',
      android: 'Poppins_700Bold',
      web: 'Poppins, sans-serif',
      default: 'Poppins_700Bold',
    }),
    fontSize: 11.5,
    fontWeight: '800',
    color: '#002F25',
  },
  heroPaginationRow: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    zIndex: 10,
  },
  heroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  heroDotActive: {
    backgroundColor: '#F4C451',
    width: 18,
    borderRadius: 3,
  },

  // Curved Ivory Transition Container (Frames content directly below Hero)
  curvedTransitionContainer: {
    backgroundColor: '#FFF8EC',
    marginTop: 0,
    paddingHorizontal: 0,
    paddingTop: 6,
    paddingBottom: 24,
  },

  // Ticker
  tickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF8',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6C898',
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginVertical: 6,
    shadowColor: '#071914',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tickerIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#173D32',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  tickerTempleIcon: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  tickerTextWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  tickerText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#173D32',
  },

  // Services Grid
  servicesGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
    marginVertical: 6,
  },
  serviceCard: {
    backgroundColor: '#FFFDF8',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#E8D0A8',
    paddingVertical: 8,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 76,
    shadowColor: '#071914',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1.5,
  },
  serviceIconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  serviceCardText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0C251E',
    textAlign: 'center',
    lineHeight: 12,
    paddingHorizontal: 2,
  },

  // Today's Panchangam Card
  panchangamCardWrapper: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 6,
    shadowColor: '#071914',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2.5,
  },
  panchangamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#DFA62E',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  panchangamLeftIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6C898',
    marginRight: 10,
  },
  panchangamDeityThumb: {
    width: '100%',
    height: '100%',
  },
  panchangamCenterContent: {
    flex: 1,
    justifyContent: 'center',
  },
  panchangamHeading: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 14,
    fontWeight: '700',
    color: '#173D32',
    marginBottom: 2,
  },
  panchangamDateText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0C251E',
    marginBottom: 2,
  },
  panchangamDetailsText: {
    fontSize: 11,
    color: '#345147',
    fontWeight: '500',
  },
  panchangamRightLamp: {
    marginLeft: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Modals Styles
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 8, 8, 0.65)',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  drawerPanel: {
    width: '78%',
    height: '100%',
    backgroundColor: '#FFFDF8',
    borderRightWidth: 1.5,
    borderRightColor: '#DFA62E',
  },
  drawerHeader: {
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'ios' ? 48 : 36,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#DFA62E',
  },
  drawerHeaderTitle: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF8EB',
    marginBottom: 4,
  },
  drawerHeaderSubtitle: {
    fontSize: 12,
    color: '#F9DCAC',
    fontWeight: '600',
  },
  drawerMenuContent: {
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  drawerMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginVertical: 2,
  },
  drawerMenuIcon: {
    fontSize: 18,
    marginRight: 14,
  },
  drawerMenuText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0C251E',
  },
  drawerCloseBtn: {
    marginTop: 'auto',
    padding: 18,
    borderTopWidth: 1,
    borderTopColor: '#E6C898',
    alignItems: 'center',
  },
  drawerCloseText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#173D32',
  },

  notificationsCard: {
    width: '90%',
    maxHeight: '80%',
    alignSelf: 'center',
    backgroundColor: '#FFFDF8',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#DFA62E',
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  notificationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E6C898',
    marginBottom: 10,
  },
  notificationsTitle: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 16.5,
    fontWeight: '700',
    color: '#173D32',
  },
  notificationItem: {
    backgroundColor: '#FFF8EB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6C898',
    padding: 12,
    marginVertical: 6,
  },
  notificationItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#173D32',
    marginBottom: 4,
  },
  notificationItemDesc: {
    fontSize: 12.5,
    color: '#345147',
    lineHeight: 18,
    marginBottom: 4,
  },
  notificationItemTime: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9E7A58',
  },
});
