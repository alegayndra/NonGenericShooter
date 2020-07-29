class Guns {
    constructor(mesh) {
        this.mesh = mesh;
    }

    shoot(raycaster, controls) {

        let shootVelo = 250;
        let shootDirection = raycaster.ray.direction;
    
        let size = 1;
        let halfExtents = new CANNON.Vec3(size / 2, size / 2, size);

        let bulletShape = new CANNON.Box(halfExtents);
        let bulletBody = new CANNON.Body({ mass: 0.00000001 });
        bulletBody.addShape(bulletShape);
        
        
        let bulletGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
        let material = new THREE.MeshPhongMaterial( { color: 0xffffff } );
        let bulletMesh = new THREE.Mesh( bulletGeometry, material );
        
        bulletMesh.castShadow = true;
        bulletMesh.receiveShadow = true;        

        bulletBody.quaternion.copy(controls.getObject().quaternion);
        bulletMesh.applyQuaternion(controls.getObject().quaternion);

        // getShootDir(shootDirection);
        bulletBody.velocity.set(shootDirection.x * shootVelo, shootDirection.y * shootVelo, shootDirection.z * shootVelo);

        // Move the ball outside the player sphere
        let r = 15
        let x = controls.getObject().position.x + shootDirection.x * (r);
        let y = controls.getObject().position.y + shootDirection.y * (r);
        let z = controls.getObject().position.z + shootDirection.z * (r);
        bulletBody.position.set(x, y, z);
        bulletMesh.position.set(x, y, z);

        bulletBody.addEventListener("collide",function(e){
            actualScene.objectsToEliminate.push({obj: bullet, type: 'bullet'});
        });

        let bullet = new Bullets(bulletMesh, bulletBody);
        actualScene.addBullet(bullet);
    }
}