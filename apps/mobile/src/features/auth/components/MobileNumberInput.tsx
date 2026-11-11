import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  editable?: boolean;
}

export const MobileNumberInput: React.FC<Props> = ({
  label,
  value,
  onChangeText,
  placeholder = 'e.g. 9876543210',
  editable = true,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.phoneIcon}>📱</Text>
        <Text style={styles.label}>{label}</Text>
      </View>

      <View style={styles.inputRow}>
        {/* Country Code Selector Box */}
        <TouchableOpacity style={styles.countryBox} activeOpacity={0.75}>
          <Text style={styles.countryText}>IN +91</Text>
          <Text style={styles.caret}>▾</Text>
        </TouchableOpacity>

        {/* Number Input Box */}
        <TextInput
          style={[styles.input, !editable && styles.disabledInput]}
          placeholder={placeholder}
          placeholderTextColor="#9E9E9E"
          keyboardType="phone-pad"
          maxLength={10}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  phoneIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  label: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#252525',
    letterSpacing: 0.2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    borderWidth: 1.5,
    borderColor: '#E6D1BD',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 13,
    marginRight: 10,
    minWidth: 88,
    justifyContent: 'space-between',
  },
  countryText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3E1508',
  },
  caret: {
    fontSize: 13,
    color: '#3E1508',
    marginLeft: 4,
    fontWeight: 'bold',
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E6D1BD',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#212121',
    fontWeight: '600',
  },
  disabledInput: {
    backgroundColor: '#F9F9F9',
    color: '#424242',
  },
});

