/**
 * Saranam Ayyappa - Real Firebase Phone OTP Authentication Service
 * Enterprise Expo Development Build + @react-native-firebase/auth Integration
 * Project: srithathwamasiayyappa-6a56f
 * Bundle ID / Package: com.saranam.ayyappa
 */
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

// Detect Expo Go client environment where native C++/Java binaries are absent
const isExpoGo =
  Constants.appOwnership === 'expo' ||
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

function getNativeAuthModule(): any {
  if (isExpoGo || Platform.OS === 'web') {
    return null;
  }
  try {
    const mod = require('@react-native-firebase/auth');
    return mod?.default || mod;
  } catch {
    return null;
  }
}

export interface FirebasePhoneAuthResult {
  idToken: string;
  phoneNumber: string;
  uid: string;
}

class FirebasePhoneAuthServiceClass {
  private activeConfirmation: any = null;
  private activePhoneNumber: string = '';

  /**
   * Check if native @react-native-firebase/auth module is available
   * (Available in Expo Development Build or standalone APK)
   */
  isNativeAvailable(): boolean {
    const auth = getNativeAuthModule();
    return Boolean(auth && typeof auth === 'function');
  }

  /**
   * Request real SMS OTP via Firebase Phone Authentication
   * @param phoneE164 E.164 formatted phone number (e.g. +916302759527)
   */
  async sendPhoneOtp(phoneE164: string): Promise<{ success: boolean; message: string }> {
    if (!phoneE164 || !phoneE164.startsWith('+') || phoneE164.length < 11) {
      throw new Error('Please enter a valid phone number with country code (e.g. +91 9876543210).');
    }

    this.activePhoneNumber = phoneE164;

    // 1. Physical Device Native Development Build
    const authModule = getNativeAuthModule();
    if (authModule && typeof authModule === 'function') {
      try {
        const auth = authModule();
        // Request Firebase Phone OTP with SafetyNet / Play Integrity / reCAPTCHA
        const confirmation = await auth.signInWithPhoneNumber(phoneE164);
        this.activeConfirmation = confirmation;

        return {
          success: true,
          message: `Real SMS OTP sent to ${phoneE164}. Please check your messages.`,
        };
      } catch (err: any) {
        this.activeConfirmation = null;
        const errMsg = err?.message || '';
        const errCode = err?.code || '';

        if (
          errMsg.includes('BILLING_NOT_ENABLED') ||
          errMsg.includes('billing-not') ||
          errCode.includes('billing')
        ) {
          throw new Error('Carrier SMS requires Firebase Blaze Plan enabled, or add number in Firebase Console -> Phone numbers for testing.');
        }

        const msg = this.humanizeFirebaseError(err);
        throw new Error(msg);
      }
    }

    // 2. Fallback for Expo Go (Client environment where native modules aren't linked)
    // Allows seamless testing in Expo Go / Vysor
    const isDev = __DEV__ || isExpoGo;
    if (isDev) {
      this.activeConfirmation = {
        isExpoGoTest: true,
        phone: phoneE164,
        confirm: async (code: string) => {
          if (code === '123456') {
            return {
              user: {
                uid: `dev_user_${phoneE164.replace(/[^0-9]/g, '').slice(-10)}`,
                phoneNumber: phoneE164,
                getIdToken: async () => `dev_token_${Date.now()}_${code}_${phoneE164}`,
              },
            };
          }
          const err: any = new Error('Incorrect verification code. Please check and re-enter.');
          err.code = 'auth/invalid-verification-code';
          throw err;
        },
      };

      return {
        success: true,
        message: `OTP sent to ${phoneE164}. (In Expo Go preview mode, enter verification code: 123456)`,
      };
    }

    throw new Error('Native Firebase Phone Auth is required to send real-time SMS. Please run on a device or native development build.');
  }

  /**
   * Verify the 6-digit SMS code against Firebase challenge
   * @param otpCode 6-digit numeric OTP
   */
  async confirmOtp(otpCode: string): Promise<FirebasePhoneAuthResult> {
    const cleanOtp = otpCode.replace(/[^0-9]/g, '').trim();
    if (cleanOtp.length !== 6) {
      throw new Error('Please enter all 6 digits of the verification code.');
    }

    // 1. Native Firebase Confirmation
    if (this.activeConfirmation && typeof this.activeConfirmation.confirm === 'function') {
      try {
        const userCredential = await this.activeConfirmation.confirm(cleanOtp);
        const user = userCredential.user;

        if (!user) {
          throw new Error('Firebase verification succeeded but user identity was missing.');
        }

        const idToken = await user.getIdToken();
        const verifiedPhone = user.phoneNumber || this.activePhoneNumber;

        // Clear active challenge on success
        this.clearChallenge();

        return {
          idToken,
          phoneNumber: verifiedPhone,
          uid: user.uid,
        };
      } catch (err: any) {
        const msg = this.humanizeFirebaseError(err);
        throw new Error(msg);
      }
    }

    throw new Error('No active Firebase phone verification session found. Please request a new OTP code.');
  }

  /**
   * Clear active confirmation challenge
   */
  clearChallenge(): void {
    this.activeConfirmation = null;
    this.activePhoneNumber = '';
  }

  /**
   * Transform raw Firebase error codes into devotee-friendly messages
   */
  private humanizeFirebaseError(err: any): string {
    const code = err?.code || '';
    const message = err?.message || '';

    switch (code) {
      case 'auth/invalid-phone-number':
        return 'The phone number entered is invalid. Please check the digits and try again.';
      case 'auth/missing-phone-number':
        return 'Please enter your mobile number.';
      case 'auth/quota-exceeded':
        return 'Daily SMS quota exceeded for this project. Please contact temple administration or try again tomorrow.';
      case 'auth/too-many-requests':
        return 'Too many attempts from this device. Please wait a few minutes before trying again.';
      case 'auth/invalid-verification-code':
        return 'The verification code entered is incorrect. Please re-enter the 6-digit code.';
      case 'auth/code-expired':
        return 'The verification code has expired. Please request a new OTP.';
      case 'auth/app-not-authorized':
        return 'App verification failed: Play Integrity / SHA fingerprints mismatch in Firebase console.';
      case 'auth/captcha-check-failed':
        return 'Device verification failed. Please try again.';
      case 'auth/network-request-failed':
        return 'Network connection error. Please check your internet connection.';
      default:
        return message || 'Firebase authentication failed. Please try again.';
    }
  }
}

export const FirebasePhoneAuthService = new FirebasePhoneAuthServiceClass();

