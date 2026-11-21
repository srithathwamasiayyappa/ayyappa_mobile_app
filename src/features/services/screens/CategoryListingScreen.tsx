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
import { PRODUCTION_BASE_URL } from '../../../services/api';

// Helper to reliably resolve Deity ID from slug/title
function resolveDeityFromSlugOrTitle(slug = '', title = ''): string {
  const str = `${slug} ${title}`.toLowerCase();
  if (/ganesh|vignesh|vinayak|ganapath|modak|బొమ్మ|గణపతి|వినాయక|విఘ్నేశ్వర|గణేశ|గణప|మోదక/.test(str)) return 'ganesha';
  if (/devi|durga|lakshmi|lalitha|kanakadhara|mahalakshmi|meenakshi|kamakshi|saraswathi|gomatha|kamadhenu|parameshwari|akhilandeshwari|దండాల|అంబ|దేవి|లక్ష్మి|దుర్గ|లలిత|సరస్వతి|గోమాత|కామధేను|వరలక్ష్మి|మాళికాపురత్తమ్మ/.test(str)) return 'devi';
  if (/ayyap|sastha|harivarasanam|shabarimala|uthara|sannidhanam|padi|maaladharan|sharanu|harathi|గురు నాథ|గురునాథ|సాయంకాల|అయ్యప్ప|శాస్తా|శాస్త|శబరిమల|మాలాధారణ|హరివరాసనం|శరణం|హారతి|ఇరుముడి|పడి/.test(str)) return 'ayyappa';
  if (/shiva|linga|bilva|rudra|natara|mrityunjaya|kedar|శివ|లింగ|బిల్వ|రుద్ర|మృత్యుంజయ|ఈశ్వర|కేదారేశ్వర|నటరాజ/.test(str)) return 'shiva';
  if (/venkates|vishnu|koodalmanikya|achyuta|govinda|narayana|perumal|satyanarayana|guruvayoor|వేంకట|వెంకట|విష్ణు|సత్యనారాయణ|గోవింద|నారాయణ|శ్రీనివాస|గురువాయూరప్ప/.test(str)) return 'venkateswara';
  if (/hanuman|anjaneya|maruti|bajrang|sundarakanda|హనుమాన్|ఆంజనేయ|మారుతి|రామదూత/.test(str)) return 'hanuman';
  if (/subrahmanya|murugan|kartikeya|saravana|shanmukha|vel|skanda|pazhani|సుబ్రహ్మణ్య|మురుగన్|కార్తికేయ|షణ్ముఖ|స్కంద|పళని/.test(str)) return 'murugan';
  return 'all';
}

function getParentCategoryKey(categoryId: string): string {
  const c = (categoryId || '').toLowerCase();
  if (c === 'pooja' || c === 'pooja-vidhanam' || c === '113') return '113';
  if (c === 'stotras' || c === 'astothrams' || c === '114') return '114';
  if (c === 'slokas' || c === '115') return '115';
  if (c === 'songs' || c === 'bhajans' || c === 'harathis' || c === '116') return '116';
  return categoryId;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  categoryId: string;
  categoryTitle?: string;
  currentLanguage: SupportedLanguage;
  initialDeity?: string;
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
  hanuman: require('../../../../assets/deities/hanuman.jpg'),
  murugan: require('../../../../assets/deities/card_murugan.jpg'),
};

interface ListingItem {
  id: string;
  title: string;
  desc: string;
  deityId: string;
  image: any;
}

const CategoryCardThumbnail: React.FC<{ image: any; deityId: string }> = ({ image, deityId }) => {
  const [hasError, setHasError] = useState(false);
  const fallback = DEITY_IMAGES[deityId] || DEITY_IMAGES.ayyappa;

  const isRemote = !hasError && typeof image === 'string' && (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('/uploads'));
  const remoteUri = isRemote
    ? (image.startsWith('/uploads') ? `https://backendapis.saranamayyappa.in${image}` : image)
    : null;

  return (
    <View style={StyleSheet.absoluteFillObject}>
      {/* 1. Guaranteed Authentic Pre-bundled Deity Artwork */}
      <Image
        source={typeof image === 'object' && image ? image : fallback}
        style={styles.imageThumbnail}
        resizeMode="cover"
      />
      {/* 2. Live Dynamic Remote Image (Gracefully Falls Back if 404 or Network Error) */}
      {remoteUri && (
        <Image
          source={{ uri: remoteUri }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
          onError={() => setHasError(true)}
        />
      )}
    </View>
  );
};

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
      id: 'pooja-poorvaangam',
      title: 'Pooja Poorvaangam',
      desc: 'దీపారాధన, గురు ప్రార్థన, గణపతి ధ్యానము, సంకల్పము',
      deityId: 'all',
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
      id: 'vinayaka-vratha-kalpam',
      title: 'Vinayaka Vratha Kalpam',
      desc: 'వినాయక చవితి సంపూర్ణ వ్రత కల్ప విధానము',
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
      id: 'sri-devi-pooja',
      title: 'Sri Devi Pooja',
      desc: 'శ్రీ మాళికాపురత్తమ్మ నిత్య పూజా విధానం',
      deityId: 'devi',
      image: DEITY_IMAGES.devi,
    },
    {
      id: 'sri-gomatha-pooja',
      title: 'Sri Gomatha Pooja',
      desc: 'కామధేను గోమాత పూజా విధానం & ప్రదక్షిణ మంత్రములు',
      deityId: 'devi',
      image: DEITY_IMAGES.devi,
    },
    {
      id: 'varalakshmi-vratham',
      title: 'Varalakshmi Vratham',
      desc: 'వరలక్ష్మీ వ్రతం, తోరగ్రంథి పూజ మరియు కథ',
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
    {
      id: 'kedareswara-vratham',
      title: 'Kedareswara Vratham',
      desc: 'దీపావళి పరమ పవిత్రమైన కేదారేశ్వర నోము విధానము',
      deityId: 'shiva',
      image: DEITY_IMAGES.shiva,
    },
    {
      id: 'hanuman-pooja',
      title: 'Hanuman Pooja & Sindhooram',
      desc: 'For courage, protection & inner strength',
      deityId: 'hanuman',
      image: DEITY_IMAGES.hanuman,
    },
    {
      id: 'subramanya-pooja',
      title: 'Subramanya Sashti Pooja',
      desc: 'For victory, youth & overcoming challenges',
      deityId: 'murugan',
      image: DEITY_IMAGES.murugan,
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
    {
      id: 'hanuman-astothram',
      title: 'Hanuman Ashtottaram',
      desc: '108 heroic names of Sri Anjaneya Swamy',
      deityId: 'hanuman',
      image: DEITY_IMAGES.hanuman,
    },
    {
      id: 'subramanya-astothram',
      title: 'Subramanya Ashtottaram',
      desc: '108 divine names of Lord Murugan',
      deityId: 'murugan',
      image: DEITY_IMAGES.murugan,
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
    {
      id: 'hanuman-chalisa',
      title: 'Hanuman Chalisa',
      desc: '40 sacred verses by Goswami Tulsidas',
      deityId: 'hanuman',
      image: DEITY_IMAGES.hanuman,
    },
    {
      id: 'kanda-sashti-kavasam',
      title: 'Kanda Sashti Kavasam',
      desc: 'Protective divine armour of Lord Murugan',
      deityId: 'murugan',
      image: DEITY_IMAGES.murugan,
    },
  ],
  bhajans: [
    {
      id: 'om-guru-natha',
      title: 'ఓం గురు నాథ',
      desc: 'అయ్యప్ప గురు కీర్తన - ఓం గురు నాథ సద్గురు నాథ',
      deityId: 'ayyappa',
      image: DEITY_IMAGES.ayyappa,
    },
    {
      id: 'saayamkaala-samayamlo',
      title: 'సాయంకాల సమయంలో',
      desc: 'సాయంకాల సమయంలో అయ్యప్ప భజన చేసెదము',
      deityId: 'ayyappa',
      image: DEITY_IMAGES.ayyappa,
    },
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
      id: 'ganapathi-bhajanalu',
      title: 'గణపతి భజనలు',
      desc: 'గణపతి ఓం గణపతి ఓం - గౌరీ నందన గణపతి ఓం',
      deityId: 'ganesha',
      image: DEITY_IMAGES.ganesha,
    },
    {
      id: 'saranam-ganesha',
      title: 'శరణం గణేశ',
      desc: 'శరణం గణేశ శరణం గణేశ విఘ్నవినాశక',
      deityId: 'ganesha',
      image: DEITY_IMAGES.ganesha,
    },
    {
      id: 'dandalaamma-neeku-dandaalama',
      title: 'దండాలమ్మా నీకు దండాలమ',
      desc: 'మాళికాపురత్తమ్మ దేవీ కీర్తన',
      deityId: 'devi',
      image: DEITY_IMAGES.devi,
    },
    {
      id: 'ambaparameshwari-akhilandeshwari',
      title: 'అంబపరమేశ్వరి అఖిలాండేశ్వరి',
      desc: 'ఆదిపరాశక్తి జగన్మాత భజన',
      deityId: 'devi',
      image: DEITY_IMAGES.devi,
    },
    {
      id: 'ayigiri-nandini-bhajan',
      title: 'Ayigiri Nandini',
      desc: 'Fast-paced devotional Devi chant',
      deityId: 'devi',
      image: DEITY_IMAGES.devi,
    },
    {
      id: 'shiva-tandava',
      title: 'Shiva Tandava Stotram',
      desc: 'Rhythmic devotional hymn of Shiva',
      deityId: 'shiva',
      image: DEITY_IMAGES.shiva,
    },
    {
      id: 'guruvayoorappa',
      title: 'గురువాయూరప్ప',
      desc: 'గురువాయూరప్పా శరణం కృష్ణ ప్రభో',
      deityId: 'venkateswara',
      image: DEITY_IMAGES.venkateswara,
    },
    {
      id: 'anjaneya-keerthana-eemira-dora',
      title: 'ఆంజనేయ కీర్తన ఏమిరా దొర',
      desc: 'రామదాసుడై నిలచిన ఆంజనేయ విభుమ్',
      deityId: 'hanuman',
      image: DEITY_IMAGES.hanuman,
    },
    {
      id: 'hanuman-bhajan',
      title: 'Sri Ram Jai Ram Jai Hanuman',
      desc: 'Uplifting devotional Sankirtan',
      deityId: 'hanuman',
      image: DEITY_IMAGES.hanuman,
    },
    {
      id: 'pazhanimalai-swamiki',
      title: 'పళనిమలై స్వామికి',
      desc: 'షణ్ముఖ వేలవ స్వామికి హరోహర',
      deityId: 'murugan',
      image: DEITY_IMAGES.murugan,
    },
    {
      id: 'muruga-muruga-bhajan',
      title: 'Muruga Muruga Om Muruga',
      desc: 'Sacred hymn in praise of Lord Shanmukha',
      deityId: 'murugan',
      image: DEITY_IMAGES.murugan,
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
      id: 'hanuman-harathi',
      title: 'Hanuman Aarti',
      desc: 'Aarti Kije Hanuman Lala Ki deeparadhana',
      deityId: 'hanuman',
      image: DEITY_IMAGES.hanuman,
    },
    {
      id: 'subramanya-harathi',
      title: 'Subramanya Swamy Harathi',
      desc: 'Sacred deepam praise for Lord Skanda',
      deityId: 'murugan',
      image: DEITY_IMAGES.murugan,
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

// Filter tabs definition (All | Ayyappa | Shiva | Devi | Ganesha | Venkateswara | Hanuman | Murugan)
const DEITY_FILTER_LABELS: Record<string, Record<string, string>> = {
  all: { en: 'All', te: 'అన్నీ', kn: 'ಎಲ್ಲಾ', ta: 'அனைத்தும்', hi: 'सभी' },
  ayyappa: { en: 'Ayyappa', te: 'అయ్యప్ప', kn: 'ಅಯ್ಯಪ್ಪ', ta: 'ஐயப்பா', hi: 'अय्यप्पा' },
  shiva: { en: 'Shiva', te: 'శివ', kn: 'ಶಿವ', ta: 'சிவன்', hi: 'शिव' },
  devi: { en: 'Devi', te: 'దేవి', kn: 'ದೇವಿ', ta: 'தேவி', hi: 'देवी' },
  ganesha: { en: 'Ganesha', te: 'గణేశ', kn: 'ಗಣೇಶ', ta: 'விநாயகர்', hi: 'गणेश' },
  venkateswara: { en: 'Venkateswara', te: 'వేంకటేశ్వర', kn: 'ವೆಂಕಟೇಶ್ವರ', ta: 'வெங்கடேஸ்வரா', hi: 'वेंकटेश्वर' },
  hanuman: { en: 'Hanuman', te: 'హనుమాన్', kn: 'ಹನುಮಾನ್', ta: 'அனுமன்', hi: 'हनुमान' },
  murugan: { en: 'Murugan', te: 'మురుగన్', kn: 'ಮುರುಗನ್', ta: 'முருகன்', hi: 'मुरुगन' },
};

const FILTER_TABS = [
  { id: 'all', defaultLabel: 'All' },
  { id: 'ayyappa', defaultLabel: 'Ayyappa' },
  { id: 'shiva', defaultLabel: 'Shiva' },
  { id: 'devi', defaultLabel: 'Devi' },
  { id: 'ganesha', defaultLabel: 'Ganesha' },
  { id: 'venkateswara', defaultLabel: 'Venkateswara' },
  { id: 'hanuman', defaultLabel: 'Hanuman' },
  { id: 'murugan', defaultLabel: 'Murugan' },
];

export const CategoryListingScreen: React.FC<Props> = ({
  categoryId = 'pooja-vidhanam',
  categoryTitle,
  currentLanguage = 'en',
  initialDeity = 'all',
  onSelectItem,
  onBack,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [dbItems, setDbItems] = useState<ListingItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (initialDeity && initialDeity !== 'all') {
      setSelectedFilter(initialDeity);
    } else {
      setSelectedFilter('all');
    }
  }, [initialDeity, categoryId]);

  // Dynamically fetch subcategories from DB via Backend API
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    const fetchSubcategories = async () => {
      try {
        const parentKey = getParentCategoryKey(categoryId);
        const deityParam = selectedFilter && selectedFilter !== 'all' ? `&deity=${encodeURIComponent(selectedFilter)}` : '';
        const url = `${PRODUCTION_BASE_URL}/categories/subcategories?parent=${encodeURIComponent(parentKey)}&lang=${currentLanguage}${deityParam}&limit=100`;

        const res = await fetch(url);
        const json = await res.json().catch(() => null);

        if (!isCancelled && json && Array.isArray(json.data) && json.data.length > 0) {
          const mapped = json.data.map((item: any) => {
            const rawSlug = item.slug || String(item.id);
            const titleFormatted = item.title && item.title !== rawSlug
              ? item.title
              : rawSlug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());

            const resolvedDeity = item.deityId && item.deityId !== 'all'
              ? item.deityId
              : resolveDeityFromSlugOrTitle(rawSlug, titleFormatted);

            const rawImg = typeof item.image === 'string' ? item.image : (typeof item.imageUrl === 'string' ? item.imageUrl : '');
            const validImg = rawImg && !rawImg.includes('.webp') ? rawImg : null;

            return {
              id: rawSlug,
              title: titleFormatted,
              desc: item.desc || item.description || '',
              deityId: resolvedDeity,
              image: validImg || DEITY_IMAGES[resolvedDeity] || DEITY_IMAGES.ayyappa,
            };
          });

          // Filter by selected deity if server didn't already
          const finalItems = selectedFilter === 'all'
            ? mapped
            : mapped.filter((item: ListingItem) => item.deityId === selectedFilter);

          setDbItems(finalItems);
        } else if (!isCancelled) {
          setDbItems(null); // Fallback to verified local catalog
        }
      } catch (e) {
        console.warn('Failed to fetch subcategories from DB API:', e);
        if (!isCancelled) setDbItems(null);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchSubcategories();
    return () => { isCancelled = true; };
  }, [categoryId, selectedFilter, currentLanguage]);

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

  // Normalize key to lookup in MASTER_CATEGORY_CONTENT
  const normalizedKey = (
    categoryId === 'pooja' || categoryId === 'pooja-vidhanam'
      ? 'pooja-vidhanam'
      : categoryId === 'stotras'
      ? 'astothrams'
      : categoryId === 'songs' || categoryId === 'bhajans'
      ? 'bhajans'
      : categoryId
  );

  // Fallback items based on category
  const allCategoryItems = MASTER_CATEGORY_CONTENT[normalizedKey] || MASTER_CATEGORY_CONTENT[categoryId] || MASTER_CATEGORY_CONTENT['pooja-vidhanam'];

  // Filter items by selected deity tab
  const fallbackFilteredItems = selectedFilter === 'all'
    ? allCategoryItems
    : allCategoryItems.filter((item) => item.deityId === selectedFilter);

  const filteredItems = (dbItems && dbItems.length > 0) ? dbItems : fallbackFilteredItems;

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
            const tabLabel = DEITY_FILTER_LABELS[tab.id]?.[currentLanguage] || tab.defaultLabel;
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
                accessibilityLabel={tabLabel}
              >
                {isSelected ? (
                  <LinearGradient
                    colors={['#173D32', '#173D32', '#0C251E']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.filterTabGradient}
                  >
                    <Text style={styles.filterTextSelected}>{tabLabel}</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.filterTextUnselected}>{tabLabel}</Text>
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
                  <CategoryCardThumbnail image={item.image} deityId={item.deityId} />
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

