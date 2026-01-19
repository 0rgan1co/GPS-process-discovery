
import React from 'react';
import { ChatMessage } from '../../types';

const CONTEXT_QUESTIONS = [
  { text: "¿Cuál es el KPI más crítico de este proceso?", icon: "🎯" },
  { text: "¿Qué cuellos de botella has identificado manualmente?", icon: "⚠️" },
  { text: "¿Cuál es el impacto financiero de una falla aquí?", icon: "💸" },
  { text: "¿Qué sistemas externos interactúan con este flujo?", icon: "🔗" }
];

interface Props {
  chatHistory: ChatMessage[];
  inputText: string;
  setInputText: (text: string) => void;
  isTyping: boolean;
  isLiveActive: boolean;
  handleSendMessage: (text?: string) => void;
  startLiveSession: () => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  clearHistory: () => void;
}

const SmartContext: React.FC<Props> = ({
  chatHistory, inputText, setInputText, isTyping, isLiveActive,
  handleSendMessage, startLiveSession, scrollRef, fileInputRef, clearHistory
}) => {
  return (
    <div className="flex-1 flex flex-col bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm relative min-h-0">
       <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50/50">
          <span className="text-[9px] font-black text-[#5c56f1] uppercase tracking-[0.3em]">SMART CONTEXT</span>
          {chatHistory.length > 0 && <button onClick={clearHistory} className="text-[8px] font-black text-slate-400 hover:text-slate-900 uppercase transition">Limpiar</button>}
       </div>
       
       <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 hide-scrollbar bg-white">
          {chatHistory.length === 0 && (
             <div className="space-y-4 animate-in fade-in">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Refina el análisis estratégio compartiendo detalles del negocio.</p>
                <div className="flex flex-col gap-2">
                   {CONTEXT_QUESTIONS.map((q, i) => (
                     <button key={i} onClick={() => handleSendMessage(q.text)} className="text-[8px] font-black px-4 py-2.5 rounded-full border border-slate-100 bg-slate-50 hover:bg-[#5c56f1] hover:text-white transition-all uppercase text-slate-600 text-left flex items-center justify-between group shadow-sm">
                        <span className="flex-1 leading-tight">{q.text}</span>
                        <span className="text-sm group-hover:scale-110 transition-transform ml-2">{q.icon}</span>
                     </button>
                   ))}
                </div>
             </div>
          )}
          {chatHistory.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
               <div className={`max-w-[90%] p-3.5 rounded-2xl text-[11px] leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-[#5c56f1] text-white font-bold' : 'bg-slate-100 border border-slate-200 text-slate-700'}`}>
                  {m.text}
               </div>
            </div>
          ))}
          {isTyping && <div className="text-[8px] font-black text-[#5c56f1] uppercase tracking-widest animate-pulse">Consultor estratégico analizando...</div>}
          {isLiveActive && <div className="text-[8px] font-black text-red-500 uppercase tracking-widest animate-pulse text-center p-2 bg-red-50 rounded-xl border border-red-100">🎤 VOZ ACTIVA ESTRATEGIA</div>}
       </div>

       <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0">
          <div className="bg-white border border-slate-200 rounded-2xl p-1 flex items-center gap-1 group focus-within:border-[#5c56f1]/40 transition-all overflow-hidden shadow-inner">
             <button onClick={startLiveSession} className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isLiveActive ? 'bg-red-500 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-400'}`}>{isLiveActive ? '■' : '🎤'}</button>
             <input 
               type="text" value={inputText} onChange={(e) => setInputText(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
               placeholder="Define estrategia..." 
               className="flex-1 bg-transparent text-[11px] outline-none px-2 font-bold text-slate-900 placeholder:text-slate-300 min-w-0"
             />
             <button onClick={() => fileInputRef.current?.click()} className="w-8 h-8 text-slate-300 hover:text-slate-900 transition flex items-center justify-center">📎</button>
             <button onClick={() => handleSendMessage()} className="w-8 h-8 bg-[#5c56f1] text-white rounded-xl flex items-center justify-center transition-all hover:bg-[#4f46e5] active:scale-90 shadow-md shrink-0">➤</button>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if(f) handleSendMessage(`[Contexto adjunto: ${f.name}]`); }} />
       </div>
    </div>
  );
};

export default SmartContext;
