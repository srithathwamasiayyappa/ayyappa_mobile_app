import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  editable?: boolean;
}

// Pure Native Vector Phone Outline (zero third-party dependencies)
const PhoneOutlineIcon = ({ color = '#0C251E' }: { color?: string }) => (
  <View
    style={{
      width: 14,
      height: 18,
      borderRadius: 3,
      borderWidth: 1.8,
      borderColor: color,
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingBottom: 2,
      marginRight: 2,
    }}
  >
    <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: color }} />
  </View>
);

// Pure Native Vector Chevron Down
const ChevronDownIcon = ({ color = '#0C251E' }: { color?: string }) => (
  <View
    style={{
      width: 7,
      height: 7,
      borderBottomWidth: 1.8,
      borderRightWidth: 1.8,
      borderColor: color,
      transform: [{ rotate: '45deg' }],
      marginBottom: 3,
      marginLeft: 4,
    }}
  />
);

export const MobileNumberInput: React.FC<Props> = ({
  label = 'Mobile Number',
  value,
  onChangeText,
  placeholder = 'Enter mobile number',
  editable = true,
}) => {
  return (
    <View style={styles.container}>
      {/* 1. Mobile Number Label Row with Phone Glyph */}
      <View style={styles.labelRow}>
        <PhoneOutlineIcon color="#0C251E" />
        <Text style={styles.label}>{label}</Text>
      </View>

      {/* 2. Unified Input Card: +91 ⌵ | Enter mobile number */}
      <View style={styles.inputContainer}>
        {/* Country Code Selector Box */}
        <TouchableOpacity style={styles.countryBox} activeOpacity={0.8} disabled={!editable}>
          <Text style={styles.countryCode}>+91</Text>
          <View style={styles.chevronBox}>
            <ChevronDownIcon color="#0C251E" />
          </View>
        </TouchableOpacity>

        {/* Subtle Vertical Divider */}
        <View style={styles.divider} />

        {/* Clean Numeric Input */}
        <TextInput
          style={[styles.input, !editable && styles.disabledInput]}
          placeholder={placeholder}
          placeholderTextColor="#9E9182"
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
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0C251E',
    letterSpacing: 0.2,
    marginLeft: 7,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#E8DCD0',
    paddingHorizontal: 14,
  },
  countryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 6,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginRight: 4,
  },
  chevronBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#D9C8B6',
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15.5,
    color: '#212121',
    fontWeight: '500',
    paddingVertical: 0,
  },
  disabledInput: {
    color: '#757575',
  },
});
