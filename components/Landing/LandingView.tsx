
import React from 'react';

interface Props {
  onStart: () => void;
}

const LandingView: React.FC<Props> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 overflow-x-hidden selection:bg-[#5c56f1] selection:text-white">
      {/* Header */}
      <nav className="max-w-7xl mx-auto px-8 py-10 flex justify-between items-center relative z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#5c56f1] text-white rounded-2xl flex items-center justify-center font-black shadow-lg">G</div>
          <span className="text-xl font-black italic tracking-tighter uppercase">GPS discovery</span>
        </div>
        <button 
          onClick={onStart}
          className="px-8 py-3.5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
        >
          Iniciar Análisis
        </button>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 pt-20 pb-40 relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#5c56f1]/5 blur-[150px] rounded-full -mr-40 -mt-20 -z-10"></div>
        
        <div className="max-w-3xl space-y-10">
          <div className="space-y-4">
            <span className="text-[12px] font-black text-[#5c56f1] uppercase tracking-[0.5em] block">Process Mining de Próxima Generación</span>
            <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-[0.95] text-slate-900">
              Desbloquea la Eficiencia <br/> <span className="text-[#5c56f1]">End-to-End</span>
            </h1>
          </div>
          <p className="text-xl font-medium text-slate-500 leading-relaxed max-w-2xl">
            Transforma los datos de tus sistemas en un mapa vivo de la realidad operativa de tu empresa. Identifica fugas de capital, cuellos de botella y genera reportes ejecutivos con IA en segundos.
          </p>
          <div className="flex gap-6 pt-4">
            <button 
              onClick={onStart}
              className="px-10 py-5 bg-[#5c56f1] text-white rounded-[24px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-indigo-200 hover:scale-105 active:scale-95 transition-all"
            >
              Comenzar ahora
            </button>
            <button className="px-10 py-5 bg-white border border-slate-200 rounded-[24px] font-black text-xs text-slate-400 uppercase tracking-[0.3em] hover:text-slate-900 hover:border-slate-300 transition-all">
              Ver Demo
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-3 gap-10 pt-40">
          <div className="bg-white p-12 rounded-[48px] border border-slate-200 shadow-sm space-y-6 hover:shadow-2xl transition-all group">
            <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🗺️</div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter">Discovery Dinámico</h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">Reconstruye procesos reales desde logs de eventos sin sesgos humanos.</p>
          </div>
          <div className="bg-white p-12 rounded-[48px] border border-slate-200 shadow-sm space-y-6 hover:shadow-2xl transition-all group">
            <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🧠</div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter">IA Estratégica</h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">Motor de inteligencia que genera presentaciones ejecutivas de ROI listas para gerencia.</p>
          </div>
          <div className="bg-white p-12 rounded-[48px] border border-slate-200 shadow-sm space-y-6 hover:shadow-2xl transition-all group">
            <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">⚡</div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter">Ciclos de 90 Días</h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">Metodología ágil integrada para gestionar iniciativas y medir logros en tiempo récord.</p>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="bg-white border-y border-slate-200 py-32">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-tight">
              El Método <span className="text-[#5c56f1]">GPS</span> para la Transformación
            </h2>
            <div className="space-y-12">
              <div className="flex gap-8">
                <div className="text-4xl font-black text-slate-100">01</div>
                <div className="space-y-2">
                  <h4 className="text-lg font-black uppercase tracking-widest text-slate-900">Ingesta & Limpieza</h4>
                  <p className="text-slate-500 font-medium">Carga tus logs y nuestra IA normaliza la estructura Case ID.</p>
                </div>
              </div>
              <div className="flex gap-8">
                <div className="text-4xl font-black text-slate-100">02</div>
                <div className="space-y-2">
                  <h4 className="text-lg font-black uppercase tracking-widest text-slate-900">Diagnóstico IA</h4>
                  <p className="text-slate-500 font-medium">Analizamos cuellos de botella y fugas de eficiencia automáticamente.</p>
                </div>
              </div>
              <div className="flex gap-8">
                <div className="text-4xl font-black text-slate-100">03</div>
                <div className="space-y-2">
                  <h4 className="text-lg font-black uppercase tracking-widest text-slate-900">Gestión de Impacto</h4>
                  <p className="text-slate-500 font-medium">Define iniciativas en ciclos cortos y escala tus resultados.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-[56px] aspect-square flex items-center justify-center relative overflow-hidden group shadow-inner">
             <div className="absolute inset-0 bg-gradient-to-tr from-[#5c56f1]/10 to-transparent"></div>
             <div className="text-[120px] filter drop-shadow-2xl group-hover:scale-110 transition-transform duration-700">🚀</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 max-w-7xl mx-auto px-8 text-center space-y-8">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter">¿Listo para rediseñar tu operación?</h2>
        <button 
          onClick={onStart}
          className="px-12 py-6 bg-slate-900 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.4em] hover:bg-[#5c56f1] transition-all"
        >
          Iniciar Análisis Gratis
        </button>
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest pt-10">© 2025 GPS PROCESS DISCOVERY · ALL RIGHTS RESERVED</p>
      </footer>
    </div>
  );
};

export default LandingView;
