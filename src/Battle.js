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
        this.initControls();
    }

    initControls() {
            const potionBtn = document.getElementById('btn-potion');
            if (potionBtn) {
                potionBtn.onclick = () => {
                    // 사망했거나 이미 이번 판에 썼으면 리턴
                    if (this.player.hp <= 0 || this.player.usedPotionInBattle) return;

                    const healAmount = this.player.usePotion();
                    if (healAmount > 0) {
                        this.ui.showHeal('player-card', healAmount);
                        this.ui.updatePlayer(this.player);
                        
                        // UI에서 버튼 비활성화 (false 전달)
                        this.ui.updatePotionUI(this.player.potionCount, false);
                        
                        this.ui.log(`🧪 포션 사용! 체력을 ${healAmount} 회복했습니다.`, 'sys');
                    }
                };
            }
        }
    
    startDungeon() {
        this.enemyCount = 0;
        this.ui.log("🚩 Sellestia의 깊은 곳으로 향합니다.", "sys");
        this.nextEnemy();
    }

    nextEnemy() {
        this.enemyCount++;
        
        // 10회 조우 시 정복 처리
        if (this.enemyCount > 10) {
            this.ui.log("🏆 던전을 완전히 정복했습니다!", "sys");
            return;
        }

        // 1. 원본 데이터 선택
        const baseData = this.dungeonData[Math.floor(Math.random() * this.dungeonData.length)];
        
        // 2. 최종 데이터 객체 생성 (기본 능력치 보장)
        let data = { ...baseData }; 

        if (this.enemyCount === 10) {
            data.name = `${baseData.name} (BOSS)`;
        } else {
            data.level = Math.floor(baseData.level)
            data.hp = Math.floor(baseData.hp);
            data.atk = Math.floor(baseData.atk);
            data.hp = baseData.hp; 
        }

        // 4. 몬스터 인스턴스 생성
        this.currentEnemy = new Monster(data);
        console.log("Monster 생성 직후 객체 상태:", this.currentEnemy);
        // [디버깅] 여기서 0/0이 나오는지 콘솔로 꼭 확인해보세요!
        console.log(`몬스터 생성 완료: ${this.currentEnemy.name}, HP: ${this.currentEnemy.currentHp}/${this.currentEnemy.hp}`);
        
        // 5. 전투 환경 및 UI 초기화
        this.player.onEncounter();
        this.pProgress = 0;
        this.mProgress = 0;
        
        // UI 갱신
        this.ui.updatePotionUI(this.player.potionCount, true);
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
        // 1. [중요] 생존 확인: 공격자나 방어자 중 하나라도 체력이 0이면 즉시 중단
        // 이를 통해 사망 후 setTimeout 대기 시간 동안 발생하는 추가 공격을 막습니다.
        const attackerHp = attacker.currentHp !== undefined ? attacker.currentHp : attacker.hp;
        const defenderHp = defender.currentHp !== undefined ? defender.currentHp : defender.hp;
        if (attackerHp <= 0 || defenderHp <= 0) return;

        let isCrit = false;
        let dmg = attacker.atk - (defender.def || 0);
        
        // 치명타 계산
        if (attacker.critChance && Math.random() * 100 < attacker.critChance) {
            isCrit = true;
            dmg = Math.floor(dmg * (attacker.critDmg || 1.5));
        }
        
        dmg = Math.max(1, dmg);
        
        // 데미지 적용
        if (defender.currentHp !== undefined) {
            defender.currentHp = Math.max(0, defender.currentHp - dmg);
        } else {
            defender.hp = Math.max(0, defender.hp - dmg);
        }

        // UI 효과 및 로그 연출
        this.ui.showDamage(targetCardId, dmg, isCrit);
        const type = attacker.name === "Adventurer" ? 'p' : 'm';
        this.ui.log(`${attacker.name}: ${dmg} 데미지! ${isCrit ? '💥' : ''}`, type);
        
        this.ui.updatePlayer(this.player);
        this.ui.updateMonster(this.currentEnemy);

        // 2. 사망 판정
        const currentDefenderHp = (defender.currentHp !== undefined) ? defender.currentHp : defender.hp;
        if (currentDefenderHp <= 0) {
            this.endLoop(defender === this.player);
        }
    }
    startNextBattle() {
        // 1. 적 데이터 생성 (기존 로직 사용)
        this.nextEnemy(); 
        
        // 2. UI 갱신
        this.ui.updateMonster(this.currentEnemy);
        this.ui.log(`⚔️ ${this.currentEnemy.name}이(가) 나타났다!`, "sys");

        // 3. 전투 타이머 재시작 (이 부분이 없으면 멈춤)
        this.startBattleLoop(); 
    }

    startBattleLoop() {
        // 혹시 모를 중복 실행 방지
        if (this.battleTimer) clearInterval(this.battleTimer);

        this.battleTimer = setInterval(() => {
            // 전투 로직 (공격 순서 판단 등)
            this.battleTick(); 
        }, 1000); // 1초마다 턴 진행
    }
    
    endLoop(playerDied) {
        // 1. 현재 진행 중인 타이머는 확실히 정지
        if (this.battleTimer) {
            clearInterval(this.battleTimer);
            this.battleTimer = null; // 참조 초기화
        }

        this.ui.logBreak(); 

        if (playerDied) {
            this.ui.log("💀 눈앞이 캄캄해졌습니다...", "sys");
            
            const currentExp = this.player.exp || 0;
            const penalty = Math.floor(currentExp * 0.02);
            
            this.player.exp = Math.max(0, currentExp - penalty);
            this.ui.log(`패널티로 경험치 ${penalty}를 잃었습니다.`, "sys");
            
            this.ui.updatePlayer(this.player);
            // 플레이어 사망 시에는 여기서 루프가 종료됩니다. (재시작 버튼 등 필요)

        } else {
            // 2. 적 사망 시 보상 처리
            // 임의의 공식 대신 적 데이터의 exp를 우선 사용
            const rewardExp = this.currentEnemy.exp || 0;
            
            this.ui.log(`✨ ${this.currentEnemy.name} 처치! EXP +${rewardExp}`, "sys");
            
            this.player.gainExp(rewardExp); 
            this.ui.updatePlayer(this.player); 

            // 3. 버그 수정 핵심: 1.5초 뒤 '완전한 상태 초기화' 후 다음 적 소환
            setTimeout(() => {
                this.startNextBattle(); // nextEnemy를 포함한 통합 시작 함수 호출
            }, 1500);
        }
    }
}