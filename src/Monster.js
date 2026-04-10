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
        // 기존 속성들을 복사
        Object.assign(this, data);
        
        // [중요] 데이터에 img가 있다면 명시적으로 할당, 없으면 빈 문자열
        this.img = data.img || ""; 
        this.currentHp = this.hp;
    }
}