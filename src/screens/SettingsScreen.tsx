import React, { useState } from 'react';
import { View, Button, TextInput, Alert, Text, StyleSheet, ScrollView } from 'react-native';
import { useAppData } from '../contexts/AppDataContext';
import { Share } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

export default function SettingsScreen() {
  const { data, dispatch } = useAppData();
  const [importText, setImportText] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');

  const handleExport = async () => {
    try {
      await Share.share({ message: JSON.stringify(data) });
    } catch (e) {
      Alert.alert('Export failed', 'Unable to open share sheet');
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await Clipboard.getString();
      setImportText(text);
    } catch (e) {
      Alert.alert('Clipboard error', 'Unable to read clipboard');
    }
  };

  const handleImport = (mode: 'merge' | 'replace') => {
    try {
      const parsed = JSON.parse(importText);
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.cards) || !Array.isArray(parsed.groups)) {
        throw new Error('Invalid shape');
      }
      Alert.alert('Confirm Import', mode === 'replace' ? 'Replace all data?' : 'Merge data?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'OK',
          onPress: () => {
            dispatch({ type: 'IMPORT_DATA', payload: { appData: parsed, mode } });
          },
        },
      ]);
    } catch (e) {
      Alert.alert('Import failed', 'Invalid JSON — no changes made.');
    }
  };

  const handleReset = () => {
    if (resetConfirm !== 'RESET') {
      Alert.alert('Type RESET to confirm');
      return;
    }
    Alert.alert('Reset All Data', 'This will delete all cards and groups. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          dispatch({ type: 'RESET_DATA' });
          setResetConfirm('');
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 12 }}>
      <Button title="Export Data" onPress={handleExport} />
      <Text style={{ marginTop: 16, fontWeight: '600' }}>Import Data (paste JSON)</Text>
      <TextInput
        accessibilityLabel="Import JSON"
        multiline
        value={importText}
        onChangeText={setImportText}
        placeholder="Paste exported JSON here"
        style={styles.input}
      />
      <View style={{ marginTop: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Button title="Import (Merge)" onPress={() => handleImport('merge')} />
        <Button title="Import (Replace)" onPress={() => handleImport('replace')} />
      </View>
      <Button title="From Clipboard" onPress={handlePasteFromClipboard} />
      <View style={{ marginTop: 24 }}>
        <Text style={{ fontWeight: '600' }}>Reset Data</Text>
        <Text>Type RESET to confirm and press Reset</Text>
        <TextInput value={resetConfirm} onChangeText={setResetConfirm} placeholder="Type RESET" style={styles.input} />
        <Button title="Reset All Data" color="#D9534F" onPress={handleReset} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: '#DDD', padding: 8, borderRadius: 8, marginTop: 8, minHeight: 88, textAlignVertical: 'top' },
});