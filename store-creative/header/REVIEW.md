# Header review

`header-5244x2950.png` — PIL verified **5244 × 2950 px**, RGB, embedded sRGB profile, no alpha channel. Sky blue park backdrop, deep navy rounded Fredoka Bold title “Dogs I’ve Met”, the brown cream-patch hero and five supporting breeds, plus subtle camera, map-pin and microphone motifs. The entire dog group and title fit inside the central 60% width × 70% height; the taller composition gives the portraits more vertical space. Generated illustration matches the references closely, though its linework and the replacement typeface are interpretations rather than the original source vectors/font. Optional tagline omitted for phone-size clarity.

`header-3840x1646.png` — PIL verified **3840 × 1646 px**, RGB, embedded sRGB profile, no alpha channel. The same design is recomposed with independently sized title and dog group, preserving every face and the full title inside the central safe area. This is not a crop of the taller image. Device-specific crops have not been tested in App Store Connect; the supplied safe-area requirement is enforced with PIL assertions.

`header-safe-preview.png` — Both finished headers scaled down side by side; pink rectangles outline the central 60% × 70% safe areas. This review overlay is absent from the final headers. The preview is also RGB with an embedded sRGB profile.

## Production

Artwork created with the built-in image generation tool using `icon.png` and `feature-graphic.png` as references. The exact prompt is in `PROMPT.txt`; `artwork.png` retains the transparent generated source only. `compose.py` composes and resizes the final opaque PNGs using Python/PIL; `layout-bounds.json` records title and portrait bounds. Fredoka and its OFL license are included to reproduce the typography. Run `python store-creative/header/compose.py` from the repository root.

## Git limitation

Branch creation was attempted with `git switch -c store-header`, but this session mounts `.git` read-only: `Unable to create .../.git/refs/heads/store-header.lock: Read-only file system`. Therefore branch creation and the requested commit could not be completed. No push was attempted. All additions are under `store-creative/header/`; app code and original assets were not changed. The existing untracked brief was left untouched.

When Git writes are available, finish with:

```sh
git switch -c store-header
git add store-creative/header/
git commit -m "Add App Store header artwork"
```
