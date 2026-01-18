const request = require("supertest");
const app = require("../app");
const Category = require("../models/Category");
const MenuItem = require("../models/MenuItem");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Mock the models
jest.mock("../models/Category");
jest.mock("../models/MenuItem");
jest.mock("../models/User");

let adminToken;
let categoryId = "mockCategoryId123";
let menuItemId = "mockMenuItemId123";

beforeAll(() => {
  process.env.JWT_SECRET = "test_secret";

  // Generate token for mock admin user
  adminToken = jwt.sign({ id: "mockAdminId123" }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Category API Tests", () => {
  describe("POST /api/categories", () => {
    it("should create a new category with admin token", async () => {
      // Mock User.findById for protect middleware
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: "mockAdminId123",
          name: "Admin User",
          role: "admin",
        }),
      });

      // Mock Category.findOne to return null (category doesn't exist)
      Category.findOne.mockResolvedValue(null);

      // Mock Category.create
      Category.create.mockResolvedValue({
        _id: categoryId,
        name: "Appetizers",
        description: "Start your meal with our delicious appetizers",
        order: 1,
        isActive: true,
      });

      const res = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Appetizers",
          description: "Start your meal with our delicious appetizers",
          order: 1,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("_id");
      expect(res.body.name).toBe("Appetizers");
    });

    it("should fail to create category without admin token", async () => {
      const res = await request(app).post("/api/categories").send({
        name: "Test Category",
        description: "Test",
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe("GET /api/categories", () => {
    it("should get all categories", async () => {
      // Mock Category.find
      const mockCategories = [
        {
          _id: categoryId,
          name: "Appetizers",
          description: "Starters",
          isActive: true,
          order: 1,
        },
      ];

      Category.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockCategories),
      });

      const res = await request(app).get("/api/categories");

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("GET /api/categories/:id", () => {
    it("should get category by id", async () => {
      Category.findById.mockResolvedValue({
        _id: categoryId,
        name: "Appetizers",
        isActive: true,
      });

      const res = await request(app).get(`/api/categories/${categoryId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body._id).toBe(categoryId);
    });
  });

  describe("PUT /api/categories/:id", () => {
    it("should update category with admin token", async () => {
      // Mock User.findById for protect middleware
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: "mockAdminId123",
          name: "Admin User",
          role: "admin",
        }),
      });

      const mockCategory = {
        _id: categoryId,
        name: "Appetizers",
        description: "Original description",
        isActive: true,
        save: jest.fn().mockResolvedValue({
          _id: categoryId,
          name: "Appetizers",
          description: "Updated description",
          isActive: true,
        }),
      };

      Category.findById.mockResolvedValue(mockCategory);

      const res = await request(app)
        .put(`/api/categories/${categoryId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          description: "Updated description",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.description).toBe("Updated description");
    });
  });
});

describe("MenuItem API Tests", () => {
  describe("POST /api/menu", () => {
    it("should create a new menu item with admin token", async () => {
      // Mock User.findById for protect middleware
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: "mockAdminId123",
          name: "Admin User",
          role: "admin",
        }),
      });

      // Mock Category.findById
      Category.findById.mockResolvedValue({
        _id: categoryId,
        name: "Appetizers",
      });

      // Mock MenuItem.create
      MenuItem.create.mockResolvedValue({
        _id: menuItemId,
        name: "Spring Rolls",
        description: "Crispy vegetable spring rolls",
        price: 8.99,
        category: categoryId,
        isVegetarian: true,
        preparationTime: 15,
      });

      // Mock MenuItem.findById for populate
      MenuItem.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: menuItemId,
          name: "Spring Rolls",
          description: "Crispy vegetable spring rolls",
          price: 8.99,
          category: { _id: categoryId, name: "Appetizers" },
          isVegetarian: true,
          preparationTime: 15,
        }),
      });

      const res = await request(app)
        .post("/api/menu")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Spring Rolls",
          description: "Crispy vegetable spring rolls",
          price: 8.99,
          category: categoryId,
          isVegetarian: true,
          preparationTime: 15,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("_id");
      expect(res.body.name).toBe("Spring Rolls");
      expect(res.body.price).toBe(8.99);
    });

    it("should fail to create menu item without admin token", async () => {
      const res = await request(app).post("/api/menu").send({
        name: "Test Item",
        description: "Test",
        price: 10,
        category: categoryId,
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe("GET /api/menu", () => {
    it("should get all menu items", async () => {
      const mockMenuItems = [
        {
          _id: menuItemId,
          name: "Spring Rolls",
          price: 8.99,
          category: { _id: categoryId, name: "Appetizers" },
        },
      ];

      MenuItem.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockMenuItems),
        }),
      });

      const res = await request(app).get("/api/menu");

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should filter menu items by category", async () => {
      const mockMenuItems = [
        {
          _id: menuItemId,
          name: "Spring Rolls",
          price: 8.99,
          category: { _id: categoryId, name: "Appetizers" },
        },
      ];

      MenuItem.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockMenuItems),
        }),
      });

      const res = await request(app).get(`/api/menu?category=${categoryId}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("GET /api/menu/:id", () => {
    it("should get menu item by id", async () => {
      MenuItem.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: menuItemId,
          name: "Spring Rolls",
          price: 8.99,
          category: { _id: categoryId, name: "Appetizers" },
        }),
      });

      const res = await request(app).get(`/api/menu/${menuItemId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body._id).toBe(menuItemId);
    });
  });

  describe("PUT /api/menu/:id", () => {
    it("should update menu item with admin token", async () => {
      // Mock User.findById for protect middleware
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: "mockAdminId123",
          name: "Admin User",
          role: "admin",
        }),
      });

      const mockMenuItem = {
        _id: menuItemId,
        name: "Spring Rolls",
        price: 8.99,
        category: categoryId,
        save: jest.fn().mockResolvedValue({
          _id: menuItemId,
          name: "Spring Rolls",
          price: 9.99,
          category: categoryId,
        }),
      };

      MenuItem.findById.mockResolvedValueOnce(mockMenuItem);

      // Mock the findById call after save for populate
      MenuItem.findById.mockReturnValueOnce({
        populate: jest.fn().mockResolvedValue({
          _id: menuItemId,
          name: "Spring Rolls",
          price: 9.99,
          category: { _id: categoryId, name: "Appetizers" },
        }),
      });

      const res = await request(app)
        .put(`/api/menu/${menuItemId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          price: 9.99,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.price).toBe(9.99);
    });
  });

  describe("DELETE /api/menu/:id", () => {
    it("should delete menu item with admin token", async () => {
      // Mock User.findById for protect middleware
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: "mockAdminId123",
          name: "Admin User",
          role: "admin",
        }),
      });

      const mockMenuItem = {
        _id: menuItemId,
        name: "Spring Rolls",
        deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      };

      MenuItem.findById.mockResolvedValue(mockMenuItem);

      const res = await request(app)
        .delete(`/api/menu/${menuItemId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Menu item removed successfully");
    });
  });
});
