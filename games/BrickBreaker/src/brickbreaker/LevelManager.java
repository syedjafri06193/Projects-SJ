package brickbreaker;

import java.util.ArrayList;
import java.util.List;

/**
 * Generates brick layouts for each level.
 * Add new levels by adding cases to buildLevel().
 */
public class LevelManager {
    public static final int TOTAL_LEVELS = 6;

    private final int panelWidth;
    private static final int TOP_OFFSET = 80;

    public LevelManager(int panelWidth) {
        this.panelWidth = panelWidth;
    }

    public List<Brick> buildLevel(int level) {
        return switch (level) {
            case 1 -> simpleGrid(5, 8, Brick.Type.NORMAL);
            case 2 -> mixedGrid(6, 9);
            case 3 -> diamondPattern();
            case 4 -> fortress();
            case 5 -> checkerboard();
            case 6 -> gauntlet();
            default -> gauntlet(); // repeat last for endless
        };
    }

    // ---- Level layouts ------------------------------------------------

    private List<Brick> simpleGrid(int rows, int cols, Brick.Type type) {
        List<Brick> bricks = new ArrayList<>();
        int totalW = cols * (Brick.WIDTH + Brick.GAP) - Brick.GAP;
        int startX = (panelWidth - totalW) / 2;
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                int x = startX + c * (Brick.WIDTH + Brick.GAP);
                int y = TOP_OFFSET + r * (Brick.HEIGHT + Brick.GAP);
                bricks.add(new Brick(x, y, type));
            }
        }
        return bricks;
    }

    private List<Brick> mixedGrid(int rows, int cols) {
        List<Brick> bricks = new ArrayList<>();
        int totalW = cols * (Brick.WIDTH + Brick.GAP) - Brick.GAP;
        int startX = (panelWidth - totalW) / 2;
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                Brick.Type t = (r == 0) ? Brick.Type.TOUGH : Brick.Type.NORMAL;
                if (r == 0 && c % 3 == 1) t = Brick.Type.SUPER;
                int x = startX + c * (Brick.WIDTH + Brick.GAP);
                int y = TOP_OFFSET + r * (Brick.HEIGHT + Brick.GAP);
                bricks.add(new Brick(x, y, t));
            }
        }
        return bricks;
    }

    private List<Brick> diamondPattern() {
        List<Brick> bricks = new ArrayList<>();
        int cols = 9, rows = 7;
        int totalW = cols * (Brick.WIDTH + Brick.GAP) - Brick.GAP;
        int startX = (panelWidth - totalW) / 2;
        int cx = cols / 2;
        int cr = rows / 2;
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (Math.abs(r - cr) + Math.abs(c - cx) <= 3) {
                    Brick.Type t = (Math.abs(r - cr) + Math.abs(c - cx) == 0)
                        ? Brick.Type.SUPER : Brick.Type.TOUGH;
                    bricks.add(new Brick(
                        startX + c * (Brick.WIDTH + Brick.GAP),
                        TOP_OFFSET + r * (Brick.HEIGHT + Brick.GAP), t));
                } else if (Math.abs(r - cr) + Math.abs(c - cx) <= 5) {
                    bricks.add(new Brick(
                        startX + c * (Brick.WIDTH + Brick.GAP),
                        TOP_OFFSET + r * (Brick.HEIGHT + Brick.GAP), Brick.Type.NORMAL));
                }
            }
        }
        return bricks;
    }

    private List<Brick> fortress() {
        List<Brick> bricks = new ArrayList<>();
        int cols = 9, rows = 6;
        int totalW = cols * (Brick.WIDTH + Brick.GAP) - Brick.GAP;
        int startX = (panelWidth - totalW) / 2;
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                boolean isWall = (c == 0 || c == cols - 1 || r == 0);
                boolean isCenter = (r > 1 && r < rows - 1 && c > 1 && c < cols - 2);
                Brick.Type t = isWall ? Brick.Type.UNBREAKABLE
                    : isCenter ? Brick.Type.SUPER : Brick.Type.TOUGH;
                bricks.add(new Brick(
                    startX + c * (Brick.WIDTH + Brick.GAP),
                    TOP_OFFSET + r * (Brick.HEIGHT + Brick.GAP), t));
            }
        }
        return bricks;
    }

    private List<Brick> checkerboard() {
        List<Brick> bricks = new ArrayList<>();
        int cols = 9, rows = 7;
        int totalW = cols * (Brick.WIDTH + Brick.GAP) - Brick.GAP;
        int startX = (panelWidth - totalW) / 2;
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if ((r + c) % 2 == 0) {
                    Brick.Type t = (r % 4 == 0) ? Brick.Type.TOUGH : Brick.Type.NORMAL;
                    bricks.add(new Brick(
                        startX + c * (Brick.WIDTH + Brick.GAP),
                        TOP_OFFSET + r * (Brick.HEIGHT + Brick.GAP), t));
                }
            }
        }
        return bricks;
    }

    private List<Brick> gauntlet() {
        List<Brick> bricks = new ArrayList<>();
        int cols = 9, rows = 8;
        int totalW = cols * (Brick.WIDTH + Brick.GAP) - Brick.GAP;
        int startX = (panelWidth - totalW) / 2;
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                Brick.Type t;
                if (r < 2) t = Brick.Type.UNBREAKABLE;
                else if (r < 4) t = Brick.Type.SUPER;
                else if (r < 6) t = Brick.Type.TOUGH;
                else            t = Brick.Type.NORMAL;
                bricks.add(new Brick(
                    startX + c * (Brick.WIDTH + Brick.GAP),
                    TOP_OFFSET + r * (Brick.HEIGHT + Brick.GAP), t));
            }
        }
        return bricks;
    }
}
