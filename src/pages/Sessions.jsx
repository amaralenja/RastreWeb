import React, { useState } from 'react';
import { Play, Filter, AlertCircle, Monitor, Smartphone, Tablet, Search, Clock, ExternalLink, RefreshCw } from 'lucide-react';

export default function Sessions({ sessions, onPlaySession, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [rageOnly, setRageOnly] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    if (onRefresh) {
      await onRefresh();
    }
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const filteredSessions = (sessions || []).filter((s) => {
    const matchesSearch =
      (s.page_entry || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.session_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.browser || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDevice = deviceFilter === 'all' || s.device === deviceFilter;
    const matchesRage = !rageOnly || s.rage_click;

    return matchesSearch && matchesDevice && matchesRage;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Gravações de Sessão (Replays)</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Assista ao comportamento em vídeo DOM dos visitantes do seu site.
          </p>
        </div>

        <button
          onClick={handleManualRefresh}
          className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-300 dark:border-slate-700"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          Atualizar Replays ({sessions?.length || 0})
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrar por URL, ID ou Navegador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={deviceFilter}
            onChange={(e) => setDeviceFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Todos os Dispositivos</option>
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
            <option value="tablet">Tablet</option>
          </select>

          <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 select-none">
            <input
              type="checkbox"
              checked={rageOnly}
              onChange={(e) => setRageOnly(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-0 bg-white dark:bg-slate-900"
            />
            <AlertCircle size={14} className="text-rose-500" />
            <span>Apenas Rage Clicks</span>
          </label>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Sessão ID</th>
                <th className="py-3.5 px-4">Página de Entrada</th>
                <th className="py-3.5 px-4">Dispositivo</th>
                <th className="py-3.5 px-4">Duração</th>
                <th className="py-3.5 px-4">Alertas</th>
                <th className="py-3.5 px-4">Data/Hora</th>
                <th className="py-3.5 px-4 text-right">Ação</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
              {filteredSessions.length > 0 ? (
                filteredSessions.map((s) => (
                  <tr key={s.id || s.session_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                      {s.session_id.substring(0, 16)}...
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate font-medium text-slate-900 dark:text-slate-100">
                      {s.page_entry || '/'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 capitalize text-slate-700 dark:text-slate-300">
                        {s.device === 'mobile' ? <Smartphone size={14} /> : s.device === 'tablet' ? <Tablet size={14} /> : <Monitor size={14} />}
                        {s.device || 'desktop'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
                        <Clock size={12} className="text-slate-400" />
                        {s.duration_seconds || 15}s
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {s.rage_click ? (
                        <span className="px-2 py-0.5 text-[11px] font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-full inline-flex items-center gap-1">
                          <AlertCircle size={12} /> Rage Click
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {new Date(s.started_at || Date.now()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onPlaySession(s)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium inline-flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-600/20"
                      >
                        <Play size={12} /> Assistir Replay
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Nenhuma gravação encontrada com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
