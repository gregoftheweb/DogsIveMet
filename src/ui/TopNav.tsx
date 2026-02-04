/**
 * TopNav - Persistent top navigation component
 * Shows three compact buttons: New Dog (green), List of Dogs, My Dog(s)
 * Replaces back arrow navigation with direct navigation to key screens
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, useTheme, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useDogCounts } from '../state/DogCountsProvider';
import { logEvent } from '../utils/logger';

export function TopNav() {
  const router = useRouter();
  const theme = useTheme();
  const { myDogsCount } = useDogCounts();

  // Smart pluralization for My Dog(s) button
  const myDogsLabel = myDogsCount === 1 ? 'My Dog' : 'My Dogs';

  const handleNewDog = () => {
    logEvent('Nav:top:new_dog');
    router.push('/new-dog');
  };

  const handleList = () => {
    logEvent('Nav:top:list');
    router.push('/dogs-list');
  };

  const handleMyDogs = () => {
    logEvent('Nav:top:my_dogs');
    router.push('/my-dogs-list');
  };

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.surface }]} elevation={1}>
      <View style={styles.buttonsRow}>
        <Button
          mode="contained"
          onPress={handleNewDog}
          style={[styles.button, styles.newDogButton, { backgroundColor: '#4CAF50' }]}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          compact
        >
          New Dog
        </Button>

        <Button
          mode="contained-tonal"
          onPress={handleList}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          compact
        >
          List of Dogs
        </Button>

        <Button
          mode="contained-tonal"
          onPress={handleMyDogs}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          compact
        >
          {myDogsLabel}
        </Button>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    minHeight: 36,
  },
  newDogButton: {
    // Green background is set inline to override theme
  },
  buttonContent: {
    height: 36,
    paddingHorizontal: 4,
  },
  buttonLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
});
