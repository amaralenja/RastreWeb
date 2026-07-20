import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Download,
  CreditCard,
  Video,
  AlertTriangle,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Activity,
  Zap,
  CheckCircle2,
  Info
} from 'lucide-react';

export default function Dashboard({ account, projects, sessions, onNavigate, onCreateProject }) {
  const totalSessions = sessions ? sessions.length : 0;
  const quotaLimit = account?.monthly_session_quota || 1000;
  const sessionsUsed = account?.sessions_used_this_cycle !== undefined ? account.sessions_used_this_cycle : totalSessions;
  const rageClickCount = sessions ? sessions.filter((s) => s.rage_click).length : 0;
  const activeProjects = projects ? projects.filter((p) => p.is_active).length : 0;

  const desktopCount = sessions ? sessions.filter((s) => s.device === 'desktop' || !s.device).length : 0;
  const mobileCount = sessions ? sessions.filter((s) => s.device === 'mobile' || s.device === 'tablet').length : 0;
  const desktopPercent = totalSessions > 0 ? Math.round((desktopCount / totalSessions) * 100) : 0;
  const mobilePercent = totalSessions > 0 ? Math.round((mobileCount / totalSessions) * 100) : 0;

  const rageRate = totalSessions > 0 ? ((rageClickCount / totalSessions) * 100).toFixed(1) : '0';
  const avgDurationSeconds = totalSessions > 0
    ? Math.round(sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) / totalSessions)
    : 0;

  const accountOwnerName = (account?.name || 'MINHA CONTA').toUpperCase();
  const accountPlan = (account?.plan || 'TRIAL').toUpperCase();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* ONBOARDING BANNER IF ZERO PROJECTS OR ZERO SESSIONS */}
      {activeProjects === 0 && (
        <div className="bg-gradient-to-r from-indigo-900/60 via-slate-900 to-indigo-950/80 border border-indigo-500/30 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30 shrink-0">
              <Globe size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Bem-vindo ao RastreWeb!</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Você ainda não possui nenhum site cadastrado nesta conta. Cadastre seu primeiro domínio para gerar o snippet de instalação e começar a capturar gravações reais!
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('projects')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-xs font-semibold flex items-center gap-2 transition-all shrink-0 shadow-lg shadow-indigo-600/30"
          >
            <Plus size={16} /> Cadastrar Meu Primeiro Site
          </button>
        </div>
      )}

      {/* SECTION 1: TOP HEADER WITH QUICK STATS TITLE & ACTION BUTTON */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Estatísticas Rápidas do seu Produto</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Visão em tempo real das gravações, comportamento e audiência.</p>
        </div>

        <button
          onClick={() => onNavigate('projects')}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white rounded-full text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/25 hover:scale-105"
        >
          <Plus size={16} /> Cadastrar Novo Site
        </button>
      </div>

      {/* SECTION 2: TOP GRID (3 GLOWING BALANCE CARDS + 1 CREDIT CARD BALANCE WIDGET) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* CARD 1: GRAVAÇÕES DE SESSÃO */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between shadow-lg dark:shadow-xl relative overflow-hidden group hover:border-amber-500/40 transition-all hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Gravações de Sessão</span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-0.5">
              {totalSessions > 0 ? '+100%' : '0%'} <ArrowUpRight size={12} />
            </span>
          </div>

          <div className="my-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500/20 to-amber-500/5 border border-amber-500/30 flex items-center justify-center glow-orange relative">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Video size={24} />
              </div>
            </div>
          </div>

          <div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{totalSessions.toLocaleString('pt-BR')}</p>
            <button
              onClick={() => onNavigate('sessions')}
              className="mt-3 text-[11px] font-bold tracking-wider text-amber-600 dark:text-amber-400 hover:underline uppercase flex items-center gap-1 group-hover:translate-x-1 transition-transform"
            >
              Ver Replays <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {/* CARD 2: RAGE CLICKS */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between shadow-lg dark:shadow-xl relative overflow-hidden group hover:border-rose-500/40 transition-all hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Rage Clicks</span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-0.5">
              {rageClickCount > 0 ? `${rageRate}%` : '0%'} {rageClickCount > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            </span>
          </div>

          <div className="my-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-500/20 to-rose-500/5 border border-rose-500/30 flex items-center justify-center glow-pink relative">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <AlertTriangle size={24} />
              </div>
            </div>
          </div>

          <div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{rageClickCount}</p>
            <button
              onClick={() => onNavigate('sessions')}
              className="mt-3 text-[11px] font-bold tracking-wider text-rose-600 dark:text-rose-400 hover:underline uppercase flex items-center gap-1 group-hover:translate-x-1 transition-transform"
            >
              Analisar Impacto <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {/* CARD 3: SITES RASTREADOS */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between shadow-lg dark:shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Sites Rastreados</span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-0.5">
              {activeProjects > 0 ? 'Ativo' : 'Pendente'} <ArrowUpRight size={12} />
            </span>
          </div>

          <div className="my-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 flex items-center justify-center glow-green relative">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Globe size={24} />
              </div>
            </div>
          </div>

          <div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{activeProjects}</p>
            <button
              onClick={() => onNavigate('projects')}
              className="mt-3 text-[11px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 hover:underline uppercase flex items-center gap-1 group-hover:translate-x-1 transition-transform"
            >
              Gerenciar Snippet <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {/* CARD 4: CARDS & BALANCE WIDGET (DYNAMIC CREDIT CARD STYLE) */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Plano & Quota</span>
            <button
              onClick={() => onNavigate('billing')}
              className="px-3 py-1 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors"
            >
              + Upgrade
            </button>
          </div>

          <div className="mt-2">
            <p className="text-[11px] text-slate-400">Consumo da Quota Mensal</p>
            <p className="text-xl font-black text-slate-100 font-mono tracking-tight mt-0.5">
              {sessionsUsed.toLocaleString('pt-BR')} <span className="text-xs font-normal text-slate-400">/ {quotaLimit.toLocaleString('pt-BR')}</span>
            </p>
          </div>

          {/* STYLED CREDIT CARD ACCENT WIDGET */}
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-rose-500/15 to-emerald-500/15 border border-indigo-500/30 relative overflow-hidden shadow-inner">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-bold tracking-wider text-indigo-300 uppercase truncate max-w-[140px]">{accountOwnerName}</span>
              <span className="w-4 h-4 rounded-full bg-emerald-400 shadow-md shrink-0" />
            </div>

            <p className="font-mono text-xs text-slate-200 tracking-widest font-bold">
              ID: {account?.id ? account.id.substring(0, 16) : 'rw_account_1'}
            </p>

            <div className="mt-2 flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span>PLANO {accountPlan}</span>
              <span>30 DIAS</span>
            </div>
          </div>

        </div>

      </div>

      {/* SECTION 3: BOTTOM SECTION (LEFT AREA CHART + RIGHT 4 PASTEL METRIC CARDS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT 7 COLS: CURRENT BALANCE AREA CHART */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-lg dark:shadow-xl flex flex-col justify-between">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Volume de Tráfego Capturado</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
                {totalSessions > 0 ? `${(totalSessions * 42).toLocaleString('pt-BR')} eventos` : '0 eventos'}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Atual</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Anterior</span>
              </div>

              <button className="px-3 py-1.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                <Download size={14} /> Exportar
              </button>
            </div>
          </div>

          {/* AREA GRAPH */}
          <div className="relative h-64 w-full flex items-end justify-between pt-12 pb-4 border-b border-slate-200 dark:border-slate-800/60">
            
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-b border-slate-300 dark:border-slate-700 w-full" />
              <div className="border-b border-slate-300 dark:border-slate-700 w-full" />
              <div className="border-b border-slate-300 dark:border-slate-700 w-full" />
              <div className="border-b border-slate-300 dark:border-slate-700 w-full" />
            </div>

            {totalSessions > 0 ? (
              <>
                {/* Glowing Peak Data Marker */}
                <div className="absolute left-[42%] top-[15%] flex flex-col items-center z-20">
                  <div className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-600/40">
                    {totalSessions} recs
                  </div>
                  <div className="w-[2px] h-28 bg-indigo-500 dark:bg-slate-100 shadow-lg" />
                  <div className="w-3 h-3 rounded-full bg-white border-2 border-indigo-600 shadow-md -mt-1.5" />
                </div>

                {/* SVG Wave Shapes */}
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 500 200">
                  <defs>
                    <linearGradient id="gradCurrent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="gradPast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  <path
                    d="M 0 160 Q 100 120 200 140 T 400 90 T 500 130 L 500 200 L 0 200 Z"
                    fill="url(#gradPast)"
                  />
                  <path
                    d="M 0 160 Q 100 120 200 140 T 400 90 T 500 130"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                  />

                  <path
                    d="M 0 140 Q 100 80 210 40 T 400 110 T 500 70 L 500 200 L 0 200 Z"
                    fill="url(#gradCurrent)"
                  />
                  <path
                    d="M 0 140 Q 100 80 210 40 T 400 110 T 500 70"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="3"
                  />
                </svg>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs italic">
                Aguardando primeiras gravações do seu site...
              </div>
            )}

          </div>

          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium pt-3 px-2">
            <span>Hoje</span>
            <span>7 dias</span>
            <span>14 dias</span>
            <span className="text-indigo-600 dark:text-slate-100 font-bold">21 dias</span>
            <span>30 dias</span>
          </div>

        </div>

        {/* RIGHT 5 COLS: 4 PASTEL METRIC CARDS */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          
          {/* CARD 1: DESKTOP */}
          <div className="bg-amber-500/10 dark:bg-gradient-to-br dark:from-amber-500/15 dark:to-slate-900 border border-amber-500/20 rounded-3xl p-5 flex flex-col justify-between shadow-md hover:scale-[1.02] transition-transform">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">🖥️ Desktop</span>
              <button className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xs">+</button>
            </div>

            <div className="my-3">
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{desktopCount}</p>
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">{desktopPercent}% do total</p>
            </div>

            <div className="w-full h-1 bg-amber-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${desktopPercent}%` }} />
            </div>
          </div>

          {/* CARD 2: MOBILE */}
          <div className="bg-rose-500/10 dark:bg-gradient-to-br dark:from-rose-500/15 dark:to-slate-900 border border-rose-500/20 rounded-3xl p-5 flex flex-col justify-between shadow-md hover:scale-[1.02] transition-transform">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300">📱 Mobile</span>
              <button className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300 flex items-center justify-center font-bold text-xs">+</button>
            </div>

            <div className="my-3">
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{mobileCount}</p>
              <p className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold mt-0.5">{mobilePercent}% do total</p>
            </div>

            <div className="w-full h-1 bg-rose-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full" style={{ width: `${mobilePercent}%` }} />
            </div>
          </div>

          {/* CARD 3: RAGE RATE */}
          <div className="bg-slate-200/60 dark:bg-gradient-to-br dark:from-slate-800/40 dark:to-slate-900 border border-slate-300 dark:border-slate-700/50 rounded-3xl p-5 flex flex-col justify-between shadow-md hover:scale-[1.02] transition-transform">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">⚡ Rage Rate</span>
              <button className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-700/40 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs">+</button>
            </div>

            <div className="my-3">
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{rageRate}%</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Taxa de cliques repetidos</p>
            </div>

            <div className="w-full h-1 bg-slate-300 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-slate-500 dark:bg-slate-400 rounded-full" style={{ width: `${Math.min(Number(rageRate), 100)}%` }} />
            </div>
          </div>

          {/* CARD 4: DURAÇÃO */}
          <div className="bg-indigo-500/10 dark:bg-gradient-to-br dark:from-indigo-500/15 dark:to-slate-900 border border-indigo-500/20 rounded-3xl p-5 flex flex-col justify-between shadow-md hover:scale-[1.02] transition-transform">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300">⏱️ Duração</span>
              <button className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">+</button>
            </div>

            <div className="my-3">
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100">0:{avgDurationSeconds.toString().padStart(2, '0')}s</p>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">Média por sessão</p>
            </div>

            <div className="w-full h-1 bg-indigo-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(avgDurationSeconds, 100)}%` }} />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
