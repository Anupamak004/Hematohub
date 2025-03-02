const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json()); // Parses JSON data
app.use(cors()); // Allows frontend to call backend APIs

// Sample route
app.get("/", (req, res) => {
  res.send("HematoHub API is running...");
});

// Import API routes
app.use("/api/auth", require("./routes/authRoutes"));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
