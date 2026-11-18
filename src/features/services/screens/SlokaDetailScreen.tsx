import React, { useState, useEffect, useRef } from 'react';
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
  Share,
  BackHandler,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect, Polygon, Line } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SupportedLanguage } from '../../../types';
import { StorageService } from '../../../services/storageService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  itemId: string;
  title?: string;
  currentLanguage: SupportedLanguage;
  onBack: () => void;
}

// Corner Filigree Ornaments for Header
const HeaderCornerFiligree = ({ flipped = false }: { flipped?: boolean }) => (
  <View style={flipped ? { transform: [{ scaleX: -1 }] } : undefined}>
    <Svg width={36} height={36} viewBox="0 0 36 36" fill="none">
      <Path
        d="M2 2 C12 2 22 8 28 16 C24 18 18 16 12 22 C8 16 6 8 2 2 Z"
        fill="#DFA62E"
        fillOpacity={0.75}
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

// Play Triangle Icon inside circular maroon button
const PlayTriangleIcon = () => (
  <Svg width={18} height={20} viewBox="0 0 18 20" fill="none">
    <Polygon points="3,1 17,10 3,19" fill="#FFFFFF" />
  </Svg>
);

// Pause Icon inside circular maroon button
const PauseIcon = () => (
  <Svg width={16} height={18} viewBox="0 0 16 18" fill="none">
    <Rect x="2" y="1" width="4" height="16" rx="1" fill="#FFFFFF" />
    <Rect x="10" y="1" width="4" height="16" rx="1" fill="#FFFFFF" />
  </Svg>
);

// Share Icon
const ShareIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx="18" cy="5" r="3" stroke="#173D32" strokeWidth={2} />
    <Circle cx="6" cy="12" r="3" stroke="#173D32" strokeWidth={2} />
    <Circle cx="18" cy="19" r="3" stroke="#173D32" strokeWidth={2} />
    <Line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="#173D32" strokeWidth={2} />
    <Line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="#173D32" strokeWidth={2} />
  </Svg>
);

// Bookmark / Save Icon
const BookmarkIcon = ({ isSaved }: { isSaved: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
      stroke="#173D32"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={isSaved ? '#173D32' : 'none'}
    />
  </Svg>
);

// Download Tray & Arrow Icon
const DownloadIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
      stroke="#173D32"
      strokeWidth={2}
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
  krishna: require('../../../../assets/deities/krishna.jpg'),
  rama: require('../../../../assets/deities/rama.jpg'),
};

type SlokaTab = 'sanskrit' | 'telugu' | 'english' | 'meaning';

interface SlokaStanza {
  stanzaNumber: number;
  sanskrit: string;
  telugu: string;
  englishTransliteration: string;
  kannada?: string;
  tamil?: string;
  hindi?: string;
  malayalam?: string;
  meaning: string;
}

interface SlokaRecord {
  id: string;
  deityId: string;
  primaryTitleTelugu: string;
  englishTitle: string;
  sanskritTitle: string;
  audioDurationSeconds: number;
  audioFormattedDuration: string;
  stanzas: SlokaStanza[];
}

// Master Devotional Sloka Content
const MASTER_SLOKAS: Record<string, SlokaRecord> = {
  'shiva-tandava': {
    id: 'shiva-tandava',
    deityId: 'shiva',
    primaryTitleTelugu: 'శివ తాండవ స్తోత్రం',
    englishTitle: 'Shiva Tandava Stotram',
    sanskritTitle: 'शिव ताण्डव स्तोत्रम्',
    audioDurationSeconds: 332,
    audioFormattedDuration: '05:32',
    stanzas: [
      {
        stanzaNumber: 1,
        sanskrit:
          'जटाटवी गलज्जल प्रवाह पावितस्थले\nगलेऽवलम्ब्य लम्बितां भुजङ्ग तुङ्गमालिकाम् ।\nडमड्डमड्डमड्डमन्निनाद वड्डमर्वयं\nचकार चण्डताण्डवं तनोतु नः शिवः शिवम् ॥ १ ॥',
        telugu:
          'జటాటవీగలజ్జలప్రవాహపావితస్థలే\nగలేऽవలంబ్య లంబితాం భుజంగతుంగమాలికామ్ ।\nడమడ్డమడ్డమడ్డమన్నినాదవడ్డమర్వయం\nచకార చండతాండవం తనోతు నః శివః శివమ్ ॥ 1 ॥',
        englishTransliteration:
          'Jataatavee gala-jjala pravaaha-paavita-sthale\nGale-valambya lambitaam bhujanga-tunga-maalikaam |\nDamad-damad-damad-daman-ninaada-vaddamar-vayam\nChakaara chanda-taandavam tanotu nah shivah shivam || 1 ||',
        kannada:
          'ಜಟಾಟವೀ ಗಲಜ್ಜಲ ಪ್ರವಾಹ ಪಾವಿತಸ್ಥಲೇ\nಗಲೇऽವಲಂಬ್ಯ ಲಂಬಿತಾಂ ಭುಜಂಗ ತುಂಗಮಾಲಿಕಾಮ್ ।\nಡಮಡ್ಡಮಡ್ಡಮಡ್ಡಮನ್ನಿನಾದ ವಡ್ಡಮರ್ವಯಂ\nಚಕಾರ ಚಂಡತಾಂಡವಂ ತನೋತು ನಃ ಶಿವಃ ಶಿವಮ್ ॥ 1 ॥',
        tamil:
          'ஜடாடவீ கலஜ்ஜல ப்ரவாஹ பாவிதஸ்தலே\nகலேऽவலம்ப்ய லம்பிதாம் புஜங்க துங்கமாலிகாம் |\nடமட்டமட்டமட்டமந்நிநாத வட்டமர்வயம்\nசகார சண்டதாண்டவம் தநோது ந: சிவ: சிவम् || 1 ||',
        hindi:
          'जटाटवी गलज्जल प्रवाह पावितस्थले\nगलेऽवलम्ब्य लम्बितां भुजङ्ग तुङ्गमालिकाम् ।\nडमड्डमड्डमड्डमन्निनाद वड्डमर्वयं\nचकार चण्डताण्डवं तनोतु नः शिवः शिवम् ॥ १ ॥',
        malayalam:
          'ജടാടവീ ഗലജ്ജല പ്രവാഹ പാവിതസ്ഥലേ\nഗലേऽവലംബ്യ ലംബിതാം ഭുജംഗ തുംഗമാലികാം |\nഡമഡ്ഡമഡ്ഡമഡ്ഡമന്നിനാദ വഡ്ഡമർവയം\nചകാര ചണ്ഡതാണ്ഡവം തനോതു ന: ശിവ: ശിവम् || 1 ||',
        meaning:
          'With His holy neck consecrated by the divine flow of the celestial Ganga dripping from the dense thicket of His matted locks, adorning the lofty serpent like an auspicious garland around His neck, Lord Shiva performs His cosmic, passionate dance (Tandava) to the reverberating rhythm of Damaru: Damad-Damad-Damad-Damad! May that auspicious Lord Shiva shower boundless spiritual grace and peace upon us.',
      },
      {
        stanzaNumber: 2,
        sanskrit:
          'जटाकटाहसंभ्रम भ्रमन्निलिम्पनिर्झरी\nविलोलवीचिवल्लरी विराजमानमूर्धनि ।\nधगद्धगद्धगज्ज्वल ल्ललाटपट्टपावके\nकिशोरचन्द्रशेखरे रतिः प्रतिक्षणं मम ॥ २ ॥',
        telugu:
          'జటాకటాహసంభ్రమభ్రమన్నిలింపనిర్ఝరీ\nవిలోలవీచివల్లరీవిరాజమానమూర్ధని ।\nధగద్ధగద్ధగజ్జ్వలల్లలాటపట్టపావకే\nకిశోరచంద్రశేఖరే రతిః ప్రతిక్షణం మమ ॥ 2 ॥',
        englishTransliteration:
          'Jata-kataaha-sambhrama bhraman-nilimpa-nirjharee\nVilola-veechi-vallaree viraajamaana-moordhani |\nDhagadh-dhagadh-dhagaj-jvalal lalaata-patta-paavake\nKishora-chandra-shekhare ratih pratikshanam mama || 2 ||',
        meaning:
          'May my devotion deepen at every moment for Lord Shiva, upon whose head the celestial heavenly river swirls gracefully across the basin of His matted locks, whose wide forehead blazes with the sacred fire of destruction (Dhagad-Dhagad), and who is adorned by the gentle, radiant crescent moon.',
      },
      {
        stanzaNumber: 3,
        sanskrit:
          'धराधरेन्द्रनन्दिनी विलासबन्धुबन्धुर\nस्फुरद्दिगन्तसन्तति प्रमोदमानमानसे ।\nकृपाकटाक्षधोरणी निरुद्धदुर्धरापदि\nक्वचिद्दिगम्बरे मनो विनोदमेतु वस्तुनि ॥ ३ ॥',
        telugu:
          'ధరాధరేంద్రనందినీవిలాసబంధుబంధుర\nస్ఫురద్దిగంతసంతతిప్రమోదమానమానసే ।\nకృపాకటాక్షధోరణీనిరుద్ధదుర్ధరాపది\nక్వచిద్దిగంబరే మనో వినోదమేతు వస్తుని ॥ 3 ॥',
        englishTransliteration:
          'Dharaa-dharendra-nandinee vilaasa-bandhu-bandhura\nSphurad-diganta-santati pramoda-maana-maanase |\nKripaa-kataaksha-dhoranee niruddha-durdharaapadi\nKvachid-digambare mano vinodam-etu vastuni || 3 ||',
        meaning:
          'May my mind find bliss in the Supreme Cosmic Being, the beloved companion of Parvati (Daughter of the King of Mountains), whose divine mind rejoices in the living cosmos, and whose compassionate glance instantly dissolves all insurmountable adversities!',
      },
    ],
  },
  'ayyappa-gayatri': {
    id: 'ayyappa-gayatri',
    deityId: 'ayyappa',
    primaryTitleTelugu: 'అయ్యప్ప గాయత్రి & మూల మంత్రం',
    englishTitle: 'Ayyappa Gayatri & Moola Mantram',
    sanskritTitle: 'अय्यप्पा गायत्री एवं मूल मन्त्रम्',
    audioDurationSeconds: 255,
    audioFormattedDuration: '04:15',
    stanzas: [
      {
        stanzaNumber: 1,
        sanskrit:
          'ॐ भूतनाथाय विद्महे भवपुत्राय धीमहि ।\nतन्नः शास्ता प्रचोदयात् ॥ १ ॥\n\nॐ ह्रीं श्रीं क्लीं पराशक्तिपुत्राय स्वाहा ॥',
        telugu:
          'ఓం భూతనాథాయ విద్మహే భవపుత్రాయ ధీమహి ।\nతన్నః శాస్తా ప్రచోదయాత్ ॥ 1 ॥\n\nఓం హ్రీం శ్రీం క్లీం పరాశక్తిపుత్రాయ స్వాహా ॥',
        englishTransliteration:
          'Om Bhoothanaathaaya Vidmahe Bhava-putraaya Dheemahi |\nTannah Shaastaa Prachodayaat || 1 ||\n\nOm Hreem Shreem Kleem Paraashakti-putraaya Swaahaa ||',
        meaning:
          'We meditate upon Lord Sastha, the protector of all living beings (Bhoothanatha) and the sacred son of Lord Shiva. May that Lord Dharma Sastha inspire our intellect, purify our mind, and illuminate our spiritual journey. Om, salutations to the supreme child of divine energy!',
      },
      {
        stanzaNumber: 2,
        sanskrit:
          'लोकाध्यक्षाय विद्महे महादेवाय धीमहि ।\nतन्नः हरिहरपुत्रः प्रचोदयात् ॥ २ ॥\n\nॐ श्री धर्माशास्त्रे नमः ॥',
        telugu:
          'లోకాధ్యక్షాయ విద్మహే మహాదేవాయ ధీమహి ।\nతన్నః హరిహరపుత్రః ప్రచోదయాత్ ॥ 2 ॥\n\nఓం శ్రీ ధర్మశాస్త్రే నమః ॥',
        englishTransliteration:
          'Lokaadhyakshaaya Vidmahe Mahaadevaaya Dheemahi |\nTannah Hariharaputrah Prachodayaat || 2 ||\n\nOm Shree Dharmashaastre Namah ||',
        meaning:
          'We meditate upon the sovereign ruler of all realms (Lokaadhyaksha), the great divine deity. May that sacred son of Hari (Vishnu) and Hara (Shiva) illuminate our thoughts and shower righteous wisdom upon us.',
      },
    ],
  },
  'ganesha-pancharatnam': {
    id: 'ganesha-pancharatnam',
    deityId: 'ganesha',
    primaryTitleTelugu: 'శ్రీ గణేశ పంచరత్నం',
    englishTitle: 'Ganesha Pancharatnam',
    sanskritTitle: 'श्री गणेश पञ्चरत्नम्',
    audioDurationSeconds: 370,
    audioFormattedDuration: '06:10',
    stanzas: [
      {
        stanzaNumber: 1,
        sanskrit:
          'मुदाकरात्तमोदकं सदा विमुक्तिसाधकं\nकलाधरावतंसकं विलासलोकक्षकम् ।\nअनाशितैकनायकं विनाशितेभदैत्यकं\nनताशुभाशूनाशकं नमामि तं विनायकम् ॥ १ ॥',
        telugu:
          'ముదాకరాత్తమోదకం సదా విముక్తిసాధకం\nకలాధరావతంసకం విలాసలోకరక్షకమ్ ।\nఅనాశితైకనాయకం వినాశితేభదైత్యకం\nనతాశుభాశునాశకం నమామి తం వినాయకమ్ ॥ 1 ॥',
        englishTransliteration:
          'Mudaa-karaatta modakam sadaa vimukti saadhakam\nKalaadharaavatamsakam vilaasa loka rakshakam |\nAnaashitaika naayakam vinaashitebha daityakam\nNataashubhaashu naashakam namaami tam vinaayakam || 1 ||',
        meaning:
          'I bow to that Lord Vinayaka, who lovingly holds the sweet modaka in His hand, who ever bestows liberation, who wears the crescent moon as a crest ornament, who joyfully protects the worlds, and who swiftly dissolves all obstacles for those who surrender unto Him.',
      },
    ],
  },
  'lingashtakam': {
    id: 'lingashtakam',
    deityId: 'shiva',
    primaryTitleTelugu: 'శ్రీ లింగాష్టకం',
    englishTitle: 'Lingashtakam',
    sanskritTitle: 'श्री लिङ्गाष्टकम्',
    audioDurationSeconds: 345,
    audioFormattedDuration: '05:45',
    stanzas: [
      {
        stanzaNumber: 1,
        sanskrit:
          'ब्रह्ममुरारिसुरार्चितलिङ्गं निर्मलभासितशोभितलिङ्गम् ।\nजन्मजदुःखविनाशकलिङ्गं तत् प्रणमामि सदाशिवलिङ्गम् ॥ १ ॥',
        telugu:
          'బ్రహ్మమురారిసురార్చితలింగం నిర్మలభాసితశోభితలింగమ్ ।\nజన్మజదుఃఖవినాశకలింగం తత్ ప్రణమామి సదాశివలింగమ్ ॥ 1 ॥',
        englishTransliteration:
          'Brahma-muraari-suraarchita-lingam nirmala-bhaasita-shobhita-lingam |\nJanmaja-duhkha-vinaashaka-lingam tat pranamaami sadaashiva-lingam || 1 ||',
        meaning:
          'I bow to that sacred Sadashiva Lingam, worshipped reverently by Brahma, Vishnu and all celestial devas, which radiates flawless purity and dissolves the sorrows of the worldly birth cycle.',
      },
    ],
  },
  'mahishasura-mardini': {
    id: 'mahishasura-mardini',
    deityId: 'devi',
    primaryTitleTelugu: 'మహిషాసుర మర్దిని స్తోత్రం',
    englishTitle: 'Mahishasura Mardini Stotram',
    sanskritTitle: 'महिषासुरमर्दिनीस्तोत्रम्',
    audioDurationSeconds: 500,
    audioFormattedDuration: '08:20',
    stanzas: [
      {
        stanzaNumber: 1,
        sanskrit:
          'अयि गिरिनन्दिनि नन्दितमेदिनि विश्वविनोदिनि नन्दसुते\nगिरिवरविन्ध्यशिरोऽधिनिवासिनि विष्णुविलासिनि जिष्णुनुते ।\nभगवति हे शितिकण्ठकुटुम्बिनि भूरिकुटुम्बिनि भूरिकृते\nजय जय हे महिषासुरमर्दिनि रम्यकपर्दिनि शैलसुते ॥ १ ॥',
        telugu:
          'అయి గిరినందిని నందితమేదిని విశ్వవినోదిని నందసుతే\nగిరివరవింధ్యశిరోऽధినివాసిని విష్ణువిలాసిని జిష్ణునుతే ।\nభగవతి హే శితికంఠకుటుంబిని భూరికుటుంబిని భూరికృతే\nజయ జయ హే మహిషాసురమర్దిని రమ్యకపర్దిని శైలసుతే ॥ 1 ॥',
        englishTransliteration:
          'Ayi giri nandini nandita medini vishva vinodini nanda sute\nGiri vara vindhya shirodhini vaasini vishnu vilaasini jishnu nute |\nBhagavati he shiti kantha kutumbini bhoori kutumbini bhoori krite\nJaya jaya he mahishaasura mardini ramya kapardini shaila sute || 1 ||',
        meaning:
          'Victory to You, O Goddess Mahishasura Mardini! Daughter of the holy mountain, who delights the earth, who dwells on the heights of the Vindhyas, worshipped by Indra and companion of Lord Shiva. Shower Your victorious grace upon us!',
      },
    ],
  },
  'venkateswara-suprabhatam': {
    id: 'venkateswara-suprabhatam',
    deityId: 'venkateswara',
    primaryTitleTelugu: 'శ్రీ వేంకటేశ్వర సుప్రభాతం',
    englishTitle: 'Venkateswara Suprabhatam',
    sanskritTitle: 'श्री वेङ्कटेश्वर सुप्रभातम्',
    audioDurationSeconds: 435,
    audioFormattedDuration: '07:15',
    stanzas: [
      {
        stanzaNumber: 1,
        sanskrit:
          'कौसल्या सुप्रजा राम पूर्वा संध्या प्रवर्तते ।\nउत्तिष्ठ नरशार्दूल कर्तव्यं दैवनिह्निकम् ॥ १ ॥\n\nउत्तिष्ठोत्तिष्ठ गोविन्द उत्तिष्ठ गरुडध्वज ।\nउत्तिष्ठ कमलाकान्त त्रैलोक्यं मङ्गलं कुरु ॥ २ ॥',
        telugu:
          'కౌసల్యా సుప్రజా రామ పూర్వా సంధ్యా ప్రవర్తతే ।\nఉత్తిష్ఠ నరశార్దూల కర్తవ్యం దైవమాహ్నికమ్ ॥ 1 ॥\n\nఉత్తిష్ఠోత్తిష్ఠ గోవింద ఉత్తిష్ఠ గరుడధ్వజ ।\nఉత్తిష్ఠ కమలాకాంత త్రైలోక్యం మంగళం కురు ॥ 2 ॥',
        englishTransliteration:
          'Kausalya suprajaa Rama poorvaa sandhyaa pravartate |\nUttishtha narashaardoola kartavyam daivam aahnikam || 1 ||\n\nUttishthottishtha Govinda uttishtha garudadhwaja |\nUttishtha kamalaakaanta trailokyam mangalam kuru || 2 ||',
        meaning:
          'O Rama, noble son of Kausalya! The auspicious dawn has broken in the east. Awake, O greatest among men, for the morning divine duties are to be performed. Awake, O Govinda! Awake, O Lord with Garuda banner! Awake, beloved of Lakshmi (Kamala), and bestow auspicious blessings upon all three worlds!',
      },
    ],
  },
};

export const SlokaDetailScreen: React.FC<Props> = ({
  itemId,
  title,
  currentLanguage,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<SlokaTab>('sanskrit');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentProgressSeconds, setCurrentProgressSeconds] = useState<number>(0);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);
  const [fontSizeOffset, setFontSizeOffset] = useState<number>(0); // 0 = standard, 2 = larger, 4 = extra large

  // Timer reference for authentic audio playback simulation
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Look up Sloka or fallback to Shiva Tandava Stotram (approved reference)
  const sloka =
    MASTER_SLOKAS[itemId] ||
    MASTER_SLOKAS['shiva-tandava'];

  const isShiva = sloka.deityId === 'shiva';
  const deityImage = DEITY_IMAGES[sloka.deityId] || DEITY_IMAGES.shiva;

  // Header Title
  const headerTitle = 'Sloka';

  // Load Saved Bookmark State & Audio Progress from StorageService on mount
  useEffect(() => {
    async function initStorage() {
      try {
        const saved = await AsyncStorage.getItem(`@ayyappa_sloka_saved_${sloka.id}`);
        if (saved === 'true') {
          setIsSaved(true);
        }
        const prog = await StorageService.getAudioProgress(sloka.id);
        if (prog && prog.elapsed) {
          setCurrentProgressSeconds(Math.min(prog.elapsed, sloka.audioDurationSeconds));
        }
      } catch (e) {
        // ignore
      }
    }
    initStorage();
  }, [sloka.id, sloka.audioDurationSeconds]);

  // Handle Hardware Back Button
  useEffect(() => {
    const onHardwareBack = () => {
      onBack();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
    return () => sub.remove();
  }, [onBack]);

  // Audio Playback Timer Management
  useEffect(() => {
    if (isPlaying) {
      playbackTimerRef.current = setInterval(() => {
        setCurrentProgressSeconds((prev) => {
          if (prev >= sloka.audioDurationSeconds) {
            setIsPlaying(false);
            StorageService.clearAudioProgress(sloka.id);
            return 0;
          }
          const next = prev + 1;
          StorageService.saveAudioProgress(
            sloka.id,
            next,
            next / sloka.audioDurationSeconds
          );
          return next;
        });
      }, 1000);
    } else {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
    }

    return () => {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
    };
  }, [isPlaying, sloka.id, sloka.audioDurationSeconds]);

  // Format MM:SS
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(mins)}:${pad(secs)}`;
  };

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleSeek = (evt: any) => {
    const { locationX } = evt.nativeEvent;
    const seekWidth = Math.max(120, SCREEN_WIDTH * 0.45);
    const ratio = Math.max(0, Math.min(1, locationX / seekWidth));
    const targetSeconds = Math.floor(ratio * sloka.audioDurationSeconds);
    setCurrentProgressSeconds(targetSeconds);
    StorageService.saveAudioProgress(sloka.id, targetSeconds, ratio);
  };

  const handleShare = async () => {
    try {
      const firstStanza = sloka.stanzas[0];
      const message = `${sloka.primaryTitleTelugu} (${sloka.englishTitle})\n\n${firstStanza.sanskrit}\n\nMeaning:\n${firstStanza.meaning}\n\n🙏 Swamiye Saranam Ayyappa! Download Saranam Ayyappa Mobile App for full slokas, panchangam, and daily audio.`;
      await Share.share({
        title: sloka.englishTitle,
        message,
      });
    } catch (e) {
      // ignore
    }
  };

  const handleToggleSave = async () => {
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    try {
      await AsyncStorage.setItem(
        `@ayyappa_sloka_saved_${sloka.id}`,
        nextSaved ? 'true' : 'false'
      );
      Alert.alert(
        nextSaved ? '🙏 Swamiye Saranam Ayyappa' : 'Information',
        nextSaved
          ? `${sloka.englishTitle} has been saved to your devotional favorites.`
          : `${sloka.englishTitle} removed from favorites.`,
        [{ text: 'OK' }]
      );
    } catch (e) {
      // ignore
    }
  };

  const handleOpenDownload = () => {
    setIsDownloadModalOpen(true);
  };

  const handlePerformDownload = (type: 'audio' | 'pdf' | 'text') => {
    setIsDownloadModalOpen(false);
    StorageService.markAudioDownloaded(sloka.id);
    const typeLabel =
      type === 'audio'
        ? 'High Quality Audio Chanting (MP3)'
        : type === 'pdf'
        ? 'Complete Sacred Text & Meaning (PDF)'
        : 'Offline Devotional Text';

    Alert.alert(
      '📥 Download Successful',
      `"${sloka.englishTitle}" ${typeLabel} has been saved to your device for offline reading and listening.`,
      [{ text: 'OK' }]
    );
  };

  const progressRatio =
    sloka.audioDurationSeconds > 0
      ? currentProgressSeconds / sloka.audioDurationSeconds
      : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#173D32" />

      {/* =========================================================================
          HEADER: Deep Maroon Gradient + Golden Corners + Back Arrow + "Sloka" Title
         ========================================================================= */}
      <LinearGradient
        colors={['#0C251E', '#173D32', '#173D32']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={onBack}
          activeOpacity={0.8}
          accessibilityLabel="Back to Slokas"
        >
          <BackArrowIcon />
        </TouchableOpacity>

        {/* Center Title */}
        <Text style={styles.headerTitle}>{headerTitle}</Text>

        {/* Top-Right Decorative Corner / Spacer */}
        <View style={styles.headerRightOrnament}>
          <HeaderCornerFiligree flipped />
        </View>

        {/* Top-Left Filigree */}
        <View style={styles.filigreeTopLeft}>
          <HeaderCornerFiligree />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* =========================================================================
            DEITY HERO IMAGE: Centered with Atmospheric Light & Trishul
           ========================================================================= */}
        <View style={styles.heroContainer}>
          <Image
            source={isShiva ? require('../../../../assets/sloka_detail_ref.png') : deityImage}
            style={isShiva ? styles.heroImageShiva : styles.heroImageOther}
            resizeMode="cover"
          />

          {/* Soft Bottom Gradient Fade into Ivory Card */}
          <LinearGradient
            colors={['transparent', 'rgba(255, 248, 235, 0.35)', '#FFF8EB']}
            style={styles.heroGradientOverlay}
          />
        </View>

        {/* =========================================================================
            MAIN CARD: Rounded Cream Container with Golden Outline
           ========================================================================= */}
        <View style={styles.mainCard}>
          {/* 4 Content / Language Tabs: Sanskrit | Telugu | English | Meaning */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabPill, activeTab === 'sanskrit' && styles.tabPillActive]}
              onPress={() => setActiveTab('sanskrit')}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.tabPillText, activeTab === 'sanskrit' && styles.tabPillTextActive]}
              >
                Sanskrit
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabPill, activeTab === 'telugu' && styles.tabPillActive]}
              onPress={() => setActiveTab('telugu')}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.tabPillText, activeTab === 'telugu' && styles.tabPillTextActive]}
              >
                Telugu
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabPill, activeTab === 'english' && styles.tabPillActive]}
              onPress={() => setActiveTab('english')}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.tabPillText, activeTab === 'english' && styles.tabPillTextActive]}
              >
                English
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabPill, activeTab === 'meaning' && styles.tabPillActive]}
              onPress={() => setActiveTab('meaning')}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.tabPillText, activeTab === 'meaning' && styles.tabPillTextActive]}
              >
                Meaning
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sloka Titles */}
          <View style={styles.titleSection}>
            <Text style={styles.slokaPrimaryTitle}>
              {activeTab === 'sanskrit'
                ? sloka.sanskritTitle
                : sloka.primaryTitleTelugu}
            </Text>
            <Text style={styles.slokaEnglishTitle}>{sloka.englishTitle}</Text>
          </View>

          {/* =========================================================================
              SACRED VERSES / CONTENT DISPLAY
             ========================================================================= */}
          <View style={styles.versesSection}>
            {sloka.stanzas.map((stanza) => {
              let displayText = stanza.sanskrit;
              if (activeTab === 'telugu') {
                displayText = stanza.telugu;
              } else if (activeTab === 'english') {
                displayText = stanza.englishTransliteration;
              } else if (activeTab === 'meaning') {
                displayText = stanza.meaning;
              }

              return (
                <View key={stanza.stanzaNumber} style={styles.stanzaContainer}>
                  {activeTab === 'meaning' && (
                    <Text style={styles.verseNumberBadge}>
                      Verse {stanza.stanzaNumber} Explanation:
                    </Text>
                  )}
                  <Text
                    style={[
                      styles.verseText,
                      activeTab === 'meaning' && styles.meaningText,
                      { fontSize: 16.5 + fontSizeOffset },
                    ]}
                  >
                    {displayText}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* =========================================================================
              AUDIO PLAYER CARD: Maroon Play Button + Golden Seek Bar + Duration
             ========================================================================= */}
          <View style={styles.audioPlayerCard}>
            {/* Play/Pause Button */}
            <TouchableOpacity
              style={styles.playButton}
              onPress={handleTogglePlay}
              activeOpacity={0.85}
              accessibilityLabel={isPlaying ? 'Pause Audio' : 'Play Audio'}
            >
              {isPlaying ? <PauseIcon /> : <PlayTriangleIcon />}
            </TouchableOpacity>

            {/* Seek Track Bar */}
            <TouchableOpacity
              style={styles.seekContainer}
              activeOpacity={1}
              onPress={handleSeek}
            >
              <View style={styles.seekTrack}>
                <View
                  style={[styles.seekProgress, { width: `${progressRatio * 100}%` }]}
                />
              </View>
              {/* Thumb Knob */}
              <View
                style={[
                  styles.seekThumb,
                  { left: `${Math.max(0, Math.min(94, progressRatio * 94))}%` },
                ]}
              />
            </TouchableOpacity>

            {/* Duration Display: 00:00 / 05:32 */}
            <View style={styles.durationContainer}>
              <Text style={styles.durationText}>
                {formatTime(currentProgressSeconds)} / {sloka.audioFormattedDuration}
              </Text>
            </View>
          </View>

          {/* =========================================================================
              BOTTOM ACTION BUTTONS: Share | Save | Download
             ========================================================================= */}
          <View style={styles.bottomActionsRow}>
            {/* 1. Share */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleShare}
              activeOpacity={0.75}
            >
              <ShareIcon />
              <Text style={styles.actionLabel}>Share</Text>
            </TouchableOpacity>

            {/* 2. Save */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleToggleSave}
              activeOpacity={0.75}
            >
              <BookmarkIcon isSaved={isSaved} />
              <Text
                style={[
                  styles.actionLabel,
                  isSaved && styles.actionLabelSaved,
                ]}
              >
                {isSaved ? 'Saved' : 'Save'}
              </Text>
            </TouchableOpacity>

            {/* 3. Download */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleOpenDownload}
              activeOpacity={0.75}
            >
              <DownloadIcon />
              <Text style={styles.actionLabel}>Download</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* =========================================================================
          DOWNLOAD OPTIONS MODAL
         ========================================================================= */}
      <Modal
        visible={isDownloadModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsDownloadModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Download Sacred Sloka</Text>
              <TouchableOpacity
                onPress={() => setIsDownloadModalOpen(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>{sloka.englishTitle}</Text>

            {/* Option 1: Audio MP3 */}
            <TouchableOpacity
              style={styles.downloadOption}
              onPress={() => handlePerformDownload('audio')}
              activeOpacity={0.8}
            >
              <View style={styles.downloadOptionIcon}>
                <Text style={styles.optionEmoji}>🎧</Text>
              </View>
              <View style={styles.downloadOptionText}>
                <Text style={styles.downloadOptionTitle}>Chanting Audio (MP3)</Text>
                <Text style={styles.downloadOptionDesc}>
                  Authentic studio recitation for offline devotion ({sloka.audioFormattedDuration})
                </Text>
              </View>
            </TouchableOpacity>

            {/* Option 2: PDF Document */}
            <TouchableOpacity
              style={styles.downloadOption}
              onPress={() => handlePerformDownload('pdf')}
              activeOpacity={0.8}
            >
              <View style={styles.downloadOptionIcon}>
                <Text style={styles.optionEmoji}>📜</Text>
              </View>
              <View style={styles.downloadOptionText}>
                <Text style={styles.downloadOptionTitle}>Sloka & Meaning (PDF)</Text>
                <Text style={styles.downloadOptionDesc}>
                  Printable devotional sheet in Devanagari, Telugu & English
                </Text>
              </View>
            </TouchableOpacity>

            {/* Option 3: Offline Sacred Text */}
            <TouchableOpacity
              style={styles.downloadOption}
              onPress={() => handlePerformDownload('text')}
              activeOpacity={0.8}
            >
              <View style={styles.downloadOptionIcon}>
                <Text style={styles.optionEmoji}>📱</Text>
              </View>
              <View style={styles.downloadOptionText}>
                <Text style={styles.downloadOptionTitle}>Offline Reading Text</Text>
                <Text style={styles.downloadOptionDesc}>
                  Cached in local app storage for reading without internet
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setIsDownloadModalOpen(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#173D32',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFF8EB',
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Header styles
  header: {
    height: Platform.OS === 'ios' ? 88 : (StatusBar.currentHeight || 20) + 52,
    paddingTop: Platform.OS === 'ios' ? 36 : StatusBar.currentHeight || 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    position: 'relative',
    zIndex: 10,
  },
  headerBackButton: {
    position: 'absolute',
    left: 16,
    top: Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight || 18) + 12,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 12,
  },
  headerTitle: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFDF8',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  headerRightOrnament: {
    position: 'absolute',
    right: 6,
    top: 4,
  },
  filigreeTopLeft: {
    position: 'absolute',
    left: 6,
    top: 4,
  },

  // Deity Hero Image
  heroContainer: {
    width: '100%',
    height: 165,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#0C251E',
  },
  heroImageShiva: {
    width: '100%',
    height: 350,
    position: 'absolute',
    top: -40,
  },
  heroImageOther: {
    width: '100%',
    height: '100%',
  },
  heroGradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 50,
  },

  // Main Card Container
  mainCard: {
    backgroundColor: '#FFF8EB',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    paddingTop: 16,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: '#E6C687',
    minHeight: 520,
  },

  // 4 Tabs: Sanskrit | Telugu | English | Meaning
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tabPill: {
    flex: 1,
    paddingVertical: 7,
    marginHorizontal: 3,
    borderRadius: 20,
    backgroundColor: '#FFF8EB',
    borderWidth: 1,
    borderColor: '#DFA62E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabPillActive: {
    backgroundColor: '#173D32',
    borderColor: '#173D32',
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#345147',
  },
  tabPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Sloka Title Section
  titleSection: {
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  slokaPrimaryTitle: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 21,
    fontWeight: '700',
    color: '#173D32',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  slokaEnglishTitle: {
    fontSize: 15.5,
    fontWeight: '600',
    color: '#173D32',
    textAlign: 'center',
  },

  // Sacred Verses Section
  versesSection: {
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  stanzaContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  verseNumberBadge: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#173D32',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  verseText: {
    color: '#0C251E',
    lineHeight: 28,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  meaningText: {
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 22,
    textAlign: 'center',
    color: '#345147',
    paddingHorizontal: 8,
  },

  // Audio Player Card
  audioPlayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E4',
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: '#E4BD70',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#173D32',
    borderWidth: 1.8,
    borderColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  seekContainer: {
    flex: 1,
    height: 30,
    justifyContent: 'center',
    position: 'relative',
    marginRight: 8,
  },
  seekTrack: {
    height: 4.5,
    borderRadius: 2.5,
    backgroundColor: '#E5D0A6',
    overflow: 'hidden',
  },
  seekProgress: {
    height: '100%',
    backgroundColor: '#173D32',
    borderRadius: 2.5,
  },
  seekThumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#173D32',
    borderWidth: 1.5,
    borderColor: '#FFD700',
    top: 8,
  },
  durationContainer: {
    minWidth: 84,
    alignItems: 'flex-end',
  },
  durationText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0C251E',
  },

  // Bottom Action Buttons
  bottomActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#EED9B3',
    marginTop: 4,
  },
  actionItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  actionLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#173D32',
    marginTop: 5,
  },
  actionLabelSaved: {
    fontWeight: '700',
  },

  // Download Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFDF8',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 18,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#173D32',
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0E6D2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#173D32',
  },
  modalSubtitle: {
    fontSize: 13.5,
    color: '#6E553F',
    marginBottom: 16,
  },
  downloadOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBF2',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8CA94',
    padding: 12,
    marginBottom: 10,
  },
  downloadOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5DE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionEmoji: {
    fontSize: 20,
  },
  downloadOptionText: {
    flex: 1,
  },
  downloadOptionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#173D32',
    marginBottom: 2,
  },
  downloadOptionDesc: {
    fontSize: 12,
    color: '#345147',
    lineHeight: 16,
  },
  modalCancelButton: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F3EFE6',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#173D32',
  },
});

