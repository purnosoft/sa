// Reward system
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
  });
}, { threshold: [0, 0.9] });

function executeReward() {
  let rewardData = getLocalStorage('rewardData');
  let playerData = getLocalStorage('playerData');
  let playerState = getLocalStorage('playerState');
  if (playerData.rewardIndex >= rewardArray.length) return;
  let date = new Date().toLocaleDateString('en-GB');
  let time = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  let rewardObject = {
    id: Date.now(),
    head: rewardArray[playerData.rewardIndex],
    time: `Achieved on ${date} at ${time}`,
    status: 'pending'
  };
  rewardData.push(rewardObject);
  playerData.rewardIndex++;
  
  playerState.rewardStreak = playerData.rewardIndex;
  
  
  setLocalStorage('rewardData', rewardData);
  setLocalStorage('playerData', playerData);
  setLocalStorage('playerState', playerState);
  renderReward();
  checkAch();
}

function renderReward() {
  let rewardData = getLocalStorage('rewardData');
  rewardList.innerHTML = "<h3>🎁Reward Earned🎁</h3>";
  for (let i = 0; i < rewardData.length; i++) {
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
    doneBtn.addEventListener('click', (e) => {
      playSound('click');
      completeMark(e);
    });
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
    return;
  }
  let reward = rewardData.find(item => item.id === currentID);
  if (reward) {
    reward.status = 'completed';
  } else {
    showError('Reward ID Mismatch..');
  }
  setLocalStorage('rewardData', rewardData);
  updateRewardUI();
  playSound('success');
}

function updateRewardUI() {
  let rewardData = getLocalStorage('rewardData');
  for (let i = 0; i < rewardData.length; i++) {
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
  if (rewardData.length === 0) {
    rewardList.classList.remove('show');
    return;
  }
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
}