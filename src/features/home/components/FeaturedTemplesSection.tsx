import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { GoldenTempleIcon, LocationMapPinIcon } from './HomeDevotionalIcons';
import { SupportedLanguage } from '../../../types';
import { ApiService } from '../../../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  language: SupportedLanguage;
  onOpenDetail?: (id: string, title: string) => void;
}

const TEMPLE_IMG_1 = require('../../../../assets/home/temple_sabarimala.png');
const TEMPLE_IMG_2 = require('../../../../assets/home/temple_venkateswara.png');
const TEMPLE_IMG_3 = require('../../../../assets/home/temple_kottarakkara.png');
const DEFAULT_TEMPLE_IMAGES = [TEMPLE_IMG_1, TEMPLE_IMG_2, TEMPLE_IMG_3];

const SECTION_TRANSLATIONS: Record<
  SupportedLanguage,
  {
    title: string;
    subtitle: string;
    viewAll: string;
  }
> = {
  en: {
    title: 'Featured Temples',
    subtitle: 'Discover sacred Ayyappa temples and plan your spiritual visit.',
    viewAll: 'View All  →',
  },
  te: {
    title: 'ప్రసిద్ధ ఆలయాలు',
    subtitle: 'పవిత్ర అయ్యప్ప ఆలయాలను దర్శించండి మరియు ఆధ్యాత్మిక యాత్రను ప్లాన్ చేయండి.',
    viewAll: 'అన్నీ చూడండి  →',
  },
  kn: {
    title: 'ಪ್ರಸಿದ್ಧ ದೇವಾಲಯಗಳು',
    subtitle: 'ಪವಿತ್ರ ಅಯ್ಯಪ್ಪ ದೇವಾಲಯಗಳನ್ನು ಅನ್ವೇಷಿಸಿ ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಭೇಟಿ ಯೋಜಿಸಿ.',
    viewAll: 'ಎಲ್ಲವನ್ನೂ ನೋಡಿ  →',
  },
  ta: {
    title: 'பிரபல திருக்கோயில்கள்',
    subtitle: 'புனித ஐயப்ப ஆலயங்களைக் கண்டறிந்து ஆன்மீகப் பயணத்தைத் திட்டமிடுங்கள்.',
    viewAll: 'அனைத்தும்  →',
  },
  hi: {
    title: 'प्रमुख मंदिर',
    subtitle: 'पवित्र अय्यप्पा मंदिरों के दर्शन करें और अपनी आध्यात्मिक यात्रा की योजना बनाएं।',
    viewAll: 'सभी देखें  →',
  },
};

const HORIZONTAL_PADDING = 12;
const CARD_GAP = 7;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP * 2) / 3;

export const FeaturedTemplesSection: React.FC<Props> = ({
  language,
  onOpenDetail,
}) => {
  const t = SECTION_TRANSLATIONS[language] || SECTION_TRANSLATIONS.en;
  const [activeDot, setActiveDot] = useState(0);
  const [featuredTemples, setFeaturedTemples] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamically fetch temples strictly from DB via API with language support
  const fetchTemples = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getTemples(language);
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.slice(0, 9).map((t, idx) => {
          const loc = t.city && t.state 
            ? `${t.city}, ${t.state}` 
            : t.address || t.city || t.state || 'India';
          return {
            id: t.id,
            name: t.name || (t as any).originalName || 'Ayyappa Temple',
            location: loc,
            thumbnailUrl: t.thumbnailUrl,
            image: DEFAULT_TEMPLE_IMAGES[idx % DEFAULT_TEMPLE_IMAGES.length],
          };
        });
        setFeaturedTemples(mapped);
      } else {
        setFeaturedTemples([]);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load temples from server');
      setFeaturedTemples([]);
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchTemples();
  }, [fetchTemples]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (CARD_WIDTH + CARD_GAP));
    if (index >= 0 && index < featuredTemples.length && index !== activeDot) {
      setActiveDot(index);
    }
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <GoldenTempleIcon size={18} color="#D4932A" />
          <Text style={styles.sectionTitle}>{t.title}</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => onOpenDetail?.('temples', 'Temples in India')}
        >
          <Text style={styles.viewAllText}>{t.viewAll}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitleText}>{t.subtitle}</Text>

      {/* Dynamic Content strictly from Database */}
      {loading ? (
        <View style={styles.stateCard}>
          <ActivityIndicator size="small" color="#DFA62E" />
          <Text style={styles.stateNoticeText}>Loading sacred temples...</Text>
        </View>
      ) : error && featuredTemples.length === 0 ? (
        <View style={styles.stateCard}>
          <Text style={styles.errorNoticeText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            activeOpacity={0.8}
            onPress={fetchTemples}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : featuredTemples.length === 0 ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateNoticeText}>No temples available in database.</Text>
        </View>
      ) : (
        <>
          {/* Compact Temple Cards Row / Carousel */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            decelerationRate="fast"
          >
            {featuredTemples.map((temple, idx) => (
              <TouchableOpacity
                key={`${temple.id}-${idx}`}
                style={styles.card}
                activeOpacity={0.82}
                onPress={() => onOpenDetail?.(`temple:${temple.id}`, temple.name.replace('\n', ' '))}
                accessibilityRole="button"
                accessibilityLabel={temple.name.replace('\n', ' ')}
              >
                {temple.thumbnailUrl ? (
                  <Image
                    source={{ uri: temple.thumbnailUrl }}
                    style={styles.cardImage}
                    resizeMode="cover"
                    defaultSource={temple.image}
                  />
                ) : (
                  <Image source={temple.image} style={styles.cardImage} resizeMode="cover" />
                )}
                <View style={styles.cardContent}>
                  <Text style={styles.templeName} numberOfLines={2}>
                    {temple.name}
                  </Text>
                  <View style={styles.locationRow}>
                    <LocationMapPinIcon size={10} color="#E69500" />
                    <Text style={styles.locationText} numberOfLines={1}>
                      {temple.location}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Small Centered Pagination Dots */}
          {featuredTemples.length > 1 && (
            <View style={styles.dotsRow}>
              {featuredTemples.map((_, idx) => (
                <View
                  key={`dot-${idx}`}
                  style={[styles.dot, activeDot === idx && styles.dotActive]}
                />
              ))}
            </View>
          )}
        </>
      )}
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
  carouselContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: CARD_GAP,
    paddingBottom: 4,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: '#DFA62E',
    ...Platform.select({
      ios: {
        shadowColor: '#B8860B',
        shadowOffset: { width: 0, height: 1.5 },
        shadowOpacity: 0.12,
        shadowRadius: 2.5,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardImage: {
    width: '100%',
    height: 70,
    backgroundColor: '#F5EBD7',
  },
  cardContent: {
    paddingHorizontal: 5,
    paddingVertical: 5,
  },
  templeName: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0D382B',
    lineHeight: 13,
    minHeight: 26,
    marginBottom: 3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  locationText: {
    fontSize: 8.5,
    color: '#666055',
    flex: 1,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 5,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#DECDB5',
  },
  dotActive: {
    backgroundColor: '#D4932A',
    width: 6,
    height: 6,
  },
  stateCard: {
    marginHorizontal: HORIZONTAL_PADDING,
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#FCF7ED',
    borderWidth: 1,
    borderColor: '#E7D7C1',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  stateNoticeText: {
    fontSize: 12,
    color: '#5A4A3A',
    fontFamily: Platform.select({
      ios: 'Poppins-Regular',
      android: 'Poppins_400Regular',
      default: 'System',
    }),
  },
  errorNoticeText: {
    fontSize: 12,
    color: '#B00020',
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'Poppins-Regular',
      android: 'Poppins_400Regular',
      default: 'System',
    }),
  },
  retryButton: {
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#173D32',
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFDF8',
    fontSize: 12,
    fontWeight: '600',
  },
});
