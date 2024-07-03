class Entity {
    constructor(x, y, radius, speed, sprite) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = speed;
        this.sprite = new Image();
        this.sprite.src = sprite;
    }

    draw(offsetX, offsetY, ctx) {
        ctx.drawImage(this.sprite, this.x - this.radius - offsetX, this.y - this.radius - offsetY, this.radius * 2, this.radius * 2);
    }
}

class Player extends Entity {
    constructor(x, y, radius, speed, sprite, hp) {
        super(x, y, radius, speed, sprite);
        this.hp = hp;
        this.maxHealth = hp;
        this.score = 0;
        this.bulletAttack = 1;
        this.vulcanAttack = 1;
        this.hasVulcan = false;
        this.basicCooldown = 0;
        this.vulcanCooldown = 0;
        this.vulcanFiring = false;
        this.vulcanFireDuration = 0;
        this.upgradeHistory = {
            bullet: 0,
            vulcan: 0,
            health: 0
        };
        this.inventory = [new Weapon('gun', 1)];
    }

    move(keys) {
        if (keys['ArrowUp']) this.y -= this.speed;
        if (keys['ArrowDown']) this.y += this.speed;
        if (keys['ArrowLeft']) this.x -= this.speed;
        if (keys['ArrowRight']) this.x += this.speed;
    }

    shoot() {
        if (this.basicCooldown > 0) this.basicCooldown--;
        if (this.vulcanCooldown > 0) this.vulcanCooldown--;
        if (this.vulcanFiring) this.vulcanFireDuration--;

        if (this.vulcanFiring && this.vulcanFireDuration <= 0) {
            this.vulcanFiring = false;
            this.vulcanCooldown = 600;  // 10 seconds cooldown
        }

        if (this.basicCooldown <= 0) {
            bullets.push(new Bullet(this.x, this.y, 5, 10, 'bullet.png', this.bulletAttack));
            this.basicCooldown = 30;  // 0.5 seconds cooldown
        }

        if (this.vulcanFiring && this.vulcanCooldown <= 0) {
            for (let i = 0; i < 6; i++) {
                bullets.push(new Bullet(this.x, this.y, 5, 10, 'vulcan.png', this.vulcanAttack));
            }
        }
    }

    startVulcanFire() {
        if (!this.vulcanFiring && this.vulcanCooldown <= 0 && this.hasVulcan) {
            this.vulcanFiring = true;
            this.vulcanFireDuration = 180;  // 3 seconds duration
        }
    }

    addScore(points) {
        this.score += points;
        if ([10, 50, 100, 200, 500, 1000].includes(this.score)) {
            showLevelUpMenu();
        }
    }

    enhanceBulletAttack() {
        this.bulletAttack += 1;
        this.upgradeHistory.bullet += 1;
    }

    unlockVulcan() {
        this.hasVulcan = true;
    }

    enhanceMaxHealth() {
        this.maxHealth += 5;
        this.upgradeHistory.health += 1;
    }

    addToInventory(item) {
        if (this.inventory.length < 6) {
            this.inventory.push(item);
        }
    }

    upgradeWeapon(weaponName) {
        const weapon = this.inventory.find(item => item.name === weaponName);
        if (weapon) {
            weapon.level += 1;
        }
    }
}

class Enemy extends Entity {
    constructor(x, y, radius, speed, sprite, hp) {
        super(x, y, radius, speed, sprite);
        this.hp = hp;
    }

    update() {
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        this.x += this.speed * Math.cos(angle);
        this.y += this.speed * Math.sin(angle);
    }
}

class Bullet extends Entity {
    constructor(x, y, radius, speed, sprite, attack) {
        super(x, y, radius, speed, sprite);
        this.attack = attack;
    }

    update() {
        this.y -= this.speed;
    }
}

class Weapon {
    constructor(name, level) {
        this.name = name;
        this.level = level;
    }
}

export { Player, Enemy, Bullet, Weapon };
