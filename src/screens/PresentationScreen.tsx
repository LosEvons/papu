/**
 * Presentation screen for displaying communication cards.
 * Provides a minimalist full-screen view of a single card with search functionality.
 */

import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Dimensions,
  SafeAreaView,
  PanResponder,
  Animated,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import { RootStackParamList } from '../navigation';
import { useAppData } from '../contexts/AppDataContext';
import { Card, UUID, CARD_CATEGORY_COLORS } from '../models/types';

type PresentationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Presentation'>;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/** Swipe threshold to trigger question mode */
const SWIPE_THRESHOLD = 50;

/**
 * Presentation screen component.
 * Displays a single card in full-screen minimalist view with search functionality.
 */
export function PresentationScreen() {
  const navigation = useNavigation<PresentationScreenNavigationProp>();
  const { data } = useAppData();

  const [selectedCardId, setSelectedCardId] = useState<UUID | null>(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isQuestionMode, setIsQuestionMode] = useState(false);

  // Animation value for swipe feedback
  const swipeAnim = useRef(new Animated.Value(0)).current;

  // Pan responder for swipe gestures (only applied when a card is selected via conditional spread)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to horizontal swipes
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 50;
      },
      onPanResponderMove: (_, gestureState) => {
        // Only track rightward swipes
        if (gestureState.dx > 0) {
          swipeAnim.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          // Swipe right detected - toggle question mode
          setIsQuestionMode((prev) => !prev);
        }
        // Reset animation
        Animated.spring(swipeAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  /**
   * Get the currently selected card
   */
  const selectedCard = useMemo(() => {
    if (!selectedCardId) return null;
    return data.cards.find((card) => card.id === selectedCardId) || null;
  }, [selectedCardId, data.cards]);

  /**
   * Filtered cards based on search query
   */
  const filteredCards = useMemo(() => {
    let cards = [...data.cards];

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
  }, [data.cards, searchQuery]);

  /**
   * Handle card selection from search results
   */
  const handleSelectCard = (cardId: UUID) => {
    setSelectedCardId(cardId);
    setIsQuestionMode(false); // Reset question mode when selecting new card
    setSearchVisible(false);
    setSearchQuery('');
  };

  /**
   * Open search modal
   */
  const handleOpenSearch = () => {
    setSearchVisible(true);
  };

  /**
   * Close search modal
   */
  const handleCloseSearch = () => {
    setSearchVisible(false);
    setSearchQuery('');
  };

  /**
   * Exit presentation mode
   */
  const handleExit = () => {
    navigation.goBack();
  };

  /**
   * Clear current card selection
   */
  const handleClearCard = () => {
    setSelectedCardId(null);
    setIsQuestionMode(false);
  };

  /**
   * Navigate to create a new card
   */
  const handleCreateCard = () => {
    setSearchVisible(false);
    setSearchQuery('');
    navigation.navigate('CardEdit', {});
  };

  /**
   * Render a search result item
   */
  const renderSearchItem = ({ item }: { item: Card }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => handleSelectCard(item.id)}
      accessibilityLabel={`Select ${item.title}`}
      accessibilityRole="button"
    >
      {item.imageUri && (
        <Image source={{ uri: item.imageUri }} style={styles.searchResultImage} />
      )}
      <View style={styles.searchResultContent}>
        <Text style={styles.searchResultTitle} numberOfLines={1}>
          {item.title}
        </Text>
        {item.text && (
          <Text style={styles.searchResultText} numberOfLines={1}>
            {item.text}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar with exit and search buttons */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.topButton}
          onPress={handleExit}
          accessibilityLabel="Exit presentation mode"
          accessibilityRole="button"
        >
          <Text style={styles.topButtonText}>✕</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.topButton}
          onPress={handleOpenSearch}
          accessibilityLabel="Search for a card"
          accessibilityRole="button"
        >
          <Text style={styles.topButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Main card display area */}
      <View style={styles.cardContainer} {...(selectedCard ? panResponder.panHandlers : {})}>
        {selectedCard ? (
          <TouchableOpacity
            style={[
              styles.cardDisplay,
              { borderColor: CARD_CATEGORY_COLORS[selectedCard.category || 'other'] },
            ]}
            onPress={handleClearCard}
            activeOpacity={0.9}
            accessibilityLabel={`Displayed card: ${selectedCard.title}${isQuestionMode ? ' (question)' : ''}. Tap to clear. Swipe right to toggle question mode.`}
            accessibilityRole="button"
          >
            {selectedCard.imageUri ? (
              <Image
                source={{ uri: selectedCard.imageUri }}
                style={styles.cardImage}
                resizeMode="contain"
                accessibilityLabel="Card image"
              />
            ) : null}
            <Text style={styles.cardTitle}>{selectedCard.title}</Text>
            {selectedCard.text ? (
              <Text style={styles.cardText}>{selectedCard.text}</Text>
            ) : null}
            {/* Category indicator */}
            <View
              style={[
                styles.categoryIndicator,
                { backgroundColor: CARD_CATEGORY_COLORS[selectedCard.category || 'other'] },
              ]}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.emptyState}
            onPress={handleOpenSearch}
            activeOpacity={0.7}
            accessibilityLabel="Tap to search and select a card"
            accessibilityRole="button"
          >
            <Text style={styles.emptyStateText}>
              Tap anywhere to search and select a card
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Question mark overlay */}
      {isQuestionMode && selectedCard && (
        <View style={styles.questionOverlay} pointerEvents="none">
          <Text style={styles.questionMark}>?</Text>
        </View>
      )}

      {/* Search Modal */}
      <Modal
        visible={searchVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseSearch}
      >
        <SafeAreaView style={styles.searchModal}>
          <View style={styles.searchHeader}>
            <TouchableOpacity
              style={styles.searchCloseButton}
              onPress={handleCloseSearch}
              accessibilityLabel="Close search"
              accessibilityRole="button"
            >
              <Text style={styles.searchCloseText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.searchTitle}>Find Card</Text>
            <View style={styles.searchCloseButton} />
          </View>

          <View style={styles.searchInputContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search cards..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              accessibilityLabel="Search cards"
              accessibilityHint="Type to filter cards by title or text"
              clearButtonMode="while-editing"
              returnKeyType="search"
            />
          </View>

          <FlatList
            data={filteredCards}
            renderItem={renderSearchItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.searchResultsList}
            ListEmptyComponent={
              <View style={styles.searchEmptyContainer}>
                <Text style={styles.searchEmptyText}>
                  {searchQuery
                    ? 'No cards match your search.'
                    : 'No cards available.'}
                </Text>
                <TouchableOpacity
                  style={styles.createCardButton}
                  onPress={handleCreateCard}
                  accessibilityLabel="Create a new card"
                  accessibilityRole="button"
                >
                  <Text style={styles.createCardButtonText}>+ Create Card</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  topButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 22,
  },
  topButtonText: {
    fontSize: 20,
    color: '#fff',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  cardDisplay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderLeftWidth: 6,
    paddingLeft: 16,
  },
  cardImage: {
    width: screenWidth - 48,
    height: screenHeight * 0.5,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  cardText: {
    fontSize: 24,
    color: '#ccc',
    textAlign: 'center',
  },
  categoryIndicator: {
    position: 'absolute',
    bottom: 40,
    width: 60,
    height: 6,
    borderRadius: 3,
  },
  questionOverlay: {
    position: 'absolute',
    top: 80,
    right: 24,
    backgroundColor: 'rgba(255, 193, 7, 0.9)',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionMark: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  emptyStateText: {
    fontSize: 20,
    color: '#666',
    textAlign: 'center',
  },
  searchModal: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  searchCloseButton: {
    width: 60,
    minHeight: 44,
    justifyContent: 'center',
  },
  searchCloseText: {
    fontSize: 16,
    color: '#007AFF',
  },
  searchTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  searchInputContainer: {
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
  searchResultsList: {
    flexGrow: 1,
  },
  searchResultItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
    minHeight: 64,
    alignItems: 'center',
  },
  searchResultImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  searchResultContent: {
    flex: 1,
    justifyContent: 'center',
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  searchResultText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  searchEmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: 200,
  },
  searchEmptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  createCardButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createCardButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
