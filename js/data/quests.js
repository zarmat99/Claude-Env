// Quest definitions for Aethermoor — pure data, no class logic
// Includes 5 main-quest acts (chained) and 5 side quests.

export const QUESTS = {

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN QUEST ARC
  // ═══════════════════════════════════════════════════════════════════════════

  main_act1: {
    id: 'main_act1',
    name: 'The Flickering Light',
    type: 'main',
    act: 1,
    description: 'Warden Cael has asked you to investigate three sabotaged Rootstone monitoring stations and bring the resonance samples to Elder Sathis.',
    giver: 'cael',
    autoStart: false,
    stages: [
      {
        id: 'talk_to_cael',
        description: 'Speak to Warden Cael at the Thornpillar monitoring station.',
        journalEntry: 'A young Rootwarden scholar named Cael found me in Greyhollow with urgency in his eyes. The Thornpillar — the great Rootstone that keeps this Shard of Varethos aloft — is dimming faster than the Rootwardens can explain. Three monitoring stations in the surrounding hills have gone silent. He needs someone who can move fast and doesn\'t ask too many questions.',
        objectives: [
          {
            type: 'talk_to',
            target: 'cael',
            description: 'Speak with Warden Cael',
            completedFlag: 'cael_met'
          }
        ],
        onComplete: [
          { type: 'set_flag',     flag: 'cael_quest_accepted' },
          { type: 'advance_stage', quest: 'main_act1', stage: 'investigate_stations' }
        ]
      },
      {
        id: 'investigate_stations',
        description: 'Investigate the three silent Rootstone monitoring stations and collect resonance samples.',
        journalEntry: 'Cael has marked three monitoring stations on my map: Station Verath in the foothills north of Greyhollow, Station Ossian in the cave system below the Thornpillar, and Station Keld on the eastern ridge. Each should have a resonance collector — I need to retrieve the data crystal from each.',
        objectives: [
          {
            type: 'visit_location',
            target: 'station_verath',
            description: 'Investigate Station Verath (north foothills)',
            collectItem: 'resonance_sample',
            completedFlag: 'station_verath_investigated',
            note: 'Station was attacked — signs of cult involvement. A cave spider infestation inside.'
          },
          {
            type: 'visit_location',
            target: 'station_ossian',
            description: 'Investigate Station Ossian (Thornpillar caves)',
            collectItem: 'resonance_sample',
            completedFlag: 'station_ossian_investigated',
            note: 'Station is intact but the operator is dead — killed by a void hound. Crystal is still readable.'
          },
          {
            type: 'visit_location',
            target: 'station_keld',
            description: 'Investigate Station Keld (eastern ridge)',
            collectItem: 'resonance_sample',
            completedFlag: 'station_keld_investigated',
            note: 'Station was deliberately sabotaged — arcane burn marks consistent with destruction magic. A cult zealot patrol nearby.'
          }
        ],
        onComplete: [
          { type: 'set_flag',     flag: 'all_stations_investigated' },
          { type: 'advance_stage', quest: 'main_act1', stage: 'report_to_sathis' }
        ]
      },
      {
        id: 'report_to_sathis',
        description: 'Travel to the Rootwarden Sanctuary in the Aetherwood and deliver the resonance samples to Elder Sathis.',
        journalEntry: 'I have all three resonance samples. Cael told me to take them to Elder Sathis at the Rootwarden Sanctuary deep in the Aetherwood — a journey of several hours through increasingly strange terrain. Cael seemed frightened when I described what I found at the stations. He didn\'t say why.',
        objectives: [
          {
            type: 'talk_to',
            target: 'elder_sathis',
            requiresItems: ['resonance_sample'],
            description: 'Deliver the resonance samples to Elder Sathis',
            completedFlag: 'sathis_met'
          }
        ],
        onComplete: [
          { type: 'set_flag',         flag: 'act1_complete' },
          { type: 'remove_items',     items: ['resonance_sample'] },
          { type: 'advance_stage',    quest: 'main_act1', stage: 'act1_complete' }
        ]
      },
      {
        id: 'act1_complete',
        description: 'Act I complete.',
        journalEntry: 'Elder Sathis confirmed the worst: the Thornpillar is not merely dimming — all the Rootstones are. The Dimming is a systematic collapse, not a natural decay. He called it a deliberate unraveling. He showed me something that made my stomach drop: the resonance signatures match a known Underlurk cult ritual. Someone is killing the world from below.',
        objectives: [],
        onComplete: []
      }
    ],
    rewards: {
      gold: 100,
      xp: 300,
      items: [],
      factionRep: { rootwarden_circle: 15 }
    },
    failConditions: [
      { type: 'npc_dead', npcId: 'cael', message: 'Warden Cael has died before you could report your findings.' }
    ],
    chainTo: 'main_act2'
  },

  // ─────────────────────────────────────────────────────────────────────────

  main_act2: {
    id: 'main_act2',
    name: 'The Factions Stir',
    type: 'main',
    act: 2,
    description: 'Elder Sathis needs you to forge an alliance with one of the three major factions. Before the alliance is sealed, Warden Cael is assassinated — and his notes are all that remain.',
    giver: 'elder_sathis',
    autoStart: true,
    chainFrom: 'main_act1',
    stages: [
      {
        id: 'choose_faction',
        description: 'Approach one of three factions and offer alliance on behalf of the Rootwarden Circle.',
        journalEntry: 'Elder Sathis made it plain: the Rootwardens cannot act alone. They need either the political reach of the Auric Concordat, the military force of the Iron Compact, or the hidden knowledge of the Grey Penitents. Each faction has its own agenda. Each will want something in return. I need to choose.',
        objectives: [
          {
            type: 'choice_complete',
            choices: [
              {
                id: 'choose_concordat',
                description: 'Speak with High Consul Varenne Osel in Thornmere',
                target: 'varenne_osel',
                dialogueTree: 'varenne_osel_intro',
                completedFlag: 'concordat_alliance_offered'
              },
              {
                id: 'choose_iron_compact',
                description: 'Speak with Warmaster Kash at the Iron Compact HQ',
                target: 'warmaster_kash',
                dialogueTree: 'warmaster_kash_intro',
                completedFlag: 'iron_compact_alliance_offered'
              },
              {
                id: 'choose_penitents',
                description: 'Speak with Abbess Vonn at the Grey Penitents Monastery',
                target: 'abbess_vonn',
                dialogueTree: 'abbess_vonn_intro',
                completedFlag: 'penitents_alliance_offered'
              }
            ],
            requiresOne: true,
            description: 'Choose one faction to ally with'
          }
        ],
        onComplete: [
          { type: 'set_flag',      flag: 'faction_alliance_chosen' },
          { type: 'advance_stage', quest: 'main_act2', stage: 'return_to_sathis' }
        ]
      },
      {
        id: 'return_to_sathis',
        description: 'Return to Elder Sathis to confirm the alliance.',
        journalEntry: 'I have spoken with the faction leader. Now to confirm this with Elder Sathis before the alliance is official.',
        objectives: [
          {
            type: 'talk_to',
            target: 'elder_sathis',
            dialogueFlag: 'act2_report_alliance',
            description: 'Report the alliance to Elder Sathis',
            completedFlag: 'sathis_alliance_reported'
          }
        ],
        onComplete: [
          { type: 'set_flag',      flag: 'act2_alliance_confirmed' },
          { type: 'advance_stage', quest: 'main_act2', stage: 'cael_assassination' }
        ]
      },
      {
        id: 'cael_assassination',
        description: 'Warden Cael has been murdered. Find his research notes.',
        journalEntry: 'I returned to Greyhollow to find it in shock. Warden Cael was found dead at Station Verath this morning — killed cleanly, arcane residue at the wound. Someone with cult connections knew he was the weakest link. His monitoring station is now a crime scene. But Cael was too careful not to have a backup. I need to find his research notes.',
        isCutscene: true,
        cutsceneId: 'cael_assassination_scene',
        objectives: [
          {
            type: 'collect_item',
            itemId: 'cael_notes',
            location: 'station_verath',
            description: 'Find Cael\'s research notes at Station Verath',
            completedFlag: 'cael_notes_collected'
          }
        ],
        onComplete: [
          { type: 'set_flag',      flag: 'cael_dead' },
          { type: 'set_flag',      flag: 'cael_notes_found' },
          { type: 'advance_stage', quest: 'main_act2', stage: 'act2_complete' }
        ]
      },
      {
        id: 'act2_complete',
        description: 'Act II complete.',
        journalEntry: 'Cael\'s notes are extraordinary. He had traced the Dimming pattern backwards — it isn\'t spreading from the Thornpillar outward. It\'s spreading inward from the Underlurk Chasm. Someone or something below is actively draining the Rootstones from beneath. His last line reads: "I found the access point. Collapsed mine shaft, old Arcanate survey marker 7-E. The cult has been using it for years."',
        objectives: [],
        onComplete: []
      }
    ],
    rewards: {
      gold: 200,
      xp: 500,
      items: ['cael_notes'],
      factionRep: {
        rootwarden_circle: 20,
        conditionalFaction: 'chosen_alliance_faction',
        conditionalRep: 25
      }
    },
    failConditions: [],
    chainTo: 'main_act3'
  },

  // ─────────────────────────────────────────────────────────────────────────

  main_act3: {
    id: 'main_act3',
    name: 'Into the Underlurk',
    type: 'main',
    act: 3,
    description: 'Descend through the collapsed mine shaft into the Underlurk Chasm, find the Hollow Prophet, and retrieve the Sundering Rite ritual document.',
    giver: 'elder_sathis',
    autoStart: true,
    chainFrom: 'main_act2',
    stages: [
      {
        id: 'find_mine_shaft',
        description: 'Locate Arcanate survey marker 7-E and the collapsed mine shaft entrance.',
        journalEntry: 'Cael\'s notes give coordinates: Arcanate survey marker 7-E, roughly two miles south-east of Greyhollow near the old Ironvein Ridge. The mine collapsed thirty years ago in what official records call a "seismic event." Cael\'s notes suggest it was deliberate — someone sealed it from below to hide their passage.',
        objectives: [
          {
            type: 'visit_location',
            target: 'mine_shaft_entrance',
            description: 'Find the collapsed mine shaft (Arcanate marker 7-E)',
            completedFlag: 'mine_shaft_found'
          }
        ],
        onComplete: [
          { type: 'set_flag',      flag: 'underlurk_entrance_unlocked' },
          { type: 'advance_stage', quest: 'main_act3', stage: 'descend_underlurk' }
        ]
      },
      {
        id: 'descend_underlurk',
        description: 'Descend through the Underlurk Chasm. Find the hidden Vorrkai settlement and learn the Hollow Prophet\'s location.',
        journalEntry: 'Below the mine shaft the world opens into something vast and wrong. The Underlurk Chasm is not empty — it is full of bioluminescent life, hanging rock formations, and the distant sound of something enormous moving. I need to navigate to the depths where the Hollow Prophet is said to maintain the Sundering ritual. The Vorrkai who live here might know the way.',
        objectives: [
          {
            type: 'visit_location',
            target: 'underlurk_chasm',
            description: 'Descend into the Underlurk Chasm',
            completedFlag: 'underlurk_entered'
          },
          {
            type: 'talk_to',
            target: 'vorrkai_refugee_elder',
            description: 'Find and speak with the Vorrkai settlement elder',
            completedFlag: 'vorrkai_settlement_found',
            note: 'Sets flag found_vorrkai_settlement, unlocking Zeth Mirrak\'s full dialogue'
          }
        ],
        onComplete: [
          { type: 'set_flag',      flag: 'hollow_prophet_location_known' },
          { type: 'advance_stage', quest: 'main_act3', stage: 'confront_prophet' }
        ]
      },
      {
        id: 'confront_prophet',
        description: 'Fight through the Void Sanctum to confront the Hollow Prophet and steal the Sundering Rite.',
        journalEntry: 'The elder gave me the Prophet\'s location: a void sanctum carved into the deepest point of the Chasm, below the three Void Anchors that are actively draining the Rootstones. The cultists here are numerous and fanatical. I cannot fight through all of them — I need to find the Sundering Rite document and escape before the cult knows what happened.',
        objectives: [
          {
            type: 'enter_location',
            target: 'void_sanctum',
            description: 'Enter the Void Sanctum',
            completedFlag: 'void_sanctum_entered'
          },
          {
            type: 'defeat_or_bypass',
            target: 'hollow_prophet_boss',
            description: 'Confront the Hollow Prophet',
            note: 'Can be fought directly or Sundering Rite can be stolen via stealth (requires sneak 50)',
            completedFlag: 'prophet_confronted',
            alternativePath: {
              type: 'skill_check',
              skill: 'sneak',
              level: 50,
              flag: 'sundering_rite_stolen_stealthily'
            }
          },
          {
            type: 'collect_item',
            itemId: 'sundering_rite',
            description: 'Obtain the Sundering Rite document',
            completedFlag: 'sundering_rite_obtained'
          }
        ],
        onComplete: [
          { type: 'set_flag',      flag: 'sundering_rite_retrieved' },
          { type: 'advance_stage', quest: 'main_act3', stage: 'escape_underlurk' }
        ]
      },
      {
        id: 'escape_underlurk',
        description: 'Escape the Underlurk Chasm before the cult seals the exit.',
        journalEntry: 'I have it. But the cult knows — the alarm is spreading through the tunnels. I need to reach the mine shaft before they seal it. The Vorrkai elder said there is a secondary exit she showed me on her map: a ventilation chimney above the northern cave wall. I have minutes.',
        isTimed: true,
        timerSeconds: 300,
        objectives: [
          {
            type: 'reach_location',
            target: 'underlurk_exit',
            description: 'Escape to the surface',
            completedFlag: 'underlurk_escaped'
          }
        ],
        timerFailMessage: 'You were captured by the cult. The Sundering Rite was reclaimed.',
        onComplete: [
          { type: 'set_flag',      flag: 'act3_complete' },
          { type: 'advance_stage', quest: 'main_act3', stage: 'act3_complete' }
        ]
      },
      {
        id: 'act3_complete',
        description: 'Act III complete.',
        journalEntry: 'I escaped. The Sundering Rite is in my hands — a complete cult ritual for the simultaneous destruction of every remaining Rootstone. But there is something else in the document that the Hollow Prophet\'s identity makes clear: Oren Osel, brother of High Consul Varenne Osel, has been running this cult for twelve years. The Dimming is not a natural catastrophe. It is a political one.',
        objectives: [],
        onComplete: []
      }
    ],
    rewards: {
      gold: 300,
      xp: 800,
      items: [],
      factionRep: { rootwarden_circle: 25, underlurk_cult: -50 }
    },
    failConditions: [
      { type: 'timed_stage_fail', stage: 'escape_underlurk', message: 'You were captured in the Underlurk.' }
    ],
    chainTo: 'main_act4'
  },

  // ─────────────────────────────────────────────────────────────────────────

  main_act4: {
    id: 'main_act4',
    name: 'The Sundering Rite',
    type: 'main',
    act: 4,
    description: 'The Sundering Rite reveals three Void Anchors draining the Rootstones. Destroy them before the Convergence completes — but one Rootstone will fall regardless.',
    giver: 'elder_sathis',
    autoStart: true,
    chainFrom: 'main_act3',
    stages: [
      {
        id: 'decode_rite',
        description: 'Bring the Sundering Rite to Elder Sathis to decode.',
        journalEntry: 'Elder Sathis went pale when I showed him the document. He spent two hours translating it in silence. Then he told me: the cult has already placed three Void Anchors beneath the Rootstones, siphoning their energy into the void-entity below. If all three complete their cycle — the Convergence — every Rootstone falls simultaneously. I asked him how long we have. He said: less than a week.',
        objectives: [
          {
            type: 'talk_to',
            target: 'elder_sathis',
            requiresItems: ['sundering_rite'],
            dialogueFlag: 'act4_decode_rite',
            description: 'Have Elder Sathis decode the Sundering Rite',
            completedFlag: 'sundering_rite_decoded'
          }
        ],
        onComplete: [
          { type: 'set_flag',      flag: 'void_anchors_located' },
          { type: 'give_item',     itemId: 'resonance_sample', quantity: 3 },
          { type: 'advance_stage', quest: 'main_act4', stage: 'destroy_anchors' }
        ]
      },
      {
        id: 'destroy_anchors',
        description: 'Destroy the three Void Anchors before the Convergence completes.',
        journalEntry: 'The three Void Anchors are placed at: the base of the Thornpillar (accessible via the Ossian caves), the eastern Aetherwood root-nexus (guarded by an acolyte cell), and beneath Emberpeak Caldera itself (the most dangerous). Each is defended. Each must be destroyed by channeling a Rootstone resonance sample directly into its core — destroying the anchor and the sample.',
        objectives: [
          {
            type: 'destroy_target',
            target: 'void_anchor_thornpillar',
            location: 'station_ossian',
            requiresItem: 'resonance_sample',
            description: 'Destroy Void Anchor at the Thornpillar base',
            completedFlag: 'void_anchor_1_destroyed'
          },
          {
            type: 'destroy_target',
            target: 'void_anchor_aetherwood',
            location: 'aetherwood_root_nexus',
            requiresItem: 'resonance_sample',
            description: 'Destroy Void Anchor in the Aetherwood root-nexus',
            completedFlag: 'void_anchor_2_destroyed'
          },
          {
            type: 'destroy_target',
            target: 'void_anchor_emberpeak',
            location: 'emberpeak_caldera',
            requiresItem: 'resonance_sample',
            description: 'Destroy Void Anchor beneath Emberpeak Caldera',
            completedFlag: 'void_anchor_3_destroyed'
          }
        ],
        onComplete: [
          { type: 'set_flag',      flag: 'all_void_anchors_destroyed' },
          { type: 'advance_stage', quest: 'main_act4', stage: 'thornpillar_falls' }
        ]
      },
      {
        id: 'thornpillar_falls',
        description: 'Despite your success, the Thornpillar falls.',
        journalEntry: 'We were too late for the Thornpillar. Even as I destroyed the third anchor, the resonance chain had already completed its damage to the Thornpillar\'s core. In the distance, in the direction of Greyhollow, the sky cracked. The Thornpillar — thousands of tons of crystalline rock — began to descend, slowly at first, then faster, into the Underlurk below. A section of eastern Varethos fell with it. Greyhollow survived. Barely.',
        isCutscene: true,
        cutsceneId: 'thornpillar_falls_scene',
        objectives: [
          {
            type: 'witness_event',
            event: 'thornpillar_falls',
            description: 'Witness the fall of the Thornpillar',
            completedFlag: 'thornpillar_fallen'
          }
        ],
        onComplete: [
          { type: 'set_flag',      flag: 'act4_complete' },
          { type: 'world_state',   change: 'thornpillar_destroyed' },
          { type: 'advance_stage', quest: 'main_act4', stage: 'act4_complete' }
        ]
      },
      {
        id: 'act4_complete',
        description: 'Act IV complete.',
        journalEntry: 'The remaining Rootstones are stable — for now. The Void Anchors are destroyed. The Convergence is stopped. But the Thornpillar is gone, and everyone knows it. Elder Sathis says we have weeks, perhaps months, before the void-entity attempts another method. There is one hope: an ancient Rootwarden restoration ritual. He calls it the Kindling. He says he knows the three ingredients. He will not tell me why he looks afraid when he says it.',
        objectives: [],
        onComplete: []
      }
    ],
    rewards: {
      gold: 400,
      xp: 1000,
      items: [],
      factionRep: { rootwarden_circle: 30, underlurk_cult: -100 }
    },
    failConditions: [],
    chainTo: 'main_act5',
    worldStateChange: 'thornpillar_destroyed'
  },

  // ─────────────────────────────────────────────────────────────────────────

  main_act5: {
    id: 'main_act5',
    name: 'The Restoration',
    type: 'main',
    act: 5,
    description: 'Gather the three ingredients for the Kindling ritual and make the final choice: sacrifice Elder Sathis to restore the Rootstones, or delay the restoration and risk another collapse.',
    giver: 'elder_sathis',
    autoStart: true,
    chainFrom: 'main_act4',
    stages: [
      {
        id: 'learn_kindling',
        description: 'Speak with Elder Sathis about the Kindling ritual.',
        journalEntry: 'Elder Sathis finally told me the truth. The Kindling is a Rootwarden founding ritual — the same rite used after the original Shattering to stabilize what little remained. It requires three components: a Sundering Rite burned at the Thornpillar\'s resting place (to seal the wound), a full Voidbloom Weave gathered from the Underlurk floor, and a Willing Anchor — a living conduit who permanently bonds with the Rootstone network to sustain it. He said he would be the Anchor. I asked what that meant. He was quiet for a long time.',
        objectives: [
          {
            type: 'talk_to',
            target: 'elder_sathis',
            dialogueFlag: 'act5_learn_kindling',
            description: 'Speak with Elder Sathis about the Kindling ritual',
            completedFlag: 'kindling_explained'
          }
        ],
        onComplete: [
          { type: 'set_flag',      flag: 'kindling_ritual_known' },
          { type: 'advance_stage', quest: 'main_act5', stage: 'gather_ingredients' }
        ]
      },
      {
        id: 'gather_ingredients',
        description: 'Gather the three ritual components: burn the Sundering Rite, collect the Voidbloom Weave, and confirm Elder Sathis\'s willingness.',
        journalEntry: 'Three tasks. The Sundering Rite must be taken to the Thornpillar\'s resting point — a new chasm edge — and burned with a Rootstone fragment as igniter. The Voidbloom Weave requires at least five Voidblooms gathered from the Underlurk depths and woven at the Rootwarden altar. And I need to speak with Sathis again, because I am not sure he understands that the Willing Anchor does not come back.',
        objectives: [
          {
            type: 'use_item_at_location',
            itemId: 'sundering_rite',
            location: 'thornpillar_chasm_edge',
            description: 'Burn the Sundering Rite at the fallen Thornpillar',
            completedFlag: 'sundering_rite_burned'
          },
          {
            type: 'collect_and_craft',
            ingredientId: 'voidbloom',
            quantity: 5,
            craftLocation: 'rootwarden_altar',
            outputFlag: 'voidbloom_weave_created',
            description: 'Collect 5 Voidblooms from the Underlurk and weave them at the Rootwarden altar',
            completedFlag: 'voidbloom_weave_ready'
          },
          {
            type: 'talk_to',
            target: 'elder_sathis',
            dialogueFlag: 'act5_sathis_willing',
            description: 'Confirm Elder Sathis\'s willingness to serve as the Willing Anchor',
            completedFlag: 'sathis_confirmed_willing'
          }
        ],
        onComplete: [
          { type: 'set_flag',      flag: 'kindling_ready' },
          { type: 'advance_stage', quest: 'main_act5', stage: 'final_choice' }
        ]
      },
      {
        id: 'final_choice',
        description: 'At the Rootwarden Sanctuary, make the final choice: proceed with the Kindling and sacrifice Sathis, or delay and risk the void-entity finding another way.',
        journalEntry: 'The Kindling ritual is ready. Elder Sathis stands at the Sanctuary\'s root altar, calm in a way that terrifies me. He says the Rootstones will hold for perhaps three months without intervention. Long enough for the factions to prepare something else — or to collapse into war over the remaining Shards. He is asking me to make the choice. Not because he doesn\'t know what he wants, but because this decision should not belong to one person.',
        objectives: [
          {
            type: 'player_choice',
            location: 'rootwarden_sanctuary',
            choices: [
              {
                id: 'sacrifice_sathis',
                description: 'Proceed with the Kindling — sacrifice Elder Sathis to restore the Rootstones',
                effect: [
                  { type: 'set_flag',    flag: 'sathis_sacrificed' },
                  { type: 'npc_death',   npcId: 'elder_sathis', type: 'ritual' },
                  { type: 'world_state', change: 'rootstones_restored_partial' }
                ],
                ending: 'ending_restoration'
              },
              {
                id: 'delay_kindling',
                description: 'Refuse the sacrifice — buy time and search for another way',
                effect: [
                  { type: 'set_flag',    flag: 'kindling_delayed' },
                  { type: 'world_state', change: 'rootstones_stabilized_temporary' }
                ],
                ending: 'ending_delay'
              }
            ],
            description: 'Choose the fate of Elder Sathis and the Rootstones',
            completedFlag: 'final_choice_made'
          }
        ],
        onComplete: [
          { type: 'set_flag',      flag: 'act5_complete' },
          { type: 'advance_stage', quest: 'main_act5', stage: 'act5_complete' }
        ]
      },
      {
        id: 'act5_complete',
        description: 'The Dimming is ended — one way or another.',
        journalEntry: {
          sacrifice: 'The ritual is done. The Rootstones glow brighter than they have in years. Elder Sathis is gone — not dead, exactly. He is in the network now, in the roots. Somewhere, something old and rootlike turns toward the warmth of living things and watches over them. Varethos will not fall today. I am not sure whether I made the right choice. I am sure that Sathis would say I did.',
          delay: 'The Kindling waits. Sathis lives. The Rootstones hold — barely, for now. The factions scramble. In three months, if nothing changes, we will face the same choice again. But three months is time. Time for something else to emerge. Time for the world to surprise us. I told Sathis we would find another way. I intend to keep that promise.'
        },
        objectives: [],
        onComplete: [
          { type: 'trigger_ending', conditional: true, flag_sacrifice: 'ending_restoration', flag_delay: 'ending_delay' }
        ]
      }
    ],
    rewards: {
      gold: 1000,
      xp: 3000,
      items: [],
      factionRep: {
        rootwarden_circle: 50,
        conditionalFaction: 'chosen_alliance_faction',
        conditionalRep: 30
      }
    },
    failConditions: [],
    endings: {
      ending_restoration: {
        id: 'ending_restoration',
        title: 'The Kindling',
        description: 'The Rootstones are restored at the cost of Elder Sathis\'s mortal life. Varethos endures. The Dimming is over — for this generation.'
      },
      ending_delay: {
        id: 'ending_delay',
        title: 'Borrowed Time',
        description: 'Sathis lives. The Rootstones hold. The world buys itself three months to find another answer. Whether that answer exists is a question left to the future.'
      }
    },
    isLastAct: true
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SIDE QUESTS
  // ═══════════════════════════════════════════════════════════════════════════

  side_merchant_debt: {
    id: 'side_merchant_debt',
    name: 'The Merchant\'s Debt',
    type: 'side',
    description: 'A traveling Concordat merchant believes a Greyhollow warehouse keeper has been defrauding his clients. Investigate and choose who to help.',
    giver: 'concordat_merchant',
    autoStart: false,
    stages: [
      {
        id: 'accept_job',
        description: 'Speak with Beren Ashvale about the fraud.',
        journalEntry: 'A Concordat merchant named Beren Ashvale pulled me aside on the road between Greyhollow and Thornmere. He says a warehouse keeper in Greyhollow has been skimming from consignment shipments — underdeclaring deliveries and selling the surplus privately. He can\'t prove it without someone accessing the locked warehouse records. He\'s offering coin for the evidence.',
        objectives: [
          {
            type: 'talk_to',
            target: 'concordat_merchant',
            description: 'Speak with Beren Ashvale to accept the investigation',
            completedFlag: 'merchant_debt_accepted'
          }
        ],
        onComplete: [
          { type: 'give_item',     itemId: 'key_greyhollow_warehouse', quantity: 1 },
          { type: 'advance_stage', quest: 'side_merchant_debt', stage: 'investigate_warehouse' }
        ]
      },
      {
        id: 'investigate_warehouse',
        description: 'Search the Greyhollow warehouse for evidence of fraud.',
        journalEntry: 'The merchant has a spare key — says he made a copy during his last visit. I need to search the warehouse records inside. The warehouse keeper himself, a man named Oster, is there during business hours. I\'ll need to either wait until night or find a way to distract him.',
        objectives: [
          {
            type: 'search_location',
            target: 'greyhollow_warehouse',
            itemToFind: 'ledger_evidence',
            sneakOption: true,
            description: 'Search the warehouse for records of fraud',
            completedFlag: 'warehouse_evidence_found'
          }
        ],
        onComplete: [
          { type: 'advance_stage', quest: 'side_merchant_debt', stage: 'decision' }
        ]
      },
      {
        id: 'decision',
        description: 'Decide what to do with the evidence.',
        journalEntry: 'The ledgers are damning — Oster has been at it for years. But there\'s more: a letter tucked behind the false panel from the warehouse owner reveals he\'s been paying Oster to do it, and forwarding the surplus gold to a local family in serious debt. This is more complicated than Ashvale let on.',
        objectives: [
          {
            type: 'player_choice',
            choices: [
              {
                id: 'side_with_merchant',
                description: 'Give evidence to Beren Ashvale — Oster faces Concordat consequences',
                effect: [
                  { type: 'set_flag',      flag: 'merchant_debt_concordat_outcome' },
                  { type: 'change_rep',    faction: 'auric_concordat', amount: 10 },
                  { type: 'change_rep',    faction: 'rootwarden_circle', amount: -5 }
                ]
              },
              {
                id: 'destroy_evidence',
                description: 'Destroy the ledgers — Oster goes free, family keeps their aid',
                effect: [
                  { type: 'set_flag',      flag: 'merchant_debt_destroyed_outcome' },
                  { type: 'change_rep',    faction: 'auric_concordat', amount: -5 }
                ]
              },
              {
                id: 'blackmail_oster',
                description: 'Confront Oster privately and demand a cut',
                requiresSkill: { persuasion: 20 },
                effect: [
                  { type: 'set_flag',      flag: 'merchant_debt_blackmail_outcome' },
                  { type: 'add_gold',      amount: 80 }
                ]
              }
            ],
            description: 'Choose what to do with the evidence',
            completedFlag: 'merchant_debt_decided'
          }
        ],
        onComplete: [
          { type: 'advance_stage', quest: 'side_merchant_debt', stage: 'complete' }
        ]
      },
      {
        id: 'complete',
        description: 'Quest complete.',
        journalEntry: 'The debt is settled — one way or another. Whether justice was served depends on what you think justice looks like in a world where the sky is held up by crystals and the law is sold by merchants.',
        objectives: [],
        onComplete: []
      }
    ],
    rewards: {
      gold: { concordat: 80, destroy: 20, blackmail: 80 },
      xp: 150,
      items: [],
      factionRep: {}
    },
    failConditions: []
  },

  // ─────────────────────────────────────────────────────────────────────────

  side_woven_lament: {
    id: 'side_woven_lament',
    name: 'The Woven\'s Lament',
    type: 'side',
    description: 'A Sylveni druid\'s apprentice has vanished in the Aetherwood. The trees are wrong. Something is corrupting the Woven — the Rootstone-linked tree spirits that protect the forest.',
    giver: 'wandering_sylveni_druid',
    autoStart: false,
    stages: [
      {
        id: 'meet_aelindra',
        description: 'Speak with the Sylveni druid Aelindra in the Aetherwood.',
        journalEntry: 'A silver-haired Sylveni woman intercepted me at the Aetherwood edge. She is a druid named Aelindra, and she is barely holding herself together. Her apprentice — a young Sylveni named Vel — went into the deep Aetherwood three days ago to commune with the Woven and has not returned. She says the Woven have been behaving strangely since the Dimming accelerated: answering in different voices, leading travelers in circles, growing cold.',
        objectives: [
          {
            type: 'talk_to',
            target: 'wandering_sylveni_druid',
            description: 'Speak with Aelindra about her missing apprentice',
            completedFlag: 'woven_lament_accepted'
          }
        ],
        onComplete: [
          { type: 'advance_stage', quest: 'side_woven_lament', stage: 'search_aetherwood' }
        ]
      },
      {
        id: 'search_aetherwood',
        description: 'Search the deep Aetherwood for signs of the missing apprentice.',
        journalEntry: 'The deep Aetherwood is disorienting even with Aelindra\'s hand-drawn map. The trees here are old enough that their roots break the surface in arches you could walk under. The Woven — normally gentle luminescent presences around the ancient oaks — are dim and slow. One reached for me with a root as I passed. Not to hurt me. I think it was asking for help.',
        objectives: [
          {
            type: 'search_area',
            target: 'aetherwood_deep',
            clues: ['torn_apprentice_robe', 'disturbed_rootmoss', 'void_residue_marking'],
            description: 'Find clues about the apprentice\'s location',
            completedFlag: 'aetherwood_clues_found'
          }
        ],
        onComplete: [
          { type: 'set_flag',      flag: 'corrupted_woven_discovered' },
          { type: 'advance_stage', quest: 'side_woven_lament', stage: 'find_apprentice' }
        ]
      },
      {
        id: 'find_apprentice',
        description: 'The clues point to the Heart Grove — find the apprentice there.',
        journalEntry: 'The void residue markings form a trail. They lead to the Heart Grove — the oldest part of the Aetherwood, where the largest Woven spirit sleeps inside a hollow oak the size of a building. The Sylveni consider it sacred and off-limits to non-Sylveni. I\'m going in anyway.',
        objectives: [
          {
            type: 'defeat_enemies',
            enemies: ['corrupted_woven'],
            count: 3,
            description: 'Defeat the corrupted Woven spirits guarding the Heart Grove',
            completedFlag: 'corrupted_woven_defeated'
          },
          {
            type: 'find_npc',
            target: 'vel_apprentice',
            location: 'aetherwood_heart_grove',
            description: 'Find the apprentice Vel inside the Heart Grove',
            completedFlag: 'vel_found'
          }
        ],
        onComplete: [
          { type: 'advance_stage', quest: 'side_woven_lament', stage: 'cleanse_woven' }
        ]
      },
      {
        id: 'cleanse_woven',
        description: 'The apprentice is alive but merged with a corrupted Woven spirit. Cleanse it.',
        journalEntry: 'Vel is inside the hollow oak, bonded — willingly or not — with the great Woven. The spirit\'s corruption has spread to him. He\'s not dying. He\'s changing. Aelindra (who followed me) says we can cleanse the Woven if we plant a Voidbloom at the root node and channel a Rootstone fragment through it — but this will sever Vel\'s bond permanently. He says he does not want it severed. He says the Woven is showing him things.',
        objectives: [
          {
            type: 'player_choice',
            choices: [
              {
                id: 'cleanse_woven_choice',
                description: 'Force the cleansing — sever Vel\'s bond, save him and the forest',
                requiresItems: ['voidbloom', 'rootstone_fragment'],
                effect: [
                  { type: 'set_flag',      flag: 'woven_cleansed' },
                  { type: 'change_rep',    faction: 'rootwarden_circle', amount: 15 }
                ]
              },
              {
                id: 'honor_vel_choice',
                description: 'Leave Vel bonded — trust his judgment, let the Woven show him its truth',
                effect: [
                  { type: 'set_flag',      flag: 'vel_remains_bonded' },
                  { type: 'change_rep',    faction: 'rootwarden_circle', amount: 10 },
                  { type: 'set_flag',      flag: 'vel_oracle_unlocked', note: 'Vel becomes an oracle NPC in Aetherwood' }
                ]
              }
            ],
            description: 'Choose the fate of Vel and the Woven spirit',
            completedFlag: 'woven_fate_decided'
          }
        ],
        onComplete: [
          { type: 'advance_stage', quest: 'side_woven_lament', stage: 'complete' }
        ]
      },
      {
        id: 'complete',
        description: 'Quest complete.',
        journalEntry: {
          cleansed: 'The corruption is gone. The Aetherwood breathes differently now — less tight, less afraid. Vel is himself again, though quieter than Aelindra remembers. He says the Woven showed him the Underlurk. He says it is not empty. But he cannot tell you anything specific. The memories are already fading.',
          bonded: 'Vel remains with the Woven. Aelindra grieves and accepts it, as Sylveni do. In the weeks that follow, travelers in the Aetherwood report that the ancient oak speaks now — asking questions that feel like warnings.'
        },
        objectives: [],
        onComplete: []
      }
    ],
    rewards: {
      gold: 75,
      xp: 200,
      items: ['rootmoss', 'emberpetal'],
      factionRep: { rootwarden_circle: 15 }
    },
    failConditions: []
  },

  // ─────────────────────────────────────────────────────────────────────────

  side_iron_blood: {
    id: 'side_iron_blood',
    name: 'Iron and Blood',
    type: 'side',
    description: 'A deserter from the Iron Compact witnessed a massacre of Vorrkai refugees. He has evidence — but going public could ignite a war or end a career.',
    giver: 'iron_compact_deserter',
    autoStart: false,
    stages: [
      {
        id: 'find_gerran',
        description: 'Find and speak with the frightened deserter near the Iron Compact HQ.',
        journalEntry: 'I found him at an abandoned farmstead south of Thornmere — a gaunt man named Gerran Solt, Iron Compact uniform stripped down to nothing identifiable. He needed three minutes just to look me in the eye. He was stationed at a Compact forward post near the Underlurk Chasm access. He says he watched his unit execute a group of Vorrkai refugees seeking passage to the surface. He kept the orders scroll. He says Warmaster Kash signed it.',
        objectives: [
          {
            type: 'talk_to',
            target: 'iron_compact_deserter',
            description: 'Speak with Gerran Solt and hear his account',
            completedFlag: 'gerran_met'
          }
        ],
        onComplete: [
          { type: 'advance_stage', quest: 'side_iron_blood', stage: 'retrieve_evidence' }
        ]
      },
      {
        id: 'retrieve_evidence',
        description: 'Retrieve the orders scroll from the farmhouse floorboards.',
        journalEntry: 'Gerran hid the scroll under the third floorboard from the east wall of the farmhouse — he shows me exactly where. The farmstead is watched: two Compact deserter-hunters have been circling the area for days. They are here for him.',
        objectives: [
          {
            type: 'collect_item',
            itemId: 'massacre_orders',
            location: 'abandoned_farmstead',
            description: 'Retrieve the orders scroll from the farmhouse',
            completedFlag: 'evidence_retrieved'
          },
          {
            type: 'optional_defeat',
            enemies: ['compact_deserter_hunter'],
            count: 2,
            description: '(Optional) Defeat the deserter-hunters threatening Gerran',
            completedFlag: 'hunters_defeated',
            isOptional: true
          }
        ],
        onComplete: [
          { type: 'advance_stage', quest: 'side_iron_blood', stage: 'decide_evidence' }
        ]
      },
      {
        id: 'decide_evidence',
        description: 'Decide what to do with the massacre evidence.',
        journalEntry: 'The scroll is real. Kash\'s seal is unmistakable. This could destroy the Iron Compact alliance Sathis is trying to build — or it could be used as leverage to reshape the Compact\'s behavior. Or it could disappear entirely. The Vorrkai dead cannot speak for themselves. Gerran says he just wants someone to know it happened.',
        objectives: [
          {
            type: 'player_choice',
            choices: [
              {
                id: 'expose_compact',
                description: 'Deliver evidence to the Auric Concordat — public accountability',
                effect: [
                  { type: 'set_flag',      flag: 'iron_blood_exposed' },
                  { type: 'change_rep',    faction: 'iron_compact', amount: -30 },
                  { type: 'change_rep',    faction: 'auric_concordat', amount: 15 },
                  { type: 'change_rep',    faction: 'rootwarden_circle', amount: 10 }
                ]
              },
              {
                id: 'leverage_kash',
                description: 'Confront Warmaster Kash privately — demand policy change as price of silence',
                requiresSkill: { persuasion: 35 },
                effect: [
                  { type: 'set_flag',      flag: 'iron_blood_leverage' },
                  { type: 'change_rep',    faction: 'iron_compact', amount: -10 },
                  { type: 'unlock_dialogue', npcId: 'warmaster_kash', dialogueId: 'kash_blackmail' }
                ]
              },
              {
                id: 'bury_evidence',
                description: 'Burn the scroll — what\'s done is done, protect the alliance',
                effect: [
                  { type: 'set_flag',      flag: 'iron_blood_buried' },
                  { type: 'change_rep',    faction: 'iron_compact', amount: 10 },
                  { type: 'change_rep',    faction: 'rootwarden_circle', amount: -10 }
                ]
              }
            ],
            description: 'Decide what to do with the evidence',
            completedFlag: 'iron_blood_decided'
          }
        ],
        onComplete: [
          { type: 'advance_stage', quest: 'side_iron_blood', stage: 'complete' }
        ]
      },
      {
        id: 'complete',
        description: 'Quest complete.',
        journalEntry: {
          exposed: 'The Concordat makes it political, of course. But Gerran\'s testimony is on record. The Vorrkai deaths are on record. The Iron Compact loses face publicly. Kash responds by tripling border patrols. The atmosphere in Thornmere goes very cold.',
          leverage: 'Kash listened. The calculation in her eyes was something to see. She agreed to your terms — for now. She is not a woman who stays leveraged for long. You have bought something, but you are not sure how long before the cost comes due.',
          buried: 'The scroll is ash. Gerran disappears quietly into Greyhollow, using a different name. The Compact alliance holds. Whether that was worth it is a question the dead cannot weigh in on.'
        },
        objectives: [],
        onComplete: []
      }
    ],
    rewards: {
      gold: 100,
      xp: 175,
      items: [],
      factionRep: {}
    },
    failConditions: [
      { type: 'npc_dead', npcId: 'iron_compact_deserter', message: 'Gerran Solt was killed before he could share his evidence.' }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────

  side_alchemist_garden: {
    id: 'side_alchemist_garden',
    name: 'The Alchemist\'s Garden',
    type: 'side',
    description: 'Master Alchemist Syllis Vaar is dying of an alchemical degenerative condition. She needs three rare herbs for a final treatment. She can no longer travel to collect them herself.',
    giver: 'thornmere_alchemist',
    autoStart: false,
    stages: [
      {
        id: 'speak_with_syllis',
        description: 'Speak with Syllis Vaar at her alchemy shop in Thornmere.',
        journalEntry: 'The alchemist Syllis Vaar in Thornmere asked me to stay after I bought supplies. She showed me her hands — the tremor is bad now, worse than it looks. She has been synthesizing an experimental longevity treatment for forty years. She\'s close. But the final formula requires three herbs she can no longer travel to gather herself: Emberpetal from Emberpeak\'s south slope, Voidbloom from the Underlurk shallows, and Rootmoss from directly below the Thornpillar\'s base (or its resting point, post-collapse). She has perhaps six weeks.',
        objectives: [
          {
            type: 'talk_to',
            target: 'thornmere_alchemist',
            description: 'Accept Syllis Vaar\'s request for rare herbs',
            completedFlag: 'alchemist_garden_accepted'
          }
        ],
        onComplete: [
          { type: 'advance_stage', quest: 'side_alchemist_garden', stage: 'gather_herbs' }
        ]
      },
      {
        id: 'gather_herbs',
        description: 'Gather the three rare herbs Syllis needs.',
        journalEntry: 'Three specific locations, three herbs. The Emberpetal from the south slope of Emberpeak requires navigating past lava salamander territory. The Voidbloom grows in the Underlurk shallows — the upper cave systems, not the deep cultist territory. The Rootmoss near the Thornpillar base is still accessible but partially collapsed. Each will take careful work.',
        objectives: [
          {
            type: 'collect_item',
            itemId: 'emberpetal',
            quantity: 3,
            location: 'emberpeak_south_slope',
            description: 'Collect 3 Emberpetals from the Emberpeak south slope',
            completedFlag: 'emberpetal_gathered'
          },
          {
            type: 'collect_item',
            itemId: 'voidbloom',
            quantity: 2,
            location: 'underlurk_shallows',
            description: 'Collect 2 Voidblooms from the Underlurk shallows',
            completedFlag: 'voidbloom_gathered'
          },
          {
            type: 'collect_item',
            itemId: 'rootmoss',
            quantity: 4,
            location: 'thornpillar_base',
            description: 'Collect 4 Rootmoss samples from the Thornpillar base',
            completedFlag: 'rootmoss_gathered'
          }
        ],
        onComplete: [
          { type: 'advance_stage', quest: 'side_alchemist_garden', stage: 'return_to_syllis' }
        ]
      },
      {
        id: 'return_to_syllis',
        description: 'Return the herbs to Syllis Vaar.',
        journalEntry: 'The herbs are gathered. Back to Thornmere.',
        objectives: [
          {
            type: 'talk_to',
            target: 'thornmere_alchemist',
            requiresItems: ['emberpetal', 'voidbloom', 'rootmoss'],
            description: 'Return the herbs to Syllis Vaar',
            completedFlag: 'herbs_delivered'
          }
        ],
        onComplete: [
          { type: 'remove_items',  items: ['emberpetal', 'voidbloom', 'rootmoss'] },
          { type: 'advance_stage', quest: 'side_alchemist_garden', stage: 'complete' }
        ]
      },
      {
        id: 'complete',
        description: 'Quest complete.',
        journalEntry: 'Syllis was quiet for a long time after she received the herbs. She brewed the treatment that night. Two weeks later, the tremor in her hands was measurably reduced. She sent a note saying she expects another year at least. One more year to finish her work. She did not say what the work is. The alchemy shop stayed open. That seemed like enough.',
        objectives: [],
        onComplete: []
      }
    ],
    rewards: {
      gold: 120,
      xp: 180,
      items: ['health_potion', 'mana_potion', 'antidote'],
      factionRep: {},
      specialReward: { type: 'unlock_recipe', recipeId: 'recipe_rootstone_elixir', note: 'Syllis teaches the player the rare Rootstone Elixir recipe' }
    },
    failConditions: [
      { type: 'time_elapsed_days', days: 42, message: 'Syllis Vaar passed away before you could return with the herbs.' }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────

  side_hollow_name: {
    id: 'side_hollow_name',
    name: 'The Hollow Name',
    type: 'side',
    description: 'Brother Vel, a Grey Penitent monk, believes knowing the void-entity\'s true name could bind it. Four ancient monoliths in the Underlurk contain fragments of this name.',
    giver: 'grey_penitent_monk',
    autoStart: false,
    stages: [
      {
        id: 'speak_with_vel_monk',
        description: 'Speak with Brother Vel in the Grey Penitents\' scriptorium.',
        journalEntry: 'A monk named Brother Vel intercepted me at the monastery with the intensity of a man who has been waiting for exactly me. He has spent seventeen years — since he was twelve years old — transcribing every reference to the Underlurk void-entity in the Penitents\' archive. He believes the entity has a true name, and that speaking it in the right configuration would bind it in place permanently. Four monoliths in the Underlurk, carved before the Shattering, contain the name fragmented across them. No one has visited all four and returned with the full text.',
        objectives: [
          {
            type: 'talk_to',
            target: 'grey_penitent_monk',
            description: 'Hear Brother Vel\'s theory and accept the quest',
            completedFlag: 'hollow_name_accepted'
          }
        ],
        onComplete: [
          { type: 'advance_stage', quest: 'side_hollow_name', stage: 'read_monoliths' }
        ]
      },
      {
        id: 'read_monoliths',
        description: 'Find and transcribe all four monoliths in the Underlurk.',
        journalEntry: 'Brother Vel has the locations from old Arcanate survey maps: one in the Underlurk upper shallows, one near the Vorrkai settlement (Zeth Mirrak will know of it), one inside an abandoned cult shrine, and one below the Void Sanctum itself — the most dangerous. He provides a rubbing-cloth so I can copy each inscription without needing to understand the language.',
        objectives: [
          {
            type: 'interact_with',
            target: 'monolith_upper_shallows',
            location: 'underlurk_shallows',
            description: 'Transcribe the first monolith (upper Underlurk shallows)',
            completedFlag: 'monolith_1_read'
          },
          {
            type: 'interact_with',
            target: 'monolith_vorrkai_territory',
            location: 'underlurk_vorrkai_settlement',
            description: 'Transcribe the second monolith (near Vorrkai settlement)',
            completedFlag: 'monolith_2_read',
            hint: 'Zeth Mirrak knows where this one is buried'
          },
          {
            type: 'interact_with',
            target: 'monolith_cult_shrine',
            location: 'underlurk_abandoned_shrine',
            description: 'Transcribe the third monolith (abandoned cult shrine)',
            completedFlag: 'monolith_3_read'
          },
          {
            type: 'interact_with',
            target: 'monolith_void_sanctum_base',
            location: 'void_sanctum',
            description: 'Transcribe the fourth monolith (beneath the Void Sanctum)',
            completedFlag: 'monolith_4_read',
            difficulty: 'requires combat or high stealth'
          }
        ],
        onComplete: [
          { type: 'advance_stage', quest: 'side_hollow_name', stage: 'return_transcriptions' }
        ]
      },
      {
        id: 'return_transcriptions',
        description: 'Return to Brother Vel with the four transcriptions.',
        journalEntry: 'All four monoliths copied. The text fragments look like nothing I\'ve ever seen — pre-Shattering script, or possibly older. Back to the monastery.',
        objectives: [
          {
            type: 'talk_to',
            target: 'grey_penitent_monk',
            description: 'Deliver the four transcriptions to Brother Vel',
            completedFlag: 'transcriptions_delivered'
          }
        ],
        onComplete: [
          { type: 'advance_stage', quest: 'side_hollow_name', stage: 'the_name' }
        ]
      },
      {
        id: 'the_name',
        description: 'Brother Vel assembles the name — and asks what to do with it.',
        journalEntry: 'Vel worked through the night. By morning he had it. He wrote the assembled name on a single sheet of parchment and showed it to me. It looked like nothing. It felt like an abyss. Vel said he cannot speak it — his voice is wrong. He says only someone who has been to the Underlurk, who has heard the entity\'s presence directly, can speak it correctly. He is asking me to decide whether to use it.',
        objectives: [
          {
            type: 'player_choice',
            choices: [
              {
                id: 'speak_the_name',
                description: 'Take the name and speak it in the Void Sanctum — attempt to bind the entity',
                requiresFlag: 'void_sanctum_entered',
                effect: [
                  { type: 'set_flag',  flag: 'void_entity_name_spoken' },
                  { type: 'set_flag',  flag: 'void_entity_partially_bound', note: 'Makes the final boss fight easier' },
                  { type: 'world_state', change: 'void_entity_weakened' }
                ]
              },
              {
                id: 'archive_the_name',
                description: 'Give the name to Abbess Vonn for safekeeping — too dangerous to use now',
                effect: [
                  { type: 'set_flag',    flag: 'void_name_archived' },
                  { type: 'change_rep',  faction: 'grey_penitents', amount: 25 }
                ]
              },
              {
                id: 'destroy_the_name',
                description: 'Burn the parchment — some things should not be known or used',
                effect: [
                  { type: 'set_flag',    flag: 'void_name_destroyed' },
                  { type: 'change_rep',  faction: 'grey_penitents', amount: 10 },
                  { type: 'change_rep',  faction: 'rootwarden_circle', amount: 10 }
                ]
              }
            ],
            description: 'Decide what to do with the void-entity\'s name',
            completedFlag: 'hollow_name_decided'
          }
        ],
        onComplete: [
          { type: 'advance_stage', quest: 'side_hollow_name', stage: 'complete' }
        ]
      },
      {
        id: 'complete',
        description: 'Quest complete.',
        journalEntry: {
          spoken: 'The name hangs in the air of the Void Sanctum. Something responds — not painfully, more like a door closing in the far distance. Whether it holds depends on what comes next. Vel sends a note: "You said it correctly. I am glad you were the one to say it."',
          archived: 'The name sits in the Penitents\' vault under three locks and a wax seal. Abbess Vonn does not say whether she intends to use it. That, too, may be a kind of mercy.',
          destroyed: 'The parchment burns fast and hot. Vel watches it go without protest. "I wondered," he says, "whether knowing it would have been enough." He goes back to the scriptorium. Some questions do not require answers to be worth asking.'
        },
        objectives: [],
        onComplete: []
      }
    ],
    rewards: {
      gold: 60,
      xp: 220,
      items: ['mana_potion', 'health_potion'],
      factionRep: { grey_penitents: 20 },
      conditionalReward: {
        flag: 'void_entity_partially_bound',
        note: 'If name was spoken: final boss has 20% less max health and lacks Void Regeneration ability'
      }
    },
    failConditions: []
  },

  side_arcanate_engine: {
    id: 'side_arcanate_engine',
    name: 'The 48th Engine',
    type: 'side',
    description: 'The Arcanate activated 47 Resonance Engines. The historical record lists 48. The last one was sealed, not destroyed. The Grey Penitents have found it.',
    giver: 'abbess_vonn',
    location: 'arcanate_ruins',
    stages: [
      {
        id: 'learn_of_engine',
        label: 'Speak with Abbess Vonn about the 48th Engine',
        objectives: [
          { type: 'npc_talked_to', target: 'abbess_vonn', label: 'Speak with Abbess Vonn' }
        ],
        onComplete: []
      },
      {
        id: 'find_engine_core',
        label: 'Find the Resonance Engine Core in the Arcanate Ruins',
        objectives: [
          { type: 'item_collected', target: 'engine_core_data', quantity: 1, label: 'Retrieve Engine Core data (Arcanate Ruins)' }
        ],
        onComplete: []
      },
      {
        id: 'choose_engine_fate',
        label: 'Decide what to do with the 48th Engine',
        objectives: [],
        choices: [
          {
            id: 'activate_engine',
            label: 'Activate the engine',
            description: 'Restore partial Rootstone resonance — but release unstable energy into the region.',
            effect: { setFlag: 'engine_activated', factionRep: { rootwardens: 15, grey_penitents: -10 } },
            note: 'If engine_activated: Act 5 Kindling costs less — Sathis dissolution may be partially reversible'
          },
          {
            id: 'sabotage_engine',
            label: 'Sabotage the engine',
            description: 'Safe choice. The knowledge is lost but no one gets hurt.',
            effect: { setFlag: 'engine_sabotaged', factionRep: { grey_penitents: 5 } }
          },
          {
            id: 'give_data_to_penitents',
            label: 'Deliver the core data to the Grey Penitents',
            description: 'The knowledge is preserved for future study. No immediate effect.',
            effect: { setFlag: 'engine_data_preserved', factionRep: { grey_penitents: 20 } }
          }
        ],
        onComplete: []
      },
      {
        id: 'side_arcanate_engine_complete',
        label: 'Quest complete',
        objectives: [],
        onComplete: []
      }
    ],
    rewards: {
      gold: 90,
      xp: 350,
      items: ['arcanate_crystal'],
      factionRep: { grey_penitents: 15 }
    },
    failConditions: []
  },

  side_last_ashveil: {
    id: 'side_last_ashveil',
    name: 'The Last Light of Ashveil',
    type: 'side',
    description: 'The Ashveil Stone is dying. The people of Ashveil Outpost have lived in its light for generations. Maren Ashveil, the outpost elder, asks you to help her decide how to face the end.',
    giver: 'maren_ashveil',
    location: 'ashveil_outpost',
    stages: [
      {
        id: 'meet_maren',
        label: 'Speak with Maren Ashveil at the Ashveil Outpost',
        objectives: [
          { type: 'npc_talked_to', target: 'maren_ashveil', label: 'Find Maren Ashveil' }
        ],
        onComplete: []
      },
      {
        id: 'find_shrine',
        label: 'Find the Ashveil Stone shrine',
        objectives: [
          { type: 'location_reached', target: 'ashveil_outpost', label: 'Reach the Ashveil Stone shrine' }
        ],
        onComplete: []
      },
      {
        id: 'study_stone',
        label: 'Study the Ashveil Stone (requires a resonance sample)',
        objectives: [
          { type: 'item_collected', target: 'ashveil_reading', quantity: 1, label: 'Take resonance readings of the Ashveil Stone' }
        ],
        onComplete: []
      },
      {
        id: 'decide_stone_fate',
        label: 'Return to Maren with your findings and decide the stone\'s fate',
        objectives: [
          { type: 'npc_talked_to', target: 'maren_ashveil', label: 'Report to Maren Ashveil' }
        ],
        choices: [
          {
            id: 'accelerate_end',
            label: 'Accelerate the end — let the people relocate',
            description: 'A mercy. The stone ends cleanly; the community moves on with time to plan.',
            effect: { setFlag: 'ashveil_mercy_end', factionRep: { rootwardens: 10 } }
          },
          {
            id: 'slow_decline',
            label: 'Apply Voidbloom Weave — buy more years',
            description: 'Slows the decay significantly. The town survives another generation. But the problem remains.',
            effect: { setFlag: 'ashveil_delayed', requireItem: 'voidbloom_weave', factionRep: { grey_penitents: 15 } }
          },
          {
            id: 'let_it_be',
            label: 'Leave it be — let the town wait',
            description: 'Honour the community\'s wish to remain until the last light.',
            effect: { setFlag: 'ashveil_unchanged' }
          }
        ],
        onComplete: []
      },
      {
        id: 'side_last_ashveil_complete',
        label: 'Quest complete',
        objectives: [],
        onComplete: []
      }
    ],
    rewards: {
      gold: 75,
      xp: 280,
      items: ['ashveil_salt', 'ashveil_coat'],
      factionRep: { rootwardens: 10 }
    },
    failConditions: []
  }
};

// ─── HELPER FUNCTIONS ──────────────────────────────────────────────────────

/**
 * Returns a quest definition by id.
 * @param {string} id
 * @returns {object|null}
 */
export function getQuest(id) {
  return QUESTS[id] || null;
}

/**
 * Returns all main quest entries, in act order.
 * @returns {object[]}
 */
export function getMainQuests() {
  return Object.values(QUESTS)
    .filter(q => q.type === 'main')
    .sort((a, b) => (a.act || 0) - (b.act || 0));
}

/**
 * Returns all side quest entries.
 * @returns {object[]}
 */
export function getSideQuests() {
  return Object.values(QUESTS).filter(q => q.type === 'side');
}

/**
 * Returns the stage definition within a quest by stage id.
 * @param {string} questId
 * @param {string} stageId
 * @returns {object|null}
 */
export function getQuestStage(questId, stageId) {
  const quest = QUESTS[questId];
  if (!quest) return null;
  return quest.stages.find(s => s.id === stageId) || null;
}
