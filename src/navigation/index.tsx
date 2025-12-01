/**
 * Navigation configuration for the Communication Cards app.
 * Uses React Navigation native stack with four screens.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UUID } from '../models/types';

import { HomeScreen } from '../screens/HomeScreen';
import { CardEditScreen } from '../screens/CardEditScreen';
import { GroupsScreen } from '../screens/GroupsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { PresentationScreen } from '../screens/PresentationScreen';

/** Navigation parameter types for all screens */
export type RootStackParamList = {
  Home: undefined;
  CardEdit: { cardId?: UUID };
  Groups: undefined;
  Settings: undefined;
  Presentation: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Main navigation component with native stack navigator.
 * Presentation mode is the default/home screen.
 */
export function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Presentation">
        <Stack.Screen
          name="Presentation"
          component={PresentationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Manage Cards' }}
        />
        <Stack.Screen
          name="CardEdit"
          component={CardEditScreen}
          options={{ title: 'Edit Card' }}
        />
        <Stack.Screen
          name="Groups"
          component={GroupsScreen}
          options={{ title: 'Groups' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
