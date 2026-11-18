import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { SupportedLanguage, DevotionalCategoryItem } from '../../../types';
import { ApiService } from '../../../services/api';
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
} from '../../../components/common/DevotionalIcons';
import { CategorySkeleton } from '../../../components/common/CategorySkeleton';

interface Props {
  currentLanguage: SupportedLanguage;
  onOpenDetail?: (id: string, title: string) => void;
  onOpenPanchangam?: () => void;
  onBack?: () => void;
}

// Right Chevron Arrow
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

// Helper to resolve appropriate devotional icon by slug or title
function getCategoryIcon(slug?: string, title?: string) {
  const text = `${slug || ''} ${title || ''}`.toLowerCase();
  if (text.includes('pooja') || text.includes('vrath') || text.includes('vidhanam') || text.includes('పూజ')) {
    return PoojaVidhanamIcon;
  }
  if (text.includes('astothram') || text.includes('108') || text.includes('1008') || text.includes('అష్టోత్తర')) {
    return AstothramsIcon;
  }
  if (
    text.includes('sloka') ||
    text.includes('mantra') ||
    text.includes('suprabatham') ||
    text.includes('parayana') ||
    text.includes('శ్లోక') ||
    text.includes('సుప్రభాతం')
  ) {
    return SlokasIcon;
  }
  if (text.includes('bhajan') || text.includes('keerthana') || text.includes('song') || text.includes('కీర్తన')) {
    return BhajansIcon;
  }
  if (text.includes('harathi') || text.includes('mangal') || text.includes('హారతి')) {
    return HarathisIcon;
  }
  if (
    text.includes('panchangam') ||
    text.includes('nakshatra') ||
    text.includes('dates') ||
    text.includes('పంచాంగం') ||
    text.includes('నక్షత్ర')
  ) {
    return PanchangamIcon;
  }
  if (text.includes('temple') || text.includes('sannidhanam') || text.includes('ఆలయ')) {
    return TemplesIcon;
  }
  if (text.includes('donation') || text.includes('kanuka') || text.includes('విరాళం')) {
    return DonationsIcon;
  }
  if (text.includes('food') || text.includes('annadanam') || text.includes('అన్నదానం')) {
    return FoodDonationIcon;
  }
  if (text.includes('live') || text.includes('darshan')) {
    return LiveStreamsIcon;
  }
  return KuthuVilakkuIcon;
}

const SEARCH_PLACEHOLDERS: Record<string, string> = {
  te: 'వర్గాలు, పూజలు, స్తోత్రాలు వెతకండి...',
  kn: 'ವರ್ಗಗಳು, ಪೂಜೆಗಳು, ಸ್ತೋತ್ರಗಳನ್ನು ಹುಡುಕಿ...',
  ta: 'வகைகள், பூஜைகள், துதிகளைத் தேடுங்கள்...',
  hi: 'श्रेणियां, पूजा, स्तोत्र खोजें...',
  ml: 'വിഭാഗങ്ങൾ, പൂജകൾ, സ്തോത്രങ്ങൾ തിരയുക...',
  en: 'Search categories, poojas, stotras...',
};

const SCREEN_TITLES: Record<string, string> = {
  te: 'భక్తి వర్గాలు',
  kn: 'ಭಕ್ತಿ ವರ್ಗಗಳು',
  ta: 'பக்தி பிரிவுகள்',
  hi: 'भक्ति श्रेणियां',
  ml: 'ഭക്തി വിഭാഗങ്ങൾ',
  en: 'Categories',
};

export const ServicesScreen: React.FC<Props> = ({
  currentLanguage = 'en',
  onOpenDetail,
  onOpenPanchangam,
  onBack,
}) => {
  const [categories, setCategories] = useState<DevotionalCategoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories strictly from database via server-side API (Strictly NO fake or fallback data)
  const fetchCategories = useCallback(
    async (queryText: string, isManualRefresh = false) => {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const data = await ApiService.getCategories(currentLanguage, queryText);
        setCategories(data);
      } catch (err: any) {
        console.warn('Categories DB Fetch Error:', err.message);
        setError(err.message || 'Failed to load categories from database.');
        setCategories([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentLanguage]
  );

  // Server-side debounced search: triggers on query change
  useEffect(() => {
    let isCancelled = false;
    const timer = setTimeout(() => {
      if (!isCancelled) {
        fetchCategories(searchQuery.trim());
      }
    }, 320);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, fetchCategories]);

  const handleItemPress = (item: DevotionalCategoryItem) => {
    const slug = (item.slug || item.id || '').toLowerCase();
    if (slug === 'panchangam' || slug.includes('panchangam')) {
      onOpenPanchangam?.();
    } else {
      onOpenDetail?.(item.slug || item.id, item.title);
    }
  };

  const placeholderText = SEARCH_PLACEHOLDERS[currentLanguage] || SEARCH_PLACEHOLDERS.en;
  const screenTitle = SCREEN_TITLES[currentLanguage] || SCREEN_TITLES.en;

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
              accessibilityLabel="Back to Home"
            >
              <Text style={styles.backArrowText}>←</Text>
            </TouchableOpacity>
          )}

          {/* Center Title: Categories */}
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitleText}>{screenTitle}</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>

      {/* =========================================================
          2. SERVER-SIDE SEARCH BAR
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
        {searchQuery.trim().length > 0 && (
          <View style={styles.searchMetaRow}>
            <Text style={styles.searchMetaText}>
              Server-side results: {categories.length} found
            </Text>
          </View>
        )}
      </View>

      {/* =========================================================
          3. DYNAMIC CATEGORY CARDS LIST (FROM DB VIA API)
         ========================================================= */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchCategories(searchQuery.trim(), true)}
            colors={['#173D32', '#DFA62E']}
            tintColor="#173D32"
          />
        }
      >
        {/* Industry-Level Animated Shimmer Skeleton Loading */}
        {loading && categories.length === 0 && (
          <CategorySkeleton count={7} />
        )}

        {/* Error State with Retry Button */}
        {error && !loading && categories.length === 0 && (
          <View style={styles.centerContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Database Connection Notice</Text>
            <Text style={styles.errorSubtitle}>{error}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => fetchCategories(searchQuery.trim())}
              activeOpacity={0.8}
            >
              <Text style={styles.retryBtnText}>Retry Connection</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State */}
        {!loading && !error && categories.length === 0 && (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>
              {searchQuery.trim()
                ? `No categories found for "${searchQuery.trim()}"`
                : 'No categories available in database'}
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

        {/* Dynamic Database Category Cards */}
        {categories.length > 0 && (
          <View style={styles.listContainer}>
            {categories.map((item) => {
              const IconComponent = getCategoryIcon(item.slug, item.title);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.categoryCard}
                  activeOpacity={0.82}
                  onPress={() => handleItemPress(item)}
                  accessibilityRole="button"
                  accessibilityLabel={item.title}
                >
                  {/* Left: Rounded Square in Deep Green Gradient */}
                  <LinearGradient
                    colors={['#173D32', '#173D32', '#0C251E']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.iconSquare}
                  >
                    <IconComponent size={24} color="#FFD54F" />
                  </LinearGradient>

                  {/* Center: Title & Dynamic Description from DB */}
                  <View style={styles.textContainer}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    {Boolean(item.description) && (
                      <Text style={styles.cardSubtitle} numberOfLines={1}>
                        {item.description}
                      </Text>
                    )}
                  </View>

                  {/* Right: Chevron Arrow */}
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
    left: 0,
    right: 0,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF8EB',
    letterSpacing: 0.5,
  },

  // Server-Side Search Bar Styles
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
  searchMetaRow: {
    paddingHorizontal: 4,
    paddingTop: 4,
  },
  searchMetaText: {
    fontSize: 11,
    color: '#173D32',
    fontStyle: 'italic',
    fontWeight: '600',
  },

  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 28,
  },
  listContainer: {
    width: '100%',
    gap: 10,
  },
  categoryCard: {
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
  iconSquare: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 213, 79, 0.45)',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: Platform.select({
      ios: 'Poppins-Bold',
      android: 'Poppins_700Bold',
      web: 'Poppins, sans-serif',
      default: 'Poppins_700Bold',
    }),
    fontSize: 15,
    fontWeight: '700',
    color: '#0C251E',
    marginBottom: 3,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6B4B3D',
    fontWeight: '500',
  },
  chevronContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },

  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#173D32',
    fontWeight: '600',
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#C62828',
    marginBottom: 4,
  },
  errorSubtitle: {
    fontSize: 12,
    color: '#6B4B3D',
    textAlign: 'center',
    marginBottom: 14,
  },
  retryBtn: {
    backgroundColor: '#173D32',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#FFF8EB',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 14,
    color: '#5C4436',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  clearFilterBtn: {
    backgroundColor: '#E6C898',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
  },
  clearFilterBtnText: {
    color: '#173D32',
    fontSize: 12,
    fontWeight: '700',
  },
});
