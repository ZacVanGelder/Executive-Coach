#!/usr/bin/env python3
"""Convert 12 ad PNGs → animated GIFs with Ken Burns zoom, under 150KB each."""
import os, subprocess, glob
from PIL import Image

PNG_DIR = '/home/user/ads_v3/pngs'
GIF_DIR = '/home/user/ads_v3/gifs'
os.makedirs(GIF_DIR, exist_ok=True)

MAX_KB = 150

def make_gif(png_path, gif_path):
    img = Image.open(png_path).convert('RGB')
    W, H = img.size
    area = W * H

    # Adapt params based on ad size
    if area >= 160_000:         # 300×600 (180k), 728×90 (65k is under this)
        n_anim = 3
        zoom_max = 0.025
        n_colors = 48
    elif area >= 60_000:         # 300×250 (75k), 160×600 (96k)
        n_anim = 4
        zoom_max = 0.03
        n_colors = 64
    else:                        # 728×90 (65k), 320×50 (16k), 300×50 (15k)
        n_anim = 3
        zoom_max = 0.02
        n_colors = 48

    # Build shared palette from the source
    palette_src = img.quantize(colors=n_colors, method=Image.FASTOCTREE)

    # Zoom frames
    frames = []
    anim_delays = []
    for i in range(n_anim):
        zoom = (zoom_max * i) / max(1, n_anim - 1)
        if zoom > 0:
            nw = round(W * (1 + zoom))
            nh = round(H * (1 + zoom))
            zoomed = img.resize((nw, nh), Image.LANCZOS)
            x = (nw - W) // 2
            y = (nh - H) // 2
            frame_rgb = zoomed.crop((x, y, x + W, y + H))
        else:
            frame_rgb = img.copy()
        frame_q = frame_rgb.quantize(palette=palette_src, dither=0)
        frames.append(frame_q)
        anim_delays.append(350)          # 350 ms per zoom frame

    # Hold frame (5 seconds static)
    frames.append(frames[-1].copy())
    anim_delays.append(5000)

    # Save GIF
    frames[0].save(
        gif_path,
        save_all=True,
        append_images=frames[1:],
        optimize=False,
        loop=0,
        duration=anim_delays,
    )

    size_kb = os.path.getsize(gif_path) / 1024

    # Optimize with gifsicle in passes
    lossy = 60
    while size_kb > MAX_KB and lossy <= 150:
        subprocess.run(
            ['gifsicle', '-O3', f'--lossy={lossy}', gif_path, '-o', gif_path],
            capture_output=True
        )
        size_kb = os.path.getsize(gif_path) / 1024
        lossy += 30

    # If still over, reduce colors
    if size_kb > MAX_KB:
        cur_colors = n_colors
        for fewer in [32, 24, 16]:
            if size_kb <= MAX_KB:
                break
            # Re-quantize with fewer colors and rewrite
            palette_src2 = img.quantize(colors=fewer, method=Image.FASTOCTREE)
            frames2 = []
            for i in range(n_anim):
                zoom = (zoom_max * i) / max(1, n_anim - 1)
                if zoom > 0:
                    nw = round(W * (1 + zoom))
                    nh = round(H * (1 + zoom))
                    zoomed = img.resize((nw, nh), Image.LANCZOS)
                    x = (nw - W) // 2
                    y = (nh - H) // 2
                    frame_rgb = zoomed.crop((x, y, x + W, y + H))
                else:
                    frame_rgb = img.copy()
                frames2.append(frame_rgb.quantize(palette=palette_src2, dither=0))
            frames2.append(frames2[-1].copy())
            frames2[0].save(gif_path, save_all=True, append_images=frames2[1:],
                            optimize=False, loop=0, duration=anim_delays)
            subprocess.run(['gifsicle', '-O3', '--lossy=120', gif_path, '-o', gif_path],
                           capture_output=True)
            size_kb = os.path.getsize(gif_path) / 1024

    return size_kb

# Process all 12 PNGs
pngs = sorted(glob.glob(f'{PNG_DIR}/*.png'))
print(f"Found {len(pngs)} PNGs to convert\n")

results = []
for png_path in pngs:
    name = os.path.splitext(os.path.basename(png_path))[0]
    gif_path = f'{GIF_DIR}/{name}.gif'
    size_kb = make_gif(png_path, gif_path)
    status = '✓' if size_kb <= MAX_KB else '✗ OVER'
    print(f"  {status}  {name}: {size_kb:.1f} KB")
    results.append((name, size_kb))

print(f"\n{'='*60}")
over = [(n, s) for n, s in results if s > MAX_KB]
print(f"All done. {len(results)-len(over)}/{len(results)} under {MAX_KB}KB")
if over:
    print("OVER LIMIT:", over)
