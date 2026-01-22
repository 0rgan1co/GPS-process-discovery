
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

const QAView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeStage, setActiveStage] = useState<StageType>('P0');
  const [selectedId, setSelectedId] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editableGherkin, setEditableGherkin] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState<'validation' | 'logic' | 'strategy'>('validation');
  const [isPicklistOpen, setIsPicklistOpen] = useState(false);
  const picklistRef = useRef<HTMLDivElement>(null);

  // Cerrar picklist al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (picklistRef.current && !picklistRef.current.contains(event.target as Node)) {
        setIsPicklistOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrar escenarios según el stage activo
  const filteredScenarios = useMemo(() => {
    return activeStage === 'ALL' 
      ? SCENARIOS 
      : SCENARIOS.filter(s => s.priority === activeStage);
  }, [activeStage]);

  // Sincronizar selección de escenario al cambiar de stage
  useEffect(() => {
    if (filteredScenarios.length > 0) {
      setSelectedId(filteredScenarios[0].id);
    }
  }, [activeStage, filteredScenarios]);

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
      setTimeout(() => {
        setSaveStatus('idle');
        setIsEditing(false);
      }, 3000);
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
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-[#5c56f1]/20 pb-12 md:pb-20">
      {/* HEADER DINÁMICO & RESPONSIVO CON PICKLIST */}
      <nav className="sticky top-0 z-[100] bg-white/95 backdrop-blur-xl border-b border-slate-200 px-4 md:px-8 py-3 md:py-4 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
          <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
             <button 
               onClick={onBack} 
               className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full transition text-slate-400 shrink-0"
               aria-label="Volver"
             >
               ←
             </button>
             <div className="space-y-0.5 md:space-y-1">
                <h1 className="text-lg md:text-xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
                  QA <span className="text-[#5c56f1]">Command Center</span>
                </h1>
                <p className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase tracking-[0.4em]">Test Sync Monitor v4.0</p>
             </div>
          </div>
          
          {/* STAGE PICKLIST - REPLACES BUTTONS */}
          <div className="relative w-full md:w-80" ref={picklistRef}>
            <button 
              onClick={() => setIsPicklistOpen(!isPicklistOpen)}
              className="w-full bg-slate-900 text-white px-5 py-3 md:py-3.5 rounded-2xl flex items-center justify-between border border-white/10 shadow-xl group active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  activeStage === 'ALL' ? 'bg-indigo-400' :
                  getStageStatus(activeStage as any) === 'stable' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                  getStageStatus(activeStage as any) === 'broken' ? 'bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]' :
                  'bg-amber-400'
                }`}></div>
                <div className="flex flex-col items-start truncate">
                  <span className="text-[10px] font-black uppercase tracking-widest">{STAGE_CONFIG[activeStage].label}</span>
                  <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest truncate">{STAGE_CONFIG[activeStage].desc}</span>
                </div>
              </div>
              <span className={`text-slate-500 transition-transform duration-300 ${isPicklistOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {isPicklistOpen && (
              <div className="absolute top-full right-0 w-full mt-2 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-[110] overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-2 space-y-1">
                  {(['ALL', 'P0', 'P1', 'P2'] as StageType[]).map(stage => {
                    const isActive = activeStage === stage;
                    const status = stage === 'ALL' ? 'stable' : getStageStatus(stage as any);
                    return (
                      <button 
                        key={stage}
                        onClick={() => { setActiveStage(stage); setIsPicklistOpen(false); }}
                        className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all text-left group ${
                          isActive ? 'bg-white/10' : 'hover:bg-white/5'
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          stage === 'ALL' ? 'bg-indigo-400' :
                          status === 'stable' ? 'bg-emerald-500' :
                          status === 'broken' ? 'bg-rose-500 animate-pulse' :
                          'bg-amber-400'
                        }`}></div>
                        <div className="flex flex-col">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                            {STAGE_CONFIG[stage].label}
                          </span>
                          <span className="text-[8px] font-bold text-slate-500 tracking-tight">{STAGE_CONFIG[stage].desc}</span>
                        </div>
                        {isActive && <span className="ml-auto text-emerald-500 text-[10px] font-black">ACTIVE</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 mt-2 md:mt-6">
        
        {/* PANEL IZQUIERDO: LISTADO FILTRADO DE ESCENARIOS */}
        <div className="lg:col-span-7 space-y-8 md:space-y-12">
          <div className="flex items-center justify-between px-2">
             <div className="flex items-center gap-3">
               <h2 className="text-[10px] md:text-[12px] font-black text-slate-900 uppercase tracking-[0.3em]">
                 Resultados <span className="text-[#5c56f1] italic">{activeStage === 'ALL' ? 'Globales' : activeStage}</span>
               </h2>
               <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-[9px] font-black">{filteredScenarios.length} CASOS</span>
             </div>
             <p className="hidden xs:block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Alineación Estratégica v4</p>
          </div>

          <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {filteredScenarios.map((s) => (
              <div 
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={`bg-white p-5 md:p-6 rounded-[28px] md:rounded-[32px] border transition-all cursor-pointer group flex flex-col relative overflow-hidden active:scale-[0.99] ${
                  selectedId === s.id 
                    ? 'border-[#5c56f1] shadow-xl md:shadow-2xl ring-4 ring-[#5c56f1]/5' 
                    : 'border-slate-200 hover:border-[#5c56f1]/30 hover:shadow-lg'
                }`}
              >
                <div className="flex justify-between items-start mb-3 md:mb-4">
                  <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
                     <span className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[7px] md:text-[8px] font-black uppercase tracking-widest border shrink-0 ${
                       s.status === 'passing' ? 'text-emerald-500 bg-emerald-50 border-emerald-100' : 
                       s.status === 'failing' ? 'text-rose-500 bg-rose-50 border-rose-100' :
                       'text-amber-500 bg-amber-50 border-amber-100'
                     }`}>
                       {s.status}
                     </span>
                     <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate">{s.category}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                     <p className={`text-[9px] md:text-[10px] font-black ${s.stability > 90 ? 'text-emerald-500' : 'text-amber-500'}`}>
                       {s.stability}% Health
                     </p>
                  </div>
                </div>

                <h3 className="text-base md:text-lg font-black text-slate-900 italic uppercase tracking-tighter leading-tight mb-2 group-hover:text-[#5c56f1] transition-colors">
                  {s.title}
                </h3>
                <p className="text-[10px] md:text-[11px] font-medium text-slate-500 line-clamp-1 italic opacity-70">
                  "{s.businessImpact}"
                </p>
                
                <div className={`mt-4 pt-4 border-t border-slate-50 flex gap-1.5 md:gap-2 transition-all duration-300 ${selectedId === s.id ? 'opacity-100 h-auto' : 'opacity-0 h-0 overflow-hidden'}`}>
                   {s.automatedTests.map((t, idx) => (
                      <div key={idx} className={`w-1.5 md:w-2 h-1.5 md:h-2 rounded-full ${t.status === 'passing' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)] animate-pulse'}`} title={t.name}></div>
                   ))}
                   {s.automatedTests.length === 0 && <span className="text-[7px] md:text-[8px] font-black text-slate-300 uppercase tracking-widest">Awaiting Sync</span>}
                </div>
              </div>
            ))}
            {filteredScenarios.length === 0 && (
              <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[40px] text-slate-300 space-y-4">
                 <span className="text-4xl grayscale">📊</span>
                 <p className="text-[10px] font-black uppercase tracking-[0.4em]">No scenarios in this stage yet</p>
              </div>
            )}
          </div>
        </div>

        {/* PANEL DERECHO: DETALLES DEL MOTOR */}
        <div className="lg:col-span-5">
           <div className="bg-slate-900 rounded-[32px] md:rounded-[48px] overflow-hidden text-white shadow-2xl lg:sticky lg:top-28 flex flex-col min-h-[500px] md:min-h-[750px] transition-all">
              
              <div className="flex bg-white/5 p-1.5 md:p-2 gap-1 shrink-0 border-b border-white/5">
                {[
                  { id: 'validation', label: 'TESTS', icon: '🛠️' },
                  { id: 'logic', label: 'LÓGICA', icon: '📝' },
                  { id: 'strategy', label: 'VISIÓN', icon: '💡' }
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id as any); setIsEditing(false); }}
                    className={`flex-1 py-3 md:py-4 rounded-2xl md:rounded-3xl text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 md:gap-2 ${
                      activeTab === tab.id 
                        ? 'bg-[#5c56f1] text-white shadow-lg shadow-indigo-500/20' 
                        : 'text-white/40 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-xs md:text-sm leading-none">{tab.icon}</span>
                    <span className="hidden xs:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="p-6 md:p-10 flex-1 overflow-y-auto hide-scrollbar space-y-8 md:space-y-10">
                
                {activeTab === 'validation' && (
                  <div className="space-y-8 md:space-y-10 animate-in fade-in slide-in-from-right-2">
                    <div className="space-y-4">
                      <div className="flex justify-between items-end border-b border-white/5 pb-3">
                        <h4 className="text-[9px] md:text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">Automation Pipeline</h4>
                        <span className="text-[8px] md:text-[9px] font-black text-white/20 uppercase tracking-widest">
                          {activeScenario?.automatedTests.length || 0} scripts
                        </span>
                      </div>
                      <div className="space-y-2.5 md:space-y-3">
                        {activeScenario?.automatedTests.map((t, i) => (
                          <div key={i} className="bg-white/[0.03] p-4 md:p-5 rounded-[20px] md:rounded-3xl flex items-center justify-between group border border-white/5 hover:border-white/10 transition-all">
                             <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                                <div className={`w-2 md:w-2.5 h-2 md:h-2.5 rounded-full shrink-0 ${t.status === 'passing' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></div>
                                <div className="space-y-0.5 min-w-0">
                                   <p className={`font-mono text-[10px] md:text-[11px] font-bold truncate ${t.status === 'passing' ? 'text-white/80' : 'text-rose-400'}`}>{t.name}</p>
                                   <p className="text-[7px] md:text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">{t.lastDuration} duration</p>
                                </div>
                             </div>
                             <button className="opacity-0 group-hover:opacity-100 px-2 md:px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[7px] md:text-[8px] font-black text-[#5c56f1] uppercase border border-[#5c56f1]/20 transition-all shrink-0">
                               Run
                             </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[9px] md:text-[10px] font-black text-[#5c56f1] uppercase tracking-[0.4em]">Acceptance Checklist</h4>
                      <div className="grid grid-cols-1 gap-2.5 md:gap-3">
                        {activeScenario?.acceptanceCriteria.map((c, i) => (
                          <div key={i} className="flex gap-3 md:gap-4 items-start bg-white/[0.03] p-3 md:p-4 rounded-2xl border border-white/5 group hover:border-[#5c56f1]/20 transition-all">
                             <div className="w-4 md:w-5 h-4 md:h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-[8px] md:text-[10px] shrink-0 font-black">✓</div>
                             <p className="text-[11px] md:text-[12px] font-bold text-white/60 leading-relaxed group-hover:text-white transition-colors">{c}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'logic' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
                    <div className="flex justify-between items-center">
                       <h4 className="text-[9px] md:text-[10px] font-black text-[#5c56f1] uppercase tracking-[0.4em]">Business Scenario</h4>
                       <button 
                         onClick={() => setIsEditing(!isEditing)} 
                         className="px-3 py-1.5 rounded-xl text-[8px] font-black uppercase bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                       >
                         {isEditing ? 'Cancel' : 'Edit Gherkin'}
                       </button>
                    </div>
                    <div className={`p-6 md:p-8 rounded-[24px] md:rounded-[32px] border transition-all ${isEditing ? 'bg-white/[0.04] border-[#5c56f1]' : 'bg-transparent border-white/5'}`}>
                      {isEditing ? (
                        <textarea 
                          value={editableGherkin}
                          onChange={(e) => setEditableGherkin(e.target.value)}
                          className="w-full h-48 md:h-64 bg-transparent outline-none font-mono text-[10px] md:text-[11px] leading-relaxed resize-none hide-scrollbar text-white/90"
                          spellCheck={false}
                          autoFocus
                        />
                      ) : (
                        <div className="font-mono text-[11px] md:text-[13px] space-y-3 md:space-y-4 opacity-80 leading-relaxed">
                           {activeScenario?.gherkin.map((l, i) => (
                             <p key={i}>
                               <span className="text-[#5c56f1] font-black mr-2 italic">{l.split(' ')[0]}</span>
                               {l.substring(l.split(' ')[0].length)}
                             </p>
                           ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'strategy' && (
                  <div className="space-y-8 md:space-y-10 animate-in fade-in slide-in-from-right-2">
                    <div className="space-y-4">
                      <h4 className="text-[9px] md:text-[10px] font-black text-[#5c56f1] uppercase tracking-[0.4em]">Strategic Context (ELI10)</h4>
                      <div className="bg-white/[0.03] p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-white/5 italic relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#5c56f1] opacity-30 group-hover:opacity-100 transition-opacity"></div>
                        <p className="text-sm md:text-base font-medium text-white/70 leading-relaxed">"{activeScenario?.businessImpact}"</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[9px] md:text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Consultant Recommendations</h4>
                      <div className="space-y-2.5 md:space-y-3">
                        {activeScenario?.recommendations.map((r, i) => (
                          <div key={i} className="flex gap-3 md:gap-4 items-center bg-emerald-500/5 p-4 md:p-5 rounded-2xl md:rounded-[28px] border border-emerald-500/10">
                             <div className="w-5 md:w-6 h-5 md:h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-[9px] md:text-[10px] shrink-0 font-black shadow-lg">!</div>
                             <p className="text-[11px] md:text-[12px] font-bold text-emerald-50/70 leading-snug">{r}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {activeScenario?.error && (
                      <div className="space-y-3">
                        <h4 className="text-[9px] md:text-[10px] font-black text-rose-500 uppercase tracking-[0.4em]">Error Stack Trace</h4>
                        <div className="bg-rose-500/5 p-5 md:p-6 rounded-[24px] border border-rose-500/20">
                          <p className="text-[10px] md:text-[11px] font-mono text-rose-300 leading-relaxed">{activeScenario.error}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>

              <div className="p-6 md:p-8 border-t border-white/5 bg-white/5 shrink-0 space-y-4">
                {isEditing ? (
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full py-4 md:py-5 bg-[#5c56f1] hover:bg-[#4f46e5] text-white rounded-2xl md:rounded-3xl font-black text-[10px] md:text-[11px] uppercase tracking-[0.4em] transition-all shadow-2xl active:scale-[0.98] disabled:opacity-50"
                  >
                    {isSaving ? 'Sincronizando...' : 'Solicitar cambio de escenario'}
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <button className="py-3 md:py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl md:rounded-2xl text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all">
                      Trace Logs
                    </button>
                    <button className="py-3 md:py-4 bg-[#5c56f1]/20 hover:bg-[#5c56f1]/30 text-[#a5b4fc] border border-[#5c56f1]/30 rounded-xl md:rounded-2xl text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all">
                      TDD Deck
                    </button>
                  </div>
                )}
                
                {saveStatus === 'success' && (
                  <p className="text-[9px] md:text-[10px] font-black text-emerald-500 uppercase text-center animate-in zoom-in duration-300">
                    ✓ Feedback sincronizado con la base técnica
                  </p>
                )}
              </div>

           </div>
        </div>

      </div>
    </div>
  );
};

export default QAView;
