"use strict";

/* Dr. BOB - Kamehameha (Dragon Ball Z Style)
 * 
 * 25-stufiger Ablauf, exakt synchronisiert mit dem 25-Bilder-Animationskatalog.
 * Volle DBZ-Ladung:
 * - KA-ME-HA-ME... Sammel- & Ladephase mit wachsender Ki-Kugel in den Händen,
 *   elektrischen Blitzen, Aura-Flackern, konzentrischen Druckwellen & Bildschirmbeben.
 * - ...HAAAA! Zündung mit Lichtblitz, Vorwärtsschub, Speerspitzen-Strahl,
 *   nahtloser 5-teiliger Plasmastrahl mit fließender Textur, doppelter Ki-Spirale
 *   und massiver Dauerdetonation am Hurtbox-Zentrum des Gegners.
 * - Nachhall & Erholung mit aufsteigendem Hitzedampf und Rückstoß-Atmung.
 */
(function () {

  // Genau 25 Bewegungsschritte – ein Schritt pro Katalogbild
  MOVES.kame = [
    ["idleA",     110, "Fokus"],                 // 01: Kampfhaltung senken
    ["kmSink",    120, "Hände sammeln"],        // 02: Hände an die Hüfte
    ["kmChargeA", 130, "KA..."],                // 03: Erster Ki-Funke
    ["kmChargeA", 140, "KA..."],                // 04: Ki-Kugel bildet sich
    ["kmChargeB", 140, "...ME..."],             // 05: Energie dehnt sich aus
    ["kmChargeB", 150, "...ME..."],             // 06: Aura flackert auf
    ["kmChargeB", 150, "...HA..."],             // 07: Konzentrische Druckwellen
    ["kmChargeB", 160, "...HA..."],             // 08: Elektrische Blitze zucken
    ["kmChargeB", 170, "...ME..."],             // 09: Kern wird gleißend weiß
    ["kmChargeB", 190, "MAXIMALLADUNG!"],       // 10: Maximale Kompression & Erschütterung
    ["kmFire",    110, "Abschuss vorbereiten"], // 11: Arme schnellen nach vorn
    ["kmFire",     95, "...HAAAA!"],            // 12: Strahl bricht hervor!
    ["kmFire",     90, "KAMEHAMEHA!"],          // 13: Voller Plasmastrom
    ["kmFire",     90, "KAMEHAMEHA!"],          // 14: Turbulenter Energiestrom
    ["kmFire",     90, "KAMEHAMEHA!"],          // 15: Maximale Strahlkraft
    ["kmFire",     90, "KAMEHAMEHA!"],          // 16: Schockwellen am Ziel
    ["kmFire",     95, "KAMEHAMEHA!"],          // 17: Dauerfeuer
    ["kmFire",    105, "KAMEHAMEHA!"],          // 18: Letzter Entladungsstoß
    ["kmFire",    115, "Nachhall"],             // 19: Strahl trennt sich von Händen
    ["kmFire",    125, "Verwehen"],             // 20: Plasma löst sich auf
    ["kmSink",    140, "Rückstoß"],             // 21: Bob sackt zurück, Hitzedampf
    ["kmSink",    160, "Erschöpft"],            // 22: Schweres Atmen, Abkühlen
    ["idleB",     130, "Aufrichten"],            // 23: Körper streckt sich
    ["idleA",     120, "Deckung"],               // 24: Abwehrhaltung
    ["idleA",     150, "Bereit"]                 // 25: Kampfbereit
  ];

  // HD-Effektmodule aus tools/source/bob_beam.png
  const beamAssets = {
    start:  { src: "assets/bob-beam-start.webp",  img: new Image(), ok: false },
    mid1:   { src: "assets/bob-beam-mid.webp",    img: new Image(), ok: false },
    mid2:   { src: "assets/bob-beam-mid2.webp",   img: new Image(), ok: false },
    tip:    { src: "assets/bob-beam-tip.webp",    img: new Image(), ok: false },
    impact: { src: "assets/bob-beam-impact.webp", img: new Image(), ok: false }
  };

  Object.values(beamAssets).forEach(part => {
    part.img.onload = () => { part.ok = true; };
    part.img.src = part.src;
  });

  function allAssetsReady() {
    return Object.values(beamAssets).every(p => p.ok);
  }

  // Hilfsfunktion: Alter 5er-Atlas als Notfall-Rückfall
  function beamFallbackEntry() {
    const e = SPRITES.get("kame-beam");
    return e && e.ok ? e : null;
  }

  /* ------------------------------------------------------------------ */
  /* DBZ Charging Phase (Schritte 1 bis 9)                               */
  /* ------------------------------------------------------------------ */
  function drawDbzKameCharge(f, time) {
    const step = f.moveStep | 0;
    if (step < 1 || step > 9) return;

    const h = f.cfg.displayH;
    // Hände befinden sich an der hinteren Hüfte (Frame 2 bis 9)
    const handX = f.x - f.face * h * 0.08;
    const handY = GROUND - h * 0.44;

    // Fortschritt des Ladevorgangs von 0.05 bis 1.0
    const chargeProgress = clamp((step - 1) / 8 + (f.stepElapsed / 200) * 0.1, 0.05, 1.0);

    ctx.save();

    // 1. Raum-/Bühnenabdunklung & Ki-Beleuchtung
    if (chargeProgress > 0.3) {
      const darkAlpha = clamp((chargeProgress - 0.3) * 0.35, 0, 0.28);
      ctx.fillStyle = "rgba(4, 10, 30, " + darkAlpha + ")";
      ctx.fillRect(0, 0, W, H);
    }

    // 2. Ki-Aura um Bobs Körper
    if (chargeProgress > 0.2) {
      const auraPulse = 0.85 + 0.15 * Math.sin(time * 18);
      const auraRad = h * (0.35 + 0.18 * chargeProgress) * auraPulse;
      const auraGrad = ctx.createRadialGradient(f.x, GROUND - h * 0.5, h * 0.1, f.x, GROUND - h * 0.5, auraRad);
      auraGrad.addColorStop(0, "rgba(90, 200, 255, " + (0.28 * chargeProgress) + ")");
      auraGrad.addColorStop(0.5, "rgba(30, 120, 255, " + (0.16 * chargeProgress) + ")");
      auraGrad.addColorStop(1, "rgba(10, 60, 200, 0)");
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(f.x, GROUND - h * 0.5, auraRad, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Konzentrische, implodierende Energiewellen (Ki wird in Kugel gesaugt)
    if (chargeProgress > 0.15) {
      ctx.lineWidth = 2 + chargeProgress * 2;
      for (let i = 0; i < 4; i++) {
        const wavePhase = (time * 3.5 + i * 0.25) % 1.0;
        const waveRad = (1.0 - wavePhase) * (h * 0.38) * chargeProgress + h * 0.04;
        const waveAlpha = Math.sin(wavePhase * Math.PI) * 0.55 * chargeProgress;
        ctx.strokeStyle = "rgba(120, 220, 255, " + waveAlpha + ")";
        ctx.beginPath();
        ctx.arc(handX, handY, Math.max(2, waveRad), 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // 4. Elektrische Ki-Blitze (Zucken von Boden & Körper in die Hände)
    if (chargeProgress > 0.25) {
      const sparkCount = Math.floor(2 + chargeProgress * 6);
      ctx.lineWidth = 1.5 + chargeProgress * 1.5;
      ctx.strokeStyle = "rgba(220, 245, 255, " + (0.6 + chargeProgress * 0.4) + ")";
      ctx.shadowColor = "#00c8ff";
      ctx.shadowBlur = 8;
      for (let s = 0; s < sparkCount; s++) {
        const seed = Math.sin(f.moveElapsed * 0.05 + s * 45);
        if (Math.abs(seed) > 0.35) {
          const angle = s * (Math.PI * 2 / sparkCount) + time * 6;
          const dist = (h * 0.12 + h * 0.22 * Math.abs(seed)) * chargeProgress;
          let px = handX + Math.cos(angle) * dist;
          let py = handY + Math.sin(angle) * dist;
          ctx.beginPath();
          ctx.moveTo(px, py);
          const segs = 3;
          for (let k = 1; k <= segs; k++) {
            const t = k / segs;
            const jx = (Math.random() - 0.5) * 16 * chargeProgress;
            const jy = (Math.random() - 0.5) * 16 * chargeProgress;
            ctx.lineTo(lerp(px, handX, t) + jx, lerp(py, handY, t) + jy);
          }
          ctx.stroke();
        }
      }
      ctx.shadowBlur = 0;
    }

    // 5. Die leuchtende Ki-Kugel in den Händen
    const sphereRadius = h * (0.03 + 0.15 * Math.pow(chargeProgress, 1.2));
    const pulseScale = 1.0 + 0.08 * Math.sin(time * 28);
    const rad = sphereRadius * pulseScale;

    // Äußere Korona
    const outerGrad = ctx.createRadialGradient(handX, handY, rad * 0.2, handX, handY, rad * 2.6);
    outerGrad.addColorStop(0, "rgba(80, 210, 255, 0.95)");
    outerGrad.addColorStop(0.4, "rgba(20, 130, 255, 0.65)");
    outerGrad.addColorStop(0.8, "rgba(0, 70, 240, 0.25)");
    outerGrad.addColorStop(1, "rgba(0, 40, 200, 0)");
    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    ctx.arc(handX, handY, rad * 2.6, 0, Math.PI * 2);
    ctx.fill();

    // Gleißend weiß-blauer Kern
    const coreGrad = ctx.createRadialGradient(handX, handY, 0, handX, handY, rad);
    coreGrad.addColorStop(0, "#ffffff");
    coreGrad.addColorStop(0.55, "#d0f4ff");
    coreGrad.addColorStop(0.85, "#38b6ff");
    coreGrad.addColorStop(1, "rgba(0, 140, 255, 0.8)");
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(handX, handY, rad, 0, Math.PI * 2);
    ctx.fill();

    // Bildschirm-Mikrobeben bei starker Ladung
    if (chargeProgress > 0.65) {
      shake = Math.max(shake, (chargeProgress - 0.65) * 6);
    }

    ctx.restore();
  }

  /* ------------------------------------------------------------------ */
  /* DBZ Beam & Discharge Phase (Schritte 10 bis 20)                     */
  /* ------------------------------------------------------------------ */
  function drawBobKameBeam(f, foe, time) {
    const step = f.moveStep | 0;
    if (step < 10 || step > 20 || !foe) return;

    const h = f.cfg.displayH;
    const hb = getHurtbox(foe);

    // Exakte Position der Handflächen beim Abschuss (gemessen aus Frame 12..18)
    const originX = f.x + f.face * h * 0.28;
    const originY = GROUND - h * 0.49;

    // Zentrum des Ziels
    const targetX = hb.x + hb.w * 0.5;
    const targetY = hb.y + hb.h * 0.5;

    const fullDist = Math.max(60, Math.abs(targetX - originX));
    const dur = (f.move && f.move[f.moveStep] && f.move[f.moveStep][1]) || 1;
    const local = clamp(f.stepElapsed / dur, 0, 1);

    // Strahlwachstum beim Abschuss
    let grow = 1.0;
    if (step === 10) {
      grow = 0.15 + 0.35 * local; // Formiert sich kurz vor den Händen
    } else if (step === 11) {
      grow = 0.45 + 0.55 * local; // Schnellt mit Überschall zum Ziel
    }
    const currentLen = fullDist * grow;

    // Bei Zündung (Schritt 11) massiver Bildschirm-Blitz & Stoßwelle
    if (step === 11 && local < 0.4) {
      shake = Math.max(shake, 12);
      ctx.save();
      ctx.fillStyle = "rgba(220, 245, 255, " + (0.45 * (1 - local / 0.4)) + ")";
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    } else if (step >= 11 && step <= 18) {
      // Anhaltendes Beben während der vollen Entladung
      shake = Math.max(shake, 4.5);
    }

    // Strahlhöhe mit lebendigem Plasma-Pulsieren
    const pulse = 1.0 + 0.06 * Math.sin(time * 35);
    const beamH = h * 0.48 * pulse;
    const drawY = -beamH * 0.5;

    ctx.save();
    ctx.translate(originX, originY);
    if (f.face < 0) ctx.scale(-1, 1);

    const useHD = allAssetsReady();
    const fb = beamFallbackEntry();

    // Modulbreite (Originalverhältnis beibehalten)
    const muzzleW = beamH * (289 / 512);
    const midW    = beamH * (276 / 512);
    const tipW    = beamH * (283 / 512);
    const overlap = midW * 0.16;

    // Transparenz beim Verblassen (Schritt 19..20)
    let beamAlpha = 1.0;
    if (step === 19) beamAlpha = 0.85 - 0.4 * local;
    if (step === 20) beamAlpha = Math.max(0, 0.45 - 0.45 * local);

    ctx.globalAlpha = beamAlpha;

    // 1. Mündungsmodul (Start-Bloom um Bobs Hände)
    if (useHD) {
      ctx.drawImage(beamAssets.start.img, -muzzleW * 0.35, drawY, muzzleW, beamH);
    } else if (fb) {
      const r0 = spriteRect(fb, 0);
      ctx.drawImage(fb.img, r0.sx, r0.sy, r0.sw, r0.sh, -muzzleW * 0.35, drawY, muzzleW, beamH);
    }

    // 2. Strahl-Körper (Mittelstücke nahtlos kacheln bis zur aktuellen Länge)
    let curX = muzzleW * 0.55;
    let loopIdx = 0;
    const maxBodyX = currentLen - tipW * 0.65;

    while (curX < maxBodyX) {
      const pieceW = Math.min(midW, maxBodyX - curX + overlap);
      if (useHD) {
        const midImg = (loopIdx % 2 === 0) ? beamAssets.mid1.img : beamAssets.mid2.img;
        ctx.drawImage(midImg, curX, drawY, midW, beamH);
      } else if (fb) {
        const rMid = spriteRect(fb, 1 + (loopIdx % 2));
        ctx.drawImage(fb.img, rMid.sx, rMid.sy, rMid.sw, rMid.sh, curX, drawY, midW, beamH);
      }
      curX += midW - overlap;
      loopIdx++;
    }

    // 3. Strahl-Spitze (Speerspitze am Kopf des Strahls)
    if (grow < 0.98 || step <= 11) {
      const tipX = Math.max(muzzleW * 0.6, currentLen - tipW * 0.85);
      if (useHD) {
        ctx.drawImage(beamAssets.tip.img, tipX, drawY, tipW, beamH);
      } else if (fb) {
        const rTip = spriteRect(fb, 3);
        ctx.drawImage(fb.img, rTip.sx, rTip.sy, rTip.sw, rTip.sh, tipX, drawY, tipW, beamH);
      }
    }

    // 4. DBZ Glow-Effekt: Gleißender weißer Laser-Kern & Ki-Spiralen (Additives Blending)
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    // Zentraler weißer Kernstrahl
    const coreH = beamH * 0.28;
    const coreGrad = ctx.createLinearGradient(0, -coreH * 0.5, 0, coreH * 0.5);
    coreGrad.addColorStop(0, "rgba(180, 240, 255, 0.1)");
    coreGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.95)");
    coreGrad.addColorStop(1, "rgba(180, 240, 255, 0.1)");
    ctx.fillStyle = coreGrad;
    ctx.fillRect(0, -coreH * 0.5, currentLen, coreH);

    // Doppelte Ki-Helix-Schleifen um den Strahl
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = "rgba(160, 235, 255, " + (0.55 * beamAlpha) + ")";
    ctx.beginPath();
    const spiralSteps = Math.floor(currentLen / 12);
    for (let s = 0; s <= spiralSteps; s++) {
      const px = s * 12;
      const wave = Math.sin(px * 0.035 - time * 22) * (beamH * 0.42);
      if (s === 0) ctx.moveTo(px, wave);
      else ctx.lineTo(px, wave);
    }
    ctx.stroke();

    ctx.strokeStyle = "rgba(90, 200, 255, " + (0.45 * beamAlpha) + ")";
    ctx.beginPath();
    for (let s = 0; s <= spiralSteps; s++) {
      const px = s * 12;
      const wave = Math.sin(px * 0.035 - time * 22 + Math.PI) * (beamH * 0.42);
      if (s === 0) ctx.moveTo(px, wave);
      else ctx.lineTo(px, wave);
    }
    ctx.stroke();

    ctx.restore(); // Ende Additives Blending
    ctx.restore(); // Ende Strahl-Koordinatensystem

    // 5. DBZ Einschlag-Explosion am Gegner (Schritte 11 bis 19)
    if (grow >= 0.85 && step >= 11 && step <= 19) {
      const expPulse = 1.0 + 0.10 * Math.sin(time * 30);
      const expSize = h * 1.05 * expPulse;
      const expAlpha = step >= 18 ? (step === 18 ? 0.75 : 0.4) : 1.0;

      ctx.save();
      ctx.globalAlpha = expAlpha;
      ctx.translate(targetX, targetY);

      // Leichte dynamische Drehung der Detonation
      ctx.rotate(time * 4);

      if (useHD) {
        ctx.drawImage(beamAssets.impact.img, -expSize * 0.5, -expSize * 0.5, expSize, expSize);
      } else if (fb) {
        const rImp = spriteRect(fb, 4);
        ctx.drawImage(fb.img, rImp.sx, rImp.sy, rImp.sw, rImp.sh, -expSize * 0.5, -expSize * 0.5, expSize, expSize);
      }

      // Additive Detonations-Schockwellen & Funken
      ctx.globalCompositeOperation = "lighter";

      // Expansive Schockwellenringe
      for (let w = 0; w < 3; w++) {
        const ringProg = (time * 4 + w * 0.33) % 1.0;
        const ringR = ringProg * expSize * 0.75;
        const ringAlpha = (1.0 - ringProg) * 0.6;
        ctx.lineWidth = 4 * (1 - ringProg);
        ctx.strokeStyle = "rgba(180, 240, 255, " + ringAlpha + ")";
        ctx.beginPath();
        ctx.arc(0, 0, ringR, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Radiale elektrische Blitze an der Einschlagstelle
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "rgba(220, 250, 255, 0.85)";
      for (let sp = 0; sp < 6; sp++) {
        const spAngle = sp * (Math.PI / 3) + time * 12;
        const spLen = expSize * (0.35 + 0.2 * Math.sin(time * 20 + sp));
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(spAngle) * spLen * 0.5 + (Math.random() - 0.5) * 12,
                   Math.sin(spAngle) * spLen * 0.5 + (Math.random() - 0.5) * 12);
        ctx.lineTo(Math.cos(spAngle) * spLen, Math.sin(spAngle) * spLen);
        ctx.stroke();
      }

      ctx.restore();

      // Beleuchtung des Gegners in gleißendem Ki-Licht
      ctx.save();
      const lightGrad = ctx.createRadialGradient(targetX, targetY, 20, targetX, targetY, expSize * 0.8);
      lightGrad.addColorStop(0, "rgba(180, 240, 255, 0.45)");
      lightGrad.addColorStop(1, "rgba(20, 100, 255, 0)");
      ctx.fillStyle = lightGrad;
      ctx.beginPath();
      ctx.arc(targetX, targetY, expSize * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /* ------------------------------------------------------------------ */
  /* DBZ Recovery & Steam Phase (Schritte 20 bis 23)                     */
  /* ------------------------------------------------------------------ */
  function drawDbzRecoverySteam(f, time) {
    const step = f.moveStep | 0;
    if (step < 20 || step > 23) return;

    const h = f.cfg.displayH;
    const handX = f.x + f.face * h * 0.18;
    const handY = GROUND - h * 0.48;

    ctx.save();
    ctx.fillStyle = "rgba(230, 245, 255, 0.35)";
    // Aufsteigende Hitzedampf-Wölkchen
    for (let i = 0; i < 5; i++) {
      const p = (time * 1.8 + i * 0.22) % 1.0;
      const sx = handX + Math.sin(time * 3 + i) * (14 * p) + (i - 2) * 8;
      const sy = handY - p * (h * 0.35);
      const sRad = (6 + p * 20);
      const alpha = Math.sin(p * Math.PI) * 0.4;
      ctx.fillStyle = "rgba(230, 245, 255, " + alpha + ")";
      ctx.beginPath();
      ctx.arc(sx, sy, sRad, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /* ------------------------------------------------------------------ */
  /* Engine Hooks: effects & activeHitbox                               */
  /* ------------------------------------------------------------------ */
  const baseBobEffects = effects;
  effects = function (f, foe, time) {
    if (f && f.cfg && f.cfg.key === "bob" && f.key === "kame") {
      const step = f.moveStep | 0;
      if (step >= 1 && step <= 9) {
        drawDbzKameCharge(f, time);
      } else if (step >= 10 && step <= 20) {
        drawBobKameBeam(f, foe, time);
      } else if (step >= 21 && step <= 23) {
        drawDbzRecoverySteam(f, time);
      }
      return;
    }
    return baseBobEffects(f, foe, time);
  };
})();
