import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dog } from '../types/Dog';

const DOGS_STORAGE_KEY = 'dogs';

// Validation helpers
export function normalizeName(name: string): string {
  return name.trim();
}

export function validateDogInput(dog: {
  name: string;
  breed: string;
}): { ok: boolean; message?: string } {
  const trimmedName = normalizeName(dog.name);
  
  if (!trimmedName) {
    return { ok: false, message: 'Name is required' };
  }
  
  if (!dog.breed || !dog.breed.trim()) {
    return { ok: false, message: 'Breed is required' };
  }
  
  return { ok: true };
}

// Storage functions
export async function getDogs(): Promise<Dog[]> {
  try {
    const dogsJson = await AsyncStorage.getItem(DOGS_STORAGE_KEY);
    if (dogsJson === null) {
      return [];
    }
    return JSON.parse(dogsJson) as Dog[];
  } catch (error) {
    console.error('Error loading dogs from storage:', error);
    return [];
  }
}

export async function getDogById(id: string): Promise<Dog | undefined> {
  try {
    const dogs = await getDogs();
    return dogs.find(dog => dog.id === id);
  } catch (error) {
    console.error('Error getting dog by id:', error);
    return undefined;
  }
}

export async function addDog(dog: Dog): Promise<void> {
  try {
    const existingDogs = await getDogs();
    const updatedDogs = [...existingDogs, dog];
    await AsyncStorage.setItem(DOGS_STORAGE_KEY, JSON.stringify(updatedDogs));
  } catch (error) {
    console.error('Error saving dog to storage:', error);
    throw error;
  }
}

export async function updateDog(updated: Dog): Promise<void> {
  try {
    const dogs = await getDogs();
    const index = dogs.findIndex(dog => dog.id === updated.id);
    
    if (index === -1) {
      throw new Error(`Dog with id ${updated.id} not found`);
    }
    
    // Automatically update the updatedAt timestamp
    dogs[index] = {
      ...updated,
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(DOGS_STORAGE_KEY, JSON.stringify(dogs));
  } catch (error) {
    console.error('Error updating dog:', error);
    throw error;
  }
}

export async function deleteDog(id: string): Promise<void> {
  try {
    const dogs = await getDogs();
    const filteredDogs = dogs.filter(dog => dog.id !== id);
    await AsyncStorage.setItem(DOGS_STORAGE_KEY, JSON.stringify(filteredDogs));
  } catch (error) {
    console.error('Error deleting dog:', error);
    throw error;
  }
}
