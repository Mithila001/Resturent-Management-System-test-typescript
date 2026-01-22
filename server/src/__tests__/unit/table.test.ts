import Table, { ITable } from "../../models/Table";

describe("Table Logic Unit Tests", () => {
    let table: ITable;

    beforeEach(() => {
        table = new Table({
            tableNumber: 1,
            capacity: 4,
            status: "available"
        });
    });

    it("should initialize with 'available' status", () => {
        expect(table.status).toBe("available");
    });

    it("should transition 'available' -> 'occupied'", () => {
        table.occupy();
        expect(table.status).toBe("occupied");
    });

    it("should transition 'occupied' -> 'available' (via leave)", () => {
        table.status = "occupied";
        table.leave();
        expect(table.status).toBe("available");
        expect(table.assignedWaiter).toBeNull();
    });

    it("should prevent invalid transition from 'available' -> 'occupied' if occupied (wait, logic says available/reserved -> occupied is ok)", () => {
        // Trying to occupy an already occupied table
        table.status = "occupied";
        expect(() => table.occupy()).toThrow();
    });

    it("should prevent invalid transition from 'available' -> 'available' (via leave) directly", () => {
        // leave() throws if not occupied
        table.status = "available";
        expect(() => table.leave()).toThrow();
    });

    it("should validate capacity", () => {
        // Check required capacity
        const tableNoCap = new Table({ tableNumber: 2 });
        const reqErr = tableNoCap.validateSync();
        expect(reqErr?.errors.capacity).toBeDefined();
    });
});
