const csvService = require('../services/csv.service');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Handle CSV upload and generate row previews
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

module.exports = {
  uploadAndPreview
};
