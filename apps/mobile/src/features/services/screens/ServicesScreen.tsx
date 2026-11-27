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
  currentDeity?: any;
  onOpenDetail?: (id: string, title: string, deity?: string) => void;
  onOpenPanchangam?: () => void;
  onDeityChange?: (deity: any) => void;
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

// Helper to resolve appropriate devotional icon by slug, title, or API icon string
function getCategoryIcon(slug?: string, title?: string, icon?: string) {
  const text = `${slug || ''} ${title || ''} ${icon || ''}`.toLowerCase();
  if (text.includes('pooja') || text.includes('vrath') || text.includes('vidhanam') || text.includes('flame') || text.includes('పూజ')) {
    return PoojaVidhanamIcon;
  }
  if (text.includes('stotra') || text.includes('bookopen') || text.includes('స్తోత్ర')) {
    return AstothramsIcon;
  }
  if (text.includes('astothram') || text.includes('108') || text.includes('1008') || text.includes('అష్టోత్తర')) {
    return AstothramsIcon;
  }
  if (
    text.includes('sloka') ||
    text.includes('scroll') ||
    text.includes('mantra') ||
    text.includes('suprabatham') ||
    text.includes('parayana') ||
    text.includes('శ్లోక') ||
    text.includes('సుప్రభాతం')
  ) {
    return SlokasIcon;
  }
  if (text.includes('bhajan') || text.includes('song') || text.includes('music') || text.includes('keerthana') || text.includes('కీర్తన')) {
    return BhajansIcon;
  }
  if (text.includes('harathi') || text.includes('mangal') || text.includes('హారతి')) {
    return HarathisIcon;
  }
  if (
    text.includes('panchangam') ||
    text.includes('calendar') ||
    text.includes('nakshatra') ||
    text.includes('dates') ||
    text.includes('పంచాంగం') ||
    text.includes('నక్షత్ర')
  ) {
    return PanchangamIcon;
  }
  if (text.includes('temple') || text.includes('landmark') || text.includes('sannidhanam') || text.includes('ఆలయ')) {
    return TemplesIcon;
  }
  if (text.includes('donation') || text.includes('hearthandshake') || text.includes('kanuka') || text.includes('విరాళం') || text.includes('seva')) {
    return DonationsIcon;
  }
  if (text.includes('food') || text.includes('annadanam') || text.includes('అన్నదానం')) {
    return FoodDonationIcon;
  }
  if (text.includes('live') || text.includes('tv') || text.includes('darshan')) {
    return LiveStreamsIcon;
  }
  if (text.includes('festival') || text.includes('sparkles') || text.includes('ఉత్సవ')) {
    return AstothramsIcon;
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
  te: 'ఆధ్యాత్మిక సేవలు',
  kn: 'ಭಕ್ತಿ ವರ್ಗಗಳು',
  ta: 'பக்தி பிரிவுகள்',
  hi: 'भक्ति श्रेणियां',
  ml: 'ഭക്തി വിഭാഗങ്ങൾ',
  en: 'Spiritual Services',
};

const SERVICE_LOCALIZATIONS: Record<string, Record<string, { title: string; sub: string }>> = {
  te: {
    pooja: { title: 'పూజా విధానము', sub: 'దశలవారీగా పవిత్ర పూజా విధానాలు' },
    stotras: { title: 'దివ్య స్తోత్రాలు', sub: 'పవిత్ర స్తోత్రాలు & కవచాలు' },
    slokas: { title: 'నిత్య శ్లోకాలు', sub: 'ధ్యానం & ప్రార్థన శ్లోకాలు' },
    bhajans: { title: 'భజనలు & కీర్తనలు', sub: 'భక్తి కీర్తనలు & గీతాలు' },
    darshan: { title: 'ప్రత్యక్ష దర్శనం', sub: 'నిత్య ఆలయ ప్రత్యక్ష ప్రసారాలు' },
    panchangam: { title: 'పంచాంగం', sub: 'శుభ సమయాలు & ముహూర్తాలు' },
    festivals: { title: 'ఆలయ ఉత్సవాలు', sub: 'వార్షిక ఉత్సవాలు & వేడుకలు' },
    temples: { title: 'పుణ్యక్షేత్రాలు', sub: 'ప్రసిద్ధ క్షేత్రాలు & దర్శనీయ స్థలాలు' },
    annadanam: { title: 'అన్నదాన సేవ', sub: 'నిత్యాన్నదానం & సమర్పణ' },
  },
  kn: {
    pooja: { title: 'ಪೂಜಾ ವಿಧಾನ', sub: 'ಹಂತ-ಹಂತದ ಪವಿತ್ರ ವಿಧಿವಿಧಾನಗಳು' },
    stotras: { title: 'ದಿವ್ಯ ಸ್ತೋತ್ರಗಳು', sub: 'ಪವಿತ್ರ ಸ್ತೋತ್ರಗಳು & ಕವಚಗಳು' },
    slokas: { title: 'ನಿತ್ಯ ಶ್ಲೋಕಗಳು', sub: 'ಧ್ಯಾನ & ಪ್ರಾರ್ಥನಾ ಶ್ಲೋಕಗಳು' },
    bhajans: { title: 'ಭಜನೆಗಳು & ಕೀರ್ತನೆಗಳು', sub: 'ಭಕ್ತಿ ಗೀತೆಗಳು & ಸಂಕೀರ್ತನೆ' },
    darshan: { title: 'ಲೈವ್ ದರ್ಶನ', sub: 'ದೈನಂದಿನ ದೇವಾಲಯ ನೇರಪ್ರಸಾರ' },
    panchangam: { title: 'ಪಂಚಾಂಗ', sub: 'ಶುಭ ಮುಹೂರ್ತಗಳು & ತಿಥಿಗಳು' },
    festivals: { title: 'ದೇವಾಲಯ ಉತ್ಸವಗಳು', sub: 'ವಾರ್ಷಿಕ ಹಬ್ಬಗಳು & ಆಚರಣೆಗಳು' },
    temples: { title: 'ಪುಣ್ಯಕ್ಷೇತ್ರಗಳು', sub: 'ಪವಿತ್ರ ದೇವಾಲಯಗಳು & ಯಾತ್ರೆಗಳು' },
    annadanam: { title: 'ಅನ್ನದಾನ ಸೇವೆ', sub: 'ಅನ್ನದಾನ ಅರ್ಪಣೆ & ಸೇವೆ' },
  },
  ta: {
    pooja: { title: 'பூஜா விதானம்', sub: 'படிப்படியான புனித வழிபாட்டு முறைகள்' },
    stotras: { title: 'திவ்ய ஸ்தோத்திரங்கள்', sub: 'புனித துதிகள் & கவசங்கள்' },
    slokas: { title: 'நித்ய ஸ்லோகங்கள்', sub: 'தியானம் & பிரார்த்தனை சுலோகங்கள்' },
    bhajans: { title: 'பஜனைகள் & பாடல்கள்', sub: 'பக்திப் பாடல்கள் & கீர்த்தனைகள்' },
    darshan: { title: 'நேரலை தரிசனம்', sub: 'தினசரி கோயில் நேரலை ஒளிபரப்பு' },
    panchangam: { title: 'பஞ்சாங்கம்', sub: 'சுப நேரங்கள் & திதிகள்' },
    festivals: { title: 'திருவிழாக்கள்', sub: 'ஆண்டு திருவிழாக்கள் & கொண்டாட்டங்கள்' },
    temples: { title: 'புண்ணிய தலங்கள்', sub: 'புனித கோயில்கள் & யாத்திரைகள்' },
    annadanam: { title: 'அன்னதான சேவை', sub: 'அன்னதான அர்ப்பணிப்பு & சேவை' },
  },
  hi: {
    pooja: { title: 'पूजा विधान', sub: 'चरणबद्ध पवित्र अनुष्ठान एवं पूजा' },
    stotras: { title: 'दिव्य स्तोत्र', sub: 'पवित्र स्तोत्र एवं मंत्र' },
    slokas: { title: 'नित्य श्लोक', sub: 'ध्यान एवं प्रार्थना श्लोक' },
    bhajans: { title: 'भजन एवं कीर्तन', sub: 'भक्ति संगीत एवं आरतियां' },
    darshan: { title: 'लाइव दर्शन', sub: 'दैनिक मंदिर लाइव प्रसारण' },
    panchangam: { title: 'पंचांग', sub: 'शुभ मुहूर्त एवं तिथियां' },
    festivals: { title: 'मंदिर उत्सव', sub: 'वार्षिक उत्सव एवं पर्व' },
    temples: { title: 'पुण्य क्षेत्र व मंदिर', sub: 'पवित्र तीर्थ स्थल एवं धाम' },
    annadanam: { title: 'अन्नदान सेवा', sub: 'भोजन सेवा एवं दान' },
  },
  ml: {
    pooja: { title: 'പൂജാ വിധി', sub: 'ഘട്ടം ഘട്ടമായുള്ള വിശുദ്ധ കർമ്മങ്ങൾ' },
    stotras: { title: 'ദിവ്യ സ്തോത്രങ്ങൾ', sub: 'വിശുദ്ധ സ്തോത്രങ്ങൾ & കീർത്തനങ്ങൾ' },
    slokas: { title: 'നിത്യ ശ്ലോകങ്ങൾ', sub: 'പ്രാർത്ഥനാ ശ്ലോകങ്ങൾ' },
    bhajans: { title: 'ഭജനകളും ഗാനങ്ങളും', sub: 'ഭക്തിഗാനങ്ങൾ' },
    darshan: { title: 'തത്സമയ ദർശനം', sub: 'ദിവസേനയുള്ള തത്സമയ സംപ്രേക്ഷണം' },
    panchangam: { title: 'പഞ്ചാംഗം', sub: 'ശുഭ മുഹൂർത്തങ്ങൾ' },
    festivals: { title: 'ക്ഷേത്രോത്സവങ്ങൾ', sub: 'വാർഷിക ആഘോഷങ്ങൾ' },
    temples: { title: 'പുണ്യക്ഷേത്രങ്ങൾ', sub: 'തീർത്ഥാടന കേന്ദ്രങ്ങൾ' },
    annadanam: { title: 'അന്നദാന സേവ', sub: 'അന്നദാന സമർപ്പണം' },
  },
  en: {
    pooja: { title: 'Pooja Vidhanam', sub: 'Step-by-step sacred rituals' },
    stotras: { title: 'Divine Stotras', sub: 'Sacred Hymns & Chants' },
    slokas: { title: 'Daily Slokas', sub: 'Verses for Meditation' },
    bhajans: { title: 'Bhajans & Songs', sub: 'Devotional Melodies' },
    darshan: { title: 'Live Darshan', sub: 'Daily Temple Streams' },
    panchangam: { title: 'Panchangam', sub: 'Auspicious Timings' },
    festivals: { title: 'Temple Festivals', sub: 'Annual Celebrations' },
    temples: { title: 'Sacred Temples', sub: 'Shrines & Pilgrimages' },
    annadanam: { title: 'Annadanam Seva', sub: 'Meal Offering & Seva' },
  },
};

function resolveServiceTexts(item: DevotionalCategoryItem, lang: SupportedLanguage) {
  const sId = (item.serviceId || item.slug || item.id || '').toLowerCase().trim();
  const langKey = (lang || 'en').toLowerCase();
  const dict = SERVICE_LOCALIZATIONS[langKey] || SERVICE_LOCALIZATIONS.en;
  const match = dict[sId];
  if (match) {
    return {
      title: match.title,
      sub: match.sub,
    };
  }
  return {
    title: item.title,
    sub: item.sub || item.description || '',
  };
}

export const ServicesScreen: React.FC<Props> = ({
  currentLanguage = 'en',
  currentDeity,
  onOpenDetail,
  onOpenPanchangam,
  onDeityChange,
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
    const slug = (item.serviceId || item.slug || item.id || '').toLowerCase();
    if (slug === 'panchangam' || slug.includes('panchangam')) {
      onOpenPanchangam?.();
    } else {
      const activeDeity = currentDeity?.id || currentDeity?.slug || 'all';
      onOpenDetail?.(item.serviceId || item.slug || item.id, item.title, activeDeity);
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
              const IconComponent = getCategoryIcon(item.serviceId || item.slug || item.id, item.title, item.icon);
              const localized = resolveServiceTexts(item, currentLanguage);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.categoryCard}
                  activeOpacity={0.82}
                  onPress={() => handleItemPress(item)}
                  accessibilityRole="button"
                  accessibilityLabel={localized.title}
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
                    <Text style={styles.cardTitle}>{localized.title}</Text>
                    {Boolean(localized.sub) && (
                      <Text style={styles.cardSubtitle} numberOfLines={1}>
                        {localized.sub}
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
