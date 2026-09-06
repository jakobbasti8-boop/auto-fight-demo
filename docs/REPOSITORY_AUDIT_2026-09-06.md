# Repository Audit — 2026-09-06

Repository: `jakobbasti8-boop/auto-fight-demo`

## Zusammenfassung

Der aktuelle `main`-Stand ist eine browserbasierte Vier-Kämpfer-Auto-Fight-Demo mit HD-/25-Frame-Spritekatalogen, Spezialattacken, Hit-/Hurtboxen, Kombos, Block-/Counter-System und responsive Darstellung.

Der letzte Upload `444444444444444_3.zip` wurde mit Commit `bf11102448cf047cd08e1ec5d32e1bf029af9081` hinzugefügt. Dieser Commit enthält außerhalb des Archivs **keine Runtime-Änderung**. Der unmittelbar vorherige Runtime-Stand stammt aus dem gemergten Dr.-BOB-HD-/Sprite-Cleanup.

## Verifizierter Runtime-Stand

### Fighter

1. **Dr. BOB**
   - HD-Normalatlas
   - semantisches 25-Frame-Mapping
   - Kamehameha mit 25-Frame-Charakteratlas
   - modularer fünfteiliger Beam

2. **KurzDurch**
   - eigener Basisatlas
   - 25-Frame `MICROWAVE METEOR`
   - zielzentrierte Einschlags-/Explosionsframes

3. **Theresa MachsLochuff**
   - technischer Legacy-Key: `nova`
   - eigener Basisatlas
   - 25-Frame `PROTON ROUNDHOUSE`
   - gelb-lila Impact-/Schockwellenphase

4. **Lt.BrainBug**
   - eigener Basisatlas
   - eigene Kombos und AI-Abweichungen
   - 25-Frame `SOUR MILK SURGE`
   - modularer Beam
   - eigene Treffer-/Cooldown-Reaktion

## Verifizierte zentrale Dateien

```text
index.html
styles.css
game-boot.js
game-moves.js
game-fighter.js
game-director.js
game-render.js
game-brainbug.js
game-specials.js
game-bob-hd.js
README.md
SPECIALS.md
CHANGELOG.md
```

### Relevante Assets

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

## Festgestellte Punkte

### 1. Dokumentation war hinter dem Code zurück

Vor diesem Audit nannte das README nur drei Fighter und `SPECIALS.md` nur Theresa/KurzDurch. Lt.BrainBug und der neue Dr.-BOB-HD/Kamehameha-Stand waren nicht vollständig dokumentiert.

**Status:** behoben.

### 2. Schnellstart war missverständlich

Das README empfahl, `index.html` einfach direkt zu öffnen. Für eine reproduzierbare lokale Browser-Ausführung wird jetzt ein lokaler HTTP-Server dokumentiert.

**Status:** behoben.

### 3. ZIP ist kein integrierter Code-Stand

`444444444444444_3.zip` ist ein 23-MB-Binärblob. Der Upload-Commit legt nur diese Datei ab. Ein ZIP im Repository überschreibt oder integriert keine bereits entpackten Dateien.

**Status:** dokumentiert.

### 4. Inhalt des ZIPs ist über den verwendeten GitHub-Connector nicht entpackbar

Der Connector kann Textquellen und Git-Metadaten lesen, aber den 23-MB-ZIP-Binärblob nicht als Archiv öffnen. Deshalb wurde **nicht behauptet**, dass der Archivinhalt identisch mit `main` ist.

Zur sauberen Integration eines möglicherweise neueren Archivstands muss das ZIP außerhalb dieses reinen Text-Connectors entpackt und mit `main` verglichen werden.

### 5. Modul-Reihenfolge ist kritisch

`game-brainbug.js`, `game-specials.js` und `game-bob-hd.js` wrappen bereits existierende globale Funktionen. Dadurch ist die Script-Reihenfolge Teil des Laufzeitvertrags.

**Status:** in `docs/ARCHITECTURE.md` dokumentiert.

### 6. Kein automatisierter Test-Runner

Es existiert derzeit kein npm-/CI-Testsystem. Tests erfolgen als Browser-Smoke-Tests und über Debug-Hooks.

**Status:** als technischer Härtungspunkt dokumentiert.

### 7. Öffentliches Repository / Grafikhinweis

Das Repository ist aktuell öffentlich. Gleichzeitig weist die Projektdokumentation darauf hin, dass der Hintergrund Elemente Dritter enthalten kann.

**Status:** README korrigiert; vor einer echten öffentlichen Distribution bleibt eine Asset-/Rechteprüfung erforderlich.

### 8. Große Binärarchive in Git

Der ZIP-Snapshot ist nicht sinnvoll diffbar und vergrößert die Git-Historie.

**Status:** vorhandenes ZIP bleibt erhalten; `.gitattributes` markiert ZIP-Dateien als binär. Für zukünftige Release-Pakete sollten Releases/Artifacts bevorzugt werden.

## Aktuelle technische Prioritäten

1. ZIP gegen `main` entpackt vergleichen, falls das Archiv bewusst einen neueren Stand enthält.
2. Smoke-Test über alle sechs unterschiedlichen Fighter-Paarungen durchführen.
3. Für jede Paarung beide Seiten-Specials testen.
4. Globale Wrapper langfristig in registrierte Fighter-/Special-Handler refaktorieren.
5. Minimalen automatisierten Browser-Smoke-Test ergänzen.
6. Vor externer Veröffentlichung Background-/Asset-Rechte klären.

## Ergebnis dieses Audits

Die vorhandene Runtime wurde **nicht blind verändert**. Stattdessen wurden die belegbaren Inkonsistenzen in Dokumentation und Repository-Struktur korrigiert und die technischen Risiken nachvollziehbar festgehalten.
