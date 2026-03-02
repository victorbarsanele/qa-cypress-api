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

Cypress.Commands.add('deleteUser', (userId) => {
    return cy
        .request({
            method: 'DELETE',
            url: `/usuarios/${userId}`,
            failOnStatusCode: false,
        })
        .then((response) => {
            if (response.status === 200) {
                expect(response.body.message).to.eq(
                    'Registro excluído com sucesso',
                );
            } else {
                expect(response.status).to.eq(400);
                expect(response.body.message).to.eq(
                    'Não é permitido excluir usuário com carrinho cadastrado',
                );
            }
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

Cypress.Commands.add('createProduct', (product, authToken) => {
    return cy
        .request({
            method: 'POST',
            url: '/produtos',
            headers: {
                Authorization: authToken,
            },
            body: product,
        })
        .then((response) => {
            return response.body._id; // Return the product ID for use in tests
        });
});

Cypress.Commands.add('deleteProduct', (productId, authToken) => {
    return cy
        .request({
            method: 'DELETE',
            url: `/produtos/${productId}`,
            headers: {
                Authorization: authToken,
            },
        })
        .then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.message).to.eq(
                'Registro excluído com sucesso',
            );
        });
});

Cypress.Commands.add('createCart', (cart, authToken) => {
    return cy
        .request({
            method: 'POST',
            url: '/carrinhos',
            headers: {
                Authorization: authToken,
            },
            body: cart,
        })
        .then((response) => {
            return response.body._id; // Return the cart ID for use in tests
        });
});

Cypress.Commands.add('deleteCart', (cartId, authToken) => {
    return cy
        .request({
            method: 'DELETE',
            url: `/carrinhos/cancelar-compra`,
            headers: {
                Authorization: authToken,
            },
        })
        .then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.message).to.eq(
                'Registro excluído com sucesso. Estoque dos produtos reabastecido',
            );
        });
});
