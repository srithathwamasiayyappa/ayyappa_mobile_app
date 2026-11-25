import React, { useState, useEffect, useCallback } from 'react';
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
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Polygon } from 'react-native-svg';
import { SupportedLanguage } from '../../../types';
import { CategoryListingSkeleton } from '../../../components/common/CategorySkeleton';
import { ApiService, resolveMediaUrl } from '../../../services/api';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
const { width: SCREEN_WIDTH_FULL, height: SCREEN_HEIGHT_FULL } = Dimensions.get('screen');
const SCREEN_WIDTH = Math.min(WINDOW_WIDTH, SCREEN_WIDTH_FULL);
const SCREEN_HEIGHT = Math.max(WINDOW_HEIGHT, SCREEN_HEIGHT_FULL);
const isLargeOrTallScreen = SCREEN_HEIGHT >= 800 || (SCREEN_HEIGHT / SCREEN_WIDTH) >= 1.95;

// Dynamic status bar / safe area height for Android (with explicit support for 6.7" & 6.8" screens)
const ANDROID_STATUS_BAR_HEIGHT = Platform.OS === 'android'
  ? Math.max(StatusBar.currentHeight || 0, isLargeOrTallScreen ? 44 : 36)
  : 0;

interface Props {
  categoryId: string;
  categoryTitle?: string;
  currentLanguage: SupportedLanguage;
  initialDeity?: string;
  onSelectItem: (id: string, title: string, rawId?: string) => void;
  onBack: () => void;
}

// Corner Filigree Ornaments for Header
const HeaderCornerFiligree = () => (
  <Svg width={36} height={36} viewBox="0 0 36 36" fill="none">
    <Path d="M2 2 C12 2 22 8 28 16 C24 18 18 16 12 22 C8 16 6 8 2 2 Z" fill="#DFA62E" fillOpacity={0.65} />
  </Svg>
);

// Solid Maroon Play Triangle Icon
const PlayTriangleIcon = () => (
  <Svg width={14} height={16} viewBox="0 0 14 16" fill="none">
    <Polygon points="2,1 13,8 2,15" fill="#173D32" />
  </Svg>
);

// Pre-bundled deity artworks
const DEITY_IMAGES: Record<string, any> = {
  ayyappa: require('../../../../assets/deities/ayyappa.jpg'),
  ganesha: require('../../../../assets/deities/ganesha.jpg'),
  venkateswara: require('../../../../assets/deities/venkateswara.jpg'),
  devi: require('../../../../assets/deities/durga.jpg'),
  shiva: require('../../../../assets/deities/shiva.jpg'),
  hanuman: require('../../../../assets/deities/hanuman.jpg'),
  murugan: require('../../../../assets/deities/card_murugan.jpg'),
};

interface ListingItem {
  id: string;
  rawId?: string;
  title: string;
  desc: string;
  deityId: string;
  image: any;
}

// Filter tabs definition (All | Ayyappa | Shiva | Devi | Ganesha | Venkateswara | Hanuman | Murugan)
const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'ayyappa', label: 'Ayyappa' },
  { id: 'shiva', label: 'Shiva' },
  { id: 'devi', label: 'Devi' },
  { id: 'ganesha', label: 'Ganesha' },
  { id: 'venkateswara', label: 'Venkateswara' },
  { id: 'hanuman', label: 'Hanuman' },
  { id: 'murugan', label: 'Murugan' },
];

export const CategoryListingScreen: React.FC<Props> = ({
  categoryId = 'pooja-vidhanam',
  categoryTitle,
  currentLanguage = 'en',
  initialDeity = 'all',
  onSelectItem,
  onBack,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>(initialDeity || 'all');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [dynamicItems, setDynamicItems] = useState<ListingItem[] | null>(null);

  // Load subcategories dynamically from DB via API (Instant live sync with Admin Panel)
  const fetchSubcategories = useCallback(async (isRefresh = false, overrideDeity?: string) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    const deityToFetch = overrideDeity !== undefined ? overrideDeity : selectedFilter;

    try {
      const items = await ApiService.getSubcategories(
        categoryId,
        currentLanguage,
        undefined,
        deityToFetch !== 'all' ? deityToFetch : undefined
      );

      if (Array.isArray(items) && items.length > 0) {
        const mapped: ListingItem[] = items.map((item: any) => {
          const itemDeity = (item.deityId || (deityToFetch !== 'all' ? deityToFetch : 'ayyappa')).toLowerCase();
          let imageSource = DEITY_IMAGES[itemDeity] || DEITY_IMAGES.ayyappa;
          const rawImg = item.imageUrl || item.image || item.artwork;
          if (rawImg && typeof rawImg === 'string' && rawImg.trim()) {
            imageSource = { uri: resolveMediaUrl(rawImg) };
          }

          return {
            id: item.slug || String(item.id),
            rawId: String(item.id),
            title: item.title,
            desc: item.description || item.desc || '',
            deityId: itemDeity,
            image: imageSource,
          };
        });
        setDynamicItems(mapped);
      } else {
        setDynamicItems([]);
      }
    } catch (e) {
      console.warn('Error fetching dynamic subcategories:', e);
      setDynamicItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [categoryId, currentLanguage, selectedFilter]);

  useEffect(() => {
    const activeD = initialDeity && initialDeity !== 'all' ? initialDeity : 'all';
    setSelectedFilter(activeD);
    fetchSubcategories(false, activeD);
  }, [initialDeity, categoryId]);

  const handleFilterChange = (filterId: string) => {
    setSelectedFilter(filterId);
    fetchSubcategories(false, filterId);
  };

  // Derive title
  const displayTitle = categoryTitle || (
    categoryId === 'pooja-vidhanam' || categoryId === 'pooja'
      ? 'Pooja Vidhanam'
      : categoryId === 'stotras'
      ? 'Divine Stotras'
      : categoryId === 'astothrams'
      ? 'Astothrams'
      : categoryId === 'slokas'
      ? 'Daily Slokas'
      : categoryId === 'bhajans' || categoryId === 'songs'
      ? 'Bhajans & Songs'
      : categoryId === 'harathis'
      ? 'Harathis & Songs'
      : 'Pooja Vidhanam'
  );

  // Strictly database-driven via API: zero mock or fallback data
  const allCategoryItems = dynamicItems || [];

  // Filter items by selected deity tab
  const filteredItems = selectedFilter === 'all'
    ? allCategoryItems
    : allCategoryItems.filter((item) => item.deityId === selectedFilter || item.deityId === 'all');

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#173D32" translucent />

      {/* =========================================================
          1. SACRED MAROON HEADER WITH BACK ARROW & CORNER FILIGREE
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

          {/* Center Title: Pooja Vidhanam / Dynamic Title */}
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitleText} numberOfLines={1}>
              {displayTitle}
            </Text>
          </View>
        </LinearGradient>
      </SafeAreaView>

      {/* =========================================================
          2. HORIZONTAL DEITY FILTER ROW (All | Ayyappa | Shiva | Devi | Ganesha)
         ========================================================= */}
      <View style={styles.filterBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {FILTER_TABS.map((tab) => {
            const isSelected = selectedFilter === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => handleFilterChange(tab.id)}
                activeOpacity={0.8}
                style={[
                  styles.filterTab,
                  isSelected ? styles.filterTabSelected : styles.filterTabUnselected,
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={tab.label}
              >
                {isSelected ? (
                  <LinearGradient
                    colors={['#173D32', '#173D32', '#0C251E']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.filterTabGradient}
                  >
                    <Text style={styles.filterTextSelected}>{tab.label}</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.filterTextUnselected}>{tab.label}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* =========================================================
          3. VERTICAL LIST OF POOJA / CATEGORY CARDS
         ========================================================= */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchSubcategories(true)}
            colors={['#173D32', '#DFA62E']}
            tintColor="#173D32"
          />
        }
      >
        {loading && !refreshing ? (
          <CategoryListingSkeleton count={6} />
        ) : filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items available for this deity.</Text>
            <TouchableOpacity
              style={styles.showAllBtn}
              onPress={() => handleFilterChange('all')}
            >
              <Text style={styles.showAllText}>Show All</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cardsContainer}>
            {filteredItems.map((item) => (
              <TouchableOpacity
                key={item.rawId || item.id}
                style={styles.poojaCard}
                activeOpacity={0.82}
                onPress={() => {
                  const isPadiCard =
                    item.id === 'ayyappa-padi-pooja' ||
                    item.rawId === '117' ||
                    item.id === '117' ||
                    (item.id && String(item.id).toLowerCase().includes('padi')) ||
                    (item.title && (
                      item.title.includes('పడి') ||
                      item.title.toLowerCase().includes('padi') ||
                      item.title.includes('అయ్యప్ప పూజ')
                    ));
                  if (isPadiCard) {
                    onSelectItem('ayyappa-padi-pooja', item.title, item.rawId || '117');
                  } else {
                    onSelectItem(item.id, item.title, item.rawId);
                  }
                }}
                accessibilityRole="button"
                accessibilityLabel={item.title}
              >
                {/* Left: Square Devotional Artwork Thumbnail */}
                <View style={styles.imageThumbnailWrapper}>
                  <Image
                    source={item.image}
                    style={styles.imageThumbnail}
                    resizeMode="cover"
                  />
                  <View style={styles.imageThumbnailBorder} />
                </View>

                {/* Center: Title & Short Description */}
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.cardDescription} numberOfLines={2}>
                    {item.desc}
                  </Text>
                </View>

                {/* Right: Solid Maroon Play/Forward Triangle Icon */}
                <View style={styles.playIconContainer}>
                  <PlayTriangleIcon />
                </View>
              </TouchableOpacity>
            ))}
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
    paddingTop: ANDROID_STATUS_BAR_HEIGHT,
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
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 21,
    fontWeight: '700',
    color: '#FFF8EB',
    letterSpacing: 0.5,
  },

  // Horizontal Deity Filter Bar
  filterBarContainer: {
    backgroundColor: '#FAF5EB',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(223, 166, 46, 0.25)',
  },
  filterScrollContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  filterTab: {
    borderRadius: 18,
    minHeight: 34,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  filterTabUnselected: {
    backgroundColor: '#FFFDF8',
    borderWidth: 1.2,
    borderColor: '#E6C898',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  filterTabSelected: {
    borderWidth: 1,
    borderColor: '#DFA62E',
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  filterTabGradient: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTextSelected: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  filterTextUnselected: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#173D32',
    letterSpacing: 0.2,
  },

  // Content Cards List
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 24,
  },
  cardsContainer: {
    width: '100%',
    gap: 10,
  },
  poojaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF8',
    borderRadius: 16,
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
  imageThumbnailWrapper: {
    width: 62,
    height: 62,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 12,
  },
  imageThumbnail: {
    width: '100%',
    height: '100%',
  },
  imageThumbnailBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(223, 166, 46, 0.45)',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 6,
  },
  cardTitle: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0C251E',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  cardDescription: {
    fontSize: 12,
    color: '#6B4B3D',
    lineHeight: 16,
    fontWeight: '500',
  },
  playIconContainer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },

  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#7D6A58',
    marginBottom: 12,
  },
  showAllBtn: {
    backgroundColor: '#173D32',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  showAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

