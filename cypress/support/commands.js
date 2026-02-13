Cypress.Commands.add('createUser', (user) => {
  cy.request('POST', '/usuarios', user)
})