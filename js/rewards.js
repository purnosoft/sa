// Reward system – dynamically uses user-defined rewards from darkRewardsApp

/* ------------------------------------------------------------
   Helper: Get non‑empty reward names from the rewards page
------------------------------------------------------------ */
function getUserRewardNames() {
    const stored = getLocalStorage("darkRewardsApp");

    if (!stored || !Array.isArray(stored.rewards)) {
        return [];
    }

    // Keep reward positions!
    return stored.rewards.map(r => (r.name || "").trim());
}

/* ------------------------------------------------------------
   Sync missing rewards – creates entries for any previously
   earned rewards that weren't saved because no names existed.
   ✅ Now checks by rewardIndex to avoid duplicates!
------------------------------------------------------------ */
function syncRewards() {

    const rewardNames = getUserRewardNames();

    let playerData = getLocalStorage("playerData");
    let rewardData = getLocalStorage("rewardData") || [];

    const earnedCount = playerData.rewardIndex || 0;

    if (earnedCount === 0) return;

    let changed = false;

    for (let i = 0; i < earnedCount; i++) {

        const name = rewardNames[i];

        // This reward hasn't been named yet
        if (!name) continue;

        const existingReward = rewardData.find(
            reward => reward.rewardIndex === i
        );

        if (existingReward) {

            // Update the name if the user renamed it
            if (existingReward.head !== name) {
                existingReward.head = name;
                changed = true;
            }

            continue;
        }

        const date = new Date().toLocaleDateString("en-GB");
        const time = new Date().toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit"
        });

        rewardData.push({
            id: Date.now() + i,
            rewardIndex: i,
            head: name,
            time: `Achieved on ${date} at ${time}`,
            status: "pending"
        });

        changed = true;
    }

    if (changed) {
        setLocalStorage("rewardData", rewardData);

        const playerState = getLocalStorage("playerState");
        playerState.rewardStreak = rewardData.length;
        setLocalStorage("playerState", playerState);

        checkAch();
    }
}

/* ------------------------------------------------------------
   Observer for reward list items
------------------------------------------------------------ */
const rewardObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        } else {
            entry.target.classList.remove('show');
        }
    });
}, { threshold: [0, 0.9] });

/* ------------------------------------------------------------
   Show a playful message when no rewards are configured at all
------------------------------------------------------------ */
function showNoRewardsMessage() {
    rewardList.innerHTML = `
        <div class="no-rewards-message">
    <span class="empty-emoji">🎀</span>
    <p class="no-reward-title">You've earned a reward!</p>
    <p class="no-reward-subtitle">Let's give it a beautiful name! ✨</p>

    <button
    id="goToRewardsBtn"
    class="go-rewards-btn"
    data-page="rewardsPage">
        🌸 Set My Rewards
    </button>
</div>
    `;
    
    setupGoToRewardsButton();
}


function setupGoToRewardsButton() {
    const btn = document.getElementById("goToRewardsBtn");

    if (!btn) return;

    btn.addEventListener("click", (e) => {
        const targetPageId = e.currentTarget.dataset.page;

        // Remove current active states
        document.querySelectorAll(".nav-button.active, .menu-button.active")
            .forEach(active => active.classList.remove("active"));

        document.querySelectorAll(".page.activePage")
            .forEach(page => page.classList.remove("activePage"));

        // Open target page
        const targetPage = document.getElementById(targetPageId);
        if (targetPage) targetPage.classList.add("activePage");

        // Highlight the corresponding navigation button
        const navBtn = document.querySelector(`[data-page="${targetPageId}"]`);
        if (navBtn) navBtn.classList.add("active");

        playSound("click");
    });
}

/* ------------------------------------------------------------
   Execute a reward (called when player earns one)
------------------------------------------------------------ */
function executeReward() {
    const rewardNames = getUserRewardNames();
    let playerData = getLocalStorage('playerData');
    let playerState = getLocalStorage('playerState');
    let rewardData = getLocalStorage('rewardData') || [];

    // Maximum 4 rewards overall
    if (playerData.rewardIndex >= 4) return;

    // Always count the earned reward
    playerData.rewardIndex++;
    setLocalStorage('playerData', playerData);

    // No names at all? Show the friendly message and stop
    if (!rewardNames.some(name => name)) {
        showNoRewardsMessage();
        rewardList.classList.add('show');
        return;
    }

    // If a name exists for this reward, add it to the list
    const rewardIdx = playerData.rewardIndex - 1;
    if (rewardIdx < rewardNames.length) {
        const date = new Date().toLocaleDateString('en-GB');
        const time = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        const rewardObject = {
            id: Date.now(),
            rewardIndex: rewardIdx,     // 🔑 record which reward slot this is
            head: rewardNames[rewardIdx],
            time: `Achieved on ${date} at ${time}`,
            status: 'pending'
        };
        rewardData.push(rewardObject);
        setLocalStorage('rewardData', rewardData);
    }

    renderReward();
    
    rewardData = getLocalStorage("rewardData") || [];

    playerState.rewardStreak = rewardData.length;
    setLocalStorage("playerState", playerState);

    checkAch();
}

/* ------------------------------------------------------------
   Render the list of earned rewards
------------------------------------------------------------ */
function renderReward() {
    syncRewards();   // always sync before rendering

    const rewardNames = getUserRewardNames();
    const rewardData = getLocalStorage('rewardData') || [];
    const playerData = getLocalStorage('playerData');

   const hasEarned = playerData.rewardIndex > 0;

// Hide the reward section until at least one reward is earned
if (!hasEarned) {
    rewardList.classList.remove("show");
    rewardList.innerHTML = "";
    return;
}

rewardList.classList.add("show");

const hasNames = rewardNames.some(name => name);

// If rewards have been earned but none are named yet
if (!hasNames) {
    showNoRewardsMessage();
    return;
}

    // If we have earned rewards but no names, show the “set rewards” message
    if (!hasNames && hasEarned) {
        showNoRewardsMessage();
        return;
    }

    // Normal rendering
    rewardList.innerHTML = "<h3>🎁Reward Earned🎁</h3>";

    for (let i = 0; i < rewardData.length; i++) {
        const rewardItem = document.createElement('div');
        rewardItem.classList.add('reward-item');
        rewardItem.dataset.id = rewardData[i].id;

        const rewardHead = document.createElement('h5');
        const rewardTime = document.createElement('p');
        const doneBtn = document.createElement('button');

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

    updateRewardUI();
}

/* ------------------------------------------------------------
   Mark a reward as completed
------------------------------------------------------------ */
function completeMark(e) {
    const confirmation = confirm("Mark THIS Reward As Completed?");
    if (!confirmation) return;

    const rewardData = getLocalStorage('rewardData');
    const currentRewardItem = e.target.closest('.reward-item');
    const currentID = Number(currentRewardItem.dataset.id);

    if (!currentID) {
        showError("Something went wrong setting rewards...");
        return;
    }

    const reward = rewardData.find(item => item.id === currentID);
    if (reward) {
        reward.status = 'completed';
    } else {
        showError('Reward ID Mismatch..');
    }

    setLocalStorage('rewardData', rewardData);
    
    if (typeof renderAll === "function") {
        renderAll();
    } 
    
    updateRewardUI();
    playSound('success');
}

/* ------------------------------------------------------------
   Update UI – remove "Mark Done" buttons for completed rewards
------------------------------------------------------------ */
function updateRewardUI() {
    const rewardData = getLocalStorage('rewardData') || [];
    for (let i = 0; i < rewardData.length; i++) {
        if (rewardData[i].status !== 'completed') continue;
        const completedReward = rewardList.querySelector(`[data-id = "${rewardData[i].id}"]`);
        if (!completedReward) continue;
        const btn = completedReward.querySelector('.doneBtn');
        if (btn) btn.remove();
        completedReward.classList.add('completed');
    }
    deployEmptyMsg();
}

/* ------------------------------------------------------------
   Show a status message (remaining, all done, etc.)
------------------------------------------------------------ */
function deployEmptyMsg() {
    const rewardNames = getUserRewardNames();
    const rewardData = getLocalStorage('rewardData') || [];

    if (rewardNames.length === 0) return;
    if (rewardData.length === 0) return;

    let emptyMsg = rewardList.querySelector(".empty-message");
    if (!emptyMsg) {
        emptyMsg = document.createElement('h4');
        emptyMsg.classList.add('empty-message');
    }

    const allCompleted = rewardData.every(reward => reward.status === "completed");
    const remaining = rewardNames.length - rewardData.length;

    if (remaining === 0 && allCompleted) {
        emptyMsg.textContent = `All Rewards Completed! ✨`;
    } else if (remaining === 0 && !allCompleted) {
        emptyMsg.textContent = `All Rewards Achieved! ⚡`;
    } else if (remaining > 0) {
        emptyMsg.textContent = `${remaining} More Reward(s) Remaining! 🌟`;
    } else {
        emptyMsg.remove();
        return;
    }

    rewardList.appendChild(emptyMsg);
}

/* ------------------------------------------------------------
   Listen for rewards update from the settings page
------------------------------------------------------------ */
window.addEventListener('rewardsUpdated', () => {
    syncRewards();
    renderReward();
});
