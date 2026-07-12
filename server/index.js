require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const logger = require('./utils/logger');

// Validate critical environment variables
if (!process.env.MONGO_URI) {
  logger.error('CRITICAL ERROR: MONGO_URI environment variable is not defined.');
  process.exit(1);
}
if (!process.env.GEMINI_API_KEY) {
  logger.error('CRITICAL ERROR: GEMINI_API_KEY environment variable is not defined.');
  process.exit(1);
}

const connectDB = require('./config/db');
const routes = require('./routes');
const errorMiddleware = require('./middleware/error.middleware');
const { sendError } = require('./utils/response');

const app = express();
// Force server to port 5005 if it defaults to 3000 to avoid conflicts with Next.js
const PORT = process.env.PORT && process.env.PORT !== '3000' ? process.env.PORT : 5005;

// Connect to MongoDB
connectDB();

// Trust reverse proxy (for rate limiting headers accuracy)
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet());

// CORS configuration (flexible but ready for production configurations)
app.use(cors({
  origin: '*', // In production, replace with specific trusted origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// HTTP Request Logger
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again after 15 minutes.'
  }
});
app.use('/api', apiLimiter);

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Welcome root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the GrowEasy CSV Importer Backend API. Health checks are available at /api/health'
  });
});

// Mount API routes
app.use('/api', routes);

// 404 Not Found Route Handler
app.use((req, res, next) => {
  const error = new Error(`Route not found - ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Centralized Global Error Handler Middleware
app.use(errorMiddleware);

// Start listening for traffic
app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
});
