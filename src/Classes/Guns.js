class Guns {
    constructor(mesh) {
        this.mesh = mesh;
    }

    shoot(raycaster, controls) {
        createBullet(250, raycaster.ray.direction, controls.getObject(), 15, 'player');
    }
}