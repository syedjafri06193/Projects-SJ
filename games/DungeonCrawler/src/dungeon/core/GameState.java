package dungeon.core;

import dungeon.entity.Player;
import dungeon.ui.MessageLog;
import dungeon.util.FogOfWar;
import dungeon.world.Level;

public class GameState {
    public enum Screen { TITLE, PLAYING, DEAD, WIN }

    public Screen screen = Screen.TITLE;
    public Player player;
    public Level  level;
    public FogOfWar fog;
    public MessageLog log = new MessageLog();

    public static final int MAX_FLOOR = 10;
    public static final int COLS = 60;
    public static final int ROWS = 40;

    public GameState() {
        newGame();
    }

    public void newGame() {
        player = new Player();
        log    = new MessageLog();
        screen = Screen.TITLE;
    }

    public void startFloor(int floor) {
        player.floor = floor;
        long seed = System.nanoTime() ^ (floor * 0x9e3779b9L);
        level = new Level(floor, COLS, ROWS, seed);
        fog   = new FogOfWar(COLS, ROWS);

        int ts = dungeon.ui.DungeonRenderer.TILE;
        player.teleportTo(level.spawnX, level.spawnY, ts);
        updateFog();
        log.add("--- Floor " + floor + " ---");
        screen = Screen.PLAYING;
    }

    public void updateFog() {
        boolean[][] walls = new boolean[ROWS][COLS];
        for (int y = 0; y < ROWS; y++)
            for (int x = 0; x < COLS; x++)
                walls[y][x] = !level.tileAt(x, y).walkable;
        fog.compute(player.tx, player.ty, walls);
    }
}
