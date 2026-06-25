extends Node2D
## Boot scene root. Creates the persistent player, binds SceneLoader, loads the start map, and
## builds the UI. Map loading now lives in SceneLoader (data-driven via maps.json) — Main no longer
## instantiates a specific map.

const PlayerScene := preload("res://scenes/player/Player.tscn")
const HUDScene := preload("res://scenes/ui/HUD.tscn")
const DialogueBoxScene := preload("res://scenes/ui/DialogueBox.tscn")
const QuestJournalScene := preload("res://scenes/ui/QuestJournalUI.tscn")
const InventoryUIScene := preload("res://scenes/ui/InventoryUI.tscn")

const START_MAP := "map_village"
const START_SPAWN := "spawn_default"

@onready var _world: Node2D = $WorldRoot
@onready var _ui: CanvasLayer = $UIRoot

func _ready() -> void:
    print("[Valdombra] Boot OK - Milestone 9.")
    var player := PlayerScene.instantiate()
    _world.add_child(player)

    SceneLoader.bind(_world, player)
    SceneLoader.change_map(START_MAP, START_SPAWN)

    _ui.add_child(HUDScene.instantiate())
    _ui.add_child(DialogueBoxScene.instantiate())
    _ui.add_child(QuestJournalScene.instantiate())
    _ui.add_child(InventoryUIScene.instantiate())
