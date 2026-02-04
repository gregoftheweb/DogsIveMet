/**
 * Theme definitions for React Native Paper
 * Material Design 3 themes with custom colors for Dogs I've Met
 */

import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

/**
 * Light theme - modern, clean look with strong primary color
 */
export const lightTheme = {
  ...MD3LightTheme,
  roundness: 12,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#007AFF',
    primaryContainer: '#e6f2ff',
    secondary: '#5856D6',
    secondaryContainer: '#ebe9ff',
    tertiary: '#34C759',
    tertiaryContainer: '#e6f7ea',
    surface: '#ffffff',
    surfaceVariant: '#f5f5f7',
    background: '#f9f9f9',
    error: '#FF3B30',
    errorContainer: '#ffe6e4',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#001a33',
    onSecondary: '#ffffff',
    onSecondaryContainer: '#1a1a4d',
    onTertiary: '#ffffff',
    onTertiaryContainer: '#0d3319',
    onSurface: '#1c1c1e',
    onSurfaceVariant: '#636366',
    onBackground: '#1c1c1e',
    onError: '#ffffff',
    onErrorContainer: '#4d0d0a',
    outline: '#d1d1d6',
    outlineVariant: '#e5e5ea',
    inverseSurface: '#2c2c2e',
    inverseOnSurface: '#f2f2f7',
    inversePrimary: '#66b3ff',
    shadow: '#000000',
    scrim: '#000000',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
};

/**
 * Dark theme - comfortable for low-light viewing
 */
export const darkTheme = {
  ...MD3DarkTheme,
  roundness: 12,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#66b3ff',
    primaryContainer: '#004080',
    secondary: '#9896ff',
    secondaryContainer: '#3a3880',
    tertiary: '#66d98a',
    tertiaryContainer: '#1a6633',
    surface: '#1c1c1e',
    surfaceVariant: '#2c2c2e',
    background: '#000000',
    error: '#ff6961',
    errorContainer: '#660000',
    onPrimary: '#003366',
    onPrimaryContainer: '#cce6ff',
    onSecondary: '#2e2d66',
    onSecondaryContainer: '#dddcff',
    onTertiary: '#0d3319',
    onTertiaryContainer: '#c2f0d1',
    onSurface: '#f2f2f7',
    onSurfaceVariant: '#aeaeb2',
    onBackground: '#f2f2f7',
    onError: '#4d0000',
    onErrorContainer: '#ffc2c0',
    outline: '#636366',
    outlineVariant: '#3a3a3c',
    inverseSurface: '#f2f2f7',
    inverseOnSurface: '#1c1c1e',
    inversePrimary: '#007AFF',
    shadow: '#000000',
    scrim: '#000000',
    backdrop: 'rgba(0, 0, 0, 0.6)',
  },
};
