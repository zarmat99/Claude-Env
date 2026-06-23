// Enemy definitions for Aethermoor — pure data, no class logic
// All stat blocks, loot tables, biome tags, and abilities defined here.

export const ENEMIES = {

  // ─── TIER 1 ───────────────────────────────────────────────────────────────

  goblin: {
    id: 'goblin',
    name: 'Goblin Scavenger',
    spriteKey: 'enemy_goblin',
    health: 25, maxHealth: 25,
    mana: 0,
    attributes: { STR: 4, END: 3, AGI: 6, INT: 2, WIL: 2, PER: 5 },
    damage: [3, 7], armor: 2, speed: 1.1,
    xpReward: 20,
    gold: [2, 8],
    lootTable: [
      { itemId: 'iron_sword',          chance: 0.08 },
      { itemId: 'health_potion_minor', chance: 0.30 },
      { itemId: 'iron_arrow',          chance: 0.40, quantity: [3, 8] },
      { itemId: 'dagger',              chance: 0.12 },
      { itemId: 'bread',               chance: 0.25 }
    ],
    skills: { blades: 10, archery: 8 },
    biomes: ['FOREST', 'CAVE_FLOOR', 'GRASSLAND'],
    level: 1,
    aggressive: true, aggroRange: 5, fleeHealth: 0.15,
    description: 'A small, wiry creature that attacks in groups. Cowardly alone, dangerous in packs.',
    abilities: [],
    faction: null,
    resistances: {},
    statusEffects: []
  },

  // ─── TIER 2 ───────────────────────────────────────────────────────────────

  bandit: {
    id: 'bandit',
    name: 'Bandit Raider',
    spriteKey: 'enemy_bandit',
    health: 55, maxHealth: 55,
    mana: 0,
    attributes: { STR: 6, END: 5, AGI: 5, INT: 3, WIL: 4, PER: 5 },
    damage: [6, 12], armor: 5, speed: 1.0,
    xpReward: 45,
    gold: [8, 25],
    lootTable: [
      { itemId: 'iron_sword',          chance: 0.35 },
      { itemId: 'dagger',              chance: 0.20 },
      { itemId: 'leather_chest',       chance: 0.18 },
      { itemId: 'health_potion_minor', chance: 0.40 },
      { itemId: 'bread',               chance: 0.30 },
      { itemId: 'iron_arrow',          chance: 0.25, quantity: [5, 15] }
    ],
    skills: { blades: 20, archery: 15, block: 10 },
    biomes: ['ROAD', 'PLAINS', 'GRASSLAND', 'FOREST_EDGE'],
    level: 2,
    aggressive: true, aggroRange: 6, fleeHealth: 0.20,
    description: 'A desperate opportunist turned highwayman. Will surrender if badly wounded.',
    abilities: [
      {
        id: 'surrender',
        trigger: 'health_below_threshold',
        threshold: 0.20,
        effect: { type: 'surrender', dialogue: 'bandit_surrender' }
      }
    ],
    faction: null,
    resistances: {},
    statusEffects: []
  },

  cave_spider: {
    id: 'cave_spider',
    name: 'Cave Spider',
    spriteKey: 'enemy_cave_spider',
    health: 35, maxHealth: 35,
    mana: 0,
    attributes: { STR: 3, END: 4, AGI: 8, INT: 1, WIL: 2, PER: 6 },
    damage: [4, 9], armor: 1, speed: 1.3,
    xpReward: 30,
    gold: [0, 3],
    lootTable: [
      { itemId: 'shadowcap',           chance: 0.45 },
      { itemId: 'health_potion_minor', chance: 0.15 }
    ],
    skills: {},
    biomes: ['CAVE_FLOOR', 'CAVE_CEILING', 'DUNGEON'],
    level: 2,
    aggressive: true, aggroRange: 4, fleeHealth: 0.10,
    description: 'A pale, fist-sized spider whose fangs carry a numbing venom that slows its prey.',
    abilities: [
      {
        id: 'poison_bite',
        name: 'Venom Bite',
        trigger: 'on_attack',
        chance: 0.40,
        effect: { type: 'apply_status', status: 'poison', magnitude: 3, duration: 8 }
      },
      {
        id: 'web_shot',
        name: 'Web Tangle',
        trigger: 'cooldown',
        cooldown: 6,
        range: 3,
        effect: { type: 'apply_status', status: 'slowed', magnitude: 0.5, duration: 4 }
      }
    ],
    faction: null,
    resistances: { poison: 1.0 },
    statusEffects: []
  },

  swamp_crawler: {
    id: 'swamp_crawler',
    name: 'Swamp Crawler',
    spriteKey: 'enemy_swamp_crawler',
    health: 60, maxHealth: 60,
    mana: 0,
    attributes: { STR: 6, END: 6, AGI: 3, INT: 1, WIL: 3, PER: 3 },
    damage: [7, 13], armor: 4, speed: 0.75,
    xpReward: 38,
    gold: [0, 5],
    lootTable: [
      { itemId: 'rootmoss',            chance: 0.50 },
      { itemId: 'shadowcap',           chance: 0.30 },
      { itemId: 'health_potion_minor', chance: 0.10 }
    ],
    skills: {},
    biomes: ['SWAMP', 'BOG', 'WETLAND'],
    level: 3,
    aggressive: true, aggroRange: 4, fleeHealth: 0.05,
    description: 'A bloated amphibious predator that lurks beneath the bog surface. Its mucus-coated limbs slow anything they touch.',
    abilities: [
      {
        id: 'mire_grasp',
        name: 'Mire Grasp',
        trigger: 'on_attack',
        chance: 0.50,
        effect: { type: 'apply_status', status: 'slowed', magnitude: 0.45, duration: 5 }
      },
      {
        id: 'bog_sink',
        name: 'Bog Sink',
        trigger: 'cooldown',
        cooldown: 10,
        effect: { type: 'burrow', duration: 3, note: 'Becomes untargetable briefly before surfacing for a slam' }
      }
    ],
    faction: null,
    resistances: { poison: 0.50 },
    statusEffects: []
  },

  // ─── TIER 3 ───────────────────────────────────────────────────────────────

  skeleton: {
    id: 'skeleton',
    name: 'Risen Skeleton',
    spriteKey: 'enemy_skeleton',
    health: 45, maxHealth: 45,
    mana: 20,
    attributes: { STR: 5, END: 7, AGI: 3, INT: 1, WIL: 8, PER: 2 },
    damage: [6, 11], armor: 6, speed: 0.85,
    xpReward: 50,
    gold: [0, 10],
    lootTable: [
      { itemId: 'iron_sword',          chance: 0.20 },
      { itemId: 'iron_mace',           chance: 0.15 },
      { itemId: 'iron_chest',          chance: 0.08 },
      { itemId: 'iron_helm',           chance: 0.10 },
      { itemId: 'health_potion_minor', chance: 0.05 },
      { itemId: 'rootstone_fragment',  chance: 0.03 }
    ],
    skills: { blunt: 20, block: 15 },
    biomes: ['CAVE_FLOOR', 'DUNGEON', 'RUINS'],
    level: 3,
    aggressive: true, aggroRange: 5, fleeHealth: 0.0,
    description: 'Reanimated bones that clatter with residual Rootstone energy. Immune to fear and pain.',
    abilities: [
      {
        id: 'bone_rattle',
        name: 'Bone Rattle',
        trigger: 'cooldown',
        cooldown: 12,
        effect: { type: 'apply_status', status: 'frightened', magnitude: 1, duration: 3, aoe: 2 }
      }
    ],
    faction: null,
    resistances: { poison: 1.0, bleed: 1.0, fire: -0.25 },
    statusEffects: ['undead'],
    immunities: ['poison', 'bleed', 'sleep']
  },

  cult_zealot: {
    id: 'cult_zealot',
    name: 'Cult Zealot',
    spriteKey: 'enemy_cult_zealot',
    health: 65, maxHealth: 65,
    mana: 80,
    attributes: { STR: 4, END: 4, AGI: 5, INT: 7, WIL: 6, PER: 4 },
    damage: [5, 10], armor: 3, speed: 0.95,
    xpReward: 75,
    gold: [5, 18],
    lootTable: [
      { itemId: 'mana_potion',         chance: 0.35 },
      { itemId: 'health_potion_minor', chance: 0.25 },
      { itemId: 'staff_of_sparks',     chance: 0.08 },
      { itemId: 'shadowcap',           chance: 0.30 },
      { itemId: 'voidbloom',           chance: 0.12 }
    ],
    skills: { destruction: 35, restoration: 10 },
    biomes: ['CULT_SHRINE', 'DUNGEON', 'CAVE_FLOOR', 'RUINS'],
    level: 4,
    aggressive: true, aggroRange: 7, fleeHealth: 0.10,
    description: 'A fanatical follower of the Hollow Prophet who channels void-destruction magic in battle.',
    abilities: [
      {
        id: 'void_bolt',
        name: 'Void Bolt',
        trigger: 'range_attack',
        range: 6,
        cooldown: 3,
        manaCost: 20,
        effect: { type: 'magic_damage', element: 'void', magnitude: [12, 20] }
      },
      {
        id: 'zealot_frenzy',
        name: 'Void Frenzy',
        trigger: 'health_below_threshold',
        threshold: 0.40,
        effect: { type: 'buff', stat: 'damage', multiplier: 1.4, duration: 15 }
      }
    ],
    faction: 'underlurk_cult',
    resistances: { void: 0.25 },
    statusEffects: []
  },

  // ─── TIER 4 ───────────────────────────────────────────────────────────────

  wraith: {
    id: 'wraith',
    name: 'Thornfield Wraith',
    spriteKey: 'enemy_wraith',
    health: 70, maxHealth: 70,
    mana: 120,
    attributes: { STR: 2, END: 3, AGI: 9, INT: 8, WIL: 9, PER: 7 },
    damage: [8, 16], armor: 0, speed: 1.2,
    xpReward: 90,
    gold: [0, 0],
    lootTable: [
      { itemId: 'mana_potion',        chance: 0.30 },
      { itemId: 'rootstone_fragment', chance: 0.08 },
      { itemId: 'voidbloom',          chance: 0.15 }
    ],
    skills: { destruction: 40, restoration: 25 },
    biomes: ['DUNGEON', 'RUINS', 'GRAVEYARD'],
    level: 5,
    aggressive: true, aggroRange: 6, fleeHealth: 0.0,
    description: 'A spectral remnant of a mage slain during the Shattering. It drains mana from living targets.',
    abilities: [
      {
        id: 'mana_drain',
        name: 'Soul Siphon',
        trigger: 'on_attack',
        chance: 0.60,
        effect: { type: 'drain_mana', magnitude: [15, 30], restoreSelf: 0.50 }
      },
      {
        id: 'phase_shift',
        name: 'Phase Shift',
        trigger: 'health_below_threshold',
        threshold: 0.50,
        effect: { type: 'apply_status', status: 'incorporeal', duration: 4, note: 'Takes 75% less physical damage while incorporeal' }
      },
      {
        id: 'wail',
        name: 'Mournful Wail',
        trigger: 'cooldown',
        cooldown: 15,
        effect: { type: 'apply_status', status: 'mana_suppressed', magnitude: 0.50, duration: 6, aoe: 3 }
      }
    ],
    faction: null,
    resistances: { physical: 0.40, fire: -0.30, void: 0.60 },
    immunities: ['poison', 'bleed'],
    statusEffects: ['undead', 'incorporeal']
  },

  stone_golem: {
    id: 'stone_golem',
    name: 'Stone Golem',
    spriteKey: 'enemy_stone_golem',
    health: 180, maxHealth: 180,
    mana: 0,
    attributes: { STR: 14, END: 16, AGI: 1, INT: 1, WIL: 10, PER: 2 },
    damage: [14, 24], armor: 20, speed: 0.55,
    xpReward: 150,
    gold: [0, 0],
    lootTable: [
      { itemId: 'iron_ore',           chance: 0.70, quantity: [2, 5] },
      { itemId: 'rootstone_fragment', chance: 0.20 },
      { itemId: 'iron_ingot',         chance: 0.40, quantity: [1, 3] }
    ],
    skills: { blunt: 30 },
    biomes: ['MOUNTAIN', 'CAVE_FLOOR', 'RUINS', 'QUARRY'],
    level: 6,
    aggressive: false, aggroRange: 3, fleeHealth: 0.0,
    description: 'An ancient construct of animated stone, possibly left by the Arcanate. Slow but nearly unstoppable.',
    abilities: [
      {
        id: 'ground_slam',
        name: 'Ground Slam',
        trigger: 'cooldown',
        cooldown: 8,
        effect: { type: 'aoe_damage', element: 'physical', magnitude: [20, 35], radius: 2, status: { type: 'knockback', magnitude: 3 } }
      },
      {
        id: 'stone_skin',
        name: 'Stone Skin',
        trigger: 'passive',
        effect: { type: 'damage_reduction', element: 'physical', flat: 8 }
      },
      {
        id: 'rubble_throw',
        name: 'Rubble Toss',
        trigger: 'range_attack',
        range: 4,
        cooldown: 5,
        effect: { type: 'physical_damage', magnitude: [10, 18], status: { type: 'stunned', duration: 2 }, chance: 0.30 }
      }
    ],
    faction: null,
    resistances: { physical: 0.30, fire: 0.20, poison: 1.0, void: 0.10 },
    immunities: ['poison', 'bleed', 'sleep', 'frightened'],
    statusEffects: ['construct']
  },

  // ─── TIER 5 ───────────────────────────────────────────────────────────────

  lava_salamander: {
    id: 'lava_salamander',
    name: 'Lava Salamander',
    spriteKey: 'enemy_lava_salamander',
    health: 95, maxHealth: 95,
    mana: 0,
    attributes: { STR: 8, END: 9, AGI: 6, INT: 2, WIL: 5, PER: 4 },
    damage: [10, 18], armor: 8, speed: 1.05,
    xpReward: 110,
    gold: [0, 0],
    lootTable: [
      { itemId: 'emberpetal',          chance: 0.60 },
      { itemId: 'iron_ingot',          chance: 0.25, quantity: [1, 2] },
      { itemId: 'health_potion_minor', chance: 0.10 }
    ],
    skills: {},
    biomes: ['VOLCANIC', 'LAVA_FIELD', 'EMBERPEAK_CALDERA'],
    level: 5,
    aggressive: true, aggroRange: 5, fleeHealth: 0.10,
    description: 'A reptilian predator native to volcanic terrain. Its scales radiate intense heat and its breath ignites the air.',
    abilities: [
      {
        id: 'fire_breath',
        name: 'Magma Breath',
        trigger: 'cooldown',
        cooldown: 7,
        range: 3,
        effect: { type: 'cone_damage', element: 'fire', magnitude: [18, 30], status: { type: 'burning', magnitude: 5, duration: 6 } }
      },
      {
        id: 'heat_aura',
        name: 'Heat Aura',
        trigger: 'passive',
        effect: { type: 'aura_damage', element: 'fire', magnitude: 3, radius: 1.5, tickRate: 2 }
      }
    ],
    faction: null,
    resistances: { fire: 1.0, cold: -0.50 },
    immunities: ['fire', 'burning'],
    statusEffects: []
  },

  kultist_acolyte: {
    id: 'kultist_acolyte',
    name: 'Kultist Acolyte',
    spriteKey: 'enemy_kultist_acolyte',
    health: 85, maxHealth: 85,
    mana: 140,
    attributes: { STR: 3, END: 4, AGI: 5, INT: 9, WIL: 8, PER: 5 },
    damage: [7, 13], armor: 2, speed: 0.90,
    xpReward: 120,
    gold: [10, 30],
    lootTable: [
      { itemId: 'mana_potion',         chance: 0.45 },
      { itemId: 'health_potion_minor', chance: 0.20 },
      { itemId: 'voidbloom',           chance: 0.35 },
      { itemId: 'shadowcap',           chance: 0.30 },
      { itemId: 'staff_of_sparks',     chance: 0.06 }
    ],
    skills: { destruction: 50, restoration: 40 },
    biomes: ['UNDERLURK_CHASM', 'CULT_SHRINE', 'VOID_CHAMBER'],
    level: 6,
    aggressive: true, aggroRange: 7, fleeHealth: 0.05,
    description: 'A senior cultist who has partially merged with the void-entity. Capable of healing itself and allies, and unleashing dark void bursts.',
    abilities: [
      {
        id: 'void_heal',
        name: 'Void Mending',
        trigger: 'health_below_threshold',
        threshold: 0.50,
        cooldown: 20,
        manaCost: 40,
        effect: { type: 'self_heal', magnitude: [30, 50] }
      },
      {
        id: 'void_burst',
        name: 'Void Burst',
        trigger: 'range_attack',
        range: 6,
        cooldown: 4,
        manaCost: 30,
        effect: { type: 'magic_damage', element: 'void', magnitude: [16, 26] }
      },
      {
        id: 'shadow_shroud',
        name: 'Shadow Shroud',
        trigger: 'cooldown',
        cooldown: 18,
        manaCost: 50,
        effect: { type: 'buff', stat: 'magic_defense', multiplier: 1.60, duration: 8 }
      },
      {
        id: 'heal_ally',
        name: 'Ally Mending',
        trigger: 'ally_health_below',
        threshold: 0.40,
        cooldown: 15,
        manaCost: 35,
        effect: { type: 'ally_heal', magnitude: [20, 35], range: 5 }
      }
    ],
    faction: 'underlurk_cult',
    resistances: { void: 0.50, physical: 0.10 },
    statusEffects: []
  },

  // ─── TIER 6 (HIGH) ────────────────────────────────────────────────────────

  void_hound: {
    id: 'void_hound',
    name: 'Void Hound',
    spriteKey: 'enemy_void_hound',
    health: 90, maxHealth: 90,
    mana: 30,
    attributes: { STR: 9, END: 6, AGI: 13, INT: 3, WIL: 6, PER: 10 },
    damage: [12, 20], armor: 3, speed: 1.55,
    xpReward: 140,
    gold: [0, 0],
    lootTable: [
      { itemId: 'voidbloom',           chance: 0.40 },
      { itemId: 'health_potion_minor', chance: 0.08 }
    ],
    skills: {},
    biomes: ['UNDERLURK_CHASM', 'VOID_FIELD', 'DEEP_CAVE'],
    level: 7,
    aggressive: true, aggroRange: 9, fleeHealth: 0.0,
    description: 'A void-touched predator from the Underlurk depths. Moves with terrifying speed and shrugs off most physical blows.',
    abilities: [
      {
        id: 'void_dash',
        name: 'Void Dash',
        trigger: 'cooldown',
        cooldown: 5,
        effect: { type: 'blink_attack', magnitude: [14, 22], note: 'Teleports to target, bypasses obstacles' }
      },
      {
        id: 'void_howl',
        name: 'Void Howl',
        trigger: 'cooldown',
        cooldown: 20,
        effect: { type: 'apply_status', status: 'mana_suppressed', magnitude: 0.30, duration: 8, aoe: 4 }
      },
      {
        id: 'phase_strike',
        name: 'Phase Strike',
        trigger: 'on_attack',
        chance: 0.25,
        effect: { type: 'armor_bypass', note: 'This attack ignores armor entirely' }
      }
    ],
    faction: null,
    resistances: { physical: 0.35, void: 0.50 },
    immunities: ['poison', 'fear'],
    statusEffects: ['void_touched']
  },

  // ─── BOSS ─────────────────────────────────────────────────────────────────

  hollow_prophet_boss: {
    id: 'hollow_prophet_boss',
    name: 'The Hollow Prophet',
    spriteKey: 'enemy_hollow_prophet_boss',
    health: 140, maxHealth: 140,
    mana: 400,
    attributes: { STR: 10, END: 12, AGI: 8, INT: 18, WIL: 20, PER: 12 },
    damage: [7, 12], armor: 8, speed: 1.0,
    xpReward: 1500,
    gold: [50, 100],
    lootTable: [
      { itemId: 'sundering_rite',      chance: 1.00 },
      { itemId: 'rootstone_blade',     chance: 0.30 },
      { itemId: 'voidbloom',           chance: 1.00, quantity: [3, 5] },
      { itemId: 'mana_potion',         chance: 1.00, quantity: [2, 4] }
    ],
    skills: { destruction: 90, restoration: 70, illusion: 60 },
    biomes: ['UNDERLURK_CHASM', 'VOID_SANCTUM'],
    level: 15,
    isMiniboss: true,
    isBoss: true,
    aggressive: true, aggroRange: 20, fleeHealth: 0.0,
    description: 'The true leader of the Underlurk Cult, revealed to be Oren Osel — the disgraced Auric Concordat official. He has been half-consumed by the void-entity and wields its power without limit.',
    portrait: 'portrait_hollow_prophet',
    bossPhases: [
      {
        phase: 1,
        healthThreshold: 1.0,
        label: 'The Prophet Speaks',
        note: 'Uses ranged void magic and summons void hounds.'
      },
      {
        phase: 2,
        healthThreshold: 0.60,
        label: 'The Void Opens',
        note: 'Gains Phase Shift and begins channeling Sundering Pulse. Void anchors become active.'
      },
      {
        phase: 3,
        healthThreshold: 0.25,
        label: 'The Convergence Begins',
        note: 'Casts Convergence Wave continuously. Must be interrupted. Becomes fully incorporeal briefly.'
      }
    ],
    abilities: [
      {
        id: 'void_lance',
        name: 'Void Lance',
        trigger: 'range_attack',
        range: 10,
        cooldown: 2,
        manaCost: 25,
        effect: { type: 'magic_damage', element: 'void', magnitude: [30, 50] }
      },
      {
        id: 'summon_void_hounds',
        name: 'Call From the Deep',
        trigger: 'cooldown',
        cooldown: 25,
        manaCost: 80,
        effect: { type: 'summon', enemyId: 'void_hound', count: [2, 3], radius: 4 }
      },
      {
        id: 'sundering_pulse',
        name: 'Sundering Pulse',
        trigger: 'phase_change',
        phase: 2,
        cooldown: 18,
        manaCost: 100,
        effect: { type: 'aoe_damage', element: 'void', magnitude: [40, 60], radius: 6, status: { type: 'mana_drain', magnitude: 50 } }
      },
      {
        id: 'prophet_phase_shift',
        name: 'Void Mantle',
        trigger: 'health_below_threshold',
        threshold: 0.60,
        effect: { type: 'apply_status', status: 'incorporeal', duration: 5, message: 'The Prophet dissolves into shadow!' }
      },
      {
        id: 'convergence_wave',
        name: 'The Convergence',
        trigger: 'phase_change',
        phase: 3,
        cooldown: 12,
        manaCost: 120,
        interruptible: true,
        channelTime: 4,
        effect: { type: 'aoe_damage', element: 'void', magnitude: [80, 120], radius: 20, note: 'If uninterrupted, kills all targets below 30% health' }
      },
      {
        id: 'void_regeneration',
        name: 'Void Regeneration',
        trigger: 'passive',
        effect: { type: 'regen', magnitude: 8, tickRate: 3, note: 'Only active while a Void Anchor stands' }
      },
      {
        id: 'prophet_reveal',
        name: 'Revelation',
        trigger: 'phase_change',
        phase: 2,
        effect: { type: 'cutscene', cutsceneId: 'prophet_reveal_oren', note: 'Identity of Oren Osel revealed' }
      }
    ],
    faction: 'underlurk_cult',
    resistances: { physical: 0.40, fire: 0.20, void: 0.80 },
    immunities: ['poison', 'bleed', 'sleep', 'frightened', 'stunned'],
    statusEffects: ['void_merged']
  },

  void_anchor_thornpillar: {
    id: 'void_anchor_thornpillar', name: 'Thornpillar Void Anchor',
    spriteKey: 'story_anchor_thorn', health: 80, maxHealth: 80, mana: 0,
    attributes: { STR: 8, END: 12, AGI: 1, INT: 4, WIL: 10, PER: 2 },
    damage: [5, 9], armor: 8, speed: 0, xpReward: 180, gold: [0, 0],
    lootTable: [{ itemId: 'rootstone_fragment', chance: 0.5 }],
    skills: {}, biomes: ['ROOTSTONE'], level: 6, aggressive: false, aggroRange: 1,
    fleeHealth: 0, description: 'A cult siphon driven through the roots beneath the Thornpillar.',
    abilities: [], faction: 'underlurk_cult', resistances: { void: 0.7 }, statusEffects: ['construct']
  },

  void_anchor_aetherwood: {
    id: 'void_anchor_aetherwood', name: 'Aetherwood Void Anchor',
    spriteKey: 'story_anchor_aetherwood', health: 90, maxHealth: 90, mana: 0,
    attributes: { STR: 9, END: 12, AGI: 1, INT: 4, WIL: 10, PER: 2 },
    damage: [6, 10], armor: 9, speed: 0, xpReward: 200, gold: [0, 0],
    lootTable: [{ itemId: 'voidbloom', chance: 1 }],
    skills: {}, biomes: ['DARK_FOREST'], level: 7, aggressive: false, aggroRange: 1,
    fleeHealth: 0, description: 'A pulsing anchor strangling the Aetherwood root-nexus.',
    abilities: [], faction: 'underlurk_cult', resistances: { void: 0.7 }, statusEffects: ['construct']
  },

  void_anchor_emberpeak: {
    id: 'void_anchor_emberpeak', name: 'Emberpeak Void Anchor',
    spriteKey: 'story_anchor_emberpeak', health: 100, maxHealth: 100, mana: 0,
    attributes: { STR: 10, END: 13, AGI: 1, INT: 4, WIL: 11, PER: 2 },
    damage: [7, 11], armor: 10, speed: 0, xpReward: 220, gold: [0, 0],
    lootTable: [{ itemId: 'emberpetal', chance: 1, quantity: [1, 2] }],
    skills: {}, biomes: ['VOLCANIC'], level: 8, aggressive: false, aggroRange: 1,
    fleeHealth: 0, description: 'A heat-scarred siphon buried beneath Emberpeak Caldera.',
    abilities: [], faction: 'underlurk_cult', resistances: { void: 0.7, fire: 1 }, statusEffects: ['construct']
  },

  corrupted_woven: {
    id: 'corrupted_woven', name: 'Corrupted Woven',
    spriteKey: 'enemy_wraith', health: 58, maxHealth: 58, mana: 40,
    attributes: { STR: 5, END: 6, AGI: 7, INT: 5, WIL: 7, PER: 6 },
    damage: [7, 12], armor: 4, speed: 1.05, xpReward: 75, gold: [0, 0],
    lootTable: [{ itemId: 'rootmoss', chance: 0.75 }],
    skills: {}, biomes: ['DARK_FOREST'], level: 4, aggressive: true, aggroRange: 5,
    fleeHealth: 0, description: 'A tree-spirit warped by void residue.',
    abilities: [], faction: null, resistances: { void: 0.3 }, statusEffects: []
  },

  compact_deserter_hunter: {
    id: 'compact_deserter_hunter', name: 'Compact Deserter-Hunter',
    spriteKey: 'enemy_bandit', health: 62, maxHealth: 62, mana: 0,
    attributes: { STR: 7, END: 6, AGI: 6, INT: 4, WIL: 6, PER: 7 },
    damage: [7, 13], armor: 7, speed: 1, xpReward: 70, gold: [10, 18],
    lootTable: [{ itemId: 'health_potion_minor', chance: 0.4 }],
    skills: { blades: 25 }, biomes: ['GRASSLAND'], level: 4, aggressive: true, aggroRange: 5,
    fleeHealth: 0.1, description: 'An Iron Compact tracker sent to silence Gerran Solt.',
    abilities: [], faction: 'iron_compact', resistances: {}, statusEffects: []
  }
};

// ─── HELPER FUNCTIONS ──────────────────────────────────────────────────────

/**
 * Returns all enemy definitions that list the given biome tag.
 * @param {string} biome - e.g. 'FOREST', 'CAVE_FLOOR', 'UNDERLURK_CHASM'
 * @returns {object[]}
 */
export function getEnemiesByBiome(biome) {
  return Object.values(ENEMIES).filter(e => e.biomes.includes(biome));
}

/**
 * Returns a single enemy definition by id, or null if not found.
 * @param {string} id
 * @returns {object|null}
 */
export function getEnemy(id) {
  return ENEMIES[id] || null;
}

/**
 * Returns all enemies at or below the given level, sorted ascending.
 * @param {number} maxLevel
 * @returns {object[]}
 */
export function getEnemiesByMaxLevel(maxLevel) {
  return Object.values(ENEMIES)
    .filter(e => e.level <= maxLevel)
    .sort((a, b) => a.level - b.level);
}
