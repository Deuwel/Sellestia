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

export class Monster {
    constructor(data) {
        Object.assign(this, data);
        this.currentHp = this.hp; // 현재 체력 초기화
    }
}