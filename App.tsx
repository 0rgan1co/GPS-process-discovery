
import React, { useState, useEffect, useRef } from 'react';
import { EXAMPLE_DATASETS } from './constants';
import { Dataset, ChatMessage } from './types';
import ProcessGraph from './components/ProcessGraph';
import { getAIResponse, generateExecutivePresentation } from './services/geminiService';
import { saveLead } from './lib/supabase';
import { parseCSVToDataset } from './utils/dataProcessor';
import { GoogleGenAI, Modality } from '@google/genai';
import { decode, decodeAudioData, createBlob } from './utils/audio';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

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
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [mainNav, setMainNav] = useState<MainTab>('EXPLORAR');
  const [subTab, setSubTab] = useState<string>('Mapa de Flujo');
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // FIX: Added missing toolTab state to manage Right Panel tabs
  const [toolTab, setToolTab] = useState<'report' | 'chat'>('report');

  useEffect(() => {
    if (currentView === 'app') {
      const hasSeenOnboarding = localStorage.getItem('gps_onboarding_seen');
      if (!hasSeenOnboarding) {
        setTimeout(() => setShowOnboarding(true), 1500);
      }
    }
  }, [currentView]);

  const [dataSource, setDataSource] = useState<'demo' | 'own'>('demo');
  const [selectedDataset, setSelectedDataset] = useState<Dataset>(EXAMPLE_DATASETS[0]);
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
  const [selectedTemplate, setSelectedTemplate] = useState(PRESENTATION_TEMPLATES[0]);
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [customReportPrompt, setCustomReportPrompt] = useState('');
  const [isGeneratingDeck, setIsGeneratingDeck] = useState(false);
  const [generatedDeck, setGeneratedDeck] = useState<any>(null);

  const [userEmail, setUserEmail] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  
  const deckRef = useRef<HTMLDivElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const contextScrollRef = useRef<HTMLDivElement>(null);
  const supportScrollRef = useRef<HTMLDivElement>(null);

  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isContextLiveActive, setIsContextLiveActive] = useState(false);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const nextStartTimeRef = useRef(0);

  useEffect(() => { setSubTab(SUB_TABS[mainNav][0]); }, [mainNav]);
  useEffect(() => { if (notification) { const t = setTimeout(() => setNotification(null), 5000); return () => clearTimeout(t); } }, [notification]);
  
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
      `Analiza el contexto: "${textToSend}"`,
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
      setNotification({ msg: "Error al procesar CSV", type: 'error' });
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
      setNotification({ msg: "Deck generado exitosamente", type: 'success' });
    } catch (err) {
      setNotification({ msg: "Error al generar el reporte", type: 'error' });
    } finally {
      setIsGeneratingDeck(false);
    }
  };

  const startLiveSession = async (type: 'support' | 'context') => {
    const isActive = type === 'support' ? isLiveActive : isContextLiveActive;
    if (isActive) { stopLiveSession(); return; }
    try {
      // Create a new GoogleGenAI instance right before making an API call to ensure it uses latest key
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
              // Solely rely on sessionPromise resolves to send input to avoid race conditions
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

  if (currentView === 'landing') {
    return <LandingView onStart={() => setCurrentView('app')} />;
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] text-[#0f172a] font-sans overflow-hidden">
      {showOnboarding && <Onboarding onClose={() => setShowOnboarding(false)} />}
      {notification && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 px-8 py-4 rounded-2xl z-[300] shadow-2xl animate-in slide-in-from-top-10 text-[10px] font-black uppercase tracking-widest ${notification.type === 'success' ? 'bg-[#5c56f1] text-white' : 'bg-red-500 text-white'}`}>
          {notification.msg}
        </div>
      )}

      {showEmailModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[250] flex items-center justify-center p-6">
          <div className="bg-white border border-slate-200 p-10 rounded-[40px] max-w-md w-full shadow-2xl text-center space-y-6">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">Envío de Reporte</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Confirma tu email para recibir el análisis.</p>
            <input 
              type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none focus:border-[#5c56f1]/40 transition text-[11px] font-bold text-slate-900"
            />
            <div className="flex gap-4">
              <button onClick={() => setShowEmailModal(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest">Cerrar</button>
              <button onClick={() => { setShowEmailModal(false); handleGenerateDeck(); }} className="flex-1 py-4 bg-[#5c56f1] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Confirmar</button>
            </div>
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
              selectedDataset={selectedDataset} setSelectedDataset={setSelectedDataset}
              ownDataset={ownDataset} showDemoMenu={showDemoMenu} setShowDemoMenu={setShowDemoMenu}
              isHoveringCSV={isHoveringCSV} setIsHoveringCSV={setIsHoveringCSV}
              csvInputRef={csvInputRef} handleCSVUpload={handleCSVUpload}
            />
            <SmartContext 
              chatHistory={contextChatHistory} inputText={contextInput} setInputText={setContextInput}
              isTyping={isContextTyping} isLiveActive={isContextLiveActive}
              handleSendMessage={handleSendContextMessage} startLiveSession={() => startLiveSession('context')}
              scrollRef={contextScrollRef} fileInputRef={null as any} clearHistory={() => setContextChatHistory([])}
            />
          </div>
        )}
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
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
          {mainNav === 'EXPLORAR' && subTab === 'Mapa de Flujo' && <ProcessGraph dataset={selectedDataset} animationSpeed={1} />}
          {mainNav === 'EXPLORAR' && subTab === 'Estadísticas' && <Statistics dataset={selectedDataset} />}
          {mainNav === 'EXPLORAR' && subTab === 'Colaboradores' && <Collaborators onNotify={(msg, type) => setNotification({ msg, type })} />}
          {mainNav === 'MEJORAR' && subTab === 'Iniciativas' && <InitiativesDashboard dataset={selectedDataset} />}
        </div>
      </main>

      {/* RIGHT PANEL */}
      <aside className={`${rightCollapsed ? 'w-20' : 'w-96'} shrink-0 border-l border-slate-200 bg-white flex flex-col transition-all duration-500 z-40`}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <button onClick={() => setRightCollapsed(!rightCollapsed)} className="p-2 hover:bg-slate-50 rounded-xl transition text-slate-400">
            {rightCollapsed ? '←' : '→'}
          </button>
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
                customPrompt={customReportPrompt} setCustomPrompt={setCustomReportPrompt} onGenerate={handleGenerateDeck}
              />
            )}
          </div>
        )}
      </aside>
    </div>
  );
};

export default App;
