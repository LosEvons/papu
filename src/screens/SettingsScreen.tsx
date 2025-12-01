/**
 * Settings screen for export, import, and reset functionality.
 * Provides data management options with proper confirmations.
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Share,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';

import { useAppData } from '../contexts/AppDataContext';
import { AppData } from '../models/types';
import { RESET_CONFIRMATION_TEXT } from '../utils/constants';

/**
 * Settings screen component.
 * Handles export, import, and data reset operations.
 */
export function SettingsScreen() {
  const { data, dispatch } = useAppData();

  // Import state
  const [importText, setImportText] = useState('');
  const [resetConfirmText, setResetConfirmText] = useState('');

  /**
   * Validate imported data structure
   */
  const validateAppData = (data: unknown): data is AppData => {
    if (typeof data !== 'object' || data === null) {
      return false;
    }

    const obj = data as Record<string, unknown>;

    if (!Array.isArray(obj.cards) || !Array.isArray(obj.groups)) {
      return false;
    }

    // Basic validation of card structure
    for (const card of obj.cards) {
      if (typeof card !== 'object' || card === null) return false;
      const c = card as Record<string, unknown>;
      if (typeof c.id !== 'string' || typeof c.title !== 'string') return false;
      if (!Array.isArray(c.groupIds)) return false;
      if (typeof c.createdAt !== 'string' || typeof c.updatedAt !== 'string') return false;
    }

    // Basic validation of group structure
    for (const group of obj.groups) {
      if (typeof group !== 'object' || group === null) return false;
      const g = group as Record<string, unknown>;
      if (typeof g.id !== 'string' || typeof g.name !== 'string') return false;
      if (typeof g.createdAt !== 'string' || typeof g.updatedAt !== 'string') return false;
    }

    return true;
  };

  /**
   * Handle export - share JSON data
   */
  const handleExport = async () => {
    try {
      const jsonData = JSON.stringify(data, null, 2);
      await Share.share({
        message: jsonData,
        title: 'Communication Cards Data',
      });
    } catch (error) {
      Alert.alert('Export Failed', 'Unable to share data. Please try again.');
    }
  };

  /**
   * Handle paste from clipboard
   */
  const handlePasteFromClipboard = async () => {
    try {
      const clipboardContent = await Clipboard.getStringAsync();
      if (clipboardContent) {
        setImportText(clipboardContent);
      } else {
        Alert.alert('Empty Clipboard', 'No text found in clipboard.');
      }
    } catch (error) {
      Alert.alert('Paste Failed', 'Unable to read from clipboard.');
    }
  };

  /**
   * Parse and validate import data
   */
  const parseImportData = (): AppData | null => {
    if (!importText.trim()) {
      Alert.alert('Error', 'Please enter JSON data to import.');
      return null;
    }

    try {
      const parsed = JSON.parse(importText);
      if (!validateAppData(parsed)) {
        Alert.alert(
          'Invalid Data',
          'The JSON data is not in the correct format. Please ensure it contains valid cards and groups arrays.'
        );
        return null;
      }
      return parsed;
    } catch (error) {
      Alert.alert(
        'Invalid JSON',
        'The text is not valid JSON. Please check the format and try again.'
      );
      return null;
    }
  };

  /**
   * Handle import with merge (adds new items, keeps existing)
   */
  const handleImportMerge = () => {
    const importedData = parseImportData();
    if (!importedData) return;

    Alert.alert(
      'Import (Merge)',
      `This will add ${importedData.cards.length} cards and ${importedData.groups.length} groups. Existing items with the same ID will be kept.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import',
          onPress: () => {
            dispatch({
              type: 'IMPORT_DATA',
              payload: { data: importedData, merge: true },
            });
            setImportText('');
            Alert.alert('Success', 'Data imported and merged successfully!');
          },
        },
      ],
      { cancelable: true }
    );
  };

  /**
   * Handle import with replace (replaces all data)
   */
  const handleImportReplace = () => {
    const importedData = parseImportData();
    if (!importedData) return;

    Alert.alert(
      'Import (Replace)',
      `This will REPLACE all your data with ${importedData.cards.length} cards and ${importedData.groups.length} groups. Your current data will be lost!`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Replace',
          style: 'destructive',
          onPress: () => {
            dispatch({
              type: 'IMPORT_DATA',
              payload: { data: importedData, merge: false },
            });
            setImportText('');
            Alert.alert('Success', 'Data replaced successfully!');
          },
        },
      ],
      { cancelable: true }
    );
  };

  /**
   * Handle data reset with strong confirmation
   */
  const handleReset = () => {
    if (resetConfirmText !== RESET_CONFIRMATION_TEXT) {
      Alert.alert(
        'Confirmation Required',
        'Please type "RESET" in the confirmation field to delete all data.'
      );
      return;
    }

    Alert.alert(
      'Reset All Data',
      'This will permanently delete ALL cards and groups. This action cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: () => {
            dispatch({ type: 'RESET_DATA' });
            setResetConfirmText('');
            Alert.alert('Success', 'All data has been reset.');
          },
        },
      ],
      { cancelable: true }
    );
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
        {/* Export Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export Data</Text>
          <Text style={styles.sectionDescription}>
            Share your cards and groups as JSON data.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleExport}
            accessibilityLabel="Export data"
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>Export Data</Text>
          </TouchableOpacity>
          <Text style={styles.infoText}>
            Currently: {data.cards.length} cards, {data.groups.length} groups
          </Text>
        </View>

        {/* Import Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Import Data</Text>
          <Text style={styles.sectionDescription}>
            Paste JSON data to import cards and groups.
          </Text>

          <TextInput
            style={styles.importTextArea}
            value={importText}
            onChangeText={setImportText}
            placeholder="Paste JSON data here..."
            accessibilityLabel="Import data text input"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handlePasteFromClipboard}
            accessibilityLabel="Paste from clipboard"
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonText}>From Clipboard</Text>
          </TouchableOpacity>

          <View style={styles.importButtons}>
            <TouchableOpacity
              style={[styles.importButton, styles.mergeButton]}
              onPress={handleImportMerge}
              accessibilityLabel="Import and merge data"
              accessibilityRole="button"
            >
              <Text style={styles.importButtonText}>Import (Merge)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.importButton, styles.replaceButton]}
              onPress={handleImportReplace}
              accessibilityLabel="Import and replace all data"
              accessibilityRole="button"
            >
              <Text style={styles.importButtonText}>Import (Replace)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reset Section */}
        <View style={[styles.section, styles.dangerSection]}>
          <Text style={styles.sectionTitle}>Reset Data</Text>
          <Text style={styles.dangerDescription}>
            Delete all cards and groups. This cannot be undone!
          </Text>

          <Text style={styles.confirmLabel}>Type "RESET" to confirm:</Text>
          <TextInput
            style={styles.confirmInput}
            value={resetConfirmText}
            onChangeText={setResetConfirmText}
            placeholder="RESET"
            accessibilityLabel="Reset confirmation"
            accessibilityHint='Type "RESET" to enable the reset button'
            autoCapitalize="characters"
          />

          <TouchableOpacity
            style={[
              styles.dangerButton,
              resetConfirmText !== RESET_CONFIRMATION_TEXT && styles.dangerButtonDisabled,
            ]}
            onPress={handleReset}
            accessibilityLabel="Reset all data"
            accessibilityRole="button"
            accessibilityState={{ disabled: resetConfirmText !== RESET_CONFIRMATION_TEXT }}
          >
            <Text style={styles.dangerButtonText}>Reset All Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  dangerSection: {
    borderWidth: 1,
    borderColor: '#DC3545',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  dangerDescription: {
    fontSize: 14,
    color: '#DC3545',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  importTextArea: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 120,
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  importButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  importButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    minHeight: 44,
    justifyContent: 'center',
  },
  mergeButton: {
    backgroundColor: '#28A745',
  },
  replaceButton: {
    backgroundColor: '#FFC107',
  },
  importButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmLabel: {
    fontSize: 14,
    color: '#DC3545',
    marginBottom: 8,
  },
  confirmInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#DC3545',
  },
  dangerButton: {
    backgroundColor: '#DC3545',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  dangerButtonDisabled: {
    backgroundColor: '#ccc',
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
