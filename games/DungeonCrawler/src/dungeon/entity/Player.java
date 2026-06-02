package dungeon.entity;

import java.util.ArrayList;
import java.util.List;

public class Player extends Entity {
    public int attack;
    public int defense;
    public int xp, xpToNext, level;
    public int gold;
    public List<Item> inventory = new ArrayList<>();
    public int floor = 1;

    // Visual position (pixel-level for smooth movement)
    public float px, py;          // pixel position
    public float targetPx, targetPy;
    public boolean moving = false;

    public Player() {
        super(0, 0, "Hero", 30);
        this.attack   = 5;
        this.defense  = 2;
        this.level    = 1;
        this.xp       = 0;
        this.xpToNext = 20;
        this.gold     = 0;
    }

    /** Returns true if levelled up */
    public boolean gainXp(int amount) {
        xp += amount;
        if (xp >= xpToNext) {
            xp -= xpToNext;
            level++;
            xpToNext = (int)(xpToNext * 1.5);
            maxHp += 8;
            hp = Math.min(hp + 8, maxHp);
            attack  += 2;
            defense += 1;
            return true;
        }
        return false;
    }

    public int rollAttack() {
        return attack + (int)(Math.random() * 4);
    }

    public void teleportTo(int tx, int ty, int tileSize) {
        this.tx = tx; this.ty = ty;
        this.px = tx * tileSize;
        this.py = ty * tileSize;
        this.targetPx = px;
        this.targetPy = py;
        this.moving = false;
    }
}
