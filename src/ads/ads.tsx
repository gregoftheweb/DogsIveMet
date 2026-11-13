// Banner ads (Google AdMob). The ad library is native code that Expo Go doesn't have, so
// there the bar keeps its "ad space" placeholder; development, preview and store builds show real banners.
// Development and preview builds (ADS_TEST=1, see eas.json) always use Google's test ads, so we never click our own.
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useEffect, useState } from 'react';
import { Platform, Text } from 'react-native';
import { useTheme } from 'react-native-paper';
import { ios, android } from './config';

type AdsLib = typeof import('react-native-google-mobile-ads');

const inExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const testAds = __DEV__ || Constants.expoConfig?.extra?.adsTest === true;
const platformAds = Platform.OS === 'ios' ? ios : Platform.OS === 'android' ? android : null;

/** the ad library, or null where there are no ads (Expo Go, a platform without ids) */
// a plain import would load the native module, and Expo Go doesn't have it
const lib: AdsLib | null =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  !inExpoGo && platformAds ? (require('react-native-google-mobile-ads') as AdsLib) : null;

type AdsState = 'starting' | 'ready' | 'off';
let state: AdsState = 'starting';
let started = false;
const listeners = new Set<() => void>();
const set = (s: AdsState) => {
  state = s;
  listeners.forEach((l) => l());
};

/**
 * Once at launch: ask for consent where the law needs it (Google's form, for the EU/UK and some US states; on
 * iPhones it can also bring up Apple's "allow tracking?" prompt), then start the ad library. The ad library reads
 * the user's choices itself: where they said no, ads are still shown, just not personalised.
 */
export async function startAds(): Promise<void> {
  if (!lib || started) return;
  started = true;
  try {
    const consent = await lib.AdsConsent.gatherConsent().catch(() => null);
    if (consent && !consent.canRequestAds) return set('off');
    await askToTrack();
    const ads = lib.default();
    // nothing racier than a teen rating, whatever the app's own rating
    await ads.setRequestConfiguration({ maxAdContentRating: lib.MaxAdContentRating.T });
    await ads.initialize();
    set('ready');
  } catch {
    set('off');
  }
}

/**
 * Apple's "allow tracking?" prompt, once, after Google's form. Google's form shows it only when AdMob has an IDFA
 * message published, so the app asks itself; if Google's form already asked, the answer is known and nothing shows.
 * Either answer is fine: the ad library reads it, and "no" means non-personalised ads.
 */
async function askToTrack(): Promise<void> {
  if (Platform.OS !== 'ios') return;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const att = require('expo-tracking-transparency') as typeof import('expo-tracking-transparency');
  const now = await att.getTrackingPermissionsAsync().catch(() => null);
  if (now?.status === att.PermissionStatus.UNDETERMINED && now.canAskAgain) {
    await att.requestTrackingPermissionsAsync().catch(() => null);
  }
}

/** whether the user can change their ad choices (shown on the Settings screen where the law requires it) */
export async function adChoicesAvailable(): Promise<boolean> {
  if (!lib) return false;
  const info = await lib.AdsConsent.getConsentInfo().catch(() => null);
  return (
    info?.privacyOptionsRequirementStatus === lib.AdsConsentPrivacyOptionsRequirementStatus.REQUIRED
  );
}

export async function showAdChoices(): Promise<void> {
  if (!lib) return;
  await lib.AdsConsent.showPrivacyOptionsForm().catch(() => null);
}

export function useAdsState(): AdsState {
  const [s, setS] = useState(state);
  useEffect(() => {
    const l = () => setS(state);
    listeners.add(l);
    l();
    return () => {
      listeners.delete(l);
    };
  }, []);
  return s;
}

/** Fixed 320×50 banner for the shared footer. */
export function Banner() {
  const theme = useTheme();
  const s = useAdsState();
  if (!lib || !platformAds) {
    return (
      <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 11, opacity: 0.6 }}>
        ad space
      </Text>
    );
  }
  if (s !== 'ready') return null;
  const { BannerAd, BannerAdSize, TestIds } = lib;
  const unitId = testAds || !platformAds.banner ? TestIds.BANNER : platformAds.banner;
  return <BannerAd unitId={unitId} size={BannerAdSize.BANNER} />;
}
