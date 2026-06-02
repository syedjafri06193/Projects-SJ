package dungeon.entity;
import java.awt.Color;
import java.util.Random;
public class ItemFactory {
    public static Item random(int tx, int ty, int floor, Random rng) {
        int r = rng.nextInt(100);
        if (r < 40) return new Item(tx, ty, Item.Type.HEALTH_POTION, "Health Potion", 10 + floor * 2, new Color(200, 60, 100), '+');
        if (r < 60) return new Item(tx, ty, Item.Type.GOLD, "Gold Coins", 5 + rng.nextInt(floor * 3 + 5), new Color(255, 215, 0), '$');
        if (r < 80) return new Item(tx, ty, Item.Type.STRENGTH_POTION, "Strength Potion", 2 + floor / 3, new Color(255, 80, 60), '!');
        return new Item(tx, ty, Item.Type.SHIELD_POTION, "Shield Potion", 1 + floor / 4, new Color(60, 120, 255), '?');
    }
}
