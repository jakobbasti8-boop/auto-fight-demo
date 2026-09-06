# Architektur — AUTO FIGHT DEMO HD

## 1. Technisches Modell

Das Projekt ist eine klassische Browser-Runtime ohne Bundler, npm oder Framework. Alle Skripte werden über normale `<script>`-Tags geladen und teilen sich denselben globalen JavaScript-Kontext.

Die zentrale Spielfläche ist ein Canvas mit **1536 × 864** interner Auflösung. CSS skaliert nur die Darstellung; Kampfdistanzen, Bodenlinie, Trefferzonen und Physik arbeiten weiterhin in Canvas-Koordinaten.

## 2. Kritische Script-Reihenfolge

Aktuelle Reihenfolge in `index.html`:

```text
1. game-boot.js
2. game-moves.js
3. game-fighter.js
4. game-director.js
5. game-render.js
6. game-brainbug.js
7. game-specials.js
8. game-bob-hd.js
```

Diese Reihenfolge ist **funktional relevant**.

### Warum?

Die Erweiterungsmodule definieren nicht alles neu, sondern wrappen vorhandene globale Funktionen:

```js
const base = drawFighter;
drawFighter = function (...) {
  // neue Speziallogik
  return base(...);
};
```

Dieses Muster wird unter anderem für folgende Funktionen verwendet:

- `drawFighter`
- `effects`
- `activeHitbox`
- `attackInfo`
- `decideBlock`
- `setPlan`
- `launchPlan`
- `Fighter.prototype.spriteFrame`
- `Fighter.prototype.update`

Ein später geladenes Modul muss deshalb die bereits installierten Wrapper korrekt übernehmen. Eine Änderung der Script-Reihenfolge kann Features still überschreiben oder dazu führen, dass bestimmte Fighter keine Spezial-Hitbox, kein Rendering oder falsche Blockwerte erhalten.

## 3. Kernmodule

### `game-boot.js`

Verantwortlich für:

- Canvas/Context
- interne Dimensionen und `GROUND`
- Hintergrund
- Sprite-Loader
- Asset-Readiness
- Frame-Cropping
- Pose-Tabelle `P`
- allgemeine Hilfsfunktionen

### `game-moves.js`

Verantwortlich für:

- `MOVES`
- `ATTACKS`
- `COMBOS`
- `SPECIAL_COMBOS`
- FX-Partikel und Text-Popups
- allgemeine Mathe-/Interpolationshelfer

### `game-fighter.js`

Verantwortlich für:

- `Fighter`-Klasse
- Bewegungs-/Move-Zustand
- Combo-Queue
- Sprite-Grundmapping
- Dr. BOB, KurzDurch und Theresa als Basiskämpfer
- Fighter-Registry

Hinweis: Theresa trägt intern weiterhin den Key `nova`. Das ist ein technischer Legacy-Key und sollte nicht ohne vollständige Migration umbenannt werden.

### `game-director.js`

Verantwortlich für:

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

Verantwortlich für:

- Arena-Rendering
- Fighter-/FX-Zeichenreihenfolge
- HUD
- Portraits
- Fighter-Auswahl
- `resetFight()`
- Main Loop
- Debug-Hooks

### `game-brainbug.js`

Erweitert die Runtime um:

- Lt.BrainBug
- dynamisch injizierte Auswahlbuttons
- eigenen Basisatlas
- eigene Kombos
- `SOUR MILK SURGE`
- modularen Sour-Milk-Beam
- eigene Trefferreaktion
- bewusst chaotische AI-Variation
- falsche Blickrichtung während einer Cooldown-Phase

### `game-specials.js`

Erweitert die Runtime um:

- Theresa `PROTON ROUNDHOUSE`
- KurzDurch `MICROWAVE METEOR`
- 5×5 Spezialkatalog-Rendering
- zielzentrierte Explosionsframes
- individuelle Damage-/Knockback-/Blockwerte

### `game-bob-hd.js`

Erweitert die Runtime um:

- Dr.-BOB-HD-Normalatlas
- semantisches Frame-Mapping
- 25-Frame-Kamehameha
- modularen START/LOOP-A/LOOP-B/HEAD/IMPACT-Strahl
- distanzabhängige Beam-Länge
- synchronisierte Spezial-Hitbox

## 4. Kampfpipeline

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

## 5. Fighter-Konfiguration

Zentrale Fighter-Werte:

| Feld | Bedeutung |
|---|---|
| `key` | technischer Fighter-Key |
| `specialKey` | Move-Key der Spezialattacke |
| `asset` | Basis-Spriteasset |
| `displayH` | sichtbare Körperhöhe |
| `spriteZoom` | Verhältnis Atlaszelle zu sichtbarer Figur |
| `baseline` | Bodenlinienkorrektur |
| `hurtW` | Hurtbox-Breite relativ zu `displayH` |
| `walkSpeed` | Laufgeschwindigkeit |
| `face` | Standardblickrichtung |

## 6. Neue Figur sauber integrieren

Minimaler Integrationsablauf:

1. 25-Frame-Basisatlas in `assets/` ablegen.
2. Asset registrieren und vollständig vor Start laden.
3. `Fighter`-Instanz erstellen.
4. `allFighters`, `fighterByKey` und `fighterLabel` erweitern.
5. `COMBOS` und `SPECIAL_COMBOS` ergänzen.
6. Auswahlbutton bereitstellen.
7. Normal-Frame-Mapping definieren.
8. Spezialmove und `attackInfo()` ergänzen.
9. Spezial-Hitbox exakt auf sichtbare Trefferphase abstimmen.
10. Render-/FX-Erweiterungen so wrappen, dass vorhandene Fighter weiterhin durchgereicht werden.
11. Portrait testen.
12. Alle Paarungen und beide Seiten testen.

## 7. Asset-Regeln

### Normalatlanten

- bevorzugt 5×5 / 25 Frames
- transparente Zellränder
- keine Raster-/Greenscreen-Reste
- Figur bleibt vollständig in jeder Zelle
- einheitliche Bodenlinie
- keine wechselnde horizontale Verankerung

### Modulare Strahlen

Empfohlenes Schema:

```text
START | LOOP-A | LOOP-B | HEAD | IMPACT
```

oder bei vier Zellen:

```text
START | LOOP-A | LOOP-B | IMPACT
```

Loop-Zellen müssen an den horizontalen Kanten optisch nahtlos anschließen.

## 8. QA-Checkliste

Nach jeder Änderung an Fighter-, Sprite- oder Special-Code:

- lokaler HTTP-Server statt direktem `file://` verwenden
- alle Fighter-Paarungen starten
- linkes und rechtes Special jeweils erzwingen
- `__probeFight()` kontrollieren
- Hitboxen einschalten
- Block und Counter beobachten
- K. o. / Gewinneroverlay / Neuer Kampf testen
- Browser-Konsole auf Fehler prüfen
- Desktop testen
- Handy Hochformat testen
- Handy Querformat testen

Debug-Hooks:

```js
__forceSpecial('left')
__forceSpecial('right')
__probeFight()
```

## 9. Technische Risiken / nächste Härtung

### A. Globale Wrapper-Kette

Der größte Wartungsrisikofaktor ist die globale Monkey-Patch-Kette. Langfristig sollten Fighter und Specials in registrierte Handler/Strategien überführt werden, z. B.:

```js
fighterRenderers[key]
specialHitboxes[key]
attackResolvers[key]
effectRenderers[key]
```

Damit würde die Script-Reihenfolge weniger kritisch.

### B. Keine automatisierten Tests

Das Projekt besitzt aktuell keinen Test-Runner. Ein kleiner Browser-Smoke-Test für Asset-Load, Fighter-Registry, Specials und K.-o.-Flow wäre der sinnvollste nächste Infrastruktur-Schritt.

### C. Binäre ZIP-Snapshots

ZIP-Dateien im Git-Verlauf sind nicht diffbar und vergrößern die History. Der aktuelle Snapshot bleibt erhalten, sollte aber nicht zum normalen Austauschformat für einzelne Änderungen werden.

### D. Öffentliche Distribution

Das Repository ist öffentlich. Vor einer echten Veröffentlichung sollten verwendete Hintergrund-/Marken-/Fremdmaterialien geprüft und gegebenenfalls ersetzt werden.
