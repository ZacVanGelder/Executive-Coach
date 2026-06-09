
from PIL import Image, ImageDraw, ImageFont, ImageEnhance
import requests, os, subprocess
from io import BytesIO

# ─── FONTS ───────────────────────────────────────────────────────────
ANTON        = "/home/user/Anton-Regular.ttf"
BOLD_FONT    = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
NARROW_BOLD  = "/usr/share/fonts/truetype/liberation/LiberationSansNarrow-Bold.ttf"
HEADLINE_ALT = "/usr/share/fonts/truetype/noto/NotoSansDisplay-CondensedExtraBold.ttf"

def download_image(url):
    r = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
    return Image.open(BytesIO(r.content)).convert("RGB")

img1_url = "https://cdn.galaxy.ai/user_2urgq79pytPKgx8tiLQTB9zI4Qn/00821551eb9f49f8a90996ade2b52b74.webp"
img2_url = "https://cdn.galaxy.ai/user_2urgq79pytPKgx8tiLQTB9zI4Qn/93211709aabd461f91ebc45f537797e8.webp"

print("Downloading images...")
img1 = download_image(img1_url)   # 1125x2000 portrait
img2 = download_image(img2_url)   # 1536x1024 landscape

# ─── HELPER: Draw text with drop shadow ──────────────────────────────
def draw_shadowed_text(draw, pos, text, font, color=(255,255,255), shadow=(0,80,90), offset=4):
    x, y = pos
    draw.text((x+offset, y+offset), text, fill=shadow, font=font)
    draw.text((x, y), text, fill=color, font=font)

def center_text(draw, text, font, x1, x2, y):
    bb = draw.textbbox((0,0), text, font=font)
    tw = bb[2]-bb[0]
    cx = (x1+x2)//2
    return cx - tw//2, y

def fit_font(draw_or_img, text, font_path, max_w, max_h, start_size=120, min_size=18):
    for sz in range(start_size, min_size-1, -2):
        try:
            f = ImageFont.truetype(font_path, sz)
        except:
            f = ImageFont.truetype(BOLD_FONT, sz)
        tmp = ImageDraw.Draw(draw_or_img) if isinstance(draw_or_img, Image.Image) else draw_or_img
        bb = tmp.textbbox((0,0), text, font=f)
        if (bb[2]-bb[0]) <= max_w and (bb[3]-bb[1]) <= max_h:
            return f
    return ImageFont.truetype(BOLD_FONT, min_size)

# ─────────────────────────────────────────────────────────────────────
#  BATH LANDSCAPE  (img2 — "Still looking for a Boca groomer?")
#  Changes: SDappointment.com, GOOGLEBATH coupon strip
# ─────────────────────────────────────────────────────────────────────
def make_bath_landscape(img):
    m = img.copy(); d = ImageDraw.Draw(m)
    TEAL = (120, 218, 219)

    # Cover old phone number line
    d.rectangle([(540, 812), (1020, 862)], fill=TEAL)
    f_book = ImageFont.truetype(BOLD_FONT, 30)
    text = "Book Now: SDappointment.com"
    x, y = center_text(d, text, f_book, 430, 1000, 820)
    draw_shadowed_text(d, (x,y), text, f_book, offset=2)

    # Coupon strip - BATH
    d.rounded_rectangle([(430,865),(1010,910)], radius=10, fill=(35, 130, 145))
    f_c = ImageFont.truetype(NARROW_BOLD, 20)
    coupon = "Use Code GOOGLEBATH · $20 Off Your First Bath"
    x, _ = center_text(d, coupon, f_c, 430, 1010, 0)
    d.text((x, 880), coupon, fill=(255,255,255), font=f_c)
    return m

# ─────────────────────────────────────────────────────────────────────
#  BATH PORTRAIT  (img1 — "Just Finished the Park?")
#  Changes: SDappointment.com, GOOGLEBATH coupon strip
# ─────────────────────────────────────────────────────────────────────
def make_bath_portrait(img):
    m = img.copy(); d = ImageDraw.Draw(m)
    FOOTER = (77, 165, 183)

    # Cover old footer
    d.rectangle([(0, 1920), (1125, 1968)], fill=FOOTER)
    f_f = ImageFont.truetype(BOLD_FONT, 26)
    text = "splashanddashogs.com/boca-raton  |  SDappointment.com"
    x, _ = center_text(d, text, f_f, 0, 1125, 0)
    d.text((x, 1929), text, fill=(255,255,255), font=f_f)

    # Coupon strip - BATH
    d.rectangle([(0, 1870), (1125, 1918)], fill=(35, 130, 145))
    f_c = ImageFont.truetype(BOLD_FONT, 26)
    coupon = "Use Code GOOGLEBATH · $20 Off Your First Bath"
    x, _ = center_text(d, coupon, f_c, 0, 1125, 0)
    d.text((x, 1880), coupon, fill=(255,255,255), font=f_c)
    return m

# ─────────────────────────────────────────────────────────────────────
#  GROOM LANDSCAPE  (img2 — repurposed for Groom)
#  Changes: Paint over "YOUR FIRST BATH" → "YOUR FIRST GROOM"
#           Paint over "Still looking for a Boca groomer?" header
#           GOOGLEGROOM coupon
# ─────────────────────────────────────────────────────────────────────
def make_groom_landscape(img):
    m = img.copy(); d = ImageDraw.Draw(m)
    TEAL = (120, 218, 219)
    TEAL_DARK = (95, 195, 200)

    # ── Replace "YOUR FIRST BATH" with "YOUR FIRST GROOM" ──
    # Text lives approx y=548-685, x=440-1050
    d.rectangle([(440, 542), (1055, 695)], fill=TEAL)

    # Try Anton for bold impact headline
    try:
        f_h = ImageFont.truetype(ANTON, 88)
        test_bb = d.textbbox((0,0), "YOUR FIRST GROOM", font=f_h)
        if (test_bb[2]-test_bb[0]) > 610:
            f_h = ImageFont.truetype(ANTON, 70)
    except:
        f_h = ImageFont.truetype(BOLD_FONT, 78)

    line1, line2 = "YOUR FIRST", "GROOM"
    # Line 1
    x1, _ = center_text(d, line1, f_h, 440, 1055, 0)
    draw_shadowed_text(d, (x1, 553), line1, f_h, color=(255,255,255), shadow=(10,90,100), offset=3)
    # Line 2
    try:
        f_h2 = ImageFont.truetype(ANTON, 108)
        bb2 = d.textbbox((0,0), line2, font=f_h2)
        if (bb2[2]-bb2[0]) > 610: f_h2 = ImageFont.truetype(ANTON, 90)
    except:
        f_h2 = f_h
    x2, _ = center_text(d, line2, f_h2, 440, 1055, 0)
    draw_shadowed_text(d, (x2, 618), line2, f_h2, color=(255,255,255), shadow=(10,90,100), offset=3)

    # ── Cover old phone, add SDappointment.com ──
    d.rectangle([(540, 812), (1020, 862)], fill=TEAL)
    f_book = ImageFont.truetype(BOLD_FONT, 30)
    text = "Book Now: SDappointment.com"
    x, _ = center_text(d, text, f_book, 430, 1000, 0)
    draw_shadowed_text(d, (x, 820), text, f_book, offset=2)

    # ── Coupon strip - GROOM ──
    d.rounded_rectangle([(430,865),(1010,910)], radius=10, fill=(35, 130, 145))
    f_c = ImageFont.truetype(NARROW_BOLD, 20)
    coupon = "Use Code GOOGLEGROOM · $20 Off Your First Groom"
    x, _ = center_text(d, coupon, f_c, 430, 1010, 0)
    d.text((x, 880), coupon, fill=(255,255,255), font=f_c)
    return m

# ─────────────────────────────────────────────────────────────────────
#  GROOM PORTRAIT  (img1 — repurposed for Groom)
#  Changes: Paint over "BATH AND BRUSH" → "FULL GROOM"
#           GOOGLEGROOM coupon
# ─────────────────────────────────────────────────────────────────────
def make_groom_portrait(img):
    m = img.copy(); d = ImageDraw.Draw(m)
    TEAL = (128, 216, 218)
    FOOTER = (77, 165, 183)

    # ── Replace "BATH AND BRUSH" with "FULL GROOM" ──
    # Text lives approx y=948-1260
    d.rectangle([(0, 945), (1125, 1268)], fill=TEAL)

    try:
        f_h = ImageFont.truetype(ANTON, 170)
        bb_test = d.textbbox((0,0), "GROOM", font=f_h)
        if (bb_test[2]-bb_test[0]) > 1090: f_h = ImageFont.truetype(ANTON, 145)
    except:
        f_h = ImageFont.truetype(BOLD_FONT, 150)

    try:
        f_sub = ImageFont.truetype(ANTON, 130)
    except:
        f_sub = ImageFont.truetype(BOLD_FONT, 120)

    # "FULL"
    x1, _ = center_text(d, "FULL", f_sub, 0, 1125, 0)
    draw_shadowed_text(d, (x1, 960), "FULL", f_sub, color=(255,255,255), shadow=(10,90,100), offset=5)
    # "GROOM"
    x2, _ = center_text(d, "GROOM", f_h, 0, 1125, 0)
    draw_shadowed_text(d, (x2, 1095), "GROOM", f_h, color=(255,255,255), shadow=(10,90,100), offset=5)

    # ── Cover old footer ──
    d.rectangle([(0, 1920), (1125, 1968)], fill=FOOTER)
    f_f = ImageFont.truetype(BOLD_FONT, 26)
    text = "splashanddashogs.com/boca-raton  |  SDappointment.com"
    x, _ = center_text(d, text, f_f, 0, 1125, 0)
    d.text((x, 1929), text, fill=(255,255,255), font=f_f)

    # ── Coupon strip - GROOM ──
    d.rectangle([(0, 1870), (1125, 1918)], fill=(35, 130, 145))
    f_c = ImageFont.truetype(BOLD_FONT, 26)
    coupon = "Use Code GOOGLEGROOM · $20 Off Your First Groom"
    x, _ = center_text(d, coupon, f_c, 0, 1125, 0)
    d.text((x, 1880), coupon, fill=(255,255,255), font=f_c)
    return m

# ─────────────────────────────────────────────────────────────────────
#  ANIMATED GIF BUILDER
# ─────────────────────────────────────────────────────────────────────
def make_animated_gif(source, target_w, target_h, focal_x, focal_y,
                      coupon_text, output_path):
    rgb_frames = []
    delays = []

    # Frames 1-5: Ken Burns zoom  0% → 5%
    ZOOM_FRAMES = 5
    for i in range(ZOOM_FRAMES):
        zoom = 1.0 + (i / (ZOOM_FRAMES - 1)) * 0.05
        src_w, src_h = source.size
        scale = max(target_w / src_w, target_h / src_h) * zoom
        nw, nh = int(src_w * scale), int(src_h * scale)
        resized = source.resize((nw, nh), Image.LANCZOS)
        left = max(0, min(int((nw - target_w) * focal_x), nw - target_w))
        top  = max(0, min(int((nh - target_h) * focal_y), nh - target_h))
        frame = resized.crop((left, top, left + target_w, top + target_h))
        rgb_frames.append(frame)
        delays.append(300)  # 300ms per zoom frame

    # Frame 6: Coupon-code FLASH (brightened background + highlight strip)
    flash = rgb_frames[-1].copy()
    fd = ImageDraw.Draw(flash)
    strip_h = max(22, target_h // 4)
    # Dark teal strip at bottom
    fd.rectangle([(0, target_h - strip_h), (target_w, target_h)], fill=(20, 95, 108))
    # White border top of strip
    fd.line([(0, target_h - strip_h), (target_w, target_h - strip_h)], fill=(255,215,0), width=2)

    # Fit coupon text inside strip
    for sz in range(min(target_w // 7, 22), 5, -1):
        try:
            fc = ImageFont.truetype(NARROW_BOLD, sz)
        except:
            fc = ImageFont.load_default()
        bb = fd.textbbox((0,0), coupon_text, font=fc)
        if (bb[2]-bb[0]) <= target_w - 6:
            break
    bb = fd.textbbox((0,0), coupon_text, font=fc)
    cw = bb[2]-bb[0]; ch = bb[3]-bb[1]
    cy = target_h - strip_h + (strip_h - ch) // 2
    fd.text(((target_w - cw)//2, cy), coupon_text, fill=(255,255,0), font=fc)

    rgb_frames.append(flash)
    delays.append(1200)   # coupon shown for 1.2 sec

    # Frame 7: Back to zoomed-out base (long hold = static per spec)
    hold = rgb_frames[0].copy()
    rgb_frames.append(hold)
    delays.append(4000)   # 4-sec hold

    # ── Quantize to palette for GIF ──
    # Use 64-128 colors; fewer for large sizes
    n_colors = 64 if (target_w * target_h) > 40000 else 128

    palette_ref = rgb_frames[0].quantize(colors=n_colors, method=Image.FASTOCTREE)
    pal_frames = []
    for f in rgb_frames:
        qf = f.quantize(colors=n_colors, method=Image.FASTOCTREE, palette=palette_ref)
        pal_frames.append(qf)

    pal_frames[0].save(
        output_path,
        save_all=True,
        append_images=pal_frames[1:],
        optimize=True,
        loop=0,
        duration=delays
    )

    # Post-optimize with gifsicle if available
    try:
        subprocess.run(
            ['gifsicle', '-O3', f'--colors={n_colors}', '-o', output_path, output_path],
            capture_output=True, timeout=60
        )
    except Exception:
        pass

    kb = os.path.getsize(output_path) / 1024
    return kb

# ─────────────────────────────────────────────────────────────────────
#  BUILD ALL SOURCES
# ─────────────────────────────────────────────────────────────────────
print("Building source variants...")
bath_land  = make_bath_landscape(img2)
bath_port  = make_bath_portrait(img1)
groom_land = make_groom_landscape(img2)
groom_port = make_groom_portrait(img1)
print("Sources ready.")

# ─────────────────────────────────────────────────────────────────────
#  AD UNIT CONFIGS
#  Bath:  728x90, 300x250, 300x600   → GOOGLEBATH
#  Groom: 320x50, 300x50, 160x600   → GOOGLEGROOM
# ─────────────────────────────────────────────────────────────────────
ads = [
    # (filename,                       w,   h,  src,       fx,   fy,   coupon)
    ("BATH_728x90_leaderboard",        728,  90, bath_land, 0.52, 0.42, "Code GOOGLEBATH · $20 Off Bath"),
    ("BATH_300x250_medium_rect",       300, 250, bath_land, 0.60, 0.50, "Code GOOGLEBATH · $20 Off Bath"),
    ("BATH_300x600_half_page",         300, 600, bath_port, 0.50, 0.44, "Code GOOGLEBATH · $20 Off Bath"),
    ("GROOM_320x50_mobile_leader",     320,  50, groom_land,0.52, 0.42, "Code GOOGLEGROOM · $20 Off Groom"),
    ("GROOM_300x50_mobile_banner",     300,  50, groom_land,0.52, 0.42, "Code GOOGLEGROOM · $20 Off Groom"),
    ("GROOM_160x600_skyscraper",       160, 600, groom_port,0.50, 0.44, "Code GOOGLEGROOM · $20 Off Groom"),
]

out_dir = "/home/user/ads_gif"
os.makedirs(out_dir, exist_ok=True)

print("\nGenerating animated GIFs...")
results = []
for name, w, h, src, fx, fy, coupon in ads:
    path = f"{out_dir}/{name}.gif"
    kb = make_animated_gif(src, w, h, fx, fy, coupon, path)
    ok = kb <= 150
    results.append((name, w, h, kb, ok))
    print(f"  {'OK ' if ok else 'BIG'} | {name}: {w}x{h} -> {kb:.1f}KB")

print("\n=== SUMMARY ===")
for name, w, h, kb, ok in results:
    print(f"  {'✅' if ok else '⚠️ '} {name}: {kb:.1f}KB")
