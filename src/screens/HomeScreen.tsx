/**
 * Home screen displaying the card list with filtering and search.
 * Main entry point for browsing and managing cards.
 */

import React, { useState, useMemo, useLayoutEffect } from 'react';
import {
  View,
  FlatList,
  TextInput,
  StyleSheet,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import { RootStackParamList } from '../navigation';
import { useAppData } from '../contexts/AppDataContext';
import { Card, Group, UUID } from '../models/types';
import { FAB } from '../components/FAB';
import { GroupPill } from '../components/GroupPill';
import { CardRow } from '../components/CardRow';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

/** Filter mode for the card list */
type FilterMode = 'all' | 'favorites' | UUID;

/**
 * Home screen component.
 * Displays cards with group filtering, search, and FAB for creating new cards.
 */
export function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { data, loading, loadError, dispatch } = useAppData();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  // Add header buttons for navigation
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('Presentation')}
          style={styles.headerButton}
          accessibilityLabel="Enter presentation mode"
          accessibilityRole="button"
        >
          <Text style={styles.headerButtonText}>▶️</Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Groups')}
            style={styles.headerButton}
            accessibilityLabel="Manage groups"
            accessibilityRole="button"
          >
            <Text style={styles.headerButtonText}>Groups</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={styles.headerButton}
            accessibilityLabel="Settings"
            accessibilityRole="button"
          >
            <Text style={styles.headerButtonText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  /**
   * Filtered and sorted cards based on search query and filter mode.
   */
  const filteredCards = useMemo(() => {
    let cards = [...data.cards];

    // Apply filter mode
    if (filterMode === 'favorites') {
      cards = cards.filter((card) => card.favorite);
    } else if (filterMode !== 'all') {
      // Filter by group ID
      cards = cards.filter((card) => card.groupIds.includes(filterMode));
    }

    // Apply search filter (title and text)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      cards = cards.filter(
        (card) =>
          card.title.toLowerCase().includes(query) ||
          (card.text && card.text.toLowerCase().includes(query))
      );
    }

    // Sort by updatedAt descending (most recent first)
    cards.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return cards;
  }, [data.cards, filterMode, searchQuery]);

  /**
   * Handle toggling a card's favorite status
   */
  const handleToggleFavorite = (card: Card) => {
    dispatch({
      type: 'UPDATE_CARD',
      payload: { ...card, favorite: !card.favorite },
    });
  };

  /**
   * Handle deleting a card
   */
  const handleDeleteCard = (cardId: UUID) => {
    dispatch({ type: 'DELETE_CARD', payload: cardId });
  };

  /**
   * Navigate to card edit screen
   */
  const handleEditCard = (cardId: UUID) => {
    navigation.navigate('CardEdit', { cardId });
  };

  /**
   * Navigate to create new card
   */
  const handleCreateCard = () => {
    navigation.navigate('CardEdit', {});
  };

  /**
   * Render a card row item
   */
  const renderCardItem = ({ item }: { item: Card }) => (
    <CardRow
      card={item}
      onPress={() => handleEditCard(item.id)}
      onToggleFavorite={() => handleToggleFavorite(item)}
      onDelete={() => handleDeleteCard(item.id)}
    />
  );

  /**
   * Key extractor for FlatList
   */
  const keyExtractor = (item: Card) => item.id;

  // Show loading state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading cards...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Error banner (non-blocking) */}
      {loadError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{loadError}</Text>
        </View>
      )}

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search cards..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel="Search cards"
          accessibilityHint="Filter cards by title or text"
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
      </View>

      {/* Group filter pills */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <GroupPill
            selected={filterMode === 'all'}
            onPress={() => setFilterMode('all')}
            allLabel="All"
          />
          <GroupPill
            selected={filterMode === 'favorites'}
            onPress={() => setFilterMode('favorites')}
            allLabel="Favorites"
          />
          {data.groups.map((group: Group) => (
            <GroupPill
              key={group.id}
              group={group}
              selected={filterMode === group.id}
              onPress={() => setFilterMode(group.id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Card list */}
      <FlatList
        data={filteredCards}
        renderItem={renderCardItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'No cards match your search.'
                : filterMode === 'favorites'
                ? 'No favorite cards yet.'
                : filterMode !== 'all'
                ? 'No cards in this group.'
                : 'No cards yet. Tap + to create one!'}
            </Text>
          </View>
        }
      />

      {/* FAB for creating new card */}
      <FAB
        onPress={handleCreateCard}
        accessibilityLabel="Create new card"
        icon="+"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorBanner: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#FFE8A1',
  },
  errorText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
  },
  searchContainer: {
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  searchInput: {
    height: 44,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  filterScroll: {
    paddingHorizontal: 12,
  },
  listContent: {
    flexGrow: 1,
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
});
