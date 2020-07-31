class Enemy extends Entity {

    /*
        Constructor
        Entrada:
        - mesh:         Mesh de ThreeJS del enemigo 
        - cannonBody:   Cuerpo de CannonJS
        - type:         Tipo de enemigo
    */
    constructor(mesh, cannonBody, type) {
        super(mesh, cannonBody);
        this.type = type;
        
        // Crea un rayo que estará apuntando hacia el jugador
        this.direction = new THREE.Ray();
        this.direction.origin.set(cannonBody.position.x, cannonBody.position.y, cannonBody.position.z);

        // Si el enemigo es de tipo roller, creara un evento para cuando el enemigo colisione con el jugador, marcando que el jugador fue golpeado
        if (type == 'roller') {
            cannonBody.addEventListener("collide",function(e){
                if (actualScene.player.controls.getCannonBody().id == e.body.id) {
                    actualScene.player.flags.hit = true;
                }
            });
        }

        // Atributos del enemigo
        this.velocity = 0.5;
        this.health = 3;

        // Dirección en la que el enemigo está yendo
        this.dir = {
            x: 0,
            z: 0,
        }
        
        // Guarda los valores de rgb del material del enemigo
        // Esto para cuando el enemigo sea dañado cambiar su color y poder regresar al original
        // Lo inicializamos en 0 porque al momento de crear el enemigo no sea carga el modelo, si no hasta después
        this.meshMaterial = {
            r: 0,
            g: 0,
            b: 0
        };
        this.modelLoaded = false; // Determina si el modelo del enemigo ya se cargó
        
        this.hit = false;         // Determina si el enemigo fue golpeado
        this.damaged = false;     // Determina si el enemigo está mostrando su animación de ser dañado
        
        this.timeElapsed = 0;     // Acumula cuanto tiempo ha pasado desde la última vez que se le disparo al jugador 
        this.timeHit = 0;         // Acumula el tiempo que ha pasado desde que fue golpeado
    }

    /*
        Copia el mesh de otro objeto
        Entrada:
        - enemy: enemigo del cual se copiara el mesh
    */
    copy(enemy) {
        this.mesh = enemy.mesh.clone();
        actualScene.ThreeScene.add(this.mesh);
    }

    /*
        Dispara en la dirección del jugador
    */
    shootPlayer() {
        createBullet(100, this.direction.direction, this.mesh, this.cannonBody.boundingRadius + 1, 'enemy');
    }

    /*
        Calcula en que dirección debe ir para chocar con el jugador
        Entrada:
        - delta: tiempo que ha pasado desde el último frame
    */
    followPlayer(delta) {
        let factorX = (actualScene.player.controls.getObject().position.x - this.cannonBody.position.x);
        let factorZ = (actualScene.player.controls.getObject().position.z - this.cannonBody.position.z);
        this.cannonBody.velocity.x += this.velocity * delta * factorX; 
        this.cannonBody.velocity.z += this.velocity * delta * factorZ;
    }

    /*
        Actualiza la dirección en la que apunta el enemigo
    */
    updateDirection() {
        this.direction.lookAt(actualScene.player.controls.getObject().position);
        this.mesh.lookAt(actualScene.player.controls.getObject().position);

        this.cannonBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), this.mesh.rotation.x);
        this.cannonBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), this.mesh.rotation.y);
        this.cannonBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,0,1), this.mesh.rotation.z);
    }

    /*
        Rota el mesh del enemigo
        Entrada:
        - delta: tiempo que ha pasado desde el último frame
    */
    rotate(delta) {
        this.mesh.rotation.x += this.cannonBody.velocity.z * delta * 0.2;
        this.mesh.rotation.z += this.cannonBody.velocity.x * delta * 0.2;
    }

    /*
        Actualiza la lógica del enemigo
        Entrada:
        - delta: tiempo que ha pasado desde el último frame
    */
    update(delta) {
        this.timeElapsed += delta;

        // Checa si ya se cargó el modelo del enemigo para guardar los valores del color de su material
        if (!this.modelLoaded && this.mesh.children.length == 0) {
            // if (this.type == 'roller') {
            //     this.copy(rollerMesh);
            // } else {
            //     this.copy(shooterMesh);
            // }
            this.meshMaterial = {
                r: this.mesh.children[0].material.color.r,
                g: this.mesh.children[0].material.color.g,
                b: this.mesh.children[0].material.color.b
            };
            this.modelLoaded = true;
        }

        // Checa el tipo de enemigo
        switch(this.type) {
            case 'roller':
                this.rotate(delta);
                this.followPlayer(delta);
                break;
            case 'shooter':
                this.updateDirection();
                
                // Le dispara al jugador cada segundo
                let time = 1;
                if (this.timeElapsed >= time) {
                    this.timeElapsed -= time;
                    this.shootPlayer();
                }
        }
        
        // Checa si fue golpeado
        if (this.hit) {
            this.health--;
            this.hit = false;
            this.damaged = true;

            // Aumenta el score entre 1 y 3
            score += Math.ceil(Math.random() * 3);

            // Checa si el enemigo murió
            // Si sí, lo borra y aumenta el score por 10
            if (this.health <= 0) {
                actualScene.objectsToEliminate.push({obj: this, type: 'enemy'});
                score += 10;
            }

            // Cambia el color del enemigo para mostrar que fue dañado
            this.mesh.children[0].material.color.g = 1;
        }

        // Chcea si el enemigo sigue mostrando que fue dañado
        if (this.damaged) {

            // Checa si ya pasaron 0.3 segundo desde que el enemigo fue dañado
            // Si sí, para la animación de que fue dañado
            this.timeHit += delta;
            if (this.timeHit >= 0.3) {
                this.damaged = false;
                this.timeHit = 0;
                this.mesh.children[0].material.color.g = this.meshMaterial.g;
            }
        }
    }
}