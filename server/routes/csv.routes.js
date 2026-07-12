const express = require('express');
const router = express.Router();
const csvController = require('../controllers/csv.controller');
const uploadMiddleware = require('../middleware/upload.middleware');
const { validateUpload } = require('../validators/csv.validator');

// POST /api/csv/upload
router.post('/upload', uploadMiddleware, validateUpload, csvController.uploadAndPreview);

module.exports = router;
