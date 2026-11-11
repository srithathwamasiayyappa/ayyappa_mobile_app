import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
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

          {/* Right Side: Panchangam Details (~70% width) */}
          <View style={styles.panchangBlock}>
            {/* Lunar Month & Paksham */}
            {data.maasa ? (
              <View style={styles.masamRow}>
                <Text style={styles.masamText} numberOfLines={1}>
                  {data.maasa} • {data.paksham}
                </Text>
              </View>
            ) : (
              <Text style={styles.samvatsaramText} numberOfLines={1}>
                {data.samvatsaram}
              </Text>
            )}

            {/* Tithi Row */}
            <View style={styles.infoRow}>
              <Text style={styles.labelCol}>{l.tithi}:</Text>
              <Text style={styles.valueCol} numberOfLines={1}>
                {data.tithi} {data.tithiEndTime ? `(${l.ends}: ${data.tithiEndTime})` : ''}
              </Text>
            </View>

            {/* Nakshatram Row */}
            <View style={styles.infoRow}>
              <Text style={styles.labelCol}>{l.nakshatram}:</Text>
              <Text style={styles.valueCol} numberOfLines={1}>
                {data.nakshatram} {data.nakshatraEndTime ? `(${l.ends}: ${data.nakshatraEndTime})` : ''}
              </Text>
            </View>

            {/* Rahu Kalam Row */}
            {data.rahuKalam ? (
              <View style={styles.infoRow}>
                <Text style={styles.labelCol}>{l.rahuKalam}:</Text>
                <Text style={styles.valueColHighlight} numberOfLines={1}>
                  {data.rahuKalam}
                </Text>
              </View>
            ) : null}

            {/* Sunrise & Sunset Row */}
            {data.sunrise ? (
              <View style={styles.sunRow}>
                <Text style={styles.sunText}>
                  ☀ {l.sunrise}: {data.sunrise}
                </Text>
                <Text style={styles.sunDivider}>|</Text>
                <Text style={styles.sunText}>
                  🌙 {l.sunset}: {data.sunset}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Bottom Action Footer */}
        <View style={styles.footerBar}>
          <Text style={styles.footerActionText}>{l.viewFull} →</Text>
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
    backgroundColor: '#FF5722', // Vivid devotional orange
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#C62828', // Dark sacred red/brown outline
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  headerBar: {
    backgroundColor: '#E65100',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#BF360C',
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFD54F',
    letterSpacing: 0.5,
  },
  cityPill: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  bodyRow: {
    flexDirection: 'row',
  },
  bodyColumn: {
    flexDirection: 'column',
  },
  dateBlock: {
    width: '30%',
    minWidth: 84,
    backgroundColor: '#FF5722',
    borderRightWidth: 1.5,
    borderRightColor: '#BF360C',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  dateBlockSmall: {
    width: '100%',
    borderRightWidth: 0,
    borderBottomWidth: 1.5,
    borderBottomColor: '#BF360C',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 6,
  },
  dayNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFD54F', // Bright golden yellow number
    lineHeight: 52,
    textAlign: 'center',
  },
  monthText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginTop: -2,
  },
  yearText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3E2723',
    textAlign: 'center',
  },
  weekdayBadge: {
    marginTop: 4,
    backgroundColor: '#FFE082',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  weekdayText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#BF360C',
    textAlign: 'center',
  },
  panchangBlock: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  masamRow: {
    backgroundColor: 'rgba(255, 213, 79, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  masamText: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#FFD54F',
  },
  samvatsaramText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFD54F',
    marginBottom: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 1.5,
  },
  labelCol: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    width: 68,
  },
  valueCol: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  valueColHighlight: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: 'bold',
    color: '#212121',
  },
  sunRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 3,
    borderTopWidth: 0.8,
    borderTopColor: 'rgba(191, 54, 12, 0.4)',
  },
  sunText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sunDivider: {
    fontSize: 10,
    color: '#FFD54F',
    marginHorizontal: 5,
  },
  footerBar: {
    backgroundColor: '#E65100',
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#BF360C',
  },
  footerActionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFD54F',
    letterSpacing: 0.2,
  },
});

