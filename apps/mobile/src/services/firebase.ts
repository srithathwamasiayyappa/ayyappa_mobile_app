// Official Firebase App Configuration dynamically driven by google-services.json & GoogleService-Info.plist
// Project ID: srithathwamasiayyappa-6a56f
// Project Number: 999029802299

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDWLl90R09PLwdgk9gT6TfsdTPRqaQFAec",
  authDomain: "srithathwamasiayyappa-6a56f.firebaseapp.com",
  projectId: "srithathwamasiayyappa-6a56f",
  storageBucket: "srithathwamasiayyappa-6a56f.firebasestorage.app",
  messagingSenderId: "999029802299",
  appId: "1:999029802299:android:12a65a07d104a494cc631e",
  iosAppId: "1:999029802299:ios:196bf77d9333e54dcc631e",
};

export class FirebaseService {
  /**
   * Industry-standard Google OAuth / Gmail sign-in
   * Compatible with Web, Android, and iOS
   * Uses Google Identity Services (GSI) on web browsers
   * Uses @react-native-google-signin on native Android/iOS
   */
  static async signInWithGoogle(): Promise<{ idToken: string; email?: string; fullName?: string; googleId?: string }> {
    // 1. Web browser: Use standard Google OAuth2 Token Client Popup (instant interactive account picker)
    if (typeof window !== 'undefined') {
      const g = (window as any).google;
      if (g && g.accounts && g.accounts.oauth2) {
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Google Sign-In window closed or timed out.'));
          }, 60000);

          try {
            const tokenClient = g.accounts.oauth2.initTokenClient({
              client_id: '999029802299-3ccu2gn8g2rshv33o2dpj1es2rum6dg2.apps.googleusercontent.com',
              scope: 'openid email profile',
              callback: async (tokenResponse: any) => {
                clearTimeout(timeout);
                if (tokenResponse && tokenResponse.access_token) {
                  try {
                    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                      headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                    });
                    const userInfo = await userRes.json();
                    resolve({
                      idToken: tokenResponse.access_token,
                      email: userInfo.email,
                      fullName: userInfo.name || 'Google Devotee',
                      googleId: userInfo.sub,
                    });
                  } catch (e) {
                    reject(new Error('Failed to retrieve Google profile.'));
                  }
                } else if (tokenResponse && tokenResponse.error) {
                  reject(new Error(`Google Sign-In: ${tokenResponse.error}`));
                } else {
                  reject(new Error('Google Sign-In was cancelled.'));
                }
              },
            });

            // Trigger the explicit Google account picker popup immediately
            tokenClient.requestAccessToken({ prompt: 'select_account' });
          } catch (e: any) {
            clearTimeout(timeout);
            reject(e);
          }
        });
      }
    }

    // 2. React Native Native Android / iOS Google Sign-In
    try {
      const GoogleSigninModule = require('@react-native-google-signin/google-signin');
      if (GoogleSigninModule && GoogleSigninModule.GoogleSignin) {
        await GoogleSigninModule.GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSigninModule.GoogleSignin.signIn();
        const tokens = await GoogleSigninModule.GoogleSignin.getTokens();
        return {
          idToken: tokens.idToken || userInfo.data?.idToken,
          email: userInfo.data?.user?.email,
          fullName: userInfo.data?.user?.name,
          googleId: userInfo.data?.user?.id,
        };
      }
    } catch (nativeErr) {
      // Native module not installed in this environment
    }

    // 3. Fallback notice
    throw new Error('Google Sign-In requires an Android device with Google Play Services or an active Google session in your browser.');
  }
}

