'use client';

import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { uploadCSV, importCSV } from '../services/api';
import ImportProgress from '../components/preview/ImportProgress';
import StatsSection from '../components/preview/StatsSection';
import ResultTable from '../components/preview/ResultTable';
import SkippedSection from '../components/preview/SkippedSection';
import { 
  FolderDown, FileSpreadsheet, X, LayoutDashboard, UserCheck, 
  Settings, Users, Layers, Share2, HelpCircle, LogOut, CheckCircle2, 
  RotateCcw, Download, Code, Sparkles, UploadCloud, AlertTriangle, Play, RefreshCw
} from 'lucide-react';

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

const REQUIRED_HEADERS_TEXT = "created_at, name, email, country_code, mobile_without_country_code, company, city, state, country, lead_owner, crm_status, crm_note";

export default function HomePage() {
  // Navigation states
  const [activeTab, setActiveTab] = useState('sources'); // 'sources' or 'leads'
  
  // Importer states
  const [modalOpen, setModalOpen] = useState(true);
  const [fileObject, setFileObject] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedPreview = localStorage.getItem('groweasy_preview_data');
      const savedResult = localStorage.getItem('groweasy_import_result');
      
      if (savedPreview) {
        setPreviewData(JSON.parse(savedPreview));
        setModalOpen(true);
      }
      if (savedResult) {
        setImportResult(JSON.parse(savedResult));
        setActiveTab('leads');
        setModalOpen(false);
      }
    } catch (error) {
      console.error('[Session Storage Load Failed]:', error);
    }
    setIsLoaded(true);
  }, []);

  // Dropzone file selection configuration
  const onDrop = (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles && rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      if (error.code === 'file-invalid-type') {
        toast.error('Only CSV files (.csv) are allowed.');
      } else if (error.code === 'file-too-large') {
        toast.error('File size exceeds the 10MB limit.');
      } else {
        toast.error(error.message || 'Error selecting file.');
      }
      return;
    }

    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setFileObject(file);
      handleUploadSubmit(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false
  });

  // Handle preview generation /upload
  const handleUploadSubmit = async (file) => {
    const loadingToastId = toast.loading('Reading & validating CSV structure...');
    try {
      const response = await uploadCSV(file);
      if (response.success) {
        toast.dismiss(loadingToastId);
        setPreviewData(response.data);
        localStorage.setItem('groweasy_preview_data', JSON.stringify(response.data));
      } else {
        throw new Error(response.message || 'Upload failed.');
      }
    } catch (error) {
      toast.dismiss(loadingToastId);
      setFileObject(null);
      const msg = error.response?.data?.message || error.message || 'Error uploading file.';
      toast.error(msg);
    }
  };

  // Clear loaded file state
  const handleClearFile = (e) => {
    e.stopPropagation();
    setFileObject(null);
    setPreviewData(null);
    localStorage.removeItem('groweasy_preview_data');
  };

  // Run AI Import Flow
  const handleConfirmImport = async () => {
    if (!fileObject) {
      toast.error('Session expired. Please drop your CSV file again.');
      return;
    }

    setImporting(true);
    try {
      const response = await importCSV(fileObject);
      if (response.success) {
        setImportResult(response.data);
        localStorage.setItem('groweasy_import_result', JSON.stringify(response.data));
        localStorage.removeItem('groweasy_preview_data');
        setPreviewData(null);
        setFileObject(null);
        setModalOpen(false);
        setActiveTab('leads');
        toast.success('Leads successfully imported and mapped!');
      } else {
        throw new Error(response.message || 'Import failed.');
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Error processing AI import.';
      toast.error(msg);
      console.error(error);
    } finally {
      setImporting(false);
    }
  };

  const handleResetWorkflow = () => {
    setImportResult(null);
    setPreviewData(null);
    setFileObject(null);
    localStorage.removeItem('groweasy_preview_data');
    localStorage.removeItem('groweasy_import_result');
    setActiveTab('sources');
    setModalOpen(true);
  };

  // Download Sample Template file
  const handleDownloadTemplate = () => {
    const headers = [
      'created_at', 'name', 'email', 'country_code', 'mobile_without_country_code',
      'company', 'city', 'state', 'country', 'lead_owner', 'crm_status', 'crm_note',
      'data_source', 'possession_time', 'description'
    ];
    const sampleRow = "2026-05-13 14:20:48,John Doe,john.doe@example.com,+91,9876543210,GrowEasy,Mumbai,Maharashtra,India,test@gmail.com,GOOD_LEAD_FOLLOW_UP,Remarks";
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + sampleRow;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "crm_leads_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Sample CSV template downloaded.');
  };

  // JSON Downloader
  const handleDownloadJSON = () => {
    if (!importResult?.records) return;
    const jsonStr = JSON.stringify(importResult.records, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm_leads_extracted.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('JSON file exported.');
  };

  // CSV Downloader
  const handleDownloadCSV = () => {
    if (!importResult?.records) return;
    const headers = CRM_FIELDS.map((f) => f.label);
    const keys = CRM_FIELDS.map((f) => f.key);
    let csvContent = headers.join(',') + '\n';
    
    importResult.records.forEach((row) => {
      const line = keys.map((k) => {
        let val = row[k] === null || row[k] === undefined ? '' : String(row[k]);
        val = val.replace(/"/g, '""');
        return `"${val}"`;
      });
      csvContent += line.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm_leads_extracted.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('CSV file exported.');
  };

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-500 text-sm gap-2">
        <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
        Synchronizing state...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* 1. Sidebar Left Navigation Layout */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between flex-shrink-0">
        <div>
          {/* Header Identity */}
          <div className="h-16 px-6 border-b border-slate-100 flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              GE
            </div>
            <span className="font-bold text-slate-800 text-lg tracking-tight">GrowEasy</span>
          </div>

          {/* Profile Card */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center font-semibold text-slate-700 text-sm">
              VK
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">VK Test</p>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Owner</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 flex flex-col gap-1 text-slate-600 text-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Main</p>
            
            <button 
              onClick={() => { setActiveTab('sources'); setModalOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-left w-full transition-colors ${
                activeTab === 'sources' && !modalOpen ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="h-4.5 w-4.5" />
              Dashboard
            </button>
            <button 
              onClick={() => { setActiveTab('leads'); setModalOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-left w-full transition-colors ${
                activeTab === 'leads' ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50'
              }`}
            >
              <Users className="h-4.5 w-4.5" />
              Manage Leads
            </button>
            <button 
              onClick={() => { setActiveTab('sources'); setModalOpen(true); }}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-left w-full transition-colors ${
                modalOpen ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50'
              }`}
            >
              <Layers className="h-4.5 w-4.5" />
              Lead Sources
            </button>
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-100 flex flex-col gap-1 text-xs text-slate-500">
          <div className="flex items-center gap-2 px-3 py-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:text-slate-800">
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </div>
        </div>
      </aside>

      {/* 2. Main Dashboard Content Layout */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header toolbar */}
        <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Control Center</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-semibold uppercase tracking-wider text-xs">
              {activeTab === 'sources' ? 'Lead Channels' : 'CRM Leads Ingestion'}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
              Vercel Connected
            </span>
          </div>
        </header>

        {/* Inner Scroll Container */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8">
          
          {activeTab === 'sources' ? (
            /* 2A. MOCK DASHBOARD BACKGROUND VIEW (Lead Channels Dashboard) */
            <div className="flex flex-col gap-8 animate-in fade-in duration-300">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Lead Sources</h2>
                <p className="text-slate-500 text-sm mt-1">Connect, manage, and control all your lead acquisition channels from one dashboard.</p>
              </div>

              {/* Source cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="border border-slate-200 bg-white rounded-xl p-5 shadow-sm flex flex-col justify-between h-40">
                  <div>
                    <h3 className="font-semibold text-slate-800">Google Ads</h3>
                    <p className="text-slate-500 text-xs mt-1">Capture leads from search, display, and YouTube campaigns automatically.</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded w-fit">Not Connected</span>
                </div>
                
                <div className="border border-slate-200 bg-white rounded-xl p-5 shadow-sm flex flex-col justify-between h-40">
                  <div>
                    <h3 className="font-semibold text-slate-800">Facebook Leads</h3>
                    <p className="text-slate-500 text-xs mt-1">Instantly sync leads captured from Facebook Instant Lead Forms.</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded w-fit">Not Connected</span>
                </div>

                <div 
                  onClick={() => setModalOpen(true)}
                  className="border border-dashed border-blue-300 bg-blue-50/20 hover:bg-blue-50/50 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors h-40 group"
                >
                  <FileSpreadsheet className="h-8 w-8 text-blue-500 group-hover:scale-105 transition-transform" />
                  <h3 className="font-semibold text-blue-600 mt-2">Import leads via CSV</h3>
                  <p className="text-slate-400 text-xs mt-1 px-4">Upload arbitrary lead CSV lists to parse dynamically using AI.</p>
                </div>
              </div>
            </div>
          ) : (
            /* 2B. COMPLETED RESULTS VIEW (Leads Database) */
            <div className="flex flex-col gap-8 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Manage Your Leads</h2>
                  <p className="text-slate-500 text-sm mt-0.5">Monitor lead status, assign tasks, and close deals faster.</p>
                </div>

                {importResult && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleResetWorkflow}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Upload New
                    </button>
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
                )}
              </div>

              {importResult ? (
                <>
                  {/* Results statistics cards */}
                  <StatsSection stats={importResult.stats} />

                  {/* Main CRM extracted leads table */}
                  <ResultTable records={importResult.records} />

                  {/* Skipped records collapsible list */}
                  <SkippedSection skipped={importResult.skipped} />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-xl text-center">
                  <p className="text-slate-500 font-medium">No lead database records. Select "Lead Sources" to import a CSV list.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* 3. POPUP MODAL DIALOG (CSV Import UI Overlay) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          
          <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Import Leads via CSV</h3>
                <p className="text-slate-400 text-xs mt-0.5">Upload a CSV file to bulk import leads into your system.</p>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                disabled={importing}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body Container */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center gap-6">
              
              {importing ? (
                /* Stage A: Loading / Progress Screen */
                <ImportProgress active={importing} />
              ) : !previewData ? (
                /* Stage B: Empty dropzone screen */
                <div className="w-full flex flex-col gap-6">
                  
                  {/* Dropzone area */}
                  <div 
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                      isDragActive 
                        ? 'border-blue-500 bg-blue-50/50' 
                        : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="p-3 bg-slate-100 text-slate-400 rounded-full">
                        <UploadCloud className="h-8 w-8" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {isDragActive ? 'Drop your CSV file here' : 'Drop your CSV file here'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">or click to browse files</p>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full mt-1.5">
                        Supported file: .csv (max 10MB)
                      </span>
                    </div>
                  </div>

                  {/* Schema fields parameters details */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-[10px] text-slate-500">
                    <p className="font-semibold text-slate-600 uppercase tracking-wider mb-1">Required Headers:</p>
                    <p className="leading-relaxed break-words font-mono bg-white p-2 border border-slate-150 rounded">{REQUIRED_HEADERS_TEXT}</p>
                    <p className="mt-1.5 leading-normal">Template includes default + custom CRM fields to reduce upload mapping errors.</p>
                  </div>

                  {/* Sample download trigger */}
                  <button 
                    onClick={handleDownloadTemplate}
                    className="inline-flex items-center justify-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold w-fit mx-auto cursor-pointer"
                  >
                    <FolderDown className="h-4 w-4" />
                    Download Sample CSV Template
                  </button>

                </div>
              ) : (
                /* Stage C: File selected + preview display */
                <div className="w-full flex flex-col gap-5 animate-in fade-in duration-300">
                  
                  {/* File information pill */}
                  <div className="border border-green-200 bg-green-50/50 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-green-100 text-green-600 rounded">
                        <FileSpreadsheet className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 truncate max-w-[250px]">{fileObject?.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{(fileObject?.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleClearFile}
                      className="p-1 hover:bg-green-100 text-green-600 hover:text-green-800 rounded transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Modal spreadsheet table grid preview wrapper */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden flex flex-col">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CSV Data Rows Preview</span>
                      <span className="text-[10px] text-slate-400">{previewData.previewCount} preview rows parsed</span>
                    </div>

                    <div className="overflow-x-auto overflow-y-auto max-h-[220px]">
                      <table className="w-full text-[10px] text-slate-600 border-collapse text-left">
                        <thead className="sticky top-0 bg-slate-100 border-b border-slate-200">
                          <tr>
                            {previewData.headers.slice(0, 8).map((hdr, idx) => (
                              <th key={idx} className="px-3 py-2 font-semibold text-slate-700 bg-slate-100 whitespace-nowrap">
                                {hdr}
                              </th>
                            ))}
                            {previewData.headers.length > 8 && <th className="px-3 py-2 bg-slate-100 text-slate-400">...</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150">
                          {previewData.previewRows.slice(0, 10).map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-50">
                              {previewData.headers.slice(0, 8).map((hdr, cIdx) => (
                                <td key={cIdx} className="px-3 py-2 truncate max-w-[120px] whitespace-nowrap">
                                  {row[hdr] !== null && row[hdr] !== undefined ? String(row[hdr]) : '-'}
                                </td>
                              ))}
                              {previewData.headers.length > 8 && <td className="px-3 py-2 text-slate-400">...</td>}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <p className="text-[10px] text-center text-slate-400 font-medium">
                    Confirm your data preview looks accurate before running AI field extraction.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
              <button 
                onClick={handleClearFile}
                disabled={importing || !previewData}
                className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmImport}
                disabled={importing || !fileObject}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Upload File
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
