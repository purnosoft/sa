let errTimeOut;

errCancelBtn.addEventListener('click', clearErrDisplay);

function showError(errMsg) {
  clearTimeout(errTimeOut);
  errorTxt.textContent = errMsg;
  errorDisplay.style.transform = "translateX(0%)";
  errTimeOut = setTimeout(clearErrDisplay, 4000);
}

function clearErrDisplay() {
  clearTimeout(errTimeOut);
  errorDisplay.style.transform = "translateX(-120%)";
}

allButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const clickedBtn = e.currentTarget;
    const targetPageId = clickedBtn.dataset.page;
    document.querySelectorAll('.nav-button.active, .menu-button.active')
      .forEach(active => active.classList.remove('active'));
    document.querySelectorAll('.page.activePage')
      .forEach(page => page.classList.remove('activePage'));
    clickedBtn.classList.add('active');
    const targetPage = document.getElementById(targetPageId);
    if (targetPage) targetPage.classList.add('activePage');
    playSound('click');
  });
});

selDiff.addEventListener('change', () => {
  lastDiff = selDiff.selectedIndex;
});

goTimer.addEventListener('click', () => {
  playSound('click');
  goToTimerTab();
});

goStopwatch.addEventListener('click', () => {
  playSound('click');
  goToSWTab();
});

logInBtn.addEventListener('click', (e) => {
  e.preventDefault();
  showError("Sorry,... This function is Coming Soon!");
});

addTaskBtn.addEventListener('click', runTimer);

// Streak

function checkStreakReset() {
    let playerData = getLocalStorage('playerData');
    let appData = getLocalStorage('appData');
    if (!playerData || !appData) return;

    const today = getDateKey(new Date());
    const lastDay = appData.lastTaskCompleted ? getDateKey(new Date(appData.lastTaskCompleted)) : null;

    if (!lastDay) {
        playerData.streak = 1;
    } else if (lastDay !== today && lastDay !== getDateKey(new Date(Date.now() - 86400000))) {
        playerData.streak = 1;
    }
    setLocalStorage('playerData', playerData);
    streakCount.textContent = playerData.streak;
}

function checkStreakReset() {
    let playerData = getLocalStorage('playerData');
    let appData = getLocalStorage('appData');
    if (!playerData || !appData) return;

    const today = getDateKey(new Date());
    const yesterday = getDateKey(new Date(Date.now() - 86400000));
    const lastDay = appData.lastTaskCompleted ? getDateKey(new Date(appData.lastTaskCompleted)) : null;

    if (!lastDay) {
        playerData.streak = 1;
    } else if (lastDay !== today && lastDay !== yesterday) {
        playerData.streak = 1;
    }
    setLocalStorage('playerData', playerData);
    streakCount.textContent = playerData.streak;
}


function updateStreakOnTask() {
    let playerData = getLocalStorage('playerData');
    let appData = getLocalStorage('appData');
    let playerState = getLocalStorage('playerState');
    if (!playerData || !appData) return;

    const today = getDateKey(new Date());
    const yesterday = getDateKey(new Date(Date.now() - 86400000));
    const lastDay = appData.lastTaskCompleted ? getDateKey(new Date(appData.lastTaskCompleted)) : null;


    if (!lastDay) {
        playerData.streak = 1;
    } else if (lastDay === yesterday) {
        playerData.streak = (playerData.streak || 0) + 1;
    } else if (lastDay !== today) {
        playerData.streak = 1;
    }
    
    appData.lastTaskCompleted = new Date();
    setLocalStorage('appData', appData);

    setLocalStorage('playerData', playerData);
    streakCount.textContent = playerData.streak;

    if (playerData.streak > playerState.highestStreak) {
        playerState.highestStreak = playerData.streak;
        setLocalStorage('playerState', playerState);
        checkAch();
    }
}

// ===== Reset Logic =====
function checkResetLogic() {
    let appData = getLocalStorage('appData');
    if (!appData) return;

    const today = getDateKey(new Date());
    let lastDay = appData.lastActiveDay;
    if (lastDay && typeof lastDay !== 'string') {
        
        lastDay = getDateKey(new Date(lastDay));
        appData.lastActiveDay = lastDay;
        setLocalStorage('appData', appData);
    }

    if (lastDay === null) {
        appData.lastActiveDay = today;
        setLocalStorage('appData', appData);
        return;
    }

    if (lastDay !== today) {
        resetForNewData();
    }
}

function resetForNewData() {
    let playerData = getLocalStorage('playerData');
    let rewardData = getLocalStorage('rewardData');
    let appData = getLocalStorage('appData');
    let playerState = getLocalStorage('playerState');

    playerData.pp = 0;
    playerData.cycle = 1;
    playerData.rewardIndex = 0;
    playerState.rewardStreak = 0;
    rewardData = [];
    appData.lastActiveDay = getDateKey(new Date());
    playerState.hardCoreStudy = 0;

    setLocalStorage('playerData', playerData);
    setLocalStorage('playerState', playerState);
    setLocalStorage('rewardData', rewardData);
    setLocalStorage('appData', appData);

    renderPpBar();
    const cycleEl = document.getElementById('cycleDisplay');
    if (cycleEl) cycleEl.textContent = playerData.cycle;

    renderReward();
    updateRewardUI();
}

// DOM CONTENT AFTER LOAD

window.addEventListener('DOMContentLoaded', () => {
  initializeData();
  checkStreakReset();
  checkResetLogic();
  buildFilterTags();
  loadAchUI();
});

function initializeData() {

  ///App Data
  
  let appData = getLocalStorage('appData');
  if (!appData) {
    appData = { name: "Study-Assist", version: 2.0, lastActiveDay: null, lastTaskCompleted: null };
    setLocalStorage('appData', appData);
  }
  
  /// Player Data
  
  let playerData = getLocalStorage('playerData');
  if (!playerData) {
    let newData = {
      lvl: 1, xp: 0, pp: 0, cycle: 1,
      xpBase: 250, ppBase: 700, xpMultiplier: 1.5, ppMultiplier: 2,
      totalXp: 0, totalPp: 0, maxCycleAllowed: 5,
      rewardIndex: 0, streak: 0
    };
    setLocalStorage('playerData', newData);
    renderXpBar();
    renderPpBar();
  } else {
    renderXpBar();
    renderPpBar();
  }
  
  //// Player State
  
  let playerState = getLocalStorage('playerState');
  
  if (!playerState) {
      playerState = {
          completedAch: [],
          maxAchPossible: achievements.length,
          achCount: 0,
          taskCount: 0,
          highestStreak: 0,
          midNightTaskCount: 0,
          taskWithOutPause: 0,
          hardCoreStudy: 0,
          twoHourSW: false,
          threeHourSW: false,
          rewardStreak: 0,
          earnedEasterEgg: false,
          pauseBtnClickFlag: false
      }
      
      setLocalStorage('playerState', playerState);
  }
  
  // Task Data
  let taskData = getLocalStorage('taskData');
  if (!taskData) {
    setLocalStorage('taskData', []);
    renderHistory();
  } else {
    renderHistory();
  }
  // Reward Data
  let rewardData = getLocalStorage('rewardData');
  if (!rewardData) {
    setLocalStorage('rewardData', []);
  } else {
    renderReward();
    updateRewardUI();
  }
  // Restore running timer
  let timerObject = getLocalStorage('timerObject');
  if (timerObject && timerObject.timerIsRunning) {
    createTaskBox(timerObject);
    if (timerObject.timerIsPaused) {
      let timer = milisecConverter(timerObject.timerRemainingTime);
      timerHour.textContent = timer.hour + ":";
      timerMin.textContent = timer.min + ":";
      timerSec.textContent = timer.sec;
    } else {
      updateTimer();
    }
    goToTimerTab();
  }
  // Restore running stopwatch
  const sw = getLocalStorage('stopwatch');
  if (sw && sw.isRunning) {
    createTaskBox(sw);
    if (sw.isPaused) {
      renderStopwatch(sw.pausedTime);
    } else {
      startStopwatchLoop();
    }
    goToSWTab();
  }
}

/* ======== Serviece Worker ======= */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js")
      .then(() => {})
      .catch(err => showError(`SW registration failed: ${err}`));
  });
}
