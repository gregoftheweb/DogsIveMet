# AdMob banner review

## Changes

- `package.json`, `pnpm-lock.yaml`: install `react-native-google-mobile-ads` major 17 and Expo SDK 58's `expo-tracking-transparency` using `pnpm expo install`. Existing `expo-web-browser` handles the privacy link.
- `src/ads/config.ts`: the single place for both platforms' app and banner ids. All four values are Google's official samples, each marked `// TODO real id`. Replace all four before release. Sources: [iOS setup](https://developers.google.com/admob/ios/quick-start), [Android setup](https://developers.google.com/admob/android/quick-start), [test banners](https://developers.google.com/admob/cpp/test-ads).
- `app.config.ts`: extends the existing `app.json` (which remains the base metadata), imports those ids, adds tracking transparency and AdMob plugins, the requested tracking explanation and `cstr6suwn9.skadnetwork`. Maps `ADS_TEST` to the boolean `extra.adsTest`.
- `src/ads/ads.tsx`: ports the reference's lazy native loading, consent → ATT → teen-rated initialization, banner and privacy choices functions. Expo Go and web never load the native ad module and show “ad space”. Development or `extra.adsTest` uses `TestIds.BANNER`; production uses the platform's configured banner. A synchronous guard prevents duplicate startup while consent is pending. Errors leave the app usable; initialization failures turn ads off. Consent-fetch errors follow the reference fallback and still attempt SDK initialization.
- `src/ads/ads.web.tsx`: web-only placeholder and no-op API; keeps the native SDK out of Metro’s web bundle (a runtime platform guard alone is insufficient for bundling).
- `components/AnimatedSplashOverlay.tsx`: reports completion on the RN thread after the animation finishes.
- `app/_layout.tsx`: starts ads once after that completion. A flex navigator sits above a fixed 320×50 banner slot; the footer owns the bottom safe-area inset and uses the active theme background. This reserves space on every route, including list, profile and form screens.
- `src/ui/ScreenContainer.tsx`: footer now owns bottom safety; screen containers keep left/right safety. ScrollViews adjust their keyboard insets on iOS.
- `app/new-dog.tsx`: removes the inner keyboard-avoiding wrapper in favor of the enclosing ScrollView's keyboard inset handling. Form fields, save/cancel and voice controls remain in that scrollable content. No voice logic changes.
- `app/settings.tsx`: adds the in-app Privacy policy link and conditionally displays Privacy and ad choices when Google requires it. Refreshes availability on focus and after consent startup completes; makes Settings scrollable for shorter screens.
- `app/index.tsx`: removes the old static Advertising card now that the shared footer owns the ad slot.
- `tsconfig.json`: allows explicit `.ts` imports so Expo config can load the shared ids without extension resolution errors.
- `.prettierignore`: excludes separately maintained store artwork and metadata; no files in `store-creative` were edited.
- `docs/CODEX-ADS.md`, `docs/CODEX-STORE-HEADER.md`: only Markdown whitespace formatting to satisfy the existing repository-wide format check.
- `docs/ADS-REVIEW.md`: this implementation and validation record.
- `eas.json`: development/preview set `ADS_TEST=1`; production explicitly sets `ADS_TEST=0`.

## Review notes

- GonzoCards was read only. Dog data/storage, voice logic and store creative were not changed. No builds, submissions, pushes or commits were performed.
- Production follows the production code path but still serves sample ads until the four ids are replaced. Real AdMob privacy/consent messages must be configured in the AdMob console; sample ids cannot verify those production messages.
- Native visual testing remains necessary: fresh-install consent/ATT after the splash, ATT refusal, required privacy choices, Expo Go fallback, offline launch, new-dog with the keyboard and voice mic, long dogs-list's last row, profile actions, and Settings on a small screen. No device or emulator was attached (`adb devices` was empty), so these are code-reviewed, not claimed as device-tested.

## Validation

- `pnpm tsc --noEmit`: passed.
- `pnpm lint`: passed without warnings.
- `pnpm format:check`: passed.
- `pnpm expo export --platform web --output-dir /tmp/dogs-ads-web`: passed, including all nine static routes.
- `pnpm dlx expo-doctor`: 20/20 checks passed.
- `pnpm expo config --type introspect`: passed; verified iOS `GADApplicationIdentifier = ca-app-pub-3940256099942544~1458002511`, the exact requested `NSUserTrackingUsageDescription`, and `SKAdNetworkItems = [{ SKAdNetworkIdentifier: cstr6suwn9.skadnetwork }]`.
- Isolated mocked runtime checks (temporary script outside the repo): passed Expo Go/web native-module guards, consent → ATT → rating → initialization order, concurrent startup guard, blocked-consent behavior, fixed banner size, development/preview/production banner selection, and privacy choices availability/display invocation.
- Tooling used pnpm 10.18.1 from `/tmp`, a writable temporary pnpm store, and `__UNSAFE_EXPO_HOME_DIRECTORY=/tmp/dogs-expo`. The host pnpm 11 could not open its version-manager database, and the default Expo cache was read-only. No tracked pnpm version or cache configuration was changed.
- Native device UI checks remain unverified as described above.
