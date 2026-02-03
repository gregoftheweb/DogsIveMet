import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  RefreshControl,
  Modal,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Dog } from '@/src/types/Dog';
import { getDogs } from '@/src/storage/dogs';
import { logEvent, logError } from '@/src/utils/logger';

type SortOption = 'newest' | 'oldest';

export default function DogsListScreen() {
  const router = useRouter();
  
  // State
  const [allDogs, setAllDogs] = useState<Dog[]>([]);
  const [filteredDogs, setFilteredDogs] = useState<Dog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBreed, setSelectedBreed] = useState('All Breeds');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [refreshing, setRefreshing] = useState(false);
  const [breedModalVisible, setBreedModalVisible] = useState(false);
  const [availableBreeds, setAvailableBreeds] = useState<string[]>(['All Breeds']);

  // Log screen lifecycle
  useEffect(() => {
    logEvent('DogsList:screen:mount');
    return () => {
      logEvent('DogsList:screen:unmount');
    };
  }, []);

  // Load dogs function
  const loadDogs = async () => {
    logEvent('DogsList:load:start');
    try {
      const dogs = await getDogs();
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
  };

  // Load on mount
  useEffect(() => {
    loadDogs();
  }, []);

  // Reload on focus
  useFocusEffect(
    useCallback(() => {
      loadDogs();
    }, [])
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

  // Format date for display
  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Render dog row
  const renderDogRow = ({ item }: { item: Dog }) => (
    <Pressable
      style={({ pressed }) => [
        styles.dogRow,
        pressed && styles.dogRowPressed,
      ]}
      onPress={() => handleDogPress(item.id)}
    >
      <View style={styles.dogRowContent}>
        <Text style={styles.dogName}>{item.name}</Text>
        <Text style={styles.dogBreed}>{item.breed}</Text>
        <Text style={styles.dogDate}>{formatDate(item.metAt)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </Pressable>
  );

  // Empty state - no dogs saved
  if (allDogs.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Dogs I've Met</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.emptyContainer}>
          <Ionicons name="paw-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No dogs saved yet.</Text>
          <Pressable
            style={({ pressed }) => [
              styles.emptyButton,
              pressed && styles.emptyButtonPressed,
            ]}
            onPress={handleAddFirstDog}
          >
            <Text style={styles.emptyButtonText}>Add your first dog</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.homeButton,
              pressed && styles.homeButtonPressed,
            ]}
            onPress={handleHomePress}
          >
            <Ionicons name="home" size={20} color="#fff" />
            <Text style={styles.homeButtonText}>Home</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Empty state - no search results
  const showNoResults = filteredDogs.length === 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Dogs I've Met</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name"
            value={searchQuery}
            onChangeText={handleSearchChange}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </Pressable>
          )}
        </View>

        {/* Breed Filter and Sort */}
        <View style={styles.filterRow}>
          <Pressable
            style={styles.filterButton}
            onPress={() => setBreedModalVisible(true)}
          >
            <Text style={styles.filterButtonText} numberOfLines={1}>
              {selectedBreed}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </Pressable>

          <Pressable
            style={styles.sortButton}
            onPress={handleSortToggle}
          >
            <Ionicons 
              name={sortOption === 'newest' ? 'arrow-down' : 'arrow-up'} 
              size={16} 
              color="#666" 
            />
            <Text style={styles.sortButtonText}>
              {sortOption === 'newest' ? 'Newest' : 'Oldest'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* List or No Results */}
      {showNoResults ? (
        <View style={styles.noResultsContainer}>
          <Ionicons name="search-outline" size={48} color="#ccc" />
          <Text style={styles.noResultsText}>No matches found.</Text>
          <Pressable
            style={({ pressed }) => [
              styles.clearFiltersButton,
              pressed && styles.clearFiltersButtonPressed,
            ]}
            onPress={handleClearFilters}
          >
            <Text style={styles.clearFiltersButtonText}>Clear filters</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filteredDogs}
          renderItem={renderDogRow}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.homeButton,
            pressed && styles.homeButtonPressed,
          ]}
          onPress={handleHomePress}
        >
          <Ionicons name="home" size={20} color="#fff" />
          <Text style={styles.homeButtonText}>Home</Text>
        </Pressable>
      </View>

      {/* Breed Filter Modal */}
      <Modal
        visible={breedModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBreedModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter by Breed</Text>
              <Pressable onPress={() => setBreedModalVisible(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </Pressable>
            </View>
            <ScrollView style={styles.modalScroll}>
              {availableBreeds.map((breed) => (
                <Pressable
                  key={breed}
                  style={({ pressed }) => [
                    styles.breedOption,
                    selectedBreed === breed && styles.breedOptionSelected,
                    pressed && styles.breedOptionPressed,
                  ]}
                  onPress={() => handleBreedSelect(breed)}
                >
                  <Text
                    style={[
                      styles.breedOptionText,
                      selectedBreed === breed && styles.breedOptionTextSelected,
                    ]}
                  >
                    {breed}
                  </Text>
                  {selectedBreed === breed && (
                    <Ionicons name="checkmark" size={24} color="#007AFF" />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSpacer: {
    width: 32,
  },
  controls: {
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  filterButtonText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    marginRight: 4,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  sortButtonText: {
    fontSize: 15,
    color: '#333',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  dogRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  dogRowPressed: {
    backgroundColor: '#f5f5f5',
  },
  dogRowContent: {
    flex: 1,
    marginRight: 12,
  },
  dogName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  dogBreed: {
    fontSize: 15,
    color: '#666',
    marginBottom: 2,
  },
  dogDate: {
    fontSize: 14,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  emptyButtonPressed: {
    backgroundColor: '#0051D5',
    transform: [{ scale: 0.98 }],
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noResultsText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  clearFiltersButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  clearFiltersButtonPressed: {
    backgroundColor: '#0051D5',
    transform: [{ scale: 0.98 }],
  },
  clearFiltersButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 16,
    backgroundColor: '#fff',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  homeButtonPressed: {
    backgroundColor: '#0051D5',
    transform: [{ scale: 0.98 }],
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalScroll: {
    maxHeight: 400,
  },
  breedOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  breedOptionSelected: {
    backgroundColor: '#f0f7ff',
  },
  breedOptionPressed: {
    backgroundColor: '#e8f4ff',
  },
  breedOptionText: {
    fontSize: 16,
    color: '#333',
  },
  breedOptionTextSelected: {
    fontWeight: '600',
    color: '#007AFF',
  },
});
