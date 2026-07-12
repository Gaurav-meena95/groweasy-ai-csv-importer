'use client';

import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';

export default function PreviewTable({ headers = [], previewRows = [], previewCount = 0, totalRecords = 0 }) {
  // Dynamically map CSV headers to TanStack Table column definitions
  const columns = useMemo(() => {
    return headers.map((headerName) => ({
      accessorKey: headerName,
      header: headerName,
      cell: (info) => {
        const val = info.getValue();
        if (val === null || val === undefined || val === '') {
          return <span className="text-slate-350 italic">empty</span>;
        }
        return <span className="truncate max-w-[200px] inline-block">{String(val)}</span>;
      }
    }));
  }, [headers]);

  const table = useReactTable({
    data: previewRows,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  if (previewRows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-xl text-center">
        <p className="text-slate-500 font-medium">No preview data available.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Table Title and Counts */}
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">Data Preview</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing first {previewCount} rows out of {totalRecords} total valid records
          </p>
        </div>
      </div>

      {/* Main Table Scrolling Area */}
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
