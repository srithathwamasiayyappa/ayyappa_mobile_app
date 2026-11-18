import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AyyappaMedallion } from '../../../components/common/AyyappaMedallion';
import { ApiService } from '../../../services/api';
import { SupportedLanguage } from '../../../types';
import { useBranding } from '../../../services/brandingService';

interface Props {
  currentLanguage: SupportedLanguage;
  onBack: () => void;
}

const I18N_CONTACT = {
  te: {
    title: 'సంప్రదించండి (Contact Us)',
    back: '< వెనుకకు',
    subtitle: 'శ్రీ శబరిమల ధర్మశాస్తా భక్త సహాయ కేంద్రం',
    helplineTitle: 'భక్త సహాయవాణి (24x7 Helpline):',
    whatsappTitle: 'వాట్సాప్ సహాయం (WhatsApp):',
    emailTitle: 'ఈమెయిల్ (Email Support):',
    addressTitle: 'దేవస్థానం ప్రధాన కార్యాలయం:',
    timingsTitle: 'సన్నిధానం దర్శన వేళలు:',
    formHeader: 'మీ సందేశం / విజ్ఞప్తి పంపండి',
    namePlaceholder: 'మీ పూర్తి పేరు *',
    phonePlaceholder: 'మొబైల్ నంబర్ *',
    emailPlaceholder: 'ఈమెయిల్ అడ్రస్ (ఐచ్ఛికం)',
    messagePlaceholder: 'మీ సందేశం లేదా సలహా ఇక్కడ రాయండి...',
    submitBtn: 'సందేశం పంపండి',
    successMsg: 'మీ సందేశం విజయవంతంగా చేరింది. స్వామియే శరణం అయ్యప్ప!',
  },
  kn: {
    title: 'ಸಂಪರ್ಕಿಸಿ (Contact Us)',
    back: '< ಹಿಂದಕ್ಕೆ',
    subtitle: 'ಶ್ರೀ ಶಬರಿಮಲೆ ಧರ್ಮಶಾಸ್ತಾ ಭಕ್ತ ಸಹಾಯ ಕೇಂದ್ರ',
    helplineTitle: 'ಭಕ್ತ ಸಹಾಯವಾಣಿ (24x7 Helpline):',
    whatsappTitle: 'ವಾಟ್ಸಾಪ್ ಸಹಾಯ (WhatsApp):',
    emailTitle: 'ಇಮೇಲ್ ಬೆಂಬಲ (Email Support):',
    addressTitle: 'ದೇವಸ್ಥಾನ ಕಚೇರಿ ವಿಳಾಸ:',
    timingsTitle: 'ಸನ್ನಿಧಾನ ದರ್ಶನ ಸಮಯ:',
    formHeader: 'ನಿಮ್ಮ ಸಂದೇಶ ಕಳುಹಿಸಿ',
    namePlaceholder: 'ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು *',
    phonePlaceholder: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ *',
    emailPlaceholder: 'ಇಮೇಲ್ ವಿಳಾಸ (ಐಚ್ಛಿಕ)',
    messagePlaceholder: 'ನಿಮ್ಮ ಸಂದೇಶ ಅಥವಾ ಸಲಹೆಯನ್ನು ಇಲ್ಲಿ ಬರೆಯಿರಿ...',
    submitBtn: 'ಸಂದೇಶ ಕಳುಹಿಸಿ',
    successMsg: 'ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಸ್ವೀಕರಿಸಲಾಗಿದೆ. ಸ್ವಾಮಿಯೇ ಶರಣಂ ಅಯ್ಯಪ್ಪ!',
  },
  en: {
    title: 'Contact Us',
    back: '< Back',
    subtitle: 'Sabarimala Pilgrim Care & Support Portal',
    helplineTitle: '24x7 Devotee Helpline:',
    whatsappTitle: 'WhatsApp Helpdesk:',
    emailTitle: 'Official Support Email:',
    addressTitle: 'Travancore Devaswom Board Office:',
    timingsTitle: 'Sannidhanam Darshan Timings:',
    formHeader: 'Send Your Inquiry / Feedback',
    namePlaceholder: 'Full Name *',
    phonePlaceholder: 'Mobile Number *',
    emailPlaceholder: 'Email Address (Optional)',
    messagePlaceholder: 'Write your message or inquiry here...',
    submitBtn: 'Submit Inquiry to Database',
    successMsg: 'Your inquiry has been received. Swamiye Saranam Ayyappa!',
  },
  ta: {
    title: 'தொடர்புகொள்ள (Contact Us)',
    back: '< பின்செல்க',
    subtitle: 'ஸ்ரீ சபரிமலை ஐயப்ப பக்தர் உதவி மையம்',
    helplineTitle: 'பக்தர் உதவி எண் (24x7 Helpline):',
    whatsappTitle: 'வாட்ஸ்அப் உதவி (WhatsApp):',
    emailTitle: 'மின்னஞ்சல் ஆதரவு (Email Support):',
    addressTitle: 'தேவஸ்வம் வாரிய முகவரி:',
    timingsTitle: 'சன்னிதான தரிசன நேரங்கள்:',
    formHeader: 'உங்கள் செய்தியை அனுப்பவும்',
    namePlaceholder: 'முழு பெயர் *',
    phonePlaceholder: 'கைபேசி எண் *',
    emailPlaceholder: 'மின்னஞ்சல் முகவரி (விருப்பத்தேர்வு)',
    messagePlaceholder: 'உங்கள் கருத்து அல்லது வினவலை எழுதவும்...',
    submitBtn: 'செய்தி அனுப்பவும்',
    successMsg: 'உங்கள் செய்தி பெறப்பட்டது. சுவாமியே சரணம் ஐயப்பா!',
  },
  hi: {
    title: 'संपर्क करें (Contact Us)',
    back: '< वापस',
    subtitle: 'श्री सबरीमाला धर्मशास्ता भक्त सहायता केंद्र',
    helplineTitle: 'भक्त हेल्पलाइन (24x7 Helpline):',
    whatsappTitle: 'व्हाट्सएप सहायता (WhatsApp):',
    emailTitle: 'ईमेल सहायता (Email Support):',
    addressTitle: 'देवस्वोम बोर्ड कार्यालय:',
    timingsTitle: 'सन्निधानम् दर्शन समय:',
    formHeader: 'अपना संदेश / सुझाव भेजें',
    namePlaceholder: 'पूरा नाम *',
    phonePlaceholder: 'मोबाइल नंबर *',
    emailPlaceholder: 'ईमेल पता (वैकल्पिक)',
    messagePlaceholder: 'अपना संदेश या सुझाव यहाँ लिखें...',
    submitBtn: 'संदेश भेजें',
    successMsg: 'आपका संदेश प्राप्त हो गया है। स्वामीये शरणम् अय्यप्पा!',
  },
};

export const ContactScreen: React.FC<Props> = ({ currentLanguage, onBack }) => {
  const { branding } = useBranding();
  const [contactInfo, setContactInfo] = useState<any>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const t = I18N_CONTACT[currentLanguage] || I18N_CONTACT.te;

  useEffect(() => {
    ApiService.getContactInfo(currentLanguage).then(info => setContactInfo(info));
  }, [currentLanguage]);

  // Android Mobile Hardware / Gesture Back Button handling
  useEffect(() => {
    if (!onBack) return;
    const backSub = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true; // Intercept: go back cleanly
    });
    return () => backSub.remove();
  }, [onBack]);

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim() || !message.trim()) {
      Alert.alert('Required Fields', 'Please fill name, mobile number, and message.');
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
      Alert.alert('Swamiye Saranam Ayyappa', t.successMsg);
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#D84315" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backText}>{t.back}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {t.title}
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <View style={styles.bodyWrapper}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Header Branding Card */}
          <View style={styles.topCard}>
            <AyyappaMedallion size={70} />
            <Text style={styles.portalTitle}>శరణం అయ్యప్ప</Text>
            <Text style={styles.portalSubtitle}>{t.subtitle}</Text>
          </View>

          {/* Official Directory Card */}
          <View style={styles.infoCard}>
            <Text style={styles.sectionHeader}>📞 అధికారిక సహాయవాణి వివరాలు</Text>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.helplineTitle}</Text>
              <Text style={styles.infoValue}>{contactInfo?.helpline || '+91 4735 202028'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.whatsappTitle}</Text>
              <Text style={styles.infoValue}>{contactInfo?.whatsapp || '+91 94477 95577'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.emailTitle}</Text>
              <Text style={styles.infoValue}>{contactInfo?.email || 'support@ayyappa.org'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.timingsTitle}</Text>
              <Text style={styles.infoValueSub}>
                {contactInfo?.templeTimings || 'Morning: 3:00 AM – 1:00 PM | Evening: 3:00 PM – 11:00 PM'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.addressTitle}</Text>
              <Text style={styles.infoValueSub}>
                {contactInfo?.address || 'Travancore Devaswom Board, Sabarimala Sannidhanam, Kerala - 689662'}
              </Text>
            </View>
          </View>

          {/* Devotee Inquiry Form */}
          <View style={styles.formCard}>
            <Text style={styles.sectionHeader}>✉️ {t.formHeader}</Text>
            <View style={styles.divider} />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>భక్తుని పేరు (Name) *</Text>
              <TextInput
                style={styles.input}
                placeholder={t.namePlaceholder}
                placeholderTextColor="#9E9182"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>మొబైల్ సంఖ్య (Phone) *</Text>
              <TextInput
                style={styles.input}
                placeholder={t.phonePlaceholder}
                placeholderTextColor="#9E9182"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>ఈమెయిల్ (Email)</Text>
              <TextInput
                style={styles.input}
                placeholder={t.emailPlaceholder}
                placeholderTextColor="#9E9182"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>సందేశం (Message) *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={t.messagePlaceholder}
                placeholderTextColor="#9E9182"
                multiline
                numberOfLines={4}
                value={message}
                onChangeText={setMessage}
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              disabled={submitting}
              onPress={handleSubmit}
              style={styles.submitBtnContainer}
            >
              <LinearGradient
                colors={['#FF6F00', '#E65100']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitGradient}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>{t.submitBtn || 'సందేశం పంపండి (Send Message) →'}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAF5EB',
  },
  safeArea: {
    backgroundColor: '#D84315',
  },
  header: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: '#D84315',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backText: {
    color: '#FFF8E1',
    fontSize: 16,
    fontWeight: '700',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  bodyWrapper: {
    flex: 1,
    backgroundColor: '#FAF5EB',
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  topCard: {
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#FFFDF9',
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: '#F0E5D4',
    paddingVertical: 18,
    paddingHorizontal: 16,
    elevation: 3,
    shadowColor: '#2E7561',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  portalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#071914',
    marginTop: 8,
    letterSpacing: 0.3,
  },
  portalSubtitle: {
    fontSize: 13,
    color: '#2E7561',
    fontWeight: '600',
    marginTop: 3,
    textAlign: 'center',
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: '#F0E5D4',
    padding: 18,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#2E7561',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  formCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: '#F0E5D4',
    padding: 18,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#2E7561',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#071914',
    letterSpacing: 0.2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0E5D4',
    marginVertical: 12,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2E7561',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  infoValue: {
    fontSize: 14.5,
    color: '#2E7561',
    fontWeight: '700',
  },
  infoValueSub: {
    fontSize: 13.5,
    color: '#0C251E',
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#215344',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E8D8C4',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#112620',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  submitBtnContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 8,
    elevation: 4,
    shadowColor: '#E65100',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  submitGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});

