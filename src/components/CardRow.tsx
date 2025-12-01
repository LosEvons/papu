import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { Card } from '../models/types';
import { formatDate } from '../utils/format';

export default function CardRow({
  card,
  onPress,
  onToggleFavorite,
  onDelete,
}: {
  card: Card;
  onPress: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
}) {
  const handleLongPress = () => {
    Alert.alert(card.title || 'Card', undefined, [
      { text: card.favorite ? 'Unfavorite' : 'Favorite', onPress: onToggleFavorite },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete() },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <TouchableOpacity
      accessibilityLabel={`Edit card: ${card.title}`}
      style={styles.row}
      onPress={onPress}
      onLongPress={handleLongPress}
    >
      {card.imageUri ? <Image source={{ uri: card.imageUri }} style={styles.thumb} /> : <View style={styles.placeholder} />}
      <View style={styles.meta}>
        <Text style={styles.title}>{card.title}</Text>
        {card.text ? <Text style={styles.text} numberOfLines={2}>{card.text}</Text> : null}
        <Text style={styles.date}>{formatDate(card.updatedAt)}</Text>
      </View>
      <View style={styles.side}>
        <Text style={{ color: card.favorite ? '#FFAA00' : '#888' }}>{card.favorite ? '★' : '☆'}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#EEE',
    minHeight: 64,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#DDD',
  },
  placeholder: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#EEE',
  },
  meta: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  text: {
    fontSize: 14,
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  side: {
    width: 36,
    alignItems: 'center',
  },
});