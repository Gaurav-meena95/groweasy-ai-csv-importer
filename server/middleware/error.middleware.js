const logger = require('../utils/logger');
const { sendError } = require('../utils/response');

const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error using our timestamped logger utility
  logger.error(`${req.method} ${req.originalUrl} - Error:`, err);

  // Return standard JSON response
  return sendError(res, message, err, statusCode);
};

module.exports = errorMiddleware;
