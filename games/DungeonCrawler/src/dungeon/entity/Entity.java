package dungeon.entity;

public abstract class Entity {
    public int tx, ty;          // tile coordinates
    public int hp, maxHp;
    public String name;

    public Entity(int tx, int ty, String name, int hp) {
        this.tx = tx; this.ty = ty;
        this.name = name;
        this.hp = this.maxHp = hp;
    }

    public boolean isAlive() { return hp > 0; }

    public void damage(int amount) { hp = Math.max(0, hp - amount); }

    public void heal(int amount)   { hp = Math.min(maxHp, hp + amount); }
}
