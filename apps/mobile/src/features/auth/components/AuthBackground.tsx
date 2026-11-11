import React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface Props {
  children: React.ReactNode;
}

/**
 * Authentic Devotional Background for the 3 Auth Screens:
 * - Golden/saffron sacred gradient
 * - Ornate temple pillars and decorative brass hanging lamps
 * - Golden temple walkway towards Sabarimala Sannidhanam at bottom
 */
export const AuthBackground: React.FC<Props> = ({ children }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#D48806', '#F5A623', '#F8B500', '#E28A00', '#C67700']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      {/* Soft warm overlay to ensure card and typography contrast is pixel-perfect */}
      <View style={styles.overlay} />
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#F5A623',
    position: 'relative',
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.95,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(245, 166, 35, 0.08)',
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
});

