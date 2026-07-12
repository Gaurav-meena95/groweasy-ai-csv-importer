'use client';

import React, { useState } from 'react';
import UploadCard from '../components/upload/UploadCard';
import SummaryCards from '../components/preview/SummaryCards';
import PreviewTable from '../components/preview/PreviewTable';
import { toast } from 'sonner';
import { importCSV } from '../services/api';
import { ArrowLeft, CheckCircle2, RefreshCw } from 'lucide-react';

export default function HomePage() {
  const [previewData, setPreviewData] = useState(null);
  const [fileObject, setFileObject] = useState(null);
  const [importing, setImporting] = useState(false);

  // Triggered when /upload succeeds
  const handleUploadSuccess = (data, file) => {
    setPreviewData(data);
    setFileObject(file);
  };

  // Reset page state to return to upload screen
  const handleCancelPreview = () => {
    setPreviewData(null);
    setFileObject(null);
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
        
        // Detailed success report toast
        const stats = response.data?.stats || {};
        const successCount = stats.successfullyParsed || 0;
        const failedCount = stats.failed || 0;
        const skippedCount = stats.skipped || 0;

        toast.success(
          `Import Complete! ${successCount} leads processed. (${failedCount} failed, ${skippedCount} skipped)`
        );

        // Reset page back to upload screen
        setPreviewData(null);
        setFileObject(null);
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

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 flex-1 flex flex-col gap-8">
      
      {/* Title Header Section */}
      <div className="flex flex-col gap-1 text-center sm:text-left">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Lead Data Importer</h1>
        <p className="text-slate-500 text-sm max-w-2xl">
          Clean upload dashboard designed to preview and parse raw CSV leads, converting arbitrary fields into a standard CRM schema.
        </p>
      </div>

      {!previewData ? (
        /* Empty State / Upload Mode */
        <div className="flex-1 flex flex-col items-center justify-center py-12">
          <UploadCard onUploadSuccess={handleUploadSuccess} />
        </div>
      ) : (
        /* Preview & Action Mode */
        <div className="flex-1 flex flex-col gap-8 animate-in fade-in duration-300">
          
          {/* Controls Bar */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 flex-wrap gap-4">
            <button
              onClick={handleCancelPreview}
              disabled={importing}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Upload different file
            </button>

            <button
              onClick={handleConfirmImport}
              disabled={importing}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-450 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              {importing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Importing to CRM...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Confirm Import
                </>
              )}
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
