class Enemy extends Entity {
    constructor(mesh, cannonBody, type) {
        super(mesh, cannonBody);

        this.type = type;

        this.velocity = 0.5;

        this.dir = {
            x: 0,
            z: 0,
        }

        this.hit = false;
        this.health = 3;

        this.timeElapsed = 0;
        this.direction = new THREE.Ray();
        this.direction.origin.set(cannonBody.position.x, cannonBody.position.y, cannonBody.position.z);
        
        if (type == 'roller') {
            cannonBody.addEventListener("collide",function(e){
                if (actualScene.player.controls.getCannonBody().id == e.body.id) {
                    actualScene.player.flags.hit = true;
                }
            });
        }

        this.meshMaterial = {
            r: 0,
            g: 0,
            b: 0
        };
        this.modelLoaded = false;

        this.timeHit = 0;
        this.damaged = false;
    }

    shootPlayer() {
        createBullet(100, this.direction.direction, this.mesh, this.cannonBody.boundingRadius + 1, 'enemy');
    }

    followPlayer(delta) {
        let factorX = (actualScene.player.controls.getObject().position.x - this.cannonBody.position.x);
        let factorZ = (actualScene.player.controls.getObject().position.z - this.cannonBody.position.z);
        this.cannonBody.velocity.x += this.velocity * delta * factorX; 
        this.cannonBody.velocity.z += this.velocity * delta * factorZ;
    }

    updateDirection() {
        this.direction.lookAt(actualScene.player.controls.getObject().position);
        this.mesh.lookAt(actualScene.player.controls.getObject().position);

        this.cannonBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), this.mesh.rotation.x);
        this.cannonBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), this.mesh.rotation.y);
        this.cannonBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,0,1), this.mesh.rotation.z);
    }

    rotate(delta) {
        this.mesh.rotation.x += this.cannonBody.velocity.z * delta * 0.2;
        this.mesh.rotation.z += this.cannonBody.velocity.x * delta * 0.2;
    }

    update(delta) {
        this.timeElapsed += delta;

        if (!this.modelLoaded && this.mesh.children) {
            this.meshMaterial = {
                r: this.mesh.children[0].material.color.r,
                g: this.mesh.children[0].material.color.g,
                b: this.mesh.children[0].material.color.b
            };
            this.modelLoaded = true;
        }

        switch(this.type) {
            case 'roller':
                this.rotate(delta);
                this.followPlayer(delta);
                break;
            case 'shooter':
                this.updateDirection();
                let time = 1;
                if (this.timeElapsed >= time) {
                    this.timeElapsed -= time;
                    this.shootPlayer();
                }
        }
        
        if (this.hit) {
            // console.log('enemy hit');
            this.health--;
            this.hit = false;
            this.damaged = true;
            score += Math.ceil(Math.random() * 3);
            if (this.health <= 0) {
                actualScene.objectsToEliminate.push({obj: this, type: 'enemy'});
                score += 10;
            }
            this.mesh.children[0].material.color.g = 1;
        }

        if (this.damaged) {
            this.timeHit += delta;
            if (this.timeHit >= 0.3) {
                this.damaged = false;
                this.timeHit = 0;
                this.mesh.children[0].material.color.g = this.meshMaterial.g;
            }
        }
    }
}