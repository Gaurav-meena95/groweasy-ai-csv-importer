const express = require('express');
const router = express.Router();
const csvController = require('../controllers/csv.controller');
const uploadMiddleware = require('../middleware/upload.middleware');
const { validateUpload } = require('../validators/csv.validator');

// POST /api/csv/upload (Preview API)
router.post('/upload', uploadMiddleware, validateUpload, csvController.uploadAndPreview);

// POST /api/csv/import (AI Extraction & Save API)
router.post('/import', uploadMiddleware, validateUpload, csvController.uploadAndImport);

module.exports = router;
