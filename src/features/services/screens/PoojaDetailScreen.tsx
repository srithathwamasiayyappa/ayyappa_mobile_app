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
  Modal,
  Alert,
  BackHandler,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Line, Polygon, Ellipse, Rect } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SupportedLanguage } from '../../../types';
import { AYYAPPA_PADI_POOJA_ITEMS } from '../../../data/ayyappaSubcategoriesData';
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
  itemId: string;
  rawId?: string;
  title?: string;
  currentLanguage: SupportedLanguage;
  onBack: () => void;
}

// Corner Filigree Ornaments for Header
const HeaderCornerFiligree = ({ flipped = false }: { flipped?: boolean }) => (
  <View style={flipped ? { transform: [{ scaleX: -1 }] } : undefined}>
    <Svg width={40} height={40} viewBox="0 0 36 36" fill="none">
      <Path
        d="M2 2 C12 2 22 8 28 16 C24 18 18 16 12 22 C8 16 6 8 2 2 Z"
        fill="#DFA62E"
        fillOpacity={0.7}
      />
      <Circle cx="8" cy="8" r="2" fill="#FFD700" />
      <Circle cx="16" cy="5" r="1.5" fill="#FFD700" />
      <Circle cx="5" cy="16" r="1.5" fill="#FFD700" />
    </Svg>
  </View>
);

// Solid Maroon Play Triangle Icon for devotional cards
const CardPlayTriangleIcon = () => (
  <Svg width={14} height={16} viewBox="0 0 14 16" fill="none">
    <Polygon points="2,1 13,8 2,15" fill="#173D32" />
  </Svg>
);

// Back Arrow inside circular white button
const BackArrowIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M12 19l-7-7 7-7"
      stroke="#173D32"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Hanging Brass Lamp (Thookku Vilakku) on both sides of Deity
const HangingBrassLamp = ({ style }: { style?: any }) => (
  <View style={[{ alignItems: 'center' }, style]}>
    <Svg width={38} height={124} viewBox="0 0 38 124" fill="none">
      {/* Chain link */}
      <Line x1="19" y1="0" x2="19" y2="46" stroke="#FFD700" strokeWidth="1.6" strokeDasharray="3 2" />
      {/* Hook */}
      <Circle cx="19" cy="49" r="3" stroke="#DFA62E" strokeWidth="1.6" fill="none" />
      {/* Top Cap */}
      <Path d="M13 53 C13 51 25 51 25 53 L23 58 L15 58 Z" fill="#DFA62E" />
      {/* Middle Spindle */}
      <Line x1="19" y1="58" x2="19" y2="68" stroke="#FFD700" strokeWidth="2.2" />
      {/* Oil Basin */}
      <Path d="M7 72 Q19 80 31 72 L29 79 Q19 87 9 79 Z" fill="#E5A93C" />
      <Ellipse cx="19" cy="72" rx="12" ry="3" fill="#DFA62E" />
      {/* Bottom Dangler */}
      <Path d="M16 87 L22 87 L20 95 L18 95 Z" fill="#FFD700" />
      <Circle cx="19" cy="98" r="2.5" fill="#DFA62E" />
      {/* Glow & Flame */}
      <Circle cx="19" cy="69" r="6" fill="#FFA500" fillOpacity={0.4} />
      <Path d="M19 63 C16.5 68 17.5 71 19 71 C20.5 71 21.5 68 19 63 Z" fill="#FFD700" />
      <Path d="M19 65 C17.5 68 18 70 19 70 C20 70 20.5 68 19 65 Z" fill="#FFFFFF" />
    </Svg>
  </View>
);

// Play Triangle Icon inside circular maroon button
const PlayTriangleIcon = () => (
  <Svg width={18} height={20} viewBox="0 0 18 20" fill="none">
    <Polygon points="3,1 17,10 3,19" fill="#FFFFFF" />
  </Svg>
);

// Download Tray & Arrow Icon
const DownloadTrayIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
      stroke="#173D32"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Heart Icon for Save / Favorite
const HeartFavoriteIcon = ({ isSaved }: { isSaved: boolean }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      stroke="#173D32"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={isSaved ? '#173D32' : 'none'}
    />
  </Svg>
);

// Checkmark for Materials
const CheckMarkIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17l-5-5"
      stroke="#FFFFFF"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
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

type DetailTab = 'overview' | 'procedure' | 'materials' | 'benefits';

interface PoojaDetailContent {
  id: string;
  deityId: string;
  defaultTitle: string;
  regionalTitles: Record<string, string>;
  overview: {
    heading: string;
    description: string;
    videoDuration: string;
  };
  procedure: Array<{
    stepNumber: number;
    title: string;
    duration: string;
    description: string;
    mantra?: string;
  }>;
  materials: Array<{
    id: string;
    name: string;
    quantity: string;
    category: 'essential' | 'dravyas' | 'flowers' | 'naivedyam';
  }>;
  benefits: Array<{
    title: string;
    description: string;
  }>;
  auspiciousDays: string;
}

// Master Pooja Detail Information (Dynamic for all poojas)
const POOJA_DETAILS: Record<string, PoojaDetailContent> = {
  'ayyappa-padi-pooja': {
    id: 'ayyappa-padi-pooja',
    deityId: 'ayyappa',
    defaultTitle: 'Ayyappa Padi Pooja',
    regionalTitles: {
      en: 'Ayyappa Padi Pooja',
      te: 'అయ్యప్ప పడి పూజ',
      ta: 'ஐயப்ப படி பூஜை',
      kn: 'ಅಯ್ಯಪ್ಪ ಪಡಿ ಪೂಜೆ',
      hi: 'अय्यप्पा पडी पूजा',
      ml: 'അയ്യപ്പ പടി പൂജ',
    },
    overview: {
      heading: 'Ayyappa Padi Pooja',
      description:
        'A sacred worship of Lord Ayyappa, especially during Mandala season, to seek His grace, strength and spiritual upliftment.',
      videoDuration: '45 mins • Full Ritual Walkthrough',
    },
    procedure: [
      {
        stepNumber: 1,
        title: 'Shuddhi & Deepa Prajwalana',
        duration: '10 Mins',
        description:
          'Cleanse the altar and sanctify the pooja space with holy theertham. Place two holy brass lamps facing east and light them with pure sesame oil or cow ghee.',
        mantra: 'దీపజ్యోతిః పరబ్రహ్మ దీపజ్యోతిః జనార్దనః | దీపో హరతు మే పాపం దీపజ్యోతిర్నమోస్తుతే ||',
      },
      {
        stepNumber: 2,
        title: 'Ganapathi Dhyanam & Sankalpam',
        duration: '15 Mins',
        description:
          'Invoke Lord Vigneshwara with turmeric Ganapathi (Pasupu Ganapathi) for obstacle-free pooja. Devotee holds akshatas and flowers to make the sacred vow (Sankalpa) citing gotra, nakshatra, and righteous wishes.',
        mantra: 'శుక్లాంబరధరం విష్ణుం శశివర్ణం చతుర్భుజం | ప్రసన్నవదనం ధ్యాయేత్ సర్వవిఘ్నోపశాంతయే ||',
      },
      {
        stepNumber: 3,
        title: 'Guru Vandanam & Sastha Avahanam',
        duration: '15 Mins',
        description:
          'Offer salutations to the Guru Swami. Invoke Sri Dharma Sastha upon the consecrated peetam with holy flowers and sandalwood paste.',
        mantra: 'లోకవీరం మహా పూజ్యం సర్వరక్షాకరం విభుమ్ | మనోజవం మదమథనం శాస్తారం ప్రణమామ్యహమ్ ||',
      },
      {
        stepNumber: 4,
        title: 'Ashtothara Shatanama Archana',
        duration: '20 Mins',
        description:
          'Perform archana offering 108 holy names of Lord Ayyappa using fresh jasmine flowers, bilva leaves, kumkuma, and sacred akshatas.',
        mantra: 'ఓం స్వామినే నమః | ఓం శబరీగిరీశాయ నమః | ఓం హరిహరపుత్రాయ నమః | ఓం ఆనందరూపాయ నమః ||',
      },
      {
        stepNumber: 5,
        title: 'Pathinettam Padi Pooja (18 Holy Steps)',
        duration: '30 Mins',
        description:
          'Consecrate each of the 18 holy steps representing the spiritual ascent: mastery over 5 Indriyas, 8 Ragas, 3 Gunas, Vidya & Avidya. Light holy camphor and ghee deepams on each step.',
        mantra: 'ఓం ప్రథమ పద్యై నమః ... ఓం అష్టాదశ పద్యై నమః | స్వామియే శరణం అయ్యప్ప ||',
      },
      {
        stepNumber: 6,
        title: 'Harivarasanam & Mangala Harathi',
        duration: '15 Mins',
        description:
          'Perform the sacred camphor wave (Karpura Harathi) to Lord Sastha amidst the ringing of bells and conch. Conclude by singing the peaceful divine lullaby Harivarasanam.',
        mantra: 'హరివరాసనం విశ్వమోహనం హరిదధీశ్వరం ఆరాధ్యపాదుకమ్ | అరివిమర్దనం నిత్యనర్తనం హరిహరాత్మజం దేవమాశ్రయే ||',
      },
      {
        stepNumber: 7,
        title: 'Naivedyam & Prasada Viniyogam',
        duration: '10 Mins',
        description:
          'Offer consecrated coconuts, Neyyappam, Aravana Payasam, panchamritam, and bananas. Prostrate before the Lord and distribute the prasadam to all devotees.',
      },
    ],
    materials: [
      { id: 'm1', name: 'Clean Coconuts (Pathinettam Padi)', quantity: '18 Nos', category: 'essential' },
      { id: 'm2', name: 'Brass Kuthuvilakku Lamps', quantity: '2 Pairs', category: 'essential' },
      { id: 'm3', name: 'Pure Cow Ghee / Sesame Oil', quantity: '1 Litre', category: 'essential' },
      { id: 'm4', name: 'Long Cotton Wicks (Pari Vathulu)', quantity: '1 Packet', category: 'essential' },
      { id: 'm5', name: 'Pure Camphor (Karpooram)', quantity: '100g', category: 'dravyas' },
      { id: 'm6', name: 'Turmeric (Pasupu) & Kumkuma', quantity: '200g each', category: 'dravyas' },
      { id: 'm7', name: 'Pure Sandalwood Paste (Chandanam)', quantity: '50g', category: 'dravyas' },
      { id: 'm8', name: 'Akshatas (Raw Rice with Turmeric)', quantity: '250g', category: 'dravyas' },
      { id: 'm9', name: 'Fresh Jasmine & Marigold Garlands', quantity: '3 Strings', category: 'flowers' },
      { id: 'm10', name: 'Fresh Bilva & Tulasi Leaves', quantity: '1 Bowl', category: 'flowers' },
      { id: 'm11', name: 'Betel Leaves & Betel Nuts', quantity: '21 Pairs', category: 'naivedyam' },
      { id: 'm12', name: 'Assorted Fresh Fruits & Bananas', quantity: '1 Basket', category: 'naivedyam' },
      { id: 'm13', name: 'Jaggery (Bellam) & Rice for Payasam', quantity: '500g', category: 'naivedyam' },
      { id: 'm14', name: 'Brass Pooja Thali & Panchapatra', quantity: '1 Set', category: 'essential' },
      { id: 'm15', name: 'Incense Sticks (Agarbathi) & Dhoop', quantity: '1 Packet', category: 'dravyas' },
    ],
    benefits: [
      {
        title: 'Spiritual Upliftment & Mental Serenity',
        description:
          'Dissolves inner restlessness, builds profound mental discipline, and purifies thoughts through the divine presence of Sri Dharma Sastha.',
      },
      {
        title: 'Mitigation of Shani Dosha',
        description:
          'Lord Ayyappa is the supreme protector from Saturn’s malefic influences. Performing Padi Pooja brings relief from Sade Sati, Ashtama Shani, and planetary afflictions.',
      },
      {
        title: 'Family Harmony & Household Protection',
        description:
          'Brings unity, mutual understanding, and divine protection to the entire household, dispelling negative energies.',
      },
      {
        title: 'Inner Mastery of 18 Virtues',
        description:
          'The sacred 18 steps symbolize crossing beyond the 5 sensory organs, 8 emotional vices (kama, krodha, moha, etc.), and 3 gunas to merge with supreme divine consciousness.',
      },
    ],
    auspiciousDays: 'Mandala Kalam (Nov 15 - Dec 26), Makara Vilakku, Saturdays, and monthly Sankranti.',
  },
  'ganapathi-pooja': {
    id: 'ganapathi-pooja',
    deityId: 'ganesha',
    defaultTitle: 'Ganapathi Pooja',
    regionalTitles: {
      en: 'Ganapathi Pooja',
      te: 'శ్రీ గణపతి పూజ',
      ta: 'ஸ்ரீ கணபதி பூஜை',
      kn: 'ಶ್ರೀ ಗಣಪತಿ ಪೂಜೆ',
      hi: 'श्री गणपति पूजा',
      ml: 'ഗണപതി പൂജ',
    },
    overview: {
      heading: 'Ganapathi Pooja',
      description:
        'The foundational worship of Lord Vigneshwara, remover of all obstacles and granter of intellect and auspicious beginnings.',
      videoDuration: '30 mins • Complete Vidhanam Walkthrough',
    },
    procedure: [
      {
        stepNumber: 1,
        title: 'Deepa Prajwalana & Achamanam',
        duration: '5 Mins',
        description: 'Light the sacred lamps and perform holy Achamanam purifying mind and body.',
        mantra: 'ఓం కేశవాయ స్వాహా | ఓం నారాయణాయ స్వాహా | ఓం మాధవాయ స్వాహా ||',
      },
      {
        stepNumber: 2,
        title: 'Pasupu Ganapathi Sthapana',
        duration: '10 Mins',
        description: 'Form Lord Ganesha with pure turmeric paste upon betel leaves and invoke His divine presence.',
        mantra: 'ఓం గం గణపతయే నమః | ప్రాణప్రతిష్ఠాపయామి ||',
      },
      {
        stepNumber: 3,
        title: 'Shodashopachara Pooja',
        duration: '15 Mins',
        description: 'Offer 16 sacred services including Asana, Padya, Arghya, Snana, Vastram, and Gandham.',
      },
      {
        stepNumber: 4,
        title: 'Durva (Garika) & Red Flower Archana',
        duration: '15 Mins',
        description: 'Perform archana with 21 shoots of fresh green Durva grass and bright red flowers.',
        mantra: 'ఓం సుముఖాయ నమః | ఓం ఏకదంతాయ నమః | ఓం కపిలాయ నమః | ఓం గజకర్ణకాయ నమః ||',
      },
      {
        stepNumber: 5,
        title: 'Modaka Naivedyam & Harathi',
        duration: '10 Mins',
        description: 'Offer 21 steamed modakas, sweet laddus, coconuts, and wave camphor harathi.',
      },
    ],
    materials: [
      { id: 'gm1', name: 'Turmeric Powder (Pure Pasupu)', quantity: '100g', category: 'essential' },
      { id: 'gm2', name: 'Fresh Durva Grass (Garika)', quantity: '21 Shoots', category: 'flowers' },
      { id: 'gm3', name: 'Red Hibiscus / Roses', quantity: '21 Flowers', category: 'flowers' },
      { id: 'gm4', name: 'Fresh Modakas or Laddus', quantity: '21 Nos', category: 'naivedyam' },
      { id: 'gm5', name: 'Coconuts & Betel Leaves', quantity: '2 Coconuts, 5 Leaves', category: 'naivedyam' },
      { id: 'gm6', name: 'Pure Cow Ghee & Deepam', quantity: '250g', category: 'essential' },
      { id: 'gm7', name: 'Camphor & Agarbathis', quantity: '1 Packet', category: 'dravyas' },
    ],
    benefits: [
      {
        title: 'Complete Obstacle Dissolution',
        description: 'Clears roadblocks in education, career, business ventures, and personal undertakings.',
      },
      {
        title: 'Sharp Intellect & Memory',
        description: 'Blesses students and seekers with deep concentration, wisdom, and speech eloquence.',
      },
      {
        title: 'Auspicious Beginning (Shubharambha)',
        description: 'Ensures any new work commenced proceeds smoothly to fruitful completion.',
      },
    ],
    auspiciousDays: 'Vinayaka Chavithi, Sankashti Chaturthi, Shukla Chaturthi, and every Tuesday/Wednesday.',
  },
  'satyanarayana-vratham': {
    id: 'satyanarayana-vratham',
    deityId: 'venkateswara',
    defaultTitle: 'Satyanarayana Vratham',
    regionalTitles: {
      en: 'Satyanarayana Vratham',
      te: 'సత్యనారాయణ స్వామి వ్రతం',
      ta: 'சத்யநாராயண விரதம்',
      kn: 'ಸತ್ಯನಾರಾಯಣ ವ್ರತ',
      hi: 'सत्यनारायण व्रत कथा',
      ml: 'സത്യനാരായണ വ്രതം',
    },
    overview: {
      heading: 'Satyanarayana Vratham',
      description:
        'A sacred Vaishnava ritual from the Skanda Purana performed on Full Moon (Pournami) for family prosperity, joy, and spiritual welfare.',
      videoDuration: '60 mins • Complete Vratham & 5 Chapters Katha',
    },
    procedure: [
      {
        stepNumber: 1,
        title: 'Mandapa Alankaranam & Kalasha Sthapana',
        duration: '15 Mins',
        description: 'Adorn the sacred peetam with navadhanyas, mango leaves, and consecrated Kalash.',
      },
      {
        stepNumber: 2,
        title: 'Ganapathi & Navagraha Pooja',
        duration: '20 Mins',
        description: 'Seek blessings of Lord Vigneshwara and the nine cosmic planetary deities.',
      },
      {
        stepNumber: 3,
        title: 'Sri Satyanarayana Swamy Archana',
        duration: '25 Mins',
        description: 'Perform panchamrita abhishekam and worship Lord Vishnu with tulasi and lotus flowers.',
        mantra: 'ఓం నమో భగవతే వాసుదేవాయ | ఓం శ్రీ సత్యనారాయణ స్వామినే నమః ||',
      },
      {
        stepNumber: 4,
        title: 'Satyanarayana Swamy Katha Shravanam',
        duration: '35 Mins',
        description: 'Recite and listen to the 5 inspiring divine chapters illustrating devotion, truth, and grace.',
      },
      {
        stepNumber: 5,
        title: 'Sapada Prasada Naivedyam & Harathi',
        duration: '15 Mins',
        description: 'Offer sacred Sheera (rava, ghee, milk, bananas, sugar) and perform grand camphor harathi.',
      },
    ],
    materials: [
      { id: 'sm1', name: 'Sacred Kalasha Pot & Coconut', quantity: '1 Set', category: 'essential' },
      { id: 'sm2', name: 'Fresh Mango Leaves & Banana Stems', quantity: '5 Leaves, 2 Stems', category: 'essential' },
      { id: 'sm3', name: 'Semolina (Rava), Ghee & Sugar', quantity: '500g each', category: 'naivedyam' },
      { id: 'sm4', name: 'Ripe Bananas (Amrutha Phala)', quantity: '1 Dozen', category: 'naivedyam' },
      { id: 'sm5', name: 'Fresh Tulasi & Lotus Flowers', quantity: '2 Bunches', category: 'flowers' },
      { id: 'sm6', name: 'Navadhanyas (9 Sacred Grains)', quantity: '1 Packet', category: 'dravyas' },
      { id: 'sm7', name: 'Red Silk Cloth (Vastram)', quantity: '1 Metre', category: 'essential' },
    ],
    benefits: [
      {
        title: 'Domestic Harmony & Prosperity',
        description: 'Blesses family with lasting unity, abundance, and freedom from domestic strife.',
      },
      {
        title: 'Fulfillment of Righteous Desires',
        description: 'Grants success in child-bearing, marriage, new home entering, and noble ambitions.',
      },
      {
        title: 'Karmic Purification & Truthfulness',
        description: 'Removes past sins and inspires living in adherence to truth (Satya).',
      },
    ],
    auspiciousDays: 'Pournami (Full Moon), Ekadashi, Housewarming (Gruhapravesam), and Weddings.',
  },
  'lakshmi-pooja': {
    id: 'lakshmi-pooja',
    deityId: 'devi',
    defaultTitle: 'Lakshmi Pooja',
    regionalTitles: {
      en: 'Lakshmi Pooja',
      te: 'శ్రీ లక్ష్మీ పూజ',
      ta: 'ஸ்ரீ லக்ஷ்மி பூஜை',
      kn: 'ಶ್ರೀ ಲಕ್ಷ್ಮೀ ಪೂಜೆ',
      hi: 'श्री लक्ष्मी पूजा',
      ml: 'ശ്രീ ലക്ഷ്മി പൂജ',
    },
    overview: {
      heading: 'Lakshmi Pooja',
      description:
        'The radiant worship of Goddess Mahalakshmi, the embodiment of wealth, auspiciousness, inner radiance, and joy.',
      videoDuration: '40 mins • Sri Suktam & Ashta Lakshmi Archana',
    },
    procedure: [
      {
        stepNumber: 1,
        title: 'Altar Decoration & Rangoli',
        duration: '15 Mins',
        description: 'Adorn doorstep with mango leaves and floor with sacred lotus rangoli.',
      },
      {
        stepNumber: 2,
        title: 'Varalakshmi Kalasha Sthapana',
        duration: '15 Mins',
        description: 'Consecrate Kalash with holy water, coins, gold ornaments, and silk vastram.',
      },
      {
        stepNumber: 3,
        title: 'Sri Suktam & Ashta Lakshmi Archana',
        duration: '25 Mins',
        description: 'Chant Sri Suktam while performing kumkum archana with red fragrant roses and lotus.',
        mantra: 'ఓం శ్రీం హ్రీం క్లీం కమలే కమలాలయే ప్రసీద ప్రసీద శ్రీం హ్రీం శ్రీం ఓం మహాలక్ష్మ్యై నమః ||',
      },
      {
        stepNumber: 4,
        title: 'Toragranthi Pooja & Sumangali Tamboolam',
        duration: '15 Mins',
        description: 'Tie sacred yellow protective thread and offer fruits, tamboolam, and sweets to ladies.',
      },
    ],
    materials: [
      { id: 'lm1', name: 'Fresh Pink/White Lotus Flowers', quantity: '5 Flowers', category: 'flowers' },
      { id: 'lm2', name: 'Pure Kumkuma for Archana', quantity: '250g', category: 'dravyas' },
      { id: 'lm3', name: 'Gold/Silver Coins for Kalash', quantity: '5 Coins', category: 'essential' },
      { id: 'lm4', name: 'Sweet Payasam & Fruits', quantity: '1 Bowl', category: 'naivedyam' },
      { id: 'lm5', name: 'Turmeric Roots & Yellow Threads', quantity: '1 Set', category: 'dravyas' },
      { id: 'lm6', name: 'Betel Leaves, Nuts & Bangles', quantity: '11 Sets', category: 'naivedyam' },
    ],
    benefits: [
      {
        title: 'Ashta Aishwarya & Financial Abundance',
        description: 'Attracts sustainable wealth, eliminates debts, and stabilizes family finances.',
      },
      {
        title: 'Auspicious Household Energy',
        description: 'Cleanses negative domestic atmospheres and invites graceful auspicious vibrations.',
      },
      {
        title: 'Longevity & Marital Harmony',
        description: 'Strengthens bonds of mutual love, devotion, and protective family blessings.',
      },
    ],
    auspiciousDays: 'Varalakshmi Vratham, Deepavali, Fridays of Shravana & Karthika months, and Dhanteras.',
  },
  'rudrabhishekam': {
    id: 'rudrabhishekam',
    deityId: 'shiva',
    defaultTitle: 'Rudrabhishekam',
    regionalTitles: {
      en: 'Rudrabhishekam',
      te: 'శ్రీ రుద్రాభిషేకం',
      ta: 'ஸ்ரீ ருத்ராபிஷேகம்',
      kn: 'ಶ್ರೀ ರುದ್ರಾಭಿಷೇಕ',
      hi: 'श्री रुद्राभिषेक',
      ml: 'രുദ്രാഭിഷേകം',
    },
    overview: {
      heading: 'Rudrabhishekam',
      description:
        'A supremely potent Vedic ceremony bathing the sacred Shiva Linga with Panchamrita while chanting the holy Sri Rudram from Yajurveda.',
      videoDuration: '50 mins • Namakam & Chamakam Chanting',
    },
    procedure: [
      {
        stepNumber: 1,
        title: 'Sankalpam & Linga Shuddhi',
        duration: '10 Mins',
        description: 'Purify the sacred Shiva Lingam with pure Ganga water and chant Om Namah Shivaya.',
      },
      {
        stepNumber: 2,
        title: 'Panchamrita Abhishekam',
        duration: '25 Mins',
        description:
          'Offer consecutive divine baths: Cow milk, Curd, Pure Ghee, Honey, Sugar, and Tender Coconut water.',
        mantra: 'ఓం త్ర్యంబకం యజామహే సుగంధిం పుష్టివర్ధనమ్ | ఉర్వారుకమివ బంధనాన్మృత్యోర్ముక్షీయ మామృతాత్ ||',
      },
      {
        stepNumber: 3,
        title: 'Sri Rudra Namaka & Chamaka Parayanam',
        duration: '30 Mins',
        description: 'Chant 11 holy Anuvakas of Namakam followed by Chamakam, acknowledging Lord Shiva everywhere.',
      },
      {
        stepNumber: 4,
        title: 'Bhasma & Bilvapatra Archana',
        duration: '15 Mins',
        description: 'Adorn the Shiva Lingam with sacred Vibhuti, Chandanam, and fresh three-leaf Bilva patras.',
        mantra: 'త్రిదళం త్రిగుణాకారం త్రినేత్రం చ త్రియాయుషమ్ | త్రిజన్మ పాపసంహారం ఏకబిల్వం శివార్పణమ్ ||',
      },
      {
        stepNumber: 5,
        title: 'Maha Harathi & Theertha Prasad',
        duration: '10 Mins',
        description: 'Wave triple camphor flame and sip the energized panchamrita theertham.',
      },
    ],
    materials: [
      { id: 'rm1', name: 'Fresh Cow Milk (Raw)', quantity: '1 Litre', category: 'essential' },
      { id: 'rm2', name: 'Fresh Curd & Pure Honey', quantity: '250g each', category: 'essential' },
      { id: 'rm3', name: 'Pure Cow Ghee & Sugar', quantity: '200g each', category: 'essential' },
      { id: 'rm4', name: 'Tender Coconuts', quantity: '2 Nos', category: 'essential' },
      { id: 'rm5', name: 'Fresh Bilva Leaves (Bilvapatra)', quantity: '108 Leaves', category: 'flowers' },
      { id: 'rm6', name: 'Sacred Bhasma (Vibhuti)', quantity: '100g', category: 'dravyas' },
      { id: 'rm7', name: 'Pure Sandalwood Paste & Rose Water', quantity: '1 Bottle', category: 'dravyas' },
    ],
    benefits: [
      {
        title: 'Eradication of Chronic Diseases & Fear',
        description: 'Bestows rejuvenation, longevity (Ayushya), and destroys the fear of premature demise.',
      },
      {
        title: 'Destruction of Past Karmic Sins',
        description: 'The sublime chanting of Sri Rudram burns away accumulated negative karmas of many lifetimes.',
      },
      {
        title: 'Mental Clarity & Liberation (Moksha)',
        description: 'Drives out mental darkness, instilling supreme peace and spiritual detachment.',
      },
    ],
    auspiciousDays: 'Maha Shivaratri, Masa Shivaratri, Mondays (Somavaram), and Pradosham.',
  },
  'hanuman-pooja': {
    id: 'hanuman-pooja',
    deityId: 'hanuman',
    defaultTitle: 'Hanuman Pooja & Sindhooram',
    regionalTitles: {
      en: 'Hanuman Pooja & Sindhooram',
      te: 'శ్రీ హనుమాన్ పూజ & సింధూరార్చన',
      ta: 'ஸ்ரீ ஹனுமான் பூஜை',
      kn: 'ಶ್ರೀ ಹನುಮಾನ್ ಪೂಜೆ',
      hi: 'श्री हनुमान पूजा एवं सिंदूर अर्चन',
      ml: 'ശ്രീ ഹനുമാൻ പൂജ',
    },
    overview: {
      heading: 'Hanuman Pooja & Sindhooram',
      description:
        'Vigorous worship of Sri Hanuman with Sindhoora lepanam, Betel leaves mala, and Hanuman Chalisa recitation for total fearlessness and strength.',
      videoDuration: '35 mins • Sundarakanda & Sindhoora Seva',
    },
    procedure: [
      {
        stepNumber: 1,
        title: 'Deepa Prajvalana & Sankalpam',
        duration: '5 Mins',
        description: 'Light sesame oil lamp with red wicks facing east and take solemn sankalpam for protection.',
      },
      {
        stepNumber: 2,
        title: 'Sindhoora Lepanam & Jasmine Oil',
        duration: '15 Mins',
        description: 'Anoint the holy vigraha with pure Sindhoor blended with Chameli (Jasmine) oil chanting Moola Mantram.',
        mantra: 'ఓం నమో భగవతే ఆంజనేయాయ మహాబలాయ స్వాహా ||',
      },
      {
        stepNumber: 3,
        title: 'Tamalapaku (Betel Leaf) Garland Offering',
        duration: '10 Mins',
        description: 'String 108 fresh betel leaves inscribed with Sri Rama nama and offer with fervent devotion.',
      },
      {
        stepNumber: 4,
        title: 'Hanuman Chalisa & Aarti',
        duration: '15 Mins',
        description: 'Sing 40 verses of Sri Hanuman Chalisa followed by camphor deeparadhana.',
      },
    ],
    materials: [
      { id: 'hp1', name: 'Pure Sindhooram & Chameli Oil', quantity: '100g', category: 'dravyas' },
      { id: 'hp2', name: 'Fresh Betel Leaves (Tamalapaku)', quantity: '108 Leaves', category: 'flowers' },
      { id: 'hp3', name: 'Vada Mala or Boondi Laddu', quantity: '1 Bowl', category: 'naivedyam' },
      { id: 'hp4', name: 'Red Flowers & Red Vastram', quantity: '1 Set', category: 'essential' },
      { id: 'hp5', name: 'Sesame (Til) Oil & Camphor', quantity: '250ml', category: 'essential' },
    ],
    benefits: [
      {
        title: 'Elimination of Fear, Evil Eyes & Graha Doshas',
        description: 'Neutralizes Shani doshas, dispels evil influences, and eradicates phobias and anxieties.',
      },
      {
        title: 'Supreme Physical & Mental Strength',
        description: 'Infuses vitality, determination, speech eloquence, and unwavering self-confidence.',
      },
    ],
    auspiciousDays: 'Tuesdays (Mangalavaram), Saturdays (Sanivaram), and Hanuman Jayanti.',
  },
  'subramanya-pooja': {
    id: 'subramanya-pooja',
    deityId: 'murugan',
    defaultTitle: 'Subramanya Sashti Pooja',
    regionalTitles: {
      en: 'Subramanya Sashti Pooja',
      te: 'శ్రీ సుబ్రహ్మణ్య షష్ఠి పూజ',
      ta: 'ஸ்ரீ சுப்ரமண்ய சஷ்டி பூஜை',
      kn: 'ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಷಷ್ಠಿ ಪೂಜೆ',
      hi: 'श्री सुब्रह्मण्य षष्ठी पूजा',
      ml: 'ശ്രീ സുബ്രഹ്മണ്യ ഷഷ്ഠി പൂജ',
    },
    overview: {
      heading: 'Subramanya Sashti Pooja',
      description:
        'The sacred adoration of Lord Murugan (Kartikeya / Shanmukha) wielding the divine Vel for victory over impediments and health.',
      videoDuration: '40 mins • Skanda Sashti Kavasam & Abhishekam',
    },
    procedure: [
      {
        stepNumber: 1,
        title: 'Sankalpam & Vel Archana',
        duration: '10 Mins',
        description: 'Take sankalpam and offer fragrant red vibhuti and kumkum to the divine Vel (spear).',
      },
      {
        stepNumber: 2,
        title: 'Panchamrita & Rose Water Abhishekam',
        duration: '20 Mins',
        description: 'Perform cooling abhishekam with milk, honey, tender coconut, and rose water.',
        mantra: 'ఓం శరవణభవాయ నమః ||',
      },
      {
        stepNumber: 3,
        title: 'Skanda Sashti Kavasam Recitation',
        duration: '15 Mins',
        description: 'Recite the sacred protective Kavacham invoking Lord Murugan to safeguard every organ and limb.',
      },
    ],
    materials: [
      { id: 'sp1', name: 'Fresh Red Oleander (Arali) Flowers', quantity: '2 Garlands', category: 'flowers' },
      { id: 'sp2', name: 'Panchamritam & Rose Water', quantity: '1 Litre', category: 'essential' },
      { id: 'sp3', name: 'Pure Vibhuti (Sacred Ash)', quantity: '100g', category: 'dravyas' },
      { id: 'sp4', name: 'Sweet Pongal or Panchamirtham Prasadam', quantity: '1 Bowl', category: 'naivedyam' },
    ],
    benefits: [
      {
        title: 'Victory in Endeavours & Settle Debts',
        description: 'Removes Kuja (Mars) doshas, legal hurdles, and blesses with courage and dynamism.',
      },
      {
        title: 'Child Blessing (Santhana Bhagyam) & Radiance',
        description: 'Bestows righteous offspring, vibrant intellect, and glowing health.',
      },
    ],
    auspiciousDays: 'Skanda Sashti, Tuesdays, Krittika Nakshatram, and Thai Poosam.',
  },
};

const UI_TEXTS: Record<string, {
  overview: string;
  procedure: string;
  materials: string;
  benefits: string;
  viewProcedure: string;
  downloadPdf: string;
  save: string;
  saved: string;
  checked: string;
  videoPreview: string;
  videoModalTitle: string;
  close: string;
  downloadStarted: string;
  bookmarkAdded: string;
  bookmarkRemoved: string;
  auspiciousHeader: string;
}> = {
  en: {
    overview: 'Overview',
    procedure: 'Procedure',
    materials: 'Materials',
    benefits: 'Benefits',
    viewProcedure: 'View Procedure (Step by Step)',
    downloadPdf: 'Download PDF',
    save: 'Save',
    saved: 'Saved',
    checked: 'Checked',
    videoPreview: 'Watch Ritual Video',
    videoModalTitle: 'Devotional Ritual Video',
    close: 'Close',
    downloadStarted: 'Sri Pooja Vidhanam PDF downloaded successfully to device.',
    bookmarkAdded: 'Pooja saved to your devotional favorites.',
    bookmarkRemoved: 'Removed from favorites.',
    auspiciousHeader: 'Auspicious Days & Muhurtham',
  },
  te: {
    overview: 'అవలోకనం',
    procedure: 'విధానం',
    materials: 'సామగ్రి',
    benefits: 'ఫలితాలు',
    viewProcedure: 'విధానం చూడండి (స్టెప్ బై స్టెప్)',
    downloadPdf: 'డౌన్‌లోడ్ PDF',
    save: 'సేవ్',
    saved: 'సేవ్ అయింది',
    checked: 'పూర్తయింది',
    videoPreview: 'పూజా వీడియో చూడండి',
    videoModalTitle: 'భక్తి పూజా వీడియో',
    close: 'మూసివేయి',
    downloadStarted: 'పూజా విధానం PDF విజయవంతంగా డౌన్‌లోడ్ చేయబడింది.',
    bookmarkAdded: 'మీ భక్తి సేవ్ జాబితాలో చేర్చబడింది.',
    bookmarkRemoved: 'జాబితా నుండి తొలగించబడింది.',
    auspiciousHeader: 'శుభ సమయాలు & ముహూర్తం',
  },
  ta: {
    overview: 'கண்ணோட்டம்',
    procedure: 'முறை',
    materials: 'பொருட்கள்',
    benefits: 'பலன்கள்',
    viewProcedure: 'பூஜை முறையை பார்க்க (படி வாரியாக)',
    downloadPdf: 'PDF பதிவிறக்கு',
    save: 'சேமிக்க',
    saved: 'சேமிக்கப்பட்டது',
    checked: 'சரிபார்க்கப்பட்டது',
    videoPreview: 'பூஜை வீடியோ பார்க்க',
    videoModalTitle: 'பக்தி பூஜை வீடியோ',
    close: 'மூடுக',
    downloadStarted: 'பூஜை முறை PDF வெற்றிகரமாக பதிவிறக்கப்பட்டது.',
    bookmarkAdded: 'உங்கள் விருப்பப்பட்டியலில் சேமிக்கப்பட்டது.',
    bookmarkRemoved: 'பட்டியலிலிருந்து நீக்கப்பட்டது.',
    auspiciousHeader: 'சுப நாட்கள் & முகூர்த்தம்',
  },
  kn: {
    overview: 'ಅವಲೋಕನ',
    procedure: 'ವಿಧಾನ',
    materials: 'ಸಾಮಗ್ರಿ',
    benefits: 'ಫಲಗಳು',
    viewProcedure: 'ವಿಧಾನ ವೀಕ್ಷಿಸಿ (ಹಂತ ಹಂತವಾಗಿ)',
    downloadPdf: 'PDF ಡೌನ್‌ಲೋಡ್',
    save: 'ಉಳಿಸಿ',
    saved: 'ಉಳಿಸಲಾಗಿದೆ',
    checked: 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
    videoPreview: 'ಪೂಜಾ ವಿಡಿಯೋ ವೀಕ್ಷಿಸಿ',
    videoModalTitle: 'ಭಕ್ತಿ ಪೂಜಾ ವಿಡಿಯೋ',
    close: 'ಮುಚ್ಚಿ',
    downloadStarted: 'ಪೂಜಾ ವಿಧಾನ PDF ಯಶಸ್ವಿಯಾಗಿ ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ.',
    bookmarkAdded: 'ನಿಮ್ಮ ಭಕ್ತಿ ಸಂಗ್ರಹದಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ.',
    bookmarkRemoved: 'ಸಂಗ್ರಹದಿಂದ ತೆಗೆದುಹಾಕಲಾಗಿದೆ.',
    auspiciousHeader: 'ಶುಭ ದಿನಗಳು & ಮುಹೂರ್ತ',
  },
  hi: {
    overview: 'अवलोकन',
    procedure: 'विधान',
    materials: 'सामग्री',
    benefits: 'लाभ',
    viewProcedure: 'विधि देखें (क्रमशः)',
    downloadPdf: 'डाउनलोड PDF',
    save: 'सुरक्षित करें',
    saved: 'सुरक्षित',
    checked: 'जांचा गया',
    videoPreview: 'पूजा वीडियो देखें',
    videoModalTitle: 'भक्ति पूजा वीडियो',
    close: 'बंद करें',
    downloadStarted: 'पूजा विधान PDF सफलतापूर्वक डाउनलोड हो गया।',
    bookmarkAdded: 'आपकी भक्ति सूची में सुरक्षित किया गया।',
    bookmarkRemoved: 'सूची से हटाया गया।',
    auspiciousHeader: 'शुभ दिन एवं मुहूर्त',
  },
  ml: {
    overview: 'അവലോകനം',
    procedure: 'വിധി',
    materials: 'സാമഗ്രികൾ',
    benefits: 'ഗുണങ്ങൾ',
    viewProcedure: 'പൂജാ വിധി കാണുക (ഘട്ടം ഘട്ടമായി)',
    downloadPdf: 'PDF ഡൗൺലോഡ്',
    save: 'സേവ് ചെയ്യുക',
    saved: 'സേവ് ചെയ്തു',
    checked: 'പൂർത്തിയായി',
    videoPreview: 'പൂജ വീഡിയോ കാണുക',
    videoModalTitle: 'ഭക്തി പൂജ വീഡിയോ',
    close: 'അടയ്ക്കുക',
    downloadStarted: 'പൂജാ വിധി PDF വിജയകരമായി ഡൗൺലോഡ് ചെയ്തു.',
    bookmarkAdded: 'പ്രിയപ്പെട്ടവയിൽ സൂക്ഷിച്ചു.',
    bookmarkRemoved: 'നീക്കം ചെയ്തു.',
    auspiciousHeader: 'ശുഭ ദിനങ്ങൾ & മുഹൂർത്തം',
  },
};


// Helper to resolve deity medallion avatar
const getSubItemMedallion = (item: any, defaultDeity: string = 'ayyappa') => {
  if (item?.imageUrl || item?.image) {
    const uri = resolveMediaUrl(item.imageUrl || item.image);
    if (uri) return { uri };
  }
  const deityKey = item?.deityId || defaultDeity || 'ayyappa';
  if (deityKey === 'ayyappa') {
    return require('../../../../assets/deities/lord_ayyappa.png');
  }
  if (DEITY_IMAGES[deityKey]) {
    return DEITY_IMAGES[deityKey];
  }
  return require('../../../../assets/deities/lord_ayyappa.png');
};

export const PoojaDetailScreen: React.FC<Props> = ({
  itemId,
  rawId,
  title,
  currentLanguage,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'procedure' | 'materials'>('procedure');
  const [checkedMaterials, setCheckedMaterials] = useState<Record<string, boolean>>({});
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);

  // Check if Ayyappa Padi Pooja (9 sacred items screen)
  const isAyyappaPadiPooja =
    itemId === 'ayyappa-padi-pooja' ||
    rawId === '117' ||
    itemId === '117' ||
    rawId === '8' ||
    itemId === '8' ||
    rawId === '61' ||
    itemId === '61' ||
    String(itemId).toLowerCase().includes('padi') ||
    (title && (
      title.includes('పడి') ||
      title.toLowerCase().includes('padi') ||
      title.includes('Padi') ||
      title.includes('అయ్యప్ప పూజ') ||
      title.toLowerCase().includes('ayyappa pooja')
    ));

  // Sub-items state for ALL poojas
  const [subItems, setSubItems] = useState<any[]>([]);
  const [selectedSubItem, setSelectedSubItem] = useState<any | null>(null);
  const [subItemDetail, setSubItemDetail] = useState<any | null>(null);
  const [loadingSubItems, setLoadingSubItems] = useState<boolean>(true);
  const [refreshingSubList, setRefreshingSubList] = useState<boolean>(false);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  // Look up detail content or fallback to Ayyappa Padi Pooja
  const poojaContent = POOJA_DETAILS[itemId] || POOJA_DETAILS['ayyappa-padi-pooja'];
  const displayTitle =
    title ||
    poojaContent.regionalTitles[currentLanguage] ||
    poojaContent.defaultTitle;
  const deityImage = DEITY_IMAGES[poojaContent.deityId] || DEITY_IMAGES.ayyappa;
  const ui = UI_TEXTS[currentLanguage] || UI_TEXTS.en;

  // Resolve parent ID for DB querying
  const resolveParentQueryId = useCallback(() => {
    const lowerItemId = String(itemId || '').toLowerCase();
    const lowerTitle = String(title || '').toLowerCase();

    // Lord Ayyappa / Padi Pooja
    if (
      itemId === 'ayyappa-padi-pooja' ||
      rawId === '117' ||
      itemId === '117' ||
      rawId === '8' ||
      itemId === '8' ||
      rawId === '61' ||
      itemId === '61' ||
      lowerItemId.includes('padi') ||
      lowerTitle.includes('పడి') ||
      lowerTitle.includes('padi') ||
      lowerTitle.includes('అయ్యప్ప పూజ') ||
      lowerTitle.includes('ayyappa pooja')
    ) {
      return '8';
    }

    // Satyanarayana Vratham
    if (
      rawId === '25' ||
      itemId === '25' ||
      lowerItemId.includes('satyanarayana') ||
      lowerTitle.includes('satyanarayana') ||
      lowerTitle.includes('సత్యనారాయణ')
    ) {
      return '25';
    }

    // Ganapathi Pooja / Vinayaka
    if (
      rawId === '122' ||
      rawId === '27' ||
      rawId === '6' ||
      lowerItemId.includes('ganapathi') ||
      lowerItemId.includes('vinayaka') ||
      lowerTitle.includes('గణపతి') ||
      lowerTitle.includes('వినాయక')
    ) {
      return rawId === '27' ? '27' : (rawId === '6' ? '6' : '122');
    }

    // Rudrabhishekam / Shiva
    if (
      rawId === '130' ||
      lowerItemId.includes('rudra') ||
      lowerTitle.includes('రుద్ర') ||
      lowerTitle.includes('rudra')
    ) {
      return '130';
    }

    // Varalakshmi Vratham
    if (
      rawId === '26' ||
      lowerItemId.includes('varalakshmi') ||
      lowerTitle.includes('వరలక్ష్మి')
    ) {
      return '26';
    }

    // Subramanya
    if (
      rawId === '137' ||
      rawId === '7' ||
      lowerItemId.includes('subramanya') ||
      lowerTitle.includes('సుబ్రహ్మణ్య')
    ) {
      return rawId || '7';
    }

    return rawId || itemId;
  }, [itemId, rawId, title]);

  // Dynamically load subcategories for ANY clicked pooja from DB in currentLanguage
  const loadSubItems = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshingSubList(true);
    else setLoadingSubItems(true);
    try {
      const parentId = resolveParentQueryId();
      let liveItems = await ApiService.getSubcategories(parentId, currentLanguage);

      if ((!liveItems || liveItems.length === 0) && rawId && rawId !== parentId) {
        liveItems = await ApiService.getSubcategories(rawId, currentLanguage);
      }

      if ((!liveItems || liveItems.length === 0) && parentId === '8') {
        liveItems = await ApiService.getSubcategories('sri-ayyappa-ashtottara', currentLanguage);
      }

      if (Array.isArray(liveItems) && liveItems.length > 0) {
        const sorted = [...liveItems].sort(
          (a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0)
        );
        setSubItems(sorted);
      } else {
        // Fallback for poojas not yet populated in DB:
        if (parentId === '8' || isAyyappaPadiPooja) {
          const localized = AYYAPPA_PADI_POOJA_ITEMS.map((item) => ({
            ...item,
            title: item.regionalTitles?.[currentLanguage] || item.regionalTitles?.te || item.title,
            description: (item as any).regionalDescriptions?.[currentLanguage] || item.description || '',
          }));
          setSubItems(localized);
        } else if (poojaContent && Array.isArray(poojaContent.procedure) && poojaContent.procedure.length > 0) {
          const stepItems = poojaContent.procedure.map((step) => ({
            id: `step-${step.stepNumber}`,
            title: `${step.stepNumber}. ${step.title}`,
            description: step.description,
            mantra: step.mantra,
            duration: step.duration,
            deityId: poojaContent.deityId,
          }));
          setSubItems(stepItems);
        } else {
          setSubItems([]);
        }
      }
    } catch (err) {
      console.warn('Subcategories fetch error:', err);
      if (isAyyappaPadiPooja) {
        const localized = AYYAPPA_PADI_POOJA_ITEMS.map((item) => ({
          ...item,
          title: item.regionalTitles?.[currentLanguage] || item.regionalTitles?.te || item.title,
          description: (item as any).regionalDescriptions?.[currentLanguage] || item.description || '',
        }));
        setSubItems(localized);
      }
    } finally {
      setLoadingSubItems(false);
      setRefreshingSubList(false);
    }
  }, [currentLanguage, isAyyappaPadiPooja, poojaContent, rawId, resolveParentQueryId]);

  useEffect(() => {
    loadSubItems();
  }, [loadSubItems]);

  const handleSelectSubItem = async (subItem: any) => {
    setSelectedSubItem(subItem);
    setLoadingDetail(true);
    setSubItemDetail(null);
    try {
      const detail = await ApiService.getCategoryDetail(String(subItem.id), currentLanguage);
      if (detail && (detail.description || detail.content)) {
        setSubItemDetail(detail);
      }
    } catch (e) {
      console.warn('Sub-item detail load notice:', e);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Resolve localized sub-item title
  const getSubItemTitle = (item: any, index?: number): string => {
    if (!item) return '';
    if (item.title && typeof item.title === 'string' && item.title.trim()) {
      return item.title.trim();
    }
    if (item.regionalTitles) {
      if (item.regionalTitles[currentLanguage]) return item.regionalTitles[currentLanguage];
      if (item.regionalTitles.en) return item.regionalTitles.en;
      if (item.regionalTitles.te) return item.regionalTitles.te;
    }
    return item.name || item.slug || (index !== undefined ? `Item ${index + 1}` : '');
  };

  // Resolve localized sub-item subtitle
  const getSubItemSubtitle = (item: any): string => {
    if (!item) return '';
    if (item.duration) return item.duration;
    if (item.regionalDescriptions?.[currentLanguage]) {
      const raw = item.regionalDescriptions[currentLanguage].replace(/^\[.*?\]\s*/, '').trim();
      return raw.slice(0, 75) + (raw.length > 75 ? '...' : '');
    }
    if (item.description) {
      const raw = item.description.replace(/^\[.*?\]\s*/, '').trim();
      return raw.slice(0, 75) + (raw.length > 75 ? '...' : '');
    }
    return '';
  };

  // Load saved state from AsyncStorage
  useEffect(() => {
    async function loadSavedState() {
      try {
        const savedJson = await AsyncStorage.getItem(`@ayyappa_pooja_saved_${poojaContent.id}`);
        if (savedJson === 'true') {
          setIsSaved(true);
        }
      } catch (e) {
        // ignore
      }
    }
    loadSavedState();
  }, [poojaContent.id]);

  // Handle Hardware Back Button
  useEffect(() => {
    const onHardwareBack = () => {
      if (selectedSubItem) {
        setSelectedSubItem(null);
        return true;
      }
      onBack();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
    return () => sub.remove();
  }, [selectedSubItem, onBack]);

  const handleToggleMaterial = (matId: string) => {
    setCheckedMaterials((prev) => ({
      ...prev,
      [matId]: !prev[matId],
    }));
  };

  const handleToggleSave = async () => {
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    try {
      await AsyncStorage.setItem(
        `@ayyappa_pooja_saved_${poojaContent.id}`,
        nextSaved ? 'true' : 'false'
      );
      Alert.alert(
        nextSaved ? '🙏 Swamiye Saranam Ayyappa' : 'Information',
        nextSaved ? ui.bookmarkAdded : ui.bookmarkRemoved,
        [{ text: 'OK' }]
      );
    } catch (e) {
      // ignore
    }
  };

  const handleDownloadPdf = () => {
    Alert.alert('📥 Download Pooja Vidhanam', ui.downloadStarted, [{ text: 'OK' }]);
  };

  const checkedCount = Object.values(checkedMaterials).filter(Boolean).length;
  const totalMaterials = poojaContent.materials.length;

  // =========================================================================
  // VIEW 2: FULL SACRED READING / PRAYER DETAIL (With Back to Sub-items List)
  // =========================================================================
  if (selectedSubItem) {
    const currentTitle = getSubItemTitle(selectedSubItem);
    const currentDesc =
      subItemDetail?.description ||
      subItemDetail?.content ||
      selectedSubItem.description ||
      selectedSubItem.content ||
      '';
    const subItemMedallion = getSubItemMedallion(selectedSubItem, poojaContent.deityId);

    return (
      <SafeAreaView style={styles.screenContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#173D32" translucent />

        {/* Top Header with Back Arrow to return to sub-items list */}
        <LinearGradient
          colors={['#173D32', '#173D32', '#0C251E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.padiHeaderBar}
        >
          <TouchableOpacity
            style={styles.padiBackBtn}
            onPress={() => setSelectedSubItem(null)}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Back to list"
          >
            <Text style={styles.padiBackArrowText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.padiHeaderTitle} numberOfLines={1}>
            {currentTitle}
          </Text>
          <View style={styles.headerFiligreeWrapper}>
            <HeaderCornerFiligree flipped />
          </View>
        </LinearGradient>

        {/* Serene Deity Watermark Background */}
        <Image
          source={require('../../../../assets/ayyappa_watermark.png')}
          style={styles.watermarkImage}
          resizeMode="contain"
        />

        <ScrollView
          style={styles.subListScrollView}
          contentContainerStyle={styles.detailScrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loadingDetail}
              onRefresh={() => handleSelectSubItem(selectedSubItem)}
              colors={['#173D32', '#DFA62E']}
              tintColor="#173D32"
            />
          }
        >
          <View style={styles.readingCard}>
            {/* Card Header with Medallion */}
            <View style={styles.readingCardHeader}>
              <View style={styles.readingMedallionWrapper}>
                <Image
                  source={subItemMedallion}
                  style={styles.readingMedallionImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.readingTitleContainer}>
                <Text style={styles.readingTitle}>{currentTitle}</Text>
                <Text style={styles.readingSubtitle}>
                  {poojaContent.deityId === 'ayyappa'
                    ? 'ఓం స్వామియే శరణమయ్యప్ప 🙏'
                    : '|| శుభం భూయాత్ ||'}
                </Text>
              </View>
            </View>

            <View style={styles.readingDivider} />

            {/* Devotional Content Text */}
            {loadingDetail ? (
              <View style={styles.readingLoadingBox}>
                <ActivityIndicator size="large" color="#173D32" />
                <Text style={styles.readingLoadingText}>
                  {currentLanguage === 'te'
                    ? 'భక్తి పూర్వక మంత్రములు లోడ్ అవుతున్నాయి...'
                    : 'Loading sacred verses & mantras...'}
                </Text>
              </View>
            ) : (
              <View>
                {selectedSubItem.mantra ? (
                  <View style={styles.mantraBox}>
                    <Text style={styles.mantraText}>{selectedSubItem.mantra}</Text>
                  </View>
                ) : null}
                <Text style={styles.readingBodyText}>{currentDesc}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
  // =========================================================================
  // VIEW 1: SUB-ITEMS LIST VIEW (Soft Cream #FAF5EB, Watermark, Ivory Cards)
  // =========================================================================
  return (
    <SafeAreaView style={styles.screenContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#173D32" translucent />

      {/* Sacred Header Bar */}
      <LinearGradient
        colors={['#173D32', '#173D32', '#0C251E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.padiHeaderBar}
      >
        <TouchableOpacity
          style={styles.padiBackBtn}
          onPress={onBack}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Text style={styles.padiBackArrowText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.padiHeaderTitle} numberOfLines={1}>
          {displayTitle}
        </Text>
        <View style={styles.headerFiligreeWrapper}>
          <HeaderCornerFiligree flipped />
        </View>
      </LinearGradient>

      {/* Serene Deity Watermark Background */}
      <Image
        source={require('../../../../assets/ayyappa_watermark.png')}
        style={styles.watermarkImage}
        resizeMode="contain"
      />

      {/* Top Segmented Tabs: [ Sacred Sub-Items / Vidhanam ] | [ Materials & Info ] */}
      {poojaContent.materials.length > 0 ? (
        <View style={styles.topSegmentedBar}>
          <TouchableOpacity
            style={[
              styles.segmentedTab,
              activeTab === 'procedure'
                ? styles.segmentedTabActive
                : styles.segmentedTabInactive,
            ]}
            onPress={() => setActiveTab('procedure')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentedTabText,
                activeTab === 'procedure'
                  ? styles.segmentedTabTextActive
                  : styles.segmentedTabTextInactive,
              ]}
            >
              {ui.procedure || 'Pooja Vidhanam'} ({subItems.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentedTab,
              activeTab === 'materials'
                ? styles.segmentedTabActive
                : styles.segmentedTabInactive,
            ]}
            onPress={() => setActiveTab('materials')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentedTabText,
                activeTab === 'materials'
                  ? styles.segmentedTabTextActive
                  : styles.segmentedTabTextInactive,
              ]}
            >
              {ui.materials || 'Materials'} ({checkedCount}/{totalMaterials})
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* When activeTab is materials, show materials checklist */}
      {activeTab === 'materials' ? (
        <ScrollView
          style={styles.subListScrollView}
          contentContainerStyle={styles.subListScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.materialsCard}>
            <View style={styles.materialsHeaderRow}>
              <Text style={styles.materialsHeaderTitle}>
                {ui.materials} ({checkedCount}/{totalMaterials} {ui.checked})
              </Text>
              <TouchableOpacity
                style={styles.saveHeaderBtn}
                onPress={handleToggleSave}
                activeOpacity={0.7}
              >
                <HeartFavoriteIcon isSaved={isSaved} />
              </TouchableOpacity>
            </View>

            {poojaContent.materials.map((mat) => {
              const isChecked = !!checkedMaterials[mat.id];
              return (
                <TouchableOpacity
                  key={mat.id}
                  style={styles.materialRow}
                  activeOpacity={0.7}
                  onPress={() => handleToggleMaterial(mat.id)}
                >
                  <View style={[styles.checkbox, isChecked && styles.checkboxActive]}>
                    {isChecked && <CheckMarkIcon />}
                  </View>
                  <Text
                    style={[
                      styles.materialName,
                      isChecked && styles.materialNameChecked,
                    ]}
                  >
                    {mat.name}
                  </Text>
                  <Text style={styles.materialQty}>{mat.quantity}</Text>
                </TouchableOpacity>
              );
            })}

            {/* Auspicious Days Note */}
            {poojaContent.auspiciousDays ? (
              <View style={styles.auspiciousBox}>
                <Text style={styles.auspiciousTitle}>✨ {ui.auspiciousHeader}</Text>
                <Text style={styles.auspiciousBody}>{poojaContent.auspiciousDays}</Text>
              </View>
            ) : null}

            {/* Download PDF Button */}
            <TouchableOpacity
              style={styles.downloadPdfButton}
              onPress={handleDownloadPdf}
              activeOpacity={0.8}
            >
              <DownloadTrayIcon />
              <Text style={styles.downloadPdfText}>{ui.downloadPdf}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        /* Sub-items List View */
        <ScrollView
          style={styles.subListScrollView}
          contentContainerStyle={styles.subListScrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshingSubList}
              onRefresh={() => loadSubItems(true)}
              colors={['#173D32', '#DFA62E']}
              tintColor="#173D32"
            />
          }
        >
          {loadingSubItems && !refreshingSubList ? (
            <View style={styles.subListLoadingBox}>
              <ActivityIndicator size="large" color="#173D32" />
              <Text style={styles.subListLoadingText}>
                {currentLanguage === 'te'
                  ? 'పూజా వివరములు లోడ్ అవుతున్నాయి...'
                  : 'Loading sacred items...'}
              </Text>
            </View>
          ) : subItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {currentLanguage === 'te'
                  ? 'ఈ పూజకు సంబంధించిన వివరాలు సిద్ధమవుతున్నాయి.'
                  : 'Items for this pooja will be available soon.'}
              </Text>
            </View>
          ) : (
            <View style={styles.subListCardsContainer}>
              {subItems.map((item, index) => {
                const itemTitle = getSubItemTitle(item, index);
                const itemSubtitle = getSubItemSubtitle(item);
                const medallion = getSubItemMedallion(item, poojaContent.deityId);

                return (
                  <TouchableOpacity
                    key={String(item.id || index)}
                    style={styles.subItemCard}
                    activeOpacity={0.82}
                    onPress={() => handleSelectSubItem(item)}
                    accessibilityRole="button"
                    accessibilityLabel={itemTitle}
                  >
                    {/* Left: Circular Medallion Avatar with Deity */}
                    <View style={styles.subItemMedallionWrapper}>
                      <Image
                        source={medallion}
                        style={styles.subItemMedallionImage}
                        resizeMode="cover"
                      />
                    </View>

                    {/* Center: Title & Subtitle in Current Language */}
                    <View style={styles.subItemContent}>
                      <Text style={styles.subItemCardTitle} numberOfLines={2}>
                        {itemTitle}
                      </Text>
                      {itemSubtitle ? (
                        <Text style={styles.subItemCardSubtitle} numberOfLines={1}>
                          {itemSubtitle}
                        </Text>
                      ) : null}
                    </View>

                    {/* Right: Solid Play Triangle Icon */}
                    <View style={styles.subItemPlayIconWrapper}>
                      <CardPlayTriangleIcon />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FAF5EB',
    position: 'relative',
  },
  watermarkImage: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.88,
    height: SCREEN_WIDTH * 0.88,
    alignSelf: 'center',
    top: '22%',
    opacity: 0.07,
  },
  padiHeaderBar: {
    height: 54 + ANDROID_STATUS_BAR_HEIGHT,
    paddingTop: ANDROID_STATUS_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1.2,
    borderBottomColor: '#DFA62E',
  },
  padiBackBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    zIndex: 10,
  },
  padiBackArrowText: {
    color: '#FFF8EB',
    fontSize: 24,
    fontWeight: '700',
    marginTop: Platform.OS === 'ios' ? -2 : -4,
  },
  padiHeaderTitle: {
    flex: 1,
    color: '#FFD700',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', default: 'Poppins_700Bold' }),
    letterSpacing: 0.3,
  },
  headerFiligreeWrapper: {
    marginLeft: 8,
  },

  // Segmented Tabs
  topSegmentedBar: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
    gap: 10,
  },
  segmentedTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  segmentedTabActive: {
    backgroundColor: '#173D32',
    borderColor: '#DFA62E',
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  segmentedTabInactive: {
    backgroundColor: '#FFFDF8',
    borderColor: '#E6C898',
  },
  segmentedTabText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  segmentedTabTextActive: {
    color: '#FFFFFF',
  },
  segmentedTabTextInactive: {
    color: '#173D32',
  },

  // Sub-items List
  subListScrollView: {
    flex: 1,
  },
  subListScrollContent: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 40,
  },
  subListCardsContainer: {
    width: '100%',
    gap: 10,
  },
  subItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF8',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#E6C898',
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#071914',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  subItemMedallionWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#DFA62E',
    overflow: 'hidden',
    backgroundColor: '#173D32',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  subItemMedallionImage: {
    width: '100%',
    height: '100%',
  },
  subItemContent: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 6,
  },
  subItemCardTitle: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', default: 'Poppins_700Bold' }),
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0C251E',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  subItemCardSubtitle: {
    fontSize: 12,
    color: '#6B4B3D',
    fontWeight: '500',
    lineHeight: 16,
  },
  subItemPlayIconWrapper: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  subListLoadingBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subListLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#173D32',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14.5,
    color: '#6B4B3D',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Reading Detail Card
  detailScrollContent: {
    padding: 14,
    paddingBottom: 40,
  },
  readingCard: {
    backgroundColor: '#FFFDF8',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.2,
    borderColor: '#E6C898',
    elevation: 3,
    shadowColor: '#071914',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  readingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  readingMedallionWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#DFA62E',
    overflow: 'hidden',
    backgroundColor: '#173D32',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  readingMedallionImage: {
    width: '100%',
    height: '100%',
  },
  readingTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  readingTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#173D32',
    marginBottom: 3,
  },
  readingSubtitle: {
    fontSize: 12.5,
    color: '#8A5A0A',
    fontWeight: '600',
  },
  readingDivider: {
    height: 1.2,
    backgroundColor: '#E6C898',
    marginVertical: 12,
  },
  readingLoadingBox: {
    padding: 30,
    alignItems: 'center',
  },
  readingLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#173D32',
  },
  readingBodyText: {
    fontSize: 15.5,
    lineHeight: 26,
    color: '#2C1D11',
    fontWeight: '500',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  mantraBox: {
    backgroundColor: 'rgba(223, 166, 46, 0.12)',
    borderLeftWidth: 4,
    borderLeftColor: '#DFA62E',
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
  },
  mantraText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#8B4513',
    fontWeight: '700',
  },

  // Materials Tab View
  materialsCard: {
    backgroundColor: '#FFFDF8',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.2,
    borderColor: '#E6C898',
    shadowColor: '#071914',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  materialsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  materialsHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#173D32',
  },
  saveHeaderBtn: {
    padding: 4,
  },
  materialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6D8',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#DFA62E',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFDF8',
  },
  checkboxActive: {
    backgroundColor: '#173D32',
    borderColor: '#173D32',
  },
  materialName: {
    flex: 1,
    fontSize: 14,
    color: '#0C251E',
    fontWeight: '600',
  },
  materialNameChecked: {
    textDecorationLine: 'line-through',
    color: '#9E9E9E',
  },
  materialQty: {
    fontSize: 13,
    color: '#8A5A0A',
    fontWeight: '700',
  },
  auspiciousBox: {
    backgroundColor: 'rgba(223, 166, 46, 0.1)',
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E6C898',
  },
  auspiciousTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#173D32',
    marginBottom: 4,
  },
  auspiciousBody: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#6B4B3D',
  },
  downloadPdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#173D32',
    paddingVertical: 11,
    borderRadius: 20,
    marginTop: 16,
    gap: 8,
  },
  downloadPdfText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
