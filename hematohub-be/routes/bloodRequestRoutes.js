import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getBloodRequests, submitBloodRequest } from "../controllers/bloodRequestController.js";

const router = express.Router();

router.get("/", authMiddleware, getBloodRequests);
router.post("/", authMiddleware, submitBloodRequest);

export default router;
