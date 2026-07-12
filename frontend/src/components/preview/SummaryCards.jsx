import React from 'react';
import { Columns, Database, CheckCircle, AlertTriangle } from 'lucide-react';

export default function SummaryCards({ totalRecords, skippedRecords, headersCount }) {
  const totalRows = totalRecords + skippedRecords;

  const stats = [
    {
      name: 'Total CSV Rows',
      value: totalRows,
      icon: Database,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      name: 'CSV Columns',
      value: headersCount,
      icon: Columns,
      color: 'text-slate-600 bg-slate-50 border-slate-100',
    },
    {
      name: 'Valid Records',
      value: totalRecords,
      icon: CheckCircle,
      color: 'text-green-600 bg-green-50 border-green-100',
      description: 'Contains email or mobile',
    },
    {
      name: 'Skipped (Invalid)',
      value: skippedRecords,
      icon: AlertTriangle,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      description: 'Lacks both email & mobile',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 w-full max-w-7xl">
      {stats.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-lg border ${item.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{item.name}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{item.value}</p>
              {item.description && (
                <p className="text-slate-400 text-[10px] mt-0.5 font-medium">{item.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
