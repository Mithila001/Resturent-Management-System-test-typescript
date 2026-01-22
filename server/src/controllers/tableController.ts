import { Request, Response } from "express";
import Table from "../models/Table";

type AuthRequest = Request & { user?: any };

// @desc    Get all tables
// @route   GET /api/tables
// @access  Private
const getTables = async (req: Request, res: Response) => {
  try {
    const tables = await Table.find().populate("assignedWaiter", "name");
    res.json(tables);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a table
// @route   POST /api/tables
// @access  Private/Admin/Manager
const createTable = async (req: Request, res: Response) => {
  const { tableNumber, capacity } = req.body as any;

  try {
    const tableExists = await Table.findOne({ tableNumber });

    if (tableExists) {
      return res.status(400).json({ message: "Table already exists" });
    }

    const table = await Table.create({
      tableNumber,
      capacity,
    });

    res.status(201).json(table);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update table status
// @route   PUT /api/tables/:id/status
// @access  Private (Waiter/Admin/Manager)
const updateTableStatus = async (req: Request, res: Response) => {
  const { status } = req.body as any;

  try {
    const table = await Table.findById(req.params.id);

    if (table) {
      table.status = status;
      const updatedTable = await table.save();
      res.json(updatedTable);
    } else {
      res.status(404).json({ message: "Table not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign waiter to table
// @route   PUT /api/tables/:id/assign
// @access  Private (Manager/Admin/Waiter)
const assignWaiter = async (req: AuthRequest, res: Response) => {
  // If not specified, assign to self (if waiter calls it) or from body
  const waiterId = (req.body as any).waiterId || req.user?._id;

  try {
    const table = await Table.findById(req.params.id);

    if (table) {
      table.assignedWaiter = waiterId;
      // Also optional: change status to occupied? No, maybe just assignment first.
      const updatedTable = await table.save();
      await updatedTable.populate("assignedWaiter", "name");
      res.json(updatedTable);
    } else {
      res.status(404).json({ message: "Table not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update table details (number, capacity)
// @route   PUT /api/tables/:id
// @access  Private (Admin/Manager)
const updateTable = async (req: Request, res: Response) => {
  const { tableNumber, capacity } = req.body as any;

  try {
    const table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    // Check if new table number is already taken by another table
    if (tableNumber && tableNumber !== table.tableNumber) {
      const existingTable = await Table.findOne({ tableNumber });
      if (existingTable) {
        return res.status(400).json({ message: "Table number already exists" });
      }
      table.tableNumber = tableNumber;
    }

    if (capacity) {
      table.capacity = capacity;
    }

    const updatedTable = await table.save();
    res.json(updatedTable);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a table
// @route   DELETE /api/tables/:id
// @access  Private (Admin/Manager)
const deleteTable = async (req: Request, res: Response) => {
  try {
    const table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    await table.deleteOne();
    res.json({ message: "Table removed successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getTables,
  createTable,
  updateTableStatus,
  assignWaiter,
  updateTable,
  deleteTable,
};
