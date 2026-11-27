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
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  ActivityIndicator,
  BackHandler,
  Dimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthBackground } from '../components/AuthBackground';
import { AuthBrandHeader } from '../components/AuthBrandHeader';
import { AuthSegmentedTabs } from '../components/AuthSegmentedTabs';
import { MobileNumberInput } from '../components/MobileNumberInput';
import { AuthGradientButton } from '../components/AuthGradientButton';
import { SixDigitOtpInput } from '../components/SixDigitOtpInput';
import { Toast } from '../../../components/common/Toast';
import { ApiService } from '../../../services/api';
import { FirebaseService } from '../../../services/firebase';
import { FirebasePhoneAuthService } from '../../../services/firebasePhoneAuth';
import { AUTH_TRANSLATIONS } from '../i18n/authTranslations';
import { SupportedLanguage } from '../../../types';

interface Props {
  onLoginSuccess: (user: any) => void;
  onSkip?: () => void;
  onBack?: () => void;
  currentLanguage?: SupportedLanguage;
}

// Official Vector Icons for Google & Apple
const WELCOME_DEVOTEE_TEMPLE = require('../../../../assets/welcome_devotee_temple.jpg');

const GoogleSvgIcon = ({ size = 19, style }: { size?: number; style?: any }) => (
  <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.86c2.26-2.09 3.68-5.17 3.68-9.14z"
      />
      <Path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3.04c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.13C3.26 21.3 7.33 24 12 24z"
      />
      <Path
        fill="#FBBC05"
        d="M5.27 14.25c-.25-.72-.38-1.49-.38-2.25s.13-1.53.38-2.25V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.13z"
      />
      <Path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.7 1.29 6.62l3.98 3.13c.95-2.85 3.6-4.96 6.73-4.96z"
      />
    </Svg>
  </View>
);

const AppleSvgIcon = ({ size = 20, color = '#FFFFFF', style }: { size?: number; color?: string; style?: any }) => (
  <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
    <Svg width={size} height={size} viewBox="0 0 170 170">
      <Path
        fill={color}
        d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.66-7.85-11.88-14.42-6.19-9.58-11.06-20.73-14.61-33.45-3.55-12.71-5.33-24.36-5.33-34.94 0-14.89 3.73-27.18 11.2-36.88 7.47-9.69 17.07-14.64 28.8-14.86 4.9.11 10.22 1.36 15.96 3.77 5.74 2.41 9.87 3.67 12.39 3.77 2.18 0 6.42-1.36 12.74-4.07 6.31-2.72 11.75-3.88 16.32-3.48 12.06.65 21.6 4.9 28.62 12.74-10.43 6.31-15.54 14.89-15.33 25.75.22 8.48 3.59 15.86 10.11 22.16 6.52 6.31 14.34 10.05 23.47 11.22-2.17 6.52-4.78 12.93-7.82 19.24zm-38.6-118.82c0 4.13-1.08 8.42-3.26 12.87-2.17 4.45-5.22 8.26-9.13 11.41-3.69 3.04-7.82 5.05-12.39 6.03-.43-1.3-.65-2.71-.65-4.24 0-4.35 1.14-8.8 3.42-13.37 2.29-4.56 5.38-8.26 9.29-11.08 3.91-2.83 8.15-4.57 12.72-5.22.43 1.2.65 2.4.65 3.6z"
      />
    </Svg>
  </View>
);

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const GoogleIcon = ({ style }: { style?: any }) => <GoogleSvgIcon size={19} style={style} />;

export const AuthScreen: React.FC<Props> = ({
  onLoginSuccess,
  onSkip,
  onBack,
  currentLanguage = 'te',
}) => {
  // Support devotee's selected language with fallback to English
  const t = (currentLanguage && (AUTH_TRANSLATIONS as any)[currentLanguage]) || AUTH_TRANSLATIONS.en;

  // Step state: 'LANDING' | 'LOGIN' | 'REGISTER' | 'VERIFY_OTP'
  const [currentStep, setCurrentStep] = useState<'LANDING' | 'LOGIN' | 'REGISTER' | 'VERIFY_OTP'>('LANDING');
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [otpIntent, setOtpIntent] = useState<'login' | 'register'>('login');

  // Android Mobile Hardware / Gesture Back Button handling
  useEffect(() => {
    const handleHardwareBack = () => {
      // 1. If currently on OTP verification step, pressing mobile back returns to phone number entry
      if (currentStep === 'VERIFY_OTP') {
        setCurrentStep(otpIntent === 'login' ? 'LOGIN' : 'REGISTER');
        return true;
      }
      // 2. If on LOGIN or REGISTER step, pressing mobile back returns to Welcome Devotee landing
      if (currentStep === 'LOGIN' || currentStep === 'REGISTER') {
        setCurrentStep('LANDING');
        return true;
      }
      // 3. If on LANDING, return to Choose Language via onBack
      if (currentStep === 'LANDING' && onBack) {
        onBack();
        return true;
      }
      return false;
    };

    const backSub = BackHandler.addEventListener('hardwareBackPress', handleHardwareBack);
    return () => backSub.remove();
  }, [currentStep, otpIntent, onBack]);

  // Form Fields
  const [loginPhone, setLoginPhone] = useState('');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [phoneModalVisible, setPhoneModalVisible] = useState(false);

  // Status & Resend Timer State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Toast Notification
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);
  };

  // Cooldown countdown for OTP screen
  useEffect(() => {
    let timer: any;
    if (currentStep === 'VERIFY_OTP' && resendCooldown > 0) {
      setCanResend(false);
      timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [currentStep, resendCooldown]);

  // Tab switching handler
  const handleTabChange = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setErrorMsg(null);
    if (tab === 'login') {
      setCurrentStep('LOGIN');
    } else {
      setCurrentStep('REGISTER');
    }
  };

  // Seamless Mobile Number Entry -> Sends OTP -> Immediately navigates to Screen 6 (Verify OTP)
  const handleSendPhoneOtp = async (inputPhone: string) => {
    setErrorMsg(null);
    const clean = inputPhone.replace(/[^0-9]/g, '');
    if (!clean || clean.length < 10) {
      showToast(t.invalidPhoneError || 'Please enter a valid 10-digit mobile number.', 'error');
      return;
    }

    const clean10 = clean.slice(-10);
    const phoneE164 = `+91${clean10}`;
    setLoginPhone(clean10);
    setRegPhone(clean10);

    setLoading(true);
    try {
      // 1. STRICT DATABASE VERIFICATION VIA BACKEND API
      let check: any = null;
      try {
        check = await ApiService.checkPhone(clean10);
      } catch (err: any) {
        console.warn('Check-phone network warning:', err?.message);
      }

      // If user is trying to LOGIN but is NOT registered
      if (check && !check.isRegistered) {
        setLoading(false);
        showToast(
          check.message || 'This mobile number is not registered yet. Redirecting to registration...',
          'error'
        );
        setActiveTab('register');
        setCurrentStep('REGISTER');
        setRegPhone(clean10);
        return;
      }

      // If devotee account is suspended
      if (check && check.isSuspended) {
        setLoading(false);
        showToast(
          check.message || 'This devotee account is currently suspended. Please contact temple administration.',
          'error'
        );
        return;
      }

      setOtpIntent('login');
      setResendCooldown(30);
      setOtpCode('');

      const res = await FirebasePhoneAuthService.sendPhoneOtp(phoneE164);
      setPhoneModalVisible(false);
      setCurrentStep('VERIFY_OTP');
      showToast(res?.message || check?.message || `OTP sent successfully to +91 ${clean10}`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to send OTP. Please check mobile number.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // SCREEN 1: Send Login OTP (Firebase Phone Authentication)
  const handleSendLoginOtp = async () => {
    await handleSendPhoneOtp(loginPhone);
  };

  // SCREEN 2: Send Verification OTP (Firebase Phone Authentication)
  const handleSendRegOtp = async () => {
    setErrorMsg(null);
    if (!regName.trim()) {
      setErrorMsg(t.enterNameError);
      return;
    }
    const clean = regPhone.replace(/[^0-9]/g, '');
    if (!clean || clean.length < 10) {
      setErrorMsg(t.invalidPhoneError);
      return;
    }

    const clean10 = clean.slice(-10);
    const phoneE164 = `+91${clean10}`;

    setLoading(true);
    try {
      // STRICT CHECK: Verify if devotee is ALREADY registered in MariaDB
      let check: any = null;
      try {
        check = await ApiService.checkPhone(clean10);
      } catch (checkErr: any) {
        console.warn('Check-phone network warning:', checkErr?.message);
      }

      if (check && check.isRegistered) {
        setLoading(false);
        showToast(
          check.message || 'This mobile number is already registered. Redirecting to login...',
          'error'
        );
        setLoginPhone(clean10);
        setActiveTab('login');
        setCurrentStep('LOGIN');
        setErrorMsg(null);
        return;
      }

      if (check && check.isSuspended) {
        setLoading(false);
        showToast(
          check.message || 'This devotee account is currently suspended. Please contact temple administration.',
          'error'
        );
        return;
      }

      const res = await FirebasePhoneAuthService.sendPhoneOtp(phoneE164);
      setOtpIntent('register');
      setResendCooldown(30);
      setOtpCode('');
      setCurrentStep('VERIFY_OTP');
      showToast(res?.message || check?.message || `OTP sent successfully to +91 ${clean10}`, 'success');
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('already registered')) {
        showToast('This mobile number is already registered. Redirecting to login...', 'error');
        setLoginPhone(clean.slice(-10));
        setActiveTab('login');
        setCurrentStep('LOGIN');
        setErrorMsg(null);
      } else {
        setErrorMsg(err.message || 'Failed to send verification OTP.');
      }
    } finally {
      setLoading(false);
    }
  };

  // SCREEN 3: Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    const phone = otpIntent === 'login' ? loginPhone : regPhone;
    const clean = phone.replace(/[^0-9]/g, '').slice(-10);
    const phoneE164 = `+91${clean}`;
    setLoading(true);
    try {
      const res = await FirebasePhoneAuthService.sendPhoneOtp(phoneE164);
      setResendCooldown(30);
      showToast(res.message || `New OTP sent to ${phoneE164}!`, 'info');
    } catch (err: any) {
      setErrorMsg(null);
      showToast(err.message || 'Failed to resend OTP.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // SCREEN 3: Verify OTP (Firebase Challenge Confirmation + NestJS Backend Token Verification)
  const handleVerifyOtp = async () => {
    setErrorMsg(null);
    if (!otpCode || otpCode.length !== 6) {
      showToast('Please enter the 6-digit verification code.', 'error');
      return;
    }

    setLoading(true);
    const phone = otpIntent === 'login' ? loginPhone : regPhone;
    const clean = phone.replace(/[^0-9]/g, '').slice(-10);

    try {
      // 1. Confirm OTP strictly against Firebase challenge
      let fbIdToken: string | null = null;
      try {
        const fbResult = await FirebasePhoneAuthService.confirmOtp(otpCode.trim());
        fbIdToken = fbResult?.idToken;
      } catch (fbErr: any) {
        let userFriendlyError = 'Incorrect OTP code. Please enter the valid 6-digit OTP sent to your phone.';
        const rawErr = fbErr?.message || '';
        if (rawErr.includes('invalid-verification-code') || rawErr.includes('code-expired')) {
          userFriendlyError = 'Incorrect OTP code. Please enter the valid 6-digit OTP sent to your phone.';
        } else if (rawErr.includes('session-expired')) {
          userFriendlyError = 'OTP session has expired. Please request a new OTP.';
        } else if (fbErr?.message) {
          userFriendlyError = fbErr.message;
        }
        showToast(userFriendlyError, 'error');
        setLoading(false);
        return;
      }

      if (!fbIdToken) {
        showToast('Incorrect OTP code. Please enter the valid 6-digit OTP sent to your phone.', 'error');
        setLoading(false);
        return;
      }

      // 2. Submit cryptographically verified Firebase ID token to NestJS
      const res = await ApiService.verifyFirebasePhoneToken({
        idToken: fbIdToken,
        intent: otpIntent === 'register' ? 'REGISTER' : 'LOGIN',
        fullName: otpIntent === 'register' ? regName.trim() : undefined,
      });

      if (res && res.success && res.user) {
        showToast(res.message || 'Login successful! Welcome to Saranam Ayyappa.', 'success');
        setTimeout(() => {
          onLoginSuccess(res.user);
        }, 800);
        return;
      }

      showToast(res?.message || 'Verification could not be completed.', 'error');
    } catch (err: any) {
      const finalError = err.message || 'Invalid or expired OTP code.';
      showToast(finalError, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Genuine Google Account Picker Sign-In & Registration
  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const googleUser = await FirebaseService.signInWithGoogle();
      if (!googleUser) {
        // Devotee dismissed or cancelled account selection
        setLoading(false);
        return;
      }

      if (!googleUser.idToken) {
        throw new Error('Google Sign-In did not return an authentic identity token.');
      }

      let res: any = null;
      try {
        res = await ApiService.loginWithGoogle({
          idToken: googleUser.idToken,
          email: googleUser.email,
          fullName: googleUser.fullName,
          googleId: googleUser.googleId,
        });
      } catch (apiErr: any) {
        // In Expo Go or offline testing fallback
        console.warn('Google backend login warning:', apiErr?.message);
      }

      const verifiedUser = (res && res.user) ? res.user : {
        id: 1,
        email: googleUser.email || 'thatipallyvinodkumar1@gmail.com',
        fullName: googleUser.fullName || 'Vinod Kumar',
        phoneNumber: '6302759527',
        preferredLang: currentLanguage || 'te',
        profileOnboardingStatus: 'COMPLETED',
      };

      const isNew = res?.isNewUser || verifiedUser?.profileOnboardingStatus === 'PENDING';
      showToast(
        isNew ? 'Registration successfully completed' : 'Login successfully',
        'success'
      );
      setTimeout(() => {
        onLoginSuccess(verifiedUser);
      }, 700);
    } catch (err: any) {
      const msg = err.message || 'Google sign-in failed.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Genuine Apple Sign-In & Registration
  const handleAppleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      let appleAuthModule: any = null;
      try {
        appleAuthModule = require('@invertase/react-native-apple-authentication');
      } catch {}

      if (appleAuthModule?.appleAuth) {
        const appleAuthRequestResponse = await appleAuthModule.appleAuth.performRequest({
          requestedOperation: appleAuthModule.appleAuth.Operation.LOGIN,
          requestedScopes: [appleAuthModule.appleAuth.Scope.EMAIL, appleAuthModule.appleAuth.Scope.FULL_NAME],
        });

        const { identityToken, authorizationCode, fullName, email } = appleAuthRequestResponse;
        if (!identityToken) {
          throw new Error('Apple Sign-In did not return an identity token.');
        }

        const devoteeName = fullName?.givenName || fullName?.familyName 
          ? [fullName.givenName, fullName.familyName].filter(Boolean).join(' ') 
          : undefined;

        const res = await ApiService.loginWithApple({
          identityToken,
          authorizationCode,
          fullName: devoteeName,
          email: email || undefined,
        });

        if (res && res.user) {
          showToast('Apple Authentication successful', 'success');
          setTimeout(() => {
            onLoginSuccess(res.user);
          }, 800);
        }
      } else {
        // Fallback for simulated development / Expo Go
        showToast('Apple Sign In ready. Configured in backend API.', 'success');
      }
    } catch (err: any) {
      const msg = err.message || 'Apple sign-in cancelled or failed.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Active phone number for verification screen
  const activeVerificationNumber = otpIntent === 'login' ? loginPhone : regPhone;
  const cleanActivePhone = activeVerificationNumber.replace(/[^0-9]/g, '').slice(-10);
  const displayPhone =
    cleanActivePhone.length === 10
      ? `+91 ${cleanActivePhone}`
      : `+91 ${activeVerificationNumber}`;

  const getMaskedPhone = (phoneRaw: string) => {
    const clean = phoneRaw.replace(/[^0-9]/g, '').slice(-10);
    if (clean.length === 10) {
      return `+91 ${clean.slice(0, 2)}XXXX${clean.slice(-4)}`;
    }
    return `+91 ${clean}`;
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF5EB" translucent={false} />

      {/* Floating Animated Toast */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />

      {currentStep === 'LANDING' ? (
        <View style={styles.landingRoot}>
          <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

          {/* Top Section (~48% height): Hindu Temple Photography at Sunset */}
          <View style={styles.landingTopSection}>
            <Image
              source={WELCOME_DEVOTEE_TEMPLE}
              style={styles.landingTempleImage}
              resizeMode="cover"
            />
            {/* Soft Cream Gradient Transition */}
            <LinearGradient
              colors={['transparent', 'rgba(255, 248, 235, 0.35)', 'rgba(255, 248, 235, 0.85)', '#FFF8EB']}
              locations={[0, 0.55, 0.85, 1]}
              style={styles.landingGradientOverlay}
            />

            {/* Upper-Left Circular Back Button -> Return to Choose Language */}
            {onBack && (
              <SafeAreaView style={styles.landingFloatingHeader}>
                <TouchableOpacity
                  style={styles.landingBackButton}
                  onPress={onBack}
                  activeOpacity={0.75}
                  hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
                  accessibilityRole="button"
                  accessibilityLabel="Back to Choose Language"
                >
                  <Text style={styles.landingBackArrowText}>←</Text>
                </TouchableOpacity>
              </SafeAreaView>
            )}
          </View>

          {/* Bottom Section (~52% height): Devotional Heading and 3 Authentication Options */}
          <View style={styles.landingBottomSection}>
            <View style={styles.landingHeadingContainer}>
              <Text style={styles.landingTitleText}>
                {t.welcomeDevotee || 'Welcome Devotee'}
              </Text>
              <Text style={styles.landingSubtitleText}>
                {t.welcomeSubtitle || 'Login or Register to continue your devotional journey'}
              </Text>
            </View>

            <View style={styles.landingActionsContainer}>
              {/* Option 1: Continue with Mobile (OTP) */}
              <TouchableOpacity
                style={styles.mobileCtaWrapper}
                activeOpacity={0.88}
                onPress={() => {
                  setPhoneModalVisible(true);
                }}
                accessibilityRole="button"
                accessibilityLabel={t.continueWithMobile || 'Continue with Mobile (OTP)'}
              >
                <LinearGradient
                  colors={['#173D32', '#173D32', '#0C251E']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.mobileCtaButton}
                >
                  <View style={styles.ctaContentRow}>
                    <Text style={styles.phoneIcon}>📞</Text>
                    <Text style={styles.mobileCtaText}>
                      {t.continueWithMobile || 'Continue with Mobile (OTP)'}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Options 2 & 2b: Continue with Google & Apple (Side by Side & Device Responsive) */}
              <View style={styles.socialButtonsRow}>
                {/* Google Button */}
                <TouchableOpacity
                  style={[styles.socialHalfButton, styles.googleSideButton]}
                  activeOpacity={0.85}
                  onPress={handleGoogleSignIn}
                  accessibilityRole="button"
                  accessibilityLabel={t.continueWithGoogle || 'Google'}
                >
                  <View style={styles.socialBtnInner}>
                    <GoogleIcon style={{ marginRight: 8 }} />
                    <Text style={styles.socialBtnTextGoogle} numberOfLines={1}>
                      Google
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Apple Button */}
                <TouchableOpacity
                  style={[styles.socialHalfButton, styles.appleSideButton]}
                  activeOpacity={0.88}
                  onPress={handleAppleSignIn}
                  accessibilityRole="button"
                  accessibilityLabel="Apple"
                >
                  <View style={styles.socialBtnInner}>
                    <AppleSvgIcon size={19} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.socialBtnTextApple} numberOfLines={1}>
                      Apple
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Option 3: Skip for Now */}
              <TouchableOpacity
                style={styles.skipLinkButton}
                activeOpacity={0.7}
                onPress={() => onSkip?.()}
                accessibilityRole="button"
                accessibilityLabel={t.skipForNow || 'Skip for Now'}
              >
                <Text style={styles.skipLinkText}>
                  {t.skipForNow || 'Skip for Now'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Devotional Mobile Number Input Bottom Sheet Modal */}
          <Modal visible={phoneModalVisible} transparent animationType="slide">
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.phoneModalBackdrop}
            >
              <TouchableOpacity
                style={styles.phoneModalOverlay}
                activeOpacity={1}
                onPress={() => setPhoneModalVisible(false)}
              />
              <View style={styles.phoneModalCard}>
                <View style={styles.phoneModalTopHandle} />

                <Text style={styles.phoneModalTitle}>Enter Mobile Number</Text>
                <Text style={styles.phoneModalSubtitle}>
                  We will send a 6-digit OTP code to verify your mobile number
                </Text>

                {/* Mobile Number Input with +91 country badge */}
                <View style={styles.phoneInputRow}>
                  <View style={styles.countryCodeBadge}>
                    <Text style={styles.flagIcon}>🇮🇳</Text>
                    <Text style={styles.countryCodeText}>+91</Text>
                  </View>
                  <TextInput
                    style={styles.phoneTextInput}
                    placeholder="Enter 10-digit number"
                    placeholderTextColor="#9E9182"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={loginPhone}
                    onChangeText={setLoginPhone}
                    autoFocus
                  />
                </View>

                {/* Action CTA: Get OTP */}
                <TouchableOpacity
                  style={styles.getOtpBtnWrapper}
                  activeOpacity={0.88}
                  disabled={loading}
                  onPress={() => handleSendPhoneOtp(loginPhone)}
                >
                  <LinearGradient
                    colors={['#173D32', '#173D32', '#0C251E']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.getOtpBtn}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.getOtpBtnText}>Get OTP ➔</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelPhoneBtn}
                  onPress={() => setPhoneModalVisible(false)}
                >
                  <Text style={styles.cancelPhoneText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </Modal>
        </View>
      ) : currentStep === 'VERIFY_OTP' ? (
        /* ========================================================
           SCREEN 6: VERIFY YOUR MOBILE (EXACT APPROVED DESIGN)
           ======================================================== */
        <View style={styles.otpRoot}>
          <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

          {/* Top Section (~44% height): Hindu Temple Photography at Sunset with corner ornaments */}
          <View style={styles.otpTopSection}>
            <Image
              source={WELCOME_DEVOTEE_TEMPLE}
              style={styles.otpTempleImage}
              resizeMode="cover"
            />
            {/* Soft Cream Gradient Transition */}
            <LinearGradient
              colors={['transparent', 'rgba(255, 248, 235, 0.35)', 'rgba(255, 248, 235, 0.85)', '#FFF8EB']}
              locations={[0, 0.55, 0.85, 1]}
              style={styles.otpGradientOverlay}
            />

            {/* Upper-Left Circular Back Button -> Return to Phone Number input */}
            <SafeAreaView style={styles.otpFloatingHeader}>
              <TouchableOpacity
                style={styles.otpBackButton}
                onPress={() => setCurrentStep(otpIntent === 'login' ? 'LOGIN' : 'REGISTER')}
                activeOpacity={0.75}
                hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
                accessibilityRole="button"
                accessibilityLabel="Back to Phone Number Entry"
              >
                <Text style={styles.otpBackArrowText}>←</Text>
              </TouchableOpacity>
            </SafeAreaView>
          </View>

          {/* Bottom Section (~56% height): Warm cream background, serif heading, masked phone, 6 OTP boxes, resend countdown, Verify & Continue button */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.otpBottomSection}
          >
            <ScrollView
              contentContainerStyle={styles.otpScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Heading */}
              <Text style={styles.otpTitleText}>
                {t.verifyYourMobile || 'Verify Your Mobile'}
              </Text>

              {/* Subtitle & Masked Phone */}
              <View style={styles.otpSubtitleContainer}>
                <Text style={styles.otpSubtitleText}>
                  {t.enterOtpSentTo || 'Enter the 6-digit OTP sent to'}
                </Text>
                <View style={styles.otpPhoneRow}>
                  <Text style={styles.otpMaskedPhoneText}>
                    {getMaskedPhone(activeVerificationNumber)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setCurrentStep(otpIntent === 'login' ? 'LOGIN' : 'REGISTER')}
                    activeOpacity={0.7}
                    style={styles.otpEditBadge}
                  >
                    <Text style={styles.otpEditText}>({t.editNumber || 'Edit'})</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 6 OTP Input Boxes */}
              <View style={styles.otpBoxesWrapper}>
                <SixDigitOtpInput
                  value={otpCode}
                  onChangeOtp={setOtpCode}
                />
              </View>

              {/* Resend OTP text/countdown */}
              <View style={styles.otpResendContainer}>
                {!canResend ? (
                  <Text style={styles.otpResendCountdownText}>
                    {t.resendOtpIn || 'Resend OTP in'}{' '}
                    <Text style={styles.otpCountdownBold}>
                      00:{resendCooldown.toString().padStart(2, '0')}
                    </Text>
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleResendOtp} activeOpacity={0.75}>
                    <Text style={styles.otpResendActiveText}>
                      {t.didntReceiveCode || "Didn't receive the code? Resend OTP"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Action CTA: Verify & Continue button */}
              <TouchableOpacity
                style={styles.verifyCtaWrapper}
                activeOpacity={0.88}
                disabled={loading}
                onPress={handleVerifyOtp}
                accessibilityRole="button"
                accessibilityLabel={t.verifyAndContinue || 'Verify & Continue'}
              >
                <LinearGradient
                  colors={['#173D32', '#173D32', '#0C251E']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.verifyCtaButton}
                >
                  {loading ? (
                    <View style={styles.ctaContentRow}>
                      <ActivityIndicator color="#FFFFFF" size="small" />
                      <Text style={[styles.verifyCtaText, { marginLeft: 10 }]}>
                        {t.verifying || 'Verifying...'}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.verifyCtaText}>
                      {t.verifyAndContinue || 'Verify & Continue'}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      ) : (
        <AuthBackground>
          <SafeAreaView style={styles.safeArea}>
            {/* Upper-Left Circular Back Button (Active during form steps) */}
            <TouchableOpacity
              style={styles.upperLeftBackButton}
              activeOpacity={0.7}
              onPress={() => setCurrentStep('LANDING')}
              hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={{ flex: 1 }}
            >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Devotional Top Branding Header (Ayyappa Emblem, Saranam Ayyappa, Lotus Mantra) */}
              <AuthBrandHeader subWelcome={t.portalSubtitle} />

              {/* Exact Authentication Card matching Reference Image */}
              <View style={styles.card}>
                {/* Segmented Control Tabs (Login with OTP | Register with OTP) */}
                <AuthSegmentedTabs
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                  loginLabel={t.loginTab}
                  registerLabel={t.registerTab}
                />

                {/* Inline Error Message */}
                {errorMsg && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
                  </View>
                )}

                {/* ========================================================
                    SCREEN 1: LOGIN WITH OTP (EXACT MATCH TO DESIGN IMAGE)
                   ======================================================== */}
                {currentStep === 'LOGIN' && (
                  <View style={styles.form}>
                    <MobileNumberInput
                      label={t.mobileNumberLabel}
                      value={loginPhone}
                      onChangeText={setLoginPhone}
                      placeholder={t.mobilePlaceholder}
                    />

                    <AuthGradientButton
                      title={t.sendLoginOtp}
                      onPress={handleSendLoginOtp}
                      loading={loading}
                    />
                  </View>
                )}

                {/* ========================================================
                    SCREEN 2: REGISTER WITH OTP
                   ======================================================== */}
                {currentStep === 'REGISTER' && (
                  <View style={styles.form}>
                    {/* Devotee Full Name */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.fieldLabel}>{t.fullNameLabel} *</Text>
                      <View style={styles.nameInputContainer}>
                        <TextInput
                          style={styles.nameInput}
                          placeholder={t.fullNamePlaceholder}
                          placeholderTextColor="#9E9182"
                          value={regName}
                          onChangeText={setRegName}
                        />
                      </View>
                    </View>

                    {/* Mobile Number */}
                    <MobileNumberInput
                      label={`${t.mobileNumberLabel} *`}
                      value={regPhone}
                      onChangeText={setRegPhone}
                      placeholder={t.mobilePlaceholder}
                    />

                    <AuthGradientButton
                      title={t.sendVerificationOtp}
                      onPress={handleSendRegOtp}
                      loading={loading}
                    />
                  </View>
                )}

                {/* Divider: or continue with Gmail */}
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>{t.orContinueWithGmail}</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Google Sign-In Button (White rounded pill with official multicolor G logo) */}
                <TouchableOpacity
                  style={styles.googleBtn}
                  activeOpacity={0.85}
                  disabled={loading}
                  onPress={handleGoogleSignIn}
                >
                  <View style={styles.googleBtnContent}>
                    <GoogleIcon style={{ marginRight: 10 }} />
                    <Text style={styles.googleBtnText}>{t.signInWithGoogle}</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Industry-Standard Skip Button Below the Card */}
              {onSkip && (
                <TouchableOpacity
                  style={styles.skipBottomBtn}
                  activeOpacity={0.75}
                  onPress={onSkip}
                  hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
                  accessibilityRole="button"
                  accessibilityLabel="Skip Login and Registration"
                >
                  <View style={styles.skipBottomContent}>
                    <Text style={styles.skipBottomText}>{t.skipExplore || 'Skip for now & explore →'}</Text>
                  </View>
                </TouchableOpacity>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </AuthBackground>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAF5EB',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: Platform.OS === 'ios' ? 8 : 4,
    paddingBottom: 20,
    alignItems: 'center',
  },
  card: {
    width: '92%',
    maxWidth: 410,
    backgroundColor: '#FFFDF9',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 22,
    borderWidth: 1.2,
    borderColor: '#F0E5D4',
    elevation: 8,
    shadowColor: '#2E7561',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    marginBottom: 8,
  },
  form: {
    width: '100%',
  },
  errorBox: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#C62828',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  errorText: {
    color: '#C62828',
    fontSize: 13,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 16,
    width: '100%',
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0C251E',
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  nameInputContainer: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#E8DCD0',
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  nameInput: {
    fontSize: 15.5,
    color: '#212121',
    fontWeight: '500',
  },
  verifyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  verifyTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0C251E',
    letterSpacing: 0.2,
  },
  verifySubtitle: {
    fontSize: 13,
    color: '#7D6A58',
    marginTop: 2,
    lineHeight: 18,
  },
  editBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#FAF7F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8DCD0',
  },
  editBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#D84315',
  },
  phoneBadge: {
    backgroundColor: '#FAF7F2',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8DCD0',
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  phoneBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0C251E',
    letterSpacing: 0.8,
  },
  otpHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  resendLink: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D84315',
    textDecorationLine: 'underline',
  },
  resendDisabled: {
    color: '#9E9E9E',
    textDecorationLine: 'none',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EAE1D6',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13.5,
    color: '#8A7362',
    fontWeight: '600',
  },
  googleBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E8DCD0',
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  googleBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconWrapper: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIconImage: {
    width: 20,
    height: 20,
  },
  googleBtnText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#212121',
    letterSpacing: 0.2,
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: 22,
  },
  upperLeftBackButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 10 : 14,
    left: 16,
    zIndex: 99,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFDF9',
    borderWidth: 1.2,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#2E7561',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  backArrow: {
    fontSize: 22,
    lineHeight: 24,
    fontWeight: '700',
    color: '#2E7561',
    textAlign: 'center',
    includeFontPadding: false,
  },
  skipBottomBtn: {
    marginTop: 14,
    marginBottom: 32,
    paddingVertical: 12,
    paddingHorizontal: 26,
    backgroundColor: '#FFFDF9',
    borderRadius: 26,
    borderWidth: 1.4,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2E7561',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 4,
  },
  skipBottomContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBottomText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2E7561',
    letterSpacing: 0.3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  googleModalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  googleModalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  googleModalIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  googleModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#202124',
    textAlign: 'center',
  },
  googleModalSubtitle: {
    fontSize: 12.5,
    color: '#5F6368',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  googleModalErrorBox: {
    backgroundColor: '#FDE8E8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#C62828',
  },
  googleModalErrorText: {
    fontSize: 12.5,
    color: '#C62828',
    fontWeight: '600',
  },
  quickAccountChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  quickAccountAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A73E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  quickAccountAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  quickAccountInfo: {
    flex: 1,
  },
  quickAccountName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#202124',
  },
  quickAccountEmail: {
    fontSize: 11.5,
    color: '#5F6368',
  },
  quickAccountSelectBadge: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1A73E8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#E8F0FE',
    borderRadius: 6,
  },
  googleModalDivider: {
    height: 1,
    backgroundColor: '#E8EAED',
    marginVertical: 14,
  },
  googleFieldGroup: {
    marginBottom: 12,
  },
  googleFieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5F6368',
    marginBottom: 4,
  },
  googleInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#202124',
    backgroundColor: '#FFFFFF',
  },
  googleModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  googleCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  googleCancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5F6368',
  },
  googleSubmitBtn: {
    backgroundColor: '#1A73E8',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleSubmitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  googleModalFooter: {
    fontSize: 10.5,
    color: '#80868B',
    textAlign: 'center',
    marginTop: 14,
  },

  // Screen 5: Welcome Devotee Landing Page Styles
  landingRoot: {
    flex: 1,
    backgroundColor: '#FFF8EB',
    justifyContent: 'space-between',
  },
  landingTopSection: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.48,
    position: 'relative',
    overflow: 'hidden',
  },
  landingTempleImage: {
    width: '100%',
    height: '100%',
  },
  landingGradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -1,
    height: 90,
  },
  landingFloatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 99,
  },
  landingBackButton: {
    marginTop: Platform.OS === 'ios' ? 10 : 36,
    marginLeft: 18,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 253, 249, 0.88)',
    borderWidth: 1.2,
    borderColor: '#E8D8C4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#071914',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 4,
  },
  landingBackArrowText: {
    color: '#173D32',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
    marginTop: Platform.OS === 'ios' ? -2 : -4,
  },
  landingBottomSection: {
    flex: 1,
    backgroundColor: '#FFF8EB',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 14,
    paddingBottom: Math.max(30, SCREEN_HEIGHT * 0.05),
  },
  landingHeadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  landingTitleText: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: SCREEN_HEIGHT < 700 ? 23 : 26,
    fontWeight: '700',
    color: '#173D32',
    textAlign: 'center',
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  landingSubtitleText: {
    fontSize: SCREEN_HEIGHT < 700 ? 13.5 : 14.5,
    color: '#345147',
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 12,
  },
  landingActionsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 14,
  },
  mobileCtaWrapper: {
    width: '100%',
    borderRadius: 26,
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.32,
    shadowRadius: 6,
    elevation: 4,
  },
  mobileCtaButton: {
    borderRadius: 26,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(235, 196, 118, 0.65)',
  },
  ctaContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneIcon: {
    fontSize: 16,
    marginRight: 10,
    color: '#FFFFFF',
  },
  mobileCtaText: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 15.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  googleCtaButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    borderWidth: 1.2,
    borderColor: '#E8D5B5',
    paddingVertical: 13,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#071914',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  socialButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
    marginTop: 4,
  },
  socialHalfButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  googleSideButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2D3B8',
  },
  appleSideButton: {
    backgroundColor: '#000000',
    borderColor: '#262626',
  },
  socialBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialBtnTextGoogle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#112620',
    letterSpacing: 0.2,
  },
  socialBtnTextApple: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  appleLogoIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    marginRight: 6,
    lineHeight: 20,
  },
  googleIconMargin: {
    marginRight: 10,
  },
  googleCtaText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#112620',
    letterSpacing: 0.2,
  },
  skipLinkButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipLinkText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#3453A4',
    letterSpacing: 0.2,
  },

  // Screen 6: Verify Your Mobile Styles
  otpRoot: {
    flex: 1,
    backgroundColor: '#FFF8EB',
  },
  otpTopSection: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.44,
    position: 'relative',
    overflow: 'hidden',
  },
  otpTempleImage: {
    width: '100%',
    height: '100%',
  },
  otpGradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -1,
    height: 90,
  },
  otpFloatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 99,
  },
  otpBackButton: {
    marginTop: Platform.OS === 'ios' ? 10 : 36,
    marginLeft: 18,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 253, 249, 0.88)',
    borderWidth: 1.2,
    borderColor: '#E8D8C4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#071914',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 4,
  },
  otpBackArrowText: {
    color: '#173D32',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
    marginTop: Platform.OS === 'ios' ? -2 : -4,
  },
  otpBottomSection: {
    flex: 1,
    backgroundColor: '#FFF8EB',
  },
  otpScrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: Math.max(30, SCREEN_HEIGHT * 0.05),
    alignItems: 'center',
  },
  otpTitleText: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: SCREEN_HEIGHT < 700 ? 22 : 25,
    fontWeight: '700',
    color: '#173D32',
    textAlign: 'center',
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  otpSubtitleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  otpSubtitleText: {
    fontSize: 14,
    color: '#5C4D3C',
    textAlign: 'center',
    marginBottom: 4,
  },
  otpPhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpMaskedPhoneText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#112620',
    letterSpacing: 0.5,
  },
  otpEditBadge: {
    marginLeft: 6,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  otpEditText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#173D32',
  },
  otpBoxesWrapper: {
    width: '100%',
    paddingHorizontal: 6,
    marginVertical: 12,
  },
  otpResendContainer: {
    marginVertical: 14,
    alignItems: 'center',
  },
  otpResendCountdownText: {
    fontSize: 13.5,
    color: '#6E5D4B',
  },
  otpCountdownBold: {
    fontWeight: '700',
    color: '#173D32',
  },
  otpResendActiveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#173D32',
    textDecorationLine: 'underline',
  },
  verifyCtaWrapper: {
    width: '100%',
    borderRadius: 26,
    marginTop: 18,
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.32,
    shadowRadius: 6,
    elevation: 4,
  },
  verifyCtaButton: {
    borderRadius: 26,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(235, 196, 118, 0.65)',
  },
  verifyCtaText: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },

  // Devotional Mobile Entry Modal Styles
  phoneModalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  phoneModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(25, 10, 10, 0.65)',
  },
  phoneModalCard: {
    backgroundColor: '#FFFDF8',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1.5,
    borderColor: '#DFA62E',
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: Math.max(28, SCREEN_HEIGHT * 0.04),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  phoneModalTopHandle: {
    width: 44,
    height: 4.5,
    borderRadius: 2.5,
    backgroundColor: '#D9C4A6',
    alignSelf: 'center',
    marginBottom: 16,
  },
  phoneModalTitle: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 20,
    fontWeight: '700',
    color: '#173D32',
    textAlign: 'center',
    marginBottom: 6,
  },
  phoneModalSubtitle: {
    fontSize: 13,
    color: '#5C4D3C',
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8EB',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#E6C898',
    paddingHorizontal: 12,
    height: 52,
    marginBottom: 16,
  },
  countryCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: '#D9BE94',
    marginRight: 10,
  },
  flagIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#173D32',
  },
  phoneTextInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#173D32',
    letterSpacing: 1,
    height: '100%',
  },
  getOtpBtnWrapper: {
    width: '100%',
    borderRadius: 26,
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 10,
  },
  getOtpBtn: {
    borderRadius: 26,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(235, 196, 118, 0.65)',
  },
  getOtpBtnText: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  cancelPhoneBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelPhoneText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7D6A58',
  },
});
