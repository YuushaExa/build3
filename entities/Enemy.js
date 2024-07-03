export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, hp) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.hp = hp;
    }

    update() {
        this.scene.physics.moveToObject(this, this.scene.player, 100);
    }

    takeDamage(damage) {
        this.hp -= damage;
    }
}
