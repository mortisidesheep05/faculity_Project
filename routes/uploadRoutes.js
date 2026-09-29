import path from "path";
import express from "express";
import multer from "multer";

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`,
    );
  },
});

const upload = multer({ storage });

router.post("/", upload.single("file"), (req, res) => {
  res.send({
    message: "File Uploaded",
    url: `/uploads/${req.file.filename}`,
    name: req.file.originalname,
    type: req.file.mimetype,
    size: req.file.size,
  });
});

export default router;
