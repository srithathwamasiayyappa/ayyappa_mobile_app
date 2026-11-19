import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DharmaKarthaTemple } from '../../../types';
import { ApiService } from '../../../services/api';

export type QuickEditSection = 'about' | 'speciality' | 'timings' | 'media' | 'festivals' | 'contact';

interface Props {
  visible: boolean;
  section: QuickEditSection | null;
  temple: DharmaKarthaTemple | null;
  userId?: number;
  onClose: () => void;
  onUpdated: () => void;
}

export const QuickEditModal: React.FC<Props> = ({
  visible,
  section,
  temple,
  userId = 1,
  onClose,
  onUpdated,
}) => {
  const [loading, setLoading] = useState(false);

  // About / History fields
  const [name, setName] = useState('');
  const [deity, setDeity] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [about, setAbout] = useState('');
  const [history, setHistory] = useState('');

  // Speciality field
  const [speciality, setSpeciality] = useState('');

  // Time & Aarti fields
  const [timingTitle, setTimingTitle] = useState('Morning Darshan & Abhishekam');
  const [timingStart, setTimingStart] = useState('06:00 AM');
  const [timingEnd, setTimingEnd] = useState('11:30 AM');
  const [timingDays, setTimingDays] = useState('Daily (All Days)');

  // Media fields
  const [mediaTitle, setMediaTitle] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');

  // Festivals fields
  const [festName, setFestName] = useState('');
  const [festPeriod, setFestPeriod] = useState('');
  const [festDesc, setFestDesc] = useState('');

  // Contact fields
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (temple) {
      setName(temple.name || '');
      setDeity(temple.primaryDeity || '');
      setShortDesc(temple.shortDescription || '');
      setAbout(temple.about || '');
      setHistory(temple.history || '');
      setSpeciality(temple.speciality || '');
      setPhone(temple.officePhone || '');
      setEmail(temple.officialEmail || '');
      setWebsite(temple.officialWebsite || '');
      setAddress(temple.address || '');
    }
  }, [temple]);

  if (!temple || !section) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      if (section === 'about') {
        await ApiService.updateTemple(
          temple.id,
          {
            name: name.trim(),
            primaryDeity: deity.trim(),
            shortDescription: shortDesc.trim(),
            about: about.trim(),
            history: history.trim(),
          },
          userId
        );
      } else if (section === 'speciality') {
        await ApiService.updateTemple(
          temple.id,
          {
            speciality: speciality.trim(),
          },
          userId
        );
      } else if (section === 'timings') {
        const start = timingStart.trim();
        const end = timingEnd.trim();
        const constructedWindow = start && end ? `${start} – ${end}` : (start || end);

        if (!timingTitle.trim()) {
          Alert.alert('Required', 'Please enter a timing title or seva name.');
          setLoading(false);
          return;
        }

        if (!constructedWindow) {
          Alert.alert('Required', 'Please enter start time and end time.');
          setLoading(false);
          return;
        }

        await ApiService.addTempleTiming(
          temple.id,
          {
            title: timingTitle.trim(),
            timeWindow: constructedWindow,
            startTime: start,
            endTime: end,
            description: timingDays.trim() || undefined,
            applicableDays: timingDays.trim(),
          },
          userId
        );
      } else if (section === 'media') {
        if (!mediaUrl.trim()) {
          Alert.alert('Required', 'Please enter a valid image URL or upload URL.');
          setLoading(false);
          return;
        }
        await ApiService.uploadTempleMedia(
          {
            templeId: temple.id,
            title: mediaTitle.trim() || 'Sanctum View',
            url: mediaUrl.trim(),
            mediaUrl: mediaUrl.trim(),
            category: 'SANCTUM',
          },
          userId
        );
      } else if (section === 'festivals') {
        if (!festName.trim()) {
          Alert.alert('Required', 'Please enter the festival name.');
          setLoading(false);
          return;
        }
        await ApiService.addTempleFestival(
          temple.id,
          {
            name: festName.trim(),
            period: festPeriod.trim() || 'Annual',
            description: festDesc.trim(),
          },
          userId
        );
      } else if (section === 'contact') {
        await ApiService.updateTemple(
          temple.id,
          {
            officePhone: phone.trim(),
            officialEmail: email.trim(),
            officialWebsite: website.trim(),
            address: address.trim(),
          },
          userId
        );
      }

      Alert.alert('Success', 'Temple information updated successfully in DB!');
      onUpdated();
      onClose();
    } catch (err: any) {
      Alert.alert('Update Failed', err?.message || 'Could not update temple details.');
    } finally {
      setLoading(false);
    }
  };

  const getSectionTitle = () => {
    switch (section) {
      case 'about':
        return 'Edit About & Sacred History';
      case 'speciality':
        return 'Edit Spiritual Speciality';
      case 'timings':
        return 'Add Darshan & Aarti Timings';
      case 'media':
        return 'Upload Sanctum Media';
      case 'festivals':
        return 'Add Temple Festival';
      case 'contact':
        return 'Edit Administrative Contact';
      default:
        return 'Edit Temple Section';
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{getSectionTitle()}</Text>
              <Text style={styles.templeSubtitle}>{temple.name}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
            {section === 'about' && (
              <>
                <Text style={styles.label}>Temple Name</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} />

                <Text style={styles.label}>Primary Deity</Text>
                <TextInput style={styles.input} value={deity} onChangeText={setDeity} />

                <Text style={styles.label}>One-line Devotional Summary</Text>
                <TextInput style={styles.input} value={shortDesc} onChangeText={setShortDesc} />

                <Text style={styles.label}>About the Temple</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={about}
                  onChangeText={setAbout}
                  multiline
                  numberOfLines={4}
                />

                <Text style={styles.label}>Sacred History & Origins</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={history}
                  onChangeText={setHistory}
                  multiline
                  numberOfLines={4}
                />
              </>
            )}

            {section === 'speciality' && (
              <>
                <Text style={styles.label}>Spiritual Speciality & Architectural Highlights</Text>
                <TextInput
                  style={[styles.input, styles.textAreaLarge]}
                  value={speciality}
                  onChangeText={setSpeciality}
                  multiline
                  numberOfLines={6}
                  placeholder="e.g. Consecrated 18 Holy Gold Steps, Neyyabhishekam, Sahasra Kalasham..."
                  placeholderTextColor="#889A92"
                />
              </>
            )}

            {section === 'timings' && (
              <>
                <Text style={styles.label}>Timing Title / Seva Name</Text>
                <TextInput
                  style={styles.input}
                  value={timingTitle}
                  onChangeText={setTimingTitle}
                  placeholder="e.g. Suprabhatam & Viswaroopa Darshan"
                />

                <View style={styles.row}>
                  <View style={styles.half}>
                    <Text style={styles.label}>Start Time</Text>
                    <TextInput style={styles.input} value={timingStart} onChangeText={setTimingStart} />
                  </View>
                  <View style={styles.half}>
                    <Text style={styles.label}>End Time</Text>
                    <TextInput style={styles.input} value={timingEnd} onChangeText={setTimingEnd} />
                  </View>
                </View>

                <Text style={styles.label}>Applicable Days</Text>
                <TextInput style={styles.input} value={timingDays} onChangeText={setTimingDays} />
              </>
            )}

            {section === 'media' && (
              <>
                <Text style={styles.label}>Photo / Media Title</Text>
                <TextInput
                  style={styles.input}
                  value={mediaTitle}
                  onChangeText={setMediaTitle}
                  placeholder="e.g. Sanctum Golden Altar"
                />

                <Text style={styles.label}>Image URL</Text>
                <TextInput
                  style={styles.input}
                  value={mediaUrl}
                  onChangeText={setMediaUrl}
                  placeholder="https://... or /images/..."
                  autoCapitalize="none"
                />
              </>
            )}

            {section === 'festivals' && (
              <>
                <Text style={styles.label}>Festival Name</Text>
                <TextInput
                  style={styles.input}
                  value={festName}
                  onChangeText={setFestName}
                  placeholder="e.g. Mandala Makaravilakku Mahotsavam"
                />

                <Text style={styles.label}>Period / Month / Season</Text>
                <TextInput
                  style={styles.input}
                  value={festPeriod}
                  onChangeText={setFestPeriod}
                  placeholder="e.g. Mid November - Mid January"
                />

                <Text style={styles.label}>Description & Significance</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={festDesc}
                  onChangeText={setFestDesc}
                  multiline
                  numberOfLines={4}
                  placeholder="Details of the sacred rituals, procession, and divine offerings..."
                />
              </>
            )}

            {section === 'contact' && (
              <>
                <Text style={styles.label}>Office Phone / Helpline</Text>
                <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

                <Text style={styles.label}>Official Email</Text>
                <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

                <Text style={styles.label}>Official Trust Website</Text>
                <TextInput style={styles.input} value={website} onChangeText={setWebsite} autoCapitalize="none" />

                <Text style={styles.label}>Full Temple Address</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={address}
                  onChangeText={setAddress}
                  multiline
                  numberOfLines={3}
                />
              </>
            )}
          </ScrollView>

          {/* Footer Save Button */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={loading}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
              <LinearGradient colors={['#0C251E', '#173D32']} style={styles.saveBtnGradient}>
                {loading ? <ActivityIndicator color="#FFFDF8" size="small" /> : <Text style={styles.saveBtnText}>Save to Database</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFDF9',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    minHeight: '50%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE7DC',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0C251E',
  },
  templeSubtitle: {
    fontSize: 12,
    color: '#71857C',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3EFE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 16,
    color: '#55665D',
    fontWeight: '600',
  },
  body: {
    paddingHorizontal: 20,
  },
  bodyContent: {
    paddingVertical: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1B3B30',
    marginBottom: 6,
    marginTop: 10,
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  textAreaLarge: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EDE7DC',
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#C7BEAD',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5C54',
  },
  saveBtn: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveBtnGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFDF8',
  },
});
