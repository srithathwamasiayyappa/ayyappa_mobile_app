import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Easing, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface SplashLoadingIndicatorProps {
  label?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export const SplashLoadingIndicator: React.FC<SplashLoadingIndicatorProps> = ({
  label = 'Loading...',
  size = 48,
  strokeWidth = 3.6,
  color = '#F5C451',
}) => {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();

    return () => {
      animation.stop();
    };
  }, [rotation]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Recreate an open ~285 degree circular arc matching Image 1
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;

  // Compute arc coordinates from angle -90° (top) to 195° (bottom-left)
  const startAngle = -90 * (Math.PI / 180);
  const endAngle = 195 * (Math.PI / 180);

  const startX = center + radius * Math.cos(startAngle);
  const startY = center + radius * Math.sin(startAngle);
  const endX = center + radius * Math.cos(endAngle);
  const endY = center + radius * Math.sin(endAngle);

  // SVG Path: Arc with large-arc-flag = 1, sweep-flag = 1
  const arcPath = `M ${startX.toFixed(2)} ${startY.toFixed(2)} A ${radius.toFixed(2)} ${radius.toFixed(2)} 0 1 1 ${endX.toFixed(2)} ${endY.toFixed(2)}`;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.spinnerWrapper,
          {
            width: size,
            height: size,
            transform: [{ rotate: spin }],
          },
        ]}
      >
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Path
            d={arcPath}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>

      {label ? <Text style={styles.labelText}>{label}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    fontFamily: Platform.select({
      ios: 'Poppins-Medium',
      android: 'Poppins_500Medium',
      web: 'Poppins, sans-serif',
      default: 'Poppins_500Medium',
    }),
    fontSize: 13,
    fontWeight: '500',
    color: '#FFF8E8',
    letterSpacing: 0.6,
    marginTop: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
