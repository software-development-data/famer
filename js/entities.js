// Game Entities: Player, Disciple, Pet, Enemies, Projectiles, Traps, Drops, Combat Text

export class Entity {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.vx = 0;
        this.vy = 0;
        this.direction = 1; // 1 = right, -1 = left
        this.animTimer = 0;
        this.animFrame = 0;
    }
}

export class Player extends Entity {
    constructor(x, y) {
        super(x, y, 48, 56);
        this.speed = 260;
        this.state = 'idle'; // 'idle', 'walk', 'attack', 'shoot', 'cast', 'hurt'
        this.actionTimer = 0;
        this.comboStep = 0;
        this.isMoving = false;
        this.targetX = null;
        this.targetY = null;
        this.speedBoostTimer = 0;
        this.dustParticles = [];
    }

    update(dt, input) {
        this.animTimer += dt;
        if (this.animTimer > 0.12) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }

        // Speed boost buff
        let currentSpeed = this.speed;
        if (this.speedBoostTimer > 0) {
            this.speedBoostTimer -= dt;
            currentSpeed *= 1.8;
        }

        // Movement input
        let moveX = 0;
        let moveY = 0;

        if (input.joystickActive) {
            moveX = input.joystickX;
            moveY = input.joystickY;
        } else {
            if (input.keys['KeyA'] || input.keys['ArrowLeft']) moveX -= 1;
            if (input.keys['KeyD'] || input.keys['ArrowRight']) moveX += 1;
            if (input.keys['KeyW'] || input.keys['ArrowUp']) moveY -= 1;
            if (input.keys['KeyS'] || input.keys['ArrowDown']) moveY += 1;
        }

        // Mouse click target movement
        if (this.targetX !== null && this.targetY !== null) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 8) {
                moveX = dx / dist;
                moveY = dy / dist;
            } else {
                this.targetX = null;
                this.targetY = null;
            }
        }

        // Normalize movement
        const len = Math.hypot(moveX, moveY);
        if (len > 0.1) {
            moveX = (moveX / len) * Math.min(1, len);
            moveY = (moveY / len) * Math.min(1, len);
            this.vx = moveX * currentSpeed;
            this.vy = moveY * currentSpeed;
            this.direction = moveX >= 0 ? 1 : -1;
            this.state = 'walk';
            this.isMoving = true;

            // Footstep dust
            if (Math.random() < 0.2) {
                this.dustParticles.push({
                    x: this.x + (Math.random() - 0.5) * 16,
                    y: this.y + 24,
                    r: 3 + Math.random() * 3,
                    alpha: 0.6,
                    life: 0.3
                });
            }
        } else {
            this.vx = 0;
            this.vy = 0;
            if (this.actionTimer <= 0) {
                this.state = 'idle';
            }
            this.isMoving = false;
        }

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Boundaries (stay inside world)
        this.x = Math.max(60, Math.min(2440, this.x));
        this.y = Math.max(120, Math.min(1340, this.y));

        if (this.actionTimer > 0) {
            this.actionTimer -= dt;
            if (this.actionTimer <= 0) {
                this.state = this.isMoving ? 'walk' : 'idle';
            }
        }

        // Update dust
        for (let i = this.dustParticles.length - 1; i >= 0; i--) {
            const p = this.dustParticles[i];
            p.life -= dt;
            p.alpha = Math.max(0, p.life / 0.3 * 0.6);
            p.r += dt * 4;
            if (p.life <= 0) this.dustParticles.splice(i, 1);
        }
    }
}

export class Disciple extends Entity {
    constructor(discipleData, targetPlayer) {
        super(targetPlayer.x - 40, targetPlayer.y, 42, 52);
        this.data = discipleData;
        this.player = targetPlayer;
        this.targetEnemy = null;
        this.attackCooldown = 0;
        this.state = 'follow';
        this.attackTimer = 0;
        this.attackCooldownMax = 1.2;
    }

    update(dt, enemies, combatManager) {
        this.animTimer += dt;
        if (this.animTimer > 0.12) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }

        if (this.attackCooldown > 0) this.attackCooldown -= dt;
        if (this.attackTimer > 0) this.attackTimer -= dt;

        // Auto Combat Mode
        const canCombat = this.data.mode === 'attack' || this.data.autoAttack;
        if (canCombat) {
            // Find closest enemy within 320px
            let closest = null;
            let minDist = 320;
            enemies.forEach(e => {
                if (e.isDead) return;
                const d = Math.hypot(e.x - this.x, e.y - this.y);
                if (d < minDist) {
                    minDist = d;
                    closest = e;
                }
            });
            this.targetEnemy = closest;
        } else {
            this.targetEnemy = null;
        }

        let targetX = this.player.x - 40 * this.player.direction;
        let targetY = this.player.y + 10;
        let speed = this.data.speed || 280;

        if (this.targetEnemy && !this.targetEnemy.isDead) {
            const d = Math.hypot(this.targetEnemy.x - this.x, this.targetEnemy.y - this.y);
            this.direction = this.targetEnemy.x >= this.x ? 1 : -1;

            if (d > 50) {
                // Move towards enemy
                const nx = (this.targetEnemy.x - this.x) / d;
                const ny = (this.targetEnemy.y - this.y) / d;
                this.x += nx * speed * dt;
                this.y += ny * speed * dt;
                this.state = 'walk';
            } else {
                // In melee range: Attack!
                this.state = 'attack';
                if (this.attackCooldown <= 0) {
                    this.attackCooldown = this.attackCooldownMax;
                    this.attackTimer = 0.3;
                    combatManager.discipleAttack(this, this.targetEnemy);
                }
            }
        } else {
            // Follow player
            const distToPlayer = Math.hypot(targetX - this.x, targetY - this.y);
            if (distToPlayer > 35) {
                const nx = (targetX - this.x) / distToPlayer;
                const ny = (targetY - this.y) / distToPlayer;
                const followSpeed = distToPlayer > 150 ? speed * 1.5 : speed;
                this.x += nx * followSpeed * dt;
                this.y += ny * followSpeed * dt;
                this.direction = nx >= 0 ? 1 : -1;
                this.state = 'walk';
            } else {
                this.state = 'idle';
            }
        }
    }
}

export class Pet extends Entity {
    constructor(petData, targetPlayer) {
        super(targetPlayer.x + 35, targetPlayer.y + 15, 36, 36);
        this.data = petData;
        this.player = targetPlayer;
        this.hopTimer = 0;
        this.hopOffset = 0;
    }

    update(dt, drops, combatManager) {
        this.animTimer += dt;
        this.hopTimer += dt * 8;
        this.hopOffset = Math.abs(Math.sin(this.hopTimer)) * 6;

        // Follow player smoothly
        const targetX = this.player.x + 32 * -this.player.direction;
        const targetY = this.player.y + 15;
        const dist = Math.hypot(targetX - this.x, targetY - this.y);

        if (dist > 25) {
            const nx = (targetX - this.x) / dist;
            const ny = (targetY - this.y) / dist;
            const speed = dist > 120 ? 320 : 220;
            this.x += nx * speed * dt;
            this.y += ny * speed * dt;
            this.direction = nx >= 0 ? 1 : -1;
        }

        // Auto loot pickup within 120px
        drops.forEach(drop => {
            if (drop.collected) return;
            const d = Math.hypot(drop.x - this.x, drop.y - this.y);
            if (d < 120) {
                // Pet vacuum pull effect
                drop.x += (this.x - drop.x) * dt * 6;
                drop.y += (this.y - drop.y) * dt * 6;
                if (d < 25) {
                    combatManager.collectDrop(drop);
                }
            }
        });
    }
}

export class Enemy extends Entity {
    constructor(type, x, y) {
        super(x, y, 50, 50);
        this.type = type; // 'heorung', 'quaden', 'nhen', 'thophi'
        this.spawnX = x;
        this.spawnY = y;
        this.isDead = false;
        this.respawnTimer = 0;
        this.hitFlinchTimer = 0;
        this.attackCooldown = 0;
        this.rootedTimer = 0;

        this.initTypeStats();
    }

    initTypeStats() {
        switch (this.type) {
            case 'heorung':
                this.name = 'Heo Rừng Dũng Mãnh';
                this.level = 12;
                this.maxHp = 1200;
                this.hp = 1200;
                this.attack = 180;
                this.defense = 90;
                this.speed = 120;
                this.aggroRange = 220;
                this.expReward = 220;
                this.goldReward = 850;
                this.icon = '🐗';
                break;
            case 'quaden':
                this.name = 'Quạ Đen Tinh Quái';
                this.level = 10;
                this.maxHp = 850;
                this.hp = 850;
                this.attack = 150;
                this.defense = 60;
                this.speed = 160;
                this.aggroRange = 260;
                this.expReward = 180;
                this.goldReward = 700;
                this.icon = '🦅';
                break;
            case 'nhen':
                this.name = 'Nhện Rừng Độc Biến';
                this.level = 15;
                this.maxHp = 1900;
                this.hp = 1900;
                this.attack = 260;
                this.defense = 140;
                this.speed = 110;
                this.aggroRange = 240;
                this.expReward = 310;
                this.goldReward = 1400;
                this.icon = '🕷️';
                break;
            case 'thophi':
            default:
                this.name = 'Thổ Phỉ Trấn Giữ Rừng';
                this.level = 18;
                this.maxHp = 2800;
                this.hp = 2800;
                this.attack = 340;
                this.defense = 210;
                this.speed = 140;
                this.aggroRange = 260;
                this.expReward = 480;
                this.goldReward = 2600;
                this.icon = '🥷';
                break;
        }
    }

    update(dt, player, combatManager) {
        if (this.isDead) {
            this.respawnTimer -= dt;
            if (this.respawnTimer <= 0) {
                this.respawn();
            }
            return;
        }

        if (this.hitFlinchTimer > 0) this.hitFlinchTimer -= dt;
        if (this.attackCooldown > 0) this.attackCooldown -= dt;
        if (this.rootedTimer > 0) {
            this.rootedTimer -= dt;
            return; // Rooted in trap, can't move
        }

        this.animTimer += dt;
        if (this.animTimer > 0.15) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }

        // Distance to player
        const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);

        if (distToPlayer <= this.aggroRange) {
            // Chase player
            this.direction = player.x >= this.x ? 1 : -1;
            if (distToPlayer > 45) {
                const nx = (player.x - this.x) / distToPlayer;
                const ny = (player.y - this.y) / distToPlayer;
                this.x += nx * this.speed * dt;
                this.y += ny * this.speed * dt;
            } else {
                // Attack player
                if (this.attackCooldown <= 0) {
                    this.attackCooldown = 1.6;
                    combatManager.enemyAttack(this, player);
                }
            }
        } else {
            // Patrol wander near spawn point
            const distToSpawn = Math.hypot(this.spawnX - this.x, this.spawnY - this.y);
            if (distToSpawn > 140) {
                const nx = (this.spawnX - this.x) / distToSpawn;
                const ny = (this.spawnY - this.y) / distToSpawn;
                this.x += nx * (this.speed * 0.4) * dt;
                this.y += ny * (this.speed * 0.4) * dt;
                this.direction = nx >= 0 ? 1 : -1;
            }
        }
    }

    respawn() {
        this.isDead = false;
        this.hp = this.maxHp;
        this.x = this.spawnX + (Math.random() - 0.5) * 60;
        this.y = this.spawnY + (Math.random() - 0.5) * 60;
    }
}

export class Projectile {
    constructor(x, y, vx, vy, damage, range = 500) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.damage = damage;
        this.rangeLeft = range;
        this.isDead = false;
        this.hitList = new Set();
    }

    update(dt, enemies, combatManager) {
        const step = Math.hypot(this.vx * dt, this.vy * dt);
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.rangeLeft -= step;

        if (this.rangeLeft <= 0) {
            this.isDead = true;
            return;
        }

        // Check collision with enemies (piercing arrow)
        enemies.forEach(e => {
            if (e.isDead || this.hitList.has(e)) return;
            const dist = Math.hypot(e.x - this.x, e.y - this.y);
            if (dist < 36) {
                this.hitList.add(e);
                combatManager.projectileHit(this, e);
            }
        });
    }
}

export class Trap {
    constructor(x, y, damage) {
        this.x = x;
        this.y = y;
        this.damage = damage;
        this.lifeTime = 25; // lasts 25 seconds
        this.triggered = false;
        this.snapTimer = 0;
    }

    update(dt, enemies, combatManager) {
        this.lifeTime -= dt;
        if (this.triggered) {
            this.snapTimer += dt;
            return;
        }

        enemies.forEach(e => {
            if (e.isDead || this.triggered) return;
            const dist = Math.hypot(e.x - this.x, e.y - this.y);
            if (dist < 32) {
                this.triggered = true;
                combatManager.triggerTrap(this, e);
            }
        });
    }
}

export class LootDrop {
    constructor(type, val, x, y) {
        this.type = type; // 'gold', 'diamond', 'item'
        this.val = val;
        this.x = x;
        this.y = y;
        this.collected = false;
        this.timer = 0;
        this.bounceY = 0;
    }

    update(dt) {
        this.timer += dt * 6;
        this.bounceY = Math.abs(Math.sin(this.timer)) * 8;
    }
}

export class FloatingText {
    constructor(text, x, y, color = '#ffffff', isCrit = false) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.color = color;
        this.isCrit = isCrit;
        this.life = 0.8;
        this.maxLife = 0.8;
        this.vy = -55;
    }

    update(dt) {
        this.life -= dt;
        this.y += this.vy * dt;
        this.vy += 30 * dt; // slight gravity deceleration
    }
}
