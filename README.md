# GrowEasy AI CSV Importer

An intelligent, production-ready full-stack application designed to import, parse, preview, and extract CRM lead records from any valid CSV format dynamically using Google Gemini 2.5 Flash AI mappings and MongoDB.

---

## Features
*   **Dynamic Column Mapping:** Intelligently maps column names and layouts from any CSV format to standard CRM lead properties using Gemini.
*   **Memory-Safe Stream Parsing:** Processes large CSV files efficiently via Streams and `csv-parser` to avoid event-loop blocking.
*   **Heuristic Pre-Validation:** Skips completely empty rows and automatically filters records lacking both an email and a mobile number to optimize API token costs.
*   **Batching & Fault Tolerance:** Slices records into configurable batches (default 25) with a 3x retry mechanism and exponential backoff to handle rate limits and request failures.
*   **Interactive Preview Panel:** Displays a rich preview of headers and parsed rows using TanStack Table (with zebra-striping and sticky headers) before calling the AI.
*   **Clean Session Persistence:** Preserves active upload previews and processed dashboards inside browser `localStorage` across page refreshes, and deletes temporary files from the server immediately after parsing.
*   **Export Formats:** Allows users to download finalized mapped CRM leads directly as JSON or CSV files from the dashboard.

---

## Tech Stack
*   **Frontend:** Next.js (App Router, Turbopack compiler, JavaScript), Tailwind CSS, Axios, PapaParse, React Dropzone, TanStack Table, Lucide Icons, Sonner notifications.
*   **Backend:** Node.js, Express.js, MongoDB, Mongoose ODM, Google Gen AI SDK (`@google/genai`), Multer, csv-parser, Helmet (security headers), CORS, Morgan logger, Express Rate Limit, Zod validation.

---

## Project Structure

```text
AI-CSV-Importer/
├── server/                   # Backend API Server (Node + Express)
│   ├── config/               # DB connection & Gemini SDK client initialization
│   ├── controllers/          # API route controller handlers
│   ├── middleware/           # File upload controls, validators, & error boundaries
│   ├── models/               # MongoDB Lead schemas
│   ├── routes/               # Express routing tables
│   ├── services/             # CSV stream parsing & Gemini batch mapping logic
│   │   └── prompts/          # AI prompt template directives
│   └── utils/                # Loggers, constants, and JSON response wrappers
│
└── frontend/                 # Frontend Next.js Client
    ├── src/
    │   ├── app/              # UI layouts & main dashboard page views
    │   ├── components/       # Layouts, upload cards, & preview tables
    │   └── services/         # Axios API backend client
    └── public/               # Global assets & icons
```

---

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Gaurav-meena95/groweasy-ai-csv-importer.git
cd groweasy-ai-csv-importer
```

### 2. Root Workspace Installation
Install root-level developer tools for service orchestration:
```bash
npm install
```

### 3. Backend Setup
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install Node packages:
   ```bash
   npm install
   ```

### 4. Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install Next.js dependencies:
   ```bash
   npm install
   ```

---

## Environment Variables

### Backend Configuration (`server/.env`)
Create a `.env` file inside `server/` with the following variables:
```env
PORT=5005
MONGO_URI=mongodb://127.0.0.1:27017/groweasy-csv-importer
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
BATCH_SIZE=25
```

### Frontend Configuration (`frontend/.env.local`)
Create a `.env.local` file inside `frontend/` to point to the backend server:
```env
NEXT_PUBLIC_API_URL=http://localhost:5005/api
```

---

## Running Locally

Run both the frontend and backend servers concurrently from the root directory:
```bash
npm run dev
```

*   **Frontend Dashboard:** accessible at [http://localhost:3000](http://localhost:3000)
*   **Backend Server API:** accessible at [http://localhost:5005](http://localhost:5005)

---

## API Endpoints

### 1. Server Health
*   **Endpoint:** `GET /api/health`
*   **Description:** Returns server availability and MongoDB connection status.
*   **Response:**
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

### 2. CSV Upload & Preview
*   **Endpoint:** `POST /api/csv/upload`
*   **Description:** Parses uploaded CSV, filters invalid rows, and returns headers + first 100 preview rows.
*   **Request (Multipart form-data):** `file` (CSV file).
*   **Response:**
    ```json
    {
      "success": true,
      "message": "CSV file parsed successfully.",
      "data": {
        "headers": ["created_at", "name", "email", "phone"],
        "previewRows": [{ "name": "John Doe", "email": "john@example.com" }],
        "totalRecords": 100,
        "skippedRecords": 5,
        "previewCount": 1
      }
    }
    ```

### 3. CRM Lead Import
*   **Endpoint:** `POST /api/csv/import`
*   **Description:** Slices CSV rows into batches, maps attributes using Gemini, saves leads to MongoDB, and returns import statistics.
*   **Request (Multipart form-data):** `file` (CSV file).

---

## AI Flow
1. **Raw Records Stream:** The server reads rows using `csv-parser` streams and filters out rows without emails/phones.
2. **Batch Slicing:** Valid rows are grouped into arrays of `25` records.
3. **Gemini Extraction Prompt:** The system constructs structured prompt instructions, detailing CRM enum bounds (e.g. `GOOD_LEAD_FOLLOW_UP`), multiple contact rules, date rules, and asks Gemini to return a clean JSON array mapping the raw headers to key properties.
4. **Resiliency:** If a rate limit or network issue occurs during generation, the call is retried up to 3 times with exponential backoff before marking that batch as failed and proceeding.
5. **MongoDB Insertion:** Validated output is cleaned and stored in MongoDB using `Lead.insertMany()`.

---

## Screenshots
*   **CSV Upload Dashboard:**
    ![Upload Zone](https://raw.githubusercontent.com/Gaurav-meena95/groweasy-ai-csv-importer/main/server/uploads/screenshot_upload.png)
*   **Data Preview & Statistics Panel:**
    ![Data Preview](https://raw.githubusercontent.com/Gaurav-meena95/groweasy-ai-csv-importer/main/server/uploads/screenshot_preview.png)
*   **CRM AI Processing Results:**
    ![Results Grid](https://raw.githubusercontent.com/Gaurav-meena95/groweasy-ai-csv-importer/main/server/uploads/screenshot_results.png)

---

## Live Demo
*   **Frontend Dashboard:** [https://groweasy-ai-csv-importer-sepia.vercel.app](https://groweasy-ai-csv-importer-sepia.vercel.app)
*   **Backend API Service:** [https://groweasy-ai-csv-importer-4060.onrender.com](https://groweasy-ai-csv-importer-4060.onrender.com)

---

## GitHub Repository
[https://github.com/Gaurav-meena95/groweasy-ai-csv-importer](https://github.com/Gaurav-meena95/groweasy-ai-csv-importer)
