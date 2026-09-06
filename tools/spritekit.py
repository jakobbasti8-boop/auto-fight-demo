"""Bild-Werkzeugkasten fuer die AUTO-FIGHT-Kataloge.

Kernaufgaben:
  * Hintergrund entfernen (Greenscreen-Key oder schwarze Matte mit Alphakanal)
  * Farbsaeume/Kompressionsartefakte an der Silhouette beseitigen
  * Randfarbe nach aussen fortsetzen, damit halbtransparente Kanten nicht
    gegen Schwarz ausbluten
  * Einzelbilder auf gemeinsame Bodenlinie und Fuss-Mittelpunkt normalisieren

Alle Funktionen arbeiten auf float32-RGBA im Bereich 0..1.
"""

from __future__ import annotations

import numpy as np
from PIL import Image
from scipy import ndimage

# --------------------------------------------------------------------------
# Basis
# --------------------------------------------------------------------------


def load_rgba(path: str) -> np.ndarray:
    return np.asarray(Image.open(path).convert("RGBA"), dtype=np.float32) / 255.0


def save_rgba(arr: np.ndarray, path: str, **kw) -> None:
    data = np.clip(arr, 0.0, 1.0) * 255.0
    Image.fromarray(data.round().astype(np.uint8), "RGBA").save(path, **kw)


def grid_cells(width: int, height: int, cols: int, rows: int):
    """Ganzzahlige Zellgrenzen - verhindert 1px-Bleeding bei krummen Groessen."""
    for r in range(rows):
        y0, y1 = round(r * height / rows), round((r + 1) * height / rows)
        for c in range(cols):
            x0, x1 = round(c * width / cols), round((c + 1) * width / cols)
            yield r, c, (x0, y0, x1, y1)


# --------------------------------------------------------------------------
# Hintergrund
# --------------------------------------------------------------------------


def key_greenscreen(rgba: np.ndarray, spill: float = 1.0) -> np.ndarray:
    """Chroma-Key fuer gruene Hintergruende inklusive Despill.

    Der Key laeuft ueber den Abstand zur Gruenachse, nicht ueber feste
    Schwellwerte - dadurch bleiben helle Haut- und Weisstoene erhalten,
    waehrend Halbschatten am Rand weich ausblenden.
    """
    r, g, b = rgba[..., 0], rgba[..., 1], rgba[..., 2]
    # Gruen-Ueberschuss gegenueber dem staerkeren der beiden anderen Kanaele
    excess = g - np.maximum(r, b)
    # weiche Rampe: < 0.06 sicher Vordergrund, > 0.22 sicher Hintergrund
    alpha = 1.0 - np.clip((excess - 0.06) / 0.16, 0.0, 1.0)

    # zusaetzlich sehr dunkle Rasterlinien der Vorlage entfernen
    luma = 0.299 * r + 0.587 * g + 0.114 * b
    dark_grid = np.clip((0.10 - luma) / 0.05, 0.0, 1.0)
    alpha = np.minimum(alpha, 1.0 - dark_grid)

    out = rgba.copy()
    out[..., 3] = alpha

    # Despill: Gruenanteil auf das Mittel der Nachbarkanaele zurueckfahren
    if spill > 0:
        cap = np.maximum(r, b)
        over = np.maximum(g - cap, 0.0)
        out[..., 1] = g - over * spill
    return out


def clear_grid_lines(rgba: np.ndarray, cols: int, rows: int,
                     width: int = 6) -> np.ndarray:
    """Loescht das schwarze Raster der Vorlage.

    Die Greenscreen-Blaetter haben ein aufgemaltes Raster. Es liegt ueber dem
    Bild, die Pixel darunter sind also ohnehin verloren - stehen bleibt sonst
    ein halbtransparenter schwarzer Balken an jeder Zellkante.
    """
    out = rgba.copy()
    h, w = out.shape[:2]
    for c in range(cols + 1):
        x = round(c * w / cols)
        out[:, max(0, x - width):min(w, x + width), 3] = 0.0
    for r in range(rows + 1):
        y = round(r * h / rows)
        out[max(0, y - width):min(h, y + width), :, 3] = 0.0
    return out


def strip_white_halo(rgba: np.ndarray, core: int = 4, band: int = 10,
                     luma_min: float = 0.62, chroma_max: float = 0.12) -> np.ndarray:
    """Entfernt weisse Freistell-Reste, die aussen an der Figur kleben.

    Aeltere Blaetter tragen Bruchstuecke eines frueheren Keys mit sich: helle,
    farblose Fetzen am Rand der Silhouette. Unterschieden wird ueber die Dicke -
    ein weisses Kleidungsstueck hat einen Kern, der eine Erosion um `core`
    Pixel ueberlebt, ein Fetzen nicht. Zusaetzlich wird nur im Randstreifen
    `band` geloescht, damit im Inneren nichts passieren kann.
    """
    out = rgba.copy()
    solid = out[..., 3] > 0.5
    if not solid.any():
        return out

    r, g, b = out[..., 0], out[..., 1], out[..., 2]
    luma = 0.299 * r + 0.587 * g + 0.114 * b
    chroma = np.maximum(np.maximum(r, g), b) - np.minimum(np.minimum(r, g), b)
    white = solid & (luma >= luma_min) & (chroma <= chroma_max)
    if not white.any():
        return out

    kept = ndimage.binary_propagation(
        ndimage.binary_erosion(white, iterations=core), mask=white)
    rim = solid & ~ndimage.binary_erosion(solid, iterations=band)
    debris = white & ~kept & rim
    out[..., 3] = np.where(debris, 0.0, out[..., 3])
    return out


def despeckle(alpha: np.ndarray, min_area: int) -> np.ndarray:
    """Loest freistehende Kompressionskruemel aus dem Alphakanal."""
    solid = alpha > 0.5
    labels, count = ndimage.label(solid)
    if count == 0:
        return alpha
    sizes = ndimage.sum(solid, labels, range(1, count + 1))
    drop = np.zeros(count + 1, dtype=bool)
    drop[1:] = sizes < min_area
    return np.where(drop[labels], 0.0, alpha)


def fill_pinholes(alpha: np.ndarray, max_area: int) -> np.ndarray:
    """Schliesst winzige Loecher im Koerper (JPEG-Rauschen im Weiss)."""
    holes = alpha < 0.5
    labels, count = ndimage.label(holes)
    if count == 0:
        return alpha
    sizes = ndimage.sum(holes, labels, range(1, count + 1))
    border = set(np.unique(np.concatenate([
        labels[0, :], labels[-1, :], labels[:, 0], labels[:, -1]])))
    fix = np.zeros(count + 1, dtype=bool)
    for i in range(1, count + 1):
        if i not in border and sizes[i - 1] <= max_area:
            fix[i] = True
    return np.where(fix[labels], 1.0, alpha)


def isolate_subject(alpha: np.ndarray, nominal=None, rel: float = 0.25,
                    inside_min: float = 0.5) -> np.ndarray:
    """Behaelt nur, was zu dieser Zelle gehoert.

    Die Vorlagen sind nicht randscharf gerastert: Schuhe und Haarspitzen ragen
    ueber die Rasterlinie in die Nachbarzelle. Deshalb wird mit Rand gearbeitet
    und danach jede zusammenhaengende Flaeche danach beurteilt, ob sie
    mehrheitlich in der eigentlichen Zelle liegt.

    nominal: (x0, y0, x1, y1) der echten Zelle innerhalb des Fensters.
    """
    solid = alpha > 0.5
    labels, count = ndimage.label(solid)
    if count == 0:
        return alpha
    sizes = np.asarray(ndimage.sum(solid, labels, range(1, count + 1)))
    biggest = sizes.max()

    drop = np.zeros(count + 1, dtype=bool)

    if nominal is not None:
        x0, y0, x1, y1 = nominal
        inner = np.zeros(alpha.shape, dtype=bool)
        inner[y0:y1, x0:x1] = True
        inside = np.asarray(ndimage.sum(inner & solid, labels, range(1, count + 1)))
        share = inside / np.maximum(sizes, 1)
        for i in range(1, count + 1):
            if share[i - 1] < inside_min or sizes[i - 1] < biggest * 0.01:
                drop[i] = True
    else:
        border_ids = set(np.unique(np.concatenate([
            labels[0, :], labels[-1, :], labels[:, 0], labels[:, -1]])))
        border_ids.discard(0)
        for i in range(1, count + 1):
            small = sizes[i - 1] < biggest * rel
            if small and (i in border_ids or sizes[i - 1] < biggest * 0.02):
                drop[i] = True

    # Zweite Pruefung: freistehende Kleinteile weit weg von der Figur.
    # Die Schuhe der Zeile darueber ragen teils so weit in die Zelle, dass sie
    # mehrheitlich darin liegen - sie schweben dann ueber dem Kopf.
    live = np.where(drop[1:], -1.0, sizes)
    if live.max() > 0:
        main = int(np.argmax(live)) + 1
        objs = ndimage.find_objects(labels)
        my, mx = objs[main - 1]
        # Bewusst eng gefasst: nur wirklich kleine Teile, die sich mit der
        # Figur ueberhaupt nicht ueberlappen. Bei beschaedigten Vorlagen kann
        # ein Koerper in mehrere Flaechen zerfallen - die duerfen nicht weg.
        for i in range(1, count + 1):
            if drop[i] or i == main or sizes[i - 1] >= biggest * 0.08:
                continue
            sy, sx = objs[i - 1]
            apart_y = sy.stop <= my.start or sy.start >= my.stop
            apart_x = sx.stop <= mx.start or sx.start >= mx.stop
            if apart_y or apart_x:
                drop[i] = True

    if drop[1:].all():
        return alpha
    return np.where(drop[labels], 0.0, alpha)


def unpremultiply(rgba: np.ndarray, floor: float = 0.12) -> np.ndarray:
    """Hebt die schwarze Matte aus halbtransparenten Pixeln heraus."""
    out = rgba.copy()
    a = np.maximum(out[..., 3:4], floor)
    out[..., :3] = np.clip(out[..., :3] / a, 0.0, 1.0)
    return out


def extend_edge_color(rgba: np.ndarray, radius: int = 4) -> np.ndarray:
    """Setzt die Innenfarbe ueber den Rand hinaus fort.

    Damit tragen halbtransparente Kantenpixel die Farbe des Koerpers statt
    Schwarz oder eines roten Kompressionssaums; beim Skalieren entsteht kein
    dunkler Halo mehr.
    """
    out = rgba.copy()
    solid = out[..., 3] > 0.85
    if not solid.any():
        return out
    # naechstgelegenes solides Pixel je Position
    idx = ndimage.distance_transform_edt(
        ~solid, return_distances=False, return_indices=True)
    donor = out[..., :3][tuple(idx)]
    dist = ndimage.distance_transform_edt(~solid)
    # Direkt ausserhalb der deckenden Flaeche wird die Farbe vollstaendig
    # ersetzt. Ein weicher Uebergang wuerde die durch das Zuruecknehmen der
    # Vormultiplikation aufgehellten Randpixel stehen lassen - sichtbar als
    # heller Saum, sobald die Figur vor dunklem Hintergrund steht.
    blend = np.clip(dist / 1.2, 0.0, 1.0)[..., None]
    out[..., :3] = np.where(solid[..., None], out[..., :3],
                            out[..., :3] * (1 - blend) + donor * blend)
    return out


def strip_fringe(rgba: np.ndarray, band: int = 3, sat_limit: float = 0.42) -> np.ndarray:
    """Entfernt gesaettigte Farbsaeume (rot/blau/gelb) direkt an der Kante.

    Betroffen sind nur Pixel innerhalb eines schmalen Randbandes, deren
    Saettigung deutlich ueber der ihrer Nachbarschaft liegt - echte farbige
    Bildinhalte im Koerper bleiben unangetastet.
    """
    out = rgba.copy()
    a = out[..., 3]
    solid = a > 0.5
    if not solid.any():
        return out
    inner = ndimage.binary_erosion(solid, iterations=band)
    rim = solid & ~inner

    rgb = out[..., :3]
    mx = rgb.max(axis=2)
    mn = rgb.min(axis=2)
    sat = np.where(mx > 1e-5, (mx - mn) / np.maximum(mx, 1e-5), 0.0)

    core_sat = sat[inner].mean() if inner.any() else 0.0
    bad = rim & (sat > max(sat_limit, core_sat * 2.2))
    if not bad.any():
        return out

    # betroffene Kantenpixel bekommen die Farbe des naechsten sauberen Pixels
    clean = solid & ~bad
    idx = ndimage.distance_transform_edt(
        ~clean, return_distances=False, return_indices=True)
    out[..., :3] = np.where(bad[..., None], rgb[tuple(idx)], rgb)
    return out


def clean_character(rgba: np.ndarray, min_area: int = 220,
                    hole_area: int = 90, feather: float = 0.7,
                    nominal=None, isolate: bool = True) -> np.ndarray:
    """Kompletter Durchlauf fuer Figurenblaetter mit harter Silhouette."""
    out = rgba.copy()
    a = out[..., 3]
    # Rauschboden und Saettigungsspitze begradigen
    a = np.where(a < 0.06, 0.0, a)
    a = np.where(a > 0.94, 1.0, a)
    a = despeckle(a, min_area)
    a = fill_pinholes(a, hole_area)
    if isolate:
        a = isolate_subject(a, nominal)
    out[..., 3] = a

    out = unpremultiply(out)
    out = strip_fringe(out)
    out = extend_edge_color(out)

    # Kante neu aufbauen: harte Maske, leicht einziehen, weich auslaufen
    mask = (out[..., 3] > 0.5).astype(np.float32)
    mask = ndimage.gaussian_filter(mask, feather)
    mask = np.clip((mask - 0.42) / 0.34, 0.0, 1.0)
    out[..., 3] = mask
    return out


def clean_effect(rgba: np.ndarray, min_area: int = 60,
                 floor: float = 0.05) -> np.ndarray:
    """Durchlauf fuer Effektblaetter - Verlaeufe bleiben erhalten.

    Wichtig: hier wird die Vormultiplikation NICHT zurueckgerechnet. Die
    Effektvorlagen liegen mit gerader Deckung vor; ein Zurueckrechnen wuerde
    den weiten, sehr schwachen Aura-Bereich um Faktor zehn aufhellen - im
    Spiel sichtbar als milchiges Rechteck rund um die Figur.
    """
    out = rgba.copy()
    a = out[..., 3]
    a = np.where(a < floor, 0.0, a)
    a = despeckle(a, min_area)
    # Rauschboden sauber auf null ziehen, ohne echte Verlaeufe zu kappen
    a = np.clip((a - floor) / (1.0 - floor), 0.0, 1.0)
    out[..., 3] = a
    return out


# --------------------------------------------------------------------------
# Normalisierung
# --------------------------------------------------------------------------


def content_bbox(alpha: np.ndarray, thresh: float = 0.35):
    mask = alpha > thresh
    if not mask.any():
        return None
    ys = np.where(mask.any(axis=1))[0]
    xs = np.where(mask.any(axis=0))[0]
    return int(xs[0]), int(ys[0]), int(xs[-1]) + 1, int(ys[-1]) + 1


def foot_anchor(alpha: np.ndarray, bbox, share: float = 0.18) -> float:
    """Waagerechte Mitte der untersten `share` der Silhouette."""
    x0, y0, x1, y1 = bbox
    h = y1 - y0
    band = alpha[max(y1 - max(int(h * share), 2), y0):y1, x0:x1] > 0.35
    if not band.any():
        return (x0 + x1) / 2.0
    cols = band.sum(axis=0).astype(np.float32)
    xs = np.arange(x0, x1, dtype=np.float32)
    return float((cols * xs).sum() / cols.sum())


def resize_rgba(rgba: np.ndarray, size) -> np.ndarray:
    """Premultipliziertes Resampling - sonst blutet Transparenz in die Farbe."""
    pm = rgba.copy()
    pm[..., :3] *= pm[..., 3:4]
    img = Image.fromarray((np.clip(pm, 0, 1) * 255).round().astype(np.uint8), "RGBA")
    img = img.resize(size, Image.LANCZOS)
    out = np.asarray(img, dtype=np.float32) / 255.0
    a = np.maximum(out[..., 3:4], 1e-4)
    out[..., :3] = np.clip(out[..., :3] / a, 0.0, 1.0)
    out[..., 3] = np.clip(out[..., 3], 0.0, 1.0)
    return out


def place_frame(frame: np.ndarray, cell: int, scale: float,
                anchor_x: float, ground_y: float, baseline: float) -> np.ndarray:
    """Setzt ein Einzelbild skaliert und verankert in eine quadratische Zelle.

    anchor_x / ground_y sind Quellkoordinaten; sie landen auf der Zellmitte
    beziehungsweise auf der gemeinsamen Bodenlinie.
    """
    h, w = frame.shape[:2]
    nw, nh = max(1, round(w * scale)), max(1, round(h * scale))
    small = resize_rgba(frame, (nw, nh))

    out = np.zeros((cell, cell, 4), dtype=np.float32)
    dst_x = cell / 2.0 - anchor_x * scale
    dst_y = cell * (1.0 - baseline) - ground_y * scale
    ox, oy = int(round(dst_x)), int(round(dst_y))

    sx0, sy0 = max(0, -ox), max(0, -oy)
    dx0, dy0 = max(0, ox), max(0, oy)
    cw = min(nw - sx0, cell - dx0)
    ch = min(nh - sy0, cell - dy0)
    if cw > 0 and ch > 0:
        out[dy0:dy0 + ch, dx0:dx0 + cw] = small[sy0:sy0 + ch, sx0:sx0 + cw]
    return out
