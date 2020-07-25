class Loot {
    constructor(mesh, health) {
        this.mesh = mesh;
        this.health = health;
    }

    //creates  the animitaion if it exists
    openChest() {
        var mesh;

        // Create an AnimationMixer, and get the list of AnimationClip instances
        let mixer = new THREE.AnimationMixer(mesh);
        let clips = mesh.animations;

        // Update the mixer on each frame
        function update() {
            mixer.update(deltaSeconds);
        }

        // Play a specific animation
        let clip = THREE.AnimationClip.findByName(clips, 'dance');
        let action = mixer.clipAction(clip);
        action.play();

        // Play all animations
        clips.forEach(function (clip) {
            mixer.clipAction(clip).play();
        });
    }

}