extends Node
## Player-facing settings (M16). Persists to user://settings.cfg and applies on boot. Currently
## handles master audio volume; input remapping and more options can extend the same config.

const SETTINGS_PATH := "user://settings.cfg"

var master_volume: float = 1.0  # 0.0 .. 1.0

func _ready() -> void:
    load_settings()
    apply()

func load_settings() -> void:
    var cfg := ConfigFile.new()
    if cfg.load(SETTINGS_PATH) == OK:
        master_volume = clampf(float(cfg.get_value("audio", "master_volume", 1.0)), 0.0, 1.0)

func save_settings() -> void:
    var cfg := ConfigFile.new()
    cfg.set_value("audio", "master_volume", master_volume)
    cfg.save(SETTINGS_PATH)

func set_master_volume(value: float) -> void:
    master_volume = clampf(value, 0.0, 1.0)
    apply()
    save_settings()
    EventBus.settings_changed.emit()

func get_master_volume() -> float:
    return master_volume

func apply() -> void:
    var bus := AudioServer.get_bus_index("Master")
    if bus < 0:
        return
    if master_volume <= 0.0:
        AudioServer.set_bus_mute(bus, true)
    else:
        AudioServer.set_bus_mute(bus, false)
        AudioServer.set_bus_volume_db(bus, linear_to_db(master_volume))
