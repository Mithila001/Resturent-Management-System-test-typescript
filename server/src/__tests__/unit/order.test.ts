import { calculateOrderTotal } from "../../utils/orderUtils";

describe("Order Calculation Logic", () => {

    it("should calculate total correctly for multiple items", () => {
        const items = [
            { price: 100, quantity: 2 },
            { price: 50, quantity: 1 }
        ];
        const result = calculateOrderTotal(items);
        expect(result.totalAmount).toBe(250);
        expect(result.orderItems).toHaveLength(2);
        expect(result.orderItems[0].subtotal).toBe(200);
    });

    it("should calculate tax correctly (if applicable)", () => {
        // Note: Current utility only does sum. If tax logic is added, test here.
        // For now, testing basic sum behavior which is the current implementation.
        const items = [{ price: 10, quantity: 1 }];
        const result = calculateOrderTotal(items);
        expect(result.totalAmount).toBe(10);
    });

    it("should handle zero quantity items by throwing error", () => {
        const items = [{ price: 10, quantity: 0 }];
        expect(() => calculateOrderTotal(items)).toThrow("Invalid item quantity");
    });

    it("should handle negative prices by throwing error", () => {
        const items = [{ price: -10, quantity: 1 }];
        expect(() => calculateOrderTotal(items)).toThrow("Invalid item price");
    });

    it("should verify subtotal calculation for each item", () => {
        const items = [
            { price: 10.5, quantity: 2 }, // 21
            { price: 20, quantity: 3 }    // 60
        ];
        const result = calculateOrderTotal(items);
        expect(result.orderItems[0].subtotal).toBe(21);
        expect(result.orderItems[1].subtotal).toBe(60);
        expect(result.totalAmount).toBe(81);
    });

    it("should handle empty items array", () => {
        // Current implementation doesn't throw on empty, just returns 0 total.
        // Or usage in controller checks for empty first.
        // Let's verify utils behavior.
        const items: any[] = [];
        const result = calculateOrderTotal(items);
        expect(result.totalAmount).toBe(0);
        expect(result.orderItems).toHaveLength(0);
    });

});
