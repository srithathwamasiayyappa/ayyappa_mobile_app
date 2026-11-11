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
} from 'react-native';
import { DevotionalBackground } from '../../../components/common/DevotionalBackground';
import { AyyappaMedallion } from '../../../components/common/AyyappaMedallion';
import { ApiService } from '../../../services/api';
import { SupportedLanguage } from '../../../types';

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
  const [contactInfo, setContactInfo] = useState<any>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const t = I18N_CONTACT[currentLanguage] || I18N_CONTACT.te;

  useEffect(() => {
    ApiService.getContactInfo().then(info => setContactInfo(info));
  }, []);

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

      <DevotionalBackground>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Header Card */}
          <View style={styles.topCard}>
            <AyyappaMedallion size={64} />
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
              <Text style={styles.label}>భక్తుని పేరు (Name)</Text>
              <TextInput
                style={styles.input}
                placeholder={t.namePlaceholder}
                placeholderTextColor="#9E9E9E"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>మొబైల్ సంఖ్య (Phone)</Text>
              <TextInput
                style={styles.input}
                placeholder={t.phonePlaceholder}
                placeholderTextColor="#9E9E9E"
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
                placeholderTextColor="#9E9E9E"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>సందేశం (Message)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={t.messagePlaceholder}
                placeholderTextColor="#9E9E9E"
                multiline
                numberOfLines={4}
                value={message}
                onChangeText={setMessage}
              />
            </View>

            <TouchableOpacity
              style={styles.submitBtn}
              activeOpacity={0.85}
              disabled={submitting}
              onPress={handleSubmit}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>{t.submitBtn}</Text>
              )}
            </TouchableOpacity>
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
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backText: {
    color: '#FFF8E1',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  topCard: {
    alignItems: 'center',
    marginBottom: 16,
  },
  portalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#8E24AA',
    marginTop: 8,
  },
  portalSubtitle: {
    fontSize: 13,
    color: '#D84315',
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#FFD54F',
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#FFD54F',
    padding: 16,
    marginBottom: 20,
    elevation: 4,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#BF360C',
  },
  divider: {
    height: 1,
    backgroundColor: '#FFE082',
    marginVertical: 10,
  },
  infoRow: {
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#5D4037',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#1565C0',
    fontWeight: '600',
  },
  infoValueSub: {
    fontSize: 13,
    color: '#3E2723',
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#5D4037',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFCA28',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: '#212121',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#D84315',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

