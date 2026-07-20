import React, { useEffect, useRef, useState } from 'react';
import { X, Play, Pause, Monitor, Smartphone, Tablet, AlertCircle, RefreshCw } from 'lucide-react';
import rrwebPlayer from 'rrweb-player';

export default function SessionPlayerModal({ session, onClose }) {
  const playerContainerRef = useRef(null);
  const playerInstanceRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!session) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    // Mock rrweb events if no recording stream exists yet in local test
    const generateDemoEvents = () => {
      const startTime = Date.now() - (session.duration_seconds || 30) * 1000;
      return [
        { type: 4, data: { href: session.page_entry || '/', width: 1280, height: 720 }, timestamp: startTime },
        { type: 2, data: { node: { id: 1, type: 0, childNodes: [{ id: 2, type: 2, tagName: 'html', childNodes: [{ id: 3, type: 2, tagName: 'body', childNodes: [{ id: 4, type: 2, tagName: 'div', attributes: { class: 'p-8 font-sans' }, childNodes: [{ id: 5, type: 3, textContent: 'Sessão de Teste RastreWeb Replay' }] }] }] }] } }, timestamp: startTime + 100 },
        { type: 3, data: { source: 1, positions: [{ x: 100, y: 150, id: 4, timeOffset: 500 }] }, timestamp: startTime + 500 },
        { type: 3, data: { source: 1, positions: [{ x: 300, y: 250, id: 4, timeOffset: 1200 }] }, timestamp: startTime + 1200 },
        { type: 3, data: { source: 2, type: 2, id: 4, x: 300, y: 250 }, timestamp: startTime + 1500 },
      ];
    };

    const loadRecordingData = async () => {
      try {
        let events = [];
        if (session.events && Array.isArray(session.events) && session.events.length > 0) {
          events = session.events;
        } else {
          // Fallback to demo events for preview
          events = generateDemoEvents();
        }

        if (!isMounted) return;

        if (playerContainerRef.current) {
          playerContainerRef.current.innerHTML = '';
          playerInstanceRef.current = new rrwebPlayer({
            target: playerContainerRef.current,
            props: {
              events: events,
              width: 1024,
              height: 576,
              autoPlay: true,
              showController: true,
            },
          });
        }
        setLoading(false);
      } catch (err) {
        if (isMounted) {
          console.error('Erro ao inicializar player rrweb:', err);
          setError('Não foi possível carregar a gravação do servidor.');
          setLoading(false);
        }
      }
    };

    loadRecordingData();

    return () => {
      isMounted = false;
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.$destroy();
        } catch (e) {}
      }
    };
  }, [session]);

  if (!session) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {session.device === 'mobile' ? <Smartphone size={18} /> : session.device === 'tablet' ? <Tablet size={18} /> : <Monitor size={18} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-100 text-base">Sessão {session.session_id}</h3>
                {session.rage_click && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 rounded-full flex items-center gap-1">
                    <AlertCircle size={12} /> Rage Click
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {session.page_entry} • {session.browser || 'Navegador'} • {session.duration_seconds || 0}s de duração
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Player Canvas Container */}
        <div className="flex-1 bg-slate-950 p-6 flex items-center justify-center overflow-auto min-h-[400px]">
          {loading && (
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <RefreshCw className="animate-spin text-blue-500" size={32} />
              <p className="text-sm">Carregando gravação da sessão...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-2 text-red-400">
              <AlertCircle size={32} />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div
            ref={playerContainerRef}
            className={`w-full flex justify-center ${loading || error ? 'hidden' : 'block'}`}
          />
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/80 text-xs text-slate-400 flex items-center justify-between">
          <span>Iniciado em: {new Date(session.started_at).toLocaleString('pt-BR')}</span>
          <span>Resolução simulada: {session.viewport_width || 1280}px</span>
        </div>
      </div>
    </div>
  );
}
