import React from 'react';

export default function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {/* Simple Clean Logo */}
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-lg shadow-sm">
            GE
          </div>
          <div>
            <span className="font-semibold text-slate-900 tracking-tight text-lg">GrowEasy</span>
            <span className="text-slate-400 text-xs ml-2 font-medium px-2 py-0.5 rounded-full bg-slate-100">CSV Importer</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/Gaurav-meena95/groweasy-ai-csv-importer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            Documentation
          </a>
        </div>
      </div>
    </header>
  );
}
