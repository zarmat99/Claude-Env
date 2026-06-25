extends Node
## Global signal hub (autoload). The ONLY channel for cross-system notifications.
## Emit through here; never reach across the scene tree for global concerns.
## Contract documented in docs/architecture/SYSTEMS.md. M0: declarations only.

# --- Quests ---
signal quest_started(quest_id: String)
signal quest_stage_updated(quest_id: String, stage: int)
signal quest_completed(quest_id: String)

# --- Inventory ---
signal item_added(item_id: String, count: int)
signal item_removed(item_id: String, count: int)

# --- Combat / actors ---
signal actor_damaged(actor: Node, amount: int, source: Node)
signal actor_died(actor: Node)

# --- Dialogue ---
signal dialogue_started(dialogue_id: String)
signal dialogue_ended(dialogue_id: String)

# --- Interaction (UI prompt; empty string hides it) ---
signal interaction_prompt_changed(text: String)

# --- World ---
signal map_changed(map_id: String)
signal world_object_state_changed(persistent_id: String, state: String)

# --- Progression / economy ---
signal player_level_up(new_level: int)
signal xp_gained(amount: int)
signal gold_changed(new_total: int)
