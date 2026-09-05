# Changelog

Alle Stände als einzelne, in sich abgeschlossene HTML-Datei.

## 8.0_6

- **Hitboxen fest an den Figuren verankert.** Ursache der springenden Boxen war nicht
  die Box, sondern das Sprite: die Einzelbilder behielten beim Zuschneiden ihre Lage in
  der Katalogzelle, wodurch die Figur je nach Pose bis zu ~60 px seitlich wanderte.
  Jetzt wird jedes Bild am Mittelpunkt seiner Füße ausgerichtet.
- Breiten der Trefferzonen an die tatsächlichen Körperbreiten angepasst.
- **Kamehameha-Katalog für Dr. BOB** als eigenes viertes Sprite-Blatt: Aufladen,
  Abschuss, nahtlos gekachelter Strahl, Einschlagsexplosion am Gegner, Nachhall.
  Der Austrittspunkt des Strahls ist aus dem Abschussbild gemessen, damit der
  Übergang von Hand zu Strahl sitzt.
- Konsolen-Hooks `__forceSpecial()` und `__probeFight()`.

## 8.0_5

- Hochformat-Darstellung gefixt: die Arena war mit `object-fit: cover` beschnitten,
  dadurch standen die Kämpfer außerhalb des Bildes und der Startknopf lag unter dem
  Rahmen. Jetzt wird die volle 16:9-Arena eingepasst und das HUD verkleinert.

## 8.0_4

- Neues Sprite-Blatt für **Dr. BOB** (Greenscreen-Vorlage) freigestellt und eingebaut.
- **Nova** in **Theresa MachsLochuff** umbenannt (Auswahl, VS-Titel, Siegermeldung;
  im HUD die Kurzform „THERESA").

## 8.0_3

- Neues, bereits transparentes Sprite-Blatt für Theresa eingebaut; rote und gelbe
  Halo-Ränder aus dem weichen Randsaum entfernt.

## 8.0_2

- Alle drei Kataloge neu freigestellt. Der Karo-Hintergrund der Vorlagen ließ sich
  nicht über die Helligkeit abtrennen, weil die Kostüme (Kittel, Shirt, Anzug)
  dieselben Grautöne haben — erkannt wird er stattdessen an seiner Kachel-Textur:
  zwei Töne je Zelle, eingeschlossene Nester zerfallen in viele kleine Quadrate,
  glatte Stoffschatten nicht.
- Einheitliche Bodenlinie für alle Figuren.
- **Fix:** `COMBOS` hatte keinen Eintrag für die dritte Figur — sobald die Regie eine
  Ketten-Attacke für sie würfelte, brach das Spiel ab.
- **Fix:** Der dritte Lebensbalken lugte vor Kampfstart durchs Startmenü.

## v9 / 8.0_1

- Dritte Figur ergänzt, Charakterauswahl (zwei aus drei) vor dem Start.
- Blickrichtung der neuen Figur korrigiert: die Grundrichtung ihres Blattes war
  falsch eingetragen, dadurch drehte sie sich in beiden Aufstellungen vom Gegner weg.

## 7.0.1 und früher

- Zwei Kämpfer, Regie-Algorithmus, Kombos, Konter, Blocks, FX-Engine,
  Spezialattacken Energiestrahl und Komet.
