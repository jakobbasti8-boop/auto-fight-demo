# Spezialattacken — v10

Die vier Spezialattacken verwenden in v10 konsolidierte Kataloge. Frame-Angaben sind **1-basiert** und beziehen sich auf die sichtbaren 25 Katalogbilder.

## Dr. BOB — KAMEHAMEHA

25 Frames: Fokus → Hände sammeln → mehrstufige blaue Energieaufladung → Abschuss → dynamisch verlängerter Energiestrahl → Einschlag → Nachhall → Rückstoß/Erschöpfung → Aufrichten → Erholung.

- Move-Key: `kame`
- Spezialkombo: **DOC OVERDRIVE**
- Schaden: **20**
- Knockback: **92**
- Blockchance: normale Special-Logik; bei niedriger HP des Verteidigers erhöht
- Aktives Trefferfenster: **Frames 12–18**
- Charakteratlas: `assets/kame.webp`
- Beam-Strip: `assets/kame-beam.webp`
- Beam-Module: Mündung → Loop A → Loop B → Head → Impact
- Besonderheit: Strahllänge wird zur Laufzeit bis zum Gegner aufgebaut; Beam-Frames des Charakterkatalogs werden hinter der Hand geclippt, damit keine harte rechteckige Zellkante sichtbar bleibt.

## Theresa MachsLochuff — PROTON ROUNDHOUSE

25 Frames: Fokus → Kammer → gelbe Protonenladung → lila Protonenaura → High-Roundhouse/Abwärtstreffer → Detonation → Photonenkern/Schockwelle → Pose/Kusshand → Erholung.

- Move-Key: `protonKick`
- Spezialkombo: **PROTON ROUNDHOUSE**
- Schaden: **30**
- Knockback: **145**
- Blockchance: **8 %**, bei niedriger HP leicht erhöht
- Aktives Trefferfenster: **Frames 15–20**
- Spezialatlas: `assets/theresa-proton.webp`
- Besonderheit: reine Explosionsframes werden gegnerzentriert gezeichnet; Theresa bleibt dabei in einer passenden Trittpose sichtbar.

## KurzDurch — MICROWAVE METEOR

25 Frames: Fokus → Mikrowelle greifen/öffnen → als Helm aufsetzen → rote Aura und Blitze → Hände hoch → Komet heranziehen → Blitzwurf → Flug → Einschlag/rote Blitzexplosion → Mikrowelle abnehmen → Triumph/Lachen → Erholung.

- Move-Key: `comet`
- Spezialkombo: **MICROWAVE METEOR**
- Schaden: **34**
- Knockback: **168**
- Blockchance: **4 %**, bei niedriger HP leicht erhöht
- Aktives Trefferfenster: **Frames 19–21**
- Spezialatlas: `assets/kurz-comet.webp`
- Besonderheit: reine Komet-/Explosionsframes werden am Gegner gezeichnet; KurzDurch bleibt in seiner Wurfpose sichtbar.

## Lt.BrainBug — SOUR MILK SURGE

25 Frames: Schüssel/Cornflakes/Milch vorbereiten → probieren → Reaktion auf saure Milch → Übelkeit/aufgeblasene Backen → energetische Aufladung → grün-weißer Flüssigkeitsstrahl → Treffer/Betäubung → Rückstoß → auf die Knie → kurz falsch gedreht → orientieren/Kopf kratzen → benommen zurück.

- Move-Key: `sourMilkBurst`
- Spezialkombo: **SOUR MILK SURGE**
- Schaden: **24**
- Knockback: **54**
- Blockchance: **6 %**, bei niedriger HP leicht erhöht
- Aktives Trefferfenster: **Frames 19–20**
- Spezialatlas: `assets/brainbug-sourmilk.webp`
- Beam-Strip: `assets/brainbug-sourmilk-beam.webp`
- Trefferreaktion: `hitSourMilk`
- Besonderheit: der Strahl wird aus Mündungs-/Loop-/Impact-Modulen bis zum Gegner aufgebaut. Während des Cooldowns dreht Lt.BrainBug absichtlich kurz in die falsche Richtung und stellt danach seine ursprüngliche Blickrichtung wieder her.

---

## v10 Rendering-Regeln

Die zentrale Spezialdarstellung liegt in `game-catalog.js` plus den fighter-spezifischen Beam-/Hitbox-Dateien.

- `drawSprite()` ist der gemeinsame Zeichenpfad für Katalogframes.
- Theresa und KurzDurch verwenden je einen konsolidierten 2560×2560-Spezialatlas.
- Dr. BOB verwendet einen 2560×2560-Charakteratlas plus separaten modularen Beam-Strip.
- Lt.BrainBug verwendet einen 2560×2560-Spezialatlas plus separaten modularen Beam-Strip.
- Blickrichtung wird anhand von `defaultFacing` aus dem Katalog gespiegelt.
- Reine FX-Frames werden zielzentriert und nicht blind mit der Angreiferfigur verknüpft.
- Trefferfenster und sichtbarer Impact müssen zeitlich synchron bleiben; Änderungen an Frame-Timings erfordern einen Hitbox-Smoke-Test.
