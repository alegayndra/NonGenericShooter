class Player {
    constructor(mesh, gun, controls) {
        this.mesh = mesh;
        this.weapon = gun;
        this.controls = controls;
        this.raycaster = new THREE.Raycaster();

        this.weapon.mesh.position.x = 4;
        this.weapon.mesh.position.y = -3;
        this.weapon.mesh.position.z = -4;

        this.controls.getCamera().add(this.weapon.mesh);
        this.controls.getCamera().add(this.mesh);

        this.raycaster.camera = controls.getCamera();

        this.flags = {
            shooting: false
        }

        this.frameAnimation = 0;


        // this.raycaster = new THREE.Raycaster();//THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 15 );
        // console.log(this.ray);

        // this.flags = {
        //     moveForward: false,
        //     moveBackward: false,
        //     moveLeft: false,
        //     moveRight: false,
        //     canJump: false,
        //     crouching: false,
        //     running: false,
        //     mousePressed: false,
        //     shooting: false,
        //     mouseClicked: false 
        // }
        // this.lastW = 0;
        // this.frameAnimation = 0;
        // this.lastPosition = new THREE.Vector3(this.camera.x, this.camera.y, this.camera.z);        

        // this.raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 15 );

        // this.controls.domElement.addEventListener( 'keydown', (event) => {
        //     // console.log(event.keyCode, event.key);
        //     switch ( event.keyCode ) {

        //         case 38: // up
        //         case 87: // w
        //             if (!this.flags.moveForward) {
        //                 if (!this.flags.crouching && prevTime - this.lastW <= 200) this.flags.running = true;
        //                 this.lastW = prevTime; 
        //             }
        //             this.flags.moveForward = true;
        //             break;
        
        //         case 37: // left
        //         case 65: // a
        //             this.flags.moveLeft = true; 
        //             break;
        
        //         case 40: // down
        //         case 83: // s
        //             this.flags.moveBackward = true;
        //             break;
        
        //         case 39: // right
        //         case 68: // d
        //             this.flags.moveRight = true;
        //             break;
        
        //         case 32: // space
        //             if ( this.flags.canJump === true ) this.velocity.y += 180;
        //             this.flags.canJump = false;
        //             break;
        //         case 16:
        //             event.preventDefault();
        //             if (this.flags.canJump) {
        //                 this.flags.crouching = true;
        //                 this.flags.running = false;
        //             }
        //             break;
        //     }
        // }, false );

        // this.controls.domElement.addEventListener( 'keyup', (event) => {
        //     switch( event.keyCode ) {

        //         case 38: // up
        //         case 87: // w
        //             this.flags.running = false;
        //             this.flags.moveForward = false;
        //             break;
        
        //         case 37: // left
        //         case 65: // a
        //             this.flags.moveLeft = false;
        //             break;
        
        //         case 40: // down
        //         case 83: // s
        //             this.flags.moveBackward = false;
        //             break;
        
        //         case 39: // right
        //         case 68: // d
        //             this.flags.moveRight = false;
        //             break;
        //         case 16:
        //             this.flags.crouching = false;
        //             break;
        //     }
        // }, false );
    }

    shoot(delta) {
        if (this.controls.getMouseClicked() && !this.flags.shooting) {
            this.flags.shooting = true;
            this.weapon.shoot(this.raycaster, this.controls);
        }

        if (this.flags.shooting) {

            this.frameAnimation += 12 * delta;
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