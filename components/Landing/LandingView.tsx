
import React, { useState, useEffect } from 'react';

interface Props {
  onStart: () => void;
}

const TESTIMONIALS = [
  { 
    q: "Reducción del 35% en Lead Time mediante automatización de flujos logísticos.", 
    a: "LOGÍSTICA & E-COMMERCE", 
    e: "Eficiencia Operativa", 
    icon: "📦" 
  },
  { 
    q: "Ahorro anual de $1.8M al eliminar procesos redundantes en la cadena de pago.", 
    a: "FINTECH & BANCA", 
    e: "Optimización Financiera", 
    icon: "🏦" 
  },
  { 
    q: "Incremento del 42% en la capacidad de entrega sin ampliar la nómina operativa.", 
    a: "RETAIL MULTICANAL", 
    e: "Escalabilidad de Procesos", 
    icon: "🛵" 
  },
  { 
    q: "Mitigación del 28% en riesgos operativos mediante visibilidad objetiva de excepciones.", 
    a: "MANUFACTURA INDUSTRIAL", 
    e: "Control de Calidad Digital", 
    icon: "⚙️" 
  },
  { 
    q: "Optimización del 25% en OPEX detectando cuellos de botella en tiempo real.", 
    a: "CONSUMO MASIVO", 
    e: "Excelencia Operacional", 
    icon: "🥤" 
  }
];

const FEATURES = [
  {
    title: "Mapeo Factual Automático",
    desc: "Transforma logs de ERP/CRM en modelos de procesos visuales sin sesgo humano.",
    icon: "🧬",
    label: "PROCESS MINING"
  },
  {
    title: "Generador de Decks IA",
    desc: "Crea presentaciones ejecutivas con diagnóstico y plan de acción en segundos.",
    icon: "💎",
    label: "GEN AI"
  },
  {
    title: "Cuantificación de ROI",
    desc: "Calcula el impacto financiero directo de cada ineficiencia detectada.",
    icon: "📈",
    label: "ROI ENGINE"
  },
  {
    title: "Smart Context Engine",
    desc: "Inyecta visión estratégica al análisis mediante contexto de negocio dinámico.",
    icon: "🧠",
    label: "BUSINESS INTELLIGENCE"
  },
  {
    title: "Métricas DORA & Lean",
    desc: "Evaluación técnica de Lead Time, Cycle Time y Waste (Muda) en tiempo real.",
    icon: "⚡",
    label: "KPI DASHBOARD"
  },
  {
    title: "Ciclos de Mejora 90 Días",
    desc: "Gestión proactiva de iniciativas con seguimiento de hitos y aprendizajes.",
    icon: "🗓️",
    label: "STRATEGY EXECUTION"
  }
];

const VALUES_URL = "https://reflect.site/g/ggjzqzb390loy9dmlguxzru6xahw2/reflects-values-9df387cfc54b48faa01229ed11630ae6";

// ID del video de referencia compartido por el usuario
const VIDEO_ID = "CostXs2p6r0";

const LandingView: React.FC<Props> = ({ onStart }) => {
  const [showVideo, setShowVideo] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden scroll-smooth bg-[#f8fafc] text-slate-900 font-sans selection:bg-[#5c56f1] selection:text-white flex flex-col">
      
      {/* MODAL DEMO (CON AUDIO) */}
      {showVideo && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-10 animate-in fade-in zoom-in duration-300">
          <div className="relative w-full max-w-6xl aspect-video bg-black rounded-[40px] overflow-hidden shadow-2xl border border-white/10">
            <button 
              onClick={() => setShowVideo(false)}
              className="absolute top-6 right-6 z-20 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all font-black border border-white/5"
            >
              ✕
            </button>
            {/* Iframe se carga solo cuando showVideo es true para evitar que se reproduzca en segundo plano al cerrar */}
            <iframe 
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&controls=1&rel=0&modestbranding=1`}
              title="GPS Demo Operativa"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <div className="relative min-h-screen flex flex-col overflow-hidden shrink-0" id="inicio">
        {/* BACKGROUND VIDEO (MUTED & COVER) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-slate-900">
          <div className="absolute inset-0 bg-slate-900/50 z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-transparent to-[#f8fafc] z-20"></div>
          
          {/* Contenedor responsivo para el video de fondo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full min-w-[177.77vh] min-h-[56.25vw]">
            <iframe 
              className="absolute top-0 left-0 w-full h-full object-cover"
              src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&disablekb=1&fs=0`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            ></iframe>
          </div>
        </div>

        <nav className="max-w-7xl mx-auto w-full px-8 py-8 flex justify-between items-center relative z-50">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => scrollToSection('inicio')}>
            <div className="w-10 h-10 bg-[#5c56f1] text-white rounded-2xl flex items-center justify-center font-black shadow-lg">G</div>
            <span className="text-xl font-black italic tracking-tighter uppercase text-white drop-shadow-md">GPS discovery</span>
          </div>
          <div className="hidden md:flex items-center gap-10">
            <button onClick={() => scrollToSection('funcionalidades')} className="text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-white transition drop-shadow-sm">Funcionalidades</button>
            <button onClick={() => scrollToSection('comparativa')} className="text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-white transition drop-shadow-sm">Comparativa</button>
            <button onClick={() => scrollToSection('precios')} className="text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-white transition drop-shadow-sm">Precios</button>
            <button onClick={onStart} className="px-8 py-3 bg-white border border-transparent text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all shadow-xl">Iniciar Análisis</button>
          </div>
        </nav>

        <header className="max-w-7xl mx-auto w-full px-8 flex-1 flex flex-col justify-center relative z-30 text-center lg:text-left py-20">
          <div className="max-w-5xl space-y-12">
            <div className="space-y-6">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-[10px] font-black text-[#a5b4fc] uppercase tracking-[0.4em] drop-shadow-sm">Análisis Lean + Process Mining</span>
              <h1 className="text-5xl md:text-[5.5rem] font-black italic uppercase tracking-tighter leading-[0.9] text-white drop-shadow-2xl">
                Revisión de procesos <br/> y ahorros en <br/> <span className="text-[#5c56f1] bg-white px-5 py-1 inline-block -skew-x-6 mt-2 shadow-2xl">ciclos cortos.</span>
              </h1>
              <p className="text-lg md:text-3xl font-black text-[#a5b4fc] uppercase tracking-tighter italic drop-shadow-lg leading-tight">
                Mapeo de procesos con IA en minutos mediante <span className="text-white underline decoration-[#5c56f1] decoration-4 underline-offset-4">datos cuantitativos y cualitativos</span>
              </p>
            </div>
            <p className="text-lg md:text-2xl font-medium text-slate-100 leading-relaxed max-w-4xl drop-shadow-lg">GPS Discovery transforma logs de eventos en modelos visuales. Elimina la subjetividad de las entrevistas para basar la toma de decisiones en hechos extraídos directamente de los sistemas de registro.</p>
            <div className="flex flex-wrap gap-6 pt-4 justify-center lg:justify-start">
              <button onClick={onStart} className="px-10 py-5 bg-[#5c56f1] text-white rounded-[24px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-indigo-900/40 hover:scale-105 active:scale-95 transition-all">Iniciar Análisis Gratis</button>
              <button onClick={() => setShowVideo(true)} className="px-10 py-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-[24px] font-black text-xs text-white uppercase tracking-[0.3em] hover:bg-white/20 shadow-sm transition-all flex items-center gap-3"><span className="text-lg">▶</span> Ver Demo Operativa</button>
            </div>
          </div>
        </header>
      </div>

      {/* FEATURES SECTION */}
      <section className="py-16 bg-white border-y border-slate-100" id="funcionalidades">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div className="space-y-3">
              <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-slate-900 leading-tight">Funcionalidades <span className="text-[#5c56f1]">Core</span></h2>
              <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Arquitectura diseñada para la excelencia operacional.</p>
            </div>
            <button onClick={onStart} className="text-[10px] font-black uppercase tracking-[0.4em] text-[#5c56f1] border-b-2 border-[#5c56f1] pb-1 hover:text-slate-900 hover:border-slate-900 transition-all">Explorar todas las herramientas →</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="group p-8 bg-slate-50 border border-slate-100 rounded-[40px] hover:bg-white hover:border-[#5c56f1]/20 hover:shadow-xl transition-all duration-500 flex flex-col">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm mb-6 group-hover:scale-110 group-hover:bg-[#5c56f1]/5 transition-all duration-500">
                  {f.icon}
                </div>
                <span className="text-[8px] font-black text-[#5c56f1] uppercase tracking-[0.4em] mb-2">{f.label}</span>
                <h3 className="text-lg font-black text-slate-900 mb-3 group-hover:text-[#5c56f1] transition-colors">{f.title}</h3>
                <p className="text-[12px] font-medium text-slate-500 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPACT & ALIGNED COMPARISON SECTION */}
      <section className="py-20 bg-white" id="comparativa">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-12 space-y-3">
             <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-slate-900">Análisis Comparativo</h2>
             <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Descubrimiento factual vs observación subjetiva</p>
          </div>
          
          <div className="relative border border-slate-200 rounded-[48px] overflow-hidden shadow-xl bg-white max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-10 md:p-14 bg-slate-50 flex flex-col items-center border-b lg:border-b-0 lg:border-r border-slate-200 group">
                 <div className="mb-10 text-center space-y-4">
                   <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm mx-auto grayscale group-hover:grayscale-0 transition-all">🐢</div>
                   <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Modelo Empírico</h3>
                 </div>
                 <div className="w-full max-w-xs space-y-8">
                    <div className="flex flex-col items-center text-center">
                       <p className="text-2xl font-black italic text-slate-400 uppercase group-hover:text-slate-900 transition-colors">Semanas</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Velocidad</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                       <p className="text-2xl font-black italic text-slate-400 uppercase group-hover:text-slate-900 transition-colors">Sesgo</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Naturaleza</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                       <p className="text-2xl font-black italic text-slate-400 uppercase group-hover:text-slate-900 transition-colors">Manual</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ejecución</p>
                    </div>
                 </div>
              </div>
              <div className="p-10 md:p-14 bg-[#5c56f1] flex flex-col items-center text-white relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                 <div className="mb-10 text-center space-y-4 relative z-10">
                   <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shadow-inner mx-auto animate-pulse">⚡</div>
                   <h3 className="text-[9px] font-black text-white/60 uppercase tracking-[0.4em]">Process Discovery</h3>
                 </div>
                 <div className="w-full max-w-xs space-y-8 relative z-10">
                    <div className="flex flex-col items-center text-center">
                       <p className="text-2xl font-black italic text-white uppercase tracking-tighter">Minutos</p>
                       <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1">Velocidad</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                       <p className="text-2xl font-black italic text-white uppercase tracking-tighter">Factual</p>
                       <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1">Naturaleza</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                       <p className="text-2xl font-black italic text-white uppercase tracking-tighter">Automático</p>
                       <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1">Ejecución</p>
                    </div>
                 </div>
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex w-14 h-14 bg-white rounded-full items-center justify-center border-4 border-slate-100 shadow-xl z-20">
              <span className="text-xs font-black italic uppercase text-[#5c56f1]">VS</span>
            </div>
          </div>
        </div>
      </section>

      {/* PLANES DE SERVICIO - PERFECTLY ALIGNED */}
      <section className="py-24 bg-slate-900 overflow-hidden relative shrink-0" id="precios">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(92,86,241,0.1),transparent)] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-white text-3xl md:text-5xl font-black italic uppercase tracking-tighter">
              Revisión de procesos y ahorros en <span className="text-[#5c56f1]">ciclos cortos.</span>
            </h2>
            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.5em]">Escalabilidad desde exploración básica a diagnóstico ilimitado.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border border-white/10 rounded-[48px] overflow-hidden bg-white/5 backdrop-blur-sm shadow-2xl items-stretch">
            {/* PLAN FREE */}
            <div className="p-12 md:p-16 flex flex-col border-b lg:border-b-0 lg:border-r border-white/5 hover:bg-white/[0.02] transition-colors h-full">
              <div className="flex justify-between items-start mb-10 min-h-[80px]">
                <div className="space-y-1">
                  <h3 className="text-white text-3xl font-black italic uppercase tracking-tighter">Plan Free</h3>
                  <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Diagnóstico Básico</p>
                </div>
                <p className="text-white text-4xl font-black italic">$0</p>
              </div>
              
              <div className="space-y-5 flex-grow">
                {["Visualización de Datasets Demo", "Mapa de Flujo Estándar", "Métricas DORA base", "Soporte IA via Chat"].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-emerald-500 font-black text-lg">✓</span>
                    <span className="text-slate-300 text-[11px] font-bold uppercase tracking-wider opacity-80">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-12">
                <button onClick={onStart} className="w-full py-5 bg-white/10 text-white border border-white/20 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/20 transition-all">Acceso Inmediato</button>
              </div>
            </div>

            {/* PLAN PLUS */}
            <div className="p-12 md:p-16 flex flex-col bg-[#5c56f1]/10 relative overflow-hidden group h-full">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#5c56f1]/20 blur-[100px] rounded-full -mr-32 -mt-32"></div>
              
              <div className="flex justify-between items-start relative z-10 mb-10 min-h-[80px]">
                <div className="space-y-1">
                  <h3 className="text-white text-3xl font-black italic uppercase tracking-tighter">Plan Plus</h3>
                  <p className="text-[#a5b4fc] text-[10px] font-black uppercase tracking-widest">IA & Reportes Ejecutivos</p>
                </div>
                <div className="text-right">
                  <p className="text-white text-4xl font-black italic">$99</p>
                  <p className="text-white/40 text-[7px] font-black uppercase tracking-widest">USD/MES FACT. ANUAL</p>
                </div>
              </div>

              <div className="space-y-5 relative z-10 flex-grow">
                {["Carga de CSV Ilimitada", "Reportes IA Automáticos", "Smart Context Estratégico", "Conectores SAP/Salesforce", "Certificación SOC2"].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-white font-black text-lg">✓</span>
                    <span className="text-white text-[11px] font-black uppercase tracking-wider">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-12 relative z-10">
                <button onClick={onStart} className="w-full py-5 bg-[#5c56f1] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-xl shadow-indigo-900/40 hover:scale-[1.02] transition-all">Actualizar a Plus</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 text-center relative overflow-hidden bg-white shrink-0">
        <div className="absolute inset-0 bg-indigo-500/5 blur-[120px] rounded-full translate-y-32"></div>
        <div className="max-w-6xl mx-auto px-8 relative z-10 space-y-10">
           <h2 className="text-3xl md:text-5xl lg:text-6xl font-black italic uppercase tracking-tighter text-slate-900 leading-tight">
             Inicie el diagnóstico mediante el <br/> <span className="text-[#5c56f1]">gemelo digital de sus procesos.</span>
           </h2>
           <div className="flex flex-col md:flex-row justify-center items-center gap-6">
              <button onClick={onStart} className="px-10 py-5 bg-[#5c56f1] text-white rounded-[24px] font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-indigo-100 hover:scale-105 transition-all">Iniciar Análisis Gratis</button>
              <button onClick={() => setShowVideo(true)} className="px-10 py-5 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.4em] hover:scale-105 transition-all">Ver Demo Técnica</button>
           </div>
        </div>
      </section>

      {/* REFINED ALIGNED FOOTER */}
      <footer className="mt-auto bg-white border-t border-slate-100 py-12 shrink-0">
         <div className="max-w-7xl mx-auto px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-0">
               {/* Brand Column */}
               <div className="flex flex-col items-center md:items-start space-y-3">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('inicio')}>
                    <div className="w-8 h-8 bg-[#5c56f1] text-white rounded-xl flex items-center justify-center font-black">G</div>
                    <span className="text-lg font-black italic uppercase text-slate-900 tracking-tighter">GPS discovery</span>
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center md:text-left">Análisis factual de procesos.</p>
               </div>

               {/* Links Column - Perfectly aligned row */}
               <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                  <button onClick={() => scrollToSection('comparativa')} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-[#5c56f1] transition-colors">Comparativa</button>
                  <button onClick={() => scrollToSection('funcionalidades')} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-[#5c56f1] transition-colors">Funcionalidades</button>
                  <button onClick={() => scrollToSection('precios')} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-[#5c56f1] transition-colors">Precios</button>
                  <a href={VALUES_URL} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-[#5c56f1] transition-colors">Valores</a>
               </div>
            </div>

            {/* Bottom bar */}
            <div className="mt-12 pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
               <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">© 2025 GPS Process Discovery. All rights reserved.</p>
               <div className="flex items-center gap-4 opacity-40">
                  <span className="text-[8px] font-black text-slate-300 uppercase">Privacy Policy</span>
                  <span className="text-[8px] font-black text-slate-300 uppercase">Terms of Service</span>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default LandingView;
