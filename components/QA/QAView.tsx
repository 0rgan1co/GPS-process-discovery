
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { saveScenarioFeedback } from '../../lib/supabase';

interface AutomatedTest {
  name: string;
  status: 'passing' | 'failing';
  lastDuration: string;
}

interface Scenario {
  id: string;
  category: string;
  title: string;
  status: 'passing' | 'failing' | 'pending';
  priority: 'P0' | 'P1' | 'P2';
  gherkin: string[];
  stability: number; 
  lastRun: string;
  businessImpact: string; 
  acceptanceCriteria: string[];
  automatedTests: AutomatedTest[];
  recommendations: string[];
  error?: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "1.1",
    category: "Process Mining",
    title: "Procesar logs SAP de 1000 registros",
    status: 'passing',
    priority: 'P0',
    stability: 99,
    lastRun: "Hace 2 min",
    businessImpact: "Falla crítica: El cliente no puede visualizar el flujo real de su operación.",
    gherkin: [
      "GIVEN tengo 'sample_sap.csv' con 1000 registros válidos",
      "WHEN lo cargo en la plataforma",
      "THEN el motor de minería procesa los datos en < 120 segundos",
      "AND genera un mapa con 15 actividades únicas identificadas"
    ],
    acceptanceCriteria: [
      "Status final = 'success' en respuesta de API",
      "Tiempo de procesamiento < 120 segundos",
      "Mapa D3.js renderizado con 15 nodos visibles",
      "Persistencia de datos en base técnica validada"
    ],
    automatedTests: [
      { name: "MiningEngine.testLargeDatasetLoad()", status: 'passing', lastDuration: "84s" },
      { name: "MiningEngine.validateNodeCount(15)", status: 'passing', lastDuration: "2.1s" }
    ],
    recommendations: ["Optimizar caché de nodos para archivos superiores a 5000 registros."]
  },
  {
    id: "1.2",
    category: "Process Mining",
    title: "Validación de CSV sin columna Timestamp",
    status: 'failing',
    priority: 'P0',
    stability: 95,
    lastRun: "Hace 5 min",
    businessImpact: "Ruido técnico: El sistema permite datos corruptos que sesgan el ROI.",
    gherkin: [
      "GIVEN un archivo 'invalid_log.csv' sin columna 'Timestamp'",
      "WHEN intento realizar el upload",
      "THEN el sistema bloquea la carga inmediatamente",
      "AND muestra el mensaje 'Error: Columna Timestamp requerida'"
    ],
    acceptanceCriteria: [
      "Interrupción de flujo en capa de validación frontend",
      "Log de error capturado en Sentry",
      "Toast UI con microcopy de ayuda accionable",
      "No se generan registros huérfanos en la DB"
    ],
    automatedTests: [
      { name: "Validator.testMissingColumn('timestamp')", status: 'failing', lastDuration: "0.5s" }
    ],
    error: "Validation failed: System allowed partial upload instead of hard block.",
    recommendations: ["Reforzar validación en el Worker de procesamiento."]
  },
  {
    id: "2.1",
    category: "ROI Engine",
    title: "Cálculo de impacto en proceso P2P",
    status: 'passing',
    priority: 'P0',
    stability: 97,
    lastRun: "Hace 10 min",
    businessImpact: "Sin ROI, el business case de la implementación pierde credibilidad ante CFO.",
    gherkin: [
      "GIVEN un proceso Procure-to-Pay analizado",
      "WHEN aplico el ROI Engine con costo por hora de $45",
      "THEN calcula un ahorro potencial de $12.5k / mes",
      "AND desglosa el ahorro por cada 'Muda' (desperdicio) identificada"
    ],
    acceptanceCriteria: [
      "Margen de error en cálculo < 0.01%",
      "Exportación de tabla de supuestos en PDF",
      "Visualización de gráfico de barras de impacto financiero",
      "Actualización de métricas en < 2 segundos al cambiar variables"
    ],
    automatedTests: [
      { name: "ROIEngine.calculateP2PImpact()", status: 'passing', lastDuration: "1.5s" },
      { name: "ROIEngine.validateExportIntegrity()", status: 'passing', lastDuration: "3.2s" }
    ],
    recommendations: ["Permitir personalización de moneda por región."]
  },
  {
    id: "3.1",
    category: "Gen AI",
    title: "Generación de Deck Ejecutivo Estándar",
    status: 'failing',
    priority: 'P1',
    stability: 78,
    lastRun: "Hace 1 hora",
    businessImpact: "Retraso en reportabilidad: El consultor debe crear el deck manualmente.",
    gherkin: [
      "GIVEN un dataset analizado con eficiencia del 60%",
      "WHEN solicito 'Generar Deck Ejecutivo'",
      "THEN crea una presentación de 5 slides en < 45 segundos",
      "AND incluye recomendaciones basadas exclusivamente en datos del proceso"
    ],
    acceptanceCriteria: [
      "Estructura de JSON de salida válida según esquema",
      "Contenido libre de alucinaciones (validado vs dataset)",
      "Tiempo de respuesta LLM < 30s",
      "Formato de salida descargable funcional"
    ],
    automatedTests: [
      { name: "GeminiService.generateDeckJSON()", status: 'failing', lastDuration: "42s" },
      { name: "PromptValidator.checkFactualConsistency()", status: 'passing', lastDuration: "5s" }
    ],
    error: "Timeout: Gen AI engine took 55s to respond. Target is 45s.",
    recommendations: ["Migrar a gemini-3-flash para optimizar latencia."]
  },
  {
    id: "4.1",
    category: "Smart Context",
    title: "Inyección de contexto de Manufactura",
    status: 'passing',
    priority: 'P1',
    stability: 92,
    lastRun: "Hace 30 min",
    businessImpact: "Análisis genérico: Sin contexto, los insights no son aplicables a la industria.",
    gherkin: [
      "GIVEN un usuario en el sector 'Manufactura Pesada'",
      "WHEN activa el Smart Context Engine",
      "THEN las recomendaciones priorizan cuellos de botella en línea de producción",
      "AND sugiere KPI específicos de OEE y disponibilidad"
    ],
    acceptanceCriteria: [
      "Actualización de System Instruction del LLM",
      "Aparición de tags de industria en el panel de recomendaciones",
      "Coherencia en las preguntas sugeridas por la IA",
      "Memoria de contexto durante la sesión"
    ],
    automatedTests: [
      { name: "ContextEngine.injectIndustryMapping()", status: 'passing', lastDuration: "0.8s" }
    ],
    recommendations: ["Expandir ontología para sector Retail y Banca."]
  },
  {
    id: "5.1",
    category: "KPI Dashboard",
    title: "Monitoreo de métricas DORA en tiempo real",
    status: 'passing',
    priority: 'P1',
    stability: 94,
    lastRun: "Hace 15 min",
    businessImpact: "Pérdida de visibilidad en el rendimiento técnico del pipeline de mejora.",
    gherkin: [
      "GIVEN cambios recientes en la configuración del proceso",
      "WHEN accedo al dashboard de métricas",
      "THEN veo Lead Time y Deployment Frequency actualizados",
      "AND muestra tendencia (sube/baja) respecto a la semana anterior"
    ],
    acceptanceCriteria: [
      "Precisión de cálculo DORA vs log de eventos",
      "Renderizado de micro-gráficos de tendencia (Sparklines)",
      "Accesibilidad del dashboard en pantallas < 768px",
      "Refresco de datos sin recarga de página (WebSocket/Polling)"
    ],
    automatedTests: [
      { name: "Dashboard.validateDORACalculation()", status: 'passing', lastDuration: "1.2s" }
    ],
    recommendations: ["Añadir alertas de umbral para Lead Time > 48h."]
  },
  {
    id: "6.1",
    category: "Strategy Execution",
    title: "Gestión de Ciclo de 90 Días",
    status: 'pending',
    priority: 'P2',
    stability: 0,
    lastRun: "N/A",
    businessImpact: "Desconexión entre el análisis y la ejecución real de mejoras.",
    gherkin: [
      "GIVEN una iniciativa de mejora 'Automatización de Facturas'",
      "WHEN el usuario actualiza el progreso al 50%",
      "THEN el sistema recalcula el ROI proyectado para el final del ciclo",
      "AND notifica a los colaboradores asignados"
    ],
    acceptanceCriteria: [
      "Persistencia de estado de iniciativa en Supabase",
      "Envío de notificación push/email simulado",
      "Cálculo de 'Burn-up chart' de beneficios",
      "Validación de roles (solo Editor/Admin pueden actualizar)"
    ],
    automatedTests: [],
    recommendations: ["Integrar con Jira/Trello para sincronización de tareas."]
  }
];

type StageType = 'P0' | 'P1' | 'P2' | 'ALL';

const STAGE_CONFIG: Record<StageType, { label: string, desc: string }> = {
  'P0': { label: 'Stage 0: Critical Core', desc: 'Funcionalidades vitales de minería y ROI' },
  'P1': { label: 'Stage 1: Intelligence', desc: 'Gen AI y Contexto estratégico' },
  'P2': { label: 'Stage 2: Strategy', desc: 'Métricas DORA y Ejecución' },
  'ALL': { label: 'All View Mode', desc: 'Visualización completa de la suite' }
};

// --- SUB-COMPONENTES PARA ORGANIZACIÓN ---

const ScenarioDefinition: React.FC<{ scenario: Scenario, isEditing: boolean, setIsEditing: (v: boolean) => void, content: string, setContent: (v: string) => void }> = ({ scenario, isEditing, setIsEditing, content, setContent }) => (
  <section className="space-y-4">
    <div className="flex justify-between items-center">
      <h4 className="text-[10px] font-black text-[#5c56f1] uppercase tracking-[0.4em]">Scenario Logic (Gherkin)</h4>
      <button 
        onClick={() => setIsEditing(!isEditing)} 
        className="px-3 py-1.5 rounded-xl text-[8px] font-black uppercase bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
      >
        {isEditing ? 'Cancel' : 'Edit Logic'}
      </button>
    </div>
    <div className={`p-6 rounded-[24px] border transition-all ${isEditing ? 'bg-white/[0.04] border-[#5c56f1]' : 'bg-transparent border-white/5'}`}>
      {isEditing ? (
        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-40 bg-transparent outline-none font-mono text-[11px] leading-relaxed resize-none hide-scrollbar text-white/90"
          spellCheck={false}
          autoFocus
        />
      ) : (
        <div className="font-mono text-[11px] space-y-3 opacity-80 leading-relaxed">
           {scenario.gherkin.map((l, i) => (
             <p key={i}>
               <span className="text-[#5c56f1] font-black mr-2 italic">{l.split(' ')[0]}</span>
               {l.substring(l.split(' ')[0].length)}
             </p>
           ))}
        </div>
      )}
    </div>
  </section>
);

const AutomationPipeline: React.FC<{ scenario: Scenario }> = ({ scenario }) => (
  <section className="space-y-4">
    <div className="flex justify-between items-end border-b border-white/5 pb-3">
      <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">Automation Pipeline</h4>
      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{scenario.automatedTests.length} tests</span>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {scenario.automatedTests.map((t, i) => (
        <div key={i} className="bg-white/[0.03] p-4 rounded-2xl flex items-center justify-between border border-white/5">
           <div className="flex items-center gap-3 overflow-hidden">
              <div className={`w-2 h-2 rounded-full shrink-0 ${t.status === 'passing' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></div>
              <div className="space-y-0.5 min-w-0">
                 <p className="font-mono text-[10px] font-bold text-white/80 truncate">{t.name}</p>
                 <p className="text-[7px] font-black text-white/20 uppercase tracking-[0.2em]">{t.lastDuration}</p>
              </div>
           </div>
        </div>
      ))}
      {scenario.automatedTests.length === 0 && (
        <div className="col-span-full py-6 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-2xl">
           <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">Awaiting Technical Integration</span>
        </div>
      )}
    </div>
  </section>
);

const StrategicVision: React.FC<{ scenario: Scenario }> = ({ scenario }) => (
  <section className="space-y-6">
    <div className="space-y-4">
      <h4 className="text-[10px] font-black text-[#5c56f1] uppercase tracking-[0.4em]">Strategic Context</h4>
      <div className="bg-white/[0.03] p-6 rounded-[28px] border border-white/5 italic relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#5c56f1] opacity-30"></div>
        <p className="text-sm font-medium text-white/70 leading-relaxed">"{scenario.businessImpact}"</p>
      </div>
    </div>

    <div className="space-y-4">
      <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Consultant Recommendations</h4>
      <div className="space-y-3">
        {scenario.recommendations.map((r, i) => (
          <div key={i} className="flex gap-4 items-center bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
             <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-[10px] shrink-0 font-black shadow-lg">!</div>
             <p className="text-[11px] font-bold text-emerald-50/70">{r}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const QAView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeStage, setActiveStage] = useState<StageType>('P0');
  const [selectedId, setSelectedId] = useState('1.1');
  const [isEditing, setIsEditing] = useState(false);
  const [editableGherkin, setEditableGherkin] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isPicklistOpen, setIsPicklistOpen] = useState(false);
  const picklistRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (picklistRef.current && !picklistRef.current.contains(event.target as Node)) {
        setIsPicklistOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredScenarios = useMemo(() => {
    return activeStage === 'ALL' ? SCENARIOS : SCENARIOS.filter(s => s.priority === activeStage);
  }, [activeStage]);

  const activeScenario = useMemo(() => {
    return SCENARIOS.find(s => s.id === selectedId) || filteredScenarios[0] || SCENARIOS[0];
  }, [selectedId, filteredScenarios]);

  useEffect(() => {
    if (activeScenario) {
      setEditableGherkin(activeScenario.gherkin.join('\n'));
      setIsEditing(false);
    }
  }, [activeScenario]);

  const handleSave = async () => {
    if (!editableGherkin.trim()) return;
    setIsSaving(true);
    const result = await saveScenarioFeedback(activeScenario.id, activeScenario.title, editableGherkin);
    setIsSaving(false);
    if (result.success) {
      setSaveStatus('success');
      setTimeout(() => { setSaveStatus('idle'); setIsEditing(false); }, 3000);
    } else {
      setSaveStatus('error');
    }
  };

  const getStageStatus = (priority: 'P0' | 'P1' | 'P2') => {
    const group = SCENARIOS.filter(s => s.priority === priority);
    if (group.some(s => s.status === 'failing')) return 'broken';
    if (group.every(s => s.status === 'passing')) return 'stable';
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-[#5c56f1]/20">
      
      {/* HEADER DINÁMICO */}
      <nav className="sticky top-0 z-[100] bg-white border-b border-slate-200 px-8 py-4 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-6">
           <button onClick={onBack} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full transition text-slate-400">←</button>
           <div className="space-y-1">
              <h1 className="text-xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">QA <span className="text-[#5c56f1]">Command Center</span></h1>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em]">Test Sync Monitor v4.0</p>
           </div>
        </div>
        
        <div className="relative w-80" ref={picklistRef}>
          <button onClick={() => setIsPicklistOpen(!isPicklistOpen)} className="w-full bg-slate-900 text-white px-5 py-3.5 rounded-2xl flex items-center justify-between border border-white/10 shadow-xl group">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${activeStage === 'ALL' ? 'bg-indigo-400' : getStageStatus(activeStage as any) === 'stable' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></div>
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-black uppercase tracking-widest">{STAGE_CONFIG[activeStage].label}</span>
                <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest truncate">{STAGE_CONFIG[activeStage].desc}</span>
              </div>
            </div>
            <span className={`text-slate-500 transition-transform ${isPicklistOpen ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {isPicklistOpen && (
            <div className="absolute top-full right-0 w-full mt-2 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-[110] p-2 space-y-1">
              {(['ALL', 'P0', 'P1', 'P2'] as StageType[]).map(stage => (
                <button key={stage} onClick={() => { setActiveStage(stage); setIsPicklistOpen(false); }} className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all text-left ${activeStage === stage ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${stage === 'ALL' ? 'bg-indigo-400' : getStageStatus(stage as any) === 'stable' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                  <div className="flex flex-col"><span className="text-[10px] font-black uppercase tracking-widest text-white/90">{STAGE_CONFIG[stage].label}</span></div>
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-10 mt-6">
        
        {/* LISTADO DE ESCENARIOS */}
        <div className="lg:col-span-7 space-y-12">
          <div className="flex items-center gap-3 px-2">
            <h2 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.3em]">RESULTADOS <span className="text-[#5c56f1] italic">{activeStage}</span></h2>
            <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-[9px] font-black">{filteredScenarios.length} CASOS</span>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {filteredScenarios.map((s) => (
              <div key={s.id} onClick={() => setSelectedId(s.id)} className={`bg-white p-6 rounded-[32px] border transition-all cursor-pointer group relative overflow-hidden ${selectedId === s.id ? 'border-[#5c56f1] shadow-2xl ring-4 ring-[#5c56f1]/5' : 'border-slate-200 hover:border-[#5c56f1]/30 hover:shadow-lg'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                     <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${s.status === 'passing' ? 'text-emerald-500 bg-emerald-50 border-emerald-100' : 'text-rose-500 bg-rose-50 border-rose-100'}`}>{s.status}</span>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{s.category}</span>
                  </div>
                  <p className="text-[10px] font-black text-emerald-500">{s.stability}% Health</p>
                </div>
                <h3 className="text-lg font-black text-slate-900 italic uppercase tracking-tighter leading-tight mb-2 group-hover:text-[#5c56f1] transition-colors">{s.title}</h3>
                <p className="text-[11px] font-medium text-slate-500 italic opacity-70 leading-relaxed">"{s.businessImpact}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* DETALLE INTEGRAL SIN PESTAÑAS */}
        <div className="lg:col-span-5">
           <div className="bg-slate-900 rounded-[48px] text-white shadow-2xl lg:sticky lg:top-28 flex flex-col max-h-[85vh] transition-all">
              
              <div className="p-8 border-b border-white/5 shrink-0 flex items-center justify-between">
                 <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-[#5c56f1] uppercase tracking-[0.4em]">Technical Oversight</span>
                    <h2 className="text-xl font-black italic uppercase tracking-tighter text-white/90">{activeScenario.title}</h2>
                 </div>
                 <div className={`w-3 h-3 rounded-full ${activeScenario.status === 'passing' ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-rose-500 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.5)]'}`}></div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-12 hide-scrollbar">
                
                {/* 1. LÓGICA (GHERKIN) */}
                <ScenarioDefinition 
                   scenario={activeScenario} 
                   isEditing={isEditing} setIsEditing={setIsEditing} 
                   content={editableGherkin} setContent={setEditableGherkin} 
                />

                {/* 2. PIPELINE DE AUTOMATIZACIÓN */}
                <AutomationPipeline scenario={activeScenario} />

                {/* 3. VISIÓN ESTRATÉGICA */}
                <StrategicVision scenario={activeScenario} />
                
                {activeScenario.error && (
                  <div className="p-5 bg-rose-500/5 rounded-2xl border border-rose-500/20 font-mono text-[10px] text-rose-300 leading-relaxed">
                     <span className="text-rose-500 font-black block mb-1">STDOUT_ERROR:</span>
                     {activeScenario.error}
                  </div>
                )}
              </div>

              <div className="p-8 border-t border-white/5 bg-white/[0.02] shrink-0 space-y-4">
                {isEditing ? (
                  <button onClick={handleSave} disabled={isSaving} className="w-full py-5 bg-[#5c56f1] hover:bg-[#4f46e5] text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.4em] transition-all shadow-2xl disabled:opacity-50">
                    {isSaving ? 'Sincronizando...' : 'Request logic sync'}
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <button className="py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all">Trace Logs</button>
                    <button className="py-4 bg-[#5c56f1] hover:bg-[#4f46e5] text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20">TDD Report</button>
                  </div>
                )}
                {saveStatus === 'success' && <p className="text-[10px] font-black text-emerald-500 uppercase text-center animate-pulse">✓ Sync confirmed with core technical base</p>}
              </div>

           </div>
        </div>

      </div>
    </div>
  );
};

export default QAView;
