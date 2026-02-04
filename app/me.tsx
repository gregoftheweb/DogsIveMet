import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Text, useTheme, SegmentedButtons } from 'react-native-paper';
import { ScreenContainer } from '@/src/ui/ScreenContainer';
import { TopNav } from '@/src/ui/TopNav';
import { useThemeMode } from '@/src/theme/ThemeProvider';

export default function MeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { themeMode, setThemeMode } = useThemeMode();

  return (
    <>
      <TopNav />
      <ScreenContainer>
      <View style={styles.container}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
          Me Screen
        </Text>

        {/* Theme Toggle Demo */}
        <View style={styles.themeSection}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Theme Mode
          </Text>
          <SegmentedButtons
            value={themeMode}
            onValueChange={(value) => setThemeMode(value as 'system' | 'light' | 'dark')}
            buttons={[
              { value: 'system', label: 'System' },
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
            style={styles.segmentedButtons}
          />
          <Text 
            variant="bodySmall" 
            style={[styles.themeHint, { color: theme.colors.onSurfaceVariant }]}
          >
            This demonstrates the theme infrastructure. A Settings screen would contain this toggle in the final app.
          </Text>
        </View>

        <Button
          mode="contained"
          onPress={() => router.back()}
          style={styles.button}
        >
          Back to Home
        </Button>
      </View>
    </ScreenContainer>
    </>
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
  themeSection: {
    width: '100%',
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  segmentedButtons: {
    marginBottom: 12,
  },
  themeHint: {
    textAlign: 'center',
    marginTop: 8,
  },
  button: {
    borderRadius: 10,
  },
});
