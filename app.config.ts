import type { ConfigContext, ExpoConfig } from 'expo/config';
import { ios, android } from './src/ads/config.ts';

const trackingReason =
  "Your choice only changes which ads you see. Dogs I've Met is free either way, with or without tracking.";

// Keep existing app metadata in app.json; all AdMob ids live in src/ads/config.ts.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name!,
  slug: config.slug!,
  plugins: [
    ...(config.plugins ?? []),
    ['expo-tracking-transparency', { userTrackingPermission: trackingReason }],
    [
      'react-native-google-mobile-ads',
      {
        iosAppId: ios.appId,
        androidAppId: android.appId,
        userTrackingUsageDescription: trackingReason,
        skAdNetworkItems: ['cstr6suwn9.skadnetwork'],
      },
    ],
  ],
  extra: { ...config.extra, adsTest: process.env.ADS_TEST === '1' },
});
