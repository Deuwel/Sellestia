import { Monster } from './Monster.js';

export class Battle {
    constructor(player, dungeonPool, ui) {
        this.player = player;
        this.dungeonData = dungeonPool;
        this.ui = ui;
        this.enemyCount = 0;
        this.currentEnemy = null;
        this.battleTimer = null; // 메인 인터벌 타이머
        
        // 현재 채워진 속도 게이지 (0~100)
        this.pProgress = 0;
        this.mProgress = 0;
        
        this.initControls();
    }

    initControls() {
        const potionBtn = document.getElementById('btn-potion');
        if (potionBtn) {
            potionBtn.onclick = () => {
                if (this.player.hp <= 0 || this.player.usedPotionInBattle) return;
                const healAmount = this.player.usePotion();
                if (healAmount > 0) {
                    this.ui.showHeal('player-card', healAmount);
                    this.ui.updatePlayer(this.player);
                    this.ui.updatePotionUI(this.player.potionCount, false);
                    this.ui.log(`🧪 포션 사용! 체력을 ${healAmount} 회복했습니다.`, 'sys');
                }
            };
        }
    }

    // 던전 진입 시 최초 1회 실행
    startDungeon() {
        this.enemyCount = 0;
        this.ui.log("🚩 Sellestia의 깊은 곳으로 향합니다.", "sys");
        this.prepareNextBattle();
    }

    // 다음 전투를 위한 '완전한 초기화' 및 소환
    prepareNextBattle() {
        // 1. 기존 타이머가 있다면 확실히 제거
        if (this.battleTimer) {
            clearInterval(this.battleTimer);
            this.battleTimer = null;
        }

        // 2. 게이지 데이터 및 UI 리셋
        this.pProgress = 0;
        this.mProgress = 0;
        if (document.getElementById('p-sp-bar')) document.getElementById('p-sp-bar').style.width = '0%';
        if (document.getElementById('m-sp-bar')) document.getElementById('m-sp-bar').style.width = '0%';

        // 3. 적 소환
        this.nextEnemy();
    }

    nextEnemy() {
        this.enemyCount++;
        
        if (this.enemyCount > 10) {
            this.ui.log("🏆 던전을 완전히 정복했습니다!", "sys");
            return;
        }

        const baseData = this.dungeonData[Math.floor(Math.random() * this.dungeonData.length)];
        let data = { ...baseData }; 

        if (this.enemyCount === 10) {
            data.name = `${baseData.name} (BOSS)`;
        }

        this.currentEnemy = new Monster(data);
        
        // 몬스터 정보 로드 후 UI 갱신
        this.player.onEncounter();
        this.ui.updatePotionUI(this.player.potionCount, true);
        this.ui.updatePlayer(this.player);
        this.ui.updateMonster(this.currentEnemy); 
        
        this.ui.log(`${this.enemyCount}번째 조우: Lv.${this.currentEnemy.level} ${this.currentEnemy.name}`, "sys");
        this.ui.updateDungeon("평원", this.enemyCount);

        // 4. 리셋이 끝난 후 전투 루프 시작
        this.startLoop();
    }
    
    startLoop() {
        // 중복 실행 방지
        if (this.battleTimer) clearInterval(this.battleTimer);

        this.battleTimer = setInterval(() => {
            // 게이지 증가 (SPD 기반)
            this.pProgress += (this.player.speed / 100); 
            this.mProgress += (this.currentEnemy.speed / 100);

            // 게이지 UI 업데이트
            const pBar = document.getElementById('p-sp-bar');
            const mBar = document.getElementById('m-sp-bar');
            if (pBar) pBar.style.width = `${Math.min(100, this.pProgress)}%`;
            if (mBar) mBar.style.width = `${Math.min(100, this.mProgress)}%`;

            // 플레이어 턴
            if (this.pProgress >= 100) {
                this.attack(this.player, this.currentEnemy, "monster-card"); 
                this.pProgress = 0;
            }
            
            // 몬스터 턴 (플레이어 공격 후 몬스터가 죽지 않았을 때만)
            if (this.currentEnemy.currentHp > 0 && this.mProgress >= 100) {
                this.attack(this.currentEnemy, this.player, "player-card");
                this.mProgress = 0;
            }
        }, 50); 
    }

    attack(attacker, defender, targetCardId) {
        // 둘 중 하나라도 죽어있으면 공격 중단
        if (attacker.currentHp <= 0 || defender.currentHp <= 0) return;

        let isCrit = false;
        let dmg = attacker.atk - (defender.def || 0);
        
        if (attacker.critChance && Math.random() * 100 < attacker.critChance) {
            isCrit = true;
            dmg = Math.floor(dmg * (attacker.critDmg || 1.5));
        }
        
        dmg = Math.max(1, Math.floor(dmg)); // 최소 1 데미지 보장

        // 체력 차감 (이제 둘 다 currentHp를 사용함)
        defender.currentHp = Math.max(0, defender.currentHp - dmg);

        // UI 갱신
        this.ui.showDamage(targetCardId, dmg, isCrit);
        const type = (attacker === this.player) ? 'p' : 'm';
        this.ui.log(`${attacker.name}: ${dmg} 데미지! ${isCrit ? '💥' : ''}`, type);
        
        this.ui.updatePlayer(this.player);
        this.ui.updateMonster(this.currentEnemy);

        // 사망 판정
        if (defender.currentHp <= 0) {
            this.endLoop(defender === this.player);
        }
    }

    endLoop(playerDied) {
        if (this.battleTimer) {
            clearInterval(this.battleTimer);
            this.battleTimer = null;
        }

        this.ui.logBreak(); 

        if (playerDied) {
            this.ui.log("💀 눈앞이 캄캄해졌습니다...", "sys");
            const currentExp = this.player.exp || 0;
            const penalty = Math.floor(currentExp * 0.02);
            this.player.exp = Math.max(0, currentExp - penalty);
            this.ui.log(`패널티로 경험치 ${penalty}를 잃었습니다.`, "sys");
            this.ui.updatePlayer(this.player);
        } else {
            const rewardExp = this.currentEnemy.exp || (this.currentEnemy.level * 10);
            const rewardGold = this.currentEnemy.gold || 0;

            this.ui.log(`✨ ${this.currentEnemy.name} 처치! EXP +${rewardExp}, GOLD+${rewardGold}`, "sys");
            this.player.gold = (this.player.gold || 0) + rewardGold;
            
            this.player.gainExp(rewardExp); 
            this.ui.updatePlayer(this.player); 

            // 1.5초 뒤 다음 전투 준비 (통합 함수 호출)
            setTimeout(() => {
                this.prepareNextBattle();
            }, 1500);
        }
    }
}