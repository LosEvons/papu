/**
 * Type definitions for the Communication Cards app.
 */

/** UUID string type for unique identifiers */
export type UUID = string;

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
