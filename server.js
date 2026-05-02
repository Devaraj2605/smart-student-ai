const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const studentRoutes = require("./src/routes/studentRoutes");
const authRoutes = require("./src/routes/authRoutes");
const timetableRoutes = require("./src/routes/timetableRoutes");
const attendanceRoutes = require("./src/routes/attendanceRoutes");
const studyMaterialRoutes = require("./src/routes/studyMaterialRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const resultRoutes = require("./src/routes/resultRoutes");
const errorMiddleware = require("./src/middleware/errorMiddleware");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.status(200).json({ message: "Student Management API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/materials", studyMaterialRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/results", resultRoutes);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
