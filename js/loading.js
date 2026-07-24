// ========================================
// LOADING MANAGER - tracks real progress
// ========================================
// ========================================
// LOADING MANAGER - tracks real progress
// ========================================
class LoadingManager {
    constructor() {
        this.tasks = [];
        this.totalWeight = 0;
        this.completedWeight = 0;
        this.onProgress = null;
        this.onComplete = null;
        this.globalMinTime = 2500;
        this.startTime = null;
    }

    addTask(name, taskFn, weight = 1, minTime = 300) {
        this.tasks.push({ name, taskFn, weight, minTime });
        this.totalWeight += weight;
    }

    async start() {
        this.startTime = Date.now();

        if (this.tasks.length === 0) {
            this._finish();
            return;
        }

        for (const task of this.tasks) {
            this._updateProgress(`${task.name}...`);

            const taskStart = Date.now();
            try {
                await task.taskFn();
            } catch (error) {
                showError(`Task "${task.name}" failed:`, error);
            }

            const elapsed = Date.now() - taskStart;
            if (elapsed < task.minTime) {
                await this._sleep(task.minTime - elapsed);
            }

            // Advance progress
            this.completedWeight += task.weight;
            const progress = Math.min(this.completedWeight / this.totalWeight, 1);
            this._updateProgress(`${task.name} done`, progress);
        }

        const totalElapsed = Date.now() - this.startTime;
        if (totalElapsed < this.globalMinTime) {
            await this._sleep(this.globalMinTime - totalElapsed);
        }

        this._finish();
    }

    /** Helper: sleep for ms milliseconds */
    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    _updateProgress(message, progress = null) {
        if (progress === null) {
            progress = this.completedWeight / this.totalWeight;
        }
        if (this.onProgress) {
            this.onProgress(progress, message);
        }
    }

    _finish() {
        if (this.onProgress) {
            this.onProgress(1, '🎉 All ready!');
        }
        if (this.onComplete) {
            this.onComplete();
        }
    }
}

// ========================================
// SIMULATED TASKS (replace with your real async functions)
// ========================================
function taskInitializeData() {
  return new Promise((resolve) => {
    initializeData();
    resolve();
  });
}

function taskCheckStreakReset() {
  return new Promise((resolve) => {
    checkStreakReset();
    resolve();
  });
}

function taskCheckResetLogic() {
  return new Promise((resolve) => {
    checkResetLogic();
    resolve();
  });
}

function taskBuildFilterTags() {
  return new Promise((resolve) => {
    buildFilterTags();
    resolve();
  });
}

function taskLoadAchUI() {
  return new Promise((resolve) => {
    loadAchUI();
    resolve();
  });
}

function taskRebuildList() {
  return new Promise((resolve) => {
    rebuildListFromStorage();
    resolve();
  });
}

function taskUpdateCount() {
  return new Promise((resolve) => {
    updateCount();
    resolve();
  });
}

function taskSyncRewards() {
  return new Promise((resolve) => {
    syncRewards();
    resolve();
  });
}

function taskRenderReward() {
  return new Promise((resolve) => {
    renderReward();
    resolve();
  });
}

function taskRenderAll() {
  return new Promise((resolve) => {
    if (typeof renderAll === "function") {
      renderAll();
    }
    resolve();
  });
}

// ========================================
// DOM ELEMENTS
// ========================================
const loadingScreen = document.getElementById('loading-screen');
const progressFillOnLoad = document.getElementById('progress-fill');
const progressPercentOnLoad = document.getElementById('progress-percent');
const statusMsg = document.getElementById('status-msg');
const app = document.querySelector('.main-cont');

// ========================================
// SETUP LOADING MANAGER & START
// ========================================
const loader = new LoadingManager();
loader.globalMinTime = 2800;

loader.onProgress = (progress, message) => {
    progressFillOnLoad.style.width = `${progress * 100}%`;
    progressPercentOnLoad.textContent = Math.round(progress * 100);
    if (message) statusMsg.textContent = message;
};

loader.onComplete = () => {
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        app.classList.add('visible');
        document.body.style.overflow = '';
    }, 400);
};

// ADD YOUR TASKS

loader.addTask('📑 Initializing data', taskInitializeData, 3, 400);
loader.addTask('⚡ Checking streak', taskCheckStreakReset, 1, 300);
loader.addTask('♻️ Resetting logic', taskCheckResetLogic, 1, 300);
loader.addTask('🎀 Building filters', taskBuildFilterTags, 1, 350);
loader.addTask('🏆 Loading Achievements', taskLoadAchUI, 3, 600);
loader.addTask('🧩 Rebuilding list', taskRebuildList, 2, 400);
loader.addTask('🪄 Updating counts', taskUpdateCount, 1, 400);
loader.addTask('🎁 Syncing rewards', taskSyncRewards, 1, 300);
loader.addTask('💎 Rendering rewards', taskRenderReward, 2, 500);
loader.addTask('☃️ Final render', taskRenderAll, 3, 1000);

// START THE LOADING PROCESS
loader.start();