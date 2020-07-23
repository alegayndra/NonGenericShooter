class Player {
    constructor(mesh, gun, camera, controls) {
        this.mesh = mesh;
        this.weapon = gun ;
        this.camera = camera;
        this.controls = controls;
        this.flags = {
            moveForward: false,
            moveBackward: false,
            moveLeft: false,
            moveRight: false,
            canJump: false,
            crouching: false,
            running: false,
            mousePressed: false,
            shooting: false,
            mouseClicked: false 
        }
        this.lastW = 0;
        this.frameAnimation = 0;

        this.weapon.position.x = 6;
        this.weapon.position.y = -3;
        this.weapon.position.z = -10;

        this.camera.add(this.weapon);
        this.camera.add(this.mesh);

        this.raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 15 );

        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();

        // this.mesh.position.y = 2;

        // window.onbeforeunload = function (e) {
        //     // Cancel the event
        //     e.preventDefault();
        
        //     // Chrome requires returnValue to be set
        //     // e.returnValue = 'Really want to quit the game?';
        // };

        this.controls.domElement.addEventListener( 'keydown', (event) => {
            // console.log(event.keyCode, event.key);
            switch ( event.keyCode ) {

                case 38: // up
                case 87: // w
                    if (!this.flags.moveForward) {
                        if (!this.flags.crouching && prevTime - this.lastW <= 200) this.flags.running = true;
                        this.lastW = prevTime; 
                    }
                    this.flags.moveForward = true;
                    break;
        
                case 37: // left
                case 65: // a
                    this.flags.moveLeft = true; 
                    break;
        
                case 40: // down
                case 83: // s
                    this.flags.moveBackward = true;
                    break;
        
                case 39: // right
                case 68: // d
                    this.flags.moveRight = true;
                    break;
        
                case 32: // space
                    if ( this.flags.canJump === true ) this.velocity.y += 180;
                    this.flags.canJump = false;
                    break;
                case 16:
                    event.preventDefault();
                    if (this.flags.canJump) {
                        this.flags.crouching = true;
                        this.flags.running = false;
                    }
                    break;
            }
        }, false );

        this.controls.domElement.addEventListener( 'keyup', (event) => {
            switch( event.keyCode ) {

                case 38: // up
                case 87: // w
                    this.flags.running = false;
                    this.flags.moveForward = false;
                    break;
        
                case 37: // left
                case 65: // a
                    this.flags.moveLeft = false;
                    break;
        
                case 40: // down
                case 83: // s
                    this.flags.moveBackward = false;
                    break;
        
                case 39: // right
                case 68: // d
                    this.flags.moveRight = false;
                    break;
                case 16:
                    this.flags.crouching = false;
                    break;
            }
        }, false );

        this.controls.domElement.addEventListener('mousedown', (event) => {
            this.flags.mouseClicked = true;
        });

        this.controls.domElement.addEventListener('mouseup', (event) => {
            this.flags.mouseClicked = false;
        });
    }


    update(delta, scene) {
        // console.log('update not defined', delta);
        if ( this.controls.isLocked === true ) {

            // console.log("posicion: ",      this.controls.getObject().position);
            // console.log("posicion rayo: ", this.raycaster.ray.origin);
    
            // collisions
            this.raycaster.ray.origin.copy( this.controls.getObject().position );
            this.raycaster.ray.origin.y -= 10;
    
            let intersections = this.raycaster.intersectObjects( scene.children );
            let onObject = intersections.length > 0;
    
            // velocity
            this.velocity.x -= this.velocity.x * 10.0 * delta;
            this.velocity.z -= this.velocity.z * 10.0 * delta;
            this.velocity.y -= 9.8 * 50.0 * delta; // 100.0 = mass
    
            // direction
            this.direction.z = Number( this.flags.moveForward ) - Number( this.flags.moveBackward );
            this.direction.x = Number( this.flags.moveRight ) - Number( this.flags.moveLeft );
    
            this.direction.normalize(); // this ensures consistent movements in all directions
            if ( this.flags.moveForward || this.flags.moveBackward ) this.velocity.z -= this.direction.z * 400.0 * delta;
            if ( this.flags.moveLeft || this.flags.moveRight ) this.velocity.x -= this.direction.x * 400.0 * delta;
            if ( onObject === true ) {
                this.velocity.y = Math.max( 0, this.velocity.y );
                this.flags.canJump = true;
            }
    
            this.controls.moveRight( - this.velocity.x * delta * ((this.flags.crouching) ? 0.5 : ((this.flags.running) ? 2 : 1)) );
            this.controls.moveForward( - this.velocity.z * delta * ((this.flags.crouching) ? 0.5 : ((this.flags.running) ? 2 : 1)) );
            this.controls.getObject().position.y += ( this.velocity.y * delta ); // new behavior
    
            if ( this.controls.getObject().position.y < 10 ) {
                this.velocity.y = 0;
                this.controls.getObject().position.y = 10 - ((this.flags.crouching) ? 4 : 0);
                this.flags.canJump = true;
            }

            if (this.flags.mouseClicked && !this.flags.shooting) {
                this.flags.shooting = true;
            }

            if (this.flags.shooting) {
                this.frameAnimation += 12 * delta;
                this.weapon.rotation.x = this.frameAnimation;
                if (this.frameAnimation >= Math.PI * 2) {
                    this.weapon.rotation.x = 0;
                    this.frameAnimation = 0;
                    this.flags.shooting = false;
                }
            }
        }

    }

    animate() {
        console.log('animate not defined', delta);
    }
}