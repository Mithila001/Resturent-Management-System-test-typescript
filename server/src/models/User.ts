import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

interface IAddress {
  street: string;
  city: string;
  zip: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role:
    | "customer"
    | "waiter"
    | "chef"
    | "cashier"
    | "manager"
    | "owner"
    | "admin"
    | "staff"
    | "delivery";
  phone: string;
  addresses: IAddress[];
  createdAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: [
      "customer",
      "waiter",
      "chef",
      "cashier",
      "manager",
      "owner",
      "admin",
      "staff",
      "delivery",
    ],
    default: "customer",
  },
  phone: {
    type: String,
    default: "",
  },
  addresses: [
    {
      street: { type: String },
      city: { type: String },
      zip: { type: String },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre<IUser>("save", async function (this: IUser) {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model<IUser>("User", userSchema);

export default User;
