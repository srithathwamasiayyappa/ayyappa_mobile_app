import React from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import { useBranding } from '../../../services/brandingService';

interface Props {
  subWelcome?: string;
}

const AYYAPPA_EMBLEM = require('../../../assets/images/ayyappa_emblem_approved.png');

export const AuthBrandHeader: React.FC<Props> = (props) => {
  const { branding, getLogoSource, onLogoError } = useBranding();
  const subWelcome = props?.subWelcome || 'Sacred Devotion Portal • Mobile Verification';
  return (
    <View style={styles.container}>
      {/* 1. Circular Lord Ayyappa Golden Emblem */}
      <View style={styles.emblemContainer}>
        <Image
          source={getLogoSource(AYYAPPA_EMBLEM)}
          defaultSource={AYYAPPA_EMBLEM}
          onError={onLogoError}
          style={styles.emblemImage}
          resizeMode="contain"
        />
      </View>

      {/* 2. Saranam Ayyappa (Exact Capitalization & Deep Maroon Editorial Serif Typography) */}
      <Text style={styles.title}>{branding.title}</Text>

      {/* 3. Decorative Flanked Mantra: — 🪷 Swamiye Saranam Ayyappa — */}
      <View style={styles.mantraRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.lotusIcon}>🪷</Text>
        <Text style={styles.mantraText}>{branding.tagline || 'Swamiye Saranam Ayyappa'}</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* 4. Sacred Devotion Portal • Mobile Verification */}
      <Text style={styles.subText}>{subWelcome}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Platform.OS === 'ios' ? 14 : 8,
    marginBottom: 14,
    width: '100%',
  },
  emblemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emblemImage: {
    width: 84,
    height: 84,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#173D32',
    letterSpacing: 0.3,
    textAlign: 'center',
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
    marginBottom: 4,
  },
  mantraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  dividerLine: {
    width: 26,
    height: 1,
    backgroundColor: '#2E7561',
    opacity: 0.5,
  },
  lotusIcon: {
    fontSize: 13,
    marginHorizontal: 6,
  },
  mantraText: {
    fontSize: 14,
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#2E7561',
    letterSpacing: 0.3,
    fontFamily: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins_700Bold', web: 'Poppins, sans-serif', default: 'Poppins_700Bold' }),
  },
  subText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8C6D4F',
    letterSpacing: 0.4,
    textAlign: 'center',
    marginTop: 2,
  },
});
