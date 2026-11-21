import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  GreenCalendarIcon,
  GreenCrescentMoonIcon,
  GreenStarIcon,
  GoldenClockIcon,
  SubtleMountainPeaksArt,
} from './HomeDevotionalIcons';
import { SupportedLanguage, PanchangamData } from '../../../types';

interface Props {
  language: SupportedLanguage;
  panchangam?: PanchangamData | null;
  onOpenPanchangam?: () => void;
}

const PANCHANGAM_TRANSLATIONS: Record<
  SupportedLanguage,
  {
    title: string;
    tithi: string;
    nakshatram: string;
    auspiciousTime: string;
    viewFullBtn: string;
  }
> = {
  en: {
    title: "Today's Panchangam",
    tithi: 'Tithi',
    nakshatram: 'Nakshatram',
    auspiciousTime: 'Auspicious Time',
    viewFullBtn: 'View Full Panchangam →',
  },
  te: {
    title: 'నేటి పంచాంగం',
    tithi: 'తిథి',
    nakshatram: 'నక్షత్రం',
    auspiciousTime: 'శుభ సమయం',
    viewFullBtn: 'పూర్తి పంచాంగం చూడండి →',
  },
  kn: {
    title: 'ಇಂದಿನ ಪಂಚಾಂಗ',
    tithi: 'ತಿಥಿ',
    nakshatram: 'ನಕ್ಷತ್ರ',
    auspiciousTime: 'ಶುಭ ಸಮಯ',
    viewFullBtn: 'ಸಂಪೂರ್ಣ ಪಂಚಾಂಗ ನೋಡಿ →',
  },
  ta: {
    title: 'இன்றைய பஞ்சாங்கம்',
    tithi: 'திதி',
    nakshatram: 'நட்சத்திரம்',
    auspiciousTime: 'சுப நேரம்',
    viewFullBtn: 'முழு பஞ்சாங்கம் பார்க்க →',
  },
  hi: {
    title: 'आज का पंचांग',
    tithi: 'तिथि',
    nakshatram: 'नक्षत्र',
    auspiciousTime: 'शुभ समय',
    viewFullBtn: 'पूरा पंचांग देखें →',
  },
};

export const TodaysPanchangamCard: React.FC<Props> = ({
  language,
  panchangam,
  onOpenPanchangam,
}) => {
  const t = PANCHANGAM_TRANSLATIONS[language] || PANCHANGAM_TRANSLATIONS.en;

  // Real, formatted local date (e.g. Fri, 11 Jan 2025)
  const today = new Date();
  const dateFormatted = today.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Dynamic Tithi, Nakshatram and Auspicious timings
  const tithiValue = panchangam?.tithi || 'Shukla Dwadashi';
  const nakshatraValue = panchangam?.nakshatram || 'Uthram';
  const auspiciousValue = panchangam?.abhijitMuhurtam || '10:24 AM – 11:56 AM';

  return (
    <View style={styles.outerContainer}>
      <LinearGradient
        colors={['#FFFDF9', '#FFF7E8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={styles.cardContainer}
      >
        {/* Subtle Mountain Peaks in Top-Right Corner */}
        <View style={styles.mountainWrapper} pointerEvents="none">
          <SubtleMountainPeaksArt width={84} height={36} />
        </View>

        {/* Header: Title + Date Pill */}
        <View style={styles.headerRow}>
          <Text style={styles.titleText} numberOfLines={1}>
            {t.title}
          </Text>
          <View style={styles.dateBadge}>
            <GreenCalendarIcon size={13} color="#2E7D32" />
            <Text style={styles.dateText}>{dateFormatted}</Text>
          </View>
        </View>

        {/* 3 Metric Cards Row (Always equal 1/3 widths with flex: 1) */}
        <View style={styles.metricsRow}>
          {/* 1. Tithi */}
          <View style={[styles.metricCard, styles.greenMetricBg]}>
            <View style={styles.metricHeader}>
              <GreenCrescentMoonIcon size={14} color="#2E7D32" />
              <Text style={styles.metricLabel} numberOfLines={1}>
                {t.tithi}
              </Text>
            </View>
            <Text style={styles.metricValue} numberOfLines={2}>
              {tithiValue}
            </Text>
          </View>

          {/* 2. Nakshatram */}
          <View style={[styles.metricCard, styles.greenMetricBg]}>
            <View style={styles.metricHeader}>
              <GreenStarIcon size={14} color="#2E7D32" />
              <Text style={styles.metricLabel} numberOfLines={1}>
                {t.nakshatram}
              </Text>
            </View>
            <Text style={styles.metricValue} numberOfLines={2}>
              {nakshatraValue}
            </Text>
          </View>

          {/* 3. Auspicious Time */}
          <View style={[styles.metricCard, styles.goldMetricBg]}>
            <View style={styles.metricHeader}>
              <GoldenClockIcon size={14} color="#C98928" />
              <Text style={[styles.metricLabel, styles.goldMetricLabel]} numberOfLines={1}>
                {t.auspiciousTime}
              </Text>
            </View>
            <Text style={[styles.metricValue, styles.goldMetricValue]} numberOfLines={2}>
              {auspiciousValue}
            </Text>
          </View>
        </View>

        {/* View Full Panchangam Button */}
        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={styles.fullPanchangamBtn}
            activeOpacity={0.85}
            onPress={onOpenPanchangam}
            accessibilityRole="button"
            accessibilityLabel={t.viewFullBtn}
          >
            <LinearGradient
              colors={['#0E4433', '#062E22']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>{t.viewFullBtn}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const HORIZONTAL_PADDING = 12;

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: HORIZONTAL_PADDING,
    marginBottom: 12,
  },
  cardContainer: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8D2A7',
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 11,
    position: 'relative',
    overflow: 'hidden',
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
  mountainWrapper: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    zIndex: 1,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0D382B',
    letterSpacing: 0.2,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF9',
    borderRadius: 12,
    borderWidth: 0.9,
    borderColor: '#DEC6A2',
    paddingHorizontal: 7,
    paddingVertical: 3,
    gap: 4,
  },
  dateText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#3B362F',
    fontFamily: Platform.select({
      ios: 'Poppins-Medium',
      android: 'Poppins_500Medium',
      default: 'System',
    }),
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
    zIndex: 1,
  },
  metricCard: {
    flex: 1,
    borderRadius: 11,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 6,
    minHeight: 48,
    justifyContent: 'center',
  },
  greenMetricBg: {
    backgroundColor: '#EDF7EF',
    borderColor: '#D1E8D6',
  },
  goldMetricBg: {
    backgroundColor: '#FFF5E1',
    borderColor: '#F4DEB2',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#4A6E5E',
  },
  goldMetricLabel: {
    color: '#825E1A',
  },
  metricValue: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0D382B',
    lineHeight: 13,
  },
  goldMetricValue: {
    color: '#4B3406',
  },
  buttonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  fullPanchangamBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 0.9,
    borderColor: '#DCC298',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1.5 },
        shadowOpacity: 0.18,
        shadowRadius: 2,
      },
      android: {
        elevation: 1.8,
      },
    }),
  },
  buttonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
