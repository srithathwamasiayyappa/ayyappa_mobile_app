import React, { useState, useEffect, useMemo } from 'react';
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
import { ApiService } from '../../../services/api';

export interface DevotionalServiceItem {
  id: string;
  key?: string;
  serviceId?: string;
  title: string;
  sub?: string;
  icon?: string;
  artwork?: string;
  displayOrder?: number;
}

interface Props {
  language: SupportedLanguage;
  services?: DevotionalServiceItem[];
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
    stotras: string;
    slokas: string;
    bhajans: string;
    darshan: string;
    festivals: string;
    annadanam: string;
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
    stotras: 'Divine Stotras',
    slokas: 'Daily Slokas',
    bhajans: 'Bhajans & Songs',
    darshan: 'Live Darshan',
    festivals: 'Temple Festivals',
    annadanam: 'Annadanam Seva',
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
    stotras: 'దివ్య స్తోత్రాలు',
    slokas: 'నిత్య శ్లోకాలు',
    bhajans: 'భజనలు & పాటలు',
    darshan: 'ప్రత్యక్ష దర్శనం',
    festivals: 'ఆలయ ఉత్సవాలు',
    annadanam: 'అన్నదాన సేవ',
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
    stotras: 'ದಿವ್ಯ ಸ್ತೋತ್ರಗಳು',
    slokas: 'ನಿತ್ಯ ಶ್ಲೋಕಗಳು',
    bhajans: 'ಭಜನೆಗಳು & ಹಾಡುಗಳು',
    darshan: 'ನೇರ ದರ್ಶನ',
    festivals: 'ದೇವಾಲಯ ಉತ್ಸವಗಳು',
    annadanam: 'ಅನ್ನದಾನ ಸೇವೆ',
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
    stotras: 'திவ்ய ஸ்தோத்திரங்கள்',
    slokas: 'தினசரி ஸ்லோகங்கள்',
    bhajans: 'பஜனைகள் & பாடல்கள்',
    darshan: 'நேரடி தரிசனம்',
    festivals: 'கோயில் திருவிழாக்கள்',
    annadanam: 'அன்னதான சேவை',
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
    stotras: 'दिव्य स्तोत्र',
    slokas: 'दैनिक श्लोक',
    bhajans: 'भजन & गीत',
    darshan: 'लाइव दर्शन',
    festivals: 'मंदिर उत्सव',
    annadanam: 'अन्नदान सेवा',
  },
};

function resolveCardData(
  item: DevotionalServiceItem,
  t: (typeof SHORTCUT_TRANSLATIONS)['en'],
  lang: SupportedLanguage,
  onOpenDetail?: (id: string, title: string) => void,
  onOpenPanchangam?: () => void
) {
  const rawKey = (item.serviceId || item.key || item.id || '').toLowerCase();
  const rawTitle = (item.title || '').toLowerCase();
  const rawIcon = (item.icon || '').toLowerCase();

  let displayTitle = item.title;
  let iconElement = <BrassDiyaIcon size={21} color="#D97706" />;
  let medallionBg = '#FFF3DC';
  let medallionBorder = '#F5C249';
  let pressHandler = () => onOpenDetail?.(item.serviceId || item.id, displayTitle);

  if (rawKey.includes('panchangam') || rawTitle.includes('panchangam') || rawIcon.includes('calendar')) {
    displayTitle = lang !== 'en' && t.panchangam ? t.panchangam : item.title;
    iconElement = <GreenCalendarIcon size={21} color="#2E7D32" />;
    medallionBg = '#EAF7EE';
    medallionBorder = '#81C784';
    pressHandler = () => onOpenPanchangam?.();
  } else if (rawKey.includes('pooja') || rawTitle.includes('pooja') || rawIcon.includes('flame')) {
    displayTitle = lang !== 'en' && t.poojaVidhanam ? t.poojaVidhanam : item.title;
    iconElement = <BrassDiyaIcon size={21} color="#D97706" />;
    medallionBg = '#FFF3DC';
    medallionBorder = '#F5C249';
    pressHandler = () => onOpenDetail?.('pooja-vidhanam', displayTitle);
  } else if (rawKey.includes('temple') || rawTitle.includes('temple') || rawIcon.includes('landmark')) {
    displayTitle = lang !== 'en' && t.temples ? t.temples : item.title;
    iconElement = <GoldenTempleIcon size={21} color="#D4932A" />;
    medallionBg = '#FFF8E7';
    medallionBorder = '#FFD54F';
    pressHandler = () => onOpenDetail?.('temples', displayTitle);
  } else if (rawKey.includes('stotra') || rawTitle.includes('stotra') || rawIcon.includes('bookopen')) {
    displayTitle = lang !== 'en' && t.stotras ? t.stotras : item.title;
    iconElement = <MusicalNotesIcon size={21} color="#7B1FA2" />;
    medallionBg = '#F8EEFC';
    medallionBorder = '#CE93D8';
    pressHandler = () => onOpenDetail?.('stotras', displayTitle);
  } else if (rawKey.includes('sloka') || rawTitle.includes('sloka') || (rawIcon.includes('sparkles') && !rawTitle.includes('festival'))) {
    displayTitle = lang !== 'en' && t.slokas ? t.slokas : item.title;
    iconElement = <MusicalNotesIcon size={21} color="#7B1FA2" />;
    medallionBg = '#F8EEFC';
    medallionBorder = '#CE93D8';
    pressHandler = () => onOpenDetail?.('slokas', displayTitle);
  } else if (rawKey.includes('bhajan') || rawKey.includes('song') || rawTitle.includes('bhajan') || rawIcon.includes('music')) {
    displayTitle = lang !== 'en' && t.slokasBhajans ? t.slokasBhajans : item.title;
    iconElement = <MusicalNotesIcon size={21} color="#7B1FA2" />;
    medallionBg = '#F8EEFC';
    medallionBorder = '#CE93D8';
    pressHandler = () => onOpenDetail?.('bhajans_songs', displayTitle);
  } else if (rawKey.includes('donation') || rawTitle.includes('donation')) {
    displayTitle = lang !== 'en' && t.donations ? t.donations : item.title;
    iconElement = <HeartInHandsIcon size={21} color="#E53935" />;
    medallionBg = '#FFEBEE';
    medallionBorder = '#EF9A9A';
    pressHandler = () => onOpenDetail?.('donations', displayTitle);
  } else if (rawKey.includes('annadanam') || rawTitle.includes('annadanam') || rawIcon.includes('heart')) {
    displayTitle = lang !== 'en' && t.annadanam ? t.annadanam : item.title;
    iconElement = <HeartInHandsIcon size={21} color="#E53935" />;
    medallionBg = '#FFEBEE';
    medallionBorder = '#EF9A9A';
    pressHandler = () => onOpenDetail?.('donations', displayTitle);
  } else if (rawKey.includes('darshan') || rawKey.includes('live') || rawTitle.includes('darshan') || rawIcon.includes('tv')) {
    displayTitle = lang !== 'en' && t.darshan ? t.darshan : item.title;
    iconElement = <PrayingHandsIcon size={21} color="#E65100" />;
    medallionBg = '#FFF3E0';
    medallionBorder = '#FFB74D';
    pressHandler = () => onOpenDetail?.('temples', displayTitle);
  } else if (rawKey.includes('festival') || rawTitle.includes('festival')) {
    displayTitle = lang !== 'en' && t.festivals ? t.festivals : item.title;
    iconElement = <GoldenTempleIcon size={21} color="#D4932A" />;
    medallionBg = '#FFF8E7';
    medallionBorder = '#FFD54F';
    pressHandler = () => onOpenDetail?.('festivals', displayTitle);
  } else if (rawKey.includes('seva') || rawTitle.includes('seva')) {
    displayTitle = lang !== 'en' && t.specialSevas ? t.specialSevas : item.title;
    iconElement = <PrayingHandsIcon size={21} color="#E65100" />;
    medallionBg = '#FFF3E0';
    medallionBorder = '#FFB74D';
    pressHandler = () => onOpenDetail?.('donations', displayTitle);
  }

  return {
    id: item.id || rawKey,
    title: displayTitle,
    icon: iconElement,
    medallionBg,
    medallionBorder,
    onPress: pressHandler,
  };
}

export const DevotionalShortcuts: React.FC<Props> = ({
  language,
  services: propServices,
  onOpenDetail,
  onOpenPanchangam,
  onNavigateToCategories,
}) => {
  const t = SHORTCUT_TRANSLATIONS[language] || SHORTCUT_TRANSLATIONS.en;
  const [dbServices, setDbServices] = useState<DevotionalServiceItem[]>(propServices || []);
  const [loading, setLoading] = useState<boolean>(!propServices || propServices.length === 0);

  // Dynamically fetch services from DB via API response
  useEffect(() => {
    let isMounted = true;
    const fetchServices = async () => {
      try {
        const fetched = await ApiService.getHomeServices(language);
        if (isMounted && Array.isArray(fetched) && fetched.length > 0) {
          setDbServices(fetched);
        }
      } catch (err) {
        console.warn('[DevotionalShortcuts] Dynamic DB fetch notice:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchServices();
    return () => {
      isMounted = false;
    };
  }, [language]);

  // Sync if propServices update from parent
  useEffect(() => {
    if (propServices && propServices.length > 0) {
      setDbServices(propServices);
      setLoading(false);
    }
  }, [propServices]);

  // Display top 6 devotional shortcuts from database in 3x2 grid
  const displayItems = useMemo(() => {
    const list = dbServices.slice(0, 6);
    return list.map((item) => resolveCardData(item, t, language, onOpenDetail, onOpenPanchangam));
  }, [dbServices, t, language, onOpenDetail, onOpenPanchangam]);

  // Group into rows of 2 cards
  const rows = useMemo(() => {
    const r: Array<typeof displayItems> = [];
    for (let i = 0; i < displayItems.length; i += 2) {
      r.push(displayItems.slice(i, i + 2));
    }
    return r;
  }, [displayItems]);

  const renderCard = (item: (typeof displayItems)[0]) => (
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
          <Text style={styles.sectionTitle} numberOfLines={1}>{t.sectionTitle}</Text>
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

      {/* Dynamic Cards Grid fetched from Database API */}
      {rows.map((row, index) => (
        <View key={`row-${index}`} style={[styles.row, index > 0 && { marginTop: 8 }]}>
          {row.map(renderCard)}
        </View>
      ))}
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
    paddingHorizontal: 4,
    paddingVertical: 2,
    flexShrink: 0,
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
