// Dialogue tree definitions for Aethermoor — pure data, no class logic
// Each tree has a root node id and a flat map of node id → node definition.
// Conditions: has_flag, skill_gte, rep_gte, has_item, quest_active, quest_complete, race_is
// Effects: set_flag, give_item, change_rep, start_quest, advance_quest, add_gold, unlock_dialogue

export const DIALOGUE_TREES = {

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. CAEL — INTRODUCTION (triggers main quest)
  // ═══════════════════════════════════════════════════════════════════════════

  cael_intro: {
    root: 'cael_greet',
    nodes: {
      cael_greet: {
        id: 'cael_greet',
        speaker: 'cael',
        portrait: 'portrait_cael',
        text: 'Thank the Rootstones, a traveler! I am Warden Cael of the Rootwarden Circle. Please — I need help. The Thornpillar is dimming, and three of our monitoring stations have gone silent. Are you willing to assist?',
        choices: [
          {
            text: 'What is the Thornpillar?',
            conditions: [],
            effects: [],
            next: 'cael_explain_thornpillar'
          },
          {
            text: 'What happened to the monitoring stations?',
            conditions: [],
            effects: [],
            next: 'cael_explain_stations'
          },
          {
            text: 'I\'ll help. What do I need to do?',
            conditions: [],
            effects: [
              { type: 'set_flag',   flag: 'cael_quest_accepted' },
              { type: 'start_quest', questId: 'main_act1' }
            ],
            next: 'cael_quest_briefing'
          },
          {
            text: 'I have other matters to attend to.',
            conditions: [],
            effects: [],
            next: null
          }
        ]
      },

      cael_explain_thornpillar: {
        id: 'cael_explain_thornpillar',
        speaker: 'cael',
        portrait: 'portrait_cael',
        text: 'The Thornpillar is one of the great Rootstones — a massive crystalline formation that reaches from deep below into the sky above us. The Rootstones are what hold the Shards of Aethermoor aloft above the Underlurk abyss. Without them, everything falls. The Thornpillar is the one nearest to Greyhollow. It is the one that is dying.',
        choices: [
          {
            text: 'What do you mean, dying?',
            conditions: [],
            effects: [],
            next: 'cael_explain_dimming'
          },
          {
            text: 'Tell me about the monitoring stations.',
            conditions: [],
            effects: [],
            next: 'cael_explain_stations'
          },
          {
            text: 'I\'ve heard enough. I\'ll help.',
            conditions: [],
            effects: [
              { type: 'set_flag',   flag: 'cael_quest_accepted' },
              { type: 'start_quest', questId: 'main_act1' }
            ],
            next: 'cael_quest_briefing'
          }
        ]
      },

      cael_explain_dimming: {
        id: 'cael_explain_dimming',
        speaker: 'cael',
        portrait: 'portrait_cael',
        text: 'Its resonance is decreasing. The light output has dropped fourteen percent in the last three months — which sounds small, but the rate is accelerating. We have monitoring stations that measure the crystalline output and transmit resonance data. Three of those stations went silent eight days ago. Without their data, we cannot determine the rate or cause. That is what I need — someone to investigate what happened at each station and retrieve the data crystals.',
        choices: [
          {
            text: 'Where are the stations?',
            conditions: [],
            effects: [],
            next: 'cael_station_locations'
          },
          {
            text: 'Why can\'t you do this yourself?',
            conditions: [],
            effects: [],
            next: 'cael_why_not_himself'
          },
          {
            text: 'I\'ll take the job.',
            conditions: [],
            effects: [
              { type: 'set_flag',   flag: 'cael_quest_accepted' },
              { type: 'start_quest', questId: 'main_act1' }
            ],
            next: 'cael_quest_briefing'
          }
        ]
      },

      cael_explain_stations: {
        id: 'cael_explain_stations',
        speaker: 'cael',
        portrait: 'portrait_cael',
        text: 'We maintain three stations in the hills around the Thornpillar: Station Verath in the north foothills, Station Ossian in the cave system below the pillar itself, and Station Keld on the eastern ridge. Each has a resonance collector — a crystal vial that absorbs and stores the Thornpillar\'s output data. I need those vials retrieved and brought to Elder Sathis at our Sanctuary in the Aetherwood.',
        choices: [
          {
            text: 'Why did they go silent?',
            conditions: [],
            effects: [],
            next: 'cael_stations_silent_reason'
          },
          {
            text: 'Who is Elder Sathis?',
            conditions: [],
            effects: [],
            next: 'cael_about_sathis'
          },
          {
            text: 'I understand. I\'ll retrieve the data.',
            conditions: [],
            effects: [
              { type: 'set_flag',   flag: 'cael_quest_accepted' },
              { type: 'start_quest', questId: 'main_act1' }
            ],
            next: 'cael_quest_briefing'
          }
        ]
      },

      cael_stations_silent_reason: {
        id: 'cael_stations_silent_reason',
        speaker: 'cael',
        portrait: 'portrait_cael',
        text: 'I don\'t know. That\'s what frightens me. The most optimistic explanation is equipment failure. But all three going silent within two days of each other... I\'ve been trying not to think about the less optimistic explanations.',
        choices: [
          {
            text: 'You think someone did this deliberately.',
            conditions: [],
            effects: [],
            next: 'cael_deliberate_suspicion'
          },
          {
            text: 'I\'ll find out what happened.',
            conditions: [],
            effects: [
              { type: 'set_flag',   flag: 'cael_quest_accepted' },
              { type: 'start_quest', questId: 'main_act1' }
            ],
            next: 'cael_quest_briefing'
          }
        ]
      },

      cael_deliberate_suspicion: {
        id: 'cael_deliberate_suspicion',
        speaker: 'cael',
        portrait: 'portrait_cael',
        text: 'I think it\'s possible. There are... groups who would benefit from the Rootwardens being blind to what\'s happening with the Thornpillar. But I\'m getting ahead of myself. Right now I just need the data. Will you help?',
        choices: [
          {
            text: 'Yes. Tell me where to go.',
            conditions: [],
            effects: [
              { type: 'set_flag',   flag: 'cael_quest_accepted' },
              { type: 'start_quest', questId: 'main_act1' }
            ],
            next: 'cael_quest_briefing'
          },
          {
            text: 'I need more information before I commit.',
            conditions: [],
            effects: [],
            next: 'cael_explain_stations'
          }
        ]
      },

      cael_why_not_himself: {
        id: 'cael_why_not_himself',
        speaker: 'cael',
        portrait: 'portrait_cael',
        text: '(He looks down.) I tried. Station Verath — the closest — I made it halfway before I heard... something in the undergrowth. I ran. I\'m not proud of it. I\'m a scholar, not a fighter. The Rootwarden Circle isn\'t known for its combat training. I need someone who can handle themselves in territory that has apparently become dangerous.',
        choices: [
          {
            text: 'I can handle myself. I\'ll go.',
            conditions: [],
            effects: [
              { type: 'set_flag',   flag: 'cael_quest_accepted' },
              { type: 'start_quest', questId: 'main_act1' }
            ],
            next: 'cael_quest_briefing'
          },
          {
            text: 'What were you afraid of?',
            conditions: [],
            effects: [],
            next: 'cael_fear_detail'
          }
        ]
      },

      cael_fear_detail: {
        id: 'cael_fear_detail',
        speaker: 'cael',
        portrait: 'portrait_cael',
        text: 'I heard chanting. Low, rhythmic, wrong — not any language I recognized. And I smelled something burnt but cold. Like lightning had struck somewhere underground. I am a Rootwarden scholar. I know what void-residue smells like from texts. I have never smelled it in the real world before that moment. I very much hope I was mistaken.',
        choices: [
          {
            text: 'Void residue. The Underlurk Cult.',
            conditions: [],
            effects: [],
            next: 'cael_cult_acknowledgment'
          },
          {
            text: 'I\'ll investigate and find out what it was.',
            conditions: [],
            effects: [
              { type: 'set_flag',   flag: 'cael_quest_accepted' },
              { type: 'start_quest', questId: 'main_act1' }
            ],
            next: 'cael_quest_briefing'
          }
        ]
      },

      cael_cult_acknowledgment: {
        id: 'cael_cult_acknowledgment',
        speaker: 'cael',
        portrait: 'portrait_cael',
        text: '(Very quietly.) Yes. That\'s the other possibility I\'ve been trying not to think about. The Underlurk Cult has been quiet for years. If they\'re active near the Thornpillar... the implications are... I\'d rather not speculate until we have data. Please. Will you go?',
        choices: [
          {
            text: 'I\'ll go. Mark the stations on my map.',
            conditions: [],
            effects: [
              { type: 'set_flag',   flag: 'cael_quest_accepted' },
              { type: 'start_quest', questId: 'main_act1' }
            ],
            next: 'cael_quest_briefing'
          }
        ]
      },

      cael_about_sathis: {
        id: 'cael_about_sathis',
        speaker: 'cael',
        portrait: 'portrait_cael',
        text: 'Elder Sathis is the head of the Rootwarden Circle — the oldest living Thornkin, if you can imagine. He has monitored the Rootstones for longer than my grandmother was alive. If anyone can interpret the resonance data and tell us what is truly happening to the Thornpillar, it is him. The Sanctuary is several hours east, into the Aetherwood.',
        choices: [
          {
            text: 'Understood. I\'ll retrieve the data and bring it to him.',
            conditions: [],
            effects: [
              { type: 'set_flag',   flag: 'cael_quest_accepted' },
              { type: 'start_quest', questId: 'main_act1' }
            ],
            next: 'cael_quest_briefing'
          }
        ]
      },

      cael_station_locations: {
        id: 'cael_station_locations',
        speaker: 'cael',
        portrait: 'portrait_cael',
        text: 'Station Verath is in the north foothills, a short climb above Greyhollow. Station Ossian is harder — you\'ll need to enter the cave network directly beneath the Thornpillar. And Station Keld is on the eastern ridge, about three hours on foot. I\'m marking them on your map now.',
        choices: [
          {
            text: 'What should I expect inside?',
            conditions: [],
            effects: [],
            next: 'cael_expect_inside'
          },
          {
            text: 'I have what I need. I\'ll go now.',
            conditions: [],
            effects: [
              { type: 'set_flag',   flag: 'cael_quest_accepted' },
              { type: 'start_quest', questId: 'main_act1' }
            ],
            next: 'cael_quest_briefing'
          }
        ]
      },

      cael_expect_inside: {
        id: 'cael_expect_inside',
        speaker: 'cael',
        portrait: 'portrait_cael',
        text: 'Normally? Monitoring equipment and maybe some cave spiders. Currently? I genuinely don\'t know. The stations are hardened against weather but not against people with ill intent. Bring a torch and something sharp.',
        choices: [
          {
            text: 'Good advice. I\'ll head out now.',
            conditions: [],
            effects: [
              { type: 'set_flag',   flag: 'cael_quest_accepted' },
              { type: 'start_quest', questId: 'main_act1' }
            ],
            next: 'cael_quest_briefing'
          }
        ]
      },

      cael_quest_briefing: {
        id: 'cael_quest_briefing',
        speaker: 'cael',
        portrait: 'portrait_cael',
        text: 'Thank you. The three stations are marked on your map. Retrieve the resonance collector crystals from each one and bring them to Elder Sathis at the Rootwarden Sanctuary in the Aetherwood. I can\'t pay much, but the Rootwarden Circle will be in your debt. And at the moment, that debt matters.',
        choices: [
          {
            text: 'I\'ll return when I have the samples.',
            conditions: [],
            effects: [],
            next: null
          }
        ]
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. CAEL — QUEST ACTIVE (mid-Act-1 check-in)
  // ═══════════════════════════════════════════════════════════════════════════

  cael_quest_active: {
    root: 'cael_active_greet',
    nodes: {
      cael_active_greet: {
        id: 'cael_active_greet',
        speaker: 'cael',
        portrait: 'portrait_cael',
        text: 'Any progress? I\'ve been watching the Thornpillar\'s glow. It dimmed again last night — just slightly. But I noticed.',
        choices: [
          {
            text: 'I\'ve found one of the stations.',
            conditions: [{ type: 'has_flag', flag: 'station_verath_investigated' }],
            effects: [],
            next: 'cael_station_found'
          },
          {
            text: 'I\'m still searching. Any hints?',
            conditions: [],
            effects: [],
            next: 'cael_hints'
          },
          {
            text: 'What can you tell me about the Underlurk Cult?',
            conditions: [],
            effects: [],
            next: 'cael_cult_lore'
          },
          {
            text: 'I\'ll keep you updated.',
            conditions: [],
            effects: [],
            next: null
          }
        ]
      },

      cael_station_found: {
        id: 'cael_station_found',
        speaker: 'cael',
        portrait: 'portrait_cael',
        text: 'Good. What did you find? Were there signs of interference? Or was it just equipment failure?',
        choices: [
          {
            text: 'Signs of interference. Something was wrong.',
            conditions: [],
            effects: [{ type: 'set_flag', flag: 'cael_warned_of_interference' }],
            next: 'cael_interference_response'
          },
          {
            text: 'Hard to say. I have the data crystal.',
            conditions: [],
            effects: [],
            next: 'cael_data_retrieved'
          }
        ]
      },

      cael_interference_response: {
        id: 'cael_interference_response',
        speaker: 'cael',
        portrait: 'portrait_cael',
        text: '(His face goes pale.) I was afraid of that. Please — find the other two quickly. I\'ll stay near the inn and keep a low profile. I don\'t want to be seen near the stations if whoever did this is watching.',
        choices: [
          {
            text: 'Good thinking. I\'ll move fast.',
            conditions: [],
            effects: [],
            next: null
          }
        ]
      },

      cael_data_retrieved: {
        id: 'cael_data_retrieved',
        speaker: 'cael',
        portrait: 'portrait_cael',
        text: 'The data crystal is more important than the reasons. Get the other two and take them to Sathis as quickly as you can.',
        choices: [
          {
            text: 'On it.',
            conditions: [],
            effects: [],
            next: null
          }
        ]
      },

      cael_hints: {
        id: 'cael_hints',
        speaker: 'cael',
        portrait: 'portrait_cael',
        text: 'Station Verath is the easiest approach — the path is marked by orange flagging on the trail north of Greyhollow. Station Ossian requires going into the cave mouth at the base of the Thornpillar itself. Station Keld is east along the ridge road — there\'s an old survey marker where you turn south.',
        choices: [
          {
            text: 'What about threats along the way?',
            conditions: [],
            effects: [],
            next: 'cael_threats'
          },
          {
            text: 'That\'s enough. I\'ll find them.',
            conditions: [],
            effects: [],
            next: null
          }
        ]
      },

      cael_threats: {
        id: 'cael_threats',
        speaker: 'cael',
        portrait: 'portrait_cael',
        text: 'Cave spiders near Ossian are certain — they love the warm resonance glow. I\'ve also seen goblin tracks near Verath. And... be careful anywhere near the eastern ridge. There have been reports of strangers in dark robes.',
        choices: [
          {
            text: 'Strangers in dark robes. Cultists?',
            conditions: [],
            effects: [],
            next: 'cael_cultist_worry'
          },
          {
            text: 'Understood. I\'ll be careful.',
            conditions: [],
            effects: [],
            next: null
          }
        ]
      },

      cael_cultist_worry: {
        id: 'cael_cultist_worry',
        speaker: 'cael',
        portrait: 'portrait_cael',
        text: 'I hope not. But yes, it crossed my mind. The Underlurk Cult went quiet four years ago — or seemed to. If they\'re active near the Thornpillar now... Please. Find the data. We need to know what we\'re dealing with.',
        choices: [
          {
            text: 'I\'ll bring you answers.',
            conditions: [],
            effects: [],
            next: null
          }
        ]
      },

      cael_cult_lore: {
        id: 'cael_cult_lore',
        speaker: 'cael',
        portrait: 'portrait_cael',
        text: 'The Underlurk Cult are Vorrkai extremists — or were, originally. Now they\'re a mixed group of true believers and hired hands. They worship something in the Underlurk abyss — a void-entity of uncertain nature. Their doctrine calls for the destruction of all Rootstones. Their reasoning is that when the Shards fall, their void-god will rise to fill the space left behind. Most scholars consider them fringe and theatrical. I no longer share that opinion.',
        choices: [
          {
            text: 'Why did you change your mind?',
            conditions: [],
            effects: [],
            next: 'cael_changed_mind'
          },
          {
            text: 'That\'s concerning. I\'ll stay alert.',
            conditions: [],
            effects: [],
            next: null
          }
        ]
      },

      cael_changed_mind: {
        id: 'cael_changed_mind',
        speaker: 'cael',
        portrait: 'portrait_cael',
        text: 'Because void-residue at a Rootstone monitoring station is not theatrical. It\'s operational. They\'re doing something, and whatever it is, it is connected to the Dimming. I hope I\'m wrong. I expect I\'m not.',
        choices: [
          {
            text: 'Then I\'d better move quickly.',
            conditions: [],
            effects: [],
            next: null
          }
        ]
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. ELDER SATHIS — FIRST MEETING
  // ═══════════════════════════════════════════════════════════════════════════

  elder_sathis_first_meet: {
    root: 'sathis_greet',
    nodes: {
      sathis_greet: {
        id: 'sathis_greet',
        speaker: 'elder_sathis',
        portrait: 'portrait_sathis',
        text: '(He turns from the root altar with slow deliberation. His bark-skin pulses with faint amber light.) You carry the resonance samples. Good. Cael said you were capable. I hope he was right. Give them here.',
        choices: [
          {
            text: '(Hand over the resonance samples.)',
            conditions: [{ type: 'has_item', itemId: 'resonance_sample' }],
            effects: [
              { type: 'remove_item', itemId: 'resonance_sample' },
              { type: 'advance_quest', questId: 'main_act1', stageId: 'act1_complete' }
            ],
            next: 'sathis_reads_samples'
          },
          {
            text: 'I have questions before I hand these over.',
            conditions: [{ type: 'has_item', itemId: 'resonance_sample' }],
            effects: [],
            next: 'sathis_player_questions'
          }
        ]
      },

      sathis_player_questions: {
        id: 'sathis_player_questions',
        speaker: 'elder_sathis',
        portrait: 'portrait_sathis',
        text: '(A pause that feels deliberate.) Ask them. You\'ve earned that, at least.',
        choices: [
          {
            text: 'What is the Rootwarden Circle hiding about the Dimming?',
            conditions: [],
            effects: [],
            next: 'sathis_hiding_answer'
          },
          {
            text: 'Is Cael in danger?',
            conditions: [],
            effects: [],
            next: 'sathis_cael_danger'
          },
          {
            text: 'Fair enough. Here are the samples.',
            conditions: [],
            effects: [
              { type: 'remove_item', itemId: 'resonance_sample' },
              { type: 'advance_quest', questId: 'main_act1', stageId: 'act1_complete' }
            ],
            next: 'sathis_reads_samples'
          }
        ]
      },

      sathis_hiding_answer: {
        id: 'sathis_hiding_answer',
        speaker: 'elder_sathis',
        portrait: 'portrait_sathis',
        text: 'We are not hiding. We are being... careful about the sequencing of information. When people learn the Rootstones are dying, the first instinct is either panic or exploitation. Neither serves the goal of saving them. So yes, we have been selective. Give me the samples and I will be less selective with you.',
        choices: [
          {
            text: '(Hand over the samples.)',
            conditions: [],
            effects: [
              { type: 'remove_item', itemId: 'resonance_sample' },
              { type: 'advance_quest', questId: 'main_act1', stageId: 'act1_complete' }
            ],
            next: 'sathis_reads_samples'
          }
        ]
      },

      sathis_cael_danger: {
        id: 'sathis_cael_danger',
        speaker: 'elder_sathis',
        portrait: 'portrait_sathis',
        text: '(The amber light in his eyes dims briefly.) Yes. He is the most visible Rootwarden in the field. If someone is targeting our monitoring network deliberately, Cael is an obvious pressure point. I have asked him to vary his movements. Whether he listens is a different matter. The young rarely do.',
        choices: [
          {
            text: 'I\'ll keep an eye on him.',
            conditions: [],
            effects: [{ type: 'set_flag', flag: 'sathis_warned_about_cael' }],
            next: 'sathis_give_samples_prompt'
          }
        ]
      },

      sathis_give_samples_prompt: {
        id: 'sathis_give_samples_prompt',
        speaker: 'elder_sathis',
        portrait: 'portrait_sathis',
        text: 'Good. Now — the samples, please.',
        choices: [
          {
            text: '(Hand over the resonance samples.)',
            conditions: [],
            effects: [
              { type: 'remove_item', itemId: 'resonance_sample' },
              { type: 'advance_quest', questId: 'main_act1', stageId: 'act1_complete' }
            ],
            next: 'sathis_reads_samples'
          }
        ]
      },

      sathis_reads_samples: {
        id: 'sathis_reads_samples',
        speaker: 'elder_sathis',
        portrait: 'portrait_sathis',
        text: '(He holds the crystal vials one by one, eyes closed, his bark-fingers glowing where they touch each one. The reading takes several minutes. When he opens his eyes, something in them has changed.) Worse than I feared. The resonance signatures from all three stations match the same source. Not a natural decay. Not equipment failure. A systematic resonance drain — propagating upward from below.',
        choices: [
          {
            text: 'From the Underlurk.',
            conditions: [],
            effects: [],
            next: 'sathis_confirms_underlurk'
          },
          {
            text: 'What does that mean, exactly?',
            conditions: [],
            effects: [],
            next: 'sathis_explains_drain'
          }
        ]
      },

      sathis_confirms_underlurk: {
        id: 'sathis_confirms_underlurk',
        speaker: 'elder_sathis',
        portrait: 'portrait_sathis',
        text: 'Yes. Something below is pulling at the Rootstones\' energy — deliberately, structurally. Like severing a root rather than letting it wither. The Underlurk Cult has a ritual called the Sundering Rite. This is consistent with its early activation phase. We have, at best, weeks before they can complete it.',
        choices: [
          {
            text: 'What do you need me to do next?',
            conditions: [],
            effects: [],
            next: 'sathis_next_steps'
          },
          {
            text: 'Can\'t the Rootwardens stop this alone?',
            conditions: [],
            effects: [],
            next: 'sathis_rootwardens_alone'
          }
        ]
      },

      sathis_explains_drain: {
        id: 'sathis_explains_drain',
        speaker: 'elder_sathis',
        portrait: 'portrait_sathis',
        text: 'The Rootstones are not static objects. They are alive, in a sense — they breathe resonance upward, sustaining the Shards. What the samples show is a current running the wrong direction: resonance flowing down, below the Thornpillar\'s root structure, into the Underlurk abyss. Something is drinking them dry.',
        choices: [
          {
            text: 'The Underlurk Cult.',
            conditions: [],
            effects: [],
            next: 'sathis_confirms_underlurk'
          },
          {
            text: 'Can it be stopped?',
            conditions: [],
            effects: [],
            next: 'sathis_next_steps'
          }
        ]
      },

      sathis_rootwardens_alone: {
        id: 'sathis_rootwardens_alone',
        speaker: 'elder_sathis',
        portrait: 'portrait_sathis',
        text: 'We are forty-three active Wardens across all six Shards. We are scholars and listeners, not soldiers. No. We cannot. What I need is allies — real allies with reach and resources. The three factions who hold power in Varethos: the Auric Concordat, the Iron Compact, the Grey Penitents. One of them must commit to helping us.',
        choices: [
          {
            text: 'What do you need me to do?',
            conditions: [],
            effects: [],
            next: 'sathis_next_steps'
          }
        ]
      },

      sathis_next_steps: {
        id: 'sathis_next_steps',
        speaker: 'elder_sathis',
        portrait: 'portrait_sathis',
        text: 'You have done more than most would. I need a messenger who can move without faction markings — someone the Concordat, the Compact, and the Penitents will each receive without prejudice. That is rarer than it sounds. Will you serve as the Rootwarden\'s emissary? Find one of the three and secure their alliance before the Convergence completes.',
        choices: [
          {
            text: 'I\'ll do it. Which faction do you recommend?',
            conditions: [],
            effects: [
              { type: 'set_flag',   flag: 'act1_complete' },
              { type: 'start_quest', questId: 'main_act2' }
            ],
            next: 'sathis_faction_advice'
          },
          {
            text: 'I\'ll do it on my own terms.',
            conditions: [],
            effects: [
              { type: 'set_flag',   flag: 'act1_complete' },
              { type: 'start_quest', questId: 'main_act2' }
            ],
            next: 'sathis_player_choice_affirmed'
          }
        ]
      },

      sathis_faction_advice: {
        id: 'sathis_faction_advice',
        speaker: 'elder_sathis',
        portrait: 'portrait_sathis',
        text: 'The Concordat has resources but will want control. The Iron Compact has strength but will want territory. The Grey Penitents have knowledge and are genuinely motivated by the right reasons — but their capacity is the smallest. There is no clean choice. Choose the one you can trust, or the one you can most afford to be owed by.',
        choices: [
          {
            text: 'I\'ll consider it carefully.',
            conditions: [],
            effects: [],
            next: null
          }
        ]
      },

      sathis_player_choice_affirmed: {
        id: 'sathis_player_choice_affirmed',
        speaker: 'elder_sathis',
        portrait: 'portrait_sathis',
        text: '(A slow nod.) Good. The correct instinct. Go carefully. The Thornpillar does not have patience for politics, but you will need to have patience in its place.',
        choices: [
          {
            text: 'I\'ll report back when I have a commitment.',
            conditions: [],
            effects: [],
            next: null
          }
        ]
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. ELDER SATHIS — ONGOING (mid-game)
  // ═══════════════════════════════════════════════════════════════════════════

  elder_sathis_ongoing: {
    root: 'sathis_ongoing_greet',
    nodes: {
      sathis_ongoing_greet: {
        id: 'sathis_ongoing_greet',
        speaker: 'elder_sathis',
        portrait: 'portrait_sathis',
        text: '(He looks up from a dense scroll.) Progress?',
        choices: [
          {
            text: 'The alliance is secured.',
            conditions: [{ type: 'has_flag', flag: 'faction_alliance_chosen' }],
            effects: [],
            next: 'sathis_alliance_confirmed'
          },
          {
            text: 'Still working on the alliance.',
            conditions: [],
            effects: [],
            next: 'sathis_patience'
          },
          {
            text: 'Tell me more about the Kindling.',
            conditions: [{ type: 'has_flag', flag: 'kindling_ritual_known' }],
            effects: [],
            next: 'sathis_kindling_detail'
          },
          {
            text: 'I have questions about the Underlurk.',
            conditions: [],
            effects: [],
            next: 'sathis_underlurk_lore'
          }
        ]
      },

      sathis_alliance_confirmed: {
        id: 'sathis_alliance_confirmed',
        speaker: 'elder_sathis',
        portrait: 'portrait_sathis',
        text: '(He sets down the scroll.) Good. Which one? And what did they ask for in return?',
        choices: [
          {
            text: 'The Auric Concordat.',
            conditions: [{ type: 'has_flag', flag: 'concordat_alliance_offered' }],
            effects: [{ type: 'set_flag', flag: 'sathis_alliance_briefed' }],
            next: 'sathis_concordat_response'
          },
          {
            text: 'The Iron Compact.',
            conditions: [{ type: 'has_flag', flag: 'iron_compact_alliance_offered' }],
            effects: [{ type: 'set_flag', flag: 'sathis_alliance_briefed' }],
            next: 'sathis_compact_response'
          },
          {
            text: 'The Grey Penitents.',
            conditions: [{ type: 'has_flag', flag: 'penitents_alliance_offered' }],
            effects: [{ type: 'set_flag', flag: 'sathis_alliance_briefed' }],
            next: 'sathis_penitents_response'
          }
        ]
      },

      sathis_concordat_response: {
        id: 'sathis_concordat_response',
        speaker: 'elder_sathis',
        portrait: 'portrait_sathis',
        text: 'The Concordat. (Pause.) Varenne will want something. She always does. But their logistics are unmatched. Very well. We will work with what we have. What did she ask for?',
        choices: [
          {
            text: 'Trade access to the Aetherwood.',
            conditions: [],
            effects: [],
            next: 'sathis_trade_deal_response'
          },
          {
            text: 'Exclusive rights to any Rootstone findings.',
            conditions: [],
            effects: [],
            next: 'sathis_rootstone_rights'
          }
        ]
      },

      sathis_trade_deal_response: {
        id: 'sathis_trade_deal_response',
        speaker: 'elder_sathis',
        portrait: 'portrait_sathis',
        text: '(A long pause.) The Sylveni will not be pleased. But the Aetherwood still stands. We\'ll manage the consequences. Continue your work.',
        choices: [
          { text: 'Understood.', conditions: [], effects: [], next: null }
        ]
      },

      sathis_rootstone_rights: {
        id: 'sathis_rootstone_rights',
        speaker: 'elder_sathis',
        portrait: 'portrait_sathis',
        text: '(Visible effort to remain composed.) I will pretend you did not just tell me that. We will revisit this. Later. For now — we have what we need.',
        choices: [
          { text: 'Apologies.', conditions: [], effects: [], next: null }
        ]
      },

      sathis_compact_response: {
        id: 'sathis_compact_response',
        speaker: 'elder_sathis',
        portrait: 'portrait_sathis',
        text: 'Kash\'s people can clear a path through anything. Blunt instrument, but occasionally that\'s what you need. What was the price?',
        choices: [
          {
            text: 'A Rootwarden endorsement of the Compact as a legitimate governing body.',
            conditions: [],
            effects: [],
            next: 'sathis_compact_endorsement'
          }
        ]
      },

      sathis_compact_endorsement: {
        id: 'sathis_compact_endorsement',
        speaker: 'elder_sathis',
        portrait: 'portrait_sathis',
        text: 'She is not subtle about her ambitions. Very well. Words cost less than Rootstones. We endorse. Continue.',
        choices: [
          { text: 'I will.', conditions: [], effects: [], next: null }
        ]
      },

      sathis_penitents_response: {
        id: 'sathis_penitents_response',
        speaker: 'elder_sathis',
        portrait: 'portrait_sathis',
        text: '(Something in his posture relaxes slightly.) Abbess Vonn. Good. The Penitents will not betray us. What they lack in power they make up for in principle. And their library may hold something useful yet.',
        choices: [
          { text: 'My thought as well.', conditions: [], effects: [], next: null }
        ]
      },

      sathis_patience: {
        id: 'sathis_patience',
        speaker: 'elder_sathis',
        portrait: 'portrait_sathis',
        text: 'Move with purpose. The Thornpillar\'s rate of dimming is measurable. I am measuring it. Each day matters.',
        choices: [
          { text: 'I understand. I\'ll move faster.', conditions: [], effects: [], next: null }
        ]
      },

      sathis_kindling_detail: {
        id: 'sathis_kindling_detail',
        speaker: 'elder_sathis',
        portrait: 'portrait_sathis',
        text: 'The Kindling is a binding ritual — not a repair, exactly. It does not replace what the Rootstones have lost. It ties a living conduit to the network permanently, so that the conduit\'s own resonance supplements theirs. The Rootstones survive. The conduit... remains, but not as themselves.',
        choices: [
          {
            text: 'You\'re talking about sacrificing yourself.',
            conditions: [],
            effects: [],
            next: 'sathis_sacrifice_acknowledgment'
          },
          {
            text: 'Is there another way?',
            conditions: [],
            effects: [],
            next: 'sathis_another_way'
          }
        ]
      },

      sathis_sacrifice_acknowledgment: {
        id: 'sathis_sacrifice_acknowledgment',
        speaker: 'elder_sathis',
        portrait: 'portrait_sathis',
        text: '(Quietly.) The Thornkin do not fear the root. We come from the root. I would be returning to something older than I am. But yes. What I am now — what I think and remember and know — that will not survive it.',
        choices: [
          { text: 'I\'ll find another way.', conditions: [], effects: [], next: 'sathis_another_way' },
          { text: 'If there is no other way — I understand.', conditions: [], effects: [], next: null }
        ]
      },

      sathis_another_way: {
        id: 'sathis_another_way',
        speaker: 'elder_sathis',
        portrait: 'portrait_sathis',
        text: 'I have spent four hundred years looking. I have not found one. But I am old. Perhaps you will see something I have missed. I hope so. Genuinely.',
        choices: [
          { text: 'I\'ll try.', conditions: [], effects: [], next: null }
        ]
      },

      sathis_underlurk_lore: {
        id: 'sathis_underlurk_lore',
        speaker: 'elder_sathis',
        portrait: 'portrait_sathis',
        text: 'The Underlurk is not empty. The Arcanate records — which the Penitents guard now — describe something they called the Unmade: a void-entity that predates the Rootstones, that existed in the abyss before the Shards were raised. The Cult calls it their god. It may simply be a predator that found a very large food source.',
        choices: [
          {
            text: 'Can it be destroyed?',
            conditions: [],
            effects: [],
            next: 'sathis_entity_destroyed'
          },
          {
            text: 'Binding it seems more feasible than destroying it.',
            conditions: [],
            effects: [],
            next: 'sathis_binding_entity'
          }
        ]
      },

      sathis_entity_destroyed: {
        id: 'sathis_entity_destroyed',
        speaker: 'elder_sathis',
        portrait: 'portrait_sathis',
        text: 'Unknown. The Arcanate tried, at the end. The Shattering followed. So. Perhaps not the approach we should repeat.',
        choices: [
          { text: 'Understood.', conditions: [], effects: [], next: null }
        ]
      },

      sathis_binding_entity: {
        id: 'sathis_binding_entity',
        speaker: 'elder_sathis',
        portrait: 'portrait_sathis',
        text: 'The Grey Penitents believe so. Brother Vel has a theory about a true name. I consider it a long shot. But long shots have saved Aethermoor before. If you encounter those monoliths in the Underlurk, it may be worth pursuing.',
        choices: [
          { text: 'I\'ll look into it.', conditions: [], effects: [], next: null }
        ]
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. GREYHOLLOW INNKEEPER
  // ═══════════════════════════════════════════════════════════════════════════

  greyhollow_innkeeper: {
    root: 'innkeeper_greet',
    nodes: {
      innkeeper_greet: {
        id: 'innkeeper_greet',
        speaker: 'greyhollow_innkeeper',
        portrait: 'portrait_innkeeper',
        text: '(He looks up from polishing a mug that appears to have been polished fifty times already.) Welcome to the Hollow Hearth. Food, drink, a bed, or gossip? I\'m stocked in all four.',
        choices: [
          {
            text: 'I\'d like to see what you\'re selling.',
            conditions: [],
            effects: [],
            next: 'innkeeper_shop'
          },
          {
            text: 'I need a room for the night.',
            conditions: [],
            effects: [],
            next: 'innkeeper_room'
          },
          {
            text: 'What do you know about Greyhollow?',
            conditions: [],
            effects: [],
            next: 'innkeeper_greyhollow_info'
          },
          {
            text: 'Any rumors worth hearing?',
            conditions: [],
            effects: [],
            next: 'innkeeper_rumors'
          },
          {
            text: 'What do you know about the Thornpillar dimming?',
            conditions: [],
            effects: [],
            next: 'innkeeper_thornpillar'
          },
          {
            text: 'Just passing through.',
            conditions: [],
            effects: [],
            next: null
          }
        ]
      },

      innkeeper_shop: {
        id: 'innkeeper_shop',
        speaker: 'greyhollow_innkeeper',
        portrait: 'portrait_innkeeper',
        text: '(Opens a cabinet behind him.) Bread, a few potions from the Thornmere trader who passes through, torches. Nothing fancy, but reliable. What do you need?',
        choices: [
          {
            text: '(Open shop.)',
            conditions: [],
            effects: [{ type: 'open_shop', npcId: 'greyhollow_innkeeper' }],
            next: null
          },
          {
            text: 'Just browsing. Maybe later.',
            conditions: [],
            effects: [],
            next: null
          }
        ]
      },

      innkeeper_room: {
        id: 'innkeeper_room',
        speaker: 'greyhollow_innkeeper',
        portrait: 'portrait_innkeeper',
        text: 'Ten gold for the night. That includes breakfast — such as it is, mostly bread — and use of the common bath. I have two rooms: one faces east toward the Thornpillar and has a lovely view of its glow. The glow has been... less lately. But the room\'s still nice.',
        choices: [
          {
            text: 'I\'ll take a room. (10 gold)',
            conditions: [{ type: 'has_gold', amount: 10 }],
            effects: [
              { type: 'add_gold',   amount: -10 },
              { type: 'set_flag',   flag: 'greyhollow_inn_rented' },
              { type: 'rest',       hours: 8 }
            ],
            next: 'innkeeper_room_confirmed'
          },
          {
            text: 'Maybe another time.',
            conditions: [],
            effects: [],
            next: null
          }
        ]
      },

      innkeeper_room_confirmed: {
        id: 'innkeeper_room_confirmed',
        speaker: 'greyhollow_innkeeper',
        portrait: 'portrait_innkeeper',
        text: 'Room three, up the stairs, door on the right. Key\'s behind the bar. Sleep well — you look like you\'ve been through something already.',
        choices: [
          { text: 'Thank you.', conditions: [], effects: [], next: null }
        ]
      },

      innkeeper_greyhollow_info: {
        id: 'innkeeper_greyhollow_info',
        speaker: 'greyhollow_innkeeper',
        portrait: 'portrait_innkeeper',
        text: 'Greyhollow\'s been here eighty years, give or take. Started as a waystation for Arcanate surveyors monitoring the Thornpillar — grew into a real town once people noticed the Rootstone\'s glow kept crops from freezing. About two hundred souls, give or take. Mostly farmers and the few who serve the Rootwardens\' monitoring work.',
        choices: [
          {
            text: 'Is it safe here?',
            conditions: [],
            effects: [],
            next: 'innkeeper_safety'
          },
          {
            text: 'What\'s the Captain Dayne like?',
            conditions: [],
            effects: [],
            next: 'innkeeper_about_dayne'
          },
          {
            text: 'That\'s helpful. Thank you.',
            conditions: [],
            effects: [],
            next: null
          }
        ]
      },

      innkeeper_safety: {
        id: 'innkeeper_safety',
        speaker: 'greyhollow_innkeeper',
        portrait: 'portrait_innkeeper',
        text: 'Usually. The roads have gotten dicier in the last few months. Bandit activity up near the ridge, and there\'s been talk of something in the cave systems beneath the Thornpillar that the cave spiders seem to be avoiding. When the spiders leave, you know something worse moved in.',
        choices: [
          {
            text: 'I\'ll be careful.',
            conditions: [],
            effects: [],
            next: null
          }
        ]
      },

      innkeeper_about_dayne: {
        id: 'innkeeper_about_dayne',
        speaker: 'greyhollow_innkeeper',
        portrait: 'portrait_innkeeper',
        text: 'Ressa? Solid. Fair. Iron Compact-trained but she left on good terms — or so she says. Doesn\'t drink, which I find suspicious in a guard captain but probably healthy. She\'s been jumpy lately. Patrols three times instead of twice. Won\'t say why.',
        choices: [
          { text: 'Interesting.', conditions: [], effects: [], next: null }
        ]
      },

      innkeeper_rumors: {
        id: 'innkeeper_rumors',
        speaker: 'greyhollow_innkeeper',
        portrait: 'portrait_innkeeper',
        text: '(Leans on the bar conspiratorially.) Cost you five gold. Worth every piece.',
        choices: [
          {
            text: 'Pay for a rumor. (5 gold)',
            conditions: [{ type: 'has_gold', amount: 5 }],
            effects: [{ type: 'add_gold', amount: -5 }],
            next: 'innkeeper_rumor_deliver'
          },
          {
            text: 'Not today.',
            conditions: [],
            effects: [],
            next: null
          }
        ]
      },

      innkeeper_rumor_deliver: {
        id: 'innkeeper_rumor_deliver',
        speaker: 'greyhollow_innkeeper',
        portrait: 'portrait_innkeeper',
        text: '(Drops his voice.) Three nights ago, a Concordat trader came through. Staying the night, nervous as a cat. Before he left he told me he\'d heard that High Consul Osel\'s brother — the one who disappeared six years ago after some scandal — was seen near the Underlurk Chasm access. A Concordat official, in cult territory. If that\'s true, someone important has some very embarrassing connections.',
        choices: [
          {
            text: 'Osel\'s brother. I\'ll keep that in mind.',
            conditions: [],
            effects: [{ type: 'set_flag', flag: 'innkeeper_osel_rumor_heard' }],
            next: null
          }
        ]
      },

      innkeeper_thornpillar: {
        id: 'innkeeper_thornpillar',
        speaker: 'greyhollow_innkeeper',
        portrait: 'portrait_innkeeper',
        text: 'You noticed too. Everyone has. The glow\'s been wrong for months — less steady, like a candle in wind instead of a forge. Greyhollow was founded around that glow. It keeps the frost off. It keeps the crops alive. If it goes...',
        choices: [
          {
            text: 'What do people think is causing it?',
            conditions: [],
            effects: [],
            next: 'innkeeper_cause_theories'
          },
          {
            text: 'Are people frightened?',
            conditions: [],
            effects: [],
            next: 'innkeeper_fear_response'
          }
        ]
      },

      innkeeper_cause_theories: {
        id: 'innkeeper_cause_theories',
        speaker: 'greyhollow_innkeeper',
        portrait: 'portrait_innkeeper',
        text: 'Half say it\'s natural — the Rootstones are old, maybe they dim and brighten on their own. The other half blame the Underlurk Cult. The third half — yes I know that\'s too many halves, stop looking at me like that — say the Concordat is suppressing it to sell emergency Rootstone shards at inflated prices. I\'ve heard all three this week.',
        choices: [
          { text: 'What do you believe?', conditions: [], effects: [], next: 'innkeeper_own_belief' }
        ]
      },

      innkeeper_own_belief: {
        id: 'innkeeper_own_belief',
        speaker: 'greyhollow_innkeeper',
        portrait: 'portrait_innkeeper',
        text: 'I believe in keeping good ale cold, keeping the fire lit, and not thinking too hard about things I can\'t fix. But if you can fix it — please do. I like my inn where it is. Not in the Underlurk.',
        choices: [
          { text: 'I\'ll do my best.', conditions: [], effects: [], next: null }
        ]
      },

      innkeeper_fear_response: {
        id: 'innkeeper_fear_response',
        speaker: 'greyhollow_innkeeper',
        portrait: 'portrait_innkeeper',
        text: 'Quietly. The Varesh way: nobody says they\'re scared until the fear becomes too loud to ignore. But I\'ve had more people than usual sleeping with their boots on. That\'s a sign.',
        choices: [
          { text: 'Understandable.', conditions: [], effects: [], next: null }
        ]
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. GREYHOLLOW BLACKSMITH
  // ═══════════════════════════════════════════════════════════════════════════

  greyhollow_blacksmith: {
    root: 'blacksmith_greet',
    nodes: {
      blacksmith_greet: {
        id: 'blacksmith_greet',
        speaker: 'greyhollow_blacksmith',
        portrait: 'portrait_blacksmith',
        text: '(She doesn\'t look up from the anvil.) What do you need? Tools, weapons, or ore? I don\'t do custom work for strangers unless they can convince me they\'re worth the trouble.',
        choices: [
          {
            text: 'Let me see what you have.',
            conditions: [],
            effects: [{ type: 'open_shop', npcId: 'greyhollow_blacksmith' }],
            next: null
          },
          {
            text: 'Can I use your forge to craft something?',
            conditions: [],
            effects: [],
            next: 'blacksmith_forge_access'
          },
          {
            text: 'I can handle myself — I\'d like custom work.',
            conditions: [{ type: 'skill_gte', skill: 'smithing', level: 15 }],
            effects: [],
            next: 'blacksmith_custom_skilled'
          },
          {
            text: 'Tell me about your work.',
            conditions: [],
            effects: [],
            next: 'blacksmith_about_work'
          },
          {
            text: 'Never mind.',
            conditions: [],
            effects: [],
            next: null
          }
        ]
      },

      blacksmith_forge_access: {
        id: 'blacksmith_forge_access',
        speaker: 'greyhollow_blacksmith',
        portrait: 'portrait_blacksmith',
        text: '(She glances up.) Know what you\'re doing? If you overheat my hearth or leave ash in the bellows, I charge a fee. Ten gold for access plus materials. Fair?',
        choices: [
          {
            text: 'Fair. (Pay 10 gold)',
            conditions: [{ type: 'has_gold', amount: 10 }],
            effects: [
              { type: 'add_gold',         amount: -10 },
              { type: 'open_crafting',    stationId: 'forge' }
            ],
            next: null
          },
          {
            text: 'I know my way around a forge.',
            conditions: [{ type: 'skill_gte', skill: 'smithing', level: 20 }],
            effects: [{ type: 'open_crafting', stationId: 'forge' }],
            next: 'blacksmith_forge_free'
          },
          {
            text: 'Not today.',
            conditions: [],
            effects: [],
            next: null
          }
        ]
      },

      blacksmith_forge_free: {
        id: 'blacksmith_forge_free',
        speaker: 'greyhollow_blacksmith',
        portrait: 'portrait_blacksmith',
        text: '(She puts down her hammer and actually looks at you.) Smithing twenty or better? Fine. No charge. Don\'t embarrass my forge.',
        choices: [
          { text: 'Wouldn\'t dream of it.', conditions: [], effects: [], next: null }
        ]
      },

      blacksmith_custom_skilled: {
        id: 'blacksmith_custom_skilled',
        speaker: 'greyhollow_blacksmith',
        portrait: 'portrait_blacksmith',
        text: '(She straightens, studying your hands.) You\'ve got calluses in the right places. What do you want made? I\'ll listen.',
        choices: [
          {
            text: 'A better grip on a blade I have.',
            conditions: [],
            effects: [],
            next: 'blacksmith_regrip'
          },
          {
            text: 'Nothing right now. Just wanted you to know I\'m not a stranger to the forge.',
            conditions: [],
            effects: [{ type: 'set_flag', flag: 'blacksmith_skilled_impression' }],
            next: 'blacksmith_impressed'
          }
        ]
      },

      blacksmith_regrip: {
        id: 'blacksmith_regrip',
        speaker: 'greyhollow_blacksmith',
        portrait: 'portrait_blacksmith',
        text: 'Leather strips and ten minutes. Twenty gold. Better balance, cleaner draw. You want it?',
        choices: [
          {
            text: 'Yes. (20 gold)',
            conditions: [{ type: 'has_gold', amount: 20 }, { type: 'has_item', itemId: 'iron_sword' }],
            effects: [
              { type: 'add_gold', amount: -20 },
              { type: 'set_flag', flag: 'blade_regripped' }
            ],
            next: 'blacksmith_regrip_done'
          },
          {
            text: 'Maybe later.',
            conditions: [],
            effects: [],
            next: null
          }
        ]
      },

      blacksmith_regrip_done: {
        id: 'blacksmith_regrip_done',
        speaker: 'greyhollow_blacksmith',
        portrait: 'portrait_blacksmith',
        text: '(She works for ten minutes, hands moving without wasted motion.) There. Better. Don\'t drop it.',
        choices: [
          { text: 'Thank you.', conditions: [], effects: [], next: null }
        ]
      },

      blacksmith_impressed: {
        id: 'blacksmith_impressed',
        speaker: 'greyhollow_blacksmith',
        portrait: 'portrait_blacksmith',
        text: '(A short nod — which from her is probably high praise.) If you\'re back through and need proper work done, use my forge free of charge. One smith to another.',
        choices: [
          { text: 'Appreciated.', conditions: [], effects: [], next: null }
        ]
      },

      blacksmith_about_work: {
        id: 'blacksmith_about_work',
        speaker: 'greyhollow_blacksmith',
        portrait: 'portrait_blacksmith',
        text: 'Vreth family\'s worked this forge for three generations. My grandfather forged tools for the Rootwarden monitoring stations when they were first built. My mother made blades for the Iron Compact when the border disputes happened. I make whatever the town needs. Currently: a lot of replacement hinges, because apparently everyone\'s barricading their doors. Draw your own conclusions.',
        choices: [
          {
            text: 'Why are people barricading their doors?',
            conditions: [],
            effects: [],
            next: 'blacksmith_fear'
          },
          {
            text: 'Cincrak smithing is supposed to be exceptional.',
            conditions: [],
            effects: [],
            next: 'blacksmith_cindrak_pride'
          },
          {
            text: 'Good to know. I\'ll come back when I need something.',
            conditions: [],
            effects: [],
            next: null
          }
        ]
      },

      blacksmith_fear: {
        id: 'blacksmith_fear',
        speaker: 'greyhollow_blacksmith',
        portrait: 'portrait_blacksmith',
        text: 'The Thornpillar dimming. People feel it in their bones even if they can\'t explain it. The forge output drops when the resonance drops. I\'ve had to run hotter coal to compensate. Something is wrong with the pillar. If it goes... I don\'t know what happens to the metal out here without its resonance. I try not to think about it.',
        choices: [
          { text: 'I\'m working on it.', conditions: [], effects: [], next: null }
        ]
      },

      blacksmith_cindrak_pride: {
        id: 'blacksmith_cindrak_pride',
        speaker: 'greyhollow_blacksmith',
        portrait: 'portrait_blacksmith',
        text: 'Supposed to be. Is. The Emberpeak forges hear the Rootstone resonance through the volcanic rock — it tells you the right temperature, the right fold count. My work is good. Not Emberpeak quality, because I\'m not standing on a magma vent. But for Varethos surface work? Good.',
        choices: [
          { text: 'I\'ll trust your work.', conditions: [], effects: [], next: null }
        ]
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. GREYHOLLOW GUARD CAPTAIN
  // ═══════════════════════════════════════════════════════════════════════════

  greyhollow_guard_captain: {
    root: 'captain_greet',
    nodes: {
      captain_greet: {
        id: 'captain_greet',
        speaker: 'greyhollow_guard_captain',
        portrait: 'portrait_guard_captain',
        text: '(She is watching the road north with the focused expression of someone who expects something to come down it.) Traveler. State your business in Greyhollow.',
        choices: [
          {
            text: 'Just passing through.',
            conditions: [],
            effects: [],
            next: 'captain_passing_through'
          },
          {
            text: 'I\'m here on Rootwarden business.',
            conditions: [{ type: 'has_flag', flag: 'cael_quest_accepted' }],
            effects: [],
            next: 'captain_rootwarden_business'
          },
          {
            text: 'What\'s the situation outside the walls?',
            conditions: [],
            effects: [],
            next: 'captain_outside_situation'
          },
          {
            text: 'What can you tell me about the factions active here?',
            conditions: [],
            effects: [],
            next: 'captain_faction_info'
          }
        ]
      },

      captain_passing_through: {
        id: 'captain_passing_through',
        speaker: 'greyhollow_guard_captain',
        portrait: 'portrait_guard_captain',
        text: 'Greyhollow is open to travelers. Inn\'s in the center, smithy south side, and the monitoring station is off-limits unless you\'re authorized. Try not to get into trouble. We\'re short-staffed.',
        choices: [
          { text: 'Understood. Thank you.', conditions: [], effects: [], next: null }
        ]
      },

      captain_rootwarden_business: {
        id: 'captain_rootwarden_business',
        speaker: 'greyhollow_guard_captain',
        portrait: 'portrait_guard_captain',
        text: '(Her posture loosens slightly.) Good. Cael told me he\'d found someone. The stations need looking at and he needed better backup than I could provide — I have the town to watch. What do you need from me?',
        choices: [
          {
            text: 'Access to the roads north and east.',
            conditions: [],
            effects: [{ type: 'set_flag', flag: 'captain_access_granted' }],
            next: 'captain_access_given'
          },
          {
            text: 'What have you seen out there?',
            conditions: [],
            effects: [],
            next: 'captain_outside_situation'
          }
        ]
      },

      captain_access_given: {
        id: 'captain_access_given',
        speaker: 'greyhollow_guard_captain',
        portrait: 'portrait_guard_captain',
        text: 'You have it. If you see cult markings — void sigils on stone, usually in paired lines — back away and report to me before engaging. We don\'t have the numbers to handle a full cult cell. You probably don\'t either.',
        choices: [
          { text: 'Noted.', conditions: [], effects: [], next: null }
        ]
      },

      captain_outside_situation: {
        id: 'captain_outside_situation',
        speaker: 'greyhollow_guard_captain',
        portrait: 'portrait_guard_captain',
        text: 'North road: goblin activity increased last month. They\'re displaced from somewhere — something pushed them out of their usual caves. East ridge: bandit camp, six or seven, poorly organized but desperate. Cave system under the Thornpillar: I send no one. Something wrong in there since the dimming started. The patrol I sent three weeks ago came back without Sergeant Kell. They wouldn\'t say what happened.',
        choices: [
          {
            text: 'What do you think happened to Sergeant Kell?',
            conditions: [],
            effects: [],
            next: 'captain_kell_fate'
          },
          {
            text: 'I\'ll be careful.',
            conditions: [],
            effects: [],
            next: null
          }
        ]
      },

      captain_kell_fate: {
        id: 'captain_kell_fate',
        speaker: 'greyhollow_guard_captain',
        portrait: 'portrait_guard_captain',
        text: '(A pause.) I have theories. None I\'ll say out loud near the Thornpillar. If you go into those caves and find any trace of her — or what she encountered — I\'d want to know.',
        choices: [
          { text: 'I\'ll keep my eyes open.', conditions: [], effects: [], next: null }
        ]
      },

      captain_faction_info: {
        id: 'captain_faction_info',
        speaker: 'greyhollow_guard_captain',
        portrait: 'portrait_guard_captain',
        text: 'Greyhollow sits between three factions\' influence zones. The Iron Compact holds the contract for defense — I\'m Compact-trained, technically. The Concordat moves most of the trade through here. The Rootwardens are headquartered in the Aetherwood but Cael is their local presence. Everyone is polite to everyone else. Nobody trusts anyone.',
        choices: [
          {
            text: 'What about the Grey Penitents?',
            conditions: [],
            effects: [],
            next: 'captain_penitents'
          },
          {
            text: 'Which faction do you actually support?',
            conditions: [],
            effects: [],
            next: 'captain_personal_allegiance'
          }
        ]
      },

      captain_penitents: {
        id: 'captain_penitents',
        speaker: 'greyhollow_guard_captain',
        portrait: 'portrait_guard_captain',
        text: 'Monastery is an hour north. They mostly keep to themselves and run a field clinic for injured travelers. Abbess Vonn sends a monk to check on the town monthly. Good people, strange beliefs, but they\'ve never caused trouble.',
        choices: [
          { text: 'Good to know.', conditions: [], effects: [], next: null }
        ]
      },

      captain_personal_allegiance: {
        id: 'captain_personal_allegiance',
        speaker: 'greyhollow_guard_captain',
        portrait: 'portrait_guard_captain',
        text: 'Greyhollow. That\'s who I work for. The Compact pays my salary. The Concordat signs the charter. But if it came down to it and I had to choose what I\'m protecting — it\'s the two hundred people in this town. The rest is administration.',
        choices: [
          { text: 'That\'s the right answer.', conditions: [], effects: [], next: null }
        ]
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. WANDERING SYLVENI DRUID (side quest 2)
  // ═══════════════════════════════════════════════════════════════════════════

  wandering_sylveni_druid: {
    root: 'druid_greet',
    nodes: {
      druid_greet: {
        id: 'druid_greet',
        speaker: 'wandering_sylveni_druid',
        portrait: 'portrait_aelindra',
        text: '(She steps from between two trees with silver hair tangled and eyes red from weeping.) You can feel it, can\'t you? The Aetherwood is wrong. Something is wrong inside it. My apprentice went in three days ago and has not come back.',
        choices: [
          {
            text: 'Tell me about your apprentice.',
            conditions: [],
            effects: [],
            next: 'druid_apprentice_explain'
          },
          {
            text: 'What do you mean the forest is wrong?',
            conditions: [],
            effects: [],
            next: 'druid_forest_wrong'
          },
          {
            text: 'I can look for them. What should I watch for?',
            conditions: [],
            effects: [
              { type: 'start_quest', questId: 'side_woven_lament' }
            ],
            next: 'druid_quest_start'
          }
        ]
      },

      druid_apprentice_explain: {
        id: 'druid_apprentice_explain',
        speaker: 'wandering_sylveni_druid',
        portrait: 'portrait_aelindra',
        text: 'Vel — Vel Rennis. Twenty-three years old. The most gifted Woven-listener I\'ve trained in a century. He went to commune with the Heart Grove — the oldest Woven spirit in the Aetherwood. He was meant to return by sundown. When he didn\'t, I went in to look. The paths... moved. I walked in circles for six hours before the trees let me out.',
        choices: [
          {
            text: 'The trees blocked you?',
            conditions: [],
            effects: [],
            next: 'druid_trees_blocked'
          },
          {
            text: 'I can navigate confused terrain. I\'ll help.',
            conditions: [],
            effects: [
              { type: 'start_quest', questId: 'side_woven_lament' }
            ],
            next: 'druid_quest_start'
          }
        ]
      },

      druid_trees_blocked: {
        id: 'druid_trees_blocked',
        speaker: 'wandering_sylveni_druid',
        portrait: 'portrait_aelindra',
        text: 'The Woven have never blocked a Sylveni. Not in three thousand years. Something has changed in how they think — something has confused or corrupted them. I believe it\'s connected to the Dimming. The Woven are tied to the Rootstones. If the Rootstones are distressed, the Woven become... unpredictable.',
        choices: [
          {
            text: 'I\'ll find Vel and investigate what\'s wrong.',
            conditions: [],
            effects: [
              { type: 'start_quest', questId: 'side_woven_lament' }
            ],
            next: 'druid_quest_start'
          }
        ]
      },

      druid_forest_wrong: {
        id: 'druid_forest_wrong',
        speaker: 'wandering_sylveni_druid',
        portrait: 'portrait_aelindra',
        text: 'The Woven — tree spirits bonded to the Rootstone network — have been acting strangely for weeks. Normally they guide Sylveni through the forest, communicate through root-tremors, help tend the deep growth. Now they\'re silent. Cold. Some of them have reached out toward me with their roots as if... asking. Or warning. I can\'t tell which.',
        choices: [
          {
            text: 'I\'ll find your apprentice and see what\'s happening in there.',
            conditions: [],
            effects: [
              { type: 'start_quest', questId: 'side_woven_lament' }
            ],
            next: 'druid_quest_start'
          }
        ]
      },

      druid_quest_start: {
        id: 'druid_quest_start',
        speaker: 'wandering_sylveni_druid',
        portrait: 'portrait_aelindra',
        text: 'Thank you. The Heart Grove is northeast of here — marked by the five-arch root formation. The Woven may try to redirect you. Walk toward the sound of the oldest silence. That sounds meaningless until you\'ve been in the deep Aetherwood, and then it will make sense. And... be careful with the Woven if they\'re corrupted. They are not trying to harm. They are confused.',
        choices: [
          {
            text: 'I\'ll find Vel.',
            conditions: [],
            effects: [],
            next: null
          }
        ]
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. IRON COMPACT DESERTER (side quest 3)
  // ═══════════════════════════════════════════════════════════════════════════

  iron_compact_deserter: {
    root: 'deserter_greet',
    nodes: {
      deserter_greet: {
        id: 'deserter_greet',
        speaker: 'iron_compact_deserter',
        portrait: 'portrait_gerran',
        text: '(He backs away when you approach, hand on a knife he probably can\'t use.) I\'m nobody. I\'m not here. If you\'re from the Compact, I don\'t have anything you want. I don\'t know anything.',
        choices: [
          {
            text: 'I\'m not from the Compact. You\'re safe.',
            conditions: [],
            effects: [],
            next: 'deserter_reassured'
          },
          {
            text: 'What did you see?',
            conditions: [],
            effects: [],
            next: 'deserter_too_direct'
          }
        ]
      },

      deserter_too_direct: {
        id: 'deserter_too_direct',
        speaker: 'iron_compact_deserter',
        portrait: 'portrait_gerran',
        text: '(He flinches.) Don\'t— I don\'t know what you\'re talking about. Leave me alone.',
        choices: [
          {
            text: 'Easy. I\'m not your enemy. I just want to listen.',
            conditions: [],
            effects: [],
            next: 'deserter_reassured'
          },
          {
            text: 'Fine. I\'ll leave.',
            conditions: [],
            effects: [],
            next: null
          }
        ]
      },

      deserter_reassured: {
        id: 'deserter_reassured',
        speaker: 'iron_compact_deserter',
        portrait: 'portrait_gerran',
        text: '(A long silence. He doesn\'t put the knife away.) ...You\'re not wearing Compact colors. And you\'re not dressed like a trader. (Slowly.) My name is Gerran. I was a sergeant. Third forward unit, eastern Underlurk patrol. Two months ago we received orders.',
        choices: [
          {
            text: 'What kind of orders?',
            conditions: [],
            effects: [],
            next: 'deserter_order_details'
          }
        ]
      },

      deserter_order_details: {
        id: 'deserter_order_details',
        speaker: 'iron_compact_deserter',
        portrait: 'portrait_gerran',
        text: 'There was a group of Vorrkai — refugees coming up from the Underlurk. Families. They had a pass from the Concordat, signed and sealed. Our orders said to deny them passage and — (He stops, swallows.) The orders said to ensure no testimony. Those were the exact words. Ensure no testimony. I know what that means. We all knew what it meant.',
        choices: [
          {
            text: 'Did you follow the orders?',
            conditions: [],
            effects: [],
            next: 'deserter_followed_orders'
          },
          {
            text: 'Who signed the orders?',
            conditions: [],
            effects: [],
            next: 'deserter_orders_signed'
          }
        ]
      },

      deserter_followed_orders: {
        id: 'deserter_followed_orders',
        speaker: 'iron_compact_deserter',
        portrait: 'portrait_gerran',
        text: '(Long pause.) Three of us refused. The other eight didn\'t. I ran when it was over. I hid the orders scroll under the floorboards. I didn\'t know what to do with it. I still don\'t. I just... couldn\'t let it disappear. Someone should know.',
        choices: [
          {
            text: 'I\'ll be that someone. Show me where the scroll is.',
            conditions: [],
            effects: [
              { type: 'start_quest', questId: 'side_iron_blood' }
            ],
            next: 'deserter_points_to_scroll'
          }
        ]
      },

      deserter_orders_signed: {
        id: 'deserter_orders_signed',
        speaker: 'iron_compact_deserter',
        portrait: 'portrait_gerran',
        text: '(He finally puts the knife away.) Warmaster Kash. Her personal seal. Unmistakable — I\'ve seen it on my transfer papers, my commissions, everything. This was her order.',
        choices: [
          {
            text: 'That\'s serious. Can I see the scroll?',
            conditions: [],
            effects: [
              { type: 'start_quest', questId: 'side_iron_blood' }
            ],
            next: 'deserter_points_to_scroll'
          }
        ]
      },

      deserter_points_to_scroll: {
        id: 'deserter_points_to_scroll',
        speaker: 'iron_compact_deserter',
        portrait: 'portrait_gerran',
        text: 'Third floorboard from the east wall. Loose — you\'ll feel it. Take it. Do something with it. I can\'t. I\'ve been waiting here for three weeks trying to decide and I can\'t make myself decide. Someone needs to do something with it other than me.',
        choices: [
          {
            text: 'I\'ll handle it.',
            conditions: [],
            effects: [{ type: 'set_flag', flag: 'gerran_met' }],
            next: null
          }
        ]
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 10. GREY PENITENT MONK (side quest 5)
  // ═══════════════════════════════════════════════════════════════════════════

  grey_penitent_monk: {
    root: 'monk_greet',
    nodes: {
      monk_greet: {
        id: 'monk_greet',
        speaker: 'grey_penitent_monk',
        portrait: 'portrait_brother_vel',
        text: '(He looks up from a stack of crumbling pages, eyes bright with the particular intensity of someone who has been alone with an idea for too long.) You\'ve been to the Underlurk, haven\'t you? I can see it on you. There\'s a residue. Would you speak with me?',
        choices: [
          {
            text: 'What do you want to know?',
            conditions: [],
            effects: [],
            next: 'monk_explain_theory'
          },
          {
            text: 'Residue? What do you mean?',
            conditions: [],
            effects: [],
            next: 'monk_residue_explain'
          }
        ]
      },

      monk_residue_explain: {
        id: 'monk_residue_explain',
        speaker: 'grey_penitent_monk',
        portrait: 'portrait_brother_vel',
        text: 'The void-entity leaves a trace on those who approach its territory. A slight dimming of your silhouette, visible to those trained to look. The Arcanate called it "void-mark." It fades in time. But while it\'s present, it means you\'ve been close enough to hear it.',
        choices: [
          {
            text: 'Is that dangerous?',
            conditions: [],
            effects: [],
            next: 'monk_dangerous_mark'
          },
          {
            text: 'What does this have to do with you?',
            conditions: [],
            effects: [],
            next: 'monk_explain_theory'
          }
        ]
      },

      monk_dangerous_mark: {
        id: 'monk_dangerous_mark',
        speaker: 'grey_penitent_monk',
        portrait: 'portrait_brother_vel',
        text: 'Not immediately. Sustained exposure would be. But more importantly — it means you can hear the entity if it speaks. That\'s relevant to my research. Seventeen years of research, specifically.',
        choices: [
          {
            text: 'Tell me about this research.',
            conditions: [],
            effects: [],
            next: 'monk_explain_theory'
          }
        ]
      },

      monk_explain_theory: {
        id: 'monk_explain_theory',
        speaker: 'grey_penitent_monk',
        portrait: 'portrait_brother_vel',
        text: 'The Arcanate — before the Shattering — spent two decades trying to understand the void-entity. Their conclusion was that it is not a god. It is a very large predator with a very primitive kind of identity. And all identities, however alien, have a name. Not the name they\'re given — the name they ARE. Speaking that name in the void-entity\'s presence, correctly, creates a binding resonance.',
        choices: [
          {
            text: 'How do you know this?',
            conditions: [],
            effects: [],
            next: 'monk_source_knowledge'
          },
          {
            text: 'And you think you can find this name?',
            conditions: [],
            effects: [],
            next: 'monk_finding_name'
          }
        ]
      },

      monk_source_knowledge: {
        id: 'monk_source_knowledge',
        speaker: 'grey_penitent_monk',
        portrait: 'portrait_brother_vel',
        text: 'The Penitents\' archive holds the last complete record of Arcanate research. Most of it was destroyed in the post-Shattering purges — people blamed the Arcanate\'s research for the Shattering itself. We saved what we could. In those records are four incomplete references to "the Name-carving" — and descriptions of four monoliths placed in the Underlurk before the collapse.',
        choices: [
          {
            text: 'You want me to find these monoliths.',
            conditions: [],
            effects: [],
            next: 'monk_quest_offer'
          }
        ]
      },

      monk_finding_name: {
        id: 'monk_finding_name',
        speaker: 'grey_penitent_monk',
        portrait: 'portrait_brother_vel',
        text: 'I know it exists across four monolith inscriptions in the Underlurk. I know the locations from old survey maps. I cannot go myself — I have the lungs of a man who spent seventeen years in a scriptorium. And the Abbess won\'t authorize a mission without proof it\'s not reckless. She considers all of this reckless.',
        choices: [
          {
            text: 'I\'ll go. Where are the monoliths?',
            conditions: [],
            effects: [
              { type: 'start_quest', questId: 'side_hollow_name' }
            ],
            next: 'monk_monolith_locations'
          }
        ]
      },

      monk_quest_offer: {
        id: 'monk_quest_offer',
        speaker: 'grey_penitent_monk',
        portrait: 'portrait_brother_vel',
        text: 'Yes. I need someone who can reach them and transcribe the inscriptions accurately. I have rubbing-cloth and a phonetic template. It doesn\'t require understanding the language — just copying each symbol carefully. Will you?',
        choices: [
          {
            text: 'Yes. Show me the locations.',
            conditions: [],
            effects: [
              { type: 'start_quest', questId: 'side_hollow_name' }
            ],
            next: 'monk_monolith_locations'
          },
          {
            text: 'What would binding it actually accomplish?',
            conditions: [],
            effects: [],
            next: 'monk_binding_effect'
          }
        ]
      },

      monk_binding_effect: {
        id: 'monk_binding_effect',
        speaker: 'grey_penitent_monk',
        portrait: 'portrait_brother_vel',
        text: 'It doesn\'t destroy it. Nothing does — the Arcanate proved that. But it... fixes it in place. Removes its ability to reach upward through the Void Anchors. Removes its ability to influence the Cult. It would still exist. But it would be a contained thing rather than an expanding one.',
        choices: [
          {
            text: 'That\'s worth pursuing. I\'ll go.',
            conditions: [],
            effects: [
              { type: 'start_quest', questId: 'side_hollow_name' }
            ],
            next: 'monk_monolith_locations'
          }
        ]
      },

      monk_monolith_locations: {
        id: 'monk_monolith_locations',
        speaker: 'grey_penitent_monk',
        portrait: 'portrait_brother_vel',
        text: '(He produces a hand-drawn map with great care.) Four locations. Upper shallows — marked with the old Arcanate survey triangle. Near the Vorrkai settlement, if there still is one — the elder will know. An abandoned cult shrine in the mid-Underlurk. And one below the Void Sanctum itself. That last one may require... dealing with whoever guards the Sanctum. I\'m sorry.',
        choices: [
          {
            text: 'I\'ve dealt with worse. I\'ll return with the transcriptions.',
            conditions: [],
            effects: [],
            next: null
          }
        ]
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 11. THORNMERE ALCHEMIST (side quest 4)
  // ═══════════════════════════════════════════════════════════════════════════

  thornmere_alchemist: {
    root: 'alchemist_greet',
    nodes: {
      alchemist_greet: {
        id: 'alchemist_greet',
        speaker: 'thornmere_alchemist',
        portrait: 'portrait_syllis_vaar',
        text: '(She doesn\'t look up from the alembic, which is producing a steady blue vapor.) Welcome. Browse or buy — I have both capabilities and limited patience for browsing. What do you need?',
        choices: [
          {
            text: 'I\'d like to see what you\'re selling.',
            conditions: [],
            effects: [{ type: 'open_shop', npcId: 'thornmere_alchemist' }],
            next: null
          },
          {
            text: 'Use the alembic to craft something.',
            conditions: [],
            effects: [{ type: 'open_crafting', stationId: 'alembic' }],
            next: null
          },
          {
            text: 'What can you tell me about the ingredients you stock?',
            conditions: [],
            effects: [],
            next: 'alchemist_ingredients'
          },
          {
            text: 'You look like you might need something yourself.',
            conditions: [],
            effects: [],
            next: 'alchemist_personal_condition'
          }
        ]
      },

      alchemist_ingredients: {
        id: 'alchemist_ingredients',
        speaker: 'thornmere_alchemist',
        portrait: 'portrait_syllis_vaar',
        text: '(She finally looks up.) Rootmoss is the base of most healing work — it has a natural resonance affinity that accelerates cell repair. Emberpetal is a stamina booster and a heat catalyst. Shadowcap is useful for stealth preparations and paradoxically for antidotes. Voidbloom — (She pauses.) Be careful with Voidbloom. It\'s powerful and it wants to do things your body might not have asked for.',
        choices: [
          {
            text: 'Where does Voidbloom come from?',
            conditions: [],
            effects: [],
            next: 'alchemist_voidbloom_source'
          },
          {
            text: 'I\'ll keep that in mind. Thank you.',
            conditions: [],
            effects: [],
            next: null
          }
        ]
      },

      alchemist_voidbloom_source: {
        id: 'alchemist_voidbloom_source',
        speaker: 'thornmere_alchemist',
        portrait: 'portrait_syllis_vaar',
        text: 'The Underlurk shallows — it grows near the void-energy seepage. Which should tell you something about what it carries. My supplier stopped coming six months ago. I\'m almost out of stock. If you encounter it in the Underlurk and bring me some, I\'ll buy it at a premium and ask no questions about how you got into the Underlurk.',
        choices: [
          {
            text: 'I\'ll keep my eyes open.',
            conditions: [],
            effects: [],
            next: null
          }
        ]
      },

      alchemist_personal_condition: {
        id: 'alchemist_personal_condition',
        speaker: 'thornmere_alchemist',
        portrait: 'portrait_syllis_vaar',
        text: '(She pauses, hands still for the first time.) Perceptive. (She sets down the stirring rod carefully.) I have an alchemical degenerative condition. Forty years of exposure to reactive ingredients. The hands were first. Now it\'s moving inward. I am working on a treatment — the final component requires herbs I can no longer travel to gather myself.',
        choices: [
          {
            text: 'I can gather them for you.',
            conditions: [],
            effects: [
              { type: 'start_quest', questId: 'side_alchemist_garden' }
            ],
            next: 'alchemist_quest_start'
          },
          {
            text: 'I\'m sorry to hear that.',
            conditions: [],
            effects: [],
            next: 'alchemist_sorry_response'
          }
        ]
      },

      alchemist_sorry_response: {
        id: 'alchemist_sorry_response',
        speaker: 'thornmere_alchemist',
        portrait: 'portrait_syllis_vaar',
        text: 'Don\'t be. Forty years of genuine alchemical research. I\'d do it again. I just wish I\'d worn the gloves more consistently. If you could gather the herbs I need, I would be grateful — and I would teach you something worth knowing in return.',
        choices: [
          {
            text: 'Tell me what you need.',
            conditions: [],
            effects: [
              { type: 'start_quest', questId: 'side_alchemist_garden' }
            ],
            next: 'alchemist_quest_start'
          }
        ]
      },

      alchemist_quest_start: {
        id: 'alchemist_quest_start',
        speaker: 'thornmere_alchemist',
        portrait: 'portrait_syllis_vaar',
        text: 'Three things. Three Emberpetal from the south slope of Emberpeak — early-bloom, before the salamanders establish their breeding territory. Two Voidbloom from the Underlurk shallows. And four Rootmoss from directly below the Thornpillar\'s base — the growth there is uniquely resonant. In return, I\'ll teach you the Rootstone Elixir formula. No one else on this continent has it.',
        choices: [
          {
            text: 'I\'ll return with what you need.',
            conditions: [],
            effects: [{ type: 'set_flag', flag: 'alchemist_garden_accepted' }],
            next: null
          }
        ]
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 12. HIGH CONSUL VARENNE OSEL — Act 2 Concordat alliance
  // ═══════════════════════════════════════════════════════════════════════════

  varenne_osel_intro: {
    root: 'varenne_greet',
    nodes: {
      varenne_greet: {
        id: 'varenne_greet',
        speaker: 'varenne_osel',
        portrait: 'portrait_varenne',
        text: '(She does not rise from her seat. The Concordat Hall is quiet in the way that expensive things are quiet.) I was told a Rootwarden emissary would come. You are not what I expected. Sit. Or stand — I\'m told emissaries sometimes prefer to stand so they can leave quickly if the conversation goes poorly.',
        choices: [
          {
            text: 'The Rootwarden Circle requests your alliance against the Underlurk Cult.',
            conditions: [],
            effects: [],
            next: 'varenne_alliance_request'
          },
          {
            text: 'I prefer to stand. The Thornpillar is dying. We need your help.',
            conditions: [],
            effects: [],
            next: 'varenne_thornpillar_direct'
          }
        ]
      },

      varenne_alliance_request: {
        id: 'varenne_alliance_request',
        speaker: 'varenne_osel',
        portrait: 'portrait_varenne',
        text: '(A slight smile.) Of course they do. The Rootwardens always come to the Concordat when their principles fail to keep the sky up. I am not dismissing the request — the Thornpillar\'s health is very much a Concordat concern. Trade routes depend on these Shards remaining aloft. But alliance requires reciprocity. What does the Circle offer?',
        choices: [
          {
            text: 'Access to Rootwarden monitoring data.',
            conditions: [],
            effects: [],
            next: 'varenne_data_offer'
          },
          {
            text: 'The Concordat\'s trade position is at risk if the Shards fall. That should be enough.',
            conditions: [{ type: 'skill_gte', skill: 'persuasion', level: 30 }],
            effects: [],
            next: 'varenne_leverage_response'
          },
          {
            text: 'Sathis offers goodwill and public endorsement of Concordat governance.',
            conditions: [],
            effects: [],
            next: 'varenne_goodwill_response'
          }
        ]
      },

      varenne_thornpillar_direct: {
        id: 'varenne_thornpillar_direct',
        speaker: 'varenne_osel',
        portrait: 'portrait_varenne',
        text: 'I know the Thornpillar is dying. I have known for longer than the Rootwardens realized we did. The Concordat has its own monitoring instruments — we just don\'t advertise them. The question is not whether I\'m aware of the crisis. The question is what you offer in exchange for our resources.',
        choices: [
          {
            text: 'What would it take?',
            conditions: [],
            effects: [],
            next: 'varenne_terms'
          }
        ]
      },

      varenne_data_offer: {
        id: 'varenne_data_offer',
        speaker: 'varenne_osel',
        portrait: 'portrait_varenne',
        text: 'Better than goodwill. Data has value. Very well — I\'ll commit Concordat logistics, trade-route coordination, and two hundred Factor-grade personnel to support Rootwarden operations. In exchange, the Circle shares monitoring data with our economic forecasting bureau and grants the Concordat trade access to Aetherwood products currently restricted by Sylveni custom.',
        choices: [
          {
            text: 'The Aetherwood access may be a problem with the Sylveni.',
            conditions: [],
            effects: [],
            next: 'varenne_sylveni_pushback'
          },
          {
            text: 'Agreed. We have a deal.',
            conditions: [],
            effects: [
              { type: 'set_flag',      flag: 'concordat_alliance_offered' },
              { type: 'change_rep',    faction: 'auric_concordat', amount: 25 },
              { type: 'advance_quest', questId: 'main_act2', stageId: 'return_to_sathis' }
            ],
            next: 'varenne_deal_confirmed'
          }
        ]
      },

      varenne_leverage_response: {
        id: 'varenne_leverage_response',
        speaker: 'varenne_osel',
        portrait: 'portrait_varenne',
        text: '(A longer pause this time, and something that might almost be respect.) You\'re not wrong. (She stands and crosses to the window.) The Concordat\'s entire economic model depends on the Shards remaining viable. If they fall, we fall with them — more literally than most. Fine. For the sake of framing this as mutual interest rather than charity: we assist. Data sharing and trade access. These are my terms. Will Sathis accept them?',
        choices: [
          {
            text: 'He will. We have a deal.',
            conditions: [],
            effects: [
              { type: 'set_flag',      flag: 'concordat_alliance_offered' },
              { type: 'change_rep',    faction: 'auric_concordat', amount: 20 },
              { type: 'advance_quest', questId: 'main_act2', stageId: 'return_to_sathis' }
            ],
            next: 'varenne_deal_confirmed'
          }
        ]
      },

      varenne_goodwill_response: {
        id: 'varenne_goodwill_response',
        speaker: 'varenne_osel',
        portrait: 'portrait_varenne',
        text: '(Drily.) Public endorsement. Of a government the Concordat already runs. How generous. No. If Sathis wants Concordat resources, he will offer something with actual weight.',
        choices: [
          {
            text: 'Data access and Aetherwood trade.',
            conditions: [],
            effects: [],
            next: 'varenne_data_offer'
          },
          {
            text: 'Then we\'re done here.',
            conditions: [],
            effects: [],
            next: null
          }
        ]
      },

      varenne_terms: {
        id: 'varenne_terms',
        speaker: 'varenne_osel',
        portrait: 'portrait_varenne',
        text: 'Rootwarden resonance data — shared to our economic modeling bureau. And Aetherwood trade access: the Sylveni have restricted it for two centuries on cultural grounds. The Rootwarden Circle has enough influence with the Sylveni to negotiate an exemption. Those are my terms. Meet them and you have everything the Concordat can offer.',
        choices: [
          {
            text: 'Agreed.',
            conditions: [],
            effects: [
              { type: 'set_flag',      flag: 'concordat_alliance_offered' },
              { type: 'change_rep',    faction: 'auric_concordat', amount: 25 },
              { type: 'advance_quest', questId: 'main_act2', stageId: 'return_to_sathis' }
            ],
            next: 'varenne_deal_confirmed'
          },
          {
            text: 'I need to consult with Elder Sathis first.',
            conditions: [],
            effects: [],
            next: null
          }
        ]
      },

      varenne_sylveni_pushback: {
        id: 'varenne_sylveni_pushback',
        speaker: 'varenne_osel',
        portrait: 'portrait_varenne',
        text: 'Yes, it is. I suggest you make it less of a problem. The Sylveni will complain. They will then adapt, as all peoples adapt when circumstances require it. I\'m not asking for exploitation — I\'m asking for commerce. There is a difference. Are we agreed?',
        choices: [
          {
            text: 'We\'re agreed.',
            conditions: [],
            effects: [
              { type: 'set_flag',      flag: 'concordat_alliance_offered' },
              { type: 'change_rep',    faction: 'auric_concordat', amount: 25 },
              { type: 'advance_quest', questId: 'main_act2', stageId: 'return_to_sathis' }
            ],
            next: 'varenne_deal_confirmed'
          }
        ]
      },

      varenne_deal_confirmed: {
        id: 'varenne_deal_confirmed',
        speaker: 'varenne_osel',
        portrait: 'portrait_varenne',
        text: '(She extends her hand — a precise, formal gesture.) Good. The Concordat commits to the Rootwarden alliance. Bring me a written confirmation from Elder Sathis within a fortnight and we will begin logistical coordination. One more thing: if your investigations reveal information relevant to Concordat trade stability, I expect to be informed. That is not optional.',
        choices: [
          {
            text: 'Understood.',
            conditions: [],
            effects: [],
            next: null
          }
        ]
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 13. WARMASTER KASH — Act 2 Iron Compact alliance
  // ═══════════════════════════════════════════════════════════════════════════

  warmaster_kash_intro: {
    root: 'kash_greet',
    nodes: {
      kash_greet: {
        id: 'kash_greet',
        speaker: 'warmaster_kash',
        portrait: 'portrait_kash',
        text: '(She doesn\'t stop sparring when you enter. The training dummy takes three more precise strikes before she stops and turns.) Rootwarden emissary. Cael\'s doing? (She wipes her hands on a cloth.) Talk fast — I give everyone three minutes.',
        choices: [
          {
            text: 'The Thornpillar is being sabotaged. We need military support.',
            conditions: [],
            effects: [],
            next: 'kash_military_offer'
          },
          {
            text: 'The Underlurk Cult is actively attacking Rootwarden infrastructure.',
            conditions: [],
            effects: [],
            next: 'kash_cult_threat'
          }
        ]
      },

      kash_military_offer: {
        id: 'kash_military_offer',
        speaker: 'warmaster_kash',
        portrait: 'portrait_kash',
        text: '(She is already interested, though she doesn\'t show it.) Sabotage. By who?',
        choices: [
          {
            text: 'The Underlurk Cult. They\'ve been systematically targeting monitoring stations.',
            conditions: [],
            effects: [],
            next: 'kash_cult_response'
          }
        ]
      },

      kash_cult_threat: {
        id: 'kash_cult_threat',
        speaker: 'warmaster_kash',
        portrait: 'portrait_kash',
        text: '(Something shifts in her expression.) The Cult. I\'ve had three Compact patrols disappear near the Underlurk Chasm access points in the last two months. I wasn\'t going to admit that publicly. (A pause.) What do you need?',
        choices: [
          {
            text: 'Military support. Escort capacity, and soldiers for the Void Anchor sites.',
            conditions: [],
            effects: [],
            next: 'kash_terms'
          }
        ]
      },

      kash_cult_response: {
        id: 'kash_cult_response',
        speaker: 'warmaster_kash',
        portrait: 'portrait_kash',
        text: '(She sits on the edge of a table, crossing her arms.) Cultists destroying Rootstones. If they succeed, everything on this Shard falls into the abyss. Including two decades of everything I\'ve built. (Flat.) What\'s the ask?',
        choices: [
          {
            text: 'Military alliance. Soldiers for Void Anchor sites, escort capacity for Rootwarden operations.',
            conditions: [],
            effects: [],
            next: 'kash_terms'
          }
        ]
      },

      kash_terms: {
        id: 'kash_terms',
        speaker: 'warmaster_kash',
        portrait: 'portrait_kash',
        text: 'I can do that. Here\'s what I want in return: Rootwarden public recognition of the Iron Compact as a legitimate governing military authority — not a mercenary organization. We\'ve earned that. And after this is over, the Compact gets first priority for any Rootwarden-adjacent defense contracts. That\'s it. I\'m not asking for land. Just respect.',
        choices: [
          {
            text: 'I\'ll bring that to Elder Sathis. I think he\'ll agree.',
            conditions: [],
            effects: [
              { type: 'set_flag',      flag: 'iron_compact_alliance_offered' },
              { type: 'change_rep',    faction: 'iron_compact', amount: 25 },
              { type: 'advance_quest', questId: 'main_act2', stageId: 'return_to_sathis' }
            ],
            next: 'kash_deal_confirmed'
          },
          {
            text: 'The public endorsement might be a problem. Can we negotiate?',
            conditions: [{ type: 'skill_gte', skill: 'persuasion', level: 25 }],
            effects: [],
            next: 'kash_negotiate'
          }
        ]
      },

      kash_negotiate: {
        id: 'kash_negotiate',
        speaker: 'warmaster_kash',
        portrait: 'portrait_kash',
        text: '(She considers you for a moment.) ...Fine. Private written acknowledgment from Elder Sathis personally, and three years of Rootwarden advisory access for our border operations planning. Same outcome, less public ceremony. We have a deal?',
        choices: [
          {
            text: 'We have a deal.',
            conditions: [],
            effects: [
              { type: 'set_flag',      flag: 'iron_compact_alliance_offered' },
              { type: 'change_rep',    faction: 'iron_compact', amount: 20 },
              { type: 'advance_quest', questId: 'main_act2', stageId: 'return_to_sathis' }
            ],
            next: 'kash_deal_confirmed'
          }
        ]
      },

      kash_deal_confirmed: {
        id: 'kash_deal_confirmed',
        speaker: 'warmaster_kash',
        portrait: 'portrait_kash',
        text: '(She extends a hand.) I\'ll have two units on standby within the week. If you need extraction or combat support near the Underlurk, signal with a blue torch. My people know that code. One thing: if you discover what happened to my missing patrols — tell me first. Before anyone else.',
        choices: [
          {
            text: 'Agreed.',
            conditions: [],
            effects: [],
            next: null
          }
        ]
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 14. ABBESS VONN — Act 2 Grey Penitents alliance
  // ═══════════════════════════════════════════════════════════════════════════

  abbess_vonn_intro: {
    root: 'abbess_greet',
    nodes: {
      abbess_greet: {
        id: 'abbess_greet',
        speaker: 'abbess_vonn',
        portrait: 'portrait_abbess_vonn',
        text: '(She is in the scriptorium, reading. She closes the book carefully before speaking.) I know why you\'re here. The Rootwardens need allies. I\'ve been expecting this since the Thornpillar\'s output dropped fourteen percent. Sit down.',
        choices: [
          {
            text: 'You\'ve been monitoring the Dimming as well?',
            conditions: [],
            effects: [],
            next: 'abbess_monitoring_explain'
          },
          {
            text: 'Then you know what\'s at stake. Will the Penitents help?',
            conditions: [],
            effects: [],
            next: 'abbess_help_question'
          }
        ]
      },

      abbess_monitoring_explain: {
        id: 'abbess_monitoring_explain',
        speaker: 'abbess_vonn',
        portrait: 'portrait_abbess_vonn',
        text: 'The Grey Penitents have monitored the Rootstones since before the Rootwarden Circle existed. Our archive contains the original Arcanate construction records — we know what the Rootstones are supposed to read, and what they read when they\'re failing. We knew something was wrong before Cael did. We also know more about what could be causing it than we have chosen to share publicly.',
        choices: [
          {
            text: 'Why haven\'t you shared it?',
            conditions: [],
            effects: [],
            next: 'abbess_why_silent'
          }
        ]
      },

      abbess_why_silent: {
        id: 'abbess_why_silent',
        speaker: 'abbess_vonn',
        portrait: 'portrait_abbess_vonn',
        text: 'Because the knowledge is dangerous. The Arcanate died because they knew too much and acted on it too confidently. The Grey Penitents exist to carry that knowledge carefully, sharing it only when sharing it causes less damage than withholding it. I\'ve been waiting for the right moment. I believe you are part of that moment.',
        choices: [
          {
            text: 'What do you know that you\'ve been holding back?',
            conditions: [],
            effects: [],
            next: 'abbess_secret_knowledge'
          },
          {
            text: 'Will the Penitents join us?',
            conditions: [],
            effects: [],
            next: 'abbess_help_question'
          }
        ]
      },

      abbess_secret_knowledge: {
        id: 'abbess_secret_knowledge',
        speaker: 'abbess_vonn',
        portrait: 'portrait_abbess_vonn',
        text: 'The Kindling ritual. We have the complete Arcanate formula for restoring damaged Rootstones. Sathis has part of it — the Rootwardens preserved fragments. We have the rest. Including the clause the Rootwardens\' fragment omitted: the cost of the Willing Anchor.',
        choices: [
          {
            text: 'What is the cost?',
            conditions: [],
            effects: [],
            next: 'abbess_anchor_cost'
          }
        ]
      },

      abbess_anchor_cost: {
        id: 'abbess_anchor_cost',
        speaker: 'abbess_vonn',
        portrait: 'portrait_abbess_vonn',
        text: '(Quietly.) The Willing Anchor does not return. What the Rootwardens call "remaining in the network" — the Arcanate records are more specific. The Anchor\'s identity dissolves. They become the resonance itself. Whether that constitutes survival is a philosophical question that I find I cannot answer with confidence.',
        choices: [
          {
            text: 'Sathis intends to be the Anchor.',
            conditions: [{ type: 'has_flag', flag: 'kindling_ritual_known' }],
            effects: [],
            next: 'abbess_sathis_anchor'
          },
          {
            text: 'I see. Will you help regardless?',
            conditions: [],
            effects: [],
            next: 'abbess_help_question'
          }
        ]
      },

      abbess_sathis_anchor: {
        id: 'abbess_sathis_anchor',
        speaker: 'abbess_vonn',
        portrait: 'portrait_abbess_vonn',
        text: '(A long pause.) Yes. I know. He told me, years ago, that he expected this might be the ending. He was making peace with it long before this crisis began. I think that is either very brave or very sad. Perhaps both.',
        choices: [
          {
            text: 'Is there another way?',
            conditions: [],
            effects: [],
            next: 'abbess_another_way'
          },
          {
            text: 'Will the Penitents support the alliance?',
            conditions: [],
            effects: [],
            next: 'abbess_help_question'
          }
        ]
      },

      abbess_another_way: {
        id: 'abbess_another_way',
        speaker: 'abbess_vonn',
        portrait: 'portrait_abbess_vonn',
        text: 'Brother Vel believes so. He\'s been researching the void-entity\'s true name for seventeen years. If the entity were bound, the Kindling might be unnecessary — or the cost significantly reduced. I consider it a long shot. But I authorized his research for a reason. Long shots have saved Aethermoor before.',
        choices: [
          {
            text: 'I\'ll look into it. Now — the alliance?',
            conditions: [],
            effects: [],
            next: 'abbess_help_question'
          }
        ]
      },

      abbess_help_question: {
        id: 'abbess_help_question',
        speaker: 'abbess_vonn',
        portrait: 'portrait_abbess_vonn',
        text: 'Yes. The Grey Penitents will join the alliance. We offer our archive — including the complete Kindling formula — our network of monasteries for supply lines and field medicine, and Brother Vel\'s research in whatever form it takes. We ask one thing: if you find what happened at the end of the Arcanate\'s final experiment — the reason for the Shattering itself — you bring that information to us before you act on it.',
        choices: [
          {
            text: 'Agreed. We have an alliance.',
            conditions: [],
            effects: [
              { type: 'set_flag',      flag: 'penitents_alliance_offered' },
              { type: 'change_rep',    faction: 'grey_penitents', amount: 25 },
              { type: 'advance_quest', questId: 'main_act2', stageId: 'return_to_sathis' }
            ],
            next: 'abbess_deal_confirmed'
          },
          {
            text: 'Why does that matter so much to you?',
            conditions: [],
            effects: [],
            next: 'abbess_why_shattering'
          }
        ]
      },

      abbess_why_shattering: {
        id: 'abbess_why_shattering',
        speaker: 'abbess_vonn',
        portrait: 'portrait_abbess_vonn',
        text: 'Because the Grey Penitents exist to prevent it from happening again. If the Underlurk Cult is recreating the conditions of the Shattering intentionally — and I believe they are — then the cause of the first one is directly relevant to stopping the second. That knowledge belongs in careful hands. We are, I hope, careful hands.',
        choices: [
          {
            text: 'Agreed. We have an alliance.',
            conditions: [],
            effects: [
              { type: 'set_flag',      flag: 'penitents_alliance_offered' },
              { type: 'change_rep',    faction: 'grey_penitents', amount: 25 },
              { type: 'advance_quest', questId: 'main_act2', stageId: 'return_to_sathis' }
            ],
            next: 'abbess_deal_confirmed'
          }
        ]
      },

      abbess_deal_confirmed: {
        id: 'abbess_deal_confirmed',
        speaker: 'abbess_vonn',
        portrait: 'portrait_abbess_vonn',
        text: '(She stands and extends both hands — the Penitent gesture of covenant, palms up.) Then we are bound to this together. Tell Elder Sathis the Penitents stand with the Circle. And tell him — (She hesitates.) Tell him we remember what he has given already. And we are grateful.',
        choices: [
          {
            text: 'I will. Thank you, Abbess.',
            conditions: [],
            effects: [],
            next: null
          }
        ]
      }
    }
  }
};

// ─── HELPER FUNCTIONS ──────────────────────────────────────────────────────

/**
 * Returns a dialogue tree by id.
 * @param {string} id
 * @returns {object|null}
 */
export function getDialogueTree(id) {
  return DIALOGUE_TREES[id] || null;
}

/**
 * Returns a specific node within a dialogue tree.
 * @param {string} treeId
 * @param {string} nodeId
 * @returns {object|null}
 */
export function getDialogueNode(treeId, nodeId) {
  const tree = DIALOGUE_TREES[treeId];
  if (!tree) return null;
  return tree.nodes[nodeId] || null;
}

/**
 * Returns the root node of a dialogue tree.
 * @param {string} treeId
 * @returns {object|null}
 */
export function getRootNode(treeId) {
  const tree = DIALOGUE_TREES[treeId];
  if (!tree) return null;
  return tree.nodes[tree.root] || null;
}

/**
 * Returns all dialogue trees that have a given speaker.
 * @param {string} speakerId - NPC id
 * @returns {object[]}
 */
export function getTreesBySpeaker(speakerId) {
  return Object.values(DIALOGUE_TREES).filter(tree =>
    Object.values(tree.nodes).some(node => node.speaker === speakerId)
  );
}
