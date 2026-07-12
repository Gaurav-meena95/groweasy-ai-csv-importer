import axios from 'axios';

let baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api';

// Auto-append '/api' suffix if missing in environment variables
if (baseApiUrl && !baseApiUrl.endsWith('/api') && !baseApiUrl.endsWith('/api/')) {
  baseApiUrl = baseApiUrl.replace(/\/$/, '') + '/api';
}

const API_BASE_URL = baseApiUrl;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Upload CSV file for preview
 * @param {File} file 
 * @returns {Promise<Object>}
 */
export const uploadCSV = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post('/csv/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};

/**
 * Confirm import and process through AI (Phase 3 placeholder / future hook)
 * @param {File} file 
 * @returns {Promise<Object>}
 */
export const importCSV = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post('/csv/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};

export default apiClient;
