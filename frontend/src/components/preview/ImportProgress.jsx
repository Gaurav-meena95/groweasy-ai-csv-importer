'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

const STAGES = [
  { label: 'Uploading file...', minDuration: 800 },
  { label: 'Parsing CSV data...', minDuration: 1200 },
  { label: 'Analyzing structure & headers...', minDuration: 1500 },
  { label: 'Sending to Gemini 2.5 Flash...', minDuration: 2000 },
  { label: 'Processing batches and mapping CRM fields...', minDuration: 4000 },
  { label: 'Finalizing database insertion...', minDuration: 1500 }
];

export default function ImportProgress({ active }) {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);

  useEffect(() => {
    if (!active) {
      setCurrentStageIdx(0);
      return;
    }

    let isMounted = true;
    
    const runSimulatedProgress = async () => {
      for (let i = 0; i < STAGES.length; i++) {
        if (!isMounted) break;
        setCurrentStageIdx(i);
        await new Promise((resolve) => setTimeout(resolve, STAGES[i].minDuration));
      }
    };

    runSimulatedProgress();

    return () => {
      isMounted = false;
    };
  }, [active]);

  return (
    <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl p-8 shadow-sm flex flex-col items-center">
      <div className="flex flex-col items-center text-center gap-2 mb-8">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        <h3 className="text-lg font-semibold text-slate-900">AI Extraction in Progress</h3>
        <p className="text-slate-500 text-sm">
          Gemini is mapping your CSV columns dynamically to target CRM fields in batches.
        </p>
      </div>

      <div className="w-full flex flex-col gap-4">
        {STAGES.map((stage, idx) => {
          const isDone = idx < currentStageIdx;
          const isCurrent = idx === currentStageIdx;
          
          return (
            <div 
              key={idx} 
              className={`flex items-center gap-3 transition-colors duration-200 ${
                isCurrent 
                  ? 'text-blue-600 font-medium' 
                  : isDone 
                    ? 'text-green-600' 
                    : 'text-slate-400'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin text-blue-600" />
              ) : (
                <Circle className="h-5 w-5 flex-shrink-0" />
              )}
              <span className="text-sm">{stage.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
