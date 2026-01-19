
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { Dataset, ProcessNode, ProcessLink } from '../types';

interface Props {
  dataset: Dataset;
  initialAnimationSpeed?: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  'ADMIN': '#6366f1',
  'OPS': '#f59e0b',
  'CULTURA': '#10b981',
  'TALENTO': '#8b5cf6',
  'SOURCING': '#3b82f6',
  'TECH': '#ef4444',
  'FINANCE': '#10b981',
  'LOGISTICS': '#6366f1',
  'ENTRY': '#64748b',
  'FIELD': '#d946ef',
  'LEGAL': '#0f172a',
  'EXEC': '#f43f5e',
  'DEFAULT': '#cbd5e1'
};

const ProcessGraph: React.FC<Props> = ({ dataset, initialAnimationSpeed = 0.8 }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, any> | null>(null);
  
  const [simplification, setSimplification] = useState(0.85);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [speed, setSpeed] = useState(initialAnimationSpeed);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    if (dataset.links.length === 0) return { nodes: dataset.nodes, links: [] };
    const sortedLinks = [...dataset.links].sort((a, b) => b.weight - a.weight);
    const limit = Math.max(1, Math.ceil(simplification * sortedLinks.length));
    const activeLinks = sortedLinks.slice(0, limit);
    const usedIds = new Set(activeLinks.flatMap(l => [l.source, l.target]));
    if (dataset.nodes.length > 0) {
      usedIds.add(dataset.nodes[0].id);
      usedIds.add(dataset.nodes[dataset.nodes.length - 1].id);
    }
    return {
      nodes: dataset.nodes.filter(n => usedIds.has(n.id)).map((n, i) => ({ ...n, index: i })),
      links: activeLinks.map(l => ({ ...l }))
    };
  }, [dataset, simplification]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleFitView = useCallback(() => {
    if (!svgRef.current || !gRef.current || !zoomRef.current) return;
    const bounds = gRef.current.getBBox();
    if (!bounds || bounds.width === 0) return;
    const fullWidth = svgRef.current.clientWidth;
    const fullHeight = svgRef.current.clientHeight;
    const midX = bounds.x + bounds.width / 2;
    const midY = bounds.y + bounds.height / 2;
    const padding = 120;
    const scale = 0.85 / Math.max(bounds.width / (fullWidth - padding), bounds.height / (fullHeight - padding));
    d3.select(svgRef.current).transition().duration(800).ease(d3.easeCubicInOut).call(
      zoomRef.current.transform,
      d3.zoomIdentity.translate(fullWidth / 2, fullHeight / 2).scale(Math.min(scale, 1.1)).translate(-midX, -midY)
    );
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g").attr("class", "main-group");
    // @ts-ignore
    gRef.current = g.node();

    const zoom = d3.zoom<SVGSVGElement, any>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        setZoomLevel(event.transform.k);
      });
    zoomRef.current = zoom;
    svg.call(zoom);

    const { nodes, links } = filteredData;
    const maxWeight = d3.max(dataset.links, d => d.weight) || 1;

    // Simulation tuned for stability (less bounce, more control)
    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(280).strength(0.4))
      .force("charge", d3.forceManyBody().strength(-3500))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("categoryX", d3.forceX((d: any) => {
          const cats = Array.from(new Set(nodes.map((n: any) => n.category)));
          const idx = cats.indexOf(d.category);
          return (width * 0.15) + (idx * (width * 0.7) / (cats.length || 1));
      }).strength(0.6))
      .force("y", d3.forceY((d: any, i: number) => {
        const step = (height * 0.6) / (nodes.length || 1);
        return (height * 0.2) + (i * step);
      }).strength(1.5))
      .force("collision", d3.forceCollide().radius(150))
      .alphaDecay(0.05); // Faster stabilization

    const linkLayer = g.append("g").attr("class", "links");
    const nodeLayer = g.append("g").attr("class", "nodes");
    const labelLayer = g.append("g").attr("class", "labels");
    const tokenLayer = g.append("g").attr("class", "tokens");

    const colorScale = d3.scaleLinear<string>()
      .domain([0, maxWeight * 0.4, maxWeight])
      .range(["#cbd5e1", "#f59e0b", "#ef4444"]);

    const linkElements = linkLayer.selectAll("path")
      .data(links)
      .enter().append("path")
      .attr("fill", "none")
      .attr("stroke", d => colorScale(d.weight))
      .attr("stroke-width", d => Math.max(2, (d.weight / maxWeight) * 24))
      .attr("stroke-linecap", "round")
      .style("opacity", 0.45);

    const linkLabels = labelLayer.selectAll("g")
      .data(links)
      .enter().append("g");
    
    linkLabels.append("rect")
      .attr("width", 44).attr("height", 22).attr("rx", 8).attr("fill", "#ffffff").attr("stroke", "#e2e8f0")
      .style("opacity", zoomLevel < 0.6 ? 0.1 : 1);
    
    linkLabels.append("text")
      .attr("font-size", "11px").attr("font-weight", "900").attr("fill", d => d.weight > maxWeight * 0.7 ? "#ef4444" : "#475569")
      .attr("text-anchor", "middle").attr("dy", "15").attr("dx", "22").text(d => d.weight)
      .style("opacity", zoomLevel < 0.6 ? 0.2 : 1);

    const nodeElements = nodeLayer.selectAll("g")
      .data(nodes).enter().append("g")
      .on("click", (e, d: any) => setSelectedNode(d.id === selectedNode ? null : d.id))
      .call(d3.drag<any, any>()
        .on("start", (e, d) => { if (!e.active) simulation.alphaTarget(0.2).restart(); d.fx = d.x; d.fy = d.y; })
        .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on("end", (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }));

    // Node Visuals - More "Enterprise" style
    nodeElements.append("rect")
      .attr("width", 240).attr("height", 68).attr("x", -120).attr("y", -34).attr("rx", 18)
      .attr("fill", "#ffffff").attr("stroke", (d: any) => selectedNode === d.id ? "#5c56f1" : CATEGORY_COLORS[d.category || 'DEFAULT'])
      .attr("stroke-width", d => selectedNode === d.id ? 4 : 2.5)
      .style("cursor", "pointer").style("filter", "drop-shadow(0 12px 24px rgba(0,0,0,0.05))")
      .style("opacity", zoomLevel < 0.3 ? 0.1 : 1);

    nodeElements.append("circle")
      .attr("r", 48).attr("fill", (d: any) => CATEGORY_COLORS[d.category || 'DEFAULT'])
      .style("opacity", zoomLevel < 0.3 ? 0.9 : 0);

    nodeElements.append("text")
      .text((d: any) => d.label).attr("text-anchor", "middle").attr("y", 5)
      .attr("fill", "#0f172a").attr("font-size", "14px").attr("font-weight", "900")
      .style("pointer-events", "none").style("opacity", zoomLevel < 0.3 ? 0 : 1);

    nodeElements.append("text")
      .text((d: any) => d.category || 'AREA').attr("text-anchor", "middle").attr("y", 6)
      .attr("fill", "white").attr("font-size", "12px").attr("font-weight", "900")
      .style("pointer-events", "none").style("opacity", zoomLevel < 0.3 ? 1 : 0);

    simulation.on("tick", () => {
      linkElements.attr("d", (d: any) => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.8;
        const curvature = Math.abs(dx) < 30 ? 0 : dr;
        return `M${d.source.x},${d.source.y} A${curvature},${curvature} 0 0,1 ${d.target.x},${d.target.y}`;
      });
      linkLabels.attr("transform", (d: any) => {
        const midX = (d.source.x + d.target.x) / 2;
        const midY = (d.source.y + d.target.y) / 2;
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const offsetX = midX + (dy/dist) * 32 - 22;
        const offsetY = midY - (dx/dist) * 32 - 11;
        return `translate(${offsetX},${offsetY})`;
      });
      nodeElements.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    setTimeout(handleFitView, 400);

    return () => { simulation.stop(); };
  }, [filteredData, handleFitView, zoomLevel, selectedNode]);

  // Refined Token Engine
  useEffect(() => {
    if (isPaused || speed === 0 || !svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const g = svg.select(".main-group");
    const tokenLayer = g.select(".tokens").empty() ? g.append("g").attr("class", "tokens") : g.select(".tokens");
    const linkElements = g.selectAll(".links path");
    const { links } = filteredData;
    const maxWeight = d3.max(dataset.links, d => d.weight) || 1;

    const spawnToken = () => {
      if (isPaused) return;
      const weightedIdx = Math.floor(Math.random() * links.length);
      const link = links[weightedIdx];
      const pathNode = linkElements.nodes()[weightedIdx] as SVGPathElement;
      if (!pathNode) return;

      const weight = link.weight;
      const isCritical = weight > maxWeight * 0.7;
      
      const token = tokenLayer.append("circle")
        .attr("r", isCritical ? 7 : 5)
        .attr("fill", isCritical ? "#ef4444" : "#5c56f1")
        .style("filter", `drop-shadow(0 0 ${isCritical ? '12px' : '8px'} ${isCritical ? '#ef4444' : '#5c56f1'})`)
        .style("opacity", 1);

      token.transition()
        .duration((3500 / speed) * (isCritical ? 1.8 : 1)) // Physics: Bottlenecks = slower flow
        .ease(d3.easeLinear)
        .attrTween("transform", () => (t: number) => {
          const p = pathNode.getPointAtLength(t * pathNode.getTotalLength());
          return `translate(${p.x},${p.y})`;
        })
        .on("end", function() { d3.select(this).remove(); });
    };

    const interval = setInterval(spawnToken, 550 / speed);
    return () => clearInterval(interval);
  }, [isPaused, speed, filteredData, dataset]);

  return (
    <div ref={containerRef} className={`relative w-full h-full bg-[#fdfdfe] border border-slate-200 rounded-[48px] overflow-hidden group shadow-inner ${isFullscreen ? 'fixed inset-0 z-[100] rounded-none' : ''}`}>
      <div 
        className="absolute inset-0 pointer-events-none opacity-10 bg-cover bg-center transition-opacity duration-1000 grayscale"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2000")' }}
      />

      {/* Industrial Engineering Control Bar */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[70] bg-white/95 backdrop-blur-2xl border border-slate-200 px-10 py-6 rounded-[40px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)] flex items-center gap-10 min-w-[500px] animate-in slide-in-from-bottom-8 duration-700">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center mb-1">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Velocidad de Análisis</span>
             <span className={`text-[11px] font-black px-2 py-0.5 rounded-md ${speed < 0.5 ? 'bg-amber-100 text-amber-600' : 'bg-indigo-50 text-[#5c56f1]'}`}>{speed.toFixed(1)}x</span>
          </div>
          <div className="flex items-center gap-5">
            <button onClick={() => setIsPaused(!isPaused)} className={`w-12 h-12 rounded-[20px] flex items-center justify-center transition-all shadow-lg ${isPaused ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              <span className="text-xl">{isPaused ? '▶' : '||'}</span>
            </button>
            <input 
              type="range" min="0.1" max="2.5" step="0.1" value={speed} 
              onChange={(e) => { setSpeed(parseFloat(e.target.value)); setIsPaused(false); }}
              className="w-56 accent-[#5c56f1] h-2 bg-slate-100 rounded-full cursor-pointer"
            />
          </div>
        </div>
        
        <div className="h-12 w-px bg-slate-100"></div>

        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ruido de Proceso</span>
          <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-inner">
            {[0.5, 0.85, 1.0].map((val) => (
              <button 
                key={val} onClick={() => setSimplification(val)}
                className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all ${simplification === val ? 'bg-white text-[#5c56f1] shadow-md scale-105' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {val === 0.5 ? 'LEAN' : val === 0.85 ? 'STD' : 'FULL'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Info Cards for CEO/Manager */}
      <div className="absolute top-10 right-10 z-[60] flex flex-col gap-4 max-w-[280px]">
         <div className="bg-white/90 backdrop-blur-xl border border-slate-200 p-6 rounded-[32px] shadow-xl animate-in fade-in slide-in-from-right-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Diagnóstico Rápido</h4>
            <div className="space-y-4">
               <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-600">Eficiencia</span>
                  <span className="text-sm font-black text-[#5c56f1]">{dataset.stats.efficiency}%</span>
               </div>
               <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#5c56f1] h-full" style={{ width: `${dataset.stats.efficiency}%` }}></div>
               </div>
               <div className="flex gap-2 items-center text-[10px] font-bold text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  ROI: {dataset.stats.roi}
               </div>
            </div>
         </div>
      </div>

      <div className="absolute top-10 left-10 z-50 flex items-center gap-4">
        <button onClick={toggleFullscreen} className="flex items-center gap-3 bg-white/90 backdrop-blur-md border border-slate-200 px-8 py-4 rounded-[24px] hover:bg-slate-50 transition-all shadow-xl active:scale-95 group">
          <span className="text-xl text-slate-700 transition-transform group-hover:scale-110">{isFullscreen ? '⤓' : '⤢'}</span>
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">{isFullscreen ? 'VISTA VENTANA' : 'VISTA INMERSIVA'}</span>
        </button>
        <button onClick={handleFitView} className="bg-white/90 backdrop-blur-md border border-slate-200 px-8 py-4 rounded-[24px] hover:bg-slate-50 transition-all shadow-xl font-black text-[11px] text-slate-900 uppercase tracking-widest">AJUSTAR FOCO</button>
      </div>
      
      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing relative z-10" />
    </div>
  );
};

export default ProcessGraph;
