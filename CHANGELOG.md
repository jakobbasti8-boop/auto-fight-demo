# Changelog

## 2026-09-06 — Four-Fighter HD Build / Repository Sync

- **Lt.BrainBug** als vierter auswählbarer Kämpfer ergänzt.
- Lt.BrainBug erhält einen eigenen 5×5-Normalatlas, verwirrten Kampfstil, eigene Kombos und die 25-Frame-Spezialattacke **SOUR MILK SURGE**.
- Sour-Milk-Spezial mit modularer Beam-Grafik, Impact-Overlay, eigener Trefferreaktion und absichtlich falsch gedrehter Cooldown-Phase umgesetzt.
- **Dr. BOB** auf HD-Produktionsatlanten umgestellt: 2560×2560 Normalatlas und 2560×2560 Kamehameha-Charakteratlas.
- Dr.-BOB-Normalanimationen semantisch auf die exakten 25 Quellposen gemappt statt nur progressbasiert durchgeschaltet.
- Kamehameha mit separatem modularen START/LOOP-A/LOOP-B/HEAD/IMPACT-Beam-Strip und distanzabhängiger Strahllänge umgesetzt.
- Kamehameha-Trefferfenster mit sichtbarem Impact synchronisiert.
- `444444444444444_3.zip` als binärer Projekt-Snapshot auf `main` abgelegt. Das Archiv selbst ersetzt keine entpackten Runtime-Dateien und wird deshalb als Transport-/Snapshot-Artefakt dokumentiert.
- README, Spezialattacken-Dokumentation und Architekturhinweise auf den tatsächlichen Vier-Kämpfer-HD-Stand synchronisiert.

## 9.0.0 — Dual Special Catalog Build

- **Theresa: PROTON ROUNDHOUSE** als vollständiger 25-Frame-Katalog implementiert: gelbe Protonenladung, lila Aura, Roundhouse/Abwärtstreffer, gelb-lila Detonation, Schockwelle und Kusshand-Finale.
- **KurzDurch: MICROWAVE METEOR** als vollständiger 25-Frame-Katalog implementiert: Mikrowelle als Helm, rote Aura/Blitze, Kometenbeschwörung, Blitzwurf, massive rote Explosion, Mikrowelle abnehmen und Triumphlachen.
- Eigene Spezial-Hitboxen, Damage/Knockback/Blockchance und Gegner-zentrierte Explosionsframes.
- Alle fehlenden Runtime-Dateien und Basisassets in das Repository aufgenommen; Start wartet auf sämtliche Sprite- und Spezialreihen.
- Spezialatlanten als fünf transparente Reihen à fünf Frames gespeichert, damit der Browser sie zuverlässig und offline laden kann.

## 8.0_6

- **Hitboxen fest an den Figuren verankert.** Ursache der springenden Boxen war nicht die Box, sondern das Sprite: die Einzelbilder behielten beim Zuschneiden ihre Lage in der Katalogzelle, wodurch die Figur je nach Pose bis zu ~60 px seitlich wanderte. Jetzt wird jedes Bild am Mittelpunkt seiner Füße ausgerichtet.
- Breiten der Trefferzonen an die tatsächlichen Körperbreiten angepasst.
- **Kamehameha-Katalog für Dr. BOB** als eigenes Sprite-Blatt: Aufladen, Abschuss, nahtlos gekachelter Strahl, Einschlagsexplosion am Gegner, Nachhall.
- Konsolen-Hooks `__forceSpecial()` und `__probeFight()`.

## 8.0_5

- Hochformat-Darstellung gefixt: die Arena war mit `object-fit: cover` beschnitten. Jetzt wird die volle 16:9-Arena eingepasst und das HUD verkleinert.

## 8.0_4

- Neues Sprite-Blatt für **Dr. BOB** eingebaut.
- **Nova** in **Theresa MachsLochuff** umbenannt; intern bleibt der technische Key `nova` aus Kompatibilitätsgründen bestehen.

## 8.0_3

- Neues transparentes Sprite-Blatt für Theresa eingebaut; störende Halo-Ränder entfernt.

## 8.0_2

- Die damaligen drei Kataloge neu freigestellt und auf gemeinsame Bodenlinie gebracht.
- **Fix:** fehlender `COMBOS`-Eintrag für die dritte Figur ergänzt.
- **Fix:** dritter Lebensbalken vor Kampfstart ausgeblendet.

## v9 / 8.0_1

- Dritte Figur ergänzt, Charakterauswahl eingeführt.
- Blickrichtung der neuen Figur korrigiert.

## 7.0.1 und früher

- Zwei Kämpfer, Regie-Algorithmus, Kombos, Konter, Blocks, FX-Engine und erste Spezialattacken.
