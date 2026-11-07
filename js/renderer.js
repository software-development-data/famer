// 2D High-DPI Canvas Renderer for Village, Farmland, Monsters, Effects, and HUD

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Virtual resolution
        this.width = 1280;
        this.height = 720;

        // Camera
        this.camera = { x: 0, y: 0 };

        // Preloaded Graphic Assets
        this.assets = {
            farmer: new Image(),
            disciple: new Image(),
            pet: new Image(),
            boar: new Image(),
            crow: new Image(),
            spider: new Image(),
            bandit: new Image(),
            trap: new Image()
        };
        this.assets.farmer.src = 'assets/images/sprite_farmer.svg';
        this.assets.disciple.src = 'assets/images/sprite_disciple.svg';
        this.assets.pet.src = 'assets/images/sprite_pet.svg';
        this.assets.boar.src = 'assets/icons/monster_boar.svg';
        this.assets.crow.src = 'assets/icons/monster_crow.svg';
        this.assets.spider.src = 'assets/icons/monster_spider.svg';
        this.assets.bandit.src = 'assets/icons/monster_bandit.svg';
        this.assets.trap.src = 'assets/icons/trap_bear.svg';

        this.initCanvasSize();
        window.addEventListener('resize', () => this.initCanvasSize());
    }

    initCanvasSize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = (rect.width || 1280) * dpr;
        this.canvas.height = (rect.height || 720) * dpr;
        this.ctx.resetTransform();
        this.ctx.scale(this.canvas.width / this.width, this.canvas.height / this.height);
    }

    render(world, player, disciple, pet, enemies, combatManager, farmingManager) {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        // Update Camera to follow player smoothly
        const targetCamX = player.x - this.width / 2;
        const targetCamY = player.y - this.height / 2;
        this.camera.x += (targetCamX - this.camera.x) * 0.12;
        this.camera.y += (targetCamY - this.camera.y) * 0.12;

        // Clamp camera to map bounds
        this.camera.x = Math.max(0, Math.min(world.width - this.width, this.camera.x));
        this.camera.y = Math.max(0, Math.min(world.height - this.height, this.camera.y));

        ctx.save();
        ctx.translate(-Math.round(this.camera.x), -Math.round(this.camera.y));

        // 1. Draw World Background & Terrain
        this.drawTerrain(ctx, world);

        // 2. Draw Farm Plots & Crops
        this.drawFarmPlots(ctx, farmingManager);

        // 3. Draw Buildings
        this.drawBuildings(ctx, world);

        // 4. Draw Traps & Drops
        this.drawTraps(ctx, combatManager.traps);
        this.drawDrops(ctx, combatManager.drops);

        // 5. Draw Enemies
        enemies.forEach(e => this.drawEnemy(ctx, e));

        // 6. Draw Disciple & Pet
        if (disciple) this.drawDisciple(ctx, disciple);
        if (pet) this.drawPet(ctx, pet);

        // 7. Draw Player
        this.drawPlayer(ctx, player);

        // 8. Draw Projectiles & Hit Sparks
        this.drawProjectiles(ctx, combatManager.projectiles);
        this.drawHitSparks(ctx, combatManager.hitParticles);

        // 9. Draw Floating Combat Text
        this.drawFloatingTexts(ctx, combatManager.floatingTexts);

        // 10. Draw Ambient Petals / Leaves
        this.drawAmbientParticles(ctx, world);

        ctx.restore();
    }

    drawTerrain(ctx, world) {
        // Base Grass
        ctx.fillStyle = '#65a30d'; // vibrant lush green
        ctx.fillRect(0, 0, world.width, world.height);

        // Soft terrain gradient & forest dark zone on right
        const grad = ctx.createLinearGradient(1600, 0, world.width, 0);
        grad.addColorStop(0, 'rgba(22, 101, 52, 0)');
        grad.addColorStop(1, 'rgba(20, 83, 45, 0.45)');
        ctx.fillStyle = grad;
        ctx.fillRect(1600, 0, world.width - 1600, world.height);

        // Village Dirt Paths (Connecting buildings and farmlands)
        ctx.fillStyle = '#d97706';
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 4;

        // Main Horizontal Village Avenue
        this.drawRoundedRect(ctx, 320, 480, 1260, 90, 20, '#d97706', '#b45309');
        // North branch to houses
        this.drawRoundedRect(ctx, 480, 430, 90, 80, 10, '#d97706', null);
        this.drawRoundedRect(ctx, 860, 420, 80, 80, 10, '#d97706', null);
        this.drawRoundedRect(ctx, 1260, 440, 90, 70, 10, '#d97706', null);
        // South branch to Farmland & Pond
        this.drawRoundedRect(ctx, 720, 560, 110, 220, 15, '#d97706', '#b45309');
        // East path leading to Wild Forest
        this.drawRoundedRect(ctx, 1500, 500, 350, 70, 15, '#c2410c', '#9a3412');

        // Scenery elements
        world.scenery.forEach(item => {
            if (item.type === 'pond') {
                this.drawLotusPond(ctx, item.x, item.y, item.radiusX, item.radiusY);
            } else if (item.type === 'tree') {
                this.drawTree(ctx, item.x, item.y, item.kind, item.radius);
            } else if (item.type === 'haystack') {
                this.drawHaystack(ctx, item.x, item.y);
            } else if (item.type === 'fence') {
                this.drawFence(ctx, item.x, item.y);
            }
        });
    }

    drawLotusPond(ctx, x, y, rx, ry) {
        // Pond water body
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#0284c7';
        ctx.fill();
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#0369a1';
        ctx.stroke();

        // Water reflection
        ctx.beginPath();
        ctx.ellipse(x - 20, y - 10, rx * 0.7, ry * 0.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.fill();

        // Lily pads
        const pads = [
            { px: x - 40, py: y - 15, r: 16 },
            { px: x + 45, py: y + 10, r: 20 },
            { px: x - 15, py: y + 25, r: 18 },
            { px: x + 25, py: y - 30, r: 14 }
        ];
        pads.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.px, p.py, p.r, 0.2, Math.PI * 1.8);
            ctx.lineTo(p.px, p.py);
            ctx.fillStyle = '#15803d';
            ctx.fill();
            // Pink lotus flower
            ctx.font = '16px serif';
            ctx.fillText('🌸', p.px - 6, p.py + 4);
        });

        ctx.restore();
    }

    drawTree(ctx, x, y, kind, radius) {
        ctx.save();
        // Shadow
        ctx.beginPath();
        ctx.ellipse(x, y + radius * 0.6, radius * 0.8, radius * 0.3, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fill();

        if (kind === 'bamboo') {
            // Bamboo stalks
            ctx.fillStyle = '#4ade80';
            ctx.fillRect(x - 8, y - 50, 6, 60);
            ctx.fillRect(x + 2, y - 60, 6, 70);
            // Foliage
            ctx.beginPath();
            ctx.arc(x, y - 65, 25, 0, Math.PI * 2);
            ctx.fillStyle = '#16a34a';
            ctx.fill();
        } else if (kind === 'flamboyant') {
            // Trunk
            ctx.fillStyle = '#78350f';
            ctx.fillRect(x - 8, y - 20, 16, 30);
            // Red blossom canopy
            ctx.beginPath();
            ctx.arc(x, y - 40, radius, 0, Math.PI * 2);
            ctx.fillStyle = '#dc2626';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x - 15, y - 48, radius * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = '#f87171';
            ctx.fill();
        } else if (kind === 'coconut') {
            // Curved trunk
            ctx.strokeStyle = '#92400e';
            ctx.lineWidth = 10;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.quadraticCurveTo(x + 15, y - 40, x + 5, y - 80);
            ctx.stroke();
            // Palm leaves
            ctx.font = '36px serif';
            ctx.fillText('🌴', x - 18, y - 75);
        } else {
            // Deep forest pine / oak
            ctx.fillStyle = '#543d2b';
            ctx.fillRect(x - 10, y - 15, 20, 25);
            ctx.beginPath();
            ctx.arc(x, y - 40, radius, 0, Math.PI * 2);
            ctx.fillStyle = '#14532d';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x - 10, y - 50, radius * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = '#166534';
            ctx.fill();
        }
        ctx.restore();
    }

    drawHaystack(ctx, x, y) {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(x, y, 22, 18, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#facc15';
        ctx.fill();
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
    }

    drawFence(ctx, x, y) {
        ctx.save();
        ctx.fillStyle = '#854d0e';
        ctx.fillRect(x - 3, y - 10, 6, 20);
        ctx.fillRect(x - 18, y - 5, 36, 4);
        ctx.restore();
    }

    drawBuildings(ctx, world) {
        world.buildings.forEach(b => {
            if (b.id === 'ruong_lua' || b.id === 'khu_rung') return; // Handled separately

            ctx.save();
            // Building Shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(b.x + 10, b.y + b.h - 15, b.w - 10, 25);

            // House Base / Walls (Bamboo/timber construction)
            ctx.fillStyle = b.color;
            ctx.fillRect(b.x, b.y + 45, b.w, b.h - 45);
            ctx.strokeStyle = '#451a03';
            ctx.lineWidth = 4;
            ctx.strokeRect(b.x, b.y + 45, b.w, b.h - 45);

            // Doorway
            ctx.fillStyle = '#292524';
            ctx.fillRect(b.x + b.w / 2 - 20, b.y + b.h - 55, 40, 55);

            // Windows
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(b.x + 25, b.y + 70, 30, 30);
            ctx.fillRect(b.x + b.w - 55, b.y + 70, 30, 30);
            ctx.strokeRect(b.x + 25, b.y + 70, 30, 30);
            ctx.strokeRect(b.x + b.w - 55, b.y + 70, 30, 30);

            // Thatched Triangular Vietnamese Roof
            ctx.beginPath();
            ctx.moveTo(b.x - 20, b.y + 50);
            ctx.lineTo(b.x + b.w / 2, b.y - 15);
            ctx.lineTo(b.x + b.w + 20, b.y + 50);
            ctx.closePath();
            ctx.fillStyle = b.roofColor;
            ctx.fill();
            ctx.strokeStyle = '#451a03';
            ctx.lineWidth = 5;
            ctx.stroke();

            // Hanging Vietnamese red lantern
            ctx.fillStyle = '#dc2626';
            ctx.beginPath();
            ctx.arc(b.x + 15, b.y + 60, 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#facc15';
            ctx.fillRect(b.x + 13, b.y + 68, 4, 8);

            // Building Name Signboard (Wood board with gold letters)
            const signW = 160;
            const signH = 34;
            const signX = b.x + (b.w - signW) / 2;
            const signY = b.y + 25;
            this.drawWoodSign(ctx, signX, signY, signW, signH, `${b.icon} ${b.name}`);

            ctx.restore();
        });
    }

    drawWoodSign(ctx, x, y, w, h, text) {
        ctx.save();
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);

        ctx.font = 'bold 15px sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x + w / 2, y + h / 2);
        ctx.restore();
    }

    drawFarmPlots(ctx, farmingManager) {
        // Farmland boundary board
        ctx.save();
        this.drawWoodSign(ctx, 680, 745, 260, 36, '🌾 Ruộng Lúa Thần Nông');

        farmingManager.plotLayouts.forEach(layout => {
            const plotData = farmingManager.cropConfig;
            // Get state plot
            const plot = window.__gameState ? window.__gameState.data.farmPlots.find(p => p.id === layout.id) : null;
            const status = plot ? plot.status : 'empty';

            // Muddy tilled soil bed
            ctx.fillStyle = '#78350f';
            ctx.fillRect(layout.x, layout.y, layout.w, layout.h);
            ctx.strokeStyle = '#ca8a04';
            ctx.lineWidth = 3;
            ctx.strokeRect(layout.x, layout.y, layout.w, layout.h);

            // Furrows (tilled ridges)
            ctx.strokeStyle = '#451a03';
            ctx.lineWidth = 2;
            for (let fy = layout.y + 18; fy < layout.y + layout.h; fy += 20) {
                ctx.beginPath();
                ctx.moveTo(layout.x + 10, fy);
                ctx.lineTo(layout.x + layout.w - 10, fy);
                ctx.stroke();
            }

            // Crops rendering
            const cx = layout.x + layout.w / 2;
            const cy = layout.y + layout.h / 2;

            if (status === 'empty') {
                ctx.font = 'bold 13px sans-serif';
                ctx.fillStyle = '#fde68a';
                ctx.textAlign = 'center';
                ctx.fillText('🌱 Đất Trống', cx, cy - 4);
                ctx.font = '11px sans-serif';
                ctx.fillStyle = '#cbd5e1';
                ctx.fillText('[Nhấn để Gieo Hạt]', cx, cy + 14);
            } else if (status === 'growing') {
                // Sprouts
                ctx.font = '24px serif';
                ctx.textAlign = 'center';
                ctx.fillText('🌱 🌱 🌱', cx, cy + 2);

                // Progress Bar
                const elapsed = Date.now() - plot.plantTime;
                const ratio = Math.min(1, elapsed / plot.growDuration);
                const barW = layout.w - 40;
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(cx - barW / 2, layout.y + layout.h - 18, barW, 8);
                ctx.fillStyle = '#22c55e';
                ctx.fillRect(cx - barW / 2, layout.y + layout.h - 18, barW * ratio, 8);

                ctx.font = '10px sans-serif';
                ctx.fillStyle = '#ffffff';
                ctx.fillText(`${Math.ceil((plot.growDuration - elapsed) / 1000)}s`, cx, layout.y + layout.h - 22);
            } else if (status === 'ready') {
                // Golden ripe crops with sparkles!
                ctx.font = '30px serif';
                ctx.textAlign = 'center';
                ctx.fillText(plot.crop === 'corn' ? '🌽 🌽 🌽' : '🌾 🌾 🌾', cx, cy + 5);

                // Sparkling golden highlight badge
                ctx.fillStyle = '#eab308';
                ctx.fillRect(cx - 50, layout.y + layout.h - 22, 100, 18);
                ctx.font = 'bold 11px sans-serif';
                ctx.fillStyle = '#451a03';
                ctx.fillText('⚡ THU HOẠCH', cx, layout.y + layout.h - 9);
            }
        });
        ctx.restore();
    }

    drawPlayer(ctx, player) {
        ctx.save();
        const px = Math.round(player.x);
        const py = Math.round(player.y);

        // Footstep Dust
        player.dustParticles.forEach(dp => {
            ctx.beginPath();
            ctx.arc(dp.x, dp.y, dp.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(217, 119, 6, ${dp.alpha})`;
            ctx.fill();
        });

        // Shadow
        ctx.beginPath();
        ctx.ellipse(px, py + 24, 18, 8, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fill();

        ctx.translate(px, py);
        if (player.direction === -1) {
            ctx.scale(-1, 1);
        }

        // Bobbing walk cycle
        const bob = player.isMoving ? Math.sin(player.animTimer * 25) * 3 : 0;

        if (this.assets.farmer.complete && this.assets.farmer.naturalWidth > 0) {
            ctx.drawImage(this.assets.farmer, -30, -56 + bob, 60, 76);
        } else {
            // Legs / Pants
            ctx.fillStyle = '#475569';
            ctx.fillRect(-10, 10 + bob, 8, 14 - bob);
            ctx.fillRect(2, 10 - bob, 8, 14 + bob);

            // Body / Peasant Tunic (Brown/Ivory)
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(-12, -8 + bob, 24, 20);
            ctx.fillStyle = '#854d0e';
            ctx.fillRect(-12, 4 + bob, 24, 6); // Fabric sash belt

            // Head
            ctx.beginPath();
            ctx.arc(0, -18 + bob, 13, 0, Math.PI * 2);
            ctx.fillStyle = '#fed7aa'; // Skin tone
            ctx.fill();

            // Face (Chibi eyes)
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(4, -18 + bob, 2.5, 0, Math.PI * 2);
            ctx.fill();
            // Blush
            ctx.fillStyle = '#fb7185';
            ctx.beginPath();
            ctx.arc(5, -14 + bob, 3, 0, Math.PI * 2);
            ctx.fill();

            // Conical Straw Hat ("Nón Lá")
            ctx.beginPath();
            ctx.moveTo(-24, -22 + bob);
            ctx.lineTo(0, -42 + bob);
            ctx.lineTo(24, -22 + bob);
            ctx.closePath();
            ctx.fillStyle = '#fde047';
            ctx.fill();
            ctx.strokeStyle = '#ca8a04';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Resting hoe over shoulder
            if (player.state !== 'attack' && player.state !== 'shoot') {
                ctx.strokeStyle = '#78350f';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(-10, 0 + bob);
                ctx.lineTo(18, -25 + bob);
                ctx.stroke();
                ctx.fillStyle = '#94a3b8';
                ctx.fillRect(16, -30 + bob, 12, 16);
            }
        }

        // Weapon / Tool (Hoe or Bow or Slash Wave)
        if (player.state === 'attack') {
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.arc(15, 0, 35, -Math.PI * 0.4, Math.PI * 0.4);
            ctx.stroke();
            // Golden Hoe Blade
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(18, -15, 20, 8);
        } else if (player.state === 'shoot') {
            ctx.font = '24px serif';
            ctx.fillText('🏹', 12, 4);
        }

        ctx.restore();

        // Player Name Banner above head
        ctx.save();
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(player.name || 'Nông Dân', px, py - 48);
        ctx.restore();
    }

    drawDisciple(ctx, disciple) {
        ctx.save();
        const dx = Math.round(disciple.x);
        const dy = Math.round(disciple.y);

        // Shadow
        ctx.beginPath();
        ctx.ellipse(dx, dy + 20, 15, 6, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fill();

        ctx.translate(dx, dy);
        if (disciple.direction === -1) ctx.scale(-1, 1);

        if (this.assets.disciple.complete && this.assets.disciple.naturalWidth > 0) {
            ctx.drawImage(this.assets.disciple, -28, -50, 56, 70);
        } else {
            // Martial Dress (Red / White Hanfu)
            ctx.fillStyle = '#e11d48';
            ctx.fillRect(-10, 2, 20, 18);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-8, -4, 16, 8);

            // Chibi Girl Head
            ctx.beginPath();
            ctx.arc(0, -14, 12, 0, Math.PI * 2);
            ctx.fillStyle = '#ffe4e6';
            ctx.fill();

            // Twin Hair Buns with Red Ribbons
            ctx.fillStyle = '#1c1917';
            ctx.beginPath();
            ctx.arc(-11, -22, 6, 0, Math.PI * 2);
            ctx.arc(11, -22, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#f43f5e';
            ctx.fillRect(-13, -24, 4, 10);
            ctx.fillRect(9, -24, 4, 10);

            // Cute Face
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(3, -13, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Attack Aura wave
        if (disciple.state === 'attack') {
            ctx.strokeStyle = '#ec4899';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(14, 0, 24, -Math.PI * 0.3, Math.PI * 0.3);
            ctx.stroke();
        }

        ctx.restore();

        // Name & Star rating
        ctx.save();
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#f472b6';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(`⭐⭐⭐⭐ ${disciple.data.name}`, dx, dy - 34);
        ctx.restore();
    }

    drawPet(ctx, pet) {
        ctx.save();
        const px = Math.round(pet.x);
        const py = Math.round(pet.y) - pet.hopOffset;

        // Shadow
        ctx.beginPath();
        ctx.ellipse(px, Math.round(pet.y) + 14, 12, 5, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fill();

        ctx.translate(px, py);
        if (pet.direction === -1) ctx.scale(-1, 1);

        if (this.assets.pet.complete && this.assets.pet.naturalWidth > 0) {
            ctx.drawImage(this.assets.pet, -22, -26, 44, 48);
        } else {
            // Cute Hamster Body (Orange / Cream)
            ctx.beginPath();
            ctx.arc(0, 0, 13, 0, Math.PI * 2);
            ctx.fillStyle = '#f59e0b';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(2, 2, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#fef3c7';
            ctx.fill();

            // Eyes & Nose
            ctx.fillStyle = '#1c1917';
            ctx.beginPath();
            ctx.arc(5, -2, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fb7185';
            ctx.beginPath();
            ctx.arc(8, 0, 2, 0, Math.PI * 2);
            ctx.fill();

            // Tiny Straw Hat on Hamster
            ctx.beginPath();
            ctx.moveTo(-10, -10);
            ctx.lineTo(0, -20);
            ctx.lineTo(10, -10);
            ctx.closePath();
            ctx.fillStyle = '#facc15';
            ctx.fill();

            // Mini wooden shovel on back
            ctx.fillStyle = '#78350f';
            ctx.fillRect(-12, -4, 4, 14);
        }

        ctx.restore();

        // Pet name label
        ctx.save();
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fef08a';
        ctx.fillText(pet.data.name, px, py - 24);
        ctx.restore();
    }

    drawEnemy(ctx, enemy) {
        if (enemy.isDead) return;

        ctx.save();
        const ex = Math.round(enemy.x);
        const ey = Math.round(enemy.y);

        // Shadow
        ctx.beginPath();
        ctx.ellipse(ex, ey + 20, 18, 7, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fill();

        // Flinch Flash white/red
        const isFlinching = enemy.hitFlinchTimer > 0;

        ctx.translate(ex, ey);
        if (enemy.direction === -1) ctx.scale(-1, 1);

        // Enemy Icon / Sprite Representation
        let enemyImg = null;
        if (enemy.type === 'heorung') enemyImg = this.assets.boar;
        else if (enemy.type === 'quaden') enemyImg = this.assets.crow;
        else if (enemy.type === 'nhen') enemyImg = this.assets.spider;
        else if (enemy.type === 'thophi') enemyImg = this.assets.bandit;

        if (enemyImg && enemyImg.complete && enemyImg.naturalWidth > 0) {
            ctx.drawImage(enemyImg, -26, -26, 52, 52);
        } else {
            ctx.font = '36px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(enemy.icon, 0, 0);
        }

        if (isFlinching) {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
            ctx.beginPath();
            ctx.arc(0, 0, 26, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

        // Health Bar & Info above enemy
        ctx.save();
        const barW = 54;
        const barH = 6;
        const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(ex - barW / 2 - 1, ey - 32, barW + 2, barH + 2);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(ex - barW / 2, ey - 31, barW * hpRatio, barH);

        ctx.font = 'bold 10px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 3;
        ctx.fillText(`Lv.${enemy.level} ${enemy.name}`, ex, ey - 36);
        ctx.restore();
    }

    drawTraps(ctx, traps) {
        ctx.save();
        traps.forEach(t => {
            if (t.triggered) {
                ctx.font = '28px serif';
                ctx.textAlign = 'center';
                ctx.fillText('💥', t.x, t.y);
            } else if (this.assets.trap.complete && this.assets.trap.naturalWidth > 0) {
                ctx.drawImage(this.assets.trap, t.x - 18, t.y - 18, 36, 36);
            } else {
                ctx.font = '26px serif';
                ctx.textAlign = 'center';
                ctx.fillText('🪤', t.x, t.y);
            }
        });
        ctx.restore();
    }

    drawDrops(ctx, drops) {
        ctx.save();
        drops.forEach(d => {
            const dy = d.y - d.bounceY;
            // Shadow
            ctx.beginPath();
            ctx.ellipse(d.x, d.y + 8, 8, 3, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
            ctx.fill();

            ctx.font = '22px serif';
            ctx.textAlign = 'center';
            ctx.fillText(d.type === 'diamond' ? '💎' : '🪙', d.x, dy);
        });
        ctx.restore();
    }

    drawProjectiles(ctx, projectiles) {
        ctx.save();
        projectiles.forEach(p => {
            ctx.fillStyle = '#22c55e';
            ctx.strokeStyle = '#86efac';
            ctx.lineWidth = 3;

            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - (p.vx > 0 ? 30 : -30), p.y);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }

    drawHitSparks(ctx, particles) {
        ctx.save();
        particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(1, p.size), 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }

    drawFloatingTexts(ctx, floatingTexts) {
        ctx.save();
        floatingTexts.forEach(ft => {
            ctx.font = ft.isCrit ? 'bold 22px sans-serif' : 'bold 16px sans-serif';
            ctx.fillStyle = ft.color;
            ctx.textAlign = 'center';
            ctx.shadowColor = '#000000';
            ctx.shadowBlur = 5;
            ctx.globalAlpha = Math.max(0, ft.life / ft.maxLife);
            ctx.fillText(ft.text, ft.x, ft.y);
        });
        ctx.restore();
    }

    drawAmbientParticles(ctx, world) {
        ctx.save();
        world.ambientParticles.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size * 1.5, p.size * 0.8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
        ctx.restore();
    }
}
