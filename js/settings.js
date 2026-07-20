function requestStartMusic(){
    let bossData = getLocalStorage('bossData');
    
    if (!bossData.activeBoss) {
        showError("Currently No Boss Fight Is Ongoing...");
        return
    }
    
    refreshBossMusic();
}

function requestStopMusic(){
    let bossData = getLocalStorage('bossData');
    
    if (!bossData.activeBoss) {
        showError("Currently No Boss Fight Is Ongoing...");
        return
    }
    
    stopAllBossMusic();
}

function updateSlider(slider) {

    const percent =
        ((slider.value - slider.min) / (slider.max - slider.min)) * 100;

    const start = getComputedStyle(slider)
        .getPropertyValue("--start-color");

    const end = getComputedStyle(slider)
        .getPropertyValue("--end-color");

    slider.style.background = `
        linear-gradient(
            to right,
            ${start} 0%,
            ${end} ${percent}%,
            white ${percent}%,
            white 100%
        )
    `;
}

// ==========================
// Load saved volumes
// ==========================

let musicVolume = Number(localStorage.getItem("musicVolume") ?? 100);
let sfxVolume = Number(localStorage.getItem("sfxVolume") ?? 100);


// ==========================
// Sliders
// ==========================

const musicSlider = document.getElementById("musicSlider");
const sfxSlider = document.getElementById("sfxSlider");

const musicValue = document.getElementById("musicValue");
const sfxValue = document.getElementById("sfxValue");

musicSlider.value = musicVolume;
sfxSlider.value = sfxVolume;

musicValue.textContent = musicVolume + "%";
sfxValue.textContent = sfxVolume + "%";


// ==========================
// Apply Music Volume
// ==========================

function applyMusicVolume(value){

    musicVolume = Number(value);

    localStorage.setItem("musicVolume", musicVolume);

    const volume = musicVolume / 100;

    BOSS_CHALLENGE_MUSIC.volume = volume;
    BOSS_FIGHT_MUSIC.volume = volume;
    BOSS_DEFEAT_MUSIC.volume = volume;

    musicValue.textContent = musicVolume + "%";

    updateSlider(musicSlider);

}


// ==========================
// Apply SFX Volume
// ==========================

function applySFXVolume(value){

    sfxVolume = Number(value);

    localStorage.setItem("sfxVolume", sfxVolume);

    const volume = sfxVolume / 100;

    Object.values(sounds).forEach(sound=>{
        sound.volume = volume;
    });

    THUNDER.forEach(sound=>{
        sound.volume = volume;
    });

    sfxValue.textContent = sfxVolume + "%";

    updateSlider(sfxSlider);

}


// ==========================
// Slider Events
// ==========================

musicSlider.addEventListener("input",function(){

    applyMusicVolume(this.value);

});

sfxSlider.addEventListener("input",function(){

    applySFXVolume(this.value);

});


// ==========================
// Apply saved values on startup
// ==========================

applyMusicVolume(musicVolume);
applySFXVolume(sfxVolume);