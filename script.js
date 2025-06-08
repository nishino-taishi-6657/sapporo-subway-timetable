// ⏰ 現在時刻をリアルタイム表示
function updateCurrentTime() {
    const now = new Date();
    document.getElementById('currentTime').textContent = now.toLocaleString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}
setInterval(updateCurrentTime, 1000);

// stations.jsonを読み込む関数を追加
async function loadStations() {
    const response = await fetch('data/stations.json');
    return await response.json();
}

// 駅選択時に方面をJSONに従ってロックする処理
function updateDirectionOptions(stationObj) {
    const directionSelect = document.getElementById("direction");
    directionSelect.innerHTML = stationObj.directions
        .map(dir => `<option value="${dir}">${dir}</option>`).join('');
    directionSelect.disabled = stationObj.directions.length === 1;
}


// 📂 CSVを読み込む関数
async function loadCSV(filename) {
    const response = await fetch(`data/${filename}`);
    const csvText = await response.text();
    return Papa.parse(csvText, { header: true }).data;
}

// 📅 時刻表を表示する関数
async function displayTimetable() {
    const stationSelect = document.getElementById('station');
    const directionSelect = document.getElementById('direction');
    const stationName = stationSelect.options[stationSelect.selectedIndex].textContent;
    const direction = directionSelect.value;

    const data = await loadCSV(stationSelect.value);
    if (!data.length) {
        document.getElementById("timetable").innerHTML = "<p>時刻表データがありません</p>";
        return;
    }

    const now = new Date();
    const todayType = now.getDay() === 0 || now.getDay() === 6 ? '土日祝' : '平日';
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const filtered = data
        .filter(row => row.曜日 === todayType && row.方向 === direction && row.駅名 === stationName)
        .map(row => {
            const [hour, min] = row.発車時刻.split(':');
            return { time: row.発車時刻, minutes: parseInt(hour) * 60 + parseInt(min) };
        })
        .filter(entry => entry.minutes >= currentTime)
        .slice(0, 3);

    const timetableDiv = document.getElementById('timetable');
    timetableDiv.innerHTML = filtered.length > 0 ? filtered.map(entry => `
        <div class="timetable-card">
            <div class="time">${entry.time}</div>
            <div class="remaining-time">あと ${entry.minutes - currentTime} 分</div>
        </div>
    `).join('') : '<p>本日これ以上の電車はありません</p>';
}

// 🛑 更新ボタン連打防止 (5秒間)
let lastUpdateTime = 0;
const updateCooldown = 5000;

document.getElementById("refreshBtn").addEventListener("click", function () {
    const now = Date.now();
    if (now - lastUpdateTime < updateCooldown) {
        alert("短時間での連続更新はできません。少し待ってください。");
        return;
    }

    lastUpdateTime = now;
    this.disabled = true;
    this.classList.add("disabled");
    this.textContent = "更新中...";

    setTimeout(() => {
        this.disabled = false;
        this.classList.remove("disabled");
        this.textContent = "更新";
    }, updateCooldown);

    displayTimetable();
});

// 📌 DOM読み込み完了時処理
document.addEventListener("DOMContentLoaded", async function () {
    const stationSelect = document.getElementById("station");
    const directionSelect = document.getElementById("direction");
    const stations = await loadStations();

    // 駅リストの動的作成
    stationSelect.innerHTML = stations.map(station =>
        `<option value="${station.filename}">${station.name}</option>`
    ).join('');

    // localStorageから取得した値を使って選択状態を復元
    const savedStation = localStorage.getItem("selectedStation") || stations[0].filename;
    stationSelect.value = savedStation;

    const selectedStationObj = stations.find(s => s.filename === savedStation);
    updateDirectionOptions(selectedStationObj);

    const savedDirection = localStorage.getItem("selectedDirection") || selectedStationObj.directions[0];
    directionSelect.value = savedDirection;

    stationSelect.addEventListener("change", function () {
        const currentStationObj = stations.find(s => s.filename === this.value);
        updateDirectionOptions(currentStationObj);
        localStorage.setItem("selectedStation", this.value);
        localStorage.setItem("selectedDirection", directionSelect.value);
        displayTimetable();
    });

    directionSelect.addEventListener("change", function () {
        localStorage.setItem("selectedDirection", this.value);
        displayTimetable();
    });

    displayTimetable();
});

// ⏰ 初回時刻表示
updateCurrentTime();
