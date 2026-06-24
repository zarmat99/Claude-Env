import json
import math
import random
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "assets" / "data" / "asset_manifest.json"
SOURCE_DIR = ROOT / "assets" / "imagen" / "source"
OUT_DIR = ROOT / "assets" / "generated"
INDEX_PATH = ROOT / "assets" / "generated" / "asset-index.json"

GRID = 12

SOURCE_BY_CATEGORY = {
    "terrain": "terrain_tileset.png",
    "vegetation": "vegetation_nature.png",
    "rock": "vegetation_nature.png",
    "building": "buildings_village.png",
    "dungeon": "dungeon_ruins.png",
    "prop": "props_loot.png",
    "weapon": "weapons_armor_equipment.png",
    "armor": "weapons_armor_equipment.png",
    "creature": "creatures_npcs.png",
    "effect": "effects_ui.png",
    "ui": "effects_ui.png",
}


def main():
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    sources = {}
    for source_name in sorted(set(SOURCE_BY_CATEGORY.values())):
        path = SOURCE_DIR / source_name
        if not path.exists():
            raise FileNotFoundError(f"Missing imagegen source atlas: {path}")
        sources[source_name] = {
            "path": path,
            "image": Image.open(path).convert("RGBA"),
            "cursor": 0,
        }

    generated = {}
    family_count = 0
    asset_count = 0

    for family in manifest["families"]:
        family_count += 1
        source_name = SOURCE_BY_CATEGORY.get(family["category"])
        if not source_name:
            raise ValueError(f"No source atlas mapping for category {family['category']}")

        family_dir = OUT_DIR / family["id"]
        family_dir.mkdir(parents=True, exist_ok=True)

        source = sources[source_name]
        # Allow explicit atlas placement; default is sequential cursor.
        if "startCell" in family:
            source["cursor"] = int(family["startCell"])

        for variant_index in range(1, int(family["count"]) + 1):
            asset_id = f"{family['id']}_{variant_index:02d}"
            cell = next_cell(source)
            canvas_size = asset_canvas_size(family)
            image = make_asset_image(cell, family, canvas_size, variant_index)
            rel_path = Path("assets") / "generated" / family["id"] / f"{asset_id}.png"
            out_path = ROOT / rel_path
            image.save(out_path, optimize=True)
            generated[asset_id] = {
                "familyId": family["id"],
                "path": rel_path.as_posix(),
                "sourceAtlas": f"assets/imagen/source/{source_name}",
                "sourceCell": source["cursor"] - 1,
                "size": list(image.size),
            }
            asset_count += 1

    INDEX_PATH.write_text(
        json.dumps(
            {
                "schemaVersion": 1,
                "generator": "scripts/generate_imagen_assets.py",
                "source": "OpenAI imagegen atlas sheets copied into assets/imagen/source",
                "grid": GRID,
                "families": family_count,
                "assets": asset_count,
                "entries": generated,
            },
            indent=2,
        ),
        encoding="utf-8",
    )
    print(f"Generated {asset_count} imagegen-derived PNG assets across {family_count} families.")
    print(f"Wrote {INDEX_PATH.relative_to(ROOT)}")


def next_cell(source):
    image = source["image"]
    index = source["cursor"]
    source["cursor"] += 1
    row = (index // GRID) % GRID
    col = index % GRID
    x0 = round(col * image.width / GRID)
    y0 = round(row * image.height / GRID)
    x1 = round((col + 1) * image.width / GRID)
    y1 = round((row + 1) * image.height / GRID)
    return image.crop((x0, y0, x1, y1))


def asset_canvas_size(family):
    size = family["baseVisualSize"]
    return max(8, int(size["w"])), max(8, int(size["h"]))


def make_asset_image(cell, family, size, variant_index):
    rng = random.Random(f"{family['id']}:{variant_index}")
    category = family["category"]

    if category == "terrain" or family["kind"].startswith("dungeon.tile") or family["kind"].startswith("dungeon.floor"):
        image = crop_tile_interior(cell).resize(size, Image.Resampling.LANCZOS)
        return vary(image, rng, terrain=True)

    image = remove_background(cell)
    image = trim_alpha(image, padding=4)
    image = vary(image, rng, terrain=False)

    max_w = max(4, size[0] - 4)
    max_h = max(4, size[1] - 4)
    scale = min(max_w / image.width, max_h / image.height, 1.25)
    new_size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
    image = image.resize(new_size, Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    x = (size[0] - image.width) // 2
    y = size[1] - image.height - 1
    if category in {"ui", "weapon", "armor", "effect"}:
        y = (size[1] - image.height) // 2
    canvas.alpha_composite(image, (x, y))
    return canvas


def remove_background(image):
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    samples = []
    w, h = rgba.size
    for x, y in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (0, h // 2)]:
        samples.append(pixels[x, y][:3])
    key = tuple(sum(sample[i] for sample in samples) // len(samples) for i in range(3))

    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            dist = math.sqrt((r - key[0]) ** 2 + (g - key[1]) ** 2 + (b - key[2]) ** 2)
            edge_bias = min(x, y, w - 1 - x, h - 1 - y)
            threshold = 42 if edge_bias > 4 else 64
            very_dark_bg = r < 10 and g < 18 and b < 24
            if dist < threshold or very_dark_bg:
                pixels[x, y] = (r, g, b, 0)
            elif dist < threshold + 22:
                alpha = int(a * min(1, (dist - threshold) / 22))
                pixels[x, y] = (r, g, b, alpha)
    return rgba.filter(ImageFilter.GaussianBlur(radius=0.15))


def crop_tile_interior(image):
    inset = max(8, int(min(image.width, image.height) * 0.28))
    return image.crop((inset, inset, image.width - inset, image.height - inset))


def trim_alpha(image, padding=2):
    bbox = image.getchannel("A").getbbox()
    if not bbox:
        return image
    left = max(0, bbox[0] - padding)
    top = max(0, bbox[1] - padding)
    right = min(image.width, bbox[2] + padding)
    bottom = min(image.height, bbox[3] + padding)
    return image.crop((left, top, right, bottom))


def vary(image, rng, terrain):
    image = image.convert("RGBA")
    if rng.random() < 0.5 and not terrain:
        image = image.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    color = ImageEnhance.Color(image).enhance(0.92 + rng.random() * 0.24)
    contrast = ImageEnhance.Contrast(color).enhance(0.92 + rng.random() * 0.18)
    bright = ImageEnhance.Brightness(contrast).enhance(0.9 + rng.random() * 0.18)
    return bright


if __name__ == "__main__":
    main()
