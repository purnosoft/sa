// ===== Constants =====
const STORAGE_KEY = 'darkRewardsApp';
const MAX_REWARDS = 4;
const EMOJIS = ['🔮', '🎁', '🌟', '🍭'];

// ===== State =====
let rewards = [];
let locked = false;

// ===== DOM Elements =====
const container = document.getElementById('rewardCardsContainer');
const addBtn = document.getElementById('addRewardBtn');
const lockBtn = document.getElementById('lockBtn');
const statusHint = document.getElementById('statusHint');

// ===== Initialize =====
function loadFromStorage() {
    const stored = getLocalStorage(STORAGE_KEY);
    if (stored && Array.isArray(stored.rewards)) {
        rewards = stored.rewards.slice(0, MAX_REWARDS).map(r => ({ name: r.name || '' }));
        locked = stored.locked || false;
    } else {
        rewards = [];
        locked = false;
    }
}

function saveToStorage() {
    setLocalStorage(STORAGE_KEY, {
        rewards: rewards,
        locked: locked
    });
    // 🔔 Notify the reward list that rewards have been updated
    window.dispatchEvent(new Event('rewardsUpdated'));
}

function syncRewardDataWithRewardList() {
    let rewardData = getLocalStorage("rewardData") || [];

    // Rebuild rewardData based on the current reward list
    rewardData = rewardData
        .map(item => {
            const newIndex = rewards.findIndex(r => r.name === item.head);

            if (newIndex === -1) return null; // Reward no longer exists

            return {
                ...item,
                rewardIndex: newIndex
            };
        })
        .filter(Boolean);

    setLocalStorage("rewardData", rewardData);
}

// ===== Rendering =====
function renderRewardCards() {
    container.innerHTML = '';

    // 🎀 Empty state when no rewards exist
    if (rewards.length === 0 && !locked) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-rewards-state';
        emptyDiv.innerHTML = `
            <span class="empty-emoji">🎀</span>
            <p>Add your first reward to get sweet surprises!</p>
            <span class="empty-sub">✨ Tap the + button below ✨</span>
        `;
        container.appendChild(emptyDiv);
        updateAddButton();
        updateLockButtonText();
        updateStatus();
        return;
    }

    // Render reward cards
    const rewardData = getLocalStorage("rewardData") || [];

rewards.forEach((reward, index) => {

    const isCompleted = rewardData.some(r =>
        r.rewardIndex === index &&
        r.status === "completed"
    );

    const card = document.createElement("div");
    card.className = "reward-card";

    if (!locked) card.classList.add("editable");

    const emoji = EMOJIS[index] || "✨";

    card.innerHTML = `
        <span class="card-emoji">${emoji}</span>
        <span class="card-label">Reward ${index + 1}</span>

        <input
            type="text"
            class="reward-input"
            placeholder="Dream prize..."
            maxlength="30"
            value="${escapeHtml(reward.name)}"
            ${(locked || isCompleted) ? "disabled" : ""}
            ${locked ? 'style="display:none;"' : ""}
        >

        <span
            class="reward-name-display"
            ${locked ? "" : 'style="display:none;"'}
        >
            ${escapeHtml(reward.name) || "⋯"}
        </span>

        ${
            isCompleted
                ? `<span class="reward-completed-badge">🍀 Completed</span>`
                : `<button class="remove-reward-btn" ${locked ? 'style="display:none;"' : ""}>✕</button>`
        }
    `;

    if (!locked && !isCompleted) {

    const input = card.querySelector(".reward-input");

    input.addEventListener("input", e => {
        reward.name = e.target.value;
        updateStatus();
    });

    const removeBtn = card.querySelector(".remove-reward-btn");

    removeBtn.addEventListener("click", e => {
        e.stopPropagation();
        playSound('click');
        rewards.splice(index, 1);
        
        syncRewardDataWithRewardList();

        saveToStorage();
        renderAll();
    });

}

    container.appendChild(card);
        });

    updateAddButton();
    updateLockButtonText();
    updateStatus();
}

function updateAddButton() {
    if (locked) {
        addBtn.style.display = 'none';
    } else {
        addBtn.style.display = '';
        addBtn.disabled = rewards.length >= MAX_REWARDS;
        addBtn.innerHTML = '<span>＋</span> Add Reward';
    }
}

function updateLockButtonText() {
    lockBtn.innerHTML = locked ? '✏️ Edit Rewards' : '👑 Lock in Rewards';
}

function updateStatus() {
    const count = rewards.length;
    if (locked) {
        statusHint.textContent = `🧨 ${count} reward(s) locked and saved.`;
    } else {
        if (count === 0) {
            statusHint.textContent = '🎀 Ready to add your first reward!';
        } else if (count < MAX_REWARDS) {
            statusHint.textContent = `📋 ${count}/4 rewards configured.`;
        } else {
            statusHint.textContent = '🎉 All 4 rewards set! Lock them in.';
        }
    }
}

function renderAll() {
    renderRewardCards();
}

// ===== Add Reward =====
addBtn.addEventListener('click', () => {
    if (locked) return;
    playSound('click');
    if (rewards.length >= MAX_REWARDS) return;
    rewards.push({ name: '' });
    saveToStorage();   // dispatch is already inside saveToStorage()
    renderAll();
    const newCard = container.lastElementChild;
    if (newCard && newCard.classList.contains('reward-card')) {
        newCard.classList.add('pop');
        setTimeout(() => newCard.classList.remove('pop'), 500);
    }
});

// ===== Lock / Edit Toggle =====
lockBtn.addEventListener('click', () => {
    playSound('click');
    if (locked) {
        // Unlock to edit
        locked = false;
        saveToStorage();
        renderAll();
    } else {
        // Prevent locking when no rewards exist
        if (rewards.length === 0) {
            showError('🌸 Add at least one reward before locking!');
            return;
        }
        
        const emptyIndex = rewards.findIndex(r => !r.name.trim());

if (emptyIndex !== -1) {
    showError("🌸 Please name all rewards before locking!");

    return;
}

        syncRewardDataWithRewardList();

        locked = true;
        saveToStorage();
        renderAll();
    }
});

// ===== Escape HTML =====
function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ===== Start =====
loadFromStorage();

if (rewards.length > MAX_REWARDS) {
    rewards = rewards.slice(0, MAX_REWARDS);
}

renderAll();