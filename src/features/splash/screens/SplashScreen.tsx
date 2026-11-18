import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { StorageService, MobileScreen } from '../../../services/storageService';
import { ApiService } from '../../../services/api';
import { useBranding } from '../../../services/brandingService';
import { SplashLoadingIndicator } from '../components/SplashLoadingIndicator';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// High-fidelity multi-layer visual assets
const SCENIC_BACKGROUND = require('../../../../assets/splash_scenery_img3.jpg');
const AYYAPPA_FOREGROUND = require('../../../../assets/splash_ayyappa_foreground.png');

interface SplashScreenProps {
  onFinish: (targetScreen?: MobileScreen) => void;
}

// Delicate Golden Divider with Central Diamond
const GoldDivider = ({ width = 140, diamondSize = 10 }: { width?: number; diamondSize?: number }) => (
  <View style={[styles.dividerRow, { width }]}>
    <View style={styles.goldDividerLine} />
    <Svg width={diamondSize} height={diamondSize} viewBox="0 0 12 12" fill="none">
      <Path d="M6 1 L11 6 L6 11 L1 6 Z" fill="#F5C451" stroke="#E7B844" strokeWidth={0.8} />
      <Circle cx="6" cy="6" r="1.2" fill="#FFF8E8" />
    </Svg>
    <View style={styles.goldDividerLine} />
  </View>
);

// Sweeping Golden Flourish beneath Application Name
const GoldTitleFlourish = () => (
  <Svg width={230} height={14} viewBox="0 0 230 14" fill="none" style={styles.flourishSvg}>
    <Path
      d="M12 7 C55 12 90 3 105 7 M125 7 C140 3 175 12 218 7"
      stroke="#F5C451"
      strokeWidth={1.3}
      strokeLinecap="round"
    />
    <Path d="M115 2 L120 7 L115 12 L110 7 Z" fill="#F5C451" />
    <Circle cx="103" cy="7" r="1.5" fill="#F5C451" />
    <Circle cx="127" cy="7" r="1.5" fill="#F5C451" />
  </Svg>
);

// Subtle Mandala Outline Artwork for Bottom
const BottomMandala = () => (
  <View style={styles.mandalaWrapper} pointerEvents="none">
    <Svg width={SCREEN_WIDTH} height={120} viewBox="0 0 360 120" fill="none">
      {/* Center Grand Mandala Arc */}
      <Path
        d="M180 120 C180 80 145 50 110 50 C75 50 40 80 40 120 M180 120 C180 80 215 50 250 50 C285 50 320 80 320 120"
        stroke="#E7B844"
        strokeWidth={0.8}
        strokeOpacity={0.22}
      />
      <Path
        d="M180 120 C180 95 155 75 130 75 C105 75 80 95 80 120 M180 120 C180 95 205 75 230 75 C255 75 280 95 280 120"
        stroke="#E7B844"
        strokeWidth={0.6}
        strokeOpacity={0.18}
      />
      {/* Intricate Sacred Petals */}
      <Path
        d="M180 70 C170 55 190 55 180 70 M150 80 C140 68 160 68 150 80 M210 80 C200 68 220 68 210 80"
        stroke="#F5C451"
        strokeWidth={0.9}
        strokeOpacity={0.24}
      />
      {/* Bottom Corner Flourishes */}
      <Path
        d="M-20 120 C10 80 50 90 60 120 M380 120 C350 80 310 90 300 120"
        stroke="#E7B844"
        strokeWidth={0.8}
        strokeOpacity={0.20}
      />
      <Circle cx="180" cy="50" r="2.5" fill="#F5C451" fillOpacity={0.3} />
      <Circle cx="150" cy="62" r="1.8" fill="#F5C451" fillOpacity={0.25} />
      <Circle cx="210" cy="62" r="1.8" fill="#F5C451" fillOpacity={0.25} />
    </Svg>
  </View>
);

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const { branding } = useBranding();
  const [resolvedTarget, setResolvedTarget] = useState<MobileScreen>('welcome');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isMounted = true;

    // Smooth subtle entrance fade for layered devotion
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    async function initializeApplication() {
      const startTime = Date.now();
      let target: MobileScreen = 'onboarding';

      try {
        // Step 1: Restore persistent navigation & authentication state
        const restored = await StorageService.restoreState();

        if (restored.currentUser) {
          // Authenticated devotee: check profile completion
          if (
            !restored.currentUser?.profileOnboardingStatus ||
            restored.currentUser.profileOnboardingStatus === 'PENDING'
          ) {
            target = 'complete_profile';
          } else {
            target = (restored.initialScreen as MobileScreen) || 'home';
          }
        } else {
          // Unauthenticated or first-time devotees strictly start with Onboarding
          target = 'onboarding';
        }

        // Step 2: Parallel background config check (non-blocking)
        try {
          ApiService.getActiveSplash(Platform.OS).catch(() => {});
        } catch {}

      } catch (err) {
        console.log('Startup initialization notice (safe fallback):', err);
        target = 'welcome';
      }

      if (isMounted) {
        setResolvedTarget(target);
      }

      // Step 3: Respect minimum devotional splash duration (~3.2 seconds)
      // Allows smooth live loading rotation and complete visual experience
      const elapsed = Date.now() - startTime;
      const minDuration = 3200;
      const remainingTime = Math.max(0, minDuration - elapsed);

      setTimeout(() => {
        if (isMounted) {
          onFinish(target);
        }
      }, remainingTime);
    }

    initializeApplication();

    return () => {
      isMounted = false;
    };
  }, [onFinish, fadeAnim]);

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* ================= LAYER 1: SCENIC TEMPLE & MOUNTAIN BACKGROUND ================= */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Image
          source={SCENIC_BACKGROUND}
          style={styles.scenicBackgroundImage}
          resizeMode="cover"
        />

        {/* Deep Devotional Forest Green Gradient Overlay matching Image 1 */}
        <LinearGradient
          colors={[
            'rgba(0, 45, 39, 0.75)',     // Top region dark forest green
            'rgba(0, 40, 34, 0.25)',     // Middle sky & mountain transparency
            'rgba(0, 35, 29, 0.55)',     // Subtle vignette behind idol pedestal
            'rgba(0, 31, 27, 0.94)',     // Lower title region deep emerald
            '#001F1B',                   // Bottom deep green-black canvas
          ]}
          locations={[0, 0.28, 0.55, 0.76, 1]}
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      {/* ================= LAYER 2: BOTTOM MANDALA DECORATION ================= */}
      <BottomMandala />

      {/* ================= LAYER 3: SACRED DEVOTIONAL CONTENT ================= */}
      <SafeAreaView style={styles.safeContentContainer}>
        {/* TOP SACRED HEADER */}
        <View style={styles.topHeaderSection}>
          {/* Golden Om Symbol flanked by delicate curves */}
          <View style={styles.omRow}>
            <View style={styles.omFlankLeft} />
            <Text style={styles.omSymbolText}>ॐ</Text>
            <View style={styles.omFlankRight} />
          </View>

          {/* Sacred Invocation Text: 🙏 SWAMIYE SARANAM AYYAPPA 🙏 */}
          <Text style={styles.invocationText}>
            🙏  SWAMIYE SARANAM AYYAPPA  🙏
          </Text>

          {/* Golden Divider */}
          <GoldDivider width={150} diamondSize={11} />
        </View>

        {/* MIDDLE: LORD AYYAPPA FOREGROUND ARTWORK */}
        <View style={styles.deityArtworkContainer}>
          <Image
            source={AYYAPPA_FOREGROUND}
            style={styles.deityImage}
            resizeMode="contain"
          />
        </View>

        {/* LOWER MIDDLE: BRANDING & APPLICATION TITLE */}
        <View style={styles.brandingSection}>
          {/* Golden Serif Application Title: Saranam Ayyappa */}
          <Text style={styles.brandTitleText}>{branding.title}</Text>

          {/* Decorative Golden Sweeping Flourish */}
          <GoldTitleFlourish />

          {/* Subtitle: YOUR DEVOTIONAL COMPANION */}
          <Text style={styles.subtitleText}>
            {branding.tagline ? branding.tagline.toUpperCase() : 'YOUR DEVOTIONAL COMPANION'}
          </Text>

          {/* Thin Gold Divider */}
          <GoldDivider width={120} diamondSize={9} />
        </View>

        {/* DYNAMIC LIVE ROTATING GOLD LOADING INDICATOR */}
        <View style={styles.loadingSection}>
          <SplashLoadingIndicator
            size={SCREEN_HEIGHT < 700 ? 42 : 46}
            strokeWidth={3.4}
            color="#F5C451"
            label="Loading..."
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B542C', // Pearl Green
    position: 'relative',
    overflow: 'hidden',
  },

  // --- Background Scenery Styling ---
  scenicBackgroundImage: {
    width: '100%',
    height: '100%',
    opacity: 0.7, // 70% opacity
    // Position scenic landscape slightly rightward to showcase illuminated temple stairs
    transform: [{ scale: 1.08 }, { translateX: -8 }],
  },

  // --- Safe Content Layout ---
  safeContentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 16) + 4 : 8,
    paddingBottom: Math.max(18, SCREEN_HEIGHT * 0.025),
    zIndex: 2,
  },

  // --- Top Sacred Header ---
  topHeaderSection: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 4,
  },
  omRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  omFlankLeft: {
    width: 22,
    height: 1,
    backgroundColor: '#E7B844',
    marginRight: 8,
    opacity: 0.8,
  },
  omFlankRight: {
    width: 22,
    height: 1,
    backgroundColor: '#E7B844',
    marginLeft: 8,
    opacity: 0.8,
  },
  omSymbolText: {
    fontSize: SCREEN_HEIGHT < 700 ? 28 : 32,
    fontWeight: '700',
    color: '#F5C451',
    lineHeight: SCREEN_HEIGHT < 700 ? 32 : 36,
    textShadowColor: 'rgba(245, 196, 81, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  invocationText: {
    fontFamily: Platform.select({
      ios: 'Poppins-Bold',
      android: 'Poppins_700Bold',
      web: 'Poppins, sans-serif',
      default: 'Poppins_700Bold',
    }),
    fontSize: SCREEN_HEIGHT < 700 ? 12 : 13.5,
    fontWeight: '700',
    color: '#FFF8E8',
    letterSpacing: 1.8,
    textAlign: 'center',
    marginVertical: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.65)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // --- Divider Styling ---
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  goldDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E7B844',
    opacity: 0.7,
    marginHorizontal: 6,
  },

  // --- Lord Ayyappa Artwork Area ---
  deityArtworkContainer: {
    width: SCREEN_WIDTH * 0.88,
    height: SCREEN_HEIGHT < 700 ? SCREEN_HEIGHT * 0.38 : SCREEN_HEIGHT * 0.41,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  deityImage: {
    width: '100%',
    height: '100%',
  },

  // --- Branding Section ---
  brandingSection: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 2,
  },
  brandTitleText: {
    fontFamily: Platform.select({
      ios: 'Poppins-Bold',
      android: 'Poppins_700Bold',
      web: 'Poppins, sans-serif',
      default: 'Poppins_700Bold',
    }),
    fontSize: SCREEN_HEIGHT < 700 ? 31 : 35,
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#F5C451',
    letterSpacing: 0.4,
    textAlign: 'center',
    textShadowColor: 'rgba(245, 196, 81, 0.42)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    marginBottom: 1,
  },
  flourishSvg: {
    marginVertical: 4,
  },
  subtitleText: {
    fontFamily: Platform.select({
      ios: 'Poppins-Regular',
      android: 'Poppins_400Regular',
      web: 'Poppins, sans-serif',
      default: 'Poppins_400Regular',
    }),
    fontSize: SCREEN_HEIGHT < 700 ? 11 : 12.5,
    fontWeight: '600',
    color: '#FFF8E8',
    letterSpacing: 2.8,
    textAlign: 'center',
    marginTop: 3,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // --- Loading Section ---
  loadingSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minHeight: 70,
    zIndex: 5,
  },

  // --- Bottom Mandala Artwork ---
  mandalaWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
});
