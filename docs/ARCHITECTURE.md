# Architektur — AUTO FIGHT DEMO HD v10

## 1. Technisches Modell

Das Projekt ist eine klassische Browser-Runtime ohne Bundler, npm oder Framework. Alle Skripte werden über normale `<script>`-Tags geladen und teilen sich denselben globalen JavaScript-Kontext.

Die zentrale Spielfläche arbeitet logisch auf **1536 × 864**. v10 berücksichtigt zusätzlich die Device-Pixel-Ratio bis maximal Faktor 2, damit die Darstellung auf hochauflösenden Displays sauberer skaliert wird, ohne die Kampflogik zu verändern.

## 2. v10 Katalogschicht

Die wichtigste Architekturänderung ist die neue zentrale Sprite-Katalogschicht:

```text
assets/catalog.json  ← maschinenlesbare Messdaten
assets/catalog.js    ← dieselben Daten für file://-Betrieb
        ↓
game-catalog.js
        ↓
SPRITES + drawSprite() + MOVEMENT + catalogIndex()
```

Damit liegen Sprite-Auswahl, Baseline, Zoom und Spezialkatalog-Zuordnung nicht mehr verteilt in mehreren Fighter-Dateien.

### `assets/catalog.json`

Enthält pro Produktionsblatt unter anderem:

- Katalogtyp (`anchored`, `uniform`, `strip`)
- Datei
- Raster-/Modulzahl
- Zellgröße
- `spriteZoom`
- `baseline`
- `defaultFacing`
- Portrait-Ausschnitt
- Frame-Metadaten wie Bounding-Box und Anker

Bounding-Boxes sind halboffen: `[x0, y0, x1, y1)`. Ein Endwert von `512` ist bei einer 512-px-Zelle daher gültig.

### `assets/catalog.js`

Stellt denselben Datensatz als `window.SPRITE_CATALOG` bereit. Dadurch muss die Runtime keine JSON-Datei per `fetch()` laden und kann technisch auch direkt über `file://` gestartet werden.

### `game-catalog.js`

Verantwortlich für:

- Laden sämtlicher Katalogassets über `SPRITES`
- ganzzahlige Zellgrenzen über `spriteRect()`
- einheitliches Zeichnen über `drawSprite()`
- Portrait-Ermittlung
- Übernahme gemessener Zoom-/Baseline-Werte
- zentralen `MOVEMENT`-Katalog
- Mapping von Kampfzustand/Phase auf Katalogframe
- konsolidiertes Spezialkatalog-Rendering
- zielzentrierte reine FX-Frames
- Clippen eingebrannter Beam-Reste an der Katalogkante

## 3. Kritische Script-Reihenfolge

Aktuelle Reihenfolge in `index.html`:

```text
1. assets/catalog.js
2. game-catalog.js
3. game-boot.js
4. game-moves.js
5. game-fighter.js
6. game-director.js
7. game-render.js
8. game-brainbug.js
9. game-specials.js
10. game-bob-hd.js
```

Diese Reihenfolge ist **funktional relevant**.

Die letzten Fighter-/Special-Dateien erweitern bestehende globale Funktionen per Wrapper. Betroffen sind unter anderem:

- `effects`
- `activeHitbox`
- `attackInfo`
- `decideBlock`
- `setPlan`
- `launchPlan`
- `Fighter.prototype.update`

Die normale Sprite-Auswahl selbst wurde in v10 dagegen weitgehend aus diesen Wrappern herausgezogen und in `game-catalog.js` zentralisiert.

## 4. Kernmodule

### `game-boot.js`

- Canvas/Context
- interne Dimensionen und `GROUND`
- Device-Pixel-Ratio-Setup
- Hintergrund
- Kompatibilitätsbrücken von alten `spriteAssets` zu `SPRITES`
- Asset-Readiness / Startfreigabe
- Pose-Tabelle `P`

### `game-moves.js`

- `MOVES`
- `ATTACKS`
- `COMBOS`
- `SPECIAL_COMBOS`
- FX-Partikel/Text-Popups
- Mathe-/Interpolationshelfer

### `game-fighter.js`

- `Fighter`-Klasse
- Bewegungs-/Move-Zustand
- Combo-Queue
- Dr. BOB, KurzDurch und Theresa als Basiskämpfer
- Fighter-Registry

Theresa trägt intern weiterhin den Legacy-Key `nova`. Eine Umbenennung benötigt eine vollständige Migration aller Registries, Combo-Maps und Auswahlpfade.

### `game-director.js`

- Hurtboxen und Basis-Hitboxen
- Kollisionsprüfung
- Schaden
- Block
- Counter-Hits
- Knockback
- K.-o.-Transition
- zufällige Kampfredaktion/AI
- Distanzplanung und Finten

### `game-render.js`

- Arena-Rendering
- Aufruf von `drawFighterCatalog()` als primären Sprite-Pfad
- HUD
- Portraits
- Fighter-Auswahl
- `resetFight()`
- Main Loop
- Debug-Hooks

### `game-brainbug.js`

- Lt.BrainBug
- Auswahlbuttons
- eigene Kombos
- `SOUR MILK SURGE`
- modularer Sour-Milk-Beam
- eigene Trefferreaktion
- absichtlich falsche Blickrichtung während einer Cooldown-Phase
- AI-Variation

### `game-specials.js`

- Theresa `PROTON ROUNDHOUSE`
- KurzDurch `MICROWAVE METEOR`
- Move-Timing
- Spezial-Hitboxen
- individuelle Damage-/Knockback-/Blockwerte

Die sichtbaren Spezialframes selbst werden in v10 von `game-catalog.js` gezeichnet.

### `game-bob-hd.js`

- Dr.-BOB-Kamehameha-Move mit exakt 25 Schritten
- modularer Mündungs-/Loop-/Head-/Impact-Beam
- distanzabhängige Beam-Länge
- synchronisierte Kamehameha-Hitbox

Die normale Dr.-BOB-Spriteauswahl liegt seit v10 im zentralen `MOVEMENT.bob`.

## 5. Kampfpipeline

```text
setPlan()
  ↓
Feint / Approach
  ↓
launchPlan()
  ↓
Fighter.start() / beginCombo()
  ↓
Move-Step + Phase
  ↓
activeHitbox(attacker, defender)
  ↓
getHurtbox(defender)
  ↓
intersects()
  ↓
dealHit()
  ├─ Block
  ├─ Counter
  └─ normaler Treffer
        ↓
Damage / Knockback / Reaction
        ↓
FX / HUD / KO
```

Parallel dazu bestimmt `game-catalog.js` aus Fighter, Move, Phase und `moveStep` den sichtbaren Katalogframe.

## 6. Produktionsassets

Aktuelle Produktionsstruktur:

```text
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

Die vorherigen `*-row-1.webp ... row-5.webp`, `nova.webp` und `brainbug-sourmilk-special.webp` sind in v10 abgelöst.

## 7. Recut-Pipeline

```text
tools/recut.py
tools/spritekit.py
tools/source/*
```

`recut.py` definiert die Produktionskataloge und orchestriert die Aufbereitung. `spritekit.py` enthält die Bildoperationen.

Wesentliche Schritte:

- RGBA laden
- Greenscreen-/Grid-Bereinigung
- White-Halo-/Fringe-Cleanup
- Despeckle/Pinholes
- Subject-Isolation
- Content-Bounding-Box
- Fußanker
- Baseline-/Scale-Berechnung
- premultipliziertes LANCZOS-Resampling
- Platzierung in 512-px-Zellen
- WebP-Ausgabe
- Katalogmetadaten schreiben
- `catalog.js` aus dem JSON-Datensatz erzeugen

### Reproduzierbarkeit

```bash
python tools/recut.py
```

oder gezielt:

```bash
python tools/recut.py --only bob kame
```

Python-Caches gehören nicht ins Repository:

```text
__pycache__/
*.pyc
```

## 8. Neue Figur sauber integrieren

1. Rohquelle unter `tools/source/` ablegen.
2. Katalogdefinition in `tools/recut.py` ergänzen.
3. Recut ausführen und `assets/catalog.json/js` aktualisieren.
4. `MOVEMENT` in `game-catalog.js` ergänzen.
5. `Fighter`-Instanz/Registry ergänzen.
6. `COMBOS` und `SPECIAL_COMBOS` ergänzen.
7. Auswahlbutton bereitstellen.
8. Spezialmove und `attackInfo()` ergänzen.
9. Spezial-Hitbox auf sichtbare Trefferphase abstimmen.
10. Falls nötig modularen Beam/FX-Code ergänzen.
11. alle Paarungen und beide Seiten testen.

## 9. QA / CI

Lokaler Smoke-Test:

```js
__forceSpecial('left')
__forceSpecial('right')
__probeFight()
```

Nach Sprite-/Runtime-Änderungen:

- alle sechs Fighter-Paarungen starten
- beide Seiten-Specials testen
- Hitboxen prüfen
- Block/Counter prüfen
- K. o. und Neustart prüfen
- Desktop und Handy prüfen
- Browser-Konsole kontrollieren

GitHub Actions prüft zusätzlich statisch:

- JavaScript-Syntax
- Python-Syntax
- Katalogasset-Existenz
- Synchronität `catalog.json` ↔ `catalog.js`
- lokale `index.html`-Referenzen
- verbotene Python-Cachedateien

## 10. Technische Risiken / nächste Härtung

### A. Globale Wrapper-Kette

Trotz zentralem Sprite-Katalog existieren für Speziallogik noch Monkey-Patches. Langfristig sind Registries sinnvoll:

```js
specialHitboxes[key]
attackResolvers[key]
effectRenderers[key]
directorHooks[key]
```

### B. Kein vollständiger automatisierter Browser-Test

Die CI ist zunächst statisch. Ein Headless-Browser-Smoke-Test für Startmenü, Fighter-Auswahl, `__forceSpecial()`, Hitbox-Toggle und K.-o.-Flow wäre die nächste sinnvolle Teststufe.

### C. Binärer ZIP-Snapshot

`444444444444444_3.zip` bleibt historisch erhalten, ist aber nicht die Source-of-Truth. Neue Entwicklung erfolgt direkt im entpackten Quellbaum.

### D. Öffentliche Distribution

Das Repository ist öffentlich. Vor echter Distribution sollten Hintergrund-/Marken-/Fremdmaterialien rechtlich geprüft und gegebenenfalls ersetzt werden.
