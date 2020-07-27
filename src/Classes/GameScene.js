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

        this.CannonWorld.step(delta);
        this.player.update(delta);
        this.updatePos();
    }

    updatePos() {
        this.enemies.forEach(enemy => {
            enemy.updatePos();
        });

        this.bullets.forEach(bullet => {
            // bullet.updatePos();
            bullet.mesh.position.copy(bullet.cannonBody.position);
        });

        this.environment.kinematic.forEach(obj => {
            obj.updatePos();
        });
    }
}