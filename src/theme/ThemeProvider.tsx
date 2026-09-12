import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Colors, palettes } from './tokens';

export type ThemePreference = 'system' | 'light' | 'dark';
type ThemeContextValue = {
  colors: Colors;
  isDark: boolean;
  preference: ThemePreference;
  setPreference: (value: ThemePreference) => void;
};
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>('system');
  const isDark =
    preference === 'dark' ||
    (preference === 'system' && systemScheme === 'dark');
  return (
    <ThemeContext.Provider
      value={{
        colors: palettes[isDark ? 'dark' : 'light'],
        isDark,
        preference,
        setPreference,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme requires ThemeProvider');
  }
  return theme;
}
