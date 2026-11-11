import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Platform,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SPLASH_VIDEO_BASE64 } from '../../../assets/splashVideoData';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web' && videoRef.current) {
      const vid = videoRef.current;
      vid.currentTime = 0;
      vid.muted = false;
      vid.defaultMuted = false;
      vid.volume = 1.0;

      // AudioContext + Web Audio API ensures audio starts without browser policy blocking
      let audioCtx: any = null;
      try {
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioCtx = new AudioContextClass();
          if (audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => {});
          }
        }
      } catch (e) {}

      // Play with unmuted audio immediately
      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            vid.muted = false;
            vid.volume = 1.0;
          })
          .catch(() => {
            // If browser autoplay policy strictly demands gesture, play muted first then unmute immediately on any interaction
            vid.muted = true;
            vid.play().then(() => {
              // Attempt immediate unmute
              vid.muted = false;
              vid.volume = 1.0;
            }).catch(() => {});

            const enableSound = () => {
              if (vid) {
                vid.muted = false;
                vid.volume = 1.0;
                if (audioCtx && audioCtx.state === 'suspended') {
                  audioCtx.resume().catch(() => {});
                }
                if (vid.paused && !vid.ended) {
                  vid.play().catch(() => {});
                }
              }
            };
            window.addEventListener('pointerdown', enableSound, { once: true });
            window.addEventListener('click', enableSound, { once: true });
            window.addEventListener('touchstart', enableSound, { once: true });
            window.addEventListener('keydown', enableSound, { once: true });
          });
      }

      // Transition to Auth / Home when video finishes
      const fallbackTimer = setTimeout(() => {
        onFinish();
      }, 7500);

      return () => {
        clearTimeout(fallbackTimer);
      };
    } else {
      const timer = setTimeout(() => {
        onFinish();
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [onFinish]);

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            backgroundColor: '#000000',
          }}
        >
          <video
            ref={videoRef}
            src={SPLASH_VIDEO_BASE64}
            autoPlay
            playsInline
            controls={false}
            disablePictureInPicture
            disableRemotePlayback
            onEnded={onFinish}
            style={{
              width: '100vw',
              height: '100vh',
              objectFit: 'contain',
              backgroundColor: '#000000',
              border: 'none',
              outline: 'none',
              userSelect: 'none',
            }}
          />
        </div>
      ) : (
        <View style={styles.container} />
      )}
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
  },
});
