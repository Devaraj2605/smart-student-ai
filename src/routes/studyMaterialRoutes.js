const express = require("express");
const {
  uploadMaterial,
  getMaterials,
  searchMaterials,
} = require("../controllers/studyMaterialController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/", authMiddleware, upload.single("file"), uploadMaterial);
router.get("/", authMiddleware, getMaterials);
router.get("/search", authMiddleware, searchMaterials);

module.exports = router;
