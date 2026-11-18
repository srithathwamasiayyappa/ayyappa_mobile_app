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
  BackHandler,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { ApiService } from '../../../services/api';
import { SupportedLanguage } from '../../../types';

interface Props {
  currentLanguage: SupportedLanguage;
  initialTab?: 'terms' | 'privacy' | 'refund';
  onBack: () => void;
}

// Corner Filigree Ornaments for Header
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

// Back Arrow Icon
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

// Golden Lotus Ornament Divider
const GoldenLotusDivider = () => (
  <View style={styles.lotusDividerContainer}>
    <View style={styles.lotusLine} />
    <Svg width={28} height={18} viewBox="0 0 28 18" fill="none">
      <Path
        d="M14 2 C11 7 10 10 10 13 C10 15.5 11.8 17 14 17 C16.2 17 18 15.5 18 13 C18 10 17 7 14 2 Z"
        fill="#DFA62E"
      />
      <Path
        d="M6 9 C6 13 9 15 11 15 C10 13 9 10 9 8 C7 8 6 8.5 6 9 Z"
        fill="#DFA62E"
      />
      <Path
        d="M22 9 C22 13 19 15 17 15 C18 13 19 10 19 8 C21 8 22 8.5 22 9 Z"
        fill="#DFA62E"
      />
      <Circle cx="14" cy="13" r="1.5" fill="#FFFDF8" />
    </Svg>
    <View style={styles.lotusLine} />
  </View>
);

// Numbered Circle Badge (1, 2, 3...)
const NumberBadge = ({ num }: { num: number }) => (
  <View style={styles.numberBadgeWrapper}>
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10.5" stroke="#E67E22" strokeWidth={1.5} fill="#FFF9F0" />
    </Svg>
    <Text style={styles.numberBadgeText}>{num}</Text>
  </View>
);

// Multilingual Dictionary
const LEGAL_I18N: Record<string, Record<string, string>> = {
  headerTitle: {
    en: 'Legal (Conditions)',
    te: 'చట్టపరమైన నిబంధనలు (షరతులు)',
    kn: 'ಕಾನೂನು ನಿಯಮಗಳು (ಷರತ್ತುಗಳು)',
    ta: 'சட்ட விதிமுறைகள் (நிபந்தனைகள்)',
    hi: 'कानूनी नियम एवं शर्तें',
    ml: 'നിയമ നിബന്ധനകൾ',
  },
  termsTab: {
    en: 'Terms & Conditions',
    te: 'నిబంధనలు & షరతులు',
    kn: 'ನಿಯಮಗಳು & ಷರತ್ತುಗಳು',
    ta: 'விதிமுறைகள் & நிபந்தனைகள்',
    hi: 'नियम एवं शर्तें',
    ml: 'നിബന്ധനകളും വ്യവസ്ഥകളും',
  },
  privacyTab: {
    en: 'Privacy Policy',
    te: 'గోప్యతా విధానం',
    kn: 'ಗೌಪ್ಯತಾ ನೀತಿ',
    ta: 'தனியுரிமைக் கொள்கை',
    hi: 'गोपनीयता नीति',
    ml: 'സ്വകാര്യതാ നയം',
  },
  refundTab: {
    en: 'Refund Policy',
    te: 'రీఫండ్ విధానం',
    kn: 'ಮರುಪಾವತಿ ನೀತಿ',
    ta: 'ரீஃபண்ட் கொள்கை',
    hi: 'वापसी नीति',
    ml: 'റീഫണ്ട് നയം',
  },
  lastUpdated: {
    en: 'Last updated: 14 Jan 2025',
    te: 'చివరిగా నవీకరించబడింది: 14 జనవరి 2025',
    kn: 'ಕೊನೆಯದಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ: 14 ಜನವರಿ 2025',
    ta: 'கடைசியாக புதுப்பிக்கப்பட்டது: 14 ஜனவரி 2025',
    hi: 'अंतिम अद्यतन: 14 जनवरी 2025',
    ml: 'അവസാനം പുതുക്കിയത്: 14 ജനുവരി 2025',
  },
  termsTitle: {
    en: 'Terms & Conditions',
    te: 'నిబంధనలు & షరతులు',
    kn: 'ನಿಯಮಗಳು & ಷರತ್ತುಗಳು',
    ta: 'விதிமுறைகள் & நிபந்தனைகள்',
    hi: 'नियम एवं शर्तें',
    ml: 'നിബന്ധനകളും വ്യവസ്ഥകളും',
  },
  privacyTitle: {
    en: 'Privacy Policy',
    te: 'గోప్యతా విధానం',
    kn: 'ಗೌಪ್ಯತಾ ನೀತಿ',
    ta: 'தனியுரிமைக் கொள்கை',
    hi: 'गोपनीयता नीति',
    ml: 'സ്വകാര്യതാ നയം',
  },
  refundTitle: {
    en: 'Refund Policy',
    te: 'రీఫండ్ విధానం',
    kn: 'ಮರುಪಾವತಿ ನೀತಿ',
    ta: 'ரீஃபண்ட் கொள்கை',
    hi: 'वापसी नीति',
    ml: 'റീഫണ്ട് നയം',
  },
  privacyPreviewText: {
    en: 'We respect your privacy. Please read our Privacy Policy to know how we collect, use, and protect your information.',
    te: 'మేము మీ గోప్యతను గౌరవిస్తాము. మేము మీ సమాచారాన్ని ఎలా సేకరిస్తాము, ఉపయోగిస్తాము మరియు రక్షిస్తాము అనే వివరాల కోసం మా గోప్యతా విధానాన్ని చదవండి.',
    kn: 'ನಾವು ನಿಮ್ಮ ಗೌಪ್ಯತೆಯನ್ನು ಗೌರವಿಸುತ್ತೇವೆ. ನಿಮ್ಮ ಮಾಹಿತಿಯನ್ನು ನಾವು ಹೇಗೆ ಸಂಗ್ರಹಿಸುತ್ತೇವೆ, ಬಳಸುತ್ತೇವೆ ಮತ್ತು ರಕ್ಷಿಸುತ್ತೇವೆ ಎಂಬುದನ್ನು ತಿಳಿಯಲು ಗೌಪ್ಯತಾ ನೀತಿಯನ್ನು ಓದಿ.',
    ta: 'உங்கள் தனியுரிமையை நாங்கள் மதிக்கிறோம். உங்கள் தகவல்களை எவ்வாறு சேகரிக்கிறோம், பயன்படுத்துகிறோம் மற்றும் பாதுகாக்கிறோம் என்பதை அறிய எங்கள் தனியுரிமைக் கொள்கையைப் படிக்கவும்.',
    hi: 'हम आपकी गोपनीयता का सम्मान करते हैं। हम आपकी जानकारी कैसे एकत्र, उपयोग और सुरक्षित रखते हैं, यह जानने के लिए हमारी गोपनीयता नीति पढ़ें।',
    ml: 'നിങ്ങളുടെ സ്വകാര്യതയെ ഞങ്ങൾ മാനിക്കുന്നു. നിങ്ങളുടെ വിവരങ്ങൾ ഞങ്ങൾ എങ്ങനെ ശേഖരിക്കുകയും സംരക്ഷിക്കുകയും ചെയ്യുന്നുവെന്ന് അറിയാൻ സ്വകാര്യതാ നയം വായിക്കുക.',
  },
  termsPreviewText: {
    en: 'By using Saranam Ayyappa app, you agree to comply with our sacred terms and code of devotional conduct. Tap to view full terms.',
    te: 'శరణం అయ్యప్ప యాప్‌ను ఉపయోగించడం ద్వారా, మీరు మా పవిత్ర నిబంధనలు మరియు ఆధ్యాత్మిక ప్రవర్తనా నియమావళికి కట్టుబడి ఉండటానికి అంగీకరిస్తున్నారు.',
    kn: 'ಶರಣಂ ಅಯ್ಯಪ್ಪ ಅಪ್ಲಿಕೇಶನ್ ಬಳಸುವ ಮೂಲಕ, ನೀವು ನಮ್ಮ ಪವಿತ್ರ ನಿಯಮಗಳು ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ನಡತೆಯ ಸಂಹಿತೆಗೆ ಬದ್ಧರಾಗಿರಲು ಒಪ್ಪುತ್ತೀರಿ.',
    ta: 'சரணம் ஐயப்பா செயலியைப் பயன்படுத்துவதன் மூலம், எங்கள் புனித விதிமுறைகளைப் பின்பற்ற ஒப்புக்கொள்கிறீர்கள்.',
    hi: 'शरणम अय्यप्पा ऐप का उपयोग करके, आप हमारे पावन नियमों और आचार संहिता का पालन करने के लिए सहमत होते हैं।',
    ml: 'ശരണം അയ്യപ്പ ആപ്പ് ഉപയോഗിക്കുന്നതിലൂടെ, നിങ്ങൾ ഞങ്ങളുടെ നിയമങ്ങളും നിർദ്ദേശങ്ങളും പാലിക്കാൻ ബാധ്യസ്ഥരാണ്.',
  },
};

export const LegalScreen: React.FC<Props> = ({
  currentLanguage,
  initialTab = 'terms',
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'refund'>(initialTab);
  const [cmsContent, setCmsContent] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loadingCms, setLoadingCms] = useState<boolean>(true);

  const t = (key: string): string => {
    const dict = LEGAL_I18N[key];
    if (dict && dict[currentLanguage]) return dict[currentLanguage];
    if (dict && dict['en']) return dict['en'];
    return key;
  };

  // Fetch dynamic CMS document strictly from DB via API response
  useEffect(() => {
    let isMounted = true;
    const slug = activeTab === 'terms' ? 'terms_conditions' : activeTab === 'privacy' ? 'privacy_policy' : 'refund_policy';

    setLoadingCms(true);
    ApiService.getCmsDocument(slug, currentLanguage)
      .then((doc) => {
        if (isMounted) {
          if (doc && doc.content) {
            setCmsContent(doc.content);
            setUpdatedAt(doc.updatedAt || null);
          } else {
            setCmsContent(null);
          }
        }
      })
      .catch((err) => {
        if (isMounted) setCmsContent(null);
      })
      .finally(() => {
        if (isMounted) setLoadingCms(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeTab, currentLanguage]);

  // Hardware Back Handler
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [onBack]);

  // Parse structured clauses dynamically from DB content
  const dynamicClauses = React.useMemo(() => {
    if (!cmsContent) return [];
    if (cmsContent.includes('\n\n')) {
      return cmsContent.split(/\n\n+/).map((sec) => sec.trim()).filter(Boolean);
    }
    if (cmsContent.includes('\n')) {
      return cmsContent.split(/\n+/).map((sec) => sec.trim()).filter(Boolean);
    }
    return [cmsContent.trim()];
  }, [cmsContent]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0C251E" translucent={false} />

      {/* Devotional Header */}
      <LinearGradient
        colors={['#0C251E', '#173D32', '#215344']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerContainer}
      >
        <View style={styles.headerOrnamentLeft}>
          <HeaderCornerFiligree />
        </View>
        <View style={styles.headerOrnamentRight}>
          <HeaderCornerFiligree flipped />
        </View>

        <View style={styles.headerContentRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <BackArrowIcon />
          </TouchableOpacity>

          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>{t('headerTitle')}</Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {/* Golden Bottom Separator Line */}
        <LinearGradient
          colors={['transparent', '#F5CF78', '#DFA62E', '#F5CF78', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.goldSeparator}
        />
      </LinearGradient>

      {/* Body */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Segmented Legal Tabs (Terms & Conditions | Privacy Policy | Refund Policy) */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'terms' && styles.tabButtonActive]}
            activeOpacity={0.85}
            onPress={() => setActiveTab('terms')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'terms' && styles.tabButtonTextActive]}>
              {t('termsTab')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'privacy' && styles.tabButtonActive]}
            activeOpacity={0.85}
            onPress={() => setActiveTab('privacy')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'privacy' && styles.tabButtonTextActive]}>
              {t('privacyTab')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'refund' && styles.tabButtonActive]}
            activeOpacity={0.85}
            onPress={() => setActiveTab('refund')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'refund' && styles.tabButtonTextActive]}>
              {t('refundTab') || 'Refund Policy'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Card 1: Main Active Legal Card dynamically loaded from DB */}
        <View style={styles.legalMainCard}>
          <Text style={styles.cardHeading}>
            {activeTab === 'terms' ? t('termsTitle') : activeTab === 'privacy' ? t('privacyTitle') : (t('refundTitle') || 'Refund Policy')}
          </Text>
          <Text style={styles.cardSubtitle}>
            {updatedAt ? `Last updated: ${new Date(updatedAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}` : t('lastUpdated')}
          </Text>

          <GoldenLotusDivider />

          {loadingCms ? (
            <View style={{ paddingVertical: 32, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#DFA62E" />
              <Text style={{ marginTop: 8, fontSize: 13, color: '#888' }}>Fetching from database...</Text>
            </View>
          ) : dynamicClauses.length > 0 ? (
            <View style={styles.clausesList}>
              {dynamicClauses.map((clause, idx) => {
                const lines = clause.split('\n');
                const head = lines[0].replace(/^\d+\.\s*/, '');
                const body = lines.slice(1).join('\n');
                return (
                  <View key={idx} style={styles.clauseRow}>
                    <NumberBadge num={idx + 1} />
                    <View style={{ flex: 1 }}>
                      {lines.length > 1 ? (
                        <>
                          <Text style={[styles.clauseText, { fontWeight: '700', marginBottom: 3 }]}>{head}</Text>
                          <Text style={styles.clauseText}>{body}</Text>
                        </>
                      ) : (
                        <Text style={styles.clauseText}>{clause}</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={{ paddingVertical: 24, alignItems: 'center' }}>
              <Text style={{ color: '#999', fontSize: 13 }}>No database records found.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0C251E',
  },
  headerContainer: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 12 : 12,
    paddingBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  headerOrnamentLeft: {
    position: 'absolute',
    top: 4,
    left: 4,
    zIndex: 1,
    opacity: 0.85,
  },
  headerOrnamentRight: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 1,
    opacity: 0.85,
  },
  headerContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    zIndex: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#FFFDF8',
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 40,
  },
  goldSeparator: {
    height: 2.5,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFF8EB',
  },
  scrollContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingBottom: 36,
  },

  // Segmented Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF9F0',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#E8CD9C',
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#173D32',
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#173D32',
  },
  tabButtonTextActive: {
    color: '#FFFDF8',
  },

  // Main Card
  legalMainCard: {
    backgroundColor: '#FFF9F0',
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: '#E8CD9C',
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#173D32',
    textAlign: 'center',
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12.5,
    fontStyle: 'italic',
    color: '#345147',
    textAlign: 'center',
    marginBottom: 6,
  },

  // Lotus Divider
  lotusDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  lotusLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8CD9C',
    marginHorizontal: 10,
  },

  // Numbered Clauses
  clausesList: {
    marginTop: 6,
  },
  clauseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  numberBadgeWrapper: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
    position: 'relative',
  },
  numberBadgeText: {
    position: 'absolute',
    fontSize: 12,
    fontWeight: '700',
    color: '#2E7561',
  },
  clauseText: {
    flex: 1,
    fontSize: 13.5,
    color: '#112620',
    lineHeight: 20,
  },
  dynamicCmsBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0DEC1',
  },
  dynamicCmsText: {
    fontSize: 13,
    color: '#5C4A3A',
    lineHeight: 19,
  },

  // Preview Card
  previewCard: {
    backgroundColor: '#FFF9F0',
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: '#E8CD9C',
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  previewCardHeading: {
    fontSize: 18.5,
    fontWeight: '700',
    color: '#173D32',
    textAlign: 'center',
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
  },
  previewCardText: {
    fontSize: 13,
    color: '#5C4A3A',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 2,
  },
});

