class Player {
    /*
        Constructor
        Entrada:
        - mesh:     Mesh del jugador
        - gun:      Modelo del arma
        - controls: Controles para mover al jugador
    */
    constructor(mesh, gun, controls) {
        this.mesh = mesh;
        this.weapon = gun;
        this.controls = controls;
        
        // Posiciona el arma abajo a la derecha de la camara
        this.weapon.mesh.position.x = 3;
        this.weapon.mesh.position.y = -3;
        this.weapon.mesh.position.z = -6;
        
        // Rota el modelo para que mire hacia en frente
        this.weapon.mesh.rotation.y = Math.PI / 2;
        
        // Agrega el modelo del jugador y del arma para que sigan a la camara
        this.controls.getCamera().add(this.weapon.mesh);
        this.controls.getCamera().add(this.mesh);
        
        // Crea un raycaster
        this.raycaster = new THREE.Raycaster();
        this.raycaster.camera = controls.getCamera();

        // Banderas sobre estados del jugador
        this.flags = {
            shooting: false,
            hit: false,
            damaged: false,
            healing: false
        }

        // Acumuladores de tiempo
        this.timeToHeal = 0;        // Para saber si el jugador debe empezar a sanar 
        this.healingTime = 0;       // Para regenerar un corazón cada segundo
        this.frameAnimation = 0;    // Para saber el fire rate y que tanto debe girar la pistola cuando se dispara
        this.timeHit = 0;           // Para saber que tanto tiempo ha pasado desde que el jugador fue golpeado, para animar la rotación de la camara
        
        this.health = 5;
    }

    /*
        Dispara una bala
        Entrada:
        - delta: Tiempo que ha pasado desde el último frame
    */
    shoot(delta) {
        // Checa si se presionó el mouse para marcar que el jugador disparó
        if (this.controls.getMouseClicked() && !this.flags.shooting) {
            this.flags.shooting = true;
            this.weapon.shoot(this.raycaster, this.controls);
        }

        // Si el jugador está disparando, anima la rotación de la pistola
        if (this.flags.shooting) {
            this.frameAnimation += 20 * delta;
            this.weapon.mesh.rotation.x = this.frameAnimation;

            // Checa si la pistola ya roto por completo para marcar que ya terminó de rotar y puede volver a disparar
            if (this.frameAnimation >= Math.PI * 2) {
                this.weapon.mesh.rotation.x = 0;
                this.frameAnimation = 0;
                this.flags.shooting = false;
            }
        }

        // Actualiza la dirección del raycaster
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.raycaster.camera);
    }

    /*
        Actualiza la lógica del jugador
        Entrada:
        - delta: Tiempo que ha pasado desde el último frame
    */
    update(delta) {
        
        this.shoot(delta);

        // Checa si el jugador se está curando
        // Si sí, regenera un corazón por segundo
        // Si no, empieza este proceso después de 5 segundos sin recibir daño
        if (!this.flags.healing) {
            // Aumenta el contador de cuanto lleva sin curarse el jugador y sin recibir daño
            this.timeToHeal += delta;
            if (this.timeToHeal >= 5) {
                this.flags.healing = true;
                this.timeToHeal = 0;
            }
        } else {
            // Si el jugador tiene 5 corazones, ya no se cura más
            if (this.health >= 5) {
                this.healing = false;
                this.healingTime = 0;
            } else {
                this.healingTime += delta;
                if (this.healingTime >= 1) {
                    this.healingTime -= 1;
                    // Muestra un corazon extra en la interfaz
                    hearts.push(document.getElementById(`heart${hearts.length + 1}`));
                    hearts[hearts.length-1].style.display = 'block';
                    this.health++;
                }
            }
        }

        // Checa si el jugador fue golpeado
        // Si sí, pierde un corazón
        if (this.flags.hit) {
            // Quita un corazón de la interfaz
            hearts[hearts.length-1].style.display = 'none'
            hearts.pop()

            this.health--;

            // Marca que ya pasó el golpe y que debe empezar la animación de daño
            this.flags.hit = false;
            this.flags.damaged = true;

            // Resetea los contadores de la regeneración de vida
            this.flags.healing = false;
            this.timeToHeal = 0;
            this.healingTime = 0;

            // Checa si el jugador se quedó sin corazones
            // Si sí, el juego termina
            if (this.health <= 0) {
                actualScene.gameOver = true;
            }
        }

        // Checa si el jugador esta dañado para animar dicho daño
        if (this.flags.damaged) {
            this.timeHit += delta;
            // Checa si aun no han pasado 0.15 segundos desde que el jugador fue dañado
            // Si sí, rota la camara hacía la izquierda
            if (this.timeHit < 0.15) {
                this.controls.getCamera().rotation.z += Math.PI / 2 * delta;
            }
            // Checa si ya pasaron 0.3 segundos, determinando el final de la animación 
            else if (this.timeHit >= 0.3) {
                this.controls.getCamera().rotation.z = 0;
                this.flags.damaged = false;
                this.timeHit = 0;
            }
            // Checa si ya pasaron 0.15 segundos, determinando que la camara debe rotar hacia su posición inicial
            else if (this.timeHit >= 0.15) {
                this.controls.getCamera().rotation.z -= Math.PI / 2 * delta;
            }
        }

        // Actualiza los controles y el movimiento del jugador
        this.controls.update(delta * 1000);
    }
}