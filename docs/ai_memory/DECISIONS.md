# RPG Skeleton - DECISIONS

## Decision 1 - Keep The Engine Skeleton, Remove Prototype Content
The project keeps the scalable Godot/GDScript systems and removes active prototype content. Old content can be inspected through git history, but must not be restored into active files unless explicitly re-authored.

## Decision 2 - Use Neutral Fixture IDs For Tests
System tests use `fixture_*` content IDs. Fixture content is not lore, not production content, and not a hidden dependency for future maps or story.

## Decision 3 - Keep One Bootstrap Map
A single neutral `map_bootstrap` remains so the runtime can boot, save/load, and test SceneLoader. It is infrastructure, not game content.

## Decision 4 - Future Assets Need A Governed Pipeline
Image generation can remain a source for future art, but generated assets must be atomic, metadata-tracked, processed, imported, and visually approved before active use.
