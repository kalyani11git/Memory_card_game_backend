const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./src/config/db");
const cors = require("cors");
// const { use } = require("react");

require("dotenv").config(); // Load environment variables

// Connect to MongoDB
connectDB();

const app = express();
app.use(express.json());  // ✅ This enables JSON parsing
app.use(cors());

const router = require("./src/routers/userRoutes");

app.use("/api",router);
// app.use("/api",router);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
