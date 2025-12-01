import React from 'react';
import { AppDataProvider } from './contexts/AppDataContext';
import AppNavigation from './navigation';

export default function App() {
  return (
    <AppDataProvider>
      <AppNavigation />
    </AppDataProvider>
  );
}