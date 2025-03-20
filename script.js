// ⏰ 現在時刻をリアルタイムで表示する関数
function updateCurrentTime() {
    const now = new Date();
    document.getElementById('currentTime').textContent = now.toLocaleString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}
setInterval(updateCurrentTime, 1000); 

document.addEventListener("DOMContentLoaded", function () {
    const stationSelect = document.getElementById("station");
    const directionSelect = document.getElementById("direction");

    // 初回ロード時に localStorage から設定を取得（ない場合は栄町駅＆福住方面）
    const savedStation = localStorage.getItem("selectedStation") || "栄町";
    const savedDirection = localStorage.getItem("selectedDirection") || "福住方面";

    stationSelect.value = savedStation;
    updateDirectionOptions(savedStation);
    directionSelect.value = savedDirection;

    // イベントリスナー設定
    stationSelect.addEventListener("change", function () {
        updateDirectionOptions(this.value);
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

// 🚆 駅の選択に応じて方面を変更
function updateDirectionOptions(station) {
    const directionSelect = document.getElementById("direction");
    directionSelect.innerHTML = "";

    if (station === "栄町") {
        directionSelect.innerHTML = '<option value="福住方面">福住方面</option>';
    } else {
        directionSelect.innerHTML =
            '<option value="福住方面">福住方面</option><option value="栄町方面">栄町方面</option>';
    }
}

// 📂 CSVデータを読み込む関数
async function loadCSV(station) {
    const csvPath = `data/${station}_timetable.csv`;
    const response = await fetch(csvPath);
    const csvText = await response.text();
    return Papa.parse(csvText, { header: true }).data;
}

// 📅 時刻表を表示する関数（修正後）
async function displayTimetable() {
    const station = document.getElementById('station').value;
    const direction = document.getElementById('direction').value;
    const data = await loadCSV(station === '栄町' ? 'sakaemachi' : 'kita13');

    if (!data.length) {
        document.getElementById("timetable").innerHTML = "<p>時刻表データがありません</p>";
        return;
    }

    const now = new Date();
    const todayType = now.getDay() === 0 || now.getDay() === 6 ? '土日祝' : '平日';
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const filtered = data
        .filter(row => row.曜日 === todayType && row.方向 === direction && row.駅名 === station)
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

// 🛑 更新ボタンの連打防止（5秒間クールダウン）
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

// 初回表示
updateCurrentTime();
displayTimetable();