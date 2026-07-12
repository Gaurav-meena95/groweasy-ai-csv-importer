import React from 'react';
import './globals.css';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'GrowEasy CSV Importer',
  description: 'AI-powered CRM lead data extraction and import dashboard.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-slate-50 antialiased">
      <body className="flex min-h-full flex-col font-sans text-slate-900">
        <Navbar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
