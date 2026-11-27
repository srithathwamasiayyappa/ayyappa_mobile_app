import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Platform } from 'react-native';

interface Props {
  text?: string | null;
}

export const DevotionalTicker: React.FC<Props> = ({ text }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Exact sacred chant as requested
  const chantText = 'Om Sri Swamiye Saranam Ayyappa';
  const fullLoopText = `${chantText}    •    ${chantText}    •    ${chantText}    •    ${chantText}`;

  useEffect(() => {
    // Continuous infinite marquee loop compatible with Web, Android, and iOS
    const runAnimation = () => {
      animatedValue.setValue(0);
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 12000, // Smooth continuous crawl speed
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== 'web' ? true : false,
      }).start(({ finished }) => {
        if (finished) {
          runAnimation();
        }
      });
    };

    runAnimation();

    return () => {
      animatedValue.stopAnimation();
    };
  }, []);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [300, -600],
  });

  return (
    <View style={styles.container}>
      {/* Marquee viewport */}
      <View style={styles.marqueeViewport}>
        <Animated.View
          style={[
            styles.animatedContainer,
            { transform: [{ translateX }] },
          ]}
        >
          <Text style={styles.mantraText} numberOfLines={1}>
            {fullLoopText}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF3E0',
    flexDirection: 'row',
    alignItems: 'center',
    height: 34,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE0B2',
    overflow: 'hidden',
    width: '100%',
  },
  marqueeViewport: {
    flex: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    height: '100%',
  },
  animatedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 1400, // Sufficient width to prevent truncation while scrolling
  },
  mantraText: {
    color: '#BF360C',
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
