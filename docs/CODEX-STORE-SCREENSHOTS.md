# Codex brief: App Store screenshots, Dogs I've Met

## Goal

Make six App Store iPhone screenshots: each one a **real screen from the app** in a simple phone frame, on a background in the style of the product page header, with a short caption above.

## Inputs

`store-creative/screenshots/source/`: real screens from the iPhone 13, 1170 × 2532 px:

| #   | File             | Screen                           | Caption (use exactly)          |
| --- | ---------------- | -------------------------------- | ------------------------------ |
| 1   | `1-home.png`     | Home                             | Remember every dog you meet    |
| 2   | `2-new-dog.png`  | New dog form, photo, mic buttons | Snap a photo. Say the details. |
| 3   | `3-profile.png`  | Murphy's profile                 | Every dog, all in one place    |
| 4   | `4-list.png`     | List of dogs, voice search       | Find any dog by name or breed  |
| 5   | `5-my-dogs.png`  | My Dogs                          | Keep your own dogs too         |
| 6   | `6-settings.png` | Settings, highlight colours      | Make it yours                  |

Style reference: `store-creative/header/header-5244x2950.png` and `store-creative/header/Fredoka.ttf` (the header's font, OFL).

## Deliverables

In `store-creative/screenshots/`:

1. `appstore-6.5/01-home.png` … `06-settings.png`: exactly **1284 × 2778 px**, RGB, no transparency
2. `preview.png`: all six side by side, scaled down
3. `compose.py`: the script that builds them, so they can be rebuilt
4. `REVIEW.md`: a short note per image plus the sizes, verified with PIL

## Layout

- Background: the header's light sky blue, with a few faint camera / map pin / microphone outline icons and the soft green hills at the bottom, like the header. No new AI dogs over the screen; at most one small dog from the header art in a corner, if it doesn't cover the phone.
- Caption at the top, Fredoka bold, dark navy `#173465`, at most 2 lines, large enough to read at phone size (about 110–130 px).
- Below it, the screen in a plain rounded-rectangle phone frame (dark navy or near-black bezel, no notch drawing, no Apple device logos), taking roughly 75–80% of the image height. Scale the screen evenly; never stretch or crop off app content except as noted below.
- **Status bar cleanup:** the top ~140 px of each source holds the iPhone status bar. In 1–2 it shows a red screen-recording pill over the clock. Paint over the whole status bar strip on all six with the app's top colour (white) and draw a plain "9:41" in black at the left plus simple signal/wifi/battery glyphs at the right, so all six match. Don't change anything below the status bar.
- Keep the app's own pixels unedited otherwise: no added UI, no fake content (App Store Guideline 2.3.3: screenshots must show the app in use).

## Don'ts

- No words like "best", "#1", "free", prices, ratings or awards. No Apple devices, logos or UI other than the app's own screens.
- Don't touch app code, `assets/`, or the header folder. Don't push; you can't commit (git is read-only for you), so leave files in the working tree.

## Done means

Six PNGs at exactly 1284 × 2778, RGB, verified in REVIEW.md; captions spelled exactly as above; status bars clean and matching; preview.png shows all six.
