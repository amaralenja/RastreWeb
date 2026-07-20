import React from 'react';
import { Video, Globe, AlertTriangle, Zap, TrendingUp, Shield, Layers } from 'lucide-react';

export default function Dashboard({ account, projects, sessions, onNavigate }) {
  const totalSessions = sessions ? sessions.length : 0;
  const quotaLimit = account?.monthly_session_quota || 1000;
  const sessionsUsed = account?.sessions_used_this_cycle || totalSessions;
  const quotaPercent = Math.min(Math.round((sessionsUsed / quotaLimit) * 100), 100);

  const rageClickCount = sessions ? sessions.filter(s => s.rage_click).length : 0;
  const activeProjects = projects ? projects.filter(p => p.is_active).length : 0;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Quota Alert */}
      <div className="bg-gradient-to-r from-blue-900/40 via-slate-900 to-slate-900 border border-blue-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
              Plano {account?.plan || 'Trial'}
            </span>
            <span className="text-xs text-slate-400">• Multi-tenant Active</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">Visão Geral do Produto</h2>
          <p className="text-sm text-slate-400">
            Acompanhe o consumo de gravações, saúde das sessões e projetos ativos da sua conta.
          </p>
        </div>

        <div className="w-full md:w-72 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between text-xs font-medium mb-1.5">
            <span className="text-slate-300">Quota de Gravações</span>
            <span className="text-blue-400 font-bold">{sessionsUsed} / {quotaLimit}</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                quotaPercent > 85 ? 'bg-red-500' : quotaPercent > 60 ? 'bg-amber-500' : 'bg-blue-500'
              }`}
              style={{ width: `${quotaPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex justify-between">
            <span>{quotaPercent}% consumido</span>
            <button onClick={() => onNavigate('billing')} className="text-blue-400 hover:underline">Fazer Upgrade</button>
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Sessões Capturadas</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <Video size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-100 mt-3">{totalSessions}</p>
          <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
            <TrendingUp size={12} /> +12% esta semana
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Sites Cadastrados</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <Globe size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-100 mt-3">{activeProjects}</p>
          <p className="text-xs text-slate-400 mt-1">Domínios rastreados</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Rage Clicks</span>
            <div className="p-2 bg-red-500/10 text-red-400 rounded-lg">
              <AlertTriangle size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-100 mt-3">{rageClickCount}</p>
          <p className="text-xs text-red-400 mt-1">Frustrações de usuários</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Tempo Médio Sessão</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Zap size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-100 mt-3">48s</p>
          <p className="text-xs text-slate-400 mt-1">Retenção de navegação</p>
        </div>
      </div>

      {/* Quick Action Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Sessions list preview */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-100 text-sm">Gravações Recentes</h3>
            <button
              onClick={() => onNavigate('sessions')}
              className="text-xs text-blue-400 hover:underline font-medium"
            >
              Ver todas
            </button>
          </div>

          <div className="space-y-3">
            {sessions && sessions.length > 0 ? (
              sessions.slice(0, 4).map((s) => (
                <div
                  key={s.id || s.session_id}
                  onClick={() => onNavigate('sessions')}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-blue-500/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <div>
                      <p className="text-xs font-medium text-slate-200">{s.page_entry || '/'}</p>
                      <p className="text-[11px] text-slate-400">{s.browser} • {s.device}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{s.duration_seconds || 15}s</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                Nenhuma gravação capturada ainda. Instale o snippet no seu site!
              </div>
            )}
          </div>
        </div>

        {/* Setup Quick Guide */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="font-semibold text-slate-100 text-sm mb-4">Passos para Configuração no seu Site</h3>
          <div className="space-y-4 text-xs">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0 font-bold">1</div>
              <div>
                <p className="font-medium text-slate-200">Cadastre seu projeto/domínio</p>
                <p className="text-slate-400 mt-0.5">Crie um site no menu Projetos para gerar seu <code className="text-blue-300">site_key</code> exclusivo.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0 font-bold">2</div>
              <div>
                <p className="font-medium text-slate-200">Copie a tag &lt;script&gt;</p>
                <p className="text-slate-400 mt-0.5">Insira o snippet no cabeçalho (&lt;head&gt;) do seu site ou e-commerce.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0 font-bold">3</div>
              <div>
                <p className="font-medium text-slate-200">Assista aos Replays e Heatmaps</p>
                <p className="text-slate-400 mt-0.5">Os acessos serão capturados automaticamente e listados no seu painel.</p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('projects')}
              className="w-full mt-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition-colors text-center"
            >
              Gerenciar Projetos & Snippets
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
