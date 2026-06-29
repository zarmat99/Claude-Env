# RPG Skeleton - SESSION LOG

Newest first.

---

## 2026-06-29 - Content Purge To Scalable Skeleton

- **Request**: before continuing, delete all current maps, assets, and game references so only the scalable skeleton remains.
- **Done**: replaced active content data with neutral `fixture_*` data, added `map_bootstrap`, switched boot/game-over fallback to the bootstrap map, renamed the Godot project to `RPG Skeleton`, deleted old map/asset/prototype scene/test/review files, and replaced milestone-bound tests with `SkeletonRegressionRunner`.
- **Verification**: `.\test.bat` passes cleanly: Godot import plus skeleton regression.
- **Intent**: old prototype content remains available only through git history. The current workspace is a clean systems foundation for the next real game content pass.
- **Next**: commit/push if needed, then start the new art/audio pipeline.

