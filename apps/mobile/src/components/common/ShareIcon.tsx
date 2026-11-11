import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

interface Props {
  size?: number;
  color?: string;
}

/**
 * Industry-Standard Android/Material 3-node connected vector Share Icon
 * Works seamlessly across Web, Android, and iOS without third-party SVG peer dependencies.
 */
export const ShareIcon: React.FC<Props> = ({ size = 20, color = '#FFFFFF' }) => {
  const nodeSize = size * 0.28;
  const lineWidth = size * 0.1;

  if (Platform.OS === 'web') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ display: 'block' }}
      >
        <circle cx="18" cy="5" r="3" fill={color} />
        <circle cx="6" cy="12" r="3" fill={color} />
        <circle cx="18" cy="19" r="3" fill={color} />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    );
  }

  // Native React Native View-based connected share nodes
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      {/* Top right node */}
      <View
        style={[
          styles.node,
          {
            width: nodeSize,
            height: nodeSize,
            borderRadius: nodeSize / 2,
            backgroundColor: color,
            position: 'absolute',
            top: 2,
            right: 1,
          },
        ]}
      />
      {/* Left center node */}
      <View
        style={[
          styles.node,
          {
            width: nodeSize,
            height: nodeSize,
            borderRadius: nodeSize / 2,
            backgroundColor: color,
            position: 'absolute',
            left: 1,
            top: (size - nodeSize) / 2,
          },
        ]}
      />
      {/* Bottom right node */}
      <View
        style={[
          styles.node,
          {
            width: nodeSize,
            height: nodeSize,
            borderRadius: nodeSize / 2,
            backgroundColor: color,
            position: 'absolute',
            bottom: 2,
            right: 1,
          },
        ]}
      />
      {/* Upper connector */}
      <View
        style={{
          position: 'absolute',
          width: size * 0.65,
          height: lineWidth,
          backgroundColor: color,
          transform: [{ rotate: '-30deg' }],
          left: size * 0.18,
          top: size * 0.32,
        }}
      />
      {/* Lower connector */}
      <View
        style={{
          position: 'absolute',
          width: size * 0.65,
          height: lineWidth,
          backgroundColor: color,
          transform: [{ rotate: '30deg' }],
          left: size * 0.18,
          bottom: size * 0.32,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  node: {
    elevation: 1,
  },
});

