
import React from 'react';
import { Dataset } from '../../../types';

interface Props {
  dataset: Dataset;
}

const Statistics: React.FC<Props> = ({ dataset }) => {
  const statsList = [
    { label: 'Total Events', value: dataset.stats.events },
    { label: 'Total Cases', value: dataset.stats.cases },
    { label: 'Distinct Activities', value: dataset.stats.activities },
    { label: 'Median Duration', value: dataset.stats.medianDuration },
    { label: 'Mean Duration', value: dataset.stats.meanDuration },
    { label: 'Analysed From', value: dataset.stats.start },
    { label: 'Analysed To', value: dataset.stats.end }
  ];

  return (
    <div className="flex h-full items-center justify-center animate-in fade-in zoom-in duration-500">
       <div className="bg-white border border-slate-200 rounded-[40px] w-full max-w-md p-12 shadow-xl relative overflow-hidden">
          <div className="space-y-10">
             <div className="pb-4 border-b border-slate-100">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">DIAGNÓSTICO DEL PROCESO</h2>
                <p className="text-2xl font-black italic text-slate-900 uppercase tracking-tighter leading-tight">{dataset.name}</p>
             </div>
             <div className="space-y-5">
                {statsList.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center group">
                     <span className="text-[11px] font-bold text-slate-500 tracking-tight group-hover:text-slate-900 transition-colors">{item.label}</span>
                     <span className="text-[13px] font-black text-slate-900 tracking-wide">{item.value}</span>
                  </div>
                ))}
             </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#5c56f1]/5 blur-[60px] rounded-full -mr-16 -mt-16"></div>
       </div>
    </div>
  );
};

export default Statistics;
