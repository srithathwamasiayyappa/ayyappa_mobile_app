import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Image,
  Linking,
  ActivityIndicator,
  BackHandler,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { SupportedLanguage, TempleItem } from '../../../types';
import { ApiService } from '../../../services/api';

interface Props {
  templeId: string;
  templeData?: TempleItem | null;
  currentLanguage: SupportedLanguage;
  onBack: () => void;
  onOpenLiveDarshan?: (streamId: string, templeTitle: string) => void;
}

// Corner Filigree Ornaments for Hero / Header
const HeaderCornerFiligree = ({ flipped = false }: { flipped?: boolean }) => (
  <View style={flipped ? { transform: [{ scaleX: -1 }] } : undefined}>
    <Svg width={36} height={36} viewBox="0 0 36 36" fill="none">
      <Path
        d="M2 2 C12 2 22 8 28 16 C24 18 18 16 12 22 C8 16 6 8 2 2 Z"
        fill="#DFA62E"
        fillOpacity={0.8}
      />
      <Circle cx="8" cy="8" r="2" fill="#FFD700" />
      <Circle cx="16" cy="5" r="1.5" fill="#FFD700" />
      <Circle cx="5" cy="16" r="1.5" fill="#FFD700" />
    </Svg>
  </View>
);

// Back Arrow
const BackArrowIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M12 19l-7-7 7-7"
      stroke="#FFFDF8"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Map Pin Icon
const MapPinIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
      fill="#FFFDF8"
    />
    <Circle cx="12" cy="9" r="2.5" fill="#173D32" />
  </Svg>
);

// Phone Call Icon
const PhoneIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z"
      fill="#FFFDF8"
    />
  </Svg>
);

// Live Stream Video Icon
const LiveBroadcastIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" fill="#FFFDF8" />
    <Path
      d="M8.5 8.5 A5 5 0 0 0 8.5 15.5"
      stroke="#FFFDF8"
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Path
      d="M15.5 8.5 A5 5 0 0 1 15.5 15.5"
      stroke="#FFFDF8"
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

type TempleTab = 'about' | 'history' | 'speciality' | 'timings' | 'contact';

// Multilingual translations
const UI_TRANSLATIONS: Record<string, Record<string, string>> = {
  aboutTab: {
    en: 'About',
    te: 'పరిచయం',
    kn: 'ಪರಿಚಯ',
    ta: 'அறிமுகம்',
    hi: 'परिचय',
    ml: 'വിവരണം',
  },
  historyTab: {
    en: 'History',
    te: 'చరిత్ర',
    kn: 'ಇತಿಹಾಸ',
    ta: 'வரலாறு',
    hi: 'इतिहास',
    ml: 'ചരിത്രം',
  },
  specialityTab: {
    en: 'Speciality',
    te: 'విశిష్టత',
    kn: 'ವಿಶಿಷ್ಟತೆ',
    ta: 'சிறப்பம்சம்',
    hi: 'विशेषता',
    ml: 'പ്രത്യേകതകൾ',
  },
  timingsTab: {
    en: 'Timings',
    te: 'సమయాలు',
    kn: 'ಸಮಯಗಳು',
    ta: 'நேரங்கள்',
    hi: 'समय',
    ml: 'സമയങ്ങൾ',
  },
  contactTab: {
    en: 'Contact',
    te: 'సంప్రదించండి',
    kn: 'ಸಂಪರ್ಕಿಸಿ',
    ta: 'தொடர்பு',
    hi: 'संपर्क',
    ml: 'ബന്ധപ്പെടുക',
  },
  aboutHeading: {
    en: 'About the Temple',
    te: 'దేవాలయ విశేషాలు',
    kn: 'ದೇವಾಲಯದ ವಿವರಣೆ',
    ta: 'கோயில் பற்றிய தகவல்',
    hi: 'मंदिर का विवरण',
    ml: 'ക്ഷേത്രത്തെക്കുറിച്ച്',
  },
  historyHeading: {
    en: 'History',
    te: 'ప్రాచీన చరిత్ర',
    kn: 'ಪ್ರಾಚೀನ ಇತಿಹಾಸ',
    ta: 'புராதன வரலாறு',
    hi: 'प्राचीन इतिहास',
    ml: 'ഐതീഹ്യവും ചരിത്രവും',
  },
  specialityHeading: {
    en: 'Speciality',
    te: 'ఆలయ విశిష్టతలు',
    kn: 'ದೇವಾಲಯದ ವಿಶೇಷತೆಗಳು',
    ta: 'கோயில் சிறப்புகள்',
    hi: 'मंदिर की विशेषताएं',
    ml: 'പ്രത്യേകതകളും ആചാരങ്ങളും',
  },
  timingsHeading: {
    en: 'Timings',
    te: 'దర్శన సమయాలు',
    kn: 'ದರ್ಶನ ಸಮಯಗಳು',
    ta: 'தரிசன நேரங்கள்',
    hi: 'दर्शन का समय',
    ml: 'ദർശന സമയം',
  },
  contactHeading: {
    en: 'Contact Information',
    te: 'సంప్రదింపుల వివరాలు',
    kn: 'ಸಂಪರ್ಕ ವಿವರಗಳು',
    ta: 'தொடர்பு விவரங்கள்',
    hi: 'संपर्क जानकारी',
    ml: 'ബന്ധപ്പെടേണ്ട വിലാസം',
  },
  viewMap: {
    en: 'View Map',
    te: 'మ్యాప్‌లో చూడండి',
    kn: 'ಮ್ಯಾಪ್‌ನಲ್ಲಿ ನೋಡಿ',
    ta: 'வரைபடம் காண்க',
    hi: 'मानचित्र देखें',
    ml: 'മാപ്പ് കാണുക',
  },
  callTemple: {
    en: 'Call Temple',
    te: 'కాల్ చేయండి',
    kn: 'ಕರೆ ಮಾಡಿ',
    ta: 'அழைக்க',
    hi: 'कॉल करें',
    ml: 'വിളിക്കുക',
  },
  watchLive: {
    en: 'Watch Live Darshan',
    te: 'ప్రత్యక్ష దర్శనం చూడండి',
    kn: 'ಲೈವ್ ದರ್ಶನ ವೀಕ್ಷಿಸಿ',
    ta: 'நேரலை தரிசனம்',
    hi: 'लाइव दर्शन देखें',
    ml: 'തത്സമയ ദർശനം',
  },
  confirmTimingsNotice: {
    en: 'Please confirm timings with the temple before visiting.',
    te: 'దర్శనానికి వెళ్లే ముందు ఆలయ అధికారులతో సమయాలను నిర్ధారించుకోండి.',
    kn: 'ಭೇಟಿ ನೀಡುವ ಮುನ್ನ ದೇವಾಲಯದ ಅಧಿಕಾರಿಗಳೊಂದಿಗೆ ಸಮಯವನ್ನು ದೃಢೀಕರಿಸಿ.',
    ta: 'செல்லும் முன் கோயில் நிர்வாகத்திடம் நேரத்தை உறுதிப்படுத்தவும்.',
    hi: 'यात्रा से पूर्व मंदिर प्रशासन से दर्शन समय की पुष्टि अवश्य करें।',
    ml: 'സന്ദർശിക്കുന്നതിന് മുമ്പ് ക്ഷേത്രവുമായി സമയം ഉറപ്പുവരുത്തുക.',
  },
  phoneUnavailable: {
    en: 'Official temple phone number is currently not listed.',
    te: 'అధికారిక ఫోన్ నంబరు ప్రస్తుతం అందుబాటులో లేదు.',
    kn: 'ಅಧಿಕೃತ ಫೋನ್ ಸಂಖ್ಯೆ ಪ್ರಸ್ತುತ ಲಭ್ಯವಿಲ್ಲ.',
    ta: 'அதிகாரப்பூர்வ தொலைபேசி எண் தற்போது கிடைக்கவில்லை.',
    hi: 'आधिकारिक फ़ोन नंबर फ़िलहाल उपलब्ध नहीं है।',
    ml: 'ഔദ്യോഗിക ഫോൺ നമ്പർ ഇപ്പോൾ ലഭ്യമല്ല.',
  },
};

export const TempleProfileScreen: React.FC<Props> = ({
  templeId,
  templeData,
  currentLanguage,
  onBack,
  onOpenLiveDarshan,
}) => {
  const [temple, setTemple] = useState<TempleItem | null>(templeData || null);
  const [loading, setLoading] = useState<boolean>(!templeData);
  const [activeTab, setActiveTab] = useState<TempleTab>('about');
  const scrollRef = useRef<ScrollView>(null);

  // Android Hardware Back
  useEffect(() => {
    if (!onBack) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [onBack]);

  // Load temple detail if not passed via props
  useEffect(() => {
    if (templeData && templeData.id === templeId) {
      setTemple(templeData);
      setLoading(false);
      return;
    }

    let isMounted = true;
    async function fetchDetail() {
      try {
        setLoading(true);
        const res = await ApiService.getTempleDetail(templeId, currentLanguage);
        if (isMounted) {
          setTemple(res);
        }
      } catch (e) {
        if (isMounted) {
          setTemple(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [templeId, templeData, currentLanguage]);

  if (loading && !temple) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#173D32" />
      </View>
    );
  }

  if (!temple) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <Text style={{ fontSize: 16, color: '#B00020', textAlign: 'center', marginBottom: 16 }}>
          Temple details could not be loaded from database.
        </Text>
        <TouchableOpacity style={[styles.tabPillSelected, { paddingHorizontal: 24, paddingVertical: 10 }]} onPress={onBack}>
          <Text style={styles.tabPillTextSelected}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const activeTemple = temple;
  const langKey = currentLanguage in UI_TRANSLATIONS.aboutTab ? currentLanguage : 'en';

  // Dynamic localized name
  const localizedName =
    (activeTemple.localNames && activeTemple.localNames[currentLanguage]) ||
    activeTemple.name;

  // View Map Action
  const handleOpenMap = () => {
    const lat = activeTemple.latitude;
    const lng = activeTemple.longitude;
    const label = encodeURIComponent(activeTemple.name);

    if (lat && lng) {
      const scheme = Platform.select({
        ios: `maps:0,0?q=${label}@${lat},${lng}`,
        android: `geo:${lat},${lng}?q=${lat},${lng}(${label})`,
      });
      const webUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

      if (scheme) {
        Linking.canOpenURL(scheme)
          .then((supported) => {
            if (supported) {
              return Linking.openURL(scheme);
            }
            return Linking.openURL(webUrl);
          })
          .catch(() => Linking.openURL(webUrl));
      } else {
        Linking.openURL(webUrl);
      }
    } else {
      const queryUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${activeTemple.name}, ${activeTemple.city}, ${activeTemple.state}`
      )}`;
      Linking.openURL(queryUrl);
    }
  };

  // Call Temple Action
  const handleCallTemple = () => {
    const rawPhone = activeTemple.contact?.phone;
    if (!rawPhone) {
      Alert.alert(
        activeTemple.name,
        UI_TRANSLATIONS.phoneUnavailable[langKey] ||
          'Official temple phone number is currently not listed.'
      );
      return;
    }
    const cleanNumber = rawPhone.replace(/[^\d+]/g, '');
    const phoneUrl = `tel:${cleanNumber}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Call', `Phone dialer is not supported on this device: ${rawPhone}`);
        }
      })
      .catch(() => {
        Alert.alert('Call', `Unable to initiate call to: ${rawPhone}`);
      });
  };

  // Open Official Website Action
  const handleOpenWebsite = (url?: string) => {
    if (!url) return;
    Linking.openURL(url).catch((err) =>
      console.warn('Failed to open temple website:', err)
    );
  };

  // Handle Tab Click
  const handleTabPress = (tab: TempleTab) => {
    setActiveTab(tab);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0C251E" translucent />

      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#173D32" />
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* =========================================================================
              HERO IMAGE BANNER: High-Resolution Temple Photo + Overlay + Back Arrow
             ========================================================================= */}
          <View style={styles.heroBannerContainer}>
            <Image
              source={
                activeTemple.id === 'sabarimala'
                  ? require('../../../../assets/temple_profile_ref.png')
                  : require('../../../../assets/temples_list_ref.png')
              }
              style={[
                styles.heroImageCrop,
                activeTemple.id === 'sabarimala'
                  ? { top: 0 }
                  : { top: -((activeTemple.cropIndex ?? 0) * 80 + 40) },
              ]}
              resizeMode="cover"
            />

            {/* Dark gradient for title legibility */}
            <LinearGradient
              colors={['rgba(30,5,8,0.5)', 'rgba(0,0,0,0)', 'rgba(25,5,8,0.92)']}
              locations={[0, 0.35, 1]}
              style={styles.heroGradientOverlay}
            />

            {/* Floating Top Header Over Hero Banner */}
            <SafeAreaView style={styles.heroHeaderSafeArea}>
              <TouchableOpacity
                style={styles.heroBackButton}
                onPress={onBack}
                activeOpacity={0.7}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <BackArrowIcon />
              </TouchableOpacity>

              <View style={styles.heroCornerOrnamentRight}>
                <HeaderCornerFiligree flipped />
              </View>
              <View style={styles.heroCornerOrnamentLeft}>
                <HeaderCornerFiligree />
              </View>
            </SafeAreaView>

            {/* Temple Name & Location over lower part of hero */}
            <View style={styles.heroBottomTextGroup}>
              <Text style={styles.heroTempleName} numberOfLines={2}>
                {localizedName}
              </Text>
              <Text style={styles.heroTempleLocation}>
                {activeTemple.city}, {activeTemple.state}
              </Text>
            </View>
          </View>

          {/* =========================================================================
              INFORMATION TABS: About | History | Speciality | Timings | Contact
             ========================================================================= */}
          <View style={styles.tabsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsScrollContent}
            >
              {(['about', 'history', 'speciality', 'timings', 'contact'] as TempleTab[]).map(
                (tab) => {
                  const isSelected = activeTab === tab;
                  const label =
                    UI_TRANSLATIONS[`${tab}Tab`]?.[langKey] ||
                    tab.charAt(0).toUpperCase() + tab.slice(1);

                  return (
                    <TouchableOpacity
                      key={tab}
                      style={[
                        styles.tabPill,
                        isSelected ? styles.tabPillSelected : styles.tabPillUnselected,
                      ]}
                      activeOpacity={0.75}
                      onPress={() => handleTabPress(tab)}
                    >
                      <Text
                        style={[
                          styles.tabPillText,
                          isSelected
                            ? styles.tabPillTextSelected
                            : styles.tabPillTextUnselected,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                }
              )}
            </ScrollView>
          </View>

          {/* =========================================================================
              TEMPLE INFORMATION SECTIONS: Warm Ivory Devotional Card
             ========================================================================= */}
          <View style={styles.contentCard}>
            {/* Section 1: About the Temple */}
            {(activeTab === 'about' || !activeTab) && (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionHeading}>
                  {UI_TRANSLATIONS.aboutHeading[langKey] || 'About the Temple'}
                </Text>
                <Text style={styles.sectionParagraph}>{activeTemple.about}</Text>
              </View>
            )}

            {/* Section 2: History */}
            {(activeTab === 'history' || !activeTab) && activeTemple.history && (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionHeading}>
                  {UI_TRANSLATIONS.historyHeading[langKey] || 'History'}
                </Text>
                <Text style={styles.sectionParagraph}>{activeTemple.history}</Text>
              </View>
            )}

            {/* Section 3: Speciality */}
            {(activeTab === 'speciality' || !activeTab) &&
              activeTemple.speciality &&
              activeTemple.speciality.length > 0 && (
                <View style={styles.sectionBlock}>
                  <Text style={styles.sectionHeading}>
                    {UI_TRANSLATIONS.specialityHeading[langKey] || 'Speciality'}
                  </Text>
                  {activeTemple.speciality.map((item, idx) => (
                    <View key={idx} style={styles.bulletItem}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.bulletText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}

            {/* Section 4: Timings */}
            {(activeTab === 'timings' || !activeTab) && (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionHeading}>
                  {UI_TRANSLATIONS.timingsHeading[langKey] || 'Timings'}
                </Text>
                {activeTemple.timings?.morning && (
                  <View style={styles.timingRow}>
                    <Text style={styles.timingLabel}>
                      {currentLanguage === 'te' ? 'ఉదయం:' : 'Morning:'}
                    </Text>
                    <Text style={styles.timingValue}>
                      {activeTemple.timings.morning}
                    </Text>
                  </View>
                )}
                {activeTemple.timings?.evening && (
                  <View style={styles.timingRow}>
                    <Text style={styles.timingLabel}>
                      {currentLanguage === 'te' ? 'సాయంత్రం:' : 'Evening:'}
                    </Text>
                    <Text style={styles.timingValue}>
                      {activeTemple.timings.evening}
                    </Text>
                  </View>
                )}
                {activeTemple.timings?.special && (
                  <View style={styles.timingRow}>
                    <Text style={styles.timingLabel}>
                      {currentLanguage === 'te' ? 'ప్రత్యేక పూజలు:' : 'Special Sevas:'}
                    </Text>
                    <Text style={styles.timingValue}>
                      {activeTemple.timings.special}
                    </Text>
                  </View>
                )}
                {activeTemple.timings?.notes && (
                  <Text style={styles.timingNotesText}>
                    {activeTemple.timings.notes}
                  </Text>
                )}
                <Text style={styles.confirmNoticeText}>
                  ℹ️ {UI_TRANSLATIONS.confirmTimingsNotice[langKey] ||
                    'Please confirm timings with the temple before visiting.'}
                </Text>
              </View>
            )}

            {/* Section 5: Contact Information */}
            {(activeTab === 'contact' || !activeTab) && (
              <View style={[styles.sectionBlock, styles.sectionBlockLast]}>
                <Text style={styles.sectionHeading}>
                  {UI_TRANSLATIONS.contactHeading[langKey] || 'Contact Information'}
                </Text>
                <Text style={styles.contactAddressText}>
                  {activeTemple.address}
                </Text>
                {activeTemple.contact?.phone && (
                  <TouchableOpacity
                    style={styles.contactLinkRow}
                    activeOpacity={0.7}
                    onPress={handleCallTemple}
                  >
                    <Text style={styles.contactLinkIcon}>📞</Text>
                    <Text style={styles.contactLinkText}>
                      {activeTemple.contact.phone}
                    </Text>
                  </TouchableOpacity>
                )}
                {activeTemple.contact?.website && (
                  <TouchableOpacity
                    style={styles.contactLinkRow}
                    activeOpacity={0.7}
                    onPress={() => handleOpenWebsite(activeTemple.contact?.website)}
                  >
                    <Text style={styles.contactLinkIcon}>🌐</Text>
                    <Text style={styles.contactLinkText}>
                      {activeTemple.contact.website.replace('https://', '')}
                    </Text>
                  </TouchableOpacity>
                )}
                {activeTemple.contact?.email && (
                  <View style={styles.contactLinkRow}>
                    <Text style={styles.contactLinkIcon}>✉️</Text>
                    <Text style={styles.contactPlainEmail}>
                      {activeTemple.contact.email}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* =========================================================================
              ACTION BUTTONS: [View Map]   [Call Temple]   [Watch Live Darshan]
             ========================================================================= */}
          <View style={styles.actionButtonsRow}>
            {/* View Map Button */}
            <TouchableOpacity
              style={[styles.actionButton, styles.mapButton]}
              activeOpacity={0.82}
              onPress={handleOpenMap}
            >
              <LinearGradient
                colors={['#173D32', '#173D32']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionGradient}
              >
                <MapPinIcon />
                <Text style={styles.actionButtonText}>
                  {UI_TRANSLATIONS.viewMap[langKey] || 'View Map'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Call Temple Button */}
            <TouchableOpacity
              style={[styles.actionButton, styles.callButton]}
              activeOpacity={0.82}
              onPress={handleCallTemple}
            >
              <LinearGradient
                colors={['#173D32', '#173D32']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionGradient}
              >
                <PhoneIcon />
                <Text style={styles.actionButtonText}>
                  {UI_TRANSLATIONS.callTemple[langKey] || 'Call Temple'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Optional: Watch Live Darshan Button */}
          {activeTemple.hasLiveDarshan && activeTemple.liveStreamId && onOpenLiveDarshan && (
            <TouchableOpacity
              style={styles.liveDarshanButton}
              activeOpacity={0.82}
              onPress={() =>
                onOpenLiveDarshan(activeTemple.liveStreamId!, activeTemple.name)
              }
            >
              <LinearGradient
                colors={['#C62828', '#173D32']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.liveGradient}
              >
                <LiveBroadcastIcon />
                <Text style={styles.liveButtonText}>
                  {UI_TRANSLATIONS.watchLive[langKey] || 'Watch Live Darshan'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5EB',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Hero Banner Section
  heroBannerContainer: {
    width: '100%',
    height: 238,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#0C251E',
  },
  heroImageCrop: {
    width: '100%',
    height: 480,
    position: 'absolute',
    left: 0,
  },
  heroGradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  heroHeaderSafeArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 10 : (StatusBar.currentHeight || 20) + 4,
    zIndex: 10,
  },
  heroBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.38)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  heroCornerOrnamentRight: {
    position: 'absolute',
    right: 4,
    top: Platform.OS === 'ios' ? 10 : (StatusBar.currentHeight || 20),
  },
  heroCornerOrnamentLeft: {
    position: 'absolute',
    left: 4,
    top: Platform.OS === 'ios' ? 10 : (StatusBar.currentHeight || 20),
  },
  heroBottomTextGroup: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 14,
    zIndex: 5,
  },
  heroTempleName: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF8E7',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 4,
  },
  heroTempleLocation: {
    fontFamily: Platform.select({ ios: 'Poppins-Regular', android: 'Poppins_400Regular', web: 'Poppins, sans-serif', default: 'Poppins_400Regular' }),
    fontSize: 13.5,
    fontWeight: '400',
    color: '#F7E7CE',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // Information Tabs
  tabsContainer: {
    backgroundColor: '#FFFDF9',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E8CD9C',
  },
  tabsScrollContent: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 6.5,
    borderRadius: 18,
    marginRight: 8,
    borderWidth: 1.2,
  },
  tabPillSelected: {
    backgroundColor: '#173D32',
    borderColor: '#D4AF37',
    elevation: 2,
    shadowColor: '#0C251E',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.25,
    shadowRadius: 2.5,
  },
  tabPillUnselected: {
    backgroundColor: '#FFF8ED',
    borderColor: '#E8CD9C',
  },
  tabPillText: {
    fontFamily: Platform.select({ ios: 'Poppins-Regular', android: 'Poppins_400Regular', web: 'Poppins, sans-serif', default: 'Poppins_400Regular' }),
    fontSize: 13.5,
  },
  tabPillTextSelected: {
    color: '#FFF8E7',
    fontWeight: '700',
  },
  tabPillTextUnselected: {
    color: '#173D32',
    fontWeight: '600',
  },

  // Content Card
  contentCard: {
    backgroundColor: '#FFF9F0',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#E8CD9C',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 14,
    padding: 16,
    elevation: 1.5,
    shadowColor: '#345147',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  sectionBlock: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E0CB',
  },
  sectionBlockLast: {
    marginBottom: 0,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  sectionHeading: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 16,
    fontWeight: '700',
    color: '#173D32',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  sectionParagraph: {
    fontFamily: Platform.select({ ios: 'Poppins-Regular', android: 'Poppins_400Regular', web: 'Poppins, sans-serif', default: 'Poppins_400Regular' }),
    fontSize: 13.5,
    lineHeight: 21,
    color: '#0C251E',
  },

  // Speciality Bullets
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 3.5,
  },
  bulletDot: {
    fontSize: 16,
    color: '#173D32',
    marginRight: 6,
    lineHeight: 20,
    fontWeight: '700',
  },
  bulletText: {
    flex: 1,
    fontFamily: Platform.select({ ios: 'Poppins-Regular', android: 'Poppins_400Regular', web: 'Poppins, sans-serif', default: 'Poppins_400Regular' }),
    fontSize: 13.5,
    lineHeight: 20,
    color: '#0C251E',
  },

  // Timings Rows
  timingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 3,
  },
  timingLabel: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 13.5,
    fontWeight: '700',
    color: '#345147',
    width: 110,
  },
  timingValue: {
    flex: 1,
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 13.5,
    color: '#0C251E',
    fontWeight: '700',
  },
  timingNotesText: {
    fontFamily: Platform.select({ ios: 'Poppins-Regular', android: 'Poppins_400Regular', web: 'Poppins, sans-serif', default: 'Poppins_400Regular' }),
    fontSize: 12.5,
    fontStyle: 'italic',
    color: '#345147',
    marginTop: 6,
    lineHeight: 18,
  },
  confirmNoticeText: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 12,
    color: '#173D32',
    marginTop: 8,
    fontWeight: '700',
  },

  // Contact Info
  contactAddressText: {
    fontFamily: Platform.select({ ios: 'Poppins-Regular', android: 'Poppins_400Regular', web: 'Poppins, sans-serif', default: 'Poppins_400Regular' }),
    fontSize: 13.5,
    lineHeight: 20,
    color: '#0C251E',
    marginBottom: 8,
  },
  contactLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  contactLinkIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  contactLinkText: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 13.5,
    color: '#173D32',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  contactPlainEmail: {
    fontFamily: Platform.select({ ios: 'Poppins-Regular', android: 'Poppins_400Regular', web: 'Poppins, sans-serif', default: 'Poppins_400Regular' }),
    fontSize: 13.5,
    color: '#345147',
  },

  // Action Buttons
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#0C251E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  mapButton: {
    marginRight: 8,
  },
  callButton: {
    marginLeft: 8,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 24,
  },
  actionButtonText: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFF8E7',
    marginLeft: 8,
    letterSpacing: 0.3,
  },

  // Live Darshan Button
  liveDarshanButton: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  liveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: '#FFD700',
  },
  liveButtonText: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
    letterSpacing: 0.4,
  },
});

