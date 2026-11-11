import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

interface Props {
  children: React.ReactNode;
}

/**
 * PURE FLAWLESS DEVOTIONAL BACKGROUND
 * Uses the clean bottom section of the authentic master_bg.jpg texture,
 * completely bypassing the top text area so that 'English'/'Telugu' from the screenshot
 * NEVER appears underneath any screen or list row.
 */
export const DevotionalBackground: React.FC<Props> = ({ children }) => {
  return (
    <View style={styles.container}>
      <View style={styles.imageClipper}>
        <Image
          source={require('../../assets/images/master_bg.jpg')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5A623',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  imageClipper: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  backgroundImage: {
    width: '100%',
    height: '135%', // Enlarged vertically
    top: '-32%',    // Shifts the image UP by 32%, completely eliminating the top text area where 'English'/'Telugu' were printed!
  },
  content: {
    flex: 1,
  },
});
