const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const studentRoutes = require("./src/routes/studentRoutes");
const authRoutes = require("./src/routes/authRoutes");
const errorMiddleware = require("./src/middleware/errorMiddleware");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ message: "Student Management API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
