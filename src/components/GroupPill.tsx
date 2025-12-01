/**
 * Group selector pill/chip component.
 * Displays group name with optional color indicator.
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Group } from '../models/types';

/** GroupPill component props */
interface GroupPillProps {
  /** Group to display, or undefined for 'All' pill */
  group?: Group;
  /** Whether this pill is currently selected */
  selected?: boolean;
  /** Callback when pill is pressed */
  onPress: () => void;
  /** Label for 'All' option when no group is provided */
  allLabel?: string;
  /** Optional additional styles */
  style?: ViewStyle;
}

/**
 * Group selector chip component.
 * Shows 'All' when no group is passed, otherwise shows group name.
 * Displays a colored dot if the group has a color property.
 */
export function GroupPill({
  group,
  selected = false,
  onPress,
  allLabel = 'All',
  style,
}: GroupPillProps) {
  const label = group ? group.name : allLabel;

  return (
    <TouchableOpacity
      style={[
        styles.pill,
        selected && styles.pillSelected,
        style,
      ]}
      onPress={onPress}
      accessibilityLabel={`${label}${selected ? ', selected' : ''}`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      {group?.color && (
        <View
          style={[styles.colorDot, { backgroundColor: group.color }]}
          accessibilityLabel={`Color: ${group.color}`}
        />
      )}
      <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 4,
    minHeight: 44,
    minWidth: 44,
  },
  pillSelected: {
    backgroundColor: '#007AFF',
  },
  pillText: {
    fontSize: 14,
    color: '#333',
  },
  pillTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
});
