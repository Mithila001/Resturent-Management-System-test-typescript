import mongoose from "mongoose";
import User, { IUser } from "../../models/User";

// Mock bcryptjs at top level
jest.mock("bcryptjs", () => ({
    compare: jest.fn(),
    genSalt: jest.fn(),
    hash: jest.fn(),
}));

import bcrypt from "bcryptjs";

describe("User Model Unit Tests", () => {
    it("should validate a valid user", () => {
        const validUser = new User({
            name: "John Doe",
            email: "john@example.com",
            password: "password123",
            role: "customer"
        });
        const err = validUser.validateSync();
        expect(err).toBeUndefined();
    });

    it("should require name, email, and password", () => {
        const user = new User({});
        const err = user.validateSync();
        expect(err?.errors.name).toBeDefined();
        expect(err?.errors.email).toBeDefined();
        expect(err?.errors.password).toBeDefined();
    });

    it("should invalid role trigger validation error", () => {
        const user = new User({
            name: "John",
            email: "john@test.com",
            password: "123",
            role: "invalid_role"
        });
        const err = user.validateSync();
        expect(err?.errors.role).toBeDefined();
    });

    it("should match password correctly", async () => {
        const user = new User({
            name: "Test",
            email: "test@test.com",
            password: "hashed_password"
        });

        // Setup mock return value
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);

        const isMatch = await user.matchPassword("plainpassword");
        expect(isMatch).toBe(true);
        expect(bcrypt.compare).toHaveBeenCalledWith("plainpassword", "hashed_password");
    });
});
