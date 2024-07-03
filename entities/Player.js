export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.hp = 100;
        this.maxHealth = 100;
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
        this.inventory = [{ name: 'gun', level: 1 }];
    }

    update(cursors) {
        this.setVelocity(0);

        if (cursors.left.isDown) {
            this.setVelocityX(-200);
        } else if (cursors.right.isDown) {
            this.setVelocityX(200);
        }

        if (cursors.up.isDown) {
            this.setVelocityY(-200);
        } else if (cursors.down.isDown) {
            this.setVelocityY(200);
        }

        if (Phaser.Input.Keyboard.JustDown(cursors.space)) {
            this.shoot();
        }

        if (this.vulcanFiring && this.vulcanFireDuration > 0) {
            this.shootVulcan();
        } else if (this.vulcanFireDuration <= 0) {
            this.vulcanFiring = false;
        }

        if (this.basicCooldown > 0) this.basicCooldown--;
        if (this.vulcanCooldown > 0) this.vulcanCooldown--;
    }

    shoot() {
        if (this.basicCooldown <= 0) {
            this.scene.bullets.add(new Bullet(this.scene, this.x, this.y - 20, 'bullet', this.bulletAttack));
            this.basicCooldown = 30;  // 0.5 seconds cooldown
        }
    }

    shootVulcan() {
        if (this.vulcanCooldown <= 0) {
            for (let i = 0; i < 6; i++) {
                this.scene.vulcanBullets.add(new Bullet(this.scene, this.x, this.y - 20, 'vulcan', this.vulcanAttack));
            }
            this.vulcanFireDuration--;
        }
    }

    startVulcanFire() {
        if (!this.vulcanFiring && this.vulcanCooldown <= 0 && this.hasVulcan) {
            this.vulcanFiring = true;
            this.vulcanFireDuration = 180;  // 3 seconds duration
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
