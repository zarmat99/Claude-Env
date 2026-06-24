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

    oren_research_paper: {
        id: 'oren_research_paper',
        title: 'On the Dimming as Symbiosis (suppressed)',
        author: 'O. Osel, Auric Concordat Research Division — Year 3 of the Dimming',
        pages: [
            'My colleagues continue to describe the Dimming as decay. I propose it is communication. The Rootstones are not dying; they are withdrawing consent.',
            'The Arcanate built their civilization on Rootstone energy without ever establishing a reciprocal relationship. For twelve generations, we have taken and not given. The Dimming began precisely when the extraction rate exceeded the natural resonance renewal cycle.',
            'My models suggest the Rootstones are aware at some level of the imbalance. The void entity beneath the Chasm is not a predator. It is a digestive system — it absorbs what the Rootstones can no longer process.',
            'This research has been classified by High Consul Varenne Osel (my sister) on grounds of "civil disruption risk." I am keeping copies. Someone will eventually read this and understand that we are not victims of a catastrophe. We are perpetrators of a slow one.'
        ],
        flag: 'read_oren_research',
        location: 'Arcanate Ruins, resonance console',
        factionGrant: { grey_penitents: 10 }
    },
    vorrkai_exile_edict: {
        id: 'vorrkai_exile_edict',
        title: 'Edict of Subterranean Relocation (Original)',
        author: 'Grand Council of the Arcanate — Year 1 Post-Shattering',
        pages: [
            'By unanimous decree of the surviving Grand Council, the Vorrkai people are hereby relocated to the Underlurk territories, effective immediately.',
            'This relocation is necessitated by the social instability arising from their disproportionate presence in the technical corps that calculated and executed the Resonance Engine activation sequence.',
            'The Council wishes to emphasize that this relocation is NOT punitive. It is precautionary. The Vorrkai people cannot in good conscience remain among those whose grief they have occasioned.',
            'The Underlurk territories are habitable and will be provisioned for initial settlement. The Council expresses its sincerest regrets for any hardship this transition may cause.',
            '— signed by seven names, all Varesh, none of whom went underground'
        ],
        flag: 'read_exile_edict',
        location: 'Arcanate Ruins, records chamber',
        factionGrant: { grey_penitents: 15, iron_compact: -5 }
    },
    arcanate_engine_manual: {
        id: 'arcanate_engine_manual',
        title: 'Technical Manual: Resonance Engine Type-48 (Sealed)',
        author: 'Grand Artificer Vorath-Kel — classified',
        pages: [
            'The Type-48 engine differs from Types 1-47 in one critical respect: it does not harvest resonance. It generates it.',
            'All previous engines drew from the Rootstone network\'s existing supply. The Type-48 introduces new resonance into the system, compensating for depletion. In theory, a single functioning Type-48 could reverse the Dimming over approximately 300 years.',
            'The activation requirement is the complicating factor. The engine requires a living resonance catalyst — a being with sufficient Rootstone-attuned biology to serve as a seed signal. The process is not survivable in its current form.',
            'I have sealed this engine rather than destroy it. The mathematics are correct. What is lacking is the will, and the volunteer. I trust a future generation to possess both.',
            '— V.K. Year 0 P.S., final entry'
        ],
        flag: 'read_engine_manual',
        location: 'Arcanate Ruins, Engine Core chamber',
        questBonus: { side_arcanate_engine: 'reveals_activation_cost' }
    },
    rootwarden_founding_oath: {
        id: 'rootwarden_founding_oath',
        title: 'The Rootwarden Founding Oath',
        author: 'Elder Sathis Thornkin, First Warden — Year 1 Post-Shattering',
        pages: [
            'I bind myself to the Rootstone.',
            'I bind my knowledge to its study. I bind my years to its preservation. I bind my ending to its need.',
            'I will not despair at what I cannot mend. I will not pretend at hope I do not feel. I will measure what remains and speak the measure clearly, without comfort or concealment.',
            'If the Stones fall while I live, I will fall with them. If they hold while I tire, I will be their tiredness. I am not their keeper. I am their witness.',
            '— spoken over the Thornpillar on the first morning after the Shattering, in the presence of no one who needed to hear it'
        ],
        flag: 'read_rootwarden_oath',
        location: 'Rootwarden Sanctuary, inner sanctum'
    },
    ashveil_census: {
        id: 'ashveil_census',
        title: 'Ashveil Outpost — Population Registry (current)',
        author: 'Elder Maren Ashveil, Outpost Administrator',
        pages: [
            'Year 312 P.S.: Population 847.',
            'Year 340 P.S.: Population 689. Drought year. Twelve families departed.',
            'Year 360 P.S.: Population 504. First visible dimming of the Ashveil Stone. Forty-one families departed in one season.',
            'Year 380 P.S.: Population 312. Stone light now comparable to a single torch at midday. No new births registered this year.',
            'Current year: Population 94. Mostly elders. The young left to find better prospects; we stayed because we remember when this place was beautiful. Maren notes: it still is.'
        ],
        flag: 'read_ashveil_census',
        location: 'Ashveil Outpost, elder\'s house'
    },
    thornkin_first_words: {
        id: 'thornkin_first_words',
        title: 'The First Words of a Thornkin',
        author: 'Warden Alys, Rootwarden Circle — Year 1 Post-Shattering',
        pages: [
            'I was present when Sathis first spoke. I want to record this because I do not know what he is, and I want to understand it before I decide what to call it.',
            'He was a sapling at the base of the Thornpillar before the Shattering. After, the sapling walked. It took three weeks. Then it spoke.',
            'He said: "I remember when this was one piece." That was all. He then sat down in the grass and did not move for four days.',
            'When he rose again, he had decided to be a Rootwarden. No one asked him. He simply announced it, as though it were a fact he had worked out.',
            'I have served alongside him for forty years now. He has been right about most things. About the things he has been wrong about, he has never forgiven himself. I am not sure that is a flaw. I am not sure it is a virtue either.'
        ],
        flag: 'read_thornkin_first_words',
        location: 'Grey Penitents archive, personal correspondence'
    },
    void_entity_sightings: {
        id: 'void_entity_sightings',
        title: 'Cumulative Sightings Report: The Underlurk Entity',
        author: 'Compiled by the Grey Penitents Research Division over 300 years',
        pages: [
            'Year 3 P.S.: First confirmed sighting. Three Vorrkai descended. One returned. Testimony: "vast", "dark", "aware".',
            'Year 45 P.S.: Cult of the Void Tongue established. First attempt at communication. Result: eighteen dead. One survivor describes "a sound that was also a feeling, and the feeling was hunger but not for food."',
            'Year 120 P.S.: Grey Penitents establish monitoring post at Underlurk Chasm. No direct contact. Entity\'s location stable, depth estimated at 2km below lowest Vorrkai settlement.',
            'Year 220 P.S.: Entity appears to have moved upward by approximately 400m. Correlates exactly with Thornpillar resonance decline. We believe the Dimming is feeding it.',
            'Year 312 P.S.: Current. Entity is now estimated 800m below the Chasm floor. Rate of ascent accelerating. The Hollow Prophet\'s cult is using constructed anchors to accelerate the feeding process.',
            'Addendum: We do not know if it wants to destroy us. We do not know if it is capable of wanting. This uncertainty is the most frightening thing we have ever recorded.'
        ],
        flag: 'read_entity_sightings',
        location: 'Grey Penitents Monastery, restricted archive'
    },
    concordat_classified_osel: {
        id: 'concordat_classified_osel',
        title: 'Subject File: O. Osel — Monitoring and Status',
        author: 'Auric Concordat Intelligence Bureau — CLASSIFIED LEVEL 5',
        pages: [
            'Subject: Oren Vael Osel, former Senior Research Analyst, Resonance Division.',
            'Year 3: Research submitted on "symbiotic model of Dimming." Reviewed. Classified. Accurate but hazardous to public order. Subject notified. Subject unhappy.',
            'Year 5: Subject attempting to share research through unofficial channels. Two intercepts. No action taken — High Consul requests family matter be handled internally.',
            'Year 7: Subject has vanished. Last known location: Underlurk approach road. High Consul Varenne Osel requests no search be undertaken. Request honored.',
            'Year 9: Intelligence suggests subject has joined Void Tongue successor cult. High Consul Varenne Osel informed. Her response: "I know. I have known for two years. He sends letters." No further action authorized.',
            '— Note appended by Director Mal: The High Consul is aware her brother leads a cult that is actively killing Rootwardens. She is choosing not to act. This is not a security failure. This is a political decision. I have recorded it. Someone else can decide what to do with it.'
        ],
        flag: 'read_concordat_osel_file',
        location: 'Auric Concordat archive — requires Concordat reputation 60+',
        factionGrant: { grey_penitents: 20, auric_concordat: -15 }
    }
};

export const LORE_INSCRIPTIONS = [
    { id: 'rootstone_inscription_1', text: 'We remember. We hold. We wait. — carved into the Thornpillar base', x: 100, y: 100 },
    { id: 'arcanate_ruin_1', text: 'ENGINE 12 — OUTPUT NOMINAL — GLORY TO THE ARCANATE', x: 45, y: 80 },
    { id: 'greyhollow_gate', text: 'Greyhollow — Founded 23 P.S. — "Endure"', x: 102, y: 102 },
    { id: 'vorrkai_exile_inscription', text: 'Here walked those who were not wrong. We were afraid. — in Vorrkai script, beneath an Arcanate seal', x: 97, y: 157 },
    { id: 'arcanate_coordinates', text: 'Engine positions: I-VII. See reverse for coordinates. Do not activate simultaneously. [reverse is missing]', x: 121, y: 67 },
    { id: 'thornkin_oath_stone', text: 'I am not their keeper. I am their witness. — carved in Old Arcanate, signed with a leaf-print', x: 82, y: 82 },
    { id: 'dark_prophecy', text: '"When the seventh stone closes its eyes, the void will choose." — source unknown, found in twelve separate locations', x: 94, y: 153 },
    { id: 'cael_memorial', text: '"For Cael Veth, who knew before us. — the Rootwarden Circle, Year 312 P.S."', x: 90, y: 151 },
    { id: 'vorath_kel_final', text: '"If this calculation is wrong, I am sorry. If it is right, I am more sorry. — V.K."', x: 119, y: 70 }
];

export function getLoreText(id) {
    return LORE_TEXTS[id] || null;
}
