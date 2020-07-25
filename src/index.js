let camera, renderer, controls;
let actualScene, gameScenes = [];

let world;
let boxes = [], boxMeshes = [];

let raycaster;

let blocker, instructions;

let prevTime = performance.now();

let floorUrl = "../images/checker_large.gif";
let cubeUrl = "../images/wooden_crate_2.png";

let conBody;

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

            } else {

                controls.enabled = false;

                blocker.style.display = '-webkit-box';
                blocker.style.display = '-moz-box';
                blocker.style.display = 'box';

                instructions.style.display = '';

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

    let mass = 5, radius = 1.3;
    let sphereShape = new CANNON.Sphere(radius);
    conBody = new CANNON.Body({ mass: mass });
    conBody.addShape(sphereShape);
    conBody.position.set(0,5,0);
    conBody.linearDamping = 0.9;
    world.addBody(conBody);

    controls = new PointerLockControls( camera, conBody );

    return controls;
    // actualScene.addObject( controls.getObject() );
}

function createGameScene() {
    let scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );
    scene.fog = new THREE.Fog( 0xffffff, 0, 550 );
    let gameScene = new GameScene(scene, 'prueba');
    return gameScene;
}

let box;

function createPlayer(camera, controls) {
    let size = 5;
    let boxGeometry = new THREE.BoxGeometry( size, size, size );
    let cubeMap = new THREE.TextureLoader().load(cubeUrl);    
    let boxMaterial = new THREE.MeshPhongMaterial( { specular: 0xffffff, flatShading: true, map:cubeMap } );
    // let box = new THREE.Mesh( boxGeometry, boxMaterial );
    box = new THREE.Mesh( boxGeometry, boxMaterial );

    cubeMap = new THREE.TextureLoader().load('../images/lavatile.jpg');    
    boxMaterial = new THREE.MeshPhongMaterial( { specular: 0xffffff, flatShading: true, map:cubeMap } );

    let player = new Player(box, new THREE.Mesh( boxGeometry, boxMaterial ), camera, controls);

    return player;
}

function createBoxes() {
    // Add boxes
    let material = new THREE.MeshLambertMaterial( { color: 0xdddddd } );
    geometry = new THREE.PlaneGeometry( 300, 300, 50, 50 );
    geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

    mesh = new THREE.Mesh( geometry, material );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    actualScene.addEnvironment( mesh );

    var halfExtents = new CANNON.Vec3(1,1,1);
    var boxShape = new CANNON.Box(halfExtents);
    var boxGeometry = new THREE.BoxGeometry(halfExtents.x*2,halfExtents.y*2,halfExtents.z*2);
    for(var i=0; i<7; i++){
        var x = (Math.random()-0.5)*20;
        var y = 1 + (Math.random()-0.5)*1;
        var z = (Math.random()-0.5)*20;
        var boxBody = new CANNON.Body({ mass: 5 });
        boxBody.addShape(boxShape);
        var boxMesh = new THREE.Mesh( boxGeometry, material );
        world.addBody(boxBody);
        actualScene.addEnvironment(boxMesh);
        boxBody.position.set(x,y,z);
        boxMesh.position.set(x,y,z);
        boxMesh.castShadow = true;
        boxMesh.receiveShadow = true;
        boxes.push(boxBody);
        boxMeshes.push(boxMesh);
    }
}

function initCannon() {
    // Setup our world
    world = new CANNON.World();
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

    world.gravity.set(0,-20,0);
    world.broadphase = new CANNON.NaiveBroadphase();

    // Create a slippery material (friction coefficient = 0.0)
    physicsMaterial = new CANNON.Material("slipperyMaterial");
    var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial,
                                                            physicsMaterial,
                                                            0.0, // friction coefficient
                                                            0.3  // restitution
                                                            );
    // We must add the contact materials to the world
    world.addContactMaterial(physicsContactMaterial);

    // Create a sphere
    var mass = 5, radius = 1.3;
    sphereShape = new CANNON.Sphere(radius);
    sphereBody = new CANNON.Body({ mass: mass });
    sphereBody.addShape(sphereShape);
    sphereBody.position.set(0,5,0);
    sphereBody.linearDamping = 0.9;
    world.addBody(sphereBody);

    // Create a plane
    var groundShape = new CANNON.Plane();
    var groundBody = new CANNON.Body({ mass: 0 });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    world.addBody(groundBody);
}

function createScene(canvas)  {
    initCannon();
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    window.addEventListener( 'resize', onWindowResize, false );
    
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );

    camera.position.y = 100;

    let scene = createGameScene();
    gameScenes.push(scene);
    actualScene = gameScenes[0];

    // A light source positioned directly above the scene, with color fading from the sky color to the ground color. 
    // HemisphereLight( skyColor, groundColor, intensity )
    // skyColor - (optional) hexadecimal color of the sky. Default is 0xffffff.
    // groundColor - (optional) hexadecimal color of the ground. Default is 0xffffff.
    // intensity - (optional) numeric value of the light's strength/intensity. Default is 1.

    let light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
    light.position.set( 0.5, 1, 0.75 );
    actualScene.addLight( light );

    // Raycaster( origin, direction, near, far )
    // origin — The origin vector where the ray casts from.
    // direction — The direction vector that gives direction to the ray. Should be normalized.
    // near — All results returned are further away than near. Near can't be negative. Default value is 0.
    // far — All results returned are closer then far. Far can't be lower then near . Default value is Infinity.
    // raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 15 );

    // floor

    // let map = new THREE.TextureLoader().load(floorUrl);
    // map.wrapS = map.wrapT = THREE.RepeatWrapping;
    // map.repeat.set(8, 8);

    // let floorGeometry = new THREE.BoxGeometry( 100, 100, 3 );
    // let floor = new THREE.Mesh(floorGeometry, new THREE.MeshPhongMaterial({color:0xffffff, map:map, side:THREE.DoubleSide}));
    // floor.rotation.x = -Math.PI / 2;
    // actualScene.addEnvironment( floor );

    // objects

    // let sizeBox = 10;
    // let boxGeometry = new THREE.BoxGeometry( sizeBox, sizeBox, sizeBox );
    // let cubeMap = new THREE.TextureLoader().load(cubeUrl);
    // let boxMaterial = new THREE.MeshPhongMaterial( { specular: 0xffffff, flatShading: true, map:cubeMap } );
    // let box = new THREE.Mesh( boxGeometry, boxMaterial );
    // box.position.z = -10;
    // box.position.x = 0;
    // box.position.y = 25;
    // actualScene.addEnvironment(box);
    // cubeBox = new THREE.Mesh( boxGeometry, boxMaterial );
    // cubeBox.position.x = -10;
    // cubeBox.position.z = -10;
    // cubeBox.position.y = 5;
    // actualScene.addEnvironment(cubeBox);

    // for ( let i = 0; i < 50; i ++ ) 
    // {
    //     let boxMaterial = new THREE.MeshPhongMaterial( { specular: 0xffffff, flatShading: true, map:cubeMap } );

    //     let box = new THREE.Mesh( boxGeometry, boxMaterial );
    //     box.position.x = Math.floor( Math.random() * 20 - 10 ) * 20;
    //     box.position.y = Math.floor( Math.random() * 3 ) * 20 + 10;
    //     box.position.z = Math.floor( Math.random() * 20 - 10 ) * 20;

    //     // let obj = {
    //     //     mesh: box,
    //     //     update: (delta) => {console.log('undefkinedasda')}
    //     // }

    //     actualScene.addEnvironment(box);
    // }

    

    let controls = initPointerLock();

    let player = createPlayer(camera, controls);

    createBoxes();

    actualScene.addPlayer(player);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate(dt) {
    if(controls.enabled){
        world.step(dt);

        // // Update ball positions
        // for(var i=0; i<balls.length; i++){
        //     ballMeshes[i].position.copy(balls[i].position);
        //     ballMeshes[i].quaternion.copy(balls[i].quaternion);
        // }

        // Update box positions
        for(var i=0; i<boxes.length; i++){
            boxMeshes[i].position.copy(boxes[i].position);
            boxMeshes[i].quaternion.copy(boxes[i].quaternion);
        }
    }
}

function run() {
    requestAnimationFrame( run );

    let time = performance.now();
    let delta = ( time - prevTime ) / 1000;

    animate(delta);
    
    // actualScene.player.controls.update( delta );
    controls.update( delta * 1000 );

    actualScene.update(delta);

    prevTime = time;

    renderer.render( actualScene.ThreeScene, actualScene.player.camera );

}