const StudyMaterial = require("../models/studyMaterialModel");

const uploadMaterial = async (req, res) => {
  try {
    const { title, subject, type } = req.body;

    if (!title || !subject || !type) {
      return res.status(400).json({
        message: "Please provide title, subject, and type",
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const material = await StudyMaterial.create({
      title,
      subject,
      type,
      fileUrl: `/uploads/${req.file.filename}`,
      uploadedBy: req.user?.userId,
    });

    return res.status(201).json({
      message: "Study material uploaded successfully",
      material,
    });
  } catch (error) {
    if (error?.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

const getMaterials = async (_req, res) => {
  try {
    const materials = await StudyMaterial.find()
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: materials.length,
      materials,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const searchMaterials = async (req, res) => {
  try {
    const keyword = req.query.keyword?.trim();

    if (!keyword) {
      return res
        .status(400)
        .json({ message: "Please provide a keyword query parameter" });
    }

    const materials = await StudyMaterial.find({
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { subject: { $regex: keyword, $options: "i" } },
      ],
    })
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: materials.length,
      materials,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadMaterial,
  getMaterials,
  searchMaterials,
};
