import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';

interface Props {
  count?: number;
}

const TITLE_WIDTHS = ['58%', '46%', '66%', '52%', '62%', '44%', '56%'];
const SUBTITLE_WIDTHS = ['84%', '72%', '90%', '78%', '86%', '68%', '80%'];

export const CategorySkeleton: React.FC<Props> = ({ count = 7 }) => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.95,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 850,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => {
      animation.stop();
    };
  }, [pulseAnim]);

  const items = Array.from({ length: count });

  return (
    <View style={styles.container}>
      {items.map((_, index) => {
        const titleWidth = TITLE_WIDTHS[index % TITLE_WIDTHS.length];
        const subtitleWidth = SUBTITLE_WIDTHS[index % SUBTITLE_WIDTHS.length];

        return (
          <View key={`cat-skeleton-${index}`} style={styles.card}>
            {/* Left: Animated Icon Block Skeleton */}
            <Animated.View style={[styles.iconSkeleton, { opacity: pulseAnim }]} />

            {/* Center: Title & Subtitle Line Skeletons */}
            <View style={styles.textContainer}>
              <Animated.View
                style={[
                  styles.titleLine,
                  { width: titleWidth as any, opacity: pulseAnim },
                ]}
              />
              <Animated.View
                style={[
                  styles.subtitleLine,
                  { width: subtitleWidth as any, opacity: pulseAnim },
                ]}
              />
            </View>

            {/* Right: Circular Chevron Placeholder */}
            <Animated.View style={[styles.chevronSkeleton, { opacity: pulseAnim }]} />
          </View>
        );
      })}
    </View>
  );
};

// Also export Listing item skeleton variant (thumbnail on left, title, desc, play button on right)
export const CategoryListingSkeleton: React.FC<Props> = ({ count = 6 }) => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.95,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 850,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => {
      animation.stop();
    };
  }, [pulseAnim]);

  const items = Array.from({ length: count });

  return (
    <View style={styles.container}>
      {items.map((_, index) => {
        const titleWidth = TITLE_WIDTHS[index % TITLE_WIDTHS.length];
        const subtitleWidth = SUBTITLE_WIDTHS[index % SUBTITLE_WIDTHS.length];

        return (
          <View key={`listing-skeleton-${index}`} style={styles.card}>
            {/* Left: Square Thumbnail Skeleton */}
            <Animated.View style={[styles.thumbnailSkeleton, { opacity: pulseAnim }]} />

            {/* Center: Title & Desc Lines */}
            <View style={styles.textContainer}>
              <Animated.View
                style={[
                  styles.titleLine,
                  { width: titleWidth as any, opacity: pulseAnim },
                ]}
              />
              <Animated.View
                style={[
                  styles.subtitleLine,
                  { width: subtitleWidth as any, opacity: pulseAnim },
                ]}
              />
            </View>

            {/* Right: Play Action Circle Placeholder */}
            <Animated.View style={[styles.playBtnSkeleton, { opacity: pulseAnim }]} />
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF9',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#EFE1C7',
    paddingVertical: 10,
    paddingHorizontal: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#C49B45',
        shadowOffset: { width: 0, height: 1.5 },
        shadowOpacity: 0.08,
        shadowRadius: 2.5,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },
  iconSkeleton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#E8DFC9',
  },
  thumbnailSkeleton: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#E8DFC9',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    justifyContent: 'center',
  },
  titleLine: {
    height: 15,
    borderRadius: 4,
    backgroundColor: '#DFD2B7',
    marginBottom: 7,
  },
  subtitleLine: {
    height: 11,
    borderRadius: 4,
    backgroundColor: '#EFE6D4',
  },
  chevronSkeleton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EFE6D4',
  },
  playBtnSkeleton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E8DFC9',
  },
});
