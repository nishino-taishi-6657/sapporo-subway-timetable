// テーマ設定を初期化
const prefersDark = localStorage.getItem('theme') === 'dark';
if (prefersDark) {
    document.body.classList.add('dark');
}

// ボタンが読み込まれてからイベントを設定
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('themeToggle');
    if (btn) {
        btn.addEventListener('click', () => {
            const enabled = document.body.classList.toggle('dark');
            localStorage.setItem('theme', enabled ? 'dark' : 'light');
        });
    }
});
