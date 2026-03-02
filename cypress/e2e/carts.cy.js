/// <reference types="cypress" />

describe('Cart API', () => {
    const apiUrl = '/carrinhos';
    let authToken;
    let cartId;
    let productId;

    before(function () {
        // Create a user and log in to get the auth token
        cy.fixture('user').then((userData) => {
            cy.createUser(userData).then((user) => {
                cy.Login(user.email, user.password).then((token) => {
                    // Store the token for use in subsequent requests
                    authToken = token;
                });
            });
        });

        // Create a product to be used in cart tests
        cy.fixture('product').then((productData) => {
            const uniqueProductName = `Mouse Logitech ${Date.now()}`;
            cy.createProduct(
                { ...productData, nome: uniqueProductName },
                authToken,
            ).then((id) => {
                productId = id; // Store product ID for use in cart tests
            });
        });
    });

    it('should create a new cart', () => {
        cy.request({
            method: 'POST',
            url: apiUrl,
            headers: {
                Authorization: authToken,
            },
            body: {
                produtos: [
                    {
                        idProduto: productId,
                        quantidade: 2,
                    },
                ],
            },
        }).then((response) => {
            cartId = response.body._id;
            expect(response.status).to.eq(201);
            expect(response.body.message).to.eq(
                'Cadastro realizado com sucesso',
            );
            expect(response.body).to.have.property('_id').that.is.a('string');
            cy.deleteCart(cartId, authToken); // Clean up by deleting the cart after test
        });
    });

    it('should not create a cart without an existing product', () => {
        cy.request({
            method: 'POST',
            url: apiUrl,
            headers: {
                Authorization: authToken,
            },
            body: {
                produtos: [
                    {
                        idProduto: 'emptyproductid12',
                        quantidade: 1,
                    },
                ],
            },
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body.message).to.eq('Produto não encontrado');
        });
    });

    it('should not create a cart with more products than available in stock', () => {
        cy.request({
            method: 'POST',
            url: apiUrl,
            headers: {
                Authorization: authToken,
            },
            body: {
                produtos: [
                    {
                        idProduto: productId,
                        quantidade: 1000,
                    },
                ],
            },
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body.message).to.eq(
                'Produto não possui quantidade suficiente',
            );
        });
    });

    it('should not let duplicate products in the same cart', () => {
        cy.request({
            method: 'POST',
            url: apiUrl,
            headers: {
                Authorization: authToken,
            },
            body: {
                produtos: [
                    {
                        idProduto: productId,
                        quantidade: 1,
                    },
                    {
                        idProduto: productId,
                        quantidade: 1,
                    },
                ],
            },
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body.message).to.eq(
                'Não é permitido possuir produto duplicado',
            );
        });
    });

    it('should not let create more than one cart', () => {
        cy.createCart(
            {
                produtos: [
                    {
                        idProduto: productId,
                        quantidade: 1,
                    },
                ],
            },
            authToken,
        ).then((id) => {
            cartId = id;
        });
        cy.request({
            method: 'POST',
            url: apiUrl,
            headers: {
                Authorization: authToken,
            },
            body: {
                produtos: [
                    {
                        idProduto: productId,
                        quantidade: 1,
                    },
                ],
            },
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body.message).to.eq(
                'Não é permitido ter mais de 1 carrinho',
            );
        });
    });

    it('should list all carts', () => {
        cy.request({
            method: 'GET',
            url: apiUrl,
            headers: {
                Authorization: authToken,
            },
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.quantidade).to.be.a('number');
            expect(response.body.carrinhos).to.be.an('array');
        });
    });

    it('should delete a cart', () => {
        cy.request({
            method: 'DELETE',
            url: `${apiUrl}/cancelar-compra`,
            headers: {
                Authorization: authToken,
            },
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.message).to.eq(
                'Registro excluído com sucesso. Estoque dos produtos reabastecido',
            );
        });
    });

    it('should not delete a cart that does not exist', () => {
        cy.request({
            method: 'DELETE',
            url: `${apiUrl}/cancelar-compra`,
            headers: {
                Authorization: authToken,
            },
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.message).to.eq(
                'Não foi encontrado carrinho para esse usuário',
            );
        });
    });

    it('should not delete a cart without authentication', () => {
        cy.request({
            method: 'DELETE',
            url: `${apiUrl}/cancelar-compra`,
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.eq(401);
            expect(response.body.message).to.eq(
                'Token de acesso ausente, inválido, expirado ou usuário do token não existe mais',
            );
        });
    });

    it('should not create a cart without authentication', () => {
        cy.request({
            method: 'POST',
            url: apiUrl,
            body: {
                produtos: [
                    {
                        idProduto: productId,
                        quantidade: 1,
                    },
                ],
            },
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.eq(401);
            expect(response.body.message).to.eq(
                'Token de acesso ausente, inválido, expirado ou usuário do token não existe mais',
            );
        });
    });

    it('should search for a cart by ID', () => {
        cy.createCart(
            {
                produtos: [
                    {
                        idProduto: productId,
                        quantidade: 1,
                    },
                ],
            },
            authToken,
        ).then((id) => {
            cartId = id;
            cy.request({
                method: 'GET',
                url: `${apiUrl}/${cartId}`,
                headers: {
                    Authorization: authToken,
                },
            }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('_id', cartId);
                expect(response.body.produtos).to.be.an('array');
            });
        });
    });

    it('should not find a cart with an invalid ID', () => {
        cy.request({
            method: 'GET',
            url: `${apiUrl}/invalidCartId555`,
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.eq(400);
        });
    });
});
