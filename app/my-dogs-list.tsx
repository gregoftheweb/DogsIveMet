import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
  ScrollView,
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
  FAB,
  Modal,
  Portal,
} from 'react-native-paper';
import { Dog } from '@/src/types/Dog';
import { getMyDogs } from '@/src/storage/dogs';
import { logEvent, logError } from '@/src/utils/logger';
import { TopNav } from '@/src/ui/TopNav';
import { useDogCounts } from '@/src/state/DogCountsProvider';

type SortOption = 'newest' | 'oldest';

export default function MyDogsListScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { refreshCounts } = useDogCounts();
  
  // State
  const [allMyDogs, setAllMyDogs] = useState<Dog[]>([]);
  const [filteredDogs, setFilteredDogs] = useState<Dog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBreed, setSelectedBreed] = useState('All Breeds');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [refreshing, setRefreshing] = useState(false);
  const [breedModalVisible, setBreedModalVisible] = useState(false);
  const [availableBreeds, setAvailableBreeds] = useState<string[]>(['All Breeds']);

  // Log screen lifecycle
  useEffect(() => {
    logEvent('MyDogs:screen:mount');
    return () => {
      logEvent('MyDogs:screen:unmount');
    };
  }, []);

  // Load my dogs function
  const loadMyDogs = useCallback(async () => {
    logEvent('MyDogs:load:start');
    try {
      const myDogs = await getMyDogs();
      setAllMyDogs(myDogs);
      
      // Extract unique breeds
      const breeds = Array.from(new Set(myDogs.map(dog => dog.breed))).sort();
      setAvailableBreeds(['All Breeds', ...breeds]);
      
      logEvent('MyDogs:load:success', { count: myDogs.length });
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), {
        context: 'MyDogs:load:error',
      });
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadMyDogs();
  }, [loadMyDogs]);

  // Reload on focus
  useFocusEffect(
    useCallback(() => {
      loadMyDogs();
      refreshCounts();
    }, [loadMyDogs, refreshCounts])
  );

  // Filter and sort dogs whenever dependencies change
  useEffect(() => {
    let result = [...allMyDogs];

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

    // Sort by date (use createdAt for My Dogs since these are user's own dogs)
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOption === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredDogs(result);
  }, [allMyDogs, searchQuery, selectedBreed, sortOption]);

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadMyDogs();
    setRefreshing(false);
  };

  // Handle search change
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    logEvent('MyDogs:search:change', { queryLength: text.length });
  };

  // Handle breed selection
  const handleBreedSelect = (breed: string) => {
    setSelectedBreed(breed);
    setBreedModalVisible(false);
    logEvent('MyDogs:filter:breed', { breed });
  };

  // Handle sort toggle
  const handleSortToggle = () => {
    const newSort: SortOption = sortOption === 'newest' ? 'oldest' : 'newest';
    setSortOption(newSort);
    logEvent('MyDogs:sort:change', { sortOption: newSort });
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedBreed('All Breeds');
    setSortOption('newest');
  };

  // Navigate to dog profile
  const handleDogPress = (id: string) => {
    logEvent('Nav:to:DogProfile', { id, source: 'MyDogs' });
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

  // Navigate to add my dog
  const handleAddMyDog = () => {
    logEvent('Nav:to:MyDogForm', { mode: 'create' });
    router.push({
      pathname: '/new-dog',
      params: { mode: 'create', isMine: 'true' },
    });
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

  // Render dog row with Paper List.Item
  const renderDogRow = ({ item }: { item: Dog }) => (
    <List.Item
      title={item.name}
      description={`${item.breed} • ${formatDate(item.createdAt)}`}
      left={(props) => (
        <List.Icon {...props} icon="paw" color={theme.colors.primary} />
      )}
      right={(props) => (
        <List.Icon {...props} icon="chevron-right" />
      )}
      onPress={() => handleDogPress(item.id)}
      style={{ backgroundColor: theme.colors.background }}
    />
  );

  // Empty state - no my dogs saved
  if (allMyDogs.length === 0) {
    return (
      <>
        <TopNav />
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <View style={styles.emptyContainer}>
            <IconButton
              icon="paw"
              size={64}
              iconColor={theme.colors.outline}
            />
            <Card style={[styles.emptyCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <List.Subheader style={styles.emptySubheader}>
                  No dogs added yet.
                </List.Subheader>
                <Button
                  mode="contained"
                  onPress={handleAddMyDog}
                  style={styles.emptyCardContent}
                >
                  Add My Dog
                </Button>
                <Button
                  mode="outlined"
                  onPress={handleHomePress}
                >
                  Home
                </Button>
              </Card.Content>
            </Card>
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
        <View style={[styles.controls, { backgroundColor: theme.colors.surface }]}>
        {/* Search Input */}
        <Searchbar
          placeholder="Search by name"
          onChangeText={(text) => {
            setSearchQuery(text);
            logEvent('MyDogs:search:change', { queryLength: text.length });
          }}
          value={searchQuery}
          style={styles.searchbarStyle}
        />

        {/* Breed Filter and Sort */}
        <View style={styles.filterRow}>
          <Button
            mode={selectedBreed !== 'All Breeds' ? 'contained' : 'outlined'}
            onPress={() => setBreedModalVisible(true)}
            style={{ flex: 1 }}
            compact
          >
            {selectedBreed}
          </Button>

          <Button
            mode="outlined"
            icon={sortOption === 'newest' ? 'arrow-down' : 'arrow-up'}
            onPress={handleSortToggle}
            compact
          >
            {sortOption === 'newest' ? 'Newest' : 'Oldest'}
          </Button>
        </View>
      </View>

      {/* List or No Results */}
      {showNoResults ? (
        <View style={styles.noResultsContainer}>
          <IconButton
            icon="magnify"
            size={48}
            iconColor={theme.colors.outline}
          />
          <List.Subheader style={styles.noResultsSubheader}>
            No matches found.
          </List.Subheader>
          <Button
            mode="contained"
            onPress={handleClearFilters}
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
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Breed Filter Modal using Paper's Modal and Portal */}
      <Portal>
        <Modal
          visible={breedModalVisible}
          onDismiss={() => setBreedModalVisible(false)}
          contentContainerStyle={[
            styles.modalContent,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
            <Appbar.Content title="Filter by Breed" />
            <Appbar.Action
              icon="close"
              onPress={() => setBreedModalVisible(false)}
            />
          </Appbar.Header>
          <ScrollView style={styles.modalScroll}>
            {availableBreeds.map((breed) => (
              <List.Item
                key={breed}
                title={breed}
                onPress={() => handleBreedSelect(breed)}
                left={(props) => {
                  if (selectedBreed === breed) {
                    return (
                      <List.Icon
                        {...props}
                        icon="check"
                        color={theme.colors.primary}
                      />
                    );
                  }
                  return null;
                }}
                style={{
                  backgroundColor:
                    selectedBreed === breed
                      ? theme.colors.primaryContainer
                      : theme.colors.surface,
                }}
                titleStyle={{
                  color:
                    selectedBreed === breed
                      ? theme.colors.primary
                      : theme.colors.onSurface,
                  fontWeight:
                    selectedBreed === breed ? '600' : '400',
                }}
              />
            ))}
          </ScrollView>
        </Modal>
      </Portal>

      {/* FAB for Add My Dog */}
      <FAB
        icon="plus"
        label="Add My Dog"
        onPress={handleAddMyDog}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
      />
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  controls: {
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyCard: {
    marginTop: 24,
    width: '100%',
    maxWidth: 300,
  },
  emptyCardContent: {
    marginBottom: 8,
  },
  emptySubheader: {
    textAlign: 'center',
    marginBottom: 16,
  },
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noResultsSubheader: {
    marginVertical: 16,
    textAlign: 'center',
  },
  searchbarStyle: {
    marginBottom: 12,
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalScroll: {
    maxHeight: 400,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
