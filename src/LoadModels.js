const cubeUrl = "./images/wooden_crate_2.png";
const bulletUrl = './models/bullet.glb';
const chestURl = "./images/minecra.png";
const futuristicCubeUrl = './images/futuristicCubes.png'
const floorUrl = './images/floor.png';
const bumpUrl = './images/bumpCube.png';

const enemiesModels = [
  {
    mass: 1,
    modelUrl: './models/roller.glb',
    enemyShape: new CANNON.Sphere(5),
    type: 'roller'
  },
  {
    mass: 0,
    modelUrl: './models/shooter.glb',
    enemyShape: new CANNON.Box(new CANNON.Vec3(4, 4, 4)),
    type: 'shooter'
  }
]

let bulletMesh = null;
const enemiesMeshes = []

/*
  Carga un modelo en formato GLTF
  Entrada:
  - path: Dirección al archivo
  - obj:  Objeto al cual se le cargará el modelo
*/
async function loadGLTFModel(path, obj) {
  // Instantiate a loader
  let loader = new THREE.GLTFLoader();

  function modelLoader(url) {
    return new Promise((resolve, reject) => {
      loader.load(url, data => resolve(data), (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      }, reject);
    });
  }

  const gltfData = await modelLoader(path);

  function success(gltf) {
    // Agrega todos los hijos del modelo al objeto
    console.log(path);
    console.log(gltf.scene.children.length, gltf.scene.children);
    let num = gltf.scene.children.length;
    for (let i = 0; i < num; i++) {
      gltf.scene.children[0].castShadow = true;
      gltf.scene.children[0].receiveShadow = true;
      obj.mesh.add(gltf.scene.children[0]);
    }
  }

  success(gltfData);
}

async function loadModels() {
  await loadBulletModel()
  await loadEnemiesModels();
}

/*
    Carga el modelo de las balas
*/
async function loadBulletModel() {
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

  await loadGLTFModel(bulletUrl, bulletMesh);

  bulletMesh.mesh.rotation.y = Math.PI / 2;
}

/*
  Carga el modelo de las balas
*/
async function loadEnemiesModels() {
  for (model of enemiesModels) {
    let enemyBody = new CANNON.Body({ mass: model.mass });
    enemyBody.addShape(model.enemyShape);
    let enemy = new Enemy(new THREE.Object3D(), enemyBody, model.type);
    await loadGLTFModel(model.modelUrl, enemy);
    enemy.mesh.castShadow = true;
    enemy.mesh.receiveShadow = true;
    enemiesMeshes.push({mesh: enemy, type: model.type});
  }
}