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
        const iconBox = document.getElementById('m-icon');
        
        // 1. 데이터가 아예 안 들어온 경우 방어
        if (!monster) {
            console.error("UI Error: monster 객체가 없습니다.");
            iconBox.innerHTML = '❓';
            return;
        }

        // 2. [범인 검거] 이미지 경로를 변수에 따로 담습니다.
        // monster.img가 있으면 쓰고, 없으면 빈 문자열을 줍니다.
        const imagePath = monster.img || ""; 

        if (imagePath !== "") {
            // [주의] ${imagePath} 오타가 없는지, 백틱(`)으로 감쌌는지 꼭 확인하세요!
            iconBox.innerHTML = `<img src="${imagePath}" alt="${monster.name}" class="monster-sprite">`;
        } else {
            // 이미지가 없을 때만 이모지를 띄웁니다.
            iconBox.innerHTML = `<span style="font-size: 2rem;">👾</span>`;
            console.warn(`${monster.name}의 이미지가 없습니다. (경로 비어있음)`);
        }

        // 3. 텍스트 업데이트
        document.getElementById('m-name').innerText = monster.name || "Unknown";
        document.getElementById('m-level').innerText = monster.level || "0";
    },

    showDamage(targetId, amount, isCrit) {
        const card = document.getElementById(targetId);
        if (!card) return;

        const damageEl = document.createElement('div');
        // isCrit이 true면 'crit' 클래스가 붙어 CSS 효과가 적용됨
        damageEl.className = `damage-text ${isCrit ? 'crit' : ''}`;
        
        // 치명타일 때 텍스트 앞에 아이콘 추가 (선택 사항)
        damageEl.innerText = isCrit ? `💥 ${amount}` : amount;

        card.appendChild(damageEl);

        // 연출이 끝난 후 요소 제거
        setTimeout(() => {
            if (damageEl.parentNode) {
                damageEl.remove();
            }
        }, 800);

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
    // 회복 효과 연출
    showHeal(targetId, amount) {
        const card = document.getElementById(targetId);
        if (!card) return;

        const healEl = document.createElement('div');
        healEl.className = 'heal-effect';
        healEl.innerText = `+${amount}`; // 숫자만 깔끔하게
        
        // 카드 중앙 부근에 위치하도록 (CSS의 translate(-50%, 0)와 함께 작동)
        healEl.style.top = '30%'; 
        
        card.appendChild(healEl);
        
        // 애니메이션이 부드럽게 끝난 후(1.5초) 제거
        setTimeout(() => healEl.remove(), 1500);

        // 카드 반짝임 효과도 부드럽게
        card.style.transition = 'filter 0.5s ease';
        card.style.filter = 'brightness(1.4) drop-shadow(0 0 15px #2ed573)';
        setTimeout(() => {
            card.style.filter = 'none';
        }, 600);
    },

    updatePotionUI(count, canUse) {
        const btn = document.getElementById('btn-potion');
        const qty = document.getElementById('potion-qty');
        if (qty) qty.innerText = count;
        if (btn) btn.disabled = !canUse || count <= 0;
    },

    updateDungeon(name, wave) {
        const titleEl = document.getElementById('dungeon-title');
        const waveEl = document.getElementById('current-wave');
        if (titleEl) titleEl.innerText = name;
        if (waveEl) waveEl.innerText = wave;
    }
};