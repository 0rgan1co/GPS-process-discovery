
import React from 'react';

const PRESENTATION_TEMPLATES = [
  { id: "Standard Executive", slides: ["1. Visión General", "2. Diagnóstico", "3. Cuellos de Botella", "4. Plan de Acción", "5. Proyección ROI"] },
  { id: "Lean Deep Dive", slides: ["1. Mapa de Valor", "2. Análisis de Desperdicio", "3. Eficiencia de Ciclo", "4. Propuesta Futura", "5. Impacto Operativo"] },
  { id: "Financial ROI & Impact", slides: ["1. Costo Actual", "2. Fugas de Capital", "3. Ahorros Proyectados", "4. Payback Period", "5. Análisis Costo-Beneficio"] }
];

interface Props {
  isGenerating: boolean;
  selectedTemplate: any;
  setSelectedTemplate: (t: any) => void;
  showTemplateMenu: boolean;
  setShowTemplateMenu: (show: boolean) => void;
  showCustomPrompt: boolean;
  setShowCustomPrompt: (show: boolean) => void;
  customPrompt: string;
  setCustomPrompt: (text: string) => void;
  onGenerate: () => void;
}

const DeckGenerator: React.FC<Props> = ({
  isGenerating, selectedTemplate, setSelectedTemplate, showTemplateMenu,
  setShowTemplateMenu, showCustomPrompt, setShowCustomPrompt,
  customPrompt, setCustomPrompt, onGenerate
}) => {
  return (
    <div className="flex-1 flex flex-col h-full animate-in fade-in overflow-hidden">
       <div className="flex-1 overflow-y-auto p-2 space-y-8 hide-scrollbar">
         <div className="flex flex-col items-center text-center mt-4 text-slate-900">
           <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mb-4"><div className="w-7 h-7 bg-gradient-to-tr from-[#5c56f1] to-emerald-500 rounded-lg shadow-lg"></div></div>
           <h2 className="text-base font-black italic uppercase tracking-tighter">MOTOR DE REPORTES</h2>
           <p className="text-[7px] font-black text-slate-400 tracking-[0.4em] uppercase mt-1">VISTA EJECUTIVA IA</p>
         </div>
         <div className="space-y-4">
           <div onClick={() => setShowTemplateMenu(!showTemplateMenu)} className="bg-white border border-slate-200 p-4 rounded-xl text-[11px] text-slate-700 font-bold flex justify-between items-center cursor-pointer relative shadow-sm hover:border-[#5c56f1]/30 transition">
             {selectedTemplate.id} <span className="text-slate-400">▼</span>
             {showTemplateMenu && (
               <div className="absolute bottom-full left-0 w-full mb-2 bg-white border border-slate-200 rounded-2xl p-2 z-[100] shadow-2xl animate-in slide-in-from-bottom-2 text-slate-900">
                  {PRESENTATION_TEMPLATES.map(t => (<button key={t.id} onClick={() => { setSelectedTemplate(t); setShowTemplateMenu(false); }} className={`w-full text-left px-5 py-3 rounded-xl transition ${selectedTemplate.id === t.id ? 'bg-[#5c56f1] text-white' : 'hover:bg-slate-50 text-slate-500'}`}><div className="text-[10px] font-black uppercase">{t.id}</div></button>))}
               </div>
             )}
           </div>
           <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3 shadow-sm">
             {selectedTemplate.slides.map((s: string, idx: number) => (<div key={idx} className="flex items-start gap-3 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-50 pb-2 last:border-0"><span className="text-[#5c56f1] w-4">0{idx + 1}</span>{s.split('. ')[1]}</div>))}
           </div>
         </div>
       </div>
       <div className="mt-auto pt-6 border-t border-slate-100 space-y-4">
         {showCustomPrompt && <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} placeholder="Instrucciones IA adicionales..." className="w-full h-24 bg-white border border-slate-200 p-4 rounded-2xl text-[11px] text-slate-700 outline-none resize-none shadow-sm focus:border-[#5c56f1]/40 transition" />}
         <div className="relative">
           <button 
             onClick={onGenerate} disabled={isGenerating}
             className={`w-full py-5 rounded-[24px] font-black text-[12px] uppercase tracking-[0.3em] shadow-xl transition-all ${isGenerating ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-[#5c56f1] text-white hover:bg-[#4f46e5] active:scale-95'}`}
           >
             {isGenerating ? '⌛ CREANDO...' : '🚀 GENERAR DECK'}
           </button>
           <button onClick={() => setShowCustomPrompt(!showCustomPrompt)} className={`absolute -top-3 -right-2 w-10 h-10 rounded-full border flex items-center justify-center transition-all ${showCustomPrompt ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-white text-slate-400 border-slate-200 shadow-md'}`}>✎</button>
         </div>
       </div>
    </div>
  );
};

export default DeckGenerator;
