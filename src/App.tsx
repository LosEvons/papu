/**
 * Main app component for Communication Cards.
 * Bootstraps the app with data provider and navigation.
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppDataProvider } from './contexts/AppDataContext';
import { AppNavigation } from './navigation';

/**
 * Root application component.
 * Wraps the app in required providers and sets up navigation.
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <AppDataProvider>
        <AppNavigation />
        <StatusBar style="auto" />
      </AppDataProvider>
    </SafeAreaProvider>
  );
}
