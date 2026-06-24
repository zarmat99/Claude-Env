export const FACTIONS = {
    auric_concordat: {
        id: 'auric_concordat',
        name: 'Auric Concordat',
        shortName: 'Concordat',
        color: '#c8a830',
        description: 'A mercantile senate that controls trade between the six surviving Shards via airship-bridges. They project order and law but are deeply corrupt.',
        leader: 'High Consul Varenne Osel',
        motivation: 'Economic hegemony, stability through control',
        playerTitle: ['Stranger', 'Associate', 'Liaison', 'Factor', 'High Factor', 'Arbiter'],
        startingRep: { varesh: 0, cindrak: -5, sylveni: -5, vorrkai: -20, thornkin: -5 },
        disposition: {
            rootwarden_circle: -20,
            iron_compact: 10,
            underlurk_cult: -80,
            grey_penitents: 5
        },
        repThresholds: {
            hostile: -50,
            unfriendly: -20,
            neutral: 0,
            friendly: 30,
            honored: 60,
            exalted: 90
        },
        joinable: true,
        joinRequirements: { rep: 20 }
    },
    rootwarden_circle: {
        id: 'rootwarden_circle',
        name: 'Rootwarden Circle',
        shortName: 'Rootwardens',
        color: '#30c860',
        description: 'Ancient order of druids and scholars dedicated to monitoring and protecting the Rootstones. They know the Rootstones are dying.',
        leader: 'Elder Sathis',
        motivation: 'Save Aethermoor from falling into the Underlurk',
        playerTitle: ['Outsider', 'Observer', 'Watcher', 'Keeper', 'Rootkeeper', 'Rootborn'],
        startingRep: { varesh: 0, cindrak: -10, sylveni: 15, vorrkai: 0, thornkin: 20 },
        disposition: {
            auric_concordat: -20,
            iron_compact: -10,
            underlurk_cult: -100,
            grey_penitents: 40
        },
        repThresholds: {
            hostile: -50, unfriendly: -20, neutral: 0,
            friendly: 25, honored: 50, exalted: 80
        },
        joinable: true,
        joinRequirements: { rep: 10 }
    },
    iron_compact: {
        id: 'iron_compact',
        name: 'Iron Compact',
        shortName: 'Compact',
        color: '#8a8a9a',
        description: 'A mercenary coalition that fills the power vacuum left by the Shattering. Loyal to coin, but developing political ambitions under Warmaster Kash.',
        leader: 'Warmaster Dreya Kash',
        motivation: 'Power and survival — transitioning from mercenaries to sovereign military',
        playerTitle: ['Recruit', 'Blade', 'Sergeant', 'Captain', 'Commander', 'Warmaster\'s Hand'],
        startingRep: { varesh: 5, cindrak: 10, sylveni: -10, vorrkai: -15, thornkin: 0 },
        disposition: {
            auric_concordat: 10,
            rootwarden_circle: -10,
            underlurk_cult: -60,
            grey_penitents: -5
        },
        repThresholds: {
            hostile: -50, unfriendly: -20, neutral: 0,
            friendly: 30, honored: 60, exalted: 90
        },
        joinable: true,
        joinRequirements: { rep: 0, skill: { id: 'blades', level: 20 } }
    },
    underlurk_cult: {
        id: 'underlurk_cult',
        name: 'Underlurk Cult',
        shortName: 'The Cult',
        color: '#6a00cc',
        description: 'Radical Vorrkai extremists who worship the void-entity in the Underlurk. They seek to destroy the remaining Rootstones and let Varethos fall.',
        leader: 'The Hollow Prophet (identity unknown)',
        motivation: 'Apocalyptic transcendence through void-union',
        playerTitle: ['Unbeliever', 'Doubter', 'Seeker', 'Initiate', 'Zealot', 'Void-Touched'],
        startingRep: { varesh: -30, cindrak: -30, sylveni: -30, vorrkai: -10, thornkin: -20 },
        disposition: {
            auric_concordat: -100,
            rootwarden_circle: -100,
            iron_compact: -60,
            grey_penitents: -80
        },
        repThresholds: {
            hostile: -20, unfriendly: 0, neutral: 20,
            friendly: 50, honored: 80, exalted: 100
        },
        joinable: false,
        secret: true
    },
    grey_penitents: {
        id: 'grey_penitents',
        name: 'Grey Penitents',
        shortName: 'Penitents',
        color: '#c0c0c0',
        description: 'A monastic order descended from Arcanate survivors consumed by guilt. They maintain hospitals and libraries, secretly guarding the most dangerous Arcanate knowledge.',
        leader: 'Abbess Mirela Vonn',
        motivation: 'Atonement, preservation of knowledge, preventing another Shattering',
        playerTitle: ['Stranger', 'Friend', 'Ally', 'Confidant', 'Brother/Sister', 'Penitent-Chosen'],
        startingRep: { varesh: 10, cindrak: 5, sylveni: 10, vorrkai: 10, thornkin: 15 },
        disposition: {
            auric_concordat: 5,
            rootwarden_circle: 40,
            iron_compact: -5,
            underlurk_cult: -80
        },
        repThresholds: {
            hostile: -50, unfriendly: -20, neutral: 0,
            friendly: 25, honored: 50, exalted: 80
        },
        joinable: true,
        joinRequirements: { rep: 15 }
    }
};

export function getFactionTitle(factionId, rep) {
    const f = FACTIONS[factionId];
    if (!f) return 'Unknown';
    const t = f.repThresholds;
    const titles = f.playerTitle;
    if (rep < t.unfriendly) return titles[0];
    if (rep < t.neutral)    return titles[1];
    if (rep < t.friendly)   return titles[2];
    if (rep < t.honored)    return titles[3];
    if (rep < t.exalted)    return titles[4];
    return titles[5];
}

export function getFactionDisposition(factionId, rep) {
    const f = FACTIONS[factionId];
    if (!f) return 'neutral';
    const t = f.repThresholds;
    if (rep < t.hostile)    return 'hostile';
    if (rep < t.unfriendly) return 'unfriendly';
    if (rep < t.neutral)    return 'neutral';
    if (rep < t.friendly)   return 'friendly';
    if (rep < t.honored)    return 'honored';
    return 'exalted';
}
