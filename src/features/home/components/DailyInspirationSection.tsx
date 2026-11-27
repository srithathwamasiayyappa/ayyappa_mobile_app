import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  ScriptureBookIcon,
  GreenCircularPlayBtn,
  GreenCircularDocBtn,
} from './HomeDevotionalIcons';
import { SupportedLanguage } from '../../../types';

interface Props {
  language: SupportedLanguage;
  onOpenDetail?: (id: string, title: string) => void;
}

const INSP_IMG_1 = require('../../../../assets/home/insp_harivarasanam.png');
const INSP_IMG_2 = require('../../../../assets/home/insp_pooja_vidhanam.png');
const INSP_IMG_3 = require('../../../../assets/home/insp_saranam_chants.png');

const SECTION_TRANSLATIONS: Record<
  SupportedLanguage,
  {
    title: string;
    subtitle: string;
    viewAll: string;
    harivarasanamTitle: string;
    harivarasanamDesc: string;
    poojaTitle: string;
    poojaDesc: string;
    chantsTitle: string;
    chantsDesc: string;
  }
> = {
  en: {
    title: 'Daily Spiritual Inspiration',
    subtitle: 'Sacred chants, pooja guides and divine wisdom for your daily life.',
    viewAll: 'View All  →',
    harivarasanamTitle: 'Harivarasanam',
    harivarasanamDesc: 'The divine hymn for\nLord Ayyappa',
    poojaTitle: 'Ayyappa\nPooja Vidhanam',
    poojaDesc: 'Step-by-step guide\nfor home pooja',
    chantsTitle: 'Saranam\nAyyappa Chants',
    chantsDesc: 'Powerful chants for\ndevotion & focus',
  },
  te: {
    title: 'నిత్య ఆధ్యాత్మిక ప్రేరణ',
    subtitle: 'నిత్య జీవితానికి పవిత్ర మంత్రాలు, పూజా మార్గదర్శి మరియు దివ్య జ్ఞానం.',
    viewAll: 'అన్నీ చూడండి  →',
    harivarasanamTitle: 'హరివరాసనం',
    harivarasanamDesc: 'అయ్యప్ప స్వామి దివ్య లాలిపాట',
    poojaTitle: 'అయ్యప్ప\nపూజా విధానం',
    poojaDesc: 'ఇంట్లో చేసుకునే నిత్య పూజా మార్గదర్శి',
    chantsTitle: 'శరణం అయ్యప్ప\nకీర్తనలు',
    chantsDesc: 'భక్తి, ఏకాగ్రత కోసం దివ్య నామాలు',
  },
  kn: {
    title: 'ದೈನಂದಿನ ಆಧ್ಯಾತ್ಮಿಕ ಸ್ಫೂರ್ತಿ',
    subtitle: 'ದೈನಂದಿನ ಜೀವನಕ್ಕೆ ಪವಿತ್ರ ಮಂತ್ರಗಳು, ಪೂಜಾ ಮಾರ್ಗದರ್ಶಿ ಮತ್ತು ದೈವಿಕ ಜ್ಞಾನ.',
    viewAll: 'ಎಲ್ಲವನ್ನೂ ನೋಡಿ  →',
    harivarasanamTitle: 'ಹರಿವರಾಸನಂ',
    harivarasanamDesc: 'ಅಯ್ಯಪ್ಪ ಸ್ವಾಮಿ ದಿವ್ಯ ಸ್ತೋತ್ರ',
    poojaTitle: 'ಅಯ್ಯಪ್ಪ\nಪೂಜಾ ವಿಧಾನ',
    poojaDesc: 'ಮನೆಯಲ್ಲಿ ಮಾಡುವ ಪೂಜಾ ಮಾರ್ಗದರ್ಶಿ',
    chantsTitle: 'ಶರಣಂ ಅಯ್ಯಪ್ಪ\nಕೀರ್ತನೆಗಳು',
    chantsDesc: 'ಭಕ್ತಿ, ಏಕಾಗ್ರತೆಗಾಗಿ ದಿವ್ಯ ನಾಮಗಳು',
  },
  ta: {
    title: 'தினசரி ஆன்மீக உத்வேகம்',
    subtitle: 'தினசரி வாழ்விற்கான புனித மந்திரங்கள், பூஜை வழிகாட்டி மற்றும் தெய்வீக ஞானம்.',
    viewAll: 'அனைத்தும்  →',
    harivarasanamTitle: 'ஹரிவராசனம்',
    harivarasanamDesc: 'ஐயப்ப சுவாமியின் திவ்ய பாடல்',
    poojaTitle: 'ஐயப்ப\nபூஜை விதானம்',
    poojaDesc: 'வீட்டில் செய்யும் பூஜை வழிகாட்டி',
    chantsTitle: 'சரணம் ஐயப்ப\nகோஷங்கள்',
    chantsDesc: 'பக்தி மற்றும் அமைதிக்கான பாடல்கள்',
  },
  hi: {
    title: 'दैनिक आध्यात्मिक प्रेरणा',
    subtitle: 'दैनिक जीवन के लिए पवित्र मंत्र, पूजा मार्गदर्शिका और दिव्य ज्ञान।',
    viewAll: 'सभी देखें  →',
    harivarasanamTitle: 'हरिवरासनम्',
    harivarasanamDesc: 'भगवान अय्यप्पा की दिव्य स्तुति',
    poojaTitle: 'अय्यप्पा\nपूजा विधान',
    poojaDesc: 'गृह पूजा के लिए सरल विधि',
    chantsTitle: 'शरणम् अय्यप्पा\nमंत्र',
    chantsDesc: 'भक्ति और एकाग्रता के लिए पावन नाम',
  },
};

const HORIZONTAL_PADDING = 12;

export const DailyInspirationSection: React.FC<Props> = ({
  language,
  onOpenDetail,
}) => {
  const t = SECTION_TRANSLATIONS[language] || SECTION_TRANSLATIONS.en;

  const inspirationItems = [
    {
      id: 'harivarasanam',
      title: t.harivarasanamTitle,
      description: t.harivarasanamDesc,
      image: INSP_IMG_1,
      type: 'audio' as const,
      onPress: () => onOpenDetail?.('bhajans_songs', 'Harivarasanam'),
    },
    {
      id: 'pooja-vidhanam',
      title: t.poojaTitle,
      description: t.poojaDesc,
      image: INSP_IMG_2,
      type: 'doc' as const,
      onPress: () => onOpenDetail?.('pooja-vidhanam', 'Ayyappa Pooja Vidhanam'),
    },
    {
      id: 'saranam-chants',
      title: t.chantsTitle,
      description: t.chantsDesc,
      image: INSP_IMG_3,
      type: 'audio' as const,
      onPress: () => onOpenDetail?.('bhajans_songs', 'Saranam Ayyappa Chants'),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <ScriptureBookIcon size={18} color="#D4932A" />
          <Text style={styles.sectionTitle}>{t.title}</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => onOpenDetail?.('bhajans_songs', 'Daily Spiritual Inspiration')}
        >
          <Text style={styles.viewAllText}>{t.viewAll}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitleText}>{t.subtitle}</Text>

      {/* Horizontal Cards ScrollView */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsRow}
      >
        {inspirationItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            activeOpacity={0.82}
            onPress={item.onPress}
            accessibilityRole="button"
            accessibilityLabel={item.title.replace('\n', ' ')}
          >
            {/* Left Thumbnail */}
            <Image source={item.image} style={styles.thumbnail} resizeMode="cover" />

            {/* Middle Content */}
            <View style={styles.contentCol}>
              <Text style={styles.itemTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.itemDesc} numberOfLines={2}>
                {item.description}
              </Text>
            </View>

            {/* Right Action Button */}
            <View style={styles.actionBtnWrapper}>
              {item.type === 'audio' ? (
                <GreenCircularPlayBtn size={20} />
              ) : (
                <GreenCircularDocBtn size={20} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
    marginBottom: 1,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sectionTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0D382B',
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  viewAllText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0D382B',
  },
  subtitleText: {
    fontSize: 10.5,
    color: '#666055',
    paddingHorizontal: HORIZONTAL_PADDING,
    marginBottom: 8,
    fontFamily: Platform.select({
      ios: 'Poppins-Regular',
      android: 'Poppins_400Regular',
      default: 'System',
    }),
  },
  cardsRow: {
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: 8,
  },
  card: {
    width: 174,
    height: 72,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFE1C7',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    ...Platform.select({
      ios: {
        shadowColor: '#C49B45',
        shadowOffset: { width: 0, height: 1.5 },
        shadowOpacity: 0.1,
        shadowRadius: 2.5,
      },
      android: {
        elevation: 1.8,
      },
    }),
  },
  thumbnail: {
    width: 48,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F5EBD7',
  },
  contentCol: {
    flex: 1,
    marginLeft: 6,
    marginRight: 2,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0D382B',
    lineHeight: 13,
    marginBottom: 2,
  },
  itemDesc: {
    fontSize: 8.5,
    color: '#666055',
    lineHeight: 11,
  },
  actionBtnWrapper: {
    alignSelf: 'flex-end',
    marginBottom: 2,
    marginLeft: 2,
  },
});
