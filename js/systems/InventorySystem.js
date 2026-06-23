// InventorySystem.js — Manages player inventory, equipment, consumables
import { ITEMS, getItem } from '../data/items.js';
import { computeDerived } from './StatsSystem.js';
import EventBus from './EventBus.js';

// ─── Add / Remove ─────────────────────────────────────────────────────────────

// Add itemId x quantity to player inventory. Returns true on success, false if over carry weight.
export function addItem(player, itemId, quantity = 1) {
    const itemDef = getItem(itemId);
    if (!itemDef) {
        console.warn(`[InventorySystem] Unknown item: ${itemId}`);
        return false;
    }

    // Carry weight check
    const addedWeight = itemDef.weight * quantity;
    const currentWeight = getTotalWeight(player);
    if (currentWeight + addedWeight > player.derived.maxCarryWeight) {
        EventBus.emit('show_notification', 'You cannot carry any more weight.', '#ff4444');
        return false;
    }

    if (itemDef.stackable) {
        const existing = player.inventory.find(slot => slot.itemId === itemId);
        if (existing) {
            const maxStack = itemDef.maxStack || 99;
            const canAdd   = maxStack - existing.quantity;
            if (canAdd <= 0) {
                EventBus.emit('show_notification', `${itemDef.name} stack is full.`, '#ffaa00');
                return false;
            }
            existing.quantity += Math.min(quantity, canAdd);
        } else {
            player.inventory.push({ itemId, quantity: Math.min(quantity, itemDef.maxStack || 99) });
        }
    } else {
        // Non-stackable: one slot per item
        for (let i = 0; i < quantity; i++) {
            const entry = { itemId, quantity: 1 };
            if (typeof itemDef.maxDurability === 'number') entry.durability = itemDef.maxDurability;
            player.inventory.push(entry);
        }
    }

    EventBus.emit('item_collected', itemId, quantity);
    return true;
}

// Remove itemId x quantity from player inventory. Returns true on success.
export function removeItem(player, itemId, quantity = 1) {
    const itemDef = getItem(itemId);
    if (!itemDef) return false;

    if (itemDef.stackable) {
        const slot = player.inventory.find(s => s.itemId === itemId);
        if (!slot || slot.quantity < quantity) return false;
        slot.quantity -= quantity;
        if (slot.quantity <= 0) {
            player.inventory = player.inventory.filter(s => s !== slot);
        }
    } else {
        let toRemove = quantity;
        for (let i = player.inventory.length - 1; i >= 0 && toRemove > 0; i--) {
            if (player.inventory[i].itemId === itemId) {
                player.inventory.splice(i, 1);
                toRemove--;
            }
        }
        if (toRemove > 0) return false;
    }
    return true;
}

// ─── Query ────────────────────────────────────────────────────────────────────

export function hasItem(player, itemId, quantity = 1) {
    return getItemCount(player, itemId) >= quantity;
}

export function getItemCount(player, itemId) {
    return player.inventory
        .filter(s => s.itemId === itemId)
        .reduce((sum, s) => sum + s.quantity, 0);
}

// Total carry weight of everything in inventory
export function getTotalWeight(player) {
    return player.inventory.reduce((total, slot) => {
        const def = getItem(slot.itemId);
        return total + (def ? def.weight * slot.quantity : 0);
    }, 0);
}

// ─── Equipment ────────────────────────────────────────────────────────────────

// Determine the equipment slot for an item
function getEquipSlot(itemDef) {
    if (itemDef.type === 'weapon')  return 'weapon';
    if (itemDef.type === 'armor')   return itemDef.subtype || itemDef.stats?.slot || null;
    if (itemDef.subtype === 'ring') return 'ring';
    if (itemDef.subtype === 'offhand' || itemDef.subtype === 'shield') return 'offhand';
    return null;
}

// Validate item requirements against player stats
function meetsRequirements(player, itemDef) {
    if (!itemDef.requirements) return true;
    const req = itemDef.requirements;

    if (req.attribute) {
        for (const [attr, val] of Object.entries(req.attribute)) {
            if ((player.attributes[attr] || 0) < val) return false;
        }
    }
    if (req.skill) {
        for (const [skillId, level] of Object.entries(req.skill)) {
            if ((player.skills[skillId]?.level || 0) < level) return false;
        }
    }
    if (req.race && !req.race.includes(player.race)) return false;
    return true;
}

// Equip an item from inventory to the appropriate slot
export function equipItem(player, itemId, scene) {
    const itemDef = getItem(itemId);
    if (!itemDef) return false;

    const slot = getEquipSlot(itemDef);
    if (!slot) {
        EventBus.emit('show_notification', 'This item cannot be equipped.', '#ff4444');
        return false;
    }

    if (!meetsRequirements(player, itemDef)) {
        EventBus.emit('show_notification', 'You do not meet the requirements for this item.', '#ff4444');
        return false;
    }

    // Thornkin metal armor restriction
    if (player.race === 'thornkin' && itemDef.subtype !== 'bark' && ['iron_chest','iron_helm','iron_chest'].includes(itemId)) {
        EventBus.emit('show_notification', 'Thornkin cannot wear metal armor.', '#ff4444');
        return false;
    }

    // Unequip whatever is in that slot first
    if (player.equipment[slot]) {
        unequipItem(player, slot, scene);
    }

    // Remove one copy from inventory
    if (!removeItem(player, itemId, 1)) {
        EventBus.emit('show_notification', 'Item not in inventory.', '#ff4444');
        return false;
    }

    player.equipment[slot] = itemDef;
    computeDerived(player);
    EventBus.emit('hud_update');
    return true;
}

// Unequip item from slot back to inventory
export function unequipItem(player, slot, scene) {
    const itemDef = player.equipment[slot];
    if (!itemDef) return false;

    player.equipment[slot] = null;
    // Add back to inventory (bypassing weight check since it was already carried)
    player.inventory.push({ itemId: itemDef.id, quantity: 1 });
    computeDerived(player);
    EventBus.emit('hud_update');
    return true;
}

// ─── Consumables ──────────────────────────────────────────────────────────────

// Use a consumable item — applies effects and removes from inventory
export function useItem(player, itemId, scene) {
    const itemDef = getItem(itemId);
    if (!itemDef) return false;

    if (itemDef.type !== 'consumable' && !(itemDef.effects && itemDef.effects.length > 0)) {
        EventBus.emit('show_notification', 'This item cannot be used directly.', '#ffaa00');
        return false;
    }

    if (!hasItem(player, itemId, 1)) {
        EventBus.emit('show_notification', 'You do not have that item.', '#ff4444');
        return false;
    }

    // Apply each effect
    for (const effect of (itemDef.effects || [])) {
        switch (effect.type) {
            case 'heal':
                player.derived.health = Math.min(
                    player.derived.maxHealth,
                    player.derived.health + effect.magnitude
                );
                EventBus.emit('show_notification', `+${effect.magnitude} HP`, '#44ff44');
                break;
            case 'restore_mana':
                player.derived.mana = Math.min(
                    player.derived.maxMana,
                    player.derived.mana + effect.magnitude
                );
                EventBus.emit('show_notification', `+${effect.magnitude} Mana`, '#4488ff');
                break;
            case 'restore_stamina':
                player.derived.stamina = Math.min(
                    player.derived.maxStamina,
                    player.derived.stamina + effect.magnitude
                );
                EventBus.emit('show_notification', `+${effect.magnitude} Stamina`, '#ffaa00');
                break;
            case 'cure_poison':
                // Signal to scene/combat to remove poison status
                EventBus.emit('show_notification', 'Poison cured!', '#44ff44');
                break;
            case 'light_radius':
                // Signal to WorldScene to update torch light
                if (scene && scene.events) {
                    scene.events.emit('torch_lit', effect.magnitude, effect.duration);
                }
                break;
            default:
                break;
        }
    }

    removeItem(player, itemId, 1);
    EventBus.emit('hud_update');
    return true;
}

// ─── Sort / Organize ──────────────────────────────────────────────────────────

// Sort inventory by type, then by name
export function sortInventory(player) {
    const typeOrder = { weapon: 0, armor: 1, consumable: 2, ingredient: 3, quest: 4, misc: 5 };
    player.inventory.sort((a, b) => {
        const defA = getItem(a.itemId);
        const defB = getItem(b.itemId);
        if (!defA || !defB) return 0;
        const typeA = typeOrder[defA.type] ?? 99;
        const typeB = typeOrder[defB.type] ?? 99;
        if (typeA !== typeB) return typeA - typeB;
        return defA.name.localeCompare(defB.name);
    });
}

// ─── Drop ─────────────────────────────────────────────────────────────────────

// Remove item from inventory and spawn a world pickup sprite at (worldX, worldY)
export function dropItem(player, itemId, quantity, worldX, worldY, scene) {
    if (!hasItem(player, itemId, quantity)) return false;
    removeItem(player, itemId, quantity);

    // Let the scene handle the world object creation
    if (scene && scene.spawnWorldItem) {
        scene.spawnWorldItem(itemId, quantity, worldX, worldY);
    } else {
        // Fallback: emit an event that the world scene can listen to
        EventBus.emit('item_dropped', itemId, quantity, worldX, worldY);
    }
    return true;
}
