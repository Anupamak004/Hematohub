import express from "express";
import { registerHospital } from "../controllers/hospitalController.js";
import { loginHospital } from "../controllers/hospitalController.js";
import {authenticateHospital} from "../middleware/auth.js";
import { getHospitalDashboard } from "../controllers/hospitalController.js";



const router = express.Router();

router.post("/register", registerHospital);
router.post("/login", loginHospital); // Add login route
router.get("/dashboard", authenticateHospital, getHospitalDashboard); // Protected route


export default router;
