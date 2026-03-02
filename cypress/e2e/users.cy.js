/// <references types="cypress" />

describe('Users CRUD API', () => {
    const apiUrl = '/usuarios';
    let userId;

    it('should create a new user', () => {
        cy.request({
            method: 'POST',
            url: apiUrl,
            body: {
                nome: 'DTestUser-Gilgamesh',
                email: `gilgameshtestxD@testapi.com`,
                password: '1vaaavv23112',
                administrador: 'true',
            },
        }).then((response) => {
            cy.log(JSON.stringify(response.body));
            userId = response.body._id; // Store user ID for later tests
            expect(response.status).to.eq(201);
            expect(response.body.message).to.eq(
                'Cadastro realizado com sucesso',
            );
            expect(response.body._id).to.eq(userId);
        });
    });

    it('should fail to create a user with existing email', () => {
        cy.request({
            method: 'POST',
            url: apiUrl,
            body: {
                nome: 'FTestUser-Gilgamesh',
                email: 'gilgameshtestxD@testapi.com', // Use the same email as before
                password: '1vvvvv23112',
                administrador: 'true',
            },
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body.message).to.eq(
                'Este email já está sendo usado',
            );
        });
    });

    it('should list all users', () => {
        cy.request('GET', apiUrl).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.quantidade).to.be.a('number');
            expect(response.body.usuarios).to.be.an('array');
        });
    });

    it('should list an user by id', () => {
        cy.request({
            method: 'GET',
            url: `${apiUrl}/${userId}`,
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body._id).to.eq(userId);
            expect(response.body.nome).to.eq('DTestUser-Gilgamesh');
            expect(response.body.email).to.eq('gilgameshtestxD@testapi.com');
        });
    });

    it('should fail to list an user with invalid id', () => {
        cy.request({
            method: 'GET',
            url: `${apiUrl}/GxxeufdelPG0dpPC`, // Use an invalid user ID
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body.message).to.eq('Usuário não encontrado');
        });
    });

    it('should update an user', () => {
        cy.request({
            method: 'PUT',
            url: `${apiUrl}/${userId}`,
            body: {
                nome: 'DTestUser-Gilgamesh-Updated',
                email: 'gilgameshtestxD-updated@testapi.com',
                password: '1vaaavv23112',
                administrador: 'true',
            },
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.message).to.eq(
                'Registro alterado com sucesso',
            );
        });
    });

    it('should fail to update an user with already used email', () => {
        //Create another user to have an email to test the update with existing email scenario
        const secondEmail = `user_${Date.now()}@testapi.com`;

        cy.request({
            method: 'POST',
            url: apiUrl,
            body: {
                nome: 'Another User',
                email: secondEmail,
                password: '1vaaavv23112',
                administrador: 'true',
            },
        }).then((response) => {});
        // Attempt to update the first user with the email of the second user
        cy.request({
            method: 'PUT',
            url: `${apiUrl}/${userId}`,
            body: {
                nome: 'Another User Updated',
                email: secondEmail, // Use an already existing email
                password: '1vaaavv23112',
                administrador: 'true',
            },
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body.message).to.eq(
                'Este email já está sendo usado',
            );
        });
    });

    it('should delete an user', () => {
        cy.deleteUser(userId).then(() => {
            // Check if the user was deleted by trying to get the user data
            cy.request({
                method: 'GET',
                url: `${apiUrl}/${userId}`,
                failOnStatusCode: false,
            }).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body.message).to.eq('Usuário não encontrado');
            });
        });
    });

    it('should fail to delete an user with invalid id', () => {
        cy.request({
            method: 'DELETE',
            url: `${apiUrl}/GxxeufdelPG0dpPC`, // Use an invalid user ID
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.message).to.eq('Nenhum registro excluído');
        });
    });
    it('should not delete an user with cart not empty', () => {
        let authToken;
        let productId;
        // Create a user, login, create a product, add to cart and then try to delete the user
        cy.fixture('user').then((userData) => {
            const uniqueEmail = `user_${Date.now()}@testapi.com`;
            cy.createUser({ ...userData }).then(
                ({ email, password, userId }) => {
                    const newUserId = userId; // Store the new user ID for use in cart tests
                    cy.Login(email, password).then((token) => {
                        authToken = token; // Store the token for use in subsequent requests

                        // Create a product to be added to cart
                        cy.fixture('product').then((productData) => {
                            const uniqueProductName = `Mouse Logitech ${Date.now()}`;
                            cy.createProduct(
                                { ...productData, nome: uniqueProductName },
                                authToken,
                            ).then((id) => {
                                productId = id; // Store product ID for use in cart tests

                                // Add product to cart
                                cy.request({
                                    method: 'POST',
                                    url: '/carrinhos',
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
                                }).then((response) => {
                                    expect(response.status).to.eq(201);
                                    expect(response.body.message).to.eq(
                                        'Cadastro realizado com sucesso',
                                    );
                                    cy.deleteUser(newUserId).then(() => {
                                        // Check if the user was deleted or not based on the response of deleteUser command
                                        cy.request({
                                            method: 'GET',
                                            url: `${apiUrl}/${newUserId}`,
                                            failOnStatusCode: false,
                                        }).then((response) => {
                                            expect(response.status).to.eq(200);
                                            expect(response.body._id).to.eq(
                                                newUserId,
                                            ); // If user is not deleted, it should return the user data
                                        });
                                    });
                                });
                            });
                        });
                    });
                },
            );
        });
    });
});
