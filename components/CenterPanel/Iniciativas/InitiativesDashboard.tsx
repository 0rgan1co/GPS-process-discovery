
import React, { useState } from 'react';
import { Dataset, Initiative } from '../../../types';

interface Props {
  dataset: Dataset;
}

const InitiativesDashboard: React.FC<Props> = ({ dataset }) => {
  const [initiatives, setInitiatives] = useState<Initiative[]>([
    {
      id: 'i1',
      title: 'Automatización de Aprobaciones Order-to-Cash',
      status: 'active',
      progress: 68,
      impact: 'high',
      owner: 'Jorge R.',
      startDate: '2025-01-10',
      cycleDay: 42,
      achievements: ['Reducción de 20% en tiempo de espera', 'Sincronización con ERP completada'],
      obstacles: ['API de terceros con latencia intermitente', 'Capacitación pendiente en el equipo N2'],
      learnings: ['La validación en origen ahorra 2.4 horas por caso de re-trabajo.'],
      estimatedRoi: '$12.5k / mo'
    },
    {
      id: 'i2',
      title: 'Optimización de Rutas de Despacho',
      status: 'active',
      progress: 32,
      impact: 'medium',
      owner: 'Ana S.',
      startDate: '2025-02-05',
      cycleDay: 15,
      achievements: ['Mapeo de rutas reales completado', 'Identificación de paradas innecesarias'],
      obstacles: ['Falta de datos GPS en vehículos antiguos'],
      learnings: ['La consolidación de carga en AM reduce costos en un 12%.'],
      estimatedRoi: '$8.2k / mo'
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredInitiatives = initiatives.filter(i => 
    filter === 'all' ? true : i.status === filter
  );

  return (
    <div className="flex flex-col h-full gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-black text-[#5c56f1] uppercase tracking-[0.4em] bg-indigo-50 px-3 py-1 rounded-full">Plan de Mejora Continua</span>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dataset: {dataset.name}</span>
          </div>
          <p className="text-3xl font-black italic text-slate-900 uppercase tracking-tighter">Gestión de Ciclos (90 Días)</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
           <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex shadow-inner flex-1 md:flex-none">
             {(['all', 'active', 'completed'] as const).map(f => (
               <button 
                 key={f} 
                 onClick={() => setFilter(f)}
                 className={`px-6 py-2 text-[9px] font-black rounded-xl transition-all ${filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 {f.toUpperCase()}
               </button>
             ))}
           </div>
           <button className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-[#5c56f1] transition-all whitespace-nowrap">+ NUEVA INICIATIVA</button>
        </div>
      </div>

      {/* Initiatives Content */}
      <div className="flex-1 overflow-y-auto grid grid-cols-1 xl:grid-cols-2 gap-8 pr-2 hide-scrollbar pb-24">
        {filteredInitiatives.map(initiative => (
          <div key={initiative.id} className="group bg-white border border-slate-200 rounded-[48px] p-10 flex flex-col shadow-sm hover:shadow-2xl transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#5c56f1]/5 blur-[80px] rounded-full -mr-24 -mt-24 group-hover:bg-[#5c56f1]/10 transition-colors"></div>
            
            {/* Initiative Header */}
            <div className="flex justify-between items-start mb-10 relative z-10">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                    initiative.impact === 'high' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-blue-50 text-blue-500 border-blue-100'
                  }`}>
                    Impacto {initiative.impact.toUpperCase()}
                  </span>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ROI EST: {initiative.estimatedRoi}</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 leading-tight pr-10">{initiative.title}</h3>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Día del Ciclo</p>
                <div className="flex items-end gap-1">
                   <span className="text-2xl font-black italic text-slate-900">{initiative.cycleDay}</span>
                   <span className="text-[10px] font-black text-slate-300 mb-1">/ 90</span>
                </div>
              </div>
            </div>

            {/* Progress Visualization */}
            <div className="space-y-4 mb-12">
              <div className="flex justify-between items-end px-1">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Avance de Implementación</span>
                 <span className="text-base font-black text-[#5c56f1]">{initiative.progress}%</span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner p-1">
                <div 
                  className="h-full bg-gradient-to-r from-[#5c56f1] to-blue-400 rounded-full shadow-[0_0_20px_rgba(92,86,241,0.3)] transition-all duration-1000 ease-out"
                  style={{ width: `${initiative.progress}%` }}
                />
              </div>
            </div>

            {/* Qualitative Feedback Sections */}
            <div className="grid grid-cols-1 gap-8 flex-1">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest border-b border-emerald-50 pb-2 flex items-center justify-between">
                   <span className="flex items-center gap-2">🏆 Logros & Hitos</span>
                   <button className="text-[8px] text-slate-300 hover:text-emerald-500 transition">+</button>
                </h4>
                <div className="space-y-3">
                  {initiative.achievements.map((a, i) => (
                    <div key={i} className="flex items-start gap-4 animate-in slide-in-from-left duration-500" style={{ animationDelay: `${i*100}ms` }}>
                      <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0 shadow-sm"></div>
                      <p className="text-[11px] font-semibold text-slate-600 leading-relaxed">{a}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest border-b border-red-50 pb-2 flex items-center justify-between">
                   <span className="flex items-center gap-2">🚧 Obstáculos Detectados</span>
                   <button className="text-[8px] text-slate-300 hover:text-red-400 transition">+</button>
                </h4>
                <div className="space-y-3">
                  {initiative.obstacles.map((o, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 shrink-0 shadow-sm"></div>
                      <p className="text-[11px] font-semibold text-slate-600 leading-relaxed">{o}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest border-b border-indigo-50 pb-2 flex items-center gap-2">
                   <span>💡 Aprendizaje del Ciclo</span>
                </h4>
                <div className="bg-indigo-50/50 p-6 rounded-[24px] border border-indigo-100/40 relative">
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-indigo-100 rounded-full flex items-center justify-center text-sm shadow-sm">✨</div>
                  {initiative.learnings.map((l, i) => (
                    <p key={i} className="text-[12px] font-bold text-slate-700 italic leading-relaxed">"{l}"</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer de Iniciativa */}
            <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-[10px] font-black shadow-lg">
                  {initiative.owner.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{initiative.owner}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">Owner de Iniciativa</p>
                </div>
              </div>
              <button className="px-6 py-2.5 bg-slate-50 text-slate-400 hover:text-[#5c56f1] border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Ver Roadmap Completo</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InitiativesDashboard;
