// XP, PP, level calculation and bar animation

function updateBar(bar, variable, value) {
  bar.style.setProperty(variable, value + "%");
}

async function animateBar(levelGained, bar, variable, percent, oldLevel, newLevel, updateText, isMaxReached = false) {
  if (levelGained <= 0) {
    updateBar(bar, variable, percent);
    return;
  }
  let animationTime = 1450;
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  updateBar(bar, variable, 100);
  await wait(animationTime);
  for (let i = 1; i < levelGained; i++) {
    bar.classList.add('no-transition');
    updateBar(bar, variable, 0);
    void bar.offsetWidth;
    let level = oldLevel + i;
    updateText(level);
    bar.classList.remove('no-transition');
    updateBar(bar, variable, 100);
    await wait(animationTime);
  }
  if (isMaxReached) {
    updateText(newLevel);
    bar.classList.remove('no-transition');
    updateBar(bar, variable, 100);
    await wait(animationTime);
    return;
  }
  bar.classList.add('no-transition');
  updateBar(bar, variable, 0);
  void bar.offsetWidth;
  updateText(newLevel);
  bar.classList.remove('no-transition');
  updateBar(bar, variable, percent);
  playSound('updateBar');
  await wait(animationTime);
}

function calculateLvl(gained, base, multiplier, current) {
  if (!Number.isFinite(gained)) {
    showError("Invalid Gain Value!");
    return { lvl: current, leftOver: 0 };
  }
  while (true) {
    let required = Math.floor(base * Math.pow(multiplier, current - 1));
    if (required <= 0) break;
    if (gained < required) break;
    gained -= required;
    current++;
  }
  return { lvl: current, leftOver: gained };
}

// ============ BATCHING SYSTEM ============
let pendingXp = 0;
let pendingPp = 0;
let flushScheduled = false;
// These store the old levels *at the moment the first gain was queued*
let oldLevelSnapshot = null;
let oldCycleSnapshot = null;

function queueXpGain(xp, pp = 0) {
  pendingXp += xp;
  pendingPp += pp;

  if (!flushScheduled) {
    flushScheduled = true;
    // Take a snapshot of the current levels before any of the batched gains are applied
    const playerData = getLocalStorage('playerData');
    oldLevelSnapshot = playerData.lvl;
    oldCycleSnapshot = playerData.cycle;

    requestAnimationFrame(() => {
      applyPendingGains();
    });
  }
}

function applyPendingGains() {
  // Nothing to do? Reset and exit
  if (pendingXp === 0 && pendingPp === 0) {
    flushScheduled = false;
    return;
  }

  let playerData = getLocalStorage('playerData');
  const hasXp = pendingXp > 0;
  const hasPp = pendingPp > 0;

  // 1. Apply XP
  if (hasXp) {
    const totalXp = playerData.xp + pendingXp;
    const xpResult = calculateLvl(
      totalXp,
      playerData.xpBase,
      playerData.xpMultiplier,
      playerData.lvl
    );
    playerData.lvl = xpResult.lvl;
    playerData.xp = xpResult.leftOver;
    playerData.totalXp += pendingXp;
  }

  // 2. Apply PP
  if (hasPp) {
    const totalPp = playerData.pp + pendingPp;
    const ppResult = calculateLvl(
      totalPp,
      playerData.ppBase,
      playerData.ppMultiplier,
      playerData.cycle
    );
    playerData.cycle = Math.min(ppResult.lvl, playerData.maxCycleAllowed);
    playerData.pp = ppResult.leftOver;
    playerData.totalPp += pendingPp;
  }

  // 3. Save to localStorage **once**
  setLocalStorage('playerData', playerData);

  // 4. Render bars **once**, using the snapshot from before the batch
  if (hasXp && typeof renderXpBar === 'function') {
    renderXpBar(oldLevelSnapshot);
  }
  if (hasPp && typeof renderPpBar === 'function') {
    renderPpBar(oldCycleSnapshot);
  }

  // 5. Reset everything for the next batch
  pendingXp = 0;
  pendingPp = 0;
  flushScheduled = false;
  oldLevelSnapshot = null;
  oldCycleSnapshot = null;
}

// ============ YOUR UPDATED FUNCTIONS ============

function levelUp(ellapsedTime = null) {
  let data = getLocalStorage('timerObject') || getLocalStorage('stopwatch');
  let gainedXp = 0;
  let gainedPp = 0;

  if (data && data.objectFor === 'timer') {
    const xpObject = { easy: 100, medium: 350, hard: 600 };
    const ppObject = { easy: 500, medium: 1600, hard: 2700 };
    const timeObject = { easy: 600, medium: 1800, hard: 3000 };
    const difficulty = data.diffTxt.toLowerCase();
    gainedXp = xpObject[difficulty];
    gainedPp = ppObject[difficulty];

    data.xpEarned = gainedXp;
    data.ppEarned = gainedPp;
    data.studyTime = timeObject[difficulty];
    setLocalStorage('timerObject', data);
  }

  if (data && data.objectFor === 'stopwatch' && ellapsedTime !== null) {
    const studyTime = ellapsedTime / 1000;

    let xpfactor;
    const xpConditions = [
      [studyTime >= 3000, 0.2],
      [studyTime >= 1800, 0.194],
      [studyTime >= 600, 0.166]
    ];
    for (const [condition, result] of xpConditions) {
      if (condition) { xpfactor = result; break; }
    }

    let ppfactor;
    const ppConditions = [
      [studyTime >= 3000, 0.9],
      [studyTime >= 1800, 0.889],
      [studyTime >= 600, 0.834]
    ];
    for (const [condition, result] of ppConditions) {
      if (condition) { ppfactor = result; break; }
    }

    gainedXp = Math.round(studyTime * xpfactor);
    gainedPp = Math.round(studyTime * ppfactor);

    data.xpEarned = gainedXp;
    data.ppEarned = gainedPp;
    data.studyTime = studyTime;
    setLocalStorage('stopwatch', data);
  }

  // Queue the gains (no more immediate localStorage/playerData writes or renders)
  if (gainedXp > 0 || gainedPp > 0) {
    queueXpGain(gainedXp, gainedPp);
  }
}

function whileObserving(element) {
  return new Promise(resolve => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        resolve();
      }
    }, { threshold: 0.5, rootMargin: "-18% 0px 0px 0px" });
    observer.observe(element);
  });
}

async function renderXpBar(oldLevel = null) {
  let playerData = getLocalStorage('playerData');
  let required = Math.floor(playerData.xpBase * Math.pow(playerData.xpMultiplier, playerData.lvl - 1));
  xpCount.textContent = ` ${playerData.xp} / ${required}`;
  let percentage = (playerData.xp / required) * 100;
  if (oldLevel !== null) {
    let newLevel = playerData.lvl;
    let levelGained = newLevel - oldLevel;
    await whileObserving(xpBar);
    await animateBar(levelGained, xpBar, '--progress-xp', percentage, oldLevel, newLevel, level => {
      levelCount.textContent = level;
    });
  } else {
    updateBar(xpBar, '--progress-xp', percentage);
    levelCount.textContent = `${playerData.lvl}`;
  }
}

async function renderPpBar(oldCycle = null) {
  let playerData = getLocalStorage('playerData');
  let required = Math.floor(playerData.ppBase * Math.pow(playerData.ppMultiplier, playerData.cycle - 1));
  let percentage = (playerData.pp / required) * 100;
  if (oldCycle !== null) {
    let newCycle = playerData.cycle;
    let levelGained = newCycle - oldCycle;
    if (levelGained > 0) {
      for (let i = 0; i < levelGained; i++) {
        executeReward();
      }
    }
    await whileObserving(ppBar);
    await animateBar(levelGained, ppBar, '--progress-pp', percentage, oldCycle, newCycle, level => {
      if (level >= playerData.maxCycleAllowed) {
        ppCount.textContent = `${playerData.maxCycleAllowed} (Max)`;
      } else {
        ppCount.textContent = level;
      }
    }, newCycle >= playerData.maxCycleAllowed);
    if (playerData.cycle >= playerData.maxCycleAllowed) {
      await whileObserving(ppBar);
      updateBar(ppBar, '--progress-pp', 100);
      ppCount.textContent = `${playerData.maxCycleAllowed} (Max)`;
    }
  } else {
    if (playerData.cycle >= playerData.maxCycleAllowed) {
      updateBar(ppBar, '--progress-pp', 100);
      ppCount.textContent = `${playerData.cycle} (Max)`;
      return;
    }
    updateBar(ppBar, '--progress-pp', percentage);
    ppCount.textContent = `${playerData.cycle}`;
  }
}
