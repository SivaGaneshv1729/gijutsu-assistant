import { useEffect, useState, useRef, useCallback } from 'react';
import { GitBranch, RefreshCw, Search, X, Sliders, Info, Network, LayoutTemplate, Box, Maximize2 } from 'lucide-react';
import { API_BASE, getToken } from '../services/api';
import ForceGraph2D from 'react-force-graph-2d';

const TYPE_COLORS: Record<string, string> = {
  hub: '#6366f1',
  topic: '#10b981',
  entity: '#f59e0b',
  document: '#0ea5e9',
};

export default function KnowledgeGraph() {
  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [hoverNode, setHoverNode] = useState<any | null>(null);
  
  const [linkDistance, setLinkDistance] = useState(100);
  const [nodeRepulsion, setNodeRepulsion] = useState(-300);
  const [showSettings, setShowSettings] = useState(false);

  const fgRef = useRef<any>();

  const fetchGraph = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/knowledge/graph`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error('Failed to load graph');
      const data = await res.json();
      setGraphData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge').strength(nodeRepulsion);
      fgRef.current.d3Force('link').distance(linkDistance);
      fgRef.current.d3ReheatSimulation();
    }
  }, [nodeRepulsion, linkDistance]);

  const updateHighlight = () => {
    setHighlightNodes(new Set(highlightNodes));
    setHighlightLinks(new Set(highlightLinks));
  };

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node);
    if (fgRef.current && node) {
      fgRef.current.centerAt(node.x, node.y, 1000);
      fgRef.current.zoom(2.5, 2000);
    }

    const { nodes, links } = graphData;
    highlightNodes.clear();
    highlightLinks.clear();
    
    if (node) {
      highlightNodes.add(node);
      links.forEach(link => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        if (sourceId === node.id || targetId === node.id) {
          highlightLinks.add(link);
          highlightNodes.add(typeof link.source === 'object' ? link.source : nodes.find(n => n.id === link.source));
          highlightNodes.add(typeof link.target === 'object' ? link.target : nodes.find(n => n.id === link.target));
        }
      });
    }
    updateHighlight();
  }, [graphData]);

  const handleNodeHover = useCallback((node: any) => {
    if (selectedNode) return;
    
    highlightNodes.clear();
    highlightLinks.clear();
    if (node) {
      highlightNodes.add(node);
      graphData.links.forEach(link => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        if (sourceId === node.id || targetId === node.id) {
          highlightLinks.add(link);
          highlightNodes.add(typeof link.source === 'object' ? link.source : graphData.nodes.find(n => n.id === link.source));
          highlightNodes.add(typeof link.target === 'object' ? link.target : graphData.nodes.find(n => n.id === link.target));
        }
      });
    }
    
    setHoverNode(node || null);
    updateHighlight();
  }, [graphData, selectedNode]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      if (!selectedNode) {
        highlightNodes.clear();
        updateHighlight();
      }
      return;
    }
    const q = searchQuery.toLowerCase();
    highlightNodes.clear();
    graphData.nodes.forEach(n => {
      if ((n.label || n.id).toLowerCase().includes(q)) {
        highlightNodes.add(n);
      }
    });
    updateHighlight();
  }, [searchQuery, graphData]);

  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isSelected = selectedNode && node.id === selectedNode.id;
    const isHighlighted = highlightNodes.has(node) || highlightNodes.has(node.id);
    const isSearchMatch = searchQuery && (node.label || node.id).toLowerCase().includes(searchQuery.toLowerCase());
    const isDimmed = (selectedNode || hoverNode || searchQuery) && !isHighlighted && !isSearchMatch;

    const baseColor = TYPE_COLORS[node.type] || '#64748b';
    const color = isDimmed ? baseColor + '40' : baseColor;
    const radius = node.id === 'hub' ? 14 : node.type === 'topic' ? 8 : 4;
    
    if (isSelected || isSearchMatch) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius * 2.5, 0, 2 * Math.PI, false);
        ctx.fillStyle = baseColor + '50';
        ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.strokeStyle = isDimmed ? 'rgba(255,255,255,0.05)' : (isSelected ? '#fff' : 'rgba(255,255,255,0.2)');
    ctx.stroke();

    if (!isDimmed && globalScale > 1.5) {
      const label = node.label.length > 25 ? node.label.substring(0, 23) + '...' : node.label;
      const fontSize = 12/globalScale;
      ctx.font = `${fontSize}px Inter`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(label, node.x, node.y + radius + 4 + fontSize);
    }
  }, [selectedNode, hoverNode, highlightNodes, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-[#09090b] text-slate-200">
      <div className="flex items-center justify-between p-6 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <GitBranch size={20} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Knowledge Graph</h1>
            <p className="text-xs text-slate-500">Interactive visualization of your document universe</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text"
              placeholder="Find entity or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-64 bg-[#1e1e24] border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                <X size={12} />
              </button>
            )}
          </div>

          <button onClick={() => setShowSettings(!showSettings)} className={`p-2 rounded-xl transition-colors border ${showSettings ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400' : 'bg-[#1e1e24] hover:bg-white/10 border-white/5'}`}>
            <Sliders size={16} />
          </button>
          
          <div className="h-6 w-px bg-white/10 mx-1"></div>
          
          <button onClick={() => { if(fgRef.current) fgRef.current.zoomToFit(400) }} className="p-2 rounded-xl bg-[#1e1e24] hover:bg-white/10 transition-colors border border-white/5" title="Fit to screen">
            <Maximize2 size={16}/>
          </button>
          <button onClick={fetchGraph} className="p-2 rounded-xl bg-[#1e1e24] hover:bg-white/10 transition-colors border border-white/5" title="Refresh Graph">
            <RefreshCw size={16} className={loading ? 'animate-spin text-indigo-400' : ''}/>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 relative m-6 mt-4 rounded-2xl border border-white/5 bg-[#0a0f18] overflow-hidden shadow-2xl">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#0a0f18]/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <Network size={40} className="text-indigo-400 animate-pulse"/>
                <span className="text-slate-400 text-sm font-medium">Synthesizing network dimensions...</span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#0a0f18]">
              <div className="text-center bg-red-500/10 border border-red-500/20 p-6 rounded-2xl">
                <Info size={32} className="text-red-400 mx-auto mb-3"/>
                <p className="text-red-300 font-medium">{error}</p>
                <button onClick={fetchGraph} className="mt-4 px-5 py-2 bg-red-500/20 text-red-300 rounded-xl text-xs hover:bg-red-500/30 transition-colors">Retry Connection</button>
              </div>
            </div>
          )}

          {showSettings && (
            <div className="absolute top-4 right-4 z-10 w-64 bg-[#1e1e24]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Sliders size={14} className="text-indigo-400"/> Graph Physics</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-2">
                    <span>Link Distance</span>
                    <span className="text-indigo-400 font-mono">{linkDistance}px</span>
                  </div>
                  <input type="range" min="10" max="300" value={linkDistance} onChange={(e) => setLinkDistance(Number(e.target.value))} className="w-full accent-indigo-500" />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-2">
                    <span>Node Repulsion</span>
                    <span className="text-indigo-400 font-mono">{Math.abs(nodeRepulsion)}</span>
                  </div>
                  <input type="range" min="-1000" max="-10" value={nodeRepulsion} onChange={(e) => setNodeRepulsion(Number(e.target.value))} className="w-full accent-indigo-500" />
                </div>
              </div>
            </div>
          )}

          {!loading && !error && graphData.nodes.length > 0 && (
            <ForceGraph2D
              ref={fgRef}
              graphData={graphData}
              nodeLabel="label"
              nodeColor={(node: any) => TYPE_COLORS[node.type] || '#64748b'}
              nodeCanvasObject={paintNode}
              linkDirectionalParticles={2}
              linkDirectionalParticleWidth={(link: any) => highlightLinks.has(link) || highlightLinks.has(link.id) ? 3 : 0}
              linkColor={(link: any) => highlightLinks.has(link) || highlightLinks.has(link.id) ? '#818cf8' : 'rgba(148, 163, 184, 0.15)'}
              linkWidth={(link: any) => highlightLinks.has(link) || highlightLinks.has(link.id) ? 2 : 1}
              onNodeClick={handleNodeClick}
              onNodeHover={handleNodeHover}
              onBackgroundClick={() => setSelectedNode(null)}
              cooldownTicks={100}
            />
          )}

          <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-sm rounded-xl p-3 border border-white/5 text-xs flex gap-4 shadow-lg">
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-500"></span><span className="text-slate-400">Nodes: <b className="text-white">{graphData.nodes.length}</b></span></div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-500"></span><span className="text-slate-400">Links: <b className="text-white">{graphData.links.length}</b></span></div>
          </div>
        </div>

        {selectedNode && (
          <div className="w-80 border-l border-white/5 bg-[#0a0f18] flex flex-col animate-in slide-in-from-right-4 duration-300">
            <div className="p-6 border-b border-white/5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ color: TYPE_COLORS[selectedNode.type] || '#64748b', backgroundColor: TYPE_COLORS[selectedNode.type] || '#64748b' }}/>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{selectedNode.type}</span>
                </div>
                <h2 className="text-lg font-bold text-white break-words">{selectedNode.label || selectedNode.id}</h2>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-slate-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-lg">
                <X size={16} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2"><LayoutTemplate size={14}/> Properties</h3>
                <div className="space-y-2 bg-[#1e1e24] p-4 rounded-xl border border-white/5">
                  <div className="text-xs text-slate-400">ID: <span className="text-white font-mono break-all">{selectedNode.id}</span></div>
                  {Object.entries(selectedNode).map(([k, v]) => {
                    if (['id', 'label', 'type', 'x', 'y', 'vx', 'vy', 'index'].includes(k)) return null;
                    return (
                      <div key={k} className="text-xs text-slate-400 capitalize">{k}: <span className="text-white">{String(v)}</span></div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Network size={14}/> Relationships</h3>
                <div className="space-y-2">
                  {graphData.links.filter((l: any) => 
                    (typeof l.source === 'object' ? l.source.id === selectedNode.id : l.source === selectedNode.id) || 
                    (typeof l.target === 'object' ? l.target.id === selectedNode.id : l.target === selectedNode.id)
                  ).map((link: any, idx: number) => {
                    const isSource = typeof link.source === 'object' ? link.source.id === selectedNode.id : link.source === selectedNode.id;
                    const otherNodeObj = isSource ? link.target : link.source;
                    const otherNodeId = typeof otherNodeObj === 'object' ? otherNodeObj.id : otherNodeObj;
                    const otherNode = graphData.nodes.find((n:any) => n.id === otherNodeId) || { label: otherNodeId, type: 'unknown' };
                    
                    return (
                      <div key={idx} onClick={() => handleNodeClick(otherNode)} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-indigo-600/20 hover:border-indigo-500/30 cursor-pointer transition-all group flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-black/30 flex items-center justify-center shrink-0">
                          <Box size={14} style={{ color: TYPE_COLORS[otherNode.type] || '#64748b' }} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">{isSource ? 'Outbound To' : 'Inbound From'}</div>
                          <div className="text-xs text-slate-300 font-medium truncate group-hover:text-indigo-300">{otherNode.label || otherNode.id}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
