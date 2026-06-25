extends Marker2D
class_name SpawnPoint
## A named place where the player appears when entering a map. SceneLoader looks up the SpawnPoint
## whose `spawn_id` matches the requested one and moves the player there.

@export var spawn_id: String = "spawn_default"
