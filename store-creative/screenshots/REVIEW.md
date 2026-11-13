# Screenshot review

Built with Python/Pillow. All six exported PNGs reopened and verified with PIL: **1284 × 2778 px, RGB, no transparency**, embedded sRGB profile.

Captions use Fredoka weight 700 at 124 px, navy #173465. Phone screen is uniformly scaled to 980 × 2121 px (76.3% of canvas height), inside a plain navy frame. Entire rectangular screen is retained, without corner masking or cropping. Header palette, faint utility icons, and soft hills are composed with PIL; no generated artwork was needed.

All six source status bars have exactly the top 140 rows replaced with white, 9:41, and matching black signal/Wi-Fi/battery glyphs. An exact pixel comparison verifies every source pixel below row 140 is unchanged before uniform resizing. Original app content, including its existing scroll position, is preserved.

| File | Exact caption | Review | PIL size / mode |
|---|---|---|---|
| 01-home.png | Remember every dog you meet | Home navigation and dog logo. Clean matching status bar; full source extent retained. | 1284 × 2778 / RGB |
| 02-new-dog.png | Snap a photo. Say the details. | Real photo, form fields, and microphone controls. Clean matching status bar; full source extent retained. | 1284 × 2778 / RGB |
| 03-profile.png | Every dog, all in one place | Murphy’s photo and saved details. Clean matching status bar; full source extent retained. | 1284 × 2778 / RGB |
| 04-list.png | Find any dog by name or breed | Dog list with name search, breed filter, and voice search. Clean matching status bar; full source extent retained. | 1284 × 2778 / RGB |
| 05-my-dogs.png | Keep your own dogs too | My Dogs list and Add My Dog control. Clean matching status bar; full source extent retained. | 1284 × 2778 / RGB |
| 06-settings.png | Make it yours | Theme and highlight colour choices. Clean matching status bar; full source extent retained. | 1284 × 2778 / RGB |

Visual review: inspected the combined six-panel preview for caption spelling, consistent spacing, frame alignment, readable app content, status bars, and restrained background decoration. Preview: 1540 × 556 px, RGB.

Rebuild: `python store-creative/screenshots/compose.py` from the repository root. Requires Pillow; uses system Noto Sans (or fontconfig sans fallback) for the status clock.
