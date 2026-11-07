// UI Controller for all 15 screens & dialog modals of "Nông Dân Thời Loạn"

import { state } from './state.js';
import { sound } from './audio.js';

export class UIManager {
    constructor(game) {
        this.game = game;
        this.activeModal = null;
        this.selectedInventoryIndex = null;
        this.selectedSkillKey = 'cung_tien';
        this.selectedDiscipleId = 'tieulongnu';
        this.selectedPetId = 'tieuchuot';
        this.selectedInventoryCategory = 'Tất Cả';
        this.selectedShopCategory = 'Đặc Biệt';
        this.selectedEventTab = 'dac_biet';
        this.isSpinning = false;

        this.initEventListeners();
    }

    initEventListeners() {
        // Title Screen Buttons
        document.getElementById('btn-play')?.addEventListener('click', () => {
            sound.playClick();
            if (!state.data.player.name || state.data.player.level === 1) {
                this.showModal('modal-create-char');
            } else {
                this.startGame();
            }
        });

        document.getElementById('btn-title-account')?.addEventListener('click', () => {
            sound.playClick();
            this.showModal('modal-login');
        });

        document.getElementById('btn-title-events')?.addEventListener('click', () => {
            sound.playClick();
            this.showModal('modal-events');
        });

        document.getElementById('btn-sound-toggle')?.addEventListener('click', () => {
            const isMuted = sound.toggleMute();
            document.getElementById('btn-sound-toggle').innerText = isMuted ? '🔇' : '🔊';
        });

        document.getElementById('btn-settings-title')?.addEventListener('click', () => {
            sound.playClick();
            this.showModal('modal-settings');
        });

        // Modal Close Buttons (All with .btn-close)
        document.querySelectorAll('.btn-close').forEach(btn => {
            btn.addEventListener('click', () => {
                sound.playClick();
                this.closeAllModals();
            });
        });

        // Login & Register & Forgot Password Form Handlers
        document.getElementById('form-login')?.addEventListener('submit', (e) => {
            e.preventDefault();
            sound.playClick();
            const username = document.getElementById('login-username').value;
            if (username) {
                state.data.account.username = username;
                state.save();
                this.showToast(`Đăng nhập thành công! Chào ${username}`, 'success');
                this.closeAllModals();
                this.startGame();
            }
        });

        document.getElementById('link-to-register')?.addEventListener('click', (e) => {
            e.preventDefault();
            sound.playClick();
            this.showModal('modal-register');
        });

        document.getElementById('link-forgot-pw')?.addEventListener('click', (e) => {
            e.preventDefault();
            sound.playClick();
            this.showModal('modal-forgot');
        });

        document.getElementById('form-register')?.addEventListener('submit', (e) => {
            e.preventDefault();
            sound.playClick();
            const username = document.getElementById('reg-username').value;
            if (username) {
                state.data.account.username = username;
                state.data.player.name = username;
                state.save();
                this.showToast(`Đăng ký tài khoản ${username} thành công!`, 'success');
                this.closeAllModals();
                this.showModal('modal-create-char');
            }
        });

        document.getElementById('form-forgot')?.addEventListener('submit', (e) => {
            e.preventDefault();
            sound.playClick();
            this.showToast('Đã gửi mã liên kết đặt lại mật khẩu về email của bạn!', 'info');
            this.showModal('modal-login');
        });

        document.getElementById('link-back-login')?.addEventListener('click', (e) => {
            e.preventDefault();
            sound.playClick();
            this.showModal('modal-login');
        });

        // Character Creation
        document.getElementById('btn-gender-male')?.addEventListener('click', () => {
            sound.playClick();
            state.data.player.gender = 'male';
            document.getElementById('btn-gender-male').classList.add('active');
            document.getElementById('btn-gender-female').classList.remove('active');
        });

        document.getElementById('btn-gender-female')?.addEventListener('click', () => {
            sound.playClick();
            state.data.player.gender = 'female';
            document.getElementById('btn-gender-female').classList.add('active');
            document.getElementById('btn-gender-male').classList.remove('active');
        });

        document.querySelectorAll('.avatar-choice').forEach((el, idx) => {
            el.addEventListener('click', () => {
                sound.playClick();
                document.querySelectorAll('.avatar-choice').forEach(c => c.classList.remove('selected'));
                el.classList.add('selected');
                state.data.player.style = idx;
            });
        });

        document.getElementById('btn-submit-create-char')?.addEventListener('click', () => {
            sound.playClick();
            const nameInput = document.getElementById('create-char-name').value.trim();
            if (nameInput) state.data.player.name = nameInput;
            state.save();
            this.showToast(`Nhân vật ${state.data.player.name} đã sẵn sàng khởi hành!`, 'success');
            this.closeAllModals();
            this.startGame();
        });

        // HUD Quick Feature Buttons
        document.getElementById('hud-btn-events')?.addEventListener('click', () => {
            sound.playClick();
            this.showModal('modal-events');
        });

        document.getElementById('hud-btn-checkin')?.addEventListener('click', () => {
            sound.playClick();
            this.showModal('modal-checkin');
        });

        document.getElementById('hud-btn-shop')?.addEventListener('click', () => {
            sound.playClick();
            this.showModal('modal-shop');
        });

        document.getElementById('hud-btn-quests')?.addEventListener('click', () => {
            sound.playClick();
            this.showModal('modal-quests');
        });

        document.getElementById('hud-avatar-box')?.addEventListener('click', () => {
            sound.playClick();
            this.showModal('modal-char-info');
        });

        document.getElementById('btn-hud-menu')?.addEventListener('click', () => {
            sound.playClick();
            this.showModal('modal-settings');
        });

        document.getElementById('btn-add-gold')?.addEventListener('click', () => {
            sound.playClick();
            this.showModal('modal-shop');
        });

        document.getElementById('btn-add-diamonds')?.addEventListener('click', () => {
            sound.playClick();
            this.showModal('modal-shop');
        });

        // Character Profile Vertical Navigation Tabs
        document.querySelectorAll('.char-info-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                sound.playClick();
                const target = tab.dataset.tab;
                document.querySelectorAll('.char-info-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Switch modal or view
                if (target === 'nhan_vat') {
                    this.showModal('modal-char-info');
                } else if (target === 'hanh_trang') {
                    this.showModal('modal-inventory');
                } else if (target === 'ky_nang') {
                    this.showModal('modal-skills');
                } else if (target === 'de_tu') {
                    this.showModal('modal-disciples');
                } else if (target === 'pet') {
                    this.showModal('modal-pets');
                } else if (target === 'danh_hieu') {
                    this.showToast('Danh Hiệu: Nông Dân Triệu Phú (Lực chiến +500)', 'info');
                }
            });
        });

        // Inventory Category Filter Tabs
        document.querySelectorAll('.inv-cat-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                sound.playClick();
                document.querySelectorAll('.inv-cat-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.selectedInventoryCategory = tab.dataset.cat;
                this.renderInventory();
            });
        });

        // Inventory Sort & Expand Buttons
        document.getElementById('btn-inv-sort')?.addEventListener('click', () => {
            sound.playClick();
            state.data.inventory.sort((a, b) => (b.count || 1) - (a.count || 1));
            state.save();
            this.renderInventory();
            this.showToast('Đã sắp xếp hành trang gọn gàng!', 'info');
        });

        document.getElementById('btn-inv-expand')?.addEventListener('click', () => {
            sound.playClick();
            if (state.spendDiamonds(20)) {
                state.data.inventoryCapacity += 10;
                state.save();
                this.renderInventory();
                this.showToast('Mở rộng thêm 10 ô hành trang!', 'success');
            } else {
                this.showToast('Không đủ Kim Cương (Cần 20 Kim Cương)', 'error');
            }
        });

        // Skills Screen Handler
        document.getElementById('btn-upgrade-skill')?.addEventListener('click', () => {
            this.upgradeSelectedSkill();
        });

        // Daily Check-in Claim
        document.getElementById('btn-claim-checkin')?.addEventListener('click', () => {
            this.claimDailyCheckIn();
        });

        // Pet Upgrade & Evolve
        document.getElementById('btn-upgrade-pet')?.addEventListener('click', () => {
            this.upgradePet();
        });

        document.getElementById('btn-evolve-pet')?.addEventListener('click', () => {
            this.evolvePet();
        });

        // Disciple Follow / Attack Mode
        document.getElementById('btn-disciple-follow')?.addEventListener('click', () => {
            sound.playClick();
            const d = state.data.disciples.find(x => x.id === this.selectedDiscipleId);
            if (d) {
                d.mode = 'follow';
                state.save();
                this.renderDisciples();
                this.showToast(`${d.name} chuyển sang chế độ Đi Theo`, 'info');
            }
        });

        document.getElementById('btn-disciple-attack')?.addEventListener('click', () => {
            sound.playClick();
            const d = state.data.disciples.find(x => x.id === this.selectedDiscipleId);
            if (d) {
                d.mode = 'attack';
                state.save();
                this.renderDisciples();
                this.showToast(`${d.name} chuyển sang chế độ Tấn Công Tự Do`, 'info');
            }
        });

        // Shop Category Tabs
        document.querySelectorAll('.shop-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                sound.playClick();
                document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.selectedShopCategory = tab.dataset.cat;
                this.renderShop();
            });
        });

        // Event Tabs
        document.querySelectorAll('.event-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                sound.playClick();
                document.querySelectorAll('.event-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.selectedEventTab = tab.dataset.tab;
                this.renderEvents();
            });
        });

        // Lucky Spin Wheel Trigger
        document.getElementById('btn-spin-wheel')?.addEventListener('click', () => {
            this.spinLuckyWheel();
        });
    }

    startGame() {
        document.getElementById('screen-title').classList.add('hidden');
        document.getElementById('screen-game').classList.remove('hidden');
        sound.startBGM();
        this.updateHUD();
        this.showToast(`Chào mừng bạn đến với Làng Nông Dân!`, 'success');
    }

    showModal(modalId) {
        this.closeAllModals();
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            this.activeModal = modalId;

            // Trigger specific modal renders
            if (modalId === 'modal-char-info') this.renderCharInfo();
            if (modalId === 'modal-inventory') this.renderInventory();
            if (modalId === 'modal-skills') this.renderSkills();
            if (modalId === 'modal-disciples') this.renderDisciples();
            if (modalId === 'modal-pets') this.renderPets();
            if (modalId === 'modal-checkin') this.renderCheckIn();
            if (modalId === 'modal-quests') this.renderQuests();
            if (modalId === 'modal-events') this.renderEvents();
            if (modalId === 'modal-shop') this.renderShop();
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
        this.activeModal = null;
        this.updateHUD();
    }

    updateHUD() {
        const p = state.data.player;
        state.recalculateStats();

        // Level & Name
        const nameEl = document.getElementById('hud-player-name');
        if (nameEl) nameEl.innerText = p.name;
        const lvlEl = document.getElementById('hud-player-level');
        if (lvlEl) lvlEl.innerText = `Lv.${p.level}`;

        // HP & Energy
        const hpText = document.getElementById('hud-hp-text');
        if (hpText) hpText.innerText = `${p.hp.toLocaleString()} / ${p.maxHp.toLocaleString()}`;
        const hpFill = document.getElementById('hud-hp-fill');
        if (hpFill) hpFill.style.width = `${Math.min(100, (p.hp / p.maxHp) * 100)}%`;

        const energyText = document.getElementById('hud-energy-text');
        if (energyText) energyText.innerText = `${p.energy} / ${p.maxEnergy}`;
        const energyFill = document.getElementById('hud-energy-fill');
        if (energyFill) energyFill.style.width = `${Math.min(100, (p.energy / p.maxEnergy) * 100)}%`;

        // Gold & Diamonds
        const goldEl = document.getElementById('hud-gold-val');
        if (goldEl) goldEl.innerText = p.gold.toLocaleString();
        const diaEl = document.getElementById('hud-diamonds-val');
        if (diaEl) diaEl.innerText = p.diamonds.toLocaleString();
    }

    renderCharInfo() {
        const p = state.data.player;
        state.recalculateStats();

        document.getElementById('char-info-name').innerText = p.name;
        document.getElementById('char-info-class').innerText = p.class;
        document.getElementById('char-info-level').innerText = p.level;
        document.getElementById('char-info-power').innerText = p.combatPower.toLocaleString();
        document.getElementById('char-info-hp').innerText = p.maxHp.toLocaleString();
        document.getElementById('char-info-energy').innerText = p.maxEnergy;
        document.getElementById('char-info-atk').innerText = p.attack.toLocaleString();
        document.getElementById('char-info-def').innerText = p.defense.toLocaleString();
        document.getElementById('char-info-spd').innerText = p.speed;

        // Render Equipment Slots
        const eqContainer = document.getElementById('char-equip-slots');
        if (eqContainer) {
            eqContainer.innerHTML = '';
            const slotKeys = ['hat', 'weapon', 'armor', 'gloves', 'boots', 'necklace', 'ring', 'badge'];
            slotKeys.forEach(slot => {
                const item = state.data.equipment[slot];
                const div = document.createElement('div');
                div.className = `equip-slot-box ${item ? 'equipped' : 'empty'}`;
                div.innerHTML = `
                    <div class="slot-icon">${item ? item.icon : '➕'}</div>
                    <div class="slot-label">${item ? item.name : slot.toUpperCase()}</div>
                `;
                div.addEventListener('click', () => {
                    if (item) {
                        this.showToast(`Đang trang bị: ${item.name}`, 'info');
                    }
                });
                eqContainer.appendChild(div);
            });
        }
    }

    renderInventory() {
        const container = document.getElementById('inventory-grid');
        const countLabel = document.getElementById('inv-capacity-label');
        if (countLabel) {
            countLabel.innerText = `Ô sử dụng: ${state.data.inventory.length}/${state.data.inventoryCapacity}`;
        }
        if (!container) return;

        container.innerHTML = '';

        // Filter items
        let items = state.data.inventory;
        if (this.selectedInventoryCategory !== 'Tất Cả') {
            items = items.filter(i => i.cat === this.selectedInventoryCategory);
        }

        // Render 100 slots (filled + empty)
        for (let i = 0; i < 24; i++) {
            const item = items[i];
            const slot = document.createElement('div');
            slot.className = `inv-slot ${item ? 'filled ' + (item.rarity || 'common') : 'empty'}`;

            if (item) {
                slot.innerHTML = `
                    <div class="inv-item-icon">${item.icon}</div>
                    <span class="inv-item-count">${item.count > 1 ? item.count : ''}</span>
                `;
                slot.addEventListener('click', () => {
                    this.showItemDetail(item, i);
                });
            } else {
                slot.innerHTML = `<span class="empty-plus"></span>`;
            }
            container.appendChild(slot);
        }
    }

    showItemDetail(item, index) {
        sound.playClick();
        const detailPanel = document.getElementById('inv-item-detail');
        if (!detailPanel) return;

        detailPanel.classList.remove('hidden');
        document.getElementById('detail-item-icon').innerText = item.icon;
        document.getElementById('detail-item-name').innerText = item.name;
        document.getElementById('detail-item-desc').innerText = item.desc || 'Vật phẩm nông nghiệp quý giá.';

        const btnUse = document.getElementById('btn-detail-use');
        const btnSell = document.getElementById('btn-detail-sell');

        btnUse.onclick = () => {
            sound.playHarvest();
            if (item.heal) {
                state.data.player.hp = Math.min(state.data.player.maxHp, state.data.player.hp + item.heal);
                this.showToast(`Đã sử dụng ${item.name}, hồi ${item.heal} HP!`, 'success');
                state.removeItem(index, 1);
            } else if (item.plantable) {
                this.showToast(`Hãy đi đến Ruộng Lúa Thần Nông để gieo hạt ${item.name}!`, 'info');
                this.closeAllModals();
            } else if (item.petExp) {
                const pet = state.data.pets.find(p => p.id === state.data.activePetId);
                if (pet) {
                    pet.level = Math.min(pet.maxLevel, pet.level + 1);
                    pet.hpBonus += 150;
                    pet.attackBonus += 25;
                    pet.defenseBonus += 12;
                    state.removeItem(index, 1);
                    this.showToast(`${pet.name} ăn củ lạc và tăng lên cấp ${pet.level}!`, 'success');
                }
            } else {
                this.showToast(`Đã sử dụng ${item.name}!`, 'success');
                state.removeItem(index, 1);
            }
            state.save();
            this.updateHUD();
            this.renderInventory();
            detailPanel.classList.add('hidden');
        };

        btnSell.onclick = () => {
            sound.playCoin();
            const goldEarned = item.sellGold || ((item.count || 1) * 300);
            state.addGold(goldEarned);
            state.removeItem(index, item.count || 1);
            this.showToast(`Đã bán ${item.name}, nhận ${goldEarned.toLocaleString()} Vàng!`, 'success');
            this.updateHUD();
            this.renderInventory();
            detailPanel.classList.add('hidden');
        };
    }

    renderSkills() {
        const list = document.getElementById('skills-list-container');
        if (!list) return;

        list.innerHTML = '';
        Object.entries(state.data.skills).forEach(([key, skill]) => {
            const item = document.createElement('div');
            item.className = `skill-list-item ${this.selectedSkillKey === key ? 'active' : ''}`;
            item.innerHTML = `
                <div class="skill-item-icon">${skill.icon}</div>
                <div class="skill-item-info">
                    <div class="skill-item-name">${skill.name}</div>
                    <div class="skill-item-lvl">Cấp: ${skill.level}</div>
                </div>
            `;
            item.addEventListener('click', () => {
                sound.playClick();
                this.selectedSkillKey = key;
                this.renderSkills();
            });
            list.appendChild(item);
        });

        // Detail preview
        const cur = state.data.skills[this.selectedSkillKey];
        if (cur) {
            document.getElementById('skill-detail-icon').innerText = cur.icon;
            document.getElementById('skill-detail-name').innerText = cur.name;
            document.getElementById('skill-detail-level').innerText = `Cấp: ${cur.level}`;
            document.getElementById('skill-detail-desc').innerText = cur.desc;
            document.getElementById('skill-detail-dmg').innerText = `Sát thương: ${cur.damagePercent}%`;
            document.getElementById('skill-detail-cd').innerText = `Hồi chiêu: ${cur.cd}s`;
            const cost = cur.level * 2500;
            document.getElementById('skill-upgrade-cost').innerText = `Chi phí: ${cost.toLocaleString()} Vàng`;
        }
    }

    upgradeSelectedSkill() {
        const cur = state.data.skills[this.selectedSkillKey];
        if (!cur) return;
        const cost = cur.level * 2500;
        if (state.spendGold(cost)) {
            sound.playLevelUp();
            cur.level++;
            cur.damagePercent += 15;
            state.save();
            this.renderSkills();
            this.updateHUD();
            this.showToast(`Kỹ năng ${cur.name} đã thăng lên Cấp ${cur.level}!`, 'success');
        } else {
            sound.playClick();
            this.showToast('Không đủ Vàng để nâng cấp kỹ năng!', 'error');
        }
    }

    renderDisciples() {
        const container = document.getElementById('disciple-list-items');
        if (!container) return;

        container.innerHTML = '';
        state.data.disciples.forEach(d => {
            const item = document.createElement('div');
            item.className = `disciple-list-box ${this.selectedDiscipleId === d.id ? 'active' : ''} ${d.unlocked ? '' : 'locked'}`;
            item.innerHTML = `
                <div class="disciple-avatar-icon">${d.unlocked ? '🥋' : '🔒'}</div>
                <div class="disciple-box-info">
                    <div class="disciple-name">${d.name}</div>
                    <div class="disciple-lvl">${d.unlocked ? `Cấp: ${d.level}` : (d.unlockReq || 'Khóa')}</div>
                </div>
            `;
            item.addEventListener('click', () => {
                sound.playClick();
                if (d.unlocked) {
                    this.selectedDiscipleId = d.id;
                    state.data.activeDiscipleId = d.id;
                    state.save();
                    this.renderDisciples();
                } else {
                    this.showToast(d.unlockReq || 'Chưa mở khóa đệ tử này!', 'info');
                }
            });
            container.appendChild(item);
        });

        // Detail
        const active = state.data.disciples.find(d => d.id === this.selectedDiscipleId);
        if (active) {
            document.getElementById('disciple-detail-name').innerText = active.name;
            document.getElementById('disciple-detail-hp').innerText = `HP: ${active.hp.toLocaleString()}`;
            document.getElementById('disciple-detail-atk').innerText = `Công: ${active.attack.toLocaleString()}`;
            document.getElementById('disciple-detail-def').innerText = `Thủ: ${active.defense.toLocaleString()}`;
            document.getElementById('disciple-detail-spd').innerText = `Tốc độ: ${active.speed}`;

            const chkAuto = document.getElementById('chk-disciple-auto');
            if (chkAuto) {
                chkAuto.checked = !!active.autoAttack;
                chkAuto.onchange = (e) => {
                    active.autoAttack = e.target.checked;
                    state.save();
                };
            }
        }
    }

    renderPets() {
        const container = document.getElementById('pets-list-items');
        if (!container) return;

        container.innerHTML = '';
        state.data.pets.forEach(pet => {
            const item = document.createElement('div');
            item.className = `pet-list-box ${this.selectedPetId === pet.id ? 'active' : ''} ${pet.locked ? 'locked' : ''}`;
            item.innerHTML = `
                <div class="pet-avatar-icon">${pet.id === 'tieuchuot' ? '🐹' : (pet.id === 'gatrong' ? '🐓' : '🐗')}</div>
                <div class="pet-box-info">
                    <div class="pet-name">${pet.name}</div>
                    <div class="pet-lvl">${pet.locked ? 'Khóa' : `Cấp: ${pet.level}/100`}</div>
                </div>
            `;
            item.addEventListener('click', () => {
                sound.playClick();
                if (pet.locked) {
                    this.showToast(`Mở khóa cần ${pet.unlockCost} Kim Cương!`, 'info');
                } else {
                    this.selectedPetId = pet.id;
                    state.data.activePetId = pet.id;
                    state.save();
                    this.renderPets();
                }
            });
            container.appendChild(item);
        });

        const activePet = state.data.pets.find(p => p.id === this.selectedPetId);
        if (activePet) {
            document.getElementById('pet-detail-name').innerText = activePet.name;
            document.getElementById('pet-detail-level').innerText = `Cấp: ${activePet.level}/100`;
            document.getElementById('pet-detail-hp').innerText = `+${activePet.hpBonus.toLocaleString()}`;
            document.getElementById('pet-detail-atk').innerText = `+${activePet.attackBonus.toLocaleString()}`;
            document.getElementById('pet-detail-def').innerText = `+${activePet.defenseBonus.toLocaleString()}`;
        }
    }

    upgradePet() {
        const pet = state.data.pets.find(p => p.id === this.selectedPetId);
        if (!pet) return;
        const cost = pet.level * 1500;
        if (state.spendGold(cost)) {
            sound.playLevelUp();
            pet.level = Math.min(pet.maxLevel, pet.level + 1);
            pet.hpBonus += 250;
            pet.attackBonus += 35;
            pet.defenseBonus += 15;
            state.save();
            this.renderPets();
            this.updateHUD();
            this.showToast(`${pet.name} đã được nâng cấp lên Cấp ${pet.level}!`, 'success');
        } else {
            sound.playClick();
            this.showToast(`Không đủ Vàng (Cần ${cost.toLocaleString()} Vàng)!`, 'error');
        }
    }

    evolvePet() {
        sound.playLevelUp();
        this.showToast(`Tiểu Chuột đã kích hoạt Hào Quang Thần Thú!`, 'success');
    }

    renderCheckIn() {
        const grid = document.getElementById('checkin-grid');
        if (!grid) return;

        grid.innerHTML = '';
        state.data.checkIn.rewards.forEach(r => {
            const isClaimed = state.data.checkIn.claimedDays.includes(r.day);
            const isToday = state.data.checkIn.currentDay === r.day;
            const div = document.createElement('div');
            div.className = `checkin-day-card ${isClaimed ? 'claimed' : ''} ${isToday ? 'today' : ''}`;
            div.innerHTML = `
                <div class="day-title">Ngày ${r.day}</div>
                <div class="day-icon">${r.icon}</div>
                <div class="day-reward">${r.text}</div>
                ${isClaimed ? '<div class="day-badge-claimed">✔ Đã nhận</div>' : ''}
            `;
            grid.appendChild(div);
        });

        const btn = document.getElementById('btn-claim-checkin');
        if (btn) {
            btn.disabled = !state.data.checkIn.canClaimToday;
            btn.innerText = state.data.checkIn.canClaimToday ? 'Điểm Danh Ngay' : 'Đã Điểm Danh Hôm Nay';
        }
    }

    claimDailyCheckIn() {
        if (!state.data.checkIn.canClaimToday) return;

        sound.playLevelUp();
        const curDay = state.data.checkIn.currentDay;
        const r = state.data.checkIn.rewards.find(x => x.day === curDay);

        if (r) {
            if (r.type === 'gold') state.addGold(r.val);
            if (r.type === 'diamond') state.addDiamonds(r.val);
            if (r.type === 'exp') state.addExp(r.val);
            if (r.type === 'potion') state.addItem({ name: 'Bình Máu Siêu Cấp', cat: 'Vật Phẩm', count: r.val, icon: '🩸', heal: 1500 });
            if (r.type === 'stone') state.addItem({ name: 'Đá nâng cấp xanh', cat: 'Ngọc', count: r.val, icon: '💠' });
            if (r.type === 'chest') state.addItem({ name: 'Rương Thần Nông', cat: 'Khác', count: 1, icon: '🎁', isChest: true });

            state.data.checkIn.claimedDays.push(curDay);
            state.data.checkIn.canClaimToday = false;
            state.save();

            this.updateHUD();
            this.renderCheckIn();
            this.showToast(`Điểm danh thành công! Nhận ${r.text}`, 'success');
        }
    }

    renderQuests() {
        const container = document.getElementById('quests-list-container');
        if (!container) return;

        container.innerHTML = '';
        state.data.quests.forEach(q => {
            const isCompleted = q.current >= q.target;
            const item = document.createElement('div');
            item.className = `quest-card ${isCompleted ? 'completed' : ''}`;
            item.innerHTML = `
                <div class="quest-icon">${q.icon}</div>
                <div class="quest-info">
                    <div class="quest-title">${q.title}</div>
                    <div class="quest-progress-bar">
                        <div class="quest-progress-fill" style="width: ${Math.min(100, (q.current / q.target) * 100)}%"></div>
                    </div>
                    <div class="quest-progress-text">${q.current} / ${q.target}</div>
                </div>
                <div class="quest-reward">
                    <button class="btn-quest-claim ${isCompleted && !q.claimed ? 'active' : ''}" ${q.claimed ? 'disabled' : ''}>
                        ${q.claimed ? 'Đã Nhận' : 'Nhận Thưởng'}
                    </button>
                </div>
            `;

            const claimBtn = item.querySelector('.btn-quest-claim');
            claimBtn.addEventListener('click', () => {
                if (isCompleted && !q.claimed) {
                    sound.playCoin();
                    q.claimed = true;
                    state.addGold(q.rewardGold);
                    state.addDiamonds(q.rewardDiamonds);
                    state.addExp(q.rewardExp);
                    state.save();
                    this.updateHUD();
                    this.renderQuests();
                    this.showToast(`Hoàn thành ${q.title}! Nhận ${q.rewardGold.toLocaleString()} Vàng & ${q.rewardDiamonds} Kim Cương!`, 'success');
                } else if (!isCompleted) {
                    this.showToast(`Chưa hoàn thành nhiệm vụ (${q.current}/${q.target})`, 'info');
                }
            });

            container.appendChild(item);
        });
    }

    renderEvents() {
        const content = document.getElementById('events-tab-content');
        if (!content) return;

        if (this.selectedEventTab === 'dac_biet') {
            content.innerHTML = `
                <div class="event-banner-box">
                    <div class="event-banner-title">Mùa Gặt Vàng - Thu Hoạch Nhận Quà</div>
                    <div class="event-banner-sub">Thời gian: 07/11 - 19/11</div>
                    <p class="event-banner-desc">Trong thời gian diễn ra sự kiện, mỗi khi thu hoạch lúa nếp hoặc bắp ngọt sẽ nhận thêm Rương Mùa Vàng chứa trang bị Sử Thi!</p>
                    <button class="btn-gold-emboss" id="btn-participate-event">Tham Gia Ngay</button>
                </div>
            `;
            document.getElementById('btn-participate-event')?.addEventListener('click', () => {
                sound.playClick();
                this.closeAllModals();
                this.showToast('Hãy tiến đến Ruộng Lúa để tham gia Mùa Gặt Vàng!', 'success');
            });
        } else if (this.selectedEventTab === 'vong_quay') {
            content.innerHTML = `
                <div class="lucky-wheel-container">
                    <div class="wheel-pointer">▼</div>
                    <div class="lucky-wheel" id="lucky-wheel-disc">
                        <div class="wheel-slice" style="--r: 0deg; background: #fbbf24;">10k Vàng</div>
                        <div class="wheel-slice" style="--r: 60deg; background: #38bdf8;">20 Kim Cương</div>
                        <div class="wheel-slice" style="--r: 120deg; background: #4ade80;">Hạt Giống Thần</div>
                        <div class="wheel-slice" style="--r: 180deg; background: #f87171;">Cuốc Sử Thi</div>
                        <div class="wheel-slice" style="--r: 240deg; background: #c084fc;">50k Vàng</div>
                        <div class="wheel-slice" style="--r: 300deg; background: #f472b6;">100 Kim Cương</div>
                    </div>
                    <button class="btn-gold-emboss" id="btn-spin-wheel" ${this.isSpinning ? 'disabled' : ''}>Quay Thưởng (100 Kim Cương)</button>
                </div>
            `;
            document.getElementById('btn-spin-wheel')?.addEventListener('click', () => {
                this.spinLuckyWheel();
            });
        } else if (this.selectedEventTab === 'dua_top') {
            content.innerHTML = `
                <div class="leaderboard-table">
                    <h3>🏆 Bảng Xếp Hạng Lực Chiến Cao Thủ</h3>
                    <div class="lb-row gold"><span>🥇 Hạng 1:</span> <b>Đại Thần Nông</b> <span>58.920 LC</span></div>
                    <div class="lb-row silver"><span>🥈 Hạng 2:</span> <b>Nông Dân 1090 (Bạn)</b> <span>24.680 LC</span></div>
                    <div class="lb-row bronze"><span>🥉 Hạng 3:</span> <b>Vua Trồng Trọt</b> <span>21.400 LC</span></div>
                    <div class="lb-row"><span>4: Lão Hạc Cày Cuốc</span> <span>18.250 LC</span></div>
                </div>
            `;
        } else {
            content.innerHTML = `
                <div class="event-banner-box">
                    <h3>💰 Tích Lũy Vụ Mùa</h3>
                    <p>Thu hoạch đạt 50 lần: Nhận Gà Trống Thần Thoại</p>
                    <p>Đăng nhập liên tục 7 ngày: Nhận Set Nông Dân Hoàng Kim</p>
                </div>
            `;
        }
    }

    spinLuckyWheel() {
        if (this.isSpinning) return;
        if (!state.spendDiamonds(100)) {
            sound.playClick();
            this.showToast('Không đủ Kim Cương để quay (Cần 100 Kim Cương)!', 'error');
            return;
        }

        this.isSpinning = true;
        sound.playSpinTick();
        const disc = document.getElementById('lucky-wheel-disc');
        const randomDeg = 1440 + Math.floor(Math.random() * 360);
        if (disc) {
            disc.style.transition = 'transform 3.5s cubic-bezier(0.15, 0.9, 0.25, 1)';
            disc.style.transform = `rotate(${randomDeg}deg)`;
        }

        setTimeout(() => {
            this.isSpinning = false;
            sound.playLevelUp();
            state.addGold(50000);
            this.updateHUD();
            this.showToast('Chúc mừng! Bạn đã quay trúng 50.000 Vàng & 1 Hạt Giống Thần!', 'success');
        }, 3600);
    }

    renderShop() {
        const container = document.getElementById('shop-items-grid');
        if (!container) return;

        container.innerHTML = '';

        const shopCatalog = {
            'Đặc Biệt': [
                { name: 'Gói Nông Dân', price: 500, currency: 'diamond', icon: '🌾', desc: 'Chứa 100k Vàng, 10 Hạt giống lúa nếp thần, 5 Bình máu.', yieldItem: { name: 'Gói Nông Dân', cat: 'Khác', count: 1, icon: '🌾' } },
                { name: 'Gói Nâng Cấp', price: 200, currency: 'diamond', icon: '💠', desc: 'Chứa 50 Đá nâng cấp xanh và 20k Exp bí kíp.', yieldItem: { name: 'Đá nâng cấp xanh', cat: 'Ngọc', count: 50, icon: '💠' } },
                { name: 'Gói Đặc Biệt', price: 1000, currency: 'diamond', icon: '🎁', desc: 'Nhận ngay Cuốc Hoàng Kim và 300k Vàng!', yieldItem: { name: 'Cuốc Hoàng Kim Thần Thoại', cat: 'Trang Bị', count: 1, icon: '⛏️', atk: 1200, rarity: 'legendary' } }
            ],
            'Vật Phẩm': [
                { name: 'Hạt Giống Lúa Nếp', price: 1000, currency: 'gold', icon: '🌾', yieldItem: { name: 'Hạt giống lúa nếp thần', cat: 'Vật Phẩm', count: 5, icon: '🌾', plantable: true, seedType: 'rice' } },
                { name: 'Hạt Giống Bắp Ngọt', price: 1500, currency: 'gold', icon: '🌽', yieldItem: { name: 'Hạt giống bắp ngọt', cat: 'Vật Phẩm', count: 5, icon: '🌽', plantable: true, seedType: 'corn' } },
                { name: 'Bình Máu Đại', price: 800, currency: 'gold', icon: '🩸', yieldItem: { name: 'Bình Máu Siêu Cấp', cat: 'Vật Phẩm', count: 5, icon: '🩸', heal: 1500 } }
            ],
            'Trang Bị': [
                { name: 'Nón Lá Sắt', price: 20000, currency: 'gold', icon: '👒', yieldItem: { name: 'Nón Lá Sắt Bền', cat: 'Trang Bị', count: 1, icon: '👒', def: 200 } },
                { name: 'Cuốc Rèn Thép', price: 35000, currency: 'gold', icon: '⛏️', yieldItem: { name: 'Cuốc Thép Tinh Luyện', cat: 'Trang Bị', count: 1, icon: '⛏️', atk: 450 } }
            ],
            'Ngọc': [
                { name: 'Hồng Ngọc Hỏa', price: 50, currency: 'diamond', icon: '💎', yieldItem: { name: 'Hồng ngọc thần bí', cat: 'Ngọc', count: 2, icon: '💎' } },
                { name: 'Đá Cường Hóa', price: 30, currency: 'diamond', icon: '💠', yieldItem: { name: 'Đá nâng cấp xanh', cat: 'Ngọc', count: 10, icon: '💠' } }
            ]
        };

        const list = shopCatalog[this.selectedShopCategory] || shopCatalog['Đặc Biệt'];

        list.forEach(item => {
            const card = document.createElement('div');
            card.className = 'shop-item-card';
            card.innerHTML = `
                <div class="shop-item-icon">${item.icon}</div>
                <div class="shop-item-title">${item.name}</div>
                <div class="shop-item-desc">${item.desc || ''}</div>
                <button class="btn-shop-buy">
                    ${item.currency === 'diamond' ? '💎' : '🪙'} ${item.price.toLocaleString()}
                </button>
            `;

            card.querySelector('.btn-shop-buy').addEventListener('click', () => {
                let success = false;
                if (item.currency === 'diamond') {
                    success = state.spendDiamonds(item.price);
                } else {
                    success = state.spendGold(item.price);
                }

                if (success) {
                    sound.playCoin();
                    state.addItem(item.yieldItem);
                    this.updateHUD();
                    this.showToast(`Đã mua thành công ${item.name}!`, 'success');
                } else {
                    sound.playClick();
                    this.showToast(`Không đủ ${item.currency === 'diamond' ? 'Kim Cương' : 'Vàng'}!`, 'error');
                }
            });

            container.appendChild(card);
        });
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `game-toast toast-${type}`;
        toast.innerText = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 400);
        }, 2500);
    }
}
