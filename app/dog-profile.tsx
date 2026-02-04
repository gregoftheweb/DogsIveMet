import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import {
  Card,
  Button,
  IconButton,
  ActivityIndicator,
  Appbar,
  List,
  useTheme,
  Text,
  Surface,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Dog } from '@/src/types/Dog';
import { getDogById, deleteDog } from '@/src/storage/dogs';
import { logEvent, logError } from '@/src/utils/logger';
import { ScreenContainer } from '@/src/ui/ScreenContainer';

// Format date/time for display
function formatDateTime(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }) + ' at ' + date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function DogProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id } = params;
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [dog, setDog] = useState<Dog | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Log screen lifecycle
  useEffect(() => {
    logEvent('DogProfile:screen:mount');
    return () => {
      logEvent('DogProfile:screen:unmount');
    };
  }, []);

  // Load dog function
  const loadDog = useCallback(async () => {
    if (!id || typeof id !== 'string') {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setNotFound(false);
    logEvent('DogProfile:load:start', { id });

    try {
      const foundDog = await getDogById(id);
      
      if (foundDog) {
        setDog(foundDog);
        setNotFound(false);
        logEvent('DogProfile:load:success', { id, found: true });
      } else {
        setDog(null);
        setNotFound(true);
        logEvent('DogProfile:load:success', { id, found: false });
      }
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error(String(error)),
        { context: 'DogProfile:load:error', id }
      );
      setDog(null);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Reload on focus (also handles initial mount)
  useFocusEffect(
    useCallback(() => {
      loadDog();
    }, [loadDog])
  );

  // Handle delete
  const handleDelete = () => {
    if (!dog) return;

    Alert.alert(
      'Delete dog?',
      'This will remove the saved entry.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            logEvent('DogProfile:delete:press', { id: dog.id });
            try {
              await deleteDog(dog.id);
              logEvent('DogProfile:delete:success', { id: dog.id });
              logEvent('Nav:to:DogsList');
              router.back();
            } catch (error) {
              logError(
                error instanceof Error ? error : new Error(String(error)),
                { context: 'DogProfile:delete:error', id: dog.id }
              );
              Alert.alert(
                'Delete Failed',
                'Could not delete the dog. Please try again.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  // Handle edit
  const handleEdit = () => {
    if (!dog) return;
    logEvent('Nav:to:EditDog', { id: dog.id });
    router.push({
      pathname: '/new-dog',
      params: { mode: 'edit', id: dog.id },
    });
  };

  // Handle back to list
  const handleBackToList = () => {
    logEvent('Nav:to:DogsList');
    router.back();
  };

  // Loading state
  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.onBackground }]} variant="bodyLarge">
            Loading...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  // Not found state
  if (notFound || !dog) {
    return (
      <ScreenContainer>
        <View style={styles.centerContent}>
          <Ionicons name="paw-outline" size={64} color={theme.colors.outlineVariant} />
          <Text style={[styles.notFoundText, { color: theme.colors.onBackground }]} variant="headlineSmall">
            Dog not found.
          </Text>
          <Button
            mode="contained"
            onPress={handleBackToList}
            style={styles.notFoundButton}
          >
            Back to list
          </Button>
        </View>
      </ScreenContainer>
    );
  }

  // Main profile UI
  return (
    <ScreenContainer scroll>
      {/* Header with Appbar */}
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.BackAction onPress={handleBackToList} />
        <Appbar.Content title="Dog Profile" />
        <Appbar.Action icon="pencil" onPress={handleEdit} />
      </Appbar.Header>

      <View style={styles.contentWrapper}>
        {/* Dog Name */}
        <Text variant="displaySmall" style={[styles.dogName, { color: theme.colors.onBackground }]}>
          {dog.name}
        </Text>

        {/* Photo Card */}
        <Card style={styles.photoCard}>
          {dog.photoUri ? (
            <Card.Cover
              source={{ uri: dog.photoUri }}
              resizeMode="cover"
            />
          ) : (
            <Surface style={[styles.photoPlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Ionicons name="image-outline" size={48} color={theme.colors.outline} />
              <Text style={[styles.photoPlaceholderText, { color: theme.colors.outline }]} variant="bodyMedium">
                No photo
              </Text>
            </Surface>
          )}
        </Card>

        {/* Details Section */}
        <List.Section style={styles.detailsSection}>
          <List.Item
            title="Breed"
            description={dog.breed}
            left={(props) => <List.Icon {...props} icon="dog" />}
          />
          <List.Item
            title="Met"
            description={formatDateTime(dog.metAt)}
            left={(props) => <List.Icon {...props} icon="calendar" />}
          />
          <List.Item
            title="Where we met"
            description={dog.metLocationText || '(none)'}
            left={(props) => <List.Icon {...props} icon="map-marker" />}
          />
          <List.Item
            title="Notes"
            description={dog.notes || '(none)'}
            left={(props) => <List.Icon {...props} icon="note-text" />}
          />
        </List.Section>

        {/* Delete Button */}
        <Button
          mode="outlined"
          textColor={theme.colors.error}
          icon="trash-can-outline"
          onPress={handleDelete}
          style={styles.deleteButton}
          labelStyle={styles.deleteButtonLabel}
        >
          Delete
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
  },
  notFoundText: {
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  notFoundButton: {
    minWidth: 150,
  },
  contentWrapper: {
    paddingVertical: 16,
  },
  dogName: {
    marginBottom: 20,
    textAlign: 'center',
  },
  photoCard: {
    marginBottom: 24,
    overflow: 'hidden',
    aspectRatio: 1,
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    marginTop: 8,
  },
  detailsSection: {
    marginBottom: 32,
  },
  deleteButton: {
    marginTop: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  deleteButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
