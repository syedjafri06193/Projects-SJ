package dungeon.world;

import java.awt.Rectangle;

public class Room {
    public final int x, y, w, h;

    public Room(int x, int y, int w, int h) {
        this.x = x; this.y = y; this.w = w; this.h = h;
    }

    public int centerX() { return x + w / 2; }
    public int centerY() { return y + h / 2; }

    public boolean intersects(Room other) {
        return new Rectangle(x - 1, y - 1, w + 2, h + 2)
            .intersects(new Rectangle(other.x, other.y, other.w, other.h));
    }

    public boolean contains(int tx, int ty) {
        return tx >= x && tx < x + w && ty >= y && ty < y + h;
    }
}
