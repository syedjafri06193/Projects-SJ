# 🧱 Brick Breaker — Java Swing

A fully featured Brick Breaker game with precise collision detection,
6 unique levels, particle effects, and a clean object-oriented design.

## Requirements
- Java 21+ (uses switch expressions and preview features)
  - Download: https://adoptium.net

## Build & Run

**Mac / Linux:**
```bash
chmod +x run.sh
./run.sh
```

**Windows:**
```
run.bat
```

**Manual:**
```bash
mkdir out
javac --enable-preview --release 21 -d out src/brickbreaker/*.java
java  --enable-preview -cp out brickbreaker.Main
```

## Controls
| Key              | Action         |
|------------------|----------------|
| ← / A            | Move paddle left  |
| → / D            | Move paddle right |
| P / ESC          | Pause / Resume  |
| ENTER / SPACE    | Start / Continue |
| R                | Restart (Game Over) |

---

## Architecture

```
src/brickbreaker/
├── Main.java              Entry point (JFrame setup)
├── GamePanel.java         Game loop, state machine, rendering
├── Ball.java              Ball physics & drawing
├── Paddle.java            Paddle movement & drawing
├── Brick.java             Brick types, health, drawing
├── CollisionDetector.java AABB collision with side detection
├── LevelManager.java      6 level layouts
└── ParticleSystem.java    Explosion particles
```

### Collision Detection — `CollisionDetector.java`

Uses **AABB (Axis-Aligned Bounding Box)** with **minimum-overlap side detection**:
1. Check if ball rectangle intersects brick rectangle.
2. Compute penetration depth from all 4 sides.
3. The **smallest penetration** tells us which face was hit.
4. Reflect only the matching velocity component (X or Y) — prevents jitter.

### Brick Types
| Type        | Health | Points | Appearance   |
|-------------|--------|--------|--------------|
| NORMAL      | 1      | 10     | Green        |
| TOUGH       | 2      | 20     | Orange → Red |
| SUPER       | 3      | 50     | Purple       |
| UNBREAKABLE | ∞      | 0      | Dark grey    |

### Level Layouts
| Level | Name        | Description                              |
|-------|-------------|------------------------------------------|
| 1     | Grid        | Simple 5×8 normal brick grid             |
| 2     | Mixed       | Tough top row with super bricks          |
| 3     | Diamond     | Diamond shape with super core            |
| 4     | Fortress    | Unbreakable walls around super interior  |
| 5     | Checkerboard| Alternating pattern, tougher rows        |
| 6     | Gauntlet    | All types, unbreakable roof              |
