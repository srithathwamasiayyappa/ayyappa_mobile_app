import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  activeTab: 'login' | 'register';
  onTabChange: (tab: 'login' | 'register') => void;
  loginLabel?: string;
  registerLabel?: string;
}

export const AuthSegmentedTabs: React.FC<Props> = ({
  activeTab,
  onTabChange,
  loginLabel = 'Login with OTP',
  registerLabel = 'Register with OTP',
}) => {
  return (
    <View style={styles.container}>
      {/* 1. Login Tab */}
      {activeTab === 'login' ? (
        <LinearGradient
          colors={['#E65100', '#D84315', '#BF360C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.activeTabGradient}
        >
          <Text style={styles.activeTabText}>{loginLabel}</Text>
        </LinearGradient>
      ) : (
        <TouchableOpacity
          style={styles.inactiveTab}
          activeOpacity={0.75}
          onPress={() => onTabChange('login')}
        >
          <Text style={styles.inactiveTabText}>{loginLabel}</Text>
        </TouchableOpacity>
      )}

      {/* 2. Register Tab */}
      {activeTab === 'register' ? (
        <LinearGradient
          colors={['#E65100', '#D84315', '#BF360C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.activeTabGradient}
        >
          <Text style={styles.activeTabText}>{registerLabel}</Text>
        </LinearGradient>
      ) : (
        <TouchableOpacity
          style={styles.inactiveTab}
          activeOpacity={0.75}
          onPress={() => onTabChange('register')}
        >
          <Text style={styles.inactiveTabText}>{registerLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F7EFE4',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EFE0CD',
  },
  activeTabGradient: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFB300',
    elevation: 4,
    shadowColor: '#D84315',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  inactiveTab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveTabText: {
    color: '#4E1B0B',
    fontSize: 14.5,
    fontWeight: '700',
  },
});

