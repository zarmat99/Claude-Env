// Crafting recipe definitions for Aethermoor — pure data, no class logic
// Three categories: SMITHING_RECIPES, ALCHEMY_RECIPES, SMELTING_RECIPES

// ─── SMITHING RECIPES (forge required) ────────────────────────────────────

export const SMITHING_RECIPES = [

  // ── WEAPONS ──────────────────────────────────────────────────────────────

  {
    id: 'recipe_iron_dagger',
    name: 'Iron Dagger',
    output: { itemId: 'dagger', quantity: 1 },
    ingredients: [
      { itemId: 'iron_ingot',    quantity: 1 },
      { itemId: 'leather_strips', quantity: 1 }
    ],
    requiresSkill: { smithing: 0 },
    xpGain: { smithing: 20 },
    toolRequired: 'forge',
    description: 'A simple short blade, quick to make and quick to use.'
  },

  {
    id: 'recipe_iron_sword',
    name: 'Iron Sword',
    output: { itemId: 'iron_sword', quantity: 1 },
    ingredients: [
      { itemId: 'iron_ingot',    quantity: 2 },
      { itemId: 'leather_strips', quantity: 1 }
    ],
    requiresSkill: { smithing: 0 },
    xpGain: { smithing: 30 },
    toolRequired: 'forge',
    description: 'Standard iron longsword. The first thing any apprentice smith learns to make.'
  },

  {
    id: 'recipe_iron_mace',
    name: 'Iron Mace',
    output: { itemId: 'iron_mace', quantity: 1 },
    ingredients: [
      { itemId: 'iron_ingot',    quantity: 3 },
      { itemId: 'leather_strips', quantity: 1 }
    ],
    requiresSkill: { smithing: 10 },
    xpGain: { smithing: 35 },
    toolRequired: 'forge',
    description: 'Heavy flanged mace. Requires more iron but punishes armored foes.'
  },

  {
    id: 'recipe_steel_sword',
    name: 'Steel Sword',
    output: { itemId: 'steel_sword', quantity: 1 },
    ingredients: [
      { itemId: 'iron_ingot',    quantity: 3 },
      { itemId: 'leather_strips', quantity: 2 }
    ],
    requiresSkill: { smithing: 20 },
    xpGain: { smithing: 55 },
    toolRequired: 'forge',
    description: 'A well-tempered steel blade. Requires careful folding at the forge — a true smith\'s work.',
    note: 'Requires iron_ingot that has been quality-processed; represented by higher smithing skill check.'
  },

  {
    id: 'recipe_rootstone_blade',
    name: 'Rootstone Blade',
    output: { itemId: 'rootstone_blade', quantity: 1 },
    ingredients: [
      { itemId: 'iron_ingot',        quantity: 4 },
      { itemId: 'rootstone_fragment', quantity: 2 },
      { itemId: 'leather_strips',    quantity: 2 }
    ],
    requiresSkill: { smithing: 50 },
    xpGain: { smithing: 200 },
    toolRequired: 'forge',
    questFlag: 'main_act4_complete',
    description: 'A blade infused with Rootstone crystalline energy. The rarest weapon a smith can create — and the most dangerous to forge.',
    loreNote: 'The Rootstone sings when it touches iron. Most smiths who attempt this go deaf in one ear.'
  },

  {
    id: 'recipe_wooden_bow',
    name: 'Wooden Bow',
    output: { itemId: 'wooden_bow', quantity: 1 },
    ingredients: [
      { itemId: 'leather_strips', quantity: 3 }
    ],
    requiresSkill: { smithing: 0 },
    xpGain: { smithing: 15 },
    toolRequired: 'workbench',
    description: 'Shaped from a single stave of wood, strung with leather cord. No forge needed — just a workbench and patience.'
  },

  {
    id: 'recipe_iron_arrow_bundle',
    name: 'Iron Arrows (12)',
    output: { itemId: 'iron_arrow', quantity: 12 },
    ingredients: [
      { itemId: 'iron_ingot',    quantity: 1 },
      { itemId: 'leather_strips', quantity: 1 }
    ],
    requiresSkill: { smithing: 0 },
    xpGain: { smithing: 12 },
    toolRequired: 'forge',
    description: 'A bundle of iron-tipped arrows fletched with leather strips.'
  },

  // ── ARMOR ────────────────────────────────────────────────────────────────

  {
    id: 'recipe_leather_chest',
    name: 'Leather Jerkin',
    output: { itemId: 'leather_chest', quantity: 1 },
    ingredients: [
      { itemId: 'leather_strips', quantity: 6 }
    ],
    requiresSkill: { smithing: 0 },
    xpGain: { smithing: 25 },
    toolRequired: 'workbench',
    description: 'Layered and stitched leather chest armor. No forge needed — just good leatherwork.'
  },

  {
    id: 'recipe_leather_helm',
    name: 'Leather Cap',
    output: { itemId: 'leather_helm', quantity: 1 },
    ingredients: [
      { itemId: 'leather_strips', quantity: 3 }
    ],
    requiresSkill: { smithing: 0 },
    xpGain: { smithing: 15 },
    toolRequired: 'workbench',
    description: 'A simple padded leather cap. Better than nothing.'
  },

  {
    id: 'recipe_iron_chest',
    name: 'Iron Cuirass',
    output: { itemId: 'iron_chest', quantity: 1 },
    ingredients: [
      { itemId: 'iron_ingot',    quantity: 5 },
      { itemId: 'leather_strips', quantity: 2 }
    ],
    requiresSkill: { smithing: 15 },
    xpGain: { smithing: 70 },
    toolRequired: 'forge',
    description: 'Heavy iron plate cuirass. Requires a proper forge and a strong arm to shape.'
  },

  {
    id: 'recipe_iron_helm',
    name: 'Iron Helm',
    output: { itemId: 'iron_helm', quantity: 1 },
    ingredients: [
      { itemId: 'iron_ingot',    quantity: 3 },
      { itemId: 'leather_strips', quantity: 1 }
    ],
    requiresSkill: { smithing: 10 },
    xpGain: { smithing: 40 },
    toolRequired: 'forge',
    description: 'Shaped iron helm with cheek guards. The padding is leather-backed.'
  },

  // ── UTILITY / MISC ────────────────────────────────────────────────────────

  {
    id: 'recipe_torch',
    name: 'Torch',
    output: { itemId: 'torch', quantity: 2 },
    ingredients: [
      { itemId: 'leather_strips', quantity: 1 }
    ],
    requiresSkill: { smithing: 0 },
    xpGain: { smithing: 5 },
    toolRequired: 'workbench',
    description: 'Two torches wrapped in oil-soaked leather strips. The simplest craft there is.'
  },

  {
    id: 'recipe_bark_armor',
    name: 'Bark Plate',
    output: { itemId: 'bark_armor', quantity: 1 },
    ingredients: [
      { itemId: 'rootstone_fragment', quantity: 1 },
      { itemId: 'leather_strips',    quantity: 4 }
    ],
    requiresSkill: { smithing: 25 },
    xpGain: { smithing: 80 },
    toolRequired: 'rootwarden_altar',
    raceRestricted: ['thornkin'],
    description: 'Thornkin bark armor reinforced with a Rootstone fragment. Can only be shaped at a Rootwarden altar, and only by Thornkin whose bark responds to the resonance.',
    loreNote: 'The Rootstone sings the bark hard. Only those who ARE bark can hear the right frequency.'
  },

  {
    id: 'recipe_staff_of_sparks',
    name: 'Staff of Sparks',
    output: { itemId: 'staff_of_sparks', quantity: 1 },
    ingredients: [
      { itemId: 'iron_ingot',        quantity: 2 },
      { itemId: 'rootstone_fragment', quantity: 1 },
      { itemId: 'leather_strips',    quantity: 1 }
    ],
    requiresSkill: { smithing: 20, destruction: 10 },
    xpGain: { smithing: 60, destruction: 20 },
    toolRequired: 'forge',
    description: 'An iron-cored staff capped with a Rootstone shard. The channeling grooves must be carved precisely or the discharge misfires.',
    loreNote: 'Early Arcanate records call these "Rootspears." The name never caught on.'
  }
];

// ─── ALCHEMY RECIPES (alembic required) ───────────────────────────────────

export const ALCHEMY_RECIPES = [

  // ── HEALING ──────────────────────────────────────────────────────────────

  {
    id: 'recipe_health_potion_minor',
    name: 'Minor Health Potion',
    output: { itemId: 'health_potion_minor', quantity: 2 },
    ingredients: [
      { itemId: 'rootmoss', quantity: 2 }
    ],
    requiresSkill: { alchemy: 0 },
    xpGain: { alchemy: 15 },
    toolRequired: 'alembic',
    description: 'A weak restorative. Two vials brewed from a handful of rootmoss — the most basic alchemy there is.'
  },

  {
    id: 'recipe_health_potion',
    name: 'Health Potion',
    output: { itemId: 'health_potion', quantity: 1 },
    ingredients: [
      { itemId: 'rootmoss',   quantity: 2 },
      { itemId: 'emberpetal', quantity: 1 }
    ],
    requiresSkill: { alchemy: 0 },
    xpGain: { alchemy: 25 },
    toolRequired: 'alembic',
    description: 'A standard healing potion. The emberpetal accelerates the rootmoss restoration effect.'
  },

  {
    id: 'recipe_health_potion_strong',
    name: 'Strong Health Potion',
    output: { itemId: 'health_potion', quantity: 2 },
    ingredients: [
      { itemId: 'rootmoss',           quantity: 4 },
      { itemId: 'emberpetal',         quantity: 2 },
      { itemId: 'rootstone_fragment', quantity: 1 }
    ],
    requiresSkill: { alchemy: 30 },
    xpGain: { alchemy: 60 },
    toolRequired: 'alembic',
    description: 'A concentrated double-batch of health potions using Rootstone resonance as a binding catalyst. Two vials output.',
    loreNote: 'The Rootwardens are not pleased when they learn alchemists use Rootstone fragments as catalysts.'
  },

  // ── MANA / STAMINA ────────────────────────────────────────────────────────

  {
    id: 'recipe_mana_potion',
    name: 'Mana Potion',
    output: { itemId: 'mana_potion', quantity: 1 },
    ingredients: [
      { itemId: 'rootmoss',   quantity: 1 },
      { itemId: 'voidbloom',  quantity: 1 }
    ],
    requiresSkill: { alchemy: 10 },
    xpGain: { alchemy: 30 },
    toolRequired: 'alembic',
    description: 'Rootmoss and voidbloom produce a pale blue liquid that restores magical reserves.'
  },

  {
    id: 'recipe_stamina_potion',
    name: 'Stamina Draught',
    output: { itemId: 'stamina_potion', quantity: 2 },
    ingredients: [
      { itemId: 'emberpetal', quantity: 2 },
      { itemId: 'rootmoss',   quantity: 1 }
    ],
    requiresSkill: { alchemy: 0 },
    xpGain: { alchemy: 20 },
    toolRequired: 'alembic',
    description: 'Emberpetal burns hot in the blood, restoring endurance. Two draughts per batch.'
  },

  // ── STATUS CURES ─────────────────────────────────────────────────────────

  {
    id: 'recipe_antidote',
    name: 'Antidote',
    output: { itemId: 'antidote', quantity: 2 },
    ingredients: [
      { itemId: 'rootmoss',   quantity: 1 },
      { itemId: 'shadowcap',  quantity: 1 }
    ],
    requiresSkill: { alchemy: 5 },
    xpGain: { alchemy: 25 },
    toolRequired: 'alembic',
    description: 'Counterintuitively, the toxins in shadowcap neutralize most poisons when properly refined. Two doses per batch.',
    loreNote: 'The Sylveni have known this for centuries. Everyone else reinvents it every generation.'
  },

  // ── ADVANCED ──────────────────────────────────────────────────────────────

  {
    id: 'recipe_void_tincture',
    name: 'Void Tincture',
    output: { itemId: 'mana_potion', quantity: 3 },
    ingredients: [
      { itemId: 'voidbloom',  quantity: 3 },
      { itemId: 'shadowcap',  quantity: 2 },
      { itemId: 'rootmoss',   quantity: 2 }
    ],
    requiresSkill: { alchemy: 40 },
    xpGain: { alchemy: 90 },
    toolRequired: 'alembic',
    description: 'A potent triple-batch mana restoration brewed from deep Underlurk flora. The Vorrkai drink this like water.',
    loreNote: 'Extended use is said to cause bioluminescent eyes. The Vorrkai say this is a side effect of wisdom.'
  },

  {
    id: 'recipe_emberpetal_salve',
    name: 'Emberpetal Fire Salve',
    output: { itemId: 'stamina_potion', quantity: 3 },
    ingredients: [
      { itemId: 'emberpetal', quantity: 4 },
      { itemId: 'rootmoss',   quantity: 1 }
    ],
    requiresSkill: { alchemy: 20 },
    xpGain: { alchemy: 45 },
    toolRequired: 'alembic',
    description: 'Concentrated emberpetal extract in a rootmoss base. Burns going down — in a useful way. Three doses.'
  },

  {
    id: 'recipe_shadow_draught',
    name: 'Shadow Draught',
    output: { itemId: 'stamina_potion', quantity: 1 },
    ingredients: [
      { itemId: 'shadowcap',  quantity: 3 }
    ],
    requiresSkill: { alchemy: 15 },
    xpGain: { alchemy: 35 },
    toolRequired: 'alembic',
    description: 'Pure refined shadowcap extract. Dangerous if mishandled, but grants an unusual clarity and silence to movements.',
    bonusEffect: { type: 'sneak_boost', magnitude: 20, duration: 60 },
    note: 'This brews a stamina_potion with a bonus sneak effect applied on use — handled by the effect system.'
  },

  {
    id: 'recipe_rootstone_elixir',
    name: 'Rootstone Elixir',
    output: { itemId: 'health_potion', quantity: 2 },
    ingredients: [
      { itemId: 'rootstone_fragment', quantity: 1 },
      { itemId: 'rootmoss',           quantity: 3 },
      { itemId: 'emberpetal',         quantity: 2 }
    ],
    requiresSkill: { alchemy: 45 },
    xpGain: { alchemy: 100 },
    toolRequired: 'alembic',
    questFlag: 'rootwarden_circle_honored',
    description: 'An ancient Rootwarden formula that fuses Rootstone energy directly into a healing medium. Exceptionally rare and restricted.',
    loreNote: 'Elder Sathis considers anyone who brews this without authorization to be committing a spiritual crime.'
  }
];

// ─── SMELTING RECIPES (forge / smelter required) ──────────────────────────

export const SMELTING_RECIPES = [

  {
    id: 'smelt_iron',
    name: 'Smelt Iron Ingot',
    output: { itemId: 'iron_ingot', quantity: 1 },
    ingredients: [
      { itemId: 'iron_ore', quantity: 2 }
    ],
    requiresSkill: { smithing: 0 },
    xpGain: { smithing: 10 },
    toolRequired: 'forge',
    description: 'Two iron ore smelted down into one usable ingot. The first skill every forge-hand learns.'
  },

  {
    id: 'smelt_iron_bulk',
    name: 'Smelt Iron Ingots (bulk)',
    output: { itemId: 'iron_ingot', quantity: 5 },
    ingredients: [
      { itemId: 'iron_ore', quantity: 10 }
    ],
    requiresSkill: { smithing: 0 },
    xpGain: { smithing: 50 },
    toolRequired: 'forge',
    description: 'Bulk smelt of ten iron ore into five ingots. Same ratio, less tedium.'
  },

  {
    id: 'smelt_leather_strips',
    name: 'Cut Leather Strips',
    output: { itemId: 'leather_strips', quantity: 4 },
    ingredients: [
      { itemId: 'leather_chest', quantity: 1 }
    ],
    requiresSkill: { smithing: 0 },
    xpGain: { smithing: 5 },
    toolRequired: 'workbench',
    description: 'Salvage strips from an old leather jerkin. Not a true smelt, but categorized here for convenience.',
    note: 'Destroys the leather_chest to yield 4 leather_strips. Displayed under smelting for UI grouping.'
  }
];

// ─── HELPER FUNCTIONS ──────────────────────────────────────────────────────

/**
 * Given a list of ingredient item IDs and a recipe type, returns the first matching recipe.
 * Matches if all recipe ingredients are satisfied by the provided IDs (exact or superset).
 * @param {string[]} ingredientIds - Array of item IDs the player is combining
 * @param {'smithing'|'alchemy'|'smelting'} type
 * @returns {object|null}
 */
export function findRecipe(ingredientIds, type) {
  const list = type === 'smithing' ? SMITHING_RECIPES
             : type === 'alchemy'  ? ALCHEMY_RECIPES
             : type === 'smelting' ? SMELTING_RECIPES
             : [];

  const inputSet = new Set(ingredientIds);
  return list.find(recipe =>
    recipe.ingredients.every(ing => inputSet.has(ing.itemId))
  ) || null;
}

/**
 * Returns all recipes of a given type that the player can learn/use at a skill level.
 * @param {number} skillLevel
 * @param {'smithing'|'alchemy'|'smelting'} type
 * @returns {object[]}
 */
export function getRecipesBySkillLevel(skillLevel, type) {
  const list = type === 'smithing' ? SMITHING_RECIPES
             : type === 'alchemy'  ? ALCHEMY_RECIPES
             : type === 'smelting' ? SMELTING_RECIPES
             : [];

  return list.filter(recipe => {
    const req = recipe.requiresSkill[type] ?? recipe.requiresSkill.smithing ?? 0;
    return skillLevel >= req;
  });
}

/**
 * Returns all recipes that produce the given output item.
 * @param {string} itemId
 * @returns {object[]}
 */
export function getRecipesForItem(itemId) {
  return [
    ...SMITHING_RECIPES,
    ...ALCHEMY_RECIPES,
    ...SMELTING_RECIPES
  ].filter(r => r.output.itemId === itemId);
}

/**
 * Returns a single recipe by id from any category.
 * @param {string} id
 * @returns {object|null}
 */
export function getRecipeById(id) {
  return [
    ...SMITHING_RECIPES,
    ...ALCHEMY_RECIPES,
    ...SMELTING_RECIPES
  ].find(r => r.id === id) || null;
}
