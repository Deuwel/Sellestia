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
        const validAmount = Number(amount) || 0;
        this.exp = (Number(this.exp) || 0) + validAmount;

        // [수정] if 대신 while을 사용하여, 남은 경험치가 maxExp보다 적어질 때까지 반복합니다.
        // 예: 레벨업 후에도 경험치가 남으면 즉시 다음 레벨업을 진행합니다.
        while (this.exp >= this.maxExp) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        
        // 1. 경험치 차감 (남은 경험치는 유지됨)
        this.exp -= this.maxExp;
        
        // 2. 다음 레벨업 요구량 증가 (기존 1.5배 로직 유지)
        this.maxExp = Math.floor(this.maxExp * 1.5);
        
        // 3. 스탯 포인트 지급 및 회복
        this.statPoints += 4;
        this.updateDerivedStats(); // 포인트로 올린 스탯 반영 로직인 것 같네요!
        this.hp = this.maxHp;      // 풀피 회복
        
        // [추가 추천] 레벨업 로그를 UI에 남겨주면 유저가 더 좋아합니다.
        if (this.ui) {
            this.ui.log(`🎊 LEVEL UP! 현재 레벨: ${this.level}`, 'sys');
        }
    }
}