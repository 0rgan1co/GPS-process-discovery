
import React from 'react';
import { EXAMPLE_DATASETS } from '../../constants';
import { Dataset } from '../../types';

interface Props {
  dataSource: 'demo' | 'own';
  setDataSource: (source: 'demo' | 'own') => void;
  selectedDataset: Dataset;
  setSelectedDataset: (ds: Dataset) => void;
  ownDataset: Dataset | null;
  showDemoMenu: boolean;
  setShowDemoMenu: (show: boolean) => void;
  isHoveringCSV: boolean;
  setIsHoveringCSV: (hover: boolean) => void;
  csvInputRef: React.RefObject<HTMLInputElement | null>;
  handleCSVUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const DataSelector: React.FC<Props> = ({
  dataSource, setDataSource, selectedDataset, setSelectedDataset,
  ownDataset, showDemoMenu, setShowDemoMenu, isHoveringCSV,
  setIsHoveringCSV, csvInputRef, handleCSVUpload
}) => {
  return (
    <div className="shrink-0 flex flex-col gap-4 mb-6">
      <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex shadow-inner">
        <button onClick={() => { setDataSource('demo'); setSelectedDataset(EXAMPLE_DATASETS[0]); }} className={`flex-1 py-1.5 text-[9px] font-black rounded-lg transition-all ${dataSource === 'demo' ? 'bg-white text-[#5c56f1] shadow-sm' : 'text-slate-500'}`}>DEMO DATA</button>
        <button onClick={() => { setDataSource('own'); if(ownDataset) setSelectedDataset(ownDataset); }} className={`flex-1 py-1.5 text-[9px] font-black rounded-lg transition-all ${dataSource === 'own' ? 'bg-white text-[#5c56f1] shadow-sm' : 'text-slate-500'}`}>PROPIA</button>
      </div>

      {dataSource === 'demo' ? (
        <div onClick={() => setShowDemoMenu(!showDemoMenu)} className="w-full bg-white border border-slate-200 p-3 rounded-xl text-[10px] text-slate-700 font-bold flex justify-between items-center cursor-pointer hover:border-[#5c56f1]/30 transition relative shadow-sm">
          {selectedDataset.name} <span className="text-[8px] text-slate-400">▼</span>
          {showDemoMenu && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl p-2 z-[60] shadow-2xl animate-in slide-in-from-top-2">
               {EXAMPLE_DATASETS.map(ds => (
                 <button key={ds.id} onClick={() => { setSelectedDataset(ds); setShowDemoMenu(false); }} className={`w-full text-left px-4 py-2 rounded-lg text-[10px] font-bold transition ${selectedDataset.id === ds.id ? 'bg-slate-50 text-[#5c56f1]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>{ds.name}</button>
               ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3 relative group" onMouseEnter={() => setIsHoveringCSV(true)} onMouseLeave={() => setIsHoveringCSV(false)}>
           <div 
             onClick={() => csvInputRef.current?.click()} 
             className={`w-full bg-slate-50 border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-[#5c56f1]/40 transition-all cursor-pointer ${ownDataset ? 'p-3' : 'p-6'}`}
           >
             {ownDataset ? (
               <div className="flex flex-col items-center text-center space-y-1">
                 <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600 text-lg">✓</div>
                 <div className="space-y-0.5">
                   <p className="text-[9px] font-black text-slate-900 leading-tight truncate max-w-[140px]">{ownDataset.name}.csv</p>
                   <p className="text-[7px] font-bold text-slate-400 uppercase">Cargado</p>
                 </div>
               </div>
             ) : (
               <>
                 <div className="text-xl">📄</div>
                 <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-[#5c56f1]">Cargar CSV</p>
               </>
             )}
           </div>
           
           {isHoveringCSV && !ownDataset && (
             <div 
               onClick={() => csvInputRef.current?.click()}
               className="absolute top-0 left-0 w-full h-full bg-white/95 backdrop-blur-sm z-[60] rounded-2xl p-4 flex flex-col justify-center animate-in fade-in duration-200 border border-[#5c56f1]/20 cursor-pointer shadow-xl"
             >
                <div className="space-y-3 pointer-events-none">
                  <span className="text-[9px] font-black text-[#5c56f1] uppercase tracking-[0.3em] block border-b border-slate-100 pb-1">REQUERIMIENTOS</span>
                  <div className="grid grid-cols-2 gap-2">
                     {['Case ID', 'Activity', 'Timestamp'].map(field => (
                       <div key={field} className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-[#5c56f1]"></div>
                          <span className="text-[8px] font-black text-slate-500 uppercase">{field}</span>
                       </div>
                     ))}
                  </div>
                  <div className="text-center pt-2">
                    <span className="text-[8px] font-black text-[#5c56f1] uppercase animate-pulse">Haz clic para subir</span>
                  </div>
                </div>
             </div>
           )}
           <input type="file" ref={csvInputRef} accept=".csv" className="hidden" onChange={handleCSVUpload} />
        </div>
      )}
    </div>
  );
};

export default DataSelector;
