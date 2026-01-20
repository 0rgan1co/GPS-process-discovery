
import React from 'react';
import { ChatMessage } from '../../types';

const SUPPORT_SUGGESTIONS = [
  { text: "¿Cómo cargar un CSV?", icon: "📄" },
  { text: "¿Qué significan los grosores?", icon: "↕️" },
  { text: "¿Cómo exportar a PDF?", icon: "📥" }
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

const SupportAI: React.FC<Props> = ({
  chatHistory, inputText, setInputText, isTyping, isLiveActive,
  handleSendMessage, startLiveSession, scrollRef, fileInputRef, clearHistory
}) => {
  return (
    <div className="flex-1 flex flex-col bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm relative min-h-0">
       <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
          <span className="text-[9px] font-black text-[#5c56f1] uppercase tracking-[0.3em]">SOPORTE IA</span>
          {chatHistory.length > 0 && <button onClick={clearHistory} className="text-[8px] font-black text-slate-300 hover:text-slate-900 uppercase transition">Limpiar</button>}
       </div>
       
       <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 hide-scrollbar">
          {chatHistory.length === 0 && (
             <div className="space-y-4 animate-in fade-in">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Aprende a utilizar la herramienta consultando sobre funciones y carga de datos.</p>
                <div className="flex flex-col gap-2">
                   {SUPPORT_SUGGESTIONS.map((s, i) => (
                     <button key={i} onClick={() => handleSendMessage(s.text)} className="text-[8px] font-black px-4 py-2.5 rounded-full border border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-500 transition-all text-left uppercase flex items-center justify-between group">
                        <span className="flex-1 leading-tight">{s.text}</span>
                        <span className="text-sm group-hover:scale-110 transition-transform ml-2">{s.icon}</span>
                     </button>
                   ))}
                </div>
             </div>
          )}
          {chatHistory.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
               <div className={`max-w-[90%] p-3.5 rounded-2xl text-[11px] leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-[#5c56f1] text-white font-bold' : 'bg-slate-50 border border-slate-100 text-slate-600'}`}>
                  {m.text}
               </div>
            </div>
          ))}
          {isTyping && <div className="text-[8px] font-black text-[#5c56f1] uppercase tracking-widest animate-pulse">Soporte IA procesando...</div>}
       </div>

       <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0">
         <div className="bg-white border border-slate-200 rounded-2xl p-1 flex items-center gap-1 group focus-within:border-[#5c56f1]/40 transition-all overflow-hidden shadow-sm">
            <button onClick={startLiveSession} className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isLiveActive ? 'bg-red-500 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-400'}`}>{isLiveActive ? '■' : '🎤'}</button>
            <input 
              type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} 
              placeholder="Pregunta soporte..." 
              className="flex-1 bg-transparent text-[11px] outline-none px-2 font-bold text-slate-900 placeholder:text-slate-300 min-w-0" 
            />
            <button onClick={() => handleSendMessage()} className="w-8 h-8 bg-[#5c56f1] text-white rounded-xl flex items-center justify-center transition-all hover:bg-[#4f46e5] active:scale-90 shrink-0">➤</button>
         </div>
       </div>
    </div>
  );
};

export default SupportAI;
