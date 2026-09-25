import { useEffect, useRef, useState } from 'react';
import { Network, GitBranch, RefreshCw, ZoomIn, ZoomOut, Info } from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  type: 'document' | 'chunk' | 'topic';
  count?: number;
}

interface GraphLink {
  source: string;
  target: string;
  label?: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

const TYPE_COLORS: Record<string, string> = {
  document: '#6366f1',
  chunk: '#0ea5e9',
  topic: '#f59e0b',
};

export default function KnowledgeGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const animRef = useRef<number>(0);
  const nodesRef = useRef<any[]>([]);
  const panRef = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const fetchGraph = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const [docsRes] = await Promise.all([
        fetch('/api/knowledge/documents', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const docs: any[] = docsRes.ok ? await docsRes.json() : [];

      const nodes: GraphNode[] = [];
      const links: GraphLink[] = [];

      // Central hub
      nodes.push({ id: 'hub', label: 'Knowledge Base', type: 'topic', count: docs.length });

      // Add access level topic nodes
      const accessGroups: Record<string, string[]> = {};
      docs.forEach((doc: any) => {
        const level = doc.accessLevel || doc.access_level || 'ENGINEER';
        if (!accessGroups[level]) accessGroups[level] = [];
        accessGroups[level].push(doc.id || doc.name);
      });

      Object.keys(accessGroups).forEach(level => {
        const nodeId = `access_${level}`;
        nodes.push({ id: nodeId, label: level, type: 'topic', count: accessGroups[level].length });
        links.push({ source: 'hub', target: nodeId, label: 'contains' });
      });

      // Add document nodes
      docs.forEach((doc: any) => {
        const nodeId = doc.id || doc.name;
        const level = doc.accessLevel || doc.access_level || 'ENGINEER';
        nodes.push({ id: nodeId, label: doc.name || doc.filename || nodeId, type: 'document', count: doc.chunkCount || 0 });
        links.push({ source: `access_${level}`, target: nodeId, label: 'doc' });
      });

      setGraphData({ nodes, links });
    } catch (e: any) {
      setError('Failed to load graph data: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGraph(); }, []);

  // Physics simulation + canvas render
  useEffect(() => {
    if (loading || !graphData.nodes.length || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;

    // Initialize positions
    const positions: Record<string, { x: number; y: number; vx: number; vy: number }> = {};
    graphData.nodes.forEach((n, i) => {
      const angle = (i / graphData.nodes.length) * Math.PI * 2;
      const r = n.id === 'hub' ? 0 : (n.type === 'topic' ? 120 : 260);
      positions[n.id] = {
        x: W / 2 + r * Math.cos(angle),
        y: H / 2 + r * Math.sin(angle),
        vx: 0,
        vy: 0,
      };
    });

    nodesRef.current = graphData.nodes.map(n => ({ ...n, ...positions[n.id] }));

    const tick = () => {
      const nodes = nodesRef.current;
      const links = graphData.links;

      // Spring forces
      links.forEach(link => {
        const s = nodes.find(n => n.id === link.source);
        const t = nodes.find(n => n.id === link.target);
        if (!s || !t) return;
        const dx = t.x - s.x, dy = t.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const targetDist = 180;
        const force = (dist - targetDist) * 0.003;
        s.vx += (dx / dist) * force; s.vy += (dy / dist) * force;
        t.vx -= (dx / dist) * force; t.vy -= (dy / dist) * force;
      });

      // Repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x, dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 5000 / (dist * dist);
          nodes[i].vx -= (dx / dist) * force; nodes[i].vy -= (dy / dist) * force;
          nodes[j].vx += (dx / dist) * force; nodes[j].vy += (dy / dist) * force;
        }
      }

      // Center gravity
      nodes.forEach(n => {
        n.vx += (W / 2 - n.x) * 0.0005;
        n.vy += (H / 2 - n.y) * 0.0005;
        n.vx *= 0.88; n.vy *= 0.88;
        n.x += n.vx; n.y += n.vy;
      });

      // Draw
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.translate(panRef.current.x, panRef.current.y);
      ctx.scale(zoom, zoom);

      // Draw links
      links.forEach(link => {
        const s = nodes.find(n => n.id === link.source);
        const t = nodes.find(n => n.id === link.target);
        if (!s || !t) return;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Draw nodes
      nodes.forEach(node => {
        const color = TYPE_COLORS[node.type] || '#64748b';
        const radius = node.id === 'hub' ? 26 : node.type === 'topic' ? 18 : 12;

        // Glow
        const grd = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 2.5);
        grd.addColorStop(0, color + '40');
        grd.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Label
        ctx.fillStyle = '#e2e8f0';
        ctx.font = `${node.id === 'hub' ? '11px' : '10px'} Inter, sans-serif`;
        ctx.textAlign = 'center';
        const label = node.label.length > 20 ? node.label.substring(0, 18) + '…' : node.label;
        ctx.fillText(label, node.x, node.y + radius + 14);
      });

      ctx.restore();
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [loading, graphData, zoom]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    panRef.current.x += e.clientX - lastMouse.current.x;
    panRef.current.y += e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseUp = () => { isDragging.current = false; };

  return (
    <div className="flex flex-col h-full bg-[#09090b] text-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <GitBranch size={20} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Knowledge Graph</h1>
            <p className="text-xs text-slate-500">Interactive visualization of your document universe</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom(z => Math.min(z + 0.2, 3))} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5"><ZoomIn size={16}/></button>
          <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.3))} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5"><ZoomOut size={16}/></button>
          <button onClick={fetchGraph} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5"><RefreshCw size={16} className={loading ? 'animate-spin' : ''}/></button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-4">
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}/>
            <span className="text-xs text-slate-400 capitalize">{type}</span>
          </div>
        ))}
        <span className="text-xs text-slate-600 ml-auto">Drag to pan • Scroll to zoom</span>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative rounded-2xl border border-white/5 bg-[#0a0f18] overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Network size={40} className="text-indigo-400 animate-pulse"/>
              <span className="text-slate-500 text-sm">Building knowledge graph…</span>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Info size={32} className="text-red-400 mx-auto mb-2"/>
              <p className="text-red-400 text-sm">{error}</p>
              <button onClick={fetchGraph} className="mt-3 px-4 py-2 bg-white/5 rounded-lg text-xs hover:bg-white/10 transition-colors">Retry</button>
            </div>
          </div>
        )}
        {!loading && !error && (
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        )}

        {/* Stats overlay */}
        <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm rounded-xl p-3 border border-white/5 text-xs space-y-1">
          <div className="text-slate-400">Nodes: <span className="text-white font-medium">{graphData.nodes.length}</span></div>
          <div className="text-slate-400">Links: <span className="text-white font-medium">{graphData.links.length}</span></div>
          <div className="text-slate-400">Zoom: <span className="text-white font-medium">{Math.round(zoom * 100)}%</span></div>
        </div>
      </div>
    </div>
  );
}
