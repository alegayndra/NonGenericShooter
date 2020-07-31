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

        this.timeToHeal = 0;
        this.healing = false;
        this.healingTime = 0;

        this.frameAnimation = 0;

        this.hit = false;
        this.damaged = false;
        this.timeHit = 0;
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

        this.timeToHeal += delta;

        if (!this.healing) {
            if (this.timeToHeal >= 5) {
                this.healing = true;
                this.timeToHeal = 0;
            }
        } else {

            if (this.health >= 5) {
                this.healing = false;
                this.healingTime = 0;
            } else {
                this.healingTime += delta;
                if (this.healingTime >= 1) {
                    this.healingTime -= 1;
                    hearts.push(document.getElementById(`heart${hearts.length + 1}`));
                    hearts[hearts.length-1].style.display = 'block';
                    this.health++;
                }
            }

        }
        if (this.hit) {
            hearts[hearts.length-1].style.display = 'none'
            hearts.pop()
            this.health--;
            this.hit = false;
            this.damaged = true;

            this.timeToHeal = 0;
            this.healing = 0;
            this.healingTime = 0;

            if (this.health <= 0) {
                actualScene.gameOver = true;
            }

        }

        if (this.damaged) {
            this.timeHit += delta;
            if (this.timeHit < 0.15) {
                this.controls.getCamera().rotation.z += Math.PI / 2 * delta;
            } else if (this.timeHit >= 0.3) {
                this.controls.getCamera().rotation.z = 0;
                this.damaged = false;
                this.timeHit = 0;
            } else if (this.timeHit >= 0.15) {
                this.controls.getCamera().rotation.z -= Math.PI / 2 * delta;
            }
        }

        this.controls.update(delta * 1000);

    }
}