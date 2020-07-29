class Enemy extends Entity {
    constructor(mesh, cannonBody, type) {
        super(mesh, cannonBody);

        this.type = type;

        this.timeElapsed = 0;
        this.direction = new THREE.Ray();
        this.direction.origin.set(cannonBody.position.x, cannonBody.position.y, cannonBody.position.z);
    }

    shootPlayer() {
        createBullet(100, this.direction.direction, this.mesh, this.cannonBody.boundingRadius + 1);
    }

    followPlayer() {

    }

    updateDirection() {
        this.direction.lookAt(actualScene.player.controls.getObject().position);
        this.mesh.lookAt(actualScene.player.controls.getObject().position);

        this.cannonBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), this.mesh.rotation.x);
        this.cannonBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), this.mesh.rotation.y);
        this.cannonBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,0,1), this.mesh.rotation.z);
    }

    update(delta) {
        this.timeElapsed += delta;
        this.updateDirection();
        let time = 1;
        if (this.timeElapsed >= time) {
            this.timeElapsed -= time;
            switch(this.type) {
                case 'roller':
                    this.followPlayer();
                    break;
                case 'shooter':
                    this.shootPlayer();
            }
        }
    }
}