import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableOpacity,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';

export interface ToastProps {
  visible: boolean;
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onHide?: () => void;
}

// Industry-grade SVG Icons
const SuccessIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke="#34D399" strokeWidth="2" strokeOpacity="0.3" fill="rgba(52, 211, 153, 0.15)" />
    <Path
      d="M7.5 12.5L10.5 15.5L16.5 8.5"
      stroke="#34D399"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ErrorIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke="#F87171" strokeWidth="2" strokeOpacity="0.3" fill="rgba(248, 113, 113, 0.15)" />
    <Path
      d="M15 9L9 15M9 9L15 15"
      stroke="#F87171"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const InfoIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke="#FBBF24" strokeWidth="2" strokeOpacity="0.3" fill="rgba(251, 191, 36, 0.15)" />
    <Path
      d="M12 8V8.01M12 11.5V16"
      stroke="#FBBF24"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CloseIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6L18 18"
      stroke="rgba(255, 255, 255, 0.55)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Intelligent parser that formats developer/raw messages into polished customer UI
function formatToastPayload(rawMessage: string, rawType: string, explicitTitle?: string) {
  let cleanMessage = rawMessage || '';
  let demoCode: string | null = null;
  let title = explicitTitle;

  // 1. Detect Expo Go / Preview mode test code
  const codeMatch = cleanMessage.match(/(?:verification code:\s*|Test Code:\s*|code:\s*)(\d{4,6})/i);
  if (codeMatch && codeMatch[1]) {
    demoCode = codeMatch[1];
    // Strip developer wording
    cleanMessage = cleanMessage
      .replace(/\(In Expo Go preview mode[^\)]*\)/gi, '')
      .replace(/•\s*Test Code:\s*\d+/gi, '')
      .replace(/Test Code:\s*\d+/gi, '')
      .trim();
  }

  // 2. Format phone number nicely (e.g. +916302759527 -> +91 63027 59527)
  cleanMessage = cleanMessage.replace(/\+91(\d{5})(\d{5})/, '+91 $1 $2');

  // 3. Fallback clean title if not explicitly provided
  if (!title) {
    const lower = cleanMessage.toLowerCase();
    if (rawType === 'success') {
      if (lower.includes('otp') || lower.includes('sent')) {
        title = 'OTP Sent Successfully 🙏';
      } else if (lower.includes('login') || lower.includes('welcome')) {
        title = 'Welcome Devotee 🙏';
      } else if (lower.includes('profile')) {
        title = 'Profile Updated 🙏';
      } else {
        title = 'Success 🙏';
      }
    } else if (rawType === 'error') {
      if (lower.includes('phone') || lower.includes('mobile') || lower.includes('10-digit')) {
        title = 'Invalid Mobile Number';
      } else if (lower.includes('otp') || lower.includes('code') || lower.includes('verification')) {
        title = 'Verification Notice';
      } else if (lower.includes('registered')) {
        title = 'Account Notice';
      } else if (lower.includes('terms') || lower.includes('agree')) {
        title = 'Consent Required';
      } else {
        title = 'Attention';
      }
    } else {
      title = 'Sacred Notice';
    }
  }

  return { title, message: cleanMessage, demoCode };
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  title: explicitTitle,
  message,
  type = 'success',
  duration = 4200,
  onHide,
}) => {
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const dismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) onHide();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 4,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy < 0) {
          // Allow upward dragging with realistic resistance
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -20 || gestureState.vy < -0.4) {
          // Flicked upward -> dismiss instantly
          dismiss();
        } else {
          // Spring back to resting spot
          Animated.spring(translateY, {
            toValue: 0,
            friction: 7,
            tension: 80,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible && message) {
      if (timerRef.current) clearTimeout(timerRef.current);

      translateY.setValue(-120);
      opacity.setValue(0);
      scale.setValue(0.92);

      // Smooth Spring Entrance (Dynamic Island style)
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
        }),
      ]).start();

      timerRef.current = setTimeout(() => {
        dismiss();
      }, duration);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [visible, message, duration]);

  if (!visible || !message) return null;

  const { title, message: cleanMsg, demoCode } = formatToastPayload(message, type, explicitTitle);

  // Modern luxury theme configurations
  const themeConfigs = {
    success: {
      gradient: ['#072417', '#0C3523', '#061D12'] as const,
      border: 'rgba(52, 211, 153, 0.45)',
      iconBg: 'rgba(52, 211, 153, 0.14)',
      titleColor: '#A7F3D0',
      textColor: '#ECFDF5',
      codeBg: 'rgba(245, 158, 11, 0.18)',
      codeBorder: 'rgba(245, 158, 11, 0.45)',
      codeText: '#FDE68A',
      Icon: SuccessIcon,
    },
    error: {
      gradient: ['#290808', '#3D0E0E', '#210606'] as const,
      border: 'rgba(248, 113, 113, 0.45)',
      iconBg: 'rgba(248, 113, 113, 0.14)',
      titleColor: '#FECACA',
      textColor: '#FFF1F2',
      codeBg: 'rgba(255, 255, 255, 0.1)',
      codeBorder: 'rgba(255, 255, 255, 0.2)',
      codeText: '#FFFFFF',
      Icon: ErrorIcon,
    },
    info: {
      gradient: ['#241503', '#392107', '#1A0F02'] as const,
      border: 'rgba(251, 191, 36, 0.45)',
      iconBg: 'rgba(251, 191, 36, 0.14)',
      titleColor: '#FDE68A',
      textColor: '#FFFBEB',
      codeBg: 'rgba(251, 191, 36, 0.18)',
      codeBorder: 'rgba(251, 191, 36, 0.45)',
      codeText: '#FEF3C7',
      Icon: InfoIcon,
    },
    warning: {
      gradient: ['#241503', '#392107', '#1A0F02'] as const,
      border: 'rgba(251, 191, 36, 0.45)',
      iconBg: 'rgba(251, 191, 36, 0.14)',
      titleColor: '#FDE68A',
      textColor: '#FFFBEB',
      codeBg: 'rgba(251, 191, 36, 0.18)',
      codeBorder: 'rgba(251, 191, 36, 0.45)',
      codeText: '#FEF3C7',
      Icon: InfoIcon,
    },
  };

  const currentTheme = themeConfigs[type] || themeConfigs.success;
  const ActiveIcon = currentTheme.Icon;

  // Safe status bar offset
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 48;
  const topPosition = statusBarHeight + 8;

  return (
    <Animated.View
      style={[
        styles.overlayContainer,
        {
          top: topPosition,
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        activeOpacity={0.96}
        onPress={dismiss}
        style={styles.touchableCard}
      >
        <LinearGradient
          colors={currentTheme.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.toastCard,
            {
              borderColor: currentTheme.border,
            },
          ]}
        >
          {/* Subtle Top Specular Glass Reflection */}
          <View style={styles.glassReflection} />

          {/* Left Icon Pill */}
          <View style={[styles.iconWrapper, { backgroundColor: currentTheme.iconBg }]}>
            <ActiveIcon />
          </View>

          {/* Center Content: Title + Subtitle + Demo Code Pill */}
          <View style={styles.textContainer}>
            {title ? (
              <Text style={[styles.titleText, { color: currentTheme.titleColor }]} numberOfLines={1}>
                {title}
              </Text>
            ) : null}

            {cleanMsg ? (
              <Text style={[styles.messageText, { color: currentTheme.textColor }]}>
                {cleanMsg}
              </Text>
            ) : null}

            {/* Test Mode / Preview Helper Chip */}
            {demoCode ? (
              <View style={[styles.demoCodePill, { backgroundColor: currentTheme.codeBg, borderColor: currentTheme.codeBorder }]}>
                <Text style={styles.demoCodeLabel}>Demo OTP:</Text>
                <Text style={[styles.demoCodeNumber, { color: currentTheme.codeText }]}>{demoCode}</Text>
              </View>
            ) : null}
          </View>

          {/* Dismiss ✕ Button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={dismiss}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <CloseIcon />
          </TouchableOpacity>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 999999,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  touchableCard: {
    width: '100%',
    maxWidth: 420,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.38,
    shadowRadius: 18,
    elevation: 14,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.2,
    overflow: 'hidden',
    position: 'relative',
  },
  glassReflection: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  messageText: {
    fontSize: 12.5,
    fontWeight: '500',
    lineHeight: 17,
    letterSpacing: 0.15,
    opacity: 0.95,
  },
  demoCodePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 1,
  },
  demoCodeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginRight: 5,
  },
  demoCodeNumber: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  closeBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});
