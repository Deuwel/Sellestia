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
        this.potionCount = 2; // 최대 소지량 2로 변경
        this.maxPotionCount = 2;
        this.usedPotionInBattle = false; // 이번 전투에서 사용 여부
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
        this.usedPotionInBattle = false; // 새로운 적을 만나면 사용 가능하도록 리셋
    }

    usePotion() {
        if (this.potionCount > 0 && !this.usedPotionInBattle && this.hp > 0) {
            const healAmount = Math.floor(this.maxHp * 0.3);
            this.hp = Math.min(this.maxHp, this.hp + healAmount);
            this.potionCount--;
            this.usedPotionInBattle = true;
            return healAmount;
        }
        return 0;
    }

    getAttackInterval() {
        return 3000 / Math.log10(this.speed / 10);
    }

    gainExp(amount) {
    const validAmount = Number(amount) || 0; // 숫자가 아니면 0으로 처리
    this.exp = (Number(this.exp) || 0) + validAmount;
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