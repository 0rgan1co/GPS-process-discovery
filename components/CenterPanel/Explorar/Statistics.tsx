
import React from 'react';
import { Dataset } from '../../../types';

interface Props {
  dataset: Dataset;
}

const Statistics: React.FC<Props> = ({ dataset }) => {
  const statsList = [
    { label: 'Eventos Procesados', value: dataset.stats.events.toLocaleString(), icon: '📊' },
    { label: 'Casos Individuales (N)', value: dataset.stats.cases.toLocaleString(), icon: '🆔' },
    { label: 'Variantes de Actividad', value: dataset.stats.activities, icon: '🔄' },
    { label: 'Fecha Inicio Datos', value: new Date(dataset.stats.start).toLocaleDateString(), icon: '📅' },
    { label: 'Fecha Fin Datos', value: new Date(dataset.stats.end).toLocaleDateString(), icon: '🏁' }
  ];

  return (
    <div className="flex h-full items-center justify-center animate-in fade-in zoom-in duration-500 p-8 overflow-y-auto hide-scrollbar">
       <div className="bg-white border border-slate-200 rounded-[40px] w-full max-w-2xl p-10 md:p-14 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#5c56f1]/5 blur-[60px] rounded-full -mr-24 -mt-24"></div>
          
          <div className="space-y-12">
             <div className="flex flex-col gap-2 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#5c56f1] animate-pulse"></div>
                   <h2 className="text-[10px] font-black text-[#5c56f1] uppercase tracking-[0.4em]">Estadísticas</h2>
                </div>
                <p className="text-3xl font-black italic text-slate-900 uppercase tracking-tighter leading-tight">{dataset.name}</p>
             </div>

             {/* KPIs PRINCIPALES DE TIEMPO (LEAN METRICS) */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 border border-slate-100 p-8 rounded-[32px] flex flex-col items-center text-center group hover:bg-white hover:border-[#5c56f1]/20 transition-all shadow-sm">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Mean Lead Time</span>
                   <span className="text-4xl font-black text-[#5c56f1] italic tracking-tighter">{dataset.stats.meanDuration}</span>
                   <p className="mt-2 text-[8px] font-bold text-slate-400 uppercase tracking-widest px-4">Promedio aritmético de ciclo total</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-8 rounded-[32px] flex flex-col items-center text-center group hover:bg-white hover:border-[#5c56f1]/20 transition-all shadow-sm">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Median Lead Time</span>
                   <span className="text-4xl font-black text-slate-900 italic tracking-tighter">{dataset.stats.medianDuration}</span>
                   <p className="mt-2 text-[8px] font-bold text-slate-400 uppercase tracking-widest px-4">Punto central de la muestra (estable)</p>
                </div>
             </div>

             {/* LISTA DE MÉTRICAS OPERATIVAS */}
             <div className="space-y-4 px-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                  {statsList.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center group border-b border-slate-50 pb-2">
                       <div className="flex items-center gap-3">
                          <span className="text-xs grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all">{item.icon}</span>
                          <span className="text-[11px] font-bold text-slate-500 tracking-tight group-hover:text-slate-900 transition-colors uppercase">{item.label}</span>
                       </div>
                       <span className="text-[12px] font-black text-slate-900 tracking-wide">{item.value}</span>
                    </div>
                  ))}
                </div>
             </div>

             {/* NOTA DEL INGENIERO */}
             <div className="bg-amber-50/50 border border-amber-100 p-6 rounded-[28px] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10 text-xl">💡</div>
                <h4 className="text-[9px] font-black text-amber-600 uppercase tracking-[0.2em] mb-2">Importante:</h4>
                <p className="text-[10px] font-bold text-amber-800/80 leading-relaxed italic">
                  "Para asegurar la integridad del análisis Lead Time, los casos con un solo evento (WIP inicial sin transiciones) han sido excluidos del cálculo de promedios para evitar sesgos hacia el cero. Las duraciones se computan estrictamente entre el primer y último evento del rastro digital."
                </p>
             </div>
          </div>
       </div>
    </div>
  );
};

export default Statistics;
