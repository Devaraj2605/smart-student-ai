const Timetable = require("../models/timetableModel");

const createTimetable = async (req, res) => {
  try {
    const { subject, teacher, day, time, section } = req.body;

    if (!subject || !teacher || !day || !time || !section) {
      return res.status(400).json({
        message: "Please provide subject, teacher, day, time, and section",
      });
    }

    const timetable = await Timetable.create({
      subject,
      teacher,
      day,
      time,
      section,
    });

    return res.status(201).json({
      message: "Timetable entry created successfully",
      timetable,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateTimetable = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedTimetable = await Timetable.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedTimetable) {
      return res.status(404).json({ message: "Timetable entry not found" });
    }

    return res.status(200).json({
      message: "Timetable entry updated successfully",
      timetable: updatedTimetable,
    });
  } catch (error) {
    if (error?.name === "CastError") {
      return res.status(400).json({ message: "Invalid timetable ID" });
    }
    return res.status(500).json({ message: error.message });
  }
};

const getTimetable = async (req, res) => {
  try {
    const { section } = req.query;
    const filter = section ? { section } : {};

    const timetable = await Timetable.find(filter).sort({
      day: 1,
      time: 1,
      subject: 1,
    });

    return res.status(200).json({
      count: timetable.length,
      timetable,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTimetable,
  updateTimetable,
  getTimetable,
};
