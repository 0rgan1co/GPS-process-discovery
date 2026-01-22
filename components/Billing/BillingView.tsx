
import React from 'react';

interface Props {
  onBack: () => void;
}

const BillingView: React.FC<Props> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#0c0c0e] text-slate-300 font-sans flex animate-in fade-in duration-700 selection:bg-[#8b5cf6]/30">
      
      {/* SIDEBAR IZQUIERDA (Configuración de Cuenta) */}
      <aside className="w-72 border-r border-white/5 p-8 flex flex-col gap-12 shrink-0">
        <button 
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-full transition-all text-xl mb-2 text-slate-400 hover:text-white"
        >
          ←
        </button>

        <div className="space-y-10">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-3">Personal settings</h3>
            <nav className="flex flex-col gap-0.5">
              {['Profile', 'Connections', 'Note Templates', 'Prompt Templates'].map(item => (
                <button key={item} className="text-left px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                  {item}
                </button>
              ))}
              <button className="text-left px-3 py-2 rounded-xl text-sm font-bold text-[#a78bfa] bg-[#8b5cf6]/10 border border-[#8b5cf6]/10 shadow-[inset_0_0_20px_rgba(139,92,246,0.05)]">
                Billing
              </button>
            </nav>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center px-3">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Graphs</h3>
              <button className="text-slate-500 hover:text-white transition-colors text-lg font-light">+</button>
            </div>
            <button className="flex items-center gap-3 px-3 py-2 w-full text-left hover:bg-white/5 rounded-xl transition-all group">
              <div className="w-3 h-3 bg-orange-500 rounded-[3px] shadow-[0_0_10px_rgba(249,115,22,0.3)]"></div>
              <span className="text-sm font-medium text-slate-400 group-hover:text-white transition-colors">gps_main_graph</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto hide-scrollbar selection:bg-[#8b5cf6]/30">
        <div className="max-w-7xl mx-auto px-12 lg:px-24 py-20 lg:py-32 grid grid-cols-1 xl:grid-cols-12 gap-24 items-start">
          
          {/* COLUMNA CENTRAL: CARD DE SUSCRIPCIÓN */}
          <div className="xl:col-span-5 flex flex-col gap-10">
            <div className="bg-[#141417] border border-white/5 rounded-[40px] p-12 space-y-10 shadow-[0_40px_100px_rgba(0,0,0,0.4)] relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#8b5cf6]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-black text-white tracking-tight">Your GPS Plan</h2>
                <p className="text-[#a78bfa] text-[10px] font-black uppercase tracking-[0.3em]">
                  0 days left <span className="text-slate-600 font-bold ml-1">on your free trial</span>
                </p>
              </div>

              <div className="flex items-baseline justify-center gap-3 py-4">
                <span className="text-6xl font-black text-white tracking-tighter">$10</span>
                <div className="text-left space-y-0.5">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-tight">USD / month</p>
                  <p className="text-[11px] font-bold text-slate-600 uppercase tracking-tighter">Billed yearly ($120)</p>
                </div>
              </div>

              <button className="w-full py-5 bg-[#8b5cf6] hover:bg-[#9366ff] text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl shadow-[0_20px_40px_rgba(139,92,246,0.2)] hover:shadow-[0_20px_50px_rgba(139,92,246,0.3)] hover:-translate-y-0.5 transition-all active:scale-[0.98]">
                Subscribe to GPS Discovery
              </button>

              <div className="space-y-6 pt-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-white/5 pb-4">What's included:</h4>
                <ul className="space-y-4">
                  {[
                    "AI Analysis (Advanced Process Mining)",
                    "Unlimited CSV uploads & real-time logs",
                    "Executive Deck Generation",
                    "End-to-end encryption",
                    "Offline Data Processing",
                    "Multi-user collaboration",
                    "Priority support via Live Audio"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-4 text-[13px] font-semibold text-slate-300">
                      <span className="text-emerald-500 font-black">✓</span>
                      {feature}
                    </li>
                  ))}
                  <li className="flex items-center gap-4 text-[13px] font-semibold text-slate-300">
                    <span className="text-amber-500">✨</span>
                    And more! See what we've recently <span className="underline decoration-[#8b5cf6] decoration-2 underline-offset-4 cursor-pointer hover:text-white transition-colors">released</span>.
                  </li>
                </ul>
              </div>
            </div>

            {/* TESTIMONIAL (Inspirado en la imagen) */}
            <div className="flex flex-col gap-6 max-w-sm ml-4">
               <p className="text-slate-400 text-sm leading-relaxed font-medium italic">
                "Generar un diagnóstico operativo y proyecciones de ahorro con la integración de IA de GPS Discovery me hizo sentir que tengo superpoderes."
               </p>
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-slate-800 rounded-full overflow-hidden border border-white/10 p-0.5 shadow-xl">
                    <img className="w-full h-full rounded-full object-cover" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Riccardo" alt="User" />
                 </div>
                 <div className="flex flex-col">
                   <span className="text-sm font-bold text-white tracking-tight">Riccardo</span>
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">COO @ TechLogistics</span>
                 </div>
               </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: NOTA EDITORIAL (Humanización) */}
          <div className="xl:col-span-7 space-y-12 py-6">
            <h3 className="text-2xl font-semibold text-white tracking-tight">Hola Jorge,</h3>
            
            <div className="space-y-8 text-slate-400 leading-relaxed text-[17px] font-medium max-w-2xl">
              <p>Gracias por considerar escalar con GPS Discovery.</p>
              
              <p>Somos un equipo indie distribuido por todo el mundo. Nuestra misión es mejorar la forma en que las personas toman decisiones operativas al construir la mejor aplicación de <span className="text-white font-bold italic">descubrimiento factual</span> del mercado.</p>
              
              <p>Uno de nuestros <span className="text-white border-b border-white/20 pb-0.5 cursor-pointer hover:text-[#8b5cf6] hover:border-[#8b5cf6] transition-all">valores</span> es la confiabilidad. No solo en términos de tiempo de actividad del servidor, sino en el servicio mismo. Demasiadas empresas recaudan capital de riesgo, crecen de manera insostenible y terminan cerrando. Nosotros no. Simplemente queremos construir un negocio sostenible a largo plazo.</p>
              
              <p>Piensa en comprar GPS Discovery menos como una suscripción y más como una inversión. Cada día nuestro equipo trabaja para que el análisis de tus datos sea un poco mejor.</p>
              
              <p className="pt-4">Gracias,<br/><span className="text-white font-bold text-lg">Alex.</span></p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default BillingView;
