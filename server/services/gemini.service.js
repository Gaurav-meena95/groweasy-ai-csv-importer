const ai = require('../config/gemini');
const Lead = require('../models/Lead');
const logger = require('../utils/logger');
const { getExtractionPrompt } = require('./prompts/crmExtraction.prompt');
const { ALLOWED_CRM_STATUSES, ALLOWED_DATA_SOURCES } = require('../utils/constants');

const BATCH_SIZE = parseInt(process.env.BATCH_SIZE, 10) || 25;
const MAX_RETRIES = 3;

/**
 * Utility helper to sleep/pause execution.
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Clean and validate Gemini extracted fields before database insertion.
 */
const cleanRecord = (record) => {
  const cleaned = {};
  
  // Date parsing logic
  if (record.created_at) {
    const dateVal = new Date(record.created_at);
    cleaned.created_at = !isNaN(dateVal.getTime()) ? dateVal : new Date();
  } else {
    cleaned.created_at = new Date();
  }

  // Text mappings with trimming
  cleaned.name = record.name ? String(record.name).trim() : null;
  cleaned.email = record.email ? String(record.email).toLowerCase().trim() : null;
  cleaned.country_code = record.country_code ? String(record.country_code).trim() : null;
  cleaned.mobile_without_country_code = record.mobile_without_country_code 
    ? String(record.mobile_without_country_code).replace(/\s/g, '') 
    : null;
  cleaned.company = record.company ? String(record.company).trim() : null;
  cleaned.city = record.city ? String(record.city).trim() : null;
  cleaned.state = record.state ? String(record.state).trim() : null;
  cleaned.country = record.country ? String(record.country).trim() : null;
  cleaned.lead_owner = record.lead_owner ? String(record.lead_owner).trim() : null;
  cleaned.crm_note = record.crm_note ? String(record.crm_note).trim() : null;
  cleaned.possession_time = record.possession_time ? String(record.possession_time).trim() : null;
  cleaned.description = record.description ? String(record.description).trim() : null;

  // Strict Enum validations
  if (record.crm_status && ALLOWED_CRM_STATUSES.includes(record.crm_status.trim())) {
    cleaned.crm_status = record.crm_status.trim();
  } else {
    cleaned.crm_status = null;
  }

  if (record.data_source && ALLOWED_DATA_SOURCES.includes(record.data_source.trim())) {
    cleaned.data_source = record.data_source.trim();
  } else {
    cleaned.data_source = null;
  }

  return cleaned;
};

/**
 * Execute Gemini model call with standard retry limits and backoff delay.
 */
const callGeminiWithRetry = async (prompt, retries = MAX_RETRIES, delay = 2000) => {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const text = response.text || '';
      if (!text.trim()) {
        throw new Error('Gemini returned an empty response.');
      }

      // Strip markdown block fences if returned
      let cleanText = text.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.substring(7);
      }
      if (cleanText.endsWith('```')) {
        cleanText = cleanText.substring(0, cleanText.length - 3);
      }
      cleanText = cleanText.trim();

      const parsed = JSON.parse(cleanText);
      if (!Array.isArray(parsed)) {
        throw new Error('Gemini response is not a valid JSON Array.');
      }

      return parsed;
    } catch (error) {
      lastError = error;
      logger.warn(`Gemini AI extraction attempt ${attempt} failed: ${error.message}`);
      if (attempt < retries) {
        // Backoff delay before retry
        await sleep(delay * attempt);
      }
    }
  }

  throw lastError;
};

/**
 * Slices CSV records into configurable batches, invokes Gemini,
 * cleans structured rows, and saves the successfully extracted leads to MongoDB.
 * @param {Array} records 
 * @returns {Promise<Object>}
 */
const importCSVLeads = async (records) => {
  const allExtractedRecords = [];
  let successfullyParsed = 0;
  let failed = 0;

  logger.info(`Starting Gemini import flow for ${records.length} records...`);

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const batchIndex = Math.floor(i / BATCH_SIZE) + 1;
    
    logger.info(`Processing batch ${batchIndex}...`);

    try {
      const prompt = getExtractionPrompt(JSON.stringify(batch));
      const extractedBatch = await callGeminiWithRetry(prompt);

      // Map, clean, and queue each extracted row
      const cleanedBatch = extractedBatch.map(cleanRecord);
      allExtractedRecords.push(...cleanedBatch);
      successfullyParsed += batch.length;
      
      logger.info(`Batch ${batchIndex} successfully processed.`);
    } catch (error) {
      logger.error(`Batch ${batchIndex} failed after ${MAX_RETRIES} attempts: ${error.message}`);
      failed += batch.length;
    }
  }

  // Insert structured records into MongoDB Database
  let savedLeads = [];
  if (allExtractedRecords.length > 0) {
    logger.info(`Saving ${allExtractedRecords.length} records to MongoDB...`);
    savedLeads = await Lead.insertMany(allExtractedRecords);
  }

  return {
    records: savedLeads,
    successfullyParsed,
    failed
  };
};

module.exports = {
  importCSVLeads
};
