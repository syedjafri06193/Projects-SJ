package dungeon.util;

public class FogOfWar {
    private final boolean[][] explored;
    private final boolean[][] visible;
    private final int cols, rows;
    private static final int SIGHT_RADIUS = 7;

    public FogOfWar(int cols, int rows) {
        this.cols = cols; this.rows = rows;
        explored = new boolean[rows][cols];
        visible  = new boolean[rows][cols];
    }

    /** Recompute visibility from player position using simple radius + line-of-sight */
    public void compute(int px, int py, boolean[][] walls) {
        // Clear visible
        for (boolean[] row : visible) java.util.Arrays.fill(row, false);

        // Cast rays in a circle
        for (int angle = 0; angle < 360; angle += 2) {
            double rad = Math.toRadians(angle);
            double dx  = Math.cos(rad);
            double dy  = Math.sin(rad);

            double rx = px + 0.5, ry = py + 0.5;
            for (int step = 0; step < SIGHT_RADIUS; step++) {
                int tx = (int) rx, ty = (int) ry;
                if (tx < 0 || ty < 0 || tx >= cols || ty >= rows) break;
                setVisible(tx, ty);
                if (walls[ty][tx]) break;  // blocked
                rx += dx; ry += dy;
            }
        }
    }

    private void setVisible(int x, int y) {
        visible[y][x]  = true;
        explored[y][x] = true;
    }

    public boolean isVisible(int x, int y) {
        if (x < 0 || y < 0 || x >= cols || y >= rows) return false;
        return visible[y][x];
    }

    public boolean isExplored(int x, int y) {
        if (x < 0 || y < 0 || x >= cols || y >= rows) return false;
        return explored[y][x];
    }
}
