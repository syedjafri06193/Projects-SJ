# Visualization

This folder contains notes and references for the visualization systems used in the simulator. The main simulator (`index.html` at the repo root) implements all visualizations using the HTML5 Canvas API — no external libraries required.

---

## Radiation Pattern (Polar Plot)

The polar radiation pattern renders the array factor `AF(θ)` in dB scale across all angles from −180° to +180°.

**Rendering approach:**
- Sample `AF(θ)` every 0.5° using the complex exponential sum
- Normalize to the peak value
- Convert to dB: `dB_norm = 1 + log₁₀(|AF/AF_max|²) / 3`  (maps −18 dB → 0, 0 dB → 1)
- Plot as a polar curve, filled with a radial gradient for depth
- Overlay beam direction arrow (green) and null direction indicator (orange dashed)

**Concentric rings** represent −6, −12, −18 dB levels. Radial grid lines every 30°.

---

## Wave Interference Field

A pixel-by-pixel computation of the combined field from all N point sources.

**Rendering approach:**
- For each canvas pixel (px, py), sum contributions from all N antenna positions:
  ```
  field(px,py) = Σ wₙ · e^{j(k·r_n + φₙ)} / (r_n + 1)
  ```
  where `r_n` is the distance from pixel to antenna n
- Map amplitude to a cyan-white colour ramp
- Overlay antenna element markers with their phase labels

This view makes constructive interference (bright bands) and destructive interference (dark bands) directly visible as spatial patterns.

---

## Array View

A schematic diagram of the physical antenna array.

**Elements shown:**
- Ground plane (hatched lines)
- Transmission line connecting all elements to the feed point
- Dipole elements (vertical lines with crossbars)
- Phase-shifter boxes with current phase value
- Element labels (E1, E2, … EN)
- Beam direction arrow indicating current steering angle θ
- Radiation arc indicating element weight from tapering

---

## Phase Bar Chart (right panel)

A bar chart showing the phase value (−180° to +180°) of each element, colour-coded by hue (blue = negative, green = zero, red = positive). Updated in real time as phases change.

---

## Taper Weight Chart (right panel)

Shows the Hamming window amplitude weight applied to each element. At 0% taper all bars are equal height. Increasing taper applies the cosine envelope, lowering the edge elements' weights.

---

## Extending the Visualizations

To add new visualizations:

1. Add a new tab button in the `.viz-tabs` div in `index.html`
2. Add a new `draw*()` function that operates on `mainCanvas`
3. Call it from the `redraw()` function under your new tab name
4. Add a `case` to `switchTab()`

The canvas is 580×440 pixels. All drawing uses the 2D Canvas API (`mctx`).
