import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface Props {
  subWelcome?: string;
}

export const AuthBrandHeader: React.FC<Props> = ({
  subWelcome = 'Sacred Devotee Portal • Mobile Verification',
}) => {
  return (
    <View style={styles.container}>
      {/* 1. Circular Lord Ayyappa Golden Emblem */}
      <View style={styles.emblemContainer}>
        <View style={styles.haloOuterRing}>
          <Image
            source={require('../../../assets/images/ayyappa_icon.jpg')}
            style={styles.emblemImage}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* 2. SARANAM AYYAPPA */}
      <Text style={styles.title}>SARANAM AYYAPPA</Text>

      {/* 3. Decorative Flanked Mantra: — Swamiye Saranam Ayyappa — */}
      <View style={styles.mantraRow}>
        <View style={styles.decorativeFlourishLeft}>
          <Text style={styles.flourishGlyph}>❖</Text>
          <View style={styles.flourishLine} />
        </View>
        <Text style={styles.mantraText}>Swamiye Saranam Ayyappa</Text>
        <View style={styles.decorativeFlourishRight}>
          <View style={styles.flourishLine} />
          <Text style={styles.flourishGlyph}>❖</Text>
        </View>
      </View>

      {/* 4. Sacred Devotee Portal • Mobile Verification */}
      <Text style={styles.subText}>{subWelcome}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 16,
    width: '100%',
  },
  emblemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  haloOuterRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: '#FFD54F',
    backgroundColor: '#3E0000',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#4E1B0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  emblemImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  title: {
    fontSize: 23,
    fontWeight: '900',
    color: '#4E1B0B',
    letterSpacing: 1.8,
    textAlign: 'center',
    fontFamily: 'serif',
  },
  mantraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },
  mantraText: {
    fontSize: 15,
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#3E1508',
    letterSpacing: 0.5,
    marginHorizontal: 8,
  },
  decorativeFlourishLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  decorativeFlourishRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flourishLine: {
    width: 24,
    height: 1,
    backgroundColor: '#8D4315',
  },
  flourishGlyph: {
    fontSize: 9,
    color: '#8D4315',
    marginHorizontal: 2,
  },
  subText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#5D2E14',
    letterSpacing: 0.3,
    marginTop: 4,
    textAlign: 'center',
  },
});

