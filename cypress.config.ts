import { defineConfig } from "cypress";

export default defineConfig({
    e2e: {
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
        baseUrl: "http://localhost:5173", // Assuming Vite dev server port
        supportFile: false,
        specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    },
});
