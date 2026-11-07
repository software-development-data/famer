// Main Game Controller, Loop, and Input Processing for "Nông Dân Thời Loạn"

import { state } from './state.js';
import { sound } from './audio.js';
import { World } from './world.js';
import { Player, Disciple, Pet, Enemy } from './entities.js';
import { CombatManager } from './combat.js';
import { FarmingManager } from './farming.js';
import { Renderer } from './renderer.js';
import { UIManager } from './ui.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.renderer = new Renderer(this.canvas);
        this.world = new World();
        this.combat = new CombatManager();
        this.farming = new FarmingManager();
        this.ui = new UIManager(this);

        // Player starting in village plaza
        this.player = new Player(780, 520);
        this.player.name = state.data.player.name;

        // Disciple
        const activeDisciple = state.data.disciples.find(d => d.id === state.data.activeDiscipleId) || state.data.disciples[0];
        this.disciple = new Disciple(activeDisciple, this.player);

        // Pet
        const activePet = state.data.pets.find(p => p.id === state.data.activePetId) || state.data.pets[0];
        this.pet = new Pet(activePet, this.player);

        // Spawn Enemies in Wild Forest
        this.enemies = this.spawnEnemies();

        // Input state
        this.input = {
            keys: {},
            joystickActive: false,
            joystickX: 0,
            joystickY: 0
        };

        // Timing
        this.lastTime = performance.now();
        this.nearbyPrompt = null;

        // Store reference for renderer access
        window.__gameState = state;
        window.soundEngine = sound;

        this.initInputs();
        this.initHUDControls();
        this.loop();
    }

    spawnEnemies() {
        const list = [];
        // Heo Rừng (Wild Boars)
        list.push(new Enemy('heorung', 1800, 420));
        list.push(new Enemy('heorung', 1950, 680));
        list.push(new Enemy('heorung', 2100, 950));

        // Quạ Đen (Crows)
        list.push(new Enemy('quaden', 1880, 260));
        list.push(new Enemy('quaden', 2220, 450));

        // Nhện Độc (Giant Spiders)
        list.push(new Enemy('nhen', 1980, 850));
        list.push(new Enemy('nhen', 2280, 780));

        // Sói Rừng (Wild Wolves from V21)
        list.push(new Enemy('wolf', 1850, 520));
        list.push(new Enemy('wolf', 2050, 750));

        // Thổ Phỉ (Bandit Raider Chiefs)
        list.push(new Enemy('thophi', 2150, 320));
        list.push(new Enemy('thophi', 2340, 600));

        return list;
    }

    initInputs() {
        // Keyboard
        window.addEventListener('keydown', (e) => {
            this.input.keys[e.code] = true;

            // Attack & Skills shortcuts
            if (e.code === 'Space' || e.code === 'KeyJ') {
                e.preventDefault();
                this.combat.playerAttack(this.player, this.enemies);
            }
            if (e.code === 'KeyK') {
                e.preventDefault();
                this.combat.useSkill('cung_tien', this.player, this.enemies);
            }
            if (e.code === 'KeyL') {
                e.preventDefault();
                this.combat.useSkill('bay', this.player, this.enemies);
            }
            if (e.code === 'ShiftLeft' || e.code === 'KeyU') {
                e.preventDefault();
                this.combat.useSkill('tang_toc', this.player, this.enemies);
            }

            // Interact
            if (e.code === 'KeyE') {
                this.triggerProximityInteract();
            }

            // Quick Menus
            if (e.code === 'KeyB' || e.code === 'KeyI') {
                this.ui.showModal('modal-inventory');
            }
            if (e.code === 'KeyC') {
                this.ui.showModal('modal-char-info');
            }
        });

        window.addEventListener('keyup', (e) => {
            this.input.keys[e.code] = false;
        });

        // Mouse click on world
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clickScreenX = (e.clientX - rect.left) * (this.renderer.width / rect.width);
            const clickScreenY = (e.clientY - rect.top) * (this.renderer.height / rect.height);

            const worldX = clickScreenX + this.renderer.camera.x;
            const worldY = clickScreenY + this.renderer.camera.y;

            // Check if clicking on a Farm Plot
            const plot = this.farming.getPlotAt(worldX, worldY);
            if (plot) {
                if (plot.status === 'ready') {
                    this.farming.harvest(plot.id, this.combat);
                } else if (plot.status === 'empty') {
                    this.farming.plant(plot.id, 'rice');
                    this.ui.showToast('Đã gieo Hạt giống Lúa nếp thần!', 'success');
                } else if (plot.status === 'growing' && !plot.watered) {
                    this.farming.water(plot.id);
                    this.ui.showToast('Đã tưới nước, lúa lớn nhanh hơn!', 'info');
                }
                return;
            }

            // Otherwise, move player to destination
            this.player.targetX = worldX;
            this.player.targetY = worldY;
        });
    }

    initHUDControls() {
        // Virtual Joystick
        const joystickBase = document.getElementById('joystick-base');
        const joystickThumb = document.getElementById('joystick-thumb');

        if (joystickBase && joystickThumb) {
            const handleJoystickMove = (clientX, clientY) => {
                const rect = joystickBase.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const dx = clientX - centerX;
                const dy = clientY - centerY;
                const dist = Math.hypot(dx, dy);
                const maxRadius = rect.width / 2 - 15;

                const clampedDist = Math.min(dist, maxRadius);
                const angle = Math.atan2(dy, dx);
                const thumbX = Math.cos(angle) * clampedDist;
                const thumbY = Math.sin(angle) * clampedDist;

                joystickThumb.style.transform = `translate(${thumbX}px, ${thumbY}px)`;

                if (dist > 8) {
                    this.input.joystickActive = true;
                    this.input.joystickX = Math.cos(angle);
                    this.input.joystickY = Math.sin(angle);
                } else {
                    this.input.joystickActive = false;
                    this.input.joystickX = 0;
                    this.input.joystickY = 0;
                }
            };

            const endJoystick = () => {
                this.input.joystickActive = false;
                this.input.joystickX = 0;
                this.input.joystickY = 0;
                joystickThumb.style.transform = 'translate(0px, 0px)';
            };

            joystickBase.addEventListener('pointerdown', (e) => {
                joystickBase.setPointerCapture(e.pointerId);
                handleJoystickMove(e.clientX, e.clientY);
            });

            joystickBase.addEventListener('pointermove', (e) => {
                if (this.input.joystickActive || e.buttons > 0) {
                    handleJoystickMove(e.clientX, e.clientY);
                }
            });

            joystickBase.addEventListener('pointerup', endJoystick);
            joystickBase.addEventListener('pointercancel', endJoystick);
        }

        // Action Buttons
        document.getElementById('btn-action-attack')?.addEventListener('click', () => {
            this.combat.playerAttack(this.player, this.enemies);
        });

        document.getElementById('btn-skill-shoot')?.addEventListener('click', () => {
            this.combat.useSkill('cung_tien', this.player, this.enemies);
        });

        document.getElementById('btn-skill-trap')?.addEventListener('click', () => {
            this.combat.useSkill('bay', this.player, this.enemies);
        });

        document.getElementById('btn-skill-sprint')?.addEventListener('click', () => {
            this.combat.useSkill('tang_toc', this.player, this.enemies);
        });

        // Proximity Button Click
        document.getElementById('hud-interact-btn')?.addEventListener('click', () => {
            this.triggerProximityInteract();
        });
    }

    triggerProximityInteract() {
        const b = this.world.getNearbyBuilding(this.player.x, this.player.y);
        if (b) {
            sound.playClick();
            if (b.id === 'nha_chinh') {
                state.data.player.hp = state.data.player.maxHp;
                state.data.player.energy = state.data.player.maxEnergy;
                this.ui.updateHUD();
                this.ui.showToast('Nghỉ ngơi tại Nhà Chính: Đã hồi phục đầy đủ HP và Thể Lực!', 'success');
            } else if (b.id === 'xuong') {
                this.ui.showModal('modal-shop');
                this.ui.selectedShopCategory = 'Trang Bị';
                this.ui.renderShop();
            } else if (b.id === 'cho') {
                this.ui.showModal('modal-shop');
            } else if (b.id === 'ruong_lua') {
                // Auto harvest any ready plot or plant first empty plot
                let harvested = false;
                state.data.farmPlots.forEach(p => {
                    if (p.status === 'ready' && !harvested) {
                        this.farming.harvest(p.id, this.combat);
                        harvested = true;
                    }
                });
                if (!harvested) {
                    const emptyPlot = state.data.farmPlots.find(p => p.status === 'empty');
                    if (emptyPlot) {
                        this.farming.plant(emptyPlot.id, 'rice');
                        this.ui.showToast('Gieo hạt lúa nếp thành công!', 'success');
                    } else {
                        this.ui.showToast('Các luống ruộng đang trong quá trình lớn!', 'info');
                    }
                }
            }
        }
    }

    checkProximity() {
        const b = this.world.getNearbyBuilding(this.player.x, this.player.y);
        const btn = document.getElementById('hud-interact-btn');
        if (btn) {
            if (b) {
                btn.classList.remove('hidden');
                btn.innerText = `[E] Vào ${b.name}`;
            } else {
                btn.classList.add('hidden');
            }
        }
    }

    loop() {
        const now = performance.now();
        const dt = Math.min(0.1, (now - this.lastTime) / 1000);
        this.lastTime = now;

        // 1. Update Game Systems
        this.player.update(dt, this.input);
        this.disciple.update(dt, this.enemies, this.combat);
        this.pet.update(dt, this.combat.drops, this.combat);
        this.enemies.forEach(e => e.update(dt, this.player, this.combat));
        this.combat.update(dt, this.player, this.enemies);
        this.farming.update(dt);
        this.world.updateAmbientParticles(dt);

        this.checkProximity();

        // 2. Render Canvas
        this.renderer.render(
            this.world,
            this.player,
            this.disciple,
            this.pet,
            this.enemies,
            this.combat,
            this.farming
        );

        requestAnimationFrame(() => this.loop());
    }
}

// Start Game on Page Load
window.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new Game();
});
