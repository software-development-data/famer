// Game State Management & LocalStorage Persistence for "Nông Dân Thời Loạn"

const STORAGE_KEY = 'NONG_DAN_THOI_LOAN_SAVE_V1';

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
                avatar: 'avatar_farmer.png'
            },
            equipment: {
                hat: { id: 'hat_1', name: 'Nón Lá Thần Nông', type: 'hat', icon: '👒', hp: 450, def: 120, rarity: 'rare' },
                armor: { id: 'armor_1', name: 'Áo Nông Dân Bền Bỉ', type: 'armor', icon: '🥋', hp: 800, def: 240, rarity: 'rare' },
                weapon: { id: 'wpn_1', name: 'Cuốc Sắt Trấn Phái', type: 'weapon', icon: '⛏️', atk: 650, rarity: 'epic' },
                boots: { id: 'boot_1', name: 'Hài Cỏ Phiêu Du', type: 'boots', icon: '👞', spd: 80, def: 90, rarity: 'rare' },
                gloves: { id: 'glov_1', name: 'Hộ Thủ Vải Thô', type: 'gloves', icon: '🧤', atk: 180, def: 70, rarity: 'uncommon' },
                necklace: { id: 'neck_1', name: 'Ngọc Bội Bình An', type: 'necklace', icon: '📿', hp: 500, atk: 120, rarity: 'rare' },
                ring: { id: 'ring_1', name: 'Nhẫn Đồng May Mắn', type: 'ring', icon: '💍', atk: 150, def: 80, rarity: 'uncommon' },
                badge: { id: 'badge_1', name: 'Huân Chương Mùa Màng', type: 'badge', icon: '🌾', hp: 300, def: 60, rarity: 'uncommon' }
            },
            inventoryCapacity: 100,
            inventory: [
                { id: 'item_1', name: 'Nón sắt hiệp khách', cat: 'Trang Bị', count: 24, icon: '🪖', desc: 'Nón sắt của quân dịch thời loạn, tăng phòng thủ.', rarity: 'rare', def: 150 },
                { id: 'item_2', name: 'Búp bê vải may mắn', cat: 'Vật Phẩm', count: 53, icon: '🎎', desc: 'Búp bê dân gian đem lại may mắn cho vụ mùa.', rarity: 'uncommon' },
                { id: 'item_3', name: 'Tô bún riêu cua đồng', cat: 'Vật Phẩm', count: 53, icon: '🍜', desc: 'Đặc sản đồng quê, hồi 600 HP lập tức.', rarity: 'uncommon', heal: 600 },
                { id: 'item_4', name: 'Hạt giống lúa nếp thần', cat: 'Vật Phẩm', count: 8, icon: '🌾', desc: 'Hạt lúa nếp cái hoa vàng thần kỳ gieo ở ruộng lúa.', rarity: 'rare', plantable: true, seedType: 'rice' },
                { id: 'item_5', name: 'Áo giáp da hổ', cat: 'Trang Bị', count: 12, icon: '🦺', desc: 'Giáp da thú săn bắn ở rừng sâu, tăng 220 phòng thủ.', rarity: 'rare', def: 220 },
                { id: 'item_6', name: 'Cỏ thơm tiên thảo', cat: 'Vật Phẩm', count: 12, icon: '🌿', desc: 'Cây thuốc quý dùng bào chế đan dược tại Xưởng.', rarity: 'rare' },
                { id: 'item_7', name: 'Hồng ngọc thần bí', cat: 'Ngọc', count: 5, icon: '💎', desc: 'Ngọc quý chứa năng lượng hỏa, dùng rèn trang bị.', rarity: 'epic' },
                { id: 'item_8', name: 'Bình thể lực đại', cat: 'Vật Phẩm', count: 15, icon: '🧪', desc: 'Hồi phục 50 điểm Thể Lực ngay tức khắc.', rarity: 'rare', restoreEnergy: 50 },
                { id: 'item_9', name: 'Bí kíp Thần Nông Kinh', cat: 'Khác', count: 10, icon: '📜', desc: 'Mật tịch võ công cổ truyền ghi chép bí thuật làm nông.', rarity: 'legendary' },
                { id: 'item_10', name: 'Củ lạc hoàng kim', cat: 'Vật Phẩm', count: 3, icon: '🥜', desc: 'Thức ăn khoái khẩu của Pet Tiểu Chuột, tăng 500 EXP Pet.', rarity: 'rare', petExp: 500 },
                { id: 'item_11', name: 'Đá nâng cấp xanh', cat: 'Ngọc', count: 24, icon: '💠', desc: 'Đá cường hóa trang bị và kỹ năng thần bí.', rarity: 'rare' },
                { id: 'item_12', name: 'Lọ độc xà ngâm', cat: 'Vật Phẩm', count: 6, icon: '🍶', desc: 'Độc dược chiết xuất từ nhện rừng, dùng tẩm bẫy săn.', rarity: 'uncommon' },
                { id: 'item_13', name: 'Hạt giống bắp ngọt', cat: 'Vật Phẩm', count: 15, icon: '🌽', desc: 'Hạt giống bắp cho năng suất cao, bán được nhiều Vàng.', rarity: 'uncommon', plantable: true, seedType: 'corn' },
                { id: 'item_14', name: 'Cung tiễn săn bắn', cat: 'Trang Bị', count: 1, icon: '🏹', desc: 'Cung săn thú gia truyền bằng gỗ lim dẻo dai.', rarity: 'rare', atk: 280 },
                { id: 'item_15', name: 'Thỏi vàng nguyên bảo', cat: 'Khác', count: 8, icon: '🪙', desc: 'Bán tại Chợ nhận ngay 10.000 Vàng mỗi thỏi.', rarity: 'epic', sellGold: 10000 },
                { id: 'item_16', name: 'Bình Máu Siêu Cấp', cat: 'Vật Phẩm', count: 20, icon: '🩸', desc: 'Hồi phục 1.500 HP cho nhân vật.', rarity: 'rare', heal: 1500 },
                { id: 'item_17', name: 'Gỗ lim xây dựng', cat: 'Vật Phẩm', count: 35, icon: '🪵', desc: 'Gỗ xẻ từ rừng để nâng cấp Nhà Chính và Xưởng.', rarity: 'uncommon' },
                { id: 'item_18', name: 'Khoáng thạch sắt', cat: 'Vật Phẩm', count: 42, icon: '🪨', desc: 'Quặng sắt thô dùng đúc cuốc và vũ khí.', rarity: 'uncommon' },
                { id: 'item_19', name: 'Lông gà thần thoại', cat: 'Khác', count: 7, icon: '🪶', desc: 'Lông rơi từ Gà Trống Thần, tăng may mắn khi quay thưởng.', rarity: 'legendary' },
                { id: 'item_20', name: 'Bánh chưng truyền thống', cat: 'Vật Phẩm', count: 10, icon: '🍱', desc: 'Hồi phục toàn bộ HP và Thể Lực.', rarity: 'epic', healFull: true },
                { id: 'item_21', name: 'Nhẫn Bạc Trinh Sát', cat: 'Trang Bị', count: 1, icon: '💍', desc: 'Tăng 90 công và 40 tốc độ.', rarity: 'rare', atk: 90, spd: 40 },
                { id: 'item_22', name: 'Cá chép sông Hồng', cat: 'Vật Phẩm', count: 18, icon: '🐟', desc: 'Cá tươi câu dưới đầm sen, nguyên liệu nấu nướng.', rarity: 'common' },
                { id: 'item_23', name: 'Trà sen Bách Diệp', cat: 'Vật Phẩm', count: 14, icon: '🍵', desc: 'Thư giãn tâm trí, tăng 10% sát thương trong 5 phút.', rarity: 'rare' },
                { id: 'item_24', name: 'Lá chuối tươi', cat: 'Vật Phẩm', count: 60, icon: '🍃', desc: 'Vật liệu gói bánh và làm mui che ruộng.', rarity: 'common' },
                { id: 'item_25', name: 'Đá Kim Cương Tinh Khiết', cat: 'Ngọc', count: 10, icon: '💎', desc: 'Ngọc đổi được 100 Kim Cương.', rarity: 'legendary', diaVal: 100 },
                { id: 'item_26', name: 'Đao Phủ Sơn Tặc', cat: 'Trang Bị', count: 1, icon: '🗡️', desc: 'Vũ khí đoạt được từ thổ phỉ, lực công phá mạnh mẽ.', rarity: 'rare', atk: 350 },
                { id: 'item_27', name: 'Giày Da Hươu Rừng', cat: 'Trang Bị', count: 1, icon: '🥾', desc: 'Tăng 60 tốc độ và 80 phòng thủ.', rarity: 'rare', spd: 60, def: 80 },
                { id: 'item_28', name: 'Rương Thần Bí Nông Dân', cat: 'Khác', count: 2, icon: '🎁', desc: 'Mở ra cơ hội nhận vũ khí Sử Thi và hàng vạn Vàng.', rarity: 'legendary', isChest: true }
            ],
            skills: {
                danh_thuong: { id: 'danh_thuong', name: 'Đánh Thường', level: 10, icon: '🗡️', desc: 'Chém liên hoàn bằng cuốc/kiếm gây 100% sát thương.', damagePercent: 100, cd: 0, lastUsed: 0 },
                cung_tien: { id: 'cung_tien', name: 'Cung Tiễn', level: 5, icon: '🏹', desc: 'Tấn công mục tiêu bằng mũi tên thần, gây sát thương 180%.', damagePercent: 180, cd: 5, lastUsed: 0 },
                bay: { id: 'bay', name: 'Bẫy', level: 3, icon: '🪤', desc: 'Đặt bẫy thú gai nhọn trói chân quái vật 3 giây và gây 140% sát thương.', damagePercent: 140, cd: 8, lastUsed: 0 },
                tang_toc: { id: 'tang_toc', name: 'Tăng Tốc', level: 4, icon: '👟', desc: 'Tăng 80% tốc độ di chuyển trong 4 giây và tạo tàn ảnh né đòn.', damagePercent: 0, cd: 12, lastUsed: 0 }
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
                    avatar: 'disciple_girl.png'
                },
                {
                    id: 'kiemkhach',
                    name: 'Đệ Tử 2: Thiếu Niên Kiếm Khách',
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
                    avatar: 'farmer_hero.png'
                },
                {
                    id: 'de_tu_3',
                    name: 'Đệ Tử 3: Thần Nông Trưởng Lão',
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
                    unlockReq: 'Cần đạt Cấp 25'
                }
            ],
            activeDiscipleId: 'tieulongnu',
            pets: [
                {
                    id: 'tieuchuot',
                    name: 'Tiểu Chuột',
                    level: 10,
                    maxLevel: 100,
                    hpBonus: 3000,
                    attackBonus: 420,
                    defenseBonus: 180,
                    speedBonus: 50,
                    active: true,
                    avatar: 'pet_hamster.png'
                },
                {
                    id: 'gatrong',
                    name: 'Gà Trống Thần',
                    level: 5,
                    maxLevel: 100,
                    hpBonus: 1800,
                    attackBonus: 250,
                    defenseBonus: 110,
                    speedBonus: 30,
                    active: false,
                    avatar: 'rooster_pet.png'
                },
                {
                    id: 'heorung',
                    name: 'Heo Rừng Dũng Mãnh',
                    level: 1,
                    maxLevel: 100,
                    hpBonus: 2500,
                    attackBonus: 150,
                    defenseBonus: 350,
                    speedBonus: 20,
                    active: false,
                    locked: true,
                    unlockCost: 1000
                }
            ],
            activePetId: 'tieuchuot',
            checkIn: {
                claimedDays: [1],
                rewards: [
                    { day: 1, text: '50.000 Vàng', type: 'gold', val: 50000, icon: '🪙' },
                    { day: 2, text: '20.000 Exp', type: 'exp', val: 20000, icon: '⭐' },
                    { day: 3, text: 'Bình Máu x10', type: 'potion', val: 10, icon: '🩸' },
                    { day: 4, text: '10 Kim Cương', type: 'diamond', val: 10, icon: '💎' },
                    { day: 5, text: '20.000 Vàng', type: 'gold', val: 20000, icon: '💰' },
                    { day: 6, text: 'Đá Nâng Cấp x30', type: 'stone', val: 30, icon: '💠' },
                    { day: 7, text: 'Rương Thần x1', type: 'chest', val: 1, icon: '🎁' }
                ],
                currentDay: 2,
                canClaimToday: true
            },
            quests: [
                {
                    id: 'q1',
                    title: 'Trồng lúa 01',
                    icon: '🌾',
                    current: 0,
                    target: 10,
                    rewardGold: 15000,
                    rewardDiamonds: 50,
                    rewardExp: 800,
                    claimed: false
                },
                {
                    id: 'q2',
                    title: 'Hoàn thành nhiệm vụ',
                    icon: '📜',
                    current: 0,
                    target: 3,
                    rewardGold: 20000,
                    rewardDiamonds: 80,
                    rewardExp: 1200,
                    claimed: false
                },
                {
                    id: 'q3',
                    title: 'Thu thập tài nguyên',
                    icon: '🪵',
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
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                this.data = { ...this.getDefaultState(), ...parsed };
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
