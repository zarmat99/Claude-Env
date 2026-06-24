# Grimward — Art Style Guide

Questo documento è la fonte di verità per ogni asset generato con ChatGPT.
Deve essere consultato (e il "master style block" copiato) per ogni nuova generazione.

---

## 1. Identità visiva

**Genere:** Dark nordic fantasy top-down RPG.
**Tono:** freddo, notturno, desaturato. Nessun colore brillante tranne la magia.
**Ispirazione visiva:** pixel art SNES/GBA (Zelda: A Link to the Past, Final Fantasy VI).
**NON:** neon fantasy, cel-shading, arte 3D renderizzata, realismo fotografico.

---

## 2. Angolo di camera

Due modalità, usate in modo coerente per categoria:

### Terrain tiles — Top-down puro (90°)
La camera guarda esattamente dall'alto. Nessuna profondità, nessun fronte visibile.
Usato per: terreno, pavimento, acqua, neve, erba.

```
top-down view, orthographic, camera looking straight down,
no perspective, no side faces visible, flat surface texture
```

### Sprite di oggetti e personaggi — 3/4 view (circa 60° dall'alto)
La camera è inclinata: vedi la superficie superiore dell'oggetto E il suo fronte.
Il fronte è visibile circa per il 30% dell'altezza totale.
Usato per: alberi, rocce, edifici, prop, personaggi, nemici.

```
top-down 3/4 view RPG perspective, camera angled at approximately 60 degrees
from horizontal, you see the top surface and the front face of the object,
classic SNES RPG sprite angle
```

---

## 3. Scala pixel e dimensioni canvas

Tutti gli asset sono generati a **4× la dimensione in-game** per qualità,
poi ridimensionati dallo script di normalizzazione.

| Categoria         | In-game (px) | Canvas generazione (px) | Formato ChatGPT  |
|-------------------|-------------|------------------------|------------------|
| Terrain tile      | 48 × 48     | 512 × 512              | 1 tile singolo   |
| Prop piccolo      | 48 × 48     | 256 × 256              | singolo          |
| Prop medio        | 64 × 64     | 256 × 256              | singolo          |
| Prop grande       | 96 × 96     | 384 × 384              | singolo          |
| Edificio          | 128 × 128   | 512 × 512              | singolo          |
| Personaggio/NPC   | 48 × 64     | 192 × 256              | singolo          |
| Effetto           | 64 × 64     | 256 × 256              | singolo          |

**In pratica:** chiedi sempre un'immagine **1024×1024** a ChatGPT.
Il soggetto deve occupare al massimo l'80% del canvas (lascia bordi per il bounding box).
Lo script si occupa di ritagliare, ridimensionare e centrare.

---

## 4. Palette Grimward v1.0

Questi 14 colori definiscono lo stile. Non è una palette strettamente limitata
(ChatGPT non può rispettare palette esatte), ma ogni asset deve sentirsi
come se derivasse da questi toni. Includere sempre i codici hex rilevanti nel prompt.

### Ombre / vuoto
| Nome          | Hex       | Uso                          |
|---------------|-----------|------------------------------|
| Void          | `#0d1117` | shadow assoluto, contorni    |
| Deep shadow   | `#1a2128` | ombre profonde               |
| Shadow        | `#27303a` | ombre medie                  |

### Pietra / roccia
| Nome          | Hex       | Uso                          |
|---------------|-----------|------------------------------|
| Dark stone    | `#364048` | roccia scura, muri           |
| Stone         | `#506068` | pietra media                 |
| Light stone   | `#7a9098` | bordi pietra illuminati      |
| Stone hi      | `#a8bcc0` | highlight pietra             |

### Terra / legno
| Nome          | Hex       | Uso                          |
|---------------|-----------|------------------------------|
| Dark earth    | `#261e18` | terra scura, legno antico    |
| Earth         | `#3e2e24` | terra, legno                 |
| Warm earth    | `#604838` | terra calda, legno illuminato|

### Vegetazione
| Nome          | Hex       | Uso                          |
|---------------|-----------|------------------------------|
| Dark moss     | `#1a2e1c` | muschio profondo, foresta    |
| Forest green  | `#2e4830` | verde principale             |
| Moss          | `#486040` | muschio illuminato           |

### Ghiaccio / neve
| Nome          | Hex       | Uso                          |
|---------------|-----------|------------------------------|
| Ice blue      | `#8ab8c8` | ghiaccio, riflessi freddi    |
| Snow          | `#d8e8ec` | neve, cristalli              |

### Accento magia (usare con parsimonia)
| Nome          | Hex       | Uso                          |
|---------------|-----------|------------------------------|
| Deep teal     | `#2a6870` | magia, rune, glow sottile    |
| Bright teal   | `#40a0a8` | fulcro glow magico           |

### Colore chiave (MAI usare nell'arte)
| Nome          | Hex       | Uso                          |
|---------------|-----------|------------------------------|
| Key magenta   | `#ff00ff` | sfondo per trasparenza       |

---

## 5. Master Style Block

**Copia questo testo all'inizio di OGNI prompt ChatGPT:**

```
STYLE: Dark nordic fantasy pixel art RPG asset.
Pixel art style, 16-bit era, SNES quality, hand-crafted look.
Color palette: desaturated cold tones — dark stone (#364048, #506068),
dark earth (#261e18, #3e2e24), forest green (#1a2e1c, #2e4830),
ice blue (#8ab8c8). Shadows: #0d1117, #1a2128.
No bright colors. No neon. No glow unless magical.
No outlines in a different bright color.
Image size: 1024x1024 pixels.
Background: solid hot pink magenta #FF00FF — nothing else on background.
Subject centered, occupying 60-75% of canvas.
```

---

## 6. Regole per categoria

### Terrain tiles
- Texture completamente tileable (seamless su tutti i 4 bordi)
- Variazione organica: piccoli dettagli irregolari (sassi, crepe, macchie)
- Nessuna caratteristica dominante che "si veda" quando ripetuto
- Nessun oggetto: solo texture di superficie

### Oggetti / prop
- Silhouette chiara e leggibile a 48×48 px
- Profondità suggerita (top + fronte visibili, prospettiva 3/4)
- Ombra sotto l'oggetto (piccola, scura, al suolo — non proiettata in aria)
- Nessun bordo luminoso o outline artificiale

### Personaggi / NPC
- Statura: testa ≈ 1/4 dell'altezza totale (testa grossa = stile RPG classico)
- Postura neutra, faccia verso sud (verso il giocatore)
- Abbigliamento che si distingua con chiarezza dalla pelle

### Edifici / strutture
- Vista 3/4: tetto visibile + facciata frontale
- Nessun dettaglio interno (finestre opache o buie)
- Stile nordico: legno scuro, tetti ripidi, pietra grezza

---

## 7. Anti-pattern — cosa NON chiedere

| Sbagliato | Perché fallisce |
|-----------|-----------------|
| "tileset 12×12" | ChatGPT genera una scena, non 144 tile indipendenti |
| "atlas sheet con varianti" | le varianti sono incoerenti tra celle diverse |
| "fantasy art" generico | produce colori brillanti, stile Disney/Marvel |
| "remove background" via AI | fallisce su arte scura; usa il magenta per keying |
| Vista isometrica 45° | difficile da ottenere consistente; usa 3/4 60° |
| "4K", "hyper realistic" | contraddice lo stile pixel art |

---

## 8. Come generare varianti

**Non chiedere a ChatGPT di generare varianti.** Le varianti si producono con lo script
di normalizzazione (`scripts/process_asset.py`), che per ogni immagine sorgente genera
automaticamente N varianti con:
- Lieve variazione di tinta (±8° hue)
- Lieve variazione di luminosità (±8%)
- Flip orizzontale per alcune categorie (prop, vegetation)

Questo garantisce varianti coerenti stilisticamente, senza ulteriori chiamate a ChatGPT.
Ogni famiglia richiede **1 sola immagine sorgente** da ChatGPT.

---

## 9. Workflow completo

```
1. Consulta questo documento per il Master Style Block
2. Scrivi il prompt: [Master Style Block] + [camera angle per categoria] + [soggetto]
3. Genera in ChatGPT → salva come assets/source/{family_id}.png
4. Esegui: python scripts/process_asset.py {family_id}
5. Lo script produce: assets/generated/{family_id}/{family_id}_01.png ... _NN.png
6. Esegui: npm run validate
7. Screenshot: PORT=XXXX PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node scripts/screenshot.mjs out.png
```
