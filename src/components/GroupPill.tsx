import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Group } from '../models/types';

export default function GroupPill({
  group,
  selected,
  onPress,
}: {
  group?: Group | null;
  selected?: boolean;
  onPress?: () => void;
}) {
  if (!group) {
    return (
      <TouchableOpacity accessibilityLabel="Group All" style={[styles.pill, selected && styles.selected]} onPress={onPress}>
        <Text style={styles.text}>All</Text>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity
      accessibilityLabel={`Group ${group.name}`}
      style={[styles.pill, selected && styles.selected, group.color ? { borderColor: group.color } : null]}
      onPress={onPress}
    >
      <View style={[styles.colorDot, group.color ? { backgroundColor: group.color } : { backgroundColor: '#888' }]} />
      <Text style={styles.text}>{group.name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
    minHeight: 44,
    minWidth: 44,
  },
  selected: {
    backgroundColor: '#E6F0FF',
    borderColor: '#007AFF',
  },
  text: {
    marginLeft: 6,
    fontSize: 14,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});