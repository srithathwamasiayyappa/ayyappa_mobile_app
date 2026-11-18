import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  dayNumber: string;
  monthText: string;
  samvatsaram: string;
  paksham: string;
  tithi: string;
  nakshatram: string;
  vaaram: string;
  onPress?: () => void;
}

export const PanchangamCard: React.FC<Props> = ({
  dayNumber,
  monthText,
  samvatsaram,
  paksham,
  tithi,
  nakshatram,
  vaaram,
  onPress,
}) => {
  return (
    <View style={styles.cardContainer}>
      {/* Outer border & devotional shadow */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPress}
        style={styles.card}
      >
        {/* Left Date Column - Centered */}
        <View style={styles.dateBlock}>
          <Text style={styles.dayNumber}>{dayNumber}</Text>
          <Text style={styles.monthText}>{monthText}</Text>
        </View>

        {/* Right Panchangam Column - Centered text */}
        <View style={styles.panchangBlock}>
          <Text style={styles.samvatsaramText} numberOfLines={1}>
            {samvatsaram}
          </Text>
          <Text style={styles.pakshamText}>
            {paksham}
          </Text>
          <Text style={styles.tithiText}>
            {tithi}
          </Text>
          <Text style={styles.nakshatramText}>
            {nakshatram}
          </Text>
          <Text style={styles.vaaramText}>
            {vaaram}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    paddingHorizontal: 12,
    marginTop: 10,
    marginBottom: 8,
    width: '100%',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FF5722', // Vivid orange background from screenshot
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#C62828', // Dark red/brown outline
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  dateBlock: {
    width: '32%',
    backgroundColor: '#FF5722',
    borderRightWidth: 1.5,
    borderRightColor: '#BF360C',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
  },
  dayNumber: {
    fontSize: 54,
    fontWeight: 'bold',
    color: '#FFD54F', // Bright yellow number
    lineHeight: 58,
    textAlign: 'center',
  },
  monthText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#212121', // Dark charcoal/black
    textAlign: 'center',
    marginTop: -2,
  },
  panchangBlock: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center', // Center aligned exactly as requested
  },
  samvatsaramText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD54F', // Golden yellow top line
    textAlign: 'center',
    marginBottom: 4,
  },
  pakshamText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212121', // Dark contrast
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 18,
  },
  tithiText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 3,
  },
  nakshatramText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 4,
  },
  vaaramText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212121', // Bold day of week
    textAlign: 'center',
  },
});
