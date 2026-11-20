import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { Asset } from 'expo-asset';
import { useBranding } from '../../../services/brandingService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive Logo Dimensions for Royal Hero Presentation
const LOGO_HEIGHT = SCREEN_HEIGHT < 700 ? 152 : (SCREEN_HEIGHT < 820 ? 184 : 204);
const LOGO_WIDTH = Math.round(LOGO_HEIGHT * 0.913);

// ==================== ASSETS (EXACT APPROVED DEVOTIONAL ARTWORK) ====================
// Full-screen scenic sunrise mountain & temple background
const ROLE_BG = require('../../../../assets/deities/deity_selection_bg.jpg');
// Devotee artwork (Image 1 Left Card)
const ROLE_DEVOTEE = require('../../../../assets/role_selection/role_customer.jpg');
// Dharma Kartha temple artwork (Image 1 Right Card)
const ROLE_DHARMA_KARTHA = require('../../../../assets/role_selection/role_dharma_kartha.jpg');
// Official Saranam Ayyappa Deity Emblem Badge
const SARANAM_DEITY_EMBLEM = require('../../../../assets/deities/saranam_deity_emblem.png');

export type UserRole = 'DEVOTEE' | 'DHARMA_KARTHA';

interface RoleSelectionScreenProps {
  initialRole?: UserRole;
  onContinue: (selectedRole: UserRole) => void;
  onBack?: () => void;
}

// Devotees/Group Vector Icon in Deep Green
const GroupSvgIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="7" r="3" fill="#063E2D" />
    <Path d="M6 18 C6 14.7 8.7 12 12 12 C15.3 12 18 14.7 18 18" stroke="#063E2D" strokeWidth={2} strokeLinecap="round" />
    <Circle cx="6" cy="9" r="2.2" fill="#063E2D" opacity={0.7} />
    <Path d="M2 18 C2 15.5 3.8 13.5 6 13.5" stroke="#063E2D" strokeWidth={1.8} strokeLinecap="round" opacity={0.7} />
    <Circle cx="18" cy="9" r="2.2" fill="#063E2D" opacity={0.7} />
    <Path d="M22 18 C22 15.5 20.2 13.5 18 13.5" stroke="#063E2D" strokeWidth={1.8} strokeLinecap="round" opacity={0.7} />
  </Svg>
);

// Temple Gopuram Vector Icon in Antique Gold
const TempleSvgIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    {/* Gopuram tiers and kalasam */}
    <Path d="M12 2 L13.5 5 H10.5 Z" fill="#C8902B" />
    <Path d="M9 5 H15 L16.5 8 H7.5 Z" fill="#C8902B" />
    <Path d="M6 8 H18 L20 12 H4 Z" fill="#C8902B" />
    {/* Pillars and inner sanctum */}
    <Path d="M5 12 H19 V20 H5 Z" stroke="#C8902B" strokeWidth={1.8} />
    <Path d="M9 15 H15 V20 H9 Z" fill="#C8902B" />
    <Path d="M3 20 H21" stroke="#C8902B" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// Sacred Lotus Divider in Radiant Gold (#DFA62E) with Flanking Lines
const BrandLotusDivider = () => (
  <View style={styles.lotusDividerContainer}>
    {/* Left Flank Line with Accent Dot */}
    <View style={styles.flankLineWrapper}>
      <View style={styles.flankDot} />
      <View style={styles.flankLine} />
    </View>

    {/* Center Sacred Lotus Icon in Pure Vector SVG */}
    <View style={styles.lotusIconBox}>
      <Svg width={28} height={18} viewBox="0 0 32 20" fill="none">
        {/* Main Central Lotus Petal */}
        <Path
          d="M16 1 C13.5 5.5 12 9.5 12 13.5 C12 16.8 13.8 18.5 16 18.5 C18.2 18.5 20 16.8 20 13.5 C20 9.5 18.5 5.5 16 1 Z"
          fill="#DFA62E"
        />
        {/* Inner Left Petal */}
        <Path
          d="M7 8 C7 12 9.5 15.5 13 16 C11.5 13.5 11 10.5 11 7.5 C9 7.5 7.8 8 7 8 Z"
          fill="#DFA62E"
        />
        {/* Inner Right Petal */}
        <Path
          d="M25 8 C25 12 22.5 15.5 19 16 C20.5 13.5 21 10.5 21 7.5 C23 7.5 24.2 8 25 8 Z"
          fill="#DFA62E"
        />
        {/* Outer Left Calyx Wing */}
        <Path
          d="M3 12 C3 14.5 5.5 16.5 9 16.8 C8 15.2 7.5 13.5 7.5 11.5 C5.5 11.5 4 12 3 12 Z"
          fill="#C8902B"
          opacity={0.9}
        />
        {/* Outer Right Calyx Wing */}
        <Path
          d="M29 12 C29 14.5 26.5 16.5 23 16.8 C24 15.2 24.5 13.5 24.5 11.5 C26.5 11.5 28 12 29 12 Z"
          fill="#C8902B"
          opacity={0.9}
        />
        {/* Calyx Base */}
        <Path
          d="M11 18.5 C13.5 20 18.5 20 21 18.5 C18.5 19.2 13.5 19.2 11 18.5 Z"
          fill="#DFA62E"
        />
      </Svg>
    </View>

    {/* Right Flank Line with Accent Dot */}
    <View style={styles.flankLineWrapper}>
      <View style={styles.flankLine} />
      <View style={styles.flankDot} />
    </View>
  </View>
);

export const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({
  initialRole = 'DEVOTEE',
  onContinue,
  onBack,
}) => {
  const { branding, getLogoSource, onLogoError } = useBranding();
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);

  useEffect(() => {
    // Instant cache warming for zero-latency image display
    Asset.loadAsync([ROLE_BG, ROLE_DEVOTEE, ROLE_DHARMA_KARTHA, SARANAM_DEITY_EMBLEM]).catch(() => {});
  }, []);

  const handleCardPress = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleContinuePress = () => {
    onContinue(selectedRole);
  };

  return (
    <ImageBackground
      source={ROLE_BG}
      style={styles.container}
      imageStyle={styles.backgroundImageStyle}
      resizeMode="cover"
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Top Safe Area with Back Button */}
      <SafeAreaView style={styles.topNavSafeArea} pointerEvents="box-none">
        <View style={styles.topNavRow}>
          {onBack && (
            <TouchableOpacity
              style={styles.backButtonCircle}
              onPress={onBack}
              activeOpacity={0.8}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <Text style={styles.backArrowText}>←</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      {/* Main Fixed Screen Container */}
      <View style={styles.mainContentContainer}>
        {/* ================= TOP BRANDING AREA ================= */}
        <View style={styles.brandingSection}>
          {/* Official Saranam Ayyappa Deity Emblem Badge */}
          <Image
            source={getLogoSource(SARANAM_DEITY_EMBLEM)}
            defaultSource={SARANAM_DEITY_EMBLEM}
            onError={onLogoError}
            style={styles.logoImage}
            resizeMode="contain"
            fadeDuration={0}
          />

          {/* Brand Name */}
          <Text style={styles.brandTitle}>{branding.title}</Text>

          {/* Symmetrical Sacred Lotus Divider in Radiant Gold */}
          <BrandLotusDivider />

          {/* Tagline */}
          <Text style={styles.taglineText}>{branding.tagline}</Text>
        </View>

        {/* ================= MAIN IVORY ROLE SELECTION PANEL ================= */}
        <View style={styles.ivoryPanelWrapper}>
          <LinearGradient
            colors={['#FFFDF8', '#FAF4E8', '#F6EEDE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.ivoryPanelGradient}
          >
            {/* Title with Decorative Gold Side Lines */}
            <View style={styles.titleRow}>
              <View style={styles.goldTitleLine} />
              <Text style={styles.panelTitle}>Continue with Your Role</Text>
              <View style={styles.goldTitleLine} />
            </View>

            {/* Subtitle */}
            <Text style={styles.panelSubtitle}>
              Choose how you would like to use the app
            </Text>

            {/* Two Side-by-Side Role Cards */}
            <View style={styles.cardsRow}>
              {/* 1. DEVOTEE CARD (FOR HINDU DEVOTEES) */}
              <TouchableOpacity
                style={[
                  styles.roleCard,
                  selectedRole === 'DEVOTEE' ? styles.roleCardSelected : styles.roleCardUnselected,
                ]}
                onPress={() => handleCardPress('DEVOTEE')}
                activeOpacity={0.9}
                accessibilityRole="radio"
                accessibilityState={{ selected: selectedRole === 'DEVOTEE' }}
                accessibilityLabel="Devotee, For Hindu Devotees"
              >
                {/* Devotee Artwork (Image 1 Left Card) */}
                <View style={styles.cardImageContainer}>
                  <Image
                    source={ROLE_DEVOTEE}
                    style={styles.cardHeaderImage}
                    resizeMode="cover"
                    fadeDuration={0}
                  />
                  {/* Subtle fade overlay into card background */}
                  <LinearGradient
                    colors={['transparent', selectedRole === 'DEVOTEE' ? '#F2F8ED' : '#FFFDF8']}
                    style={styles.cardImageFade}
                  />
                  {/* Radio / Check Indicator */}
                  <View style={styles.radioBadgeContainer}>
                    {selectedRole === 'DEVOTEE' ? (
                      <View style={styles.radioBadgeChecked}>
                        <Text style={styles.checkMarkIcon}>✓</Text>
                      </View>
                    ) : (
                      <View style={styles.radioBadgeUnchecked} />
                    )}
                  </View>
                </View>

                {/* Card Body */}
                <View style={styles.cardBody}>
                  <View style={styles.cardIconWrapper}>
                    <GroupSvgIcon />
                  </View>

                  <Text style={styles.cardHeading}>I am Devotee</Text>

                  <Text style={styles.cardDescription}>
                    For Hindu Devotees
                  </Text>
                </View>
              </TouchableOpacity>

              {/* 2. DHARMA KARTHA CARD (TEMPLE FOUNDER) */}
              <TouchableOpacity
                style={[
                  styles.roleCard,
                  selectedRole === 'DHARMA_KARTHA' ? styles.roleCardSelected : styles.roleCardUnselected,
                ]}
                onPress={() => handleCardPress('DHARMA_KARTHA')}
                activeOpacity={0.9}
                accessibilityRole="radio"
                accessibilityState={{ selected: selectedRole === 'DHARMA_KARTHA' }}
                accessibilityLabel="Dharma Kartha, Temple Founder, For Temple Management, Events & Devotional Services"
              >
                {/* Temple Artwork (Image 1 Right Card) */}
                <View style={styles.cardImageContainer}>
                  <Image
                    source={ROLE_DHARMA_KARTHA}
                    style={styles.cardHeaderImage}
                    resizeMode="cover"
                    fadeDuration={0}
                  />
                  <LinearGradient
                    colors={['transparent', selectedRole === 'DHARMA_KARTHA' ? '#F2F8ED' : '#FFFDF8']}
                    style={styles.cardImageFade}
                  />
                  {/* Radio / Check Indicator */}
                  <View style={styles.radioBadgeContainer}>
                    {selectedRole === 'DHARMA_KARTHA' ? (
                      <View style={styles.radioBadgeChecked}>
                        <Text style={styles.checkMarkIcon}>✓</Text>
                      </View>
                    ) : (
                      <View style={styles.radioBadgeUnchecked} />
                    )}
                  </View>
                </View>

                {/* Card Body */}
                <View style={styles.cardBody}>
                  <View style={styles.cardIconWrapper}>
                    <TempleSvgIcon />
                  </View>

                  <Text style={styles.cardHeading}>I am Dharma Kartha</Text>
                  <Text style={styles.cardSecondaryLabel}>(Temple Founder)</Text>

                  <Text style={styles.cardDescriptionSmall}>
                    For Temple Management, Events & Devotional Services
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* ================= CONTINUE BUTTON ================= */}
            <TouchableOpacity
              style={styles.continueButtonWrapper}
              onPress={handleContinuePress}
              activeOpacity={0.88}
              accessibilityRole="button"
              accessibilityLabel="Continue"
            >
              <LinearGradient
                colors={['#063E2D', '#0B281E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.continueButtonGradient}
              >
                <Text style={styles.continueButtonText}>Continue  →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
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
  topNavSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99,
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 14) + 6 : 8,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFDF8',
    borderWidth: 1.4,
    borderColor: '#DFA62E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#063E2D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  backArrowText: {
    color: '#063E2D',
    fontSize: 20,
    fontWeight: '700',
    marginTop: Platform.OS === 'ios' ? -2 : -3,
  },

  // Main Fixed Container
  mainContentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? (SCREEN_HEIGHT < 700 ? 16 : 24) : (SCREEN_HEIGHT < 700 ? 10 : 18),
  },

  // --- Branding Section ---
  brandingSection: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 14) + 2 : 8,
  },
  logoImage: {
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
    alignSelf: 'center',
  },
  brandTitle: {
    fontFamily: Platform.select({
      ios: 'Poppins-Bold',
      android: 'Poppins_700Bold',
      web: 'Poppins, sans-serif',
      default: 'Poppins_700Bold',
    }),
    fontSize: SCREEN_HEIGHT < 700 ? 21 : 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
    marginTop: 2,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 3,
  },
  lotusDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 3,
  },
  flankLineWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flankLine: {
    width: 30,
    height: 1.4,
    backgroundColor: '#DFA62E',
    opacity: 0.85,
  },
  flankDot: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: '#DFA62E',
    opacity: 0.9,
    marginHorizontal: 3,
  },
  lotusIconBox: {
    marginHorizontal: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taglineText: {
    fontFamily: Platform.select({
      ios: 'Poppins-SemiBold',
      android: 'Poppins_600SemiBold',
      web: 'Poppins, sans-serif',
      default: 'Poppins_600SemiBold',
    }),
    fontSize: SCREEN_HEIGHT < 700 ? 12 : 13,
    fontWeight: '600',
    fontStyle: 'italic',
    color: '#FFFFFF',
    letterSpacing: 0.8,
    textAlign: 'center',
    marginTop: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.65)',
    textShadowOffset: { width: 0, height: 1.2 },
    textShadowRadius: 3,
  },

  // --- Main Ivory Role Selection Panel (Increased Height & Grandeur) ---
  ivoryPanelWrapper: {
    width: SCREEN_WIDTH * 0.94,
    maxWidth: 400,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: '#DFA62E',
    shadowColor: '#DFA62E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 6,
    overflow: 'hidden',
    marginBottom: SCREEN_HEIGHT < 700 ? 6 : 10,
  },
  ivoryPanelGradient: {
    width: '100%',
    borderRadius: 32,
    paddingTop: SCREEN_HEIGHT < 700 ? 14 : 18,
    paddingHorizontal: 13,
    paddingBottom: SCREEN_HEIGHT < 700 ? 14 : 18,
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  goldTitleLine: {
    width: 28,
    height: 1.5,
    backgroundColor: '#DFA62E',
    marginHorizontal: 8,
    opacity: 0.8,
  },
  panelTitle: {
    fontFamily: Platform.select({
      ios: 'Poppins-Bold',
      android: 'Poppins_700Bold',
      web: 'Poppins, sans-serif',
      default: 'Poppins_700Bold',
    }),
    fontSize: SCREEN_HEIGHT < 700 ? 18 : 20.5,
    fontWeight: '700',
    color: '#063E2D',
    textAlign: 'center',
  },
  panelSubtitle: {
    fontFamily: Platform.select({
      ios: 'Poppins-Regular',
      android: 'Poppins_400Regular',
      web: 'Poppins, sans-serif',
      default: 'Poppins_400Regular',
    }),
    fontSize: SCREEN_HEIGHT < 700 ? 11.5 : 12.5,
    color: '#55665D',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: SCREEN_HEIGHT < 700 ? 12 : 16,
  },

  // --- Two Role Cards ---
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  roleCard: {
    width: '48.5%',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  roleCardSelected: {
    backgroundColor: '#F2F8ED',
    borderWidth: 2,
    borderColor: '#075E2B',
    shadowColor: '#075E2B',
    shadowOpacity: 0.18,
  },
  roleCardUnselected: {
    backgroundColor: '#FFFDF8',
    borderWidth: 1.2,
    borderColor: '#E8D2A8',
    shadowColor: '#063E2D',
    shadowOpacity: 0.08,
  },
  cardImageContainer: {
    width: '100%',
    height: SCREEN_HEIGHT < 700 ? 112 : 138,
    position: 'relative',
    backgroundColor: '#F3ECD8',
    overflow: 'hidden',
  },
  cardHeaderImage: {
    width: '100%',
    height: '100%',
  },
  cardImageFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -1,
    height: 36,
  },
  radioBadgeContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  radioBadgeChecked: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0A5C36',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFDF8',
  },
  checkMarkIcon: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: -1,
  },
  radioBadgeUnchecked: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.75)',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },

  cardBody: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 8,
    minHeight: SCREEN_HEIGHT < 700 ? 112 : 128,
  },
  cardIconWrapper: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  cardHeading: {
    fontFamily: Platform.select({
      ios: 'Poppins-Bold',
      android: 'Poppins_700Bold',
      web: 'Poppins, sans-serif',
      default: 'Poppins_700Bold',
    }),
    fontSize: SCREEN_HEIGHT < 700 ? 15 : 16.5,
    fontWeight: '700',
    color: '#063E2D',
    textAlign: 'center',
  },
  cardSecondaryLabel: {
    fontFamily: Platform.select({
      ios: 'Poppins-SemiBold',
      android: 'Poppins_600SemiBold',
      web: 'Poppins, sans-serif',
      default: 'Poppins_600SemiBold',
    }),
    fontSize: SCREEN_HEIGHT < 700 ? 11 : 12,
    fontWeight: '700',
    color: '#063E2D',
    textAlign: 'center',
    marginTop: 1.5,
  },
  cardGoldDivider: {
    width: 32,
    height: 1.2,
    backgroundColor: '#DFA62E',
    marginVertical: 4,
    opacity: 0.7,
  },
  cardDescription: {
    fontFamily: Platform.select({
      ios: 'Poppins-Regular',
      android: 'Poppins_400Regular',
      web: 'Poppins, sans-serif',
      default: 'Poppins_400Regular',
    }),
    fontSize: SCREEN_HEIGHT < 700 ? 11 : 12,
    fontWeight: '500',
    color: '#55665D',
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 16,
  },
  cardDescriptionSmall: {
    fontFamily: Platform.select({
      ios: 'Poppins-Regular',
      android: 'Poppins_400Regular',
      web: 'Poppins, sans-serif',
      default: 'Poppins_400Regular',
    }),
    fontSize: SCREEN_HEIGHT < 700 ? 10 : 11,
    fontWeight: '500',
    color: '#55665D',
    textAlign: 'center',
    lineHeight: 15,
    marginTop: 5,
  },

  // --- Continue Button ---
  continueButtonWrapper: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    marginTop: SCREEN_HEIGHT < 700 ? 14 : 18,
    shadowColor: '#063E2D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#DFA62E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontFamily: Platform.select({
      ios: 'Poppins-Bold',
      android: 'Poppins_700Bold',
      web: 'Poppins, sans-serif',
      default: 'Poppins_700Bold',
    }),
    fontSize: 16.5,
    fontWeight: '700',
    color: '#FFFDF8',
    letterSpacing: 0.5,
  },
});
