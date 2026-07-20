import React, { useState } from 'react';
import { Layers, MousePointer, Eye, Filter, Info } from 'lucide-react';

export default function Heatmaps({ projects }) {
  const [selectedPage, setSelectedPage] = useState('/');
  const [activeTab, setActiveTab] = useState('clicks'); // 'clicks' | 'scroll'

  // Simulated heatmap click points for visual overlay
  const demoClickPoints = [
    { x: 50, y: 22, intensity: 0.9, clicks: 42 },
    { x: 30, y: 45, intensity: 0.7, clicks: 28 },
    { x: 70, y: 45, intensity: 0.85, clicks: 36 },
    { x: 50, y: 78, intensity: 0.6, clicks: 19 },
    { x: 15, y: 12, intensity: 0.4, clicks: 11 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Heatmaps de Cliques & Rolagem</h2>
          <p className="text-sm text-slate-400">
            Visualize as zonas de maior engajamento e cliques dos visitantes por página.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center gap-1">
          <button
            onClick={() => setActiveTab('clicks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === 'clicks' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MousePointer size={14} /> Cliques
          </button>
          <button
            onClick={() => setActiveTab('scroll')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === 'scroll' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers size={14} /> Rolagem (Scroll)
          </button>
        </div>
      </div>

      {/* Page Selector & Info Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-medium text-slate-400">Página:</span>
          <select
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
          >
            <option value="/">/ (Página Inicial)</option>
            <option value="/checkout">/checkout</option>
            <option value="/precos">/precos</option>
            <option value="/cadastro">/cadastro</option>
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400">
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

      {/* Simulated Page Canvas with Heatmap Overlay */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-2xl min-h-[500px]">
        
        {/* Mock Wireframe Page */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-8 max-w-4xl mx-auto min-h-[440px] relative pointer-events-none select-none">
          
          {/* Header section wireframe */}
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-6 mb-8">
            <div className="w-32 h-6 bg-slate-800/80 rounded-lg" />
            <div className="flex gap-4">
              <div className="w-16 h-4 bg-slate-800/60 rounded" />
              <div className="w-16 h-4 bg-slate-800/60 rounded" />
              <div className="w-24 h-8 bg-blue-600/40 rounded-lg" />
            </div>
          </div>

          {/* Hero section wireframe */}
          <div className="text-center py-12 space-y-4 max-w-lg mx-auto">
            <div className="w-3/4 h-8 bg-slate-800 rounded-xl mx-auto" />
            <div className="w-full h-4 bg-slate-800/50 rounded mx-auto" />
            <div className="w-2/3 h-4 bg-slate-800/50 rounded mx-auto" />
            
            <div className="pt-4 flex justify-center gap-4">
              <div className="w-36 h-10 bg-blue-600/60 rounded-xl" />
              <div className="w-36 h-10 bg-slate-800 rounded-xl" />
            </div>
          </div>

          {/* Feature grid wireframe */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-800/40">
            <div className="h-24 bg-slate-900/60 border border-slate-800/50 rounded-xl" />
            <div className="h-24 bg-slate-900/60 border border-slate-800/50 rounded-xl" />
            <div className="h-24 bg-slate-900/60 border border-slate-800/50 rounded-xl" />
          </div>

          {/* HEATMAP OVERLAY POINTS */}
          {activeTab === 'clicks' &&
            demoClickPoints.map((pt, idx) => (
              <div
                key={idx}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-auto cursor-pointer group transition-transform hover:scale-125"
                style={{
                  left: `${pt.x}%`,
                  top: `${pt.y}%`,
                  width: `${30 + pt.intensity * 40}px`,
                  height: `${30 + pt.intensity * 40}px`,
                  background: `radial-gradient(circle, rgba(239, 68, 68, ${pt.intensity}) 0%, rgba(234, 179, 8, ${pt.intensity * 0.7}) 50%, rgba(59, 130, 246, 0) 100%)`,
                  boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)',
                }}
              >
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-[10px] text-slate-100 whitespace-nowrap z-30 shadow-xl">
                  {pt.clicks} cliques nesta área ({Math.round(pt.intensity * 100)}% engajamento)
                </div>
              </div>
            ))}

          {/* SCROLL OVERLAY gradient */}
          {activeTab === 'scroll' && (
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/20 via-yellow-500/15 to-red-500/20 pointer-events-none flex flex-col justify-between p-4 text-[10px] font-bold text-slate-200">
              <div className="bg-slate-900/80 px-2 py-1 rounded border border-slate-700 w-fit">100% dos visitantes viram esta dobra</div>
              <div className="bg-slate-900/80 px-2 py-1 rounded border border-slate-700 w-fit">65% dos visitantes rolaram até aqui</div>
              <div className="bg-slate-900/80 px-2 py-1 rounded border border-slate-700 w-fit">22% dos visitantes chegaram ao rodapé</div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
