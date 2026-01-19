
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { Dataset, ProcessNode, ProcessLink } from '../types';

interface Props {
  dataset: Dataset;
  animationSpeed: number;
}

const ProcessGraph: React.FC<Props> = ({ dataset, animationSpeed }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, any> | null>(null);
  
  const [simplification, setSimplification] = useState(0.85);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const handleZoomIn = () => {
    if (svgRef.current && zoomRef.current) d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 1.3);
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomRef.current) d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 0.7);
  };

  const handleFitView = useCallback(() => {
    if (!svgRef.current || !gRef.current || !zoomRef.current) return;
    const bounds = gRef.current.getBBox();
    if (!bounds || bounds.width === 0) return;
    const fullWidth = svgRef.current.clientWidth;
    const fullHeight = svgRef.current.clientHeight;
    const midX = bounds.x + bounds.width / 2;
    const midY = bounds.y + bounds.height / 2;
    const padding = 60;
    const scale = 0.95 / Math.max(bounds.width / (fullWidth - padding), bounds.height / (fullHeight - padding));
    d3.select(svgRef.current).transition().duration(750).ease(d3.easeCubicInOut).call(
      zoomRef.current.transform,
      d3.zoomIdentity.translate(fullWidth / 2, fullHeight / 2).scale(Math.min(scale, 1.5)).translate(-midX, -midY)
    );
  }, []);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
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
      .on("zoom", (event) => g.attr("transform", event.transform));
    zoomRef.current = zoom;
    svg.call(zoom);

    const defs = svg.append("defs");
    defs.append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 58)
      .attr("refY", 5)
      .attr("orient", "auto")
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z")
      .attr("fill", "#6366f1");

    const { nodes, links } = filteredData;
    const maxWeight = d3.max(dataset.links, d => d.weight) || 1;

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(160).strength(1))
      .force("charge", d3.forceManyBody().strength(-2500))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX(width / 2).strength(0.5))
      .force("y", d3.forceY((d: any, i: number) => {
        const step = (height * 0.8) / (nodes.length || 1);
        return (height * 0.1) + (i * step);
      }).strength(2.2))
      .force("collision", d3.forceCollide().radius(110));

    const linkLayer = g.append("g").attr("class", "links");
    const nodeLayer = g.append("g").attr("class", "nodes");
    const labelLayer = g.append("g").attr("class", "labels");
    const tokenLayer = g.append("g").attr("class", "tokens");

    const linkElements = linkLayer.selectAll("path")
      .data(links)
      .enter().append("path")
      .attr("fill", "none")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", d => Math.max(3, (d.weight / maxWeight) * 15))
      .attr("marker-end", "url(#arrowhead)")
      .attr("stroke-linecap", "round")
      .style("opacity", 0.6);

    const linkLabels = labelLayer.selectAll("g")
      .data(links)
      .enter().append("g");
    linkLabels.append("rect")
      .attr("width", 34).attr("height", 16).attr("rx", 4).attr("fill", "#ffffff").attr("stroke", "#e2e8f0");
    linkLabels.append("text")
      .attr("font-size", "9px").attr("font-weight", "900").attr("fill", "#6366f1").attr("text-anchor", "middle").attr("dy", "11").attr("dx", "17").text(d => d.weight);

    const nodeElements = nodeLayer.selectAll("g")
      .data(nodes).enter().append("g")
      .call(d3.drag<any, any>().on("start", (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; }).on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; }).on("end", (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }));

    nodeElements.append("rect")
      .attr("width", 200).attr("height", 54).attr("x", -100).attr("y", -27).attr("rx", 12)
      .attr("fill", (d: any, i: number) => i === 0 ? "rgba(99,102,241,0.08)" : i === nodes.length - 1 ? "rgba(16,185,129,0.08)" : "#ffffff")
      .attr("stroke", (d: any, i: number) => i === 0 ? "#6366f1" : i === nodes.length - 1 ? "#10b981" : "#e2e8f0")
      .attr("stroke-width", 2).style("cursor", "pointer").style("filter", "drop-shadow(0 4px 6px rgba(0,0,0,0.05))");

    nodeElements.append("text")
      .text((d: any) => d.label).attr("text-anchor", "middle").attr("y", 5).attr("fill", "#0f172a").attr("font-size", "11px").attr("font-weight", "800").style("pointer-events", "none");

    simulation.on("tick", () => {
      linkElements.attr("d", (d: any) => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.5;
        const curvature = Math.abs(dx) < 20 ? 0 : dr;
        return `M${d.source.x},${d.source.y} A${curvature},${curvature} 0 0,1 ${d.target.x},${d.target.y}`;
      });
      linkLabels.attr("transform", (d: any) => {
        const midX = (d.source.x + d.target.x) / 2;
        const midY = (d.source.y + d.target.y) / 2;
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const offsetX = midX + (dy/dist) * 20 - 17;
        const offsetY = midY - (dx/dist) * 20 - 8;
        return `translate(${offsetX},${offsetY})`;
      });
      nodeElements.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    setTimeout(handleFitView, 500);

    const tokenInterval = setInterval(() => {
      if (animationSpeed <= 0 || links.length === 0) return;
      const weightedIdx = Math.floor(Math.random() * links.length);
      const pathNode = linkElements.nodes()[weightedIdx] as SVGPathElement;
      if (!pathNode) return;
      tokenLayer.append("circle").attr("r", 4).attr("fill", "#6366f1").style("filter", "drop-shadow(0 0 6px rgba(99,102,241,0.5))")
        .transition().duration(2500 / animationSpeed).ease(d3.easeLinear).attrTween("transform", () => (t: number) => {
          const p = pathNode.getPointAtLength(t * pathNode.getTotalLength());
          return `translate(${p.x},${p.y})`;
        }).remove();
    }, 600 / animationSpeed);
    
    return () => { simulation.stop(); clearInterval(tokenInterval); };
  }, [filteredData, animationSpeed, handleFitView]);

  return (
    <div ref={containerRef} className={`relative w-full h-full bg-white border border-slate-200 rounded-[40px] overflow-hidden group shadow-inner ${isFullscreen ? 'fixed inset-0 z-[100] rounded-none' : ''}`}>
      <div className="absolute top-8 left-8 z-50 flex items-center gap-4">
        <button onClick={toggleFullscreen} className="flex items-center gap-3 bg-white/90 backdrop-blur-md border border-slate-200 px-6 py-3 rounded-2xl hover:bg-slate-50 transition-all shadow-lg active:scale-95">
          <span className="text-lg text-slate-700">{isFullscreen ? '⤓' : '⤢'}</span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">{isFullscreen ? 'RESTAURAR' : 'MAXIMIZAR'}</span>
        </button>
        <div className="flex bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl overflow-hidden shadow-lg">
          <button onClick={handleZoomIn} className="px-5 py-3 hover:bg-slate-50 border-r border-slate-100 font-black text-slate-900 text-lg">+</button>
          <button onClick={handleZoomOut} className="px-5 py-3 hover:bg-slate-50 border-r border-slate-100 font-black text-slate-900 text-lg">−</button>
          <button onClick={handleFitView} className="px-5 py-3 hover:bg-slate-50 font-black text-[10px] text-slate-900 uppercase tracking-widest">Ajustar</button>
        </div>
      </div>
      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};

export default ProcessGraph;
