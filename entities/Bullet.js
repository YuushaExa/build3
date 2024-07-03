export default class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, damage) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setVelocityY(-300);
        this.damage = damage;
    }

    update() {
        if (this.y < 0) {
            this.destroy();
        }
    }
}
