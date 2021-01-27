let camera, renderer, controls;
let actualScene, gameScenes = [];

let blocker, instructions, aimReticle, titleScreen, clickMe, gameOver, scoreDOM, finishLevel, hearts = [];

let prevTime = performance.now();

let score = 0;

let restartGame = false;

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
    loadEnemiesModels();

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