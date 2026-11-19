import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, BackHandler, ToastAndroid, Platform, Image, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Global Poppins Typography Configuration for the entire application
const defaultAppFont = Platform.select({
  ios: 'Poppins-Regular',
  android: 'Poppins_400Regular',
  web: 'Poppins, sans-serif',
  default: 'Poppins_400Regular',
});

// Configure defaultProps so every <Text> and <TextInput> without explicit style uses Poppins
try {
  const TextComponent = Text as any;
  if (!TextComponent.defaultProps) {
    TextComponent.defaultProps = {};
  }
  TextComponent.defaultProps.style = [
    { fontFamily: defaultAppFont },
    TextComponent.defaultProps.style,
  ];

  const TextInputComponent = TextInput as any;
  if (!TextInputComponent.defaultProps) {
    TextInputComponent.defaultProps = {};
  }
  TextInputComponent.defaultProps.style = [
    { fontFamily: defaultAppFont },
    TextInputComponent.defaultProps.style,
  ];
} catch (e) {
  // Non-fatal if platform runtime seals defaultProps
}

// Sacred Lord Ayyappa Watermark Artwork (Rendered centered with subtle opacity across all screens except splash)
const AYYAPPA_WATERMARK = require('./assets/ayyappa_watermark.png');
import { Asset } from 'expo-asset';
import { SplashScreen } from './src/features/splash/screens/SplashScreen';
import { WelcomeScreen } from './src/features/welcome/screens/WelcomeScreen';
import { OnboardingScreen } from './src/features/onboarding/screens/OnboardingScreen';
import { ChooseDeityScreen } from './src/features/deity/screens/ChooseDeityScreen';
import { RoleSelectionScreen, UserRole } from './src/features/auth/screens/RoleSelectionScreen';
import { AuthScreen } from './src/features/auth/screens/AuthScreen';
import { LanguageSelectionScreen } from './src/features/language/screens/LanguageSelectionScreen';
import { HomeScreen } from './src/features/home/screens/HomeScreen';
import { ServicesScreen } from './src/features/services/screens/ServicesScreen';
import { ProfileScreen } from './src/features/profile/screens/ProfileScreen';
import { EditProfileScreen } from './src/features/profile/screens/EditProfileScreen';
import { CompleteProfileScreen } from './src/features/profile/screens/CompleteProfileScreen';
import { TermsScreen } from './src/features/profile/screens/TermsScreen';
import { PrivacyPolicyScreen } from './src/features/profile/screens/PrivacyPolicyScreen';
import { NotificationsScreen } from './src/features/profile/screens/NotificationsScreen';
import { AboutScreen } from './src/features/home/screens/AboutScreen';
import { ContactScreen } from './src/features/contact/screens/ContactScreen';
import { PanchangamScreen } from './src/features/panchangam/screens/PanchangamScreen';
import { FestivalsScreen } from './src/features/festivals/screens/FestivalsScreen';
import { DetailScreen } from './src/features/devotional-content/screens/DetailScreen';
import { CategoryListingScreen } from './src/features/services/screens/CategoryListingScreen';
import { PoojaDetailScreen } from './src/features/services/screens/PoojaDetailScreen';
import { SlokaDetailScreen } from './src/features/services/screens/SlokaDetailScreen';
import { BhajansSongsScreen } from './src/features/services/screens/BhajansSongsScreen';
import { LiveStreamsScreen } from './src/features/services/screens/LiveStreamsScreen';
import { TemplesListScreen } from './src/features/services/screens/TemplesListScreen';
import { TempleProfileScreen } from './src/features/services/screens/TempleProfileScreen';
import { FoodDonationScreen } from './src/features/services/screens/FoodDonationScreen';
import { DonationsScreen } from './src/features/services/screens/DonationsScreen';
import { BottomTabBar } from './src/components/navigation/BottomTabBar';
import { StorageService, MobileScreen } from './src/services/storageService';
import { SupportedLanguage, MainTab, TempleItem } from './src/types';
import {
  useFonts,
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins';

interface DetailState {
  id: string;
  title: string;
}

interface NavHistoryEntry {
  screen: MobileScreen;
  detail: DetailState | null;
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    'Poppins-Light': Poppins_300Light,
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
    'Poppins-ExtraBold': Poppins_800ExtraBold,
    Poppins: Poppins_400Regular,
  });

  const [fontTimeoutPassed, setFontTimeoutPassed] = useState(false);

  useEffect(() => {
    // Safety fallback: Never keep the user stuck on the initial emblem screen
    const timer = setTimeout(() => {
      setFontTimeoutPassed(true);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  const shouldRenderApp = fontsLoaded || !!fontError || fontTimeoutPassed;

  const [currentScreen, setCurrentScreen] = useState<MobileScreen>('splash');
  const [navHistory, setNavHistory] = useState<NavHistoryEntry[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('te');
  const [currentDeity, setCurrentDeity] = useState<any>(null);
  const [activeDetail, setActiveDetail] = useState<DetailState | null>(null);
  const [activeTempleData, setActiveTempleData] = useState<TempleItem | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('DEVOTEE');
  const [authInitialStep, setAuthInitialStep] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [isReady, setIsReady] = useState(false);
  const lastBackPressRef = useRef<number>(0);

  // Unified navigator: pushes previous screen to history stack
  const navigateTo = (screen: MobileScreen, detail: DetailState | null = null) => {
    if (screen !== currentScreen || detail?.id !== activeDetail?.id) {
      setNavHistory((prev) => [...prev, { screen: currentScreen, detail: activeDetail }]);
    }
    setCurrentScreen(screen);
    setActiveDetail(detail);
    StorageService.saveNavigationState(screen, detail);
  };

  // Unified goBack: pops previous screen from history stack with intelligent fallbacks
  const handleGoBack = (): boolean => {
    // 1. Pop from navHistory if available
    if (navHistory.length > 0) {
      const prevEntry = navHistory[navHistory.length - 1];
      setNavHistory((hist) => hist.slice(0, -1));
      setCurrentScreen(prevEntry.screen);
      setActiveDetail(prevEntry.detail);
      StorageService.saveNavigationState(prevEntry.screen, prevEntry.detail);
      return true;
    }

    // 2. Fallbacks based on current screen
    if (['panchangam', 'contact', 'detail', 'pooja_detail', 'sloka_detail', 'bhajans_songs', 'live_streams', 'services', 'about', 'category_listing', 'temples', 'food_donation', 'donations', 'notifications'].includes(currentScreen)) {
      setCurrentScreen('home');
      setActiveDetail(null);
      StorageService.saveNavigationState('home', null);
      return true;
    }

    if (['terms', 'privacy_policy', 'edit_profile'].includes(currentScreen)) {
      setCurrentScreen('profile');
      StorageService.saveNavigationState('profile', null);
      return true;
    }

    if (currentScreen === 'role_selection') {
      setCurrentScreen('onboarding');
      StorageService.saveNavigationState('onboarding', null);
      return true;
    }

    if (currentScreen === 'onboarding') {
      setCurrentScreen('choose_deity');
      StorageService.saveNavigationState('choose_deity', null);
      return true;
    }

    if (currentScreen === 'choose_deity') {
      setCurrentScreen('language');
      StorageService.saveNavigationState('language', null);
      return true;
    }

    if (currentScreen === 'language') {
      if (!currentUser && navHistory.length === 0) {
        return false;
      }
      setCurrentScreen(currentUser ? 'profile' : 'home');
      StorageService.saveNavigationState(currentUser ? 'profile' : 'home', null);
      return true;
    }

    if (currentScreen === 'auth') {
      if (!currentUser) {
        setCurrentScreen('role_selection');
        StorageService.saveNavigationState('role_selection', null);
        return true;
      }
    }

    if (currentScreen === 'complete_profile') {
      setCurrentScreen('auth');
      StorageService.saveNavigationState('auth', null);
      return true;
    }

    if (currentScreen === 'categories' || currentScreen === 'profile') {
      setCurrentScreen('home');
      StorageService.saveNavigationState('home', null);
      return true;
    }

    return false;
  };

  // Register Android Mobile Hardware / Gesture Back Button Handler
  useEffect(() => {
    const onHardwareBackPress = () => {
      // 1. If still on splash video, ignore
      if (currentScreen === 'splash') {
        return true;
      }

      // 2. Try handling through the navigation stack
      const handled = handleGoBack();
      if (handled) {
        return true;
      }

      // 3. At root level ('home' or 'welcome' on initial launch): double-tap to exit on Android
      if (currentScreen === 'home' || currentScreen === 'welcome') {
        const now = Date.now();
        if (now - lastBackPressRef.current < 2000) {
          BackHandler.exitApp();
          return true;
        }
        lastBackPressRef.current = now;
        if (Platform.OS === 'android') {
          ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
        }
        return true; // Intercept first back press to prevent accidental exit
      }

      return false;
    };

    const backSubscription = BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress);
    return () => backSubscription.remove();
  }, [currentScreen, navHistory, activeDetail]);

  // Restore navigation and language state from persistent storage on mount
  useEffect(() => {
    // Warm image cache in background so screens transition instantly
    Asset.loadAsync([
      require('./assets/deities/deity_selection_bg.jpg'),
      require('./assets/deities/saranam_deity_emblem.png'),
      require('./assets/role_selection/role_customer.jpg'),
      require('./assets/role_selection/role_dharma_kartha.jpg'),
    ]).catch(() => {});

    async function loadPersistedState() {
      const restored = await StorageService.restoreState();
      setSelectedLanguage(restored.language);
      setActiveDetail(restored.activeDetail);
      if (restored.currentUser) {
        setCurrentUser(restored.currentUser);
      }
      const savedDeity = await StorageService.getStoredDeity();
      if (savedDeity) {
        setCurrentDeity(savedDeity);
      }
      const savedRole = await StorageService.getPendingRole();
      if (savedRole) {
        setSelectedRole(savedRole as UserRole);
      }
      if (
        restored.currentUser &&
        (restored.initialScreen === 'home' ||
          restored.initialScreen === 'categories' ||
          restored.initialScreen === 'profile')
      ) {
        setCurrentScreen(restored.initialScreen);
      }
      setIsReady(true);
    }
    loadPersistedState();
  }, []);

  // When Splash Screen finishes -> First launch strictly starts with Onboarding
  const handleSplashFinish = (targetScreen?: MobileScreen) => {
    StorageService.getStoredUser()
      .then((user) => {
        if (user) {
          if (!user?.profileOnboardingStatus || user.profileOnboardingStatus === 'PENDING') {
            setCurrentScreen('complete_profile');
            StorageService.saveNavigationState('complete_profile', null);
          } else {
            setCurrentScreen('home');
            StorageService.saveNavigationState('home', null);
          }
        } else {
          // Devotee starts with the 2 onboarding screens
          setCurrentScreen('onboarding');
          StorageService.saveNavigationState('onboarding', null);
        }
      })
      .catch((err) => {
        console.warn('Splash finish fallback:', err);
        setCurrentScreen('onboarding');
        StorageService.saveNavigationState('onboarding', null);
      });
  };

  // When devotee taps "Get Started" on Welcome Screen -> Show Onboarding
  const handleWelcomeGetStarted = () => {
    setCurrentScreen('onboarding');
    StorageService.saveNavigationState('onboarding', null);
  };

  // When devotee finishes or skips Onboarding -> Proceed to Choose Your Role
  const handleOnboardingFinish = () => {
    StorageService.setOnboardingCompleted();
    setCurrentScreen('role_selection');
    StorageService.saveNavigationState('role_selection', null);
  };

  // When devotee selects role and taps Continue -> Proceed to Login
  const handleRoleContinue = (role: UserRole) => {
    setSelectedRole(role);
    StorageService.setPendingRole(role);
    setAuthInitialStep('LOGIN');
    setCurrentScreen('auth');
    StorageService.saveNavigationState('auth', null);
  };

  // When devotee taps Back on Role Selection Screen -> Return to Onboarding
  const handleRoleBack = () => {
    setCurrentScreen('onboarding');
    StorageService.saveNavigationState('onboarding', null);
  };

  // When devotee chooses Deity and taps Continue -> Proceed to Home (or Complete Profile if pending)
  const handleDeityContinue = (selectedDeity: any) => {
    setCurrentDeity(selectedDeity);
    StorageService.setStoredDeity(selectedDeity);
    if (navHistory.length > 0 && navHistory[navHistory.length - 1].screen === 'profile') {
      handleGoBack();
    } else if (currentUser && (!currentUser.profileOnboardingStatus || currentUser.profileOnboardingStatus === 'PENDING')) {
      setCurrentScreen('complete_profile');
      StorageService.saveNavigationState('complete_profile', null);
    } else {
      setCurrentScreen('home');
      StorageService.saveNavigationState('home', null);
    }
  };

  // When devotee taps Back on Login / Auth -> Return to Role Selection
  const handleAuthBack = () => {
    if (!currentUser) {
      setCurrentScreen('role_selection');
      StorageService.saveNavigationState('role_selection', null);
    } else {
      setCurrentScreen('profile');
      StorageService.saveNavigationState('profile', null);
    }
  };

  // When devotee taps Back on Language Screen
  const handleLanguageBack = () => {
    if (navHistory.length > 0) {
      handleGoBack();
    } else if (currentUser) {
      setCurrentScreen('profile');
      StorageService.saveNavigationState('profile', null);
    }
  };

  // When devotee taps Back on Choose Deity -> Return to Language Selection
  const handleDeityBack = () => {
    setCurrentScreen('language');
    StorageService.saveNavigationState('language', null);
  };

  // When devotee taps Back on Onboarding Screen 1
  const handleOnboardingBackToWelcome = () => {
    // Screen 1 has no back button
  };

  // When devotee taps "Explore as Guest" on Welcome Screen
  const handleWelcomeExploreGuest = () => {
    setCurrentScreen('onboarding');
    StorageService.saveNavigationState('onboarding', null);
  };

  // When devotee logs in or registers successfully -> Strictly proceed to Language Selection
  const handleAuthSuccess = (user: any) => {
    setCurrentUser(user);
    StorageService.setStoredUser(user);
    // After login screen -> strictly proceed to Language Selection
    setCurrentScreen('language');
    StorageService.saveNavigationState('language', null);
  };

  const handleProfileDone = (updated?: any) => {
    if (updated) {
      setCurrentUser(updated);
      StorageService.setStoredUser(updated);
    }
    setCurrentScreen('home');
    StorageService.saveNavigationState('home', null);
  };

  const handleSkipAuth = () => {
    // Guest devotees also strictly proceed to Language Selection -> God Selection
    setCurrentScreen('language');
    StorageService.saveNavigationState('language', null);
  };

  // After devotee selects their language -> Strictly proceed to God Selection (Choose Your Deity)
  const handleLanguageSelect = (lang: SupportedLanguage) => {
    setSelectedLanguage(lang);
    StorageService.setStoredLanguage(lang);
    setActiveDetail(null);
    if (navHistory.length > 0 && navHistory[navHistory.length - 1].screen === 'profile') {
      handleGoBack();
    } else {
      // Strictly proceed to God Selection (choose_deity) after Language Selection
      setCurrentScreen('choose_deity');
      StorageService.saveNavigationState('choose_deity', null);
    }
  };

  const handleTabChange = (tab: MainTab) => {
    if (tab === 'home') {
      navigateTo('home');
    } else if (tab === 'services' || tab === 'categories') {
      navigateTo('categories');
    } else if (tab === 'temples') {
      navigateTo('temples', { id: 'temples', title: 'Temples in India' });
    } else if (tab === 'panchangam') {
      navigateTo('panchangam');
    } else if (tab === 'profile') {
      navigateTo('profile');
    }
  };

  const handleOpenDetail = (id: string, title: string) => {
    if (id === 'bhajans' || id === 'harathis' || id === 'songs' || id === 'bhajans-songs') {
      navigateTo('bhajans_songs', { id, title: title || 'Bhajans & Songs' });
    } else if (id === 'live-streams' || id === 'live' || id === 'live_streams' || id === 'live-darshan') {
      navigateTo('live_streams', { id, title: title || 'Live Streams' });
    } else if (id === 'temples' || id === 'temples-in-india' || id === 'temple_listing') {
      navigateTo('temples', { id, title: title || 'Temples in India' });
    } else if (id.startsWith('temple-') || id.startsWith('temple:') || id === 'temple_detail') {
      const cleanId = id.startsWith('temple:') ? id.replace('temple:', '') : id;
      navigateTo('temple_detail', { id: cleanId, title });
    } else if (id === 'food-donation' || id === 'annadanam' || id === 'food_donation') {
      navigateTo('food_donation', { id, title: title || 'Food Donation (Annadanam)' });
    } else if (id === 'donations' || id === 'donation' || id === 'seva-booking') {
      navigateTo('donations', { id, title: title || 'Donations' });
    } else if (id === 'festivals' || id === 'festival' || id === 'festivals-calendar' || id === 'temple-festivals') {
      navigateTo('festivals', { id, title: title || 'Festivals & Sacred Days' });
    } else {
      const listingCategories = ['pooja-vidhanam', 'astothrams', 'slokas'];
      if (listingCategories.includes(id)) {
        navigateTo('category_listing', { id, title });
      } else if (id.includes('pooja') || id.includes('vratham') || id.includes('abhishekam')) {
        navigateTo('pooja_detail', { id, title });
      } else if (
        id.includes('sloka') ||
        id.includes('stotram') ||
        id.includes('tandava') ||
        id.includes('pancharatnam') ||
        id.includes('gayatri') ||
        id.includes('suprabhatam') ||
        id.includes('ashtakam') ||
        id.includes('chalisa')
      ) {
        navigateTo('sloka_detail', { id, title });
      } else {
        navigateTo('detail', { id, title });
      }
    }
  };

  const handleOpenPanchangam = () => {
    navigateTo('panchangam');
  };

  const handleOpenFestivals = () => {
    navigateTo('festivals');
  };

  const handleBackToHome = () => {
    handleGoBack();
  };

  const handleOpenAbout = () => {
    navigateTo('about');
  };

  const handleOpenContact = () => {
    navigateTo('contact');
  };

  const handleOpenLanguage = () => {
    navigateTo('language');
  };

  const handleLogout = async () => {
    setCurrentUser(null);
    StorageService.setStoredUser(null);
    setNavHistory([]);
    setCurrentScreen('auth');
    StorageService.saveNavigationState('auth', null);
  };

  const handleProfileSaved = (updated?: any) => {
    if (updated) {
      setCurrentUser(updated);
      StorageService.setStoredUser(updated);
    }
    setCurrentScreen('profile');
    StorageService.saveNavigationState('profile', null);
  };

  const isMainTabScreen =
    currentScreen === 'home' ||
    currentScreen === 'categories' ||
    currentScreen === 'services' ||
    currentScreen === 'temples' ||
    currentScreen === 'panchangam' ||
    currentScreen === 'festivals' ||
    currentScreen === 'profile' ||
    currentScreen === 'category_listing' ||
    currentScreen === 'bhajans_songs' ||
    currentScreen === 'live_streams' ||
    currentScreen === 'temple_detail' ||
    currentScreen === 'food_donation' ||
    currentScreen === 'donations' ||
    currentScreen === 'edit_profile' ||
    currentScreen === 'notifications' ||
    currentScreen === 'terms' ||
    currentScreen === 'privacy_policy' ||
    currentScreen === 'about' ||
    currentScreen === 'contact';

  const isSaffronHeaderScreen =
    currentScreen === 'splash' ||
    currentScreen === 'welcome' ||
    currentScreen === 'onboarding' ||
    currentScreen === 'role_selection' ||
    currentScreen === 'choose_deity' ||
    currentScreen === 'language' ||
    currentScreen === 'auth' ||
    currentScreen === 'home' ||
    currentScreen === 'detail' ||
    currentScreen === 'pooja_detail' ||
    currentScreen === 'sloka_detail' ||
    currentScreen === 'bhajans_songs' ||
    currentScreen === 'live_streams' ||
    currentScreen === 'temples' ||
    currentScreen === 'temple_detail' ||
    currentScreen === 'category_listing' ||
    currentScreen === 'panchangam' ||
    currentScreen === 'about' ||
    currentScreen === 'contact' ||
    currentScreen === 'terms' ||
    currentScreen === 'privacy_policy' ||
    currentScreen === 'food_donation' ||
    currentScreen === 'donations' ||
    currentScreen === 'notifications';

  let activeTab: MainTab = 'home';
  if (currentScreen === 'home') {
    activeTab = 'home';
  } else if (
    currentScreen === 'categories' ||
    currentScreen === 'services' ||
    currentScreen === 'category_listing' ||
    currentScreen === 'bhajans_songs' ||
    currentScreen === 'live_streams' ||
    currentScreen === 'food_donation' ||
    currentScreen === 'donations'
  ) {
    activeTab = 'services';
  } else if (currentScreen === 'temples' || currentScreen === 'temple_detail') {
    activeTab = 'temples';
  } else if (currentScreen === 'panchangam') {
    activeTab = 'panchangam';
  } else if (
    currentScreen === 'profile' ||
    currentScreen === 'edit_profile' ||
    currentScreen === 'notifications' ||
    currentScreen === 'terms' ||
    currentScreen === 'privacy_policy' ||
    currentScreen === 'about' ||
    currentScreen === 'contact'
  ) {
    activeTab = 'profile';
  }

  if (!shouldRenderApp) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0C251E', justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar style="light" backgroundColor="#0C251E" translucent />
        <Image
          source={require('./assets/deities/saranam_deity_emblem.png')}
          style={{
            width: SCREEN_WIDTH * 0.86,
            height: SCREEN_WIDTH * 0.86 * 1.176,
            maxWidth: 380,
            maxHeight: 446,
          }}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        style={isSaffronHeaderScreen ? 'light' : 'dark'}
        backgroundColor={isSaffronHeaderScreen ? '#D84315' : '#FAF5EB'}
        translucent={false}
      />

      {/* Screen Body */}
      <View style={styles.body}>
        {currentScreen === 'splash' && (
          <SplashScreen onFinish={handleSplashFinish} />
        )}

        {currentScreen === 'onboarding' && (
          <OnboardingScreen
            onFinish={handleOnboardingFinish}
          />
        )}

        {currentScreen === 'role_selection' && (
          <RoleSelectionScreen
            initialRole={selectedRole}
            onContinue={handleRoleContinue}
            onBack={handleRoleBack}
          />
        )}

        {currentScreen === 'choose_deity' && (
          <ChooseDeityScreen
            currentLanguage={selectedLanguage}
            onContinue={handleDeityContinue}
            onBack={handleDeityBack}
          />
        )}

        {currentScreen === 'auth' && (
          <AuthScreen
            currentLanguage={selectedLanguage}
            selectedRole={selectedRole}
            initialStep={authInitialStep}
            onLoginSuccess={handleAuthSuccess}
            onSkip={handleSkipAuth}
            onBack={handleAuthBack}
          />
        )}

        {currentScreen === 'complete_profile' && (
          <CompleteProfileScreen
            currentLanguage={selectedLanguage}
            currentUser={currentUser}
            onProfileSaved={handleProfileDone}
            onSkip={() => handleProfileDone(currentUser)}
            onBack={handleGoBack}
          />
        )}

        {currentScreen === 'language' && (
          <LanguageSelectionScreen
            currentLanguage={selectedLanguage}
            currentUser={currentUser}
            currentDeity={currentDeity}
            onLanguageSelected={handleLanguageSelect}
          />
        )}

        {currentScreen === 'home' && (
          <HomeScreen
            currentLanguage={selectedLanguage}
            currentDeity={currentDeity}
            onOpenLanguageScreen={handleOpenLanguage}
            onOpenAboutScreen={handleOpenAbout}
            onOpenContactScreen={handleOpenContact}
            onOpenDetail={handleOpenDetail}
            onOpenPanchangam={handleOpenPanchangam}
            onOpenFestivals={handleOpenFestivals}
            onNavigateToCategories={() => handleTabChange('categories')}
            onOpenNotifications={() => navigateTo('notifications')}
            onOpenProfile={() => navigateTo('profile')}
            onOpenSearch={() => handleTabChange('categories')}
          />
        )}

        {currentScreen === 'categories' && (
          <ServicesScreen
            currentLanguage={selectedLanguage}
            onOpenDetail={handleOpenDetail}
            onOpenPanchangam={handleOpenPanchangam}
            onBack={handleGoBack}
          />
        )}

        {currentScreen === 'profile' && (
          <ProfileScreen
            currentLanguage={selectedLanguage}
            currentUser={currentUser}
            currentDeity={currentDeity}
            selectedRole={selectedRole}
            userRole={selectedRole}
            onRoleSwitch={(role) => {
              setSelectedRole(role);
              StorageService.setPendingRole(role);
              if (currentUser) {
                const u = { ...currentUser, role };
                setCurrentUser(u);
                StorageService.setStoredUser(u);
              }
            }}
            onOpenEditProfile={() => navigateTo('edit_profile')}
            onOpenNotifications={() => navigateTo('notifications')}
            onOpenTerms={() => navigateTo('terms')}
            onOpenPrivacyPolicy={() => navigateTo('privacy_policy')}
            onOpenAbout={() => navigateTo('about')}
            onOpenAuth={() => navigateTo('auth')}
            onLanguageChange={(lang) => setSelectedLanguage(lang)}
            onDeityChange={(deity) => {
              setCurrentDeity(deity);
              StorageService.setStoredDeity(deity);
            }}
            onLogout={handleLogout}
            onBack={handleGoBack}
            onOpenFestivals={handleOpenFestivals}
            onNavigateDestination={(screen, detail) => {
              navigateTo(screen as MobileScreen, detail || null);
            }}
          />
        )}

        {currentScreen === 'edit_profile' && (
          <EditProfileScreen
            currentLanguage={selectedLanguage}
            currentUser={currentUser}
            isOnboarding={false}
            onBack={handleGoBack}
            onProfileSaved={handleProfileSaved}
            onLanguageChange={handleLanguageSelect}
            onNavigateTab={(tab) => {
              if (tab === 'home') navigateTo('home');
              else if (tab === 'categories') navigateTo('categories');
              else if (tab === 'profile') navigateTo('profile');
            }}
          />
        )}

        {currentScreen === 'terms' && (
          <TermsScreen
            currentLanguage={selectedLanguage}
            onBack={handleGoBack}
          />
        )}

        {currentScreen === 'privacy_policy' && (
          <PrivacyPolicyScreen
            currentLanguage={selectedLanguage}
            onBack={handleGoBack}
          />
        )}

        {currentScreen === 'about' && (
          <AboutScreen
            currentLanguage={selectedLanguage}
            onBack={handleGoBack}
            onNavigate={(screen, detail) => {
              navigateTo(screen as MobileScreen, detail || null);
            }}
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
            onBack={handleGoBack}
          />
        )}

        {currentScreen === 'festivals' && (
          <FestivalsScreen
            currentLanguage={selectedLanguage}
            onBack={handleGoBack}
          />
        )}

        {currentScreen === 'category_listing' && activeDetail && (
          <CategoryListingScreen
            categoryId={activeDetail.id}
            categoryTitle={activeDetail.title}
            currentLanguage={selectedLanguage}
            onSelectItem={(id, title) => {
              if (
                activeDetail.id === 'pooja-vidhanam' ||
                id.includes('pooja') ||
                id.includes('vratham') ||
                id.includes('abhishekam')
              ) {
                navigateTo('pooja_detail', { id, title });
              } else if (
                activeDetail.id === 'bhajans' ||
                activeDetail.id === 'harathis' ||
                id === 'bhajans' ||
                id === 'harathis' ||
                id.includes('bhajan') ||
                id.includes('harathi')
              ) {
                navigateTo('bhajans_songs', { id, title });
              } else if (
                activeDetail.id === 'slokas' ||
                id.includes('sloka') ||
                id.includes('stotram') ||
                id.includes('tandava') ||
                id.includes('pancharatnam') ||
                id.includes('gayatri') ||
                id.includes('suprabhatam') ||
                id.includes('ashtakam') ||
                id.includes('chalisa')
              ) {
                navigateTo('sloka_detail', { id, title });
              } else {
                navigateTo('detail', { id, title });
              }
            }}
            onBack={handleGoBack}
          />
        )}

        {currentScreen === 'bhajans_songs' && (
          <BhajansSongsScreen
            initialCategory={
              activeDetail?.id === 'harathis'
                ? 'harathis'
                : activeDetail?.id === 'songs'
                ? 'songs'
                : 'bhajans'
            }
            currentLanguage={selectedLanguage}
            currentDeity={currentDeity}
            onBack={handleGoBack}
            onOpenTrackDetail={(trackId, trackTitle) => {
              navigateTo('sloka_detail', { id: trackId, title: trackTitle });
            }}
          />
        )}

        {currentScreen === 'live_streams' && (
          <LiveStreamsScreen
            currentLanguage={selectedLanguage}
            currentDeity={currentDeity}
            onBack={handleGoBack}
            onOpenTempleDetail={(templeId, templeName) => {
              navigateTo('temple_detail', { id: templeId, title: templeName });
            }}
          />
        )}

        {currentScreen === 'temples' && (
          <TemplesListScreen
            currentLanguage={selectedLanguage}
            currentDeity={currentDeity?.name || currentDeity?.id}
            onBack={handleGoBack}
            onSelectTemple={(temple) => {
              setActiveTempleData(temple);
              navigateTo('temple_detail', { id: temple.id, title: temple.name });
            }}
          />
        )}

        {currentScreen === 'temple_detail' && activeDetail && (
          <TempleProfileScreen
            templeId={activeDetail.id}
            templeData={activeTempleData}
            currentLanguage={selectedLanguage}
            onBack={handleGoBack}
            onOpenLiveDarshan={(streamId, templeTitle) => {
              navigateTo('live_streams', { id: streamId, title: templeTitle });
            }}
          />
        )}

        {(currentScreen === 'pooja_detail' ||
          (currentScreen === 'detail' &&
            activeDetail &&
            (activeDetail.id.includes('pooja') ||
              activeDetail.id.includes('vratham') ||
              activeDetail.id.includes('abhishekam')))) &&
          activeDetail && (
            <PoojaDetailScreen
              itemId={activeDetail.id}
              title={activeDetail.title}
              currentLanguage={selectedLanguage}
              onBack={handleGoBack}
            />
          )}

        {(currentScreen === 'sloka_detail' ||
          (currentScreen === 'detail' &&
            activeDetail &&
            (activeDetail.id.includes('sloka') ||
              activeDetail.id.includes('stotram') ||
              activeDetail.id.includes('tandava') ||
              activeDetail.id.includes('pancharatnam') ||
              activeDetail.id.includes('gayatri') ||
              activeDetail.id.includes('suprabhatam') ||
              activeDetail.id.includes('ashtakam') ||
              activeDetail.id.includes('chalisa')))) &&
          activeDetail && (
            <SlokaDetailScreen
              itemId={activeDetail.id}
              title={activeDetail.title}
              currentLanguage={selectedLanguage}
              onBack={handleGoBack}
            />
          )}

        {currentScreen === 'detail' &&
          activeDetail &&
          !(
            activeDetail.id.includes('pooja') ||
            activeDetail.id.includes('vratham') ||
            activeDetail.id.includes('abhishekam') ||
            activeDetail.id.includes('sloka') ||
            activeDetail.id.includes('stotram') ||
            activeDetail.id.includes('tandava') ||
            activeDetail.id.includes('pancharatnam') ||
            activeDetail.id.includes('gayatri') ||
            activeDetail.id.includes('suprabhatam') ||
            activeDetail.id.includes('ashtakam') ||
            activeDetail.id.includes('chalisa')
          ) && (
            <DetailScreen
              title={activeDetail.title}
              itemId={activeDetail.id}
              currentLanguage={selectedLanguage}
              onBack={handleGoBack}
            />
          )}

        {currentScreen === 'food_donation' && (
          <FoodDonationScreen
            currentLanguage={selectedLanguage}
            initialTab={activeDetail?.id === 'contribute' ? 'contribute' : 'locations'}
            onBack={handleGoBack}
            onNavigateToDonations={() => navigateTo('donations')}
          />
        )}

        {currentScreen === 'donations' && (
          <DonationsScreen
            currentLanguage={selectedLanguage}
            currentUser={currentUser}
            onBack={handleGoBack}
            onNavigateToAnnadanam={() =>
              navigateTo('food_donation', { id: 'contribute', title: 'Food Donation (Annadanam)' })
            }
            onNavigateToAuth={() => navigateTo('auth')}
          />
        )}

        {currentScreen === 'notifications' && (
          <NotificationsScreen
            currentLanguage={selectedLanguage}
            currentUser={currentUser}
            userRole={selectedRole === 'DHARMA_KARTHA' ? 'DHARMA_KARTHA' : 'CUSTOMER'}
            onBack={handleGoBack}
            onNavigateDestination={(screen, detail) => {
              navigateTo(screen as MobileScreen, detail || null);
            }}
          />
        )}

        {/* Sacred Devotional Watermark - Centered on Every Page Except Splash and Home Screens */}
        {currentScreen !== 'splash' && currentScreen !== 'home' && (
          <View style={styles.globalWatermarkContainer} pointerEvents="none">
            <Image
              source={AYYAPPA_WATERMARK}
              style={styles.globalWatermarkImage}
              resizeMode="contain"
            />
          </View>
        )}
      </View>

      {/* Bottom Navigation Tab Bar (Home, Categories, Profile) shown downside */}
      {isMainTabScreen && (
        <BottomTabBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          language={selectedLanguage}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5EB',
  },
  body: {
    flex: 1,
    position: 'relative',
  },
  globalWatermarkContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    opacity: 0.08,
  },
  globalWatermarkImage: {
    width: Math.min(SCREEN_WIDTH * 0.88, 380),
    height: Math.min(SCREEN_HEIGHT * 0.65, 500),
  },
});
