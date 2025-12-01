/**
 * Navigation configuration for the Communication Cards app.
 * Uses React Navigation native stack with four screens.
 */

import React from 'react';
import { Platform, StatusBar as RNStatusBar, View, StyleSheet } from 'react-native';
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
 * Higher-order component that wraps a screen with safe area padding for Android edge-to-edge
 */
function withSafeAreaPadding<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function SafeAreaPaddedScreen(props: P) {
    const insets = useSafeAreaInsets();
    
    // Get the proper status bar height for Android edge-to-edge mode
    const statusBarHeight = Platform.OS === 'android' 
      ? Math.max(RNStatusBar.currentHeight || 0, insets.top)
      : 0; // iOS handles this automatically with native header
    
    return (
      <View style={[styles.safeAreaContainer, { paddingTop: statusBarHeight }]}>
        <WrappedComponent {...props} />
      </View>
    );
  };
}

// Wrapped screen components for Android edge-to-edge compatibility
const SafeHomeScreen = withSafeAreaPadding(HomeScreen);
const SafeCardEditScreen = withSafeAreaPadding(CardEditScreen);
const SafeGroupsScreen = withSafeAreaPadding(GroupsScreen);
const SafeSettingsScreen = withSafeAreaPadding(SettingsScreen);

/**
 * Main navigation component with native stack navigator.
 * Presentation mode is the default/home screen.
 */
export function AppNavigation() {
  const screenOptions: NativeStackNavigationOptions = {
    headerStyle: {
      backgroundColor: '#f5f5f5',
    },
    headerTitleStyle: {
      fontWeight: '600',
    },
  };

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
          component={SafeHomeScreen}
          options={{ 
            title: 'Manage Cards',
          }}
        />
        <Stack.Screen
          name="CardEdit"
          component={SafeCardEditScreen}
          options={{ 
            title: 'Edit Card',
          }}
        />
        <Stack.Screen
          name="Groups"
          component={SafeGroupsScreen}
          options={{ 
            title: 'Groups',
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SafeSettingsScreen}
          options={{ 
            title: 'Settings',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
