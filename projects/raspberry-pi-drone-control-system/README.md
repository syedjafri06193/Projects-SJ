# Custom Drone Control System

A Raspberry Pi based autonomous drone control system designed for real-time stabilization and object tracking.

## Overview

This project uses a Raspberry Pi 4 as the central flight processor. It integrates:

- Brushless motors via ESC controllers
- IMU sensor for stabilization
- Pi Camera for environmental awareness
- Computer vision with OpenCV for object detection and tracking

The system processes sensor feedback in real-time to maintain stable flight while tracking specified objects.

## Features

- Autonomous object tracking
- Real-time flight stabilization
- Sensor fusion with IMU data
- Modular drone control architecture
- Python-based control algorithms

## Hardware Components

- Raspberry Pi 4
- Electronic Speed Controllers (ESC)
- Brushless Motors
- IMU Sensor (MPU6050 recommended)
- Raspberry Pi Camera Module
- LiPo Battery
- Drone Frame

## Software Stack

- Python 3
- OpenCV
- NumPy
- RPi.GPIO
- smbus2 (IMU communication)

## Installation

