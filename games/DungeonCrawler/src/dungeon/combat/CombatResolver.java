package dungeon.combat;

import dungeon.entity.*;

public class CombatResolver {

    public record Result(int damage, boolean killed, String log) {}

    /** Player attacks enemy */
    public static Result playerAttack(Player player, Enemy enemy) {
        int raw    = player.rollAttack();
        int damage = Math.max(1, raw - enemy.defense);
        enemy.damage(damage);
        boolean killed = !enemy.isAlive();
        String log = killed
            ? String.format("You slay the %s! (+%dxp +%dg)", enemy.name, enemy.xpReward, enemy.goldReward)
            : String.format("You hit %s for %d damage. [%d/%d]", enemy.name, damage, enemy.hp, enemy.maxHp);
        return new Result(damage, killed, log);
    }

    /** Enemy attacks player */
    public static Result enemyAttack(Enemy enemy, Player player) {
        int raw    = enemy.rollAttack();
        int damage = Math.max(1, raw - player.defense);
        player.damage(damage);
        boolean killed = !player.isAlive();
        String log = killed
            ? String.format("The %s delivers a killing blow!", enemy.name)
            : String.format("%s hits you for %d damage.", enemy.name, damage);
        return new Result(damage, killed, log);
    }
}
