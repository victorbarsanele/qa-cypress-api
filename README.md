# ServeRest API Tests

[![CI Status](https://github.com/victorbarsanele/qa-cypress-api/actions/workflows/ci.yml/badge.svg)](https://github.com/victorbarsanele/qa-cypress-api/actions)


**Languages / Idiomas:**
- [🇧🇷 Português Brasileiro](#português-brasileiro)
- [🇺🇸 English (US)](#english-us)

---

## Português Brasileiro

Este projeto contém testes de automação de API usando Cypress.

🚧 Status: Em progresso  
Implementando fluxos de usuários e produtos.  
Pipeline de CI configurado.

### Stack Tecnológico
- Cypress
- JavaScript
- GitHub Actions

### Objetivo
Praticar automação de API, encadeamento de requisições e isolamento de dados de teste.

### Estrutura do Projeto

```
cypress/
├── e2e/
│   ├── auth.cy.js       # Testes de autenticação
│   └── users.cy.js      # Testes CRUD de usuários
├── fixtures/
│   └── user.json        # Dados de fixture de usuário
└── support/
    ├── commands.js      # Comandos customizados do Cypress
    └── e2e.js          # Configuração de suporte e2e
```

### Como Executar

#### Instalação
```bash
npm install
```

#### Abrir Cypress (Modo interativo)
```bash
npx cypress open
```

#### Rodar testes em headless
```bash
npx cypress run
```

### Fluxos de Teste

**Autenticação**
- Login via API
- Armazenamento de token JWT
- Autenticação em requisições subsequentes

**CRUD de Usuários**
- Criar novo usuário
- Listar todos os usuários
- Buscar usuário por ID
- Atualizar usuário
- Excluir usuário

### Aprendizados
- `cy.fixture()` com aliases (`as()`)
- Funções regulares vs arrow functions em Cypress (contexto `this`)
- Encadeamento de requisições com `cy.request()`
- Gestão de estado entre testes
- Validação de respostas HTTP

---

## English (US)

This project contains API automation tests using Cypress.

🚧 Status: In progress  
Currently implementing user and product flows.  
CI pipeline configured.

### Tech Stack
- Cypress
- JavaScript
- GitHub Actions

### Goal
Practice API automation, request chaining, and test data isolation.

### Project Structure

```
cypress/
├── e2e/
│   ├── auth.cy.js       # Authentication tests
│   └── users.cy.js      # Users CRUD tests
├── fixtures/
│   └── user.json        # User fixture data
└── support/
    ├── commands.js      # Cypress custom commands
    └── e2e.js          # E2E support configuration
```

### How to Run

#### Installation
```bash
npm install
```

#### Open Cypress (Interactive mode)
```bash
npx cypress open
```

#### Run tests in headless mode
```bash
npx cypress run
```

### Test Flows

**Authentication**
- Login via API
- JWT token storage
- Authentication in subsequent requests

**Users CRUD**
- Create new user
- List all users
- Get user by ID
- Update user
- Delete user

### Learning Outcomes
- `cy.fixture()` with aliases (`as()`)
- Regular functions vs arrow functions in Cypress (context `this`)
- Request chaining with `cy.request()`
- State management between tests
- HTTP response validation
