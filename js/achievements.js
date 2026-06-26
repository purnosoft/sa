// Achievements page
const achievements = [
  { icon: "🚀", title: "First Launch", desc: "Complete your very first Task with style.", tier: "bronze", unlocked: false, unlockDate: null, progressText: "Lets Give It A Try! 0/1 Remains!", code: 1},
  { icon: "🔥", title: "7-Day Streak", desc: "Stay active for seven consecutive days. The fire is real!", tier: "gold", unlocked: false, unlockDate: null, progressText: "On A 0/7 Highest Streak!", code: 2 },
  { icon: "🌙", title: "Night Owl", desc: "Complete 10 Study Tasks After Midnight. Feel Sleepy Now?", tier: "gold", unlocked: false, unlockDate: null, progressText: "0/10 Task Remains", code: 3 },
  { icon: "🎯", title: "Sharpshooter", desc: "Study 5 Times Without Ever Pressing Pause Buttons. No Breake All Gain!", tier: "platinum", unlocked: false, unlockDate: null, progressText: "No Pressing, 0/5 To Go..", code: 4 },
  { icon: "🏔️", title: "Peak Performer", desc: "Complete 5 Studies Each Having Minimum 50 min In A Day ! Is That Even Possible?", tier: "platinum", unlocked: false, unlockDate: null, progressText: " 0 / 5 Impossible Task Remains", code: 5 },
  { icon: "🧩", title: "Brain Stormer", desc: "Do A 120 Minutes Task Using Stopwatch", tier: "silver", unlocked: false, unlockDate: null, progressText: "What Are You Waiting For?", code: 6},
  { icon: "🎁", title: "Lucky Streak", desc: "Open 3 Rewards in a single day. Fortune favors you!", tier: "bronze", unlocked: false, unlockDate: null, progressText: "0/3 Easy Right?", code: 7 },
  { icon: "⚡", title: "Speed Demon", desc: "Study For A Straight 3 Hours (Stopwatch Mode Required). Blink and you'll miss it.", tier: "gold", unlocked: false, progressText: "Keep pushing…", unlockDate: null, code: 8},
  { icon: "🛡️", title: "Iron Will", desc: "Complete 50 Task In Total. Unstoppable!", tier: "platinum", unlocked: false, progressText: "0/50 Run In Total", code: 9},
  { icon: "🎪", title: "Completionist", desc: "Unlock every other achievement. The final frontier.", tier: "platinum", unlocked: false, progressText: "0 / max achievements", code: 10 },
  { icon: "🧙", title: "Secret Keeper", desc: "Discover a hidden easter egg. Shhh… it's a secret sound.", tier: "gold", unlocked: false, progressText: "???", code: 11 },
  { icon: "📑", title: "Active Planer", desc: "Complete 7 Tasks From To Do List", tier: "gold", unlocked: false, progressText: "0/7 Plans Completed...", code: 12 }
];

let activeFilter = "all";

// ── QUEUE SYSTEM ─────────────────────────────
let notificationQueue = [];
let activeToast = null;
let activeDismissTimeout = null;

const grid = document.getElementById("achievementsGrid");
const filterSlider = document.getElementById("filterSlider");
const unlockedCountEl = document.getElementById("unlockedCount");
const totalCountEl = document.getElementById("totalCount");
const progressFill = document.getElementById("progressFill");
const progressPercent = document.getElementById("progressPercent");
const scrollLeftBtn = document.getElementById("scrollLeft");
const scrollRightBtn = document.getElementById("scrollRight");
const notificationContainer = document.getElementById("notification-container");

grid.addEventListener('click', (e)=>{
    let card = e.target.closest('.achievement-card');
    
    if (card) {
        playSound('click');
    }
});

const filterTags = [
  { value: "all", label: "🏅 All" },
  { value: "unlocked", label: "⭐ Unlocked" },
  { value: "locked", label: "🔒 Locked" },
  { value: "gold", label: "🥇 Gold" },
  { value: "platinum", label: "💎 Platinum" }
];

function buildFilterTags() {
  filterSlider.innerHTML = "";
  filterTags.forEach(tag => {
    const span = document.createElement("span");
    span.className = `filter-tag${tag.value === activeFilter ? " active" : ""}`;
    span.textContent = tag.label;
    span.dataset.filter = tag.value;
    span.addEventListener("click", () => {
      setActiveFilter(tag.value);
    });
    filterSlider.appendChild(span);
  });
}

function setActiveFilter(value) {
  activeFilter = value;
  document.querySelectorAll(".filter-tag").forEach(tag => {
    tag.classList.toggle("active", tag.dataset.filter === value);
  });
  playSound('click');
  renderCards();
}

function renderCards() {
  const filtered = getFilteredAchievements();
  grid.innerHTML = "";

  if (filtered.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.innerHTML = `
      <div class="empty-icon">🔍</div>
      <p class="empty-ach-message">No achievements here yet…</p>
      <span class="empty-sub">Try a different filter or keep earning!</span>
    `;
    grid.appendChild(emptyState);
  } else {
    filtered.forEach(ach => {
      const card = createAchievementCard(ach);
      grid.appendChild(card);
      rewardObserver.observe(card);
    });
  }

  updateProgress();
}

function getFilteredAchievements() {
  let result;
  switch (activeFilter) {
    case "unlocked":
      result = achievements.filter(a => a.unlocked);
      break;
    case "locked":
      result = achievements.filter(a => !a.unlocked);
      break;
    case "gold":
      result = achievements.filter(a => a.tier === "gold");
      break;
    case "platinum":
      result = achievements.filter(a => a.tier === "platinum");
      break;
    default:
      result = [...achievements];
      break;
  }

  result.sort((a, b) => {
    if (a.unlocked === b.unlocked) return 0;
    return a.unlocked ? -1 : 1;
  });

  return result;
}

function createAchievementCard(ach) {
  const card = document.createElement("div");
  card.className = `achievement-card ${ach.unlocked ? "unlocked" : "locked"}`;
  
  let sparklesHTML = ach.unlocked
    ? '<span class="sparkle">✨</span><span class="sparkle">⭐</span>'
    : '';
    
  const iconHTML = `<div class="achievement-icon-wrap">${ach.icon}</div>`;
  const title = ach.title;
  const desc = ach.desc;
  
  let tierBadge = ach.unlocked
    ? `<span class="tier-badge ${ach.tier}">${getTierEmoji(ach.tier)} ${capitalize(ach.tier)}</span>`
    : `<span class="tier-badge">🔒 Locked</span>`;
  
  const progressText = ach.progressText ? ach.progressText : '';
  let progressHTML = '';
  let unlockHTML = '';
  
  if (ach.unlocked) {
    progressHTML = `<div class="ach-progress">❄️ ${progressText}</div>`;
    unlockHTML = `<div class="unlock-date">📅 Unlocked · ${ach.unlockDate}</div>`;
  } else {
    progressHTML = `<div class="unlock-date">🔐 ${progressText || "Locked"}</div>`;
  }
  
  card.innerHTML = `
    ${sparklesHTML}
    ${iconHTML}
    <div class="achievement-content">
      <div class="ach-title">${title}</div>
      <div class="ach-desc">${desc}</div>
      ${tierBadge}
      ${progressHTML}
      ${unlockHTML}
    </div>
  `;
  
  return card;
}

function getTierEmoji(tier) {
  switch (tier) {
    case "bronze": return "🥉";
    case "silver": return "🥈";
    case "gold": return "🥇";
    case "platinum": return "💎";
    default: return "";
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function updateProgress() {
  const total = achievements.length;
  const unlocked = achievements.filter(a => a.unlocked).length;
  const percent = Math.round((unlocked / total) * 100);
  unlockedCountEl.textContent = unlocked;
  totalCountEl.textContent = ` / ${total}`;
  progressFill.style.width = `${percent}%`;
  progressPercent.textContent = `${percent}%`;
}

scrollLeftBtn.addEventListener("click", () => {
  filterSlider.scrollBy({ left: -180, behavior: "smooth" });
  playSound('click');
});

scrollRightBtn.addEventListener("click", () => {
  filterSlider.scrollBy({ left: 180, behavior: "smooth" });
  playSound('click');
});

function loadAchUI() {
    const playerState = getLocalStorage('playerState');
    
    if (!playerState) {
        showError("Player State Undefined");
        return;
    }

    achievements.forEach(ach => {
        ach.unlocked = false;
        ach.unlockDate = null;
        ach.progressText = ach.progressText;
    });
    
    for (let entry of playerState.completedAch) {
        const ach = achievements.find(a => a.code === entry.code);
        if (ach) {
            ach.unlocked = true;
            ach.unlockDate = entry.date || "Unknown";
            
            ach.progressText = entry.finalProgressTxt || ach.progressText || "Completed!";
        }
    }
    
    updateAllProgressTexts(playerState);
    
    renderCards();
}

function updateAllProgressTexts(playerState) {
  achievements.forEach(ach => {
    if (ach.unlocked) return;

    switch (ach.code) {
      case 1:
        ach.progressText = `Lets Give It A Try! ${playerState.taskCount}/1 Remains!`;
        break;
      case 2:
        ach.progressText = `On A ${playerState.highestStreak}/7 Highest Streak!`;
        break;
      case 3:
        ach.progressText = `${playerState.midNightTaskCount}/10 Task Remains`;
        break;
      case 4:
        ach.progressText = `No Pressing, ${playerState.taskWithOutPause}/5 To Go..`;
        break;
      case 5:
        ach.progressText = `${playerState.hardCoreStudy} / 5 Impossible Task Remains`;
        break;
      case 6:
        if (playerState.twoHourSW) {
          ach.progressText = "🛸 2‑Hour Stopwatch Completed";
        } else {
          ach.progressText = "What Are You Waiting For?";
        }
        break;
      case 7:
        ach.progressText = `${playerState.rewardStreak}/3 Easy Right?`;
        break;
      case 8:
        if (playerState.threeHourSW) {
          ach.progressText = "❄️ 3‑Hour Stopwatch Completed";
        } else {
          ach.progressText = "Keep pushing…";
        }
        break;
      case 9:
        ach.progressText = `${playerState.taskCount}/50 Run In Total`;
        break;
      case 10:
        ach.progressText = `${playerState.achCount}/${playerState.maxAchPossible - 1} Achievements`;
        break;
      case 11:
        ach.progressText = playerState.earnedEasterEgg ? "✅ Easter Egg Found!" : "???";
        break;
      case 12:
        ach.progressText = `${playerState.todoStreak} / 7 Plans Completed...`;
        break;
    }
  });
}

function calculateAchXP(tier = null) {
  if (!tier) return;

  const base = 400;
  const xpValue = {
    bronze: base,
    silver: base * 2 + 100,
    gold: base * 3 + 200,
    platinum: base * 3 + 300
  };

  const gainedXp = xpValue[tier];
  if (gainedXp > 0) {
    queueXpGain(gainedXp, 0);
  }
}

function checkAch() {
    const playerState = getLocalStorage('playerState');
    if (!playerState) return;

    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    let newUnlocks = [];
    let foundNew = true;

    while (foundNew) {
        foundNew = false;
        const completedAch = validateAch();
        if (!completedAch || completedAch.length === 0) break;

        for (let achData of completedAch) {
            const achCode = achData.code;
            const newProgressText = achData.progressTxt;

            const achievement = achievements.find(a => a.code === achCode);
            if (!achievement) continue;

            const alreadyCompleted = playerState.completedAch.some(entry => entry.code === achCode);

            if (!alreadyCompleted) {
                achievement.unlocked = true;
                achievement.unlockDate = today;
                achievement.progressText = newProgressText;
                calculateAchXP(achievement.tier);

                playerState.completedAch.push({ 
                    code: achCode, 
                    date: today, 
                    finalProgressTxt: newProgressText 
                });
                newUnlocks.push(achievement);
                playerState.achCount++;
                foundNew = true;
            } else {
                const existing = playerState.completedAch.find(entry => entry.code === achCode);
                if (existing && existing.finalProgressTxt !== newProgressText) {
                    existing.finalProgressTxt = newProgressText;
                    achievement.unlocked = true;
                    achievement.unlockDate = existing.date;
                    achievement.progressText = newProgressText;
                }
            }
        }
    }

    setLocalStorage('playerState', playerState);
    loadAchUI();

    newUnlocks.forEach(ach => showAchievementNotification(ach));
}

// ── NOTIFICATION SYSTEM ─────────────
function showAchievementNotification(achievement) {
  notificationQueue.push(achievement);
  processQueue();
}

function processQueue() {
  if (activeToast || notificationQueue.length === 0) return;
  
  const nextAchievement = notificationQueue.shift();
  displayToast(nextAchievement);
}

function displayToast(achievement) {
  const toast = document.createElement("div");
  toast.className = "notification-toast";

    let base = 400
    let xpValue = {
        bronze: base,
        silver: (base*2)+100,
        gold: (base*3)+200,
        platinum: (base*3)+300
    }
    
    let gainedXp = xpValue[achievement.tier];

  toast.innerHTML = `
    <div class="notification-icon">${achievement.icon}</div>
    <div class="notification-content">
      <div class="notif-title">✨ Achievement Unlocked! +${gainedXp} XP!</div>
      <div class="notif-ach-name">${achievement.title}</div>
      <div class="notif-message">${achievement.desc}</div>
    </div>
    <div class="notif-progress">
      <div class="notif-progress-fill" id="notifProgressFill"></div>
    </div>
  `;

  notificationContainer.appendChild(toast);
  activeToast = toast;
  playSound("ach", true);

  const progressFill = toast.querySelector("#notifProgressFill");

  progressFill.style.transition = "none";
  progressFill.style.width = "100%";
  void progressFill.offsetWidth;
  
  let transitionTime = 5;

  progressFill.style.transition = `width ${transitionTime}s linear`;
  progressFill.style.width = "0%";

  clearTimeout(activeDismissTimeout);
  activeDismissTimeout = setTimeout(() => {
    dismissToast(toast);
  }, transitionTime * 1000);

  toast.addEventListener("click", () => {
    clearTimeout(activeDismissTimeout);
    dismissToast(toast);
  });
}

function dismissToast(toast) {
  if (!toast || !toast.parentNode) return;

  if (activeDismissTimeout) {
    clearTimeout(activeDismissTimeout);
    activeDismissTimeout = null;
  }

  toast.classList.add("fade-out");

  toast.addEventListener("animationend", () => {
    toast.remove();
    if (activeToast === toast) {
      activeToast = null;
    }
    processQueue();
  }, { once: true });
}
