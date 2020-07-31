let camera, renderer, controls;
let actualScene, gameScenes = [];

let blocker, instructions, aimReticle, titleScreen, clickMe, gameOver, hearts = [];

let prevTime = performance.now();

let cubeUrl = "./images/wooden_crate_2.png";
let bulletUrl = './models/bullet.glb';
let chestURl = "./images/minecra.png";
let futuristicCubeUrl = './images/futuristicCubes.png'
let floorUrl = './images/floor.png';

let cubeBox;

let bulletMesh = null;

function loadGLTFModel(path, obj) {
    // Instantiate a loader
    var loader = new THREE.GLTFLoader();

    // Load a glTF resource
    loader.load(
        // resource URL
        path,
        // called when the resource is loaded
        function (gltf) {
            let num = gltf.scene.children.length;
            for (let i = 0; i < num; i++) {
                gltf.scene.children[0].castShadow = true;
                gltf.scene.children[0].receiveShadow = true;
                obj.mesh.add(gltf.scene.children[0]);
            }
            // gltf.animations; // Array<THREE.AnimationClip>
            // gltf.scene; // THREE.Group
            // gltf.scenes; // Array<THREE.Group>
            // gltf.cameras; // Array<THREE.Camera>
            // gltf.asset; // Object
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

function removeMainScreen(element) {
    titleScreen.style.display = 'none';
    clickMe.style.display = 'none';
    instructions.style.display = 'none';

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

function initPointerLock() {
    blocker = document.getElementById('blocker');
    instructions = document.getElementById('instructions');
    aimReticle = document.getElementById('aimReticle');
    titleScreen = document.getElementById('titleScreen');
    clickMe = document.getElementById('clickMe');
    gameOver = document.getElementById('gameOver');
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

        /*
        gameOver.addEventListener("click", event => {
            console.log("RR");
            if (event.keyCode === 82) {
              console.log("RE");
            }
          });
          */

    } else {
        instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
    }

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

function createBullet(shootVelo, shootDirection, object, r, parent) {

    let size = 0.3;
    let halfExtents = new CANNON.Vec3(0.35, 0.21, 0.21);

    let bulletShape = new CANNON.Box(halfExtents);
    let bulletBody = new CANNON.Body({ mass: 0.00000001 });
    bulletBody.addShape(bulletShape);

    let bullet = new Bullets(new THREE.Object3D(), bulletBody);

    bullet.copy(bulletMesh);

    bullet.mesh.castShadow = true;
    bullet.mesh.receiveShadow = true;

    bulletBody.quaternion.copy(object.quaternion);
    bullet.mesh.applyQuaternion(object.quaternion);

    bulletBody.velocity.set(shootDirection.x * shootVelo, shootDirection.y * shootVelo, shootDirection.z * shootVelo);

    // Move the ball outside the player sphere

    let x = object.position.x + shootDirection.x * (r + 0.5);
    let y = object.position.y + shootDirection.y * (r + 0.5);
    let z = object.position.z + shootDirection.z * (r + 0.5);
    bulletBody.position.set(x, y, z);
    bullet.mesh.position.set(x, y, z);

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
                    actualScene.player.hit = true;
                }

                break;
        }
    });

    actualScene.addBullet(bullet);

    return bullet;
}

function createGameScene() {
    let scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    scene.fog = new THREE.Fog(0xffffff, 0, 550);
    let gameScene = new GameScene(scene, initCannon(), 'prueba');
    return gameScene;
}

function createGun(mesh) {
    return new Guns(mesh);
}

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

function createPlayer(camera, controls) {
    let size = 2;
    var halfExtents = new CANNON.Vec3(size, size, size);
    var boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
    let cubeMap = new THREE.TextureLoader().load(cubeUrl);
    let boxMaterial = new THREE.MeshPhongMaterial({ specular: 0xffffff, flatShading: true, map: cubeMap });
    let box = new THREE.Mesh(boxGeometry, boxMaterial);

    cubeMap = new THREE.TextureLoader().load('./images/lavatile.jpg');
    boxMaterial = new THREE.MeshPhongMaterial({ specular: 0xffffff, flatShading: true, map: cubeMap });

    let player = new Player(box, createGun(new THREE.Object3D()), controls);

    loadGLTFModel('./models/gun.glb', player.weapon);

    player.weapon.mesh.children.forEach(child => {
        child.castShadow = true;
        child.receiveShadow = true;
    });

    return player;
}

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

function createSpotLight(color, pos, target) {
    light = new THREE.SpotLight( color, 1, 350);
    light.position.set( pos.x, pos.y, pos.z );
    light.target.position.set( target.x, target.y, target.z );
    if(true){
        light.castShadow = true;
        light.shadow.camera.near = 1;
        light.shadow.camera.far = 200;
        light.shadow.camera.fov = 30;
        light.shadow.mapSize.width = SHADOW_MAP_WIDTH;
        light.shadow.mapSize.height = SHADOW_MAP_HEIGHT;
    }
    actualScene.addLight( light );
    actualScene.addLight( light.target );

    // var spotLightHelper = new THREE.SpotLightHelper( light );
    // actualScene.addLight( spotLightHelper );
}

function createBoxes(size, pos) {
    // Add boxes
    let cubeMap = new THREE.TextureLoader().load(futuristicCubeUrl);
    let material = new THREE.MeshPhongMaterial( { specular: 0xffffff, flatShading: true, map: cubeMap });

    let boxSize = 6;
    let halfExtents = new CANNON.Vec3(boxSize, boxSize, boxSize);
    let boxShape = new CANNON.Box(halfExtents);
    let boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
    let y = 1 + boxSize + pos.y;
    let spawns = [
        {
            x: pos.x + size / 4,
            z: pos.z + size / 4
        },
        {
            x: pos.x + size / 4,
            z: pos.z - size / 4
        },
        {
            x: pos.x - size / 4,
            z: pos.z + size / 4
        },
        {
            x: pos.x - size / 4,
            z: pos.z - size / 4
        },
    ];
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

function spawnEnemies(size, pos) {
    let spawns = [
        {
            x: pos.x + size / 4,
            z: pos.z + size / 4
        },
        {
            x: pos.x + size / 4,
            z: pos.z - size / 4
        },
        {
            x: pos.x - size / 4,
            z: pos.z + size / 4
        },
        {
            x: pos.x - size / 4,
            z: pos.z - size / 4
        },
    ];

    let y = pos.y + 15;

    for (let i = 0; i < 4; i++) {
        let enem = createEnemy(((i % 2) ? 'roller' : 'shooter'));

        let x = spawns[i].x;
        let z = spawns[i].z;
        enem.cannonBody.position.set(x, y, z);
        enem.mesh.position.set(x, y, z);
    }
}

function createRoom(size, height, pos, sides) {
    let cubeMap = new THREE.TextureLoader().load(floorUrl);
    let material = new THREE.MeshPhongMaterial( { specular: 0xffffff, flatShading: true, map: cubeMap });

    let half = size / 2;

    let halfExtents = {
        bottom: new CANNON.Vec3(half, 1, half),
        sides: new CANNON.Vec3(1, height / 2, half),
        front: new CANNON.Vec3(half, height / 2, 1)
    }

    let boxShapes = {
        bottom: new CANNON.Box(halfExtents.bottom),
        sides: new CANNON.Box(halfExtents.sides),
        front: new CANNON.Box(halfExtents.front)
    }

    let boxGeometries = {
        bottom: new THREE.BoxGeometry(halfExtents.bottom.x * 2, 2, halfExtents.bottom.z * 2),
        sides: new THREE.BoxGeometry(2, halfExtents.sides.y * 2, halfExtents.sides.z * 2),
        front: new THREE.BoxGeometry(halfExtents.front.x * 2, halfExtents.front.y * 2, 2)
    }

    let keys = ['floor', 'ceiling', 'front', 'back', 'right', 'left'];

    let boxBodies = {};

    for (let i = 0; i < keys.length; i++) {
        boxBodies[keys[i]] = new CANNON.Body({ mass: 0.0 });
    }

    let boxMeshes = {
        floor: new THREE.Mesh(boxGeometries.bottom, material),
        ceiling: new THREE.Mesh(boxGeometries.bottom, material),
        front: new THREE.Mesh(boxGeometries.front, material),
        back: new THREE.Mesh(boxGeometries.front, material),
        right: new THREE.Mesh(boxGeometries.sides, material),
        left: new THREE.Mesh(boxGeometries.sides, material)
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

    // let keys = Object.keys(boxBodies);
    
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

    createSpotLight(0xffffff, {x: pos.x + quarter, y: height - 1, z: pos.z + quarter}, {x: pos.x + quarter, y: pos.y, z: pos.z + quarter});
    // createSpotLight(0xffffff, {x: pos.x - quarter, y: height - 1, z: pos.z + quarter}, {x: pos.x - quarter, y: pos.y, z: pos.z + quarter});
    // createSpotLight(0xffffff, {x: pos.x + quarter, y: height - 1, z: pos.z - quarter}, {x: pos.x + quarter, y: pos.y, z: pos.z - quarter});
    // createSpotLight(0xffffff, {x: pos.x - quarter, y: hei    ght - 1, z: pos.z - quarter}, {x: pos.x - quarter, y: pos.y, z: pos.z - quarter});
}

function generateDungeon() {
    let sides = {
        front: true,
        back:  true,
        right: true,
        left:  true
    }

    let size = 300;
    let height = 50;
    let origin = {
        x: 0, 
        y: 0, 
        z: 0
    }

    let lastKey;
    let cantRooms = 5;
    let currentKey;

    for (let i = 0; i < cantRooms; i++) {
        let offset;
        let valid = false;
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
    
        if (i < cantRooms - 1) {
            sides[currentKey] = false;
        }

        createRoom(size, height, origin, sides);

        origin.x += offset.x;
        origin.z += offset.z;

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

function createScene(canvas) {
    initCannon();
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    window.addEventListener('resize', onWindowResize, false);

    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 1000);

    // camera.position.y = 100;

    let scene = createGameScene();
    gameScenes.push(scene);
    actualScene = gameScenes[0];

    loadBulletModel();

    let light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.4 );
    light.position.set( 0.5, 1, 0.75 );
    actualScene.addLight( light );
    
    let controls = initPointerLock();
    let player = createPlayer(camera, controls);
    generateDungeon();
    // createBoxes();

    actualScene.environment.kinematic.forEach(function (child) {
        child.mesh.castShadow = true;
        child.mesh.receiveShadow = true;
    });

    actualScene.environment.static.forEach(function (child) {
        child.mesh.castShadow = true;
        child.mesh.receiveShadow = true;
    });

    actualScene.addPlayer(player);

    
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

    actualScene.update(delta);

    prevTime = time;

    renderer.render(actualScene.ThreeScene, actualScene.player.controls.getCamera());

}