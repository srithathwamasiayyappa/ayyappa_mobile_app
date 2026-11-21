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
import { PRODUCTION_BASE_URL } from '../../../services/api';
import { DEFAULT_CHILDREN } from '../../../data/defaultChildren';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

interface TypeItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl?: string;
  deityId?: string;
  badge?: string;
  order?: number;
}

interface Props {
  subcategoryId: string;
  subcategoryTitle?: string;
  parentCategoryTitle?: string;
  currentLanguage: SupportedLanguage;
  onSelectType: (type: TypeItem) => void;
  onBack: () => void;
}

// Corner Filigree Ornament
const CornerFiligree = () => (
  <Svg width={36} height={36} viewBox="0 0 36 36" fill="none">
    <Path d="M2 2 C12 2 22 8 28 16 C24 18 18 16 12 22 C8 16 6 8 2 2 Z" fill="#DFA62E" fillOpacity={0.65} />
  </Svg>
);

// Back Arrow
const BackArrowIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 19l-7-7 7-7" stroke="#173D32" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Solid Maroon Play Triangle Icon (Matching Subcategories Record Style)
const PlayTriangleIcon = () => (
  <Svg width={14} height={16} viewBox="0 0 14 16" fill="none">
    <Polygon points="2,1 13,8 2,15" fill="#173D32" />
  </Svg>
);

// Safe Thumbnail Image with Network Fallback
const TypeThumbnail: React.FC<{ image?: string; deityId?: string }> = ({ image, deityId = 'ganesha' }) => {
  const [hasError, setHasError] = useState(false);
  const fallback = DEITY_IMAGES[deityId] || DEITY_IMAGES.ganesha;

  let src = fallback;
  if (!hasError && image) {
    if (typeof image === 'string') {
      if (image.startsWith('http://') || image.startsWith('https://')) {
        src = { uri: image };
      } else if (image.startsWith('/uploads')) {
        src = { uri: `https://backendapis.saranamayyappa.in${image}` };
      } else {
        src = fallback;
      }
    }
  }

  return (
    <Image
      source={src}
      style={styles.imageThumbnail}
      resizeMode="cover"
      onError={() => setHasError(true)}
    />
  );
};

export const SubcategoryTypesScreen: React.FC<Props> = ({
  subcategoryId = 'sri-maha-ganapathi-pooja',
  subcategoryTitle = 'Sri Maha Ganapathi Pooja',
  parentCategoryTitle = 'Pooja Vidhanam',
  currentLanguage = 'te',
  onSelectType,
  onBack,
}) => {
  const [types, setTypes] = useState<TypeItem[]>([]);
  const [headerInfo, setHeaderInfo] = useState<{
    title: string;
    subtitle: string;
    deityId: string;
  }>({
    title: subcategoryTitle,
    subtitle: 'Complete 16-step worship procedure for Lord Ganesha, remover of all obstacles.',
    deityId: 'ganesha',
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    const fetchTypes = async () => {
      try {
        // Query DB via API for subcategory detail and attached types
        const url = `${PRODUCTION_BASE_URL}/categories/subcategories/${encodeURIComponent(subcategoryId)}?lang=${currentLanguage}`;
        const res = await fetch(url);
        const json = await res.json().catch(() => null);

        if (!isCancelled && json && json.data) {
          const d = json.data;
          setHeaderInfo({
            title: d.title || d.titleTelugu || subcategoryTitle,
            subtitle: d.subtitle || d.overview || 'Complete 16-step worship procedure for Lord Ganesha, remover of all obstacles.',
            deityId: d.deityId || 'ganesha',
          });

          // Check for child types in response
          let resolvedList: TypeItem[] = [];

          if (Array.isArray(d.children) && d.children.length > 0) {
            resolvedList = d.children.map((ch: any, idx: number) => ({
              id: String(ch.id || ch.slug || idx + 1),
              slug: ch.slug || String(ch.id),
              title: ch.title || `Type ${idx + 1}`,
              description: ch.description || 'గణపతి షోడశోపచార పూజా విధానము, అంగపూజ, అష్టోత్తర శత నామావళి.',
              imageUrl: ch.imageUrl,
              deityId: d.deityId || 'ganesha',
              order: idx + 1,
            }));
          } else if (Array.isArray(d.contents) && d.contents.length > 0) {
            resolvedList = d.contents.map((dc: any, idx: number) => ({
              id: String(dc.id || dc.slug || idx + 1),
              slug: dc.slug || String(dc.id),
              title: dc.title || `Type ${idx + 1}`,
              description: dc.meaning || 'గణపతి షోడశోపచార పూజా విధానము, అంగపూజ, అష్టోత్తర శత నామావళి.',
              imageUrl: dc.audioUrl,
              deityId: d.deityId || 'ganesha',
              order: dc.displayOrder || idx + 1,
            }));
          }

          // If no types returned from detail, try child subcategories query
          if (resolvedList.length === 0) {
            try {
              const childRes = await fetch(`${PRODUCTION_BASE_URL}/admin/subcategories?parentId=${encodeURIComponent(d.rawId || subcategoryId)}&lang=${currentLanguage}`);
              const childJson = await childRes.json().catch(() => null);
              if (childJson && Array.isArray(childJson.data) && childJson.data.length > 0) {
                resolvedList = childJson.data.map((c: any, idx: number) => ({
                  id: String(c.id),
                  slug: c.slug || String(c.id),
                  title: c.title || c.slug,
                  description: c.description || 'గణపతి షోడశోపచార పూజా విధానము, అంగపూజ, అష్టోత్తర శత నామావళి.',
                  imageUrl: c.imageUrl,
                  deityId: d.deityId || 'ganesha',
                  order: idx + 1,
                }));
              }
            } catch (_) {}
          }

          if (resolvedList.length > 0) {
            setTypes(resolvedList);
          } else {
            setTypes(resolveTypesFallback(subcategoryId, d.rawId, d.deityId || headerInfo.deityId));
          }
        } else if (!isCancelled) {
          setTypes(resolveTypesFallback(subcategoryId, undefined, headerInfo.deityId));
        }
      } catch (err) {
        console.warn('Failed to load subcategory types:', err);
        if (!isCancelled) {
          setTypes(resolveTypesFallback(subcategoryId, undefined, headerInfo.deityId));
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchTypes();
    return () => { isCancelled = true; };
  }, [subcategoryId, currentLanguage]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#173D32" translucent={false} />

      {/* ── 1. SACRED MAROON HEADER WITH BACK ARROW & CORNER FILIGREE ── */}
      <SafeAreaView style={styles.safeHeaderArea}>
        <LinearGradient
          colors={['#173D32', '#173D32', '#0C251E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerLeftFiligree}>
            <CornerFiligree />
          </View>
          <View style={styles.headerRightFiligree}>
            <CornerFiligree />
          </View>

          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={onBack}
              style={styles.backButton}
              activeOpacity={0.8}
              accessibilityLabel="Back"
            >
              <BackArrowIcon />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {headerInfo.title}
              </Text>
            </View>

            <View style={{ width: 38 }} />
          </View>
        </LinearGradient>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── 2. TYPES RECORD LIST (EXACT SUBCATEGORY STYLE) ── */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#DFA62E" />
            <Text style={styles.loadingText}>పుణ్య విభాగాలను లోడ్ చేస్తోంది...</Text>
          </View>
        ) : types.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No types found under this subcategory.</Text>
          </View>
        ) : (
          <View style={styles.cardsContainer}>
            {types.map((item, idx) => (
              <TouchableOpacity
                key={item.id || item.slug || idx}
                style={styles.poojaCard}
                activeOpacity={0.82}
                onPress={() => onSelectType(item)}
                accessibilityRole="button"
                accessibilityLabel={item.title}
              >
                {/* Left: Square Devotional Artwork Thumbnail */}
                <View style={styles.imageThumbnailWrapper}>
                  <TypeThumbnail image={item.imageUrl} deityId={item.deityId || headerInfo.deityId} />
                  <View style={styles.imageThumbnailBorder} />
                </View>

                {/* Center: Title & Short Description */}
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.cardDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                </View>

                {/* Right: Solid Maroon Play Triangle Icon */}
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

// Default 4 types for Sri Maha Ganapathi Pooja
function getStandardGanapathiTypes(): TypeItem[] {
  return [
    {
      id: '2291',
      slug: 'sri-vighneshwara-pooja',
      title: 'శ్రీ విఘ్నేశ్వర పూజ',
      description: 'గణపతి షోడశోపచార పూజా విధానము, అంగపూజ, అష్టోత్తర శత నామావళి మరియు సంపూర్ణ మంగళ హారతి.',
      deityId: 'ganesha',
      order: 1,
    },
    {
      id: '2292',
      slug: 'sri-ganesha-pancharatnam',
      title: 'శ్రీ గణేశ పంచరత్నము',
      description: 'ఆది శంకరాచార్య విరచిత పరమ పవిత్రమైన శ్రీ గణేశ పంచరత్న స్తోత్రము మరియు దివ్య ఫలశ్రుతి.',
      deityId: 'ganesha',
      order: 2,
    },
    {
      id: '2293',
      slug: 'sri-ekadanta-stotram',
      title: 'శ్రీ ఏకదంతస్తోత్రము',
      description: 'సకల విఘ్న నివారణకు ఏకదంతుడైన గణేశుని స్తుతించే దివ్య ఏకదంత స్తోత్రము.',
      deityId: 'ganesha',
      order: 3,
    },
    {
      id: '2294',
      slug: 'sri-sankashtanashana-ganesha-stotram',
      title: 'శ్రీ సంకష్టనాశన గణేశస్తోత్రము',
      description: 'నారద పురాణోక్త శ్రీ సంకష్టనాశన గణేశ స్తోత్రము — సర్వ కార్యసిద్ధి, సంకష్ట నివారణ మంత్రములు.',
      deityId: 'ganesha',
      order: 4,
    },
  ];
}

function resolveTypesFallback(subcategoryId: string, rawId?: string | number, deityId: string = 'ganesha'): TypeItem[] {
  const key = String(rawId || subcategoryId || '').toLowerCase().trim();
  const rawKey = String(rawId || '').toLowerCase().trim();
  const subKey = String(subcategoryId || '').toLowerCase().trim();

  // 1. Check in DEFAULT_CHILDREN
  const list = DEFAULT_CHILDREN[rawKey] || DEFAULT_CHILDREN[subKey] || DEFAULT_CHILDREN[key];
  if (Array.isArray(list) && list.length > 0) {
    return list.map((item, idx) => ({
      id: String(item.id || item.slug || idx + 1),
      slug: item.slug || String(item.id),
      title: item.title,
      description: item.description || 'సకల శుభములు కలిగించే పరమ పవిత్ర పూజా విధానము మరియు స్తోత్రములు.',
      imageUrl: item.imageUrl,
      deityId: deityId,
      order: idx + 1,
    }));
  }

  // 2. Check for Ganesha/Vighneshwara poojas
  if (/ganapa|vignesh|vinayak|mahaganapati/.test(subKey) || /ganapa|vignesh|vinayak|mahaganapati/.test(rawKey)) {
    return getStandardGanapathiTypes();
  }

  return [];
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAF5EE',
  },
  safeHeaderArea: {
    backgroundColor: '#173D32',
  },
  headerGradient: {
    position: 'relative',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeftFiligree: {
    position: 'absolute',
    top: 2,
    left: 2,
    pointerEvents: 'none',
  },
  headerRightFiligree: {
    position: 'absolute',
    top: 2,
    right: 2,
    transform: [{ scaleX: -1 }],
    pointerEvents: 'none',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#FFE49E',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 30,
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
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#8A6D3B',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#777',
  },
});
