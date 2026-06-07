# Software-Defined Radio (SDR)

Notes on integrating this beamforming system with SDR platforms for real-world signal capture and transmission.

---

## SDR Platforms

| Platform | Frequency Range | Bandwidth | TX/RX | Cost |
|---|---|---|---|---|
| RTL-SDR | 500 kHz–1.75 GHz | 2.4 MHz | RX only | ~$30 |
| HackRF One | 1 MHz–6 GHz | 20 MHz | Half-duplex | ~$300 |
| PlutoSDR | 325 MHz–3.8 GHz | 20 MHz | Full-duplex | ~$150 |
| USRP B210 | 70 MHz–6 GHz | 56 MHz | Full-duplex | ~$1,100 |
| USRP N310 | 10 MHz–6 GHz | 100 MHz | Full-duplex | ~$4,000 |

For basic receive-only beamforming experiments: RTL-SDR × N units.  
For transmit/receive with phase coherence: PlutoSDR or USRP.

---

## GNU Radio Integration

GNU Radio is the primary open-source SDR framework. A beamforming flowgraph would include:

1. **Source block** — UHD source (USRP) or OsmoSDR source (RTL-SDR / HackRF)
2. **Phase rotation block** — multiply each channel by `e^{jφₙ}` to apply phase shift
3. **Summation block** — add all N phase-shifted channels
4. **Sink block** — output to file, audio, or spectrum analyser

Example phase rotation in GNU Radio Python block:

```python
import numpy as np
from gnuradio import gr

class phase_rotate(gr.sync_block):
    def __init__(self, phase_rad):
        gr.sync_block.__init__(self, "phase_rotate",
            in_sig=[np.complex64], out_sig=[np.complex64])
        self.phase = phase_rad

    def work(self, input_items, output_items):
        output_items[0][:] = input_items[0] * np.exp(1j * self.phase)
        return len(output_items[0])
```

---

## Phase Coherence

For multi-channel SDR beamforming, all receiver channels must share a common clock and reference. Phase coherence requirements:

- **Common LO (local oscillator)** — all mixers driven from one reference
- **Synchronised sampling clocks** — ADCs trigger on the same edge
- **Cable length matching** — equal electrical path length to each antenna

The USRP X-series and N-series support multi-channel coherent operation via the OctoClock or GPSDO reference.

PlutoSDR is single-channel; multiple units can be synchronised with an external 40 MHz reference injected into each unit's reference input.

---

## Direction of Arrival Estimation

With a calibrated receive array connected to coherent SDR channels, direction-of-arrival (DoA) can be estimated using:

- **Delay-and-sum scanning** — steer a digital beam and record power vs angle
- **MUSIC algorithm** — super-resolution DoA from eigendecomposition of covariance matrix
- **ESPRIT** — rotational invariance method, computationally efficient

Python implementation of delay-and-sum scanning:

```python
import numpy as np

def scan_doa(signals, d_lambda, angles_deg):
    N, M = signals.shape  # N elements, M samples
    k = 2 * np.pi
    power = []
    for theta_deg in angles_deg:
        theta = np.deg2rad(theta_deg)
        phases = np.exp(-1j * k * d_lambda * np.arange(N) * np.sin(theta))
        beamformed = phases.conj() @ signals  # shape: (M,)
        power.append(np.mean(np.abs(beamformed)**2))
    return np.array(power)
```

---

## Resources

- GNU Radio documentation — gnuradio.org/doc
- PySDR — pysdr.org (excellent open textbook on SDR and DSP)
- RTL-SDR blog — rtl-sdr.com
- Analog Devices PlutoSDR wiki — wiki.analog.com/university/tools/pluto
- USRP Hardware Driver (UHD) — files.ettus.com/manual
