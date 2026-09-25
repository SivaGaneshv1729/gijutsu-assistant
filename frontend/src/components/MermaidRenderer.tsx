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
    
    // Clean up any global injected error SVGs left behind by Mermaid
    const cleanupGlobalErrors = () => {
      const errorElement = document.getElementById('d' + id.current);
      if (errorElement) errorElement.remove();
    };

    const renderChart = async () => {
      try {
        if (!chart) return;
        
        const cleanChart = chart.trim();
        // Passing containerRef.current ensures Dagre can measure sizes properly
        const { svg } = await mermaid.render(id.current, cleanChart, containerRef.current || undefined);
        
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (error: any) {
        cleanupGlobalErrors();
        console.warn('Mermaid failed to render chart:', error);
        
        if (isMounted) {
          const safeChart = chart.replace(/</g, '&lt;').replace(/>/g, '&gt;');
          const errorMsg = error?.message || String(error);
          
          // During streaming, it will frequently fail due to incomplete syntax.
          // Show a subtle loading state instead of a harsh red error if it's likely streaming.
          setSvgContent(`
            <div class="text-slate-400 p-4 border border-slate-700/50 rounded bg-slate-800/30 text-xs font-mono w-full overflow-auto">
              <div class="text-amber-400 mb-2 font-bold flex items-center gap-2">
                <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Drawing diagram...
              </div>
              <div class="text-slate-500 mb-1">Code currently being parsed:</div>
              <pre class="whitespace-pre-wrap break-all">${safeChart}</pre>
            </div>
          `);
        }
      }
    };

    // Debounce rendering by 500ms to prevent rapid parsing errors while AI is streaming characters
    const timeoutId = setTimeout(() => {
      renderChart();
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      cleanupGlobalErrors();
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
