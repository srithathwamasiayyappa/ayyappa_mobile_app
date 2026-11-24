import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BrassDiyaIcon,
  GreenCalendarIcon,
  GoldenTempleIcon,
  MusicalNotesIcon,
  HeartInHandsIcon,
  PrayingHandsIcon,
  DevotionalCategoriesGridIcon,
} from './HomeDevotionalIcons';
import { SupportedLanguage } from '../../../types';

interface Props {
  language: SupportedLanguage;
  onOpenDetail?: (id: string, title: string) => void;
  onOpenPanchangam?: () => void;
  onNavigateToCategories?: () => void;
}

const SHORTCUT_TRANSLATIONS: Record<
  SupportedLanguage,
  {
    sectionTitle: string;
    viewAll: string;
    poojaVidhanam: string;
    panchangam: string;
    temples: string;
    slokasBhajans: string;
    donations: string;
    specialSevas: string;
  }
> = {
  en: {
    sectionTitle: 'Devotional Journey Starts Here',
    viewAll: 'View All  →',
    poojaVidhanam: 'Pooja Vidhanam',
    panchangam: 'Panchangam',
    temples: 'Temples',
    slokasBhajans: 'Slokas & Bhajans',
    donations: 'Donations',
    specialSevas: 'Special Sevas',
  },
  te: {
    sectionTitle: 'భక్తి ప్రయాణం ఇక్కడే ప్రారంభం',
    viewAll: 'అన్నీ చూడండి  →',
    poojaVidhanam: 'పూజా విధానం',
    panchangam: 'పంచాంగం',
    temples: 'ఆలయాలు',
    slokasBhajans: 'శ్లోకాలు & భజనలు',
    donations: 'విరాళాలు',
    specialSevas: 'ప్రత్యేక సేవలు',
  },
  kn: {
    sectionTitle: 'ಭಕ್ತಿ ಪ್ರಯಾಣ ಇಲ್ಲಿಂದ ಪ್ರಾರಂಭ',
    viewAll: 'ಎಲ್ಲವನ್ನೂ ನೋಡಿ  →',
    poojaVidhanam: 'ಪೂಜಾ ವಿಧಾನ',
    panchangam: 'ಪಂಚಾಂಗ',
    temples: 'ದೇವಾಲಯಗಳು',
    slokasBhajans: 'ಶ್ಲೋಕಗಳು & ಭಜನೆಗಳು',
    donations: 'ದೇಣಿಗೆಗಳು',
    specialSevas: 'ವಿಶೇಷ ಸೇವೆಗಳು',
  },
  ta: {
    sectionTitle: 'பக்திப் பயணம் இங்கே தொடங்குகிறது',
    viewAll: 'அனைத்தும்  →',
    poojaVidhanam: 'பூஜை விதானம்',
    panchangam: 'பஞ்சாங்கம்',
    temples: 'கோயில்கள்',
    slokasBhajans: 'ஸ்லோகங்கள் & பஜனைகள்',
    donations: 'நன்கொடைகள்',
    specialSevas: 'சிறப்பு சேவைகள்',
  },
  hi: {
    sectionTitle: 'भक्ति यात्रा यहाँ से शुरू होती है',
    viewAll: 'सभी देखें  →',
    poojaVidhanam: 'पूजा विधान',
    panchangam: 'पंचांग',
    temples: 'मंदिर',
    slokasBhajans: 'श्लोक & भजन',
    donations: 'दान',
    specialSevas: 'विशेष सेवाएं',
  },
};

export const DevotionalShortcuts: React.FC<Props> = ({
  language,
  onOpenDetail,
  onOpenPanchangam,
  onNavigateToCategories,
}) => {
  const t = SHORTCUT_TRANSLATIONS[language] || SHORTCUT_TRANSLATIONS.en;

  // 6 Devotional Shortcuts with distinct sacred theme medallions
  const allShortcuts = [
    {
      id: 'pooja-vidhanam',
      title: t.poojaVidhanam,
      icon: <BrassDiyaIcon size={21} color="#D97706" />,
      medallionBg: '#FFF3DC',
      medallionBorder: '#F5C249',
      onPress: () => onOpenDetail?.('pooja-vidhanam', 'Pooja Vidhanam'),
    },
    {
      id: 'panchangam',
      title: t.panchangam,
      icon: <GreenCalendarIcon size={21} color="#2E7D32" />,
      medallionBg: '#EAF7EE',
      medallionBorder: '#81C784',
      onPress: () => onOpenPanchangam?.(),
    },
    {
      id: 'temples',
      title: t.temples,
      icon: <GoldenTempleIcon size={21} color="#D4932A" />,
      medallionBg: '#FFF8E7',
      medallionBorder: '#FFD54F',
      onPress: () => onOpenDetail?.('temples', 'Temples in India'),
    },
    {
      id: 'bhajans-songs',
      title: t.slokasBhajans,
      icon: <MusicalNotesIcon size={21} color="#7B1FA2" />,
      medallionBg: '#F8EEFC',
      medallionBorder: '#CE93D8',
      onPress: () => onOpenDetail?.('bhajans_songs', 'Slokas & Bhajans'),
    },
    {
      id: 'donations',
      title: t.donations,
      icon: <HeartInHandsIcon size={21} color="#E53935" />,
      medallionBg: '#FFEBEE',
      medallionBorder: '#EF9A9A',
      onPress: () => onOpenDetail?.('donations', 'Donations'),
    },
    {
      id: 'special-sevas',
      title: t.specialSevas,
      icon: <PrayingHandsIcon size={21} color="#E65100" />,
      medallionBg: '#FFF3E0',
      medallionBorder: '#FFB74D',
      onPress: () => onOpenDetail?.('donations', 'Special Sevas'),
    },
  ];

  // Exactly 2 cards in each row (3 rows of 2)
  const row1 = allShortcuts.slice(0, 2);
  const row2 = allShortcuts.slice(2, 4);
  const row3 = allShortcuts.slice(4, 6);

  const renderCard = (item: (typeof allShortcuts)[0]) => (
    <TouchableOpacity
      key={item.id}
      style={styles.cardWrapper}
      activeOpacity={0.82}
      onPress={item.onPress}
      accessibilityRole="button"
      accessibilityLabel={item.title}
    >
      <LinearGradient
        colors={['#FFFFFF', '#FFFDF9', '#FFF8EC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View
          style={[
            styles.medallion,
            { backgroundColor: item.medallionBg, borderColor: item.medallionBorder },
          ]}
        >
          {item.icon}
        </View>
        <View style={styles.labelWrapper}>
          <Text style={styles.label} numberOfLines={2}>
            {item.title}
          </Text>
        </View>
        <View style={styles.arrowContainer}>
          <Text style={styles.cardArrow}>›</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Section Header with View All Categories Action */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onNavigateToCategories}
          style={styles.titleWithIcon}
        >
          <View style={styles.headerIconCircle}>
            <DevotionalCategoriesGridIcon size={14} color="#D4932A" />
          </View>
          <Text style={styles.sectionTitle}>{t.sectionTitle}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onNavigateToCategories}
          style={styles.viewAllPill}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel={t.viewAll}
        >
          <Text style={styles.viewAllText}>{t.viewAll}</Text>
        </TouchableOpacity>
      </View>

      {/* 2 Cards Per Row (3 Rows) */}
      <View style={styles.row}>{row1.map(renderCard)}</View>
      <View style={[styles.row, { marginTop: 8 }]}>{row2.map(renderCard)}</View>
      <View style={[styles.row, { marginTop: 8 }]}>{row3.map(renderCard)}</View>
    </View>
  );
};

const HORIZONTAL_PADDING = 12;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: HORIZONTAL_PADDING,
    marginTop: 8,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flex: 1,
    marginRight: 6,
  },
  headerIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF3DC',
    borderWidth: 1.2,
    borderColor: '#F5C249',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0D382B',
    letterSpacing: 0.1,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  viewAllPill: {
    backgroundColor: '#FFF8E8',
    borderWidth: 1,
    borderColor: '#E6C898',
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0D382B',
  },
  row: {
    flexDirection: 'row',
    gap: 9,
  },
  cardWrapper: {
    flex: 1,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#B68B30',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardGradient: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.4,
    borderColor: '#DFB460',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  medallion: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  labelWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0A271E',
    lineHeight: 16,
    letterSpacing: 0.1,
    fontFamily: Platform.select({
      ios: 'Poppins-SemiBold',
      android: 'Poppins_600SemiBold',
      default: 'System',
    }),
  },
  arrowContainer: {
    width: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  cardArrow: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D4A038',
    opacity: 0.7,
  },
});
