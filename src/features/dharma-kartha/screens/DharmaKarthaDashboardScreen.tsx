import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { ApiService } from '../../../services/api';
import {
  DharmaKarthaDashboardStats,
  DharmaKarthaProfile,
  DharmaKarthaTemple,
  SupportedLanguage,
} from '../../../types';
import { RegisterMandirScreen } from './RegisterMandirScreen';
import { QuickEditModal, QuickEditSection } from '../components/QuickEditModal';

interface Props {
  currentLanguage: SupportedLanguage;
  currentUser?: any;
  onOpenEditProfile: () => void;
  onOpenNotifications: () => void;
  onOpenTerms: () => void;
  onOpenPrivacyPolicy: () => void;
  onOpenAbout: () => void;
  onLogout: () => void;
  onSwitchToDevotee?: () => void;
  onSelectTempleDetail?: (temple: any) => void;
}

const DEFAULT_AVATAR = require('../../../../assets/role_selection/role_dharma_kartha.jpg');
const TEMPLE_ICON = require('../../../../assets/deities/saranam_deity_emblem.png');

export const DharmaKarthaDashboardScreen: React.FC<Props> = ({
  currentLanguage,
  currentUser,
  onOpenEditProfile,
  onOpenNotifications,
  onOpenTerms,
  onOpenPrivacyPolicy,
  onOpenAbout,
  onLogout,
  onSwitchToDevotee,
  onSelectTempleDetail,
}) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<DharmaKarthaProfile | null>(null);
  const [stats, setStats] = useState<DharmaKarthaDashboardStats>({
    managedTemples: 0,
    pendingUpdates: 0,
    activeFestivals: 0,
  });
  const [temples, setTemples] = useState<DharmaKarthaTemple[]>([]);
  const [selectedTemple, setSelectedTemple] = useState<DharmaKarthaTemple | null>(null);

  // Active view: 'dashboard' | 'register_mandir'
  const [currentView, setCurrentView] = useState<'dashboard' | 'register_mandir'>('dashboard');

  // Quick edit modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [activeEditSection, setActiveEditSection] = useState<QuickEditSection | null>(null);

  const userId = currentUser?.id ? Number(currentUser.id) : 1;

  // Load all Dharma Kartha dynamic data from DB
  const loadDashboardData = useCallback(async () => {
    try {
      const [statsData, profileData, templesData] = await Promise.all([
        ApiService.getDharmaKarthaStats(userId).catch(() => ({
          managedTemples: 0,
          pendingUpdates: 0,
          activeFestivals: 0,
        })),
        ApiService.getDharmaKarthaProfile(userId).catch(() => null),
        ApiService.getDharmaKarthaTemples(userId).catch(() => []),
      ]);

      setStats(statsData);
      setProfile(profileData);
      setTemples(templesData);
      if (templesData.length > 0 && !selectedTemple) {
        setSelectedTemple(templesData[0]);
      }
    } catch (err) {
      console.warn('Error loading Dharma Kartha data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, selectedTemple]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleOpenQuickEdit = (section: QuickEditSection) => {
    if (temples.length === 0) {
      Alert.alert(
        'No Mandir Registered',
        'Please register or request management access to a temple before editing details.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Register Mandir', onPress: () => setCurrentView('register_mandir') },
        ]
      );
      return;
    }
    setActiveEditSection(section);
    setEditModalVisible(true);
  };

  if (currentView === 'register_mandir') {
    return (
      <RegisterMandirScreen
        userId={userId}
        onBack={() => setCurrentView('dashboard')}
        onSuccess={() => {
          setCurrentView('dashboard');
          loadDashboardData();
        }}
      />
    );
  }

  const rawName = profile?.fullName || currentUser?.fullName || currentUser?.name;
  const displayName = (rawName && !rawName.startsWith('Devotee #')) ? rawName : 'Vinod Kumar';
  const displayLocation = `${profile?.city || 'Hyderabad'}, India • Lord Ayyappa`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#DFA62E']} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Profile Card matching web design */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarContainer}>
            <Image
              source={profile?.avatarUrl && !profile.avatarUrl.includes('base64') ? { uri: profile.avatarUrl } : DEFAULT_AVATAR}
              style={styles.avatarImg}
            />
            <View style={styles.avatarGlow} />
          </View>

          {/* Golden DHARMA KARTHA Badge */}
          <View style={styles.roleBadgeContainer}>
            <LinearGradient
              colors={['#FFF6E0', '#FFE6B0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.roleBadge}
            >
              <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                <Path d="M12 2 L14 6 H10 Z" fill="#B37812" />
                <Path d="M8 6 H16 L18 10 H6 Z" fill="#B37812" />
                <Path d="M5 10 H19 L21 14 H3 Z" fill="#B37812" />
                <Path d="M4 14 H20 V21 H4 Z" stroke="#B37812" strokeWidth={1.5} />
              </Svg>
              <Text style={styles.roleBadgeText}>DHARMA KARTHA</Text>
            </LinearGradient>
          </View>

          <Text style={styles.profileName}>{displayName}</Text>
          <Text style={styles.profileLocation}>{displayLocation}</Text>

          {onSwitchToDevotee && (
            <TouchableOpacity style={styles.switchRoleBtn} onPress={onSwitchToDevotee}>
              <Text style={styles.switchRoleBtnText}>Switch to Devotee View ⇄</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 🪷 Manage Your Temples Banner */}
        <View style={styles.sectionHeaderBanner}>
          <Text style={styles.bannerEmoji}>🪷</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Manage Your Temples</Text>
            <Text style={styles.bannerSubtitle}>Update your temple information, timings, festivals and other details dynamically.</Text>
          </View>
        </View>

        {/* 3 Metric Stat Cards */}
        <View style={styles.statsRow}>
          {/* Card 1: Managed Temples */}
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#F1F7F4' }]}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M12 2 L14 6 H10 Z" fill="#2E7561" />
                <Path d="M8 6 H16 L18 10 H6 Z" fill="#2E7561" />
                <Path d="M5 10 H19 L21 14 H3 Z" fill="#2E7561" />
                <Path d="M4 14 H20 V21 H4 Z" stroke="#2E7561" strokeWidth={1.5} />
              </Svg>
            </View>
            <Text style={styles.statLabel}>Managed Temples</Text>
            <Text style={styles.statValue}>{stats.managedTemples}</Text>
          </View>

          {/* Card 2: Pending Updates */}
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#FFF8E7' }]}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="12" r="9" stroke="#DFA62E" strokeWidth={2} />
                <Path d="M12 7 V12 L15 14" stroke="#DFA62E" strokeWidth={2} strokeLinecap="round" />
              </Svg>
            </View>
            <Text style={styles.statLabel}>Pending Updates</Text>
            <Text style={styles.statValue}>{stats.pendingUpdates}</Text>
          </View>

          {/* Card 3: Active Festivals */}
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#F0F9F5' }]}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Rect x="3" y="4" width="18" height="17" rx="3" stroke="#2E7561" strokeWidth={2} />
                <Path d="M8 2 V6M16 2 V6M3 9 H21" stroke="#2E7561" strokeWidth={2} strokeLinecap="round" />
              </Svg>
            </View>
            <Text style={styles.statLabel}>Active Festivals</Text>
            <Text style={styles.statValue}>{stats.activeFestivals}</Text>
          </View>
        </View>

        {/* Managed Temples Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitleText}>Managed Temples</Text>
            <TouchableOpacity
              style={styles.addTempleBtn}
              onPress={() => setCurrentView('register_mandir')}
            >
              <Text style={styles.addTempleBtnText}>+ Add New Temple</Text>
            </TouchableOpacity>
          </View>

          {/* If temples exist, display list cards */}
          {temples.length > 0 ? (
            <View style={styles.templesList}>
              {temples.map((temple) => {
                const isSelected = selectedTemple?.id === temple.id;
                return (
                  <TouchableOpacity
                    key={temple.id}
                    style={[styles.templeCard, isSelected && styles.templeCardSelected]}
                    activeOpacity={0.88}
                    onPress={() => setSelectedTemple(temple)}
                  >
                    <View style={styles.templeCardTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.templeCardName} numberOfLines={1}>
                          {temple.name}
                        </Text>
                        <Text style={styles.templeCardDeity}>
                          {temple.primaryDeity} • {temple.city}, {temple.state}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          temple.status === 'PUBLISHED'
                            ? styles.statusPublished
                            : temple.status === 'REJECTED'
                            ? styles.statusRejected
                            : styles.statusPending,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            temple.status === 'PUBLISHED'
                              ? styles.statusPublishedText
                              : temple.status === 'REJECTED'
                              ? styles.statusRejectedText
                              : styles.statusPendingText,
                          ]}
                        >
                          {temple.status === 'PENDING_APPROVAL' ? 'PENDING APPROVAL' : temple.status}
                        </Text>
                      </View>
                    </View>

                    {temple.shortDescription ? (
                      <Text style={styles.templeCardSummary} numberOfLines={2}>
                        {temple.shortDescription}
                      </Text>
                    ) : null}

                    <View style={styles.templeCardActions}>
                      <TouchableOpacity
                        style={styles.cardActionBtn}
                        onPress={() => {
                          setSelectedTemple(temple);
                          handleOpenQuickEdit('about');
                        }}
                      >
                        <Text style={styles.cardActionBtnText}>Edit Info</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cardActionBtn}
                        onPress={() => {
                          setSelectedTemple(temple);
                          handleOpenQuickEdit('timings');
                        }}
                      >
                        <Text style={styles.cardActionBtnText}>Timings</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cardActionBtn}
                        onPress={() => {
                          setSelectedTemple(temple);
                          handleOpenQuickEdit('festivals');
                        }}
                      >
                        <Text style={styles.cardActionBtnText}>Festivals</Text>
                      </TouchableOpacity>
                      {onSelectTempleDetail && (
                        <TouchableOpacity
                          style={[styles.cardActionBtn, styles.cardActionBtnPrimary]}
                          onPress={() => onSelectTempleDetail(temple)}
                        >
                          <Text style={styles.cardActionBtnPrimaryText}>View</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            /* Empty State matching image 2 */
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 2 L14 6 H10 Z" fill="#DFA62E" />
                  <Path d="M8 6 H16 L18 10 H6 Z" fill="#DFA62E" />
                  <Path d="M5 10 H19 L21 14 H3 Z" fill="#DFA62E" />
                  <Path d="M4 14 H20 V21 H4 Z" stroke="#DFA62E" strokeWidth={1.5} />
                  <Path d="M9 16 H15 V21 H9 Z" fill="#0C251E" />
                </Svg>
              </View>
              <Text style={styles.emptyTitle}>No Temples Assigned Yet</Text>
              <Text style={styles.emptyDesc}>
                Register a new temple or request management access to an existing holy shrine.
              </Text>
              <TouchableOpacity
                style={styles.registerCtaBtn}
                activeOpacity={0.88}
                onPress={() => setCurrentView('register_mandir')}
              >
                <LinearGradient
                  colors={['#E5B24B', '#CAA049', '#B08027']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.registerCtaBtnGradient}
                >
                  <Text style={styles.registerCtaBtnIcon}>⊕</Text>
                  <Text style={styles.registerCtaBtnText}>Register Your Temple</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ✨ Quick Management Section matching Image 1 */}
        <View style={styles.sectionContainer}>
          <View style={styles.quickMgmtHeader}>
            <Text style={styles.sparkleIcon}>✨</Text>
            <Text style={styles.sectionTitleText}>Quick Management</Text>
          </View>

          {/* 6 Quick Action Cards */}
          <View style={styles.quickCardsList}>
            {/* 1. About / History */}
            <View style={styles.quickCard}>
              <View style={styles.quickCardIconBox}>
                <Text style={styles.quickCardIcon}>🏛</Text>
              </View>
              <View style={styles.quickCardTextBox}>
                <Text style={styles.quickCardTitle}>About / History</Text>
                <Text style={styles.quickCardDesc}>
                  Update temple name, history, deities, description and other details.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => handleOpenQuickEdit('about')}
              >
                <Text style={styles.editBtnIcon}>✎</Text>
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>

            {/* 2. Speciality */}
            <View style={styles.quickCard}>
              <View style={styles.quickCardIconBox}>
                <Text style={styles.quickCardIcon}>✨</Text>
              </View>
              <View style={styles.quickCardTextBox}>
                <Text style={styles.quickCardTitle}>Speciality</Text>
                <Text style={styles.quickCardDesc}>
                  Add or update temple specialities and significance.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => handleOpenQuickEdit('speciality')}
              >
                <Text style={styles.editBtnIcon}>✎</Text>
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>

            {/* 3. Time & Aarti */}
            <View style={styles.quickCard}>
              <View style={styles.quickCardIconBox}>
                <Text style={styles.quickCardIcon}>⏱</Text>
              </View>
              <View style={styles.quickCardTextBox}>
                <Text style={styles.quickCardTitle}>Time & Aarti</Text>
                <Text style={styles.quickCardDesc}>
                  Manage daily darshan, pooja and seva timings.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => handleOpenQuickEdit('timings')}
              >
                <Text style={styles.editBtnIcon}>✎</Text>
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>

            {/* 4. Media */}
            <View style={styles.quickCard}>
              <View style={styles.quickCardIconBox}>
                <Text style={styles.quickCardIcon}>🖼</Text>
              </View>
              <View style={styles.quickCardTextBox}>
                <Text style={styles.quickCardTitle}>Media</Text>
                <Text style={styles.quickCardDesc}>
                  Upload and manage sanctum photos, gallery images and hero banner.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => handleOpenQuickEdit('media')}
              >
                <Text style={styles.editBtnIcon}>✎</Text>
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>

            {/* 5. Festivals */}
            <View style={styles.quickCard}>
              <View style={styles.quickCardIconBox}>
                <Text style={styles.quickCardIcon}>📅</Text>
              </View>
              <View style={styles.quickCardTextBox}>
                <Text style={styles.quickCardTitle}>Festivals</Text>
                <Text style={styles.quickCardDesc}>
                  Manage upcoming festivals, special occasions and event details.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => handleOpenQuickEdit('festivals')}
              >
                <Text style={styles.editBtnIcon}>✎</Text>
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>

            {/* 6. Contact */}
            <View style={styles.quickCard}>
              <View style={styles.quickCardIconBox}>
                <Text style={styles.quickCardIcon}>📞</Text>
              </View>
              <View style={styles.quickCardTextBox}>
                <Text style={styles.quickCardTitle}>Contact</Text>
                <Text style={styles.quickCardDesc}>
                  Manage contact numbers, email and temple office details.
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.editBtn, styles.editBtnActiveForest]}
                onPress={() => handleOpenQuickEdit('contact')}
              >
                <Text style={[styles.editBtnIcon, { color: '#FFFDF8' }]}>✎</Text>
                <Text style={[styles.editBtnText, { color: '#FFFDF8' }]}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Sidebar Menu Navigation Items matching Web Image 1 */}
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} onPress={onOpenEditProfile}>
            <Text style={styles.menuIcon}>👤</Text>
            <Text style={styles.menuLabel}>Edit Profile</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => setCurrentView('register_mandir')}>
            <Text style={styles.menuIcon}>🛕</Text>
            <Text style={styles.menuLabel}>Add / Manage Mandir</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={onOpenNotifications}>
            <Text style={styles.menuIcon}>🔔</Text>
            <Text style={styles.menuLabel}>Notifications</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={onOpenTerms}>
            <Text style={styles.menuIcon}>📄</Text>
            <Text style={styles.menuLabel}>Terms & Conditions</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={onOpenPrivacyPolicy}>
            <Text style={styles.menuIcon}>🔒</Text>
            <Text style={styles.menuLabel}>Privacy Policy</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={onOpenAbout}>
            <Text style={styles.menuIcon}>ℹ️</Text>
            <Text style={styles.menuLabel}>About</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={onLogout}>
            <Text style={styles.menuIcon}>🚪</Text>
            <Text style={[styles.menuLabel, { color: '#B3261E' }]}>Logout</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Quick Edit Modal */}
      <QuickEditModal
        visible={editModalVisible}
        section={activeEditSection}
        temple={selectedTemple}
        temples={temples}
        userId={userId}
        onClose={() => setEditModalVisible(false)}
        onUpdated={() => {
          loadDashboardData();
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F6F0',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  profileHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EAE4D5',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
      android: { elevation: 2 },
    }),
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatarImg: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2.5,
    borderColor: '#DFA62E',
  },
  avatarGlow: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 42,
    borderWidth: 1,
    borderColor: 'rgba(223, 166, 46, 0.4)',
  },
  roleBadgeContainer: {
    marginBottom: 6,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DFA62E',
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B37812',
    letterSpacing: 0.6,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0C251E',
    marginBottom: 3,
  },
  profileLocation: {
    fontSize: 13,
    color: '#65776F',
    fontWeight: '500',
  },
  switchRoleBtn: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: '#F3EFE6',
    borderRadius: 12,
  },
  switchRoleBtnText: {
    fontSize: 12,
    color: '#0C251E',
    fontWeight: '600',
  },
  sectionHeaderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  bannerEmoji: {
    fontSize: 24,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0C251E',
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#65776F',
    lineHeight: 16,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EAE4D5',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 },
      android: { elevation: 1 },
    }),
  },
  statIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#55665D',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 14,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0C251E',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0C251E',
  },
  addTempleBtn: {
    backgroundColor: '#0C251E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  addTempleBtnText: {
    color: '#FFFDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  templesList: {
    gap: 12,
  },
  templeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.2,
    borderColor: '#EAE4D5',
  },
  templeCardSelected: {
    borderColor: '#DFA62E',
    backgroundColor: '#FFFDF8',
  },
  templeCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  templeCardName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0C251E',
  },
  templeCardDeity: {
    fontSize: 12,
    color: '#65776F',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPublished: {
    backgroundColor: '#E7F5EE',
  },
  statusPublishedText: {
    color: '#1F6B4E',
    fontSize: 10,
    fontWeight: '700',
  },
  statusPending: {
    backgroundColor: '#FFF4DE',
    borderColor: '#FEE5B5',
    borderWidth: 1,
  },
  statusPendingText: {
    color: '#B57D18',
    fontSize: 10,
    fontWeight: '700',
  },
  statusRejected: {
    backgroundColor: '#FDE8E8',
    borderColor: '#F8B4B4',
    borderWidth: 1,
  },
  statusRejectedText: {
    color: '#9B1C1C',
    fontSize: 10,
    fontWeight: '700',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  templeCardSummary: {
    fontSize: 12,
    color: '#4B5C54',
    lineHeight: 16,
    marginBottom: 10,
  },
  templeCardActions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0EBE1',
    paddingTop: 8,
  },
  cardActionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F3EFE6',
  },
  cardActionBtnText: {
    fontSize: 11,
    color: '#0C251E',
    fontWeight: '600',
  },
  cardActionBtnPrimary: {
    backgroundColor: '#0C251E',
    marginLeft: 'auto',
  },
  cardActionBtnPrimaryText: {
    color: '#FFFDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAE4D5',
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FAF7F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#E8DEC9',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0C251E',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 12,
    color: '#65776F',
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  registerCtaBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  registerCtaBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 11,
    gap: 8,
  },
  registerCtaBtnIcon: {
    fontSize: 16,
    color: '#0C251E',
    fontWeight: 'bold',
  },
  registerCtaBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0C251E',
  },
  quickMgmtHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  sparkleIcon: {
    fontSize: 16,
  },
  quickCardsList: {
    gap: 10,
  },
  quickCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAE4D5',
  },
  quickCardIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FAF7F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  quickCardIcon: {
    fontSize: 18,
  },
  quickCardTextBox: {
    flex: 1,
    marginRight: 8,
  },
  quickCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0C251E',
  },
  quickCardDesc: {
    fontSize: 11,
    color: '#65776F',
    lineHeight: 15,
    marginTop: 2,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4C9B4',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
    backgroundColor: '#FFFDF9',
  },
  editBtnActiveForest: {
    backgroundColor: '#0C251E',
    borderColor: '#0C251E',
  },
  editBtnIcon: {
    fontSize: 11,
    color: '#0C251E',
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0C251E',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#EAE4D5',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3EFE6',
  },
  menuIcon: {
    fontSize: 16,
    width: 26,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1A332B',
  },
  menuChevron: {
    fontSize: 18,
    color: '#9EAEA5',
  },
});
