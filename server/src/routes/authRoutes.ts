import express from "express";
const router = express.Router();
import { registerUser, loginUser, getUserProfile, updateUserProfile, getUsers, deleteUser } from "../controllers/authController";
import { protect, authorize } from "../middleware/authMiddleware";

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
// User Management Routes
router.get("/users", protect, authorize("admin", "owner", "manager"), getUsers);
router.delete("/users/:id", protect, authorize("admin", "owner"), deleteUser);

export default router;
