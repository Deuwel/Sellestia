export class Player {
    constructor() {
        this.name = "Adventurer";
        this.baseStats = { str: 1, dex: 1, vit: 1, luk: 1, end: 1 };
        this.level = 1;
        this.exp = 0;
        this.maxExp = 20;
        this.statPoints = 0;

        this.hp = 0;
        this.maxHp = 0;
        this.updateDerivedStats();
        this.hp = this.maxHp;
    }

    updateDerivedStats() {
        this.maxHp = 15 + (this.baseStats.vit * 5);
        this.atk = 2 + Math.floor(this.baseStats.str * 0.8);
        this.def = 0 + Math.floor(this.baseStats.end * 0.5);
        this.speed = 100 + (this.baseStats.dex * 5);
        this.critChance = 5 + (this.baseStats.luk * 1);
        this.critDmg = 1.5;
        this.hpRegen = this.baseStats.vit * 1;
    }

    onEncounter() {
        this.hp = Math.min(this.maxHp, this.hp + this.hpRegen);
    }

    getAttackInterval() {
        return 3000 / Math.log10(this.speed / 10);
    }

    gainExp(amount) {
        this.exp += amount;
        if (this.exp >= this.maxExp) this.levelUp();
    }

    levelUp() {
        this.level++;
        this.exp -= this.maxExp;
        this.maxExp = Math.floor(this.maxExp * 1.5);
        this.statPoints += 4;
        this.updateDerivedStats();
        this.hp = this.maxHp;
    }
}