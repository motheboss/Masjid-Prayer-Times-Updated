#!/usr/bin/env python3
"""Renders the tileable overlay patterns into public/patterns. Run: python3 scripts/generate_assets.py
   (Photos are prepared separately by scripts/prepare_photos.py.)"""
import os, math
from PIL import Image, ImageDraw
PUB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public")
os.makedirs(f"{PUB}/patterns", exist_ok=True)

T = 512
def tile(draw_fn, name):
    im = Image.new("RGBA", (T, T), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for ox in (-T, 0, T):
        for oy in (-T, 0, T): draw_fn(d, ox, oy)
    im.resize((256, 256), Image.LANCZOS).save(f"{PUB}/patterns/{name}.png")

def star_lattice(color, cell=256, size=150):
    def f(d, ox, oy):
        for i in range(T // cell + 1):
            for j in range(T // cell + 1):
                cx, cy = ox + cell / 2 + i * cell, oy + cell / 2 + j * cell
                for rot in (0, math.pi / 4):
                    pts = [(cx + size * math.cos(rot + k * math.pi / 2 + math.pi / 4) * 1.0, cy + size * math.sin(rot + k * math.pi / 2 + math.pi / 4)) for k in range(4)]
                    d.polygon(pts, outline=color, width=3)
    return f

def calligraphy(color):
    def f(d, ox, oy):
        for row, (freq, amp, ph) in enumerate(((2, 40, 0), (3, 30, 1.7), (2, 48, 3.1), (4, 22, 0.6))):
            y0 = 64 + row * 128
            for x in range(0, T, 3):
                y = y0 + amp * math.sin(2 * math.pi * freq * x / T + ph) + 14 * math.sin(2 * math.pi * 6 * x / T)
                w = 2 + 5 * abs(math.cos(2 * math.pi * freq * x / T + ph))
                d.ellipse([ox + x - w, oy + y - w, ox + x + w, oy + y + w], fill=color)
            for k in range(freq * 2):
                x = (k + .5) * T / (freq * 2)
                d.line([ox + x, oy + y0 - 50, ox + x, oy + y0 - 10], fill=color, width=4)
    return f

def arabesque(color):
    def f(d, ox, oy):
        for i in range(6):
            for j in range(6):
                cx, cy = ox + i * 128, oy + j * 128
                d.ellipse([cx - 128, cy - 128, cx + 128, cy + 128], outline=color, width=3)
                d.ellipse([cx + 64 - 16, cy + 64 - 16, cx + 64 + 16, cy + 64 + 16], outline=color, width=3)
    return f

def grid(color, dot):
    def f(d, ox, oy):
        for k in range(0, T + 1, 64):
            d.line([ox + k, oy, ox + k, oy + T], fill=color, width=2); d.line([ox, oy + k, ox + T, oy + k], fill=color, width=2)
            for m in range(0, T + 1, 64): d.ellipse([ox + k - 4, oy + m - 4, ox + k + 4, oy + m + 4], fill=dot)
    return f

if __name__ == "__main__":
    tile(star_lattice((245, 197, 66, 80)), "aqsa")
    tile(star_lattice((181, 72, 47, 60)), "geometric")
    tile(arabesque((242, 255, 248, 50)), "nabawi")
    tile(grid((212, 175, 55, 34), (212, 175, 55, 90)), "haram")
    print("patterns done")
