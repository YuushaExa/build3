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
    const goldPoints = [];
    const damageTexts = [];
    const enemySpeed = 1.5;
    const enemyMaxSpeed = 2.5;
    let gold = 0;
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

    function drawGoldPoints() {
        ctx.fillStyle = 'yellow';
        goldPoints.forEach(gold => {
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
                    if (enemy.hp <= 0) {
                        enemy.vanishing = true;
                        setTimeout(() => {
                            enemies.splice(enemyIndex, 1);
                        }, 500);
                        const numGoldPoints = Math.floor(Math.random() * 3) + 1;
                        for (let i = 0; i < numGoldPoints; i++) {
                            goldPoints.push({
                                x: enemy.x,
                                y: enemy.y,
                                size: 5
                            });
                        }
                        score += 1;
                        expPoints.push({
                            x: enemy.x,
                            y: enemy.y,
                            size: 10
                        });
                        explosions.push({
                            x: enemy.x,
                            y: enemy.y,
                            radius: 30,
                            alpha: 1
                        });
                    }
                }
            });

            if (isColliding(player, enemy)) {
                if (!player.damageCooldown) {
                    player.hp -= 20;
                    player.damageCooldown = true;
                    damageTexts.push({
                        text: '-20',
                        x: player.x,
                        y: player.y,
                        lifetime: 60
                    });
                    setTimeout(() => {
                        player.damageCooldown = false;
                    }, 1000);
                    if (player.hp <= 0) {
                        alert("Game Over! Your Score: " + score);
                        location.reload();
                    }
                }
            }
        });

        expPoints.forEach((exp, index) => {
            if (isColliding(player, exp)) {
                player.exp += 10;
                expPoints.splice(index, 1);
                if (player.exp >= player.expToNextLevel) {
                    player.level++;
                    player.exp = 0;
                    player.expToNextLevel += 10;
                    player.hp = 100;
                }
            }
        });

        goldPoints.forEach((goldPoint, index) => {
            if (isColliding(player, goldPoint)) {
                gold += 1;
                goldPoints.splice(index, 1);
            }
        });
    }

    function isColliding(a, b) {
        return (
            a.x < b.x + b.size &&
            a.x + a.size > b.x &&
            a.y < b.y + b.size &&
            a.y + a.size > b.y
        );
    }

    function gameLoop() {
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
        drawGoldPoints();
        drawDamageTexts();

        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, 10, 30);
        ctx.fillText(`HP: ${player.hp}`, 10, 60);
        ctx.fillText(`Gold: ${gold}`, 10, 90);
        ctx.fillText(`Level: ${player.level}`, 10, 120);

        requestAnimationFrame(gameLoop);
    }

    function startGame(character) {
        player = {
            ...player,
            speed: characters[character].speed,
            hp: characters[character].hp,
            weapon: weapons[characters[character].weapon]
        };
        player.weapon.shoot = player.weapon.shoot.bind(player.weapon);
        gameStarted = true;
        gameLoop();
    }

    document.addEventListener('keydown', (e) => {
        if (!gameStarted) return;

        switch (e.key) {
            case 'ArrowUp':
            case 'w':
                player.dy = -player.speed;
                break;
            case 'ArrowDown':
            case 's':
                player.dy = player.speed;
                break;
            case 'ArrowLeft':
            case 'a':
                player.dx = -player.speed;
                break;
            case 'ArrowRight':
            case 'd':
                player.dx = player.speed;
                break;
            case ' ':
                const angle = Math.atan2(
                    canvas.height / 2 - player.y,
                    canvas.width / 2 - player.x
                );
                player.weapon.shoot(player.x, player.y, angle);
                break;
            default:
                break;
        }
    });

    document.addEventListener('keyup', (e) => {
        if (!gameStarted) return;

        switch (e.key) {
            case 'ArrowUp':
            case 'ArrowDown':
            case 'w':
            case 's':
                player.dy = 0;
                break;
            case 'ArrowLeft':
            case 'ArrowRight':
            case 'a':
            case 'd':
                player.dx = 0;
                break;
            default:
                break;
        }
    });

    document.getElementById('startGameButton').addEventListener('click', () => {
        const selectedCharacter = document.querySelector('input[name="character"]:checked').value;
        startGame(selectedCharacter);
    });

    setInterval(spawnEnemy, 2000);
}
