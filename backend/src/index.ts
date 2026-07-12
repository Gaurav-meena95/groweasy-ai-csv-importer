import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { pinoHttp } from 'pino-http';
import { upload } from './config/multer.js';
import { errorHandler } from './middlewares/error.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());

// CORS configuration (allow frontend on port 3000)
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: 'Too many requests from this IP, please try again after 15 minutes.'
    }
  }
});
app.use('/api', limiter);

// Request Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Pino Logging
app.use(pinoHttp());

// Basic API routes
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// CSV Upload endpoint placeholder
app.post('/api/upload', upload.single('file'), (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload a CSV file.');
    }
    
    // File uploaded successfully
    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        name: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size
      }
    });
  } catch (error) {
    next(error);
  }
});

// Centralized error handling middleware (must be wired last)
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`[Server] Running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
});
