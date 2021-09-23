let camera, renderer, controls;
let actualScene, gameScenes = [];

let blocker, instructions, aimReticle, titleScreen, clickMe, gameOver, scoreDOM, finishLevel, hearts = [];

let prevTime = performance.now();

let cubeUrl = "./images/wooden_crate_2.png";
let bulletUrl = './models/bullet.glb';
let chestURl = "./images/minecra.png";
let futuristicCubeUrl = './images/futuristicCubes.png'
let floorUrl = './images/floor.png';
let bumpUrl = './images/bumpCube.png';

let bulletMesh = null;

let score = 0;

let restartGame = false;

/*
    Carga un modelo en formato GLTF
    Entrada:
    - path: Dirección al archivo
    - obj:  Objeto al cual se le cargará el modelo
*/
function loadGLTFModel(path, obj) {
    // Instantiate a loader
    var loader = new THREE.GLTFLoader();

    // Load a glTF resource
    loader.load(
        // resource URL
        path,
        // called when the resource is loaded
        function (gltf) {
            // Agrega todos los hijos del modelo al objeto
            let num = gltf.scene.children.length;
            for (let i = 0; i < num; i++) {
                gltf.scene.children[0].castShadow = true;
                gltf.scene.children[0].receiveShadow = true;
                obj.mesh.add(gltf.scene.children[0]);
            }
        },
        // called while loading is progressing
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        // called when loading has errors
        (error) => {
            console.log( 'An error happened', error );
        }
    );
}

/*
    Quita los elementos de la pantalla principal y empieza a mostrar el hud del juego
*/
function removeMainScreen(element) {
    titleScreen.style.display = 'none';
    clickMe.style.display = 'none';
    instructions.style.display = 'none';
    finishLevel.style.display = 'none'; 

    // Ask the browser to lock the pointer
    element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

    if (/Firefox/i.test(navigator.userAgent)) {
        var fullscreenchange = function (event) {
            if (document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element) {
                document.removeEventListener('fullscreenchange', fullscreenchange);
                document.removeEventListener('mozfullscreenchange', fullscreenchange);
                element.requestPointerLock();
            }
        }

        document.addEventListener('fullscreenchange', fullscreenchange, false);
        document.addEventListener('mozfullscreenchange', fullscreenchange, false);
        element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
        element.requestFullscreen();

    } else {
        element.requestPointerLock();
    }
}

/*
    Crea los controles del jugador e inicializa todas las variables referentes al GUI
*/
function initPointerLock() {
    blocker = document.getElementById('blocker');
    instructions = document.getElementById('instructions');
    aimReticle = document.getElementById('aimReticle');
    titleScreen = document.getElementById('titleScreen');
    clickMe = document.getElementById('clickMe');
    gameOver = document.getElementById('gameOver');
    scoreDOM = document.getElementById('score');
    finishLevel = document.getElementById('finishLevel');
    for (let i = 1; i <= 5; i++) {
        hearts.push(document.getElementById(`heart${i}`));
    }
    var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

    if (havePointerLock) {

        var element = document.body;

        var pointerlockchange = function (event) {
            if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
                controls.enabled = true;
                blocker.style.display = 'none';
                actualScene.paused = false;
                aimReticle.style.display = 'block';
                for (heart of hearts) {
                    heart.style.display = 'block';
                }
            } else {
                controls.enabled = false;
                blocker.style.display = '-webkit-box';
                blocker.style.display = '-moz-box';
                blocker.style.display = 'box';
                instructions.style.display = '';
                actualScene.paused = true;
                aimReticle.style.display = 'none';
                for (heart of hearts) {
                    heart.style.display = 'none';
                }
            }
        }

        var pointerlockerror = function (event) {
            instructions.style.display = '';
        }

        // Hook pointer lock state change events
        document.addEventListener('pointerlockchange', pointerlockchange, false);
        document.addEventListener('mozpointerlockchange', pointerlockchange, false);
        document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

        document.addEventListener('pointerlockerror', pointerlockerror, false);
        document.addEventListener('mozpointerlockerror', pointerlockerror, false);
        document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

        instructions.addEventListener('click', function (event) {
            removeMainScreen(element);
        }, false);
        titleScreen.addEventListener('click', function (event) {
            removeMainScreen(element);
        }, false);
        clickMe.addEventListener('click', function (event) {
            removeMainScreen(element);
        }, false);

    } else {
        instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
    }

    // Crea un cannon body, el cual será del jugador
    let mass = 10, radius = 10;
    let boxShape = new CANNON.Sphere(radius);
    conBody = new CANNON.Body({ mass: mass });
    conBody.addShape(boxShape);
    conBody.position.set(0, 5, 0);
    conBody.linearDamping = 0.9;
    conBody.position.y = 3;
    actualScene.CannonWorld.addBody(conBody);
    controls = new PointerLockControls(camera, conBody);

    return controls;
}

/*
    Carga el modelo de las balas
*/
function loadBulletModel() {
    let size = 1;
    let halfExtents = new CANNON.Vec3(size / 2, size / 2, size);

    let bulletShape = new CANNON.Box(halfExtents);
    let bulletBody = new CANNON.Body({ mass: 0 });
    bulletBody.addShape(bulletShape);

    bulletMesh = new Bullets(new THREE.Object3D(), bulletBody);

    let pos = 30;
    bulletMesh.mesh.position.z = pos;
    bulletBody.position.z = pos;
    bulletMesh.mesh.castShadow = true;
    bulletMesh.mesh.receiveShadow = true;

    loadGLTFModel(bulletUrl, bulletMesh);

    bulletMesh.mesh.rotation.y = Math.PI / 2;
}

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
    Crea una escena del juego
*/
function createGameScene() {
    let scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    scene.fog = new THREE.Fog(0xffffff, 0, 900);
    let gameScene = new GameScene(scene, initCannon(), 'prueba');
    return gameScene;
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
    let modelUrl;

    switch (type) {
        case 'roller':
            mass = 1;
            modelUrl = './models/roller.glb';
            let radius = 5
            enemyShape = new CANNON.Sphere(radius);
            break;
        case 'shooter':
            mass = 0
            modelUrl = './models/shooter.glb';
            let size = 4;
            let halfExtents = new CANNON.Vec3(size, size, size);
            enemyShape = new CANNON.Box(halfExtents);
            break;
    }

    let enemyBody = new CANNON.Body({ mass: mass });
    enemyBody.addShape(enemyShape);

    let enemy = new Enemy(new THREE.Object3D(), enemyBody, type);
    loadGLTFModel(modelUrl, enemy);
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

/*
    Crea un cofre de loot
    Entrada:
    - size: Tamaño del cofre,
    - x: Posicion en x del cofre
    - y: Posicion en y del cofre
    - z: Posicion en z del cofre
*/
function createLootChest(size, x, y, z) {
    let sizeBox = size;
    let boxGeometry = new THREE.BoxGeometry(sizeBox, sizeBox, sizeBox);
    let chestMap = new THREE.TextureLoader().load(chestURl);
    let cubeMap = new THREE.TextureLoader().load(cubeUrl);
    let boxMaterial = [
        new THREE.MeshPhongMaterial({ specular: 0xffffff, flatShading: true, map: chestMap }),
        new THREE.MeshPhongMaterial({ specular: 0xffffff, flatShading: true, map: cubeMap }),
        new THREE.MeshPhongMaterial({ specular: 0xffffff, flatShading: true, map: chestMap }),
        new THREE.MeshPhongMaterial({ specular: 0xffffff, flatShading: true, map: cubeMap }),
        new THREE.MeshPhongMaterial({ specular: 0xffffff, flatShading: true, map: chestMap }),
        new THREE.MeshPhongMaterial({ specular: 0xffffff, flatShading: true, map: chestMap })
    ];
    let box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.z = z;
    box.position.x = y;
    box.position.y = x;

    let lootChest = new Loot(box, 100);
    return lootChest;
}

let SHADOW_MAP_WIDTH = 512;
let SHADOW_MAP_HEIGHT = 512;


/*
    Crea un spotlight de ThreeJS
    Entrada:
    - color: Color de la luz
    - pos:   Posición de la luz dentro de la escena
    - taget: Posición a la cual apuntará la luz
*/
function createSpotLight(color, pos, target) {
    light = new THREE.SpotLight( color, 1, 350);
    light.position.set( pos.x, pos.y, pos.z );
    light.target.position.set( target.x, target.y, target.z );
    
    // Activa las sombras
    light.castShadow = true;
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 200;
    light.shadow.camera.fov = 45;
    light.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    light.shadow.mapSize.height = SHADOW_MAP_HEIGHT;
    
    actualScene.addLight( light );
    actualScene.addLight( light.target );

    // var spotLightHelper = new THREE.SpotLightHelper( light );
    // actualScene.addLight( spotLightHelper );
}

/*
    Crea 4 cajas dentro de un cuarto
    Entrada:
    - size: Tamaño del cuarto
    - pos:  Posición del cuarto dentro de la escena
*/
function createBoxes(size, pos) {
    // Carga las texturas
    let cubeMap = new THREE.TextureLoader().load(futuristicCubeUrl);
    let bumpMap = new THREE.TextureLoader().load(bumpUrl);
    let material = new THREE.MeshPhongMaterial( { specular: 0xffffff, flatShading: true, map: cubeMap, bumpMap: bumpMap });

    // Crea la figura de la caja
    let boxSize = 6;
    let halfExtents = new CANNON.Vec3(boxSize, boxSize, boxSize);
    let boxShape = new CANNON.Box(halfExtents);
    let boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
    let y = 1 + boxSize + pos.y;
    
    // Posiciones en las que se crearan las cajas
    let spawns = [
        {
            x: pos.x + size / 4,
            z: pos.z
        },
        {
            x: pos.x - size / 4,
            z: pos.z
        },
        {
            x: pos.x,
            z: pos.z + size / 4
        },
        {
            x: pos.x,
            z: pos.z - size / 4
        },
    ];

    // Crea las 4 cajas
    for(var i = 0; i < 4; i++){
        let x = spawns[i].x;
        let z = spawns[i].z;
        let boxBody = new CANNON.Body({ mass: 1 });
        boxBody.addShape(boxShape);
        let boxMesh = new THREE.Mesh( boxGeometry, material );
        let obj = new Entity(boxMesh, boxBody);
        actualScene.addEnvironment(obj, true);
        boxBody.position.set(x, y, z);
        boxMesh.position.set(x, y, z);
        boxMesh.castShadow = true;
        boxMesh.receiveShadow = true;
    }
}

/*
    Genera enemigos dentro de un cuarto
*/
function spawnEnemies(size, pos) {
    // Posiciones en las que se crearan los enemigos
    let spawns = [
        {
            x: pos.x + size / 4,
            z: pos.z + size / 4,
            type: 'shooter'
        },
        {
            x: pos.x - size / 4,
            z: pos.z + size / 4,
            type: 'roller'
        },
        {
            x: pos.x + size / 4,
            z: pos.z - size / 4,
            type: 'shooter'
        },
        {
            x: pos.x - size / 4,
            z: pos.z - size / 4,
            type: 'roller'
        },
    ];

    let y = pos.y + 15;

    // Genera los enemigos
    for (let i = 0; i < 4; i++) {
        let num = 1;
        // if (spawns[i].type == 'roller') num = 4;
        for (let j = 0; j < num; j++) {
            let enem = createEnemy(spawns[i].type);
    
            let x = spawns[i].x;
            let z = spawns[i].z;
            enem.cannonBody.position.set(x, y, z);
            enem.mesh.position.set(x, y, z);
        }
    }
}

/*
    Crea un cuarto
    Entrada:
    - size:     Tamaño del cuarto en cuanto a largo y anchura
    - height:   Altura del cuarto
    - pos:      Posición del cuarto dentro de la escena
    - sides:    Lados del cuarto que se crearan
*/
function createRoom(size, height, pos, sides) {
    // Carga las texturas
    let cubeMap = new THREE.TextureLoader().load(floorUrl);
    let bumpMap = new THREE.TextureLoader().load(bumpUrl);
    let material = new THREE.MeshPhongMaterial( { specular: 0xffffff, flatShading: true, map: cubeMap, bumpMap: bumpMap });

    let half = size / 2;

    // Crea arreglos con los tamaños de las paredes
    let halfExtents = {
        bottom: new CANNON.Vec3(half, 1, half),
        sides: new CANNON.Vec3(1, height / 2, half),
        front: new CANNON.Vec3(half, height / 2, 1)
    }

    // Crea las figuras de las paredes de CannonJS
    let boxShapes = {
        bottom: new CANNON.Box(halfExtents.bottom),
        sides: new CANNON.Box(halfExtents.sides),
        front: new CANNON.Box(halfExtents.front)
    }

    // Crea las geometrías de las paredes de ThreeJS
    let boxGeometries = {
        bottom: new THREE.BoxGeometry(halfExtents.bottom.x * 2, 2, halfExtents.bottom.z * 2),
        sides: new THREE.BoxGeometry(2, halfExtents.sides.y * 2, halfExtents.sides.z * 2),
        front: new THREE.BoxGeometry(halfExtents.front.x * 2, halfExtents.front.y * 2, 2)
    }

    let keys = ['floor', 'ceiling', 'front', 'back', 'right', 'left'];

    let boxBodies = {};

    // Crea los cuerpos de CannonJS de las paredes
    for (let i = 0; i < keys.length; i++) {
        boxBodies[keys[i]] = new CANNON.Body({ mass: 0.0 });
    }

    // Crea los meshes de ThreeJS de las paredes
    let boxMeshes = {
        floor:   new THREE.Mesh(boxGeometries.bottom, material),
        ceiling: new THREE.Mesh(boxGeometries.bottom, material),
        front:   new THREE.Mesh(boxGeometries.front,  material),
        back:    new THREE.Mesh(boxGeometries.front,  material),
        right:   new THREE.Mesh(boxGeometries.sides,  material),
        left:    new THREE.Mesh(boxGeometries.sides,  material)
    }

    let x = pos.x;
    let y = pos.y;
    let z = pos.z;

    boxBodies.floor.addShape(boxShapes.bottom);
    boxBodies.floor.position.set(x, y, z);
    boxMeshes.floor.position.set(x, y, z);

    y = height + pos.y;

    boxBodies.ceiling.addShape(boxShapes.bottom);
    boxBodies.ceiling.position.set(x, y, z);
    boxMeshes.ceiling.position.set(x, y, z);
    
    y =( height / 2) + pos.y;

    if (sides.front) {
        boxBodies.front.addShape(boxShapes.front);

        x = pos.x;
        z = half + pos.z;

        boxBodies.front.position.set(x, y, z);
        boxMeshes.front.position.set(x, y, z);
    }

    if (sides.back) {
        boxBodies.back.addShape(boxShapes.front);

        x = pos.x;
        z = -half + pos.z;

        boxBodies.back.position.set(x, y, z);
        boxMeshes.back.position.set(x, y, z);
    }

    if (sides.right) {
        boxBodies.right.addShape(boxShapes.sides);

        x = -half + pos.x;
        z = pos.z;

        boxBodies.right.position.set(x, y, z);
        boxMeshes.right.position.set(x, y, z);
    }

    if (sides.left) {
        boxBodies.left.addShape(boxShapes.sides);

        x = half + pos.x;
        z = pos.z;

        boxBodies.left.position.set(x, y, z);
        boxMeshes.left.position.set(x, y, z);
    }

    // Agrega las paredes a la escena
    keys.forEach(key => {
        if (key === 'floor' || key === 'ceiling' || sides[key]) {
            boxMeshes[key].castShadow = true;
            boxMeshes[key].receiveShadow = true;
            let ent = new Entity(boxMeshes[key], boxBodies[key]);
            actualScene.addEnvironment(ent, false);
        }
    });

    createBoxes(size, pos);
    spawnEnemies(size, pos);

    let quarter = size / 4;

    // Crea una luz en una posición aletoria dentro del cuarto
    let num = Math.ceil(Math.random() * 4);
    switch(num) {
        case 1:
            createSpotLight(0xffffff, {x: pos.x + quarter, y: height - 1, z: pos.z + quarter}, {x: pos.x + quarter, y: pos.y, z: pos.z + quarter});
            break;
        case 2:
            createSpotLight(0xffffff, {x: pos.x - quarter, y: height - 1, z: pos.z + quarter}, {x: pos.x - quarter, y: pos.y, z: pos.z + quarter});
            break;
        case 3:
            createSpotLight(0xffffff, {x: pos.x + quarter, y: height - 1, z: pos.z - quarter}, {x: pos.x + quarter, y: pos.y, z: pos.z - quarter});
            break;
        case 4:
            createSpotLight(0xffffff, {x: pos.x - quarter, y: height - 1, z: pos.z - quarter}, {x: pos.x - quarter, y: pos.y, z: pos.z - quarter});
            break;
    }
}

/*
    Genera un nivel
*/
function generateDungeon() {
    // Banderas que determinan que paredes dentro del cuarto se crearan
    let sides = {
        front: true,
        back:  true,
        right: true,
        left:  true
    }

    let size = 300;
    let height = 70;
    let origin = {
        x: 0, 
        y: 0, 
        z: 0
    }

    // Posiciona al jugador en el primer cuarto
    actualScene.player.controls.getCannonBody().position.set(origin.x, origin.y + height / 2, origin.z);

    let cantRooms = 4;  // Cantidad de cuartos que se crearan
    let lastKey;        // Pared que abre al cuarto anterior
    let currentKey;     // Pared que se abrirá para el siguiente cuarto

    for (let i = 0; i < cantRooms; i++) {
        let offset;
        let valid = false;
        
        // Checa que se haya escogido una pared valida (aka que no se haya escogido la pared que ya está abierta)
        while (!valid) {
            offset = {
                x: 0,
                z: 0
            };
            let num = Math.round(Math.random() * 4);
            switch(num) {
                case 0: // front
                    currentKey = 'front';
                    offset.z = size;
                    break;
                case 1: // back
                    currentKey = 'back';
                    offset.z = -size;
                    break;
                case 2: // left
                    currentKey = 'left';
                    offset.x = size;
                    break;
                case 3: // right
                    currentKey = 'right';
                    offset.x = -size;
                    break;
            }
            if (currentKey !== lastKey) valid = true;
        }
    
        // Checa si ya está en el último cuarto para no abrir una nueva pared para un nuevo cuarto inexistente
        if (i < cantRooms - 1) {
            sides[currentKey] = false;
        }

        createRoom(size, height, origin, sides);

        origin.x += offset.x;
        origin.z += offset.z;

        // Cierra la pared abierta para el cuarto anterior y se abre la que apuntaría al cuarto actual
        // Por ejemplo, si el segundo cuarto estaba a la derecha del primero, la pared que tiene abierta es la de la izquierda
        // Luego, abre la pared de atrás. Lo que sucede aquí es que se marca que abrá pared izquierda,
        // pared de atrás y que no abrá pared de en frente
        if (lastKey) sides[lastKey] = true;
        sides[currentKey] = true;
        switch(currentKey) {
            case 'front':
                lastKey = 'back';
                break;
            case 'back':
                lastKey = 'front';
                break;
            case 'left':
                lastKey = 'right';
                break;
            case 'right':
                lastKey = 'left';
                break;
        }
        sides[lastKey] = false;
    }
}

/*
    Se crea un mundo de CannonJS
*/
function initCannon() {
    // Setup our world
    let world = new CANNON.World();
    world.quatNormalizeSkip = 0;
    world.quatNormalizeFast = false;

    var solver = new CANNON.GSSolver();

    world.defaultContactMaterial.contactEquationStiffness = 1e9;
    world.defaultContactMaterial.contactEquationRelaxation = 4;

    solver.iterations = 7;
    solver.tolerance = 0.1;
    var split = true;
    if (split)
        world.solver = new CANNON.SplitSolver(solver);
    else
        world.solver = solver;

    world.gravity.set(0, -90, 0);
    world.broadphase = new CANNON.NaiveBroadphase();

    // Create a slippery material (friction coefficient = 0.0)
    physicsMaterial = new CANNON.Material("slipperyMaterial");
    var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial,
        physicsMaterial,
        -0.0, // friction coefficient
        0.3  // restitution
    );
    // We must add the contact materials to the world
    world.addContactMaterial(physicsContactMaterial);

    return world;
}

/*
    Inicializa todo el juego
    Entrada:
    - canvas: Canvas de HTML en el cual se estará dibujando
*/
function createScene(canvas) {
    initCannon();
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    window.addEventListener('resize', onWindowResize, false);

    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 1000);

    let scene = createGameScene();
    gameScenes.push(scene);
    actualScene = gameScenes[0];

    loadBulletModel();

    // Luz ambiental para que se vean cosas fuera de las spotlights
    let light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.4 );
    light.position.set( 0.5, 1, 0.75 );
    actualScene.addLight( light );
    
    let controls = initPointerLock();
    let player = createPlayer(controls);
    actualScene.addPlayer(player);

    generateDungeon(); 
}

/*
    Resetea la escena
*/
function resetGame() {
    // Resetea la información de la escena del juego
    actualScene.restartScene();
    actualScene.addPlayer(actualScene.player);
    actualScene.CannonWorld.addBody(actualScene.player.controls.getCannonBody());
    actualScene.levelFinished = false;

    // Resetea la vida del jugador
    while(actualScene.player.health < 5) {
        hearts.push(document.getElementById(`heart${hearts.length + 1}`));
        hearts[hearts.length-1].style.display = 'block';
        actualScene.player.health++;
    }

    // Vuelve a crear la luz ambiental
    let light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.4 );
    light.position.set( 0.5, 1, 0.75 );
    actualScene.addLight( light );

    generateDungeon();

    gameOver.style.display = '';
    scoreDOM.style.display = 'block';

    actualScene.paused = false;
    restartGame = false;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function run() {
    requestAnimationFrame(run);

    let time = performance.now();
    let delta = (time - prevTime) / 1000;

    // Marca que se presionó la tecla para reiniciar el juego
    if (actualScene.player.controls.getRestart()) {
        restartGame = true;
    }

    // Checa si debe resetear el juego
    // Si el jugador perdió, se resetea el score junto con la escena
    // Si el jugador terminó el nivel, se resetea la escena
    // Si no, solo se marca que no se debe resetear el juego
    if (restartGame) {
        if (actualScene.gameOver) {
            score = 0;
            resetGame();
        } else if (actualScene.levelFinished) {
            resetGame();
        } else {
            restartGame = false;
        }
    }

    actualScene.update(delta);
    prevTime = time;
    renderer.render(actualScene.ThreeScene, actualScene.player.controls.getCamera());
}