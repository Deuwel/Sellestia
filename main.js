import { Player } from './src/Player.js';
import { Battle } from './src/Battle.js';
import { UI } from './src/UI.js';
import { DUNGEON_POOL } from './src/Monster.js';

document.addEventListener('DOMContentLoaded', () => {
    const player = new Player();
    const battle = new Battle(player, DUNGEON_POOL["평원"], UI);

    // 초기 상태 반영
    UI.updatePlayer(player);
    UI.log("🌌 Sellestia의 세계에 오신 것을 환영합니다.", "sys");

    // 2초 뒤 전투 시작
    setTimeout(() => {
        battle.startDungeon();
    }, 2000);
});

