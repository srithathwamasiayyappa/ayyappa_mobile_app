import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { ApiService } from '../../../services/api';
import { StorageService } from '../../../services/storageService';

const { width, height } = Dimensions.get('window');

// Bundled high-resolution fallback artwork (Guaranteed 100% offline reliability)
const BUNDLED_FALLBACK_IMAGE = require('../../../../assets/splash_devotional.jpg');

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [imageSource, setImageSource] = useState<any>(BUNDLED_FALLBACK_IMAGE);
  const [isDynamicLoaded, setIsDynamicLoaded] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function resolveSplashArtwork() {
      try {
        // Step 1: Restore previously cached dynamic splash metadata from storage
        const cached = await StorageService.getCachedSplash();
        if (cached && cached.imageUrl && isMounted) {
          setImageSource({ uri: cached.imageUrl });
        }

        // Step 2: Fetch latest published splash metadata from MariaDB API
        const activeSplash = await ApiService.getActiveSplash(Platform.OS);
        if (activeSplash && activeSplash.imageUrl && isMounted) {
          // If version is updated or newly published, update the display and persist to cache
          if (!cached || cached.version !== activeSplash.version || cached.imageUrl !== activeSplash.imageUrl) {
            setImageSource({ uri: activeSplash.imageUrl });
            await StorageService.saveCachedSplash(activeSplash);
            setIsDynamicLoaded(true);
          }
        }
      } catch (err) {
        // Safe fail-closed: Retain bundled fallback or cached asset
        console.log('Splash resolution notice (using bundled asset):', err);
      }
    }

    resolveSplashArtwork();

    // Devotional welcome duration (3.8 seconds), transitioning cleanly to Auth / Home
    const timer = setTimeout(() => {
      if (isMounted) {
        onFinish();
      }
    }, 3800);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={false} />

      {/* Full-Screen Devotional Artwork */}
      <Image
        source={imageSource}
        style={styles.splashImage}
        resizeMode="contain"
      />

      {/* Top Right Quick Skip Button */}
      <TouchableOpacity
        style={styles.skipBtn}
        activeOpacity={0.7}
        onPress={onFinish}
      >
        <Text style={styles.skipText}>Skip &gt;</Text>
      </TouchableOpacity>

      {/* Bottom Devotional Golden Indicator */}
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color="#FFD54F" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  splashImage: {
    width: '100%',
    height: '100%',
  },
  skipBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 213, 79, 0.4)',
    zIndex: 20,
  },
  skipText: {
    color: '#FFD54F',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    zIndex: 10,
  },
});
