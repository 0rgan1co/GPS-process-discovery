
import React, { useState, useEffect, useRef } from 'react';
import { DEMO_CONFIGS, DemoConfig } from './constants';
import { Dataset, ChatMessage } from './types';
import ProcessGraph from './components/ProcessGraph';
import { getAIResponse, generateExecutivePresentation } from './services/geminiService';
import { saveLead } from './lib/supabase';
import { parseCSVToDataset } from './utils/dataProcessor';
import { GoogleGenAI, Modality } from '@google/genai';
import { decode, decodeAudioData, createBlob } from './utils/audio';

// Componentes
import DataSelector from './components/LeftPanel/DataSelector';
import SmartContext from './components/LeftPanel/SmartContext';
import Statistics from './components/CenterPanel/Explorar/Statistics';
import Collaborators from './components/CenterPanel/Explorar/Collaborators';
import SupportAI from './components/RightPanel/SupportAI';
import DeckGenerator from './components/RightPanel/DeckGenerator';
import Onboarding from './components/Onboarding/Onboarding';
import LandingView from './components/Landing/LandingView';
import InitiativesDashboard from './components/CenterPanel/Iniciativas/InitiativesDashboard';
import QAView from './components/QA/QAView';
import BillingView from './components/Billing/BillingView';

const MAIN_TABS = ['EXPLORAR', 'EVALUAR', 'MEJORAR'] as const;
type MainTab = typeof MAIN_TABS[number];
const SUB_TABS: Record<MainTab, string[]> = {
  'EXPLORAR': ['Mapa de Flujo', 'Estadísticas', 'Colaboradores'],
  'EVALUAR': ['Recomendaciones', 'Personalizadas'],
  'MEJORAR': ['Iniciativas', 'Priorización', 'Experimentos']
};

type AppView = 'landing' | 'app' | 'qa' | 'billing';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [mainNav, setMainNav] = useState<MainTab>('EXPLORAR');
  const [subTab, setSubTab] = useState<string>('Mapa de Flujo');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [toolTab, setToolTab] = useState<'report' | 'chat'>('report');

  const [dataSource, setDataSource] = useState<'demo' | 'own'>('demo');
  const [selectedDemoConfig, setSelectedDemoConfig] = useState<DemoConfig>(DEMO_CONFIGS[0]);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [ownDataset, setOwnDataset] = useState<Dataset | null>(null);
  const [isHoveringCSV, setIsHoveringCSV] = useState(false);
  
  const [businessContext, setBusinessContext] = useState('');
  const [contextChatHistory, setContextChatHistory] = useState<ChatMessage[]>([]);
  const [contextInput, setContextInput] = useState('');
  const [isContextTyping, setIsContextTyping] = useState(false);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState({ id: "Standard Executive", slides: [] });
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [customReportPrompt, setCustomReportPrompt] = useState('');
  const [isGeneratingDeck, setIsGeneratingDeck] = useState(false);
  const [generatedDeck, setGeneratedDeck] = useState<any>(null);

  const [userEmail, setUserEmail] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  
  const csvInputRef = useRef<HTMLInputElement>(null);
  const contextScrollRef = useRef<HTMLDivElement>(null);
  const supportScrollRef = useRef<HTMLDivElement>(null);

  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isContextLiveActive, setIsContextLiveActive] = useState(false);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const nextStartTimeRef = useRef(0);

  // Auto-clear notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // DETECTAR URL PARA MODO QA O FACTURACION
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'qa' || params.get('mode') === 'qa') {
      setCurrentView('qa');
    } else if (params.get('view') === 'billing') {
      setCurrentView('billing');
    }
  }, []);

  /**
   * Procesa el texto CSV y lo convierte en Dataset
   * Retorna el dataset para evitar problemas de sincronización de estado
   */
  const processDataset = async (csvText: string, name: string, config?: DemoConfig): Promise<Dataset | null> => {
    setIsAnalyzing(true);
    try {
      const dataset = parseCSVToDataset(csvText, name);
      if (config) {
        dataset.wastes = config.wastes;
        dataset.dora = config.dora;
        dataset.stats = { ...dataset.stats, ...config.baseStats };
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSelectedDataset(dataset);
      return dataset;
    } catch (err: any) {
      console.error("Critical Analysis Error:", err);
      setNotification({ msg: err.message || "Error al analizar datos", type: 'error' });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    const loadDemo = async () => {
      if (dataSource === 'demo' && selectedDemoConfig) {
        setIsLoading(true);
        try {
          const response = await fetch(selectedDemoConfig.csvPath);
          if (!response.ok) throw new Error(`El archivo de demo no está disponible (${response.status})`);
          const csvText = await response.text();
          await processDataset(csvText, selectedDemoConfig.name, selectedDemoConfig);
        } catch (err: any) {
          console.error("Demo Fetch Error:", err);
          setNotification({ msg: err.message, type: 'error' });
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadDemo();
  }, [selectedDemoConfig, dataSource]);

  useEffect(() => {
    if (currentView === 'app') {
      const hasSeenOnboarding = localStorage.getItem('gps_onboarding_seen');
      if (!hasSeenOnboarding) {
        setTimeout(() => setShowOnboarding(true), 1500);
      }
    }
  }, [currentView]);

  useEffect(() => { setSubTab(SUB_TABS[mainNav][0]); }, [mainNav]);

  const handleSendMessage = async (textOverride?: string) => {
    if (!selectedDataset) return;
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
    if (!selectedDataset) return;
    const textToSend = textOverride || contextInput;
    if (!textToSend.trim()) return;
    setContextChatHistory(prev => [...prev, { role: 'user', text: textToSend }]);
    if (!textOverride) setContextInput('');
    setIsContextTyping(true);
    const response = await getAIResponse(`Analiza el contexto: "${textToSend}"`, selectedDataset, contextChatHistory, businessContext);
    setContextChatHistory(prev => [...prev, { role: 'model', text: response }]);
    setBusinessContext(response);
    setIsContextTyping(false);
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    try {
      const text = await file.text();
      const dataset = await processDataset(text, file.name);
      if (dataset) {
        setOwnDataset(dataset);
        setNotification({ msg: "CSV Procesado correctamente", type: 'success' });
      }
    } catch (err: any) {
      setNotification({ msg: err.message || "Error al procesar el archivo local", type: 'error' });
    } finally {
      setIsLoading(false);
      if (csvInputRef.current) csvInputRef.current.value = "";
    }
  };

  const startLiveSession = async (type: 'support' | 'context') => {
    const isActive = type === 'support' ? isLiveActive : isContextLiveActive;
    if (isActive) { stopLiveSession(); return; }
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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

  // RENDERIZADO CONDICIONAL DE VISTAS
  if (currentView === 'qa') {
    return <QAView onBack={() => setCurrentView('landing')} />;
  }

  if (currentView === 'billing') {
    return <BillingView onBack={() => setCurrentView('app')} />;
  }

  if (currentView === 'landing') {
    return <LandingView onStart={() => setCurrentView('app')} />;
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] text-[#0f172a] font-sans overflow-hidden">
      {showOnboarding && <Onboarding onClose={() => setShowOnboarding(false)} />}
      
      {/* NOTIFICATION BANNER */}
      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-4 duration-300">
          <div className={`px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border ${
            notification.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-rose-500 text-white border-rose-400'
          }`}>
            <span className="text-lg font-black">{notification.type === 'success' ? '✓' : '⚠'}</span>
            <p className="text-xs font-black uppercase tracking-widest">{notification.msg}</p>
            <button onClick={() => setNotification(null)} className="ml-4 opacity-50 hover:opacity-100 font-bold">✕</button>
          </div>
        </div>
      )}

      {/* LEFT PANEL */}
      <aside className={`${leftCollapsed ? 'w-20' : 'w-80'} shrink-0 border-r border-slate-200 bg-white flex flex-col transition-all duration-500 z-40`}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          {!leftCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#5c56f1] text-white rounded-xl flex items-center justify-center font-black">G</div>
              <span className="text-lg font-black italic tracking-tighter uppercase">GPS discovery</span>
            </div>
          )}
          <button onClick={() => setLeftCollapsed(!leftCollapsed)} className="p-2 hover:bg-slate-50 rounded-xl transition text-slate-400">
            {leftCollapsed ? '→' : '←'}
          </button>
        </div>
        {!leftCollapsed && (
          <div className="flex-1 p-6 flex flex-col min-h-0">
            <DataSelector 
              dataSource={dataSource} setDataSource={setDataSource}
              selectedDataset={selectedDemoConfig as any} setSelectedDataset={(ds: any) => setSelectedDemoConfig(ds)}
              ownDataset={ownDataset} showDemoMenu={showDemoMenu} setShowDemoMenu={setShowDemoMenu}
              isHoveringCSV={isHoveringCSV} setIsHoveringCSV={setIsHoveringCSV}
              csvInputRef={csvInputRef} handleCSVUpload={handleCSVUpload}
              demoConfigs={DEMO_CONFIGS}
            />
            <SmartContext 
              chatHistory={contextChatHistory} inputText={contextInput} setInputText={setContextInput}
              isTyping={isContextTyping} isLiveActive={isContextLiveActive}
              handleSendMessage={handleSendContextMessage} startLiveSession={() => startLiveSession('context')}
              scrollRef={contextScrollRef} fileInputRef={null as any} clearHistory={() => setContextChatHistory([])}
            />
            
            <button 
              onClick={() => setCurrentView('billing')}
              className="mt-4 p-4 border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-[#5c56f1]/20 hover:bg-[#5c56f1]/5 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">💳</span>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase text-slate-900">Mejorar Plan</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">Gestionar Plan</p>
                </div>
              </div>
              <span className="text-slate-300 group-hover:text-[#5c56f1] transition-colors">→</span>
            </button>
          </div>
        )}
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-0 bg-[#f8fafc]">
        <nav className="h-24 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-8 flex justify-between items-center z-30">
          <div className="flex gap-10">
            {MAIN_TABS.map(tab => (
              <button key={tab} onClick={() => setMainNav(tab)} className={`text-[10px] font-black uppercase tracking-[0.4em] transition-all relative py-2 ${mainNav === tab ? 'text-[#5c56f1]' : 'text-slate-400 hover:text-slate-600'}`}>
                {tab}
                {mainNav === tab && <div className="absolute -bottom-1 left-0 w-full h-1 bg-[#5c56f1] rounded-full" />}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              {SUB_TABS[mainNav].map(st => (
                <button key={st} onClick={() => setSubTab(st)} className={`px-5 py-2 text-[9px] font-black rounded-lg transition-all ${subTab === st ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{st.toUpperCase()}</button>
              ))}
            </div>
          </div>
        </nav>

        <div className="flex-1 p-8 overflow-hidden relative">
          {(isLoading || isAnalyzing) && subTab === 'Mapa de Flujo' ? (
             <div className="absolute inset-0 bg-white/90 backdrop-blur-xl z-[100] flex items-center justify-center p-12">
               <div className="w-full max-w-2xl bg-slate-900 rounded-[48px] p-12 border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.3)] overflow-hidden relative text-white">
                  <p className="text-center font-black animate-pulse uppercase tracking-[0.4em]">Sincronizando Trazas Digitales...</p>
                  <div className="mt-8 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#5c56f1] animate-[loading_2s_ease-in-out_infinite]"></div>
                  </div>
               </div>
             </div>
          ) : null}

          {selectedDataset ? (
            <>
              {mainNav === 'EXPLORAR' && subTab === 'Mapa de Flujo' && <ProcessGraph dataset={selectedDataset} animationSpeed={animationSpeed} setAnimationSpeed={setAnimationSpeed} />}
              {mainNav === 'EXPLORAR' && subTab === 'Estadísticas' && <Statistics dataset={selectedDataset} />}
              {mainNav === 'EXPLORAR' && subTab === 'Colaboradores' && <Collaborators onNotify={(msg, type) => setNotification({ msg, type })} />}
              {mainNav === 'MEJORAR' && subTab === 'Iniciativas' && <InitiativesDashboard dataset={selectedDataset} />}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 uppercase font-black text-[10px] tracking-[0.4em]">Selecciona un proceso</div>
          )}
        </div>
      </main>

      {/* RIGHT PANEL */}
      <aside className={`${rightCollapsed ? 'w-20' : 'w-96'} shrink-0 border-l border-slate-200 bg-white flex flex-col transition-all duration-500 z-40`}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <button onClick={() => setRightCollapsed(!rightCollapsed)} className="p-2 hover:bg-slate-50 rounded-xl transition text-slate-400">{rightCollapsed ? '←' : '→'}</button>
          {!rightCollapsed && (
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button onClick={() => setToolTab('report')} className={`px-4 py-1.5 text-[8px] font-black rounded-lg transition ${toolTab === 'report' ? 'bg-white text-[#5c56f1] shadow-sm' : 'text-slate-400'}`}>REPORTES</button>
              <button onClick={() => setToolTab('chat')} className={`px-4 py-1.5 text-[8px] font-black rounded-lg transition ${toolTab === 'chat' ? 'bg-white text-[#5c56f1] shadow-sm' : 'text-slate-400'}`}>SOPORTE IA</button>
            </div>
          )}
        </div>
        {!rightCollapsed && (
          <div className="flex-1 p-6 flex flex-col min-h-0 overflow-hidden">
            {toolTab === 'chat' ? (
              <SupportAI 
                chatHistory={chatHistory} inputText={inputText} setInputText={setInputText}
                isTyping={isTyping} isLiveActive={isLiveActive}
                handleSendMessage={handleSendMessage} startLiveSession={() => startLiveSession('support')}
                scrollRef={supportScrollRef} fileInputRef={null as any} clearHistory={() => setChatHistory([])}
              />
            ) : (
              <DeckGenerator 
                isGenerating={isGeneratingDeck} selectedTemplate={selectedTemplate} setSelectedTemplate={setSelectedTemplate}
                showTemplateMenu={showTemplateMenu} setShowTemplateMenu={setShowTemplateMenu}
                showCustomPrompt={showCustomPrompt} setShowCustomPrompt={setShowCustomPrompt}
                customPrompt={customReportPrompt} setCustomPrompt={setCustomReportPrompt} onGenerate={() => setNotification({msg: "Simulación de reporte", type: 'success'})}
              />
            )}
          </div>
        )}
      </aside>
    </div>
  );
};

export default App;
