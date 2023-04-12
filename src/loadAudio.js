const musicPath = './sounds/music/village_music.wav';

async function loadSound(path, soundObj, loop, volume) {
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load( path, function( buffer ) {
    soundObj.setBuffer( buffer );
    soundObj.setLoop( loop );
    soundObj.setVolume( volume );
    // soundObj.play();
  });
}

async function loadSounds() {
  loadSound(musicPath, backgroundMusic, true, 0.05);
}
