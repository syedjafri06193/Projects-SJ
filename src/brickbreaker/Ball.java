package brickbreaker;

import java.awt.*;

public class Ball {
    public static final int SIZE = 12;

    private double x, y;
    private double dx, dy;
    private final double baseSpeed = 5.0;
    private Color color;

    public Ball(int startX, int startY) {
        this.x = startX - SIZE / 2.0;
        this.y = startY;
        this.dx = baseSpeed;
        this.dy = -baseSpeed;
        this.color = new Color(255, 230, 80);
    }

    public void update() {
        x += dx;
        y += dy;
    }

    public void bounceX() { dx = -dx; }
    public void bounceY() { dy = -dy; }

    /** Redirect ball after paddle hit based on where it hit (offset from center) */
    public void reflectOffPaddle(Paddle paddle) {
        double paddleCenter = paddle.getX() + paddle.getWidth() / 2.0;
        double ballCenter   = x + SIZE / 2.0;
        double offset = (ballCenter - paddleCenter) / (paddle.getWidth() / 2.0); // -1 to 1

        double angle = offset * Math.toRadians(60); // max 60° from vertical
        double speed = Math.hypot(dx, dy);

        dx = speed * Math.sin(angle);
        dy = -Math.abs(dy); // always go up
    }

    /** Increase speed by a small factor each level */
    public void setSpeedFactor(double factor) {
        double speed = baseSpeed * factor;
        double norm  = Math.hypot(dx, dy);
        if (norm == 0) norm = 1;
        dx = dx / norm * speed;
        dy = dy / norm * speed;
    }

    public Rectangle getBounds() {
        return new Rectangle((int) x, (int) y, SIZE, SIZE);
    }

    public double getX() { return x; }
    public double getY() { return y; }
    public void setX(double x) { this.x = x; }
    public void setY(double y) { this.y = y; }
    public double getDX() { return dx; }
    public double getDY() { return dy; }

    public void draw(Graphics2D g) {
        // Glow effect
        g.setColor(new Color(255, 230, 80, 60));
        g.fillOval((int) x - 4, (int) y - 4, SIZE + 8, SIZE + 8);
        g.setColor(new Color(255, 200, 0, 100));
        g.fillOval((int) x - 2, (int) y - 2, SIZE + 4, SIZE + 4);
        // Core
        g.setColor(color);
        g.fillOval((int) x, (int) y, SIZE, SIZE);
        // Highlight
        g.setColor(new Color(255, 255, 200, 180));
        g.fillOval((int) x + 2, (int) y + 2, SIZE / 3, SIZE / 3);
    }
}
