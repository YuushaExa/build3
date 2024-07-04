<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Game</title>
    <style>
        #menu { display: block; }
        #gameCanvas { display: none; }
    </style>
</head>
<body>
    <div id="menu">
        <select id="characterSelect">
            <option value="mecha">Mecha</option>
            <option value="cyborg">Cyborg</option>
        </select>
        <button id="startButton">Start Game</button>
    </div>
    <canvas id="gameCanvas"></canvas>
    <script>
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
                    shoot: function(playerX, playerY, angle) {
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
                    shoot: function(playerX, playerY, angle) {
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
                damageCooldown: false, // Initialize cooldown status
                gold: 0 // Initialize gold
            };

            const enemies = [];
            const bullets = [];
            const explosions = [];
            const expPoints = [];
            const goldPoints = [];
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

            function drawGoldPoints() {
                ctx.fillStyle = 'gold';
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
                                // Drop experience with a 30% chance
                                if (Math.random() < 0.3) {
                                    expPoints.push({ x: enemy.x, y: enemy.y, size: 5 });
                                }
                                // Drop gold with a 10% chance
                                if (Math.random() < 0.1) {
                                    goldPoints.push({ x: enemy.x, y: enemy.y, size: 5 });
                                }
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

                // Check collision between player and gold points
                goldPoints.forEach((gold, goldIndex) => {
                    if (Math.hypot(gold.x - (player.x + offsetX), gold.y - (player.y + offsetY)) < 20) {
                        player.gold++;
                        goldPoints.splice(goldIndex, 1);
                    }
                });
            }

            function applyPlayerDamage(damage) {
                if (!player.damageCooldown) {
                    player.hp -= damage;
                    player.damageCooldown = true;

                    setTimeout(() => {
                        player.damageCooldown = false;
                    }, 1000);
                }
            }

            function isColliding(obj1, obj2) {
                return (
                    obj1.x < obj2.x + obj2.size &&
                    obj1.x + obj1.size > obj2.x &&
                    obj1.y < obj2.y + obj2.size &&
                    obj1.y + obj1.size > obj2.y
                );
            }

            function startVanishing(enemy) {
                enemy.vanishing = true;
                let vanishingInterval = setInterval(() => {
                    enemy.alpha -= 0.05;
                    if (enemy.alpha <= 0) {
                        clearInterval(vanishingInterval);
                        const index = enemies.indexOf(enemy);
                        if (index > -1) {
                            enemies.splice(index, 1);
                        }
                    }
                }, 50);
            }

            function generateTiles() {
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.fillStyle = 'gray';
                for (let i = -offsetX % tileSize; i < canvas.width; i += tileSize) {
                    for (let j = -offsetY % tileSize; j < canvas.height; j += tileSize) {
                        ctx.fillRect(i, j, tileSize - 2, tileSize - 2);
                    }
                }
            }

            function drawScore() {
                ctx.fillStyle = 'white';
                ctx.font = '20px Arial';
                ctx.fillText(`Score: ${score}`, 10, 30);
                ctx.fillText(`Gold: ${player.gold}`, 10, 50); // Display gold
            }

            function drawExpBar() {
                ctx.fillStyle = 'white';
                ctx.fillRect(10, canvas.height - 30, 100, 20);
                ctx.fillStyle = 'blue';
                ctx.fillRect(10, canvas.height - 30, (player.exp / player.expToNextLevel) * 100, 20);
            }

            function drawHP() {
                ctx.fillStyle = 'red';
                ctx.fillRect(10, canvas.height - 60, (player.hp / 100) * 100, 20);
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
                drawGoldPoints(); // Draw gold points
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

            document.getElementById('startButton').addEventListener('click', () => {
                const characterType = document.getElementById('characterSelect').value;
                const selectedCharacter = characters[characterType];

                player.speed = selectedCharacter.speed;
                player.hp = selectedCharacter.hp;
                player.weapon = selectedCharacter.weapon;

                gameStarted = true;
                document.getElementById('menu').style.display = 'none';
                canvas.style.display = 'block';

                spawnEnemiesPeriodically();
                update();
            });

            function spawnEnemiesPeriodically() {
                setInterval(spawnEnemy, 2000);
            }

            window.addEventListener('keydown', (e) => {
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
                        if (player.weapon && weapons[player.weapon]) {
                            const angle = Math.atan2(player.dy, player.dx);
                            weapons[player.weapon].shoot(player.x + offsetX, player.y + offsetY, angle);
                        }
                        break;
                }
            });

            window.addEventListener('keyup', (e) => {
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
                }
            });
        };
    </script>
</body>
</html>
