# Beamforming Antenna Array Simulator

A fully interactive browser-based simulator for phased antenna array beamforming — covering electronic beam steering, wave interference visualization, radiation pattern analysis, and real-time phase control.

**[▶ Launch Simulator](./index.html)**

---

![Beamforming Antenna Array](https://img.shields.io/badge/Technology-RF%20%2F%20Antenna%20Systems-00d4ff?style=flat-square) ![Language](https://img.shields.io/badge/Built%20With-HTML%20%2F%20JS%20%2F%20Canvas-ff6b35?style=flat-square) ![License](https://img.shields.io/badge/License-MIT-00ff88?style=flat-square)

---

## What This Project Does

Beamforming is the technology that enables 5G networks, phased-array radar, satellite communications, and WiFi 6/7 to focus electromagnetic energy in specific directions without physically moving an antenna. This simulator lets you explore and visualise that technology in real time inside your browser — no installation, no hardware required.

---

## Live Simulator Features

### Three Visualisation Modes

| Mode | Description |
|---|---|
| **Radiation Pattern** | Real-time polar plot of the array factor in dB scale with glow overlay, beam direction arrow, and null steering indicator |
| **Wave Interference** | Pixel-accurate constructive/destructive interference field computed from all N antenna sources |
| **Array View** | Physical diagram of the linear array showing dipole elements, phase-shifter boxes, transmission line, and beam direction |

### Interactive Controls

- **Number of antennas** — 2 to 16 elements
- **Element spacing** — 0.1λ to 1.5λ
- **Operating frequency** — 1 GHz to 60 GHz (covers sub-6 GHz through mmWave)
- **Beam steering angle** — −90° to +90°
- **Hamming window taper** — variable, reduces side-lobe level
- **Per-element phase sliders** — manual control of each antenna's phase offset
- **Auto Scan mode** — continuously sweeps the beam from −60° to +60°
- **Phase reset** — returns all elements to 0°

### Live Metrics

- Main lobe gain (dB)
- 3 dB beamwidth (degrees)
- Side lobe level (dB)
- Current steering angle

---

## Core Physics

### Electromagnetic Wave Model

An electromagnetic wave is represented as:

```
E(x,t) = A · cos(kx − ωt + φ)
```

Where `A` is amplitude, `k` is wavenumber, `ω` is angular frequency, and `φ` is phase.

### Array Factor

The directional response of the phased array is given by:

```
AF(θ) = Σ(n=0 to N-1) e^{ j(n·k·d·sinθ + φₙ) }
```

Where `N` is element count, `d` is spacing, `θ` is observation angle, `φₙ` is the phase offset of element n.

### Beam Steering

The progressive phase shift required to steer to angle θ:

```
Δφ = 2π · d · sin(θ) / λ
```

### Delay-and-Sum Beamforming

```
y(t) = Σ xₙ(t − τₙ)
```

Aligns wavefronts constructively in the target direction.

---

## Repository Structure

```
beamforming-antenna-array/
│
├── index.html                  ← Interactive browser simulator (main deliverable)
│
├── docs/
│   ├── antenna_theory.md       ← Antenna fundamentals and radiation theory
│   ├── beamforming.md          ← Beamforming algorithms and mathematics
│   └── phase_control.md        ← Phase shifting and steering implementation
│
├── visualization/
│   └── README.md               ← Notes on radiation pattern and heatmap rendering
│
├── simulations/
│   └── README.md               ← Simulation methodology and parameter reference
│
├── firmware/
│   └── README.md               ← Hardware implementation notes (STM32 / ESP32)
│
└── sdr/
    └── README.md               ← SDR platform notes (HackRF, PlutoSDR, RTL-SDR)
```

---

## How to Run

Open `index.html` in any modern browser — Chrome, Firefox, Edge, or Safari. No server, build step, or installation required.

To host it live via GitHub Pages:
1. Go to **Settings → Pages**
2. Set source to **main branch / root**
3. The simulator will be live at `https://<your-username>.github.io/<repo-name>/`

---

## Technologies Covered

| Domain | Topics |
|---|---|
| Physics | Electromagnetic waves, wave interference, RF radiation, antenna theory |
| Mathematics | Fourier analysis, complex exponentials, phase relationships, vector analysis |
| Signal Processing | Array factor, beamforming algorithms, Hamming window tapering, spectral analysis |
| RF Engineering | Phased arrays, phase shifters, impedance matching, antenna spacing |
| Embedded Systems | STM32, ESP32, FPGA platforms (Xilinx, Intel Zynq) |
| SDR | GNU Radio, HackRF, PlutoSDR, RTL-SDR, USRP |

---

## Applications

- **5G / mmWave** — massive MIMO base stations, user equipment beam tracking
- **Radar** — phased-array surveillance, target localisation, automotive radar
- **Satellite** — low-earth orbit satellite steering, ground station arrays
- **WiFi 6/7** — multi-user beamforming, spatial reuse
- **Defence** — electronic warfare, jamming, adaptive null steering
- **Autonomous vehicles** — sensor fusion, radar sensing

---

## Future Extensions

- [ ] Adaptive beamforming (MVDR / LCMV)
- [ ] MUSIC direction-of-arrival algorithm
- [ ] 2D planar array support
- [ ] MIMO channel simulation
- [ ] AI-assisted beam optimisation
- [ ] SDR hardware integration (GNU Radio export)
- [ ] Multi-user interference nulling

---

## License

MIT License — free to use, modify, and distribute.
