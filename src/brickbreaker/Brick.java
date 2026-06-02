package brickbreaker;

import java.awt.*;

public class Brick {
    public static final int WIDTH  = 60;
    public static final int HEIGHT = 22;
    public static final int GAP    = 5;

    public enum Type {
        NORMAL(1), TOUGH(2), SUPER(3), UNBREAKABLE(-1);

        final int maxHealth;
        Type(int h) { maxHealth = h; }
    }

    private int x, y;
    private int health;
    private Type type;
    private boolean destroyed = false;
    private float flashTimer = 0;

    // Colors per type / health
    private static final Color[][] COLORS = {
        { new Color(90, 200, 100) },                                      // NORMAL
        { new Color(255, 140, 40), new Color(240, 80, 60) },              // TOUGH
        { new Color(180, 80, 220), new Color(130, 50, 190), new Color(80, 30, 150) }, // SUPER
        { new Color(60, 70, 90) }                                         // UNBREAKABLE
    };

    public Brick(int x, int y, Type type) {
        this.x    = x;
        this.y    = y;
        this.type = type;
        this.health = (type == Type.UNBREAKABLE) ? Integer.MAX_VALUE : type.maxHealth;
    }

    /** Returns true if brick was destroyed by this hit */
    public boolean hit() {
        if (type == Type.UNBREAKABLE) { flashTimer = 0.3f; return false; }
        health--;
        flashTimer = 0.15f;
        if (health <= 0) { destroyed = true; return true; }
        return false;
    }

    public void update(double dt) {
        if (flashTimer > 0) flashTimer -= dt;
    }

    public boolean isDestroyed() { return destroyed; }
    public Rectangle getBounds() { return new Rectangle(x, y, WIDTH, HEIGHT); }
    public int getPoints() {
        return switch (type) {
            case NORMAL -> 10;
            case TOUGH  -> 20;
            case SUPER  -> 50;
            default     -> 0;
        };
    }

    public void draw(Graphics2D g) {
        Color base = getBaseColor();
        if (flashTimer > 0) {
            base = base.brighter().brighter();
        }

        // Shadow
        g.setColor(new Color(0, 0, 0, 50));
        g.fillRoundRect(x + 2, y + 3, WIDTH, HEIGHT, 6, 6);

        // Body
        GradientPaint gp = new GradientPaint(
            x, y, base.brighter(),
            x, y + HEIGHT, base.darker()
        );
        g.setPaint(gp);
        g.fillRoundRect(x, y, WIDTH, HEIGHT, 6, 6);

        // Crack overlay for damaged bricks
        if (type != Type.UNBREAKABLE && health < type.maxHealth) {
            g.setColor(new Color(0, 0, 0, 80));
            int cx = x + WIDTH / 2;
            int cy = y + HEIGHT / 2;
            g.setStroke(new BasicStroke(1.5f));
            g.drawLine(cx - 5, cy - 4, cx + 3, cy + 4);
            g.drawLine(cx + 3, cy + 4, cx + 6, cy + 1);
            g.drawLine(cx - 5, cy - 4, cx - 8, cy - 1);
            g.setStroke(new BasicStroke(1f));
        }

        // Shine
        g.setColor(new Color(255, 255, 255, 60));
        g.fillRoundRect(x + 3, y + 2, WIDTH - 6, HEIGHT / 2 - 2, 4, 4);

        // Border
        g.setColor(new Color(255, 255, 255, 40));
        g.drawRoundRect(x, y, WIDTH, HEIGHT, 6, 6);

        // Health pips for multi-health bricks
        if (type == Type.UNBREAKABLE) {
            g.setColor(new Color(150, 160, 180));
            g.setFont(new Font("Monospaced", Font.BOLD, 10));
            FontMetrics fm = g.getFontMetrics();
            String label = "■■■";
            g.drawString(label, x + (WIDTH - fm.stringWidth(label)) / 2, y + HEIGHT / 2 + fm.getAscent() / 2 - 2);
        }
    }

    private Color getBaseColor() {
        int ti = type.ordinal();
        Color[] arr = COLORS[ti];
        if (type == Type.UNBREAKABLE) return arr[0];
        int idx = type.maxHealth - health;
        return arr[Math.min(idx, arr.length - 1)];
    }
}
