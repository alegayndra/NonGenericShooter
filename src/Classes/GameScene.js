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
        this.ThreeScene.add(player.controls.getObject());
    }

    update(delta) {
        // this.Objects.forEach(obj => {
        //     obj.update(delta, this);
        // });
        this.player.update(delta, this);
    }

    animate() {
        this.Objects.forEach(obj => {
            obj.animate();
        });
    }
}