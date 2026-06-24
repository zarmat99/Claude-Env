"""
Normalize a ChatGPT-generated PNG into game-ready asset variants.

Workflow:
  1. Reads  assets/source/{family_id}.png   (your ChatGPT output)
  2. Keys out the magenta background (#FF00FF ± tolerance)
  3. Auto-crops to the content bounding box + padding
  4. Resizes to the family's target canvas from asset_manifest.json
  5. Centers the sprite on the canvas
  6. Saves N variants to assets/generated/{family_id}/{family_id}_01.png ... _NN.png
     Each variant gets a small programmatic hue/brightness/flip tweak.

Usage:
  python scripts/process_asset.py <family_id> [--count N] [--padding PX]

Examples:
  python scripts/process_asset.py moss_mud_tile
  python scripts/process_asset.py frost_pine_tree --count 4
  python scripts/process_asset.py npc_human_base --count 2 --no-flip
"""

import argparse
import json
import math
import random
import sys
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "assets" / "data" / "asset_manifest.json"
SOURCE_DIR = ROOT / "assets" / "source"
OUT_DIR = ROOT / "assets" / "generated"

# Magenta key color and tolerance
KEY_COLOR = (255, 0, 255)
KEY_TOLERANCE = 60  # color distance threshold


def main():
    parser = argparse.ArgumentParser(description="Process a ChatGPT asset into game variants.")
    parser.add_argument("family_id", help="Family ID from asset_manifest.json (e.g. moss_mud_tile)")
    parser.add_argument("--count", type=int, default=None, help="Number of variants to generate (default: from manifest)")
    parser.add_argument("--padding", type=int, default=8, help="Padding around cropped content in pixels (default: 8)")
    parser.add_argument("--no-flip", action="store_true", help="Disable horizontal flip variants")
    args = parser.parse_args()

    family_id = args.family_id
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    family = next((f for f in manifest["families"] if f["id"] == family_id), None)
    if not family:
        print(f"ERROR: Family '{family_id}' not found in asset_manifest.json", file=sys.stderr)
        sys.exit(1)

    source_path = SOURCE_DIR / f"{family_id}.png"
    if not source_path.exists():
        print(f"ERROR: Source image not found: {source_path}", file=sys.stderr)
        print(f"  Save your ChatGPT output to: {source_path}", file=sys.stderr)
        sys.exit(1)

    count = args.count if args.count is not None else int(family.get("count", 3))
    target_w = int(family["baseVisualSize"]["w"])
    target_h = int(family["baseVisualSize"]["h"])
    category = family.get("category", "")
    is_terrain = category == "terrain"
    allow_flip = not args.no_flip and not is_terrain

    print(f"Processing: {family_id}")
    print(f"  Source:   {source_path}")
    print(f"  Target:   {target_w}x{target_h}px  ×{count} variants")

    # Load and key out background
    source = Image.open(source_path).convert("RGBA")
    print(f"  Input:    {source.width}x{source.height}px")

    if is_terrain:
        keyed = key_background(source)
        sprite = keyed
    else:
        keyed = key_background(source)
        sprite = trim_alpha(keyed, padding=args.padding)

    if sprite.width == 0 or sprite.height == 0:
        print("ERROR: After keying, the image is empty. Check that the background is magenta (#FF00FF).", file=sys.stderr)
        sys.exit(1)

    # Output directory
    out_family_dir = OUT_DIR / family_id
    out_family_dir.mkdir(parents=True, exist_ok=True)

    for i in range(1, count + 1):
        rng = random.Random(f"{family_id}:{i}")
        variant = make_variant(sprite, rng, i, target_w, target_h, is_terrain, allow_flip)
        out_path = out_family_dir / f"{family_id}_{i:02d}.png"
        variant.save(out_path, optimize=True)

    print(f"  Saved {count} variants → {out_family_dir.relative_to(ROOT)}/")
    print()
    print("Next steps:")
    print("  npm run validate")
    print(f"  PORT=4200 PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node scripts/screenshot.mjs /tmp/check.png")


def key_background(image):
    """Remove magenta (#FF00FF) background pixels, returning RGBA image."""
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    w, h = rgba.size
    kr, kg, kb = KEY_COLOR

    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            dist = math.sqrt((r - kr) ** 2 + (g - kg) ** 2 + (b - kb) ** 2)
            edge_bias = min(x, y, w - 1 - x, h - 1 - y)
            # Looser tolerance at edges (anti-aliasing fringe)
            threshold = KEY_TOLERANCE if edge_bias > 6 else KEY_TOLERANCE + 24
            if dist < threshold:
                pixels[x, y] = (r, g, b, 0)
            elif dist < threshold + 30:
                alpha = int(a * (dist - threshold) / 30)
                pixels[x, y] = (r, g, b, alpha)
    return rgba


def trim_alpha(image, padding=8):
    """Crop to content bounding box + padding."""
    bbox = image.getchannel("A").getbbox()
    if not bbox:
        return image
    left = max(0, bbox[0] - padding)
    top = max(0, bbox[1] - padding)
    right = min(image.width, bbox[2] + padding)
    bottom = min(image.height, bbox[3] + padding)
    return image.crop((left, top, right, bottom))


def make_variant(sprite, rng, index, target_w, target_h, is_terrain, allow_flip):
    """Produce one variant: subtle color variation + resize + center on canvas."""
    img = sprite.copy()

    # Horizontal flip on odd variants (not terrain, if allowed)
    if allow_flip and index % 2 == 0:
        img = img.transpose(Image.Transpose.FLIP_LEFT_RIGHT)

    # Subtle hue shift via color enhancement  ±8%
    color_factor = 0.93 + rng.random() * 0.16
    img = ImageEnhance.Color(img).enhance(color_factor)

    # Brightness variation ±8%
    bright_factor = 0.93 + rng.random() * 0.14
    img = ImageEnhance.Brightness(img).enhance(bright_factor)

    # Contrast ±6%
    contrast_factor = 0.95 + rng.random() * 0.10
    img = ImageEnhance.Contrast(img).enhance(contrast_factor)

    if is_terrain:
        # Terrain: fill the target tile exactly
        return img.resize((target_w, target_h), Image.Resampling.LANCZOS)

    # Sprite: fit inside (target - 4px margin), preserve aspect ratio
    max_w = max(4, target_w - 4)
    max_h = max(4, target_h - 4)
    scale = min(max_w / img.width, max_h / img.height, 1.0)
    new_w = max(1, round(img.width * scale))
    new_h = max(1, round(img.height * scale))
    img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)

    # Center on canvas (sprites sit on bottom for ground contact)
    canvas = Image.new("RGBA", (target_w, target_h), (0, 0, 0, 0))
    x = (target_w - new_w) // 2
    y = target_h - new_h - 2  # 2px above bottom edge
    canvas.alpha_composite(img, (x, y))
    return canvas


if __name__ == "__main__":
    main()
