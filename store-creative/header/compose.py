"""Compose generated artwork with PIL. Run from this directory."""
from pathlib import Path
import json
from PIL import Image, ImageDraw, ImageFont, ImageCms
ROOT = Path(__file__).resolve().parent
NAVY = '#173465'
PROFILE = ImageCms.ImageCmsProfile(ImageCms.createProfile('sRGB')).tobytes()

def font(size):
    f = ImageFont.truetype(str(ROOT / 'Fredoka.ttf'), size)
    f.set_variation_by_axes([700, 100])
    return f

def compose(w,h):
    im = Image.new('RGB',(w,h),'#CDECF5')
    d = ImageDraw.Draw(im)
    # Soft scenery stays behind the central brand and portrait group.
    d.ellipse((-w*.3,h*.76,w*.75,h*1.65),fill='#B7DEC9')
    d.ellipse((w*.48,h*.81,w*1.35,h*1.55),fill='#A5D3C2')
    d.polygon([(w*.39,h),(w*.50,h*.85),(w*.55,h*.85),(w*.68,h)],fill='#E4EDD8')
    # Restrained utility motifs, with the same thick rounded-line vocabulary.
    color='#78B7CE'; line=max(3,round(h*.004))
    def camera(cx,cy,s):
        box=(cx-s*.5,cy-s*.30,cx+s*.5,cy+s*.34)
        d.rounded_rectangle(box,radius=s*.09,outline=color,width=line)
        d.rounded_rectangle((cx-s*.24,cy-s*.42,cx+s*.12,cy-s*.29),radius=s*.04,fill=color)
        d.ellipse((cx-s*.19,cy-s*.18,cx+s*.19,cy+s*.20),outline=color,width=line)
    def pin(cx,cy,s):
        d.ellipse((cx-s*.28,cy-s*.4,cx+s*.28,cy+s*.16),outline=color,width=line)
        d.line([(cx-s*.23,cy+s*.05),(cx,cy+s*.43),(cx+s*.23,cy+s*.05)],fill=color,width=line,joint='curve')
        d.ellipse((cx-s*.09,cy-s*.23,cx+s*.09,cy-s*.05),fill=color)
    def mic(cx,cy,s):
        d.rounded_rectangle((cx-s*.12,cy-s*.35,cx+s*.12,cy+s*.13),radius=s*.12,outline=color,width=line)
        d.arc((cx-s*.23,cy-s*.18,cx+s*.23,cy+s*.27),0,180,fill=color,width=line)
        d.line((cx,cy+s*.27,cx,cy+s*.43),fill=color,width=line)
        d.line((cx-s*.13,cy+s*.43,cx+s*.13,cy+s*.43),fill=color,width=line)
    camera(w*.12,h*.42,h*.13)
    pin(w*.88,h*.33,h*.15)
    mic(w*.86,h*.64,h*.14)
    for x,y,r in [(.12,.72,.009),(.91,.79,.009),(.08,.22,.006),(.76,.12,.005),(.28,.09,.005)]:
        d.ellipse((w*x-h*r,h*y-h*r,w*x+h*r,h*y+h*r),fill='#AAD7E5')
    title='Dogs I’ve Met'
    size=round(h*.145)
    while True:
        f=font(size); box=d.textbbox((0,0),title,font=f)
        if box[2]-box[0] <= w*.56: break
        size-=1
    tw,th=box[2]-box[0],box[3]-box[1]
    tx=(w-tw)//2; ty=round(h*.195)
    d.text((tx-box[0],ty-box[1]),title,font=f,fill=NAVY)
    art=Image.open(ROOT/'artwork.png').convert('RGBA')
    art=art.crop(art.getbbox())
    scale=min(w*.56/art.width,h*.45/art.height)
    art=art.resize((round(art.width*scale),round(art.height*scale)),Image.Resampling.LANCZOS)
    ax=(w-art.width)//2; ay=round(h*.80)-art.height
    im.paste(art,(ax,ay),art)
    safe=(w*.2,h*.15,w*.8,h*.85)
    bounds={'title':[tx,ty,tx+tw,ty+th],'all_dogs':[ax,ay,ax+art.width,ay+art.height]}
    for b in bounds.values():
        assert b[0]>=safe[0] and b[1]>=safe[1] and b[2]<=safe[2] and b[3]<=safe[3],(safe,b)
    path=ROOT/f'header-{w}x{h}.png'
    im.save(path,icc_profile=PROFILE)
    with Image.open(path) as check:
        assert check.size==(w,h) and check.mode=='RGB' and check.info.get('icc_profile')
        print(path.name, check.size,check.mode)
    return im,bounds

if __name__=='__main__':
    results=[compose(5244,2950),compose(3840,1646)]
    preview=Image.new('RGB',(1640,530),'#F5F8FB'); pd=ImageDraw.Draw(preview)
    for i,(im,bounds) in enumerate(results):
        w,h=im.size; small=im.resize((800,round(h*800/w)),Image.Resampling.LANCZOS)
        x=10+i*820; y=42+(450-small.height)//2
        preview.paste(small,(x,y))
        pd.rectangle((x+160,y+small.height*.15,x+640,y+small.height*.85),outline='#DE3B67',width=3)
        pd.text((x,12),f'{w} x {h} | pink: central 60% x 70% safe area',font=ImageFont.truetype(str(ROOT/'Fredoka.ttf'),20),fill=NAVY)
    preview.save(ROOT/'header-safe-preview.png',icc_profile=PROFILE)
    (ROOT/'layout-bounds.json').write_text(json.dumps({f'{im.width}x{im.height}':b for im,b in results},indent=2)+'\n')
