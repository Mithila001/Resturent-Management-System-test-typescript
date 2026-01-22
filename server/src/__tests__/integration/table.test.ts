import request from "supertest";
import app from "../../app";
import Table from "../../models/Table";
import User from "../../models/User";
import jwt from "jsonwebtoken";

// Mock models
jest.mock("../../models/Table");
jest.mock("../../models/User");

describe("Table API Integration", () => {
    let token: string;
    const userId = "admin_user";

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = "test_secret";

        // Mock User for auth - Admin role for table management
        (User.findById as jest.Mock).mockReturnValue({
            select: jest.fn().mockResolvedValue({
                _id: userId,
                role: "admin",
                name: "Admin User"
            })
        });

        token = jwt.sign({ id: userId }, "test_secret");
    });

    describe("GET /api/tables", () => {
        it("should return all tables", async () => {
            const mockTables = [
                { tableNumber: 1, capacity: 4, status: "available" },
                { tableNumber: 2, capacity: 2, status: "occupied" }
            ];

            (Table.find as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockTables)
            });

            const res = await request(app)
                .get("/api/tables")
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
        });
    });

    describe("POST /api/tables", () => {
        it("should create a new table (admin)", async () => {
            (Table.findOne as jest.Mock).mockResolvedValue(null); // Table doesn't exist
            (Table.create as jest.Mock).mockResolvedValue({
                _id: "table_123",
                tableNumber: 5,
                capacity: 6,
                status: "available"
            });

            const res = await request(app)
                .post("/api/tables")
                .set("Authorization", `Bearer ${token}`)
                .send({ tableNumber: 5, capacity: 6 });

            expect(res.status).toBe(201);
            expect(res.body.tableNumber).toBe(5);
        });

        it("should return 400 if table already exists", async () => {
            (Table.findOne as jest.Mock).mockResolvedValue({ tableNumber: 5 });

            const res = await request(app)
                .post("/api/tables")
                .set("Authorization", `Bearer ${token}`)
                .send({ tableNumber: 5, capacity: 6 });

            expect(res.status).toBe(400);
        });
    });

    describe("PUT /api/tables/:id/status", () => {
        it("should update table status", async () => {
            const mockSave = jest.fn().mockResolvedValue({
                _id: "table_1",
                status: "occupied"
            });

            const mockTable = {
                _id: "table_1",
                status: "available",
                save: mockSave
            };

            (Table.findById as jest.Mock).mockResolvedValue(mockTable);

            const res = await request(app)
                .put("/api/tables/table_1/status")
                .set("Authorization", `Bearer ${token}`)
                .send({ status: "occupied" });

            expect(res.status).toBe(200);
            // Since we manually update property in controller: table.status = status;
            expect(mockTable.status).toBe("occupied");
            expect(mockSave).toHaveBeenCalled();
        });

        it("should return 404 if table not found", async () => {
            (Table.findById as jest.Mock).mockResolvedValue(null);

            const res = await request(app)
                .put("/api/tables/invalid_id/status")
                .set("Authorization", `Bearer ${token}`)
                .send({ status: "occupied" });

            expect(res.status).toBe(404);
        });
    });
});
