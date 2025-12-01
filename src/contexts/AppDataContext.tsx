import React, { createContext, useContext, useEffect, useReducer, useState } from 'react';
import { AppData, Card, Group } from '../models/types';
import { loadAppData, saveAppData } from '../storage/storage';
import { v4 as uuidv4 } from 'uuid';
import { useDebouncedEffect } from '../hooks/useDebouncedEffect';

type Action =
  | { type: 'LOAD_DATA'; payload: AppData }
  | { type: 'ADD_CARD'; payload: Card }
  | { type: 'UPDATE_CARD'; payload: Card }
  | { type: 'DELETE_CARD'; payload: { id: string } }
  | { type: 'ADD_GROUP'; payload: Group }
  | { type: 'UPDATE_GROUP'; payload: Group }
  | { type: 'DELETE_GROUP'; payload: { id: string } }
  | { type: 'IMPORT_DATA'; payload: { appData: AppData; mode: 'merge' | 'replace' } }
  | { type: 'RESET_DATA' };

const initialState: AppData = { cards: [], groups: [] };

function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'LOAD_DATA':
      return action.payload;
    case 'ADD_CARD': {
      const incoming = action.payload;
      // enforce id unique and timestamps
      const id = incoming.id || uuidv4();
      const now = new Date().toISOString();
      const card: Card = {
        ...incoming,
        id,
        createdAt: now,
        updatedAt: now,
      };
      return { ...state, cards: [...state.cards, card] };
    }
    case 'UPDATE_CARD': {
      const updated = action.payload;
      const now = new Date().toISOString();
      return {
        ...state,
        cards: state.cards.map((c) => (c.id === updated.id ? { ...updated, updatedAt: now } : c)),
      };
    }
    case 'DELETE_CARD': {
      const id = action.payload.id;
      return { ...state, cards: state.cards.filter((c) => c.id !== id) };
    }
    case 'ADD_GROUP': {
      const incoming = action.payload;
      const id = incoming.id || uuidv4();
      const now = new Date().toISOString();
      const group: Group = { ...incoming, id, createdAt: now, updatedAt: now };
      return { ...state, groups: [...state.groups, group] };
    }
    case 'UPDATE_GROUP': {
      const updated = action.payload;
      const now = new Date().toISOString();
      return {
        ...state,
        groups: state.groups.map((g) => (g.id === updated.id ? { ...updated, updatedAt: now } : g)),
      };
    }
    case 'DELETE_GROUP': {
      const id = action.payload.id;
      const groups = state.groups.filter((g) => g.id !== id);
      const cards = state.cards.map((c) => ({ ...c, groupIds: c.groupIds.filter((gid) => gid !== id) }));
      return { groups, cards };
    }
    case 'IMPORT_DATA': {
      const { appData, mode } = action.payload;
      if (mode === 'replace') {
        return { cards: appData.cards || [], groups: appData.groups || [] };
      } else {
        // merge: incoming override existing by id; add new ones
        const groupMap = new Map<string, Group>();
        state.groups.forEach((g) => groupMap.set(g.id, g));
        (appData.groups || []).forEach((g) => groupMap.set(g.id, { ...g }));
        const mergedGroups = Array.from(groupMap.values());

        const cardMap = new Map<string, Card>();
        state.cards.forEach((c) => cardMap.set(c.id, c));
        (appData.cards || []).forEach((c) => cardMap.set(c.id, { ...c }));
        const mergedCards = Array.from(cardMap.values());

        return { cards: mergedCards, groups: mergedGroups };
      }
    }
    case 'RESET_DATA':
      return { cards: [], groups: [] };
    default:
      return state;
  }
}

interface AppContextShape {
  data: AppData;
  loading: boolean;
  loadError: boolean;
  dispatch: React.Dispatch<Action>;
}

const AppDataContext = createContext<AppContextShape | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, dispatch] = useReducer(reducer, initialState);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const loaded = await loadAppData();
        if (!mounted) return;
        dispatch({ type: 'LOAD_DATA', payload: loaded });
      } catch (e) {
        console.warn('Error loading app data', e);
        setLoadError(true);
        dispatch({ type: 'LOAD_DATA', payload: initialState });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist data on change with debounce 300ms
  useDebouncedEffect(
    () => {
      // Save full app data
      saveAppData(data).catch((e) => {
        console.warn('Failed to persist data', e);
      });
    },
    [data],
    300,
  );

  return <AppDataContext.Provider value={{ data, loading, loadError, dispatch }}>{children}</AppDataContext.Provider>;
};

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}