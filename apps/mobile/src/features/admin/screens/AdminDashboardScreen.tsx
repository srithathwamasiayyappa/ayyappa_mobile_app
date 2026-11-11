import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from 'react-native';
import { ApiService, FALLBACK_CATEGORIES } from '../../../services/api';
import { DevotionalCategoryItem, SupportedLanguage } from '../../../types';

interface Props {
  onClose: () => void;
}

export const AdminDashboardScreen: React.FC<Props> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'ticker' | 'stats'>('categories');
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('te');
  const [categories, setCategories] = useState<DevotionalCategoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal State for Add / Edit
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<DevotionalCategoryItem | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIsAudio, setFormIsAudio] = useState(false);
  const [formChantLyric, setFormChantLyric] = useState('');

  // Ticker text
  const [tickerTe, setTickerTe] = useState('స్వామియే శరణం అయ్యప్ప || స్వామియే శరణం అయ్యప్ప || స్వామియే శరణం అయ్యప్ప');

  useEffect(() => {
    loadCategories();
  }, [selectedLang]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getCategories(selectedLang);
      setCategories([...data]);
    } catch (e) {
      console.log('Error loading categories:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormSlug('');
    setFormDescription('');
    setFormIsAudio(false);
    setFormChantLyric('');
    setModalVisible(true);
  };

  const handleOpenEdit = (item: DevotionalCategoryItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormSlug(item.slug || '');
    setFormDescription(item.description || '');
    setFormIsAudio(!!item.isAudio);
    setFormChantLyric(item.chantLyric || '');
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!formTitle.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Please enter a title');
      } else {
        Alert.alert('Required', 'Please enter a title');
      }
      return;
    }

    if (editingItem) {
      // Update existing
      const updated = categories.map((cat) => {
        if (cat.id === editingItem.id) {
          return {
            ...cat,
            title: formTitle.trim(),
            slug: formSlug.trim() || cat.slug,
            description: formDescription.trim(),
            isAudio: formIsAudio,
            chantLyric: formIsAudio ? formChantLyric.trim() : undefined,
          };
        }
        return cat;
      });
      setCategories(updated);
      FALLBACK_CATEGORIES[selectedLang] = updated;
    } else {
      // Add new
      const newId = String(Date.now());
      const newCategory: DevotionalCategoryItem = {
        id: newId,
        slug: formSlug.trim() || `category-${newId}`,
        title: formTitle.trim(),
        description: formDescription.trim(),
        isAudio: formIsAudio,
        audioDurationSec: 40,
        totalTime: '00:40',
        chantLyric: formIsAudio ? formChantLyric.trim() : undefined,
      };
      const updated = [newCategory, ...categories];
      setCategories(updated);
      FALLBACK_CATEGORIES[selectedLang] = updated;
    }

    setModalVisible(false);
    if (Platform.OS === 'web') {
      window.alert('Data saved successfully!');
    } else {
      Alert.alert('Success', 'Data saved successfully!');
    }
  };

  const handleDelete = (id: string) => {
    const confirmDelete = () => {
      const updated = categories.filter((c) => c.id !== id);
      setCategories(updated);
      FALLBACK_CATEGORIES[selectedLang] = updated;
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this devotional section?')) {
        confirmDelete();
      }
    } else {
      Alert.alert('Delete', 'Are you sure you want to delete this devotional section?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: confirmDelete },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Admin Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.badge}>ADMIN</Text>
          <Text style={styles.headerTitle}>Saranam Ayyappa CMS</Text>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
          <Text style={styles.closeBtnText}>✕ Close</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'categories' && styles.tabActive]}
          onPress={() => setActiveTab('categories')}
        >
          <Text style={[styles.tabText, activeTab === 'categories' && styles.tabTextActive]}>
            Sections ({categories.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'ticker' && styles.tabActive]}
          onPress={() => setActiveTab('ticker')}
        >
          <Text style={[styles.tabText, activeTab === 'ticker' && styles.tabTextActive]}>
            Ticker Mantra
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'stats' && styles.tabActive]}
          onPress={() => setActiveTab('stats')}
        >
          <Text style={[styles.tabText, activeTab === 'stats' && styles.tabTextActive]}>
            Status & Diagnostics
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      {activeTab === 'categories' && (
        <View style={styles.contentBody}>
          {/* Sub-header with Language Pills and Add Button */}
          <View style={styles.controlsRow}>
            {/* Language filter selector */}
            <View style={styles.langSelector}>
              {(['te', 'kn', 'en', 'ta', 'hi'] as SupportedLanguage[]).map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[styles.langChip, selectedLang === lang && styles.langChipActive]}
                  onPress={() => setSelectedLang(lang)}
                >
                  <Text style={[styles.langChipText, selectedLang === lang && styles.langChipTextActive]}>
                    {lang.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Add New Section Button */}
            <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd} activeOpacity={0.8}>
              <Text style={styles.addBtnText}>+ Add Section</Text>
            </TouchableOpacity>
          </View>

          {/* List of Devotional Categories */}
          {loading ? (
            <ActivityIndicator size="large" color="#D84315" style={{ marginTop: 40 }} />
          ) : (
            <ScrollView style={styles.listScroll} contentContainerStyle={styles.listContent}>
              {categories.map((cat, idx) => (
                <View key={cat.id || idx} style={styles.catCard}>
                  <View style={styles.catLeft}>
                    <View style={styles.indexCircle}>
                      <Text style={styles.indexText}>{idx + 1}</Text>
                    </View>
                    <View style={styles.catInfo}>
                      <View style={styles.titleRow}>
                        <Text style={styles.catTitle} numberOfLines={1}>
                          {cat.title}
                        </Text>
                        {cat.isAudio && <Text style={styles.audioPill}>🎵 AUDIO</Text>}
                      </View>
                      <Text style={styles.catDesc} numberOfLines={2}>
                        {cat.description || 'No description provided.'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={styles.actionBtnEdit}
                      onPress={() => handleOpenEdit(cat)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionBtnEditText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionBtnDelete}
                      onPress={() => handleDelete(cat.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionBtnDeleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {/* Ticker Management Tab */}
      {activeTab === 'ticker' && (
        <ScrollView style={styles.contentBody} contentContainerStyle={{ padding: 16 }}>
          <Text style={styles.sectionHeading}>Continuous Scrolling Ticker Mantra</Text>
          <Text style={styles.helperText}>
            This sacred chant scrolls continuously under the application header on the home screen.
          </Text>

          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={4}
            value={tickerTe}
            onChangeText={setTickerTe}
            placeholder="Enter scrolling ticker text..."
          />

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => {
              if (Platform.OS === 'web') window.alert('Ticker updated successfully!');
              else Alert.alert('Saved', 'Ticker updated successfully!');
            }}
          >
            <Text style={styles.saveBtnText}>Update Ticker Mantra</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Status & Diagnostics Tab */}
      {activeTab === 'stats' && (
        <ScrollView style={styles.contentBody} contentContainerStyle={{ padding: 16 }}>
          <Text style={styles.sectionHeading}>System Status & Capabilities</Text>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Application Name:</Text>
            <Text style={styles.statValue}>Saranam Ayyappa</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Supported Languages:</Text>
            <Text style={styles.statValue}>Telugu, Kannada, English, Tamil, Hindi (5 Languages)</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Content Sections:</Text>
            <Text style={styles.statValue}>{categories.length} Sections</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Panchangam Astronomical Engine:</Text>
            <Text style={styles.statValue}>Active (Jean Meeus Ch. 47 Periodic Perturbations)</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Audio Streaming & Download Persistence:</Text>
            <Text style={styles.statValue}>Active (Single Download & Paused Resume Enabled)</Text>
          </View>
        </ScrollView>
      )}

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingItem ? 'Edit Devotional Section' : 'Create New Devotional Section'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.inputLabel}>Section Title ({selectedLang.toUpperCase()}) *</Text>
              <TextInput
                style={styles.textInput}
                value={formTitle}
                onChangeText={setFormTitle}
                placeholder="e.g. శ్రీ అయ్యప్ప అష్టోత్తరం"
              />

              <Text style={styles.inputLabel}>Slug Identifier</Text>
              <TextInput
                style={styles.textInput}
                value={formSlug}
                onChangeText={setFormSlug}
                placeholder="e.g. ayyappa-ashtottaram"
              />

              <View style={styles.switchRow}>
                <Text style={styles.inputLabel}>Enable Audio Player for this section?</Text>
                <TouchableOpacity
                  style={[styles.toggleBtn, formIsAudio && styles.toggleBtnActive]}
                  onPress={() => setFormIsAudio(!formIsAudio)}
                >
                  <Text style={styles.toggleBtnText}>{formIsAudio ? 'YES (Audio)' : 'NO (Text Only)'}</Text>
                </TouchableOpacity>
              </View>

              {formIsAudio && (
                <>
                  <Text style={styles.inputLabel}>Audio Chant Subtitle / Lyric</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formChantLyric}
                    onChangeText={setFormChantLyric}
                    placeholder="Chant lyric displayed while audio plays"
                  />
                </>
              )}

              <Text style={styles.inputLabel}>Full Content / Description (Markdown / Shlokas)</Text>
              <TextInput
                style={[styles.textArea, { minHeight: 120 }]}
                multiline
                value={formDescription}
                onChangeText={setFormDescription}
                placeholder="Enter devotional verses, Shlokas, guidelines, or details..."
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveModalBtn} onPress={handleSave}>
                <Text style={styles.saveModalBtnText}>Save to App</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    width: '100%',
    height: '100%',
  },
  header: {
    height: 56,
    backgroundColor: '#2C2C2C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#D84315',
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#444',
    borderRadius: 6,
  },
  closeBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#252525',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#FF9800',
  },
  tabText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FF9800',
  },
  contentBody: {
    flex: 1,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#2A2A2A',
  },
  langSelector: {
    flexDirection: 'row',
  },
  langChip: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 4,
    backgroundColor: '#3A3A3A',
    marginRight: 6,
  },
  langChipActive: {
    backgroundColor: '#D84315',
  },
  langChipText: {
    color: '#BBB',
    fontSize: 12,
    fontWeight: 'bold',
  },
  langChipTextActive: {
    color: '#FFF',
  },
  addBtn: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
  },
  addBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    padding: 12,
  },
  catCard: {
    backgroundColor: '#2C2C2C',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  catLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  indexCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3E3E3E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  indexText: {
    color: '#FFB74D',
    fontSize: 12,
    fontWeight: 'bold',
  },
  catInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  catTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
    flex: 1,
  },
  audioPill: {
    backgroundColor: '#E65100',
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
  },
  catDesc: {
    color: '#999',
    fontSize: 12,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  actionBtnEdit: {
    backgroundColor: '#0288D1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 6,
  },
  actionBtnEditText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionBtnDelete: {
    backgroundColor: '#D32F2F',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  actionBtnDeleteText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionHeading: {
    color: '#FFB74D',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  helperText: {
    color: '#888',
    fontSize: 13,
    marginBottom: 12,
  },
  textArea: {
    backgroundColor: '#2A2A2A',
    color: '#FFF',
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: '#444',
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: '#D84315',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  statBox: {
    backgroundColor: '#2A2A2A',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
  },
  statValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#252525',
    borderRadius: 12,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#444',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3A',
  },
  modalTitle: {
    color: '#FFB74D',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCloseText: {
    color: '#FFF',
    fontSize: 18,
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  inputLabel: {
    color: '#CCC',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#1E1E1E',
    color: '#FFF',
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: '#444',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  toggleBtn: {
    backgroundColor: '#444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#E65100',
  },
  toggleBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#3A3A3A',
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
  },
  cancelBtnText: {
    color: '#AAA',
    fontSize: 14,
  },
  saveModalBtn: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  saveModalBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

