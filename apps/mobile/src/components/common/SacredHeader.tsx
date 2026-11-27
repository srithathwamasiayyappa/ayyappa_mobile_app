import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
const { width: SCREEN_WIDTH_FULL, height: SCREEN_HEIGHT_FULL } = Dimensions.get('screen');
const SCREEN_WIDTH = Math.min(WINDOW_WIDTH, SCREEN_WIDTH_FULL);
const SCREEN_HEIGHT = Math.max(WINDOW_HEIGHT, SCREEN_HEIGHT_FULL);
const isLargeOrTallScreen = SCREEN_HEIGHT >= 800 || SCREEN_HEIGHT / SCREEN_WIDTH >= 1.95;

const ANDROID_STATUS_BAR_HEIGHT =
  Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;

interface SacredHeaderProps {
  title: string;
  onBack?: () => void;
  showBack?: boolean;
  rightElement?: React.ReactNode;
  titleColor?: string;
}

const HeaderCornerFiligree = () => (
  <View style={{ transform: [{ scaleX: -1 }] }} pointerEvents="none">
    <Svg width={32} height={32} viewBox="0 0 36 36" fill="none">
      <Path
        d="M2 2 C12 2 22 8 28 16 C24 18 18 16 12 22 C8 16 6 8 2 2 Z"
        fill="#DFA62E"
        fillOpacity={0.7}
      />
      <Circle cx="8" cy="8" r="2" fill="#FFD700" />
      <Circle cx="16" cy="5" r="1.5" fill="#FFD700" />
      <Circle cx="5" cy="16" r="1.5" fill="#FFD700" />
    </Svg>
  </View>
);

export const SacredHeader: React.FC<SacredHeaderProps> = ({
  title,
  onBack,
  showBack = true,
  rightElement,
  titleColor = '#E6B800',
}) => {
  return (
    <LinearGradient
      colors={['#173D32', '#173D32', '#0C251E']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.headerBar}
    >
      <View style={styles.sideSlot}>
        {showBack && onBack ? (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBack}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Text style={styles.backArrowText}>←</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <Text style={[styles.headerTitle, { color: titleColor }]} numberOfLines={1}>
        {title}
      </Text>

      <View style={[styles.sideSlot, styles.rightSlot]}>
        {rightElement ?? <HeaderCornerFiligree />}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerBar: {
    minHeight: 56 + ANDROID_STATUS_BAR_HEIGHT,
    paddingTop: ANDROID_STATUS_BAR_HEIGHT + 6,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(223, 166, 46, 0.4)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
  },
  sideSlot: {
    width: 40,
    height: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  rightSlot: {
    alignItems: 'flex-end',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrowText: {
    color: '#FFFDF8',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
    paddingHorizontal: 6,
    fontFamily: Platform.select({
      ios: 'Poppins-Bold',
      android: 'Poppins_700Bold',
      default: 'serif',
    }),
  },
});
