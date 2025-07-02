// メニュー開閉とフォーカストラップ
 document.addEventListener('DOMContentLoaded', () => {
     const menuBtn = document.getElementById('menuBtn');
     const sideMenu = document.getElementById('sideMenu');
     const overlay = document.getElementById('overlay');

     let firstFocus;
     let lastFocus;

     function setFocusables() {
         const focusables = sideMenu.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
         firstFocus = focusables[0];
         lastFocus = focusables[focusables.length - 1];
     }

     function openMenu() {
         document.body.classList.add('menu-open');
         setFocusables();
         firstFocus && firstFocus.focus();
         sideMenu.addEventListener('keydown', trapFocus);
     }

     function closeMenu() {
         document.body.classList.remove('menu-open');
         sideMenu.removeEventListener('keydown', trapFocus);
         menuBtn.focus();
     }

     function trapFocus(e) {
         if (e.key !== 'Tab') return;
         if (e.shiftKey && document.activeElement === firstFocus) {
             e.preventDefault();
             lastFocus.focus();
         } else if (!e.shiftKey && document.activeElement === lastFocus) {
             e.preventDefault();
             firstFocus.focus();
         }
     }

     menuBtn.addEventListener('click', () => {
         if (document.body.classList.contains('menu-open')) {
             closeMenu();
         } else {
             openMenu();
         }
     });

     overlay.addEventListener('click', closeMenu);

     document.addEventListener('keydown', (e) => {
         if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
             closeMenu();
         }
     });

     if (window.attachThemeToggle) {
         window.attachThemeToggle();
     }
 });
