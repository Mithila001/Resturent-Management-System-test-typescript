const request = require("supertest");
const app = require("../app");
const User = require("../models/User");

// Mock specific DB operations for User
jest.mock("../models/User");

describe("Auth API", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test_secret";
    jest.clearAllMocks();
  });

  it("POST /api/auth/register should create a user", async () => {
    // Mock User.findOne to return null (user doesn't exist)
    User.findOne.mockResolvedValue(null);
    // Mock User.create to return a new user object
    User.create.mockResolvedValue({
      _id: "123",
      name: "Test User",
      email: "test@example.com",
      role: "customer",
      password: "hashedpassword",
    });

    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.email).toEqual("test@example.com");
  });

  it("POST /api/auth/login should return token for valid credentials", async () => {
    const mockMatchPassword = jest.fn().mockResolvedValue(true);
    User.findOne.mockResolvedValue({
      _id: "123",
      name: "Test User",
      email: "test@example.com",
      password: "hashedpassword",
      matchPassword: mockMatchPassword,
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
  });
});
