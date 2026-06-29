class_name IdUtils
extends RefCounted
## Static helpers for stable content + persistent IDs. NOT an autoload - call statically
## (e.g. IdUtils.is_well_formed("item_fixture_weapon")).

## True if `id` is lower_snake_case, non-empty, and contains no spaces.
static func is_well_formed(id: String) -> bool:
    return not id.is_empty() and id == id.to_lower() and not id.contains(" ")

## True if `id` starts with the given type prefix, e.g. has_type_prefix("item_fixture_weapon", "item").
static func has_type_prefix(id: String, prefix: String) -> bool:
    return id.begins_with(prefix + "_")
