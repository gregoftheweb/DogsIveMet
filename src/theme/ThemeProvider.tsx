/**
 * ThemeProvider - Manages app-wide theme state with persistence
 * Supports 'system', 'light', and 'dark' modes
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logEvent, logError } from '@/src/utils/logger';
import { lightTheme, darkTheme, applyAccent, AccentColor, DEFAULT_ACCENT } from './themes';

type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  accentColor: AccentColor;
  setAccentColor: (accent: AccentColor) => void;
  activeTheme: typeof lightTheme | typeof darkTheme;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_MODE_STORAGE_KEY = 'themeMode';
const ACCENT_COLOR_STORAGE_KEY = 'accentColor';
const VALID_ACCENT_COLORS: AccentColor[] = ['tron', 'mclaren', 'ferrari', 'lambo'];

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [accentColor, setAccentColorState] = useState<AccentColor>(DEFAULT_ACCENT);
  const [isLoaded, setIsLoaded] = useState(false);
  const systemColorScheme = useRNColorScheme();

  // Determine the base light/dark theme from themeMode and system preference
  const getBaseTheme = () => {
    if (themeMode === 'light') {
      return lightTheme;
    } else if (themeMode === 'dark') {
      return darkTheme;
    } else {
      // 'system' mode - follow system preference
      return systemColorScheme === 'dark' ? darkTheme : lightTheme;
    }
  };

  // Highlight color is independent of light/dark/system mode
  const activeTheme = applyAccent(getBaseTheme(), accentColor);

  // Load theme mode + accent color from storage on mount
  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const storedMode = await AsyncStorage.getItem(THEME_MODE_STORAGE_KEY);
        if (
          storedMode &&
          (storedMode === 'system' || storedMode === 'light' || storedMode === 'dark')
        ) {
          setThemeModeState(storedMode as ThemeMode);
          logEvent('Theme:mode:loaded', { themeMode: storedMode });
        } else {
          // Default to 'system' if nothing stored
          logEvent('Theme:mode:loaded', { themeMode: 'system', source: 'default' });
        }
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)), {
          context: 'Theme:mode:load:error',
        });
        // On error, use default 'system' mode
      }
    };

    const loadAccentColor = async () => {
      try {
        const storedAccent = await AsyncStorage.getItem(ACCENT_COLOR_STORAGE_KEY);
        if (storedAccent && VALID_ACCENT_COLORS.includes(storedAccent as AccentColor)) {
          setAccentColorState(storedAccent as AccentColor);
          logEvent('Theme:accent:loaded', { accentColor: storedAccent });
        } else {
          logEvent('Theme:accent:loaded', { accentColor: DEFAULT_ACCENT, source: 'default' });
        }
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)), {
          context: 'Theme:accent:load:error',
        });
        // On error, use default accent color
      }
    };

    Promise.all([loadThemeMode(), loadAccentColor()]).finally(() => setIsLoaded(true));
  }, []);

  // Set theme mode and persist to storage
  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    logEvent('Theme:mode:set', { themeMode: mode });

    try {
      await AsyncStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), {
        context: 'Theme:mode:save:error',
        themeMode: mode,
      });
    }
  };

  // Set accent (highlight) color and persist to storage
  const setAccentColor = async (accent: AccentColor) => {
    setAccentColorState(accent);
    logEvent('Theme:accent:set', { accentColor: accent });

    try {
      await AsyncStorage.setItem(ACCENT_COLOR_STORAGE_KEY, accent);
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), {
        context: 'Theme:accent:save:error',
        accentColor: accent,
      });
    }
  };

  const value: ThemeContextValue = {
    themeMode,
    accentColor,
    setAccentColor,
    setThemeMode,
    activeTheme,
  };

  // Don't render children until theme is loaded to avoid flash
  if (!isLoaded) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
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
