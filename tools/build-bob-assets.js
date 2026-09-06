import sharp from 'sharp';
import fs from 'fs';

async function build() {
  console.log('--- Processing Dr. Bob Beam Modules ---');
  const beamSrc = 'tools/source/bob_beam.png';
  const beamMeta = await sharp(beamSrc).metadata();
  console.log('Source beam:', beamMeta.width, 'x', beamMeta.height);

  const scale = 512 / beamMeta.height;

  // 1. Start / Muzzle Bloom: x=20..428 (w=409, h=724)
  const startW = Math.round(409 * scale);
  await sharp(beamSrc)
    .extract({ left: 20, top: 0, width: 409, height: 724 })
    .resize(startW, 512)
    .webp({ quality: 95 })
    .toFile('assets/bob-beam-start.webp');
  console.log('Created assets/bob-beam-start.webp', startW, 'x 512');

  // 2. Loop A (Mid 1): x=448..837 (w=390, h=724)
  const midW = Math.round(390 * scale);
  await sharp(beamSrc)
    .extract({ left: 448, top: 0, width: 390, height: 724 })
    .resize(midW, 512)
    .webp({ quality: 95 })
    .toFile('assets/bob-beam-mid.webp');
  console.log('Created assets/bob-beam-mid.webp', midW, 'x 512');

  // 3. Loop B (Mid 2): x=858..1252 (w=395, h=724)
  const mid2W = Math.round(395 * scale);
  await sharp(beamSrc)
    .extract({ left: 858, top: 0, width: 395, height: 724 })
    .resize(mid2W, 512)
    .webp({ quality: 95 })
    .toFile('assets/bob-beam-mid2.webp');
  console.log('Created assets/bob-beam-mid2.webp', mid2W, 'x 512');

  // 4. Tip / Head: x=1271..1670 (w=400, h=724)
  const tipW = Math.round(400 * scale);
  await sharp(beamSrc)
    .extract({ left: 1271, top: 0, width: 400, height: 724 })
    .resize(tipW, 512)
    .webp({ quality: 95 })
    .toFile('assets/bob-beam-tip.webp');
  console.log('Created assets/bob-beam-tip.webp', tipW, 'x 512');

  // 5. Impact explosion: x=1690..2155 (centered at x=1922, y=353)
  const expR = 260;
  const expLeft = Math.max(0, 1922 - expR);
  const expTop = Math.max(0, 353 - expR);
  const expW = Math.min(expR * 2, beamMeta.width - expLeft);
  const expH = Math.min(expR * 2, beamMeta.height - expTop);
  await sharp(beamSrc)
    .extract({ left: expLeft, top: expTop, width: expW, height: expH })
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 95 })
    .toFile('assets/bob-beam-impact.webp');
  console.log('Created assets/bob-beam-impact.webp 512x512');

  // Also composite clean assets/kame-beam.webp (5 modules of 307x512)
  const stripW = 307 * 5;
  const partBuffers = await Promise.all([
    sharp('assets/bob-beam-start.webp').resize(307, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer(),
    sharp('assets/bob-beam-mid.webp').resize(307, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer(),
    sharp('assets/bob-beam-mid2.webp').resize(307, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer(),
    sharp('assets/bob-beam-tip.webp').resize(307, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer(),
    sharp('assets/bob-beam-impact.webp').resize(307, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()
  ]);

  await sharp({
    create: { width: stripW, height: 512, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  }).composite([
    { input: partBuffers[0], left: 0, top: 0 },
    { input: partBuffers[1], left: 307, top: 0 },
    { input: partBuffers[2], left: 307 * 2, top: 0 },
    { input: partBuffers[3], left: 307 * 3, top: 0 },
    { input: partBuffers[4], left: 307 * 4, top: 0 }
  ]).webp({ quality: 95 }).toFile('assets/kame-beam.webp');
  console.log('Created assets/kame-beam.webp 1535x512');

  // --- Processing Dr. Bob Character Catalog ---
  console.log('--- Processing Dr. Bob Character Catalog ---');
  const charSrc = 'tools/source/bob_kame.png';
  const CELL = 512;
  const canvasW = CELL * 5;
  const canvasH = CELL * 5;

  // Resize source to 2560x2560 in a single fast operation
  const { data: rawData, info: rawInfo } = await sharp(charSrc)
    .resize(canvasW, canvasH, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  // In frames 13..18 (row 2 col 2 to row 3 col 2, index 12 to 17),
  // Bob's hands are thrust forward and the beam was truncated at the right edge of each cell (x = 512).
  // We fade out the beam stub past x = 400..470 so Bob's hands and cuffs remain 100% intact,
  // without the harsh flat cell cutoff!
  for (let idx = 12; idx <= 17; idx++) {
    const r = Math.floor(idx / 5);
    const c = idx % 5;
    const cellLeft = c * CELL;
    const cellTop = r * CELL;

    for (let y = 0; y < CELL; y++) {
      for (let x = 390; x < CELL; x++) {
        const p = ((cellTop + y) * canvasW + (cellLeft + x)) * 4;
        const fade = Math.max(0, Math.min(1, (470 - x) / 80));
        rawData[p + 3] = Math.round(rawData[p + 3] * fade);
      }
    }
  }

  await sharp(rawData, {
    raw: { width: canvasW, height: canvasH, channels: 4 }
  }).webp({ quality: 95 }).toFile('assets/kame.webp');
  console.log('Created assets/kame.webp 2560x2560');

  console.log('=== All Dr. Bob sprite assets successfully generated! ===');
  process.exit(0);
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});
