import express from "express";
import {
  authUser,
  getUserProfile,
  getUsers,
  createUser,
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", authUser);
router.get("/profile", protect, getUserProfile);
router
  .route("/")
  .get(protect, admin, getUsers)
  .post(protect, admin, createUser);

export default router;
