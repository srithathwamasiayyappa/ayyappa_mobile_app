import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Text,
  Image,
  SafeAreaView,
  Platform,
  Share,
  Modal,
} from 'react-native';
import { DevotionalBackground } from '../../../components/common/DevotionalBackground';
import { DevotionalTicker } from '../../../components/common/DevotionalTicker';
import { TodayPanchangamCard } from '../../panchangam/components/TodayPanchangamCard';
import { CategoryListItem } from '../../../components/cards/CategoryListItem';
import { ShareIcon } from '../../../components/common/ShareIcon';

import { ApiService } from '../../../services/api';
import { SupportedLanguage, PanchangamData, DevotionalCategoryItem } from '../../../types';

interface Props {
  currentLanguage: SupportedLanguage;
  onOpenLanguageScreen: () => void;
  onOpenAboutScreen: () => void;
  onOpenContactScreen?: () => void;
  onOpenDetail?: (id: string, title: string) => void;
  onOpenPanchangam?: () => void;
}

const SHARE_MESSAGES = {
  te: 'శరణం అయ్యప్ప - స్వామియే శరణం అయ్యప్ప! ప్రతిరోజూ పంచాంగం, ఉత్తర నక్షత్ర తేదీలు, నిత్య పూజ మరియు స్తోత్రాలు ఒకే చోట.',
  kn: 'ಶರಣಂ ಅಯ್ಯಪ್ಪ - ಸ್ವಾಮಿಯೇ ಶರಣಂ ಅಯ್ಯಪ್ಪ! ನಿತ್ಯ ಪಂಚಾಂಗ, ಉತ್ತರಾ ನಕ್ಷತ್ರ ದಿನಾಂಕಗಳು ಮತ್ತು ಸ್ತೋತ್ರಗಳು.',
  en: 'Saranam Ayyappa - Swamiye Saranam Ayyappa! Daily Panchangam, 2026 Uttara dates, Pooja procedures, and hymns.',
  ta: 'சரணம் ஐயப்பா - சுவாமியே சரணம் ஐயப்பா! தினசரி பஞ்சாங்கம், 2026 உத்திர நட்சத்திர தேதிகள் மற்றும் ஸ்தோத்திரங்கள்.',
  hi: 'शरणम् अय्यप्पा - स्वामीये शरणम अय्यप्पा! दैनिक पंचांग, 2026 उत्तरा नक्षत्र तिथियां और स्तोत्र।',
};

export const HomeScreen: React.FC<Props> = ({
  currentLanguage,
  onOpenLanguageScreen,
  onOpenAboutScreen,
  onOpenContactScreen,
  onOpenDetail,
  onOpenPanchangam,
}) => {
  const [categories, setCategories] = useState<DevotionalCategoryItem[]>([]);
  const [panchangam, setPanchangam] = useState<PanchangamData | null>(null);
  const [tickerText, setTickerText] = useState<string | null>(null);
  const [appTitle, setAppTitle] = useState<string>('శరణం అయ్యప్ప');


  const loadData = async () => {
    // 1. Dynamic Title
    setAppTitle(ApiService.getAppTitle(currentLanguage));

    // 2. Dynamic Ticker
    const tickerRes = await ApiService.getTickerMantra(currentLanguage);
    setTickerText(tickerRes.text);

    // 3. Dynamic Panchangam
    const pData = await ApiService.getPanchangam(currentLanguage);
    setPanchangam(pData);

    // 4. Dynamic Categories
    const cData = await ApiService.getCategories(currentLanguage);
    setCategories(cData);
  };

  useEffect(() => {
    loadData();
  }, [currentLanguage]);

  // Native share handler
  const handleShare = async () => {
    try {
      const message = SHARE_MESSAGES[currentLanguage] || SHARE_MESSAGES.te;
      await Share.share({
        title: appTitle,
        message,
      });
    } catch (e) {
      // Ignored
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#D84315" />
      
      {/* Devotional Orange Header Bar */}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require('../../../assets/images/saranam_ayyappa_logo.jpg')}
              style={styles.navLogo}
              resizeMode="contain"
            />
            <Text style={styles.headerTitle} numberOfLines={1}>
              {appTitle}
            </Text>
          </View>

          {/* Right Header Action Icons (Aligned Exactly with User Screenshot) */}
          <View style={styles.headerIcons}>

            {/* Contact Us Icon */}
            {onOpenContactScreen && (
              <TouchableOpacity
                style={styles.iconBtn}
                activeOpacity={0.7}
                onPress={onOpenContactScreen}>
                  <Text style={{ fontSize: 16 }}>📞</Text>
              </TouchableOpacity>
            )}

            {/* 1. About / Info Icon: Navigates to About Screen */}
            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.7}
              onPress={onOpenAboutScreen}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconCircleText}>i</Text>
              </View>
            </TouchableOpacity>

            {/* 2. Industry-Standard Connected 3-Node Share Icon */}
            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.7}
              onPress={handleShare}>
              <ShareIcon size={20} color="#FFFFFF" />
            </TouchableOpacity>

            {/* 3. Language Icon (文): Navigates to Language Selection Screen */}
            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.7}
              onPress={onOpenLanguageScreen}>
              <Text style={styles.languageGlyph}>文</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <DevotionalBackground>
        {/* Dynamic Continuous Scrolling Ticker */}
        {tickerText && <DevotionalTicker text={tickerText} />}

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Dynamic Today's Date + Live Panchangam Summary Card */}
          {panchangam && (
            <TodayPanchangamCard
              data={panchangam}
              currentLanguage={currentLanguage}
              onPress={() => onOpenPanchangam && onOpenPanchangam()}
            />
          )}

          {/* Devotional Category List Items */}
          <View style={styles.listContainer}>
            {categories.map((item) => (
              <CategoryListItem
                key={item.id}
                id={item.id}
                title={item.title}
                isAudio={item.isAudio}
                audioDurationSec={item.audioDurationSec}
                totalTime={item.totalTime}
                chantLyric={item.chantLyric}
                onPress={() => {
                  if (!item.isAudio && onOpenDetail) {
                    onOpenDetail(item.id, item.title);
                  }
                }}
              />
            ))}
          </View>
        </ScrollView>
      </DevotionalBackground>


    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#D84315',
    width: '100%',
    height: '100%',
  },
  safeArea: {
    backgroundColor: '#D84315',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    height: 56,
    backgroundColor: '#D84315',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  navLogo: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#FFE082',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    marginLeft: 18,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.8,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: -1,
  },
  shareIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareArrow: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    transform: [{ translateY: -1 }],
  },
  languageGlyph: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: 'bold',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  listContainer: {
    width: '100%',
  },
});


