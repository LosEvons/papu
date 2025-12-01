/**
 * Card row component for displaying cards in a list.
 * Shows image, title, text snippet, updatedAt, and favorite status.
 */

import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  Image,
  ActionSheetIOS,
  Platform,
  Alert,
} from 'react-native';
import { Card } from '../models/types';
import { formatDate } from '../utils/format';

/** Maximum length for text snippet preview */
const TEXT_SNIPPET_MAX_LENGTH = 50;

/** CardRow component props */
interface CardRowProps {
  /** Card data to display */
  card: Card;
  /** Callback when card row is pressed (opens edit) */
  onPress: () => void;
  /** Callback to toggle favorite status */
  onToggleFavorite: () => void;
  /** Callback to delete the card */
  onDelete: () => void;
}

/**
 * Card row component for FlatList.
 * Displays card info with image, title, text snippet, and metadata.
 * Long press shows action sheet with Toggle Favorite and Delete options.
 */
export function CardRow({ card, onPress, onToggleFavorite, onDelete }: CardRowProps) {
  /**
   * Handles long press - shows action sheet with options
   */
  const handleLongPress = () => {
    const options = [
      card.favorite ? 'Remove from Favorites' : 'Add to Favorites',
      'Delete',
      'Cancel',
    ];
    const destructiveButtonIndex = 1;
    const cancelButtonIndex = 2;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex,
          cancelButtonIndex,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            onToggleFavorite();
          } else if (buttonIndex === 1) {
            confirmDelete();
          }
        }
      );
    } else {
      // Android fallback using Alert
      Alert.alert(
        'Card Options',
        `Options for "${card.title}"`,
        [
          {
            text: card.favorite ? 'Remove from Favorites' : 'Add to Favorites',
            onPress: onToggleFavorite,
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: confirmDelete,
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ],
        { cancelable: true }
      );
    }
  };

  /**
   * Shows delete confirmation dialog
   */
  const confirmDelete = () => {
    Alert.alert(
      'Delete Card',
      `Are you sure you want to delete "${card.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ],
      { cancelable: true }
    );
  };

  // Truncate text for preview
  const textSnippet = card.text
    ? card.text.length > TEXT_SNIPPET_MAX_LENGTH
      ? `${card.text.substring(0, TEXT_SNIPPET_MAX_LENGTH)}...`
      : card.text
    : '';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={handleLongPress}
      accessibilityLabel={`Card: ${card.title}${card.favorite ? ', Favorite' : ''}`}
      accessibilityHint="Tap to edit, long press for options"
      accessibilityRole="button"
    >
      {card.imageUri && (
        <Image
          source={{ uri: card.imageUri }}
          style={styles.image}
          accessibilityLabel="Card image"
        />
      )}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {card.title}
          </Text>
          {card.favorite && (
            <Text style={styles.star} accessibilityLabel="Favorite">
              ★
            </Text>
          )}
        </View>
        {textSnippet ? (
          <Text style={styles.text} numberOfLines={2}>
            {textSnippet}
          </Text>
        ) : null}
        <Text style={styles.date}>{formatDate(card.updatedAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
    minHeight: 72,
    alignItems: 'center',
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  star: {
    fontSize: 18,
    color: '#FFD700',
    marginLeft: 8,
  },
  text: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
});
