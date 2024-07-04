const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const tileSize = 50;
const mapWidth = 100;  // Number of tiles horizontally
const mapHeight = 100; // Number of tiles vertically

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
const damageTexts = [];
const enemyMaxSpeed = 2.5;
let score = 0;
let offsetX = 0;
let offsetY = 0;
let gameStarted = false;

const characters = {
    mecha: { speed: 3, hp: 100, weapon: 'Gun' },
    cyborg: { speed: 2, hp: 100, weapon: 'Shotgun' }
};

const weapons = {
    Gun: {
        attack: 10,
        shoot: function (x, y, angle) {
            const speed = 5;
            bullets.push({
                x: x,
                y: y,
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
        shoot: function (x, y, angle) {
            const speed = 5;
            const spread = Math.PI / 12; // 15 degrees spread
            bullets.push({
                x: x,
                y: y,
                size: 5,
                dx: Math.cos(angle - spread) * speed,
                dy: Math.sin(angle - spread) * speed,
                attack: this.attack,
                penetrate: 1
            });
            bullets.push({
                x: x,
                y: y,
                size: 5,
                dx: Math.cos(angle + spread) * speed,
                dy: Math.sin(angle + spread) * speed,
                attack: this.attack,
                penetrate: 1
            });
        }
    }
};

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
    explosions.forEach(explosion => {
        ctx.fillStyle = `rgba(255, 165, 0, ${explosion.alpha})`;
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

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

function drawExpBar() {
    ctx.fillStyle = 'white';
    ctx.fillRect(10, 50, 200, 20);
    ctx.fillStyle = 'blue';
    ctx.fillRect(10, 50, (player.exp / player.expToNextLevel) * 200, 20);
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText(`Level: ${player.level}`, 220, 65);
}

function drawHP() {
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText(`HP: ${player.hp}`, 10, 80);
}

function drawDamageTexts() {
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    damageTexts.forEach((text, index) => {
        ctx.fillText(text.text, text.x - offsetX, text.y - offsetY);
        text.y -= 1; // Move the text up
        text.alpha -= 0.02; // Fade out the text
        if (text.alpha <= 0) {
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

            // Avoid overlapping with other enemies
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

        // Remove bullets that go off-screen
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
    let x, y;
    const edge = Math.floor(Math.random() * 4);

    switch (edge) {
        case 0: // Top edge
            x = Math.random() * canvas.width + offsetX;
            y = offsetY - size;
            break;
        case 1: // Right edge
            x = offsetX + canvas.width;
            y = Math.random() * canvas.height + offsetY;
            break;
        case 2: // Bottom edge
            x = Math.random() * canvas.width + offsetX;
            y = offsetY + canvas.height;
            break;
        case 3: // Left edge
            x = offsetX - size;
            y = Math.random() * canvas.height + offsetY;
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
                damageTexts.push({ text: `-${bullet.attack}`, x: enemy.x, y: enemy.y, alpha: 1 });

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
        if (!enemy.vanishing && isColliding(player, enemy)) {
            applyPlayerDamage(10); // Apply damage to the player
            startVanishing(enemy);
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
    }, 1000); // 1 second cooldown between damage applications
}

function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.size &&
           rect1.x + rect1.size > rect2.x &&
           rect1.y < rect2.y + rect2.size &&
           rect1.y + rect1.size > rect2.y;
}

function startVanishing(enemy) {
    enemy.vanishing = true;
    enemy.alpha = 1;
    const fadeOut = setInterval(() => {
        enemy.alpha -= 0.05;
        if (enemy.alpha <= 0) {
            clearInterval(fadeOut);
            const index = enemies.indexOf(enemy);
            if (index !== -1) enemies.splice(index, 1);
        }
    }, 100);
}

function gameLoop() {
    if (gameStarted) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        updatePlayerPosition();
        moveEnemies();
        moveBullets();
        updateExplosions();
        checkCollisions();

        drawPlayer();
        drawEnemies();
        drawBullets();
        drawExplosions();
        drawExpPoints();
        drawScore();
        drawExpBar();
        drawHP();
        drawDamageTexts();
    }

    requestAnimationFrame(gameLoop);
}

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

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'w') player.dy = -player.speed;
    if (e.key === 'ArrowDown' || e.key === 's') player.dy = player.speed;
    if (e.key === 'ArrowLeft' || e.key === 'a') player.dx = -player.speed;
    if (e.key === 'ArrowRight' || e.key === 'd') player.dx = player.speed;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'w') player.dy = 0;
    if (e.key === 'ArrowDown' || e.key === 's') player.dy = 0;
    if (e.key === 'ArrowLeft' || e.key === 'a') player.dx = 0;
    if (e.key === 'ArrowRight' || e.key === 'd') player.dx = 0;
});

canvas.addEventListener('click', (e) => {
    if (player.weapon) {
        const angle = Math.atan2(e.clientY - player.y, e.clientX - player.x);
        player.weapon.shoot(player.x + player.size / 2, player.y + player.size / 2, angle);
    }
});

gameLoop();
