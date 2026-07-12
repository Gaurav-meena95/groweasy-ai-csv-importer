const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up disk storage with unique filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Allow only CSV file extensions and MIME types
const fileFilter = (req, file, cb) => {
  const extname = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.csv'];
  const allowedMimetypes = ['text/csv', 'application/vnd.ms-excel', 'text/x-csv', 'application/csv', 'text/comma-separated-values'];

  const isMimeMatch = allowedMimetypes.includes(file.mimetype);
  const isExtMatch = allowedExts.includes(extname);

  if (isMimeMatch || isExtMatch) {
    return cb(null, true);
  }

  cb(new Error('Only CSV files (.csv) are allowed.'), false);
};

const uploadInstance = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB file size limit
  }
});

// Wrapper middleware to intercept Multer errors and pass them to the global error handler
const uploadMiddleware = (req, res, next) => {
  uploadInstance.single('file')(req, res, (err) => {
    if (err) {
      // Intercept file limit or file filter errors
      err.statusCode = 400;
      return next(err);
    }
    next();
  });
};

module.exports = uploadMiddleware;
