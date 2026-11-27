import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type DevotionalDialogType = 'success' | 'warning' | 'error' | 'info' | 'favorite' | 'unfavorite';

export interface DevotionalDialogProps {
  visible: boolean;
  title: string;
  message: string;
  type?: DevotionalDialogType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  isDestructive?: boolean;
  autoCloseAfterMs?: number;
}

// Sacred Gopuram / Temple Motif at Card Header
const TempleGopuramHeaderMotif = () => (
  <Svg width={36} height={26} viewBox="0 0 40 30" fill="none">
    <Circle cx="20" cy="3" r="1.5" fill="#DFA62E" />
    <Path d="M19 4.5 H21 L20.5 7 H19.5 Z" fill="#173D32" />
    <Path d="M17 7 H23 L22 11 H18 Z" fill="#173D32" />
    <Path d="M16 11 H24 L25 16 H15 Z" fill="#173D32" />
    <Path d="M12 16 H28 L29 22 H11 Z" fill="#173D32" />
    <Path d="M8 22 H32 V28 H8 Z" fill="#173D32" />
    <Path d="M16 28 V24 Q20 22 24 24 V28 Z" fill="#DFA62E" />
  </Svg>
);

// Sacred Status Icons
const SuccessEmblem = () => (
  <View style={styles.iconCircleSuccess}>
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke="#16A34A" strokeWidth="2" fill="rgba(22, 163, 74, 0.12)" />
      <Path
        d="M7.5 12.5L10.5 15.5L16.5 8.5"
        stroke="#16A34A"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </View>
);

const WarningEmblem = () => (
  <View style={styles.iconCircleWarning}>
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke="#D97706" strokeWidth="2" fill="rgba(217, 119, 6, 0.12)" />
      <Path d="M12 7V13" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" />
      <Circle cx="12" cy="16.5" r="1.2" fill="#D97706" />
    </Svg>
  </View>
);

const ErrorEmblem = () => (
  <View style={styles.iconCircleError}>
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke="#DC2626" strokeWidth="2" fill="rgba(220, 38, 38, 0.12)" />
      <Path d="M15 9L9 15M9 9L15 15" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" />
    </Svg>
  </View>
);

const InfoEmblem = () => (
  <View style={styles.iconCircleInfo}>
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke="#0284C7" strokeWidth="2" fill="rgba(2, 132, 199, 0.12)" />
      <Path d="M12 11V16M12 8V8.01" stroke="#0284C7" strokeWidth="2.2" strokeLinecap="round" />
    </Svg>
  </View>
);

const FavoriteEmblem = () => (
  <View style={styles.iconCircleFavorite}>
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill="#E11D48"
      />
    </Svg>
  </View>
);

const UnfavoriteEmblem = () => (
  <View style={styles.iconCircleUnfavorite}>
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        stroke="#854D0E"
        strokeWidth="2"
        fill="rgba(245, 158, 11, 0.12)"
      />
    </Svg>
  </View>
);

export const DevotionalDialog: React.FC<DevotionalDialogProps> = ({
  visible,
  title,
  message,
  type = 'success',
  confirmText = 'OK',
  cancelText,
  onConfirm,
  onCancel,
  isDestructive = false,
  autoCloseAfterMs,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && autoCloseAfterMs && autoCloseAfterMs > 0) {
      const timer = setTimeout(() => {
        if (onConfirm) onConfirm();
        else if (onCancel) onCancel();
      }, autoCloseAfterMs);
      return () => clearTimeout(timer);
    }
  }, [visible, autoCloseAfterMs, onConfirm, onCancel]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  const renderIcon = () => {
    switch (type) {
      case 'warning':
        return <WarningEmblem />;
      case 'error':
        return <ErrorEmblem />;
      case 'info':
        return <InfoEmblem />;
      case 'favorite':
        return <FavoriteEmblem />;
      case 'unfavorite':
        return <UnfavoriteEmblem />;
      case 'success':
      default:
        return <SuccessEmblem />;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel || onConfirm}>
      <TouchableWithoutFeedback onPress={cancelText ? onCancel : onConfirm}>
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.backdrop,
              { opacity: opacityAnim },
            ]}
          />
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.dialogCard,
                {
                  opacity: opacityAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              {/* Sacred Golden Top Border Ribbon */}
              <LinearGradient
                colors={['#C99326', '#F5D77F', '#C99326']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.topRibbon}
              />

              {/* Gopuram Motif */}
              <View style={styles.motifWrap}>
                <TempleGopuramHeaderMotif />
              </View>

              {/* Centered Status Emblem */}
              <View style={styles.emblemWrap}>{renderIcon()}</View>

              {/* Title */}
              <Text style={styles.title}>{title}</Text>

              {/* Message */}
              <Text style={styles.message}>{message}</Text>

              {/* Button Actions */}
              <View style={styles.actionRow}>
                {Boolean(cancelText) && (
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={onCancel}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.cancelBtnText}>{cancelText}</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.confirmBtnWrap, !cancelText && { flex: 1 }]}
                  onPress={onConfirm}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={
                      isDestructive
                        ? ['#991B1B', '#7F1D1D']
                        : ['#173D32', '#0E2720']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.confirmBtnGradient}
                  >
                    <Text style={styles.confirmBtnText}>{confirmText}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 24, 20, 0.72)',
  },
  dialogCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFDF9',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E5C478',
    paddingTop: 16,
    paddingBottom: 22,
    paddingHorizontal: 22,
    alignItems: 'center',
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 12,
    overflow: 'hidden',
  },
  topRibbon: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  motifWrap: {
    marginBottom: 6,
    alignItems: 'center',
  },
  emblemWrap: {
    marginBottom: 12,
    alignItems: 'center',
  },
  iconCircleSuccess: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EDFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
  },
  iconCircleWarning: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FCD34D',
  },
  iconCircleError: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
  },
  iconCircleInfo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#7DD3FC',
  },
  iconCircleFavorite: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFF1F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FDA4AF',
  },
  iconCircleUnfavorite: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FEFCE8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FDE047',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#173D32',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
    color: '#5C4A38',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 6,
  },
  actionRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#D4C2B0',
    backgroundColor: '#F9F4EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B5441',
  },
  confirmBtnWrap: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#DFA62E',
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  confirmBtnGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF8EB',
    letterSpacing: 0.3,
  },
});
