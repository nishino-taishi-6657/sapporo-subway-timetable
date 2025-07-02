// テーマ設定を初期化
const prefersDark = localStorage.getItem('theme') === 'dark';
if (prefersDark) {
    document.body.classList.add('dark');
}

// ボタンが読み込まれてからイベントを設定
// ボタンの存在を監視してイベントを登録
document.addEventListener('DOMContentLoaded', () => {
    function attachToggle() {
        const btn = document.getElementById('themeToggle');
        if (btn && !btn.dataset.listenerAdded) {
            btn.addEventListener('click', () => {
                const enabled = document.body.classList.toggle('dark');
                localStorage.setItem('theme', enabled ? 'dark' : 'light');
            });
            btn.dataset.listenerAdded = 'true';
        }
    }

    attachToggle();
    new MutationObserver(attachToggle).observe(document.body, { childList: true, subtree: true });
});
