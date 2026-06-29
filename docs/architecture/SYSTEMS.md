# RPG Skeleton - Systems

## Core
- `DataRegistry`: loads and validates all JSON data tables.
- `GameState`: runtime state and persistence boundary.
- `SceneLoader`: loads maps from `maps.json`, binds the persistent player, and emits map changes.
- `SaveManager`: save slots, autosave hook, metadata, migration/rejection, and restore.
- `SettingsManager`: player settings persistence.
- `GameOverManager`: death pauses the tree and resumes only after loading a save, with new-game fallback.

## Gameplay Systems
- `QuestManager`: staged quests, condition-based advancement, rewards.
- `DialogueManager`: graph dialogue, actions, conditions, entry rules, soft-lock guard.
- `FactionManager`: reputation and hostility/friendliness checks.
- `InventoryManager`: player inventory and consumables.
- `EquipmentManager`: equipment slots and derived stats.
- `EconomyManager`: buy/sell, merchant stock, trade failure events.
- `CombatSystem`: typed damage, armor, resistance, armor pierce.
- `SkillManager` and `PlayerAbilities`: skill XP/state and data-authored abilities.

## World/UI
- Generic player, NPC, enemy, pickup, chest, door, switch, transition, and authored-map components remain.
- UI shells remain passive and delegate state changes to managers.

## Testing
`SkeletonRegressionRunner` is the active regression target. It verifies the systems without old maps, story, or generated art.
