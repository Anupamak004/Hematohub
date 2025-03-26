import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import donorRoutes from "./routes/donorRoutes.js";
import hospitalRoutes from "./routes/hospitalRoutes.js";
import adminRoutes from './routes/admin.js';
import bloodRoutes from "./routes/blood.js"; // Import blood routes
import recipientRoutes from "./routes/recipient.js";


dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors({ origin: "*", credentials: true }));

app.use("/api/donors", donorRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api/blood", bloodRoutes); // Register new blood routes
app.use("/api/recipients", recipientRoutes);


app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({ message: err.message });
  });

// Protected Admin Route (Example)



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
