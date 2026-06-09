#!/usr/bin/env python3
"""Download source images and compose all 12 ad PNGs at exact spec dimensions."""
import os, requests
from PIL import Image, ImageDraw, ImageFont

OUT_DIR = '/home/user/ads_v3'
SRC_DIR = f'{OUT_DIR}/sources'
PNG_DIR = f'{OUT_DIR}/pngs'
for d in [OUT_DIR, SRC_DIR, PNG_DIR]:
    os.makedirs(d, exist_ok=True)

TEAL   = (0, 164, 161)
ORANGE = (240, 100, 20)
YELLOW = (255, 215, 0)
WHITE  = (255, 255, 255)

SOURCES = {
    'bath_square': 'https://galaxy-prod.tlcdn.com/gen/user_2urgq79pytPKgx8tiLQTB9zI4Qn/e8a9de74-3529-4617-9375-4028deb982fc.png',
    'bath_tall':   'https://galaxy-prod.tlcdn.com/gen/user_2urgq79pytPKgx8tiLQTB9zI4Qn/ba235b89-61c4-4eca-88ed-fffebc4c5a7a.png',
    'bath_sky':    'https://galaxy-prod.tlcdn.com/gen/user_2urgq79pytPKgx8tiLQTB9zI4Qn/6d3e8831-76bf-4f69-a155-87910ff0ef8b.png',
    'groom_square':'https://galaxy-prod.tlcdn.com/gen/user_2urgq79pytPKgx8tiLQTB9zI4Qn/9fceafac-b6aa-4cf1-b5b0-0ec32abeead7.png',
    'groom_tall':  'https://galaxy-prod.tlcdn.com/gen/user_2urgq79pytPKgx8tiLQTB9zI4Qn/7fbffabd-501f-4f01-9ebb-dbcedc80934f.png',
    'groom_sky':   'https://galaxy-prod.tlcdn.com/gen/user_2urgq79pytPKgx8tiLQTB9zI4Qn/b4e0724a-bfc6-4429-b42c-e0d1e97e9510.png',
}
LOGO_URL = 'https://galaxy-prod.tlcdn.com/view/user_2urgq79pytPKgx8tiLQTB9zI4Qn/0495625b37b3472ab660bff00a2ae9c8.jpg'

def dl(url, path):
    if os.path.exists(path):
        return
    print(f"  Downloading {os.path.basename(path)}...")
    r = requests.get(url, timeout=120)
    r.raise_for_status()
    with open(path, 'wb') as f:
        f.write(r.content)

def cover_crop(img, tw, th):
    sw, sh = img.size
    scale = max(tw/sw, th/sh)
    nw = max(tw, round(sw * scale))
    nh = max(th, round(sh * scale))
    img2 = img.resize((nw, nh), Image.LANCZOS)
    x = (nw - tw) // 2
    y = (nh - th) // 2
    return img2.crop((x, y, x+tw, y+th))

# Download
print("Downloading sources...")
for name, url in SOURCES.items():
    dl(url, f'{SRC_DIR}/{name}.png')
dl(LOGO_URL, f'{SRC_DIR}/logo.jpg')

# Try downloading Anton font
anton_p = '/home/user/Anton-Regular.ttf'
if not os.path.exists(anton_p):
    try:
        dl('https://github.com/google/fonts/raw/main/ofl/anton/Anton-Regular.ttf', anton_p)
    except:
        anton_p = None

# Find a regular sans font
reg_p = None
for p in ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
          '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
          '/usr/share/fonts/truetype/freefont/FreeSansBold.ttf',
          '/usr/share/fonts/truetype/ubuntu/Ubuntu-B.ttf']:
    if os.path.exists(p):
        reg_p = p
        break
if reg_p is None:
    reg_p = anton_p

print(f"Anton font: {anton_p}")
print(f"Regular font: {reg_p}")

# Load images
imgs = {}
for name in SOURCES:
    imgs[name] = Image.open(f'{SRC_DIR}/{name}.png').convert('RGB')
    print(f"  {name}: {imgs[name].size}")
logo = Image.open(f'{SRC_DIR}/logo.jpg').convert('RGBA')
print(f"  logo: {logo.size}")

# ── Spec-resized ads (AI-generated content, just cropped to exact spec) ──────
spec_map = [
    ('BATH_300x250_MediumRect',  'bath_square',  300, 250),
    ('BATH_300x600_HalfPage',    'bath_tall',    300, 600),
    ('BATH_160x600_Skyscraper',  'bath_sky',     160, 600),
    ('GROOM_300x250_MediumRect', 'groom_square', 300, 250),
    ('GROOM_300x600_HalfPage',   'groom_tall',   300, 600),
    ('GROOM_160x600_Skyscraper', 'groom_sky',    160, 600),
]
for fname, src, tw, th in spec_map:
    img = cover_crop(imgs[src], tw, th)
    img.save(f'{PNG_DIR}/{fname}.png')
    print(f"Saved {fname}: {img.size}")

# ── Banner composition (PIL-composed for ultra-wide banner sizes) ─────────────
def get_font(path, size):
    if path and os.path.exists(path):
        try:
            return ImageFont.truetype(path, size)
        except:
            pass
    return ImageFont.load_default()

def draw_text_centered(draw, text, cx, y, font, fill):
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    draw.text((cx - tw//2, y), text, font=font, fill=fill)

def make_banner_728x90(campaign, source_key, headline, offer, coupon, cta):
    """728×90 leaderboard: logo | dog-head | headline text | orange CTA zone"""
    W, H = 728, 90
    canvas = Image.new('RGB', (W, H), TEAL)
    draw = ImageDraw.Draw(canvas)

    PAD = 5
    x = PAD

    # Logo on left
    logo_h = H - 2*PAD
    lw, lh = logo.size
    logo_new_w = round(logo_h * lw / lh)
    logo_r = logo.resize((logo_new_w, logo_h), Image.LANCZOS)
    canvas.paste(logo_r, (x, PAD), logo_r)
    x += logo_new_w + PAD

    # Dog head crop from square source (square crop, H-2*PAD)
    dog_px = H - 2*PAD
    dog_src = imgs[source_key]
    # Take left-center third of the square which typically has the dog
    sw, sh = dog_src.size
    crop_x1 = sw // 6
    crop_x2 = crop_x1 + sh  # square crop
    crop_y1 = 0
    crop_y2 = sh
    dog_crop = dog_src.crop((crop_x1, crop_y1, min(crop_x2, sw), crop_y2))
    dog_sq = cover_crop(dog_crop, dog_px, dog_px)
    canvas.paste(dog_sq, (x, PAD))
    x += dog_px + PAD

    # Orange CTA zone on far right
    cta_w = 160
    cta_x = W - cta_w
    draw.rectangle([cta_x, 0, W, H], fill=ORANGE)

    # CTA text
    f_cta_big = get_font(anton_p, 16)
    f_cta_sml = get_font(reg_p, 11)
    cx_cta = cta_x + cta_w//2
    draw.text((cta_x + 5, 8), coupon, font=f_cta_big, fill=YELLOW)
    draw.text((cta_x + 5, 28), cta, font=f_cta_sml, fill=WHITE)
    draw.text((cta_x + 5, 44), 'Book Now >', font=f_cta_sml, fill=WHITE)

    # Middle text area
    mid_w = cta_x - x - PAD
    f_head = get_font(anton_p, 18)
    f_offer = get_font(anton_p, 22)
    f_sml = get_font(reg_p, 10)

    draw.text((x, 4), headline, font=f_head, fill=WHITE)
    draw.text((x, 26), offer, font=f_offer, fill=YELLOW)
    draw.text((x, 54), 'Any Dog • Any Size | New Customers Only', font=f_sml, fill=(200, 240, 240))

    return canvas

def make_banner_strip(W, H, source_key, headline, offer, coupon, cta):
    """300×50 / 320×50 mobile banner strip."""
    canvas = Image.new('RGB', (W, H), TEAL)
    draw = ImageDraw.Draw(canvas)
    PAD = 3

    x = PAD
    # Logo
    logo_h = H - 2*PAD
    lw, lh = logo.size
    logo_nw = round(logo_h * lw / lh)
    logo_r = logo.resize((logo_nw, logo_h), Image.LANCZOS)
    canvas.paste(logo_r, (x, PAD), logo_r)
    x += logo_nw + PAD

    # Orange right zone
    right_w = max(80, W//3)
    right_x = W - right_w
    draw.rectangle([right_x, 0, W, H], fill=ORANGE)

    # Coupon in right zone
    f_code = get_font(anton_p, H-12)
    f_sml  = get_font(reg_p, max(8, H//5))
    draw.text((right_x + 3, 2), coupon, font=f_code, fill=YELLOW)
    draw.text((right_x + 3, H//2 + 1), cta, font=f_sml, fill=WHITE)

    # Middle text
    f_mid = get_font(anton_p, H-18)
    draw.text((x, 2), offer, font=f_mid, fill=WHITE)
    f_sub = get_font(reg_p, max(7, H//6))
    draw.text((x, H//2 + 1), headline[:30], font=f_sub, fill=(200, 240, 240))

    return canvas

# Bath banners
b_728  = make_banner_728x90('bath',  'bath_square',  "Just Finished the Park?",       "$20 OFF YOUR FIRST BATH",  "BATH20",  "SDappointment.com")
b_320  = make_banner_strip(320, 50,  'bath_square',  "Just Finished the Park?",       "$20 OFF FIRST BATH",       "BATH20",  "SDappointment.com")
b_300s = make_banner_strip(300, 50,  'bath_square',  "Just Finished the Park?",       "$20 OFF FIRST BATH",       "BATH20",  "SDappointment.com")

# Groom banners
g_728  = make_banner_728x90('groom', 'groom_square', "Looking for a Great Groomer?",  "$20 OFF YOUR FIRST GROOM", "GRM20",   "SDappointment.com")
g_320  = make_banner_strip(320, 50,  'groom_square', "Looking for a Great Groomer?",  "$20 OFF FIRST GROOM",      "GRM20",   "SDappointment.com")
g_300s = make_banner_strip(300, 50,  'groom_square', "Looking for a Great Groomer?",  "$20 OFF FIRST GROOM",      "GRM20",   "SDappointment.com")

banner_map = [
    ('BATH_728x90_Leaderboard',   b_728),
    ('BATH_320x50_MobileLeader',  b_320),
    ('BATH_300x50_MobileBanner',  b_300s),
    ('GROOM_728x90_Leaderboard',  g_728),
    ('GROOM_320x50_MobileLeader', g_320),
    ('GROOM_300x50_MobileBanner', g_300s),
]
for fname, img in banner_map:
    img.save(f'{PNG_DIR}/{fname}.png')
    print(f"Saved {fname}: {img.size}")

print("\n✓ All 12 PNGs ready in", PNG_DIR)
