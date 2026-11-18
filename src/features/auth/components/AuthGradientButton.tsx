import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

// Pure Native Vector Send Plane icon (zero third-party dependencies)
const SendPaperPlaneIcon = () => (
  <View style={styles.planeIconContainer}>
    <Text style={styles.planeGlyph}>➤</Text>
  </View>
);

export const AuthGradientButton: React.FC<Props> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon = <SendPaperPlaneIcon />,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      disabled={disabled || loading}
      onPress={onPress}
      style={styles.touchable}
    >
      <LinearGradient
        colors={['#FF7500', '#F25211', '#D8410E', '#BF360C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <View style={styles.contentRow}>
            {icon && <View style={styles.iconBox}>{icon}</View>}
            <Text style={styles.text}>{title}</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    width: '100%',
    borderRadius: 16,
    elevation: 6,
    shadowColor: '#D84315',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    marginTop: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  gradient: {
    height: 54,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.4)',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    marginRight: 9,
  },
  planeIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  planeGlyph: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    transform: [{ rotate: '-25deg' }],
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
