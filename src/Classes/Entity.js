class Entity {
    constructor(mesh, cannonBody) {
        this.mesh = mesh;
        this.cannonBody = cannonBody;
    }

    updatePos() {
        this.mesh.position.copy(this.cannonBody.position);
    }
}