import React, { useState, useEffect } from 'react';
import { supabase, isConfigured } from '../lib/supabase';
import { Terminal, Shield, Database, Folder, CheckCircle, AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

export default function DiagnosticInspector({ user, account, projects, sessions, onRefresh }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState(null);

  const runFullDiagnostics = async () => {
    setIsRunning(true);
    const logs = [];

    const addLog = (category, title, details, status = 'info') => {
      logs.push({ time: new Date().toLocaleTimeString('pt-BR'), category, title, details, status });
    };

    addLog('ENV', 'Configuração do Supabase', {
      isConfigured,
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'Não configurado',
      hasAnonKey: Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY),
    }, isConfigured ? 'success' : 'warning');

    // 1. Check Auth User
    if (user) {
      addLog('AUTH', 'Usuário Autenticado', { id: user.id, email: user.email }, 'success');
    } else {
      addLog('AUTH', 'Usuário Não Autenticado', null, 'error');
    }

    // 2. Query Accounts table
    try {
      if (user && isConfigured) {
        const { data: accData, error: accErr } = await supabase
          .from('accounts')
          .select('*')
          .eq('owner_user_id', user.id);

        if (accErr) {
          addLog('DB_ACCOUNTS', 'Erro ao consultar tabela accounts', accErr.message, 'error');
        } else {
          addLog('DB_ACCOUNTS', `Contas encontradas no Postgres (${accData?.length || 0})`, accData, 'success');
        }
      }
    } catch (e) {
      addLog('DB_ACCOUNTS', 'Exceção ao consultar accounts', e.message, 'error');
    }

    // 3. Query Projects table
    try {
      if (user && isConfigured) {
        const { data: projData, error: projErr } = await supabase
          .from('projects')
          .select('*');

        if (projErr) {
          addLog('DB_PROJECTS', 'Erro RLS/Permissão na tabela projects', projErr.message, 'error');
        } else {
          addLog('DB_PROJECTS', `Projetos encontrados no Postgres (${projData?.length || 0})`, projData, 'success');
        }
      }
    } catch (e) {
      addLog('DB_PROJECTS', 'Exceção ao consultar projects', e.message, 'error');
    }

    // 4. Test Ingestion Edge Endpoint FIRST (so a test session is created in Postgres)
    const targetSiteKey = projects?.[0]?.site_key || 'site_321gli8fici';
    try {
      const pingPayload = {
        site_key: targetSiteKey,
        session_id: 'sess_ping_' + Math.random().toString(36).substring(2, 8),
        page_entry: '/ping-diagnostic',
        device: 'desktop',
        browser: 'DiagnosticTester',
        events: [{ type: 4, data: { href: '/ping' }, timestamp: Date.now() }],
      };

      const res = await fetch('/api/ingest-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pingPayload),
      });

      const resData = await res.json();
      addLog('API_ENDPOINT', `Resposta da API /api/ingest-session (HTTP ${res.status}) com site_key (${targetSiteKey})`, resData, res.ok ? 'success' : 'warning');
    } catch (e) {
      addLog('API_ENDPOINT', 'Falha de rede na API /api/ingest-session', e.message, 'error');
    }

    // Refresh parent state to ensure newly ingested session is fetched
    if (onRefresh) {
      try {
        await onRefresh();
      } catch (e) {}
    }

    // 5. Query Sessions table AFTER ingestion ping
    try {
      if (user && isConfigured) {
        const { data: sessData, error: sessErr } = await supabase
          .from('sessions')
          .select('*')
          .order('started_at', { ascending: false });

        if (sessErr) {
          addLog('DB_SESSIONS', 'Erro RLS/Permissão na tabela sessions', sessErr.message, 'error');
        } else {
          addLog('DB_SESSIONS', `Sessões/Replays encontrados no Postgres (${sessData?.length || 0})`, sessData, 'success');
        }
      }
    } catch (e) {
      addLog('DB_SESSIONS', 'Exceção ao consultar sessions', e.message, 'error');
    }

    setReport(logs);
    setIsRunning(false);
  };

  useEffect(() => {
    if (isOpen && !report) {
      runFullDiagnostics();
    }
  }, [isOpen]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl mb-6">
      
      {/* Header bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-6 py-4 bg-slate-950 flex items-center justify-between cursor-pointer select-none border-b border-slate-800/80 hover:bg-slate-900/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Terminal size={18} className="text-emerald-400" />
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Painel Transparente de Diagnóstico em Tempo Real
            </h3>
            <p className="text-[11px] text-slate-400">
              Inspecione o estado das tabelas do Supabase Postgres, RLS, Storage e rotas Vercel.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              runFullDiagnostics();
            }}
            disabled={isRunning}
            className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={isRunning ? 'animate-spin' : ''} />
            {isRunning ? 'Executando...' : 'Rodar Diagnóstico'}
          </button>

          {isOpen ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
        </div>
      </div>

      {/* Expanded Diagnostic Log Feed */}
      {isOpen && (
        <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto font-mono text-xs bg-slate-950/90">
          {report ? (
            report.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border ${
                  item.status === 'error'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : item.status === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-700 text-slate-300 uppercase">
                      {item.category}
                    </span>
                    {item.title}
                  </span>
                  <span className="text-[10px] text-slate-500">{item.time}</span>
                </div>

                {item.details && (
                  <pre className="mt-2 p-2 bg-slate-950 rounded border border-slate-800/80 text-[11px] overflow-x-auto text-slate-300">
                    {typeof item.details === 'object' ? JSON.stringify(item.details, null, 2) : String(item.details)}
                  </pre>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500 flex items-center justify-center gap-2">
              <RefreshCw className="animate-spin" size={16} /> Carregando diagnóstico...
            </div>
          )}
        </div>
      )}

    </div>
  );
}
