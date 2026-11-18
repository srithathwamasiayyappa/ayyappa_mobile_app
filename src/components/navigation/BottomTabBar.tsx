import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { MainTab, SupportedLanguage } from '../../types';
import { apiService } from '../../services/api';

interface Props {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  language?: SupportedLanguage;
}

interface TabItem {
  key: MainTab;
  label: string;
  icon: string;
  order: number;
}

const DEFAULT_TABS: Record<string, TabItem[]> = {
  en: [
    { key: 'home', label: 'Home', icon: 'home', order: 1 },
    { key: 'services', label: 'Services', icon: 'services', order: 2 },
    { key: 'temples', label: 'Temples', icon: 'temples', order: 3 },
    { key: 'panchangam', label: 'Panchangam', icon: 'panchangam', order: 4 },
    { key: 'profile', label: 'Profile', icon: 'profile', order: 5 },
  ],
  te: [
    { key: 'home', label: 'Home', icon: 'home', order: 1 },
    { key: 'services', label: 'Services', icon: 'services', order: 2 },
    { key: 'temples', label: 'Temples', icon: 'temples', order: 3 },
    { key: 'panchangam', label: 'Panchangam', icon: 'panchangam', order: 4 },
    { key: 'profile', label: 'Profile', icon: 'profile', order: 5 },
  ],
  kn: [
    { key: 'home', label: 'Home', icon: 'home', order: 1 },
    { key: 'services', label: 'Services', icon: 'services', order: 2 },
    { key: 'temples', label: 'Temples', icon: 'temples', order: 3 },
    { key: 'panchangam', label: 'Panchangam', icon: 'panchangam', order: 4 },
    { key: 'profile', label: 'Profile', icon: 'profile', order: 5 },
  ],
  ta: [
    { key: 'home', label: 'Home', icon: 'home', order: 1 },
    { key: 'services', label: 'Services', icon: 'services', order: 2 },
    { key: 'temples', label: 'Temples', icon: 'temples', order: 3 },
    { key: 'panchangam', label: 'Panchangam', icon: 'panchangam', order: 4 },
    { key: 'profile', label: 'Profile', icon: 'profile', order: 5 },
  ],
  hi: [
    { key: 'home', label: 'Home', icon: 'home', order: 1 },
    { key: 'services', label: 'Services', icon: 'services', order: 2 },
    { key: 'temples', label: 'Temples', icon: 'temples', order: 3 },
    { key: 'panchangam', label: 'Panchangam', icon: 'panchangam', order: 4 },
    { key: 'profile', label: 'Profile', icon: 'profile', order: 5 },
  ],
  ml: [
    { key: 'home', label: 'Home', icon: 'home', order: 1 },
    { key: 'services', label: 'Services', icon: 'services', order: 2 },
    { key: 'temples', label: 'Temples', icon: 'temples', order: 3 },
    { key: 'panchangam', label: 'Panchangam', icon: 'panchangam', order: 4 },
    { key: 'profile', label: 'Profile', icon: 'profile', order: 5 },
  ],
};

// 1. Home Tab Icon (Solid gold house when active)
const HomeTabIcon = ({ color, filled }: { color: string; filled?: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 10.5 L12 3 L21 10.5 V20 C21 20.6 20.6 21 20 21 H15 V15 H9 V21 H4 C3.4 21 3 20.6 3 20 V10.5 Z"
      stroke={color}
      strokeWidth={filled ? '1.5' : '1.8'}
      fill={filled ? color : 'none'}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </Svg>
);

// 2. Services Tab Icon (4 rounded squares in 2x2 grid)
const ServicesTabIcon = ({ color, filled }: { color: string; filled?: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Rect x="3.5" y="3.5" width="6.5" height="6.5" rx="2" stroke={color} strokeWidth="1.8" fill={filled ? color : 'none'} />
    <Rect x="14" y="3.5" width="6.5" height="6.5" rx="2" stroke={color} strokeWidth="1.8" fill={filled ? color : 'none'} />
    <Rect x="3.5" y="14" width="6.5" height="6.5" rx="2" stroke={color} strokeWidth="1.8" fill={filled ? color : 'none'} />
    <Rect x="14" y="14" width="6.5" height="6.5" rx="2" stroke={color} strokeWidth="1.8" fill={filled ? color : 'none'} />
  </Svg>
);

// 3. Temples Tab Icon (Indian Temple Gopuram with tiered spire & Sanctum door)
const TemplesTabIcon = ({ color, filled }: { color: string; filled?: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2 V4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Circle cx="12" cy="4.5" r="1" fill={color} />
    <Path d="M10 6.5 L12 4.5 L14 6.5" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
    <Path d="M9 8 H15" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <Path d="M9 8 L8 12 H16 L15 8" stroke={color} strokeWidth="1.6" strokeLinejoin="round" fill={filled ? 'rgba(255,213,79,0.2)' : 'none'} />
    <Path d="M7 12 H17" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <Path d="M7 12 L6 20 H18 L17 12" stroke={color} strokeWidth="1.6" strokeLinejoin="round" fill={filled ? 'rgba(255,213,79,0.2)' : 'none'} />
    <Path d="M10.5 20 V16.5 C10.5 15.7 11.2 15 12 15 C12.8 15 13.5 15.7 13.5 16.5 V20" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <Path d="M4.5 20 H19.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

// 4. Panchangam Tab Icon (Vedic calendar with binding loops and checkmark)
const PanchangamTabIcon = ({ color, filled }: { color: string; filled?: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M7 2 V5 M17 2 V5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Rect x="4" y="4" width="16" height="17" rx="3" stroke={color} strokeWidth="1.8" fill={filled ? 'rgba(255,213,79,0.15)' : 'none'} />
    <Path d="M4 9 H20" stroke={color} strokeWidth="1.6" />
    <Path d="M8 14.5 L10.5 17 L16 12" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// 5. Profile Tab Icon (Devotee avatar silhouette)
const ProfileTabIcon = ({ color, filled }: { color: string; filled?: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="7.5" r="3.8" stroke={color} strokeWidth="1.8" fill={filled ? color : 'none'} />
    <Path d="M5 20 C5 16.5 8.1 14.2 12 14.2 C15.9 14.2 19 16.5 19 20" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill={filled ? 'rgba(255,213,79,0.2)' : 'none'} />
  </Svg>
);

export const BottomTabBar: React.FC<Props> = ({
  activeTab,
  onTabChange,
  language = 'en',
}) => {
  const [tabs, setTabs] = useState<TabItem[]>(DEFAULT_TABS[language] || DEFAULT_TABS.en);

  // Dynamic fetch of bottom tabs from API
  useEffect(() => {
    let isMounted = true;
    const initialTabs = DEFAULT_TABS[language] || DEFAULT_TABS.en;
    setTabs(initialTabs);

    apiService.getBottomTabs(language)
      .then((fetchedTabs: TabItem[]) => {
        if (isMounted && Array.isArray(fetchedTabs) && fetchedTabs.length > 0) {
          setTabs(fetchedTabs);
        }
      })
      .catch(() => {
        // Keep initial tabs
      });

    return () => {
      isMounted = false;
    };
  }, [language]);

  const renderIcon = (key: string, color: string, isActive: boolean) => {
    switch (key) {
      case 'home':
        return <HomeTabIcon color={color} filled={isActive} />;
      case 'services':
      case 'categories':
        return <ServicesTabIcon color={color} filled={isActive} />;
      case 'temples':
        return <TemplesTabIcon color={color} filled={isActive} />;
      case 'panchangam':
        return <PanchangamTabIcon color={color} filled={isActive} />;
      case 'profile':
        return <ProfileTabIcon color={color} filled={isActive} />;
      default:
        return <HomeTabIcon color={color} filled={isActive} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.barWrapper}>
        <LinearGradient
          colors={['#0E3326', '#09251D', '#051A14']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.barContainer}
        >
          {tabs.map((tab) => {
            const isActive =
              activeTab === tab.key ||
              (activeTab === 'categories' && tab.key === 'services') ||
              (activeTab === 'services' && tab.key === 'categories');

            const iconColor = isActive ? '#FFD54F' : '#C8B698';
            const textColor = isActive ? '#FFD54F' : '#C8B698';

            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => onTabChange(tab.key)}
                activeOpacity={0.75}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={tab.label}
              >
                <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
                  {renderIcon(tab.icon || tab.key, iconColor, isActive)}
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    { color: textColor },
                    isActive && styles.tabLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    backgroundColor: '#051A14',
  },
  barWrapper: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
    borderTopWidth: 1.5,
    borderTopColor: '#C49B45',
    backgroundColor: '#09251D',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  barContainer: {
    flexDirection: 'row',
    height: 64,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderRadius: 14,
    marginHorizontal: 2,
    minHeight: 48,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(230, 186, 71, 0.16)',
    borderWidth: 1.3,
    borderColor: '#E6BA47',
  },
  iconWrapper: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperActive: {
    transform: [{ scale: 1.05 }],
  },
  tabLabel: {
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.2,
    fontFamily: Platform.select({ ios: 'Poppins-Medium', android: 'Poppins-Medium', default: 'System' }),
  },
  tabLabelActive: {
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'Poppins-SemiBold', android: 'Poppins-SemiBold', default: 'System' }),
  },
});
