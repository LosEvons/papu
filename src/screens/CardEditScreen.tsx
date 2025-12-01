/**
 * Card edit screen for creating and editing cards.
 * Supports title, text, image picking, and group assignment.
 */

import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { v4 as uuidv4 } from 'uuid';

import { RootStackParamList } from '../navigation';
import { useAppData } from '../contexts/AppDataContext';
import { Card, Group, UUID, CardCategory, CARD_CATEGORIES, CARD_CATEGORY_LABELS, CARD_CATEGORY_COLORS } from '../models/types';
import { HEX_COLOR_REGEX } from '../utils/constants';

/** Image picker configuration options */
const IMAGE_PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.8,
};

type CardEditScreenProps = NativeStackScreenProps<RootStackParamList, 'CardEdit'>;

/**
 * Card edit screen component.
 * Creates new cards or edits existing ones.
 */
export function CardEditScreen({ navigation, route }: CardEditScreenProps) {
  const { cardId } = route.params || {};
  const isEditMode = !!cardId;

  const { data, dispatch } = useAppData();

  // Find existing card if editing
  const existingCard = cardId
    ? data.cards.find((c) => c.id === cardId)
    : undefined;

  // Form state
  const [title, setTitle] = useState(existingCard?.title || '');
  const [text, setText] = useState(existingCard?.text || '');
  const [imageUri, setImageUri] = useState<string | undefined>(
    existingCard?.imageUri
  );
  const [selectedGroupIds, setSelectedGroupIds] = useState<UUID[]>(
    existingCard?.groupIds || []
  );
  const [category, setCategory] = useState<CardCategory>(
    existingCard?.category || 'other'
  );
  const [titleError, setTitleError] = useState<string | null>(null);

  // Inline group creation state
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('');

  // Update header title based on mode
  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditMode ? 'Edit Card' : 'New Card',
    });
  }, [navigation, isEditMode]);

  /**
   * Validate form and return whether valid
   */
  const validateForm = (): boolean => {
    if (!title.trim()) {
      setTitleError('Title is required');
      return false;
    }
    setTitleError(null);
    return true;
  };

  /**
   * Handle save button press
   */
  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const cardData: Card = {
      id: existingCard?.id || uuidv4(),
      title: title.trim(),
      text: text.trim() || undefined,
      imageUri,
      groupIds: selectedGroupIds,
      favorite: existingCard?.favorite || false,
      category,
      createdAt: existingCard?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isEditMode) {
      dispatch({ type: 'UPDATE_CARD', payload: cardData });
    } else {
      dispatch({ type: 'ADD_CARD', payload: cardData });
    }

    navigation.goBack();
  };

  /**
   * Handle cancel button press
   */
  const handleCancel = () => {
    navigation.goBack();
  };

  /**
   * Handle delete button press (edit mode only)
   */
  const handleDelete = () => {
    if (!cardId) return;

    Alert.alert(
      'Delete Card',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch({ type: 'DELETE_CARD', payload: cardId });
            navigation.goBack();
          },
        },
      ],
      { cancelable: true }
    );
  };

  /**
   * Handle image picker
   */
  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync(IMAGE_PICKER_OPTIONS);

      if (!result.canceled && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  /**
   * Remove the current image
   */
  const handleRemoveImage = () => {
    setImageUri(undefined);
  };

  /**
   * Toggle group selection
   */
  const toggleGroupSelection = (groupId: UUID) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  /**
   * Handle inline group creation
   */
  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      Alert.alert('Error', 'Group name is required');
      return;
    }

    // Validate color format if provided
    if (newGroupColor && !HEX_COLOR_REGEX.test(newGroupColor)) {
      Alert.alert('Error', 'Color must be a valid hex color (e.g., #FF0000)');
      return;
    }

    const newGroup: Group = {
      id: uuidv4(),
      name: newGroupName.trim(),
      color: newGroupColor.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_GROUP', payload: newGroup });

    // Auto-select the new group
    setSelectedGroupIds((prev) => [...prev, newGroup.id]);

    // Reset inline creation state
    setNewGroupName('');
    setNewGroupColor('');
    setIsCreatingGroup(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={[styles.textInput, titleError && styles.textInputError]}
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (titleError) setTitleError(null);
            }}
            placeholder="Enter card title"
            accessibilityLabel="Card title"
            accessibilityHint="Required field"
            returnKeyType="next"
          />
          {titleError && <Text style={styles.errorText}>{titleError}</Text>}
        </View>

        {/* Category selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryList}>
            {CARD_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  category === cat && styles.categoryChipSelected,
                  { borderColor: CARD_CATEGORY_COLORS[cat] },
                  category === cat && { backgroundColor: CARD_CATEGORY_COLORS[cat] },
                ]}
                onPress={() => setCategory(cat)}
                accessibilityLabel={`${CARD_CATEGORY_LABELS[cat]}${category === cat ? ', selected' : ''}`}
                accessibilityRole="radio"
                accessibilityState={{ checked: category === cat }}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    category === cat && styles.categoryChipTextSelected,
                  ]}
                >
                  {CARD_CATEGORY_LABELS[cat]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Text input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Text (optional)</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={text}
            onChangeText={setText}
            placeholder="Enter card description"
            accessibilityLabel="Card description"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Image picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Image (optional)</Text>
          {imageUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: imageUri }}
                style={styles.imagePreview}
                accessibilityLabel="Selected card image"
              />
              <View style={styles.imageButtons}>
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={handlePickImage}
                  accessibilityLabel="Change image"
                  accessibilityRole="button"
                >
                  <Text style={styles.imageButtonText}>Change</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.imageButton, styles.removeButton]}
                  onPress={handleRemoveImage}
                  accessibilityLabel="Remove image"
                  accessibilityRole="button"
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addImageButton}
              onPress={handlePickImage}
              accessibilityLabel="Add image"
              accessibilityRole="button"
            >
              <Text style={styles.addImageButtonText}>+ Add Image</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Group assignment */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Groups</Text>
          <View style={styles.groupList}>
            {data.groups.map((group: Group) => (
              <TouchableOpacity
                key={group.id}
                style={[
                  styles.groupChip,
                  selectedGroupIds.includes(group.id) && styles.groupChipSelected,
                ]}
                onPress={() => toggleGroupSelection(group.id)}
                accessibilityLabel={`${group.name}${
                  selectedGroupIds.includes(group.id) ? ', selected' : ''
                }`}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selectedGroupIds.includes(group.id) }}
              >
                {group.color && (
                  <View
                    style={[styles.groupColorDot, { backgroundColor: group.color }]}
                  />
                )}
                <Text
                  style={[
                    styles.groupChipText,
                    selectedGroupIds.includes(group.id) && styles.groupChipTextSelected,
                  ]}
                >
                  {group.name}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Inline group creation */}
            {isCreatingGroup ? (
              <View style={styles.inlineGroupCreate}>
                <TextInput
                  style={styles.inlineGroupInput}
                  value={newGroupName}
                  onChangeText={setNewGroupName}
                  placeholder="Group name"
                  accessibilityLabel="New group name"
                />
                <TextInput
                  style={[styles.inlineGroupInput, styles.colorInput]}
                  value={newGroupColor}
                  onChangeText={setNewGroupColor}
                  placeholder="#FF0000"
                  accessibilityLabel="Group color (hex)"
                  autoCapitalize="characters"
                  maxLength={7}
                />
                <TouchableOpacity
                  style={styles.inlineGroupButton}
                  onPress={handleCreateGroup}
                  accessibilityLabel="Create group"
                  accessibilityRole="button"
                >
                  <Text style={styles.inlineGroupButtonText}>Add</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.inlineGroupCancelButton}
                  onPress={() => {
                    setIsCreatingGroup(false);
                    setNewGroupName('');
                    setNewGroupColor('');
                  }}
                  accessibilityLabel="Cancel group creation"
                  accessibilityRole="button"
                >
                  <Text style={styles.inlineGroupCancelText}>×</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addGroupChip}
                onPress={() => setIsCreatingGroup(true)}
                accessibilityLabel="Create new group"
                accessibilityRole="button"
              >
                <Text style={styles.addGroupChipText}>+ New Group</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Action buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
          accessibilityLabel="Cancel"
          accessibilityRole="button"
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
          accessibilityLabel={isEditMode ? 'Save changes' : 'Create card'}
          accessibilityRole="button"
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
        {isEditMode && (
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDelete}
            accessibilityLabel="Delete card"
            accessibilityRole="button"
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 44,
  },
  textInputError: {
    borderColor: '#DC3545',
  },
  errorText: {
    color: '#DC3545',
    fontSize: 14,
    marginTop: 4,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  categoryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    minHeight: 44,
    borderWidth: 2,
  },
  categoryChipSelected: {
    // Background color is set dynamically
  },
  categoryChipText: {
    fontSize: 14,
    color: '#333',
  },
  categoryChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  imagePreviewContainer: {
    alignItems: 'center',
  },
  imagePreview: {
    width: 150,
    height: 150,
    borderRadius: 12,
    marginBottom: 12,
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  imageButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: '#DC3545',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  addImageButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  addImageButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  groupList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  groupChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    minHeight: 44,
  },
  groupChipSelected: {
    backgroundColor: '#007AFF',
  },
  groupChipText: {
    fontSize: 14,
    color: '#333',
  },
  groupChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  groupColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  addGroupChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  addGroupChipText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  inlineGroupCreate: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    width: '100%',
    marginTop: 8,
  },
  inlineGroupInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    minHeight: 44,
    minWidth: 100,
  },
  colorInput: {
    flex: 0,
    width: 90,
  },
  inlineGroupButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 4,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineGroupButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  inlineGroupCancelButton: {
    padding: 10,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineGroupCancelText: {
    fontSize: 24,
    color: '#999',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    marginHorizontal: 4,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#DC3545',
    flex: 0,
    paddingHorizontal: 16,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
