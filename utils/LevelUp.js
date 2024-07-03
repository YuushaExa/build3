function showLevelUpMenu(scene, options) {
    const menu = scene.add.rectangle(400, 300, 600, 400, 0x000000, 0.8);
    const option1 = scene.add.text(400, 200, options[0], { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive();
    const option2 = scene.add.text(400, 300, options[1], { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive();
    const option3 = scene.add.text(400, 400, options[2], { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive();

    option1.on('pointerdown', () => {
        handleOptionSelection(scene.player, options[0]);
        closeMenu();
    });
    option2.on('pointerdown', () => {
        handleOptionSelection(scene.player, options[1]);
        closeMenu();
    });
    option3.on('pointerdown', () => {
        handleOptionSelection(scene.player, options[2]);
        closeMenu();
    });

    function closeMenu() {
        menu.destroy();
        option1.destroy();
        option2.destroy();
        option3.destroy();
        scene.resumeGame();
    }
}

function getRandomOptions(player) {
    const options = ['Enhance Bullet Attack', 'Unlock Vulcan', 'Enhance Max Health'];
    const availableWeapons = ['gun', 'vulcan', 'sword', 'rifle', 'sniper gun', 'bomb', 'laser', 'armor', 'boots', 'helmet'];
    
    if (!player.hasVulcan) {
        options.push('Unlock Vulcan');
    }

    const upgrades = availableWeapons.filter(weapon => !player.inventory.some(item => item.name === weapon));

    for (const upgrade of upgrades) {
        options.push(`Unlock ${upgrade}`);
    }

    return Phaser.Utils.Array.Shuffle(options).slice(0, 3);
}

function handleOptionSelection(player, option) {
    if (option === 'Enhance Bullet Attack') {
        player.enhanceBulletAttack();
    } else if (option === 'Enhance Max Health') {
        player.enhanceMaxHealth();
    } else if (option.startsWith('Unlock')) {
        const weapon = option.split(' ')[1].toLowerCase();
        player.addToInventory({ name: weapon, level: 1 });
    }
}

export { showLevelUpMenu, getRandomOptions };
