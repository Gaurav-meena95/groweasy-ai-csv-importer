const mongoose = require('mongoose');
const { ALLOWED_CRM_STATUSES, ALLOWED_DATA_SOURCES } = require('../utils/constants');

const LeadSchema = new mongoose.Schema({
  created_at: {
    type: Date,
    required: true,
    default: Date.now
  },
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  country_code: {
    type: String,
    trim: true
  },
  mobile_without_country_code: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  lead_owner: {
    type: String,
    trim: true
  },
  crm_status: {
    type: String,
    enum: ALLOWED_CRM_STATUSES,
    trim: true
  },
  crm_note: {
    type: String,
    trim: true
  },
  data_source: {
    type: String,
    enum: ALLOWED_DATA_SOURCES,
    trim: true
  },
  possession_time: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Lead', LeadSchema);
