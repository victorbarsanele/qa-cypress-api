const { defineConfig } = require('cypress');

module.exports = defineConfig({
    reporter: 'mochawesome',
    reporterOptions: {
        reportDir: 'cypress/reports/mocha',
        overwrite: false,
        html: false,
        json: true,
    },
    e2e: {
        baseUrl: 'https://serverest.dev',
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
    },
});
