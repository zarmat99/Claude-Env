"""Build game-ready assets from the three AI-generated 5x5 source atlases."""

from pathlib import Path
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "source"
TEXTURES = ROOT / "assets" / "textures"
SPRITES = ROOT / "assets" / "sprites"
OBJECTS = ROOT / "assets" / "objects"

GRID = 5

CHARACTER_KEYS = [
    ["player_varesh", "player_cindrak", "player_sylveni", "player_vorrkai", "player_thornkin"],
    ["npc_scholar", "npc_rootwarden_elder", "npc_high_consul", "npc_warmaster", "npc_abbess"],
    ["npc_innkeeper", "npc_blacksmith", "npc_guard_captain", "npc_alchemist", "npc_vorrkai_elder"],
    ["enemy_goblin", "enemy_bandit", "enemy_cave_spider", "enemy_swamp_crawler", "enemy_skeleton"],
    ["enemy_cult_zealot", "enemy_wraith", "enemy_lava_salamander", "enemy_void_hound", "enemy_hollow_prophet_boss"],
]

OBJECT_KEYS = [
    ["story_station_console", "story_station_sabotaged", "story_resonance_vial", "story_cael_notes", "story_marker_7e"],
    ["story_mine_shaft", "story_underlurk_gate", "story_vorrkai_shrine", "story_cult_shrine", "story_void_sanctum"],
    ["story_monolith", "story_anchor_thorn", "story_anchor_aetherwood", "story_anchor_emberpeak", "story_fallen_thornpillar"],
    ["story_rootwarden_altar", "story_voidbloom_weave", "story_voidbloom", "story_emberpetal", "story_rootmoss"],
    ["story_sundering_rite", "story_ritual_brazier", "story_farmhouse_cache", "story_treasure_chest", "story_restored_rootstone"],
]


def grid_cell(image: Image.Image, row: int, col: int) -> Image.Image:
    """Crop an exact grid cell while distributing the non-divisible edge pixels."""
    x0 = round(col * image.width / GRID)
    x1 = round((col + 1) * image.width / GRID)
    y0 = round(row * image.height / GRID)
    y1 = round((row + 1) * image.height / GRID)
    return image.crop((x0, y0, x1, y1))


def remove_magenta(image: Image.Image) -> Image.Image:
    """Turn the generated #ff00ff chroma background transparent."""
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, _ = pixels[x, y]
            chroma = r > 180 and b > 150 and g < 105 and (r + b - 2 * g) > 260
            if chroma:
                pixels[x, y] = (r, g, b, 0)
    return rgba


def trim_alpha(image: Image.Image, padding: int = 3) -> Image.Image:
    alpha = image.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        return image
    left = max(0, bbox[0] - padding)
    top = max(0, bbox[1] - padding)
    right = min(image.width, bbox[2] + padding)
    bottom = min(image.height, bbox[3] + padding)
    return image.crop((left, top, right, bottom))


def fit_transparent(image: Image.Image, size: tuple[int, int], bottom_margin: int = 1) -> Image.Image:
    image = trim_alpha(remove_magenta(image))
    max_w = size[0] - 2
    max_h = size[1] - bottom_margin - 1
    scale = min(max_w / image.width, max_h / image.height)
    new_size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
    image = image.resize(new_size, Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    x = (size[0] - image.width) // 2
    y = size[1] - bottom_margin - image.height
    canvas.alpha_composite(image, (x, y))
    return canvas


def build_tiles() -> None:
    source = Image.open(SOURCE / "terrain-atlas-source.png").convert("RGB")
    tile_size = 32
    atlas = Image.new("RGB", (tile_size * 25, tile_size))
    index = 0
    for row in range(GRID):
        for col in range(GRID):
            tile = grid_cell(source, row, col).resize(
                (tile_size, tile_size), Image.Resampling.LANCZOS
            )
            atlas.paste(tile, (index * tile_size, 0))
            index += 1
    atlas.save(TEXTURES / "tiles.png", optimize=True)


def build_characters() -> None:
    source = Image.open(SOURCE / "characters-atlas-source.png")
    for row, keys in enumerate(CHARACTER_KEYS):
        for col, key in enumerate(keys):
            is_boss = key == "enemy_hollow_prophet_boss"
            size = (64, 72) if is_boss else (48, 56)
            sprite = fit_transparent(grid_cell(source, row, col), size)
            sprite.save(SPRITES / f"{key}.png", optimize=True)


def build_objects() -> None:
    source = Image.open(SOURCE / "story-atlas-source.png")
    for row, keys in enumerate(OBJECT_KEYS):
        for col, key in enumerate(keys):
            sprite = fit_transparent(grid_cell(source, row, col), (48, 48))
            sprite.save(OBJECTS / f"{key}.png", optimize=True)


def main() -> None:
    for directory in (TEXTURES, SPRITES, OBJECTS):
        directory.mkdir(parents=True, exist_ok=True)
    build_tiles()
    build_characters()
    build_objects()
    print("Built 1 terrain atlas, 25 character sprites, and 25 story-object sprites.")


if __name__ == "__main__":
    main()
