extends Node
## Loads/unloads map scenes into Main/WorldRoot and places the player at a named
## SpawnPoint, then emits EventBus.map_changed (autoload). M0: stub; used from M1/M6.

func change_map(map_id: String, spawn_point_id: String = "") -> void:
    # M0 stub: real async map swap + spawn placement lands in M1/M6.
    push_warning("SceneLoader.change_map not implemented yet (M0 stub): %s (spawn=%s)" % [map_id, spawn_point_id])
