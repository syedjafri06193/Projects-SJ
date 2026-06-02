package dungeon.entity;

import java.awt.Color;
import java.util.Random;

public class Item {
    public enum Type { HEALTH_POTION, STRENGTH_POTION, SHIELD_POTION, GOLD }

    public int tx, ty;
    public Type type;
    public String name;
    public int value;
    public Color color;
    public char glyph;

    public Item(int tx, int ty, Type type, String name, int value, Color color, char glyph) {
        this.tx = tx; this.ty = ty;
        this.type = type; this.name = name;
        this.value = value; this.color = color; this.glyph = glyph;
    }
}

