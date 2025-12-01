/**
 * Storage utilities for persisting app data to AsyncStorage.
 * Data is stored under the key "communication_cards_v1".
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData } from '../models/types';

/** AsyncStorage key for persisting app data */
export const STORAGE_KEY = 'communication_cards_v1';

/**
 * Default empty app data state.
 */
const defaultAppData: AppData = {
  cards: [],
  groups: [],
};

/**
 * Loads app data from AsyncStorage.
 * Returns parsed AppData or default empty state on missing data or parse error.
 *
 * @returns Promise resolving to AppData
 */
export async function loadAppData(): Promise<AppData> {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (jsonValue === null) {
      return defaultAppData;
    }
    const parsed = JSON.parse(jsonValue) as AppData;
    // Basic validation - ensure arrays exist
    if (!Array.isArray(parsed.cards) || !Array.isArray(parsed.groups)) {
      return defaultAppData;
    }
    return parsed;
  } catch (error) {
    // Return default state on any error (parse error, storage error, etc.)
    console.error('Error loading app data:', error);
    return defaultAppData;
  }
}

/**
 * Saves app data to AsyncStorage.
 * Serializes the full AppData object to JSON and persists it.
 *
 * @param data - The AppData to persist
 */
export async function saveAppData(data: AppData): Promise<void> {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving app data:', error);
    throw error;
  }
}
