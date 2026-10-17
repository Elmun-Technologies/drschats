"""Packshot compositions for photo slots, built from the real product cutouts.

Run from the repo root: python3 scripts/assets/compose-stock.py
Every image is an arrangement of genuine packshots (public/images/products/c-*.png)
on the V3 tile colour — no generated imagery, no people.
"""
from PIL import Image, ImageDraw, ImageFilter

TILE = (241, 243, 240)
P = "public/images/products/"
OUT = "public/images/stock/"


def cutout(name, height):
    im = Image.open(P + name).convert("RGBA")
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    w = round(im.width * height / im.height)
    return im.resize((w, height), Image.LANCZOS)


def compose(size, items, out, floor=0.86):
    """items: (file, height, centre_x as 0..1) — drawn left to right, later ones in front."""
    W, H = size
    canvas = Image.new("RGBA", size, TILE + (255,))
    shadow = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)
    base = round(H * floor)
    placed = []
    for name, height, cx in items:
        im = cutout(name, height)
        x = round(W * cx - im.width / 2)
        y = base - im.height
        draw.ellipse((x + im.width * 0.08, base - 14, x + im.width * 0.92, base + 14), fill=(23, 25, 27, 60))
        placed.append((im, x, y))
    canvas.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(14)))
    for im, x, y in placed:
        canvas.alpha_composite(im, (x, y))
    canvas.convert("RGB").save(OUT + out, "WEBP", quality=86, method=6)
    print("wrote", OUT + out)


compose((800, 1000), [
    ("c-swiss-energy-calcivit-30-hero.png", 420, 0.30),
    ("c-swiss-energy-prenatal-forte-60.png", 600, 0.58),
], "st-aud-expectant.webp")

compose((800, 1000), [
    ("c-delical-vanil-200ml-white.png", 540, 0.25),
    ("c-swiss-energy-immunovit-30-hero.png", 470, 0.64),
], "st-aud-recovery.webp")

compose((1200, 800), [
    ("c-swiss-energy-calcivit-30-hero.png", 470, 0.19),
    ("c-swiss-energy-neuroforce-30-front.png", 430, 0.50),
    ("c-swiss-energy-hair-nail-skin-30.png", 470, 0.81),
], "st-shelf-range.webp", floor=0.84)

compose((1200, 800), [
    ("c-dr-frei-turbo-base-ingalyator-white.png", 430, 0.22),
    ("c-dr-frei-tonometr-a20-4.png", 470, 0.52),
    ("c-dr-frei-antistress-magniy-20-3.png", 500, 0.80),
], "st-range-devices.webp", floor=0.84)
