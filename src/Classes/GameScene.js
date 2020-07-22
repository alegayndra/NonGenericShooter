class GameScene {
    constructor(ThreeScene, name) {
        this.ThreeScene = ThreeScene;
        this.Objects = [];
        this.name = name;
    }

    addObject(obj) {
        this.ThreeScene.add(obj);
        this.Objects.push(obj);
    }

    update(delta) {
        this.Objects.forEach(obj => {
            obj.update(delta);
        });
    }

    animate(delta) {
        this.Objects.forEach(obj => {
            obj.animate(delta);
        });
    }
}