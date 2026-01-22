import mongoose, { Document, Schema } from "mongoose";

export interface ITable extends Document {
  tableNumber: number;
  capacity: number;
  status: "available" | "occupied" | "reserved";
  assignedWaiter?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
  occupy(): void;
  leave(): void;
}

const tableSchema = new Schema<ITable>(
  {
    tableNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "occupied", "reserved"],
      default: "available",
    },
    assignedWaiter: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// State transition methods
tableSchema.methods.occupy = function (this: ITable) {
  if (this.status !== "available" && this.status !== "reserved") {
    throw new Error(`Cannot occupy table in ${this.status} state`);
  }
  this.status = "occupied";
};

tableSchema.methods.leave = function (this: ITable) {
  if (this.status !== "occupied") {
    throw new Error(`Cannot leave table that is not occupied`);
  }
  // Transition directly to available since dirty status is removed
  this.status = "available";
  this.assignedWaiter = null; // Clear waiter
};


const Table = mongoose.model<ITable>("Table", tableSchema);

export default Table;
