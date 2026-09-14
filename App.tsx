import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initializeDatabase } from './src/database/connection';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/theme/ThemeProvider';

export default function App() {
  useEffect(() => {
    initializeDatabase().catch(error => {
      console.error('Pokretanje lokalne baze nije uspjelo.', error);
    });
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}