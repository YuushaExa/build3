import { Player, Enemy, Bullet, Weapon } from './entities.js';
import { BackgroundTile, generateTiles } from './background.js';
import { Menu } from './menu.js';
import { updateParticles, drawParticles, createParticles } from './particles.js';
import { maps, stories } from './maps.js';
import { getRandomOptions, weapons } from './options.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state variables
let player;
const enemies = [];
const bullets = [];
const particles = [];
const keys = {};
const tileSize = 100;
const tiles = new Map();
let spawnRate = 0.005;
let timeElapsed = 0;
const fpsHistory = [];
let lastTimestamp = 0;
const menu = new Menu();
let currentMap = 0;

// Start menu elements
const startMenu = document.getElementById('startMenu');
const startButton = document.getElementById('startButton');
const characterMenu = document.getElementById('characterMenu');
const character1 = document.getElementById('character1');
const mapMenu = document.getElementById('mapMenu');
const mapOptions = document.getElementById('mapOptions');
const storyOverlay = document.getElementById('storyOverlay');
const storyText = document.getElementById('storyText');
const continueButton = document.getElementById('continueButton');
const endOverlay = document.getElementById('endOverlay');
const nextMapButton = document.getElementById('nextMapButton');
const levelUpMenu = document.getElementById('levelUpMenu');
const levelUpOptions = document.getElementById('levelUpOptions');

startButton.addEventListener('click', () => {
    startMenu.classList.remove('active');
    characterMenu.classList.add('active');
});

character1.addEventListener('click', () => {
    player = new Player(canvas.width / 2, canvas.height / 2, 15, 5, 'assets/mecha.png', 10);
    characterMenu.classList.remove('active');
    mapMenu.classList.add('active');
    setupMapOptions();
});

function setupMapOptions() {
    mapOptions.innerHTML = '';
    for (let i = 0; i < maps.length; i++) {
        if (i <= currentMap) {
            const button = document.createElement('button');
            button.textContent = `Map ${i + 1}`;
            button.addEventListener('click', () => selectMap(i));
            mapOptions.appendChild(button);
        }
    }
}

function selectMap(mapIndex) {
    currentMap = mapIndex;
    mapMenu.classList.remove('active');
    storyOverlay.classList.add('active');
    storyText.textContent = stories[mapIndex];
}

continueButton.addEventListener('click', () => {
    storyOverlay.classList.remove('active');
    gameLoop();
});

nextMapButton.addEventListener('click', () => {
    endOverlay.classList.remove('active');
    currentMap++;
    mapMenu.classList.add('active');
    setupMapOptions();
});

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') {
        player.startVulcanFire();
    }
});
document.addEventListener('keyup', (e) => keys[e.key] = false);

function gameLoop(timestamp) {
    if (menu.paused || levelUpMenu.classList.contains('active')) {
        requestAnimationFrame(gameLoop);
        return;
    }

    if (lastTimestamp) {
        const delta = timestamp - lastTimestamp;
        fpsHistory.push(1000 / delta);
        if (fpsHistory.length > 60) {
            fpsHistory.shift();
        }
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
        if (Math.abs(bullet.x - player.x) > canvas.width || Math.abs(bullet.y - player.y) > canvas.height) {
            bullets.splice(index, 1);
        }
    });

    enemies.forEach((enemy, index) => {
        enemy.update();
        bullets.forEach((bullet, bulletIndex) => {
            const distance = Math.sqrt((bullet.x - enemy.x) ** 2 + (bullet.y - enemy.y) ** 2);
            if (distance < bullet.radius + enemy.radius) {
                enemy.hp -= bullet.attack;
                bullets.splice(bulletIndex, 1);
                if (enemy.hp <= 0) {
                    enemies.splice(index, 1);
                    player.addScore(1);
                    createParticles(enemy.x, enemy.y, '#ff0000', 20);
                }
            }
        });
    });

    updateParticles(particles);

    timeElapsed += 1 / 60;
    if (timeElapsed >= 10) {
        timeElapsed = 0;
        spawnRate += 0.1;
    }

    if (Math.random() < spawnRate) {
        spawnEnemy();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const offsetX = player.x - canvas.width / 2;
    const offsetY = player.y - canvas.height / 2;

    generateTiles(tiles, offsetX, offsetY, tileSize, ctx);

    player.draw(offsetX, offsetY, ctx);
    bullets.forEach(bullet => bullet.draw(offsetX, offsetY, ctx));
    enemies.forEach(enemy => enemy.draw(offsetX, offsetY, ctx));
    drawParticles(particles, ctx);

    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${player.score}`, 10, 30);
    ctx.fillText(`Health: ${player.hp}/${player.maxHealth} ${player.upgradeHistory.health > 0 ? `(+${player.upgradeHistory.health})` : ''}`, 10, 60);
    ctx.fillText(`Bullet Attack: ${player.bulletAttack} ${player.upgradeHistory.bullet > 0 ? `(+${player.upgradeHistory.bullet})` : ''}`, 10, 90);
    if (player.hasVulcan) {
        ctx.fillText(`Vulcan Attack: ${player.vulcanAttack} ${player.upgradeHistory.vulcan > 0 ? `(+${player.upgradeHistory.vulcan})` : ''}`, 10, 120);
    }

    updateInventory();
}

function updateInventory() {
    for (let i = 0; i < 6; i++) {
        const slot = document.getElementById(`slot${i + 1}`);
        slot.textContent = player.inventory[i] ? player.inventory[i].name : '';
    }
}

function spawnEnemy() {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = 20;
    const speed = 2;
    const sprite = 'enemy.png';
    const hp = 10;
    enemies.push(new Enemy(x, y, radius, speed, sprite, hp));
}

function showMenu() {
    menu.show();
}

function showLevelUpMenu() {
    const options = getRandomOptions(player);
    levelUpOptions.innerHTML = '';
    options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option.name;
        button.addEventListener('click', () => {
            option.apply(player);
            levelUpMenu.classList.remove('active');
            menu.resumeGame();
        });
        levelUpOptions.appendChild(button);
    });
    levelUpMenu.classList.add('active');
    menu.pauseGame();
}

function checkLevelUp() {
    const thresholds = [10, 50, 100, 200, 500, 1000];
    if (thresholds.includes(player.score)) {
        showLevelUpMenu();
    }
}

export { updateInventory, checkLevelUp };
