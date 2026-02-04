import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Dog } from '@/src/types/Dog';
import { getDogById, deleteDog } from '@/src/storage/dogs';
import { logEvent, logError } from '@/src/utils/logger';

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
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Not found state
  if (notFound || !dog) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="paw-outline" size={64} color="#ccc" />
        <Text style={styles.notFoundText}>Dog not found.</Text>
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
          onPress={handleBackToList}
        >
          <Text style={styles.backButtonText}>Back to list</Text>
        </Pressable>
      </View>
    );
  }

  // Main profile UI
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={handleBackToList}
          style={styles.headerBackButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Dog Profile</Text>
        <Pressable
          onPress={handleEdit}
          style={styles.headerEditButton}
          accessibilityLabel="Edit dog"
          accessibilityRole="button"
        >
          <Text style={styles.headerEditText}>Edit</Text>
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.contentContainer}>
          {/* Name */}
          <Text style={styles.dogName}>{dog.name}</Text>

          {/* Photo */}
          <View style={styles.photoContainer}>
            {dog.photoUri ? (
              <Image
                source={{ uri: dog.photoUri }}
                style={styles.photo}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="image-outline" size={48} color="#ccc" />
                <Text style={styles.photoPlaceholderText}>No photo</Text>
              </View>
            )}
          </View>

          {/* Details */}
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Breed:</Text>
              <Text style={styles.detailValue}>{dog.breed}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Met:</Text>
              <Text style={styles.detailValue}>{formatDateTime(dog.metAt)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Where we met:</Text>
              <Text style={styles.detailValue}>
                {dog.metLocationText || '(none)'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Notes:</Text>
              <Text style={styles.detailValue}>
                {dog.notes || '(none)'}
              </Text>
            </View>
          </View>

          {/* Delete button */}
          <Pressable
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && styles.deleteButtonPressed,
            ]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  notFoundText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonPressed: {
    backgroundColor: '#0051D5',
    transform: [{ scale: 0.98 }],
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  headerBackButton: {
    padding: 4,
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerEditButton: {
    padding: 4,
    minWidth: 60,
    alignItems: 'flex-end',
  },
  headerEditText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  contentContainer: {
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  dogName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  photoContainer: {
    width: '100%',
    aspectRatio: 1,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  photoPlaceholderText: {
    marginTop: 8,
    fontSize: 16,
    color: '#999',
  },
  detailsSection: {
    marginBottom: 32,
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  deleteButtonPressed: {
    backgroundColor: '#D32F2F',
    transform: [{ scale: 0.98 }],
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
