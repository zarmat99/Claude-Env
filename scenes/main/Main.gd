extends Node2D
## Boot scene root (M1). Assembles the test map, player, and HUD.
## NOTE: instantiating the map here is temporary; map loading moves into the data-driven
## SceneLoader (maps.json) at M6.

const VillageScene := preload("res://scenes/maps/Village.tscn")
const PlayerScene := preload("res://scenes/player/Player.tscn")
const HUDScene := preload("res://scenes/ui/HUD.tscn")
const DialogueBoxScene := preload("res://scenes/ui/DialogueBox.tscn")
const QuestJournalScene := preload("res://scenes/ui/QuestJournalUI.tscn")

@onready var _world: Node2D = $WorldRoot
@onready var _ui: CanvasLayer = $UIRoot

func _ready() -> void:
    print("[Valdombra] Boot OK - Milestone 3.")

    var map := VillageScene.instantiate()
    _world.add_child(map)

    var player := PlayerScene.instantiate()
    _world.add_child(player)
    if map.has_method("get_spawn_position"):
        player.global_position = map.get_spawn_position()
    GameState.current_map = "map_village"

    _ui.add_child(HUDScene.instantiate())
    _ui.add_child(DialogueBoxScene.instantiate())
    _ui.add_child(QuestJournalScene.instantiate())
