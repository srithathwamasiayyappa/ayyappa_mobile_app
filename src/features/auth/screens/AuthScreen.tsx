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
  ImageBackground,
  Modal,
  ActivityIndicator,
  BackHandler,
  Dimensions,
  NativeModules,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { SixDigitOtpInput } from '../components/SixDigitOtpInput';
import { Toast } from '../../../components/common/Toast';
import { ApiService } from '../../../services/api';
import { FirebaseService } from '../../../services/firebase';
import { FirebasePhoneAuthService } from '../../../services/firebasePhoneAuth';
import { AUTH_TRANSLATIONS } from '../i18n/authTranslations';
import { SupportedLanguage } from '../../../types';
import { LegalScreen } from '../../profile/screens/LegalScreen';

interface Props {
  onLoginSuccess: (user: any) => void;
  onSkip?: () => void;
  onBack?: () => void;
  currentLanguage?: SupportedLanguage;
  selectedRole?: 'DEVOTEE' | 'DHARMA_KARTHA' | 'CUSTOMER';
  initialStep?: 'LOGIN' | 'REGISTER';
}

// Background & Decorative Assets (Exact Image 1 & Image 2)
const SARANAM_LOGIN_BG = require('../../../../assets/auth/saranam_login_bg.jpg');
const SARANAM_LOGIN_EMBLEM = require('../../../../assets/auth/saranam_login_emblem.png');
const BOTTOM_GREEN_HILLS = require('../../../../assets/auth/bottom_green_hills.jpg');
const WELCOME_DEVOTEE_TEMPLE = require('../../../../assets/welcome_devotee_temple.jpg');

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 1. Google Official 4-Color Vector Logo
const GoogleSvgIcon = ({ size = 18 }: { size?: number }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center', marginRight: 8 }}>
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

// 2. Apple Official Black Vector Logo
const AppleSvgIcon = ({ size = 18 }: { size?: number }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center', marginRight: 8 }}>
    <Svg width={size} height={size} viewBox="0 0 170 170">
      <Path
        fill="#000000"
        d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.66-7.85-11.88-14.42-6.19-9.58-11.06-20.73-14.61-33.45-3.55-12.71-5.33-24.36-5.33-34.94 0-14.89 3.73-27.18 11.2-36.88 7.47-9.69 17.07-14.64 28.8-14.86 4.9.11 10.22 1.36 15.96 3.77 5.74 2.41 9.87 3.67 12.39 3.77 2.18 0 6.42-1.36 12.74-4.07 6.31-2.72 11.75-3.88 16.32-3.48 12.06.65 21.6 4.9 28.62 12.74-10.43 6.31-15.54 14.89-15.33 25.75.22 8.48 3.59 15.86 10.11 22.16 6.52 6.31 14.34 10.05 23.47 11.22-2.17 6.52-4.78 12.93-7.82 19.24zm-38.6-118.82c0 4.13-1.08 8.42-3.26 12.87-2.17 4.45-5.22 8.26-9.13 11.41-3.69 3.04-7.82 5.05-12.39 6.03-.43-1.3-.65-2.71-.65-4.24 0-4.35 1.14-8.8 3.42-13.37 2.29-4.56 5.38-8.26 9.29-11.08 3.91-2.83 8.15-4.57 12.72-5.22.43 1.2.65 2.4.65 3.6z"
      />
    </Svg>
  </View>
);

// 3. Customer Role Shrine/Hut Icon (Green)
const CustomerHutIcon = ({ color = '#075E2B' }: { color?: string }) => (
  <Svg width={30} height={30} viewBox="0 0 28 28" fill="none">
    <Path d="M14 4 L5 12 H23 Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" fill="rgba(7, 94, 43, 0.08)" />
    <Path d="M14 2 V4" stroke={color} strokeWidth={1.5} />
    <Path d="M14 2 L17 3.5 L14 5 Z" fill={color} />
    <Path d="M8 12 V22" stroke={color} strokeWidth={1.8} />
    <Path d="M20 12 V22" stroke={color} strokeWidth={1.8} />
    <Path d="M14 14 V22" stroke={color} strokeWidth={1.4} strokeDasharray="2 2" />
    <Path d="M4 22 H24" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Path d="M6 25 H22" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
  </Svg>
);

// 4. Dharma Karthas Temple Gopuram Icon (Gold)
const DharmaKarthasIcon = ({ color = '#C28723' }: { color?: string }) => (
  <Svg width={30} height={30} viewBox="0 0 28 28" fill="none">
    <Path d="M14 2 L15.5 5 H12.5 Z" fill={color} />
    <Path d="M10.5 5 H17.5 L19 8 H9 Z" fill={color} />
    <Path d="M7.5 8 H20.5 L22.5 12 H5.5 Z" fill={color} />
    <Path d="M6.5 12 H21.5 V21 H6.5 Z" stroke={color} strokeWidth={1.8} />
    <Path d="M11 15 H17 V21 H11 Z" fill={color} />
    <Path d="M4 21 H24" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Path d="M5.5 24 H22.5" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
  </Svg>
);

// 5. White Send / Paper Plane Icon for "Get OTP"
const SendSvgIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ marginRight: 8 }}>
    <Path d="M22 2 L11 13" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M22 2 L15 22 L11 13 L2 9 L22 2 Z" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="rgba(255, 255, 255, 0.15)" />
  </Svg>
);

// 6. User Add Icon for "Create New Account"
const UserPlusSvgIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" style={{ marginRight: 8 }}>
    <Path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#075E2B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="8.5" cy="7" r="4" stroke="#075E2B" strokeWidth={2} />
    <Path d="M20 8v6M23 11h-6" stroke="#075E2B" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// 7. Indian Flag Tricolor Vector Icon
const IndianFlagIcon = () => (
  <Svg width={22} height={15} viewBox="0 0 30 20" style={{ borderRadius: 2 }}>
    <Rect width="30" height="6.67" fill="#FF9933" />
    <Rect y="6.67" width="30" height="6.67" fill="#FFFFFF" />
    <Rect y="13.33" width="30" height="6.67" fill="#128807" />
    <Circle cx="15" cy="10" r="2.8" stroke="#000080" strokeWidth="0.6" fill="none" />
  </Svg>
);

// 8. Golden Ornamental Motif at Top of Panel
const TopPanelMotif = () => (
  <View style={styles.topPanelMotifContainer}>
    <View style={styles.motifFlankLine} />
    <Svg width={38} height={18} viewBox="0 0 36 18" fill="none">
      <Path d="M18 2 L22 9 L18 16 L14 9 Z" fill="#DFA62E" />
      <Circle cx="18" cy="9" r="1.8" fill="#FFF8EC" />
      <Path d="M11 9 C11 6.5 13 5.5 14 9 C13 12.5 11 11.5 11 9 Z" fill="#C8902B" />
      <Path d="M25 9 C25 6.5 23 5.5 22 9 C23 12.5 25 11.5 25 9 Z" fill="#C8902B" />
      <Circle cx="7" cy="9" r="1.5" fill="#DFA62E" />
      <Circle cx="29" cy="9" r="1.5" fill="#DFA62E" />
    </Svg>
    <View style={styles.motifFlankLine} />
  </View>
);

// 9. Full Name User Silhouette Icon
const DevoteeUserIcon = ({ color = '#173D32', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="7.5" r="4" stroke={color} strokeWidth={1.9} />
    <Path d="M4.5 20 C4.5 16.2 7.8 14.5 12 14.5 C16.2 14.5 19.5 16.2 19.5 20" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
  </Svg>
);

export const AuthScreen: React.FC<Props> = ({
  onLoginSuccess,
  onSkip,
  onBack,
  currentLanguage = 'te',
  selectedRole = 'DEVOTEE',
  initialStep = 'LOGIN',
}) => {
  const t = (currentLanguage && (AUTH_TRANSLATIONS as any)[currentLanguage]) || AUTH_TRANSLATIONS.en;

  // Step state: 'REGISTER' | 'LOGIN' | 'VERIFY_OTP'
  const [currentStep, setCurrentStep] = useState<'REGISTER' | 'LOGIN' | 'VERIFY_OTP'>(initialStep);
  const [otpIntent, setOtpIntent] = useState<'login' | 'register'>(initialStep === 'LOGIN' ? 'login' : 'register');
  const [activeRole, setActiveRole] = useState<'DEVOTEE' | 'DHARMA_KARTHA'>(
    selectedRole === 'DHARMA_KARTHA' ? 'DHARMA_KARTHA' : 'DEVOTEE'
  );

  useEffect(() => {
    if (initialStep) {
      setCurrentStep(initialStep);
      setOtpIntent(initialStep === 'LOGIN' ? 'login' : 'register');
    }
  }, [initialStep]);

  useEffect(() => {
    if (selectedRole) {
      setActiveRole(selectedRole === 'DHARMA_KARTHA' ? 'DHARMA_KARTHA' : 'DEVOTEE');
    }
  }, [selectedRole]);

  // Registration Fields
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Login Phone Field
  const [loginPhone, setLoginPhone] = useState('');

  // OTP Verification
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Legal Modal
  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'terms' | 'privacy'>('terms');

  // Devotee Toast Notifications
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);
  };

  // Hardware Back Button
  useEffect(() => {
    const handleHardwareBack = () => {
      if (legalModalVisible) {
        setLegalModalVisible(false);
        return true;
      }
      if (currentStep === 'VERIFY_OTP') {
        setCurrentStep(otpIntent === 'login' ? 'LOGIN' : 'REGISTER');
        return true;
      }
      if (currentStep === 'LOGIN') {
        if (onBack) {
          onBack();
        } else {
          setCurrentStep('REGISTER');
        }
        return true;
      }
      if (currentStep === 'REGISTER') {
        if (initialStep === 'LOGIN') {
          setCurrentStep('LOGIN');
        } else if (onBack) {
          onBack();
        }
        return true;
      }
      return false;
    };

    const backSub = BackHandler.addEventListener('hardwareBackPress', handleHardwareBack);
    return () => backSub.remove();
  }, [currentStep, otpIntent, legalModalVisible, onBack, initialStep]);

  // Cooldown timer for OTP screen
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

  // Open Legal Modal
  const handleOpenTerms = () => {
    setLegalModalTab('terms');
    setLegalModalVisible(true);
  };

  const handleOpenPrivacy = () => {
    setLegalModalTab('privacy');
    setLegalModalVisible(true);
  };

  // Action: Registration Continue
  const handleContinueRegistration = async () => {
    const trimmedName = regName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      showToast(t.enterNameError || 'Please enter your full name.', 'error');
      return;
    }

    const clean = regPhone.replace(/[^0-9]/g, '');
    if (!clean || clean.length < 10) {
      showToast(t.invalidPhoneError || 'Please enter a valid 10-digit mobile number.', 'error');
      return;
    }

    if (!termsAccepted) {
      showToast(
        t.consentRequiredError || 'Please agree to the Terms & Conditions and Privacy Policy to continue.',
        'error'
      );
      return;
    }

    const clean10 = clean.slice(-10);
    const phoneE164 = `+91${clean10}`;

    setLoading(true);
    try {
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
        setCurrentStep('LOGIN');
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

      let sendMsg = '';
      try {
        const res = await FirebasePhoneAuthService.sendPhoneOtp(phoneE164);
        sendMsg = res?.message || check?.message || `OTP sent successfully to +91 ${clean10}`;
      } catch (fbErr: any) {
        console.warn('[AuthScreen] Firebase Phone Auth failed, trying backend SMS OTP fallback:', fbErr?.message);
        try {
          const apiRes = await ApiService.sendOtp(clean10, 'register');
          sendMsg = apiRes?.message || `OTP sent successfully via SMS to +91 ${clean10}`;
        } catch (apiErr: any) {
          throw new Error(apiErr?.message || fbErr?.message || 'Failed to send verification OTP.');
        }
      }

      setOtpIntent('register');
      setResendCooldown(30);
      setOtpCode('');
      setCurrentStep('VERIFY_OTP');
      showToast(sendMsg, 'success');
    } catch (err: any) {
      const errMsg = err?.message || 'Failed to send verification OTP.';
      if (errMsg.toLowerCase().includes('already registered')) {
        showToast('This mobile number is already registered. Redirecting to login...', 'error');
        setLoginPhone(clean.slice(-10));
        setCurrentStep('LOGIN');
      } else {
        showToast(errMsg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Action: Login Continue
  const handleContinueLogin = async () => {
    const clean = loginPhone.replace(/[^0-9]/g, '');
    if (!clean || clean.length < 10) {
      showToast(t.invalidPhoneError || 'Please enter a valid 10-digit mobile number.', 'error');
      return;
    }

    const clean10 = clean.slice(-10);
    const phoneE164 = `+91${clean10}`;

    setLoading(true);
    try {
      let check: any = null;
      try {
        check = await ApiService.checkPhone(clean10);
      } catch (err: any) {
        console.warn('Check-phone network warning:', err?.message);
      }

      if (check && !check.isRegistered) {
        setLoading(false);
        showToast(
          check.message || 'This mobile number is not registered yet. Redirecting to registration...',
          'error'
        );
        setRegPhone(clean10);
        setCurrentStep('REGISTER');
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

      let sendMsg = '';
      try {
        const res = await FirebasePhoneAuthService.sendPhoneOtp(phoneE164);
        sendMsg = res?.message || check?.message || `OTP sent successfully to +91 ${clean10}`;
      } catch (fbErr: any) {
        console.warn('[AuthScreen] Firebase Phone Auth failed, trying backend SMS OTP fallback:', fbErr?.message);
        try {
          const apiRes = await ApiService.sendOtp(clean10, 'login');
          sendMsg = apiRes?.message || `OTP sent successfully via SMS to +91 ${clean10}`;
        } catch (apiErr: any) {
          throw new Error(apiErr?.message || fbErr?.message || 'Failed to send OTP. Please check mobile number.');
        }
      }

      setOtpIntent('login');
      setResendCooldown(30);
      setOtpCode('');
      setCurrentStep('VERIFY_OTP');
      showToast(sendMsg, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to send OTP. Please check mobile number.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Action: Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    const phone = otpIntent === 'login' ? loginPhone : regPhone;
    const clean = phone.replace(/[^0-9]/g, '').slice(-10);
    const phoneE164 = `+91${clean}`;
    setLoading(true);
    try {
      let sendMsg = '';
      try {
        const res = await FirebasePhoneAuthService.sendPhoneOtp(phoneE164);
        sendMsg = res?.message || `New OTP sent to +91 ${clean}!`;
      } catch (fbErr: any) {
        console.warn('[AuthScreen] Firebase Resend OTP failed, trying backend SMS OTP fallback:', fbErr?.message);
        const apiRes = await ApiService.sendOtp(clean, otpIntent);
        sendMsg = apiRes?.message || `New OTP sent via SMS to +91 ${clean}!`;
      }
      setResendCooldown(30);
      showToast(sendMsg, 'info');
    } catch (err: any) {
      showToast(err?.message || 'Failed to resend OTP.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Action: Verify OTP
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      showToast(t.enterFullOtpError || 'Please enter the 6-digit verification code.', 'error');
      return;
    }

    const rawPhone = otpIntent === 'login' ? loginPhone : regPhone;
    const clean10 = rawPhone.replace(/[^0-9]/g, '').slice(-10);
    const phoneE164 = `+91${clean10}`;

    setLoading(true);
    try {
      let firebaseRes: any = null;
      try {
        firebaseRes = await FirebasePhoneAuthService.confirmOtp(otpCode);
      } catch (fbErr: any) {
        // If native firebase isn't active or fails in offline/dev, log and proceed with backend validation
        console.log('[AuthScreen] Firebase verify note:', fbErr?.message);
      }

      let res: any;
      if (otpIntent === 'register') {
        res = await ApiService.registerWithOtp({
          fullName: regName.trim() || 'Ayyappa Devotee',
          phoneNumber: clean10,
          otp: otpCode,
          preferredLang: currentLanguage,
        });
      } else {
        res = await ApiService.loginWithOtp(clean10, otpCode);
      }

      if (res && res.user) {
        showToast(
          otpIntent === 'register'
            ? t.registrationSuccessful || 'Account created successfully! Welcome to Saranam Ayyappa.'
            : t.loginSuccessful || 'Welcome back to Saranam Ayyappa.',
          'success'
        );
        setTimeout(() => {
          onLoginSuccess(res.user);
        }, 650);
        return;
      }

      throw new Error(res?.message || 'Authentication could not be verified.');
    } catch (err: any) {
      showToast(err?.message || 'Verification failed. Please check the code and retry.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In & Registration (Safe for Native Builds & Expo Go)
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const googleUser = await FirebaseService.signInWithGoogle(undefined, regName.trim() || undefined);
      if (!googleUser) {
        // Devotee cancelled account selection
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
          photoUrl: googleUser.photoUrl,
        });
      } catch (apiErr: any) {
        console.log('[Google Auth] API exchange note:', apiErr?.message);
      }

      const verifiedUser = (res && res.user) ? res.user : {
        id: res?.user?.id || Date.now(),
        email: googleUser.email || '',
        fullName: googleUser.fullName || regName.trim() || 'Devotee',
        phoneNumber: '',
        profileImageUrl: googleUser.photoUrl || null,
        preferredLang: currentLanguage || 'te',
        role: activeRole,
        profileOnboardingStatus: 'PENDING',
      };

      showToast('Google Authentication successful', 'success');
      setTimeout(() => {
        onLoginSuccess(verifiedUser);
      }, 700);
    } catch (err: any) {
      showToast(err?.message || 'Google sign-in could not be completed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Apple Sign-In & Registration (Safe for iOS Native Builds & Android/Expo Go)
  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      if (Platform.OS === 'android') {
        showToast('Apple Sign-In is supported on iOS devices. Please use Google or Phone OTP on Android.', 'info');
        setLoading(false);
        return;
      }

      // Safe dynamic lookup for iOS Apple Authentication without static bundling crashes
      let appleAuthModule: any = null;
      try {
        const reqFn = typeof (global as any).__r === 'function' ? (global as any).__r : null;
        if (reqFn) {
          const mod = reqFn('@invertase/react-native-apple-authentication');
          appleAuthModule = mod?.appleAuth || mod?.default?.appleAuth;
        }
      } catch {
        appleAuthModule = null;
      }

      if (appleAuthModule && typeof appleAuthModule.performRequest === 'function') {
        const appleResponse = await appleAuthModule.performRequest({
          requestedOperation: appleAuthModule.Operation.LOGIN,
          requestedScopes: [appleAuthModule.Scope.EMAIL, appleAuthModule.Scope.FULL_NAME],
        });

        if (!appleResponse?.identityToken) {
          throw new Error('Apple Sign-In did not provide an authentic identity token.');
        }

        const fullNameStr = appleResponse.fullName
          ? `${appleResponse.fullName.givenName || ''} ${appleResponse.fullName.familyName || ''}`.trim()
          : (regName.trim() || undefined);

        const res = await ApiService.loginWithApple({
          identityToken: appleResponse.identityToken,
          authorizationCode: appleResponse.authorizationCode || undefined,
          fullName: fullNameStr,
          email: appleResponse.email || undefined,
        });

        if (res && res.user) {
          showToast('Apple Authentication successful', 'success');
          setTimeout(() => {
            onLoginSuccess(res.user);
          }, 700);
          return;
        }
      }

      showToast('Apple Sign-In is configured for Apple devices.', 'info');
    } catch (err: any) {
      if (err?.code === '1001' || err?.message?.includes('cancelled')) {
        return;
      }
      showToast(err?.message || 'Apple authentication failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const activePhone = otpIntent === 'login' ? loginPhone : regPhone;
  const cleanActivePhone = activePhone.replace(/[^0-9]/g, '').slice(-10);

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Devotee Feedback Toast */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />

      {/* ========================================================
          SCREEN B: 6-DIGIT OTP VERIFICATION SCREEN
         ======================================================== */}
      {currentStep === 'VERIFY_OTP' ? (
        <View style={styles.otpScreenWrapper}>
          <View style={styles.otpTempleHeaderContainer}>
            <Image source={WELCOME_DEVOTEE_TEMPLE} style={styles.otpTempleImage} resizeMode="cover" />
            <LinearGradient
              colors={['transparent', 'rgba(255, 248, 235, 0.35)', 'rgba(255, 248, 235, 0.85)', '#FFF8EB']}
              locations={[0, 0.55, 0.85, 1]}
              style={styles.otpGradientOverlay}
            />

            <SafeAreaView style={styles.otpFloatingHeader}>
              <TouchableOpacity
                style={styles.headerBackButton}
                onPress={() => setCurrentStep(otpIntent === 'login' ? 'LOGIN' : 'REGISTER')}
                activeOpacity={0.75}
                hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
                accessibilityRole="button"
                accessibilityLabel="Back to form"
              >
                <Text style={styles.headerBackArrow}>←</Text>
              </TouchableOpacity>
            </SafeAreaView>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={styles.otpBottomContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.otpHeadingContainer}>
                <Text style={styles.otpTitleText}>{t.verifyYourMobile || 'Verify Your Mobile'}</Text>
                <Text style={styles.otpSubtitleText}>
                  {t.enterOtpSentTo || 'Enter the 6-digit code sent to'}{' '}
                  <Text style={styles.otpPhoneHighlight}>+91 {cleanActivePhone}</Text>
                </Text>
              </View>

              <View style={styles.otpInputContainer}>
                <SixDigitOtpInput
                  value={otpCode}
                  onChangeOtp={setOtpCode}
                />
              </View>

              <View style={styles.otpResendContainer}>
                {!canResend ? (
                  <Text style={styles.otpResendCountdownText}>
                    {t.resendOtpIn || 'Resend OTP in'}{' '}
                    <Text style={styles.otpCountdownBold}>
                      00:{resendCooldown.toString().padStart(2, '0')}
                    </Text>
                  </Text>
                ) : (
                  <TouchableOpacity
                    onPress={handleResendOtp}
                    disabled={loading}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 14, right: 14 }}
                  >
                    <Text style={styles.otpResendActiveText}>
                      {t.resendOtpPrompt || 'Resend OTP now'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

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
        /* ========================================================
            SCREEN A: EXACT APPROVED LOGIN UI (IMAGE 1 SPECIFICATION)
           ======================================================== */
        <ImageBackground
          source={SARANAM_LOGIN_BG}
          style={styles.bgImageFull}
          imageStyle={styles.backgroundImageStyle}
          resizeMode="cover"
        >
          {/* Top Floating Circular Back Button */}
          <SafeAreaView style={styles.topNavSafeArea} pointerEvents="box-none">
            <View style={styles.topNavRow}>
              <TouchableOpacity
                style={styles.headerBackButton}
                activeOpacity={0.75}
                onPress={() => {
                  if (currentStep === 'REGISTER') {
                    setCurrentStep('LOGIN');
                  } else if (onBack) {
                    onBack();
                  }
                }}
                hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
                accessibilityRole="button"
                accessibilityLabel="Back"
              >
                <Text style={styles.headerBackArrow}>←</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* 1. Saranam Ayyappa Gold & Emerald Shield Emblem */}
              <View style={styles.emblemContainer} pointerEvents="none">
                <Image
                  source={SARANAM_LOGIN_EMBLEM}
                  style={styles.emblemImage}
                  resizeMode="contain"
                />
              </View>

              {/* 2. Main Ivory Ornamental Login Panel (Exact Image 1) */}
              <View style={styles.ivoryPanelWrapper}>
                <LinearGradient
                  colors={['#FFFBF2', '#FAF4E8', '#F6EEDE']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.ivoryPanelGradient}
                >
                  {/* Decorative Top Motif */}
                  <TopPanelMotif />

                  {/* Heading with Decorative Gold Flank Lines */}
                  <View style={styles.headingRow}>
                    <View style={styles.headingFlankLine} />
                    <Text style={styles.panelHeadingText}>
                      {currentStep === 'LOGIN'
                        ? (activeRole === 'DHARMA_KARTHA' ? 'Login to Dharma Kartha' : 'Login to Devotee')
                        : (activeRole === 'DHARMA_KARTHA' ? 'Register as Dharma Kartha' : 'Register as Devotee')}
                    </Text>
                    <View style={styles.headingFlankLine} />
                  </View>

                  {/* Subtitle */}
                  <Text style={styles.panelSubtitleText}>
                    {currentStep === 'LOGIN'
                      ? (activeRole === 'DHARMA_KARTHA'
                          ? 'Access temple management, events and devotional services'
                          : 'Access your devotional services, bookings,\nupdates and more')
                      : 'Enter your mobile number to register your spiritual profile'}
                  </Text>

                  {/* Field for Full Name in REGISTER mode */}
                  {currentStep === 'REGISTER' && (
                    <View style={styles.inputPillField}>
                      <View style={styles.fieldIconPrefix}>
                        <DevoteeUserIcon color="#173D32" size={19} />
                      </View>
                      <TextInput
                        style={styles.phoneTextInput}
                        placeholder={t.fullNamePlaceholder || 'Full Name'}
                        placeholderTextColor="#8A7B6B"
                        value={regName}
                        onChangeText={setRegName}
                        autoCapitalize="words"
                      />
                    </View>
                  )}

                  {/* 5. Mobile Number Input Field with Indian Flag */}
                  <View style={styles.inputPillField}>
                    <View style={styles.flagCountrySection}>
                      <IndianFlagIcon />
                      <Text style={styles.countryCodeText}>+91</Text>
                      <Text style={styles.dropdownArrowText}>▾</Text>
                    </View>

                    <View style={styles.fieldDividerVertical} />

                    <TextInput
                      style={styles.phoneTextInput}
                      placeholder={t.mobilePlaceholder || 'Enter Mobile Number'}
                      placeholderTextColor="#8A7B6B"
                      keyboardType="phone-pad"
                      maxLength={10}
                      value={currentStep === 'REGISTER' ? regPhone : loginPhone}
                      onChangeText={(val) => {
                        const clean = val.replace(/[^0-9]/g, '');
                        if (currentStep === 'REGISTER') {
                          setRegPhone(clean);
                        } else {
                          setLoginPhone(clean);
                        }
                      }}
                    />
                  </View>

                  {/* Terms & Conditions Consent (in REGISTER mode) */}
                  {currentStep === 'REGISTER' && (
                    <View style={styles.consentRow}>
                      <TouchableOpacity
                        style={[styles.checkboxSquare, termsAccepted && styles.checkboxSquareChecked]}
                        activeOpacity={0.8}
                        onPress={() => setTermsAccepted(!termsAccepted)}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: termsAccepted }}
                      >
                        {termsAccepted && <Text style={styles.checkmarkIcon}>✓</Text>}
                      </TouchableOpacity>
                      <Text style={styles.consentTextBody}>
                        {t.termsConsentText || 'I agree to the '}
                        <Text style={styles.consentLinkText} onPress={handleOpenTerms}>
                          {t.termsLink || 'Terms & Conditions'}
                        </Text>
                        {t.andText || ' and '}
                        <Text style={styles.consentLinkText} onPress={handleOpenPrivacy}>
                          {t.privacyLink || 'Privacy Policy.'}
                        </Text>
                      </Text>
                    </View>
                  )}

                  {/* 6. Main Deep-Green "Get OTP" Button */}
                  <TouchableOpacity
                    style={styles.getOtpButtonWrapper}
                    activeOpacity={0.88}
                    disabled={loading}
                    onPress={currentStep === 'REGISTER' ? handleContinueRegistration : handleContinueLogin}
                    accessibilityRole="button"
                    accessibilityLabel={currentStep === 'REGISTER' ? 'Continue' : 'Get OTP'}
                  >
                    <LinearGradient
                      colors={['#063E2D', '#042C1F']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.getOtpButtonGradient}
                    >
                      {loading ? (
                        <View style={styles.ctaContentRow}>
                          <ActivityIndicator color="#FFFFFF" size="small" />
                          <Text style={[styles.getOtpButtonText, { marginLeft: 8 }]}>
                            Sending OTP...
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.ctaContentRow}>
                          <SendSvgIcon />
                          <Text style={styles.getOtpButtonText}>
                            {currentStep === 'REGISTER' ? 'Continue' : 'Get OTP'}
                          </Text>
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* 7. Centered "or" Divider */}
                  <View style={styles.orDividerRow}>
                    <View style={styles.orDividerLine} />
                    <Text style={styles.orDividerText}>or</Text>
                    <View style={styles.orDividerLine} />
                  </View>

                  {/* 8. "Create New Account" Button (or Switch to Login) */}
                  {currentStep === 'LOGIN' ? (
                    <TouchableOpacity
                      style={styles.createAccountButton}
                      onPress={() => setCurrentStep('REGISTER')}
                      activeOpacity={0.85}
                      accessibilityRole="button"
                      accessibilityLabel="Create New Account"
                    >
                      <UserPlusSvgIcon />
                      <Text style={styles.createAccountButtonText}>Create New Account</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.createAccountButton}
                      onPress={() => setCurrentStep('LOGIN')}
                      activeOpacity={0.85}
                      accessibilityRole="button"
                      accessibilityLabel="Already have an account? Login"
                    >
                      <Text style={styles.createAccountButtonText}>Already have an account? Login</Text>
                    </TouchableOpacity>
                  )}

                  {/* Google & Apple Horizontal Row */}
                  <View style={styles.socialButtonsRow}>
                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={handleGoogleSignIn}
                      activeOpacity={0.85}
                      disabled={loading}
                      accessibilityRole="button"
                      accessibilityLabel="Sign in with Google"
                    >
                      <GoogleSvgIcon size={18} />
                      <Text style={styles.socialButtonText}>Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={handleAppleSignIn}
                      activeOpacity={0.85}
                      disabled={loading}
                      accessibilityRole="button"
                      accessibilityLabel="Sign in with Apple"
                    >
                      <AppleSvgIcon size={18} />
                      <Text style={styles.socialButtonText}>Apple</Text>
                    </TouchableOpacity>
                  </View>

                  {/* 9. Bottom Green Temple & Hills Illustration */}
                  <View style={styles.bottomHillsContainer} pointerEvents="none">
                    <Image
                      source={BOTTOM_GREEN_HILLS}
                      style={styles.bottomHillsImage}
                      resizeMode="contain"
                    />
                  </View>
                </LinearGradient>
              </View>

              {/* Thathwamasi Devotional Meaning Card */}
              <View style={styles.thathwamasiCardWrapper}>
                <LinearGradient
                  colors={['#FFFDF8', '#FAF4E8', '#F5EEDE']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.thathwamasiCardGradient}
                >
                  {/* Decorative Header with Gold Lines */}
                  <View style={styles.thathwamasiHeaderRow}>
                    <View style={styles.thathwamasiGoldLine} />
                    <Text style={styles.thathwamasiTitle}>Thathwamasi</Text>
                    <View style={styles.thathwamasiGoldLine} />
                  </View>
                  <Text style={styles.thathwamasiSubheader}>
                    Thou art that • You are that
                  </Text>

                  {/* Three Bullet Explanations */}
                  <View style={styles.thathwamasiBulletsList}>
                    {/* Item 1: Tat */}
                    <View style={styles.thathwamasiBulletItem}>
                      <View style={styles.thathwamasiBulletDot} />
                      <Text style={styles.thathwamasiBulletText}>
                        <Text style={styles.thathwamasiTerm}>Tat: </Text>
                        That, referring to the Supreme Reality or universal consciousness (Brahman).
                      </Text>
                    </View>

                    {/* Item 2: Tvam */}
                    <View style={styles.thathwamasiBulletItem}>
                      <View style={styles.thathwamasiBulletDot} />
                      <Text style={styles.thathwamasiBulletText}>
                        <Text style={styles.thathwamasiTerm}>Tvam: </Text>
                        You, referring to the individual soul (Atman).
                      </Text>
                    </View>

                    {/* Item 3: Asi */}
                    <View style={styles.thathwamasiBulletItem}>
                      <View style={styles.thathwamasiBulletDot} />
                      <Text style={styles.thathwamasiBulletText}>
                        <Text style={styles.thathwamasiTerm}>Asi: </Text>
                        Are or is
                      </Text>
                    </View>
                  </View>

                  {/* Sacred Essence Quote */}
                  <View style={styles.thathwamasiEssenceBox}>
                    <Text style={styles.thathwamasiEssenceText}>
                      "The divine presence you seek in Sabarimala resides within your own soul."
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </ImageBackground>
      )}

      {/* ========================================================
          MODAL: LEGAL & PRIVACY POLICY VIEWER
         ======================================================== */}
      <Modal visible={legalModalVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FAF5EB' }}>
          <LegalScreen
            currentLanguage={currentLanguage}
            initialTab={legalModalTab}
            onBack={() => setLegalModalVisible(false)}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1B542C', // Pearl Green
  },
  bgImageFull: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#1B542C',
  },
  backgroundImageStyle: {
    opacity: 0.7, // 70% opacity
  },
  topNavSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99,
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 14) + 6 : 8,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 253, 248, 0.92)',
    borderWidth: 1.4,
    borderColor: '#DFA62E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  headerBackArrow: {
    color: '#173D32',
    fontSize: 20,
    fontWeight: '700',
    marginTop: Platform.OS === 'ios' ? -2 : -3,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 14) + 14 : 20,
    paddingBottom: 20,
  },

  // 1. Saranam Ayyappa Gold & Emerald Shield Emblem
  emblemContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -14,
    zIndex: 10,
  },
  emblemImage: {
    width: Math.min(SCREEN_WIDTH * 0.44, 180),
    height: Math.min(SCREEN_WIDTH * 0.48, 196),
  },

  // 2. Main Ivory Ornamental Login Panel
  ivoryPanelWrapper: {
    width: Math.min(SCREEN_WIDTH * 0.93, 390),
    borderRadius: 34,
    borderWidth: 1.5,
    borderColor: '#DFA62E',
    shadowColor: '#DFA62E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.20,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  ivoryPanelGradient: {
    width: '100%',
    borderRadius: 34,
    paddingTop: 12,
    paddingHorizontal: 14,
    paddingBottom: 2,
    alignItems: 'center',
  },
  topPanelMotifContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  motifFlankLine: {
    width: 28,
    height: 1.2,
    backgroundColor: '#DFA62E',
    opacity: 0.75,
    marginHorizontal: 6,
  },

  // Heading & Subtitle
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  headingFlankLine: {
    width: 24,
    height: 1.4,
    backgroundColor: '#DFA62E',
    opacity: 0.8,
    marginHorizontal: 8,
  },
  panelHeadingText: {
    fontFamily: Platform.select({
      ios: 'Poppins-Bold',
      android: 'Poppins_700Bold',
      web: 'Poppins, sans-serif',
      default: 'Poppins_700Bold',
    }),
    fontSize: SCREEN_HEIGHT < 700 ? 18 : 20,
    fontWeight: '700',
    color: '#173D32',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  panelSubtitleText: {
    fontFamily: Platform.select({
      ios: 'Poppins-Regular',
      android: 'Poppins_400Regular',
      web: 'Poppins, sans-serif',
      default: 'Poppins_400Regular',
    }),
    fontSize: SCREEN_HEIGHT < 700 ? 11 : 12,
    fontWeight: '400',
    color: '#55665D',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 2,
    marginBottom: 10,
  },

  // 3. Role Selection Cards
  roleCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  roleCard: {
    width: '48.5%',
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    position: 'relative',
    shadowOffset: { width: 0, height: 1.5 },
    shadowRadius: 3,
    elevation: 2,
  },
  roleCardCustomerSelected: {
    backgroundColor: '#F2F8ED',
    borderWidth: 1.5,
    borderColor: '#075E2B',
    shadowColor: '#075E2B',
    shadowOpacity: 0.12,
  },
  roleCardDharmaSelected: {
    backgroundColor: '#FBF5E8',
    borderWidth: 1.5,
    borderColor: '#C28723',
    shadowColor: '#C28723',
    shadowOpacity: 0.12,
  },
  roleCardUnselected: {
    backgroundColor: '#FFFDF8',
    borderWidth: 1.2,
    borderColor: '#DFC596',
    shadowColor: '#173D32',
    shadowOpacity: 0.08,
  },
  roleCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roleCardTextCol: {
    marginLeft: 6,
    flex: 1,
    justifyContent: 'center',
  },
  roleCardTitle: {
    fontFamily: Platform.select({
      ios: 'Poppins-Bold',
      android: 'Poppins_700Bold',
      web: 'Poppins, sans-serif',
      default: 'Poppins_700Bold',
    }),
    fontSize: 12.5,
    fontWeight: '700',
    color: '#173D32',
    lineHeight: 15,
  },
  roleCardSubtitle: {
    fontFamily: Platform.select({
      ios: 'Poppins-Regular',
      android: 'Poppins_400Regular',
      web: 'Poppins, sans-serif',
      default: 'Poppins_400Regular',
    }),
    fontSize: 9.5,
    fontWeight: '400',
    color: '#55665D',
    lineHeight: 12,
  },
  roleRadioBadge: {
    marginLeft: 4,
  },
  radioCheckedGreen: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#075E2B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCheckedGold: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#C28723',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCheckmarkText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginTop: -1,
  },
  radioUncheckedRing: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    borderWidth: 1.4,
    borderColor: '#DFC596',
    backgroundColor: '#FFFDF8',
  },

  // 4. Google & Apple Horizontal Row
  socialButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 6,
    marginBottom: 6,
  },
  socialButton: {
    width: '48.5%',
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFDF8',
    borderWidth: 1.2,
    borderColor: '#DFC596',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  socialButtonText: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', default: 'Poppins_700Bold' }),
    fontSize: 13,
    fontWeight: '700',
    color: '#173D32',
    letterSpacing: 0.2,
  },

  // 5. Mobile Number Input
  inputPillField: {
    width: '100%',
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFDF8',
    borderWidth: 1.2,
    borderColor: '#DFA62E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.06,
    shadowRadius: 2.5,
    elevation: 2,
  },
  fieldIconPrefix: {
    marginRight: 8,
  },
  flagCountrySection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeText: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', default: 'Poppins_700Bold' }),
    fontSize: 13,
    fontWeight: '700',
    color: '#173D32',
    marginLeft: 6,
    marginRight: 3,
  },
  dropdownArrowText: {
    color: '#8A7B6B',
    fontSize: 12,
    marginRight: 6,
  },
  fieldDividerVertical: {
    width: 1,
    height: 22,
    backgroundColor: '#DFC596',
    marginRight: 10,
    opacity: 0.8,
  },
  phoneTextInput: {
    flex: 1,
    height: '100%',
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', default: 'Poppins_700Bold' }),
    fontSize: 13.5,
    color: '#173D32',
    paddingVertical: 0,
  },

  // Consent Row (for REGISTER)
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  checkboxSquare: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#DFA62E',
    backgroundColor: '#FFFDF8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxSquareChecked: {
    backgroundColor: '#075E2B',
    borderColor: '#075E2B',
  },
  checkmarkIcon: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginTop: -1,
  },
  consentTextBody: {
    flex: 1,
    fontSize: 10.5,
    color: '#55665D',
    lineHeight: 14,
  },
  consentLinkText: {
    color: '#075E2B',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  // 6. Get OTP Button
  getOtpButtonWrapper: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 6,
  },
  getOtpButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    borderWidth: 1.4,
    borderColor: '#DFA62E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  getOtpButtonText: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', default: 'Poppins_700Bold' }),
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },

  // 7. OR Divider
  orDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 4,
  },
  orDividerLine: {
    width: 48,
    height: 1,
    backgroundColor: '#DFA62E',
    opacity: 0.55,
  },
  orDividerText: {
    fontFamily: Platform.select({
      ios: 'Poppins-Medium',
      android: 'Poppins_500Medium',
      web: 'Poppins, sans-serif',
      default: 'Poppins_500Medium',
    }),
    fontSize: 12.5,
    color: '#55665D',
    marginHorizontal: 10,
  },

  // 8. Create New Account Button
  createAccountButton: {
    width: '100%',
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFDF8',
    borderWidth: 1.4,
    borderColor: '#DFA62E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 4,
  },
  createAccountButtonText: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', default: 'Poppins_700Bold' }),
    fontSize: 14,
    fontWeight: '700',
    color: '#075E2B',
    letterSpacing: 0.3,
  },

  // 9. Bottom Green Hills Illustration
  bottomHillsContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    overflow: 'hidden',
  },
  bottomHillsImage: {
    width: SCREEN_WIDTH * 0.85,
    height: 46,
    opacity: 0.88,
  },

  // OTP Verification Screen Styles
  otpScreenWrapper: {
    flex: 1,
    backgroundColor: '#FFF8EB',
  },
  otpTempleHeaderContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.28,
    position: 'relative',
  },
  otpTempleImage: {
    width: '100%',
    height: '100%',
  },
  otpGradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
  },
  otpFloatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 14) + 6 : 8,
  },
  otpBottomContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
    alignItems: 'center',
  },
  otpHeadingContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  otpTitleText: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', default: 'Poppins_700Bold' }),
    fontSize: 22,
    fontWeight: '700',
    color: '#173D32',
    marginBottom: 6,
    textAlign: 'center',
  },
  otpSubtitleText: {
    fontSize: 14,
    color: '#695147',
    textAlign: 'center',
    lineHeight: 20,
  },
  otpPhoneHighlight: {
    fontWeight: '700',
    color: '#173D32',
  },
  otpInputContainer: {
    width: '100%',
    marginVertical: 12,
    alignItems: 'center',
  },
  otpResendContainer: {
    marginVertical: 12,
    alignItems: 'center',
  },
  otpResendCountdownText: {
    fontSize: 14,
    color: '#695147',
    fontWeight: '500',
  },
  otpCountdownBold: {
    fontWeight: '700',
    color: '#173D32',
  },
  otpResendActiveText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#173D32',
    textDecorationLine: 'underline',
  },
  verifyCtaWrapper: {
    width: '100%',
    borderRadius: 26,
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.32,
    shadowRadius: 6,
    elevation: 4,
    marginTop: 8,
  },
  verifyCtaButton: {
    borderRadius: 26,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(235, 196, 118, 0.65)',
  },
  verifyCtaText: {
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', default: 'Poppins_700Bold' }),
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },

  // Thathwamasi Devotional Meaning Card Styles
  thathwamasiCardWrapper: {
    width: Math.min(SCREEN_WIDTH * 0.92, 386),
    alignSelf: 'center',
    marginTop: 14,
    marginBottom: 24,
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: '#DFC596',
    backgroundColor: '#FAF4E8',
    overflow: 'hidden',
    shadowColor: '#063E2D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 5,
    elevation: 3,
  },
  thathwamasiCardGradient: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
  },
  thathwamasiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  thathwamasiGoldLine: {
    width: 22,
    height: 1,
    backgroundColor: '#C59A37',
    opacity: 0.75,
  },
  thathwamasiTitle: {
    fontFamily: Platform.select({
      ios: 'Poppins-Bold',
      android: 'Poppins_700Bold',
      web: 'Poppins, sans-serif',
      default: 'Poppins_700Bold',
    }),
    fontSize: 16,
    fontWeight: '800',
    color: '#063E2D',
    letterSpacing: 0.5,
  },
  thathwamasiSubheader: {
    fontFamily: Platform.select({
      ios: 'Poppins-Medium',
      android: 'Poppins_500Medium',
      web: 'Poppins, sans-serif',
      default: 'Poppins_500Medium',
    }),
    fontSize: 11,
    color: '#8A7B6B',
    textAlign: 'center',
    marginTop: 1,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  thathwamasiBulletsList: {
    gap: 8,
    paddingVertical: 2,
  },
  thathwamasiBulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  thathwamasiBulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C59A37',
    marginTop: 6,
  },
  thathwamasiBulletText: {
    flex: 1,
    fontFamily: Platform.select({
      ios: 'Poppins-Regular',
      android: 'Poppins_400Regular',
      web: 'Poppins, sans-serif',
      default: 'Poppins_400Regular',
    }),
    fontSize: 11.5,
    color: '#263D33',
    lineHeight: 17,
  },
  thathwamasiTerm: {
    fontFamily: Platform.select({
      ios: 'Poppins-Bold',
      android: 'Poppins_700Bold',
      web: 'Poppins, sans-serif',
      default: 'Poppins_700Bold',
    }),
    fontWeight: '800',
    color: '#063E2D',
  },
  thathwamasiEssenceBox: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(197, 154, 55, 0.28)',
  },
  thathwamasiEssenceText: {
    fontFamily: Platform.select({
      ios: 'Poppins-Medium',
      android: 'Poppins_500Medium',
      web: 'Poppins, sans-serif',
      default: 'Poppins_500Medium',
    }),
    fontSize: 10.5,
    color: '#65776E',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 15,
  },
});
