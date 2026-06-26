// Shared utilities
function getDateKey(date = new Date()) {
  return (
    date.getFullYear() +
    '-' +
    String(date.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(date.getDate()).padStart(2, '0')
  );
}

function getValueByLabel(label) {
    const option = [...document.getElementById("selDiff").options]
        .find(opt => opt.dataset.label === label);

    return option ? option.value : null;
}

function milisecConverter(timerTimeLeft) {
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
