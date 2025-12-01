import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useAppData } from '../contexts/AppDataContext';
import { v4 as uuidv4 } from 'uuid';

export default function GroupsScreen() {
  const { data, dispatch } = useAppData();
  const [name, setName] = useState('');
  const [color, setColor] = useState('');

  const createGroup = () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Group name is required');
      return;
    }
    const id = uuidv4();
    const now = new Date().toISOString();
    dispatch({
      type: 'ADD_GROUP',
      payload: { id, name: name.trim(), color: color.trim() || undefined, createdAt: now, updatedAt: now },
    });
    setName('');
    setColor('');
  };

  const confirmDelete = (id: string) => {
    Alert.alert('Delete Group', 'Deleting this group will remove it from all cards. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          dispatch({ type: 'DELETE_GROUP', payload: { id } });
        },
      },
    ]);
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.row}>
      <Text style={styles.name}>{item.name}</Text>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          accessibilityLabel={`Edit group: ${item.name}`}
          onPress={() => {
            // quick inline edit prompt
            Alert.prompt(
              'Edit Group Name',
              undefined,
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Save',
                  onPress: (text) => {
                    if (!text || !text.trim()) return;
                    dispatch({
                      type: 'UPDATE_GROUP',
                      payload: { ...item, name: text.trim(), updatedAt: new Date().toISOString() },
                    });
                  },
                },
              ],
              'plain-text',
              item.name,
            );
          }}
        >
          <Text style={styles.action}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => confirmDelete(item.id)}>
          <Text style={[styles.action, { color: '#D9534F' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontSize: 16, fontWeight: '600' }}>Create Group</Text>
      <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Color (hex, optional)" value={color} onChangeText={setColor} style={styles.input} />
      <Button title="Create Group" onPress={createGroup} />
      <Text style={{ marginTop: 16, marginBottom: 8, fontWeight: '600' }}>Groups</Text>
      <FlatList data={data.groups} keyExtractor={(g) => g.id} renderItem={renderItem} ListEmptyComponent={<Text>No groups</Text>} />
    </View>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: '#DDD', padding: 8, borderRadius: 8, marginTop: 8, minHeight: 44 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#EEE' },
  name: { fontSize: 16 },
  action: { marginLeft: 12, color: '#007AFF' },
});