// テーマ設定を初期化
const prefersDark = localStorage.getItem('theme') === 'dark';
if (prefersDark) {
    document.body.classList.add('dark');
}

// ボタンクリックでテーマを切り替え
document.getElementById('themeToggle').addEventListener('click', () => {
    const enabled = document.body.classList.toggle('dark');
    localStorage.setItem('theme', enabled ? 'dark' : 'light');
});
