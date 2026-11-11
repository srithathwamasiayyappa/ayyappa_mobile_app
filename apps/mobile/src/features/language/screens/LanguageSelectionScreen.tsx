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
}

interface LanguageOption {
  code: SupportedLanguage;
  name: string;
}

export const LanguageSelectionScreen: React.FC<Props> = ({ onLanguageSelected }) => {
  const languages: LanguageOption[] = [
    { code: 'te', name: 'తెలుగు — Telugu' },
    { code: 'kn', name: 'ಕನ್ನಡ — Kannada' },
    { code: 'en', name: 'English' },
    { code: 'ta', name: 'தமிழ் — Tamil' },
    { code: 'hi', name: 'हिन्दी — Hindi' },
  ];

  // No language selected by default
  const [selected, setSelected] = useState<SupportedLanguage | null>(null);

  const handleSelect = (lang: SupportedLanguage) => {
    setSelected(lang);
    setTimeout(() => {
      onLanguageSelected(lang);
    }, 280);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#E65100" />

      {/* Devotional Orange Header Bar */}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chose your language</Text>
        </View>
      </SafeAreaView>

      {/* EXACT GLOBAL DEVOTIONAL BACKGROUND (Soft texture, no dark geometric overlays, no notification bar) */}
      <DevotionalBackground>
        <View style={styles.listWrapper}>
          {languages.map((item) => {
            const isSelected = selected === item.code;
            return (
              <TouchableOpacity
                key={item.code}
                style={styles.itemRow}
                activeOpacity={0.7}
                onPress={() => handleSelect(item.code)}
              >
                <Text style={styles.languageText}>{item.name}</Text>

                {/* Circular Radio Badge */}
                <View
                  style={[
                    styles.radioCircle,
                    isSelected && styles.radioCircleSelected,
                  ]}
                >
                  {isSelected && <Text style={styles.checkmarkIcon}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </DevotionalBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5A623',
    width: '100%',
    height: '100%',
  },
  safeArea: {
    backgroundColor: '#E65100',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    height: 56,
    backgroundColor: '#E65100',
    justifyContent: 'center',
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  listWrapper: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 52,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(70, 30, 0, 0.45)',
    backgroundColor: 'transparent',
  },
  languageText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: 0.3,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1E1E1E',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    backgroundColor: '#1E1E1E',
    borderColor: '#1E1E1E',
  },
  checkmarkIcon: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    lineHeight: 14,
  },
});
