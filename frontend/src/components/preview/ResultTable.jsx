'use client';

import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';

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

export default function ResultTable({ records = [] }) {
  const columns = useMemo(() => {
    return CRM_FIELDS.map((field) => ({
      accessorKey: field.key,
      header: field.label,
      cell: (info) => {
        const val = info.getValue();
        const key = info.column.id;

        if (key === 'crm_status') {
          if (!val) return <span className="text-slate-350 italic">-</span>;
          
          let colorClass = 'bg-slate-100 text-slate-700';
          if (val === 'GOOD_LEAD_FOLLOW_UP') colorClass = 'bg-green-150 text-green-800';
          if (val === 'SALE_DONE') colorClass = 'bg-blue-150 text-blue-800';
          if (val === 'DID_NOT_CONNECT') colorClass = 'bg-slate-150 text-slate-700';
          if (val === 'BAD_LEAD') colorClass = 'bg-red-150 text-red-800';

          return (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${colorClass}`}>
              {val}
            </span>
          );
        }

        if (key === 'created_at' && val) {
          try {
            return <span>{new Date(val).toLocaleString()}</span>;
          } catch {
            return <span>{String(val)}</span>;
          }
        }

        if (val === null || val === undefined || val === '') {
          return <span className="text-slate-300 italic">-</span>;
        }

        return <span className="truncate max-w-[200px] inline-block">{String(val)}</span>;
      }
    }));
  }, []);

  const table = useReactTable({
    data: records,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-xl text-center shadow-sm">
        <p className="text-slate-500 font-medium">No CRM records were successfully extracted in this run.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">AI Mapped CRM Leads</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Leads processed by Gemini and saved to MongoDB
          </p>
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[450px]">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th 
                    key={header.id}
                    className="px-4 py-3 font-semibold text-slate-700 tracking-wider bg-slate-50 whitespace-nowrap"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          
          <tbody className="divide-y divide-slate-150">
            {table.getRowModel().rows.map((row, idx) => (
              <tr 
                key={row.id} 
                className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50/50' : 'bg-slate-50/30 hover:bg-slate-50/50'}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2.5 text-slate-600 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
