import express from "express";
import { registerDonor } from "../controllers/donorController.js";
import {authenticateDonor} from "../middleware/auth.js";
import { getDonorDashboard } from "../controllers/donorController.js";
import { loginDonor } from "../controllers/donorController.js";

const router = express.Router();

router.post("/register", registerDonor);
router.get("/dashboard", authenticateDonor, getDonorDashboard);
router.post("/login", loginDonor); // Add login route


export default router;
