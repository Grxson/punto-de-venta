import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppContextProvider } from './src/contexts/AppContextProvider';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContextProvider>
        <RootNavigator />
      </AppContextProvider>
    </SafeAreaProvider>
  );
}