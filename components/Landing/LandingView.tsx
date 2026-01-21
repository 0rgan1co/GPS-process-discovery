
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

const VALUES_URL = "https://reflect.site/g/ggjzqzb390loy9dmlguxzru6xahw2/reflects-values-9df387cfc54b48faa01229ed11630ae6";

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
    <div className="h-full overflow-y-auto overflow-x-hidden scroll-smooth bg-[#f8fafc] text-slate-900 font-sans selection:bg-[#5c56f1] selection:text-white">
      
      {/* MODAL DEMO */}
      {showVideo && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-[40px] overflow-hidden shadow-2xl border border-white/10">
            <button 
              onClick={() => setShowVideo(false)}
              className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all font-black"
            >
              ✕
            </button>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-6">
               <div className="w-24 h-24 bg-[#5c56f1] rounded-full flex items-center justify-center animate-pulse shadow-[0_0_50px_rgba(92,86,241,0.5)]">
                  <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2"></div>
               </div>
               <div className="space-y-2 px-8">
                  <h3 className="text-white text-3xl font-black italic uppercase tracking-tighter">Diagnóstico Operativo</h3>
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Mapeo de procesos basado en logs de eventos</p>
               </div>
               <iframe 
                className="absolute inset-0 w-full h-full opacity-0 pointer-events-none" 
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" 
                title="GPS Demo"
               ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <div className="relative min-h-[95vh] flex flex-col overflow-hidden" id="inicio">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/60 z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-transparent to-[#f8fafc] z-20"></div>
          <video autoPlay muted loop playsInline className="w-full h-full object-cover scale-105">
            <source src="https://assets.mixkit.co/videos/preview/mixkit-futuristic-technology-digital-interface-background-animation-41054-large.mp4" type="video/mp4" />
          </video>
        </div>

        <nav className="max-w-7xl mx-auto w-full px-8 py-8 flex justify-between items-center relative z-50">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => scrollToSection('inicio')}>
            <div className="w-10 h-10 bg-[#5c56f1] text-white rounded-2xl flex items-center justify-center font-black shadow-lg">G</div>
            <span className="text-xl font-black italic tracking-tighter uppercase text-white">GPS discovery</span>
          </div>
          <div className="hidden md:flex items-center gap-10">
            <button onClick={() => scrollToSection('funcionalidades')} className="text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-white transition">Funcionalidades</button>
            <button onClick={() => scrollToSection('precios')} className="text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-white transition">Precios</button>
            <button onClick={onStart} className="px-8 py-3 bg-white border border-transparent text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all shadow-xl">Iniciar Análisis</button>
          </div>
        </nav>

        <header className="max-w-7xl mx-auto w-full px-8 flex-1 flex flex-col justify-center relative z-30 text-center lg:text-left py-20">
          <div className="max-w-5xl space-y-12">
            <div className="space-y-6">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-[10px] font-black text-[#a5b4fc] uppercase tracking-[0.4em]">Análisis Lean + Process Mining</span>
              <h1 className="text-5xl md:text-[5.5rem] font-black italic uppercase tracking-tighter leading-[0.9] text-white">
                Diagnóstico de procesos <br/> y cuantificación de ahorros <br/> con <span className="text-[#5c56f1] bg-white px-5 py-1 inline-block -skew-x-6 mt-2">ROI proyectado.</span>
              </h1>
              <p className="text-lg md:text-3xl font-black text-[#a5b4fc] uppercase tracking-tighter italic drop-shadow-lg leading-tight">
                Mapeo automático en <span className="text-white underline decoration-[#5c56f1] decoration-4 underline-offset-4">minutos</span> mediante evidencia digital objetiva.
              </p>
            </div>
            <p className="text-lg md:text-2xl font-medium text-slate-200 leading-relaxed max-w-4xl drop-shadow-md">GPS Discovery transforma logs de eventos en modelos visuales. Elimina la subjetividad de las entrevistas para basar la toma de decisiones en hechos extraídos directamente de los sistemas de registro.</p>
            <div className="flex flex-wrap gap-6 pt-4 justify-center lg:justify-start">
              <button onClick={onStart} className="px-10 py-5 bg-[#5c56f1] text-white rounded-[24px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-indigo-900/40 hover:scale-105 active:scale-95 transition-all">Iniciar Análisis Gratis</button>
              <button onClick={() => setShowVideo(true)} className="px-10 py-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-[24px] font-black text-xs text-white uppercase tracking-[0.3em] hover:bg-white/20 shadow-sm transition-all flex items-center gap-3"><span className="text-lg">▶</span> Ver Demo Operativa</button>
            </div>
          </div>
        </header>
      </div>

      {/* MITO VS REALIDAD / FUNCIONALIDADES */}
      <section className="py-24 max-w-7xl mx-auto px-8 relative overflow-hidden" id="funcionalidades">
        <div className="text-center mb-20 space-y-4">
           <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-slate-900 leading-tight">Análisis Comparativo</h2>
           <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Brecha técnica entre observación empírica y descubrimiento factual.</p>
        </div>
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-0 border border-slate-200 rounded-[64px] overflow-hidden shadow-2xl bg-white min-h-[600px]">
          
          <div className="p-16 md:p-24 bg-slate-50 flex flex-col items-center text-center space-y-12 border-b lg:border-b-0 lg:border-r border-slate-200 group flex-1">
             <div className="space-y-6">
               <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center text-5xl shadow-sm mx-auto grayscale group-hover:grayscale-0 transition-all duration-700">🐢</div>
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Modelo Empírico</h3>
             </div>
             
             <div className="grid grid-cols-1 gap-12 w-full max-w-sm">
                <div className="h-24 flex flex-col justify-center space-y-3">
                   <p className="text-3xl md:text-4xl font-black italic text-slate-400 uppercase tracking-tighter group-hover:text-slate-900 transition-colors duration-500">Semanas</p>
                   <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Talleres Presenciales</p>
                </div>
                <div className="h-24 flex flex-col justify-center space-y-3">
                   <p className="text-3xl md:text-4xl font-black italic text-slate-400 uppercase tracking-tighter group-hover:text-slate-900 transition-colors duration-500">Sesgo</p>
                   <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Percepción Individual</p>
                </div>
                <div className="h-24 flex flex-col justify-center space-y-3">
                   <p className="text-3xl md:text-4xl font-black italic text-slate-400 uppercase tracking-tighter group-hover:text-slate-900 transition-colors duration-500">Estático</p>
                   <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Documentación Obsoleta</p>
                </div>
             </div>
          </div>

          <div className="p-16 md:p-24 bg-[#5c56f1] flex flex-col items-center text-center space-y-12 relative overflow-hidden group flex-1">
             <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-[120px] rounded-full -mr-40 -mt-40"></div>
             <div className="space-y-6 relative z-10">
               <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-[32px] flex items-center justify-center text-5xl shadow-inner mx-auto animate-pulse">⚡</div>
               <h3 className="text-[10px] font-black text-white/60 uppercase tracking-[0.5em]">Process Discovery</h3>
             </div>

             <div className="grid grid-cols-1 gap-12 w-full max-w-sm relative z-10">
                <div className="h-24 flex flex-col justify-center space-y-3">
                   <p className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter drop-shadow-sm">Minutos</p>
                   <p className="text-[11px] font-black text-white/50 uppercase tracking-[0.3em]">Generación Automática</p>
                </div>
                <div className="h-24 flex flex-col justify-center space-y-3">
                   <p className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter drop-shadow-sm">Factual</p>
                   <p className="text-[11px] font-black text-white/50 uppercase tracking-[0.3em]">Datos de Sistema</p>
                </div>
                <div className="h-24 flex flex-col justify-center space-y-3">
                   <p className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter drop-shadow-sm">Dinámico</p>
                   <p className="text-[11px] font-black text-white/50 uppercase tracking-[0.3em]">Análisis Continuo</p>
                </div>
             </div>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex w-24 h-24 bg-white rounded-full items-center justify-center border-8 border-slate-50 shadow-2xl z-20">
            <span className="text-xl font-black italic uppercase tracking-tighter text-[#5c56f1]">VS</span>
          </div>
        </div>
      </section>

      {/* PLANES DE SERVICIO */}
      <section className="py-24 bg-slate-900 overflow-hidden relative" id="precios">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(92,86,241,0.1),transparent)] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-white text-4xl md:text-6xl font-black italic uppercase tracking-tighter">Acceso a la <span className="text-[#5c56f1]">Verdad Operativa</span></h2>
            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.5em]">Escalabilidad desde exploración básica a diagnóstico ilimitado.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border border-white/10 rounded-[48px] overflow-hidden bg-white/5 backdrop-blur-sm shadow-2xl">
            {/* PLAN FREE */}
            <div className="p-12 md:p-16 space-y-10 border-b lg:border-b-0 lg:border-r border-white/5 hover:bg-white/[0.02] transition-colors">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-white text-3xl font-black italic uppercase tracking-tighter">Plan Free</h3>
                  <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Diagnóstico Básico</p>
                </div>
                <p className="text-white text-4xl font-black italic">$0</p>
              </div>
              
              <div className="space-y-5">
                {[
                  "Visualización de Datasets Demo",
                  "Mapa de Flujo Estándar",
                  "Métricas DORA base",
                  "Soporte IA via Chat"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-emerald-500 font-black text-lg">✓</span>
                    <span className="text-slate-300 text-[11px] font-bold uppercase tracking-wider opacity-80">{item}</span>
                  </div>
                ))}
              </div>

              <button onClick={onStart} className="w-full py-5 bg-white/10 text-white border border-white/20 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/20 transition-all">Acceso Inmediato</button>
            </div>

            {/* PLAN PLUS */}
            <div className="p-12 md:p-16 space-y-10 bg-[#5c56f1]/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#5c56f1]/20 blur-[100px] rounded-full -mr-32 -mt-32"></div>
              
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1">
                  <h3 className="text-white text-3xl font-black italic uppercase tracking-tighter">Plan Plus</h3>
                  <p className="text-[#a5b4fc] text-[10px] font-black uppercase tracking-widest">IA & Reportes Ejecutivos</p>
                </div>
                <div className="text-right">
                  <p className="text-white text-4xl font-black italic">$99</p>
                  <p className="text-white/40 text-[7px] font-black uppercase tracking-widest">USD/MES FACT. ANUAL</p>
                </div>
              </div>

              <div className="space-y-5 relative z-10">
                {[
                  "Carga de CSV Ilimitada",
                  "Reportes IA Automáticos",
                  "Smart Context Estratégico",
                  "Conectores SAP/Salesforce",
                  "Certificación SOC2"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-white font-black text-lg">✓</span>
                    <span className="text-white text-[11px] font-black uppercase tracking-wider">{item}</span>
                  </div>
                ))}
              </div>

              <button onClick={onStart} className="w-full py-5 bg-[#5c56f1] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-xl shadow-indigo-900/40 hover:scale-[1.02] transition-all relative z-10">Actualizar a Plus</button>
            </div>
          </div>
          
          <div className="mt-12 text-center space-y-6" id="social-proof">
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.3em] leading-relaxed">
              Basado en principios de transparencia operativa y confiabilidad de datos.
            </p>
            <a href={VALUES_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[#5c56f1] hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors group">
              Transparencia Institucional <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 text-center relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-indigo-500/5 blur-[120px] rounded-full translate-y-32"></div>
        <div className="max-w-6xl mx-auto px-8 relative z-10 space-y-12">
           <h2 className="text-3xl md:text-6xl lg:text-7xl font-black italic uppercase tracking-tighter text-slate-900 leading-[0.9]">
             Inicie el diagnóstico mediante el <br/> <span className="text-[#5c56f1]">gemelo digital de sus procesos.</span>
           </h2>
           <div className="flex flex-col md:flex-row justify-center items-center gap-6">
              <button onClick={onStart} className="px-12 py-6 bg-[#5c56f1] text-white rounded-[32px] font-black text-sm uppercase tracking-[0.4em] shadow-2xl shadow-indigo-200 hover:scale-105 transition-all">Iniciar Análisis Gratis</button>
              <button onClick={() => setShowVideo(true)} className="px-12 py-6 bg-slate-900 text-white rounded-[32px] font-black text-sm uppercase tracking-[0.4em] hover:scale-105 transition-all">Ver Demo Técnica</button>
           </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 bg-slate-50 border-t border-slate-200">
         <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-6">
               <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('inicio')}>
                 <div className="w-8 h-8 bg-[#5c56f1] text-white rounded-xl flex items-center justify-center font-black">G</div>
                 <span className="text-lg font-black italic uppercase text-slate-900">GPS discovery</span>
               </div>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">Descubrimiento de procesos basado en evidencia digital.</p>
            </div>
            <div className="md:col-span-3 flex justify-end gap-10">
               <a href={VALUES_URL} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#5c56f1]">Valores</a>
               <button onClick={() => scrollToSection('precios')} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#5c56f1]">Precios</button>
               <button onClick={() => scrollToSection('funcionalidades')} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#5c56f1]">Funcionalidades</button>
            </div>
         </div>
         <div className="max-w-7xl mx-auto px-8 mt-20 pt-8 border-t border-slate-200 text-center">
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em]">© 2025 GPS Process Discovery. Análisis Factual de Procesos.</p>
         </div>
      </footer>
    </div>
  );
};

export default LandingView;
