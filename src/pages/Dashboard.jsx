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
  Zap
} from 'lucide-react';

export default function Dashboard({ account, projects, sessions, onNavigate, onCreateProject }) {
  const totalSessions = sessions ? sessions.length : 3;
  const quotaLimit = account?.monthly_session_quota || 10000;
  const sessionsUsed = account?.sessions_used_this_cycle || 1465;
  const rageClickCount = sessions ? sessions.filter((s) => s.rage_click).length : 1;
  const activeProjects = projects ? projects.filter((p) => p.is_active).length : 2;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* SECTION 1: TOP HEADER WITH QUICK STATS TITLE & ACTION BUTTON */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Estatísticas Rápidas do seu Produto</h2>
          <p className="text-xs text-slate-400 mt-0.5">Visão em tempo real das gravações, comportamento e audiência.</p>
        </div>

        <button
          onClick={() => onNavigate('projects')}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25 hover:scale-105"
        >
          <Plus size={16} /> Cadastrar Novo Site
        </button>
      </div>

      {/* SECTION 2: TOP GRID (3 GLOWING BALANCE CARDS + 1 CREDIT CARD BALANCE WIDGET) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* CARD 1: GRAVAÇÕES DE SESSÃO (BITCOIN BALANCE STYLE) */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-amber-500/40 transition-all hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Gravações de Sessão</span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-0.5">
              73% <ArrowUpRight size={12} />
            </span>
          </div>

          {/* Glowing Pie chart / Progress icon */}
          <div className="my-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500/20 to-amber-500/5 border border-amber-500/30 flex items-center justify-center glow-orange relative">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                <Video size={24} />
              </div>
            </div>
          </div>

          <div>
            <p className="text-2xl font-extrabold text-slate-100 tracking-tight">{sessionsUsed.toLocaleString('pt-BR')}</p>
            <button
              onClick={() => onNavigate('sessions')}
              className="mt-3 text-[11px] font-bold tracking-wider text-amber-400 hover:text-amber-300 uppercase flex items-center gap-1 group-hover:translate-x-1 transition-transform"
            >
              Ver Replays <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {/* CARD 2: RAGE CLICKS (ETHEREUM BALANCE STYLE) */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-rose-500/40 transition-all hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Rage Clicks</span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-0.5">
              22% <ArrowDownRight size={12} />
            </span>
          </div>

          {/* Glowing Rose Icon */}
          <div className="my-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-500/20 to-rose-500/5 border border-rose-500/30 flex items-center justify-center glow-pink relative">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
                <AlertTriangle size={24} />
              </div>
            </div>
          </div>

          <div>
            <p className="text-2xl font-extrabold text-slate-100 tracking-tight">{rageClickCount}</p>
            <button
              onClick={() => onNavigate('sessions')}
              className="mt-3 text-[11px] font-bold tracking-wider text-rose-400 hover:text-rose-300 uppercase flex items-center gap-1 group-hover:translate-x-1 transition-transform"
            >
              Analisar Impacto <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {/* CARD 3: SITES RASTREADOS (USDT BALANCE STYLE) */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Sites Rastreados</span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-0.5">
              100% <ArrowUpRight size={12} />
            </span>
          </div>

          {/* Glowing Emerald Icon */}
          <div className="my-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 flex items-center justify-center glow-green relative">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Globe size={24} />
              </div>
            </div>
          </div>

          <div>
            <p className="text-2xl font-extrabold text-slate-100 tracking-tight">{activeProjects}</p>
            <button
              onClick={() => onNavigate('projects')}
              className="mt-3 text-[11px] font-bold tracking-wider text-emerald-400 hover:text-emerald-300 uppercase flex items-center gap-1 group-hover:translate-x-1 transition-transform"
            >
              Gerenciar Snippet <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {/* CARD 4: CARDS & BALANCE WIDGET (CREDIT CARD STYLE FROM SCREENSHOT) */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Plano & Quota</span>
            <button
              onClick={() => onNavigate('billing')}
              className="px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
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

          {/* STYLED CREDIT CARD ACCENT WIDGET (EXACT MATCH FROM IMAGE) */}
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/10 border border-amber-500/20 relative overflow-hidden shadow-inner">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-bold tracking-wider text-amber-300 uppercase">AMARAL SHAKIR</span>
              <span className="w-4 h-4 rounded-full bg-amber-400/80 shadow-md" />
            </div>

            <p className="font-mono text-xs text-slate-200 tracking-widest font-bold">
              4902 4390 5230 3300
            </p>

            <div className="mt-2 flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span>PLANO STARTER</span>
              <span>12/2026</span>
            </div>
          </div>

        </div>

      </div>

      {/* SECTION 3: BOTTOM SECTION (LEFT AREA CHART + RIGHT 4 PASTEL METRIC CARDS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT 7 COLS: CURRENT BALANCE AREA CHART WITH PEAK TOOLTIP */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div>
              <span className="text-xs text-slate-400 font-medium">Volume de Tráfego Capturado</span>
              <h3 className="text-2xl font-black text-slate-100 tracking-tight mt-0.5">158.690 eventos</h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Atual</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Anterior</span>
              </div>

              <button className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-center gap-1.5 hover:bg-slate-800 transition-colors">
                <Download size={14} /> Exportar
              </button>
            </div>
          </div>

          {/* SIMULATED AREA GRAPH WITH PEAK TOOLTIP ($55.890 STYLE FROM SCREENSHOT) */}
          <div className="relative h-64 w-full flex items-end justify-between pt-12 pb-4 border-b border-slate-800/60">
            
            {/* Background Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-b border-slate-700 w-full" />
              <div className="border-b border-slate-700 w-full" />
              <div className="border-b border-slate-700 w-full" />
              <div className="border-b border-slate-700 w-full" />
            </div>

            {/* Glowing Peak Data Marker ($55.890 Style from reference screenshot) */}
            <div className="absolute left-[42%] top-[15%] flex flex-col items-center z-20">
              <div className="px-3 py-1 bg-rose-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-rose-500/40">
                55.890 rec
              </div>
              <div className="w-[2px] h-28 bg-slate-100 shadow-lg" />
              <div className="w-3 h-3 rounded-full bg-white border-2 border-rose-500 shadow-md -mt-1.5" />
            </div>

            {/* SVG Wave Shapes */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 500 200">
              <defs>
                <linearGradient id="gradCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="gradPast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Past Wave (Green) */}
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

              {/* Current Wave (Orange / Amber) */}
              <path
                d="M 0 140 Q 100 80 210 40 T 400 110 T 500 70 L 500 200 L 0 200 Z"
                fill="url(#gradCurrent)"
              />
              <path
                d="M 0 140 Q 100 80 210 40 T 400 110 T 500 70"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3"
              />
            </svg>

          </div>

          {/* Graph X Axis Dates */}
          <div className="flex justify-between text-xs text-slate-400 font-medium pt-3 px-2">
            <span>01 Maio</span>
            <span>05 Maio</span>
            <span>10 Maio</span>
            <span className="text-slate-100 font-bold">15 Maio</span>
            <span>20 Maio</span>
            <span>25 Maio</span>
            <span>30 Maio</span>
          </div>

        </div>

        {/* RIGHT 5 COLS: 4 COLORED PASTEL METRIC CARDS (MATCHING USDT, EURO, POUND, YEN CARDS FROM IMAGE) */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          
          {/* CARD 1: DESKTOP (USDT YELLOW PASTEL STYLE) */}
          <div className="bg-gradient-to-br from-amber-500/15 to-slate-900 border border-amber-500/25 rounded-3xl p-5 flex flex-col justify-between shadow-lg hover:scale-[1.02] transition-transform">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-amber-300">🖥️ Desktop</span>
              <button className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">+</button>
            </div>

            <div className="my-3">
              <p className="text-2xl font-black text-slate-100">1.46k</p>
              <p className="text-[10px] text-amber-400 font-semibold mt-0.5">+13% em 30 dias</p>
            </div>

            <div className="w-full h-1 bg-amber-500/20 rounded-full overflow-hidden">
              <div className="w-[68%] h-full bg-amber-400 rounded-full" />
            </div>
          </div>

          {/* CARD 2: MOBILE (EURO PINK PASTEL STYLE) */}
          <div className="bg-gradient-to-br from-rose-500/15 to-slate-900 border border-rose-500/25 rounded-3xl p-5 flex flex-col justify-between shadow-lg hover:scale-[1.02] transition-transform">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-rose-300">📱 Mobile</span>
              <button className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold text-xs">+</button>
            </div>

            <div className="my-3">
              <p className="text-2xl font-black text-slate-100">2.12k</p>
              <p className="text-[10px] text-rose-400 font-semibold mt-0.5">+24% em 30 dias</p>
            </div>

            <div className="w-full h-1 bg-rose-500/20 rounded-full overflow-hidden">
              <div className="w-[32%] h-full bg-rose-400 rounded-full" />
            </div>
          </div>

          {/* CARD 3: TAXA DE FRUSTRAÇÃO (POUND GRAY PASTEL STYLE) */}
          <div className="bg-gradient-to-br from-slate-800/40 to-slate-900 border border-slate-700/50 rounded-3xl p-5 flex flex-col justify-between shadow-lg hover:scale-[1.02] transition-transform">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-slate-300">⚡ Rage Rate</span>
              <button className="w-6 h-6 rounded-full bg-slate-700/40 text-slate-300 flex items-center justify-center font-bold text-xs">+</button>
            </div>

            <div className="my-3">
              <p className="text-2xl font-black text-slate-100">1.2%</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">0% variação</p>
            </div>

            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="w-[12%] h-full bg-slate-400 rounded-full" />
            </div>
          </div>

          {/* CARD 4: TEMPO MÉDIO (YEN BEIGE PASTEL STYLE) */}
          <div className="bg-gradient-to-br from-indigo-500/15 to-slate-900 border border-indigo-500/25 rounded-3xl p-5 flex flex-col justify-between shadow-lg hover:scale-[1.02] transition-transform">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-indigo-300">⏱️ Duração</span>
              <button className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs">+</button>
            </div>

            <div className="my-3">
              <p className="text-2xl font-black text-slate-100">0:48s</p>
              <p className="text-[10px] text-indigo-400 font-semibold mt-0.5">+8% retenção</p>
            </div>

            <div className="w-full h-1 bg-indigo-500/20 rounded-full overflow-hidden">
              <div className="w-[84%] h-full bg-indigo-400 rounded-full" />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
