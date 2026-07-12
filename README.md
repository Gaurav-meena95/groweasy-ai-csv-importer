# GrowEasy AI-powered CSV Importer (Full Stack)

A production-ready full-stack application that handles CSV file uploads, parses raw records in a memory-safe stream process, previews metrics, and uses Google Gemini 2.5 Flash to intelligently extract and map standard CRM lead fields into MongoDB.

---

## Workspace Structure

```text
AI-CSV-Importer/
│
├── server/                   # Backend Express.js Server
│   ├── config/               # Database & AI SDK configs
│   ├── controllers/          # HTTP request handlers
│   ├── middleware/           # Upload file validations & error boundaries
│   ├── models/               # MongoDB Lead Schemas
│   ├── routes/               # API route definitions
│   ├── services/             # Stream parsing & Gemini batch mapping logic
│   └── utils/                # Standard loggers, response, and constant utilities
│
└── frontend/                 # Frontend Next.js Dashboard Client
    ├── src/
    │   ├── app/              # Page layouts & home dashboards
    │   ├── components/       # Layouts, upload zones, & table preview components
    │   └── services/         # Axios API connection layers
    └── public/               # Static assets & icons
```

---

## Installation & Setup

### Prerequisites
*   **Node.js**: v18.x or higher
*   **MongoDB**: Local instance running on port `27017` or a MongoDB Atlas URI

### 1. Root Workspace Orchestration
Install `concurrently` at the root workspace:
```bash
npm install
```

### 2. Backend Config (server/)
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in `server/`:
   ```env
   PORT=5005
   MONGO_URI=mongodb://127.0.0.1:27017/groweasy-csv-importer
   GEMINI_API_KEY=your_gemini_api_key_here
   NODE_ENV=development
   BATCH_SIZE=25
   ```

### 3. Frontend Config (frontend/)
1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in `frontend/`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5005/api
   ```

---

## Run Commands

Run both backend and frontend concurrently in development mode from the workspace root:
```bash
npm run dev
```
*   **Frontend Client:** Runs at `http://localhost:3000`
*   **Backend Server:** Runs at `http://localhost:5005`

Build production bundles:
```bash
npm run build
```

---

## API Documentation

### 1. Health Status
*   **Endpoint:** `GET /api/health`
*   **Description:** Verifies server execution and MongoDB connectivity.
*   **Status Codes:** `200 OK`

---

### 2. CSV Upload & Preview (Phase 2)
*   **Endpoint:** `POST /api/csv/upload`
*   **Description:** Accepts a CSV upload, parses rows, filters records without contact data, and returns headers + preview of first 100 rows.
*   **Request (form-data):** `file` (CSV file upload).
*   **Status Codes:** `200 OK` (success preview), `400 Bad Request` (invalid extensions/size).

---

### 3. CSV Import & AI Processing (Phase 3)
*   **Endpoint:** `POST /api/csv/import`
*   **Description:** Uploads, parses all rows, slices them into batches of 25, invokes Gemini for CRM mappings, saves results to MongoDB, and returns summary stats.
*   **Request (form-data):** `file` (CSV file upload).
*   **Status Codes:** `200 OK` (import summary stats), `400 Bad Request` (empty file).
