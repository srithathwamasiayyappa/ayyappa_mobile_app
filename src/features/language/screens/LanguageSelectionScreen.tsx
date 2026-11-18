import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Platform,
  Image,
  ImageBackground,
  BackHandler,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { StorageService } from '../../../services/storageService';
import { ApiService } from '../../../services/api';
import { SupportedLanguage, LanguageItem } from '../../../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Master Assets (Exact Image 2 Background, Image 3 Logo, Image 1 Artwork)
const SARANAM_LANGUAGE_BG = require('../../../../assets/language/saranam_language_bg.jpg');
const SARANAM_LANGUAGE_EMBLEM = require('../../../../assets/language/saranam_language_emblem.png');
const BOTTOM_GREEN_HILLS = require('../../../../assets/language/bottom_green_hills.jpg');

// 1. Telugu Traditional Temple/Gopuram Icon
const TeluguTempleIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2 L13.5 5 H10.5 Z" fill={color} />
    <Path d="M12 1.5 V0.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M7 8 L12 4 L17 8 H7 Z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" fill="none" />
    <Path d="M5 12 L12 7 L19 12 H5 Z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" fill="none" />
    <Path d="M4 12 H20 V20 H4 Z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" fill="none" />
    <Path d="M9.5 20 V14 C9.5 12.8 14.5 12.8 14.5 14 V20" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M2 20 H22" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

// 2. English Open Book Icon
const EnglishBookIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 19.5 C4 18.1 5.1 17 6.5 17 H20 V4 H6.5 C5.1 4 4 5.1 4 6.5 V19.5 Z"
      stroke={color}
      strokeWidth={1.7}
      strokeLinejoin="round"
      fill="none"
    />
    <Path d="M12 6 V19.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M7 8 H10 M7 11 H10" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
    <Path d="M14 8 H17 M14 11 H17" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
  </Svg>
);

// 3. Tamil South Indian Gopuram Tower Icon
const TamilGopuramIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M10 2.5 H14 V4 H10 Z" fill={color} />
    <Circle cx="10" cy="1.8" r="0.8" fill={color} />
    <Circle cx="12" cy="1.5" r="0.9" fill={color} />
    <Circle cx="14" cy="1.8" r="0.8" fill={color} />
    <Path d="M8.5 4 H15.5 L15 7.5 H9 Z" stroke={color} strokeWidth={1.5} strokeLinejoin="round" fill="none" />
    <Path d="M7 7.5 H17 L16.5 12 H7.5 Z" stroke={color} strokeWidth={1.5} strokeLinejoin="round" fill="none" />
    <Path d="M5.5 12 H18.5 L18 17 H6 Z" stroke={color} strokeWidth={1.5} strokeLinejoin="round" fill="none" />
    <Path d="M4 17 H20 V21.5 H4 Z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" fill="none" />
    <Path d="M10 21.5 V17.5 C10 16.5 14 16.5 14 17.5 V21.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
  </Svg>
);

// 4. Kannada Sacred Cultural/Nandi Emblem
const KannadaSacredIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 18 C4 14 7 11 11 11 H14 C17 11 19 13 20 16 V19 C20 19.8 19.2 20.5 18.5 20.5 H5 C4.4 20.5 4 19.8 4 18 Z"
      stroke={color}
      strokeWidth={1.6}
      strokeLinejoin="round"
      fill="none"
    />
    <Path d="M6 10 C5 7 7 4 10 4 C11.5 4 12 5 12 7" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M9 4 C8 2 10 1 11 1.5" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
    <Circle cx="8" cy="8" r="1.2" fill={color} />
    <Path d="M12 9 C13 7.5 15 7 16 8.5" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
    <Path d="M8 20.5 V17 M17 20.5 V17" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M12 14 H15" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
  </Svg>
);

// 5. Hindi Heritage Gateway Arch Icon
const HindiGatewayIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M3 5 H21 V7.5 H3 Z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" fill="none" />
    <Path d="M7 2.5 H17 V5 H7 Z" stroke={color} strokeWidth={1.4} strokeLinejoin="round" fill="none" />
    <Path d="M12 1 V2.5" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
    <Path d="M4.5 7.5 V21" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Path d="M7.5 7.5 V21" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M16.5 7.5 V21" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M19.5 7.5 V21" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Path
      d="M7.5 14.5 C7.5 10.5 16.5 10.5 16.5 14.5 V21 H7.5 V14.5 Z"
      stroke={color}
      strokeWidth={1.6}
      strokeLinejoin="round"
      fill="none"
    />
    <Path d="M2 21 H22" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

// Icon Resolver based on database language code
const getLanguageIcon = (code: string) => {
  switch (code.toLowerCase()) {
    case 'te':
      return TeluguTempleIcon;
    case 'en':
      return EnglishBookIcon;
    case 'ta':
      return TamilGopuramIcon;
    case 'kn':
      return KannadaSacredIcon;
    case 'hi':
      return HindiGatewayIcon;
    default:
      return TeluguTempleIcon;
  }
};

interface Props {
  onLanguageSelected: (lang: SupportedLanguage) => void;
  onBack?: () => void;
  currentLanguage?: SupportedLanguage;
  currentUser?: any;
  currentDeity?: any;
}

export const LanguageSelectionScreen: React.FC<Props> = ({
  onLanguageSelected,
  onBack,
  currentLanguage = 'te',
}) => {
  // DB-backed dynamic language states (No static/fallback fake data)
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(currentLanguage);

  // Fetch languages directly from DB via API response
  const fetchDbLanguages = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const dbLanguages = await ApiService.getLanguages();

      if (!Array.isArray(dbLanguages) || dbLanguages.length === 0) {
        throw new Error('No languages received from the database');
      }

      setLanguages(dbLanguages);

      // Check if stored language exists in DB response, otherwise default to first DB record
      const stored = await StorageService.getStoredLanguage();
      if (stored && dbLanguages.some((l) => l.code === stored)) {
        setSelectedLang(stored);
      } else if (dbLanguages.length > 0) {
        setSelectedLang(dbLanguages[0].code as SupportedLanguage);
      }
    } catch (err: any) {
      console.warn('Database languages fetch error:', err);
      setErrorMessage(
        err?.message || 'Unable to connect to database. Please check your connection and tap retry.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDbLanguages();
  }, []);

  // Android Mobile Hardware Back Button Handling
  useEffect(() => {
    if (!onBack) return;
    const backSub = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => backSub.remove();
  }, [onBack]);

  const handleSelect = (code: SupportedLanguage) => {
    setSelectedLang(code);
  };

  const handleContinue = async () => {
    await StorageService.setStoredLanguage(selectedLang);
    onLanguageSelected(selectedLang);
  };

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* 1. Full-Screen Scenic Devotional Temple Background (Image 2) */}
      <ImageBackground
        source={SARANAM_LANGUAGE_BG}
        style={styles.fullScreenBackground}
        imageStyle={styles.backgroundImageStyle}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.fixedContentContainer}>
            {/* 2. Authentic Saranam Ayyappa Logo (Image 3) */}
            <View style={styles.logoContainer}>
              <Image
                source={SARANAM_LANGUAGE_EMBLEM}
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

                {/* 4. Title: Choose Your Language flanked by gold lines */}
                <View style={styles.headingRow}>
                  <View style={styles.headingLine} />
                  <Text style={styles.headingText}>Choose Your Language</Text>
                  <View style={styles.headingLine} />
                </View>

                {/* 5. Subtitle */}
                <Text style={styles.subtitleText}>
                  Select your preferred language for prayers,{'\n'}poojas and devotional content
                </Text>

                {/* 6. Dynamic Languages List from Database API Response */}
                {loading ? (
                  <View style={styles.stateCenterContainer}>
                    <ActivityIndicator size="large" color="#08682F" />
                    <Text style={styles.stateLoadingTitle}>Connecting to Database...</Text>
                    <Text style={styles.stateLoadingSubtitle}>Fetching languages via API</Text>
                  </View>
                ) : errorMessage ? (
                  <View style={styles.stateCenterContainer}>
                    <Text style={styles.stateErrorIcon}>⚠️</Text>
                    <Text style={styles.stateErrorTitle}>Database Connection Required</Text>
                    <Text style={styles.stateErrorMessage}>{errorMessage}</Text>
                    <TouchableOpacity
                      style={styles.retryButton}
                      onPress={fetchDbLanguages}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.retryButtonText}>↻ Retry Connecting</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.languagesContainer}>
                    {languages.map((lang) => {
                      const isSelected = selectedLang === lang.code;
                      const IconComponent = getLanguageIcon(lang.code);

                      return (
                        <TouchableOpacity
                          key={String(lang.id || lang.code)}
                          style={[
                            styles.languageRow,
                            isSelected ? styles.languageRowSelected : styles.languageRowUnselected,
                          ]}
                          onPress={() => handleSelect(lang.code as SupportedLanguage)}
                          activeOpacity={0.85}
                          accessibilityRole="radio"
                          accessibilityState={{ selected: isSelected }}
                          accessibilityLabel={`${lang.nativeName || lang.name} (${lang.englishName || lang.name})`}
                        >
                          {/* Left Side: Icon + Vertical Divider + Labels */}
                          <View style={styles.rowLeftGroup}>
                            <View style={styles.iconWrapper}>
                              <IconComponent color={isSelected ? '#075E2B' : '#B8860B'} />
                            </View>

                            <View
                              style={[
                                styles.rowVerticalDivider,
                                isSelected ? styles.dividerSelected : styles.dividerUnselected,
                              ]}
                            />

                            <View style={styles.labelWrapper}>
                              {lang.nativeName && lang.nativeName !== lang.name ? (
                                <View style={styles.langNameInline}>
                                  <Text
                                    style={[
                                      styles.nativeScriptText,
                                      isSelected && styles.nativeScriptTextSelected,
                                    ]}
                                  >
                                    {lang.nativeName}
                                  </Text>
                                  <Text
                                    style={[
                                      styles.englishLabelText,
                                      isSelected && styles.englishLabelTextSelected,
                                    ]}
                                  >
                                    ({lang.englishName || lang.name})
                                  </Text>
                                </View>
                              ) : (
                                <Text
                                  style={[
                                    styles.nativeScriptText,
                                    isSelected && styles.nativeScriptTextSelected,
                                  ]}
                                >
                                  {lang.name}
                                </Text>
                              )}
                            </View>
                          </View>

                          {/* Right Side: Radio / Check Indicator */}
                          {isSelected ? (
                            <View style={styles.checkedCircle}>
                              <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
                                <Path
                                  d="M3 7.2 L5.6 9.8 L11 4.2"
                                  stroke="#FFFFFF"
                                  strokeWidth={2.2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </Svg>
                            </View>
                          ) : (
                            <View style={styles.unselectedCircle} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* 7. Continue Button (Active when languages loaded) */}
                {!loading && !errorMessage && languages.length > 0 && (
                  <TouchableOpacity
                    style={styles.continueButtonWrapper}
                    onPress={handleContinue}
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
                )}

                {/* 8. Information Text */}
                <Text style={styles.settingsNoticeText}>
                  You can change language later in Settings
                </Text>

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
        </SafeAreaView>
      </ImageBackground>
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
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 16) + 4 : 8,
  },
  fixedContentContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Platform.OS === 'ios' ? 16 : 8,
  },

  // Centered Saranam Ayyappa Logo (Image 3)
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SCREEN_HEIGHT < 700 ? 0 : 6,
    marginBottom: SCREEN_HEIGHT < 700 ? -22 : -16,
    zIndex: 10,
  },
  logoImage: {
    width: SCREEN_HEIGHT < 700 ? 120 : (SCREEN_HEIGHT < 820 ? 140 : 155),
    height: SCREEN_HEIGHT < 700 ? 138 : (SCREEN_HEIGHT < 820 ? 160 : 178),
  },

  // Main Ivory Ornamental Panel (Image 1)
  panelShadowWrapper: {
    width: Math.min(SCREEN_WIDTH * 0.92, 380),
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
    paddingBottom: SCREEN_HEIGHT < 700 ? 6 : 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },

  // Panel Top Decorative Crest
  panelCrownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    width: '100%',
  },
  crownFlankLine: {
    width: 34,
    height: 1.2,
    backgroundColor: '#DFA62E',
    opacity: 0.8,
  },
  crownDiamond: {
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Title: Choose Your Language
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 4,
  },
  headingLine: {
    flex: 1,
    maxWidth: 24,
    height: 1.2,
    backgroundColor: '#DFA62E',
    opacity: 0.7,
  },
  headingText: {
    fontSize: SCREEN_HEIGHT < 700 ? 19 : 22,
    fontWeight: '800',
    color: '#063E2D',
    fontFamily: Platform.select({
      ios: 'Poppins-Bold',
      android: 'Poppins_700Bold',
      web: 'Poppins, sans-serif',
      default: 'Poppins_700Bold',
    }),
    letterSpacing: 0.4,
    marginHorizontal: 8,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: SCREEN_HEIGHT < 700 ? 11 : 12,
    color: '#3A4B43',
    textAlign: 'center',
    lineHeight: SCREEN_HEIGHT < 700 ? 15 : 17,
    marginBottom: SCREEN_HEIGHT < 700 ? 8 : 12,
    paddingHorizontal: 10,
  },

  // State Containers (Loading & Error States - Zero fake/fallback data)
  stateCenterContainer: {
    width: '100%',
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 220,
  },
  stateLoadingTitle: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#063E2D',
  },
  stateLoadingSubtitle: {
    marginTop: 4,
    fontSize: 11,
    color: '#7D8D84',
  },
  stateErrorIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  stateErrorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8A1F11',
    textAlign: 'center',
    marginBottom: 4,
  },
  stateErrorMessage: {
    fontSize: 11,
    color: '#555555',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  retryButton: {
    backgroundColor: '#075E2B',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 18,
    shadowColor: '#075E2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  // Language Rows Stack
  languagesContainer: {
    width: '100%',
    marginBottom: SCREEN_HEIGHT < 700 ? 8 : 12,
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: SCREEN_HEIGHT < 700 ? 42 : 46,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: SCREEN_HEIGHT < 700 ? 6 : 8,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  languageRowUnselected: {
    backgroundColor: '#FFFDF7',
    borderWidth: 1.2,
    borderColor: '#DFA62E',
    shadowColor: '#DFA62E',
  },
  languageRowSelected: {
    backgroundColor: '#ECF5DD',
    borderWidth: 1.8,
    borderColor: '#075E2B',
    shadowColor: '#075E2B',
  },
  rowLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rowVerticalDivider: {
    width: 1.2,
    height: 20,
    marginRight: 12,
  },
  dividerUnselected: {
    backgroundColor: '#DFA62E',
    opacity: 0.7,
  },
  dividerSelected: {
    backgroundColor: '#075E2B',
    opacity: 0.9,
  },
  labelWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  langNameInline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nativeScriptText: {
    fontSize: SCREEN_HEIGHT < 700 ? 15 : 16.5,
    fontWeight: '700',
    color: '#1C3B2B',
  },
  nativeScriptTextSelected: {
    color: '#075E2B',
    fontWeight: '800',
  },
  englishLabelText: {
    fontSize: SCREEN_HEIGHT < 700 ? 12 : 13,
    fontWeight: '500',
    color: '#2E4C3B',
    marginLeft: 6,
  },
  englishLabelTextSelected: {
    color: '#075E2B',
    fontWeight: '600',
  },

  // Right Side Checkmarks
  unselectedCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.4,
    borderColor: '#DFA62E',
    backgroundColor: '#FFFDF7',
  },
  checkedCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#075E2B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#075E2B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
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
    marginBottom: 6,
  },
  continueButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: SCREEN_HEIGHT < 700 ? 14.5 : 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Information Notice
  settingsNoticeText: {
    fontSize: 10.5,
    fontStyle: 'italic',
    color: '#4A5B52',
    textAlign: 'center',
    marginBottom: 6,
  },

  // Bottom Decorative Artwork
  bottomArtworkContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -4,
    marginBottom: -4,
  },
  bottomArtworkImage: {
    width: '100%',
    height: SCREEN_HEIGHT < 700 ? 34 : 42,
  },
});
