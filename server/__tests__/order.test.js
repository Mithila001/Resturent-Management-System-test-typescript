const request = require("supertest");
const app = require("../app");
const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Mock the models
jest.mock("../models/Order");
jest.mock("../models/MenuItem");
jest.mock("../models/User");

// Mock Socket.IO
const mockEmit = jest.fn();
app.set("socketio", { emit: mockEmit });

let userToken;
let adminToken;
let orderId = "mockOrderId123";
let menuItemId = "mockMenuItemId456";

beforeAll(() => {
  process.env.JWT_SECRET = "test_secret";

  // Generate tokens
  userToken = jwt.sign({ id: "mockUserId123" }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  adminToken = jwt.sign({ id: "mockAdminId123" }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
});

beforeEach(() => {
  jest.clearAllMocks();
  mockEmit.mockClear();
});

describe("Order API Tests", () => {
  describe("POST /api/orders", () => {
    it("should create a new order with valid data", async () => {
      // Mock user authentication
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: "mockUserId123",
          name: "Test User",
          email: "user@test.com",
          role: "customer",
        }),
      });

      // Mock menu item lookup
      MenuItem.findById.mockResolvedValue({
        _id: menuItemId,
        name: "Test Burger",
        price: 12.99,
        isAvailable: true,
      });

      // Mock order creation
      const createdOrder = {
        _id: orderId,
        user: "mockUserId123",
        orderNumber: "ORD202512300001",
        items: [
          {
            menuItem: menuItemId,
            name: "Test Burger",
            quantity: 2,
            price: 12.99,
            subtotal: 25.98,
          },
        ],
        totalAmount: 25.98,
        orderStatus: "pending",
        paymentStatus: "pending",
        paymentMethod: "cash",
        deliveryAddress: {
          street: "123 Test St",
          city: "Test City",
          postalCode: "12345",
          phone: "+1234567890",
        },
      };

      Order.create.mockResolvedValue(createdOrder);

      // Mock populate chain for findById
      const populatedOrder = {
        ...createdOrder,
        user: { name: "Test User", email: "user@test.com" },
        items: [
          {
            ...createdOrder.items[0],
            menuItem: { name: "Test Burger", imageUrl: "/images/burger.jpg" },
          },
        ],
      };

      Order.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(populatedOrder),
        }),
      });

      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          items: [
            {
              menuItem: menuItemId,
              quantity: 2,
            },
          ],
          deliveryAddress: {
            street: "123 Test St",
            city: "Test City",
            postalCode: "12345",
            phone: "+1234567890",
          },
          paymentMethod: "cash",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("orderNumber");
    });

    it("should fail to create order without authentication", async () => {
      const res = await request(app)
        .post("/api/orders")
        .send({
          items: [{ menuItem: menuItemId, quantity: 1 }],
          deliveryAddress: {
            street: "123 Test St",
            city: "Test City",
            postalCode: "12345",
            phone: "+1234567890",
          },
        });

      expect(res.statusCode).toBe(401);
    });

    it("should fail to create order with empty cart", async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: "mockUserId123",
          role: "customer",
        }),
      });

      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          items: [],
          deliveryAddress: {
            street: "123 Test St",
            city: "Test City",
            postalCode: "12345",
            phone: "+1234567890",
          },
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("No order items");
    });
  });

  describe("GET /api/orders", () => {
    it("should get user's orders", async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: "mockUserId123",
          role: "user",
        }),
      });

      Order.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockResolvedValue([
          {
            _id: orderId,
            orderNumber: "ORD202512300001",
            totalAmount: 25.98,
            orderStatus: "pending",
          },
        ]),
      });

      Order.countDocuments.mockResolvedValue(1);

      const res = await request(app)
        .get("/api/orders")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("orders");
      expect(Array.isArray(res.body.orders)).toBe(true);
    });

    it("should filter orders by status", async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: "mockUserId123",
          role: "user",
        }),
      });

      Order.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockResolvedValue([]),
      });

      Order.countDocuments.mockResolvedValue(0);

      const res = await request(app)
        .get("/api/orders?status=delivered")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
    });
  });

  describe("GET /api/orders/:id", () => {
    it("should get order details by ID", async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: "mockUserId123",
          role: "user",
        }),
      });

      Order.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue({
            _id: orderId,
            user: { _id: "mockUserId123" },
            orderNumber: "ORD202512300001",
            totalAmount: 25.98,
          }),
        }),
      });

      const res = await request(app)
        .get(`/api/orders/${orderId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("orderNumber");
    });

    it("should return 404 for non-existent order", async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: "mockUserId123",
          role: "user",
        }),
      });

      Order.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(null),
        }),
      });

      const res = await request(app)
        .get("/api/orders/invalidId")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe("PUT /api/orders/:id/status", () => {
    it("should update order status and emit socket event (admin only)", async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: "mockAdminId123",
          role: "admin",
        }),
      });

      const mockOrder = {
        _id: orderId,
        orderStatus: "pending",
        save: jest.fn().mockResolvedValue(true),
      };

      Order.findById.mockResolvedValueOnce(mockOrder).mockReturnValueOnce({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue({
            _id: orderId,
            orderNumber: "ORD123456",
            orderStatus: "confirmed",
            user: { _id: "mockUserId123" },
          }),
        }),
      });

      const res = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ orderStatus: "confirmed" });

      expect(res.statusCode).toBe(200);
      expect(res.body.orderStatus).toBe("confirmed");

      // Verify socket.io event was emitted
      expect(mockEmit).toHaveBeenCalledWith("orderStatusUpdated", {
        orderId: orderId,
        orderNumber: "ORD123456",
        orderStatus: "confirmed",
        userId: "mockUserId123",
      });
    });

    it("should fail to update order status without admin role", async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: "mockUserId123",
          role: "user",
        }),
      });

      const res = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ orderStatus: "confirmed" });

      expect(res.statusCode).toBe(403);
    });
  });

  describe("DELETE /api/orders/:id", () => {
    it("should cancel order by owner", async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: "mockUserId123",
          role: "user",
        }),
      });

      const mockOrder = {
        _id: orderId,
        user: "mockUserId123",
        orderStatus: "pending",
        save: jest.fn().mockResolvedValue(true),
      };

      Order.findById.mockResolvedValue(mockOrder);

      const res = await request(app)
        .delete(`/api/orders/${orderId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ reason: "Changed my mind" });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain("cancelled");
    });

    it("should not cancel already delivered order", async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: "mockUserId123",
          role: "user",
        }),
      });

      Order.findById.mockResolvedValue({
        _id: orderId,
        user: "mockUserId123",
        orderStatus: "delivered",
      });

      const res = await request(app)
        .delete(`/api/orders/${orderId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Cannot cancel");
    });
  });
});
