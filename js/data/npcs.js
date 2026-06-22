// NPC definitions for Aethermoor — pure data, no class logic
// Includes schedule, dialogue roots, merchant flags, quest links, and disposition.

export const NPCS = {

  // ─── QUEST-CRITICAL / ESSENTIAL ──────────────────────────────────────────

  cael: {
    id: 'cael',
    name: 'Warden Cael',
    title: 'Rootwarden Scholar',
    race: 'varesh',
    faction: 'rootwarden_circle',
    spriteKey: 'npc_scholar',
    spawnTile: { x: 103, y: 101 },
    schedule: [
      { hour: 6,  tile: { x: 103, y: 101 } },  // monitoring station — early morning
      { hour: 12, tile: { x: 104, y: 101 } },  // walks south to inspect relay crystal
      { hour: 17, tile: { x: 103, y: 102 } },  // notes on a bench outside
      { hour: 20, tile: { x: 100, y: 105 } }   // Greyhollow inn — resting
    ],
    dialogueRoot: 'cael_intro',
    dialogueActiveQuest: 'cael_quest_active',
    isEssential: true,                          // essential until Act 2 assassination
    essentialUntilFlag: 'act2_cael_assassination',
    merchant: false,
    description: 'A young but brilliant Rootwarden scholar assigned to monitor the Thornpillar. He carries the weight of a discovery no one wants to hear.',
    portrait: 'portrait_cael',
    questGiver: ['main_act1'],
    killsQuestId: 'main_act1',                 // killing him before quest completion flags failure
    postDeathItem: 'cael_notes',               // item placed in world on death
    postDeathTile: { x: 103, y: 101 },
    voiceType: 'male_scholarly',
    level: 4,
    disposition: { default: 50 },
    attributes: { STR: 3, END: 3, AGI: 4, INT: 10, WIL: 6, PER: 7 }
  },

  elder_sathis: {
    id: 'elder_sathis',
    name: 'Elder Sathis',
    title: 'Rootwarden High Elder',
    race: 'thornkin',
    faction: 'rootwarden_circle',
    spriteKey: 'npc_rootwarden_elder',
    spawnTile: { x: 210, y: 88 },              // Rootwarden Sanctuary, Aetherwood
    schedule: [
      { hour: 5,  tile: { x: 210, y: 86 } },  // dawn prayer at the Sanctuary root altar
      { hour: 9,  tile: { x: 210, y: 88 } },  // main chamber
      { hour: 14, tile: { x: 212, y: 90 } },  // elder's study
      { hour: 21, tile: { x: 210, y: 92 } }   // rest chamber
    ],
    dialogueRoot: 'elder_sathis_first_meet',
    dialogueOngoing: 'elder_sathis_ongoing',
    isEssential: true,
    essentialUntilFlag: 'act5_sathis_choice_resolved',
    merchant: false,
    description: 'The oldest living Thornkin and head of the Rootwarden Circle. He alone knows the full extent of the Dimming — and what it will cost to reverse it.',
    portrait: 'portrait_sathis',
    questGiver: ['main_act2', 'main_act3'],
    killsQuestId: null,
    voiceType: 'elder_deep',
    level: 18,
    disposition: { default: 30, rootwarden_circle: 70 },
    attributes: { STR: 4, END: 8, AGI: 3, INT: 16, WIL: 18, PER: 12 }
  },

  varenne_osel: {
    id: 'varenne_osel',
    name: 'Varenne Osel',
    title: 'High Consul of the Auric Concordat',
    race: 'varesh',
    faction: 'auric_concordat',
    spriteKey: 'npc_high_consul',
    spawnTile: { x: 350, y: 60 },              // Concordat Hall, Thornmere
    schedule: [
      { hour: 8,  tile: { x: 350, y: 60 } },  // audience chamber
      { hour: 13, tile: { x: 352, y: 58 } },  // private office
      { hour: 19, tile: { x: 354, y: 65 } },  // Thornmere upper terrace
      { hour: 22, tile: { x: 350, y: 70 } }   // private quarters
    ],
    dialogueRoot: 'varenne_osel_intro',
    isEssential: false,
    merchant: false,
    description: 'The imperious High Consul who governs trade law across the six Shards. She does not panic, she maneuvers. The Dimming is, to her, a political opportunity.',
    portrait: 'portrait_varenne',
    questGiver: [],
    allianceQuest: 'main_act2',
    allianceFaction: 'auric_concordat',
    killsQuestId: null,
    voiceType: 'female_aristocratic',
    level: 12,
    disposition: { default: 10, auric_concordat: 60, rootwarden_circle: -30, iron_compact: 15 },
    attributes: { STR: 3, END: 4, AGI: 5, INT: 14, WIL: 12, PER: 15 }
  },

  warmaster_kash: {
    id: 'warmaster_kash',
    name: 'Dreya Kash',
    title: 'Warmaster of the Iron Compact',
    race: 'cindrak',
    faction: 'iron_compact',
    spriteKey: 'npc_warmaster',
    spawnTile: { x: 280, y: 140 },             // Iron Compact HQ, south of Thornmere
    schedule: [
      { hour: 5,  tile: { x: 280, y: 138 } }, // sparring yard at dawn
      { hour: 9,  tile: { x: 280, y: 140 } }, // command post
      { hour: 15, tile: { x: 278, y: 142 } }, // reviewing troop assignments
      { hour: 20, tile: { x: 282, y: 140 } }  // mess hall
    ],
    dialogueRoot: 'warmaster_kash_intro',
    isEssential: false,
    merchant: false,
    description: 'A scarred Cindrak veteran who built the Iron Compact from sixty mercenaries into a continent-spanning force. She respects strength and despises politics — but is learning to play the game.',
    portrait: 'portrait_kash',
    questGiver: [],
    allianceQuest: 'main_act2',
    allianceFaction: 'iron_compact',
    killsQuestId: null,
    voiceType: 'female_gruff',
    level: 15,
    disposition: { default: 20, iron_compact: 70, auric_concordat: 10, rootwarden_circle: -15 },
    attributes: { STR: 14, END: 13, AGI: 6, INT: 8, WIL: 10, PER: 9 }
  },

  abbess_vonn: {
    id: 'abbess_vonn',
    name: 'Mirela Vonn',
    title: 'Abbess of the Grey Penitents',
    race: 'varesh',
    faction: 'grey_penitents',
    spriteKey: 'npc_abbess',
    spawnTile: { x: 160, y: 55 },              // Grey Penitents Monastery, north of Greyhollow
    schedule: [
      { hour: 4,  tile: { x: 160, y: 52 } },  // bell tower prayers
      { hour: 7,  tile: { x: 160, y: 55 } },  // abbot's hall
      { hour: 12, tile: { x: 162, y: 57 } },  // scriptorium
      { hour: 18, tile: { x: 160, y: 55 } },  // evening service
      { hour: 21, tile: { x: 160, y: 60 } }   // private quarters
    ],
    dialogueRoot: 'abbess_vonn_intro',
    isEssential: false,
    merchant: false,
    description: 'A severe but quietly compassionate woman who leads the Grey Penitents. She knows more about the Rootstones — and the Arcanate\'s original sin — than she admits.',
    portrait: 'portrait_abbess_vonn',
    questGiver: [],
    allianceQuest: 'main_act2',
    allianceFaction: 'grey_penitents',
    killsQuestId: null,
    voiceType: 'female_measured',
    level: 10,
    disposition: { default: 30, grey_penitents: 70, rootwarden_circle: 40, underlurk_cult: -80 },
    attributes: { STR: 3, END: 5, AGI: 4, INT: 13, WIL: 16, PER: 11 }
  },

  // ─── GREYHOLLOW LOCALS ───────────────────────────────────────────────────

  greyhollow_blacksmith: {
    id: 'greyhollow_blacksmith',
    name: 'Vreth Ironloom',
    title: 'Blacksmith',
    race: 'cindrak',
    faction: null,
    spriteKey: 'npc_blacksmith',
    spawnTile: { x: 98, y: 106 },              // smithy, southern Greyhollow
    schedule: [
      { hour: 6,  tile: { x: 98, y: 106 } },  // at the forge
      { hour: 12, tile: { x: 99, y: 107 } },  // lunch outside forge
      { hour: 13, tile: { x: 98, y: 106 } },  // back to forge
      { hour: 19, tile: { x: 97, y: 108 } },  // home
      { hour: 21, tile: { x: 97, y: 109 } }   // sleeping
    ],
    dialogueRoot: 'greyhollow_blacksmith',
    isEssential: false,
    merchant: true,
    merchantType: 'blacksmith',
    merchantInventory: [
      { itemId: 'iron_sword',    stock: 3,  restockDays: 3 },
      { itemId: 'dagger',        stock: 4,  restockDays: 2 },
      { itemId: 'iron_mace',     stock: 2,  restockDays: 4 },
      { itemId: 'iron_chest',    stock: 2,  restockDays: 5 },
      { itemId: 'iron_helm',     stock: 2,  restockDays: 5 },
      { itemId: 'leather_chest', stock: 4,  restockDays: 3 },
      { itemId: 'iron_ingot',    stock: 10, restockDays: 1 },
      { itemId: 'iron_ore',      stock: 15, restockDays: 1 },
      { itemId: 'leather_strips',stock: 20, restockDays: 1 }
    ],
    buybackRate: 0.50,
    craftingStation: 'forge',
    description: 'A compact Cindrak smith whose family has run the Greyhollow forge for three generations. She says little but her work speaks volumes.',
    portrait: 'portrait_blacksmith',
    questGiver: [],
    killsQuestId: null,
    voiceType: 'female_gruff',
    level: 5,
    disposition: { default: 40 },
    attributes: { STR: 11, END: 10, AGI: 4, INT: 5, WIL: 6, PER: 5 }
  },

  greyhollow_innkeeper: {
    id: 'greyhollow_innkeeper',
    name: 'Tomas Frell',
    title: 'Innkeeper',
    race: 'varesh',
    faction: null,
    spriteKey: 'npc_innkeeper',
    spawnTile: { x: 100, y: 105 },             // The Hollow Hearth Inn
    schedule: [
      { hour: 6,  tile: { x: 100, y: 104 } }, // wiping down bar
      { hour: 9,  tile: { x: 100, y: 105 } }, // behind bar
      { hour: 14, tile: { x: 101, y: 105 } }, // restocking shelves
      { hour: 18, tile: { x: 100, y: 105 } }, // evening rush
      { hour: 23, tile: { x: 100, y: 108 } }  // sleeping quarters above inn
    ],
    dialogueRoot: 'greyhollow_innkeeper',
    isEssential: false,
    merchant: true,
    merchantType: 'innkeeper',
    merchantInventory: [
      { itemId: 'bread',               stock: 20, restockDays: 1 },
      { itemId: 'health_potion_minor', stock: 6,  restockDays: 2 },
      { itemId: 'stamina_potion',      stock: 4,  restockDays: 2 },
      { itemId: 'torch',               stock: 8,  restockDays: 2 }
    ],
    services: [
      { type: 'rent_room', cost: 10, effect: { type: 'rest', hours: 8, heals: true } },
      { type: 'buy_rumor', cost: 5,  effect: { type: 'reveal_rumor', pool: 'greyhollow_rumors' } }
    ],
    buybackRate: 0.40,
    description: 'A stout, good-natured man who runs the Hollow Hearth with warmth and a notable talent for gossip. He knows everything that passes through Greyhollow.',
    portrait: 'portrait_innkeeper',
    questGiver: [],
    killsQuestId: null,
    voiceType: 'male_jovial',
    level: 2,
    disposition: { default: 65 },
    attributes: { STR: 4, END: 5, AGI: 4, INT: 7, WIL: 5, PER: 10 }
  },

  greyhollow_guard_captain: {
    id: 'greyhollow_guard_captain',
    name: 'Captain Ressa Dayne',
    title: 'Guard Captain',
    race: 'varesh',
    faction: 'iron_compact',
    spriteKey: 'npc_guard_captain',
    spawnTile: { x: 96, y: 100 },              // gate post, north entrance
    schedule: [
      { hour: 6,  tile: { x: 96, y: 100 } },  // gate inspection
      { hour: 10, tile: { x: 97, y: 101 } },  // patrol route
      { hour: 14, tile: { x: 96, y: 100 } },  // gate again
      { hour: 18, tile: { x: 95, y: 102 } },  // guard house
      { hour: 22, tile: { x: 95, y: 103 } }   // sleeping — relief guard on gate
    ],
    dialogueRoot: 'greyhollow_guard_captain',
    isEssential: false,
    merchant: false,
    description: 'A sharp-eyed former Iron Compact soldier assigned to keep Greyhollow safe. She is professional, tired, and quietly worried about the Thornpillar.',
    portrait: 'portrait_guard_captain',
    questGiver: [],
    killsQuestId: null,
    voiceType: 'female_military',
    level: 6,
    disposition: { default: 35, iron_compact: 60 },
    attributes: { STR: 8, END: 7, AGI: 6, INT: 6, WIL: 7, PER: 8 }
  },

  greyhollow_farmer: {
    id: 'greyhollow_farmer',
    name: 'Pell Ord',
    title: 'Farmer',
    race: 'varesh',
    faction: null,
    spriteKey: 'npc_farmer',
    spawnTile: { x: 94, y: 108 },              // farm plot, west of Greyhollow
    schedule: [
      { hour: 5,  tile: { x: 94, y: 108 } },  // early field work
      { hour: 11, tile: { x: 95, y: 109 } },  // water well
      { hour: 13, tile: { x: 94, y: 110 } },  // farmhouse lunch
      { hour: 14, tile: { x: 94, y: 108 } },  // afternoon field work
      { hour: 19, tile: { x: 94, y: 110 } }   // farmhouse — done for day
    ],
    dialogueRoot: 'greyhollow_farmer',
    isEssential: false,
    merchant: false,
    description: 'A weathered farmer who has worked the rocky soil around Greyhollow his whole life. He is anxious about the sky looking different lately.',
    portrait: 'portrait_farmer',
    questGiver: [],
    killsQuestId: null,
    voiceType: 'male_rural',
    level: 1,
    disposition: { default: 55 },
    attributes: { STR: 6, END: 7, AGI: 4, INT: 4, WIL: 5, PER: 5 }
  },

  // ─── THORNMERE / FACTION CITIES ──────────────────────────────────────────

  thornmere_alchemist: {
    id: 'thornmere_alchemist',
    name: 'Syllis Vaar',
    title: 'Master Alchemist',
    race: 'sylveni',
    faction: null,
    spriteKey: 'npc_alchemist',
    spawnTile: { x: 340, y: 75 },              // Vaar's Alchemy, Thornmere market
    schedule: [
      { hour: 7,  tile: { x: 340, y: 75 } },  // shop opening
      { hour: 12, tile: { x: 341, y: 76 } },  // back room brewing
      { hour: 15, tile: { x: 340, y: 75 } },  // shop floor
      { hour: 19, tile: { x: 340, y: 78 } },  // living quarters above shop
      { hour: 22, tile: { x: 340, y: 79 } }   // sleeping
    ],
    dialogueRoot: 'thornmere_alchemist',
    isEssential: false,
    merchant: true,
    merchantType: 'alchemist',
    merchantInventory: [
      { itemId: 'health_potion',       stock: 8,  restockDays: 2 },
      { itemId: 'health_potion_minor', stock: 12, restockDays: 1 },
      { itemId: 'mana_potion',         stock: 6,  restockDays: 2 },
      { itemId: 'stamina_potion',      stock: 6,  restockDays: 2 },
      { itemId: 'antidote',            stock: 10, restockDays: 2 },
      { itemId: 'rootmoss',            stock: 15, restockDays: 2 },
      { itemId: 'emberpetal',          stock: 10, restockDays: 3 },
      { itemId: 'shadowcap',           stock: 8,  restockDays: 3 }
    ],
    buybackRate: 0.55,
    craftingStation: 'alembic',
    description: 'An elderly Sylveni alchemist whose hands shake from years of experimental exposure. She keeps working because her research is the only thing keeping her alive — literally.',
    portrait: 'portrait_syllis_vaar',
    questGiver: ['side_alchemist_garden'],
    killsQuestId: null,
    voiceType: 'female_aged_scholarly',
    level: 8,
    disposition: { default: 45 },
    attributes: { STR: 2, END: 3, AGI: 5, INT: 15, WIL: 9, PER: 8 }
  },

  concordat_merchant: {
    id: 'concordat_merchant',
    name: 'Beren Ashvale',
    title: 'Traveling Factor',
    race: 'varesh',
    faction: 'auric_concordat',
    spriteKey: 'npc_merchant_travel',
    spawnTile: { x: 150, y: 102 },             // road between Greyhollow and Thornmere
    schedule: [
      { hour: 8,  tile: { x: 150, y: 102 } }, // roadside camp
      { hour: 10, tile: { x: 140, y: 102 } }, // traveling toward Greyhollow
      { hour: 14, tile: { x: 100, y: 102 } }, // Greyhollow market plaza
      { hour: 17, tile: { x: 120, y: 102 } }, // heading back
      { hour: 20, tile: { x: 150, y: 102 } }  // roadside camp again
    ],
    dialogueRoot: 'concordat_merchant',
    isEssential: false,
    merchant: true,
    merchantType: 'general',
    merchantInventory: [
      { itemId: 'torch',               stock: 10, restockDays: 3 },
      { itemId: 'bread',               stock: 15, restockDays: 2 },
      { itemId: 'health_potion_minor', stock: 5,  restockDays: 3 },
      { itemId: 'iron_arrow',          stock: 50, restockDays: 3 },
      { itemId: 'leather_strips',      stock: 10, restockDays: 3 },
      { itemId: 'wooden_bow',          stock: 1,  restockDays: 7 }
    ],
    buybackRate: 0.45,
    description: 'A cheerful, perpetually-traveling Concordat Factor who covers the Greyhollow to Thornmere road. Gossips freely, sells cheaply, vanishes quickly.',
    portrait: 'portrait_beren',
    questGiver: ['side_merchant_debt'],
    killsQuestId: null,
    voiceType: 'male_jovial',
    level: 3,
    disposition: { default: 60, auric_concordat: 70 },
    attributes: { STR: 4, END: 4, AGI: 6, INT: 8, WIL: 5, PER: 12 }
  },

  // ─── SPECIAL / HIDDEN ─────────────────────────────────────────────────────

  vorrkai_refugee_elder: {
    id: 'vorrkai_refugee_elder',
    name: 'Zeth Mirrak',
    title: 'Settlement Elder',
    race: 'vorrkai',
    faction: null,
    spriteKey: 'npc_vorrkai_elder',
    spawnTile: { x: 420, y: 200 },             // hidden Vorrkai settlement, Underlurk cavern
    schedule: [
      { hour: 0,  tile: { x: 420, y: 200 } }, // always here (underground, no day cycle)
      { hour: 12, tile: { x: 421, y: 201 } }  // walks to settlement map marker
    ],
    dialogueRoot: 'vorrkai_refugee_elder',
    isEssential: false,
    unlockFlag: 'found_vorrkai_settlement',     // only accessible after this flag
    merchant: false,
    description: 'The eldest survivor of a Vorrkai community that has lived in the Underlurk depths for generations. She knows the Hollow Prophet\'s true name.',
    portrait: 'portrait_zeth_mirrak',
    questGiver: [],
    specialInfo: 'act3_underlurk_passage',      // unlocks key Act 3 information
    killsQuestId: null,
    voiceType: 'female_deep_raspy',
    level: 10,
    disposition: { default: 0, vorrkai: 30 },   // Vorrkai player gets better initial disposition
    attributes: { STR: 2, END: 4, AGI: 4, INT: 14, WIL: 12, PER: 8 }
  },

  wandering_sylveni_druid: {
    id: 'wandering_sylveni_druid',
    name: 'Aelindra',
    title: 'Druid of the Woven',
    race: 'sylveni',
    faction: 'rootwarden_circle',
    spriteKey: 'npc_sylveni_druid',
    spawnTile: { x: 195, y: 70 },              // Aetherwood clearing near tree line
    schedule: [
      { hour: 5,  tile: { x: 195, y: 68 } },  // dawn communing with trees
      { hour: 10, tile: { x: 195, y: 70 } },  // clearing — available
      { hour: 16, tile: { x: 196, y: 72 } },  // walks deeper into Aetherwood
      { hour: 20, tile: { x: 195, y: 70 } }   // returns to clearing
    ],
    dialogueRoot: 'wandering_sylveni_druid',
    isEssential: false,
    merchant: false,
    description: 'A grieving Sylveni druid who has been searching the Aetherwood for her missing apprentice, taken by something that should not exist in a living forest.',
    portrait: 'portrait_aelindra',
    questGiver: ['side_woven_lament'],
    killsQuestId: null,
    voiceType: 'female_soft_musical',
    level: 7,
    disposition: { default: 40, sylveni: 60, rootwarden_circle: 65 },
    attributes: { STR: 3, END: 4, AGI: 9, INT: 11, WIL: 12, PER: 9 }
  },

  iron_compact_deserter: {
    id: 'iron_compact_deserter',
    name: 'Gerran Solt',
    title: 'Former Iron Compact Soldier',
    race: 'varesh',
    faction: null,
    spriteKey: 'npc_deserter',
    spawnTile: { x: 265, y: 150 },             // abandoned farmstead near Iron Compact HQ
    schedule: [
      { hour: 0,  tile: { x: 265, y: 150 } }, // hides here all day — frightened
      { hour: 10, tile: { x: 265, y: 152 } }, // paces anxiously
      { hour: 18, tile: { x: 265, y: 150 } }  // back to hiding
    ],
    dialogueRoot: 'iron_compact_deserter',
    isEssential: false,
    merchant: false,
    description: 'A gaunt, hollow-eyed man who fled the Iron Compact after witnessing something he refuses to name at first. He has evidence of a massacre hidden under his floorboards.',
    portrait: 'portrait_gerran',
    questGiver: ['side_iron_blood'],
    killsQuestId: null,
    voiceType: 'male_frightened',
    level: 3,
    disposition: { default: 20 },
    attributes: { STR: 6, END: 5, AGI: 5, INT: 6, WIL: 3, PER: 6 }
  },

  grey_penitent_monk: {
    id: 'grey_penitent_monk',
    name: 'Brother Vel',
    title: 'Monk of the Grey Penitents',
    race: 'varesh',
    faction: 'grey_penitents',
    spriteKey: 'npc_penitent_monk',
    spawnTile: { x: 158, y: 57 },              // monastery scriptorium
    schedule: [
      { hour: 4,  tile: { x: 158, y: 55 } },  // dawn prayer
      { hour: 7,  tile: { x: 158, y: 57 } },  // scriptorium
      { hour: 12, tile: { x: 158, y: 60 } },  // refectory
      { hour: 13, tile: { x: 158, y: 57 } },  // scriptorium again
      { hour: 19, tile: { x: 158, y: 55 } },  // evening prayer
      { hour: 21, tile: { x: 158, y: 62 } }   // monk's cell
    ],
    dialogueRoot: 'grey_penitent_monk',
    isEssential: false,
    merchant: false,
    description: 'A quiet, obsessive monk who has spent seventeen years transcribing every Underlurk reference in the Penitents\' archive. He believes knowing an Underlurk entity\'s true name could bind it.',
    portrait: 'portrait_brother_vel',
    questGiver: ['side_hollow_name'],
    killsQuestId: null,
    voiceType: 'male_quiet_intense',
    level: 4,
    disposition: { default: 45, grey_penitents: 75 },
    attributes: { STR: 3, END: 4, AGI: 3, INT: 13, WIL: 11, PER: 7 }
  }
};

// ─── HELPER FUNCTIONS ──────────────────────────────────────────────────────

/**
 * Returns a single NPC definition by id, or null if not found.
 * @param {string} id
 * @returns {object|null}
 */
export function getNPC(id) {
  return NPCS[id] || null;
}

/**
 * Returns all NPCs that give the specified quest.
 * @param {string} questId
 * @returns {object[]}
 */
export function getNPCsByQuest(questId) {
  return Object.values(NPCS).filter(n => n.questGiver && n.questGiver.includes(questId));
}

/**
 * Returns all NPCs that are merchants of a given type.
 * @param {string} merchantType - e.g. 'blacksmith', 'alchemist', 'innkeeper', 'general'
 * @returns {object[]}
 */
export function getMerchantsByType(merchantType) {
  return Object.values(NPCS).filter(n => n.merchant && n.merchantType === merchantType);
}

/**
 * Returns the NPC schedule tile for a given hour (uses last entry before the hour).
 * @param {string} npcId
 * @param {number} hour - 0-23
 * @returns {{x: number, y: number}|null}
 */
export function getNPCTileAtHour(npcId, hour) {
  const npc = NPCS[npcId];
  if (!npc || !npc.schedule) return null;
  let result = npc.schedule[0];
  for (const entry of npc.schedule) {
    if (entry.hour <= hour) result = entry;
  }
  return result ? result.tile : null;
}
