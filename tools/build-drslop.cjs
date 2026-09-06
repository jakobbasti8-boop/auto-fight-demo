const sharp = require("sharp");
const fs = require("fs");

async function buildDrSlop() {
  console.log("=== Building Dr. Slop Assets (5x2 High-Resolution Pipeline) ===");

  const files = {
    portrait: "src/assets/images/drslop_portrait_1788706383120.jpg",
    base: "src/assets/images/drslop_base_sheet_1788706421080.jpg",
    attacks: "src/assets/images/drslop_attacks_sheet_1788706439383.jpg",
    sp1: "src/assets/images/drslop_sp1_phones_1788706457093.jpg",
    sp23: "src/assets/images/drslop_sp23_chaos_1788706476504.jpg",
    charge: "src/assets/images/drslop_charge_transform_1788706497611.jpg",
    kaioken: "src/assets/images/drslop_kaioken_base_1788706516484.jpg"
  };

  // Chroma key function for pure neon green (#00FF00)
  function keyGreenToRgba(data, w, h, options = {}) {
    const rgba = Buffer.alloc(w * h * 4);
    const { excessThreshold = 34, despillFactor = 0.15, preserveAura = false } = options;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const sIdx = (y * w + x) * 3;
        const dIdx = (y * w + x) * 4;
        let r = data[sIdx];
        let g = data[sIdx + 1];
        let b = data[sIdx + 2];

        // Green excess relative to other channels
        const maxOther = Math.max(r, b);
        const excess = g - maxOther;

        let alpha = 1.0;
        if (preserveAura) {
          // For auras (which might have cyan/green highlights):
          // pure background green usually has very high G and low R/B
          if (g > 175 && r < 95 && b < 105) {
            alpha = 0.0;
          } else if (excess > 50 && g > 150) {
            alpha = Math.max(0, 1.0 - (excess - 50) / 35);
          }
        } else {
          if (excess >= excessThreshold && g > 110) {
            alpha = 0.0;
          } else if (excess > 12 && g > 90) {
            alpha = Math.max(0, 1.0 - (excess - 12) / (excessThreshold - 12));
          }
        }

        // Luma suppression for dark border artifacts
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;
        if (luma < 10 && alpha > 0) {
          alpha = 0.0;
        }

        // Despill
        if (g > maxOther && alpha > 0) {
          g = Math.round(maxOther + (g - maxOther) * despillFactor);
        }

        rgba[dIdx] = r;
        rgba[dIdx + 1] = g;
        rgba[dIdx + 2] = b;
        rgba[dIdx + 3] = Math.round(alpha * 255);
      }
    }
    return rgba;
  }

  // 1. Portrait
  console.log("Processing Portrait...");
  await sharp(files.portrait)
    .resize(512, 512, { kernel: "lanczos3" })
    .webp({ quality: 95 })
    .toFile("assets/drslop-portrait.webp");
  console.log("Saved assets/drslop-portrait.webp");

  // Helper to process a 5x2 sheet to standardized 2560x1024 WebP
  async function process5x2Sheet(srcPath, outWebpPath, opts = {}) {
    console.log(`Processing 5x2: ${outWebpPath}...`);
    const raw = await sharp(srcPath).raw().toBuffer({ resolveWithObject: true });
    const w = raw.info.width, h = raw.info.height;
    const rgba = keyGreenToRgba(raw.data, w, h, opts);

    const COLS = 5, ROWS = 2;
    const cw = w / COLS, ch = h / ROWS;

    // Standard out dimensions: 5 columns * 512 = 2560 px wide; 2 rows * 512 = 1024 px high
    const OUT_W = 2560, OUT_H = 1024;
    const CELL_W = 512, CELL_H = 512;
    const outCanvas = Buffer.alloc(OUT_W * OUT_H * 4);
    const frames = [];

    // Analyze cells
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x0 = Math.round(c * cw), x1 = Math.round((c + 1) * cw);
        const y0 = Math.round(r * ch), y1 = Math.round((r + 1) * ch);
        const curW = x1 - x0, curH = y1 - y0;

        let minX = curW, maxX = 0, minY = curH, maxY = 0, count = 0;
        let footSumX = 0, footCount = 0;

        for (let y = 0; y < curH; y++) {
          for (let x = 0; x < curW; x++) {
            const idx = ((y0 + y) * w + (x0 + x)) * 4;
            const a = rgba[idx + 3];
            if (a > 50) {
              count++;
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        if (count > 50) {
          const footYThresh = maxY - Math.round((maxY - minY) * 0.15);
          for (let y = footYThresh; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
              const idx = ((y0 + y) * w + (x0 + x)) * 4;
              if (rgba[idx + 3] > 50) {
                footSumX += x;
                footCount++;
              }
            }
          }
        }

        const footCenterX = footCount > 0 ? (footSumX / footCount) : (minX + maxX) / 2;

        // Extract cell to buffer
        const cellBuf = Buffer.alloc(curW * curH * 4);
        for (let y = 0; y < curH; y++) {
          for (let x = 0; x < curW; x++) {
            const sIdx = ((y0 + y) * w + (x0 + x)) * 4;
            const dIdx = (y * curW + x) * 4;
            cellBuf[dIdx] = rgba[sIdx];
            cellBuf[dIdx + 1] = rgba[sIdx + 1];
            cellBuf[dIdx + 2] = rgba[sIdx + 2];
            cellBuf[dIdx + 3] = rgba[sIdx + 3];
          }
        }

        // Scale nicely to fit in 512x512 cell
        // We scale so character height occupies ~74% of 512 = ~380px if standing
        const figH = Math.max(80, maxY - minY);
        let scale = Math.min(1.5, 380 / figH);
        if (opts.fixedScale) scale = opts.fixedScale;

        const scaledW = Math.round(curW * scale);
        const scaledH = Math.round(curH * scale);

        const scaledCell = await sharp(cellBuf, { raw: { width: curW, height: curH, channels: 4 } })
          .resize(scaledW, scaledH, { kernel: "lanczos3" })
          .raw()
          .toBuffer();

        // Position inside 512x512 cell
        const TARGET_GROUND_Y = 492;
        const TARGET_CENTER_X = 256;

        const placeX = TARGET_CENTER_X - Math.round(footCenterX * scale);
        let placeY = TARGET_GROUND_Y - Math.round(maxY * scale);

        // Bounds clamp for effects or special poses
        if (placeY < 0) placeY = 0;
        if (placeY + scaledH > CELL_H) placeY = Math.max(0, CELL_H - scaledH);

        const cellStartX = c * CELL_W;
        const cellStartY = r * CELL_H;

        let bMinX = CELL_W, bMaxX = 0, bMinY = CELL_H, bMaxY = 0;

        for (let sy = 0; sy < scaledH; sy++) {
          const destY = cellStartY + placeY + sy;
          if (destY < cellStartY || destY >= cellStartY + CELL_H) continue;

          for (let sx = 0; sx < scaledW; sx++) {
            const destX = cellStartX + placeX + sx;
            if (destX < cellStartX || destX >= cellStartX + CELL_W) continue;

            const sIdx = (sy * scaledW + sx) * 4;
            const alpha = scaledCell[sIdx + 3];
            if (alpha > 40) {
              const dIdx = (destY * OUT_W + destX) * 4;
              outCanvas[dIdx] = scaledCell[sIdx];
              outCanvas[dIdx + 1] = scaledCell[sIdx + 1];
              outCanvas[dIdx + 2] = scaledCell[sIdx + 2];
              outCanvas[dIdx + 3] = alpha;

              const relX = destX - cellStartX;
              const relY = destY - cellStartY;
              if (relX < bMinX) bMinX = relX;
              if (relX > bMaxX) bMaxX = relX;
              if (relY < bMinY) bMinY = relY;
              if (relY > bMaxY) bMaxY = relY;
            }
          }
        }

        if (bMinX > bMaxX) {
          bMinX = 120; bMaxX = 392; bMinY = 100; bMaxY = 492;
        }

        frames.push({
          row: r,
          col: c,
          bbox: [bMinX, bMinY, bMaxX, bMaxY]
        });
      }
    }

    await sharp(outCanvas, { raw: { width: OUT_W, height: OUT_H, channels: 4 } })
      .webp({ quality: 94 })
      .toFile(outWebpPath);
    console.log(`Saved ${outWebpPath}`);

    return frames;
  }

  // Process all sheets
  const baseFrames = await process5x2Sheet(files.base, "assets/drslop-base.webp");
  const attackFrames = await process5x2Sheet(files.attacks, "assets/drslop-attacks.webp");
  const sp1Frames = await process5x2Sheet(files.sp1, "assets/drslop-sp1.webp", { fixedScale: 1.15 });
  const sp23Frames = await process5x2Sheet(files.sp23, "assets/drslop-sp23.webp", { fixedScale: 1.15 });
  const chargeFrames = await process5x2Sheet(files.charge, "assets/drslop-charge.webp", { preserveAura: true, fixedScale: 1.15 });
  const kaiokenFrames = await process5x2Sheet(files.kaioken, "assets/drslop-kaioken.webp", { preserveAura: true, fixedScale: 1.15 });

  const metadata = {
    base: baseFrames,
    attacks: attackFrames,
    sp1: sp1Frames,
    sp23: sp23Frames,
    charge: chargeFrames,
    kaioken: kaiokenFrames
  };

  fs.writeFileSync("tools/drslop-frames.json", JSON.stringify(metadata, null, 2));
  console.log("=== Dr. Slop Build Complete ===");
}

buildDrSlop().catch(err => {
  console.error(err);
  process.exit(1);
});
