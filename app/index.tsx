import React from 'react';
import { StyleSheet, View, Text, Image, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { logEvent } from '@/src/utils/logger';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* App Title */}
      <Text style={styles.title}>Dogs I've Met</Text>

      {/* Logo */}
      <Image
        source={require('../assets/images/DIM-Logo-150.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Navigation Buttons */}
      <View style={styles.buttonsContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push('/new-dog')}
        >
          <Text style={styles.buttonText}>New Dog</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push('/dogs-list')}
        >
          <Text style={styles.buttonText}>List of Dogs</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => {
            logEvent('Nav:to:MyDogs');
            router.push('/my-dogs-list');
          }}
        >
          <Text style={styles.buttonText}>My Dogs</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push('/me')}
        >
          <Text style={styles.buttonText}>Me</Text>
        </Pressable>
      </View>

      {/* Advertising Placeholder */}
      <View style={styles.adContainer}>
        <Text style={styles.adText}>Advertising</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 40,
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonPressed: {
    backgroundColor: '#0051D5',
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  adContainer: {
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  adText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});
