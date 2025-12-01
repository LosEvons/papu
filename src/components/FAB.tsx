import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';

export default function FAB({ onPress, label = '+' }: { onPress: () => void; label?: string }) {
  return (
    <TouchableOpacity
      accessibilityLabel="Floating action button"
      style={styles.fab}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View>
        <Text style={styles.text}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  text: { color: '#fff', fontSize: 28, lineHeight: 28 },
});