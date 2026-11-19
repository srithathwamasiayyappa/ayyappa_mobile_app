import React, { useState, useEffect } from 'react';
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
  TextInput,
  Modal,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { DeityItem, SupportedLanguage } from '../../../types';
import { ApiService } from '../../../services/api';
import { resolveDeityImage } from '../utils/deityImageResolver';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive 3-Column Dimensions for All Deities Grid
const MODAL_HORIZONTAL_PADDING = 16;
const MODAL_GAP = 10;
const MODAL_CARD_WIDTH = Math.floor(
  (SCREEN_WIDTH - MODAL_HORIZONTAL_PADDING * 2 - MODAL_GAP * 2) / 3
);

// Background and Emblem
const SARANAM_DEITY_BG = require('../../../../assets/deities/deity_selection_bg.jpg');

// Comprehensive Deities Catalog
export const ALL_DEITIES_CATALOG: (DeityItem & {
  category: 'popular' | 'shiva' | 'vishnu' | 'devi' | 'others';
  image: any;
  aliases: string[];
})[] = [
  // 6 Featured
  {
    id: 'ayyappa',
    name: 'Lord Ayyappa',
    teluguName: 'అయ్యప్ప స్వామి',
    tamilName: 'ஐயப்பன்',
    kannadaName: 'ಅಯ್ಯಪ್ಪ ಸ್ವಾಮಿ',
    hindiName: 'अय्यप्पा स्वामी',
    category: 'popular',
    isFeatured: true,
    image: require('../../../../assets/deities/lord_ayyappa.png'),
    aliases: ['ayyappa', 'manikanta', 'shabarimala', 'shasta', 'swamy'],
  },
  {
    id: 'ganesha',
    name: 'Lord Ganesha',
    teluguName: 'గణపతి / వినాయక',
    tamilName: 'விநாயகர்',
    kannadaName: 'ಗಣೇಶ',
    hindiName: 'गणेश भगवान',
    category: 'popular',
    isFeatured: true,
    image: require('../../../../assets/deities/lord_ganesha.png'),
    aliases: ['ganesh', 'ganapathi', 'vinayaka', 'vighneshwara', 'pillayar'],
  },
  {
    id: 'murugan',
    name: 'Lord Murugan',
    teluguName: 'మురుగన్ / సుబ్రహ్మణ్య',
    tamilName: 'முருகன்',
    kannadaName: 'ಮುರುಗನ್',
    hindiName: 'मुरुगन / कार्तिकेय',
    category: 'popular',
    isFeatured: true,
    image: require('../../../../assets/deities/lord_murugan.png'),
    aliases: ['muruga', 'subrahmanya', 'kartikeya', 'skanda', 'velan'],
  },
  {
    id: 'shiva',
    name: 'Lord Shiva',
    teluguName: 'పరమ శివుడు',
    tamilName: 'சிவன்',
    kannadaName: 'ಶಿವ',
    hindiName: 'शिव शंकर',
    category: 'shiva',
    isFeatured: true,
    image: require('../../../../assets/deities/lord_shiva.png'),
    aliases: ['shiva', 'mahadev', 'shankara', 'bholenath', 'ishwara'],
  },
  {
    id: 'vishnu',
    name: 'Lord Vishnu',
    teluguName: 'మహా విష్ణువు',
    tamilName: 'விஷ்ணு',
    kannadaName: 'ಮಹಾ ವಿಷ್ಣು',
    hindiName: 'भगवान विष्णु',
    category: 'vishnu',
    isFeatured: true,
    image: require('../../../../assets/deities/lord_vishnu.png'),
    aliases: ['vishnu', 'narayana', 'hari', 'perumal', 'govinda'],
  },
  {
    id: 'devi',
    name: 'Goddess Devi',
    teluguName: 'దేవి / అమ్మవారు',
    tamilName: 'அம்மன் / தேவி',
    kannadaName: 'ದೇವಿ',
    hindiName: 'देवी मां',
    category: 'devi',
    isFeatured: true,
    image: require('../../../../assets/deities/goddess_devi.png'),
    aliases: ['devi', 'amman', 'shakti', 'mata', 'parvati', 'goddess'],
  },

  // Popular & Extended Catalog
  {
    id: 'venkateswara',
    name: 'Lord Venkateswara',
    teluguName: 'శ్రీ వేంకటేశ్వర స్వామి',
    tamilName: 'வெங்கடேஸ்வரர்',
    kannadaName: 'ವೆಂಕಟೇಶ್ವರ ಸ್ವಾಮಿ',
    hindiName: 'श्री वेंकटेश्वर',
    category: 'vishnu',
    image: require('../../../../assets/deities/venkateswara.jpg'),
    aliases: ['balaji', 'govinda', 'tirupati', 'srinivasa', 'venkanna'],
  },
  {
    id: 'krishna',
    name: 'Lord Krishna',
    teluguName: 'శ్రీ కృష్ణుడు',
    tamilName: 'கிருஷ்ணர்',
    kannadaName: 'ಕೃಷ್ಣ',
    hindiName: 'भगवान कृष्ण',
    category: 'vishnu',
    image: require('../../../../assets/deities/krishna.jpg'),
    aliases: ['krishna', 'gopala', 'kanha', 'vasudeva', 'madhava'],
  },
  {
    id: 'rama',
    name: 'Sri Rama',
    teluguName: 'శ్రీ సీతారామ చంద్రులు',
    tamilName: 'ஸ்ரீ ராமர்',
    kannadaName: 'ಶ್ರೀ ರಾಮ',
    hindiName: 'श्री राम',
    category: 'vishnu',
    image: require('../../../../assets/deities/rama.jpg'),
    aliases: ['ram', 'rama', 'raghava', 'sitaram', 'maryada purushottam'],
  },
  {
    id: 'hanuman',
    name: 'Lord Hanuman',
    teluguName: 'హనుమాన్ స్వామి',
    tamilName: 'ஹனுமான்',
    kannadaName: 'ಹನುಮಂತ',
    hindiName: 'हनुमान जी',
    category: 'others',
    image: require('../../../../assets/deities/hanuman.jpg'),
    aliases: ['hanuman', 'anjaneya', 'maruti', 'bajrangbali', 'pavanputra'],
  },
  {
    id: 'durga',
    name: 'Goddess Durga',
    teluguName: 'దుర్గా భవానీ',
    tamilName: 'துர்கா தேவி',
    kannadaName: 'ದುರ್ಗಾ ದೇವಿ',
    hindiName: 'दुर्गा माता',
    category: 'devi',
    image: require('../../../../assets/deities/durga.jpg'),
    aliases: ['durga', 'sherawali', 'bhavani', 'mahishasuramardini', 'chandi'],
  },
  {
    id: 'parvati',
    name: 'Goddess Parvati',
    teluguName: 'పార్వతీ దేవి',
    tamilName: 'பார்வதி',
    kannadaName: 'ಪಾರ್ವತಿ',
    hindiName: 'पार्वती माता',
    category: 'shiva',
    image: require('../../../../assets/deities/goddess_devi.png'),
    aliases: ['parvati', 'gouri', 'girija', 'uma', 'shiva parvati'],
  },
  {
    id: 'lakshmi',
    name: 'Goddess Lakshmi',
    teluguName: 'మహాలక్ష్మి దేవి',
    tamilName: 'லட்சுமி தேவி',
    kannadaName: 'ಲಕ್ಷ್ಮೀ ದೇವಿ',
    hindiName: 'महालक्ष्मी',
    category: 'devi',
    image: require('../../../../assets/deities/goddess_devi.png'),
    aliases: ['lakshmi', 'laxmi', 'sri', 'padma', 'dhanalakshmi'],
  },
  {
    id: 'saraswati',
    name: 'Goddess Saraswati',
    teluguName: 'సరస్వతీ దేవి',
    tamilName: 'சரஸ்வதி',
    kannadaName: 'ಸರಸ್ವತಿ',
    hindiName: 'मां सरस्वती',
    category: 'devi',
    image: require('../../../../assets/deities/goddess_devi.png'),
    aliases: ['saraswati', 'sharada', 'vidya', 'veena vani'],
  },
  {
    id: 'kali',
    name: 'Maa Kali',
    teluguName: 'కాళికా దేవి',
    tamilName: 'காளி மாதா',
    kannadaName: 'ಕಾಳಿ ದೇವಿ',
    hindiName: 'काली माता',
    category: 'devi',
    image: require('../../../../assets/deities/durga.jpg'),
    aliases: ['kali', 'mahakali', 'kalika', 'bhadrakali'],
  },
  {
    id: 'narasimha',
    name: 'Lord Narasimha',
    teluguName: 'లక్ష్మీ నరసింహ స్వామి',
    tamilName: 'நரசிம்மர்',
    kannadaName: 'ನರಸಿಂಹ',
    hindiName: 'नरसिंह भगवान',
    category: 'vishnu',
    image: require('../../../../assets/deities/venkateswara.jpg'),
    aliases: ['narasimha', 'simhadri', 'panchamukha'],
  },
  {
    id: 'saibaba',
    name: 'Shirdi Sai Baba',
    teluguName: 'షిర్డీ సాయి బాబా',
    tamilName: 'சாயி பாபா',
    kannadaName: 'ಸಾಯಿ ಬಾಬಾ',
    hindiName: 'साईं बाबा',
    category: 'others',
    image: require('../../../../assets/deities/lord_ayyappa.png'),
    aliases: ['saibaba', 'sai', 'shirdi', 'sadguru'],
  },
  {
    id: 'dattatreya',
    name: 'Lord Dattatreya',
    teluguName: 'శ్రీ దత్తాత్రేయ స్వామి',
    tamilName: 'தத்தாத்ரேயர்',
    kannadaName: 'ದತ್ತಾತ್ರೇಯ',
    hindiName: 'दत्तात्रेय भगवान',
    category: 'others',
    image: require('../../../../assets/deities/lord_shiva.png'),
    aliases: ['datta', 'dattatreya', 'guru datta'],
  },
  {
    id: 'surya',
    name: 'Surya Bhagavan',
    teluguName: 'సూర్య భగవాన్',
    tamilName: 'சூரிய பகவான்',
    kannadaName: 'ಸೂರ್ಯ ಭಗವಾನ್',
    hindiName: 'सूर्य देव',
    category: 'others',
    image: require('../../../../assets/deities/lord_vishnu.png'),
    aliases: ['surya', 'sun', 'aditya', 'bhaskar', 'ravaye'],
  },
  {
    id: 'bhairava',
    name: 'Kala Bhairava',
    teluguName: 'కాల భైరవ స్వామి',
    tamilName: 'கால பைரவர்',
    kannadaName: 'ಕಾಲ ಭೈರವ',
    hindiName: 'काल भैरव',
    category: 'shiva',
    image: require('../../../../assets/deities/lord_shiva.png'),
    aliases: ['bhairava', 'kala bhairav', 'kshetrapala'],
  },
];

type CategoryFilter = 'all' | 'popular' | 'shiva' | 'vishnu' | 'devi' | 'others';

interface CategoryTab {
  key: CategoryFilter;
  label: string;
}

const CATEGORY_TABS: CategoryTab[] = [
  { key: 'all', label: 'All' },
  { key: 'popular', label: 'Popular' },
  { key: 'shiva', label: 'Shiva Family' },
  { key: 'vishnu', label: 'Vishnu Family' },
  { key: 'devi', label: 'Devi' },
  { key: 'others', label: 'Others' },
];

export interface AllDeitiesScreenProps {
  visible: boolean;
  selectedDeity: DeityItem;
  currentLanguage?: SupportedLanguage;
  onSelectDeity: (deity: DeityItem) => void;
  onClose: () => void;
}

import { isDeityComingSoon } from './ChooseDeityScreen';

export const AllDeitiesScreen: React.FC<AllDeitiesScreenProps> = ({
  visible,
  selectedDeity,
  currentLanguage = 'en',
  onSelectDeity,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [tempSelection, setTempSelection] = useState<DeityItem>(selectedDeity);
  const [deitiesList, setDeitiesList] = useState<DeityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [comingSoonToast, setComingSoonToast] = useState<string | null>(null);

  // Sync tempSelection whenever modal becomes visible
  React.useEffect(() => {
    if (visible) {
      setTempSelection(selectedDeity);
      setSearchQuery('');
      setSelectedCategory('all');
      setComingSoonToast(null);
    }
  }, [visible, selectedDeity]);

  // Auto-dismiss coming soon toast
  React.useEffect(() => {
    if (comingSoonToast) {
      const timer = setTimeout(() => setComingSoonToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [comingSoonToast]);

  // Dynamic server-side search & category filtering directly from DB via API (No UI filtering)
  React.useEffect(() => {
    if (!visible) return;
    let isCancelled = false;

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await ApiService.getDeities({
          search: searchQuery,
          category: selectedCategory,
        });
        if (!isCancelled) {
          setDeitiesList(results);
        }
      } catch (err: any) {
        if (!isCancelled) {
          // Graceful fallback to bundled catalog
          let filtered: DeityItem[] = [...ALL_DEITIES_CATALOG];
          if (selectedCategory && selectedCategory !== 'all') {
            if (selectedCategory === 'popular') {
              filtered = filtered.filter((d: any) => d.category === 'popular' || d.isFeatured);
            } else {
              filtered = filtered.filter((d: any) => d.category === selectedCategory);
            }
          }
          if (searchQuery && searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            filtered = filtered.filter(
              (d: any) =>
                (d.name && d.name.toLowerCase().includes(q)) ||
                (d.teluguName && d.teluguName.includes(q)) ||
                (d.tamilName && d.tamilName.includes(q)) ||
                (d.kannadaName && d.kannadaName.includes(q)) ||
                (d.hindiName && d.hindiName.includes(q)) ||
                (d.aliases && d.aliases.some((a: string) => a.toLowerCase().includes(q)))
            );
          }
          setDeitiesList(filtered);
          setError(null);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }, 200);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [visible, searchQuery, selectedCategory]);

  const handleCardPress = (deity: DeityItem) => {
    if (isDeityComingSoon(deity)) {
      setComingSoonToast(
        `${getLocalizedName(deity)} services & poojas are coming soon! Please choose Lord Ayyappa, Lord Shiva, Lord Ganapathi, or Lord Karthikeya.`
      );
      return;
    }
    setComingSoonToast(null);
    setTempSelection(deity);
  };

  const handleConfirm = () => {
    if (isDeityComingSoon(tempSelection)) {
      setComingSoonToast(
        'Please select an active deity (Lord Ayyappa, Lord Shiva, Lord Ganapathi, or Lord Karthikeya) to confirm.'
      );
      return;
    }
    onSelectDeity(tempSelection);
    onClose();
  };

  const getLocalizedName = (item: DeityItem): string => {
    const trans = (item as any).translations;
    if (trans && trans[currentLanguage]?.name) {
      return trans[currentLanguage].name;
    }
    if (currentLanguage === 'te' && (item.teluguName || trans?.te?.name)) return item.teluguName || trans?.te?.name;
    if (currentLanguage === 'ta' && (item.tamilName || trans?.ta?.name)) return item.tamilName || trans?.ta?.name;
    if (currentLanguage === 'kn' && (item.kannadaName || trans?.kn?.name)) return item.kannadaName || trans?.kn?.name;
    if (currentLanguage === 'hi' && (item.hindiName || trans?.hi?.name)) return item.hindiName || trans?.hi?.name;
    return trans?.en?.name || item.name;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

        {/* Scenic Background Image */}
        <Image
          source={SARANAM_DEITY_BG}
          style={styles.fullScreenBackground}
          resizeMode="cover"
        />

        <SafeAreaView style={styles.safeArea}>
          {/* Top Bar with Circular Back Button */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButtonCircle}
              onPress={onClose}
              activeOpacity={0.8}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Back to Choose Your Deity"
            >
              <Text style={styles.backArrowText}>←</Text>
            </TouchableOpacity>

            <View style={styles.headerTitleGroup}>
              <Text style={styles.headerTitle}>All Deities</Text>
              <Text style={styles.headerSubtitle}>Explore and select from multiple deities</Text>
            </View>

            <View style={styles.topSpacer} />
          </View>

          {/* Search Bar */}
          <View style={styles.searchBarWrapper}>
            <View style={styles.searchInputContainer}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={styles.searchIcon}>
                <Circle cx="11" cy="11" r="7" stroke="#063E2D" strokeWidth="2.2" />
                <Path d="M20 20 L16 16" stroke="#063E2D" strokeWidth="2.2" strokeLinecap="round" />
              </Svg>

              <TextInput
                style={styles.searchInput}
                placeholder="Search Deity (e.g., Ayyappa, Krishna...)"
                placeholderTextColor="#7D8D84"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                autoCorrect={false}
              />

              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.clearSearchBtn}
                >
                  <Text style={styles.clearSearchText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Category Filter Chips */}
          <View style={styles.categoriesWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContent}
            >
              {CATEGORY_TABS.map((tab) => {
                const isActive = selectedCategory === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[
                      styles.categoryChip,
                      isActive ? styles.categoryChipActive : styles.categoryChipInactive,
                    ]}
                    onPress={() => setSelectedCategory(tab.key)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        isActive ? styles.categoryChipTextActive : styles.categoryChipTextInactive,
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Scrollable Deity Grid in Ivory Card Wrapper */}
          <View style={styles.gridContainerWrapper}>
            <LinearGradient
              colors={['#FFFBF2', '#FAF3E3', '#F5EBD8']}
              style={styles.gridPanel}
            >
              {loading && deitiesList.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                  <ActivityIndicator size="small" color="#063E2D" />
                  <Text style={[styles.emptyStateSubtitle, { marginTop: 8 }]}>
                    Searching deities from database...
                  </Text>
                </View>
              ) : error ? (
                <View style={styles.emptyStateContainer}>
                  <Text style={styles.emptyStateEmoji}>⚠️</Text>
                  <Text style={styles.emptyStateTitle}>Connection Error</Text>
                  <Text style={styles.emptyStateSubtitle}>{error}</Text>
                </View>
              ) : deitiesList.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                  <Text style={styles.emptyStateEmoji}>🕉️</Text>
                  <Text style={styles.emptyStateTitle}>No Deities Found</Text>
                  <Text style={styles.emptyStateSubtitle}>
                    Try searching with another name or select 'All'
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={deitiesList}
                  keyExtractor={(item) => item.id}
                  numColumns={3}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.listContent}
                  renderItem={({ item }) => {
                    const isComingSoon = isDeityComingSoon(item);
                    const isSelected = tempSelection.id === item.id;
                    const displayName = getLocalizedName(item);

                    return (
                      <TouchableOpacity
                        style={[
                          styles.deityCard,
                          isSelected ? styles.deityCardSelected : styles.deityCardUnselected,
                          isComingSoon && styles.deityCardComingSoon,
                        ]}
                        onPress={() => handleCardPress(item)}
                        activeOpacity={0.85}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: isSelected }}
                      >
                        {/* Deity Image */}
                        <View style={styles.imageContainer}>
                          {/* "Coming Soon" Badge Above Image */}
                          {isComingSoon && (
                            <View style={styles.comingSoonBadge}>
                              <Text style={styles.comingSoonBadgeText}>Coming Soon</Text>
                            </View>
                          )}

                          <Image
                            source={resolveDeityImage(item)}
                            style={[styles.cardImage, isComingSoon && styles.cardImageComingSoon]}
                            resizeMode="contain"
                          />
                          {/* Selection Checkmark Badge */}
                          {isSelected && !isComingSoon && (
                            <View style={styles.checkmarkBadge}>
                              <Svg width={10} height={10} viewBox="0 0 14 14" fill="none">
                                <Path
                                  d="M2.5 7 L5.5 10 L11.5 3.5"
                                  stroke="#FFFFFF"
                                  strokeWidth={2.4}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </Svg>
                            </View>
                          )}
                        </View>

                        {/* Deity Name */}
                        <Text
                          style={[
                            styles.cardNameText,
                            isSelected && styles.cardNameTextSelected,
                            isComingSoon && styles.cardNameTextComingSoon,
                          ]}
                          numberOfLines={2}
                        >
                          {displayName}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              )}

              {/* Coming Soon Toast Banner */}
              {comingSoonToast && (
                <View style={styles.comingSoonToastBox}>
                  <Text style={styles.comingSoonToastIcon}>⏳</Text>
                  <Text style={styles.comingSoonToastText}>{comingSoonToast}</Text>
                </View>
              )}

              {/* Bottom Confirm Button */}
              <View style={styles.bottomConfirmWrapper}>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleConfirm}
                  activeOpacity={0.88}
                >
                  <LinearGradient
                    colors={['#075E2B', '#094C23', '#0B4420']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.confirmGradient}
                  >
                    <Text style={styles.confirmButtonText}>
                      Select {tempSelection.name} →
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1B542C', // Pearl Green
  },
  fullScreenBackground: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.7, // 70% opacity
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 16) + 4 : 8,
    paddingBottom: 8,
    zIndex: 20,
  },
  backButtonCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFDF8',
    borderWidth: 1.4,
    borderColor: '#DFA62E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 3,
  },
  backArrowText: {
    color: '#063E2D',
    fontSize: 20,
    fontWeight: '700',
    marginTop: Platform.OS === 'ios' ? -2 : -3,
  },
  headerTitleGroup: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#063E2D',
    fontFamily: Platform.select({
      ios: 'Poppins-Bold',
      android: 'Poppins_700Bold',
      web: 'Poppins, sans-serif',
      default: 'Poppins_700Bold',
    }),
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#3A4B43',
    marginTop: 1,
  },
  topSpacer: {
    width: 38,
  },

  // Search Bar
  searchBarWrapper: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF8',
    borderWidth: 1.2,
    borderColor: '#DFA62E',
    borderRadius: 22,
    paddingHorizontal: 12,
    height: 42,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#063E2D',
    paddingVertical: 0,
  },
  clearSearchBtn: {
    padding: 4,
  },
  clearSearchText: {
    fontSize: 14,
    color: '#7D8D84',
    fontWeight: '700',
  },

  // Category Filter Chips
  categoriesWrapper: {
    marginBottom: 10,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.2,
  },
  categoryChipActive: {
    backgroundColor: '#075E2B',
    borderColor: '#075E2B',
  },
  categoryChipInactive: {
    backgroundColor: '#FFFDF8',
    borderColor: '#DFA62E',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  categoryChipTextInactive: {
    color: '#063E2D',
  },

  // Grid Panel
  gridContainerWrapper: {
    flex: 1,
    paddingHorizontal: 14,
    paddingBottom: Platform.OS === 'ios' ? 16 : 10,
  },
  gridPanel: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1.4,
    borderColor: '#DFA62E',
    paddingTop: 10,
    paddingHorizontal: 10,
    overflow: 'hidden',
    shadowColor: '#DFA62E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },
  listContent: {
    paddingBottom: 70,
  },

  // Deity Card
  deityCard: {
    width: MODAL_CARD_WIDTH,
    margin: 4,
    borderRadius: 14,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  deityCardUnselected: {
    backgroundColor: '#FFFDF7',
    borderWidth: 1.2,
    borderColor: '#DFA62E',
    shadowColor: '#DFA62E',
  },
  deityCardSelected: {
    backgroundColor: '#ECF5DD',
    borderWidth: 1.8,
    borderColor: '#08682F',
    shadowColor: '#08682F',
  },
  imageContainer: {
    position: 'relative',
    width: 60,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImage: {
    width: 58,
    height: 54,
    borderRadius: 8,
  },
  deityCardComingSoon: {
    opacity: 0.9,
  },
  cardImageComingSoon: {
    opacity: 0.72,
  },
  cardNameTextComingSoon: {
    color: '#76857E',
  },
  comingSoonBadge: {
    position: 'absolute',
    top: -4,
    zIndex: 10,
    backgroundColor: '#FFE9B5',
    borderWidth: 1,
    borderColor: '#D49216',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    alignSelf: 'center',
    shadowColor: '#8C5E13',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.5,
    elevation: 3,
  },
  comingSoonBadgeText: {
    fontFamily: Platform.select({
      ios: 'Poppins-Bold',
      android: 'Poppins_700Bold',
      web: 'Poppins, sans-serif',
      default: 'Poppins_700Bold',
    }),
    fontSize: 6.8,
    fontWeight: '800',
    color: '#8C5E13',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  comingSoonToastBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF6E3',
    borderWidth: 1.2,
    borderColor: '#E5A932',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    shadowColor: '#8C5E13',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  comingSoonToastIcon: {
    fontSize: 14,
  },
  comingSoonToastText: {
    flex: 1,
    fontFamily: Platform.select({
      ios: 'Poppins-Medium',
      android: 'Poppins_500Medium',
      web: 'Poppins, sans-serif',
      default: 'Poppins_500Medium',
    }),
    fontSize: 10.5,
    color: '#7D4F00',
    lineHeight: 14.5,
  },
  checkmarkBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: '#08682F',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: '#FFFFFF',
  },
  cardNameText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#063E2D',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 14,
    minHeight: 28,
  },
  cardNameTextSelected: {
    color: '#08682F',
  },

  // Empty State
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyStateEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#063E2D',
  },
  emptyStateSubtitle: {
    fontSize: 12,
    color: '#7D8D84',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
  },

  // Bottom Confirm Button
  bottomConfirmWrapper: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  confirmButton: {
    width: '100%',
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#075E2B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 4,
  },
  confirmGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
