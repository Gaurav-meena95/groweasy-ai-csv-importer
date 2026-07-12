# GrowEasy AI-powered CSV Importer (Backend)

A production-ready Node.js and Express.js backend that handles CSV file uploads, parses raw records in a memory-safe streamed process, performs batch processing, and uses Google Gemini 2.5 Flash to intelligently extract and map standard CRM lead fields into MongoDB.

---

## Folder Structure

```text
server/
├── config/
│   ├── db.js                 # MongoDB connection config
│   └── gemini.js             # Gemini SDK initialization client
├── controllers/
│   └── csv.controller.js     # Coordinates HTTP requests & processing time stats
├── middleware/
│   ├── error.middleware.js   # Centralized error boundary
│   └── upload.middleware.js  # Multer wrapper with CSV and file size limits
├── models/
│   └── Lead.js               # Mongoose Schema for CRM Lead records
├── routes/
│   ├── index.js              # Route mounting & health check handler
│   └── csv.routes.js         # CSV upload & import route definitions
├── services/
│   ├── csv.service.js        # CSV streamed parser & validation heuristics
│   ├── gemini.service.js     # Batch processing, retry backoffs, & DB ingestion
│   └── prompts/
│       └── crmExtraction.prompt.js # Gemini prompts & CRM field rules
├── utils/
│   ├── constants.js          # App constants (allowed statuses, data sources)
│   ├── logger.js             # Formatted timestamp logger
│   └── response.js           # Consistent JSON response envelopes
├── uploads/                  # Temporary file upload folder
├── index.js                  # Application entry point & security middle-stack
├── .env                      # Local configuration file (gitignored)
└── .env.example              # Template for environment variables
```

---

## Installation & Setup

### Prerequisites
*   **Node.js**: v18.x or higher
*   **MongoDB**: Local instance running on port `27017` or a MongoDB Atlas URI

### Installation
1. Navigate to the backend directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables
Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/groweasy-csv-importer
GEMINI_API_KEY=your_real_gemini_api_key_here
NODE_ENV=development
BATCH_SIZE=25
```

---

## Run Commands

### Development Mode
Runs the backend with auto-reload via `nodemon`:
```bash
npm run dev
```

### Production Mode
Runs the backend in production mode:
```bash
npm start
```

---

## API Documentation

### 1. Health Check
*   **Endpoint:** `GET /api/health`
*   **Description:** Verifies that the server and database are running and connected.
*   **Headers:** `Content-Type: application/json`
*   **Success Response (Status: 200):**
    ```json
    {
      "success": true,
      "message": "Server health check passed.",
      "data": {
        "status": "server running",
        "database": "connected",
        "timestamp": "2026-07-12T01:21:24.961Z"
      }
    }
    ```

---

### 2. CSV Upload & Preview (Phase 2)
*   **Endpoint:** `POST /api/csv/upload`
*   **Description:** Uploads a CSV file, parses the records heuristically, skips completely empty rows, filters out invalid rows (records without *both* email and mobile), and returns a JSON preview of headers and the first 100 rows. No AI processing is executed.
*   **Headers:** `Content-Type: multipart/form-data`
*   **Request Body (form-data):**
    *   `file`: The CSV file upload.
*   **Success Response (Status: 200):**
    ```json
    {
      "success": true,
      "message": "CSV file parsed successfully.",
      "data": {
        "headers": ["created_at", "name", "email", "mobile_without_country_code"],
        "previewRows": [
          {
            "created_at": "2026-05-13 14:20:48",
            "name": "John Doe",
            "email": "john.doe@example.com",
            "mobile_without_country_code": "9876543210"
          }
        ],
        "totalRecords": 15,
        "skippedRecords": 2,
        "previewCount": 1
      }
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request` (e.g., No file uploaded, file size exceeds 10MB, or invalid file extension).
    *   `500 Internal Server Error` (e.g., General parsing failures).

---

### 3. CSV Import & AI Processing (Phase 3)
*   **Endpoint:** `POST /api/csv/import`
*   **Description:** Uploads the CSV file, streams all rows, slices valid rows into configurable batches, retries failed batches up to 3 times, uses Gemini 2.5 Flash to map headers dynamically to CRM properties, and saves successfully mapped leads to MongoDB. Returns statistics and processed/skipped details.
*   **Headers:** `Content-Type: multipart/form-data`
*   **Request Body (form-data):**
    *   `file`: The CSV file upload.
*   **Success Response (Status: 200):**
    ```json
    {
      "success": true,
      "message": "CSV data imported and AI processed successfully.",
      "data": {
        "stats": {
          "totalUploaded": 17,
          "successfullyParsed": 15,
          "skipped": 2,
          "failed": 0,
          "processingTimeMs": 4820
        },
        "records": [
          {
            "_id": "648a123abc456def78901234",
            "created_at": "2026-05-13T14:20:48.000Z",
            "name": "John Doe",
            "email": "john.doe@example.com",
            "mobile_without_country_code": "9876543210",
            "crm_status": "GOOD_LEAD_FOLLOW_UP",
            "data_source": "leads_on_demand",
            "createdAt": "2026-07-12T01:34:00.000Z",
            "updatedAt": "2026-07-12T01:34:00.000Z"
          }
        ],
        "skipped": [
          {
            "created_at": "2026-05-13 14:20:48",
            "name": "Invalid Record"
          }
        ]
      }
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request` (Empty or corrupt CSV files).
    *   `500 Internal Server Error` (Critical service execution faults).
