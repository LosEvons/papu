/**
 * Navigation configuration for the Communication Cards app.
 * Uses React Navigation native stack with four screens.
 */

import React from 'react';
import { Platform, StatusBar as RNStatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
 * Custom theme with safe area aware header styles
 */
function useNavigatorTheme() {
  const insets = useSafeAreaInsets();
  
  // Get the status bar height for Android edge-to-edge mode
  const statusBarHeight = Platform.OS === 'android' 
    ? Math.max(RNStatusBar.currentHeight || 0, insets.top)
    : insets.top;

  const screenOptions: NativeStackNavigationOptions = {
    headerStyle: {
      backgroundColor: '#f5f5f5',
    },
    headerTitleStyle: {
      fontWeight: '600',
    },
  };

  return { screenOptions, statusBarHeight };
}

/**
 * Main navigation component with native stack navigator.
 * Presentation mode is the default/home screen.
 */
export function AppNavigation() {
  const { screenOptions, statusBarHeight } = useNavigatorTheme();

  // Create a wrapper style for screens that need status bar offset on Android
  const screenContentStyle = Platform.OS === 'android' && statusBarHeight > 0
    ? { paddingTop: statusBarHeight }
    : undefined;

  return (
    <NavigationContainer theme={DefaultTheme}>
      <Stack.Navigator 
        initialRouteName="Presentation"
        screenOptions={screenOptions}
      >
        <Stack.Screen
          name="Presentation"
          component={PresentationScreen}
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ 
            title: 'Manage Cards',
            contentStyle: screenContentStyle,
          }}
        />
        <Stack.Screen
          name="CardEdit"
          component={CardEditScreen}
          options={{ 
            title: 'Edit Card',
            contentStyle: screenContentStyle,
          }}
        />
        <Stack.Screen
          name="Groups"
          component={GroupsScreen}
          options={{ 
            title: 'Groups',
            contentStyle: screenContentStyle,
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ 
            title: 'Settings',
            contentStyle: screenContentStyle,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
