import express from "express";
import { updateProfile, getUsersForSidebar } from "../controllers/userController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const userRouter = express.Router();

userRouter.get("/", verifyToken, getUsersForSidebar);
userRouter.put("/update-profile", verifyToken, updateProfile);

export default userRouter;