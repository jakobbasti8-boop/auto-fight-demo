"use strict";

/* Katalog- und Bewegungsschicht.

   Hier liegt alles, was mit Einzelbildern zu tun hat:

   1. SPRITES  - laedt die Blaetter und liefert exakte Zellkoordinaten.
                 Die Masse (Zoom, Bodenlinie, Zellgroesse) stammen aus
                 assets/catalog.js und werden von tools/recut.py gemessen,
                 nicht von Hand geschaetzt.
   2. drawSprite - der einzige Ort, an dem ein Einzelbild gezeichnet wird.
                 Weiches Herunterskalieren, Fuss-Verankerung und Blickrichtung
                 sitzen damit fuer alle Figuren und Spezials gleich.
   3. MOVEMENT - der Bewegungskatalog: welche Aktion in welcher Phase welches
                 Einzelbild zeigt. Frueher lag diese Zuordnung in drei Dateien
                 verstreut als Zeilen-/Spalten-Rechnerei.
*/

/* ------------------------------------------------------------------ */
/* 1. Blaetter                                                         */
/* ------------------------------------------------------------------ */

const SPRITES = (function () {
  const defs = (typeof window !== "undefined" && window.SPRITE_CATALOG) || {};
  const entries = Object.create(null);
  const listeners = [];
  let pending = 0, failed = null;

  // Immer verzoegert melden: die Rueckrufe greifen auf Dinge zu, die erst in
  // spaeteren Skripten entstehen (Kaempfer, Portraits).
  function announce() {
    if (pending !== 0 || !listeners.length) return;
    setTimeout(() => {
      while (listeners.length && pending === 0) listeners.shift()(failed);
    }, 0);
  }

  for (const key of Object.keys(defs)) {
    const def = defs[key];
    const entry = {
      key,
      img: new Image(),
      ok: false,
      type: def.type || "uniform",
      cols: def.cols || def.modules || 1,
      rows: def.rows || 1,
      cell: def.cell || 0,
      spriteZoom: def.spriteZoom || null,
      baseline: def.baseline == null ? 0 : def.baseline,
      defaultFacing: def.defaultFacing || 1,
      frames: def.frames || []
    };
    entries[key] = entry;
    pending++;
    entry.img.onload = () => { entry.ok = true; pending--; announce(); };
    entry.img.onerror = () => { failed = failed || key; pending--; announce(); };
    entry.img.src = "assets/" + def.file;
  }

  return {
    entries,
    get(key) { return entries[key] || null; },
    count() { return Object.keys(entries).length; },
    ready(fn) { listeners.push(fn); announce(); },
    isReady() { return pending === 0 && !failed; },
    missing() { return failed; }
  };
})();
if (typeof window !== "undefined") window.SPRITES = SPRITES;

/* Ganzzahlige Zellgrenzen: die Blaetter sind nicht immer exakt durch die
   Spaltenzahl teilbar, und ein halbes Pixel Versatz zieht beim Skalieren
   einen Streifen der Nachbarzelle mit herein. */
function spriteRect(entry, index) {
  const w = entry.img.naturalWidth || entry.img.width || 2560;
  const h = entry.img.naturalHeight || entry.img.height || 2560;
  if (entry.type === "strip") {
    const n = Math.max(1, entry.cols || entry.modules || 1);
    const i = Math.max(0, Math.min(n - 1, index | 0));
    const x0 = Math.round(i * w / n);
    const x1 = Math.round((i + 1) * w / n);
    return { sx: x0, sy: 0, sw: Math.max(1, x1 - x0), sh: h };
  }
  const cols = Math.max(1, entry.cols || 1);
  const rows = Math.max(1, entry.rows || 1);
  const i = Math.max(0, Math.min(cols * rows - 1, index | 0));
  const c = i % cols;
  const r = (i / cols) | 0;
  const x0 = Math.round(c * w / cols);
  const x1 = Math.round((c + 1) * w / cols);
  const y0 = Math.round(r * h / rows);
  const y1 = Math.round((r + 1) * h / rows);
  return { sx: x0, sy: y0, sw: Math.max(1, x1 - x0), sh: Math.max(1, y1 - y0) };
}

/* Zeichnet ein Einzelbild mit standardisierter Zentrierung und Fussverankerung.

   opts.height   Koerperhoehe in Bildschirmpixeln (displayH)
   opts.x        Bodenposition der Figur (X-Zentrum)
   opts.baseY    Bodenlinie (Standard: GROUND)
   opts.face     Blickrichtung (1 = rechts, -1 = links)
   opts.zoom     Anteil der Figur an der Zelle (Standard: aus dem Katalog)
   opts.scale    zusaetzlicher Faktor, z. B. fuer Explosionen
   opts.center   true = an der Bildmitte statt am Boden ausrichten
*/
function drawSprite(entry, index, opts) {
  if (!entry || !entry.ok) return false;
  const r = spriteRect(entry, index);
  const zoom = opts.zoom != null ? opts.zoom : (entry.spriteZoom || 1.0);
  const base = opts.baseline != null ? opts.baseline : (entry.baseline != null ? entry.baseline : 0.0);
  const scale = opts.scale != null ? opts.scale : 1.0;
  const dh = (opts.height / zoom) * scale;
  const dw = dh * (r.sw / r.sh);
  const baseY = opts.baseY != null ? opts.baseY : GROUND;
  const flip = opts.face != null && opts.face !== entry.defaultFacing;

  const posX = Math.round(opts.x);
  const posY = Math.round(opts.center ? baseY : (baseY + dh * base));
  const drawX = Math.round(-dw * 0.5);
  const drawY = Math.round(opts.center ? -dh * 0.5 : -dh);

  ctx.save();
  ctx.translate(posX, posY);
  if (flip) ctx.scale(-1, 1);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  if (opts.alpha != null) ctx.globalAlpha = opts.alpha;

  ctx.drawImage(entry.img, r.sx, r.sy, r.sw, r.sh, drawX, drawY, Math.round(dw), Math.round(dh));

  if (opts.tint && opts.tintAlpha > 0 && typeof drawTinted === "function") {
    drawTinted(entry.img, r.sx, r.sy, r.sw, r.sh, drawX, drawY, Math.round(dw), Math.round(dh),
      opts.tint, opts.tintAlpha);
  }
  ctx.restore();
  return true;
}

/* Portrait-Ausschnitt aus dem Blatt bestimmen. */
function portraitRect(entry) {
  const def = (window.SPRITE_CATALOG || {})[entry.key];
  if (def && def.portrait) return def.portrait;
  const r = spriteRect(entry, 0);
  const box = (entry.frames && entry.frames[0] && entry.frames[0].bbox)
    || [0, 0, r.sw, r.sh];
  const bh = box[3] - box[1];
  const side = Math.min(r.sw, Math.max(bh * 0.44, 40));
  return {
    x: Math.max(0, Math.min(r.sw - side, (box[0] + box[2]) / 2 - side / 2)) / r.sw,
    y: Math.max(0, box[1] - bh * 0.03) / r.sh,
    w: side / r.sw, h: side / r.sh
  };
}

/* Zoom und Bodenlinie stammen aus der Messung im Katalog. */
function applyCatalogMetrics() {
  const map = {
    bob: "bob",
    kurz: "kurz",
    nova: "theresa",
    brainbug: "brainbug",
    mcmoney: "mcmoney",
    drslop: "drslop"
  };
  for (const key of Object.keys(map)) {
    const fighter = (typeof fighterByKey !== "undefined") && fighterByKey[key];
    const entry = SPRITES.get(map[key]);
    if (!fighter || !entry) continue;
    if (entry.spriteZoom) fighter.cfg.spriteZoom = entry.spriteZoom;
    if (entry.baseline != null) fighter.cfg.baseline = entry.baseline;
  }
}

/* ------------------------------------------------------------------ */
/* 2. Bewegungskatalog & Standard-Raster                               */
/* ------------------------------------------------------------------ */

const MOVEMENT_DEFAULT = {
  idle: { frames: [0, 1, 2, 3, 4], rate: 4.2 },
  walk: { frames: [5, 6, 7, 8, 9], rate: 1.0 },
  guard: 10,
  punch: { wind: 10, hit: [11, 12], alt: 13, recover: 14 },
  kickHigh: { wind: 15, hit: [17, 18], back: 16, recover: 19 },
  kickLow: { wind: 15, hit: [16, 18], recover: 19 },
  jump: { crouch: 15, rise: 8, strike: 18, fall: 9, land: 19 },
  damage: { hit: 20, stagger: 21, air: 22, land: 23, down: 23, ko: 23,
            getUp: [23, 24, 0] }
};

const MOVEMENT = {
  bob: {
    sheet: "bob",
    walk: { frames: [5, 6, 7, 8, 9], rate: 1.0 },
    jump: { crouch: 15, rise: 8, strike: 18, fall: 9, land: 19 },
    damage: { hit: 20, stagger: 21, air: 22, land: 23, down: 23, ko: 23,
              getUp: [23, 24, 0] },
    special: { key: "kame", sheet: "kame",
               beamFrames: [10, 11, 12, 13, 14, 15, 16, 17, 18], clipAhead: 0.35 }
  },
  kurz: {
    sheet: "kurz",
    walk: { frames: [5, 6, 7, 8, 9], rate: 1.0 },
    jump: { crouch: 15, rise: 8, strike: 18, fall: 9, land: 19 },
    damage: { hit: 20, stagger: 21, air: 22, land: 23, down: 24, ko: 24,
              getUp: [23, 21, 0] },
    special: { key: "comet", sheet: "kurz-comet",
               fxOnly: [18, 19, 20], fxPose: 12, fxScale: 1.5, fxDrop: 22 }
  },
  nova: {
    sheet: "theresa",
    walk: { frames: [5, 6, 7, 8, 9], rate: 1.0 },
    run: { frames: [8, 9] },
    jump: { crouch: 15, rise: 8, strike: 18, fall: 9, land: 19 },
    damage: { hit: 20, stagger: 24, air: 23, land: 21, down: 22, ko: 21,
              getUp: [22, 24, 0] },
    special: { key: "protonKick", sheet: "theresa-proton",
               fxOnly: [16, 17, 18], fxPose: 17, fxScale: 1.45, fxDrop: 18 }
  },
  brainbug: {
    sheet: "brainbug",
    idle: { frames: [0, 1, 2, 3, 4], rate: 2.2 },
    walk: { frames: [0, 1, 2, 3, 4], rate: 1.0 },
    gesture: { frames: [5, 6, 7, 8, 9], rate: 2.2 },
    jump: { crouch: 15, rise: 8, strike: 18, fall: 9, land: 19 },
    damage: { hit: 20, stagger: 21, air: 22, land: 23, down: 24, ko: 24,
              getUp: [23, 22, 21] },
    special: { key: "sourMilkBurst", sheet: "brainbug-sourmilk",
               beamFrames: [15, 16, 17, 18, 19], clipAhead: 0.20 }
  },
  mcmoney: {
    sheet: "mcmoney",
    idle: { frames: [0, 1, 2, 3, 4], rate: 3.8 },
    walk: { frames: [5, 6, 7, 8, 9], rate: 1.0 },
    jump: { crouch: 15, rise: 8, strike: 18, fall: 9, land: 19 },
    damage: { hit: 20, stagger: 21, air: 22, land: 23, down: 23, ko: 23,
              getUp: [24, 0] },
    special: { key: "kapitalCrash", sheet: "mcmoney-special",
               fxOnly: [16, 17, 18], fxPose: 11, fxScale: 1.5, fxDrop: 16 }
  },
  drslop: {
    sheet: "drslop",
    idle: { frames: [0, 1, 2, 3, 4], rate: 4.2 },
    walk: { frames: [5, 6, 7, 8, 9], rate: 1.2 },
    guard: 4,
    punch: { wind: 0, hit: [1, 2], alt: 1, recover: 4 },
    kickHigh: { wind: 2, hit: [2, 3], back: 2, recover: 4 },
    kickLow: { wind: 2, hit: [2, 3], recover: 4 },
    jump: { crouch: 3, rise: 3, strike: 3, fall: 3, land: 4 },
    damage: { hit: 5, stagger: 6, air: 7, land: 8, down: 8, ko: 8, getUp: [9, 0] },
    special: { key: "slopKiHack", sheet: "drslop-sp1" }
  }
};

function movementFor(fighter) {
  const own = MOVEMENT[fighter.cfg.key] || {};
  return {
    sheet: own.sheet || fighter.cfg.asset,
    idle: own.idle || MOVEMENT_DEFAULT.idle,
    walk: own.walk || MOVEMENT_DEFAULT.walk,
    run: own.run || null,
    gesture: own.gesture || null,
    guard: own.guard == null ? MOVEMENT_DEFAULT.guard : own.guard,
    punch: own.punch || MOVEMENT_DEFAULT.punch,
    kickHigh: own.kickHigh || MOVEMENT_DEFAULT.kickHigh,
    kickLow: own.kickLow || MOVEMENT_DEFAULT.kickLow,
    jump: own.jump || MOVEMENT_DEFAULT.jump,
    damage: own.damage || MOVEMENT_DEFAULT.damage,
    special: own.special || null
  };
}

function pickPair(list, step) {
  if (!Array.isArray(list)) return list;
  return list[Math.min(list.length - 1, Math.max(0, step))];
}

/* Liefert den Katalogindex fuer den aktuellen Zustand einer Figur. */
function catalogIndex(f) {
  const m = movementFor(f);
  if (f.ko) return m.damage.ko;

  if (!f.move) {
    if (Math.abs(f.vx) > 0.01) {
      const set = m.walk.frames;
      let i = Math.floor(f.walkCycle) % set.length;
      if (f.vx * f.face < 0) i = set.length - 1 - i;
      return set[i];
    }
    if (m.gesture && Math.floor(f.idleTime / 3.6) % 3 === 2) {
      const g = m.gesture.frames;
      return g[Math.floor(f.idleTime * (m.gesture.rate || 2.2)) % g.length];
    }
    const idle = m.idle.frames;
    return idle[Math.floor(f.idleTime * (m.idle.rate || 4)) % idle.length];
  }

  const key = f.key || "";
  const step = f.moveStep | 0;
  const frame = f.move[step];
  const phase = frame ? frame[2] : "";
  const total = f.move.reduce((sum, x) => sum + x[1], 0);
  const progress = clamp(f.moveElapsed / total, 0, 0.999);

  if (key.startsWith("block")) return m.guard;

  if (key.startsWith("hit")) {
    const d = m.damage;
    if (phase === "Aufstehen") {
      const local = clamp(f.stepElapsed / ((frame && frame[1]) || 1), 0, 0.999);
      const chain = d.getUp;
      return chain[Math.min(chain.length - 1,
        Math.floor((step % 2 === 0 ? local : 1) * chain.length))];
    }
    if (phase === "Am Boden") return d.down;
    if (phase === "Aufschlag") return d.land;
    if (phase === "Wegfliegen") return d.air;
    if (phase === "Taumeln") return d.stagger;
    return d.hit;
  }

  if (key === "jumpKick" || key === "slopJumpKick") {
    const j = m.jump;
    if (phase === "Absprung") return j.crouch;
    if (phase === "Aufstieg") return j.rise;
    if (phase === "Treffer") return j.strike;
    if (phase === "Fallen") return j.fall;
    if (phase === "Landung") return j.land;
    return j.land;
  }

  if (key.startsWith("punch") || key.startsWith("slopPunch") || key === "slopHaymaker" || key === "headbutt" || key === "brainFlail") {
    const p = m.punch;
    if (phase.includes("Ausholen")) return p.wind;
    if (phase.includes("Treffer")) return pickPair(p.hit, step - 1);
    return p.recover;
  }

  if (key.startsWith("kickHigh") || key.startsWith("slopKickHigh")) {
    const k = m.kickHigh;
    if (phase.includes("Ausholen")) return k.wind;
    if (phase.includes("Treffer")) return pickPair(k.hit, step - 1);
    if (phase.includes("Zurück")) return k.back != null ? k.back : k.wind;
    return k.recover;
  }

  if (key.startsWith("kickLow") || key.startsWith("slopKickLow")) {
    const k = m.kickLow;
    if (phase.includes("Absenken") || phase.includes("Ausholen")) return k.wind;
    if (phase.includes("Treffer")) return pickPair(k.hit, step - 2);
    if (phase.includes("Zurück")) return k.recover;
    return k.recover;
  }

  // Unbekannte Aktion: gleichmaessig ueber die Schlagfolge laufen lassen.
  const p = m.punch;
  const chain = [p.wind, p.hit[0], p.hit[1] != null ? p.hit[1] : p.hit[0],
                 p.alt != null ? p.alt : p.recover, p.recover];
  return chain[Math.min(chain.length - 1, Math.floor(progress * chain.length))];
}

/* Zeichnet die Figur inklusive Spezialkatalog. Rueckgabe false, wenn das
   Blatt noch nicht geladen ist - dann uebernimmt der alte Zeichenweg. */
function drawFighterCatalog(f, foe) {
  if (f.cfg.key === "drslop" && typeof drawDrSlopCatalog === "function") {
    return drawDrSlopCatalog(f, foe);
  }
  const m = movementFor(f);
  const sp = m.special;

  if (sp && f.key === sp.key) {
    const entry = SPRITES.get(sp.sheet);
    if (entry && entry.ok) {
      const idx = Math.max(0, Math.min(entry.cols * entry.rows - 1, f.moveStep | 0));
      const fxOnly = sp.fxOnly && sp.fxOnly.indexOf(idx) >= 0;
      if (fxOnly) {
        const base = SPRITES.get(m.sheet);
        if (base && base.ok) {
          drawSprite(base, sp.fxPose == null ? m.kickHigh.hit[0] : sp.fxPose, {
            x: f.x, height: f.cfg.displayH, face: f.face
          });
        }
        const target = foe && !foe.ko ? foe : null;
        drawSprite(entry, idx, {
          x: target ? target.x : f.x + f.face * f.cfg.displayH * 0.6,
          baseY: GROUND + (sp.fxDrop || 16),
          height: f.cfg.displayH, face: 1, scale: sp.fxScale || 1.4
        });
        return true;
      }
      const clipped = sp.beamFrames && sp.beamFrames.indexOf(idx) >= 0;
      if (clipped) ctx.save();
      if (clipped) {
        const cut = f.x + f.face * f.cfg.displayH * (sp.clipAhead || 0.3);
        ctx.beginPath();
        if (f.face > 0) ctx.rect(-4000, -4000, cut + 4000, 8000);
        else ctx.rect(cut, -4000, 4000 + (W - cut), 8000);
        ctx.clip();
      }
      const drawn = drawSprite(entry, idx, {
        x: f.x, height: f.cfg.displayH, face: f.face,
        tint: f.hitFlash > 0 ? f.flashCol : null,
        tintAlpha: Math.min(1, f.hitFlash / 200) * 0.8
      });
      if (clipped) ctx.restore();
      return drawn;
    }
  }

  const entry = SPRITES.get(m.sheet);
  if (!entry || !entry.ok) return false;
  return drawSprite(entry, catalogIndex(f), {
    x: f.x, height: f.cfg.displayH, face: f.face,
    tint: f.hitFlash > 0 ? f.flashCol : null,
    tintAlpha: Math.min(1, f.hitFlash / 200) * 0.8
  });
}
