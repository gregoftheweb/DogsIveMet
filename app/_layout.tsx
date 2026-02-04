import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { PaperProvider, configureFonts } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useColorScheme } from '@/components/useColorScheme';
import { ThemeProvider, useThemeMode } from '@/src/theme/ThemeProvider';
import { DogCountsProvider } from '@/src/state/DogCountsProvider';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <DogCountsProvider>
        <RootLayoutNav />
      </DogCountsProvider>
    </ThemeProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { activeTheme } = useThemeMode();

  return (
    <PaperProvider 
      theme={activeTheme}
      settings={{
        icon: (props) => <MaterialCommunityIcons {...props} />,
      }}
    >
      <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="new-dog" options={{ headerShown: false }} />
          <Stack.Screen name="dogs-list" options={{ headerShown: false }} />
          <Stack.Screen name="dog-profile" options={{ headerShown: false }} />
          <Stack.Screen name="my-dog" options={{ headerShown: false }} />
          <Stack.Screen name="me" options={{ headerShown: false }} />
          <Stack.Screen name="my-dogs-list" options={{ headerShown: false }} />
        </Stack>
      </NavigationThemeProvider>
    </PaperProvider>
  );
}
