// Timer mode functions + direct event listeners
let timerRunningInterval;

timerPauseBtn.addEventListener('click', pauseTimer);
timerResumeBtn.addEventListener('click', resumeTimer);
confirmTimerTaskBtn.addEventListener('click', confirmTimerTask);

function runTimer() {
  playSound('click');
  let bossData = loadPlayer();
  if (bossData.activeBoss) {
      showError("Defeat The Boss To Continue New Tasks!");
      return;
  }
  if (!taskIsRunning()) return;
  
  const validations = validateClockDOM();
  if (!validations) {
      return
  }

  let timerRunTime = selDiff.options[selDiff.selectedIndex].value * 1000;
  let timerEndingTime = Date.now() + timerRunTime;
  let timerObject = {
    objectFor: 'timer',
    startedAt: new Date(),
    startTime: Date.now(),
    timerIsRunning: true,
    timerIsPaused: false,
    timerRemainingTime: timerRunTime,
    timerEndingTime: timerEndingTime,
    subjectTxt: selSubject.value,
    topicTxt: selDesc.value,
    diffTxt: selDiff.options[selDiff.selectedIndex].dataset.label,
    xpEarned: null,
    ppEarned: null,
    studyTime: null
  };
  setLocalStorage('timerObject', timerObject);
  createTaskBox(timerObject);
}

function updateTimer() {
  let timerObject = getLocalStorage('timerObject');
  if (!timerObject || timerObject.timerIsPaused) return;
  let timerTimeLeft = timerObject.timerEndingTime - Date.now();
  if (timerTimeLeft <= 0) {
    clearInterval(timerRunningInterval);
    timerPauseBtn.style.display = "none";
    confirmTimerTaskBtn.style.display = "block";
    return;
  }
  timerObject.timerRemainingTime = timerTimeLeft;
  setLocalStorage('timerObject', timerObject);
  let timer = milisecConverter(timerTimeLeft);
  timerHour.textContent = timer.hour + ":";
  timerMin.textContent = timer.min + ":";
  timerSec.textContent = timer.sec;
}

function pauseTimer() {
  clearInterval(timerRunningInterval);
  let timerObject = getLocalStorage('timerObject');
  timerObject.timerRemainingTime = timerObject.timerEndingTime - Date.now();
  timerObject.timerIsPaused = true;
  setLocalStorage('timerObject', timerObject);
  UIUpdate();
  
  let playerState = getLocalStorage('playerState');
  if (!playerState.pauseBtnClickFlag) {
      playerState.pauseBtnClickFlag = true;
      setLocalStorage('playerState', playerState);
  }
  
  playSound('click');
}

function resumeTimer() {
  let timerObject = getLocalStorage('timerObject');
  timerObject.timerEndingTime = Date.now() + timerObject.timerRemainingTime;
  timerObject.timerIsPaused = false;
  setLocalStorage('timerObject', timerObject);
  UIUpdate();
  playSound('click');
}

function confirmTimerTask() {
    checkResetLogic();
    
    let timerObject = getLocalStorage('timerObject');
    timerObject.studyTime = getValueByLabel(timerObject.diffTxt);
    setLocalStorage('timerObject', timerObject);
    

    taskBox.style.display = "none";
    showError("Congrats! Task Completed!");
    levelUp();
    ppBar.scrollIntoView({ behavior: "smooth", block: "center" });
    timerObject = getLocalStorage('timerObject');
    createTaskList(timerObject);

    updateStreakOnTask();

    const playerState = getLocalStorage('playerState');
    playerState.taskCount++;
    
    if (timerObject.diffTxt.toLowerCase() === 'hard') {
        playerState.hardCoreStudy++;
    }
    
    if (!playerState.pauseBtnClickFlag) {
        playerState.taskWithOutPause++;
        setLocalStorage('playerState', playerState);
        checkAch();
    } else {
        playerState.pauseBtnClickFlag = false;
        setLocalStorage('playerState', playerState);
        checkAch();
    }
    
    rollBossSpawn();

    deleteObject('timerObject');
    playRandomTaskSound();
}
