import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function DogProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id } = params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dog Profile</Text>
      {id && (
        <Text style={styles.idText}>ID: {id}</Text>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={() => router.back()}
      >
        <Text style={styles.buttonText}>Back to Home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  idText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
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
    fontSize: 16,
    fontWeight: '600',
  },
});
