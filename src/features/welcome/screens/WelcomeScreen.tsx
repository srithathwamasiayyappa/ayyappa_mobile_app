import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  Image,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { useBranding } from '../../../services/brandingService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Approved devotional Lord Ayyappa golden medallion
const AYYAPPA_EMBLEM = require('../../../assets/images/ayyappa_emblem_approved.png');

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onExploreGuest: () => void;
}

// Golden Lotus Divider with delicate flanking lines
const GoldenLotusDivider = () => (
  <View style={styles.lotusDividerContainer}>
    <View style={styles.lotusLine} />
    <Svg width={28} height={18} viewBox="0 0 28 18" fill="none">
      <Path
        d="M14 2 C11 7 10 10 10 13 C10 15.5 11.8 17 14 17 C16.2 17 18 15.5 18 13 C18 10 17 7 14 2 Z"
        fill="#DFA62E"
      />
      <Path
        d="M6 9 C6 13 9 15 11 15 C10 13 9 10 9 8 C7 8 6 8.5 6 9 Z"
        fill="#DFA62E"
      />
      <Path
        d="M22 9 C22 13 19 15 17 15 C18 13 19 10 19 8 C21 8 22 8.5 22 9 Z"
        fill="#DFA62E"
      />
      <Circle cx="14" cy="13" r="1.5" fill="#FFFDF8" />
    </Svg>
    <View style={styles.lotusLine} />
  </View>
);

// Hanging Brass Bell Ornament
const HangingBell = ({ flipped = false }: { flipped?: boolean }) => (
  <View style={flipped ? { transform: [{ scaleX: -1 }] } : undefined}>
    <Svg width={22} height={42} viewBox="0 0 22 42" fill="none">
      <Path d="M11 0 L11 18" stroke="#DFA62E" strokeWidth={1.5} strokeDasharray="2 2" />
      <Path
        d="M5 18 C5 13 17 13 17 18 L19 32 L3 32 Z"
        fill="#DFA62E"
      />
      <Path
        d="M2 32 C2 32 11 34.5 20 32 L20 35 C20 35 11 37.5 2 35 Z"
        fill="#C9A84E"
      />
      <Circle cx="11" cy="38" r="3" fill="#DFA62E" />
    </Svg>
  </View>
);

// Corner Filigree Ornaments for Top Header
const CornerFiligree = ({ flipped = false }: { flipped?: boolean }) => (
  <View style={flipped ? { transform: [{ scaleX: -1 }] } : undefined}>
    <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
      <Path
        d="M2 2 C15 2 28 9 34 20 C28 22 20 20 14 27 C9 20 7 10 2 2 Z"
        fill="#DFA62E"
        fillOpacity={0.75}
      />
      <Circle cx="10" cy="10" r="2.5" fill="#FFD700" />
      <Circle cx="20" cy="6" r="1.8" fill="#FFD700" />
      <Circle cx="6" cy="20" r="1.8" fill="#FFD700" />
    </Svg>
  </View>
);

// Miniature Corner Filigree for the Stylish Card
const CardCornerAccent = ({ flippedX = false, flippedY = false }: { flippedX?: boolean; flippedY?: boolean }) => {
  const transform = [];
  if (flippedX) transform.push({ scaleX: -1 });
  if (flippedY) transform.push({ scaleY: -1 });
  return (
    <View style={transform.length ? { transform } : undefined}>
      <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
        <Path
          d="M3 17 L3 6 C3 4.3 4.3 3 6 3 L17 3"
          stroke="#DFA62E"
          strokeWidth={1.6}
          strokeLinecap="round"
        />
        <Circle cx="7" cy="7" r="1.8" fill="#DFA62E" />
      </Svg>
    </View>
  );
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onGetStarted,
  onExploreGuest,
}) => {
  const { branding, getLogoSource, onLogoError } = useBranding();
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* 1. Pure Devotional Warm Ivory Base Gradient */}
      <LinearGradient
        colors={['#FEFAF2', '#FAF5EC', '#F5EFE4', '#EFE6D6']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* 2. Top Devotional Temple Accents */}
      <View style={styles.topOrnamentRow}>
        <View style={styles.cornerLeft}>
          <CornerFiligree />
        </View>
        <HangingBell />
        <View style={styles.headerArchOrnament}>
          <Svg width={120} height={16} viewBox="0 0 120 16" fill="none">
            <Path
              d="M0 2 Q60 18 120 2"
              stroke="#DFA62E"
              strokeWidth={1.5}
              strokeOpacity={0.65}
            />
            <Circle cx="60" cy="10" r="2.5" fill="#DFA62E" />
          </Svg>
        </View>
        <HangingBell flipped />
        <View style={styles.cornerRight}>
          <CornerFiligree flipped />
        </View>
      </View>

      <View style={styles.mainContainer}>
        {/* 3. Top Branding Section */}
        <View style={styles.brandingSection}>
          {/* Circular Golden Ayyappa Medallion */}
          <View style={styles.emblemWrapper}>
            <View style={styles.emblemOuterGlow}>
              <View style={styles.emblemBorder}>
                <Image
                  source={getLogoSource(AYYAPPA_EMBLEM)}
                  onError={onLogoError}
                  style={styles.emblemImage}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>

          {/* Saranam Ayyappa Brand Title in Poppins Bold (Increased Font Size) */}
          <Text style={styles.brandTitle}>{branding.title}</Text>

          {/* Sacred Mantra with Lotus: — 🪷 Swamiye Saranam Ayyappa — */}
          <View style={styles.mantraRow}>
            <View style={styles.mantraDivider} />
            <Text style={styles.mantraLotus}>🪷</Text>
            <Text style={styles.mantraText}>{branding.tagline || 'Swamiye Saranam Ayyappa'}</Text>
            <View style={styles.mantraDivider} />
          </View>
        </View>

        {/* 4. STYLISH DEVOTIONAL CARD: "Your Spiritual Journey, All in One Place." */}
        <View style={styles.cardShadowWrapper}>
          <LinearGradient
            colors={['#FFFFFF', '#FDFBF7', '#F8F2E6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.stylishCard}
          >
            {/* 4 Corner Temple Filigree Accents on Card */}
            <View style={styles.cardCornerTL} pointerEvents="none">
              <CardCornerAccent />
            </View>
            <View style={styles.cardCornerTR} pointerEvents="none">
              <CardCornerAccent flippedX />
            </View>
            <View style={styles.cardCornerBL} pointerEvents="none">
              <CardCornerAccent flippedY />
            </View>
            <View style={styles.cardCornerBR} pointerEvents="none">
              <CardCornerAccent flippedX flippedY />
            </View>

            {/* Main Card Heading in Poppins Bold */}
            <Text style={styles.companionHeading}>
              Your Spiritual Journey,{'\n'}All in One Place.
            </Text>

            {/* Golden Lotus Divider */}
            <GoldenLotusDivider />

            {/* Feature Highlights: Stylish Devotional Badges (Neatly Arranged 3 Balanced Rows) */}
            <View style={styles.featuresTray}>
              {/* Tier 1: Core Rituals (3 items) */}
              <View style={styles.badgeRow}>
                {['Poojas', 'Stotras', 'Bhajans'].map((item) => (
                  <View key={item} style={styles.featureBadge}>
                    <Text style={styles.badgeStar}>✦</Text>
                    <Text style={styles.badgeText}>{item}</Text>
                  </View>
                ))}
              </View>

              {/* Tier 2: Sacred Darshan & Temples (2 items) */}
              <View style={styles.badgeRow}>
                {['Temples', 'Live Darshan'].map((item) => (
                  <View key={item} style={styles.featureBadge}>
                    <Text style={styles.badgeStar}>✦</Text>
                    <Text style={styles.badgeText}>{item}</Text>
                  </View>
                ))}
              </View>

              {/* Tier 3: Almanac & Seva (2 items) */}
              <View style={styles.badgeRow}>
                {['Panchangam', 'Donations'].map((item) => (
                  <View key={item} style={styles.featureBadge}>
                    <Text style={styles.badgeStar}>✦</Text>
                    <Text style={styles.badgeText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* 5. Center Sacred Divider Flourish */}
        <View style={styles.centerHeroSpace}>
          <Svg width={180} height={16} viewBox="0 0 180 16" fill="none">
            <Path
              d="M10 8 L75 8 M105 8 L170 8"
              stroke="#DFA62E"
              strokeWidth={1}
              strokeOpacity={0.45}
            />
            <Circle cx="90" cy="8" r="3.5" fill="#DFA62E" fillOpacity={0.7} />
            <Circle cx="82" cy="8" r="1.8" fill="#DFA62E" fillOpacity={0.5} />
            <Circle cx="98" cy="8" r="1.8" fill="#DFA62E" fillOpacity={0.5} />
          </Svg>
        </View>

        {/* 6. Bottom Interactive Actions */}
        <View style={styles.actionsContainer}>
          {/* Primary Action: Get Started Button */}
          <TouchableOpacity
            style={styles.buttonShadowWrapper}
            activeOpacity={0.88}
            onPress={onGetStarted}
            accessibilityRole="button"
            accessibilityLabel="Get Started"
            accessibilityHint="Navigates to devotional onboarding and sign in"
          >
            <LinearGradient
              colors={['#173D32', '#0C251E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.getStartedButton}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.getStartedText}>Get Started</Text>
                <Text style={styles.arrowIcon}> ›</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Secondary Action: Explore as Guest */}
          <TouchableOpacity
            style={styles.guestButton}
            activeOpacity={0.7}
            onPress={onExploreGuest}
            accessibilityRole="button"
            accessibilityLabel="Explore as Guest"
            accessibilityHint="Browse sacred devotional content without compulsory login"
          >
            <Text style={styles.guestText}>Explore as Guest</Text>
          </TouchableOpacity>

          {/* Bottom Auspicious Golden Lotus Ornament */}
          <View style={styles.footerLotusOrnament}>
            <GoldenLotusDivider />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FEFAF2',
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? 12 : 6,
    paddingBottom: Math.max(16, SCREEN_HEIGHT * 0.02),
  },

  // --- Top Decorative Elements ---
  topOrnamentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 12) : 6,
    zIndex: 1,
  },
  cornerLeft: {
    marginTop: -2,
  },
  cornerRight: {
    marginTop: -2,
  },
  headerArchOrnament: {
    alignSelf: 'center',
    marginTop: 4,
  },

  // --- Branding Section ---
  brandingSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 2,
  },
  emblemWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emblemOuterGlow: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(223, 166, 46, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  emblemBorder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: '#DFA62E',
    backgroundColor: '#FFFDF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emblemImage: {
    width: 80,
    height: 80,
  },

  // Saranam Ayyappa Title - Increased font size and Poppins Bold
  brandTitle: {
    fontFamily: Platform.select({
      ios: 'Poppins-Bold',
      android: 'Poppins_700Bold',
      web: 'Poppins, sans-serif',
      default: 'Poppins_700Bold',
    }),
    fontSize: SCREEN_HEIGHT < 700 ? 32 : 36,
    fontWeight: '700',
    color: '#173D32',
    letterSpacing: 0.8,
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(223, 166, 46, 0.28)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  mantraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  mantraDivider: {
    width: 28,
    height: 1,
    backgroundColor: '#2E7561',
    opacity: 0.5,
  },
  mantraLotus: {
    fontSize: 13,
    marginHorizontal: 6,
  },
  mantraText: {
    fontFamily: Platform.select({
      ios: 'Poppins-Bold',
      android: 'Poppins_700Bold',
      web: 'Poppins, sans-serif',
      default: 'Poppins_700Bold',
    }),
    fontSize: 13.5,
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#2E7561',
    letterSpacing: 0.3,
  },

  // --- STYLISH DEVOTIONAL CARD ---
  cardShadowWrapper: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    borderRadius: 22,
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 6,
    marginTop: 2,
  },
  stylishCard: {
    width: '100%',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#DFA62E',
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  cardCornerTL: {
    position: 'absolute',
    top: 6,
    left: 6,
  },
  cardCornerTR: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  cardCornerBL: {
    position: 'absolute',
    bottom: 6,
    left: 6,
  },
  cardCornerBR: {
    position: 'absolute',
    bottom: 6,
    right: 6,
  },
  companionHeading: {
    fontFamily: Platform.select({
      ios: 'Poppins-Bold',
      android: 'Poppins_700Bold',
      web: 'Poppins, sans-serif',
      default: 'Poppins_700Bold',
    }),
    fontSize: SCREEN_HEIGHT < 700 ? 18.5 : 20.5,
    fontWeight: '700',
    color: '#173D32',
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: 27,
    marginTop: 2,
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  lotusDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    width: '100%',
  },
  lotusLine: {
    flex: 1,
    maxWidth: 45,
    height: 1,
    backgroundColor: '#DFA62E',
    opacity: 0.65,
    marginHorizontal: 8,
  },

  // --- Stylish Devotional Badges & Tray ---
  featuresTray: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(250, 246, 238, 0.72)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(223, 166, 46, 0.28)',
    paddingVertical: 9,
    paddingHorizontal: 8,
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 3,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFCA9B',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 11,
    marginHorizontal: 3.5,
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.08,
    shadowRadius: 2.5,
    elevation: 1.5,
  },
  badgeStar: {
    fontSize: 9.5,
    color: '#DFA62E',
    marginRight: 4.5,
    fontWeight: '700',
  },
  badgeText: {
    fontFamily: Platform.select({
      ios: 'Poppins-Regular',
      android: 'Poppins_400Regular',
      web: 'Poppins, sans-serif',
      default: 'Poppins_400Regular',
    }),
    fontSize: SCREEN_HEIGHT < 700 ? 11.5 : 12.5,
    fontWeight: '400',
    color: '#173D32',
    letterSpacing: 0.25,
  },

  // --- Center Space ---
  centerHeroSpace: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },

  // --- Bottom Actions Section ---
  actionsContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 8 : 12,
  },
  buttonShadowWrapper: {
    width: Math.min(SCREEN_WIDTH * 0.8, 304),
    borderRadius: 30,
    shadowColor: '#0C251E',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 10,
  },
  getStartedButton: {
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#DFA62E',
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    fontFamily: Platform.select({
      ios: 'Poppins-Bold',
      android: 'Poppins_700Bold',
      web: 'Poppins, sans-serif',
      default: 'Poppins_700Bold',
    }),
    fontSize: 18,
    fontWeight: '700',
    color: '#FDE4A9',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  arrowIcon: {
    fontFamily: Platform.select({
      ios: 'Poppins-Bold',
      android: 'Poppins_700Bold',
      web: 'Poppins, sans-serif',
      default: 'Poppins_700Bold',
    }),
    fontSize: 22,
    fontWeight: '700',
    color: '#FDE4A9',
    marginLeft: 6,
    marginTop: Platform.OS === 'ios' ? -1 : -2,
  },
  guestButton: {
    paddingVertical: 7,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestText: {
    fontFamily: Platform.select({
      ios: 'Poppins-Bold',
      android: 'Poppins_700Bold',
      web: 'Poppins, sans-serif',
      default: 'Poppins_700Bold',
    }),
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0C251E',
    textDecorationLine: 'underline',
    letterSpacing: 0.3,
  },
  footerLotusOrnament: {
    marginTop: 4,
    width: '60%',
    opacity: 0.75,
  },
});
