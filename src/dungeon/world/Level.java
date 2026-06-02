package dungeon.world;

import dungeon.entity.*;
import java.util.*;

public class Level {
    public final int floor;
    public final int cols, rows;
    public final Tile[][] grid;
    public final List<Room> rooms;
    public final List<Enemy> enemies;
    public final List<Item> items;

    // Spawn point (first room center)
    public final int spawnX, spawnY;

    public Level(int floor, int cols, int rows, long seed) {
        this.floor = floor;
        this.cols  = cols;
        this.rows  = rows;

        DungeonGenerator gen = new DungeonGenerator(cols, rows, seed);
        this.grid  = gen.generate();
        this.rooms = gen.getRooms();

        spawnX = rooms.get(0).centerX();
        spawnY = rooms.get(0).centerY();

        enemies = new ArrayList<>();
        items   = new ArrayList<>();
        populate(seed);
    }

    private void populate(long seed) {
        Random rng = new Random(seed + 9999);

        // Skip first room (spawn), populate the rest
        for (int i = 1; i < rooms.size(); i++) {
            Room r = rooms.get(i);

            // Enemies: more and tougher on deeper floors
            int enemyCount = 1 + rng.nextInt(2 + floor / 2);
            for (int e = 0; e < enemyCount; e++) {
                int ex = r.x + 1 + rng.nextInt(Math.max(1, r.w - 2));
                int ey = r.y + 1 + rng.nextInt(Math.max(1, r.h - 2));
                enemies.add(EnemyFactory.create(ex, ey, floor, rng));
            }

            // Items: 40% chance per room
            if (rng.nextFloat() < 0.4f) {
                int ix = r.x + 1 + rng.nextInt(Math.max(1, r.w - 2));
                int iy = r.y + 1 + rng.nextInt(Math.max(1, r.h - 2));
                items.add(ItemFactory.random(ix, iy, floor, rng));
            }
        }
    }

    public boolean isWalkable(int tx, int ty) {
        if (tx < 0 || ty < 0 || tx >= cols || ty >= rows) return false;
        return grid[ty][tx].walkable;
    }

    public Tile tileAt(int tx, int ty) {
        if (tx < 0 || ty < 0 || tx >= cols || ty >= rows) return Tile.VOID;
        return grid[ty][tx];
    }

    public Enemy enemyAt(int tx, int ty) {
        for (Enemy e : enemies)
            if (e.tx == tx && e.ty == ty && e.isAlive()) return e;
        return null;
    }

    public Item itemAt(int tx, int ty) {
        for (Item it : items)
            if (it.tx == tx && it.ty == ty) return it;
        return null;
    }

    public void removeItem(Item it) { items.remove(it); }
    public void removeDeadEnemies() { enemies.removeIf(e -> !e.isAlive()); }
}
