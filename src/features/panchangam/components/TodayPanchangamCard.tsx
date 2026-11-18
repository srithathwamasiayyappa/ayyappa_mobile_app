import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { PanchangamData, SupportedLanguage } from '../../../types';

interface Props {
  data: PanchangamData;
  currentLanguage: SupportedLanguage;
  onPress: () => void;
}

const LABELS = {
  te: {
    headerTitle: 'నేటి పంచాంగం',
    tithi: 'తిథి',
    ends: 'ముగింపు',
    nakshatram: 'నక్షత్రం',
    rahuKalam: 'రాహుకాలం',
    sunrise: 'సూర్యోదయం',
    sunset: 'సూర్యాస్తమయం',
    viewFull: 'పూర్తి పంచాంగం చూడండి',
  },
  kn: {
    headerTitle: 'ಇಂದಿನ ಪಂಚಾಂಗ',
    tithi: 'ತಿಥಿ',
    ends: 'ಮುಕ್ತಾಯ',
    nakshatram: 'ನಕ್ಷತ್ರ',
    rahuKalam: 'ರಾಹುಕಾಲ',
    sunrise: 'ಸೂರ್ಯೋದಯ',
    sunset: 'ಸೂರ್ಯಾಸ್ತ',
    viewFull: 'ಪೂರ್ಣ ಪಂಚಾಂಗ ನೋಡಿ',
  },
  en: {
    headerTitle: "TODAY'S PANCHANGAM",
    tithi: 'Tithi',
    ends: 'Ends',
    nakshatram: 'Nakshatra',
    rahuKalam: 'Rahu Kalam',
    sunrise: 'Sunrise',
    sunset: 'Sunset',
    viewFull: 'View Full Panchangam',
  },
  ta: {
    headerTitle: 'இன்றைய பஞ்சாங்கம்',
    tithi: 'திதி',
    ends: 'முடிவு',
    nakshatram: 'நட்சத்திரம்',
    rahuKalam: 'ராகு காலம்',
    sunrise: 'சூரிய உதயம்',
    sunset: 'சூரிய அஸ்தமனம்',
    viewFull: 'முழு பஞ்சாங்கத்தைப் பார்க்கவும்',
  },
  hi: {
    headerTitle: 'आज का पंचांग',
    tithi: 'तिथि',
    ends: 'समाप्ति',
    nakshatram: 'नक्षत्र',
    rahuKalam: 'राहुकाल',
    sunrise: 'सूर्योदय',
    sunset: 'सूर्यास्त',
    viewFull: 'पूरा पंचांग देखें',
  },
};

export const TodayPanchangamCard: React.FC<Props> = ({
  data,
  currentLanguage,
  onPress,
}) => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;
  const l = LABELS[currentLanguage] || LABELS.te;

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={styles.card}
      >
        {/* Top Header Banner */}
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>ॐ  {l.headerTitle}  ॐ</Text>
          {data.cityNameLocalized ? (
            <Text style={styles.cityPill}>{data.cityNameLocalized}</Text>
          ) : null}
        </View>

        {/* 2-Column Responsive Body */}
        <View style={[styles.bodyRow, isSmallScreen && styles.bodyColumn]}>
          {/* Left Side: Date Block (~30% width) */}
          <View style={[styles.dateBlock, isSmallScreen && styles.dateBlockSmall]}>
            <Text style={styles.dayNumber}>{data.dayNumber}</Text>
            <Text style={styles.monthText}>{data.monthText}</Text>
            <Text style={styles.yearText}>{data.year || 2026}</Text>
            <View style={styles.weekdayBadge}>
              <Text style={styles.weekdayText} numberOfLines={1}>
                {data.vaaram}
              </Text>
            </View>
          </View>

          {/* Right Side: Sacred Panchangam Details */}
          <View style={styles.panchangBlock}>
            {data.maasa ? (
              <View style={styles.masamRow}>
                <Text style={styles.masamText} numberOfLines={1}>
                  {data.maasa}
                </Text>
              </View>
            ) : null}

            {data.samvatsaram ? (
              <Text style={styles.samvatsaramText} numberOfLines={1}>
                {data.samvatsaram}
              </Text>
            ) : null}

            {/* Tithi with End Time */}
            <View style={styles.infoRow}>
              <Text style={styles.labelCol}>{l.tithi}:</Text>
              <Text style={styles.valueCol} numberOfLines={1}>
                {data.tithi}
                {data.tithiEndTime ? ` (${l.ends}: ${data.tithiEndTime})` : ''}
              </Text>
            </View>

            {/* Nakshatram with End Time */}
            <View style={styles.infoRow}>
              <Text style={styles.labelCol}>{l.nakshatram}:</Text>
              <Text style={styles.valueCol} numberOfLines={1}>
                {data.nakshatram}
                {data.nakshatraEndTime ? ` (${l.ends}: ${data.nakshatraEndTime})` : ''}
              </Text>
            </View>

            {/* Rahu Kalam */}
            <View style={styles.infoRow}>
              <Text style={styles.labelCol}>{l.rahuKalam}:</Text>
              <Text style={styles.valueColHighlight} numberOfLines={1}>
                {data.rahuKalam}
              </Text>
            </View>

            {/* Sun Rise / Set Row */}
            <View style={styles.sunRow}>
              <Text style={styles.sunText}>
                ☀ {l.sunrise}: {data.sunrise}
              </Text>
              <Text style={styles.sunDivider}>|</Text>
              <Text style={styles.sunText}>
                ☾ {l.sunset}: {data.sunset}
              </Text>
            </View>
          </View>
        </View>

        {/* View Full Panchangam Action Strip */}
        <View style={styles.footerBar}>
          <Text style={styles.footerActionText}>
            {l.viewFull} →
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    paddingHorizontal: 12,
    marginTop: 8,
    marginBottom: 6,
    width: '100%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: '#E6D9C8',
    elevation: 2,
    shadowColor: '#0C251E',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  headerBar: {
    backgroundColor: '#FAF5EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E5D8',
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0C251E',
    letterSpacing: 0.5,
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
  },
  cityPill: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#E65100',
    backgroundColor: '#FFF3E0',
    borderWidth: 0.8,
    borderColor: '#FFE0B2',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  bodyRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },
  bodyColumn: {
    flexDirection: 'column',
  },
  dateBlock: {
    width: '30%',
    minWidth: 84,
    backgroundColor: '#FFF8F0',
    borderRightWidth: 1,
    borderRightColor: '#F0E5D8',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  dateBlockSmall: {
    width: '100%',
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E5D8',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  dayNumber: {
    fontSize: 44,
    fontWeight: '700',
    color: '#D84315',
    lineHeight: 48,
    textAlign: 'center',
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
  },
  monthText: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0C251E',
    textAlign: 'center',
    marginTop: -2,
  },
  yearText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#215344',
    textAlign: 'center',
  },
  weekdayBadge: {
    marginTop: 6,
    backgroundColor: '#FFF3E0',
    borderWidth: 0.8,
    borderColor: '#FFE0B2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  weekdayText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#BF360C',
    textAlign: 'center',
  },
  panchangBlock: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  masamRow: {
    backgroundColor: '#FFF3E0',
    borderWidth: 0.8,
    borderColor: '#FFE0B2',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  masamText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E65100',
  },
  samvatsaramText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#215344',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  labelCol: {
    fontSize: 12,
    fontWeight: '700',
    color: '#215344',
    width: 68,
  },
  valueCol: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#0C251E',
  },
  valueColHighlight: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#D84315',
  },
  sunRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F0E5D8',
  },
  sunText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#215344',
  },
  sunDivider: {
    fontSize: 10,
    color: '#D84315',
    marginHorizontal: 6,
  },
  footerBar: {
    backgroundColor: '#FFF3E0',
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#FFE0B2',
  },
  footerActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D84315',
    letterSpacing: 0.2,
  },
});
