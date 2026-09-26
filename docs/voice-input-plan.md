# Voice Input Implementation Plan

Goal: speech-to-text entry for **Dog Name**, **Where we met**, and a new **Owner Name** field. Each field has two buttons: a primary **mic** button (tap → speak → auto-stops on silence → on-device speech recognition transcribes the words → transcript replaces the field's text) and a secondary **keyboard** button (tap → field becomes editable and focuses, keyboard opens, user types instead). Target flow for voice is tap → speak → tap → speak → tap → speak, back to back, no friction.

## 1. Data model change: add Owner Name

`Owner` doesn't exist as a field today. Add it alongside the existing optional fields.

- `src/types/Dog.ts`: add `ownerName?: string`
- `src/storage/dogs.ts`: no change needed — storage just persists whatever `Dog` object it's given
- `app/new-dog.tsx`: add `ownerName` state, initial-value tracking, unsaved-changes check, save payload (both create + edit branches), and a new `TextInput` field
- `app/dog-profile.tsx`: add a `List.Item` for "Owner" (icon: `account`), same pattern as "Where we met"

This part is independent of voice and can be done/tested first.

## 2. Package

**`expo-speech-recognition`** (community package, actively maintained, v57.x matches current Expo SDK 54 line). Already added to `package.json` via `pnpm add expo-speech-recognition`.

Wraps native on-device speech recognition:

- iOS: `SFSpeechRecognizer`
- Android: `SpeechRecognizer` (Google on-device or server-backed depending on device)

It's a native module → **requires a custom dev client build**, not plain Expo Go. This project already has an EAS `development` build profile (`eas.json`) and already declares `android.permission.RECORD_AUDIO` in `app.json`, so infrastructure is half-there.

### Config changes needed (`app.json`)

- Add `"expo-speech-recognition"` to `plugins`, with:
  - `microphonePermission`: iOS mic usage string
  - `speechRecognitionPermission`: iOS speech recognition usage string
  - `androidSpeechRecognitionServicePackages` if we want to lock to on-device recognition (optional)
  - `microphonePermission`: "DogsIveMet uses your microphone so you can dictate fields instead of typing."
  - `speechRecognitionPermission`: "DogsIveMet uses speech recognition to turn what you say into text for the field you're filling in."
- iOS: the plugin injects `NSMicrophoneUsageDescription` and `NSSpeechRecognitionUsageDescription` automatically from the permission strings above — no manual `ios.infoPlist` edits needed.
- Android: `RECORD_AUDIO` permission already present.

### Build requirement

After the plugin is added, native config changes → need a fresh EAS development build (`eas build --profile development`) or `expo prebuild` + local build. This can't be verified in Expo Go. **This is the one real blocker to "just try it" — flag to Greg before starting.**

## 3. Reusable component: `VoiceInputField`

New file: `src/ui/VoiceInputField.tsx`.

Two buttons, one field:

- The `TextInput` is **read-only by default** — tapping directly on the text does nothing, no keyboard pop-up. This keeps the two actions (speak / type) explicit and prevents an accidental keyboard interrupting the voice-first flow.
- `right` slot holds both buttons side by side (a small `View` with two `IconButton`s, since Paper's `right` prop accepts any component, not just a single `TextInput.Icon`):
  - **Primary — mic button**: starts/reflects voice capture, as below
  - **Secondary — keyboard icon button**: tap → flips the field to editable (`editable={true}`) and focuses it (`ref.current?.focus()`) so the native keyboard opens immediately for manual typing. Field goes back to read-only on blur.

Mic button design for smoothness (tap → speak → tap, repeatable, no dead air):

- States: `idle` (mic outline) → `listening` (filled/pulsing mic, different color) → back to `idle` on result or error
- **Start**: tap → check/request permissions (`ExpoSpeechRecognitionModule.requestPermissionsAsync()`) → `start({ lang: 'en-US', interimResults: true, continuous: false })`
- **Stop**: auto-stop on silence via `continuous: false` (native VAD/end-of-speech detection) — **confirmed default**, single tap per field, no manual stop needed
- Listen for `onResult` (final transcript) → set the field's value, **overwriting** any existing text — **confirmed**: each mic tap is a fresh capture, re-tapping replaces rather than appends
- Listen for `onError` → surface via the existing `Toast` component (e.g., "Didn't catch that — try again") rather than a blocking `Alert`, so it doesn't interrupt flow
- Optional nicety: show interim (partial) results greyed out in the field while listening, replaced by final result — makes it feel responsive rather than a dead pause
- Auto-capitalize / trim on final result to match existing field conventions (`autoCapitalize="words"` already used for Name/Location)
- Manual typing via the keyboard button follows normal `TextInput` behavior (including `autoCapitalize`) — no overwrite question applies there, it's just editing
- **Mode exclusivity**: tapping the keyboard button while the mic is listening stops/cancels the recognition session first, then flips to edit mode. Tapping the mic while the field is in edit mode (keyboard open from a manual-type session) blurs the field first, then starts listening. The two modes never run at once.
- **No-speech / empty result**: if auto-stop fires with nothing recognized (silence, or the native "no-speech" error), treat it the same as `onError` — show the "Didn't catch that — try again" Toast, leave the field's existing value untouched rather than clearing it.
- **Cleanup**: stop any in-progress recognition session on component unmount / screen blur (e.g. user navigates back or backgrounds the app mid-recording) — avoids a stray native listener or a late `onResult`/`onError` firing after the screen is gone.

Single shared component takes props: `value`, `onChangeText`, `label`, `placeholder`, so it's a drop-in replacement for the three plain `TextInput`s currently used for Name, Location, and (new) Owner — cuts duplication vs. hand-wiring mic + keyboard-toggle logic three times.

## 4. Integration points

- `app/new-dog.tsx` — field order top to bottom: **Name → Photo → Owner → Breed → Location → Notes → Save/Cancel** (Owner sits right after Photo, ahead of Breed/Location — see §8):
  - Replace the Name `TextInput` with `VoiceInputField`
  - Replace the Location `TextInput` with `VoiceInputField`
  - Add a new Owner `VoiceInputField` (new field, not currently in the form)
  - Notes field stays **plain text, typing only** — no mic/keyboard dual-button treatment. Confirmed: multiline dictation is a different UX problem and out of scope for this plan.
- `app/dog-profile.tsx`: display-only, just needs the new Owner `List.Item` (no voice needed here)

## 5. Permission handling

- First tap on any mic button triggers the OS permission prompt (mic + speech recognition on iOS) if not yet granted
- If denied: show a `Toast` with a short message and don't retry-loop; user can re-enable in system settings
- Permission state doesn't need to be tracked in app storage — `expo-speech-recognition` exposes a check/request call each time

## 6. Testing plan

- **Cannot be verified on iOS Simulator or Android Emulator in the usual way** — mic input on simulators is unreliable/absent for speech; needs a **real device** with an EAS development build installed
- Steps: `eas build --profile development --platform ios` (or `android`), install on device, run `expo start --dev-client`, connect, test the tap→speak→tap flow for all three fields plus a permission-denied path
- Manually verify: rapid sequential use (tap Name, speak, tap Location, speak, tap Owner, speak) has no lag or stuck "listening" state between fields — this is the actual UX bar Greg cares about, not just "it transcribes"
- Test the form at two aspect ratios: standard portrait (normal phone) and a square-ish window (resize simulator, or an Android emulator with a custom near-1:1 AVD) — see §8

## 7. Suggested order of work

1. Add `ownerName` to type/storage/form/profile (no voice yet) — quick, verifiable in Expo Go today
2. Add `expo-speech-recognition` config plugin to `app.json`
3. Kick off an EAS development build (takes a while — start early, do other work while it builds)
4. Build `VoiceInputField` component against the new build once installed on device
5. Wire into the three fields, iterate on real-device feel (auto-stop timing, error states)

## 8. Square aspect ratio phones

`new-dog.tsx` is already inside a scrolling `ScreenContainer` (`scroll={true}`), and the field order already puts Notes last among content fields, right before Save/Cancel (`app/new-dog.tsx:445,523-534`). That means most of "look great in portrait, passable on square" is already close to true by construction — this is mostly a verification pass, plus one explicit priority call rather than a rebuild.

- **Priority order, top to bottom**: Name → Photo → Owner → Breed → Location → Notes → Save/Cancel → Ad banner (Phase 2) — same order as §4, confirmed. On a square-ish screen, Name/Photo/Owner/Breed/Location should still fit above or just at the fold; Notes, Save/Cancel, and the ad banner are explicitly lowest priority and **allowed to fall below the fold on square screens** — scrolling to reach them is acceptable, confirmed.
- No conditional aspect-ratio branching in the component logic is planned for now — since the layout already scrolls and already orders content this way, forcing a different layout for square vs. portrait would be added complexity without a concrete problem to solve yet.
- Verification step (added to §6 testing plan): actually render the form on a near-1:1 window/emulator and eyeball it — confirm nothing overlaps or clips, and that reaching Notes via scroll still feels normal rather than broken. If something looks genuinely bad (not just "lower down the screen"), that's the trigger to revisit with real conditional logic (e.g. `useWindowDimensions()` to detect a square-ish ratio and shrink the photo preview or tighten `marginBottom` spacing) — not doing that preemptively.

## 9. Out of scope for this plan: AdMob banner (Phase 2)

Unrelated to voice input — noted here only so it isn't lost. Greg has an AdMob account and wants a **banner ad space at the bottom of the screen**, to be wired in as a separate follow-on phase after voice input ships.

Not designed yet — when this phase starts, will need:

- Which screen(s) get the banner (just `new-dog.tsx`? all screens via a shared layout?)
- `react-native-google-mobile-ads` (the standard Expo-compatible AdMob package) — also a native module, needs its own EAS dev/production build config (ad unit IDs, App ID in `app.json`)
- Test ad unit IDs during development, real AdMob unit IDs before release
- Layout: fixed banner docked to bottom vs. inline at the end of scrollable content, and how it interacts with the keyboard opening (avoid ads shifting/covering the keyboard-active field) — also interacts with §8: a fixed-bottom banner eats proportionally more vertical space on a square screen than a tall portrait one, so may need to be non-fixed (scrolls with content, sits after Notes) rather than docked, to avoid permanently covering the lower fields on square. Decide once Phase 2 actually starts.

Deliberately left thin for now — revisit and flesh out into its own plan once voice input work is done.

## Decisions (confirmed)

- **Auto-stop on silence** (`continuous: false`) — confirmed. If dictation gets cut off mid-sentence too aggressively on real hardware, revisit then, but this is the starting behavior.
- **Overwrite on re-tap** — confirmed. Each mic tap is a fresh capture that replaces the field's text.
- **Field is read-only until the keyboard button is tapped** — confirmed. Tapping the text directly does nothing; the secondary button focuses it and opens the keyboard for manual entry.
- **Keyboard icon** (not pencil) for the secondary "type manually" button — confirmed.
- **Mic/keyboard modes are mutually exclusive** — confirmed (§3): activating one stops the other first.
- **Field order**: Name → Photo → Owner → Breed → Location → Notes → Save/Cancel → Ad banner (Phase 2) — confirmed (§4, §8).
- **iOS permission-prompt copy** — wording finalized (§2); Greg can tweak later if it doesn't read well in practice.

## Open decisions

- **Language/locale** — defaulting to device locale (`en-US`); no UI needed unless multi-language support matters later

