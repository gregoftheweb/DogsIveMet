import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from 'expo-router/react-navigation';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Banner, startAds } from '@/src/ads/ads';
import 'react-native-reanimated';
import { PaperProvider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useColorScheme } from '@/components/useColorScheme';
import { AnimatedSplashOverlay } from '@/components/AnimatedSplashOverlay';
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
  const [splashFinished, setSplashFinished] = useState(false);
  const finishSplash = useCallback(() => setSplashFinished(true), []);

  useEffect(() => {
    if (splashFinished) void startAds();
  }, [splashFinished]);

  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  return (
    <ThemeProvider>
      <DogCountsProvider>
        {loaded ? <RootLayoutNav /> : null}
        <AnimatedSplashOverlay onFinished={finishSplash} />
      </DogCountsProvider>
    </ThemeProvider>
  );
}

function RootLayoutNav() {
  const insets = useSafeAreaInsets();
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
        <View style={{ flex: 1, backgroundColor: activeTheme.colors.background }}>
          <View style={{ flex: 1 }}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="new-dog" options={{ headerShown: false }} />
              <Stack.Screen name="dogs-list" options={{ headerShown: false }} />
              <Stack.Screen name="dog-profile" options={{ headerShown: false }} />
              <Stack.Screen name="my-dog" options={{ headerShown: false }} />
              <Stack.Screen name="settings" options={{ headerShown: false }} />
              <Stack.Screen name="my-dogs-list" options={{ headerShown: false }} />
            </Stack>
          </View>
          <View style={{ alignItems: 'center', paddingBottom: insets.bottom }}>
            <View
              style={{ width: 320, height: 50, alignItems: 'center', justifyContent: 'center' }}
            >
              <Banner />
            </View>
          </View>
        </View>
      </NavigationThemeProvider>
    </PaperProvider>
  );
}
