// All sound effects and audio unlocking
const sounds = {
  error: new Audio("sounds/error.wav"),
  serror: new Audio("sounds/serror.wav"),
  click: new Audio("sounds/click.wav"),
  imported: new Audio("sounds/imported.wav"),
  success: new Audio("sounds/success.wav"),
  updateBar: new Audio("sounds/updateBar.wav"),
  task1: new Audio("sounds/task1.wav"),
  task2: new Audio("sounds/task2.wav"),
  task3: new Audio("sounds/task3.wav"),
  countDown: new Audio("sounds/countdown.wav"),
  ach: new Audio("sounds/ach.wav")
};

const THUNDER = [

    new Audio("sounds/thunder1.wav"),

    new Audio("sounds/thunder2.wav"),

    new Audio("sounds/thunder3.wav")

];

const BOSS_CHALLENGE_MUSIC = new Audio("sounds/suspance.wav");
const BOSS_FIGHT_MUSIC   = new Audio("sounds/fight.wav");
const BOSS_PAUSE_MUSIC   = new Audio("sounds/pausedBoss.mp3");
const BOSS_DEFEAT_MUSIC = new Audio("sounds/bossDefeat.mp3");

BOSS_CHALLENGE_MUSIC.loop = true;
BOSS_FIGHT_MUSIC.loop = true;
BOSS_PAUSE_MUSIC.loop = true;

const taskSounds = [sounds.task1, sounds.task2, sounds.task3];

function playRandomTaskSound() {
  const sound = taskSounds[Math.floor(Math.random() * taskSounds.length)];
  
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

function stopAllSounds() {
  Object.values(sounds).forEach(sound => {
    sound.pause();
    sound.currentTime = 0;
  });
}

function playSound(name, priority = false) {
  let sound = sounds[name];
  if (!sound) return;

  if (priority) {
    stopAllSounds();
  }

  sound.currentTime = 0;

  let p = sound.play();
  if (p !== undefined) {
    p.catch(() => {});
  }
}

Object.values(sounds).forEach(sound => {
  sound.preload = "auto";
});


function getAllAudioInstances() {
    const all = [];

    // From the sounds object
    for (const key in sounds) {
        all.push(sounds[key]);
    }

    // Thunder sounds (array)
    THUNDER.forEach(s => all.push(s));

    // Boss music
    all.push(BOSS_CHALLENGE_MUSIC, BOSS_FIGHT_MUSIC,BOSS_DEFEAT_MUSIC);

    return all;
}

function refreshBossMusic() {
    if (!audioUnlocked) return; // only play if audio is unlocked

    let player;

    try {
        player = loadPlayer();
    } catch (error) {
        console.error("Failed to load player:", error);
        player = {};
    }

    // Stop everything first to avoid overlapping tracks
    stopAllBossMusic();

    if (player.bossChallenge) {
        // Challenge music
        BOSS_CHALLENGE_MUSIC.currentTime = 0;
        BOSS_CHALLENGE_MUSIC.play().catch(() => {});
    } else if (player.activeBoss && player.activeBoss.state === "fighting") {
        // Fight music
        BOSS_FIGHT_MUSIC.currentTime = 0;
        BOSS_FIGHT_MUSIC.play().catch(() => {});
    } else if (player.activeBoss) {
        // Fight music
        BOSS_PAUSE_MUSIC.currentTime = 0;
        BOSS_PAUSE_MUSIC.play().catch(() => {});
    }
    // If neither, music stays stopped
}



let audioUnlocked = false;

function unlockAudio() {
    if (audioUnlocked) return;

    // Unlock all audio instances
    const allAudio = getAllAudioInstances();
    allAudio.forEach(sound => {
        sound.play()
            .then(() => {
                sound.pause();
                sound.currentTime = 0;
            })
            .catch(() => {}); // ignore autoplay errors
    });

    audioUnlocked = true;

    // Remove listeners
    window.removeEventListener("click", unlockAudio);
    window.removeEventListener("keydown", unlockAudio);
    window.removeEventListener("touchstart", unlockAudio);
    
    refreshBossMusic();
}

window.addEventListener("click", unlockAudio, { once: true });
window.addEventListener("keydown", unlockAudio, { once: true });
window.addEventListener("touchstart", unlockAudio, { once: true });

function setupAudioUnlock() {
    const unlock = () => {
        const silent = new Audio();
        silent.volume = 0;
        silent.play().then(() => silent.pause()).catch(() => {});

        if (window.audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }

        document.removeEventListener('click', unlock);
        document.removeEventListener('touchstart', unlock);
    };

    document.addEventListener('click', unlock, { once: true });
    document.addEventListener('touchstart', unlock, { once: true });
}

setupAudioUnlock();
