
/*
    Crea una bala
    Entrada:
    - shootVelo:        Velocidad de la bala
    - shootDirection:   Dirección en la cual irá la bala
    - object:           Objeto del cual se sacara la rotación y la posición de la bala
    - r:                Radio a partir del objeto padre para que la bala se cree fuera del objeto y no colisione con el mismo
    - parent:           Tipo de objeto que es el padre
*/
function createBullet(shootVelo, shootDirection, object, r, parent) {

    // Cannon body
    let halfExtents = new CANNON.Vec3(0.35, 0.21, 0.21);
    let bulletShape = new CANNON.Box(halfExtents);
    let bulletBody = new CANNON.Body({ mass: 0.00000001 });
    bulletBody.addShape(bulletShape);

    let bullet = new Bullets(new THREE.Object3D(), bulletBody);

    bullet.copy(bulletMesh); // Copia el modelo de la bala
    bullet.mesh.castShadow = true;
    bullet.mesh.receiveShadow = true;

    // Rota la bala
    bulletBody.quaternion.copy(object.quaternion);
    bullet.mesh.applyQuaternion(object.quaternion);

    bulletBody.velocity.set(shootDirection.x * shootVelo, shootDirection.y * shootVelo, shootDirection.z * shootVelo);

    // Se posiciona a la bala fuera del cuerpo dado
    let x = object.position.x + shootDirection.x * (r + 0.5);
    let y = object.position.y + shootDirection.y * (r + 0.5);
    let z = object.position.z + shootDirection.z * (r + 0.5);
    bulletBody.position.set(x, y, z);
    bullet.mesh.position.set(x, y, z);

    // Agrega un event listener sobre el evento collide para saber si la bala colisionó con algo
    // Cuando colisiona se elimina la bala
    // Si choca con el jugador o con algun enemigo, se marca que este mismo fue golpeado
    bulletBody.addEventListener("collide", function (e) {
        actualScene.objectsToEliminate.push({ obj: bullet, type: 'bullet' });
        switch (parent) {
            case 'player':
                let cont = true;
                for (let i = 0; cont && i < actualScene.enemies.length; i++) {
                    if (actualScene.enemies[i].cannonBody.id == e.body.id) {
                        actualScene.enemies[i].hit = true;
                    }
                }
                break;
            case 'enemy':
                if (actualScene.player.controls.getCannonBody().id == e.body.id) {
                    actualScene.player.flags.hit = true;
                }

                break;
        }
    });

    actualScene.addBullet(bullet);

    return bullet;
}

/*
    Crea un arma
    Entrada:
    - mesh: Modelo del arma
*/
function createGun(mesh) {
    return new Guns(mesh);
}

/*
    Crea un enemigo
    Entrada:
    - type: Tipo del enemigo
*/
function createEnemy(type) {

    let enemyShape;
    let mass;

    let meshToCopy = enemiesMeshes.find((mesh) => mesh.type == type);

    switch (type) {
        case 'roller':
            mass = 1;
            let radius = 5
            enemyShape = new CANNON.Sphere(radius);
            break;
        case 'shooter':
            mass = 0
            let size = 4;
            let halfExtents = new CANNON.Vec3(size, size, size);
            enemyShape = new CANNON.Box(halfExtents);
            break;
    }

    let enemyBody = new CANNON.Body({ mass: mass });
    enemyBody.addShape(enemyShape);

    let enemy = new Enemy(new THREE.Object3D(), enemyBody, type);
    enemy.copy(meshToCopy.mesh); // Copia el modelo de la bala
    enemy.mesh.castShadow = true;
    enemy.mesh.receiveShadow = true;

    actualScene.addEnemy(enemy);

    return enemy;
}

/*
    Crea un jugador
    Entrada:
    - controls: Controles del jugador
*/
function createPlayer(controls) {
    // Crea un mesh para el jugador
    let size = 2;
    var halfExtents = new CANNON.Vec3(size, size, size);
    var boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
    let cubeMap = new THREE.TextureLoader().load(cubeUrl);
    let boxMaterial = new THREE.MeshPhongMaterial({ specular: 0xffffff, flatShading: true, map: cubeMap });
    let box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.castShadow = true;
    box.receiveShadow = true;

    let player = new Player(box, createGun(new THREE.Object3D()), controls);

    // Carga el modelo del arma
    loadGLTFModel('./models/gun.glb', player.weapon);

    return player;
}