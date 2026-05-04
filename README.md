# 🗡️ Dungeon Crawler — Java Swing

A procedurally generated roguelike dungeon crawler with enemy scaling, fog of war, and turn-based combat.

## Requirements
Java 21+ — https://adoptium.net

## Run

```bash
chmod +x run.sh && ./run.sh
```

## Controls
| Key              | Action           |
|------------------|------------------|
| WASD / Arrows    | Move / Attack    |
| > or .           | Descend stairs   |
| ESC              | Quit             |

---

## Features

### Procedural Generation — BSP Algorithm
Each floor is generated using **Binary Space Partitioning**:
1. The map is recursively split into left/right or top/bottom halves
2. A room is carved into each leaf partition
3. Sibling rooms are connected with L-shaped corridors
4. A unique random seed per floor guarantees every run is different

### Enemy Scaling
6 enemy types unlock progressively with floor depth:

| Floor | Enemy Types Available                    |
|-------|------------------------------------------|
| 1-2   | Skeleton, Goblin                         |
| 3-4   | + Orc                                    |
| 5-6   | + Troll                                  |
| 7-8   | + Demon                                  |
| 9-10  | + Dragon                                 |

All stats scale by **+12% per floor**: HP, ATK, XP reward.

### Systems
- **Fog of War** — Ray-casting visibility with explored memory
- **BFS Pathfinding** — Enemies navigate around walls toward the player
- **Turn-based combat** — Attack/defense dice rolls, loot on kill
- **Items** — Health, Strength, Shield potions + Gold
- **Levelling** — XP → stat boosts every level

### Architecture
```
src/dungeon/
├── Main.java
├── core/
│   ├── Game.java          Game loop, input, turn orchestration
│   └── GameState.java     Central state (player, level, fog, log)
├── world/
│   ├── DungeonGenerator.java  BSP map generation
│   ├── Level.java             Floor data + population
│   ├── Room.java              Room bounds
│   └── Tile.java              Tile types
├── entity/
│   ├── Entity.java            Base class
│   ├── Player.java            Stats, XP, inventory
│   ├── Enemy.java             Enemy data + AI state
│   ├── EnemyFactory.java      Scaled enemy creation
│   └── Item.java              Items + ItemFactory
├── combat/
│   ├── CombatResolver.java    Attack/defense rolls
│   └── EnemyAI.java           BFS pathfinding + alerting
├── util/
│   └── FogOfWar.java          Ray-cast visibility
└── ui/
    ├── Renderer.java          All rendering (tiles, HUD, log)
    └── MessageLog.java        Scrolling event log
```
