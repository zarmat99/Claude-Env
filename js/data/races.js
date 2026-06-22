export const RACE_PALETTE = {
    varesh:  { skin: '#d4a76a', skinDark: '#b8855a', hair: '#3a2a1a', eye: '#5a3a1a', cloth: '#8a6a4a' },
    cindrak: { skin: '#9a8a7a', skinDark: '#7a6a5a', hair: '#2a1a0a', eye: '#ff6600', cloth: '#5a4a3a' },
    sylveni: { skin: '#c8d4b8', skinDark: '#a8b498', hair: '#e8e8f8', eye: '#90c030', cloth: '#3a6a3a' },
    vorrkai: { skin: '#5a6a7a', skinDark: '#3a4a5a', hair: '#0a0a1a', eye: '#00ccff', cloth: '#1a1a3a' },
    thornkin:{ skin: '#7a6a4a', skinDark: '#5a4a2a', hair: '#2a4a1a', eye: '#c8a030', cloth: '#4a6a2a' }
};

export const RACES = {
    varesh: {
        id: 'varesh',
        name: 'Varesh',
        title: 'Children of the Arcanate',
        description: 'The most populous race of Varethos. Descendants of Arcanate colonists, they are adaptable masters of trade and war. No innate magic, but highest gear proficiency.',
        lore: 'When the Shattering came, it was the Varesh who organized the survivors. Pragmatic to a fault, they built the Auric Concordat from the ruins of empire and called it civilization.',
        attributes: { STR: 5, END: 5, AGI: 5, INT: 5, WIL: 5, PER: 5 },
        bonuses: { attributes: { STR: 1, END: 1, AGI: 1, INT: 1, WIL: 1, PER: 1 } },
        startingSkills: { negotiation: 15, blades: 10 },
        health: 100, mana: 80, stamina: 100,
        traits: ['Adaptable: +1 to all attributes'],
        restrictions: []
    },
    cindrak: {
        id: 'cindrak',
        name: 'Cindrak',
        title: 'Forge-Folk of the Emberpeak',
        description: 'Stocky volcanic dwarves who live inside the Emberpeak Caldera. Master smiths who claim the Rootstones sing to them. Stubborn, proud, distrustful of sky-magic.',
        lore: 'The Cindrak did not flee the Shattering underground — they were already there, tending the ancient forges that the Arcanate had built above the magma veins.',
        attributes: { STR: 8, END: 8, AGI: 3, INT: 4, WIL: 5, PER: 4 },
        bonuses: { fireResistance: 25 },
        startingSkills: { smithing: 20, blunt: 15, block: 10 },
        health: 130, mana: 60, stamina: 120,
        traits: ['Fire Resistance 25%', '+3 END, +2 STR', 'Heavy armor proficiency'],
        restrictions: ['No magic schools above level 50']
    },
    sylveni: {
        id: 'sylveni',
        name: 'Sylveni',
        title: 'Silver Folk of the Aetherwood',
        description: 'Tall, silver-haired beings who emerged from the great Aetherwood forests. They communicate with Rootstone-connected tree-spirits called Woven. Pacifistic culture, fierce in defense.',
        lore: 'The Sylveni did not build the Aetherwood — they grew with it. For three thousand years before the Shattering, Sylveni druids tended the Woven, and in return the Woven kept their Shard intact.',
        attributes: { STR: 3, END: 3, AGI: 8, INT: 7, WIL: 5, PER: 6 },
        bonuses: { bonusXP: { herbalism: 0.5, archery: 0.25 } },
        startingSkills: { archery: 20, alchemy: 15, herbalism: 15 },
        health: 80, mana: 110, stamina: 90,
        traits: ['+3 AGI, +2 INT', 'Night Vision', 'Woven Affinity: bonus dialogue with spirits'],
        restrictions: []
    },
    vorrkai: {
        id: 'vorrkai',
        name: 'Vorrkai',
        title: 'Exiles of the Underlurk',
        description: 'Gaunt, grey-skinned beings with bioluminescent eyes. Exiled descendants of Arcanate mage-lords who survive in the deep Underlurk chasms by siphoning energy from dying Rootstones. Feared and persecuted above.',
        lore: 'The Vorrkai did not choose exile. After the Shattering, surface folk blamed the Arcanate — and the Vorrkai bore the Arcanate\'s face. They descended to survive.',
        attributes: { STR: 3, END: 4, AGI: 5, INT: 9, WIL: 7, PER: 3 },
        bonuses: { npcDispositionPenalty: -15 },
        startingSkills: { destruction: 25, illusion: 15, restoration: 10 },
        health: 75, mana: 140, stamina: 80,
        traits: ['+4 INT, +2 WIL', 'Bioluminescence: glow in darkness', 'Magic Affinity: +10% spell power'],
        restrictions: ['NPC disposition -15 by default', 'Cannot join Auric Concordat initially']
    },
    thornkin: {
        id: 'thornkin',
        name: 'Thornkin',
        title: 'Wanderers of Living Wood',
        description: 'Sentient beings evolved from Rootstone-infected flora during the Shattering. Bark-like skin, leaf-hair, amber sap for blood. No formal society — wanderers and lore-keepers.',
        lore: 'On the eleventh day of the Shattering, the Rootstone energy that flooded the dying forests crystallized in the oldest trees. Some of those trees stood up and walked away.',
        attributes: { STR: 4, END: 7, AGI: 4, INT: 5, WIL: 8, PER: 5 },
        bonuses: { naturalArmor: 10, healthRegen: 0.03 },
        startingSkills: { herbalism: 25, survival: 20, restoration: 15 },
        health: 110, mana: 100, stamina: 100,
        traits: ['+3 WIL, +2 END', 'Natural Armor 10', 'Slow Health Regen', 'Rootsense: detect Rootstone locations'],
        restrictions: ['Cannot wear metal armor', 'Fire weakness 25%']
    }
};

export function getRaceData(raceId) {
    return RACES[raceId] || RACES.varesh;
}

export function createBaseAttributes(raceId) {
    const race = getRaceData(raceId);
    const base = { ...race.attributes };
    if (race.bonuses.attributes) {
        for (const [k, v] of Object.entries(race.bonuses.attributes)) {
            base[k] = (base[k] || 0) + v;
        }
    }
    return base;
}
