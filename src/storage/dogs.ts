import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dog } from '../types/Dog';

const DOGS_STORAGE_KEY = 'dogs';

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
