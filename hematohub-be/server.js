import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import donorRoutes from "./routes/donorRoutes.js";
import hospitalRoutes from "./routes/hospitalRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors({ origin: "*", credentials: true }));

app.use("/api/donors", donorRoutes);
app.use("/api/hospitals", hospitalRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
