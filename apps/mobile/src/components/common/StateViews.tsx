import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { COLORS } from '../../theme/colors';

interface LoadingProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingProps> = ({ message = 'Loading...' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.headerPrimary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

interface ErrorProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorProps> = ({ message, onRetry }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.errorTitle}>Unable to load content</Text>
      <Text style={styles.text}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.7}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

interface EmptyProps {
  message: string;
}

export const EmptyState: React.FC<EmptyProps> = ({ message }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.textDark,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B71C1C',
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 14,
    backgroundColor: COLORS.headerPrimary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyText: {
    fontSize: 14,
    color: '#5D4037',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
