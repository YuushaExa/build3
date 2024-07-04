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
    let score = 0;
    let offsetX = 0;
    let offsetY = 0;
    let gameStarted = false;
    let talentSelected = false;

    const talents = {
        basic: [
            { name: "Increase Speed", effect: () => player.speed += 0.2 },
            { name: "Increase HP", effect: () => player.hp += 20 },
            { name: "Increase Attack", effect: () => player.attack += 5 }
        ],
        advanced: {
            "Increase Speed": [
                { name: "Double Speed", effect: () => player.speed *= 2 }
            ],
            "Increase HP": [
                { name: "Regeneration", effect: () => player.hp += 10 }
            ],
            "Increase Attack": [
                { name: "Critical Hit", effect: () => player.critChance += 0.1 }
            ]
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
        const spawnArea = Math.max(canvas.width, canvas.height) * 1.5;
        const side = Math.floor(Math.random() * 4);
        let x, y;

        switch (side) {
            case 0: 
                x = Math.random() * (canvas.width + offsetX) - offsetX;
                y = -size;
                break;
            case 1: 
                x = canvas.width + size + offsetX;
                y = Math.random() * (canvas.height + offsetY) - offsetY;
                break;
            case 2: 
                x = Math.random() * (canvas.width + offsetX) - offsetX;
                y = canvas.height + size + offsetY;
                break;
            case 3: 
                x = -size;
                y = Math.random() * (canvas.height + offsetY) - offsetY;
                break;
        }

        enemies.push({
            x, y, size,
            hp: 10,
            speed: enemySpeed
        });
    }

    function spawnEnemies() {
        for (let i = 0; i < 10; i++) {
            spawnEnemy();
        }
    }

    function isColliding(a, b) {
        return (
            a.x < b.x + b.size &&
            a.x + a.size > b.x &&
            a.y < b.y + b.size &&
            a.y + a.size > b.y
        );
    }

    function handleCollisions() {
        enemies.forEach((enemy, enemyIndex) => {
            if (!enemy.vanishing && isColliding(player, enemy)) {
                if (!player.damageCooldown) {
                    player.hp -= 10;
                    player.damageCooldown = true;
                    setTimeout(() => { player.damageCooldown = false; }, 1000);
                    damageTexts.push({
                        text: '-10 HP',
                        x: player.x,
                        y: player.y - 10,
                        lifetime: 50
                    });
                }
            }

            bullets.forEach((bullet, bulletIndex) => {
                if (isColliding(bullet, enemy)) {
                    enemy.hp -= bullet.attack;
                    explosions.push({
                        x: enemy.x,
                        y: enemy.y,
                        radius: 10,
                        alpha: 1.0
                    });
                    bullets.splice(bulletIndex, 1);

                    if (enemy.hp <= 0) {
                        enemy.vanishing = true;
                        enemy.alpha = 1.0;
                        expPoints.push({
                            x: enemy.x,
                            y: enemy.y,
                            size: 10,
                            value: 1
                        });
                        goldPoints.push({
                            x: enemy.x,
                            y: enemy.y,
                            size: 10,
                            value: 1
                        });
                        score += 1;

                        if (score % 10 === 0) {
                            showTalentOverlay();
                        }
                    }
                }
            });
        });
    }

    function update() {
        updatePlayerPosition();
        moveEnemies();
        moveBullets();
        updateExplosions();
        handleCollisions();
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPlayer();
        drawEnemies();
        drawBullets();
        drawExplosions();
        drawExpPoints();
        drawGoldPoints();
        drawDamageTexts();
    }

    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    function startGame() {
        const selectedCharacter = document.getElementById('characterSelect').value;
        const selectedLevel = document.getElementById('levelSelect').value;

        player.speed = characters[selectedCharacter].speed;
        player.hp = characters[selectedCharacter].hp;
        player.weapon = weapons[characters[selectedCharacter].weapon];

        gameStarted = true;
        document.getElementById('menu').style.display = 'none';
        canvas.style.display = 'block';
        spawnEnemies();
        gameLoop();
    }

    function showTalentOverlay() {
        document.getElementById('talentOverlay').style.display = 'block';
        const talentOptions = document.getElementById('talentOptions');
        talentOptions.innerHTML = '';

        talents.basic.forEach(talent => {
            const option = document.createElement('div');
            option.textContent = talent.name;
            option.onclick = () => selectTalent(talent);
            talentOptions.appendChild(option);
        });
    }

    function selectTalent(talent) {
        const talentOptions = document.getElementById('talentOptions');
        talentOptions.innerHTML = '';

        talent.effect();

        if (talents.advanced[talent.name]) {
            talents.advanced[talent.name].forEach(advancedTalent => {
                const option = document.createElement('div');
                option.textContent = advancedTalent.name;
                option.onclick = () => {
                    advancedTalent.effect();
                    document.getElementById('talentOverlay').style.display = 'none';
                    talentSelected = true;
                };
                talentOptions.appendChild(option);
            });
        } else {
            document.getElementById('talentOverlay').style.display = 'none';
            talentSelected = true;
        }
    }

    document.getElementById('startButton').onclick = startGame;
    document.getElementById('confirmTalentButton').onclick = () => {
        document.getElementById('talentOverlay').style.display = 'none';
        talentSelected = true;
    };

    window.addEventListener('keydown', e => {
        if (e.key === 'ArrowUp') player.dy = -player.speed;
        if (e.key === 'ArrowDown') player.dy = player.speed;
        if (e.key === 'ArrowLeft') player.dx = -player.speed;
        if (e.key === 'ArrowRight') player.dx = player.speed;
    });

    window.addEventListener('keyup', e => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') player.dy = 0;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') player.dx = 0;
    });

    canvas.addEventListener('click', e => {
        if (gameStarted) {
            const angle = Math.atan2(e.clientY - player.y, e.clientX - player.x);
            player.weapon.shoot(player.x, player.y, angle);
        }
    });
};
