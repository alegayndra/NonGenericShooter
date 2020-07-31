class Entity {
    
    /*
        Constructor
        Entrada:
        - mesh:         Mesh de ThreeJS de la entidad 
        - cannonBody:   Cuerpo de CannonJS
    */
    constructor(mesh, cannonBody) {
        this.mesh = mesh;
        this.cannonBody = cannonBody;
    }

    /*
        Actualiza la posición del mesh de acuerdo a su respectivo cuerpo de CannonJS
    */
    updatePos() {
        this.mesh.position.copy(this.cannonBody.position);
    }
}