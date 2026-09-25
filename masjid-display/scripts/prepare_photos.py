#!/usr/bin/env python3
"""Makes horizontal (1920x1080) and vertical (1080x1920) backgrounds from the originals in /assets-src.
   Output: public/backgrounds/<theme>-horizontal.jpg and <theme>-vertical.jpg
   Run: python3 scripts/prepare_photos.py   (needs Pillow)"""
import os
from PIL import Image, ImageFilter, ImageEnhance

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SRC, OUT = os.path.join(ROOT, "assets-src"), os.path.join(ROOT, "public", "backgrounds")
os.makedirs(OUT, exist_ok=True)
LAND, PORT = (1920, 1080), (1080, 1920)

def crop_to(im, box, size):
    return im.crop(box).resize(size, Image.LANCZOS)

def save(im, name):
    im.convert("RGB").save(os.path.join(OUT, name), quality=86, optimize=True, progressive=True)

def sharpen(im, amt=110):
    return im.filter(ImageFilter.UnsharpMask(radius=1.6, percent=amt, threshold=2))

# --- Nabawi (3840x1920, plenty of resolution) ---
im = Image.open(f"{SRC}/nabawi.jpg")
save(crop_to(im, (150, 0, 150 + 3413, 1920), LAND), "nabawi-horizontal.jpg")
save(crop_to(im, (560, 0, 560 + 1080, 1920), PORT), "nabawi-vertical.jpg")

# --- Aqsa (1936x1549) ---
im = Image.open(f"{SRC}/aqsa.jpg")
save(crop_to(im, (0, 100, 1936, 100 + 1089), LAND), "aqsa-horizontal.jpg")
save(crop_to(im, (420, 0, 420 + 871, 1549), PORT), "aqsa-vertical.jpg")

# --- Haram (1300x726, low resolution) ---
im = Image.open(f"{SRC}/haram.jpg")
save(sharpen(im.resize(LAND, Image.LANCZOS)), "haram-horizontal.jpg")
# Vertical: sharp photo at the top, feathered into a blurred, darkened extension of itself.
base = im.resize((PORT[1] * 1300 // 726, PORT[1]), Image.LANCZOS)          # cover
left = (base.width - PORT[0]) // 2
base = base.crop((left, 0, left + PORT[0], PORT[1])).filter(ImageFilter.GaussianBlur(38))
base = ImageEnhance.Brightness(base).enhance(0.55)
scale = 960 / 726
fg = im.resize((int(1300 * scale), 960), Image.LANCZOS).crop((240, 0, 240 + PORT[0], 960))
fg = sharpen(fg, 90)
y0, feather = -110, 120
canvas = base.copy()
mask = Image.new("L", fg.size, 255)
for i in range(feather):
    mask.paste(int(255 * (1 - i / feather)), (0, fg.height - feather + i, fg.width, fg.height - feather + i + 1))
canvas.paste(fg, (0, y0), mask)
save(canvas, "haram-vertical.jpg")
print("photos ready")
