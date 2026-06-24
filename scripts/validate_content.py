import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

REQUIRED_COUNTS = {
    "terrain.texture": 40,
    "terrain.snow_ice": 20,
    "terrain.rock_mountain": 20,
    "terrain.grass_moss_mud": 20,
    "terrain.road_path": 15,
    "terrain.water": 15,
    "terrain.transition": 20,
    "terrain.decal": 10,
    "vegetation.tree": 30,
    "vegetation.bush": 20,
    "vegetation.tall_grass": 20,
    "vegetation.fallen_log": 15,
    "vegetation.root": 15,
    "vegetation.mushroom": 15,
    "vegetation.rare_magical": 10,
    "vegetation.dead_burnt": 10,
    "nature.rock_small": 30,
    "nature.rock_medium": 25,
    "nature.rock_large": 20,
    "nature.rock_huge": 10,
    "nature.mountain_wall": 10,
    "nature.ice_element": 10,
    "nature.decorative": 10,
    "building.house_modular": 20,
    "building.hut": 10,
    "building.special": 10,
    "building.tower": 10,
    "building.wall_gate": 15,
    "building.bridge": 10,
    "building.module": 15,
    "building.village_decor": 20,
    "dungeon.tile": 40,
    "dungeon.wall": 20,
    "dungeon.floor": 20,
    "dungeon.column": 15,
    "dungeon.door_gate": 15,
    "dungeon.stairs_passage": 15,
    "dungeon.trap": 20,
    "dungeon.sacred_ruin": 20,
    "dungeon.prop": 20,
    "dungeon.entrance": 10,
    "prop.common": 30,
    "prop.storage": 20,
    "prop.furniture": 20,
    "prop.books_scrolls": 20,
    "prop.smith_miner": 20,
    "prop.kitchen_tavern": 20,
    "prop.bones_debris": 20,
    "prop.interactive": 20,
    "prop.loot_container": 20,
    "weapon.sword": 20,
    "weapon.axe": 15,
    "weapon.mace_hammer": 15,
    "weapon.dagger": 15,
    "weapon.bow": 15,
    "weapon.crossbow": 10,
    "weapon.staff": 15,
    "weapon.rare_legendary": 20,
    "armor.light": 15,
    "armor.medium": 15,
    "armor.heavy": 15,
    "armor.mage_set": 10,
    "armor.cloak": 10,
    "armor.helm": 10,
    "armor.gloves_boots": 10,
    "armor.accessory": 20,
    "creature.npc_human": 20,
    "creature.bandit_warrior": 15,
    "creature.mage_shaman": 10,
    "creature.animal": 15,
    "creature.hostile": 15,
    "creature.undead": 10,
    "creature.large": 10,
    "creature.boss": 5,
    "effect.magic": 20,
    "effect.fire": 10,
    "effect.ice": 10,
    "effect.lightning": 10,
    "effect.poison_shadow": 10,
    "effect.smoke_dust": 10,
    "effect.blood_impact": 10,
    "effect.weather": 10,
    "ui.inventory_icon": 100,
    "ui.skill_icon": 30,
    "ui.magic_icon": 20,
    "ui.status_icon": 20,
    "ui.element": 20,
    "ui.health_mana_stamina_bar": 3,
    "ui.inventory_window": 1,
    "ui.dialogue_window": 1,
    "ui.cursor": 4,
    "ui.button": 8,
    "ui.map_quest_menu_placeholder": 3,
}

REQUIRED_BIOMES = {
    "snow_forest",
    "rocky_mountain",
    "nordic_village",
    "ancient_ruins",
    "underground_dungeon",
    "ice_cave",
    "dark_swamp",
    "bandit_camp",
    "road",
    "boss_area",
}

FORBIDDEN_TERMS = ["skyrim", "bethesda", "elder scrolls", "tamriel", "whiterun", "draugr"]


def load_json(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def main():
    manifest = load_json("assets/data/asset_manifest.json")
    biomes_doc = load_json("assets/data/biomes.json")
    spawn_doc = load_json("assets/data/spawn-tables.json")
    maps_doc = load_json("assets/data/maps.json")
    zones_doc = load_json("assets/data/zones.json")
    entrances_doc = load_json("assets/data/entrances.json")
    interiors_doc = load_json("assets/data/interiors.json")
    dungeons_doc = load_json("assets/data/dungeons.json")
    biome_rules_doc = load_json("assets/data/biome_rules.json")
    placed_objects_doc = load_json("assets/data/placed_objects.json")

    errors = []
    counts = {}
    families = {family["id"]: family for family in manifest["families"]}
    collision_profiles = manifest["collisionProfiles"]
    render_layers = {layer["id"] for layer in manifest["renderLayers"]}
    biomes = {biome["id"]: biome for biome in biomes_doc["biomes"]}
    spawn_tables = spawn_doc["spawnTables"]
    zones = {zone["zone_id"]: zone for zone in zones_doc["zones"]}
    map_index = {entry["zoneId"]: entry for entry in maps_doc["maps"]}
    map_data = {zone_id: load_json(entry["file"]) for zone_id, entry in map_index.items()}

    for family in families.values():
        counts[family["kind"]] = counts.get(family["kind"], 0) + int(family.get("count", 0))
        if family["collisionProfile"] not in collision_profiles:
            errors.append(f"{family['id']} has missing collision profile {family['collisionProfile']}")
        if family["renderLayer"] not in render_layers:
            errors.append(f"{family['id']} has missing render layer {family['renderLayer']}")
        if family.get("category") == "creature":
            states = set(family.get("animationStates", []))
            missing = {"idle", "move", "attack", "death"} - states
            if missing:
                errors.append(f"{family['id']} misses animation states {sorted(missing)}")

    for kind, minimum in REQUIRED_COUNTS.items():
        actual = counts.get(kind, 0)
        if actual < minimum:
            errors.append(f"{kind} has {actual}, requires {minimum}")

    for biome_id in REQUIRED_BIOMES:
        if biome_id not in biomes:
            errors.append(f"missing biome {biome_id}")

    for biome in biomes.values():
        for field in ("terrainTiles", "props", "spawnTable", "vegetationDensity", "rockDensity", "structureRules", "enemies", "loot", "overlapRules", "seed"):
            if field not in biome:
                errors.append(f"{biome['id']} misses {field}")
        if biome.get("spawnTable") not in spawn_tables:
            errors.append(f"{biome['id']} references missing spawn table {biome.get('spawnTable')}")
        refs = biome.get("terrainTiles", []) + biome.get("props", []) + biome.get("enemies", []) + biome.get("loot", [])
        for ref in refs:
            if ref != "ore_cache" and ref not in families:
                errors.append(f"{biome['id']} references missing family {ref}")

    for table_id, table in spawn_tables.items():
        for entry in table.get("creatures", []) + table.get("loot", []):
            if entry.get("family") not in families:
                errors.append(f"{table_id} references missing family {entry.get('family')}")

    validate_static_world(errors, families, zones_doc, zones, maps_doc, map_data, entrances_doc, interiors_doc, dungeons_doc, biome_rules_doc, placed_objects_doc)

    all_text = json.dumps({
        "manifest": manifest,
        "biomes": biomes_doc,
        "spawn": spawn_doc,
        "maps": maps_doc,
        "zones": zones_doc,
        "entrances": entrances_doc,
        "interiors": interiors_doc,
        "dungeons": dungeons_doc,
        "biome_rules": biome_rules_doc,
        "placed": placed_objects_doc,
    }).lower()
    for term in FORBIDDEN_TERMS:
        if term in all_text:
            errors.append(f"forbidden protected-reference term found: {term}")

    total_assets = sum(int(family.get("count", 0)) for family in families.values())
    print(f"Expanded assets: {total_assets}")
    print(f"Families: {len(families)}")
    print(f"Biomes: {len(biomes)}")
    print(f"Static zones: {len(zones)}")
    print(f"Static maps: {len(map_data)}")

    generated_index = ROOT / "assets" / "generated" / "asset-index.json"
    if generated_index.exists():
        index = json.loads(generated_index.read_text(encoding="utf-8"))
        entries = index.get("entries", {})
        if len(entries) != total_assets:
            errors.append(f"generated asset index has {len(entries)} entries, expected {total_assets}")
        missing_files = [
            asset_id for asset_id, entry in entries.items()
            if not (ROOT / entry["path"]).exists()
        ][:10]
        if missing_files:
            errors.append(f"generated asset files missing: {missing_files}")
        print(f"Generated PNG assets: {len(entries)}")

    if errors:
        print("Errors:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    print("Content validation passed.")
    return 0


def validate_static_world(errors, families, zones_doc, zones, maps_doc, map_data, entrances_doc, interiors_doc, dungeons_doc, biome_rules_doc, placed_objects_doc):
    if zones_doc.get("startZone") not in zones:
        errors.append(f"startZone references missing zone {zones_doc.get('startZone')}")

    for zone_id, zone in zones.items():
        if zone_id not in map_data:
            errors.append(f"zone {zone_id} has no loaded map data")
        if zone.get("type") not in {"overworld", "city", "village", "interior", "dungeon", "cave", "ruin"}:
            errors.append(f"zone {zone_id} has unsupported type {zone.get('type')}")

    for entry in maps_doc.get("maps", []):
        if entry.get("zoneId") not in zones:
            errors.append(f"maps.json references missing zone {entry.get('zoneId')}")
        if not (ROOT / entry.get("file", "")).exists():
            errors.append(f"maps.json references missing file {entry.get('file')}")

    for zone_id, data in map_data.items():
        if not data.get("spawnPoints"):
            errors.append(f"map {data.get('mapId', zone_id)} has no spawnPoints")
        for shape in data.get("terrain", []) + data.get("blockingTerrain", []):
            family = shape.get("family")
            fallback = shape.get("fallbackFamily")
            if family not in families and fallback not in families:
                errors.append(f"map {data.get('mapId', zone_id)} references missing terrain family {family}")
        for group in data.get("modularObjects", []):
            if group.get("family") not in families:
                errors.append(f"map {data.get('mapId', zone_id)} references missing object family {group.get('family')}")
        for npc in data.get("npcs", []):
            if npc.get("family") not in families:
                errors.append(f"map {data.get('mapId', zone_id)} references missing npc family {npc.get('family')}")

    for entrance in entrances_doc.get("entrances", []):
        if entrance.get("zoneId") not in zones:
            errors.append(f"entrance {entrance.get('id')} source zone missing: {entrance.get('zoneId')}")
        dest = entrance.get("destination", {})
        dest_zone = dest.get("zoneId")
        dest_spawn = dest.get("spawnPoint")
        if dest_zone not in zones:
            errors.append(f"entrance {entrance.get('id')} destination zone missing: {dest_zone}")
        elif dest_spawn not in map_data.get(dest_zone, {}).get("spawnPoints", {}):
            errors.append(f"entrance {entrance.get('id')} destination spawn missing: {dest_zone}.{dest_spawn}")
        if entrance.get("assetFamily") not in families:
            errors.append(f"entrance {entrance.get('id')} asset family missing: {entrance.get('assetFamily')}")

    for interior in interiors_doc.get("interiors", []):
        if interior.get("zoneId") not in zones:
            errors.append(f"interior references missing zone {interior.get('zoneId')}")
        if interior.get("parentZoneId") not in zones:
            errors.append(f"interior references missing parent zone {interior.get('parentZoneId')}")

    for dungeon in dungeons_doc.get("dungeons", []):
        for level in dungeon.get("levels", []):
            if level not in zones:
                errors.append(f"dungeon {dungeon.get('zoneId')} references missing level {level}")

    for rule in biome_rules_doc.get("rules", []):
        for family in rule.get("terrainFamilies", []) + rule.get("modularAssets", []):
            if family not in families:
                errors.append(f"biome rule {rule.get('id')} references missing family {family}")

    for zone_id, entries in placed_objects_doc.get("zones", {}).items():
        if zone_id not in zones:
            errors.append(f"placed_objects references missing zone {zone_id}")
        for entry in entries:
            if entry.get("family") not in families:
                errors.append(f"placed object {entry.get('id')} references missing family {entry.get('family')}")


if __name__ == "__main__":
    raise SystemExit(main())
