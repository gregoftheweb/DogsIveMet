import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Text, useTheme } from 'react-native-paper';
import { ScreenContainer } from '@/src/ui/ScreenContainer';

export default function MeScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
          Me Screen
        </Text>

        <Button
          mode="contained"
          onPress={() => router.back()}
          style={styles.button}
        >
          Back to Home
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 32,
    fontWeight: 'bold',
  },
  button: {
    borderRadius: 10,
  },
});
