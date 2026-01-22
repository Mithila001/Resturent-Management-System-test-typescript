import request from "supertest";
import app from "../../app";
import Order from "../../models/Order";
import MenuItem from "../../models/MenuItem";
import Table from "../../models/Table";
import User from "../../models/User";
import jwt from "jsonwebtoken";

// Mock models
jest.mock("../../models/Order");
jest.mock("../../models/MenuItem");
jest.mock("../../models/Table");
jest.mock("../../models/User");

describe("Order API Integration", () => {
    let token: string;
    const userId = "user_123";

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = "test_secret";

        // Mock User.findById for auth middleware with .select() chaining
        (User.findById as jest.Mock).mockReturnValue({
            select: jest.fn().mockResolvedValue({
                _id: userId,
                role: "customer",
                name: "Test User"
            })
        });

        // Mock jwt.verify to return user id
        // Actually, request(app) goes through middleware. 
        // We can just generate a valid token if we use the same secret?
        // Or mock jwt.verify?
        // Let's rely on standard JWT middleware which should work if secret matches.
        token = jwt.sign({ id: userId }, "test_secret");
    });

    describe("POST /api/orders", () => {
        it("should create a delivery order successfully", async () => {
            const mockMenuItem = {
                _id: "menu_1",
                name: "Burger",
                price: 15,
                isAvailable: true
            };
            (MenuItem.findById as jest.Mock).mockResolvedValue(mockMenuItem);

            (Order.create as jest.Mock).mockResolvedValue({
                _id: "order_123",
                orderNumber: "ORD123",
                totalAmount: 30,
                orderStatus: "confirmed",
                items: [{
                    menuItem: "menu_1",
                    quantity: 2,
                    price: 15,
                    subtotal: 30
                }]
            });

            // Mock populate
            const mockPopulate = jest.fn().mockReturnThis();
            // Order.findById(...).populate(...)
            (Order.findById as jest.Mock).mockReturnValue({
                populate: mockPopulate.mockReturnValue({
                    populate: jest.fn().mockResolvedValue({
                        _id: "order_123",
                        orderNumber: "ORD123"
                    })
                })
            });

            const res = await request(app)
                .post("/api/orders")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    items: [{ menuItem: "menu_1", quantity: 2 }],
                    orderType: "delivery",
                    deliveryAddress: {
                        street: "123 Main St",
                        city: "Test City",
                        postalCode: "12345",
                        phone: "1234567890"
                    }
                });

            expect(res.status).toBe(201);
            expect(MenuItem.findById).toHaveBeenCalled();
            expect(Order.create).toHaveBeenCalled();
        });

        it("should return 400 for empty items", async () => {
            const res = await request(app)
                .post("/api/orders")
                .set("Authorization", `Bearer ${token}`)
                .send({ items: [] });
            expect(res.status).toBe(400);
        });
    });

    describe("GET /api/orders/:id", () => {
        it("should return order details", async () => {
            const mockOrder = {
                _id: "order_123",
                user: { _id: userId },
                items: []
            };

            (Order.findById as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnThis().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(mockOrder)
                })
            });

            const res = await request(app)
                .get("/api/orders/order_123")
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body._id).toBe("order_123");
        });
    });
});
