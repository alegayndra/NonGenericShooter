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

        // this.raycaster.ray.origin.copy( this.controls.getObject().position );    
        // this.raycaster.ray.direction.x = this.controls.getObject().quaternion.x ;
        // this.raycaster.ray.origin.y -= 10;

        // let intersections = this.raycaster.intersectObjects( actualScene.ThreeScene.children );

        // var intersects = raycaster.intersectObjects( scene.children );

        // for ( var i = 0; i < intersections.length; i++ ) {
        //     intersections[ i ].object.material.color.set( 0xff0000 );
        // }

        // var projector = new THREE.Projector();
        // function getShootDir(targetVec){
        //     var vector = targetVec;
        //     targetVec.set(0,0,1);
        //     projector.unprojectVector(vector, camera);
        //     var ray = new THREE.Ray(sphereBody.position, vector.sub(sphereBody.position).normalize() );
        //     targetVec.copy(ray.direction);
        // }
    }

    update(delta) {
        
        this.shoot(delta);

        this.controls.update(delta * 1000);

    }
}