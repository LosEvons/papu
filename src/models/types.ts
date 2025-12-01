/**
 * Type definitions for the Communication Cards app.
 */

/** UUID string type for unique identifiers */
export type UUID = string;

/** Card category types for organizing communication cards */
export type CardCategory = 'things' | 'actions' | 'describe' | 'other';

/** All available card categories */
export const CARD_CATEGORIES: CardCategory[] = ['things', 'actions', 'describe', 'other'];

/** Display labels for card categories */
export const CARD_CATEGORY_LABELS: Record<CardCategory, string> = {
  things: 'Things (Nouns)',
  actions: 'Actions (Verbs)',
  describe: 'Describe (Adjectives)',
  other: 'Other',
};

/** Colors for card categories */
export const CARD_CATEGORY_COLORS: Record<CardCategory, string> = {
  things: '#4A90D9',    // Blue for nouns
  actions: '#E67E22',   // Orange for verbs
  describe: '#27AE60',  // Green for adjectives
  other: '#9B59B6',     // Purple for other
};

/**
 * Represents a communication card with optional image and group associations.
 */
export interface Card {
  /** Unique identifier (UUID v4) */
  id: UUID;
  /** Card title (required) */
  title: string;
  /** Optional card text/description */
  text?: string;
  /** Optional image URI from expo-image-picker */
  imageUri?: string;
  /** Array of group IDs this card belongs to */
  groupIds: UUID[];
  /** Whether this card is marked as favorite */
  favorite?: boolean;
  /** Card category: things, actions, describe, or other. Defaults to 'other' if not set. */
  category?: CardCategory;
  /** ISO 8601 timestamp of card creation */
  createdAt: string;
  /** ISO 8601 timestamp of last update */
  updatedAt: string;
}

/**
 * Represents a group for organizing cards.
 */
export interface Group {
  /** Unique identifier (UUID v4) */
  id: UUID;
  /** Group name (required) */
  name: string;
  /** Optional hex color string (e.g., '#FFAA00') */
  color?: string;
  /** ISO 8601 timestamp of group creation */
  createdAt: string;
  /** ISO 8601 timestamp of last update */
  updatedAt: string;
}

/**
 * Root application data structure persisted to AsyncStorage.
 */
export interface AppData {
  /** Array of all cards */
  cards: Card[];
  /** Array of all groups */
  groups: Group[];
}
