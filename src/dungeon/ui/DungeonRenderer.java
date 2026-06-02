package dungeon.ui;

import dungeon.core.GameState;
import dungeon.entity.*;
import dungeon.util.FogOfWar;
import dungeon.world.*;

import java.awt.*;
import java.awt.geom.*;
import java.util.List;

public class DungeonRenderer {
    public static final int TILE  = 20;
    public static final int PANEL_W = 42;  // tiles
    public static final int PANEL_H = 32;  // tiles
    public static final int HUD_H   = 120;
    public static final int WIDTH   = PANEL_W * TILE;
    public static final int HEIGHT  = PANEL_H * TILE + HUD_H;

    private static final Font GLYPH_FONT  = new Font("Monospaced", Font.BOLD, 15);
    private static final Font HUD_FONT    = new Font("Monospaced", Font.BOLD, 13);
    private static final Font HUD_BIG     = new Font("Monospaced", Font.BOLD, 16);
    private static final Font LOG_FONT    = new Font("Monospaced", Font.PLAIN, 11);
    private static final Font TITLE_FONT  = new Font("Monospaced", Font.BOLD, 48);
    private static final Font SUB_FONT    = new Font("Monospaced", Font.PLAIN, 16);

    public void render(Graphics2D g, GameState state) {
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

        switch (state.screen) {
            case TITLE    -> drawTitle(g, state);
            case PLAYING  -> drawGame(g, state);
            case DEAD     -> drawDead(g, state);
            case WIN      -> drawWin(g, state);
        }
    }

    // ---- Game ----

    private void drawGame(Graphics2D g, GameState state) {
        Level  level = state.level;
        Player player = state.player;
        FogOfWar fog  = state.fog;

        // Camera offset so player is centered
        int camX = (int)(player.px) - WIDTH  / 2 + TILE / 2;
        int camY = (int)(player.py) - PANEL_H * TILE / 2 + TILE / 2;

        // Background
        g.setColor(new Color(10, 8, 18));
        g.fillRect(0, 0, WIDTH, HEIGHT);

        // ---- Tiles ----
        for (int ty = 0; ty < level.rows; ty++) {
            for (int tx = 0; tx < level.cols; tx++) {
                if (!fog.isExplored(tx, ty)) continue;
                boolean vis = fog.isVisible(tx, ty);
                Tile tile = level.tileAt(tx, ty);

                int sx = tx * TILE - camX;
                int sy = ty * TILE - camY;
                if (sx < -TILE || sy < -TILE || sx > WIDTH || sy > PANEL_H * TILE) continue;

                Color base = vis ? tile.highlight : dim(tile.base, 0.4f);
                g.setColor(base);
                g.fillRect(sx, sy, TILE, TILE);

                // Grid line for floors
                if (vis && tile != Tile.WALL) {
                    g.setColor(new Color(0, 0, 0, 30));
                    g.drawRect(sx, sy, TILE - 1, TILE - 1);
                }

                // Stairs glyph
                if (tile == Tile.STAIRS_DOWN && vis) {
                    g.setFont(GLYPH_FONT);
                    g.setColor(new Color(150, 240, 255));
                    g.drawString(">", sx + 4, sy + 15);
                }
            }
        }

        // ---- Items ----
        for (Item item : level.items) {
            if (!fog.isVisible(item.tx, item.ty)) continue;
            int sx = item.tx * TILE - camX;
            int sy = item.ty * TILE - camY;
            drawGlyph(g, item.glyph, item.color, sx, sy);
        }

        // ---- Enemies ----
        for (Enemy enemy : level.enemies) {
            if (!enemy.isAlive()) continue;
            if (!fog.isVisible(enemy.tx, enemy.ty)) continue;
            int sx = (int)(enemy.px * TILE) - camX;
            int sy = (int)(enemy.py * TILE) - camY;

            // Enemy bg circle
            g.setColor(new Color(enemy.color.getRed(), enemy.color.getGreen(),
                enemy.color.getBlue(), 50));
            g.fillOval(sx + 2, sy + 2, TILE - 4, TILE - 4);

            drawGlyph(g, enemy.glyph, enemy.color, sx, sy);

            // HP bar
            float hpPct = (float) enemy.hp / enemy.maxHp;
            g.setColor(new Color(180, 30, 30));
            g.fillRect(sx, sy - 3, TILE, 3);
            g.setColor(hpColor(hpPct));
            g.fillRect(sx, sy - 3, (int)(TILE * hpPct), 3);
        }

        // ---- Player ----
        int psx = (int)player.px - camX;
        int psy = (int)player.py - camY;

        // Glow
        g.setColor(new Color(100, 180, 255, 40));
        g.fillOval(psx - 4, psy - 4, TILE + 8, TILE + 8);
        drawGlyph(g, '@', new Color(120, 200, 255), psx, psy);

        // ---- HUD ----
        drawHUD(g, state);
    }

    private void drawHUD(Graphics2D g, GameState state) {
        Player p = state.player;
        int hy = PANEL_H * TILE;

        // HUD background
        g.setColor(new Color(15, 12, 28));
        g.fillRect(0, hy, WIDTH, HUD_H);
        g.setColor(new Color(60, 50, 100));
        g.drawLine(0, hy, WIDTH, hy);

        // ---- Stats column ----
        int col1 = 12, col2 = 200, col3 = 380;

        // Name + level
        g.setFont(HUD_BIG);
        g.setColor(new Color(120, 200, 255));
        g.drawString("[ " + p.name + " ]", col1, hy + 22);
        g.setColor(new Color(200, 180, 100));
        g.drawString("Lv." + p.level + "  Floor " + p.floor, col1, hy + 40);

        // HP bar
        drawBar(g, col1, hy + 50, 160, 12,
            (float)p.hp / p.maxHp, new Color(200, 50, 80), new Color(60, 20, 30),
            "HP " + p.hp + "/" + p.maxHp);

        // XP bar
        drawBar(g, col1, hy + 68, 160, 10,
            (float)p.xp / p.xpToNext, new Color(80, 180, 255), new Color(20, 40, 80),
            "XP " + p.xp + "/" + p.xpToNext);

        // Stats
        g.setFont(HUD_FONT);
        g.setColor(new Color(180, 160, 220));
        g.drawString("ATK:" + p.attack + "  DEF:" + p.defense + "  GOLD:" + p.gold, col1, hy + 96);

        // ---- Log column ----
        List<String> msgs = state.log.recent(6);
        int ly = hy + 18;
        g.setFont(LOG_FONT);
        for (int i = 0; i < msgs.size(); i++) {
            float alpha = 1f - i * 0.15f;
            int a = Math.max(60, (int)(255 * alpha));
            g.setColor(new Color(180, 200, 180, a));
            g.drawString(msgs.get(i), col2, ly + i * 16);
        }

        // ---- Controls reminder ----
        g.setFont(LOG_FONT);
        g.setColor(new Color(80, 70, 110));
        g.drawString("WASD/Arrows:Move  >:Stairs  Esc:Quit", col3, hy + 110);
    }

    private void drawBar(Graphics2D g, int x, int y, int w, int h,
                         float pct, Color fill, Color bg, String label) {
        g.setColor(bg);
        g.fillRoundRect(x, y, w, h, 4, 4);
        g.setColor(fill);
        g.fillRoundRect(x, y, (int)(w * Math.max(0, pct)), h, 4, 4);
        g.setColor(new Color(255, 255, 255, 120));
        g.drawRoundRect(x, y, w, h, 4, 4);
        g.setFont(new Font("Monospaced", Font.PLAIN, 10));
        g.setColor(Color.WHITE);
        g.drawString(label, x + 4, y + h - 2);
    }

    private void drawGlyph(Graphics2D g, char ch, Color color, int sx, int sy) {
        g.setFont(GLYPH_FONT);
        g.setColor(color);
        FontMetrics fm = g.getFontMetrics();
        g.drawString(String.valueOf(ch),
            sx + (TILE - fm.charWidth(ch)) / 2,
            sy + (TILE + fm.getAscent() - fm.getDescent()) / 2 - 1);
    }

    // ---- Screens ----

    private void drawTitle(Graphics2D g, GameState state) {
        g.setColor(new Color(10, 8, 22));
        g.fillRect(0, 0, WIDTH, HEIGHT);

        // Decorative grid
        g.setColor(new Color(30, 25, 50));
        for (int x = 0; x < WIDTH; x += 20) g.drawLine(x, 0, x, HEIGHT);
        for (int y = 0; y < HEIGHT; y += 20) g.drawLine(0, y, WIDTH, y);

        drawCenter(g, "DUNGEON", TITLE_FONT, new Color(80, 160, 255), WIDTH / 2, HEIGHT / 2 - 70);
        drawCenter(g, "CRAWLER", TITLE_FONT, new Color(200, 80, 255), WIDTH / 2, HEIGHT / 2 - 20);

        drawCenter(g, "Procedurally generated • Enemy scaling • 10 floors",
            SUB_FONT, new Color(140, 120, 180), WIDTH / 2, HEIGHT / 2 + 40);
        drawCenter(g, "Press ENTER to descend into darkness",
            SUB_FONT, new Color(100, 200, 120), WIDTH / 2, HEIGHT / 2 + 80);
        drawCenter(g, "WASD / Arrow Keys to move",
            new Font("Monospaced", Font.PLAIN, 13), new Color(80, 80, 120), WIDTH / 2, HEIGHT / 2 + 110);
    }

    private void drawDead(Graphics2D g, GameState state) {
        g.setColor(new Color(20, 5, 5));
        g.fillRect(0, 0, WIDTH, HEIGHT);

        drawCenter(g, "YOU DIED", TITLE_FONT, new Color(200, 40, 40), WIDTH / 2, HEIGHT / 2 - 60);
        drawCenter(g, "Floor " + state.player.floor + "  •  Level " + state.player.level +
            "  •  " + state.player.gold + " gold", SUB_FONT, new Color(180, 100, 100), WIDTH / 2, HEIGHT / 2);
        drawCenter(g, "Press ENTER to try again",
            SUB_FONT, new Color(150, 100, 100), WIDTH / 2, HEIGHT / 2 + 50);
    }

    private void drawWin(Graphics2D g, GameState state) {
        g.setColor(new Color(5, 18, 5));
        g.fillRect(0, 0, WIDTH, HEIGHT);

        drawCenter(g, "VICTORIOUS!", TITLE_FONT, new Color(80, 230, 100), WIDTH / 2, HEIGHT / 2 - 60);
        drawCenter(g, "You escaped the dungeon!", SUB_FONT, new Color(150, 240, 160), WIDTH / 2, HEIGHT / 2);
        drawCenter(g, "Level " + state.player.level + "  •  " + state.player.gold + " gold collected",
            SUB_FONT, new Color(220, 200, 60), WIDTH / 2, HEIGHT / 2 + 40);
        drawCenter(g, "Press ENTER to play again",
            SUB_FONT, new Color(100, 180, 100), WIDTH / 2, HEIGHT / 2 + 90);
    }

    // ---- Util ----

    private void drawCenter(Graphics2D g, String s, Font f, Color c, int cx, int cy) {
        g.setFont(f);
        g.setColor(c);
        FontMetrics fm = g.getFontMetrics();
        g.drawString(s, cx - fm.stringWidth(s) / 2, cy);
    }

    private Color dim(Color c, float factor) {
        return new Color(
            (int)(c.getRed()   * factor),
            (int)(c.getGreen() * factor),
            (int)(c.getBlue()  * factor));
    }

    private Color hpColor(float pct) {
        if (pct > 0.6f) return new Color(60, 200, 80);
        if (pct > 0.3f) return new Color(220, 180, 40);
        return new Color(220, 50, 50);
    }
}
