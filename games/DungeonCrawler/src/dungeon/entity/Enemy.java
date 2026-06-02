package dungeon.entity;

import java.awt.Color;

public class Enemy extends Entity {
    public enum Type { SKELETON, GOBLIN, ORC, TROLL, DEMON, DRAGON }

    public Type type;
    public int attack;
    public int defense;
    public int xpReward;
    public int goldReward;
    public Color color;
    public char glyph;

    // AI
    public boolean alerted = false;
    public int alertRange;

    // Visual
    public float px, py;

    public Enemy(int tx, int ty, Type type, String name, int hp, int atk, int def,
                 int xpR, int goldR, int alertRange, Color color, char glyph) {
        super(tx, ty, name, hp);
        this.type       = type;
        this.attack     = atk;
        this.defense    = def;
        this.xpReward   = xpR;
        this.goldReward = goldR;
        this.alertRange = alertRange;
        this.color      = color;
        this.glyph      = glyph;
        this.px = tx;
        this.py = ty;
    }

    public int rollAttack() {
        return attack + (int)(Math.random() * 3);
    }
}
