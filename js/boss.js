const bossCont = document.getElementById("bossCont");

const STORAGE_NAME = "bossData";

const MIN_STREAK = 0;
const SPAWN_RATE = 20;
const MAX_CHANCE = 100;
const DAMAGE_INTERVAL = 400;
const HEAL_INTERVAL = 800;


const BOSSES = {
    normal: {
        id: "normal",
        title: "Boss",
        className: "normal-boss-cont",
        hp: 12000,

        xpBonus: 1.15,
        ppBonus: 1.20,

        image: "boss.png",
        unlockAfter: 2
    },

    elite: {
        id: "elite",
        title: "Elite Boss",
        className: "elite-boss-cont",
        hp: 18000,

        xpBonus: 1.50,
        ppBonus: 1.60,

        image: "elite.png",
        unlockAfter: 2
    },

    legend: {
        id: "legend",
        title: "Legend Boss",
        className: "legend-boss-cont",
        hp: 25200,

        xpBonus: 2.00,
        ppBonus: 2.30,

        image: "legend.png",
        unlockAfter: 2
    }
};

const DEFAULT_PLAYER = {

    activeBoss: null,

    bossChallenge: null,

    streakUntilBoss: 0,

    xp: 0,
    pp: 0,
    level: 1,

    bossKills:{
        normal:0,
        elite:0,
        legend:0
    }

};

// --- Boss Emoji Map ---
const BOSS_EMOJI = {
    normal: "👾",
    elite: "🐉",
    legend: "💀"
};

function sleep(ms){

    return new Promise(resolve=>{

        setTimeout(resolve,ms);

    });

}

function chance(percent) {
    return Math.random() * 100 < percent;
}

function getScrollContainer() {
    // Return the currently active page (the one with overflow-y: auto)
    return document.querySelector('.page.activePage');
}

function disableScrolling() {
    const container = document.querySelector('.page.activePage');
    if (!container) return;
    container.dataset.originalOverflow = container.style.overflow || '';
    container.style.overflow = 'hidden';
    // Optionally prevent pointer events to block clicks
    container.style.pointerEvents = 'none';
}

function enableScrolling() {
    const container = document.querySelector('.page.activePage');
    if (!container) return;
    container.style.overflow = container.dataset.originalOverflow || '';
    container.style.pointerEvents = '';
    delete container.dataset.originalOverflow;
}

function scrollContainerToTop() {
    return new Promise((resolve) => {
        const container = getScrollContainer();
        if (!container || container.scrollTop === 0) {
            resolve();
            return;
        }

        const onScrollEnd = () => {
            container.removeEventListener('scrollend', onScrollEnd);
            resolve();
        };

        container.addEventListener('scrollend', onScrollEnd, { once: true });
        container.scrollTo({ top: 0, behavior: 'smooth' });

        // Fallback for browsers that don’t support 'scrollend' on elements
        setTimeout(() => {
            container.removeEventListener('scrollend', onScrollEnd);
            resolve();
        }, 1000);
    });
}

function scrollToBoss(){

    bossCont.scrollIntoView({

        behavior:"smooth",

        block:"center"

    });

}

function scrollElementToCenter(element) {
    const container = getScrollContainer();
    if (!container || !element) return;

    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    // Position relative to the container's content area
    const elementCenter = elementRect.top - containerRect.top + container.scrollTop + elementRect.height / 2;
    const containerCenter = container.clientHeight / 2;

    const targetScrollTop = elementCenter - containerCenter;

    container.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
}

function scrollBossToCenter(card) {
    if (!card) return;
    const container = getScrollContainer();
    if (!container) return;

    const rect = card.getBoundingClientRect();
    // container.getBoundingClientRect().top is the offset from the viewport top
    const containerTop = container.getBoundingClientRect().top;
    const top = container.scrollTop + rect.top - containerTop - (container.clientHeight / 2) + (rect.height / 2);

    container.scrollTo({ top, behavior: 'smooth' });
}

function clearBoss() {
    bossCont.innerHTML = "";
}

function playChallengeMusic() {
    BOSS_CHALLENGE_MUSIC.currentTime = 0;
    BOSS_CHALLENGE_MUSIC.play().catch(e => console.log("Music play blocked:", e));
}

function stopChallengeMusic() {
    BOSS_CHALLENGE_MUSIC.pause();
    BOSS_CHALLENGE_MUSIC.currentTime = 0;
}



function playFightMusic() {
    BOSS_FIGHT_MUSIC.currentTime = 0;
    BOSS_FIGHT_MUSIC.play().catch(e => console.log("Music play blocked:", e));
}

function playCalmMusic() {
    BOSS_DEFEAT_MUSIC.currentTime = 0;
    BOSS_DEFEAT_MUSIC.play().catch(e => console.log("Coyldnt play:", e));
}

function stopCalmMusic() {
    BOSS_DEFEAT_MUSIC.pause();
    BOSS_DEFEAT_MUSIC.currentTime = 0;
}

function playPauseMusic() {
    BOSS_PAUSE_MUSIC.currentTime = 0;
    BOSS_PAUSE_MUSIC.play().catch(e => console.log("Couldnt play Music:", e));
}

function stopPauseMusic() {
    BOSS_PAUSE_MUSIC.pause();
    BOSS_PAUSE_MUSIC.currentTime = 0;
}


function stopFightMusic() {
    BOSS_FIGHT_MUSIC.pause();
    BOSS_FIGHT_MUSIC.currentTime = 0;
}

// Stop all music (for safety)
function stopAllBossMusic() {
    stopChallengeMusic();
    stopFightMusic();
    stopCalmMusic();
    stopPauseMusic();
}

function startBossEncounterMode() {
    document.body.classList.add("boss-encounter-active");
}

function endBossEncounterMode() {
    document.body.classList.remove("boss-encounter-active");
}

async function playBossEncounter() {
    const encounter = document.getElementById("bossEncounter");
    const dark = document.getElementById("darkOverlay");
    const flash = document.getElementById("flashOverlay");
    const lightning = document.getElementById("lightning");
    const redGlow = document.getElementById("redGlow");

    // Cancel all animations and reset opacities
    [encounter, dark, flash, redGlow, lightning].forEach(el => {
        if (!el) return;
        el.getAnimations().forEach(a => a.cancel());
        el.style.opacity = '0';
    });

    startBossEncounterMode();
    disableScrolling();

    encounter.style.opacity = '1';

    // Dark overlay fades in
    dark.animate(
        [{ opacity: 0 }, { opacity: 0.75 }],
        { duration: 700, fill: "forwards" }
    );

    await sleep(700);

    // Lightning flashes (5 times)
    for (let i = 0; i < 5; i++) {
        flash.animate(
            [{ opacity: 1 }, { opacity: 0 }],
            { duration: 100, fill: "forwards" }
        );
        lightning.animate(
            [{ opacity: 1 }, { opacity: 0 }],
            { duration: 100, fill: "forwards" }
        );

        redGlow.animate(
            [
                { opacity: 0.15 },
                { opacity: 0.55 },
                { opacity: 0.15 }
            ],
            { duration: 500 }
        );

        playThunder();
        await sleep(80);
        await sleep(250 + Math.random() * 450);
    }

    await sleep(900);

    // Fade out both dark overlay and the boss intro container
    dark.animate(
        [{ opacity: 0.75 }, { opacity: 0 }],
        { duration: 700, fill: "forwards" }
    );
    encounter.animate(
        [{ opacity: 1 }, { opacity: 0 }],
        { duration: 700, fill: "forwards" }
    );

    await sleep(700);

    enableScrolling();
    endBossEncounterMode();
}

function shakeScreen(duration=600){

    document.body.animate(

        [

            {transform:"translate(0,0)"},

            {transform:"translate(-6px,3px)"},

            {transform:"translate(6px,-5px)"},

            {transform:"translate(-4px,-3px)"},

            {transform:"translate(0,0)"}

        ],

        {

            duration,

            iterations:6

        }

    );

}

function playThunder(){

    const sound =
    THUNDER[Math.floor(Math.random()*THUNDER.length)];

    sound.currentTime = 0;

    sound.volume = .5;

    sound.play();

    shakeScreen();

}

function bossCountdown(seconds = 5) {
    return new Promise((resolve) => {
        const p = document.createElement('p');
        p.textContent = "The Boss Is Coming...\nTap To Unlock Sounds!";
        const countdown = document.createElement("div");
        countdown.id = "bossCountdown";
        countdown.textContent = seconds;
        countdown.appendChild(p);
        document.body.appendChild(countdown);
        
        

        let current = seconds;
        playSound('countDown', true);
        const tick = () => {
            current--;
            if (current <= 0) {
                countdown.remove();
                resolve();
                setTimeout(()=>{
                    playFightMusic();
                },200);
                return;
            }

            countdown.textContent = current;
            countdown.appendChild(p);
            setTimeout(tick, 1000);
        };

        setTimeout(tick, 1000);
    });
}

function createUnlockWindow() {
    const old = document.querySelector('.sound-box');
    if (old) old.remove();

    // Create the box
    const soundBox = document.createElement('div');
    soundBox.className = 'sound-box';
    soundBox.textContent = '🖱️ Tap To Unlock Audio';
    document.body.appendChild(soundBox);

    const unlockOnAnyClick = function(e) {
        const box = document.querySelector('.sound-box');
        if (box) {
            box.remove();
            unlockAudio();
        }
        
        document.removeEventListener('click', unlockOnAnyClick);
        document.removeEventListener('touchstart', unlockOnAnyClick);
    };

    document.addEventListener('click', unlockOnAnyClick);
    document.addEventListener('touchstart', unlockOnAnyClick);
}

function calculateBossReward(boss) {

    // How long the boss lasts (seconds)
    const studyTime = boss.hp / 2.5; // because HP drops by 1 every 400ms

    let xpfactor;
    if (studyTime >= 3000) xpfactor = 0.2;
    else if (studyTime >= 1800) xpfactor = 0.194;
    else xpfactor = 0.166;

    let ppfactor;
    if (studyTime >= 3000) ppfactor = 0.9;
    else if (studyTime >= 1800) ppfactor = 0.889;
    else ppfactor = 0.834;

    const xp = Math.round(studyTime * xpfactor * boss.xpBonus);
    const pp = Math.round(studyTime * ppfactor * boss.ppBonus);

    return { xp, pp };
}

// --- Local Storage Helpers ---
function savePlayer(player) {
    localStorage.setItem(STORAGE_NAME, JSON.stringify(player));
}

function loadPlayer() {
    const save = localStorage.getItem(STORAGE_NAME);
    if (!save) {
        savePlayer(DEFAULT_PLAYER);
        return structuredClone(DEFAULT_PLAYER);
    }
    return JSON.parse(save);
}

// --- Boss Spawning Logic ---
function createBossRequestBox(type){

    clearBoss();
    
    stopAllBossMusic();
    
    playChallengeMusic();    

    const boss = BOSSES[type];

    const emoji = BOSS_EMOJI[type];

    const card = document.createElement("div");

    card.className = "boss-request-card";
    
    const reward = calculateBossReward(boss);

    card.innerHTML = `

        <div class="challenge-icon">

            ${emoji}

        </div>

        <h2>${boss.title}</h2>

        <p>A mysterious enemy wants to challenge you.</p>

        <hr>

        <p>❤️ HP : ${boss.hp}</p>

        <p>⭐ XP : ${reward.xp}</p>

        <p>🪙 PP : ${reward.pp}</p>

        <div class="challenge-buttons">

            <button class="accept-btn">

                ⚔ Accept Challenge

            </button>

            <button class="dismiss-btn">

                ❌ Dismiss

            </button>

        </div>

    `;

    bossCont.append(card);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            scrollElementToCenter(card);
        });
    });

    //-----------------------
    // Accept
    //-----------------------

    card.querySelector(".accept-btn").onclick = async () => {
        await acceptBossChallenge();
    };

    //-----------------------
    // Dismiss
    //-----------------------

    card.querySelector(".dismiss-btn").onclick = ()=>{

        dismissBossChallenge();

    };

}

async function acceptBossChallenge() {
    const player = loadPlayer();
    if (!player.bossChallenge) return;

    const bossType = player.bossChallenge;
    const boss = BOSSES[bossType];

    alert(`${boss.title} challenge accepted! Get ready...`);

    // --- Switch music ---
    stopAllBossMusic();
    createUnlockWindow();

    player.activeBoss = {
        id: bossType,
        hp: boss.hp,
        maxHp: boss.hp,
        state: "fighting",
        lastUpdated: Date.now()
    };
    player.bossChallenge = null;
    savePlayer(player);

    clearBoss();

    await scrollContainerToTop();
    await bossCountdown(5);
    spawnBoss(player.activeBoss);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            const card = document.querySelector(".boss-card");
            scrollBossToCenter(card);
        });
    });
}

function dismissBossChallenge() {
    const player = loadPlayer();
    player.bossChallenge = null;
    savePlayer(player);
    clearBoss();

    stopChallengeMusic();
}





async function rollBossSpawn(){

    const player = loadPlayer();

    if(player.activeBoss){
        alert("Finish your current boss first!");
        return;
    }

    if(player.bossChallenge){
        return;
    }

    if(player.streakUntilBoss < MIN_STREAK){

        player.streakUntilBoss++;

        savePlayer(player);

        return;
    }

    const spawnChance = Math.min(
        player.streakUntilBoss * SPAWN_RATE,
        MAX_CHANCE
    );

    if(chance(spawnChance)){

        player.streakUntilBoss = 0;

        const bossType = chooseBoss(player);

        player.bossChallenge = bossType;

        savePlayer(player);

        await playBossEncounter();

        createBossRequestBox(bossType);

    }
    else{

        player.streakUntilBoss++;

        savePlayer(player);

    }

}

function chooseBoss(player) {

    // Chance grows with boss kills AND player level
    const eliteChance = Math.min(
        player.bossKills.normal * 10 + player.level * 2,
        100
    );

    const legendChance = Math.min(
        player.bossKills.elite * 15 + player.level,
        100
    );

    // Try to spawn a Legendary first
    if (chance(legendChance)) {
        player.bossKills.elite = 0;
        return "legend";
    }

    // Otherwise try to spawn an Elite
    if (chance(eliteChance)) {
        player.bossKills.normal = 0;
        return "elite";
    }

    // Otherwise spawn a Normal boss
    return "normal";
}

function updateBossHP(activeBoss) {

    const now = Date.now();
    const elapsed = now - activeBoss.lastUpdated;

    if (activeBoss.state === "fighting") {

        const damage = Math.floor(elapsed / DAMAGE_INTERVAL);

        if (damage > 0) {
            activeBoss.hp -= damage;
            activeBoss.lastUpdated += damage * DAMAGE_INTERVAL;
        }

    } else if (activeBoss.state === "paused") {

        const heal = Math.floor(elapsed / HEAL_INTERVAL);

        if (heal > 0) {
            activeBoss.hp += heal;
            activeBoss.lastUpdated += heal * HEAL_INTERVAL;
        }

    }

    if (activeBoss.hp < 0)
        activeBoss.hp = 0;

    if (activeBoss.hp > activeBoss.maxHp)
        activeBoss.hp = activeBoss.maxHp;
}


// --- Spawn Boss Card with Auto-Drain & Particles ---
function spawnBoss(activeBoss) {
    clearBoss();
    
    setTimeout(() => refreshBossMusic(), 100);

    const boss = BOSSES[activeBoss.id];
    const emoji = BOSS_EMOJI[activeBoss.id] || "👾";
    const currentHp = activeBoss.hp;
    const maxHp = activeBoss.maxHp;

    const card = document.createElement("div");
    card.className = `boss-card ${boss.className}`;
    card.dataset.bossType = activeBoss.id;
    card.dataset.currentHp = currentHp;
    card.dataset.maxHp = maxHp;
    
    const reward = calculateBossReward(boss);
    card.innerHTML = `
        <div class="boss-icon-wrap">
            <span class="boss-emoji">${emoji}</span>
        </div>
        <div class="boss-details">
            <h2 class="boss-name">${boss.title}</h2>
            <div class="boss-hp-info">
                <span class="hp-label">❤️ HP</span>
                <span class="hp-values">${currentHp} / ${maxHp}</span>
            </div>
            <div class="boss-hp-container">
                <div class="boss-hp-fill" style="width: ${(currentHp / maxHp) * 100}%;"></div>
            </div>
            <p class="boss-regen-text">
    💓 Regenerating...
</p>
            <ul class="boss-stats-list">
                <li>⭐ <strong>${reward.xp}</strong> XP</li>
                <li>🪙 <strong>${reward.pp}</strong> PP</li>
            </ul>
        </div>
    `;

    bossCont.append(card);
    
    let bossPauseBtn = document.createElement("button");

bossPauseBtn.className = "boss-pause-btn";

bossPauseBtn.textContent = activeBoss.state === "paused"
    ? "⚔️ Resume Fight"
    : "♻️ Pause Fight";

bossCont.appendChild(bossPauseBtn);
    
    const regenText = card.querySelector(".boss-regen-text");
    
    let audioUnlocked = false;
    
    if (activeBoss.state === "paused") {

        regenText.classList.add("show");
        bossPauseBtn.textContent = "⚔️ Resume Fight";
        bossPauseBtn.classList.add("paused");

    }
    
    bossPauseBtn.onclick = () => {

    const player = loadPlayer();

    if (!player.activeBoss)
        return;

    updateBossHP(player.activeBoss);

    if (player.activeBoss.state === "fighting") {

        player.activeBoss.state = "paused";

        bossPauseBtn.textContent = "⚔️ Resume Fight";
        bossPauseBtn.classList.add("paused");
        regenText.classList.add("show");
        stopAllBossMusic();
        playPauseMusic();

    } else {

        player.activeBoss.state = "fighting";

        bossPauseBtn.textContent = "♻️ Pause Fight";
        bossPauseBtn.classList.remove("paused");
        regenText.classList.remove("show");
        stopAllBossMusic();
        playFightMusic();

    }

    player.activeBoss.lastUpdated = Date.now();

    savePlayer(player);

};

    const drainInterval = setInterval(() => {

    const player = loadPlayer();

    if (!player.activeBoss)
        return;

    updateBossHP(player.activeBoss);

    savePlayer(player);

    const current = player.activeBoss.hp;
    const max = player.activeBoss.maxHp;
    
    if (
        player.activeBoss.state === "paused" &&
        current < max
    ) {
        regenText.classList.add("show");
    } else {
        regenText.classList.remove("show");
    }

    card.dataset.currentHp = current;
    card.dataset.maxHp = max;

    const fill = card.querySelector(".boss-hp-fill");
    const percent = (current / max) * 100;

    fill.style.width = percent + "%";

    card.querySelector(".hp-values").textContent =
        `${current} / ${max}`;

    if (percent < 25) {

        fill.style.background =
            "linear-gradient(90deg,#cc0000,#ff4444)";

    } else {

        fill.style.background =
            "linear-gradient(90deg,#ff3366,#ffcc00)";

    }

    if (!audioUnlocked && current <= 10) {
        createUnlockWindow();
        audioUnlocked = true;
    }

    if (current <= 0) {

        clearInterval(drainInterval);
        clearInterval(card._particleInterval);

        card.style.animation =
            "bossDeath 1s ease-in forwards";

        card.addEventListener("animationend", () => {

            if (card.parentNode) {

                rewardAndClearBoss(player.activeBoss.id);

                card.remove();
                bossPauseBtn.remove();

            }

        }, { once: true });

    }

}, 100);

    const particleInterval = setInterval(() => {
        const current = parseInt(card.dataset.currentHp);
        if (current <= 0) {
            clearInterval(particleInterval);
            return;
        }
        createHpParticleBurst(card);
    }, 1000);

    card._drainInterval = drainInterval;
    card._particleInterval = particleInterval;
}

// --- Particle Burst Generator (FALLING from HP bar edge) ---
function createHpParticleBurst(card) {
    const container = card.querySelector(".boss-hp-container");
    const fill = card.querySelector(".boss-hp-fill");
    if (!container || !fill) return;

    const percent = parseFloat(fill.style.width) || 100;
    const count = 10 + Math.floor(Math.random() * 10); // 4–6 particles

    for (let i = 0; i < count; i++) {
        const delay = Math.random() * 0.15; // slight stagger
        setTimeout(() => {
            const particle = document.createElement("span");
            particle.className = "hp-particle";
            particle.style.left = percent + "%";
            particle.style.top = "0px";
            // Random horizontal jitter (CSS custom property)
            const jitter = (Math.random() - 0.5) * 6; // -3px to +3px
            particle.style.setProperty('--jitter', jitter + 'px');
            container.appendChild(particle);
            particle.addEventListener("animationend", () => particle.remove());
        }, delay * 1000);
    }
}

// --- Reward & Cleanup after Auto-Death ---
function rewardAndClearBoss(type) {
    let playerState = getLocalStorage('playerState');
    const player = loadPlayer();
    const boss = BOSSES[type];
    
    
    const ellapsedTime = boss.hp * 400;
    playerState[`${boss.id}BossDefeated`] = true;
    
    player.bossKills[type]++;
    player.activeBoss = null;
    
    
    playerState.bossDefeatCount++;
    
    let time = milisecConverter(Math.floor(boss.hp/3.33333)*1000);
    
    let studyTimeInSec = Number(time.hour) * 3600 + Number(time.min) * 60 + Number(time.sec);
    
    
    
    const levelUpData = {
        objectFor: 'stopwatch',
        startedAt: new Date(),
        isRunning: false,
        isPaused: false,
        startTime: Date.now(),
        
        linkedTodoId: null,

        subjectTxt: boss.id.toUpperCase() + ' Boss',

        topicTxt: 'Boss Fight Type',
        bossType: boss.id,
        xpBonus: boss.xpBonus,
        ppBonus: boss.ppBonus,

        xpEarned: 0,
        ppEarned: 0,    
        studyTime: studyTimeInSec
    };
    
    setLocalStorage('stopwatch', levelUpData);
    levelUp(ellapsedTime);
    createTaskList(getLocalStorage('stopwatch'));
    setLocalStorage('playerState', playerState);    
    checkAch();
    savePlayer(player);
    scrollContainerToTop();
    stopFightMusic();
    showError("Congrats! Boss Defeated!🔱");
    setTimeout(()=>{
        playCalmMusic();
    }, 200);
    deleteObject("stopwatch");
}

function restoreBossUI() {
    const player = loadPlayer();

    if (player.bossChallenge) {
        createBossRequestBox(player.bossChallenge);
    } else if (player.activeBoss) {
        spawnBoss(player.activeBoss);
        
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const card = document.querySelector(".boss-card");
                if (card) scrollBossToCenter(card);
            });
        });
    } else {
        clearBoss();
        stopAllBossMusic();
    }

    refreshBossMusic();
}

document.addEventListener('visibilitychange',()=>{
    if (document.hidden) {
        stopAllBossMusic();
    }else{
        refreshBossMusic();
    }
});

window.addEventListener("load", restoreBossUI);