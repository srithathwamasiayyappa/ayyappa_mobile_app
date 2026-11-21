import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  children: React.ReactNode;
}

const AUTH_DEVOTIONAL_BG = require('../../../assets/images/auth_devotional_bg.jpg');

/**
 * Authentic Devotional Background for Saranam Ayyappa Authentication:
 * - Warm ivory and golden cream base (#FEFAF2 -> #F4E7D7)
 * - Ornate golden temple arches at the top
 * - Delicate hanging brass bells on both sides
 * - Sabarimala temple scenery on the right
 * - Pilgrim silhouettes trekking along the lower mountains
 */
export const AuthBackground: React.FC<Props> = ({ children }) => {
  return (
    <View style={styles.container}>
      {/* 1. Base Warm Ivory & Saffron Devotional Gradient */}
      <LinearGradient
        colors={['#FEFAF2', '#FBF5EB', '#F7EFE4', '#F4E7D7']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* 2. Devotional Artwork Layer: Ornate Temple Arch, Brass Bells & Sabarimala Pilgrim Slopes */}
      <Image
        source={AUTH_DEVOTIONAL_BG}
        style={styles.bgImage}
        resizeMode="cover"
      />

      {/* 3. Subtle Warm Ambient Vignette for Optimum Card Contrast */}
      <View style={styles.overlay} />

      {/* 4. Real Interactive React Native Children */}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#FAF5EB',
    position: 'relative',
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.98,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 252, 246, 0.12)',
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
});
