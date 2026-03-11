import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AquariumProvider } from './context/AquariumContext';
import { AppNavigator } from './navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AquariumProvider>
        <StatusBar style="dark" />
        <AppNavigator />
      </AquariumProvider>
    </SafeAreaProvider>
  );
}
