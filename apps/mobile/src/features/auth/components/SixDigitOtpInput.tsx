import React, { useRef } from 'react';
import { View, TextInput, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
    width: Math.min(48, Math.floor((SCREEN_WIDTH - 48 - 40) / 6)),
    height: 54,
    borderRadius: 12,
    backgroundColor: '#FFFDF7',
    borderWidth: 1.2,
    borderColor: '#D9BE94',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#071914',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filledBox: {
    borderColor: '#173D32',
    backgroundColor: '#FFFBF2',
    borderWidth: 1.8,
  },
  digitText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#173D32',
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
});

