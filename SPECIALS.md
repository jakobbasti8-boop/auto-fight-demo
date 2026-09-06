# Spezialattacken

Diese Datei beschreibt die aktuell implementierten Spezialattacken der vier Kämpfer. Frame-Angaben beziehen sich auf die sichtbaren Katalogframes 1–25.

## Dr. BOB — KAMEHAMEHA

25 Frames: Fokus → Hände sammeln → mehrstufige blaue Energieaufladung → Abschuss → dynamisch verlängerter Energiestrahl → Einschlag → Nachhall → Rückstoß/Erschöpfung → Aufrichten → Erholung.

- Move-Key: `kame`
- Spezialkombo: **DOC OVERDRIVE**
- Schaden: **20**
- Knockback: **92**
- Blockchance: reguläre Special-Logik, ca. **16 %**, bei niedriger HP des Verteidigers erhöht
- Aktives Trefferfenster: **Frames 12–18**
- Charakter-Asset: `assets/kame.webp`
- Strahl-Asset: `assets/kame-beam.webp`
- Strahlmodule: Start → Loop A → Loop B → Head → Impact
- Besonderheit: Die Strahllänge wird zur Laufzeit an die Distanz zum Gegner angepasst.

## Theresa MachsLochuff — PROTON ROUNDHOUSE

25 Frames: Fokus → Knie/Kammer → gelbe Protonenladung → lila Protonenaura → High-Roundhouse → Abwärtstreffer → gelb-lila Detonation → Photonenkern/Schockwelle → Pose/Kusshand → Erholung.

- Move-Key: `protonKick`
- Spezialkombo: **PROTON ROUNDHOUSE**
- Schaden: **30**
- Knockback: **145**
- Blockchance: **8 %**, bei niedriger HP leicht erhöht
- Aktives Trefferfenster: **Frames 15–20**
- Assets: `assets/theresa-proton-row-1.webp` bis `assets/theresa-proton-row-5.webp`
- Besonderheit: Explosionsframes werden gegnerzentriert gezeichnet und ersetzen in dieser Phase das normale Fighter-Rendering.

## KurzDurch — MICROWAVE METEOR

25 Frames: Fokus → Mikrowelle greifen/öffnen → als Helm aufsetzen → rote Aura und dünne Blitze → Hände hoch → Komet heranziehen und vergrößern → Blitzwurf → Flug → Einschlag/rote Blitzexplosion → Mikrowelle abnehmen → Triumph/Lachen → Erholung.

- Move-Key: `comet`
- Spezialkombo: **MICROWAVE METEOR**
- Schaden: **34**
- Knockback: **168**
- Blockchance: **4 %**, bei niedriger HP leicht erhöht
- Aktives Trefferfenster: **Frames 19–21**
- Assets: `assets/kurz-comet-row-1.webp` bis `assets/kurz-comet-row-5.webp`
- Besonderheit: Die reinen Einschlags-/Explosionsframes werden am Gegner statt am Angreifer gezeichnet.

## Lt.BrainBug — SOUR MILK SURGE

25 Frames: Schüssel/Cornflakes/Milch vorbereiten → probieren → Reaktion auf saure Milch → grüne Übelkeit/aufgeblasene Backen → energetische Aufladung → grün-weißer Flüssigkeitsstrahl mit braunem Blitzcharakter → Treffer/Betäubung → Rückstoß → auf die Knie → kurz falsch zum Gegner gedreht → orientieren/Kopf kratzen → benommen zurück.

- Move-Key: `sourMilkBurst`
- Spezialkombo: **SOUR MILK SURGE**
- Schaden: **24**
- Knockback: **54**
- Blockchance: **6 %**, bei niedriger HP leicht erhöht
- Aktives Trefferfenster: **Frames 19–20**
- Charakter-Asset: `assets/brainbug-sourmilk-special.webp`
- Strahl-Asset: `assets/brainbug-sourmilk-beam.webp`
- Trefferreaktion: `hitSourMilk`
- Besonderheit: Der Beam wird modular bis zum Gegner gekachelt; Start-, zwei Loop- und Impact-Zellen bilden die Distanz dynamisch ab. Während der Cooldown-Phase dreht Lt.BrainBug kurz absichtlich in die falsche Richtung und stellt anschließend seine Blickrichtung wieder her.

---

## Rendering-Regeln für Spezialkataloge

- Theresa und KurzDurch laden je fünf transparente Reihen mit je fünf Frames.
- Dr. BOB verwendet einen 5×5-HD-Charakteratlas plus einen separaten fünfteiligen Beam-Strip.
- Lt.BrainBug verwendet einen 5×5-Spezialatlas plus einen vierteiligen modularen Beam-Strip.
- Fighterframes werden abhängig von der Blickrichtung gespiegelt.
- Reine Einschlags-/Explosionsframes werden nicht blind mitgespiegelt, sondern auf den Zielbereich des Gegners gesetzt.
- Trefferlogik und sichtbarer Impact müssen zeitlich synchron bleiben; Änderungen an Frame-Timings erfordern daher immer einen Hitbox-Smoke-Test.
