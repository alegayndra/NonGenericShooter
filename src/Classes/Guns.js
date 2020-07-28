class Guns {
    constructor(mesh) {
        this.mesh = mesh;
    }

    shoot(raycaster, controls) {
        var shootVelo = 250;
        var ballShape = new CANNON.Sphere(0.5);
        var ballGeometry = new THREE.SphereGeometry(ballShape.radius, 32, 32);
        var shootDirection = raycaster.ray.direction;

        let material = new THREE.MeshPhongMaterial( { color: 0xffffff } );

        var x = controls.getObject().position.x;
        var y = controls.getObject().position.y;
        var z = controls.getObject().position.z;
        var ballBody = new CANNON.Body({ mass: 0.00000001 });
        ballBody.addShape(ballShape);
        var ballMesh = new THREE.Mesh( ballGeometry, material );
        let bullet = {
            mesh: ballMesh,
            cannonBody: ballBody
        }
        actualScene.addBullet(bullet);
        ballMesh.castShadow = true;
        ballMesh.receiveShadow = true;

        // getShootDir(shootDirection);
        ballBody.velocity.set(shootDirection.x * shootVelo, shootDirection.y * shootVelo, shootDirection.z * shootVelo);

        // Move the ball outside the player sphere
        let r = 15
        x += shootDirection.x * (r + ballShape.radius);
        y += shootDirection.y * (r + ballShape.radius);
        z += shootDirection.z * (r + ballShape.radius);
        ballBody.position.set(x,y,z);
        ballMesh.position.set(x,y,z);

        ballBody.addEventListener("collide",function(e){
            actualScene.objectsToEliminate.push({obj: bullet, type: 'bullet'});
        });
    }
}