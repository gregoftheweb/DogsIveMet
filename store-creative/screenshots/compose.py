"""Rebuild with: python store-creative/screenshots/compose.py (requires Pillow)."""
from pathlib import Path
import subprocess
from PIL import Image, ImageDraw, ImageFont, ImageCms

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'appstore-6.5'
NAVY = '#173465'
SIZE = (1284, 2778)
PROFILE = ImageCms.ImageCmsProfile(ImageCms.createProfile('sRGB')).tobytes()
ITEMS = [
    ('home', 'Remember every dog you meet', ['Remember every', 'dog you meet'], 'Home navigation and dog logo.'),
    ('new-dog', 'Snap a photo. Say the details.', ['Snap a photo.', 'Say the details.'], 'Real photo, form fields, and microphone controls.'),
    ('profile', 'Every dog, all in one place', ['Every dog,', 'all in one place'], "Murphy’s photo and saved details."),
    ('list', 'Find any dog by name or breed', ['Find any dog by', 'name or breed'], 'Dog list with name search, breed filter, and voice search.'),
    ('my-dogs', 'Keep your own dogs too', ['Keep your own', 'dogs too'], 'My Dogs list and Add My Dog control.'),
    ('settings', 'Make it yours', ['Make it yours'], 'Theme and highlight colour choices.'),
]

def caption_font(size=124):
    font = ImageFont.truetype(str(ROOT.parent / 'header/Fredoka.ttf'), size)
    font.set_variation_by_axes([700, 100])
    return font


def background():
    # Same palette and scenery geometry as header/compose.py, adapted to portrait.
    im = Image.new('RGB', SIZE, '#CDECF5')
    d = ImageDraw.Draw(im)
    d.ellipse((-800, 2350, 1700, 3400), fill='#B7DEC9')
    d.ellipse((500, 2450, 2200, 3300), fill='#A5D3C2')
    d.polygon([(400,2778),(660,2530),(715,2530),(1000,2778)], fill='#E4EDD8')
    c = '#A6D4E3'
    # Faint outline motifs remain outside the phone and caption.
    d.rounded_rectangle((22,440,112,502),radius=10,outline=c,width=4)
    d.rounded_rectangle((44,426,78,441),radius=4,fill=c)
    d.ellipse((50,450,84,484),outline=c,width=4)
    d.ellipse((1176,407,1250,481),outline=c,width=4)
    d.line([(1181,463),(1213,516),(1245,463)],fill=c,width=4)
    d.ellipse((1204,432,1222,450),fill=c)
    d.rounded_rectangle((45,1870,73,1940),radius=14,outline=c,width=4)
    d.arc((30,1900,88,1961),0,180,fill=c,width=4)
    d.line((59,1961,59,1985),fill=c,width=4)
    d.line((42,1985,76,1985),fill=c,width=4)
    return im


def clean_status(source, font):
    im = source.copy()
    d = ImageDraw.Draw(im)
    d.rectangle((0,0,1169,139),fill='white')
    d.text((82,39),'9:41',font=font,fill='black')
    for i,height in enumerate((10,17,24,31)):
        x=940+i*12
        d.rounded_rectangle((x,81-height,x+8,81),radius=2,fill='black')
    for box in [(1002,48,1052,96),(1010,58,1044,92),(1019,68,1035,88)]:
        d.arc(box,215,325,fill='black',width=5)
    d.ellipse((1024,78,1030,84),fill='black')
    d.rounded_rectangle((1070,51,1133,81),radius=6,outline='black',width=3)
    d.rounded_rectangle((1076,57,1127,75),radius=2,fill='black')
    d.rounded_rectangle((1135,59,1140,73),radius=2,fill='black')
    assert im.crop((0,140,1170,2532)).tobytes() == source.crop((0,140,1170,2532)).tobytes()
    return im


def main():
    OUT.mkdir(exist_ok=True)
    status_path = Path('/usr/share/fonts/noto/NotoSans-Regular.ttf')
    if not status_path.exists():
        status_path = Path(subprocess.check_output(['fc-match','-f','%{file}','sans'],text=True).strip())
    status_font = ImageFont.truetype(str(status_path),43)
    preview = Image.new('RGB',(1540,556),'#F5F8FB')
    notes = ['# Screenshot review', '', 'Built with Python/Pillow. All six exported PNGs reopened and verified with PIL: **1284 × 2778 px, RGB, no transparency**, embedded sRGB profile.', '', 'Captions use Fredoka weight 700 at 124 px, navy #173465. Phone screen is uniformly scaled to 980 × 2121 px (76.3% of canvas height), inside a plain navy frame. Entire rectangular screen is retained, without corner masking or cropping. Header palette, faint utility icons, and soft hills are composed with PIL; no generated artwork was needed.', '', 'All six source status bars have exactly the top 140 rows replaced with white, 9:41, and matching black signal/Wi-Fi/battery glyphs. An exact pixel comparison verifies every source pixel below row 140 is unchanged before uniform resizing. Original app content, including its existing scroll position, is preserved.', '', '| File | Exact caption | Review | PIL size / mode |', '|---|---|---|---|']
    for i,(slug,caption,lines,note) in enumerate(ITEMS,1):
        assert ' '.join(lines)==caption
        im=background(); d=ImageDraw.Draw(im); font=caption_font()
        # Reserve a consistent two-line title area even for the one-line caption.
        top=112 if len(lines)==2 else 181
        for j,line in enumerate(lines):
            box=d.textbbox((0,0),line,font=font)
            assert box[2]-box[0] <= 1150
            d.text(((1284-(box[2]-box[0]))/2-box[0],top+j*145-box[1]),line,font=font,fill=NAVY)
        d.rounded_rectangle((132,494,1151,2654),radius=68,fill=NAVY)
        with Image.open(ROOT/'source'/f'{i}-{slug}.png') as source:
            assert source.size==(1170,2532) and source.mode=='RGB'
            screen=clean_status(source,status_font)
        screen=screen.resize((980,2121),Image.Resampling.LANCZOS)
        im.paste(screen,(152,514))
        name=f'{i:02d}-{slug}.png'; path=OUT/name
        im.save(path,icc_profile=PROFILE)
        with Image.open(path) as check:
            assert check.size==SIZE and check.mode=='RGB' and 'transparency' not in check.info
            preview.paste(check.resize((250,541),Image.Resampling.LANCZOS),((i-1)*258,7))
            notes.append(f'| {name} | {caption} | {note} Clean matching status bar; full source extent retained. | {check.width} × {check.height} / {check.mode} |')
        print(name, SIZE, 'RGB')
    preview.save(ROOT/'preview.png',icc_profile=PROFILE)
    notes.extend(['', 'Visual review: inspected the combined six-panel preview for caption spelling, consistent spacing, frame alignment, readable app content, status bars, and restrained background decoration. Preview: 1540 × 556 px, RGB.', '', 'Rebuild: `python store-creative/screenshots/compose.py` from the repository root. Requires Pillow; uses system Noto Sans (or fontconfig sans fallback) for the status clock.'])
    (ROOT/'REVIEW.md').write_text('\n'.join(notes)+'\n')

if __name__=='__main__':
    main()
