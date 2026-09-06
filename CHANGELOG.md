# Changelog

## 10.0.0 — Katalogpipeline / HD Recut

- Verifiziertes Paket `444444444444444_3.zip` vollständig analysiert und als v10-Source nach `main` promoviert.
- Neue zentrale Katalogschicht: `assets/catalog.json`, `assets/catalog.js`, `game-catalog.js`.
- Alle vier normalen Kämpferatlanten auf 512-px-Produktionszellen / 2560×2560-Blätter vereinheitlicht.
- Theresa aus dem alten problematischen `nova.webp` in `assets/theresa.webp` überführt.
- Theresa-Spezial in einen konsolidierten Atlas `assets/theresa-proton.webp` überführt.
- KurzDurch-Spezial in `assets/kurz-comet.webp` konsolidiert.
- Lt.BrainBug-Spezial in `assets/brainbug-sourmilk.webp` konsolidiert.
- Kamehameha- und Sour-Milk-Beams bleiben als modulare horizontale Strips erhalten.
- Normalbewegungen und Spriteframe-Zuordnung aus Fighter-Sonderlogik in den zentralen `MOVEMENT`-Katalog verschoben.
- Reine Spezial-FX-Frames werden zielzentriert gezeichnet, während der Angreifer in einer passenden Pose sichtbar bleibt.
- Eingebackene Beam-Reste an Zellkanten werden geclippt und durch modulare Beam-Grafik ersetzt.
- Gemessene Werte für Zoom, Baseline, Blickrichtung, Portrait und Frame-Bounding-Boxes in den Katalog aufgenommen.
- Reproduzierbare Asset-Pipeline ergänzt: `tools/recut.py`, `tools/spritekit.py`, `tools/source/`.
- Greenscreen-/Grid-Cleanup, Halo-/Fringe-Entfernung, Fußanker, Baseline-Normalisierung und premultipliziertes LANCZOS-Resampling in der Pipeline gebündelt.
- Renderpfad auf weiches Downscaling und Device-Pixel-Ratio bis maximal 2× angepasst.
- Abgelöste Split-/Legacy-Assets entfernt (`theresa-proton-row-*`, `kurz-comet-row-*`, `nova.webp`, `brainbug-sourmilk-special.webp`).
- Statische GitHub-Actions-Validierung für JavaScript, Python, Katalogassets und HTML-Referenzen ergänzt.

## 2026-09-06 — Four-Fighter HD Build

- **Lt.BrainBug** als vierter auswählbarer Kämpfer ergänzt.
- Lt.BrainBug erhält eigenen Basisatlas, verwirrten Kampfstil, Kombos und **SOUR MILK SURGE**.
- Sour-Milk-Spezial mit modularem Beam, Impact-Overlay, eigener Trefferreaktion und falsch gedrehter Cooldown-Phase umgesetzt.
- **Dr. BOB** auf HD-Produktionsatlanten umgestellt.
- Kamehameha mit separatem modularen START/LOOP-A/LOOP-B/HEAD/IMPACT-Beam-Strip und distanzabhängiger Strahllänge umgesetzt.
- Dr.-BOB-Normalanimationen semantisch auf die Quellposen gemappt.
- `444444444444444_3.zip` zunächst als binärer Snapshot auf `main` abgelegt; später als v10-Paket verifiziert und promoviert.

## 9.0.0 — Dual Special Catalog Build

- **Theresa: PROTON ROUNDHOUSE** als vollständiger 25-Frame-Katalog implementiert.
- **KurzDurch: MICROWAVE METEOR** als vollständiger 25-Frame-Katalog implementiert.
- Eigene Spezial-Hitboxen, Damage/Knockback/Blockchance und gegnerzentrierte Explosionsframes.

## 8.0_6

- Hitboxen durch Fuß-Verankerung fest an den Figuren ausgerichtet.
- Breiten der Trefferzonen an die Körperbreiten angepasst.
- Kamehameha-Katalog für Dr. BOB ergänzt.
- Debug-Hooks `__forceSpecial()` und `__probeFight()` ergänzt.

## 8.0_5

- Hochformat-Darstellung korrigiert; volle 16:9-Arena wird eingepasst.

## 8.0_4

- Neues Sprite-Blatt für **Dr. BOB** eingebaut.
- **Nova** in **Theresa MachsLochuff** umbenannt; technischer Legacy-Key `nova` bleibt bestehen.

## 8.0_3

- Transparentes Sprite-Blatt für Theresa eingebaut; störende Halo-Ränder entfernt.

## 8.0_2

- Kataloge freigestellt und auf gemeinsame Bodenlinie gebracht.
- Fehlenden `COMBOS`-Eintrag für die dritte Figur ergänzt.
- Dritten Lebensbalken vor Kampfstart ausgeblendet.

## v9 / 8.0_1

- Dritte Figur und Charakterauswahl ergänzt.
- Blickrichtung der neuen Figur korrigiert.

## 7.0.1 und früher

- Zwei Kämpfer, Regie-Algorithmus, Kombos, Konter, Blocks, FX-Engine und erste Spezialattacken.
