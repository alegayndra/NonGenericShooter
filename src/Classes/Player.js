class Object {
    constructor(mesh) {
        this.mesh = mesh;
    }

    update(delta) {
        console.log('update not defined', delta);
    }

    animate(delta) {
        console.log('animate not defined', delta);
    }
}