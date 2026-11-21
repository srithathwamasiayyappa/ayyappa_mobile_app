import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  activeTab: 'login' | 'register';
  onTabChange: (tab: 'login' | 'register') => void;
  loginLabel?: string;
  registerLabel?: string;
}

// Crisp Chat Bubble with 3 dots (Pure Native React Native Vector)
const ChatIcon = ({ color }: { color: string }) => (
  <View style={styles.chatIconWrapper}>
    <View style={[styles.chatBubble, { borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={[styles.dot, { backgroundColor: color }]} />
    </View>
    <View style={[styles.chatTail, { borderTopColor: color }]} />
  </View>
);

// Crisp Person with Plus icon (Pure Native React Native Vector)
const UserPlusIcon = ({ color }: { color: string }) => (
  <View style={styles.userIconWrapper}>
    {/* Head */}
    <View style={[styles.userHead, { borderColor: color }]} />
    {/* Body */}
    <View style={[styles.userBody, { borderColor: color }]} />
    {/* Plus */}
    <View style={styles.plusContainer}>
      <View style={[styles.plusHorizontal, { backgroundColor: color }]} />
      <View style={[styles.plusVertical, { backgroundColor: color }]} />
    </View>
  </View>
);

export const AuthSegmentedTabs: React.FC<Props> = ({
  activeTab,
  onTabChange,
  loginLabel = 'Login',
  registerLabel = 'Register',
}) => {
  return (
    <View style={styles.container}>
      {/* 1. Login with OTP Tab */}
      {activeTab === 'login' ? (
        <LinearGradient
          colors={['#FF7500', '#F25211', '#D8410E', '#BF360C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.activeTabGradient}
        >
          <View style={styles.tabContentRow}>
            <ChatIcon color="#FFFFFF" />
            <Text style={styles.activeTabText}>{loginLabel}</Text>
          </View>
        </LinearGradient>
      ) : (
        <TouchableOpacity
          style={styles.inactiveTab}
          activeOpacity={0.75}
          onPress={() => onTabChange('login')}
        >
          <View style={styles.tabContentRow}>
            <ChatIcon color="#0C251E" />
            <Text style={styles.inactiveTabText}>{loginLabel}</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* 2. Register with OTP Tab */}
      {activeTab === 'register' ? (
        <LinearGradient
          colors={['#FF7500', '#F25211', '#D8410E', '#BF360C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.activeTabGradient}
        >
          <View style={styles.tabContentRow}>
            <UserPlusIcon color="#FFFFFF" />
            <Text style={styles.activeTabText}>{registerLabel}</Text>
          </View>
        </LinearGradient>
      ) : (
        <TouchableOpacity
          style={styles.inactiveTab}
          activeOpacity={0.75}
          onPress={() => onTabChange('register')}
        >
          <View style={styles.tabContentRow}>
            <UserPlusIcon color="#0C251E" />
            <Text style={styles.inactiveTabText}>{registerLabel}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F5ECE1',
    borderRadius: 28,
    padding: 4,
    height: 52,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EAD9C6',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeTabGradient: {
    flex: 1,
    height: '100%',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFA726',
    elevation: 4,
    shadowColor: '#D84315',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  inactiveTab: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: 'transparent',
  },
  tabContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginLeft: 7,
  },
  inactiveTabText: {
    color: '#0C251E',
    fontSize: 14.5,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginLeft: 7,
  },
  chatIconWrapper: {
    width: 18,
    height: 16,
    position: 'relative',
  },
  chatBubble: {
    width: 17,
    height: 13,
    borderRadius: 5,
    borderWidth: 1.6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    marginHorizontal: 1,
  },
  chatTail: {
    position: 'absolute',
    bottom: 0,
    left: 3,
    width: 0,
    height: 0,
    borderTopWidth: 3.5,
    borderRightWidth: 3.5,
    borderRightColor: 'transparent',
  },
  userIconWrapper: {
    width: 18,
    height: 16,
    position: 'relative',
    alignItems: 'flex-start',
  },
  userHead: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 1.6,
    marginLeft: 2,
  },
  userBody: {
    width: 11,
    height: 5.5,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderWidth: 1.6,
    borderBottomWidth: 0,
    marginTop: 1,
  },
  plusContainer: {
    position: 'absolute',
    right: 0,
    top: 4,
    width: 6,
    height: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusHorizontal: {
    width: 6,
    height: 1.6,
    borderRadius: 0.8,
  },
  plusVertical: {
    width: 1.6,
    height: 6,
    borderRadius: 0.8,
    position: 'absolute',
  },
});
