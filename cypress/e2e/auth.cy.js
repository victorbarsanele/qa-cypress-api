/// <reference types="cypress" />

describe('Auth API', () => {

  beforeEach(() => {
    cy.fixture('user').as('userData');
  });

  it('should login via API and authenticate user', function () {

    cy.createUser(this.userData)
      .then((user) => {

        cy.request({
          method: 'POST',
          url: '/login',
          body: {
            email: user.email,
            password: user.password
          }
        })
        .then((response) => {

          expect(response.status).to.eq(200);

          expect(response.body)
            .to.have.property('authorization')
            .and.to.be.a('string');

          // Store token for subsequent requests
          cy.window().then((win) => {
            win.localStorage.setItem(
              'authToken',
              response.body.authorization
            );
          });

        });

      });

  });

  it('should fail to login with invalid credentials', () => {

    cy.request({
      method: 'POST',
      url: '/login',
      body: {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      },
      failOnStatusCode: false
    })
    .then((response) => {
      expect(response.status).to.eq(401);
    });

  });

});
