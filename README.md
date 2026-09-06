# AUTO FIGHT DEMO HD — v10

Browserbasierte 2D-Auto-Fight-Demo mit vier auswählbaren Kämpfern, 25-Frame-HD-Katalogen, Hit-/Hurtboxen, Kombos, Kontern, Blocks und individuellen Spezialattacken.

Der aktuelle `main`-Stand entspricht der **v10-Katalogpipeline** aus dem verifizierten Paket `444444444444444_3.zip`. Die Produktionsassets sind entpackt im Repository vorhanden; das ZIP bleibt nur als Snapshot/Transportartefakt erhalten.

## Aktueller Stand

- **4 Kämpfer:** Dr. BOB, KurzDurch, Theresa MachsLochuff und Lt.BrainBug
- normale Kämpferatlanten: **5 × 5 = 25 Frames**, Produktionszellen 512 × 512 px
- konsolidierte Spezialatlanten statt einzelner Row-Dateien
- zentraler Sprite-/Bewegungskatalog über `assets/catalog.json`, `assets/catalog.js` und `game-catalog.js`
- gemessene Sprite-Werte für Zoom, Baseline, Blickrichtung, Portrait und Frame-Metadaten
- modularer Kamehameha- und Sour-Milk-Beam
- automatische Kampfregie mit Distanzplanung, Finten, Kombos, Block und Counter
- interne Canvas-Logik: **1536 × 864**; Darstellung wird bis maximal 2× Device-Pixel-Ratio hochskaliert
- reproduzierbare Recut-Pipeline unter `tools/`

![Kamehameha](docs/kamehameha.jpg)

---

## Schnellstart

Es gibt keinen npm-/Build-Schritt und keine externen Runtime-Abhängigkeiten.

### Empfohlen: lokaler HTTP-Server

**Windows / PowerShell**

```powershell
cd auto-fight-demo
py -m http.server 8080
```

**Linux / macOS / Termux**

```bash
cd auto-fight-demo
python -m http.server 8080
```

Dann öffnen:

```text
http://localhost:8080
```

### Direkter Datei-Start

`index.html` kann in aktuellen Browsern auch direkt geöffnet werden. Dafür existiert neben `assets/catalog.json` zusätzlich `assets/catalog.js`, damit die Runtime den Katalog ohne `fetch()` und damit auch unter `file://` laden kann. Ein lokaler HTTP-Server bleibt für reproduzierbare Tests die bevorzugte Variante.

Im Startmenü links und rechts je einen **unterschiedlichen** Kämpfer wählen und **Demo starten** drücken.

| Bedienung | Wirkung |
|---|---|
| Kämpferkarten | linke/rechte Seite auswählen |
| **Demo starten** | neue Auto-Fight-Runde starten |
| **Neuer Kampf** | nächste Runde mit derselben Auswahl |
| **Hitboxen** | Hurtboxen und aktive Trefferzonen anzeigen |

![Charakterauswahl](docs/charakterauswahl.jpg)

---

## Kämpfer und Spezialattacken

| Kämpfer | Spezial | Schaden | Knockback |
|---|---|---:|---:|
| **Dr. BOB** | **Kamehameha** (`kame`) | 20 | 92 |
| **KurzDurch** | **MICROWAVE METEOR** (`comet`) | 34 | 168 |
| **Theresa MachsLochuff** | **PROTON ROUNDHOUSE** (`protonKick`) | 30 | 145 |
| **Lt.BrainBug** | **SOUR MILK SURGE** (`sourMilkBurst`) | 24 | 54 |

Die vollständigen Frame-Abläufe und Trefferfenster stehen in [SPECIALS.md](SPECIALS.md).

---

## v10 Asset-System

### Produktionsassets

```text
assets/background.webp
assets/bob.webp
assets/kame.webp
assets/kame-beam.webp
assets/kurz.webp
assets/kurz-comet.webp
assets/theresa.webp
assets/theresa-proton.webp
assets/brainbug.webp
assets/brainbug-sourmilk.webp
assets/brainbug-sourmilk-beam.webp
assets/catalog.json
assets/catalog.js
```

Die Charakter- und Spezialatlanten liegen überwiegend als 2560 × 2560 RGBA-WebP vor. Die beiden modularen Beam-Strips sind separate horizontale Modulatlanten.

### Warum `catalog.json` und `catalog.js`?

`assets/catalog.json` ist die maschinenlesbare Source-of-Truth für gemessene Sprite-Metadaten. `assets/catalog.js` enthält denselben Katalog als `window.SPRITE_CATALOG` für den direkten Browserstart ohne Server.

Pro Blatt werden unter anderem gespeichert:

- Dateiname und Katalogtyp
- Spalten/Zeilen bzw. Modulzahl
- Zellgröße
- `spriteZoom`
- `baseline`
- `defaultFacing`
- Portrait-Ausschnitt
- Frame-Bounding-Boxes und Ankerdaten

Bounding-Boxes sind halboffen gespeichert: `[x0, y0, x1, y1)`. Daher ist beispielsweise `x1 = 512` an der rechten Kante einer 512-px-Zelle korrekt.

### Produktionsregeln

1. Figur vollständig innerhalb ihrer Animationszelle halten.
2. Gemeinsame Bodenlinie verwenden.
3. Horizontal an der Fußposition verankern, nicht blind an der Zellmitte.
4. Greenscreen/Grid/weiße Halos und schwarze Zellreste entfernen.
5. Effektframes mit Alpha erhalten und nicht wie normale Charaktersilhouetten beschneiden.
6. Wiederholbare Beam-Module an den Kanten nahtlos aufbauen.

![Hitboxen](docs/hitboxen.jpg)

---

## Runtime-Architektur

Die Demo verwendet klassische `<script>`-Dateien im gemeinsamen Browser-Kontext. Die Load-Order ist deshalb Teil des Laufzeitvertrags.

```text
assets/catalog.js
→ game-catalog.js
→ game-boot.js
→ game-moves.js
→ game-fighter.js
→ game-director.js
→ game-render.js
→ game-brainbug.js
→ game-specials.js
→ game-bob-hd.js
```

| Datei | Aufgabe |
|---|---|
| `assets/catalog.js` | Browserfähige Kopie der gemessenen Katalogdaten |
| `game-catalog.js` | zentrale Sprite-Auswahl, `SPRITES`, `drawSprite()`, `MOVEMENT`, Spezialkatalog-Rendering |
| `game-boot.js` | Canvas, globale Konstanten, Loader-Brücken und Posen |
| `game-moves.js` | Moves, Attack-Werte, Kombos und FX-Helfer |
| `game-fighter.js` | `Fighter`-Klasse und Basiskämpfer |
| `game-director.js` | Regie, Distanz, Block/Counter, Kollision und Schaden |
| `game-render.js` | Arena, HUD, Auswahl, Main Loop und Debug-Hooks |
| `game-brainbug.js` | Lt.BrainBug-spezifische Logik und Sour-Milk-Beam |
| `game-specials.js` | Theresa-/KurzDurch-Spezialtiming und Trefferwerte |
| `game-bob-hd.js` | Kamehameha-Ablauf, modularer Beam und Trefferfenster |

Die Bildauswahl für normale Bewegungen ist in v10 nicht mehr als Row/Column-Sonderlogik über mehrere Fighter-Dateien verteilt, sondern in `MOVEMENT` innerhalb von `game-catalog.js` zentralisiert.

Mehr Details: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Recut-Pipeline

Unter `tools/` liegt die reproduzierbare Sprite-Aufbereitung:

```text
tools/recut.py
tools/spritekit.py
tools/source/
```

Neu erzeugen:

```bash
python tools/recut.py
```

Gezielt einzelne Kataloge:

```bash
python tools/recut.py --only bob kame
```

Die Pipeline übernimmt unter anderem Chroma-/Grid-Bereinigung, Alpha-Aufbereitung, Halo-/Fringe-Cleanup, Silhouettenmessung, Fußanker, einheitliche Baseline, 512-px-Zellplatzierung und Katalogerzeugung.

**Nicht committen:** `__pycache__/` und `*.pyc`.

---

## Kampflogik

```text
Director
→ Move/Phase
→ activeHitbox()
→ getHurtbox()
→ Intersection
→ Block / Counter / Hit
→ Damage + Knockback
→ Reaction / K.O.
→ FX + HUD
```

Unter niedrigen Lebenspunkten steigt die Chance auf Spezialattacken. Counter-Hits verursachen erhöhten Schaden und Knockback.

---

## Debug / QA

Browser-Konsole:

```js
__forceSpecial('left')
__forceSpecial('right')
__probeFight()
```

Smoke-Test nach Runtime-/Asset-Änderungen:

1. alle sechs unterschiedlichen Fighter-Paarungen starten
2. Specials auf linker und rechter Seite erzwingen
3. Hitbox-Anzeige prüfen
4. Block und Counter beobachten
5. K. o., Gewinneroverlay und **Neuer Kampf** prüfen
6. Desktop und Handy Hoch-/Querformat prüfen
7. Browser-Konsole auf Fehler kontrollieren

Zusätzlich prüft GitHub Actions bei Pushes und Pull Requests Syntax und die wichtigsten Katalog-/Dateireferenzen.

---

## ZIP-Snapshot

`444444444444444_3.zip` hat den v10-Stand geliefert und bleibt im Repository als binärer Snapshot erhalten. Der Inhalt wurde am 6. September 2026 anhand seines Git-Blob-Hashes eindeutig dem zuvor erzeugten `auto-fight-demo-hd_3.zip` zugeordnet, vollständig entpackt, statisch geprüft und anschließend in den normalen `main`-Quellbaum promoviert.

Für weitere Entwicklung gilt jetzt wieder:

- **Source-of-Truth:** entpackte Dateien auf `main`
- **ZIP:** historischer Snapshot/Transportartefakt
- neue Änderungen direkt an den Source-Dateien und Assets vornehmen

---

## Veröffentlichung / Assets

Das Repository ist aktuell **öffentlich**. Der Arena-Hintergrund kann Marken-/Figurenelemente Dritter enthalten. Vor einer externen Distribution oder Veröffentlichung des Spiels sollte dieses Material rechtlich geprüft bzw. durch vollständig eigenes Material ersetzt werden.

Siehe außerdem:

- [SPECIALS.md](SPECIALS.md) – Spezialattacken
- [CHANGELOG.md](CHANGELOG.md) – Entwicklungshistorie
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) – technische Architektur
- [docs/REPOSITORY_AUDIT_2026-09-06.md](docs/REPOSITORY_AUDIT_2026-09-06.md) – Audit und v10-Promotion
