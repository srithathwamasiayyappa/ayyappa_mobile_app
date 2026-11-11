import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  children: React.ReactNode;
}

/**
 * Authentic Devotional Sacred Background
 * Renders a pristine golden-amber devotional gradient with sacred warmth,
 * with ZERO ghost text, screenshot artifacts, or resolution stretching.
 */
export const DevotionalBackground: React.FC<Props> = ({ children }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F7A71E', '#FBB829', '#FFA000', '#F59E0B', '#E67E22']}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      {/* Sacred subtle warm overlay for optimal readability */}
      <View style={styles.overlay} />
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5A623',
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 248, 225, 0.08)',
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});
