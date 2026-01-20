
import React, { useState, useEffect, useRef } from 'react';
import { EXAMPLE_DATASETS } from './constants';
import { Dataset, ChatMessage, Initiative } from './types';
import ProcessGraph from './components/ProcessGraph';
import { getAIResponse, generateExecutivePresentation } from './services/geminiService';
import { saveLead } from './lib/supabase';
import { sendDeckEmail } from './services/emailService';
import { parseCSVToDataset } from './utils/dataProcessor';
import { GoogleGenAI, Modality } from '@google/genai';
import { decode, decodeAudioData, createBlob } from './utils/audio';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Modulos importados
import DataSelector from './components/LeftPanel/DataSelector';
import SmartContext from './components/LeftPanel/SmartContext';
import Statistics from './components/CenterPanel/Explorar/Statistics';
import Collaborators from './components/CenterPanel/Explorar/Collaborators';
import SupportAI from './components/RightPanel/SupportAI';
import DeckGenerator from './components/RightPanel/DeckGenerator';
import Onboarding from './components/Onboarding/Onboarding';
import LandingView from './components/Landing/LandingView';
import InitiativesDashboard from './components/CenterPanel/Iniciativas/InitiativesDashboard';

const MAIN_TABS = ['EXPLORAR', 'EVALUAR', 'MEJORAR'] as const;
type MainTab = typeof MAIN_TABS[number];
const SUB_TABS: Record<MainTab, string[]> = {
  'EXPLORAR': ['Mapa de Flujo', 'Estadísticas', 'Colaboradores'],
  'EVALUAR': ['Recomendaciones', 'Personalizadas'],
  'MEJORAR': ['Iniciativas', 'Priorización', 'Experimentos']
};

const PRESENTATION_TEMPLATES = [
  { id: "Standard Executive", slides: ["1. Visión General", "2. Diagnóstico", "3. Cuellos de Botella", "4. Plan de Acción", "5. Proyección ROI"] },
  { id: "Lean Deep Dive", slides: ["1. Mapa de Valor", "2. Análisis de Desperdicio", "3. Eficiencia de Ciclo", "4. Propuesta Futura", "5. Impacto Operativo"] },
  { id: "Financial ROI & Impact", slides: ["1. Costo Actual", "2. Fugas de Capital", "3. Ahorros Proyectados", "4. Payback Period", "5. Análisis Costo-Beneficio"] }
];

type AppView = 'landing' | 'app';

const App: React.FC = () => {
  // Estado de Vista Global
  const [currentView, setCurrentView] = useState<AppView>('landing');

  // Estado de Layout
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [mainNav, setMainNav] = useState<MainTab>('EXPLORAR');
  const [subTab, setSubTab] = useState<string>('Mapa de Flujo');

  // Onboarding
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (currentView === 'app') {
      const hasSeenOnboarding = localStorage.getItem('gps_onboarding_seen');
      if (!hasSeenOnboarding) {
        setTimeout(() => setShowOnboarding(true), 1500);
      }
    }
  }, [currentView]);

  // Estado de Datos
  const [dataSource, setDataSource] = useState<'demo' | 'own'>('demo');
  const [selectedDataset, setSelectedDataset] = useState<Dataset>(EXAMPLE_DATASETS[0]);
  const [ownDataset, setOwnDataset] = useState<Dataset | null>(null);
  const [isHoveringCSV, setIsHoveringCSV] = useState(false);
  
  // Smart Context
  const [businessContext, setBusinessContext] = useState('');
  const [contextChatHistory, setContextChatHistory] = useState<ChatMessage[]>([]);
  const [contextInput, setContextInput] = useState('');
  const [isContextTyping, setIsContextTyping] = useState(false);

  // Soporte IA
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Deck Generation
  const [toolTab, setToolTab] = useState<'chat' | 'report'>('report');
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(PRESENTATION_TEMPLATES[0]);
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [customReportPrompt, setCustomReportPrompt] = useState('');
  const [isGeneratingDeck, setIsGeneratingDeck] = useState(false);
  const [generatedDeck, setGeneratedDeck] = useState<any>(null);

  // Otros estados
  const [userEmail, setUserEmail] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  
  // Refs
  const deckRef = useRef<HTMLDivElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const contextScrollRef = useRef<HTMLDivElement>(null);
  const supportScrollRef = useRef<HTMLDivElement>(null);

  // Voice State
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isContextLiveActive, setIsContextLiveActive] = useState(false);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

  useEffect(() => { setSubTab(SUB_TABS[mainNav][0]); }, [mainNav]);
  useEffect(() => { if (notification) { const t = setTimeout(() => setNotification(null), 5000); return () => clearTimeout(t); } }, [notification]);
  
  useEffect(() => {
    if (contextScrollRef.current) contextScrollRef.current.scrollTop = contextScrollRef.current.scrollHeight;
  }, [contextChatHistory, isContextTyping]);

  useEffect(() => {
    if (supportScrollRef.current) supportScrollRef.current.scrollTop = supportScrollRef.current.scrollHeight;
  }, [chatHistory, isTyping]);

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || inputText;
    if (!textToSend.trim()) return;
    setChatHistory(prev => [...prev, { role: 'user', text: textToSend }]);
    if (!textOverride) setInputText('');
    setIsTyping(true);
    const response = await getAIResponse(textToSend, selectedDataset, chatHistory, businessContext);
    setChatHistory(prev => [...prev, { role: 'model', text: response }]);
    setIsTyping(false);
  };

  const handleSendContextMessage = async (textOverride?: string) => {
    const textToSend = textOverride || contextInput;
    if (!textToSend.trim()) return;
    setContextChatHistory(prev => [...prev, { role: 'user', text: textToSend }]);
    if (!textOverride) setContextInput('');
    setIsContextTyping(true);
    
    const response = await getAIResponse(
      `Como estratega experto, ayuda al usuario a definir su contexto de negocio para este proceso. Analiza su entrada y propón una síntesis estratégica. Usuario dice: "${textToSend}"`,
      selectedDataset,
      contextChatHistory,
      businessContext
    );
    
    setContextChatHistory(prev => [...prev, { role: 'model', text: response }]);
    setBusinessContext(response);
    setIsContextTyping(false);
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const dataset = parseCSVToDataset(text, file.name);
      setOwnDataset(dataset);
      setSelectedDataset(dataset);
      setNotification({ msg: "CSV Cargado con éxito", type: 'success' });
    } catch (err: any) {
      setNotification({ msg: err.message || "Error al procesar CSV", type: 'error' });
    }
  };

  const handleGenerateDeck = async () => {
    if (!userEmail || !userEmail.includes('@')) {
      setShowEmailModal(true);
      return;
    }
    setIsGeneratingDeck(true);
    try {
      const deck = await generateExecutivePresentation(selectedDataset, customReportPrompt, selectedTemplate.id);
      setGeneratedDeck(deck);
      await saveLead(userEmail, selectedDataset.name, businessContext);
      const emailRes = await sendDeckEmail(userEmail, deck, selectedDataset.name);
      setNotification({ msg: emailRes.success ? "Deck enviado a tu email" : "Generado localmente", type: emailRes.success ? 'success' : 'error' });
    } catch (err) {
      setNotification({ msg: "Error al generar el reporte.", type: 'error' });
    } finally {
      setIsGeneratingDeck(false);
    }
  };

  const downloadPDF = async () => {
    if (!deckRef.current) return;
    const canvas = await html2canvas(deckRef.current, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`GPS_Deck_${selectedDataset.name.replace(/\s/g, '_')}.pdf`);
  };

  const startLiveSession = async (type: 'support' | 'context') => {
    const isActive = type === 'support' ? isLiveActive : isContextLiveActive;
    if (isActive) { stopLiveSession(); return; }
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      audioContextRef.current = { input: inputCtx, output: outputCtx };
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            if (type === 'support') setIsLiveActive(true); else setIsContextLiveActive(true);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const pcmBlob = createBlob(e.inputBuffer.getChannelData(0));
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (msg) => {
            const audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audio) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const buffer = await decodeAudioData(decode(audio), outputCtx, 24000, 1);
              const s = outputCtx.createBufferSource();
              s.buffer = buffer; s.connect(outputCtx.destination);
              s.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(s);
            }
          },
          onclose: () => { setIsLiveActive(false); setIsContextLiveActive(false); }
        },
        config: { responseModalities: [Modality.AUDIO] }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) { console.error(e); }
  };

  const stopLiveSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    if (audioContextRef.current) { audioContextRef.current.input.close(); audioContextRef.current.output.close(); }
    setIsLiveActive(false); setIsContextLiveActive(false);
  };

  if (currentView === 'landing') {
    return <LandingView onStart={() => setCurrentView('app')} />;
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] text-[#0f172a] font-sans overflow-hidden">
      
      {showOnboarding && (
        <Onboarding 
          onClose={() => {
            setShowOnboarding(false);
            localStorage.setItem('gps_onboarding_seen', 'true');
          }} 
        />
      )}

      {notification && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 px-8 py-4 rounded-2xl z-[300] shadow-2xl animate-in slide-in-from-top-10 text-[10px] font-black uppercase tracking-widest ${notification.type === 'success' ? 'bg-[#5c56f1] text-white' : 'bg-red-500 text-white'}`}>
          {notification.msg}
        </div>
      )}

      {showEmailModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[250] flex items-center justify-center p-6">
          <div className="bg-white border border-slate-200 p-10 rounded-[40px] max-w-md w-full shadow-2xl text-center space-y-6">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">Envío de Reporte</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Confirma tu email para recibir el análisis PDF.</p>
            <input 
              type="email" placeholder="tu@empresa.com" value={userEmail} onChange={(e) => setUserEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-5 rounded-3xl outline-none focus:border-[#5c56f1] transition text-center font-bold tracking-wider text-slate-900"
            />
            <button onClick={() => { if(userEmail.includes('@')) { setShowEmailModal(false); handleGenerateDeck(); } }} className="w-full py-5 bg-[#5c56f1] rounded-[24px] font-black text-xs uppercase tracking-[0.3em] shadow-lg text-white hover:bg-[#4f46e5] transition-all">Generar y Enviar</button>
            <button onClick={() => setShowEmailModal(false)} className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition">Cancelar</button>
          </div>
        </div>
      )}

      {generatedDeck && (
        <div className="fixed inset-0 bg-slate-50 z-[200] overflow-y-auto p-12 hide-scrollbar">
          <div className="max-w-4xl mx-auto space-y-12 pb-24">
            <div className="flex justify-between items-center">
               <button onClick={() => setGeneratedDeck(null)} className="flex items-center gap-3 text-slate-400 hover:text-slate-900 transition group">
                  <span className="text-2xl transition-transform group-hover:-translate-x-1">←</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">Regresar al Panel</span>
               </button>
               <div className="flex gap-4">
                 <button onClick={downloadPDF} className="px-8 py-3 bg-white text-slate-900 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all">EXPORTAR PDF</button>
                 <button onClick={() => setNotification({msg: "Sincronizando...", type: 'success'})} className="px-8 py-3 bg-[#5c56f1] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all">GOOGLE SLIDES</button>
               </div>
            </div>
            <div ref={deckRef} className="space-y-16">
               {generatedDeck.slides.map((slide: any, idx: number) => (
                 <div key={idx} className="aspect-video w-full bg-white border border-slate-200 rounded-[48px] p-20 flex flex-col shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#5c56f1]/5 blur-[120px] rounded-full"></div>
                    <div className="flex-1 flex flex-col justify-center space-y-10">
                       <div className="space-y-4">
                          <span className="text-[12px] font-black text-[#5c56f1] uppercase tracking-[0.5em] block">Slide 0{idx+1}</span>
                          <h3 className="text-5xl font-black italic uppercase tracking-tighter leading-[1.1] text-slate-900">{slide.title}</h3>
                       </div>
                       <div className="grid grid-cols-1 gap-6 max-w-2xl">
                          {slide.content.map((item: string, i: number) => (
                            <div key={i} className="flex items-start gap-6 group">
                               <div className="w-2 h-2 rounded-full bg-[#5c56f1] mt-2 shadow-[0_0_10px_rgba(92,86,241,0.3)]"></div>
                               <p className="text-xl font-medium text-slate-600 transition-colors">{item}</p>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      )}

      {/* Tercio Izquierdo */}
      <aside className={`transition-all duration-500 bg-white border-r border-slate-200 flex flex-col z-50 shadow-sm ${leftCollapsed ? 'w-16' : 'w-[24%]'}`}>
        <div className="h-24 flex items-center justify-between px-8 border-b border-slate-100 shrink-0">
          {!leftCollapsed && (
            <div className="flex items-center gap-4 text-slate-900 cursor-pointer" onClick={() => setCurrentView('landing')}>
              <div className="w-10 h-10 bg-[#5c56f1] text-white rounded-2xl flex items-center justify-center font-black shadow-lg">G</div>
              <span className="text-xl font-black italic tracking-tighter uppercase">GPS discovery</span>
            </div>
          )}
          <button onClick={() => setLeftCollapsed(!leftCollapsed)} className="p-2 text-slate-300 hover:text-slate-900 transition">{leftCollapsed ? '→' : '←'}</button>
        </div>

        {!leftCollapsed && (
          <div className="flex-1 flex flex-col p-6 overflow-hidden">
            <div id="tour-data-selector">
              <DataSelector 
                dataSource={dataSource} setDataSource={setDataSource}
                selectedDataset={selectedDataset} setSelectedDataset={setSelectedDataset}
                ownDataset={ownDataset} showDemoMenu={showDemoMenu} setShowDemoMenu={setShowDemoMenu}
                isHoveringCSV={isHoveringCSV} setIsHoveringCSV={setIsHoveringCSV}
                csvInputRef={csvInputRef} handleCSVUpload={handleCSVUpload}
              />
            </div>
            
            <div id="tour-smart-context" className="flex-1 flex flex-col min-h-0">
              <SmartContext 
                chatHistory={contextChatHistory} inputText={contextInput} setInputText={setContextInput}
                isTyping={isContextTyping} isLiveActive={isContextLiveActive}
                handleSendMessage={handleSendContextMessage} startLiveSession={() => startLiveSession('context')}
                scrollRef={contextScrollRef} fileInputRef={null as any}
                clearHistory={() => {setContextChatHistory([]); setBusinessContext('');}}
              />
            </div>
          </div>
        )}
      </aside>

      {/* Panel Central */}
      <main className="flex-1 flex flex-col bg-[#f8fafc] relative overflow-hidden">
        <header className="h-24 border-b border-slate-200 flex flex-col justify-center bg-white/80 backdrop-blur-md z-40 shrink-0">
           <div className="flex items-center justify-center gap-12 h-full text-slate-900 font-bold">
            {MAIN_TABS.map(tab => (
              <button key={tab} onClick={() => setMainNav(tab)} className={`text-[12px] font-black tracking-[0.5em] relative py-8 transition ${mainNav === tab ? 'text-[#5c56f1]' : 'text-slate-400 hover:text-slate-600'}`}>
                {tab}{mainNav === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#5c56f1]"></div>}
              </button>
            ))}
           </div>
        </header>
        <div id="tour-tabs" className="h-14 border-b border-slate-200 bg-white/40 flex items-center justify-center gap-8 shrink-0">
          {SUB_TABS[mainNav].map(st => (
            <button key={st} onClick={() => setSubTab(st)} className={`text-[10px] font-black tracking-[0.2em] uppercase transition-all ${subTab === st ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
              {st}{subTab === st && <div className="h-0.5 w-full bg-[#5c56f1]/30 mt-1 rounded-full"></div>}
            </button>
          ))}
        </div>

        <div className="flex-1 p-8 overflow-hidden relative">
          {subTab === 'Mapa de Flujo' && (
            <div id="tour-flow-map" className="w-full h-full">
              <ProcessGraph dataset={selectedDataset} animationSpeed={1} />
            </div>
          )}
          {subTab === 'Estadísticas' && <Statistics dataset={selectedDataset} />}
          {subTab === 'Colaboradores' && <Collaborators onNotify={(msg, type) => setNotification({msg, type})} />}
          {subTab === 'Iniciativas' && <InitiativesDashboard dataset={selectedDataset} />}
          
          {/* Módulos en desarrollo fallback */}
          {!['Mapa de Flujo', 'Estadísticas', 'Colaboradores', 'Iniciativas'].includes(subTab) && (
            <div className="flex h-full items-center justify-center text-slate-300 font-black uppercase text-[10px] tracking-widest">
              Módulo {subTab} en Desarrollo
            </div>
          )}
        </div>

        {/* Botón de Ayuda / Reiniciar Onboarding */}
        <button 
          onClick={() => setShowOnboarding(true)}
          className="absolute bottom-8 right-8 w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-[#5c56f1] hover:border-[#5c56f1]/40 transition-all shadow-xl z-50 group"
          title="Reiniciar Guía"
        >
          <span className="text-lg font-black italic group-hover:scale-110 transition-transform">?</span>
        </button>
      </main>

      {/* Tercio Derecho */}
      <aside className={`transition-all duration-500 bg-white border-l border-slate-200 flex flex-col shadow-sm ${rightCollapsed ? 'w-16' : 'w-[26%]'}`}>
        <div className="h-24 flex items-center justify-between px-8 border-b border-slate-100 shrink-0">
          <button onClick={() => setRightCollapsed(!rightCollapsed)} className="p-2 text-slate-300 hover:text-slate-900 transition">{rightCollapsed ? '←' : '→'}</button>
          {!rightCollapsed && (
             <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex">
                <button onClick={() => setToolTab('chat')} className={`px-8 py-2 text-[10px] font-black rounded-lg transition-all ${toolTab === 'chat' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>SOPORTE IA</button>
                <button onClick={() => setToolTab('report')} className={`px-8 py-2 text-[10px] font-black rounded-lg transition-all ${toolTab === 'report' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>GENERAR DECK</button>
             </div>
          )}
        </div>

        {!rightCollapsed && (
          <div id="tour-tools" className="flex-1 flex flex-col p-6 overflow-hidden">
             {toolTab === 'report' ? (
                <DeckGenerator 
                  isGenerating={isGeneratingDeck} onGenerate={handleGenerateDeck}
                  selectedTemplate={selectedTemplate} setSelectedTemplate={setSelectedTemplate}
                  showTemplateMenu={showTemplateMenu} setShowTemplateMenu={setShowTemplateMenu}
                  showCustomPrompt={showCustomPrompt} setShowCustomPrompt={setShowCustomPrompt}
                  customPrompt={customReportPrompt} setCustomPrompt={setCustomReportPrompt}
                />
             ) : (
                <SupportAI 
                  chatHistory={chatHistory} inputText={inputText} setInputText={setInputText}
                  isTyping={isTyping} isLiveActive={isLiveActive}
                  handleSendMessage={handleSendMessage} startLiveSession={() => startLiveSession('support')}
                  scrollRef={supportScrollRef} fileInputRef={null as any}
                  clearHistory={() => setChatHistory([])}
                />
             )}
          </div>
        )}
      </aside>
    </div>
  );
};

export default App;
