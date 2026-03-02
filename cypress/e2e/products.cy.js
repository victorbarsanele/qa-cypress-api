/// <references types="cypress" />

describe('Products CRUD API', () => {
    const apiUrl = '/produtos';
    let authToken; // Store the token for authenticated requests
    let productId;
    let originalProductName;
    let globalUserData;

    before(function () {
        // Load user data from fixture and create a user, then log in to get the token
        cy.fixture('user').then((userData) => {
            globalUserData = userData; // Store user data for non-admin user test
            cy.createUser(userData).then((user) => {
                cy.Login(user.email, user.password).then((token) => {
                    authToken = token; // Store the token for use in tests
                });
            });
        });
    });

    it('should create a new product', function () {
        originalProductName = `Test Product ${Date.now()}`; // Generate a unique product name
        cy.request({
            method: 'POST',
            url: apiUrl,
            headers: {
                Authorization: authToken, // Use the token for authentication
            },
            body: {
                nome: originalProductName, // Use the unique product name
                preco: 99,
                descricao: 'A keyboard with mechanical switches',
                quantidade: 10,
            },
        }).then((response) => {
            productId = response.body._id;
            expect(response.status).to.eq(201);
            expect(response.body.message).to.eq(
                'Cadastro realizado com sucesso',
            );
            expect(response.body).to.have.property('_id').that.is.a('string');
        });
    });

    it('should not create a product with same name', () => {
        cy.request({
            method: 'POST',
            url: apiUrl,
            headers: {
                Authorization: authToken,
            },
            body: {
                nome: originalProductName, // Same name as before
                preco: 89,
                descricao: 'Another mechanical keyboard with the same name',
                quantidade: 5,
            },
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body.message).to.eq(
                'Já existe produto com esse nome',
            );
        });
    });

    it('should not create a product with invalid token', () => {
        cy.request({
            method: 'POST',
            url: apiUrl,
            headers: {
                Authorization: 'Bearer invalidtoken123',
            },
            body: {
                nome: 'Invalid Token Product',
                preco: 49,
                descricao: 'This product should not be created',
                quantidade: 3,
            },
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.eq(401);
            expect(response.body.message).to.eq(
                'Token de acesso ausente, inválido, expirado ou usuário do token não existe mais',
            );
        });
    });
    it('should not create a product with non-admin user token', function () {
        // First, create a non-admin user and get their token
        const nonAdminUser = { ...globalUserData, administrador: 'false' };
        const nonAdminProductName = `Test Product ${Date.now()}`; // Generate a unique product name for this test
        cy.createUser(nonAdminUser).then((user) => {
            cy.Login(user.email, user.password).then((token) => {
                // Now try to create a product with the non-admin user's token
                cy.request({
                    method: 'POST',
                    url: apiUrl,
                    headers: {
                        Authorization: token,
                    },
                    body: {
                        nome: nonAdminProductName,
                        preco: 59,
                        descricao:
                            'This product should not be created by non-admin user',
                        quantidade: 7,
                    },
                    failOnStatusCode: false,
                }).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body.message).to.eq(
                        'Rota exclusiva para administradores',
                    );
                });
            });
        });
    });

    it('should list all products', () => {
        cy.request('GET', apiUrl).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.quantidade).to.be.a('number');
            expect(response.body.produtos).to.be.an('array');
            expect(response.body.produtos.length).to.eq(
                response.body.quantidade,
            );
        });
    });
    it('should list a product by id', () => {
        cy.request({
            method: 'GET',
            url: `${apiUrl}/${productId}`,
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body._id).to.eq(productId);
            expect(response.body.nome).to.eq(originalProductName);
            expect(response.body.preco).to.eq(99);
        });
    });
    it('should not list a product with invalid id', () => {
        cy.request({
            method: 'GET',
            url: `${apiUrl}/invalidId1234567`, // Use an invalid product ID
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body.message).to.eq('Produto não encontrado');
        });
    });
    it('should filter products by price', () => {
        cy.request({
            method: 'GET',
            url: `${apiUrl}?preco=99`,
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.produtos).to.be.an('array');
            expect(response.body.produtos.length).to.be.greaterThan(0);

            response.body.produtos.forEach((product) => {
                expect(product.preco).to.eq(99);
            });
        });
    });
    it('should filter products by quantity', () => {
        cy.request({
            method: 'GET',
            url: `${apiUrl}?quantidade=10`,
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.produtos).to.be.an('array');
            expect(response.body.produtos.length).to.be.greaterThan(0);

            response.body.produtos.forEach((product) => {
                expect(product.quantidade).to.eq(10);
            });
        });
    });
    it('should update a product', () => {
        const productToUpdate = `Update Test Product ${Date.now()}`; // Generate a unique product name for this test
        const updatedProductName = `Updated Test Product ${Date.now()}`; // Generate a unique updated product name for this test

        // First, create a product to be updated
        cy.request({
            method: 'POST',
            url: apiUrl,
            headers: {
                Authorization: authToken,
            },
            body: {
                nome: productToUpdate,
                preco: 59,
                descricao: 'Original Description for the product to be updated',
                quantidade: 20,
            },
        }).then((response) => {
            expect(response.status).to.eq(201);
            const idToUpdate = response.body._id;

            cy.request({
                method: 'PUT',
                url: `${apiUrl}/${idToUpdate}`,
                headers: {
                    Authorization: authToken,
                },
                body: {
                    nome: updatedProductName,
                    preco: 79,
                    descricao:
                        'Updated description for the mechanical keyboard',
                    quantidade: 15,
                },
            }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.message).to.eq(
                    'Registro alterado com sucesso',
                );
                // Verify the product is actually updated
                cy.request({
                    method: 'GET',
                    url: `${apiUrl}/${idToUpdate}`,
                }).then((response) => {
                    expect(response.body.nome).to.eq(updatedProductName);
                });
            });
        });
    });
    it('should not update a product with same name', () => {
        const productName = `Test Product ${Date.now()}`; // Generate a unique product name for this test
        cy.request({
            method: 'POST',
            url: apiUrl,
            headers: {
                Authorization: authToken,
            },
            body: {
                nome: productName,
                preco: 59,
                descricao: 'Another mechanical keyboard for testing',
                quantidade: 20,
            },
        }).then((response) => {
            expect(response.status).to.eq(201);

            // Now try to update the first product with the same name as the second product

            cy.request({
                method: 'PUT',
                url: `${apiUrl}/${productId}`,
                headers: {
                    Authorization: authToken,
                },
                body: {
                    nome: productName, // Same name as the second product
                    preco: 89,
                    descricao: 'Updated description with duplicate name',
                    quantidade: 5,
                },
                failOnStatusCode: false,
            }).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body.message).to.eq(
                    'Já existe produto com esse nome',
                );
            });
        });
    });
    it('should delete a product', () => {
        const productToDeleteName = `Delete Test Product ${Date.now()}`; // Generate a unique product name for this test
        // First, create a product to be deleted
        cy.request({
            method: 'POST',
            url: apiUrl,
            headers: {
                Authorization: authToken,
            },
            body: {
                nome: productToDeleteName,
                preco: 49,
                descricao: 'This product will be deleted in the test',
                quantidade: 1,
            },
        }).then((response) => {
            const idToDelete = response.body._id; // Store the ID of the product to be deleted

            // Now delete the product
            cy.request({
                method: 'DELETE',
                url: `${apiUrl}/${idToDelete}`,
                headers: {
                    Authorization: authToken,
                },
            }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.message).to.eq(
                    'Registro excluído com sucesso',
                );

                // Verify the product is actually deleted
                cy.request({
                    method: 'GET',
                    url: `${apiUrl}/${idToDelete}`,
                    failOnStatusCode: false,
                }).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body.message).to.eq(
                        'Produto não encontrado',
                    );
                });
            });
        });
    });
    it('should not delete a product that is in a cart', () => {
        let cartId;
        const productInCartName = `Cart Product ${Date.now()}`; // Generate a unique product name for this test
        // First, create a product to be added to cart
        cy.request({
            method: 'POST',
            url: apiUrl,
            headers: {
                Authorization: authToken,
            },
            body: {
                nome: productInCartName,
                preco: 59,
                descricao:
                    'This product will be added to cart and should not be deleted',
                quantidade: 20,
            },
        }).then((response) => {
            const productInCartId = response.body._id; // Store the ID of the product to be added to cart
            // Add the product to cart
            cy.request({
                method: 'POST',
                url: '/carrinhos',
                headers: {
                    Authorization: authToken,
                },
                body: {
                    produtos: [
                        {
                            idProduto: productInCartId,
                            quantidade: 1,
                        },
                    ],
                },
            }).then((response) => {
                cartId = response.body._id; // Store the cart ID for cleanup
                // Now try to delete the product that is in the cart
                cy.request({
                    method: 'DELETE',
                    url: `${apiUrl}/${productInCartId}`,
                    headers: {
                        Authorization: authToken,
                    },
                    failOnStatusCode: false,
                }).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body.message).to.eq(
                        'Não é permitido excluir produto que faz parte de carrinho',
                    );
                    // Cleanup: delete the cart and then the product
                    cy.deleteCart(cartId, authToken).then(() => {
                        cy.request({
                            method: 'DELETE',
                            url: `${apiUrl}/${productInCartId}`,
                            headers: {
                                Authorization: authToken,
                            },
                        }).then((response) => {
                            expect(response.status).to.eq(200);
                        });
                    });
                });
            });
        });
    });
});
