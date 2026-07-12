const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const csvRoutes = require('./csv.routes');
const { sendSuccess } = require('../utils/response');

// GET /api/health
router.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  return sendSuccess(res, 'Server health check passed.', {
    status: 'server running',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Register sub-routers
router.use('/csv', csvRoutes);

module.exports = router;
