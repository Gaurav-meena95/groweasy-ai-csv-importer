import React from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, AlertOctagon, Clock } from 'lucide-react';

export default function StatsSection({ stats = {} }) {
  const {
    totalUploaded = 0,
    successfullyParsed = 0,
    skipped = 0,
    failed = 0,
    processingTimeMs = 0,
  } = stats;

  const seconds = (processingTimeMs / 1000).toFixed(2);

  const cards = [
    {
      name: 'Total Uploaded',
      value: totalUploaded,
      icon: Sparkles,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      name: 'Successfully Parsed',
      value: successfullyParsed,
      icon: CheckCircle2,
      color: 'text-green-600 bg-green-50 border-green-100',
    },
    {
      name: 'Skipped Records',
      value: skipped,
      icon: AlertTriangle,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      description: 'Heuristically rejected',
    },
    {
      name: 'Failed Mappings',
      value: failed,
      icon: AlertOctagon,
      color: 'text-red-600 bg-red-50 border-red-100',
      description: 'Gemini batch errors',
    },
    {
      name: 'Processing Time',
      value: `${seconds}s`,
      icon: Clock,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 w-full max-w-7xl">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3.5 col-span-1">
            <div className={`p-2.5 rounded-lg border ${card.color} flex-shrink-0`}>
              <Icon className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{card.name}</p>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{card.value}</p>
              {card.description && (
                <p className="text-slate-400 text-[9px] mt-0.5 font-medium">{card.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
