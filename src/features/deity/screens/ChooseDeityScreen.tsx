import React, { useState, useEffect, useCallback } from 'react';
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
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { DeityItem, SupportedLanguage } from '../../../types';
import { StorageService } from '../../../services/storageService';
import { ApiService } from '../../../services/api';
import { resolveDeityImage } from '../utils/deityImageResolver';
import { CategorySkeleton } from '../../../components/common/CategorySkeleton';

export interface ChooseDeityScreenProps {
  currentLanguage?: SupportedLanguage;
  onContinue: (selectedDeity: DeityItem) => void;
  onBack: () => void;
}

// Right Chevron Arrow (Matches Services Screen)
const ChevronRightIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
    <Path d="M6.5 4.5 L11 9 L6.5 13.5" stroke="#2E7561" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Header Corner Filigree
const HeaderCornerFiligree = () => (
  <Svg width={36} height={36} viewBox="0 0 36 36" fill="none">
    <Path d="M2 2 C12 2 22 8 28 16 C24 18 18 16 12 22 C8 16 6 8 2 2 Z" fill="#DFA62E" fillOpacity={0.65} />
  </Svg>
);

// Search Outline Icon
const SearchIcon = ({ size = 20, color = '#173D32' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16.5 16.5L21.5 21.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SCREEN_TITLES: Record<string, string> = {
  te: 'ఆరాధ్య దైవాన్ని ఎంచుకోండి',
  kn: 'ಆರಾಧ್ಯ ದೈವವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
  ta: 'உங்கள் தெய்வத்தைத் தேர்வுசெய்க',
  hi: 'अपने आराध्य देव का चयन करें',
  ml: 'നിങ്ങളുടെ ആരാധനാ മൂർത്തിയെ തിരഞ്ഞെടുക്കുക',
  en: 'Choose Your Deity',
};

const SEARCH_PLACEHOLDERS: Record<string, string> = {
  te: 'దేవుడు, దేవత లేదా నామం వెతకండి...',
  kn: 'ದೇವರ ಹೆಸರು, ದೇವತೆ ಹುಡುಕಿ...',
  ta: 'கடவுள் பெயர் அல்லது துதியைத் தேடுங்கள்...',
  hi: 'भगवान या देवी का नाम खोजें...',
  ml: 'ദൈവത്തിന്റെ പേര് തിരയുക...',
  en: 'Search deities, gods, goddesses...',
};

export const ChooseDeityScreen: React.FC<ChooseDeityScreenProps> = ({
  currentLanguage = 'en',
  onContinue,
  onBack,
}) => {
  const [deities, setDeities] = useState<DeityItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeDeityId, setActiveDeityId] = useState<string | null>(null);

  // Restore stored active deity to highlight current selection
  useEffect(() => {
    StorageService.getStoredDeity().then((stored) => {
      if (stored) {
        setActiveDeityId(stored.id || (stored as any).slug || null);
      }
    });
  }, []);

  // Fetch deities strictly from DB via API response (Strictly ZERO mock or fake data)
  const fetchDeities = useCallback(
    async (queryText: string, isManualRefresh = false) => {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const data = await ApiService.getDeities({
          search: queryText || undefined,
          lang: currentLanguage,
        });
        setDeities(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.warn('[ChooseDeityScreen] DB fetch notice:', err?.message || err);
        setError(err?.message || 'Failed to load deities from database.');
        setDeities([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentLanguage]
  );

  useEffect(() => {
    let isCancelled = false;
    const timer = setTimeout(() => {
      if (!isCancelled) {
        fetchDeities(searchQuery.trim());
      }
    }, 280);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, fetchDeities]);

  const handleSelectDeity = async (item: DeityItem) => {
    setActiveDeityId(item.id);
    await StorageService.setStoredDeity(item);
    onContinue(item);
  };

  const getLocalizedName = (item: DeityItem): string => {
    if (currentLanguage === 'en') return item.englishName || item.name;
    if (currentLanguage === 'te') return item.teluguName || item.name;
    if (currentLanguage === 'ta') return item.tamilName || item.englishName || item.name;
    if (currentLanguage === 'kn') return item.kannadaName || item.englishName || item.name;
    if (currentLanguage === 'hi') return item.hindiName || item.englishName || item.name;
    return item.name || item.englishName || item.teluguName || '';
  };

  const getSubtitle = (item: DeityItem): string => {
    if (item.description && item.description.trim()) {
      return item.description.trim();
    }
    const aliases = (item as any).aliases;
    if (Array.isArray(aliases) && aliases.length > 0) {
      return aliases.slice(0, 3).join(' • ');
    }
    if (currentLanguage === 'te') {
      return 'భక్తి పూజలు, స్తోత్రాలు & సేవలు';
    }
    if (currentLanguage === 'ta') {
      return 'பக்தி பூஜைகள் மற்றும் ஸ்தோத்திரங்கள்';
    }
    if (currentLanguage === 'kn') {
      return 'ಭಕ್ತಿ ಪೂಜೆಗಳು ಮತ್ತು ಸ್ತೋತ್ರಗಳು';
    }
    if (currentLanguage === 'hi') {
      return 'भक्ति पूजा, स्तोत्र एवं सेवाएं';
    }
    return 'Devotional Prayers, Sevas & Stotras';
  };

  const screenTitle = SCREEN_TITLES[currentLanguage] || SCREEN_TITLES.en;
  const placeholderText = SEARCH_PLACEHOLDERS[currentLanguage] || SEARCH_PLACEHOLDERS.en;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#173D32" translucent={false} />

      {/* =========================================================
          1. SACRED GREEN HEADER WITH CORNER FILIGREE
         ========================================================= */}
      <SafeAreaView style={styles.safeHeaderArea}>
        <LinearGradient
          colors={['#173D32', '#173D32', '#0C251E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerBar}
        >
          {/* Corner Filigree Ornaments */}
          <View style={styles.cornerTopLeft}>
            <HeaderCornerFiligree />
          </View>
          <View style={styles.cornerTopRight}>
            <HeaderCornerFiligree />
          </View>

          {/* Left: Back Button */}
          {onBack && (
            <TouchableOpacity
              style={styles.backBtn}
              onPress={onBack}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <Text style={styles.backArrowText}>←</Text>
            </TouchableOpacity>
          )}

          {/* Center Title */}
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitleText} numberOfLines={1}>
              {screenTitle}
            </Text>
          </View>
        </LinearGradient>
      </SafeAreaView>

      {/* =========================================================
          2. SEARCH BAR (MATCHING SERVICES SCREEN DESIGN)
         ========================================================= */}
      <View style={styles.searchBarWrapper}>
        <View style={styles.searchBox}>
          <SearchIcon size={19} color="#173D32" />
          <TextInput
            style={styles.searchInput}
            placeholder={placeholderText}
            placeholderTextColor="#8C7661"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />
          {loading && (
            <ActivityIndicator size="small" color="#DFA62E" style={styles.searchSpinner} />
          )}
          {searchQuery.length > 0 && !loading && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.clearBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* =========================================================
          3. SCROLLABLE DEITIES LIST (SERVICES LAYOUT & CARDS)
         ========================================================= */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchDeities(searchQuery.trim(), true)}
            colors={['#173D32', '#DFA62E']}
            tintColor="#173D32"
          />
        }
      >
        {/* Animated Skeleton Loading */}
        {loading && deities.length === 0 && (
          <CategorySkeleton count={8} />
        )}

        {/* Error State with Retry Button */}
        {error && !loading && deities.length === 0 && (
          <View style={styles.centerContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Database Connection Notice</Text>
            <Text style={styles.errorSubtitle}>{error}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => fetchDeities(searchQuery.trim())}
              activeOpacity={0.8}
            >
              <Text style={styles.retryBtnText}>Retry Connection</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State */}
        {!loading && !error && deities.length === 0 && (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>
              {searchQuery.trim()
                ? `No deities found for "${searchQuery.trim()}"`
                : 'No deities available in database'}
            </Text>
            {searchQuery.trim().length > 0 && (
              <TouchableOpacity
                style={styles.clearFilterBtn}
                onPress={() => setSearchQuery('')}
                activeOpacity={0.8}
              >
                <Text style={styles.clearFilterBtnText}>Clear Search Filter</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Deities Cards List (Exact Services Screen Layout) */}
        {deities.length > 0 && (
          <View style={styles.listContainer}>
            {deities.map((item) => {
              const localizedName = getLocalizedName(item);
              const subtitle = getSubtitle(item);
              const isSelected = activeDeityId === item.id || activeDeityId === (item as any).slug;
              const deityImageSource = resolveDeityImage(item);

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.deityCard,
                    isSelected && styles.deityCardSelected,
                  ]}
                  activeOpacity={0.82}
                  onPress={() => handleSelectDeity(item)}
                  accessibilityRole="button"
                  accessibilityLabel={localizedName}
                >
                  {/* Left: Rounded Square Medallion with Deity Image Avatar */}
                  <LinearGradient
                    colors={['#173D32', '#173D32', '#0C251E']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.iconSquare}
                  >
                    <Image
                      source={deityImageSource}
                      style={styles.deityImage}
                      resizeMode="cover"
                    />
                  </LinearGradient>

                  {/* Center: Deity Title & Description */}
                  <View style={styles.textContainer}>
                    <View style={styles.titleRow}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {localizedName}
                      </Text>
                      {isSelected && (
                        <View style={styles.selectedBadge}>
                          <Text style={styles.selectedBadgeText}>Active</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.cardSubtitle} numberOfLines={1}>
                      {subtitle}
                    </Text>
                  </View>

                  {/* Right: Sacred Chevron Arrow */}
                  <View style={styles.chevronContainer}>
                    <ChevronRightIcon />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAF5EB',
  },
  safeHeaderArea: {
    backgroundColor: '#173D32',
  },
  headerBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    position: 'relative',
    borderBottomWidth: 1.2,
    borderBottomColor: '#DFA62E',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    transform: [{ scaleX: -1 }],
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  backArrowText: {
    color: '#FFF8EB',
    fontSize: 24,
    fontWeight: '700',
    marginTop: Platform.OS === 'ios' ? -2 : -4,
  },
  headerTitleContainer: {
    position: 'absolute',
    left: 48,
    right: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleText: {
    fontFamily: Platform.select({
      ios: 'Poppins-Bold',
      android: 'Poppins_700Bold',
      web: 'Poppins, sans-serif',
      default: 'Poppins_700Bold',
    }),
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF8EB',
    letterSpacing: 0.3,
  },

  // Search Bar
  searchBarWrapper: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: '#FAF5EB',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF8',
    borderRadius: 12,
    borderWidth: 1.4,
    borderColor: '#E6C898',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    shadowColor: '#071914',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.06,
    shadowRadius: 2.5,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0C251E',
    marginLeft: 8,
    padding: 0,
    fontFamily: Platform.select({
      ios: 'Poppins-Regular',
      android: 'Poppins_400Regular',
      web: 'Poppins, sans-serif',
      default: 'Poppins_400Regular',
    }),
  },
  searchSpinner: {
    marginLeft: 6,
  },
  clearBtn: {
    padding: 4,
    marginLeft: 4,
  },
  clearBtnText: {
    fontSize: 14,
    color: '#8C7661',
    fontWeight: 'bold',
  },

  // Content List
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 28,
  },
  listContainer: {
    width: '100%',
    gap: 10,
  },
  deityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF8',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#E6C898',
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: '#071914',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  deityCardSelected: {
    borderColor: '#D4932A',
    borderWidth: 1.6,
    backgroundColor: '#FFFBF2',
  },
  iconSquare: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 213, 79, 0.45)',
    overflow: 'hidden',
  },
  deityImage: {
    width: 44,
    height: 44,
    borderRadius: 11,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0C251E',
    letterSpacing: 0.2,
  },
  selectedBadge: {
    backgroundColor: '#173D32',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  selectedBadgeText: {
    color: '#FFD54F',
    fontSize: 10,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontFamily: Platform.select({
      ios: 'Poppins-Regular',
      android: 'Poppins_400Regular',
      default: 'System',
    }),
    fontSize: 12,
    color: '#6E6152',
    marginTop: 2,
  },
  chevronContainer: {
    marginLeft: 8,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Error & Empty States
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  errorIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0C251E',
    marginBottom: 4,
  },
  errorSubtitle: {
    fontSize: 13,
    color: '#6E6152',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: '#173D32',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#FFF8EB',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6E6152',
    textAlign: 'center',
  },
  clearFilterBtn: {
    marginTop: 12,
    backgroundColor: '#E6C898',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  clearFilterBtnText: {
    color: '#0C251E',
    fontWeight: '700',
    fontSize: 12,
  },
});
