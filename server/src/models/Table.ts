import mongoose, { Document, Schema } from "mongoose";

export interface ITable extends Document {
  tableNumber: number;
  capacity: number;
  status: "available" | "occupied" | "reserved";
  assignedWaiter?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
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

const Table = mongoose.model<ITable>("Table", tableSchema);

export default Table;
