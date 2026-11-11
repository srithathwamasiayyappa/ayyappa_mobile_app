import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { DevotionalBackground } from '../../../components/common/DevotionalBackground';
import { ApiService } from '../../../services/api';
import { SupportedLanguage, PanchangamData, PanchangamSection } from '../../../types';

interface Props {
  currentLanguage: SupportedLanguage;
  onBack: () => void;
}

const BACK_LABELS = {
  te: '< Back',
  kn: '< Back',
  en: '< Back',
  ta: '< Back',
  hi: '< Back',
};

const SCREEN_TITLES = {
  te: 'పంచాంగం',
  kn: 'ಪಂಚಾಂಗ',
  en: 'Panchangam',
  ta: 'பஞ்சாங்கம்',
  hi: 'पंचांग',
};

export const PanchangamScreen: React.FC<Props> = ({
  currentLanguage,
  onBack,
}) => {
  const [data, setData] = useState<PanchangamData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await ApiService.getPanchangam(currentLanguage);
        if (isMounted) {
          setData(res);
        }
      } catch (e) {
        console.error('Failed to load panchangam:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [currentLanguage]);

  const details = data?.details;

  const renderSectionCard = (title: string, items: string[]) => {
    if (!items || items.length === 0) return null;
    return (
      <View key={title} style={styles.cardWrapper}>
        {/* Floating title above border */}
        <View style={styles.titleBadge}>
          <Text style={styles.titleBadgeText}>{title}</Text>
        </View>
        <View style={styles.sectionCard}>
          {items.map((item, idx) => (
            <Text key={idx} style={styles.sectionItemText}>
              {item}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#E65100" />
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={onBack}
          >
            <Text style={styles.backButtonText}>
              {BACK_LABELS[currentLanguage] || '< Back'}
            </Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {SCREEN_TITLES[currentLanguage] || 'Panchangam'}
            </Text>
          </View>

          <View style={styles.headerRightSpacer} />
        </View>
      </SafeAreaView>

      <DevotionalBackground>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#BF360C" />
          </View>
        ) : !details ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>No Panchangam data available.</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Top Date & Day Header */}
            <View style={styles.topInfoBlock}>
              <Text style={styles.dateText}>{details.date}</Text>
              <Text style={styles.dayText}>{details.dayName}</Text>
              <Text style={styles.samvatsaraText}>{details.samvatsara}</Text>
              <Text style={styles.ayanaRituText}>{details.ayanaRitu}</Text>
              <Text style={styles.maasaPakshaText}>{details.maasaPaksha}</Text>
            </View>

            {/* Panchangam Cards */}
            {renderSectionCard(details.tithi.title, details.tithi.items)}
            {renderSectionCard(details.star.title, details.star.items)}
            {renderSectionCard(details.yoga.title, details.yoga.items)}
            {renderSectionCard(details.karana.title, details.karana.items)}
            {renderSectionCard(details.auspiciousTime.title, details.auspiciousTime.items)}
            {renderSectionCard(details.inauspiciousTime.title, details.inauspiciousTime.items)}

            {/* Bottom Sun Times */}
            {details.sunTimes ? (
              <View style={styles.sunTimesBlock}>
                <Text style={styles.sunTimesText}>{details.sunTimes}</Text>
              </View>
            ) : null}
          </ScrollView>
        )}
      </DevotionalBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#E65100',
  },
  safeArea: {
    backgroundColor: '#E65100',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    backgroundColor: '#E65100',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    minWidth: 70,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerRightSpacer: {
    minWidth: 70,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#8D6E63',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  topInfoBlock: {
    alignItems: 'center',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#B71C1C',
    textDecorationLine: 'underline',
    marginBottom: 4,
  },
  dayText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#8D6E63',
    marginBottom: 8,
  },
  samvatsaraText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
    textAlign: 'center',
  },
  ayanaRituText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
    textAlign: 'center',
  },
  maasaPakshaText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 6,
    textAlign: 'center',
  },
  cardWrapper: {
    position: 'relative',
    marginTop: 14,
    marginBottom: 10,
  },
  titleBadge: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  titleBadgeText: {
    backgroundColor: '#FFE699', // Matches golden card background
    paddingHorizontal: 10,
    fontSize: 13,
    fontWeight: 'bold',
    color: '#3E2723',
  },
  sectionCard: {
    borderWidth: 1.2,
    borderColor: '#795548',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255, 248, 225, 0.45)', // Soft warm overlay
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionItemText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212121',
    marginVertical: 2,
    textAlign: 'center',
  },
  sunTimesBlock: {
    marginTop: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  sunTimesText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8D2400',
    textAlign: 'center',
  },
});

