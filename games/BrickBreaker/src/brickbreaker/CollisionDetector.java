package brickbreaker;

import java.awt.*;

/**
 * Precise AABB collision detection.
 * Determines which face of a rectangle the ball hit, so we can
 * reflect only the correct velocity component.
 */
public class CollisionDetector {

    public enum Side { NONE, TOP, BOTTOM, LEFT, RIGHT }

    /**
     * Returns which side of {@code target} the ball hit, or NONE if no overlap.
     * Uses the ball's previous position (before the current move) to determine
     * the entry side, avoiding corner-tunnelling artefacts.
     */
    public static Side getBallHitSide(Ball ball, Rectangle target) {
        Rectangle ballRect = ball.getBounds();
        if (!ballRect.intersects(target)) return Side.NONE;

        // Previous position
        double prevX = ball.getX() - ball.getDX();
        double prevY = ball.getY() - ball.getDY();

        // Overlap depths from each direction
        double overlapLeft   = (ballRect.x + ballRect.width)  - target.x;
        double overlapRight  = (target.x + target.width)  - ballRect.x;
        double overlapTop    = (ballRect.y + ballRect.height) - target.y;
        double overlapBottom = (target.y + target.height) - ballRect.y;

        // Smallest penetration axis wins
        double minOverlap = Math.min(Math.min(overlapLeft, overlapRight),
                                     Math.min(overlapTop, overlapBottom));

        if (minOverlap == overlapTop    && ball.getDY() > 0) return Side.TOP;
        if (minOverlap == overlapBottom && ball.getDY() < 0) return Side.BOTTOM;
        if (minOverlap == overlapLeft   && ball.getDX() > 0) return Side.LEFT;
        if (minOverlap == overlapRight  && ball.getDX() < 0) return Side.RIGHT;

        // Fallback: smallest depth
        if (minOverlap == overlapTop)    return Side.TOP;
        if (minOverlap == overlapBottom) return Side.BOTTOM;
        if (minOverlap == overlapLeft)   return Side.LEFT;
        return Side.RIGHT;
    }

    /** Apply velocity bounce based on hit side */
    public static void applyBounce(Ball ball, Side side) {
        switch (side) {
            case TOP, BOTTOM -> ball.bounceY();
            case LEFT, RIGHT -> ball.bounceX();
            default -> {}
        }
    }
}
