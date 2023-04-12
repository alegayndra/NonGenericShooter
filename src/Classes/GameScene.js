/*
  Clase GameScene
  Para guardar la información referente a un nivel o escena dentro del juego
*/
class GameScene {
  /*
    Constructor
    Entrada
    - ThreeScene:   Escena de ThreeJS
    - CannonWorld:  Mundo de CannonJS
    - name:         Nombre de la escena dentro del juego
  */
  constructor(ThreeScene, CannonWorld, name) {
    this.ThreeScene = ThreeScene;
    this.CannonWorld = CannonWorld
    this.name = name;

    // Objeto del jugador
    this.player = null;

    // Arreglos sobre los diferentes elementos dentro del juego
    this.enemies = [];
    this.environment = { // Objetos dentro del mundo
      static: [],      // Objetos que no se mueven
      kinematic: []    // Objetos que sí se mueve
    };
    this.bullets = [];

    // Arreglo de objetos a borrar dentro de la escena
    // Esto porque si se intenta borrar un objeto dentro del cannon world 
    // mientras se está actualizando genera un error
    this.objectsToEliminate = []; 

    // Estados del juego
    this.paused = true; 
    this.gameOver = false;
    this.levelFinished = false;
  }

  /*
    Agrega una luz al juego
    Entrada:
    - light: luz de ThreeJS
  */
  addLight(light) {
    this.ThreeScene.add(light);
  }

  /*
    Agrega un objeto del ambiente a la escena
    Entrada:
    - obj:  Objeto que se va a agregar de algún tipo hijo de Entity o del tipo Entity
    - bool: Determina si el objeto es estatico o kinematico
  */
  addEnvironment(obj, bool) {
    if (bool) {
      this.environment.kinematic.push(obj);
    } else {
      this.environment.static.push(obj);
    }
    this.CannonWorld.addBody(obj.cannonBody);
    this.ThreeScene.add(obj.mesh);
  }

  /*
    Agrega un enemigo al juego
    Entrada:
    - enem: Objeto tipo Enemy
  */
  addEnemy(enem) {
    this.enemies.push(enem)
    this.CannonWorld.addBody(enem.cannonBody);
    this.ThreeScene.add(enem.mesh);
  }

  /*
    Determina el jugador del juego
    Entrada:
    - player: Objeto tipo Player
  */
  addPlayer(player) {
    this.player = player;
    this.ThreeScene.add(player.controls.getObject()); // Agrega la camara del jugador al juego
  }

  /*
    Agrega una bala al juego
    Entrada:
    - Bullet: Objeto de tipo Bullets
  */
  addBullet(bullet) {
    this.bullets.push(bullet);
    this.ThreeScene.add(bullet.mesh);
    this.CannonWorld.addBody(bullet.cannonBody);
  }

  /*
    Actualiza la lógica del juego
    Entrada:
    - delta: tiempo que ha pasado desde el último frame del juego
  */
  update(delta) {
    // Checa si el juego se terminó para marcar que el juego está pausado 
    if (this.gameOver) {
      gameOver.style.display = 'block';
      scoreDOM.style.display = 'none';
      this.paused = true;
    }

    // Chcea si el jugador no ha terminado el nivel
    if (!this.levelFinished) {
      finishLevel.style.display = 'none';
    }

    // Checa si el juego está pausado
    if(!this.paused) {
      scoreDOM.innerHTML= `Score: ${score}`;
      this.eliminateObjects();

      // Checa si el jugador ya eliminó a todos los enemigos para marcar que el nivel ya se terminó
      if (this.enemies.length <= 0) {
        this.levelFinished = true;
        finishLevel.style.display = 'block';
      }
      this.CannonWorld.step(delta);
      this.updatePos();

      this.bullets.forEach(bullet => {
        bullet.update(delta);
      });

      this.player.update(delta);
      
      this.enemies.forEach(enemy => {
        enemy.update(delta);
      });
    }
  }

  /*
    Elimina las geometrías y materiales de un objeto de ThreeJS y de sus hijos
    Entrada:
    - child: Objeto de ThreeJS
  */
  disposeGeometries(child) {
    if (child.geometry) {
      child.geometry.dispose();
    }
    if (child.material) {
      child.material.dispose();
    }
    child.children.forEach(c => {
      this.disposeGeometries(c);
    });
  }

  /*
    Elimina un objeto dentro de la escena del juego
    Entrada:
    - obj: Objeto dentro del mundo del juego
  */
  disposeObj(obj) {
    const object = this.ThreeScene.getObjectByProperty( 'uuid', obj.mesh.uuid );

    if (object) {
      this.disposeGeometries(object);
      
      this.ThreeScene.remove(object);
      this.CannonWorld.remove(obj.cannonBody);
    }
  }

  /*
    Elimina todos los objetos que están por eliminarse
  */
  eliminateObjects() {
    if (this.objectsToEliminate.length > 0) {
      this.objectsToEliminate.forEach(pos => {
        this.disposeObj(pos.obj);
        switch(pos.type) {
          case 'bullet':
            this.bullets = this.bullets.filter(arr => pos.obj !== arr);
            break;
          case 'enemy':
            this.enemies = this.enemies.filter(arr => pos.obj !== arr);
            break;
          case 'kinematic':
            this.environment.kinematic = this.environment.kinematic.filter(arr => pos.obj !== arr);
            break;
          case 'static':
            this.environment.static = this.environment.static.filter(arr => pos.obj !== arr);
            break;
        }
      });
      renderer.renderLists.dispose();
      this.objectsToEliminate = [];
    }
  }

  /*
    Resetea la escena
  */
  restartScene() {
    // Limpia los arreglos de la escena
    this.objectsToEliminate = [];

    this.enemies = [];
    this.environment.static = [];
    this.environment.kinematic = [];
    this.bullets = [];

    // Resetea los estados del juego
    this.paused = true; 
    this.gameOver = false;
    this.levelFinished = false;
    
    // Genera una nueva escena de ThreeJs y un nuevo mundo de CannonJS
    this.ThreeScene = new THREE.Scene();
    this.ThreeScene.background = new THREE.Color(0xffffff);
    this.ThreeScene.fog = new THREE.Fog(0xffffff, 0, 900);
    this.CannonWorld = initCannon();
  }

  /*
    Actualiza la posición de los meshes de ThreeJS a sus respectivos cuerpos dentro del Cannon World
  */
  updatePos() {
    this.enemies.forEach(enemy => {
      enemy.updatePos();
    });

    this.bullets.forEach(bullet => {
      bullet.updatePos();
    });

    this.environment.kinematic.forEach(obj => {
      obj.updatePos();
    });
  }
}
