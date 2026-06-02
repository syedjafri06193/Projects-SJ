package dungeon.entity;

import java.awt.Color;
import java.util.Random;

public class EnemyFactory {

    /**
     * Creates a scaled enemy for the given floor.
     * Earlier floors spawn weaker types; deeper floors introduce elite variants.
     */
    public static Enemy create(int tx, int ty, int floor, Random rng) {
        // Pick type based on floor range, with weighted randomness
        Enemy.Type type = pickType(floor, rng);

        // Base stats
        int baseHp   = switch (type) {
            case SKELETON -> 8;  case GOBLIN -> 6;  case ORC    -> 14;
            case TROLL    -> 22; case DEMON  -> 30; case DRAGON -> 50;
        };
        int baseAtk  = switch (type) {
            case SKELETON -> 3;  case GOBLIN -> 2;  case ORC    -> 5;
            case TROLL    -> 7;  case DEMON  -> 10; case DRAGON -> 15;
        };
        int baseDef  = switch (type) {
            case SKELETON -> 1;  case GOBLIN -> 0;  case ORC    -> 2;
            case TROLL    -> 3;  case DEMON  -> 4;  case DRAGON -> 6;
        };
        int baseXp   = switch (type) {
            case SKELETON -> 8;  case GOBLIN -> 5;  case ORC    -> 12;
            case TROLL    -> 20; case DEMON  -> 30; case DRAGON -> 60;
        };
        int baseGold = switch (type) {
            case SKELETON -> 2;  case GOBLIN -> 3;  case ORC    -> 5;
            case TROLL    -> 8;  case DEMON  -> 12; case DRAGON -> 25;
        };
        Color color  = switch (type) {
            case SKELETON -> new Color(220, 215, 200);
            case GOBLIN   -> new Color(100, 180, 80);
            case ORC      -> new Color(80, 140, 60);
            case TROLL    -> new Color(100, 120, 80);
            case DEMON    -> new Color(200, 60, 60);
            case DRAGON   -> new Color(220, 100, 20);
        };
        char glyph   = switch (type) {
            case SKELETON -> 's'; case GOBLIN -> 'g'; case ORC    -> 'o';
            case TROLL    -> 'T'; case DEMON  -> 'D'; case DRAGON -> '@';
        };
        String name  = switch (type) {
            case SKELETON -> "Skeleton"; case GOBLIN -> "Goblin";  case ORC    -> "Orc";
            case TROLL    -> "Troll";    case DEMON  -> "Demon";   case DRAGON -> "Dragon";
        };

        // Scale: +10% per floor on hp/atk, small jitter
        float scale = 1f + (floor - 1) * 0.12f;
        int hp   = (int)(baseHp  * scale) + rng.nextInt(3);
        int atk  = (int)(baseAtk * scale) + rng.nextInt(2);
        int def  = (int)(baseDef * scale);
        int xp   = (int)(baseXp  * scale);
        int gold = baseGold + rng.nextInt(4);

        int alertRange = switch (type) {
            case GOBLIN -> 6; case DEMON, DRAGON -> 10; default -> 8;
        };

        return new Enemy(tx, ty, type, name, hp, atk, def, xp, gold, alertRange, color, glyph);
    }

    private static Enemy.Type pickType(int floor, Random rng) {
        // Pool expands with floor depth
        int r = rng.nextInt(100);
        if (floor <= 2)  return (r < 60) ? Enemy.Type.SKELETON : Enemy.Type.GOBLIN;
        if (floor <= 4)  return pickFrom(r, 30, 30, 40, Enemy.Type.SKELETON, Enemy.Type.GOBLIN, Enemy.Type.ORC);
        if (floor <= 6)  return pickFrom(r, 20, 25, 35, Enemy.Type.GOBLIN,   Enemy.Type.ORC,    Enemy.Type.TROLL);
        if (floor <= 8)  return pickFrom(r, 15, 30, 55, Enemy.Type.ORC,      Enemy.Type.TROLL,  Enemy.Type.DEMON);
        return pickFrom(r, 10, 30, 60, Enemy.Type.TROLL, Enemy.Type.DEMON, Enemy.Type.DRAGON);
    }

    private static Enemy.Type pickFrom(int r, int p1, int p2, int p3,
                                        Enemy.Type t1, Enemy.Type t2, Enemy.Type t3) {
        if (r < p1)       return t1;
        if (r < p1 + p2)  return t2;
        return t3;
    }
}
