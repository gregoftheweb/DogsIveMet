# Theme Infrastructure

This document describes the theme infrastructure for the Dogs I've Met app.

## Overview

The app uses React Native Paper (Material Design 3) with a custom theme layer that supports:
- Light mode
- Dark mode  
- System mode (follows device preference)

Theme mode is persisted to AsyncStorage and will be used by a future Settings screen.

## Architecture

### Theme Definitions (`/src/theme/themes.ts`)

Defines two Material Design 3 themes:

- **`lightTheme`**: Modern, clean look with iOS-style blue primary color (#007AFF)
- **`darkTheme`**: Comfortable dark mode with adjusted colors for readability

Both themes use:
- Roundness: 12px for consistent border radius
- Custom color palette optimized for Dogs I've Met branding
- Full MD3 color system (primary, secondary, tertiary, surfaces, errors, etc.)

### Theme Provider (`/src/theme/ThemeProvider.tsx`)

React context provider that:

1. **Manages theme mode state**: 'system' | 'light' | 'dark'
2. **Persists to AsyncStorage**: Key = "themeMode"
3. **Follows system preference**: When mode is 'system', uses `useColorScheme()` hook
4. **Provides active theme**: Derives the correct theme based on mode and system preference
5. **Logs theme events**: Theme:mode:loaded, Theme:mode:set

#### Usage

```tsx
import { useThemeMode } from '@/src/theme/ThemeProvider';

function MyComponent() {
  const { themeMode, setThemeMode, activeTheme } = useThemeMode();
  
  // Switch to dark mode
  setThemeMode('dark');
  
  // Follow system
  setThemeMode('system');
}
```

### Screen Container (`/src/ui/ScreenContainer.tsx`)

Consistent layout wrapper for all screens:

- SafeAreaView for proper spacing
- Centered content with max-width: 520px (responsive for square screens)
- Automatic theme background color
- Optional scroll support for forms

#### Usage

```tsx
import { ScreenContainer } from '@/src/ui/ScreenContainer';

function MyScreen() {
  return (
    <ScreenContainer scroll={true}>
      {/* Your content */}
    </ScreenContainer>
  );
}
```

### App Integration (`/app/_layout.tsx`)

The root layout wraps everything with:

1. **ThemeProvider**: Manages theme state
2. **PaperProvider**: Provides Paper components with active theme
3. **NavigationThemeProvider**: Syncs navigation with theme

The icon configuration uses MaterialCommunityIcons from Expo vector icons.

## Using Themes in Components

All screens now use the `useTheme()` hook from react-native-paper to access theme colors:

```tsx
import { useTheme, Button, Text } from 'react-native-paper';

function MyComponent() {
  const theme = useTheme();
  
  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.onBackground }}>
        This text automatically adapts to the theme!
      </Text>
      <Button mode="contained">
        This button uses theme.colors.primary
      </Button>
    </View>
  );
}
```

## Color Palette

### Light Theme
- Primary: #007AFF (iOS blue)
- Secondary: #5856D6 (purple)
- Tertiary: #34C759 (green)
- Background: #f9f9f9
- Surface: #ffffff

### Dark Theme  
- Primary: #66b3ff (light blue)
- Secondary: #9896ff (light purple)
- Tertiary: #66d98a (light green)
- Background: #000000
- Surface: #1c1c1e

## Future: Settings Toggle

The theme infrastructure is ready for a Settings screen. Simply add:

```tsx
import { useThemeMode } from '@/src/theme/ThemeProvider';
import { SegmentedButtons } from 'react-native-paper';

function SettingsScreen() {
  const { themeMode, setThemeMode } = useThemeMode();
  
  return (
    <SegmentedButtons
      value={themeMode}
      onValueChange={(value) => setThemeMode(value as 'system' | 'light' | 'dark')}
      buttons={[
        { value: 'system', label: 'System', icon: 'theme-light-dark' },
        { value: 'light', label: 'Light', icon: 'white-balance-sunny' },
        { value: 'dark', label: 'Dark', icon: 'moon-waning-crescent' },
      ]}
    />
  );
}
```

## Demo

The Me screen (`/app/me.tsx`) currently includes a theme toggle demo. This demonstrates the theme switching functionality and will be moved to a proper Settings screen in the future.

## Testing

To test theme switching:

1. Navigate to "Me" screen from home
2. Toggle between System/Light/Dark modes
3. Observe all UI elements update instantly
4. Restart app - theme preference is persisted
