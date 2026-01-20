
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { Dataset, ProcessNode, ProcessLink } from '../types';

interface Props {
  dataset: Dataset;
  animationSpeed: number;
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

const ProcessGraph: React.FC<Props> = ({ dataset, animationSpeed }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, any> | null>(null);
  
  const [simplification, setSimplification] = useState(0.85);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
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
      nodes: dataset.nodes.filter(n => usedIds.has(n.id)).map((n, i) => ({ 
        ...n, 
        rank: i,
        index: i 
      })),
      links: activeLinks.map(l => ({ ...l }))
    };
  }, [dataset, simplification]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleFitView = useCallback(() => {
    if (!svgRef.current || !gRef.current || !zoomRef.current) return;
    const bounds = gRef.current.getBBox();
    if (!bounds || bounds.width === 0) return;
    const fullWidth = svgRef.current.clientWidth;
    const fullHeight = svgRef.current.clientHeight;
    const midX = bounds.x + bounds.width / 2;
    const midY = bounds.y + bounds.height / 2;
    const padding = 150;
    const scale = 0.8 / Math.max(bounds.width / (fullWidth - padding), bounds.height / (fullHeight - padding));
    d3.select(svgRef.current).transition().duration(1000).ease(d3.easeCubicInOut).call(
      zoomRef.current.transform,
      d3.zoomIdentity.translate(fullWidth / 2, fullHeight / 2).scale(Math.min(scale, 1.0)).translate(-midX, -midY)
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

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(220).strength(0.7))
      .force("charge", d3.forceManyBody().strength(-2000).distanceMax(600))
      .force("x", d3.forceX((d: any) => {
        const step = (width * 0.8) / (nodes.length || 1);
        return (width * 0.1) + (d.rank * step);
      }).strength(1.2))
      .force("y", d3.forceY(height / 2).strength(0.15))
      .force("collision", d3.forceCollide().radius(140).strength(1))
      .alpha(1)
      .alphaDecay(0.04)
      .velocityDecay(0.7);

    for (let i = 0; i < 500; i++) {
      simulation.tick();
    }
    
    simulation.stop();

    const linkLayer = g.append("g").attr("class", "links");
    const nodeLayer = g.append("g").attr("class", "nodes");
    const labelLayer = g.append("g").attr("class", "labels");
    const tokenLayer = g.append("g").attr("class", "tokens");

    const colorScale = d3.scaleLinear<string>()
      .domain([0, maxWeight * 0.5, maxWeight])
      .range(["#cbd5e1", "#5c56f1", "#4f46e5"]);

    const linkElements = linkLayer.selectAll("path")
      .data(links)
      .enter().append("path")
      .attr("fill", "none")
      .attr("stroke", d => colorScale(d.weight))
      .attr("stroke-width", d => Math.max(3, (d.weight / maxWeight) * 18))
      .attr("stroke-linecap", "round")
      .style("opacity", 0.3); // Opacidad reducida para mejor contraste con tokens

    const linkLabels = labelLayer.selectAll("g")
      .data(links)
      .enter().append("g");
    
    linkLabels.append("rect")
      .attr("width", 40).attr("height", 18).attr("rx", 6).attr("fill", "#ffffff").attr("stroke", "#e2e8f0")
      .style("opacity", zoomLevel < 0.6 ? 0.05 : 0.9);
    
    linkLabels.append("text")
      .attr("font-size", "10px").attr("font-weight", "900").attr("fill", "#64748b")
      .attr("text-anchor", "middle").attr("dy", "13").attr("dx", "20").text(d => d.weight)
      .style("opacity", zoomLevel < 0.6 ? 0.1 : 1);

    const nodeElements = nodeLayer.selectAll("g")
      .data(nodes).enter().append("g")
      .on("click", (e, d: any) => setSelectedNode(d.id === selectedNode ? null : d.id))
      .call(d3.drag<any, any>()
        .on("start", (e, d) => { 
          if (!e.active) simulation.alphaTarget(0.1).restart(); 
          d.fx = d.x; d.fy = d.y; 
        })
        .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on("end", (e, d) => { 
          if (!e.active) simulation.alphaTarget(0); 
          d.fx = null; d.fy = null; 
          setTimeout(() => simulation.stop(), 500);
        }));

    nodeElements.append("rect")
      .attr("width", 220).attr("height", 60).attr("x", -110).attr("y", -30).attr("rx", 18)
      .attr("fill", "#ffffff").attr("stroke", (d: any) => selectedNode === d.id ? "#5c56f1" : "#e2e8f0")
      .attr("stroke-width", d => selectedNode === d.id ? 4 : 2)
      .style("cursor", "pointer").style("filter", "drop-shadow(0 8px 16px rgba(0,0,0,0.06))")
      .style("opacity", zoomLevel < 0.25 ? 0.1 : 1);

    nodeElements.append("text")
      .text((d: any) => d.label).attr("text-anchor", "middle").attr("y", 5)
      .attr("fill", "#0f172a").attr("font-size", "12px").attr("font-weight", "800")
      .attr("class", "uppercase tracking-wider")
      .style("pointer-events", "none").style("opacity", zoomLevel < 0.25 ? 0 : 1);

    const updateVisuals = () => {
      linkElements.attr("d", (d: any) => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.5;
        const curvature = Math.abs(dx) < 40 ? 0 : dr;
        return `M${d.source.x},${d.source.y} A${curvature},${curvature} 0 0,1 ${d.target.x},${d.target.y}`;
      });
      linkLabels.attr("transform", (d: any) => {
        const midX = (d.source.x + d.target.x) / 2;
        const midY = (d.source.y + d.target.y) / 2;
        return `translate(${midX - 20},${midY - 30})`;
      });
      nodeElements.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    };

    updateVisuals();
    simulation.on("tick", updateVisuals);
    setTimeout(handleFitView, 500);

    const tokenInterval = setInterval(() => {
      if (animationSpeed <= 0 || links.length === 0) return;
      const weightedIdx = Math.floor(Math.random() * links.length);
      const link = links[weightedIdx];
      const pathNode = linkElements.nodes()[weightedIdx] as SVGPathElement;
      if (!pathNode) return;
      
      const isCritical = link.weight > maxWeight * 0.7;

      tokenLayer.append("circle")
        .attr("r", isCritical ? 6 : 4)
        .attr("fill", isCritical ? "#ef4444" : "#5c56f1")
        .style("filter", `drop-shadow(0 0 ${isCritical ? '12px' : '6px'} ${isCritical ? '#ef4444' : '#5c56f1'})`)
        .transition().duration(3000 / animationSpeed).ease(d3.easeLinear)
        .attrTween("transform", () => (t: number) => {
          const p = pathNode.getPointAtLength(t * pathNode.getTotalLength());
          return `translate(${p.x},${p.y})`;
        }).remove();
    }, 700 / animationSpeed);

    return () => { simulation.stop(); clearInterval(tokenInterval); };
  }, [filteredData, animationSpeed, handleFitView, zoomLevel, selectedNode, dataset]);

  return (
    <div ref={containerRef} className={`relative w-full h-full bg-[#f8fafc] border border-slate-200 rounded-[56px] overflow-hidden group shadow-2xl ${isFullscreen ? 'fixed inset-0 z-[100] rounded-none' : ''}`}>
      {/* Fondo de contraste mejorado con rejilla técnica */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:40px_40px] opacity-40" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-slate-50/50 via-transparent to-slate-100/30" />
      
      <div className="absolute top-10 left-10 z-50 flex items-center gap-5">
        <button onClick={toggleFullscreen} className="bg-white/90 backdrop-blur-xl border border-slate-200 px-7 py-3.5 rounded-[24px] hover:bg-slate-50 transition-all shadow-xl font-black text-[10px] text-slate-800 uppercase tracking-widest flex items-center gap-3">
          <span>{isFullscreen ? '⤓' : '⤢'}</span>
          {isFullscreen ? 'RESTAURAR' : 'PANTALLA COMPLETA'}
        </button>
        <button onClick={handleFitView} className="bg-white/90 backdrop-blur-xl border border-slate-200 px-7 py-3.5 rounded-[24px] hover:bg-slate-50 transition-all shadow-xl font-black text-[10px] text-slate-800 uppercase tracking-widest">CENTRAR FLUJO</button>
      </div>

      <div className="absolute bottom-10 left-10 z-50">
        <div className="bg-white/95 backdrop-blur-2xl p-7 rounded-[32px] border border-slate-200 shadow-2xl w-64 animate-in slide-in-from-left-4 duration-500">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[9px] font-black text-[#5c56f1] uppercase tracking-[0.2em]">Resolución de Red</span>
            <span className="text-[11px] font-black text-slate-900">{Math.round(simplification * 100)}%</span>
          </div>
          <input 
            type="range" min="0.05" max="1.0" step="0.05" value={simplification} 
            onChange={(e) => setSimplification(parseFloat(e.target.value))} 
            className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-[#5c56f1]" 
          />
        </div>
      </div>

      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing relative z-10" />
    </div>
  );
};

export default ProcessGraph;
