/*
    Clase Guns
    Para guardar la información referente a las armas
*/
class Guns {
    /*
        Constructor
        Entrada
        - mesh: mesh de Three JS
    */
    constructor(mesh) {
        this.mesh = mesh;
    }

    /*
        Se encarga de hacer que el jugador dispare
        Entrada:
        - raycaster:    raycaster con la dirección en la que el jugador está apuntando
        - controls:     controles del jugador para conseguir la posición del jugador
    */
    shoot(raycaster, controls) {
        createBullet(250, raycaster.ray.direction, controls.getObject(), 15, 'player');
    }
}