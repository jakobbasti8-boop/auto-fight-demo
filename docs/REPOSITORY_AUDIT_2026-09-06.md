# Repository Audit — 2026-09-06

Repository: `jakobbasti8-boop/auto-fight-demo`

## Ergebnis

Der hochgeladene GitHub-Blob `444444444444444_3.zip` wurde eindeutig dem gespeicherten Paket `auto-fight-demo-hd_3.zip` zugeordnet: Dateigröße und berechneter Git-Blob-SHA stimmen exakt überein (`9bdc8dc32f8ab69deeef18b03e3e20d6d751062d`). Damit konnte genau der auf GitHub liegende Archivinhalt vollständig untersucht werden.

Das Paket ist ein **neuerer v10-Stand** und nicht nur ein Backup des vorherigen `main`-Quellbaums. Es enthält eine neue zentrale Katalog-/Recut-Pipeline sowie neu geschnittene Produktionsatlanten.

Der verifizierte v10-Stand wurde anschließend automatisiert aus dem ZIP in den normalen `main`-Quellbaum promoviert.

## Promotion

Ein einmaliger GitHub-Actions-Workflow hat:

1. `444444444444444_3.zip` auf Integrität geprüft,
2. den erwarteten Paketroot `auto-fight-demo/` entpackt,
3. v10 Runtime-Dateien übernommen,
4. Produktionsassets übernommen,
5. `tools/recut.py`, `tools/spritekit.py` und `tools/source/` übernommen,
6. `__pycache__`/`.pyc` ausgelassen,
7. abgelöste Split-/Legacy-Assets entfernt,
8. JavaScript per `node --check` validiert,
9. Python-Skripte kompiliert,
10. alle Katalogasset-Referenzen geprüft,
11. alle lokalen `index.html`-Referenzen geprüft,
12. den v10-Stand nach `main` committed,
13. den Einmal-Workflow anschließend wieder aus dem Repository entfernt.

Promotion-Commit:

```text
1f31ea03c760dec2dfeff1a868cbbfc2c128a206
feat: promote verified v10 catalog pipeline from HD package
```

GitHub Actions Ergebnis: **success**.

## v10 Hauptänderungen

### Zentraler Sprite-Katalog

Neu:

```text
assets/catalog.json
assets/catalog.js
game-catalog.js
```

`game-catalog.js` zentralisiert:

- Asset-Loading
- Zellkoordinaten
- weiches Sprite-Rendering
- Zoom/Baseline/Blickrichtung
- Portraitdaten
- Bewegungskataloge
- Mapping von Move/Phase auf Spriteframe
- Spezialkatalog-Rendering
- zielzentrierte reine Effektframes

### Produktionsassets

Aktuell:

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
```

Ablöst wurden unter anderem:

```text
assets/nova.webp
assets/brainbug-sourmilk-special.webp
assets/theresa-proton-row-*.webp
assets/kurz-comet-row-*.webp
```

### Asset-Dimensionen des geprüften Pakets

| Asset | Dimension | Modus |
|---|---:|---|
| `bob.webp` | 2560×2560 | RGBA |
| `kame.webp` | 2560×2560 | RGBA |
| `kame-beam.webp` | 1535×512 | RGBA |
| `kurz.webp` | 2560×2560 | RGBA |
| `kurz-comet.webp` | 2560×2560 | RGBA |
| `theresa.webp` | 2560×2560 | RGBA |
| `theresa-proton.webp` | 2560×2560 | RGBA |
| `brainbug.webp` | 2560×2560 | RGBA |
| `brainbug-sourmilk.webp` | 2560×2560 | RGBA |
| `brainbug-sourmilk-beam.webp` | 1536×512 | RGBA |

`background.webp` bleibt RGB.

## Recut-Pipeline

Neu im normalen Source-Tree:

```text
tools/recut.py
tools/spritekit.py
tools/source/
```

Die Pipeline bereinigt und vermisst die Rohkataloge und erzeugt Produktionsatlanten plus Metadaten.

Geprüft wurden:

- Python-Syntax beider Skripte
- Start eines Recut-Laufs aus den mitgelieferten Rohquellen
- der zuerst vollständig erzeugte Produktionsatlas `bob.webp` war bytegenau identisch mit dem gepackten v10-Asset

Der vollständige Recut aller großen Atlanten überschritt nur das lokale Ausführungslimit der Analyseumgebung; dies ist kein festgestellter Projektfehler.

## Statische Sicherheits-/Abhängigkeitsprüfung

Im v10-Source wurden keine Runtime-Aufrufe gefunden für:

- externe HTTP-/HTTPS-Endpunkte
- `fetch()` in der Runtime
- `XMLHttpRequest`
- WebSockets
- `eval()`
- `new Function()`
- externe JS-Imports

Der einzige `fetch()`-Hinweis befindet sich als Kommentar in `tools/recut.py` und erklärt gerade, warum `catalog.js` für den direkten Datei-Start erzeugt wird.

## Syntax-/Referenzprüfung

Erfolgreich:

- ZIP-Integrität
- `node --check` für alle Runtime-JavaScript-Dateien und `assets/catalog.js`
- Python-Compile für `tools/recut.py` und `tools/spritekit.py`
- sämtliche lokalen `src`-/`href`-Referenzen in `index.html` vorhanden
- alle zehn erwarteten Katalogeinträge vorhanden
- alle von `catalog.json` referenzierten Produktionsassets vorhanden

## Bounding-Box-Prüfung

Einige Frame-Metadaten besitzen `x1` oder `y1 = 512`. Das ist korrekt: `tools/spritekit.py` erzeugt Content-Bounding-Boxes als halboffene Koordinaten `[x0, y0, x1, y1)`, wobei `x1/y1` um 1 hinter dem letzten belegten Pixel liegen. Die Zellgrenze 512 ist deshalb ein gültiger Endwert und kein Überlauf.

## Browser-Smoke-Test

Ein echter Chromium-Lauf konnte in der verwendeten Analyseumgebung nicht abgeschlossen werden, weil dort sowohl `localhost` als auch `file://` per Administratorrichtlinie mit `ERR_BLOCKED_BY_ADMINISTRATOR` blockiert werden.

Das ist **kein Browserfehler des Projekts**. Deshalb wird nicht behauptet, dass ein visueller End-to-End-Smoke-Test bereits bestanden hätte.

Offen bleibt als manuelle/Headless-CI-Prüfung:

- alle sechs Fighter-Paarungen
- Specials links/rechts
- Hitbox-Toggle
- Block/Counter
- K. o./Gewinneroverlay/Neuer Kampf
- mobile Hoch-/Querformatdarstellung

## Dokumentationsbefunde und Korrekturen

Vor dem Audit waren mehrere Dokumente hinter dem tatsächlichen Stand zurück:

- README nannte zunächst nur drei Fighter
- Lt.BrainBug fehlte in der Spezialdokumentation
- Dr.-BOB-HD/v10 war unvollständig dokumentiert
- die neue Katalogpipeline fehlte
- alte Row-Asset-Namen waren dokumentiert
- Repository wurde als „privat gedacht“ beschrieben, obwohl es tatsächlich öffentlich ist

Diese Punkte wurden korrigiert.

## Repository-Hygiene

Ergänzt/umgesetzt:

- ZIP-Dateien als binär markiert
- `tools/source/*` als binär markiert
- `__pycache__/` und `*.pyc` werden ignoriert
- abgelöste Split-Assets entfernt
- v10 Source-of-Truth liegt entpackt auf `main`
- persistente statische GitHub-Actions-Validierung für zukünftige Pushes/PRs

## Aktuelle technische Prioritäten

1. visuellen Headless-Browser-Smoke-Test als nächste CI-Stufe ergänzen
2. alle sechs Fighter-Paarungen automatisiert durchfahren
3. globale Spezial-Wrapper langfristig in registrierte Handler überführen
4. vor externer Veröffentlichung Background-/Asset-Rechte klären
5. zukünftige Release-ZIPs bevorzugt über Releases/Artifacts statt als große Git-Binärblobs verteilen

## Schlussstatus

**v10 ist in `main` integriert und statisch validiert.**

Der größte verbleibende technische Prüfpunkt ist nicht mehr das ZIP oder die Source-Struktur, sondern ein vollständiger visueller Browser-End-to-End-Test der Kampfdemo.
