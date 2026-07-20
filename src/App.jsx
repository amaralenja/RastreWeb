import React, { useState, useEffect } from 'react';
import { supabase, isConfigured } from './lib/supabase';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Sessions from './pages/Sessions';
import Heatmaps from './pages/Heatmaps';
import Billing from './pages/Billing';
import SessionPlayerModal from './components/SessionPlayerModal';
import {
  Video,
  Globe,
  Layers,
  CreditCard,
  LogOut,
  Settings,
  Bell,
  Home,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [account, setAccount] = useState({
    name: 'Amaral Shakir',
    plan: 'starter',
    monthly_session_quota: 10000,
    sessions_used_this_cycle: 1465,
  });
  const [projects, setProjects] = useState([
    {
      id: 'proj_1',
      name: 'E-commerce RastreWeb',
      domain: 'loja.rastreweb.com',
      site_key: 'site_8a7f92b10c4d',
      is_active: true,
    },
    {
      id: 'proj_2',
      name: 'Landing Page SaaS',
      domain: 'lp.rastreweb.com',
      site_key: 'site_3e5d19a48f6b',
      is_active: true,
    },
  ]);
  const [selectedProjectId, setSelectedProjectId] = useState('proj_1');
  const [sessions, setSessions] = useState([
    {
      id: 'sess_1',
      session_id: 'sess_99a81bc3d2',
      page_entry: 'https://loja.rastreweb.com/produto/12',
      device: 'desktop',
      browser: 'Chrome',
      duration_seconds: 48,
      rage_click: true,
      started_at: new Date(Date.now() - 15 * 60000).toISOString(),
    },
    {
      id: 'sess_2',
      session_id: 'sess_44e10df8aa',
      page_entry: 'https://loja.rastreweb.com/checkout',
      device: 'mobile',
      browser: 'Safari',
      duration_seconds: 92,
      rage_click: false,
      started_at: new Date(Date.now() - 45 * 60000).toISOString(),
    },
    {
      id: 'sess_3',
      session_id: 'sess_12c98ef710',
      page_entry: 'https://loja.rastreweb.com/',
      device: 'desktop',
      browser: 'Firefox',
      duration_seconds: 24,
      rage_click: false,
      started_at: new Date(Date.now() - 120 * 60000).toISOString(),
    },
  ]);

  const [activePlayerSession, setActivePlayerSession] = useState(null);

  // Load user session on mount
  useEffect(() => {
    if (!isConfigured) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadUserData(session.user);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadUserData(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const loadUserData = async (currentUser) => {
    try {
      const { data: accData } = await supabase
        .from('accounts')
        .select('*')
        .eq('owner_user_id', currentUser.id)
        .maybeSingle();

      if (accData) {
        setAccount(accData);

        const { data: projData } = await supabase
          .from('projects')
          .select('*')
          .eq('account_id', accData.id);

        if (projData && projData.length > 0) {
          setProjects(projData);
          setSelectedProjectId(projData[0].id);

          const { data: sessData } = await supabase
            .from('sessions')
            .select('*')
            .eq('account_id', accData.id)
            .order('started_at', { ascending: false });

          if (sessData) {
            setSessions(sessData);
          }
        }
      }
    } catch (err) {
      console.warn('Carregamento de dados do Supabase:', err);
    }
  };

  const handleCreateProject = async (newProj) => {
    const siteKey = 'site_' + Math.random().toString(36).substring(2, 14);
    const createdObj = {
      id: 'proj_' + Date.now(),
      name: newProj.name,
      domain: newProj.domain,
      site_key: siteKey,
      is_active: true,
    };

    if (isConfigured && user) {
      try {
        const { data } = await supabase.from('projects').insert({
          account_id: account.id,
          name: newProj.name,
          domain: newProj.domain,
          site_key: siteKey,
        }).select().single();

        if (data) {
          setProjects((prev) => [...prev, data]);
          setSelectedProjectId(data.id);
          return;
        }
      } catch (err) {
        console.error('Erro ao salvar projeto no Supabase:', err);
      }
    }

    setProjects((prev) => [...prev, createdObj]);
    setSelectedProjectId(createdObj.id);
  };

  const handleDeleteProject = (projId) => {
    setProjects((prev) => prev.filter((p) => p.id !== projId));
  };

  const handleUpgradePlan = (planId) => {
    const quotaMap = { trial: 1000, starter: 10000, pro: 50000, scale: 200000 };
    setAccount((prev) => ({
      ...prev,
      plan: planId,
      monthly_session_quota: quotaMap[planId] || 1000,
    }));
    alert(`Plano atualizado para ${planId.toUpperCase()} com sucesso!`);
  };

  const handleLogout = async () => {
    if (isConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  if (!user) {
    return <Auth onLoginSuccess={(u) => setUser(u)} />;
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const navItems = [
    { id: 'dashboard', label: 'Dashboard / Visão Geral', icon: Home },
    { id: 'sessions', label: 'Gravações & Replays', icon: Video },
    { id: 'projects', label: 'Sites & Snippet Code', icon: Globe },
    { id: 'heatmaps', label: 'Heatmaps de Cliques', icon: Layers },
    { id: 'billing', label: 'Planos & Assinatura', icon: CreditCard },
  ];

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'sessions': return 'Sessões & Replays';
      case 'projects': return 'Sites & Snippet Code';
      case 'heatmaps': return 'Heatmaps de Cliques';
      case 'billing': return 'Planos & Billing';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 bg-mesh-glow flex flex-col md:flex-row text-slate-100 selection:bg-blue-500 selection:text-white overflow-x-hidden">
      
      {/* Organic Background Lines Glow */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-blue-500/10 via-rose-500/5 to-transparent rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-amber-500/5 via-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none z-0" />

      {/* DESKTOP ICON-ONLY LEFT SIDEBAR (HIDDEN ON MOBILE, VISIBLE ON MD+) */}
      <aside className="hidden md:flex w-20 bg-slate-950/90 border-r border-slate-800/80 flex-col items-center justify-between py-6 shrink-0 z-30 relative min-h-screen">
        
        {/* Top Brand Icon */}
        <div className="flex flex-col items-center gap-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 via-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/25 hover:scale-105 transition-transform"
            title="RastreWeb SaaS"
          >
            <ShieldCheck size={24} />
          </button>

          <div className="w-8 h-[1px] bg-slate-800/80" />

          {/* Navigation Icons */}
          <nav className="flex flex-col items-center gap-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <div key={item.id} className="relative group flex items-center">
                  {isActive && (
                    <span className="absolute -left-[18px] w-2 h-6 bg-rose-500 rounded-r-full shadow-[0_0_12px_rgba(244,63,94,0.8)]" />
                  )}

                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon size={20} />
                  </button>

                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-medium text-slate-100 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-2xl z-50">
                    {item.label}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom Icons */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => setActiveTab('projects')}
            className="w-11 h-11 rounded-2xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 flex items-center justify-center transition-colors relative group"
            title="Configurações"
          >
            <Settings size={20} />
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-medium text-slate-100 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-2xl z-50">
              Configurações
            </div>
          </button>

          <button
            onClick={handleLogout}
            className="w-11 h-11 rounded-2xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-colors relative group"
            title="Sair"
          >
            <LogOut size={20} />
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-medium text-slate-100 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-2xl z-50">
              Sair
            </div>
          </button>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION BAR (VISIBLE ONLY ON MOBILE < MD) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 z-50 px-4 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`p-2.5 rounded-xl flex flex-col items-center gap-1 transition-colors ${
                isActive ? 'text-rose-400 bg-rose-500/10 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px]">{item.id.charAt(0).toUpperCase() + item.id.slice(1)}</span>
            </button>
          );
        })}
      </div>

      {/* MAIN CANVAS WRAPPER — FULL SCREEN RESPONSIVE */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative z-10">
        
        {/* TOP HEADER BAR */}
        <header className="min-h-[72px] px-4 sm:px-8 py-3 border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          {/* Page Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex md:hidden items-center justify-center text-white font-bold text-xs">
              <ShieldCheck size={20} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">{getPageTitle()}</h1>
          </div>

          {/* Right Controls */}
          <div className="flex flex-wrap items-center gap-3 ml-auto">
            
            {/* Project Selector Pill */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-full px-3 py-1.5 flex items-center gap-2 text-xs font-medium max-w-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer truncate max-w-[180px] sm:max-w-xs"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-slate-100">
                    {p.name} ({p.domain || 'sem domínio'})
                  </option>
                ))}
              </select>
            </div>

            {/* Notification Bell */}
            <button
              className="w-9 h-9 rounded-full bg-slate-950/80 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-100 transition-colors relative shrink-0"
              title="Notificações"
            >
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            </button>

            {/* User Avatar */}
            <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-full p-1 pr-3 shrink-0">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                {user.user_metadata?.name ? user.user_metadata.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <span className="text-xs font-bold text-slate-200 hidden sm:inline">
                {user.user_metadata?.name || 'Amaral'}
              </span>
            </div>

          </div>

        </header>

        {/* MAIN SCROLLABLE CONTENT AREA (FILLS ENTIRE SCREEN HEIGHT) */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto pb-24 md:pb-8">
          <div className="max-w-[1800px] mx-auto">
            {activeTab === 'dashboard' && (
              <Dashboard
                account={account}
                projects={projects}
                sessions={sessions}
                onNavigate={(tab) => setActiveTab(tab)}
                onCreateProject={handleCreateProject}
              />
            )}

            {activeTab === 'sessions' && (
              <Sessions
                sessions={sessions}
                onPlaySession={(s) => setActivePlayerSession(s)}
              />
            )}

            {activeTab === 'projects' && (
              <Projects
                projects={projects}
                onCreateProject={handleCreateProject}
                onDeleteProject={handleDeleteProject}
              />
            )}

            {activeTab === 'heatmaps' && <Heatmaps projects={projects} />}

            {activeTab === 'billing' && (
              <Billing account={account} onUpgradePlan={handleUpgradePlan} />
            )}
          </div>
        </main>

      </div>

      {/* SESSION REPLAY PLAYER MODAL */}
      {activePlayerSession && (
        <SessionPlayerModal
          session={activePlayerSession}
          onClose={() => setActivePlayerSession(null)}
        />
      )}

    </div>
  );
}
