# Simulations

This folder is for simulation scripts and parameter studies. The browser-based simulator in `index.html` covers interactive real-time use; the files here are intended for batch computation, parameter sweeps, and export of results for further analysis.

---

## Suggested Simulation Studies

### 1. Beamwidth vs Element Count

Sweep N from 2 to 32 and record the 3 dB beamwidth at each step. Expected result: HPBW scales as 1/N for fixed array aperture.

| N | Expected HPBW (d=λ/2, θ=0°) |
|---|---|
| 4 | ~26° |
| 8 | ~13° |
| 16 | ~6.5° |
| 32 | ~3.3° |

---

### 2. Side Lobe Level vs Taper

Compare SLL for uniform, Hamming, Hanning, and Chebyshev windows across element counts 4–16.

---

### 3. Grating Lobe Study

Set element spacing d > λ/2 and observe the appearance of grating lobes. Document the threshold spacing and angle.

---

### 4. Scan Loss

Measure main lobe gain as a function of steering angle. For a uniform array the scan loss is:

```
Scan Loss = 20 · log₁₀(cos(θ_steer))   [dB]
```

Verify this against simulated values.

---

### 5. Phase Quantisation Effects

Simulate 1-bit through 6-bit phase quantisation and measure the resulting quantisation side-lobe level. Compare against the theoretical prediction:

```
SLL_q ≈ −20B + 6 dB
```

---

## Parameter Reference

| Parameter | Typical Range | Notes |
|---|---|---|
| N (elements) | 4–64 | Powers of 2 common in FPGA implementations |
| d (spacing) | 0.4λ–0.6λ | λ/2 = optimal for no grating lobes |
| f (frequency) | 700 MHz–100 GHz | Sub-6 GHz: 4G/5G; 28/39 GHz: mmWave 5G; 77 GHz: automotive radar |
| θ_steer | −60° to +60° | Beyond ±60° scan loss becomes severe |
| Taper | 0–1 (Hamming) | Higher taper = lower SLL, wider beam |
| Phase bits | 4–6 | 6 bits sufficient for most applications |

---

## External Simulation Tools

For high-fidelity electromagnetic simulation beyond what a browser simulator can provide:

| Tool | Use Case |
|---|---|
| MATLAB Phased Array System Toolbox | Array factor, adaptive beamforming, MVDR, MUSIC |
| GNU Radio | SDR signal chain simulation |
| CST Studio Suite | Full-wave 3D EM simulation of antenna geometry |
| ANSYS HFSS | High-frequency structure simulation |
| Keysight ADS | RF circuit and array simulation |
| Python (NumPy/SciPy) | Custom beamforming algorithm prototyping |

---

## Python Starter Script

A minimal array factor computation in Python:

```python
import numpy as np
import matplotlib.pyplot as plt

N = 8          # elements
d = 0.5        # spacing in wavelengths
steer_deg = 30 # steering angle

theta = np.linspace(-np.pi/2, np.pi/2, 1000)
steer_rad = np.deg2rad(steer_deg)
k = 2 * np.pi

# Compute progressive phase shifts
delta_phi = k * d * np.sin(steer_rad)
phases = np.arange(N) * delta_phi

# Compute array factor
AF = np.zeros(len(theta), dtype=complex)
for n in range(N):
    psi = n * k * d * np.sin(theta) + phases[n]
    AF += np.exp(1j * psi)

AF_norm = np.abs(AF) / np.max(np.abs(AF))
AF_dB = 20 * np.log10(AF_norm + 1e-12)

# Plot
plt.figure(figsize=(10, 5))
plt.plot(np.rad2deg(theta), AF_dB)
plt.xlabel('Angle (degrees)')
plt.ylabel('Array Factor (dB)')
plt.title(f'Radiation Pattern — N={N}, d={d}λ, θ_steer={steer_deg}°')
plt.ylim(-40, 0)
plt.grid(True, alpha=0.3)
plt.axvline(steer_deg, color='r', linestyle='--', label='Steering angle')
plt.legend()
plt.show()
```
