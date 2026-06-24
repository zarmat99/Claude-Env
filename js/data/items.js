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
        lore: '', stackable: true, maxStack: 99, requirements: {}
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
    ledger_evidence: {
        id: 'ledger_evidence', name: 'Warehouse Ledger Evidence', type: 'quest', subtype: 'document',
        spriteKey: 'item_scroll', weight: 0.1, value: 0,
        description: 'Altered Greyhollow consignment records and a letter explaining where the stolen surplus went.',
        lore: '', stackable: false, requirements: {}
    },
    massacre_orders: {
        id: 'massacre_orders', name: 'Sealed Massacre Orders', type: 'quest', subtype: 'document',
        spriteKey: 'item_scroll', weight: 0.1, value: 0,
        description: 'Iron Compact orders bearing Warmaster Kash\'s seal. The contents could fracture an alliance.',
        lore: '', stackable: false, requirements: {}
    },
    voidbloom_weave: {
        id: 'voidbloom_weave', name: 'Voidbloom Weave', type: 'quest', subtype: 'ritual',
        spriteKey: 'item_quest', weight: 0.2, value: 0,
        description: 'Five Voidblooms woven into a Rootwarden ritual lattice.',
        lore: '', stackable: false, requirements: {}
    },

    // === FACTION WEAPONS ===
    penitent_staff: {
        id: 'penitent_staff', name: 'Penitent\'s Staff', type: 'weapon', subtype: 'staff',
        spriteKey: 'item_staff', weight: 2.5, value: 220,
        effects: [{ type: 'damage', magnitude: [10, 16] }, { type: 'int_scaling', magnitude: 0.15 }],
        description: 'A walking staff of the Grey Penitents, carved from Rootwood. Those who carry it feel the world\'s weight more keenly.',
        lore: 'Inscribed: "To know is to share the burden."', stackable: false,
        requirements: { INT: 6, reputation_grey_penitents: 50 }, faction: 'grey_penitents'
    },
    compact_warblade: {
        id: 'compact_warblade', name: 'Compact Warblade', type: 'weapon', subtype: 'sword',
        spriteKey: 'item_sword', weight: 3.2, value: 180,
        effects: [{ type: 'damage', magnitude: [11, 18] }, { type: 'armor_piercing', magnitude: 8 }],
        description: 'Iron Compact military-issue. The edge is designed to find gaps in armour.',
        lore: 'Stamped with the Compact eagle and a serial number.', stackable: false,
        requirements: { STR: 7 }, faction: 'iron_compact'
    },
    concordat_rapier: {
        id: 'concordat_rapier', name: 'Concordat Rapier', type: 'weapon', subtype: 'blade',
        spriteKey: 'item_dagger', weight: 1.4, value: 240,
        effects: [{ type: 'damage', magnitude: [8, 14] }, { type: 'crit_chance', magnitude: 0.20 }],
        description: 'A Concordat duelling blade, legally restricted to ranked members. Light, fast, and deeply political.',
        lore: '', stackable: false,
        requirements: { AGI: 7, reputation_auric_concordat: 40 }, faction: 'auric_concordat'
    },

    // === ARMOUR ===
    vorrkai_chitin_armor: {
        id: 'vorrkai_chitin_armor', name: 'Vorrkai Chitin Armour', type: 'armor', subtype: 'medium',
        spriteKey: 'item_armor', weight: 6.5, value: 260,
        effects: [{ type: 'armor', magnitude: 7 }, { type: 'weight_reduction', magnitude: 0.10 }, { type: 'light_radius', magnitude: 1 }],
        description: 'Grown rather than forged, from the carapaces of cave-creatures the Vorrkai raise underground. Faintly bioluminescent.',
        lore: 'The glow is a side-effect of the organism\'s diet. The Vorrkai consider it a mark of care.', stackable: false,
        requirements: {}, faction: 'vorrkai'
    },
    arcanate_robe: {
        id: 'arcanate_robe', name: 'Arcanate Scholar\'s Robe', type: 'armor', subtype: 'light',
        spriteKey: 'item_robe', weight: 1.2, value: 310,
        effects: [{ type: 'armor', magnitude: 2 }, { type: 'int_scaling', magnitude: 0.25 }, { type: 'physical_resist', magnitude: -0.50 }],
        description: 'Pre-Shattering academic robes. They amplify resonance reading but offer almost no protection.',
        lore: 'The stitching contains mathematical proofs that are still unsolved.', stackable: false,
        requirements: { INT: 8 }
    },
    compact_plate: {
        id: 'compact_plate', name: 'Iron Compact Plate', type: 'armor', subtype: 'heavy',
        spriteKey: 'item_armor', weight: 18.0, value: 290,
        effects: [{ type: 'armor', magnitude: 14 }, { type: 'speed_penalty', magnitude: -0.15 }],
        description: 'Standard Iron Compact heavy plate. It turns most blows but slows the wearer considerably.',
        lore: '', stackable: false,
        requirements: { END: 8, STR: 7 }, faction: 'iron_compact'
    },
    bark_cloak: {
        id: 'bark_cloak', name: 'Thornkin Bark Cloak', type: 'armor', subtype: 'light',
        spriteKey: 'item_cloak', weight: 2.0, value: 200,
        effects: [{ type: 'armor', magnitude: 6 }, { type: 'nature_resistance', magnitude: 0.30 }],
        description: 'Woven from the shed bark of a living Thornkin elder. It grows back.',
        lore: 'The Thornkin consider this a gift, not a product.', stackable: false,
        requirements: {}, faction: 'thornkin'
    },
    ashveil_coat: {
        id: 'ashveil_coat', name: 'Ashveil Desert Coat', type: 'armor', subtype: 'medium',
        spriteKey: 'item_cloak', weight: 3.5, value: 145,
        effects: [{ type: 'armor', magnitude: 5 }, { type: 'environment_resist', biomes: ['DESERT', 'TUNDRA'], magnitude: 0.25 }],
        description: 'Heavy-woven coat designed for Ashveil\'s punishing winds. The layered fabric insulates against both cold and heat.',
        lore: 'Made in the Ashveil Outpost, where they have had centuries to perfect it.', stackable: false,
        requirements: {}
    },

    // === CONSUMABLES ===
    void_essence: {
        id: 'void_essence', name: 'Void Essence', type: 'consumable', subtype: 'potion',
        spriteKey: 'item_potion', weight: 0.3, value: 60,
        effects: [{ type: 'restore_mana', magnitude: 50 }, { type: 'addictive_penalty', uses: 2, penalty: { type: 'damage_self', magnitude: 5 } }],
        description: 'A crystallised concentration of void energy. Restores mana rapidly but is mildly addictive.',
        lore: 'The second use always hurts more than the first.', stackable: true, maxStack: 10, requirements: {}
    },
    vorrkai_biolamp: {
        id: 'vorrkai_biolamp', name: 'Vorrkai Biolamp', type: 'consumable', subtype: 'light',
        spriteKey: 'item_torch', weight: 0.4, value: 35,
        effects: [{ type: 'light_radius', magnitude: 5, duration: 120 }],
        description: 'A glass vessel containing a living bioluminescent organism. Lasts four times as long as a torch.',
        lore: 'The organism will die if removed from its vessel.', stackable: true, maxStack: 5, requirements: {}
    },
    rootstone_tincture: {
        id: 'rootstone_tincture', name: 'Rootstone Tincture', type: 'consumable', subtype: 'potion',
        spriteKey: 'item_potion', weight: 0.3, value: 55,
        effects: [{ type: 'restore_health', magnitude: 80 }, { type: 'regen_health', magnitude: 5, duration: 2 }],
        description: 'Distilled from rootstone fragments. Heals rapidly then continues regenerating.',
        lore: '', stackable: true, maxStack: 5,
        requirements: {}, craftable: true, craftRecipe: [{ itemId: 'rootstone_fragment', qty: 1 }]
    },
    emberpetal_salve: {
        id: 'emberpetal_salve', name: 'Emberpetal Salve', type: 'consumable', subtype: 'potion',
        spriteKey: 'item_potion', weight: 0.2, value: 45,
        effects: [{ type: 'cure_burn' }, { type: 'restore_health', magnitude: 25 }],
        description: 'A paste of ground emberpetal ash. Cures burns and soothes the tissue beneath.',
        lore: '', stackable: true, maxStack: 10,
        requirements: {}, craftable: true, craftRecipe: [{ itemId: 'emberpetal', qty: 1 }]
    },
    rootmoss_poultice: {
        id: 'rootmoss_poultice', name: 'Rootmoss Poultice', type: 'consumable', subtype: 'potion',
        spriteKey: 'item_potion', weight: 0.2, value: 40,
        effects: [{ type: 'restore_stamina', magnitude: 60 }],
        description: 'A cool green compress made from rootmoss. Relieves exhaustion almost immediately.',
        lore: '', stackable: true, maxStack: 10,
        requirements: {}, craftable: true, craftRecipe: [{ itemId: 'rootmoss', qty: 2 }]
    },
    cave_mushroom: {
        id: 'cave_mushroom', name: 'Cave Mushroom', type: 'consumable', subtype: 'food',
        spriteKey: 'item_potion', weight: 0.1, value: 12,
        effects: [{ type: 'restore_health', magnitude: 20 }, { type: 'blur', duration: 1 }],
        description: 'A phosphorescent mushroom found in cave biomes. Nutritious but briefly disorienting.',
        lore: 'The Vorrkai eat them with every meal. Outsiders need time to adjust.', stackable: true, maxStack: 15, requirements: {}
    },
    arcanate_stimulant: {
        id: 'arcanate_stimulant', name: 'Arcanate Stimulant', type: 'consumable', subtype: 'potion',
        spriteKey: 'item_potion', weight: 0.2, value: 80,
        effects: [
            { type: 'buff_stat', stat: 'AGI', magnitude: 3, duration: 3 },
            { type: 'buff_stat', stat: 'INT', magnitude: 3, duration: 3 },
            { type: 'crash_penalty', delay: 3, magnitude: 20 }
        ],
        description: 'An Arcanate cognitive compound. Dramatically improves reflexes and cognition, then crashes hard.',
        lore: 'Found only in the Ruins. The Arcanate apparently used these routinely.', stackable: true, maxStack: 5, requirements: {}
    },
    vorrkai_paste: {
        id: 'vorrkai_paste', name: 'Vorrkai Root Paste', type: 'consumable', subtype: 'food',
        spriteKey: 'item_potion', weight: 0.3, value: 20,
        effects: [{ type: 'regen_health', magnitude: 8, duration: 5 }],
        description: 'A dense paste made from underground root vegetables. Sustaining and slow-acting.',
        lore: 'A Vorrkai will share this before asking your name.', stackable: true, maxStack: 10, requirements: {}
    },

    // === CRAFTING INGREDIENTS ===
    void_shard: {
        id: 'void_shard', name: 'Void Shard', type: 'ingredient', subtype: 'crystal',
        spriteKey: 'item_material', weight: 0.2, value: 35,
        description: 'A crystallised fragment from a destroyed Void Anchor. Potent but unstable.',
        lore: '', stackable: true, maxStack: 20, requirements: {}
    },
    arcanate_crystal: {
        id: 'arcanate_crystal', name: 'Arcanate Crystal', type: 'ingredient', subtype: 'crystal',
        spriteKey: 'item_material', weight: 0.4, value: 65,
        description: 'A resonance-bearing crystal from the Arcanate Ruins. Rare and irreplaceable.',
        lore: 'The crystal was grown, not mined.', stackable: true, maxStack: 10, requirements: {}
    },
    vorrkai_silk: {
        id: 'vorrkai_silk', name: 'Vorrkai Silk', type: 'ingredient', subtype: 'material',
        spriteKey: 'item_material', weight: 0.1, value: 40,
        description: 'Thread spun from underground cave-moth cocoons. Stronger than iron for its weight.',
        lore: '', stackable: true, maxStack: 20, requirements: {}
    },
    ashveil_salt: {
        id: 'ashveil_salt', name: 'Ashveil Salt', type: 'ingredient', subtype: 'mineral',
        spriteKey: 'item_material', weight: 0.3, value: 25,
        description: 'Crystalline salt deposits from the Ashveil wasteland. Preserves and fortifies.',
        lore: 'The dying Rootstone leaches minerals into the ground around it.', stackable: true, maxStack: 30, requirements: {}
    },
    crystallized_rootstone: {
        id: 'crystallized_rootstone', name: 'Crystallised Rootstone', type: 'ingredient', subtype: 'crystal',
        spriteKey: 'item_material', weight: 0.5, value: 120,
        description: 'A purified form of rootstone fragment. Requires advanced alchemy to produce.',
        lore: '', stackable: true, maxStack: 5, requirements: {}
    },
    cult_sigil: {
        id: 'cult_sigil', name: 'Cult Commander\'s Sigil', type: 'ingredient', subtype: 'misc',
        spriteKey: 'item_key', weight: 0.1, value: 50,
        description: 'An Underlurk Cult rank badge. Abbess Vonn would very much like to see this.',
        lore: '', stackable: false, requirements: {}
    },

    // === QUEST ITEMS ===
    engine_core_data: {
        id: 'engine_core_data', name: 'Engine Core Data', type: 'quest', subtype: 'document',
        spriteKey: 'item_quest', weight: 0.1, value: 0,
        description: 'Technical specifications and activation sequence for the Arcanate\'s 48th Resonance Engine.',
        lore: '', stackable: false, requirements: {}
    },
    ashveil_reading: {
        id: 'ashveil_reading', name: 'Ashveil Stone Reading', type: 'quest', subtype: 'document',
        spriteKey: 'item_quest', weight: 0.1, value: 0,
        description: 'Resonance measurements of the dying Ashveil Stone. The numbers tell a clear story.',
        lore: '', stackable: false, requirements: {}
    },
    oren_journal_copy: {
        id: 'oren_journal_copy', name: "Oren's Journal (copy)", type: 'quest', subtype: 'document',
        spriteKey: 'item_quest', weight: 0.2, value: 0,
        description: 'A handwritten journal recovered from the Void Sanctum. The handwriting grows increasingly erratic over seven years.',
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
