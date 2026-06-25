# Grimward — Handoff di sessione

**Data:** 2026-06-25  
**Branch attivo:** `claude/elder-scrolls-rpg-brainstorm-eiw0bl`  
**Stato:** tutto committato e pushato, `npm run validate` → **PASS** (1467 asset espansi, 93 famiglie, 1 mappa)

---

## Cos'è Grimward

Browser RPG 2D dark-nordic fantasy, vanilla JS + Canvas2D, ES modules, **nessun build step**.  
Tutto il mondo è descritto da JSON sotto `assets/data/` e renderizzato da PNG generati sotto `assets/generated/`.

- Dev server: `npm run dev` → `http://127.0.0.1:4173`
- Validazione dati: `npm run validate`
- Screenshot headless: `PORT=4399 PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node scripts/screenshot.mjs out.png`

---

## Cosa è successo in questa sessione

### Problema di partenza
La pipeline precedente usava ChatGPT per generare **atlas sheet** (griglia N×N di varianti) e poi le sliceva in tile. Questo era fondamentalmente sbagliato: ChatGPT genera **scene coerenti**, non griglie strutturate. Il risultato erano tile incoerenti, frammenti di bordi, grafica incomprensibile.

### Diagnosi root cause
- Slicing di un'immagine scenica → frammenti senza senso visivo
- Downscale dell'intera texture a 48px → tutte le varianti identiche (effetto checkerboard)
- Keying magenta con distanza euclidea → falliva su bordi anti-aliased scuri (es. `(156,3,154)` tra le gambe di un NPC surviveva come alone rosa)

### Soluzione adottata

**Architettura nuova (1 immagine ChatGPT per famiglia):**

```
assets/source/{family_id}.png   ← 1 immagine ChatGPT (1024x1024, sfondo #FF00FF)
        ↓
python scripts/process_asset.py {family_id} [--count N]
        ↓
assets/generated/{family_id}/{family_id}_01.png ... _NN.png
```

**Keying magenta per HUE** (non distanza euclidea):
```python
mg = min(r, b)
if (g + 35 < mg) and (abs(r - b) < 70) and (mg > 45):  # → alpha 0
if (g + 15 < mg) and (abs(r - b) < 95) and (mg > 28):  # → despill + alpha parziale
```

**Terrain region crops** (no downscale globale):  
La sorgente viene divisa in N sub-regioni distinte (griglia sqrt×sqrt). Ogni regione diventa una variante tile diversa → zero ripetizione visibile.

### File eliminati (pipeline vecchia)
- `scripts/generate_imagen_assets.py`
- `assets/imagen/` (8 atlas PNG)
- `assets/generated/asset-index.json`
- `assets/data/maps/test_courtyard.json`
- `scripts/serve.py`, `scripts/validate_content.py` (rimpiazzati da equivalenti npm)

---

## Stato attuale del progetto

### Mappa attiva
**`wolfpine_hollow.json`** (zona `test_city_quarter`) — accampamento di cacciatori in una radura forestale  
- 40×28 tile, `defaultTerrain: moss_mud_tile`
- Spawn giocatore: `[20, 24]` facing north
- Percorso: `road_path_tile` dal basso (sentiero sud → radura centrale)
- Bordi: `rock_mountain_tile` (invalicabile su tutti e 4 i lati)
- Oggetti: frost_pine_tree (25), heath_bush (8), cliff_wall (2), grey_boulder (4), interactive_prop (braciere), storage_prop (botte)
- NPC: `hollow_hunter` e `hollow_cook` (entrambi `npc_human_base`)

### Asset generati (ChatGPT → processati → presenti in `assets/generated/`)

| Family ID | Categoria | Varianti |
|-----------|-----------|----------|
| `moss_mud_tile` | terrain | 12 |
| `road_path_tile` | terrain | 12 |
| `rock_mountain_tile` | terrain | 12 |
| `frost_pine_tree` | vegetation | 30 |
| `heath_bush` | vegetation | 20 |
| `grey_boulder` | rock | 25 |
| `cliff_wall` | rock | 10 |
| `storage_prop` | prop | 20 |
| `loot_container` | prop | 20 |
| `interactive_prop` | prop | 20 |
| `npc_human_base` | creature | 20 |

**Sorgenti in `assets/source/`:** 11 PNG (uno per famiglia sopra)  
**Tutto il resto** in `asset_manifest.json` (93 famiglie totali) è definito ma **senza sorgente** → le varianti vengono generate come placeholder trasparenti dal validator.

---

## File chiave da conoscere

```
assets/data/asset_manifest.json   — definizione di tutte le 93 famiglie
assets/data/maps/wolfpine_hollow.json  — unica mappa di test
assets/data/maps.json             — indice mappe
assets/data/zones.json            — zone + startZone
assets/data/biome_rules.json      — regole bioma per test_city_quarter
scripts/process_asset.py          — pipeline normalizzazione asset
docs/STYLE_GUIDE.md               — palette, stile visivo, Master Style Block
docs/ASSET_PROMPTS.md             — prompt ChatGPT pronti per tutte e 11 le famiglie + ice_spire
docs/ADDING_CONTENT.md            — come aggiungere asset, biomi, mappe
src/core/Renderer.js              — rendering tile → entità → HUD/minimap
src/world/StaticMapBuilder.js     — carica JSON mappa → WorldState
src/core/ContentValidator.js      — validazione dati (REQUIRED_COUNTS ridotti a 12 per terrain)
```

---

## Come aggiungere un nuovo asset (workflow standard)

1. Vai in `docs/ASSET_PROMPTS.md`, trova o scrivi il prompt per la famiglia
2. Genera l'immagine in ChatGPT (1024×1024, sfondo magenta #FF00FF)
3. Salva in `assets/source/{family_id}.png`
4. `python scripts/process_asset.py {family_id} [--count N]`
5. `npm run validate`
6. Aggiungi la famiglia alla mappa in `assets/data/maps/wolfpine_hollow.json` se serve
7. Prendi uno screenshot: `PORT=4399 PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node scripts/screenshot.mjs out.png`

---

## Prossimi passi suggeriti

### Priorità 1 — Verificare visivamente la mappa attuale
```bash
PORT=4399 PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node scripts/screenshot.mjs out.png --desktop
```
Aprire `out.png` e verificare che i 10 asset reali rendano bene insieme.

### Priorità 2 — Asset mancanti per arricchire la mappa

| Family ID | Prompt in ASSET_PROMPTS.md | Note |
|-----------|---------------------------|------|
| `ice_spire` | Sì ✓ (aggiunto in questa sessione) | Per future zone neve/ghiaccio, NON per wolfpine |
| `creature_animal` | Da scrivere | Animale selvatico per dare vita alla radura |
| `creature_hostile` | Da scrivere | Primo nemico per testare combattimento |
| `loot_container` | Sì ✓ | Già processato ma non ancora piazzato in mappa |

### Priorità 3 — Meccaniche di gioco
Il motore base esiste (movimento, collisioni, NPC markers, rendering). Ancora da implementare:
- Dialogo con NPC
- Sistema di loot (raccolta da `loot_container`)
- Combattimento base
- Seconda mappa + transizione (`entrances.json` è vuoto)

---

## Gotcha tecnici appresi

### Terrain
- `dungeon_floor` ha grafica catene/prigione — **solo interni**, mai all'aperto
- `terrain_black_loam` è quasi nero pieno — usarlo su grandi aree crea buchi visivi
- Il minimap colora tile per `biomeColor(biomeId)` — ogni terrain family usata in mappa dovrebbe avere voce in `biomeColor`

### Pipeline asset
- Le immagini ChatGPT devono avere sfondo **esattamente magenta** (#FF00FF). Chiedere sempre "Background: solid hot pink magenta #FF00FF" nel prompt.
- Il keying funziona per HUE, quindi qualsiasi tonalità di magenta (anche scuro `(156,3,154)`) viene rimossa correttamente.
- Per terrain: il `--count` del manifest (12) determina quante sub-regioni si tagliano dalla sorgente. Se la sorgente è piccola e `count` è alto, le crop sono minuscole. 1024×1024 con count=12 → crop ~290×290px → ottimo.

### Codex CLI (tentativo fallito)
- L'utente ha provato ad autenticare Codex CLI per generare immagini automaticamente
- Il device-auth flow funziona ma richiede "device code authorization" abilitato nelle impostazioni di sicurezza ChatGPT — l'account dell'utente NON ha questa opzione
- Conclusione: la pipeline manuale (ChatGPT → salva PNG → script) rimane il workflow attuale

---

## Comandi utili rapidi

```bash
# Validare tutto il contenuto
npm run validate

# Screenshot della mappa (desktop, port libera)
PORT=4399 PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node scripts/screenshot.mjs out.png --desktop

# Processare un nuovo asset
python scripts/process_asset.py <family_id> --count <N>

# Verificare git status
git status --short

# Pushare sul branch attivo
git push -u origin claude/elder-scrolls-rpg-brainstorm-eiw0bl
```
