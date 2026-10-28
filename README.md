# Projects — Syed Jafri

Engineering + AI. The featured projects below each live in their own
repository; this repo also collects smaller projects, games and hardware
write-ups (see [In this repository](#in-this-repository)).

Stacks listed are what the code actually uses. Each featured repository has
its own CI and a one-command test run.

## 🚀 Featured Projects

### Systems, infrastructure and tooling

| Project | Description | Tech Stack |
| --- | --- | --- |
| [**DevOps Pipeline Orchestrator**](https://github.com/syedjafri06193/DevOps-Pipeline-Orchestrator-proj) | Crash-safe deployment orchestrator for VMs, ECS, Lambda and static sites: journalled executor, verification against a baseline, guarded rollback, RBAC approvals, Slack and an SSE dashboard. | Go · append-only journal · Prometheus · Slack |
| [**Microservices API Framework**](https://github.com/syedjafri06193/Microservices-API-Framework-proj) | Wiring layer over connect-go and OpenTelemetry: ordered interceptors, breaker classification, retry budgets, deadline budgets and shutdown sequencing; Connect, gRPC and gRPC-Web on one port. | Go · connect-go · OpenTelemetry · Prometheus |
| [**Systems Monitoring Dashboard**](https://github.com/syedjafri06193/Systems-Monitoring-Dashboard-proj) | Push-based metrics with sub-second P99 end to end: binary WebSocket wire format, tiered store, robust anomaly detection, hysteresis alerting. | Go · TypeScript · WebSocket · uPlot |
| [**ML Inference Engine**](https://github.com/syedjafri06193/ML-Inference-Engine-proj) | ~20 KB int8 WebAssembly runtime for small CNNs in the browser, with a hand-written SIMD GEMM and an ONNX converter. | Rust (`no_std`) · WASM SIMD · TypeScript · Python/ONNX |

### Revenue and sales systems

| Project | Description | Tech Stack |
| --- | --- | --- |
| [**Call Intelligence Summarizer**](https://github.com/syedjafri06193/Call-Intelligence-Summarizer-proj) | Consent-gated call pipeline: per-speaker ingest, PII redaction, grounded extraction (every claim cites a span), MEDDICC/BANT/custom YAML scoring and idempotent CRM write-back. | Python · YAML rubrics · Groq / Claude (optional) |
| [**Pipeline Forecasting Engine**](https://github.com/syedjafri06193/Pipeline-Forecasting-Engine-proj) | Point-in-time correct forecasting: calibrated deal models, shrunk rep win rates, correlated Monte Carlo aggregation, walk-forward backtest. | Python · LightGBM · scikit-learn · DuckDB · Polars |
| [**Lead Enrichment Pipeline**](https://github.com/syedjafri06193/Lead-Enrichment-Pipeline-proj) | Append-only observation store, probabilistic identity resolution with a review queue, budgeted enrichment and echo-suppressed bidirectional CRM sync. | Python · SQLite (Postgres DDL) · Splink (optional) |
| [**Outbound Sequencer**](https://github.com/syedjafri06193/Outbound-Sequencer-proj) | Guardrail-first sequencing engine: complaint budget, warmup, jurisdiction gate, suppression, send-time preflight, reply/meeting auto-pause. | Go (standard library) |
| [**Quote & Proposal Builder**](https://github.com/syedjafri06193/Quote-and-Proposal-Builder-proj) | CPQ with deterministic pricing traces, approval chains protected by content fingerprints, byte-identical PDF proposals and e-signature reconciliation. | TypeScript · Node.js · pdf-lib · Vitest |

### Hardware and embedded

| Project | Description | Tech Stack |
| --- | --- | --- |
| [**FPGA Video Processing Core**](https://github.com/syedjafri06193/FPGA-Video-Processing-Core-proj) | HDMI pipeline on a Spartan-7: Sobel edge detection and 17³ trilinear 3D-LUT grading at 720p60, verified pixel-exact against a Python golden model. | Verilog · Icarus Verilog · Python · Vivado |
| [**Custom STM32 Dev Board**](https://github.com/syedjafri06193/Custom-STM32-Dev-Board-proj) | STM32G474 sensor-logger board with USB-C PD, CAN FD and an isolated 24-bit analog front end; executable design rules and host-tested firmware. | C11 · STM32G474 · Python · CAN FD |
| [**IoT Environmental Monitor**](https://github.com/syedjafri06193/IoT-Environmental-Monitor-proj) | LoRaWAN sensor node with e-ink display and duty-cycle budgeting, plus a ChirpStack → MQTT → InfluxDB → Grafana stack with silence alerting. | C (STM32WL) · LoRaWAN · JavaScript · Python · MQTT |
| [**NexusForge HIL Drone Swarm Arena**](https://github.com/syedjafri06193/NexusForge-HIL-Autonomous-Edge-AI-Drone-Swarm-Arena-proj) | Multi-agent drone combat simulator with behavior trees, swarm tactics, an edge-AI inference model, fault injection and hardware-in-the-loop over MQTT. | Python · FastAPI · React · three.js · ESP32 C++ |

### Games, graphics and creative tools

| Project | Description | Tech Stack |
| --- | --- | --- |
| [**ECS Game Engine**](https://github.com/syedjafri06193/ECS-Game-Engine-proj) | C++20 ECS with hybrid storage, a work-stealing scheduler, hot-reloadable gameplay modules and a Vulkan forward+ renderer. | C++20 · Vulkan · Lua · CMake |
| [**Physics Puzzle Platformer**](https://github.com/syedjafri06193/Physics-Puzzle-Platformer-proj) | 2D platformer on a custom deterministic Verlet soft-body solver; 5 levels, each with a recorded replay verified in CI. | C++ · Godot 4 (GDExtension) |
| [**AI Behavior Toolkit**](https://github.com/syedjafri06193/AI-Behavior-Tree-Toolkit-proj) | Utility AI for Unreal Behavior Trees and StateTree: diffable YAML authoring, score-breakdown tooling and record/replay debugging. | C++17 · TypeScript · Unreal |
| [**Audio-Reactive Shader Playground**](https://github.com/syedjafri06193/Audio-Reactive-Shader-Playground-proj) | Live GLSL coding driven by log-banded spectra, onset detection and beat tracking, with preset morphing and MIDI learn. | TypeScript · WebGL · Web Audio · Web MIDI |
| [**SENSEI Creative Copilot**](https://github.com/syedjafri06193/creative-copilot-mvp-) | Local suggestion service streaming grade, transition, beat-snap and VFX suggestions to a desktop UI from host timeline context (mock host and DaVinci Resolve adapter). | Python · FastAPI · Electron · React |

### Early stage

| Project | Status | Tech Stack |
| --- | --- | --- |
| [**Color Looks MVP**](https://github.com/syedjafri06193/color-looks-mvp-v.1) | Foundation: preset schema, starter look pack, OCIO config, first Metal kernel and tooling; engine and OFX plug-in designed, not built. | C++ · OpenColorIO · Metal |
| [**LooksMax AI**](https://github.com/syedjafri06193/looksmax-ai-) | Face-shape and symmetry heuristics with OpenCV behind a FastAPI endpoint, and an Expo client. | Python · FastAPI · OpenCV · React Native |

### Planned (design documents only)

Each of these has a written design and build guide but no implementation yet:
[Generative Poster System](https://github.com/syedjafri06193/Generative-Poster-System-proj) ·
[Motion Timeline Editor](https://github.com/syedjafri06193/Motion-Timeline-Editor-proj) ·
[Procedural Texture Baker](https://github.com/syedjafri06193/Procedural-Texture-Baker-proj) ·
[Variable Font Inspector](https://github.com/syedjafri06193/Variable-Font-Inspector-proj) ·
[Procedural Dungeon Roguelike](https://github.com/syedjafri06193/Procedural-Dungeon-Roguelike-proj) ·
[Rollback Netcode Layer](https://github.com/syedjafri06193/Rollback-Netcode-Layer-proj) ·
[Geospatial Tile Server](https://github.com/syedjafri06193/Geospatial-Tile-Server-proj).

### Networking and infrastructure write-ups

[Ramp Enterprise Network](https://github.com/syedjafri06193/ramp-enterprise-network-cisco-architecture) (Cisco campus design: VLAN/VTP, STP/HSRP, ACLs, NAT, device configs) ·
[Raspberry Pi Private NAS](https://github.com/syedjafri06193/raspberry-pi-private-nas) (encrypted Samba NAS with automated backups).

---

## In this repository

| Folder | Contents |
| --- | --- |
| [`projects/`](projects/) | Smaller and earlier projects: image captioning, multi-camera tracking, sentiment API, beamforming simulator, fraud-detection pipeline, OratorAI, drone control, resume analyzer, job-autofill extension, and more — each with its own README |
| [`games/`](games/) | Java games (Brick Breaker, Dungeon Crawler, Pong, Snake) — run with `./run.sh` or `javac` + `java`, Java 17+ |
| [`ai/`](ai/) | AI-powered job search engine |
| [`hardware-systems/`](hardware-systems/) | Electromagnetic levitation, induction heating, magnetic position tracking, mini-MRI simulation, wireless communication |
| [`1—Documentation/`](1—Documentation/README.md) | Portfolio reviews and software specifications for planned finance projects |
