import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, Button, StyleSheet, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAppData } from '../contexts/AppDataContext';
import { Card, Group } from '../models/types';
import { v4 as uuidv4 } from 'uuid';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

type ParamList = {
  CardEdit: { id?: string } | undefined;
};

export default function CardEditScreen() {
  // @ts-ignore
  const route = useRoute<RouteProp<ParamList, 'CardEdit'>>();
  const navigation = useNavigation();
  const { data, dispatch } = useAppData();
  const editingId = route.params?.id;

  const existing = data.cards.find((c) => c.id === editingId);

  const [title, setTitle] = useState(existing?.title || '');
  const [text, setText] = useState(existing?.text || '');
  const [imageUri, setImageUri] = useState<string | undefined>(existing?.imageUri);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(existing?.groupIds || []);
  const [newGroupName, setNewGroupName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({ title: editingId ? 'Edit Card' : 'Create Card' } as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingId]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Permission to access photos is required to pick an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, base64: false });
    if (!result.cancelled) {
      // store URI as returned
      setImageUri(result.uri);
    }
  };

  const toggleGroup = (groupId: string) => {
    setSelectedGroupIds((prev) => (prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]));
  };

  const createGroupInline = () => {
    if (!newGroupName.trim()) {
      Alert.alert('Validation', 'Group name is required');
      return;
    }
    const id = uuidv4();
    const now = new Date().toISOString();
    const group: Group = { id, name: newGroupName.trim(), createdAt: now, updatedAt: now };
    dispatch({ type: 'ADD_GROUP', payload: group });
    setSelectedGroupIds((prev) => [...prev, id]);
    setNewGroupName('');
  };

  const handleSave = () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setError(null);
    const now = new Date().toISOString();
    if (editingId && existing) {
      const updated: Card = {
        ...existing,
        title: title.trim(),
        text: text.trim() || undefined,
        imageUri,
        groupIds: selectedGroupIds,
        updatedAt: now,
      };
      dispatch({ type: 'UPDATE_CARD', payload: updated });
    } else {
      const id = uuidv4();
      const card: Card = {
        id,
        title: title.trim(),
        text: text.trim() || undefined,
        imageUri,
        groupIds: selectedGroupIds,
        favorite: false,
        createdAt: now,
        updatedAt: now,
      };
      dispatch({ type: 'ADD_CARD', payload: card });
    }
    // go back
    navigation.goBack();
  };

  const handleDelete = () => {
    if (!editingId) return;
    Alert.alert('Delete Card', 'Are you sure you want to delete this card?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          dispatch({ type: 'DELETE_CARD', payload: { id: editingId } });
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Title *</Text>
      <TextInput
        accessibilityLabel="Title"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Text style={styles.label}>Text</Text>
      <TextInput
        accessibilityLabel="Text"
        style={[styles.input, { minHeight: 80 }]}
        value={text}
        onChangeText={setText}
        placeholder="Optional text"
        multiline
      />
      <Text style={styles.label}>Image</Text>
      {imageUri ? <Image source={{ uri: imageUri }} style={styles.image} /> : null}
      <Button title="Pick Image" onPress={pickImage} />
      <Text style={[styles.label, { marginTop: 12 }]}>Groups</Text>
      <View>
        {data.groups.map((g) => (
          <TouchableOpacity
            key={g.id}
            onPress={() => toggleGroup(g.id)}
            accessibilityLabel={`Toggle group ${g.name}`}
            style={styles.groupRow}
          >
            <Text style={{ fontSize: 16 }}>{selectedGroupIds.includes(g.id) ? '☑' : '☐'}</Text>
            <Text style={{ marginLeft: 8 }}>{g.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.inlineCreate}>
        <TextInput
          accessibilityLabel="New group name"
          placeholder="Create new group"
          value={newGroupName}
          onChangeText={setNewGroupName}
          style={[styles.input, { flex: 1 }]}
        />
        <Button title="Create" onPress={createGroupInline} />
      </View>

      <View style={styles.actions}>
        <Button title="Save" onPress={handleSave} />
        <Button title="Cancel" onPress={() => navigation.goBack()} />
        {editingId ? <Button color="#D9534F" title="Delete" onPress={handleDelete} /> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12, paddingBottom: 36 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#DDD', padding: 8, borderRadius: 8, marginTop: 6, minHeight: 44 },
  error: { color: '#D9534F', marginTop: 4 },
  image: { width: 120, height: 120, borderRadius: 8, marginVertical: 8 },
  groupRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  inlineCreate: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  actions: { marginTop: 20, flexDirection: 'column', gap: 8 },
});