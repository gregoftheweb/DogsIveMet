# Codex brief: App Store product page header image, Dogs I've Met

## Goal

Make the **header image** for the Dogs I've Met App Store product page (App Store Connect → iOS App 1.0 → Header and Search Results → Header). It is the wide banner across the top of the product page.

## Deliverables

Put everything in `store-creative/header/` (create the folder) in this repo:

1. `header-5244x2950.png`: exactly 5244 × 2950 px
2. `header-3840x1646.png`: exactly 3840 × 1646 px, the same design recomposed for the wider ratio (not just cropped if the crop loses the title)
3. `header-safe-preview.png`: both images scaled down side by side, with the safe area (below) outlined, for review
4. `REVIEW.md`: one short paragraph per image: what's in it and anything you were unsure about

These are the only two sizes App Store Connect accepts. Use PNG or JPEG, RGB with **no transparency**, sRGB.

## Safe area (important)

Apple crops the header differently on iPhone, iPad, Mac and in both orientations. Keep the **title text and the main dog** inside the centre **60% of the width and 70% of the height**. Everything outside that is background that may be cut off, so fill it with pattern or scenery, never text or faces.

## Look: match the existing art

Reference files in `assets/images/`:

- `icon.png`: the app icon: a flat-cartoon brown dog face with one cream eye patch and a pink tongue, thick dark outlines, on a deep blue circle
- `feature-graphic.png`: the Play Store banner: the same flat-cartoon style, several breeds (golden, poodle, pug, beagle, corgi-type), camera and map-pin icons, light blue background, bold dark-navy title "DOGS I'VE MET", tagline "log the lovely dogs you encounter"
- `DIM-Logo-v1.png`: the round logo

Keep that exact style: flat vector cartoon, thick dark outlines, friendly faces, no photorealism and no 3D. Colours: deep navy `#173465` and blues from the icon, light sky blue background, warm browns and creams for the dogs, a little pink. Title font: heavy rounded sans-serif in dark navy, as in the feature graphic.

## Content

- Title: **Dogs I've Met** (correct apostrophe, ’). An optional small tagline: "Remember every dog you meet". No other text.
- The icon's brown dog as the hero, near the title, with a loose crowd of 4–6 other breeds in the same style spreading towards the edges.
- Small hints of what the app does: a camera, a map pin, a microphone (voice notes). Keep them subtle.
- An optional soft park setting (grass, a path, trees) in the outer areas.

## Don'ts

- No real dog breeds' trademarked characters, no logos other than ours, no Apple devices or Apple UI.
- No "best", "#1", "free", prices, ratings or award badges (App Store rules).
- No text outside the safe area, and no small text; it has to read at phone size.
- Don't edit app code or `assets/images/`; only add files under `store-creative/header/`.

## Done means

Both PNGs exist at the exact pixel sizes (verify with Python/PIL and print the sizes in REVIEW.md), with no alpha channel, title and hero dog inside the safe area in both, and the style matching `feature-graphic.png`. Commit them on a new branch `store-header` with a short message; don't push.
