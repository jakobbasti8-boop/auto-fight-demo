#!/usr/bin/env python3
"""Schneidet saemtliche AUTO-FIGHT-Kataloge aus den Rohvorlagen neu.

Aufruf:  python3 tools/recut.py [--src VERZEICHNIS] [--out VERZEICHNIS]

Erzeugt pro Katalog
  * ein WebP-Blatt mit quadratischen Zellen (Standard 512 px)
  * einen Eintrag in assets/catalog.json mit Zoom, Bodenlinie und
    Einzelbild-Metadaten (Trefferbox-Rohmasse, Boden-/Luftkennung)

Zwei Betriebsarten:
  anchored  - jedes Einzelbild wird am Fuss-Mittelpunkt und an einer
              gemeinsamen Bodenlinie ausgerichtet (Figurenblaetter)
  uniform   - die Zellgeometrie der Vorlage bleibt erhalten, nur Zuschnitt
              und Skalierung werden vereinheitlicht (Spezial-/Effektblaetter,
              bei denen Explosionen relativ zur Figur sitzen muessen)
"""

from __future__ import annotations

import argparse
import json
import os
import sys

import numpy as np
from PIL import Image, ImageFilter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import spritekit as sk  # noqa: E402

CELL = 512
FIGURE_SHARE = 0.74   # Anteil der Standfigur an der Zellhoehe
BASELINE = 0.035      # Abstand Bodenlinie zur Zellunterkante (Anteil)

# --------------------------------------------------------------------------
# Katalogdefinitionen
# --------------------------------------------------------------------------
# key            Dateiname des Ergebnisses
# src            Rohvorlage
# bg             'alpha' (bereits freigestellt) | 'green' (Chroma-Key)
# kind           'character' | 'effect'
# mode           'anchored' | 'uniform'
# ground_rows    Zeilen, deren Einzelbilder die gemeinsame Bodenlinie setzen
# ref_rows       Zeilen, aus denen die Referenz-Koerperhoehe stammt

CATALOGS = [
    dict(key="bob", src="bob_base.png", bg="alpha", kind="character",
         mode="anchored", cols=5, rows=5, ground_rows=(0, 1, 2, 3),
         ref_rows=(0,), facing=1),
    dict(key="kame", src="bob_kame.png", bg="alpha", kind="effect",
         mode="uniform", cols=5, rows=5, ref_frames=(0, 1), facing=1),
    dict(key="kame-beam", src="bob_beam.png", bg="alpha", kind="effect",
         mode="strip", cols=5, rows=1, facing=1),
    dict(key="theresa", src="theresa_base_green.jpg", bg="green",
         kind="character", mode="anchored", cols=5, rows=5,
         ground_rows=(0, 1, 2, 3), ref_rows=(0,), facing=1),
    dict(key="theresa-proton", src="theresa_proton_green.jpg", bg="green",
         kind="effect", mode="uniform", cols=5, rows=5, ref_frames=(0, 1, 2),
         facing=1),
    dict(key="kurz", src="kurz.webp", bg="alpha", kind="character", halo="white",
         mode="anchored", cols=5, rows=5, ground_rows=(0, 1, 2, 3),
         ref_rows=(0,), facing=-1),
    dict(key="kurz-comet", src="kurz_comet.png", bg="alpha", kind="effect", halo="white",
         mode="uniform", cols=5, rows=5, ref_frames=(0, 1), facing=-1),
    dict(key="brainbug", src="brainbug.webp", bg="alpha", kind="character", halo="white",
         mode="anchored", cols=5, rows=5, ground_rows=(0, 1, 2, 3),
         ref_rows=(0,), facing=1),
    dict(key="brainbug-sourmilk", src="brainbug_special.png", bg="alpha", halo="white",
         kind="effect", mode="uniform", cols=5, rows=5, ref_frames=(0, 1),
         facing=1),
    dict(key="brainbug-sourmilk-beam", src="brainbug_beam.png", bg="alpha",
         kind="effect", mode="strip", cols=4, rows=1, facing=1),
]


# --------------------------------------------------------------------------


def sharpen(rgba: np.ndarray, amount: float = 0.35, radius: float = 1.0) -> np.ndarray:
    """Leichte Unschaerfemaske - faengt den Weichzeichner des Hochskalierens ab."""
    if amount <= 0:
        return rgba
    pm = rgba.copy()
    pm[..., :3] *= pm[..., 3:4]
    img = Image.fromarray((np.clip(pm, 0, 1) * 255).round().astype(np.uint8), "RGBA")
    img = img.filter(ImageFilter.UnsharpMask(
        radius=radius, percent=int(amount * 100), threshold=2))
    out = np.asarray(img, dtype=np.float32) / 255.0
    a = np.maximum(out[..., 3:4], 1e-4)
    out[..., :3] = np.clip(out[..., :3] / a, 0.0, 1.0)

    # Nur im deckenden Bereich schaerfen. Im weichen Randstreifen blaest das
    # Zuruecknehmen der Vormultiplikation die Ueberschwinger der Maske auf -
    # genau daraus entsteht der helle Saum um die Figur.
    w = np.clip((rgba[..., 3:4] - 0.55) / 0.35, 0.0, 1.0)
    out[..., :3] = rgba[..., :3] * (1.0 - w) + out[..., :3] * w
    out[..., 3] = rgba[..., 3]
    return out


def prepare_sheet(rgba: np.ndarray, spec: dict) -> np.ndarray:
    """Nur der Hintergrund-Key laeuft ueber das ganze Blatt."""
    if spec["bg"] == "green":
        rgba = sk.key_greenscreen(rgba)
        rgba = sk.clear_grid_lines(rgba, spec["cols"], spec["rows"],
                                   spec.get("grid", 6))
    return rgba


def prepare_cell(cell: np.ndarray, spec: dict, nominal=None) -> np.ndarray:
    """Feinarbeit pro Zelle - so kann Nachbarschaftsmuell erkannt werden."""
    side = min(cell.shape[0], cell.shape[1])
    if spec.get("halo") == "white":
        # core klein halten: in Seitenansichten ist das weisse Unterhemd nur
        # wenige Pixel breit und wuerde sonst als Fetzen eingestuft.
        cell = sk.strip_white_halo(cell, core=2, band=6)
    if spec["kind"] == "character":
        return sk.clean_character(
            cell,
            min_area=max(40, int(side * side * 0.0012)),
            hole_area=max(20, int(side * side * 0.0006)),
            nominal=nominal)
    return sk.clean_effect(cell, min_area=max(20, int(side * side * 0.0002)))


# Die Vorlagen sind nicht randscharf: Schuhe und Haarspitzen ragen ueber die
# Rasterlinie in die Nachbarzelle. Deshalb wird mit Rand geschnitten und danach
# nach Zugehoerigkeit sortiert - sonst fehlen einer Reihe die Fuesse.
OVERSCAN = 0.16


def split_frames(sheet: np.ndarray, cols: int, rows: int, spec: dict):
    h, w = sheet.shape[:2]
    cw, ch = w / cols, h / rows
    # Nur Figurenblaetter brauchen Ueberstand; bei Effektblaettern wuerde er
    # Nachbarexplosionen mit hineinziehen.
    pad = int(round(min(cw, ch) * OVERSCAN)) if spec["mode"] == "anchored" else 0
    padded = np.zeros((h + 2 * pad, w + 2 * pad, 4), dtype=sheet.dtype)
    padded[pad:pad + h, pad:pad + w] = sheet

    frames = []
    for r, c, (x0, y0, x1, y1) in sk.grid_cells(w, h, cols, rows):
        win = padded[y0:y1 + 2 * pad, x0:x1 + 2 * pad].copy()
        nominal = (pad, pad, pad + (x1 - x0), pad + (y1 - y0))
        frames.append(dict(row=r, col=c, pad=pad, nominal=nominal,
                           cell_h=y1 - y0, cell_w=x1 - x0,
                           img=prepare_cell(win, spec, nominal)))
    return frames


def portrait_box(frame_rgba, bbox, cell):
    """Kopfausschnitt fuer das Auswahlportrait messen.

    Der Kopf wird nicht geraten: im obersten Fuenftel der Silhouette wird der
    mit der Deckung gewichtete waagerechte Schwerpunkt gebildet. Bei Figuren
    mit weit fliegendem Haar liegt der Kopf sonst neben der Bildmitte.
    Ergebnis in Zellanteilen, damit die Laufzeit nichts mehr rechnen muss -
    das spart auch getImageData, das beim Start ueber file:// blockiert waere.
    """
    if bbox is None:
        return None
    x0, y0, x1, y1 = bbox
    bh = max(1, y1 - y0)
    band = frame_rgba[y0:y0 + max(4, int(bh * 0.22)), x0:x1, 3]
    if band.size and band.sum() > 0:
        cols = band.sum(axis=0)
        xs = np.arange(x0, x1, dtype=np.float32)
        cx = float((cols * xs).sum() / cols.sum())
    else:
        cx = (x0 + x1) / 2.0
    side = min(cell, max(bh * 0.44, 40))
    px = min(max(0.0, cx - side / 2), cell - side)
    py = max(0.0, y0 - bh * 0.03)
    return dict(x=round(px / cell, 5), y=round(py / cell, 5),
                w=round(side / cell, 5), h=round(side / cell, 5))


def measure(frames):
    for fr in frames:
        alpha = fr["img"][..., 3]
        bbox = sk.content_bbox(alpha)
        fr["bbox"] = bbox
        if bbox is None:
            fr["empty"] = True
            continue
        fr["empty"] = False
        fr["foot"] = sk.foot_anchor(alpha, bbox)
        fr["mid"] = (bbox[0] + bbox[2]) / 2.0
        fr["height"] = bbox[3] - bbox[1]
        fr["width"] = bbox[2] - bbox[0]
    return frames


def build_anchored(frames, spec, cell):
    """Fuss-Anker plus gemeinsame Bodenlinie."""
    live = [f for f in frames if not f["empty"]]
    src_h = frames[0].get("cell_h", frames[0]["img"].shape[0])

    ground_pool = [f for f in live if f["row"] in spec["ground_rows"]]
    bottoms = np.array([f["bbox"][3] for f in ground_pool], dtype=np.float32)
    ground = float(np.median(bottoms))
    # Ausreisser (Sprungbilder) aus der Bodenlinie herausrechnen
    keep = np.abs(bottoms - ground) < src_h * 0.06
    if keep.any():
        ground = float(bottoms[keep].mean())

    ref_pool = [f for f in live if f["row"] in spec["ref_rows"]]
    ref_h = float(np.median([f["height"] for f in ref_pool]))

    scale = (cell * FIGURE_SHARE) / ref_h

    # Sicherheitspruefung: nichts darf aus der Zelle laufen
    for f in live:
        anchor_x = f["foot"] if f["row"] in spec["ground_rows"] else f["mid"]
        gy = min(f["bbox"][3], ground) if f["row"] not in spec["ground_rows"] else ground
        need_up = (gy - f["bbox"][1]) * scale
        need_down = (f["bbox"][3] - gy) * scale
        need_left = (anchor_x - f["bbox"][0]) * scale
        need_right = (f["bbox"][2] - anchor_x) * scale
        lim_up = cell * (1.0 - BASELINE) - 2
        lim_down = cell * BASELINE - 2
        lim_side = cell / 2.0 - 2
        worst = max(need_up / lim_up, need_down / max(lim_down, 1),
                    need_left / lim_side, need_right / lim_side)
        if worst > 1.0:
            scale /= worst

    out = []
    for f in frames:
        if f["empty"]:
            out.append(dict(frame=np.zeros((cell, cell, 4), np.float32), meta=None))
            continue
        grounded = f["row"] in spec["ground_rows"]
        anchor_x = f["foot"] if grounded else f["mid"]
        gy = ground if grounded else min(f["bbox"][3], ground)
        placed = sk.place_frame(f["img"], cell, scale, anchor_x, gy, BASELINE)
        out.append(dict(frame=placed, meta=dict(
            row=f["row"], col=f["col"], grounded=bool(grounded),
            airborne=bool(f["bbox"][3] < ground - src_h * 0.04))))

    share = ref_h * scale / cell
    return out, scale, dict(ground=ground, ref_h=ref_h,
                            share=share, baseline=BASELINE)


def build_uniform(frames, spec, cell):
    """Zellgeometrie der Vorlage beibehalten, nur sauber skalieren.

    Zoom und Bodenlinie werden aus den Bildern der Referenzzeile gemessen -
    damit muss im Spiel nichts mehr von Hand nachjustiert werden.
    """
    src = frames[0]["img"].shape[0]
    scale = cell / src
    live = [f for f in frames if not f["empty"]]
    if spec.get("ref_frames"):
        want = set(spec["ref_frames"])
        ref = [f for f in live
               if f["row"] * spec["cols"] + f["col"] in want] or live
    else:
        ref = [f for f in live if f["row"] in spec.get("ref_rows", (0,))] or live
    ref_h = float(np.median([f["height"] for f in ref]))
    ground = float(np.median([f["bbox"][3] for f in ref]))

    out = []
    for f in frames:
        placed = sk.resize_rgba(f["img"], (cell, cell))
        out.append(dict(frame=placed, meta=dict(
            row=f["row"], col=f["col"], grounded=True, airborne=False)))
    return out, scale, dict(ground=ground, ref_h=ref_h,
                            share=ref_h / src, baseline=(src - ground) / src)


def build_strip(sheet, spec, cell):
    """Waagerechter Effektstreifen mit n Modulen.

    Jedes Modul wird waagerecht auf seinen tatsaechlichen Inhalt beschnitten.
    In der Vorlage haben einzelne Module bis zu zehn Pixel leeren Rand - beim
    Aneinandersetzen des Strahls entstuende daraus eine sichtbare Naht.
    """
    h, w = sheet.shape[:2]
    n = spec["cols"]
    scale = cell / h
    out_w = round(w / n * scale)
    canvas = np.zeros((cell, out_w * n, 4), np.float32)
    trims = []
    for i in range(n):
        x0, x1 = round(i * w / n), round((i + 1) * w / n)
        piece = sheet[:, x0:x1]
        cols = piece[..., 3].max(axis=0) > 0.04
        xs = np.where(cols)[0]
        if len(xs):
            piece = piece[:, xs[0]:xs[-1] + 1]
            trims.append(int(xs[0]) + int(piece.shape[1]) - int(x1 - x0))
        else:
            trims.append(0)
        canvas[:, i * out_w:(i + 1) * out_w] = sk.resize_rgba(piece, (out_w, cell))
    return canvas, dict(modules=n, moduleW=out_w, moduleH=cell)


# --------------------------------------------------------------------------


def _merge_catalog(out_dir: str, entry: dict) -> int:
    """Nach jedem Katalog sofort schreiben - ein Abbruch verliert nichts."""
    path = os.path.join(out_dir, "catalog.json")
    data = {}
    if os.path.exists(path):
        with open(path, encoding="utf-8") as fh:
            data = json.load(fh)
    data.update(entry)
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=1, ensure_ascii=False)

    # Die Demo laeuft ohne Server direkt aus dem Dateisystem - fetch() waere
    # dort durch CORS gesperrt. Deshalb zusaetzlich als JS-Datei ablegen.
    with open(os.path.join(out_dir, "catalog.js"), "w", encoding="utf-8") as fh:
        fh.write('"use strict";\n// Erzeugt von tools/recut.py - nicht von Hand aendern.\n'
                 "window.SPRITE_CATALOG=")
        json.dump(data, fh, separators=(",", ":"), ensure_ascii=False)
        fh.write(";\n")
    return len(data)


def run(src_dir: str, out_dir: str, only=None) -> dict:
    os.makedirs(out_dir, exist_ok=True)
    catalog = {}

    for spec in CATALOGS:
        if only and spec["key"] not in only:
            continue
        path = os.path.join(src_dir, spec["src"])
        if not os.path.exists(path):
            print(f"  uebersprungen (fehlt): {spec['src']}")
            continue

        print(f"* {spec['key']:<26} <- {spec['src']}")
        sheet = sk.load_rgba(path)
        sheet = prepare_sheet(sheet, spec)

        if spec["mode"] == "strip":
            sheet = sk.clean_effect(sheet)
            canvas, info = build_strip(sheet, spec, CELL)
            canvas = sharpen(canvas, 0.22)
            dst = os.path.join(out_dir, f"{spec['key']}.webp")
            sk.save_rgba(canvas, dst, quality=95, method=6)
            entry = dict(file=f"{spec['key']}.webp", type="strip", **info)
            catalog[spec["key"]] = entry
            _merge_catalog(out_dir, {spec["key"]: entry})
            print(f"    {canvas.shape[1]}x{canvas.shape[0]}  "
                  f"{os.path.getsize(dst)/1024:.0f} kB")
            continue

        frames = measure(split_frames(sheet, spec["cols"], spec["rows"], spec))
        if spec["mode"] == "anchored":
            placed, scale, info = build_anchored(frames, spec, CELL)
        else:
            placed, scale, info = build_uniform(frames, spec, CELL)

        cols, rows = spec["cols"], spec["rows"]
        canvas = np.zeros((CELL * rows, CELL * cols, 4), np.float32)
        meta = []
        for i, item in enumerate(placed):
            r, c = i // cols, i % cols
            canvas[r * CELL:(r + 1) * CELL, c * CELL:(c + 1) * CELL] = item["frame"]
            m = item["meta"] or dict(row=r, col=c, grounded=True, airborne=False)
            bb = sk.content_bbox(item["frame"][..., 3])
            m["bbox"] = list(bb) if bb else None
            meta.append(m)

        canvas = sharpen(canvas, 0.30 if spec["kind"] == "character" else 0.18)
        dst = os.path.join(out_dir, f"{spec['key']}.webp")
        sk.save_rgba(canvas, dst, quality=94, method=6)

        catalog[spec["key"]] = dict(
            file=f"{spec['key']}.webp", type=spec["mode"], cols=cols, rows=rows,
            cell=CELL, spriteZoom=round(info["share"], 4),
            baseline=round(info["baseline"], 4), defaultFacing=spec["facing"],
            sourceScale=round(scale, 5),
            portrait=portrait_box(placed[0]["frame"], meta[0].get("bbox"), CELL),
            frames=meta)
        _merge_catalog(out_dir, {spec["key"]: catalog[spec["key"]]})
        print(f"    {canvas.shape[1]}x{canvas.shape[0]}  scale {scale:.3f}  "
              f"{os.path.getsize(dst)/1024:.0f} kB")

    return catalog


def main():
    ap = argparse.ArgumentParser()
    here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ap.add_argument("--src", default=os.path.join(here, "tools", "source"))
    ap.add_argument("--out", default=os.path.join(here, "assets"))
    ap.add_argument("--only", nargs="*")
    args = ap.parse_args()

    run(args.src, args.out, args.only)
    total = _merge_catalog(args.out, {})
    print(f"\ncatalog.json: {total} Eintraege")


if __name__ == "__main__":
    main()
