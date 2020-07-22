class GameScene {
    constructor(ThreeJSScene, name) {
        this.ThreeJSScene = ThreeJSScene;
        this.Objects = [];
        this.name = name;
    }

    addObject(obj) {
        this.ThreeJSScene.add(obj);
        Objects.push(obj);
    }

    update() {
        Objects.forEach(obj => {
            obj.update();
        });
    }
}