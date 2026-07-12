import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          &copy; {new Date().getFullYear()} GrowEasy. All rights reserved.
        </p>
        <p className="text-xs text-slate-400">
          AI-powered lead extraction platform. Made for production.
        </p>
      </div>
    </footer>
  );
}
