const fs = require('fs');
const csv = require('csv-parser');
const logger = require('../utils/logger');

/**
 * Heuristically checks if a parsed row is completely empty.
 * @param {Object} row 
 * @returns {Boolean}
 */
const isEmptyRow = (row) => {
  return Object.values(row).every(val => String(val || '').trim() === '');
};

/**
 * Heuristically checks if a parsed row contains at least one email or mobile number.
 * No column names are assumed. We inspect both values and keys.
 * @param {Object} row 
 * @returns {Boolean}
 */
const hasEmailOrPhone = (row) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[\d\s\-()]{7,15}$/;

  const keys = Object.keys(row).map(k => k.toLowerCase());
  const values = Object.values(row).map(v => String(v || '').trim());

  let hasEmail = false;
  let hasPhone = false;

  // Heuristic 1: Check if any value format matches email or phone pattern
  for (const val of values) {
    if (emailRegex.test(val)) {
      hasEmail = true;
    }
    const digits = val.replace(/\D/g, '');
    if (phoneRegex.test(val) && digits.length >= 7 && digits.length <= 15) {
      hasPhone = true;
    }
  }

  if (hasEmail || hasPhone) {
    return true;
  }

  // Heuristic 2: Check if column headers suggest email or phone and value is not empty
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const val = values[i];
    if (val === '') continue;

    if (key.includes('email') || key.includes('mail')) {
      hasEmail = true;
    }
    if (key.includes('phone') || key.includes('mobile') || key.includes('contact') || key.includes('number')) {
      const digits = val.replace(/\D/g, '');
      if (digits.length >= 7) {
        hasPhone = true;
      }
    }
  }

  return hasEmail || hasPhone;
};

/**
 * Parses the CSV file in a memory-safe stream.
 * Returns headers, preview rows, total count, and skip count.
 * Deletes the temp file automatically after parsing completes.
 * @param {String} filePath 
 * @param {Number} limit 
 * @returns {Promise<Object>}
 */
const parseCSV = (filePath, limit = 100) => {
  return new Promise((resolve, reject) => {
    const previewRows = [];
    let headers = [];
    let totalRecords = 0;
    let skippedRecords = 0;

    const stream = fs.createReadStream(filePath);
    const parser = csv();

    stream.on('error', (err) => {
      logger.error('File read stream error:', err);
      // Clean up file if it exists
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, () => {});
      }
      reject(new Error('Failed to read uploaded CSV file.'));
    });

    parser.on('headers', (hdrList) => {
      headers = hdrList;
    });

    parser.on('data', (row) => {
      // 1. Skip completely empty rows
      if (isEmptyRow(row)) {
        return;
      }

      // 2. Skip records with neither email nor mobile/phone number
      if (!hasEmailOrPhone(row)) {
        skippedRecords++;
        return;
      }

      totalRecords++;

      // 3. Collect preview items up to the limit
      if (previewRows.length < limit) {
        previewRows.push(row);
      }
    });

    parser.on('end', () => {
      // Remove local file
      fs.unlink(filePath, (err) => {
        if (err) {
          logger.error(`Error deleting temp file ${filePath}:`, err.message);
        }
      });

      resolve({
        headers,
        previewRows,
        totalRecords,
        skippedRecords,
        previewCount: previewRows.length
      });
    });

    parser.on('error', (err) => {
      logger.error('CSV parse stream error:', err);
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, () => {});
      }
      reject(new Error('Failed to parse CSV format. Ensure it is a valid CSV file.'));
    });

    stream.pipe(parser);
  });
};

module.exports = {
  parseCSV
};
