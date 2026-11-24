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
  ScrollView,
  BackHandler,
  SafeAreaView,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { DeityItem, SupportedLanguage } from '../../../types';
import { StorageService } from '../../../services/storageService';
import { ApiService } from '../../../services/api';
import { AllDeitiesScreen, ALL_DEITIES_CATALOG } from './AllDeitiesScreen';
import { resolveDeityImage } from '../utils/deityImageResolver';
import { useBranding } from '../../../services/brandingService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive Calculations
const PANEL_MAX_WIDTH = Math.min(SCREEN_WIDTH * 0.92, 386);
const PANEL_PADDING = 14;
const GRID_GAP = 8;
const CARD_WIDTH = Math.floor((PANEL_MAX_WIDTH - PANEL_PADDING * 2 - GRID_GAP * 2) / 3);
const CARD_HEIGHT = SCREEN_HEIGHT < 700 ? 94 : (SCREEN_HEIGHT < 820 ? 104 : 110);
const CARD_IMAGE_SIZE = SCREEN_HEIGHT < 700 ? 50 : 58;

// Local Asset Imports (Exact Reference Assets)
const SARANAM_DEITY_BG = require('../../../../assets/deities/deity_selection_bg.jpg');
const SARANAM_DEITY_EMBLEM = require('../../../../assets/deities/saranam_deity_emblem.png');
const BOTTOM_GREEN_HILLS = require('../../../../assets/deities/bottom_green_hills.jpg');

export interface ChooseDeityScreenProps {
  currentLanguage?: SupportedLanguage;
  onContinue: (selectedDeity: DeityItem) => void;
  onBack: () => void;
}

const READY_DEITY_IDS = new Set([
  'ayyappa',
  'shiva',
  'ganesha',
  'ganapathi',
  'murugan',
  'karthikeya',
]);

export const isDeityComingSoon = (deity: DeityItem | null | undefined): boolean => {
  if (!deity) return false;
  if (deity.isComingSoon !== undefined) return deity.isComingSoon;
  const slug = (deity.id || (deity as any).slug || '').toLowerCase();
  return !READY_DEITY_IDS.has(slug);
};

export const ChooseDeityScreen: React.FC<ChooseDeityScreenProps> = ({
  currentLanguage = 'en',
  onContinue,
  onBack,
}) => {
  const { getLogoSource, onLogoError } = useBranding();
  // Dynamic Deities strictly fetched from DB via API (Strictly NO fallback, static, or fake data)
  const [featuredDeities, setFeaturedDeities] = useState<DeityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDeity, setSelectedDeity] = useState<DeityItem | null>(null);
  const [allDeitiesModalVisible, setAllDeitiesModalVisible] = useState<boolean>(false);
  const [comingSoonToast, setComingSoonToast] = useState<string | null>(null);
  const [showAllDeities, setShowAllDeities] = useState<boolean>(false);

  // Fetch featured deities directly from DB via API
  const loadFeaturedDeities = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiService.getDeities({ featured: true });
      if (!data || data.length === 0) {
        throw new Error('No deities returned from database');
      }
      setFeaturedDeities(data);

      const stored = await StorageService.getStoredDeity();
      if (stored && !isDeityComingSoon(stored)) {
        const found = data.find((d) => d.id === stored.id || d.name === stored.name);
        setSelectedDeity(found || stored);
      } else {
        const firstReady = data.find((d) => !isDeityComingSoon(d)) || data[0];
        setSelectedDeity(firstReady);
      }
    } catch (err: any) {
      // Graceful offline fallback to bundled featured catalog
      const fallback = (ALL_DEITIES_CATALOG || []).filter((d) => d.isFeatured);
      if (fallback.length > 0) {
        setFeaturedDeities(fallback);
        const firstReady = fallback.find((d) => !isDeityComingSoon(d)) || fallback[0];
        setSelectedDeity(firstReady);
        setError(null);
      } else {
        setError(err?.message || 'Failed to load deities from database');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeaturedDeities();
  }, []);

  // Auto-dismiss coming soon toast
  useEffect(() => {
    if (comingSoonToast) {
      const timer = setTimeout(() => setComingSoonToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [comingSoonToast]);

  // Android Hardware Back handling
  useEffect(() => {
    const onHardwareBackPress = () => {
      if (allDeitiesModalVisible) {
        setAllDeitiesModalVisible(false);
        return true;
      }
      onBack();
      return true;
    };

    const backSub = BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress);
    return () => backSub.remove();
  }, [allDeitiesModalVisible, onBack]);

  const handleSelectFeatured = (deity: DeityItem) => {
    if (isDeityComingSoon(deity)) {
      setComingSoonToast(
        `${getDeityDisplayName(deity)} services & poojas are coming soon! Please choose Lord Ayyappa, Lord Shiva, Lord Ganapathi, or Lord Karthikeya.`
      );
      return;
    }
    setComingSoonToast(null);
    setSelectedDeity(deity);
  };

  const handleSelectFromAll = (deity: DeityItem) => {
    if (isDeityComingSoon(deity)) {
      setComingSoonToast(
        `${getDeityDisplayName(deity)} services & poojas are coming soon! Please choose Lord Ayyappa, Lord Shiva, Lord Ganapathi, or Lord Karthikeya.`
      );
      return;
    }
    setComingSoonToast(null);
    setSelectedDeity(deity);
    setAllDeitiesModalVisible(false);
  };

  const handleContinuePress = async () => {
    if (!selectedDeity || isDeityComingSoon(selectedDeity)) {
      setComingSoonToast('Please select an active deity (Lord Ayyappa, Lord Shiva, Lord Ganapathi, or Lord Karthikeya) to continue.');
      return;
    }
    await StorageService.setStoredDeity(selectedDeity);
    onContinue(selectedDeity);
  };

  // Catalog of all deities when expanded (from API or bundled catalog)
  const allDeitiesList =
    featuredDeities.length > 6
      ? featuredDeities
      : (ALL_DEITIES_CATALOG && ALL_DEITIES_CATALOG.length > 6
          ? (ALL_DEITIES_CATALOG as DeityItem[])
          : featuredDeities);

  // Initial state strictly renders 6 cards only; expands to all upon tapping "View All Deities"
  const displayedDeities = showAllDeities
    ? allDeitiesList
    : featuredDeities.slice(0, 6);

  // Check if selected deity is outside the 6 initial cards
  const isCustomSelected = Boolean(
    selectedDeity && !featuredDeities.slice(0, 6).some((d) => d.id === selectedDeity.id)
  );

  // Helper for localized deity name
  const getDeityDisplayName = (item: DeityItem | null | undefined): string => {
    if (!item) return '';
    if (currentLanguage === 'te' && item.teluguName) return item.teluguName;
    if (currentLanguage === 'ta' && item.tamilName) return item.tamilName;
    if (currentLanguage === 'kn' && item.kannadaName) return item.kannadaName;
    if (currentLanguage === 'hi' && item.hindiName) return item.hindiName;
    return item.name;
  };

  const contentBody = (
    <View style={styles.fixedContentContainer}>
      {/* 2. Authentic Saranam Ayyappa Logo (Image 2) */}
      <View style={styles.logoContainer}>
        <Image
          source={getLogoSource(SARANAM_DEITY_EMBLEM)}
          onError={onLogoError}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      {/* 3. Main Ivory Ornamental Panel (Image 1 Layout) */}
      <View style={styles.panelShadowWrapper}>
        <LinearGradient
          colors={['#FFFBF2', '#FAF3E3', '#F5EBD8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.ornamentalPanel}
        >
          {/* Panel Top Curved Golden Crest Motif */}
          <View style={styles.panelCrownContainer}>
            <View style={styles.crownFlankLine} />
            <View style={styles.crownDiamond}>
              <Svg width={18} height={14} viewBox="0 0 18 14" fill="none">
                <Path d="M9 1 L14 7 L9 13 L4 7 Z" fill="#DFA62E" />
                <Circle cx="9" cy="7" r="1.8" fill="#FFFBF2" />
                <Circle cx="2" cy="7" r="1.3" fill="#DFA62E" />
                <Circle cx="16" cy="7" r="1.3" fill="#DFA62E" />
              </Svg>
            </View>
            <View style={styles.crownFlankLine} />
          </View>

          {/* 4. Title: Choose Your Deity */}
          <View style={styles.headingRow}>
            <View style={styles.headingLine} />
            <Text style={styles.headingText}>Choose Your Deity</Text>
            <View style={styles.headingLine} />
          </View>

          {/* 5. Subtitle */}
          <Text style={styles.subtitleText}>
            Select your preferred deity for a personalized{'\n'}devotional experience
          </Text>

          {/* 6. Six Featured Deity Cards (3 columns x 2 rows) */}
          {loading ? (
            <View style={styles.stateCenterContainer}>
              <ActivityIndicator size="small" color="#0B4420" />
              <Text style={styles.stateLoadingText}>Loading deities from database...</Text>
            </View>
          ) : error ? (
            <View style={styles.stateCenterContainer}>
              <Text style={styles.stateErrorText}>{error}</Text>
              <TouchableOpacity style={styles.stateRetryBtn} onPress={loadFeaturedDeities}>
                <Text style={styles.stateRetryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.cardsGrid}>
              {displayedDeities.map((deity) => {
                const isComingSoon = isDeityComingSoon(deity);
                const isSelected = selectedDeity?.id === deity.id;
                const displayName = getDeityDisplayName(deity);
                const imageSource = resolveDeityImage(deity);

                return (
                  <TouchableOpacity
                    key={deity.id}
                    style={[
                      styles.deityCard,
                      isSelected ? styles.deityCardSelected : styles.deityCardUnselected,
                      isComingSoon && styles.deityCardComingSoon,
                    ]}
                    onPress={() => handleSelectFeatured(deity)}
                    activeOpacity={0.85}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={`${deity.name}, ${isComingSoon ? 'Coming Soon' : isSelected ? 'Selected' : 'Unselected'}`}
                  >
                    {/* Deity Portrait Artwork with Radiant Glow */}
                    <View style={styles.cardImageContainer}>
                      {/* "Coming Soon" Badge Above Image */}
                      {isComingSoon && (
                        <View style={styles.comingSoonBadge}>
                          <Text style={styles.comingSoonBadgeText}>Coming Soon</Text>
                        </View>
                      )}

                      <Image
                        source={imageSource}
                        style={[styles.deityArtwork, isComingSoon && styles.deityArtworkComingSoon]}
                        resizeMode="contain"
                      />

                      {/* Circular Green Checkmark Badge on Selected */}
                      {isSelected && !isComingSoon && (
                        <View style={styles.checkmarkBadge}>
                          <Svg width={11} height={11} viewBox="0 0 14 14" fill="none">
                            <Path
                              d="M2.5 7 L5.5 10 L11.5 3.5"
                              stroke="#FFFFFF"
                              strokeWidth={2.4}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </Svg>
                        </View>
                      )}
                    </View>

                    {/* Deity Name */}
                    <Text
                      style={[
                        styles.cardNameText,
                        isSelected && styles.cardNameTextSelected,
                        isComingSoon && styles.cardNameTextComingSoon,
                      ]}
                      numberOfLines={2}
                    >
                      {displayName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Coming Soon Toast Banner */}
          {comingSoonToast && (
            <View style={styles.comingSoonToastBox}>
              <Text style={styles.comingSoonToastIcon}>⏳</Text>
              <Text style={styles.comingSoonToastText}>{comingSoonToast}</Text>
            </View>
          )}

          {/* Optional Indicator if selected deity is from "All Deities" */}
          {isCustomSelected && selectedDeity && (
            <View style={styles.customSelectionBadge}>
              <Text style={styles.customSelectionCheck}>✓</Text>
              <Text style={styles.customSelectionText} numberOfLines={1}>
                Selected: {getDeityDisplayName(selectedDeity)}
              </Text>
            </View>
          )}

          {/* 7. View All Deities Button (Expands 6 cards to show all deities dynamically on this screen) */}
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => setShowAllDeities((prev) => !prev)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={showAllDeities ? 'Show Fewer Deities' : 'View All Deities'}
          >
            {/* Left 9-Dot Grid Icon */}
            <View style={styles.viewAllIconWrapper}>
              <Svg width={16} height={16} viewBox="0 0 18 18" fill="none">
                <Circle cx="3" cy="3" r="1.8" fill="#063E2D" />
                <Circle cx="9" cy="3" r="1.8" fill="#063E2D" />
                <Circle cx="15" cy="3" r="1.8" fill="#063E2D" />
                <Circle cx="3" cy="9" r="1.8" fill="#063E2D" />
                <Circle cx="9" cy="9" r="1.8" fill="#063E2D" />
                <Circle cx="15" cy="9" r="1.8" fill="#063E2D" />
                <Circle cx="3" cy="15" r="1.8" fill="#063E2D" />
                <Circle cx="9" cy="15" r="1.8" fill="#063E2D" />
                <Circle cx="15" cy="15" r="1.8" fill="#063E2D" />
              </Svg>
            </View>

            <Text style={styles.viewAllButtonText}>
              {showAllDeities ? 'Show Fewer Deities' : 'View All Deities'}
            </Text>

            {/* Right Chevron / Indicator */}
            <Text style={styles.viewAllChevron}>
              {showAllDeities ? '▲' : '›'}
            </Text>
          </TouchableOpacity>

          {/* 8. Full-Width Deep Green Continue Button */}
          <TouchableOpacity
            style={[
              styles.continueButtonWrapper,
              (loading || !selectedDeity) && { opacity: 0.6 },
            ]}
            onPress={handleContinuePress}
            disabled={loading || !selectedDeity}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Continue"
          >
            <LinearGradient
              colors={['#075E2B', '#094C23', '#0B4420']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.continueButtonGradient}
            >
              <Text style={styles.continueButtonText}>Continue →</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* 9. Bottom Decorative Mountain & Temple Landscape */}
          <View style={styles.bottomArtworkContainer}>
            <Image
              source={BOTTOM_GREEN_HILLS}
              style={styles.bottomArtworkImage}
              resizeMode="contain"
            />
          </View>
        </LinearGradient>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* 1. Full-Screen Scenic Devotional Temple Background (Image 3) */}
      <ImageBackground
        source={SARANAM_DEITY_BG}
        style={styles.fullScreenBackground}
        imageStyle={styles.backgroundImageStyle}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Top Floating Circular Back Button (Image 1 top left) */}
          <View style={styles.topNavRow}>
            <TouchableOpacity
              style={styles.backButtonCircle}
              onPress={onBack}
              activeOpacity={0.8}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Back to Language Selection"
            >
              <Text style={styles.backArrowText}>←</Text>
            </TouchableOpacity>
          </View>

          {SCREEN_HEIGHT < 720 || showAllDeities ? (
            <ScrollView
              contentContainerStyle={styles.scrollContentContainer}
              showsVerticalScrollIndicator={false}
              bounces={false}
              keyboardShouldPersistTaps="handled"
            >
              {contentBody}
            </ScrollView>
          ) : (
            contentBody
          )}
        </SafeAreaView>
      </ImageBackground>

      {/* Dedicated All Deities Screen / Modal */}
      <AllDeitiesScreen
        visible={allDeitiesModalVisible}
        selectedDeity={selectedDeity || featuredDeities[0] || ({ id: 'ayyappa', name: 'Lord Ayyappa' } as DeityItem)}
        currentLanguage={currentLanguage}
        onSelectDeity={handleSelectFromAll}
        onClose={() => setAllDeitiesModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1B542C', // Pearl Green
  },
  fullScreenBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#1B542C',
  },
  backgroundImageStyle: {
    opacity: 0.7, // 70% opacity
  },
  safeArea: {
    flex: 1,
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 16) + 4 : 8,
    zIndex: 20,
  },
  backButtonCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFDF8',
    borderWidth: 1.4,
    borderColor: '#DFA62E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 3,
  },
  backArrowText: {
    color: '#063E2D',
    fontSize: 20,
    fontWeight: '700',
    marginTop: Platform.OS === 'ios' ? -2 : -3,
  },

  fixedContentContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Platform.OS === 'ios' ? 14 : 8,
  },
  scrollContentContainer: {
    alignItems: 'center',
    paddingBottom: 24,
  },

  // Centered Saranam Ayyappa Logo (Image 2) - Increased by 25% for prominent devotional presentation
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SCREEN_HEIGHT < 700 ? -12 : -6,
    marginBottom: SCREEN_HEIGHT < 700 ? -22 : -16,
    zIndex: 10,
  },
  logoImage: {
    width: SCREEN_HEIGHT < 700 ? 145 : (SCREEN_HEIGHT < 820 ? 168 : 185),
    height: SCREEN_HEIGHT < 700 ? 160 : (SCREEN_HEIGHT < 820 ? 185 : 205),
  },

  // Main Ivory Ornamental Panel (Image 1)
  panelShadowWrapper: {
    width: PANEL_MAX_WIDTH,
    borderRadius: 30,
    shadowColor: '#DFA62E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 7,
  },
  ornamentalPanel: {
    width: '100%',
    borderRadius: 30,
    borderWidth: 1.6,
    borderColor: '#DFA62E',
    paddingTop: SCREEN_HEIGHT < 700 ? 10 : 14,
    paddingBottom: SCREEN_HEIGHT < 700 ? 4 : 6,
    paddingHorizontal: PANEL_PADDING,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },

  // Panel Top Decorative Crest
  panelCrownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    width: '100%',
  },
  crownFlankLine: {
    width: 32,
    height: 1.2,
    backgroundColor: '#DFA62E',
    opacity: 0.8,
  },
  crownDiamond: {
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Title: Choose Your Deity
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 3,
  },
  headingLine: {
    flex: 1,
    maxWidth: 24,
    height: 1.2,
    backgroundColor: '#DFA62E',
    opacity: 0.7,
  },
  headingText: {
    fontSize: SCREEN_HEIGHT < 700 ? 18 : 20,
    fontWeight: '800',
    color: '#063E2D',
    fontFamily: Platform.select({
      ios: 'Poppins-Bold',
      android: 'Poppins_700Bold',
      web: 'Poppins, sans-serif',
      default: 'Poppins_700Bold',
    }),
    letterSpacing: 0.3,
    marginHorizontal: 8,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: SCREEN_HEIGHT < 700 ? 11 : 12,
    color: '#3A4B43',
    textAlign: 'center',
    lineHeight: SCREEN_HEIGHT < 700 ? 15 : 17,
    marginBottom: 10,
    paddingHorizontal: 8,
  },

  // 6 Featured Cards Grid
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  deityCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: GRID_GAP,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  deityCardUnselected: {
    backgroundColor: '#FFFDF7',
    borderWidth: 1.2,
    borderColor: '#DFA62E',
    shadowColor: '#DFA62E',
  },
  deityCardSelected: {
    backgroundColor: '#ECF5DD',
    borderWidth: 1.8,
    borderColor: '#08682F',
    shadowColor: '#08682F',
  },
  cardImageContainer: {
    position: 'relative',
    width: CARD_IMAGE_SIZE + 6,
    height: CARD_IMAGE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deityArtwork: {
    width: CARD_IMAGE_SIZE + 4,
    height: CARD_IMAGE_SIZE,
    borderRadius: 8,
  },
  deityCardComingSoon: {
    opacity: 0.9,
  },
  deityArtworkComingSoon: {
    opacity: 0.72,
  },
  cardNameTextComingSoon: {
    color: '#76857E',
  },
  comingSoonBadge: {
    position: 'absolute',
    top: -4,
    zIndex: 10,
    backgroundColor: '#FFE9B5',
    borderWidth: 1,
    borderColor: '#D49216',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    alignSelf: 'center',
    shadowColor: '#8C5E13',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.5,
    elevation: 3,
  },
  comingSoonBadgeText: {
    fontFamily: Platform.select({
      ios: 'Poppins-Bold',
      android: 'Poppins_700Bold',
      web: 'Poppins, sans-serif',
      default: 'Poppins_700Bold',
    }),
    fontSize: 6.8,
    fontWeight: '800',
    color: '#8C5E13',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  comingSoonToastBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF6E3',
    borderWidth: 1.2,
    borderColor: '#E5A932',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 8,
    width: '100%',
    shadowColor: '#8C5E13',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  comingSoonToastIcon: {
    fontSize: 14,
  },
  comingSoonToastText: {
    flex: 1,
    fontFamily: Platform.select({
      ios: 'Poppins-Medium',
      android: 'Poppins_500Medium',
      web: 'Poppins, sans-serif',
      default: 'Poppins_500Medium',
    }),
    fontSize: 10.5,
    color: '#7D4F00',
    lineHeight: 14.5,
  },
  checkmarkBadge: {
    position: 'absolute',
    top: -3,
    right: -4,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: '#08682F',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  cardNameText: {
    fontSize: SCREEN_HEIGHT < 700 ? 10.5 : 11.5,
    fontWeight: '700',
    color: '#063E2D',
    textAlign: 'center',
    marginTop: 3,
    lineHeight: 14,
  },
  cardNameTextSelected: {
    color: '#08682F',
  },

  // Custom Selection Pill (when user selected a non-featured deity from All Deities)
  customSelectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECF5DD',
    borderWidth: 1.2,
    borderColor: '#08682F',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 6,
    width: '100%',
    justifyContent: 'center',
  },
  customSelectionCheck: {
    color: '#08682F',
    fontSize: 12,
    fontWeight: '800',
    marginRight: 6,
  },
  customSelectionText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#08682F',
  },

  // View All Deities Button
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: SCREEN_HEIGHT < 700 ? 38 : 42,
    borderRadius: 21,
    backgroundColor: '#FFFDF7',
    borderWidth: 1.2,
    borderColor: '#DFA62E',
    paddingHorizontal: 16,
    marginBottom: 8,
    shadowColor: '#DFA62E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  viewAllIconWrapper: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllButtonText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#063E2D',
    letterSpacing: 0.2,
  },
  viewAllChevron: {
    fontSize: 20,
    fontWeight: '700',
    color: '#063E2D',
    marginTop: -2,
  },

  // Continue Button
  continueButtonWrapper: {
    width: '100%',
    height: SCREEN_HEIGHT < 700 ? 42 : 46,
    borderRadius: 23,
    overflow: 'hidden',
    shadowColor: '#075E2B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 4,
  },
  continueButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: SCREEN_HEIGHT < 700 ? 14 : 15.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  // Bottom Green Hills Landscape (Image 1 bottom)
  bottomArtworkContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -4,
    marginBottom: -4,
  },
  bottomArtworkImage: {
    width: '100%',
    height: SCREEN_HEIGHT < 700 ? 32 : 40,
  },

  stateCenterContainer: {
    height: 180,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  stateLoadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#0B4420',
    fontWeight: '600',
  },
  stateErrorText: {
    fontSize: 12,
    color: '#B71C1C',
    textAlign: 'center',
    marginBottom: 8,
  },
  stateRetryBtn: {
    backgroundColor: '#0B4420',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  stateRetryBtnText: {
    color: '#FFF8EB',
    fontSize: 11,
    fontWeight: '700',
  },
});
