import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import { DevotionalBackground } from '../../../components/common/DevotionalBackground';
import { SupportedLanguage } from '../../../types';

interface Props {
  onLanguageSelected: (lang: SupportedLanguage) => void;
  onBack?: () => void;
  currentLanguage?: SupportedLanguage;
}

interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  subname: string;
}

export const LanguageSelectionScreen: React.FC<Props> = ({
  onLanguageSelected,
  onBack,
  currentLanguage = 'te',
}) => {
  const languages: LanguageOption[] = [
    { code: 'te', name: 'తెలుగు', subname: 'Telugu' },
    { code: 'kn', name: 'ಕನ್ನಡ', subname: 'Kannada' },
    { code: 'en', name: 'English', subname: 'English' },
    { code: 'ta', name: 'தமிழ்', subname: 'Tamil' },
    { code: 'hi', name: 'हिन्दी', subname: 'Hindi' },
  ];

  const [selected, setSelected] = useState<SupportedLanguage>(currentLanguage);

  const handleSelect = (lang: SupportedLanguage) => {
    setSelected(lang);
  };

  const handleConfirm = () => {
    onLanguageSelected(selected);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#D84315" translucent={false} />

      {/* Devotional Orange Header Bar */}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          {onBack ? (
            <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
              <Text style={styles.backText}>&lt; Back</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 16 }} />
          )}
          <Text style={styles.headerTitle}>Choose your language</Text>
          <View style={{ width: onBack ? 60 : 16 }} />
        </View>
      </SafeAreaView>

      {/* Devotional Golden Sacred Background */}
      <DevotionalBackground>
        <View style={styles.contentWrapper}>
          <View style={styles.cardContainer}>
            {languages.map((item) => {
              const isSelected = selected === item.code;
              return (
                <TouchableOpacity
                  key={item.code}
                  style={[styles.itemRow, isSelected && styles.itemRowSelected]}
                  activeOpacity={0.7}
                  onPress={() => handleSelect(item.code)}
                >
                  <View style={styles.textColumn}>
                    <Text style={styles.languageText}>
                      {item.name} — {item.subname}
                    </Text>
                  </View>

                  {/* Circular Radio Badge */}
                  <View
                    style={[
                      styles.radioCircle,
                      isSelected && styles.radioCircleSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioInnerDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Prominent Continue Button */}
          <TouchableOpacity
            style={styles.continueBtn}
            activeOpacity={0.85}
            onPress={handleConfirm}
          >
            <Text style={styles.continueBtnText}>Continue / కొనసాగించండి →</Text>
          </TouchableOpacity>
        </View>
      </DevotionalBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D84315',
    width: '100%',
    height: '100%',
  },
  safeArea: {
    backgroundColor: '#D84315',
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
    shadowRadius: 3,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.2,
    flex: 1,
    textAlign: 'center',
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  cardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D84315',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(216, 67, 21, 0.2)',
    backgroundColor: 'transparent',
  },
  itemRowSelected: {
    backgroundColor: 'rgba(255, 243, 224, 0.9)',
  },
  textColumn: {
    flex: 1,
  },
  languageText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    letterSpacing: 0.3,
  },
  radioCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#D84315',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: '#D84315',
  },
  radioInnerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#D84315',
  },
  continueBtn: {
    backgroundColor: '#D84315',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    marginTop: 20,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
