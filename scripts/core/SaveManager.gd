extends Node
## Serializes a GameState snapshot to user://saves/slot_N.json and restores it (autoload).
## M0: skeleton only; full serialization lands in M7. Schema: docs/architecture/DATA_SCHEMAS.md.

const SAVE_DIR := "user://saves/"
const SAVE_VERSION := 1

func save_game(slot: int = 0) -> void:
    # M0 skeleton: real serialization of GameState lands in M7.
    push_warning("SaveManager.save_game not implemented yet (M0 skeleton): slot %d" % slot)

func load_game(slot: int = 0) -> void:
    # M0 skeleton: real deserialization + persistent-object apply lands in M7.
    push_warning("SaveManager.load_game not implemented yet (M0 skeleton): slot %d" % slot)
