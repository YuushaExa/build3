import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import Bullet from '../entities/Bullet.js';
import { showLevelUpMenu, getRandomOptions } from '../utils/LevelUp.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        this.player = new Player(this, 400, 300, 'player');
        this.enemies = this.physics.add.group();
        this.bullets = this.physics.add.group();
        this.vulcanBullets = this.physics.add.group();
        
        this.cursors = this.input.keyboard.createCursorKeys();

        this.physics.add.collider(this.bullets, this.enemies, this.handleBulletEnemyCollision, null, this);
        this.physics.add.collider(this.vulcanBullets, this.enemies, this.handleBulletEnemyCollision, null, this);
        
        this.score = 0;
        this.levelUpThresholds = [10, 50, 100, 200, 500, 1000];
    }

    update() {
        this.player.update(this.cursors);
        
        this.enemies.children.iterate(enemy => {
            enemy.update();
        });

        this.bullets.children.iterate(bullet => {
            bullet.update();
        });

        this.vulcanBullets.children.iterate(bullet => {
            bullet.update();
        });

        this.checkLevelUp();
    }

    handleBulletEnemyCollision(bullet, enemy) {
        bullet.destroy();
        enemy.takeDamage(bullet.damage);
        if (enemy.hp <= 0) {
            enemy.destroy();
            this.score += 10;
        }
    }

    checkLevelUp() {
        if (this.levelUpThresholds.includes(this.score)) {
            this.pauseGame();
            showLevelUpMenu(this, getRandomOptions(this.player));
        }
    }

    pauseGame() {
        this.physics.pause();
        this.scene.pause();
    }

    resumeGame() {
        this.physics.resume();
        this.scene.resume();
    }
}
