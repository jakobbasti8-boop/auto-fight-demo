"use strict";

/* Dr. BOB - Kamehameha.

   Figur und 25-Bild-Katalog zeichnet game-catalog.js. Der Strahl verwendet
   zusaetzlich den neuen vierteiligen Effektkatalog:
   Start/Muendung -> wiederholbares Mittelstueck -> Spitze -> Einschlag.
   Falls eines der neuen Module nicht geladen werden kann, bleibt der alte
   kame-beam-Atlas als Rueckfall erhalten. */
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

  /* Neuer vierteiliger Effektkatalog aus der gelieferten Vorlage.
     Alle Module haben dieselbe 307x512-Zellgeometrie. Das Mittelstueck darf
     beliebig oft wiederholt werden, wodurch der Strahl ohne Strecken des
     eigentlichen Bildes exakt bis zum Gegner verlaengert werden kann. */
  const bobBeamV2 = [
    "assets/bob-beam-start.webp",
    "assets/bob-beam-mid.webp",
    "assets/bob-beam-tip.webp",
    "assets/bob-beam-impact.webp"
  ].map(src => {
    const part = { img: new Image(), ok: false };
    part.img.onload = () => { part.ok = true; };
    part.img.src = src;
    return part;
  });

  function beamV2Ready() {
    return bobBeamV2.every(part => part.ok);
  }

  // Alter 5er-Atlas bleibt als Fallback fuer Cache-/Ladefehler erhalten.
  function beamEntry() {
    const e = SPRITES.get("kame-beam");
    return e && e.ok ? e : null;
  }

  function beamImage(img, x, y, w, h, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha == null ? 1 : alpha;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
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
    const useV2 = beamV2Ready();
    if ((!useV2 && !entry) || !foe || f.key !== "kame") return;
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

    const size = h * .52;
    let modW;
    if (useV2) {
      modW = size * (bobBeamV2[0].img.naturalWidth / bobBeamV2[0].img.naturalHeight);
    } else {
      const r0 = spriteRect(entry, 0);
      modW = size * (r0.sw / r0.sh);
    }

    // Etwas staerkere Ueberlappung verdeckt die Modulgrenzen des neuen
    // wasser-/energieartigen Strahls, ohne dessen Form sichtbar zu strecken.
    const overlap = modW * .22;
    const pulse = .985 + .015 * Math.sin(f.moveElapsed / 42);
    const drawH = size * pulse;
    const drawY = -drawH * .5;

    ctx.save();
    ctx.translate(originX, originY);
    if (f.face < 0) ctx.scale(-1, 1);
    ctx.beginPath();
    ctx.rect(-modW * .55, -size * .62, len + modW * 1.2, size * 1.24);
    ctx.clip();

    if (useV2) beamImage(bobBeamV2[0].img, -modW * .5, drawY, modW, drawH);
    else beamPiece(entry, 0, -modW * .5, drawY, modW, drawH);

    let x = modW * .40, n = 0;
    while (x < len - modW * .6) {
      if (useV2) beamImage(bobBeamV2[1].img, x, drawY, modW, drawH);
      else beamPiece(entry, 1 + (n & 1), x, drawY, modW, drawH);
      x += modW - overlap;
      n++;
    }

    if (useV2) beamImage(bobBeamV2[2].img, len - modW * .5, drawY, modW, drawH);
    else beamPiece(entry, 3, len - modW * .5, drawY, modW, drawH);
    ctx.restore();

    if (f.hitResolved && step <= 19) {
      const impact = h * 1.02;
      let ratio;
      if (useV2) {
        ratio = bobBeamV2[3].img.naturalWidth / bobBeamV2[3].img.naturalHeight;
      } else {
        const r4 = spriteRect(entry, 4);
        ratio = r4.sw / r4.sh;
      }
      const iw = impact * ratio;
      const cy = hb.y + hb.h * .48;
      const impactPulse = .90 + .10 * Math.sin(f.moveElapsed / 34);
      const alpha = step >= 18 ? .72 : 1;
      if (useV2) {
        beamImage(bobBeamV2[3].img,
          targetX - iw * impactPulse * .5,
          cy - impact * impactPulse * .5,
          iw * impactPulse, impact * impactPulse, alpha);
      } else {
        beamPiece(entry, 4,
          targetX - iw * impactPulse * .5,
          cy - impact * impactPulse * .5,
          iw * impactPulse, impact * impactPulse, alpha);
      }
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
