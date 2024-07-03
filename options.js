class Option {
    constructor(name, apply) {
        this.name = name;
        this.apply = apply;
    }
}

const weapons = [
    new Weapon('gun', 1),
    new Weapon('vulcan', 1),
    new Weapon('sword', 1),
    new Weapon('rifle', 1),
    new Weapon('sniper gun', 1),
    new Weapon('bomb', 1),
    new Weapon('laser', 1),
    new Weapon('armor', 1),
    new Weapon('boots', 1),
    new Weapon('helmet', 1)
];

function getRandomOptions(player) {
    const options = [];
    const availableWeapons = weapons.filter(weapon => !player.inventory.some(item => item.name === weapon.name));
    const existingWeapons = player.inventory.slice();

    for (let i = 0; i < 3; i++) {
        const rand = Math.random();
        if (rand < 0.5 && availableWeapons.length > 0) {
            const weapon = availableWeapons.splice(Math.floor(Math.random() * availableWeapons.length), 1)[0];
            options.push(new Option(`Unlock ${weapon.name}`, (player) => player.addToInventory(new Weapon(weapon.name, weapon.level))));
        } else if (existingWeapons.length > 0) {
            const weapon = existingWeapons.splice(Math.floor(Math.random() * existingWeapons.length), 1)[0];
            options.push(new Option(`Upgrade ${weapon.name}`, (player) => player.upgradeWeapon(weapon.name)));
        }
    }

    return options;
}

export { getRandomOptions, weapons };
