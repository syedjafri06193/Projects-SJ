# Phase Control

## Overview

Phase control is the mechanism by which a phased array steers its beam electronically without physically moving any antenna. By adjusting the phase of the signal fed to each antenna element, the composite wavefront can be tilted to point in any direction within the array's scan range.

---

## Why Phase Matters

When signals from multiple antennas combine in free space, their relative phase determines whether they add (constructive interference) or cancel (destructive interference).

- **In phase (Δφ = 0°):** waves add together → maximum signal strength
- **Out of phase (Δφ = 180°):** waves cancel → null in radiation pattern
- **Intermediate phase:** partial constructive or destructive interference

Beam steering exploits this: by choosing the phase of each element so that all signals arrive in phase at the target angle, the array creates a strong beam in that direction.

---

## Progressive Phase Shift

For a uniform linear array steered to angle θ₀, a progressive (linearly increasing) phase shift is applied across the elements:

```
φₙ = n · Δφ

where Δφ = (2π · d · sin(θ₀)) / λ
```

| Element | Phase Applied |
|---|---|
| 0 | 0° |
| 1 | Δφ |
| 2 | 2Δφ |
| 3 | 3Δφ |
| … | … |
| N−1 | (N−1)·Δφ |

This tilts the phase front of the array by exactly the amount needed to steer the peak response to θ₀.

---

## Phase Shifter Hardware

In real hardware, phase shifts are implemented by dedicated phase-shifter circuits inserted between the signal source and each antenna element.

### Analogue Phase Shifters

- **Loaded-line phase shifter** — switched transmission line stubs change the electrical length
- **Reflection-type phase shifter** — uses a 90° hybrid coupler with a variable reactive load
- **Vector modulator** — combines I and Q components with variable gain to produce any phase

Analogue phase shifters offer continuous phase resolution but are sensitive to temperature and component variation.

### Digital Phase Shifters

Digital phase shifters use a finite number of bits to quantise the phase into discrete steps:

```
Phase resolution = 360° / 2ᴮ

where B = number of bits
```

| Bits | Steps | Resolution |
|---|---|---|
| 1 | 2 | 180° |
| 2 | 4 | 90° |
| 3 | 8 | 45° |
| 4 | 16 | 22.5° |
| 5 | 32 | 11.25° |
| 6 | 64 | 5.625° |

More bits = finer phase control = better beam pointing accuracy and lower quantisation side lobes.

### Quantisation Lobes

Phase quantisation introduces periodic errors in the array factor, raising side-lobe levels. The quantisation lobe level for a B-bit phase shifter is approximately:

```
SLL_quantisation ≈ −20·B + 6  dB
```

For a 5-bit shifter: SLL ≈ −94 dB (negligible). For a 2-bit shifter: SLL ≈ −34 dB (significant).

---

## Phase Calibration

In practice, manufacturing tolerances, cable length differences, and component variation introduce unintended phase errors across the array. Calibration corrects these:

1. **Factory calibration** — measure each element's response and store correction offsets in memory
2. **Self-calibration** — inject known test signals and compare element responses in situ
3. **Mutual coupling correction** — account for electromagnetic coupling between adjacent elements

Uncorrected phase errors degrade beam pointing accuracy and raise side lobes.

---

## Time Delay vs Phase Shift

Phase shift is frequency-dependent: a fixed phase shift Δφ corresponds to a time delay of:

```
τ = Δφ / ω = Δφ / (2π · f)
```

For narrowband signals this distinction is unimportant — phase shift and time delay are interchangeable. But for wideband signals (large bandwidth), a fixed phase shift causes **beam squint**: the beam angle changes with frequency because the electrical path length in wavelengths changes.

The solution for wideband arrays is **true time delay (TTD)** — inserting actual time delays (e.g. switched delay lines) rather than phase shifts. TTD is frequency-independent and avoids squint.

```
Squint angle error ≈ (Δf / f₀) · θ_steer
```

For a 28 GHz array steered to 30° with 1 GHz bandwidth: squint ≈ 1.1° per GHz — manageable for narrowband 5G NR but significant for UWB radar.

---

## FPGA / Embedded Implementation

In digital beamforming systems, phase shifting is performed in the digital domain after analogue-to-digital conversion:

```c
// Apply phase rotation to complex baseband sample
float phase_rad = n * delta_phi;
float I_out = I_in * cos(phase_rad) - Q_in * sin(phase_rad);
float Q_out = I_in * sin(phase_rad) + Q_in * cos(phase_rad);
```

For FPGA implementation, CORDIC (COordinate Rotation DIgital Computer) algorithms compute sin/cos efficiently without floating-point hardware:

```
CORDIC iterations ≈ log₂(precision_bits)
Latency ≈ N_iterations clock cycles
```

Typical FPGA beamforming pipelines achieve sub-microsecond beam switching latency, enabling fast scanning radar and 5G beam management.

---

## Phase Control in This Simulator

The simulator computes the ideal progressive phase for each element given the steering angle:

```javascript
const dPhi = (2 * Math.PI * d * Math.sin(steerAngle_rad));
for (let n = 0; n < N; n++) {
    phases[n] = (n * dPhi * 180 / Math.PI) % 360;
}
```

Phases are then used in the array factor computation:

```javascript
const psi = n * k * d * Math.sin(theta) + phases[n] * Math.PI / 180;
re += weight * Math.cos(psi);
im += weight * Math.sin(psi);
```

Individual element phases can also be set manually via the per-element sliders, enabling exploration of arbitrary phase distributions.

---

## References

- Mailloux, R.J. — *Phased Array Antenna Handbook*, Artech House
- Hansen, R.C. — *Phased Array Antennas*, Wiley
- Skolnik, M.I. — *Introduction to Radar Systems*, McGraw-Hill
