/**
 * Floating Action Button (FAB) component.
 * Provides a circular button with proper touch target and accessibility.
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, Text, ViewStyle } from 'react-native';

/** FAB component props */
interface FABProps {
  /** Callback when FAB is pressed */
  onPress: () => void;
  /** Icon or text to display (default: '+') */
  icon?: string;
  /** Accessibility label for screen readers */
  accessibilityLabel: string;
  /** Optional additional styles */
  style?: ViewStyle;
}

/**
 * Floating action button component with minimum 44x44 touch target.
 * Used for primary actions like creating new cards.
 */
export function FAB({ onPress, icon = '+', accessibilityLabel, style }: FABProps) {
  return (
    <TouchableOpacity
      style={[styles.fab, style]}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      <Text style={styles.fabText}>{icon}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    // Ensure minimum touch target of 44x44
    minWidth: 44,
    minHeight: 44,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 32,
  },
});
