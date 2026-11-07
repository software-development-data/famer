// World Map, Tile Environment, and Interactive Village Zones

export class World {
    constructor() {
        this.width = 2500;
        this.height = 1400;

        // Interactive Buildings & Landmarks
        this.buildings = [
            {
                id: 'nha_chinh',
                name: 'Nhà Chính',
                sub: 'Dinh thự Trưởng Làng',
                icon: '🏡',
                x: 430,
                y: 350,
                w: 200,
                h: 160,
                color: '#d97706',
                roofColor: '#92400e',
                interactDist: 140,
                description: 'Nghỉ ngơi hồi phục toàn bộ HP & Thể Lực'
            },
            {
                id: 'xuong',
                name: 'Xưởng Rèn',
                sub: 'Chế tạo & Cường Hóa',
                icon: '⚒️',
                x: 820,
                y: 340,
                w: 180,
                h: 150,
                color: '#78716c',
                roofColor: '#44403c',
                interactDist: 130,
                description: 'Chế tạo trang bị, đan dược và công cụ làm nông'
            },
            {
                id: 'cho',
                name: 'Chợ Làng',
                sub: 'Giao Thương Hàng Hóa',
                icon: '🏪',
                x: 1220,
                y: 370,
                w: 220,
                h: 160,
                color: '#b45309',
                roofColor: '#dc2626',
                interactDist: 140,
                description: 'Mua bán nông sản, đổi vàng và vật phẩm quý'
            },
            {
                id: 'ruong_lua',
                name: 'Ruộng Lúa Thần Nông',
                sub: 'Khu Canh Tác Gia Truyền',
                icon: '🌾',
                x: 520,
                y: 750,
                w: 580,
                h: 300,
                color: '#ca8a04',
                interactDist: 180,
                description: 'Gieo hạt, tưới nước và thu hoạch nông sản tươi tốt'
            },
            {
                id: 'khu_rung',
                name: 'Rừng Hoang Dã',
                sub: 'Khu Quái Vật Nguy Hiểm',
                icon: '🌲',
                x: 1750,
                y: 200,
                w: 700,
                h: 1100,
                color: '#166534',
                interactDist: 200,
                description: 'Khu vực săn bắn quái vật, thảo phạt thổ phỉ thu chiến lợi phẩm'
            }
        ];

        // Environment scenery elements (trees, rocks, fences, haystacks, pond)
        this.scenery = this.generateScenery();

        // Ambient floating particles (leaves, flower petals)
        this.ambientParticles = [];
        this.initAmbientParticles();
    }

    generateScenery() {
        const items = [];

        // Lotus Pond in Village Plaza
        items.push({
            type: 'pond',
            x: 950,
            y: 600,
            radiusX: 130,
            radiusY: 80
        });

        // Haystacks near Farmland
        items.push({ type: 'haystack', x: 460, y: 880 });
        items.push({ type: 'haystack', x: 480, y: 920 });
        items.push({ type: 'haystack', x: 1130, y: 850 });

        // Village Trees (Bamboo, Coconut, Flamboyant)
        const treeCoords = [
            { x: 300, y: 260, kind: 'bamboo' },
            { x: 340, y: 290, kind: 'bamboo' },
            { x: 670, y: 310, kind: 'bamboo' },
            { x: 710, y: 290, kind: 'bamboo' },
            { x: 1040, y: 320, kind: 'flamboyant' },
            { x: 1080, y: 340, kind: 'flamboyant' },
            { x: 1470, y: 360, kind: 'coconut' },
            { x: 1520, y: 400, kind: 'coconut' },
            // Along the road
            { x: 350, y: 650, kind: 'bamboo' },
            { x: 1180, y: 680, kind: 'flamboyant' },
            { x: 1420, y: 720, kind: 'coconut' },
            // Deep Forest Trees
            { x: 1700, y: 300, kind: 'forest' },
            { x: 1850, y: 240, kind: 'forest' },
            { x: 2050, y: 320, kind: 'forest' },
            { x: 2280, y: 280, kind: 'forest' },
            { x: 1760, y: 550, kind: 'forest' },
            { x: 1950, y: 600, kind: 'forest' },
            { x: 2180, y: 520, kind: 'forest' },
            { x: 2350, y: 620, kind: 'forest' },
            { x: 1820, y: 850, kind: 'forest' },
            { x: 2020, y: 900, kind: 'forest' },
            { x: 2250, y: 860, kind: 'forest' },
            { x: 1890, y: 1150, kind: 'forest' },
            { x: 2150, y: 1200, kind: 'forest' },
            { x: 2380, y: 1100, kind: 'forest' }
        ];

        treeCoords.forEach(t => {
            items.push({
                type: 'tree',
                x: t.x,
                y: t.y,
                kind: t.kind,
                radius: t.kind === 'forest' ? 55 : (t.kind === 'bamboo' ? 30 : 45)
            });
        });

        // Wooden Fences along Ruộng Lúa
        for (let x = 500; x <= 1120; x += 40) {
            items.push({ type: 'fence', x: x, y: 740 });
            items.push({ type: 'fence', x: x, y: 1060 });
        }
        for (let y = 740; y <= 1060; y += 40) {
            items.push({ type: 'fence', x: 500, y: y });
            if (y > 880 || y < 820) { // Opening gate in right fence
                items.push({ type: 'fence', x: 1120, y: y });
            }
        }

        return items;
    }

    initAmbientParticles() {
        for (let i = 0; i < 60; i++) {
            this.ambientParticles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: -0.4 - Math.random() * 0.5,
                vy: 0.2 + Math.random() * 0.4,
                size: 3 + Math.random() * 4,
                alpha: 0.4 + Math.random() * 0.5,
                color: Math.random() > 0.4 ? '#f472b6' : '#fef08a', // pink blossom or gold petal
                rot: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.05
            });
        }
    }

    updateAmbientParticles(dt) {
        this.ambientParticles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.rot += p.rotSpeed;

            if (p.x < 0) p.x = this.width;
            if (p.y > this.height) p.y = 0;
        });
    }

    getNearbyBuilding(playerX, playerY) {
        for (const b of this.buildings) {
            const centerX = b.x + b.w / 2;
            const centerY = b.y + b.h / 2;
            const dist = Math.hypot(playerX - centerX, playerY - centerY);
            if (dist <= b.interactDist) {
                return b;
            }
        }
        return null;
    }
}
