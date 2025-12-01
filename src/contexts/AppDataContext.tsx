/**
 * Application data context providing state management via reducer.
 * Handles loading, saving, and all CRUD operations for cards and groups.
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { AppData, Card, Group, UUID } from '../models/types';
import { loadAppData, saveAppData } from '../storage/storage';
import { useDebouncedEffect } from '../hooks/useDebouncedEffect';

/** Debounce delay for saving to AsyncStorage (in milliseconds) */
const SAVE_DEBOUNCE_DELAY_MS = 300;

// Action Types
type AppAction =
  | { type: 'LOAD_DATA'; payload: AppData }
  | { type: 'ADD_CARD'; payload: Card }
  | { type: 'UPDATE_CARD'; payload: Card }
  | { type: 'DELETE_CARD'; payload: UUID }
  | { type: 'ADD_GROUP'; payload: Group }
  | { type: 'UPDATE_GROUP'; payload: Group }
  | { type: 'DELETE_GROUP'; payload: UUID }
  | { type: 'IMPORT_DATA'; payload: { data: AppData; merge: boolean } }
  | { type: 'RESET_DATA' };

/**
 * Reducer for managing application state.
 * Handles all CRUD operations with proper timestamp management.
 */
function appReducer(state: AppData, action: AppAction): AppData {
  const now = new Date().toISOString();

  switch (action.type) {
    case 'LOAD_DATA':
      return action.payload;

    case 'ADD_CARD':
      return {
        ...state,
        cards: [...state.cards, { ...action.payload, createdAt: now, updatedAt: now }],
      };

    case 'UPDATE_CARD':
      return {
        ...state,
        cards: state.cards.map((card) =>
          card.id === action.payload.id
            ? { ...action.payload, createdAt: card.createdAt, updatedAt: now }
            : card
        ),
      };

    case 'DELETE_CARD':
      return {
        ...state,
        cards: state.cards.filter((card) => card.id !== action.payload),
      };

    case 'ADD_GROUP':
      return {
        ...state,
        groups: [...state.groups, { ...action.payload, createdAt: now, updatedAt: now }],
      };

    case 'UPDATE_GROUP':
      return {
        ...state,
        groups: state.groups.map((group) =>
          group.id === action.payload.id
            ? { ...action.payload, createdAt: group.createdAt, updatedAt: now }
            : group
        ),
      };

    case 'DELETE_GROUP': {
      const groupId = action.payload;
      // Remove deleted group ID from all cards
      const updatedCards = state.cards.map((card) => ({
        ...card,
        groupIds: card.groupIds.filter((id) => id !== groupId),
        updatedAt: card.groupIds.includes(groupId) ? now : card.updatedAt,
      }));
      return {
        ...state,
        cards: updatedCards,
        groups: state.groups.filter((group) => group.id !== groupId),
      };
    }

    case 'IMPORT_DATA': {
      const { data, merge } = action.payload;
      if (!merge) {
        // Replace: use imported data directly
        return data;
      }
      // Merge: combine existing and imported data
      const existingCardIds = new Set(state.cards.map((c) => c.id));
      const existingGroupIds = new Set(state.groups.map((g) => g.id));

      const newCards = data.cards.filter((c) => !existingCardIds.has(c.id));
      const newGroups = data.groups.filter((g) => !existingGroupIds.has(g.id));

      return {
        cards: [...state.cards, ...newCards],
        groups: [...state.groups, ...newGroups],
      };
    }

    case 'RESET_DATA':
      return { cards: [], groups: [] };

    default:
      return state;
  }
}

/** Context value type */
interface AppDataContextValue {
  data: AppData;
  loading: boolean;
  loadError: string | null;
  dispatch: React.Dispatch<AppAction>;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

/**
 * Provider component for app data context.
 * Handles initial data loading and auto-saves on state changes.
 */
export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, { cards: [], groups: [] });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const isInitialLoadRef = useRef(true);
  const hasLoadedRef = useRef(false);

  // Load data on mount
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await loadAppData();
        if (mounted) {
          dispatch({ type: 'LOAD_DATA', payload: data });
          hasLoadedRef.current = true;
        }
      } catch (error) {
        console.error('Failed to load app data:', error);
        if (mounted) {
          setLoadError('Failed to load local data — starting fresh');
          dispatch({ type: 'LOAD_DATA', payload: { cards: [], groups: [] } });
          hasLoadedRef.current = true;
        }
      } finally {
        if (mounted) {
          setLoading(false);
          isInitialLoadRef.current = false;
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  // Save data on state changes with debounce (skip initial load)
  useDebouncedEffect(
    () => {
      // Don't save during initial load or before first load completes
      if (isInitialLoadRef.current || !hasLoadedRef.current) {
        return;
      }

      saveAppData(state).catch((error) => {
        console.error('Failed to save app data:', error);
      });
    },
    [state],
    SAVE_DEBOUNCE_DELAY_MS
  );

  const contextValue: AppDataContextValue = {
    data: state,
    loading,
    loadError,
    dispatch,
  };

  return (
    <AppDataContext.Provider value={contextValue}>
      {children}
    </AppDataContext.Provider>
  );
}

/**
 * Hook to access app data context.
 * Must be used within an AppDataProvider.
 *
 * @returns AppDataContextValue with data, loading, loadError, and dispatch
 */
export function useAppData(): AppDataContextValue {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}
