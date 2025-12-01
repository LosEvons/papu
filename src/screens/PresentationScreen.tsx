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
  StatusBar,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RootStackParamList } from '../navigation';
import { useAppData } from '../contexts/AppDataContext';
import { Card, UUID, CARD_CATEGORY_COLORS, CardCategory, CARD_CATEGORIES, CARD_CATEGORY_LABELS } from '../models/types';
import { COLORS, SPACING, BORDER_RADIUS } from '../utils/theme';

type PresentationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Presentation'>;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/** Minimum distance to detect a gesture */
const MIN_GESTURE_DISTANCE = 10;
/** Horizontal swipe threshold to trigger question mode */
const SWIPE_THRESHOLD = 50;
/** Vertical swipe threshold to close card */
const SWIPE_UP_THRESHOLD = 80;
/** Maximum vertical movement during horizontal swipe */
const VERTICAL_TOLERANCE = 50;
/** Minimum top padding for status bar */
const MIN_TOP_PADDING = 16;
/** Additional padding below safe area inset */
const TOP_BAR_PADDING = 8;
/** Margin between favorite cards in carousel */
const FAVORITE_CARD_MARGIN = 16;

/**
 * Presentation screen component.
 * Displays a single card in full-screen minimalist view with search functionality.
 */
export function PresentationScreen() {
  const navigation = useNavigation<PresentationScreenNavigationProp>();
  const { data } = useAppData();
  const insets = useSafeAreaInsets();

  const [selectedCardId, setSelectedCardId] = useState<UUID | null>(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isQuestionMode, setIsQuestionMode] = useState(false);
  const [showGestureHints, setShowGestureHints] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<CardCategory | null>(null);
  const [groupFilter, setGroupFilter] = useState<UUID | null>(null);

  // Reference for favorites carousel
  const favoritesRef = useRef<FlatList>(null);

  // Animation values for swipe feedback
  const swipeAnimX = useRef(new Animated.Value(0)).current;
  const swipeAnimY = useRef(new Animated.Value(0)).current;

  // Pan responder for swipe gestures (only applied when a card is selected via conditional spread)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Respond to both horizontal and vertical swipes
        return Math.abs(gestureState.dx) > MIN_GESTURE_DISTANCE || Math.abs(gestureState.dy) > MIN_GESTURE_DISTANCE;
      },
      onPanResponderMove: (_, gestureState) => {
        // Track horizontal swipes (right only for question mode)
        if (gestureState.dx > 0) {
          swipeAnimX.setValue(gestureState.dx);
        }
        // Track upward swipes (negative dy)
        if (gestureState.dy < 0) {
          swipeAnimY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Hide gesture hints after first interaction
        setShowGestureHints(false);
        
        // Swipe up detected - close the card
        if (gestureState.dy < -SWIPE_UP_THRESHOLD) {
          setSelectedCardId(null);
          setIsQuestionMode(false);
        }
        // Swipe right detected - toggle question mode
        else if (gestureState.dx > SWIPE_THRESHOLD && Math.abs(gestureState.dy) < VERTICAL_TOLERANCE) {
          setIsQuestionMode((prev) => !prev);
        }
        
        // Reset animations
        Animated.parallel([
          Animated.spring(swipeAnimX, {
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.spring(swipeAnimY, {
            toValue: 0,
            useNativeDriver: true,
          }),
        ]).start();
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
   * Get favorite cards for the carousel
   */
  const favoriteCards = useMemo(() => {
    return data.cards
      .filter((card) => card.favorite)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [data.cards]);

  /**
   * Filtered cards based on search query and filters
   */
  const filteredCards = useMemo(() => {
    let cards = [...data.cards];

    // Filter by category if a category filter is set
    if (categoryFilter) {
      cards = cards.filter((card) => (card.category || 'other') === categoryFilter);
    }

    // Filter by group if a group filter is set
    if (groupFilter) {
      cards = cards.filter((card) => card.groupIds.includes(groupFilter));
    }

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
  }, [data.cards, searchQuery, categoryFilter, groupFilter]);

  /**
   * Handle card selection from search results
   */
  const handleSelectCard = (cardId: UUID) => {
    setSelectedCardId(cardId);
    setIsQuestionMode(false); // Reset question mode when selecting new card
    setCategoryFilter(null); // Clear category filter
    setGroupFilter(null); // Clear group filter
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
    setCategoryFilter(null);
    setGroupFilter(null);
  };

  /**
   * Navigate to card management screen
   */
  const handleGoToManagement = () => {
    navigation.navigate('Home');
  };

  /**
   * Open search modal with group filter
   */
  const handleSelectGroup = (groupId: UUID) => {
    setGroupFilter(groupId);
    setSearchVisible(true);
  };

  /**
   * Navigate to create a new card
   */
  const handleCreateCard = () => {
    setSearchVisible(false);
    setSearchQuery('');
    setCategoryFilter(null);
    navigation.navigate('CardEdit', {});
  };

  /**
   * Open search modal with category filter
   */
  const handleSelectCategory = (category: CardCategory) => {
    setCategoryFilter(category);
    setSearchVisible(true);
  };

  /**
   * Render a search result item
   */
  const renderSearchItem = ({ item }: { item: Card }) => (
    <TouchableOpacity
      style={[
        styles.searchResultItem,
        { borderLeftColor: CARD_CATEGORY_COLORS[item.category || 'other'] },
      ]}
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent />
      {/* Top bar with manage and search buttons - with safe area insets */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, MIN_TOP_PADDING) + TOP_BAR_PADDING }]}>
        <TouchableOpacity
          style={styles.manageButton}
          onPress={handleGoToManagement}
          accessibilityLabel="Manage cards"
          accessibilityRole="button"
        >
          <Text style={styles.manageButtonText}>✏️ Manage</Text>
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
          <View
            style={[
              styles.cardDisplay,
              { borderColor: CARD_CATEGORY_COLORS[selectedCard.category || 'other'] },
            ]}
            accessibilityLabel={`Displayed card: ${selectedCard.title}${isQuestionMode ? ' (question)' : ''}. Swipe up to close. Swipe right for question mode.`}
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
            
            {/* Gesture hints overlay - shown initially */}
            {showGestureHints && (
              <View style={styles.gestureHintsOverlay}>
                {/* Swipe up hint */}
                <View style={styles.gestureHintTop}>
                  <Text style={styles.gestureHintIcon}>↑</Text>
                  <Text style={styles.gestureHintText}>Swipe up to close</Text>
                </View>
                {/* Swipe right hint */}
                <View style={styles.gestureHintRight}>
                  <Text style={styles.gestureHintIcon}>→</Text>
                  <Text style={styles.gestureHintText}>Swipe right for ?</Text>
                </View>
              </View>
            )}
          </View>
        ) : (
          <ScrollView 
            style={styles.emptyStateScroll}
            contentContainerStyle={styles.emptyState}
            showsVerticalScrollIndicator={true}
          >
            {/* Favorites carousel - only show if there are favorites */}
            {favoriteCards.length > 0 && (
              <View style={styles.favoritesContainer}>
                <Text style={styles.sectionLabel}>⭐ Favorites:</Text>
                <FlatList
                  ref={favoritesRef}
                  data={favoriteCards}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  pagingEnabled
                  snapToInterval={screenWidth * 0.7 + FAVORITE_CARD_MARGIN}
                  decelerationRate="fast"
                  contentContainerStyle={styles.favoritesCarousel}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }: { item: Card }) => {
                    const cardCategory = item.category || 'other';
                    return (
                      <TouchableOpacity
                        style={[
                          styles.favoriteCard,
                          { borderColor: CARD_CATEGORY_COLORS[cardCategory] },
                        ]}
                        onPress={() => handleSelectCard(item.id)}
                        activeOpacity={0.8}
                        accessibilityLabel={`Select favorite card: ${item.title}`}
                        accessibilityRole="button"
                      >
                        {item.imageUri ? (
                          <Image
                            source={{ uri: item.imageUri }}
                            style={styles.favoriteCardImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={[styles.favoriteCardPlaceholder, { backgroundColor: CARD_CATEGORY_COLORS[cardCategory] }]}>
                            <Text style={styles.favoriteCardPlaceholderText}>
                              {item.title.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                        )}
                        <Text style={styles.favoriteCardTitle} numberOfLines={2}>
                          {item.title}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            )}

            {/* Tap to search area */}
            <TouchableOpacity
              style={styles.tapToSearchArea}
              onPress={handleOpenSearch}
              activeOpacity={0.7}
              accessibilityLabel="Tap to search and select a card"
              accessibilityRole="button"
            >
              <Text style={styles.emptyStateText}>
                Tap here to search all cards
              </Text>
            </TouchableOpacity>

            {/* Category buttons */}
            <View style={styles.categoryButtonsContainer}>
              <Text style={styles.sectionLabel}>Browse by category:</Text>
              <View style={styles.categoryButtons}>
                {CARD_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      { backgroundColor: CARD_CATEGORY_COLORS[category] },
                    ]}
                    onPress={() => handleSelectCategory(category)}
                    accessibilityLabel={`Browse ${CARD_CATEGORY_LABELS[category]} cards`}
                    accessibilityRole="button"
                  >
                    <Text style={styles.categoryButtonText}>
                      {CARD_CATEGORY_LABELS[category]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Group buttons - only show if there are groups */}
            {data.groups.length > 0 && (
              <View style={styles.groupButtonsContainer}>
                <Text style={styles.sectionLabel}>Browse by group:</Text>
                <View style={styles.groupButtons}>
                  {data.groups.map((group) => (
                    <TouchableOpacity
                      key={group.id}
                      style={[
                        styles.groupButton,
                        { backgroundColor: group.color || '#666' },
                      ]}
                      onPress={() => handleSelectGroup(group.id)}
                      accessibilityLabel={`Browse ${group.name} cards`}
                      accessibilityRole="button"
                    >
                      <Text style={styles.groupButtonText}>
                        {group.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
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
            <Text style={styles.searchTitle}>
              {categoryFilter 
                ? CARD_CATEGORY_LABELS[categoryFilter] 
                : groupFilter 
                  ? data.groups.find(g => g.id === groupFilter)?.name || 'Group'
                  : 'Find Card'}
            </Text>
            <View style={styles.searchCloseButton} />
          </View>

          {/* Category filter indicator */}
          {categoryFilter && (
            <View style={[styles.categoryFilterBanner, { backgroundColor: CARD_CATEGORY_COLORS[categoryFilter] }]}>
              <Text style={styles.categoryFilterText}>
                Showing {CARD_CATEGORY_LABELS[categoryFilter]} cards
              </Text>
              <TouchableOpacity
                onPress={() => setCategoryFilter(null)}
                accessibilityLabel="Clear category filter"
                accessibilityRole="button"
              >
                <Text style={styles.categoryFilterClear}>✕ Clear</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Group filter indicator */}
          {groupFilter && (
            <View style={[styles.categoryFilterBanner, { backgroundColor: data.groups.find(g => g.id === groupFilter)?.color || '#666' }]}>
              <Text style={styles.categoryFilterText}>
                Showing {data.groups.find(g => g.id === groupFilter)?.name || 'Group'} cards
              </Text>
              <TouchableOpacity
                onPress={() => setGroupFilter(null)}
                accessibilityLabel="Clear group filter"
                accessibilityRole="button"
              >
                <Text style={styles.categoryFilterClear}>✕ Clear</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.searchInputContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search cards..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={!categoryFilter && !groupFilter}
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
    </View>
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
  manageButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  manageButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
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
  emptyStateScroll: {
    flex: 1,
    width: '100%',
  },
  emptyState: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingVertical: SPACING.xl,
    paddingBottom: 40,
  },
  tapToSearchArea: {
    padding: 40,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
    borderRadius: 16,
    marginBottom: 40,
  },
  emptyStateText: {
    fontSize: 20,
    color: '#888',
    textAlign: 'center',
  },
  categoryButtonsContainer: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: 120,
    alignItems: 'center',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  groupButtonsContainer: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 24,
  },
  groupButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  groupButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  groupButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  favoritesContainer: {
    width: '100%',
    marginBottom: 24,
  },
  favoritesCarousel: {
    paddingHorizontal: 16,
  },
  favoriteCard: {
    width: screenWidth * 0.7,
    marginRight: FAVORITE_CARD_MARGIN,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 3,
    padding: 12,
    alignItems: 'center',
  },
  favoriteCardImage: {
    width: screenWidth * 0.6,
    height: screenWidth * 0.4,
    borderRadius: 12,
    marginBottom: 12,
  },
  favoriteCardPlaceholder: {
    width: screenWidth * 0.6,
    height: screenWidth * 0.4,
    borderRadius: 12,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteCardPlaceholderText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#fff',
  },
  favoriteCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  categoryFilterBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  categoryFilterText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  categoryFilterClear: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
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
    borderLeftWidth: 4,
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
  gestureHintsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gestureHintTop: {
    position: 'absolute',
    top: 40,
    alignItems: 'center',
  },
  gestureHintRight: {
    position: 'absolute',
    right: 20,
    alignItems: 'center',
  },
  gestureHintIcon: {
    fontSize: 36,
    color: '#fff',
    marginBottom: 8,
  },
  gestureHintText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
});
