/*
  Crea 4 cajas dentro de un cuarto
  Entrada:
  - size: Tamaño del cuarto
  - pos:  Posición del cuarto dentro de la escena
*/
function createBoxes(size, pos) {
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
    let boxMesh = new THREE.Mesh( boxGeometry, boxMaterial );
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

  let y = pos.y + 20;

  // Genera los enemigos
  for (let spawn of spawns) {
    let num = 1;
    if (spawn.type == 'roller') num = 4;
    for (let j = 0; j < num; j++) {
      let enem = createEnemy(spawn.type);
      enem.cannonBody.position.set(spawn.x, y + (j * 10), spawn.z);
      enem.mesh.position.set(spawn.x, y + (j * 10), spawn.z);
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
    floor:   new THREE.Mesh(boxGeometries.bottom, roomMaterial),
    ceiling: new THREE.Mesh(boxGeometries.bottom, roomMaterial),
    front:   new THREE.Mesh(boxGeometries.front,  roomMaterial),
    back:    new THREE.Mesh(boxGeometries.front,  roomMaterial),
    right:   new THREE.Mesh(boxGeometries.sides,  roomMaterial),
    left:    new THREE.Mesh(boxGeometries.sides,  roomMaterial)
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