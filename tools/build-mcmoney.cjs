const sharp = require("sharp");
const fs = require("fs");

async function buildMcMoney() {
  console.log("=== Building Mc. Money Assets ===");

  const baseSrc = "src/assets/images/mcmoney_base_v2_1788705312071.jpg";
  const specSrc = "src/assets/images/mcmoney_special_v2_1788705340727.jpg";
  const portSrc = "src/assets/images/mcmoney_portrait_v2_1788705264926.jpg";

  // 1. Process Base Character Sheet
  console.log("Processing base character sheet...");
  const baseRaw = await sharp(baseSrc).raw().toBuffer({ resolveWithObject: true });
  const bW = baseRaw.info.width, bH = baseRaw.info.height;
  const bData = baseRaw.data;

  // Function to key green screen to RGBA buffer
  function keyGreenToRgba(data, w, h) {
    const rgba = Buffer.alloc(w * h * 4);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const sIdx = (y * w + x) * 3;
        const dIdx = (y * w + x) * 4;
        let r = data[sIdx];
        let g = data[sIdx + 1];
        let b = data[sIdx + 2];

        // Green excess
        const maxOther = Math.max(r, b);
        const excess = g - maxOther;

        let alpha = 1.0;
        if (excess >= 36) {
          alpha = 0.0;
        } else if (excess > 10) {
          alpha = 1.0 - (excess - 10) / 26;
        }

        // Also check if pixel is near grid borders or very dark grid
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;
        if (luma < 12 && alpha > 0) {
          alpha = 0.0;
        }

        // Despill
        if (g > maxOther) {
          g = Math.round(maxOther + (g - maxOther) * 0.15);
        }

        rgba[dIdx] = r;
        rgba[dIdx + 1] = g;
        rgba[dIdx + 2] = b;
        rgba[dIdx + 3] = Math.round(alpha * 255);
      }
    }
    return rgba;
  }

  const baseRgba = keyGreenToRgba(bData, bW, bH);

  // Extract cells and compute bboxes
  const CELL_TARGET = 512;
  const COLS = 5, ROWS = 5;
  const cw = bW / COLS, ch = bH / ROWS;

  // Target canvas: 2560 x 2560
  const outCanvas = Buffer.alloc(2560 * 2560 * 4); // all zero (transparent)
  const framesMeta = [];

  // Determine standard reference height for standing figure (Row 0 average)
  let refFootY = 0, refHeight = 0, refCount = 0;
  const cellInfos = [];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x0 = Math.round(c * cw), x1 = Math.round((c + 1) * cw);
      const y0 = Math.round(r * ch), y1 = Math.round((r + 1) * ch);
      const cellW = x1 - x0, cellH = y1 - y0;

      // Find bounding box of solid pixels
      let minX = cellW, maxX = 0, minY = cellH, maxY = 0, count = 0;
      let footSumX = 0, footCount = 0;

      for (let y = 0; y < cellH; y++) {
        for (let x = 0; x < cellW; x++) {
          const idx = ((y0 + y) * bW + (x0 + x)) * 4;
          const a = baseRgba[idx + 3];
          if (a > 60) {
            count++;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (count > 50) {
        // Foot center calculation (lowest 10% of pixels)
        const footThresholdY = maxY - Math.round((maxY - minY) * 0.12);
        for (let y = footThresholdY; y <= maxY; y++) {
          for (let x = minX; x <= maxX; x++) {
            const idx = ((y0 + y) * bW + (x0 + x)) * 4;
            if (baseRgba[idx + 3] > 60) {
              footSumX += x;
              footCount++;
            }
          }
        }
      }

      const footCenterX = footCount > 0 ? (footSumX / footCount) : (minX + maxX) / 2;
      const info = { r, c, minX, maxX, minY, maxY, count, footCenterX, cellW, cellH, x0, y0 };
      cellInfos.push(info);

      if (r === 0 && count > 100) {
        refFootY += maxY;
        refHeight += (maxY - minY);
        refCount++;
      }
    }
  }

  refFootY /= refCount;
  refHeight /= refCount;
  console.log(`Standing reference height: ${refHeight.toFixed(1)}px, footY: ${refFootY.toFixed(1)}px`);

  // Desired placement in 512x512 cell:
  // Figure height ~ 378px (FIGURE_SHARE = 0.74 of 512)
  // Baseline ~ 0.035 from bottom => Ground Y = 512 * (1 - 0.035) = 494
  const TARGET_SCALE = (CELL_TARGET * 0.74) / refHeight;
  const TARGET_GROUND_Y = Math.round(CELL_TARGET * (1 - 0.035));
  const TARGET_CENTER_X = 256;

  console.log(`Target scale: ${TARGET_SCALE.toFixed(3)}, Target ground Y: ${TARGET_GROUND_Y}`);

  // Now render each cell onto the 2560x2560 sheet
  for (const info of cellInfos) {
    const { r, c, minX, maxX, minY, maxY, count, footCenterX, cellW, cellH, x0, y0 } = info;
    const isAirborne = (r === 3 && c === 3) || (r === 4 && c === 2);
    const isDown = (r === 4 && c === 3);

    // Extract cell pixels to a sharp image
    const cellBuf = Buffer.alloc(cellW * cellH * 4);
    for (let y = 0; y < cellH; y++) {
      for (let x = 0; x < cellW; x++) {
        const sIdx = ((y0 + y) * bW + (x0 + x)) * 4;
        const dIdx = (y * cellW + x) * 4;
        cellBuf[dIdx] = baseRgba[sIdx];
        cellBuf[dIdx + 1] = baseRgba[sIdx + 1];
        cellBuf[dIdx + 2] = baseRgba[sIdx + 2];
        cellBuf[dIdx + 3] = baseRgba[sIdx + 3];
      }
    }

    // Scale cell
    const scaledW = Math.round(cellW * TARGET_SCALE);
    const scaledH = Math.round(cellH * TARGET_SCALE);

    const scaledCell = await sharp(cellBuf, { raw: { width: cellW, height: cellH, channels: 4 } })
      .resize(scaledW, scaledH, { kernel: "lanczos3" })
      .raw()
      .toBuffer();

    // Determine offset in 512x512 cell
    // Foot x maps to TARGET_CENTER_X
    // Foot y maps to TARGET_GROUND_Y
    let placeX = TARGET_CENTER_X - Math.round(footCenterX * TARGET_SCALE);
    let placeY;

    if (isDown) {
      // Down on floor: place bottom near ground
      placeY = TARGET_GROUND_Y - Math.round(maxY * TARGET_SCALE);
    } else if (isAirborne) {
      // Airborne jump kick / hurt flying
      placeY = TARGET_GROUND_Y - Math.round(refFootY * TARGET_SCALE) - 30;
    } else {
      // Anchored to ground
      placeY = TARGET_GROUND_Y - Math.round(maxY * TARGET_SCALE);
    }

    // Blit onto outCanvas at cell (r, c)
    const cellStartX = c * CELL_TARGET;
    const cellStartY = r * CELL_TARGET;

    let bMinX = CELL_TARGET, bMaxX = 0, bMinY = CELL_TARGET, bMaxY = 0;

    for (let sy = 0; sy < scaledH; sy++) {
      const destY = cellStartY + placeY + sy;
      if (destY < cellStartY || destY >= cellStartY + CELL_TARGET) continue;

      for (let sx = 0; sx < scaledW; sx++) {
        const destX = cellStartX + placeX + sx;
        if (destX < cellStartX || destX >= cellStartX + CELL_TARGET) continue;

        const sIdx = (sy * scaledW + sx) * 4;
        const alpha = scaledCell[sIdx + 3];
        if (alpha > 40) {
          const dIdx = (destY * 2560 + destX) * 4;
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
      bMinX = 100; bMaxX = 400; bMinY = 100; bMaxY = 494;
    }

    framesMeta.push({
      row: r,
      col: c,
      grounded: !isAirborne,
      airborne: isAirborne,
      bbox: [bMinX, bMinY, bMaxX, bMaxY]
    });
  }

  // Save assets/mcmoney.webp
  await sharp(outCanvas, { raw: { width: 2560, height: 2560, channels: 4 } })
    .webp({ quality: 94 })
    .toFile("assets/mcmoney.webp");
  console.log("Saved assets/mcmoney.webp");

  // 2. Process Special Attack Sheet (Uniform 5x5)
  console.log("Processing special attack sheet...");
  const specRaw = await sharp(specSrc).raw().toBuffer({ resolveWithObject: true });
  const sW = specRaw.info.width, sH = specRaw.info.height;
  const specRgba = keyGreenToRgba(specRaw.data, sW, sH);

  // Uniform resize to 2560x2560
  await sharp(specRgba, { raw: { width: sW, height: sH, channels: 4 } })
    .resize(2560, 2560, { kernel: "lanczos3" })
    .webp({ quality: 92 })
    .toFile("assets/mcmoney-special.webp");
  console.log("Saved assets/mcmoney-special.webp");

  // 3. Process Portrait / Headshot
  console.log("Processing portrait...");
  await sharp(portSrc)
    .resize(512, 512)
    .webp({ quality: 95 })
    .toFile("assets/mcmoney-portrait.webp");
  console.log("Saved assets/mcmoney-portrait.webp");

  console.log("=== Asset Build Complete ===");
  return framesMeta;
}

buildMcMoney().then(frames => {
  fs.writeFileSync("tools/mcmoney-frames.json", JSON.stringify(frames, null, 2));
  console.log("Wrote tools/mcmoney-frames.json with", frames.length, "frames");
}).catch(err => {
  console.error(err);
  process.exit(1);
});
