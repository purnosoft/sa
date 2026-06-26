// Import / Export functionality
(() => {
  const uploadZone = document.getElementById('uploadZone');
  const fileInput = document.getElementById('fileInput');
  const fileInfo = document.getElementById('fileInfo');
  const fileNameEl = document.getElementById('fileName');
  const fileSizeEl = document.getElementById('fileSize');
  const removeBtn = document.getElementById('removeFile');
  const importBtn = document.getElementById('importBtn');
  const exportBtn = document.getElementById('exportBtn');

  importBtn.disabled = true;
  const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB
  const MAX_FILES = 1;

  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
    return `${size} ${sizes[i]}`;
  }

  function showToast(message, type = 'error') {
    const existingToast = document.querySelector('.upload-toast');
    if (existingToast) existingToast.remove();
    const toast = document.createElement('div');
    toast.className = `upload-toast upload-toast--${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function validateFile(file) {
    if (!file) return false;
    if (file.size > MAX_FILE_SIZE) {
      showToast(`File too large! Max size is ${formatBytes(MAX_FILE_SIZE)}`, 'error');
      playSound("error");
      return false;
    }
    return true;
  }

  function handleFile(file) {
    if (!validateFile(file)) {
      fileInput.value = '';
      return;
    }
    showFileInfo(file);
  }

  function showFileInfo(file) {
    if (!file) return;
    fileNameEl.textContent = file.name;
    fileSizeEl.textContent = formatBytes(file.size);
    fileInfo.classList.add('visible');
    importBtn.disabled = false;
    showToast('File ready to upload!', 'success');
    playSound("imported");
  }

  function hideFileInfo() {
    fileInfo.classList.remove('visible');
    fileNameEl.textContent = 'No file chosen';
    fileSizeEl.textContent = '—';
    fileInput.value = '';
    importBtn.disabled = true;
  }

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {
      handleFile(file);
    } else {
      hideFileInfo();
    }
  });

  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    playSound('click');
    hideFileInfo();
  });

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  });

  uploadZone.addEventListener('dragenter', () => {
    uploadZone.classList.add('dragover');
  });
  uploadZone.addEventListener('dragover', () => {
    uploadZone.classList.add('dragover');
  });
  uploadZone.addEventListener('dragleave', (e) => {
    if (!uploadZone.contains(e.relatedTarget)) {
      uploadZone.classList.remove('dragover');
    }
  });
  uploadZone.addEventListener('drop', (e) => {
    uploadZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > MAX_FILES) {
      showToast(`Only ${MAX_FILES} file allowed at a time`, 'error');
      return;
    }
    if (files.length > 0) {
      const file = files[0];
      if (!validateFile(file)) return;
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files;
      showFileInfo(file);
    }
  });

  uploadZone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });
  uploadZone.setAttribute('tabindex', '0');
})();

exportBtn.addEventListener('click', exportLocalStorage);

function exportLocalStorage() {
  let taskRunning = taskIsRunning();
  if (!taskRunning) {
    playSound("serror");
    return;
  }
  let lastExportedTime = getLocalStorage('lastExportedTime') || 0;
  const currentTime = Date.now();
  const coolDown = 120 * 1000;
  if (currentTime - lastExportedTime < coolDown) {
    let leftTime = Math.ceil(coolDown - (currentTime - lastExportedTime));
    let remaining = milisecConverter(leftTime);
    showError(`Please Wait ${remaining.min} Min And ${remaining.sec} Sec To Export Again`);
    playSound("serror");
    return;
  }
  let appData = getLocalStorage('appData');
  if (!appData) {
    showError("Error: App Data Not Found!");
    playSound("error");
    return;
  }
  const data = {};
  const excludedKeys = ["lastExportedTime"];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (excludedKeys.includes(key)) continue;
    data[key] = localStorage.getItem(key);
  }
  const backup = { app: "Study-Assist", displayName: appData.name, version: appData.version, data: data };
  const jsonText = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonText], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const now = new Date();
  const stamp = getDateKey(now) + '-' + String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
  const a = document.createElement("a");
  a.href = url;
  a.download = `SA-EXPORT-FILE-${stamp}.json`;
  a.click();
  lastExportedTime = Date.now();
  setLocalStorage('lastExportedTime', lastExportedTime);
  showError("BackUp Downloading...");
  URL.revokeObjectURL(url);
  playSound("success");
}

importBtn.addEventListener('click', async () => {
  const file = document.getElementById("fileInput").files[0];
  let taskRunning = taskIsRunning();
  if (!taskRunning) {
    playSound("serror");
    return;
  }
  try {
    await importLocalStorage(file);
    showError(" IMPORT SUCCESSFUL ");
  } catch (err) {
    showError(err);
  }
});

async function importLocalStorage(file) {
  const currentPlayerData = getLocalStorage('playerData');
  if (!file) {
    playSound("error");
    throw new Error("No file selected");
  }
  const text = await file.text();
  let backup;
  try {
    backup = JSON.parse(text);
  } catch {
    playSound("error");
    let playerState = getLocalStorage('playerState');
    
    playerState.earnedEasterEgg = true;
    setLocalStorage('playerState', playerState);
    
    checkAch();
    throw new Error("Corrupted JSON file");
  }
  if (backup.app !== "Study-Assist" || !backup.data || typeof backup.data !== "object") {
    playSound("serror");
    throw new Error("This file does not belong to this app");
  }
  let parsedData = JSON.parse(backup.data.playerData);
  if (parsedData.totalXp < currentPlayerData.totalXp) {
    const firstConfirmation = confirm("!!!!This Export Data Has Lower XP or Levels Than Your Current XP or Levels!!!! Do You Still Want To Import This File Data?");
    if (!firstConfirmation) {
      playSound("serror");
      throw new Error(" IMPORT CANCELED BY USER ");
    }
  }
  const secConfirmation = confirm(" Are You Sure, You Want To Overwrite Your Current Data? ");
  if (!secConfirmation) {
    playSound("serror");
    throw new Error(" IMPORT CANCELED BY USER ");
  }
  for (const key in backup.data) {
    localStorage.setItem(key, backup.data[key]);
  }
  playSound("success");
  resetForNewDay();
}

function resetForNewDay() {
  let appData = getLocalStorage("appData");
  if (appData && appData.lastActiveDay) {
    let importDate = getDateKey(new Date(appData.lastActiveDay));
    let today = getDateKey(new Date());
    if (today !== importDate) {
      updateStreak();
      resetForNewData();
    }
  }
  if (!appData) {
    appData = { name: "Study-Assist", version: 3.0, lastActiveDay: new Date() };
    setLocalStorage("appData", appData);
  }
}