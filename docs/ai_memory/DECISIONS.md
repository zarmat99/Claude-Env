# Valdombra — ARCHITECTURE DECISIONS (ADR)

> Record every important architectural decision here. Newest decisions appended at the bottom.

---

## Decision 1 — Engine: Godot 4.x
- **Date**: 2026-06-25
- **Context**: Need a free, modern, well-documented 2D engine with scene composition and a
  scripting language suited to rapid, modular iteration.
- **Decision**: Use **Godot 4.x** with **GDScript**.
- **Motivation**: First-class 2D, node/scene composition maps cleanly to a component design,
  GDScript 2.0 has static typing + signals, autoload singletons fit our global systems, free &
  open-source, large community.
- **Alternatives considered**: Unity (heavier, licensing concerns), Phaser/Canvas2D (a prior
  attempt failed — see project history), bespoke engine (too costly).
- **Consequences**: Project is `project.godot`-based; we lean on autoloads, signals, scenes and
  the `.godot/` editor cache (git-ignored).

## Decision 2 — Perspective: 2D top-down (not isometric)
- **Date**: 2026-06-25
- **Context**: Need an exploration-friendly perspective that is cheap to author and to collide.
- **Decision**: **Top-down** orthogonal 2D.
- **Motivation**: Simplest movement & collision (axis-aligned), trivial tile alignment, easy
  placeholder art, fastest path to a vertical slice; matches the requested feel.
- **Alternatives considered**: Isometric (more art-/sorting-complexity), side-scroller (wrong
  genre feel).
- **Consequences**: Movement uses `CharacterBody2D` velocity; depth sorting via `y_sort` later.

## Decision 3 — Content is data-driven via JSON
- **Date**: 2026-06-25
- **Context**: Content (items/quests/dialogue/NPCs/enemies/factions/skills/maps) must scale and
  be editable by humans **and** AI agents without touching engine code.
- **Decision**: Store content as **JSON** under `res://data/`, loaded once by a `DataRegistry`
  autoload into typed runtime model objects (`ItemData`, `QuestData`, …).
- **Motivation**: JSON is engine-agnostic, diff/merge friendly, and trivially editable by agents
  and tools. A central registry gives one validated load path and stable ID lookups.
- **Alternatives considered**: Godot `.tres` Resources (type-safe + editor UI, but more
  engine-coupled and harder for external tools/agents to edit/merge); hardcoding (rejected by
  the architecture rules).
- **Consequences**: We write small parser/validator code and runtime model classes. We MAY add a
  `.tres` export path later for editor convenience, but JSON remains the source of truth.

## Decision 4 — Component-based actors
- **Date**: 2026-06-25
- **Context**: Player, NPCs, enemies share behaviours (health, stats, inventory, interaction).
- **Decision**: Behaviours live in **reusable Node components** attached to an actor scene;
  actors compose components rather than inheriting a fat base.
- **Motivation**: Reuse, isolation, testability; avoids god-objects.
- **Alternatives considered**: Deep inheritance (rigid), single monolithic actor script
  (rejected).
- **Consequences**: Components expose signals + a small API; the owning actor wires them. An
  `Actor.gd` base provides shared plumbing only.

## Decision 5 — System communication: EventBus + autoload managers
- **Date**: 2026-06-25
- **Context**: Systems must react to each other without tight coupling.
- **Decision**: Global **EventBus** (autoload of named signals) for *notifications*
  (`quest_started`, `item_added`, `actor_died`, …); **autoload manager singletons**
  (`QuestManager`, `DialogueManager`, `InventoryManager`, …) for *queries/commands*.
- **Motivation**: Loose coupling for fan-out events, explicit APIs for direct queries; easy to
  trace and to test.
- **Alternatives considered**: Direct node references everywhere (brittle), pure polling
  (wasteful).
- **Consequences**: Event names are a shared contract documented in `architecture/SYSTEMS.md`;
  emit through EventBus, never reach across the scene tree directly for global concerns.

## Decision 6 — Persistent identity (`persistent_id`)
- **Date**: 2026-06-25
- **Context**: The world must remember player actions across save/reload (opened chests, dead
  bosses, unlocked doors, taken unique items).
- **Decision**: Every persistent world object carries a stable, globally-unique
  **`persistent_id`** string; the save file stores per-id state, applied on map load.
- **Motivation**: Deterministic, position-independent persistence; survives map edits.
- **Alternatives considered**: Position-based keys (break when maps change), scene-path keys
  (fragile to renames).
- **Consequences**: Authors must assign `persistent_id` to persistent objects; IDs are never
  reused/renumbered once shipped. Convention in `PROJECT_MEMORY.md` §10.

## Decision 7 — Save system: JSON in `user://`, skeleton early
- **Date**: 2026-06-25
- **Context**: Save/load is requested later (M7) but the architecture must not block it.
- **Decision**: `SaveManager` autoload serializes a snapshot of `GameState` to a **JSON file in
  `user://`** (e.g. `user://saves/slot_0.json`); the skeleton + schema exist from M0, full
  serialization lands in M7.
- **Motivation**: One serialization boundary (GameState), human-readable saves, easy to extend.
- **Alternatives considered**: `ConfigFile`, binary `var_to_bytes` (opaque), per-system save
  files (fragmented).
- **Consequences**: Everything persistable must be reachable from `GameState`; schema documented
  in `architecture/DATA_SCHEMAS.md`.

## Decision 8 — In-repo AI memory system
- **Date**: 2026-06-25
- **Context**: Continuity across AI/human sessions must not rely on chat history.
- **Decision**: Maintain `docs/ai_memory/` (PROJECT_MEMORY, SESSION_LOG, DECISIONS, TASKS,
  HANDOFF). Read at session start; update at session/block end.
- **Motivation**: Durable, versioned context that any agent or dev can resume from.
- **Alternatives considered**: Chat-only memory (lossy), external tracker (out of repo).
- **Consequences**: A small upkeep cost each session, enforced by the working rules.

## Decision 9 — Provisional name kept: "Valdombra"
- **Date**: 2026-06-25
- **Context**: A working title was requested; may change with a valid reason.
- **Decision**: Keep **Valdombra** (evokes "valley of shadow"; no known IP conflict; fits the
  medieval/dark-fantasy tone).
- **Motivation**: Evocative, original, on-theme; no reason to change.
- **Alternatives considered**: n/a (open to revisit if branding needs change).
- **Consequences**: Used as project name/title; not embedded in content IDs except where natural
  (e.g. `faction_valdombra_village`).

## Decision 10 — Documentation language: English
- **Date**: 2026-06-25
- **Context**: Memory is meant to be resumable by "any AI agent or human developer".
- **Decision**: Write docs in **English** (identifiers/IDs are English anyway).
- **Motivation**: Maximum portability for agents/tooling; consistency with code.
- **Alternatives considered**: Italian (user's working language). Will switch on request.
- **Consequences**: If the user prefers Italian, translate and keep one language consistently.

## Decision 11 — Roadmap includes mandatory scalability reviews
- **Date**: 2026-06-25
- **Context**: M0-M7 proved the prototype skeleton. Before producing the real map and story, the
  project needs explicit guardrails so test content does not become a hidden dependency and broad
  content creation remains mostly authoring work.
- **Decision**: Extend the roadmap through M20 and insert named scalability review gates: SR1 after
  progression, SR2 after world authoring, SR3 after narrative systems, SR4 before production region
  work, and SR5 before broad world/story expansion.
- **Motivation**: Keep the main objective visible: build systems and pipelines that make creating
  the real game world and story straightforward, repeatable, and safe.
- **Alternatives considered**: Continue feature milestones without review gates (too easy to drift);
  start real content immediately after M8 (too much risk before validation/tooling hardening).
- **Consequences**: Review milestones can block feature/content expansion until scalability issues
  are fixed or explicitly scheduled. `ROADMAP.md` is the source of truth for the full sequence;
  `TASKS.md` only expands near-term tasks.

## Decision 12 - Dynamic world objects persist through GameState metadata
- **Date**: 2026-06-25
- **Context**: M9 hardening found that runtime-spawned loot could disappear across save/load
  because only authored scene objects had stable `persistent_id`s.
- **Decision**: Runtime world objects that must survive save/load are represented in
  `GameState.world_objects` with a stable generated `persistent_id` and metadata describing how to
  rebuild them. M9 implements this for dynamic pickups with `state`, `kind`, `map_id`, `item_id`,
  `count`, and `position`.
- **Motivation**: Keep one persistence boundary (`GameState`) and avoid serializing arbitrary live
  scene nodes.
- **Consequences**: Dynamic systems must register persistable runtime objects before spawning them.
  Scene loaders rebuild active dynamic objects from state; collected/dead/unlocked states remain
  state changes on the same `persistent_id`.

## Decision 13 - M10 uses a generated technical proxy atlas before final art
- **Date**: 2026-06-25
- **Context**: Map authoring depends on asset constraints (tile size, layer/collision metadata,
  prop naming, import behavior), but final art direction belongs later in M17/M18.
- **Decision**: Use a generated dark-fantasy proxy atlas in M10, normalize it into a strict
  1024x1024 8x8 technical atlas, and validate it through `asset_sets.json` and headless tests.
- **Motivation**: Prove the pipeline with realistic-looking proxy content without letting test art
  become production art or delaying systems work for final visuals.
- **Consequences**: Future art can replace the proxy atlas if it preserves the documented
  `asset_sets.json` contract. M10 tests assert technical dimensions and tile metadata so generated
  or hand-made art cannot silently break the map pipeline.
