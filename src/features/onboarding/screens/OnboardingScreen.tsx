import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  StatusBar,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  BackHandler,
  SafeAreaView,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { useBranding } from '../../../services/brandingService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive Dimension Metrics
const PANEL_MAX_WIDTH = Math.min(SCREEN_WIDTH * 0.93, 396);
const LOGO_HEIGHT = SCREEN_HEIGHT < 700 ? 180 : (SCREEN_HEIGHT < 820 ? 218 : 240);
const LOGO_WIDTH = Math.round(LOGO_HEIGHT * 0.93);

// Approved Official Devotional Assets
const SARANAM_BACKGROUND = require('../../../../assets/deities/deity_selection_bg.jpg');
const SARANAM_OFFICIAL_LOGO = require('../../../../assets/deities/saranam_deity_emblem.png');
const BOTTOM_GREEN_HILLS = require('../../../../assets/deities/bottom_green_hills.jpg');

interface OnboardingScreenProps {
  onFinish: () => void;
  onBackToWelcome?: () => void;
}

// ==================== SCREEN 1 ICONS (EXACT REFERENCE 1) ====================

// 1. Maladharana Icon: Mala Beads with Golden Tassel (Image 1 Row 1)
const MaladharanaIcon = () => (
  <Svg width={38} height={38} viewBox="0 0 36 36" fill="none">
    {/* Circular Mala Beads in Rich Wooden/Amber Brown */}
    <Circle cx="18" cy="14" r="9" stroke="#8C531B" strokeWidth={2.4} strokeDasharray="3.2 1.4" />
    <Circle cx="18" cy="4.8" r="1.6" fill="#A86524" />
    <Circle cx="23.5" cy="7" r="1.6" fill="#8C531B" />
    <Circle cx="26.8" cy="12.2" r="1.6" fill="#A86524" />
    <Circle cx="26.5" cy="17.8" r="1.6" fill="#8C531B" />
    <Circle cx="22" cy="21.5" r="1.6" fill="#A86524" />
    <Circle cx="12.5" cy="7" r="1.6" fill="#8C531B" />
    <Circle cx="9.2" cy="12.2" r="1.6" fill="#A86524" />
    <Circle cx="9.5" cy="17.8" r="1.6" fill="#8C531B" />
    <Circle cx="14" cy="21.5" r="1.6" fill="#A86524" />
    {/* Guru Bead / Cap */}
    <Circle cx="18" cy="23.2" r="2.2" fill="#DFA62E" stroke="#8C531B" strokeWidth={0.8} />
    {/* Golden Tassel with Sacred Threads */}
    <Path d="M18 25.4 L15 32 H21 Z" fill="#DFA62E" stroke="#C99427" strokeWidth={0.6} />
    <Path d="M18 25.5 V31.8" stroke="#9A690E" strokeWidth={0.8} />
    <Path d="M16.5 27 L16 32" stroke="#9A690E" strokeWidth={0.6} />
    <Path d="M19.5 27 L20 32" stroke="#9A690E" strokeWidth={0.6} />
  </Svg>
);

// 2. 48 Days Mandala Deeksha Icon: Calendar with Green Bar & "48" (Image 1 Row 2)
const MandalaDeekshaIcon = () => (
  <Svg width={38} height={38} viewBox="0 0 36 36" fill="none">
    {/* Calendar White Sheet */}
    <Rect x="5" y="7" width="26" height="24" rx="4.5" fill="#FFFDF8" stroke="#06452E" strokeWidth={1.8} />
    {/* Green Header Bar */}
    <Path d="M5 11.5 C5 9 6.8 7 9.2 7 H26.8 C29.2 7 31 9 31 11.5 V13.5 H5 V11.5 Z" fill="#06452E" />
    {/* Calendar Hanging Loops */}
    <Path d="M10.5 4.5 V8.5" stroke="#06452E" strokeWidth={2.4} strokeLinecap="round" />
    <Path d="M25.5 4.5 V8.5" stroke="#06452E" strokeWidth={2.4} strokeLinecap="round" />
    {/* Digit '4' in Dark Forest Green */}
    <Path
      d="M12.5 19 V23.5 H17 M17 18 V26.5"
      stroke="#06452E"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Digit '8' in Dark Forest Green */}
    <Circle cx="22.5" cy="20" r="2.4" stroke="#06452E" strokeWidth={2.2} />
    <Circle cx="22.5" cy="24.4" r="2.6" stroke="#06452E" strokeWidth={2.2} />
  </Svg>
);

// 3. Irumudi Kattu Icon: Traditional Black & Gold Irumudi Bag (Image 1 Row 3)
const IrumudiIcon = () => (
  <Svg width={38} height={38} viewBox="0 0 36 36" fill="none">
    {/* Sacred Black Pouch Body */}
    <Path
      d="M9 17 C8 24 10 30 18 30 C26 30 28 24 27 17 C26 13 23 12 18 12 C13 12 10 13 9 17 Z"
      fill="#1A1817"
      stroke="#DFA62E"
      strokeWidth={1.2}
    />
    {/* Golden Fabric Folds on Pouch Body */}
    <Path d="M11 20 Q18 24 25 20" stroke="#DFA62E" strokeWidth={1.2} opacity={0.8} />
    <Path d="M13 25 Q18 28 23 25" stroke="#DFA62E" strokeWidth={1.2} opacity={0.7} />
    {/* Golden Tie Band around Neck */}
    <Rect x="13.5" y="11.5" width="9" height="3" rx="1.5" fill="#DFA62E" stroke="#C99427" strokeWidth={0.8} />
    {/* Golden Top Knot / Sacred Pouch Head with Holy Offerings */}
    <Path
      d="M14 12 C12 8 13.5 5 18 5 C22.5 5 24 8 22 12 Z"
      fill="#F5C453"
      stroke="#DFA62E"
      strokeWidth={1.2}
    />
    <Path d="M18 5.5 V11" stroke="#9A690E" strokeWidth={1} />
    <Circle cx="18" cy="8" r="1.4" fill="#FFF4D9" />
  </Svg>
);

// ==================== SCREEN 2 ICONS (EXACT REFERENCE 2) ====================

// 4. Traditional Trek Routes Icon: Mountain Peaks with Pilgrim Trail (Image 2 Row 4)
const TrekRoutesIcon = () => (
  <Svg width={38} height={38} viewBox="0 0 36 36" fill="none">
    {/* Mountain Silhouette in Deep Forest Green */}
    <Path d="M3 26 L12 11 L18 20 L22 15 L32 26 Z" fill="rgba(6, 69, 46, 0.12)" stroke="#06452E" strokeWidth={2} strokeLinejoin="round" />
    {/* Snow/Crest Peak Highlights */}
    <Path d="M12 11 L14.5 15 L12 16.5 L9.5 15 Z" fill="#06452E" opacity={0.25} />
    <Path d="M22 15 L24 18 L22 19.2 L20 18 Z" fill="#06452E" opacity={0.25} />
    {/* Winding Trek Path in Golden Green */}
    <Path d="M12 26 Q17 22 14 18 Q16 15 18 20" stroke="#488653" strokeWidth={2.4} strokeLinecap="round" />
    {/* Walking Pilgrim Silhouette */}
    <Circle cx="9.5" cy="20.5" r="1.4" fill="#06452E" />
    <Path d="M9.5 22 V26 M8 24 H11" stroke="#06452E" strokeWidth={1.4} strokeLinecap="round" />
    <Path d="M11 21 L12 27" stroke="#06452E" strokeWidth={1} strokeLinecap="round" />
  </Svg>
);

// 5. 18 Sacred Steps Icon: Pathinettampadi Flight of Steps with Flag (Image 2 Row 5)
const SacredStepsIcon = () => (
  <Svg width={38} height={38} viewBox="0 0 36 36" fill="none">
    {/* Flight of Steps Ascending Upwards */}
    <Path
      d="M5 28 H10 V23.5 H15 V19 H20 V14.5 H25 V10 H30"
      stroke="#06452E"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Step Shading / Front Fascia */}
    <Path d="M5 28 H10 V30 H5 Z" fill="#06452E" opacity={0.4} />
    <Path d="M10 23.5 H15 V25.5 H10 Z" fill="#06452E" opacity={0.4} />
    <Path d="M15 19 H20 V21 H15 Z" fill="#06452E" opacity={0.4} />
    <Path d="M20 14.5 H25 V16.5 H20 Z" fill="#06452E" opacity={0.4} />
    {/* Saffron Flag atop Highest 18th Step */}
    <Path d="M25 10 V4" stroke="#06452E" strokeWidth={1.8} strokeLinecap="round" />
    <Path d="M25 4.5 L32 7 L25 9.5 Z" fill="#488653" stroke="#06452E" strokeWidth={0.8} />
  </Svg>
);

// 6. Sabarimala Updates Icon: Holy Bell with Radiating Waves (Image 2 Row 6)
const SabarimalaUpdatesIcon = () => (
  <Svg width={38} height={38} viewBox="0 0 36 36" fill="none">
    {/* Golden Temple Bell Body */}
    <Path
      d="M18 6 C13.5 6 11 10 11 16.5 C11 21 9 23 8 24.5 H28 C27 23 25 21 25 16.5 C25 10 22.5 6 18 6 Z"
      fill="#F5C453"
      stroke="#06452E"
      strokeWidth={1.8}
    />
    {/* Bell Hanging Ring */}
    <Circle cx="18" cy="5" r="2" stroke="#06452E" strokeWidth={1.5} />
    {/* Bell Clapper / Tong */}
    <Path d="M15.5 28 C15.5 29.5 16.6 30.5 18 30.5 C19.4 30.5 20.5 29.5 20.5 28 Z" fill="#06452E" />
    <Path d="M18 24.5 V28" stroke="#06452E" strokeWidth={1.8} />
    {/* Bell Rim Highlight */}
    <Path d="M8 24.5 H28" stroke="#C99427" strokeWidth={1.6} />
    {/* Radiating Sound / Vibration Waves */}
    <Path d="M5 14 C4 16.5 4 19.5 5 22" stroke="#8C531B" strokeWidth={1.8} strokeLinecap="round" />
    <Path d="M31 14 C32 16.5 32 19.5 31 22" stroke="#8C531B" strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

// Decorative Diamond Divider at Top of Ivory Card
const CardHeaderDiamondDivider = () => (
  <View style={styles.diamondDividerRow}>
    <View style={styles.diamondFlankLine} />
    <View style={styles.diamondCenterIcon}>
      <Svg width={18} height={14} viewBox="0 0 18 14" fill="none">
        <Path d="M9 1 L14 7 L9 13 L4 7 Z" fill="#DFA62E" />
        <Circle cx="9" cy="7" r="1.8" fill="#FFFBF2" />
        <Circle cx="2" cy="7" r="1.3" fill="#DFA62E" />
        <Circle cx="16" cy="7" r="1.3" fill="#DFA62E" />
      </Svg>
    </View>
    <View style={styles.diamondFlankLine} />
  </View>
);

// Reusable Onboarding Guide Item Row (Matches Exact Reference)
interface OnboardingGuideItemProps {
  title: string;
  description: string;
  icon: () => React.JSX.Element;
}

const OnboardingGuideItem: React.FC<OnboardingGuideItemProps> = ({
  title,
  description,
  icon: IconComponent,
}) => (
  <View style={styles.guideRowCard}>
    {/* Left: Golden Square Rounded Icon Box */}
    <View style={styles.guideIconContainer}>
      <IconComponent />
    </View>

    {/* Center: Thin Vertical Golden Line Separator */}
    <View style={styles.guideVerticalDivider} />

    {/* Right: Dark Forest Green Heading & Supporting Description */}
    <View style={styles.guideTextContainer}>
      <Text style={styles.guideTitleText} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.guideDescText} numberOfLines={2}>
        {description}
      </Text>
    </View>
  </View>
);

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onFinish,
  onBackToWelcome,
}) => {
  const { getLogoSource, onLogoError } = useBranding();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Android Back Handler
  useEffect(() => {
    const onBackPress = () => {
      if (currentPage === 1) {
        scrollViewRef.current?.scrollTo({ x: 0, animated: true });
        return true;
      }
      if (onBackToWelcome) {
        onBackToWelcome();
        return true;
      }
      return false;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [currentPage, onBackToWelcome]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / SCREEN_WIDTH);
    if (pageIndex !== currentPage && (pageIndex === 0 || pageIndex === 1)) {
      setCurrentPage(pageIndex);
    }
  };

  const handleNextFromScreen1 = () => {
    scrollViewRef.current?.scrollTo({ x: SCREEN_WIDTH, animated: true });
    setCurrentPage(1);
  };

  const handleBackToScreen1 = () => {
    scrollViewRef.current?.scrollTo({ x: 0, animated: true });
    setCurrentPage(0);
  };

  return (
    <ImageBackground
      source={SARANAM_BACKGROUND}
      style={styles.container}
      imageStyle={styles.backgroundImageStyle}
      resizeMode="cover"
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Screen 2 Top Circular Back Button */}
      {currentPage === 1 && (
        <SafeAreaView style={styles.topNavSafeArea} pointerEvents="box-none">
          <View style={styles.topNavRow}>
            <TouchableOpacity
              style={styles.backButtonCircle}
              onPress={handleBackToScreen1}
              activeOpacity={0.8}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Back to Screen 1"
            >
              <Text style={styles.backArrowText}>←</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ========================================================================= */}
        {/* ==================== ONBOARDING SCREEN 1 (IMAGE 1 REFERENCE) ============ */}
        {/* ========================================================================= */}
        <View style={styles.slidePage}>
          <SafeAreaView style={styles.safeContentArea}>
            <View style={styles.fixedContentContainer}>
              {/* 1. Large Centered Official Saranam Ayyappa Logo Badge */}
              <View style={styles.logoContainer}>
                <Image
                  source={getLogoSource(SARANAM_OFFICIAL_LOGO)}
                  onError={onLogoError}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>

              {/* 2. Main Ivory Information Card (Exact Approved Layout) */}
              <View style={styles.panelShadowWrapper}>
                <LinearGradient
                  colors={['#FFFBF2', '#FAF4E8', '#F6EDDB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.ornamentalCard}
                >
                  {/* Decorative Golden Divider with Center Diamond Motif */}
                  <CardHeaderDiamondDivider />

                  {/* Dark Forest Green Heading */}
                  <Text style={styles.cardHeadingTitle}>Thathwamasi </Text>


                  {/* Subtitle */}
                  <Text style={styles.cardSubtitleText}>
                    Thou art that or You are that
                  </Text>

                  {/* Exactly Three Information Rows (Screen 1) */}
                  <View style={styles.guideRowsList}>
                    {/* Row 1: Maladharana */}
                    <OnboardingGuideItem
                      title="Maladharana"
                      description="Sacred Mala initiation at Guru Swami’s holy blessings to begin the sacred pilgrimage vow."
                      icon={MaladharanaIcon}
                    />

                    {/* Row 2: 48 Days Mandala Deeksha */}
                    <OnboardingGuideItem
                      title="48 Days Mandala Deeksha"
                      description="Strict 48-day sacred Vratham, daily prayers, satvik lifestyle & spiritual discipline."
                      icon={MandalaDeekshaIcon}
                    />

                    {/* Row 3: Irumudi Kattu */}
                    <OnboardingGuideItem
                      title="Irumudi Kattu"
                      description="Sacred twin-bag preparation with pure ghee coconut offering for Holy Abhishekam."
                      icon={IrumudiIcon}
                    />
                  </View>

                  {/* Small Green Mountain & Temple Illustration at Card Bottom */}
                  <Image
                    source={BOTTOM_GREEN_HILLS}
                    style={styles.cardBottomTempleImage}
                    resizeMode="contain"
                  />
                </LinearGradient>
              </View>

              {/* 3. Bottom Navigation Section: 2 Dots + Buttons */}
              <View style={styles.bottomControlsSection}>
                {/* 2 Pagination Dots (Dot 1 Active in Gold) */}
                <View style={styles.paginationRow}>
                  <View style={[styles.dot, styles.dot1Active]} />
                  <View style={[styles.dot, styles.dotInactive]} />
                </View>

                {/* Bottom Buttons Row: Skip & Next → */}
                <View style={styles.buttonsRow}>
                  <TouchableOpacity
                    style={styles.skipButton}
                    onPress={onFinish}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Skip onboarding"
                  >
                    <Text style={styles.skipButtonText}>Skip</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButtonWrapper}
                    onPress={handleNextFromScreen1}
                    activeOpacity={0.88}
                    accessibilityRole="button"
                    accessibilityLabel="Next screen"
                  >
                    <LinearGradient
                      colors={['#063E2D', '#0A2D21']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.actionButtonGradient}
                    >
                      <Text style={styles.actionButtonText}>Next →</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </View>

        {/* ========================================================================= */}
        {/* ==================== ONBOARDING SCREEN 2 (IMAGE 2 REFERENCE) ============ */}
        {/* ========================================================================= */}
        <View style={styles.slidePage}>
          <SafeAreaView style={styles.safeContentArea}>
            <View style={styles.fixedContentContainer}>
              {/* 1. Large Centered Official Saranam Ayyappa Logo Badge */}
              <View style={styles.logoContainer}>
                <Image
                  source={getLogoSource(SARANAM_OFFICIAL_LOGO)}
                  onError={onLogoError}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>

              {/* 2. Main Ivory Information Card (Exact Approved Layout) */}
              <View style={styles.panelShadowWrapper}>
                <LinearGradient
                  colors={['#FFFBF2', '#FAF4E8', '#F6EDDB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.ornamentalCard}
                >
                  {/* Decorative Golden Divider with Center Diamond Motif */}
                  <CardHeaderDiamondDivider />

                  {/* Dark Forest Green Heading */}
                  <Text style={styles.cardHeadingTitle}>Thathwamasi</Text>


                  {/* Subtitle */}
                  <Text style={styles.cardSubtitleText}>
                    Thou art that or You are that
                  </Text>

                  {/* Exactly Three Information Rows (Screen 2) */}
                  <View style={styles.guideRowsList}>
                    {/* Row 4: Traditional Trek Routes */}
                    <OnboardingGuideItem
                      title="Traditional Trek Routes"
                      description="Sacred Periya Padam, Erumeli & forest routes walked by millions."
                      icon={TrekRoutesIcon}
                    />

                    {/* Row 5: 18 Sacred Steps */}
                    <OnboardingGuideItem
                      title="18 Sacred Steps"
                      description="The holy Pathinettam Padi — a deep spiritual significance of each sacred step."
                      icon={SacredStepsIcon}
                    />

                    {/* Row 6: Sabarimala Updates */}
                    <OnboardingGuideItem
                      title="Sabarimala Updates"
                      description="Live crowd status, virtual Q queues, weather & sannidhanam darshan timings."
                      icon={SabarimalaUpdatesIcon}
                    />
                  </View>

                  {/* Small Green Mountain & Temple Illustration at Card Bottom */}
                  <Image
                    source={BOTTOM_GREEN_HILLS}
                    style={styles.cardBottomTempleImage}
                    resizeMode="contain"
                  />
                </LinearGradient>
              </View>

              {/* 3. Bottom Navigation Section: 2 Dots + Buttons */}
              <View style={styles.bottomControlsSection}>
                {/* 2 Pagination Dots (Dot 2 Active in Green/Gold) */}
                <View style={styles.paginationRow}>
                  <View style={[styles.dot, styles.dotInactive]} />
                  <View style={[styles.dot, styles.dot2Active]} />
                </View>

                {/* Bottom Buttons Row: Skip & Get Started → */}
                <View style={styles.buttonsRow}>
                  <TouchableOpacity
                    style={styles.skipButton}
                    onPress={onFinish}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Skip onboarding"
                  >
                    <Text style={styles.skipButtonText}>Skip</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButtonWrapper}
                    onPress={onFinish}
                    activeOpacity={0.88}
                    accessibilityRole="button"
                    accessibilityLabel="Get Started"
                  >
                    <LinearGradient
                      colors={['#063E2D', '#0A2D21']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.actionButtonGradient}
                    >
                      <Text style={styles.actionButtonText}>Get Started →</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B542C', // Pearl Green
  },
  backgroundImageStyle: {
    opacity: 0.7, // 70% opacity
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexDirection: 'row',
  },
  slidePage: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  safeContentArea: {
    flex: 1,
  },
  fixedContentContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 20) + 2 : 4,
    paddingBottom: Platform.OS === 'ios' ? 18 : 12,
  },

  // Screen 2 Top Circular Back Button
  topNavSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99,
  },
  topNavRow: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 20) + 6 : 8,
  },
  backButtonCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFDF8',
    borderWidth: 1.2,
    borderColor: '#DFA62E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  backArrowText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#063E2D',
    marginTop: Platform.OS === 'ios' ? -2 : -3,
  },

  // Prominent Logo Centered at Top (Overlaps slightly onto card crest)
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SCREEN_HEIGHT < 700 ? -4 : 0,
    marginBottom: SCREEN_HEIGHT < 700 ? -28 : -24,
    zIndex: 10,
  },
  logoImage: {
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
  },

  // Main Ivory Information Card
  panelShadowWrapper: {
    width: PANEL_MAX_WIDTH,
    borderRadius: 30,
    shadowColor: '#DFA62E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 14,
    elevation: 6,
  },
  ornamentalCard: {
    width: '100%',
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#E8CF96',
    paddingTop: SCREEN_HEIGHT < 700 ? 18 : 24,
    paddingBottom: 8,
    paddingHorizontal: 15,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },

  // Decorative Golden Divider with Central Diamond
  diamondDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    width: '100%',
  },
  diamondFlankLine: {
    width: 32,
    height: 1.2,
    backgroundColor: '#DFA62E',
    opacity: 0.8,
  },
  diamondCenterIcon: {
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Card Typography
  cardHeadingTitle: {
    fontFamily: Platform.select({
      ios: 'Poppins-Bold',
      android: 'Poppins_700Bold',
      web: 'Poppins, sans-serif',
      default: 'Poppins_700Bold',
    }),
    fontSize: SCREEN_HEIGHT < 700 ? 19 : 21.5,
    fontWeight: '800',
    color: '#06452E',
    textAlign: 'center',
    letterSpacing: 0.25,
    lineHeight: SCREEN_HEIGHT < 700 ? 25 : 28,
  },
  cardSubtitleText: {
    fontFamily: Platform.select({
      ios: 'Poppins-Regular',
      android: 'Poppins_400Regular',
      web: 'Poppins, sans-serif',
      default: 'Poppins_400Regular',
    }),
    fontSize: SCREEN_HEIGHT < 700 ? 11.5 : 12.5,
    color: '#38352E',
    textAlign: 'center',
    lineHeight: 16.5,
    marginTop: 4,
    marginBottom: SCREEN_HEIGHT < 700 ? 12 : 16,
    paddingHorizontal: 8,
  },

  // Exactly Three Information Rows
  guideRowsList: {
    width: '100%',
    gap: SCREEN_HEIGHT < 700 ? 10 : 13,
    marginBottom: 6,
  },
  guideRowCard: {
    width: '100%',
    backgroundColor: '#FFFDF9',
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: '#E8CF96',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT < 700 ? 11 : 14,
    paddingHorizontal: 13,
    shadowColor: '#06452E',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  guideIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: '#FDF5E2',
    borderWidth: 1,
    borderColor: 'rgba(223, 166, 46, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideVerticalDivider: {
    width: 1.2,
    height: 42,
    backgroundColor: '#DDAF46',
    opacity: 0.55,
    marginHorizontal: 12,
  },
  guideTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  guideTitleText: {
    fontFamily: Platform.select({
      ios: 'Poppins-Bold',
      android: 'Poppins_700Bold',
      web: 'Poppins, sans-serif',
      default: 'Poppins_700Bold',
    }),
    fontSize: SCREEN_HEIGHT < 700 ? 15 : 16.5,
    fontWeight: '800',
    color: '#06452E',
    letterSpacing: 0.1,
    marginBottom: 3.5,
  },
  guideDescText: {
    fontFamily: Platform.select({
      ios: 'Poppins-Regular',
      android: 'Poppins_400Regular',
      web: 'Poppins, sans-serif',
      default: 'Poppins_400Regular',
    }),
    fontSize: SCREEN_HEIGHT < 700 ? 10.5 : 11.5,
    color: '#38352E',
    lineHeight: 15.5,
  },

  // Bottom Green Mountain & Temple Illustration
  cardBottomTempleImage: {
    width: 156,
    height: 28,
    marginTop: 6,
    opacity: 0.9,
  },

  // Bottom Navigation Controls
  bottomControlsSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: SCREEN_HEIGHT < 700 ? 6 : 10,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dot: {
    height: 7,
    borderRadius: 3.5,
  },
  dot1Active: {
    width: 7,
    backgroundColor: '#E5B246',
    borderWidth: 0.5,
    borderColor: '#FFE08A',
  },
  dot2Active: {
    width: 16,
    backgroundColor: '#06452E',
    borderWidth: 0.5,
    borderColor: '#DDAF46',
  },
  dotInactive: {
    width: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.38)',
  },

  // Navigation Buttons
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: PANEL_MAX_WIDTH,
    gap: 12,
  },
  skipButton: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FAF5EB',
    borderWidth: 1.2,
    borderColor: '#DDAF46',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  skipButtonText: {
    fontFamily: Platform.select({
      ios: 'Poppins-Bold',
      android: 'Poppins_700Bold',
      web: 'Poppins, sans-serif',
      default: 'Poppins_700Bold',
    }),
    fontSize: 14,
    fontWeight: '700',
    color: '#06452E',
    letterSpacing: 0.2,
  },
  actionButtonWrapper: {
    flex: 1.3,
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: '#DDAF46',
    shadowColor: '#06452E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  actionButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontFamily: Platform.select({
      ios: 'Poppins-Bold',
      android: 'Poppins_700Bold',
      web: 'Poppins, sans-serif',
      default: 'Poppins_700Bold',
    }),
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFDF8',
    letterSpacing: 0.3,
  },
});
