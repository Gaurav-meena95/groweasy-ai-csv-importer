'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileSpreadsheet, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { uploadCSV } from '../../services/api';

export default function UploadCard({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles && rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      if (error.code === 'file-invalid-type') {
        toast.error('Invalid file type. Only CSV files (.csv) are supported.');
      } else if (error.code === 'file-too-large') {
        toast.error('File is too large. Maximum size allowed is 10MB.');
      } else {
        toast.error(error.message || 'Error selecting file.');
      }
      return;
    }

    if (acceptedFiles && acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      toast.success(`Selected file: ${acceptedFiles[0].name}`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxSize: 10 * 1024 * 1024, // 10MB limit
    multiple: false
  });

  const clearFile = (e) => {
    e.stopPropagation();
    setFile(null);
  };

  const handleUploadSubmit = async () => {
    if (!file) {
      toast.error('Please select a CSV file first.');
      return;
    }

    setUploading(true);
    const loadingToastId = toast.loading('Uploading and parsing CSV...');

    try {
      const response = await uploadCSV(file);
      
      if (response.success) {
        toast.dismiss(loadingToastId);
        toast.success(response.message || 'File uploaded successfully!');
        if (onUploadSuccess) {
          // Pass result and original file back to parent page
          onUploadSuccess(response.data, file);
        }
      } else {
        throw new Error(response.message || 'Upload failed.');
      }
    } catch (error) {
      toast.dismiss(loadingToastId);
      const serverErrorMsg = error.response?.data?.message || error.message || 'Network error connecting to API.';
      toast.error(serverErrorMsg);
      console.error('[Upload Error]:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
          isDragActive 
            ? 'border-blue-500 bg-blue-50/50' 
            : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
        }`}
      >
        <input {...getInputProps()} />
        
        {file ? (
          <div className="flex flex-col items-center text-center gap-3">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <FileSpreadsheet className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 break-all">{file.name}</p>
              <p className="text-xs text-slate-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            
            <button
              onClick={clearFile}
              disabled={uploading}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 border border-red-200 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" />
              Remove File
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center gap-3">
            <div className="p-3 bg-slate-100 text-slate-400 rounded-full">
              <UploadCloud className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {isDragActive ? 'Drop your CSV file here' : 'Drag & drop your CSV file here, or click to browse'}
              </p>
              <p className="text-xs text-slate-500 mt-1.5">Supported formats: .csv (Max 10MB)</p>
            </div>
            
            <button 
              type="button"
              className="mt-2 px-4 py-2 bg-white text-sm font-semibold text-slate-700 hover:text-slate-800 border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
            >
              Select File
            </button>
          </div>
        )}
      </div>

      {file && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleUploadSubmit}
            disabled={uploading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            {uploading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Parsing CSV...
              </>
            ) : (
              'Upload & Preview'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
