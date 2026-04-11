export class Player {
    constructor() {
        this.level = 1;
        this.exp = 0;
        this.maxExp = 20;
        this.gold = 0;
        
        // 1. 기본 스탯 (마을에서 투자하는 수치)
        this.baseStats = {
            str: 0, dex: 0, vit: 0, luk: 0, end: 0
        };
        this.statPoints = 0;

        // 2. 전투 능력치 (공식에 의해 결정됨)
        this.maxHp = 15;
        this.currentHp = 15; // 기존 .hp에서 .currentHp로 변경
        this.atk = 2;
        this.def = 0;
        this.speed = 105;
        this.critChance = 5;
        this.critDmg = 1.5;
        this.hpRegen = 1;

        this.potionCount = 5;
        this.updateDerivedStats(); // 초기 계산
    }

    updateDerivedStats() {
// 모든 최종 능력치에 Math.floor를 씌워 정수로 만듭니다.
        this.maxHp = Math.floor(15 + (this.baseStats.vit * 5));
        this.atk = Math.floor(2 + (this.baseStats.str * 0.8));
        this.def = Math.floor(this.baseStats.end * 0.5);
        this.speed = Math.floor(100 + (this.baseStats.dex * 5));
        this.critChance = Math.floor(5 + (this.baseStats.luk * 1));
        
        // currentHp가 maxHp를 넘지 않게 보정
        if (this.currentHp > this.maxHp) this.currentHp = this.maxHp;
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

    // 경험치 획득 함수
    gainExp(amount) {
        this.exp += amount;
        
        // 남은 경험치가 다음 레벨업 요구량보다 많다면 계속 반복
        while (this.exp >= this.maxExp) {
            this.levelUp();
        }
    }

    // 레벨업 1회 수행 함수
    levelUp() {
        this.exp -= this.maxExp; // 현재 레벨의 요구량만큼 차감
        this.level++;
        
        // 레벨업 시 스탯 포인트 5개 증량 (기존 포인트에 누적)
        this.statPoints += 1; 
        
        // 레벨업당 경험치 요구량 상승 (예: 이전 대비 1.2배)
        this.maxExp = Math.floor(this.maxExp * 1.2);
        
        // 스탯 변화에 따른 능력치 갱신 (maxHp 등)
        this.updateDerivedStats();
        
        // 레벨업 시 현재 체력을 최대 체력으로 회복
        this.currentHp = this.maxHp; 
        
        console.log(`🎊 Level Up! 현재 레벨: ${this.level}, 남은 EXP: ${this.exp}, 스탯 포인트: ${this.statPoints}`);
    }
}