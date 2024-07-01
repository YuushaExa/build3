// game.js

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

class Entity {
    constructor(x, y, radius, speed, sprite) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = speed;
        this.sprite = new Image();
        this.sprite.src = sprite;
    }

    draw() {
        ctx.drawImage(this.sprite, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
    }
}

class Player extends Entity {
    constructor(x, y, radius, speed, sprite, hp) {
        super(x, y, radius, speed, sprite);
        this.hp = hp;
        this.cooldown = 0;
    }

    move(keys) {
        if (keys['ArrowUp'] && this.y - this.radius > 0) this.y -= this.speed;
        if (keys['ArrowDown'] && this.y + this.radius < canvas.height) this.y += this.speed;
        if (keys['ArrowLeft'] && this.x - this.radius > 0) this.x -= this.speed;
        if (keys['ArrowRight'] && this.x + this.radius < canvas.width) this.x += this.speed;
    }

    shoot() {
        if (this.cooldown === 0) {
            bullets.push(new Bullet(this.x, this.y, 5, 7, 'https://opengameart.org/sites/default/files/bullet_8.png'));
            this.cooldown = 15;
        }
        if (this.cooldown > 0) this.cooldown--;
    }
}

class Enemy extends Entity {
    constructor(x, y, radius, speed, sprite, hp) {
        super(x, y, radius, speed, sprite);
        this.hp = hp;
    }

    update() {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }

        if (distance < player.radius + this.radius) {
            player.hp -= 1;
        }
    }
}

class Bullet extends Entity {
    constructor(x, y, radius, speed, sprite) {
        super(x, y, radius, speed, sprite);
    }

    update() {
        this.y -= this.speed;
    }
}

let player = new Player(canvas.width / 2, canvas.height / 2, 15, 5, 'mecha.png', 10);
let enemies = [];
let bullets = [];
let keys = {};
let score = 0;

document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    player.move(keys);
    if (keys[' ']) player.shoot();

    bullets.forEach((bullet, index) => {
        bullet.update();
        if (bullet.y < 0) bullets.splice(index, 1);
    });

    enemies.forEach((enemy, index) => {
        enemy.update();

        bullets.forEach((bullet, bulletIndex) => {
            const distance = Math.sqrt((bullet.x - enemy.x) ** 2 + (bullet.y - enemy.y) ** 2);
            if (distance < bullet.radius + enemy.radius) {
                enemy.hp -= 1;
                bullets.splice(bulletIndex, 1);
                if (enemy.hp <= 0) {
                    enemies.splice(index, 1);
                    score++;
                }
            }
        });
    });

    if (Math.random() < 0.02) {
        spawnEnemy();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    player.draw();
    bullets.forEach(bullet => bullet.draw());
    enemies.forEach(enemy => enemy.draw());

    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText(`Score: ${score}`, 10, 20);
    ctx.fillText(`HP: ${player.hp}`, 10, 40);
}

function spawnEnemy() {
    const x = Math.random() < 0.5 ? 0 : canvas.width;
    const y = Math.random() * canvas.height;

    const enemyTypes = [
        { radius: 15, speed: 2, sprite: 'enemy1.png', hp: 3 },
        { radius: 10, speed: 3, sprite: 'enemy2.png', hp: 2 },
        { radius: 20, speed: 1.5, sprite: 'enemy3.png', hp: 5 }
    ];

    const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    enemies.push(new Enemy(x, y, type.radius, type.speed, type.sprite, type.hp));
}

gameLoop();
