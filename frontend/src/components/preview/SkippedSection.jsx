'use client';

import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

export default function SkippedSection({ skipped = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  if (skipped.length === 0) return null;

  // Dynamically inspect headers of skipped rows
  const keys = Object.keys(skipped[0] || {});

  return (
    <div className="w-full bg-amber-50/50 border border-amber-250 rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Header Controls */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-amber-100/20 transition-colors"
      >
        <div className="flex items-center gap-3 text-left">
          <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
            <AlertTriangle className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="font-semibold text-amber-900 text-sm">
              Skipped Records ({skipped.length})
            </h4>
            <p className="text-xs text-amber-700 mt-0.5">
              These records lacked both an email and a mobile/phone number and were omitted heuristically.
            </p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-amber-800" />
        ) : (
          <ChevronDown className="h-5 w-5 text-amber-800" />
        )}
      </button>

      {/* Collapsible List Grid */}
      {isOpen && (
        <div className="border-t border-amber-200 overflow-x-auto max-h-[300px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-amber-100/50">
              <tr>
                {keys.map((key, idx) => (
                  <th key={idx} className="px-4 py-2 font-semibold text-amber-900 tracking-wider whitespace-nowrap bg-amber-100/30">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-150/40">
              {skipped.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-amber-100/10">
                  {keys.map((key, colIdx) => (
                    <td key={colIdx} className="px-4 py-2 text-amber-850 whitespace-nowrap">
                      {row[key] !== null && row[key] !== undefined && row[key] !== '' ? (
                        String(row[key])
                      ) : (
                        <span className="text-amber-400 italic">empty</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
