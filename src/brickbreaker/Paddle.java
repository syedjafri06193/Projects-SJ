package brickbreaker;

import java.awt.*;

public class Paddle {
    public static final int WIDTH  = 100;
    public static final int HEIGHT = 14;
    private static final int SPEED = 7;

    private int x, y;
    private int width;
    private boolean movingLeft, movingRight;

    public Paddle(int panelWidth, int panelHeight) {
        this.width = WIDTH;
        this.x = panelWidth / 2 - width / 2;
        this.y = panelHeight - 50;
    }

    public void setMovingLeft(boolean v)  { movingLeft  = v; }
    public void setMovingRight(boolean v) { movingRight = v; }

    public void update(int panelWidth) {
        if (movingLeft  && x > 0)                      x -= SPEED;
        if (movingRight && x + width < panelWidth)     x += SPEED;
    }

    public Rectangle getBounds() {
        return new Rectangle(x, y, width, HEIGHT);
    }

    public int getX()      { return x; }
    public int getY()      { return y; }
    public int getWidth()  { return width; }
    public int getHeight() { return HEIGHT; }

    public void draw(Graphics2D g) {
        // Shadow
        g.setColor(new Color(0, 0, 0, 60));
        g.fillRoundRect(x + 3, y + 4, width, HEIGHT, 10, 10);

        // Body gradient
        GradientPaint gp = new GradientPaint(
            x, y, new Color(100, 200, 255),
            x, y + HEIGHT, new Color(30, 100, 200)
        );
        g.setPaint(gp);
        g.fillRoundRect(x, y, width, HEIGHT, 10, 10);

        // Shine
        g.setColor(new Color(255, 255, 255, 80));
        g.fillRoundRect(x + 4, y + 2, width - 8, HEIGHT / 2 - 2, 6, 6);

        // Border
        g.setColor(new Color(150, 230, 255, 200));
        g.setStroke(new BasicStroke(1.5f));
        g.drawRoundRect(x, y, width, HEIGHT, 10, 10);
        g.setStroke(new BasicStroke(1f));
    }
}
