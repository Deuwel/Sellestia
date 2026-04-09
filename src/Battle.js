import { Monster } from './Monster.js';

export class Battle {
    constructor(player, dungeonPool, ui) {
        this.player = player;
        this.dungeonData = dungeonPool;
        this.ui = ui;
        this.enemyCount = 0;
        this.currentEnemy = null;
        this.battleTimer = null; // 게이지 계산기
        
        // 현재 채워진 속도 게이지 (0~100)
        this.pProgress = 0;
        this.mProgress = 0;
    }

    startDungeon() {
        this.enemyCount = 0;
        this.ui.log("🚩 Sellestia의 깊은 곳으로 향합니다.", "sys");
        this.nextEnemy();
    }

    nextEnemy() {
        this.enemyCount++;
        if (this.enemyCount > 10) {
            this.ui.log("🏆 던전을 완전히 정복했습니다!", "sys");
            return;
        }

        // 몬스터 생성 로직
        let data = this.dungeonData[Math.floor(Math.random() * this.dungeonData.length)];
        if (this.enemyCount === 10) {
            data = { ...data, name: `${data.name} (BOSS)`, hp: data.hp * 4, atk: data.atk * 1.5, icon: "💀", level: this.player.level + 2 };
        } else {
            data = { ...data, level: Math.max(1, this.player.level + Math.floor(Math.random() * 3) - 1) };
        }

        this.currentEnemy = new Monster(data);
        
        // 전투 조우 시 리젠 회복 및 UI 갱신
        this.player.onEncounter();
        this.pProgress = 0;
        this.mProgress = 0;
        
        this.ui.updatePlayer(this.player);
        this.ui.updateMonster(this.currentEnemy);
        this.ui.log(`${this.enemyCount}번째 조우: Lv.${this.currentEnemy.level} ${this.currentEnemy.name}`, "sys");
        this.ui.updateDungeon("평원", this.enemyCount);

        this.startLoop();
    }

    startLoop() {
        this.battleTimer = setInterval(() => {
            this.pProgress += (this.player.speed / 100); 
            this.mProgress += (this.currentEnemy.speed / 100);

            document.getElementById('p-sp-bar').style.width = `${Math.min(100, this.pProgress)}%`;
            document.getElementById('m-sp-bar').style.width = `${Math.min(100, this.mProgress)}%`;

            // 플레이어 게이지가 찼을 때
            if (this.pProgress >= 100) {
                // 공격자: 플레이어, 방어자: 몬스터, 데미지 표시 위치: 몬스터 카드
                this.attack(this.player, this.currentEnemy, "monster-card"); 
                this.pProgress = 0;
            }
            
            // 몬스터 게이지가 찼을 때
            if (this.mProgress >= 100) {
                // 공격자: 몬스터, 방어자: 플레이어, 데미지 표시 위치: 플레이어 카드
                this.attack(this.currentEnemy, this.player, "player-card");
                this.mProgress = 0;
            }
        }, 50); 
    }

    attack(attacker, defender, targetCardId) {
        let isCrit = false;
        let dmg = attacker.atk - (defender.def || 0);
        
        // 치명타 계산
        if (attacker.critChance && Math.random() * 100 < attacker.critChance) {
            isCrit = true;
            dmg = Math.floor(dmg * (attacker.critDmg || 1.5));
        }
        
        dmg = Math.max(1, dmg);
        
        // 1. 데미지 적용 및 음수 방지 처리
        if (defender.currentHp !== undefined) {
            defender.currentHp -= dmg;
            // 체력이 0 미만으로 내려가지 않도록 고정
            defender.currentHp = Math.max(0, defender.currentHp);
        } else {
            defender.hp -= dmg;
            // 몬스터 등 일반 객체도 0 미만 방지
            defender.hp = Math.max(0, defender.hp);
        }

        // 2. UI 효과 연출
        this.ui.showDamage(targetCardId, dmg, isCrit);
        const type = attacker.name === "Adventurer" ? 'p' : 'm';
        this.ui.log(`${attacker.name}: ${dmg} 데미지! ${isCrit ? '💥' : ''}`, type);
        
        // 3. UI 갱신 (이미 내부 데이터가 0 이상이므로 UI도 0으로 정상 표기됨)
        this.ui.updatePlayer(this.player);
        this.ui.updateMonster(this.currentEnemy);

        // 4. 사망 판정 (깔끔하게 0 이하인지 확인)
        const currentDefenderHp = (defender.currentHp !== undefined) ? defender.currentHp : defender.hp;
        if (currentDefenderHp <= 0) {
            this.endLoop(defender === this.player);
        }
    }

    endLoop(playerDied) {
        clearInterval(this.battleTimer);
        this.ui.logBreak(); // 로그 구분선

        if (playerDied) {
            this.ui.log("💀 눈앞이 캄캄해졌습니다...", "sys");
            // 경험치 페널티 로직 (현재 경험치의 2%)
            const penalty = Math.floor(this.player.exp * 0.02);
            this.player.exp -= penalty;
            this.ui.log(`패널티로 경험치 ${penalty}를 잃었습니다.`, "sys");
            // 마을로 돌아가는 로직은 나중에 구현
        } else {
            this.ui.log(`✨ ${this.currentEnemy.name} 처치! EXP +${this.currentEnemy.exp}`, "sys");
            this.player.gainExp(this.currentEnemy.exp);
            setTimeout(() => this.nextEnemy(), 1500);
        }
    }
}