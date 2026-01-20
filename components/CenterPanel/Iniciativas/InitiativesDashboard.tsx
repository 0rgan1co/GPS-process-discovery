
import React, { useState } from 'react';
import { Dataset, Initiative } from '../../../types';

interface Props {
  dataset: Dataset;
}

const InitiativesDashboard: React.FC<Props> = ({ dataset }) => {
  const [initiatives, setInitiatives] = useState<Initiative[]>([
    {
      id: 'i1',
      title: 'Automatización de Aprobaciones N1',
      status: 'active',
      progress: 65,
      impact: 'high',
      owner: 'Jorge R.',
      startDate: '2025-01-01',
      achievements: ['Reducción de 20% en tiempo de espera', '90% de casos estandarizados'],
      obstacles: ['Resistencia al cambio en equipo N2', 'Falta de acceso a API secundaria'],
      learnings: ['La validación previa ahorra 2 horas de re-trabajo']
    },
    {
      id: 'i2',
      title: 'Reducción de Re-procesos en Clasificación',
      status: 'active',
      progress: 30,
      impact: 'medium',
      owner: 'Ana S.',
      startDate: '2025-02-15',
      achievements: ['Mapeo completo de causas raíz'],
      obstacles: ['Alta rotación de personal operativo'],
      learnings: ['La capacitación temprana es más barata que el hotfix']
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  return (
    <div className="flex flex-col h-full gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header del Dashboard */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-[10px] font-black text-[#5c56f1] uppercase tracking-[0.4em] mb-2">GESTIÓN DE INICIATIVAS</h2>
          <p className="text-2xl font-black italic text-slate-900 uppercase tracking-tighter">Ciclos Cortos de 90 Días</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex">
             {(['all', 'active', 'completed'] as const).map(f => (
               <button 
                 key={f} 
                 onClick={() => setFilter(f)}
                 className={`px-6 py-1.5 text-[9px] font-black rounded-lg transition-all ${filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
               >
                 {f.toUpperCase()}
               </button>
             ))}
           </div>
           <button className="px-6 py-2.5 bg-[#5c56f1] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-[#4f46e5] transition-all">+ NUEVA INICIATIVA</button>
        </div>
      </div>

      {/* Grid de Iniciativas */}
      <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8 pr-2 hide-scrollbar pb-12">
        {initiatives.map(initiative => (
          <div key={initiative.id} className="bg-white border border-slate-200 rounded-[48px] p-10 flex flex-col shadow-sm hover:shadow-2xl transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#5c56f1]/5 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-[#5c56f1]/10 transition-colors"></div>
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="space-y-1">
                <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                  initiative.impact === 'high' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-blue-50 text-blue-500 border-blue-100'
                }`}>
                  Impacto {initiative.impact.toUpperCase()}
                </span>
                <h3 className="text-xl font-black text-slate-900 leading-tight pt-2">{initiative.title}</h3>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Días en Ciclo</p>
                <p className="text-lg font-black italic text-slate-900">42 / 90</p>
              </div>
            </div>

            {/* Progreso */}
            <div className="space-y-3 mb-10">
              <div className="flex justify-between items-end">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Progreso de Implementación</span>
                 <span className="text-sm font-black text-[#5c56f1]">{initiative.progress}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#5c56f1] rounded-full shadow-[0_0_15px_rgba(92,86,241,0.4)] transition-all duration-1000"
                  style={{ width: `${initiative.progress}%` }}
                />
              </div>
            </div>

            {/* Secciones de Aprendizaje */}
            <div className="grid grid-cols-1 gap-6 flex-1">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest border-b border-emerald-50 pb-2 flex items-center gap-2">
                   <span className="text-xs">🏆</span> Logros & Hitos
                </h4>
                <ul className="space-y-2">
                  {initiative.achievements.map((a, i) => (
                    <li key={i} className="text-[11px] font-medium text-slate-600 flex items-start gap-3">
                      <div className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shadow-sm"></div>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest border-b border-red-50 pb-2 flex items-center gap-2">
                   <span className="text-xs">🚧</span> Obstáculos
                </h4>
                <ul className="space-y-2">
                  {initiative.obstacles.map((o, i) => (
                    <li key={i} className="text-[11px] font-medium text-slate-600 flex items-start gap-3">
                      <div className="w-1 h-1 rounded-full bg-red-400 mt-1.5 shadow-sm"></div>
                      {o}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest border-b border-indigo-50 pb-2 flex items-center gap-2">
                   <span className="text-xs">💡</span> Aprendizajes Clave
                </h4>
                <div className="bg-indigo-50/30 p-4 rounded-2xl border border-indigo-100/50">
                  {initiative.learnings.map((l, i) => (
                    <p key={i} className="text-[11px] font-bold text-slate-700 italic leading-relaxed">"{l}"</p>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">{initiative.owner.split(' ')[0][0]}{initiative.owner.split(' ')[1][0]}</div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{initiative.owner}</span>
              </div>
              <button className="text-[9px] font-black text-[#5c56f1] uppercase tracking-widest hover:underline">Ver detalles completos →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InitiativesDashboard;
