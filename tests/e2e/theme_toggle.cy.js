// ハンバーガーメニューとテーマ切り替えの E2E テスト
 describe('menu and theme', () => {
     it('opens menu and toggles theme', () => {
         cy.visit('index.html');
         cy.get('#menuBtn').click();
         cy.get('#sideMenu').should('be.visible');
         cy.get('#themeToggle').click();
         cy.get('body').should('have.class', 'dark');
         cy.get('#overlay').click();
         cy.get('#sideMenu').should('not.be.visible');
     });
 });
