const { z } = require('zod');
const { sendError } = require('../utils/response');

const uploadSchema = z.object({
  file: z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string(),
    destination: z.string(),
    filename: z.string(),
    path: z.string(),
    size: z.number().max(10 * 1024 * 1024, 'File size cannot exceed 10MB') // 10MB Limit
  }, { required_error: 'CSV file upload is required.' })
});

const validateUpload = (req, res, next) => {
  try {
    uploadSchema.parse({ file: req.file });
    next();
  } catch (error) {
    const errorMsg = error.errors ? error.errors[0].message : 'Invalid request inputs.';
    return sendError(res, errorMsg, error.errors, 400);
  }
};

module.exports = {
  validateUpload
};
