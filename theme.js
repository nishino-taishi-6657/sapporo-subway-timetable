// ページ読込時に保存されたテーマを適用
const prefersDark = localStorage.getItem('theme') === 'dark';
if (prefersDark) {
    document.body.classList.add('dark');
}

// フッターのボタンにイベントを登録
document.addEventListener('DOMContentLoaded', () => {
    function attachToggle() {
        const btn = document.getElementById('themeToggle');
        if (btn && !btn.dataset.listenerAdded) {
            const svgMoon = '<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 0111.21 3 7 7 0 1012 21a9 9 0 009-8.21z"></path></svg>';
            const svgSun  = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95 6.95l-1.41-1.41M5.46 5.46L4.05 4.05m12.9 0l-1.41 1.41M5.46 18.54l-1.41 1.41"></path></svg>';

            function updateIcon() {
                btn.innerHTML = document.body.classList.contains('dark') ? svgSun : svgMoon;
            }

            btn.addEventListener('click', () => {
                const enabled = document.body.classList.toggle('dark');
                localStorage.setItem('theme', enabled ? 'dark' : 'light');
                updateIcon();
            });

            updateIcon();
            btn.dataset.listenerAdded = 'true';
        }
    }

    attachToggle();
    new MutationObserver(attachToggle).observe(document.body, { childList: true, subtree: true });
});
