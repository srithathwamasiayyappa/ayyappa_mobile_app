import React, { useRef } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

interface Props {
  value: string;
  onChangeOtp: (otp: string) => void;
  length?: number;
}

export const SixDigitOtpInput: React.FC<Props> = ({
  value,
  onChangeOtp,
  length = 6,
}) => {
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleChange = (text: string, index: number) => {
    // If pasted full string
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length > 1) {
      const sliced = cleaned.slice(0, length);
      onChangeOtp(sliced);
      const nextFocus = Math.min(sliced.length, length - 1);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const currentArr = value.split('');
    currentArr[index] = cleaned;
    const newVal = currentArr.join('').slice(0, length);
    onChangeOtp(newVal);

    if (cleaned && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const digits = Array.from({ length }, (_, i) => value[i] || '');

  return (
    <View style={styles.container}>
      {digits.map((digit, idx) => (
        <View key={idx} style={[styles.box, digit ? styles.filledBox : null]}>
          <TextInput
            ref={(ref) => { inputRefs.current[idx] = ref; }}
            style={styles.digitText}
            keyboardType="number-pad"
            maxLength={idx === 0 ? 6 : 1}
            value={digit}
            onChangeText={(t) => handleChange(t, idx)}
            onKeyPress={(e) => handleKeyPress(e, idx)}
            selectTextOnFocus
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
    width: '100%',
  },
  box: {
    width: 48,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#FFF8EE',
    borderWidth: 1.5,
    borderColor: '#E6D1BD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filledBox: {
    borderColor: '#FF9800',
    backgroundColor: '#FFFDF9',
  },
  digitText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#3E1508',
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
});

