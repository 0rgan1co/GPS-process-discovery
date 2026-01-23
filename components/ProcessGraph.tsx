
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { 
  select, 
  zoom, 
  zoomIdentity, 
  max, 
  forceSimulation, 
  forceLink, 
  forceManyBody, 
  forceY, 
  forceX, 
  forceCollide, 
  scaleLinear, 
  drag,
  Simulation,
  ZoomBehavior
} from 'd3';
import { Dataset, ProcessNode, ProcessLink, CasePath } from '../types';

interface Props {
  dataset: Dataset;
  animationSpeed: number;
  setAnimationSpeed: (speed: number) => void;
}

interface ActiveToken {
  caseId: string;
  source: string;
  target: string;
  progress: number;
  isCritical: boolean;
}

const ProcessGraph: React.FC<Props> = ({ dataset, animationSpeed, setAnimationSpeed }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, any> | null>(null);
  const simulationRef = useRef<Simulation<any, any> | null>(null);
  
  const [simplification, setSimplification] = useState(0.85);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false); 
  const [isRevealing, setIsRevealing] = useState(true); 
  const [isPausedAtEnd, setIsPausedAtEnd] = useState(false);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [simulatedTime, setSimulatedTime] = useState<Date>(new Date());

  const timeRange = useMemo(() => {
    const start = new Date(dataset.stats.start);
    const end = new Date(dataset.stats.end);
    return { 
      start, 
      end, 
      totalMs: Math.max(1000, end.getTime() - start.getTime()) 
    };
  }, [dataset.stats.start, dataset.stats.end]);

  useEffect(() => {
    let animationFrame: number;
    let lastTimestamp = performance.now();

    const frame = (now: number) => {
      if (isPlaying && !isPausedAtEnd && !isRevealing) {
        const deltaSeconds = (now - lastTimestamp) / 1000;
        const increment = deltaSeconds * 0.015 * animationSpeed;
        
        setGlobalProgress(prev => {
          const next = prev + increment;
          if (next >= 1) {
            setIsPausedAtEnd(true);
            return 1;
          }
          return next;
        });
      }
      lastTimestamp = now;
      animationFrame = requestAnimationFrame(frame);
    };

    animationFrame = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, isPausedAtEnd, isRevealing, animationSpeed]);

  useEffect(() => {
    let timer: number;
    if (isPausedAtEnd && isPlaying && !isRevealing) {
      timer = window.setTimeout(() => {
        setIsPausedAtEnd(false);
        setGlobalProgress(0);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [isPausedAtEnd, isPlaying, isRevealing]);

  useEffect(() => {
    const currentMs = timeRange.start.getTime() + (timeRange.totalMs * globalProgress);
    setSimulatedTime(new Date(currentMs));
  }, [globalProgress, timeRange]);

  const filteredData = useMemo(() => {
    if (dataset.links.length === 0) return { nodes: dataset.nodes, links: [] };
    const sortedLinks = [...dataset.links].sort((a, b) => b.weight - a.weight);
    const limit = Math.max(1, Math.ceil(simplification * sortedLinks.length));
    const activeLinks = sortedLinks.slice(0, limit);
    const usedIds = new Set(activeLinks.flatMap(l => [l.source, l.target]));
    
    return {
      nodes: dataset.nodes.filter(n => usedIds.has(n.id)).map((n, i) => ({ 
        ...n, 
        index: i 
      })),
      links: activeLinks.map(l => ({ ...l }))
    };
  }, [dataset, simplification]);

  const handleFitView = useCallback((immediate = false) => {
    if (!svgRef.current || !gRef.current || !zoomRef.current) return;
    const bounds = gRef.current.getBBox();
    if (!bounds || bounds.width === 0) return;
    
    const fullWidth = svgRef.current.clientWidth;
    const fullHeight = svgRef.current.clientHeight;
    const midX = bounds.x + bounds.width / 2;
    const midY = bounds.y + bounds.height / 2;
    const scale = 0.92 / Math.max(bounds.width / fullWidth, bounds.height / fullHeight);

    const transform = zoomIdentity
      .translate(fullWidth / 2, fullHeight / 2)
      .scale(Math.min(scale, 1.2))
      .translate(-midX, -midY);

    if (immediate) {
      select(svgRef.current).call(zoomRef.current.transform as any, transform);
    } else {
      select(svgRef.current).transition().duration(700).call(zoomRef.current.transform as any, transform);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      setTimeout(() => handleFitView(false), 300);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('resize', () => handleFitView(true));
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('resize', () => handleFitView(true));
    };
  }, [handleFitView]);

  const calculatePath = (d: any) => {
    const dx = d.target.x - d.source.x;
    const dy = d.target.y - d.source.y;
    const dr = Math.sqrt(dx * dx + dy * dy) * 1.5;
    return `M${d.source.x},${d.source.y} A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
  };

  useEffect(() => {
    if (!svgRef.current) return;
    setIsRevealing(true); 
    setIsPlaying(false);  

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const svg = select(svgRef.current);
    
    svg.select(".main-group").remove();
    const g = svg.append("g").attr("class", "main-group");
    // @ts-ignore
    gRef.current = g.node();

    const zoomInstance = zoom<SVGSVGElement, any>()
      .scaleExtent([0.1, 5])
      .on("zoom", (event) => { g.attr("transform", event.transform); });
    zoomRef.current = zoomInstance;
    svg.call(zoomInstance);

    const { nodes, links } = filteredData;
    const maxWeight = max(dataset.links, d => d.weight) || 1;

    const simulation = forceSimulation(nodes as any)
      .force("link", forceLink(links).id((d: any) => d.id).distance(250).strength(0.7))
      .force("charge", forceManyBody().strength(-4000))
      .force("y", forceY((d: any) => (d.index + 1) * (height / (nodes.length + 1))).strength(1.5))
      .force("x", forceX(width / 2).strength(0.1))
      .force("collision", forceCollide().radius(140));

    simulationRef.current = simulation;

    const linkLayer = g.append("g").attr("class", "links-layer");
    const nodeLayer = g.append("g").attr("class", "nodes-layer");
    if (g.select(".tokens-layer").empty()) g.append("g").attr("class", "tokens-layer");

    const colorScale = scaleLinear<string>()
      .domain([0, maxWeight])
      .range(["#f1f5f9", "#5c56f1"]);

    const linkElements = linkLayer.selectAll("path")
      .data(links)
      .enter().append("path")
      .attr("class", "link-path")
      .attr("data-id", (d: any) => `${d.source.id}->${d.target.id}`)
      .attr("fill", "none")
      .attr("stroke", d => colorScale(d.weight))
      .attr("stroke-width", d => Math.max(4, (d.weight / maxWeight) * 18))
      .attr("stroke-linecap", "round")
      .style("opacity", 0);

    const nodeElements = nodeLayer.selectAll("g")
      .data(nodes).enter().append("g")
      .attr("class", "node-group")
      .attr("data-node-id", (d: any) => d.id)
      .on("click", (e, d: any) => setSelectedNode(d.id))
      .style("cursor", "grab")
      .style("opacity", 0);

    nodeElements.append("rect")
      .attr("class", "node-rect")
      .attr("width", 240).attr("height", 50).attr("x", -120).attr("y", -25).attr("rx", 15)
      .attr("fill", "white")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", 1.5)
      .style("filter", "drop-shadow(0 4px 6px rgba(0,0,0,0.05))");

    nodeElements.append("text")
      .attr("class", "node-text")
      .text((d: any) => d.label).attr("text-anchor", "middle").attr("y", 5)
      .attr("fill", "#1e293b").attr("font-size", "10px").attr("font-weight", "900")
      .attr("class", "uppercase tracking-tighter");

    const dragInstance = drag<SVGGElement, any>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null; d.fy = null;
      });

    nodeElements.call(dragInstance as any);

    simulation.on("tick", () => {
      linkElements.attr("d", calculatePath);
      nodeElements.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    const revealTimeline = async () => {
      for (let i = 0; i < 150; i++) simulation.tick();
      linkElements.transition().duration(1500).delay((d, i) => i * 150).style("opacity", 0.4).attr("d", calculatePath);
      nodeElements.transition().duration(800).delay((d, i) => 1000 + (i * 100)).style("opacity", 1).attr("transform", (d: any) => `translate(${d.x},${d.y})`);
      setTimeout(() => { setIsRevealing(false); setIsPlaying(false); handleFitView(false); }, 2500);
    };
    revealTimeline();
  }, [filteredData, dataset, handleFitView]);

  const { activeTokens, activeNodes } = useMemo(() => {
    if (isRevealing || !dataset.casePaths) return { activeTokens: [] as ActiveToken[], activeNodes: new Set<string>() };
    const results: ActiveToken[] = [];
    const activeNodesSet = new Set<string>();
    const currentTimeMs = simulatedTime.getTime();
    dataset.casePaths.forEach(path => {
      const pastEvents = path.events.filter(e => new Date(e.timestamp).getTime() <= currentTimeMs);
      if (pastEvents.length > 0) {
        const lastOccurredIndex = pastEvents.length - 1;
        if (lastOccurredIndex < path.events.length - 1) {
          const startEv = path.events[lastOccurredIndex];
          const endEv = path.events[lastOccurredIndex + 1];
          const tStart = new Date(startEv.timestamp).getTime();
          const tEnd = new Date(endEv.timestamp).getTime();
          const duration = tEnd - tStart;
          const progress = duration === 0 ? 1 : (currentTimeMs - tStart) / duration;
          results.push({
            caseId: path.id, source: startEv.activity, target: endEv.activity,
            progress: Math.min(1, progress), isCritical: duration > (timeRange.totalMs * 0.15)
          });
          activeNodesSet.add(startEv.activity); activeNodesSet.add(endEv.activity);
        }
      }
    });
    return { activeTokens: results, activeNodes: activeNodesSet };
  }, [dataset.casePaths, simulatedTime, timeRange.totalMs, isRevealing]);

  useEffect(() => {
    if (!gRef.current || isRevealing) return;
    const g = select(gRef.current);
    const updateVisuals = () => {
      const pathMap = new Map<string, SVGPathElement>();
      g.selectAll<SVGPathElement, any>(".link-path").each(function() {
        const id = select(this).attr("data-id");
        if (id) pathMap.set(id, this);
      });
      const tokenSelection = g.select(".tokens-layer").selectAll<SVGGElement, ActiveToken>("g.token-group")
        .data(activeTokens, d => d.caseId);
      tokenSelection.exit().remove();
      const tokenEnter = tokenSelection.enter().append("g").attr("class", "token-group");
      tokenEnter.append("circle").attr("r", d => d.isCritical ? 6 : 4).attr("fill", d => d.isCritical ? "#f43f5e" : "#5c56f1");
      tokenEnter.append("text").attr("class", "case-label").attr("text-anchor", "middle").attr("dy", -10).attr("fill", "#475569").style("font-size", "5px").style("font-weight", "900").text(d => d.caseId);
      tokenSelection.merge(tokenEnter).attr("transform", d => {
        const pathEl = pathMap.get(`${d.source}->${d.target}`);
        if (!pathEl) return "translate(-1000, -1000)";
        try {
          const point = pathEl.getPointAtLength(d.progress * pathEl.getTotalLength());
          return `translate(${point.x}, ${point.y})`;
        } catch (e) { return "translate(-1000, -1000)"; }
      });
      g.selectAll<SVGGElement, any>(".node-group").each(function(d: any) {
        const isActive = activeNodes.has(d.id);
        const isSelected = selectedNode === d.id;
        select(this).select("rect").attr("stroke", isActive || isSelected ? "#5c56f1" : "#e2e8f0").attr("stroke-width", isSelected ? 4 : isActive ? 2.5 : 1.5);
      });
    };
    if (simulationRef.current) simulationRef.current.on("tick.tokens", updateVisuals);
    updateVisuals();
    return () => { if (simulationRef.current) simulationRef.current.on("tick.tokens", null); };
  }, [activeTokens, activeNodes, isRevealing, selectedNode]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isRevealing) return;
    setGlobalProgress(parseFloat(e.target.value));
    setIsPausedAtEnd(false); setIsPlaying(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full h-full bg-[#fcfdfe] border border-slate-200 rounded-[32px] overflow-hidden shadow-2xl ${isFullscreen ? 'fixed inset-0 z-[100] rounded-none' : ''}`}>
      <div id="tour-flow-map" className="absolute inset-0 z-10">
        <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      </div>

      {isRevealing && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
           <div className="bg-slate-900 px-6 py-2 rounded-full border border-white/10 shadow-2xl flex items-center gap-3">
              <div className="w-3 h-3 border-2 border-[#5c56f1] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[8px] font-black text-white uppercase tracking-[0.4em]">Descubriendo Flujo...</span>
           </div>
        </div>
      )}

      {/* DASHBOARD RELOJ - ULTRA COMPACTO */}
      <div className={`absolute top-3 right-3 z-50 transition-all duration-1000 ${isRevealing ? 'opacity-0 translate-y-[-20px]' : 'opacity-100 translate-y-0'}`}>
        <div className="bg-white/90 backdrop-blur-md border border-slate-200 p-2 px-3 rounded-2xl shadow-xl flex flex-col items-center gap-1 min-w-[140px]">
           <div className="flex items-center gap-1.5 self-start">
              <div className={`w-1 h-1 rounded-full ${isPausedAtEnd ? 'bg-orange-500' : isPlaying ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
              <span className="text-[6px] font-black text-slate-400 uppercase tracking-widest">Análisis Temporal</span>
           </div>
           <div className="flex flex-col items-center">
              <span className="text-[7px] font-bold text-slate-500 leading-none mb-0.5">
                {simulatedTime.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </span>
              <span className="text-[14px] font-mono font-black text-[#5c56f1] leading-none">
                {simulatedTime.getHours().toString().padStart(2, '0')}:{simulatedTime.getMinutes().toString().padStart(2, '0')}:{simulatedTime.getSeconds().toString().padStart(2, '0')}
              </span>
           </div>
           <input type="range" min="0" max="1" step="0.001" value={globalProgress} onChange={handleSeek} className="w-full h-0.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-[#5c56f1] mt-1" />
        </div>
      </div>

      {/* CONTROLADOR CENTRAL - ULTRA COMPACTO */}
      <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-50 transition-all duration-1000 ${isRevealing ? 'opacity-0 translate-y-[20px]' : 'opacity-100 translate-y-0'}`}>
        <div className="bg-white/90 backdrop-blur-md border border-slate-200 p-1.5 px-3 rounded-2xl shadow-xl flex items-center gap-4 h-[38px]">
           <button onClick={() => { setGlobalProgress(0); setIsPlaying(false); }} className="text-slate-400 hover:text-slate-900 transition-colors text-[10px]">⏮</button>
           <button onClick={() => setIsPlaying(!isPlaying)} className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] bg-[#5c56f1] text-white shadow-md active:scale-90 transition-all">
             {isPlaying && !isPausedAtEnd ? '⏸' : '▶'}
           </button>
           <div className="flex flex-col items-center border-l border-slate-100 pl-3">
              <span className="text-[5px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Velocidad</span>
              <div className="flex gap-0.5">
                 {[0.5, 1, 2].map((speed) => (
                   <button key={speed} onClick={() => setAnimationSpeed(speed)} className={`w-6 h-3.5 rounded text-[6px] font-black transition-all ${animationSpeed === speed ? 'bg-[#5c56f1] text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>{speed}x</button>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* BOTONES SUPERIORES IZQUIERDA */}
      <div className="absolute top-3 left-3 z-50 flex items-center gap-1.5">
        <button onClick={toggleFullscreen} className="bg-white/90 backdrop-blur-md border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 shadow-md font-black text-[7px] text-slate-700 uppercase tracking-widest">{isFullscreen ? 'RESTAURAR' : 'MAXIMIZAR'}</button>
        <button onClick={() => handleFitView(false)} className="bg-white/90 backdrop-blur-md border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 shadow-md font-black text-[7px] text-slate-700 uppercase tracking-widest">CENTRAR</button>
      </div>

      {/* RESOLUCION (IZQUIERDA) - ULTRA COMPACTA - DESHABILITADA */}
      <div className={`absolute bottom-3 left-3 z-50 transition-all duration-1000 ${isRevealing ? 'opacity-0 translate-y-[20px]' : 'opacity-100 translate-y-0'}`}>
        <div className="bg-white/90 backdrop-blur-md px-3 rounded-2xl border border-slate-200 shadow-xl flex items-center gap-2 h-[38px] min-w-[110px] opacity-60 grayscale">
          <div className="flex flex-col">
            <span className="text-[5px] font-black text-[#5c56f1] uppercase leading-none">Resolución</span>
            <span className="text-[8px] font-black text-slate-800 leading-none">{Math.round(simplification * 100)}%</span>
          </div>
          <input 
            type="range" 
            min="0.05" 
            max="1.0" 
            step="0.05" 
            value={simplification} 
            onChange={(e) => setSimplification(parseFloat(e.target.value))} 
            disabled
            className="w-12 h-0.5 bg-slate-100 rounded-full appearance-none cursor-not-allowed accent-slate-400" 
          />
        </div>
      </div>

      {/* LEYENDA (DERECHA) - ULTRA COMPACTA */}
      <div className={`absolute bottom-3 right-3 z-50 transition-all duration-1000 ${isRevealing ? 'opacity-0 translate-y-[20px]' : 'opacity-100 translate-y-0'}`}>
        <div className="bg-white/90 backdrop-blur-md px-3 rounded-2xl border border-slate-200 shadow-xl flex flex-col justify-center gap-1 h-[38px] min-w-[110px]">
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-[#5c56f1]"></div>
            <span className="text-[6px] font-black text-slate-400 uppercase tracking-tight">Actividad en curso</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-[#f43f5e] animate-pulse"></div>
            <span className="text-[6px] font-black text-slate-400 uppercase tracking-tight">Demora &gt; 15% total</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessGraph;
