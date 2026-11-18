import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { ApiService } from '../../../services/api';
import { RegisterMandirPayload } from '../../../types';

interface Props {
  onBack: () => void;
  onSuccess: () => void;
  userId?: number;
}

const CLASSIFICATION_OPTIONS = [
  {
    id: 'MAIN_TEMPLE',
    title: 'Main Temple',
    desc: 'Primary Maha Kshetram with full sanctum and daily scheduled poojas.',
  },
  {
    id: 'SUB_TEMPLE',
    title: 'Sub Temple',
    desc: 'Branch temple or subsidiary shrine affiliated to a central trust.',
  },
  {
    id: 'MULTI_DEITY',
    title: 'Multi-Deity Temple Complex',
    desc: 'Grand religious complex featuring multiple sanctums and deities.',
  },
  {
    id: 'COMMUNITY_TEMPLE',
    title: 'Community Temple',
    desc: 'Locally organized bhajana mandiram or residential colony shrine.',
  },
  {
    id: 'HERITAGE_SHRINE',
    title: 'Heritage Shrine',
    desc: 'Ancient historic pilgrimage site or forest shrine.',
  },
];

const DEITY_OPTIONS = [
  'Lord Ayyappa',
  'Lord Shiva',
  'Lord Venkateswara',
  'Goddess Durga / Devi',
  'Lord Ganesha',
  'Lord Murugan / Subrahmanya',
  'Lord Krishna',
  'Lord Rama',
  'Lord Hanuman',
  'Other Sacred Deity',
];

const STATE_OPTIONS = [
  'Telangana',
  'Andhra Pradesh',
  'Kerala',
  'Tamil Nadu',
  'Karnataka',
  'Maharashtra',
  'Uttar Pradesh',
  'Uttarakhand',
  'Odisha',
  'Gujarat',
  'Madhya Pradesh',
  'Rajasthan',
  'West Bengal',
  'Delhi NCR',
];

export const RegisterMandirScreen: React.FC<Props> = ({ onBack, onSuccess, userId = 1 }) => {
  const [classification, setClassification] = useState('MAIN_TEMPLE');
  const [name, setName] = useState('');
  const [alternateName, setAlternateName] = useState('');
  const [primaryDeity, setPrimaryDeity] = useState('Lord Ayyappa');
  const [state, setState] = useState('Telangana');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');

  const [shortDescription, setShortDescription] = useState('');
  const [about, setAbout] = useState('');
  const [history, setHistory] = useState('');
  const [speciality, setSpeciality] = useState('');

  const [officePhone, setOfficePhone] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');
  const [officialWebsite, setOfficialWebsite] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [showDeityPicker, setShowDeityPicker] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter the Temple Name.');
      return;
    }
    if (!city.trim()) {
      Alert.alert('Required Field', 'Please enter City / Town.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: RegisterMandirPayload = {
        classification,
        name: name.trim(),
        alternateName: alternateName.trim() || undefined,
        primaryDeity,
        state,
        city: city.trim(),
        district: district.trim() || undefined,
        address: address.trim(),
        shortDescription: shortDescription.trim() || undefined,
        about: about.trim() || undefined,
        history: history.trim() || undefined,
        speciality: speciality.trim() || undefined,
        officePhone: officePhone.trim() || undefined,
        officialEmail: officialEmail.trim() || undefined,
        officialWebsite: officialWebsite.trim() || undefined,
      };

      const res = await ApiService.registerMandir(payload, userId);
      Alert.alert(
        'Registration Submitted',
        res.message || 'Temple registered successfully! Awaiting Super Admin verification.',
        [{ text: 'OK', onPress: onSuccess }]
      );
    } catch (err: any) {
      Alert.alert('Submission Error', err?.message || 'Could not register temple. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M12 19l-7-7 7-7" stroke="#0C251E" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text style={styles.backBtnText}>Back to Profile</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Sacred Gopuram Badge & Heading */}
        <View style={styles.titleSection}>
          <View style={styles.mandirIconBox}>
            <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
              <Path d="M12 2 L14 6 H10 Z" fill="#DFA62E" />
              <Path d="M8 6 H16 L18 10 H6 Z" fill="#DFA62E" />
              <Path d="M5 10 H19 L21 14 H3 Z" fill="#C8902B" />
              <Path d="M4 14 H20 V21 H4 Z" stroke="#DFA62E" strokeWidth={1.5} />
              <Path d="M9 16 H15 V21 H9 Z" fill="#0C251E" />
              <Circle cx="12" cy="18.5" r="1.5" fill="#DFA62E" />
            </Svg>
          </View>
          <Text style={styles.mainHeading}>Register a Holy Mandir</Text>
          <Text style={styles.subHeading}>
            Submit temple details, sanctum heritage, and contact information for Super Admin verification and inclusion in the Saranam Ayyappa sacred directory.
          </Text>
        </View>

        {/* Section 1: Temple Identity & Classification */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>🏛 1. Temple Identity & Classification</Text>

          <Text style={styles.fieldLabel}>Select Temple Classification / Type *</Text>
          <Text style={styles.fieldHint}>Indicate whether this is an Independent Main Temple, a Sub Temple under another shrine, or part of a Multi-Temple trust complex.</Text>

          <View style={styles.classificationGrid}>
            {CLASSIFICATION_OPTIONS.map((item) => {
              const isSelected = classification === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.classCard, isSelected && styles.classCardSelected]}
                  activeOpacity={0.8}
                  onPress={() => setClassification(item.id)}
                >
                  <View style={styles.classCardHeader}>
                    <View style={styles.classIndicator}>
                      <Text style={styles.classIcon}>🛕</Text>
                      <Text style={[styles.classTitle, isSelected && styles.classTitleSelected]}>{item.title}</Text>
                    </View>
                    {isSelected && <Text style={styles.checkmarkIcon}>✓</Text>}
                  </View>
                  <Text style={styles.classDesc}>{item.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Temple Name */}
          <Text style={styles.fieldLabel}>Temple Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Sri Ayyappa Swamy Temple"
            placeholderTextColor="#889A92"
            value={name}
            onChangeText={setName}
          />

          {/* Alternate / Local Name */}
          <Text style={styles.fieldLabel}>Alternate / Local Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Hill Shrine Mandir"
            placeholderTextColor="#889A92"
            value={alternateName}
            onChangeText={setAlternateName}
          />

          {/* Deity and State Row */}
          <View style={styles.row}>
            <View style={styles.halfCol}>
              <Text style={styles.fieldLabel}>Primary Presiding Deity *</Text>
              <TouchableOpacity style={styles.dropdownTrigger} onPress={() => setShowDeityPicker(true)}>
                <Text style={styles.dropdownText} numberOfLines={1}>{primaryDeity}</Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.halfCol}>
              <Text style={styles.fieldLabel}>State *</Text>
              <TouchableOpacity style={styles.dropdownTrigger} onPress={() => setShowStatePicker(true)}>
                <Text style={styles.dropdownText} numberOfLines={1}>{state}</Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* City and District Row */}
          <View style={styles.row}>
            <View style={styles.halfCol}>
              <Text style={styles.fieldLabel}>City / Town *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Hyderabad"
                placeholderTextColor="#889A92"
                value={city}
                onChangeText={setCity}
              />
            </View>

            <View style={styles.halfCol}>
              <Text style={styles.fieldLabel}>District</Text>
              <TextInput
                style={styles.input}
                placeholder="District name"
                placeholderTextColor="#889A92"
                value={district}
                onChangeText={setDistrict}
              />
            </View>
          </View>

          {/* Full Temple Address */}
          <Text style={styles.fieldLabel}>Full Temple Address & Landmarks</Text>
          <TextInput
            style={[styles.input, styles.textAreaSmall]}
            placeholder="Door number, Street, Near landmark, Pincode"
            placeholderTextColor="#889A92"
            multiline
            numberOfLines={2}
            value={address}
            onChangeText={setAddress}
          />
        </View>

        {/* Section 2: Sacred Heritage & Details */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>📜 2. Sacred Heritage & Details</Text>

          <Text style={styles.fieldLabel}>One-line Devotional Summary</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Ancient hill shrine venerated for 41-day Mandala vratham and divine tranquility."
            placeholderTextColor="#889A92"
            value={shortDescription}
            onChangeText={setShortDescription}
          />

          <Text style={styles.fieldLabel}>About the Temple</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Comprehensive description of the temple sanctum, atmosphere, and traditions..."
            placeholderTextColor="#889A92"
            multiline
            numberOfLines={3}
            value={about}
            onChangeText={setAbout}
          />

          <Text style={styles.fieldLabel}>Sacred History & Origins</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ancient historical roots, royal patronage, puranic accounts..."
            placeholderTextColor="#889A92"
            multiline
            numberOfLines={3}
            value={history}
            onChangeText={setHistory}
          />

          <Text style={styles.fieldLabel}>Spiritual Speciality & Architectural Highlights</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Distinctive features, Neyyabhishekam, holy steps, sacred teertham..."
            placeholderTextColor="#889A92"
            multiline
            numberOfLines={3}
            value={speciality}
            onChangeText={setSpeciality}
          />
        </View>

        {/* Section 3: Official Administrative Contact */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>📞 3. Official Administrative Contact</Text>

          <Text style={styles.fieldLabel}>Office Phone / Helpline</Text>
          <TextInput
            style={styles.input}
            placeholder="+91 0000 000000"
            placeholderTextColor="#889A92"
            keyboardType="phone-pad"
            value={officePhone}
            onChangeText={setOfficePhone}
          />

          <Text style={styles.fieldLabel}>Official Email</Text>
          <TextInput
            style={styles.input}
            placeholder="contact@mandirtrust.org"
            placeholderTextColor="#889A92"
            keyboardType="email-address"
            autoCapitalize="none"
            value={officialEmail}
            onChangeText={setOfficialEmail}
          />

          <Text style={styles.fieldLabel}>Official Trust Website</Text>
          <TextInput
            style={styles.input}
            placeholder="https://mandirtrust.org"
            placeholderTextColor="#889A92"
            autoCapitalize="none"
            value={officialWebsite}
            onChangeText={setOfficialWebsite}
          />
        </View>

        {/* Actions Row */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onBack} disabled={submitting}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
            <LinearGradient colors={['#E5B24B', '#CAA049', '#AD7F25']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.submitBtnGradient}>
              {submitting ? (
                <ActivityIndicator color="#0C251E" size="small" />
              ) : (
                <>
                  <Text style={styles.submitBtnIcon}>✓</Text>
                  <Text style={styles.submitBtnText}>Submit for Verification</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Deity Picker Modal */}
      <Modal visible={showDeityPicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModalContent}>
            <Text style={styles.modalTitle}>Select Presiding Deity</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {DEITY_OPTIONS.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.pickerItem, primaryDeity === d && styles.pickerItemActive]}
                  onPress={() => {
                    setPrimaryDeity(d);
                    setShowDeityPicker(false);
                  }}
                >
                  <Text style={[styles.pickerItemText, primaryDeity === d && styles.pickerItemTextActive]}>{d}</Text>
                  {primaryDeity === d && <Text style={{ color: '#DFA62E', fontWeight: 'bold' }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowDeityPicker(false)}>
              <Text style={styles.modalCloseText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* State Picker Modal */}
      <Modal visible={showStatePicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModalContent}>
            <Text style={styles.modalTitle}>Select State</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {STATE_OPTIONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.pickerItem, state === s && styles.pickerItemActive]}
                  onPress={() => {
                    setState(s);
                    setShowStatePicker(false);
                  }}
                >
                  <Text style={[styles.pickerItemText, state === s && styles.pickerItemTextActive]}>{s}</Text>
                  {state === s && <Text style={{ color: '#DFA62E', fontWeight: 'bold' }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowStatePicker(false)}>
              <Text style={styles.modalCloseText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F7F2',
  },
  headerBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EBE5D8',
    backgroundColor: '#FFFDF9',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtnText: {
    fontSize: 14,
    color: '#0C251E',
    fontWeight: '600',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  mandirIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0C251E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#DFA62E',
  },
  mainHeading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0C251E',
    textAlign: 'center',
    marginBottom: 8,
  },
  subHeading: {
    fontSize: 13,
    color: '#55665D',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EAE4D5',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0C251E',
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1B3B30',
    marginBottom: 6,
    marginTop: 10,
  },
  fieldHint: {
    fontSize: 12,
    color: '#71857C',
    marginBottom: 12,
    lineHeight: 16,
  },
  classificationGrid: {
    gap: 10,
    marginBottom: 12,
  },
  classCard: {
    borderWidth: 1.5,
    borderColor: '#E3DC Flora',
    backgroundColor: '#FFFDF9',
    borderRadius: 12,
    padding: 12,
  },
  classCardSelected: {
    borderColor: '#DFA62E',
    backgroundColor: '#FFF9ED',
  },
  classCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  classIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  classIcon: {
    fontSize: 16,
  },
  classTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A332B',
  },
  classTitleSelected: {
    color: '#B27F15',
    fontWeight: '700',
  },
  checkmarkIcon: {
    color: '#B27F15',
    fontSize: 15,
    fontWeight: 'bold',
  },
  classDesc: {
    fontSize: 12,
    color: '#65776F',
    lineHeight: 16,
  },
  input: {
    backgroundColor: '#FAF8F4',
    borderWidth: 1,
    borderColor: '#DFD8C9',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0C251E',
  },
  textAreaSmall: {
    minHeight: 58,
    textAlignVertical: 'top',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCol: {
    flex: 1,
  },
  dropdownTrigger: {
    backgroundColor: '#FAF8F4',
    borderWidth: 1,
    borderColor: '#DFD8C9',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 13,
    color: '#0C251E',
    fontWeight: '500',
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#66776F',
    marginLeft: 6,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#C7BEAD',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5C54',
  },
  submitBtn: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  submitBtnIcon: {
    fontSize: 15,
    color: '#0C251E',
    fontWeight: 'bold',
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0C251E',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerModalContent: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFDF9',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0C251E',
    marginBottom: 14,
    textAlign: 'center',
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE1',
  },
  pickerItemActive: {
    backgroundColor: '#FFF7E6',
    borderRadius: 8,
  },
  pickerItemText: {
    fontSize: 14,
    color: '#1B3B30',
  },
  pickerItemTextActive: {
    fontWeight: '700',
    color: '#A87818',
  },
  modalCloseBtn: {
    marginTop: 14,
    backgroundColor: '#0C251E',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#FFFDF8',
    fontWeight: '600',
    fontSize: 14,
  },
});
