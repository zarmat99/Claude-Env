extends Node2D
## Boot scene root. Hosts WorldRoot (maps are added here by SceneLoader) and UIRoot (UI).
## M0: placeholder; from M1 onward SceneLoader populates WorldRoot with the start map.

func _ready() -> void:
    print("[Valdombra] Boot OK - Milestone 0 skeleton.")
