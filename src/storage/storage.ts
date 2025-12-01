import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData } from '../models/types';

const STORAGE_KEY = 'communication_cards_v1';

export async function loadAppData(): Promise<AppData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { cards: [], groups: [] };
    }
    const parsed = JSON.parse(raw);
    // Basic validation shape checking
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.cards) || !Array.isArray(parsed.groups)) {
      return { cards: [], groups: [] };
    }
    return parsed as AppData;
  } catch (e) {
    console.warn('Failed to load app data', e);
    // Fall back to empty state on read error
    return { cards: [], groups: [] };
  }
}

export async function saveAppData(data: AppData): Promise<void> {
  try {
    const raw = JSON.stringify(data);
    await AsyncStorage.setItem(STORAGE_KEY, raw);
  } catch (e) {
    console.warn('Failed to save app data', e);
    // No throwing — keep UI alive; persistence failed but app should continue
  }
}