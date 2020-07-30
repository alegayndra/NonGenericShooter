class GameScene {
    constructor(ThreeScene, CannonWorld, name) {
        this.ThreeScene = ThreeScene;
        this.CannonWorld = CannonWorld
        this.name = name;
        this.player = null;

        this.enemies = [];
        this.environment = {
            static: [],
            kinematic: []
        };
        this.bullets = [];

        this.objectsToEliminate = [];

        this.paused = true; 
    }

    addLight(light) {
        this.ThreeScene.add(light);
    }

    addEnvironment(obj, bool) {
        if (bool) {
            this.environment.kinematic.push(obj);
        } else {
            this.environment.static.push(obj);
        }
        this.CannonWorld.addBody(obj.cannonBody);
        this.ThreeScene.add(obj.mesh);
    }

    addEnemy(enem) {
        this.enemies.push(enem)
        this.CannonWorld.addBody(enem.cannonBody);
        this.ThreeScene.add(enem.mesh);
    }

    addPlayer(player) {
        this.player = player;
        this.ThreeScene.add(player.controls.getObject());
    }

    addBullet(bullet) {
        this.bullets.push(bullet);
        this.ThreeScene.add(bullet.mesh);
        this.CannonWorld.addBody(bullet.cannonBody);
    }

    update(delta) {

        if(!this.paused) {
            this.eliminateObjects();
    
            this.CannonWorld.step(delta);
    
            this.player.update(delta);
            this.updatePos();
    
            this.enemies.forEach(enemy => {
                enemy.update(delta);
            });
        }

    }

    disposeGeometries(child) {
        if (child.geometry) {
            child.geometry.dispose();
        }
        if (child.material) {
            child.material.dispose();
        }
        child.children.forEach(c => {
            this.disposeGeometries(c);
        });
    }

    disposeObj(obj) {
        const object = this.ThreeScene.getObjectByProperty( 'uuid', obj.mesh.uuid );

        if (object) {
            this.disposeGeometries(object);
            
            this.ThreeScene.remove(object);
            this.CannonWorld.remove(obj.cannonBody);
        }

    }

    eliminateObjects() {
        if (this.objectsToEliminate.length > 0) {
            this.objectsToEliminate.forEach(pos => {
                this.disposeObj(pos.obj);
                switch(pos.type) {
                    case 'bullet':
                        this.bullets = this.bullets.filter(arr => pos.obj !== arr);
                        break;
                    case 'enemy':
                        this.enemies = this.enemies.filter(arr => pos.obj !== arr);
                        break;
                    case 'kinematic':
                        this.environment.kinematic = this.environment.kinematic.filter(arr => pos.obj !== arr);
                        break;
                    case 'static':
                        this.environment.static = this.environment.static.filter(arr => pos.obj !== arr);
                        break;
                }
            });
            renderer.renderLists.dispose();
            this.objectsToEliminate = [];
        }
    }

    updatePos() {
        this.enemies.forEach(enemy => {
            enemy.updatePos();
        });

        this.bullets.forEach(bullet => {
            bullet.updatePos();
        });

        this.environment.kinematic.forEach(obj => {
            obj.updatePos();
        });
    }
}