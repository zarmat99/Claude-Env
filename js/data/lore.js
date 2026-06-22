export const LORE_TEXTS = {
    account_of_shattering: {
        id: 'account_of_shattering',
        title: 'The Account of the Shattering',
        author: 'Brother Aldric Vonn, Grey Penitents — Year 12 Post-Shattering',
        pages: [
            'In the twelve-hundredth year of the Arcanate, Grand Artificer Vorath-Kel ordered the simultaneous activation of forty-seven Resonance Engines across the continent of Ur-Varethos. The stated purpose was total atmospheric heat regulation — an end to winter.',
            'The actual consequence, which Vorath-Kel\'s own calculations predicted and suppressed, was the complete severing of the Rootstone network\'s interconnective lattice. We did not end winter. We ended the world.',
            'The Shattering lasted eleven days. When the clouds parted, seven pieces of the continent remained suspended. We do not know why. We believe the Rootstones chose to hold us. We believe they are still choosing.',
            'We do not deserve them.'
        ],
        factionGrant: { rootwarden_circle: 5 },
        flag: 'read_shattering_account',
        location: 'Grey Penitents Monastery, Thornmere'
    },
    on_the_nature_of_woven: {
        id: 'on_the_nature_of_woven',
        title: 'On the Nature of Woven',
        author: 'Druid Aelindra Sylvex, Aetherwood Conclave — undated',
        pages: [
            'Woven are not trees that think. This is the outsider error. Woven are thoughts that have grown trees.',
            'The Rootstone energy that permeates the Aetherwood does not animate the flora — it crystallizes consciousness from the ambient emotional residue of creatures who live, love, and die beneath the canopy over long centuries.',
            'A Woven who appears to be a thousand years old may contain the accumulated identity-fragments of ten thousand individuals. They are a kind of collective memory given wood and root and a very slow voice.',
            'When a Woven dies, those memories dissolve. The Sylveni do not mourn the tree. We mourn the library.'
        ],
        flag: 'read_woven_nature',
        location: 'Aetherwood, eastern grove',
        requiredForQuest: 'woven_lament'
    },
    compact_charter_zero: {
        id: 'compact_charter_zero',
        title: 'The Compact Charter, Article Zero',
        author: 'Classified — Iron Compact High Command',
        pages: [
            'Let it be understood by all officers of the Iron Compact: we are not soldiers. Soldiers serve nations. Soldiers die for ideals. We are professionals who apply controlled violence in exchange for compensation.',
            'However. We are also the last coherent military force on Varethos. Should the Concordat fall, should the Rootwardens fail, should the Shards themselves crack further — we will remain. We will be the last order.',
            'The Warmaster has therefore authorized contingency planning under the designation Article Zero: the Iron Compact assumes governance of Varethos in the event of civilizational collapse.',
            'This document does not exist.'
        ],
        flag: 'read_compact_charter',
        location: 'Iron Compact headquarters, hidden cache',
        factionGrant: { iron_compact: -10, grey_penitents: 10 }
    },
    void_has_mouth: {
        id: 'void_has_mouth',
        title: 'Fragment 7: The Void Has a Mouth',
        author: 'Transcribed from Vorrkai oral tradition by Scholar Tessek, Grey Penitents',
        pages: [
            'Deep enough, the Underlurk breathes. My grandmother\'s grandmother\'s grandmother told her: the void is not empty. Something large lies beneath us, pressed against the bottom of the sky we hang from.',
            'In the first generation after the Shattering, four Vorrkai descended to touch it. Three did not return. The fourth came back changed — her eyes no longer bioluminescent but simply dark, like holes.',
            'She said only this, once, before she stopped speaking entirely: "It is not malicious. It is hungry. It does not know the difference."',
            'The Cult believes this is invitation. We who remain below know it is warning.'
        ],
        flag: 'read_void_fragment',
        location: 'Vorrkai Underlurk settlement',
        questBonus: { act5_difficulty: -0.2 }
    },
    thornpillar_records: {
        id: 'thornpillar_records',
        title: 'Monitoring Records: Thornpillar Station 1',
        author: 'Warden Cael, Rootwarden Circle',
        pages: [
            'Day 1: Thornpillar resonance output at 94% baseline. Unexplained 6% drop over past fortnight. Investigating potential lattice interference.',
            'Day 8: Output now 87%. Found unusual crystalline deposits at the base — not natural Rootstone formation. Origin unknown. Sending samples to Elder Sathis.',
            'Day 15: 79%. The deposits are spreading. They appear to be ABSORBING Rootstone energy rather than storing it. Someone placed these here deliberately.',
            'Day 16: Station has been — [text ends abruptly, ink smeared]'
        ],
        flag: 'read_thornpillar_records',
        location: 'Monitoring Station 1 (sabotaged)',
        questAdvance: { quest: 'main_act1', evidence: 'station1_records' }
    },
    vorrkai_primer: {
        id: 'vorrkai_primer',
        title: 'A Brief History of the Vorrkai Exile',
        author: 'Abbess Mirela Vonn, Grey Penitents',
        pages: [
            'The Vorrkai did not cause the Shattering. Let me be clear about this, though few above will hear it.',
            'The Arcanate Grand Council was overwhelmingly Varesh. Grand Artificer Vorath-Kel was Varesh. The forty-seven Resonance Engines were built and activated by Varesh hands following Varesh ambition.',
            'The Vorrkai were the Arcanate\'s court scholars. They provided the mathematics. They were, like all of us, complicit in trusting their leaders. This is a sin, but it is the universal sin.',
            'We drove them underground for wearing a face that reminded us of our own guilt. We have not atoned for this. We may not deserve to.'
        ],
        flag: 'read_vorrkai_history',
        location: 'Grey Penitents library'
    }
};

export const LORE_INSCRIPTIONS = [
    { id: 'rootstone_inscription_1', text: 'We remember. We hold. We wait. — carved into the Thornpillar base', x: 100, y: 100 },
    { id: 'arcanate_ruin_1', text: 'ENGINE 12 — OUTPUT NOMINAL — GLORY TO THE ARCANATE', x: 45, y: 80 },
    { id: 'greyhollow_gate', text: 'Greyhollow — Founded 23 P.S. — "Endure"', x: 102, y: 102 }
];

export function getLoreText(id) {
    return LORE_TEXTS[id] || null;
}
