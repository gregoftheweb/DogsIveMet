# Codex brief: AdMob banner ads for Dogs I've Met 1.0

## Goal

Add one Google AdMob **banner** to Dogs I've Met, with Google's consent form and Apple's tracking (ATT) prompt, copying the working setup from our card games. The app stays free, offline-first, no accounts. Banner only: no interstitials, rewarded ads or app-open ads.

## Copy from (read these first)

The card games already ship this and it passed App Review:

- `/mnt/devplex/GonzoCards/gonzocards/src/shell/ads.tsx`: lazy `require` of the ad library, `startAds()` (consent → ATT → initialize, max rating T), `Banner`, `adChoicesAvailable()` / `showAdChoices()`, test ads in dev/preview
- `/mnt/devplex/GonzoCards/gonzocards/app.config.ts` lines ~25–36: the `expo-tracking-transparency` and `react-native-google-mobile-ads` config plugins, tracking reason text, `skAdNetworkItems: ['cstr6suwn9.skadnetwork']`
- `/mnt/devplex/GonzoCards/gonzocards/eas.json`: how preview builds set test ads (`ADS_TEST` → `extra.adsTest`)

Read-only: don't change anything under `/mnt/devplex/GonzoCards`.

## What to build (in /mnt/devplex/DogsIveMet)

1. **Packages** (pnpm, versions that match Expo SDK 58; use `pnpm expo install`): `react-native-google-mobile-ads` (same major as GonzoCards, ^17) and `expo-tracking-transparency`.
2. **Ad ids in one place**: `src/ads/config.ts` exporting the iOS and Android `appId` and `banner` ids. Until the real ids arrive, use **Google's official sample/test ids** and mark them `// TODO real id`. Claude will paste the real ids in later, so keep it a single obvious file.
3. **app.json → app.config.ts** if needed, so the AdMob plugin can read the app ids from `src/ads/config.ts` (or keep app.json and put the ids there, your choice; say which in REVIEW). Add the two plugins as in GonzoCards. Tracking prompt text: "Your choice only changes which ads you see. Dogs I've Met is free either way, with or without tracking."
4. **`src/ads/ads.tsx`**: port GonzoCards' `ads.tsx` (drop the brand/theme coupling; use react-native-paper's theme for the placeholder text colour). Same behaviour: Expo Go → "ad space" placeholder and no native module; `__DEV__` or preview → `TestIds.BANNER`; store builds → real banner id.
5. **Start ads once at launch**: call `startAds()` from `app/_layout.tsx` after the splash overlay has finished (not before; the consent form must not cover the Columbia Foundry splash).
6. **One banner on every screen**: in `app/_layout.tsx`, put a fixed bar under the `<Stack>` that holds the 320×50 banner, centred, with the bottom safe-area inset below it and the app's background colour. Screens must shrink to sit above it: nothing (buttons, the voice mic, the keyboard-avoiding text fields, lists) may be hidden behind the banner. Check new-dog (keyboard up), dogs-list (long list scrolls to the last item), dog-profile and settings.
7. **Settings screen**: add a "Privacy policy" row opening `https://columbiafoundry.com/privacy/dogs-ive-met.html` in the in-app browser (expo-web-browser), and a "Privacy and ad choices" row shown only when `adChoicesAvailable()` is true, calling `showAdChoices()`.
8. **eas.json**: give `preview` and `development` the test-ads env like GonzoCards; `production` uses real ids.

## Don'ts

- Don't touch the dog data model or storage, the voice input logic, or the store-creative folder.
- No analytics, no Firebase, no other SDKs.
- Don't run `eas build` or `eas submit`. Don't push. You can't commit (git is read-only in your sandbox); leave the changes in the working tree for Claude to commit.

## Done means

- `pnpm tsc --noEmit`, `pnpm lint`, `pnpm format:check` and `pnpm dlx expo-doctor` all pass.
- `pnpm expo config --type introspect` shows `GADApplicationIdentifier`, `NSUserTrackingUsageDescription` and the SKAdNetwork item in the iOS Info.plist.
- `docs/ADS-REVIEW.md`: what changed, file by file, where the ids live, and anything you weren't sure about.
