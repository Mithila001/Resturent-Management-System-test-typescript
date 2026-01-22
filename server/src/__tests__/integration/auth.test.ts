import request from "supertest";
import app from "../../app";
import User from "../../models/User";

// Mock User model
jest.mock("../../models/User");

describe("Auth API Integration", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = "test_secret";
    });

    describe("POST /api/auth/register", () => {
        it("should register a new user successfully", async () => {
            // Mock User.findOne to return null (user doesn't exist)
            (User.findOne as jest.Mock).mockResolvedValue(null);
            // Mock User.create to return new user
            (User.create as jest.Mock).mockResolvedValue({
                _id: "user_id_123",
                name: "Test User",
                email: "test@example.com",
                role: "customer",
                password: "hashed_password"
            });

            const res = await request(app).post("/api/auth/register").send({
                name: "Test User",
                email: "test@example.com",
                password: "password123"
            });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("token");
            expect(res.body.email).toBe("test@example.com");
        });

        it("should return 400 if user already exists", async () => {
            (User.findOne as jest.Mock).mockResolvedValue({ email: "existing@example.com" });

            const res = await request(app).post("/api/auth/register").send({
                name: "Existing User",
                email: "existing@example.com",
                password: "password123"
            });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("User already exists");
        });
    });

    describe("POST /api/auth/login", () => {
        it("should login successfully with valid credentials", async () => {
            const mockMatchPassword = jest.fn().mockResolvedValue(true);
            (User.findOne as jest.Mock).mockResolvedValue({
                _id: "user_id_123",
                email: "test@example.com",
                password: "hashed_password",
                matchPassword: mockMatchPassword,
                name: "Test User",
                role: "customer"
            });

            const res = await request(app).post("/api/auth/login").send({
                email: "test@example.com",
                password: "password123"
            });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("token");
        });

        it("should return 401 with invalid credentials", async () => {
            const mockMatchPassword = jest.fn().mockResolvedValue(false);
            (User.findOne as jest.Mock).mockResolvedValue({
                email: "test@example.com",
                matchPassword: mockMatchPassword
            });

            const res = await request(app).post("/api/auth/login").send({
                email: "test@example.com",
                password: "wrongpassword"
            });

            expect(res.status).toBe(401);
            expect(res.body.message).toBe("Invalid email or password");
        });
    });
});
