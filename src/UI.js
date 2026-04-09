export const UI = {
    log(msg, type = 'sys') {
        const logBox = document.getElementById('battle-log');
        if (!logBox) return;
        const div = document.createElement('div');
        div.className = `log-line log-${type}`;
        div.innerText = `> ${msg}`;
        logBox.prepend(div);
    },

    logBreak() {
        const logBox = document.getElementById('battle-log');
        const div = document.createElement('div');
        div.className = 'log-line break';
        logBox.prepend(div);
    },

    updatePlayer(player) {
        // 1. [추가] 카드 상단의 레벨과 이름 업데이트
        if (document.getElementById('p-level')) document.getElementById('p-level').innerText = player.level;
        if (document.getElementById('p-name')) document.getElementById('p-name').innerText = player.name;

        // 2. 사이드바 정보 업데이트
        document.getElementById('p-side-level').innerText = player.level;
        document.getElementById('p-exp-bar').style.width = `${(player.exp / player.maxExp) * 100}%`;
        
        // 3. 카드 체력바 업데이트
        document.getElementById('p-hp-bar').style.width = `${(player.hp / player.maxHp) * 100}%`;
        // 체력 텍스트 출력 시 0 미만은 0으로 고정
        const currentHp = Math.max(0, player.hp); 
        document.getElementById('p-hp-text').innerText = `${Math.floor(currentHp)} / ${player.maxHp}`;
        document.getElementById('p-hp-text').innerText = `${Math.floor(player.hp)} / ${player.maxHp}`;
        
        // 경험치 업데이트 
        const expPercent = Math.floor((player.exp / player.maxExp) * 100);
        document.getElementById('p-exp-bar').style.width = `${expPercent}%`;
        document.getElementById('p-exp-percent').innerText = `${expPercent}%`;
        document.getElementById('p-exp-text').innerText = `EXP: ${player.exp} / ${player.maxExp}`;

        // 4. 상세 스탯 리스트 주입
        document.getElementById('p-stats-list').innerHTML = `
            <div class="stat-row">공격력: <strong>${player.atk}</strong></div>
            <div class="stat-row">방어력: <strong>${player.def}</strong></div>
            <div class="stat-row">속도: <strong>${player.speed}</strong></div>
            <div class="stat-row">치명타: <strong>${player.critChance}%</strong></div>
        `;
    },

    updateDungeon(name, wave) {
        document.getElementById('dungeon-title').innerText = name;
        document.getElementById('current-wave').innerText = wave;
    },

    updateMonster(monster) {
        if (!monster) return;
        document.getElementById('m-level').innerText = monster.level;
        document.getElementById('m-name').innerText = monster.name;
        document.getElementById('m-icon').innerText = monster.icon;
        document.getElementById('m-hp-bar').style.width = `${(monster.currentHp / monster.hp) * 100}%`;
        document.getElementById('m-hp-text').innerText = `${Math.floor(monster.currentHp)} / ${monster.hp}`;
    },

    showDamage(targetId, amount, isCrit) {
        const card = document.getElementById(targetId);
        if (!card) return;
        const damageEl = document.createElement('div');
        damageEl.className = `damage-text ${isCrit ? 'crit' : ''}`;
        damageEl.innerText = amount;
        card.appendChild(damageEl);
        setTimeout(() => damageEl.remove(), 800);
        this.applyHitEffect(targetId);
    },
    applyHitEffect(targetId) {
        const card = document.getElementById(targetId);
        if (!card) return;

        // CSS에 정의한 애니메이션 클래스 추가
        card.classList.add('hit-shake', 'hit-flash');

        // 애니메이션이 끝난 후(0.3초 뒤) 클래스 제거
        setTimeout(() => {
            card.classList.remove('hit-shake', 'hit-flash');
        }, 300);
    },

    updateDungeon(name, wave) {
        const titleEl = document.getElementById('dungeon-title');
        const waveEl = document.getElementById('current-wave');
        if (titleEl) titleEl.innerText = name;
        if (waveEl) waveEl.innerText = wave;
    }
};