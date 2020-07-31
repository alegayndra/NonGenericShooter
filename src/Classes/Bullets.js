class Bullets extends Entity {

    /*
        Constructor
        Entrada:
        - mesh:         Mesh de ThreeJS de la bala 
        - cannonBody:   Cuerpo de CannonJS
    */
    constructor(mesh, cannonBody) {
        super(mesh, cannonBody);
    }

    /*
        Copia el mesh de otro objeto
        Entrada:
        - bullet: bala de la cual se copiara el mesh
    */
    copy(bullet) {
        this.mesh.copy(bullet.mesh);
    }

    /*
        Actualiza la lógica de la bala
        Entrada:
        - delta: tiempo que ha pasado desde el último frame
    */
    update(delta) {
        this.cannonBody.velocity.y += 50 * delta;
    }
}