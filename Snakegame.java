import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.awt.geom.*;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Random;

/**
 * Snake Game — Grid-based
 *
 * Compile:  javac SnakeGame.java
 * Run:      java SnakeGame
 *
 * Controls: Arrow Keys or WASD  — Move
 *           P or SPACE          — Pause / Resume
 *           R                   — Restart after Game Over
 */
public class SnakeGame extends JFrame {

    // ── Constants ──────────────────────────────────────────────────────────────
    private static final int COLS        = 25;
    private static final int ROWS        = 25;
    private static final int CELL        = 24;        // pixels per cell
    private static final int HUD_HEIGHT  = 70;
    private static final int W           = COLS * CELL;
    private static final int H           = ROWS * CELL + HUD_HEIGHT;
    private static final int INITIAL_MS  = 120;       // starting tick ms
    private static final int MIN_MS      = 50;        // fastest tick
    private static final int SPEED_STEP  = 5;         // ms faster per 5 pts

    // ── Palette ────────────────────────────────────────────────────────────────
    private static final Color BG          = new Color(0x0D0D0D);
    private static final Color GRID_COLOR  = new Color(0x1A1A2E);
    private static final Color HUD_BG      = new Color(0x0A0A0A);
    private static final Color SNAKE_HEAD  = new Color(0x39FF14);   // neon green
    private static final Color SNAKE_BODY  = new Color(0x00C853);
    private static final Color SNAKE_TAIL  = new Color(0x00701A);
    private static final Color FOOD_COLOR  = new Color(0xFF3860);   // vivid red
    private static final Color FOOD_GLOW   = new Color(0xFF, 0x38, 0x60, 100);
    private static final Color TEXT_COLOR  = new Color(0xEEEEEE);
    private static final Color ACCENT      = new Color(0x39FF14);
    private static final Color DIM         = new Color(0x555555);
    private static final Color OVERLAY_BG  = new Color(0x00, 0x00, 0x00, 200);

    // ── Direction ──────────────────────────────────────────────────────────────
    enum Dir { UP, DOWN, LEFT, RIGHT;
        boolean isOpposite(Dir o) {
            return (this == UP   && o == DOWN)  || (this == DOWN  && o == UP)
                || (this == LEFT && o == RIGHT) || (this == RIGHT && o == LEFT);
        }
    }

    // ── Game state ─────────────────────────────────────────────────────────────
    private final Deque<Point> snake   = new ArrayDeque<>();
    private Point              food    = new Point();
    private Dir                dir     = Dir.RIGHT;
    private Dir                nextDir = Dir.RIGHT;
    private int                score   = 0;
    private int                highScore = 0;
    private boolean            paused  = false;
    private boolean            gameOver = false;
    private boolean            started = false;      // show intro until first move
    private final Random       rng     = new Random();
    private Timer              ticker;
    private int                tickMs  = INITIAL_MS;
    private long               foodPulse = 0;        // for pulsing food animation

    // ── Canvas ─────────────────────────────────────────────────────────────────
    private final GamePanel panel;

    // ══════════════════════════════════════════════════════════════════════════
    public SnakeGame() {
        super("SNAKE");
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setResizable(false);

        panel = new GamePanel();
        add(panel);

        setSize(W, H);
        setLocationRelativeTo(null);
        setVisible(true);

        setupKeyBindings();
        initGame();
    }

    // ── Initialise / restart ──────────────────────────────────────────────────
    private void initGame() {
        snake.clear();
        // Spawn snake in the middle facing right, length 3
        int midR = ROWS / 2, midC = COLS / 2;
        snake.addFirst(new Point(midC, midR));
        snake.addFirst(new Point(midC + 1, midR));
        snake.addFirst(new Point(midC + 2, midR));

        dir     = Dir.RIGHT;
        nextDir = Dir.RIGHT;
        score   = 0;
        paused  = false;
        gameOver = false;
        tickMs  = INITIAL_MS;

        spawnFood();

        if (ticker != null) ticker.stop();
        ticker = new Timer(tickMs, e -> tick());
        ticker.start();
        started = false;
    }

    // ── Game loop tick ────────────────────────────────────────────────────────
    private void tick() {
        if (paused || gameOver || !started) {
            panel.repaint();
            return;
        }

        dir = nextDir;
        Point head = snake.peekFirst();
        assert head != null;
        Point next = new Point(head.x + dx(dir), head.y + dy(dir));

        // Wall collision
        if (next.x < 0 || next.x >= COLS || next.y < 0 || next.y >= ROWS) {
            triggerGameOver();
            return;
        }

        // Self collision (ignore tail — it will move away)
        int idx = 0;
        for (Point p : snake) {
            if (idx++ == snake.size() - 1) break;   // tail moves away
            if (p.equals(next)) { triggerGameOver(); return; }
        }

        snake.addFirst(next);
        foodPulse++;

        if (next.equals(food)) {
            score++;
            if (score > highScore) highScore = score;
            spawnFood();
            adjustSpeed();
            // Don't remove tail — snake grows
        } else {
            snake.removeLast();
        }

        panel.repaint();
    }

    private void triggerGameOver() {
        gameOver = true;
        ticker.stop();
        panel.repaint();
    }

    private void spawnFood() {
        Point f;
        do {
            f = new Point(rng.nextInt(COLS), rng.nextInt(ROWS));
        } while (snake.contains(f));
        food = f;
        foodPulse = 0;
    }

    private void adjustSpeed() {
        int newMs = INITIAL_MS - (score / 5) * SPEED_STEP;
        newMs = Math.max(newMs, MIN_MS);
        if (newMs != tickMs) {
            tickMs = newMs;
            ticker.setDelay(tickMs);
        }
    }

    // ── Key bindings ──────────────────────────────────────────────────────────
    private void setupKeyBindings() {
        panel.setFocusable(true);
        panel.requestFocusInWindow();

        InputMap  im = panel.getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW);
        ActionMap am = panel.getActionMap();

        bindKey(im, am, KeyEvent.VK_UP,     "UP",    () -> tryDir(Dir.UP));
        bindKey(im, am, KeyEvent.VK_DOWN,   "DOWN",  () -> tryDir(Dir.DOWN));
        bindKey(im, am, KeyEvent.VK_LEFT,   "LEFT",  () -> tryDir(Dir.LEFT));
        bindKey(im, am, KeyEvent.VK_RIGHT,  "RIGHT", () -> tryDir(Dir.RIGHT));
        bindKey(im, am, 'W', "W", () -> tryDir(Dir.UP));
        bindKey(im, am, 'S', "S", () -> tryDir(Dir.DOWN));
        bindKey(im, am, 'A', "A", () -> tryDir(Dir.LEFT));
        bindKey(im, am, 'D', "D", () -> tryDir(Dir.RIGHT));
        bindKey(im, am, 'P', "P", this::togglePause);
        bindKey(im, am, KeyEvent.VK_SPACE, "SPC", this::togglePause);
        bindKey(im, am, 'R', "R", () -> { if (gameOver) initGame(); });
    }

    private void bindKey(InputMap im, ActionMap am, int key, String name, Runnable action) {
        im.put(KeyStroke.getKeyStroke(key, 0), name);
        am.put(name, new AbstractAction() {
            public void actionPerformed(ActionEvent e) { action.run(); }
        });
    }

    private void bindKey(InputMap im, ActionMap am, char key, String name, Runnable action) {
        bindKey(im, am, (int) Character.toUpperCase(key), name, action);
    }

    private void tryDir(Dir d) {
        if (!started) started = true;
        if (!d.isOpposite(dir)) nextDir = d;
        if (gameOver) return;
        if (paused) { paused = false; if (!ticker.isRunning()) ticker.start(); }
    }

    private void togglePause() {
        if (!started || gameOver) return;
        paused = !paused;
        panel.repaint();
    }

    // ── Direction helpers ─────────────────────────────────────────────────────
    private int dx(Dir d) { return d == Dir.LEFT ? -1 : d == Dir.RIGHT ? 1 : 0; }
    private int dy(Dir d) { return d == Dir.UP   ? -1 : d == Dir.DOWN  ? 1 : 0; }

    // ══════════════════════════════════════════════════════════════════════════
    // GamePanel — all rendering
    // ══════════════════════════════════════════════════════════════════════════
    private class GamePanel extends JPanel {

        private Font fontHud, fontBig, fontMed, fontSm;

        GamePanel() {
            setPreferredSize(new Dimension(W, H));
            setBackground(BG);
            try {
                // Use monospaced built-in fonts for a retro feel
                fontHud = new Font("Courier New", Font.BOLD, 18);
                fontBig = new Font("Courier New", Font.BOLD, 42);
                fontMed = new Font("Courier New", Font.BOLD, 22);
                fontSm  = new Font("Courier New", Font.PLAIN, 14);
            } catch (Exception ex) {
                fontHud = fontBig = fontMed = fontSm = getFont();
            }
        }

        @Override
        protected void paintComponent(Graphics g0) {
            super.paintComponent(g0);
            Graphics2D g = (Graphics2D) g0;
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING,      RenderingHints.VALUE_ANTIALIAS_ON);
            g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING,  RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

            drawHUD(g);

            // Push coordinate system down below HUD
            g.translate(0, HUD_HEIGHT);
            drawGrid(g);
            drawFood(g);
            drawSnake(g);
            g.translate(0, -HUD_HEIGHT);

            // Overlays
            if (!started && !gameOver) drawIntroOverlay(g);
            if (paused)               drawPauseOverlay(g);
            if (gameOver)             drawGameOverOverlay(g);
        }

        // ── HUD ───────────────────────────────────────────────────────────────
        private void drawHUD(Graphics2D g) {
            g.setColor(HUD_BG);
            g.fillRect(0, 0, W, HUD_HEIGHT);

            // Accent line at bottom of HUD
            g.setColor(ACCENT);
            g.fillRect(0, HUD_HEIGHT - 2, W, 2);

            // Score
            g.setFont(fontSm);
            g.setColor(DIM);
            drawString(g, "SCORE", 24, 22);
            drawString(g, "BEST",  W / 2 - 20, 22);

            g.setFont(fontHud);
            g.setColor(TEXT_COLOR);
            drawString(g, String.valueOf(score),     24, 50);
            g.setColor(ACCENT);
            drawString(g, String.valueOf(highScore), W / 2 - 20, 50);

            // Speed indicator (small)
            g.setFont(fontSm);
            g.setColor(DIM);
            String spd = "SPD " + (int) Math.round((INITIAL_MS - tickMs) / (double)(INITIAL_MS - MIN_MS) * 100) + "%";
            drawStringRight(g, spd, W - 20, 22);

            // Mini snake icon  (decorative)
            g.setColor(ACCENT);
            int bx = W - 80, by = 38;
            for (int i = 0; i < 4; i++) g.fillRoundRect(bx + i * 10, by, 8, 8, 3, 3);
            g.setColor(SNAKE_HEAD);
            g.fillRoundRect(bx + 40, by, 8, 8, 3, 3);
        }

        // ── Grid ──────────────────────────────────────────────────────────────
        private void drawGrid(Graphics2D g) {
            g.setColor(BG);
            g.fillRect(0, 0, W, ROWS * CELL);
            g.setColor(GRID_COLOR);
            for (int c = 0; c <= COLS; c++) g.drawLine(c * CELL, 0, c * CELL, ROWS * CELL);
            for (int r = 0; r <= ROWS; r++) g.drawLine(0, r * CELL, W, r * CELL);
        }

        // ── Food ──────────────────────────────────────────────────────────────
        private void drawFood(Graphics2D g) {
            double pulse = Math.sin(foodPulse * 0.18) * 0.5 + 0.5;   // 0..1
            int margin = (int)(3 - pulse * 2);
            int x = food.x * CELL + margin;
            int y = food.y * CELL + margin;
            int sz = CELL - margin * 2;

            // Glow
            int glowR = (int)(CELL * 0.9 + pulse * 4);
            RadialGradientPaint glow = new RadialGradientPaint(
                food.x * CELL + CELL / 2f,
                food.y * CELL + CELL / 2f,
                glowR,
                new float[]{0f, 1f},
                new Color[]{FOOD_GLOW, new Color(0, 0, 0, 0)}
            );
            g.setPaint(glow);
            g.fillOval(food.x * CELL + CELL / 2 - glowR,
                       food.y * CELL + CELL / 2 - glowR,
                       glowR * 2, glowR * 2);

            // Food body
            g.setColor(FOOD_COLOR);
            g.fillRoundRect(x, y, sz, sz, 6, 6);

            // Shine
            g.setColor(new Color(255, 255, 255, 80));
            g.fillOval(x + sz / 5, y + sz / 6, sz / 3, sz / 4);
        }

        // ── Snake ─────────────────────────────────────────────────────────────
        private void drawSnake(Graphics2D g) {
            if (snake.isEmpty()) return;
            int total = snake.size();
            int idx   = 0;

            for (Point p : snake) {
                float t = (float) idx / total;          // 0=head, 1=tail

                Color segColor;
                if (idx == 0) {
                    segColor = SNAKE_HEAD;
                } else {
                    // Interpolate body → tail color
                    segColor = blend(SNAKE_BODY, SNAKE_TAIL, t);
                }

                int margin = (idx == 0) ? 1 : 2;
                int x  = p.x * CELL + margin;
                int y  = p.y * CELL + margin;
                int sz = CELL - margin * 2;

                g.setColor(segColor);
                g.fillRoundRect(x, y, sz, sz, 5, 5);

                // Head eyes
                if (idx == 0) {
                    drawEyes(g, p, dir);
                }
                idx++;
            }
        }

        private void drawEyes(Graphics2D g, Point p, Dir d) {
            int cx = p.x * CELL + CELL / 2;
            int cy = p.y * CELL + CELL / 2;
            int eyeSize = 4;
            int eDist = 4;

            int[] ex = new int[2], ey = new int[2];
            switch (d) {
                case RIGHT -> { ex[0]=cx+eDist; ey[0]=cy-eDist; ex[1]=cx+eDist; ey[1]=cy+eDist; }
                case LEFT  -> { ex[0]=cx-eDist; ey[0]=cy-eDist; ex[1]=cx-eDist; ey[1]=cy+eDist; }
                case UP    -> { ex[0]=cx-eDist; ey[0]=cy-eDist; ex[1]=cx+eDist; ey[1]=cy-eDist; }
                case DOWN  -> { ex[0]=cx-eDist; ey[0]=cy+eDist; ex[1]=cx+eDist; ey[1]=cy+eDist; }
            }
            g.setColor(Color.BLACK);
            for (int i = 0; i < 2; i++) g.fillOval(ex[i]-eyeSize/2, ey[i]-eyeSize/2, eyeSize, eyeSize);
            g.setColor(Color.WHITE);
            for (int i = 0; i < 2; i++) g.fillOval(ex[i]-eyeSize/2+1, ey[i]-eyeSize/2, 2, 2);
        }

        // ── Overlays ─────────────────────────────────────────────────────────
        private void drawIntroOverlay(Graphics2D g) {
            g.setColor(OVERLAY_BG);
            g.fillRect(0, HUD_HEIGHT, W, H - HUD_HEIGHT);

            g.setFont(fontBig);
            g.setColor(ACCENT);
            drawCenteredString(g, "SNAKE", W / 2, HUD_HEIGHT + (H - HUD_HEIGHT) / 2 - 50);

            g.setFont(fontMed);
            g.setColor(TEXT_COLOR);
            drawCenteredString(g, "Press any arrow key to start", W / 2, HUD_HEIGHT + (H - HUD_HEIGHT) / 2 + 10);

            g.setFont(fontSm);
            g.setColor(DIM);
            drawCenteredString(g, "WASD or Arrow Keys  ·  P = Pause", W / 2, HUD_HEIGHT + (H - HUD_HEIGHT) / 2 + 42);
        }

        private void drawPauseOverlay(Graphics2D g) {
            g.setColor(OVERLAY_BG);
            g.fillRect(0, HUD_HEIGHT, W, H - HUD_HEIGHT);

            g.setFont(fontBig);
            g.setColor(ACCENT);
            drawCenteredString(g, "PAUSED", W / 2, HUD_HEIGHT + (H - HUD_HEIGHT) / 2 - 10);

            g.setFont(fontSm);
            g.setColor(DIM);
            drawCenteredString(g, "Press P or SPACE to resume", W / 2, HUD_HEIGHT + (H - HUD_HEIGHT) / 2 + 34);
        }

        private void drawGameOverOverlay(Graphics2D g) {
            g.setColor(OVERLAY_BG);
            g.fillRect(0, HUD_HEIGHT, W, H - HUD_HEIGHT);

            // Flicker-style red title
            g.setFont(fontBig);
            g.setColor(new Color(0xFF3860));
            drawCenteredString(g, "GAME OVER", W / 2, HUD_HEIGHT + (H - HUD_HEIGHT) / 2 - 50);

            g.setFont(fontMed);
            g.setColor(TEXT_COLOR);
            drawCenteredString(g, "Score: " + score, W / 2, HUD_HEIGHT + (H - HUD_HEIGHT) / 2 + 5);

            if (score == highScore && score > 0) {
                g.setColor(ACCENT);
                drawCenteredString(g, "✦ New High Score! ✦", W / 2, HUD_HEIGHT + (H - HUD_HEIGHT) / 2 + 35);
            }

            g.setFont(fontSm);
            g.setColor(DIM);
            drawCenteredString(g, "Press R to restart", W / 2, HUD_HEIGHT + (H - HUD_HEIGHT) / 2 + 68);
        }

        // ── Helpers ───────────────────────────────────────────────────────────
        private void drawString(Graphics2D g, String s, int x, int y) {
            g.drawString(s, x, y);
        }

        private void drawStringRight(Graphics2D g, String s, int x, int y) {
            FontMetrics fm = g.getFontMetrics();
            g.drawString(s, x - fm.stringWidth(s), y);
        }

        private void drawCenteredString(Graphics2D g, String s, int cx, int y) {
            FontMetrics fm = g.getFontMetrics();
            g.drawString(s, cx - fm.stringWidth(s) / 2, y);
        }

        private Color blend(Color a, Color b, float t) {
            return new Color(
                (int)(a.getRed()   + (b.getRed()   - a.getRed())   * t),
                (int)(a.getGreen() + (b.getGreen() - a.getGreen()) * t),
                (int)(a.getBlue()  + (b.getBlue()  - a.getBlue())  * t)
            );
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    public static void main(String[] args) {
        SwingUtilities.invokeLater(SnakeGame::new);
    }
}