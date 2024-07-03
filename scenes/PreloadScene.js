export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        this.load.image('player', 'assets/player.png');
        this.load.image('enemy', 'assets/enemy.png');
        this.load.image('bullet', 'assets/bullet.png');
        this.load.image('vulcan', 'assets/vulcan.png');
        // Load other assets like weapons, backgrounds, etc.
    }

    create() {
        this.scene.start('MenuScene');
    }
}
