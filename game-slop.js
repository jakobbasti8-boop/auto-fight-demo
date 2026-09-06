"use strict";

/* ==========================================================================
   DR. SLOP - THE PSYCHO CHAOTIC FIGHTING GENIUS
   - Predecessor to Dr. Bob before reformation
   - 3 Unique Long Creative Special Attacks with charging & energy discharge:
     1. KI-THRONEN STURM / KI-HACK (Dual glowing smartphones, lightning, drone swarm)
     2. PSYCHO SPEED BLITZ / AMPHETAMINE OVERDRIVE (Multi-dash sonic teleport strikes)
     3. CHAOS APOCALYPSE / REALITY BREAKER (Giant glitching energy sphere slam)
   - 2nd Mode: SUPER SAIYAN BLUE + KAIOKEN TRANSFORMATION
     (Standing energy charge -> bright cyan aura -> roaring crimson Kaioken aura)
   ========================================================================== */

// 1. Move definitions
MOVES.slopPunchR = [
  ["chamberR", 80, "Ausholen"],
  ["punchR", 70, "Treffer"],
  ["punchR", 70, "Treffer"],
  ["idleA", 160, "Erholung"]
];

MOVES.slopPunchL = [
  ["chamberL", 80, "Ausholen"],
  ["punchL", 70, "Treffer"],
  ["punchL", 70, "Treffer"],
  ["idleA", 160, "Erholung"]
];

MOVES.slopHaymaker = [
  ["chamberR", 110, "Psycho-Ausholen"],
  ["punchR", 85, "Treffer"],
  ["punchR", 90, "Treffer"],
  ["idleA", 190, "Erholung"]
];

MOVES.slopKickHigh = [
  ["windHighR", 110, "Ausholen"],
  ["kickHighR", 80, "Treffer"],
  ["kickHighR", 85, "Treffer"],
  ["windHighR", 90, "Zurück"],
  ["idleA", 160, "Erholung"]
];

MOVES.slopKickLow = [
  ["sinkR", 75, "Absenken"],
  ["windLowR", 80, "Ausholen"],
  ["kickLowR", 70, "Treffer"],
  ["kickLowR", 75, "Treffer"],
  ["windLowR", 90, "Zurück"],
  ["idleA", 160, "Erholung"]
];

MOVES.slopJumpKick = [
  ["jkCrouch", 100, "Absprung"],
  ["jkRise", 110, "Aufstieg"],
  ["jkStrike", 85, "Treffer"],
  ["jkStrike", 95, "Treffer"],
  ["jkRise", 90, "Fallen"],
  ["jkLand", 100, "Landung"],
  ["idleA", 170, "Erholung"]
];

// Special 1: KI-THRONEN STURM / KI-HACK (Dual Smartphones & Drone Swarm)
MOVES.slopKiHack = [
  ["idleA", 120, "Zwei Handys zücken"],              // 0: violett & blau leuchten
  ["chamberR", 140, "Blinder Tipp-Wahn"],           // 1: rasantes Tippen
  ["chamberL", 150, "Grüne Blitze steigen"],        // 2: KI-Matrix lädt
  ["windHighR", 160, "Code-Vortex formiert"],       // 3: Konzentrische Ringe
  ["punchR", 130, "ZWEI HANDYS. UNENDLICH!"],       // 4: Abschuss vorbereiten
  ["punchR", 120, "KI-Thronen Schwarm 1"],          // 5: Drohnensalve startet
  ["punchR", 120, "KI-Thronen Schwarm 2"],          // 6: Multiprozessor-Feuer
  ["punchR", 120, "Reality Glitch Explosion"],       // 7: Detonationskern
  ["windHighR", 140, "Druckwelle & Nachhall"],      // 8: Schockwelle
  ["idleA", 180, "Handy-Spin & Manisches Grinsen"]  // 9: Triumph
];

// Special 2: PSYCHO SPEED BLITZ (Amphetamine Overdrive)
MOVES.slopSpeedBlitz = [
  ["jkCrouch", 90, "Psycho-Hocke"],                 // 0: Funken an Schuhen
  ["jkRise", 80, "Schallmauer-Sprint"],             // 1: Nachbilder
  ["punchR", 75, "Teleport-Ellbogen"],              // 2: Treffer im Rücken
  ["jkStrike", 75, "Luft-Axtkick"],                 // 3: Abwärtstreffer
  ["jkLand", 90, "Slide-Landung"],                  // 4: Schleifspur
  ["punchR", 70, "Speed-Jab"],                      // 5: Konter-Schlag
  ["kickHighR", 75, "Drehtritt"],                   // 6: Treffer
  ["punchR", 80, "Finisher-Stoß"],                  // 7: Volltreffer
  ["windHighR", 100, "Lachen"],                     // 8: Psycho-Pose
  ["idleA", 160, "Erholung"]                        // 9: Kampfbereit
];

// Special 3: CHAOS APOCALYPSE / REALITY BREAKER (Giant Glitch Energy Sphere)
MOVES.slopChaosApocalypse = [
  ["windHighR", 130, "Arme gen Himmel"],            // 0: Energie sammeln
  ["windHighR", 150, "Glitch-Kugel entsteht"],      // 1: Lila & grüne Blitze
  ["windHighR", 170, "Sphäre expandiert"],          // 2: Doppelte Körpergröße
  ["windHighR", 190, "MAXIMALER CHAOS-KERN!"],      // 3: Reißende Realität
  ["jkRise", 110, "Sprung mit Kugel"],              // 4: Hochspringen
  ["punchR", 110, "SMASH TO GROUND!"],              // 5: Aufschlag auf Boden
  ["punchR", 130, "DETONATION DER REALITÄT!"],      // 6: Gigantische Plasmasäule
  ["punchR", 140, "Cyber-Schockwellen"],            // 7: Welle fegt durch Arena
  ["sinkR", 150, "Beben klingt ab"],                // 8: Funkenregen
  ["idleA", 180, "Erhaben & Wahnsinnig"]            // 9: Triumph
];

// 2nd Mode: SUPER SAIYAN BLUE + KAIOKEN CHARGE & TRANSFORMATION
MOVES.slopKaiokenCharge = [
  ["jkCrouch", 260, "Fokus & Ki-Konzentration"],    // 0: Fäuste ballen
  ["sinkR", 280, "Hellblaue Aura zündet"],          // 1: Erste blaue Funken
  ["windHighR", 300, "Super Saiyan Blue Surge"],    // 2: Aura flammt auf
  ["windHighR", 340, "Blaue Blitze & Levitation"],  // 3: Steine schweben
  ["windHighR", 360, "MAXIMALE BLAUE AURA!"],       // 4: Brüllen
  ["windHighR", 260, "KAIOKEN ZÜNDUNG!"],           // 5: Roter Blitz
  ["windHighR", 340, "ROTE FLAMMEN ERUPTION!"],     // 6: Rote Aura umhüllt Blau
  ["windHighR", 360, "BLUE KAIOKEN x20!"],          // 7: Doppelaura tobt
  ["windHighR", 280, "Schockwellen-Impuls"],        // 8: Arena erzittert
  ["idleA", 240, "ERWACHT & BEREIT!"]               // 9: Dauer-Aura aktiv
];

// 2. Register Attacks in ATTACKS system
ATTACKS.slopPunchR = { keys: ["slopPunchR"], reaction: "hitPunch", damage: 8, range: 230, knock: 26 };
ATTACKS.slopPunchL = { keys: ["slopPunchL"], reaction: "hitPunch", damage: 8, range: 230, knock: 26 };
ATTACKS.slopHaymaker = { keys: ["slopHaymaker"], reaction: "hitPunch", damage: 14, range: 245, knock: 45 };
ATTACKS.slopKickHigh = { keys: ["slopKickHigh"], reaction: "hitKickHigh", damage: 12, range: 285, knock: 40 };
ATTACKS.slopKickLow = { keys: ["slopKickLow"], reaction: "hitKickLow", damage: 10, range: 270, knock: 32 };
ATTACKS.slopJumpKick = { keys: ["slopJumpKick"], reaction: "hitJumpKick", damage: 16, range: 315, knock: 70 };
ATTACKS.slopKiHack = { keys: ["slopKiHack"], reaction: "hitBeam", damage: 24, range: 9999, knock: 95 };
ATTACKS.slopSpeedBlitz = { keys: ["slopSpeedBlitz"], reaction: "hitKickHigh", damage: 22, range: 450, knock: 85 };
ATTACKS.slopChaosApocalypse = { keys: ["slopChaosApocalypse"], reaction: "hitBeam", damage: 28, range: 9999, knock: 110 };
ATTACKS.slopKaiokenCharge = { keys: ["slopKaiokenCharge"], reaction: "hitPunch", damage: 0, range: 0, knock: 0 };

// 3. Register Combos
COMBOS.drslop = [
  { name: "AMPHETAMIN RUSH", keys: ["slopPunchR", "slopPunchL", "slopHaymaker"] },
  { name: "PSYCHO COMBO", keys: ["slopKickLow", "slopKickHigh", "slopJumpKick"] },
  { name: "MANIC OVERDRIVE", keys: ["slopPunchR", "slopKickHigh", "slopSpeedBlitz"] }
];

SPECIAL_COMBOS.drslop = {
  name: "KI-THRONEN STURM",
  keys: ["slopPunchR", "slopKickHigh", "slopKiHack"]
};

// 4. Movement Mapping for Dr. Slop in game-catalog
if (typeof MOVEMENT !== "undefined") {
  MOVEMENT.drslop = {
    sheet: "drslop",
    idle: { frames: [0, 1, 2, 3, 4], rate: 4.2 },
    walk: { frames: [5, 6, 7, 8, 9], rate: 1.2 },
    punch: { wind: 0, hit: [1, 2], alt: 1, recover: 4 },
    kickHigh: { wind: 2, hit: [2, 3], back: 2, recover: 4 },
    kickLow: { wind: 2, hit: [2, 3], recover: 4 },
    jump: { crouch: 3, rise: 3, strike: 3, fall: 3, land: 4 },
    damage: { hit: 5, stagger: 6, air: 7, land: 8, down: 8, ko: 8, getUp: [9, 0] },
    special: { key: "slopKiHack", sheet: "drslop-sp1" }
  };
}

// 5. Active Hitbox calculation for Dr. Slop
const originalActiveHitbox = window.activeHitbox || (typeof activeHitbox === "function" ? activeHitbox : null);
window.activeHitbox = function (f, foe) {
  if (f && f.cfg && f.cfg.key === "drslop" && !f.hitResolved && f.key) {
    const h = f.cfg.displayH;
    const step = f.moveStep | 0;

    // Melee attacks
    if (["slopPunchR", "slopPunchL", "slopHaymaker"].includes(f.key) && (step === 1 || step === 2)) {
      const r = h * 0.085, cx = f.x + f.face * h * 0.38, cy = GROUND - h * 0.58;
      return { x: cx - r, y: cy - r, w: r * 2, h: r * 2, type: "melee" };
    }
    if (["slopKickHigh", "slopKickLow"].includes(f.key) && (step === 1 || step === 2)) {
      const r = h * 0.09, cx = f.x + f.face * h * 0.44, cy = GROUND - h * (f.key === "slopKickHigh" ? 0.60 : 0.28);
      return { x: cx - r, y: cy - r, w: r * 2, h: r * 2, type: "melee" };
    }
    if (f.key === "slopJumpKick" && (step === 2 || step === 3)) {
      const r = h * 0.10, cx = f.x + f.face * h * 0.46, cy = GROUND - h * 0.62;
      return { x: cx - r, y: cy - r, w: r * 2, h: r * 2, type: "melee" };
    }

    // Special 1: KI-Thronen Sturm (Multi-hit cyber projectiles)
    if (f.key === "slopKiHack" && step >= 5 && step <= 8 && foe) {
      const hb = getHurtbox(foe);
      return { x: hb.x - 70, y: hb.y - 85, w: hb.w + 140, h: hb.h + 140, type: "kiHack" };
    }

    // Special 2: Psycho Speed Blitz (Teleport and strikes)
    if (f.key === "slopSpeedBlitz" && (step === 2 || step === 3 || step === 6 || step === 7) && foe) {
      const hb = getHurtbox(foe);
      return { x: hb.x - 40, y: hb.y - 40, w: hb.w + 80, h: hb.h + 80, type: "speedBlitz" };
    }

    // Special 3: Chaos Apocalypse (Giant energy sphere slam)
    if (f.key === "slopChaosApocalypse" && step >= 5 && step <= 8 && foe) {
      const hb = getHurtbox(foe);
      return { x: hb.x - 90, y: hb.y - 110, w: hb.w + 180, h: hb.h + 180, type: "chaosSphere" };
    }
  }

  if (originalActiveHitbox) return originalActiveHitbox(f, foe);
  return null;
};

// 6. Draw Dr. Slop's Saiyan Blue + Kaioken Dual Aura
window.drawDrSlopAura = function (f, time, isForeground) {
  if (!f || f.cfg.key !== "drslop" || f.ko) return;

  const isCharging = f.key === "slopKaiokenCharge";
  const isAwakened = f.isKaioken;
  if (!isCharging && !isAwakened) return;

  const cx = f.x;
  const cy = GROUND - f.cfg.displayH * 0.52;
  const h = f.cfg.displayH;
  const w = h * 0.44;

  let chargeProg = 1.0;
  if (isCharging) {
    chargeProg = clamp(f.moveElapsed / 3000, 0.05, 1.0);
    // When charge completes, trigger permanent awakened mode
    if (f.moveElapsed >= 2600 && !f.isKaioken) {
      f.isKaioken = true;
      spawnPopup(f.x, GROUND - f.cfg.displayH * 1.15, "SSJ BLUE KAIOKEN!", "#00e5ff", true);
      shake = Math.max(shake, 18);
    }
  }

  ctx.save();

  if (!isForeground) {
    // -------------------------------------------------------------
    // BACKGROUND AURA: Inner Radiant Cyan Flame + Outer Crimson Kaioken
    // -------------------------------------------------------------
    const t = (time || performance.now()) * 0.006;

    // OUTER KAIOKEN CRIMSON AURA (activates when fully charged or awakened)
    if (isAwakened || (isCharging && chargeProg > 0.55)) {
      const kaiokenIntensity = isAwakened ? 1.0 : (chargeProg - 0.55) / 0.45;
      const redRadiusX = (w * 1.05 + Math.sin(t * 3.5) * 16) * kaiokenIntensity;
      const redRadiusY = (h * 0.68 + Math.cos(t * 3.1) * 22) * kaiokenIntensity;

      // Outer red radiant glow
      const redGrad = ctx.createRadialGradient(cx, cy, w * 0.2, cx, cy, redRadiusY * 1.2);
      redGrad.addColorStop(0, "rgba(239, 68, 68, 0.75)");
      redGrad.addColorStop(0.45, "rgba(220, 38, 38, 0.55)");
      redGrad.addColorStop(0.85, "rgba(185, 28, 28, 0.25)");
      redGrad.addColorStop(1, "rgba(153, 27, 27, 0)");

      ctx.fillStyle = redGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, redRadiusX * 1.35, redRadiusY * 1.25, 0, 0, Math.PI * 2);
      ctx.fill();

      // Roaring outer red flame spires
      ctx.strokeStyle = "rgba(248, 113, 113, 0.65)";
      ctx.lineWidth = 4 * kaiokenIntensity;
      for (let i = 0; i < 9; i++) {
        const ang = -Math.PI / 2 + (i - 4) * 0.32 + Math.sin(t * 4 + i) * 0.12;
        const flen = (redRadiusY * 1.15 + Math.sin(t * 6 + i * 2) * 28) * kaiokenIntensity;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * (w * 0.5), cy + Math.sin(ang) * (h * 0.35));
        ctx.quadraticCurveTo(
          cx + Math.cos(ang) * (w * 0.9) + Math.sin(t * 5 + i) * 25,
          cy + Math.sin(ang) * (h * 0.7) - 20,
          cx + Math.cos(ang) * flen,
          cy + Math.sin(ang) * flen - 30
        );
        ctx.stroke();
      }
    }

    // INNER CYAN-BLUE SUPER SAIYAN AURA
    const blueIntensity = isAwakened ? 1.0 : Math.min(1.0, chargeProg * 1.4);
    const blueRadiusX = (w * 0.75 + Math.sin(t * 4.2) * 12) * blueIntensity;
    const blueRadiusY = (h * 0.56 + Math.cos(t * 4.0) * 16) * blueIntensity;

    const blueGrad = ctx.createRadialGradient(cx, cy, w * 0.1, cx, cy, blueRadiusY * 1.1);
    blueGrad.addColorStop(0, "rgba(255, 255, 255, 0.92)");
    blueGrad.addColorStop(0.3, "rgba(56, 189, 248, 0.85)");
    blueGrad.addColorStop(0.7, "rgba(2, 132, 199, 0.55)");
    blueGrad.addColorStop(1, "rgba(3, 105, 161, 0)");

    ctx.fillStyle = blueGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, blueRadiusX, blueRadiusY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ground energy ring
    ctx.strokeStyle = isAwakened ? "#ff4040" : "#38bdf8";
    ctx.lineWidth = 3.5;
    ctx.globalAlpha = 0.65;
    ctx.beginPath();
    ctx.ellipse(cx, GROUND - 4, w * 1.25, 14, 0, 0, Math.PI * 2);
    ctx.stroke();

  } else {
    // -------------------------------------------------------------
    // FOREGROUND LAYER: Snapping Bio-Electricity & Golden Sparks
    // -------------------------------------------------------------
    const t = (time || performance.now()) * 0.008;
    const numArcs = isAwakened ? 6 : (isCharging && chargeProg > 0.3 ? 4 : 0);

    ctx.lineWidth = 2.5;
    for (let i = 0; i < numArcs; i++) {
      const isRed = i % 2 === 0 && (isAwakened || chargeProg > 0.6);
      ctx.strokeStyle = isRed ? "#fee2e2" : "#e0f2fe";
      ctx.shadowColor = isRed ? "#ef4444" : "#00e5ff";
      ctx.shadowBlur = 10;

      let ax = cx + (Math.sin(t * 7 + i * 2.1) * w * 0.8);
      let ay = cy + (Math.cos(t * 6 + i * 1.8) * h * 0.45);

      ctx.beginPath();
      ctx.moveTo(ax, ay);
      for (let s = 0; s < 4; s++) {
        ax += (Math.random() - 0.5) * 36;
        ay -= 18 + Math.random() * 22;
        ctx.lineTo(ax, ay);
      }
      ctx.stroke();
    }

    // Floating levitation dust during charging
    if (isCharging) {
      ctx.fillStyle = "#38bdf8";
      for (let p = 0; p < 7; p++) {
        const px = cx + (Math.sin(t * 5 + p) * w * 0.95);
        const py = GROUND - ((t * 80 + p * 35) % (h * 0.9));
        const psize = 2 + (p % 3);
        ctx.fillRect(px, py, psize, psize);
      }
    }
  }

  ctx.restore();
};

// 7. Draw Special Attack FX for Dr. Slop
window.drawDrSlopEffects = function (f, foe, time) {
  if (!f || f.cfg.key !== "drslop") return;

  const h = f.cfg.displayH;
  const targetX = foe ? foe.x : f.x + f.face * 300;
  const targetY = foe ? GROUND - foe.cfg.displayH * 0.5 : GROUND - h * 0.5;

  // -----------------------------------------------------------------
  // SPECIAL 1: KI-THRONEN STURM / KI-HACK (Dual Smartphones & Swarm)
  // -----------------------------------------------------------------
  if (f.key === "slopKiHack") {
    const elapsed = f.moveElapsed;
    const handLX = f.x + f.face * h * 0.18;
    const handLY = GROUND - h * 0.54;
    const handRX = f.x + f.face * h * 0.28;
    const handRY = GROUND - h * 0.52;

    ctx.save();

    // 1. Dual Glowing Smartphones in hands
    if (elapsed < 2100) {
      // Phone 1 (Violet - left/back hand)
      ctx.save();
      ctx.translate(handLX, handLY);
      ctx.rotate(f.face * 0.25);
      ctx.fillStyle = "#1e1b4b";
      ctx.fillRect(-7, -14, 14, 28);
      ctx.fillStyle = "#a855f7";
      ctx.fillRect(-5, -12, 10, 24);
      // Screen glow
      ctx.shadowColor = "#c084fc"; ctx.shadowBlur = 15;
      ctx.strokeStyle = "#e9d5ff"; ctx.lineWidth = 1.5;
      ctx.strokeRect(-5, -12, 10, 24);
      ctx.restore();

      // Phone 2 (Neon Blue - right/front hand)
      ctx.save();
      ctx.translate(handRX, handRY);
      ctx.rotate(-f.face * 0.2);
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(-7, -14, 14, 28);
      ctx.fillStyle = "#00e5ff";
      ctx.fillRect(-5, -12, 10, 24);
      // Screen glow
      ctx.shadowColor = "#38bdf8"; ctx.shadowBlur = 15;
      ctx.strokeStyle = "#bae6fd"; ctx.lineWidth = 1.5;
      ctx.strokeRect(-5, -12, 10, 24);
      ctx.restore();

      // Electric lightning arcing between both phones
      ctx.strokeStyle = "#4ade80";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(handLX, handLY);
      const midX = (handLX + handRX) / 2 + (Math.random() - 0.5) * 16;
      const midY = (handLY + handRY) / 2 + (Math.random() - 0.5) * 16;
      ctx.lineTo(midX, midY);
      ctx.lineTo(handRX, handRY);
      ctx.stroke();
    }

    // 2. Swarm of "KI-Thronen" Drone Missiles firing towards target
    if (elapsed > 550 && elapsed < 2200) {
      const p = (elapsed - 550) / 1650;
      for (let d = 0; d < 6; d++) {
        const droneProg = ((p * 3.5 + d * 0.18) % 1.0);
        const dx = lerp(handRX, targetX, droneProg);
        const arcY = Math.sin(droneProg * Math.PI) * (d % 2 === 0 ? -120 : 60);
        const dy = lerp(handRY, targetY, droneProg) + arcY;

        // Glowing Drone Body
        ctx.save();
        ctx.translate(dx, dy);
        ctx.shadowBlur = 16;
        ctx.shadowColor = d % 2 === 0 ? "#a855f7" : "#22c55e";

        ctx.fillStyle = d % 2 === 0 ? "#c084fc" : "#4ade80";
        ctx.beginPath();
        // Angular drone silhouette
        ctx.moveTo(f.face * 18, 0);
        ctx.lineTo(-f.face * 12, -10);
        ctx.lineTo(-f.face * 6, 0);
        ctx.lineTo(-f.face * 12, 10);
        ctx.closePath();
        ctx.fill();

        // Trail particles
        ctx.strokeStyle = d % 2 === 0 ? "rgba(192, 132, 252, 0.7)" : "rgba(74, 222, 128, 0.7)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-f.face * 12, 0);
        ctx.lineTo(-f.face * 45, (Math.random() - 0.5) * 14);
        ctx.stroke();

        ctx.restore();
      }
    }

    // 3. Cyber Matrix Impact Glitch at target
    if (elapsed > 900 && elapsed < 2100) {
      ctx.save();
      ctx.strokeStyle = "#4ade80";
      ctx.lineWidth = 2;
      for (let g = 0; g < 5; g++) {
        const gx = targetX + (Math.random() - 0.5) * 90;
        const gy = targetY + (Math.random() - 0.5) * 120;
        const gw = 18 + Math.random() * 25;
        ctx.strokeRect(gx, gy, gw, 6);
      }
      ctx.restore();
    }

    ctx.restore();
  }

  // -----------------------------------------------------------------
  // SPECIAL 2: PSYCHO SPEED BLITZ (Afterimages & Teleport Flashes)
  // -----------------------------------------------------------------
  if (f.key === "slopSpeedBlitz") {
    ctx.save();
    // Trailing speed silhouettes
    for (let a = 1; a <= 3; a++) {
      const offsetX = -f.face * a * 48;
      ctx.globalAlpha = 0.35 / a;
      ctx.fillStyle = a % 2 === 0 ? "#00e5ff" : "#ec4899";
      ctx.beginPath();
      ctx.ellipse(f.x + offsetX, GROUND - h * 0.45, h * 0.22, h * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // Sonic rings
    if (f.moveStep === 1 || f.moveStep === 2) {
      ctx.strokeStyle = "rgba(0, 229, 255, 0.8)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(f.x, GROUND - h * 0.45, 30 + f.stepElapsed * 0.4, 60 + f.stepElapsed * 0.8, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // -----------------------------------------------------------------
  // SPECIAL 3: CHAOS APOCALYPSE (Giant Glitch Energy Sphere Slam)
  // -----------------------------------------------------------------
  if (f.key === "slopChaosApocalypse") {
    const elapsed = f.moveElapsed;
    const sphereX = f.x + f.face * 15;
    const sphereY = GROUND - h * 1.15;

    ctx.save();

    // 1. Giant Charging Energy Sphere Overhead
    if (elapsed < 1400) {
      const chargeRatio = Math.min(1.0, elapsed / 1200);
      const r = (35 + 95 * chargeRatio);

      // Radial pulsating core
      const grad = ctx.createRadialGradient(sphereX, sphereY, 10, sphereX, sphereY, r);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.35, "#a855f7");
      grad.addColorStop(0.7, "#22c55e");
      grad.addColorStop(1, "rgba(168, 85, 247, 0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(sphereX, sphereY, r, 0, Math.PI * 2);
      ctx.fill();

      // Wild lightning spokes
      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = 3;
      for (let s = 0; s < 6; s++) {
        const ang = s * (Math.PI / 3) + elapsed * 0.01;
        ctx.beginPath();
        ctx.moveTo(sphereX, sphereY);
        ctx.lineTo(sphereX + Math.cos(ang) * (r * 1.25), sphereY + Math.sin(ang) * (r * 1.25));
        ctx.stroke();
      }
    }

    // 2. Giant Pillar Explosion when slammed down
    if (elapsed >= 1400 && elapsed < 2500) {
      const expProg = (elapsed - 1400) / 1100;
      const impactX = targetX;
      const pillarW = 140 * (1 - expProg * 0.6);

      // Skyward blast pillar
      const pGrad = ctx.createLinearGradient(impactX, GROUND, impactX, 0);
      pGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      pGrad.addColorStop(0.2, "rgba(168, 85, 247, 0.85)");
      pGrad.addColorStop(0.6, "rgba(34, 197, 94, 0.6)");
      pGrad.addColorStop(1, "rgba(239, 68, 68, 0)");

      ctx.fillStyle = pGrad;
      ctx.fillRect(impactX - pillarW / 2, 0, pillarW, GROUND);

      // Concentric ground shockwave ripples
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 5 * (1 - expProg);
      ctx.beginPath();
      ctx.ellipse(impactX, GROUND - 6, 80 + 360 * expProg, 22 + 45 * expProg, 0, 0, Math.PI * 2);
      ctx.stroke();

      shake = Math.max(shake, 14 * (1 - expProg));
    }

    ctx.restore();
  }
};

// 8. Custom Sprite Catalog Selection for Dr. Slop
window.drawDrSlopCatalog = function (f, foe) {
  if (!f || f.cfg.key !== "drslop") return false;

  const m = MOVEMENT.drslop;
  let targetSheet = "drslop";
  let frameIdx = 0;

  // Check current state & move
  if (f.ko) {
    targetSheet = "drslop-attacks";
    frameIdx = 8; // KO flat on back
  } else if (f.key === "slopKaiokenCharge") {
    targetSheet = "drslop-charge";
    frameIdx = Math.max(0, Math.min(9, f.moveStep | 0));
  } else if (f.key === "slopKiHack") {
    targetSheet = "drslop-sp1";
    frameIdx = Math.max(0, Math.min(9, f.moveStep | 0));
  } else if (f.key === "slopSpeedBlitz") {
    targetSheet = "drslop-sp23";
    frameIdx = Math.max(0, Math.min(4, (f.moveStep | 0) % 5));
  } else if (f.key === "slopChaosApocalypse") {
    targetSheet = "drslop-sp23";
    frameIdx = 5 + Math.max(0, Math.min(4, ((f.moveStep | 0) - 4) % 5));
  } else if (f.key && f.key.startsWith("hit")) {
    targetSheet = "drslop-attacks";
    const phase = f.move?.[f.moveStep]?.[2] || "";
    if (phase === "Aufstehen") frameIdx = 9;
    else if (phase === "Am Boden" || phase === "Aufschlag") frameIdx = 8;
    else if (phase === "Wegfliegen") frameIdx = 7;
    else if (phase === "Taumeln") frameIdx = 6;
    else frameIdx = 5;
  } else if (f.key && (f.key.startsWith("slopPunch") || f.key === "slopHaymaker")) {
    if (f.isKaioken) {
      targetSheet = "drslop-kaioken";
      frameIdx = 6 + ((f.moveStep | 0) % 3);
    } else {
      targetSheet = "drslop-attacks";
      frameIdx = f.key === "slopHaymaker" ? 1 : 0;
    }
  } else if (f.key && (f.key.startsWith("slopKick") || f.key === "slopJumpKick")) {
    if (f.isKaioken) {
      targetSheet = "drslop-kaioken";
      frameIdx = 7 + ((f.moveStep | 0) % 3);
    } else {
      targetSheet = "drslop-attacks";
      frameIdx = f.key === "slopJumpKick" ? 3 : 2;
    }
  } else if (f.key && f.key.startsWith("block")) {
    targetSheet = "drslop-attacks";
    frameIdx = 4;
  } else {
    // Idle or Walking
    if (f.isKaioken) {
      targetSheet = "drslop-kaioken";
      frameIdx = Math.floor(f.idleTime * 4.2) % 5;
    } else if (Math.abs(f.vx) > 0.01) {
      targetSheet = "drslop";
      frameIdx = 5 + (Math.floor(f.walkCycle) % 5);
    } else {
      targetSheet = "drslop";
      frameIdx = Math.floor(f.idleTime * 4.2) % 5;
    }
  }

  const entry = SPRITES.get(targetSheet);
  if (!entry || !entry.ok) return false;

  return drawSprite(entry, frameIdx, {
    x: f.x,
    height: f.cfg.displayH,
    face: f.face,
    tint: f.hitFlash > 0 ? f.flashCol : null,
    tintAlpha: Math.min(1, f.hitFlash / 200) * 0.8
  });
};

console.log("Dr. Slop Combat Module initialized successfully.");
