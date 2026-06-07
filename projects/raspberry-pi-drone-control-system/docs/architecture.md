# System Architecture

The drone control system is composed of three major subsystems:

1. Sensor Layer
   - IMU for orientation
   - Camera for visual input

2. Control Layer
   - Flight stabilization algorithm
   - Object tracking logic

3. Actuation Layer
   - ESC motor controllers
   - Motor speed adjustments

The Raspberry Pi acts as the central processor managing sensor input, control decisions, and motor outputs.
