import multer from "multer";
import Pkg from "cloudinary";
const { v2: cloudinary } = Pkg;
import { CloudinaryStorage } from "multer-storage-cloudinary";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "mp4", "svg", "pdf"],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedExts = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "image/svg+xml",
      "application/pdf",
    ];
    // Validate file type
    if (!allowedExts.includes(file.mimetype)) {
      return cb(
        new Error(
          "Unsupported file type. Allowed formats: jpg, png, webp, mp4, svg, pdf"
        ),
        false
      );
    }
    cb(null, true);
  },
});

// Export upload middleware
export default upload;
