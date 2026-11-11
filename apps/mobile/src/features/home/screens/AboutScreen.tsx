import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import { DevotionalBackground } from '../../../components/common/DevotionalBackground';
import { SupportedLanguage } from '../../../types';

interface Props {
  currentLanguage: SupportedLanguage;
  onBack: () => void;
}

const ABOUT_DATA = {
  te: {
    title: 'శరణం అయ్యప్ప గురించి',
    back: '< Back',
    content: [
      {
        heading: 'స్వామియే శరణం అయ్యప్ప',
        text: 'భగవాన్ శ్రీ అయ్యప్ప స్వామి భక్తుల కోసం ప్రత్యేకంగా రూపొందించబడిన దివ్య ఆధ్యాత్మిక అప్లికేషన్.',
      },
      {
        heading: 'విశేషాలు',
        text: '• ప్రతిరోజూ ఖచ్చితమైన తిథి, నక్షత్రం, వారం వివరాలతో కూడిన పంచాంగం.\n• 2026 సంవత్సరపు ఉత్తర నక్షత్ర పవిత్ర తేదీలు మరియు పూజా సమయాలు.\n• ఆడియోతో కూడిన సుప్రభాతం, నిత్య పూజా విధానం, మాలాధారణ మంత్రములు మరియు అయ్యప్ప శరణు ఘోష.\n• తెలుగు, కన్నడ, ఇంగ్లీష్, తమిళం మరియు హిందీ భాషలలో సంపూర్ణ భక్తి కంటెంట్.',
      },
    ],
  },
  kn: {
    title: 'ಶರಣಂ ಅಯ್ಯಪ್ಪ ಬಗ್ಗೆ',
    back: '< Back',
    content: [
      {
        heading: 'ಸ್ವಾಮಿಯೇ ಶರಣಂ ಅಯ್ಯಪ್ಪ',
        text: 'ಭಗವಾನ್ ಅಯ್ಯಪ್ಪ ಸ್ವಾಮಿಯ ಭಕ್ತರಿಗಾಗಿ ವಿಶೇಷವಾಗಿ ರಚಿಸಲಾದ ಭಕ್ತಿ ಅಪ್ಲಿಕೇಶನ್.',
      },
      {
        heading: 'ವೈಶಿಷ್ಟ್ಯಗಳು',
        text: '• ನಿಖರವಾದ ತಿಥಿ, ನಕ್ಷತ್ರ, ವಾರದ ದೈನಂದಿನ ಪಂಚಾಂಗ.\n• 2026 ರ ಉತ್ತರಾ ನಕ್ಷತ್ರ ದಿನಾಂಕಗಳು ಮತ್ತು ವಿಶೇಷ ಪೂಜೆಗಳು.\n• ಆಡಿಯೊ ಸಹಿತ ಸುಪ್ರಭಾತಂ, ನಿತ್ಯ ಪೂಜೆ, ಮಾಲಾಧಾರಣ ಮಂತ್ರ ಮತ್ತು ಅಯ್ಯಪ್ಪ ಶರಣು ಘೋಷ.\n• 5 ಭಾಷೆಗಳಲ್ಲಿ ಲಭ್ಯ.',
      },
    ],
  },
  en: {
    title: 'About Saranam Ayyappa',
    back: '< Back',
    content: [
      {
        heading: 'Swamiye Saranam Ayyappa',
        text: 'A sacred devotional mobile application dedicated to Lord Ayyappa Swamy devotees worldwide.',
      },
      {
        heading: 'Key Features',
        text: '• Accurate daily Panchangam with Tithi, Nakshatra, and Vaaram.\n• Auspicious 2026 Uttara Phalguni Nakshatra pilgrimage dates.\n• Devotional audio playback for Suprabhatham, Daily Pooja procedures, Mala Dharana Mantram, and Sharanu Ghosha.\n• Complete multilingual support in Telugu, Kannada, English, Tamil, and Hindi.',
      },
    ],
  },
  ta: {
    title: 'சரணம் ஐயப்பா பற்றி',
    back: '< Back',
    content: [
      {
        heading: 'சுவாமியே சரணம் ஐயப்பா',
        text: 'ஸ்ரீ ஐயப்ப சுவாமியின் பக்தர்களுக்காக பிரத்யேகமாக உருவாக்கப்பட்ட ஆன்மீக செயலி.',
      },
      {
        heading: 'சிறப்பம்சங்கள்',
        text: '• துல்லியமான திதி, நட்சத்திரம், வாரத்துடன் தினசரி பஞ்சாங்கம்.\n• 2026 உத்திர நட்சத்திர புனித தேதிகள் மற்றும் பூஜை முறைகள்.\n• ஆடியோவுடன் கூடிய சுப்ரபாதம், நித்ய பூஜை, மாலை தாரண மந்திரங்கள் மற்றும் ஐயப்ப சரண கோஷம்.\n• தமிழ், தெலுங்கு, கன்னடம், இந்தி மற்றும் ஆங்கில மொழிகளில் முழு பக்தி உள்ளடக்கம்.',
      },
    ],
  },
  hi: {
    title: 'शरणम् अय्यप्पा के बारे में',
    back: '< Back',
    content: [
      {
        heading: 'स्वामीये शरणम अय्यप्पा',
        text: 'भगवान श्री अय्यप्पा के भक्तों के लिए समर्पित एक पावन आध्यात्मिक एप्लिकेशन।',
      },
      {
        heading: 'विशेषताएं',
        text: '• सटीक तिथि, नक्षत्र और वार के साथ दैनिक पंचांग।\n• 2026 उत्तरा नक्षत्र पावन तिथियां और पूजा विधान।\n• ऑडियो सहित सुप्रभातम्, नित्य पूजा, मालाधारण मंत्र और अय्यप्पा शरणु घोष।\n• हिंदी, तेलुगु, कन्नड़, तमिल और अंग्रेजी में संपूर्ण भक्ति सामग्री।',
      },
    ],
  },
};

export const AboutScreen: React.FC<Props> = ({ currentLanguage, onBack }) => {
  const data = ABOUT_DATA[currentLanguage] || ABOUT_DATA.te;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#D84315" />
      
      {/* Devotional Orange Header Bar */}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backText}>{data.back}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {data.title}
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <DevotionalBackground>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {data.content.map((sec, idx) => (
            <View key={idx} style={styles.card}>
              <Text style={styles.cardHeading}>{sec.heading}</Text>
              <Text style={styles.cardBody}>{sec.text}</Text>
            </View>
          ))}
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
    fontSize: 19,
    fontWeight: 'bold',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE082',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#BF360C',
    marginBottom: 8,
  },
  cardBody: {
    fontSize: 15,
    lineHeight: 22,
    color: '#3E2723',
  },
});
