const multer = require('multer');
const path = require('path');

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

// Расширение задаём сами по mime-типу, а не берём из имени файла клиента
const ALLOWED_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif'
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 МБ

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + ALLOWED_TYPES[file.mimetype]);
  }
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_TYPES[file.mimetype]) {
    return cb(new Error('Допустимы только изображения: jpeg, png, webp, gif'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 }
});

module.exports = { upload };
