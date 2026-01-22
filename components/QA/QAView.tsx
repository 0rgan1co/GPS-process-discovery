
import React, { useState, useEffect } from 'react';
import { saveScenarioFeedback } from '../../lib/supabase';

interface Scenario {
  id: string;
  level: string;
  tag: string;
  title: string;
  status: 'passing' | 'failing' | 'pending';
  priority: 'P0' | 'P1' | 'P2';
  gherkin: string[];
  stability: number; // 0-100%
  lastRun: string;
  businessImpact: string; // ELI10
  acceptanceCriteria: string[];
  automatedTests: string[];
  recommendations: string[];
  error?: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "1.1",
    level: "Nivel 1: Process Mining",
    tag: "Factual Mapping",
    title: "Carga de logs ERP/CRM",
    status: 'passing',
    priority: 'P0',
    stability: 98,
    lastRun: "Hace 2 min",
    businessImpact: "Si falla, el cliente no puede ver sus datos. Pérdida total de servicio.",
    acceptanceCriteria: [
      "Soporte para logs SAP, Salesforce y Oracle",
      "Procesamiento automático sin intervención manual",
      "Validación de estructura de datos CSV en tiempo real"
    ],
    automatedTests: [
      "ProcessMiningTests.validateCSVParsing()",
      "ProcessMiningTests.testIntegrationSAP()"
    ],
    recommendations: [
      "Mantener el servicio P0 monitoreado 24/7.",
      "Optimizar el motor de parsing para archivos > 1GB."
    ],
    gherkin: [
      "GIVEN tengo logs de sistema ERP/CRM en formato CSV",
      "WHEN cargo el archivo en la plataforma",
      "THEN el sistema procesa los logs automáticamente",
      "AND genera modelo de proceso visual sin sesgo humano"
    ]
  },
  {
    id: "3.1",
    level: "Nivel 3: ROI Engine",
    tag: "Financial Impact",
    title: "Cálculo Automático de ROI",
    status: 'passing',
    priority: 'P0',
    stability: 95,
    lastRun: "Hace 5 min",
    businessImpact: "Afecta la credibilidad comercial. No se puede justificar el ahorro.",
    acceptanceCriteria: [
      "Cálculo específico por cada ineficiencia detectada",
      "Metodología de cálculo transparente y editable",
      "Documentación de supuestos de ahorro"
    ],
    automatedTests: [
      "ROIEngineTests.testROIPrecision()",
      "ROIEngineTests.testEditableAssumptions()"
    ],
    recommendations: [
      "Validar fórmulas con el departamento financiero periódicamente.",
      "Añadir visualización de 'Timeline de Recuperación'."
    ],
    gherkin: [
      "GIVEN he identificado ineficiencias en el proceso",
      "WHEN accedo al ROI Engine",
      "THEN veo el impacto financiero de cada ineficiencia",
      "AND muestra supuestos utilizados claramente"
    ]
  },
  {
    id: "2.1",
    level: "Nivel 2: Gen AI",
    tag: "Report Generation",
    title: "Generador de Decks IA",
    status: 'failing',
    priority: 'P1',
    stability: 72,
    lastRun: "Hace 10 min",
    businessImpact: "Los gerentes no pueden descargar reportes. Retrasa la toma de decisiones.",
    acceptanceCriteria: [
      "Generación de reporte en < 30 segundos",
      "Inclusión de plan de acción específico",
      "Exportación a formato PDF/PowerPoint"
    ],
    automatedTests: [
      "GenAITests.testDeckGenerationSpeed()",
      "GenAITests.testContentRelevance()"
    ],
    recommendations: [
      "Implementar caché de reportes para procesos no modificados.",
      "Revisar el modelo Gemini (cambiar a Flash 1.5 para mayor velocidad)."
    ],
    gherkin: [
      "GIVEN tengo un proceso analizado completamente",
      "WHEN solicito generar deck ejecutivo",
      "THEN el sistema crea presentación con diagnóstico",
      "AND incluye plan de acción en menos de 30 segundos"
    ],
    error: "Timeout: Generation took 42s. Target: < 30s."
  },
  {
    id: "4.1",
    level: "Nivel 4: Smart Context",
    tag: "Business Intelligence",
    title: "Inyección Estratégica",
    status: 'failing',
    priority: 'P1',
    stability: 65,
    lastRun: "Hace 15 min",
    businessImpact: "La IA da consejos genéricos. Se pierde el valor diferencial del sector.",
    acceptanceCriteria: [
      "Contexto relevante al sector/industria",
      "Sugerencias alineadas con objetivos estratégicos",
      "Memoria de contexto durante la sesión"
    ],
    automatedTests: [
      "SmartContextTests.testIndustrySpecificInsights()",
      "SmartContextTests.testConversationCoherence()"
    ],
    recommendations: [
      "Refinar los system instructions para incluir ontologías de industria.",
      "Aumentar el número de ejemplos (few-shot) en el prompt."
    ],
    gherkin: [
      "GIVEN estoy analizando un proceso específico",
      "WHEN activo Smart Context Engine",
      "THEN recibo insights alineados con objetivos estratégicos",
      "AND sugiere acciones específicas por industria"
    ],
    error: "Insights mismatch: Standard recommendations returned instead of industry-specific actions."
  }
];

const QAView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [selectedId, setSelectedId] = useState(SCENARIOS[0].id);
  const [isEditing, setIsEditing] = useState(false);
  const [editableGherkin, setEditableGherkin] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState<'logic' | 'validation' | 'strategy'>('logic');

  const activeScenario = SCENARIOS.find(s => s.id === selectedId) || SCENARIOS[0];

  useEffect(() => {
    setEditableGherkin(activeScenario.gherkin.join('\n'));
    setIsEditing(false);
  }, [selectedId]);

  const handleSave = async () => {
    if (!editableGherkin.trim()) return;
    setIsSaving(true);
    const result = await saveScenarioFeedback(activeScenario.id, activeScenario.title, editableGherkin);
    setIsSaving(false);
    if (result.success) {
      setSaveStatus('success');
      setTimeout(() => {
        setSaveStatus('idle');
        setIsEditing(false);
      }, 3000);
    } else {
      setSaveStatus('error');
    }
  };

  const getPriorityStatus = (priority: 'P0' | 'P1' | 'P2') => {
    const group = SCENARIOS.filter(s => s.priority === priority);
    if (group.some(s => s.status === 'failing')) return 'broken';
    if (group.every(s => s.status === 'passing')) return 'stable';
    return 'pending';
  };

  const stages = [
    { id: 'P0', label: 'Stage 0: Core', status: getPriorityStatus('P0') },
    { id: 'P1', label: 'Stage 1: Intelligence', status: getPriorityStatus('P1') },
    { id: 'P2', label: 'Stage 2: Strategy', status: getPriorityStatus('P2') },
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans selection:bg-[#5c56f1]/20 pb-20">
      {/* 1. HERO DE ESTADO GLOBAL */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 px-8 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
             <button onClick={onBack} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full transition text-slate-400">←</button>
             <div className="space-y-1">
                <h1 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">QA <span className="text-[#5c56f1]">Command Center</span></h1>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em]">Health Line Monitor v3.0</p>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
            {stages.map((stage) => (
              <div 
                key={stage.id}
                className={`flex items-center gap-3 px-6 py-3 rounded-[24px] border transition-all ${
                  stage.status === 'stable' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                  stage.status === 'broken' ? 'bg-rose-50 border-rose-100 text-rose-700 shadow-xl ring-2 ring-rose-500/10' :
                  'bg-white border-slate-200 text-slate-400'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  stage.status === 'stable' ? 'bg-emerald-500' :
                  stage.status === 'broken' ? 'bg-rose-500 animate-pulse' :
                  'bg-slate-200'
                }`}></div>
                <span className="text-[10px] font-black uppercase tracking-widest">{stage.label}</span>
              </div>
            ))}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8 grid grid-cols-1 xl:grid-cols-12 gap-10 mt-6">
        
        {/* 2. MATRIZ DE ESCENARIOS */}
        <div className="xl:col-span-7 space-y-12">
          {(['P0', 'P1', 'P2'] as const).map(prio => {
            const group = SCENARIOS.filter(s => s.priority === prio);
            if (group.length === 0) return null;
            return (
              <section key={prio} className="space-y-6">
                <div className="flex items-center gap-4 px-4">
                   <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Prioridad {prio}</h2>
                   <div className="flex-1 h-px bg-slate-200"></div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {group.map((s) => (
                    <div 
                      key={s.id}
                      onClick={() => setSelectedId(s.id)}
                      className={`bg-white p-6 rounded-[32px] border transition-all cursor-pointer group flex flex-col ${
                        selectedId === s.id 
                          ? 'border-[#5c56f1] shadow-2xl ring-4 ring-[#5c56f1]/5' 
                          : 'border-slate-200 hover:border-[#5c56f1]/30 hover:shadow-lg'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                           <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                             s.status === 'passing' ? 'text-emerald-500 bg-emerald-50 border-emerald-100' : 
                             s.status === 'failing' ? 'text-rose-500 bg-rose-50 border-rose-100' :
                             'text-amber-500 bg-amber-50 border-amber-100'
                           }`}>
                             {s.status.toUpperCase()}
                           </span>
                           <span className="text-[10px] font-bold text-slate-400">ID: {s.id}</span>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-slate-900">{s.stability}% Estabilidad</p>
                        </div>
                      </div>

                      <h3 className="text-lg font-black text-slate-900 italic uppercase tracking-tighter leading-tight mb-2">{s.title}</h3>
                      <p className="text-[11px] font-medium text-slate-500 line-clamp-1">{s.businessImpact}</p>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* 3. PANEL DE ESTRATEGIA Y VALIDACIÓN (REDISEÑADO) */}
        <div className="xl:col-span-5">
           <div className="bg-slate-900 rounded-[48px] overflow-hidden text-white shadow-2xl sticky top-32 flex flex-col min-h-[700px]">
              
              {/* Tabs de Navegación del Engine */}
              <div className="flex bg-white/5 p-2 gap-1 shrink-0">
                {[
                  { id: 'logic', label: 'LÓGICA', icon: '📝' },
                  { id: 'validation', label: 'VALIDACIÓN', icon: '🛠️' },
                  { id: 'strategy', label: 'ESTRATEGIA', icon: '💡' }
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id as any); setIsEditing(false); }}
                    className={`flex-1 py-4 rounded-3xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      activeTab === tab.id ? 'bg-[#5c56f1] text-white shadow-lg' : 'text-white/40 hover:bg-white/10'
                    }`}
                  >
                    <span>{tab.icon}</span> {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-10 flex-1 overflow-y-auto hide-scrollbar space-y-8">
                
                {activeTab === 'logic' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <div className="flex justify-between items-center">
                       <h4 className="text-[10px] font-black text-[#5c56f1] uppercase tracking-[0.4em]">Business Logic (Gherkin)</h4>
                       <button onClick={() => setIsEditing(!isEditing)} className="text-[9px] font-bold text-white/40 hover:text-white transition uppercase">
                         {isEditing ? 'Cerrar' : 'Editar'}
                       </button>
                    </div>
                    <div className={`p-6 rounded-3xl border transition-all ${isEditing ? 'bg-white/5 border-[#5c56f1]' : 'bg-transparent border-white/5'}`}>
                      {isEditing ? (
                        <textarea 
                          value={editableGherkin}
                          onChange={(e) => setEditableGherkin(e.target.value)}
                          className="w-full h-48 bg-transparent outline-none font-mono text-[11px] leading-relaxed resize-none"
                        />
                      ) : (
                        <div className="font-mono text-[12px] space-y-3 opacity-80">
                           {activeScenario.gherkin.map((l, i) => (
                             <p key={i}><span className="text-[#5c56f1] font-black mr-2">{l.split(' ')[0]}</span>{l.substring(l.split(' ')[0].length)}</p>
                           ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'validation' && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-[#5c56f1] uppercase tracking-[0.4em]">Criterios de Aceptación</h4>
                      <ul className="space-y-3">
                        {activeScenario.acceptanceCriteria.map((c, i) => (
                          <li key={i} className="flex gap-4 items-start group">
                             <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[10px] shrink-0 font-black">✓</div>
                             <p className="text-[13px] font-medium text-white/70 leading-relaxed group-hover:text-white transition-colors">{c}</p>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">Tests Automatizados Vinculados</h4>
                      <div className="space-y-2">
                        {activeScenario.automatedTests.map((t, i) => (
                          <div key={i} className="bg-white/5 p-4 rounded-2xl flex items-center justify-between group border border-transparent hover:border-white/10 transition-all">
                             <span className="font-mono text-[11px] text-white/50 group-hover:text-white">{t}</span>
                             <span className="text-[8px] font-black text-[#5c56f1] opacity-0 group-hover:opacity-100 transition-opacity">RUN TEST</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'strategy' && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-[#5c56f1] uppercase tracking-[0.4em]">Riesgo de Negocio (ELI10)</h4>
                      <div className="bg-white/5 p-6 rounded-[32px] border border-white/5 italic">
                        <p className="text-sm font-medium text-white/80 leading-relaxed">"{activeScenario.businessImpact}"</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Recomendaciones de Acción</h4>
                      <div className="space-y-3">
                        {activeScenario.recommendations.map((r, i) => (
                          <div key={i} className="flex gap-4 items-start">
                             <div className="w-5 h-5 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-[10px] shrink-0 font-black">!</div>
                             <p className="text-[13px] font-bold text-emerald-50/70">{r}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Acciones del Engine */}
              <div className="p-8 border-t border-white/5 bg-white/5 shrink-0 space-y-4">
                {isEditing ? (
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full py-5 bg-[#5c56f1] hover:bg-[#4f46e5] text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.4em] transition-all shadow-2xl"
                  >
                    {isSaving ? 'Sincronizando...' : 'Solicitar cambio de escenario'}
                  </button>
                ) : (
                  <div className="flex gap-4">
                    <button className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all">Ver Logs</button>
                    <button className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all">Reporte QA</button>
                  </div>
                )}
                
                {saveStatus === 'success' && (
                  <p className="text-[10px] font-black text-emerald-500 uppercase text-center animate-in zoom-in">✓ Cambios guardados en base técnica</p>
                )}
              </div>

           </div>
        </div>

      </div>
    </div>
  );
};

export default QAView;
