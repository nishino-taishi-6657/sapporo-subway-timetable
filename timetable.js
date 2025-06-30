function applySavedTheme() {
    const isDark = localStorage.getItem('theme') === 'dark';
    document.body.classList.toggle('dark-mode', isDark);
}

function setupThemeToggle() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
    applySavedTheme();
}

// DOM読み込み時の初期化処理
document.addEventListener('DOMContentLoaded', async function () {
    const stationSelect = document.getElementById('station');
    const directionSelect = document.getElementById('direction');
    const dayTypeSelect = document.getElementById('dayType');
    const stations = await loadStations();

    // 駅リストを動的に生成
    stationSelect.innerHTML = stations.map(station =>
        `<option value="${station.filename}">${station.name}</option>`
    ).join('');

    const savedStation = localStorage.getItem('selectedStation') || stations[0].filename;
    stationSelect.value = savedStation;

    const selectedStationObj = stations.find(s => s.filename === savedStation);
    updateDirectionOptions(selectedStationObj);

    const savedDirection = localStorage.getItem('selectedDirection') || selectedStationObj.directions[0];
    directionSelect.value = savedDirection;

    dayTypeSelect.value = localStorage.getItem('selectedDayType') || '平日';

    stationSelect.addEventListener('change', function () {
        const currentStationObj = stations.find(s => s.filename === this.value);
        updateDirectionOptions(currentStationObj);
        localStorage.setItem('selectedStation', this.value);
        localStorage.setItem('selectedDirection', directionSelect.value);
        displayFullTimetable();
    });

    directionSelect.addEventListener('change', function () {
        localStorage.setItem('selectedDirection', this.value);
        displayFullTimetable();
    });

    dayTypeSelect.addEventListener('change', function () {
        localStorage.setItem('selectedDayType', this.value);
        displayFullTimetable();
    });

    displayFullTimetable();
    setupThemeToggle();
});

// stations.jsonを読み込む
async function loadStations() {
    const response = await fetch('data/stations.json');
    return await response.json();
}

// 駅の選択に応じて方面を設定（方面1つの場合は選択不可）
function updateDirectionOptions(stationObj) {
    const directionSelect = document.getElementById("direction");
    directionSelect.innerHTML = stationObj.directions
        .map(dir => `<option value="${dir}">${dir}</option>`).join('');
    directionSelect.disabled = stationObj.directions.length === 1;
}

// loadCSV関数内を以下のように修正
async function loadCSV(station) {
    const csvPath = `data/${station}_timetable.csv`;
    const response = await fetch(csvPath);
    const csvText = await response.text();
    return Papa.parse(csvText, { header: true }).data;
}

async function displayFullTimetable() {
    const stationSelect = document.getElementById('station');
    const directionSelect = document.getElementById('direction');
    const dayType = document.getElementById('dayType').value;

    const stationFileName = stationSelect.value;
    const stationName = stationSelect.options[stationSelect.selectedIndex].textContent;
    const direction = directionSelect.value;

    const data = await loadCSV(stationFileName);

    const groupedByHour = {};
    data.forEach(row => {
        if (row.曜日 === dayType && row.方向 === direction && row.駅名 === stationName) {
            let [hour, min] = row.発車時刻.split(':');
            hour = parseInt(hour, 10);
            if (hour === 0) hour = 24;
            if (!groupedByHour[hour]) groupedByHour[hour] = [];
            groupedByHour[hour].push(min);
        }
    });

    const hourGrid = document.getElementById('hourGrid');
    hourGrid.innerHTML = Object.keys(groupedByHour)
        .map(Number).sort((a, b) => a - b)
        .map(hour => `
            <button class="hour-tile" onclick="openModal('${hour % 24}', '${groupedByHour[hour].join(', ')}')">
                ${hour % 24}時
            </button>
        `).join('');
}

// モーダルを開く（分のみ表示）
function openModal(hour, minutes) {
    document.getElementById('modalTitle').innerText = `${hour}時の発車時刻`;
    document.getElementById('modalTimes').innerText = minutes;
    document.getElementById('modal').style.display = "block";
}

// モーダルを閉じる
function closeModal() {
    document.getElementById('modal').style.display = "none";
}

// 時刻検索機能
async function searchNearestTrains() {
    const stationSelect = document.getElementById('station');
    const directionSelect = document.getElementById('direction');
    const dayType = document.getElementById('dayType').value;
    const searchTime = document.getElementById('searchTime').value;

    if (!searchTime) {
        alert("時刻を入力してください");
        return;
    }

    const [searchHour, searchMin] = searchTime.split(':').map(Number);
    const searchMinutes = searchHour * 60 + searchMin;

    const stationFileName = stationSelect.value;
    const stationName = stationSelect.options[stationSelect.selectedIndex].textContent;
    const direction = directionSelect.value;

    const data = await loadCSV(stationFileName);

    const nearestTrains = data
        .filter(row => row.曜日 === dayType && row.方向 === direction && row.駅名 === stationName)
        .map(row => {
            const [hour, min] = row.発車時刻.split(':');
            return { time: row.発車時刻, totalMinutes: parseInt(hour) * 60 + parseInt(min) };
        })
        .filter(entry => entry.totalMinutes >= searchMinutes)
        .slice(0, 3);

    const searchResults = document.getElementById('searchResults');
    if (nearestTrains.length > 0) {
        searchResults.innerHTML = `<h3>近い電車</h3>
            <ul>
                ${nearestTrains.map(train => `<li>${train.time}（あと ${train.totalMinutes - searchMinutes} 分）</li>`).join('')}
            </ul>`;
    } else {
        searchResults.innerHTML = `<p>該当する電車がありません</p>`;
    }
}

