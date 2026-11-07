// Combat System: Attack Hitboxes, Skills, Projectiles, Traps, Damage Formulas, Loot Drops

import { state } from './state.js';
import { sound } from './audio.js';
import { Projectile, Trap, LootDrop, FloatingText } from './entities.js';

export class CombatManager {
    constructor() {
        this.projectiles = [];
        this.traps = [];
        this.floatingTexts = [];
        this.drops = [];
        this.hitParticles = [];
    }

    update(dt, player, enemies) {
        // Update Projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.update(dt, enemies, this);
            if (p.isDead) this.projectiles.splice(i, 1);
        }

        // Update Traps
        for (let i = this.traps.length - 1; i >= 0; i--) {
            const t = this.traps[i];
            t.update(dt, enemies, this);
            if (t.lifeTime <= 0 || (t.triggered && t.snapTimer > 1.2)) {
                this.traps.splice(i, 1);
            }
        }

        // Update Drops
        for (let i = this.drops.length - 1; i >= 0; i--) {
            const d = this.drops[i];
            d.update(dt);
            // Player manual pickup within 45px
            const dist = Math.hypot(player.x - d.x, player.y - d.y);
            if (dist < 45 && !d.collected) {
                this.collectDrop(d);
            }
            if (d.collected) {
                this.drops.splice(i, 1);
            }
        }

        // Update Floating Text
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.update(dt);
            if (ft.life <= 0) this.floatingTexts.splice(i, 1);
        }

        // Update Hit Spark Particles
        for (let i = this.hitParticles.length - 1; i >= 0; i--) {
            const pt = this.hitParticles[i];
            pt.x += pt.vx * dt;
            pt.y += pt.vy * dt;
            pt.life -= dt;
            pt.size = Math.max(0, pt.size - dt * 6);
            if (pt.life <= 0) this.hitParticles.splice(i, 1);
        }
    }

    playerAttack(player, enemies) {
        player.state = 'attack';
        player.actionTimer = 0.28;
        sound.playAttack();

        // Hit arc in front of player
        const hitX = player.x + (player.direction * 36);
        const hitY = player.y;
        const hitRadius = 75;

        let hitCount = 0;
        enemies.forEach(e => {
            if (e.isDead) return;
            const dist = Math.hypot(e.x - hitX, e.y - hitY);
            if (dist <= hitRadius) {
                hitCount++;
                const isCrit = Math.random() < 0.25;
                const baseDmg = state.data.player.attack;
                const rawDmg = Math.max(50, baseDmg - e.defense * 0.35);
                const finalDmg = Math.round((rawDmg * (0.9 + Math.random() * 0.2)) * (isCrit ? 1.6 : 1.0));

                this.damageEnemy(e, finalDmg, isCrit, player.direction);
            }
        });

        // Slash wave effect
        this.addHitSparks(hitX, hitY, '#fde047', 8);
    }

    useSkill(skillKey, player, enemies) {
        const skill = state.data.skills[skillKey];
        if (!skill) return false;

        const now = Date.now();
        const elapsed = (now - skill.lastUsed) / 1000;
        if (elapsed < skill.cd) {
            this.addFloatingText(`Hồi chiêu: ${(skill.cd - elapsed).toFixed(1)}s`, player.x, player.y - 40, '#f87171');
            sound.playClick();
            return false;
        }

        skill.lastUsed = now;

        if (skillKey === 'cung_tien') {
            player.state = 'shoot';
            player.actionTimer = 0.35;
            sound.playShoot();

            const arrowSpeed = 620;
            const vx = player.direction * arrowSpeed;
            const vy = 0;
            const dmg = Math.round(state.data.player.attack * (skill.damagePercent / 100));

            this.projectiles.push(new Projectile(player.x + player.direction * 25, player.y - 8, vx, vy, dmg, 650));
            this.addFloatingText('Cung Tiễn!', player.x, player.y - 50, '#4ade80');
            return true;
        }

        if (skillKey === 'bay') {
            player.state = 'cast';
            player.actionTimer = 0.3;
            sound.playTrap();

            const trapDmg = Math.round(state.data.player.attack * (skill.damagePercent / 100));
            this.traps.push(new Trap(player.x, player.y + 15, trapDmg));
            this.addFloatingText('Đặt Bẫy!', player.x, player.y - 50, '#f59e0b');
            return true;
        }

        if (skillKey === 'tang_toc') {
            player.speedBoostTimer = 4.0;
            sound.playShoot();
            this.addFloatingText('Tăng Tốc +80%!', player.x, player.y - 50, '#38bdf8', true);
            this.addHitSparks(player.x, player.y, '#38bdf8', 12);
            return true;
        }

        return false;
    }

    projectileHit(proj, enemy) {
        sound.playHit();
        const isCrit = Math.random() < 0.3;
        const finalDmg = Math.round(proj.damage * (isCrit ? 1.5 : 1.0));
        const dir = proj.vx > 0 ? 1 : -1;
        this.damageEnemy(enemy, finalDmg, isCrit, dir);
        this.addHitSparks(enemy.x, enemy.y, '#4ade80', 6);
    }

    triggerTrap(trap, enemy) {
        sound.playHit();
        enemy.rootedTimer = 3.0; // rooted for 3s
        this.damageEnemy(enemy, trap.damage, false, 0);
        this.addFloatingText('Trói Chân!', enemy.x, enemy.y - 40, '#f97316', true);
        this.addHitSparks(enemy.x, enemy.y, '#ef4444', 10);
    }

    discipleAttack(disciple, enemy) {
        sound.playAttack();
        const dmg = Math.round(disciple.data.attack * (0.9 + Math.random() * 0.2));
        this.damageEnemy(enemy, dmg, false, disciple.direction);
        this.addHitSparks(enemy.x, enemy.y, '#ec4899', 6);
    }

    enemyAttack(enemy, player) {
        sound.playHit();
        const rawDmg = Math.max(25, enemy.attack - state.data.player.defense * 0.25);
        const finalDmg = Math.round(rawDmg * (0.85 + Math.random() * 0.3));

        state.data.player.hp = Math.max(0, state.data.player.hp - finalDmg);
        this.addFloatingText(`-${finalDmg}`, player.x, player.y - 30, '#ef4444');
        this.addHitSparks(player.x, player.y, '#ef4444', 6);

        if (state.data.player.hp <= 0) {
            // Player revive with 50% HP
            state.data.player.hp = Math.round(state.data.player.maxHp * 0.5);
            this.addFloatingText('Hồi Sinh Tại Chỗ!', player.x, player.y - 60, '#fbbf24', true);
        }
        state.save();
    }

    damageEnemy(enemy, damage, isCrit = false, knockDir = 0) {
        sound.playHit();
        enemy.hp -= damage;
        enemy.hitFlinchTimer = 0.2;
        enemy.x += knockDir * 18;

        this.addFloatingText(`-${damage}`, enemy.x, enemy.y - 35, isCrit ? '#facc15' : '#ffffff', isCrit);

        if (enemy.hp <= 0) {
            this.killEnemy(enemy);
        }
    }

    killEnemy(enemy) {
        enemy.isDead = true;
        enemy.respawnTimer = 12; // respawn in 12s
        sound.playCoin();

        // Exp & Gold reward
        const didLevelUp = state.addExp(enemy.expReward);
        if (didLevelUp) {
            sound.playLevelUp();
            this.addFloatingText('LÊN CẤP!', state.data.player.x, state.data.player.y - 65, '#22c55e', true);
        }

        // Spawning Drops
        this.drops.push(new LootDrop('gold', enemy.goldReward, enemy.x, enemy.y));
        if (Math.random() < 0.4) {
            this.drops.push(new LootDrop('diamond', Math.ceil(Math.random() * 3), enemy.x + 15, enemy.y - 10));
        }

        // Progress Quest
        state.progressQuest('resource', 1);

        this.addFloatingText(`+${enemy.expReward} EXP`, enemy.x, enemy.y - 50, '#38bdf8');
        this.addHitSparks(enemy.x, enemy.y, '#f59e0b', 16);
    }

    collectDrop(drop) {
        drop.collected = true;
        sound.playCoin();

        if (drop.type === 'gold') {
            state.addGold(drop.val);
            this.addFloatingText(`+${drop.val.toLocaleString()} Vàng`, drop.x, drop.y - 20, '#fbbf24');
        } else if (drop.type === 'diamond') {
            state.addDiamonds(drop.val);
            this.addFloatingText(`+${drop.val} Kim Cương`, drop.x, drop.y - 20, '#60a5fa');
        }
    }

    addFloatingText(text, x, y, color = '#ffffff', isCrit = false) {
        this.floatingTexts.push(new FloatingText(text, x, y, color, isCrit));
    }

    addHitSparks(x, y, color, count = 8) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 60 + Math.random() * 120;
            this.hitParticles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                size: 3 + Math.random() * 3,
                life: 0.25 + Math.random() * 0.15
            });
        }
    }
}
