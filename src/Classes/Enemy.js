class Enemey extends Entity {
    constructor(mesh, cannonBody, type) {
        super(mesh, cannonBody);

        this.type = type;
    }
}