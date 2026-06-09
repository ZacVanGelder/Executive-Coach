#!/usr/bin/env python3
"""
Build 12 retargeting GIF ads:
  Option 1 (Bath)  – 6 sizes, code BATH20
  Option 2 (Groom) – 6 sizes, code GRM20
"""
import os, subprocess
from PIL import Image, ImageDraw, ImageFont

# ── Paths ────────────────────────────────────────────────────────────────────
BATH_SRC  = "/home/user/magica/retargeting_src_bath.png"
GROOM_SRC = "/home/user/magica/retargeting_src_groom.png"
OUT_PNG   = "/home/user/retargeting/pngs"
OUT_GIF   = "/home/user/retargeting/gifs"
os.makedirs(OUT_PNG, exist_ok=True)
os.makedirs(OUT_GIF, exist_ok=True)

# ── Fonts ─────────────────────────────────────────────────────────────────────
FONT_PATH  = "/home/user/Anton-Regular.ttf"
FONT_FALL  = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
def load_font(size):
    try:    return ImageFont.truetype(FONT_PATH, size)
    except: return ImageFont.truetype(FONT_FALL, size)

# ── Brand Colors ─────────────────────────────────────────────────────────────
TEAL   = (43,  122, 120)
ORANGE = (244,  99,  30)
WHITE  = (255, 255, 255)
DARK   = ( 30,  30,  30)
TEAL_A90   = (43, 122, 120, 230)   # semi-transparent overlay
ORANGE_A100= (244, 99,  30, 255)

# ── Helpers ───────────────────────────────────────────────────────────────────
def cover_crop(img, tw, th):
    sw, sh = img.size
    scale  = max(tw / sw, th / sh)
    nw, nh = int(sw * scale + .5), int(sh * scale + .5)
    img    = img.resize((nw, nh), Image.LANCZOS)
    x = (nw - tw) // 2
    y = (nh - th) // 2
    return img.crop((x, y, x + tw, y + th))

def draw_text_centered(draw, text, font, y, width, color=WHITE, shadow=True):
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    x  = (width - tw) // 2
    if shadow:
        draw.text((x+2, y+2), text, font=font, fill=(0,0,0,120))
    draw.text((x, y), text, font=font, fill=color)

def draw_text_right(draw, text, font, y, width, color=WHITE, pad=10):
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    x  = width - tw - pad
    draw.text((x+1, y+1), text, font=font, fill=(0,0,0,120))
    draw.text((x, y), text, font=font, fill=color)

def text_h(draw, text, font):
    bbox = draw.textbbox((0,0), text, font=font)
    return bbox[3] - bbox[1]

# ── Ad Specs ──────────────────────────────────────────────────────────────────
SIZES = [
    ("300x250",   300, 250,  "MediumRect"),
    ("300x600",   300, 600,  "HalfPage"),
    ("160x600",   160, 600,  "Skyscraper"),
    ("728x90",    728,  90,  "Leaderboard"),
    ("320x50",    320,  50,  "MobileLeader"),
    ("300x50",    300,  50,  "MobileBanner"),
]

# ── Copy definitions ──────────────────────────────────────────────────────────
COPY = {
    "bath": {
        "headline":    "Boca's Dog Spa.",
        "subhead":     "$20 Off Your First Visit.",
        "body":        "Bath · Blowout · Brush",
        "code":        "Use Code: BATH20",
        "cta":         "Book at SDappointment.com",
        "color_code":  ORANGE,
    },
    "groom": {
        "headline":    "Your dog would like",
        "headline2":   "a word with you.",
        "subhead":     "$20 Off Your First Groom.",
        "body":        "Full Groom · Certified Stylists",
        "code":        "Use Code: GRM20",
        "cta":         "Book at SDappointment.com",
        "color_code":  ORANGE,
    },
}

# ─────────────────────────────────────────────────────────────────────────────
# COMPOSITOR: draws one PNG for each size × option
# ─────────────────────────────────────────────────────────────────────────────

def compose_standard(src_img, W, H, cp, label):
    """
    For 300x250, 300x600, 160x600:
      - dog photo fills top ~65%
      - teal band fills bottom ~35% with text
    """
    img  = cover_crop(src_img.copy(), W, H)
    base = img.convert("RGBA")

    # Overlay: semi-transparent teal band from 60% down
    overlay = Image.new("RGBA", (W, H), (0,0,0,0))
    d2 = ImageDraw.Draw(overlay)
    band_y = int(H * 0.55)
    d2.rectangle([(0, band_y), (W, H)], fill=TEAL_A90)
    # Top gradient shadow so dog doesn't look cut off
    for i in range(30):
        alpha = int(90 * i / 30)
        d2.rectangle([(0, band_y - i), (W, band_y - i + 1)], fill=(43,122,120,alpha))
    base = Image.alpha_composite(base, overlay)
    draw = ImageDraw.Draw(base)

    # Orange bottom strip for CTA
    strip_h = max(20, int(H * 0.10))
    draw.rectangle([(0, H - strip_h), (W, H)], fill=ORANGE)

    # Scale font sizes to canvas width
    f_scale = W / 300.0
    f_head  = load_font(max(14, int(26 * f_scale)))
    f_sub   = load_font(max(11, int(19 * f_scale)))
    f_body  = load_font(max(10, int(15 * f_scale)))
    f_code  = load_font(max(10, int(15 * f_scale)))
    f_cta   = load_font(max(9,  int(14 * f_scale)))

    y = band_y + int(8 * f_scale)

    if "headline2" in cp:
        # Two-line headline
        draw_text_centered(draw, cp["headline"],  f_head, y, W)
        y += text_h(draw, cp["headline"], f_head) + int(2 * f_scale)
        draw_text_centered(draw, cp["headline2"], f_head, y, W)
        y += text_h(draw, cp["headline2"], f_head) + int(6 * f_scale)
    else:
        draw_text_centered(draw, cp["headline"],  f_head, y, W)
        y += text_h(draw, cp["headline"], f_head) + int(6 * f_scale)

    draw_text_centered(draw, cp["subhead"], f_sub, y, W, color=(255,220,160))
    y += text_h(draw, cp["subhead"], f_sub) + int(4 * f_scale)

    draw_text_centered(draw, cp["body"], f_body, y, W, color=(200,240,238))
    y += text_h(draw, cp["body"], f_body) + int(6 * f_scale)

    # Code badge
    code_text = cp["code"]
    badge_bbox = draw.textbbox((0,0), code_text, font=f_code)
    bw = badge_bbox[2] - badge_bbox[0] + int(16 * f_scale)
    bh = badge_bbox[3] - badge_bbox[1] + int(8 * f_scale)
    bx = (W - bw) // 2
    draw.rounded_rectangle([(bx, y), (bx+bw, y+bh)], radius=4, fill=ORANGE)
    draw.text((bx + int(8*f_scale), y + int(4*f_scale)), code_text, font=f_code, fill=WHITE)
    y += bh + int(4*f_scale)

    # CTA in orange strip
    cta_y = H - strip_h + max(2, (strip_h - text_h(draw, cp["cta"], f_cta)) // 2)
    draw_text_centered(draw, cp["cta"], f_cta, cta_y, W, shadow=False)

    return base.convert("RGB")


def compose_banner(src_img, W, H, cp, label):
    """
    For 728x90, 320x50, 300x50:
      - dog photo on LEFT portion
      - teal center with abbreviated copy
      - orange CTA zone on RIGHT
    """
    base = Image.new("RGB", (W, H), TEAL)
    draw_base = ImageDraw.Draw(base)

    # Dog crop – square crop of source, scaled to fill height
    dog = cover_crop(src_img.copy(), H, H)  # square at banner height
    base.paste(dog, (0, 0))

    # Teal fill rest
    draw_base.rectangle([(H, 0), (W, H)], fill=TEAL)

    # Sizing
    cta_w   = max(W // 4, int(W * 0.28))
    text_x  = H + 6
    text_w  = W - H - cta_w - 6

    # Orange CTA zone right side
    draw_base.rectangle([(W - cta_w, 0), (W, H)], fill=ORANGE)

    # Vertical separator teal→orange
    draw_base.rectangle([(W - cta_w - 3, 0), (W - cta_w, H)], fill=(220,80,10))

    draw = ImageDraw.Draw(base)

    if H >= 80:
        # 728x90 — two lines + code
        f_head = load_font(max(10, int(H * 0.30)))
        f_sub  = load_font(max(8,  int(H * 0.22)))
        f_cta  = load_font(max(8,  int(H * 0.22)))
        f_code = load_font(max(8,  int(H * 0.20)))

        headline = cp.get("headline", "") + (" " + cp.get("headline2","") if "headline2" in cp else "")
        th1 = text_h(draw, headline, f_head)
        th2 = text_h(draw, cp["subhead"], f_sub)
        total_h = th1 + 4 + th2
        y = (H - total_h) // 2

        draw.text((text_x, y),      headline,      font=f_head, fill=WHITE)
        draw.text((text_x, y+th1+4), cp["subhead"], font=f_sub,  fill=(255,220,160))

        # Code badge bottom-right of text zone
        code_text = cp["code"]
        code_bbox = draw.textbbox((0,0), code_text, font=f_code)
        cw = code_bbox[2] - code_bbox[0]
        cx = text_x + text_w - cw - 4
        cy = H - (code_bbox[3] - code_bbox[1]) - 4
        draw.text((cx, cy), code_text, font=f_code, fill=ORANGE)

        # CTA
        cta_text = "Book Now"
        ct_bbox  = draw.textbbox((0,0), cta_text, font=f_cta)
        ct_h     = ct_bbox[3] - ct_bbox[1]
        ct_w     = ct_bbox[2] - ct_bbox[0]
        ct_x     = W - cta_w + (cta_w - ct_w) // 2
        ct_y     = (H - ct_h) // 2
        draw.text((ct_x, ct_y), cta_text, font=f_cta, fill=WHITE)

        # SDappointment line below CTA
        f_url  = load_font(max(6, int(H * 0.14)))
        url_text = "SDappointment.com"
        url_bbox = draw.textbbox((0,0), url_text, font=f_url)
        uw = url_bbox[2] - url_bbox[0]
        ux = W - cta_w + (cta_w - uw) // 2
        uy = ct_y + ct_h + 3
        draw.text((ux, uy), url_text, font=f_url, fill=(255,230,200))

    else:
        # 320x50 / 300x50 — single tight line
        f_head = load_font(max(8, int(H * 0.36)))
        f_cta  = load_font(max(7, int(H * 0.30)))

        if "headline2" in cp:
            headline = "Your dog has something to say."
        else:
            headline = "Boca's Dog Spa · $20 Off"
        code = cp["code"].replace("Use Code: ", "")

        th = text_h(draw, headline, f_head)
        y  = (H - th) // 2
        draw.text((text_x, y), headline, font=f_head, fill=WHITE)

        # Code
        f_code = load_font(max(7, int(H * 0.28)))
        code_bbox = draw.textbbox((0,0), code, font=f_code)
        cw = code_bbox[2] - code_bbox[0]
        cx = W - cta_w + (cta_w - cw) // 2
        cy = (H - (code_bbox[3]-code_bbox[1])) // 2
        draw.text((cx, cy), code, font=f_code, fill=WHITE)

    return base


# ─────────────────────────────────────────────────────────────────────────────
# GIF ANIMATOR  (Ken Burns zoom + hold, <150KB)
# ─────────────────────────────────────────────────────────────────────────────

def make_gif(png_path, gif_path):
    img = Image.open(png_path).convert("RGB")
    W, H = img.size
    area = W * H

    if area > 200_000:
        n_anim, zoom_max, n_colors = 3, 0.025, 48
    else:
        n_anim, zoom_max, n_colors = 3, 0.020, 48

    palette_src = img.quantize(colors=n_colors, method=Image.FASTOCTREE)
    frames      = []
    anim_delay  = 350

    for i in range(n_anim):
        zoom = zoom_max * i / max(1, n_anim - 1)
        nw   = int(W * (1 + zoom) + .5)
        nh   = int(H * (1 + zoom) + .5)
        frame = img.resize((nw, nh), Image.LANCZOS)
        x = (nw - W) // 2
        y = (nh - H) // 2
        frame = frame.crop((x, y, x + W, y + H))
        fq    = frame.quantize(palette=palette_src, dither=0)
        frames.append(fq)

    hold = frames[-1].copy()
    frames.append(hold)

    delays = [anim_delay] * n_anim + [5000]

    frames[0].save(
        gif_path,
        save_all=True,
        append_images=frames[1:],
        optimize=False,
        loop=0,
        duration=delays,
    )

    # Optimize with gifsicle
    size = os.path.getsize(gif_path)
    lossy = 60
    while size > 150_000 and lossy <= 120:
        subprocess.run(
            ["gifsicle", "-O3", f"--lossy={lossy}", "-o", gif_path, gif_path],
            capture_output=True,
        )
        size = os.path.getsize(gif_path)
        lossy += 20

    if size > 150_000:
        for nc in [32, 24, 16]:
            pal2 = img.quantize(colors=nc, method=Image.FASTOCTREE)
            frames2 = []
            for i in range(n_anim):
                zoom  = zoom_max * i / max(1, n_anim - 1)
                nw    = int(W * (1 + zoom) + .5)
                nh    = int(H * (1 + zoom) + .5)
                frame = img.resize((nw, nh), Image.LANCZOS)
                x     = (nw - W) // 2
                y     = (nh - H) // 2
                frame = frame.crop((x, y, x + W, y + H))
                frames2.append(frame.quantize(palette=pal2, dither=0))
            hold2 = frames2[-1].copy()
            frames2.append(hold2)
            frames2[0].save(gif_path, save_all=True, append_images=frames2[1:],
                            optimize=False, loop=0, duration=delays)
            subprocess.run(["gifsicle", "-O3", "--lossy=80", "-o", gif_path, gif_path],
                           capture_output=True)
            size = os.path.getsize(gif_path)
            if size <= 150_000:
                break

    return size

# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────

bath_src  = Image.open(BATH_SRC).convert("RGB")
groom_src = Image.open(GROOM_SRC).convert("RGB")

campaigns = [
    ("BATH",  bath_src,  COPY["bath"]),
    ("GROOM", groom_src, COPY["groom"]),
]

BANNER_SIZES = {"728x90", "320x50", "300x50"}

results = []
for cam_name, src, cp in campaigns:
    for slug, W, H, label in SIZES:
        png_path = f"{OUT_PNG}/{cam_name}_RETARG_{slug}_{label}.png"
        gif_path = f"{OUT_GIF}/{cam_name}_RETARG_{slug}_{label}.gif"

        if slug in BANNER_SIZES:
            img = compose_banner(src, W, H, cp, label)
        else:
            img = compose_standard(src, W, H, cp, label)

        img.save(png_path)

        size = make_gif(png_path, gif_path)
        kb   = size / 1024
        status = "✅" if kb <= 150 else "⚠️ OVER"
        print(f"{status} {cam_name} {slug}: {kb:.1f} KB")
        results.append((cam_name, slug, kb))

print("\n── Summary ──────────────────────────────")
over = [r for r in results if r[2] > 150]
if over:
    for r in over: print(f"  OVER 150KB: {r[0]} {r[1]} = {r[2]:.1f} KB")
else:
    print("  All 12 GIFs under 150 KB ✅")
