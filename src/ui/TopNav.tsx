/**
 * TopNav - Persistent top navigation component
 * Shows four navigation destinations: Home, New Dog, List of Dogs, My Dog(s)
 * Features active-state awareness and replaces back arrow navigation
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, useTheme, Surface, IconButton, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import { useDogCounts } from '../state/DogCountsProvider';
import { logEvent } from '../utils/logger';

export function TopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const { myDogsCount } = useDogCounts();

  // Smart pluralization for My Dog(s) button
  const myDogsLabel = myDogsCount === 1 ? 'My Dog' : 'My Dogs';

  // Map pathname to active screen
  const getActiveScreen = (): string => {
    if (pathname === '/') return 'home';
    if (pathname === '/new-dog') return 'new';
    if (pathname === '/dogs-list') return 'list';
    if (pathname === '/my-dogs-list') return 'myDogs';
    return '';
  };

  const activeScreen = getActiveScreen();

  const handleHome = () => {
    logEvent('Nav:top:home');
    router.replace('/');
  };

  const handleNewDog = () => {
    logEvent('Nav:top:new_dog');
    router.replace('/new-dog');
  };

  const handleListOrMyDogs = (value: string) => {
    if (value === 'list') {
      logEvent('Nav:top:list');
      router.replace('/dogs-list');
    } else if (value === 'myDogs') {
      logEvent('Nav:top:my_dogs');
      router.replace('/my-dogs-list');
    }
  };

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: theme.colors.surface }}>
      <Surface style={[styles.container, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <View style={styles.buttonsRow}>
          {/* Home Button */}
          <IconButton
            icon="home"
            size={24}
            mode={activeScreen === 'home' ? 'contained' : 'contained-tonal'}
            onPress={handleHome}
            style={styles.homeButton}
          />

          {/* New Dog Button */}
          <Button
            mode="contained"
            onPress={handleNewDog}
            style={[
              styles.newDogButton, 
              { backgroundColor: activeScreen === 'new' ? '#388E3C' : '#4CAF50' }
            ]}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            compact
          >
            New
          </Button>

          {/* List / My Dogs Segmented Buttons */}
          <SegmentedButtons
            value={activeScreen === 'list' || activeScreen === 'myDogs' ? activeScreen : 'list'}
            onValueChange={handleListOrMyDogs}
            density="small"
            style={styles.segmentedButtons}
            buttons={[
              {
                value: 'list',
                label: 'List',
                style: styles.segmentButton,
              },
              {
                value: 'myDogs',
                label: myDogsLabel,
                style: styles.segmentButton,
              },
            ]}
          />
        </View>
      </Surface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
  },
  homeButton: {
    margin: 0,
  },
  newDogButton: {
    borderRadius: 8,
    minHeight: 40,
  },
  buttonContent: {
    height: 40,
    paddingHorizontal: 12,
  },
  buttonLabel: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '600',
  },
  segmentedButtons: {
    flex: 1,
  },
  segmentButton: {
    minHeight: 40,
  },
});
