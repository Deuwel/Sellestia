export const DUNGEON_POOL = {
    "평원": [
        { 
            name: "슬라임", 
            level: 1, 
            hp: 8, 
            atk: 2, 
            def: 0, 
            speed: 82, 
            exp:1,
            img: "assets/monsters/slime.png"  // 경로 입력
        },
        { 
            name: "들개", 
            level: 2, 
            hp: 14, 
            atk: 3, 
            def: 1, 
            speed: 98, 
            exp:2,
            img: "assets/monsters/wild_dog.png" 
        }
    ]
};

// src/Monster.js
export class Monster {
    constructor(data) {
        // 모든 속성을 복사하되, 핵심 수치는 숫자로 강제 변환
        Object.assign(this, data);
        
        this.level = Number(data.level) || 1;
        this.hp = Number(data.hp) || 10;
        this.currentHp = this.hp; // 👈 0/0 방지를 위해 반드시 여기서 할당
        this.atk = Number(data.atk) || 2;
        this.def = Number(data.def) || 0;
        this.speed = Number(data.speed) || 100;
        this.exp = Number(data.exp) || 0;
    }
}