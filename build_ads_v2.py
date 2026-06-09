
from PIL import Image, ImageDraw, ImageFont
import requests, os
from io import BytesIO

def download_image(url):
    r = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
    return Image.open(BytesIO(r.content)).convert("RGB")

BOLD_FONT   = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
NARROW_BOLD = "/usr/share/fonts/truetype/liberation/LiberationSansNarrow-Bold.ttf"

img1_url = "https://cdn.galaxy.ai/user_2urgq79pytPKgx8tiLQTB9zI4Qn/00821551eb9f49f8a90996ade2b52b74.webp"
img2_url = "https://cdn.galaxy.ai/user_2urgq79pytPKgx8tiLQTB9zI4Qn/93211709aabd461f91ebc45f537797e8.webp"

print("Downloading source images...")
img1 = download_image(img1_url)  # 1125x2000 portrait
img2 = download_image(img2_url)  # 1536x1024 landscape

# ─── MODIFY LANDSCAPE (img2) ───────────────────────────────────────
img2_mod = img2.copy()
draw2 = ImageDraw.Draw(img2_mod)
TEAL_BG = (120, 218, 219)

# Cover old phone number line
draw2.rectangle([(540, 812), (1020, 862)], fill=TEAL_BG)

# New booking URL
font_book = ImageFont.truetype(BOLD_FONT, 30)
new_book = "Book Now: SDappointment.com"
bb = draw2.textbbox((0,0), new_book, font=font_book)
tw = bb[2]-bb[0]
cx = (430 + 1000) // 2
draw2.text((cx - tw//2, 820), new_book, fill=(255,255,255), font=font_book)

# Coupon code strip
COUPON_BG = (50, 160, 170)
draw2.rounded_rectangle([(430, 868), (1010, 910)], radius=10, fill=COUPON_BG)
font_coupon = ImageFont.truetype(NARROW_BOLD, 18)
coupon_line = "Coupon: GOOGLEBATH · $20 Off Bath    |    GOOGLEGROOM · $20 Off Groom"
cb = draw2.textbbox((0,0), coupon_line, font=font_coupon)
ctw = cb[2]-cb[0]
draw2.text(((430+1010)//2 - ctw//2, 882), coupon_line, fill=(255,255,255), font=font_coupon)

# ─── MODIFY PORTRAIT (img1) ───────────────────────────────────────
img1_mod = img1.copy()
draw1 = ImageDraw.Draw(img1_mod)
FOOTER_BG = (77, 165, 183)

# Cover old footer text
draw1.rectangle([(0, 1920), (1125, 1965)], fill=FOOTER_BG)

# New footer text with SDappointment.com
font_footer = ImageFont.truetype(BOLD_FONT, 28)
footer_text = "splashanddashogs.com/boca-raton   |   SDappointment.com"
fb = draw1.textbbox((0,0), footer_text, font=font_footer)
ftw = fb[2]-fb[0]
draw1.text((1125//2 - ftw//2, 1928), footer_text, fill=(255,255,255), font=font_footer)

# Coupon strip above footer
COUPON_BG1 = (50, 150, 165)
draw1.rectangle([(0, 1870), (1125, 1918)], fill=COUPON_BG1)
font_c1 = ImageFont.truetype(BOLD_FONT, 24)
c_line = "Use Code GOOGLEBATH · $20 Off Bath    |    GOOGLEGROOM · $20 Off Groom"
cb = draw1.textbbox((0,0), c_line, font=font_c1)
ctw = cb[2]-cb[0]
draw1.text((1125//2 - ctw//2, 1881), c_line, fill=(255,255,255), font=font_c1)

print("Sources modified. Generating ad units...")

# ─── MAKE AD UNITS ─────────────────────────────────────────────────
def make_ad(source, target_w, target_h, focal_x=0.5, focal_y=0.5):
    src_w, src_h = source.size
    scale = max(target_w / src_w, target_h / src_h)
    new_w, new_h = int(src_w * scale), int(src_h * scale)
    resized = source.resize((new_w, new_h), Image.LANCZOS)
    left = max(0, min(int((new_w - target_w) * focal_x), new_w - target_w))
    top  = max(0, min(int((new_h - target_h) * focal_y), new_h - target_h))
    return resized.crop((left, top, left + target_w, top + target_h))

out_dir = "/home/user/ads_v2"
os.makedirs(out_dir, exist_ok=True)

ad_sizes = [
    ("728x90_leaderboard",        728,  90, img2_mod, 0.52, 0.42),
    ("300x250_medium_rectangle",  300, 250, img2_mod, 0.60, 0.50),
    ("320x50_mobile_leaderboard", 320,  50, img2_mod, 0.52, 0.42),
    ("300x50_mobile_banner",      300,  50, img2_mod, 0.52, 0.42),
    ("160x600_wide_skyscraper",   160, 600, img1_mod, 0.50, 0.44),
    ("300x600_half_page",         300, 600, img1_mod, 0.50, 0.44),
]

for name, w, h, src, fx, fy in ad_sizes:
    ad = make_ad(src, w, h, fx, fy)
    path = f"{out_dir}/{name}.jpg"
    for q in [90, 80, 70, 60, 50, 40]:
        ad.save(path, "JPEG", quality=q, optimize=True)
        kb = os.path.getsize(path) / 1024
        if kb <= 150:
            print(f"  OK  {name}: {w}x{h} -> {kb:.1f}KB (q={q})")
            break

print("\nAll done!")
