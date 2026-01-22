describe('Restaurant Management System E2E', () => {
    const baseUrl = 'http://localhost:5173';
    const apiUrl = 'http://localhost:5000/api';

    beforeEach(() => {
        // Basic setup or visiting home
        cy.viewport(1280, 720); // Ensure desktop view
        cy.visit(baseUrl);
    });

    it('System Test 1: Full Order Lifecycle (Customer)', () => {
        // Login as Customer
        cy.contains('Login').click({ force: true });
        cy.get('input[name="email"]').type('customer@resto.com');
        cy.get('input[name="password"]').type('customer123');
        cy.get('button[type="submit"]').click();

        // Create Order
        cy.contains('Menu').click();
        cy.get('.menu-item').first().find('button').click(); // Add to cart
        cy.get('.cart-icon').click();
        cy.contains('Checkout').click();

        // Fill delivery details
        cy.get('input[name="street"]').type('123 Test St');
        cy.get('input[name="city"]').type('Test City');
        cy.get('input[name="phone"]').type('0771234567');
        cy.contains('Place Order').click();

        // Verify Order Created
        cy.contains('Order Placed Successfully').should('be.visible');
        cy.contains('Pending').should('be.visible');
    });

    it('System Test 2: Kitchen & Service Flow (Chef & Waiter)', () => {
        // Chef Login
        cy.visit(`${baseUrl}/login`);
        cy.get('input[name="email"]').type('chef@resto.com');
        cy.get('input[name="password"]').type('chef123');
        cy.get('button[type="submit"]').click();

        // Chef Dashboard
        cy.contains('Kitchen Orders').click();
        cy.contains('Pending').first().click(); // View latest order
        cy.contains('Start Preparing').click();
        cy.contains('Preparing').should('be.visible');
        cy.contains('Mark Ready').click();
        cy.contains('Ready').should('be.visible');

        // Logout
        cy.contains('Logout').click();

        // Waiter Login
        cy.get('input[name="email"]').type('waiter@resto.com');
        cy.get('input[name="password"]').type('waiter123');
        cy.get('button[type="submit"]').click();

        // Waiter Dashboard (assuming dine-in mostly, but can serve)
        cy.contains('Ready Orders').click();
        cy.contains('Serve').first().click();
        cy.contains('Served').should('be.visible');
    });

    it('System Test 3: Payment & Completion (Cashier)', () => {
        // Cashier Login
        cy.visit(`${baseUrl}/login`);
        cy.get('input[name="email"]').type('cashier@resto.com');
        cy.get('input[name="password"]').type('cashier123');
        cy.get('button[type="submit"]').click();

        // Cashier Dashboard
        cy.contains('Pending Payments').click();
        cy.get('.order-card').first().click();
        cy.contains('Process Payment').click();
        cy.contains('Confirm Payment').click();

        cy.contains('Paid').should('be.visible');
    });

    it('System Test 4: Admin Management (Menu)', () => {
        // Admin Login
        cy.visit(`${baseUrl}/login`);
        cy.get('input[name="email"]').type('admin@resto.com');
        cy.get('input[name="password"]').type('admin123');
        cy.get('button[type="submit"]').click();

        // Manage Menu
        cy.contains('Menu Items').click();
        cy.contains('Add Menu Item').click();

        // Fill Item Form
        cy.get('input[type="text"]').eq(0).type('New Dish'); // Name
        cy.get('textarea').type('Delicious new dish'); // Description
        cy.get('input[type="number"]').eq(0).type('25'); // Price
        // Use index based selection or force select if needed, assuming first select is category
        cy.get('select').first().select(1);

        cy.get('button[type="submit"]').click();

        // Verify Item Added
        cy.contains('New Dish').should('be.visible');
    });
});
