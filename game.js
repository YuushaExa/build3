window.onload = function() {

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const tileSize = 36;
const mapWidth = 100;
const mapHeight = 100;

const characters = {
    mecha: {
        speed: 1,
        hp: 100,
        weapon: "Gun"
    },
    cyborg: {
        speed: 1,
        hp: 100,
        weapon: "Shotgun"
    }
};

const weapons = {
    Gun: {
        attack: 10,
        shoot: function (playerX, playerY, angle) {
            const speed = 15;
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
    damageCooldown: false
};


const enemies = [];
const bullets = [];
const explosions = [];
const expPoints = [];
const goldDrops = [];
const damageTexts = [];
const enemySpeed = 1.5;
const enemyMaxSpeed = 2.5;
let score = 0;
let offsetX = 0;
let offsetY = 0;
let gameStarted = false;
let playerType = '';

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
    ctx.fillStyle = 'rgba(255, 165, 0, 0.5)';
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

function drawGoldDrops() {
    ctx.fillStyle = 'gold';
    goldDrops.forEach(gold => {
        ctx.fillRect(gold.x - offsetX, gold.y - offsetY, gold.size, gold.size);
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
    
    const spawnArea = Math.max(canvas.width, canvas.height) * 1.5;
    
    const side = Math.floor(Math.random() * 4);
    
    let x, y;
    
    switch (side) {
        case 0: 
            x = Math.random() * (canvas.width + offsetX - size);
            y = -size - Math.random() * spawnArea;
            break;
        case 1: 
            x = canvas.width + Math.random() * spawnArea;
            y = Math.random() * (canvas.height + offsetY - size);
            break;
        case 2: 
            x = Math.random() * (canvas.width + offsetX - size);
            y = canvas.height + Math.random() * spawnArea;
            break;
        case 3: 
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
                    if (Math.random() < 0.3) { // 30% chance to drop EXP
                        expPoints.push({ x: enemy.x, y: enemy.y, size: 5 });
                    }
                    if (Math.random() < 0.1) { // 10% chance to drop gold
                        goldDrops.push({ x: enemy.x, y: enemy.y, size: 5 });
                    }
                }
            }
        });

        if (isColliding(player, enemy)) {
            applyPlayerDamage(10);
        }
    });

    expPoints.forEach((exp, expIndex) => {
        if (Math.hypot(exp.x - (player.x + offsetX), exp.y - (player.y + offsetY)) < 20) {
            player.exp++;
            expPoints.splice(expIndex, 1);
            if (player.exp >= player.expToNextLevel) {
                player.level++;
                player.exp = 0;
                player.expToNextLevel += Math.floor(player.expToNextLevel * 1.5);
                alert('Level Up!');
            }
        }
    });

    goldDrops.forEach((gold, goldIndex) => {
        if (Math.hypot(gold.x - (player.x + offsetX), gold.y - (player.y + offsetY)) < 20) {
            score += 10;
            goldDrops.splice(goldIndex, 1);
        }
    });
}

function startVanishing(enemy) {
    enemy.vanishing = true;
    const vanishingInterval = setInterval(() => {
        enemy.alpha -= 0.1;
        if (enemy.alpha <= 0) {
            enemies.splice(enemies.indexOf(enemy), 1);
            clearInterval(vanishingInterval);
        }
    }, 100);
}

function isColliding(obj1, obj2) {
    return (
        obj1.x < obj2.x + obj2.size &&
        obj1.x + obj1.size > obj2.x &&
        obj1.y < obj2.y + obj2.size &&
        obj1.y + obj1.size > obj2.y
    );
}

function applyPlayerDamage(damage) {
    if (!player.damageCooldown) {
        player.hp -= damage;
        damageTexts.push({
            text: `-${damage}`,
            x: player.x,
            y: player.y,
            lifetime: 60
        });
        if (player.hp <= 0) {
            alert('Game Over!');
            document.location.reload();
        }
        player.damageCooldown = true;
        setTimeout(() => {
            player.damageCooldown = false;
        }, 1000);
    }
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' || event.key === 'w') player.dy = -characters[playerType].speed;
    if (event.key === 'ArrowDown' || event.key === 's') player.dy = characters[playerType].speed;
    if (event.key === 'ArrowLeft' || event.key === 'a') player.dx = -characters[playerType].speed;
    if (event.key === 'ArrowRight' || event.key === 'd') player.dx = characters[playerType].speed;
    if (event.key === ' ') {
        const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2);
        player.weapon.shoot(player.x + offsetX, player.y + offsetY, angle);
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowUp' || event.key === 'w') player.dy = 0;
    if (event.key === 'ArrowDown' || event.key === 's') player.dy = 0;
    if (event.key === 'ArrowLeft' || event.key === 'a') player.dx = 0;
    if (event.key === 'ArrowRight' || event.key === 'd') player.dx = 0;
});

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameStarted) {
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText('Select Your Character:', canvas.width / 2 - 100, canvas.height / 2 - 50);

        ctx.fillStyle = 'blue';
        ctx.fillRect(canvas.width / 2 - 150, canvas.height / 2, 100, 50);
        ctx.fillStyle = 'white';
        ctx.fillText('Mecha', canvas.width / 2 - 120, canvas.height / 2 + 30);

        ctx.fillStyle = 'green';
        ctx.fillRect(canvas.width / 2 + 50, canvas.height / 2, 100, 50);
        ctx.fillStyle = 'white';
        ctx.fillText('Cyborg', canvas.width / 2 + 80, canvas.height / 2 + 30);

        canvas.addEventListener('click', handleCharacterSelection);
    } else {
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
        drawGoldDrops();
        drawDamageTexts();
    }

    requestAnimationFrame(gameLoop);
}

function handleCharacterSelection(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (x >= canvas.width / 2 - 150 && x <= canvas.width / 2 - 50 && y >= canvas.height / 2 && y <= canvas.height / 2 + 50) {
        playerType = 'mecha';
        player.speed = characters.mecha.speed;
        player.hp = characters.mecha.hp;
        player.weapon = weapons[characters.mecha.weapon];
        gameStarted = true;
        startGame();
        canvas.removeEventListener('click', handleCharacterSelection);
    }

    if (x >= canvas.width / 2 + 50 && x <= canvas.width / 2 + 150 && y >= canvas.height / 2 && y <= canvas.height / 2 + 50) {
        playerType = 'cyborg';
        player.speed = characters.cyborg.speed;
        player.hp = characters.cyborg.hp;
        player.weapon = weapons[characters.cyborg.weapon];
        gameStarted = true;
        startGame();
        canvas.removeEventListener('click', handleCharacterSelection);
    }
}

function startGame() {
    setInterval(spawnEnemy, 1000);
}

gameLoop();
};
