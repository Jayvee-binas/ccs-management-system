const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "..", "uploads", "certificates");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "certificate-" + uniqueSuffix + ext);
  },
});

// File filter for allowed types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PDF, images, and Word documents are allowed.",
      ),
      false,
    );
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Profile picture upload configuration
const profileUploadDir = path.join(__dirname, "..", "uploads", "profiles");
if (!fs.existsSync(profileUploadDir)) {
  fs.mkdirSync(profileUploadDir, { recursive: true });
}

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profileUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "profile-" + uniqueSuffix + ext);
  },
});

const profileFilter = (req, file, cb) => {
  const allowedTypes = [".jpg", ".jpeg", ".png"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPG and PNG images are allowed."),
      false,
    );
  }
};

const profileUpload = multer({
  storage: profileStorage,
  fileFilter: profileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
});

module.exports = {
  upload,
  profileUpload,
};
