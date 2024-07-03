const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const tileSize = 50;
const mapWidth = 100;  // Number of tiles horizontally
const mapHeight = 100; // Number of tiles vertically

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 20,
    speed: 5,
    dx: 0,
    dy: 0,
    inventory: new Array(6).fill(null)
};

player.inventory[0] = "Gun"; // Adding a basic weapon (Gun) to the inventory

const enemies = [];
const enemySpeed = 2;
let score = 0;
let offsetX = 0;
let offsetY = 0;

function drawPlayer() {
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x, player.y, player.size, player.size);
}

function drawEnemies() {
    ctx.fillStyle = 'red';
    enemies.forEach(enemy => {
        ctx.fillRect(enemy.x - offsetX, enemy.y - offsetY, enemy.size, enemy.size);
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
        if (enemy.x < player.x + offsetX) {
            enemy.x += enemySpeed;
        } else {
            enemy.x -= enemySpeed;
        }

        if (enemy.y < player.y + offsetY) {
            enemy.y += enemySpeed;
        } else {
            enemy.y -= enemySpeed;
        }
    });
}

function spawnEnemy() {
    const size = 20;
    const x = Math.random() * (canvas.width + offsetX - size);
    const y = Math.random() * (canvas.height + offsetY - size);
    enemies.push({ x, y, size });
}

function checkCollisions() {
    enemies.forEach((enemy, index) => {
        if (player.x < enemy.x - offsetX + enemy.size &&
            player.x + player.size > enemy.x - offsetX &&
            player.y < enemy.y - offsetY + enemy.size &&
            player.y + player.size > enemy.y - offsetY) {
            enemies.splice(index, 1);
            score++;
        }
    });
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

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    generateTiles();
    drawPlayer();
    drawEnemies();
    drawScore();
    drawInventory();

    updatePlayerPosition();
    moveEnemies();
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

setInterval(spawnEnemy, 2000);
update();
