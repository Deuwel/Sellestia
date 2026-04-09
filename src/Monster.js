export const DUNGEON_POOL = {
    "평원": [
        { name: "초록 슬라임", icon: "🟢", hp: 10, atk: 1, def: 0, speed: 80, exp: 5 },
        { name: "작은 쥐", icon: "🐭", hp: 8, atk: 2, def: 0, speed: 120, exp: 4 },
        { name: "들개", icon: "🐕", hp: 14, atk: 2, def: 1, speed: 105, exp: 8 }
    ]
};

export class Monster {
    constructor(data) {
        Object.assign(this, data);
        this.currentHp = this.hp; // 현재 체력 초기화
    }
}