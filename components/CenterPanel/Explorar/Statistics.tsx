
import React from 'react';
import { Dataset } from '../../../types';

interface Props {
  dataset: Dataset;
}

const Statistics: React.FC<Props> = ({ dataset }) => {
  const statsList = [
    { label: 'Events', value: dataset.stats.events },
    { label: 'Cases', value: dataset.stats.cases },
    { label: 'Activities', value: dataset.stats.activities },
    { label: 'Median case duration', value: dataset.stats.medianDuration },
    { label: 'Mean case duration', value: dataset.stats.meanDuration },
    { label: 'Start', value: dataset.stats.start },
    { label: 'End', value: dataset.stats.end }
  ];

  return (
    <div className="flex h-full items-center justify-center animate-in fade-in zoom-in duration-500">
       <div className="bg-white border border-slate-200 rounded-[32px] w-full max-w-md p-10 shadow-2xl relative overflow-hidden">
          <div className="space-y-8">
             <div className="pb-2 border-b border-slate-50">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">DATASET ANALYZED</h2>
                <p className="text-xl font-black italic text-[#5c56f1] uppercase tracking-tighter">{dataset.name}</p>
             </div>
             <div className="space-y-4">
                {statsList.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                     <span className="text-[11px] font-semibold text-slate-500 tracking-tight">{item.label}</span>
                     <span className="text-[13px] font-black text-slate-900 tracking-wide">{item.value}</span>
                  </div>
                ))}
             </div>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#5c56f1]/5 blur-[60px] rounded-full -mr-12 -mt-12"></div>
       </div>
    </div>
  );
};

export default Statistics;
