import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { v4 as uuidv4 } from 'uuid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    darkMode: true,
    background: 'transparent',
    primaryColor: '#2563eb',     // blue-600
    primaryTextColor: '#f8fafc', // slate-50
    primaryBorderColor: '#3b82f6',// blue-500
    lineColor: '#6366f1',        // indigo-500
    secondaryColor: '#f97316',   // orange-500
    tertiaryColor: '#1e293b',    // slate-800
    noteBkgColor: '#334155',
    noteTextColor: '#e2e8f0',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '16px',
    clusterBkg: 'rgba(30, 41, 59, 0.4)',
    clusterBorder: '#475569',
    edgeLabelBackground: '#0f172a',
    nodeBorder: '#3b82f6',
    mainBkg: '#1e293b',
  },
  securityLevel: 'loose',
});

interface MermaidRendererProps {
  chart: string;
}

export const MermaidRenderer: React.FC<MermaidRendererProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const id = useRef(`mermaid-${uuidv4()}`);

  useEffect(() => {
    let isMounted = true;

    const renderChart = async () => {
      try {
        if (!chart) return;
        
        const cleanChart = chart.trim();
        const { svg } = await mermaid.render(id.current, cleanChart);
        
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (error: any) {
        console.warn('Mermaid failed to render chart:', error, chart);
        
        if (isMounted) {
          const safeChart = chart.replace(/</g, '&lt;').replace(/>/g, '&gt;');
          const errorMsg = error?.message || String(error);
          setSvgContent(`
            <div class="text-slate-400 p-4 border border-slate-700/50 rounded bg-slate-800/30 text-xs font-mono w-full overflow-auto">
              <div class="text-red-400 mb-2 font-bold">Unable to render diagram.</div>
              <div class="text-red-300 mb-2 whitespace-pre-wrap break-all">${errorMsg.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
              <div class="text-xs mb-1 text-slate-500">Raw code:</div>
              <pre class="whitespace-pre-wrap break-all">${safeChart}</pre>
            </div>
          `);
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  return (
    <div 
      ref={containerRef}
      className="my-6 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#111827] shadow-2xl transition-transform hover:scale-[1.01] duration-300 flex justify-center p-6 overflow-x-auto w-full max-w-full"
      dangerouslySetInnerHTML={{ __html: svgContent || '<div class="animate-pulse flex space-x-4"><div class="h-10 bg-slate-700 rounded w-full"></div></div>' }}
    />
  );
};
