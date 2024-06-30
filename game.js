// game.js

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 15,
    speed: 5,
    cooldown: 0
};

let enemies = [];
let bullets = [];
let keys = {};
let score = 0;

// Handle keyboard input
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    // Player movement
    if (keys['ArrowUp'] && player.y - player.radius > 0) player.y -= player.speed;
    if (keys['ArrowDown'] && player.y + player.radius < canvas.height) player.y += player.speed;
    if (keys['ArrowLeft'] && player.x - player.radius > 0) player.x -= player.speed;
    if (keys['ArrowRight'] && player.x + player.radius < canvas.width) player.x += player.speed;

    // Player shooting
    if (keys[' '] && player.cooldown === 0) {
        bullets.push({
            x: player.x,
            y: player.y,
            radius: 5,
            speed: 7
        });
        player.cooldown = 15;
    }

    if (player.cooldown > 0) player.cooldown--;

    // Update bullets
    bullets.forEach((bullet, index) => {
        bullet.y -= bullet.speed;
        if (bullet.y < 0) bullets.splice(index, 1);
    });

    // Update enemies
    enemies.forEach((enemy, enemyIndex) => {
        let dx = player.x - enemy.x;
        let dy = player.y - enemy.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        // Move towards player
        if (distance > 0) {
            enemy.x += (dx / distance) * enemy.speed;
            enemy.y += (dy / distance) * enemy.speed;
        }

        // Collision with player
        if (distance < player.radius + enemy.radius) {
            console.log('Player hit!');
        }

        // Bullet collision
        bullets.forEach((bullet, bulletIndex) => {
            let bulletDistance = Math.sqrt((bullet.x - enemy.x) ** 2 + (bullet.y - enemy.y) ** 2);
            if (bulletDistance < bullet.radius + enemy.radius) {
                enemies.splice(enemyIndex, 1);
                bullets.splice(bulletIndex, 1);
                score++;
            }
        });
    });

    // Spawn enemies
    if (Math.random() < 0.02) {
        spawnEnemy();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'blue';
    ctx.fill();
    ctx.closePath();

    // Draw bullets
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.closePath();
    });

    // Draw enemies
    enemies.forEach(enemy => {
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        ctx.fillStyle = enemy.color;
        ctx.fill();
        ctx.closePath();
    });

    // Draw score
    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText(`Score: ${score}`, 10, 20);
}

function spawnEnemy() {
    const x = Math.random() < 0.5 ? 0 : canvas.width;
    const y = Math.random() * canvas.height;

    // Randomize enemy type
    const enemyTypes = [
        { radius: 15, speed: 2, color: 'green' },  // Basic enemy
        { radius: 10, speed: 3, color: 'purple' }, // Fast enemy
        { radius: 20, speed: 1.5, color: 'orange' } // Strong enemy
    ];
    const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];

    enemies.push({
        x: x,
        y: y,
        radius: type.radius,
        speed: type.speed,
        color: type.color
    });
}

// Start the game
gameLoop();
