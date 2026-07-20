import React, { useState, useEffect, useRef } from 'react';
import { Layers, MousePointer, Eye, Filter, Info, RefreshCw } from 'lucide-react';
import h337 from 'heatmap.js';

export default function Heatmaps({ projects, selectedProjectId, heatmapEvents }) {
  const [selectedPage, setSelectedPage] = useState('/');
  const [activeTab, setActiveTab] = useState('clicks'); // 'clicks' | 'scroll'
  const heatmapContainerRef = useRef(null);
  const heatmapInstanceRef = useRef(null);

  const filteredEvents = (heatmapEvents || []).filter((evt) => {
    const pageMatches = !selectedPage || evt.page_path === selectedPage || evt.page_path?.endsWith(selectedPage);
    const projMatches = !selectedProjectId || evt.project_id === selectedProjectId;
    return pageMatches && projMatches;
  });

  // Render heatmap.js instance on container
  useEffect(() => {
    if (activeTab !== 'clicks' || !heatmapContainerRef.current) return;

    // Reset container canvas
    const container = heatmapContainerRef.current;
    const existingCanvas = container.querySelector('.heatmap-canvas');
    if (existingCanvas) {
      existingCanvas.remove();
    }

    const width = container.offsetWidth || 800;
    const height = container.offsetHeight || 500;

    // Create heatmap.js instance
    try {
      heatmapInstanceRef.current = h337.create({
        container: container,
        radius: 35,
        maxOpacity: 0.8,
        minOpacity: 0.1,
        blur: 0.75,
        gradient: {
          '.2': 'blue',
          '.4': 'cyan',
          '.6': 'lime',
          '.8': 'yellow',
          '1.0': 'red'
        }
      });

      let points = [];

      if (filteredEvents.length > 0) {
        points = filteredEvents.map((e) => ({
          x: Math.round(((e.x_percent || 50) / 100) * width),
          y: Math.round(((e.y_percent || 50) / 100) * height),
          value: 1,
        }));
      } else {
        // Fallback demo points when no real clicks recorded yet
        points = [
          { x: Math.round(width * 0.5), y: Math.round(height * 0.22), value: 10 },
          { x: Math.round(width * 0.3), y: Math.round(height * 0.45), value: 7 },
          { x: Math.round(width * 0.7), y: Math.round(height * 0.45), value: 9 },
          { x: Math.round(width * 0.5), y: Math.round(height * 0.78), value: 5 },
          { x: Math.round(width * 0.15), y: Math.round(height * 0.12), value: 3 },
        ];
      }

      heatmapInstanceRef.current.setData({
        max: 10,
        data: points,
      });
    } catch (err) {
      console.warn('Erro ao inicializar heatmap.js:', err);
    }
  }, [activeTab, selectedPage, selectedProjectId, filteredEvents]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Heatmaps de Cliques & Rolagem</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Visualize as zonas de maior engajamento e cliques dos visitantes utilizando <code className="text-indigo-500 font-mono">heatmap.js</code>.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl flex items-center gap-1">
          <button
            onClick={() => setActiveTab('clicks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === 'clicks' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <MousePointer size={14} /> Cliques ({filteredEvents.length} eventos)
          </button>
          <button
            onClick={() => setActiveTab('scroll')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === 'scroll' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers size={14} /> Rolagem (Scroll)
          </button>
        </div>
      </div>

      {/* Page Selector & Info Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Página:</span>
          <select
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="/">/ (Página Inicial)</option>
            <option value="/checkout">/checkout</option>
            <option value="/precos">/precos</option>
            <option value="/cadastro">/cadastro</option>
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Alta densidade
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" /> Média densidade
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Baixa densidade
          </span>
        </div>
      </div>

      {/* Page Canvas Container with Heatmap.js Overlay */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl min-h-[520px]">
        
        {/* Container for heatmap.js canvas overlay */}
        <div
          ref={heatmapContainerRef}
          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl p-8 max-w-4xl mx-auto min-h-[460px] relative overflow-hidden select-none"
        >
          {/* Background Wireframe elements representing page DOM */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60 pb-6 mb-8 pointer-events-none">
            <div className="w-32 h-6 bg-slate-300 dark:bg-slate-800/80 rounded-lg" />
            <div className="flex gap-4">
              <div className="w-16 h-4 bg-slate-300 dark:bg-slate-800/60 rounded" />
              <div className="w-16 h-4 bg-slate-300 dark:bg-slate-800/60 rounded" />
              <div className="w-24 h-8 bg-indigo-600/40 rounded-lg" />
            </div>
          </div>

          <div className="text-center py-12 space-y-4 max-w-lg mx-auto pointer-events-none">
            <div className="w-3/4 h-8 bg-slate-300 dark:bg-slate-800 rounded-xl mx-auto" />
            <div className="w-full h-4 bg-slate-200 dark:bg-slate-800/50 rounded mx-auto" />
            <div className="w-2/3 h-4 bg-slate-200 dark:bg-slate-800/50 rounded mx-auto" />
            
            <div className="pt-4 flex justify-center gap-4">
              <div className="w-36 h-10 bg-indigo-600/60 rounded-xl" />
              <div className="w-36 h-10 bg-slate-300 dark:bg-slate-800 rounded-xl" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-200 dark:border-slate-800/40 pointer-events-none">
            <div className="h-24 bg-slate-200/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800/50 rounded-xl" />
            <div className="h-24 bg-slate-200/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800/50 rounded-xl" />
            <div className="h-24 bg-slate-200/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800/50 rounded-xl" />
          </div>

          {/* SCROLL OVERLAY */}
          {activeTab === 'scroll' && (
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/20 via-yellow-500/15 to-rose-500/20 pointer-events-none flex flex-col justify-between p-4 text-[10px] font-bold text-slate-800 dark:text-slate-200 z-20">
              <div className="bg-white/90 dark:bg-slate-900/90 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 w-fit shadow-md">100% dos visitantes viram esta dobra</div>
              <div className="bg-white/90 dark:bg-slate-900/90 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 w-fit shadow-md">65% dos visitantes rolaram até aqui</div>
              <div className="bg-white/90 dark:bg-slate-900/90 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 w-fit shadow-md">22% dos visitantes chegaram ao rodapé</div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
