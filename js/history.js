// History page logic
function createTaskList(data = null) {
  let taskData = getLocalStorage("taskData");
  if (!data || !taskData) return;

  let now = new Date();
  
  let currentFinishTime = now.getHours();
  if (currentFinishTime >= 0 && currentFinishTime <= 4) {
      
      let playerState = getLocalStorage("playerState");
      if (!playerState) {showError("Player State Undefined"); return};
      
      playerState.midNightTaskCount++;
      setLocalStorage("playerState", playerState);
      checkAch();
  }
  
  let finishDate = now.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
  let finishDay = now.toLocaleDateString("en-US", { weekday: 'long' });
  let finishTime = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' });
  const finishDateKey = getDateKey(now);
  let taskObject = {
    id: Date.now(),
    startDate: data.startedAt,
    finishedAt: now.toISOString(),
    finishDateKey: finishDateKey,
    finishDate: finishDate,
    finishDay: finishDay,
    finishTime: finishTime,
    xpEarned: data.xpEarned,
    ppEarned: data.ppEarned,
    subject: data.subjectTxt,
    topic: data.topicTxt,
    studyTime: data.studyTime
  };
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
  historyStatus.textContent = "History Records are kept for 365 Days!";
  historyCont.innerHTML = '';
  taskData.sort((a, b) => {
    return new Date(b.finishedAt) - new Date(a.finishedAt);
  });
  let getListedTask = {};
  for (const task of taskData) {
    let date = task.finishDateKey;
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
    let theDate = new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    dateForDay.textContent = theDate;
    const totalTimeForDay = document.createElement('div');
    totalTimeForDay.id = 'totalTime';
    const convertedTime = milisecConverter(Number(totalSeconds) * 1000);
    totalTimeForDay.innerHTML = `
      <span class="label">Total Time:</span>
      <span class="time-group">
        <span class="time-num">${convertedTime.hour}</span><span class="time-unit">h</span>
        <span class="time-num">${convertedTime.min}</span><span class="time-unit">m</span>
        <span class="time-num">${convertedTime.sec}</span><span class="time-unit">s</span>
      </span>
    `;
    historyBox.appendChild(dateForDay);
    historyBox.appendChild(totalTimeForDay);
    for (const task of taskForDay) {
      const historyCard = document.createElement('div');
      historyCard.classList.add('history-card');
      historyCard.dataset.id = task.id;
      const cardHeader = document.createElement('div');
      cardHeader.classList.add('card-header');
      cardHeader.innerHTML = `
        <span class="subject">${task.subject}</span>
        <span class="arrow">||</span>
        <span class="topic">${task.topic}</span>
      `;
      const cardStats = document.createElement('div');
      cardStats.classList.add('card-stats');
      cardStats.innerHTML = `
        <span class="stat-pp">PP +${task.ppEarned}</span>
        <span class="stat-divider">||</span>
        <span class="stat-xp">XP +${task.xpEarned}</span>
      `;
      const cardTime = document.createElement('div');
      cardTime.classList.add('card-time');
      let subStudyTime = milisecConverter(Number(task.studyTime) * 1000);
      cardTime.innerHTML = ` ⏱️ ${subStudyTime.hour}h ${subStudyTime.min}m ${subStudyTime.sec}s `;
      historyCard.appendChild(cardHeader);
      historyCard.appendChild(cardStats);
      historyCard.appendChild(cardTime);
      historyBox.appendChild(historyCard);
    }
    historyCont.appendChild(historyBox);
  }
}

historyCont.addEventListener('click', showDetail);

function showDetail(e) {
  let taskData = getLocalStorage("taskData");
  let clickedCard = e.target.closest('.history-card');
  if (!clickedCard) return;
  let thisCardID = Number(clickedCard.dataset.id);
  if (!thisCardID) {
    alert("No Data Found!");
    return;
  }
  let historyData = taskData.find(task => task.id === thisCardID);
  let dateObject = new Date(historyData.startDate);
  let startDate = dateObject.toLocaleDateString('en-US', { year: 'numeric', month: 'long', date: 'numeric' });
  let startTime = dateObject.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' });
  let startDay = dateObject.toLocaleDateString('en-US', { weekday: 'long' });
  let dataString = `
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
    Study Time: ${historyData.studyTime} Second(s)`;
  playSound('click');
  alert(dataString);
}