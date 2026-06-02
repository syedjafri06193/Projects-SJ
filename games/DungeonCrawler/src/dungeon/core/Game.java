package dungeon.core;

import dungeon.combat.*;
import dungeon.entity.*;
import dungeon.ui.DungeonRenderer;
import dungeon.world.*;

import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.util.ArrayList;
import java.util.List;

public class Game extends JPanel implements ActionListener {

    private final GameState state = new GameState();
    private final DungeonRenderer renderer = new DungeonRenderer();
    private final Timer ticker;

    private static final float MOVE_SPEED = 4f;
    private static final int TILE = DungeonRenderer.TILE;

    public Game() {
        setPreferredSize(new Dimension(DungeonRenderer.WIDTH, DungeonRenderer.HEIGHT));
        setBackground(Color.BLACK);
        setFocusable(true);
        ticker = new Timer(16, this);
        addKeyListener(new KeyAdapter() {
            @Override public void keyPressed(KeyEvent e) { handleKey(e); }
        });
    }

    public void start() { ticker.start(); }

    @Override public void actionPerformed(ActionEvent e) {
        smoothMoveEnemies(); smoothMovePlayer(); repaint();
    }

    @Override protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        renderer.render((Graphics2D) g, state);
    }

    private void handleKey(KeyEvent e) {
        int k = e.getKeyCode();
        switch (state.screen) {
            case TITLE -> { if (k == KeyEvent.VK_ENTER || k == KeyEvent.VK_SPACE) state.startFloor(1); }
            case PLAYING -> {
                if (k == KeyEvent.VK_ESCAPE) System.exit(0);
                int dx = 0, dy = 0;
                if (k == KeyEvent.VK_W || k == KeyEvent.VK_UP)    dy = -1;
                if (k == KeyEvent.VK_S || k == KeyEvent.VK_DOWN)   dy =  1;
                if (k == KeyEvent.VK_A || k == KeyEvent.VK_LEFT)   dx = -1;
                if (k == KeyEvent.VK_D || k == KeyEvent.VK_RIGHT)  dx =  1;
                if (k == KeyEvent.VK_PERIOD || k == KeyEvent.VK_GREATER) tryDescend();
                if (dx != 0 || dy != 0) doPlayerTurn(dx, dy);
            }
            case DEAD, WIN -> { if (k == KeyEvent.VK_ENTER || k == KeyEvent.VK_SPACE) { state.newGame(); state.startFloor(1); } }
        }
    }

    private void doPlayerTurn(int dx, int dy) {
        Player player = state.player;
        if (player.moving) return;
        int nx = player.tx + dx, ny = player.ty + dy;
        Enemy enemy = state.level.enemyAt(nx, ny);
        if (enemy != null) {
            List<String> log = new ArrayList<>();
            CombatResolver.Result r = CombatResolver.playerAttack(player, enemy);
            log.add(r.log());
            if (r.killed()) {
                boolean levelUp = player.gainXp(enemy.xpReward);
                player.gold += enemy.goldReward;
                if (levelUp) log.add("LEVEL UP! You are now level " + player.level + "!");
                state.level.removeDeadEnemies();
            }
            state.log.addAll(log);
            enemyTurn();
            return;
        }
        if (state.level.isWalkable(nx, ny)) {
            player.tx = nx; player.ty = ny;
            player.targetPx = nx * TILE; player.targetPy = ny * TILE;
            player.moving = true;
            Item item = state.level.itemAt(nx, ny);
            if (item != null) pickUp(item);
            state.updateFog();
            enemyTurn();
        }
    }

    private void tryDescend() {
        Player p = state.player;
        if (state.level.tileAt(p.tx, p.ty) == Tile.STAIRS_DOWN) {
            if (p.floor >= GameState.MAX_FLOOR) state.screen = GameState.Screen.WIN;
            else { state.log.add("You descend deeper..."); state.startFloor(p.floor + 1); }
        } else { state.log.add("There are no stairs here."); }
    }

    private void pickUp(Item item) {
        Player p = state.player;
        switch (item.type) {
            case HEALTH_POTION   -> { p.heal(item.value);    state.log.add("You drink a health potion (+" + item.value + " HP)."); }
            case STRENGTH_POTION -> { p.attack  += item.value; state.log.add("You feel stronger! (+" + item.value + " ATK)"); }
            case SHIELD_POTION   -> { p.defense += item.value; state.log.add("Your skin hardens! (+" + item.value + " DEF)"); }
            case GOLD            -> { p.gold    += item.value; state.log.add("You collect " + item.value + " gold coins."); }
        }
        state.level.removeItem(item);
    }

    private void enemyTurn() {
        List<String> log = new ArrayList<>();
        EnemyAI.takeTurns(state.level, state.player, log);
        state.log.addAll(log);
        if (!state.player.isAlive()) state.screen = GameState.Screen.DEAD;
    }

    private void smoothMovePlayer() {
        Player p = state.player;
        if (!p.moving) return;
        p.px = lerp(p.px, p.targetPx, 0.3f);
        p.py = lerp(p.py, p.targetPy, 0.3f);
        if (Math.abs(p.px - p.targetPx) < 0.5f && Math.abs(p.py - p.targetPy) < 0.5f) {
            p.px = p.targetPx; p.py = p.targetPy; p.moving = false;
        }
    }

    private void smoothMoveEnemies() {
        if (state.screen != GameState.Screen.PLAYING) return;
        for (Enemy e : state.level.enemies) { e.px = lerp(e.px, e.tx, 0.25f); e.py = lerp(e.py, e.ty, 0.25f); }
    }

    private float lerp(float a, float b, float t) { return a + (b - a) * t; }
}
