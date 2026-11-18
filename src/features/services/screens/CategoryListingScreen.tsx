import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Polygon } from 'react-native-svg';
import { SupportedLanguage } from '../../../types';
import { CategoryListingSkeleton } from '../../../components/common/CategorySkeleton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  categoryId: string;
  categoryTitle?: string;
  currentLanguage: SupportedLanguage;
  onSelectItem: (id: string, title: string) => void;
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
};

interface ListingItem {
  id: string;
  title: string;
  desc: string;
  deityId: string;
  image: any;
}

// Master Content Definitions for Dynamic Categories
const MASTER_CATEGORY_CONTENT: Record<string, ListingItem[]> = {
  'pooja-vidhanam': [
    {
      id: 'ayyappa-padi-pooja',
      title: 'Ayyappa Padi Pooja',
      desc: 'Pooja procedure, materials & steps',
      deityId: 'ayyappa',
      image: DEITY_IMAGES.ayyappa,
    },
    {
      id: 'ganapathi-pooja',
      title: 'Ganapathi Pooja',
      desc: 'Complete vidhanam & mantras',
      deityId: 'ganesha',
      image: DEITY_IMAGES.ganesha,
    },
    {
      id: 'satyanarayana-vratham',
      title: 'Satyanarayana Vratham',
      desc: 'With story, procedure & benefits',
      deityId: 'venkateswara',
      image: DEITY_IMAGES.venkateswara,
    },
    {
      id: 'lakshmi-pooja',
      title: 'Lakshmi Pooja',
      desc: 'For wealth, prosperity & peace',
      deityId: 'devi',
      image: DEITY_IMAGES.devi,
    },
    {
      id: 'rudrabhishekam',
      title: 'Rudrabhishekam',
      desc: 'For health & removal of obstacles',
      deityId: 'shiva',
      image: DEITY_IMAGES.shiva,
    },
  ],
  astothrams: [
    {
      id: 'ayyappa-astothram',
      title: 'Ayyappa Ashtottaram',
      desc: '108 holy names of Lord Ayyappa',
      deityId: 'ayyappa',
      image: DEITY_IMAGES.ayyappa,
    },
    {
      id: 'ganesha-astothram',
      title: 'Ganesha Ashtottaram',
      desc: '108 sacred names of Lord Vinayaka',
      deityId: 'ganesha',
      image: DEITY_IMAGES.ganesha,
    },
    {
      id: 'shiva-astothram',
      title: 'Shiva Ashtottaram',
      desc: '108 divine names of Lord Shiva',
      deityId: 'shiva',
      image: DEITY_IMAGES.shiva,
    },
    {
      id: 'lakshmi-astothram',
      title: 'Lakshmi Ashtottaram',
      desc: '108 names for wealth & auspiciousness',
      deityId: 'devi',
      image: DEITY_IMAGES.devi,
    },
    {
      id: 'venkateswara-astothram',
      title: 'Venkateswara Ashtottaram',
      desc: '108 sacred names of Lord Balaji',
      deityId: 'venkateswara',
      image: DEITY_IMAGES.venkateswara,
    },
  ],
  slokas: [
    {
      id: 'shiva-tandava',
      title: 'Shiva Tandava Stotram',
      desc: 'Sacred rhythmic stotram of Lord Shiva',
      deityId: 'shiva',
      image: DEITY_IMAGES.shiva,
    },
    {
      id: 'ayyappa-gayatri',
      title: 'Ayyappa Gayatri & Moola Mantram',
      desc: 'Sacred daily invocation mantras',
      deityId: 'ayyappa',
      image: DEITY_IMAGES.ayyappa,
    },
    {
      id: 'ganesha-pancharatnam',
      title: 'Ganesha Pancharatnam',
      desc: 'Adi Shankaracharya sacred five gems',
      deityId: 'ganesha',
      image: DEITY_IMAGES.ganesha,
    },
    {
      id: 'lingashtakam',
      title: 'Lingashtakam',
      desc: 'Brahma Murari Suraarchita sacred verses',
      deityId: 'shiva',
      image: DEITY_IMAGES.shiva,
    },
    {
      id: 'mahishasura-mardini',
      title: 'Mahishasura Mardini Stotram',
      desc: 'Ayigiri Nandini sacred Devi stotram',
      deityId: 'devi',
      image: DEITY_IMAGES.devi,
    },
    {
      id: 'venkateswara-suprabhatam',
      title: 'Venkateswara Suprabhatam',
      desc: 'Kausalya Supraja Rama sacred verses',
      deityId: 'venkateswara',
      image: DEITY_IMAGES.venkateswara,
    },
  ],
  bhajans: [
    {
      id: 'harivarasanam',
      title: 'Harivarasanam',
      desc: 'Sabarimala night devotional lullaby',
      deityId: 'ayyappa',
      image: DEITY_IMAGES.ayyappa,
    },
    {
      id: 'pallikattu',
      title: 'Pallikattu Sabarimalaikku',
      desc: 'Classic pilgrimage chant of devotees',
      deityId: 'ayyappa',
      image: DEITY_IMAGES.ayyappa,
    },
    {
      id: 'shiva-tandava',
      title: 'Shiva Tandava Stotram',
      desc: 'Rhythmic devotional hymn of Shiva',
      deityId: 'shiva',
      image: DEITY_IMAGES.shiva,
    },
    {
      id: 'ganesha-sharanam',
      title: 'Ganesha Sharanam',
      desc: 'Morning obstacle-removal bhajans',
      deityId: 'ganesha',
      image: DEITY_IMAGES.ganesha,
    },
    {
      id: 'ayigiri-nandini-bhajan',
      title: 'Ayigiri Nandini',
      desc: 'Fast-paced devotional Devi chant',
      deityId: 'devi',
      image: DEITY_IMAGES.devi,
    },
  ],
  harathis: [
    {
      id: 'ayyappa-harathi',
      title: 'Ayyappa Mangala Harathi',
      desc: 'Auspicious deeparadhana for Ayyappa',
      deityId: 'ayyappa',
      image: DEITY_IMAGES.ayyappa,
    },
    {
      id: 'ganesha-harathi',
      title: 'Ganesha Mangala Harathi',
      desc: 'Traditional arathi for Vinayaka',
      deityId: 'ganesha',
      image: DEITY_IMAGES.ganesha,
    },
    {
      id: 'shiva-arathi',
      title: 'Shiva Arathi',
      desc: 'Kailasa natha mangala deepam hymn',
      deityId: 'shiva',
      image: DEITY_IMAGES.shiva,
    },
    {
      id: 'lakshmi-arathi',
      title: 'Lakshmi Arathi',
      desc: 'Auspicious deeparadhana hymn',
      deityId: 'devi',
      image: DEITY_IMAGES.devi,
    },
    {
      id: 'karpura-harathi',
      title: 'Karpura Harathi',
      desc: 'Sacred camphor offering verses',
      deityId: 'all',
      image: DEITY_IMAGES.ayyappa,
    },
  ],
};

// Filter tabs definition (Exact match to reference: All | Ayyappa | Shiva | Devi | Ganesha | Venkateswara)
const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'ayyappa', label: 'Ayyappa' },
  { id: 'shiva', label: 'Shiva' },
  { id: 'devi', label: 'Devi' },
  { id: 'ganesha', label: 'Ganesha' },
  { id: 'venkateswara', label: 'Venkateswara' },
];

export const CategoryListingScreen: React.FC<Props> = ({
  categoryId = 'pooja-vidhanam',
  categoryTitle,
  currentLanguage = 'en',
  onSelectItem,
  onBack,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(false);

  // Derive title
  const displayTitle = categoryTitle || (
    categoryId === 'pooja-vidhanam'
      ? 'Pooja Vidhanam'
      : categoryId === 'astothrams'
      ? 'Astothrams'
      : categoryId === 'slokas'
      ? 'Slokas'
      : categoryId === 'bhajans'
      ? 'Bhajans'
      : categoryId === 'harathis'
      ? 'Harathis & Songs'
      : 'Pooja Vidhanam'
  );

  // Fetch items based on category
  const allCategoryItems = MASTER_CATEGORY_CONTENT[categoryId] || MASTER_CATEGORY_CONTENT['pooja-vidhanam'];

  // Filter items by selected deity tab
  const filteredItems = selectedFilter === 'all'
    ? allCategoryItems
    : allCategoryItems.filter((item) => item.deityId === selectedFilter || item.deityId === 'all');

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#173D32" translucent={false} />

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
                onPress={() => setSelectedFilter(tab.id)}
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
      >
        {loading ? (
          <CategoryListingSkeleton count={6} />
        ) : filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items available for this deity.</Text>
            <TouchableOpacity
              style={styles.showAllBtn}
              onPress={() => setSelectedFilter('all')}
            >
              <Text style={styles.showAllText}>Show All</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cardsContainer}>
            {filteredItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.poojaCard}
                activeOpacity={0.82}
                onPress={() => onSelectItem(item.id, item.title)}
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

