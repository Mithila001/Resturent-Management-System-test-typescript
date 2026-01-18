const request = require("supertest");
const app = require("../app");
const User = require("../models/User");
const MenuItem = require("../models/MenuItem");
const Category = require("../models/Category");
const Order = require("../models/Order");

// Mock all models
jest.mock("../models/User");
jest.mock("../models/MenuItem");
jest.mock("../models/Category");
jest.mock("../models/Order");

describe("Integration Tests - Complete User Flows", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test_secret";
  });

  describe("Complete Customer Journey", () => {
    let customerToken;
    let mockUserId = "mockCustomerId123";
    let mockMenuItemId = "mockMenuItemId123";
    let mockCategoryId = "mockCategoryId123";
    let mockOrderId = "mockOrderId123";

    it("should complete full flow: register → login → browse menu → place order → track order", async () => {
      // Step 1: Register new user
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        _id: mockUserId,
        name: "John Doe",
        email: "john@example.com",
        role: "customer",
        password: "hashedpassword",
      });

      const registerRes = await request(app).post("/api/auth/register").send({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      });

      expect(registerRes.statusCode).toEqual(201);
      expect(registerRes.body).toHaveProperty("token");
      customerToken = registerRes.body.token;

      // Step 2: Login with credentials
      const mockMatchPassword = jest.fn().mockResolvedValue(true);
      User.findOne.mockResolvedValue({
        _id: mockUserId,
        name: "John Doe",
        email: "john@example.com",
        role: "customer",
        password: "hashedpassword",
        matchPassword: mockMatchPassword,
      });

      const loginRes = await request(app).post("/api/auth/login").send({
        email: "john@example.com",
        password: "password123",
      });

      expect(loginRes.statusCode).toEqual(200);
      expect(loginRes.body).toHaveProperty("token");

      // Step 3: Browse menu - Get categories
      Category.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          {
            _id: mockCategoryId,
            name: "Main Course",
            description: "Delicious main courses",
            isActive: true,
          },
        ]),
      });

      const categoriesRes = await request(app).get("/api/categories");

      expect(categoriesRes.statusCode).toEqual(200);
      expect(Array.isArray(categoriesRes.body)).toBe(true);

      // Step 4: Browse menu - Get menu items
      MenuItem.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue([
            {
              _id: mockMenuItemId,
              name: "Grilled Chicken",
              description: "Juicy grilled chicken with herbs",
              price: 12.99,
              category: { _id: mockCategoryId, name: "Main Course" },
              isAvailable: true,
            },
          ]),
        }),
      });

      const menuRes = await request(app).get("/api/menu");

      expect(menuRes.statusCode).toEqual(200);
      expect(Array.isArray(menuRes.body)).toBe(true);

      // Step 5: Place order
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: mockUserId,
          name: "John Doe",
          email: "john@example.com",
          role: "customer",
        }),
      });

      // Mock MenuItem.findById for order validation
      MenuItem.findById.mockResolvedValue({
        _id: mockMenuItemId,
        name: "Grilled Chicken",
        price: 12.99,
        isAvailable: true,
      });

      const mockOrderData = {
        _id: mockOrderId,
        orderNumber: "ORD-1000",
        user: mockUserId,
        items: [
          {
            menuItem: mockMenuItemId,
            name: "Grilled Chicken",
            quantity: 2,
            price: 12.99,
            subtotal: 25.98,
          },
        ],
        totalAmount: 25.98,
        orderStatus: "pending",
        paymentStatus: "pending",
        deliveryAddress: {
          street: "123 Main St",
          city: "New York",
          postalCode: "10001",
          phone: "+1234567890",
        },
      };

      Order.countDocuments.mockResolvedValue(0);
      Order.create.mockResolvedValue(mockOrderData);

      // Mock Order.findById for populate after creation
      Order.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue({
            ...mockOrderData,
            user: { name: "John Doe", email: "john@example.com" },
            items: [
              {
                ...mockOrderData.items[0],
                menuItem: {
                  name: "Grilled Chicken",
                  imageUrl: "/images/chicken.jpg",
                },
              },
            ],
          }),
        }),
      });

      const orderRes = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          items: [
            {
              menuItem: mockMenuItemId,
              quantity: 2,
            },
          ],
          deliveryAddress: {
            street: "123 Main St",
            city: "New York",
            postalCode: "10001",
            phone: "+1234567890",
          },
        });

      expect(orderRes.statusCode).toEqual(201);
      expect(orderRes.body).toHaveProperty("orderNumber");
      expect(orderRes.body.totalAmount).toEqual(25.98);

      // Step 6: Track order - Get order details
      Order.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue({
            ...mockOrderData,
            user: {
              _id: mockUserId,
              name: "John Doe",
              email: "john@example.com",
            },
            items: [
              {
                ...mockOrderData.items[0],
                menuItem: {
                  name: "Grilled Chicken",
                  imageUrl: "/images/chicken.jpg",
                },
              },
            ],
          }),
        }),
      });

      const trackRes = await request(app)
        .get(`/api/orders/${mockOrderId}`)
        .set("Authorization", `Bearer ${customerToken}`);

      expect(trackRes.statusCode).toEqual(200);
      expect(trackRes.body.orderNumber).toEqual("ORD-1000");
      expect(trackRes.body.orderStatus).toEqual("pending");

      // Step 7: Get order history
      Order.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockResolvedValue([mockOrderData]),
      });

      Order.countDocuments.mockResolvedValue(1);

      const historyRes = await request(app)
        .get("/api/orders")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(historyRes.statusCode).toEqual(200);
      expect(historyRes.body).toHaveProperty("orders");
      expect(Array.isArray(historyRes.body.orders)).toBe(true);
    });
  });

  describe("Admin Management Flow", () => {
    let adminToken;
    let mockAdminId = "mockAdminId456";
    let mockCategoryId = "mockCategoryId456";
    let mockMenuItemId = "mockMenuItemId456";
    let mockOrderId = "mockOrderId456";

    beforeEach(() => {
      const jwt = require("jsonwebtoken");
      adminToken = jwt.sign({ id: mockAdminId }, process.env.JWT_SECRET, {
        expiresIn: "30d",
      });
    });

    it("should complete admin flow: create category → create menu item → manage orders", async () => {
      // Step 1: Admin creates category
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: mockAdminId,
          name: "Admin User",
          email: "admin@example.com",
          role: "admin",
        }),
      });

      Category.findOne.mockResolvedValue(null);
      Category.create.mockResolvedValue({
        _id: mockCategoryId,
        name: "Desserts",
        description: "Sweet treats",
        isActive: true,
      });

      const categoryRes = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Desserts",
          description: "Sweet treats",
        });

      expect(categoryRes.statusCode).toEqual(201);
      expect(categoryRes.body.name).toEqual("Desserts");

      // Step 2: Admin creates menu item
      MenuItem.findOne.mockResolvedValue(null);
      Category.findById.mockResolvedValue({
        _id: mockCategoryId,
        name: "Desserts",
        isActive: true,
      });

      MenuItem.create.mockResolvedValue({
        _id: mockMenuItemId,
        name: "Chocolate Cake",
        description: "Rich chocolate cake",
        price: 6.99,
        category: mockCategoryId,
        isAvailable: true,
      });

      // Mock MenuItem.findById for populate after creation
      MenuItem.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: mockMenuItemId,
          name: "Chocolate Cake",
          description: "Rich chocolate cake",
          price: 6.99,
          category: {
            _id: mockCategoryId,
            name: "Desserts",
          },
          isAvailable: true,
        }),
      });

      const menuItemRes = await request(app)
        .post("/api/menu")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Chocolate Cake",
          description: "Rich chocolate cake",
          price: 6.99,
          category: mockCategoryId,
        });

      expect(menuItemRes.statusCode).toEqual(201);
      expect(menuItemRes.body.name).toEqual("Chocolate Cake");

      // Step 3: Admin views all orders
      Order.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockResolvedValue([
          {
            _id: mockOrderId,
            orderNumber: "ORD-2000",
            orderStatus: "pending",
            totalAmount: 25.99,
          },
        ]),
      });

      Order.countDocuments.mockResolvedValue(1);

      const ordersRes = await request(app)
        .get("/api/orders")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(ordersRes.statusCode).toEqual(200);
      expect(ordersRes.body).toHaveProperty("orders");

      // Step 4: Admin updates order status
      const mockOrderForUpdate = {
        _id: mockOrderId,
        orderNumber: "ORD-2000",
        orderStatus: "pending",
        user: "mockUserId789",
        save: jest.fn().mockResolvedValue(true),
      };

      Order.findById
        .mockResolvedValueOnce(mockOrderForUpdate)
        .mockReturnValueOnce({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue({
              _id: mockOrderId,
              orderNumber: "ORD-2000",
              orderStatus: "preparing",
              user: { _id: "mockUserId789" },
            }),
          }),
        });

      // Mock socket.io
      const mockEmit = jest.fn();
      app.set("socketio", { emit: mockEmit });

      const updateRes = await request(app)
        .put(`/api/orders/${mockOrderId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          orderStatus: "preparing",
        });

      expect(updateRes.statusCode).toEqual(200);
      expect(updateRes.body.orderStatus).toEqual("preparing");
      expect(mockEmit).toHaveBeenCalledWith(
        "orderStatusUpdated",
        expect.objectContaining({
          orderId: mockOrderId,
          orderNumber: "ORD-2000",
          orderStatus: "preparing",
        })
      );
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle invalid credentials during login", async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app).post("/api/auth/login").send({
        email: "nonexistent@example.com",
        password: "wrongpassword",
      });

      expect(res.statusCode).toEqual(401);
    });

    it("should prevent unauthorized users from accessing protected routes", async () => {
      const res = await request(app).get("/api/orders");

      expect(res.statusCode).toEqual(401);
    });

    it("should prevent non-admin users from creating menu items", async () => {
      const jwt = require("jsonwebtoken");
      const customerToken = jwt.sign(
        { id: "customerId" },
        process.env.JWT_SECRET
      );

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: "customerId",
          name: "Customer",
          role: "customer",
        }),
      });

      const res = await request(app)
        .post("/api/menu")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          name: "Test Item",
          price: 9.99,
          category: "testCategory",
        });

      expect(res.statusCode).toEqual(403);
    });

    it("should handle order creation with empty cart", async () => {
      const jwt = require("jsonwebtoken");
      const token = jwt.sign({ id: "userId" }, process.env.JWT_SECRET);

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: "userId",
          name: "Test User",
          role: "customer",
        }),
      });

      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${token}`)
        .send({
          items: [],
          deliveryAddress: {
            street: "123 Main St",
            city: "Test City",
          },
        });

      expect(res.statusCode).toEqual(400);
    });
  });
});
