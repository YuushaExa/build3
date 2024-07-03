const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const tileSize = 50;
const mapWidth = 100;
const mapHeight = 100;

const characters = {
    mecha: {
        speed: 5,
        hp: 100,
        attack: 10,
        inventory: ["Gun"]
    },
    cyborg: {
        speed: 5,
        hp: 100,
        attack: 15,
        inventory: ["Shotgun"]
    }
};

let player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 20,
    speed: 0,
    dx: 0,
    dy: 0,
    hp: 0,
    attack: 0,
    inventory: []
};

const enemies = [];
const bullets = [];
const explosions = [];
const enemySpeed = 1.5;
const enemyMaxSpeed = 2.5;
let score = 0;
let offsetX = 0;
let offsetY = 0;
let gameStarted = false;

function drawPlayer() {
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x, player.y, player.size, player.size);
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText(`HP: ${player.hp}`, player.x - 10, player.y - 10);
}

function drawEnemies() {
    enemies.forEach(enemy => {
        if (enemy.vanishing) {
            ctx.fillStyle = `rgba(255, 0, 0, ${enemy.alpha})`;
            ctx.beginPath();
            ctx.arc(enemy.x - offsetX, enemy.y - offsetY, enemy.size / 2 * enemy.alpha, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = 'red';
            ctx.fillRect(enemy.x - offsetX, enemy.y - offsetY, enemy.size, enemy.size);
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.fillText(`HP: ${enemy.hp}`, enemy.x - offsetX, enemy.y - offsetY - 10);
        }
    });
}

function drawBullets() {
    ctx.fillStyle = 'yellow';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x - offsetX, bullet.y - offsetY, bullet.size, bullet.size);
    });
}

function drawExplosions() {
    explosions.forEach(explosion => {
        ctx.fillStyle = `rgba(255, 165, 0, ${explosion.alpha})`;
        ctx.beginPath();
        ctx.arc(explosion.x - offsetX, explosion.y - offsetY, explosion.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

function updatePlayerPosition() {
    player.x += player.dx;
    player.y += player.dy;

    offsetX += player.dx;
    offsetY += player.dy;

    if (player.x < 0) player.x = 0;
    if (player.x + player.size > canvas.width) player.x = canvas.width - player.size;
    if (player.y < 0) player.y = 0;
    if (player.y + player.size > canvas.height) player.y = canvas.height - player.size;
}

function moveEnemies() {
    enemies.forEach(enemy => {
        if (!enemy.vanishing) {
            const angle = Math.atan2(player.y + offsetY - enemy.y, player.x + offsetX - enemy.x);
            const speed = Math.min(enemyMaxSpeed, enemy.speed + score * 0.01);

            enemy.x += Math.cos(angle) * speed;
            enemy.y += Math.sin(angle) * speed;

            enemies.forEach(otherEnemy => {
                if (enemy !== otherEnemy && isColliding(enemy, otherEnemy)) {
                    const angleBetween = Math.atan2(otherEnemy.y - enemy.y, otherEnemy.x - enemy.x);
                    enemy.x -= Math.cos(angleBetween) * speed;
                    enemy.y -= Math.sin(angleBetween) * speed;
                }
            });
        }
    });
}

function moveBullets() {
    bullets.forEach((bullet, index) => {
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;

        if (
            bullet.x < offsetX || bullet.x > offsetX + canvas.width ||
            bullet.y < offsetY || bullet.y > offsetY + canvas.height
        ) {
            bullets.splice(index, 1);
        }
    });
}

function updateExplosions() {
    explosions.forEach((explosion, index) => {
        explosion.alpha -= 0.02;
        if (explosion.alpha <= 0) {
            explosions.splice(index, 1);
        }
    });
}

function spawnEnemy() {
    const size = 20;
    const x = Math.random() * (canvas.width + offsetX - size);
    const y = Math.random() * (canvas.height + offsetY - size);
    enemies.push({
        x,
        y,
        size,
        speed: Math.random() * 1.5 + 0.5,
        hp: 20,
        vanishing: false,
        alpha: 1
    });
}

function checkCollisions() {
    enemies.forEach((enemy, enemyIndex) => {
        bullets.forEach((bullet, bulletIndex) => {
            if (isColliding(bullet, enemy)) {
                enemy.hp -= bullet.attack;
                if (bullet.penetrate) {
                    bullet.penetrate--;
                    if (bullet.penetrate <= 0) {
                        bullets.splice(bulletIndex, 1);
                    }
                } else {
                    bullets.splice(bulletIndex, 1);
                }
                if (enemy.hp <= 0 && !enemy.vanishing) {
                    startVanishing(enemy);
                    score++;
                }
            }
        });

        if (!enemy.vanishing && isColliding(player, enemy)) {
            player.hp -= 10;
            startVanishing(enemy);
        }
    });
}

function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.size &&
           rect1.x + rect1.size > rect2.x &&
           rect1.y < rect2.y + rect2.size &&
           rect1.y + rect1.size > rect2.y;
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

function drawInventory() {
    ctx.fillStyle = 'gray';
    ctx.font = '16px Arial';
    for (let i = 0; i < player.inventory.length; i++) {
        ctx.fillText(`Slot ${i+1}: ${player.inventory[i] || 'Empty'}`, 10, 60 + i * 20);
    }
}

function generateTiles() {
    for (let y = -1; y <= canvas.height / tileSize + 1; y++) {
        for (let x = -1; x <= canvas.width / tileSize + 1; x++) {
            const tileX = (x * tileSize - offsetX % tileSize) % (tileSize * mapWidth);
            const tileY = (y * tileSize - offsetY % tileSize) % (tileSize * mapHeight);
            ctx.fillStyle = ((x + y) % 2 === 0) ? '#555' : '#333';
            ctx.fillRect(tileX, tileY, tileSize, tileSize);
        }
    }
}

function findClosestEnemy() {
    let closestEnemy = null;
    let closestDistance = Infinity;

    enemies.forEach(enemy => {
        const distance = Math.hypot(enemy.x - (player.x + offsetX), enemy.y - (player.y + offsetY));
        if (distance < closestDistance) {
            closestDistance = distance;
            closestEnemy = enemy;
        }
    });

    return closestEnemy;
}

function shootClosestEnemy() {
    const closestEnemy = findClosestEnemy();
    if (closestEnemy) {
        const angle = Math.atan2(closestEnemy.y - (player.y + offsetY), closestEnemy.x - (player.x + offsetX));
        if (player.inventory[0] === "Gun") {
            const speed = 5;
            bullets.push({
                x: player.x + offsetX,
                y: player.y + offsetY,
                size: 5,
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed,
                attack: player.attack,
                penetrate: 0
            });
        } else if (player.inventory[0] === "Shotgun") {
            const spreadAngle = 0.1;
            for (let i = -1; i <= 1; i += 2) {
                const bulletAngle = angle + i * spreadAngle;
                const speed = 5;
                bullets.push({
                    x: player.x + offsetX,
                    y: player.y + offsetY,
                    size: 5,
                    dx: Math.cos(bulletAngle) * speed,
                    dy: Math.sin(bulletAngle) * speed,
                    attack: player.attack,
                    penetrate: 2
                });
            }
        }
    }
}

function createExplosion(x, y) {
    explosions.push({
        x: x,
        y: y,
        radius: 20,
        alpha: 1
    });
}

function startVanishing(enemy) {
    enemy.vanishing = true;
    const vanishInterval = setInterval(() => {
        enemy.alpha -= 0.05;
        if (enemy.alpha <= 0) {
            clearInterval(vanishInterval);
            enemies.splice(enemies.indexOf(enemy), 1);
        }
    }, 50);
}

function update() {
    if (!gameStarted) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    generateTiles();
    drawPlayer();
    drawEnemies();
    drawBullets();
    drawExplosions();
    drawScore();
    drawInventory();

    updatePlayerPosition();
    moveEnemies();
    moveBullets();
    updateExplosions();
    checkCollisions();

    requestAnimationFrame(update);
}

function keyDown(e) {
    if (e.key === 'ArrowRight' || e.key === 'd') {
        player.dx = player.speed;
    } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        player.dx = -player.speed;
    } else if (e.key === 'ArrowUp' || e.key === 'w') {
        player.dy = -player.speed;
    } else if (e.key === 'ArrowDown' || e.key === 's') {
        player.dy = player.speed;
    }
}

function keyUp(e) {
    if (
        e.key === 'ArrowRight' || e.key === 'd' ||
        e.key === 'ArrowLeft' || e.key === 'a' ||
        e.key === 'ArrowUp' || e.key === 'w' ||
        e.key === 'ArrowDown' || e.key === 's'
    ) {
        player.dx = 0;
        player.dy = 0;
    }
}

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

setInterval(shootClosestEnemy, 1000);
setInterval(spawnEnemy, 2000);

document.getElementById('startButton').addEventListener('click', () => {
    const selectedCharacter = document.getElementById('characterSelect').value;
    const characterData = characters[selectedCharacter];

    player.speed = characterData.speed;
    player.hp = characterData.hp;
    player.attack = characterData.attack;
    player.inventory = [...characterData.inventory];

    gameStarted = true;
    document.getElementById('menu').style.display = 'none';
    canvas.style.display = 'block';
    update();
});
