const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads/cups directory exists
const cupsDir = path.join(__dirname, '../uploads/cups');
if (!fs.existsSync(cupsDir)) {
  fs.mkdirSync(cupsDir, { recursive: true });
}

// Configure storage for cups
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, cupsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter for images (same as upload.js)
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const uploadCup = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'));
    }
  }
});

module.exports = uploadCup; 