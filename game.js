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
        weapon: "Gun"
    },
    cyborg: {
        speed: 5,
        hp: 100,
        weapon: "Shotgun"
    }
};

const weapons = {
    Gun: {
        attack: 10,
        shoot: function (playerX, playerY, angle) {
            const speed = 5;
            bullets.push({
                x: playerX,
                y: playerY,
                size: 5,
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed,
                attack: this.attack,
                penetrate: 0
            });
        }
    },
    Shotgun: {
        attack: 15,
        shoot: function (playerX, playerY, angle) {
            const spreadAngle = 0.1;
            for (let i = -1; i <= 1; i += 2) {
                const bulletAngle = angle + i * spreadAngle;
                const speed = 5;
                bullets.push({
                    x: playerX,
                    y: playerY,
                    size: 5,
                    dx: Math.cos(bulletAngle) * speed,
                    dy: Math.sin(bulletAngle) * speed,
                    attack: this.attack,
                    penetrate: 2
                });
            }
        }
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
    weapon: null,
    exp: 0,
    level: 1,
    expToNextLevel: 10,
    damageCooldown: false // Initialize cooldown status
};


const enemies = [];
const bullets = [];
const explosions = [];
const expPoints = [];
const damageTexts = []; // Add a list to store damage texts
const enemySpeed = 1.5;
const enemyMaxSpeed = 2.5;
let score = 0;
let offsetX = 0;
let offsetY = 0;
let gameStarted = false;

function drawPlayer() {
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x, player.y, player.size, player.size);
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
    ctx.fillStyle = `rgba(255, 165, 0, 0.5)`;
    explosions.forEach(explosion => {
        ctx.beginPath();
        ctx.arc(explosion.x - offsetX, explosion.y - offsetY, explosion.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawExpPoints() {
    ctx.fillStyle = 'blue';
    expPoints.forEach(exp => {
        ctx.fillRect(exp.x - offsetX, exp.y - offsetY, exp.size, exp.size);
    });
}

function drawDamageTexts() {
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    damageTexts.forEach((damageText, index) => {
        ctx.fillText(damageText.text, damageText.x - offsetX, damageText.y - offsetY);
        damageText.lifetime -= 1;
        if (damageText.lifetime <= 0) {
            damageTexts.splice(index, 1);
        }
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
    
    // Determine spawn area outside the canvas edges
    const spawnArea = Math.max(canvas.width, canvas.height) * 1.5; // Adjust multiplier as needed
    
    // Randomly choose a side to spawn the enemy
    const side = Math.floor(Math.random() * 4); // 0 = top, 1 = right, 2 = bottom, 3 = left
    
    let x, y;
    
    // Calculate initial position based on chosen side
    switch (side) {
        case 0: // Top
            x = Math.random() * (canvas.width + offsetX - size);
            y = -size - Math.random() * spawnArea;
            break;
        case 1: // Right
            x = canvas.width + Math.random() * spawnArea;
            y = Math.random() * (canvas.height + offsetY - size);
            break;
        case 2: // Bottom
            x = Math.random() * (canvas.width + offsetX - size);
            y = canvas.height + Math.random() * spawnArea;
            break;
        case 3: // Left
            x = -size - Math.random() * spawnArea;
            y = Math.random() * (canvas.height + offsetY - size);
            break;
        default:
            break;
    }
    
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
        // Check collision between bullets and enemies
        bullets.forEach((bullet, bulletIndex) => {
            if (isColliding(bullet, enemy)) {
                enemy.hp -= bullet.attack;
                damageTexts.push({
                    text: `-${bullet.attack}`,
                    x: enemy.x,
                    y: enemy.y,
                    lifetime: 60
                });
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
                    expPoints.push({ x: enemy.x, y: enemy.y, size: 5 });
                }
            }
        });

        // Check collision between player and enemies
      if (isColliding(player, enemy)) {
    applyPlayerDamage(10); // Apply damage to the player immediately
}
    });

    // Check collision between player and EXP points
    expPoints.forEach((exp, expIndex) => {
        if (Math.hypot(exp.x - (player.x + offsetX), exp.y - (player.y + offsetY)) < 20) {
            player.exp++;
            expPoints.splice(expIndex, 1);
            if (player.exp >= player.expToNextLevel) {
                player.level++;
                player.exp = 0;
                player.expToNextLevel = Math.ceil(player.expToNextLevel * 1.5);
            }
        }
    });
}

function applyPlayerDamage(amount) {
    if (player.damageCooldown) return; // Prevent multiple damage applications in quick succession
    player.hp -= amount;
    player.damageCooldown = true;
    setTimeout(() => {
        player.damageCooldown = false;
    }, 100); // 1 second cooldown between damage applications
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

function drawExpBar() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Level: ${player.level}`, 10, 60);
    
    ctx.fillStyle = 'blue';
    ctx.fillRect(10, 80, (canvas.width - 20) * (player.exp / player.expToNextLevel), 10);

    ctx.strokeStyle = 'white';
    ctx.strokeRect(10, 80, canvas.width - 20, 10);
}

function drawHP() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`HP: ${player.hp}`, 10, 100);
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
    if (closestEnemy && player.weapon) {
        const angle = Math.atan2(closestEnemy.y - (player.y + offsetY), closestEnemy.x - (player.x + offsetX));
        weapons[player.weapon].shoot(player.x + offsetX, player.y + offsetY, angle);
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
    drawExpPoints();
    drawDamageTexts();
    drawScore();
    drawExpBar();
    drawHP();

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
    player.weapon = characterData.weapon;

    gameStarted = true;
    document.getElementById('menu').style.display = 'none';
    canvas.style.display = 'block';
    update();
});
