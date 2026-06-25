extends StaticBody2D
class_name NPC
## Data-driven NPC (M2). Loads its definition from DataRegistry by `npc_id`, shows its name, and
## opens its dialogue when interacted with. No quest/inventory logic here (separation of concerns).

@export var npc_id: String = ""

var data: Dictionary = {}

@onready var _name_label: Label = $NameLabel
@onready var _interaction: InteractionComponent = $InteractionComponent

func _ready() -> void:
    data = DataRegistry.get_npc(npc_id)
    var display_name := String(data.get("name", npc_id))
    _name_label.text = display_name
    _interaction.prompt = "Talk to %s" % display_name
    _interaction.interacted.connect(_on_interacted)

func _on_interacted(_by: Node) -> void:
    EventBus.npc_talked.emit(npc_id)
    var dialogue_id := String(data.get("dialogue", ""))
    if dialogue_id != "":
        DialogueManager.start(dialogue_id)
