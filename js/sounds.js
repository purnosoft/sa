// All sound effects and audio unlocking
const sounds = {
  error: new Audio("../sounds/error.wav"),
  serror: new Audio("../sounds/serror.wav"),
  click: new Audio("../sounds/click.wav"),
  imported: new Audio("../sounds/imported.wav"),
  success: new Audio("../sounds/success.wav"),
  updateBar: new Audio("../sounds/updateBar.wav"),
  task1: new Audio("../sounds/task1.wav"),
  task2: new Audio("../sounds/task2.wav"),
  task3: new Audio("../sounds/task3.wav"),
  ach: new Audio("../sounds/ach.wav")
};

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

let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked) return;
  Object.values(sounds).forEach(sound => {
    sound.play()
      .then(() => {
        sound.pause();
        sound.currentTime = 0;
      })
      .catch(() => {});
  });
  audioUnlocked = true;
  window.removeEventListener("click", unlockAudio);
  window.removeEventListener("keydown", unlockAudio);
  window.removeEventListener("touchstart", unlockAudio);
}

window.addEventListener("click", unlockAudio, { once: true });
window.addEventListener("keydown", unlockAudio, { once: true });
window.addEventListener("touchstart", unlockAudio, { once: true });