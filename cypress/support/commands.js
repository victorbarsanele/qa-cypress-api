Cypress.Commands.add('createUser', (user) => {
    const uniqueEmail = `user_${Date.now()}@testapi.com`;
    return cy
        .request({
            method: 'POST',
            url: '/usuarios',
            body: {
                nome: user.nome,
                email: uniqueEmail,
                password: user.password,
                administrador: user.administrador,
            },
        })
        .then((response) => {
            return {
                userId: response.body._id,
                email: uniqueEmail,
                password: user.password,
            };
        });
});

Cypress.Commands.add('Login', (email, password) => {
    return cy
        .request({
            method: 'POST',
            url: '/login',
            body: {
                email,
                password,
            },
        })
        .then((response) => {
            // Return the token for use in subsequent requests
            return response.body.authorization;
        });
});
