class Player {
    constructor(mesh, gun, controls) {
        this.mesh = mesh;
        this.weapon = gun;
        this.controls = controls;
        this.raycaster = new THREE.Raycaster();

        this.weapon.mesh.position.x = 3;
        this.weapon.mesh.position.y = -3;
        this.weapon.mesh.position.z = -6;

        this.weapon.mesh.rotation.y = Math.PI / 2;

        this.controls.getCamera().add(this.weapon.mesh);
        this.controls.getCamera().add(this.mesh);

        this.raycaster.camera = controls.getCamera();

        this.flags = {
            shooting: false
        }

        this.frameAnimation = 0;

        this.hit = false;
        this.health = 5;
    }

    shoot(delta) {
        if (this.controls.getMouseClicked() && !this.flags.shooting) {
            this.flags.shooting = true;
            this.weapon.shoot(this.raycaster, this.controls);
        }

        if (this.flags.shooting) {

            this.frameAnimation += 20 * delta;
            this.weapon.mesh.rotation.x = this.frameAnimation;
            if (this.frameAnimation >= Math.PI * 2) {
                this.weapon.mesh.rotation.x = 0;
                this.frameAnimation = 0;
                this.flags.shooting = false;
            }
        }

        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.raycaster.camera);
    }

    update(delta) {
        
        this.shoot(delta);

        if (this.hit) {
            console.log('player hit');
            hearts[hearts.length-1].style.display = 'none'
            hearts.pop()
            this.health--;
            this.hit = false;
            if (this.health <= 0) {
                // actualScene.objectsToEliminate.push({obj: this, type: 'enemy'})
                actualScene.gameOver = true;
            }
        }

        this.controls.update(delta * 1000);

    }
}