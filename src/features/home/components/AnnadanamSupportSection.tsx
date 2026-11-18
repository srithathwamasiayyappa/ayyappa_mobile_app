import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SteamingFoodBowlIcon } from './HomeDevotionalIcons';
import { SupportedLanguage } from '../../../types';

interface Props {
  language: SupportedLanguage;
  onOpenDetail?: (id: string, title: string) => void;
}

const ANNADANAM_IMG = require('../../../../assets/home/annadanam_food_seva.png');

const SECTION_TRANSLATIONS: Record<
  SupportedLanguage,
  {
    title: string;
    description: string;
    button: string;
  }
> = {
  en: {
    title: 'Annadanam & Temple Support',
    description:
      "Be a part of Ayyappa's seva — support annadanam, temple maintenance and devotional activities.",
    button: 'Contribute Now  →',
  },
  te: {
    title: 'అన్నదానం & ఆలయ సహాయం',
    description:
      'అయ్యప్ప స్వామి సేవలో భాగం అవ్వండి — అన్నదానం, ఆలయ నిర్వహణ మరియు భక్తి కార్యక్రమాలకు మద్దతు ఇవ్వండి.',
    button: 'ఇప్పుడే సేవ చేయండి  →',
  },
  kn: {
    title: 'ಅನ್ನದಾನ & ದೇವಾಲಯ ಸಹಾಯ',
    description:
      'ಅಯ್ಯಪ್ಪನ ಸೇವೆಯ ಭಾಗವಾಗಿ — ಅನ್ನದಾನ, ದೇವಾಲಯ ನಿರ್ವಹಣೆ ಮತ್ತು ಭಕ್ತಿ ಚಟುವಟಿಕೆಗಳಿಗೆ ಬೆಂಬಲ ನೀಡಿ.',
    button: 'ಈಗಲೇ ಸೇವೆ ಮಾಡಿ  →',
  },
  ta: {
    title: 'அன்னதானம் & ஆலய ஆதரவு',
    description:
      'ஐயப்பனின் சேவையில் பங்கெடுங்கள் — அன்னதானம், ஆலய பராமரிப்பு மற்றும் பக்திப் பணிகளுக்கு உதவுங்கள்.',
    button: 'இப்போதே உதவ  →',
  },
  hi: {
    title: 'अन्नदान एवं मंदिर सेवा',
    description:
      'भगवान अय्यप्पा की सेवा का हिस्सा बनें — अन्नदान, मंदिर रखरखाव और धार्मिक गतिविधियों में सहयोग दें।',
    button: 'अभी सहयोग करें  →',
  },
};

const HORIZONTAL_PADDING = 12;

export const AnnadanamSupportSection: React.FC<Props> = ({
  language,
  onOpenDetail,
}) => {
  const t = SECTION_TRANSLATIONS[language] || SECTION_TRANSLATIONS.en;

  const handlePress = () => {
    onOpenDetail?.('food_donation', 'Annadanam & Temple Support');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFFDF8', '#FFF6E5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Left: Authentic Annadanam Food Seva Image */}
        <Image
          source={ANNADANAM_IMG}
          style={styles.foodImage}
          resizeMode="cover"
        />

        {/* Right: Content & CTA */}
        <View style={styles.contentCol}>
          <View style={styles.titleRow}>
            <SteamingFoodBowlIcon size={18} color="#D4932A" />
            <Text style={styles.titleText} numberOfLines={2}>
              {t.title}
            </Text>
          </View>

          <Text style={styles.descText} numberOfLines={3}>
            {t.description}
          </Text>

          <TouchableOpacity
            style={styles.ctaBtn}
            activeOpacity={0.82}
            onPress={handlePress}
            accessibilityRole="button"
            accessibilityLabel={t.button}
          >
            <LinearGradient
              colors={['#F7C948', '#E6A728', '#D48B1E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.btnGradient}
            >
              <Text style={styles.btnText}>{t.button}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: HORIZONTAL_PADDING,
    marginBottom: 20,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8D2A3',
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#C49B45',
        shadowOffset: { width: 0, height: 1.5 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 1.8,
      },
    }),
  },
  foodImage: {
    width: 118,
    height: 96,
    borderRadius: 11,
    backgroundColor: '#F5EBD7',
  },
  contentCol: {
    flex: 1,
    marginLeft: 8,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  titleText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: '#0D382B',
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
    lineHeight: 15,
  },
  descText: {
    fontSize: 9.5,
    color: '#666055',
    lineHeight: 12.5,
    marginBottom: 6,
    fontFamily: Platform.select({
      ios: 'Poppins-Regular',
      android: 'Poppins_400Regular',
      default: 'System',
    }),
  },
  ctaBtn: {
    alignSelf: 'flex-start',
    borderRadius: 16,
    overflow: 'hidden',
  },
  btnGradient: {
    paddingHorizontal: 13,
    paddingVertical: 5,
    borderRadius: 16,
  },
  btnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0D382B',
    letterSpacing: 0.2,
  },
});
