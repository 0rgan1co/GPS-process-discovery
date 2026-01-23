
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
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
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, any> | null>(null);
  const simulationRef = useRef<d3.Simulation<any, any> | null>(null);
  
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
    // Escala aumentada de 0.8 a 0.92 para llenar mejor el contenedor
    const scale = 0.92 / Math.max(bounds.width / fullWidth, bounds.height / fullHeight);

    const transform = d3.zoomIdentity
      .translate(fullWidth / 2, fullHeight / 2)
      .scale(Math.min(scale, 1.2))
      .translate(-midX, -midY);

    if (immediate) {
      d3.select(svgRef.current).call(zoomRef.current.transform, transform);
    } else {
      d3.select(svgRef.current).transition().duration(700).call(zoomRef.current.transform, transform);
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

  // Efecto para centrar automáticamente cuando cambia el estado de fullscreen o el tamaño
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      // Pequeño delay para permitir que el navegador recalcule el layout antes de centrar
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
    const svg = d3.select(svgRef.current);
    
    svg.select(".main-group").remove();
    const g = svg.append("g").attr("class", "main-group");
    // @ts-ignore
    gRef.current = g.node();

    const zoom = d3.zoom<SVGSVGElement, any>()
      .scaleExtent([0.1, 5])
      .on("zoom", (event) => { g.attr("transform", event.transform); });
    zoomRef.current = zoom;
    svg.call(zoom);

    const { nodes, links } = filteredData;
    const maxWeight = d3.max(dataset.links, d => d.weight) || 1;

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(250).strength(0.7))
      .force("charge", d3.forceManyBody().strength(-4000))
      .force("y", d3.forceY((d: any) => (d.index + 1) * (height / (nodes.length + 1))).strength(1.5))
      .force("x", d3.forceX(width / 2).strength(0.1))
      .force("collision", d3.forceCollide().radius(140));

    simulationRef.current = simulation;

    const linkLayer = g.append("g").attr("class", "links-layer");
    const nodeLayer = g.append("g").attr("class", "nodes-layer");
    if (g.select(".tokens-layer").empty()) g.append("g").attr("class", "tokens-layer");

    const colorScale = d3.scaleLinear<string>()
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
      .style("filter", "drop-shadow(0 4px 6px rgba(0,0,0,0.05))")
      .style("transition", "all 0.3s ease");

    nodeElements.append("text")
      .attr("class", "node-text")
      .text((d: any) => d.label).attr("text-anchor", "middle").attr("y", 5)
      .attr("fill", "#1e293b").attr("font-size", "10px").attr("font-weight", "900")
      .attr("class", "uppercase tracking-tighter")
      .style("transition", "all 0.3s ease");

    const drag = d3.drag<SVGGElement, any>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
        d3.select(event.sourceEvent.target.closest(".node-group")).style("cursor", "grabbing");
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d3.select(event.sourceEvent.target.closest(".node-group")).style("cursor", "grab");
      });

    nodeElements.call(drag as any);

    simulation.on("tick", () => {
      linkElements.attr("d", calculatePath);
      nodeElements.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    const revealTimeline = async () => {
      for (let i = 0; i < 150; i++) simulation.tick();
      
      linkElements.transition()
        .duration(1500)
        .delay((d, i) => i * 150)
        .style("opacity", 0.4)
        .attr("d", calculatePath);

      nodeElements.transition()
        .duration(800)
        .delay((d, i) => 1000 + (i * 100))
        .style("opacity", 1)
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);

      setTimeout(() => {
        setIsRevealing(false);
        setIsPlaying(false);
        handleFitView(false);
      }, 2500);
    };

    revealTimeline();
  }, [filteredData, dataset, handleFitView, selectedNode]);

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
            caseId: path.id,
            source: startEv.activity,
            target: endEv.activity,
            progress: Math.min(1, progress),
            isCritical: duration > (timeRange.totalMs * 0.15)
          });

          activeNodesSet.add(startEv.activity);
          activeNodesSet.add(endEv.activity);
        }
      }
    });
    return { activeTokens: results, activeNodes: activeNodesSet };
  }, [dataset.casePaths, simulatedTime, timeRange.totalMs, isRevealing]);

  useEffect(() => {
    if (!gRef.current || isRevealing) return;
    const g = d3.select(gRef.current);
    let tokenLayer = g.select(".tokens-layer");
    if (tokenLayer.empty()) tokenLayer = g.append("g").attr("class", "tokens-layer");

    const updateVisuals = () => {
      const pathMap = new Map<string, SVGPathElement>();
      g.selectAll<SVGPathElement, any>(".link-path").each(function() {
        const id = d3.select(this).attr("data-id");
        if (id) pathMap.set(id, this);
      });

      const tokenSelection = tokenLayer.selectAll<SVGGElement, ActiveToken>("g.token-group")
        .data(activeTokens, d => d.caseId);

      tokenSelection.exit().remove();

      const tokenEnter = tokenSelection.enter()
        .append("g")
        .attr("class", "token-group");

      tokenEnter.append("circle")
        .attr("r", d => d.isCritical ? 7 : 4.5)
        .attr("fill", d => d.isCritical ? "#f43f5e" : "#5c56f1")
        .style("filter", "drop-shadow(0 0 5px rgba(92,86,241,0.4))");

      tokenEnter.append("text")
        .attr("class", "case-label")
        .attr("text-anchor", "middle")
        .attr("dy", -12) 
        .attr("fill", "#475569") 
        .style("font-size", "5px") 
        .style("font-weight", "900")
        .style("pointer-events", "none")
        .style("text-transform", "uppercase")
        .text(d => d.caseId);

      tokenSelection.merge(tokenEnter)
        .attr("transform", d => {
          const pathEl = pathMap.get(`${d.source}->${d.target}`);
          if (!pathEl) return "translate(-1000, -1000)";
          try {
            const point = pathEl.getPointAtLength(d.progress * pathEl.getTotalLength());
            return `translate(${point.x}, ${point.y})`;
          } catch (e) {
            return "translate(-1000, -1000)";
          }
        });

      g.selectAll<SVGGElement, any>(".node-group").each(function(d: any) {
        const isActive = activeNodes.has(d.id);
        const isSelected = selectedNode === d.id;
        const rect = d3.select(this).select("rect");
        const text = d3.select(this).select("text");

        if (isActive || isSelected) {
          rect
            .attr("stroke", "#5c56f1")
            .attr("stroke-width", isSelected ? 4 : 2.5)
            .attr("fill", "white")
            .style("filter", "drop-shadow(0 0 12px rgba(92, 86, 241, 0.25))");
          text
            .attr("fill", "#5c56f1");
        } else {
          rect
            .attr("stroke", "#e2e8f0")
            .attr("stroke-width", 1.5)
            .attr("fill", "white")
            .style("filter", "drop-shadow(0 4px 6px rgba(0,0,0,0.05))");
          text
            .attr("fill", "#1e293b");
        }
      });
    };

    if (simulationRef.current) {
      simulationRef.current.on("tick.tokens", updateVisuals);
    }
    
    updateVisuals();

    return () => {
      if (simulationRef.current) simulationRef.current.on("tick.tokens", null);
    };
  }, [activeTokens, activeNodes, isRevealing, selectedNode]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isRevealing) return;
    const val = parseFloat(e.target.value);
    setGlobalProgress(val);
    setIsPausedAtEnd(false);
    setIsPlaying(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full h-full bg-[#fcfdfe] border border-slate-200 rounded-[32px] overflow-hidden shadow-2xl ${isFullscreen ? 'fixed inset-0 z-[100] rounded-none' : ''}`}>
      <div id="tour-flow-map" className="absolute inset-0 z-10">
        <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      </div>

      {isRevealing && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
           <div className="bg-slate-900 px-8 py-3 rounded-full border border-white/10 shadow-2xl flex items-center gap-4">
              <div className="w-4 h-4 border-2 border-[#5c56f1] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Descubriendo Flujo...</span>
           </div>
        </div>
      )}

      {/* DASHBOARD RELOJ */}
      <div className={`absolute top-4 right-4 z-50 transition-all duration-1000 ${isRevealing ? 'opacity-0 pointer-events-none translate-y-[-20px]' : 'opacity-100 translate-y-0'}`}>
        <div className="bg-white/95 backdrop-blur-2xl border border-slate-200 p-2.5 px-5 rounded-[24px] shadow-2xl flex flex-col items-center gap-1.5 min-w-[200px]">
           <div className="flex items-center gap-2">
             <div className={`w-1.5 h-1.5 rounded-full ${isPausedAtEnd ? 'bg-orange-500 animate-pulse' : isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
             <span className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em]">
               {isPausedAtEnd ? 'Loop Activo' : 'Análisis Temporal'}
             </span>
           </div>
           
           <div className="flex flex-col items-center -mt-0.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                {simulatedTime.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </span>
              <span className="text-[20px] font-mono font-black text-[#5c56f1] italic tracking-tighter leading-tight mt-1">
                {simulatedTime.getHours().toString().padStart(2, '0')}:
                {simulatedTime.getMinutes().toString().padStart(2, '0')}:
                {simulatedTime.getSeconds().toString().padStart(2, '0')}
              </span>
           </div>

           <div className="w-full mt-0.5 relative px-1">
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.001" 
                value={globalProgress} 
                onChange={handleSeek}
                className="w-full h-1 bg-slate-100 rounded-full appearance-none cursor-pointer accent-[#5c56f1] outline-none"
              />
           </div>
        </div>
      </div>

      {/* CONTROLADOR CENTRAL */}
      <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-1000 ${isRevealing ? 'opacity-0 pointer-events-none translate-y-[20px]' : 'opacity-100 translate-y-0'}`}>
        <div className="bg-white/95 backdrop-blur-2xl border border-slate-200 p-2 px-6 rounded-[28px] shadow-2xl flex items-center gap-6 h-[56px]">
           <button onClick={() => { setGlobalProgress(0); setIsPlaying(false); setIsPausedAtEnd(false); }} className="text-slate-400 hover:text-slate-900 transition-colors text-sm" title="Reiniciar">⏮</button>
           <button onClick={() => { setIsPlaying(!isPlaying); if (isPausedAtEnd) setIsPausedAtEnd(false); }} className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all ${isPlaying && !isPausedAtEnd ? 'bg-slate-100 text-slate-900 shadow-inner' : 'bg-[#5c56f1] text-white shadow-lg'}`}>
             {isPlaying && !isPausedAtEnd ? '⏸' : '▶'}
           </button>
           
           <div className="flex flex-col items-center border-l border-slate-100 pl-6 pr-2">
              <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Velocidad</span>
              <div className="flex gap-1.5">
                 {[0.5, 1, 2].map((speed) => (
                   <button
                     key={speed}
                     onClick={() => { setAnimationSpeed(speed); setIsPausedAtEnd(false); }}
                     className={`w-8 h-5 rounded-md text-[8px] font-black transition-all flex items-center justify-center ${
                       animationSpeed === speed 
                         ? 'bg-[#5c56f1] text-white shadow-[0_0_10px_rgba(92,86,241,0.3)]' 
                         : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                     }`}
                   >
                     {speed}x
                   </button>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* BOTONES SUPERIORES IZQUIERDA */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-3">
        <button onClick={toggleFullscreen} className="bg-white/95 backdrop-blur-xl border border-slate-200 px-5 py-2.5 rounded-[18px] hover:bg-slate-50 transition-all shadow-xl font-black text-[9px] text-slate-800 uppercase tracking-widest">{isFullscreen ? 'RESTAURAR' : 'MAXIMIZAR'}</button>
        <button onClick={() => handleFitView(false)} className="bg-white/95 backdrop-blur-xl border border-slate-200 px-5 py-2.5 rounded-[18px] hover:bg-slate-50 transition-all shadow-xl font-black text-[9px] text-slate-800 uppercase tracking-widest">CENTRAR</button>
      </div>

      {/* RESOLUCION (IZQUIERDA) */}
      <div className={`absolute bottom-4 left-4 z-50 transition-all duration-1000 ${isRevealing ? 'opacity-0 pointer-events-none translate-y-[20px]' : 'opacity-100 translate-y-0'}`}>
        <div className="bg-white/95 backdrop-blur-2xl p-2 px-5 rounded-[28px] border border-slate-200 shadow-2xl flex items-center gap-4 h-[56px] min-w-[200px]">
          <div className="flex flex-col min-w-[60px]">
            <span className="text-[7px] font-black text-[#5c56f1] uppercase tracking-[0.2em] mb-0.5">Resolución</span>
            <span className="text-[10px] font-black text-slate-900 leading-none">{Math.round(simplification * 100)}%</span>
          </div>
          <input type="range" min="0.05" max="1.0" step="0.05" value={simplification} onChange={(e) => setSimplification(parseFloat(e.target.value))} className="w-24 h-1 bg-slate-100 rounded-full appearance-none cursor-pointer accent-[#5c56f1]" />
        </div>
      </div>

      {/* REFERENCIA DE CASOS (DERECHA) */}
      <div className={`absolute bottom-4 right-4 z-50 transition-all duration-1000 ${isRevealing ? 'opacity-0 pointer-events-none translate-y-[20px]' : 'opacity-100 translate-y-0'}`}>
        <div className="bg-white/95 backdrop-blur-2xl px-5 py-2 rounded-[28px] border border-slate-200 shadow-2xl flex flex-col justify-center gap-1.5 h-[56px] min-w-[160px]">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#5c56f1] shadow-[0_0_6px_rgba(92,86,241,0.4)]"></div>
            <span className="text-[7px] font-black text-slate-500 uppercase tracking-tight leading-none">Actividad en curso</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#f43f5e] shadow-[0_0_6px_rgba(244,63,94,0.4)]"></div>
            <span className="text-[7px] font-black text-slate-500 uppercase tracking-tight leading-none">Demora &gt; 15% total</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessGraph;
