const csvService = require('../services/csv.service');
const geminiService = require('../services/gemini.service');
const logger = require('../utils/logger');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Handle CSV upload and generate row previews (Phase 2)
 * @param {Object} req 
 * @param {Object} res 
 * @param {Function} next 
 */
const uploadAndPreview = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'No CSV file uploaded.', null, 400);
    }

    // Default preview limit to 100 rows, customizable by query params
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 100;

    const result = await csvService.parseCSV(req.file.path, limit);

    if (result.totalRecords === 0 && result.headers.length === 0) {
      return sendError(res, 'The uploaded CSV file is empty or invalid.', null, 400);
    }

    return sendSuccess(res, 'CSV file parsed successfully.', result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Handle CSV upload, batch processing, Gemini mapping, and DB save (Phase 3)
 * @param {Object} req 
 * @param {Object} res 
 * @param {Function} next 
 */
const uploadAndImport = async (req, res, next) => {
  const startTime = Date.now();
  try {
    if (!req.file) {
      return sendError(res, 'No CSV file uploaded.', null, 400);
    }

    logger.info(`Starting CSV import process for file: ${req.file.originalname}`);

    // Parse all rows (use Infinity to parse everything)
    const result = await csvService.parseCSV(req.file.path, Infinity);

    if (result.totalRecords === 0 && result.headers.length === 0) {
      return sendError(res, 'The uploaded CSV file is empty or invalid.', null, 400);
    }

    if (result.totalRecords === 0) {
      const processingTimeMs = Date.now() - startTime;
      return sendSuccess(res, 'CSV parsed, but all records were skipped as they lacked email or mobile number.', {
        stats: {
          totalUploaded: result.skippedRecords,
          successfullyParsed: 0,
          skipped: result.skippedRecords,
          failed: 0,
          processingTimeMs
        },
        records: [],
        skipped: result.skippedRows
      }, 200);
    }

    // Run AI Extraction & Mapping (which also handles database inserts)
    const importResult = await geminiService.importCSVLeads(result.previewRows);

    const processingTimeMs = Date.now() - startTime;
    logger.info(`CSV import process finished in ${processingTimeMs}ms.`);

    return sendSuccess(res, 'CSV data imported and AI processed successfully.', {
      stats: {
        totalUploaded: result.totalRecords + result.skippedRecords,
        successfullyParsed: importResult.successfullyParsed,
        skipped: result.skippedRecords,
        failed: importResult.failed,
        processingTimeMs
      },
      records: importResult.records,
      skipped: result.skippedRows
    }, 200);

  } catch (error) {
    logger.error('CSV import API execution failed:', error.message);
    next(error);
  }
};

module.exports = {
  uploadAndPreview,
  uploadAndImport
};
