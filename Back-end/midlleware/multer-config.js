const multer = require("multer");

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, "images"),
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + "." + extension);
  },
});
const fileFilter = (req, file, cb) => {
  if (!MIME_TYPES[file.mimetype])
    return cb(new Error("Type de ficher non autorisé"), false);
  cb(null, true);
};

module.exports = multer({
  storage: storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single("image");
