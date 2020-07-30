let camera, renderer, controls;
let actualScene, gameScenes = [];

let blocker, instructions;

let prevTime = performance.now();

let cubeUrl = "./images/wooden_crate_2.png";
let bulletUrl = './models/bullet.glb';

let bulletMesh = null;

function loadGLTFModel(path, obj) {
    // Instantiate a loader
    var loader = new THREE.GLTFLoader();

    // Load a glTF resource
    loader.load(
        // resource URL
        path,
        // called when the resource is loaded
        function ( gltf ) {
            let num = gltf.scene.children.length;
            for (let i = 0; i < num; i++) {
                obj.mesh.add( gltf.scene.children[0] );
            }
            // gltf.animations; // Array<THREE.AnimationClip>
            // gltf.scene; // THREE.Group
            // gltf.scenes; // Array<THREE.Group>
            // gltf.cameras; // Array<THREE.Camera>
            // gltf.asset; // Object
        },
        // called while loading is progressing
        function ( xhr ) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        // called when loading has errors
        (error) => {
            console.log( 'An error happened' );
        }
    );
}

function initPointerLock() {
    blocker = document.getElementById( 'blocker' );
    instructions = document.getElementById( 'instructions' );
    var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

    if ( havePointerLock ) {

        var element = document.body;

        var pointerlockchange = function ( event ) {
            if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
                controls.enabled = true;
                blocker.style.display = 'none';
                actualScene.paused = false;
            } else {
                controls.enabled = false;
                blocker.style.display = '-webkit-box';
                blocker.style.display = '-moz-box';
                blocker.style.display = 'box';
                instructions.style.display = '';
                actualScene.paused = true;
            }
        }

        var pointerlockerror = function ( event ) {
            instructions.style.display = '';
        }

        // Hook pointer lock state change events
        document.addEventListener( 'pointerlockchange', pointerlockchange, false );
        document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
        document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

        document.addEventListener( 'pointerlockerror', pointerlockerror, false );
        document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
        document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

        instructions.addEventListener( 'click', function ( event ) {
            instructions.style.display = 'none';

            // Ask the browser to lock the pointer
            element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

            if ( /Firefox/i.test( navigator.userAgent ) ) {
                var fullscreenchange = function ( event ) {
                    if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {
                        document.removeEventListener( 'fullscreenchange', fullscreenchange );
                        document.removeEventListener( 'mozfullscreenchange', fullscreenchange );
                        element.requestPointerLock();
                    }
                }

                document.addEventListener( 'fullscreenchange', fullscreenchange, false );
                document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );
                element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
                element.requestFullscreen();

            } else {
                element.requestPointerLock();
            }
        }, false );
    } else {
        instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
    }

    let mass = 10, radius = 10;
    let boxShape = new CANNON.Sphere(radius);
    conBody = new CANNON.Body({ mass: mass });
    conBody.addShape(boxShape);
    conBody.position.set(0,5,0);
    conBody.linearDamping = 0.9;

    conBody.position.y = 3;

    actualScene.CannonWorld.addBody(conBody);

    controls = new PointerLockControls( camera, conBody );

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
    let halfExtents = new CANNON.Vec3(size / 2, size / 2, size);

    let bulletShape = new CANNON.Box(halfExtents);
    let bulletBody = new CANNON.Body({ mass: 0.00000001 });
    bulletBody.addShape(bulletShape);

    let bullet = new Bullets(new THREE.Object3D(), bulletBody);

    bullet.copy(bulletMesh);
    
    bullet.mesh.castShadow = true;
    bullet.mesh.receiveShadow = true;        

    bulletBody.quaternion.copy (object.quaternion);
    bullet.mesh.applyQuaternion(object.quaternion);

    bulletBody.velocity.set(shootDirection.x * shootVelo, shootDirection.y * shootVelo, shootDirection.z * shootVelo);

    // Move the ball outside the player sphere

    let x = object.position.x + shootDirection.x * (r + 0.5);
    let y = object.position.y + shootDirection.y * (r + 0.5);
    let z = object.position.z + shootDirection.z * (r + 0.5);
    bulletBody.position.set(x, y, z);
    bullet.mesh.position.set(x, y, z);

    bulletBody.addEventListener("collide",function(e){
        actualScene.objectsToEliminate.push({obj: bullet, type: 'bullet'});
        switch(parent) {
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
    scene.background = new THREE.Color( 0xffffff );
    scene.fog = new THREE.Fog( 0xffffff, 0, 550 );
    let gameScene = new GameScene(scene, initCannon(), 'prueba');
    return gameScene;
}

function createGun(mesh) {
    return new Guns(mesh);
}

function createEnemy(type) {

    // Add boxes
    let material = new THREE.MeshPhongMaterial( { color: 0xff9999 } );
    let enemyShape;
    
    let enemyGeometry;
    
    let mass;

    let y = 15;

    switch(type) {
        case 'roller':
            mass = 1;
            let radius = 5
            enemyShape = new CANNON.Sphere(radius);
            enemyGeometry = new THREE.SphereGeometry(radius, 32, 32 );
            break;
        case 'shooter':
            mass = 0
            // y = 15;
            let size = 4;
            let halfExtents = new CANNON.Vec3(size, size, size);
            enemyShape = new CANNON.Box(halfExtents);
            enemyGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
            break;
    }

    let enemyBody = new CANNON.Body({mass: mass});
    enemyBody.addShape(enemyShape);
    
    let enemyMesh = new THREE.Mesh(enemyGeometry, material);

    enemyMesh.castShadow = true;
    enemyMesh.receiveShadow = true;

    let x = (Math.random() * 50) - 25;
    let z = (Math.random() * 50) - 25;

    enemyMesh.position.set(x, y, z);
    enemyBody.position.set(x, y, z);

    let enemy = new Enemy(enemyMesh, enemyBody, type);

    actualScene.addEnemy(enemy);

    return enemy;
}

function createPlayer(camera, controls) {
    let size = 2;
    var halfExtents = new CANNON.Vec3(size, size, size);
    var boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
    let cubeMap = new THREE.TextureLoader().load(cubeUrl);    
    let boxMaterial = new THREE.MeshPhongMaterial( { specular: 0xffffff, flatShading: true, map:cubeMap } );
    let box = new THREE.Mesh( boxGeometry, boxMaterial );

    cubeMap = new THREE.TextureLoader().load('./images/lavatile.jpg');    
    boxMaterial = new THREE.MeshPhongMaterial( { specular: 0xffffff, flatShading: true, map:cubeMap } );

    let player = new Player(box, createGun(new THREE.Object3D()), controls);

    loadGLTFModel('./models/gun.glb', player.weapon);

    player.weapon.mesh.children.forEach(child => {
        child.castShadow = true;
        child.receiveShadow = true;
    });

    return player;
}

function createRoom(size) {
    let material = new THREE.MeshPhongMaterial( { color: 0xdddddd } );

    let halfExtents = {
        bottom: new CANNON.Vec3(size, 1, size),
        sides: new CANNON.Vec3(1, size, size),
        front: new CANNON.Vec3(size, size, 1)
    }

    let boxShapes = {
        bottom: new CANNON.Box(halfExtents.bottom),
        sides:  new CANNON.Box(halfExtents.sides),
        front:  new CANNON.Box(halfExtents.front)
    }

    let boxGeometries = {
        bottom: new THREE.BoxGeometry(halfExtents.bottom.x * 2, 2,                       halfExtents.bottom.z * 2),
        sides:  new THREE.BoxGeometry(2,                        halfExtents.sides.y * 2, halfExtents.sides.z * 2),
        front:  new THREE.BoxGeometry(halfExtents.front.x * 2,  halfExtents.front.y * 2, 2)
    }

    let boxBodies = {
        floor:   new CANNON.Body({ mass: 0.0 }),
        ceiling: new CANNON.Body({ mass: 0.0 }),
        front:   new CANNON.Body({ mass: 0.0 }),
        back:    new CANNON.Body({ mass: 0.0 }),
        right:   new CANNON.Body({ mass: 0.0 }),
        left:    new CANNON.Body({ mass: 0.0 })
    }

    let boxMeshes = {
        floor:   new THREE.Mesh( boxGeometries.bottom, material ),
        ceiling: new THREE.Mesh( boxGeometries.bottom, material ),
        front:   new THREE.Mesh( boxGeometries.front,  material ),
        back:    new THREE.Mesh( boxGeometries.front,  material ),
        right:   new THREE.Mesh( boxGeometries.sides,  material ),
        left:    new THREE.Mesh( boxGeometries.sides,  material )
    }

    boxBodies.floor.addShape(boxShapes.bottom);
    boxBodies.ceiling.addShape(boxShapes.bottom);
    boxBodies.ceiling.position.y = size;
    boxMeshes.ceiling.position.y = size;

    boxBodies.front.addShape(boxShapes.front);
    boxBodies.back.addShape(boxShapes.front);
    boxBodies.front.position.z = size / 2;
    boxBodies.back.position.z = -size / 2;
    boxMeshes.front.position.z = size / 2;
    boxMeshes.back.position.z = -size / 2;

    boxBodies.right.addShape(boxShapes.sides);
    boxBodies.left.addShape(boxShapes.sides);

    boxBodies.right.position.x = size / 2;
    boxBodies.left.position.x = -size / 2;

    boxMeshes.right.position.x = size / 2;
    boxMeshes.left.position.x = -size / 2;

    let keys = Object.keys(boxBodies);
    
    keys.forEach(key => {
        boxMeshes[key].castShadow = true;
        boxMeshes[key].receiveShadow = true;
        actualScene.addEnvironment(new Entity(boxMeshes[key], boxBodies[key]), false);
    });
}

function createBoxes() {
    // Add boxes
    let material = new THREE.MeshPhongMaterial( { color: 0xdddddd } );

    let size = 4;
    let halfExtents = new CANNON.Vec3(size, size, size);
    let boxShape = new CANNON.Box(halfExtents);
    let boxGeometry = new THREE.BoxGeometry(halfExtents.x*2,halfExtents.y*2,halfExtents.z*2);
    for(var i=0; i<7; i++){
        var x = (Math.random()-0.5)*20;
        var y = 1 + (Math.random() + 1) * 5 ;
        var z = (Math.random()-0.5)*20;
        var boxBody = new CANNON.Body({ mass: 1 });
        boxBody.addShape(boxShape);
        var boxMesh = new THREE.Mesh( boxGeometry, material );
        // world.addBody(boxBody);
        let obj = new Entity(boxMesh, boxBody);
        actualScene.addEnvironment(obj, true);
        boxBody.position.set(x,y,z);
        boxMesh.position.set(x,y,z);
        boxMesh.castShadow = true;
        boxMesh.receiveShadow = true;
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
    if(split)
        world.solver = new CANNON.SplitSolver(solver);
    else
        world.solver = solver;

    world.gravity.set(0,-90,0);
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

function createScene(canvas)  {
    initCannon();
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    window.addEventListener( 'resize', onWindowResize, false );
    
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );

    // camera.position.y = 100;

    let scene = createGameScene();
    gameScenes.push(scene);
    actualScene = gameScenes[0];

    loadBulletModel();

    let light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.2 );
    light.position.set( 0.5, 1, 0.75 );
    actualScene.addLight( light );

    light = new THREE.SpotLight( 0xffffff );
    light.position.set( 0, 30, 10 );
    light.target.position.set( 0, 0, 0 );
    if(true){
        let SHADOW_MAP_WIDTH = 256;
        let SHADOW_MAP_HEIGHT = 256;
        light.castShadow = true;
        light.shadow.camera.near = 1;
        light.shadow.camera.far = 200;
        light.shadow.camera.fov = 90;
        light.shadow.mapSize.width = SHADOW_MAP_WIDTH;
        light.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

        //light.shadowCameraVisible = true;
    }
    actualScene.addLight( light );

    let controls = initPointerLock();
    let player = createPlayer(camera, controls);
    createRoom(300);
    createBoxes();

    actualScene.environment.kinematic.forEach(function (child) {
        child.mesh.castShadow = true;
        child.mesh.receiveShadow = true;
    });

    actualScene.environment.static.forEach(function (child) {
        child.mesh.castShadow = true;
        child.mesh.receiveShadow = true;
    });

    actualScene.addPlayer(player);

    for (let i = 0; i < 4; i++) {
        createEnemy(((i % 2) ? 'roller' : 'shooter'));
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function run() {
    requestAnimationFrame( run );

    let time = performance.now();
    let delta = ( time - prevTime ) / 1000;

    actualScene.update(delta);

    prevTime = time;

    renderer.render( actualScene.ThreeScene, actualScene.player.controls.getCamera() );

}