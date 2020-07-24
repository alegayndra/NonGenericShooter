class GameScene {
    constructor(ThreeScene, name) {
        this.ThreeScene = ThreeScene;
        this.Objects = [];
        this.name = name;
        this.player = null;
        this.objsMeshes = [];
        this.enemies = [];
        this.environment = [];
    }

    addObject(obj) {
        this.ThreeScene.add(obj.mesh);
        // this.Objects.push(obj);
        this.objsMeshes.push(obj.mesh);
    }

    addLight(light) {
        this.ThreeScene.add(light);
    }

    addEnvironment(obj) {
        this.environment.push(obj);
        this.ThreeScene.add(obj);
    }

    addPlayer(player) {
        this.player = player;
        // this.ThreeScene.add(player.mesh);
        this.ThreeScene.add(player.camera);
    }

    update(delta) {
        // this.Objects.forEach(obj => {
        //     obj.update(delta, this);
        // });
        this.player.update(delta, this);
        // this.colision();
    }

    colision() {

        if (cubeBox.position.x >= 20) {
            movement = false;
        } else if (cubeBox.position.x <= -20) {
            movement = true;
        }

        if (movement) {
            cubeBox.position.x += 0.1;
        } else {
            cubeBox.position.x -= 0.1;
        }

        let col1 = new THREE.Box3().setFromObject(cubeBox);
        let col2 = new THREE.Box3().setFromObject(this.environment[1]);

        // uno = col1;
        // dos = col2;

        let right = ((col1.min.x < col2.max.x) && (col1.max.x > col2.max.x));
        let left = ((col1.max.x > col2.min.x) && (col1.min.x < col2.min.x));

        // console.log(left, right);

        // console.log(col1.max.x, col2.min.x, (left));


        // console.log(col1.max.x, (col1.max.x > col2.min.x));

        // console.log(this.environment[1]);

        if (col1.intersectsBox(col2)) {
            // console.log('colision');

            // let left, right;

            // left = (col1.max.x < col2.min.x);

            // console.log(left, right);

            // console.log(col1.min, col2.min);

            

        }
    }

    animate() {
        this.Objects.forEach(obj => {
            obj.animate();
        });
    }
}