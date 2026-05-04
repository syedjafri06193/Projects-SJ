package dungeon.world;

import java.util.*;

/**
 * BSP (Binary Space Partitioning) dungeon generator.
 * Splits the map recursively, places a room in each leaf,
 * then connects siblings with L-shaped corridors.
 */
public class DungeonGenerator {

    private static final int MIN_LEAF = 10;
    private final int cols, rows;
    private final Random rng;

    private Tile[][] grid;
    private List<Room> rooms;

    public DungeonGenerator(int cols, int rows, long seed) {
        this.cols = cols;
        this.rows = rows;
        this.rng  = new Random(seed);
    }

    public Tile[][] generate() {
        grid  = new Tile[rows][cols];
        rooms = new ArrayList<>();

        // Fill with wall
        for (Tile[] row : grid)
            Arrays.fill(row, Tile.WALL);

        // BSP partition
        Leaf root = new Leaf(1, 1, cols - 2, rows - 2);
        splitLeaf(root);
        createRooms(root);
        connectLeaf(root);

        // Place stairs in last room
        Room last = rooms.get(rooms.size() - 1);
        grid[last.centerY()][last.centerX()] = Tile.STAIRS_DOWN;

        return grid;
    }

    public List<Room> getRooms() { return rooms; }

    // ---- BSP ----

    private void splitLeaf(Leaf leaf) {
        if (leaf.w < MIN_LEAF * 2 && leaf.h < MIN_LEAF * 2) return;

        boolean splitH = (leaf.h > leaf.w * 1.25) ||
            (leaf.w <= leaf.h * 1.25 && rng.nextBoolean());

        int max = (splitH ? leaf.h : leaf.w) - MIN_LEAF;
        if (max <= MIN_LEAF) return;

        int split = rng.nextInt(max - MIN_LEAF) + MIN_LEAF;

        if (splitH) {
            leaf.left  = new Leaf(leaf.x, leaf.y,         leaf.w, split);
            leaf.right = new Leaf(leaf.x, leaf.y + split, leaf.w, leaf.h - split);
        } else {
            leaf.left  = new Leaf(leaf.x,         leaf.y, split,          leaf.h);
            leaf.right = new Leaf(leaf.x + split, leaf.y, leaf.w - split, leaf.h);
        }

        splitLeaf(leaf.left);
        splitLeaf(leaf.right);
    }

    private void createRooms(Leaf leaf) {
        if (leaf.left != null) { createRooms(leaf.left); createRooms(leaf.right); return; }

        int rw = rng.nextInt(Math.max(1, leaf.w - 4)) + 3;
        int rh = rng.nextInt(Math.max(1, leaf.h - 4)) + 3;
        int rx = leaf.x + rng.nextInt(Math.max(1, leaf.w - rw));
        int ry = leaf.y + rng.nextInt(Math.max(1, leaf.h - rh));

        rw = Math.min(rw, cols - rx - 1);
        rh = Math.min(rh, rows - ry - 1);

        Room room = new Room(rx, ry, rw, rh);
        leaf.room = room;
        rooms.add(room);
        carveRoom(room);
    }

    private void connectLeaf(Leaf leaf) {
        if (leaf.left == null) return;
        connectLeaf(leaf.left);
        connectLeaf(leaf.right);

        Room a = leaf.left.getRoom();
        Room b = leaf.right.getRoom();
        if (a != null && b != null)
            carveCorridor(a.centerX(), a.centerY(), b.centerX(), b.centerY());
    }

    // ---- Carving ----

    private void carveRoom(Room r) {
        for (int ty = r.y; ty < r.y + r.h; ty++)
            for (int tx = r.x; tx < r.x + r.w; tx++)
                set(tx, ty, Tile.FLOOR);
    }

    private void carveCorridor(int x1, int y1, int x2, int y2) {
        // L-shaped: horizontal then vertical (or flip randomly)
        if (rng.nextBoolean()) {
            carveH(y1, x1, x2);
            carveV(x2, y1, y2);
        } else {
            carveV(x1, y1, y2);
            carveH(y2, x1, x2);
        }
    }

    private void carveH(int y, int x1, int x2) {
        int lo = Math.min(x1, x2), hi = Math.max(x1, x2);
        for (int x = lo; x <= hi; x++) set(x, y, Tile.CORRIDOR);
    }

    private void carveV(int x, int y1, int y2) {
        int lo = Math.min(y1, y2), hi = Math.max(y1, y2);
        for (int y = lo; y <= hi; y++) set(x, y, Tile.CORRIDOR);
    }

    private void set(int x, int y, Tile t) {
        if (x > 0 && y > 0 && x < cols - 1 && y < rows - 1)
            grid[y][x] = t;
    }

    // ---- Leaf node ----

    private static class Leaf {
        int x, y, w, h;
        Leaf left, right;
        Room room;

        Leaf(int x, int y, int w, int h) { this.x=x; this.y=y; this.w=w; this.h=h; }

        Room getRoom() {
            if (room != null) return room;
            Room a = left  != null ? left.getRoom()  : null;
            Room b = right != null ? right.getRoom() : null;
            if (a == null) return b;
            if (b == null) return a;
            return (new Random().nextBoolean()) ? a : b;
        }
    }
}
