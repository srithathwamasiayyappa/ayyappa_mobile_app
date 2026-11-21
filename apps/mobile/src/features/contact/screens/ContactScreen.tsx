import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Platform,
  BackHandler,
  Linking,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { ApiService } from '../../../services/api';
import { SupportedLanguage } from '../../../types';
import { DevotionalDialog, DevotionalDialogType } from '../../../components/common/DevotionalDialog';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  currentLanguage: SupportedLanguage;
  onBack: () => void;
  onNavigateAddMandir?: () => void;
}

// Corner Filigree Ornaments for Header
const HeaderCornerFiligree = ({ flipped = false }: { flipped?: boolean }) => (
  <View style={flipped ? { transform: [{ scaleX: -1 }] } : undefined}>
    <Svg width={36} height={36} viewBox="0 0 36 36" fill="none">
      <Path
        d="M2 2 C12 2 22 8 28 16 C24 18 18 16 12 22 C8 16 6 8 2 2 Z"
        fill="#E2AD43"
        fillOpacity={0.8}
      />
      <Circle cx="8" cy="8" r="2" fill="#FFD700" />
      <Circle cx="16" cy="5" r="1.5" fill="#FFD700" />
      <Circle cx="5" cy="16" r="1.5" fill="#FFD700" />
    </Svg>
  </View>
);

// Back Arrow inside Header
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

// Email Envelope Icon
const MailSvgIcon = ({ size = 20, color = '#B71C1C' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 6l-10 7L2 6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Temple Gopuram Icon
const TempleTrustIcon = ({ size = 20, color = '#B71C1C' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2 L14 5 H10 Z" fill={color} />
    <Path d="M8 5 H16 L17 8 H7 Z" fill={color} />
    <Path d="M5 8 H19 L20 12 H4 Z" fill={color} />
    <Path d="M4 12 H20 V20 H4 Z" stroke={color} strokeWidth={1.8} />
    <Path d="M9 15 H15 V20 H9 Z" fill={color} />
    <Path d="M2 20 H22" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// Report Alert Flag Icon
const ReportFlagIcon = ({ size = 20, color = '#B71C1C' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
    <Path d="M4 22v-7" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// Golden Lotus Divider
const GoldenLotusDivider = () => (
  <View style={styles.lotusDividerContainer}>
    <View style={styles.lotusLine} />
    <Svg width={28} height={18} viewBox="0 0 28 18" fill="none">
      <Path
        d="M14 2 C11 7 10 10 10 13 C10 15.5 11.8 17 14 17 C16.2 17 18 15.5 18 13 C18 10 17 7 14 2 Z"
        fill="#DFA62E"
      />
      <Circle cx="14" cy="13" r="1.5" fill="#FFFDF8" />
    </Svg>
    <View style={styles.lotusLine} />
  </View>
);

// Localized UI strings matching website
const UI_STRINGS: Record<string, {
  headerTitle: string;
  badge: string;
  defaultTitle: string;
  defaultLead: string;
  emailTitle: string;
  emailLead: string;
  templeTrustTitle: string;
  templeTrustLead: string;
  templeTrustLinkText: string;
  templeTrustTail: string;
  reportIssueTitle: string;
  reportIssueLead: string;
  formSectionHeader: string;
  formSectionSubtitle: string;
  nameLabel: string;
  phoneLabel: string;
  emailLabel: string;
  messageLabel: string;
  submitButtonText: string;
  successTitle: string;
  successMessage: string;
  loadingMessage: string;
}> = {
  en: {
    headerTitle: 'Contact Us',
    badge: 'CONTACT',
    defaultTitle: 'Get in touch',
    defaultLead: "Questions, corrections to a temple listing, or partnership enquiries — we'd love to hear from you.",
    emailTitle: 'Email',
    emailLead: '— for general queries and listing corrections.',
    templeTrustTitle: 'For temple trusts',
    templeTrustLead: 'Run a temple? ',
    templeTrustLinkText: 'List your mandir free',
    templeTrustTail: ' and manage timings, sevas and donations from your Trust Console.',
    reportIssueTitle: 'Report an issue',
    reportIssueLead: 'Found a wrong timing or detail? Open the temple page and use "Suggest an edit", or email us with the temple name — our verification team reviews every report.',
    formSectionHeader: 'Send Your Inquiry / Feedback',
    formSectionSubtitle: 'Submits directly to our support desk database in real-time',
    nameLabel: 'Full Name *',
    phoneLabel: 'Mobile Number *',
    emailLabel: 'Email Address (Optional)',
    messageLabel: 'Your Message or Suggestion *',
    submitButtonText: 'Submit Inquiry',
    successTitle: 'Swamiye Saranam Ayyappa',
    successMessage: 'Your inquiry has been received. Our team will review and get back to you.',
    loadingMessage: 'Loading Saranam Ayyappa Help Center & Contact information...',
  },
  te: {
    headerTitle: 'సంప్రదించండి',
    badge: 'సహాయ కేంద్రం',
    defaultTitle: 'మమ్మల్ని సంప్రదించండి',
    defaultLead: 'ఆలయ వివరాలు, నిత్య పూజలు లేదా ఏదైనా సూచనల కోసం మాకు సందేశం పంపండి — మేము మీకు సహాయం చేయడానికి సిద్ధంగా ఉన్నాము.',
    emailTitle: 'ఈమెయిల్ (Email)',
    emailLead: '— సాధారణ సందేహాలు మరియు ఆలయ వివరాల దిద్దుబాట్ల కోసం.',
    templeTrustTitle: 'ఆలయ ట్రస్ట్‌ల కొరకు',
    templeTrustLead: 'ఆలయం నిర్వహిస్తున్నారా? ',
    templeTrustLinkText: 'మీ మందిరాన్ని ఉచితంగా నమోదు చేయండి',
    templeTrustTail: ' మరియు మీ ట్రస్ట్ కన్సోల్ ద్వారా దర్శన వేళలు, సేవలు, విరాళాలను నిర్వహించండి.',
    reportIssueTitle: 'తప్పు వివరాలను నివేదించండి',
    reportIssueLead: 'ఏదైనా ఆలయ వేళలు లేదా వివరాలు తప్పుగా ఉన్నాయా? ఆలయ పేజీలో "Suggest an edit" ఎంచుకోండి లేదా మాకు ఈమెయిల్ చేయండి — మా బృందం పరిశీలిస్తుంది.',
    formSectionHeader: 'మీ సందేశం / విజ్ఞప్తి పంపండి',
    formSectionSubtitle: 'మీ సందేశం నేరుగా మా సహాయ కేంద్రం డేటాబేస్‌కు చేరుతుంది',
    nameLabel: 'పూర్తి పేరు *',
    phoneLabel: 'మొబైల్ నంబర్ *',
    emailLabel: 'ఈమెయిల్ (ఐచ్ఛికం)',
    messageLabel: 'మీ సందేశం లేదా సలహా *',
    submitButtonText: 'సందేశం పంపండి',
    successTitle: 'స్వామియే శరణం అయ్యప్ప',
    successMessage: 'మీ సందేశం విజయవంతంగా చేరింది. మా సహాయ బృందం త్వరలో మిమ్మల్ని సంప్రదిస్తుంది.',
    loadingMessage: 'శరణం అయ్యప్ప సహాయ కేంద్రం వివరాలు లోడ్ అవుతున్నాయి...',
  },
  kn: {
    headerTitle: 'ಸಂಪರ್ಕಿಸಿ',
    badge: 'ಸಂಪರ್ಕ',
    defaultTitle: 'ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ',
    defaultLead: 'ದೇವಾಲಯದ ವಿವರಗಳು, ಪೂಜೆಗಳು ಅಥವಾ ಸಲಹೆಗಳಿಗಾಗಿ ನಮಗೆ ಸಂದೇಶ ಕಳುಹಿಸಿ.',
    emailTitle: 'ಇಮೇಲ್',
    emailLead: '— ಸಾಮಾನ್ಯ ವಿಚಾರಣೆಗಳು ಮತ್ತು ದೇವಾಲಯ ತಿದ್ದುಪಡಿಗಳಿಗಾಗಿ.',
    templeTrustTitle: 'ದೇವಾಲಯ ಟ್ರಸ್ಟ್‌ಗಳಿಗಾಗಿ',
    templeTrustLead: 'ದೇವಾಲಯ ನಡೆಸುತ್ತಿದ್ದೀರಾ? ',
    templeTrustLinkText: 'ನಿಮ್ಮ ಮಂದಿರವನ್ನು ಉಚಿತವಾಗಿ ನೋಂದಾಯಿಸಿ',
    templeTrustTail: ' ಮತ್ತು ಸಮಯ, ಸೇವೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ.',
    reportIssueTitle: 'ದೋಷವನ್ನು ವರದಿ ಮಾಡಿ',
    reportIssueLead: 'ಯಾವುದಾದರೂ ಸಮಯ ಅಥವಾ ವಿವರ ತಪ್ಪಾಗಿದ್ದರೆ ನಮಗೆ ಇಮೇಲ್ ಮಾಡಿ.',
    formSectionHeader: 'ನಿಮ್ಮ ಸಂದೇಶ ಕಳುಹಿಸಿ',
    formSectionSubtitle: 'ನೇರವಾಗಿ ನಮ್ಮ ದತ್ತಸಂಚಯಕ್ಕೆ ರವಾನೆಯಾಗುತ್ತದೆ',
    nameLabel: 'ಪೂರ್ಣ ಹೆಸರು *',
    phoneLabel: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ *',
    emailLabel: 'ಇಮೇಲ್ (ಐಚ್ಛಿಕ)',
    messageLabel: 'ನಿಮ್ಮ ಸಂದೇಶ ಅಥವಾ ಸಲಹೆ *',
    submitButtonText: 'ಸಂದೇಶ ಕಳುಹಿಸಿ',
    successTitle: 'ಸ್ವಾಮಿಯೇ ಶರಣಂ ಅಯ್ಯಪ್ಪ',
    successMessage: 'ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಸ್ವೀಕರಿಸಲಾಗಿದೆ.',
    loadingMessage: 'ಸಂಪರ್ಕ ವಿವರಗಳು ಲೋಡ್ ಆಗುತ್ತಿವೆ...',
  },
  ta: {
    headerTitle: 'தொடர்புகொள்ள',
    badge: 'தொடர்பு',
    defaultTitle: 'எங்களைத் தொடர்பு கொள்ளவும்',
    defaultLead: 'கோயில் விவரங்கள், பூஜைகள் அல்லது திருத்தங்களுக்கு எங்களை தொடர்பு கொள்ளவும்.',
    emailTitle: 'மின்னஞ்சல்',
    emailLead: '— பொதுவான விசாரணைகள் மற்றும் கோயில் திருத்தங்களுக்கு.',
    templeTrustTitle: 'கோயில் அறக்கட்டளைகளுக்கு',
    templeTrustLead: 'கோயில் நடத்துகிறீர்களா? ',
    templeTrustLinkText: 'உங்கள் கோயிலை இலவசமாக பதிவு செய்யுங்கள்',
    templeTrustTail: ' மற்றும் நேரங்கள், சேவைகளை நிர்வகிக்கவும்.',
    reportIssueTitle: 'சிக்கலைப் புகாரளிக்கவும்',
    reportIssueLead: 'தவறான தகவல்கள் இருந்தால் எங்களுக்கு மின்னஞ்சல் அனுப்பவும்.',
    formSectionHeader: 'உங்கள் செய்தியை அனுப்பவும்',
    formSectionSubtitle: 'நேரடியாக எமது உதவி மைய தரவுத்தளத்தில் சேமிக்கப்படும்',
    nameLabel: 'முழு பெயர் *',
    phoneLabel: 'கைபேசி எண் *',
    emailLabel: 'மின்னஞ்சல் (விருப்பத்தேர்வு)',
    messageLabel: 'உங்கள் கருத்து அல்லது செய்தி *',
    submitButtonText: 'செய்தி அனுப்பவும்',
    successTitle: 'சுவாமியே சரணம் ஐயப்பா',
    successMessage: 'உங்கள் செய்தி பெறப்பட்டது.',
    loadingMessage: 'தகவல்கள் ஏற்றப்படுகின்றன...',
  },
  hi: {
    headerTitle: 'संपर्क करें',
    badge: 'संपर्क',
    defaultTitle: 'हमसे संपर्क करें',
    defaultLead: 'मंदिर विवरण, नित्य पूजा या किसी भी सुझाव के लिए हमसे संपर्क करें।',
    emailTitle: 'ईमेल',
    emailLead: '— सामान्य प्रश्नों और मंदिर विवरण सुधार के लिए।',
    templeTrustTitle: 'मंदिर ट्रस्टों के लिए',
    templeTrustLead: 'मंदिर का संचालन करते हैं? ',
    templeTrustLinkText: 'अपने मंदिर को निःशुल्क सूचीबद्ध करें',
    templeTrustTail: ' और समय, सेवाओं का प्रबंधन करें।',
    reportIssueTitle: 'समस्या की रिपोर्ट करें',
    reportIssueLead: 'गलत समय या विवरण मिलने पर हमें ईमेल करें।',
    formSectionHeader: 'अपना संदेश भेजें',
    formSectionSubtitle: 'सीधे हमारे सहायता डेटाबेस में भेजा जाएगा',
    nameLabel: 'पूरा नाम *',
    phoneLabel: 'मोबाइल नंबर *',
    emailLabel: 'ईमेल (वैकल्पिक)',
    messageLabel: 'अपना संदेश या सुझाव लिखें *',
    submitButtonText: 'संदेश भेजें',
    successTitle: 'स्वामीये शरणम् अय्यप्पा',
    successMessage: 'आपका संदेश प्राप्त हो गया है।',
    loadingMessage: 'सहायता केंद्र विवरण लोड हो रहे हैं...',
  },
};

export const ContactScreen: React.FC<Props> = ({ currentLanguage = 'en', onBack, onNavigateAddMandir }) => {
  const [cmsData, setCmsData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Sacred Devotional Custom Alert Dialog State
  const [devotionalDialog, setDevotionalDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: DevotionalDialogType;
    confirmText?: string;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'success',
  });

  const showAlert = (
    title: string,
    message: string,
    type: DevotionalDialogType = 'success',
    confirmText = 'OK'
  ) => {
    setDevotionalDialog({
      visible: true,
      title,
      message,
      type,
      confirmText,
    });
  };

  const t = UI_STRINGS[currentLanguage] || UI_STRINGS.en;

  // Pure dynamic fetch from database via server API matching website ContactPage.jsx
  const fetchContactData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Dynamic call to /home/cms/contact_us?lang=
      const data = await ApiService.getContactCms(currentLanguage);
      if (data) {
        setCmsData(data);
      }
    } catch (err) {
      console.warn('Failed to load dynamic contact CMS:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentLanguage]);

  useEffect(() => {
    fetchContactData();
  }, [fetchContactData]);

  // Handle hardware back button
  useEffect(() => {
    if (!onBack) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [onBack]);

  const handleOpenEmail = () => {
    const targetEmail = 'support@saranamayyappa.org';
    Linking.openURL(`mailto:${targetEmail}`).catch(() => {
      showAlert('Email', `Please send your email to: ${targetEmail}`, 'info');
    });
  };

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim() || !message.trim()) {
      showAlert('Required Fields', 'Please enter your name, mobile number, and message.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await ApiService.submitContactInquiry({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        message: message.trim(),
      });

      showAlert(t.successTitle || 'Swamiye Saranam Ayyappa 🙏', t.successMessage || 'Thank you for reaching out. We will get back to you shortly.', 'success');
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      showAlert('Notice', err.message || 'Could not send message. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Derive dynamic title & description from API response
  const dynamicTitle = cmsData?.description || t.defaultTitle;
  const dynamicLead = cmsData?.value && !/<[a-z][\s\S]*>/i.test(cmsData.value)
    ? cmsData.value
    : t.defaultLead;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#003D2E" translucent={false} />

      {/* =========================================================
          1. SACRED DEVOTIONAL HEADER WITH CORNER FILIGREE
         ========================================================= */}
      <SafeAreaView style={styles.safeHeaderArea}>
        <LinearGradient
          colors={['#003D2E', '#002F25']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerBar}
        >
          <View style={styles.filigreeLeft}>
            <HeaderCornerFiligree />
          </View>
          <View style={styles.filigreeRight}>
            <HeaderCornerFiligree flipped />
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <BackArrowIcon />
          </TouchableOpacity>

          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {t.headerTitle}
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              Saranam Ayyappa Support &amp; Helpdesk
            </Text>
          </View>

          <View style={{ width: 40 }} />
        </LinearGradient>
      </SafeAreaView>

      {/* =========================================================
          2. BODY CONTENT (MIRRORING WEBSITE CONTACT PAGE)
         ========================================================= */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#003D2E" />
          <Text style={styles.loadingText}>{t.loadingMessage}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchContactData(true)}
              colors={['#003D2E']}
              tintColor="#003D2E"
            />
          }
        >
          <View style={styles.contentContainer}>
            {/* Eyebrow Badge & Main Title Matching Website */}
            <View style={styles.eyebrowBadgeWrapper}>
              <Text style={styles.eyebrowBadgeText}>{t.badge}</Text>
            </View>

            <Text style={styles.mainTitle}>{dynamicTitle}</Text>
            <Text style={styles.introLead}>{dynamicLead}</Text>

            {/* Item 1: Email Block */}
            <View style={styles.contactCard}>
              <View style={styles.cardIconBox}>
                <MailSvgIcon size={22} color="#B71C1C" />
              </View>
              <View style={styles.cardTextBox}>
                <Text style={styles.cardTitle}>{t.emailTitle}</Text>
                <TouchableOpacity onPress={handleOpenEmail} activeOpacity={0.7}>
                  <Text style={styles.cardEmailLink}>support@saranamayyappa.org</Text>
                </TouchableOpacity>
                <Text style={styles.cardDesc}>{t.emailLead}</Text>
              </View>
            </View>

            {/* Item 2: For Temple Trusts Block */}
            <View style={styles.contactCard}>
              <View style={styles.cardIconBox}>
                <TempleTrustIcon size={22} color="#003D2E" />
              </View>
              <View style={styles.cardTextBox}>
                <Text style={styles.cardTitle}>{t.templeTrustTitle}</Text>
                <Text style={styles.cardDesc}>
                  {t.templeTrustLead}
                  <Text style={styles.accentText} onPress={onNavigateAddMandir}>
                    {t.templeTrustLinkText}
                  </Text>
                  {t.templeTrustTail}
                </Text>
              </View>
            </View>

            {/* Item 3: Report an Issue Block */}
            <View style={styles.contactCard}>
              <View style={styles.cardIconBox}>
                <ReportFlagIcon size={22} color="#C98928" />
              </View>
              <View style={styles.cardTextBox}>
                <Text style={styles.cardTitle}>{t.reportIssueTitle}</Text>
                <Text style={styles.cardDesc}>{t.reportIssueLead}</Text>
              </View>
            </View>

            {/* =========================================================
                3. DEVOTEE INQUIRY FORM (PURE DYNAMIC TO DATABASE)
               ========================================================= */}
            <View style={styles.formContainerCard}>
              <Text style={styles.formHeaderTitle}>{t.formSectionHeader}</Text>
              <Text style={styles.formHeaderSubtitle}>{t.formSectionSubtitle}</Text>
              <View style={styles.formDivider} />

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t.nameLabel}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Swami Sastry"
                  placeholderTextColor="#9AABA3"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t.phoneLabel}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="+91 98765 43210"
                  placeholderTextColor="#9AABA3"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t.emailLabel}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="swami@example.com"
                  placeholderTextColor="#9AABA3"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t.messageLabel}</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Write your query, suggestion or correction..."
                  placeholderTextColor="#9AABA3"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={message}
                  onChangeText={setMessage}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#003D2E', '#00261D']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.submitGradient}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#FFE28C" />
                  ) : (
                    <Text style={styles.submitButtonText}>{t.submitButtonText}</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={{ height: 24 }} />
            <GoldenLotusDivider />
            <View style={{ height: 40 }} />
          </View>
        </ScrollView>
      )}

      {/* Sacred Devotional Custom Alert Dialog */}
      <DevotionalDialog
        visible={devotionalDialog.visible}
        title={devotionalDialog.title}
        message={devotionalDialog.message}
        type={devotionalDialog.type}
        confirmText={devotionalDialog.confirmText}
        onConfirm={() => setDevotionalDialog(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  safeHeaderArea: {
    backgroundColor: '#003D2E',
  },
  headerBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  filigreeLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    opacity: 0.6,
    pointerEvents: 'none',
  },
  filigreeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    opacity: 0.6,
    pointerEvents: 'none',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitleBox: {
    flex: 1,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFDF8',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#F4C451',
    marginTop: 2,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 13,
    color: '#003D2E',
    fontWeight: '500',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  contentContainer: {
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  eyebrowBadgeWrapper: {
    marginBottom: 8,
  },
  eyebrowBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#B71C1C',
    textTransform: 'uppercase',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 10,
    lineHeight: 34,
  },
  introLead: {
    fontSize: 15,
    color: '#555555',
    lineHeight: 22,
    marginBottom: 24,
  },
  contactCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EBE5DF',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FAF5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardTextBox: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 4,
  },
  cardEmailLink: {
    fontSize: 15,
    fontWeight: '700',
    color: '#B71C1C',
    textDecorationLine: 'underline',
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: 13.5,
    color: '#444444',
    lineHeight: 20,
  },
  accentText: {
    color: '#B71C1C',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  formContainerCard: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EBE5DF',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  formHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#003D2E',
    marginBottom: 4,
  },
  formHeaderSubtitle: {
    fontSize: 12,
    color: '#7A8C84',
    marginBottom: 12,
  },
  formDivider: {
    height: 1,
    backgroundColor: '#EDE8E0',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#284138',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#FAF7F0',
    borderWidth: 1,
    borderColor: '#DFD7C8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A2E26',
  },
  textArea: {
    minHeight: 90,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 10,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFE28C',
    letterSpacing: 0.5,
  },
  lotusDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  lotusLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#DFD7C2',
    maxWidth: 80,
  },
});
