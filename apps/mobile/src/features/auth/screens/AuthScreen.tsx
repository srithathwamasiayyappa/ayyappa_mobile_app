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
} from 'react-native';
import { AuthBackground } from '../components/AuthBackground';
import { AuthBrandHeader } from '../components/AuthBrandHeader';
import { AuthSegmentedTabs } from '../components/AuthSegmentedTabs';
import { MobileNumberInput } from '../components/MobileNumberInput';
import { AuthGradientButton } from '../components/AuthGradientButton';
import { SixDigitOtpInput } from '../components/SixDigitOtpInput';
import { Toast } from '../../../components/common/Toast';
import { ApiService } from '../../../services/api';
import { FirebaseService } from '../../../services/firebase';

interface Props {
  onLoginSuccess: (user: any) => void;
  onSkip?: () => void;
}

export const AuthScreen: React.FC<Props> = ({ onLoginSuccess, onSkip }) => {
  // Navigation / Step state: 'LOGIN' | 'REGISTER' | 'VERIFY_OTP'
  const [currentStep, setCurrentStep] = useState<'LOGIN' | 'REGISTER' | 'VERIFY_OTP'>('LOGIN');
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [otpIntent, setOtpIntent] = useState<'login' | 'register'>('login');

  // Form Fields
  const [loginPhone, setLoginPhone] = useState('');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Info banner state (Image 2)
  const [showRegInfoBanner, setShowRegInfoBanner] = useState(true);

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

  // Cooldown countdown
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

  // SCREEN 1: Send Login OTP
  const handleSendLoginOtp = async () => {
    setErrorMsg(null);
    const clean = loginPhone.replace(/[^0-9]/g, '');
    if (!clean || clean.length < 10) {
      setErrorMsg('Please enter a valid 10-digit registered mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await ApiService.sendOtp(clean, 'login');
      setOtpIntent('login');
      setResendCooldown(30);
      setOtpCode('');
      setCurrentStep('VERIFY_OTP');
      showToast(`OTP sent to +91 ${clean}! (Testing code: ${res.otp || '123456'})`, 'info');
    } catch (err: any) {
      setErrorMsg(err.message || 'Mobile number not found. Please register first.');
    } finally {
      setLoading(false);
    }
  };

  // SCREEN 2: Send Verification OTP
  const handleSendRegOtp = async () => {
    setErrorMsg(null);
    if (!regName.trim()) {
      setShowRegInfoBanner(true);
      setErrorMsg('Please enter your full name before requesting OTP.');
      return;
    }
    const clean = regPhone.replace(/[^0-9]/g, '');
    if (!clean || clean.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await ApiService.sendOtp(clean, 'register');
      setOtpIntent('register');
      setResendCooldown(30);
      setOtpCode('');
      setCurrentStep('VERIFY_OTP');
      showToast(`Verification code sent to +91 ${clean}! (Testing code: ${res.otp || '123456'})`, 'info');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Number may already be registered.');
    } finally {
      setLoading(false);
    }
  };

  // SCREEN 3: Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    const phone = otpIntent === 'login' ? loginPhone : regPhone;
    setLoading(true);
    try {
      const res = await ApiService.sendOtp(phone, otpIntent);
      setResendCooldown(30);
      showToast(`New OTP sent to +91 ${phone}! (Testing code: ${res.otp || '123456'})`, 'info');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  // SCREEN 3: Verify OTP
  const handleVerifyOtp = async () => {
    setErrorMsg(null);
    if (!otpCode || otpCode.length !== 6) {
      setErrorMsg('Please enter the full 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      if (otpIntent === 'register') {
        const res = await ApiService.registerWithOtp({
          fullName: regName.trim(),
          phoneNumber: regPhone.trim(),
          otp: otpCode.trim(),
        });

        if (res && res.success) {
          // Toast: Registration has been successfully completed.
          showToast('Registration has been successfully completed.', 'success');
          // Navigate to login screen
          setTimeout(() => {
            setLoginPhone(regPhone.trim());
            setActiveTab('login');
            setCurrentStep('LOGIN');
            setOtpCode('');
          }, 1200);
        }
      } else {
        const res = await ApiService.loginWithOtp(loginPhone.trim(), otpCode.trim());
        if (res && res.success) {
          // Toast: Successfully logged in.
          showToast('Successfully logged in.', 'success');
          // Navigate to language screen
          setTimeout(() => {
            onLoginSuccess(res.user);
          }, 1000);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Google / Gmail Sign In
  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const googleUser = await FirebaseService.signInWithGoogle();
      if (!googleUser || !googleUser.idToken) {
        throw new Error('Google Sign-In did not return an authentic identity token.');
      }

      const res = await ApiService.loginWithGoogle({
        idToken: googleUser.idToken,
      });

      if (res && res.user) {
        showToast('Successfully logged in.', 'success');
        setTimeout(() => {
          onLoginSuccess(res.user);
        }, 1000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  // Phone number for Screen 3
  const activeVerificationNumber = otpIntent === 'login' ? loginPhone : regPhone;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5A623" />

      {/* Floating Animated Toast */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />

      <AuthBackground>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Devotional Top Branding Header */}
              <AuthBrandHeader />

              {/* Pixel-Accurate Authentication Card */}
              <View style={styles.card}>
                {/* Segmented Tabs */}
                <AuthSegmentedTabs
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                />

                {/* Inline Error Message */}
                {errorMsg && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
                  </View>
                )}

                {/* ========================================================
                    SCREEN 1: LOGIN WITH OTP
                   ======================================================== */}
                {currentStep === 'LOGIN' && (
                  <View style={styles.form}>
                    <MobileNumberInput
                      label="Registered Mobile Number *"
                      value={loginPhone}
                      onChangeText={setLoginPhone}
                      placeholder="e.g. 9876543210"
                    />

                    <AuthGradientButton
                      title="Send Login OTP"
                      onPress={handleSendLoginOtp}
                      loading={loading}
                      icon={<Text style={styles.envelopeIcon}>✉️</Text>}
                    />
                  </View>
                )}

                {/* ========================================================
                    SCREEN 2: REGISTER WITH OTP
                   ======================================================== */}
                {currentStep === 'REGISTER' && (
                  <View style={styles.form}>
                    {/* Approved Devotional Lamp Info Banner */}
                    {showRegInfoBanner && (
                      <View style={styles.infoBanner}>
                        <Text style={styles.lampIcon}>🪔</Text>
                        <Text style={styles.infoBannerText}>
                          Please enter your full name before requesting OTP.
                        </Text>
                      </View>
                    )}

                    {/* Devotee Full Name */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.fieldLabel}>Devotee Full Name *</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="e.g. Vinod Thatipally"
                        placeholderTextColor="#9E9E9E"
                        value={regName}
                        onChangeText={setRegName}
                      />
                    </View>

                    {/* Mobile Number */}
                    <MobileNumberInput
                      label="Mobile Number *"
                      value={regPhone}
                      onChangeText={setRegPhone}
                      placeholder="e.g. 9876543210"
                    />

                    <AuthGradientButton
                      title="Send Verification OTP"
                      onPress={handleSendRegOtp}
                      loading={loading}
                      icon={<Text style={styles.envelopeIcon}>✉️</Text>}
                    />
                  </View>
                )}

                {/* ========================================================
                    SCREEN 3: OTP VERIFICATION
                   ======================================================== */}
                {currentStep === 'VERIFY_OTP' && (
                  <View style={styles.form}>
                    {/* Display Number with Edit option */}
                    <MobileNumberInput
                      label="Registered Mobile Number *"
                      value={activeVerificationNumber}
                      onChangeText={() => {}}
                      editable={false}
                    />

                    {/* Enter 6-Digit OTP Header Row */}
                    <View style={styles.otpHeaderRow}>
                      <Text style={styles.fieldLabel}>Enter 6-Digit OTP *</Text>
                      <TouchableOpacity
                        onPress={handleResendOtp}
                        disabled={!canResend}
                      >
                        <Text
                          style={[
                            styles.resendLink,
                            !canResend && styles.resendDisabled,
                          ]}
                        >
                          {canResend
                            ? 'Resend OTP'
                            : `Resend in 00:${resendCooldown.toString().padStart(2, '0')}`}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Six Separate Visual Digit Boxes */}
                    <SixDigitOtpInput
                      value={otpCode}
                      onChangeOtp={setOtpCode}
                    />

                    {/* Verify Action Button */}
                    <AuthGradientButton
                      title={
                        otpIntent === 'login'
                          ? 'Verify OTP & Sign In ➔'
                          : 'Verify OTP & Register ➔'
                      }
                      onPress={handleVerifyOtp}
                      loading={loading}
                    />
                  </View>
                )}

                {/* Divider: or continue with Gmail */}
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or continue with Gmail</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Google Sign-In Button */}
                <TouchableOpacity
                  style={styles.googleBtn}
                  activeOpacity={0.85}
                  disabled={loading}
                  onPress={handleGoogleSignIn}
                >
                  <View style={styles.googleIconBox}>
                    <Text style={styles.googleG}>G</Text>
                  </View>
                  <View style={styles.dividerV} />
                  <Text style={styles.googleBtnText}>Sign In with Google</Text>
                </TouchableOpacity>
              </View>

              {/* Skip for now option */}
              {onSkip && (
                <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
                  <Text style={styles.skipText}>Skip for now & explore →</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </AuthBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5A623',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 24,
    elevation: 12,
    shadowColor: '#4E1B0B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FFF3E0',
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
    fontSize: 12.5,
    fontWeight: '700',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF0EC',
    borderWidth: 1,
    borderColor: '#F8C8B8',
    borderLeftWidth: 4,
    borderLeftColor: '#D84315',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  lampIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#7F220B',
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 16,
    width: '100%',
  },
  fieldLabel: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#252525',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E6D1BD',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#212121',
    fontWeight: '600',
  },
  envelopeIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  otpHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
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
    marginTop: 4,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EAEAEA',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12.5,
    color: '#757575',
    fontWeight: '600',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  googleIconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  googleG: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
  dividerV: {
    width: 1,
    height: 18,
    backgroundColor: '#E0E0E0',
    marginRight: 12,
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#37474F',
  },
  skipBtn: {
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    color: '#FFF8E1',
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
