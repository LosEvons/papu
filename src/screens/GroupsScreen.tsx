/**
 * Groups screen for managing card groups.
 * Allows creating, editing, and deleting groups.
 */

import React, { useState } from 'react';
import {
  View,
  FlatList,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { v4 as uuidv4 } from 'uuid';

import { useAppData } from '../contexts/AppDataContext';
import { Group, UUID } from '../models/types';
import { formatDate } from '../utils/format';

/**
 * Groups screen component.
 * Manages card groups with create, edit, and delete functionality.
 */
export function GroupsScreen() {
  const { data, dispatch } = useAppData();

  // Create group form state
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);

  /**
   * Handle creating a new group
   */
  const handleCreateGroup = () => {
    if (!newName.trim()) {
      setNameError('Name is required');
      return;
    }

    // Validate color format if provided
    if (newColor && !/^#[0-9A-Fa-f]{6}$/.test(newColor)) {
      Alert.alert('Error', 'Color must be a valid hex color (e.g., #FF0000)');
      return;
    }

    const newGroup: Group = {
      id: uuidv4(),
      name: newName.trim(),
      color: newColor.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_GROUP', payload: newGroup });
    setNewName('');
    setNewColor('');
    setNameError(null);
  };

  /**
   * Handle editing a group name
   * Uses Alert.prompt on iOS, falls back to a simple update on Android
   */
  const handleEditGroup = (group: Group) => {
    if (Platform.OS === 'ios') {
      Alert.prompt(
        'Edit Group',
        'Enter new name for the group:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save',
            onPress: (newName?: string) => {
              if (newName && newName.trim()) {
                dispatch({
                  type: 'UPDATE_GROUP',
                  payload: { ...group, name: newName.trim() },
                });
              }
            },
          },
        ],
        'plain-text',
        group.name
      );
    } else {
      // Android doesn't have Alert.prompt, so we'll show an alert with instructions
      Alert.alert(
        'Edit Group',
        `To edit "${group.name}", please delete it and create a new group with the desired name.`,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    }
  };

  /**
   * Handle deleting a group with confirmation
   */
  const handleDeleteGroup = (group: Group) => {
    // Count cards in this group
    const cardCount = data.cards.filter((card) =>
      card.groupIds.includes(group.id)
    ).length;

    Alert.alert(
      'Delete Group',
      `Are you sure you want to delete "${group.name}"?${
        cardCount > 0
          ? `\n\nThis will remove this group from ${cardCount} card${
              cardCount > 1 ? 's' : ''
            }.`
          : ''
      }`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch({ type: 'DELETE_GROUP', payload: group.id });
          },
        },
      ],
      { cancelable: true }
    );
  };

  /**
   * Render a group list item
   */
  const renderGroupItem = ({ item }: { item: Group }) => (
    <View style={styles.groupItem}>
      <View style={styles.groupInfo}>
        {item.color && (
          <View
            style={[styles.colorIndicator, { backgroundColor: item.color }]}
            accessibilityLabel={`Color: ${item.color}`}
          />
        )}
        <View style={styles.groupTextContainer}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.groupDate}>Updated: {formatDate(item.updatedAt)}</Text>
        </View>
      </View>
      <View style={styles.groupActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditGroup(item)}
          accessibilityLabel={`Edit ${item.name}`}
          accessibilityRole="button"
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteActionButton]}
          onPress={() => handleDeleteGroup(item)}
          accessibilityLabel={`Delete ${item.name}`}
          accessibilityRole="button"
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  /**
   * Key extractor for FlatList
   */
  const keyExtractor = (item: Group) => item.id;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Create group form */}
      <View style={styles.createForm}>
        <Text style={styles.formTitle}>Create New Group</Text>
        <View style={styles.formRow}>
          <TextInput
            style={[
              styles.nameInput,
              nameError && styles.inputError,
            ]}
            value={newName}
            onChangeText={(text) => {
              setNewName(text);
              if (nameError) setNameError(null);
            }}
            placeholder="Group name"
            accessibilityLabel="Group name"
            accessibilityHint="Required field"
            returnKeyType="next"
          />
          <TextInput
            style={styles.colorInput}
            value={newColor}
            onChangeText={setNewColor}
            placeholder="#FF0000"
            accessibilityLabel="Group color (optional hex)"
            autoCapitalize="characters"
            maxLength={7}
          />
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateGroup}
            accessibilityLabel="Create group"
            accessibilityRole="button"
          >
            <Text style={styles.createButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
        {nameError && <Text style={styles.errorText}>{nameError}</Text>}
      </View>

      {/* Group list */}
      <FlatList
        data={data.groups}
        renderItem={renderGroupItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No groups yet. Create one above!
            </Text>
          </View>
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  createForm: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 8,
    minHeight: 44,
  },
  colorInput: {
    width: 90,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 8,
    minHeight: 44,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#DC3545',
  },
  errorText: {
    color: '#DC3545',
    fontSize: 14,
    marginTop: 4,
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 60,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    flexGrow: 1,
  },
  groupItem: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  groupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  groupTextContainer: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  groupDate: {
    fontSize: 12,
    color: '#999',
  },
  groupActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteActionButton: {
    backgroundColor: '#FEE',
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#DC3545',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: 200,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
