const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student ID is required"],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    marks: {
      type: Number,
      required: [true, "Marks are required"],
      min: [0, "Marks must be greater than or equal to 0"],
    },
    examType: {
      type: String,
      required: [true, "Exam type is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Result", resultSchema);
