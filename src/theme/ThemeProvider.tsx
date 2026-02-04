/**
 * ThemeProvider - Manages app-wide theme state with persistence
 * Supports 'system', 'light', and 'dark' modes
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logEvent, logError } from '@/src/utils/logger';
import { lightTheme, darkTheme } from './themes';

type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  activeTheme: typeof lightTheme | typeof darkTheme;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_MODE_STORAGE_KEY = 'themeMode';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isLoaded, setIsLoaded] = useState(false);
  const systemColorScheme = useRNColorScheme();

  // Determine the active theme based on themeMode and system preference
  const getActiveTheme = () => {
    if (themeMode === 'light') {
      return lightTheme;
    } else if (themeMode === 'dark') {
      return darkTheme;
    } else {
      // 'system' mode - follow system preference
      return systemColorScheme === 'dark' ? darkTheme : lightTheme;
    }
  };

  const activeTheme = getActiveTheme();

  // Load theme mode from storage on mount
  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const storedMode = await AsyncStorage.getItem(THEME_MODE_STORAGE_KEY);
        if (storedMode && (storedMode === 'system' || storedMode === 'light' || storedMode === 'dark')) {
          setThemeModeState(storedMode as ThemeMode);
          logEvent('Theme:mode:loaded', { themeMode: storedMode });
        } else {
          // Default to 'system' if nothing stored
          logEvent('Theme:mode:loaded', { themeMode: 'system', source: 'default' });
        }
      } catch (error) {
        logError(
          error instanceof Error ? error : new Error(String(error)),
          { context: 'Theme:mode:load:error' }
        );
        // On error, use default 'system' mode
      } finally {
        setIsLoaded(true);
      }
    };

    loadThemeMode();
  }, []);

  // Set theme mode and persist to storage
  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    logEvent('Theme:mode:set', { themeMode: mode });

    try {
      await AsyncStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error(String(error)),
        { context: 'Theme:mode:save:error', themeMode: mode }
      );
    }
  };

  const value: ThemeContextValue = {
    themeMode,
    setThemeMode,
    activeTheme,
  };

  // Don't render children until theme is loaded to avoid flash
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme mode state and setter
 * Returns: { themeMode, setThemeMode, activeTheme }
 */
export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
}
