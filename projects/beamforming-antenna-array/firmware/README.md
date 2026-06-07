# Firmware

Hardware implementation notes for deploying beamforming control on embedded platforms.

---

## Platform Options

### STM32 (Recommended for prototype)

The STM32F4 or STM32H7 series are well-suited for beamforming control:

- SPI interface to digital phase shifter ICs (e.g. HMC933, PE43705)
- Timer-based PWM for analogue phase control
- DMA transfers for low-latency phase updates
- USB or UART for host PC control

**Phase update rate:** STM32H7 at 480 MHz can update all 16 element phases via SPI in < 10 µs.

### ESP32 (Basic control / WiFi interface)

Useful for wireless control of the array from a phone or browser:

- WiFi-based remote control of steering angle
- I2C or SPI to phase shifter ICs
- WebSocket server for real-time phase updates from the simulator

### FPGA (High-performance)

For real-time digital beamforming in the signal chain:

- Xilinx Zynq-7000 or UltraScale+: ARM cores + FPGA fabric
- Intel Cyclone V or Arria: cost-effective mid-range
- Implement array factor computation in parallel DSP blocks
- Sub-microsecond beam switching for radar applications

---

## Phase Shifter ICs

| Part | Bits | Frequency | Interface |
|---|---|---|---|
| HMC933 | 6-bit | DC–6 GHz | SPI |
| PE43705 | 7-bit | 9 kHz–6 GHz | SPI / parallel |
| ADRF5720 | 6-bit | 9 kHz–40 GHz | SPI |
| HMC1084 | 6-bit | 6–18 GHz | SPI |
| F2250 | 5-bit | 24–30 GHz | Parallel |

---

## Pseudocode: Phase Update Loop

```c
void update_beam(float steer_angle_deg, int N, float d_lambda) {
    float steer_rad = steer_angle_deg * M_PI / 180.0f;
    float delta_phi = 2.0f * M_PI * d_lambda * sinf(steer_rad);

    for (int n = 0; n < N; n++) {
        float phase_rad = n * delta_phi;
        // Wrap to [0, 2π]
        while (phase_rad < 0)        phase_rad += 2.0f * M_PI;
        while (phase_rad >= 2*M_PI)  phase_rad -= 2.0f * M_PI;

        // Convert to phase shifter bits (6-bit example)
        uint8_t bits = (uint8_t)(phase_rad / (2.0f * M_PI) * 64.0f) & 0x3F;

        // Send to phase shifter via SPI
        spi_write(n, bits);
    }
}
```

---

## Further Reading

- STM32 Reference Manuals — st.com
- Xilinx Zynq-7000 Technical Reference Manual — xilinx.com
- HMC933 Datasheet — analog.com
- GNU Radio + USRP for SDR beamforming — gnuradio.org
