# Antenna Theory

## What Is an Antenna?

An antenna is a transducer that converts electrical signals into electromagnetic waves (transmit) or electromagnetic waves back into electrical signals (receive). Every wireless system — from a mobile phone to a radar installation — depends on antennas at both ends of the link.

---

## Electromagnetic Wave Fundamentals

An electromagnetic wave propagating in free space carries both an electric field **E** and a magnetic field **H**, oscillating perpendicular to each other and to the direction of travel.

The wave equation for the electric field component:

```
E(x, t) = A · cos(kx − ωt + φ)
```

| Symbol | Meaning |
|---|---|
| A | Amplitude (V/m) |
| k | Wavenumber = 2π/λ (rad/m) |
| ω | Angular frequency = 2πf (rad/s) |
| φ | Phase offset (rad) |
| λ | Wavelength = c/f (m) |

In free space the wave travels at the speed of light: `c = 3 × 10⁸ m/s`.

---

## Key Antenna Parameters

### Radiation Pattern

The radiation pattern describes how an antenna distributes energy as a function of direction. It is plotted in polar coordinates as power or field strength versus angle.

- **Main lobe** — the direction of maximum radiation
- **Side lobes** — secondary maxima at other angles
- **Nulls** — directions of zero radiation (useful for interference rejection)
- **Back lobe** — radiation in the opposite direction to the main lobe

### Directivity

Directivity D is the ratio of the radiation intensity in a given direction to the average intensity over all directions:

```
D(θ, φ) = U(θ, φ) / U_avg
```

A higher directivity means more energy is concentrated in the target direction.

### Gain

Gain G includes the efficiency η of the antenna:

```
G = η · D
```

For an N-element array with uniform excitation, the maximum gain increases approximately as:

```
G_max ≈ N · G_element
```

### Beamwidth

The 3 dB beamwidth (half-power beamwidth, HPBW) is the angular span across which the radiated power is at least half the peak value. For a uniform linear array of N elements with spacing d = λ/2:

```
HPBW ≈ 0.886 · λ / (N · d)  [radians]
```

Narrower beamwidth = higher directivity = more focused transmission.

### Side Lobe Level (SLL)

The side lobe level is the ratio (in dB) of the peak side lobe amplitude to the main lobe amplitude. A lower SLL is desirable to reduce interference in unwanted directions.

```
SLL (dB) = 20 · log₁₀(A_sidelobe / A_mainlobe)
```

For a uniform linear array: SLL ≈ −13.3 dB. Tapering (windowing) can reduce this at the cost of wider beamwidth.

---

## Dipole Antennas

The half-wave dipole (length = λ/2) is the fundamental building block of most antenna arrays. Its radiation pattern in the E-plane is a figure-eight:

```
E(θ) ∝ cos(π/2 · cosθ) / sinθ
```

The half-wave dipole has a directivity of approximately 2.15 dBi (dB relative to an isotropic radiator).

---

## Antenna Impedance

The input impedance of an antenna determines how efficiently it couples to the transmission line or feed network. Impedance mismatch causes signal reflection, reducing radiated power.

```
Z_ant = R_rad + R_loss + jX
```

- `R_rad` — radiation resistance (power actually radiated)
- `R_loss` — ohmic loss resistance
- `X` — reactive component (varies with frequency)

For a half-wave dipole: `Z_ant ≈ 73 + j42.5 Ω` at resonance.

---

## Polarisation

Polarisation describes the orientation of the electric field vector. Common types:

- **Linear** — E-field oscillates in a fixed plane (horizontal or vertical)
- **Circular** — E-field rotates as the wave propagates (left-hand or right-hand)
- **Elliptical** — general case combining linear and circular components

Polarisation mismatch between transmitter and receiver causes signal loss.

---

## Near Field vs Far Field

| Region | Distance from antenna | Characteristic |
|---|---|---|
| Reactive near field | r < 0.62√(D³/λ) | Stored energy dominates, pattern varies with distance |
| Radiating near field (Fresnel) | 0.62√(D³/λ) < r < 2D²/λ | Angular pattern varies with distance |
| Far field (Fraunhofer) | r > 2D²/λ | Pattern is stable, spherical wavefront |

Where D is the largest dimension of the antenna aperture. Radiation pattern measurements are always taken in the far field.

---

## References

- Balanis, C.A. — *Antenna Theory: Analysis and Design*, Wiley
- Stutzman, W.L. — *Antenna Theory and Design*, Wiley
- Pozar, D.M. — *Microwave Engineering*, Wiley
