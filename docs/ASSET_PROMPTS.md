# Grimward — Prompt ChatGPT per asset prioritari

Ogni prompt va preceduto dal **Master Style Block** copiato da `STYLE_GUIDE.md`.
Il template è: `[Master Style Block]` + `[Camera block]` + `[Soggetto]`.

I prompt qui sotto includono già tutto — copia e incolla direttamente in ChatGPT.

---

## Come salvare e usare le immagini

1. Salva ogni output ChatGPT in `assets/source/{family_id}.png`
2. Esegui `python scripts/process_asset.py {family_id} --count N`
   - `N` = numero di varianti desiderate (default: 3)
3. Lo script produce `assets/generated/{family_id}/{family_id}_01.png` ... `_NN.png`

---

## Categoria: TERRAIN (terreno)

Camera: **top-down puro** — vedi solo la superficie dall'alto.

---

### `moss_mud_tile` — Terreno foresta muschiato

```
STYLE: Dark nordic fantasy pixel art RPG asset.
Pixel art style, 16-bit era, SNES quality, hand-crafted look.
Color palette: desaturated cold tones — dark stone (#364048, #506068),
dark earth (#261e18, #3e2e24), forest green (#1a2e1c, #2e4830),
ice blue (#8ab8c8). Shadows: #0d1117, #1a2128.
No bright colors. No neon. No glow unless magical.
Image size: 1024x1024 pixels.
Background: solid hot pink magenta #FF00FF — nothing else on background.
Subject centered, occupying 60-75% of canvas.

CAMERA: top-down view, orthographic, camera looking straight down,
no perspective, no side faces visible, flat surface texture only.

SUBJECT: seamless tileable terrain tile, cold dark forest floor.
Dark compacted soil (#261e18, #3e2e24) with uneven patches of deep green
moss (#1a2e1c, #2e4830). Scattered tiny pebbles. Slight surface irregularity.
Tileable on all 4 edges — no dominant features that would create visible
seams when tiled. No objects, no items. Pure ground texture.
Fill the entire canvas with the tiling texture (no border, no frame).
```

---

### `road_path_tile` — Sentiero di terra battuta

```
STYLE: Dark nordic fantasy pixel art RPG asset.
Pixel art style, 16-bit era, SNES quality, hand-crafted look.
Color palette: desaturated cold tones — dark earth (#261e18, #3e2e24),
warm earth (#604838), stone (#364048, #506068). Shadows: #0d1117, #1a2128.
No bright colors. No neon.
Image size: 1024x1024 pixels.
Background: solid hot pink magenta #FF00FF.
Subject centered, occupying 60-75% of canvas.

CAMERA: top-down view, orthographic, camera looking straight down, flat surface.

SUBJECT: seamless tileable terrain tile, packed dirt path or road.
Compacted earth (#3e2e24, #604838) with small embedded stones (#364048)
and faint wheel-rut grooves. Slightly textured, not perfectly smooth.
Muted brown-gray tone. Tileable on all 4 edges. No objects. Pure surface.
Fill the entire canvas with the tiling texture.
```

---

### `rock_mountain_tile` — Roccia/muro di roccia

```
STYLE: Dark nordic fantasy pixel art RPG asset.
Pixel art style, 16-bit era, SNES quality, hand-crafted look.
Color palette: stone tones — dark stone (#364048), stone (#506068),
light stone (#7a9098), stone highlight (#a8bcc0). Shadows: #0d1117, #1a2128.
Image size: 1024x1024 pixels.
Background: solid hot pink magenta #FF00FF.

CAMERA: top-down view, orthographic, camera looking straight down.

SUBJECT: seamless tileable terrain tile, solid dark granite rock face.
Top-down view of rough angular stone surface (#364048, #506068).
Small cracks and uneven breaks in the stone. Cold gray tone.
Tileable on all 4 edges. Dense and opaque — this is impassable terrain.
Fill entire canvas with the rock texture.
```

---

## Categoria: VEGETATION (vegetazione e natura)

Camera: **3/4 view** — vedi la cima dell'oggetto e il suo fronte.

---

### `frost_pine_tree` — Pino nordico con brina

```
STYLE: Dark nordic fantasy pixel art RPG asset.
Pixel art style, 16-bit era, SNES quality, hand-crafted look.
Color palette: forest green (#1a2e1c, #2e4830, #486040),
dark earth (#261e18) for trunk, ice blue (#8ab8c8) for frost touches.
Shadows: #0d1117, #1a2128. No bright colors.
Image size: 1024x1024 pixels.
Background: solid hot pink magenta #FF00FF.
Subject centered, occupying 60-75% of canvas.

CAMERA: top-down 3/4 RPG perspective, camera angled at approximately 60 degrees
from horizontal, you see the top and front of the object.

SUBJECT: a single dark nordic pine tree, tall and narrow.
Dark almost-black green foliage (#1a2e1c, #2e4830) with light frost on
branch tips (#8ab8c8). Short dark brown trunk visible at base (#261e18).
Silhouette reads clearly at small sizes. No bright green, no cartoon look.
Single tree, not a forest. Clean background.
```

---

### `heath_bush` — Cespuglio nordico basso

```
STYLE: Dark nordic fantasy pixel art RPG asset.
Pixel art style, 16-bit era, SNES quality.
Color palette: forest green (#1a2e1c, #2e4830, #486040),
dark earth (#261e18). Shadows: #0d1117.
Image size: 1024x1024 pixels.
Background: solid hot pink magenta #FF00FF.
Subject centered, occupying 60-75% of canvas.

CAMERA: top-down 3/4 RPG perspective, 60 degrees from horizontal.

SUBJECT: a low hardy northern shrub/bush, wide and squat.
Dense dark foliage (#1a2e1c, #2e4830), small dry leaves, few berries.
Low to the ground, roughly circular top silhouette.
Reads clearly at 48x48 pixels. Not too detailed.
Single bush, clean magenta background.
```

---

## Categoria: ROCK / NATURE (rocce e natura)

---

### `grey_boulder` — Masso grigio medio

```
STYLE: Dark nordic fantasy pixel art RPG asset.
Pixel art style, 16-bit era, SNES quality.
Color palette: stone (#364048, #506068, #7a9098, #a8bcc0).
Shadows: #0d1117, #1a2128.
Image size: 1024x1024 pixels.
Background: solid hot pink magenta #FF00FF.
Subject centered, occupying 65% of canvas.

CAMERA: top-down 3/4 RPG perspective, 60 degrees from horizontal,
you see the top and front face of the boulder.

SUBJECT: a single weathered granite boulder, medium size.
Rounded irregular shape, rough surface with cracks (#364048, #506068).
Slightly lighter top surface (#7a9098). Dark base/shadow on ground.
Reads as solid, heavy stone. Clear silhouette.
Single boulder. Clean magenta background.
```

---

### `cliff_wall` — Parete di roccia impassabile

```
STYLE: Dark nordic fantasy pixel art RPG asset.
Pixel art style, 16-bit era, SNES quality.
Color palette: dark stone (#364048), stone (#506068), light stone (#7a9098).
Shadows: #0d1117, #1a2128.
Image size: 1024x1024 pixels.
Background: solid hot pink magenta #FF00FF.
Subject centered, occupying 70% of canvas.

CAMERA: top-down 3/4 RPG perspective, 60 degrees from horizontal.

SUBJECT: a large impassable rock cliff face or rock formation.
Jagged angular dark granite rock wall, multiple rock layers visible.
Dark and imposing (#364048 dominant). Wide, roughly 2x wider than tall.
Used as a large impassable obstacle on the game map.
Clear silhouette, reads as solid wall. Single formation.
```

---

## Categoria: PROPS (oggetti interattivi)

---

### `storage_prop` — Botte/cassa di legno

```
STYLE: Dark nordic fantasy pixel art RPG asset.
Pixel art style, 16-bit era, SNES quality.
Color palette: dark earth (#261e18, #3e2e24), warm earth (#604838),
dark stone (#364048) for metal bands. Shadows: #0d1117.
Image size: 1024x1024 pixels.
Background: solid hot pink magenta #FF00FF.
Subject centered, occupying 65% of canvas.

CAMERA: top-down 3/4 RPG perspective, 60 degrees from horizontal.

SUBJECT: a wooden barrel with iron bands, weathered and dark.
Dark aged wood (#3e2e24, #604838), iron bands (#364048).
Top of barrel visible (3/4 view). Sturdy, old, nordic style.
Reads clearly at 48x48 pixels. Single barrel. Clean magenta background.
```

---

### `loot_container` — Forziere del tesoro

```
STYLE: Dark nordic fantasy pixel art RPG asset.
Pixel art style, 16-bit era, SNES quality.
Color palette: dark earth (#261e18, #3e2e24), warm earth (#604838),
stone (#506068) for metal parts. Shadows: #0d1117, #1a2128.
Image size: 1024x1024 pixels.
Background: solid hot pink magenta #FF00FF.
Subject centered, occupying 65% of canvas.

CAMERA: top-down 3/4 RPG perspective, 60 degrees from horizontal.

SUBJECT: a closed wooden treasure chest with metal reinforcements.
Dark aged wood (#3e2e24), iron corners and lock (#364048, #506068).
Lid slightly rounded. Top and front visible (3/4 view).
Old and worn, not flashy. Reads at 48x48 pixels.
Single chest. Clean magenta background.
```

---

### `interactive_prop` — Braciere / falò da campo

```
STYLE: Dark nordic fantasy pixel art RPG asset.
Pixel art style, 16-bit era, SNES quality.
Color palette: dark stone (#364048, #506068) for the brazier structure,
fire: #8b4513, #c0602a, #e07820 (dark warm tones, not neon orange).
Shadows: #0d1117.
Image size: 1024x1024 pixels.
Background: solid hot pink magenta #FF00FF.
Subject centered, occupying 65% of canvas.

CAMERA: top-down 3/4 RPG perspective, 60 degrees from horizontal.

SUBJECT: a iron camp brazier or small campfire, lit with low flames.
Dark iron tripod or stone ring (#364048). Small flame or embers on top.
Fire is dark orange-brown, not bright neon. Reads at 48x48 pixels.
Single brazier/campfire. Clean magenta background.
```

---

## Categoria: CREATURE / NPC

---

### `npc_human_base` — Personaggio umano generico

```
STYLE: Dark nordic fantasy pixel art RPG asset.
Pixel art style, 16-bit era, SNES quality, hand-crafted look.
Color palette: skin (#8a6040, #6a4830), dark clothing (#1a2128, #261e18),
accent earth (#604838). No bright colors. Shadows: #0d1117.
Image size: 1024x1024 pixels.
Background: solid hot pink magenta #FF00FF.
Subject centered, occupying 55% of canvas.

CAMERA: top-down 3/4 RPG perspective, 60 degrees from horizontal,
character facing slightly toward the viewer (facing south/down).

SUBJECT: a human character sprite for a top-down 2D RPG.
Classic RPG proportions: head is 1/4 of total height (slightly oversized).
Wearing dark nordic clothing — rough tunic, hood or cloak (#261e18, #3e2e24).
Neutral standing pose, arms at sides. Male or ambiguous.
Clear silhouette. Reads at 48x64 pixels. Single character.
No weapon in hand. Clean magenta background.
```

---

## Ordine di priorità per la generazione

Per avere una prima mappa funzionante, genera nell'ordine:

| # | Family ID          | Chiamate ChatGPT | Note                          |
|---|--------------------|------------------|-------------------------------|
| 1 | `moss_mud_tile`    | 1                | terreno base                  |
| 2 | `road_path_tile`   | 1                | sentiero                      |
| 3 | `rock_mountain_tile`| 1               | muri/bordi                    |
| 4 | `frost_pine_tree`  | 1                | albero principale             |
| 5 | `heath_bush`       | 1                | cespuglio                     |
| 6 | `grey_boulder`     | 1                | roccia media                  |
| 7 | `cliff_wall`       | 1                | grande ostacolo               |
| 8 | `storage_prop`     | 1                | botte                         |
| 9 | `loot_container`   | 1                | forziere                      |
| 10| `interactive_prop` | 1                | falò                          |
| 11| `npc_human_base`   | 1                | personaggio                   |

**Totale: 11 chiamate ChatGPT** per una mappa completa e funzionante.

Per aggiungere una nuova famiglia in futuro: 1 chiamata ChatGPT + 1 riga nel manifest + 1 esecuzione dello script.
