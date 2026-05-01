const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    teacher: {
      type: String,
      required: [true, "Teacher is required"],
      trim: true,
    },
    day: {
      type: String,
      required: [true, "Day is required"],
      trim: true,
    },
    time: {
      type: String,
      required: [true, "Time is required"],
      trim: true,
    },
    section: {
      type: String,
      required: [true, "Section is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Timetable", timetableSchema);
