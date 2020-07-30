class Bullets extends Entity {
    constructor(mesh, cannonBody) {
        super(mesh, cannonBody);
    }

    copy(bullet) {
        this.mesh.copy(bullet.mesh);
        // bullet.cannonBody = this.cannonBody;
    }

    update(delta) {
        this.cannonBody.velocity.y += 50 * delta;
    }
}