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

////////Task Box
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

///////////
// STOP WATCH!

const startStopwatchBtn = document.getElementById('startStopwatch');

const stopWatchDisplay = document.getElementById("stopWatchDisplay");
const startBtn = document.getElementById("startStopwatch");
const pauseBtn = document.getElementById("stopPauseBtn");
const confirmBtn = document.getElementById("stopConfirmBtn");
const resumeBtn = document.getElementById('stopResumeBtn');

const ppBar = document.querySelector(".PP-bar");
const xpBar = document.querySelector(".XP-bar");
const xpCount = document.querySelector("#xpCount span");
const ppCount = document.querySelector("#ppCount span:nth-of-type(2)");
const levelCount = document.querySelector("#levelCount span");

const rewardList = document.querySelector('.reward-list');

//////////HISTORY PAGE////////

const historyStatus = document.getElementById("status");
const historyCont = document.querySelector(".history-cont");

const logInBtn = document.getElementById('logInBtn');

logInBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showError("Sorry,... This function is Coming Soon!");
})

/////////////////// 
////Variables
//////////////////

let lastDiff;
let timerRunningInterval;
let stopwatchInterval;

/////////////////// ////////
////Window Onload Actions
///////////////////////////

window.addEventListener('DOMContentLoaded', () => {
    ///////Player Data///////
    
    let playerData = getLocalStorage('playerData');
    
    if (!playerData) {

        let newData = {
            lvl: 1,
            xp: 0,
            pp: 0,
            cycle: 1,
            
            xpBase: 250,
            ppBase: 700,
            xpMultiplier: 1.5,
            ppMultiplier: 2,
            
            totalXp: 0,
            totalPp: 0,
            maxCycleAllowed: 5,
            rewardIndex: 0
        };

        setLocalStorage('playerData', newData);

        renderXpBar();
        renderPpBar();

    } else {

        renderXpBar();
        renderPpBar();
    }
    
    //////// TASK DATA ////////
    
    let taskData = getLocalStorage('taskData');
    
    if (!taskData) {
        let newData = [];
        setLocalStorage('taskData', newData);
        renderHistory();
    } else {
        renderHistory();
    }
    
    //////// REWARD DATA ////////
    
    let rewardData = getLocalStorage('rewardData');
    
    if (!rewardData) {
        let newData = [];
        setLocalStorage('rewardData', newData);     
    } else {
        renderReward();
        updateRewardUI();
    }
    
    ///////Timer///////
       
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
    
    ///////StopWatch///////
    
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

});

//////////////////////
/////// Error Handeler Function
//////////////////////
errCancelBtn.addEventListener('click', clearErrDisplay);

let errTimeOut;

function showError(errMsg) {

    clearTimeout(errTimeOut);
    errorTxt.textContent = errMsg;
    errorDisplay.style.transform = "translateX(0%)";
    errorTxt.textContent = errMsg;
    errTimeOut = setTimeout(clearErrDisplay, 4000);
}

function clearErrDisplay() {
    clearTimeout(errTimeOut);
    errorDisplay.style.transform = "translateX(-120%)";
}
//////////////////////
///////NAV BUTTONS
//////////////////////


navBtns.forEach(navBtn => {
    
    navBtn.addEventListener('click', (e) => {
        let currentPage = e.currentTarget.dataset.page;
        
        const activeBtn = document.querySelector('.nav-button.active');
        const lastActPage = document.getElementById(activeBtn.dataset.page);
        
        activeBtn.classList.remove('active');
        
        e.currentTarget.classList.add('active');
        
        lastActPage.classList.remove('activePage');
        const nowInPage = document.getElementById(currentPage);
        nowInPage.classList.add('activePage');
    });
    
});

////////////////////////////
/////// STUDY MODE SWITCH
////////////////////////////

selDiff.addEventListener('change', () => {
    lastDiff = selDiff.selectedIndex;
})

goTimer.addEventListener('click', goToTimerTab);

function goToTimerTab() {
    selDiff.selectedIndex = lastDiff;
        
    timerMode.classList.remove('hidden');
    selDiff.classList.remove('hidden');
    stopwatchMode.classList.add('hidden');

    statusText.textContent = "Add A Task With Timer ⏰";

    goTimer.classList.add('active');
    goStopwatch.classList.remove('active');
}

goStopwatch.addEventListener('click', goToSWTab);

function goToSWTab() {
    timerMode.classList.add('hidden');
    selDiff.classList.add('hidden');
    stopwatchMode.classList.remove('hidden');

    statusText.textContent = "Run A StopWatch Based Task ⏱️";

    goStopwatch.classList.add('active');
    goTimer.classList.remove('active');
    selDiff.value = "";
}


//////////////////////
///////CLOCK DOM VALIDATIONS
//////////////////////

function validateClockDOM() {
    const isVisible = el => el.offsetParent !== null;
    
    const validations = [
        [selSubject.value === "", "Please Select A Subject!"],
        [selDesc.value === "", "Please add A Description!"],
        [isVisible(selDiff) && selDiff.value === "", "Please Select A Difficulty!"]
    ];
    
    for(const [condition, errMsg] of validations){
        if (condition) {
            showError(errMsg);
            return false;
        };
    };
    return true;
}

//////////////////////
///////TaskBox Open
//////////////////////

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
    
    taskBox.scrollIntoView({behavior: "smooth"});
    
}

//////////////////////
////////UPDATE UI
//////////////////////


function UIUpdate() {
    
    timerBox.style.display = "flex";
    let timerObject = getLocalStorage('timerObject');
    
    if (!timerObject) {
        let errMsg = "ERROR. NO DATA FOUND! Try Creating task again."
        taskBox.style.display = "none";
        showError(errMsg);
        return
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

///////////////////////////////
///////LOCAL STORAGE SET/GET/REMOVE
///////////////////////////////

function getLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key));
}

function setLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function deleteObject(key){
    localStorage.removeItem(key);
}

//////////////////////
///////Timer Mode
//////////////////////

function milisecConverter(timerTimeLeft){
    let totalSeconds = Math.floor(timerTimeLeft / 1000);

    let sec = totalSeconds % 60;
    let min = Math.floor(totalSeconds / 60) % 60;
    let hour = Math.floor(totalSeconds / 3600);
    
    return {
        sec: sec.toString().padStart(2, "0"),
        min: min.toString().padStart(2, "0"),
        hour: hour.toString().padStart(2, "0")
    };
}

addTaskBtn.addEventListener('click', runTimer);

function runTimer() {
    const isValid = validateClockDOM();
    
    if (!isValid) return;
    
    let sw = getLocalStorage('stopwatch');
    if (sw && sw.isRunning) {
        showError("Please Complete The Ongoing Task First");
        return
    }
    
    let timerObject = getLocalStorage('timerObject');
    
    if(timerObject && timerObject.timerIsRunning) {
        let errMsg = "Please Complete The Pending Task First!"
        showError(errMsg);
        return;
    }
    
    let timerRunTime = (selDiff.options[selDiff.selectedIndex].value)*1000;
    
    let timerEndingTime = Date.now() + timerRunTime;
           
    timerObject = {
        objectFor: 'timer',
        startedAt: new Date(),
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
    
    timerHour.textContent = timer.hour+":";
    timerMin.textContent = timer.min+":";
    timerSec.textContent = timer.sec;
    
}


//////PAUSE BUTTON

timerPauseBtn.addEventListener('click', pauseTimer);

function pauseTimer() {
    
    clearInterval(timerRunningInterval);
    let timerObject = getLocalStorage('timerObject');
    timerObject.timerRemainingTime = timerObject.timerEndingTime - Date.now();
    timerObject.timerIsPaused = true;
    
    setLocalStorage('timerObject', timerObject);   
    UIUpdate();
}

//////RESUME BUTTON

timerResumeBtn.addEventListener('click', resumeTimer);

function resumeTimer() {

    let timerObject = getLocalStorage('timerObject');
    
    timerObject.timerEndingTime = Date.now() + timerObject.timerRemainingTime;
    
    timerObject.timerIsPaused = false;
    
    setLocalStorage('timerObject', timerObject);   
    UIUpdate();
    
};

/////////CONFIRM BUTTON

confirmTimerTaskBtn.addEventListener('click', confirmTimerTask);

function confirmTimerTask() {    
    taskBox.style.display = "none";
    
    let errMsg = "Congrats! Task Completed!"
    showError(errMsg);
    levelUp();
    
    ppBar.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
    
    createTaskList(getLocalStorage('timerObject'));
    
    deleteObject('timerObject'); 
}

//////////////////////
///////StopWatch Mode
//////////////////////

startStopwatchBtn.addEventListener('click', runStopwatch);

function runStopwatch() {
    const isValid = validateClockDOM();
    
    if (!isValid) return;
    
    let timerObject = getLocalStorage('timerObject');
    
    if (timerObject && timerObject.timerIsRunning) {
        showError("Please Complete The Pending Task First");
        return
    }
    
    let sw = getLocalStorage('stopwatch');

    if (sw && sw.isRunning) {
        showError("Stopwatch already running!");
        return;
    }

    const now = Date.now();

    sw = {
        objectFor: 'stopwatch',
        startedAt: new Date(),
        isRunning: true,
        isPaused: false,
        startTime: now,
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

pauseBtn.addEventListener("click", pauseStopwatch);

function pauseStopwatch() {
    let sw = getLocalStorage('stopwatch');
    if (!sw || !sw.isRunning) return;

    sw.pausedTime = Date.now() - sw.startTime;
    sw.isPaused = true;

    setLocalStorage('stopwatch', sw);
    clearInterval(stopwatchInterval);
    updateStopwatchUI();
}

resumeBtn.addEventListener('click', resumeStopwatch);

function resumeStopwatch() {
    let sw = getLocalStorage('stopwatch');
    if (!sw || !sw.isRunning) return;

    sw.startTime = Date.now() - sw.pausedTime;
    sw.isPaused = false;

    setLocalStorage('stopwatch', sw);
    startStopwatchLoop();
    updateStopwatchUI();
}

confirmBtn.addEventListener('click', resetStopwatch);

function resetStopwatch() {
    let sw = getLocalStorage('stopwatch');
    if (!sw || !sw.isRunning) return;
    
    let ellapsedTime;

    if (sw.isPaused) {
        ellapsedTime = sw.pausedTime;
    } else {
        ellapsedTime = Date.now() - sw.startTime;
    }
    
    let time = milisecConverter(ellapsedTime);
    
    if (Number(time.min) < 10) {
        showError("Sorry, Atleast Study For 10 Mins!");
        return
    }
    
    let msg = `You Have Studied For ${time.hour} hour ${time.min} min ${time.sec} sec!`;
    
    showError(msg);
    
    sw.isRunning = false;
    sw.isPaused = null;
    sw.startTime = null;
    sw.pausedTime = 0;
    
    stopWatchDisplay.textContent = '00:00:00';
    taskBox.style.display = "none";
    
    ppBar.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
    
    setLocalStorage('stopwatch', sw);    
    updateStopwatchUI();
    clearInterval(stopwatchInterval);
    levelUp(ellapsedTime);
    createTaskList(getLocalStorage('stopwatch'));
    
    deleteObject("stopwatch");
}

////////////////////////
////UPDATE XP PP BARS
////////////////////////

function updateBar(bar, variable, value) {
    bar.style.setProperty(variable, value+"%")
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
    
    for (let i=1; i < levelGained; i++){
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
    await wait(animationTime);
    
}

function levelUp(ellapsedTime = null) {
    let playerData = getLocalStorage('playerData');
    let data = (getLocalStorage('timerObject') || getLocalStorage('stopwatch'));
    
    let oldLevel = playerData.lvl;
    let oldCycle = playerData.cycle;
    let gainedXp = 0;
    let gainedPp = 0;
    
    if (data && data.objectFor === 'timer') {
        
        let xpObject = {
            easy: 100,
            medium: 350,
            hard: 600        
        }
    
        let ppObject = {
            easy: 500,
            medium: 1600,
            hard: 2700
        }   
        
        let timeObject = {
            easy: 600,
            medium: 1800,
            hard: 3000
        }
        
        let difficulty = data.diffTxt.toLowerCase();
        
        gainedXp = xpObject[difficulty];
        gainedPp = ppObject[difficulty];
        
        data.xpEarned = gainedXp;
        data.ppEarned = gainedPp;
        data.studyTime = timeObject[difficulty];
        
        setLocalStorage('timerObject', data);
        
    }
    
    if (data && data.objectFor === 'stopwatch' && ellapsedTime !== null) {
        
        let studyTime = ellapsedTime/1000;
        let xpfactor;
        let xpConditions = [
            [studyTime >= 3000, 0.2],
            [studyTime >= 1800, 0.194],
            [studyTime >= 600, 0.166]
        ]
        
        for (const [condition, result] of xpConditions) {
            if (condition) {
                xpfactor = result;
                break;
            }
        }
        
        let ppfactor;
        let ppConditions = [
            [studyTime >= 3000, 0.9],
            [studyTime >= 1800, 0.889],
            [studyTime >= 600, 0.834]
        ]
        
        for (const [condition, result] of ppConditions) {
            if (condition) {
                ppfactor = result;
                break;
            }
        }
        
        gainedXp = Math.round(studyTime * xpfactor);
        gainedPp = Math.round(studyTime * ppfactor);
        
        data.xpEarned = gainedXp;
        data.ppEarned = gainedPp;
        data.studyTime = studyTime;
        
        setLocalStorage('stopwatch', data);
        
    }
    
    let totalXp = playerData.xp + gainedXp;
    let totalPp = playerData.pp + gainedPp;
    
    let xpResult = calculateLvl(totalXp, playerData.xpBase, playerData.xpMultiplier, playerData.lvl);
        
    let ppResult = calculateLvl(totalPp, playerData.ppBase, playerData.ppMultiplier, playerData.cycle);
        
    playerData.lvl = xpResult.lvl;
    playerData.xp = xpResult.leftOver;
    playerData.totalXp += gainedXp;
    playerData.totalPp += gainedPp;
    
    playerData.cycle = Math.min(
        ppResult.lvl,
        playerData.maxCycleAllowed
    );
    playerData.pp = ppResult.leftOver;
        
    setLocalStorage('playerData', playerData);
         
    renderXpBar(oldLevel);
    renderPpBar(oldCycle);
}


function whileObserving(element) {
    return new Promise(resolve => {
        const observer = new IntersectionObserver(entries => {
            
            if (entries[0].isIntersecting) {
                
                observer.disconnect();
                
                resolve();
            }
        }, {
            threshold: 0.5,
            rootMargin: "-18% 0px 0px 0px"
        })
        
        observer.observe(element);
    })
}

function calculateLvl(gained, base, multiplier, current) {
     
     if (!Number.isFinite(gained)) {
        showError("Invalid Gain Value!");
        return {
            lvl: current,
            leftOver: 0
        };
    }
       
    while (true) {
        let required = Math.floor(base * Math.pow(multiplier, current - 1));
        
        if (required <= 0) break;
        if (gained < required) break;
        gained -= required;
        current++;
    }
    
    return {
        lvl: current,
        leftOver: gained
    }
    
}

async function renderXpBar(oldLevel = null) {
    
    let playerData = getLocalStorage('playerData');
    
    let required = Math.floor(playerData.xpBase * Math.pow(playerData.xpMultiplier, playerData.lvl - 1));
    
    xpCount.textContent = ` ${playerData.xp} / ${required}`;
    
    let percentage = (playerData.xp/required)*100;
    
    if (oldLevel !== null) {
        let newLevel = playerData.lvl;
        let levelGained = newLevel - oldLevel;
        
        await whileObserving(xpBar);
        
        await animateBar(
            levelGained,
            xpBar,
            '--progress-xp',
            percentage,
            oldLevel,
            newLevel,
            level => {
                levelCount.textContent = level;
            }
        );
    } else {
        updateBar(xpBar, '--progress-xp', percentage);
        levelCount.textContent = `${playerData.lvl}`;
    }
    
}

async function renderPpBar(oldCycle = null) {
    let playerData = getLocalStorage('playerData');
    
    let required = Math.floor(playerData.ppBase * Math.pow(playerData.ppMultiplier, playerData.cycle - 1));
    
    let percentage = (playerData.pp/required)*100;
    
    if (oldCycle !== null) {
        let newCycle = playerData.cycle;
        let levelGained = newCycle - oldCycle;
        
        if (levelGained > 0) {
            for(let i = 0; i<levelGained; i++) {
                executeReward();
            }
        }
        
        await whileObserving(ppBar);
        
        await animateBar(
            levelGained,
            ppBar,
            '--progress-pp',
            percentage,
            oldCycle,
            newCycle,
            level => {
                if (level >= playerData.maxCycleAllowed) {
                    ppCount.textContent = `${playerData.maxCycleAllowed} (Max)`;
                } else {
                    ppCount.textContent = level;
                }
            },
            newCycle >= playerData.maxCycleAllowed
        );
        
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


////////////////////////
////REWARD SYSTEM
////////////////////////

let rewardArray = [
    "📕 30 Mins Of Reading Cote!",
    "💻 45 Mins of Coding!",
    "👑 30 Mins of Being King!"
];

const rewardObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        } else {
            entry.target.classList.remove('show');
        }
    })
}, {threshold: [0, 0.9]});

function executeReward() {
    let rewardData = getLocalStorage('rewardData');
    
    let playerData = getLocalStorage('playerData');
    
    if (playerData.rewardIndex >= rewardArray.length) return;
    
    let date = new Date().toLocaleDateString('en-GB');
    let time = new Date().toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit'
    });
    
    let rewardObject = {
        id: Date.now(),
        head: rewardArray[playerData.rewardIndex],
        time: `Achieved on ${date} at ${time}`,
        status: 'pending'
    }
    
    rewardData.push(rewardObject);
    playerData.rewardIndex++;
    
    setLocalStorage('rewardData', rewardData);
    setLocalStorage('playerData', playerData);
     
    renderReward();
}

function renderReward() {
    let rewardData = getLocalStorage('rewardData');
    
    rewardList.innerHTML = "<h3>🎁Reward Earned🎁</h3>";
    
    for (let i=0; i<rewardData.length; i++) {
        
        
        let rewardItem = document.createElement('div');
        rewardItem.classList.add('reward-item');
        rewardItem.dataset.id = rewardData[i].id;
    
        let rewardHead = document.createElement('h5');
        let rewardTime = document.createElement('p');
        let doneBtn = document.createElement('button');
    
        rewardHead.textContent = rewardData[i].head;
        rewardTime.textContent = rewardData[i].time;
        
        doneBtn.textContent = "Mark Done";
        doneBtn.classList.add('doneBtn');
        doneBtn.addEventListener('click', completeMark);
        
        rewardItem.appendChild(rewardHead);
        rewardItem.appendChild(rewardTime);
        rewardItem.appendChild(doneBtn);
        
        rewardList.appendChild(rewardItem);
        
        rewardObserver.observe(rewardItem);
    }
    
    if (!rewardList.classList.contains('show')) {
        rewardList.classList.add('show');
    }
    
    updateRewardUI();
}

function completeMark(e) {
    
    let confirmation = confirm("Mark THIS Reward As Completed?");
    
    if (!confirmation) return;
    
    let rewardData = getLocalStorage('rewardData');
    
    let currentRewardItem = e.target.closest('.reward-item');
    
    let currentID = Number(currentRewardItem.dataset.id);
    
    if (!currentID) {
        showError("Something went wrong setting rewards...");
        return
    }
    
    let reward = rewardData.find(item => item.id === currentID);
    
    if (reward) {
        reward.status = 'completed';
    } else {
        showError('Reward ID Mismatch..');
    }
    
    setLocalStorage('rewardData', rewardData);
    updateRewardUI();
}

function updateRewardUI() {
    
    let rewardData = getLocalStorage('rewardData');
    
    for (let i=0; i<rewardData.length; i++) {
        
        if (rewardData[i].status !== 'completed') continue;
        
        let completedReward = rewardList.querySelector(`[data-id = "${rewardData[i].id}"]`);
        
        if (!completedReward) continue;
        
        let btn = completedReward.querySelector('.doneBtn');
        
        if (btn) btn.remove();
             
        completedReward.classList.add('completed');
    }
    
    deployEmptyMsg();
}

function deployEmptyMsg() {
    let rewardData = getLocalStorage('rewardData');
    
    if (rewardData.length === 0 ) {
        rewardList.classList.remove('show');
        return;
    };
    
    let emptyMsg = rewardList.querySelector(".empty-message");
    
    if (!emptyMsg) {
        emptyMsg = document.createElement('h4');
        emptyMsg.classList.add('empty-message');
    }
    
    let ifAllCompleted = rewardData.every(reward => reward.status === "completed");
    
    let remaining = rewardArray.length - rewardData.length;
    
    if (remaining === 0 && ifAllCompleted) {
        emptyMsg.textContent = `All Rewards Completed! ✨`;
    } else if (remaining === 0 && !ifAllCompleted) {
        emptyMsg.textContent = `All Rewards Achieved! ⚡`;
    } else if (remaining > 0) {
        emptyMsg.textContent = `${remaining} More Reward(s) Remaining! 🌟`;
    } else {
        emptyMsg.remove();
        return;
    }
    
    rewardList.appendChild(emptyMsg);
};


//////////////////////////
////HISTORY PAGE SCRIPT
/////////////////////////

function createTaskList(data = null) {
    let taskData = getLocalStorage("taskData");
    if (!data || !taskData) return;
    
    let now = new Date();
    let finishDate = now.toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    let finishDay = now.toLocaleDateString("en-US", {
        weekday: 'long'
    });
    
    let finishTime = now.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit'
    });
    
    let taskObject = {
        id: Date.now(),
        startDate: data.startedAt,
        finishedAt: now.toISOString(),
        finishDate: finishDate,
        finishDay: finishDay,
        finishTime: finishTime,
        xpEarned: data.xpEarned,
        ppEarned: data.ppEarned,
        subject: data.subjectTxt,
        topic: data.topicTxt,
        studyTime: data.studyTime
    }
    
    taskData.push(taskObject);
    
    setLocalStorage('taskData', taskData);
    renderHistory();
}

function renderHistory() {

    const taskData = getLocalStorage("taskData");

    if (!taskData || taskData.length === 0) {
        historyStatus.textContent = "No History Records Yet...";
        return;
    }

    historyStatus.textContent =
        "History Records are kept for 365 Days!";
        
        historyCont.innerHTML = '';
        
      taskData.sort((a,b) => {
          return new Date(b.finishedAt) - new Date(a.finishedAt);
      });
      
      let getListedTask = {};
      
      for (const task of taskData) {
          let date = task.finishedAt.slice(0, 10);
          if (!getListedTask[date]) {
              getListedTask[date] = [];
          }
          
          getListedTask[date].push(task);
      }
      
      for (const date in getListedTask) {
          let taskForDay = getListedTask[date];
          
          let totalSeconds = 0;
          
          for (const task of taskForDay) {
              totalSeconds += Number(task.studyTime);
          }
          
          const historyBox = document.createElement('div');
          historyBox.classList.add('history-box');
          
          const dateForDay = document.createElement('h3');
          
          let theDate = new Date(date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
          });
          
          dateForDay.textContent = theDate;
          
          const totalTimeForDay = document.createElement('div');
          totalTimeForDay.id = 'totalTime';
          
          const convertedTime = milisecConverter(Number(totalSeconds)*1000);
          
          totalTimeForDay.innerHTML = 
          `
          <span class="label">Total Time:</span>
            <span class="time-group">
                <span class="time-num">${convertedTime.hour}</span><span class="time-unit">h</span>
                <span class="time-num">${convertedTime.min}</span><span class="time-unit">m</span>
                <span class="time-num">${convertedTime.sec}</span><span class="time-unit">s</span>
            </span>

          `;
          
          historyBox.appendChild(dateForDay);
            historyBox.appendChild(totalTimeForDay);
          //////Cards
          
          for (const task of taskForDay) {
              
              const historyCard = document.createElement('div');
              historyCard.classList.add('history-card');
              historyCard.dataset.id = task.id
              
              const cardHeader = document.createElement('div');
              cardHeader.classList.add('card-header');
              
              cardHeader.innerHTML = 
              
              `
              <span class="subject">${task.subject}</span>
              <span class="arrow">||</span>
              <span class="topic">${task.topic}</span>
              
              `;
              
              const cardStats = document.createElement('div');
              cardStats.classList.add('card-stats');
              
              cardStats.innerHTML = 
              
              `
              <span class="stat-pp">PP +${task.ppEarned}</span>
              <span class="stat-divider">||</span>
              <span class="stat-xp">XP +${task.xpEarned}</span>
              
              `;
              
              const cardTime = document.createElement('div');
              cardTime.classList.add('card-time');
              
              let subStudyTime = milisecConverter(Number(task.studyTime)*1000);
              
              cardTime.innerHTML = 
              
              `
              ⏱️ ${subStudyTime.hour}h ${subStudyTime.min}m ${subStudyTime.sec}s
              
              `;
              
              
              historyCard.appendChild(cardHeader);
              historyCard.appendChild(cardStats);
              historyCard.appendChild(cardTime);
              historyBox.appendChild(historyCard);
          }
          
          historyCont.appendChild(historyBox);
          
      }
}

historyCont.addEventListener('click', showDetail)

function showDetail(e) {
    
    let taskData = getLocalStorage("taskData");
   
    let clickedCard = e.target.closest('.history-card');
    
    if (!clickedCard) return;
    
    let thisCardID = Number(clickedCard.dataset.id);
    
    if (!thisCardID) {
        alert("No Data Found!");
        return;
    };
    
    let historyData = taskData.find(task => task.id === thisCardID);
    
    let dateObject = new Date(historyData.startDate);
    
    let startDate = dateObject.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        date: 'numeric'
    });
    
    let startTime = dateObject.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit'
    });
    
    let startDay = dateObject.toLocaleDateString('en-US', {
        weekday: 'long'
    });
    
    let dataString = 
        `
        id: ${historyData.id},
        
        Start Date: ${startDate},
        
        Start Day: ${startDay},
        
        Start Time: ${startTime},
        
        Finish Date: ${historyData.finishDate},
        
        Finish Day: ${historyData.finishDay},
        
        Finish Time: ${historyData.finishTime},
        
        XP Earned: +${historyData.xpEarned},
        
        PP Earned: +${historyData.ppEarned},
        
        Subject: ${historyData.subject},
        
        Topic: ${historyData.topic},
        
        Study Time: ${historyData.studyTime} Second(s)`
        
    alert(dataString);
}




////////////////    SERVIECE WORKER    /////////

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .then(() => console.log("Service Worker Registered"))
      .catch(err => console.error(err));
  });
};