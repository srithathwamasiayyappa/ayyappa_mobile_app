import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
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
    poojaVidhanam: 'Pooja\nVidhanam',
    panchangam: 'Panchangam',
    temples: 'Temples',
    slokasBhajans: 'Slokas /\nBhajans',
    donations: 'Donations',
    specialSevas: 'Special\nSevas',
  },
  te: {
    sectionTitle: 'భక్తి ప్రయాణం ఇక్కడే ప్రారంభం',
    viewAll: 'అన్నీ చూడండి  →',
    poojaVidhanam: 'పూజా\nవిధానం',
    panchangam: 'పంచాంగం',
    temples: 'ఆలయాలు',
    slokasBhajans: 'శ్లోకాలు /\nభజనలు',
    donations: 'విరాళాలు',
    specialSevas: 'ప్రత్యేక\nసేవలు',
  },
  kn: {
    sectionTitle: 'ಭಕ್ತಿ ಪ್ರಯಾಣ ಇಲ್ಲಿಂದ ಪ್ರಾರಂಭ',
    viewAll: 'ಎಲ್ಲವನ್ನೂ ನೋಡಿ  →',
    poojaVidhanam: 'ಪೂಜಾ\nವಿಧಾನ',
    panchangam: 'ಪಂಚಾಂಗ',
    temples: 'ದೇವಾಲಯಗಳು',
    slokasBhajans: 'ಶ್ಲೋಕಗಳು /\nಭಜನೆಗಳು',
    donations: 'ದೇಣಿಗೆಗಳು',
    specialSevas: 'ವಿಶೇಷ\nಸೇವೆಗಳು',
  },
  ta: {
    sectionTitle: 'பக்திப் பயணம் இங்கே தொடங்குகிறது',
    viewAll: 'அனைத்தும்  →',
    poojaVidhanam: 'பூஜை\nவிதானம்',
    panchangam: 'பஞ்சாங்கம்',
    temples: 'கோயில்கள்',
    slokasBhajans: 'ஸ்லோகங்கள் /\nபஜனைகள்',
    donations: 'நன்கொடைகள்',
    specialSevas: 'சிறப்பு\nசேவைகள்',
  },
  hi: {
    sectionTitle: 'भक्ति यात्रा यहाँ से शुरू होती है',
    viewAll: 'सभी देखें  →',
    poojaVidhanam: 'पूजा\nविधान',
    panchangam: 'पंचांग',
    temples: 'मंदिर',
    slokasBhajans: 'श्लोक /\nभजन',
    donations: 'दान',
    specialSevas: 'विशेष\nसेवाएं',
  },
};

export const DevotionalShortcuts: React.FC<Props> = ({
  language,
  onOpenDetail,
  onOpenPanchangam,
  onNavigateToCategories,
}) => {
  const t = SHORTCUT_TRANSLATIONS[language] || SHORTCUT_TRANSLATIONS.en;

  // Exact 3 columns x 2 rows
  const row1 = [
    {
      id: 'pooja-vidhanam',
      title: t.poojaVidhanam,
      icon: <BrassDiyaIcon size={20} color="#C98928" />,
      onPress: () => onOpenDetail?.('pooja-vidhanam', 'Pooja Vidhanam'),
    },
    {
      id: 'panchangam',
      title: t.panchangam,
      icon: <GreenCalendarIcon size={20} color="#2E7D32" />,
      onPress: () => onOpenPanchangam?.(),
    },
    {
      id: 'temples',
      title: t.temples,
      icon: <GoldenTempleIcon size={20} color="#D4932A" />,
      onPress: () => onOpenDetail?.('temples', 'Temples in India'),
    },
  ];

  const row2 = [
    {
      id: 'bhajans-songs',
      title: t.slokasBhajans,
      icon: <MusicalNotesIcon size={20} color="#6F4E37" />,
      onPress: () => onOpenDetail?.('bhajans_songs', 'Slokas & Bhajans'),
    },
    {
      id: 'donations',
      title: t.donations,
      icon: <HeartInHandsIcon size={20} color="#C98928" />,
      onPress: () => onOpenDetail?.('donations', 'Donations'),
    },
    {
      id: 'special-sevas',
      title: t.specialSevas,
      icon: <PrayingHandsIcon size={20} color="#C98928" />,
      onPress: () => onOpenDetail?.('donations', 'Special Sevas'),
    },
  ];

  const renderCard = (item: (typeof row1)[0]) => (
    <TouchableOpacity
      key={item.id}
      style={styles.card}
      activeOpacity={0.78}
      onPress={item.onPress}
      accessibilityRole="button"
      accessibilityLabel={item.title.replace('\n', ' ')}
    >
      <View style={styles.iconWrapper}>{item.icon}</View>
      <View style={styles.labelWrapper}>
        <Text style={styles.label} numberOfLines={2}>
          {item.title}
        </Text>
      </View>
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
          <DevotionalCategoriesGridIcon size={17} color="#D4932A" />
          <Text style={styles.sectionTitle}>{t.sectionTitle}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onNavigateToCategories}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel={t.viewAll}
        >
          <Text style={styles.viewAllText}>{t.viewAll}</Text>
        </TouchableOpacity>
      </View>

      {/* 3x2 Shortcut Grid */}
      <View style={styles.row}>{row1.map(renderCard)}</View>
      <View style={[styles.row, { marginTop: 7 }]}>{row2.map(renderCard)}</View>
    </View>
  );
};

const HORIZONTAL_PADDING = 12;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: HORIZONTAL_PADDING,
    marginTop: 6,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 6,
  },
  sectionTitle: {
    fontSize: 14.2,
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
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  card: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF9',
    borderRadius: 13,
    borderWidth: 1.3,
    borderColor: '#DFA62E',
    paddingHorizontal: 6,
    paddingVertical: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#C49B45',
        shadowOffset: { width: 0, height: 1.5 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  iconWrapper: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  labelWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#133526',
    lineHeight: 13,
    fontFamily: Platform.select({
      ios: 'Poppins-SemiBold',
      android: 'Poppins_600SemiBold',
      default: 'System',
    }),
  },
});
