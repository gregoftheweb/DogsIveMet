import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Text, useTheme, SegmentedButtons } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@/src/ui/ScreenContainer';
import { TopNav } from '@/src/ui/TopNav';
import { useThemeMode } from '@/src/theme/ThemeProvider';
import { ACCENT_COLORS, AccentColor } from '@/src/theme/themes';

const ACCENT_ORDER: AccentColor[] = ['tron', 'mclaren', 'ferrari', 'lambo'];

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { themeMode, setThemeMode, accentColor, setAccentColor } = useThemeMode();

  return (
    <>
      <TopNav />
      <ScreenContainer>
        <View style={styles.container}>
          <Text
            variant="headlineMedium"
            style={[styles.title, { color: theme.colors.onBackground }]}
          >
            Settings
          </Text>

          {/* Theme Mode */}
          <View style={styles.section}>
            <Text
              variant="titleMedium"
              style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
            >
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
          </View>

          {/* Highlight Color */}
          <View style={styles.section}>
            <Text
              variant="titleMedium"
              style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
            >
              Highlight Color
            </Text>
            <View style={styles.swatchRow}>
              {ACCENT_ORDER.map((key) => {
                const definition = ACCENT_COLORS[key];
                const isSelected = accentColor === key;
                return (
                  <Pressable
                    key={key}
                    onPress={() => setAccentColor(key)}
                    accessibilityRole="button"
                    accessibilityLabel={`Use ${definition.label} highlight color`}
                    accessibilityState={{ selected: isSelected }}
                    style={styles.swatchWrapper}
                  >
                    <View
                      style={[
                        styles.swatch,
                        { backgroundColor: definition.color },
                        isSelected && [
                          styles.swatchSelected,
                          { borderColor: theme.colors.onBackground },
                        ],
                      ]}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={22} color={definition.onColor} />
                      )}
                    </View>
                    <Text
                      variant="bodySmall"
                      style={[styles.swatchLabel, { color: theme.colors.onSurfaceVariant }]}
                    >
                      {definition.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Button mode="contained" onPress={() => router.back()} style={styles.button}>
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
  section: {
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
  swatchRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  swatchWrapper: {
    alignItems: 'center',
    gap: 6,
  },
  swatch: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchSelected: {
    borderWidth: 3,
  },
  swatchLabel: {
    textAlign: 'center',
  },
  button: {
    borderRadius: 10,
  },
});
