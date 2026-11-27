import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

interface Props {
  size?: number;
}

/**
 * AUTHENTIC LORD AYYAPPA DEVOTIONAL LIST ICON
 * Uses the exact Lord Ayyappa deity idol image uploaded by the user,
 * framed in a circular medallion with golden border and subtle shadow.
 */
export const AyyappaMedallion: React.FC<Props> = ({ size = 38 }) => {
  return (
    <View style={[styles.outerFrame, { width: size, height: size, borderRadius: size / 2 }]}>
      <View style={[styles.innerFrame, { width: size - 3, height: size - 3, borderRadius: (size - 3) / 2 }]}>
        <Image
          source={require('../../assets/images/ayyappa_icon.jpg')}
          style={{
            width: size * 1.05,
            height: size * 1.05,
          }}
          resizeMode="cover"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerFrame: {
    backgroundColor: '#000000',
    borderWidth: 1.5,
    borderColor: '#FFB300', // Sacred golden outer border
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.35,
    shadowRadius: 2,
  },
  innerFrame: {
    backgroundColor: '#0C251E',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
