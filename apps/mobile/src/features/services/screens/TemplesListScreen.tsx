import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Platform,
  Image,
  ActivityIndicator,
  BackHandler,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { SupportedLanguage, TempleItem } from '../../../types';
import { ApiService } from '../../../services/api';
import { MASTER_TEMPLES } from '../../../data/templesData';

interface Props {
  currentLanguage: SupportedLanguage;
  currentDeity?: string;
  onBack: () => void;
  onSelectTemple: (temple: TempleItem) => void;
}

// Corner Filigree Ornaments for Header
const HeaderCornerFiligree = ({ flipped = false }: { flipped?: boolean }) => (
  <View style={flipped ? { transform: [{ scaleX: -1 }] } : undefined}>
    <Svg width={36} height={36} viewBox="0 0 36 36" fill="none">
      <Path
        d="M2 2 C12 2 22 8 28 16 C24 18 18 16 12 22 C8 16 6 8 2 2 Z"
        fill="#DFA62E"
        fillOpacity={0.8}
      />
      <Circle cx="8" cy="8" r="2" fill="#FFD700" />
      <Circle cx="16" cy="5" r="1.5" fill="#FFD700" />
      <Circle cx="5" cy="16" r="1.5" fill="#FFD700" />
    </Svg>
  </View>
);

// Back Arrow inside Header
const BackArrowIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M12 19l-7-7 7-7"
      stroke="#FFFDF8"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Search Magnifier Icon
const SearchIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="7" stroke="#2E7561" strokeWidth={2} />
    <Path d="M20 20L16 16" stroke="#2E7561" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// Right Chevron for Temple Card
const ChevronRightIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 5l7 7-7 7"
      stroke="#173D32"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Multilingual translations for UI labels
const UI_TRANSLATIONS: Record<string, Record<string, string>> = {
  screenTitle: {
    en: 'Temples in India',
    te: 'భారతదేశ ప్రముఖ దేవాలయాలు',
    kn: 'ಭಾರತದ ಪ್ರಸಿದ್ಧ ದೇವಾಲಯಗಳು',
    ta: 'இந்தியாவின் புகழ்பெற்ற கோயில்கள்',
    hi: 'भारत के प्रसिद्ध मंदिर',
    ml: 'ഭാരതത്തിലെ പുണ്യ ക്ഷേത്രങ്ങൾ',
  },
  searchPlaceholder: {
    en: 'Search temples, city or deity',
    te: 'దేవాలయం, నగరం లేదా దేవుని పేరు వెతకండి',
    kn: 'ದೇವಾಲಯ, ನಗರ ಅಥವಾ ದೇವರ ಹೆಸರನ್ನು ಹುಡುಕಿ',
    ta: 'கோயில், ஊர் அல்லது தெய்வத்தின் பெயரைத் தேடுங்கள்',
    hi: 'मंदिर, शहर या देवता का नाम खोजें',
    ml: 'ക്ഷേത്രം, നഗരം അല്ലെങ്കിൽ ദേവനെ തിരയുക',
  },
  all: {
    en: 'All',
    te: 'అన్నీ',
    kn: 'ಎಲ್ಲಾ',
    ta: 'அனைத்தும்',
    hi: 'सभी',
    ml: 'എല്ലാം',
  },
  noResults: {
    en: 'No temples found matching your search.',
    te: 'మీ శోధనకు తగిన దేవాలయాలు లభించలేదు.',
    kn: 'ನಿಮ್ಮ ಹುಡುಕಾಟಕ್ಕೆ ಹೊಂದಿಕೆಯಾಗುವ ದೇವಾಲಯಗಳು ಕಂಡುಬಂದಿಲ್ಲ.',
    ta: 'உங்கள் தேடலுக்கு ஏற்ற கோயில்கள் கிடைக்கவில்லை.',
    hi: 'आपकी खोज से मेल खाने वाले मंदिर नहीं मिले।',
    ml: 'നിങ്ങൾ തിരഞ്ഞ ക്ഷേത്രങ്ങൾ ലഭ്യമായിട്ടില്ല.',
  },
  clearFilters: {
    en: 'Clear Filters',
    te: 'ఫిల్టర్లు తొలగించండి',
    kn: 'ಫಿಲ್ಟರ್‌ಗಳನ್ನು ತೆರವುಗೊಳಿಸಿ',
    ta: 'வடிகட்டிகளை அழிக்கவும்',
    hi: 'फ़िल्टर हटाएं',
    ml: 'ഫിൽട്ടറുകൾ നീക്കുക',
  },
};

// Deity filter options
const DEITY_FILTERS = [
  { id: 'all', label: { en: 'All', te: 'అన్నీ', kn: 'ಎಲ್ಲಾ', ta: 'அனைத்தும்', hi: 'सभी', ml: 'എല്ലാം' } },
  { id: 'ayyappa', label: { en: 'Ayyappa', te: 'అయ్యప్ప', kn: 'ಅಯ್ಯಪ್ಪ', ta: 'ஐயப்பன', hi: 'अय्यप्पा', ml: 'അയ്യപ്പൻ' } },
  { id: 'shiva', label: { en: 'Shiva', te: 'శివ', kn: 'ಶಿವ', ta: 'சிவன்', hi: 'शिव', ml: 'ശിവൻ' } },
  { id: 'venkateswara', label: { en: 'Venkateswara', te: 'వెంకటేశ్వర', kn: 'ವೆಂಕಟೇಶ್ವರ', ta: 'வெங்கடேஸ்வரா', hi: 'वेंकटेश्वर', ml: 'വെങ്കിടേശ്വരൻ' } },
  { id: 'devi', label: { en: 'Devi', te: 'అమ్మవారు', kn: 'ದೇವಿ', ta: 'தேவி', hi: 'देवी', ml: 'ദേവി' } },
  { id: 'ganesha', label: { en: 'Ganesha', te: 'గణపతి', kn: 'ಗಣೇಶ', ta: 'விநாயகர்', hi: 'गणेश', ml: 'ഗണപതി' } },
  { id: 'murugan', label: { en: 'Murugan', te: 'సుబ్రహ్మణ్య', kn: 'ಮುರುಗ', ta: 'முருகன்', hi: 'मुरुगन', ml: 'മുരുകൻ' } },
  { id: 'krishna', label: { en: 'Krishna', te: 'కృష్ణ', kn: 'ಕೃಷ್ಣ', ta: 'கிருஷ்ணன்', hi: 'कृष्ण', ml: 'കൃഷ്ണൻ' } },
];

import { resolveMediaUrl } from '../../../services/api';

const TempleItemThumbnail: React.FC<{ item: TempleItem }> = ({ item }) => {
  const imgUrl = resolveMediaUrl(item.thumbnailUrl || item.heroImageUrl);
  return (
    <View style={styles.thumbnailContainer}>
      {imgUrl ? (
        <Image
          source={{ uri: imgUrl }}
          style={styles.thumbnailImageCrop}
          resizeMode="cover"
        />
      ) : null}
    </View>
  );
};

export const TemplesListScreen: React.FC<Props> = ({
  currentLanguage,
  currentDeity,
  onBack,
  onSelectTemple,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDeity, setSelectedDeity] = useState<string>('all');
  const [temples, setTemples] = useState<TempleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Android Hardware Back Button
  useEffect(() => {
    if (!onBack) return;
    const backSub = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => backSub.remove();
  }, [onBack]);

  // Load and filter temples strictly from DB via API (No static / fallback / fake data)
  const fetchTemples = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getTemples(currentLanguage, searchQuery, selectedDeity);
      setTemples(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load temples from server');
      setTemples([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedDeity, currentLanguage]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchTemples();
    }, 180);

    return () => {
      clearTimeout(timeout);
    };
  }, [fetchTemples]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedDeity('all');
  }, []);

  // Thumbnail crop offsets from temples_list_ref.png or remote thumbnailUrl with automatic error fallback
  const renderThumbnail = (item: TempleItem) => {
    return <TempleItemThumbnail item={item} />;
  };

  const renderTempleCard = ({ item }: { item: TempleItem }) => {
    // Dynamic localized name with master fallback if API returned empty localNames
    const masterFallback = MASTER_TEMPLES.find(
      (m) =>
        m.id === item.id ||
        (m.slug && (m.slug === item.slug || item.id?.includes(m.slug))) ||
        (item.name && m.name && item.name.toLowerCase().includes(m.name.toLowerCase()))
    );
    const resolvedLocalNames = {
      ...(masterFallback?.localNames || {}),
      ...(item.localNames || {}),
    };
    const localizedName =
      resolvedLocalNames[currentLanguage] || item.name;

    return (
      <TouchableOpacity
        style={styles.templeCard}
        activeOpacity={0.82}
        onPress={() => onSelectTemple(item)}
      >
        {/* Left Thumbnail */}
        {renderThumbnail(item)}

        {/* Center Info */}
        <View style={styles.cardCenterInfo}>
          <Text style={styles.templeNameText} numberOfLines={1}>
            {localizedName}
          </Text>
          <Text style={styles.templeLocationText} numberOfLines={1}>
            {item.city}, {item.state}
          </Text>
        </View>

        {/* Right Chevron */}
        <View style={styles.cardRightChevron}>
          <ChevronRightIcon />
        </View>
      </TouchableOpacity>
    );
  };

  const langKey = currentLanguage in UI_TRANSLATIONS.screenTitle ? currentLanguage : 'en';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#173D32" />

      {/* =========================================================================
          HEADER: Deep Maroon Gradient + Corner Filigree + Back Button + Title
         ========================================================================= */}
      <LinearGradient
        colors={['#173D32', '#173D32', '#173D32']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <SafeAreaView style={styles.headerSafeArea}>
          {/* Back Arrow */}
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={onBack}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <BackArrowIcon />
          </TouchableOpacity>

          {/* Screen Title */}
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {UI_TRANSLATIONS.screenTitle[langKey] || 'Temples in India'}
            </Text>
          </View>

          {/* Corner Filigrees */}
          <View style={styles.headerRightOrnament} pointerEvents="none">
            <HeaderCornerFiligree flipped />
          </View>
          <View style={styles.filigreeTopLeft} pointerEvents="none">
            <HeaderCornerFiligree />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* =========================================================================
          SEARCH BAR: Cream/White Capsule with Magnifier Icon
         ========================================================================= */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <SearchIcon />
          <TextInput
            style={styles.searchInput}
            placeholder={
              UI_TRANSLATIONS.searchPlaceholder[langKey] ||
              'Search temples, city or deity'
            }
            placeholderTextColor="#2E7561"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* =========================================================================
          DEITY FILTER CHIPS: Horizontally Scrollable Pills
         ========================================================================= */}
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContent}
        >
          {DEITY_FILTERS.map((df) => {
            const isSelected = selectedDeity === df.id;
            const filterLabel = (df.label as Record<string, string>)[langKey] || df.label.en;

            return (
              <TouchableOpacity
                key={df.id}
                style={[
                  styles.filterPill,
                  isSelected ? styles.filterPillSelected : styles.filterPillUnselected,
                ]}
                activeOpacity={0.75}
                onPress={() => setSelectedDeity(df.id)}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    isSelected
                      ? styles.filterPillTextSelected
                      : styles.filterPillTextUnselected,
                  ]}
                >
                  {filterLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* =========================================================================
          TEMPLE LISTING: Vertically Scrollable Cards
         ========================================================================= */}
      {loading && temples.length === 0 ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#173D32" />
        </View>
      ) : error && temples.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: '#B00020', marginBottom: 14 }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={styles.clearFilterButton}
            activeOpacity={0.8}
            onPress={fetchTemples}
          >
            <Text style={styles.clearFilterButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={temples}
          keyExtractor={(item) => item.id}
          renderItem={renderTempleCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {UI_TRANSLATIONS.noResults[langKey] || 'No temples found matching your search.'}
              </Text>
              <TouchableOpacity
                style={styles.clearFilterButton}
                activeOpacity={0.8}
                onPress={handleClearFilters}
              >
                <Text style={styles.clearFilterButtonText}>
                  {UI_TRANSLATIONS.clearFilters[langKey] || 'Clear Filters'}
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5EB',
  },

  // Header styles
  header: {
    height: Platform.OS === 'ios' ? 96 : (StatusBar.currentHeight || 20) + 64,
    paddingTop: Platform.OS === 'ios' ? 38 : StatusBar.currentHeight || 18,
    borderBottomWidth: 1.5,
    borderBottomColor: '#D4AF37',
    elevation: 6,
    shadowColor: '#0C251E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
  },
  headerSafeArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerBackButton: {
    position: 'absolute',
    left: 14,
    zIndex: 999,
    elevation: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 54,
  },
  headerTitle: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 21,
    fontWeight: '700',
    color: '#FFF8E7',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  headerRightOrnament: {
    position: 'absolute',
    right: 4,
    top: 2,
    zIndex: 5,
  },
  filigreeTopLeft: {
    position: 'absolute',
    left: 4,
    top: 2,
    zIndex: 5,
  },

  // Search Bar
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF9',
    borderRadius: 22,
    borderWidth: 1.3,
    borderColor: '#DFA62E',
    paddingHorizontal: 14,
    height: 44,
    elevation: 1.5,
    shadowColor: '#345147',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontFamily: Platform.select({ ios: 'Poppins-Regular', android: 'Poppins_400Regular', web: 'Poppins, sans-serif', default: 'Poppins_400Regular' }),
    fontSize: 14.5,
    color: '#0C251E',
    paddingVertical: 0,
  },
  clearSearchText: {
    fontSize: 16,
    color: '#173D32',
    fontWeight: '700',
    paddingHorizontal: 4,
  },

  // Deity Filter Row
  filtersWrapper: {
    paddingBottom: 8,
  },
  filtersScrollContent: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 6.5,
    borderRadius: 18,
    marginRight: 8,
    borderWidth: 1.2,
  },
  filterPillSelected: {
    backgroundColor: '#173D32',
    borderColor: '#D4AF37',
    elevation: 2,
    shadowColor: '#0C251E',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.25,
    shadowRadius: 2.5,
  },
  filterPillUnselected: {
    backgroundColor: '#FFF8ED',
    borderColor: '#E8CD9C',
  },
  filterPillText: {
    fontFamily: Platform.select({ ios: 'Poppins-Regular', android: 'Poppins_400Regular', web: 'Poppins, sans-serif', default: 'Poppins_400Regular' }),
    fontSize: 13.5,
  },
  filterPillTextSelected: {
    color: '#FFF8E7',
    fontWeight: '700',
  },
  filterPillTextUnselected: {
    color: '#345147',
    fontWeight: '600',
  },

  // List & Cards
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 28,
  },
  templeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9F0',
    borderRadius: 14,
    borderWidth: 1.3,
    borderColor: '#DFA62E',
    padding: 10,
    marginVertical: 5.5,
    elevation: 1.8,
    shadowColor: '#345147',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  thumbnailContainer: {
    width: 82,
    height: 58,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F0E0CB',
  },
  thumbnailImageCrop: {
    width: '100%',
    height: '100%',
  },
  cardCenterInfo: {
    flex: 1,
    paddingLeft: 12,
    paddingRight: 6,
    justifyContent: 'center',
  },
  templeNameText: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0C251E',
    letterSpacing: 0.2,
  },
  templeLocationText: {
    fontFamily: Platform.select({ ios: 'Poppins-Regular', android: 'Poppins_400Regular', web: 'Poppins, sans-serif', default: 'Poppins_400Regular' }),
    fontSize: 13,
    color: '#745348',
    fontWeight: '400',
    marginTop: 2.5,
  },
  cardRightChevron: {
    paddingLeft: 4,
    paddingRight: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontFamily: Platform.select({ ios: 'Poppins-Regular', android: 'Poppins_400Regular', web: 'Poppins, sans-serif', default: 'Poppins_400Regular' }),
    fontSize: 15,
    color: '#745348',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  clearFilterButton: {
    backgroundColor: '#173D32',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  clearFilterButtonText: {
    color: '#FFF8E7',
    fontSize: 13.5,
    fontWeight: '700',
  },

  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
});

