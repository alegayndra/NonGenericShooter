let camera, renderer, controls;
let actualScene, gameScenes = [];

// let objects = [];

let raycaster;

let blocker, instructions;

// let moveForward = false;
// let moveBackward = false;
// let moveLeft = false;
// let moveRight = false;
// let canJump = false;

let prevTime = performance.now();
// let velocity, direction;

let floorUrl = "../images/checker_large.gif";
let cubeUrl = "../images/wooden_crate_2.png";

function initPointerLock() {
    blocker = document.getElementById( 'blocker' );
    instructions = document.getElementById( 'instructions' );

    controls = new THREE.PointerLockControls( camera, document.body );

    controls.addEventListener( 'lock', function () {
        instructions.style.display = 'none';
        blocker.style.display = 'none';
    } );
    
    controls.addEventListener( 'unlock', function () {
        blocker.style.display = 'block';
        instructions.style.display = '';
    } );

    instructions.addEventListener( 'click', function () {
        controls.lock();
    }, false );

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

function createPlayer(camera, controls) {
    let size = 2;
    let boxGeometry = new THREE.BoxGeometry( size, size, size );
    let cubeMap = new THREE.TextureLoader().load(cubeUrl);    
    let boxMaterial = new THREE.MeshPhongMaterial( { specular: 0xffffff, flatShading: true, map:cubeMap } );
    let box = new THREE.Mesh( boxGeometry, boxMaterial );

    let player = new Player(box, camera, controls);

    return player;
}

function createScene(canvas)  {
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    window.addEventListener( 'resize', onWindowResize, false );
    
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );

    let scene = createGameScene();

    // A light source positioned directly above the scene, with color fading from the sky color to the ground color. 
    // HemisphereLight( skyColor, groundColor, intensity )
    // skyColor - (optional) hexadecimal color of the sky. Default is 0xffffff.
    // groundColor - (optional) hexadecimal color of the ground. Default is 0xffffff.
    // intensity - (optional) numeric value of the light's strength/intensity. Default is 1.

    let light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
    light.position.set( 0.5, 1, 0.75 );
    scene.addLight( light );

    // Raycaster( origin, direction, near, far )
    // origin — The origin vector where the ray casts from.
    // direction — The direction vector that gives direction to the ray. Should be normalized.
    // near — All results returned are further away than near. Near can't be negative. Default value is 0.
    // far — All results returned are closer then far. Far can't be lower then near . Default value is Infinity.
    raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 15 );

    // floor

    let map = new THREE.TextureLoader().load(floorUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);

    let floorGeometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
    let floor = new THREE.Mesh(floorGeometry, new THREE.MeshPhongMaterial({color:0xffffff, map:map, side:THREE.DoubleSide}));
    floor.rotation.x = -Math.PI / 2;
    let objeto = {
        mesh: floor,
        update: (delta) => {console.log('undefkinedasda')} 
    }
    scene.addObject( objeto );

    // objects

    // let boxGeometry = new THREE.BoxGeometry( 20, 20, 20 );
    // let cubeMap = new THREE.TextureLoader().load(cubeUrl);

    // for ( let i = 0; i < 500; i ++ ) 
    // {
    //     let boxMaterial = new THREE.MeshPhongMaterial( { specular: 0xffffff, flatShading: true, map:cubeMap } );

    //     let box = new THREE.Mesh( boxGeometry, boxMaterial );
    //     box.position.x = Math.floor( Math.random() * 20 - 10 ) * 20;
    //     box.position.y = Math.floor( Math.random() * 20 ) * 20 + 10;
    //     box.position.z = Math.floor( Math.random() * 20 - 10 ) * 20;

    //     let obj = {
    //         mesh: box,
    //         update: (delta) => {console.log('undefkinedasda')}
    //     }

    //     scene.addObject( obj );
    // }

    gameScenes.push(scene);
    actualScene = gameScenes[0];

    let controls = initPointerLock();

    let player = createPlayer(camera, controls);

    actualScene.addPlayer(player);
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
    prevTime = time;

    actualScene.update(delta);


    renderer.render( actualScene.ThreeScene, actualScene.player.camera );

}