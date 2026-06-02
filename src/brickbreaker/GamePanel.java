package brickbreaker;

import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class GamePanel extends JPanel implements ActionListener {

    // ---- Constants ----
    public static final int WIDTH  = 680;
    public static final int HEIGHT = 720;
    private static final int FPS   = 60;

    // ---- Game state ----
    private enum State { TITLE, PLAYING, PAUSED, LEVEL_CLEAR, GAME_OVER, WIN }
    private State state = State.TITLE;

    private Ball         ball;
    private Paddle       paddle;
    private List<Brick>  bricks   = new ArrayList<>();
    private ParticleSystem particles = new ParticleSystem();
    private LevelManager levelManager;

    private int level  = 1;
    private int lives  = 3;
    private int score  = 0;
    private int hiScore = 0;

    private long lastTime;
    private final Timer gameTimer;
    private float transitionAlpha = 0f; // for level-clear overlay fade

    // ---- Constructor ----
    public GamePanel() {
        setPreferredSize(new Dimension(WIDTH, HEIGHT));
        setBackground(new Color(10, 10, 25));
        setFocusable(true);

        levelManager = new LevelManager(WIDTH);

        gameTimer = new Timer(1000 / FPS, this);
        gameTimer.start();
        lastTime = System.nanoTime();

        addKeyListener(new KeyAdapter() {
            @Override public void keyPressed(KeyEvent e)  { handleKey(e, true);  }
            @Override public void keyReleased(KeyEvent e) { handleKey(e, false); }
        });
    }

    // ---- Input ----
    private void handleKey(KeyEvent e, boolean pressed) {
        int k = e.getKeyCode();

        if (!pressed) {
            if (k == KeyEvent.VK_LEFT  || k == KeyEvent.VK_A) paddle.setMovingLeft(false);
            if (k == KeyEvent.VK_RIGHT || k == KeyEvent.VK_D) paddle.setMovingRight(false);
            return;
        }

        switch (state) {
            case TITLE -> {
                if (k == KeyEvent.VK_ENTER || k == KeyEvent.VK_SPACE) startGame();
            }
            case PLAYING -> {
                if (k == KeyEvent.VK_LEFT  || k == KeyEvent.VK_A) paddle.setMovingLeft(true);
                if (k == KeyEvent.VK_RIGHT || k == KeyEvent.VK_D) paddle.setMovingRight(true);
                if (k == KeyEvent.VK_P || k == KeyEvent.VK_ESCAPE)  state = State.PAUSED;
            }
            case PAUSED -> {
                if (k == KeyEvent.VK_P || k == KeyEvent.VK_ESCAPE || k == KeyEvent.VK_ENTER)
                    state = State.PLAYING;
            }
            case LEVEL_CLEAR -> {
                if (transitionAlpha >= 1f && (k == KeyEvent.VK_ENTER || k == KeyEvent.VK_SPACE))
                    nextLevel();
            }
            case GAME_OVER, WIN -> {
                if (k == KeyEvent.VK_ENTER || k == KeyEvent.VK_SPACE || k == KeyEvent.VK_R)
                    resetGame();
            }
        }
    }

    // ---- Game lifecycle ----
    private void startGame() {
        level = 1; lives = 3; score = 0;
        loadLevel();
        state = State.PLAYING;
    }

    private void resetGame() {
        startGame();
    }

    private void loadLevel() {
        bricks = levelManager.buildLevel(level);
        resetBallAndPaddle();
        transitionAlpha = 0f;
    }

    private void resetBallAndPaddle() {
        paddle = new Paddle(WIDTH, HEIGHT);
        ball   = new Ball(WIDTH / 2, paddle.getY() - Ball.SIZE - 4);
        ball.setSpeedFactor(1.0 + (level - 1) * 0.12);
        particles = new ParticleSystem();
    }

    private void nextLevel() {
        if (level >= LevelManager.TOTAL_LEVELS) {
            state = State.WIN;
        } else {
            level++;
            loadLevel();
            state = State.PLAYING;
        }
    }

    // ---- Game loop ----
    @Override
    public void actionPerformed(ActionEvent e) {
        long now = System.nanoTime();
        double dt = (now - lastTime) / 1_000_000_000.0;
        lastTime  = now;
        dt = Math.min(dt, 0.05); // cap for window dragging

        if (state == State.PLAYING)    update(dt);
        if (state == State.LEVEL_CLEAR) transitionAlpha = Math.min(1f, transitionAlpha + (float)(dt * 1.5));

        repaint();
    }

    private void update(double dt) {
        paddle.update(WIDTH);
        ball.update();
        particles.update(dt);

        // Bricks update (flash timer)
        for (Brick b : bricks) b.update(dt);

        // Wall collisions
        if (ball.getX() <= 0) {
            ball.setX(0);
            ball.bounceX();
        } else if (ball.getX() + Ball.SIZE >= WIDTH) {
            ball.setX(WIDTH - Ball.SIZE);
            ball.bounceX();
        }
        if (ball.getY() <= 0) {
            ball.setY(0);
            ball.bounceY();
        }

        // Ball lost
        if (ball.getY() > HEIGHT) {
            lives--;
            if (lives <= 0) {
                if (score > hiScore) hiScore = score;
                state = State.GAME_OVER;
            } else {
                resetBallAndPaddle();
            }
            return;
        }

        // Paddle collision
        CollisionDetector.Side paddleSide =
            CollisionDetector.getBallHitSide(ball, paddle.getBounds());
        if (paddleSide != CollisionDetector.Side.NONE) {
            ball.reflectOffPaddle(paddle);
            ball.setY(paddle.getY() - Ball.SIZE - 1);
        }

        // Brick collisions
        Iterator<Brick> it = bricks.iterator();
        while (it.hasNext()) {
            Brick brick = it.next();
            if (brick.isDestroyed()) { it.remove(); continue; }

            CollisionDetector.Side side =
                CollisionDetector.getBallHitSide(ball, brick.getBounds());
            if (side != CollisionDetector.Side.NONE) {
                CollisionDetector.applyBounce(ball, side);
                boolean destroyed = brick.hit();
                if (destroyed) {
                    score += brick.getPoints();
                    // spawn particles
                    Color pColor = switch (brick.getBounds().width) { default -> new Color(100,220,120); };
                    // derive color from score tier
                    if (brick.getPoints() >= 50)      pColor = new Color(200, 80, 230);
                    else if (brick.getPoints() >= 20)  pColor = new Color(255, 140, 40);
                    particles.spawnBrickExplosion(brick.getBounds().x, brick.getBounds().y, pColor);
                    it.remove();
                }
                break; // one brick per frame to avoid tunnelling
            }
        }

        // Check level cleared (all non-unbreakable bricks gone)
        boolean anyDestructible = bricks.stream()
            .anyMatch(b -> !b.isDestroyed());
        if (!anyDestructible || bricks.isEmpty()) {
            state = State.LEVEL_CLEAR;
            if (score > hiScore) hiScore = score;
        }
    }

    // ---- Rendering ----
    @Override
    protected void paintComponent(Graphics g0) {
        super.paintComponent(g0);
        Graphics2D g = (Graphics2D) g0;
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING,      RenderingHints.VALUE_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

        drawBackground(g);

        switch (state) {
            case TITLE      -> drawTitle(g);
            case PLAYING,
                 PAUSED,
                 LEVEL_CLEAR -> {
                drawGame(g);
                if (state == State.PAUSED)      drawPause(g);
                if (state == State.LEVEL_CLEAR) drawLevelClear(g);
            }
            case GAME_OVER  -> { drawGame(g); drawGameOver(g); }
            case WIN        -> drawWin(g);
        }
    }

    private void drawBackground(Graphics2D g) {
        // Deep space gradient
        GradientPaint bg = new GradientPaint(0, 0, new Color(8, 10, 28), 0, HEIGHT, new Color(15, 8, 40));
        g.setPaint(bg);
        g.fillRect(0, 0, WIDTH, HEIGHT);

        // Grid lines (subtle)
        g.setColor(new Color(255, 255, 255, 8));
        for (int x = 0; x < WIDTH; x += 40) g.drawLine(x, 0, x, HEIGHT);
        for (int y = 0; y < HEIGHT; y += 40) g.drawLine(0, y, WIDTH, y);
    }

    private void drawGame(Graphics2D g) {
        // HUD
        drawHUD(g);

        // Bricks
        for (Brick b : bricks) b.draw(g);

        // Particles
        particles.draw(g);

        // Ball & paddle
        if (state != State.GAME_OVER) {
            ball.draw(g);
            paddle.draw(g);
        }

        // Side walls
        g.setColor(new Color(50, 80, 120, 60));
        g.fillRect(0, 0, 3, HEIGHT);
        g.fillRect(WIDTH - 3, 0, 3, HEIGHT);
    }

    private void drawHUD(Graphics2D g) {
        // Top bar
        g.setColor(new Color(255, 255, 255, 12));
        g.fillRect(0, 0, WIDTH, 55);
        g.setColor(new Color(100, 180, 255, 40));
        g.drawLine(0, 55, WIDTH, 55);

        g.setFont(new Font("Monospaced", Font.BOLD, 13));

        // Score
        g.setColor(new Color(180, 220, 255));
        g.drawString("SCORE", 20, 20);
        g.setColor(Color.WHITE);
        g.setFont(new Font("Monospaced", Font.BOLD, 20));
        g.drawString(String.format("%06d", score), 20, 42);

        // Hi-score
        g.setFont(new Font("Monospaced", Font.BOLD, 13));
        g.setColor(new Color(180, 220, 255));
        String hi = "BEST";
        int hiX = WIDTH / 2 - 30;
        g.drawString(hi, hiX, 20);
        g.setColor(new Color(255, 220, 80));
        g.setFont(new Font("Monospaced", Font.BOLD, 20));
        g.drawString(String.format("%06d", hiScore), hiX, 42);

        // Level
        g.setFont(new Font("Monospaced", Font.BOLD, 13));
        g.setColor(new Color(180, 220, 255));
        g.drawString("LEVEL", WIDTH - 110, 20);
        g.setColor(Color.WHITE);
        g.setFont(new Font("Monospaced", Font.BOLD, 20));
        g.drawString(level + " / " + LevelManager.TOTAL_LEVELS, WIDTH - 110, 42);

        // Lives (hearts)
        g.setFont(new Font("Dialog", Font.BOLD, 16));
        g.setColor(new Color(255, 80, 100));
        StringBuilder hearts = new StringBuilder();
        for (int i = 0; i < lives; i++) hearts.append("♥ ");
        g.drawString(hearts.toString().trim(), WIDTH / 2 + 60, 38);
    }

    private void drawTitle(Graphics2D g) {
        // Title card
        drawCenteredString(g, "BRICK", new Font("Monospaced", Font.BOLD, 80),
            new Color(80, 180, 255), WIDTH / 2, HEIGHT / 2 - 80);
        drawCenteredString(g, "BREAKER", new Font("Monospaced", Font.BOLD, 80),
            new Color(255, 220, 60), WIDTH / 2, HEIGHT / 2 - 5);

        g.setColor(new Color(160, 200, 255, 180));
        drawCenteredString(g, "Press ENTER or SPACE to start",
            new Font("Monospaced", Font.PLAIN, 16), new Color(160, 200, 255, 180),
            WIDTH / 2, HEIGHT / 2 + 80);

        g.setColor(new Color(120, 140, 180));
        drawCenteredString(g, "← / → or A / D  ·  P = Pause",
            new Font("Monospaced", Font.PLAIN, 13), new Color(120, 140, 180),
            WIDTH / 2, HEIGHT / 2 + 115);

        // Brick legend
        int legendY = HEIGHT / 2 + 170;
        drawLegend(g, legendY);
    }

    private void drawLegend(Graphics2D g, int y) {
        int bw = Brick.WIDTH, bh = Brick.HEIGHT;
        String[] labels = {"NORMAL (10)", "TOUGH (20)", "SUPER (50)", "SOLID"};
        Brick.Type[] types = {Brick.Type.NORMAL, Brick.Type.TOUGH, Brick.Type.SUPER, Brick.Type.UNBREAKABLE};
        int totalW = labels.length * (bw + 14);
        int startX = WIDTH / 2 - totalW / 2;

        g.setFont(new Font("Monospaced", Font.PLAIN, 11));
        for (int i = 0; i < types.length; i++) {
            Brick sample = new Brick(startX + i * (bw + 14), y, types[i]);
            sample.draw(g);
            g.setColor(new Color(180, 200, 230));
            g.drawString(labels[i], startX + i * (bw + 14) - 2, y + bh + 16);
        }
    }

    private void drawPause(Graphics2D g) {
        g.setColor(new Color(0, 0, 0, 140));
        g.fillRect(0, 0, WIDTH, HEIGHT);
        drawCenteredString(g, "PAUSED", new Font("Monospaced", Font.BOLD, 52),
            new Color(100, 200, 255), WIDTH / 2, HEIGHT / 2);
        drawCenteredString(g, "Press P or ESC to resume",
            new Font("Monospaced", Font.PLAIN, 16), new Color(160, 200, 255),
            WIDTH / 2, HEIGHT / 2 + 50);
    }

    private void drawLevelClear(Graphics2D g) {
        int alpha = (int)(transitionAlpha * 160);
        g.setColor(new Color(0, 0, 0, alpha));
        g.fillRect(0, 0, WIDTH, HEIGHT);
        if (transitionAlpha < 0.4f) return;

        float textAlpha = Math.min(1f, (transitionAlpha - 0.3f) / 0.5f);
        int ta = (int)(textAlpha * 255);

        drawCenteredString(g, "LEVEL " + level + " CLEAR!",
            new Font("Monospaced", Font.BOLD, 44),
            new Color(80, 230, 100, ta), WIDTH / 2, HEIGHT / 2 - 30);

        if (level < LevelManager.TOTAL_LEVELS) {
            drawCenteredString(g, "NEXT: LEVEL " + (level + 1),
                new Font("Monospaced", Font.BOLD, 22),
                new Color(180, 220, 255, ta), WIDTH / 2, HEIGHT / 2 + 20);
        }
        if (transitionAlpha >= 1f) {
            drawCenteredString(g, "Press SPACE / ENTER to continue",
                new Font("Monospaced", Font.PLAIN, 15),
                new Color(160, 200, 255, 200), WIDTH / 2, HEIGHT / 2 + 65);
        }
    }

    private void drawGameOver(Graphics2D g) {
        g.setColor(new Color(0, 0, 0, 170));
        g.fillRect(0, 0, WIDTH, HEIGHT);
        drawCenteredString(g, "GAME OVER", new Font("Monospaced", Font.BOLD, 56),
            new Color(255, 70, 70), WIDTH / 2, HEIGHT / 2 - 30);
        drawCenteredString(g, "Score: " + score,
            new Font("Monospaced", Font.BOLD, 22), Color.WHITE, WIDTH / 2, HEIGHT / 2 + 20);
        drawCenteredString(g, "Press ENTER or R to retry",
            new Font("Monospaced", Font.PLAIN, 15), new Color(160, 200, 255),
            WIDTH / 2, HEIGHT / 2 + 60);
    }

    private void drawWin(Graphics2D g) {
        drawBackground(g);
        drawCenteredString(g, "YOU WIN!", new Font("Monospaced", Font.BOLD, 64),
            new Color(255, 220, 60), WIDTH / 2, HEIGHT / 2 - 60);
        drawCenteredString(g, "Final Score: " + score,
            new Font("Monospaced", Font.BOLD, 26), Color.WHITE, WIDTH / 2, HEIGHT / 2 + 10);
        drawCenteredString(g, "Best: " + hiScore,
            new Font("Monospaced", Font.BOLD, 18), new Color(255, 200, 60),
            WIDTH / 2, HEIGHT / 2 + 45);
        drawCenteredString(g, "Press ENTER to play again",
            new Font("Monospaced", Font.PLAIN, 15), new Color(160, 200, 255),
            WIDTH / 2, HEIGHT / 2 + 90);
    }

    // ---- Utility ----
    private void drawCenteredString(Graphics2D g, String s, Font font, Color color, int cx, int cy) {
        g.setFont(font);
        g.setColor(color);
        FontMetrics fm = g.getFontMetrics();
        g.drawString(s, cx - fm.stringWidth(s) / 2, cy);
    }
}
