document.addEventListener('DOMContentLoaded', function () {
    const stationSelect = document.getElementById('station');
    const directionSelect = document.getElementById('direction');
    const dayTypeSelect = document.getElementById('dayType');

    stationSelect.value = localStorage.getItem('selectedStation') || '栄町';
    directionSelect.value = localStorage.getItem('selectedDirection') || '福住方面';
    dayTypeSelect.value = localStorage.getItem('selectedDayType') || '平日';

    stationSelect.addEventListener('change', function () {
        localStorage.setItem('selectedStation', this.value);
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
});

// 📂 CSVデータを読み込む
async function loadCSV(station) {
    const csvPath = `data/${station}_timetable.csv`;
    const response = await fetch(csvPath);
    const csvText = await response.text();
    return Papa.parse(csvText, { header: true }).data;
}

// 🟢 時刻表タイル表示（並び順修正 & 00時を最後に表示）
async function displayFullTimetable() {
    const station = document.getElementById('station').value;
    const direction = document.getElementById('direction').value;
    const dayType = document.getElementById('dayType').value;
    const data = await loadCSV(station === '栄町' ? 'sakaemachi' : 'kita13');

    const groupedByHour = {};
    data.forEach(row => {
        if (row.曜日 === dayType && row.方向 === direction && row.駅名 === station) {
            let [hour, min] = row.発車時刻.split(':');
            hour = parseInt(hour, 10);
            if (hour === 0) hour = 24; // 00時を24時扱いにする
            if (!groupedByHour[hour]) groupedByHour[hour] = [];
            groupedByHour[hour].push(min);
        }
    });

    const hourGrid = document.getElementById('hourGrid');
    hourGrid.innerHTML = Object.keys(groupedByHour)
        .map(Number).sort((a, b) => a - b) // 数値でソート
        .map(hour => `
            <button class="hour-tile" onclick="openModal('${hour % 24}', '${groupedByHour[hour].join(', ')}')">${hour % 24}時</button>
        `).join('');
}

// ⏰ モーダルを開く（分のみ表示）
function openModal(hour, minutes) {
    document.getElementById('modalTitle').innerText = `${hour}時 の発車時刻`;
    document.getElementById('modalTimes').innerText = minutes;
    document.getElementById('modal').style.display = "block";
}

// ❌ モーダルを閉じる
function closeModal() {
    document.getElementById('modal').style.display = "none";
}

// 🔎 指定した時刻に最も近い電車3件を検索
async function searchNearestTrains() {
    const station = document.getElementById('station').value;
    const direction = document.getElementById('direction').value;
    const dayType = document.getElementById('dayType').value;
    const searchTime = document.getElementById('searchTime').value;

    if (!searchTime) {
        alert("時刻を入力してください");
        return;
    }

    const [searchHour, searchMin] = searchTime.split(':').map(Number);
    const searchMinutes = searchHour * 60 + searchMin;

    const data = await loadCSV(station === '栄町' ? 'sakaemachi' : 'kita13');

    const nearestTrains = data
        .filter(row => row.曜日 === dayType && row.方向 === direction && row.駅名 === station)
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
