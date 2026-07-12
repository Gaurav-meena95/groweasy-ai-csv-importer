const sendSuccess = (res, message, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const sendError = (res, message, error = null, statusCode = 500) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  let errorDetails = null;
  if (error) {
    if (typeof error === 'string') {
      errorDetails = error;
    } else if (error instanceof Error) {
      errorDetails = isProduction ? null : {
        message: error.message,
        stack: error.stack
      };
    } else {
      errorDetails = error;
    }
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(errorDetails && { error: errorDetails })
  });
};

module.exports = {
  sendSuccess,
  sendError
};
