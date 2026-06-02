package dungeon.combat;

import dungeon.entity.Enemy;
import dungeon.entity.Player;
import dungeon.world.Level;

import java.util.*;

public class EnemyAI {

    /**
     * Move all living enemies for this turn.
     * Enemies alert when player is within range, then BFS toward them.
     */
    public static void takeTurns(Level level, Player player, List<String> log) {
        for (Enemy enemy : level.enemies) {
            if (!enemy.isAlive()) continue;

            int dist = Math.abs(enemy.tx - player.tx) + Math.abs(enemy.ty - player.ty);

            // Alert check
            if (dist <= enemy.alertRange) enemy.alerted = true;
            if (!enemy.alerted) continue;

            // Adjacent = attack
            if (dist == 1) {
                CombatResolver.Result r = CombatResolver.enemyAttack(enemy, player);
                log.add(r.log());
                continue;
            }

            // BFS step toward player
            int[] step = bfsStep(level, enemy.tx, enemy.ty, player.tx, player.ty);
            if (step != null) {
                int nx = step[0], ny = step[1];
                // Don't walk into another enemy
                if (level.enemyAt(nx, ny) == null) {
                    enemy.tx = nx;
                    enemy.ty = ny;
                }
            }
        }
    }

    /** Returns the next tile step toward (gx,gy), or null if unreachable */
    private static int[] bfsStep(Level level, int sx, int sy, int gx, int gy) {
        if (sx == gx && sy == gy) return null;
        int cols = level.cols, rows = level.rows;
        int[][] prev = new int[rows * cols][2];
        for (int[] p : prev) { p[0] = -1; p[1] = -1; }

        Queue<int[]> queue = new LinkedList<>();
        boolean[] visited = new boolean[rows * cols];

        int startIdx = sy * cols + sx;
        visited[startIdx] = true;
        queue.add(new int[]{sx, sy});

        int[] dx = {0,0,-1,1};
        int[] dy = {-1,1,0,0};

        while (!queue.isEmpty()) {
            int[] cur = queue.poll();
            int cx = cur[0], cy = cur[1];
            if (cx == gx && cy == gy) {
                // Trace back to first step
                int idx = cy * cols + cx;
                while (prev[idx][0] != sx || prev[idx][1] != sy) {
                    int px = prev[idx][0], py2 = prev[idx][1];
                    idx = py2 * cols + px;
                }
                return new int[]{cx == gx && cy == gy ? prev[gy * cols + gx][0] : cx,
                                  cx == gx && cy == gy ? prev[gy * cols + gx][1] : cy};
            }
            for (int d = 0; d < 4; d++) {
                int nx = cx + dx[d], ny = cy + dy[d];
                int nIdx = ny * cols + nx;
                if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
                if (visited[nIdx]) continue;
                if (!level.isWalkable(nx, ny)) continue;
                visited[nIdx] = true;
                prev[nIdx][0] = cx;
                prev[nIdx][1] = cy;
                queue.add(new int[]{nx, ny});
            }
        }
        return null;
    }
}
