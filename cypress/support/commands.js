Cypress.Commands.add('createUser', (user) => {
    const uniqueEmail = `user_${Date.now()}@testapi.com`;
    return cy.request({
        method: 'POST',
        url: '/usuarios',
        body: {
            nome: user.nome,
            email: uniqueEmail,
            password: user.password,
            administrador: user.administrador
        }
    }).then((response) => {
        return{
            userId: response.body._id,
            email: uniqueEmail,
            password: user.password
        }
    });
 
})