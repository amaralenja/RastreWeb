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
  LayoutGrid,
  Video,
  Globe,
  Layers,
  CreditCard,
  LogOut,
  Settings,
  Bell,
  Home,
  ShieldCheck,
  ChevronDown,
  Plus,
  User,
  Search,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
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
    <div className="min-h-screen bg-slate-950 bg-mesh-glow flex items-center justify-center p-3 sm:p-6 text-slate-100 selection:bg-blue-500 selection:text-white">
      
      {/* Floating Outer Container matching the reference image layout */}
      <div className="w-full max-w-[1550px] min-h-[920px] bg-slate-900/90 backdrop-blur-2xl border border-slate-800/80 rounded-[32px] shadow-2xl flex overflow-hidden relative">
        
        {/* Organic Background Lines Effect */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-blue-500/10 via-rose-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-amber-500/5 via-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* LEFT VERTICAL SIDEBAR — ICON ONLY (EXACT DESIGN MATCH FROM IMAGE) */}
        <aside className="w-20 bg-slate-950/80 border-r border-slate-800/80 flex flex-col items-center justify-between py-6 shrink-0 relative z-20">
          
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

            {/* Icon-Only Navigation Buttons */}
            <nav className="flex flex-col items-center gap-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <div key={item.id} className="relative group flex items-center">
                    {/* Active Indicator Dot on left border (exactly as seen in reference image) */}
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

                    {/* Tooltip on hover */}
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-medium text-slate-100 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-2xl z-50">
                      {item.label}
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Bottom Settings & Logout Icons */}
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
              title="Sair da Conta"
            >
              <LogOut size={20} />
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-medium text-slate-100 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-2xl z-50">
                Sair
              </div>
            </button>
          </div>

        </aside>

        {/* MAIN CANVAS BODY */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-900/40 relative z-10">
          
          {/* TOP HEADER BAR — MATCHING REFERENCE IMAGE HEADER */}
          <header className="h-20 px-8 flex items-center justify-between border-b border-slate-800/60 shrink-0">
            
            {/* Left Page Title */}
            <div>
              <h1 className="text-2xl font-bold text-slate-100 tracking-tight">{getPageTitle()}</h1>
            </div>

            {/* Right Header Controls */}
            <div className="flex items-center gap-5">
              
              {/* Project Selector Pill (Cards & Balance style pill badge) */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-full px-4 py-1.5 flex items-center gap-3 text-xs font-medium shadow-inner">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer pr-1"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-slate-100">
                      {p.name} ({p.domain || 'sem domínio'})
                    </option>
                  ))}
                </select>
                <span className="text-slate-500 font-mono text-[11px] border-l border-slate-800 pl-2">
                  KEY: {selectedProject?.site_key?.substring(0, 10)}...
                </span>
              </div>

              {/* Notification Bell Button */}
              <button
                className="w-10 h-10 rounded-full bg-slate-950/80 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-100 hover:border-slate-700 transition-colors relative"
                title="Notificações"
              >
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
              </button>

              {/* User Avatar & Info Badge */}
              <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800/80 rounded-full p-1.5 pr-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-md">
                  {user.user_metadata?.name ? user.user_metadata.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-200 leading-tight">
                    {user.user_metadata?.name || 'Amaral Shakir'}
                  </p>
                  <p className="text-[10px] text-blue-400 font-medium capitalize leading-tight">
                    Plano {account?.plan || 'starter'}
                  </p>
                </div>
              </div>

            </div>

          </header>

          {/* MAIN TAB CONTENT */}
          <main className="flex-1 p-8 overflow-y-auto">
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
          </main>

        </div>

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
