import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Linking,
  ActivityIndicator,
  BackHandler,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { SupportedLanguage, AnnadanamLocation, AnnadanamCampaign } from '../../../types';
import { ApiService } from '../../../services/api';
import { MASTER_ANNADANAM_LOCATIONS, MASTER_ANNADANAM_CAMPAIGNS } from '../../../data/donationsData';

interface Props {
  currentLanguage: SupportedLanguage;
  initialTab?: 'locations' | 'contribute';
  onBack: () => void;
  onNavigateToDonations?: () => void;
}

// Corner Filigree Ornaments for Header and Banner
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

// Green Clock Icon
const ClockIcon = () => (
  <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke="#2E7D32" strokeWidth={2} />
    <Path d="M12 7v5l3 3" stroke="#2E7D32" strokeWidth={2} strokeLinecap="round" />
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

// Phone Icon
const PhoneIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z"
      fill="#FFFDF8"
    />
  </Svg>
);

// Multilingual labels
const UI_TRANSLATIONS: Record<string, Record<string, string>> = {
  screenTitle: {
    en: 'Food Donation (Annadanam)',
    te: 'అన్నదానం (ఆహార దానం)',
    kn: 'ಅನ್ನದಾನ (ಆಹಾರ ದಾನ)',
    ta: 'அன்னதானம் (உணவு தானம்)',
    hi: 'अन्नदान (भोजन दान)',
    ml: 'അന്നദാനം (ഭക്ഷണ ദാനം)',
  },
  heroHeading: {
    en: 'Annadanam\nis the Greatest Seva',
    te: 'అన్నదానం\nఅన్ని దానములలోకి శ్రేష్ఠమైనది',
    kn: 'ಅನ್ನದಾನವೇ\nಮಹಾದಾನ',
    ta: 'அன்னதானமே\nசிறந்த புண்ணிய சேவை',
    hi: 'अन्नदान\nमहादान है',
    ml: 'അന്നദാനം\nമഹാപുണ്യ സേവനം',
  },
  heroSubtitle: {
    en: 'Feed a Devotee  •  Serve the Divine',
    te: 'భక్తునికి అన్నం పెట్టడం • దైవ సేవతో సమానం',
    kn: 'ಭಕ್ತರಿಗೆ ಅನ್ನ ಸೇವೆ • ದೈವ ಸೇವೆ',
    ta: 'பக்தருக்கு உணவளிப்போம் • இறைவனை அடைவோம்',
    hi: 'भक्तों को भोजन कराएं • प्रभु सेवा पाएं',
    ml: 'ഭക്തന് അന്നമേകുക • ഈശ്വരനെ സേവിക്കുക',
  },
  todayLocationsTab: {
    en: "Today's Locations",
    te: 'నేటి కేంద్రాలు',
    kn: 'ಇಂದಿನ ಕೇಂದ್ರಗಳು',
    ta: 'இன்றைய இடங்கள்',
    hi: 'आज के केंद्र',
    ml: 'ഇന്നത്തെ സ്ഥലങ്ങൾ',
  },
  contributeNowTab: {
    en: 'Contribute Now',
    te: 'విరాళం ఇవ్వండి',
    kn: 'ದೇಣಿಗೆ ನೀಡಿ',
    ta: 'நன்கொடை அளியுங்கள்',
    hi: 'सहयोग करें',
    ml: 'സംഭാവന ചെയ്യുക',
  },
  openStatus: {
    en: 'Open',
    te: 'తెరిచి ఉంది',
    kn: 'ತೆರೆದಿದೆ',
    ta: 'திறந்துள்ளது',
    hi: 'खुला है',
    ml: 'തുറന്നിരിക്കുന്നു',
  },
  viewButton: {
    en: 'View',
    te: 'చూడండి',
    kn: 'ನೋಡಿ',
    ta: 'காண்க',
    hi: 'देखें',
    ml: 'കാണുക',
  },
  getDirections: {
    en: 'Get Directions',
    te: 'దారి చూపించు (మ్యాప్)',
    kn: 'ದಿಕ್ಕುಗಳನ್ನು ಪಡೆಯಿರಿ',
    ta: 'வழித்தடம் காண்க',
    hi: 'दिशा-निर्देश प्राप्त करें',
    ml: 'വഴി കാണുക',
  },
  contactCenter: {
    en: 'Contact Center',
    te: 'కేంద్రాన్ని సంప్రదించండి',
    kn: 'ಕೇಂದ್ರವನ್ನು ಸಂಪರ್ಕಿಸಿ',
    ta: 'மையத்தைத் தொடர்பு கொள்ள',
    hi: 'केंद्र से संपर्क करें',
    ml: 'ബന്ധപ്പെടുക',
  },
  officialTrustNote: {
    en: 'Official Temple Trust Account Details',
    te: 'అధికారిక దేవస్థానం ట్రస్ట్ ఖాతా వివరాలు',
    kn: 'ಅಧಿಕೃತ ದೇವಾಲಯ ಟ್ರಸ್ಟ್ ಖಾತೆ ವಿವರಗಳು',
    ta: 'அதிகாரப்பூர்வ அறக்கட்டளை கணக்கு விவரங்கள்',
    hi: 'आधिकारिक मंदिर ट्रस्ट खाता विवरण',
    ml: 'ഔദ്യോഗിക ട്രസ്റ്റ് അക്കൗണ്ട് വിവരങ്ങൾ',
  },
  gatewayNotice: {
    en: 'Direct in-app payment gateway integration is currently onboarding with verified banking partners. Devotees may contribute directly through the authorized official temple devaswom trusts listed below.',
    te: 'యాప్‌లో నేరుగా చెల్లింపు గేట్‌వే బ్యాంకింగ్ భాగస్వాములతో పరిశీలనలో ఉంది. భక్తులు క్రింద పేర్కొన్న అధికారిక దేవస్థానం ట్రస్టుల ద్వారా నేరుగా విరాళాలు సమర్పించవచ్చు.',
    kn: 'ಅಪ್ಲಿಕೇಶನ್‌ನಲ್ಲಿ ನೇರ ಪಾವತಿ ಗೇಟ್‌ವೇ ಪ್ರಕ್ರಿಯೆ ಪ್ರಗತಿಯಲ್ಲಿದೆ. ಭಕ್ತರು ಕೆಳಗೆ ಪಟ್ಟಿ ಮಾಡಲಾದ ಅಧಿಕೃತ ದೇವಾಲಯ ಟ್ರಸ್ಟ್‌ಗಳ ಮೂಲಕ ನೇರವಾಗಿ ದೇಣಿಗೆ ನೀಡಬಹುದು.',
    ta: 'நேரடி கட்டண முறை வங்கி சரிபார்ப்பில் உள்ளது. பக்தர்கள் கீழே பட்டியலிடப்பட்டுள்ள அதிகாரப்பூர்வ தேவஸ்தான அறக்கட்டளைகள் மூலம் நேரடியாக பங்களிக்கலாம்.',
    hi: 'ऐप में सीधे ऑनलाइन भुगतान गेटवे बैंक सत्यापन के अधीन है। श्रद्धालु नीचे दिए गए आधिकारिक मंदिर देवस्थानम ट्रस्टों के माध्यम से सीधे सहयोग कर सकते हैं।',
    ml: 'നേരിട്ടുള്ള പെയ്മെന്റ് ഗേറ്റ്‌വേ ബാങ്കിംഗ് പരിശോധനയിലാണ്. ഭക്തർക്ക് താഴെ പറയുന്ന ഔദ്യോഗിക ദേവസ്വം ട്രസ്റ്റുകൾ വഴി നേരിട്ട് സംഭാവന ചെയ്യാം.',
  },
};

export const FoodDonationScreen: React.FC<Props> = ({
  currentLanguage,
  initialTab = 'locations',
  onBack,
  onNavigateToDonations,
}) => {
  const [activeTab, setActiveTab] = useState<'locations' | 'contribute'>(initialTab);
  const [locations, setLocations] = useState<AnnadanamLocation[]>(MASTER_ANNADANAM_LOCATIONS);
  const [campaigns, setCampaigns] = useState<AnnadanamCampaign[]>(MASTER_ANNADANAM_CAMPAIGNS);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<AnnadanamLocation | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<AnnadanamCampaign | null>(null);

  // Android Back Handler
  useEffect(() => {
    if (!onBack) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (selectedLocation || selectedCampaign) {
        setSelectedLocation(null);
        setSelectedCampaign(null);
        return true;
      }
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [onBack, selectedLocation, selectedCampaign]);

  // Load locations and campaigns
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [locs, camps] = await Promise.all([
          ApiService.getAnnadanamLocations(currentLanguage),
          ApiService.getAnnadanamCampaigns(currentLanguage),
        ]);
        if (isMounted) {
          setLocations(locs);
          setCampaigns(camps);
        }
      } catch (e) {
        if (isMounted) {
          setLocations(MASTER_ANNADANAM_LOCATIONS);
          setCampaigns(MASTER_ANNADANAM_CAMPAIGNS);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [currentLanguage]);

  const langKey = currentLanguage in UI_TRANSLATIONS.screenTitle ? currentLanguage : 'en';

  // Open Directions in native maps
  const handleGetDirections = (loc: AnnadanamLocation) => {
    const lat = loc.latitude;
    const lng = loc.longitude;
    const label = encodeURIComponent(loc.name);

    if (lat && lng) {
      const scheme = Platform.select({
        ios: `maps:0,0?q=${label}@${lat},${lng}`,
        android: `geo:${lat},${lng}?q=${lat},${lng}(${label})`,
      });
      const webUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

      if (scheme) {
        Linking.canOpenURL(scheme)
          .then((supported) => {
            if (supported) return Linking.openURL(scheme);
            return Linking.openURL(webUrl);
          })
          .catch(() => Linking.openURL(webUrl));
      } else {
        Linking.openURL(webUrl);
      }
    } else {
      const queryUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${loc.name}, ${loc.city}, ${loc.state}`
      )}`;
      Linking.openURL(queryUrl);
    }
  };

  // Call organizer
  const handleCallCenter = (phone?: string) => {
    if (!phone) {
      Alert.alert('Contact', 'Phone number is not currently listed for this center.');
      return;
    }
    const cleanNumber = phone.replace(/[^\d+]/g, '');
    Linking.openURL(`tel:${cleanNumber}`).catch(() => {
      Alert.alert('Call', `Unable to initiate call to: ${phone}`);
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#173D32" />

      {/* =========================================================================
          1. DEVOTIONAL HEADER: Food Donation (Annadanam)
         ========================================================================= */}
      <LinearGradient
        colors={['#173D32', '#173D32', '#173D32']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <SafeAreaView style={styles.headerSafeArea}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={onBack}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <BackArrowIcon />
          </TouchableOpacity>

          {/* Screen Title */}
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {UI_TRANSLATIONS.screenTitle[langKey] || 'Food Donation (Annadanam)'}
            </Text>
          </View>

          {/* Corner Filigrees */}
          <View style={styles.headerRightOrnament}>
            <HeaderCornerFiligree flipped />
          </View>
          <View style={styles.filigreeTopLeft}>
            <HeaderCornerFiligree />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Main Scroll Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* =========================================================================
            2. ANNADANAM HERO BANNER: "Annadanam is the Greatest Seva"
           ========================================================================= */}
        <View style={styles.heroBannerWrapper}>
          <LinearGradient
            colors={['#173D32', '#173D32', '#2E7561']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBanner}
          >
            {/* Top-Right & Top-Left Corner Ornaments */}
            <View style={styles.heroCornerTopRight}>
              <HeaderCornerFiligree flipped />
            </View>
            <View style={styles.heroCornerTopLeft}>
              <HeaderCornerFiligree />
            </View>

            {/* Sacred Lamp Motif Accent */}
            <View style={styles.heroLampAccent}>
              <Text style={styles.heroLampIcon}>🪔</Text>
            </View>

            {/* Heading & Subtitle */}
            <Text style={styles.heroHeadingText}>
              {UI_TRANSLATIONS.heroHeading[langKey] || 'Annadanam\nis the Greatest Seva'}
            </Text>
            <Text style={styles.heroSubtitleText}>
              {UI_TRANSLATIONS.heroSubtitle[langKey] || 'Feed a Devotee  •  Serve the Divine'}
            </Text>
          </LinearGradient>
        </View>

        {/* =========================================================================
            3. TWO MAIN TABS: Today's Locations | Contribute Now
           ========================================================================= */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabsPillCard}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'locations' ? styles.tabButtonSelected : styles.tabButtonUnselected,
              ]}
              activeOpacity={0.8}
              onPress={() => setActiveTab('locations')}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === 'locations'
                    ? styles.tabButtonTextSelected
                    : styles.tabButtonTextUnselected,
                ]}
              >
                {UI_TRANSLATIONS.todayLocationsTab[langKey] || "Today's Locations"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'contribute' ? styles.tabButtonSelected : styles.tabButtonUnselected,
              ]}
              activeOpacity={0.8}
              onPress={() => setActiveTab('contribute')}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === 'contribute'
                    ? styles.tabButtonTextSelected
                    : styles.tabButtonTextUnselected,
                ]}
              >
                {UI_TRANSLATIONS.contributeNowTab[langKey] || 'Contribute Now'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* =========================================================================
            4. TAB 1: TODAY'S FOOD DONATION LOCATIONS
           ========================================================================= */}
        {activeTab === 'locations' && (
          <View style={styles.locationsListContainer}>
            {loading && locations.length === 0 ? (
              <View style={styles.centerLoading}>
                <ActivityIndicator size="small" color="#173D32" />
              </View>
            ) : (
              locations.map((loc) => {
                const localizedLocName =
                  (loc.localNames && loc.localNames[currentLanguage]) || loc.name;

                return (
                  <TouchableOpacity
                    key={loc.id}
                    style={styles.locationCard}
                    activeOpacity={0.88}
                    onPress={() => setSelectedLocation(loc)}
                  >
                    {/* Left & Center Information */}
                    <View style={styles.cardInfoCol}>
                      <Text style={styles.centerNameText} numberOfLines={1}>
                        {localizedLocName}
                      </Text>
                      <Text style={styles.centerSubLocationText}>
                        • {loc.locationLabel}
                      </Text>

                      {/* Time Row */}
                      <View style={styles.timeRow}>
                        <ClockIcon />
                        <Text style={styles.timeRowText}>{loc.servingTime}</Text>
                      </View>
                    </View>

                    {/* Right Side: Status Badge + View Button */}
                    <View style={styles.cardActionCol}>
                      <View style={styles.statusBadge}>
                        <Text style={styles.statusBadgeText}>
                          {UI_TRANSLATIONS.openStatus[langKey] || 'Open'}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={styles.viewButton}
                        activeOpacity={0.8}
                        onPress={() => setSelectedLocation(loc)}
                      >
                        <Text style={styles.viewButtonText}>
                          {UI_TRANSLATIONS.viewButton[langKey] || 'View'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {/* =========================================================================
            5. TAB 2: CONTRIBUTE NOW (GENUINE TRUST CAMPAIGNS)
           ========================================================================= */}
        {activeTab === 'contribute' && (
          <View style={styles.contributeContainer}>
            {/* Transparent Notice */}
            <View style={styles.noticeCard}>
              <Text style={styles.noticeTitle}>ℹ️ Direct Devotional Seva</Text>
              <Text style={styles.noticeBody}>
                {UI_TRANSLATIONS.gatewayNotice[langKey] ||
                  'Direct in-app payment gateway integration is currently onboarding with verified banking partners. Devotees may contribute directly through the authorized official temple devaswom trusts listed below.'}
              </Text>
            </View>

            {campaigns.map((camp) => (
              <View key={camp.id} style={styles.campaignCard}>
                <Text style={styles.campaignTitle}>{camp.title}</Text>
                <Text style={styles.campaignOrganizer}>
                  Managed by: {camp.organizer}
                </Text>
                <Text style={styles.campaignDesc}>{camp.description}</Text>

                {/* Recommended Amounts */}
                <View style={styles.amountsRow}>
                  {camp.recommendedAmounts.map((amt) => (
                    <View key={amt} style={styles.amountPill}>
                      <Text style={styles.amountPillText}>₹{amt}</Text>
                    </View>
                  ))}
                </View>

                {/* View Official Account Details */}
                <TouchableOpacity
                  style={styles.detailsButton}
                  activeOpacity={0.8}
                  onPress={() => setSelectedCampaign(camp)}
                >
                  <LinearGradient
                    colors={['#173D32', '#173D32']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.detailsGradient}
                  >
                    <Text style={styles.detailsButtonText}>
                      {UI_TRANSLATIONS.officialTrustNote[langKey] ||
                        'Official Temple Trust Details'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* =========================================================================
          6. LOCATION DETAIL MODAL
         ========================================================================= */}
      <Modal
        visible={!!selectedLocation}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedLocation(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedLocation(null)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            {selectedLocation && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle} numberOfLines={1}>
                    {selectedLocation.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setSelectedLocation(null)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.modalCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <Text style={styles.modalTempleName}>
                    {selectedLocation.templeName}
                  </Text>

                  <View style={styles.modalStatusRow}>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusBadgeText}>
                        {UI_TRANSLATIONS.openStatus[langKey] || 'Open'}
                      </Text>
                    </View>
                    <Text style={styles.modalTimeText}>
                      ⏰ {selectedLocation.servingTime}
                    </Text>
                  </View>

                  <Text style={styles.modalSectionHeading}>Distribution Address:</Text>
                  <Text style={styles.modalAddressText}>
                    {selectedLocation.address}
                  </Text>

                  <Text style={styles.modalSectionHeading}>Organized By:</Text>
                  <Text style={styles.modalOrganizerText}>
                    {selectedLocation.organizer}
                  </Text>

                  {selectedLocation.notes && (
                    <Text style={styles.modalNotesText}>
                      ℹ️ {selectedLocation.notes}
                    </Text>
                  )}
                </ScrollView>

                {/* Modal Action Buttons */}
                <View style={styles.modalActionsRow}>
                  <TouchableOpacity
                    style={[styles.modalActionBtn, styles.directionsBtn]}
                    activeOpacity={0.82}
                    onPress={() => handleGetDirections(selectedLocation)}
                  >
                    <LinearGradient
                      colors={['#173D32', '#173D32']}
                      style={styles.modalActionGradient}
                    >
                      <MapPinIcon />
                      <Text style={styles.modalActionText}>
                        {UI_TRANSLATIONS.getDirections[langKey] || 'Directions'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  {selectedLocation.contactPhone && (
                    <TouchableOpacity
                      style={[styles.modalActionBtn, styles.callBtn]}
                      activeOpacity={0.82}
                      onPress={() => handleCallCenter(selectedLocation.contactPhone)}
                    >
                      <LinearGradient
                        colors={['#173D32', '#173D32']}
                        style={styles.modalActionGradient}
                      >
                        <PhoneIcon />
                        <Text style={styles.modalActionText}>
                          {UI_TRANSLATIONS.contactCenter[langKey] || 'Call'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* =========================================================================
          7. CAMPAIGN DETAILS MODAL
         ========================================================================= */}
      <Modal
        visible={!!selectedCampaign}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedCampaign(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedCampaign(null)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            {selectedCampaign && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle} numberOfLines={1}>
                    {selectedCampaign.title}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setSelectedCampaign(null)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.modalCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <Text style={styles.modalTempleName}>
                    {selectedCampaign.templeName}
                  </Text>
                  <Text style={styles.campaignModalDesc}>
                    {selectedCampaign.description}
                  </Text>

                  <View style={styles.officialAccountCard}>
                    <Text style={styles.officialAccountTitle}>
                      🏛️ Official Contribution Channels
                    </Text>
                    <Text style={styles.officialAccountDesc}>
                      {selectedCampaign.officialAccountInfo}
                    </Text>
                  </View>

                  <Text style={styles.suggestedAmountsHeading}>
                    Recommended Seva Amounts:
                  </Text>
                  <View style={styles.amountsRow}>
                    {selectedCampaign.recommendedAmounts.map((amt) => (
                      <View key={amt} style={styles.amountPill}>
                        <Text style={styles.amountPillText}>₹{amt}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>

                <TouchableOpacity
                  style={styles.closeFullButton}
                  onPress={() => setSelectedCampaign(null)}
                >
                  <Text style={styles.closeFullButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5EB',
  },

  // Header styles
  header: {
    height: Platform.OS === 'ios' ? 96 : (StatusBar.currentHeight || 20) + 64,
    paddingTop: Platform.OS === 'ios' ? 38 : StatusBar.currentHeight || 18,
    borderBottomWidth: 1.5,
    borderBottomColor: '#D4AF37',
    elevation: 6,
    shadowColor: '#0C251E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
  },
  headerSafeArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerBackButton: {
    position: 'absolute',
    left: 14,
    zIndex: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 54,
  },
  headerTitle: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF8E7',
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  headerRightOrnament: {
    position: 'absolute',
    right: 4,
    top: 2,
    zIndex: 5,
  },
  filigreeTopLeft: {
    position: 'absolute',
    left: 4,
    top: 2,
    zIndex: 5,
  },

  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // Hero Banner: "Annadanam is the Greatest Seva"
  heroBannerWrapper: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 10,
  },
  heroBanner: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    paddingVertical: 18,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#0C251E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  heroCornerTopRight: {
    position: 'absolute',
    right: 2,
    top: 2,
  },
  heroCornerTopLeft: {
    position: 'absolute',
    left: 2,
    top: 2,
  },
  heroLampAccent: {
    marginBottom: 4,
  },
  heroLampIcon: {
    fontSize: 20,
  },
  heroHeadingText: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFDF8',
    textAlign: 'center',
    lineHeight: 26,
    letterSpacing: 0.4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 3,
  },
  heroSubtitleText: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 13,
    fontWeight: '700',
    color: '#FFE8B8',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 0.2,
  },

  // Tabs: Today's Locations | Contribute Now
  tabsContainer: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  tabsPillCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFDF9',
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: '#E8CD9C',
    padding: 3.5,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonSelected: {
    backgroundColor: '#173D32',
    elevation: 2,
    shadowColor: '#0C251E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  tabButtonUnselected: {
    backgroundColor: 'transparent',
  },
  tabButtonText: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 13.5,
  },
  tabButtonTextSelected: {
    color: '#FFF8E7',
    fontWeight: '700',
  },
  tabButtonTextUnselected: {
    color: '#345147',
    fontWeight: '600',
  },

  // Locations List
  locationsListContainer: {
    paddingHorizontal: 16,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF9F0',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#E8CD9C',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginVertical: 5.5,
    elevation: 1.8,
    shadowColor: '#345147',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardInfoCol: {
    flex: 1,
    paddingRight: 10,
  },
  centerNameText: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0C251E',
    letterSpacing: 0.2,
  },
  centerSubLocationText: {
    fontFamily: Platform.select({ ios: 'Poppins-Regular', android: 'Poppins_400Regular', web: 'Poppins, sans-serif', default: 'Poppins_400Regular' }),
    fontSize: 13,
    color: '#345147',
    fontWeight: '400',
    marginTop: 2.5,
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeRowText: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 12.5,
    color: '#0C251E',
    fontWeight: '700',
    marginLeft: 6,
  },
  cardActionCol: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 58,
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2.5,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  statusBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#2E7D32',
  },
  viewButton: {
    backgroundColor: '#173D32',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 4.5,
    elevation: 1,
  },
  viewButtonText: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFDF8',
  },

  // Contribute Tab
  contributeContainer: {
    paddingHorizontal: 16,
  },
  noticeCard: {
    backgroundColor: '#FFF2DB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8CD9C',
    padding: 14,
    marginBottom: 12,
  },
  noticeTitle: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 14.5,
    fontWeight: '700',
    color: '#173D32',
    marginBottom: 4,
  },
  noticeBody: {
    fontFamily: Platform.select({ ios: 'Poppins-Regular', android: 'Poppins_400Regular', web: 'Poppins, sans-serif', default: 'Poppins_400Regular' }),
    fontSize: 12.5,
    color: '#345147',
    lineHeight: 18,
  },
  campaignCard: {
    backgroundColor: '#FFF9F0',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#E8CD9C',
    padding: 14,
    marginVertical: 6,
    elevation: 1.5,
    shadowColor: '#345147',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  campaignTitle: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 16,
    fontWeight: '700',
    color: '#0C251E',
  },
  campaignOrganizer: {
    fontSize: 12.5,
    color: '#173D32',
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 6,
  },
  campaignDesc: {
    fontFamily: Platform.select({ ios: 'Poppins-Regular', android: 'Poppins_400Regular', web: 'Poppins, sans-serif', default: 'Poppins_400Regular' }),
    fontSize: 13,
    color: '#0C251E',
    lineHeight: 19,
    marginBottom: 10,
  },
  amountsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 4,
  },
  amountPill: {
    backgroundColor: '#FFF2DB',
    borderWidth: 1,
    borderColor: '#E8CD9C',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 6,
  },
  amountPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#173D32',
  },
  detailsButton: {
    marginTop: 8,
    borderRadius: 18,
    overflow: 'hidden',
  },
  detailsGradient: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  detailsButtonText: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFDF8',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '75%',
    backgroundColor: '#FFFDF9',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E8CD9C',
    padding: 18,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E0CB',
  },
  modalTitle: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 17,
    fontWeight: '700',
    color: '#0C251E',
    flex: 1,
    marginRight: 8,
  },
  modalCloseText: {
    fontSize: 18,
    color: '#173D32',
    fontWeight: '700',
    padding: 4,
  },
  modalBody: {
    marginTop: 10,
    marginBottom: 14,
  },
  modalTempleName: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 14,
    fontWeight: '700',
    color: '#173D32',
    marginBottom: 8,
  },
  modalStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTimeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0C251E',
    marginLeft: 10,
  },
  modalSectionHeading: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 13,
    fontWeight: '700',
    color: '#345147',
    marginTop: 6,
    marginBottom: 2,
  },
  modalAddressText: {
    fontFamily: Platform.select({ ios: 'Poppins-Regular', android: 'Poppins_400Regular', web: 'Poppins, sans-serif', default: 'Poppins_400Regular' }),
    fontSize: 13,
    lineHeight: 19,
    color: '#0C251E',
    marginBottom: 6,
  },
  modalOrganizerText: {
    fontFamily: Platform.select({ ios: 'Poppins-Regular', android: 'Poppins_400Regular', web: 'Poppins, sans-serif', default: 'Poppins_400Regular' }),
    fontSize: 13,
    color: '#0C251E',
    marginBottom: 6,
  },
  modalNotesText: {
    fontSize: 12,
    color: '#345147',
    fontStyle: 'italic',
    marginTop: 6,
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  modalActionBtn: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  directionsBtn: {
    marginRight: 6,
  },
  callBtn: {
    marginLeft: 6,
  },
  modalActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  modalActionText: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFF8E7',
    marginLeft: 6,
  },
  campaignModalDesc: {
    fontFamily: Platform.select({ ios: 'Poppins-Regular', android: 'Poppins_400Regular', web: 'Poppins, sans-serif', default: 'Poppins_400Regular' }),
    fontSize: 13.5,
    lineHeight: 20,
    color: '#0C251E',
    marginBottom: 12,
  },
  officialAccountCard: {
    backgroundColor: '#FFF2DB',
    borderWidth: 1,
    borderColor: '#E8CD9C',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  officialAccountTitle: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 13.5,
    fontWeight: '700',
    color: '#173D32',
    marginBottom: 4,
  },
  officialAccountDesc: {
    fontSize: 12.5,
    color: '#345147',
    lineHeight: 18,
  },
  suggestedAmountsHeading: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 13,
    fontWeight: '700',
    color: '#345147',
    marginBottom: 4,
  },
  closeFullButton: {
    backgroundColor: '#173D32',
    borderRadius: 18,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  closeFullButtonText: {
    color: '#FFFDF8',
    fontWeight: '700',
    fontSize: 14,
  },

  centerLoading: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

