// All item definitions — immutable
export const ITEMS = Object.freeze({
    // === WEAPONS ===
    iron_sword: {
        id: 'iron_sword', name: 'Iron Sword', type: 'weapon', subtype: 'blade',
        spriteKey: 'item_iron_sword', weight: 3, value: 50,
        stats: { damage: [8, 14], speed: 1.0, reach: 1 },
        skillUsed: 'blades',
        description: 'A standard iron sword. Reliable if unremarkable.',
        lore: 'The blade of a Varesh footsoldier. Thousands like it rust in fields across Varethos.',
        stackable: false, requirements: { attribute: { STR: 4 } }
    },
    steel_sword: {
        id: 'steel_sword', name: 'Steel Sword', type: 'weapon', subtype: 'blade',
        spriteKey: 'item_steel_sword', weight: 3.5, value: 150,
        stats: { damage: [13, 20], speed: 1.0, reach: 1 },
        skillUsed: 'blades',
        description: 'A well-forged steel sword with good balance.',
        lore: '', stackable: false, requirements: { attribute: { STR: 5 }, skill: { blades: 15 } }
    },
    rootstone_blade: {
        id: 'rootstone_blade', name: 'Rootstone Blade', type: 'weapon', subtype: 'blade',
        spriteKey: 'item_rootstone_blade', weight: 2.5, value: 800,
        stats: { damage: [18, 28], speed: 1.1, reach: 1, magicDamage: 5 },
        skillUsed: 'blades',
        description: 'A blade infused with crystalline Rootstone energy. Glows faintly teal.',
        lore: 'Carved from a shard of dead Rootstone by Cindrak master smith Vreth. The glow has never faded.',
        stackable: false, requirements: { attribute: { STR: 6 }, skill: { blades: 40 } }
    },
    iron_mace: {
        id: 'iron_mace', name: 'Iron Mace', type: 'weapon', subtype: 'blunt',
        spriteKey: 'item_iron_mace', weight: 4, value: 45,
        stats: { damage: [10, 16], speed: 0.8, armorPen: 5 },
        skillUsed: 'blunt',
        description: 'Heavy and brutal. Effective against armored foes.',
        lore: '', stackable: false, requirements: { attribute: { STR: 5 } }
    },
    wooden_bow: {
        id: 'wooden_bow', name: 'Wooden Bow', type: 'weapon', subtype: 'bow',
        spriteKey: 'item_wooden_bow', weight: 2, value: 40,
        stats: { damage: [6, 12], speed: 0.7, reach: 5 },
        skillUsed: 'archery',
        ammoType: 'arrow',
        description: 'A simple hunting bow. Effective at range.',
        lore: '', stackable: false, requirements: { attribute: { AGI: 4 } }
    },
    iron_arrow: {
        id: 'iron_arrow', name: 'Iron Arrow', type: 'ammo', subtype: 'arrow',
        spriteKey: 'item_arrow', weight: 0.1, value: 2,
        stats: {}, description: 'Standard iron-tipped arrow.',
        lore: '', stackable: true, maxStack: 99, requirements: {}
    },
    staff_of_sparks: {
        id: 'staff_of_sparks', name: 'Staff of Sparks', type: 'weapon', subtype: 'staff',
        spriteKey: 'item_staff', weight: 2, value: 120,
        stats: { damage: [5, 9], speed: 0.9, magicDamage: 10, manaCost: 8 },
        skillUsed: 'destruction',
        description: 'A simple destruction staff that channels lightning sparks.',
        lore: '', stackable: false, requirements: { attribute: { INT: 6 }, skill: { destruction: 10 } }
    },
    dagger: {
        id: 'dagger', name: 'Iron Dagger', type: 'weapon', subtype: 'blade',
        spriteKey: 'item_dagger', weight: 1, value: 25,
        stats: { damage: [4, 8], speed: 1.5, reach: 1, sneakMultiplier: 3 },
        skillUsed: 'blades',
        description: 'A short, fast blade. Deadly from the shadows.',
        lore: '', stackable: false, requirements: {}
    },

    // === ARMOR ===
    leather_chest: {
        id: 'leather_chest', name: 'Leather Jerkin', type: 'armor', subtype: 'chest',
        spriteKey: 'item_leather_chest', weight: 5, value: 60,
        stats: { defense: 8, slot: 'chest' },
        skillUsed: 'block',
        description: 'Cured leather protection. Light but effective.',
        lore: '', stackable: false, requirements: {}
    },
    iron_chest: {
        id: 'iron_chest', name: 'Iron Cuirass', type: 'armor', subtype: 'chest',
        spriteKey: 'item_iron_chest', weight: 12, value: 180,
        stats: { defense: 18, slot: 'chest' },
        description: 'Heavy iron plate armor. Solid protection.',
        lore: '', stackable: false,
        requirements: { attribute: { STR: 5 }, race: ['varesh', 'cindrak', 'sylveni', 'vorrkai'] }
    },
    leather_helm: {
        id: 'leather_helm', name: 'Leather Cap', type: 'armor', subtype: 'head',
        spriteKey: 'item_leather_helm', weight: 1.5, value: 25,
        stats: { defense: 3, slot: 'head' },
        description: 'Basic head protection.', lore: '', stackable: false, requirements: {}
    },
    iron_helm: {
        id: 'iron_helm', name: 'Iron Helm', type: 'armor', subtype: 'head',
        spriteKey: 'item_iron_helm', weight: 4, value: 80,
        stats: { defense: 8, slot: 'head' },
        description: 'Iron helm with cheek guards.', lore: '', stackable: false,
        requirements: { race: ['varesh', 'cindrak', 'sylveni', 'vorrkai'] }
    },
    bark_armor: {
        id: 'bark_armor', name: 'Bark Plate', type: 'armor', subtype: 'chest',
        spriteKey: 'item_bark_chest', weight: 6, value: 90,
        stats: { defense: 14, slot: 'chest' },
        description: 'Thornkin-crafted armor from hardened tree bark. Equivalent to chain mail.',
        lore: 'The Thornkin grow their armor as much as they craft it.', stackable: false,
        requirements: { race: ['thornkin'] }
    },

    // === CONSUMABLES ===
    health_potion_minor: {
        id: 'health_potion_minor', name: 'Minor Health Potion', type: 'consumable', subtype: 'potion',
        spriteKey: 'item_potion_red', weight: 0.3, value: 20,
        effects: [{ type: 'heal', magnitude: 25, duration: 0 }],
        description: 'A small vial of reddish restorative liquid. Heals 25 HP.',
        lore: '', stackable: true, maxStack: 20, requirements: {}
    },
    health_potion: {
        id: 'health_potion', name: 'Health Potion', type: 'consumable', subtype: 'potion',
        spriteKey: 'item_potion_red', weight: 0.4, value: 60,
        effects: [{ type: 'heal', magnitude: 60, duration: 0 }],
        description: 'A standard health potion. Heals 60 HP.',
        lore: '', stackable: true, maxStack: 20, requirements: {}
    },
    mana_potion: {
        id: 'mana_potion', name: 'Mana Potion', type: 'consumable', subtype: 'potion',
        spriteKey: 'item_potion_blue', weight: 0.4, value: 50,
        effects: [{ type: 'restore_mana', magnitude: 50, duration: 0 }],
        description: 'Restores 50 mana.', lore: '', stackable: true, maxStack: 20, requirements: {}
    },
    stamina_potion: {
        id: 'stamina_potion', name: 'Stamina Draught', type: 'consumable', subtype: 'potion',
        spriteKey: 'item_potion_green', weight: 0.4, value: 35,
        effects: [{ type: 'restore_stamina', magnitude: 50, duration: 0 }],
        description: 'Restores 50 stamina.', lore: '', stackable: true, maxStack: 20, requirements: {}
    },
    antidote: {
        id: 'antidote', name: 'Antidote', type: 'consumable', subtype: 'potion',
        spriteKey: 'item_potion_yellow', weight: 0.3, value: 30,
        effects: [{ type: 'cure_poison', magnitude: 1, duration: 0 }],
        description: 'Cures poison effects.', lore: '', stackable: true, maxStack: 10, requirements: {}
    },
    bread: {
        id: 'bread', name: 'Loaf of Bread', type: 'consumable', subtype: 'food',
        spriteKey: 'item_food', weight: 0.5, value: 3,
        effects: [{ type: 'heal', magnitude: 5, duration: 30 }, { type: 'restore_stamina', magnitude: 10, duration: 0 }],
        description: 'Common bread. Slowly restores a small amount of health.',
        lore: '', stackable: true, maxStack: 10, requirements: {}
    },

    // === INGREDIENTS ===
    emberpetal: {
        id: 'emberpetal', name: 'Emberpetal', type: 'ingredient', subtype: 'herb',
        spriteKey: 'item_herb_red', weight: 0.1, value: 15,
        alchemyEffects: ['fire_resistance', 'stamina_boost'],
        description: 'A flame-colored flower from the Emberpeak foothills. Warm to the touch.',
        lore: '', stackable: true, maxStack: 20, requirements: {}
    },
    rootmoss: {
        id: 'rootmoss', name: 'Rootmoss', type: 'ingredient', subtype: 'herb',
        spriteKey: 'item_herb_green', weight: 0.1, value: 10,
        alchemyEffects: ['healing', 'mana_restore'],
        description: 'Pale green moss found near Rootstone formations. Softly luminescent.',
        lore: '', stackable: true, maxStack: 20, requirements: {}
    },
    shadowcap: {
        id: 'shadowcap', name: 'Shadowcap Mushroom', type: 'ingredient', subtype: 'fungus',
        spriteKey: 'item_herb_purple', weight: 0.15, value: 20,
        alchemyEffects: ['sneak_boost', 'poison'],
        description: 'Dark purple mushroom from cave environments. Mildly toxic raw.',
        lore: '', stackable: true, maxStack: 20, requirements: {}
    },
    voidbloom: {
        id: 'voidbloom', name: 'Voidbloom', type: 'ingredient', subtype: 'herb',
        spriteKey: 'item_herb_dark', weight: 0.1, value: 40,
        alchemyEffects: ['mana_restore', 'magic_boost'],
        description: 'A rare black flower with faintly glowing edges. Found in Underlurk depths.',
        lore: '', stackable: true, maxStack: 10, requirements: {}
    },
    iron_ore: {
        id: 'iron_ore', name: 'Iron Ore', type: 'ingredient', subtype: 'mineral',
        spriteKey: 'item_ore_iron', weight: 2, value: 8,
        smithingUse: 'iron',
        description: 'Raw iron ore. Can be smelted at a forge.',
        lore: '', stackable: true, maxStack: 20, requirements: {}
    },
    iron_ingot: {
        id: 'iron_ingot', name: 'Iron Ingot', type: 'ingredient', subtype: 'mineral',
        spriteKey: 'item_ingot', weight: 1, value: 20,
        smithingUse: 'iron_refined',
        description: 'Smelted iron ingot ready for forging.',
        lore: '', stackable: true, maxStack: 10, requirements: {}
    },
    leather_strips: {
        id: 'leather_strips', name: 'Leather Strips', type: 'ingredient', subtype: 'material',
        spriteKey: 'item_leather', weight: 0.2, value: 5,
        smithingUse: 'leather',
        description: 'Cured leather strips used in crafting armor and hilts.',
        lore: '', stackable: true, maxStack: 20, requirements: {}
    },
    rootstone_fragment: {
        id: 'rootstone_fragment', name: 'Rootstone Fragment', type: 'ingredient', subtype: 'mineral',
        spriteKey: 'item_rootstone', weight: 0.5, value: 200,
        smithingUse: 'rootstone',
        alchemyEffects: ['magic_boost', 'healing'],
        description: 'A shard of crystalline Rootstone. It hums faintly with residual energy.',
        lore: 'The Rootwardens strictly prohibit collecting these. You\'ve collected one anyway.',
        stackable: true, maxStack: 5, requirements: {}
    },

    // === QUEST ITEMS ===
    resonance_sample: {
        id: 'resonance_sample', name: 'Resonance Sample', type: 'quest', subtype: 'sample',
        spriteKey: 'item_quest', weight: 0.2, value: 0,
        description: 'A crystal vial containing absorbed Rootstone resonance data. For Elder Sathis.',
        lore: '', stackable: false, requirements: {}
    },
    sundering_rite: {
        id: 'sundering_rite', name: 'The Sundering Rite', type: 'quest', subtype: 'document',
        spriteKey: 'item_scroll', weight: 0.1, value: 0,
        description: 'A stolen Underlurk Cult ritual document. Details the plan to destroy all Rootstones simultaneously.',
        lore: 'This document should not exist.', stackable: false, requirements: {}
    },
    cael_notes: {
        id: 'cael_notes', name: 'Cael\'s Research Notes', type: 'quest', subtype: 'document',
        spriteKey: 'item_scroll', weight: 0.1, value: 0,
        description: 'Warden Cael\'s personal notes. They point to an Underlurk chasm accessible through a collapsed mining shaft.',
        lore: '', stackable: false, requirements: {}
    },

    // === MISC ===
    gold_coin: {
        id: 'gold_coin', name: 'Gold Coin', type: 'misc', subtype: 'currency',
        spriteKey: 'item_gold', weight: 0.01, value: 1,
        description: 'Auric Concordat standard currency.', lore: '',
        stackable: true, maxStack: 9999, requirements: {}
    },
    key_greyhollow_warehouse: {
        id: 'key_greyhollow_warehouse', name: 'Warehouse Key', type: 'misc', subtype: 'key',
        spriteKey: 'item_key', weight: 0.1, value: 5,
        description: 'A key to the Greyhollow merchant warehouse.', lore: '',
        stackable: false, requirements: {}
    },
    torch: {
        id: 'torch', name: 'Torch', type: 'misc', subtype: 'light',
        spriteKey: 'item_torch', weight: 0.5, value: 5,
        effects: [{ type: 'light_radius', magnitude: 4, duration: 600 }],
        description: 'A simple torch. Reduces darkness overlay in a radius.',
        lore: '', stackable: true, maxStack: 5, requirements: {}
    }
});

export function getItem(id) {
    return ITEMS[id] || null;
}

export function getItemsByType(type) {
    return Object.values(ITEMS).filter(i => i.type === type);
}
