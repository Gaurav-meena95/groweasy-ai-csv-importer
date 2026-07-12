'use client';

import React, { useState } from 'react';
import UploadCard from '../components/upload/UploadCard';
import SummaryCards from '../components/preview/SummaryCards';
import PreviewTable from '../components/preview/PreviewTable';
import ImportProgress from '../components/preview/ImportProgress';
import StatsSection from '../components/preview/StatsSection';
import ResultTable from '../components/preview/ResultTable';
import SkippedSection from '../components/preview/SkippedSection';
import { toast } from 'sonner';
import { importCSV } from '../services/api';
import { ArrowLeft, CheckCircle2, RefreshCw, RotateCcw, Download, Code } from 'lucide-react';

const CRM_FIELDS = [
  { key: 'created_at', label: 'Created At' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'country_code', label: 'Code' },
  { key: 'mobile_without_country_code', label: 'Mobile' },
  { key: 'company', label: 'Company' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'country', label: 'Country' },
  { key: 'lead_owner', label: 'Lead Owner' },
  { key: 'crm_status', label: 'Status' },
  { key: 'crm_note', label: 'Notes' },
  { key: 'data_source', label: 'Source' },
  { key: 'possession_time', label: 'Possession' },
  { key: 'description', label: 'Description' }
];

export default function HomePage() {
  const [previewData, setPreviewData] = useState(null);
  const [fileObject, setFileObject] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // Triggered when /upload succeeds
  const handleUploadSuccess = (data, file) => {
    setPreviewData(data);
    setFileObject(file);
    setImportResult(null);
  };

  // Reset page state to return to upload screen
  const handleCancelPreview = () => {
    setPreviewData(null);
    setFileObject(null);
    setImportResult(null);
  };

  // Reset workflow entirely (Import Again / Start Over)
  const handleResetWorkflow = () => {
    setPreviewData(null);
    setFileObject(null);
    setImportResult(null);
  };

  // Triggered when clicking "Confirm Import"
  const handleConfirmImport = async () => {
    if (!fileObject) {
      toast.error('No file ready for import. Upload again.');
      return;
    }

    setImporting(true);
    const loadingToastId = toast.loading('Connecting to AI agent & processing CRM import...');

    try {
      const response = await importCSV(fileObject);
      
      if (response.success) {
        toast.dismiss(loadingToastId);
        
        const stats = response.data?.stats || {};
        const successCount = stats.successfullyParsed || 0;
        const failedCount = stats.failed || 0;
        const skippedCount = stats.skipped || 0;

        toast.success(
          `Import Complete! ${successCount} leads processed. (${failedCount} failed, ${skippedCount} skipped)`
        );

        // Save result to display the extraction dashboard
        setImportResult(response.data);
      } else {
        throw new Error(response.message || 'Import failed.');
      }
    } catch (error) {
      toast.dismiss(loadingToastId);
      const errorMsg = error.response?.data?.message || error.message || 'Error processing AI import.';
      toast.error(errorMsg);
      console.error('[Import Error]:', error);
    } finally {
      setImporting(false);
    }
  };

  // Download parsed leads as structured JSON
  const handleDownloadJSON = () => {
    if (!importResult?.records) return;
    const jsonStr = JSON.stringify(importResult.records, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm_leads_extracted_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('JSON file downloaded.');
  };

  // Download parsed leads as structured CSV
  const handleDownloadCSV = () => {
    if (!importResult?.records) return;
    
    const headers = CRM_FIELDS.map((f) => f.label);
    const keys = CRM_FIELDS.map((f) => f.key);
    
    let csvContent = headers.join(',') + '\n';
    
    importResult.records.forEach((row) => {
      const line = keys.map((k) => {
        let val = row[k] === null || row[k] === undefined ? '' : String(row[k]);
        // Escape double quotes
        val = val.replace(/"/g, '""');
        return `"${val}"`;
      });
      csvContent += line.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm_leads_extracted_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('CSV file downloaded.');
  };

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 flex-1 flex flex-col gap-8">
      
      {/* Title Header Section */}
      <div className="flex flex-col gap-1 text-center sm:text-left">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Lead Data Importer</h1>
        <p className="text-slate-500 text-sm max-w-2xl">
          Clean upload dashboard designed to preview and parse raw CSV leads, converting arbitrary fields into a standard CRM schema.
        </p>
      </div>

      {importing ? (
        /* 1. Progress Loader View */
        <div className="flex-1 flex flex-col items-center justify-center py-12">
          <ImportProgress active={importing} />
        </div>
      ) : importResult ? (
        /* 2. Results Dashboard View */
        <div className="flex-1 flex flex-col gap-8 animate-in fade-in duration-300">
          {/* Action bar */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 flex-wrap gap-4">
            <button
              onClick={handleResetWorkflow}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Start New Import
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadJSON}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Code className="h-3.5 w-3.5" />
                Export JSON
              </button>
              <button
                onClick={handleDownloadCSV}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Stats summary section */}
          <StatsSection stats={importResult.stats} />

          {/* Mapped results grid table */}
          <ResultTable records={importResult.records} />

          {/* Skipped records list section */}
          <SkippedSection skipped={importResult.skipped} />
        </div>
      ) : !previewData ? (
        /* 3. Empty State / Upload Mode */
        <div className="flex-1 flex flex-col items-center justify-center py-12">
          <UploadCard onUploadSuccess={handleUploadSuccess} />
        </div>
      ) : (
        /* 4. Preview & Action Mode */
        <div className="flex-1 flex flex-col gap-8 animate-in fade-in duration-300">
          
          {/* Controls Bar */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 flex-wrap gap-4">
            <button
              onClick={handleCancelPreview}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Upload different file
            </button>

            <button
              onClick={handleConfirmImport}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors cursor-pointer animate-pulse"
            >
              <CheckCircle2 className="h-4 w-4" />
              Confirm Import
            </button>
          </div>

          {/* Metrics Summary Blocks */}
          <SummaryCards 
            totalRecords={previewData.totalRecords}
            skippedRecords={previewData.skippedRecords}
            headersCount={previewData.headers.length}
          />

          {/* Grid Preview Table */}
          <PreviewTable 
            headers={previewData.headers}
            previewRows={previewData.previewRows}
            previewCount={previewData.previewCount}
            totalRecords={previewData.totalRecords}
          />
        </div>
      )}
    </div>
  );
}
