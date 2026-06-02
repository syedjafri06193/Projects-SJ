package dungeon.world;

import java.awt.*;

public enum Tile {
    WALL        (new Color(30, 28, 50),   new Color(55, 50, 80),  false),
    FLOOR       (new Color(55, 48, 65),   new Color(70, 62, 82),  true),
    CORRIDOR    (new Color(45, 40, 58),   new Color(60, 54, 72),  true),
    DOOR        (new Color(120, 80, 40),  new Color(150, 100, 55),true),
    STAIRS_DOWN (new Color(80, 160, 200), new Color(100, 190, 230),true),
    VOID        (new Color(10, 8, 18),    new Color(10, 8, 18),   false);

    public final Color base, highlight;
    public final boolean walkable;

    Tile(Color base, Color highlight, boolean walkable) {
        this.base = base;
        this.highlight = highlight;
        this.walkable = walkable;
    }
}
