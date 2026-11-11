import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SplashScreen } from './src/features/splash/screens/SplashScreen';
import { AuthScreen } from './src/features/auth/screens/AuthScreen';
import { LanguageSelectionScreen } from './src/features/language/screens/LanguageSelectionScreen';
import { HomeScreen } from './src/features/home/screens/HomeScreen';
import { AboutScreen } from './src/features/home/screens/AboutScreen';
import { ContactScreen } from './src/features/contact/screens/ContactScreen';
import { PanchangamScreen } from './src/features/panchangam/screens/PanchangamScreen';
import { DetailScreen } from './src/features/devotional-content/screens/DetailScreen';
import { StorageService } from './src/services/storageService';
import { SupportedLanguage } from './src/types';

interface DetailState {
  id: string;
  title: string;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<
    'splash' | 'auth' | 'language' | 'home' | 'about' | 'contact' | 'detail' | 'panchangam'
  >('splash');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('te');
  const [activeDetail, setActiveDetail] = useState<DetailState | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  // Restore navigation and language state from persistent storage on mount
  useEffect(() => {
    async function loadPersistedState() {
      const restored = await StorageService.restoreState();
      setSelectedLanguage(restored.language);
      setActiveDetail(restored.activeDetail);
      setIsReady(true);
    }
    loadPersistedState();
  }, []);

  // When Splash video finishes -> Gate to Auth Screen
  const handleSplashFinish = () => {
    setCurrentScreen('auth');
  };

  // When devotee logs in or registers successfully
  const handleAuthSuccess = (user: any) => {
    setCurrentUser(user);
    // Proceed to Language Selection or Home
    setCurrentScreen('language');
  };

  const handleSkipAuth = () => {
    setCurrentScreen('language');
  };

  const handleLanguageSelect = (lang: SupportedLanguage) => {
    setSelectedLanguage(lang);
    StorageService.setStoredLanguage(lang);
    setCurrentScreen('home');
    setActiveDetail(null);
    StorageService.saveNavigationState('home', null);
  };

  const handleOpenDetail = (id: string, title: string) => {
    const detail = { id, title };
    setActiveDetail(detail);
    setCurrentScreen('detail');
    StorageService.saveNavigationState('detail', detail);
  };

  const handleOpenPanchangam = () => {
    setCurrentScreen('panchangam');
    StorageService.saveNavigationState('panchangam', null);
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
    setActiveDetail(null);
    StorageService.saveNavigationState('home', null);
  };

  const handleOpenAbout = () => {
    setCurrentScreen('about');
    StorageService.saveNavigationState('about', null);
  };

  const handleOpenContact = () => {
    setCurrentScreen('contact');
    StorageService.saveNavigationState('contact', null);
  };

  const handleOpenLanguage = () => {
    setCurrentScreen('language');
    StorageService.saveNavigationState('language', null);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {currentScreen === 'splash' && (
        <SplashScreen onFinish={handleSplashFinish} />
      )}
      {currentScreen === 'auth' && (
        <AuthScreen
          onLoginSuccess={handleAuthSuccess}
          onSkip={handleSkipAuth}
        />
      )}
      {currentScreen === 'language' && (
        <LanguageSelectionScreen onLanguageSelected={handleLanguageSelect} />
      )}
      {currentScreen === 'home' && (
        <HomeScreen
          currentLanguage={selectedLanguage}
          onOpenLanguageScreen={handleOpenLanguage}
          onOpenAboutScreen={handleOpenAbout}
          onOpenContactScreen={handleOpenContact}
          onOpenDetail={handleOpenDetail}
          onOpenPanchangam={handleOpenPanchangam}
        />
      )}
      {currentScreen === 'about' && (
        <AboutScreen
          currentLanguage={selectedLanguage}
          onBack={handleBackToHome}
        />
      )}
      {currentScreen === 'contact' && (
        <ContactScreen
          currentLanguage={selectedLanguage}
          onBack={handleBackToHome}
        />
      )}
      {currentScreen === 'panchangam' && (
        <PanchangamScreen
          currentLanguage={selectedLanguage}
          onBack={handleBackToHome}
        />
      )}
      {currentScreen === 'detail' && activeDetail && (
        <DetailScreen
          title={activeDetail.title}
          itemId={activeDetail.id}
          currentLanguage={selectedLanguage}
          onBack={handleBackToHome}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5A623',
  },
});
