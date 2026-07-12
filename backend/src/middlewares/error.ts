import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Log error using pino or standard console
  if (req.log) {
    req.log.error(err);
  } else {
    console.error('[Error Middleware]:', err);
  }

  res.status(statusCode).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(isProduction ? {} : { stack: err.stack })
    }
  });
};
