import React, { useState, useEffect } from 'react';
import { Play, Send, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Terminal, MousePointer, ShoppingCart, Lock, Plus, Key } from 'lucide-react';

export default function TestPage({ projects, selectedProjectId, onCreateProject }) {
  const [overrideSiteKey, setOverrideSiteKey] = useState('');
  const selectedProject = projects?.find((p) => p.id === selectedProjectId) || projects?.[0];
  const activeSiteKey = overrideSiteKey || selectedProject?.site_key || '';

  const [logs, setLogs] = useState([]);
  const [clickCount, setClickCount] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const addLog = (msg, type = 'info') => {
    const time = new Date().toLocaleTimeString('pt-BR');
    setLogs((prev) => [{ id: Date.now(), time, msg, type }, ...prev.slice(0, 49)]);
  };

  useEffect(() => {
    if (activeSiteKey) {
      addLog(`Página de Teste vinculada ao site_key: ${activeSiteKey}`, 'success');
    } else {
      addLog(`⚠️ Nenhum site_key ativo. Selecione ou crie um projeto abaixo.`, 'warning');
    }
  }, [activeSiteKey]);

  // Handle auto creation of a real project if none exists yet
  const handleEnsureProject = async () => {
    if (onCreateProject) {
      addLog('Criando novo site no banco de dados Supabase...', 'info');
      await onCreateProject({
        name: 'Site de Teste Interno ' + Math.floor(Math.random() * 100),
        domain: window.location.hostname || 'localhost',
      });
      addLog('✅ Projeto criado com sucesso no banco Postgres!', 'success');
    }
  };

  // Trigger manual test ingestion
  const handleTestIngest = async () => {
    if (!activeSiteKey) {
      addLog('Criando projeto de teste no banco antes do envio...', 'warning');
      await handleEnsureProject();
      return;
    }

    setIsSending(true);
    addLog(`Enviando requisição de teste para /api/ingest-session com site_key: ${activeSiteKey}...`, 'info');

    const testSessionId = 'sess_test_' + Math.random().toString(36).substring(2, 8);

    const testPayload = {
      site_key: activeSiteKey,
      session_id: testSessionId,
      page_entry: window.location.href,
      device: 'desktop',
      browser: 'Chrome (Teste Interno)',
      started_at: new Date().toISOString(),
      duration_seconds: 15,
      rage_click: clickCount >= 3,
      events: [
        { type: 4, data: { href: window.location.href, width: 1280, height: 720 }, timestamp: Date.now() - 5000 },
        { type: 3, data: { source: 2, type: 2, id: 1, x: 250, y: 300 }, timestamp: Date.now() - 2000 },
      ],
      heatmap_events: [
        {
          page_path: window.location.pathname,
          event_type: 'click',
          x_percent: 50,
          y_percent: 45,
          viewport_width: window.innerWidth,
          session_id: testSessionId,
        },
      ],
    };

    try {
      const res = await fetch('/api/ingest-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        addLog(`✅ SUCESSO! Ingestão aceita pelo servidor (HTTP 200). Sessão criada no Supabase: ${data.session_id}`, 'success');
      } else {
        addLog(`❌ ERRO (${res.status}): ${data.error || 'Falha na ingestão'}`, 'error');
      }
    } catch (err) {
      addLog(`❌ Exceção de rede ao chamar /api/ingest-session: ${err.message}`, 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleBuggyClick = () => {
    setClickCount((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        addLog(`⚠️ Rage Click detectado! ${next} cliques consecutivos no mesmo botão.`, 'warning');
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Laboratório de Testes Internos</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Página de testes interativa para disparar requisições reais de ingestão e validar a gravação e heatmaps.
          </p>
        </div>

        <button
          onClick={handleTestIngest}
          disabled={isSending}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
        >
          {isSending ? <RefreshCw className="animate-spin" size={16} /> : <Send size={16} />}
          Disparar Teste de Ingestão Agora
        </button>
      </div>

      {/* Site Key Selector & Manual Input */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Key size={18} className="text-indigo-500 shrink-0" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">Chave de Rastreador (site_key):</span>
          
          {projects && projects.length > 0 ? (
            <select
              value={overrideSiteKey || selectedProject?.site_key || ''}
              onChange={(e) => setOverrideSiteKey(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.site_key}>
                  {p.name} ({p.site_key})
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder="Cole uma site_key ou crie um projeto"
              value={overrideSiteKey}
              onChange={(e) => setOverrideSiteKey(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 w-64"
            />
          )}
        </div>

        <button
          onClick={handleEnsureProject}
          className="px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
        >
          <Plus size={14} /> Criar Novo Projeto no Banco
        </button>
      </div>

      {/* Grid: Left Simulated Playground + Right Terminal Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Interactive Playground */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <MousePointer size={16} className="text-indigo-500" /> Playground Interativo do Cliente
            </span>
            <span className="text-[11px] font-mono bg-slate-100 dark:bg-slate-950 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              Site Key: <strong className="text-indigo-600 dark:text-indigo-400">{activeSiteKey || 'Nenhum'}</strong>
            </span>
          </div>

          {/* Simulated Product Card */}
          <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Produto Exemplo RastreWeb</h4>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">R$ 197,00</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clique nos botões abaixo para simular ações de visitantes (compras, cliques repetidos e formulários).
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => addLog('Clique registrado no botão "Comprar Produto"', 'info')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
              >
                <ShoppingCart size={14} /> Comprar Produto
              </button>

              <button
                onClick={handleBuggyClick}
                className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5"
              >
                <AlertTriangle size={14} /> Botão com Bug (Rage Click Test) [{clickCount}]
              </button>
            </div>
          </div>

          {/* Form Masking Test */}
          <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800/80">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
              <Lock size={14} className="text-emerald-500" /> Teste de Mascaramento LGPD (maskAllInputs)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Nome do Cliente</label>
                <input
                  type="text"
                  placeholder="Maria Silva"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-slate-900 dark:text-slate-100 placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Senha (Ocultada na gravação)</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-slate-900 dark:text-slate-100 placeholder-slate-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Live Inspection Console */}
        <div className="lg:col-span-5 bg-slate-950 text-slate-200 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col h-[480px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Terminal size={16} className="text-emerald-400" /> Terminal de Ingestão em Tempo Real
            </span>
            <button
              onClick={() => setLogs([])}
              className="text-[11px] text-slate-500 hover:text-slate-300"
            >
              Limpar Logs
            </button>
          </div>

          {/* Console Log Feed */}
          <div className="flex-1 overflow-y-auto space-y-2 font-mono text-[11px] pr-2">
            {logs.length > 0 ? (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-2 rounded border ${
                    log.type === 'error'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      : log.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : log.type === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <span className="text-slate-500 mr-2">[{log.time}]</span>
                  <span>{log.msg}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-20 text-slate-600 text-xs italic">
                Aguardando interações ou envio manual...
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
