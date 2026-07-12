const { GoogleGenAI } = require('@google/genai');
const logger = require('../utils/logger');

let aiInstance = null;

try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'mock-key') {
    logger.warn('GEMINI_API_KEY is not set or using mock-key. AI extraction features will fail.');
  }
  
  // Initialize the SDK client
  aiInstance = new GoogleGenAI({ apiKey: apiKey || 'mock-key' });
} catch (error) {
  logger.error('Failed to initialize Gemini SDK:', error.message);
}

module.exports = aiInstance;
