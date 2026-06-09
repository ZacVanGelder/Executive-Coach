#!/usr/bin/env python3
"""
Retargeting ads v2:
  - Logo in all 12 sizes
  - Banners (728x90, 320x50, 300x50) — clean minimal redesign
  - Standard sizes (300x250, 300x600, 160x600) — logo badge added
  - Head-tilt pendulum animation (replaces Ken Burns zoom)
"""
import os, subprocess, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# ── Paths ─────────────────────────────────────────────────────────────────────
BATH_SRC  = "/home/user/magica/retargeting_src_bath.png"
GROOM_SRC = "/home/user/magica/retargeting_src_groom.png"
LOGO_SRC  = "/home/user/magica/sd_logo.png"
OUT_PNG   = "/home/user/retargeting_v2/pngs"
OUT_GIF   = "/home/user/retargeting_v2/gifs"
for d in [OUT_PNG, OUT_GIF]:
    os.makedirs(d, exist_ok=True)

# ── Fonts ─────────────────────────────────────────────────────────────────────
FONT_PATH = "/home/user/Anton-Regular.ttf"
FONT_FALL = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
def load_font(size):
    try:    return ImageFont.truetype(FONT_PATH, max(6, size))
    except: return ImageFont.truetype(FONT_FALL, max(6, size))

# ── Brand Colors ──────────────────────────────────────────────────────────────
TEAL   = (43,  122, 120)
ORANGE = (244,  99,  30)
WHITE  = (255, 255, 255)
DARK   = ( 30,  30,  30)
TEAL_A220  = (43, 122, 120, 220)

# ── Logo prep (trim white border, return RGBA) ────────────────────────────────
def prep_logo(max_h):
    """Load logo, trim white edges, return RGBA image scaled to max_h."""
    logo = Image.open(LOGO_SRC).convert("RGBA")
    # Simple white-bg removal: make near-white pixels transparent
    data = logo.getdata()
    new_data = []
    for r, g, b, a in data:
        if r > 240 and g > 240 and b > 240:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append((r, g, b, a))
    logo.putdata(new_data)
    # Crop to content
    bbox = logo.getbbox()
    if bbox:
        logo = logo.crop(bbox)
    # Scale to max_h
    w, h = logo.size
    scale = max_h / h
    nw = max(1, int(w * scale))
    logo = logo.resize((nw, max_h), Image.LANCZOS)
    return logo

# ── Helpers ───────────────────────────────────────────────────────────────────
def cover_crop(img, tw, th):
    sw, sh = img.size
    scale  = max(tw / sw, th / sh)
    nw, nh = int(sw * scale + .5), int(sh * scale + .5)
    img    = img.resize((nw, nh), Image.LANCZOS)
    x = (nw - tw) // 2
    y = (nh - th) // 2
    return img.crop((x, y, x + tw, y + th))

def draw_centered(draw, text, font, y, W, color=WHITE, shadow=True):
    bb = draw.textbbox((0, 0), text, font=font)
    tw = bb[2] - bb[0]
    x  = (W - tw) // 2
    if shadow:
        draw.text((x+1, y+1), text, font=font, fill=(0,0,0,100))
    draw.text((x, y), text, font=font, fill=color)
    return bb[3] - bb[1]   # return text height

def text_wh(draw, text, font):
    bb = draw.textbbox((0, 0), text, font=font)
    return bb[2]-bb[0], bb[3]-bb[1]

# ── Copy ──────────────────────────────────────────────────────────────────────
COPY = {
    "bath": {
        "banner_line1": "Boca's Dog Spa",
        "banner_line2": "$20 Off · Book at SDappointment.com",
        "strip_text":   "$20 Off · BATH20",
        "cta":          "Book Now",
        "code":         "BATH20",
        "std_headline": "Boca's Dog Spa.",
        "std_offer":    "$20 Off Your First Visit",
        "std_code":     "Code: BATH20",
        "std_cta":      "SDappointment.com",
    },
    "groom": {
        "banner_line1": "Your Dog Has a Request.",
        "banner_line2": "$20 Off Groom · SDappointment.com",
        "strip_text":   "$20 Off · GRM20",
        "cta":          "Book Now",
        "code":         "GRM20",
        "std_headline": "Your Dog Would Like",
        "std_headline2":"A Word With You.",
        "std_offer":    "$20 Off Your First Groom",
        "std_code":     "Code: GRM20",
        "std_cta":      "SDappointment.com",
    },
}

SIZES = [
    ("300x250", 300, 250,  "MediumRect"),
    ("300x600", 300, 600,  "HalfPage"),
    ("160x600", 160, 600,  "Skyscraper"),
    ("728x90",  728,  90,  "Leaderboard"),
    ("320x50",  320,  50,  "MobileLeader"),
    ("300x50",  300,  50,  "MobileBanner"),
]
BANNER_SIZES = {"728x90", "320x50", "300x50"}

# ── BANNER COMPOSER (clean, minimal) ─────────────────────────────────────────
def compose_banner(src_img, W, H, cp, logo_img):
    """
    Layout: [white logo zone] [teal: 1 or 2 lines copy] [orange CTA]
    Very clean, minimal text, handles tiny mobile sizes gracefully.
    """
    base = Image.new("RGB", (W, H), TEAL)

    if H >= 80:
        # ── 728×90 ────────────────────────────────────────────────────────────
        logo_h   = int(H * 0.72)
        logo     = prep_logo(logo_h)
        logo_w   = logo.size[0]
        cta_w    = 148
        pad      = 12
        logo_zone_w = logo_w + pad * 2

        # White logo zone
        draw = ImageDraw.Draw(base)
        draw.rectangle([(0, 0), (logo_zone_w, H)], fill=(248, 248, 248))
        # Subtle right edge shadow
        for i in range(6):
            alpha_val = int(40 * (1 - i/6))
            draw.rectangle([(logo_zone_w+i, 0), (logo_zone_w+i+1, H)],
                           fill=(200-i*5, 200-i*5, 200-i*5))

        # Paste logo centered in logo zone
        lx = pad
        ly = (H - logo_h) // 2
        base.paste(logo, (lx, ly), logo)

        # Teal center text zone
        text_start = logo_zone_w + 10
        text_end   = W - cta_w - 4
        text_w     = text_end - text_start

        f_line1 = load_font(int(H * 0.34))
        f_line2 = load_font(int(H * 0.24))

        l1_w, l1_h = text_wh(draw, cp["banner_line1"], f_line1)
        l2_w, l2_h = text_wh(draw, cp["banner_line2"], f_line2)
        total_h    = l1_h + 4 + l2_h
        y_start    = (H - total_h) // 2

        # Line 1 — bright white headline
        draw.text((text_start, y_start), cp["banner_line1"],
                  font=f_line1, fill=WHITE)
        # Line 2 — soft yellow-white sub
        draw.text((text_start, y_start + l1_h + 4), cp["banner_line2"],
                  font=f_line2, fill=(255, 230, 180))

        # Orange CTA zone (right)
        draw.rectangle([(W - cta_w, 0), (W, H)], fill=ORANGE)
        # Thin divider
        draw.rectangle([(W - cta_w - 2, 0), (W - cta_w, H)],
                       fill=(200, 60, 10))

        f_cta = load_font(int(H * 0.33))
        cta_text = "Book Now"
        cta_w_px, cta_h_px = text_wh(draw, cta_text, f_cta)
        ctx = W - cta_w + (cta_w - cta_w_px) // 2
        cty = (H - cta_h_px) // 2
        draw.text((ctx+1, cty+1), cta_text, font=f_cta, fill=(180,40,0))
        draw.text((ctx, cty), cta_text, font=f_cta, fill=WHITE)

    else:
        # ── 320×50 / 300×50 — ultra-minimal ──────────────────────────────────
        logo_h   = int(H * 0.78)
        logo     = prep_logo(logo_h)
        logo_w   = logo.size[0]
        logo_zone_w = logo_w + 8

        draw = ImageDraw.Draw(base)
        # White logo zone
        draw.rectangle([(0, 0), (logo_zone_w, H)], fill=(248, 248, 248))

        lx = 4
        ly = (H - logo_h) // 2
        base.paste(logo, (lx, ly), logo)

        # CTA zone right
        cta_w = min(80, W // 3)
        draw.rectangle([(W - cta_w, 0), (W, H)], fill=ORANGE)

        # Center text: just one clean line
        f_mid  = load_font(int(H * 0.42))
        mid_text = cp["strip_text"]
        mid_w, mid_h = text_wh(draw, mid_text, f_mid)
        avail = W - logo_zone_w - cta_w - 8
        # If text too wide, truncate font
        while mid_w > avail and f_mid.size > 7:
            f_mid = load_font(f_mid.size - 1)
            mid_w, mid_h = text_wh(draw, mid_text, f_mid)
        mx = logo_zone_w + 4 + (avail - mid_w) // 2
        my = (H - mid_h) // 2
        draw.text((mx, my), mid_text, font=f_mid, fill=WHITE)

        # CTA
        f_cta  = load_font(int(H * 0.36))
        cta_t  = "Book"
        cta_tw, cta_th = text_wh(draw, cta_t, f_cta)
        ctx = W - cta_w + (cta_w - cta_tw) // 2
        cty = (H - cta_th) // 2
        draw.text((ctx, cty), cta_t, font=f_cta, fill=WHITE)

    return base


# ── STANDARD COMPOSER (300x250, 300x600, 160x600) + logo ──────────────────────
def compose_standard(src_img, W, H, cp, logo_img):
    img  = cover_crop(src_img.copy(), W, H)
    base = img.convert("RGBA")

    overlay = Image.new("RGBA", (W, H), (0,0,0,0))
    d2 = ImageDraw.Draw(overlay)

    band_y = int(H * 0.55)
    d2.rectangle([(0, band_y), (W, H)], fill=(43,122,120,225))
    for i in range(40):
        alpha = int(200 * i / 40)
        d2.rectangle([(0, band_y-i), (W, band_y-i+1)],
                     fill=(43,122,120, alpha))

    base = Image.alpha_composite(base, overlay)
    draw = ImageDraw.Draw(base)

    # Orange strip at bottom
    strip_h = max(18, int(H * 0.09))
    draw.rectangle([(0, H - strip_h), (W, H)], fill=ORANGE)

    # ── Logo badge (top-left of the teal band) ───────────────────────────────
    logo_h = max(20, min(int((H - band_y) * 0.38), 44))
    logo   = prep_logo(logo_h)
    lw     = logo.size[0]
    logo_x = 8
    logo_y = band_y + 6
    # White pill behind logo
    pad = 5
    draw.rounded_rectangle(
        [(logo_x - pad, logo_y - pad),
         (logo_x + lw + pad, logo_y + logo_h + pad)],
        radius=6, fill=(255,255,255,230)
    )
    base.paste(logo, (logo_x, logo_y), logo)

    # ── Text ─────────────────────────────────────────────────────────────────
    f_scale = W / 300.0
    f_head  = load_font(max(13, int(24 * f_scale)))
    f_offer = load_font(max(10, int(18 * f_scale)))
    f_code  = load_font(max(9,  int(14 * f_scale)))
    f_cta   = load_font(max(8,  int(13 * f_scale)))

    # y starts after logo badge
    y = logo_y + logo_h + pad + int(6 * f_scale)

    if "std_headline2" in cp:
        h1_h = draw_centered(draw, cp["std_headline"],  f_head, y, W)
        y += h1_h + 2
        h2_h = draw_centered(draw, cp["std_headline2"], f_head, y, W)
        y += h2_h + int(6 * f_scale)
    else:
        h1_h = draw_centered(draw, cp["std_headline"], f_head, y, W)
        y += h1_h + int(6 * f_scale)

    draw_centered(draw, cp["std_offer"], f_offer, y, W, color=(255,225,150))
    _, off_h = text_wh(draw, cp["std_offer"], f_offer)
    y += off_h + int(5 * f_scale)

    # Coupon code badge
    code_t = cp["std_code"]
    cw, ch = text_wh(draw, code_t, f_code)
    bpad   = int(7 * f_scale)
    bx     = (W - cw - bpad*2) // 2
    by     = y
    draw.rounded_rectangle(
        [(bx, by), (bx + cw + bpad*2, by + ch + int(5*f_scale))],
        radius=4, fill=ORANGE
    )
    draw.text((bx + bpad, by + int(2*f_scale)), code_t, font=f_code, fill=WHITE)
    y += ch + int(10 * f_scale)

    # CTA in orange strip
    cta_y = H - strip_h + max(2, (strip_h - ch) // 2)
    draw_centered(draw, cp["std_cta"], f_cta, cta_y, W, shadow=False)

    return base.convert("RGB")


# ── HEAD TILT ANIMATION ────────────────────────────────────────────────────────
def make_tilt_gif(png_path, gif_path):
    """
    Pendulum head-tilt: 5 frames at [-5°, -2°, 0°, +2°, +5°] then hold.
    Fill edges with TEAL to mask rotation artifacts.
    """
    img = Image.open(png_path).convert("RGB")
    W, H = img.size

    # Angles for pendulum swing (degrees)
    angles  = [-5, -2.5, 0, 2.5, 5, 2.5, 0, -2.5]
    a_delays = [180, 150, 150, 150, 180, 150, 150, 150]
    # Hold last frame
    hold_delay = 2000

    n_colors = 48
    # Build palette from the 0° frame for consistency
    palette_src = img.quantize(colors=n_colors, method=Image.FASTOCTREE)

    frames = []
    delays = []

    for angle, delay in zip(angles, a_delays):
        if angle == 0:
            rotated = img.copy()
        else:
            rotated = img.rotate(
                angle,
                resample=Image.BICUBIC,
                expand=False,
                fillcolor=TEAL   # teal fill at corners
            )
        fq = rotated.quantize(palette=palette_src, dither=0)
        frames.append(fq)
        delays.append(delay)

    # Hold frame (0° again)
    hold_frame = img.quantize(palette=palette_src, dither=0)
    frames.append(hold_frame)
    delays.append(hold_delay)

    frames[0].save(
        gif_path,
        save_all=True,
        append_images=frames[1:],
        optimize=False,
        loop=0,
        duration=delays,
    )

    # Optimize
    size  = os.path.getsize(gif_path)
    lossy = 60
    while size > 150_000 and lossy <= 120:
        subprocess.run(
            ["gifsicle", "-O3", f"--lossy={lossy}", "-o", gif_path, gif_path],
            capture_output=True,
        )
        size  = os.path.getsize(gif_path)
        lossy += 20

    if size > 150_000:
        for nc in [32, 24, 16]:
            pal2 = img.quantize(colors=nc, method=Image.FASTOCTREE)
            f2   = []
            for angle, delay in zip(angles, a_delays):
                rotated = img.rotate(angle, resample=Image.BICUBIC,
                                     expand=False, fillcolor=TEAL)
                f2.append(rotated.quantize(palette=pal2, dither=0))
            f2.append(img.quantize(palette=pal2, dither=0))
            f2[0].save(gif_path, save_all=True, append_images=f2[1:],
                       optimize=False, loop=0, duration=delays)
            subprocess.run(["gifsicle", "-O3", "--lossy=80",
                            "-o", gif_path, gif_path], capture_output=True)
            size = os.path.getsize(gif_path)
            if size <= 150_000:
                break

    return size


# ── PRE-LOAD SOURCES ──────────────────────────────────────────────────────────
bath_src  = Image.open(BATH_SRC).convert("RGB")
groom_src = Image.open(GROOM_SRC).convert("RGB")
logo_ref  = Image.open(LOGO_SRC)   # lazy ref; prep_logo() handles per-use

campaigns = [
    ("BATH",  bath_src,  COPY["bath"]),
    ("GROOM", groom_src, COPY["groom"]),
]

results = []
for cam_name, src, cp in campaigns:
    for slug, W, H, label in SIZES:
        png_path = f"{OUT_PNG}/{cam_name}_RETARG2_{slug}_{label}.png"
        gif_path = f"{OUT_GIF}/{cam_name}_RETARG2_{slug}_{label}.gif"

        if slug in BANNER_SIZES:
            img = compose_banner(src, W, H, cp, logo_ref)
        else:
            img = compose_standard(src, W, H, cp, logo_ref)

        img.save(png_path)

        size = make_tilt_gif(png_path, gif_path)
        kb   = size / 1024
        flag = "✅" if kb <= 150 else "⚠️  OVER"
        print(f"{flag} {cam_name} {slug}: {kb:.1f} KB")
        results.append((cam_name, slug, kb))

print("\n── Summary ─────────────────────────────")
over = [r for r in results if r[2] > 150]
if over:
    for r in over:
        print(f"  OVER: {r[0]} {r[1]} = {r[2]:.1f} KB")
else:
    print("  All 12 GIFs under 150 KB ✅")
