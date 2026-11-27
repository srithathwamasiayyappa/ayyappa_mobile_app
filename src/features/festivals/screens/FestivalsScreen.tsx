import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Share,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { SupportedLanguage, FestivalItem } from '../../../types';
import { ApiService } from '../../../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  currentLanguage: SupportedLanguage;
  onBack: () => void;
}

// Corner Filigree Ornaments for Header
const HeaderCornerFiligree = ({ flipped = false }: { flipped?: boolean }) => (
  <View style={flipped ? { transform: [{ scaleX: -1 }] } : undefined}>
    <Svg width={36} height={36} viewBox="0 0 36 36" fill="none">
      <Path
        d="M2 2 C12 2 22 8 28 16 C24 18 18 16 12 22 C8 16 6 8 2 2 Z"
        fill="#E2AD43"
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

// Search Icon
const SearchIcon = ({ size = 18, color = '#345147' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16.5 16.5L21.5 21.5" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Share Icon for Card
const ShareIcon = ({ size = 18, color = '#C8902B' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="18" cy="5" r="3" stroke={color} strokeWidth={2} />
    <Circle cx="6" cy="12" r="3" stroke={color} strokeWidth={2} />
    <Circle cx="18" cy="19" r="3" stroke={color} strokeWidth={2} />
    <Path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke={color} strokeWidth={2} />
  </Svg>
);

// Golden Lotus Divider
const GoldenLotusDivider = () => (
  <View style={styles.lotusDividerContainer}>
    <View style={styles.lotusLine} />
    <Svg width={28} height={18} viewBox="0 0 28 18" fill="none">
      <Path
        d="M14 2 C11 7 10 10 10 13 C10 15.5 11.8 17 14 17 C16.2 17 18 15.5 18 13 C18 10 17 7 14 2 Z"
        fill="#DFA62E"
      />
      <Circle cx="14" cy="13" r="1.5" fill="#FFFDF8" />
    </Svg>
    <View style={styles.lotusLine} />
  </View>
);

const SCREEN_TEXTS: Record<string, {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  allCategories: string;
  noFestivalsFound: string;
  totalEvents: string;
  shareMessage: string;
}> = {
  en: {
    title: 'Festivals & Sacred Days',
    subtitle: 'Vedic Panchangam & Auspicious Celebrations',
    searchPlaceholder: 'Search festival, vratham, ekadashi...',
    allCategories: 'All Festivals',
    noFestivalsFound: 'No festivals found matching your search.',
    totalEvents: 'Total Sacred Events',
    shareMessage: 'Swamiye Saranam Ayyappa! Check out this sacred festival on Saranam Ayyappa:',
  },
  te: {
    title: 'పండుగలు & విశేష దినాలు',
    subtitle: 'వైదిక పంచాంగం & పవిత్ర వేడుకలు',
    searchPlaceholder: 'పండుగ, వ్రతం, ఏకాదశి వెతకండి...',
    allCategories: 'అన్ని పండుగలు',
    noFestivalsFound: 'మీ శోధనకు సంబంధించిన పండుగలు లభించలేదు.',
    totalEvents: 'మొత్తం పవిత్ర దినాలు',
    shareMessage: 'స్వామియే శరణం అయ్యప్ప! శరణం అయ్యప్ప యాప్‌లో ఈ పవిత్ర పండుగ వివరాలు చూడండి:',
  },
  kn: {
    title: 'ಹಬ್ಬಗಳು & ಪವಿತ್ರ ದಿನಗಳು',
    subtitle: 'ವೈದಿಕ ಪಂಚಾಂಗ & ಮಂಗಳಕರ ಆಚರಣೆಗಳು',
    searchPlaceholder: 'ಹಬ್ಬ, ವ್ರತ, ಏಕಾದಶಿ ಹುಡುಕಿ...',
    allCategories: 'ಎಲ್ಲಾ ಹಬ್ಬಗಳು',
    noFestivalsFound: 'ಯಾವುದೇ ಹಬ್ಬಗಳು ಕಂಡುಬಂದಿಲ್ಲ.',
    totalEvents: 'ಒಟ್ಟು ಪವಿತ್ರ ದಿನಗಳು',
    shareMessage: 'ಸ್ವಾಮಿಯೇ ಶರಣಂ ಅಯ್ಯಪ್ಪ! ಶರಣಂ ಅಯ್ಯಪ್ಪ ಆ್ಯಪ್‌ನಲ್ಲಿ ಈ ಪವಿತ್ರ ಹಬ್ಬವನ್ನು ನೋಡಿ:',
  },
  ta: {
    title: 'திருவிழாக்கள் & சிறப்பு நாட்கள்',
    subtitle: 'வேத பஞ்சாங்கம் & மங்கல கொண்டாட்டங்கள்',
    searchPlaceholder: 'திருவிழா, விரதம், ஏகாதசி தேடுங்கள்...',
    allCategories: 'அனைத்து திருவிழாக்கள்',
    noFestivalsFound: 'திருவிழாக்கள் ஏதும் கிடைக்கவில்லை.',
    totalEvents: 'மொத்த புனித நாட்கள்',
    shareMessage: 'சுவாமியே சரணம் ஐயப்பா! சரணம் ஐயப்பா செயலியில் இந்த புனித திருவிழாவை காண்க:',
  },
  hi: {
    title: 'त्यौहार एवं विशेष दिन',
    subtitle: 'वैदिक पंचांग एवं शुभ उत्सव',
    searchPlaceholder: 'त्यौहार, व्रत, एकादशी खोजें...',
    allCategories: 'सभी त्यौहार',
    noFestivalsFound: 'कोई त्यौहार नहीं मिला।',
    totalEvents: 'कुल पावन दिवस',
    shareMessage: 'स्वामीये शरणम अय्यप्पा! शरणम अय्यप्पा ऐप पर यह पावन त्यौहार देखें:',
  },
  ml: {
    title: 'ഉത്സവങ്ങളും വിശേഷ ദിനങ്ങളും',
    subtitle: 'വൈദിക പഞ്ചാംഗവും പുണ്യദിനങ്ങളും',
    searchPlaceholder: 'ഉത്സവം, വ്രതം, ഏകാദശി തിരയുക...',
    allCategories: 'എല്ലാ ഉത്സവങ്ങളും',
    noFestivalsFound: 'ഉത്സവങ്ങൾ ഒന്നും കണ്ടെത്തിയില്ല.',
    totalEvents: 'ആകെ പുണ്യദിനങ്ങൾ',
    shareMessage: 'സ്വാമിയേ ശരണം അയ്യപ്പ! ശരണം അയ്യപ്പ ആപ്പിൽ ഈ പുണ്യദിനം കാണുക:',
  },
};

const YEARS = [2025, 2026, 2027, 2028];

const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export const FestivalsScreen: React.FC<Props> = ({ currentLanguage = 'en', onBack }) => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [festivals, setFestivals] = useState<FestivalItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const t = SCREEN_TEXTS[currentLanguage] || SCREEN_TEXTS.en;

  // Fetch festivals dynamically from DB via API response
  const loadFestivals = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await ApiService.getFestivals(currentLanguage, selectedYear, 'Hyderabad');
      if (Array.isArray(data)) {
        setFestivals(data);
      }
    } catch (err) {
      console.warn('Failed to fetch festivals:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentLanguage, selectedYear]);

  useEffect(() => {
    loadFestivals();
  }, [loadFestivals]);

  // Derive unique categories dynamically from DB data
  const categoryFilters = useMemo(() => {
    const set = new Set<string>();
    festivals.forEach((f) => {
      if (f.category) set.add(f.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [festivals]);

  // Filter festivals based on search and selected category
  const filteredFestivals = useMemo(() => {
    return festivals.filter((f) => {
      const matchesCategory = selectedCategory === 'ALL' || f.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        f.name.toLowerCase().includes(q) ||
        (f.description && f.description.toLowerCase().includes(q)) ||
        (f.category && f.category.toLowerCase().includes(q)) ||
        f.date.includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [festivals, selectedCategory, searchQuery]);

  // Share festival details
  const handleShareFestival = async (fest: FestivalItem) => {
    try {
      await Share.share({
        title: fest.name,
        message: `${t.shareMessage}\n\n🪔 ${fest.name}\n📅 Date: ${fest.date} (${fest.weekday || ''})\n🏷️ Category: ${fest.category}\n\n${fest.description || ''}\n\nDownload Saranam Ayyappa app for Vedic Panchangam and Temple Darshan.`,
      });
    } catch {}
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#003D2E" translucent={false} />

      {/* =========================================================
          1. SACRED DEVOTIONAL HEADER WITH CORNER FILIGREE
         ========================================================= */}
      <SafeAreaView style={styles.safeHeaderArea}>
        <LinearGradient
          colors={['#003D2E', '#002F25']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerBar}
        >
          {/* Filigree Corner Accents */}
          <View style={styles.filigreeLeft}>
            <HeaderCornerFiligree />
          </View>
          <View style={styles.filigreeRight}>
            <HeaderCornerFiligree flipped />
          </View>

          {/* Left: Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <BackArrowIcon />
          </TouchableOpacity>

          {/* Center: Title & Subtitle */}
          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {t.title}
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {t.subtitle}
            </Text>
          </View>

          {/* Right Year Pill */}
          <View style={styles.headerYearBadge}>
            <Text style={styles.headerYearText}>{selectedYear}</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>

      {/* =========================================================
          2. SEARCH & YEAR SELECTION BAR
         ========================================================= */}
      <View style={styles.topControlSection}>
        {/* Search Input Box */}
        <View style={styles.searchBarWrapper}>
          <SearchIcon size={18} color="#003D2E" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t.searchPlaceholder}
            placeholderTextColor="#8C9B95"
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Year Selector Pills */}
        <View style={styles.yearRowContainer}>
          <Text style={styles.yearLabelText}>Year:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.yearScrollContent}>
            {YEARS.map((yr) => {
              const isActive = selectedYear === yr;
              return (
                <TouchableOpacity
                  key={yr}
                  style={[styles.yearChip, isActive && styles.yearChipActive]}
                  onPress={() => setSelectedYear(yr)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.yearChipText, isActive && styles.yearChipTextActive]}>
                    {yr}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Category Filters Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScrollContent}>
          {categoryFilters.map((cat) => {
            const isActive = selectedCategory === cat;
            const displayLabel = cat === 'ALL' ? t.allCategories : cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
              >
                <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>
                  {displayLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* =========================================================
          3. MAIN FESTIVALS LIST
         ========================================================= */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#003D2E" />
          <Text style={styles.loadingText}>Fetching sacred festivals from calendar...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.contentScrollView}
          contentContainerStyle={styles.contentScrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadFestivals(true)}
              colors={['#003D2E']}
              tintColor="#003D2E"
            />
          }
        >
          {/* Header Counter Bar */}
          <View style={styles.resultsHeaderRow}>
            <Text style={styles.resultsCountText}>
              🪔 {filteredFestivals.length} {t.totalEvents} ({selectedYear})
            </Text>
          </View>

          {/* Cards or Empty State */}
          {filteredFestivals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🪷</Text>
              <Text style={styles.emptyTitle}>{t.noFestivalsFound}</Text>
              <TouchableOpacity
                style={styles.resetFilterButton}
                onPress={() => {
                  setSelectedCategory('ALL');
                  setSearchQuery('');
                }}
              >
                <Text style={styles.resetFilterText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredFestivals.map((fest, idx) => {
              // Parse date
              const parts = fest.date.split('-');
              const dayStr = parts[2] || '';
              const monthIdx = parts[1] ? parseInt(parts[1], 10) - 1 : 0;
              const monthStr = MONTH_NAMES[monthIdx] || '';

              const isAyyappa =
                fest.category?.toLowerCase().includes('ayyappa') ||
                fest.name?.toLowerCase().includes('ayyappa') ||
                fest.name?.toLowerCase().includes('mandala') ||
                fest.name?.toLowerCase().includes('makara');

              return (
                <View
                  key={fest.slug || `${fest.date}-${idx}`}
                  style={[styles.festivalCard, isAyyappa && styles.festivalCardHighlighted]}
                >
                  {/* Left: Date Block */}
                  <LinearGradient
                    colors={isAyyappa ? ['#D69826', '#B77816'] : ['#003D2E', '#00261D']}
                    style={styles.dateBlock}
                  >
                    <Text style={styles.dateDayText}>{dayStr}</Text>
                    <Text style={styles.dateMonthText}>{monthStr}</Text>
                    <Text style={styles.dateYearText}>{parts[0]}</Text>
                  </LinearGradient>

                  {/* Middle / Right: Content */}
                  <View style={styles.cardContent}>
                    <View style={styles.cardTopMetaRow}>
                      <View
                        style={[
                          styles.categoryBadge,
                          isAyyappa ? styles.categoryBadgeAyyappa : styles.categoryBadgeNormal,
                        ]}
                      >
                        <Text
                          style={[
                            styles.categoryBadgeText,
                            isAyyappa ? styles.categoryBadgeTextAyyappa : styles.categoryBadgeTextNormal,
                          ]}
                        >
                          {fest.category}
                        </Text>
                      </View>

                      {/* Share Button */}
                      <TouchableOpacity
                        style={styles.cardShareBtn}
                        onPress={() => handleShareFestival(fest)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <ShareIcon size={16} color="#B77816" />
                      </TouchableOpacity>
                    </View>

                    {/* Festival Name */}
                    <Text style={styles.festivalNameText}>{fest.name}</Text>

                    {/* Weekday indicator */}
                    {fest.weekday ? (
                      <Text style={styles.weekdayText}>
                        🗓️ {fest.weekday} • {fest.date}
                      </Text>
                    ) : null}

                    {/* Description */}
                    {fest.description ? (
                      <Text style={styles.descriptionText} numberOfLines={3}>
                        {fest.description}
                      </Text>
                    ) : null}
                  </View>
                </View>
              );
            })
          )}

          <View style={{ height: 40 }} />
          <GoldenLotusDivider />
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAF7EE',
  },
  safeHeaderArea: {
    backgroundColor: '#003D2E',
  },
  headerBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  filigreeLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    opacity: 0.6,
    pointerEvents: 'none',
  },
  filigreeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    opacity: 0.6,
    pointerEvents: 'none',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitleBox: {
    flex: 1,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFDF8',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#F4C451',
    marginTop: 2,
    fontWeight: '500',
  },
  headerYearBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(244, 196, 81, 0.25)',
    borderWidth: 1,
    borderColor: '#F4C451',
  },
  headerYearText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFE28C',
  },
  topControlSection: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E1CE',
    paddingTop: 10,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchBarWrapper: {
    marginHorizontal: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3EFE3',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: '#DFD7C2',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#003D2E',
    paddingVertical: 0,
  },
  clearSearchText: {
    fontSize: 14,
    color: '#8C9B95',
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  yearRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  yearLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#003D2E',
    marginRight: 8,
  },
  yearScrollContent: {
    gap: 8,
    paddingRight: 16,
  },
  yearChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F5F1E6',
    borderWidth: 1,
    borderColor: '#D4CBB6',
  },
  yearChipActive: {
    backgroundColor: '#003D2E',
    borderColor: '#003D2E',
  },
  yearChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#55665E',
  },
  yearChipTextActive: {
    color: '#FFE28C',
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 4,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FAF7EE',
    borderWidth: 1,
    borderColor: '#D4CBB6',
  },
  categoryChipActive: {
    backgroundColor: '#B77816',
    borderColor: '#B77816',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#284138',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  contentScrollView: {
    flex: 1,
  },
  contentScrollContainer: {
    padding: 16,
  },
  resultsHeaderRow: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultsCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#003D2E',
  },
  festivalCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E7DFCC',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    overflow: 'hidden',
  },
  festivalCardHighlighted: {
    borderColor: '#DFA62E',
    borderWidth: 1.5,
  },
  dateBlock: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  dateDayText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 26,
  },
  dateMonthText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFE28C',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  dateYearText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  cardTopMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeNormal: {
    backgroundColor: 'rgba(0, 61, 46, 0.08)',
  },
  categoryBadgeAyyappa: {
    backgroundColor: 'rgba(183, 120, 22, 0.15)',
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  categoryBadgeTextNormal: {
    color: '#003D2E',
  },
  categoryBadgeTextAyyappa: {
    color: '#9C6207',
  },
  cardShareBtn: {
    padding: 4,
  },
  festivalNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#002F25',
    marginBottom: 4,
    lineHeight: 21,
  },
  weekdayText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8A6D3B',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 12,
    color: '#4B5E56',
    lineHeight: 17,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#003D2E',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 14,
    color: '#55665E',
    textAlign: 'center',
    marginBottom: 16,
  },
  resetFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#003D2E',
  },
  resetFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  lotusDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  lotusLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#DFD7C2',
    maxWidth: 80,
  },
});
