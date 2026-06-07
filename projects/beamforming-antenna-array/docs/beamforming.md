# Beamforming

## Overview

Beamforming is a signal processing technique used with antenna arrays to transmit or receive signals preferentially in specific directions. Instead of radiating energy equally in all directions (as an omnidirectional antenna does), a phased array uses controlled phase and amplitude weighting across multiple elements to form a directed beam through constructive and destructive wave interference.

---

## The Array Factor

The core mathematical object in beamforming is the **Array Factor (AF)** — the directional response of the array as a whole, independent of the individual element pattern.

For a uniform linear array (ULA) of N elements spaced d apart:

```
AF(θ) = Σ(n=0 to N-1) wₙ · e^{ j(n·k·d·sinθ + φₙ) }
```

| Symbol | Meaning |
|---|---|
| N | Number of antenna elements |
| wₙ | Amplitude weight of element n |
| k | Wavenumber = 2π/λ |
| d | Element spacing (typically λ/2) |
| θ | Observation angle from broadside |
| φₙ | Phase offset applied to element n |

The total antenna pattern is the product of the element pattern and the array factor:

```
Total Pattern = Element Pattern × Array Factor
```

---

## Beam Steering

Electronic beam steering is achieved by applying a progressive phase shift across the array elements. To steer the main beam to angle θ₀:

```
Δφ = k · d · sin(θ₀) = (2π/λ) · d · sin(θ₀)
```

The phase applied to element n:

```
φₙ = n · Δφ = n · (2π · d · sin(θ₀)) / λ
```

This creates a wavefront tilt — the signal from each element arrives at the target angle simultaneously, adding coherently. At all other angles the signals arrive out of phase and cancel (destructive interference).

### Steering Limits

For a λ/2 spaced array, the beam can be steered up to ±90° from broadside. Beyond this, **grating lobes** appear — secondary main lobes at other angles with equal amplitude to the desired beam. Grating lobes occur when:

```
|d · sin(θ)| = λ    →    θ_grating = arcsin(λ/d ± 1)
```

To avoid grating lobes: keep element spacing d ≤ λ/2.

---

## Beamforming Algorithms

### 1. Fixed (Conventional) Beamforming

Pre-calculated phase weights steer the beam to a fixed direction. Simple and computationally cheap — used in this simulator.

```
φₙ = n · (2π · d · sin(θ_steer)) / λ
```

**Pros:** No real-time computation needed, low latency  
**Cons:** Cannot adapt to interference or multipath

---

### 2. Delay-and-Sum Beamforming

The time-domain equivalent of phase steering. Each element's signal is delayed by τₙ before summation:

```
y(t) = Σ(n=1 to N) xₙ(t − τₙ)
```

The delay for element n to steer to angle θ₀:

```
τₙ = n · d · sin(θ₀) / c
```

This aligns the wavefronts from the target direction before summing, maximising the signal-to-noise ratio from that direction.

---

### 3. Minimum Variance Distortionless Response (MVDR)

Also called Capon beamforming. Minimises output power while maintaining a distortionless response in the look direction. This naturally suppresses interferers.

```
w_MVDR = R⁻¹ · a(θ) / (a(θ)ᴴ · R⁻¹ · a(θ))
```

Where:
- `R` is the spatial covariance matrix of received signals
- `a(θ)` is the steering vector for angle θ
- `ᴴ` denotes conjugate transpose

**Pros:** Excellent interference suppression  
**Cons:** Requires accurate covariance matrix estimation; sensitive to model errors

---

### 4. MUSIC (Multiple Signal Classification)

A super-resolution direction-of-arrival (DoA) algorithm that exploits the eigenstructure of the covariance matrix to resolve signals closer than the Rayleigh limit.

```
P_MUSIC(θ) = 1 / (a(θ)ᴴ · Eₙ · Eₙᴴ · a(θ))
```

Where `Eₙ` is the noise subspace (eigenvectors of R corresponding to the smallest eigenvalues).

**Pros:** Can resolve closely-spaced sources  
**Cons:** Computationally intensive; requires known number of sources

---

### 5. Adaptive Null Steering

Places a null (zero) in the radiation pattern at a specific angle to cancel an interferer, while maintaining gain toward the desired signal. Implemented by adding a constraint to the weight optimisation:

```
minimise  wᴴ · R · w
subject to  wᴴ · a(θ_desired) = 1
            wᴴ · a(θ_interferer) = 0
```

---

## Amplitude Tapering (Windowing)

Applying a window function to the element weights reduces side-lobe levels at the cost of a wider main beam. Common windows:

| Window | Peak SLL | HPBW factor |
|---|---|---|
| Uniform (rectangular) | −13.3 dB | 1.0× |
| Hamming | −42.7 dB | 1.47× |
| Hanning | −31.5 dB | 1.44× |
| Chebyshev | Equiripple (programmable) | Varies |
| Taylor | Programmable | Near-optimal |

### Hamming Window (used in this simulator)

```
wₙ = 0.54 − 0.46 · cos(2π · n / (N − 1))
```

The taper parameter in the simulator blends between uniform (0%) and full Hamming (100%) weighting.

---

## MIMO Beamforming

In multiple-input multiple-output (MIMO) systems, multiple beams can be formed simultaneously using spatial multiplexing. The channel matrix H relates transmitted signals to received signals:

```
y = H · x + n
```

Precoding matrix W shapes the beams:

```
x_transmitted = W · s
```

Where s is the data stream vector. Singular Value Decomposition (SVD) of H gives the optimal precoding and combining matrices.

---

## Performance Metrics

| Metric | Formula | Meaning |
|---|---|---|
| Array Gain | 20·log₁₀(N) dB | Gain from coherent combining |
| HPBW | ≈ 0.886λ/(N·d) rad | Angular resolution |
| SLL | 20·log₁₀(max sidelobe / main lobe) | Interference rejection |
| Directivity | ≈ 2Nd/λ | Effective aperture |

---

## References

- Van Trees, H.L. — *Optimum Array Processing*, Wiley
- Liberti, J.C. & Rappaport, T.S. — *Smart Antennas for Wireless Communications*, Prentice Hall
- Godara, L.C. — *Application of Antenna Arrays to Mobile Communications*, Proc. IEEE
