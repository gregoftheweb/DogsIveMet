import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Text, Card, useTheme } from 'react-native-paper';
import { ScreenContainer } from '@/src/ui/ScreenContainer';
import { logEvent } from '@/src/utils/logger';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <ScreenContainer scroll>
      <View style={styles.container}>
        {/* App Title */}
        <Text variant="displaySmall" style={[styles.title, { color: theme.colors.onBackground }]}>
          Dogs I've Met
        </Text>

        {/* Logo */}
        <Image
          source={require('../assets/images/DIM-Logo-150.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Navigation Buttons */}
        <View style={styles.buttonsContainer}>
          <Button
            mode="contained"
            onPress={() => router.push('/new-dog')}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            New Dog
          </Button>

          <Button
            mode="contained"
            onPress={() => router.push('/dogs-list')}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            List of Dogs
          </Button>

          <Button
            mode="contained"
            onPress={() => {
              logEvent('Nav:to:MyDogs');
              router.push('/my-dogs-list');
            }}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            My Dogs
          </Button>

          <Button
            mode="outlined"
            onPress={() => router.push('/me')}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Me
          </Button>
        </View>

        {/* Advertising Placeholder */}
        <Card style={styles.adCard} mode="outlined">
          <Card.Content>
            <Text 
              variant="bodyMedium" 
              style={[styles.adText, { color: theme.colors.onSurfaceVariant }]}
            >
              Advertising
            </Text>
          </Card.Content>
        </Card>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  title: {
    marginBottom: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 32,
  },
  buttonsContainer: {
    width: '100%',
    marginBottom: 32,
    gap: 12,
  },
  button: {
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  adCard: {
    width: '100%',
    marginTop: 8,
  },
  adText: {
    textAlign: 'center',
  },
});
