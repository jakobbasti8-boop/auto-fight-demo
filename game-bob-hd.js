"use strict";

/* Dr. BOB - Kamehameha.

   Figur und 25-Bild-Katalog zeichnet inzwischen game-catalog.js. Hier bleibt,
   was nur diesen Spezial betrifft: der Ablauf, der modulare Strahl aus dem
   Streifenatlas und das Trefferfenster. */
(function () {

  // Genau ein Bewegungsschritt je Katalogbild. Kein Bild wird uebersprungen.
  MOVES.kame = [
    ["idleA", 100, "Fokus"],                 // 01
    ["kmSink", 100, "Hände sammeln"],        // 02
    ["kmChargeA", 105, "Aufladen"],          // 03
    ["kmChargeA", 110, "Aufladen"],          // 04
    ["kmChargeB", 115, "Aufladen"],          // 05
    ["kmChargeB", 120, "Aufladen"],          // 06
    ["kmChargeB", 125, "Aufladen"],          // 07
    ["kmChargeB", 130, "Aufladen"],          // 08
    ["kmChargeB", 135, "Maximalladung"],     // 09
    ["kmFire", 120, "Abschuss vorbereiten"], // 10
    ["kmFire", 95, "Abschuss"],              // 11
    ["kmFire", 90, "Strahl"],                // 12
    ["kmFire", 90, "Strahl"],                // 13
    ["kmFire", 90, "Strahl"],                // 14
    ["kmFire", 90, "Strahl"],                // 15
    ["kmFire", 90, "Strahl"],                // 16
    ["kmFire", 100, "Strahl"],               // 17
    ["kmFire", 110, "Strahl"],               // 18
    ["kmFire", 120, "Nachhall"],             // 19
    ["kmFire", 130, "Nachhall"],             // 20
    ["kmSink", 130, "Rückstoß"],             // 21
    ["kmSink", 150, "Erschöpft"],            // 22
    ["idleB", 130, "Aufrichten"],            // 23
    ["idleA", 120, "Deckung"],               // 24
    ["idleA", 160, "Erholung"]               // 25
  ];

  /* Strahlatlas: 0 Muendung, 1/2 Schlauchsegmente im Wechsel,
     3 vordere Kappe, 4 Einschlag. */
  function beamEntry() {
    const e = SPRITES.get("kame-beam");
    return e && e.ok ? e : null;
  }

  function beamPiece(entry, i, x, y, w, h, alpha) {
    const r = spriteRect(entry, i);
    ctx.save();
    ctx.globalAlpha = alpha == null ? 1 : alpha;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(entry.img, r.sx, r.sy, r.sw, r.sh, x, y, w, h);
    ctx.restore();
  }

  function drawBobKameBeam(f, foe) {
    const entry = beamEntry();
    if (!entry || !foe || f.key !== "kame") return;
    const step = f.moveStep | 0;
    if (step < 10 || step > 19) return;

    const h = f.cfg.displayH, hb = getHurtbox(foe);
    const originX = f.x + f.face * h * .27;
    const originY = GROUND - h * .56;
    const targetX = hb.x + hb.w / 2;
    const dist = Math.max(70, Math.abs(targetX - originX));
    const dur = (f.move && f.move[f.moveStep] && f.move[f.moveStep][1]) || 1;
    const local = clamp(f.stepElapsed / dur, 0, 1);
    let grow = 1;
    if (step === 10) grow = .22 + .30 * local;
    else if (step === 11) grow = .52 + .48 * local;
    const len = dist * grow;

    // Die Module sind hochkant zugeschnitten; die Breite folgt dem Seitenverhaeltnis.
    const r0 = spriteRect(entry, 0);
    const size = h * .52;
    const modW = size * (r0.sw / r0.sh);
    // Die Modulraender laufen weich aus - ohne Ueberlappung bleibt eine
    // dunkle Naht im Strahl stehen.
    const overlap = modW * .20;

    ctx.save();
    ctx.translate(originX, originY);
    if (f.face < 0) ctx.scale(-1, 1);
    ctx.beginPath();
    ctx.rect(-modW * .55, -size * .58, len + modW * 1.2, size * 1.16);
    ctx.clip();

    beamPiece(entry, 0, -modW * .5, -size * .5, modW, size);
    let x = modW * .40, n = 0;
    while (x < len - modW * .6) {
      beamPiece(entry, 1 + (n & 1), x, -size * .5, modW, size);
      x += modW - overlap;
      n++;
    }
    beamPiece(entry, 3, len - modW * .5, -size * .5, modW, size);
    ctx.restore();

    if (f.hitResolved && step <= 19) {
      const r4 = spriteRect(entry, 4);
      const impact = h * 1.02;
      const iw = impact * (r4.sw / r4.sh);
      const cy = hb.y + hb.h * .48;
      const pulse = .90 + .10 * Math.sin(f.moveElapsed / 34);
      beamPiece(entry, 4, targetX - iw * pulse * .5, cy - impact * pulse * .5,
        iw * pulse, impact * pulse, step >= 18 ? .72 : 1);
    }
  }

  const baseBobEffects = effects;
  effects = function (f, foe, time) {
    if (f && f.cfg && f.cfg.key === "bob" && f.key === "kame") {
      drawBobKameBeam(f, foe);
      return;
    }
    return baseBobEffects(f, foe, time);
  };

  const baseBobHitbox = activeHitbox;
  activeHitbox = function (f, foe) {
    if (f && f.cfg && f.cfg.key === "bob" && f.key === "kame") {
      if (f.hitResolved || !foe || f.moveStep < 11 || f.moveStep > 17) return null;
      const h = f.cfg.displayH, hb = getHurtbox(foe);
      const ox = f.x + f.face * h * .27, tx = hb.x + hb.w / 2;
      const left = Math.min(ox, tx), right = Math.max(ox, tx);
      const cy = GROUND - h * .56;
      return { x: left, y: cy - h * .13, w: Math.max(28, right - left), h: h * .26, type: "beam" };
    }
    return baseBobHitbox(f, foe);
  };
})();
