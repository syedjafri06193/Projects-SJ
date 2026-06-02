import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.awt.geom.*;
import java.util.Random;

/**
 * Pong Game in Java
 *
 * Teaches:
 *  - 2D movement with velocity vectors
 *  - Collision detection (AABB & edge)
 *  - Simple AI opponent (paddle tracking with lag)
 *  - Game loop via javax.swing.Timer
 *  - Rendering with double-buffering via JPanel
 *
 * Controls:
 *  W / S  → move your paddle (left side)
 *  ENTER  → start / restart
 */
public class Pong extends JPanel implements ActionListener, KeyListener {

    // ─── Constants ────────────────────────────────────────────────────────────
    static final int WIDTH       = 900;
    static final int HEIGHT      = 600;
    static final int PADDLE_W    = 14;
    static final int PADDLE_H    = 90;
    static final int BALL_SIZE   = 14;
    static final int PADDLE_SPEED = 6;
    static final int WIN_SCORE   = 7;
    static final int TICK_MS     = 16;   // ~60 fps

    // AI difficulty: fraction of ball speed the AI moves each tick (0-1)
    static final double AI_REACTION = 0.072;

    // ─── Game state ───────────────────────────────────────────────────────────
    enum State { WAITING, PLAYING, PAUSED, GAME_OVER }
    State state = State.WAITING;

    // Ball
    double ballX, ballY;
    double ballVX, ballVY;
    double ballSpeed = 5.5;

    // Paddles  (stored as doubles for smooth AI movement)
    double playerY, aiY;
    int playerScore, aiScore;

    // Input
    boolean upHeld, downHeld;

    // Misc
    Random rng = new Random();
    Timer timer;
    String winnerText = "";

    // ─── Fonts & Colors ───────────────────────────────────────────────────────
    static final Color BG        = new Color(10, 10, 18);
    static final Color NET_COLOR = new Color(255, 255, 255, 40);
    static final Color BALL_CLR  = new Color(255, 240, 80);
    static final Color PLAYER_C  = new Color(80, 200, 255);
    static final Color AI_COLOR  = new Color(255, 100, 120);
    static final Color TEXT_CLR  = Color.WHITE;

    Font scoreFont;
    Font labelFont;
    Font titleFont;

    // ─── Constructor ──────────────────────────────────────────────────────────
    public Pong() {
        setPreferredSize(new Dimension(WIDTH, HEIGHT));
        setBackground(BG);
        setFocusable(true);
        addKeyListener(this);

        scoreFont = new Font("Courier New", Font.BOLD, 64);
        labelFont = new Font("Courier New", Font.PLAIN, 18);
        titleFont = new Font("Courier New", Font.BOLD, 28);

        resetPositions();

        timer = new Timer(TICK_MS, this);
        timer.start();
    }

    // ─── Reset helpers ────────────────────────────────────────────────────────
    void resetPositions() {
        ballX  = WIDTH  / 2.0 - BALL_SIZE / 2.0;
        ballY  = HEIGHT / 2.0 - BALL_SIZE / 2.0;
        playerY = HEIGHT / 2.0 - PADDLE_H / 2.0;
        aiY     = HEIGHT / 2.0 - PADDLE_H / 2.0;
        launchBall();
    }

    void launchBall() {
        // Random angle between 30° and 60° (and mirrored) in a random direction
        double angle = Math.toRadians(30 + rng.nextInt(30));
        double dx = Math.cos(angle) * ballSpeed;
        double dy = Math.sin(angle) * ballSpeed;
        ballVX = rng.nextBoolean() ? dx : -dx;
        ballVY = rng.nextBoolean() ? dy : -dy;
    }

    void fullReset() {
        playerScore = 0;
        aiScore     = 0;
        resetPositions();
        state = State.PLAYING;
    }

    // ─── Game Loop ────────────────────────────────────────────────────────────
    @Override
    public void actionPerformed(ActionEvent e) {
        if (state == State.PLAYING) {
            update();
        }
        repaint();
    }

    void update() {
        // --- Player paddle ---
        if (upHeld)   playerY -= PADDLE_SPEED;
        if (downHeld) playerY += PADDLE_SPEED;
        playerY = clamp(playerY, 0, HEIGHT - PADDLE_H);

        // --- AI paddle (tracks ball center with reaction lag) ---
        double ballCenterY = ballY + BALL_SIZE / 2.0;
        double aiCenterY   = aiY   + PADDLE_H / 2.0;
        double diff = ballCenterY - aiCenterY;
        // Move AI by a fraction of the gap each frame (simulates human lag)
        aiY += diff * AI_REACTION * (ballSpeed / 5.5);
        aiY  = clamp(aiY, 0, HEIGHT - PADDLE_H);

        // --- Ball movement ---
        ballX += ballVX;
        ballY += ballVY;

        // Top / bottom wall bounce
        if (ballY <= 0) {
            ballY  = 0;
            ballVY = Math.abs(ballVY);
        }
        if (ballY + BALL_SIZE >= HEIGHT) {
            ballY  = HEIGHT - BALL_SIZE;
            ballVY = -Math.abs(ballVY);
        }

        // --- Paddle collisions ---
        // Player paddle (left side)
        Rectangle playerRect = new Rectangle(20, (int) playerY, PADDLE_W, PADDLE_H);
        Rectangle ballRect   = new Rectangle((int) ballX, (int) ballY, BALL_SIZE, BALL_SIZE);

        if (ballRect.intersects(playerRect) && ballVX < 0) {
            ballVX = Math.abs(ballVX);
            // Add spin based on hit position relative to paddle center
            double hitPos = (ballY + BALL_SIZE / 2.0) - (playerY + PADDLE_H / 2.0);
            ballVY = hitPos * 0.18;
            normalizeBallSpeed();
            ballX = 20 + PADDLE_W + 1;
        }

        // AI paddle (right side)
        Rectangle aiRect = new Rectangle(WIDTH - 20 - PADDLE_W, (int) aiY, PADDLE_W, PADDLE_H);
        if (ballRect.intersects(aiRect) && ballVX > 0) {
            ballVX = -Math.abs(ballVX);
            double hitPos = (ballY + BALL_SIZE / 2.0) - (aiY + PADDLE_H / 2.0);
            ballVY = hitPos * 0.18;
            normalizeBallSpeed();
            ballX = WIDTH - 20 - PADDLE_W - BALL_SIZE - 1;
        }

        // --- Scoring ---
        if (ballX + BALL_SIZE < 0) {          // AI scores
            aiScore++;
            checkWin("AI");
        } else if (ballX > WIDTH) {            // Player scores
            playerScore++;
            checkWin("YOU");
        }
    }

    /** Keep ball speed constant regardless of spin-induced velocity changes */
    void normalizeBallSpeed() {
        double speed = Math.sqrt(ballVX * ballVX + ballVY * ballVY);
        ballSpeed = Math.min(ballSpeed + 0.2, 12.0); // speed up slightly each rally
        ballVX = (ballVX / speed) * ballSpeed;
        ballVY = (ballVY / speed) * ballSpeed;
    }

    void checkWin(String who) {
        if (playerScore >= WIN_SCORE || aiScore >= WIN_SCORE) {
            winnerText = who.equals("YOU") ? "YOU WIN!" : "AI WINS!";
            state = State.GAME_OVER;
        } else {
            // Short pause then relaunch
            state = State.PAUSED;
            Timer pauseTimer = new Timer(700, ev -> {
                resetPositions();
                ballSpeed = 5.5;
                state = State.PLAYING;
            });
            pauseTimer.setRepeats(false);
            pauseTimer.start();
        }
    }

    // ─── Rendering ────────────────────────────────────────────────────────────
    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2 = (Graphics2D) g;
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        // Background
        g2.setColor(BG);
        g2.fillRect(0, 0, WIDTH, HEIGHT);

        // Centre net
        g2.setColor(NET_COLOR);
        int dash = 14;
        for (int y = 0; y < HEIGHT; y += dash * 2) {
            g2.fillRect(WIDTH / 2 - 2, y, 4, dash);
        }

        // Scores
        g2.setFont(scoreFont);
        g2.setColor(PLAYER_C.darker());
        drawCentred(g2, String.valueOf(playerScore), WIDTH / 4, 90);
        g2.setColor(AI_COLOR.darker());
        drawCentred(g2, String.valueOf(aiScore), 3 * WIDTH / 4, 90);

        // Paddles
        drawPaddle(g2, 20, (int) playerY, PLAYER_C);
        drawPaddle(g2, WIDTH - 20 - PADDLE_W, (int) aiY, AI_COLOR);

        // Ball
        drawBall(g2);

        // Labels
        g2.setFont(labelFont);
        g2.setColor(new Color(255, 255, 255, 120));
        g2.drawString("YOU", 28, HEIGHT - 20);
        g2.drawString("AI",  WIDTH - 40, HEIGHT - 20);

        // Overlays
        if (state == State.WAITING) {
            drawOverlay(g2, "PONG", "Press ENTER to start", "W / S to move your paddle");
        } else if (state == State.GAME_OVER) {
            drawOverlay(g2, winnerText, "Press ENTER to play again", "First to " + WIN_SCORE + " wins");
        }
    }

    void drawPaddle(Graphics2D g2, int x, int y, Color color) {
        // Glow
        g2.setColor(new Color(color.getRed(), color.getGreen(), color.getBlue(), 40));
        g2.fillRoundRect(x - 4, y - 4, PADDLE_W + 8, PADDLE_H + 8, 12, 12);
        // Body
        g2.setColor(color);
        g2.fillRoundRect(x, y, PADDLE_W, PADDLE_H, 8, 8);
    }

    void drawBall(Graphics2D g2) {
        int bx = (int) ballX, by = (int) ballY;
        // Glow
        g2.setColor(new Color(255, 240, 80, 50));
        g2.fillOval(bx - 5, by - 5, BALL_SIZE + 10, BALL_SIZE + 10);
        // Core
        g2.setColor(BALL_CLR);
        g2.fillOval(bx, by, BALL_SIZE, BALL_SIZE);
    }

    void drawOverlay(Graphics2D g2, String title, String sub1, String sub2) {
        // Dim background
        g2.setColor(new Color(0, 0, 0, 160));
        g2.fillRect(0, 0, WIDTH, HEIGHT);

        g2.setFont(titleFont);
        g2.setColor(Color.WHITE);
        drawCentred(g2, title, WIDTH / 2, HEIGHT / 2 - 30);

        g2.setFont(labelFont);
        g2.setColor(new Color(200, 200, 200));
        drawCentred(g2, sub1, WIDTH / 2, HEIGHT / 2 + 20);
        drawCentred(g2, sub2, WIDTH / 2, HEIGHT / 2 + 50);
    }

    void drawCentred(Graphics2D g2, String text, int cx, int cy) {
        FontMetrics fm = g2.getFontMetrics();
        int x = cx - fm.stringWidth(text) / 2;
        g2.drawString(text, x, cy);
    }

    // ─── Key handling ─────────────────────────────────────────────────────────
    @Override public void keyPressed(KeyEvent e) {
        int k = e.getKeyCode();
        if (k == KeyEvent.VK_W || k == KeyEvent.VK_UP)    upHeld   = true;
        if (k == KeyEvent.VK_S || k == KeyEvent.VK_DOWN)  downHeld = true;
        if (k == KeyEvent.VK_ENTER) {
            if (state == State.WAITING || state == State.GAME_OVER) fullReset();
        }
    }
    @Override public void keyReleased(KeyEvent e) {
        int k = e.getKeyCode();
        if (k == KeyEvent.VK_W || k == KeyEvent.VK_UP)    upHeld   = false;
        if (k == KeyEvent.VK_S || k == KeyEvent.VK_DOWN)  downHeld = false;
    }
    @Override public void keyTyped(KeyEvent e) {}

    // ─── Utility ──────────────────────────────────────────────────────────────
    static double clamp(double v, double lo, double hi) {
        return Math.max(lo, Math.min(hi, v));
    }

    // ─── Entry point ──────────────────────────────────────────────────────────
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            JFrame frame = new JFrame("Pong");
            frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
            frame.setResizable(false);
            Pong game = new Pong();
            frame.add(game);
            frame.pack();
            frame.setLocationRelativeTo(null);
            frame.setVisible(true);
            game.requestFocusInWindow();
        });
    }
}
