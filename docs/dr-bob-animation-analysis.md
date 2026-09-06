# Dr. BOB animation atlas analysis

Source analysis for the four supplied sprite references.

## Normal combat sheet
The green-screen 5x5 sheet is the strongest source for ordinary combat because every pose is consistently scaled and separated by a regular grid.

- Row 0: idle / breathing guard, 5 frames
- Row 1: forward walk, 5 frames
- Row 2: punch sequence: guard/chamber -> extension -> full extension -> reset
- Row 3: kick sequence: knee chamber -> rotation -> extended high kick -> full extension -> reset
- Row 4: damage ladder: recoil -> stunned -> airborne knockback -> floor fall -> KO

Production rules:
- chroma-key only green background, never white coat pixels
- remove white grid only when edge-connected
- normalize each output frame to 512x512 RGBA
- preserve aspect ratio
- ground-anchor rows 0-3, bbox-ground-anchor reaction row 4
- maintain >= 10 px transparent safety margin where possible

## Kamehameha 25-frame sheet
The transparent 5x5 Kamehameha catalog is sequential in reading order and is treated as 25 unique animation frames. No source frame should be skipped.

Phases:
1. focus / hands together
2. initial energy seed
3. charge growth
4. maximum charge
5. release preparation
6. sustained discharge
7. recoil / recovery

The game maps one move step to one source frame so timing and rendering stay deterministic.

## Beam mini-atlas
The wide beam reference contains five horizontal modules detected from alpha-separated runs:

1. START / muzzle bloom
2. LOOP A
3. LOOP B
4. HEAD / leading cap
5. IMPACT explosion

LOOP A/B alternate and overlap slightly to avoid seams; beam length is computed from palm origin to opponent hurtbox at runtime.

## Implementation intent
Dr. BOB uses an explicit per-action frame map rather than the previous generic row selection. The normal atlas, Kamehameha atlas, beam strip, hitbox window, impact sprite and recovery timing are synchronized as one animation system.
