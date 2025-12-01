import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ScrollView,
  Alert,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useAppData } from '../contexts/AppDataContext';
import GroupPill from '../components/GroupPill';
import CardRow from '../components/CardRow';
import FAB from '../components/FAB';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const { data, loading, loadError, dispatch } = useAppData();
  const navigation = useNavigation();
  const [selectedGroupId, setSelectedGroupId] = useState<string | 'ALL' | 'FAV'>('ALL');
  const [search, setSearch] = useState('');

  const groups = data.groups || [];
  const cards = data.cards || [];

  const filtered = useMemo(() => {
    let list = cards.slice();
    // Group filter
    if (selectedGroupId === 'FAV') {
      list = list.filter((c) => c.favorite);
    } else if (selectedGroupId !== 'ALL') {
      list = list.filter((c) => c.groupIds.includes(selectedGroupId as string));
    }
    // Search
    const q = search.trim().toLowerCase();
    if (q.length > 0) {
      list = list.filter((c) => (c.title || '').toLowerCase().includes(q) || (c.text || '').toLowerCase().includes(q));
    }
    // Sort by updatedAt desc
    list.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    return list;
  }, [cards, selectedGroupId, search]);

  const handleOpenCreate = () => {
    // navigate to CardEdit with no id (create)
    // @ts-ignore
    navigation.navigate('CardEdit', {});
  };

  const handleToggleFavorite = (cardId: string) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;
    dispatch({ type: 'UPDATE_CARD', payload: { ...card, favorite: !card.favorite } });
  };

  const handleDelete = (cardId: string) => {
    Alert.alert('Delete Card', 'Are you sure you want to delete this card?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => dispatch({ type: 'DELETE_CARD', payload: { id: cardId } }),
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loading}><Text>Loading…</Text></View>
        ) : (
          <>
            {loadError ? (
              <View style={styles.banner}><Text style={{ color: '#fff' }}>Failed to load local data — starting fresh</Text></View>
            ) : null}
            <View style={styles.groupList}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
                <TouchableOpacity onPress={() => setSelectedGroupId('ALL')} style={{ marginRight: 8 }}>
                  <View>
                    <Text style={[styles.groupLabel, selectedGroupId === 'ALL' ? styles.selectedLabel : null]}>All</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedGroupId('FAV')} style={{ marginRight: 8 }}>
                  <Text style={[styles.groupLabel, selectedGroupId === 'FAV' ? styles.selectedLabel : null]}>Favorites</Text>
                </TouchableOpacity>
                {groups.map((g) => (
                  <GroupPill
                    key={g.id}
                    group={g}
                    selected={selectedGroupId === g.id}
                    onPress={() => setSelectedGroupId(g.id)}
                  />
                ))}
              </ScrollView>
            </View>

            <View style={styles.searchRow}>
              <TextInput
                accessibilityLabel="Search"
                placeholder="Search"
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
              />
              <TouchableOpacity onPress={() => navigation.navigate('Groups' as any)} style={styles.linkButton}>
                <Text style={{ color: '#007AFF' }}>Groups</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Settings' as any)} style={styles.linkButton}>
                <Text style={{ color: '#007AFF' }}>Settings</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <CardRow
                  card={item}
                  onPress={() => navigation.navigate('CardEdit' as any, { id: item.id })}
                  onToggleFavorite={() => handleToggleFavorite(item.id)}
                  onDelete={() => handleDelete(item.id)}
                />
              )}
              ListEmptyComponent={<View style={styles.empty}><Text>No cards yet</Text></View>}
              contentContainerStyle={{ paddingBottom: 120 }}
            />
            <FAB onPress={handleOpenCreate} label="+" />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { padding: 20, alignItems: 'center' },
  groupList: { paddingVertical: 8 },
  groupLabel: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 16, borderColor: '#DDD', borderWidth: 1, backgroundColor: '#FFF' },
  selectedLabel: { backgroundColor: '#E6F0FF', borderColor: '#007AFF' },
  searchRow: { flexDirection: 'row', padding: 12, alignItems: 'center' },
  searchInput: { flex: 1, borderWidth: 1, borderColor: '#DDD', padding: 8, borderRadius: 8, marginRight: 8, minHeight: 44 },
  linkButton: { marginLeft: 8 },
  empty: { padding: 32, alignItems: 'center' },
  banner: { padding: 8, backgroundColor: '#D9534F', alignItems: 'center' },
});