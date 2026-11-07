// Game State Management & LocalStorage Persistence for "Nông Dân Thời Loạn"

const STORAGE_KEY = 'NONG_DAN_THOI_LOAN_SAVE_V2';

export class GameState {
    constructor() {
        this.data = this.getDefaultState();
        this.load();
        this.recalculateStats();
    }

    getDefaultState() {
        return {
            account: {
                username: 'NongDanPro',
                isLoggedIn: true,
                rememberMe: true
            },
            player: {
                name: 'Nông Dân 1090',
                gender: 'male',
                style: 0,
                class: 'Nông Dân',
                level: 18,
                exp: 4200,
                maxExp: 6000,
                combatPower: 24680,
                hp: 2840,
                maxHp: 2840,
                energy: 120,
                maxEnergy: 120,
                baseAttack: 1500,
                baseDefense: 680,
                baseSpeed: 320,
                attack: 1920,
                defense: 860,
                speed: 320,
                gold: 328450,
                diamonds: 12680,
                avatar: 'assets/v21/characters/farmer/male/portrait.png'
            },
            equipment: {
                hat: { id: 'hat_1', name: 'Nón Lá Thần Nông', type: 'hat', icon: 'assets/icons/hat_nonla.svg', hp: 450, def: 120, rarity: 'rare' },
                armor: { id: 'armor_1', name: 'Khăn Rằn Chiến Binh', type: 'armor', icon: 'assets/v21/item-khanran.png', hp: 800, def: 240, rarity: 'rare' },
                weapon: { id: 'wpn_1', name: 'Cuốc Sắt Trấn Phái', type: 'weapon', icon: 'assets/v21/items/hoe.png', atk: 650, rarity: 'epic' },
                boots: { id: 'boot_1', name: 'Gỗ Thần Phiêu Du', type: 'boots', icon: 'assets/v21/items/wood.png', spd: 80, def: 90, rarity: 'rare' },
                gloves: { id: 'glov_1', name: 'Bộ Đồ Nghề Nông Dân', type: 'gloves', icon: 'assets/v21/items/tools.png', atk: 180, def: 70, rarity: 'uncommon' },
                necklace: { id: 'neck_1', name: 'Ngọc Ấn Mùa Màng', type: 'necklace', icon: 'assets/v21/items/seal.png', hp: 500, atk: 120, rarity: 'rare' },
                ring: { id: 'ring_1', name: 'Nanh Sói May Mắn', type: 'ring', icon: 'assets/v21/items/fang.png', atk: 150, def: 80, rarity: 'uncommon' },
                badge: { id: 'badge_1', name: 'Hạt Vàng Hoàng Kim', type: 'badge', icon: 'assets/v21/items/rice.png', hp: 300, def: 60, rarity: 'uncommon' }
            },
            inventoryCapacity: 100,
            inventory: [
                { id: 'item_1', name: 'Nón lá Thần Nông', cat: 'Trang Bị', count: 24, icon: 'assets/icons/hat_nonla.svg', desc: 'Nón lá truyền thống che mưa nắng, tăng phòng thủ.', rarity: 'rare', def: 150 },
                { id: 'item_2', name: 'Khăn rằn may mắn', cat: 'Vật Phẩm', count: 53, icon: 'assets/v21/item-khanran.png', desc: 'Khăn rằn Nam Bộ đem lại may mắn cho vụ mùa.', rarity: 'uncommon' },
                { id: 'item_3', name: 'Bình sinh lực đại', cat: 'Vật Phẩm', count: 53, icon: 'assets/v21/items/potion.png', desc: 'Tiên dược đồng quê, hồi 600 HP lập tức.', rarity: 'uncommon', heal: 600 },
                { id: 'item_4', name: 'Hạt giống lúa nếp thần', cat: 'Vật Phẩm', count: 8, icon: 'assets/v21/items/seed.png', desc: 'Hạt lúa nếp cái hoa vàng thần kỳ gieo ở ruộng lúa.', rarity: 'rare', plantable: true, seedType: 'rice' },
                { id: 'item_5', name: 'Lưỡi kiếm cổ phong', cat: 'Trang Bị', count: 12, icon: 'assets/v21/items/blade.png', desc: 'Lưỡi kiếm rèn từ thép cổ, tăng 220 sát thương.', rarity: 'rare', atk: 220 },
                { id: 'item_6', name: 'Gỗ lim xẻ thần bí', cat: 'Vật Phẩm', count: 12, icon: 'assets/v21/items/wood.png', desc: 'Gỗ quý dùng chế tạo nông cụ và nâng cấp kiến trúc.', rarity: 'rare' },
                { id: 'item_7', name: 'Hồng ngọc thần bí', cat: 'Ngọc', count: 5, icon: 'assets/icons/gem_ruby.svg', desc: 'Ngọc quý chứa năng lượng hỏa, dùng rèn trang bị.', rarity: 'epic' },
                { id: 'item_8', name: 'Bình thể lực Thần Nông', cat: 'Vật Phẩm', count: 15, icon: 'assets/v21/items/mana_potion.png', desc: 'Hồi phục 50 điểm Thể Lực ngay tức khắc.', rarity: 'rare', restoreEnergy: 50 },
                { id: 'item_9', name: 'Bí kíp Thần Tiễn Thuật', cat: 'Khác', count: 10, icon: 'assets/v21/skills/archer/archer_skill_book.png', desc: 'Mật tịch võ công cổ truyền ghi chép bí thuật bách bộ xuyên dương.', rarity: 'legendary' },
                { id: 'item_10', name: 'Nanh sói dũng mãnh', cat: 'Vật Phẩm', count: 3, icon: 'assets/v21/items/fang.png', desc: 'Nanh dũng mãnh của sói hoang rừng sâu, tăng 500 EXP Pet.', rarity: 'rare', petExp: 500 },
                { id: 'item_11', name: 'Đá nâng cấp lam ngọc', cat: 'Ngọc', count: 24, icon: 'assets/icons/gem_stone.svg', desc: 'Đá cường hóa trang bị và kỹ năng thần bí.', rarity: 'rare' },
                { id: 'item_12', name: 'Lọ tiên dược chữa trị', cat: 'Vật Phẩm', count: 6, icon: 'assets/v21/items/potion.png', desc: 'Dược thảo ngâm hồi phục sinh lực thần tốc.', rarity: 'uncommon' },
                { id: 'item_13', name: 'Hạt bắp giống vàng', cat: 'Vật Phẩm', count: 15, icon: 'assets/icons/seed_corn.svg', desc: 'Hạt giống bắp cho năng suất cao, bán được nhiều Vàng.', rarity: 'uncommon', plantable: true, seedType: 'corn' },
                { id: 'item_14', name: 'Cung tiễn săn bắn', cat: 'Trang Bị', count: 1, icon: 'assets/icons/weapon_bow.svg', desc: 'Cung săn thú gia truyền bằng gỗ lim dẻo dai.', rarity: 'rare', atk: 280 },
                { id: 'item_15', name: 'Cuốc sắt trấn phái', cat: 'Trang Bị', count: 8, icon: 'assets/v21/items/hoe.png', desc: 'Cuốc sắt gia truyền rèn từ quặng thép tinh xảo.', rarity: 'epic', atk: 350 },
                { id: 'item_16', name: 'Bình Thần Dược Hồi Máu', cat: 'Vật Phẩm', count: 20, icon: 'assets/v21/items/potion.png', desc: 'Hồi phục 1.500 HP cho nhân vật.', rarity: 'rare', heal: 1500 },
                { id: 'item_17', name: 'Gỗ lim xây dựng', cat: 'Vật Phẩm', count: 35, icon: 'assets/v21/items/wood.png', desc: 'Gỗ xẻ từ rừng để nâng cấp Nhà Chính và Xưởng.', rarity: 'uncommon' },
                { id: 'item_18', name: 'Nông cụ Thần Nông', cat: 'Vật Phẩm', count: 42, icon: 'assets/v21/item-farmtools.png', desc: 'Bộ đồ nghề cày cuốc thu hoạch nông sản siêu tốc.', rarity: 'uncommon' },
                { id: 'item_19', name: 'Ngọc ấn làng Thạnh Khê', cat: 'Khác', count: 7, icon: 'assets/v21/items/seal.png', desc: 'Ngọc ấn tôn vinh nông dân xuất sắc thời loạn.', rarity: 'legendary' },
                { id: 'item_20', name: 'Bó lúa nếp hoàng kim', cat: 'Vật Phẩm', count: 10, icon: 'assets/v21/items/rice.png', desc: 'Lúa nếp nương thu hoạch vụ mùa bội thu, hồi đầy HP & Thể Lực.', rarity: 'epic', healFull: true },
                { id: 'item_21', name: 'Hạt giống vụ mùa', cat: 'Vật Phẩm', count: 12, icon: 'assets/v21/items/seed.png', desc: 'Hạt giống tuyển chọn gieo trồng trên đất tơi xốp.', rarity: 'rare', plantable: true, seedType: 'rice' },
                { id: 'item_22', name: 'Bí kíp Kiếm Sĩ Thần Oai', cat: 'Khác', count: 18, icon: 'assets/v21/skills/swordsman/swordsman_skill_book.png', desc: 'Mật tịch kiếm pháp hộ thân thời loạn lạc.', rarity: 'common' },
                { id: 'item_23', name: 'Nước thần hồi mana', cat: 'Vật Phẩm', count: 14, icon: 'assets/v21/items/mana_potion.png', desc: 'Nước suối nguồn tinh khiết phục hồi thể lực tức thì.', rarity: 'rare' },
                { id: 'item_24', name: 'Bí kíp Thích Khách U Ảnh', cat: 'Khác', count: 60, icon: 'assets/v21/skills/assassin/assassin_skill_book.png', desc: 'Bí kíp thân pháp di chuyển như bóng ma.', rarity: 'common' },
                { id: 'item_25', name: 'Đá Hồng Ngọc Tinh Khiết', cat: 'Ngọc', count: 10, icon: 'assets/icons/gem_ruby.svg', desc: 'Ngọc đổi được 100 Kim Cương.', rarity: 'legendary', diaVal: 100 },
                { id: 'item_26', name: 'Đao Phủ Sơn Tặc', cat: 'Trang Bị', count: 1, icon: 'assets/v21/items/blade.png', desc: 'Vũ khí đoạt được từ thổ phỉ, lực công phá mạnh mẽ.', rarity: 'rare', atk: 350 },
                { id: 'item_27', name: 'Dụng cụ sửa chữa', cat: 'Vật Phẩm', count: 1, icon: 'assets/v21/items/tools.png', desc: 'Tăng tốc độ sửa chữa nông trại và cạm bẫy.', rarity: 'rare', spd: 60, def: 80 },
                { id: 'item_28', name: 'Rương Thần Bí Nông Dân', cat: 'Khác', count: 2, icon: 'assets/icons/chest_gold.svg', desc: 'Mở ra cơ hội nhận vũ khí Sử Thi và hàng vạn Vàng.', rarity: 'legendary', isChest: true }
            ],
            skills: {
                danh_thuong: { id: 'danh_thuong', name: 'Đánh Thường', level: 10, icon: 'assets/v21/skills/farmer/farmer_basic_attack.png', desc: 'Chém liên hoàn bằng cuốc/kiếm gây 100% sát thương.', damagePercent: 100, cd: 0, lastUsed: 0 },
                cung_tien: { id: 'cung_tien', name: 'Cung Tiễn', level: 5, icon: 'assets/v21/skills/archer/archer_multi_arrow.png', desc: 'Tấn công mục tiêu bằng mưa tên thần, gây sát thương 180%.', damagePercent: 180, cd: 5, lastUsed: 0 },
                bay: { id: 'bay', name: 'Bẫy Gai', level: 3, icon: 'assets/v21/skills/swordsman/swordsman_iron_wall.png', desc: 'Đặt bẫy thú gai sắt trói chân quái vật 3 giây và gây 140% sát thương.', damagePercent: 140, cd: 8, lastUsed: 0 },
                tang_toc: { id: 'tang_toc', name: 'Tăng Tốc', level: 4, icon: 'assets/v21/skills/archer/archer_wind_step.png', desc: 'Kích hoạt Thần Hành Bộ tăng 80% tốc độ di chuyển trong 4 giây.', damagePercent: 0, cd: 12, lastUsed: 0 }
            },
            disciples: [
                {
                    id: 'tieulongnu',
                    name: 'Tiểu Long Nữ',
                    level: 20,
                    stars: 4,
                    hp: 3200,
                    maxHp: 3200,
                    attack: 820,
                    defense: 420,
                    speed: 280,
                    mode: 'follow', // 'follow' or 'attack'
                    autoAttack: true,
                    unlocked: true,
                    avatar: 'assets/v21/characters/swordsman/female/portrait.png'
                },
                {
                    id: 'kiemkhach',
                    name: 'Đệ Tử 2: Thiếu Niên Thần Tiễn',
                    level: 15,
                    stars: 3,
                    hp: 2400,
                    maxHp: 2400,
                    attack: 680,
                    defense: 350,
                    speed: 260,
                    mode: 'standby',
                    autoAttack: false,
                    unlocked: true,
                    avatar: 'assets/v21/characters/archer/male/portrait.png'
                },
                {
                    id: 'de_tu_3',
                    name: 'Đệ Tử 3: Hùng Vương Trưởng Lão',
                    level: 1,
                    stars: 5,
                    hp: 4500,
                    maxHp: 4500,
                    attack: 1100,
                    defense: 600,
                    speed: 300,
                    mode: 'locked',
                    autoAttack: false,
                    unlocked: false,
                    avatar: 'assets/v21/npc-hungking.png',
                    unlockReq: 'Cần đạt Cấp 25'
                }
            ],
            activeDiscipleId: 'tieulongnu',
            pets: [
                {
                    id: 'tieuchuot',
                    name: 'Khuyển Bảo (Chó Săn)',
                    level: 10,
                    maxLevel: 100,
                    hpBonus: 3000,
                    attackBonus: 420,
                    defenseBonus: 180,
                    speedBonus: 50,
                    active: true,
                    avatar: 'assets/v21/pets/dog/idle.png'
                },
                {
                    id: 'gatrong',
                    name: 'Ngưu Ma (Trâu Vàng)',
                    level: 5,
                    maxLevel: 100,
                    hpBonus: 1800,
                    attackBonus: 250,
                    defenseBonus: 110,
                    speedBonus: 30,
                    active: false,
                    avatar: 'assets/v21/pets/buffalo/idle.png'
                },
                {
                    id: 'heorung',
                    name: 'Chim Lạc Thần Long',
                    level: 1,
                    maxLevel: 100,
                    hpBonus: 2500,
                    attackBonus: 150,
                    defenseBonus: 350,
                    speedBonus: 20,
                    active: false,
                    locked: true,
                    unlockCost: 1000,
                    avatar: 'assets/v21/pets/lacbird/idle.png'
                }
            ],
            activePetId: 'tieuchuot',
            checkIn: {
                claimedDays: [1],
                rewards: [
                    { day: 1, text: '50.000 Vàng', type: 'gold', val: 50000, icon: 'assets/v21/items/rice.png' },
                    { day: 2, text: '20.000 Exp', type: 'exp', val: 20000, icon: 'assets/icons/gem_stone.svg' },
                    { day: 3, text: 'Bình Máu x10', type: 'potion', val: 10, icon: 'assets/v21/items/potion.png' },
                    { day: 4, text: '10 Kim Cương', type: 'diamond', val: 10, icon: 'assets/icons/gem_ruby.svg' },
                    { day: 5, text: '20.000 Vàng', type: 'gold', val: 20000, icon: 'assets/v21/items/rice.png' },
                    { day: 6, text: 'Đá Nâng Cấp x30', type: 'stone', val: 30, icon: 'assets/icons/gem_stone.svg' },
                    { day: 7, text: 'Rương Thần x1', type: 'chest', val: 1, icon: 'assets/icons/chest_gold.svg' }
                ],
                currentDay: 2,
                canClaimToday: true
            },
            quests: [
                {
                    id: 'q1',
                    title: 'Trồng lúa Thần Nông',
                    icon: 'assets/v21/ui/icons/farm.png',
                    current: 0,
                    target: 10,
                    rewardGold: 15000,
                    rewardDiamonds: 50,
                    rewardExp: 800,
                    claimed: false
                },
                {
                    id: 'q2',
                    title: 'Hoàn thành nhiệm vụ hiệp khách',
                    icon: 'assets/v21/ui/icons/quest.png',
                    current: 0,
                    target: 3,
                    rewardGold: 20000,
                    rewardDiamonds: 80,
                    rewardExp: 1200,
                    claimed: false
                },
                {
                    id: 'q3',
                    title: 'Thu thập gỗ và khoáng thạch',
                    icon: 'assets/v21/items/wood.png',
                    current: 0,
                    target: 5,
                    rewardGold: 12000,
                    rewardDiamonds: 40,
                    rewardExp: 600,
                    claimed: false
                }
            ],
            farmPlots: [
                { id: 0, status: 'ready', crop: 'rice', plantTime: Date.now() - 30000, growDuration: 15000, watered: true },
                { id: 1, status: 'growing', crop: 'rice', plantTime: Date.now() - 5000, growDuration: 15000, watered: true },
                { id: 2, status: 'empty', crop: null, plantTime: 0, growDuration: 0, watered: false },
                { id: 3, status: 'ready', crop: 'corn', plantTime: Date.now() - 40000, growDuration: 20000, watered: true },
                { id: 4, status: 'empty', crop: null, plantTime: 0, growDuration: 0, watered: false },
                { id: 5, status: 'empty', crop: null, plantTime: 0, growDuration: 0, watered: false }
            ],
            events: {
                currentEvent: 'Mùa Gặt Vàng',
                timeRemaining: '07/11 - 19/11',
                luckySpins: 3
            }
        };
    }

    recalculateStats() {
        const p = this.data.player;
        let bonusHp = 0;
        let bonusDef = 0;
        let bonusAtk = 0;
        let bonusSpd = 0;

        // From Equipment
        Object.values(this.data.equipment).forEach(eq => {
            if (eq) {
                if (eq.hp) bonusHp += eq.hp;
                if (eq.def) bonusDef += eq.def;
                if (eq.atk) bonusAtk += eq.atk;
                if (eq.spd) bonusSpd += eq.spd;
            }
        });

        // From Active Pet
        const activePet = this.data.pets.find(pet => pet.id === this.data.activePetId);
        if (activePet) {
            bonusHp += activePet.hpBonus || 0;
            bonusAtk += activePet.attackBonus || 0;
            bonusDef += activePet.defenseBonus || 0;
            bonusSpd += activePet.speedBonus || 0;
        }

        p.maxHp = p.baseHp ? (p.baseHp + bonusHp) : (2840);
        p.hp = Math.min(p.hp || p.maxHp, p.maxHp);
        p.attack = (p.baseAttack || 1500) + bonusAtk;
        p.defense = (p.baseDefense || 680) + bonusDef;
        p.speed = (p.baseSpeed || 320) + bonusSpd;

        // Combat Power formula
        p.combatPower = Math.round(p.attack * 8.5 + p.defense * 6 + p.maxHp * 1.5 + (p.level * 250));
    }

    addExp(amount) {
        const p = this.data.player;
        p.exp += amount;
        while (p.exp >= p.maxExp) {
            p.exp -= p.maxExp;
            p.level++;
            p.maxExp = Math.round(p.maxExp * 1.35);
            p.baseAttack += 45;
            p.baseDefense += 25;
            p.maxHp += 150;
            p.hp = p.maxHp;
            this.recalculateStats();
            return true; // leveled up
        }
        this.save();
        return false;
    }

    addGold(amount) {
        this.data.player.gold += amount;
        this.save();
    }

    spendGold(amount) {
        if (this.data.player.gold >= amount) {
            this.data.player.gold -= amount;
            this.save();
            return true;
        }
        return false;
    }

    addDiamonds(amount) {
        this.data.player.diamonds += amount;
        this.save();
    }

    spendDiamonds(amount) {
        if (this.data.player.diamonds >= amount) {
            this.data.player.diamonds -= amount;
            this.save();
            return true;
        }
        return false;
    }

    addItem(item) {
        const existing = this.data.inventory.find(i => i.name === item.name);
        if (existing) {
            existing.count += (item.count || 1);
        } else {
            if (this.data.inventory.length >= this.data.inventoryCapacity) {
                return false; // Full
            }
            this.data.inventory.push({ ...item, count: item.count || 1 });
        }
        this.save();
        return true;
    }

    removeItem(index, count = 1) {
        if (this.data.inventory[index]) {
            this.data.inventory[index].count -= count;
            if (this.data.inventory[index].count <= 0) {
                this.data.inventory.splice(index, 1);
            }
            this.save();
            return true;
        }
        return false;
    }

    progressQuest(type, amount = 1) {
        let changed = false;
        if (type === 'plant' || type === 'harvest') {
            const q = this.data.quests.find(x => x.id === 'q1');
            if (q && q.current < q.target) {
                q.current = Math.min(q.target, q.current + amount);
                changed = true;
            }
        }
        if (type === 'resource') {
            const q = this.data.quests.find(x => x.id === 'q3');
            if (q && q.current < q.target) {
                q.current = Math.min(q.target, q.current + amount);
                changed = true;
            }
        }
        if (changed) this.save();
    }

    save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
        } catch (e) {
            console.error('Save failed:', e);
        }
    }

    load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('NONG_DAN_THOI_LOAN_SAVE_V1');
            if (raw) {
                const parsed = JSON.parse(raw);
                const defaults = this.getDefaultState();
                this.data = { ...defaults, ...parsed };

                // Auto-migrate legacy emoji icons to authentic asset paths
                if (this.data.equipment) {
                    Object.keys(defaults.equipment).forEach(k => {
                        if (this.data.equipment[k] && (!this.data.equipment[k].icon || !this.data.equipment[k].icon.includes('/'))) {
                            this.data.equipment[k].icon = defaults.equipment[k].icon;
                        }
                    });
                }
                if (this.data.skills) {
                    Object.keys(defaults.skills).forEach(k => {
                        if (this.data.skills[k] && (!this.data.skills[k].icon || !this.data.skills[k].icon.includes('/'))) {
                            this.data.skills[k].icon = defaults.skills[k].icon;
                        }
                    });
                }
                if (this.data.inventory) {
                    this.data.inventory.forEach(invItem => {
                        const def = defaults.inventory.find(d => d.id === invItem.id || d.name === invItem.name);
                        if (def) invItem.icon = def.icon;
                    });
                }
                if (this.data.disciples) {
                    this.data.disciples.forEach(d => {
                        const def = defaults.disciples.find(x => x.id === d.id);
                        if (def) d.avatar = def.avatar;
                    });
                }
                if (this.data.pets) {
                    this.data.pets.forEach(p => {
                        const def = defaults.pets.find(x => x.id === p.id);
                        if (def) p.avatar = def.avatar;
                    });
                }
                this.save();
            }
        } catch (e) {
            console.warn('Load failed, using default state:', e);
        }
    }

    reset() {
        localStorage.removeItem(STORAGE_KEY);
        this.data = this.getDefaultState();
        this.recalculateStats();
    }
}

export const state = new GameState();
