export const DUNGEON_POOL = {
    "평원": [
        { 
            name: "슬라임", 
            level: 1, 
            hp: 8, 
            atk: 2, 
            def: 0, 
            speed: 82, 
            img: "assets/monsters/slime.png"  // 경로 입력
        },
        { 
            name: "들개", 
            level: 2, 
            hp: 14, 
            atk: 3, 
            def: 1, 
            speed: 98, 
            img: "assets/monsters/wild_dog.png" 
        }
    ]
};

// src/Monster.js
export class Monster {
    constructor(data) {
        Object.assign(this, data);
        // data.hp가 숫자인지 확인하고, currentHp를 반드시 초기화합니다.
        this.hp = Number(data.hp) || 10;
        this.currentHp = this.hp; 
        this.exp = Number(data.exp) || (this.level * 10);
    }
}