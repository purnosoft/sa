// Stopwatch mode + direct event listeners
let stopwatchInterval;

startStopwatchBtn.addEventListener('click', runStopwatch);
pauseBtn.addEventListener("click", pauseStopwatch);
resumeBtn.addEventListener('click', resumeStopwatch);
confirmBtn.addEventListener('click', resetStopwatch);

function runStopwatch() {
  playSound('click');
  if (!validateClockDOM()) return;
  if (!taskIsRunning()) return;

  let sw = {
    objectFor: 'stopwatch',
    startedAt: new Date(),
    isRunning: true,
    isPaused: false,
    startTime: Date.now(),
    pausedTime: 0,
    subjectTxt: selSubject.value,
    topicTxt: selDesc.value,
    xpEarned: null,
    ppEarned: null,
    studyTime: null
  };
  setLocalStorage('stopwatch', sw);
  updateStopwatchUI();
  createTaskBox(sw);
  startStopwatchLoop();
}

function startStopwatchLoop() {
  clearInterval(stopwatchInterval);
  stopwatchInterval = setInterval(() => {
    let sw = getLocalStorage('stopwatch');
    if (!sw || !sw.isRunning || sw.isPaused) return;
    const elapsed = Date.now() - sw.startTime;
    renderStopwatch(elapsed);
  }, 500);
}

function renderStopwatch(ms) {
  let totalSeconds = Math.floor(ms / 1000);
  let sec = totalSeconds % 60;
  let min = Math.floor(totalSeconds / 60) % 60;
  let hour = Math.floor(totalSeconds / 3600);
  stopWatchDisplay.textContent =
    `${String(hour).padStart(2, "0")}:` +
    `${String(min).padStart(2, "0")}:` +
    `${String(sec).padStart(2, "0")}`;
  updateStopwatchUI();
}

function pauseStopwatch() {
  let sw = getLocalStorage('stopwatch');
  if (!sw || !sw.isRunning) return;
  sw.pausedTime = Date.now() - sw.startTime;
  sw.isPaused = true;
  setLocalStorage('stopwatch', sw);
  clearInterval(stopwatchInterval);
  updateStopwatchUI();
  
  let playerState = getLocalStorage('playerState');
  if (!playerState.pauseBtnClickFlag) {
      playerState.pauseBtnClickFlag = true;
      setLocalStorage('playerState', playerState);
  }
  
  playSound('click');
}

function resumeStopwatch() {
  let sw = getLocalStorage('stopwatch');
  if (!sw || !sw.isRunning) return;
  sw.startTime = Date.now() - sw.pausedTime;
  sw.isPaused = false;
  setLocalStorage('stopwatch', sw);
  startStopwatchLoop();
  updateStopwatchUI();
  playSound('click');
}

function resetStopwatch() {
  checkResetLogic();
  
  let sw = getLocalStorage('stopwatch');
  if (!sw || !sw.isRunning) return;

  let ellapsedTime = sw.isPaused ? sw.pausedTime : Date.now() - sw.startTime;
  let time = milisecConverter(ellapsedTime);
  let totalStudyTime = Number(time.hour) * 60 + Number(time.min);
  if (totalStudyTime < 10) {
    showError("Sorry, At least study for 10 mins!");
    return;
  }

  updateStreakOnTask();

  sw.isRunning = false;
  sw.isPaused = null;
  sw.startTime = null;
  sw.pausedTime = 0;
  stopWatchDisplay.textContent = '00:00:00';
  taskBox.style.display = "none";
  setLocalStorage('stopwatch', sw);
  updateStopwatchUI();
  clearInterval(stopwatchInterval);

  levelUp(ellapsedTime);
  createTaskList(sw);
  
  const playerState = getLocalStorage('playerState');
  
  playerState.taskCount++;
  
  if (totalStudyTime >= 50) {
    playerState.hardCoreStudy++;
  }
  
  if (totalStudyTime >= 120) {
    playerState.twoHourSW = true;
  }
  
  if (totalStudyTime >= 180) {
    playerState.threeHourSW = true;
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
  
  deleteObject("stopwatch");
  playRandomTaskSound();
}
