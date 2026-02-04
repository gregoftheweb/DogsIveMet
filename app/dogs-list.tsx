import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import {
  Searchbar,
  Button,
  Card,
  List,
  IconButton,
  ActivityIndicator,
  Appbar,
  useTheme,
  Snackbar,
  Text,
  Paragraph,
  Surface,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Dog } from '@/src/types/Dog';
import { getMetDogs, deleteDog } from '@/src/storage/dogs';
import { logEvent, logError } from '@/src/utils/logger';
import { TopNav } from '@/src/ui/TopNav';
import { useDogCounts } from '@/src/state/DogCountsProvider';

type SortOption = 'newest' | 'oldest';

interface PendingDelete {
  dog: Dog;
  timer: ReturnType<typeof setTimeout>;
}

export default function DogsListScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { refreshCounts } = useDogCounts();
  
  // State
  const [allDogs, setAllDogs] = useState<Dog[]>([]);
  const [filteredDogs, setFilteredDogs] = useState<Dog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBreed, setSelectedBreed] = useState('All Breeds');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [refreshing, setRefreshing] = useState(false);
  const [breedModalVisible, setBreedModalVisible] = useState(false);
  const [availableBreeds, setAvailableBreeds] = useState<string[]>(['All Breeds']);
  
  // Undo state
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const pendingDeleteRef = useRef<PendingDelete | null>(null);

  // Log screen lifecycle
  useEffect(() => {
    logEvent('DogsList:screen:mount');
    return () => {
      logEvent('DogsList:screen:unmount');
      // Clean up pending delete timer on unmount
      if (pendingDeleteRef.current) {
        clearTimeout(pendingDeleteRef.current.timer);
      }
    };
  }, []);

  // Load dogs function
  const loadDogs = useCallback(async () => {
    logEvent('DogsList:load:on_focus');
    try {
      const dogs = await getMetDogs();
      setAllDogs(dogs);
      
      // Extract unique breeds
      const breeds = Array.from(new Set(dogs.map(dog => dog.breed))).sort();
      setAvailableBreeds(['All Breeds', ...breeds]);
      
      logEvent('DogsList:load:success', { count: dogs.length });
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), {
        context: 'DogsList:load:error',
      });
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadDogs();
  }, [loadDogs]);

  // Reload on focus
  useFocusEffect(
    useCallback(() => {
      loadDogs();
    }, [loadDogs])
  );

  // Filter and sort dogs whenever dependencies change
  useEffect(() => {
    let result = [...allDogs];

    // Apply breed filter
    if (selectedBreed !== 'All Breeds') {
      result = result.filter(dog => dog.breed === selectedBreed);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(dog => 
        dog.name.toLowerCase().includes(query)
      );
    }

    // Sort by date
    result.sort((a, b) => {
      const dateA = new Date(a.metAt).getTime();
      const dateB = new Date(b.metAt).getTime();
      return sortOption === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredDogs(result);
  }, [allDogs, searchQuery, selectedBreed, sortOption]);

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadDogs();
    setRefreshing(false);
  };

  // Handle search change
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    logEvent('DogsList:search:change', { queryLength: text.length });
  };

  // Handle breed selection
  const handleBreedSelect = (breed: string) => {
    setSelectedBreed(breed);
    setBreedModalVisible(false);
    logEvent('DogsList:filter:breed', { breed });
  };

  // Handle sort toggle
  const handleSortToggle = () => {
    const newSort: SortOption = sortOption === 'newest' ? 'oldest' : 'newest';
    setSortOption(newSort);
    logEvent('DogsList:sort:change', { sortOption: newSort });
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedBreed('All Breeds');
    setSortOption('newest');
  };

  // Navigate to dog profile
  const handleDogPress = (id: string) => {
    logEvent('Nav:to:DogProfile', { id });
    router.push({
      pathname: '/dog-profile',
      params: { id },
    });
  };

  // Navigate to home
  const handleHomePress = () => {
    logEvent('Nav:to:Home');
    router.push('/');
  };

  // Navigate to new dog
  const handleAddFirstDog = () => {
    logEvent('Nav:to:NewDog');
    router.push('/new-dog');
  };

  // Commit pending delete to storage
  const commitDelete = useCallback(async (dog: Dog) => {
    logEvent('DogsList:delete:commit', { id: dog.id });
    try {
      await deleteDog(dog.id);
      // Reload list from storage to ensure consistency
      await loadDogs();
      // Refresh counts after delete
      await refreshCounts();
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), {
        context: 'DogsList:delete:error',
        id: dog.id,
      });
      // On error, reload from storage and show alert
      await loadDogs();
      Alert.alert(
        'Delete Failed',
        'Could not delete the dog. The list has been refreshed.',
        [{ text: 'OK' }]
      );
    }
  }, [loadDogs, refreshCounts]);

  // Handle delete press (with long-press)
  const handleDeletePress = useCallback((dog: Dog) => {
    logEvent('DogsList:delete:press', { id: dog.id });

    Alert.alert(
      'Delete dog?',
      `Remove "${dog.name}" from your list?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // If there's already a pending delete, commit it immediately
            if (pendingDeleteRef.current) {
              clearTimeout(pendingDeleteRef.current.timer);
              commitDelete(pendingDeleteRef.current.dog);
            }

            // Remove from visible list (optimistic UI)
            setAllDogs(prev => prev.filter(d => d.id !== dog.id));

            // Set up undo timer (5 seconds)
            const timer = setTimeout(() => {
              commitDelete(dog);
              setPendingDelete(null);
              pendingDeleteRef.current = null;
            }, 5000);

            const pending = { dog, timer };
            setPendingDelete(pending);
            pendingDeleteRef.current = pending;
          },
        },
      ]
    );
  }, [commitDelete]);

  // Handle undo
  const handleUndo = useCallback(() => {
    if (!pendingDelete) return;

    logEvent('DogsList:delete:undo', { id: pendingDelete.dog.id });

    // Clear the timer
    clearTimeout(pendingDelete.timer);

    // Restore dog to list
    setAllDogs(prev => {
      const exists = prev.find(d => d.id === pendingDelete.dog.id);
      if (exists) {
        return prev; // Already in list somehow
      }
      return [...prev, pendingDelete.dog];
    });

    // Clear pending delete
    setPendingDelete(null);
    pendingDeleteRef.current = null;
    
    // Refresh counts in case it was a "my dog"
    refreshCounts();
  }, [pendingDelete, refreshCounts]);

  // Format date for display
  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Render dog row using Paper List.Item
  const renderDogRow = ({ item }: { item: Dog }) => (
    <List.Item
      title={item.name}
      description={`${item.breed} • ${formatDate(item.metAt)}`}
      left={(props) => <List.Icon {...props} icon="paw" />}
      right={(props) => <List.Icon {...props} icon="chevron-right" />}
      onPress={() => handleDogPress(item.id)}
      onLongPress={() => handleDeletePress(item)}
      delayLongPress={500}
      style={[styles.dogRow, { backgroundColor: theme.colors.surface }]}
      titleStyle={styles.dogRowTitle}
      descriptionStyle={styles.dogRowDescription}
    />
  );

  // Empty state - no dogs saved
  if (allDogs.length === 0) {
    return (
      <>
        <TopNav />
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <View style={styles.emptyContainer}>
            <Ionicons name="paw-outline" size={64} color={theme.colors.outlineVariant} />
            <Paragraph style={[styles.emptyTitle, { color: theme.colors.onSurfaceVariant }]}>
              No dogs saved yet.
            </Paragraph>
            <Button
              mode="contained"
              onPress={handleAddFirstDog}
              style={styles.emptyButton}
              icon="plus"
            >
              Add your first dog
            </Button>
          </View>

          <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outlineVariant }]}>
            <Button
              mode="contained"
              onPress={handleHomePress}
              style={styles.homeButton}
              icon="home"
            >
              Home
            </Button>
          </View>
        </View>
      </>
    );
  }

  // Empty state - no search results
  const showNoResults = filteredDogs.length === 0;

  return (
    <>
      <TopNav />
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Controls */}
      <Surface style={[styles.controls, { backgroundColor: theme.colors.surface }]}>
        {/* Search Input */}
        <Searchbar
          placeholder="Search by name"
          value={searchQuery}
          onChangeText={handleSearchChange}
          style={[styles.searchbar, { backgroundColor: theme.colors.surfaceVariant }]}
          iconColor={theme.colors.onSurfaceVariant}
          placeholderTextColor={theme.colors.onSurfaceVariant}
          inputStyle={{ color: theme.colors.onSurface }}
          accessibilityLabel="Search dogs by name"
          accessibilityHint="Enter a dog's name to filter the list"
        />

        {/* Breed Filter and Sort */}
        <View style={styles.filterRow}>
          <Button
            mode="outlined"
            onPress={() => setBreedModalVisible(true)}
            style={styles.filterButton}
            labelStyle={styles.filterButtonLabel}
            icon="filter-variant"
          >
            {selectedBreed}
          </Button>

          <Button
            mode="outlined"
            onPress={handleSortToggle}
            style={styles.sortButton}
            labelStyle={styles.filterButtonLabel}
            icon={sortOption === 'newest' ? 'arrow-down' : 'arrow-up'}
          >
            {sortOption === 'newest' ? 'Newest' : 'Oldest'}
          </Button>
        </View>
      </Surface>

      {/* List or No Results */}
      {showNoResults ? (
        <View style={styles.noResultsContainer}>
          <Ionicons name="search-outline" size={48} color={theme.colors.outlineVariant} />
          <Paragraph style={[styles.noResultsText, { color: theme.colors.onSurfaceVariant }]}>
            No matches found.
          </Paragraph>
          <Button
            mode="contained"
            onPress={handleClearFilters}
            style={styles.clearFiltersButton}
            icon="refresh"
          >
            Clear filters
          </Button>
        </View>
      ) : (
        <FlatList
          data={filteredDogs}
          renderItem={renderDogRow}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}

      {/* Undo Snackbar */}
      <Snackbar
        visible={!!pendingDelete}
        onDismiss={() => {
          // Simply hide the snackbar when swiped away
          // The timer in handleDeletePress will still auto-commit the delete
        }}
        duration={5000}
        action={{
          label: 'Undo',
          onPress: handleUndo,
          labelStyle: styles.undoActionLabel,
        }}
        style={styles.snackbar}
        wrapperStyle={styles.snackbarWrapper}
      >
        <Text style={styles.snackbarText}>
          {pendingDelete && `Deleted "${pendingDelete.dog.name}"`}
        </Text>
      </Snackbar>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outlineVariant }]}>
        <Button
          mode="contained"
          onPress={handleHomePress}
          style={styles.homeButton}
          icon="home"
        >
          Home
        </Button>
      </View>

      {/* Breed Filter Modal */}
      <Modal
        visible={breedModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBreedModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.outlineVariant }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
                Filter by Breed
              </Text>
              <IconButton
                icon="close"
                onPress={() => setBreedModalVisible(false)}
                accessibilityLabel="Close breed filter"
              />
            </View>
            <ScrollView style={styles.modalScroll}>
              {availableBreeds.map((breed) => {
                const isSelected = selectedBreed === breed;
                return (
                  <List.Item
                    key={breed}
                    title={breed}
                    onPress={() => handleBreedSelect(breed)}
                    style={[
                      styles.breedOption,
                      isSelected && styles.breedOptionSelected,
                      isSelected && { backgroundColor: theme.colors.primaryContainer },
                    ]}
                    titleStyle={[
                      styles.breedOptionText,
                      isSelected && styles.breedOptionTextSelected,
                      isSelected && { color: theme.colors.primary },
                    ]}
                    right={(props) =>
                      isSelected ? (
                        <List.Icon
                          {...props}
                          icon="check"
                          color={theme.colors.primary}
                        />
                      ) : null
                    }
                  />
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  controls: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  searchbar: {
    borderRadius: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    borderRadius: 8,
  },
  filterButtonLabel: {
    fontSize: 14,
  },
  sortButton: {
    minWidth: '30%',
    borderRadius: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  dogRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  dogRowTitle: {
    fontWeight: '600',
    fontSize: 16,
  },
  dogRowDescription: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    marginTop: 16,
    borderRadius: 8,
  },
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noResultsText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  clearFiltersButton: {
    marginTop: 16,
    borderRadius: 8,
  },
  footer: {
    borderTopWidth: 1,
    padding: 16,
  },
  homeButton: {
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalScroll: {
    maxHeight: 400,
  },
  breedOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  breedOptionSelected: {
    borderRadius: 4,
  },
  breedOptionText: {
    fontSize: 16,
  },
  breedOptionTextSelected: {
    fontWeight: '600',
  },
  snackbar: {
    margin: 16,
    borderRadius: 8,
  },
  snackbarWrapper: {
    marginHorizontal: 0,
    marginBottom: 0,
  },
  snackbarText: {
    fontSize: 14,
    marginRight: 8,
  },
  undoActionLabel: {
    fontSize: 14,
  },
});
