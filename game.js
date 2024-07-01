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

    draw(offsetX, offsetY) {
        ctx.drawImage(this.sprite, this.x - this.radius - offsetX, this.y - this.radius - offsetY, this.radius * 2, this.radius * 2);
    }
}

class Player extends Entity {
    constructor(x, y, radius, speed, sprite, hp) {
        super(x, y, radius, speed, sprite);
        this.hp = hp;
        this.cooldown = 0;
    }

    move(keys) {
        if (keys['ArrowUp']) this.y -= this.speed;
        if (keys['ArrowDown']) this.y += this.speed;
        if (keys['ArrowLeft']) this.x -= this.speed;
        if (keys['ArrowRight']) this.x += this.speed;
    }

    shoot() {
        if (this.cooldown === 0) {
            const closestEnemy = this.findClosestEnemy();
            if (closestEnemy) {
                const angle = Math.atan2(closestEnemy.y - this.y, closestEnemy.x - this.x);
                bullets.push(new Bullet(this.x, this.y, 5, 7, 'https://opengameart.org/sites/default/files/bullet_8.png', angle));
            }
            this.cooldown = 15;
        }
        if (this.cooldown > 0) this.cooldown--;
    }

    findClosestEnemy() {
        let closest = null;
        let minDist = Infinity;
        enemies.forEach(enemy => {
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist) {
                closest = enemy;
                minDist = dist;
            }
        });
        return closest;
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
    constructor(x, y, radius, speed, sprite, angle) {
        super(x, y, radius, speed, sprite);
        this.angle = angle;
    }

    update() {
        this.x += this.speed * Math.cos(this.angle);
        this.y += this.speed * Math.sin(this.angle);
    }
}

let player = new Player(canvas.width / 2, canvas.height / 2, 15, 5, 'mecha.png', 10);
let enemies = [];
let bullets = [];
let keys = {};
let score = 0;
let spawnRate = 0.005;
let timeElapsed = 0;

document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

let lastTimestamp = 0;
let fps = 0;

function gameLoop(timestamp) {
    if (lastTimestamp) {
        const delta = timestamp - lastTimestamp;
        fps = 1000 / delta;
    }
    lastTimestamp = timestamp;

    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    player.move(keys);
    player.shoot();

    bullets.forEach((bullet, index) => {
        bullet.update();
        // Remove bullets that are too far from the player
        if (Math.abs(bullet.x - player.x) > canvas.width || Math.abs(bullet.y - player.y) > canvas.height) {
            bullets.splice(index, 1);
        }
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

    timeElapsed += 1 / 60;
    if (timeElapsed >= 10) {
        timeElapsed = 0;
        spawnRate += 0.001;
    }

    if (Math.random() < spawnRate) {
        spawnEnemy();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const offsetX = player.x - canvas.width / 2;
    const offsetY = player.y - canvas.height / 2;

    player.draw(offsetX, offsetY);
    bullets.forEach(bullet => bullet.draw(offsetX, offsetY));
    enemies.forEach(enemy => enemy.draw(offsetX, offsetY));

    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText(`Score: ${score}`, 10, 20);
    ctx.fillText(`FPS: ${Math.round(fps)}`, 10, 40);
    ctx.fillText(`HP: ${player.hp}`, 10, 60);
}

function spawnEnemy() {
    const side = Math.floor(Math.random() * 4);
    let x, y;

    switch (side) {
        case 0: // Left
            x = player.x - canvas.width / 2 - 50;
            y = player.y + (Math.random() - 0.5) * canvas.height;
            break;
        case 1: // Right
            x = player.x + canvas.width / 2 + 50;
            y = player.y + (Math.random() - 0.5) * canvas.height;
            break;
        case 2: // Top
            x = player.x + (Math.random() - 0.5) * canvas.width;
            y = player.y - canvas.height / 2 - 50;
            break;
        case 3: // Bottom
            x = player.x + (Math.random() - 0.5) * canvas.width;
            y = player.y + canvas.height / 2 + 50;
            break;
    }

    const enemyTypes = [
        { radius: 15, speed: 2, sprite: 'enemy1.png', hp: 3 },
        { radius: 10, speed: 3, sprite: 'enemy2.png', hp: 2 },
        { radius: 20, speed: 1.5, sprite: 'enemy3.png', hp: 5 }
    ];

    const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    enemies.push(new Enemy(x, y, type.radius, type.speed, type.sprite, type.hp));
}

gameLoop();
