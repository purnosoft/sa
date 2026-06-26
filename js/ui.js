// All DOM element references – assigned immediately
const errorDisplay = document.getElementById("errorDisplay");
const errorTxt = document.getElementById("displayTxt");
const errCancelBtn = document.getElementById('errorCancel');
const navBtns = document.querySelectorAll('.nav-button');
const goTimer = document.getElementById('goTimer');
const goStopwatch = document.getElementById('goStopwatch');

const timerMode = document.querySelector('.timer-mode');
const stopwatchMode = document.querySelector('.stopwatch-mode');

const statusText = document.getElementById('studyModeStatus');

const addTaskBtn = document.getElementById("addTaskBtn");
const selSubject = document.getElementById('selSubject');
const selDesc = document.getElementById('selDesc');
const selDiff = document.getElementById('selDiff');

const taskBox = document.getElementById('taskBox');
const taskHeading = document.getElementById("taskHeading");
const subjectTxt = document.getElementById("subject");
const topicTxt = document.getElementById("topic");
const diffTxt = document.getElementById("difficulity");

const timerBox = document.querySelector(".timer-cont");
const timerHour = document.getElementById('timerHour');
const timerMin = document.getElementById('timerMin');
const timerSec = document.getElementById('timerSec');

const timerPauseBtn = document.getElementById("pauseBtn");
const confirmTimerTaskBtn = document.getElementById("confirmTimerTaskBtn");
const timerResumeBtn = document.getElementById('timerResumeBtn');

const startStopwatchBtn = document.getElementById('startStopwatch');
const stopWatchDisplay = document.getElementById("stopWatchDisplay");
const pauseBtn = document.getElementById("stopPauseBtn");
const confirmBtn = document.getElementById("stopConfirmBtn");
const resumeBtn = document.getElementById('stopResumeBtn');

const ppBar = document.querySelector(".PP-bar");
const xpBar = document.querySelector(".XP-bar");
const xpCount = document.querySelector("#xpCount span");
const ppCount = document.querySelector("#ppCount span:nth-of-type(2)");
const levelCount = document.querySelector("#levelCount span");
const streakCount = document.querySelector("#streakCount span");

const rewardList = document.querySelector('.reward-list');

const historyStatus = document.getElementById("status");
const historyCont = document.querySelector(".history-cont");

const logInBtn = document.getElementById('logInBtn');

const allButtons = document.querySelectorAll('.nav-button, .menu-button');

let lastDiff;

// UI helper functions (unchanged from earlier version)
function validateClockDOM() {
    const isVisible = el => el.offsetParent !== null;

    const validations = [
        [selSubject.value === "", "Please Select A Subject!"],
        [selDesc.value === "", "Please add A Description!"],
        [isVisible(selDiff) && selDiff.value === "", "Please Select A Difficulty!"]
    ];

    for (const [condition, errMsg] of validations) {
        if (condition) {
            showError(errMsg);
            return false;
        }
    }

    return true;
}

/* //////////// ACHIEVEMENT VALIDATIONS ////// */

function validateAch() {
  const playerState = getLocalStorage('playerState');
  
  const achDone = [];
  
  const validations = [
    [playerState.achCount >= (playerState.maxAchPossible - 1), "💗 Completed All Achievements, What A Legend💝", 10],
    [playerState.taskCount >= 1, "Step Zero Completed!", 1],
    [playerState.taskCount >= 50, "You Have Came So Far! Congrats!", 9],
    [playerState.highestStreak >= 7, "Is This The Highest Streak?", 2],
    [playerState.midNightTaskCount >= 10, "Maybe Not Owl, But BatMan!", 3],
    [playerState.taskWithOutPause >= 5, " You Can Take Break Now!", 4],
    [playerState.hardCoreStudy >= 5, "Please Touch Some Grass...", 5],
    [playerState.twoHourSW === true, "Was That Easy?", 6],
    [playerState.threeHourSW === true, "What?! How?!", 8],
    [playerState.rewardStreak >= 3, "Yum...Piece Of Cake..", 7],
    [playerState.earnedEasterEgg === true, "You Found It! That Was A Weird Sound, Right?", 11],
    [playerState.todoStreak >= 7, "Planing Is Everything!", 12],
  ];
  
  for (const [condition, progressTxt, code] of validations) {
    if (condition) {
      achDone.push({progressTxt, code});
    }
  }
  return achDone
}

/* ================ */

function createTaskBox(data = null) {
  const taskData = data || {
    subjectTxt: selSubject.value,
    topicTxt: selDesc.value,
    diffTxt: selDiff.options[selDiff.selectedIndex].dataset.label,
    timerIsPaused: false
  };
  subjectTxt.textContent = taskData.subjectTxt;
  topicTxt.textContent = taskData.topicTxt;
  diffTxt.textContent = taskData.diffTxt;
  taskBox.style.display = "flex";
  if (taskData.objectFor === "timer") {
    taskHeading.textContent = "Pending Task 📝";
    UIUpdate();
    taskBox.style.scrollMarginTop = "20vh";
  } else if (taskData.objectFor === "stopwatch") {
    taskHeading.textContent = "Ongoing Task 📜";
    taskBox.style.scrollMarginTop = "38vh";
    timerBox.style.display = "none";
    timerPauseBtn.style.display = "none";
    timerResumeBtn.style.display = "none";
    confirmTimerTaskBtn.style.display = "none";
  }
  setTimeout(()=>{
      taskBox.scrollIntoView({ behavior: "smooth" });
  },800);
}

function UIUpdate() {
  timerBox.style.display = "flex";
  let timerObject = getLocalStorage('timerObject');
  if (!timerObject) {
    taskBox.style.display = "none";
    showError("ERROR. NO DATA FOUND! Try Creating task again.");
    return;
  }
  timerPauseBtn.style.display = "none";
  timerResumeBtn.style.display = "none";
  confirmTimerTaskBtn.style.display = "none";
  const timeLeft = timerObject.timerEndingTime - Date.now();
  if (timerObject.timerIsPaused) {
    timerResumeBtn.style.display = "block";
  } else if (timeLeft <= 0) {
    confirmTimerTaskBtn.style.display = "block";
  } else {
    timerPauseBtn.style.display = "block";
  }
  if (!timerObject.timerIsPaused) {
    clearInterval(timerRunningInterval);
    timerRunningInterval = setInterval(updateTimer, 500);
  }
}

function goToTimerTab() {
  selDiff.selectedIndex = lastDiff;
  timerMode.classList.remove('hidden');
  selDiff.classList.remove('hidden');
  stopwatchMode.classList.add('hidden');
  statusText.textContent = "Add A Task With Timer ⏰";
  goTimer.classList.add('active');
  goStopwatch.classList.remove('active');
}

function goToSWTab() {
  timerMode.classList.add('hidden');
  selDiff.classList.add('hidden');
  stopwatchMode.classList.remove('hidden');
  statusText.textContent = "Run A StopWatch Based Task ⏱️";
  goStopwatch.classList.add('active');
  goTimer.classList.remove('active');
  selDiff.value = "";
}

function updateStopwatchUI() {
  let sw = getLocalStorage('stopwatch');
  startStopwatchBtn.style.display = 'none';
  resumeBtn.style.display = 'none';
  pauseBtn.style.display = 'none';
  confirmBtn.style.display = 'none';
  if (sw.isRunning && sw.isPaused) {
    resumeBtn.style.display = 'inline-block';
    confirmBtn.style.display = 'inline-block';
  } else if (sw.isRunning) {
    pauseBtn.style.display = 'inline-block';
    confirmBtn.style.display = 'inline-block';
  } else {
    startStopwatchBtn.style.display = 'inline-block';
  }
}

function taskIsRunning() {
    const sw = getLocalStorage('stopwatch');
    if (sw?.isRunning) {
        showError("Please Complete The Ongoing Task First");
        return false;
    }

    const timerObject = getLocalStorage('timerObject');

    if (timerObject?.timerIsRunning) {
        showError("Please Complete The Pending Task First!");
        return false;
    }

    return true;
}