package brickbreaker;

import java.awt.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class ParticleSystem {
    private final List<Particle> particles = new ArrayList<>();
    private final Random rand = new Random();

    public void spawnBrickExplosion(int bx, int by, Color color) {
        for (int i = 0; i < 14; i++) {
            double angle = rand.nextDouble() * Math.PI * 2;
            double speed = 1.5 + rand.nextDouble() * 4.0;
            particles.add(new Particle(
                bx + Brick.WIDTH / 2.0,
                by + Brick.HEIGHT / 2.0,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                color,
                0.5f + rand.nextFloat() * 0.5f
            ));
        }
    }

    public void update(double dt) {
        particles.removeIf(p -> { p.update(dt); return p.isDead(); });
    }

    public void draw(Graphics2D g) {
        for (Particle p : particles) p.draw(g);
    }

    // -------- inner class --------
    private static class Particle {
        double x, y, dx, dy;
        float life, maxLife;
        int size;
        Color color;

        Particle(double x, double y, double dx, double dy, Color color, float life) {
            this.x = x; this.y = y;
            this.dx = dx; this.dy = dy;
            this.color = color;
            this.life = this.maxLife = life;
            this.size = 3 + (int)(Math.random() * 5);
        }

        void update(double dt) {
            x += dx;
            y += dy;
            dy += 0.15; // gravity
            life -= dt;
        }

        boolean isDead() { return life <= 0; }

        void draw(Graphics2D g) {
            float alpha = Math.max(0, life / maxLife);
            Color c = new Color(
                color.getRed(), color.getGreen(), color.getBlue(),
                (int)(255 * alpha)
            );
            g.setColor(c);
            g.fillRect((int) x - size / 2, (int) y - size / 2, size, size);
        }
    }
}
