extends VBoxContainer
class_name SaveSlotList
## Reusable save-slot list (M16) shared by the PauseMenu and the GameOver screen, so slot rendering
## and load/save/delete logic live in one place. Shows the autosave plus numbered slots with their
## metadata; Load is always offered, Save/Delete are optional. Emits `slot_loaded` after a successful
## load so the host can close/unpause.

signal slot_loaded()

const SLOT_COUNT := 3

var _show_save := false
var _show_delete := false

func configure(show_save: bool, show_delete: bool) -> void:
    _show_save = show_save
    _show_delete = show_delete

func refresh() -> void:
    for child in get_children():
        remove_child(child)
        child.queue_free()
    if SaveManager.has_autosave():
        _add_autosave_row(SaveManager.get_autosave_info())
    for info in SaveManager.list_saves(SLOT_COUNT):
        _add_slot_row(info)

func _add_autosave_row(info: Dictionary) -> void:
    var row := HBoxContainer.new()
    var label := Label.new()
    label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
    label.text = "Autosave: %s  Lv%d  %dg" % [String(info.get("map_display", "")), int(info.get("level", 1)), int(info.get("gold", 0))]
    row.add_child(label)
    row.add_child(_button("Load", _on_load_autosave))
    add_child(row)

func _add_slot_row(info: Dictionary) -> void:
    var slot := int(info.get("slot", 0))
    var exists := bool(info.get("exists", false))
    var row := HBoxContainer.new()
    var label := Label.new()
    label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
    if exists:
        label.text = "Slot %d: %s  Lv%d  %dg" % [slot, String(info.get("map_display", "")), int(info.get("level", 1)), int(info.get("gold", 0))]
    else:
        label.text = "Slot %d: (empty)" % slot
    row.add_child(label)
    if _show_save:
        row.add_child(_button("Save", _on_save.bind(slot)))
    if exists:
        row.add_child(_button("Load", _on_load.bind(slot)))
        if _show_delete:
            row.add_child(_button("Del", _on_delete.bind(slot)))
    add_child(row)

func _on_save(slot: int) -> void:
    SaveManager.save_game(slot)
    refresh()

func _on_load(slot: int) -> void:
    if SaveManager.load_game(slot):
        slot_loaded.emit()

func _on_load_autosave() -> void:
    if SaveManager.load_autosave():
        slot_loaded.emit()

func _on_delete(slot: int) -> void:
    SaveManager.delete_save(slot)
    refresh()

func _button(text: String, cb: Callable) -> Button:
    var b := Button.new()
    b.text = text
    b.pressed.connect(cb)
    return b
