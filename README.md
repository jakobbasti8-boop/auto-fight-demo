# AUTO FIGHT DEMO HD

Browserbasierte 2D-Auto-Fight-Demo mit vier auswählbaren Kämpfern, HD-Spritekatalogen, Hit-/Hurtboxen, Kombos, Kontern, Blocks und individuellen Spezialattacken.

Die Runtime besteht aus HTML, CSS und JavaScript ohne npm-/Build-Schritt. Für einen zuverlässigen Start sollte das Repository über einen **lokalen HTTP-Server** geöffnet werden; `file://` ist nicht der empfohlene Betriebsweg.

## Aktueller Stand

- **4 Kämpfer:** Dr. BOB, KurzDurch, Theresa MachsLochuff und Lt.BrainBug
- Zwei unterschiedliche Kämpfer werden vor jeder Runde ausgewählt.
- Der Kampf läuft vollautomatisch über den Director.
- Treffer reduzieren Lebenspunkte; bei 0 HP folgt K. o., Gewinneranzeige und **Neuer Kampf**.
- Debug-Hitboxen können im laufenden Spiel eingeblendet werden.
- Spezialattacken besitzen eigene 25-Frame-Kataloge bzw. modulare Effekt-Assets.
- Die Canvas-Logik läuft intern auf **1536 × 864** und wird für Desktop/Handy nur visuell skaliert.

![Kamehameha](docs/kamehameha.jpg)

---

## Schnellstart

### Windows / PowerShell

```powershell
cd auto-fight-demo
py -m http.server 8080
```

Danach im Browser öffnen:

```text
http://localhost:8080
```

### Linux / macOS / Termux

```bash
cd auto-fight-demo
python -m http.server 8080
```

Danach ebenfalls `http://localhost:8080` öffnen.

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

| Kämpfer | Profil | Spezial | Kernwerte |
|---|---|---|---|
| **Dr. BOB** | groß, Arztkittel, HD-Basisatlas | **Kamehameha** (`kame`) | 20 Schaden, 92 Knockback, modularer Distanz-Strahl |
| **KurzDurch** | kompakt, kurze Reichweite | **MICROWAVE METEOR** (`comet`) | 34 Schaden, 168 Knockback |
| **Theresa MachsLochuff** | leicht und schnell | **PROTON ROUNDHOUSE** (`protonKick`) | 30 Schaden, 145 Knockback |
| **Lt.BrainBug** | unberechenbarer Kampfstil | **SOUR MILK SURGE** (`sourMilkBurst`) | 24 Schaden, 54 Knockback, kurze Betäubungsreaktion |

Die vollständigen Abläufe und Trefferfenster stehen in [SPECIALS.md](SPECIALS.md).

---

## Sprite- und Asset-System

Die normalen Kämpferatlanten sind überwiegend als **5 × 5 Raster mit 25 Frames** aufgebaut. Die Engine liest daraus Idle-, Lauf-, Schlag-, Tritt- und Treffer-/K.-o.-Posen.

Wichtige Produktionsregeln:

1. **Gemeinsame Bodenlinie:** Die sichtbare Figur muss in jeder Zelle auf derselben Baseline stehen.
2. **Fuß-Verankerung:** Die Figur wird an ihrer Fußposition statt blind an der Zellmitte ausgerichtet. Dadurch bleiben Hurtbox und Sprite bei Posewechseln deckungsgleich.
3. **Transparente Zellränder:** Normale Produktionsframes sollen keine Greenscreen-, Raster- oder schwarzen Restflächen besitzen.
4. **Effektmodule:** Strahlen können aus Start-, Loop-, Kopf- und Impact-Modulen zusammengesetzt werden, damit die Reichweite dynamisch bleibt.

Aktuelle zentrale Assets:

```text
assets/background.webp
assets/bob.webp
assets/kame.webp
assets/kame-beam.webp
assets/kurz.webp
assets/kurz-comet-row-1.webp ... row-5.webp
assets/nova.webp
assets/theresa-proton-row-1.webp ... row-5.webp
assets/brainbug.webp
assets/brainbug-sourmilk-special.webp
assets/brainbug-sourmilk-beam.webp
```

![Hitboxen](docs/hitboxen.jpg)

---

## Engine-Architektur

Die Demo verwendet bewusst keine Bundler- oder Modul-Runtime. Alle Dateien teilen sich den globalen Browser-Kontext.

### Kernmodule

| Datei | Aufgabe |
|---|---|
| `game-boot.js` | Canvas, Assets, globale Konstanten, Posen und Loader |
| `game-moves.js` | Moves, Attack-Werte, Kombos und FX-Helfer |
| `game-fighter.js` | `Fighter`-Klasse, Basis-Kämpfer und Zustände |
| `game-director.js` | Distanzplanung, Angriffsregie, Block/Counter, Kollision und Schaden |
| `game-render.js` | Rendering, HUD, Auswahl, Reset, Main Loop und Debug-Hooks |
| `game-brainbug.js` | Lt.BrainBug, Sour-Milk-Spezial, AI-/Render-Erweiterungen |
| `game-specials.js` | Theresa- und KurzDurch-Spezialkataloge |
| `game-bob-hd.js` | Dr.-BOB-HD-Mapping und modularer Kamehameha-Strahl |

**Wichtig:** Die Reihenfolge der `<script>`-Tags in `index.html` ist Teil der Architektur. Die später geladenen Fighter-/Special-Dateien wrappen vorhandene Funktionen wie `drawFighter`, `effects`, `activeHitbox`, `attackInfo` und `decideBlock`. Die Reihenfolge darf daher nicht beliebig geändert werden.

Mehr Details: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Kampflogik

Der Director wählt Angreifer und Verteidiger, plant Distanz, Finten und Angriffstyp und startet anschließend Einzelangriffe, normale Kombos oder Spezialkombos.

Die Trefferpipeline ist:

```text
Director → Move/Phase → activeHitbox() → getHurtbox() → Intersection
        → Block/Counter/Hit → Damage/Knockback → Reaction/KO → FX/HUD
```

Unter niedrigen Lebenspunkten steigt die Wahrscheinlichkeit, dass Specials ausgewählt werden. Counter-Hits verursachen erhöhten Schaden und Knockback.

---

## Debug / QA

Browser-Konsole:

```js
__forceSpecial('left')
__forceSpecial('right')
__probeFight()
```

Empfohlener Smoke-Test nach Änderungen:

1. Jede mögliche Fighter-Paarung einmal starten.
2. Beide Specials pro Paarung mit `__forceSpecial()` auslösen.
3. Hitbox-Anzeige prüfen.
4. K. o. und **Neuer Kampf** prüfen.
5. Desktop sowie Handy-Hoch-/Querformat prüfen.
6. Browser-Konsole auf Asset-, Syntax- und Runtime-Fehler kontrollieren.

---

## ZIP-Artefakt `444444444444444_3.zip`

Das Archiv liegt auf `main` und ist ein **binäres Projektartefakt**. Der Commit, der das ZIP hinzugefügt hat, verändert keine Runtime-Datei außerhalb des Archivs. Damit ist das ZIP nicht automatisch die Source-of-Truth für den ausführbaren Stand im Repository.

Für die laufende Entwicklung gilt daher:

- **Source-of-Truth:** entpackte Dateien auf `main`
- **ZIP:** Snapshot/Transportartefakt
- Änderungen aus einem neueren ZIP müssen zuerst bewusst in die entpackte Repository-Struktur übernommen und anschließend getestet werden.

---

## Repository-Hinweise

Das Repository ist aktuell **öffentlich**. Der Arena-Hintergrund kann Marken-/Figurenelemente Dritter enthalten; für eine öffentliche Distribution oder Veröffentlichung des Spiels sollte das Material rechtlich geprüft bzw. durch vollständig eigenes Material ersetzt werden.

Große ZIP-Dateien sollten nicht dauerhaft als normaler Entwicklungsweg genutzt werden, da sie die Git-Historie stark vergrößern und nicht sinnvoll diffbar sind. Für Releases sind GitHub-Releases/Artifacts langfristig die sauberere Ablage; der vorhandene ZIP-Snapshot bleibt davon unberührt.

Siehe außerdem:

- [SPECIALS.md](SPECIALS.md) – Spezialattacken
- [CHANGELOG.md](CHANGELOG.md) – Entwicklungshistorie
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) – technische Architektur
- [docs/REPOSITORY_AUDIT_2026-09-06.md](docs/REPOSITORY_AUDIT_2026-09-06.md) – aktueller Repository-Audit
