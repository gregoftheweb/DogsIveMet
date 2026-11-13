// Keep the native ad SDK out of Metro's web dependency graph entirely.
import { Text } from 'react-native';
import { useTheme } from 'react-native-paper';

export async function startAds(): Promise<void> {}

export async function adChoicesAvailable(): Promise<boolean> {
  return false;
}

export async function showAdChoices(): Promise<void> {}

export function useAdsState(): 'off' {
  return 'off';
}

export function Banner() {
  const theme = useTheme();
  return (
    <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 11, opacity: 0.6 }}>
      ad space
    </Text>
  );
}
