describe('tests', () => {
  let randomString = Math.random().toString(36).substring(2);
  let email = "auto_" + randomString + "@email.com";
  const password = "Password1";
  describe('via UI', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3000/#/');
      cy.get('button[aria-label="Close Welcome Banner"]').click();
      cy.get('button[id="navbarAccount"]').click();
      cy.get('button[id="navbarLoginButton"]').click();
      cy.url().should('include', '/login');
    });
    it('test valid signup', () => {
      cy.get('#newCustomerLink').contains('Not yet a customer?').click({force: true});
      cy.url().should('include', '/register');
      cy.get('#emailControl').type(email);
      cy.get('#passwordControl').type(password);
      cy.get('#repeatPasswordControl').type(password);
      cy.get('[aria-label="Selection list for the security question"]').click();
      cy.get('[class="mat-option-text"]').contains(' Paternal grandmother\'s first name? ').click();
      cy.get('#securityAnswerControl').type(randomString);
      cy.get('#registerButton').click();
      cy.get('.mat-snack-bar-container').should('contain', 'Registration completed successfully.');
    });
    it('test valid login', () => {
      cy.get('#email').type(email);
      cy.get('#password').type(password);
      cy.get('#loginButton').click();
      cy.url().should('include', '/search');
      cy.get('.fa-layers-counter').contains(0).should('be.visible');
    });
  });
  describe('via API', () => {
    const userCredentials = {
      "email": email,
      "password": password
    }
    it('valid login via api', () => {
      cy.request('POST', 'http://localhost:3000/rest/user/login', userCredentials)
        .then(response => {
          expect(response.status).to.eq(200);
        });
    });
    it('valid login via token', () => {
      cy.request('POST', 'http://localhost:3000/rest/user/login', userCredentials)
        .its('body').then(body => {
        const token = body.authentication.token;
        cy.wrap(token).as('userToken');
        const userToken = cy.get('@userToken');
        cy.visit('http://localhost:3000/', {
          onBeforeLoad(browser) {
            browser.localStorage.setItem("token", userToken);
          }
        });
        cy.get('button[aria-label="Close Welcome Banner"]').click();
        cy.get('.fa-layers-counter').contains(0).should('be.visible');
      });
    });
  });
});