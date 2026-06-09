
from PIL import Image, ImageDraw, ImageFont
import requests, os, subprocess
from io import BytesIO

NARROW_BOLD = "/usr/share/fonts/truetype/liberation/LiberationSansNarrow-Bold.ttf"

SOURCES = {
    "bath_h":  "https://galaxy-prod.tlcdn.com/gen/user_2urgq79pytPKgx8tiLQTB9zI4Qn/796073f9-c43a-49ee-ac46-043b1e9e440f.jpg",
    "bath_v":  "https://galaxy-prod.tlcdn.com/gen/user_2urgq79pytPKgx8tiLQTB9zI4Qn/8bd3901e-d7db-4aa6-9989-5089bed3c78f.jpg",
    "groom_h": "https://galaxy-prod.tlcdn.com/gen/user_2urgq79pytPKgx8tiLQTB9zI4Qn/e4529844-34a8-46d4-b759-50deac97f8d3.jpg",
    "groom_v": "https://galaxy-prod.tlcdn.com/gen/user_2urgq79pytPKgx8tiLQTB9zI4Qn/fae92504-4470-4751-86f3-410aac831804.jpg",
}

def dl(url):
    r = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
    return Image.open(BytesIO(r.content)).convert("RGB")

print("Downloading masters...")
imgs = {k: dl(v) for k, v in SOURCES.items()}

def smart_crop(source, tw, th, fx=0.5, fy=0.4):
    """Cover-crop with focal point."""
    sw, sh = source.size
    scale = max(tw/sw, th/sh)
    nw, nh = int(sw*scale), int(sh*scale)
    rs = source.resize((nw, nh), Image.LANCZOS)
    left = max(0, min(int((nw-tw)*fx), nw-tw))
    top  = max(0, min(int((nh-th)*fy), nh-th))
    return rs.crop((left, top, left+tw, top+th))

def make_gif(source, tw, th, fx, fy, outpath, n_colors=48, n_zoom=4):
    """Ken Burns zoom-in animation."""
    rgb = []
    delays = []

    for i in range(n_zoom):
        zoom = 1.0 + (i / max(n_zoom-1, 1)) * 0.04
        sw, sh = source.size
        scale = max(tw/sw, th/sh) * zoom
        nw, nh = int(sw*scale), int(sh*scale)
        rs = source.resize((nw, nh), Image.LANCZOS)
        left = max(0, min(int((nw-tw)*fx), nw-tw))
        top  = max(0, min(int((nh-th)*fy), nh-th))
        rgb.append(rs.crop((left, top, left+tw, top+th)))
        delays.append(350)

    # Hold frame (long static tail, per spec max 15s loop)
    rgb.append(rgb[0].copy())
    delays.append(5000)

    # Quantize
    pal = rgb[0].quantize(colors=n_colors, method=Image.FASTOCTREE)
    pf  = [f.quantize(colors=n_colors, method=Image.FASTOCTREE, palette=pal) for f in rgb]

    pf[0].save(outpath, save_all=True, append_images=pf[1:],
               optimize=True, loop=0, duration=delays)

    # Gifsicle compress
    lossy = 80
    subprocess.run(['gifsicle', '-O3', f'--colors={n_colors}',
                    f'--lossy={lossy}', '-o', outpath, outpath],
                   capture_output=True, timeout=60)
    return os.path.getsize(outpath) / 1024

# ─── Ad configs ─────────────────────────────────────────────────────
# (filename_prefix, w, h, src_key, focal_x, focal_y, n_colors, n_zoom)
# Bath uses bath_h (horizontal) or bath_v (vertical)
# Groom uses groom_h or groom_v
CONFIGS = [
    # ── BATH ADS ──
    ("BATH_728x90_Leaderboard",        728,  90,  "bath_h",  0.50, 0.42, 32, 4),
    ("BATH_300x250_MediumRect",        300, 250,  "bath_h",  0.55, 0.45, 40, 4),
    ("BATH_320x50_MobileLeader",       320,  50,  "bath_h",  0.50, 0.42, 48, 4),
    ("BATH_300x50_MobileBanner",       300,  50,  "bath_h",  0.50, 0.42, 48, 4),
    ("BATH_300x600_HalfPage",          300, 600,  "bath_v",  0.50, 0.42, 32, 3),
    ("BATH_160x600_Skyscraper",        160, 600,  "bath_v",  0.50, 0.42, 32, 3),
    # ── GROOM ADS ──
    ("GROOM_728x90_Leaderboard",       728,  90,  "groom_h", 0.50, 0.42, 32, 4),
    ("GROOM_300x250_MediumRect",       300, 250,  "groom_h", 0.55, 0.45, 40, 4),
    ("GROOM_320x50_MobileLeader",      320,  50,  "groom_h", 0.50, 0.42, 48, 4),
    ("GROOM_300x50_MobileBanner",      300,  50,  "groom_h", 0.50, 0.42, 48, 4),
    ("GROOM_300x600_HalfPage",         300, 600,  "groom_v", 0.50, 0.42, 32, 3),
    ("GROOM_160x600_Skyscraper",       160, 600,  "groom_v", 0.50, 0.42, 32, 3),
]

out_dir = "/home/user/final_ads"
os.makedirs(out_dir, exist_ok=True)

print("\nGenerating 12 animated GIFs...\n")
results = []
for name, w, h, src_key, fx, fy, nc, nz in CONFIGS:
    path = f"{out_dir}/{name}.gif"
    kb = make_gif(imgs[src_key], w, h, fx, fy, path, n_colors=nc, n_zoom=nz)

    # If still over 150KB, reduce lossy further
    if kb > 150:
        subprocess.run(['gifsicle', '-O3', f'--colors={nc}',
                        '--lossy=120', '-o', path, path],
                       capture_output=True, timeout=60)
        kb = os.path.getsize(path) / 1024

    ok = kb <= 150
    results.append((name, w, h, kb, ok))
    print(f"  {'✅' if ok else '⚠️ '} {name}: {w}×{h}  →  {kb:.1f} KB")

print("\n─── SUMMARY ───────────────────────────────")
bath_ok  = all(r[4] for r in results if r[0].startswith("BATH"))
groom_ok = all(r[4] for r in results if r[0].startswith("GROOM"))
total_ok = sum(1 for r in results if r[4])
print(f"  Bath campaign:  {'✅ All OK' if bath_ok else '⚠️ Some over'}")
print(f"  Groom campaign: {'✅ All OK' if groom_ok else '⚠️ Some over'}")
print(f"  Total: {total_ok}/12 under 150KB")
