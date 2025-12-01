export type UUID = string;

export interface Card {
  id: UUID;
  title: string;
  text?: string;
  imageUri?: string; // store the URI returned by expo-image-picker
  groupIds: UUID[]; // allow multiple groups
  favorite?: boolean;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface Group {
  id: UUID;
  name: string;
  color?: string; // optional hex color string like '#FFAA00'
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  cards: Card[];
  groups: Group[];
}